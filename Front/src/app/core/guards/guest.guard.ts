import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngxs/store';

import { AuthState } from '../states/auth/auth.state';

/**
 * Garde de route : les pages Connexion et Créer un compte sont réservées aux visiteurs
 * non connectés. Un utilisateur déjà connecté (d'après le store) est renvoyé vers la liste.
 */
export const guestGuard: CanActivateFn = () =>
  inject(Store).selectSnapshot(AuthState.isAuthenticated) ? inject(Router).parseUrl('/pollutions') : true;
