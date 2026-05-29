/** @format */

import { calculateRioTension } from '@/lib/perspectiva';
import type { HeroPosition, QuantumMetrics } from './types';
import type { Step as TourStep } from '../ui/SimulatorTour';

type QuantumPerspectiva = import('@/lib/perspectiva').PerspectivaResult;

export interface ActionMetricsParams {
	heroInvested: number;
	currentPot: number;
	bfForDash: number;
	rpForDash: number;
	quantumPerspectiva: QuantumPerspectiva | null;
	heroRawStack: number;
	heroPosition: HeroPosition;
	baseFgsErosion: number;
	apiQuantumMetrics?: QuantumMetrics | null;
	activePlayers: number;
}

export function calculateActionMetrics(params: ActionMetricsParams) {
	const {
		heroInvested,
		currentPot,
		bfForDash,
		rpForDash,
		quantumPerspectiva,
		heroRawStack,
		heroPosition,
		baseFgsErosion,
		apiQuantumMetrics,
		activePlayers,
	} = params;

	const humanNoiseFactor = apiQuantumMetrics?.marginInstability ? apiQuantumMetrics.marginInstability / 100 : 0;

	const fallbackFold =
		quantumPerspectiva ?
			quantumPerspectiva.dynamicEvFold
		:	-heroInvested * (1 + rpForDash / 200);
	const foldPerspectiva = apiQuantumMetrics?.adjustedEvFold ?? fallbackFold;
	const fallbackCall =
		quantumPerspectiva ? quantumPerspectiva.perspectivaPct : currentPot * 0.3;
	const callPerspectiva = apiQuantumMetrics?.perspectiva ?? fallbackCall;
	const callChipEv =
		quantumPerspectiva ?
			quantumPerspectiva.deltaWinPct * 0.5 +
			quantumPerspectiva.deltaLosePct * 0.5
		:	currentPot * 0.3;

	const opponents = Math.max(1, activePlayers - 1);
	// SOTA GOLD: RIO Exponencial (x^(2+f))
	const multiwayMultiplier = Math.pow(opponents, 2 + humanNoiseFactor);
	const baseRioLiability =
		(quantumPerspectiva ? quantumPerspectiva.rioLiability : rpForDash) *
		multiwayMultiplier;

	const posType = heroPosition === 'IP' ? 'IP' : 'OOP';
	let rioTension = 1;
	if (apiQuantumMetrics?.ci == null || apiQuantumMetrics.ci >= 1)
		rioTension = calculateRioTension(
			heroInvested,
			currentPot,
			heroRawStack,
			posType,
			baseRioLiability,
			activePlayers,
			humanNoiseFactor,
		);

	const raiseTension = calculateRioTension(
		heroInvested,
		currentPot,
		heroRawStack,
		posType,
		rpForDash,
		activePlayers,
		humanNoiseFactor,
		0.6,
	);
	return {
		fold: {
			chipEv: -heroInvested,
			perspectiva: foldPerspectiva,
			fgsImpact: baseFgsErosion,
			tension: 0,
		},
		call: {
			chipEv: callChipEv,
			perspectiva: callPerspectiva,
			fgsImpact: baseFgsErosion * 0.5,
			tension: rioTension,
		},
		raise: {
			chipEv: currentPot * 0.8,
			perspectiva: callPerspectiva * bfForDash,
			fgsImpact: Math.abs(baseFgsErosion),
			tension: raiseTension,
		},
	};
}

export function calculateBaseFgsErosion(
	quantumPerspectiva: QuantumPerspectiva | null,
	blindsRisingSoon: boolean,
	anteSize: number,
	heroPosition: HeroPosition,
): number {
	if (quantumPerspectiva)
		return quantumPerspectiva.dynamicEvFold - quantumPerspectiva.deltaFoldPct;
	if (blindsRisingSoon) {
		const timeErosion = -(anteSize / 100) * 3;
		const penaltyMap: Record<string, number> = { IP: -1.5, BB: -0.5, SB: 0 };
		return timeErosion + (penaltyMap[heroPosition] ?? 0);
	}
	return 0;
}

