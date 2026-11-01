const { performance } = require('perf_hooks');

function mockEvaluateHandDetail() {
  return { combos: 6, verdict: Math.random() > 0.5 ? 'CORE_CALL' : 'RISKY_FOLD' };
}

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

function testCompute(iterations = 1000) {
  let callCombos = 0;

  const start = performance.now();
  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < RANKS.length; i++) {
        for (let j = 0; j < RANKS.length; j++) {
            let r1 = RANKS[i];
            let r2 = RANKS[j];
            let hand;
            if (i === j) {
                hand = `${r1}${r2}`;
            } else if (j > i) {
                hand = `${r1}${r2}s`;
            } else {
                hand = `${r2}${r1}o`;
            }
            const detail = mockEvaluateHandDetail(hand);
            if (detail.verdict === 'CORE_CALL') {
                callCombos += detail.combos;
            }
        }
    }
  }
  const end = performance.now();
  console.log(`String iter execution time: ${end - start} ms`);
}
testCompute();
