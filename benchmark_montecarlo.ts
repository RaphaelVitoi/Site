import { calculateIcmMonteCarlo } from './frontend/src/lib/montecarlo';

const stacks = Array.from({ length: 300 }, (_, i) => 1000 + i * 10);
const prizes = [100, 50, 30, 20, 10];

const start = performance.now();
for (let i = 0; i < 50; i++) {
    calculateIcmMonteCarlo(stacks, prizes, { iterations: 10000, seed: 42 });
}
const end = performance.now();
console.log(`Time: ${end - start}ms`);
