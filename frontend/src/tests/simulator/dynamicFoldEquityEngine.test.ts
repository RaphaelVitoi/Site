/// <reference types="jest" />

import {
	calculateDynamicFoldEquity,
	calculateEffectiveFoldProbability,
	calculateReverseRequiredFoldEquity,
} from '../../lib/dynamicFoldEquityEngine';

describe('Dynamic Fold Equity & Bayesian Polarization Engine (SOTA v7.0 GOLD)', () => {
	it('should return 0 required fold equity when hand has direct pot odds for value', () => {
		// Pot = 10, Bet = 10, Showdown Equity = 60%
		const feReq = calculateReverseRequiredFoldEquity(10, 10, 0.6);
		expect(feReq).toBe(0.0);
	});

	it('should accurately calculate reverse required fold equity for semi-bluffs and pure air', () => {
		// Pot = 10, Bet = 10, Showdown Equity = 25% (Semi-bluff flush draw)
		// EV called = 0.25 * 30 - 10 = -2.5. Denominator = 10 - (-2.5) = 12.5 -> FE_req = 2.5 / 12.5 = 0.20 (20%)
		const feSemi = calculateReverseRequiredFoldEquity(10, 10, 0.25);
		expect(feSemi).toBeCloseTo(0.2, 2);

		// Pot = 10, Bet = 10, Showdown Equity = 0% (Pure Air)
		// EV called = -10. Denominator = 20 -> FE_req = 10 / 20 = 0.50 (50%)
		const feAir = calculateReverseRequiredFoldEquity(10, 10, 0.0);
		expect(feAir).toBeCloseTo(0.5, 2);
	});

	it('should inflate opponent fold probability under ICM Bubble Factor pressure', () => {
		const foldChipEv = calculateEffectiveFoldProbability(10, 10, 0.4, 0.5, 1.0);
		const foldIcmBubble = calculateEffectiveFoldProbability(10, 10, 0.4, 0.5, 1.8);

		expect(foldIcmBubble).toBeGreaterThan(foldChipEv);
	});

	it('should correctly classify PURE_VALUE, PROFITABLE_SEMI_BLUFF, and NEGATIVE_EV_PUNT', () => {
		// Value scenario
		const valueResult = calculateDynamicFoldEquity({
			potSize: 20,
			betSize: 10,
			showdownEquity: 0.7,
		});
		expect(valueResult.verdict).toBe('PURE_VALUE');
		expect(valueResult.isPositiveEv).toBe(true);

		// Semi-bluff scenario (Pot odds = 15 / 50 = 30%, Eq = 25% < 30%, needs fold equity)
		const semiResult = calculateDynamicFoldEquity({
			potSize: 20,
			betSize: 15,
			showdownEquity: 0.25,
			baseOpponentFoldProb: 0.45,
		});
		expect(semiResult.verdict).toBe('PROFITABLE_SEMI_BLUFF');
		expect(semiResult.isPositiveEv).toBe(true);
		expect(semiResult.elasticityCurve.length).toBeGreaterThan(0);

		// Punt scenario (low equity, low fold probability)
		const puntResult = calculateDynamicFoldEquity({
			potSize: 10,
			betSize: 100,
			showdownEquity: 0.05,
			baseOpponentFoldProb: 0.05,
		});
		expect(puntResult.verdict).toBe('NEGATIVE_EV_PUNT');
		expect(puntResult.isPositiveEv).toBe(false);
	});
});
