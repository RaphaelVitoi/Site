/**
 * IDENTITY: Leitura de corpo HTTP com teto de bytes
 * PATH: src/lib/server/limited-body.ts
 * ROLE: Impõe limite de tamanho ao corpo efetivamente recebido, não ao declarado.
 *
 * BK-16 (auditoria 2026-09-16). O relay Gemma conferia só `content-length`. Um corpo
 * chunked chega sem o header, `Number(null ?? 0)` vira 0, a checagem passa, e
 * `request.json()` lê o stream inteiro sem limite.
 */
export class CorpoExcedeLimiteError extends Error {}

export async function lerCorpoComLimite(request: Request, maxBytes: number): Promise<string> {
	const declarado = request.headers.get('content-length');
	if (declarado !== null) {
		const tamanho = Number(declarado);
		if (!Number.isFinite(tamanho) || tamanho < 0 || tamanho > maxBytes) {
			throw new CorpoExcedeLimiteError('Corpo declarado excede o limite.');
		}
	}
	if (!request.body) return '';

	const leitor = request.body.getReader();
	const partes: Uint8Array[] = [];
	let total = 0;
	for (;;) {
		const { done, value } = await leitor.read();
		if (done) break;
		total += value.byteLength;
		if (total > maxBytes) {
			await leitor.cancel();
			throw new CorpoExcedeLimiteError('Corpo recebido excede o limite.');
		}
		partes.push(value);
	}
	const junto = new Uint8Array(total);
	let deslocamento = 0;
	for (const parte of partes) {
		junto.set(parte, deslocamento);
		deslocamento += parte.byteLength;
	}
	return new TextDecoder().decode(junto);
}
