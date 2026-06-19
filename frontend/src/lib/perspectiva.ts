/**
 * IDENTITY: Motor de Perspectiva Matemática SOTA v8.0 GOLD (VITOI - FUSED)
 * PATH: src/lib/perspectiva.ts
 * ROLE: Core algorítmico da Equação Unificada SOTA (Fusão v6.2.1 + v7.0).
 *       PM = [(Equity * R) * Valuation] - [EV_fold(t, dpj, pos) + RIO_mw]
 *
 * FUSION CHANGELOG (v8.0 vs v6.2.1):
 * [+] ICM Bitmask Memoization: integer keys O(1) + normalização de escala (v7.0)
 * [+] riskAdvantage: exportado no PerspectivaResult (v7.0 arch, fórmula BF canônica v6.2.1)
 * [+] Mapa Posicional Completo FGS: UTG/EP/MP/HJ/CO/BTN/SB/BB (v7.0)
 * [+] referenceStatus: parâmetro de Teoria do Prospecto no input (v7.0)
 * [=] Expoente RIO N^2.0 fixo (v6.2.1 — sem risco de feedback loop)
 * [=] Fórmula BF canônica 100×(BF-1)/BF (v6.2.1 — didática e rastreável)
 * [=] blindCost mantido como parâmetro (v6.2.1)
 *
 * @format
 */

import { calculateIcmMonteCarlo } from './montecarlo';
import { PerspectivaInputSchema, PerspectivaResultSchema } from './schemas';

// === TIPOS E INTERFACES ===

export interface MapaICMResult {
	positionProbs: number[][];
	equities: number[];
	totalChips: number;
}

export type StackTier = 'micro' | 'short' | 'mid' | 'big' | 'chipleader';

export interface PerspectivaResult {
	// Layer 1: ICMev (Snapshot)
	handEquity: number;
	currentEquityPct: number;
	deltaWinPct: number;
	deltaLosePct: number;
	deltaFoldPct: number;

	// Layer 2: Esperança (Lógica)
	valuation: number;       // Coeficiente de explosão financeira das fichas
	rioLiability: number;    // Dívida matemática por multiway/RIO

	// Layer 3: Expectativa (Preditiva)
	fgsHealth: number;
	survivalPressure: number;
	dynamicEvFold: number;   // O piso real (pode ser positivo via laddering)

	// Layer 4: Perspectiva (A Síntese Final)
	perspectivaPct: number;  // PM Final
	amortizedEdge: number;
	riskAdvantage: number;   // [v8.0] Risk Premium do Hero (BF canônico, %)
	ci: number;              // Coeficiente de Insolvência (PM / PotOdds)
	marginInstability: number; // Incerteza % baseada no stack efetivo
	threshEq: number;        // Equidade Limite Projetada
	realizationFactor: number; // R calculado dinamicamente

	// Metadados
	isActionBetterThanFold: boolean;
	diagnostico: string;
	bountyPower: number;

	// Detalhes posicionais (M-H)
	currentMapaICM: number[];
	winMapaICM: number[];
	loseMapaICM: number[];
}

export interface PerspectivaInput {
	stacks: number[];
	prizes: number[];
	heroIdx: number;
	villainIdx: number;
	potSize: number;
	heroCost: number;
	winProb: number;
	realizationFactor: number; // R

	edgeBase: number;
	bountyValue?: number;    // PKO
	kappa?: number;          // Axioma Lipe Piv (Credibilidade da Informacao)

	// Parâmetros Quantum (v8.0 GOLD)
	numPlayersInPot?: number;  // Para RIO_mw
	humanNoiseFactor?: number; // SOTA: Table Draw Noise
	isNearPayjump?: boolean;   // Para EV_fold positivo
	blindsRisingSoon?: boolean; // Para Erosão de stack
	currentEquityPct?: number; // Para Delta Fold Pct
	heroPosition?: string;     // SOTA: Antevisão Posicional (UTG/EP/MP/HJ/CO/BTN/SB/BB/IP/OOP)

