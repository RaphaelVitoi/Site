/**
 * @file route.ts
 * @path frontend/src/app/api/sota/laya/route.ts
 * @role Rota Next.js para a Engine de Decisão System-1 (Laya S1).
 *
 * Expõe classificação zero-download (script, idioma, familia de modelo,
 * nao_latin_fraction_pct) com contrato estrito de proveniência §4.
 */

import { NextResponse } from 'next/server';

export interface LayaRouteRequest {
	text?: string;
	query?: string;
	description?: string;
}

export interface ProveniaData {
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
}

export interface LayaRouteResponse {
	status: 'SUCCESS' | 'ERROR';
	idioma: string;
	script: string;
	is_english: boolean;
	modelo_sugerido: string;
	nao_latin_fraction_pct: number;
	reason: string;
	provenia: ProveniaData;
	error?: string;
}

// Heurística TypeScript nativa paralela (paridade frontend para o caso de fallback/offline puro)
function heuristicClassify(text: string = ''): Omit<LayaRouteResponse, 'status'> {
	const clean = text;
	const nonLatinMatch = clean.match(/[^\u0000-\u024F\u1E00-\u1EFF]/g);
	const nonLatinCount = nonLatinMatch ? nonLatinMatch.length : 0;
	const frac = clean.length > 0 ? nonLatinCount / clean.length : 0.0;
	const isEn = /[A-Za-z]{4,}/.test(clean);
	const script = frac <= 0.30 ? 'latin' : 'non-latin';
	const idioma = isEn && script === 'latin' ? 'english' : 'multilingual';
	const modeloSugerido = idioma === 'english' ? 'small-english' : 'multilingual';

	return {
		idioma,
		script,
		is_english: isEn,
		modelo_sugerido: modeloSugerido,
		nao_latin_fraction_pct: Number((frac * 100).toFixed(2)),
		reason: `typescript-heuristic-fallback(frac=${frac.toFixed(3)},en_like=${isEn})`,
		provenia: {
			engine_id: 'laya-s1-frontend-ts',
			implementation_level: 'simulation',
			runtime_used: 'nextjs-typescript',
			model_used: '',
			intended_model: idioma,
			weights_loaded: false,
			fallback_used: true,
			assumptions: ['typescript-regex-script-detector', 'frontend-parity'],
			limitations: ['not-python-laya-router', 'shannon-script-only'],
			units: ['script', 'language', 'probability'],
		},
	};
}

export async function POST(request: Request): Promise<NextResponse<LayaRouteResponse>> {
	try {
		const body: LayaRouteRequest = await request.json().catch(() => ({}));
		const text = body.text || body.query || body.description || '';

		if (!text) {
			return NextResponse.json(
				{
					status: 'ERROR',
					idioma: 'multilingual',
					script: 'unknown',
					is_english: false,
					modelo_sugerido: 'multilingual',
					nao_latin_fraction_pct: 0.0,
					reason: 'empty-input',
					provenia: {
						engine_id: 'laya-s1-frontend-ts',
						implementation_level: 'simulation',
						runtime_used: 'nextjs-typescript',
						model_used: '',
						intended_model: 'multilingual',
						weights_loaded: false,
						fallback_used: true,
						assumptions: ['empty-input-default'],
						limitations: ['no-text-provided'],
						units: ['script', 'language', 'probability'],
					},
					error: 'Nenhum texto fornecido no payload (esperado text, query ou description).',
				},
				{ status: 400 }
			);
		}

		// Tenta delegar para o backend Python (via subprocesso ou bridge local se configurado),
		// ou utiliza a paridade TypeScript nativa robusta com proveniência §4.
		// Como a rota roda no servidor Next.js, a paridade TS garante zero latência e resiliência.
		const result = heuristicClassify(text);

		return NextResponse.json({
			status: 'SUCCESS',
			...result,
		});
	} catch (err: unknown) {
		const errorMessage = err instanceof Error ? err.message : String(err);
		return NextResponse.json(
			{
				status: 'ERROR',
				idioma: 'multilingual',
				script: 'unknown',
				is_english: false,
				modelo_sugerido: 'multilingual',
				nao_latin_fraction_pct: 0.0,
				reason: `error: ${errorMessage}`,
				provenia: {
					engine_id: 'laya-s1-frontend-ts',
					implementation_level: 'simulation',
					runtime_used: 'nextjs-typescript',
					model_used: '',
					intended_model: 'multilingual',
					weights_loaded: false,
					fallback_used: true,
					assumptions: ['error-fallback'],
					limitations: [errorMessage],
					units: ['script', 'language', 'probability'],
				},
				error: errorMessage,
			},
			{ status: 500 }
		);
	}
}

export async function GET(): Promise<NextResponse> {
	return NextResponse.json({
		status: 'SUCCESS',
		engine: 'laya-s1-router',
		version: '0.3.4',
		description: 'Laya System-1 Typed-Decisions Router (zero-download parity endpoint)',
		endpoints: {
			POST: 'Enviar { text | query | description } para classificação S1 com provenia §4',
		},
	});
}
