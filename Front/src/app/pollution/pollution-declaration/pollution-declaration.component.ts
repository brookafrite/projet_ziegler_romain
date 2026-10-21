import { Component, inject, signal } from '@angular/core';
import { Pollution } from '../models/pollution.model';
import { PollutionService } from '../services/pollution.service';
import { PollutionFormComponent } from '../pollution-form/pollution-form.component';
import { PollutionRecapComponent } from '../pollution-recap/pollution-recap.component';

/**
 * Composant parent : il affiche soit le formulaire, soit le récapitulatif,
 * sur la même page (pas de route, pas de rechargement).
 */
@Component({
  selector: 'app-pollution-declaration',
  imports: [PollutionFormComponent, PollutionRecapComponent],
  templateUrl: './pollution-declaration.component.html',
})
export class PollutionDeclarationComponent {
  private readonly pollutionService = inject(PollutionService);

  readonly declaration = signal<Pollution | null>(null);

  onDeclared(pollution: Pollution): void {
    this.pollutionService.declare(pollution).subscribe((saved) => {
      this.declaration.set(saved);
      window.scrollTo({ top: 0 });
    });
  }

  reset(): void {
    this.declaration.set(null);
  }
}
