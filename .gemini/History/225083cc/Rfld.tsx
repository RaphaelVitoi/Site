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

// SOTA: Divisão Cirúrgica do Contexto WASM para Erradicar Loops de Re-render
// Contexto de Ações (Estável - Nunca muda de identidade)
export interface ISotaWasmActionsContext {
    dispatchNativeEquity?: ( heroRange: string, villainRange: string, board: string ) => void;
    setManualEquity?: ( val: number ) => void;
    dispatchIcmPerspectiva?: ( input: any, onResult: ( res: any ) => void ) => void;
    dispatchInsolvencyMatrix?: ( villainRange: string, board: string, rpFactor: number, heroInvested: number, currentPot: number, activePlayers: number ) => void;
}

// Contexto de Estado (Volátil - Muda durante o ciclo de vida do cálculo)
export interface ISotaWasmStateContext {
    nativeRangeMetric?: { equity: number; isCalculating: boolean; error?: string };
    insolvencyMatrixData?: any[] | null;
    isCalculatingInsolvency?: boolean;
}

export const SotaSpotContext = createContext<ISotaSpotContext | null>( null );
export const SotaMetricsContext = createContext<ISotaMetricsContext | null>( null );
export const SotaWasmActionsContext = createContext<ISotaWasmActionsContext | null>( null );
export const SotaWasmStateContext = createContext<ISotaWasmStateContext | null>( null );

// Mantido para compatibilidade legado (SOTA Bridge)
export const SotaWasmContext = SotaWasmStateContext as any;

export interface ISotaEcosystemProviderProps {
    spotContextValue: ISotaSpotContext;
    metricsContextValue: ISotaMetricsContext;
    wasmActionsValue: ISotaWasmActionsContext;
    wasmStateValue: ISotaWasmStateContext;
    children: React.ReactNode;
}

export const SotaEcosystemProvider = ( {
    spotContextValue,
    metricsContextValue,
    wasmActionsValue,
    wasmStateValue,
    children
}: ISotaEcosystemProviderProps ) => (
    <SotaSpotContext.Provider value={ spotContextValue }>
        <SotaMetricsContext.Provider value={ metricsContextValue }>
            <SotaWasmActionsContext.Provider value={ wasmActionsValue }>
                <SotaWasmStateContext.Provider value={ wasmStateValue }>
                    { children }
                </SotaWasmStateContext.Provider>
            </SotaWasmActionsContext.Provider>
        </SotaMetricsContext.Provider>
    </SotaSpotContext.Provider>
);
