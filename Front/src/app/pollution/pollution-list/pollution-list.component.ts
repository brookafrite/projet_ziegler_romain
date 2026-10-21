import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { POLLUTION_TYPES, Pollution, PollutionType } from '../models/pollution.model';
import { PollutionService } from '../services/pollution.service';

/** Minuscules et sans accents, pour une recherche plus tolérante (« depot » trouve « Dépôt »). */
function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

@Component({
  selector: 'app-pollution-list',
  imports: [FormsModule, RouterLink],
  templateUrl: './pollution-list.component.html',
  styleUrl: './pollution-list.component.css',
})
export class PollutionListComponent implements OnInit {
  private readonly pollutionService = inject(PollutionService);

  readonly types = POLLUTION_TYPES;

  // Données reçues de l'API et état de l'écran
  readonly pollutions = signal<Pollution[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly deletingId = signal<number | null>(null);

  // Critères de filtre
  readonly search = signal('');
  readonly type = signal<PollutionType | ''>('');
  readonly from = signal(''); // date de début, AAAA-MM-JJ
  readonly to = signal(''); // date de fin, AAAA-MM-JJ

  /** Liste affichée : recalculée automatiquement dès qu'un filtre ou la liste change. */
  readonly filtered = computed(() => {
    const search = normalize(this.search().trim());
    const type = this.type();
    const from = this.from();
    const to = this.to();

    return this.pollutions()
      .filter((p) => !type || p.type === type)
      // Les dates AAAA-MM-JJ se comparent directement comme du texte
      .filter((p) => !from || p.dateObservation >= from)
      .filter((p) => !to || p.dateObservation <= to)
      .filter((p) => !search || normalize(`${p.titre} ${p.type} ${p.lieu} ${p.description}`).includes(search))
      .sort((a, b) => b.dateObservation.localeCompare(a.dateObservation)); // plus récentes d'abord
  });

  readonly hasFilters = computed(() => !!(this.search() || this.type() || this.from() || this.to()));

  ngOnInit(): void {
    this.pollutionService.getAll().subscribe({
      next: (pollutions) => {
        this.pollutions.set(pollutions);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('La liste des pollutions n’a pas pu être chargée.');
        this.loading.set(false);
      },
    });
  }

  resetFilters(): void {
    this.search.set('');
    this.type.set('');
    this.from.set('');
    this.to.set('');
  }

  remove(pollution: Pollution): void {
    if (pollution.id == null) return;
    if (!confirm(`Supprimer « ${pollution.titre} » ? Cette action est définitive.`)) return;

    const id = pollution.id;
    this.deletingId.set(id);
    this.errorMessage.set(null);

    this.pollutionService.delete(id).subscribe({
      next: () => {
        // On retire la pollution de la liste locale : pas besoin de tout recharger
        this.pollutions.update((list) => list.filter((p) => p.id !== id));
        this.deletingId.set(null);
      },
      error: () => {
        this.errorMessage.set(`« ${pollution.titre} » n’a pas pu être supprimée.`);
        this.deletingId.set(null);
      },
    });
  }

  formatDate(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
}