export function createSpotData({
	heroUpdatedStack,
	villainUpdatedStack,
	isIp,
	currentPot,
	bfForDash,
	rpForDash,
	quantumPerspectiva,
	isBaseline,
	baseFgsErosion,
	apiQuantumMetrics,
	street,
	board,
	heroRange,
	villainRange,
}: {
	heroUpdatedStack: number;
	villainUpdatedStack: number;
	isIp: boolean;
	currentPot: number;
	bfForDash: number;
	rpForDash: number;
	quantumPerspectiva: QuantumPerspectiva | null;
	isBaseline: boolean;
	baseFgsErosion: number;
	apiQuantumMetrics: QuantumMetrics | null;
	street: string;
	board: string;
	heroRange: string;
	villainRange: string;
}) {
	return {
		heroStack: heroUpdatedStack,
		villainStack: villainUpdatedStack,
		heroRole: isIp ? 'Agressor (IP)' : 'Defensor (OOP)',
		villainRole: isIp ? 'Defensor (OOP)' : 'Agressor (IP)',
		pot: currentPot,
		betSize: currentPot * 0.5,
		bubbleFactor: bfForDash,
		riskPremium: rpForDash,
		chipEv: quantumPerspectiva ? quantumPerspectiva.currentEquityPct : 0,
		fgsProjection: baseFgsErosion,
		fgsHealth: quantumPerspectiva ? quantumPerspectiva.fgsHealth : 1,
		isBaseline,
		apiQuantumMetrics,
		street,
		board,
		heroRange,
		villainRange,
	};
}

export function performTourScrollAndHighlight(
	step: TourStep,
	setTourSpotlight: (rect: DOMRect | null) => void,
): ReturnType<typeof setTimeout> {
	if (step.openDetails) {
		const detailsEl = document.querySelector(
			'#anchor-aula12 details',
		) as HTMLDetailsElement;
		if (detailsEl) detailsEl.open = true;
	}
	return setTimeout(() => {
		const el = document.getElementById(step.targetId);
		if (el) {
			setTourSpotlight(el.getBoundingClientRect());
			el.scrollIntoView({ behavior: 'smooth', block: 'center' });
			el.classList.add('pulse-border');
		}
	}, 150);
}

// SOTA v4.2: Helpers Visuais para PmLens
export function formatPct(v: number, d = 2): string {
	return `${v >= 0 ? '+' : ''}${v.toFixed(d)}%`;
}

export function getPmColorClass(v: number): string {
	if (v > 0) return 'text-accent-emerald';
	return 'text-accent-danger';
}

export function getVerdictText(loading: boolean, pm: number): string {
	if (loading) return '...';
	return pm > 0 ? 'SOBERANO' : 'INSOLVENTE';
}

export function formatCi(loading: boolean, ci: number | null): string {
	if (loading) return '...';
	return ci === null ? '—' : ci.toFixed(2);
}

export function calcBF(rp: number): number {
	if (rp >= 100) return 999;
	return 100 / (100 - rp);
}

// SOTA v4.2: Helpers de Formatação para PostFlop
export function formatEvFold(evFold: number) {
	const isPositive = evFold >= 0;
	return {
		text: `${isPositive ? '+' : ''}${evFold.toFixed(2)} bb`,
		colorClass: isPositive ? 'text-accent-emerald' : 'text-accent-danger',
	};
}

export function formatDeltaRp(delta: number) {
	const isPositive = delta >= 0;
	return {
		text: `${isPositive ? '+' : ''}${delta.toFixed(1)}%`,
		colorClass: delta > 0 ? 'text-accent-amber' : 'text-text-muted',
	};
}

export function formatPm(pm: number) {
	const isPositive = pm >= 0;
	return {
		text: `${isPositive ? '+' : ''}${pm.toFixed(2)}`,
		colorClass: isPositive ? 'text-accent-emerald' : 'text-accent-danger',
	};
}

