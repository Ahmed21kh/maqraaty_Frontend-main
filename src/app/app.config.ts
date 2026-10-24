import { ApplicationConfig } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withPreloading, withViewTransitions, PreloadAllModules } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { routes } from './app.routes';
import { provideCore } from './core/providers/core.providers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      // Lazy chunks load in the background right after first paint, so navigation feels instant.
      withPreloading(PreloadAllModules),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
      // Cross-fades the old page into the new one (styles: theme/styles/_motion.scss, which also switches
      // it off for "reduce motion"). Browsers without the View Transitions API simply navigate instantly.
      withViewTransitions({
        onViewTransitionCreated: ({ transition }) => {
          // While the page is frozen for a transition the collapsed sidebar's flyout menu does not get to
          // close after one of its items is clicked, so navigate instantly when that flyout is open.
          if (document.querySelector('.ant-menu-submenu-popup:not(.ant-menu-submenu-hidden)')) {
            const ignore = () => undefined; // skipping rejects `ready` with an AbortError — expected here
            transition.ready.catch(ignore);
            transition.finished.catch(ignore);
            transition.updateCallbackDone.catch(ignore);
            transition.skipTransition();
          }
        },
      })
    ),
    provideClientHydration(),
    provideCore(),
  ],
};