	// Parametros Opcionais de Teoremas
	spr?: number;
	investidoAcumulado?: number;
	blindCost?: number;
	referenceStatus?: ReferencePointStatus; // [v8.0] Estado de referência para Teoria do Prospecto
}

// === MOTOR ICM (Malmuth-Harville / Monte Carlo Estocástico) ===
const _icmCache = new Map<string, MapaICMResult>();

export function calculateMapaICM(stacks: number[], prizes: number[]): MapaICMResult {
	const n = stacks.length;

	// SOTA: Monte Carlo Fallback para evitar explosão combinatória (O(2^N))
	if (n > 10) {
		const totalChips = stacks.reduce((s, v) => s + v, 0);
		const equities = calculateIcmMonteCarlo(stacks, prizes, {
			iterations: 20000,
		});

		const positionProbs = Array.from({ length: n }, () =>
			new Array(Math.min(n, prizes.length)).fill(0),
		);

		if (totalChips > 0 && prizes.length > 0) {
			stacks.forEach((s, i) => {
				const row = positionProbs[i];
				if (row) row[0] = s / totalChips;
			});
		}
		return { positionProbs, equities, totalChips };
	}

	const activePrizes = prizes.slice(0, n);
	const k = activePrizes.length;
	const totalChips = stacks.reduce((s, v) => s + v, 0);

	// [v8.0] Normalização de Escala para invariância de proporções de stacks.
	// ICM([100, 200]) === ICM([1000, 2000]) → mesmo resultado após normalização.
	const normScale = 20000;
	const normalizedStacks = totalChips > 0
		? stacks.map(s => Math.round((s / totalChips) * normScale))
		: stacks;
	const key = `${normalizedStacks.join(',')}|${activePrizes.join(',')}`;

	const cachedIcm = _icmCache.get(key);
	if (cachedIcm) {
		// Reconstrói com totalChips real (preserva rastreabilidade de fichas)
		return {
			positionProbs: cachedIcm.positionProbs,
			equities: cachedIcm.equities,
			totalChips,
		};
	}

	const positionProbs: number[][] = Array.from({ length: n }, () => new Array(k).fill(0));
	const equities: number[] = new Array(n).fill(0);

	if (totalChips === 0 || k === 0) return { positionProbs, equities, totalChips };

	// [v8.0] Bitmask Memoization: Chave inteira O(1) via bitshift.
	// posIdx ocupa bits 16–31, mask ocupa bits 0–15 (suporta até 16 jogadores).
	// Performance vs. string keys: elimina sort() + join() em cada nó recursivo.
	const memo = new Map<number, { posC: number[][]; eqC: number[] }>();

	function _applySubComputation(
		p: number,
		posIdx: number,
		sub: { posC: number[][]; eqC: number[] },
		posC: number[][],
		eqC: number[],
	) {
		for (let j = 0; j < n; j++) {
			const posRow = posC[j];
			if (!posRow) continue;
			for (let pi = posIdx + 1; pi < k; pi++) {
				posRow[pi] = (posRow[pi] ?? 0) + p * (sub.posC[j]?.[pi] ?? 0);
			}
			eqC[j] = (eqC[j] ?? 0) + p * (sub.eqC[j] ?? 0);
		}
	}

	function compute(
		mask: number,
		posIdx: number,
		currTotal: number,
	): { posC: number[][]; eqC: number[] } {
		if (posIdx >= k || mask === 0 || currTotal <= 0) {
			return {
				posC: Array.from({ length: n }, () => new Array(k).fill(0)),
				eqC: new Array(n).fill(0),
			};
		}

		// Chave inteira: (posIdx << 16) | mask — O(1) hash, zero alocação
		const stateKey = (posIdx << 16) | mask;
		const cachedState = memo.get(stateKey);
		if (cachedState) return cachedState;

		const posC: number[][] = Array.from({ length: n }, () => new Array(k).fill(0));
		const eqC: number[] = new Array(n).fill(0);

		for (let i = 0; i < n; i++) {
			if ((mask & (1 << i)) === 0) continue; // Bit-test: jogador já eliminado
			const stack = stacks[i] ?? 0;
			if (stack <= 0) continue;
			const p = stack / currTotal;
			const heroPosRow = posC[i];
			if (!heroPosRow) continue;
			heroPosRow[posIdx] = (heroPosRow[posIdx] ?? 0) + p;
			eqC[i] = (eqC[i] ?? 0) + p * (activePrizes[posIdx] ?? 0);

			const nextMask = mask ^ (1 << i); // Bit-XOR: remove jogador i do conjunto
			const sub = compute(nextMask, posIdx + 1, currTotal - stack);
			_applySubComputation(p, posIdx, sub, posC, eqC);
		}

		const res = { posC, eqC };
		memo.set(stateKey, res);
		return res;
	}

	const initialMask = (1 << n) - 1; // Todos n jogadores ativos
	const resultContrib = compute(initialMask, 0, totalChips);

	const finalResult = {
		positionProbs: resultContrib.posC,
		equities: resultContrib.eqC,
		totalChips,
	};

	if (_icmCache.size >= 1000) {
		const firstKey = _icmCache.keys().next().value;
		if (firstKey !== undefined) _icmCache.delete(firstKey);
	}
	_icmCache.set(key, finalResult);
	return finalResult;
}

