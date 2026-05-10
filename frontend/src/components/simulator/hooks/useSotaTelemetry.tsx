﻿'use client';

/**
 * IDENTITY: SOTA Telemetry Hook (Nervous System)
 * PATH: src/components/simulator/hooks/useSotaTelemetry.tsx
 * ROLE: Prover interface de Fricção Zero para registro de inteligência analítica.
 * PRINCIPLE: Antevisão - Captura automática de contexto sistêmico.
 */

import { logTelemetryEvent } from '@/lib/telemetry-client';
import { TelemetryCategorySchema, type TelemetryPayload } from '@/lib/schemas';
import { useCallback } from 'react';
import { useSotaSync } from './useSotaSync';

export function useSotaTelemetry( componentName: string ) {
    const { physics } = useSotaSync();

    const track = useCallback( async (
        category: import( 'zod' ).z.infer<typeof TelemetryCategorySchema>,
        actionData: {
            userAction?: string;
            optimalAction?: string;
            evLoss?: number;
            isCorrect?: boolean;
            metadata?: Record<string, any>;
        }
    ) => {
        const startTime = performance.now();

        const payload: TelemetryPayload = {
            category,
            componentName,
            scenarioContext: physics, // Injeção automática da Física da Mesa
            userAction: actionData.userAction,
            optimalAction: actionData.optimalAction,
            evLoss: actionData.evLoss ?? 0,
            isCorrect: actionData.isCorrect ?? true,
            metadata: actionData.metadata,
            latency: 0 // Será calculado após a execução
        };

        logTelemetryEvent( payload );

        const endTime = performance.now();
        const latency = endTime - startTime;

        // SOTA: Limiar elevado para 2500ms (2.5s) para evitar um loop de feedback positivo (DDoS).
        // Chamadas HTTP Serverless em rede real excedem 200ms com facilidade.
        if ( latency > 2500 ) {
            logTelemetryEvent( {
                category: 'performance',
                componentName,
                latency,
                metadata: { type: 'slow_persistence_warning' }
            } );
        }
    }, [physics, componentName] );

    return { track };
}
