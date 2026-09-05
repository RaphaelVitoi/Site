'use client';

/**
 * IDENTITY: Range Viewer & Laboratório de Heurísticas do ICM - Arcabouço do Poker Racional
 * PATH: src/components/simulator/PmevRangeViewer.tsx
 * ROLE: Renderiza o Range Viewer e os Toy Games de Risk Premium (PioSolver & HRC)
 *       sistematizados a partir da obra original "Entendendo o ICM e suas heurísticas" de Raphael Vitoi.
 */

import { useState, useEffect, useMemo } from 'react';

// Ranks canônicos de Texas Hold'em
const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

// Ranges GTO Baseline por Posição (RFI Standard 9-Max)
const DEFAULT_RFI_RANGES: Record<string, Record<string, number>> = {
	UTG: {
		AA: 1.0, KK: 1.0, QQ: 1.0, JJ: 1.0, TT: 1.0, '99': 0.9, '88': 0.6, '77': 0.3,
		AKs: 1.0, AQs: 1.0, AJs: 1.0, ATs: 1.0, A9s: 0.5, A5s: 0.8, A4s: 0.5,
		KQs: 1.0, KJs: 1.0, KTs: 0.8, QJs: 1.0, QTs: 0.6, JTs: 0.9, T9s: 0.6, '98s': 0.5, '87s': 0.3,
		AKo: 1.0, AQo: 1.0, AJo: 0.6, KQo: 0.4,
	},
	MP: {
		AA: 1.0, KK: 1.0, QQ: 1.0, JJ: 1.0, TT: 1.0, '99': 1.0, '88': 0.8, '77': 0.6, '66': 0.4,
		AKs: 1.0, AQs: 1.0, AJs: 1.0, ATs: 1.0, A9s: 0.8, A8s: 0.5, A5s: 1.0, A4s: 0.8, A3s: 0.4,
		KQs: 1.0, KJs: 1.0, KTs: 1.0, K9s: 0.5, QJs: 1.0, QTs: 0.8, JTs: 1.0, T9s: 0.8, '98s': 0.7, '87s': 0.5, '76s': 0.3,
		AKo: 1.0, AQo: 1.0, AJo: 0.9, ATo: 0.4, KQo: 0.8, KJo: 0.4,
	},
	CO: {
		AA: 1.0, KK: 1.0, QQ: 1.0, JJ: 1.0, TT: 1.0, '99': 1.0, '88': 1.0, '77': 1.0, '66': 0.8, '55': 0.6, '44': 0.4, '33': 0.2, '22': 0.1,
		AKs: 1.0, AQs: 1.0, AJs: 1.0, ATs: 1.0, A9s: 1.0, A8s: 1.0, A7s: 0.8, A6s: 0.7, A5s: 1.0, A4s: 1.0, A3s: 0.8, A2s: 0.6,
		KQs: 1.0, KJs: 1.0, KTs: 1.0, K9s: 0.9, K8s: 0.6, K7s: 0.4, K6s: 0.3,
		QJs: 1.0, QTs: 1.0, Q9s: 0.9, Q8s: 0.6, Q7s: 0.3, JTs: 1.0, J9s: 0.9, J8s: 0.6, T9s: 1.0, T8s: 0.8, '98s': 1.0, '87s': 0.9, '76s': 0.8, '65s': 0.6, '54s': 0.4,
		AKo: 1.0, AQo: 1.0, AJo: 1.0, ATo: 0.9, A9o: 0.6, A8o: 0.3, KQo: 1.0, KJo: 0.9, KTo: 0.6, QJo: 0.8, QTo: 0.4, JTo: 0.4,
	},
	BTN: {
		AA: 1.0, KK: 1.0, QQ: 1.0, JJ: 1.0, TT: 1.0, '99': 1.0, '88': 1.0, '77': 1.0, '66': 1.0, '55': 1.0, '44': 0.9, '33': 0.8, '22': 0.7,
		AKs: 1.0, AQs: 1.0, AJs: 1.0, ATs: 1.0, A9s: 1.0, A8s: 1.0, A7s: 1.0, A6s: 1.0, A5s: 1.0, A4s: 1.0, A3s: 1.0, A2s: 1.0,
		KQs: 1.0, KJs: 1.0, KTs: 1.0, K9s: 1.0, K8s: 0.9, K7s: 0.8, K6s: 0.7, K5s: 0.6, K4s: 0.5, K3s: 0.4, K2s: 0.3,
		QJs: 1.0, QTs: 1.0, Q9s: 1.0, Q8s: 0.9, Q7s: 0.7, Q6s: 0.6, Q5s: 0.5, Q4s: 0.4,
		JTs: 1.0, J9s: 1.0, J8s: 0.9, J7s: 0.7, J6s: 0.5, T9s: 1.0, T8s: 1.0, T7s: 0.8, T6s: 0.5, '98s': 1.0, '97s': 0.9, '96s': 0.6, '87s': 1.0, '86s': 0.8, '76s': 1.0, '75s': 0.7, '65s': 1.0, '64s': 0.6, '54s': 1.0, '53s': 0.5, '43s': 0.4,
		AKo: 1.0, AQo: 1.0, AJo: 1.0, ATo: 1.0, A9o: 1.0, A8o: 0.8, A7o: 0.7, A6o: 0.5, A5o: 0.6, A4o: 0.5, A3o: 0.3, A2o: 0.2,
		KQo: 1.0, KJo: 1.0, KTo: 1.0, K9o: 0.8, K8o: 0.5, K7o: 0.3,
		QJo: 1.0, QTo: 0.9, Q9o: 0.7, Q8o: 0.4, JTo: 1.0, J9o: 0.7, J8o: 0.3, T9o: 0.8, T8o: 0.4, '98o': 0.6, '87o': 0.4, '76o': 0.3,
	},
	SB: {
		AA: 1.0, KK: 1.0, QQ: 1.0, JJ: 1.0, TT: 1.0, '99': 1.0, '88': 1.0, '77': 1.0, '66': 0.9, '55': 0.8, '44': 0.7, '33': 0.5, '22': 0.4,
		AKs: 1.0, AQs: 1.0, AJs: 1.0, ATs: 1.0, A9s: 1.0, A8s: 0.9, A7s: 0.8, A6s: 0.7, A5s: 1.0, A4s: 0.9, A3s: 0.7, A2s: 0.6,
		KQs: 1.0, KJs: 1.0, KTs: 1.0, K9s: 0.9, K8s: 0.7, K7s: 0.5, K6s: 0.4,
		QJs: 1.0, QTs: 1.0, Q9s: 0.8, Q8s: 0.6, JTs: 1.0, J9s: 0.8, J8s: 0.5, T9s: 1.0, T8s: 0.7, '98s': 0.9, '87s': 0.8, '76s': 0.7, '65s': 0.5, '54s': 0.4,
		AKo: 1.0, AQo: 1.0, AJo: 1.0, ATo: 0.9, A9o: 0.7, A8o: 0.4, KQo: 1.0, KJo: 0.8, KTo: 0.6, QJo: 0.7, QTo: 0.4, JTo: 0.5,
	},
};

