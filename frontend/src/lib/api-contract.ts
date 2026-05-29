const DEFAULT_NEXUS_API_BASE = 'http://127.0.0.1:17042';

function trimTrailingSlash(value: string): string {
	return value.endsWith('/') ? value.slice(0, -1) : value;
}

function resolveClientBase(): string {
	return trimTrailingSlash(
		process.env['NEXT_PUBLIC_NEXUS_API_BASE'] ||
			process.env['NEXT_PUBLIC_API_BASE'] ||
			DEFAULT_NEXUS_API_BASE,
	);
}

function resolveServerBase(): string {
	return trimTrailingSlash(
		process.env['NEXUS_API_BASE'] ||
			process.env['NEXT_PUBLIC_NEXUS_API_BASE'] ||
			process.env['NEXT_PUBLIC_API_BASE'] ||
			DEFAULT_NEXUS_API_BASE,
	);
}

export const NEXUS_CLIENT_API_BASE = resolveClientBase();
export const NEXUS_SERVER_API_BASE = resolveServerBase();

// SOTA Guard: Blindagem absoluta de rotas contra SSRF e Path Traversal
function safeBuildUrl(base: string, targetPath: string): string {
	try {
		const safeBase = base.endsWith('/') ? base : `${base}/`;
		const safeTarget = targetPath.startsWith('/') ? targetPath.slice(1) : targetPath;

		// Verifica se targetPath tenta forçar um host externo (SSRF Bypass)
		if (/^https?:\/\//i.test(safeTarget)) {
			throw new Error('SSRF Attack - Destino absoluto não permitido');
		}

		const url = new URL(safeTarget, safeBase);
		const baseUrl = new URL(safeBase);

		// Previne injeção de credenciais ou troca de host silenciosa
		if (url.hostname !== baseUrl.hostname) throw new Error('Hostname override violation');
		if (url.protocol !== 'http:' && url.protocol !== 'https:')
			throw new Error('Protocol violation');
		if (url.pathname.includes('..') || url.pathname.includes('//'))
			throw new Error('Path traversal violation');

		return url.toString();
	} catch (e) {
		console.error('[SEC CRÍTICO] Tentativa de corromper o Roteamento SOTA:', e);
		return 'http://127.0.0.1/sota-blocked-request';
	}
}

export function buildNexusClientUrl(path: string): string {
	return safeBuildUrl(NEXUS_CLIENT_API_BASE, path);
}

export function buildNexusServerUrl(path: string): string {
	return safeBuildUrl(NEXUS_SERVER_API_BASE, path);
}
