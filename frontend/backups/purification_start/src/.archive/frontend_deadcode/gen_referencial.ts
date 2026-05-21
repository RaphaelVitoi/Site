// @ts-nocheck
import { deriveRps } from "./rpDeriver";

const FT9_PRIZES = [
  237.34, 170.96, 135.17, 109.99, 90.28, 73.95, 59.92, 47.56, 36.47,
];
const STACKS = [9.25, 52.24, 22.08, 6.88, 44.16, 24.16, 39.88, 12.73, 53.88]; // UTG a BB

console.log("Generating BF Matrix (Colisão Total)...");
const matrix: number[][] = [];

for (let i = 0; i < 9; i++) {
  const row: number[] = [];
  for (let j = 0; j < 9; j++) {
    if (i === j) {
      row.push(1);
      continue;
    }
    // Para a matriz de "Dor", usamos a colisão total (all-in)
    const result = deriveRps(
      STACKS,
      FT9_PRIZES,
      j,
      i,
      0,
      Math.min(STACKS[i], STACKS[j]),
    );
    if (result) {
      row.push(Number(result.allBfs[i].toFixed(2)));
    } else {
      row.push(1);
    }
  }
  matrix.push(row);
}

console.log("FINAL_MATRIX_START");
console.log(JSON.stringify(matrix));
console.log("FINAL_MATRIX_END");
