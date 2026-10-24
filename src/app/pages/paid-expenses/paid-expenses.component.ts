import { ExportMenuComponent } from '../../shared/components/export-menu/export-menu.component';
import { ExportOptions } from '../../core/services/table-export.service';
import { PAYMENT_EXPORT_COLUMNS } from '../../core/export/export-columns';
import { lastValueFrom } from 'rxjs';
import { DecimalPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, ElementRef, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { catchError, EMPTY, Subject, switchMap, tap } from 'rxjs';
import { PaidExpense, PaidExpensesSummary } from '../../core/models/paid-expenses.model';
import { ApiService } from '../../core/services/api.service';
import { buildQuery } from '../../core/utils/query.util';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { SectionCardComponent } from '../../shared/components/section-card/section-card.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { StudentAvatarComponent } from '../../shared/components/student-avatar/student-avatar.component';
import { PhonesPipe } from '../../shared/pipes/phones.pipe';

const MONTH_NAMES = ['يناير', 'فبراير', 'مارس', 'ابريل', 'مايو', 'يونيو', 'يوليو', 'اغسطس', 'سبتمبر', 'اكتوبر', 'نوفمبر', 'ديسمبر'];
const EMPTY_SUMMARY: PaidExpensesSummary = { totalAmount: 0, paymentsCount: 0, studentsCount: 0, averagePayment: 0 };
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const pad = (n: number) => String(n).padStart(2, '0');
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/**
 * الاشتراكات المدفوعة — every payment recorded for a student, with totals for the filtered period.
 * Period = a month of a year (default: current month), the whole year, or a custom date range
 * (also accepted as `?from=YYYY-MM-DD&to=YYYY-MM-DD`, which is how the "not paid" page links here).
 */
@Component({
  selector: 'app-paid-expenses',
  standalone: true,
  imports: [
    ExportMenuComponent,
    DatePipe,
    DecimalPipe,
    FormsModule,
    RouterLink,
    NzButtonModule,
    NzDatePickerModule,
    NzPaginationModule,
    NzSelectModule,
    NzTableModule,
    EmptyStateComponent,
    PageHeaderComponent,
    PhonesPipe,
    SearchBarComponent,
    SectionCardComponent,
    StatCardComponent,
    StatusBadgeComponent,
    StudentAvatarComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './paid-expenses.component.html',
  styleUrl: './paid-expenses.component.scss',
})
export class PaidExpensesComponent {
  /** Exports every payment of the current period / search (not just the visible page): pages of 200 until done. */
  readonly exportSource = async (): Promise<ExportOptions> => {
    const rows: PaidExpense[] = [];
    let page = 1;
    for (;;) {
      const res = await lastValueFrom(this.api.getPaidExpenses(page, 200, this.queryString()));
      rows.push(...res.data);
      if (page >= res.metaData.totalPages || !res.data.length) break;
      page++;
    }
    return {
      title: 'الاشتراكات المدفوعة',
      subtitle: `${this.periodLabel()} — الاجمالي ${rows.reduce((t, r) => t + (r.amount || 0), 0)} ج`,
      fileName: `الاشتراكات المدفوعة ${this.periodLabel()}`,
      columns: PAYMENT_EXPORT_COLUMNS,
      rows,
    };
  };

  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly message = inject(NzMessageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly now = new Date();
  readonly pageSize = 20;

  // ---- filters
  readonly year = signal(this.now.getFullYear());
  /** 1–12, or null for the whole year. */
  readonly month = signal<number | null>(this.now.getMonth() + 1);
  readonly customRange = signal<{ from: string; to: string } | null>(null);
  readonly search = signal('');
  readonly pageIndex = signal(1);

  // ---- results
  readonly rows = signal<PaidExpense[]>([]);
  readonly summary = signal<PaidExpensesSummary>(EMPTY_SUMMARY);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly failed = signal(false);
  readonly monthly = signal<{ month: number; total: number; count: number }[]>([]);

  readonly years = computed(() => Array.from({ length: 6 }, (_, i) => this.now.getFullYear() - i));

  /** The calendar days being queried. */
  readonly period = computed(() => {
    const custom = this.customRange();
    if (custom) return custom;
    const y = this.year();
    const m = this.month();
    if (m === null) return { from: `${y}-01-01`, to: `${y}-12-31` };
    return { from: `${y}-${pad(m)}-01`, to: `${y}-${pad(m)}-${pad(new Date(y, m, 0).getDate())}` };
  });

  readonly periodLabel = computed(() => {
    if (this.customRange()) return `${this.period().from}  →  ${this.period().to}`;
    const m = this.month();
    return m === null ? `سنة ${this.year()}` : `${MONTH_NAMES[m - 1]} ${this.year()}`;
  });

  /** Month chips: name, collected total, and a bar relative to the best month of the year. */
  readonly monthChips = computed(() => {
    const data = this.monthly();
    const max = Math.max(1, ...data.map((m) => m.total));
    return MONTH_NAMES.map((name, i) => {
      const entry = data.find((m) => m.month === i + 1);
      return { month: i + 1, name, total: entry?.total ?? 0, percent: Math.round(((entry?.total ?? 0) / max) * 100) };
    });
  });

  /** Collected in the whole selected year (sum of the month chips). */
  readonly yearTotal = computed(() => this.monthly().reduce((sum, m) => sum + m.total, 0));

  /** Value bound to the range picker. */
  protected readonly rangeModel = computed<Date[] | null>(() => {
    const c = this.customRange();
    return c ? [new Date(`${c.from}T00:00:00`), new Date(`${c.to}T00:00:00`)] : null;
  });

  private readonly reload$ = new Subject<void>();

  constructor() {
    this.applyQueryParams();

    // list: latest request wins, a stale response can never overwrite a newer one
    this.reload$
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.failed.set(false);
        }),
        switchMap(() =>
          this.api.getPaidExpenses(this.pageIndex(), this.pageSize, this.queryString()).pipe(
            catchError((err) => {
              this.loading.set(false);
              this.failed.set(true);
              this.message.error(err?.error?.message || err?.message || 'تعذر تحميل الاشتراكات المدفوعة');
              return EMPTY;
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((res) => {
        this.rows.set(res.data);
        this.summary.set(res.summary);
        this.total.set(res.metaData.total);
        this.loading.set(false);
      });

    // any filter change → back to page 1 and reload
    effect(
      () => {
        this.period();
        this.search();
        untracked(() => {
          this.pageIndex.set(1);
          this.reload$.next();
        });
      },
      { allowSignalWrites: true }
    );

    // keep the selected month chip visible inside the horizontally scrolling strip
    effect(() => {
      this.month();
      this.customRange();
      this.monthly(); // chips re-render when the totals arrive
      untracked(() =>
        requestAnimationFrame(() =>
          this.host.nativeElement.querySelector('.chip.is-active')?.scrollIntoView({ inline: 'center', block: 'nearest' })
        )
      );
    });

    // monthly totals follow the selected year
    effect(() => {
      const y = this.year();
      untracked(() =>
        this.api
          .getPaidExpensesMonthly(y)
          .pipe(
            catchError(() => EMPTY),
            takeUntilDestroyed(this.destroyRef)
          )
          .subscribe((res) => this.monthly.set(res.months))
      );
    });
  }

  // ------------------------------------------------------------------ actions

  protected selectMonth(month: number | null): void {
    this.customRange.set(null);
    this.month.set(month);
  }

  /** The year picker works with dates; the page keeps the year as a number. */
  protected readonly yearDate = computed(() => new Date(this.year(), 0, 1));
  /** Same range the old list offered: the current year and the five before it. */
  protected readonly disabledYear = (d: Date): boolean => {
    const y = d.getFullYear();
    const now = this.now.getFullYear();
    return y > now || y < now - 5;
  };
  protected onYearPicked(date: Date | null): void {
    if (date) this.selectYear(date.getFullYear());
  }

  protected selectYear(year: number): void {
    this.year.set(year);
  }

  protected onRange(dates: Date[] | null): void {
    if (dates?.length === 2 && dates[0] && dates[1]) {
      this.customRange.set({ from: iso(dates[0]), to: iso(dates[1]) });
    } else {
      this.customRange.set(null); // cleared → back to the month chips
    }
  }

  protected onSearch(text: string): void {
    this.search.set(text.trim());
  }

  protected onPage(page: number): void {
    this.pageIndex.set(page);
    this.reload$.next();
  }

  protected retry(): void {
    this.reload$.next();
  }

  // ------------------------------------------------------------------ helpers

  /** "123" → code, long digit strings → phone, anything else → name. */
  private searchParams(): { name?: string; code?: string; phone?: string } {
    const text = this.search();
    if (!text) return {};
    if (/^\d+$/.test(text)) return text.length >= 7 ? { phone: text } : { code: text };
    return { name: text };
  }

  private queryString(): string {
    const { from, to } = this.period();
    return buildQuery({ from, to, ...this.searchParams() });
  }

  /** Accepts `?from=&to=` (e.g. from the "not paid" page) and selects the matching month when it is a whole month. */
  private applyQueryParams(): void {
    const { from, to } = this.route.snapshot.queryParams;
    if (!DAY.test(from ?? '') || !DAY.test(to ?? '')) return;
    const start = new Date(`${from}T00:00:00`);
    const end = new Date(`${to}T00:00:00`);
    const wholeMonth =
      start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth() &&
      start.getDate() === 1 &&
      end.getDate() === new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
    if (wholeMonth) {
      this.year.set(start.getFullYear());
      this.month.set(start.getMonth() + 1);
    } else {
      this.customRange.set({ from, to });
      this.year.set(start.getFullYear());
    }
  }

  /** All phone numbers on file for the payment's student (parents' numbers are usually the ones filled in). */
  protected phonesOf(row: PaidExpense): string[] {
    const s = row.studentDetails;
    return [...(s.phone_1 ?? []), ...(s.phone_2 ?? []), ...(s.phone_3 ?? [])];
  }
}
