/**
 * IDENTITY: Derivador de Risk Premium via Bubble Factor (Perspectiva)
 * PATH: src/lib/rpDeriver.ts
 * ROLE: Adapter entre o motor ICM (perspectiva.ts v8.0) e a camada de decisão pós-flop.
 *
 * FUSION CHANGELOG (v8.0 vs v6.2.1):
 * [+] heroRpAbsolute: exposto no PostFlopResult via core.riskAdvantage (v8.0 perspectiva)
 * [+] recommendedSizing enriquecido: combina delta BF (IP vs OOP) + core.riskAdvantage
 * [+] isCeilingReached: adiciona core.riskAdvantage como gatilho de teto (> RP_CEILING)
 * [+] referenceStatus propagado no input do core via StreetState
 * [=] deriveRps(): lógica BF canônica mantida (100×(BF-1)/BF) — didática e rastreável
 * [=] allBfs dual-player preservado (perspectiva core é single-hero; precisamos do delta IP/OOP)
 *
 * @format
 */

import { calculateMapaICM, calculatePerspectivaVitoi, type PerspectivaInput, type ReferencePointStatus } from './perspectiva';

const RP_MIN = 0;
const RP_MAX = 60;
export const BF_THRESHOLD = 1.01;
export const RP_CEILING_THRESHOLD = 24;

export interface RpDerivationResult {
	ipRp: number;
	oopRp: number;
	deltaRp: number;
	allRps: number[];
	allBfs: number[];
	isCeilingReached: boolean;
	recommendedSizing: 'small' | 'medium' | 'large' | 'check';
	riskAdvantage: number;
	adjustedIpRp: number;
	adjustedOopRp: number;
}

// [v8.0] Enriquecimento do sizing: combina vantagem de risco BF-delta com o RP absoluto do hero.
// riskAdvantageDelta: OOP_RP - IP_RP (positivo = IP tem vantagem de risco sobre o OOP).
// heroRpAbsolute: RP canônico do hero derivado pelo core (BF completo com RIO, Prospecto, etc.).
function deriveRecommendedSizing(
	riskAdvantageDelta: number,
	spr: number,
	heroRpAbsolute: number = 0,
): 'small' | 'medium' | 'large' | 'check' {
	// Se o hero está sob pressão severa de bolha (RP alto no core), sizing conservador.
	if (heroRpAbsolute >= RP_CEILING_THRESHOLD) return 'small';
	// OOP com muito mais risco que IP → aposta pequena explora o medo de cair do oponente.
	if (riskAdvantageDelta > 8) return 'small';
	// Oponente tem vantagem (cobre e não se importa de colidir) → não apostamos alto.
	if (riskAdvantageDelta < -5) return 'check';
	// SPR baixo: pote comprometido, bet/raise de comprometimento é correto.
	if (spr < 2) return 'medium';
	return 'medium';
}

function bfToRp(bf: number): number {
	if (bf <= 1) return RP_MIN;
	const rp = (100 * (bf - 1)) / bf;
	return Math.max(RP_MIN, Math.min(RP_MAX, rp));
}

