/// <reference types="jest" />

import {
	CFRPlusEngine,
	computeMultiwayStructuralLiability,
	solvePluribusMultiway,
} from '../../lib/pluribusMultiwayEngine';

describe('pluribusMultiwayEngine', () => {
	describe('computeMultiwayStructuralLiability', () => {
		it('should return 0 when heads-up (numPlayers = 2, k = 1)', () => {
			const liability = computeMultiwayStructuralLiability(100.0, 2);
			expect(liability).toBe(0);
		});

		it('should compute exact N^2 quadratic penalty for 4 players (k = 3)', () => {
			// k = 3, lambda = 2.25, pot = 100.0
			// 2.25 * (9 - 1) * (100 * 0.05) = 2.25 * 8 * 5 = 90.0
			const liability = computeMultiwayStructuralLiability(100.0, 4, 2.25);
			expect(liability).toBe(90.0);
		});

		it('should scale quadratically for 6 players (k = 5)', () => {
			// k = 5, lambda = 2.25, pot = 100.0
			// 2.25 * (25 - 1) * 5 = 2.25 * 24 * 5 = 270.0
			const liability = computeMultiwayStructuralLiability(100.0, 6, 2.25);
			expect(liability).toBe(270.0);
		});
	});

	describe('CFRPlusEngine', () => {
		it('should converge towards dominating action over iterations', () => {
			const engine = new CFRPlusEngine(['FOLD', 'CALL', 'RAISE']);

			// Simula ação RAISE dominante com utilidade muito superior
			for (let i = 0; i < 30; i++) {
				engine.updateRegrets({ FOLD: 0, CALL: 5.0, RAISE: 50.0 }, 18.0);
			}

			const strategy = engine.getAverageStrategy();
			expect(strategy.RAISE).toBeGreaterThan(0.9);
			expect(strategy.FOLD).toBeLessThan(0.05);
			expect(strategy.FOLD + strategy.CALL + strategy.RAISE).toBeCloseTo(1.0, 5);
		});
	});

	describe('solvePluribusMultiway', () => {
		it('should return valid strategy and optimal action for high equity in position (3-way)', () => {
			// Com 3 jogadores (k = 2), o passivo é 2.25 * 3 * 5 = 33.75, permitindo equidade efetiva alta
			const result = solvePluribusMultiway({
				pot: 100.0,
				numPlayers: 3,
				heroPosition: 'BTN',
				nominalEquity: 0.85,
				activeStacks: [100, 100, 100],
				lambdaFactor: 2.25,
				iterations: 50,
			});

			expect(result.kOpponents).toBe(2);
			expect(result.structuralLiability).toBe(33.75);
			expect(result.posMultiplier).toBe(1.15);
			expect(result.strategy.FOLD + result.strategy.CALL + result.strategy.RAISE).toBeCloseTo(1.0, 3);
			expect(['CALL', 'RAISE']).toContain(result.optimalAction);
		});

		it('should favor FOLD when multiway liability destroys low nominal equity (6-max)', () => {
			const result = solvePluribusMultiway({
				pot: 50.0,
				numPlayers: 6,
				heroPosition: 'SB',
				nominalEquity: 0.25,
				activeStacks: [50, 50, 50, 50, 50, 50],
				lambdaFactor: 2.5,
				iterations: 50,
			});

			// Com 6 jogadores e equidade de 25% fora de posição, o passivo multiway força o Fold dominante
			expect(result.optimalAction).toBe('FOLD');
			expect(result.strategy.FOLD).toBeGreaterThan(0.55);
		});
	});
});
