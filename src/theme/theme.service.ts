import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { fadeThemeChange } from './theme-transition';

enum ThemeType {
  dark = 'dark',
  default = 'light',
}

const STORAGE_KEY = 'theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  /** Kept as a BehaviorSubject for existing consumers (`currentTheme.getValue()`). */
  currentTheme = new BehaviorSubject(ThemeType.dark);
  /** Signal view of the same state, for OnPush / signal-based components. */
  readonly isDark = signal(true);

  constructor() {
    const saved = this.readStored();
    if (saved) {
      this.apply(saved === ThemeType.dark ? ThemeType.dark : ThemeType.default);
    }
  }

  private apply(theme: ThemeType): void {
    this.currentTheme.next(theme);
    this.isDark.set(theme === ThemeType.dark);
  }

  private readStored(): string | null {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    } catch {
      return null;
    }
  }

  private persist(theme: ThemeType): void {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage unavailable (private mode / SSR) — the choice just won't persist */
    }
  }

  private reverseTheme(theme: string): ThemeType {
    return theme === ThemeType.dark ? ThemeType.default : ThemeType.dark;
  }

  private removeUnusedTheme(theme: ThemeType): void {
    document.documentElement.classList.remove(theme);
    const removedThemeStyle = document.getElementById(theme);
    if (removedThemeStyle) {
      document.head.removeChild(removedThemeStyle);
    }
  }

  private loadCss(href: string, id: string): Promise<Event> {
    this.persist(this.currentTheme.getValue());
    return new Promise((resolve, reject) => {
      const style = document.createElement('link');
      style.rel = 'stylesheet';
      style.href = href;
      style.id = id;
      style.onload = resolve;
      style.onerror = reject;
      document.head.append(style);
    });
  }

  public loadTheme(firstLoad = true): Promise<Event> {
    const theme = this.currentTheme.getValue();
    if (typeof document === 'undefined') {
      return Promise.resolve(new Event('load'));
    }
    if (firstLoad) {
      document.documentElement.classList.add(theme);
    }
    return this.loadCss(`${theme}.css`, theme).then((e) => {
      if (!firstLoad) {
        document.documentElement.classList.add(theme);
      }
      this.removeUnusedTheme(this.reverseTheme(theme));
      return e;
    });
  }

  public toggleTheme(): Promise<Event> {
    fadeThemeChange();
    this.apply(this.reverseTheme(this.currentTheme.getValue()));
    return this.loadTheme(false);
  }
}
