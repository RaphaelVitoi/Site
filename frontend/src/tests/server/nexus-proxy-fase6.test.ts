/**
 * FASE 6 / opção C (Tier 0, 2026-09-30): o gateway passa a enviar o token do
 * usuário ao backend, e a identidade deixa de ser um conceito sem LASTRO.
 *
 * IDENTITY: O header `X-User-Token` no contrato gateway→backend
 * PATH: src/tests/server/nexus-proxy-fase6.test.ts
 * ROLE: Provar que o token é enviado, que a sessão o exige, e que a sua
 * AUSÊNCIA não abre nem fecha nada.
 *
 * Medido antes da mudança: o gateway enviava só `Authorization` com
 * `API_SECRET_TOKEN`. O backend respondia 401 ou 403 e nunca conseguia dizer
 * "esta requisição é do usuário X" — a identidade de produto exigia um
 * `SUPABASE_JWT_SECRET` que não existe nesta máquina, e as 22 rotas de produto
 * respondiam 500.
 *
 * A regra que este arquivo fixa: `Authorization` decide a PORTA,
 * `X-User-Token` decide a PESSOA. São headers separados porque são credenciais
 * de naturezas diferentes; no mesmo header, uma delas precisaria ser escolhida
 * por convenção, e convenção de segurança é apenas uma regra sem teste.
 *
 * Jest, e não vitest: `frontend/package.json:22` declara `"test": "jest"`, e
 * `jest.config.js` mapeia `@/` para `src/`. A primeira versão deste arquivo
 * estava em vitest — que o projeto tem como devDependency, mas cujo `include`
 * aponta para `skills/`, não para o frontend. Medido: `vitest run` respondeu
 * "No test files found". Um teste na ferramenta errada não roda em lugar
 * nenhum, que é a forma mais cara de um teste que parece existir.
 */

import { encaminharAoNexus } from '@/lib/server/nexus-proxy';
import { auth } from '@/auth';

/**
 * O `next/server` falha ao carregar em `jest-environment-jsdom`: o
 * `NextRequest` estende a `Request` do runtime do Node, e a polyfill do jsdom
 * não serve. O erro vem de dentro de `next/server.js`, antes de qualquer
 * código nosso — então o mock abaixo é do MÓDULO INTEIRO, e o que o teste
 * exercita é `encaminharAoNexus` com um `NextResponse` mínimo.
 *
 * `jest.mock('server-only', ...)` é o padrão do próprio projeto
 * (`src/tests/security/auth-secret.test.ts:1`).
 */
jest.mock('server-only', () => ({}));
jest.mock('next/server', () => ({
	NextResponse: {
		json: (corpo: unknown, init?: { status?: number }) =>
			new Response(JSON.stringify(corpo), {
				status: init?.status ?? 200,
				headers: { 'content-type': 'application/json' },
			}),
	},
}));
jest.mock('@/auth', () => ({ auth: jest.fn() }));
jest.mock('@/lib/api-contract', () => ({ buildNexusServerUrl: (c: string) => `http://nexus.local${c}` }));
jest.mock('next-auth/jwt', () => ({ getToken: jest.fn() }));
jest.mock('@/lib/server/auth-secret', () => ({ resolveAuthSecret: () => 'segredo-de-teste' }));

const SESSAO = { user: { id: 'usuario-uuid-0001', email: 'pessoa@exemplo.com' } };
const mockAuth = auth as jest.MockedFunction<typeof auth>;

type Capturado = { headers?: Record<string, string>; chamado: boolean };

/**
 * Stub de `Request`.
 *
 * `Request` não existe em `jest-environment-jsdom` — medido: `ReferenceError:
 * Request is not defined`. O que `encaminharAoNexus` usa do `Request` é
 * `req.json()` e o objeto passado a `obterToken`; um stub com esses dois é
 * suficiente e não depende de polyfill.
 */
function reqDeTeste() {
	return {
		json: async () => ({ body: 'x' }),
		url: 'http://site.local/x',
		method: 'POST',
		headers: new Headers(),
	} as unknown as Request;
}

