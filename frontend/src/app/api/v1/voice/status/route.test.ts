/**
 * @jest-environment node
 */
jest.mock('server-only', () => ({}));

import { GET } from './route';

describe('GET /api/v1/voice/status', () => {
	const originalFetch = globalThis.fetch;
	const envOriginal = { ...process.env };

	afterEach(() => {
		globalThis.fetch = originalFetch;
		process.env = { ...envOriginal };
		jest.restoreAllMocks();
	});

	it('projeta campos sanitizados quando Voice Nexus responde ok', async () => {
		globalThis.fetch = jest.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					ok: true,
					success: true,
					configured: true,
					geminiApiActive: true,
					ttsModels: ['gemini-3.8-flash-lite-tts'],
					studioVoices: ['Kore', 'Aoede'],
					internalSecretLeak: 'SHOULD_NOT_PASS',
				}),
				{ status: 200, headers: { 'Content-Type': 'application/json' } },
			),
		);

		const res = await GET(
			new Request('http://localhost:3000/api/v1/voice/status', {
				headers: { 'x-request-id': 'voice-stat-1' },
			}),
		);
		const body = (await res.json()) as Record<string, unknown>;

		expect(res.status).toBe(200);
		expect(res.headers.get('cache-control')).toBe('no-store');
		expect(res.headers.get('x-request-id')).toBe('voice-stat-1');
		expect(body['ok']).toBe(true);
		expect(body['configured']).toBe(true);
		expect(body['ttsModels']).toEqual(['gemini-3.8-flash-lite-tts']);
		expect(body['internalSecretLeak']).toBeUndefined();
	});

	it('degrada graciosamente com 200 offline=true quando Voice Nexus esta fora', async () => {
		globalThis.fetch = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));

		const res = await GET(new Request('http://localhost:3000/api/v1/voice/status'));
		const body = (await res.json()) as {
			ok: boolean;
			configured: boolean;
			offline: boolean;
		};

		expect(res.status).toBe(200);
		expect(res.headers.get('cache-control')).toBe('no-store');
		expect(res.headers.get('x-request-id')).toBeTruthy();
		expect(body.ok).toBe(false);
		expect(body.configured).toBe(false);
		expect(body.offline).toBe(true);
	});
});
