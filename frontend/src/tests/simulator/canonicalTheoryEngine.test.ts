/**
 * IDENTITY: Testes Unitários do Motor de Teoria Canônica (Chen & Janda)
 * PATH: src/tests/simulator/canonicalTheoryEngine.test.ts
 */

import {
	calculateJandaMDF,
	calculateJandaGeometricSizing,
	calculateChenIndifference,
	calculateJandaBluffValueRatios,
} from '../../lib/canonicalTheoryEngine';

describe('canonicalTheoryEngine', () => {
	describe('calculateJandaMDF', () => {
		test('calcula MDF e alpha corretamente para meio pote', () => {
			const res = calculateJandaMDF(100, 50);
			expect(res.alpha).toBeCloseTo(0.3333, 3);
			expect(res.mdf).toBeCloseTo(0.6667, 3);
			expect(res.mdfPercentage).toBe(66.67);
			expect(res.isMultiway).toBe(false);
		});

		test('calcula MDF multiway compartilhada para 2 defensores', () => {
			const res = calculateJandaMDF(100, 100, 2);
			expect(res.isMultiway).toBe(true);
			expect(res.numDefenders).toBe(2);
			expect(res.individualMdf).toBeCloseTo(1 - Math.sqrt(0.5), 3);
			expect(res.individualMdf).toBeLessThan(res.mdf);
		});
	});

	describe('calculateJandaGeometricSizing', () => {
		test('calcula dimensionamento geometrico de 3 streets para 100bb stack e 10bb pot', () => {
			const res = calculateJandaGeometricSizing(10, 100, 3);
			expect(res.startingPot).toBe(10);
			expect(res.effectiveStack).toBe(100);
			expect(res.targetFinalPot).toBe(210);
			expect(res.potFractionPercentage).toBeCloseTo(87.95, 1);
			expect(res.steps).toHaveLength(3);

			// All-in no river
			const riverStep = res.steps[2];
			expect(riverStep?.remainingStackAfterBet).toBe(0);
			expect(riverStep?.finalPotIfCalled).toBe(210);
		});
	});

	describe('calculateChenIndifference', () => {
		test('calcula ponto de indiferenca e frequencias de Clairvoyance Game', () => {
			const res = calculateChenIndifference(1, 1);
			expect(res.alpha).toBe(0.5);
			expect(res.defenderCallFrequency).toBe(0.5);
			expect(res.bluffFrequencyInBetRange).toBeCloseTo(1 / 3, 3);
			expect(res.gameValueHero).toBe(0.25);
		});
	});

	describe('calculateJandaBluffValueRatios', () => {
		test('calcula ratios de blefe/valor para pot-sized bet (alpha = 0.5)', () => {
			const res = calculateJandaBluffValueRatios(1.0);
			expect(res.alpha).toBe(0.5);
			expect(res.riverBluffToValueRatio).toBe(0.5);
			expect(res.riverBluffPercentage).toBe(33.33);
			expect(res.turnBluffToValueRatio).toBe(1.25);
			expect(res.turnBluffPercentage).toBe(55.56);
			expect(res.flopBluffToValueRatio).toBe(2.375);
			expect(res.flopBluffPercentage).toBe(70.37);
		});
	});
});
