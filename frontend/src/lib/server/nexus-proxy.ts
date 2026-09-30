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

import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { buildNexusServerUrl } from '@/lib/api-contract';
import { resolveAuthSecret } from '@/lib/server/auth-secret';

/**
 * Extrai o token JWT da sessão, ou `null` se não houver.
 *
 * FASE 6 / opção C (Tier 0, 2026-09-30). Injetável como `obterToken` porque o
 * valor não existe num `Request` cru: a sessão vive no cookie, e `getToken` a
 * decodifica. Injetar o ponto de leitura é o que torna a função testável sem
 * subir um servidor Next — e sem um servidor, ela é o caminho de código que a
 * auditoria não consegue cobrir.
 *
 * A falha aqui NÃO é exceção: uma sessão ilegível produz `null`, que o
 * chamador converte em "não há token". Propagar o erro derrubaria uma rota de
 * produto inteira por um cookie expirado, que é o modo de falha que transforma
 * sessão expirada em indisponibilidade.
 */
export type ObterToken = (req: Request) => Promise<string | null>;

export const tokenDaSessao: ObterToken = async (req: Request) => {
	try {
		const token = await getToken({ req: req as unknown as NextRequest, secret: resolveAuthSecret() });
		if (!token) return null;
		// O token precisa de `sub`: sem ele o backend não consegue ligar a
		// requisição a uma pessoa, e aceitá-lo seria aceitar uma afirmação sem
		// sujeito. `proxy.ts` já exige token; este é o segundo filtro, e é o
		// que impede que um token sem identidade vire "usuário" no backend.
		if (typeof token.sub !== 'string' || token.sub.trim() === '') return null;
		// `['jwt']` e não `.jwt`: o tipo do NextAuth é um index signature, e
		// `noPropertyAccessFromIndexSignature` (herdado do `tsconfig.base.json`)
		// proíbe o acesso por ponto. O valor também é `unknown` — daí o
		// `typeof`, que é o que fecha o `Promise<{} | null>` que o tsc
		// reclamou. Verificado por `npm run typecheck`, que pegou os dois.
		const bruto = token['jwt'];
		return typeof bruto === 'string' && bruto.length > 0 ? bruto : null;
	} catch {
		return null;
	}
};

/**
 * Lê o token do usuário sem deixar a leitura derrubar a rota.
 *
 * A IDENTIDADE é um luxo — a requisição segue sem ela, exatamente como antes
 * da Fase 6. Um cookie corrompido que levanta exceção aqui viraria 500 numa
 * rota de produto que antes respondia 200, e a opção C teria comprado uma
 * indisponibilidade em troca de uma identidade que era opcional.
 *
 * O `console.warn` mantém o sinal: falhar em silêncio aqui seria indistinguível
 * de "sessão sem token", e as duas têm causas diferentes.
 */
async function obterTokenComToleranciaAFalha(obterToken: ObterToken, req: Request): Promise<string | null> {
	try {
		return await obterToken(req);
	} catch (erro) {
		console.warn('[nexus-proxy] token do usuário ilegível; encaminhando sem identidade', erro);
		return null;
	}
}

/**
 * Identificador opaco do visitante para o rate limit do backend (BK-06, auditoria 2026-09-16).
 *
 * O gateway chama o backend de 127.0.0.1 em nome de todos; sem isto o backend contava o site
 * inteiro num balde único de 300 req/min. O id do usuário vai como hash — o backend precisa só
 * distinguir visitantes, não saber quem são — e ele só é lido junto da credencial de serviço.
 */
export function identificadorDoVisitante(sessao: unknown): string | null {
	const id = (sessao as { user?: { id?: unknown } } | null)?.user?.id;
	if (typeof id !== 'string' || id.length === 0) return null;
	return createHash('sha256').update(id).digest('hex').slice(0, 32);
}

export interface NexusProxyOptions {
	/** Resolve a sessão do visitante; injetável para teste. */
	obterSessao: () => Promise<unknown>;
	/** Nome curto do recurso, usado nas mensagens de erro. */
	rotulo: string;
	/**
	 * Extrai o token JWT do usuário. Injetável para teste — o valor vive no
	 * cookie, e um teste sem servidor Next não o alcança. O default é a
	 * implementação real; o parâmetro existe para o teste fornecer a sua.
	 */
	obterToken?: ObterToken;
}

export async function encaminharAoNexus(
	req: Request,
	caminho: string,
	{ obterSessao, rotulo, obterToken = tokenDaSessao }: NexusProxyOptions,
): Promise<NextResponse> {
	const sessao = await obterSessao();
	if (!sessao) {
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

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${credencial}`,
	};
	const visitante = identificadorDoVisitante(sessao);
	if (visitante) headers['X-Nexus-Client-Id'] = visitante;

	// FASE 6 / opção C (autorizado pelo Tier 0 em 2026-09-30): a credencial de
	// serviço prova QUE ESTE PROCESSO é o gateway — nada sobre QUEM é o usuário.
	// Sem o token do usuário, o backend só responde 401 ou 403; nunca consegue
	// dizer "esta requisição é do usuário X".
	//
	// O token vai num header SEPARADO, e não no `Authorization`. Isso mantém as
	// duas credenciais com naturezas distintas: `Authorization` decide a PORTA
	// (serviço vs. produto), `X-User-Token` decide a PESSOA. Colocá-los no mesmo
	// header obrigaria o backend a escolher entre duas leituras do mesmo valor,
	// e essa escolha seria convenção, não contrato.
	//
	// `getToken` é a MESMA função que `proxy.ts:14` usa: o backend valida
	// exatamente a assinatura que o edge já aceitou, e não nasce uma segunda
	// decisão de sessão em dois lugares.
	const tokenUsuario = await obterTokenComToleranciaAFalha(obterToken, req);
	if (tokenUsuario) headers['X-User-Token'] = tokenUsuario;

	let resp: Response;
	try {
		resp = await fetch(buildNexusServerUrl(caminho), {
			method: 'POST',
			headers,
			body: JSON.stringify(body),
			cache: 'no-store',
		});
	} catch (error) {
		// A mensagem do fetch carrega host, porta e código de socket do backend (BK-15): fica no log.
		console.warn(`[nexus-proxy] ${rotulo}: backend inalcançável`, error);
		return NextResponse.json({ status: 'ERROR', error: `${rotulo}: backend inalcançável.` }, { status: 503 });
	}

	const data = await resp.json().catch(() => ({ status: 'ERROR', error: `${rotulo}: resposta não-JSON do backend.` }));
	return NextResponse.json(data, { status: resp.status });
}
