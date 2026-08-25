'use client';

import { useMemo } from 'react';
import type { Scenario, HeroPosition, QuantumMetrics } from '../solver/types';
import { calculateActionMetrics, calculateBaseFgsErosion, createSpotData } from '../solver/utils';
import type { PerspectivaResult } from '@/lib/perspectiva';
import type {
	NashDistortionResults,
	InsolvencyPayload,
	DistortionPayload,
} from './useQuantumEngine';

interface UseMasterSpotLogicParams {
	scenario: Scenario;
	heroPosition: HeroPosition;
	safeHeroInvested: number;
	safeCurrentPot: number;
	safeActivePlayers: number;
	anteSize: number;
	blindsRisingSoon: boolean;
	effectiveIpRp: number;
	effectiveOopRp: number;
	quantumPerspectiva: PerspectivaResult | null;
	apiQuantumMetrics: QuantumMetrics | null;
	nativeRangeMetric: { equity: number; isCalculating: boolean };
	isCalculatingInsolvency: boolean;
	dispatchInsolvencyMatrix: (payload: InsolvencyPayload) => void;
	dispatchIcmDistortion: (payload: DistortionPayload) => void;
	nashResults: NashDistortionResults | null;
	bayesianWinProb: number | null;
	predictiveProfile: Record<string, number> | null;
	predictiveTelemetry: Array<{
		evLoss: number;
		isCorrect: boolean;
		createdAt: string | Date;
	}> | null;
	setNativeRangeMetric: (val: { equity: number; isCalculating: boolean }) => void;
	pkoValue: number;
	aggFactor: number;
}

/**
 * IDENTITY: Hook de Lógica de Spot (SOTA v7.0 GOLD)
 * PATH: src/components/simulator/hooks/useMasterSpotLogic.ts
 * ROLE: Processa topologia, custos afundados e gera contextos para UI.
 */
