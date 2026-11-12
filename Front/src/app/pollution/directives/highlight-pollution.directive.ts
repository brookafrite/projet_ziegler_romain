import { Directive, computed, input } from '@angular/core';

import { PollutionLevel, pollutionLevel } from '../models/pollution-level';

/** Couleur de fond, et de texte pour rester lisible, de chaque niveau. */
const COLORS: Record<PollutionLevel, { background: string; text: string }> = {
  'Non évalué': { background: '#e7e5e0', text: '#4a4a45' }, // gris
  Faible: { background: '#d3f2d0', text: '#1d4d1a' }, // vert clair
  Modérée: { background: '#fff09a', text: '#5a4a00' }, // jaune
  Élevée: { background: '#ffbe7a', text: '#6b3300' }, // orange
  Dangereuse: { background: '#c62828', text: '#ffffff' }, // rouge
};

/**
 * Directive d'attribut : colore le fond d'un élément selon le niveau de dangerosité.
 * Utilisation : <span [appHighlightPollution]="pollution.indice">…</span>
 */
@Directive({
  selector: '[appHighlightPollution]',
  // Angular applique ces styles à l'élément qui porte la directive
  host: {
    '[style.background-color]': 'colors().background',
    '[style.color]': 'colors().text',
    '[style.border-color]': 'colors().background',
  },
})
export class HighlightPollutionDirective {
  /** Indice reçu par l'attribut, null = non évalué. */
  readonly indice = input<number | null | undefined>(null, { alias: 'appHighlightPollution' });

  /** Recalculé uniquement quand l'indice change. */
  protected readonly colors = computed(() => COLORS[pollutionLevel(this.indice())]);
}
