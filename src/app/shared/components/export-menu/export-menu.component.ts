import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, input, signal } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ExportFormat, ExportOptions, TableExportService } from '../../../core/services/table-export.service';

/**
 * "تصدير" button for a table: Excel (.xlsx), PDF or Word.
 * `source` is called when a format is picked, so the file always reflects the table's current rows.
 *
 *   <app-export-menu [source]="exportSource" />
 */
@Component({
  selector: 'app-export-menu',
  standalone: true,
  imports: [NzButtonModule, NzIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-block' },
  template: `
    <button
      nz-button
      nzType="primary"
      nzSize="large"
      type="button"
      class="export-btn"
      aria-haspopup="menu"
      [attr.aria-expanded]="open()"
      [nzLoading]="busy()"
      [disabled]="busy()"
      (click)="toggle($event)"
    >
      <span nz-icon nzType="download" nzTheme="outline"></span>
      تصدير
      <span nz-icon nzType="down" nzTheme="outline" class="chevron" [class.up]="open()"></span>
    </button>
    @if (open()) {
      <ul class="panel" role="menu" dir="rtl">
        <li role="menuitem" tabindex="0" (click)="run('xlsx')" (keydown.enter)="run('xlsx')">
          <span nz-icon nzType="file-excel" nzTheme="outline" style="color: var(--app-success)"></span>ملف Excel
        </li>
        <li role="menuitem" tabindex="0" (click)="run('pdf')" (keydown.enter)="run('pdf')">
          <span nz-icon nzType="file-pdf" nzTheme="outline" style="color: var(--app-danger)"></span>ملف PDF
        </li>
        <li role="menuitem" tabindex="0" (click)="run('doc')" (keydown.enter)="run('doc')">
          <span nz-icon nzType="file-word" nzTheme="outline" style="color: var(--app-primary)"></span>ملف Word
        </li>
      </ul>
    }
  `,
  styles: [
    `
      :host {
        position: relative;
        display: inline-block;
      }
      .export-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        direction: rtl; /* icon on the right, like the rest of the UI */
        line-height: 1;
        border-radius: 12px;
      }
      .export-btn .anticon {
        display: inline-flex;
        align-items: center;
        line-height: 0;
      }
      .chevron {
        font-size: 10px;
        transition: transform 0.15s;
      }
      .chevron.up {
        transform: rotate(180deg);
      }
      /* opens right under the button, flush with its left edge, so it never drifts away from it */
      .panel {
        position: absolute;
        top: calc(100% + 6px);
        left: 0;
        z-index: 1000;
        min-width: 100%;
        padding: 6px;
        margin: 0;
        list-style: none;
        background: var(--app-surface);
        border: 1px solid var(--app-border);
        border-radius: var(--app-radius);
        box-shadow: var(--app-shadow-hover, 0 10px 30px rgba(0, 0, 0, 0.3));
        animation: panel-in 0.14s ease both;
      }
      .panel li {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 12px;
        white-space: nowrap;
        cursor: pointer;
        border-radius: 8px;
        color: var(--app-text);
      }
      .panel li:hover,
      .panel li:focus-visible {
        background: var(--app-primary-soft);
        outline: none;
      }
      @keyframes panel-in {
        from {
          opacity: 0;
          transform: translateY(-4px);
        }
      }
    `,
  ],
})
export class ExportMenuComponent {
  private readonly exporter = inject(TableExportService);
  private readonly message = inject(NzMessageService);

  readonly source = input.required<() => ExportOptions | Promise<ExportOptions>>();
  protected readonly busy = signal(false);
  protected readonly open = signal(false);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected toggle(e: Event): void {
    e.stopPropagation();
    this.open.update((v) => !v);
  }

  @HostListener('document:click', ['$event'])
  protected outside(e: Event): void {
    if (this.open() && !this.host.nativeElement.contains(e.target as Node)) this.open.set(false);
  }

  @HostListener('document:keydown.escape')
  protected escape(): void {
    this.open.set(false);
  }

  protected async run(format: ExportFormat): Promise<void> {
    this.open.set(false);
    this.busy.set(true);
    try {
      const opts = await this.source()();
      if (!opts.rows.length) {
        this.message.warning('لا توجد بيانات للتصدير');
        return;
      }
      await this.exporter.export(format, opts);
      this.message.success('تم تحميل الملف');
    } catch (e: any) {
      this.message.error(e?.error?.message || 'تعذر تصدير الملف — تأكد من تشغيل السيرفر');
    } finally {
      this.busy.set(false);
    }
  }
}
