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
 *
 * C'est l'algorithme « mulberry32 » : il mélange bien les bits, si bien que deux graines
 * voisines (id 1, id 2…) donnent des suites sans rapport. Un générateur plus simple
 * donnait des valeurs liées d'un id au suivant, et les arbres se rangeaient en lignes.
 */
export function seededRandom(seed: number): () => number {
  let state = Math.imul(seed, 0x9e3779b9) >>> 0; // écarte les graines voisines
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296; // un nombre entre 0 et 1
  };
}

/** Nombre d'emplacements essayés pour chaque arbre : on garde le plus éloigné des autres. */
const CANDIDATES = 10;
/**
 * La profondeur (y) ne fait que 105 px pour 920 px de large : on l'étire pour mesurer
 * les distances, sinon deux arbres l'un derrière l'autre compteraient comme « loin ».
 */
const DEPTH_STRETCH = 4;

/**
 * Plante un arbre par pollution nettoyée, dans l'ordre des nettoyages (les plus anciens
 * poussent en premier). Fonction pure : mêmes pollutions ⇒ même forêt.
 *
 * Pour que la forêt paraisse naturelle (ni lignes, ni paquets), chaque arbre tire plusieurs
 * emplacements au hasard et garde celui qui est le plus loin des arbres déjà plantés
 * (méthode du « meilleur candidat »). Un nouveau nettoyage ne déplace pas les arbres existants.
 */
export function plantTrees(pollutions: readonly Pollution[]): ForestTree[] {
  const cleaned = pollutions
    .filter((p) => p.statut === 'nettoyee')
    .sort((a, b) => (a.dateNettoyage ?? '').localeCompare(b.dateNettoyage ?? '') || (a.id ?? 0) - (b.id ?? 0));

  const placed: { x: number; y: number }[] = [];
  const trees = cleaned.map((pollution, index) => {
    const id = pollution.id ?? index;
    const random = seededRandom(id + 1);
    let best: { x: number; y: number; scale: number } | null = null;
    let bestDistance = -1;
    for (let i = 0; i < CANDIDATES; i++) {
      const x = 40 + random() * (WIDTH - 80);
      const y = GROUND_TOP + random() * (GROUND_BOTTOM - GROUND_TOP);
      const depth = (y - GROUND_TOP) / (GROUND_BOTTOM - GROUND_TOP); // 0 au fond, 1 devant
      const scale = Math.round((0.8 + depth * 0.45) * 100) / 100;
      if (inRiver(x, y, TREE_FOOT * scale)) continue; // pas d'arbre dans l'eau
      const distance = nearestDistance(placed, x, y);
      if (distance > bestDistance) {
        best = { x, y, scale };
        bestDistance = distance;
      }
    }
    // Cas très rare : tous les essais tombaient dans l'eau ; on pousse le dernier sur la rive
    if (!best) {
      const y = GROUND_TOP + random() * (GROUND_BOTTOM - GROUND_TOP);
      const scale = Math.round((0.8 + ((y - GROUND_TOP) / (GROUND_BOTTOM - GROUND_TOP)) * 0.45) * 100) / 100;
      best = { x: awayFromRiver(40 + random() * (WIDTH - 80), y, TREE_FOOT * scale), y, scale };
    }
    const tree = { x: Math.round(best.x), y: Math.round(best.y) };
    placed.push(tree);
    return { pollution, ...tree, scale: best.scale, kind: KINDS[id % KINDS.length], delay: index * 120 };
  });

  // On dessine du fond vers l'avant : les arbres proches passent devant les autres
  return trees.sort((a, b) => a.y - b.y);
}

