/**
 * @file route.ts
 * @path frontend/src/app/api/sota/laya/status/route.ts
 * @role Rota de telemetria e integridade para status do microserviço de pesos Laya S1.
 *
 * Protocolo Chico SOTA v8.0 GOLD.
 * Inspeciona a conectividade com o microserviço FastAPI (Porta 8192) ou backend (Porta 17042),
 * permitindo ao frontend saber em tempo real se os pesos reais de 322M estão disponíveis.
 *
 * @format
 */

import { NextResponse } from 'next/server';
import { CANONICAL_LAYA_MODEL, CANONICAL_LAYA_REPO } from '@/lib/laya';

export const runtime = 'nodejs';

export interface LayaStatusResponse {
	status: 'ONLINE' | 'OFFLINE';
	weights_loaded: boolean;
	model: string;
	canonical_repo: string;
	cuda_available?: boolean;
	cpu_override_active?: boolean;
	latency_ms?: number;
	reason?: string;
}

const LAYA_SERVICE_BASE = process.env['LAYA_SERVICE_URL'] || 'http://127.0.0.1:8192';

export async function GET(): Promise<NextResponse<LayaStatusResponse>> {
	const t0 = performance.now();
	try {
		const res = await fetch(`${LAYA_SERVICE_BASE}/health`, {
			method: 'GET',
			signal: AbortSignal.timeout(3000),
			cache: 'no-store',
		});

		const latency = Number((performance.now() - t0).toFixed(2));

		if (res.ok) {
			const data = await res.json().catch(() => ({}));
			return NextResponse.json({
				status: 'ONLINE',
				weights_loaded: Boolean(data.weights_ready ?? false),
				model: CANONICAL_LAYA_MODEL,
				canonical_repo: data.model || CANONICAL_LAYA_REPO,
				cuda_available: Boolean(data.cuda_available),
				cpu_override_active: Boolean(data.cpu_override_active),
				latency_ms: latency,
			});
		}

		return NextResponse.json({
			status: 'OFFLINE',
			weights_loaded: false,
			model: CANONICAL_LAYA_MODEL,
			canonical_repo: CANONICAL_LAYA_REPO,
			reason: `Serviço respondeu com status HTTP ${res.status}`,
			latency_ms: latency,
		});
	} catch (error) {
		const latency = Number((performance.now() - t0).toFixed(2));
		const msg = error instanceof Error ? error.message : 'Conexão recusada';
		return NextResponse.json({
			status: 'OFFLINE',
			weights_loaded: false,
			model: CANONICAL_LAYA_MODEL,
			canonical_repo: CANONICAL_LAYA_REPO,
			reason: `Microserviço indisponível na porta 8192 (${msg})`,
			latency_ms: latency,
		});
	}
}
