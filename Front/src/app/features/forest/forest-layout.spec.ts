import { Pollution } from '../pollutions/models/pollution.model';
import { BACK_HILL, buildDecor, hillTop, plantTrees } from './forest-layout';

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
