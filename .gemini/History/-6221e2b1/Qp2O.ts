import { useMemo } from 'react';
import { icmSolver } from '../../../lib/NashSolver';

export function useNashSolver(ipRp: number, oopRp: number, aggressionFactor: number = 1.0) {
  return useMemo(() => {
    const result = icmSolver.solve(ipRp, oopRp, aggressionFactor);

    // Adapta o output da nossa classe Singleton para o formato esperado pelo UI NashPanel
    return {
      bluffFreq: parseFloat(result.bluff.value),
      defenseFreq: parseFloat(result.defense.value),
      evDiffValue: parseFloat(result.evDiff.value),
      totalRequired: parseFloat(result.evDiff.totalRequired!),
      verdict: result.verdict,
      rawData: { ipRp, oopRp }
    };
  }, [ipRp, oopRp, aggressionFactor]);
}