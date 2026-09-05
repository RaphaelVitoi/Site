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
	model_used: string;
	license_tier: string;
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
