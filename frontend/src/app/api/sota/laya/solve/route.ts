/**
 * @file route.ts
 * @path frontend/src/app/api/sota/laya/solve/route.ts
 * @role Rota Next.js App Router para Solver Bridge System-1 (Laya Multilingual).
 *
 * Expõe a modulação paramétrica S1 de solvers analíticos e frameworks
 * (CFR+, Monte Carlo, TimesFM 2.5/3.0, Google Dream-RSI, Pluribus, DeepStack)
 * diretamente para componentes React e Web Workers no frontend.
 *
 * @format
 */

import { NextResponse } from 'next/server';
import {
	CANONICAL_LAYA_MODEL,
	CANONICAL_LAYA_REPO,
	adaptForSolverClient,
	ruinPriorityFromIntencao,
	type LayaPredictionPayload,
	type LayaSolverBridgePayload,
} from '@/lib/laya';

export interface LayaSolveRequest {
	solver_name?: string;
	state?: string | Record<string, unknown>;
	base_parameters?: Record<string, unknown>;
	questions?: Record<string, { type: 'choice' | 'score' | 'noul'; instructions?: string; criteria?: unknown }>;
	prediction?: LayaPredictionPayload;
	model?: string;
}

export interface LayaSolveResponse {
	status: 'SUCCESS' | 'ERROR';
	bridge_result?: LayaSolverBridgePayload;
	error?: string;
}

function simulatePredictForSolve(
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
		latency_ms: 1.15,
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
				'solver-bridge-coupled',
			],
			limitations: [
				'typescript-edge-runtime-simulation',
				'advisory-modulation',
			],
			units: ['ms', 'tokens', 'probability', 'score'],
		},
	};
}

const LAYA_SERVICE_BASE = process.env['LAYA_SERVICE_URL'] || 'http://127.0.0.1:8192';

async function tryFetchUpstreamSolve(
	solverName: string,
	state: string | Record<string, unknown>,
	baseParameters?: Record<string, unknown>,
	model?: string,
): Promise<LayaSolverBridgePayload | null> {
	try {
		const res = await fetch(`${LAYA_SERVICE_BASE}/solve`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				solver_name: solverName,
				state: typeof state === 'string' ? state : JSON.stringify(state),
				base_parameters: baseParameters,
				model: model || CANONICAL_LAYA_MODEL,
			}),
			signal: AbortSignal.timeout(1800),
			cache: 'no-store',
		});
		if (!res.ok) return null;
		const json = await res.json().catch(() => null);
		if (json?.status === 'SUCCESS' && json.bridge_result) {
			return json.bridge_result as LayaSolverBridgePayload;
		}
		if (json?.status === 'SUCCESS' && json.solver_bridge) {
			return json.solver_bridge as LayaSolverBridgePayload;
		}
		return null;
	} catch {
		return null;
	}
}

export async function POST(request: Request): Promise<NextResponse<LayaSolveResponse>> {
	try {
		const body: LayaSolveRequest = await request.json().catch(() => ({}));
		const solverName = body.solver_name || 'cfr-plus';
		const state = body.state || '';

		if (!state && !body.prediction) {
			return NextResponse.json(
				{
					status: 'ERROR',
					error: 'Parâmetro `state` ou `prediction` é obrigatório na requisição de modulação.',
				},
				{ status: 400 },
			);
		}

		// 1. Se já fornecida predição direta (ex: testes ou worker), utiliza diretamente
		if (body.prediction) {
			const bridgeResult = adaptForSolverClient(solverName, body.prediction, body.base_parameters);
			return NextResponse.json({
				status: 'SUCCESS',
				bridge_result: bridgeResult,
			});
		}

		// 2. Tenta inferência com pesos reais no microserviço FastAPI/CUDA (Porta 8192)
		const upstreamResult = await tryFetchUpstreamSolve(solverName, state, body.base_parameters, body.model);
		if (upstreamResult) {
			return NextResponse.json({
				status: 'SUCCESS',
				bridge_result: upstreamResult,
			});
		}

		// 3. Fallback Heurístico S1 Determinístico (Garantia de Disponibilidade)
		const prediction = simulatePredictForSolve(state, body.questions, body.model);
		const bridgeResult = adaptForSolverClient(solverName, prediction, body.base_parameters);

		return NextResponse.json({
			status: 'SUCCESS',
			bridge_result: bridgeResult,
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Erro interno na rota /api/sota/laya/solve';
		return NextResponse.json(
			{
				status: 'ERROR',
				error: message,
			},
			{ status: 500 },
		);
	}
}
