/** Types de pollution proposés dans la liste déroulante. */
export const POLLUTION_TYPES = [
  'Plastique',
  'Chimique',
  'Dépôt sauvage',
  'Eau',
  'Air',
  'Autre',
] as const;

export type PollutionType = (typeof POLLUTION_TYPES)[number];

/**
 * Données d'une déclaration de pollution.
 * Cette interface servira aussi de contrat avec la future API.
 */
export interface Pollution {
  id?: number; // attribué plus tard par le backend
  titre: string;
  type: PollutionType;
  description: string;
  dateObservation: string; // format AAAA-MM-JJ (valeur d'un input date)
  lieu: string;
  latitude: number;
  longitude: number;
  photoUrl?: string | null;
}
