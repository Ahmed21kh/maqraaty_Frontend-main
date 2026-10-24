import { Component, DestroyRef, HostListener, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SettingsService } from '../../../theme/settings.service';
import { TableScrollService } from '../../core/services/table-scroll.service';
import { WhatsappSocketService } from '../../core/whatsapp/whatsapp-socket.service';
import { HeaderActionsComponent } from '../header/header-actions.component';
import { HeaderComponent } from '../header/header.component';
import { LayoutStateService } from '../layout-state.service';
import { ScrollTopComponent } from '../scroll-top/scroll-top.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

/**
 * App frame: sidebar + header + routed content.
 *
 * Deliberately default change detection: the routed pages are still default-CD (they update
 * plain fields from HTTP callbacks), and an OnPush ancestor would stop them from refreshing.
 */
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, HeaderActionsComponent, ScrollTopComponent],
  styles: [
    `
      .drawer-backdrop {
        animation: drawer-fade 0.25s ease both;
        -webkit-backdrop-filter: blur(3px);
        backdrop-filter: blur(3px);
      }
      .drawer-panel {
        animation: drawer-in 0.32s cubic-bezier(0.2, 0.8, 0.2, 1) both;
      }
      .drawer-panel.from-left {
        animation-name: drawer-in-left;
      }
      @keyframes drawer-fade {
        from {
          opacity: 0;
        }
      }
      @keyframes drawer-in {
        from {
          opacity: 0;
          transform: translateX(40px) scale(0.98);
        }
      }
      @keyframes drawer-in-left {
        from {
          opacity: 0;
          transform: translateX(-40px) scale(0.98);
        }
      }
    `,
  ],
  template: `
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:right-4 focus:top-4 focus:z-[100] focus:rounded-app focus:bg-app-primary focus:px-4 focus:py-2 focus:text-white"
    >
      تخطي إلى المحتوى
    </a>

    <div class="flex min-h-screen bg-app-bg text-app-text" dir="rtl" [class.flex-row-reverse]="settings.settings().sidebarPosition === 'left'">
      @if (layout.isMobile()) {
        @if (layout.mobileOpen()) {
          <div class="drawer-backdrop fixed inset-0 z-40 bg-black/50" aria-hidden="true" (click)="layout.mobileOpen.set(false)"></div>
          <div class="drawer-panel fixed inset-y-0 z-50 shadow-app-hover" [class.from-left]="settings.settings().sidebarPosition === 'left'" [class.right-0]="settings.settings().sidebarPosition !== 'left'" [class.left-0]="settings.settings().sidebarPosition === 'left'" role="dialog" aria-modal="true" aria-label="القائمة الرئيسية">
            <app-sidebar [collapsed]="false" />
            <button
              type="button"
              class="absolute left-5 top-5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-app border-0 text-lg"
              style="background: rgba(255, 255, 255, 0.14); color: #fff"
              aria-label="اغلاق القائمة"
              (click)="layout.mobileOpen.set(false)"
            >
              ✕
            </button>
          </div>
        }
      } @else {
        <div
          class="fixed inset-y-0 z-30"
          [class.right-0]="settings.settings().sidebarPosition !== 'left'"
          [class.left-0]="settings.settings().sidebarPosition === 'left'"
        >
          <app-sidebar [collapsed]="layout.collapsed()" />
        </div>
      }

      <div
        class="relative flex min-w-0 flex-1 flex-col transition-[margin] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        [style.margin-right]="settings.settings().sidebarPosition !== 'left' ? sidebarOffset() : null"
        [style.margin-left]="settings.settings().sidebarPosition === 'left' ? sidebarOffset() : null"
      >
        @if (layout.isHome()) {
          <div class="absolute left-4 top-4 z-50"><app-header-actions /></div>
          @if (layout.isMobile() && !layout.mobileOpen()) {
            <button
              type="button"
              class="absolute right-4 top-4 z-50 flex h-10 w-10 cursor-pointer items-center justify-center rounded-app text-xl backdrop-blur"
              style="background: var(--app-surface); color: var(--app-text); border: 1px solid var(--app-border)"
              aria-label="فتح القائمة"
              (click)="layout.toggle()"
            >
              ☰
            </button>
          }
        } @else {
          <app-header />
        }
        <main id="main-content" class="min-w-0 flex-1"
          [style.--hero-pad-r]="heroInset('right')"
          [style.--hero-pad-l]="heroInset('left')" [class.p-4]="!layout.isHome() && layout.isMobile()" [class.px-6]="!layout.isHome() && !layout.isMobile()" [class.py-5]="!layout.isHome() && !layout.isMobile()">
          @if (layout.pageAlive()) {
            <router-outlet />
          }
        </main>
      </div>
    </div>

    <app-scroll-top />
  `,
})
export class ShellComponent implements OnInit {
  protected readonly layout = inject(LayoutStateService);
  protected readonly settings = inject(SettingsService);
  private readonly whatsapp = inject(WhatsappSocketService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly tableScroll = inject(TableScrollService);

  /** The sidebar is fixed, so the content keeps clear of it: its width plus the 12px gap on each side. */
  protected sidebarOffset(): string {
    // the home hero is full-bleed: it runs under the floating sidebar instead of leaving a plain strip beside it
    if (this.layout.isMobile() || this.layout.isHome()) return '0px';
    return `calc(${this.layout.collapsed() ? '80px' : 'var(--app-sidebar-width)'} + 24px)`;
  }

  /** The full-bleed home hero centres its content in the space beside the floating sidebar. */
  protected heroInset(side: 'left' | 'right'): string | null {
    if (this.layout.isMobile()) return null;
    const sidebarSide = this.settings.settings().sidebarPosition === 'left' ? 'left' : 'right';
    return side === sidebarSide ? 'calc(80px + 24px)' : null;
  }

  ngOnInit(): void {
    this.tableScroll.start();
    this.whatsapp.connect();
    this.watchBreakpoints();
  }

  @HostListener('document:keydown.escape')
  protected closeDrawer(): void {
    this.layout.mobileOpen.set(false);
  }

  /** Phones → drawer; tablets → slim rail; follows the window as it is resized. */
  private watchBreakpoints(): void {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const phone = window.matchMedia('(max-width: 767px)');
    const tablet = window.matchMedia('(max-width: 1023px)');
    this.layout.isMobile.set(phone.matches);
    this.layout.userCollapsed.set(tablet.matches || this.settings.settings().sidebarCollapsed);

    const onPhone = (e: MediaQueryListEvent) => {
      this.layout.isMobile.set(e.matches);
      if (!e.matches) this.layout.mobileOpen.set(false);
    };
    const onTablet = (e: MediaQueryListEvent) => this.layout.userCollapsed.set(e.matches || this.settings.settings().sidebarCollapsed);

    phone.addEventListener('change', onPhone);
    tablet.addEventListener('change', onTablet);
    this.destroyRef.onDestroy(() => {
      phone.removeEventListener('change', onPhone);
      tablet.removeEventListener('change', onTablet);
    });
  }
}
