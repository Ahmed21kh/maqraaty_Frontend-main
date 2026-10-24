import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ApiService } from '../../../core/services/api.service';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { StudentAvatarComponent } from '../student-avatar/student-avatar.component';

interface Relative {
  _id: string;
  name: string;
}

/** Phones are stored as arrays of strings; empty entries are ignored. */
const phones = (v: unknown): string[] => (Array.isArray(v) ? v : v ? [String(v)] : []).map((p) => String(p).trim()).filter(Boolean);
const text = (v: unknown): string => (v === null || v === undefined ? '' : String(v).trim());

/**
 * Read-only student profile used inside the "بيانات الطالب" dialogs: a header with the photo, name and key facts,
 * grouped info cards (contact, registration, fees) and the relatives as links to their own accounts.
 * Relative names are looked up on demand, so no full students list is needed.
 */
@Component({
  selector: 'app-student-details',
  standalone: true,
  imports: [DatePipe, NzIconModule, StatusBadgeComponent, StudentAvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block', dir: 'rtl' },
  styles: [
    `
      .hero {
        display: flex;
        align-items: center;
        gap: 18px;
        padding: 18px;
        border: 1px solid var(--app-border);
        border-radius: var(--app-radius);
        background: linear-gradient(135deg, color-mix(in srgb, var(--app-primary) 14%, transparent), color-mix(in srgb, var(--app-secondary) 10%, transparent));
      }
      .avatar-ring {
        padding: 3px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--app-primary), var(--app-secondary));
      }
      .facts {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 10px;
      }
      .fact {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 3px 10px;
        font-size: 12.5px;
        color: var(--app-text-muted);
        background: var(--app-surface-2);
        border-radius: 999px;
      }
      .fact b {
        color: var(--app-text);
        font-weight: 600;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        margin-top: 14px;
      }
      .card {
        padding: 14px 16px;
        border: 1px solid var(--app-border);
        border-radius: var(--app-radius);
        background: var(--app-surface);
      }
      .card.wide {
        grid-column: 1 / -1;
      }
      .card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
        font-size: 13px;
        font-weight: 600;
        color: var(--app-text-muted);
      }
      .card-title .ico {
        display: inline-flex;
        width: 26px;
        height: 26px;
        align-items: center;
        justify-content: center;
        color: var(--app-primary);
        background: var(--app-primary-soft);
        border-radius: 8px;
      }
      .row {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 12px;
        padding: 6px 0;
      }
      .row + .row {
        border-top: 1px dashed var(--app-border);
      }
      .label {
        font-size: 12.5px;
        color: var(--app-text-muted);
      }
      .value {
        font-weight: 600;
        color: var(--app-text);
        text-align: end;
        overflow-wrap: anywhere;
      }
      .value.empty {
        color: var(--app-text-muted);
        font-weight: 400;
      }
      a.phone {
        color: inherit;
        text-decoration: none;
        direction: ltr;
        unicode-bidi: plaintext;
      }
      a.phone:hover {
        color: var(--app-primary);
      }
      .relatives {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .relative {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 5px 12px 5px 8px;
        font: inherit;
        color: var(--app-text);
        cursor: pointer;
        background: var(--app-surface-2);
        border: 1px solid var(--app-border);
        border-radius: 999px;
        transition: border-color 0.15s, background 0.15s, transform 0.15s;
      }
      .relative:hover {
        border-color: var(--app-primary);
        background: var(--app-primary-soft);
        transform: translateY(-1px);
      }
      .relative .go {
        font-size: 11px;
        color: var(--app-text-muted);
      }
      .relative:hover .go {
        color: var(--app-primary);
      }
      @media (max-width: 560px) {
        .hero {
          flex-direction: column;
          text-align: center;
        }
        .facts {
          justify-content: center;
        }
        .grid {
          grid-template-columns: minmax(0, 1fr);
        }
      }
    `,
  ],
  template: `
    @if (student(); as s) {
      <section class="hero">
        <div class="avatar-ring"><app-student-avatar [name]="name()" [image]="s.image" [size]="92" /></div>
        <div class="min-w-0 flex-1">
          <h2 class="m-0 text-xl font-bold leading-snug" style="color: var(--app-text)">{{ name() || '--' }}</h2>
          <div class="facts">
            @if (s.code) {
              <span class="fact"><span nz-icon nzType="number"></span>الكود <b>{{ s.code }}</b></span>
            }
            @if (age()) {
              <span class="fact"><span nz-icon nzType="calendar"></span>السن <b>{{ age() }}</b></span>
            }
            @if (studyYear()) {
              <span class="fact"><span nz-icon nzType="book"></span><b>{{ studyYear() }}</b></span>
            }
            @if (s.active_status) {
              <app-status-badge [tone]="s.active_status === 'active' ? 'success' : 'danger'">{{ s.active_status === 'active' ? 'نشط' : 'غير نشط' }}</app-status-badge>
            }
          </div>
        </div>
      </section>

      <div class="grid">
        <section class="card">
          <div class="card-title"><span class="ico"><span nz-icon nzType="phone"></span></span>بيانات التواصل</div>
          @for (row of contacts(); track row.label) {
            <div class="row">
              <span class="label">{{ row.label }}</span>
              @if (row.values.length) {
                <span class="value">
                  @for (p of row.values; track p; let last = $last) {
                    <a class="phone" [href]="'tel:' + p">{{ p }}</a>@if (!last) {<span> ، </span>}
                  }
                </span>
              } @else {
                <span class="value empty">--</span>
              }
            </div>
          }
        </section>

        <section class="card">
          <div class="card-title"><span class="ico"><span nz-icon nzType="solution"></span></span>التسجيل والمصروفات</div>
          <div class="row">
            <span class="label">تاريخ التسجيل بالمقرأة</span>
            <span class="value">{{ s.date ? (s.date | date: 'dd-MM-yyyy') : '--' }}</span>
          </div>
          <div class="row">
            <span class="label">معفى من المصروفات</span>
            <span class="value"><app-status-badge [tone]="exempt() ? 'warning' : 'neutral'" [dot]="false">{{ exempt() ? 'نعم' : 'لا' }}</app-status-badge></span>
          </div>
          @if (!exempt()) {
            <div class="row">
              <span class="label">المصروفات</span>
              <span class="value">{{ s.amount ?? '--' }} @if (s.amount !== null && s.amount !== undefined && s.amount !== '') {<span class="label">ج</span>}</span>
            </div>
          }
          <div class="row">
            <span class="label">طالب ازهري</span>
            <span class="value">{{ text(s.is_Azhar) || '--' }}</span>
          </div>
        </section>

        <section class="card wide">
          <div class="card-title"><span class="ico"><span nz-icon nzType="team"></span></span>الاقارب</div>
          @if (relativeIds().length) {
            <div class="relatives">
              @for (r of relatives(); track r._id) {
                <button type="button" class="relative" (click)="open(r._id)" [attr.aria-label]="'فتح حساب ' + r.name">
                  <app-student-avatar [name]="r.name" [size]="26" />
                  <span>{{ r.name }}</span>
                  <span class="go" nz-icon nzType="arrow-left"></span>
                </button>
              }
            </div>
          } @else {
            <span class="value empty">لا يوجد اقارب</span>
          }
        </section>

        <section class="card">
          <div class="card-title"><span class="ico"><span nz-icon nzType="environment"></span></span>العنوان</div>
          <span class="value" [class.empty]="!text(s.address)">{{ text(s.address) || '--' }}</span>
        </section>

        <section class="card">
          <div class="card-title"><span class="ico"><span nz-icon nzType="file-text"></span></span>الملاحظات</div>
          <span class="value" [class.empty]="!text(s.notes)">{{ text(s.notes) || '--' }}</span>
        </section>
      </div>
    }
  `,
})
export class StudentDetailsComponent {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly student = input<any | null>(null);
  /** Emitted before navigating to a relative, so the host dialog can close itself. */
  readonly navigated = output<void>();

  protected readonly text = text;
  protected readonly name = computed(() => text(this.student()?.name));
  protected readonly age = computed(() => text(this.student()?.age));
  protected readonly studyYear = computed(() => text(this.student()?.study_year));
  /** `is_payment === 'نعم'` means the student is exempt from the monthly fee. */
  protected readonly exempt = computed(() => this.student()?.is_payment === 'نعم');

  protected readonly contacts = computed(() => {
    const s = this.student() ?? {};
    return [
      { label: 'موبايل الطالب', values: phones(s.phone_1) },
      { label: 'موبايل الام', values: phones(s.phone_2) },
      { label: 'موبايل الاب', values: phones(s.phone_3) },
      { label: 'التليفون الارضي', values: phones(s.landline) },
    ];
  });

  /** Relatives arrive as ids, or as populated objects; both are handled. */
  protected readonly relativeIds = computed<string[]>(() => {
    const list = this.student()?.relative;
    if (this.student()?.has_relative === 'لا' || !Array.isArray(list)) return [];
    return list.map((r: any) => (typeof r === 'string' ? r : r?._id)).filter(Boolean);
  });

  protected readonly relatives = signal<Relative[]>([]);

  constructor() {
    effect(
      () => {
        const ids = this.relativeIds();
        if (!ids.length) {
          this.relatives.set([]);
          return;
        }
        // show the ids' names as soon as they arrive; until then the chips would flash empty
        this.api
          .getStudentOptions({ ids })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (res) => {
              const byId = new Map(res.data.map((d) => [d._id, d.name?.trim() || '--']));
              this.relatives.set(ids.map((id) => ({ _id: id, name: byId.get(id) ?? '--' })));
            },
            error: () => this.relatives.set(ids.map((id) => ({ _id: id, name: '--' }))),
          });
      },
      { allowSignalWrites: true }
    );
  }

  protected open(id: string): void {
    this.navigated.emit();
    void this.router.navigate(['/student-account', id]);
  }
}
