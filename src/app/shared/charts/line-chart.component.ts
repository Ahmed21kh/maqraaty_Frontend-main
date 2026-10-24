import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, input, signal } from '@angular/core';
import { ChartSeries, nextChartId } from './chart.util';

const DEFAULT_WIDTH = 640;
const MARGIN = { top: 14, right: 46, bottom: 34, left: 10 };

/**
 * Line chart for percentages (0–100 by default), plain SVG, right-to-left like the bar chart.
 * `null` values leave a gap instead of dropping to zero. The first series also gets a soft area fill.
 */
@Component({
  selector: 'app-line-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  styleUrl: './chart.scss',
  template: `
    <div class="chart relative" (mouseleave)="hovered.set(null)">
      <svg [attr.viewBox]="'0 0 ' + width() + ' ' + height()" class="block h-auto w-full" role="img" [attr.aria-label]="label()">
        <defs>
          <linearGradient [attr.id]="gradientId" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" [style.stop-color]="areaColor()" stop-opacity="0.28" />
            <stop offset="100%" [style.stop-color]="areaColor()" stop-opacity="0" />
          </linearGradient>
        </defs>

        @for (t of g().yTicks; track t.value) {
          <line class="grid-line" [attr.x1]="margin.left" [attr.x2]="width() - margin.right" [attr.y1]="t.y" [attr.y2]="t.y" />
          <text class="tick" [attr.x]="width() - margin.right + 8" [attr.y]="t.y + 4">{{ t.label }}</text>
        }

        @if (highlightSlot(); as hs) {
          <rect class="band" [attr.x]="hs.x" [attr.y]="margin.top" [attr.width]="hs.w" [attr.height]="g().plotH" rx="6" />
        }
        @if (hovered() !== null && g().slots[hovered()!]; as hv) {
          <line class="grid-line hover-line" [attr.x1]="hv.cx" [attr.x2]="hv.cx" [attr.y1]="margin.top" [attr.y2]="margin.top + g().plotH" />
        }

        @for (a of g().areas; track $index) {
          <path class="area" [attr.d]="a" [attr.fill]="'url(#' + gradientId + ')'" />
        }
        @for (l of g().lines; track $index) {
          <path class="line" [attr.d]="l.d" pathLength="1" [style.stroke]="l.color" />
        }
        @for (p of g().points; track $index) {
          <circle class="point" [attr.cx]="p.x" [attr.cy]="p.y" [attr.r]="hovered() === p.i ? 5.5 : 3.8" [style.fill]="p.color" />
        }

        @for (slot of g().slots; let i = $index; track i) {
          <text class="xlabel" [attr.x]="slot.cx" [attr.y]="height() - 12">{{ slot.label }}</text>
          <rect class="hit" [attr.x]="slot.x" [attr.y]="margin.top" [attr.width]="slot.w" [attr.height]="g().plotH + 20" (mouseenter)="hovered.set(i)" />
        }
      </svg>

      @if (hovered() !== null && g().slots[hovered()!]; as slot) {
        <div class="tooltip" [style.left.%]="(slot.cx / width()) * 100" role="tooltip">
          <strong>{{ slot.label }}</strong>
          @for (s of series(); track s.name) {
            <span class="row">
              <i [style.background]="s.color"></i>{{ s.name }}:
              <b>{{ s.values[hovered()!] === null || s.values[hovered()!] === undefined ? '—' : s.values[hovered()!] + suffix() }}</b>
            </span>
          }
        </div>
      }

      @if (g().empty) {
        <div class="empty">{{ emptyText() }}</div>
      }
    </div>

    <ul class="legend">
      @for (s of series(); track s.name) {
        <li><i [style.background]="s.color"></i>{{ s.name }}</li>
      }
    </ul>
  `,
})
export class LineChartComponent {
  readonly categories = input.required<string[]>();
  readonly series = input.required<ChartSeries[]>();
  readonly height = input(260);
  readonly yMax = input(100);
  readonly suffix = input('%');
  /** Index of a category to tint (e.g. the month being looked at). */
  readonly highlight = input<number | null>(null);
  readonly emptyText = input('لا توجد بيانات مسجلة لهذه الفترة');
  readonly ariaLabel = input('');

  /** Measured from the container, so axis text keeps its size whatever the card width is. */
  protected readonly width = signal(DEFAULT_WIDTH);
  protected readonly margin = MARGIN;

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const observer = new ResizeObserver(([entry]) => {
        const w = Math.round(entry.contentRect.width);
        if (w > 0) this.width.set(Math.min(1600, Math.max(320, w)));
      });
      observer.observe(host.nativeElement);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
  protected readonly gradientId = nextChartId('line-area');
  protected readonly hovered = signal<number | null>(null);

  /** The first series gets the soft area fill. */
  protected readonly areaColor = computed(() => (this.series().length ? this.series()[0].color : 'transparent'));

  protected readonly label = computed(() => this.ariaLabel() || `رسم بياني خطي: ${this.series().map((s) => s.name).join(' و')}`);

  protected readonly g = computed(() => {
    const cats = this.categories();
    const series = this.series();
    const n = Math.max(1, cats.length);
    const W = this.width();
    const plotW = W - MARGIN.left - MARGIN.right;
    const plotH = this.height() - MARGIN.top - MARGIN.bottom;
    const slotW = plotW / n;
    const top = MARGIN.top;
    const baseline = top + plotH;
    const yMax = this.yMax();
    const yOf = (v: number) => top + plotH - (Math.min(v, yMax) / yMax) * plotH;
    const cxOf = (i: number) => MARGIN.left + plotW - (i + 0.5) * slotW; // right-to-left

    const step = yMax / 4;
    const yTicks = Array.from({ length: 5 }, (_, i) => ({ value: i * step, y: yOf(i * step), label: `${Math.round(i * step)}${this.suffix()}` }));
    const slots = cats.map((label, i) => ({ label, cx: cxOf(i), x: cxOf(i) - slotW / 2, w: slotW }));

    const lines: { d: string; color: string }[] = [];
    const areas: string[] = [];
    const points: { x: number; y: number; color: string; i: number }[] = [];

    series.forEach((s, si) => {
      let segment: { x: number; y: number }[] = [];
      const flush = () => {
        if (segment.length > 1) {
          lines.push({ d: segment.map((p, k) => `${k ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' '), color: s.color });
          if (si === 0) {
            const first = segment[0];
            const last = segment[segment.length - 1];
            areas.push(`${segment.map((p, k) => `${k ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')} L${last.x.toFixed(1)} ${baseline} L${first.x.toFixed(1)} ${baseline} Z`);
          }
        }
        segment = [];
      };
      s.values.forEach((v, i) => {
        if (v === null || v === undefined) {
          flush();
          return;
        }
        const p = { x: cxOf(i), y: yOf(v) };
        segment.push(p);
        points.push({ ...p, color: s.color, i });
      });
      flush();
    });

    const hasData = series.some((s) => s.values.some((v) => v !== null && v !== undefined));
    return { yTicks, slots, lines, areas, points, plotH, empty: !hasData };
  });

  protected readonly highlightSlot = computed(() => {
    const h = this.highlight();
    return h === null ? null : (this.g().slots[h] ?? null);
  });
}
