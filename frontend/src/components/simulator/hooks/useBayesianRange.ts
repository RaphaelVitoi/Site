import { useState, useCallback, useMemo } from 'react';
import {
	generateUniformBelief,
	updateBelief,
	calculateShannonEntropy,
	computePublicBeliefState,
	generateTextureAwareLikelihood,
	type BeliefVector,
	type ActionLikelihood,
	type PublicBeliefState,
	type TacticalActionType,
} from '@/lib/bayesianRangeEngine';

export interface UseBayesianRangeOptions {
	initialBoard?: string[];
	initialPot?: number;
}

export function useBayesianRange(options?: UseBayesianRangeOptions) {
	const [history, setHistory] = useState<BeliefVector[]>([]);
	const [board, setBoard] = useState<string[]>(options?.initialBoard ?? ['Ah', 'Kd', '2c']);
	const [pot, setPot] = useState<number>(options?.initialPot ?? 15.0);
	const [boardTexture, setBoardTexture] = useState<'dry' | 'wet' | 'paired' | 'monotone'>('dry');

	// SOTA: O Prior base assume distribuição uniforme para o laboratório inicial
	const [baseBelief] = useState<BeliefVector>(generateUniformBelief());
	const [heroBelief] = useState<BeliefVector>(generateUniformBelief());

	const currentBelief = history.at(-1) ?? baseBelief;

	const maxBelief = useMemo(() => {
		return Math.max(...Object.values(currentBelief));
	}, [currentBelief]);

	const currentEntropy = useMemo(() => {
		return calculateShannonEntropy(currentBelief);
	}, [currentBelief]);

	const publicBeliefState = useMemo<PublicBeliefState>(() => {
		return computePublicBeliefState(board, pot, heroBelief, currentBelief);
	}, [board, pot, heroBelief, currentBelief]);

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

	const applyTacticalAction = useCallback(
		(actionType: TacticalActionType) => {
			const likelihood = generateTextureAwareLikelihood(boardTexture, actionType);
			applyAction(likelihood);
		},
		[boardTexture, applyAction],
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
		currentEntropy,
		publicBeliefState,
		board,
		pot,
		boardTexture,
		history,
		setBoard,
		setPot,
		setBoardTexture,
		applyAction,
		applyTacticalAction,
		undoAction,
		resetBelief,
	};
}

