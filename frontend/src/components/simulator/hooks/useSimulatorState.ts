'use client';

import { useState, useCallback } from 'react';
import type {
	StreetChipEvFreqs,
	Scenario,
	HeroPosition,
} from '@/components/simulator/engine/types';
import type { ActiveTool } from '../MasterSimulator';

export function useSimulatorState(initialScenario: Scenario) {
	const [pkoValue, setPkoValue] = useState(0);
	const [isNearPayjump, setIsNearPayjump] = useState(false);
	const [blindsRisingSoon, setBlindsRisingSoon] = useState(false);
	const [streetFreqs, setStreetFreqs] = useState<StreetChipEvFreqs>(
		initialScenario.defaultStreetFreqs,
	);
	const [activeTool, setActiveTool] = useState<ActiveTool>('scenario');
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [anteSize] = useState<number>(12.5);
	const [activePlayers, setActivePlayers] = useState<number>(2);
	const [isPredictive, setIsPredictive] = useState<boolean>(true);
	
	const [aggressionFactor, setAggressionFactor] = useState<number>(1);
	const [heroPosition, setHeroPosition] = useState<HeroPosition>('BB');
	const [heroInvested, setHeroInvested] = useState<number>(1);
	const [currentPot, setCurrentPot] = useState<number>(2.5);

	const resetState = useCallback((scenario: Scenario) => {
		setPkoValue(0);
		setIsNearPayjump(false);
		setBlindsRisingSoon(false);
		setStreetFreqs(scenario.defaultStreetFreqs);
		setActiveTool('scenario');
		setActivePlayers(2);
		setIsPredictive(true);
		setAggressionFactor(1);
		setHeroPosition('BB');
		setHeroInvested(1);
		setCurrentPot(2.5);
	}, []);

	return {
		pkoValue,
		setPkoValue,
		isNearPayjump,
		setIsNearPayjump,
		blindsRisingSoon,
		setBlindsRisingSoon,
		streetFreqs,
		setStreetFreqs,
		activeTool,
		setActiveTool,
		sidebarOpen,
		setSidebarOpen,
		anteSize,
		activePlayers,
		setActivePlayers,
		isPredictive,
		setIsPredictive,
		aggressionFactor,
		setAggressionFactor,
		heroPosition,
		setHeroPosition,
		heroInvested,
		setHeroInvested,
		currentPot,
		setCurrentPot,
		resetState,
	};
}
