import { computeRangeMatrixSummary, evaluateHandDetail, RANKS } from './frontend/src/lib/holdemEquities';
const { performance } = require('perf_hooks');

function computeRangeMatrixSummaryOptimized(
    shoveProfile: any,
    riskPremium: number,
    risk: number = 1,
    reward: number = 1
): any {
    const { requiredEquity, bubbleFactor } = { requiredEquity: 50, bubbleFactor: 1.5 }; // mock
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
            if (i === j) {
                hand = r1 + r2;
            } else if (j > i) {
                hand = r1 + r2 + 's';
            } else {
                hand = r2 + r1 + 'o';
            }

            // We mock evaluateHandDetail logic here since calculateRequiredEquity is mocked
            const detail = evaluateHandDetail(hand, shoveProfile, riskPremium, risk, reward);
            const combos = detail.combos;

            if (detail.verdict === 'CORE_CALL') {
                callCombos += combos;
                coreCallCombos += combos;
            } else if (detail.verdict === 'MARGINAL_CALL') {
                callCombos += combos;
                marginalCallCombos += combos;
            } else if (detail.verdict === 'RISKY_FOLD') {
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
        callPercentage: Number(((callCombos / totalCombos) * 100).toFixed(1)),
        foldCombos,
        foldPercentage: Number(((foldCombos / totalCombos) * 100).toFixed(1)),
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
      computeRangeMatrixSummary('WIDE_40', 10, 1, 1);
   }
   let end = performance.now();
   console.log(`Original: ${end - start} ms`);

   start = performance.now();
   for (let i = 0; i < 10000; i++) {
      computeRangeMatrixSummaryOptimized('WIDE_40', 10, 1, 1);
   }
   end = performance.now();
   console.log(`Optimized: ${end - start} ms`);
}

runPerf();
