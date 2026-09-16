/**
 * IDENTITY: Proxy autenticado das rotas SOTA para o backend Nexus
 * PATH: src/lib/server/nexus-proxy.ts
 * ROLE: Encaminha ao backend só em nome de quem tem sessão, com a credencial de serviço do ambiente.
 *
 * Até 2026-09-16 `sota/pmev-heatmap` e `sota/timesfm-forecast` eram públicas, repassavam qualquer
 * corpo assinado com `API_SECRET_TOKEN` — a credencial de maior alcance do backend — e, sem ela no
 * ambiente, usavam o literal `sota-v6-dummy-secret`. Com o backend fora do ar, cada chamada virava
 * 500; o painel CFR disparava uma por amostra do worker e o log registrava centenas por minuto.
 *
 * Agora: sem sessão, 401 sem tocar o backend; sem credencial configurada, 503 sem tocar o backend;
 * backend inalcançável, 503. O cliente já cai no fallback analítico nesses três casos.
 */

import { NextResponse } from 'next/server';
import { buildNexusServerUrl } from '@/lib/api-contract';

export interface NexusProxyOptions {
	/** Resolve a sessão do visitante; injetável para teste. */
	obterSessao: () => Promise<unknown>;
	/** Nome curto do recurso, usado nas mensagens de erro. */
	rotulo: string;
}

export async function encaminharAoNexus(
	req: Request,
	caminho: string,
	{ obterSessao, rotulo }: NexusProxyOptions,
): Promise<NextResponse> {
	if (!(await obterSessao())) {
		return NextResponse.json({ status: 'ERROR', error: `${rotulo}: sessão exigida.` }, { status: 401 });
	}

	const credencial = process.env['API_SECRET_TOKEN'];
	if (!credencial) {
		return NextResponse.json(
			{ status: 'ERROR', error: `${rotulo}: gateway não configurado (API_SECRET_TOKEN ausente).` },
			{ status: 503 },
		);
	}

	let body: unknown;
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ status: 'ERROR', error: `${rotulo}: JSON inválido.` }, { status: 400 });
	}

	let resp: Response;
	try {
		resp = await fetch(buildNexusServerUrl(caminho), {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${credencial}` },
			body: JSON.stringify(body),
			cache: 'no-store',
		});
	} catch (error) {
		const motivo = error instanceof Error ? error.message : 'backend inalcançável';
		return NextResponse.json({ status: 'ERROR', error: `${rotulo}: ${motivo}` }, { status: 503 });
	}

	const data = await resp.json().catch(() => ({ status: 'ERROR', error: `${rotulo}: resposta não-JSON do backend.` }));
	return NextResponse.json(data, { status: resp.status });
}
