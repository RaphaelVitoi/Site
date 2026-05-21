'use client';
import { createContext } from 'react';
import { IQuantumMetrics, IQuantumPerspectiva } from './engine/types';

export interface ISotaSpotData {
    heroStack: number;
    villainStack: number;
    heroRole: string;
    villainRole: string;
    pot: number;
    betSize: number;
    bubbleFactor: number;
    riskPremium: number;
    chipEv: number;
    fgsProjection: number;
    fgsHealth: number;
    isBaseline: boolean;
    apiQuantumMetrics: IQuantumMetrics | null;
}

export interface IActionMetric {
    chipEv: number;
    icmEv: number;
    perspectiva: number;
    isProfitable: boolean;
}

export interface ISotaActionMetrics {
    fold: IActionMetric;
    call: IActionMetric;
    shove: IActionMetric;
}

// Contexto Estático/Dados Base (Muda com as interações de spot)
export interface ISotaSpotContext {
    spotData: ISotaSpotData | Record<string, any>;
    actionMetrics: ISotaActionMetrics | Record<string, any>;
    effectiveIpRp: number;
    effectiveOopRp: number;
    potOddsPct: number;
    heroInvested?: number;
    activePlayers?: number;
}

export interface ISotaMetricsContext {
    quantumPerspectiva: IQuantumPerspectiva | Record<string, any> | null;
    apiQuantumMetrics: IQuantumMetrics | Record<string, any> | null;
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
export const SotaWasmContext = SotaWasmStateContext;

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
