import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroMoonSolid, heroSunSolid } from '@ng-icons/heroicons/solid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { ThemeService } from '../../../theme/theme.service';
import { LayoutStateService } from '../layout-state.service';
import { WhatsappButtonComponent } from '../whatsapp/whatsapp-button.component';

/** WhatsApp status + theme switch. Lives in the header, or floats over the home hero. */
@Component({
  selector: 'app-header-actions',
  standalone: true,
  imports: [NgIconComponent, NzIconModule, NzToolTipModule, WhatsappButtonComponent],
  providers: [provideIcons({ heroSunSolid, heroMoonSolid })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-3 md:w-full md:justify-between">
      <app-whatsapp-button />
      <button
        type="button"
        class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-app border border-app-border bg-app-surface text-xl text-app-text shadow-app transition-shadow hover:shadow-app-hover disabled:cursor-wait disabled:opacity-60"
        nz-tooltip
        nzTooltipTitle="تغيير الواجهة"
        [disabled]="switching()"
        [attr.aria-label]="theme.isDark() ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'"
        (click)="toggleTheme()"
      >
        <ng-icon [name]="theme.isDark() ? 'heroSunSolid' : 'heroMoonSolid'" />
      </button>
      <button type="button" class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-app border border-app-border bg-app-surface text-base text-app-text shadow-app transition-all duration-200 hover:border-app-primary hover:text-app-primary hover:shadow-app-hover disabled:cursor-wait disabled:opacity-60" nz-tooltip nzTooltipTitle="رجوع" aria-label="رجوع" (click)="back()">
        <span nz-icon nzType="arrow-right" nzTheme="outline"></span>
      </button>
      <button type="button" class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-app border border-app-border bg-app-surface text-base text-app-text shadow-app transition-all duration-200 hover:border-app-primary hover:text-app-primary hover:shadow-app-hover disabled:cursor-wait disabled:opacity-60" nz-tooltip nzTooltipTitle="تحديث الصفحة" aria-label="تحديث الصفحة" (click)="refresh()">
        <span nz-icon nzType="reload" nzTheme="outline"></span>
      </button>
    </div>
  `,
})
export class HeaderActionsComponent {
  protected readonly theme = inject(ThemeService);
  private readonly message = inject(NzMessageService);
  private readonly location = inject(Location);
  private readonly layout = inject(LayoutStateService);
  protected readonly switching = signal(false);

  protected back(): void {
    this.location.back();
  }

  protected refresh(): void {
    this.layout.rerenderPage();
  }

  protected toggleTheme(): void {
    this.switching.set(true);
    this.theme
      .toggleTheme()
      .then(() => this.message.success('تم تغيير الواجهة بنجاح', { nzDuration: 1000 }))
      .catch(() => this.message.error('تعذر تغيير الواجهة'))
      .finally(() => this.switching.set(false));
  }
}
