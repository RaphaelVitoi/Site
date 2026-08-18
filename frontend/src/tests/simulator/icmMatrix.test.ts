/// <reference types="jest" />

import {
  calculateMalmuthHarville,
  computeBubbleFactorMatrix,
  getPairwiseMatchupDetail,
  TOURNAMENT_PRESETS,
} from '../../lib/icmMatrix';
import { evaluateHandDetail } from '../../lib/holdemEquities';

describe('ICM matrix type-safety boundaries and mathematical invariants', () => {
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
    expect(detail.coverageAdvantage).toBe(true);
  });

  it('verifies mathematical conservation across all tournament presets', () => {
    for (const preset of TOURNAMENT_PRESETS) {
      const stacks = preset.defaultStacks.map((s) => s.chips);
      const equities = calculateMalmuthHarville(stacks, preset.payouts);
      const totalPrize = preset.payouts.slice(0, stacks.length).reduce((a, b) => a + b, 0);

      expect(equities).toHaveLength(stacks.length);
      expect(equities.reduce((a, b) => a + b, 0)).toBeCloseTo(totalPrize, 2);

      const matrix = computeBubbleFactorMatrix(stacks, preset.payouts);
      expect(matrix.nPlayers).toBe(stacks.length);
      expect(matrix.bfMatrix).toHaveLength(stacks.length);
      expect(matrix.rpMatrix).toHaveLength(stacks.length);
    }
  });

  it('models Risk Premium asymmetry correctly based on stack sizes', () => {
    const stacks = [100, 50, 10];
    const payouts = [500, 300, 200];
    const matrix = computeBubbleFactorMatrix(stacks, payouts, ['BigStack', 'MidStack', 'ShortStack']);

    // MidStack vs BigStack: MidStack risks elimination
    const midVsBig = getPairwiseMatchupDetail(matrix, 1, 0);
    const bigVsMid = getPairwiseMatchupDetail(matrix, 0, 1);

    expect(midVsBig.coverageAdvantage).toBe(false);
    expect(bigVsMid.coverageAdvantage).toBe(true);
    expect(midVsBig.riskPremium).toBeGreaterThanOrEqual(bigVsMid.riskPremium);
    expect(midVsBig.riskAsymmetry).toBeCloseTo(midVsBig.riskPremium - bigVsMid.riskPremium, 2);
  });

  it('generates appropriate tactical advice for diverse risk profiles', () => {
    // 3-way near bubble with severe payjump
    const matrix = computeBubbleFactorMatrix([1000, 300, 50], [10000, 4000], ['Leader', 'Middle', 'Micro']);

    const middleVsLeader = getPairwiseMatchupDetail(matrix, 1, 0);
    expect(middleVsLeader.tacticalAdvice).toBeDefined();
    expect(typeof middleVsLeader.tacticalAdvice).toBe('string');

    const leaderVsMicro = getPairwiseMatchupDetail(matrix, 0, 2);
    expect(leaderVsMicro.coverageAdvantage).toBe(true);
  });

  it('handles edge case inputs gracefully (empty, zero chips)', () => {
    expect(calculateMalmuthHarville([], [100])).toEqual([]);
    expect(calculateMalmuthHarville([0, 0], [100])).toEqual([0, 0]);
  });

  it('rejects out-of-range matchup indices instead of propagating undefined values', () => {
    const matrix = computeBubbleFactorMatrix([60, 40], [100], ['A', 'B']);
    expect(() => getPairwiseMatchupDetail(matrix, 0, 2)).toThrow(RangeError);
    expect(() => getPairwiseMatchupDetail(matrix, -1, 0)).toThrow(RangeError);
  });

  it('preserves valid Hold’em rank parsing and rejects malformed notation', () => {
    const valid = evaluateHandDetail('AKs', 'STANDARD_25', 10);
    expect(valid.r1).toBe('A');
    expect(valid.r2).toBe('K');
    expect(() => evaluateHandDetail('A', 'STANDARD_25', 10)).toThrow(RangeError);
  });
});
