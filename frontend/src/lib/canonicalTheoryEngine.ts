/**
 * IDENTITY: Canonical Poker Theory Engine (Chen & Ankenman 2006, Matthew Janda 2013)
 * PATH: src/lib/canonicalTheoryEngine.ts
 * ROLE: Motor client-side para calculos analiticos em forma fechada:
 *       - Janda MDF (Minimum Defense Frequency) & Responsabilidade Multiway
 *       - Janda Geometric Sizing (Dimensionamento Geometrico Multi-Street)
 *       - Chen & Ankenman Indifference & Clairvoyance Cutoffs
 *       - Janda Value-to-Bluff Ratios (Flop, Turn, River)
 */

export interface JandaMDFOutput {
	pot: number;
	bet: number;
	alpha: number; // Pot odds oferecidas: B / (P + B)
	mdf: number; // Frequencia minima de defesa: P / (P + B)
	mdfPercentage: number;
	alphaPercentage: number;
	isMultiway: boolean;
	numDefenders: number;
	individualMdf: number;
}

export interface GeometricStep {
	streetIndex: number;
	streetName: string;
	startingPot: number;
	betSize: number;
	potFraction: number;
	finalPotIfCalled: number;
	remainingStackAfterBet: number;
}

export interface JandaGeometricSizingOutput {
	startingPot: number;
	effectiveStack: number;
	targetFinalPot: number;
	numStreets: number;
	constantPotFraction: number;
	potFractionPercentage: number;
	steps: GeometricStep[];
}

export interface ChenIndifferenceOutput {
	pot: number;
	bet: number;
	alpha: number;
	defenderCallFrequency: number;
	bluffFrequencyInBetRange: number; // B / (P + 2B)
	gameValueHero: number; // B^2 / (2(P + B))
}

export interface JandaBluffRatioOutput {
	betFractionOfPot: number;
	alpha: number;
	riverBluffToValueRatio: number;
	riverBluffPercentage: number;
	turnBluffToValueRatio: number;
	turnBluffPercentage: number;
	flopBluffToValueRatio: number;
	flopBluffPercentage: number;
}

const EPSILON = 1e-12;
const STREET_NAMES = ['Flop', 'Turn', 'River', 'River+1'];

/**
 * Calcula a Minimum Defense Frequency (MDF) de Matthew Janda (Partes 1 & 12).
 */
export function calculateJandaMDF(
	pot: number,
	bet: number,
	numDefenders: number = 1,
): JandaMDFOutput {
	const p = Math.max(EPSILON, pot);
	const b = Math.max(EPSILON, bet);
	const k = Math.max(1, numDefenders);

	const alpha = b / (p + b);
	const mdf = p / (p + b);
	const individualMdf = k === 1 ? mdf : 1 - Math.pow(alpha, 1 / k);

	return {
		pot: p,
		bet: b,
		alpha: Number(alpha.toFixed(4)),
		mdf: Number(mdf.toFixed(4)),
		mdfPercentage: Number((mdf * 100).toFixed(2)),
		alphaPercentage: Number((alpha * 100).toFixed(2)),
		isMultiway: k > 1,
		numDefenders: k,
		individualMdf: Number(individualMdf.toFixed(4)),
	};
}

/**
 * Dimensionamento Geometrico de Apostas de Janda (Partes 3 & 14).
 * (1 + 2r)^n = (P + 2S) / P
 */
export function calculateJandaGeometricSizing(
	pot: number,
	effectiveStack: number,
	numStreets: number = 3,
): JandaGeometricSizingOutput {
	const p = Math.max(EPSILON, pot);
	const s = Math.max(EPSILON, effectiveStack);
	const n = Math.max(1, numStreets);

	const targetFinalPot = p + 2 * s;
	const growthFactor = targetFinalPot / p;
	const r = 0.5 * (Math.pow(growthFactor, 1 / n) - 1);

	const steps: GeometricStep[] = [];
	let currentP = p;
	let currentS = s;

	for (let i = 0; i < n; i++) {
		const name = STREET_NAMES[i] ?? `Street_${i + 1}`;
		const betSize = Math.min(currentS, r * currentP);
		const newP = currentP + 2 * betSize;
		const newS = Math.max(0, currentS - betSize);

		steps.push({
			streetIndex: i + 1,
			streetName: name,
			startingPot: Number(currentP.toFixed(2)),
			betSize: Number(betSize.toFixed(2)),
			potFraction: Number(r.toFixed(4)),
			finalPotIfCalled: Number(newP.toFixed(2)),
			remainingStackAfterBet: Number(newS.toFixed(2)),
		});

		currentP = newP;
		currentS = newS;
	}

	return {
		startingPot: Number(p.toFixed(2)),
		effectiveStack: Number(s.toFixed(2)),
		targetFinalPot: Number(targetFinalPot.toFixed(2)),
		numStreets: n,
		constantPotFraction: Number(r.toFixed(4)),
		potFractionPercentage: Number((r * 100).toFixed(2)),
		steps,
	};
}

/**
 * Ponto de Indiferenca e Solucao Analitica de Chen & Ankenman (Cap. 11).
 */
export function calculateChenIndifference(pot: number, bet: number): ChenIndifferenceOutput {
	const p = Math.max(EPSILON, pot);
	const b = Math.max(EPSILON, bet);

	const alpha = b / (p + b);
	const defenderCallFrequency = p / (p + b);
	const bluffFrequencyInBetRange = b / (p + 2 * b);
	const gameValueHero = (b * b) / (2 * (p + b));

	return {
		pot: p,
		bet: b,
		alpha: Number(alpha.toFixed(4)),
		defenderCallFrequency: Number(defenderCallFrequency.toFixed(4)),
		bluffFrequencyInBetRange: Number(bluffFrequencyInBetRange.toFixed(4)),
		gameValueHero: Number(gameValueHero.toFixed(4)),
	};
}

/**
 * Razao de Blefes para Valor por Rua de Janda (Parte 5).
 */
export function calculateJandaBluffValueRatios(betFraction: number): JandaBluffRatioOutput {
	const f = Math.max(0.01, betFraction);
	const alpha = f / (1 + f);

	const rRiver = alpha;
	const pctRiver = rRiver / (1 + rRiver);

	const rTurn = Math.pow(1 + alpha, 2) - 1;
	const pctTurn = rTurn / (1 + rTurn);

	const rFlop = Math.pow(1 + alpha, 3) - 1;
	const pctFlop = rFlop / (1 + rFlop);

	return {
		betFractionOfPot: Number(f.toFixed(4)),
		alpha: Number(alpha.toFixed(4)),
		riverBluffToValueRatio: Number(rRiver.toFixed(4)),
		riverBluffPercentage: Number((pctRiver * 100).toFixed(2)),
		turnBluffToValueRatio: Number(rTurn.toFixed(4)),
		turnBluffPercentage: Number((pctTurn * 100).toFixed(2)),
		flopBluffToValueRatio: Number(rFlop.toFixed(4)),
		flopBluffPercentage: Number((pctFlop * 100).toFixed(2)),
	};
}