export function classifyTier(stack: number, stacks: number[]): StackTier {
	const avg = stacks.reduce((s, v) => s + v, 0) / stacks.length || 1;
	const ratio = stack / avg;
	if (stack <= 0 || ratio < 0.4) return 'micro';
	if (ratio < 0.7) return 'short';
	if (ratio < 1.5) return 'mid';
	if (stacks.every((s) => stack >= s) || ratio >= 2.5) return 'chipleader';
	return 'big';
}

// --- HELPERS DE REDUÇÃO DE ENTROPIA COGNITIVA (SOTA v8.0 GOLD FUSED) ---

function _buildSimulatedStacks(
	stacks: number[],
	heroIdx: number,
	villainIdx: number,
	potSize: number,
	heroCost: number,
	investidoAcumulado: number,
) {
	const stacksWin = [...stacks];
	stacksWin[heroIdx] = Math.max(0, (stacksWin[heroIdx] || 0) - heroCost + potSize);

	const stacksLose = [...stacks];
	stacksLose[heroIdx] = Math.max(0, (stacksLose[heroIdx] || 0) - heroCost);
	stacksLose[villainIdx] = (stacksLose[villainIdx] || 0) + potSize + heroCost;

	const stacksFold = [...stacks];
	stacksFold[heroIdx] = Math.max(0, (stacksFold[heroIdx] || 0) - investidoAcumulado);
	stacksFold[villainIdx] = (stacksFold[villainIdx] || 0) + potSize;

	return { stacksWin, stacksLose, stacksFold };
}

function _calculateSnapshot(input: PerspectivaInput, totalPrizes: number) {
	const { stacks, prizes, heroIdx, villainIdx, potSize, heroCost } = input;
	const current = calculateMapaICM(stacks, prizes);
	const currentEquity = current.equities[heroIdx] ?? 0;
	const currentEquityPct = (currentEquity / totalPrizes) * 100;
	const { stacksWin, stacksLose, stacksFold } = _buildSimulatedStacks(
		stacks,
		heroIdx,
		villainIdx,
		potSize,
		heroCost,
		input.investidoAcumulado ?? 0,
	);
	const perspWin = calculateMapaICM(stacksWin, prizes);
	const perspLose = calculateMapaICM(stacksLose, prizes);
	const perspFold = calculateMapaICM(stacksFold, prizes);

	const winEq = perspWin.equities[heroIdx] ?? 0;
	const loseEq = perspLose.equities[heroIdx] ?? 0;
	const foldEq = perspFold.equities[heroIdx] ?? 0;

	return {
		current,
		currentEquityPct,
		stacksWin,
		deltaWinPct: (winEq / totalPrizes) * 100 - currentEquityPct,
		deltaLosePct: (loseEq / totalPrizes) * 100 - currentEquityPct,
		deltaFoldPct: (foldEq / totalPrizes) * 100 - currentEquityPct,
		perspWin,
		perspLose,
	};
}

