import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngxs/store';

import { AuthState } from '../states/auth/auth.state';

/**
 * Garde de route (canActivate) : page réservée aux utilisateurs connectés.
 * Il lit isAuthenticated dans le store NGXS (selectSnapshot : la valeur à cet instant).
 * Un visiteur est envoyé vers la connexion, avec l'adresse demandée dans ?retour=…
 * pour y revenir automatiquement une fois connecté.
 */
export const authGuard: CanActivateFn = (_route, state) =>
  inject(Store).selectSnapshot(AuthState.isAuthenticated)
    ? true
    : inject(Router).createUrlTree(['/connexion'], { queryParams: { retour: state.url } });
