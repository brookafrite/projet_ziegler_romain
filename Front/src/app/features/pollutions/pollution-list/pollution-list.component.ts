import { Component, ChangeDetectionStrategy, OnInit, computed, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HighlightPollutionDirective } from '../../../shared/directives/highlight-pollution.directive';
import { POLLUTION_TYPES, Pollution } from '../models/pollution.model';
import { AuthService } from '../../../core/services/auth.service';
import { PollutionService } from '../services/pollution.service';
import { PollutionLevelPipe } from '../../../shared/pipes/pollution-level.pipe';
import { POLLUTION_LEVELS, pollutionLevel } from '../../../shared/utils/pollution-level';

/** Nom des critères de filtre, tels qu'ils apparaissent dans l'adresse (?recherche=…&type=…). */
type FilterName = 'recherche' | 'type' | 'du' | 'au' | 'niveau';

/** Minuscules et sans accents, pour une recherche plus tolérante (« depot » trouve « Dépôt »). */
function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

@Component({
  selector: 'app-pollution-list',
  imports: [DatePipe, FormsModule, RouterLink, PollutionLevelPipe, HighlightPollutionDirective],
  templateUrl: './pollution-list.component.html',
  styleUrl: './pollution-list.component.css',
  // Rafraîchi seulement si une entrée, un signal ou un événement du composant change
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollutionListComponent implements OnInit {
  private readonly pollutionService = inject(PollutionService);
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly types = POLLUTION_TYPES;
  readonly levels = POLLUTION_LEVELS;

  // Données reçues de l'API et état de l'écran
  readonly pollutions = signal<Pollution[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly deletingId = signal<number | null>(null);

  // Critères de filtre, lus dans l'adresse (query params) grâce à withComponentInputBinding :
  // /pollutions?type=Chimique&du=2026-10-01 remplit type() et du(). Une recherche se partage par lien.
  readonly recherche = input<string>();
  readonly type = input<string>();
  readonly du = input<string>(); // date de début, AAAA-MM-JJ
  readonly au = input<string>(); // date de fin, AAAA-MM-JJ
  readonly niveau = input<string>(); // niveau de dangerosité : faible, moderee… (voir POLLUTION_LEVELS)

  /** Liste affichée : recalculée automatiquement dès qu'un filtre ou la liste change. */
  readonly filtered = computed(() => {
    const search = normalize((this.recherche() ?? '').trim());
    const type = this.type();
    const from = this.du();
    const to = this.au();
    // Même calcul que le badge de chaque pollution : pollutionLevel(), les seuils sont au même endroit
    const level = POLLUTION_LEVELS.find((l) => l.value === this.niveau())?.label;

    return this.pollutions()
      .filter((p) => !type || p.type === type)
      .filter((p) => !level || pollutionLevel(p.indice) === level)
      // Les dates AAAA-MM-JJ se comparent directement comme du texte
      .filter((p) => !from || p.dateObservation >= from)
      .filter((p) => !to || p.dateObservation <= to)
      .filter((p) => !search || normalize(`${p.titre} ${p.type} ${p.lieu} ${p.description}`).includes(search))
      .sort((a, b) => b.dateObservation.localeCompare(a.dateObservation)); // plus récentes d'abord
  });

  readonly hasFilters = computed(
    () => !!(this.recherche() || this.type() || this.du() || this.au() || this.niveau()),
  );

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

  /**
   * Change un critère en modifiant l'adresse : le routeur met à jour les entrées du composant,
   * et la liste se recalcule. Une valeur vide retire le paramètre de l'adresse.
   */
  setFilter(name: FilterName, value: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [name]: value || null },
      queryParamsHandling: 'merge', // garde les autres critères
      replaceUrl: true, // pas une page d'historique par lettre tapée
    });
  }

  resetFilters(): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
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
}
