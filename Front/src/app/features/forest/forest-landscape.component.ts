import { NgTemplateOutlet, formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, LOCALE_ID, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';

import { Pollution } from '../pollutions/models/pollution.model';
import { ForestTree, buildDecor, buildRiver, plantTrees } from './forest-layout';

/**
 * Le paysage de la forêt (dessin SVG) : chaque pollution nettoyée y fait pousser un arbre.
 * Composant réutilisable : il reçoit les pollutions en entrée, et place lui-même les arbres
 * avec plantTrees(). Utilisé au cœur de la page d'accueil.
 */
@Component({
  selector: 'app-forest-landscape',
  imports: [NgTemplateOutlet],
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

  /** Le décor (toujours le même) : ligne d'arbres lointains, arbres discrets, buissons, herbe. */
  readonly decor = buildDecor();

  /** Toute la ligne d'arbres lointains en un seul chemin SVG (un triangle par sapin). */
  readonly treeLinePath = this.decor.treeLine
    .map(({ x, y, height }) => `M${x},${y - height} L${x - height * 0.32},${y} L${x + height * 0.32},${y} Z`)
    .join(' ');

  /** La rivière : son lit et les reflets qui coulent dessus. */
  readonly river = buildRiver();

  /** Oiseaux le jour, lucioles la nuit (chacun a son propre rythme). */
  readonly birds = [
    { y: 110, delay: 0 },
    { y: 135, delay: -9 },
    { y: 95, delay: -17 },
  ];
  readonly fireflies = [
    [120, 330], [260, 300], [340, 370], [470, 320], [590, 355], [700, 300], [790, 375], [900, 320],
  ];

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

  /** Arbre planté cette semaine : il porte une petite étoile dorée. */
  isNew(tree: ForestTree): boolean {
    const date = tree.pollution.dateNettoyage;
    if (!date) return false;
    const days = (Date.now() - new Date(date).getTime()) / 86_400_000;
    return days <= 7;
  }

  /** Décalage du balancement : les arbres ne bougent pas tous en même temps. */
  swayDelay(tree: ForestTree): number {
    return -(((tree.pollution.id ?? 0) * 700) % 4500);
  }

  open(tree: ForestTree): void {
    this.router.navigate(['/pollutions', tree.pollution.id]);
  }
}
