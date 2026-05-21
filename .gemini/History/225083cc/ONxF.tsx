'use client';
import { createContext } from 'react';

export interface ISotaEcosystemContext {
    spotData: Record<string, any>;
    actionMetrics: Record<string, any>;
    quantumPerspectiva: Record<string, any> | null;
    effectiveIpRp: number;
    effectiveOopRp: number;
    potOddsPct: number;
    apiQuantumMetrics?: Record<string, any> | null;
    nativeRangeMetric?: { equity: number; isCalculating: boolean };
    dispatchNativeEquity?: ( heroRange: string, villainRange: string, board: string ) => void;
    setManualEquity?: ( val: number ) => void;
}

export const SotaEcosystemContext = createContext<ISotaEcosystemContext | null>( null );
