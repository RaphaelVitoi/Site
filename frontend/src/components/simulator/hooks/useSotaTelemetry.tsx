'use client';

/**
 * IDENTITY: SOTA Telemetry Hook (Nervous System)
 * PATH: src/components/simulator/hooks/useSotaTelemetry.tsx
 * ROLE: Prover interface de Fricção Zero para registro de inteligência analítica.
 * PRINCIPLE: Antevisão - Captura automática de contexto sistêmico.
 */

import { TelemetryCategorySchema } from '@/lib/schemas';
import { logTelemetryEvent } from '@/lib/telemetry-client';
import { useSession } from 'next-auth/react';
import { useCallback } from 'react';
import { useSotaSync } from './useSotaSync';

export function useSotaTelemetry(componentName: string) {
	const { physics } = useSotaSync();
	const { data: session } = useSession();

	const track = useCallback(
		async (
			category: import('zod').z.infer<typeof TelemetryCategorySchema>,
			actionData: {
				userAction?: string;
				optimalAction?: string;
				evLoss?: number;
				isCorrect?: boolean;
				metadata?: Record<string, unknown>;
				latency?: number; // Tempo de Reação Real (Time-To-Act)
			},
		) => {
			const startTime = performance.now();

			const payload = {
				category,
				componentName,
				scenarioContext: physics || {}, // Injeção automática da Física da Mesa
				userAction: actionData.userAction || '',
				optimalAction: actionData.optimalAction || '',
				evLoss: actionData.evLoss ?? 0,
				isCorrect: actionData.isCorrect ?? true,
				metadata: actionData.metadata || {},
				latency: actionData.latency ?? 0, // Injeta a latência real medida pelo Caller
				user_id: session?.user?.id || 'anonymous',
			};

			logTelemetryEvent(payload as import('@/lib/schemas').TelemetryPayload);

			const endTime = performance.now();
			const latency = endTime - startTime;

			// SOTA: Limiar elevado para 2500ms (2.5s) para evitar um loop de feedback positivo (DDoS).
			// Chamadas HTTP Serverless em rede real excedem 200ms com facilidade.
			if (latency > 2500) {
				logTelemetryEvent({
					category: 'performance',
					componentName,
					latency,
					metadata: { type: 'slow_persistence_warning' },
				});
			}
		},
		[physics, componentName, session],
	);

	return { track };
}
