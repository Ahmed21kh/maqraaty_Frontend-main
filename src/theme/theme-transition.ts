let timer: ReturnType<typeof setTimeout> | undefined;

/**
 * Briefly puts `theme-fading` on <html> so colours cross-fade (see _motion.scss) instead of snapping
 * when the theme or the user's palette changes. It is removed again after `ms`.
 */
export function fadeThemeChange(ms = 450): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.add('theme-fading');
  clearTimeout(timer);
  timer = setTimeout(() => root.classList.remove('theme-fading'), ms);
}
