import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { SettingsService } from '../../../theme/settings.service';

/** How far (px) the page must be scrolled before the button appears. */
const SHOW_AFTER = 400;

/**
 * Floating "back to top" button. Lives in the shell, so every long page (tables with many rows…) gets it.
 * Fades in once the page is scrolled, sits on the side opposite the sidebar, and scrolls smoothly —
 * or instantly when the user asked for reduced motion.
 */
@Component({
  selector: 'app-scroll-top',
  standalone: true,
  imports: [NzIconModule, NzToolTipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="fixed bottom-6 z-40 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-0 text-xl shadow-app-hover transition-all duration-300 hover:-translate-y-0.5"
      style="
        background-image: linear-gradient(135deg, var(--app-primary), color-mix(in srgb, var(--app-primary) 62%, var(--app-secondary)));
        color: var(--app-on-primary);
      "
      [class.left-6]="settings.settings().sidebarPosition !== 'left'"
      [class.right-6]="settings.settings().sidebarPosition === 'left'"
      [class.opacity-0]="!visible()"
      [class.pointer-events-none]="!visible()"
      [class.translate-y-4]="!visible()"
      [attr.aria-hidden]="!visible()"
      [attr.tabindex]="visible() ? 0 : -1"
      aria-label="العودة الى اعلى الصفحة"
      nz-tooltip
      nzTooltipTitle="الى الاعلى"
      nzTooltipPlacement="right"
      (click)="toTop()"
    >
      <span nz-icon nzType="vertical-align-top" nzTheme="outline"></span>
    </button>
  `,
})
export class ScrollTopComponent {
  protected readonly settings = inject(SettingsService);
  protected readonly visible = signal(false);

  // Passive-by-nature signal write: the template only re-renders when the threshold is crossed.
  @HostListener('window:scroll')
  protected onScroll(): void {
    const show = (window.scrollY || document.documentElement.scrollTop) > SHOW_AFTER;
    if (show !== this.visible()) this.visible.set(show);
  }

  protected toTop(): void {
    const reduced =
      this.settings.settings().reduceMotion || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  }
}
