/// <reference types="jest" />

import {
	computeBlockerSummary,
	getLiveCombosForHand,
	parseBoardToMask,
	parseCard,
} from '../../lib/deadCardFilter';

describe('Dead Card & Blocker Combinatorial Engine (SOTA v7.0 GOLD)', () => {
	it('should accurately parse valid and invalid card tokens', () => {
		const cardAh = parseCard('Ah');
		expect(cardAh).not.toBeNull();
		expect(cardAh?.rankChar).toBe('A');
		expect(cardAh?.suitChar).toBe('h');
		expect(cardAh?.cardIdx).toBe((12 << 2) | 1); // Rank 12 (A), Suit 1 (h)

		const invalid = parseCard('Xx');
		expect(invalid).toBeNull();

		const invalidLen = parseCard('A');
		expect(invalidLen).toBeNull();
	});

	it('should compute exact combinatorial reductions on a 3-card flop (Ah Kd 2s)', () => {
		const summary = computeBlockerSummary('Ah Kd 2s');
		expect(summary.deadCards).toHaveLength(3);

		// N = 49 cards remaining -> C(49, 2) = 1,176 live combos
		expect(summary.totalLiveCombos).toBe(1176);
		expect(summary.totalBlockedCombos).toBe(150); // 1326 - 1176 = 150
		expect(summary.blockagePercentage).toBe(11.3);

		// Pocket Pairs with 1 blocker (AA: Ah on board -> 3 remaining: AsAc, AsAd, AcAd)
		const aa = getLiveCombosForHand('AA', 'Ah Kd 2s');
		expect(aa.total).toBe(6);
		expect(aa.live).toBe(3);
		expect(aa.ratio).toBe(0.5);

		// Pocket Pairs with 0 blockers (QQ: 6 combos live)
		const qq = getLiveCombosForHand('QQ', 'Ah Kd 2s');
		expect(qq.total).toBe(6);
		expect(qq.live).toBe(6);
		expect(qq.ratio).toBe(1.0);

		// AKs: Ah and Kd on board -> AhKh dead, AdKd dead -> AsKs and AcKc live (2 / 4)
		const aks = getLiveCombosForHand('AKs', 'Ah Kd 2s');
		expect(aks.total).toBe(4);
		expect(aks.live).toBe(2);
		expect(aks.ratio).toBe(0.5);
	});

	it('should compute exact combinatorial reductions on a 5-card board (Ah Kd 2s 7c Jc)', () => {
		const summary = computeBlockerSummary('Ah Kd 2s 7c Jc');
		expect(summary.deadCards).toHaveLength(5);

		// N = 47 cards remaining -> C(47, 2) = 1,081 live combos
		expect(summary.totalLiveCombos).toBe(1081);
		expect(summary.totalBlockedCombos).toBe(245); // 1326 - 1081 = 245
		expect(summary.blockagePercentage).toBe(18.5);
	});

	it('should handle empty board with 100% (1,326) live combos', () => {
		const summary = computeBlockerSummary('');
		expect(summary.deadCards).toHaveLength(0);
		expect(summary.totalLiveCombos).toBe(1326);
		expect(summary.totalBlockedCombos).toBe(0);
		expect(summary.blockagePercentage).toBe(0.0);
	});

	it('should correctly parse bitmask deduplication when duplicate cards are provided', () => {
		const { cards, mask } = parseBoardToMask('Ah Ah Ah Kd');
		expect(cards).toHaveLength(2); // Only Ah and Kd
		expect(mask).toBeGreaterThan(BigInt(0));
	});
});
