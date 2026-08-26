/**
 * IDENTITY: SOTA Dynamic Fold Equity & Bayesian Polarization Engine (v7.0 GOLD)
 * PATH: src/lib/dynamicFoldEquityEngine.ts
 * ROLE: Resolvedor de Equidade de Descarte Dinâmica (Fold Equity),
 *       Fold Equity Reversa (Break-Even Fold %) e Elasticidade Bayesiana de Range sob Pressão ICM.
 */

export interface DynamicFoldEquityParams {
	potSize: number; // Tamanho do pote atual (BB ou fichas)
	betSize: number; // Tamanho da aposta/shove (BB ou fichas)
	opponentCallSize?: number; // Valor que o oponente precisa pagar (default = betSize)
	showdownEquity: number; // Equidade no showdown [0, 1] (ex: 0.35 para 35%)
	baseOpponentFoldProb?: number; // Frequência base de fold do vilão [0, 1]
	polarizationIndex?: number; // Índice de polarização do range [0, 1] (0 = fundido/linear, 1 = perfeitamente polarizado)
	icmBubbleFactor?: number; // Fator de bolha ICM (1.0 = chipEV puro, >1.0 = pressão ICM)
	aggressionFactor?: number; // Fator de agressividade do vilão (AF)
}

export interface ElasticityPoint {
	betRatio: number; // Bet / Pot ratio (ex: 0.33, 0.5, 0.75, 1.0, 1.5, 2.0)
	betAmount: number;
	foldProbability: number; // [0, 1]
	expectedValue: number; // EV em BB
	isProfitable: boolean;
	requiredFoldEquity: number;
}

export interface DynamicFoldEquityResult {
	requiredFoldEquity: number; // Fold Equity mínima de Break-Even [0, 1]
	requiredFoldEquityPct: number; // [0, 100]%
	effectiveFoldProbability: number; // Fold prob calibrada por Bayes e ICM [0, 1]
	effectiveFoldProbabilityPct: number; // [0, 100]%
	evShove: number; // EV da jogada com Fold Equity
	evCheckFold: number; // EV de referência
	netEvDelta: number; // EV_shove - EV_checkFold
	isPositiveEv: boolean;
	potOddsShowdown: number; // Odds diretas de showdown [0, 1]
	potOddsShowdownPct: number;
	mdfAlpha: number; // Minimum Defense Frequency do vilão (1 / (1 + alpha))
	elasticityCurve: ElasticityPoint[];
	verdict: 'PURE_VALUE' | 'PROFITABLE_SEMI_BLUFF' | 'ICM_AIR_BLUFF' | 'NEGATIVE_EV_PUNT';
	verdictDescription: string;
}

/**
 * Calcula a Fold Equity Reversa necessária para break-even ($FE_{req}$)
 * Formula analítica:
 * EV = FE * Pot + (1 - FE) * [ Eq * (Pot + Bet + Call) - (1 - Eq) * Bet ] = 0
 */
export function calculateReverseRequiredFoldEquity(
	betSize: number,
	potSize: number,
	showdownEquity: number,
	opponentCallSize?: number
): number {
	const call = opponentCallSize ?? betSize;
	const totalPotAtShowdown = potSize + betSize + call;
	const evWhenCalled = showdownEquity * totalPotAtShowdown - betSize;

	// Se o EV ao tomar call já for >= 0, não precisamos de nenhuma fold equity (FE_req = 0)
	if (evWhenCalled >= 0) {
		return 0;
	}

	const denominator = potSize - evWhenCalled;
	if (denominator <= 0) return 1.0;

	const feReq = -evWhenCalled / denominator;
	return Math.min(1.0, Math.max(0.0, Number(feReq.toFixed(4))));
}

/**
 * Calcula a probabilidade efetiva de fold do oponente modelada por Bayes e distorção ICM
 */
