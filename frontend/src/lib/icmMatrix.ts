/**
 * SOTA Malmuth-Harville ICM & Bubble Factor Matrix Engine (Client-Side)
 * Portado e calibrado sob governança de Raphael Vitoi
 *
 * @format
 */

export interface ICMTournamentPreset {
	id: string;
	name: string;
	category: string;
	payouts: number[];
	defaultStacks: { name: string; chips: number; pos: string }[];
}

export interface PairwiseMatchupDetail {
	heroIndex: number;
	villainIndex: number;
	heroName: string;
	villainName: string;
	effectiveChips: number;
	heroBaseEv: number;
	villainBaseEv: number;
	heroWinEv: number;
	heroLoseEv: number;
	deltaWin: number;
	deltaLose: number;
	bubbleFactor: number;
	riskPremium: number;
	requiredEquity: number;
	riskAsymmetry: number;
	coverageAdvantage: boolean;
	tacticalAdvice: string;
}

export interface BubbleFactorMatrixResult {
	nPlayers: number;
	playerNames: string[];
	stacks: number[];
	payouts: number[];
	totalChips: number;
	totalPrizePool: number;
	baseEv: number[];
	bfMatrix: number[][];
	rpMatrix: number[][];
	reqEquityMatrix: number[][];
	deltaWinMatrix: number[][];
	deltaLoseMatrix: number[][];
}

function requireValue<T>(value: T | undefined, context: string): T {
	if (value === undefined) {
		throw new RangeError(`Missing value: ${context}`);
	}
	return value;
}

function getItem<T>(arr: readonly T[], idx: number, name: string): T {
	const val = arr.at(idx);
	if (val === undefined) {
		throw new RangeError(`Missing item ${name}[${idx}]`);
	}
	return val;
}

function setItem<T>(arr: T[], idx: number, val: T, name: string): void {
	if (idx < 0 || idx >= arr.length || !Number.isInteger(idx)) {
		throw new RangeError(`Index out of bounds for ${name}[${idx}]`);
	}
	arr.splice(idx, 1, val);
}

function setMatrixCell(matrix: number[][], row: number, col: number, val: number, name: string): void {
	const r = matrix.at(row);
	if (!r) throw new RangeError(`Missing row ${name}[${row}]`);
	setItem(r, col, val, `${name}[${row}]`);
}

function matrixValue(matrix: readonly (readonly number[])[], row: number, column: number, name: string): number {
	const values = matrix.at(row);
	if (!values) throw new RangeError(`Missing row ${name}[${row}]`);
	const val = values.at(column);
	if (val === undefined) throw new RangeError(`Missing col ${name}[${row}][${column}]`);
	return val;
}

export const TOURNAMENT_PRESETS: ICMTournamentPreset[] = [
	{
		id: 'wsop-main-event-ft',
		name: 'WSOP Main Event FT (9-Max)',
		category: 'Championship / Monster Pay Jumps',
		payouts: [10000000, 6000000, 4000000, 3000000, 2400000, 1900000, 1500000, 1250000, 1000000],
		defaultStacks: [
			{ name: 'Chip Leader', chips: 135000000, pos: 'BTN' },
			{ name: 'Second Stack', chips: 85000000, pos: 'CO' },
			{ name: 'Mid Stack 1', chips: 54000000, pos: 'BB' },
			{ name: 'Mid Stack 2', chips: 42000000, pos: 'SB' },
			{ name: 'Mid Stack 3', chips: 35000000, pos: 'HJ' },
			{ name: 'Short Stack 1', chips: 22000000, pos: 'LJ' },
			{ name: 'Short Stack 2', chips: 16000000, pos: 'UTG+2' },
			{ name: 'Micro Stack 1', chips: 11000000, pos: 'UTG+1' },
			{ name: 'Micro Stack 2', chips: 8000000, pos: 'UTG' },
		],
	},
	{
		id: 'triton-shr-6max',
		name: 'Triton Super High Roller ($100k FT)',
		category: 'High Stakes / Heavy Payout Density',
		payouts: [2500000, 1650000, 1100000, 780000, 560000, 410000],
		defaultStacks: [
			{ name: 'Aggressive CL', chips: 12500000, pos: 'BTN' },
			{ name: 'Second Stack', chips: 8200000, pos: 'CO' },
			{ name: 'Mid Stack', chips: 5100000, pos: 'BB' },
			{ name: 'Mid Stack 2', chips: 3800000, pos: 'SB' },
			{ name: 'Short Stack', chips: 2200000, pos: 'HJ' },
			{ name: 'Micro Stack', chips: 1200000, pos: 'UTG' },
		],
	},
	{
		id: 'ft-3way-hyper',
		name: '3-Handed High Roller Final Table',
		category: '3-Way / Máxima Volatilidade',
		payouts: [150000, 95000, 55000],
		defaultStacks: [
			{ name: 'Leader (70bb)', chips: 7000000, pos: 'BTN' },
			{ name: 'Middle (40bb)', chips: 4000000, pos: 'SB' },
			{ name: 'Short (18bb)', chips: 1800000, pos: 'BB' },
		],
	},
	{
		id: 'sunday-million-4max',
		name: 'Major MTT Final 4 (Exponential Ladder)',
		category: 'Online Major / ICM Nuclear',
		payouts: [110000, 78000, 55000, 39000],
		defaultStacks: [
			{ name: 'CL (55bb)', chips: 55000000, pos: 'BTN' },
			{ name: '2nd (42bb)', chips: 42000000, pos: 'SB' },
			{ name: '3rd (25bb)', chips: 25000000, pos: 'BB' },
			{ name: 'Short (8bb)', chips: 8000000, pos: 'CO' },
		],
	},
];

