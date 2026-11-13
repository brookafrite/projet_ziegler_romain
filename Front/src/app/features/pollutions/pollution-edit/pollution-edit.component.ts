import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Pollution } from '../models/pollution.model';
import { PollutionService } from '../services/pollution.service';
import { PollutionFormComponent } from '../pollution-form/pollution-form.component';

/** Page de modification : /pollutions/:id/modifier. Réutilise le formulaire du TP02. */
@Component({
  selector: 'app-pollution-edit',
  imports: [PollutionFormComponent, RouterLink],
  templateUrl: './pollution-edit.component.html',
})
export class PollutionEditComponent implements OnInit {
  private readonly pollutionService = inject(PollutionService);
  private readonly router = inject(Router);

  @Input({ required: true }) id!: string;

  readonly pollution = signal<Pollution | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.pollutionService.getById(Number(this.id)).subscribe({
      next: (pollution) => {
        this.pollution.set(pollution);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Cette pollution n’existe pas ou a été supprimée.');
        this.loading.set(false);
      },
    });
  }

  onSave(changes: Pollution): void {
    this.saving.set(true);
    this.errorMessage.set(null);

    this.pollutionService.update(Number(this.id), changes).subscribe({
      next: (saved) => this.router.navigate(['/pollutions', saved.id]),
      error: () => {
        this.errorMessage.set("Les modifications n'ont pas pu être enregistrées. Réessayez.");
        this.saving.set(false);
      },
    });
  }
}
