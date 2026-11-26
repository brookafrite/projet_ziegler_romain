import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';

import { ConfirmService } from '../services/confirm.service';

/** Une page protégée par ce guard indique si elle contient une saisie non enregistrée. */
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

/**
 * Garde de route (canDeactivate) : avant de quitter une page, demande confirmation
 * si la saisie n'a pas été enregistrée, pour ne pas la perdre par erreur.
 */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) =>
  !component.hasUnsavedChanges() ||
  // Une Promise : le routeur attend la réponse avant de quitter (ou non) la page
  inject(ConfirmService).ask({
    title: 'Quitter cette page ?',
    message: 'Votre saisie n’est pas enregistrée : elle sera perdue si vous quittez la page.',
    confirmLabel: 'Quitter la page',
  });
