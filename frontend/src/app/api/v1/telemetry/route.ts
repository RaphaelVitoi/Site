/** @format */

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { ZodError } from 'zod';
import { enforcePureAscii } from '@/lib/text-utils';
import { auth } from '@/auth';
import { TelemetryPayloadSchema, PerspectiveMetricSchema } from '@/lib/schemas';

// SOTA: Caminho absoluto para o buffer de telemetria compartilhado com o motor Python
const SHARED_TELEMETRY_PATH = path.resolve(
	process.cwd(),
	'..',
	'.cerebro/logs/wasm_telemetry_dump.jsonl',
);

function logToOrchestrator(payload: Record<string, unknown>) {
	try {
		const rawLog =
			JSON.stringify({
				...payload,
				_source: 'frontend-nextjs',
				_timestamp: new Date().toISOString(),
			}) + '\n';

		// SOTA: Purificação ASCII obrigatória antes de gravar no log compartilhado
		const logEntry = enforcePureAscii(rawLog);

		// SOTA FIX: Append atômico via fs.appendFileSync para garantir integridade no log rotativo do Python
		fs.appendFileSync(SHARED_TELEMETRY_PATH, logEntry, { encoding: 'ascii' });
	} catch (err) {
		// Falha silenciosa para não quebrar a request do usuário se o disco estiver cheio/travado
		console.warn('[TELEMETRY-BRIDGE] Falha ao encaminhar log para Orquestrador:', err);
	}
}

export async function POST(req: Request) {
	try {
		// SEC-008: Proteção contra poluição de BD (Telemetria Autenticada SOTA)
		const session = await auth();
		if (!session) {
			return NextResponse.json(
				{ error: 'Acesso Negado: Criptografia SOTA exigida.' },
				{ status: 401 },
			);
		}

		const rawPayload = await req.json();

		// Roteamento Híbrido Fricção Zero: Distingue TelemetryEvent de PerspectiveMetric
		if ('category' in rawPayload) {
			const parsed = TelemetryPayloadSchema.parse(rawPayload);

			// SOTA: Persistência no Banco de Dados (Prisma)
			const record = await prisma.telemetryEvent.create({
				data: {
					userId: parsed.user_id || 'local-operator',
					category: parsed.category,
					componentName: parsed.componentName || parsed.type || 'unknown',
					scenarioContext: parsed.scenarioContext
						? JSON.stringify(parsed.scenarioContext)
						: null,
					userAction: parsed.userAction ?? null,
					optimalAction: parsed.optimalAction ?? null,
					evLoss: parsed.evLoss ?? parsed.ev_loss ?? 0,
					isCorrect: parsed.isCorrect ?? parsed.is_correct ?? true,
					latency: parsed.latency ?? parsed.time_ms ?? 0,
					metadata: parsed.metadata ? JSON.stringify(parsed.metadata) : null,
				},
			});

			// SOTA: Ponte para o Orquestrador Python (Logs unificados)
			logToOrchestrator({ type: 'TelemetryEvent', ...parsed });

			return NextResponse.json({
				status: 'SUCCESS',
				id: record.id,
				type: 'TelemetryEvent',
				recordId: record.id, // For compatibility
			});
		} else {
			const parsed = PerspectiveMetricSchema.parse(rawPayload);

			const record = await prisma.vitoiPerspectiveMetric.create({
				data: {
					scenarioId: parsed.scenarioId,
					...parsed.baseState,
					...parsed.dynamicModifiers,
					...parsed.structuralLiabilities,
					...parsed.edgeRelative,
					...parsed.insolvency,
				},
			});

			// SOTA: Ponte para o Orquestrador Python
			logToOrchestrator({ type: 'PerspectiveMetric', ...parsed });

			return NextResponse.json({
				status: 'SUCCESS',
				id: record.id,
				type: 'PerspectiveMetric',
			});
		}
	} catch (error: unknown) {
		console.error('[VITOI TELEMETRY] Erro Catastrófico de Injeção:', error);

		if (error instanceof ZodError) {
			return NextResponse.json(
				{ error: 'Validação de Payload Falhou', details: error.issues },
				{ status: 400 },
			);
		}

		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : 'Entropia não tratada',
			},
			{ status: 500 },
		);
	}
}
