import { auth } from '@/auth';
import { InferenceRequestSchema } from '@/lib/schemas';
import { resolveGemmaRelayConfig } from '@/lib/server/gemma-relay';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const MAX_REQUEST_BYTES = 64 * 1024;

async function requireGemmaSession() {
	const session = await auth();
	if (!session) {
		return null;
	}
	return session;
}

export async function GET() {
	if (!(await requireGemmaSession())) {
		return NextResponse.json({ error: 'Acesso Negado: Sessao SOTA exigida.' }, { status: 401 });
	}

	const relay = resolveGemmaRelayConfig();
	if (!relay.ok) {
		return NextResponse.json({ error: relay.error }, { status: 503 });
	}

	try {
		const healthUrl = new URL('/', relay.upstreamUrl);
		const upstream = await fetch(healthUrl, { cache: 'no-store' });
		return NextResponse.json({ online: upstream.ok }, { status: upstream.ok ? 200 : 503 });
	} catch {
		return NextResponse.json({ online: false }, { status: 503 });
	}
}

export async function POST(request: Request) {
	if (!(await requireGemmaSession())) {
		return NextResponse.json({ error: 'Acesso Negado: Sessao SOTA exigida.' }, { status: 401 });
	}

	const declaredLength = Number(request.headers.get('content-length') ?? 0);
	if (!Number.isFinite(declaredLength) || declaredLength > MAX_REQUEST_BYTES) {
		return NextResponse.json({ error: 'Payload de inferencia excede o limite permitido.' }, { status: 413 });
	}

	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return NextResponse.json({ error: 'Payload de inferencia invalido.' }, { status: 400 });
	}

	const parsedPayload = InferenceRequestSchema.safeParse(payload);
	if (!parsedPayload.success) {
		return NextResponse.json({ error: 'Payload de inferencia invalido.' }, { status: 400 });
	}

	const relay = resolveGemmaRelayConfig();
	if (!relay.ok) {
		return NextResponse.json({ error: relay.error }, { status: 503 });
	}

	try {
		const upstream = await fetch(relay.upstreamUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Vitoi-Auth': relay.apiSecret,
			},
			body: JSON.stringify(parsedPayload.data),
			cache: 'no-store',
		});
		if (!upstream.ok || !upstream.body) {
			return NextResponse.json({ error: 'Servico Gemma indisponivel.' }, { status: 502 });
		}

		return new Response(upstream.body, {
			status: 200,
			headers: {
				'Content-Type': upstream.headers.get('content-type') || 'text/plain; charset=utf-8',
				'Cache-Control': 'no-store',
			},
		});
	} catch {
		return NextResponse.json({ error: 'Servico Gemma indisponivel.' }, { status: 502 });
	}
}
