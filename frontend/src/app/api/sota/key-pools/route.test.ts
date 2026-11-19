/**
 * @jest-environment node
 */
jest.mock('server-only', () => ({}));
jest.mock('@/auth', () => ({ auth: jest.fn() }));

import { auth } from '@/auth';
import { GET, POST } from './route';

type MockAuthFn = jest.MockedFunction<() => Promise<{ user?: { email?: string | null } } | null>>;

describe('/api/sota/key-pools', () => {
	const originalFetch = globalThis.fetch;
	const envOriginal = { ...process.env };
	const mockAuth = auth as unknown as MockAuthFn;

	beforeEach(() => {
		process.env['NEXUS_OPERATOR_EMAILS'] = 'op@exemplo.com';
		process.env['API_SECRET_TOKEN'] = 'token-keypools-teste';
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		process.env = { ...envOriginal };
		jest.clearAllMocks();
	});

	it('bloqueia GET e POST sem sessao com 401 e no-store sem chamar backend', async () => {
		mockAuth.mockResolvedValue(null);
		globalThis.fetch = jest.fn();

		const getRes = await GET(new Request('http://localhost:3000/api/sota/key-pools'));
		const postRes = await POST(
			new Request('http://localhost:3000/api/sota/key-pools', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ live: true }),
			}),
		);

		expect(getRes.status).toBe(401);
		expect(getRes.headers.get('cache-control')).toBe('no-store');
		expect(postRes.status).toBe(401);
		expect(postRes.headers.get('cache-control')).toBe('no-store');
		expect(globalThis.fetch).not.toHaveBeenCalled();
	});

	it('operador: GET encaminha para /api/v1/keys/observatory com Authorization e X-Request-Id', async () => {
		mockAuth.mockResolvedValue({ user: { email: 'op@exemplo.com' } });
		globalThis.fetch = jest.fn().mockResolvedValue(
			new Response(JSON.stringify({ mode: 'offline', total_vars: 5 }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}),
		);

		const res = await GET(
			new Request('http://localhost:3000/api/sota/key-pools?pool=OpenRouter', {
				headers: { 'x-request-id': 'kp-corr-1' },
			}),
		);
		const body = (await res.json()) as { mode: string; total_vars: number };

		expect(res.status).toBe(200);
		expect(res.headers.get('cache-control')).toBe('no-store');
		expect(res.headers.get('x-request-id')).toBe('kp-corr-1');
		expect(body).toEqual({ mode: 'offline', total_vars: 5 });

		const [url, init] = (globalThis.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
		expect(url).toContain('/api/v1/keys/observatory?pool=OpenRouter');
		const headers = init.headers as Record<string, string>;
		expect(headers['Authorization']).toBe('Bearer token-keypools-teste');
		expect(headers['X-Request-Id']).toBe('kp-corr-1');
	});

	it('operador: POST envia sonda live com filtro de pool', async () => {
		mockAuth.mockResolvedValue({ user: { email: 'op@exemplo.com' } });
		globalThis.fetch = jest.fn().mockResolvedValue(
			new Response(JSON.stringify({ mode: 'live', total_vars: 1 }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}),
		);

		const res = await POST(
			new Request('http://localhost:3000/api/sota/key-pools', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ live: true, pool: 'Gemini' }),
			}),
		);

		expect(res.status).toBe(200);
		const [url, init] = (globalThis.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
		expect(url).toContain('/api/v1/keys/observatory');
		expect(init.method).toBe('POST');
		expect(JSON.parse(String(init.body))).toEqual({ live: true, pool: 'Gemini' });
	});
});
