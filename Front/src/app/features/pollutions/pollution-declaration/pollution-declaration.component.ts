import { Component, ChangeDetectionStrategy, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HasUnsavedChanges } from '../../../core/guards/unsaved-changes.guard';
import { AuthService } from '../../../core/services/auth.service';
import { Pollution } from '../models/pollution.model';
import { PollutionService } from '../services/pollution.service';
import { PollutionFormComponent } from '../pollution-form/pollution-form.component';
import { PollutionRecapComponent } from '../pollution-recap/pollution-recap.component';

/**
 * Page « Signaler une pollution » : affiche soit le formulaire, soit le
 * récapitulatif de la pollution créée par l'API, sur la même page.
 */
@Component({
  selector: 'app-pollution-declaration',
  imports: [PollutionFormComponent, PollutionRecapComponent, RouterLink],
  templateUrl: './pollution-declaration.component.html',
  // Rafraîchi seulement si une entrée, un signal ou un événement du composant change
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollutionDeclarationComponent implements HasUnsavedChanges {
  private readonly pollutionService = inject(PollutionService);
  private readonly authService = inject(AuthService);

  readonly declaration = signal<Pollution | null>(null);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  /** Le formulaire affiché (absent une fois la pollution enregistrée). */
  private readonly form = viewChild(PollutionFormComponent);

  hasUnsavedChanges(): boolean {
    return this.form()?.isDirty() ?? false;
  }

  onDeclared(pollution: Pollution): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    // L'auteur est l'utilisateur connecté (la page est protégée par authGuard)
    const auteurId = this.authService.currentUser()?.id ?? null;
    this.pollutionService.create({ ...pollution, auteurId }).subscribe({
      next: (saved) => {
        this.declaration.set(saved);
        this.saving.set(false);
        window.scrollTo({ top: 0 });
      },
      error: () => {
        this.errorMessage.set("Le signalement n'a pas pu être enregistré. Réessayez.");
        this.saving.set(false);
      },
    });
  }

  reset(): void {
    this.declaration.set(null);
  }
}
