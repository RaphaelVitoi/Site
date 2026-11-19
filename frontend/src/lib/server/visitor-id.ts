import { createHash } from 'node:crypto';

/**
 * Gera um identificador opaco de 32 chars hexadecimais a partir do `user.id`
 * da sessao para segregar baldes de rate-limit no backend sem expor PII.
 */
export function identificadorDoVisitante(sessao: unknown): string | null {
	const id = (sessao as { user?: { id?: unknown } } | null)?.user?.id;
	if (typeof id !== 'string' || id.length === 0) return null;
	return createHash('sha256').update(id).digest('hex').slice(0, 32);
}

/**
 * Extrai ou gera um identificador de correlacao (`X-Request-Id`) para rastreio
 * ponta-a-ponta entre o gateway Next.js e o backend Python aiohttp.
 */
export function resolverCorrelationId(req?: Request): string {
	const headers = req && typeof req.headers?.get === 'function' ? req.headers : null;
	const incoming = headers?.get('x-request-id')?.trim();
	if (incoming && /^[A-Za-z0-9._-]{4,64}$/.test(incoming)) {
		return incoming;
	}
	return crypto.randomUUID().replaceAll('-', '').slice(0, 16);
}
