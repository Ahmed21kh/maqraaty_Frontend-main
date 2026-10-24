import { computed, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith, tap } from 'rxjs';

/** UI state shared by the shell, sidebar and header. */
@Injectable({ providedIn: 'root' })
export class LayoutStateService {
  private readonly router = inject(Router);

  /** The user's own collapse choice (trigger button / tablet widths). */
  readonly userCollapsed = signal(false);
  /** Phones: the sidebar becomes an off-canvas drawer instead of a rail. */
  readonly isMobile = signal(false);
  readonly mobileOpen = signal(false);
  /** The "make sure WhatsApp is logged in" hint — shown until the dialog is opened once. */
  readonly whatsappHint = signal(true);

  readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      tap(() => this.mobileOpen.set(false)), // navigating closes the drawer
      map((e) => e.urlAfterRedirects),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  /** The landing page is a full-bleed hero, so it gets the slim sidebar and no header. */
  readonly isHome = computed(() => {
    const path = this.url().split('?')[0];
    return path === '/' || path === '/home';
  });

  /** Rail mode for the desktop/tablet sidebar. Not used on phones (drawer is always full width). */
  readonly collapsed = computed(() => !this.isMobile() && (this.userCollapsed() || this.isHome()));

  /** Whether the menu is currently visible, whichever mode we are in. */
  readonly menuExpanded = computed(() => (this.isMobile() ? this.mobileOpen() : !this.collapsed()));

  /** Flips off and on again to re-create the routed page (fresh state, data reloaded) without a browser reload. */
  readonly pageAlive = signal(true);
  rerenderPage(): void {
    this.pageAlive.set(false);
    setTimeout(() => this.pageAlive.set(true));
  }

  toggle(): void {
    if (this.isMobile()) {
      this.mobileOpen.update((v) => !v);
    } else {
      this.userCollapsed.update((v) => !v);
    }
  }
}
