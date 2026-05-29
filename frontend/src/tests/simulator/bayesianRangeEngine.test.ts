/// <reference types="jest" />

import {
	generateUniformBelief,
	updateBelief,
	getBeliefIntensity,
} from '../../lib/bayesianRangeEngine';

describe('bayesianRangeEngine', () => {
	describe('generateUniformBelief', () => {
		it('should generate a uniform belief vector summing to exactly 1.0', () => {
			const belief = generateUniformBelief();

			// Verifica chaves importantes
			expect(belief['AA']).toBe(6 / 1326);
			expect(belief['AKs']).toBe(4 / 1326);
			expect(belief['AKo']).toBe(12 / 1326);

			// Soma de todos os pesos de probabilidade
			const totalSum = Object.values(belief).reduce((s, v) => s + v, 0);
			expect(totalSum).toBeCloseTo(1.0, 5);
		});
	});

	describe('updateBelief', () => {
		it('should correctly calculate the posterior belief based on prior and likelihood', () => {
			const prior = generateUniformBelief();
			const likelihood: Record<string, number> = {};

			// Definir que apenas AA e KK fazem a ação com probabilidade 1, outros com 0
			for (const hand in prior) {
				likelihood[hand] = hand === 'AA' || hand === 'KK' ? 1.0 : 0.0;
			}

			const posterior = updateBelief(prior, likelihood);

			// Como AA e KK têm as mesmas probabilidades iniciais e probabilidades condicionais,
			// cada um deve ter 0.5 de probabilidade a posteriori.
			expect(posterior['AA']).toBeCloseTo(0.5, 5);
			expect(posterior['KK']).toBeCloseTo(0.5, 5);
			expect(posterior['AKs']).toBe(0);
		});

		it('should return prior (anti-crash) if the action is impossible (evidence === 0)', () => {
			const prior = generateUniformBelief();
			const likelihood: Record<string, number> = {};

			// Probabilidade da ação dada qualquer mão é 0
			for (const hand in prior) {
				likelihood[hand] = 0.0;
			}

			const posterior = updateBelief(prior, likelihood);
			expect(posterior).toEqual(prior);
		});
	});

	describe('getBeliefIntensity', () => {
		it('should calculate relative belief intensity correctly', () => {
			const belief = {
				AA: 0.1,
				KK: 0.05,
				QQ: 0.0,
			};

			// Sem maxBelief customizado, o máximo deve ser AA (0.1)
			expect(getBeliefIntensity(belief, 'AA')).toBe(100);
			expect(getBeliefIntensity(belief, 'KK')).toBe(50);
			expect(getBeliefIntensity(belief, 'QQ')).toBe(0);

			// Com maxBelief customizado
			expect(getBeliefIntensity(belief, 'KK', 0.2)).toBe(25);
		});

		it('should handle zero cases safely', () => {
			expect(getBeliefIntensity({}, 'AA')).toBe(0);
			expect(getBeliefIntensity({ AA: 0 }, 'AA')).toBe(0);
		});
	});
});
