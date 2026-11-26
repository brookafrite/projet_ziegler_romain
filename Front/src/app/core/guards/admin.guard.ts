import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * Garde de route (canMatch) : page réservée aux administrateurs.
 * canMatch est évalué avant le chargement à la demande : si l'utilisateur n'est pas admin,
 * le code de la page n'est même pas téléchargé.
 * - visiteur non connecté → connexion, puis retour sur la page demandée ;
 * - utilisateur connecté mais pas admin → liste des pollutions.
 */
export const adminGuard: CanMatchFn = (_route, segments) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) return true;
  if (!authService.isLoggedIn()) {
    const retour = '/' + segments.map((segment) => segment.path).join('/');
    return router.createUrlTree(['/connexion'], { queryParams: { retour } });
  }
  return router.createUrlTree(['/pollutions']);
};
