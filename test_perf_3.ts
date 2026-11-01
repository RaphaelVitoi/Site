const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

function optimized() {
  const start = performance.now();
  let count = 0;
  for (let iter = 0; iter < 10000; iter++) {
    for (let i = 0; i < 13; i++) {
      const r1 = RANKS[i];
      for (let j = 0; j < 13; j++) {
        const r2 = RANKS[j];
        let hand;
        if (i === j) {
            hand = r1 + r2;
        } else if (j > i) {
            hand = r1 + r2 + 's';
        } else {
            hand = r2 + r1 + 'o';
        }
        count++;
      }
    }
  }
  const end = performance.now();
  console.log(`Optimized: ${end - start} ms, count: ${count}`);
}

function original() {
  const start = performance.now();
  let count = 0;
  for (let iter = 0; iter < 10000; iter++) {
    for (const [i, r1] of RANKS.entries()) {
      for (const [j, r2] of RANKS.entries()) {
        let hand: string;
        if (i === j) {
            hand = `${r1}${r2}`;
        } else if (j > i) {
            hand = `${r1}${r2}s`;
        } else {
            hand = `${r2}${r1}o`;
        }
        count++;
      }
    }
  }
  const end = performance.now();
  console.log(`Original: ${end - start} ms, count: ${count}`);
}

optimized();
original();
