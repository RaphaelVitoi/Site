import { computeBubbleFactorMatrix } from './frontend/src/lib/icmMatrix';

const stacks = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000];
const prizes = [100, 50, 30, 20, 10];

const start = performance.now();
for (let i = 0; i < 100; i++) {
    computeBubbleFactorMatrix(stacks, prizes);
}
const end = performance.now();
console.log(`Time: ${end - start}ms`);
