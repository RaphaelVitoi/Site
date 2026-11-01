import { getHandEquityAgainstProfile, calculateRequiredEquity } from './frontend/src/lib/holdemEquities';
const { performance } = require('perf_hooks');

function runPerf() {
    let start = performance.now();
    for (let i = 0; i < 1690000; i++) {
        getHandEquityAgainstProfile('AA', 'WIDE_40');
    }
    let end = performance.now();
    console.log(`getHandEquityAgainstProfile: ${end - start} ms`);

    start = performance.now();
    for (let i = 0; i < 1690000; i++) {
        calculateRequiredEquity(10, 1, 1);
    }
    end = performance.now();
    console.log(`calculateRequiredEquity: ${end - start} ms`);
}

runPerf();
