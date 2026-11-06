/**
 * @file chrysalis.ts
 * @path frontend/src/lib/chrysalis.ts
 * @role Paridade TypeScript do contrato Chrysalis Live Engine (adapter).
 *
 * Protocolo Chico SOTA v8.0 GOLD. Espelha a semantica clean-room de
 * engine/chrysalis_bridge.py: revisao SHA-256 otimista, validacao de
 * caminho do workspace, fronteira loopback/HTTPS e modos Plan/Accept/Full.
 * Nenhum codigo AGPL upstream e reutilizado; o servico AGPL permanece
 * externo e e consultado apenas via HTTP (GET /v1/apps).
 *
 * @format
 */

import { createHash } from 'node:crypto';

export type AgentMode = 'plan' | 'accept' | 'full';

export interface ProveniaData {
	engine_id: string;
	implementation_level: string;
	runtime_used: string;
	model_used: string;
	intended_model: string;
	weights_loaded: boolean;
	fallback_used: boolean;
	assumptions: string[];
	limitations: string[];
	units: string[];
}

export const CHRYSSALIS_DEFAULT_BASE_URL = 'http://127.0.0.1:8788';

const WINDOWS_DEVICE_NAMES = new Set([
	'CON',
	'PRN',
	'AUX',
	'NUL',
	'COM1',
	'COM2',
	'COM3',
	'COM4',
	'COM5',
	'COM6',
	'COM7',
	'COM8',
	'COM9',
	'LPT1',
	'LPT2',
	'LPT3',
	'LPT4',
	'LPT5',
	'LPT6',
	'LPT7',
	'LPT8',
	'LPT9',
]);

/** Token de revisao SHA-256 hex (mesma regra do bridge Python). */
export function revisionToken(content: string): string {
	return createHash('sha256').update(content, 'utf8').digest('hex');
}

/** Valida/normaliza caminho; impossivel e rejeitado, nunca normalizado em silencio. */
export function validateWorkspacePath(path: string): string {
	const candidate = path.replaceAll('\\', '/');
	if (!candidate?.trim()) {
		throw new Error('workspace_path vazio.');
	}
	if (candidate !== candidate.trim()) {
		throw new Error(`final de nome invalido (ponto/espaco): ${path}`);
	}
	if (candidate.startsWith('/') || candidate.includes(':') || candidate.split('/').includes('..')) {
		throw new Error(`workspace_path fora do workspace ou invalido: ${path}`);
	}
	const parts = candidate.split('/').filter((p) => p !== '' && p !== '.');
	if (parts.length === 0) {
		throw new Error(`workspace_path fora do workspace ou invalido: ${path}`);
	}
	for (const part of parts) {
		const rawStem = part.split('.')[0] ?? part;
		const stem = rawStem.toUpperCase();
		if (WINDOWS_DEVICE_NAMES.has(stem)) {
			throw new Error(`nome de dispositivo Windows recusado: ${part}`);
		}
		if (part.endsWith('.') || part.endsWith(' ')) {
			throw new Error(`final de nome invalido (ponto/espaco): ${part}`);
		}
	}
	return parts.join('/');
}

/** Plan bloqueia mutacao; Accept exige approved=true. */
export function enforceMode(mode: string, mutation: boolean, approved: boolean): void {
	if (mode !== 'plan' && mode !== 'accept' && mode !== 'full') {
		throw new Error(`mode invalido: ${mode} (esperado plan|accept|full)`);
	}
	if (!mutation) return;
	if (mode === 'plan') {
		throw new Error('Plan e read-only: mutacao bloqueada.');
	}
	if (mode === 'accept' && !approved) {
		throw new Error('Accept exige aprovacao explicita antes de mutar.');
	}
}

/** Loopback HTTP ou qualquer HTTPS; rejeita file: e HTTP externo. */
export function isLoopbackOrHttps(url: string): boolean {
	const trimmed = url.trim();
	let cleaned = trimmed;
	while (cleaned.endsWith('/')) {
		cleaned = cleaned.slice(0, -1);
	}
	if (cleaned.startsWith('file:')) return false;
	if (/^https:\/\/[^/]+(\/.*)?$/.test(cleaned)) return true;
	return /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?(\/.*)?$/.test(cleaned);
}

export function chrysalisProvenia(fallbackUsed: boolean): ProveniaData {
	return {
		engine_id: 'chrysalis-live-engine-adapter',
		implementation_level: 'adapter',
		runtime_used: 'nextjs-typescript',
		model_used: '',
		intended_model: '',
		weights_loaded: false,
		fallback_used: fallbackUsed,
		assumptions: ['chrysalis-service-external-agpl', 'http-only-boundary'],
		limitations: ['not-a-chrysalis-engine-copy', 'chat-endpoint-pending-live-probe'],
		units: ['http-status', 'apps-count', 'revision-sha256'],
	};
}

/** Helper read-only (Plan forcado) — espelha ChrysalisClient.delegate_readonly. */
export function delegateReadonly(task: string): { task: string; status: string; mode: AgentMode } {
	enforceMode('plan', false, false);
	return { task, status: 'PLAN_ENFORCED', mode: 'plan' };
}
