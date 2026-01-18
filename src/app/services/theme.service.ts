import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

enum ThemeType {
  dark = 'dark',
  default = 'light',
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  currentTheme = new BehaviorSubject(ThemeType.default) ;

  constructor() {
    if (typeof localStorage !== 'undefined') {
      console.log(localStorage.getItem('theme'));
      let theme = localStorage.getItem('theme') == 'dark'? ThemeType.dark : ThemeType.default;
     this.currentTheme.next(theme);
     console.log(this.currentTheme.getValue());

    }
  }

  private reverseTheme(theme: string): ThemeType {
    // localStorage.setItem('theme',theme)
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
      localStorage.setItem('theme',this.currentTheme.getValue())
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

    const theme= this.currentTheme.getValue();
    // console.log(typeof document);
    if (firstLoad && typeof document !== 'undefined') {
      document.documentElement.classList.add(theme);
    }
    return new Promise<Event>((resolve, reject) => {
      if (typeof document !== 'undefined' ){
        this.loadCss(`${theme}.css`, theme).then(
          (e) => {
            if (!firstLoad && typeof document !== 'undefined') {
              document.documentElement.classList.add(theme);
            }
            this.removeUnusedTheme(this.reverseTheme(theme));
            resolve(e);
          },
          (e) => reject(e)
        );

      }
    });
  }

  public toggleTheme(): Promise<Event> {
    this.currentTheme.next(this.reverseTheme(this.currentTheme.getValue()));

    return this.loadTheme(false);
  }
}
