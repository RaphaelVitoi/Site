/**
 * PROTOCOLO VITOI - PERSPECTIVA MATEMATICA (CONTRATO ISOMORFICO SOTA v8.0 GOLD)
 * Localizacao Canonica: shared/types/pmev.ts
 *
 * Espelhamento dos contratos de engine/pmev_spec.py e engine/pmev_operators.py.
 * Garante interoperabilidade semantica entre Python, TypeScript e WASM.
 *
 * @format
 */

export type Unit = 'TournamentDollars' | 'Chips' | 'Probability' | 'Dimensionless';

export interface Bounds {
  readonly lower: number;
  readonly upper: number;
  readonly confidenceLevel: number; // Ex: 0.95, 0.99
}

export interface Provenance {
  readonly engineVersion: string;
  readonly solverId: string;
  readonly seed?: number;
  readonly iterations?: number;
  readonly nashDistanceEpsilon?: number;
}

export interface Measured<T> {
  readonly value: T;
  readonly unit: Unit;
  readonly isValid: boolean;
  readonly standardError: number;
  readonly confidenceInterval?: Bounds;
  readonly provenance?: Provenance;
}

export interface AbsorptionState {
  readonly place: number;
  readonly payout: number;
  readonly terminal: boolean;
}

export interface PMevCompositionResult {
  readonly decisionVector: readonly number[];
  readonly globalJacobian: readonly (readonly number[])[];
  readonly spectralRadius: number;
  readonly covarianceMatrix: readonly (readonly number[])[];
  readonly isContractive: boolean;
  readonly intermediateStates: {
    readonly f1_icm: readonly number[];
    readonly f2_temporal: readonly number[];
    readonly f3_behavioral: readonly number[];
    readonly f4_absorption: readonly number[];
  };
}

export interface RiverDefenseEvaluation {
  readonly pot: number;
  readonly bet: number;
  readonly deltaRpDef: number;
  readonly mdfLinear: number;
  readonly mdfPmev: number;
  readonly sprRatio: number;
  readonly isDecoupled: boolean;
  readonly defenseReductionPct: number;
}

export interface SPROptionalityEvaluation {
  readonly sEffBb: number;
  readonly omegaValue: number;
  readonly regime: string;
  readonly isStrictlyPositive: boolean;
  readonly monotonicityBroken: boolean;
}

export interface BICParsimonyEvaluation {
  readonly bicDynamic: number;
  readonly bicFull: number;
  readonly deltaBic: number;
  readonly logLikelihoodGain: number;
  readonly complexityPenalty: number;
  readonly isExpansionAdmissible: boolean;
}

/**
 * Validador de sanidade para Measured<T>.
 */
export function isMeasuredValid<T>(measured: Measured<T>): boolean {
  return (
    measured.isValid &&
    Number.isFinite(measured.standardError) &&
    measured.standardError >= 0
  );
}
