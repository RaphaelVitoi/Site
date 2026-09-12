/**
 * IDENTITY: Pluribus Multiway Engine & PMev Synthesis SOTA v7.0 GOLD
 * PATH: src/lib/pluribusMultiwayEngine.ts
 * ROLE: Resolução e compensação de passivo estrutural multiway (3 a 6 jogadores)
 *       inspirada no Pluribus (Science 2019) e formalismo PMev VITOI.
 */

export type PluribusAction = 'FOLD' | 'CALL' | 'RAISE';
export type TablePosition = 'BTN' | 'CO' | 'MP' | 'UTG' | 'SB' | 'BB';

export interface PluribusStateConfig {
	pot: number;
	numPlayers: number; // 2 a 6
	heroPosition: TablePosition;
	nominalEquity: number; // [0.0 - 1.0]
	activeStacks: number[];
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
}

const EPSILON = 1e-12;

/**
 * Motor de CFR+ (Counterfactual Regret Minimization Plus).
 * Implementa arrependimentos truncados em zero R+(a) = max(0, R(a))
 * e média ponderada linearmente de iterações O(1/T).
 */
export class CFRPlusEngine {
	private readonly actions: PluribusAction[];
	private cumulativeRegrets: Record<PluribusAction, number>;
	private strategySum: Record<PluribusAction, number>;
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
		depthStreets = 1,
		iterations = 60,
	} = config;

	const kOpponents = Math.max(1, numPlayers - 1);
	const structuralLiability = computeMultiwayStructuralLiability(pot, numPlayers, lambdaFactor);

	// Multiplicador de realização posicional
	const posMultiplier = ['BTN', 'CO'].includes(heroPosition)
		? 1.15
		: ['SB', 'BB', 'UTG'].includes(heroPosition)
			? 0.88
			: 1.0;

	// Equidade efetiva comprimida pela penalidade de passivo multiway
	const penaltyFraction = structuralLiability / Math.max(1, pot);
	const effectiveEquity = Math.max(
		0,
		Math.min(1, nominalEquity * posMultiplier - penaltyFraction),
	);

	const actions: PluribusAction[] = ['FOLD', 'CALL', 'RAISE'];
	const cfrEngine = new CFRPlusEngine(actions);

	let finalCallEv = 0;
	let finalRaiseEv = 0;
	const foldEv = 0;

	// Auto-jogo de iterações de CFR+
	const iters = Math.max(1, iterations);
	for (let i = 0; i < iters; i++) {
		finalCallEv =
			effectiveEquity * pot - (1 - effectiveEquity) * (pot * 0.5);
		finalRaiseEv =
			effectiveEquity * pot * 1.5 -
			(1 - effectiveEquity) * pot -
			structuralLiability;

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
		evs: {
			FOLD: 0,
			CALL: Number(finalCallEv.toFixed(2)),
			RAISE: Number(finalRaiseEv.toFixed(2)),
		},
	};
}
