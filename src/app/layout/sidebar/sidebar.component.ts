import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { BidiModule } from '@angular/cdk/bidi';
import { RouterLink } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { ThemeService } from '../../../theme/theme.service';
import { LayoutStateService } from '../layout-state.service';
import { isRouteActive, NAV_ITEMS, NavItem } from '../nav.config';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  // BidiModule makes `dir="rtl"` below provide Directionality, which ng-zorro's menu reads to switch to RTL.
  imports: [BidiModule, RouterLink, NzMenuModule, NzIconModule, NzToolTipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './sidebar.component.scss',
  template: `
    <aside
      class="sidebar flex h-screen flex-col overflow-y-auto overflow-x-hidden"
      [class.is-collapsed]="collapsed()"
      aria-label="القائمة الرئيسية"
    >
      <a routerLink="/home" class="sidebar-brand flex items-center gap-3 px-4 py-5" aria-label="مقرأتي — الرئيسية">
        <img src="assets/quran-cover.webp" alt="" width="44" height="44" class="h-11 w-11 shrink-0 rounded-app-sm object-cover" />
        @if (!collapsed()) {
          <span class="brand-name truncate text-2xl font-bold tracking-wide">مقرأتــــي</span>
        }
      </a>

      <ul
        nz-menu
        dir="rtl"
        nzMode="inline"
        class="app-menu flex-1"
        nzTheme="dark"
        [nzInlineCollapsed]="collapsed()"
      >
        @for (item of items; track item.label) {
          @if (item.children) {
            <li nz-submenu [nzTitle]="item.label" [nzIcon]="item.icon" [nzOpen]="isOpen(item)" (nzOpenChange)="setOpen(item, $event)">
              <ul>
                @for (child of item.children; track child.route) {
                  <li nz-menu-item [routerLink]="child.route" [nzSelected]="active(child)">
                    <span nz-icon [nzType]="child.icon" nzTheme="outline"></span>
                    <span>{{ child.label }}</span>
                  </li>
                }
              </ul>
            </li>
          } @else {
            <li nz-menu-item [routerLink]="item.route" [nzSelected]="active(item)" nz-tooltip [nzTooltipTitle]="collapsed() ? item.label : ''" nzTooltipPlacement="left">
              <span nz-icon [nzType]="item.icon" nzTheme="outline"></span>
              <span>{{ item.label }}</span>
            </li>
          }
        }
      </ul>
    </aside>
  `,
})
export class SidebarComponent {
  protected readonly theme = inject(ThemeService);
  private readonly layout = inject(LayoutStateService);

  readonly collapsed = input(false);
  protected readonly items = NAV_ITEMS;

  private readonly url = this.layout.url;

  protected active(item: NavItem): boolean {
    return isRouteActive(this.url(), item.route);
  }

  /** Groups the user opened/closed by hand since the last navigation. */
  private readonly manual = signal<Record<string, boolean>>({});

  constructor() {
    // Every navigation resets to the default (expanded: open the active group; collapsed: nothing open).
    // Needed for the collapsed rail's flyout: the pointer is still over it after a click, so the browser
    // never sends the mouse-leave that would normally close it.
    effect(
      () => {
        this.url();
        this.manual.set({});
      },
      { allowSignalWrites: true }
    );
  }

  protected isOpen(item: NavItem): boolean {
    return this.manual()[item.label] ?? (!this.collapsed() && this.hasActiveChild(item));
  }

  protected setOpen(item: NavItem, open: boolean): void {
    this.manual.update((m) => ({ ...m, [item.label]: open }));
  }

  protected hasActiveChild(item: NavItem): boolean {
    return !!item.children?.some((c) => this.active(c));
  }
}
