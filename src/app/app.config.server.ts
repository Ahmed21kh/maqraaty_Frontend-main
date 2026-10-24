import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { appConfig } from './app.config';
import { WhatsappInitializerProvider } from './core/initializers/whatsapp.initializer';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideHttpClient(withFetch()),
    WhatsappInitializerProvider,
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
