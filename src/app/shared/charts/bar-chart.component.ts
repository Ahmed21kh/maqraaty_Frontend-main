import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, input, signal } from '@angular/core';
import { ChartSeries, formatNumber, niceScale } from './chart.util';

const DEFAULT_WIDTH = 640;
const MARGIN = { top: 14, right: 46, bottom: 34, left: 10 };

interface Bar {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  name: string;
  value: number;
}

/**
 * Stacked or grouped bar chart in plain SVG. Right-to-left: the first category is the rightmost,
 * and the value axis sits on the right. Colours come from CSS tokens, so it follows the theme.
 */
@Component({
  selector: 'app-bar-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  styleUrl: './chart.scss',
  template: `
    <div class="chart relative" (mouseleave)="hovered.set(null)">
      <svg [attr.viewBox]="'0 0 ' + width() + ' ' + height()" class="block h-auto w-full" role="img" [attr.aria-label]="label()">
        @for (t of g().yTicks; track t.value) {
          <line class="grid-line" [attr.x1]="margin.left" [attr.x2]="width() - margin.right" [attr.y1]="t.y" [attr.y2]="t.y" />
          <text class="tick" [attr.x]="width() - margin.right + 8" [attr.y]="t.y + 4">{{ t.label }}</text>
        }

        @for (slot of g().slots; let i = $index; track i) {
          @if (hovered() === i) {
            <rect class="band" [attr.x]="slot.x" [attr.y]="margin.top" [attr.width]="slot.w" [attr.height]="g().plotH" rx="6" />
          }
          @for (bar of slot.bars; track bar.name) {
            <rect
              class="bar"
              [attr.x]="bar.x"
              [attr.y]="bar.y"
              [attr.width]="bar.w"
              [attr.height]="bar.h"
              rx="3"
              [style.fill]="bar.color"
              [style.animation-delay.ms]="i * 22"
            />
          }
          <text class="xlabel" [attr.x]="slot.x + slot.w / 2" [attr.y]="height() - 12">{{ slot.label }}</text>
          <rect
            class="hit"
            [attr.x]="slot.x"
            [attr.y]="margin.top"
            [attr.width]="slot.w"
            [attr.height]="g().plotH + 20"
            (mouseenter)="hovered.set(i)"
          />
        }
      </svg>

      @if (hovered() !== null && g().slots[hovered()!]; as slot) {
        <div class="tooltip" [style.left.%]="((slot.x + slot.w / 2) / width()) * 100" role="tooltip">
          <strong>{{ slot.label }}</strong>
          @for (bar of slot.bars; track bar.name) {
            <span class="row"><i [style.background]="bar.color"></i>{{ bar.name }}: <b>{{ bar.value }}</b></span>
          }
          @if (stacked() && slot.bars.length > 1) {
            <span class="row total">المجموع: <b>{{ slot.total }}</b></span>
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
export class BarChartComponent {
  readonly categories = input.required<string[]>();
  readonly series = input.required<ChartSeries[]>();
  readonly stacked = input(true);
  readonly height = input(280);
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
  protected readonly hovered = signal<number | null>(null);

  protected readonly label = computed(() => {
    const names = this.series().map((s) => s.name).join(' و');
    return this.ariaLabel() || `رسم بياني بالاعمدة: ${names}`;
  });

  protected readonly g = computed(() => {
    const cats = this.categories();
    const series = this.series();
    const n = Math.max(1, cats.length);
    const W = this.width();
    const plotW = W - MARGIN.left - MARGIN.right;
    const plotH = this.height() - MARGIN.top - MARGIN.bottom;
    const slotW = plotW / n;
    const value = (si: number, ci: number) => series[si].values[ci] ?? 0;

    const totals = cats.map((_, ci) => series.reduce((t, _s, si) => t + value(si, ci), 0));
    const maxValue = this.stacked() ? Math.max(0, ...totals) : Math.max(0, ...series.flatMap((s) => s.values.map((v) => v ?? 0)));
    const scale = niceScale(maxValue);
    const yOf = (v: number) => MARGIN.top + plotH - (v / scale.max) * plotH;

    const yTicks = Array.from({ length: Math.round(scale.max / scale.step) + 1 }, (_, i) => {
      const v = i * scale.step;
      return { value: v, y: yOf(v), label: formatNumber(v) };
    });

    const baseline = MARGIN.top + plotH;
    const slots = cats.map((label, ci) => {
      // right-to-left: category 0 is the rightmost slot
      const x = MARGIN.left + plotW - (ci + 1) * slotW;
      const bars: Bar[] = [];
      if (this.stacked()) {
        const bw = Math.min(slotW * 0.62, 40);
        let top = baseline;
        series.forEach((s, si) => {
          const v = value(si, ci);
          const h = (v / scale.max) * plotH;
          top -= h;
          if (h > 0) bars.push({ x: x + (slotW - bw) / 2, y: top, w: bw, h, color: s.color, name: s.name, value: v });
        });
      } else {
        const bw = Math.min((slotW * 0.8) / series.length, 24);
        series.forEach((s, si) => {
          const v = value(si, ci);
          const h = (v / scale.max) * plotH;
          // RTL: first series on the right
          const bx = x + slotW / 2 + ((series.length - 1) / 2 - si) * bw - bw / 2;
          if (h > 0) bars.push({ x: bx, y: baseline - h, w: bw, h, color: s.color, name: s.name, value: v });
        });
      }
      return { label, x, w: slotW, bars, total: totals[ci] };
    });

    return { yTicks, slots, plotH, empty: maxValue === 0 };
  });
}