// Toy Games Oficiais do documento "Entendendo o ICM e suas heurísticas" (Raphael Vitoi)
interface ToyGameScenario {
	id: string;
	title: string;
	category: 'RISK_ADVANTAGE' | 'RISK_INVERSION' | 'CHIP_EV';
	rpIp: number;
	rpOop: number;
	pot: number;
	shoveSize: number;
	ipValueCombos: number;
	ipBluffCombos: number;
	ipShovePercent: number;
	oopCallPercent: number;
	oopFoldPercent: number;
	description: string;
	vitoiInsight: string;
}

const TOY_GAMES_DATABASE: ToyGameScenario[] = [
	{
		id: 'tg-chipev',
		title: 'Toy Game 1 (ChipEV Puro Baseline)',
		category: 'CHIP_EV',
		rpIp: 0,
		rpOop: 0,
		pot: 100,
		shoveSize: 100,
		ipValueCombos: 6,
		ipBluffCombos: 3,
		ipShovePercent: 50.0,
		oopCallPercent: 50.0,
		oopFoldPercent: 50.0,
		description: 'IP AA/QQ/JJ (18 combos) vs OOP KK (6 combos). Board 22223. KK paga 50% para neutralizar o EV dos blefes.',
		vitoiInsight: 'No ChipEV clássico, a MDF de Matthew Janda dita a frequência de defesa: 1 - alpha = 100 / (100+100) = 50%.',
	},
	{
		id: 'tg-rp3-6',
		title: 'Toy Game 2 (IP RP 3% vs OOP RP 6%)',
		category: 'RISK_ADVANTAGE',
		rpIp: 3,
		rpOop: 6,
		pot: 100,
		shoveSize: 100,
		ipValueCombos: 6,
		ipBluffCombos: 4.2,
		ipShovePercent: 56.84,
		oopCallPercent: 46.25,
		oopFoldPercent: 53.75,
		description: 'IP ganha vantagem de risco e aumenta blefes de 3 para 4.2 combos. OOP desiste um pouco mais (53.75%).',
		vitoiInsight: 'O IP possui vantagem de risco. Não há possibilidade de o OOP devolver o RP fazendo um re-shove (efeito batata quente).',
	},
	{
		id: 'tg-rp3-9',
		title: 'Toy Game 3 (IP RP 3% vs OOP RP 9%) - O Teto do RP',
		category: 'RISK_ADVANTAGE',
		rpIp: 3,
		rpOop: 9,
		pot: 100,
		shoveSize: 100,
		ipValueCombos: 6,
		ipBluffCombos: 5.0,
		ipShovePercent: 61.09,
		oopCallPercent: 46.45,
		oopFoldPercent: 53.55,
		description: 'IP expande blefes para 5 combos. O OOP atinge o "Teto do RP" e estabiliza sua defesa em 46.45%.',
		vitoiInsight: 'Atingiu o Teto do RP: O solver equilibra os blefes do IP para manter o limite exato em que os bluffcatchers do OOP ousam pagar.',
	},
	{
		id: 'tg-rp3-18',
		title: 'Toy Game 4 (IP RP 3% vs OOP RP 18%)',
		category: 'RISK_ADVANTAGE',
		rpIp: 3,
		rpOop: 18,
		pot: 100,
		shoveSize: 100,
		ipValueCombos: 6,
		ipBluffCombos: 8.0,
		ipShovePercent: 76.92,
		oopCallPercent: 46.25,
		oopFoldPercent: 53.75,
		description: 'IP shova 6 valor vs 8 blefes (14 combos = 76.92%). OOP KK continua defendendo no Teto do RP (46.25%).',
		vitoiInsight: 'Mesmo com o IP desbalanceado em relação a ChipEV, o KK não paga 100% das vezes; respeita o Teto do RP.',
	},
	{
		id: 'tg-rp3-24',
		title: 'Toy Game 5 (IP RP 3% vs OOP RP 24%) - Pressão Máxima',
		category: 'RISK_ADVANTAGE',
		rpIp: 3,
		rpOop: 24,
		pot: 100,
		shoveSize: 100,
		ipValueCombos: 6,
		ipBluffCombos: 10.8,
		ipShovePercent: 93.17,
		oopCallPercent: 46.10,
		oopFoldPercent: 53.90,
		description: 'IP shova quase todo o range (93.17%). OOP KK segue rigorosamente defendendo no limite do Teto do RP (46.10%).',
		vitoiInsight: 'Quanto maior a discrepância de RP, mais agressivo é o ataque do IP. O defensor nunca deve polarizar a defesa em 0% ou 100%.',
	},
	{
		id: 'tg-inv-9-3',
		title: 'Inversão de RP 1 (IP RP 9% vs OOP RP 3%)',
		category: 'RISK_INVERSION',
		rpIp: 9,
		rpOop: 3,
		pot: 100,
		shoveSize: 100,
		ipValueCombos: 6,
		ipBluffCombos: 3.6,
		ipShovePercent: 53.33,
		oopCallPercent: 39.93,
		oopFoldPercent: 60.07,
		description: 'IP tem RP maior (9%). OOP com baixíssimo RP (3%) PAGA MENOS (39.93% call, 60.07% fold)!',
		vitoiInsight: 'Paradoxo Vitoi: O defensor com menor RP folda mais porque dobrar o rival transfere equidade e reduz o ICM sobre a mesa.',
	},
	{
		id: 'tg-inv-18-3',
		title: 'Inversão de RP 2 (IP RP 18% vs OOP RP 3%)',
		category: 'RISK_INVERSION',
		rpIp: 18,
		rpOop: 3,
		pot: 100,
		shoveSize: 100,
		ipValueCombos: 6,
		ipBluffCombos: 3.6,
		ipShovePercent: 53.35,
		oopCallPercent: 30.09,
		oopFoldPercent: 69.91,
		description: 'IP tem 18% RP. OOP com RP de 3% folda 70% das vezes vs o mesmo range levemente inclinado a blefe!',
		vitoiInsight: 'O CL tem pouco incentivo para ser bluffcatcher: perder fichas tem um impacto desproporcionalmente maior do que ganhá-las.',
	},
	{
		id: 'tg-inv-24-3',
		title: 'Inversão de RP 3 (IP RP 24% vs OOP RP 3%) - Over-fold Massivo',
		category: 'RISK_INVERSION',
		rpIp: 24,
		rpOop: 3,
		pot: 100,
		shoveSize: 100,
		ipValueCombos: 6,
		ipBluffCombos: 2.4,
		ipShovePercent: 46.70,
		oopCallPercent: 23.10,
		oopFoldPercent: 76.90,
		description: 'OOP com RP de 3% atinge quase 80% de fold (76.90% fold)! Subversão completa da MDF clássica.',
		vitoiInsight: 'A Mesa Final como Organismo Vivo: Dobrar o adversário alivia a pressão do ICM sobre todos os outros concorrentes.',
	},
];

