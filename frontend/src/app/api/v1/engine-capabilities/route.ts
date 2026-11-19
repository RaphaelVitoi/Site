import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { buildNexusServerUrl } from '@/lib/api-contract';
import { identificadorDoVisitante, resolverCorrelationId } from '@/lib/server/visitor-id';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Gateway autenticado de paridade de capacidades de engines (`GET /api/v1/engine-capabilities`).
 */
export async function GET(request?: Request) {
	const requestId = resolverCorrelationId(request);
	const baseHeaders = { 'Cache-Control': 'no-store', 'X-Request-Id': requestId };

	const session = await auth();
	if (!session) {
		return NextResponse.json(
			{ status: 'ERROR', error: 'Engine Capabilities: sessão exigida.' },
			{ status: 401, headers: baseHeaders },
		);
	}

	const credencial = process.env['API_SECRET_TOKEN'];
	if (!credencial) {
		return NextResponse.json(
			{ status: 'ERROR', error: 'Engine Capabilities: gateway não configurado (API_SECRET_TOKEN ausente).' },
			{ status: 503, headers: baseHeaders },
		);
	}

	const headers: Record<string, string> = {
		Authorization: `Bearer ${credencial}`,
		'X-Request-Id': requestId,
	};
	const visitante = identificadorDoVisitante(session);
	if (visitante) headers['X-Nexus-Client-Id'] = visitante;

	try {
		const res = await fetch(buildNexusServerUrl('/api/v1/engine-capabilities'), {
			method: 'GET',
			headers,
			signal: AbortSignal.timeout(3_000),
			cache: 'no-store',
		});
		const upstreamRequestId = res.headers.get('x-request-id');
		const data: unknown = await res
			.json()
			.catch(() => ({ status: 'ERROR', error: 'Resposta não-JSON do backend.' }));
		return NextResponse.json(data, {
			status: res.status,
			headers: {
				'Cache-Control': 'no-store',
				'X-Request-Id': upstreamRequestId || requestId,
			},
		});
	} catch (error) {
		if (error instanceof DOMException && error.name === 'TimeoutError') {
			return NextResponse.json(
				{ status: 'ERROR', error: 'Engine Capabilities: tempo limite excedido.' },
				{ status: 504, headers: baseHeaders },
			);
		}
		return NextResponse.json(
			{ status: 'ERROR', error: 'Engine Capabilities: backend inalcançável.' },
			{ status: 503, headers: baseHeaders },
		);
	}
}
