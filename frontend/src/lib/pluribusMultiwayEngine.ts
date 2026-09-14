/**
 * IDENTITY: Pluribus Multiway Engine & PMev Synthesis SOTA v7.0 GOLD
 * PATH: src/lib/pluribusMultiwayEngine.ts
 * ROLE: Resolução e compensação de passivo estrutural multiway (2 a 10 jogadores)
 *       inspirada no Pluribus (Science 2019) e formalismo PMev VITOI.
 */

export type PluribusAction = 'FOLD' | 'CALL' | 'RAISE';
export type TablePosition = 'BTN' | 'CO' | 'MP' | 'UTG' | 'SB' | 'BB';
export type TableStreet = 'preflop' | 'flop' | 'turn' | 'river';

export interface PluribusStateConfig {
	pot: number;
	numPlayers: number; // 2 a 10
	heroPosition: TablePosition;
	nominalEquity: number; // [0.0 - 1.0]
	activeStacks: number[];
	street?: TableStreet; // Padrão: flop
	lambdaFactor?: number; // Padrão: 2.25
	depthStreets?: number; // Padrão: 1
	iterations?: number; // Padrão: 60
}

export interface PluribusSolveOutput {
	strategy: Record<PluribusAction, number>;
	optimalAction: PluribusAction;
	structuralLiability: number;
	effectiveEquity: number;
	posMultiplier: number;
	kOpponents: number;
	iterations: number;
	depthStreets: number;
	evs: Record<PluribusAction, number>;
	effectiveStack: number;
	stackToPotRatio: number;
	callCost: number;
	raiseCost: number;
	futureStreets: number;
	horizonLiability: number;
}

const EPSILON = 1e-12;

/**
 * Motor de CFR+ (Counterfactual Regret Minimization Plus).
 * Implementa arrependimentos truncados em zero R+(a) = max(0, R(a))
 * e média ponderada linearmente de iterações O(1/T).
 */
export class CFRPlusEngine {
	private readonly actions: PluribusAction[];
	private readonly cumulativeRegrets: Record<PluribusAction, number>;
	private readonly strategySum: Record<PluribusAction, number>;
	private iteration: number = 0;

	constructor(actions: PluribusAction[]) {
		this.actions = [...actions];
		this.cumulativeRegrets = { FOLD: 0, CALL: 0, RAISE: 0 };
		this.strategySum = { FOLD: 0, CALL: 0, RAISE: 0 };
	}

	public getCurrentStrategy(): Record<PluribusAction, number> {
		const positiveRegrets: Record<PluribusAction, number> = {
			FOLD: Math.max(0, this.cumulativeRegrets.FOLD),
			CALL: Math.max(0, this.cumulativeRegrets.CALL),
			RAISE: Math.max(0, this.cumulativeRegrets.RAISE),
		};

		const total = positiveRegrets.FOLD + positiveRegrets.CALL + positiveRegrets.RAISE;
		if (total > EPSILON) {
			return {
				FOLD: positiveRegrets.FOLD / total,
				CALL: positiveRegrets.CALL / total,
				RAISE: positiveRegrets.RAISE / total,
			};
		}

		const uniform = 1 / this.actions.length;
		return { FOLD: uniform, CALL: uniform, RAISE: uniform };
	}

	public updateRegrets(
		actionUtilities: Record<PluribusAction, number>,
		nodeEv: number,
	): void {
		this.iteration += 1;
		const currentStrat = this.getCurrentStrategy();

		for (const a of this.actions) {
			const util = actionUtilities[a] ?? 0;
			const regret = util - nodeEv;
			// CFR+ regra: truncamento não-negativo
			this.cumulativeRegrets[a] = Math.max(0, this.cumulativeRegrets[a] + regret);
			// Ponderação linear das iterações
			this.strategySum[a] += this.iteration * currentStrat[a];
		}
	}

	public getAverageStrategy(): Record<PluribusAction, number> {
		const total = this.strategySum.FOLD + this.strategySum.CALL + this.strategySum.RAISE;
		if (total > EPSILON) {
			return {
				FOLD: this.strategySum.FOLD / total,
				CALL: this.strategySum.CALL / total,
				RAISE: this.strategySum.RAISE / total,
			};
		}
		const uniform = 1 / this.actions.length;
		return { FOLD: uniform, CALL: uniform, RAISE: uniform };
	}
}

/**
 * Calcula o Passivo Estrutural Multiway do PMev:
 * \Lambda_{\text{multiway}} = \lambda \cdot (k^2 - 1) \cdot (\text{Pot} \cdot 0.05)
 * Onde k = número de oponentes ativos.
 */
export function computeMultiwayStructuralLiability(
	pot: number,
	numPlayers: number,
	lambdaFactor: number = 2.25,
): number {
	const k = Math.max(1, numPlayers - 1);
	if (k <= 1) return 0;
	return Number((lambdaFactor * (k * k - 1) * (pot * 0.05)).toFixed(4));
}

/**
 * Solucionador de subjogos multiway no estilo Pluribus + PMev.
 */
