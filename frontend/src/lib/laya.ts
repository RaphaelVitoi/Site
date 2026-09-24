/**
 * @file laya.ts
 * @path frontend/src/lib/laya.ts
 * @role Funcao TypeScript paralela de ruin_priority_from_intencao (laya S1).
 *
 * Converte o sinal System-1 (nao_latin_fraction_pct) do frontend ao prior
 * de ruína (Teorema 2) no formato [1.0, 1.30].
 *
 * PARIDADE: Fronteira backend (engine/vitoi_perspective_engine.py) <-> frontend.
 * Escala [1.0, 1.30] = latent/ingles -> ruin_prior=1.0 (desativado).
 * nao-latin/incerto -> ruin_prior > 1.0 (conservador, aniquila variância).
 *
 * @see tests/test_laya_ruin_prior_etapa0.py | engine/vitoi_perspective_engine.py::ruin_prior
 * @format
 */

export const CANONICAL_LAYA_MODEL = 'multilingual';
export const CANONICAL_LAYA_REPO = 'convaiinnovations/laya-multilingual';

export interface IntencaoS1 {
	idioma?: string;
	script?: string;
	is_english?: boolean;
	modelo_sugerido?: string;
	nao_latin_fraction_pct?: number;
	reason?: string;
	confidence?: number;
	noul?: number;
	choice?: string;
	score?: number;
	provenia?: {
		engine_id?: string;
		implementation_level?: string;
		runtime_used?: string;
		model_used?: string;
		intended_model?: string;
		weights_loaded?: boolean;
		fallback_used?: boolean;
		assumptions?: string[];
		limitations?: string[];
		units?: string[];
	};
}

export interface LayaPredictionPayload {
	answers: Record<string, unknown>;
	model_used: string;
	device: string;
	n_tokens: number;
	latency_ms: number;
	noul: number | null;
	choice: string | null;
	score: number | null;
	confidence?: number | null;
	provenia: {
		engine_id: string;
		implementation_level: string;
		runtime_used: string;
		model_used: string;
		intended_model: string;
		weights_loaded: boolean;
		fallback_used: boolean;
		assumptions: string[];
		limitations: string[];
		units: string[];
	};
}

/**
 * Converte intencao_s1 do Laya em prior de ruína (1.0 a 1.30).
 *
 * - 1.0 = latim/inglês (desativado, backward-compat)
 * - >1.0 = não-latim/incerto -> prior conservador (aniquila variância, SOTA GOLD)
 *
 * O clamping de 0.30 excessivo foi medido:
 * - nao-latin=100% -> prior=1.30 (teto seguro de modulação conservador)
 */
export function ruinPriorityFromIntencao(intencaoS1: IntencaoS1 | null | undefined): number {
	if (!intencaoS1) return 1.0;
	const frac = (intencaoS1.nao_latin_fraction_pct ?? 0) / 100.0;
	const prior = 1.0 + frac * 0.3;
	return Math.max(1.0, Math.min(1.3, prior));
}

/**
 * Deriva prior de ruína (Teorema 2) a partir de predição Laya Multilingual calibrada.
 *
 * Se noul ou confidence estiverem disponíveis via RLCD, modula a barreira de ruína
 * diretamente pela incerteza calibrada da rede neural.
 */
export function ruinPriorityFromLayaPrediction(
	prediction: LayaPredictionPayload | null | undefined,
): number {
	if (!prediction) return 1.0;
	if (prediction.noul !== null && prediction.noul !== undefined) {
		const noul = Number(prediction.noul);
		const prior = 1.0 + (1.0 - noul) * 0.3;
		return Math.max(1.0, Math.min(1.3, prior));
	}
	if (prediction.confidence !== null && prediction.confidence !== undefined) {
		const conf = Number(prediction.confidence);
		const prior = 1.0 + (1.0 - conf) * 0.3;
		return Math.max(1.0, Math.min(1.3, prior));
	}
	return 1.0;
}

/**
 * Heavy unit. Test reference: engine/vitoi_perspective_engine.py::premioDeRiscoCanonico
 */
export const LAYA_TEST_REFERENCE = {
	testMapping: {
		latim: 1.0,
		misto: 1.15,
		naoLatim: 1.3,
		exagerado: 1.3,
	},
};