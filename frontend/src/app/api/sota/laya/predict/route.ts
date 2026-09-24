/**
 * @file route.ts
 * @path frontend/src/app/api/sota/laya/predict/route.ts
 * @role Rota Next.js App Router para Predição System-1 Laya Multilingual (Fase 4 SOTA).
 *
 * Expõe a inferência não-autorregressiva com contrato estrito de proveniência §4,
 * alinhado com data/engine_capabilities.json e laya-multilingual (mmBERT-base, 322M).
 *
 * @format
 */

import { NextResponse } from 'next/server';
import {
	CANONICAL_LAYA_MODEL,
	CANONICAL_LAYA_REPO,
	ruinPriorityFromIntencao,
	type LayaPredictionPayload,
} from '@/lib/laya';

export interface LayaPredictRequest {
	state?: string | Record<string, unknown>;
	questions?: Record<string, { type: 'choice' | 'score' | 'noul'; instructions?: string; criteria?: unknown }>;
	model?: string;
	max_len?: number;
}

export interface LayaPredictResponse {
	status: 'SUCCESS' | 'ERROR';
	prediction?: LayaPredictionPayload;
	error?: string;
}

function simulatePredict(
	state: string | Record<string, unknown>,
	questions?: Record<string, unknown>,
	modelOverride?: string,
): LayaPredictionPayload {
	const stateText = typeof state === 'string' ? state : JSON.stringify(state);
	const clean = stateText || '';
	const nonLatinMatch = clean.match(/[^\u0000-\u024F\u1E00-\u1EFF]/g);
	const nonLatinCount = nonLatinMatch ? nonLatinMatch.length : 0;
	const frac = clean.length > 0 ? nonLatinCount / clean.length : 0.0;
	const rp = ruinPriorityFromIntencao({ nao_latin_fraction_pct: Number((frac * 100).toFixed(2)) });
	const noul = Math.max(0.0, Math.min(1.0, Number((1.0 - (rp - 1.0) / 0.3).toFixed(4))));

	const targetModel = modelOverride || CANONICAL_LAYA_MODEL;

	return {
		answers: questions || {},
		model_used: targetModel,
		device: 'edge-runtime-ts',
		n_tokens: Math.min(8192, Math.max(1, Math.round(clean.length / 4))),
		latency_ms: 1.25,
		noul,
		choice: noul > 0.7 ? 'simple' : 'complex',
		score: noul,
		confidence: Math.max(0.5, noul),
		provenia: {
			engine_id: 'laya-s1-predict-ts-simulation',
			implementation_level: 'simulation',
			runtime_used: 'nextjs-typescript',
			model_used: CANONICAL_LAYA_REPO,
			intended_model: targetModel,
			weights_loaded: false,
			fallback_used: true,
			assumptions: [
				'laya-predict-ts-simulation',
				'canonical-model=multilingual',
				'shannon-entropy-parity',
			],
			limitations: [
				'typescript-edge-runtime-simulation',
				'no-torch-cuda-in-next-edge',
			],
			units: ['ms', 'tokens', 'probability', 'score'],
		},
	};
}

const LAYA_SERVICE_BASE = process.env['LAYA_SERVICE_URL'] || 'http://127.0.0.1:8192';

async function tryFetchUpstreamPredict(
	state: string | Record<string, unknown>,
	questions?: Record<string, unknown>,
	model?: string,
): Promise<LayaPredictionPayload | null> {
	try {
		const res = await fetch(`${LAYA_SERVICE_BASE}/predict`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				state: typeof state === 'string' ? state : JSON.stringify(state),
				questions,
				model: model || CANONICAL_LAYA_MODEL,
			}),
			signal: AbortSignal.timeout(1800),
			cache: 'no-store',
		});
		if (!res.ok) return null;
		const json = await res.json().catch(() => null);
		if (json?.status === 'SUCCESS' && json.prediction) {
			return json.prediction as LayaPredictionPayload;
		}
		return null;
	} catch {
		return null;
	}
}

export async function POST(request: Request): Promise<NextResponse<LayaPredictResponse>> {
	try {
		const body: LayaPredictRequest = await request.json().catch(() => ({}));
		const state = body.state || '';

		if (!state && (!body.questions || Object.keys(body.questions).length === 0)) {
			return NextResponse.json(
				{
					status: 'ERROR',
					error: 'Parâmetro `state` ou `questions` ausente na requisição.',
				},
				{ status: 400 },
			);
		}

		// 1. Tenta inferência no microserviço com pesos reais carregados
		const upstreamPrediction = await tryFetchUpstreamPredict(state, body.questions, body.model);
		if (upstreamPrediction) {
			return NextResponse.json({
				status: 'SUCCESS',
				prediction: upstreamPrediction,
			});
		}

		// 2. Simulação SOTA em TypeScript com proveniência §4 garantida (Fallback Heurístico)
		const prediction = simulatePredict(state, body.questions, body.model);

		return NextResponse.json({
			status: 'SUCCESS',
			prediction,
		});
	} catch (error) {
		return NextResponse.json(
			{
				status: 'ERROR',
				error: error instanceof Error ? error.message : 'Erro interno na rota Laya Predict',
			},
			{ status: 500 },
		);
	}
}
