/**
 * Guard da pendência pend-2026-09-16-logger-frontend-sem-credencial.
 * O navegador envia a telemetria de UI ao gateway de mesma origem, nunca ao backend direto,
 * e em fatias que respeitam o teto do backend.
 */
import { LOGS_GATEWAY_PATH, logger, MAX_EVENTS_PER_REQUEST } from './logger';

describe('logger do navegador', () => {
	const originalFetch = globalThis.fetch;

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	it('envia ao gateway de mesma origem, não ao backend Python', async () => {
		const chamadas: Array<[string, RequestInit]> = [];
		globalThis.fetch = jest.fn((url: string, init: RequestInit) => {
			chamadas.push([url, init]);
			return Promise.resolve(new Response(null, { status: 200 }));
		}) as unknown as typeof fetch;

		logger.info('Teste', 'evento');
		await Promise.resolve();

		expect(chamadas).toHaveLength(1);
		const [url, init] = chamadas[0]!;
		expect(url).toBe(LOGS_GATEWAY_PATH);
		expect(url).not.toContain('17042');
		expect(init.credentials).toBe('same-origin');
		const corpo = JSON.parse(String(init.body)) as { events: unknown[] };
		expect(corpo.events.length).toBeLessThanOrEqual(MAX_EVENTS_PER_REQUEST);
	});

	it('o gateway exige sessão e encaminha à rota de logs do backend', () => {
		const fs = jest.requireActual<typeof import('node:fs')>('node:fs');
		const path = jest.requireActual<typeof import('node:path')>('node:path');
		const fonte = fs.readFileSync(
			path.join(__dirname, '..', 'app', 'api', 'v1', 'logs', 'frontend', 'route.ts'),
			'utf8',
		);
		expect(fonte).toContain("encaminharAoNexus(req, '/api/logs/frontend'");
		expect(fonte).toContain('obterSessao: auth');
	});
});
