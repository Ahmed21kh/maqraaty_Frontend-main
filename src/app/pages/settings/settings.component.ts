import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { AppSettings, COLOR_PRESETS, COLOR_SWATCHES, FONT_OPTIONS, FONT_SIZES } from '../../../theme/settings.model';
import { SettingsService } from '../../../theme/settings.service';
import { ThemeService } from '../../../theme/theme.service';
import { LayoutStateService } from '../../layout/layout-state.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SectionCardComponent } from '../../shared/components/section-card/section-card.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzPopconfirmModule,
    NzProgressModule,
    NzSegmentedModule,
    NzSelectModule,
    NzSwitchModule,
    NzTagModule,
    PageHeaderComponent,
    SectionCardComponent,
    StatCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  private readonly service = inject(SettingsService);
  private readonly themeService = inject(ThemeService);
  private readonly layout = inject(LayoutStateService);
  private readonly message = inject(NzMessageService);

  protected readonly s = this.service.settings;
  protected readonly isDark = this.themeService.isDark;

  protected readonly presets = COLOR_PRESETS;
  protected readonly swatches = COLOR_SWATCHES;
  protected readonly fonts = FONT_OPTIONS;

  /** Colours currently in effect (a null setting means "the theme default"). */
  protected readonly primary = computed(() => this.s().primary ?? (this.isDark() ? '#3c9aff' : '#1884ff'));
  protected readonly secondary = computed(() => this.s().secondary ?? (this.isDark() ? '#2dd4bf' : '#0fb5ae'));

  protected readonly modeOptions = [
    { label: 'فاتح', value: 'light' },
    { label: 'داكن', value: 'dark' },
  ];
  protected readonly sizeOptions = (Object.keys(FONT_SIZES) as (keyof typeof FONT_SIZES)[]).map((value) => ({
    label: FONT_SIZES[value].label,
    value,
  }));
  protected readonly radiusOptions = [
    { label: 'حاد', value: 'sharp' },
    { label: 'متوسط', value: 'normal' },
    { label: 'دائري', value: 'round' },
  ];
  protected readonly densityOptions = [
    { label: 'مضغوط', value: 'compact' },
    { label: 'عادي', value: 'normal' },
    { label: 'مريح', value: 'comfortable' },
  ];
  protected readonly headerOptions = [
    { label: 'عائم', value: 'floating' },
    { label: 'مسطح', value: 'flat' },
  ];
  protected readonly sidebarStyleOptions = [
    { label: 'متدرج', value: 'gradient' },
    { label: 'لون واحد', value: 'solid' },
    { label: 'فاتح', value: 'light' },
  ];
  protected readonly sidebarWidthOptions = [
    { label: 'ضيق', value: 'compact' },
    { label: 'عادي', value: 'normal' },
    { label: 'عريض', value: 'wide' },
  ];
  protected readonly shapeOptions = [
    { label: 'مستدير', value: 'rounded' },
    { label: 'كبسولة', value: 'pill' },
    { label: 'حاد', value: 'square' },
  ];
  protected readonly positionOptions = [
    { label: 'يمين', value: 'right' },
    { label: 'يسار', value: 'left' },
  ];

  protected readonly previewOptions = ['أحمد محمد', 'فاطمة حسن', 'يوسف إبراهيم'];

  protected set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
    this.service.update({ [key]: value } as Partial<AppSettings>);
    if (key === 'sidebarCollapsed') this.layout.userCollapsed.set(value as boolean);
  }

  /** nz-segmented binds by option index, not by value — these convert between the two. */
  protected idx(options: { value: string }[], value: string): number {
    return Math.max(0, options.findIndex((o) => o.value === value));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected val(options: { value: string }[], index: number): any {
    return options[index]?.value;
  }

  protected setMode(mode: string | number): void {
    if ((mode === 'dark') !== this.isDark()) {
      this.themeService.toggleTheme().catch(() => this.message.error('تعذر تغيير الواجهة'));
    }
  }

  protected applyPreset(p: { primary: string; secondary: string }): void {
    this.service.update({ primary: p.primary, secondary: p.secondary });
  }

  protected onColor(key: 'primary' | 'secondary', event: Event): void {
    this.set(key, (event.target as HTMLInputElement).value);
  }

  protected reset(): void {
    this.service.reset();
    this.layout.userCollapsed.set(false);
    this.message.success('تمت اعادة الاعدادات الافتراضية');
  }
}