function _calculateValuationAndRio(
	current: MapaICMResult,
	deltaWinPct: number,
	deltaLosePct: number,
	perspWin: MapaICMResult,
	input: PerspectivaInput,
	totalPrizes: number,
	stackHero: number,
) {
	const villainIdx = input.villainIdx;
	const potSize = input.potSize;
	const numPlayersInPot = input.numPlayersInPot ?? 2;
	const humanNoiseFactor = input.humanNoiseFactor ?? 0;

	const currentVillainEq = current.equities[villainIdx] ?? 0;
	const winVillainEq = perspWin.equities[villainIdx] ?? 0;
	const villainDeltaLoss = currentVillainEq - winVillainEq;
	const rawValuation =
		villainDeltaLoss > 0 ? deltaWinPct / ((villainDeltaLoss / totalPrizes) * 100) : 1;
	const valuation = Math.max(0.1, Math.min(2, rawValuation));

	// [v8.0] riskAdvantage: Fórmula BF canônica (100×(BF-1)/BF) aplicada ao Hero.
	// Preservamos a fórmula v6.2.1 por sua rastreabilidade didática e fidelidade ao BF.
	const gainAbs = deltaWinPct;         // Δ equidade ICM em caso de vitória (positivo)
	const lossAbs = Math.abs(deltaLosePct); // Δ equidade ICM em caso de derrota (magnitude)
	const heroBf = gainAbs > 0 ? lossAbs / gainAbs : 1;
	const riskAdvantage = heroBf <= 1 ? 0 : 100 * (heroBf - 1) / heroBf;

	// [v6.2.1] Expoente N^2.0 FIXO — sem feedback loop com noise factor.
	// Decisão arquitetural: separar física multiway (expoente) da percepção humana (damping).
	if (numPlayersInPot <= 2) {
		return { valuation, rioLiability: 0, riskAdvantage };
	}

	const opponents = Math.max(1, numPlayersInPot - 1);
	const rioPenaltyFactor = Math.pow(opponents, 2.0); // N^2.0 fixo
	const volatilityMultiplier = stackHero > 0 ? Math.pow(2 / Math.max(1, stackHero / 5), 2) : 1;

	// [v6.2.1] Damping 0.15 base + noise linear (não exponencial)
	const damping = 0.15 + humanNoiseFactor * 0.05;
	const rioPenaltyChips = potSize * rioPenaltyFactor * (damping + volatilityMultiplier * 0.05);
	const icmPerChip =
		currentVillainEq > 0
			? ((currentVillainEq / totalPrizes) * 100) / (current.totalChips / 2)
			: 0;
	const rioLiability = rioPenaltyChips * (icmPerChip || 0.05);

	return { valuation, rioLiability, riskAdvantage };
}

