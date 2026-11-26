import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * Garde de route : les pages Connexion et Créer un compte sont réservées aux visiteurs
 * non connectés. Un utilisateur déjà connecté est renvoyé vers la liste des pollutions.
 */
export const guestGuard: CanActivateFn = () =>
  inject(AuthService).isLoggedIn() ? inject(Router).parseUrl('/pollutions') : true;
