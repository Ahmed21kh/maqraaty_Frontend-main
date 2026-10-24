import { computed, inject, Injectable, signal } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config/api.config';

export type WhatsappStatus = 'disconnected' | 'connected' | 'authenticated' | 'not_authenticated' | 'logout_error';

/**
 * Bridge to the backend's whatsapp-web.js client (Socket.IO).
 *
 * whatsapp-web.js drives a headless Chrome through Puppeteer, so it has to stay
 * on the Node side — the frontend only renders state and sends commands.
 */
@Injectable({ providedIn: 'root' })
export class WhatsappSocketService {
  private socket?: Socket;
  private connecting?: Promise<void>;
  private bulkTimer?: ReturnType<typeof setTimeout>;

  qrImage = signal<string | null>(null);
  qrValue = signal<string | null>(null);
  status = signal<WhatsappStatus>('disconnected');
  loading = signal(false);
  loadingLogout = signal(false);
  count = signal(0);
  messages = signal<{ from: string; body: string; timestamp: number }[]>([]);
  bulkProgress = signal<{ current: number; total: number } | null>(null);
  bulkResults = signal<{ number: string; ok: boolean; error?: string }[]>([]);
  bulkInProgress = signal(false);
  loadingQr = signal(false);
  connectionError = signal<string | null>(null);
  loadingSendMessage = signal(false);

  /** True once the session can actually send messages. */
  readonly isReady = computed(() => this.status() === 'connected' || this.status() === 'authenticated');

  private readonly messageServ = inject(NzMessageService);
  private readonly socketUrl = inject(SOCKET_URL);

  connect(): Promise<void> {
    // Idempotent: callers (app shell, pages) can all ask for a connection safely.
    if (this.connecting) return this.connecting;

    this.connecting = new Promise((resolve) => {
      const socket = (this.socket = io(this.socketUrl, {
        // WebSocket only: starting on HTTP long-polling and upgrading is what produced the
        // "Session ID unknown" / TRANSPORT_MISMATCH 400s (the upgrade races with a second poll).
        // The backend is local, so there is no proxy that would need the polling fallback.
        transports: ['websocket'],
        // Keep retrying (the backend restarts under nodemon) instead of giving up after a few tries.
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
      }));

      socket.on('connect', () => {
        this.connectionError.set(null);
        resolve();
      });

      socket.on('whatsapp:loading_qr', (value: { loading: boolean }) => {
        this.loadingQr.set(value.loading);
      });

      socket.on('whatsapp:qr', (value: { qrImage: string; qrValue: string }) => {
        this.loadingQr.set(false);
        this.qrImage.set(value.qrImage);
        this.qrValue.set(value.qrValue);
        this.connectionError.set(null);
      });

      socket.on('whatsapp:loading', (e: { loading: boolean; count: number }) => {
        this.loading.set(e.loading);
        this.count.set(e.count);
      });

      socket.on('whatsapp:ready', () => {
        this.status.set('connected');
        this.qrImage.set(null);
        this.qrValue.set(null);
        this.connectionError.set(null);
      });

      socket.on('whatsapp:authenticated', () => {
        this.status.set('authenticated');
        this.qrImage.set(null);
        this.qrValue.set(null);
        this.connectionError.set(null);
      });

      socket.on('whatsapp:auth_failure', (value: { message: string }) => {
        this.status.set('not_authenticated');
        this.connectionError.set(value.message);
      });

      socket.on('whatsapp:disconnected', (value: { reason: string }) => {
        this.status.set('disconnected');
        this.connectionError.set(value.reason);
      });

      socket.on('whatsapp:message', (msg: any) => {
        this.messages.update((list) => [...list, msg]);
      });

      socket.on('whatsapp:bulk_progress', ({ current, total, results }) => {
        this.bulkProgress.set({ current, total });
        this.bulkResults.set(results);
      });

      socket.on('whatsapp:bulk_done', ({ results, error }: { results?: { ok: boolean; error?: string }[]; error?: string }) => {
        this.finishBulk();
        if (results) this.bulkResults.set(results as any);
        if (error) {
          this.messageServ.error(
            error === 'WhatsApp not initialized' ? 'الواتس غير جاهز بعد، برجاء تسجيل الدخول من ايقونة الواتس ثم المحاولة مرة اخرى' : error
          );
          return;
        }
        const sent = (results ?? []).filter((r) => r.ok).length;
        const failed = (results ?? []).length - sent;
        if (failed === 0) this.messageServ.success('تم ارسال الاشعار بنجاح');
        else if (sent === 0) this.messageServ.error(`فشل ارسال الرسالة${results?.[0]?.error ? ': ' + results[0].error : ''}`);
        else this.messageServ.warning(`تم الارسال الى ${sent} وفشل الارسال الى ${failed}`);
      });

      socket.on('whatsapp:timeout', (value: { reason: string }) => {
        this.connectionError.set(value.reason);
      });

      socket.on('connect_error', (err) => {
        this.resetSession(err.message);
        resolve();
      });

      socket.on('disconnect', (reason) => {
        this.resetSession(reason);
      });

      socket.on('whatsapp:logout_loading', (e: { loading: boolean }) => {
        this.loadingLogout.set(e.loading);
      });

      socket.on('whatsapp:logout_error', () => {
        this.status.set('logout_error');
      });
    });

    return this.connecting;
  }

  private resetSession(error: string): void {
    this.finishBulk();
    this.status.set('disconnected');
    this.connectionError.set(error);
    this.qrImage.set(null);
    this.qrValue.set(null);
    this.messages.set([]);
  }

  sendMessage(to: string, message: string) {
    this.socket?.emit('whatsapp:send', { to, message });
  }

  /**
   * Sends `message` to every number in `recipients`. The spinner (`bulkInProgress`) is only switched on
   * once there is really something to wait for, and is always switched off again — on the server's reply,
   * on a dropped connection, or after a safety timeout — so a button can never spin forever.
   */
  sendBulk(recipients: string[], message: string) {
    const list = (recipients ?? []).filter((r) => !!r && !!r.trim());
    if (list.length === 0) {
      this.messageServ.warning('لا يوجد رقم هاتف مسجل لولي الأمر (الأب أو الأم) لارسال الرسالة اليه');
      return;
    }
    if (!this.socket?.connected) {
      this.messageServ.error('تعذر الاتصال بخدمة الواتس، تأكد من تشغيل النظام ثم حاول مرة اخرى');
      return;
    }
    if (!this.isReady()) {
      this.messageServ.warning('الواتس غير متصل، برجاء تسجيل الدخول من ايقونة الواتس اولا');
      return;
    }

    this.bulkInProgress.set(true);
    this.bulkResults.set([]);
    this.bulkProgress.set(null);
    clearTimeout(this.bulkTimer);
    // The server waits 2–5 s between messages; allow for that plus a generous margin.
    this.bulkTimer = setTimeout(() => {
      if (this.bulkInProgress()) {
        this.finishBulk();
        this.messageServ.error('انتهت مهلة الارسال، تأكد من اتصال الواتس ثم حاول مرة اخرى');
      }
    }, list.length * 8000 + 30000);
    this.socket.emit('whatsapp:send_bulk', { recipients: list, message });
  }

  private finishBulk(): void {
    clearTimeout(this.bulkTimer);
    this.bulkInProgress.set(false);
  }

  logout() {
    this.qrImage.set(null);
    this.qrValue.set(null);
    this.status.set('disconnected');
    this.socket?.emit('whatsapp:logout');
  }
}
