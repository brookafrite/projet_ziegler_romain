import { Component, ChangeDetectionStrategy, OnInit, computed, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HighlightPollutionDirective } from '../../../shared/directives/highlight-pollution.directive';
import { POLLUTION_TYPES, Pollution } from '../models/pollution.model';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { PollutionService } from '../services/pollution.service';
import { PollutionLevelPipe } from '../../../shared/pipes/pollution-level.pipe';
import { POLLUTION_LEVELS, pollutionLevel } from '../../../shared/utils/pollution-level';

/** Nom des critères de filtre, tels qu'ils apparaissent dans l'adresse (?recherche=…&type=…). */
type FilterName = 'recherche' | 'type' | 'du' | 'au' | 'niveau' | 'auteur' | 'tri';

/** Ordres de tri proposés, avec leur valeur dans l'adresse (?tri=…). Vide : l'ordre par défaut. */
const SORTS = [
  { value: '', label: 'Plus récentes d’abord' },
  { value: 'anciennes', label: 'Plus anciennes d’abord' },
  { value: 'dangereuses', label: 'Plus dangereuses d’abord' },
  { value: 'moins-dangereuses', label: 'Moins dangereuses d’abord' },
];

/** Plus récente d'abord (les dates AAAA-MM-JJ se comparent comme du texte). */
function byDate(a: Pollution, b: Pollution): number {
  return b.dateObservation.localeCompare(a.dateObservation);
}

/** Compare deux pollutions selon l'ordre choisi ; à égalité, la plus récente d'abord. */
function compare(a: Pollution, b: Pollution, tri: string | undefined): number {
  if (tri === 'anciennes') return byDate(b, a);
  if (tri === 'dangereuses' || tri === 'moins-dangereuses') {
    // Les pollutions non évaluées vont toujours à la fin, quel que soit le sens
    const aMissing = a.indice == null ? 1 : 0;
    const bMissing = b.indice == null ? 1 : 0;
    if (aMissing || bMissing) return aMissing - bMissing || byDate(a, b);
    const gap = tri === 'dangereuses' ? b.indice! - a.indice! : a.indice! - b.indice!;
    return gap || byDate(a, b);
  }
  return byDate(a, b);
}

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
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly types = POLLUTION_TYPES;
  readonly levels = POLLUTION_LEVELS;
  readonly sorts = SORTS;

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
  readonly tri = input<string>(); // ordre d'affichage (voir SORTS)
  readonly auteur = input<string>(); // « moi » : seulement les pollutions de l'utilisateur connecté

  /** Id de l'utilisateur dont on affiche les pollutions (?auteur=moi), ignoré si personne n'est connecté. */
  private readonly onlyAuthorId = computed(() =>
    this.auteur() === 'moi' ? this.authService.currentUser()?.id : undefined,
  );

  /** Liste affichée : recalculée automatiquement dès qu'un filtre ou la liste change. */
  readonly filtered = computed(() => {
    const search = normalize((this.recherche() ?? '').trim());
    const type = this.type();
    const from = this.du();
    const to = this.au();
    // Même calcul que le badge de chaque pollution : pollutionLevel(), les seuils sont au même endroit
    const level = POLLUTION_LEVELS.find((l) => l.value === this.niveau())?.label;
    const tri = this.tri();
    const authorId = this.onlyAuthorId();

    return this.pollutions()
      .filter((p) => !type || p.type === type)
      .filter((p) => !level || pollutionLevel(p.indice) === level)
      .filter((p) => authorId === undefined || p.auteurId === authorId)
      // Les dates AAAA-MM-JJ se comparent directement comme du texte
      .filter((p) => !from || p.dateObservation >= from)
      .filter((p) => !to || p.dateObservation <= to)
      .filter((p) => !search || normalize(`${p.titre} ${p.type} ${p.lieu} ${p.description}`).includes(search))
      // filter() a déjà créé un nouveau tableau : sort() ne modifie pas la liste reçue de l'API
      .sort((a, b) => compare(a, b, tri));
  });

  readonly hasFilters = computed(
    () =>
      !!(this.recherche() || this.type() || this.du() || this.au() || this.niveau()) ||
      this.onlyAuthorId() !== undefined,
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
    // On efface les critères, mais on garde l'ordre de tri choisi
    this.router.navigate([], { relativeTo: this.route, queryParams: { tri: this.tri() || null }, replaceUrl: true });
  }

  remove(pollution: Pollution): void {
    if (pollution.id == null) return;
    if (!confirm(`Supprimer « ${pollution.titre} » ? Cette action est définitive.`)) return;

    const id = pollution.id;
    this.deletingId.set(id);

    this.pollutionService.delete(id).subscribe({
      next: () => {
        // On retire la pollution de la liste locale : pas besoin de tout recharger
        this.pollutions.update((list) => list.filter((p) => p.id !== id));
        this.deletingId.set(null);
        this.toastService.success(`« ${pollution.titre} » a été supprimée.`);
      },
      error: () => {
        this.toastService.error(`« ${pollution.titre} » n’a pas pu être supprimée.`);
        this.deletingId.set(null);
      },
    });
  }
}