export function solvePluribusMultiway(config: PluribusStateConfig): PluribusSolveOutput {
	const {
		pot,
		numPlayers,
		heroPosition,
		nominalEquity,
		lambdaFactor = 2.25,
		street = 'flop',
		depthStreets = 1,
		iterations = 60,
	} = config;

	if (!Number.isFinite(pot) || pot <= 0) throw new RangeError('pot must be finite and positive');
	if (!Number.isInteger(numPlayers) || numPlayers < 2 || numPlayers > 10) {
		throw new RangeError('numPlayers must be an integer between 2 and 10');
	}
	if (config.activeStacks.length !== numPlayers) {
		throw new RangeError('activeStacks length must equal numPlayers');
	}
	if (config.activeStacks.some((stack) => !Number.isFinite(stack) || stack <= 0)) {
		throw new RangeError('activeStacks must contain only finite positive values');
	}
	if (!Number.isFinite(nominalEquity) || nominalEquity < 0 || nominalEquity > 1) {
		throw new RangeError('nominalEquity must be finite and between 0 and 1');
	}
	if (!Number.isFinite(lambdaFactor) || lambdaFactor < 0) {
		throw new RangeError('lambdaFactor must be finite and non-negative');
	}
	if (!['BTN', 'CO', 'MP', 'UTG', 'SB', 'BB'].includes(heroPosition)) {
		throw new RangeError('heroPosition must be BTN, CO, MP, UTG, SB, or BB');
	}
	const maximumDepth: Record<TableStreet, number> = { preflop: 4, flop: 3, turn: 2, river: 1 };
	if (!Number.isInteger(depthStreets) || depthStreets < 1 || depthStreets > maximumDepth[street]) {
		throw new RangeError(`depthStreets must be between 1 and ${maximumDepth[street]} on ${street}`);
	}
	if (!Number.isInteger(iterations) || iterations < 1) {
		throw new RangeError('iterations must be a positive integer');
	}

	const kOpponents = Math.max(1, numPlayers - 1);
	const structuralLiability = computeMultiwayStructuralLiability(pot, numPlayers, lambdaFactor);

	// Multiplicador de realização posicional
	let posMultiplier = 1.0;
	if (['BTN', 'CO'].includes(heroPosition)) {
		posMultiplier = 1.15;
	} else if (['SB', 'BB', 'UTG'].includes(heroPosition)) {
		posMultiplier = 0.88;
	}

	// Equidade efetiva comprimida pela penalidade de passivo multiway
	const penaltyFraction = structuralLiability / Math.max(1, pot);
	const effectiveEquity = Math.max(
		0,
		Math.min(1, nominalEquity * posMultiplier - penaltyFraction),
	);

	const actions: PluribusAction[] = ['FOLD', 'CALL', 'RAISE'];
	const cfrEngine = new CFRPlusEngine(actions);
	const effectiveStack = Math.min(...config.activeStacks);
	const stackToPotRatio = effectiveStack / pot;
	const callCost = Math.min(pot * 0.5, effectiveStack);
	const raiseCost = Math.min(pot, effectiveStack);
	const futureStreets = depthStreets - 1;
	const callFutureExposure = Math.min(
		Math.max(effectiveStack - callCost, 0),
		pot * 0.25 * futureStreets,
	);
	const raiseFutureExposure = Math.min(
		Math.max(effectiveStack - raiseCost, 0),
		pot * 0.5 * futureStreets,
	);
	const horizonLiability = structuralLiability * 0.1 * futureStreets;
	const futureEdge = 2 * effectiveEquity - 1;

	const finalCallEv =
		effectiveEquity * pot -
		(1 - effectiveEquity) * callCost +
		futureEdge * callFutureExposure -
		horizonLiability * 0.5;
	const finalRaiseEv =
		effectiveEquity * pot * 1.5 -
		(1 - effectiveEquity) * raiseCost -
		structuralLiability +
		futureEdge * raiseFutureExposure -
		horizonLiability;
	const foldEv = 0;

	// Auto-jogo de iterações de CFR+
	const iters = Math.max(1, iterations);
	for (let i = 0; i < iters; i++) {
		const nodeEv = (foldEv + finalCallEv + finalRaiseEv) / 3;
		cfrEngine.updateRegrets(
			{ FOLD: foldEv, CALL: finalCallEv, RAISE: finalRaiseEv },
			nodeEv,
		);
	}

	const strategy = cfrEngine.getAverageStrategy();

	// Encontra a ação ótima com maior frequência convergida
	let optimalAction: PluribusAction = 'FOLD';
	let maxFreq = -1;
	for (const a of actions) {
		if (strategy[a] > maxFreq) {
			maxFreq = strategy[a];
			optimalAction = a;
		}
	}

	return {
		strategy: {
			FOLD: Number(strategy.FOLD.toFixed(4)),
			CALL: Number(strategy.CALL.toFixed(4)),
			RAISE: Number(strategy.RAISE.toFixed(4)),
		},
		optimalAction,
		structuralLiability,
		effectiveEquity: Number(effectiveEquity.toFixed(4)),
		posMultiplier,
		kOpponents,
		iterations: iters,
		depthStreets,
		effectiveStack: Number(effectiveStack.toFixed(4)),
		stackToPotRatio: Number(stackToPotRatio.toFixed(4)),
		callCost: Number(callCost.toFixed(4)),
		raiseCost: Number(raiseCost.toFixed(4)),
		futureStreets,
		horizonLiability: Number(horizonLiability.toFixed(4)),
		evs: {
			FOLD: 0,
			CALL: Number(finalCallEv.toFixed(4)),
			RAISE: Number(finalRaiseEv.toFixed(4)),
		},
	};
}
