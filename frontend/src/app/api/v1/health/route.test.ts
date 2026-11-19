/**
 * @jest-environment node
 */
jest.mock('server-only', () => ({}));

import { GET } from './route';

describe('GET /api/v1/health', () => {
	const originalFetch = globalThis.fetch;

	afterEach(() => {
		globalThis.fetch = originalFetch;
		jest.restoreAllMocks();
	});

	it('retorna 200 ok com telemetria do backend e X-Request-Id quando aiohttp responde ok', async () => {
		globalThis.fetch = jest.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					status: 'ok',
					uptime_s: 120.5,
					tasks: { pending: 1, completed: 4 },
					agents: 19,
				}),
				{ status: 200, headers: { 'Content-Type': 'application/json' } },
			),
		);

		const req = new Request('http://localhost:3000/api/v1/health', {
			headers: { 'x-request-id': 'health-corr-1' },
		});
		const res = await GET(req);
		const body = (await res.json()) as {
			status: string;
			requestId: string;
			backend: { reachable: boolean; agents: number | null; uptime_s: number | null };
		};

		expect(res.status).toBe(200);
		expect(res.headers.get('cache-control')).toBe('no-store');
		expect(res.headers.get('x-request-id')).toBe('health-corr-1');
		expect(body.status).toBe('ok');
		expect(body.backend.reachable).toBe(true);
		expect(body.backend.agents).toBe(19);
		expect(body.backend.uptime_s).toBe(120.5);
	});

	it('retorna status degraded com reachable false quando backend falha', async () => {
		globalThis.fetch = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));

		const res = await GET(new Request('http://localhost:3000/api/v1/health'));
		const body = (await res.json()) as {
			status: string;
			backend: { reachable: boolean; status: string };
		};

		expect(res.status).toBe(200);
		expect(res.headers.get('cache-control')).toBe('no-store');
		expect(res.headers.get('x-request-id')).toBeTruthy();
		expect(body.status).toBe('degraded');
		expect(body.backend.reachable).toBe(false);
		expect(body.backend.status).toBe('unreachable');
	});
});
