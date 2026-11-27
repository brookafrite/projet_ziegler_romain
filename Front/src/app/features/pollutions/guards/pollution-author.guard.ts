import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { catchError, map, of } from 'rxjs';

import { AuthState } from '../../../core/states/auth/auth.state';
import { PollutionService } from '../services/pollution.service';

/**
 * Garde de route (canActivate) de la page Modifier : seul l'auteur du signalement ou un admin
 * peut l'ouvrir. Les autres sont renvoyés sur la fiche de la pollution.
 * Le guard charge la pollution pour connaître son auteur : il renvoie donc un Observable,
 * et le routeur attend sa réponse avant d'afficher la page.
 */
export const pollutionAuthorGuard: CanActivateFn = (route) => {
  // Règle « auteur ou admin », lue dans le store NGXS
  const canManage = inject(Store).selectSnapshot(AuthState.canManage);
  const router = inject(Router);
  const id = Number(route.paramMap.get('id'));

  return inject(PollutionService).getById(id).pipe(
    map((pollution) =>
      canManage(pollution.auteurId) ? true : router.createUrlTree(['/pollutions', id]),
    ),
    // Pollution introuvable : on laisse la page s'ouvrir, elle affiche elle-même l'erreur
    catchError(() => of(true)),
  );
};
