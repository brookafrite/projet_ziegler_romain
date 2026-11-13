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
