import { Pollution } from '../pollutions/models/pollution.model';
import { ANIMALS, BACK_HILL, animalsFor, buildDecor, buildRiver, hillTop, inRiver, plantTrees, riverAt } from './forest-layout';

const base = { titre: 't', type: 'Eau', description: '', lieu: '', latitude: 0, longitude: 0, dateObservation: '2026-10-01' } as const;
const pollutions: Pollution[] = [
  { ...base, id: 1, statut: 'nettoyee', dateNettoyage: '2026-11-20' },
  { ...base, id: 2, statut: 'en-cours' },
  { ...base, id: 3, statut: 'nettoyee', dateNettoyage: '2026-11-02' },
  { ...base, id: 4 }, // sans statut : signalée
];

describe('plantTrees', () => {
  it('should plant one tree per cleaned pollution only', () => {
    expect(plantTrees(pollutions).map((t) => t.pollution.id).sort()).toEqual([1, 3]);
  });

  it('should grow the oldest cleaning first', () => {
    const first = plantTrees(pollutions).find((t) => t.delay === 0);
    expect(first?.pollution.id).toBe(3); // nettoyée le 2 novembre
  });

  it('should keep each tree at the same place from one visit to the next', () => {
    expect(plantTrees(pollutions)).toEqual(plantTrees(pollutions));
  });

  it('should stay inside the drawing and draw the back trees first', () => {
    const trees = plantTrees(pollutions);
    for (const tree of trees) {
      expect(tree.x).toBeGreaterThanOrEqual(40);
      expect(tree.x).toBeLessThanOrEqual(960);
      expect(tree.y).toBeGreaterThanOrEqual(300);
      expect(tree.y).toBeLessThanOrEqual(405);
    }
    expect(trees.map((t) => t.y)).toEqual([...trees.map((t) => t.y)].sort((a, b) => a - b));
  });
});

describe('forest decor', () => {
  it('should always build the same decor, inside the drawing', () => {
    const decor = buildDecor();
    expect(buildDecor()).toEqual(decor);
    expect(decor.treeLine.length).toBeGreaterThan(40);
    for (const tree of [...decor.treeLine, ...decor.midTrees, ...decor.bushes, ...decor.tufts]) {
      expect(tree.x).toBeGreaterThanOrEqual(0);
      expect(tree.x).toBeLessThanOrEqual(1000);
      expect(tree.y).toBeLessThanOrEqual(420);
    }
  });

  it('should follow the hill line', () => {
    // Les deux extrémités de la colline du fond (voir le chemin SVG : M0,250 … 1000,200)
    expect(Math.round(hillTop(BACK_HILL, 0))).toBe(250);
    expect(Math.round(hillTop(BACK_HILL, 450))).toBe(205);
    expect(Math.round(hillTop(BACK_HILL, 1000))).toBe(200);
  });
});

describe('forest river', () => {
  it('should flow from the hill down to the bottom, wider in front', () => {
    expect(riverAt(200)).toBeNull(); // au-dessus de sa source : pas de rivière
    const far = riverAt(300)!;
    const near = riverAt(410)!;
    expect(near.half).toBeGreaterThan(far.half);
    expect(buildRiver()).toEqual(buildRiver());
  });

  it('should never plant a tree, a bush or a tuft in the water', () => {
    const many: Pollution[] = Array.from({ length: 300 }, (_, i) => ({ ...base, id: i + 1, statut: 'nettoyee' as const }));
    for (const tree of plantTrees(many)) {
      expect(inRiver(tree.x, tree.y)).toBe(false);
      expect(tree.x).toBeGreaterThanOrEqual(40);
      expect(tree.x).toBeLessThanOrEqual(960);
    }
    const decor = buildDecor();
    for (const item of [...decor.midTrees, ...decor.bushes, ...decor.tufts]) {
      expect(inRiver(item.x, item.y)).toBe(false);
    }
  });
});

describe('forest animals', () => {
  it('should bring an animal back every 5 cleanings', () => {
    expect(animalsFor(0).animals).toEqual([]);
    expect(animalsFor(0).next).toEqual({ animal: ANIMALS[0], remaining: 5 });

    const twelve = animalsFor(12);
    expect(twelve.animals.map((a) => a.kind)).toEqual(['lapin', 'canards']);
    expect(twelve.next?.animal.kind).toBe('renard');
    expect(twelve.next?.remaining).toBe(3);
  });

  it('should have no next animal once they are all back', () => {
    expect(animalsFor(100).animals.length).toBe(ANIMALS.length);
    expect(animalsFor(100).next).toBeNull();
  });

  it('should keep land animals out of the water, and the ducks on it', () => {
    for (const animal of ANIMALS) {
      expect(inRiver(animal.x, animal.y, 15)).toBe(animal.kind === 'canards');
      expect(animal.x).toBeGreaterThanOrEqual(0);
      expect(animal.x).toBeLessThanOrEqual(1000);
      expect(animal.y).toBeLessThanOrEqual(420);
    }
  });
});

describe('tree spreading', () => {
  const cleaned = (count: number): Pollution[] =>
    Array.from({ length: count }, (_, i) => ({
      ...base, id: i + 1, statut: 'nettoyee' as const, dateNettoyage: `2026-11-${String((i % 28) + 1).padStart(2, '0')}`,
    }));

  it('should keep trees apart, so the forest looks natural', () => {
    const trees = plantTrees(cleaned(40));
    for (const a of trees) {
      for (const b of trees) {
        if (a === b) continue;
        expect(Math.hypot(a.x - b.x, (a.y - b.y) * 4)).toBeGreaterThan(30);
      }
    }
  });

  it('should not move the existing trees when a new one is planted', () => {
    const before = plantTrees(cleaned(20));
    const after = plantTrees([...cleaned(20), { ...base, id: 99, statut: 'nettoyee', dateNettoyage: '2026-12-31' }]);
    for (const tree of before) {
      const same = after.find((t) => t.pollution.id === tree.pollution.id);
      expect([same?.x, same?.y]).toEqual([tree.x, tree.y]);
    }
  });
});
