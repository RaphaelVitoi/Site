/**
 * IDENTITY: SOTA TimesFM Frontend Client
 * PATH: src/lib/timesfm-client.ts
 * ROLE: Cliente tipado de alta fidelidade para consumo de previsões TimesFM no ecossistema Site.
 */

export interface TimesFMForecastItem {
	target_name: string;
	history_length: number;
	forecast_horizon: number;
	mean_prediction: number[];
	quantile_10: number[];
	quantile_90: number[];
	/** Procedencia REAL do numero. Sem pesos carregados, declara a extrapolacao
	 * analitica -- nunca o id do modelo pretendido, que vive em `intended_model`. */
	model_used: string;
	license_tier: string;
	intended_model?: string;
	weights_loaded?: boolean;
}

export interface TimesFMForecastRequestPayload {
	series?: number[];
	series_dict?: Record<string, number[]>;
	horizon?: number;
	frequency_indicator?: number;
	target_name?: string;
	mode?: 'commercial_production' | 'research_benchmark';
	preferred_model_key?: 'timesfm-2.0-500m' | 'timesfm-2.5-200m' | 'timesfm-3.0-330m';
}

export interface TimesFMForecastResponsePayload {
	status: 'SUCCESS' | 'ERROR' | 'FORBIDDEN';
	forecast_type: 'univariate' | 'multivariate';
	results: Record<string, TimesFMForecastItem>;
	model_used: string;
	license_tier: string;
	intended_model?: string;
	weights_loaded?: boolean;
	error?: string;
}

/**
 * Executa uma requisicao de previsao temporal ao TimesFM.
 */
export async function fetchTimesFMForecast(
	payload: TimesFMForecastRequestPayload,
): Promise<TimesFMForecastResponsePayload> {
	const resp = await fetch('/api/sota/timesfm-forecast', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});

	if (!resp.ok) {
		const err = await resp.json().catch(() => ({ error: `HTTP ${resp.status}` }));
		throw new Error(err.error || `TimesFM Forecast failed with status ${resp.status}`);
	}

	return (await resp.json()) as TimesFMForecastResponsePayload;
}

export interface CfrConvergenceForecastPayload {
	status: 'CONVERGED' | 'CONVERGING' | 'PLATEAU_DETECTED' | 'INSUFFICIENT_HISTORY';
	current_exploitability: number;
	target_epsilon: number;
	estimated_iterations_to_target: number;
	mean_trajectory: number[];
	quantile_10: number[];
	quantile_90: number[];
	early_stopping_recommended: boolean;
	model_used: string;
	license_tier: string;
}

/**
 * Calculador client-side de convergencia CFR via TimesFM com fallback analitico deterministico.
 */
export function calculateClientCfrConvergence(
	regretHistory: number[],
	horizonIterations = 8,
	targetEpsilon = 0.001,
	preferredModel: 'timesfm-2.0-500m' | 'timesfm-2.5-200m' | 'timesfm-3.0-330m' = 'timesfm-2.5-200m',
): CfrConvergenceForecastPayload {
	const license =
		preferredModel === 'timesfm-3.0-330m'
			? 'TimesFM Non-Commercial License v1.0 (Apenas Pesquisa)'
			: 'Apache 2.0 (Permissivo / Comercial)';

	if (!regretHistory || regretHistory.length < 4) {
		return {
			status: 'INSUFFICIENT_HISTORY',
			current_exploitability: regretHistory?.length
				? (regretHistory.at(-1) ?? 1.0)
				: 1.0,
			target_epsilon: targetEpsilon,
			estimated_iterations_to_target: -1,
			mean_trajectory: [],
			quantile_10: [],
			quantile_90: [],
			early_stopping_recommended: false,
			model_used: `analytic-linear-extrapolation (sem pesos de google/${preferredModel})`,
			license_tier: license,
		};
	}

	const currentVal = regretHistory.at(-1) ?? 1.0;
	if (currentVal <= targetEpsilon) {
		return {
			status: 'CONVERGED',
			current_exploitability: currentVal,
			target_epsilon: targetEpsilon,
			estimated_iterations_to_target: 0,
			mean_trajectory: Array(horizonIterations).fill(currentVal),
			quantile_10: Array(horizonIterations).fill(currentVal),
			quantile_90: Array(horizonIterations).fill(currentVal),
			early_stopping_recommended: true,
			model_used: `analytic-linear-extrapolation (sem pesos de google/${preferredModel})`,
			license_tier: license,
		};
	}

	const windowSize = Math.min(regretHistory.length, 10);
	const recentSlice = regretHistory.slice(-windowSize);
	let diffSum = 0;
	for (let i = 1; i < recentSlice.length; i++) {
		diffSum += (recentSlice[i] ?? 0) - (recentSlice[i - 1] ?? 0);
	}
	const trend = recentSlice.length > 1 ? diffSum / (recentSlice.length - 1) : 0;
	const mean = regretHistory.reduce((a, b) => a + b, 0) / regretHistory.length;
	const variance =
		regretHistory.reduce((a, b) => a + (b - mean) ** 2, 0) / regretHistory.length;
	const volatility = Math.sqrt(variance) || 0.05;

	const meanTrajectory: number[] = [];
	const q10: number[] = [];
	const q90: number[] = [];
	let stepsToTarget = -1;

	for (let step = 1; step <= horizonIterations; step++) {
		const rawVal = currentVal + trend * step;
		const m = Math.max(0, Number(rawVal.toFixed(6)));
		const spread = 1.28 * volatility * Math.sqrt(step);
		meanTrajectory.push(m);
		q10.push(Math.max(0, Number((m - spread).toFixed(6))));
		q90.push(Math.max(0, Number((m + spread).toFixed(6))));

		if (stepsToTarget === -1 && m <= targetEpsilon) {
			stepsToTarget = step;
		}
	}

	const absTrend = Math.abs(trend);
	const isPlateau = absTrend < 1e-6;
	const earlyStop = stepsToTarget > 0 || isPlateau;
	const status =
		stepsToTarget > 0 ? 'CONVERGING' : isPlateau ? 'PLATEAU_DETECTED' : 'CONVERGING';

	return {
		status,
		current_exploitability: currentVal,
		target_epsilon: targetEpsilon,
		estimated_iterations_to_target: stepsToTarget,
		mean_trajectory: meanTrajectory,
		quantile_10: q10,
		quantile_90: q90,
		early_stopping_recommended: earlyStop,
		model_used: `analytic-linear-extrapolation (sem pesos de google/${preferredModel})`,
		license_tier: license,
	};
}

