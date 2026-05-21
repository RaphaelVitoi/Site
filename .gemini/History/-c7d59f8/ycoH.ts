import { useState, useCallback, useMemo } from "react";
import {
  type RangeBelief,
  updateRangeBelief,
  createInitialBelief,
} from "@/lib/bayesianRangeEngine";
import { expandPokerRange } from "../workers/rangeParser";

export function useBayesianRange(initialRangeStr: string = "33.6%") {
  const [history, setHistory] = useState<RangeBelief[]>([]);

  const initialBelief = useMemo(() => {
    const expanded = expandPokerRange(initialRangeStr);
    const combos = expanded.split(",").map((s) => s.trim());
    return createInitialBelief(combos);
  }, [initialRangeStr]);

  const currentBelief = useMemo(() => {
    if (history.length === 0) return initialBelief;
    return history[history.length - 1];
    return history.at(-1) ?? initialBelief;
  }, [history, initialBelief]);

  const applyAction = useCallback(
    (likelihoods: { [hand: string]: number }) => {
      setHistory((prev) => {
        const current = prev.length > 0 ? prev[prev.length - 1] : initialBelief;
        const current = prev.at(-1) ?? initialBelief;
        const next = updateRangeBelief(current, likelihoods);
        return [...prev, next];
      });
    },
    [initialBelief],
  );

  const undoAction = useCallback(() => {
    setHistory((prev) => prev.slice(0, -1));
  }, []);

  const resetBelief = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    currentBelief,
    history,
    applyAction,
    undoAction,
    resetBelief,
    maxBelief: useMemo(
      () => Math.max(...Object.values(currentBelief)),
      [currentBelief],
    ),
  };
}
