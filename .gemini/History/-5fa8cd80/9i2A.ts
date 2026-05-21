import {
    calculatePerspectiva,
    classifyTier,
    calculateEsperanca,
    calculateEsperancaFold,
    StackTier,
    TIER_LABELS,
} from '../perspectiva';

describe('calculatePerspectiva', () => {
    it('should correctly calculate position probabilities and equities for a simple 2-player scenario', () => {
        const stacks = [1000, 1000];
        const prizes = [100, 50];
        const result = calculatePerspectiva(stacks, prizes);

        // With equal stacks, probabilities should be equal
        expect(result.positionProbs[0][0]).toBeCloseTo(0.5); // P(player 0 finishes 1st)
        expect(result.positionProbs[0][1]).toBeCloseTo(0.5); // P(player 0 finishes 2nd)
        expect(result.positionProbs[1][0]).toBeCloseTo(0.5); // P(player 1 finishes 1st)
        expect(result.positionProbs[1][1]).toBeCloseTo(0.5); // P(player 1 finishes 2nd)

        // Equities should be (0.5 * 100) + (0.5 * 50) = 75 for both
        expect(result.equities[0]).toBeCloseTo(75);
        expect(result.equities[1]).toBeCloseTo(75);
        expect(result.totalChips).toBe(2000);
    });

    it('should correctly calculate for unequal stacks', () => {
        const stacks = [2000, 1000];
        const prizes = [100, 50];
        const result = calculatePerspectiva(stacks, prizes);

        // Player 0 (2000 chips) should have higher probability of 1st
        expect(result.positionProbs[0][0]).toBeGreaterThan(result.positionProbs[1][0]);
        expect(result.positionProbs[0][0]).toBeCloseTo(2 / 3); // P(player 0 finishes 1st)
        expect(result.positionProbs[1][0]).toBeCloseTo(1 / 3); // P(player 1 finishes 1st)

        // Player 1 (1000 chips) should have higher probability of 2nd
        expect(result.positionProbs[1][1]).toBeGreaterThan(result.positionProbs[0][1]);
        expect(result.positionProbs[0][1]).toBeCloseTo(1 / 3); // P(player 0 finishes 2nd)
        expect(result.positionProbs[1][1]).toBeCloseTo(2 / 3); // P(player 1 finishes 2nd)

        // Equities
        const equity0 = (2 / 3) * 100 + (1 / 3) * 50; // 66.66 + 16.66 = 83.33
        const equity1 = (1 / 3) * 100 + (2 / 3) * 50; // 33.33 + 33.33 = 66.66
        expect(result.equities[0]).toBeCloseTo(equity0);
        expect(result.equities[1]).toBeCloseTo(equity1);
    });

    it('should handle more players and prizes', () => {
        const stacks = [1000, 2000, 3000];
        const prizes = [100, 50, 25];
        const result = calculatePerspectiva(stacks, prizes);

        expect(result.totalChips).toBe(6000);
        // Player 2 (3000 chips) should have highest equity
        expect(result.equities[2]).toBeGreaterThan(result.equities[1]);
        expect(result.equities[1]).toBeGreaterThan(result.equities[0]);

        // Sum of probabilities for each position should be 1
        expect(result.positionProbs.reduce((sum, p) => sum + p[0], 0)).toBeCloseTo(1); // Sum of P(finishes 1st)
        expect(result.positionProbs.reduce((sum, p) => sum + p[1], 0)).toBeCloseTo(1); // Sum of P(finishes 2nd)
        expect(result.positionProbs.reduce((sum, p) => sum + p[2], 0)).toBeCloseTo(1); // Sum of P(finishes 3rd)
    });

    it('should return zero for all if total chips are zero', () => {
        const stacks = [0, 0];
        const prizes = [100, 50];
        const result = calculatePerspectiva(stacks, prizes);

        expect(result.positionProbs).toEqual([[0, 0], [0, 0]]);
        expect(result.equities).toEqual([0, 0]);
        expect(result.totalChips).toBe(0);
    });

    it('should handle players with zero stack', () => {
        const stacks = [1000, 0, 2000];
        const prizes = [100, 50, 25];
        const result = calculatePerspectiva(stacks, prizes);

        expect(result.equities[1]).toBe(0); // Player 1 has 0 chips, so 0 equity
        expect(result.positionProbs[1]).toEqual([0, 0, 0]); // Player 1 cannot finish in any prize position

        // Player 0 and 2 should split the remaining equity based on their stacks
        const totalActiveChips = 1000 + 2000;
        const p0Wins = 1000 / totalActiveChips;
        const p2Wins = 2000 / totalActiveChips;

        // P(player 0 finishes 1st) should be 1/3
        expect(result.positionProbs[0][0]).toBeCloseTo(p0Wins);
        // P(player 2 finishes 1st) should be 2/3
        expect(result.positionProbs[2][0]).toBeCloseTo(p2Wins);
    });
});

