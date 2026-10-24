import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { LayoutStateService } from '../layout-state.service';
import { HeaderActionsComponent } from './header-actions.component';

/** Today's date in Gregorian + Hijri; falls back to Gregorian-only where the runtime lacks the calendar. */
function formatToday(): string {
  const now = new Date();
  const gregorian = new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now);
  try {
    const hijri = new Intl.DateTimeFormat('ar-EG-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }).format(now);
    return `${gregorian}  •  ${hijri}`;
  } catch {
    return gregorian;
  }
}

/** Floating, rounded top bar: menu trigger + breadcrumb on the start side, date and actions on the end side. */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NzIconModule, BreadcrumbComponent, HeaderActionsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'sticky top-3 z-20 mb-4 block px-4 pt-3 tablet:px-6' },
  template: `
    <header
      class="flex min-h-[56px] items-center justify-between gap-3 rounded-app border border-app-border px-3 shadow-app backdrop-blur md:flex-wrap md:py-2"
      style="background: var(--app-glass)"
    >
      <div class="flex min-w-0 items-center gap-3 md:w-full">
        <button
          type="button"
          class="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-app-sm border-0 bg-transparent text-lg text-app-muted transition-colors hover:bg-app-primary-soft hover:text-app-primary"
          [attr.aria-label]="layout.menuExpanded() ? 'اغلاق القائمة' : 'فتح القائمة'"
          [attr.aria-expanded]="layout.menuExpanded()"
          (click)="layout.toggle()"
        >
          <span nz-icon [nzType]="layout.menuExpanded() ? 'menu-unfold' : 'menu-fold'"></span>
        </button>
        <app-breadcrumb class="min-w-0" />
      </div>
      <div class="flex shrink-0 items-center gap-4 md:w-full md:border-t md:border-app-border md:pt-2">
        <span class="hidden truncate text-sm text-app-muted desk:inline">{{ today }}</span>
        <app-header-actions />
      </div>
    </header>
  `,
})
export class HeaderComponent {
  protected readonly layout = inject(LayoutStateService);
  protected readonly today = formatToday();
}
