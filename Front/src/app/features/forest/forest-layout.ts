import { Pollution } from '../pollutions/models/pollution.model';

export type TreeKind = 'sapin' | 'feuillu' | 'bouleau';

/** Un arbre de la forêt : une pollution nettoyée, placée dans le paysage. */
export interface ForestTree {
  pollution: Pollution;
  x: number; // position dans le dessin (0 à 1000)
  y: number; // pied de l'arbre : plus il est bas, plus il est proche
  scale: number; // taille : les arbres du fond sont plus petits (perspective)
  kind: TreeKind;
  delay: number; // en ms : les arbres poussent l'un après l'autre
}

const WIDTH = 1000;
const GROUND_TOP = 300; // ligne la plus au fond où l'on peut planter
const GROUND_BOTTOM = 405; // ligne la plus proche
const KINDS: TreeKind[] = ['sapin', 'feuillu', 'bouleau'];

/**
 * Petit générateur de nombres « au hasard » mais reproductible : la même graine donne
 * toujours la même suite. Chaque arbre garde ainsi sa place d'une visite à l'autre.
 */
function seededRandom(seed: number): () => number {
  let state = (seed * 9301 + 49297) % 233280;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

/**
 * Plante un arbre par pollution nettoyée, dans l'ordre des nettoyages (les plus anciens
 * poussent en premier). Fonction pure : mêmes pollutions ⇒ même forêt.
 */
export function plantTrees(pollutions: readonly Pollution[]): ForestTree[] {
  const cleaned = pollutions
    .filter((p) => p.statut === 'nettoyee')
    .sort((a, b) => (a.dateNettoyage ?? '').localeCompare(b.dateNettoyage ?? '') || (a.id ?? 0) - (b.id ?? 0));

  return (
    cleaned
      .map((pollution, index) => {
        const id = pollution.id ?? index;
        const random = seededRandom(id + 1);
        const x = 40 + random() * (WIDTH - 80);
        const y = GROUND_TOP + random() * (GROUND_BOTTOM - GROUND_TOP);
        const depth = (y - GROUND_TOP) / (GROUND_BOTTOM - GROUND_TOP); // 0 au fond, 1 devant
        return {
          pollution,
          x: Math.round(x),
          y: Math.round(y),
          scale: Math.round((1.15 + depth * 0.75) * 100) / 100,
          kind: KINDS[id % KINDS.length],
          delay: index * 120,
        };
      })
      // On dessine du fond vers l'avant : les arbres proches passent devant les autres
      .sort((a, b) => a.y - b.y)
  );
}