describe('classifyTier', () => {
    const stacks = [100, 200, 500, 1000, 2000]; // Total 3800, Avg 760

    it('should classify micro stack', () => {
        expect(classifyTier(10, stacks)).toBe('micro'); // < 0.4 * avg (304)
    });

    it('should classify short stack', () => {
        expect(classifyTier(400, stacks)).toBe('short'); // < 0.7 * avg (532)
    });

    it('should classify mid stack', () => {
        expect(classifyTier(800, stacks)).toBe('mid'); // < 1.5 * avg (1140)
    });

    it('should classify big stack', () => {
        expect(classifyTier(1500, stacks)).toBe('big'); // > 1.5 * avg but not chipleader
    });

    it('should classify chipleader', () => {
        expect(classifyTier(2000, stacks)).toBe('chipleader'); // Largest stack
        expect(classifyTier(3000, [100, 3000])).toBe('chipleader'); // Ratio >= 2.5 * avg
    });

    it('should handle zero stack as micro', () => {
        expect(classifyTier(0, stacks)).toBe('micro');
    });

    it('should handle single player as mid (avg is stack itself)', () => {
        expect(classifyTier(1000, [1000])).toBe('mid');
    });

    it('should handle all zero stacks gracefully', () => {
        expect(classifyTier(0, [0, 0, 0])).toBe('micro');
    });
});

