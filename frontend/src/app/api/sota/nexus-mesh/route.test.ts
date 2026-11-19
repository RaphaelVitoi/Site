/**
 * @jest-environment node
 */
jest.mock('server-only', () => ({}));
jest.mock('@/auth', () => ({ auth: jest.fn() }));

import { auth } from '@/auth';
import { GET, POST } from './route';

type MockAuthFn = jest.MockedFunction<() => Promise<{ user?: { email?: string | null } } | null>>;

describe('/api/sota/nexus-mesh', () => {
	const originalFetch = globalThis.fetch;
	const envOriginal = { ...process.env };
	const mockAuth = auth as unknown as MockAuthFn;

	beforeEach(() => {
		process.env['NEXUS_OPERATOR_EMAILS'] = 'op@exemplo.com';
		process.env['API_SECRET_TOKEN'] = 'token-mesh-teste';
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		process.env = { ...envOriginal };
		jest.clearAllMocks();
	});

	it('bloqueia GET e POST sem sessao com 401 e no-store', async () => {
		mockAuth.mockResolvedValue(null);
		globalThis.fetch = jest.fn();

		const getRes = await GET(new Request('http://localhost:3000/api/sota/nexus-mesh'));
		const postRes = await POST(
			new Request('http://localhost:3000/api/sota/nexus-mesh', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'benchmark_perception' }),
			}),
		);

		expect(getRes.status).toBe(401);
		expect(getRes.headers.get('cache-control')).toBe('no-store');
		expect(postRes.status).toBe(401);
		expect(globalThis.fetch).not.toHaveBeenCalled();
	});

	it('operador: rejeita modelo Ollama invalido com 400 sem tocar Ollama', async () => {
		mockAuth.mockResolvedValue({ user: { email: 'op@exemplo.com' } });
		globalThis.fetch = jest.fn();

		const res = await POST(
			new Request('http://localhost:3000/api/sota/nexus-mesh', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'warmup_ollama',
					model: 'bad model; rm -rf /',
					keepAlive: '1h',
				}),
			}),
		);

		expect(res.status).toBe(400);
		expect(res.headers.get('cache-control')).toBe('no-store');
		expect(globalThis.fetch).not.toHaveBeenCalled();
	});

	it('operador: executa acao warmup valida e retorna headers de correlacao', async () => {
		mockAuth.mockResolvedValue({ user: { email: 'op@exemplo.com' } });
		globalThis.fetch = jest.fn().mockResolvedValue(
			new Response(JSON.stringify({ eval_count: 10, eval_duration: 120_000_000 }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}),
		);

		const res = await POST(
			new Request('http://localhost:3000/api/sota/nexus-mesh', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-request-id': 'mesh-corr-7',
				},
				body: JSON.stringify({
					action: 'warmup_ollama',
					model: 'qwen-code-surgical:latest',
					keepAlive: '1h',
				}),
			}),
		);
		const body = (await res.json()) as { success: boolean; action: string };

		expect(res.status).toBe(200);
		expect(res.headers.get('cache-control')).toBe('no-store');
		expect(res.headers.get('x-request-id')).toBe('mesh-corr-7');
		expect(body.success).toBe(true);
		expect(body.action).toBe('warmup_ollama');
	});
});
