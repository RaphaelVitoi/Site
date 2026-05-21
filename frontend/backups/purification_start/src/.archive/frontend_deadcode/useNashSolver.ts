/**
 * IDENTITY: Hook de Distorcao ICM
 * PATH: src/components/simulator/hooks/useNashSolver.ts
 * ROLE: Wrapper memoizado em torno de solveIcmDistortion.
 *       Retorna IcmDistortionResult.
 */
import { useMemo } from 'react';
import { solveIcmDistortion } from '../engine/nashSolver';
import type { IcmDistortionResult, ChipEvFreqs } from '../engine/types';

export function useNashSolver(
  ipRp: number,
  oopRp: number,
  chipEvFreqs: ChipEvFreqs,
  aggressionFactor = 1,
): IcmDistortionResult {
  return useMemo(
    () => solveIcmDistortion(ipRp, oopRp, chipEvFreqs, aggressionFactor),
    [ipRp, oopRp, chipEvFreqs, aggressionFactor],
  );
}
