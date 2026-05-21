'use client';
import type { PerspectivaResult } from '@/lib/perspectiva';
import { createContext } from 'react';

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
    kappa?: number;
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
        marginInstability: number;
        isSolvent: boolean;
        isActionable: boolean;
    } | null;
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

export interface ISotaEcosystemProviderProps {
    spotContextValue: ISotaSpotContext;
    metricsContextValue: ISotaMetricsContext;
    wasmContextValue: ISotaWasmContext;
    children: React.ReactNode;
}

export const SotaEcosystemProvider = ( {
    spotContextValue,
    metricsContextValue,
    wasmContextValue,
    children
}: ISotaEcosystemProviderProps ) => (
    <SotaSpotContext.Provider value={ spotContextValue }>
        <SotaMetricsContext.Provider value={ metricsContextValue }>
            <SotaWasmContext.Provider value={ wasmContextValue }>
                { children }
            </SotaWasmContext.Provider>
        </SotaMetricsContext.Provider>
    </SotaSpotContext.Provider>
);
