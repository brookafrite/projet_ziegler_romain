import { ChangeDetectionStrategy, Component, ElementRef, afterRenderEffect, inject, viewChild } from '@angular/core';

import { ConfirmService } from '../../../core/services/confirm.service';

/**
 * Fenêtre de confirmation de toute l'application (placée une fois dans app.html).
 * Elle utilise l'élément <dialog> du navigateur : en mode « modal », le reste de la page est
 * bloqué, le focus reste dans la fenêtre et la touche Échap la ferme.
 */
@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  protected readonly confirmService = inject(ConfirmService);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    // Ouvre ou ferme la fenêtre selon qu'une question est en cours.
    // afterRenderEffect : après l'affichage, quand les boutons existent déjà (le focus peut aller sur « Annuler »)
    afterRenderEffect(() => {
      const dialog = this.dialog().nativeElement;
      if (this.confirmService.question() && !dialog.open) {
        dialog.showModal();
        dialog.querySelector<HTMLButtonElement>('button.secondary')?.focus();
      }
      if (!this.confirmService.question() && dialog.open) dialog.close();
    });
  }

  /** Un clic sur le fond grisé (en dehors de la fenêtre) vaut « Annuler ». */
  onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) this.confirmService.answer(false);
  }
}
