import { formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, LOCALE_ID, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { Pollution } from '../pollutions/models/pollution.model';
import { PollutionService } from '../pollutions/services/pollution.service';
import { ForestTree, plantTrees } from './forest-layout';

/**
 * Page « La forêt » : chaque pollution nettoyée fait pousser un arbre.
 * Le paysage est un dessin SVG ; la place de chaque arbre vient de plantTrees().
 */
@Component({
  selector: 'app-forest',
  imports: [RouterLink],
  templateUrl: './forest.component.html',
  styleUrl: './forest.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForestComponent implements OnInit {
  private readonly pollutionService = inject(PollutionService);
  private readonly router = inject(Router);
  private readonly locale = inject(LOCALE_ID);

  readonly pollutions = signal<Pollution[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  /** Les arbres, recalculés si la liste change. */
  readonly trees = computed(() => plantTrees(this.pollutions()));

  /** Compteurs par statut, et part des pollutions déjà nettoyées. */
  readonly counts = computed(() => {
    const all = this.pollutions();
    const count = (statut: string) => all.filter((p) => (p.statut ?? 'signalee') === statut).length;
    const cleaned = count('nettoyee');
    return {
      total: all.length,
      cleaned,
      inProgress: count('en-cours'),
      reported: count('signalee'),
      percent: all.length ? Math.round((cleaned / all.length) * 100) : 0,
    };
  });

  /** Quelques étoiles, visibles seulement la nuit (thème sombre). */
  readonly stars = [
    [80, 40], [190, 90], [260, 30], [380, 70], [470, 25], [560, 95], [650, 45], [720, 110], [880, 60], [950, 30],
  ];

  ngOnInit(): void {
    this.pollutionService.getAll().subscribe({
      next: (pollutions) => {
        this.pollutions.set(pollutions);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('La forêt n’a pas pu être chargée.');
        this.loading.set(false);
      },
    });
  }

  /** Texte d'un arbre (infobulle et lecteurs d'écran) : « Bidons au canal », Lyon, nettoyée le 3 novembre 2026. */
  label(tree: ForestTree): string {
    const { titre, lieu, dateNettoyage } = tree.pollution;
    const cleaned = dateNettoyage ? `, nettoyée le ${formatDate(dateNettoyage, 'longDate', this.locale)}` : '';
    return `« ${titre} », ${lieu}${cleaned}`;
  }

  open(tree: ForestTree): void {
    this.router.navigate(['/pollutions', tree.pollution.id]);
  }
}
