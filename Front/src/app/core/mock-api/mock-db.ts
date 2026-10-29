import { Pollution } from '../../pollution/models/pollution.model';

/** Utilisateur tel qu'il est stocké par le faux backend (avec son mot de passe). */
export interface StoredUser {
  id: number;
  login: string;
  password: string;
  nom: string;
  prenom: string;
  email: string;
}

interface MockData {
  pollutions: Pollution[];
  users: StoredUser[];
}

const STORAGE_KEY = 'carnet-de-terrain-mock-db';

/** Quelques pollutions pour ne pas démarrer avec une liste vide. */
const SEED: MockData = {
  pollutions: [
    {
      id: 1,
      titre: 'Bidons abandonnés au bord du canal',
      type: 'Chimique',
      description: 'Trois bidons de 20 L, dont un percé. Odeur de solvant.',
      dateObservation: '2026-10-02',
      lieu: 'Canal de Jonage, berge nord',
      latitude: 45.7951,
      longitude: 4.9822,
      photoUrl: null,
    },
    {
      id: 2,
      titre: 'Sacs plastiques dans la haie',
      type: 'Plastique',
      description: 'Une vingtaine de sacs accrochés aux branches après le vent.',
      dateObservation: '2026-10-09',
      lieu: 'Parc de la Feyssine',
      latitude: 45.7838,
      longitude: 4.8711,
      photoUrl: null,
    },
    {
      id: 3,
      titre: 'Gravats sur le chemin forestier',
      type: 'Dépôt sauvage',
      description: 'Tas de gravats et de plaques de plâtre, environ 2 m³.',
      dateObservation: '2026-09-21',
      lieu: 'Forêt de Ménival, entrée sud',
      latitude: 45.7466,
      longitude: 4.7768,
      photoUrl: null,
    },
    {
      id: 4,
      titre: 'Mousse suspecte sur la rivière',
      type: 'Eau',
      description: 'Mousse blanche épaisse sur une cinquantaine de mètres.',
      dateObservation: '2026-10-14',
      lieu: 'Le Rhône, quai Perrache',
      latitude: 45.7421,
      longitude: 4.8183,
      photoUrl: null,
    },
  ],
  users: [],
};

/**
 * Fausse base de données du backend simulé.
 * Les données sont gardées dans le localStorage du navigateur, pour
 * survivre à un rechargement de la page.
 */
export class MockDb {
  private data: MockData = this.load();

  get pollutions(): Pollution[] {
    return this.data.pollutions;
  }

  get users(): StoredUser[] {
    return this.data.users;
  }

  /** Prochain identifiant libre dans une liste. */
  nextId(items: { id?: number }[]): number {
    return Math.max(0, ...items.map((item) => item.id ?? 0)) + 1;
  }

  save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // Stockage indisponible (navigation privée...) : les données restent en mémoire
    }
  }

  private load(): MockData {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved) as MockData;
    } catch {
      // Données illisibles : on repart des données de départ
    }
    return structuredClone(SEED);
  }
}