export function getCiStyle(ci: number) {
	const isSolvent = ci >= 1;
	return {
		colorClass: isSolvent ? 'text-accent-emerald' : 'text-accent-danger',
		hint: isSolvent ? 'solvente' : 'insolvente',
	};
}

export function getSprColorClass(spr: number): string {
	if (spr < 2) return 'text-accent-danger';
	if (spr < 5) return 'text-accent-amber';
	return 'text-accent-emerald';
}

// SOTA v4.2: Helpers para MatchupSelector
export function classifyRp(rp: number): {
	label: string;
	color: string;
	badge: string;
} {
	if (rp >= 40)
		return { label: 'Death Zone', color: 'text-accent-danger', badge: '☠' };
	if (rp >= 25)
		return { label: 'Predator Zone', color: 'text-accent-amber', badge: '⚠' };
	if (rp >= 15)
		return { label: 'Zona de Pressão', color: 'text-accent-rose', badge: '▲' };
	return { label: 'Zona Normal', color: 'text-accent-emerald', badge: '●' };
}

export function getRpCellStyle(
	val: number,
	isDiag: boolean,
	isHighlighted: boolean,
) {
	if (isDiag) return { bg: 'bg-slate-900/20', color: 'text-transparent' };
	if (isHighlighted) return { bg: 'bg-indigo-500/35', color: 'text-white' };
	if (val >= 40) return { bg: 'bg-rose-500/25', color: 'text-accent-danger' };
	if (val >= 25) return { bg: 'bg-amber-500/20', color: 'text-accent-amber' };
	if (val >= 15) return { bg: 'bg-rose-600/15', color: 'text-accent-danger' };
	if (val > 0) return { bg: 'bg-emerald-500/10', color: 'text-accent-emerald' };
	return { bg: 'bg-slate-900/30', color: 'text-text-dim' };
}

// SOTA v4.2: Helpers para NashPanel
export function formatDelta(delta: number): string {
	const v = delta.toFixed(0);
	return delta >= 0 ? `+${v}` : `${v}`;
}

export function getDeltaColor(delta: number): string {
	if (delta > 1) return 'var(--accent-emerald)';
	if (delta < -1) return 'var(--accent-danger)';
	return 'var(--text-darker)';
}

// SOTA v4.2: Helpers para PayoutsPanel
export function getPlaceColor(place: number): string {
	if (place === 1)
		return 'text-accent-amber drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]';
	if (place === 2) return 'text-slate-300';
	if (place === 3)
		return 'text-accent-gold drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]';
	return 'text-text-muted';
}

// SOTA v4.2: Helpers heurísticos para RangeMatrix
export function getHandStatus(
	row: number,
	col: number,
	hand: string,
	activeRp: number,
	overrides: Record<string, string>,
) {
	if (overrides[hand]) return overrides[hand];
	const isPair = row === col;
	const isSuited = col > row;
	const rankValue = 14 - row + (14 - col);
	const threshold = 15 + activeRp * 0.25;
	if (rankValue >= threshold + 5) return 'core';
	if (rankValue >= threshold) return 'marginal';
	if (rankValue >= threshold - 3 && (isSuited || isPair)) return 'bluff';
	if (activeRp >= 40 && rankValue < threshold + 2) return 'death';
	return 'fold';
}

export function getStatusBgClass(status: string) {
	switch (status) {
		case 'core':
			return 'bg-accent-emerald text-slate-900 border border-emerald-400';
		case 'marginal':
			return 'bg-accent-amber text-slate-900 border border-amber-400';
		case 'bluff':
			return 'bg-accent-indigo-light text-slate-900 border border-indigo-400';
		case 'death':
			return 'bg-accent-danger text-white border border-rose-400';
		default:
			return 'bg-bg-deep text-text-dim border border-white/5 hover:border-white/20';
	}
}