export function useMasterSpotLogic({
	scenario,
	heroPosition,
	safeHeroInvested,
	safeCurrentPot,
	safeActivePlayers,
	anteSize,
	blindsRisingSoon,
	effectiveIpRp,
	effectiveOopRp,
	quantumPerspectiva,
	apiQuantumMetrics,
	nativeRangeMetric,
	isCalculatingInsolvency,
	dispatchInsolvencyMatrix,
	dispatchIcmDistortion,
	nashResults,
	bayesianWinProb,
	predictiveProfile,
	predictiveTelemetry,
	setNativeRangeMetric,
	pkoValue,
	aggFactor,
}: UseMasterSpotLogicParams) {
	const isBaseline =
		scenario.category === 'baseline' || !scenario.prizes || scenario.prizes.length <= 1;

	const isIp = heroPosition === 'IP';
	const finalIpRp = isBaseline ? 0 : effectiveIpRp;
	const finalOopRp = isBaseline ? 0 : effectiveOopRp;

	const rpForDash = isIp ? finalIpRp : finalOopRp;
	const bfForDash = rpForDash >= 100 ? 999 : 1 / (1 - rpForDash / 100);

	const heroRawStack = scenario.stacks?.[isIp ? 0 : 1] ?? 40;
	const villainRawStack = scenario.stacks?.[isIp ? 1 : 0] ?? 55;
	const villainInvested = Math.max(0, safeCurrentPot - safeHeroInvested);
	const heroUpdatedStack = Math.max(0, heroRawStack - safeHeroInvested);
	const villainUpdatedStack = Math.max(0, villainRawStack - villainInvested);

	const heroIdx = useMemo(() => {
		const posMap: ReadonlyMap<string, { max: number; off: number }> = new Map([
			['BB', { max: 8, off: 1 }],
			['SB', { max: 7, off: 2 }],
			['IP', { max: 6, off: 3 }],
			['OOP', { max: 0, off: 1 }],
		]);
		const conf = posMap.get(heroPosition) ?? { max: 0, off: 1 };
		return Math.min(conf.max, (scenario.stacks?.length ?? 9) - conf.off);
	}, [heroPosition, scenario.stacks]);

	const primaryVillainIdx = useMemo(() => {
		const numVillains = Math.max(1, safeActivePlayers - 1);
		const valid = Array.from({ length: scenario.stacks?.length ?? 9 }, (_, i) => i).filter((i) => i !== heroIdx);
		if (valid.length >= numVillains) return valid.slice(0, numVillains)[0] ?? 0;
		return valid.length > 0 ? (valid[0] ?? 0) : Math.max(0, (scenario.stacks?.length ?? 9) - 3);
	}, [safeActivePlayers, scenario.stacks, heroIdx]);

	const baseFgsErosion = useMemo(
		() => calculateBaseFgsErosion(quantumPerspectiva, blindsRisingSoon, anteSize, heroPosition),
		[quantumPerspectiva, blindsRisingSoon, anteSize, heroPosition],
	);

	const spotData = useMemo(
		() =>
			createSpotData({
				heroUpdatedStack,
				villainUpdatedStack,
				isIp,
				currentPot: safeCurrentPot,
				bfForDash,
				rpForDash,
				quantumPerspectiva,
				isBaseline,
				baseFgsErosion,
				apiQuantumMetrics,
				street: 'PRE',
				board: '',
				heroRange: 'Any Two',
				villainRange: 'Any Two',
			}),
		[
			heroUpdatedStack,
			villainUpdatedStack,
			isIp,
			safeCurrentPot,
			bfForDash,
			rpForDash,
			quantumPerspectiva,
			isBaseline,
			baseFgsErosion,
			apiQuantumMetrics,
		],
	);

	const actionMetrics = useMemo(() => {
		return calculateActionMetrics({
			heroInvested: safeHeroInvested,
			currentPot: safeCurrentPot,
			bfForDash,
			rpForDash,
			quantumPerspectiva,
			heroRawStack,
			heroPosition,
			baseFgsErosion,
			apiQuantumMetrics,
			activePlayers: safeActivePlayers,
		});
	}, [
		safeHeroInvested,
		safeCurrentPot,
		bfForDash,
		rpForDash,
		quantumPerspectiva,
		heroRawStack,
		heroPosition,
		baseFgsErosion,
		apiQuantumMetrics,
		safeActivePlayers,
	]);

	const spotContextValue = useMemo(() => {
		const pot = spotData.pot;
		const sunkCost = Math.abs(actionMetrics.fold.chipEv);
		const potOddsPct = pot + sunkCost > 0 ? (sunkCost / (pot + sunkCost)) * 100 : 33;
		return {
			spotData: {
				id: scenario.id,
				name: scenario.name,
				pot: spotData.pot,
				street: spotData.street,
				board: spotData.board,
				heroRange: spotData.heroRange,
				villainRange: spotData.villainRange,
			},
			actionMetrics,
			effectiveIpRp: finalIpRp,
			effectiveOopRp: finalOopRp,
			potOddsPct,
			activePlayers: safeActivePlayers,
			heroInvested: safeHeroInvested,
			heroStack: heroRawStack,
			villainStack: villainRawStack,
			initialStacks: scenario.stacks,
			initialPrizes: scenario.prizes,
			heroIdx,
			primaryVillainIdx,
			heroPosition,
			blindsRisingSoon,
			pkoValue,
			aggFactor,
		};
	}, [
		spotData,
		actionMetrics,
		finalIpRp,
		finalOopRp,
		safeActivePlayers,
		safeHeroInvested,
		scenario.id,
		scenario.name,
		heroRawStack,
		villainRawStack,
		scenario.stacks,
		scenario.prizes,
		heroIdx,
		primaryVillainIdx,
		heroPosition,
		blindsRisingSoon,
		pkoValue,
		aggFactor,
	]);

	const metricsContextValue = useMemo(
		() => ({
			quantumPerspectiva,
			apiQuantumMetrics: apiQuantumMetrics
				? {
						rioMw: apiQuantumMetrics.rioMw,
						adjustedEvFold: apiQuantumMetrics.adjustedEvFold,
						esperanca: apiQuantumMetrics.esperanca,
						expectativa: apiQuantumMetrics.expectativa,
						perspectiva: apiQuantumMetrics.perspectiva,
						threshEq: apiQuantumMetrics.threshEq,
						ci: apiQuantumMetrics.ci,
						riskAdvantage: apiQuantumMetrics.riskAdvantage,
						bountyPower: apiQuantumMetrics.bountyPower ?? quantumPerspectiva?.bountyPower ?? 0,
						marginInstability: apiQuantumMetrics.marginInstability,
						isSolvent: apiQuantumMetrics.isSolvent,
						isActionable: apiQuantumMetrics.isActionable,
						bayesianWinProb: bayesianWinProb ?? undefined,
					}
				: null,
			predictiveProfile,
			predictiveTelemetry,
		}),
		[
			quantumPerspectiva,
			apiQuantumMetrics,
			predictiveProfile,
			predictiveTelemetry,
			bayesianWinProb,
		],
	);

	const setManualEquity = (val: number) => {
		setNativeRangeMetric({ equity: val, isCalculating: false });
	};

	const wasmContextValue = useMemo(
		() => ({
			nativeRangeMetric,
			insolvencyMatrixData: null,
			isCalculatingInsolvency,
			dispatchInsolvencyMatrix,
			dispatchIcmDistortion,
			nashResults,
			setManualEquity,
		}),
		[
			nativeRangeMetric,
			isCalculatingInsolvency,
			dispatchInsolvencyMatrix,
			dispatchIcmDistortion,
			nashResults,
		],
	);

	return {
		isIp,
		isBaseline,
		finalIpRp,
		finalOopRp,
		heroUpdatedStack,
		villainUpdatedStack,
		spotContextValue,
		metricsContextValue,
		wasmContextValue,
		actionMetrics,
	};
}
