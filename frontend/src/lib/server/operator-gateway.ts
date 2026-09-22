import 'server-only';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { buildNexusServerUrl } from '@/lib/api-contract';
import { isOperatorEmail } from '@/lib/server/operator';

/**
 * IDENTITY: Gateway GET das rotas de operador para o backend Nexus
 * PATH: src/lib/server/operator-gateway.ts
 *
 * FE-06 (auditoria 2026-09-17). A página /dashboard/files chamava `/api/proxy?url=...`, rota que
 * nunca existiu. Um proxy genérico com `url=` repassando a credencial de serviço seria exatamente o
 * confused deputy que o BK-19 fechou no backend. Aqui o caminho do backend é FIXO por rota, a
 * sessão tem de ser de operador (conferida de novo, além do proxy.ts), e só parâmetros declarados
 * atravessam.
 */
export async function encaminharGetDeOperador(
	caminho: string,
	parametros: Record<string, string>,
	obterSessao: () => Promise<unknown> = auth,
): Promise<Response> {
	const sessao = (await obterSessao()) as { user?: { email?: unknown } } | null;
	if (!sessao) return NextResponse.json({ status: 'ERROR', error: 'Sessão exigida.' }, { status: 401 });
	if (!isOperatorEmail(sessao.user?.email)) {
		return NextResponse.json({ status: 'ERROR', error: 'Área restrita ao operador.' }, { status: 403 });
	}

	const credencial = process.env['API_SECRET_TOKEN'];
	if (!credencial) {
		return NextResponse.json({ status: 'ERROR', error: 'Gateway não configurado.' }, { status: 503 });
	}

	const url = new URL(buildNexusServerUrl(caminho));
	for (const [chave, valor] of Object.entries(parametros)) url.searchParams.set(chave, valor);

	let upstream: Response;
	try {
		upstream = await fetch(url, { headers: { Authorization: `Bearer ${credencial}` }, cache: 'no-store' });
	} catch (error) {
		console.warn('[operator-gateway] backend inalcançável', error);
		return NextResponse.json({ status: 'ERROR', error: 'Backend inalcançável.' }, { status: 503 });
	}

	// O corpo segue em stream; só cabeçalhos de conteúdo e de isolamento atravessam.
	const headers = new Headers({ 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
	for (const nome of ['content-type', 'content-length', 'content-security-policy', 'content-disposition']) {
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
	const sessao = (await obterSessao()) as { user?: { email?: unknown } } | null;
	if (!sessao) return NextResponse.json({ status: 'ERROR', error: 'Sessão exigida.' }, { status: 401 });
	if (!isOperatorEmail(sessao.user?.email)) {
		return NextResponse.json({ status: 'ERROR', error: 'Área restrita ao operador.' }, { status: 403 });
	}

	const credencial = process.env['API_SECRET_TOKEN'];
	if (!credencial) return NextResponse.json({ status: 'ERROR', error: 'Gateway não configurado.' }, { status: 503 });

	let upstream: Response;
	try {
		upstream = await fetch(new URL(buildNexusServerUrl(caminho)), {
			method: 'POST',
			headers: { Authorization: `Bearer ${credencial}`, 'Content-Type': 'application/json' },
			body: JSON.stringify(corpo),
			cache: 'no-store',
		});
	} catch (error) {
		console.warn('[operator-gateway] backend inalcançável', error);
		return NextResponse.json({ status: 'ERROR', error: 'Backend inalcançável.' }, { status: 503 });
	}

	const headers = new Headers({ 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
	for (const nome of ['content-type', 'content-length']) {
		const valor = upstream.headers.get(nome);
		if (valor) headers.set(nome, valor);
	}
	return new Response(upstream.body, { status: upstream.status, headers });
}
