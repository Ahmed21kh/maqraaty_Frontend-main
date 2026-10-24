import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { DonutSegment, formatNumber } from './chart.util';

/**
 * Donut chart with a value in the middle and a legend (label · count · share). Hovering a segment or a
 * legend row shows that segment in the centre. With no data it draws an empty ring and "—".
 */
@Component({
  selector: 'app-donut-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  styleUrl: './chart.scss',
  styles: [
    `
      .donut {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 18px 28px;
      }
      .ring-wrap {
        position: relative;
        flex: 0 0 auto;
      }
      // Arcs start at 12 o'clock. The rotation lives in CSS only: mixing an SVG transform attribute with a CSS
      // transform-origin applies the origin twice and pushed the arcs out of the viewBox.
      .ring {
        transform: rotate(-90deg);
        transform-origin: 50% 50%;
        animation: donut-in 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) backwards;
      }
      @keyframes donut-in {
        from {
          opacity: 0;
          transform: rotate(-160deg);
        }
      }
      .track {
        fill: none;
        stroke: var(--app-surface-2);
      }
      .arc {
        fill: none;
        cursor: pointer;
        transition: stroke-width 0.15s ease, opacity 0.15s ease;
      }
      .dim {
        opacity: 0.35;
      }
      .center {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        pointer-events: none;
        padding: 0 22%;
      }
      .center b {
        font-size: 22px;
        line-height: 1.1;
        color: var(--app-text);
      }
      .center small {
        margin-top: 2px;
        font-size: 11px;
        line-height: 1.2;
        color: var(--app-text-muted);
      }
      .items {
        display: flex;
        min-width: 150px;
        flex-direction: column;
        gap: 6px;
        padding: 0;
        margin: 0;
        list-style: none;
      }
      .items li {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 8px;
        font-size: 13px;
        color: var(--app-text-muted);
        border-radius: var(--app-radius-sm);
        transition: background 0.15s;
      }
      .items li:hover,
      .items li.on {
        background: var(--app-surface-2);
      }
      .items i {
        width: 10px;
        height: 10px;
        border-radius: 3px;
        flex: 0 0 auto;
      }
      .items b {
        margin-inline-start: auto;
        padding-inline-start: 10px;
        color: var(--app-text);
      }
      .items em {
        min-width: 44px;
        font-style: normal;
        font-size: 12px;
        text-align: end;
      }
    `,
  ],
  template: `
    <div class="donut" (mouseleave)="hovered.set(null)">
      <div class="ring-wrap" [style.width.px]="size()" [style.height.px]="size()">
        <svg viewBox="0 0 100 100" role="img" [attr.aria-label]="label()" class="block h-full w-full">
          <circle class="track" cx="50" cy="50" r="40" [attr.stroke-width]="thickness" />
          <g class="ring">
            @for (a of arcs(); track a.label) {
              <circle
                class="arc"
                [class.dim]="hovered() !== null && hovered() !== a.index"
                cx="50"
                cy="50"
                r="40"
                pathLength="100"
                [attr.stroke-width]="hovered() === a.index ? thickness + 3 : thickness"
                [attr.stroke-dasharray]="a.dash + ' ' + (100 - a.dash)"
                [attr.stroke-dashoffset]="-a.offset"
                [style.stroke]="a.color"
                (mouseenter)="hovered.set(a.index)"
              />
            }
          </g>
        </svg>
        <div class="center">
          @if (hoveredArc(); as h) {
            <b>{{ h.percentText }}</b>
            <small>{{ h.label }}</small>
          } @else {
            <b>{{ centerValue() || '—' }}</b>
            @if (centerLabel()) {
              <small>{{ centerLabel() }}</small>
            }
          }
        </div>
      </div>

      <ul class="items">
        @for (a of arcs(); track a.label) {
          <li [class.on]="hovered() === a.index" (mouseenter)="hovered.set(a.index)">
            <i [style.background]="a.color"></i>{{ a.label }}<b>{{ a.valueText }}</b><em>{{ a.percentText }}</em>
          </li>
        }
      </ul>
    </div>
  `,
})
export class DonutChartComponent {
  readonly segments = input.required<DonutSegment[]>();
  readonly centerValue = input('');
  readonly centerLabel = input('');
  readonly size = input(176);
  protected readonly thickness = 12;
  protected readonly hovered = signal<number | null>(null);

  protected readonly total = computed(() => this.segments().reduce((t, s) => t + Math.max(0, s.value), 0));

  protected readonly arcs = computed(() => {
    const total = this.total();
    const segs = this.segments();
    let acc = 0;
    return segs.map((s, index) => {
      const share = total > 0 ? (Math.max(0, s.value) / total) * 100 : 0;
      // a hairline gap between neighbours, except when one segment owns the whole ring
      const gap = segs.filter((x) => x.value > 0).length > 1 && share > 1.5 ? 0.8 : 0;
      const arc = {
        index,
        label: s.label,
        color: s.color,
        dash: Math.max(0, share - gap),
        offset: acc,
        valueText: formatNumber(s.value),
        percentText: total > 0 ? `${Math.round(share * 10) / 10}%` : '0%',
      };
      acc += share;
      return arc;
    });
  });

  protected readonly hoveredArc = computed(() => {
    const h = this.hovered();
    return h === null ? null : (this.arcs()[h] ?? null);
  });

  protected readonly label = computed(() => this.segments().map((s) => `${s.label}: ${s.value}`).join('، '));
}
