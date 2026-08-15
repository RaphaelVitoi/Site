'use client';

import { useMemo } from 'react';
import {
	calculatePerspectivaVitoi,
	type PerspectivaInput,
} from '@/lib/perspectiva';
import type { NodelockConstraint, HeroPosition } from '@/components/simulator/engine/types';

interface PmLensCalculationsParams {
	initialStacks: number[];
	initialPrizes: number[];
	heroIdx: number;
	primaryVillainIdx: number;
	currentPot: number;
	heroInvested: number;
	equity: number;
	realizationFactor: number;
	deltaHabilidade: number;
	pkoValue?: number;
	kappa: number;
	simulatedActivePlayers: number;
	absoluteHeroPos: HeroPosition;
	blindsRisingSoon: boolean;
	activeNodelock: NodelockConstraint | null;
	betSizing: number;
	aggFactor?: number; // SOTA v7.0 GOLD Harmony
}

export function usePmLensCalculations({
	initialStacks,
	initialPrizes,
	heroIdx,
	primaryVillainIdx,
	currentPot,
	heroInvested,
	equity,
	realizationFactor,
	deltaHabilidade,
	pkoValue = 0,
	kappa,
	simulatedActivePlayers,
	absoluteHeroPos,
	blindsRisingSoon,
	activeNodelock,
	betSizing,
	aggFactor = 1, // SOTA v7.0 GOLD Harmony
}: PmLensCalculationsParams) {
	const streetMetrics = useMemo(() => {
		const basePot = Math.max(2.5, currentPot);
		const normalizedSizing = Math.max(0.2, betSizing);
		const firstBet = basePot * normalizedSizing;

		let streetProgression: Array<{ name: string; potSize: number; cumulative: number }>;

		if (activeNodelock?.type === 'block_bet') {
			const flopPot = basePot * 3;
			const flopCumulative = Math.abs(heroInvested) + firstBet;
			const b20BetTurn = flopPot * activeNodelock.sizePct;
			const turnPot = flopPot + b20BetTurn * 2;
			const turnCumulative = flopCumulative + b20BetTurn;
			const b20BetRiver = turnPot * activeNodelock.sizePct;
			const riverPot = turnPot + b20BetRiver * 2;
			const riverCumulative = turnCumulative + b20BetRiver;

			streetProgression = [
				{ name: 'PRE', potSize: basePot, cumulative: Math.abs(heroInvested) },
				{ name: 'FLOP', potSize: flopPot, cumulative: flopCumulative },
				{ name: 'TURN', potSize: turnPot, cumulative: turnCumulative },
				{ name: 'RIVER', potSize: riverPot, cumulative: riverCumulative },
			];
		} else {
			streetProgression = [
				{ name: 'PRE', potSize: basePot, cumulative: Math.abs(heroInvested) },
				{
					name: 'FLOP',
					potSize: basePot + firstBet * 2,
					cumulative: Math.abs(heroInvested) + firstBet,
				},
				{
					name: 'TURN',
					potSize: (basePot + firstBet * 2) * (1 + 2 * normalizedSizing),
					cumulative:
						Math.abs(heroInvested) + firstBet + (basePot + firstBet * 2) * normalizedSizing,
				},
				{
					name: 'RIVER',
					potSize:
						(basePot + firstBet * 2) *
						(1 + 2 * normalizedSizing) *
						(1 + 2 * normalizedSizing),
					cumulative:
						Math.abs(heroInvested) +
						firstBet +
						(basePot + firstBet * 2) * normalizedSizing +
						(basePot + firstBet * 2) * (1 + 2 * normalizedSizing) * normalizedSizing,
				},
			];
		}

		return streetProgression.map((street, streetIdx) => {
			let finalRealization = realizationFactor;
			if (activeNodelock?.type === 'block_bet') {
				finalRealization += 0.15;
			}

			const sunkCost =
				streetIdx > 0
					? (streetProgression[streetIdx - 1]?.cumulative ?? 0)
					: Math.abs(heroInvested);

			// SOTA v7.0 GOLD: Dinamização das Equidades pós-flop (Range Condensation)
			const isHeroIP = absoluteHeroPos === 'IP';
			const condensationDecay = isHeroIP ? 0.22 : 0.32;
			const baseWinProb = equity / 100;
			const dynamicWinProb =
				baseWinProb + (0.5 - baseWinProb) * (1 - Math.pow(1 - condensationDecay, streetIdx));

			const input: PerspectivaInput = {
				stacks: initialStacks,
				prizes: initialPrizes,
				heroIdx,
				villainIdx: primaryVillainIdx,
				potSize: street.potSize,
				heroCost: street.cumulative,
				winProb: dynamicWinProb,
				realizationFactor: finalRealization,
				edgeBase: 1 + deltaHabilidade / 100,
				bountyValue: pkoValue * 100,
				kappa,
				numPlayersInPot: simulatedActivePlayers,
				heroPosition: absoluteHeroPos,
				blindsRisingSoon,
				investidoAcumulado: sunkCost,
				humanNoiseFactor: Math.abs((aggFactor ?? 1) - 1),
			};

			let res = calculatePerspectivaVitoi(input);

			if (activeNodelock?.type === 'block_bet' && res) {
				const baseB20Ev = res.perspectivaPct ?? 0;
				const b20Effectiveness = baseB20Ev * Math.min(1, kappa + 0.3);
				res = { ...res, perspectivaPct: b20Effectiveness };
			}

			if (!res) {
				return {
					name: street.name,
					potSize: street.potSize,
					heroCost: street.cumulative,
					evFold: 0,
					fgsHealth: 1,
					rio: 0,
					ci: null,
					PM: 0,
					handEquity: 0,
					valuation: 1,
					realizationFactor: 1,
					threshEq: 0,
					loading: false,
				};
			}

			return {
				name: street.name,
				potSize: street.potSize,
				heroCost: street.cumulative,
				evFold: res.dynamicEvFold ?? 0,
				fgsHealth: res.fgsHealth ?? 1,
				rio: res.rioLiability ?? 0,
				ci: res.ci ?? null,
				PM: res.perspectivaPct ?? 0,
				handEquity: res.handEquity ?? 0,
				valuation: res.valuation ?? 1,
				realizationFactor: res.realizationFactor ?? 1,
				threshEq: res.threshEq ?? 0,
				loading: false,
			};
		});
	}, [
		currentPot,
		betSizing,
		activeNodelock,
		heroInvested,
		realizationFactor,
		absoluteHeroPos,
		equity,
		initialStacks,
		initialPrizes,
		heroIdx,
		primaryVillainIdx,
		deltaHabilidade,
		pkoValue,
		kappa,
		simulatedActivePlayers,
		blindsRisingSoon,
		aggFactor,
	]);

	return { streetMetrics };
}
