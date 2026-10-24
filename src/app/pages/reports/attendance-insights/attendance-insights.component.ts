import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, input, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { catchError, EMPTY, Subject, switchMap, tap } from 'rxjs';
import { AttendanceScope, AttendanceStats } from '../../../core/models/attendance-stats.model';
import { ApiService } from '../../../core/services/api.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SectionCardComponent } from '../../../shared/components/section-card/section-card.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { BarChartComponent } from '../../../shared/charts/bar-chart.component';
import { ChartSeries, DonutSegment } from '../../../shared/charts/chart.util';
import { DonutChartComponent } from '../../../shared/charts/donut-chart.component';
import { LineChartComponent } from '../../../shared/charts/line-chart.component';

const MONTHS = ['يناير', 'فبراير', 'مارس', 'ابريل', 'مايو', 'يونيو', 'يوليو', 'اغسطس', 'سبتمبر', 'اكتوبر', 'نوفمبر', 'ديسمبر'];
const pct = (v: number | null | undefined) => (v === null || v === undefined ? '—' : `${v}%`);

/**
 * احصائيات الحضور بالمقرأة — charts for the month or year picked on the reports page:
 * attendance per day / month, attendance rate, and the share of students who actually came.
 * Numbers come from `GET /api/attendance-stats` (computed in the database layer, not in the browser).
 */
@Component({
  selector: 'app-attendance-insights',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    NzButtonModule,
    NzSegmentedModule,
    BarChartComponent,
    DonutChartComponent,
    EmptyStateComponent,
    LineChartComponent,
    SectionCardComponent,
    StatCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './attendance-insights.component.html',
})
export class AttendanceInsightsComponent {
  private readonly api = inject(ApiService);
  private readonly message = inject(NzMessageService);
  private readonly destroyRef = inject(DestroyRef);

  /** Selected on the reports page. */
  readonly year = input.required<number>();
  readonly month = input.required<number>();

  protected readonly mode = signal<'month' | 'year'>('month');
  protected readonly scope = signal<AttendanceScope>('all');
  protected readonly stats = signal<AttendanceStats | null>(null);
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);

  protected readonly modeOptions = [
    { label: 'الشهر المحدد', value: 'month' },
    { label: 'السنة كاملة', value: 'year' },
  ];
  protected readonly scopeOptions = [
    { label: 'كل الطلاب', value: 'all' },
    { label: 'النشطين فقط', value: 'active' },
  ];

  protected readonly periodLabel = computed(() =>
    this.mode() === 'month' ? `${MONTHS[this.month() - 1]} ${this.year()}` : `سنة ${this.year()}`
  );

  // ---------------------------------------------------------------- derived chart data

  protected readonly summary = computed(() => this.stats()?.summary ?? null);

  /** Bars: one per class day (month view) or one per month (year view). */
  protected readonly barCategories = computed(() => {
    const s = this.stats();
    if (!s) return [];
    return s.daily ? s.daily.map((d) => `${d.date.slice(8)}/${d.date.slice(5, 7)}`) : MONTHS;
  });

  protected readonly barSeries = computed<ChartSeries[]>(() => {
    const s = this.stats();
    if (!s) return [];
    const rows = s.daily ?? s.monthly;
    return [
      { name: 'حضور', color: 'var(--app-success)', values: rows.map((r) => r.present) },
      { name: 'غياب', color: 'var(--app-danger)', values: rows.map((r) => r.absent) },
    ];
  });

  /** The trend always spans the whole year; in month view the chosen month is tinted. */
  protected readonly lineSeries = computed<ChartSeries[]>(() => {
    const s = this.stats();
    if (!s) return [];
    return [
      { name: 'نسبة الحضور', color: 'var(--app-primary)', values: s.monthly.map((m) => m.attendanceRate) },
      { name: 'نسبة الطلاب القادمين', color: 'var(--app-secondary)', values: s.monthly.map((m) => m.cameRate) },
    ];
  });
  protected readonly highlight = computed(() => (this.mode() === 'month' ? this.month() - 1 : null));
  protected readonly months = MONTHS;

  protected readonly attendanceDonut = computed<DonutSegment[]>(() => {
    const s = this.summary();
    return [
      { label: 'حضور', value: s?.present ?? 0, color: 'var(--app-success)' },
      { label: 'غياب', value: s?.absent ?? 0, color: 'var(--app-danger)' },
      { label: 'لم يسجل بعد', value: s?.unrecorded ?? 0, color: 'var(--app-text-muted)' },
    ];
  });

  protected readonly studentsDonut = computed<DonutSegment[]>(() => {
    const st = this.summary()?.students;
    return [
      { label: 'حضروا مرة على الاقل', value: st?.came ?? 0, color: 'var(--app-success)' },
      { label: 'غابوا فقط', value: st?.absentOnly ?? 0, color: 'var(--app-warning)' },
      { label: 'بدون تسجيل', value: st?.noRecord ?? 0, color: 'var(--app-text-muted)' },
    ];
  });

  protected readonly activeDonut = computed<DonutSegment[]>(() => {
    const st = this.stats()?.students;
    return [
      { label: 'نشطون', value: st?.active ?? 0, color: 'var(--app-primary)' },
      { label: 'غير نشطين', value: st?.inactive ?? 0, color: 'var(--app-text-muted)' },
    ];
  });

  protected readonly rateText = computed(() => pct(this.summary()?.attendanceRate));
  protected readonly cameText = computed(() => pct(this.summary()?.students.cameRate));
  protected readonly activeText = computed(() => pct(this.stats()?.students.activeRate));

  // ---------------------------------------------------------------- loading

  private readonly reload$ = new Subject<void>();
  /** Changes only when the actual query changes (month is irrelevant in year mode). */
  private readonly requestKey = computed(() => `${this.year()}|${this.mode() === 'month' ? this.month() : 'year'}|${this.scope()}`);

  constructor() {
    this.reload$
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.failed.set(false);
        }),
        // a slower, older response can never overwrite a newer one
        switchMap(() =>
          this.api.getAttendanceStats(this.year(), this.mode() === 'month' ? this.month() : null, this.scope()).pipe(
            catchError((err) => {
              this.loading.set(false);
              this.failed.set(true);
              this.message.error(err?.error?.message || err?.message || 'تعذر تحميل احصائيات الحضور');
              return EMPTY;
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((res) => {
        this.loading.set(false);
        // an unexpected / older-format answer shows the error state instead of crashing the charts
        if (!res || !res.summary || !Array.isArray(res.monthly) || res.monthly.length !== 12) {
          this.failed.set(true);
          return;
        }
        this.stats.set(res);
      });

    effect(() => {
      this.requestKey();
      untracked(() => this.reload$.next());
    });
  }

  protected retry(): void {
    this.reload$.next();
  }

  /** nz-segmented binds by option index, so these convert to / from the option value. */
  protected idx(options: { value: string }[], value: string): number {
    return Math.max(0, options.findIndex((o) => o.value === value));
  }
  protected val<T extends string>(options: { value: string }[], index: number): T {
    return options[index]?.value as T;
  }
  protected setMode(i: number): void {
    this.mode.set(this.val<'month' | 'year'>(this.modeOptions, i));
  }
  protected setScope(i: number): void {
    this.scope.set(this.val<AttendanceScope>(this.scopeOptions, i));
  }
}
