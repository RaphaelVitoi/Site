/// <reference types="jest" />

import { calculateMalmuthHarville, computeBubbleFactorMatrix, getPairwiseMatchupDetail } from '../../lib/icmMatrix';
import { evaluateHandDetail } from '../../lib/holdemEquities';

describe('ICM matrix type-safety boundaries', () => {
  it('preserves Malmuth-Harville prize mass and produces finite matchup metrics', () => {
    const stacks = [60, 30, 10];
    const payouts = [70, 30];
    const equities = calculateMalmuthHarville(stacks, payouts);

    expect(equities).toHaveLength(3);
    expect(equities.reduce((sum, value) => sum + value, 0)).toBeCloseTo(100, 8);

    const matrix = computeBubbleFactorMatrix(stacks, payouts, ['A', 'B', 'C']);
    const detail = getPairwiseMatchupDetail(matrix, 0, 1);

    expect(detail.heroName).toBe('A');
    expect(detail.villainName).toBe('B');
    expect(Number.isFinite(detail.bubbleFactor)).toBe(true);
    expect(Number.isFinite(detail.riskPremium)).toBe(true);
  });

  it('rejects out-of-range matchup indices instead of propagating undefined values', () => {
    const matrix = computeBubbleFactorMatrix([60, 40], [100], ['A', 'B']);
    expect(() => getPairwiseMatchupDetail(matrix, 0, 2)).toThrow(RangeError);
  });

  it('preserves valid Hold’em rank parsing and rejects malformed notation', () => {
    const valid = evaluateHandDetail('AKs', 'STANDARD_25', 10);
    expect(valid.r1).toBe('A');
    expect(valid.r2).toBe('K');
    expect(() => evaluateHandDetail('A', 'STANDARD_25', 10)).toThrow(RangeError);
  });
});
