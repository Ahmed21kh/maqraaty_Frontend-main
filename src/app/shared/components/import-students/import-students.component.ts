import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { catchError, forkJoin, lastValueFrom, of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ImportCheck, ImportResult, TableExportService } from '../../../core/services/table-export.service';

type Step = 'pick' | 'checked' | 'done';

/**
 * "استيراد" button: add many students from an Excel sheet.
 * 1. download the template (or use any sheet with the same headers),
 * 2. pick the file: the server checks it and shows how many rows are valid and why the others are not,
 * 3. confirm: valid rows are added and each new student gets this month's attendance days, as when adding one by hand.
 */
@Component({
  selector: 'app-import-students',
  standalone: true,
  imports: [NzButtonModule, NzIconModule, NzModalModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-block' },
  styles: [
    `
      .import-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        direction: rtl; /* icon on the right, like the rest of the UI */
        line-height: 1;
        border-radius: 12px;
      }
      .import-btn .anticon {
        display: inline-flex;
        align-items: center;
        line-height: 0;
      }
      .drop {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        padding: 26px 16px;
        text-align: center;
        cursor: pointer;
        border: 2px dashed var(--app-border);
        border-radius: var(--app-radius);
        background: var(--app-surface-2);
        transition: border-color 0.15s, background 0.15s;
      }
      .drop:hover,
      .drop.on {
        border-color: var(--app-primary);
        background: var(--app-primary-soft);
      }
      .stat {
        flex: 1;
        padding: 10px 12px;
        text-align: center;
        border-radius: var(--app-radius-sm);
        background: var(--app-surface-2);
      }
      .stat b {
        display: block;
        font-size: 22px;
      }
      table.preview {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }
      table.preview th,
      table.preview td {
        padding: 6px 8px;
        text-align: right;
        border-bottom: 1px solid var(--app-border);
      }
      table.preview th {
        color: var(--app-text-muted);
        font-weight: 600;
      }
      .problems {
        max-height: 150px;
        padding: 0;
        margin: 6px 0 0;
        overflow-y: auto;
        font-size: 13px;
        list-style: none;
      }
      .problems li {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        padding: 4px 0;
        border-bottom: 1px dashed var(--app-border);
      }
    `,
  ],
  template: `
    <button nz-button nzSize="large" type="button" class="import-btn" (click)="show()">
      <span nz-icon nzType="upload" nzTheme="outline"></span>
      استيراد
    </button>

    <nz-modal
      [nzVisible]="open()"
      nzTitle="استيراد الطلاب من ملف Excel"
      nzWidth="620px"
      [nzFooter]="footer"
      [nzMaskClosable]="!busy()"
      (nzOnCancel)="close()"
    >
      <ng-container *nzModalContent>
        <div dir="rtl" class="flex flex-col gap-4">
          @if (step() === 'pick') {
            <p class="m-0 text-sm" style="color: var(--app-text-muted)">
              ارفع ملف Excel (xlsx) يحتوي على بيانات الطلاب. الاسم مطلوب، والموبايل 11 رقم، ومن يوجد بنفس الاسم ورقم الطالب يتم تخطيه.
            </p>
            <button nz-button nzType="primary" type="button" class="import-btn self-start" (click)="template()">
              <span nz-icon nzType="download" nzTheme="outline"></span>تحميل نموذج جاهز
            </button>
            <label class="drop" [class.on]="dragging()" (dragover)="drag($event, true)" (dragleave)="drag($event, false)" (drop)="drop($event)">
              <span nz-icon nzType="file-excel" nzTheme="outline" class="text-3xl" style="color: var(--app-success)"></span>
              <b>{{ busy() ? 'جاري فحص الملف...' : 'اضغط لاختيار الملف او اسحبه هنا' }}</b>
              <span class="text-xs" style="color: var(--app-text-muted)">xlsx — حتى 5 ميجا و 2000 طالب</span>
              <input type="file" class="hidden" accept=".xlsx" [disabled]="busy()" (change)="picked($event)" />
            </label>
          }

          @if (step() === 'checked' && check(); as c) {
            <div class="flex gap-3">
              <div class="stat">اجمالي الصفوف<b>{{ c.total }}</b></div>
              <div class="stat" style="color: var(--app-success)">صالحة للاستيراد<b>{{ c.valid }}</b></div>
              <div class="stat" style="color: var(--app-danger)">سيتم تخطيها<b>{{ c.invalid.length }}</b></div>
            </div>
            @if (c.preview.length) {
              <table class="preview">
                <thead><tr><th>الصف</th><th>الاسم</th><th>الموبايل</th><th>السن</th><th>المصروفات</th></tr></thead>
                <tbody>
                  @for (p of c.preview; track p.row) {
                    <tr><td>{{ p.row }}</td><td>{{ p.name }}</td><td>{{ p.phone_1 || '--' }}</td><td>{{ p.age || '--' }}</td><td>{{ p.amount || '--' }}</td></tr>
                  }
                </tbody>
              </table>
              @if (c.valid > c.preview.length) {
                <span class="text-xs" style="color: var(--app-text-muted)">... و {{ c.valid - c.preview.length }} طالب اخرين</span>
              }
            }
            @if (c.invalid.length) {
              <div>
                <b class="text-sm">الصفوف التي سيتم تخطيها</b>
                <ul class="problems">
                  @for (i of c.invalid; track i.row) {
                    <li><span>صف {{ i.row }} — {{ i.name || 'بدون اسم' }}</span><span style="color: var(--app-danger)">{{ i.reason }}</span></li>
                  }
                </ul>
              </div>
            }
          }

          @if (step() === 'done' && result(); as r) {
            <div class="flex gap-3">
              <div class="stat" style="color: var(--app-success)">تمت اضافتهم<b>{{ r.created.length }}</b></div>
              <div class="stat" style="color: var(--app-danger)">تم تخطيهم<b>{{ r.skipped.length }}</b></div>
            </div>
            <p class="m-0 text-sm">تمت الاضافة بنجاح وتم تجهيز كشف الحضور للطلاب الجدد.</p>
          }
        </div>
      </ng-container>
    </nz-modal>

    <ng-template #footer>
      <div class="flex items-center gap-2" style="direction: ltr">
        @if (step() === 'checked') {
          <button nz-button type="button" nzType="primary" [nzLoading]="busy()" [disabled]="!check()?.valid" (click)="confirm()">
            استيراد {{ check()?.valid }} طالب
          </button>
          <button nz-button type="button" [disabled]="busy()" (click)="reset()">اختيار ملف اخر</button>
        }
        <button nz-button type="button" [disabled]="busy()" (click)="close()">{{ step() === 'done' ? 'اغلاق' : 'الغاء' }}</button>
      </div>
    </ng-template>
  `,
})
export class ImportStudentsComponent {
  private readonly exporter = inject(TableExportService);
  private readonly api = inject(ApiService);
  private readonly message = inject(NzMessageService);

  /** Emitted after students were added so the page can reload its table. */
  readonly imported = output<number>();

  protected readonly open = signal(false);
  protected readonly step = signal<Step>('pick');
  protected readonly busy = signal(false);
  protected readonly dragging = signal(false);
  protected readonly check = signal<ImportCheck | null>(null);
  protected readonly result = signal<ImportResult | null>(null);
  private file: File | null = null;

  protected show(): void {
    this.reset();
    this.open.set(true);
  }

  protected close(): void {
    if (this.busy()) return;
    const added = this.result()?.created.length ?? 0;
    this.open.set(false);
    if (added) this.imported.emit(added);
  }

  protected reset(): void {
    this.step.set('pick');
    this.check.set(null);
    this.result.set(null);
    this.file = null;
  }

  protected async template(): Promise<void> {
    try {
      await this.exporter.downloadStudentsTemplate();
    } catch {
      this.message.error('تعذر تحميل النموذج — تأكد من تشغيل السيرفر');
    }
  }

  protected drag(e: DragEvent, on: boolean): void {
    e.preventDefault();
    this.dragging.set(on);
  }

  protected drop(e: DragEvent): void {
    e.preventDefault();
    this.dragging.set(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) void this.inspect(file);
  }

  protected picked(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // allow choosing the same file again
    if (file) void this.inspect(file);
  }

  private async inspect(file: File): Promise<void> {
    if (!/\.xlsx$/i.test(file.name)) {
      this.message.warning('اختر ملف Excel بصيغة xlsx');
      return;
    }
    this.busy.set(true);
    try {
      this.check.set(await this.exporter.checkStudentsFile(file));
      this.file = file;
      this.step.set('checked');
    } catch (e: any) {
      this.message.error(e?.error?.message || 'تعذر فحص الملف');
    } finally {
      this.busy.set(false);
    }
  }

  protected async confirm(): Promise<void> {
    if (!this.file) return;
    this.busy.set(true);
    try {
      const result = await this.exporter.importStudentsFile(this.file);
      await this.seedAttendance(result.created.map((s) => s._id));
      this.result.set(result);
      this.step.set('done');
      this.message.success(`تمت اضافة ${result.created.length} طالب`);
    } catch (e: any) {
      this.message.error(e?.error?.message || 'تعذر استيراد الملف');
    } finally {
      this.busy.set(false);
    }
  }

  /** Same call the add-student page makes, a few at a time. */
  private async seedAttendance(ids: string[]): Promise<void> {
    const body = () => ({ date: new Date().toUTCString(), status: '_', attend_days_month: this.api.getDatesAndDays() });
    for (let i = 0; i < ids.length; i += 5) {
      await lastValueFrom(forkJoin(ids.slice(i, i + 5).map((id) => this.api.addAttendance(body(), id).pipe(catchError(() => of(null))))));
    }
  }
}