export function calculateEffectiveFoldProbability(
	potSize: number,
	betSize: number,
	baseFoldProb: number = 0.4,
	polarization: number = 0.5,
	bubbleFactor: number = 1.0,
	aggressionFactor: number = 2.0
): number {
	const alpha = betSize / (potSize || 1);
	// Minimum Defense Frequency teórica: MDF = 1 / (1 + alpha) -> Alpha Fold = 1 - MDF = alpha / (1 + alpha)
	const mdfFold = alpha / (1 + alpha);

	// Ponderação Bayesiana: combina a tendência base com o impacto do bet sizing
	const bayesianFold = (baseFoldProb * 0.4) + (mdfFold * 0.4) + (polarization * 0.2);

	// Modulação por Agressividade do Vilão (AF alto folda menos vs apostas médias, AF baixo folda mais)
	let afModifier = 1.0;
	if (aggressionFactor > 2.5) {
		afModifier = 0.92;
	} else if (aggressionFactor < 1.5) {
		afModifier = 1.08;
	}
	const adjustedFold = Math.min(0.95, Math.max(0.05, bayesianFold * afModifier));

	// Distorção de Sobrevivência ICM (Bubble Factor > 1.0 força o vilão a foldar mais para preservar stack)
	const icmElasticFold = 1 - Math.pow(1 - adjustedFold, Math.max(1.0, bubbleFactor));

	return Number(Math.min(0.99, Math.max(0.01, icmElasticFold)).toFixed(4));
}

/**
 * Motor Principal: Calcula EV dinâmico, Fold Equity Reversa e Curva de Elasticidade
 */