type MainTab = 'RANGE_VIEWER' | 'TOY_GAMES_LAB';
type ViewMode = 'DELTA' | 'PMEV_ADJUSTED' | 'BASELINE_GTO' | 'DUAL_GRID';
type SpotType = 'RFI' | 'BB_DEFENSE' | 'PUSH_FOLD';
type HandType = 'PAIR' | 'SUITED' | 'OFFSUIT';
type HandAction = 'EXPAND' | 'CONTRACT' | 'PARITY';

interface HandCellInfo {
	hand: string;
	r: number;
	c: number;
	type: HandType;
	baselineFreq: number;
	vitoiFreq: number;
	delta: number;
	action: HandAction;
	justification: string;
}

interface AdjustmentParams {
	handName: string;
	handType: HandType;
	baseFreq: number;
	isPair: boolean;
	isSuited: boolean;
	hasShortStackPressure: boolean;
	timeToBlind: number;
	stackBb: number;
	riskAdvantage: number;
}

function getShortStackPressureAdjustment(baseFreq: number): { adjustedFreq: number; justification: string } | null {
	if (baseFreq > 0 && baseFreq < 0.9) {
		return {
			adjustedFreq: baseFreq,
			justification: 'Sinal de payjump/short stack: exige comparação de payouts, stacks e ranges. Sem nó de solver ou regra calibrada, a frequência de referência não é alterada.',
		};
	}
	return null;
}

function getTimeToBlindAdjustment(
	handName: string,
	baseFreq: number,
	isSuited: boolean,
	isPair: boolean,
	timeToBlind: number,
	stackBb: number
): { adjustedFreq: number; justification: string } | null {
	if (timeToBlind > 3.0 || stackBb > 20) return null;
	if (!isSuited && !isPair && baseFreq >= 1.0) return null;

	if (baseFreq === 0.0 && (handName.includes('s') || isPair)) {
		return {
			adjustedFreq: baseFreq,
			justification: 'Sinal de urgência da órbita: é necessário um range de referência e um modelo temporal reproduzível antes de alterar uma frequência.',
		};
	}
	if (baseFreq > 0.0 && baseFreq < 1.0) {
		return {
			adjustedFreq: baseFreq,
			justification: 'Sinal de erosão de stack: o painel preserva a frequência de referência até que cenário, ranges e modelo de FGS estejam calibrados.',
		};
	}
	return null;
}

function getRiskAdvantageAdjustment(
	riskAdvantage: number,
	handType: HandType,
	baseFreq: number
): { adjustedFreq: number; justification: string } | null {
	if (riskAdvantage > 3 && baseFreq > 0 && baseFreq < 1.0) {
		return {
			adjustedFreq: baseFreq,
			justification: 'Vantagem de Risco positiva é um sinal direcional; não produz, por si só, um deslocamento numérico de frequência.',
		};
	}
	if (riskAdvantage < -3 && handType === 'OFFSUIT' && baseFreq > 0) {
		return {
			adjustedFreq: baseFreq,
			justification: 'Desvantagem de Risco negativa pede revisão do spot, não redução automática de frequência sem ranges, pote e payout definidos.',
		};
	}
	return null;
}

function computeHandAdjustment(params: AdjustmentParams): { adjustedFreq: number; justification: string } {
	if (params.hasShortStackPressure) {
		const shortStackAdj = getShortStackPressureAdjustment(params.baseFreq);
		if (shortStackAdj) return shortStackAdj;
	}

	const timeAdj = getTimeToBlindAdjustment(
		params.handName,
		params.baseFreq,
		params.isSuited,
		params.isPair,
		params.timeToBlind,
		params.stackBb
	);
	if (timeAdj) return timeAdj;

	const riskAdj = getRiskAdvantageAdjustment(params.riskAdvantage, params.handType, params.baseFreq);
	if (riskAdj) return riskAdj;

	return {
		adjustedFreq: params.baseFreq,
		justification: 'Alinhado ao Equilíbrio GTO Baseline',
	};
}

function getHandTypeAndName(r: number, c: number): {
	handName: string;
	handType: HandType;
	isPair: boolean;
	isSuited: boolean;
} {
	if (r === c) {
		return { handName: `${RANKS[r]}${RANKS[c]}`, handType: 'PAIR', isPair: true, isSuited: false };
	}
	if (r < c) {
		return { handName: `${RANKS[r]}${RANKS[c]}s`, handType: 'SUITED', isPair: false, isSuited: true };
	}
	return { handName: `${RANKS[c]}${RANKS[r]}o`, handType: 'OFFSUIT', isPair: false, isSuited: false };
}

function getHandWeight(type: HandType): number {
	if (type === 'PAIR') return 6;
	if (type === 'SUITED') return 4;
	return 12;
}

function getActionFromDelta(delta: number): HandAction {
	if (delta > 0.05) return 'EXPAND';
	if (delta < -0.05) return 'CONTRACT';
	return 'PARITY';
}

function getHandTypeLabel(type: HandType): string {
	if (type === 'PAIR') return 'Par em Mão';
	if (type === 'SUITED') return 'Naipe Idêntico (Suited)';
	return 'Naipes Diferentes (Offsuit)';
}

function getActionBadgeStyle(action: HandAction): { className: string; label: string } {
	if (action === 'EXPAND') {
		return {
			className: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
			label: 'Expansão Vitoi',
		};
	}
	if (action === 'CONTRACT') {
		return {
			className: 'bg-rose-500/20 text-rose-400 border border-rose-500/40',
			label: 'Contração RP',
		};
	}
	return {
		className: 'bg-slate-800 text-slate-400 border border-slate-700',
		label: 'Paridade GTO',
	};
}

function getDeltaColor(delta: number): string {
	if (delta > 0) return 'text-emerald-400';
	if (delta < 0) return 'text-rose-400';
	return 'text-slate-400';
}

function formatDeltaDisplay(delta: number): string {
	if (delta === 0) {
		return '— (aguarda nó)';
	}
	const percentage = (delta * 100).toFixed(0);
	return delta > 0 ? `+${percentage}%` : `${percentage}%`;
}

function getBaselineColor(freq: number): string {
	if (freq === 0) return 'bg-slate-900/80 text-slate-600';
	if (freq >= 0.8) return 'bg-sky-600 text-white font-bold';
	if (freq >= 0.4) return 'bg-sky-700/80 text-sky-200';
	return 'bg-sky-950 text-sky-400';
}

