import { HttpErrorResponse } from '@angular/common/http';
import { Component, ChangeDetectionStrategy, Input, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { POLLUTION_STATUTS, Pollution, PollutionStatut } from '../models/pollution.model';
import { Store } from '@ngxs/store';
import { AuthState } from '../../../core/states/auth/auth.state';
import { ConfirmService } from '../../../core/services/confirm.service';
import { ToastService } from '../../../core/services/toast.service';
import { PollutionService } from '../services/pollution.service';
import { PollutionRecapComponent } from '../pollution-recap/pollution-recap.component';

/** Page de détail d'une pollution : /pollutions/:id */
@Component({
  selector: 'app-pollution-detail',
  imports: [PollutionRecapComponent, RouterLink],
  templateUrl: './pollution-detail.component.html',
  styleUrl: './pollution-detail.component.css',
  // Rafraîchi seulement si une entrée, un signal ou un événement du composant change
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollutionDetailComponent implements OnInit {
  private readonly pollutionService = inject(PollutionService);
  /** Règle « auteur ou admin », lue dans le store NGXS. */
  protected readonly canManage = inject(Store).selectSignal(AuthState.canManage);
  /** Seul un admin change l'avancement du traitement. */
  protected readonly isAdmin = inject(Store).selectSignal(AuthState.isAdmin);
  private readonly toastService = inject(ToastService);
  private readonly confirmService = inject(ConfirmService);
  private readonly router = inject(Router);

  /** Paramètre :id de l'URL, transmis par le routeur (withComponentInputBinding). */
  @Input({ required: true }) id!: string;

  readonly pollution = signal<Pollution | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly deleting = signal(false);
  readonly savingStatut = signal(false);

  /** Boutons de changement de statut : un par statut, avec le texte de l'action. */
  readonly statutActions: readonly { value: PollutionStatut; label: string }[] = [
    { value: 'en-cours', label: 'Prendre en charge' },
    { value: 'nettoyee', label: 'Marquer comme nettoyée' },
    { value: 'signalee', label: 'Remettre à « Signalée »' },
  ];
  readonly statuts = POLLUTION_STATUTS;

  ngOnInit(): void {
    this.pollutionService.getById(Number(this.id)).subscribe({
      next: (pollution) => {
        this.pollution.set(pollution);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage.set(
          err.status === 404
            ? 'Cette pollution n’existe pas ou a été supprimée.'
            : 'La pollution n’a pas pu être chargée.',
        );
        this.loading.set(false);
      },
    });
  }

  async remove(pollution: Pollution): Promise<void> {
    const confirmed = await this.confirmService.ask({
      title: 'Supprimer ce signalement ?',
      message: `« ${pollution.titre} » sera supprimée définitivement.`,
      confirmLabel: 'Supprimer',
      danger: true,
    });
    if (!confirmed) return;

    this.deleting.set(true);
    this.pollutionService.delete(Number(this.id)).subscribe({
      next: () => {
        this.toastService.success(`« ${pollution.titre} » a été supprimée.`);
        this.router.navigate(['/pollutions']);
      },
      error: () => {
        this.toastService.error('La pollution n’a pas pu être supprimée.');
        this.deleting.set(false);
      },
    });
  }

  /** Admin : change le statut, puis affiche la pollution renvoyée par l'API. */
  changeStatut(pollution: Pollution, statut: PollutionStatut): void {
    this.savingStatut.set(true);
    this.pollutionService.updateStatut(pollution.id!, statut).subscribe({
      next: (updated) => {
        this.pollution.set(updated);
        this.savingStatut.set(false);
        this.toastService.success(
          statut === 'nettoyee'
            ? 'Pollution nettoyée : un nouvel arbre pousse dans la forêt.'
            : 'Statut mis à jour.',
        );
      },
      error: () => {
        this.savingStatut.set(false);
        this.toastService.error('Le statut n’a pas pu être changé.');
      },
    });
  }
}
