import { EnvironmentProviders, importProvidersFrom, makeEnvironmentProviders } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { NgIconsModule } from '@ng-icons/core';
import { featherAirplay, featherSun, featherMoon } from '@ng-icons/feather-icons';
import { heroSun, heroMoon } from '@ng-icons/heroicons/outline';
import { simpleWhatsapp } from '@ng-icons/simple-icons';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { provideNzIcons } from './icons.provider';
import { AppInitializerProvider } from '../initializers/app-initializer.service';

registerLocaleData(en);

/** Everything the app needs at the root, in one place — keeps app.config.ts declarative. */
export function provideCore(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideHttpClient(),
    provideAnimations(),
    provideNzIcons(),
    provideNzI18n(en_US),
    importProvidersFrom(FormsModule),
    importProvidersFrom(
      NgIconsModule.withIcons({ featherAirplay, featherSun, featherMoon, heroSun, heroMoon, simpleWhatsapp })
    ),
    // Loads the saved light/dark stylesheet before first render (prevents a theme flash).
    AppInitializerProvider,
  ]);
}
