export interface CfrRegretDiagnostic {
	iteration: number;
	metric: 'mean-positive-regret-proxy';
	value: number;
}

const DEFAULT_SAMPLE_INTERVAL = 300;
const DEFAULT_MAX_SAMPLES = 32;

/**
 * Retém somente amostras medidas pelo worker. Iteração 1 identifica um cenário
 * novo e reinicia a série; nenhum valor é sintetizado pelo painel.
 */
export function appendCfrRegretSample(
	history: CfrRegretDiagnostic[],
	diagnostic: CfrRegretDiagnostic,
	sampleInterval = DEFAULT_SAMPLE_INTERVAL,
	maxSamples = DEFAULT_MAX_SAMPLES,
): CfrRegretDiagnostic[] {
	if (
		!Number.isInteger(diagnostic.iteration) ||
		diagnostic.iteration < 1 ||
		!Number.isFinite(diagnostic.value) ||
		diagnostic.value < 0
	) {
		return history;
	}
	if (diagnostic.iteration === 1) {
		return [diagnostic];
	}
	if (diagnostic.iteration % sampleInterval !== 0) {
		return history;
	}
	const lastIteration = history.at(-1)?.iteration ?? 0;
	if (diagnostic.iteration <= lastIteration) {
		return history;
	}
	return [...history, diagnostic].slice(-maxSamples);
}
