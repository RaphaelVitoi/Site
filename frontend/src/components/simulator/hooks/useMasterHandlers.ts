'use client';

import { useCallback } from 'react';
import type { Scenario, HeroPosition } from '../engine/types';
import { generateHRCJson, downloadHRCJson } from '@/lib/hrcExport';

interface UseMasterHandlersParams {
	scenario: Scenario;
	scenarios: Scenario[];
	pkoValue: number;
	anteSize: number;
	setScenario: (id: string) => void;
	resetState: (scenario: Scenario) => void;
	setHeroPosition: (pos: HeroPosition) => void;
	setHeroInvested: (val: number) => void;
	startTransition: (scope: () => void) => void;
}

/**
 * IDENTITY: Hook de Handlers Mestre (SOTA v4.6)
 * PATH: src/components/simulator/hooks/useMasterHandlers.ts
 * ROLE: Orquestra eventos de interface, exportação e transições de estado.
 */
export function useMasterHandlers({
	scenario,
	scenarios,
	pkoValue,
	anteSize,
	setScenario,
	resetState,
	setHeroPosition,
	setHeroInvested,
	startTransition,
}: UseMasterHandlersParams) {
	const handleScenarioSelect = useCallback(
		(id: string) => {
			startTransition(() => {
				setScenario(id);
				const next = scenarios.find((s: Scenario) => s.id === id);
				if (next) resetState(next);
			});
		},
		[setScenario, scenarios, resetState, startTransition],
	);

	const handleExportHRC = useCallback(() => {
		if (!scenario?.stacks) return;
		const players = scenario.stacks.map((stack, i) => ({
			id: String(i + 1),
			name: `Jogador ${i + 1}`,
			stack,
		}));
		const prizes =
			scenario.prizes && scenario.prizes.length > 0
				? scenario.prizes
				: [237.34, 170.96, 135.17, 109.99, 90.28, 73.95, 59.92, 47.56, 36.47];
		const json = generateHRCJson(players, prizes, pkoValue);
		downloadHRCJson(json, `sota_${scenario.id}_${players.length}p.json`);
	}, [scenario, pkoValue]);

	const handleHeroPositionChange = useCallback(
		(e: React.ChangeEvent<HTMLSelectElement>) => {
			const pos = e.target.value as HeroPosition;
			setHeroPosition(pos);
			const anteBb = anteSize / 100;
			const posOffset: Record<string, number> = {
				BB: 1,
				SB: 0.5,
				IP: 0,
				OOP: 0,
			};
			setHeroInvested(anteBb + (posOffset[pos] ?? 0));
		},
		[anteSize, setHeroPosition, setHeroInvested],
	);

	return {
		handleScenarioSelect,
		handleExportHRC,
		handleHeroPositionChange,
	};
}