/** Captura os headers com que o gateway chamaria o backend. */
function capturarFetch(): Capturado {
	const c: Capturado = { chamado: false };
	global.fetch = jest.fn(async (_url: unknown, init?: { headers?: Record<string, string> }) => {
		c.chamado = true;
		c.headers = init?.headers;
		return new Response(JSON.stringify({ status: 'SUCCESS' }), {
			status: 200,
			headers: { 'content-type': 'application/json' },
		});
	}) as unknown as typeof fetch;
	return c;
}

async function encaminhar(
	obterToken: () => Promise<string | null>,
	sessao: unknown = SESSAO,
) {
	// O cenário de sessão é parâmetro, e NÃO é sobrescrito aqui: a primeira
	// versão fixava a sessão dentro do helper, e o teste de "sem sessão" recebia
	// 200 em vez de 401 — porque o helper religava a sessão logo antes de
	// encaminhar. Medido. O helper configura; o teste decide o cenário.
	mockAuth.mockResolvedValue(sessao as never);
	return encaminharAoNexus(reqDeTeste(), '/api/v1/timesfm/forecast', {
		obterSessao: auth,
		rotulo: 'TimesFM',
		obterToken,
	});
}

describe('FASE 6 — X-User-Token no contrato gateway→backend', () => {
	beforeEach(() => {
		process.env['API_SECRET_TOKEN'] = 'credencial-de-servico-de-teste';
	});

	afterEach(() => {
		delete process.env['API_SECRET_TOKEN'];
		jest.restoreAllMocks();
	});

	it('envia X-User-Token quando há token válido', async () => {
		const c = capturarFetch();
		await encaminhar(async () => 'header.payload.assinatura');
		expect(c.headers?.['X-User-Token']).toBe('header.payload.assinatura');
	});

	it('mantém Authorization com a credencial de serviço', async () => {
		// As duas credenciais coexistem. Se o token do usuário SUBSTITUísse a
		// credencial de serviço, o backend perderia a distinção entre rota de
		// operador e rota de produto — que é o que `rota_e_de_produto` protege.
		const c = capturarFetch();
		await encaminhar(async () => 'header.payload.assinatura');
		expect(c.headers?.['Authorization']).toContain('credencial-de-servico-de-teste');
	});

	it('segue SEM o header quando não há token — e ainda funciona', async () => {
		const c = capturarFetch();
		const resp = await encaminhar(async () => null);
		expect(c.headers?.['X-User-Token']).toBeUndefined();
		expect(resp.status).toBe(200);
	});

	it('a ausência do token não impede o encaminhamento', async () => {
		// Teste de não-regressão da opção C. A IDENTIDADE é opcional; o portão
		// de PORTA (sessão + credencial) continua obrigatório. Se este falhar,
		// a opção C virou uma indisponibilidade.
		capturarFetch();
		const resp = await encaminhar(async () => null);
		expect(resp.status).toBe(200);
	});

	it('sem sessão, NÃO envia token e devolve 401', async () => {
		const c = capturarFetch();
		const resp = await encaminhar(async () => 'header.payload.assinatura', null);
		expect(resp.status).toBe(401);
		expect(c.chamado).toBe(false);
	});

	it('sem credencial de serviço, devolve 503 sem tocar o backend', async () => {
		delete process.env['API_SECRET_TOKEN'];
		const c = capturarFetch();
		const resp = await encaminhar(async () => 'header.payload.assinatura');
		expect(resp.status).toBe(503);
		expect(c.chamado).toBe(false);
	});

	it('uma exceção ao ler o token não derruba a rota', async () => {
		// `getToken` pode levantar por cookie corrompido. Propagar o erro
		// transformaria sessão expirada em indisponibilidade do produto.
		capturarFetch();
		const resp = await encaminhar(async () => {
			throw new Error('cookie invalido');
		});
		expect(resp.status).toBe(200);
	});
});