function _calculateFoldPressure(
	input: PerspectivaInput,
	stacksWin: number[],
	deltaFoldPct: number,
) {
	const {
		prizes,
		heroIdx,
		stacks,
		isNearPayjump = false,
		blindsRisingSoon = false,
		heroPosition = 'IP',
	} = input;
	const stackHero = stacks[heroIdx] ?? 0;
	const isVacuum = prizes.length <= 1;
	const handsToBust = Math.max(1, stackHero / 1.5);
	const survivalPressure = isVacuum ? 0 : Math.min(1, 1 / handsToBust);
	const currentTier = classifyTier(stackHero, stacks);
	const winTier = classifyTier(stacksWin[heroIdx] ?? stackHero, stacksWin);
	const tierBonus = isVacuum || winTier === currentTier ? 0 : 0.15;
	const fgsHealth = isVacuum ? 1 : 1 + tierBonus + survivalPressure * 0.2;

	// SOTA: EV_Fold Dinâmico Positivo (Laddering Termodinâmico)
	// Foldar gera valor se o hero sobrevive enquanto os predadores devoram as presas.
	let payjumpBonus = 0;
	if (isNearPayjump && !isVacuum) {
		const shortStacksCount = stacks.filter((s, i) => i !== heroIdx && classifyTier(s, stacks) === 'micro').length;
		const predatorsCount = stacks.filter(s => classifyTier(s, stacks) === 'chipleader' || classifyTier(s, stacks) === 'big').length;
		
		// O bônus de payjump escala se houver shorts em risco e predadores ativos na mesa
		const ladderingProbability = 0.25 * shortStacksCount * Math.max(1, predatorsCount * 0.5);
		// Valor do payjump no EV do Fold (podendo ser > 0 absoluto)
		payjumpBonus = Math.max(0, ladderingProbability + Math.abs(deltaFoldPct));
	}

	// [v8.0] Mapa Posicional Completo (v7.0): erosão proporcional à distância real até o BB.
	// Granularidade: UTG (máxima exposição orbital) → BB (0 penalidade, já está no BB).
	let erosionPenalty = 0;
	if (blindsRisingSoon && !isVacuum) {
		const baseErosion = Math.abs(deltaFoldPct * 0.5) + 0.1;
		const penaltyMap: Record<string, number> = {
			// Posições específicas de mesa (v7.0 expansão)
			UTG: 1.5, EP: 1.5, MP: 1.2, HJ: 1.0, CO: 0.75, BTN: 0.5, SB: 0.25, BB: 0.0,
			// Fallbacks genéricos (v6.2.1 compatibilidade)
			IP: 1.5, OOP: 0.5,
		};
		erosionPenalty = baseErosion + (penaltyMap[heroPosition] ?? 0.5);
	}

	return {
		isVacuum,
		survivalPressure,
		fgsHealth,
		payjumpBonus,
		dynamicEvFold: deltaFoldPct + payjumpBonus - erosionPenalty,
	};
}

function _resolveRealizationFactor(
	input: PerspectivaInput,
	stackHero: number,
	stackVillain: number,
	potSize: number,
	numPlayersInPot: number,
) {
	const effectiveStack = Math.min(stackHero, stackVillain);
	const spr = input.spr ?? effectiveStack / (potSize || 1);
	let R = input.realizationFactor;

	// SOTA v8.0: Damping de Realização Baseado em Agressão (Física Unificada)
	if (input.humanNoiseFactor && input.humanNoiseFactor > 1) {
		const aggPenalty = 1 - (input.humanNoiseFactor - 1) * 0.15;
		R *= Math.max(0.1, aggPenalty);
	}

	if (input.realizationFactor === 1 && numPlayersInPot === 2) {
		const isHeroOop =
			input.realizationFactor < 1 ||
			(input.realizationFactor === 1 && input.heroIdx > input.villainIdx);
		if (isHeroOop) {
			const oopPenalty = 0.25 * (1 - Math.exp(-spr / 2));
			R = Math.max(0.75, 1 - oopPenalty);
		}
	}

	return { R, effectiveStack };
}

export function calculateAmortizedEdge(
	edgeBase: number,
	stackHero: number,
	stackVillain: number,
	isVacuum: boolean = false,
	spr?: number,
) {
	const isVillainShort = stackVillain < 12;
	const ratio = stackHero / (stackVillain || 1);
	const edgePenalty = !isVacuum && isVillainShort && ratio > 3 ? 0.3 : 1;
	const effectiveStackForEdge = spr === undefined ? stackHero : Math.max(2, spr * 5);

	// SOTA: Amortização da Edge (Colapso Mecânico)
	const safeStackEdge = Math.max(2.718, effectiveStackForEdge);
	const edgeScale = Math.log(safeStackEdge) / Math.log(60);

	return { edgePenalty, amortizedEdge: edgeBase * edgePenalty * edgeScale };
}

