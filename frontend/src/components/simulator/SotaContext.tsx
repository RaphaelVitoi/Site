'use client';
import type { PerspectivaResult, PerspectivaInput } from '@/lib/perspectiva';
import { createContext } from 'react';

import type { HeroPosition } from './engine/types';

// Contexto Estático/Dados Base (Muda com as interações de spot)
export interface ActionMetric {
  chipEv: number;
  perspectiva: number;
  fgsImpact: number;
  tension: number;
}

export interface ISotaSpotContext {
  spotData: {
    id: string;
    name: string;
    pot: number;
    street: string;
    board: string;
    heroRange: string;
    villainRange: string;
  };
  actionMetrics: {
    fold: ActionMetric;
    call: ActionMetric;
    raise: ActionMetric;
  };
  effectiveIpRp: number;
  effectiveOopRp: number;
  potOddsPct: number;
  heroInvested?: number;
  activePlayers?: number;
  heroStack?: number;
  villainStack?: number;
  initialStacks?: number[];
  initialPrizes?: number[];
  heroIdx?: number;
  primaryVillainIdx?: number;
  heroPosition?: HeroPosition;
  blindsRisingSoon?: boolean;
  aggFactor?: number;
}

// Contexto de Métricas Calculadas (Muda conforme FGS e Perspectiva)
export interface ISotaMetricsContext {
  quantumPerspectiva: PerspectivaResult | null;
  apiQuantumMetrics?: {
    rioMw: number;
    adjustedEvFold: number;
    esperanca: number;
    expectativa: number;
    perspectiva: number;
    threshEq: number | null;
    ci: number | null;
    riskAdvantage?: number;
    marginInstability: number;
    isSolvent: boolean;
    isActionable: boolean;
    bayesianWinProb: number | undefined;
  } | null;
  predictiveProfile?: Record<string, number> | null;
  predictiveTelemetry?: Array<{
    evLoss: number;
    isCorrect: boolean;
    createdAt: string | Date;
  }> | null;
}

// Contexto do Motor WASM / Equity (Muda frequentemente durante o cálculo - Fricção Zero)
export interface ISotaWasmContext {
  nativeRangeMetric?: { equity: number; isCalculating: boolean };
  dispatchNativeEquity?: (heroRange: string, villainRange: string, board: string) => void;
  setManualEquity?: (val: number) => void;

  // SOTA: Offloading de ICM/Perspectiva
  dispatchIcmPerspectiva?: (
    input: PerspectivaInput,
    onResult: (res: PerspectivaResult) => void
  ) => void;

  // SOTA: Métricas Quânticas Computadas via WASM
  quantumMetricsData?: import('./hooks/useQuantumEngine').QuantumMetricsResult | null;
  isCalculatingMetrics?: boolean;
  dispatchQuantumMetrics?: (
    payload: import('./hooks/useQuantumEngine').QuantumMetricsPayload
  ) => void;

  // SOTA: Distorção de Nash e Despacho ICM (WASM)
  nashResults?: import('./hooks/useQuantumEngine').NashDistortionResults | null;
  dispatchIcmDistortion?: (payload: import('./hooks/useQuantumEngine').DistortionPayload) => void;

  // Backwards compatibility shims
  insolvencyMatrixData?: import('./hooks/useQuantumEngine').InsolvencyMetrics | null;
  isCalculatingInsolvency?: boolean;
  dispatchInsolvencyMatrix?: (payload: import('./hooks/useQuantumEngine').InsolvencyPayload) => void;
}

export const SotaSpotContext = createContext<ISotaSpotContext | null>(null);
export const SotaMetricsContext = createContext<ISotaMetricsContext | null>(null);
export const SotaWasmContext = createContext<ISotaWasmContext | null>(null);

export interface ISotaEcosystemProviderProps {
  spotContextValue: ISotaSpotContext;
  metricsContextValue: ISotaMetricsContext;
  wasmContextValue: ISotaWasmContext;
  children: React.ReactNode;
}

export const SotaEcosystemProvider = ({
  spotContextValue,
  metricsContextValue,
  wasmContextValue,
  children,
}: Readonly<ISotaEcosystemProviderProps>) => (
  <SotaSpotContext value={spotContextValue}>
    <SotaMetricsContext value={metricsContextValue}>
      <SotaWasmContext value={wasmContextValue}>{children}</SotaWasmContext>
    </SotaMetricsContext>
  </SotaSpotContext>
);
