import { APP_INITIALIZER } from '@angular/core';
import { SettingsService } from '../../../theme/settings.service';
import { ThemeService } from '../../../theme/theme.service';

/** Before first render: apply the saved look & feel, then load the saved light/dark stylesheet. */
export const AppInitializerProvider = {
  provide: APP_INITIALIZER,
  useFactory: (themeService: ThemeService, settings: SettingsService) => () => {
    settings.applyNow();
    return themeService.loadTheme();
  },
  deps: [ThemeService, SettingsService],
  multi: true,
};