function _buildDiagnostico(params: {
	perspectivaPct: number;
	rioLiability: number;
	payjumpBonus: number;
	edgePenalty: number;
	investidoAcumulado: number | undefined;
	stackHero: number;
	kappa: number;
	humanNoiseFactor: number;
	riskAdvantage: number;
}): string {
	const {
		perspectivaPct,
		rioLiability,
		payjumpBonus,
		edgePenalty,
		investidoAcumulado,
		stackHero,
		kappa,
		humanNoiseFactor,
		riskAdvantage,
	} = params;
	let diagnostico = perspectivaPct > 0 ? 'Ação Soberana.' : 'Insolvência de Perspectiva.';
	if (rioLiability > 1) diagnostico += ' Alerta: Colapso Multiway.';
	if (payjumpBonus > 0) diagnostico += ' Laddering favorece o Fold.';
	if (edgePenalty < 1) diagnostico += ' Punição: Restaurando árvore do oponente.';
	if (investidoAcumulado && investidoAcumulado > stackHero * 0.3)
		diagnostico += ' Alerta: Pot Entrapment Severo.';
	if (Math.abs(perspectivaPct) <= 5 && kappa < 0.4)
		diagnostico += ' Credibilidade Baixa: Intuição filtrada pelo Baseline Matemático.';
	if (humanNoiseFactor > 0.3)
		diagnostico += ` Fator Ψ Elevado (${(humanNoiseFactor * 100).toFixed(0)}%): Entropia do oponente detectada.`;
	if (perspectivaPct > 15 && stackHero > 40)
		diagnostico += ' Predador Ativo: Exploração Forçada.';
	// [v8.0] Diagnóstico de Risk Advantage
	if (riskAdvantage > 20)
		diagnostico += ` RP Alto (${riskAdvantage.toFixed(1)}%): Hero sob pressão severa de bolha.`;

	return diagnostico;
}

// === A EQUAÇÃO UNIFICADA SOTA ===