/**
 * Calcula a equidade de Malmuth-Harville exata para N jogadores e M payouts
 */
export function calculateMalmuthHarville(stacks: number[], payouts: number[]): number[] {
	const n = stacks.length;
	if (n === 0) return [];

	const totalChips = stacks.reduce((sum, s) => sum + Math.max(0, s), 0);
	if (totalChips <= 0) return new Array(n).fill(0);

	const m = Math.min(payouts.length, n);
	const activePayouts = payouts.slice(0, m);

	// Matriz de probabilidades: P[player_i][position_k]
	const probMatrix: number[][] = Array.from({ length: n }, () => new Array(m).fill(0));

	// 1º Lugar
	for (let i = 0; i < n; i++) {
		const row = getItem(probMatrix, i, 'probMatrix');
		const stack = getItem(stacks, i, 'stacks');
		setItem(row, 0, Math.max(0, stack) / totalChips, 'probMatrixRow');
	}

	if (m > 1) {
		const computeBranch = (
			pos: number,
			usedBitmask: number,
			currentProb: number,
			remChips: number
		) => {
			if (pos >= m || remChips <= 0) return;

			for (let p = 0; p < n; p++) {
				const stack = getItem(stacks, p, 'stacks');
				if ((usedBitmask & (1 << p)) !== 0 || stack <= 0) continue;

				const probThis = stack / remChips;
				const branchProb = currentProb * probThis;
				const row = getItem(probMatrix, p, 'probMatrix');
				const currentProbVal = row.at(pos) ?? 0;
				setItem(row, pos, currentProbVal + branchProb, 'probMatrixRow');

				if (pos + 1 < m && remChips - stack > 0) {
					computeBranch(
						pos + 1,
						usedBitmask | (1 << p),
						branchProb,
						remChips - stack
					);
				}
			}
		};

		for (let p0 = 0; p0 < n; p0++) {
			const stack = getItem(stacks, p0, 'stacks');
			if (stack > 0) {
				const rem = totalChips - stack;
				if (rem > 0) {
					computeBranch(1, 1 << p0, matrixValue(probMatrix, p0, 0, 'probMatrix'), rem);
				}
			}
		}
	}

	return probMatrix.map((probs) =>
		probs.reduce((sum, p, k) => sum + p * (activePayouts.at(k) ?? 0), 0)
	);
}

/**
 * Computa a matriz completa de Bubble Factors e métricas entre todos os jogadores
 */
export function computeBubbleFactorMatrix(
	stacks: number[],
	payouts: number[],
	playerNames?: string[]
): BubbleFactorMatrixResult {
	const n = stacks.length;
	const names = playerNames || stacks.map((_, i) => `P${i + 1}`);
	const totalChips = stacks.reduce((a, b) => a + Math.max(0, b), 0);
	const totalPrizePool = payouts.slice(0, n).reduce((a, b) => a + b, 0);

	const baseEv = calculateMalmuthHarville(stacks, payouts);

	const bfMatrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(1.0));
	const rpMatrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0.0));
	const reqEquityMatrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(50.0));
	const deltaWinMatrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0.0));
	const deltaLoseMatrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0.0));

	for (let i = 0; i < n; i++) {
		for (let j = 0; j < n; j++) {
			const stackI = getItem(stacks, i, 'stacks');
			const stackJ = getItem(stacks, j, 'stacks');
			if (i === j || stackI <= 0 || stackJ <= 0) continue;

			const eff = Math.min(stackI, stackJ);

			// Win case (+eff)
			const winStacks = [...stacks];
			setItem(winStacks, i, getItem(winStacks, i, 'winStacks') + eff, 'winStacks');
			setItem(winStacks, j, getItem(winStacks, j, 'winStacks') - eff, 'winStacks');
			const evWin = getItem(calculateMalmuthHarville(winStacks, payouts), i, 'evWin');
			const baseEvI = getItem(baseEv, i, 'baseEv');
			const deltaWin = Math.max(1e-6, evWin - baseEvI);
			setMatrixCell(deltaWinMatrix, i, j, Number(deltaWin.toFixed(2)), 'deltaWinMatrix');

			// Lose case (-eff)
			const loseStacks = [...stacks];
			setItem(loseStacks, i, getItem(loseStacks, i, 'loseStacks') - eff, 'loseStacks');
			setItem(loseStacks, j, getItem(loseStacks, j, 'loseStacks') + eff, 'loseStacks');
			const evLose = getItem(calculateMalmuthHarville(loseStacks, payouts), i, 'evLose');
			const deltaLose = Math.max(1e-6, baseEvI - evLose);
			setMatrixCell(deltaLoseMatrix, i, j, Number(deltaLose.toFixed(2)), 'deltaLoseMatrix');

			const bf = deltaLose / deltaWin;
			setMatrixCell(bfMatrix, i, j, Number(bf.toFixed(3)), 'bfMatrix');

			const rp = Math.max(0, ((bf - 1.0) / (bf + 1.0)) * 100);
			setMatrixCell(rpMatrix, i, j, Number(rp.toFixed(2)), 'rpMatrix');

			const reqEq = (bf / (bf + 1.0)) * 100;
			setMatrixCell(reqEquityMatrix, i, j, Number(reqEq.toFixed(2)), 'reqEquityMatrix');
		}
	}

	return {
		nPlayers: n,
		playerNames: names,
		stacks,
		payouts,
		totalChips,
		totalPrizePool,
		baseEv: baseEv.map((v) => Number(v.toFixed(2))),
		bfMatrix,
		rpMatrix,
		reqEquityMatrix,
		deltaWinMatrix,
		deltaLoseMatrix,
	};
}

