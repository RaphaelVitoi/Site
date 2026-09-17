import { useState, useCallback, useMemo } from 'react';
import {
	generateUniformBelief,
	updateBelief,
	calculateShannonEntropy,
	computePublicBeliefState,
	generateTextureAwareLikelihood,
	getTacticalStrategyExplanation,
	getSolverNodeData,
	type BeliefVector,
	type PublicBeliefState,
	type TacticalActionType,
	type BoardTexture,
	type SolverContext,
	type TacticalStrategyExplanation,
	type SolverNodeData,
} from '@/lib/bayesianRangeEngine';
import {
	CANONICAL_BOARD_PRESETS,
	type TablePosition,
	type BoardTextureId,
} from '@/components/simulator/ui/BayesianPokerTable';

export interface UseBayesianRangeOptions {
	initialBoard?: string[];
	initialPot?: number;
	initialHeroPosition?: TablePosition;
	initialVillainPosition?: TablePosition;
	initialAction?: TacticalActionType | null;
	initialBoardTexture?: BoardTextureId;
	initialSolverContext?: SolverContext;
}

const ACTION_POT_MAP: Record<TacticalActionType, number> = {
	cbet_small: 7.5,
	check_raise: 18.0,
	barrel_heavy: 28.5,
	bluff_polar: 65.0,
	call_condensed: 42.0,
};

const AULA1_2_POT_MAP: Record<TacticalActionType, number> = {
	cbet_small: 6.76, // 5.63bb pot + 1.13bb (20% bet)
	check_raise: 11.3, // 6.76bb + 4.54bb (XR)
	barrel_heavy: 27.06, // Turn barrel 50% (7.88bb)
	bluff_polar: 76.0, // River All-in Shove
	call_condensed: 76.0, // River Call vs Shove
};

const ACTION_STREET_MAP: Record<TacticalActionType, number> = {
	cbet_small: 0,
	check_raise: 0,
	barrel_heavy: 1,
	bluff_polar: 2,
	call_condensed: 2,
};

export function useBayesianRange(options?: UseBayesianRangeOptions) {
	const initialTexture = options?.initialBoardTexture ?? 'aula1_2';
	const [boardTexture, setBoardTextureState] = useState<BoardTextureId>(initialTexture);
	const [solverContext, setSolverContext] = useState<SolverContext>(
		options?.initialSolverContext ?? 'icm',
	);
	const [board, setBoard] = useState<string[]>(
		options?.initialBoard ?? CANONICAL_BOARD_PRESETS[initialTexture].cards,
	);
	const [activeAction, setActiveAction] = useState<TacticalActionType | null>(
		options?.initialAction !== undefined ? options.initialAction : 'cbet_small',
	);
	const [actionHistory, setActionHistory] = useState<(TacticalActionType | null)[]>([
		options?.initialAction !== undefined ? options.initialAction : 'cbet_small',
	]);

	const [heroPosition, setHeroPosition] = useState<TablePosition>(options?.initialHeroPosition ?? 'BTN');
	const [villainPosition, setVillainPosition] = useState<TablePosition>(options?.initialVillainPosition ?? 'BB');

	// Base uniforme (1326 combos)
	const [baseBelief] = useState<BeliefVector>(generateUniformBelief());
	const [heroBelief] = useState<BeliefVector>(generateUniformBelief());

	const setBoardTexture = useCallback((texture: BoardTextureId) => {
		setBoardTextureState(texture);
		setBoard(CANONICAL_BOARD_PRESETS[texture]?.cards ?? CANONICAL_BOARD_PRESETS.aula1_2.cards);
	}, []);

	// SOTA: Cálculo determinístico e reativo do posterior baseado na ação ativa, textura do bordo e solverContext
	const currentBelief = useMemo<BeliefVector>(() => {
		if (!activeAction) {
			return baseBelief;
		}
		const likelihood = generateTextureAwareLikelihood(
			boardTexture as BoardTexture,
			activeAction,
			solverContext,
		);
		return updateBelief(baseBelief, likelihood);
	}, [activeAction, boardTexture, baseBelief, solverContext]);

	const maxBelief = useMemo(() => {
		return Math.max(...Object.values(currentBelief));
	}, [currentBelief]);

	const currentEntropy = useMemo(() => {
		return calculateShannonEntropy(currentBelief);
	}, [currentBelief]);

	const pot = useMemo(() => {
		if (options?.initialPot && !activeAction) return options.initialPot;
		if (boardTexture === 'aula1_2') {
			if (!activeAction) return 5.63;
			return AULA1_2_POT_MAP[activeAction] ?? 5.63;
		}
		if (!activeAction) return 5.5;
		return ACTION_POT_MAP[activeAction] ?? 15.0;
	}, [activeAction, boardTexture, options?.initialPot]);

	const streetStep = useMemo(() => {
		if (!activeAction) return 0;
		return ACTION_STREET_MAP[activeAction] ?? 0;
	}, [activeAction]);

	const solverNodeData = useMemo<SolverNodeData>(() => {
		const action = activeAction ?? 'cbet_small';
		return getSolverNodeData(boardTexture as BoardTexture, action, solverContext);
	}, [boardTexture, activeAction, solverContext]);

	const publicBeliefState = useMemo<PublicBeliefState>(() => {
		const basePbs = computePublicBeliefState(board, pot, heroBelief, currentBelief);
		return {
			...basePbs,
			combosLeft: solverNodeData.activeCombosCount,
		};
	}, [board, pot, heroBelief, currentBelief, solverNodeData.activeCombosCount]);

	const selectTacticalAction = useCallback((action: TacticalActionType) => {
		setActiveAction(action);
		setActionHistory((prev) => [...prev, action]);
	}, []);

	const applyTacticalAction = useCallback(
		(actionType: TacticalActionType) => {
			selectTacticalAction(actionType);
		},
		[selectTacticalAction],
	);

	const undoAction = useCallback(() => {
		setActionHistory((prev) => {
			if (prev.length <= 1) {
				setActiveAction(null);
				return [null];
			}
			const next = prev.slice(0, -1);
			const last = next.at(-1) ?? null;
			setActiveAction(last);
			return next;
		});
	}, []);

	const resetBelief = useCallback(() => {
		setActiveAction(null);
		setActionHistory([null]);
	}, []);

	const tacticalExplanation = useMemo<TacticalStrategyExplanation>(() => {
		const action = activeAction ?? 'cbet_small';
		return getTacticalStrategyExplanation(
			boardTexture as BoardTexture,
			action,
			solverContext,
		);
	}, [boardTexture, activeAction, solverContext]);

	return {
		currentBelief,
		maxBelief,
		currentEntropy,
		publicBeliefState,
		board,
		pot,
		boardTexture,
		solverContext,
		activeAction,
		actionHistory,
		streetStep,
		heroPosition,
		villainPosition,
		tacticalExplanation,
		solverNodeData,
		setSolverContext,
		setHeroPosition,
		setVillainPosition,
		setBoard,
		setBoardTexture,
		selectTacticalAction,
		applyTacticalAction,
		undoAction,
		resetBelief,
	};
}



