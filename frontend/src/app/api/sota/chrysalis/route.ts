/**
 * @file route.ts
 * @path frontend/src/app/api/sota/chrysalis/route.ts
 * @role Rota Next.js para a Chrysalis Live Engine (service externo AGPL).
 *
 * Protocolo Chico SOTA v8.0 GOLD.
 * GET  -> descoberta/saude: sonda GET /v1/apps do servico (endpoint
 *         documentado no README upstream) e devolve proveniencia §4.
 * POST -> validacao de plano de edicao com revisao otimista + modos
 *         Plan/Accept/Full, espelhando engine/chrysalis_bridge.py.
 *         Nenhuma delegacao de chat e alegada sem sonda viva do
 *         endpoint correspondente (pendencia declarada na spec).
 *
 * @format
 */

import { NextResponse } from 'next/server';
import {
	CHRYSSALIS_DEFAULT_BASE_URL,
	chrysalisProvenia,
	enforceMode,
	isLoopbackOrHttps,
	revisionToken,
	validateWorkspacePath,
} from '@/lib/chrysalis';

export const runtime = 'nodejs';

export interface ChrysalisHealthResponse {
	status: 'ONLINE' | 'OFFLINE';
	apps_count: number;
	base_url: string;
	reason?: string;
	provenia: ReturnType<typeof chrysalisProvenia>;
}

export interface ChrysalisPlanRequest {
	workspace_path?: string;
	content?: string;
	new_content?: string;
	expected_revision?: string;
	mode?: string;
	approved?: boolean;
}

export interface ChrysalisPlanResponse {
	status: 'SUCCESS' | 'ERROR';
	path?: string;
	revision?: string;
	undo_id?: string;
	reason?: string;
	provenia: ReturnType<typeof chrysalisProvenia>;
	error?: string;
}

const CHRYSALIS_SERVICE_BASE =
	process.env['CHRYSALIS_SERVICE_URL'] || CHRYSSALIS_DEFAULT_BASE_URL;

export async function GET(): Promise<NextResponse<ChrysalisHealthResponse>> {
	if (!isLoopbackOrHttps(CHRYSALIS_SERVICE_BASE)) {
		return NextResponse.json({
			status: 'OFFLINE',
			apps_count: 0,
			base_url: CHRYSALIS_SERVICE_BASE,
			reason: 'CHRYSALIS_SERVICE_URL deve ser loopback HTTP ou HTTPS.',
			provenia: chrysalisProvenia(true),
		});
	}
	try {
		const res = await fetch(`${CHRYSALIS_SERVICE_BASE}/v1/apps`, {
			method: 'GET',
			signal: AbortSignal.timeout(800),
			cache: 'no-store',
		});

		// Servidor no ar mesmo sem autenticação (401 esperado no primeiro acesso).
		if (res.ok || res.status === 401 || res.status === 403) {
			const data = await res.json().catch(() => ({}));
			const raw = data as { apps?: unknown; items?: unknown };
			let apps: unknown[] = [];
			if (Array.isArray(raw.apps)) {
				apps = raw.apps;
			} else if (Array.isArray(raw.items)) {
				apps = raw.items;
			}
			return NextResponse.json({
				status: 'ONLINE',
				apps_count: apps.length,
				base_url: CHRYSALIS_SERVICE_BASE,
				provenia: chrysalisProvenia(false),
			});
		}
		return NextResponse.json({
			status: 'OFFLINE',
			apps_count: 0,
			base_url: CHRYSALIS_SERVICE_BASE,
			reason: `Servico respondeu com status HTTP ${res.status}`,
			provenia: chrysalisProvenia(true),
		});
	} catch (error) {

		const msg = error instanceof Error ? error.message : 'Conexao recusada';
		return NextResponse.json({
			status: 'OFFLINE',
			apps_count: 0,
			base_url: CHRYSALIS_SERVICE_BASE,
			reason: `Servico indisponivel em ${CHRYSALIS_SERVICE_BASE} (${msg})`,
			provenia: chrysalisProvenia(true),
		});
	}
}

export async function POST(request: Request): Promise<NextResponse<ChrysalisPlanResponse>> {
	try {
		const body = (await request.json().catch(() => ({}))) as ChrysalisPlanRequest;
		const mode = body.mode || 'accept';
		const approved = body.approved === true;
		const mutation = mode !== 'plan';
		enforceMode(mode, mutation, approved);
		const path = validateWorkspacePath(body.workspace_path || '');
		const content = body.content ?? '';
		const newContent = body.new_content ?? '';
		const expected = body.expected_revision || revisionToken(content);
		if (expected !== revisionToken(content)) {
			return NextResponse.json(
				{
					status: 'ERROR',
					path,
					reason: 'stale-revision',
					provenia: chrysalisProvenia(true),
					error: 'Revisao defasada: releia o arquivo antes de salvar (409-semantico).',
				},
				{ status: 409 },
			);
		}
		if (mode === 'plan') {
			return NextResponse.json({
				status: 'SUCCESS',
				path,
				revision: expected,
				provenia: chrysalisProvenia(true),
			});
		}
		const undoId = revisionToken(`${path}\u0000${newContent}\u0000${expected}`);
		return NextResponse.json({
			status: 'SUCCESS',
			path,
			revision: revisionToken(newContent),
			undo_id: undoId,
			provenia: chrysalisProvenia(false),
		});
	} catch (err: unknown) {
		const errorMessage = err instanceof Error ? err.message : String(err);
		const isPermission = errorMessage.includes('read-only') || errorMessage.includes('aprovacao');
		return NextResponse.json(
			{
				status: 'ERROR',
				reason: 'validation',
				provenia: chrysalisProvenia(true),
				error: errorMessage,
			},
			{ status: isPermission ? 403 : 400 },
		);
	}
}
