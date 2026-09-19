/**
 * @jest-environment node
 */
import { CorpoExcedeLimiteError, lerCorpoComLimite } from './limited-body';

function streamDe(bytes: number): ReadableStream<Uint8Array> {
	return new ReadableStream({
		start(controller) {
			controller.enqueue(new Uint8Array(bytes).fill(97));
			controller.close();
		},
	});
}

describe('lerCorpoComLimite (BK-16)', () => {
	it('lê corpo dentro do limite', async () => {
		const req = new Request('http://x/', { method: 'POST', body: '{"a":1}' });
		await expect(lerCorpoComLimite(req, 100)).resolves.toBe('{"a":1}');
	});

	it('recusa corpo chunked sem content-length que passa do limite', async () => {
		const req = new Request('http://x/', { method: 'POST', body: streamDe(101), duplex: 'half' } as RequestInit);
		expect(req.headers.get('content-length')).toBeNull();
		await expect(lerCorpoComLimite(req, 100)).rejects.toBeInstanceOf(CorpoExcedeLimiteError);
	});

	it('recusa content-length declarado acima do limite antes de ler', async () => {
		const req = new Request('http://x/', { method: 'POST', body: 'x', headers: { 'content-length': '999' } });
		await expect(lerCorpoComLimite(req, 100)).rejects.toBeInstanceOf(CorpoExcedeLimiteError);
	});
});