/**
 * Gera a análise tática detalhada de um confronto específico Hero vs Villain
 */
export function getPairwiseMatchupDetail(
	matrixResult: BubbleFactorMatrixResult,
	heroIdx: number,
	villainIdx: number
): PairwiseMatchupDetail {
	if (heroIdx < 0 || heroIdx >= matrixResult.nPlayers || !Number.isInteger(heroIdx)) {
		throw new RangeError(`Invalid heroIndex: ${heroIdx}`);
	}
	if (villainIdx < 0 || villainIdx >= matrixResult.nPlayers || !Number.isInteger(villainIdx)) {
		throw new RangeError(`Invalid villainIndex: ${villainIdx}`);
	}

	const { playerNames, stacks, baseEv, bfMatrix, rpMatrix, reqEquityMatrix, deltaWinMatrix, deltaLoseMatrix } =
		matrixResult;

	const heroName = playerNames.at(heroIdx) ?? `P${heroIdx + 1}`;
	const villainName = playerNames.at(villainIdx) ?? `P${villainIdx + 1}`;
	const heroStack = requireValue(stacks.at(heroIdx), `stacks[${heroIdx}]`);
	const villainStack = requireValue(stacks.at(villainIdx), `stacks[${villainIdx}]`);
	const heroBaseEv = requireValue(baseEv.at(heroIdx), `baseEv[${heroIdx}]`);
	const villainBaseEv = requireValue(baseEv.at(villainIdx), `baseEv[${villainIdx}]`);
	const eff = Math.min(heroStack, villainStack);

	const bf = matrixValue(bfMatrix, heroIdx, villainIdx, 'bfMatrix');
	const rp = matrixValue(rpMatrix, heroIdx, villainIdx, 'rpMatrix');
	const villainRp = matrixValue(rpMatrix, villainIdx, heroIdx, 'rpMatrix');
	const reqEq = matrixValue(reqEquityMatrix, heroIdx, villainIdx, 'reqEquityMatrix');
	const deltaWin = matrixValue(deltaWinMatrix, heroIdx, villainIdx, 'deltaWinMatrix');
	const deltaLose = matrixValue(deltaLoseMatrix, heroIdx, villainIdx, 'deltaLoseMatrix');
	const asymmetry = Number((rp - villainRp).toFixed(2));
	const coverageAdv = heroStack >= villainStack;

	let advice: string;
	if (rp >= 30 && !coverageAdv) {
		advice = '🚨 Risco Crítico de Eliminação: Fold exploitativo amplo. Exija equidade premium.';
	} else if (asymmetry <= -20 && coverageAdv) {
		advice = '⚡ Vantagem Absoluta de Cobertura: Maximize pressão de overbluff e pushes amplos.';
	} else if (rp < 10) {
		advice = '💡 Confronto Quase-ChipEV: Decisões muito próximas da equidade matemática bruta.';
	} else {
		advice = `Ajuste de Range: Adicione +${rp}% de equidade mínima em relação ao ChipEV puro.`;
	}

	return {
		heroIndex: heroIdx,
		villainIndex: villainIdx,
		heroName,
		villainName,
		effectiveChips: eff,
		heroBaseEv,
		villainBaseEv,
		heroWinEv: heroBaseEv + deltaWin,
		heroLoseEv: heroBaseEv - deltaLose,
		deltaWin,
		deltaLose,
		bubbleFactor: bf,
		riskPremium: rp,
		requiredEquity: reqEq,
		riskAsymmetry: asymmetry,
		coverageAdvantage: coverageAdv,
		tacticalAdvice: advice,
	};
}
