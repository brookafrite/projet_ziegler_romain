import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideStore } from '@ngxs/store';
import { withNgxsStoragePlugin } from '@ngxs/storage-plugin';
import { routes } from './app.routes';
import { AuthState } from './core/states/auth/auth.state';

// Dates en français pour le pipe date (ex. « 9 octobre 2026 »)
registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // withComponentInputBinding : le paramètre :id de l'URL arrive dans un @Input() id
    // withInMemoryScrolling 'top' : chaque nouvelle page s'ouvre en haut
    // (le retour à la liste retrouve sa position grâce à ListReturnService)
    provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideHttpClient(),
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    // Store NGXS : l'état d'authentification (AuthState) est la source unique de « qui est connecté ».
    // Le StoragePlugin recopie la clé 'auth' dans le localStorage à chaque changement,
    // et la relit au démarrage : la session survit à un rafraîchissement (F5).
    provideStore([AuthState], withNgxsStoragePlugin({ keys: ['auth'] })),
  ]
};
