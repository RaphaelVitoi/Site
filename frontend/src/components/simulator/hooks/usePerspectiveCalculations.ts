'use client';

import { useMemo } from 'react';
import { calculatePerspectivaVitoi } from '@/lib/perspectiva';

interface PerspectiveCalculationsParams {
	stacks: number[];
	prizes: number[];
	potSize: number;
	heroCost: number;
	winProb: number;
	realization: number;
	edgeBase: number;
	bountyValue: number;
	kappa: number;
	numPlayers: number;
	isNearPayjump: boolean;
	blindsRising: boolean;
	humanNoiseFactor?: number;
	referenceStatus?: 'baseline' | 'tilt' | 'protecting' | 'bubble';
}

export function usePerspectiveCalculations({
	stacks,
	prizes,
	potSize,
	heroCost,
	winProb,
	realization,
	edgeBase,
	bountyValue,
	kappa,
	numPlayers,
	isNearPayjump,
	blindsRising,
	humanNoiseFactor = 0,
	referenceStatus,
}: PerspectiveCalculationsParams) {
	const result = useMemo(() => {
		return calculatePerspectivaVitoi({
			stacks,
			prizes,
			heroIdx: 0,
			villainIdx: 1,
			potSize,
			heroCost,
			winProb,
			realizationFactor: realization,
			edgeBase,
			bountyValue,
			kappa,
			numPlayersInPot: numPlayers,
			isNearPayjump,
			blindsRisingSoon: blindsRising,
			humanNoiseFactor,
			referenceStatus,
		});
	}, [
		stacks,
		prizes,
		potSize,
		heroCost,
		winProb,
		realization,
		edgeBase,
		bountyValue,
		kappa,
		numPlayers,
		isNearPayjump,
		blindsRising,
		humanNoiseFactor,
		referenceStatus,
	]);

	const chartData = useMemo(() => {
		const points = [];
		for (let p = 0; p <= 100; p += 5) {
			const pDecimal = p / 100;
			const r = calculatePerspectivaVitoi({
				stacks,
				prizes,
				heroIdx: 0,
				villainIdx: 1,
				potSize,
				heroCost,
				winProb: pDecimal,
				realizationFactor: realization,
				edgeBase,
				bountyValue,
				kappa,
				numPlayersInPot: numPlayers,
				isNearPayjump,
				blindsRisingSoon: blindsRising,
				humanNoiseFactor,
				referenceStatus,
			});
			points.push({ name: `${p}%`, prob: p, 'PM Quantum': r.perspectivaPct });
		}
		return points;
	}, [
		stacks,
		prizes,
		potSize,
		heroCost,
		realization,
		edgeBase,
		bountyValue,
		kappa,
		numPlayers,
		isNearPayjump,
		blindsRising,
		humanNoiseFactor,
		referenceStatus,
	]);

	return { result, chartData };
}
