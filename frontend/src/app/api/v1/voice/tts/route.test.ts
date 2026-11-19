/**
 * @jest-environment node
 */
jest.mock('server-only', () => ({}));

import { POST } from './route';

describe('POST /api/v1/voice/tts', () => {
	const originalFetch = globalThis.fetch;

	afterEach(() => {
		globalThis.fetch = originalFetch;
		jest.restoreAllMocks();
	});

	it('rejeita texto vazio ou voz invalida com 400 sem tocar upstream', async () => {
		globalThis.fetch = jest.fn();

		const emptyRes = await POST(
			new Request('http://localhost:3000/api/v1/voice/tts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.1' },
				body: JSON.stringify({ text: '   ' }),
			}),
		);
		const badVoiceRes = await POST(
			new Request('http://localhost:3000/api/v1/voice/tts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.2' },
				body: JSON.stringify({ text: 'ICM na bolha', voice: 'invalid voice!' }),
			}),
		);

		expect(emptyRes.status).toBe(400);
		expect(emptyRes.headers.get('cache-control')).toBe('no-store');
		expect(badVoiceRes.status).toBe(400);
		expect(globalThis.fetch).not.toHaveBeenCalled();
	});

	it('rejeita payload acima de 16 KB com 413', async () => {
		globalThis.fetch = jest.fn();

		const res = await POST(
			new Request('http://localhost:3000/api/v1/voice/tts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.3' },
				body: JSON.stringify({ text: 'a'.repeat(20_000) }),
			}),
		);

		expect(res.status).toBe(413);
		expect(res.headers.get('cache-control')).toBe('no-store');
		expect(globalThis.fetch).not.toHaveBeenCalled();
	});

	it('encaminha payload validado com rate clamped e X-Request-Id retornando 200', async () => {
		globalThis.fetch = jest.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					ok: true,
					audioBase64: 'UklGRg==',
					format: 'wav',
					voice: 'Kore',
					tier: 'cloud',
					debugInternal: 'omit',
				}),
				{ status: 200, headers: { 'Content-Type': 'application/json' } },
			),
		);

		const res = await POST(
			new Request('http://localhost:3000/api/v1/voice/tts', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-request-id': 'tts-corr-42',
					'x-forwarded-for': '10.0.0.4',
				},
				body: JSON.stringify({ text: 'Risk premium em FT.', voice: 'Kore', rate: 9.9 }),
			}),
		);
		const body = (await res.json()) as Record<string, unknown>;

		expect(res.status).toBe(200);
		expect(res.headers.get('cache-control')).toBe('no-store');
		expect(res.headers.get('x-request-id')).toBe('tts-corr-42');
		expect(body).toEqual({
			ok: true,
			audioBase64: 'UklGRg==',
			format: 'wav',
			voice: 'Kore',
			tier: 'cloud',
		});

		const [url, init] = (globalThis.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
		expect(url).toBe('http://127.0.0.1:9333/api/voice/tts');
		expect(JSON.parse(String(init.body))).toMatchObject({
			text: 'Risk premium em FT.',
			voice: 'Kore',
			rate: 2.0,
		});
	});

	it('retorna 504 em TimeoutError e 503 quando upstream cai', async () => {
		const timeoutErr = new DOMException('Timed out', 'TimeoutError');
		globalThis.fetch = jest.fn().mockRejectedValueOnce(timeoutErr).mockRejectedValueOnce(new Error('ECONNREFUSED'));

		const r504 = await POST(
			new Request('http://localhost:3000/api/v1/voice/tts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.5' },
				body: JSON.stringify({ text: 'Teste timeout' }),
			}),
		);
		const r503 = await POST(
			new Request('http://localhost:3000/api/v1/voice/tts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.6' },
				body: JSON.stringify({ text: 'Teste offline' }),
			}),
		);

		expect(r504.status).toBe(504);
		expect(r503.status).toBe(503);
	});
});
