import { effect, Injectable, signal } from '@angular/core';
import { fadeThemeChange } from './theme-transition';
import {
  AppSettings,
  CELL_PADDING,
  DEFAULT_SETTINGS,
  FONT_OPTIONS,
  FONT_SIZES,
  RADII,
  SIDEBAR_ITEM_RADIUS,
  SIDEBAR_WIDTHS,
} from './settings.model';

const STORAGE_KEY = 'maqraaty.settings';
const HEX = /^#[0-9a-f]{6}$/i;

/** Readable text colour (white/near-black) for a given background, by perceived luminance. */
function onColor(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (r * 299 + g * 587 + b * 114) / 1000 > 160 ? '#111827' : '#ffffff';
}

/**
 * User-tunable look & feel (colours, font, shape, sidebar…).
 *
 * State lives in a signal, is persisted to localStorage and projected onto <html> as CSS variables and
 * `data-*` attributes — _tokens.scss / _antd-overrides.scss / component styles read those, so a change
 * is visible immediately everywhere with no component involvement.
 */
@Injectable({ providedIn: 'root' })
export class SettingsService {
  readonly settings = signal<AppSettings>(this.load());

  private readonly loadedFonts = new Set<string>();

  constructor() {
    effect(() => {
      const s = this.settings();
      this.apply(s);
      this.persist(s);
    });
  }

  update(patch: Partial<AppSettings>): void {
    fadeThemeChange();
    this.settings.update((s) => ({ ...s, ...this.sanitize(patch) }));
  }

  reset(): void {
    fadeThemeChange();
    this.settings.set({ ...DEFAULT_SETTINGS });
  }

  /** Applies synchronously — used at startup so the first paint already has the saved look. */
  applyNow(): void {
    this.apply(this.settings());
  }

  // ------------------------------------------------------------------ internals

  private sanitize(patch: Partial<AppSettings>): Partial<AppSettings> {
    const out = { ...patch };
    for (const key of ['primary', 'secondary'] as const) {
      if (key in out && out[key] !== null && !HEX.test(out[key] as string)) delete out[key];
    }
    return out;
  }

  private load(): AppSettings {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      return raw ? { ...DEFAULT_SETTINGS, ...this.sanitize(JSON.parse(raw)) } : { ...DEFAULT_SETTINGS };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  private persist(s: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {
      /* storage unavailable — settings just won't survive a reload */
    }
  }

  private apply(s: AppSettings): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const set = (name: string, value: string | null) =>
      value === null ? root.style.removeProperty(name) : root.style.setProperty(name, value);

    // colours (null → fall back to the theme defaults in _tokens.scss)
    set('--app-primary', s.primary);
    set('--app-secondary', s.secondary);
    set('--app-on-primary', s.primary ? onColor(s.primary) : null);

    // typography
    const font = FONT_OPTIONS.find((f) => f.key === s.fontFamily) ?? FONT_OPTIONS[0];
    this.ensureFont(font.url);
    set('--app-font', font.stack);
    const px = FONT_SIZES[s.fontSize].px;
    set('--app-font-size', `${px}px`);
    set('--app-font-scale', String(px / 14));

    // shape & density
    const r = RADII[s.radius];
    set('--app-radius-sm', `${r.sm}px`);
    set('--app-radius', `${r.md}px`);
    set('--app-radius-lg', `${r.lg}px`);
    set('--app-radius-control', `${r.control}px`);
    set('--app-cell-pad', `${CELL_PADDING[s.density]}px`);

    // sidebar
    set('--app-sidebar-width', `${SIDEBAR_WIDTHS[s.sidebarWidth]}px`);
    set('--app-sidebar-item-radius', `${SIDEBAR_ITEM_RADIUS[s.sidebarItemShape]}px`);

    root.dataset['sidebarStyle'] = s.sidebarStyle;
    root.dataset['sidebarPos'] = s.sidebarPosition;
    root.dataset['header'] = s.header;
    root.dataset['density'] = s.density;
    root.dataset['motion'] = s.reduceMotion ? 'reduced' : 'full';
  }

  /** Loads an optional web font once, the first time it is selected. */
  private ensureFont(url?: string): void {
    if (!url || this.loadedFonts.has(url)) return;
    this.loadedFonts.add(url);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
  }
}
