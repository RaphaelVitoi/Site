import { calculateIcmMonteCarlo } from './frontend/src/lib/montecarlo.ts';

const stacks = [1000, 2000, 3000, 4000, 5000, 1000, 2000, 3000, 4000, 5000, 1000, 2000, 3000, 4000, 5000, 1000, 2000, 3000, 4000, 5000, 1000, 2000, 3000, 4000, 5000, 1000, 2000, 3000, 4000, 5000, 1000, 2000, 3000];
const prizes = [100, 50, 30, 20, 10];

const start = performance.now();
for (let i = 0; i < 50; i++) {
    calculateIcmMonteCarlo(stacks, prizes, { iterations: 10000, seed: 42 });
}
const end = performance.now();
console.log(`Time: ${end - start}ms`);
