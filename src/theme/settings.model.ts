export type FontKey = 'cairo' | 'tajawal' | 'almarai' | 'plex' | 'system';
export type FontSizeKey = 'sm' | 'md' | 'lg' | 'xl';
export type RadiusKey = 'sharp' | 'normal' | 'round';
export type DensityKey = 'compact' | 'normal' | 'comfortable';
export type HeaderStyle = 'floating' | 'flat';
export type SidebarStyle = 'gradient' | 'solid' | 'light';
export type SidebarWidth = 'compact' | 'normal' | 'wide';
export type SidebarItemShape = 'rounded' | 'pill' | 'square';
export type SidebarPosition = 'right' | 'left';

export interface AppSettings {
  /** `null` = use the theme's own default colour. */
  primary: string | null;
  secondary: string | null;
  fontFamily: FontKey;
  fontSize: FontSizeKey;
  radius: RadiusKey;
  density: DensityKey;
  header: HeaderStyle;
  reduceMotion: boolean;
  sidebarStyle: SidebarStyle;
  sidebarWidth: SidebarWidth;
  sidebarItemShape: SidebarItemShape;
  sidebarPosition: SidebarPosition;
  sidebarCollapsed: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  primary: null,
  secondary: null,
  fontFamily: 'cairo',
  fontSize: 'md',
  radius: 'normal',
  density: 'normal',
  header: 'floating',
  reduceMotion: false,
  sidebarStyle: 'gradient',
  sidebarWidth: 'normal',
  sidebarItemShape: 'rounded',
  sidebarPosition: 'right',
  sidebarCollapsed: false,
};

export const FONT_OPTIONS: { key: FontKey; label: string; stack: string; url?: string }[] = [
  { key: 'cairo', label: 'Cairo', stack: "'Cairo', sans-serif" },
  { key: 'tajawal', label: 'Tajawal', stack: "'Tajawal', 'Cairo', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap' },
  { key: 'almarai', label: 'Almarai', stack: "'Almarai', 'Cairo', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&display=swap' },
  { key: 'plex', label: 'IBM Plex Sans Arabic', stack: "'IBM Plex Sans Arabic', 'Cairo', sans-serif", url: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap' },
  { key: 'system', label: 'خط النظام', stack: "system-ui, 'Segoe UI', Tahoma, sans-serif" },
];

/** Base text size in px (14px is the ant-design default). */
export const FONT_SIZES: Record<FontSizeKey, { label: string; px: number }> = {
  sm: { label: 'صغير', px: 13 },
  md: { label: 'متوسط', px: 14 },
  lg: { label: 'كبير', px: 16 },
  xl: { label: 'كبير جدا', px: 18 },
};

export const RADII: Record<RadiusKey, { label: string; sm: number; md: number; lg: number; control: number }> = {
  sharp: { label: 'حاد', sm: 3, md: 6, lg: 8, control: 4 },
  normal: { label: 'متوسط', sm: 8, md: 12, lg: 16, control: 10 },
  round: { label: 'دائري', sm: 12, md: 18, lg: 24, control: 16 },
};

export const CELL_PADDING: Record<DensityKey, number> = { compact: 8, normal: 16, comfortable: 22 };
export const SIDEBAR_WIDTHS: Record<SidebarWidth, number> = { compact: 240, normal: 280, wide: 320 };
export const SIDEBAR_ITEM_RADIUS: Record<SidebarItemShape, number> = { rounded: 8, pill: 999, square: 0 };

/** Ready-made palettes: [name, primary, secondary]. */
export const COLOR_PRESETS: { name: string; primary: string; secondary: string }[] = [
  { name: 'الأزرق الملكي', primary: '#1884ff', secondary: '#0fb5ae' },
  { name: 'الزمردي', primary: '#16a34a', secondary: '#0ea5a4' },
  { name: 'البنفسجي', primary: '#7c3aed', secondary: '#ec4899' },
  { name: 'الذهبي', primary: '#c8961e', secondary: '#0f766e' },
  { name: 'الأحمر', primary: '#e5484d', secondary: '#f59e0b' },
  { name: 'الداكن الأنيق', primary: '#334155', secondary: '#38bdf8' },
];

export const COLOR_SWATCHES = ['#1884ff', '#16a34a', '#7c3aed', '#c8961e', '#e5484d', '#0ea5a4', '#ec4899', '#f97316', '#334155'];
