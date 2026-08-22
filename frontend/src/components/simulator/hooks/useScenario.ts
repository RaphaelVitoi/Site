import { useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { SCENARIOS } from '../solver/scenarios';
import type { Scenario } from '../solver/types';

export function resolveScenarioId(
	requestedId: string | null | undefined,
	scenarios: readonly Scenario[] = SCENARIOS
): string {
	if (requestedId && scenarios.some((scenario) => scenario.id === requestedId)) {
		return requestedId;
	}
	return scenarios[0]?.id ?? '';
}

export function useScenario() {
	const searchParams = useSearchParams();
	const requestedScenarioId = searchParams.get('scenario');
	const [activeId, setActiveId] = useState(() => resolveScenarioId(requestedScenarioId));

	const scenario: Scenario = useMemo(() => {
		return SCENARIOS.find((s) => s.id === activeId) || SCENARIOS[0] || ({} as Scenario);
	}, [activeId]);

	const setScenario = useCallback((id: string) => {
		setActiveId(id);
	}, []);

	return {
		scenario,
		setScenario,
		scenarios: SCENARIOS,
	};
}
