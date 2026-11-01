import { computeRangeMatrixSummary } from './frontend/src/lib/holdemEquities';

function runBench() {
    const start = performance.now();
    for (let i = 0; i < 10000; i++) {
        computeRangeMatrixSummary('WIDE_40', 10, 1, 1);
    }
    const end = performance.now();
    console.log(`computeRangeMatrixSummary execution time (10000 iter): ${end - start} ms`);
}

runBench();