export function calculateDynamicFoldEquity(params: DynamicFoldEquityParams): DynamicFoldEquityResult {
	const {
		potSize,
		betSize,
		opponentCallSize = betSize,
		showdownEquity,
		baseOpponentFoldProb = 0.4,
		polarizationIndex = 0.5,
		icmBubbleFactor = 1.0,
		aggressionFactor = 2.0,
	} = params;

	const alpha = betSize / (potSize || 1);
	const mdfAlpha = Number((1 / (1 + alpha)).toFixed(4));

	const totalPotShowdown = potSize + betSize + opponentCallSize;
	const potOddsShowdown = Number((betSize / totalPotShowdown).toFixed(4));

	const feReq = calculateReverseRequiredFoldEquity(betSize, potSize, showdownEquity, opponentCallSize);
	const feEff = calculateEffectiveFoldProbability(
		potSize,
		betSize,
		baseOpponentFoldProb,
		polarizationIndex,
		icmBubbleFactor,
		aggressionFactor
	);

	// Cálculo do EV da aposta/shove com Fold Equity
	const evWhenFold = potSize;
	const evWhenCall = showdownEquity * totalPotShowdown - betSize;
	const evShove = Number((feEff * evWhenFold + (1 - feEff) * evWhenCall).toFixed(2));
	const evCheckFold = 0; // Baseline EV
	const netEvDelta = Number((evShove - evCheckFold).toFixed(2));
	const isPositiveEv = netEvDelta >= 0;

	// Classificação do Veredito da Jogada
	let verdict: DynamicFoldEquityResult['verdict'];
	let verdictDescription: string;

	if (showdownEquity >= potOddsShowdown) {
		verdict = 'PURE_VALUE';
		verdictDescription = `Aposta por Valor Puro. A equidade no showdown (${(showdownEquity * 100).toFixed(1)}%) supera as Pot Odds (${(potOddsShowdown * 100).toFixed(1)}%), sendo +EV mesmo com 0% de folds do vilão.`;
	} else if (isPositiveEv && showdownEquity >= 0.20) {
		verdict = 'PROFITABLE_SEMI_BLUFF';
		verdictDescription = `Semi-Blefe Lucrativo. A combinação de equidade de showdown (${(showdownEquity * 100).toFixed(1)}%) e Fold Equity (${(feEff * 100).toFixed(1)}%) supera o limiar de break-even (${(feReq * 100).toFixed(1)}%).`;
	} else if (isPositiveEv) {
		verdict = 'ICM_AIR_BLUFF';
		verdictDescription = `Blefe de Pressão ICM. Lucrativo exclusivamente pela alta taxa de fold forçada pelo fator de bolha (BF = ${icmBubbleFactor.toFixed(2)}x).`;
	} else {
		verdict = 'NEGATIVE_EV_PUNT';
		verdictDescription = `Jogada -EV (Punt). A Fold Equity efetiva (${(feEff * 100).toFixed(1)}%) é insuficiente para cobrir o limiar de break-even (${(feReq * 100).toFixed(1)}%). Recomenda-se Check/Fold.`;
	}

	// Geração da Curva de Elasticidade de Bet Sizing
	const betMultipliers = [0.25, 0.33, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
	const elasticityCurve: ElasticityPoint[] = betMultipliers.map((ratio) => {
		const amount = Number((potSize * ratio).toFixed(1));
		const fReq = calculateReverseRequiredFoldEquity(amount, potSize, showdownEquity, amount);
		const fEff = calculateEffectiveFoldProbability(
			potSize,
			amount,
			baseOpponentFoldProb,
			polarizationIndex,
			icmBubbleFactor,
			aggressionFactor
		);
		const evCall = showdownEquity * (potSize + amount * 2) - amount;
		const ev = Number((fEff * potSize + (1 - fEff) * evCall).toFixed(2));

		return {
			betRatio: ratio,
			betAmount: amount,
			foldProbability: fEff,
			expectedValue: ev,
			isProfitable: ev >= 0,
			requiredFoldEquity: fReq,
		};
	});

	return {
		requiredFoldEquity: feReq,
		requiredFoldEquityPct: Number((feReq * 100).toFixed(2)),
		effectiveFoldProbability: feEff,
		effectiveFoldProbabilityPct: Number((feEff * 100).toFixed(2)),
		evShove,
		evCheckFold,
		netEvDelta,
		isPositiveEv,
		potOddsShowdown,
		potOddsShowdownPct: Number((potOddsShowdown * 100).toFixed(2)),
		mdfAlpha,
		elasticityCurve,
		verdict,
		verdictDescription,
	};
}

// ==============================================================================
// EXTENSÃO AXIOMÁTICA PMev (CHICO SOTA v8.0 GOLD)
// ==============================================================================

export interface TableStateDTO {
	stacks: number[];
	payouts: number[];
	smallBlind: number;
	bigBlind: number;
	ante?: number;
	heroIndex: number;
}

export interface HandContextDTO {
	rawEquity: number;
	isInPosition: boolean;
	spr: number;
	numOpponents: number;
	playabilityIndex?: number;
	baseRioPenalty?: number;
}

export function computeDynamicFoldEV(state: TableStateDTO, posFromBB = 2): number {
	const n = state.stacks.length;
	const totalChips = Math.max(1e-9, state.stacks.reduce((a, b) => a + b, 0));
	const totalPayout = state.payouts.reduce((a, b) => a + b, 0);
	const orbitCost = state.smallBlind + state.bigBlind + (state.ante ?? 0) * n;

	const friction = (orbitCost / n) * (1.0 + posFromBB / Math.max(1, n));
	const heroStack = state.stacks[state.heroIndex] ?? 0;
	const decayedHeroStack = Math.max(0, heroStack - friction);
	const baseFoldEV = (decayedHeroStack / totalChips) * totalPayout;

	let bystanderGain = 0;
	for (let j = 0; j < n; j++) {
		for (let k = j + 1; k < n; k++) {
			if (j === state.heroIndex || k === state.heroIndex) continue;
			const stackJ = state.stacks[j] ?? 0;
			const stackK = state.stacks[k] ?? 0;
			const shorterStack = Math.min(stackJ, stackK);
			const largerStack = Math.max(stackJ, stackK);

			const pAllIn = Math.exp(-0.08 * shorterStack);
			const pElim = largerStack / Math.max(1e-9, stackJ + stackK);
			const heroShare = heroStack / Math.max(1e-9, totalChips - shorterStack);
			const payjumpValue = (totalPayout / Math.max(1, n)) * 0.40;

			bystanderGain += pAllIn * pElim * heroShare * payjumpValue;
		}
	}

	return Number((baseFoldEV + bystanderGain).toFixed(4));
}

export function computeRealizationFactor(ctx: HandContextDTO): number {
	if (ctx.spr <= 0.1) return 1.0;
	const posBase = ctx.isInPosition ? 1.15 : 0.85;
	const playability = ctx.playabilityIndex ?? 1.0;
	const sprModifier = Math.tanh(0.35 * ctx.spr);
	return Number(Math.max(0.4, Math.min(1.4, posBase * (1.0 + sprModifier * (playability - 1.0)))).toFixed(4));
}

export function computeMultiwayLiability(ctx: HandContextDTO, potSize: number, heroStack: number): number {
	const n = Math.max(1, ctx.numOpponents);
	if (n === 1) return 0.0;
	const baseRio = ctx.baseRioPenalty ?? 0.08;
	return Number((baseRio * Math.pow(n, 2) * (potSize / Math.max(1e-9, heroStack))).toFixed(4));
}

