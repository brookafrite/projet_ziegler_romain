import { PollutionLevelPipe } from './pollution-level.pipe';

describe('PollutionLevelPipe', () => {
  const pipe = new PollutionLevelPipe();

  it('should turn each index into its level, bounds included', () => {
    expect(pipe.transform(0)).toBe('Faible');
    expect(pipe.transform(20)).toBe('Faible');
    expect(pipe.transform(21)).toBe('Modérée');
    expect(pipe.transform(50)).toBe('Modérée');
    expect(pipe.transform(51)).toBe('Élevée');
    expect(pipe.transform(100)).toBe('Élevée');
    expect(pipe.transform(101)).toBe('Dangereuse');
    expect(pipe.transform(500)).toBe('Dangereuse');
  });

  it('should say « Non évalué » when there is no index', () => {
    expect(pipe.transform(null)).toBe('Non évalué');
    expect(pipe.transform(undefined)).toBe('Non évalué');
  });
});