describe('calculateEsperanca', () => {
    const stacks = [1000, 500, 2000]; // Hero (0), Villain (1), Other (2)
    const prizes = [1000, 500, 250];
    const names = ['Hero', 'Villain', 'Other'];
    const heroIdx = 0;
    const villainIdx = 1;
    const potSize = 200; // Total pot before hero's call
    const heroCost = 100; // Amount hero needs to call

    it('should calculate esperanca correctly for a winning scenario', () => {
        const winProb = 0.8; // 80% chance to win
        const result = calculateEsperanca(stacks, prizes, names, heroIdx, villainIdx, potSize, heroCost, winProb);

        expect(result.heroName).toBe('Hero');
        expect(result.villainName).toBe('Villain');
        expect(result.currentEquity).toBeDefined();
        expect(result.winEquity).toBeDefined();
        expect(result.loseEquity).toBeDefined();

        // Expect winEquity to be higher than currentEquity
        expect(result.winEquity).toBeGreaterThan(result.currentEquity);
        // Expect loseEquity to be lower than currentEquity
        expect(result.loseEquity).toBeLessThan(result.currentEquity);

        // Esperanca should be positive with high win probability
        expect(result.esperanca).toBeGreaterThan(0);
        expect(result.esperancaPct).toBeGreaterThan(0);

        // Tier classification
        expect(TIER_LABELS[result.currentTier]).toBeDefined();
        expect(TIER_LABELS[result.winTier]).toBeDefined();
        expect(TIER_LABELS[result.loseTier]).toBeDefined();
    });

    it('should calculate esperanca correctly for a losing scenario', () => {
        const winProb = 0.2; // 20% chance to win
        const result = calculateEsperanca(stacks, prizes, names, heroIdx, villainIdx, potSize, heroCost, winProb);

        // Esperanca should be negative with low win probability
        expect(result.esperanca).toBeLessThan(0);
        expect(result.esperancaPct).toBeLessThan(0);
    });

    it('should correctly calculate stack changes for win and loss', () => {
        const winProb = 0.5;
        const result = calculateEsperanca(stacks, prizes, names, heroIdx, villainIdx, potSize, heroCost, winProb);

        // Stacks after win: Hero gains potSize, others unchanged
        const expectedWinStacks = [stacks[heroIdx] + potSize, stacks[villainIdx], stacks[2]];
        const perspWin = calculatePerspectiva(expectedWinStacks, prizes);
        expect(result.winEquity).toBeCloseTo(perspWin.equities[heroIdx]);

        // Stacks after lose: Hero loses heroCost, Villain gains potSize + heroCost, others unchanged
        const expectedLoseStacks = [
            stacks[heroIdx] - heroCost,
            stacks[villainIdx] + potSize + heroCost,
            stacks[2],
        ];
        const perspLose = calculatePerspectiva(expectedLoseStacks, prizes);
        expect(result.loseEquity).toBeCloseTo(perspLose.equities[heroIdx]);
    });

    it('should handle zero total prizes gracefully', () => {
        const zeroPrizes = [0, 0, 0];
        const result = calculateEsperanca(stacks, zeroPrizes, names, heroIdx, villainIdx, potSize, heroCost, 0.5);
        expect(result.currentEquity).toBe(0);
        expect(result.winEquity).toBe(0);
        expect(result.loseEquity).toBe(0);
        expect(result.esperanca).toBe(0);
        expect(result.externality).toBe(0);
    });

    it('should correctly identify tier shifts', () => {
        // Scenario where hero becomes chipleader if wins
        const stacksBigWin = [100, 100, 100]; // Avg 100
        const prizesBigWin = [100, 50, 25];
        const heroIdxBigWin = 0;
        const villainIdxBigWin = 1;
        const potSizeBigWin = 300;
        const heroCostBigWin = 50;

        const result = calculateEsperanca(stacksBigWin, prizesBigWin, names, heroIdxBigWin, villainIdxBigWin, potSizeBigWin, heroCostBigWin, 1);

        expect(result.currentTier).toBe('mid');
        expect(result.winTier).toBe('chipleader');
        expect(result.tierShift).toBe(true);
        expect(result.tierDirection).toBe('up');

        // Scenario where hero becomes micro if loses
        const stacksBigLose = [500, 100, 100]; // Avg ~233
        const prizesBigLose = [100, 50, 25];
        const heroIdxBigLose = 0;
        const villainIdxBigLose = 1;
        const potSizeBigLose = 50;
        const heroCostBigLose = 450; // Hero goes to 50 chips

        const resultLose = calculateEsperanca(stacksBigLose, prizesBigLose, names, heroIdxBigLose, villainIdxBigLose, potSizeBigLose, heroCostBigLose, 0);
        expect(resultLose.currentTier).toBe('big'); // 500 / 233 = 2.14
        expect(resultLose.loseTier).toBe('micro'); // 50 / 233 = 0.21
        expect(resultLose.tierShift).toBe(true);
        expect(resultLose.tierDirection).toBe('down');
    });
});

describe('calculateEsperancaFold', () => {
    const stacks = [1000, 500, 2000]; // Hero (0), Villain (1), Other (2)
    const prizes = [1000, 500, 250];
    const names = ['Hero', 'Villain', 'Other'];
    const heroIdx = 0;
    const villainIdx = 1;
    const potSize = 200; // Total pot

    it('should calculate esperanca and equity for folding correctly', () => {
        const result = calculateEsperancaFold(stacks, prizes, names, heroIdx, villainIdx, potSize);

        // Current equity before any action
        const current = calculatePerspectiva(stacks, prizes);
        const currentEquity = current.equities[heroIdx];

        // Stacks after fold: Hero's stack unchanged, Villain gains potSize
        const expectedFoldStacks = [stacks[heroIdx], stacks[villainIdx] + potSize, stacks[2]];
        const perspFold = calculatePerspectiva(expectedFoldStacks, prizes);
        const foldEquity = perspFold.equities[heroIdx];

        expect(result.winEquity).toBeCloseTo(foldEquity); // winEquity in fold context is equity after folding
        expect(result.esperanca).toBeCloseTo(foldEquity - currentEquity);
        expect(result.esperancaPct).toBeCloseTo(((foldEquity - currentEquity) / prizes.reduce((s, v) => s + v, 0)) * 100);
    });

    it('should handle zero total prizes gracefully on fold', () => {
        const zeroPrizes = [0, 0, 0];
        const result = calculateEsperancaFold(stacks, zeroPrizes, names, heroIdx, villainIdx, potSize);
        expect(result.esperanca).toBe(0);
        expect(result.winEquity).toBe(0);
    });
});
