import { inject } from '@angular/core';
import { ThemeService } from './theme.service';

export function themeProviderFactory(themeService: ThemeService): () => Promise<Event> {
  return () => themeService.loadTheme();
}
