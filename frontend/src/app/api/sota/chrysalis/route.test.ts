/**
 * @jest-environment node
 */
jest.mock('server-only', () => ({}));
jest.mock('@/auth', () => ({ auth: jest.fn() }));

import { auth } from '@/auth';
import { delegateReadonly } from '@/lib/chrysalis';
import { GET, POST } from './route';

type MockAuthFn = jest.MockedFunction<() => Promise<{ user?: { email?: string | null } } | null>>;

describe('/api/sota/chrysalis', () => {
	const originalFetch = globalThis.fetch;
	const envOriginal = { ...process.env };
	const mockAuth = auth as unknown as MockAuthFn;

	beforeEach(() => {
		process.env['NEXUS_OPERATOR_EMAILS'] = 'op@exemplo.com';
		process.env['API_SECRET_TOKEN'] = 'token-chrysalis-teste';
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		process.env = { ...envOriginal };
		jest.clearAllMocks();
	});

	it('bloqueia GET e POST sem sessao com 401 e no-store', async () => {
		mockAuth.mockResolvedValue(null);
		globalThis.fetch = jest.fn();

		const getRes = await GET(new Request('http://localhost:3000/api/sota/chrysalis'));
		const postRes = await POST(
			new Request('http://localhost:3000/api/sota/chrysalis', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ workspace_path: 'frontend/src/app/page.tsx', mode: 'plan' }),
			}),
		);

		expect(getRes.status).toBe(401);
		expect(getRes.headers.get('cache-control')).toBe('no-store');
		expect(postRes.status).toBe(401);
		expect(globalThis.fetch).not.toHaveBeenCalled();
	});

	it('operador: GET prioriza /api/v1/chrysalis/health do backend quando online', async () => {
		mockAuth.mockResolvedValue({ user: { email: 'op@exemplo.com' } });
		globalThis.fetch = jest.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					status: 'ONLINE',
					apps_count: 3,
					base_url: 'http://127.0.0.1:17044',
					provenia: { fallback_used: false },
				}),
				{ status: 200, headers: { 'Content-Type': 'application/json' } },
			),
		);

		const res = await GET(
			new Request('http://localhost:3000/api/sota/chrysalis', {
				headers: { 'x-request-id': 'chr-corr-3' },
			}),
		);
		const body = (await res.json()) as {
			status: string;
			apps_count: number;
			provenia: { fallback_used: boolean };
		};

		expect(res.status).toBe(200);
		expect(res.headers.get('cache-control')).toBe('no-store');
		expect(res.headers.get('x-request-id')).toBe('chr-corr-3');
		expect(body.status).toBe('ONLINE');
		expect(body.apps_count).toBe(3);
		expect(body.provenia.fallback_used).toBe(false);
	});

	it('operador: GET degrada graciosamente para OFFLINE quando backend e loopback falham', async () => {
		mockAuth.mockResolvedValue({ user: { email: 'op@exemplo.com' } });
		globalThis.fetch = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));

		const res = await GET(new Request('http://localhost:3000/api/sota/chrysalis'));
		const body = (await res.json()) as {
			status: string;
			provenia: { fallback_used: boolean };
		};

		expect(res.status).toBe(200);
		expect(body.status).toBe('OFFLINE');
		expect(body.provenia.fallback_used).toBe(true);
	});

	it('operador: POST valida workspace_path e propaga X-Request-Id no fallback plan', async () => {
		mockAuth.mockResolvedValue({ user: { email: 'op@exemplo.com' } });
		globalThis.fetch = jest.fn().mockRejectedValue(new Error('backend offline'));

		const res = await POST(
			new Request('http://localhost:3000/api/sota/chrysalis', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-request-id': 'chr-plan-9',
				},
				body: JSON.stringify({
					workspace_path: 'frontend/src/app/page.tsx',
					content: 'const x = 1;',
					new_content: 'const x = 2;',
					mode: 'plan',
				}),
			}),
		);
		const body = (await res.json()) as { status: string; path: string };

		expect(res.status).toBe(200);
		expect(res.headers.get('cache-control')).toBe('no-store');
		expect(res.headers.get('x-request-id')).toBe('chr-plan-9');
		expect(body.status).toBe('SUCCESS');
		expect(body.path).toBe('frontend/src/app/page.tsx');
	});

	it('delegateReadonly impoe modo plan read-only sem mutacao', () => {
		expect(delegateReadonly('audit')).toEqual({
			task: 'audit',
			status: 'PLAN_ENFORCED',
			mode: 'plan',
		});
	});
});
