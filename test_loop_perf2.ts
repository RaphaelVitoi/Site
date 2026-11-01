import { computeRangeMatrixSummary } from './frontend/src/lib/holdemEquities';

const { performance } = require('perf_hooks');

function benchComputeRangeMatrixSummary() {
  const start = performance.now();
  for (let iter = 0; iter < 10000; iter++) {
    computeRangeMatrixSummary('WIDE_40', 10, 1, 1);
  }
  const end = performance.now();
  console.log(`Original: ${end - start} ms`);
}

benchComputeRangeMatrixSummary();
