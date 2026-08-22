const DEFAULT_GEMMA_ORIGIN = 'http://127.0.0.1:17043';

export type GemmaRelayConfig =
	| { ok: true; upstreamUrl: string; apiSecret: string }
	| { ok: false; error: string };

/**
 * Resolve somente configuracao de servidor. Nenhuma variavel NEXT_PUBLIC_ e
 * aceita: o navegador nunca recebe a credencial do processo de inferencia.
 */
export function resolveGemmaRelayConfig(
	environment: NodeJS.ProcessEnv = process.env,
): GemmaRelayConfig {
	const apiSecret = environment['API_SECRET_TOKEN'];
	if (!apiSecret) {
		return { ok: false, error: 'Servico Gemma indisponivel: credencial do relay nao configurada.' };
	}

	const configuredOrigin = environment['SOTA_GEMMA_PROXY_URL'] || DEFAULT_GEMMA_ORIGIN;
	try {
		const origin = new URL(configuredOrigin);
		if (
			(origin.protocol !== 'http:' && origin.protocol !== 'https:') ||
			origin.username ||
			origin.password ||
			origin.pathname !== '/' ||
			origin.search ||
			origin.hash
		) {
			throw new Error('origem invalida');
		}
		return { ok: true, upstreamUrl: new URL('/generate', origin).toString(), apiSecret };
	} catch {
		return { ok: false, error: 'Servico Gemma indisponivel: SOTA_GEMMA_PROXY_URL invalida.' };
	}
}
