import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { simpleWhatsapp } from '@ng-icons/simple-icons';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { WhatsappSocketService } from '../../core/whatsapp/whatsapp-socket.service';
import { LayoutStateService } from '../layout-state.service';
import { WhatsappDialogComponent } from './whatsapp-dialog.component';

/** Header button: WhatsApp logo + live connection dot; opens the login dialog. */
@Component({
  selector: 'app-whatsapp-button',
  standalone: true,
  imports: [NgIconComponent, NzIconModule, NzModalModule, NzPopoverModule, NzToolTipModule],
  providers: [provideIcons({ simpleWhatsapp })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-app border border-app-border bg-app-surface shadow-app transition-shadow hover:shadow-app-hover"
      (click)="open()"
      nz-tooltip
      nzTooltipTitle="تسجيل الدخول للواتس"
      nz-popover
      [nzPopoverContent]="hint"
      nzPopoverPlacement="bottom"
      [nzPopoverTrigger]="null"
      [nzPopoverVisible]="layout.whatsappHint() && !layout.isHome() && !layout.isMobile()"
      [attr.aria-label]="wa.isReady() ? 'الواتس متصل' : 'الواتس غير متصل — اضغط لتسجيل الدخول'"
    >
      <ng-icon name="simpleWhatsapp" size="22" color="#25D366" />
      <!-- Live status dot: green = connected, amber = connecting, red = disconnected (each pulses) -->
      <span class="absolute -end-1 -top-1 flex h-3 w-3" role="status" [attr.aria-label]="statusLabel()">
        <span
          class="status-dot ring-2 ring-white dark:ring-gray-900"
          [class.is-offline]="!wa.isReady() && !wa.loading()"
          [class.is-connecting]="wa.loading() && !wa.isReady()"
          [class]="dotColor()"
        ></span>
      </span>
    </button>
    <ng-template #hint>
      <div class="flex items-center gap-3">
        <span>برجاء التأكد من تسجيل الدخول قبل البدء في النظام !</span>
        <button
          type="button"
          class="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-xs text-app-muted transition-colors hover:bg-app-primary-soft hover:text-app-text"
          aria-label="اغلاق التنبيه"
          (click)="dismissHint()"
        >
          <span nz-icon nzType="close" nzTheme="outline"></span>
        </button>
      </div>
    </ng-template>
  `,
})
export class WhatsappButtonComponent {
  protected dotColor(): string {
    if (this.wa.isReady()) return 'bg-green-500';
    return this.wa.loading() ? 'bg-amber-400' : 'bg-red-500';
  }

  protected statusLabel(): string {
    if (this.wa.isReady()) return 'الواتس متصل';
    return this.wa.loading() ? 'جاري الاتصال بالواتس' : 'الواتس غير متصل';
  }

  protected readonly wa = inject(WhatsappSocketService);
  protected readonly layout = inject(LayoutStateService);
  private readonly modal = inject(NzModalService);

  protected dismissHint(): void {
    this.layout.whatsappHint.set(false);
  }

  protected open(): void {
    this.modal.create({
      nzContent: WhatsappDialogComponent,
      nzFooter: null,
      nzWidth: '500px',
      nzTitle: 'تسجيل الدخول للواتس',
      nzDirection: 'rtl',
    });
    this.layout.whatsappHint.set(false);
  }
}
