import { RANKS } from './frontend/src/lib/holdemEquities';

function testEntries() {
  const start = performance.now();
  let count = 0;
  for (let k = 0; k < 10000; k++) {
    for (const [i, r1] of RANKS.entries()) {
      for (const [j, r2] of RANKS.entries()) {
         count++;
      }
    }
  }
  const end = performance.now();
  console.log(`entries: ${end - start} ms, count: ${count}`);
}

function testPrimitive() {
  const start = performance.now();
  let count = 0;
  for (let k = 0; k < 10000; k++) {
    for (let i = 0; i < RANKS.length; i++) {
      let r1 = RANKS[i];
      for (let j = 0; j < RANKS.length; j++) {
         let r2 = RANKS[j];
         count++;
      }
    }
  }
  const end = performance.now();
  console.log(`primitive: ${end - start} ms, count: ${count}`);
}

testEntries();
testPrimitive();
