/**
 * @file route.ts
 * @path frontend/src/app/api/sota/chrysalis/route.ts
 * @role Rota Next.js de operador para a Chrysalis Live Engine.
 *
 * Protocolo Chico SOTA v8.0 GOLD:
 * - Exige sessao de operador via `requireOperatorSession`.
 * - Prioriza o backend Python Nexus (`/api/v1/chrysalis/health` e
 *   `/api/v1/chrysalis/validate-plan`) quando `API_SECRET_TOKEN` esta
 *   configurado, com fallback direto ao loopback AGPL / validador local.
 */

import { NextResponse } from 'next/server';
import { buildNexusServerUrl } from '@/lib/api-contract';
import {
  CHRYSSALIS_DEFAULT_BASE_URL,
  chrysalisProvenia,
  enforceMode,
  isLoopbackOrHttps,
  revisionToken,
  validateWorkspacePath,
} from '@/lib/chrysalis';
import { buildOperatorBackendHeaders, requireOperatorSession } from '@/lib/server/operator-gateway';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

const CHRYSALIS_SERVICE_BASE = process.env['CHRYSALIS_SERVICE_URL'] || CHRYSSALIS_DEFAULT_BASE_URL;

function normalizeBackendHealth(raw: unknown): ChrysalisHealthResponse | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const nested =
    obj['status'] === 'SUCCESS' && obj['health'] && typeof obj['health'] === 'object'
      ? (obj['health'] as Record<string, unknown>)
      : obj;
  const rawStatus = nested['status'];
  if (rawStatus !== 'ONLINE' && rawStatus !== 'OFFLINE') return null;

  const appsCount =
    typeof nested['apps_count'] === 'number' && Number.isFinite(nested['apps_count']) ? nested['apps_count'] : 0;
  const baseUrl =
    typeof nested['base_url'] === 'string' && nested['base_url'].length > 0
      ? nested['base_url']
      : CHRYSALIS_SERVICE_BASE;
  const reason = typeof nested['reason'] === 'string' ? nested['reason'] : undefined;
  const rawProv = nested['provenia'] as Partial<ReturnType<typeof chrysalisProvenia>> | undefined;
  const fallbackUsed = typeof rawProv?.fallback_used === 'boolean' ? rawProv.fallback_used : rawStatus !== 'ONLINE';

  return {
    status: rawStatus,
    apps_count: appsCount,
    base_url: baseUrl,
    ...(reason ? { reason } : {}),
    provenia: chrysalisProvenia(fallbackUsed),
  };
}

function parseDirectAppsCount(data: unknown): number {
  const raw = data as { apps?: unknown; items?: unknown };
  if (Array.isArray(raw.apps)) return raw.apps.length;
  if (Array.isArray(raw.items)) return raw.items.length;
  return 0;
}

async function tryBackendChrysalisHealth(
  requestId: string,
  session: unknown,
): Promise<ReturnType<typeof normalizeBackendHealth>> {
  if (!process.env['API_SECRET_TOKEN']) return null;
  try {
    const backendRes = await fetch(buildNexusServerUrl('/api/v1/chrysalis/health'), {
      method: 'GET',
      headers: buildOperatorBackendHeaders(requestId, undefined, session),
      signal: AbortSignal.timeout(1_500),
      cache: 'no-store',
    });
    if (!backendRes.ok) return null;
    const rawBackend: unknown = await backendRes.json().catch(() => null);
    return normalizeBackendHealth(rawBackend);
  } catch {
    return null;
  }
}

export async function GET(request?: Request): Promise<NextResponse> {
  const guard = await requireOperatorSession(undefined, request);
  if (!guard.ok) return guard.response;
  const responseHeaders = { 'Cache-Control': 'no-store', 'X-Request-Id': guard.requestId };

  const backendHealth = await tryBackendChrysalisHealth(guard.requestId, guard.session);
  if (backendHealth) {
    return NextResponse.json(backendHealth, { headers: responseHeaders });
  }

  if (!isLoopbackOrHttps(CHRYSALIS_SERVICE_BASE)) {
    return NextResponse.json(
      {
        status: 'OFFLINE',
        apps_count: 0,
        base_url: CHRYSALIS_SERVICE_BASE,
        reason: 'CHRYSALIS_SERVICE_URL deve ser loopback HTTP ou HTTPS.',
        provenia: chrysalisProvenia(true),
      },
      { headers: responseHeaders },
    );
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
      return NextResponse.json(
        {
          status: 'ONLINE',
          apps_count: parseDirectAppsCount(data),
          base_url: CHRYSALIS_SERVICE_BASE,
          provenia: chrysalisProvenia(false),
        },
        { headers: responseHeaders },
      );
    }
    return NextResponse.json(
      {
        status: 'OFFLINE',
        apps_count: 0,
        base_url: CHRYSALIS_SERVICE_BASE,
        reason: `Servico respondeu com status HTTP ${res.status}`,
        provenia: chrysalisProvenia(true),
      },
      { headers: responseHeaders },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Conexao recusada';
    return NextResponse.json(
      {
        status: 'OFFLINE',
        apps_count: 0,
        base_url: CHRYSALIS_SERVICE_BASE,
        reason: `Servico indisponivel em ${CHRYSALIS_SERVICE_BASE} (${msg})`,
        provenia: chrysalisProvenia(true),
      },
      { headers: responseHeaders },
    );
  }
}

