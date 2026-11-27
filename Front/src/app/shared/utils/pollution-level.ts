/** Niveaux de dangerosité, du plus faible au plus fort, plus le cas « non évalué ». */
export type PollutionLevel = 'Non évalué' | 'Faible' | 'Modérée' | 'Élevée' | 'Dangereuse';

/**
 * Traduit un indice de dangerosité en niveau.
 * Les seuils ne sont écrits qu'ici : la pipe et la directive s'en servent toutes les deux.
 */
export function pollutionLevel(indice: number | null | undefined): PollutionLevel {
  if (indice === null || indice === undefined) return 'Non évalué';
  if (indice <= 20) return 'Faible';
  if (indice <= 50) return 'Modérée';
  if (indice <= 100) return 'Élevée';
  return 'Dangereuse';
}

/**
 * Les niveaux dans l'ordre, chacun avec sa valeur dans l'adresse (?niveau=elevee) :
 * sans accent ni espace, pour une adresse lisible.
 */
export const POLLUTION_LEVELS: readonly { value: string; label: PollutionLevel; min: number | null }[] = [
  // min : premier indice du niveau (sert d'exemple pour colorer un badge de légende)
  { value: 'non-evalue', label: 'Non évalué', min: null },
  { value: 'faible', label: 'Faible', min: 0 },
  { value: 'moderee', label: 'Modérée', min: 21 },
  { value: 'elevee', label: 'Élevée', min: 51 },
  { value: 'dangereuse', label: 'Dangereuse', min: 101 },
];
