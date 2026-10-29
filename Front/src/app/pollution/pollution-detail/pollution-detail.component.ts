import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Pollution } from '../models/pollution.model';
import { PollutionService } from '../services/pollution.service';
import { PollutionRecapComponent } from '../pollution-recap/pollution-recap.component';

/** Page de détail d'une pollution : /pollutions/:id */
@Component({
  selector: 'app-pollution-detail',
  imports: [PollutionRecapComponent, RouterLink],
  templateUrl: './pollution-detail.component.html',
})
export class PollutionDetailComponent implements OnInit {
  private readonly pollutionService = inject(PollutionService);
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

  remove(pollution: Pollution): void {
    if (!confirm(`Supprimer « ${pollution.titre} » ? Cette action est définitive.`)) return;

    this.deleting.set(true);
    this.pollutionService.delete(Number(this.id)).subscribe({
      next: () => this.router.navigate(['/pollutions']),
      error: () => {
        this.errorMessage.set('La pollution n’a pas pu être supprimée.');
        this.deleting.set(false);
      },
    });
  }
}
