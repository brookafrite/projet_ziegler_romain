import { Injectable, signal } from '@angular/core';

/** La question posée dans la fenêtre de confirmation. */
export interface ConfirmOptions {
  title: string;
  message: string;
  /** Texte du bouton qui confirme (« Supprimer », « Quitter la page »…). */
  confirmLabel: string;
  /** Bouton rouge pour une action destructrice (suppression). */
  danger?: boolean;
}

interface PendingQuestion extends ConfirmOptions {
  resolve: (answer: boolean) => void;
}

/**
 * Remplace le confirm() du navigateur par une fenêtre aux couleurs du site.
 * ask() renvoie une Promise : la page attend la réponse (await) avant de continuer.
 * Le composant ConfirmDialog (dans app.html) affiche la question en cours.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly pending = signal<PendingQuestion | null>(null);

  /** Question affichée en ce moment, ou null. */
  readonly question = this.pending.asReadonly();

  ask(options: ConfirmOptions): Promise<boolean> {
    this.pending()?.resolve(false); // une seule question à la fois : l'ancienne vaut « non »
    return new Promise((resolve) => this.pending.set({ ...options, resolve }));
  }

  /** Appelé par la fenêtre : true = confirmer, false = annuler (bouton, Échap ou clic à côté). */
  answer(confirmed: boolean): void {
    const question = this.pending();
    this.pending.set(null);
    question?.resolve(confirmed);
  }
}
