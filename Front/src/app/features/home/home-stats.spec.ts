import { Pollution } from '../pollutions/models/pollution.model';
import { homeStats } from './home-stats';

const base = { titre: 't', type: 'Eau', description: '', lieu: '', latitude: 0, longitude: 0 } as const;
const pollutions: Pollution[] = [
  { ...base, id: 1, dateObservation: '2026-11-03', indice: 150, statut: 'nettoyee' },
  { ...base, id: 2, dateObservation: '2026-10-20', indice: 75, statut: 'en-cours' },
  { ...base, id: 3, dateObservation: '2026-11-25', indice: 10 },
  { ...base, id: 4, dateObservation: '2026-09-01', indice: null, statut: 'signalee' },
];

describe('homeStats', () => {
  const stats = homeStats(pollutions, new Date(2026, 10, 27)); // 27 novembre 2026

  it('should count the pollutions by status', () => {
    expect(stats.total).toBe(4);
    expect(stats.cleaned).toBe(1);
    expect(stats.inProgress).toBe(1);
    expect(stats.reported).toBe(2); // sans statut = signalée
    expect(stats.percentCleaned).toBe(25);
  });

  it('should count the pollutions observed this month', () => {
    expect(stats.thisMonth).toBe(2);
  });

  it('should count each danger level', () => {
    expect(stats.levels.map((l) => [l.value, l.count])).toEqual([
      ['non-evalue', 1], ['faible', 1], ['moderee', 0], ['elevee', 1], ['dangereuse', 1],
    ]);
  });

  it('should keep the 3 most recent observations, without changing the list', () => {
    expect(stats.latest.map((p) => p.id)).toEqual([3, 1, 2]);
    expect(pollutions.map((p) => p.id)).toEqual([1, 2, 3, 4]);
  });

  it('should not divide by zero when there is no pollution', () => {
    expect(homeStats([]).percentCleaned).toBe(0);
  });
});