/** Distance du point (x, y) à l'arbre déjà planté le plus proche (profondeur étirée). */
function nearestDistance(placed: readonly { x: number; y: number }[], x: number, y: number): number {
  let nearest = Infinity;
  for (const tree of placed) {
    nearest = Math.min(nearest, Math.hypot(tree.x - x, (tree.y - y) * DEPTH_STRETCH));
  }
  return nearest;
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

// ---------------------------------------------------------------------------------------------
// Rivière : elle sort de derrière la colline de devant et descend vers nous en serpentant.
// Elle est étroite au loin et s'élargit devant (perspective), comme les arbres qui grandissent.
// ---------------------------------------------------------------------------------------------

const HEIGHT = 420; // bas du dessin
const RIVER_SOURCE_X = 560; // là où elle apparaît, sur la crête
const RIVER_MOUTH_X = 300; // là où elle sort du dessin, en bas
const RIVER_SOURCE_Y = Math.round(hillTop(FRONT_HILL, RIVER_SOURCE_X)) + 1;
/** Demi-largeur de l'ombre au pied d'un arbre (taille 1) : la marge à garder avec l'eau. */
const TREE_FOOT = 22;

/** La rivière à la hauteur y : son milieu et sa demi-largeur (null au-dessus de sa source). */
export function riverAt(y: number): { center: number; half: number } | null {
  if (y < RIVER_SOURCE_Y || y > HEIGHT) return null;
  const t = (y - RIVER_SOURCE_Y) / (HEIGHT - RIVER_SOURCE_Y); // 0 à la source, 1 en bas
  return {
    // Une ligne de la source vers l'embouchure, plus une vague (sinus) pour la faire serpenter
    center: RIVER_SOURCE_X + (RIVER_MOUTH_X - RIVER_SOURCE_X) * t + 45 * Math.sin(t * Math.PI * 1.6),
    half: (6 + 64 * t ** 1.3) / 2,
  };
}

/** Vrai si le point (x, y) tombe dans l'eau, ou à moins de `margin` de la rive. */
export function inRiver(x: number, y: number, margin = 0): boolean {
  const river = riverAt(y);
  return river !== null && Math.abs(x - river.center) < river.half + margin;
}

/** Ramène x sur la rive la plus proche s'il tombe dans la rivière. */
function awayFromRiver(x: number, y: number, margin: number): number {
  const river = riverAt(y);
  if (!river || !inRiver(x, y, margin)) return x;
  const gap = river.half + margin;
  return x < river.center ? river.center - gap : river.center + gap;
}

/** Le lit de la rivière (une forme fermée) et deux reflets qui coulent sur l'eau. */
export function buildRiver(): { bed: string; shine: string[] } {
  const steps = 40;
  const ys = Array.from({ length: steps + 1 }, (_, i) => RIVER_SOURCE_Y + ((HEIGHT - RIVER_SOURCE_Y) * i) / steps);
  const point = (y: number, side: number) => {
    const { center, half } = riverAt(y)!;
    return `${round1(center + side * half)},${round1(y)}`;
  };
  // La rive gauche en descendant, puis la rive droite en remontant : on obtient le contour
  const bed = `M${ys.map((y) => point(y, -1)).join(' L')} L${[...ys].reverse().map((y) => point(y, 1)).join(' L')} Z`;
  // Les reflets commencent un peu après la source, là où l'eau est assez large
  const shine = [-0.45, 0.4].map((side) => `M${ys.slice(5).map((y) => point(y, side)).join(' L')}`);
  return { bed, shine };
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
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
  /** Roseaux au bord de la rivière. */
  reeds: { x: number; y: number }[];
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
    const tree = {
      x: Math.round(x),
      y: Math.round(hillTop(FRONT_HILL, x) + 4 + random() * 10),
      scale: Math.round((0.45 + random() * 0.2) * 100) / 100,
      kind: KINDS[Math.floor(random() * KINDS.length)],
    };
    // Rien du décor dans l'eau (on tire quand même les nombres : le reste du décor ne bouge pas)
    if (!inRiver(tree.x, tree.y, TREE_FOOT * tree.scale)) midTrees.push(tree);
  }

  const bushes = [];
  for (let x = 15; x < WIDTH; x += 70 + random() * 90) {
    const bush = { x: Math.round(x), y: Math.round(410 + random() * 8), scale: Math.round((0.7 + random() * 0.6) * 100) / 100 };
    if (!inRiver(bush.x, bush.y, 20 * bush.scale)) bushes.push(bush);
  }

  const tufts = [];
  for (let i = 0; i < 26; i++) {
    const x = 10 + random() * (WIDTH - 20);
    const y = Math.round(hillTop(FRONT_HILL, x) + 30 + random() * 110);
    if (!inRiver(x, y, 8)) tufts.push({ x: Math.round(x), y });
  }

  // Quelques roseaux posés juste au bord de l'eau, d'un côté puis de l'autre
  const reeds = [];
  for (const [y, side] of [[300, 1], [326, -1], [352, 1], [371, -1], [392, 1], [408, -1]] as const) {
    const { center, half } = riverAt(y)!;
    reeds.push({ x: Math.round(center + side * (half + 3)), y });
  }

  return { treeLine, midTrees, bushes, tufts, reeds };
}

