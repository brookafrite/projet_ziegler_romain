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
export function seededRandom(seed: number): () => number {
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
          scale: Math.round((0.8 + depth * 0.45) * 100) / 100,
          kind: KINDS[id % KINDS.length],
          delay: index * 120,
        };
      })
      // On dessine du fond vers l'avant : les arbres proches passent devant les autres
      .sort((a, b) => a.y - b.y)
  );
}

// ---------------------------------------------------------------------------------------------
// Décor : il est toujours là, même sans aucune pollution nettoyée, pour que le paysage vive.
// Ses arbres sont dans des tons sourds et ne sont pas cliquables : on les distingue des vrais.
// ---------------------------------------------------------------------------------------------

type Point = [number, number];
/** Une colline : deux courbes de Bézier cubiques (les mêmes que les chemins SVG du dessin). */
type Hill = [Point, Point, Point, Point][];

export const BACK_HILL: Hill = [
  [[0, 250], [150, 190], [300, 230], [450, 205]],
  [[450, 205], [600, 180], [800, 240], [1000, 200]],
];
export const FRONT_HILL: Hill = [
  [[0, 290], [200, 250], [400, 300], [600, 265]],
  [[600, 265], [750, 240], [900, 280], [1000, 260]],
];

/** Hauteur (y) de la crête d'une colline à l'abscisse x, en suivant sa courbe. */
export function hillTop(hill: Hill, x: number): number {
  const curve = hill.find((c) => x <= c[3][0]) ?? hill[hill.length - 1];
  // On cherche le t de la courbe dont le x est le plus proche (60 essais suffisent ici)
  let best: Point = curve[0];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const point = bezier(curve, t);
    if (Math.abs(point[0] - x) < Math.abs(best[0] - x)) best = point;
  }
  return best[1];
}

function bezier([p0, p1, p2, p3]: [Point, Point, Point, Point], t: number): Point {
  const u = 1 - t;
  const at = (i: 0 | 1) => u * u * u * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t * t * t * p3[i];
  return [at(0), at(1)];
}

export interface DecorTree {
  x: number;
  y: number;
  scale: number;
  kind: TreeKind;
}

export interface Decor {
  /** Ligne de sapins lointains, en silhouette sur la colline du fond. */
  treeLine: { x: number; y: number; height: number }[];
  /** Arbres discrets à mi-distance, sur la crête de la colline de devant. */
  midTrees: DecorTree[];
  /** Buissons et touffes d'herbe au premier plan. */
  bushes: { x: number; y: number; scale: number }[];
  tufts: { x: number; y: number }[];
}

/** Le décor complet, toujours le même (graines fixes). */
export function buildDecor(): Decor {
  const random = seededRandom(42);

  const treeLine = [];
  for (let x = 6; x < WIDTH; x += 13 + random() * 9) {
    treeLine.push({ x: Math.round(x), y: Math.round(hillTop(BACK_HILL, x) + 6), height: Math.round(18 + random() * 16) });
  }

  const midTrees: DecorTree[] = [];
  for (let x = 25; x < WIDTH; x += 55 + random() * 60) {
    midTrees.push({
      x: Math.round(x),
      y: Math.round(hillTop(FRONT_HILL, x) + 4 + random() * 10),
      scale: Math.round((0.45 + random() * 0.2) * 100) / 100,
      kind: KINDS[Math.floor(random() * KINDS.length)],
    });
  }

  const bushes = [];
  for (let x = 15; x < WIDTH; x += 70 + random() * 90) {
    bushes.push({ x: Math.round(x), y: Math.round(410 + random() * 8), scale: Math.round((0.7 + random() * 0.6) * 100) / 100 });
  }

  const tufts = [];
  for (let i = 0; i < 26; i++) {
    const x = 10 + random() * (WIDTH - 20);
    tufts.push({ x: Math.round(x), y: Math.round(hillTop(FRONT_HILL, x) + 30 + random() * 110) });
  }

  return { treeLine, midTrees, bushes, tufts };
}
