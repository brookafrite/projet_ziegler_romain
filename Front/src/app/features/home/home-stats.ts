import { Pollution } from '../pollutions/models/pollution.model';
import { POLLUTION_LEVELS, pollutionLevel } from '../../shared/utils/pollution-level';

/** Un niveau de dangerosité, avec son nombre de pollutions (pour les barres de l'accueil). */
export interface LevelCount {
  value: string; // valeur dans l'adresse : ?niveau=elevee
  label: string;
  min: number | null;
  count: number;
  percent: number; // largeur de la barre, par rapport au niveau le plus fréquent
}

/** Les chiffres de la page d'accueil. */
export interface HomeStats {
  total: number;
  cleaned: number;
  inProgress: number;
  reported: number;
  thisMonth: number; // observées pendant le mois en cours
  percentCleaned: number;
  levels: LevelCount[];
  latest: Pollution[]; // les 3 observations les plus récentes
}

/** AAAA-MM du jour, en heure locale. */
function currentMonth(today: Date): string {
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Calcule tous les chiffres de l'accueil à partir de la liste des pollutions.
 * Fonction pure (la date du jour est un paramètre) : facile à tester.
 */
export function homeStats(pollutions: readonly Pollution[], today = new Date()): HomeStats {
  const count = (statut: string) => pollutions.filter((p) => (p.statut ?? 'signalee') === statut).length;
  const cleaned = count('nettoyee');
  const month = currentMonth(today);

  const levelCounts = POLLUTION_LEVELS.map((level) => ({
    ...level,
    count: pollutions.filter((p) => pollutionLevel(p.indice) === level.label).length,
  }));
  const maxCount = Math.max(1, ...levelCounts.map((level) => level.count));

  return {
    total: pollutions.length,
    cleaned,
    inProgress: count('en-cours'),
    reported: count('signalee'),
    thisMonth: pollutions.filter((p) => p.dateObservation.startsWith(month)).length,
    percentCleaned: pollutions.length ? Math.round((cleaned / pollutions.length) * 100) : 0,
    levels: levelCounts.map((level) => ({ ...level, percent: Math.round((level.count / maxCount) * 100) })),
    // Copie avant le tri : on ne modifie jamais la liste reçue
    latest: [...pollutions]
      .sort((a, b) => b.dateObservation.localeCompare(a.dateObservation) || (b.id ?? 0) - (a.id ?? 0))
      .slice(0, 3),
  };
}
