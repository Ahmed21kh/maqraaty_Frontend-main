export interface ChartSeries {
  name: string;
  /** Any CSS colour, normally a token such as `var(--app-success)`. */
  color: string;
  values: (number | null)[];
}

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

/**
 * Rounds `max` up to a "nice" axis maximum and returns the tick step, so the grid lines land on
 * round numbers (e.g. 1 273 → max 1 400, step 350 is avoided in favour of 1 500 / 500).
 */
export function niceScale(max: number, ticks = 4): { max: number; step: number } {
  if (!Number.isFinite(max) || max <= 0) return { max: ticks, step: 1 };
  const rough = max / ticks;
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const frac = rough / pow;
  const nice = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10;
  const step = nice * pow;
  return { max: step * Math.ceil(max / step), step };
}

let uid = 0;
/** Unique DOM id for SVG gradients (several charts can live on one page). */
export const nextChartId = (prefix: string) => `${prefix}-${++uid}`;

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}
