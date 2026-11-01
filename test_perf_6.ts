import { RANKS, getHandCombos } from './frontend/src/lib/holdemEquities';
const { performance } = require('perf_hooks');

const BASELINE_EQUITIES_MAP = new Map<string, number>();
BASELINE_EQUITIES_MAP.set('AA', 85.2);

function getHandEquityAgainstProfile(hand: string, profile: string): number {
	const base = BASELINE_EQUITIES_MAP.get(hand) ?? 50.0;
	switch (profile) {
		case 'WIDE_40': return Math.min(92.0, base * 1.06);
		case 'TIGHT_15': return Math.max(18.0, base * 0.94);
		case 'VALUE_8': return Math.max(12.0, base * 0.88);
		case 'ANY2_100': return Math.min(98.0, base * 1.25);
		case 'STANDARD_25': default: return base;
	}
}

function calculateRequiredEquity(riskPremium: number, risk: number = 1, reward: number = 1) {
	const clampedRp = Math.min(99.0, Math.max(0.0, riskPremium));
	const bf = 100 / (100 - clampedRp);
	const reqEq = ((risk * bf) / (risk * bf + reward)) * 100;
	return { requiredEquity: reqEq, bubbleFactor: bf };
}

function evaluateHandDetailOptimized(
	hand: string,
	shoveProfile: string,
	reqEq: number
) {
	const equity = getHandEquityAgainstProfile(hand, shoveProfile);
	const margin = equity - reqEq;

	let verdict;
	if (margin >= 4.0) verdict = 'CORE_CALL';
	else if (margin >= 0.0) verdict = 'MARGINAL_CALL';
	else if (margin >= -4.0) verdict = 'RISKY_FOLD';
	else verdict = 'DEATH_FOLD';

    return verdict;
}

function computeRangeMatrixSummaryOptimized2(
	shoveProfile: string,
	riskPremium: number,
	risk: number = 1,
	reward: number = 1
) {
	const { requiredEquity, bubbleFactor } = calculateRequiredEquity(riskPremium, risk, reward);
	const totalCombos = 1326;
	let callCombos = 0;
	let foldCombos = 0;
	let coreCallCombos = 0;
	let marginalCallCombos = 0;
	let riskyFoldCombos = 0;
	let deathFoldCombos = 0;

    const ranksLen = RANKS.length;
	for (let i = 0; i < ranksLen; i++) {
        const r1 = RANKS[i];
		for (let j = 0; j < ranksLen; j++) {
            const r2 = RANKS[j];
			let hand: string;
            let combos: number;
			if (i === j) {
				hand = r1 + r2;
                combos = 6;
			} else if (j > i) {
				hand = r1 + r2 + 's';
                combos = 4;
			} else {
				hand = r2 + r1 + 'o';
                combos = 12;
			}

			const verdict = evaluateHandDetailOptimized(hand, shoveProfile, requiredEquity);

			if (verdict === 'CORE_CALL') {
				callCombos += combos;
				coreCallCombos += combos;
			} else if (verdict === 'MARGINAL_CALL') {
				callCombos += combos;
				marginalCallCombos += combos;
			} else if (verdict === 'RISKY_FOLD') {
				foldCombos += combos;
				riskyFoldCombos += combos;
			} else {
				foldCombos += combos;
				deathFoldCombos += combos;
			}
		}
	}

	return {
		totalCombos,
		callCombos,
		callPercentage: (callCombos / totalCombos) * 100,
		foldCombos,
		foldPercentage: (foldCombos / totalCombos) * 100,
		coreCallCombos,
		marginalCallCombos,
		riskyFoldCombos,
		deathFoldCombos,
		requiredEquity,
		bubbleFactor,
	};
}

function runPerf() {
    let start = performance.now();
    for (let i = 0; i < 10000; i++) {
        computeRangeMatrixSummaryOptimized2('WIDE_40', 10, 1, 1);
    }
    let end = performance.now();
    console.log(`Optimized V2: ${end - start} ms`);
}

runPerf();
