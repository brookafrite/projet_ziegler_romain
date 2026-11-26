import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { Store } from '@ngxs/store';

import { AuthState } from '../states/auth/auth.state';

/**
 * Garde de route (canMatch) : page réservée aux administrateurs, d'après le store NGXS.
 * canMatch est évalué avant le chargement à la demande : si l'utilisateur n'est pas admin,
 * le code de la page n'est même pas téléchargé.
 * - visiteur non connecté → connexion, puis retour sur la page demandée ;
 * - utilisateur connecté mais pas admin → liste des pollutions.
 */
export const adminGuard: CanMatchFn = (_route, segments) => {
  const store = inject(Store);
  const router = inject(Router);

  if (store.selectSnapshot(AuthState.isAdmin)) return true;
  if (!store.selectSnapshot(AuthState.isAuthenticated)) {
    const retour = '/' + segments.map((segment) => segment.path).join('/');
    return router.createUrlTree(['/connexion'], { queryParams: { retour } });
  }
  return router.createUrlTree(['/pollutions']);
};
