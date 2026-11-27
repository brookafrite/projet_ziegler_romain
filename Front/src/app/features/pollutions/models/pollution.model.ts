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

/** Avancement du traitement d'une pollution, changé par un admin. */
export type PollutionStatut = 'signalee' | 'en-cours' | 'nettoyee';

/** Les statuts dans l'ordre, avec leur libellé (la valeur sert aussi dans l'adresse : ?statut=nettoyee). */
export const POLLUTION_STATUTS: readonly { value: PollutionStatut; label: string }[] = [
  { value: 'signalee', label: 'Signalée' },
  { value: 'en-cours', label: 'En cours' },
  { value: 'nettoyee', label: 'Nettoyée' },
];

/** Libellé d'un statut (« Nettoyée »), « Signalée » par défaut. */
export function statutLabel(statut: PollutionStatut | undefined): string {
  return POLLUTION_STATUTS.find((s) => s.value === statut)?.label ?? 'Signalée';
}

/** Auteur d'une pollution, tel que l'API le renvoie : juste de quoi afficher son nom. */
export interface PollutionAuthor {
  id: number;
  prenom: string;
  nom: string;
}

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
  indice?: number | null; // indice de dangerosité (entier >= 0), null = non évalué
  auteurId?: number | null; // utilisateur qui l'a publiée, null = auteur inconnu
  auteur?: PollutionAuthor | null; // renvoyé par l'API avec la pollution
  statut?: PollutionStatut; // « signalee » à la création
  dateNettoyage?: string | null; // AAAA-MM-JJ, quand la pollution est passée à « nettoyee »
}
