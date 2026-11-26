import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * Garde de route (canActivate) : page réservée aux utilisateurs connectés.
 * Un visiteur est envoyé vers la connexion, avec l'adresse demandée dans ?retour=…
 * pour y revenir automatiquement une fois connecté.
 */
export const authGuard: CanActivateFn = (_route, state) =>
  inject(AuthService).isLoggedIn()
    ? true
    : inject(Router).createUrlTree(['/connexion'], { queryParams: { retour: state.url } });
