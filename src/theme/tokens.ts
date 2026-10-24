/** TS mirror of the CSS tokens in styles/_tokens.scss, for places that can't read CSS variables (charts, NzConfig). */
export const BRAND = {
  primary: '#1884ff',
  success: '#16a34a',
  danger: '#e5484d',
  warning: '#f59e0b',
  whatsapp: '#25d366',
} as const;

export type Tone = 'primary' | 'success' | 'danger' | 'warning' | 'neutral';

/** Tone → Tailwind classes backed by the CSS tokens (works in both themes). */
export const TONE_CLASSES: Record<Tone, { text: string; soft: string }> = {
  primary: { text: 'text-app-primary', soft: 'bg-app-primary-soft text-app-primary' },
  success: { text: 'text-app-success', soft: 'bg-app-success-soft text-app-success' },
  danger: { text: 'text-app-danger', soft: 'bg-app-danger-soft text-app-danger' },
  warning: { text: 'text-app-warning', soft: 'bg-app-warning-soft text-app-warning' },
  neutral: { text: 'text-app-muted', soft: 'bg-app-surface-2 text-app-muted' },
};
