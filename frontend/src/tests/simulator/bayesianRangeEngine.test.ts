/// <reference types="jest" />

import {
	generateUniformBelief,
	updateBelief,
	getBeliefIntensity,
	calculateShannonEntropy,
	computePublicBeliefState,
	generateTextureAwareLikelihood,
} from '../../lib/bayesianRangeEngine';

describe('bayesianRangeEngine', () => {
	describe('generateUniformBelief', () => {
		it('should generate a uniform belief vector summing to exactly 1.0', () => {
			const belief = generateUniformBelief();

			// Verifica chaves importantes
			expect(Reflect.get(belief, 'AA')).toBe(6 / 1326);
			expect(Reflect.get(belief, 'AKs')).toBe(4 / 1326);
			expect(Reflect.get(belief, 'AKo')).toBe(12 / 1326);

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
			for (const hand of Object.keys(prior)) {
				Reflect.set(likelihood, hand, hand === 'AA' || hand === 'KK' ? 1.0 : 0.0);
			}

			const posterior = updateBelief(prior, likelihood);

			// Como AA e KK têm as mesmas probabilidades iniciais e probabilidades condicionais,
			// cada um deve ter 0.5 de probabilidade a posteriori.
			expect(Reflect.get(posterior, 'AA')).toBeCloseTo(0.5, 5);
			expect(Reflect.get(posterior, 'KK')).toBeCloseTo(0.5, 5);
			expect(Reflect.get(posterior, 'AKs')).toBe(0);
		});

		it('should return prior (anti-crash) if the action is impossible (evidence === 0)', () => {
			const prior = generateUniformBelief();
			const likelihood: Record<string, number> = {};

			// Probabilidade da ação dada qualquer mão é 0
			for (const hand of Object.keys(prior)) {
				Reflect.set(likelihood, hand, 0.0);
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

	describe('calculateShannonEntropy', () => {
		it('should calculate max entropy for uniform distribution', () => {
			const uniform = generateUniformBelief();
			const entropy = calculateShannonEntropy(uniform);

			// Para 169 classes no formato do poker, a entropia fica próxima de log2(169) ~ 7.4 bits
			expect(entropy).toBeGreaterThan(7.0);
			expect(entropy).toBeLessThanOrEqual(Math.log2(169) + 0.1);
		});

		it('should calculate zero entropy for a single deterministic hand', () => {
			const singleHand = { AA: 1.0, KK: 0.0, QQ: 0.0 };
			const entropy = calculateShannonEntropy(singleHand);
			expect(entropy).toBeCloseTo(0.0, 5);
		});

		it('should calculate 1.0 bit for 50/50 two-hand distribution', () => {
			const twoHands = { AA: 0.5, KK: 0.5 };
			const entropy = calculateShannonEntropy(twoHands);
			expect(entropy).toBeCloseTo(1.0, 5);
		});
	});

	describe('computePublicBeliefState', () => {
		it('should generate valid PBS with polarization index and active combos', () => {
			const hero = generateUniformBelief();
			const villain = generateUniformBelief();
			const pbs = computePublicBeliefState(['Ah', 'Kd', '2c'], 15.0, hero, villain);

			expect(pbs.pot).toBe(15.0);
			expect(pbs.board).toEqual(['Ah', 'Kd', '2c']);
			expect(pbs.heroEntropy).toBeGreaterThan(7.0);
			expect(pbs.villainEntropy).toBeGreaterThan(7.0);
			expect(pbs.polarizationScore).toBeLessThan(10.0); // Próximo de zero em uniforme
			expect(pbs.combosLeft).toBeGreaterThan(1000);
		});
	});

	describe('generateTextureAwareLikelihood', () => {
		it('should generate higher Ace/Broadcard probability for small cbet on dry board', () => {
			const likelihood = generateTextureAwareLikelihood('dry', 'cbet_small');
			expect(likelihood['AA']).toBeGreaterThan(likelihood['22']);
			expect(likelihood['AKo']).toBeGreaterThan(0.8);
		});

		it('should generate highly polarized distribution for check-raise', () => {
			const likelihood = generateTextureAwareLikelihood('wet', 'check_raise');
			expect(likelihood['AA']).toBeGreaterThan(0.9);
			expect(likelihood['88']).toBeLessThan(0.2); // Pares médios sem draw não dão check-raise
		});
	});
});

