'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
	calculatePerspectivaVitoi,
	type PerspectivaInput,
	type PerspectivaResult,
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
	pkoValue: number;
	kappa: number;
	simulatedActivePlayers: number;
	absoluteHeroPos: HeroPosition;
	blindsRisingSoon: boolean;
	activeNodelock: NodelockConstraint | null;
	betSizing: number;
	aggFactor?: number; // SOTA v6.2.1 Harmony
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
	pkoValue,
	kappa,
	simulatedActivePlayers,
	absoluteHeroPos,
	blindsRisingSoon,
	activeNodelock,
	betSizing,
	aggFactor = 1, // SOTA v6.2.1 Harmony
}: PmLensCalculationsParams) {
	const [asyncResults, setAsyncResults] = useState<Record<string, PerspectivaResult | null>>({});

	const streetProgression = useMemo(() => {
		const basePot = Math.max(2.5, currentPot);
		const normalizedSizing = Math.max(0.2, betSizing);
		const firstBet = basePot * normalizedSizing;

		if (activeNodelock?.type === 'block_bet') {
			const flopPot = basePot * 3;
			const flopCumulative = Math.abs(heroInvested) + firstBet;

			const b20BetTurn = flopPot * activeNodelock.sizePct;
			const turnPot = flopPot + b20BetTurn * 2;
			const turnCumulative = flopCumulative + b20BetTurn;

			const b20BetRiver = turnPot * activeNodelock.sizePct;
			const riverPot = turnPot + b20BetRiver * 2;
			const riverCumulative = turnCumulative + b20BetRiver;

			return [
				{ name: 'PRE', potSize: basePot, cumulative: Math.abs(heroInvested) },
				{ name: 'FLOP', potSize: flopPot, cumulative: flopCumulative },
				{ name: 'TURN', potSize: turnPot, cumulative: turnCumulative },
				{ name: 'RIVER', potSize: riverPot, cumulative: riverCumulative },
			];
		}

		return [
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
	}, [heroInvested, currentPot, activeNodelock, betSizing]);

	const handleIcmResult = useCallback((streetName: string, res: PerspectivaResult | null) => {
		setAsyncResults((prev) => ({ ...prev, [streetName]: res }));
	}, []);

	useEffect(() => {
		for (const street of streetProgression) {
			let finalRealization = realizationFactor;
			if (activeNodelock?.type === 'block_bet') {
				finalRealization += 0.15;
			}

			const streetIdx = streetProgression.findIndex((s) => s.name === street.name);
			const sunkCost =
				streetIdx > 0
					? (streetProgression[streetIdx - 1]?.cumulative ?? 0)
					: Math.abs(heroInvested);

			const input: PerspectivaInput = {
				stacks: initialStacks,
				prizes: initialPrizes,
				heroIdx,
				villainIdx: primaryVillainIdx,
				potSize: street.potSize,
				heroCost: street.cumulative,
				winProb: equity / 100,
				realizationFactor: finalRealization,
				edgeBase: 1 + deltaHabilidade / 100,
				bountyValue: pkoValue * 100,
				kappa,
				numPlayersInPot: simulatedActivePlayers,
				heroPosition: absoluteHeroPos,
				blindsRisingSoon,
				investidoAcumulado: sunkCost,
				humanNoiseFactor: aggFactor, // SOTA v6.2.1 Harmony: Damping fisico
			};

			let res = calculatePerspectivaVitoi(input);

			if (activeNodelock?.type === 'block_bet' && res) {
				const baseB20Ev = res.perspectivaPct ?? 0;
				const b20Effectiveness = baseB20Ev * Math.min(1, kappa + 0.3);
				res = { ...res, perspectivaPct: b20Effectiveness };
			}

			handleIcmResult(street.name, res);
		}
	}, [
		heroIdx,
		primaryVillainIdx,
		equity,
		pkoValue,
		kappa,
		simulatedActivePlayers,
		blindsRisingSoon,
		deltaHabilidade,
		streetProgression,
		initialStacks,
		initialPrizes,
		handleIcmResult,
		absoluteHeroPos,
		realizationFactor,
		activeNodelock,
		aggFactor,
	]);

	const streetMetrics = useMemo(() => {
		return streetProgression.map((street) => {
			const res = asyncResults[street.name];
			if (!res)
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
					loading: true,
				};
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
	}, [asyncResults, streetProgression]);

	return { streetMetrics };
}