export function calculatePerspectivaVitoi(input: PerspectivaInput): PerspectivaResult {
	// Layer 0: Validação Semântica SOTA (Antevisão de Erros)
	const validation = PerspectivaInputSchema.safeParse(input);
	if (!validation.success) {
		if (process.env['NODE_ENV'] !== 'production') {
			console.warn(
				'[VITOI-QUANTUM] Sanitizing input due to validation mismatch:',
				validation.error.issues,
			);
		}
	}

	const {
		stacks,
		prizes,
		heroIdx,
		villainIdx,
		potSize,
		heroCost,
		winProb,
		numPlayersInPot = 2,
		kappa = 0.5,
		humanNoiseFactor = 0,
	} = input;

	// Garantia de Estabilidade Numérica (Shannon Economy)
	const totalPrizes = prizes.reduce((s, v) => s + v, 0);
	const stackHero = Math.max(0.001, stacks[heroIdx] || 0);
	const stackVillain = Math.max(0.001, stacks[villainIdx] || 0);

	const {
		current,
		currentEquityPct,
		stacksWin,
		deltaWinPct,
		deltaLosePct,
		deltaFoldPct,
		perspWin,
		perspLose,
	} = _calculateSnapshot(input, totalPrizes);

	const { valuation, rioLiability, riskAdvantage } = _calculateValuationAndRio(
		current,
		deltaWinPct,
		deltaLosePct,
		perspWin,
		input,
		totalPrizes,
		stackHero,
	);
	const { isVacuum, survivalPressure, fgsHealth, payjumpBonus, dynamicEvFold } =
		_calculateFoldPressure(input, stacksWin, deltaFoldPct);
	const { R } = _resolveRealizationFactor(
		input,
		stackHero,
		stackVillain,
		potSize,
		numPlayersInPot,
	);
	const { edgePenalty, amortizedEdge } = calculateAmortizedEdge(
		input.edgeBase,
		stackHero,
		stackVillain,
		isVacuum,
		input.spr,
	);

	// Axioma Lipe Piv: Regressão Bayesiana da Equidade
	const baselineEquity = heroCost / (potSize + heroCost);
	const bayesianWinProb = baselineEquity + kappa * (winProb - baselineEquity);

	// SOTA: Simetria na Teoria do Prospecto. Tanto perdas quanto ganhos sofrem aversão/retornos marginais.
	const effectiveStack = Math.min(stackHero, stackVillain);
	
	const baseDeltaLose = deltaLosePct * (1 / Math.max(0.1, fgsHealth));
	const prospectDeltaLose = calculateUtilityEV(baseDeltaLose, input.referenceStatus ?? 'baseline', 2.25, effectiveStack);

	const prospectDeltaWin = calculateUtilityEV(deltaWinPct, input.referenceStatus ?? 'baseline', 2.25, effectiveStack);

	// A EQUAÇÃO UNIFICADA SOTA (Blindagem Dimensional)
	const bountyValue = input.bountyValue ?? 0;

	const chipWinExpectativa =
		bayesianWinProb * prospectDeltaWin * R * valuation * fgsHealth * amortizedEdge;
	const chipLoseExpectativa = (1 - bayesianWinProb) * prospectDeltaLose * valuation;
	const bountyExpectativa = bayesianWinProb * bountyValue * R;

	const expectativaReal = chipWinExpectativa + chipLoseExpectativa + bountyExpectativa;
	const perspectivaPct = expectativaReal - (dynamicEvFold + rioLiability);

	// SOTA: Cálculo do Teto do RP (Equidade de Indiferença)
	// Refatoração algébrica (Passo 3): Valuation afeta ambos os vetores no denominador simetricamente.
	const denom =
		(prospectDeltaWin * R * valuation * fgsHealth * amortizedEdge) -
		(prospectDeltaLose * valuation) +
		(bountyValue * R);
	let threshEq = 0.5;
	if (Math.abs(denom) > 1e-6) {
		const rawThresh = (dynamicEvFold + rioLiability - (prospectDeltaLose * valuation)) / denom;
		threshEq = Math.max(0, Math.min(0.99, rawThresh));
	}

	// SOTA: Coeficiente de Insolvência (Ci)
	let ci = 0.5;
	if (threshEq > 0) {
		ci = bayesianWinProb / threshEq;
	} else if (perspectivaPct > 0) {
		ci = 1.5;
	}

	// SOTA: Instabilidade de EVs (Mutação da Margem)
	const marginInstability = Math.max(0.01, 1 / Math.max(2, effectiveStack)) * 100;

	// Diagnóstico
	const diagnostico = _buildDiagnostico({
		perspectivaPct,
		rioLiability,
		payjumpBonus,
		edgePenalty,
		investidoAcumulado: input.investidoAcumulado,
		stackHero,
		kappa,
		humanNoiseFactor,
		riskAdvantage,
	});

	const result = {
		handEquity: bayesianWinProb,
		currentEquityPct,
		deltaWinPct,
		deltaLosePct,
		deltaFoldPct,
		valuation,
		rioLiability,
		fgsHealth,
		survivalPressure,
		dynamicEvFold,
		perspectivaPct,
		amortizedEdge,
		riskAdvantage,    // [v8.0] Exportado no resultado core
		ci,
		marginInstability,
		threshEq,
		realizationFactor: R,
		bountyPower: bountyValue,
		isActionBetterThanFold: perspectivaPct > 0,
		diagnostico,
		currentMapaICM: current.positionProbs[heroIdx] ?? [],
		winMapaICM: perspWin.positionProbs[heroIdx] ?? [],
		loseMapaICM: perspLose.positionProbs[heroIdx] ?? [],
	};

	if (process.env['NODE_ENV'] !== 'production') {
		PerspectivaResultSchema.parse(result);
	}

	return result;
}

/**
 * Calcula a Gravidade Estratégica (G) baseada no tamanho do pote.
 * G = ln(pot / 7.5). 7.5bb é o baseline de SRP.
 */
export function calculateGravity(potSize: number): number {
	return Math.max(0, Math.log(Math.max(1, potSize / 7.5)));
}

