/**
 * IDENTITY: Derivador de Risk Premium via Bubble Factor (Perspectiva)
 * PATH: src/lib/rpDeriver.ts
 * ROLE: Conectar o motor ICM (Perspectiva/M-H) ao motor pos-flop (nashSolver).
 *
 * @format
 */

import { calculateMapaICM, calculatePerspectivaVitoi, type PerspectivaInput } from './perspectiva';

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

function deriveRecommendedSizing(
	riskAdvantage: number,
	spr: number,
): 'small' | 'medium' | 'large' | 'check' {
	if (riskAdvantage > 8) return 'small';
	if (spr < 2) return 'medium';
	if (riskAdvantage < -5) return 'check';
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
	simulationAmount?: number, // Opcional: permite forÃ§ar um valor de investimento
): RpDerivationResult | null {
	if (stacks.length < 2) throw new Error('deriveRps: necessario ao menos 2 jogadores.');

	const ipIdx = ipIndex;
	const oopIdx = oopIndex;
	const rawEffStack = Math.min(stacks[ipIdx] ?? 0, stacks[oopIdx] ?? 0);

	// SOTA v7.0 GOLD CALIBRATION:
	// Para a matriz de RP didÃ¡tica, nÃ£o simulamos o Shove (que explode o RP para > 60%).
	// Simulamos um "Investimento de ReferÃªncia" (~35% do stack) que coincide com os 21.4% da Aula 1.2.
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
			// DiferenÃ§a financeira real (ICM)
			const gain =
				(perspIpWin.equities[i] ?? 0) -
				(baseline.equities[i] ?? 0) +
				(bountyValue * totalPrizes) / 100;
			const loss = (baseline.equities[i] ?? 0) - (perspOopWin.equities[i] ?? 0);
			// BF = Custo da Derrota / BenefÃ­cio da VitÃ³ria
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
	numPlayers?: number; // D6: jogadores no pot (HU=2, MW=3+)
	humanNoiseFactor?: number;
}

export interface PostFlopResult extends RpDerivationResult {
	evFoldStreet: number;
	sprRemanescente: number;
	rStreet: number;
	stackHeroRemanescente: number;
	// D6: Componentes PM por street
	rioMwStreet: number; // RIO multiway por street (O(NÂ²) Ã— pot_acumulado)
	valuationStreet: number; // ICM valuation dinÃ¢mica (gain/loss ratio)
	pmStreet: number; // Perspectiva MatemÃ¡tica por street
	ciStreet: number; // Coeficiente de InsolvÃªncia por street
	threshEqStreet: number; // Novo: Teto do RP dinÃ¢mico por street
	potEntrapmentRatio: number; // RazÃ£o EV_fold / stack_hero (severidade do aprisionamento)
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
	} = state;
	const heroIdx = heroIsIp ? ipIndex : oopIndex;
	const villainIdx = heroIsIp ? oopIndex : ipIndex;
	const numPlayersInPot = state.numPlayers ?? 2;

	const heroCost = Math.max(0, potTotal - potAcumuladoHero); // O que falta pagar para ver a prÃ³xima street (ou showdown)

	// SOTA v7.0 GOLD: DelegaÃ§Ã£o Total para o Motor Perspectiva
	const input: PerspectivaInput = {
		stacks,
		prizes,
		heroIdx,
		villainIdx,
		potSize: potTotal - heroCost, // Pote antes do investimento atual do hero
		heroCost: heroCost,
		winProb: 0.5, // Baseline agnÃ³stico
		realizationFactor: 1, // SerÃ¡ ajustado internamente pelo motor
		edgeBase: 1,
		bountyValue,
		numPlayersInPot,
		humanNoiseFactor,
		heroPosition: heroIsIp ? 'IP' : 'OOP',
		investidoAcumulado: potAcumuladoHero,
	};

	const core = calculatePerspectivaVitoi(input);

	const totalPrizes = prizes.reduce((s, v) => s + v, 0);
	const bountyContrib = (bountyValue * totalPrizes) / 100;

	// SOTA: Calcular Bubble Factors reais para IP e OOP sem aproximaÃ§Ãµes de simetria
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

	// Mapeamento SOTA para o contrato PostFlopResult
	return {
		ipRp,
		oopRp,
		deltaRp: ipRp - oopRp,
		allRps,
		allBfs,
		isCeilingReached:
			core.rioLiability > 20 || ipRp >= RP_CEILING_THRESHOLD || oopRp >= RP_CEILING_THRESHOLD,
		recommendedSizing: core.perspectivaPct > 5 ? 'medium' : 'small',
		riskAdvantage: oopRp - ipRp,
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
	};
}

