import { resolveGemmaRelayConfig } from './gemma-relay';

describe('resolveGemmaRelayConfig', () => {
	it('fails closed when the private relay credential is absent', () => {
		expect(resolveGemmaRelayConfig({})).toEqual({
			ok: false,
			error: 'Servico Gemma indisponivel: credencial do relay nao configurada.',
		});
	});

	it('uses the loopback Gemma origin without exposing the credential to callers', () => {
		expect(resolveGemmaRelayConfig({ API_SECRET_TOKEN: 'server-only' })).toEqual({
			ok: true,
			upstreamUrl: 'http://127.0.0.1:17043/generate',
			apiSecret: 'server-only',
		});
	});

	it('rejects a configured origin with path, query, credentials, or unsupported protocol', () => {
		for (const upstream of [
			'https://relay.example.test/private',
			'https://relay.example.test/?token=leak',
			'https://user:password@relay.example.test',
			'file:///tmp/gemma',
		]) {
			expect(
				resolveGemmaRelayConfig({ API_SECRET_TOKEN: 'server-only', SOTA_GEMMA_PROXY_URL: upstream }),
			).toEqual({ ok: false, error: 'Servico Gemma indisponivel: SOTA_GEMMA_PROXY_URL invalida.' });
		}
	});
});
