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
}

export const SotaEcosystemContext = createContext<ISotaEcosystemContext | null>( null );
