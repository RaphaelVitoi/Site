/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

const getToken = jest.fn();
jest.mock('next-auth/jwt', () => ({ getToken: (...args: unknown[]) => getToken(...args) }));
jest.mock('server-only', () => ({}));

import { proxy } from '@/proxy';

const pedido = (caminho: string) => new NextRequest(new URL(caminho, 'http://localhost:3000'));

describe('proxy da área do operador (FE-04)', () => {
	const envOriginal = { ...process.env };

	beforeEach(() => {
		process.env['AUTH_SECRET'] = 'segredo-de-teste-com-mais-de-32-caracteres';
		process.env['NEXUS_OPERATOR_EMAILS'] = 'operador@exemplo.com';
		getToken.mockReset();
	});

	afterAll(() => {
		process.env = envOriginal;
	});

	it('sem sessão manda ao login com a rota de volta', async () => {
		getToken.mockResolvedValue(null);
		const res = await proxy(pedido('/dashboard'));
		expect(res.status).toBe(307);
		expect(res.headers.get('location')).toBe('http://localhost:3000/login?callbackUrl=%2Fdashboard');
	});

	it('API sem sessão responde 401 em vez de redirecionar', async () => {
		getToken.mockResolvedValue(null);
		const res = await proxy(pedido('/api/vitoi/files/list'));
		expect(res.status).toBe(401);
		expect(res.headers.get('location')).toBeNull();
	});

	it('conta autenticada que não é operador não entra', async () => {
		getToken.mockResolvedValue({ email: 'aluno@gmail.com' });
		const res = await proxy(pedido('/dashboard/files'));
		expect(res.status).toBe(307);
		expect(res.headers.get('location')).toBe('http://localhost:3000/login?motivo=restrito');
	});

	it('rota de API do operador responde 403 em vez de redirecionar', async () => {
		getToken.mockResolvedValue({ email: 'aluno@gmail.com' });
		const res = await proxy(pedido('/api/vitoi/qualquer'));
		expect(res.status).toBe(403);
	});

	it('lista de operadores vazia não libera ninguém', async () => {
		process.env['NEXUS_OPERATOR_EMAILS'] = '';
		getToken.mockResolvedValue({ email: 'operador@exemplo.com' });
		const res = await proxy(pedido('/dashboard'));
		expect(res.headers.get('location')).toBe('http://localhost:3000/login?motivo=restrito');
	});

	it('operador declarado passa', async () => {
		getToken.mockResolvedValue({ email: 'Operador@Exemplo.com' });
		const res = await proxy(pedido('/dashboard'));
		expect(res.headers.get('location')).toBeNull();
		expect(res.headers.get('x-middleware-next')).toBe('1');
	});
});
