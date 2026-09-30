/**
 * @jest-environment node
 */

// FASE 6 / opção C (2026-09-30): `nexus-proxy.ts` passou a importar
// `next-auth/jwt`, que é ESM puro. O jest não converte módulo de `node_modules`
// por padrão, e sem este mock a SUÍTE INTEIRA não carrega —
// "Must use import to load ES Module: next-auth/jwt.js", 0 testes executados.
//
// MEDIDO que a alternativa não resolve: declarar `transformIgnorePatterns` no
// `jest.config.js` é inútil aqui, porque o `next/jest` constrói a config final
// e sobrescreve a chave. E a outra via — `require(esm)` nativo — exige Node
// >= 24.9, contra os `engines.node >= 22` que o projeto declara.
//
// O mock é o menor escopo que funciona, e é o mesmo padrão que o projeto já
// usa em `auth-secret.test.ts:1` (`jest.mock('server-only', ...)`). Este teste
// não exercita o `getToken` — ele verifica o encaminhamento e a exigência de
// sessão, e o `obterToken` é injetável justamente para isso.
jest.mock('next-auth/jwt', () => ({ getToken: jest.fn(async () => null) }));

import { encaminharAoNexus, identificadorDoVisitante } from '@/lib/server/nexus-proxy';

const comSessao = () => Promise.resolve({ user: { id: 'u1' } });
const semSessao = () => Promise.resolve(null);

const pedido = (body: unknown = { series: [10, 20, 30] }) =>
	new Request('http://localhost:3000/api/sota/timesfm-forecast', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});

describe('Proxy autenticado das rotas SOTA', () => {
	const originalFetch = globalThis.fetch;
	const originalToken = process.env['API_SECRET_TOKEN'];

	beforeEach(() => {
		process.env['API_SECRET_TOKEN'] = 'token-de-teste';
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		if (originalToken === undefined) delete process.env['API_SECRET_TOKEN'];
		else process.env['API_SECRET_TOKEN'] = originalToken;
	});

	it('com sessão encaminha ao backend com a credencial do ambiente e propaga a resposta', async () => {
		const dados = { status: 'SUCCESS', forecast: [100.5, 102.3] };
		globalThis.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve(dados) });

		const res = await encaminharAoNexus(pedido(), '/api/v1/timesfm/forecast', { obterSessao: comSessao, rotulo: 'TimesFM' });

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual(dados);
		expect(globalThis.fetch).toHaveBeenCalledWith(
			expect.stringContaining('/api/v1/timesfm/forecast'),
			expect.objectContaining({
				method: 'POST',
				cache: 'no-store',
				headers: expect.objectContaining({ Authorization: 'Bearer token-de-teste' }),
			}),
		);
	});

	it('sem sessão responde 401 e não toca o backend', async () => {
		globalThis.fetch = jest.fn();
		const res = await encaminharAoNexus(pedido(), '/api/v1/pmev/heatmap', { obterSessao: semSessao, rotulo: 'PMev Heatmap' });
		expect(res.status).toBe(401);
		expect(globalThis.fetch).not.toHaveBeenCalled();
	});

	it('sem credencial configurada responde 503 e nunca usa credencial literal', async () => {
		delete process.env['API_SECRET_TOKEN'];
		globalThis.fetch = jest.fn();
		const res = await encaminharAoNexus(pedido(), '/api/v1/timesfm/forecast', { obterSessao: comSessao, rotulo: 'TimesFM' });
		expect(res.status).toBe(503);
		expect(globalThis.fetch).not.toHaveBeenCalled();
	});

	it('backend inalcançável vira 503 estruturado, não 500', async () => {
		globalThis.fetch = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));
		// O detalhe vai para o log do servidor, não para o corpo: o aviso é esperado e vira asserção.
		const aviso = jest.spyOn(console, 'warn').mockImplementation(() => {});
		const res = await encaminharAoNexus(pedido(), '/api/v1/timesfm/forecast', { obterSessao: comSessao, rotulo: 'TimesFM' });
		expect(res.status).toBe(503);
		const corpo = await res.json();
		expect(corpo).toEqual({ status: 'ERROR', error: 'TimesFM: backend inalcançável.' });
		expect(JSON.stringify(corpo)).not.toContain('ECONNREFUSED');
		expect(aviso).toHaveBeenCalledWith(expect.stringContaining('backend inalcançável'), expect.any(Error));
		aviso.mockRestore();
	});

	it('identifica o visitante ao backend por hash opaco, distinto por usuário (BK-06)', async () => {
		globalThis.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({}) });
		await encaminharAoNexus(pedido(), '/api/v1/timesfm/forecast', { obterSessao: comSessao, rotulo: 'TimesFM' });

		const enviado = (globalThis.fetch as jest.Mock).mock.calls[0][1].headers['X-Nexus-Client-Id'];
		expect(enviado).toMatch(/^[0-9a-f]{32}$/);
		expect(enviado).not.toContain('u1');
		expect(identificadorDoVisitante({ user: { id: 'u2' } })).not.toBe(enviado);
		expect(identificadorDoVisitante({ user: {} })).toBeNull();
		expect(identificadorDoVisitante(null)).toBeNull();
	});

	it('as rotas não carregam mais o literal de credencial', () => {
		const fs = jest.requireActual<typeof import('node:fs')>('node:fs');
		const path = jest.requireActual<typeof import('node:path')>('node:path');
		for (const rota of ['timesfm-forecast', 'pmev-heatmap']) {
			const fonte = fs.readFileSync(path.join(__dirname, '..', '..', 'app', 'api', 'sota', rota, 'route.ts'), 'utf8');
			expect(fonte).not.toMatch(/dummy-secret|API_SECRET_TOKEN'\]\s*\|\|/);
			expect(fonte).toContain('obterSessao: auth');
		}
	});
});