interface PlanValidationInput {
  path: string;
  content: string;
  newContent: string;
  expected: string;
  mode: string;
  approved: boolean;
}

async function tryBackendPlanValidation(
  requestId: string,
  session: unknown,
  input: PlanValidationInput,
  responseHeaders: Record<string, string>,
): Promise<NextResponse | null> {
  if (!process.env['API_SECRET_TOKEN']) return null;
  try {
    const backendRes = await fetch(buildNexusServerUrl('/api/v1/chrysalis/validate-plan'), {
      method: 'POST',
      headers: buildOperatorBackendHeaders(requestId, { 'Content-Type': 'application/json' }, session),
      body: JSON.stringify({
        workspace_path: input.path,
        content: input.content,
        new_content: input.newContent,
        expected_revision: input.expected,
        mode: input.mode,
        approved: input.approved,
      }),
      signal: AbortSignal.timeout(3_000),
      cache: 'no-store',
    });
    if (backendRes.status >= 500) return null;
    const payload = (await backendRes.json().catch(() => ({}))) as Record<string, unknown>;
    if (backendRes.ok && payload['status'] === 'SUCCESS') {
      return NextResponse.json(
        {
          status: 'SUCCESS',
          path: typeof payload['path'] === 'string' ? payload['path'] : input.path,
          revision: typeof payload['revision'] === 'string' ? payload['revision'] : input.expected,
          ...(typeof payload['undo_id'] === 'string' ? { undo_id: payload['undo_id'] } : {}),
          provenia: chrysalisProvenia(false),
        },
        { headers: responseHeaders },
      );
    }
    return NextResponse.json(
      {
        status: 'ERROR',
        path: input.path,
        reason: backendRes.status === 409 ? 'stale-revision' : 'validation',
        provenia: chrysalisProvenia(false),
        error: typeof payload['error'] === 'string' ? payload['error'] : `HTTP ${backendRes.status}`,
      },
      { status: backendRes.status, headers: responseHeaders },
    );
  } catch {
    return null;
  }
}

function buildLocalPlanResponse(input: PlanValidationInput, responseHeaders: Record<string, string>): NextResponse {
  if (input.expected !== revisionToken(input.content)) {
    return NextResponse.json(
      {
        status: 'ERROR',
        path: input.path,
        reason: 'stale-revision',
        provenia: chrysalisProvenia(true),
        error: 'Revisao defasada: releia o arquivo antes de salvar (409-semantico).',
      },
      { status: 409, headers: responseHeaders },
    );
  }
  if (input.mode === 'plan') {
    return NextResponse.json(
      {
        status: 'SUCCESS',
        path: input.path,
        revision: input.expected,
        provenia: chrysalisProvenia(true),
      },
      { headers: responseHeaders },
    );
  }
  const undoId = revisionToken(`${input.path}\u0000${input.newContent}\u0000${input.expected}`);
  return NextResponse.json(
    {
      status: 'SUCCESS',
      path: input.path,
      revision: revisionToken(input.newContent),
      undo_id: undoId,
      provenia: chrysalisProvenia(false),
    },
    { headers: responseHeaders },
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  const guard = await requireOperatorSession(undefined, request);
  if (!guard.ok) return guard.response;
  const responseHeaders = { 'Cache-Control': 'no-store', 'X-Request-Id': guard.requestId };

  try {
    const body = (await request.json().catch(() => ({}))) as ChrysalisPlanRequest;
    const mode = body.mode || 'accept';
    const approved = body.approved === true;
    enforceMode(mode, mode !== 'plan', approved);
    const content = body.content ?? '';
    const input: PlanValidationInput = {
      path: validateWorkspacePath(body.workspace_path || ''),
      content,
      newContent: body.new_content ?? '',
      expected: body.expected_revision || revisionToken(content),
      mode,
      approved,
    };

    const backendResponse = await tryBackendPlanValidation(guard.requestId, guard.session, input, responseHeaders);
    if (backendResponse) return backendResponse;

    return buildLocalPlanResponse(input, responseHeaders);
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
      { status: isPermission ? 403 : 400, headers: responseHeaders },
    );
  }
}