export function deriveRps(
	stacks: number[],
	prizes: number[],
	ipIndex: number,
	oopIndex: number,
	bountyValue = 0,
	simulationAmount?: number, // Opcional: permite forçar um valor de investimento
): RpDerivationResult | null {
	if (stacks.length < 2) throw new Error('deriveRps: necessario ao menos 2 jogadores.');

	const ipIdx = ipIndex;
	const oopIdx = oopIndex;
	const rawEffStack = Math.min(stacks[ipIdx] ?? 0, stacks[oopIdx] ?? 0);

	// SOTA v8.0 GOLD CALIBRATION:
	// Para a matriz de RP didática, não simulamos o Shove (que explode o RP para > 60%).
	// Simulamos um "Investimento de Referência" (~35% do stack) que coincide com os 21.4% da Aula 1.2.
	const effStack = simulationAmount ?? rawEffStack * 0.35;

	if (rawEffStack <= 0 || effStack <= 0) {
		return {
			ipRp: 0,
			oopRp: 0,
			deltaRp: 0,
			allRps: stacks.map(() => 0),
			allBfs: stacks.map(() => 1),
			isCeilingReached: false,
			riskAdvantage: 0,
			recommendedSizing: 'medium',
			adjustedIpRp: 0,
			adjustedOopRp: 0,
		};
	}

	const EPS = 0.001;
	const totalPrizes = prizes.reduce((s, v) => s + v, 0);
	const baseline = calculateMapaICM(stacks, prizes);

	const stacksIpWin = stacks.map((s, i) => {
		if (i === ipIdx) return s + effStack;
		if (i === oopIdx) return Math.max(EPS, s - effStack);
		return s;
	});

	const stacksOopWin = stacks.map((s, i) => {
		if (i === oopIdx) return s + effStack;
		if (i === ipIdx) return Math.max(EPS, s - effStack);
		return s;
	});

	const perspIpWin = calculateMapaICM(stacksIpWin, prizes);
	const perspOopWin = calculateMapaICM(stacksOopWin, prizes);

	const allBfs: number[] = stacks.map((_, i) => {
		if (i === ipIdx) {
			// Diferença financeira real (ICM)
			const gain =
				(perspIpWin.equities[i] ?? 0) -
				(baseline.equities[i] ?? 0) +
				(bountyValue * totalPrizes) / 100;
			const loss = (baseline.equities[i] ?? 0) - (perspOopWin.equities[i] ?? 0);
			// BF = Custo da Derrota / Benefício da Vitória
			return gain > 0 ? loss / gain : 1;
		}
		if (i === oopIdx) {
			const gain =
				(perspOopWin.equities[i] ?? 0) -
				(baseline.equities[i] ?? 0) +
				(bountyValue * totalPrizes) / 100;
			const loss = (baseline.equities[i] ?? 0) - (perspIpWin.equities[i] ?? 0);
			return gain > 0 ? loss / gain : 1;
		}
		return 1;
	});

	const allRps = allBfs.map((bf) => bfToRp(bf));
	const ipRp = allRps[ipIdx] ?? 0;
	const oopRp = allRps[oopIdx] ?? 0;
	const deltaRp = ipRp - oopRp;
	const isCeilingReached = ipRp >= RP_CEILING_THRESHOLD || oopRp >= RP_CEILING_THRESHOLD;
	// riskAdvantage: positivo = OOP está sob mais pressão → IP tem vantagem de risco.
	const riskAdvantage = oopRp - ipRp;
	const sprProxy = (stacks[ipIdx] ?? effStack) / (effStack * 2 || 1);
	const recommendedSizing = deriveRecommendedSizing(riskAdvantage, sprProxy);

	return {
		ipRp,
		oopRp,
		deltaRp,
		allRps,
		allBfs,
		isCeilingReached,
		recommendedSizing,
		riskAdvantage,
		adjustedIpRp: ipRp,
		adjustedOopRp: oopRp,
	};
}

export type Street = 'flop' | 'turn' | 'river';

export interface StreetState {
	street: Street;
	potAcumuladoHero: number;
	potTotal: number;
	heroIsIp: boolean;
	bountyValue?: number;
	futureRpInfluence?: number;
	numPlayers?: number;       // D6: jogadores no pot (HU=2, MW=3+)
	humanNoiseFactor?: number;
	referenceStatus?: ReferencePointStatus; // [v8.0] Estado psicológico do hero (Prospecto)
}

export interface PostFlopResult extends RpDerivationResult {
	evFoldStreet: number;
	sprRemanescente: number;
	rStreet: number;
	stackHeroRemanescente: number;
	// D6: Componentes PM por street
	rioMwStreet: number;      // RIO multiway por street (O(N²) × pot_acumulado)
	valuationStreet: number;  // ICM valuation dinâmica (gain/loss ratio)
	pmStreet: number;         // Perspectiva Matemática por street
	ciStreet: number;         // Coeficiente de Insolvência por street
	threshEqStreet: number;   // Teto do RP dinâmico por street
	potEntrapmentRatio: number; // Razão EV_fold / stack_hero (severidade do aprisionamento)
	// [v8.0] Métricas do core fused
	heroRpAbsolute: number;   // RP canônico do hero (core.riskAdvantage — BF + RIO + Prospecto)
}

