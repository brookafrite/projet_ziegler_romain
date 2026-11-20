import { CanDeactivateFn } from '@angular/router';

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
  confirm('Votre saisie n’est pas enregistrée. Quitter quand même cette page ?');
