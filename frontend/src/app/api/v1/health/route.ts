import { NextResponse } from 'next/server';
import { buildNexusServerUrl } from '@/lib/api-contract';
import { resolverCorrelationId } from '@/lib/server/visitor-id';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface BackendHealthPayload {
	status?: string;
	uptime_s?: number;
	tasks?: Record<string, number>;
	agents?: number;
}

/**
 * Agregador publico de observabilidade (sem segredos) entre o servidor Next.js
 * e o micro-servidor Python aiohttp (`/api/v1/health`).
 */
export async function GET(request?: Request) {
	const requestId = resolverCorrelationId(request);
	const headers = { 'Cache-Control': 'no-store', 'X-Request-Id': requestId };
	const t0 = performance.now();

	let backendReachable = false;
	let backendPayload: BackendHealthPayload | null = null;
	let upstreamStatus = 0;

	try {
		const res = await fetch(buildNexusServerUrl('/api/v1/health'), {
			method: 'GET',
			headers: { 'X-Request-Id': requestId },
			signal: AbortSignal.timeout(1_500),
			cache: 'no-store',
		});
		upstreamStatus = res.status;
		if (res.ok) {
			backendPayload = (await res.json().catch(() => null)) as BackendHealthPayload | null;
			backendReachable = backendPayload?.status === 'ok';
		}
	} catch {
		backendReachable = false;
	}

	const latencyMs = Math.round(performance.now() - t0);

	return NextResponse.json(
		{
			status: backendReachable ? 'ok' : 'degraded',
			timestamp: new Date().toISOString(),
			requestId,
			frontend: {
				status: 'ok',
				runtime: 'nextjs',
			},
			backend: {
				reachable: backendReachable,
				status: backendPayload?.status ?? (upstreamStatus ? `http_${upstreamStatus}` : 'unreachable'),
				latencyMs,
				uptime_s: typeof backendPayload?.uptime_s === 'number' ? backendPayload.uptime_s : null,
				tasks: backendPayload?.tasks ?? null,
				agents: typeof backendPayload?.agents === 'number' ? backendPayload.agents : null,
			},
		},
		{ headers },
	);
}
