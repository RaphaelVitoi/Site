/**
 * NEXUS KEY POOLS & ROUTING OBSERVATORY GATEWAY (SOTA v8.0 GOLD)
 * PATH: src/app/api/sota/key-pools/route.ts
 * ROLE: Exposicao segura (zero segredos em claro) dos pools HKCU/HKLM,
 *       saude em memoria, telemetria SQLite e sonda HTTP read-only opcional.
 */

import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import { NextResponse } from 'next/server';
import { buildNexusServerUrl } from '@/lib/api-contract';

export const dynamic = 'force-dynamic';

const execFileAsync = promisify(execFile);
const POOL_FILTER_RX = /^[A-Za-z0-9_ .-]{0,40}$/;
const DEFAULT_SITE_ROOT = String.raw`C:\Users\rapha\.gemini\Site`;

function resolveSiteRoot(): string {
  const cwd = process.cwd();
  const candidates = [path.resolve(cwd, '..'), cwd, DEFAULT_SITE_ROOT];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'task_executor.py'))) {
      return dir;
    }
  }
  return DEFAULT_SITE_ROOT;
}

async function queryBackendObservatory(
  live: boolean,
  pool: string,
): Promise<{ ok: true; data: unknown } | { ok: false }> {
  const token = process.env['API_SECRET_TOKEN'] || '';
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), live ? 18000 : 2500);
  try {
    const endpoint = buildNexusServerUrl('/api/v1/keys/observatory');
    const url = !live && pool ? `${endpoint}?pool=${encodeURIComponent(pool)}` : endpoint;
    const init: RequestInit = {
      method: live ? 'POST' : 'GET',
      headers: live ? { ...headers, 'Content-Type': 'application/json' } : headers,
      signal: controller.signal,
      cache: 'no-store',
    };
    if (live) {
      init.body = JSON.stringify({ live: true, pool });
    }
    const res = await fetch(url, init);
    if (!res.ok) return { ok: false };
    const data: unknown = await res.json();
    return { ok: true, data };
  } catch {
    return { ok: false };
  } finally {
    clearTimeout(timeout);
  }
}

async function runCliFallback(live: boolean, pool: string): Promise<unknown> {
  const siteRoot = resolveSiteRoot();
  const pyVenv = path.join(siteRoot, '.venv', 'Scripts', 'python.exe');
  const pythonExe = fs.existsSync(pyVenv) ? pyVenv : 'python';
  const taskExecutor = path.join(siteRoot, 'task_executor.py');
  const args = [taskExecutor, 'audit-keys', '--json'];
  if (live) args.push('--live');
  if (pool) args.push('--pool', pool);

  const { stdout } = await execFileAsync(pythonExe, args, {
    cwd: siteRoot,
    timeout: live ? 20000 : 8000,
    maxBuffer: 2 * 1024 * 1024,
  });
  return JSON.parse(stdout) as unknown;
}

async function resolveSnapshot(live: boolean, pool: string): Promise<unknown> {
  const backend = await queryBackendObservatory(live, pool);
  if (backend.ok) return backend.data;
  return runCliFallback(live, pool);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pool = (searchParams.get('pool') || '').trim();
    if (!POOL_FILTER_RX.test(pool)) {
      return NextResponse.json({ error: 'Filtro de pool invalido' }, { status: 400 });
    }
    const snapshot = await resolveSnapshot(false, pool);
    return NextResponse.json(snapshot);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Falha ao auditar pools';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { live?: unknown; pool?: unknown };
    const live = body.live === true;
    const pool = typeof body.pool === 'string' ? body.pool.trim() : '';
    if (!POOL_FILTER_RX.test(pool)) {
      return NextResponse.json({ error: 'Filtro de pool invalido' }, { status: 400 });
    }
    const snapshot = await resolveSnapshot(live, pool);
    return NextResponse.json(snapshot);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Falha ao sondar pools';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
