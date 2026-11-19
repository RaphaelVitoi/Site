import 'server-only';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { buildNexusServerUrl } from '@/lib/api-contract';
import { isOperatorEmail } from '@/lib/server/operator';
import { identificadorDoVisitante, resolverCorrelationId } from '@/lib/server/visitor-id';

const DEFAULT_OPERATOR_TIMEOUT_MS = 15_000;

export interface OperatorSession {
	user: {
		id?: string;
		email: string;
	};
}

export type OperatorGuardResult =
	| { ok: true; session: OperatorSession; requestId: string }
	| { ok: false; response: NextResponse; requestId: string };

/**
 * Valida sessão autenticada e pertencimento a `NEXUS_OPERATOR_EMAILS`.
 * Fail-closed com `Cache-Control: no-store`.
 */
export async function requireOperatorSession(
	obterSessao: () => Promise<unknown> = auth,
	req?: Request,
): Promise<OperatorGuardResult> {
	const requestId = resolverCorrelationId(req);
	const baseHeaders = { 'Cache-Control': 'no-store', 'X-Request-Id': requestId };
	const sessao = (await obterSessao()) as { user?: { id?: unknown; email?: unknown } } | null;
	if (!sessao) {
		return {
			ok: false,
			requestId,
			response: NextResponse.json({ status: 'ERROR', error: 'Sessão exigida.' }, { status: 401, headers: baseHeaders }),
		};
	}
	if (!isOperatorEmail(sessao.user?.email)) {
		return {
			ok: false,
			requestId,
			response: NextResponse.json(
				{ status: 'ERROR', error: 'Área restrita ao operador.' },
				{ status: 403, headers: baseHeaders },
			),
		};
	}
	return {
		ok: true,
		requestId,
		session: {
			user: {
				...(typeof sessao.user?.id === 'string' ? { id: sessao.user.id } : {}),
				email: String(sessao.user?.email),
			},
		},
	};
}

/** Monta headers autenticados e de correlação para chamadas de operador ao backend Python. */
export function buildOperatorBackendHeaders(
	requestId: string = resolverCorrelationId(),
	extra?: Record<string, string>,
	sessao?: unknown,
): Record<string, string> {
	const headers: Record<string, string> = {
		'X-Request-Id': requestId,
		...extra,
	};
	const credencial = process.env['API_SECRET_TOKEN'];
	if (credencial) {
		headers['Authorization'] = `Bearer ${credencial}`;
	}
	const visitante = identificadorDoVisitante(sessao);
	if (visitante) {
		headers['X-Nexus-Client-Id'] = visitante;
	}
	return headers;
}

/**
 * IDENTITY: Gateway GET das rotas de operador para o backend Nexus
 * PATH: src/lib/server/operator-gateway.ts
 */
export async function encaminharGetDeOperador(
	caminho: string,
	parametros: Record<string, string>,
	obterSessao: () => Promise<unknown> = auth,
): Promise<Response> {
	const guard = await requireOperatorSession(obterSessao);
	if (!guard.ok) return guard.response;

	const credencial = process.env['API_SECRET_TOKEN'];
	if (!credencial) {
		return NextResponse.json(
			{ status: 'ERROR', error: 'Gateway não configurado.' },
			{ status: 503, headers: { 'Cache-Control': 'no-store', 'X-Request-Id': guard.requestId } },
		);
	}

	const url = new URL(buildNexusServerUrl(caminho));
	for (const [chave, valor] of Object.entries(parametros)) url.searchParams.set(chave, valor);

	const signal = typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(DEFAULT_OPERATOR_TIMEOUT_MS) : undefined;
	let upstream: Response;
	try {
		upstream = await fetch(url, {
			headers: buildOperatorBackendHeaders(guard.requestId, undefined, guard.session),
			cache: 'no-store',
			...(signal ? { signal } : {}),
		});
	} catch (error) {
		if (error instanceof DOMException && error.name === 'TimeoutError') {
			console.warn('[operator-gateway] tempo limite excedido no backend', error);
			return NextResponse.json(
				{ status: 'ERROR', error: 'Tempo limite excedido ao consultar o backend.' },
				{ status: 504, headers: { 'Cache-Control': 'no-store', 'X-Request-Id': guard.requestId } },
			);
		}
		console.warn('[operator-gateway] backend inalcançável', error);
		return NextResponse.json(
			{ status: 'ERROR', error: 'Backend inalcançável.' },
			{ status: 503, headers: { 'Cache-Control': 'no-store', 'X-Request-Id': guard.requestId } },
		);
	}

	// O corpo segue em stream; só cabeçalhos de conteúdo e de isolamento atravessam.
	const headers = new Headers({
		'Cache-Control': 'no-store',
		'X-Content-Type-Options': 'nosniff',
		'X-Request-Id': guard.requestId,
	});
	for (const nome of ['content-type', 'content-length', 'content-security-policy', 'content-disposition', 'x-request-id']) {
		const valor = upstream.headers.get(nome);
		if (valor) headers.set(nome, valor);
	}
	return new Response(upstream.body, { status: upstream.status, headers });
}

export async function encaminharPostJsonDeOperador(
	caminho: string,
	corpo: unknown,
	obterSessao: () => Promise<unknown> = auth,
): Promise<Response> {
	const guard = await requireOperatorSession(obterSessao);
	if (!guard.ok) return guard.response;

	const credencial = process.env['API_SECRET_TOKEN'];
	if (!credencial) {
		return NextResponse.json(
			{ status: 'ERROR', error: 'Gateway não configurado.' },
			{ status: 503, headers: { 'Cache-Control': 'no-store', 'X-Request-Id': guard.requestId } },
		);
	}

	const signal = typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(DEFAULT_OPERATOR_TIMEOUT_MS) : undefined;
	let upstream: Response;
	try {
		upstream = await fetch(new URL(buildNexusServerUrl(caminho)), {
			method: 'POST',
			headers: buildOperatorBackendHeaders(guard.requestId, { 'Content-Type': 'application/json' }, guard.session),
			body: JSON.stringify(corpo),
			cache: 'no-store',
			...(signal ? { signal } : {}),
		});
	} catch (error) {
		if (error instanceof DOMException && error.name === 'TimeoutError') {
			console.warn('[operator-gateway] tempo limite excedido no backend', error);
			return NextResponse.json(
				{ status: 'ERROR', error: 'Tempo limite excedido ao consultar o backend.' },
				{ status: 504, headers: { 'Cache-Control': 'no-store', 'X-Request-Id': guard.requestId } },
			);
		}
		console.warn('[operator-gateway] backend inalcançável', error);
		return NextResponse.json(
			{ status: 'ERROR', error: 'Backend inalcançável.' },
			{ status: 503, headers: { 'Cache-Control': 'no-store', 'X-Request-Id': guard.requestId } },
		);
	}

	const headers = new Headers({
		'Cache-Control': 'no-store',
		'X-Content-Type-Options': 'nosniff',
		'X-Request-Id': guard.requestId,
	});
	for (const nome of ['content-type', 'content-length', 'x-request-id']) {
		const valor = upstream.headers.get(nome);
		if (valor) headers.set(nome, valor);
	}
	return new Response(upstream.body, { status: upstream.status, headers });
}
