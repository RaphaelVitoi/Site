import { NextResponse } from 'next/server';
import { resolverCorrelationId } from '@/lib/server/visitor-id';
import {
	buildVoiceUpstreamSignal,
	resolveVoiceNexusUrl,
} from '@/lib/server/voice-gateway';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface UpstreamVoiceStatus {
	ok?: unknown;
	success?: unknown;
	configured?: unknown;
	geminiApiActive?: unknown;
	ttsModels?: unknown;
	studioVoices?: unknown;
}

function asStringArray(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return value.filter((item): item is string => typeof item === 'string').slice(0, 24);
}

/**
 * Proxy seguro (BFF) para disponibilidade do Voice Nexus (`:9333`).
 * Degrada graciosamente com HTTP 200 `{ ok: false, offline: true }` para que
 * o navegador comute silenciosamente para Web Speech SAPI sem expor loopback.
 */
export async function GET(request?: Request) {
	const requestId = resolverCorrelationId(request);
	const headers = { 'Cache-Control': 'no-store', 'X-Request-Id': requestId };
	const t0 = performance.now();

	try {
		const upstreamSignal = buildVoiceUpstreamSignal(request?.signal, 1_500);
		const res = await fetch(`${resolveVoiceNexusUrl()}/api/voice/status`, {
			method: 'GET',
			headers: { 'X-Request-Id': requestId },
			...(upstreamSignal ? { signal: upstreamSignal } : {}),
			cache: 'no-store',
		});

		const latencyMs = Math.round(performance.now() - t0);
		if (!res.ok) {
			return NextResponse.json(
				{ ok: false, success: false, configured: false, offline: true, latencyMs },
				{ headers },
			);
		}

		const raw = (await res.json().catch(() => null)) as UpstreamVoiceStatus | null;
		const isOk = Boolean(raw?.ok ?? raw?.success);

		return NextResponse.json(
			{
				ok: isOk,
				success: isOk,
				configured: Boolean(raw?.configured),
				geminiApiActive: Boolean(raw?.geminiApiActive),
				ttsModels: asStringArray(raw?.ttsModels),
				studioVoices: asStringArray(raw?.studioVoices),
				latencyMs,
			},
			{ headers },
		);
	} catch {
		const latencyMs = Math.round(performance.now() - t0);
		return NextResponse.json(
			{ ok: false, success: false, configured: false, offline: true, latencyMs },
			{ headers },
		);
	}
}
