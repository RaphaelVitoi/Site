/** @format */

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { ZodError } from 'zod';
import { enforcePureAscii } from '@/lib/text-utils';
import { auth } from '@/auth';
import { TelemetryPayloadSchema, PerspectiveMetricSchema } from '@/lib/schemas';
import { resolveTelemetryIdentity } from '@/lib/server/telemetry-identity';

// SOTA: Caminho absoluto para o buffer de telemetria compartilhado com o motor Python
const SHARED_TELEMETRY_PATH = path.resolve(
	process.cwd(),
	'..',
	'.claude/logs/wasm_telemetry_dump.jsonl',
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

		// SOTA FIX: Garantia de diretório pai antes de appendAtômico
		const parentDir = path.dirname(SHARED_TELEMETRY_PATH);
		if (!fs.existsSync(parentDir)) {
			fs.mkdirSync(parentDir, { recursive: true });
		}

		// SOTA FIX: Append atômico via fs.appendFileSync para garantir integridade no log rotativo do Python
		fs.appendFileSync(SHARED_TELEMETRY_PATH, logEntry, { encoding: 'ascii' });
	} catch (err) {
		// Falha silenciosa para não quebrar a request do usuário se o disco estiver cheio/travado
		console.warn('[TELEMETRY-BRIDGE] Falha ao encaminhar log para Orquestrador:', err);
	}
}

function buildTelemetryEventData(parsed: ReturnType<typeof TelemetryPayloadSchema.parse>, userId: string) {
	return {
		userId,
		category: parsed.category,
		componentName: parsed.componentName || parsed.type || 'unknown',
		scenarioContext: parsed.scenarioContext ? JSON.stringify(parsed.scenarioContext) : null,
		userAction: parsed.userAction ?? null,
		optimalAction: parsed.optimalAction ?? null,
		evLoss: parsed.evLoss ?? parsed.ev_loss ?? 0,
		isCorrect: parsed.isCorrect ?? parsed.is_correct ?? true,
		latency: parsed.latency ?? parsed.time_ms ?? 0,
		metadata: parsed.metadata ? JSON.stringify(parsed.metadata) : null,
	};
}

async function handleTelemetryBatch(sessionUserId: string | undefined, batch: unknown[]) {
	const recordIds: string[] = [];
	for (const item of batch) {
		const parsed = TelemetryPayloadSchema.parse(item);
		const identity = resolveTelemetryIdentity(sessionUserId, parsed.user_id);
		if (!identity.ok) continue;

		const record = await prisma.telemetryEvent.create({
			data: buildTelemetryEventData(parsed, identity.userId),
		});
		logToOrchestrator({ type: 'TelemetryEvent', ...parsed });
		recordIds.push(record.id);
	}

	return NextResponse.json({
		status: 'SUCCESS',
		type: 'TelemetryBatch',
		count: recordIds.length,
		ids: recordIds,
	});
}

async function handleSingleTelemetryEvent(sessionUserId: string | undefined, rawPayload: unknown) {
	const parsed = TelemetryPayloadSchema.parse(rawPayload);
	const identity = resolveTelemetryIdentity(sessionUserId, parsed.user_id);
	if (!identity.ok) {
		return NextResponse.json({ error: identity.error }, { status: identity.status });
	}

	const record = await prisma.telemetryEvent.create({
		data: buildTelemetryEventData(parsed, identity.userId),
	});

	logToOrchestrator({ type: 'TelemetryEvent', ...parsed });

	return NextResponse.json({
		status: 'SUCCESS',
		id: record.id,
		type: 'TelemetryEvent',
		recordId: record.id,
	});
}

async function handlePerspectiveMetric(rawPayload: unknown) {
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

	logToOrchestrator({ type: 'PerspectiveMetric', ...parsed });

	return NextResponse.json({
		status: 'SUCCESS',
		id: record.id,
		type: 'PerspectiveMetric',
	});
}

function handleTelemetryError(error: unknown) {
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

		// Roteamento Híbrido Fricção Zero: Distingue TelemetryBatch, TelemetryEvent de PerspectiveMetric
		if ('batch' in rawPayload && Array.isArray(rawPayload.batch)) {
			return await handleTelemetryBatch(session.user?.id, rawPayload.batch);
		}
		if ('category' in rawPayload) {
			return await handleSingleTelemetryEvent(session.user?.id, rawPayload);
		}
		return await handlePerspectiveMetric(rawPayload);
	} catch (error: unknown) {
		return handleTelemetryError(error);
	}
}
