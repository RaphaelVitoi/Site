'use client';

import { useMemo } from 'react';
import { PrizesSchema, StacksSchema } from '@/lib/schemas';
import type { Scenario, IcmDistortionResult } from '@/components/simulator/solver/types';
import { solveIcmDistortion } from '@/components/simulator/solver/nashSolver';

interface RadarCalculationsParams {
	scenarios: Scenario[];
	currentId: string;
	compareId: string;
	nashFlop: IcmDistortionResult | undefined;
}

export interface TopologicalMetrics {
	rpIp: number;
	rpOop: number;
	asymmetry: number;
	bluff: number;
	defense: number;
	sprDecay: number;
	tensionIndex: number;
	firstRp: number;
	lastRp: number;
	ipPos: string;
	oopPos: string;
	verdict: string;
	category: string;
	narrativeTitle: string;
	narrativeSubtitle: string;
	exploitDirectives: string[];
}

function buildTopologicalData(scenario: Scenario, nash?: IcmDistortionResult): TopologicalMetrics {
	const firstSpr = scenario.sprData[0];
	const lastSpr = scenario.sprData.at(-1);
	const resolvedNash =
		nash ??
		solveIcmDistortion(scenario.ipRp, scenario.oopRp, scenario.defaultStreetFreqs.flop, 1);
	const bluff = Math.min(100, Math.max(0, resolvedNash.ip.bet_small.center + resolvedNash.ip.bet_large.center));
	const defense = Math.min(100, Math.max(0, resolvedNash.oop.call.center));
	const isBaseline = scenario.category === 'toyGame' || scenario.prizes.length <= 1;

	const rpIp = isBaseline ? 0 : scenario.ipRp;
	const rpOop = isBaseline ? 0 : scenario.oopRp;
	const asymmetry = Math.abs(rpIp - rpOop);
	const sprDecay = firstSpr
		? Math.min(100, Math.max(0, ((firstSpr.rpValue - (lastSpr?.rpValue ?? 0)) / Math.max(1, firstSpr.rpValue)) * 100))
		: 0;

	// Índice de Tensão Topológica Theta = sqrt(rpIp^2 + rpOop^2) * (1 + asymmetry/100) normalizado para escala 0-100
	const rawTension = Math.sqrt(rpIp * rpIp + rpOop * rpOop) * (1 + asymmetry / 100);
	const tensionIndex = Math.min(100, Math.max(0, rawTension * 1.8));

	return {
		rpIp,
		rpOop,
		asymmetry,
		bluff,
		defense,
		sprDecay,
		tensionIndex,
		firstRp: firstSpr?.rpValue ?? 0,
		lastRp: lastSpr?.rpValue ?? 0,
		ipPos: scenario.ipPos ?? 'IP',
		oopPos: scenario.oopPos ?? 'OOP',
		verdict: scenario.verdict ?? 'Equilíbrio',
		category: scenario.category,
		narrativeTitle: scenario.narrativeTitle ?? scenario.name,
		narrativeSubtitle: scenario.narrativeSubtitle ?? '',
		exploitDirectives: scenario.exploit ?? [],
	};
}

export function useRadarCalculations({
	scenarios,
	currentId,
	compareId,
	nashFlop,
}: RadarCalculationsParams) {
	const currentScenario = useMemo(
		() => scenarios.find((s) => s.id === currentId),
		[scenarios, currentId],
	);

	const compareScenario = useMemo(() => {
		const s = scenarios.find((sc) => sc.id === compareId);
		if (!s) return null;
		const validStacks = StacksSchema.safeParse(s.stacks);
		const validPrizes = PrizesSchema.safeParse(s.prizes);
		return validStacks.success && validPrizes.success ? s : null;
	}, [scenarios, compareId]);

	const metricsA = useMemo(
		() => (currentScenario ? buildTopologicalData(currentScenario, nashFlop) : null),
		[currentScenario, nashFlop],
	);

	const metricsB = useMemo(
		() => (compareScenario ? buildTopologicalData(compareScenario) : null),
		[compareScenario],
	);

	const radarData = useMemo(() => {
		if (!metricsA) return [];
		const b = metricsB;

		return [
			{ axis: 'RP IP', A: Number(metricsA.rpIp.toFixed(1)), B: b ? Number(b.rpIp.toFixed(1)) : 0, fullMark: 100 },
			{ axis: 'RP OOP', A: Number(metricsA.rpOop.toFixed(1)), B: b ? Number(b.rpOop.toFixed(1)) : 0, fullMark: 100 },
			{ axis: 'Assimetria ΔRP', A: Number(metricsA.asymmetry.toFixed(1)), B: b ? Number(b.asymmetry.toFixed(1)) : 0, fullMark: 100 },
			{ axis: 'Bluff Ótimo%', A: Number(metricsA.bluff.toFixed(1)), B: b ? Number(b.bluff.toFixed(1)) : 0, fullMark: 100 },
			{ axis: 'MDF Defesa%', A: Number(metricsA.defense.toFixed(1)), B: b ? Number(b.defense.toFixed(1)) : 0, fullMark: 100 },
			{ axis: 'SPR Decay%', A: Number(metricsA.sprDecay.toFixed(1)), B: b ? Number(b.sprDecay.toFixed(1)) : 0, fullMark: 100 },
			{ axis: 'Tensão Topológica', A: Number(metricsA.tensionIndex.toFixed(1)), B: b ? Number(b.tensionIndex.toFixed(1)) : 0, fullMark: 100 },
		];
	}, [metricsA, metricsB]);

	const deltaMetrics = useMemo(() => {
		if (!metricsA || !metricsB) return null;
		return {
			deltaIpRp: metricsB.rpIp - metricsA.rpIp,
			deltaOopRp: metricsB.rpOop - metricsA.rpOop,
			deltaAsymmetry: metricsB.asymmetry - metricsA.asymmetry,
			deltaBluff: metricsB.bluff - metricsA.bluff,
			deltaDefense: metricsB.defense - metricsA.defense,
			deltaSprDecay: metricsB.sprDecay - metricsA.sprDecay,
			deltaTension: metricsB.tensionIndex - metricsA.tensionIndex,
		};
	}, [metricsA, metricsB]);

	return { currentScenario, compareScenario, radarData, metricsA, metricsB, deltaMetrics };
}

