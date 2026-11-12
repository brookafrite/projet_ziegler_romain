import { PollutionCreationAttributes } from "./models/pollutions.model";

/**
 * Jeu de données inséré au premier démarrage, quand la table est vide.
 * Un indice par niveau de dangerosité : Élevée, Modérée, Faible, Dangereuse.
 */
export const POLLUTIONS_SEED: PollutionCreationAttributes[] = [
  {
    titre: "Bidons abandonnés au bord du canal",
    type: "Chimique",
    description: "Trois bidons de 20 L, dont un percé. Odeur de solvant.",
    dateObservation: "2026-10-02",
    lieu: "Canal de Jonage, berge nord",
    latitude: 45.7951,
    longitude: 4.9822,
    indice: 75
  },
  {
    titre: "Sacs plastiques dans la haie",
    type: "Plastique",
    description: "Une vingtaine de sacs accrochés aux branches après le vent.",
    dateObservation: "2026-10-09",
    lieu: "Parc de la Feyssine",
    latitude: 45.7838,
    longitude: 4.8711,
    indice: 30
  },
  {
    titre: "Gravats sur le chemin forestier",
    type: "Dépôt sauvage",
    description: "Tas de gravats et de plaques de plâtre, environ 2 m³.",
    dateObservation: "2026-09-21",
    lieu: "Forêt de Ménival, entrée sud",
    latitude: 45.7466,
    longitude: 4.7768,
    indice: 15
  },
  {
    titre: "Mousse suspecte sur la rivière",
    type: "Eau",
    description: "Mousse blanche épaisse sur une cinquantaine de mètres.",
    dateObservation: "2026-10-14",
    lieu: "Le Rhône, quai Perrache",
    latitude: 45.7421,
    longitude: 4.8183,
    indice: 120
  }
];