function getAdjustedColor(freq: number): string {
	if (freq === 0) return 'bg-slate-900/80 text-slate-600';
	if (freq >= 0.8) return 'bg-amber-500 text-slate-950 font-extrabold';
	if (freq >= 0.4) return 'bg-amber-600/80 text-white font-bold';
	return 'bg-amber-950 text-amber-300';
}

function getCellColor(cell: HandCellInfo, mode: ViewMode): string {
	if (mode === 'BASELINE_GTO') return getBaselineColor(cell.baselineFreq);
	if (mode === 'PMEV_ADJUSTED') return getAdjustedColor(cell.vitoiFreq);
	if (cell.action === 'EXPAND') {
		return 'bg-linear-to-br from-emerald-600 to-emerald-400 text-white font-extrabold shadow-[0_0_8px_rgba(16,185,129,0.5)]';
	}
	if (cell.action === 'CONTRACT') {
		return 'bg-linear-to-br from-rose-700 to-rose-500 text-white font-bold opacity-80';
	}
	if (cell.baselineFreq > 0) {
		return 'bg-slate-800 text-slate-300 font-semibold border border-slate-700';
	}
	return 'bg-slate-950 text-slate-700';
}

async function parseSolverFile(file: File): Promise<{ customMap: Record<string, number>; sourceLabel: string } | null> {
	const content = await file.text();
	if (file.name.endsWith('.json')) {
		const parsed = JSON.parse(content);
		const raw = parsed.strategy || parsed.range || parsed;
		const customMap: Record<string, number> = {};
		Object.entries(raw).forEach(([k, v]) => {
			if (typeof v === 'number') customMap[k] = v;
		});
		if (Object.keys(customMap).length > 0) {
			return { customMap, sourceLabel: `DeepSolver JSON (${file.name})` };
		}
	} else if (file.name.endsWith('.hrc') || file.name.endsWith('.txt')) {
		const lines = content.split('\n');
		const customMap: Record<string, number> = {};
		const hrcRegex = /^([AKQJT98765432]{2}[so]?)\s*[:=]\s*([\d.]+)%?/i;
		lines.forEach((l) => {
			const match = hrcRegex.exec(l);
			if (match?.[1] && match[2]) {
				const hand = match[1].toUpperCase();
				let val = Number.parseFloat(match[2]);
				if (val > 1.0) val /= 100.0;
				customMap[hand] = val;
			}
		});
		if (Object.keys(customMap).length > 0) {
			return { customMap, sourceLabel: `HRC Pro (${file.name})` };
		}
	}
	return null;
}

interface RangeViewerTabProps {
	readonly spotType: SpotType;
	readonly setSpotType: (spot: SpotType) => void;
	readonly position: string;
	readonly setPosition: (pos: string) => void;
	readonly setCustomBaseline: (base: Record<string, number> | null) => void;
	readonly stackBb: number;
	readonly setStackBb: (s: number) => void;
	readonly sizingBb: number;
	readonly riskAdvantage: number;
	readonly setRiskAdvantage: (r: number) => void;
	readonly riskAdvantageBadgeColor: string;
	readonly hasShortStackPressure: boolean;
	readonly setHasShortStackPressure: (h: boolean) => void;
	readonly timeToBlind: number;
	readonly setTimeToBlind: (t: number) => void;
	readonly calculatedEvFold: number;
	readonly stats: {
		readonly baseCombos: number;
	};
	readonly viewMode: ViewMode;
	readonly setViewMode: (mode: ViewMode) => void;
	readonly sourceLabel: string;
	readonly gridCells: HandCellInfo[];
	readonly selectedHand: HandCellInfo | null;
	readonly setSelectedHand: (cell: HandCellInfo) => void;
}

interface RangeControlsBarProps {
	readonly spotType: SpotType;
	readonly setSpotType: (spot: SpotType) => void;
	readonly position: string;
	readonly setPosition: (pos: string) => void;
	readonly setCustomBaseline: (base: Record<string, number> | null) => void;
	readonly stackBb: number;
	readonly setStackBb: (s: number) => void;
	readonly sizingBb: number;
	readonly riskAdvantage: number;
	readonly setRiskAdvantage: (r: number) => void;
	readonly riskAdvantageBadgeColor: string;
	readonly hasShortStackPressure: boolean;
	readonly setHasShortStackPressure: (h: boolean) => void;
	readonly timeToBlind: number;
	readonly setTimeToBlind: (t: number) => void;
}

function RangeControlsBar({
	spotType,
	setSpotType,
	position,
	setPosition,
	setCustomBaseline,
	stackBb,
	setStackBb,
	sizingBb,
	riskAdvantage,
	setRiskAdvantage,
	riskAdvantageBadgeColor,
	hasShortStackPressure,
	setHasShortStackPressure,
	timeToBlind,
	setTimeToBlind,
}: RangeControlsBarProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-slate-900/70 p-5 rounded-2xl border border-slate-800/80">
			<div>
				<label htmlFor="spot-type-select" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
					Spot & Ação
				</label>
				<div className="grid grid-cols-2 gap-2">
					<select
						id="spot-type-select"
						value={spotType}
						onChange={(e) => setSpotType(e.target.value as SpotType)}
						className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg p-2 font-bold focus:outline-none focus:border-amber-500"
					>
						<option value="RFI">RFI (Open Raise)</option>
						<option value="BB_DEFENSE">Defesa de BB</option>
						<option value="PUSH_FOLD">Push / Fold</option>
					</select>

					<select
						id="position-select"
						aria-label="Posição na Mesa"
						value={position}
						onChange={(e) => {
							setPosition(e.target.value);
							setCustomBaseline(null);
						}}
						className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg p-2 font-bold focus:outline-none focus:border-amber-500"
					>
						<option value="UTG">UTG (8 Atrás)</option>
						<option value="MP">MP / LJ (6 Atrás)</option>
						<option value="CO">CO (4 Atrás)</option>
						<option value="BTN">BTN (2 Atrás)</option>
						<option value="SB">SB (1 Atrás)</option>
					</select>
				</div>
			</div>

			<div>
				<div className="flex justify-between items-center mb-1.5">
					<label htmlFor="stack-slider" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
						Stack: <span className="text-amber-400 font-extrabold">{stackBb} BB</span>
					</label>
					<span className="text-[11px] text-slate-500">Sizing: {sizingBb}bb</span>
				</div>
				<input
					id="stack-slider"
					type="range"
					min="8"
					max="60"
					step="1"
					value={stackBb}
					onChange={(e) => setStackBb(Number.parseFloat(e.target.value))}
					className="w-full accent-amber-500 cursor-pointer"
				/>
			</div>

			<div>
				<div className="flex justify-between items-center mb-1.5">
					<label htmlFor="risk-advantage-slider" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
						Risk Advantage: <span className={riskAdvantageBadgeColor}>
							{riskAdvantage > 0 ? `+${riskAdvantage}` : riskAdvantage}
						</span>
					</label>
				</div>
				<input
					id="risk-advantage-slider"
					type="range"
					min="-10"
					max="10"
					step="1"
					value={riskAdvantage}
					onChange={(e) => setRiskAdvantage(Number.parseFloat(e.target.value))}
					className="w-full accent-amber-500 cursor-pointer"
				/>
				<div className="flex justify-between text-[10px] text-slate-500 mt-1">
					<span>Hero Coberto (CL)</span>
					<span>Neutro</span>
					<span>Hero Cobre (Pressão)</span>
				</div>
			</div>

			<div>
				<span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
					Custo de Sobrevivência (EV_fold)
				</span>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => setHasShortStackPressure(!hasShortStackPressure)}
						className={`text-xs px-3 py-2 rounded-lg font-bold border transition-all flex-1 ${
							hasShortStackPressure
								? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
								: 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
						}`}
					>
						{hasShortStackPressure ? '⚡ Payjump Passivo (EV>0)' : 'Órbita Normal'}
					</button>

					<button
						type="button"
						onClick={() => setTimeToBlind(timeToBlind <= 3 ? 12 : 2)}
						className={`text-xs px-3 py-2 rounded-lg font-bold border transition-all flex-1 ${
							timeToBlind <= 3
								? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
								: 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
						}`}
					>
						{timeToBlind <= 3 ? '🚨 Blinds em 2m' : '⏱ Blinds em 12m'}
					</button>
				</div>
			</div>
		</div>
	);
}

