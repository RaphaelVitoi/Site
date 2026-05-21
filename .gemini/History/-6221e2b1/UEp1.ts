/**
 * IDENTITY: Hook do Motor Nash
 * PATH: src/components/simulator/hooks/useNashSolver.ts
 * ROLE: Encapsular o cálculo Nash em useMemo para eficiência reativa.
 * BINDING: [engine/nashSolver.ts, engine/types.ts]
 */

import { useMemo } from 'react';
import { solveNash } from '../engine/nashSolver';
import type { NashResult } from '../engine/types';
import { icmSolver } from '../../../lib/NashSolver';

/**
 * Calcula o equilíbrio Nash ajustado por ICM de forma memoizada.
 * Recalcula apenas quando os inputs mudam.
 *
 * @param ipRp - Risk Premium do Agressor (IP)
 * @param oopRp - Risk Premium do Defensor (OOP)
 * @param aggressionFactor - Fator de agressividade (padrão 1.0)
 */
export function useNashSolver(
  ipRp: number,
  oopRp: number,
  aggressionFactor: number = 1.0
): NashResult {
  return useMemo(
    () => solveNash(ipRp, oopRp, aggressionFactor),
    [ipRp, oopRp, aggressionFactor]
  );
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
