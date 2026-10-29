import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { mockApiInterceptor } from './core/mock-api/mock-api.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // withComponentInputBinding : le paramètre :id de l'URL arrive dans un @Input() id
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([mockApiInterceptor])),
  ]
};
