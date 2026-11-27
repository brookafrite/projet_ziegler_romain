import { formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, LOCALE_ID, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';

import { Pollution } from '../pollutions/models/pollution.model';
import { ForestTree, plantTrees } from './forest-layout';

/**
 * Le paysage de la forêt (dessin SVG) : chaque pollution nettoyée y fait pousser un arbre.
 * Composant réutilisable : il reçoit les pollutions en entrée, et place lui-même les arbres
 * avec plantTrees(). Utilisé au cœur de la page d'accueil.
 */
@Component({
  selector: 'app-forest-landscape',
  templateUrl: './forest-landscape.component.html',
  styleUrl: './forest-landscape.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForestLandscapeComponent {
  private readonly router = inject(Router);
  private readonly locale = inject(LOCALE_ID);

  /** Toutes les pollutions : seules les nettoyées deviennent des arbres. */
  readonly pollutions = input.required<readonly Pollution[]>();

  /** Les arbres, recalculés si la liste change. */
  readonly trees = computed(() => plantTrees(this.pollutions()));

  /** Quelques étoiles, visibles seulement la nuit (thème sombre). */
  readonly stars = [
    [80, 40], [190, 90], [260, 30], [380, 70], [470, 25], [560, 95], [650, 45], [720, 110], [880, 60], [950, 30],
  ];

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
