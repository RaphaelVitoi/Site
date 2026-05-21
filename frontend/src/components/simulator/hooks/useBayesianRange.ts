/**
 * IDENTITY: Bayesian Range Hook
 * PATH: src/components/simulator/hooks/useBayesianRange.ts
 * ROLE: Orquestração de estado React para o motor de inferência bayesiana.
 */
import { useState, useCallback, useMemo } from 'react';
import {
	generateUniformBelief,
	updateBelief,
	type BeliefVector,
	type ActionLikelihood,
} from '@/lib/bayesianRangeEngine';

export function useBayesianRange() {
	const [history, setHistory] = useState<BeliefVector[]>([]);

	// SOTA: O Prior base assume distribuição uniforme para o laboratório inicial
	const [baseBelief] = useState<BeliefVector>(generateUniformBelief());

	const currentBelief = history.at(-1) ?? baseBelief;

	const maxBelief = useMemo(() => {
		return Math.max(...Object.values(currentBelief));
	}, [currentBelief]);

	const applyAction = useCallback(
		(likelihood: ActionLikelihood) => {
			setHistory((prev) => {
				const prior = prev.at(-1) ?? baseBelief;
				const posterior = updateBelief(prior, likelihood);
				return [...prev, posterior];
			});
		},
		[baseBelief],
	);

	const undoAction = useCallback(() => {
		setHistory((prev) => {
			if (prev.length === 0) return prev;
			return prev.slice(0, -1);
		});
	}, []);

	const resetBelief = useCallback(() => {
		setHistory([]);
	}, []);

	return {
		currentBelief,
		maxBelief,
		history,
		applyAction,
		undoAction,
		resetBelief,
	};
}
