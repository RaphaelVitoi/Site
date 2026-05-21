'use client';
import { createContext } from 'react';

// Contexto Estático/Dados Base (Muda com as interações de spot)
export interface ISotaSpotContext {
    spotData: Record<string, any>;
    actionMetrics: Record<string, any>;
    effectiveIpRp: number;
    effectiveOopRp: number;
    potOddsPct: number;
    heroInvested?: number;
    activePlayers?: number;
}

// Contexto de Métricas Calculadas (Muda conforme FGS e Perspectiva)
export interface ISotaMetricsContext {
    quantumPerspectiva: Record<string, any> | null;
    apiQuantumMetrics?: Record<string, any> | null;
}

// Contexto do Motor WASM / Equity (Muda frequentemente durante o cálculo - Fricção Zero)
export interface ISotaWasmContext {
    nativeRangeMetric?: { equity: number; isCalculating: boolean };
    dispatchNativeEquity?: ( heroRange: string, villainRange: string, board: string ) => void;
    setManualEquity?: ( val: number ) => void;

    // SOTA: Offloading de ICM/Perspectiva
    dispatchIcmPerspectiva?: ( input: any, onResult: ( res: any ) => void ) => void;

    // SOTA: Matriz de Insolvência (WASM)
    insolvencyMatrixData?: any[] | null;
    isCalculatingInsolvency?: boolean;
    dispatchInsolvencyMatrix?: ( villainRange: string, board: string, rpFactor: number, heroInvested: number, currentPot: number, activePlayers: number ) => void;
}

export const SotaSpotContext = createContext<ISotaSpotContext | null>( null );
export const SotaMetricsContext = createContext<ISotaMetricsContext | null>( null );
export const SotaWasmContext = createContext<ISotaWasmContext | null>( null );
