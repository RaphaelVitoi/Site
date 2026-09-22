/**
 * @jest-environment node
 */
jest.mock('server-only', () => ({}));
jest.mock('@/auth', () => ({ auth: jest.fn() }));

import { encaminharGetDeOperador, encaminharPostJsonDeOperador } from './operator-gateway';

describe('gateway de operador (FE-06)', () => {
	const originalFetch = globalThis.fetch;
	const envOriginal = { ...process.env };
	const operador = () => Promise.resolve({ user: { email: 'op@exemplo.com' } });

	beforeEach(() => {
		process.env['NEXUS_OPERATOR_EMAILS'] = 'op@exemplo.com';
		process.env['API_SECRET_TOKEN'] = 'token-de-teste';
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		process.env = { ...envOriginal };
	});

	it('sem sessão: 401 sem tocar o backend', async () => {
		globalThis.fetch = jest.fn();
		const res = await encaminharGetDeOperador('/api/files/list', {}, () => Promise.resolve(null));
		expect(res.status).toBe(401);
		expect(globalThis.fetch).not.toHaveBeenCalled();
	});

	it('conta que não é operador: 403 sem tocar o backend', async () => {
		globalThis.fetch = jest.fn();
		const res = await encaminharGetDeOperador('/api/files/list', {}, () => Promise.resolve({ user: { email: 'aluno@gmail.com' } }));
		expect(res.status).toBe(403);
		expect(globalThis.fetch).not.toHaveBeenCalled();
	});

	it('operador: caminho fixo, só parâmetros declarados, credencial de serviço e cabeçalhos de conteúdo', async () => {
		globalThis.fetch = jest.fn().mockResolvedValue(
			new Response('svg', {
				status: 200,
				headers: { 'content-type': 'image/svg+xml', 'content-security-policy': 'sandbox', 'set-cookie': 'x=1' },
			}),
		);
		const res = await encaminharGetDeOperador('/api/files/view', { path: 'docs/a b.svg', raw: 'true' }, operador);

		const [url, init] = (globalThis.fetch as jest.Mock).mock.calls[0] as [URL, RequestInit];
		expect(url.pathname).toBe('/api/files/view');
		expect(url.searchParams.get('path')).toBe('docs/a b.svg');
		expect(url.searchParams.get('raw')).toBe('true');
		expect((init.headers as Record<string, string>)['Authorization']).toBe('Bearer token-de-teste');
		expect(res.headers.get('content-security-policy')).toBe('sandbox');
		expect(res.headers.get('set-cookie')).toBeNull();
		expect(await res.text()).toBe('svg');
	});

	it('backend fora do ar: 503 sem mensagem de socket', async () => {
		globalThis.fetch = jest.fn().mockRejectedValue(new Error('connect ECONNREFUSED 127.0.0.1:17042'));
		jest.spyOn(console, 'warn').mockImplementation(() => {});
		const res = await encaminharGetDeOperador('/api/files/list', {}, operador);
		expect(res.status).toBe(503);
		expect(await res.text()).not.toContain('ECONNREFUSED');
	});

	it('POST de operador envia JSON ao destino fixo com credencial de serviço', async () => {
		globalThis.fetch = jest.fn().mockResolvedValue(new Response('{"status":"SUCCESS","id":"DASH-1"}', {
			status: 200,
			headers: { 'content-type': 'application/json' },
		}));
		const body = { id: 'DASH-1', description: 'Operar tarefa', status: 'pending' };
		const res = await encaminharPostJsonDeOperador('/add', body, operador);
		const [url, init] = (globalThis.fetch as jest.Mock).mock.calls[0] as [URL, RequestInit];
		expect(url.pathname).toBe('/add');
		expect(init.method).toBe('POST');
		expect(JSON.parse(String(init.body))).toEqual(body);
		expect((init.headers as Record<string, string>)['Authorization']).toBe('Bearer token-de-teste');
		expect(res.status).toBe(200);
	});

	it('POST sem identidade de operador não alcança o backend', async () => {
		globalThis.fetch = jest.fn();
		const res = await encaminharPostJsonDeOperador('/add', {}, () => Promise.resolve({ user: { email: 'aluno@gmail.com' } }));
		expect(res.status).toBe(403);
		expect(globalThis.fetch).not.toHaveBeenCalled();
	});
});