// ---------------------------------------------------------------------------------------------
// Animaux : tous les 5 nettoyages, un animal revient dans la forêt. Ce sont des récompenses :
// les arbres comptent les pollutions, les animaux marquent les paliers franchis.
// ---------------------------------------------------------------------------------------------

export type AnimalKind = 'lapin' | 'canards' | 'renard' | 'cerf' | 'hibou' | 'papillons';

export interface ForestAnimal {
  kind: AnimalKind;
  name: string; // pour la phrase « Encore 3 nettoyages pour voir revenir un renard »
  returned: string; // pour l'infobulle
  threshold: number; // nombre de pollutions nettoyées qu'il faut atteindre
  x: number;
  y: number; // pied de l'animal
  scale: number;
  back: boolean; // vrai : dessiné derrière les arbres (le cerf, au loin sur la colline)
}

/** Un nouvel animal tous les ANIMAL_STEP nettoyages. */
export const ANIMAL_STEP = 5;

const DUCKS_Y = 396; // près de nous, là où l'eau est large : les arbres ne les cachent pas

/** Les animaux, dans l'ordre où ils reviennent. Leurs places sont fixes, hors de l'eau (sauf les canards). */
const PLACES: Omit<ForestAnimal, 'threshold'>[] = [
  { kind: 'lapin', name: 'un lapin', returned: 'Un lapin est revenu', x: 720, y: 402, scale: 1.5, back: false },
  { kind: 'canards', name: 'des canards', returned: 'Des canards sont revenus', x: Math.round(riverAt(DUCKS_Y)!.center), y: DUCKS_Y, scale: 1.4, back: false },
  { kind: 'renard', name: 'un renard', returned: 'Un renard est revenu', x: 150, y: 406, scale: 1.5, back: false },
  { kind: 'cerf', name: 'un cerf', returned: 'Un cerf est revenu', x: 880, y: Math.round(hillTop(FRONT_HILL, 880) + 14), scale: 1.1, back: true },
  { kind: 'hibou', name: 'un hibou', returned: 'Un hibou est revenu', x: 972, y: 400, scale: 1.4, back: false },
  { kind: 'papillons', name: 'des papillons', returned: 'Des papillons sont revenus', x: 600, y: 330, scale: 1.4, back: false },
];
export const ANIMALS: readonly ForestAnimal[] = PLACES.map((animal, index) => ({ ...animal, threshold: (index + 1) * ANIMAL_STEP }));

/**
 * Les animaux déjà revenus pour ce nombre de pollutions nettoyées, et le prochain à venir
 * (avec le nombre de nettoyages qui manquent). Fonction pure : facile à tester.
 */
export function animalsFor(cleaned: number): {
  animals: ForestAnimal[];
  next: { animal: ForestAnimal; remaining: number } | null;
} {
  const animals = ANIMALS.filter((animal) => cleaned >= animal.threshold);
  const coming = ANIMALS.find((animal) => cleaned < animal.threshold);
  return { animals, next: coming ? { animal: coming, remaining: coming.threshold - cleaned } : null };
}
