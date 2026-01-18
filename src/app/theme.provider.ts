import { inject } from '@angular/core';
import { ThemeService } from './services/theme.service';

export function themeProviderFactory(themeService: ThemeService): () => Promise<Event> {
  return () => themeService.loadTheme();
}
