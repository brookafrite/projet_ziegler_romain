import { HttpErrorResponse } from '@angular/common/http';
import { Component, ChangeDetectionStrategy, Input, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Pollution } from '../models/pollution.model';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { ToastService } from '../../../core/services/toast.service';
import { PollutionService } from '../services/pollution.service';
import { PollutionRecapComponent } from '../pollution-recap/pollution-recap.component';

/** Page de détail d'une pollution : /pollutions/:id */
@Component({
  selector: 'app-pollution-detail',
  imports: [PollutionRecapComponent, RouterLink],
  templateUrl: './pollution-detail.component.html',
  // Rafraîchi seulement si une entrée, un signal ou un événement du composant change
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollutionDetailComponent implements OnInit {
  private readonly pollutionService = inject(PollutionService);
  protected readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly confirmService = inject(ConfirmService);
  private readonly router = inject(Router);

  /** Paramètre :id de l'URL, transmis par le routeur (withComponentInputBinding). */
  @Input({ required: true }) id!: string;

  readonly pollution = signal<Pollution | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly deleting = signal(false);

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
}
