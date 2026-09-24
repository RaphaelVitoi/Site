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

export interface LayaSolverBridgePayload {
	target_solver: string;
	adapted_parameters: Record<string, unknown>;
	s1_prediction: LayaPredictionPayload;
	ruin_priority: number;
	framework_signals: Record<string, unknown>;
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
 * Modula parâmetros de solvers analíticos no frontend com base em sinais S1 da Laya.
 * Espelha fielmente a lógica de llm/laya_solver_adapter.py.
 */
export function adaptForSolverClient(
	solverName: string,
	prediction: LayaPredictionPayload,
	baseParameters?: Record<string, unknown>,
): LayaSolverBridgePayload {
	const solverKey = (solverName || 'universal-importer').toLowerCase().trim();
	const params: Record<string, unknown> = { ...(baseParameters || {}) };
	const signals: Record<string, unknown> = {};

	const rp = ruinPriorityFromLayaPrediction(prediction);
	const noul = prediction.noul ?? 0.0;
	const choice = prediction.choice ?? 'moderate';

	if (solverKey === 'pluribus') {
		const baseIters = Number(params['iterations'] ?? 500);
		if (noul > 0.7 || choice === 'complex') {
			params['iterations'] = Math.round(baseIters * 1.5);
			params['lambda_factor'] = Number((Number(params['lambda_factor'] ?? 1.2) * rp).toFixed(4));
		}
		signals['pluribus_depth_multiplier'] = choice === 'complex' ? 1.2 : 1.0;
	} else if (solverKey === 'deepstack') {
		const baseTol = Number(params['tolerance'] ?? 0.01);
		params['tolerance'] = Number((baseTol * (1.0 + noul * 0.5)).toFixed(6));
		signals['continual_resolving_tightened'] = noul > 0.5;
	} else if (solverKey === 'pmev-perspective') {
		params['ruin_prior'] = rp;
		signals['pmev_barrier_inflation'] = Number((((rp - 1.0) / 0.3) * 100.0).toFixed(2));
	} else if (solverKey === 'cfr-plus') {
		params['discount_alpha'] = Number((0.6 + 0.3 * (1.0 - noul)).toFixed(4));
		signals['cfr_regret_matching_plus'] = true;
		signals['cfr_discount_alpha'] = params['discount_alpha'];
	} else if (solverKey === 'monte-carlo') {
		const baseSamples = Number(params['simulations_count'] ?? 10000);
		if (noul > 0.6 || choice === 'complex') {
			params['simulations_count'] = Math.round(baseSamples * 1.5);
		}
		params['ruin_prior'] = rp;
		const baseConf = Number(params['confidence_level'] ?? 0.95);
		params['confidence_level'] = Number(Math.min(0.99, baseConf + (noul > 0.5 ? 0.02 : 0.0)).toFixed(4));
		signals['monte_carlo_sample_expansion'] = noul > 0.6 || choice === 'complex';
		signals['ruin_barrier_factor'] = rp;
	} else if (solverKey === 'timesfm' || solverKey === 'timesfm-forecaster') {
		const baseHorizon = Number(params['horizon'] ?? 5);
		if (noul > 0.5) {
			params['horizon'] = Math.round(baseHorizon * (1.0 + noul * 0.5));
		}
		params['quantile_focus'] = rp > 1.1 ? 'quantile_90' : 'quantile_50';
		const mode = String(params['mode'] ?? 'commercial').toLowerCase();
		params['preferred_model'] = mode === 'research' ? 'timesfm-3.0-330m' : 'timesfm-2.5-200m';
		signals['timesfm_volatility_prior'] = Number(noul.toFixed(4));
		signals['timesfm_ruin_adjusted_horizon'] = params['horizon'] ?? baseHorizon;
	} else if (solverKey === 'dream-rsi' || solverKey === 'dream-timesfm' || solverKey === 'pmev-dream') {
		const baseMargin = Number(params['pruning_margin'] ?? 0.02);
		params['pruning_margin'] = Number((baseMargin * rp).toFixed(4));
		params['s1_pruning_threshold'] = Number((0.2 + 0.15 * (1.0 - noul)).toFixed(4));
		params['fast_path_heuristic'] = choice !== 'complex' && noul < 0.4;
		signals['dream_rsi_pruning_tightened'] = rp > 1.1;
		signals['s1_pre_filtering_enabled'] = true;
	} else if (solverKey === 'prospect-theory') {
		const lambdaLoss = Number(params['loss_aversion_lambda'] ?? 2.25);
		params['loss_aversion_lambda'] = Number((lambdaLoss * rp).toFixed(4));
	} else if (solverKey === 'shannon-entropy') {
		signals['shannon_uncertainty_bits'] = Number(
			(noul > 0 ? -noul * Math.log2(Math.max(noul, 1e-6)) : 0.0).toFixed(4),
		);
	}

	signals['s1_confidence_score'] = prediction.score ?? 0.5;

	return {
		target_solver: solverKey,
		adapted_parameters: params,
		s1_prediction: prediction,
		ruin_priority: rp,
		framework_signals: signals,
		provenia: {
			engine_id: `laya-solver-adapter-${solverKey}-ts`,
			implementation_level: prediction.provenia?.weights_loaded ? 'trained-model' : (prediction.provenia?.implementation_level || 'simulation'),
			runtime_used: prediction.provenia?.runtime_used || 'nextjs-typescript',
			model_used: prediction.model_used,
			intended_model: CANONICAL_LAYA_MODEL,
			weights_loaded: Boolean(prediction.provenia?.weights_loaded),
			fallback_used: Boolean(prediction.provenia?.fallback_used),
			assumptions: [
				...(prediction.provenia?.assumptions || []),
				`solver-adapted=${solverKey}`,
				'laya-s1-ts-solver-adapter',
				'ruin-priority-injected',
			],
			limitations: [
				...(prediction.provenia?.limitations || []),
				'adapter-modulation-is-advisory',
			],
			units: ['ruin_priority', 'adaptation_factor'],
		},
	};
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