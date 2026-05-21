'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { performTourScrollAndHighlight } from '../engine/utils';
import type { Step as TourStep } from '../ui/SimulatorTour';

/**
 * IDENTITY: Hook de Orquestração do Tour (SOTA v4.6)
 * PATH: src/components/simulator/hooks/useSimulatorTour.ts
 * ROLE: Gerencia spotlights, timers e navegação do tour guiado.
 */
export function useSimulatorTour(handleScenarioSelect: (id: string) => void) {
	const [tourSpotlight, setTourSpotlight] = useState<DOMRect | null>(null);
	const tourTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const tourSpotlightProps = useMemo(() => {
		if (!tourSpotlight) return { style: {} };
		return {
			style: {
				top: tourSpotlight.top - 8,
				left: tourSpotlight.left - 8,
				width: tourSpotlight.width + 16,
				height: tourSpotlight.height + 16,
			},
		};
	}, [tourSpotlight]);

	const handleTourStep = useCallback(
		(step: TourStep) => {
			if (step.id === 's-0') handleScenarioSelect('tg-7');
			if (tourTimerRef.current) clearTimeout(tourTimerRef.current);
			tourTimerRef.current = performTourScrollAndHighlight(step, setTourSpotlight);
		},
		[handleScenarioSelect],
	);

	const closeTour = useCallback(() => {
		if (tourTimerRef.current) clearTimeout(tourTimerRef.current);
		setTourSpotlight(null);
		document
			.querySelectorAll('.pulse-border')
			.forEach((el) => el.classList.remove('pulse-border'));
	}, []);

	return {
		tourSpotlight,
		tourSpotlightProps,
		handleTourStep,
		closeTour,
	};
}
