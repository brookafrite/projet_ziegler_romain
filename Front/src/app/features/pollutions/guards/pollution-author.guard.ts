import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { PollutionService } from '../services/pollution.service';

/**
 * Garde de route (canActivate) de la page Modifier : seul l'auteur du signalement ou un admin
 * peut l'ouvrir. Les autres sont renvoyés sur la fiche de la pollution.
 * Le guard charge la pollution pour connaître son auteur : il renvoie donc un Observable,
 * et le routeur attend sa réponse avant d'afficher la page.
 */
export const pollutionAuthorGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const id = Number(route.paramMap.get('id'));

  return inject(PollutionService).getById(id).pipe(
    map((pollution) =>
      authService.canManage(pollution.auteurId) ? true : router.createUrlTree(['/pollutions', id]),
    ),
    // Pollution introuvable : on laisse la page s'ouvrir, elle affiche elle-même l'erreur
    catchError(() => of(true)),
  );
};
