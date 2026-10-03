import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('frontend/src/lib/montecarlo.ts', 'utf8');

// Use typed arrays for totalEquity and sumSquares in runSingleMonteCarloIteration
content = content.replace(
  'totalEquity: number[],\n\tsumSquares: number[],\n\tplacementCounts: number[][],',
  'totalEquity: Float64Array,\n\tsumSquares: Float64Array,\n\tplacementCounts: Uint32Array,'
);

// In runSingleMonteCarloIteration, change placementCounts mapping
content = content.replace(
  /const pRow = placementCounts\[winnerIdx\];\n\t\t\tif \(pRow\) \{\n\t\t\t\tpRow\[j\] = \(pRow\[j\] \?\? 0\) \+ 1;\n\t\t\t\}/,
  'placementCounts[winnerIdx * numPrizes + j]++;'
);
content = content.replace(
  /totalEquity\[winnerIdx\] = \(totalEquity\[winnerIdx\] \?\? 0\) \+ prize;/,
  'totalEquity[winnerIdx] += prize;'
);
content = content.replace(
  /sumSquares\[winnerIdx\] = \(sumSquares\[winnerIdx\] \?\? 0\) \+ prize \* prize;/,
  'sumSquares[winnerIdx] += prize * prize;'
);


// In calculateIcmMonteCarlo, change initialization for zero stacks
content = content.replace(
  /const totalActiveEquity = new Array\(numActive\)\.fill\(0\);/,
  'const totalActiveEquity = new Float64Array(numActive);'
);
content = content.replace(
  /const sumActiveSquares = new Array\(numActive\)\.fill\(0\);/,
  'const sumActiveSquares = new Float64Array(numActive);'
);
content = content.replace(
  /const placementActiveCounts: number\[\]\[\] = Array\.from\(\{ length: numActive \}, \(\) => new Array\(kActive\)\.fill\(0\)\);/,
  'const placementActiveCounts = new Uint32Array(numActive * kActive);'
);


// In calculateIcmMonteCarlo, change mapping for zero stacks placementDistribution
content = content.replace(
  /const activePlacementRow = placementActiveCounts\[a\];\n\t\t\tconst targetRow = placementDistribution\[origIdx\];\n\t\t\tif \(activePlacementRow && targetRow\) \{\n\t\t\t\tfor \(let j = 0; j < kActive; j\+\+\) \{\n\t\t\t\t\ttargetRow\[j\] = \(activePlacementRow\[j\] \?\? 0\) \/ iterations;\n\t\t\t\t\}\n\t\t\t\}/,
  `const targetRow = placementDistribution[origIdx];
			if (targetRow) {
				for (let j = 0; j < kActive; j++) {
					targetRow[j] = placementActiveCounts[a * kActive + j]! / iterations;
				}
			}`
);

// In calculateIcmMonteCarlo, change initialization for normal
content = content.replace(
  /const totalEquity = new Array\(numPlayers\)\.fill\(0\);/,
  'const totalEquity = new Float64Array(numPlayers);'
);
content = content.replace(
  /const sumSquares = new Array\(numPlayers\)\.fill\(0\);/,
  'const sumSquares = new Float64Array(numPlayers);'
);
content = content.replace(
  /const placementCounts: number\[\]\[\] = Array\.from\(\{ length: numPlayers \}, \(\) => new Array\(k\)\.fill\(0\)\);/,
  'const placementCounts = new Uint32Array(numPlayers * k);'
);

// In calculateIcmMonteCarlo, change mapping for normal placementDistribution
content = content.replace(
  /const placementDistribution: number\[\]\[\] = placementCounts\.map\(\(row\) =>\n\t\trow\.map\(\(cnt\) => cnt \/ iterations\),\n\t\);/,
  `const placementDistribution: number[][] = Array.from({ length: numPlayers }, (_, i) => {
		const row = new Array(k);
		for (let j = 0; j < k; j++) {
			row[j] = placementCounts[i * k + j]! / iterations;
		}
		return row;
	});`
);

// also for variance calculation
content = content.replace(
  /const equities = totalEquity\.map\(\(e\) => e \/ iterations\);/,
  `const equities = new Array(numPlayers);
	for (let i = 0; i < numPlayers; i++) {
		equities[i] = totalEquity[i]! / iterations;
	}`
);

content = content.replace(
  /const variancePerPlayer = totalEquity\.map\(\(tot, i\) => \{/,
  `const variancePerPlayer = new Array(numPlayers);
	for (let i = 0; i < numPlayers; i++) {
		const tot = totalEquity[i]!;`
);
content = content.replace(
  /const stdErrorPerPlayer = variancePerPlayer\.map\(\(s2\) => \{/,
  `const stdErrorPerPlayer = new Array(numPlayers);
	for (let i = 0; i < numPlayers; i++) {
		const s2 = variancePerPlayer[i]!;`
);

content = content.replace(
  /return Number\(s2\.toFixed\(4\)\);\n\t\}\);/,
  `variancePerPlayer[i] = Number(s2.toFixed(4));
	}`
);

content = content.replace(
  /return Number\(Math\.sqrt\(s2 \/ iterations\)\.toFixed\(4\)\);\n\t\}\);/,
  `stdErrorPerPlayer[i] = Number(Math.sqrt(s2 / iterations).toFixed(4));
	}`
);

writeFileSync('frontend/src/lib/montecarlo.ts', content);
