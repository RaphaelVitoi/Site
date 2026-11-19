import { auth } from '@/auth';
import { InferenceRequestSchema } from '@/lib/schemas';
import { resolveGemmaRelayConfig } from '@/lib/server/gemma-relay';
import { CorpoExcedeLimiteError, lerCorpoComLimite } from '@/lib/server/limited-body';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Limite expandido para acomodar payloads multimodais com imagens em Base64 (10 MB)
const MAX_REQUEST_BYTES = 10 * 1024 * 1024;

async function requireGemmaSession() {
	const session = await auth();
	if (!session) {
		return null;
	}
	return session;
}

export async function GET() {
	if (!(await requireGemmaSession())) {
		return NextResponse.json(
			{ error: 'Acesso Negado: Sessao SOTA exigida.' },
			{ status: 401, headers: { 'Cache-Control': 'no-store' } },
		);
	}

	const relay = resolveGemmaRelayConfig();
	if (!relay.ok) {
		return NextResponse.json(
			{ online: false, error: relay.error },
			{ status: 200, headers: { 'Cache-Control': 'no-store' } },
		);
	}

	try {
		const healthUrl = new URL('/', relay.upstreamUrl);
		const upstream = await fetch(healthUrl, {
			cache: 'no-store',
			signal: AbortSignal.timeout(2_000),
		});
		return NextResponse.json(
			{ online: upstream.ok },
			{ status: 200, headers: { 'Cache-Control': 'no-store' } },
		);
	} catch {
		return NextResponse.json({ online: false }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
	}
}

export async function POST(request: Request) {
	if (!(await requireGemmaSession())) {
		return NextResponse.json(
			{ error: 'Acesso Negado: Sessao SOTA exigida.' },
			{ status: 401, headers: { 'Cache-Control': 'no-store' } },
		);
	}

	let payload: unknown;
	try {
		payload = JSON.parse(await lerCorpoComLimite(request, MAX_REQUEST_BYTES));
	} catch (error) {
		if (error instanceof CorpoExcedeLimiteError) {
			return NextResponse.json(
				{ error: 'Payload de inferencia excede o limite permitido.' },
				{ status: 413, headers: { 'Cache-Control': 'no-store' } },
			);
		}
		return NextResponse.json(
			{ error: 'Payload de inferencia invalido.' },
			{ status: 400, headers: { 'Cache-Control': 'no-store' } },
		);
	}

	const parsedPayload = InferenceRequestSchema.safeParse(payload);
	if (!parsedPayload.success) {
		return NextResponse.json(
			{ error: 'Payload de inferencia invalido.' },
			{ status: 400, headers: { 'Cache-Control': 'no-store' } },
		);
	}

	const relay = resolveGemmaRelayConfig();
	if (!relay.ok) {
		return NextResponse.json(
			{ error: relay.error },
			{ status: 503, headers: { 'Cache-Control': 'no-store' } },
		);
	}

	try {
		const timeoutSignal = AbortSignal.timeout(60_000);
		const signal =
			request.signal && typeof AbortSignal.any === 'function'
				? AbortSignal.any([request.signal, timeoutSignal])
				: timeoutSignal;
		const upstream = await fetch(relay.upstreamUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Vitoi-Auth': relay.apiSecret,
			},
			body: JSON.stringify(parsedPayload.data),
			signal,
			cache: 'no-store',
		});
		if (!upstream.ok || !upstream.body) {
			return NextResponse.json(
				{ error: 'Servico Gemma indisponivel.' },
				{ status: 502, headers: { 'Cache-Control': 'no-store' } },
			);
		}

		return new Response(upstream.body, {
			status: 200,
			headers: {
				'Content-Type': upstream.headers.get('content-type') || 'text/plain; charset=utf-8',
				'Cache-Control': 'no-store',
			},
		});
	} catch {
		return NextResponse.json(
			{ error: 'Servico Gemma indisponivel.' },
			{ status: 502, headers: { 'Cache-Control': 'no-store' } },
		);
	}
}