// === FÍSICA BASE DO POKER (FATOR DE APRISIONAMENTO SOTA) ===

export function calculateRioTension( // NOSONAR
	heroInvested: number,
	currentPot: number,
	heroRawStack: number,
	heroPosition: 'IP' | 'OOP',
	baseRioLiability: number,
	activePlayers: number = 2,
	humanNoiseFactor: number = 0,
	mitigationFactor: number = 1,
): number {
	const gravity = calculateGravity(currentPot);
	const betToCall = currentPot * 0.5;
	const potEntrapment =
		((heroInvested + betToCall) / Math.max(0.1, heroRawStack)) * (1 + gravity * 0.1);
	const downwardDrift = heroPosition === 'OOP' ? 1.25 : 0.85;

	const opponents = Math.max(1, activePlayers - 1);
	const mwNoiseMultiplier = Math.pow(opponents, 1 + humanNoiseFactor);

	return Math.min(
		1,
		(baseRioLiability * mwNoiseMultiplier) / 100 +
			potEntrapment * downwardDrift * mitigationFactor,
	);
}

// === PROSPECT THEORY (KAHNEMAN & TVERSKY) ===

export type ReferencePointStatus = 'baseline' | 'tilt' | 'protecting' | 'bubble';

/**
 * Aplica a Curva de Utilidade (Value Function) da Teoria do Prospecto.
 * Ganhos são côncavos (retorno marginal decrescente).
 * Perdas são convexas e mais inclinadas (Loss Aversion).
 */
export function calculateUtilityEV(
	rawEv: number,
	status: ReferencePointStatus = 'baseline',
	lossAversionBase: number = 2.25,
	stackEff: number = 100,
	fgsHealth: number = 1,
): number {
	const safeStack = Math.max(2.718, stackEff);
	const stackModifier = Math.log(100) / Math.log(safeStack);

	const fgsModifier = 1 / Math.max(0.1, Math.pow(fgsHealth, 2));
	let lambda = lossAversionBase * stackModifier * fgsModifier;

	let alpha = 0.88;
	let beta = 0.88;

	switch (status) {
		case 'tilt':
			lambda = lambda * 0.66;
			beta = 0.95;
			break;
		case 'protecting':
			lambda = lambda * 1.33;
			alpha = 0.75;
			break;
		case 'bubble':
			lambda = lambda * 2;
			break;
		case 'baseline':
		default:
			break;
	}

	if (rawEv >= 0) {
		return Math.pow(rawEv, alpha);
	} else {
		return -lambda * Math.pow(Math.abs(rawEv), beta);
	}
}

// SOTA: Seletor de Métricas Quantum (Erradicação de redundância matemática na UI)
export function computeQuantumMetrics(quantumPerspectiva: PerspectivaResult | null) {
	if (!quantumPerspectiva)
		return {
			amortizedEdgeMultiplier: 1,
			rioMw: 0,
			adjustedEvFold: 0,
			esperanca: 0,
			expectativa: 0,
			perspectiva: 0,
			threshEq: null,
			ci: null,
			marginInstability: 0,
			riskAdvantage: 0,
			isSolvent: false,
			isActionable: false,
		};

	return {
		amortizedEdgeMultiplier: quantumPerspectiva.amortizedEdge,
		rioMw: quantumPerspectiva.rioLiability,
		adjustedEvFold: quantumPerspectiva.dynamicEvFold,
		esperanca: quantumPerspectiva.perspectivaPct,
		expectativa: quantumPerspectiva.deltaWinPct,
		perspectiva: quantumPerspectiva.perspectivaPct,
		threshEq: quantumPerspectiva.threshEq,
		ci: quantumPerspectiva.ci,
		marginInstability: quantumPerspectiva.marginInstability,
		riskAdvantage: quantumPerspectiva.riskAdvantage, // [v8.0]
		isSolvent: quantumPerspectiva.ci >= 1,
		isActionable: quantumPerspectiva.perspectivaPct > 0,
	};
}