interface RangeKpiSummaryProps {
	readonly calculatedEvFold: number;
	readonly stats: {
		readonly baseCombos: number;
	};
}

function RangeKpiSummary({ calculatedEvFold, stats }: RangeKpiSummaryProps) {
	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
			<div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
				<span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sinal EV_fold do modelo</span>
				<div className={`text-xl font-black mt-1 ${calculatedEvFold > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
					{calculatedEvFold > 0 ? `+${calculatedEvFold.toFixed(3)} BB` : `${calculatedEvFold.toFixed(3)} BB`}
				</div>
				<p className="text-[10px] text-slate-500 mt-1">
					{calculatedEvFold > 0 ? 'Hipótese de payjump: requer payouts e nós reproduzíveis.' : 'Referência de erosão: depende de ante, posição e mesa declarados.'}
				</p>
			</div>

			<div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
				<span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Combos de referência</span>
				<div className="text-xl font-black text-amber-400 mt-1">
					{stats.baseCombos} <span className="text-xs text-slate-500 font-normal">do baseline carregado</span>
				</div>
				<p className="text-[10px] text-slate-500 mt-1">
					Recalibração quantitativa: <strong className="text-amber-400">aguarda nó/ranges</strong>
				</p>
			</div>

			<div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
				<span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Expansões calibradas</span>
				<div className="text-xl font-black text-emerald-400 mt-1">
					—
				</div>
				<p className="text-[10px] text-slate-500 mt-1">Não derivadas de slider sem nó verificável.</p>
			</div>

			<div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
				<span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Contrações calibradas</span>
				<div className="text-xl font-black text-rose-400 mt-1">
					—
				</div>
				<p className="text-[10px] text-slate-500 mt-1">Não derivadas de RP/RIO isolados.</p>
			</div>
		</div>
	);
}

interface SingleMatrixWithInspectorProps {
	readonly gridCells: HandCellInfo[];
	readonly selectedHand: HandCellInfo | null;
	readonly setSelectedHand: (cell: HandCellInfo) => void;
	readonly viewMode: ViewMode;
}

function SingleMatrixWithInspector({
	gridCells,
	selectedHand,
	setSelectedHand,
	viewMode,
}: SingleMatrixWithInspectorProps) {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
			<div className="lg:col-span-8 bg-slate-950 p-4 rounded-2xl border border-slate-800/80 shadow-inner">
				<div className="grid grid-cols-13 gap-1 md:gap-1.5 aspect-square">
					{gridCells.map((cell) => {
						const isSelected = selectedHand?.hand === cell.hand;
						const colorClass = getCellColor(cell, viewMode);

						return (
							<button
								type="button"
								key={cell.hand}
								onClick={() => setSelectedHand(cell)}
								className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[10px] md:text-xs font-bold transition-all relative select-none ${colorClass} ${
									isSelected ? 'ring-2 ring-amber-400 scale-105 z-10 shadow-lg' : 'hover:scale-105 hover:z-10'
								}`}
							>
								<span>{cell.hand}</span>
								{viewMode === 'DELTA' && cell.delta !== 0 && (
									<span className="text-[8px] font-black leading-none opacity-90">
										{cell.delta > 0 ? `+${Math.round(cell.delta * 100)}%` : `${Math.round(cell.delta * 100)}%`}
									</span>
								)}
							</button>
						);
					})}
				</div>
			</div>

			<div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
				{selectedHand ? (
					<div>
						<div className="flex items-center justify-between pb-4 border-b border-slate-800">
							<div>
								<h3 className="text-3xl font-black text-white">{selectedHand.hand}</h3>
								<span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
									{getHandTypeLabel(selectedHand.type)}
								</span>
							</div>
							<span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase ${getActionBadgeStyle(selectedHand.action).className}`}>
								{getActionBadgeStyle(selectedHand.action).label}
							</span>
						</div>

						<div className="space-y-4 my-5">
							<div className="flex justify-between items-center text-sm">
								<span className="text-slate-400 font-semibold">Frequência GTO Baseline:</span>
								<span className="text-white font-bold">{(selectedHand.baselineFreq * 100).toFixed(0)}%</span>
							</div>

							<div className="flex justify-between items-center text-sm">
								<span className="text-slate-400 font-semibold">Frequência de referência:</span>
								<span className="text-amber-400 font-extrabold">{(selectedHand.vitoiFreq * 100).toFixed(0)}%</span>
							</div>

							<div className="flex justify-between items-center text-sm">
								<span className="text-slate-400 font-semibold">Delta calculado:</span>
								<span className={`font-black ${getDeltaColor(selectedHand.delta)}`}>
									{formatDeltaDisplay(selectedHand.delta)}
								</span>
							</div>

							<div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 mt-4">
								<span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
									Justificativa Epistêmica (Vitoi Framework)
								</span>
								<p className="text-xs text-slate-300 leading-relaxed">
									{selectedHand.justification}
								</p>
							</div>
						</div>
					</div>
				) : (
					<div className="flex items-center justify-center h-full text-slate-500 text-xs">
						Selecione uma mão na matriz 13x13 para inspecionar o racional.
					</div>
				)}

				<div className="pt-4 border-t border-slate-800 text-[11px] space-y-1.5 text-slate-400">
					<div className="flex items-center gap-2">
						<span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
						<span><strong>Verde:</strong> reservado para expansão comprovada por nó importado.</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="w-3 h-3 rounded bg-slate-700 inline-block"></span>
						<span><strong>Cinza/Azul:</strong> Paridade com o equilíbrio GTO.</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="w-3 h-3 rounded bg-rose-600 inline-block"></span>
						<span><strong>Vermelho:</strong> reservado para contração comprovada por nó importado.</span>
					</div>
				</div>
			</div>
		</div>
	);
}

interface DualGridComparisonProps {
	readonly gridCells: HandCellInfo[];
	readonly stats: {
		readonly baseCombos: number;
	};
}

function DualGridComparison({ gridCells, stats }: DualGridComparisonProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
				<div className="flex justify-between items-center mb-3">
					<h4 className="text-xs font-black uppercase text-sky-400 tracking-wider">1. Solver Baseline (GTO Puro)</h4>
					<span className="text-xs text-slate-500 font-bold">{stats.baseCombos} Combos</span>
				</div>
				<div className="grid grid-cols-13 gap-1 aspect-square">
					{gridCells.map((cell) => (
						<div
							key={`base-${cell.hand}`}
							className={`aspect-square rounded flex items-center justify-center text-[9px] font-bold ${getCellColor(cell, 'BASELINE_GTO')}`}
						>
							{cell.hand}
						</div>
					))}
				</div>
			</div>

			<div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
				<div className="flex justify-between items-center mb-3">
					<h4 className="text-xs font-black uppercase text-amber-400 tracking-wider">2. Campo PMev (calibração pendente)</h4>
					<span className="text-xs text-amber-400 font-bold">sem delta automático</span>
				</div>
				<div className="grid grid-cols-13 gap-1 aspect-square">
					{gridCells.map((cell) => (
						<div
							key={`vitoi-${cell.hand}`}
							className={`aspect-square rounded flex items-center justify-center text-[9px] font-bold ${getCellColor(cell, 'PMEV_ADJUSTED')}`}
						>
							{cell.hand}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

function RangeViewerTab({
	spotType,
	setSpotType,
	position,
	setPosition,
	setCustomBaseline,
	stackBb,
	setStackBb,
	sizingBb,
	riskAdvantage,
	setRiskAdvantage,
	riskAdvantageBadgeColor,
	hasShortStackPressure,
	setHasShortStackPressure,
	timeToBlind,
	setTimeToBlind,
	calculatedEvFold,
	stats,
	viewMode,
	setViewMode,
	sourceLabel,
	gridCells,
	selectedHand,
	setSelectedHand,
}: RangeViewerTabProps) {
	return (
		<div>
			<RangeControlsBar
				spotType={spotType}
				setSpotType={setSpotType}
				position={position}
				setPosition={setPosition}
				setCustomBaseline={setCustomBaseline}
				stackBb={stackBb}
				setStackBb={setStackBb}
				sizingBb={sizingBb}
				riskAdvantage={riskAdvantage}
				setRiskAdvantage={setRiskAdvantage}
				riskAdvantageBadgeColor={riskAdvantageBadgeColor}
				hasShortStackPressure={hasShortStackPressure}
				setHasShortStackPressure={setHasShortStackPressure}
				timeToBlind={timeToBlind}
				setTimeToBlind={setTimeToBlind}
			/>

			<RangeKpiSummary
				calculatedEvFold={calculatedEvFold}
				stats={stats}
			/>

			{/* Abas de Modo de Visualização */}
			<div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-6">
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => setViewMode('DELTA')}
						className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
							viewMode === 'DELTA'
								? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
								: 'bg-slate-900 text-slate-400 hover:text-white'
						}`}
					>
						Diferencial (aguarda nó)
					</button>

					<button
						type="button"
						onClick={() => setViewMode('PMEV_ADJUSTED')}
						className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
							viewMode === 'PMEV_ADJUSTED'
								? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
								: 'bg-slate-900 text-slate-400 hover:text-white'
						}`}
					>
						Campo PMev (referência)
					</button>

					<button
						type="button"
						onClick={() => setViewMode('BASELINE_GTO')}
						className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
							viewMode === 'BASELINE_GTO'
								? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
								: 'bg-slate-900 text-slate-400 hover:text-white'
						}`}
					>
						GTO Solver Baseline
					</button>

					<button
						type="button"
						onClick={() => setViewMode('DUAL_GRID')}
						className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
							viewMode === 'DUAL_GRID'
								? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
								: 'bg-slate-900 text-slate-400 hover:text-white'
						}`}
					>
						Dual Grid (Lado a Lado)
					</button>
				</div>

				<div className="text-right text-[11px] text-slate-500">
					Fonte ativa: <span className="text-slate-300 font-bold">{sourceLabel}</span>
				</div>
			</div>

			{viewMode !== 'DUAL_GRID' ? (
				<SingleMatrixWithInspector
					gridCells={gridCells}
					selectedHand={selectedHand}
					setSelectedHand={setSelectedHand}
					viewMode={viewMode}
				/>
			) : (
				<DualGridComparison
					gridCells={gridCells}
					stats={stats}
				/>
			)}
		</div>
	);
}

interface ToyGamesLabTabProps {
	readonly selectedToyGame: ToyGameScenario;
	readonly setSelectedToyGame: (tg: ToyGameScenario) => void;
}

function ToyGamesLabTab({ selectedToyGame, setSelectedToyGame }: ToyGamesLabTabProps) {
	return (
		<div>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
				<div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
					<span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block mb-2">
						1. Vantagem de Risco (IP RP 3% vs OOP RP Alto)
					</span>
					<div className="space-y-1.5">
						{TOY_GAMES_DATABASE.filter((tg) => tg.category === 'RISK_ADVANTAGE' || tg.category === 'CHIP_EV').map((tg) => (
							<button
								type="button"
								key={tg.id}
								onClick={() => setSelectedToyGame(tg)}
								className={`w-full text-left text-xs p-2.5 rounded-xl font-bold transition-all ${
									selectedToyGame.id === tg.id
										? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
										: 'bg-slate-800 text-slate-300 hover:bg-slate-700'
								}`}
							>
								{tg.title}
							</button>
						))}
					</div>
				</div>

				<div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
					<span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-2">
						2. Inversão de Risco (IP RP Alto vs OOP RP 3%)
					</span>
					<div className="space-y-1.5">
						{TOY_GAMES_DATABASE.filter((tg) => tg.category === 'RISK_INVERSION').map((tg) => (
							<button
								type="button"
								key={tg.id}
								onClick={() => setSelectedToyGame(tg)}
								className={`w-full text-left text-xs p-2.5 rounded-xl font-bold transition-all ${
									selectedToyGame.id === tg.id
										? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
										: 'bg-slate-800 text-slate-300 hover:bg-slate-700'
								}`}
							>
								{tg.title}
							</button>
						))}
					</div>
				</div>

				<div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
					<div>
						<span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
							Métricas PioSolver / Toy Game
						</span>
						<h4 className="text-sm font-black text-white">{selectedToyGame.title}</h4>
						<p className="text-xs text-slate-400 mt-1">{selectedToyGame.description}</p>
					</div>

					<div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800 text-center">
						<div className="bg-slate-900 p-2 rounded-lg">
							<span className="text-[9px] text-slate-500 uppercase block font-bold">IP Shove Freq</span>
							<span className="text-sm font-extrabold text-amber-400">{selectedToyGame.ipShovePercent}%</span>
						</div>
						<div className="bg-slate-900 p-2 rounded-lg">
							<span className="text-[9px] text-slate-500 uppercase block font-bold">OOP KK Defense</span>
							<span className="text-sm font-extrabold text-emerald-400">{selectedToyGame.oopCallPercent}%</span>
						</div>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950 p-6 rounded-3xl border border-slate-800">
				<div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
					<div className="flex justify-between items-center pb-3 border-b border-slate-800">
						<div>
							<h4 className="text-sm font-black text-sky-400 uppercase">Range IP (AA, QQ, JJ - 18 Combos)</h4>
							<span className="text-xs text-slate-500 font-semibold">Risk Premium: {selectedToyGame.rpIp}%</span>
						</div>
						<span className="text-xs font-black text-white bg-sky-500/20 px-3 py-1 rounded-full border border-sky-500/40">
							Shove Total: {selectedToyGame.ipShovePercent}%
						</span>
					</div>

					<div className="space-y-3 mt-4">
						<div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
							<div className="flex justify-between text-xs font-bold mb-1">
								<span className="text-slate-300">Valor Puro (AA - 6 Combos):</span>
								<span className="text-emerald-400 font-black">100% Shove (6.0 Combos)</span>
							</div>
							<div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
								<div className="bg-emerald-500 h-full w-full"></div>
							</div>
						</div>

						<div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
							<div className="flex justify-between text-xs font-bold mb-1">
								<span className="text-slate-300">Blefes (QQ, JJ - 12 Combos):</span>
								<span className="text-amber-400 font-black">
									{((selectedToyGame.ipBluffCombos / 12) * 100).toFixed(1)}% Shove ({selectedToyGame.ipBluffCombos} Combos)
								</span>
							</div>
							<div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
								<div
									className="bg-amber-500 h-full transition-all duration-500"
									style={{ width: `${Math.min(100, (selectedToyGame.ipBluffCombos / 12) * 100)}%` }}
								></div>
							</div>
						</div>
					</div>
				</div>

				<div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
					<div className="flex justify-between items-center pb-3 border-b border-slate-800">
						<div>
							<h4 className="text-sm font-black text-rose-400 uppercase">Range OOP (KK Bluffcatcher - 6 Combos)</h4>
							<span className="text-xs text-slate-500 font-semibold">Risk Premium: {selectedToyGame.rpOop}%</span>
						</div>
						<span className={`text-xs font-black px-3 py-1 rounded-full border ${
							selectedToyGame.oopFoldPercent > 60
								? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
								: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
						}`}>
							Fold: {selectedToyGame.oopFoldPercent}% | Call: {selectedToyGame.oopCallPercent}%
						</span>
					</div>

					<div className="space-y-3 mt-4">
						<div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
							<div className="flex justify-between text-xs font-bold mb-1">
								<span className="text-slate-300">Ação de Call no River (MDF vs Teto do RP):</span>
								<span className="text-emerald-400 font-black">
									{selectedToyGame.oopCallPercent}% ({(6 * (selectedToyGame.oopCallPercent / 100)).toFixed(1)} Combos)
								</span>
							</div>
							<div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
								<div
									className="bg-emerald-500 h-full transition-all duration-500"
									style={{ width: `${selectedToyGame.oopCallPercent}%` }}
								></div>
							</div>
						</div>

						<div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
							<div className="flex justify-between text-xs font-bold mb-1">
								<span className="text-slate-300">Ação de Fold (Preservação de Valuation):</span>
								<span className="text-rose-400 font-black">
									{selectedToyGame.oopFoldPercent}% ({(6 * (selectedToyGame.oopFoldPercent / 100)).toFixed(1)} Combos)
								</span>
							</div>
							<div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
								<div
									className="bg-rose-600 h-full transition-all duration-500"
									style={{ width: `${selectedToyGame.oopFoldPercent}%` }}
								></div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl mt-6">
				<span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider block mb-2">
					💡 Racional Teórico do Paradoxo VITOI ("Entendendo o ICM e suas heurísticas")
				</span>
				<p className="text-xs md:text-sm text-slate-300 leading-relaxed">
					{selectedToyGame.vitoiInsight}
				</p>
			</div>
		</div>
	);
}

export function PmevRangeViewer() {
	const [activeTab, setActiveTab] = useState<MainTab>('RANGE_VIEWER');

	// 1. Configurações Estruturais e de Spot
	const [spotType, setSpotType] = useState<SpotType>('RFI');
	const [position, setPosition] = useState<string>('CO');
	const [stackBb, setStackBb] = useState<number>(25.0);
	const [sizingBb] = useState<number>(2.2);

	// 2. Parâmetros da Geometria do Risco & Vitoi Framework
	const [riskAdvantage, setRiskAdvantage] = useState<number>(0.0); // -10 (Desvantagem) a +10 (Vantagem)
	const [hasShortStackPressure, setHasShortStackPressure] = useState<boolean>(false); // Payjump passivo
	const [timeToBlind, setTimeToBlind] = useState<number>(8.0); // Minutos restantes

	// 3. Estado de Visualização e Solver
	const [viewMode, setViewMode] = useState<ViewMode>('DELTA');
	const [customBaseline, setCustomBaseline] = useState<Record<string, number> | null>(null);
	const [sourceLabel, setSourceLabel] = useState<string>('DeepSolver / GTO Standard');
	const [selectedHand, setSelectedHand] = useState<HandCellInfo | null>(null);
	const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);

	// 4. Toy Games State
	const [selectedToyGame, setSelectedToyGame] = useState<ToyGameScenario>(TOY_GAMES_DATABASE[2] as ToyGameScenario);

	// Determina o range baseline ativo
	const activeBaseline = useMemo(() => {
		if (customBaseline) return customBaseline;
		return DEFAULT_RFI_RANGES[position] || DEFAULT_RFI_RANGES['CO'] || {};
	}, [customBaseline, position]);

	// Calcula o Custo do Fold Dinâmico (EV_fold != 0)
	const calculatedEvFold = useMemo(() => {
		const baseChipAnte = -0.125;
		if (hasShortStackPressure) {
			return +0.35; // Payjump passivo sem risco
		}
		if (timeToBlind <= 3.0) {
			return -0.45; // Blinds subindo em breve
		}
		return baseChipAnte;
	}, [hasShortStackPressure, timeToBlind]);

	// Computa os 169 combos e seus ajustes conceituais de acordo com o Arcabouço Vitoi
	const gridCells = useMemo<HandCellInfo[]>(() => {
		const cells: HandCellInfo[] = [];

		for (let r = 0; r < 13; r++) {
			for (let c = 0; c < 13; c++) {
				const { handName, handType, isPair, isSuited } = getHandTypeAndName(r, c);
				const baseFreq = activeBaseline[handName] ?? 0.0;

				const { adjustedFreq: rawAdjusted, justification } = computeHandAdjustment({
					handName,
					handType,
					baseFreq,
					isPair,
					isSuited,
					hasShortStackPressure,
					timeToBlind,
					stackBb,
					riskAdvantage,
				});

				const adjustedFreq = Math.round(rawAdjusted * 100) / 100;
				const delta = Math.round((adjustedFreq - baseFreq) * 100) / 100;
				const action = getActionFromDelta(delta);

				cells.push({
					hand: handName,
					r,
					c,
					type: handType,
					baselineFreq: baseFreq,
					vitoiFreq: adjustedFreq,
					delta,
					action,
					justification,
				});
			}
		}
		return cells;
	}, [activeBaseline, hasShortStackPressure, timeToBlind, stackBb, riskAdvantage]);

	useEffect(() => {
		if (!selectedHand && gridCells.length > 0) {
			const initial = gridCells.find((c) => c.hand === '76s') || gridCells[0] || null;
			setSelectedHand(initial);
		}
	}, [gridCells, selectedHand]);

	const stats = useMemo(() => {
		let totalBase = 0;

		gridCells.forEach((c) => {
			const weight = getHandWeight(c.type);
			totalBase += c.baselineFreq * weight;
		});

		return {
			baseCombos: Math.round(totalBase),
		};
	}, [gridCells]);

	const handleFileUpload = async (file: File) => {
		try {
			const parsedResult = await parseSolverFile(file);
			if (parsedResult) {
				setCustomBaseline(parsedResult.customMap);
				setSourceLabel(parsedResult.sourceLabel);
			}
		} catch (err) {
			console.error('Erro na ingestão de arquivo do solver:', err);
		}
	};

	const handleDownloadPdf = async () => {
		setDownloadingPdf(true);
		try {
			const res = await fetch('/api/sota/pmev-pdf', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					stack_bb: stackBb,
					bubble_factor: 1.0 + Math.abs(riskAdvantage) * 0.15,
					time_to_blind: timeToBlind,
					pmev_threshold: 0.43,
					expanded_hands: gridCells.filter((c) => c.action === 'EXPAND').map((c) => c.hand),
				}),
			});
			if (res.ok) {
				const blob = await res.blob();
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `relatorio_tecnico_poker_racional_${position}_${stackBb}bb.pdf`;
				document.body.appendChild(a);
				a.click();
				a.remove();
				window.URL.revokeObjectURL(url);
			}
		} catch (err) {
			console.error('Erro no download do PDF:', err);
		} finally {
			setDownloadingPdf(false);
		}
	};

	const riskAdvantageBadgeColor = getDeltaColor(riskAdvantage);

	return (
		<div className="w-full bg-[#0b0e14] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-200">
			{/* Top Header */}
			<div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-slate-800 gap-4">
				<div>
					<div className="flex items-center gap-3">
						<span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
							Arcabouço do Poker Racional · Vitoi Framework
						</span>
						<h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
							Range Viewer & Laboratório de Heurísticas do ICM
						</h2>
					</div>
					<p className="text-xs md:text-sm text-slate-400 mt-1.5">
						Modelagem sistêmica baseada nos toy-games do <strong className="text-slate-200">PioSolver</strong> e na obra <strong className="text-slate-200">"Entendendo o ICM e suas heurísticas"</strong>.
					</p>
				</div>

				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={handleDownloadPdf}
						disabled={downloadingPdf}
						className="flex items-center gap-2 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black px-4 py-2 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
					>
						<span>📄</span>
						<span>{downloadingPdf ? 'Gerando...' : 'Baixar Relatório (PDF)'}</span>
					</button>

					<label htmlFor="solver-upload-input" className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white px-4 py-2 rounded-xl border border-slate-700 transition-colors">
						<span>Importar Solver (.json/.hrc/.csv)</span>
						<input
							id="solver-upload-input"
							type="file"
							accept=".json,.hrc,.txt,.csv"
							className="hidden"
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) handleFileUpload(file);
							}}
						/>
					</label>
				</div>
			</div>

			{/* Main Module Tabs */}
			<div className="flex items-center gap-3 my-6 border-b border-slate-800 pb-3">
				<button
					type="button"
					onClick={() => setActiveTab('RANGE_VIEWER')}
					className={`text-xs md:text-sm font-black px-5 py-2.5 rounded-xl transition-all ${
						activeTab === 'RANGE_VIEWER'
							? 'bg-amber-500 text-slate-950 shadow-lg'
							: 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
					}`}
				>
					1. Range Viewer de Abertura & Defesa
				</button>

				<button
					type="button"
					onClick={() => setActiveTab('TOY_GAMES_LAB')}
					className={`text-xs md:text-sm font-black px-5 py-2.5 rounded-xl transition-all ${
						activeTab === 'TOY_GAMES_LAB'
							? 'bg-amber-500 text-slate-950 shadow-lg'
							: 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
					}`}
				>
					2. Laboratório de Toy Games (PioSolver RP 3x6 a 24x3)
				</button>
			</div>

			{activeTab === 'RANGE_VIEWER' ? (
				<RangeViewerTab
					spotType={spotType}
					setSpotType={setSpotType}
					position={position}
					setPosition={setPosition}
					setCustomBaseline={setCustomBaseline}
					stackBb={stackBb}
					setStackBb={setStackBb}
					sizingBb={sizingBb}
					riskAdvantage={riskAdvantage}
					setRiskAdvantage={setRiskAdvantage}
					riskAdvantageBadgeColor={riskAdvantageBadgeColor}
					hasShortStackPressure={hasShortStackPressure}
					setHasShortStackPressure={setHasShortStackPressure}
					timeToBlind={timeToBlind}
					setTimeToBlind={setTimeToBlind}
					calculatedEvFold={calculatedEvFold}
					stats={stats}
					viewMode={viewMode}
					setViewMode={setViewMode}
					sourceLabel={sourceLabel}
					gridCells={gridCells}
					selectedHand={selectedHand}
					setSelectedHand={setSelectedHand}
				/>
			) : (
				<ToyGamesLabTab
					selectedToyGame={selectedToyGame}
					setSelectedToyGame={setSelectedToyGame}
				/>
			)}
		</div>
	);
}
