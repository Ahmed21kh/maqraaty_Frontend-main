/** @type {import('tailwindcss').Config} */
module.exports = {
  // `ts` is included so inline templates in shared/layout components are scanned too.
  content: ["./src/**/*.{html,ts}"],
  // ThemeService toggles `html.dark` / `html.light`.
  darkMode: ['selector', '.dark'],
  theme: {
    // NOTE: the legacy breakpoints are max-width based (`lg:` means "below 1024px").
    // Existing page templates rely on that, so they are kept. `tablet` / `desk`
    // are min-width helpers for new code.
    screens: {
      '2xl': {'max': '1535px'},
      'xl': {'max': '1279px'},
      'lg': {'max': '1023px'},
      'md': {'max': '767px'},
      'sm': {'max': '639px'},
      'tablet': {'min': '768px'},
      'desk': {'min': '1024px'},
    },
    extend: {
      colors: {
        app: {
          primary: 'var(--app-primary)',
          'primary-soft': 'var(--app-primary-soft)',
          secondary: 'var(--app-secondary)',
          'secondary-soft': 'var(--app-secondary-soft)',
          success: 'var(--app-success)',
          'success-soft': 'var(--app-success-soft)',
          danger: 'var(--app-danger)',
          'danger-soft': 'var(--app-danger-soft)',
          warning: 'var(--app-warning)',
          'warning-soft': 'var(--app-warning-soft)',
          whatsapp: 'var(--app-whatsapp)',
          bg: 'var(--app-bg)',
          surface: 'var(--app-surface)',
          'surface-2': 'var(--app-surface-2)',
          border: 'var(--app-border)',
          text: 'var(--app-text)',
          muted: 'var(--app-text-muted)',
        },
      },
      borderRadius: {
        app: 'var(--app-radius)',
        'app-sm': 'var(--app-radius-sm)',
        'app-lg': 'var(--app-radius-lg)',
      },
      boxShadow: {
        app: 'var(--app-shadow)',
        'app-hover': 'var(--app-shadow-hover)',
      },
    },
  },
  plugins: [],
}