export function derivePostFlopRps(
	stacks: number[],
	prizes: number[],
	ipIndex: number,
	oopIndex: number,
	state: StreetState,
): PostFlopResult | null {
	const {
		potAcumuladoHero,
		potTotal,
		heroIsIp,
		bountyValue = 0,
		futureRpInfluence = 0,
		humanNoiseFactor = 0,
		referenceStatus,
	} = state;
	const heroIdx = heroIsIp ? ipIndex : oopIndex;
	const villainIdx = heroIsIp ? oopIndex : ipIndex;
	const numPlayersInPot = state.numPlayers ?? 2;

	const heroCost = Math.max(0, potTotal - potAcumuladoHero); // O que falta pagar para ver a próxima street (ou showdown)

	const input: PerspectivaInput = {
		stacks,
		prizes,
		heroIdx,
		villainIdx,
		potSize: potTotal - heroCost, // Pote antes do investimento atual do hero
		heroCost: heroCost,
		winProb: 0.5,         // Baseline agnóstico
		realizationFactor: 1, // Será ajustado internamente pelo motor
		edgeBase: 1,
		bountyValue,
		numPlayersInPot,
		humanNoiseFactor,
		heroPosition: heroIsIp ? 'IP' : 'OOP',
		investidoAcumulado: potAcumuladoHero,
	};

	if (referenceStatus !== undefined) {
		input.referenceStatus = referenceStatus;
	}

	const core = calculatePerspectivaVitoi(input);

	// [v8.0] heroRpAbsolute: RP canônico derivado pelo core fused.
	// Inclui RIO_mw, Prospecto, FGS — mais rico que o BF simples.
	const heroRpAbsolute = core.riskAdvantage;

	const totalPrizes = prizes.reduce((s, v) => s + v, 0);
	const bountyContrib = (bountyValue * totalPrizes) / 100;

	// SOTA: Calcular Bubble Factors reais para IP e OOP sem aproximações de simetria.
	// Mantemos o cálculo dual-player: o core é single-hero, mas precisamos do delta IP↔OOP.
	const baseline = calculateMapaICM(stacks, prizes);
	const potSize = potTotal - heroCost;

	const stacksWin = [...stacks];
	stacksWin[heroIdx] = Math.max(0, (stacks[heroIdx] || 0) - heroCost + potSize);

	const stacksLose = [...stacks];
	stacksLose[heroIdx] = Math.max(0, (stacks[heroIdx] || 0) - heroCost);
	stacksLose[villainIdx] = (stacks[villainIdx] || 0) + potSize + heroCost;

	const stacksIpWin = heroIsIp ? stacksWin : stacksLose;
	const stacksOopWin = heroIsIp ? stacksLose : stacksWin;

	const perspIpWin = calculateMapaICM(stacksIpWin, prizes);
	const perspOopWin = calculateMapaICM(stacksOopWin, prizes);

	const allBfs = stacks.map((_, i) => {
		if (i === ipIndex) {
			const gain =
				(perspIpWin.equities[i] ?? 0) - (baseline.equities[i] ?? 0) + bountyContrib;
			const loss = (baseline.equities[i] ?? 0) - (perspOopWin.equities[i] ?? 0);
			return gain > 0 ? loss / gain : 1;
		}
		if (i === oopIndex) {
			const gain =
				(perspOopWin.equities[i] ?? 0) - (baseline.equities[i] ?? 0) + bountyContrib;
			const loss = (baseline.equities[i] ?? 0) - (perspIpWin.equities[i] ?? 0);
			return gain > 0 ? loss / gain : 1;
		}
		return 1;
	});

	const allRps = allBfs.map((bf) => bfToRp(bf));
	const ipRp = allRps[ipIndex] ?? 0;
	const oopRp = allRps[oopIndex] ?? 0;
	// Delta de risco entre os dois jogadores (perspectiva do IP agressor)
	const riskAdvantageDelta = oopRp - ipRp;
	const sprProxy = (stacks[heroIdx] ?? heroCost) / (heroCost * 2 || 1);

	// [v8.0] Sizing enriquecido: combina delta BF (IP vs OOP) + heroRpAbsolute do core.
	const recommendedSizing = deriveRecommendedSizing(riskAdvantageDelta, sprProxy, heroRpAbsolute);

	// [v8.0] isCeilingReached: teto ativado por RIO, BF individuais OU RP absoluto do core.
	const isCeilingReached =
		core.rioLiability > 20 ||
		ipRp >= RP_CEILING_THRESHOLD ||
		oopRp >= RP_CEILING_THRESHOLD ||
		heroRpAbsolute >= RP_CEILING_THRESHOLD;

	return {
		ipRp,
		oopRp,
		deltaRp: ipRp - oopRp,
		allRps,
		allBfs,
		isCeilingReached,
		recommendedSizing,
		riskAdvantage: riskAdvantageDelta,
		adjustedIpRp: ipRp + futureRpInfluence,
		adjustedOopRp: oopRp + futureRpInfluence,
		evFoldStreet: core.deltaFoldPct,
		sprRemanescente: core.marginInstability / 100,
		rStreet: core.realizationFactor,
		stackHeroRemanescente: stacks[heroIdx] ?? 0,
		rioMwStreet: core.rioLiability,
		valuationStreet: core.valuation,
		pmStreet: core.perspectivaPct,
		ciStreet: core.ci,
		threshEqStreet: core.threshEq,
		potEntrapmentRatio: Math.abs(core.deltaFoldPct) / (stacks[heroIdx] || 1),
		heroRpAbsolute,        // [v8.0] RP canônico do hero via core fused
	};
}
