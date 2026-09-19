'use client';

import { computeQuantumMetrics, type PerspectivaResult } from '@/lib/perspectiva';
import { useEffect, useMemo, useState } from 'react';
import type { Scenario } from '../solver/types';
import type { InsolvencyMetrics } from '../workers/insolvencyProtocol';

interface UseMasterCalculationsParams {
	scenario: Scenario;
	aggressionFactor: number;
	safeHeroInvested: number;
	safeCurrentPot: number;
	quantumPerspectiva: PerspectivaResult | null;
	/** Resultado de "Calcular cenário". Cada resultado novo vira a equity de entrada uma vez. */
	insolvencyMatrixData?: InsolvencyMetrics | null;
}

interface NativeRangeMetric {
	equity: number;
	isCalculating: boolean;
}

/** Equity de partida de um cenário novo: mão aleatória contra aleatória, 50% por definição. */
export const EQUITY_INICIAL = 50;

/** Espera depois da última mudança antes de consultar o backend bayesiano (SIM-05). */
export const ESPERA_BAYESIANA_MS = 250;

/**
 * IDENTITY: Hook de Cálculos Mestre (SOTA v7.0 GOLD)
 * PATH: src/components/simulator/hooks/useMasterCalculations.ts
 * ROLE: Equity de entrada, sincronização Bayesiana Nexus e métricas quânticas.
 *
 * Até 2026-09-17 este hook subia um worker de equity a cada cenário para calcular `random` contra `random` com 50 mil
 * iterações, descartava o resultado por ler o campo errado da resposta e gravava 50 (SIM-02). A constante agora é
 * escrita direto, e explicitamente, na troca de cenário.
 */
export function useMasterCalculations({
	scenario,
	aggressionFactor,
	safeHeroInvested,
	safeCurrentPot,
	quantumPerspectiva,
	insolvencyMatrixData = null,
}: Readonly<UseMasterCalculationsParams>) {
	const [bayesianWinProb, setBayesianWinProb] = useState<number | null>(null);
	const [nativeRangeMetric, setNativeRangeMetric] = useState<NativeRangeMetric>({
		equity: EQUITY_INICIAL,
		isCalculating: false,
	});

	// Cenário novo recomeça da equity inicial. A chave é o conteúdo dos stacks, não a identidade do array.
	const chaveCenario = scenario.stacks?.join('|') ?? '';
	useEffect(() => {
		setNativeRangeMetric({ equity: EQUITY_INICIAL, isCalculating: false });
	}, [chaveCenario]);

	// O resultado do cálculo entra na equity uma vez por resultado, e o slider volta a mandar depois dele. Até
	// 2026-09-17 os painéis liam winRate por cima do valor manual para sempre, e o slider travava (SIM-02).
	useEffect(() => {
		const winRate = insolvencyMatrixData?.winRate;
		if (winRate === undefined || !Number.isFinite(winRate)) return;
		setNativeRangeMetric({ equity: Number((winRate * 100).toFixed(1)), isCalculating: false });
	}, [insolvencyMatrixData]);

	// SOTA v6: Sincronização da Mente Bayesiana via Nexus Proxy e Motor Síncrono
	useEffect(() => {
		const prior = nativeRangeMetric.equity / 100;
		const alpha = Math.min(0.99, Math.max(0.01, aggressionFactor / 3));
		const pOdd = safeHeroInvested / Math.max(0.1, safeCurrentPot + safeHeroInvested);
		const pActionWin = 1 - (1 - alpha) * 0.75;
		const pActionLoss = alpha * Math.max(0.1, 1 - pOdd);
		const num = pActionWin * prior;
		const den = num + pActionLoss * (1 - prior);
		const localProb = den > 0 ? (num / den) * 100 : prior * 100;
		setBayesianWinProb(Number(localProb.toFixed(1)));

		if (nativeRangeMetric.isCalculating) return;

		// Um POST por pausa de digitação, e só a resposta do pedido vigente escreve (SIM-05). Antes eram 8 POSTs para 8
		// teclas, e uma resposta atrasada podia sobrescrever a mais nova.
		const controle = new AbortController();
		const temporizador = setTimeout(async () => {
			try {
				const response = await fetch('/api/sota/bayesian-range', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						prior_equity: prior,
						action_strength: alpha,
						range_density: 0.5,
						pot_odd_pressure: pOdd,
					}),
					signal: controle.signal,
				});
				if (!response.ok) return;
				const data = await response.json();
				if (!controle.signal.aborted && Number.isFinite(data?.posterior_win_prob)) {
					setBayesianWinProb(Number((data.posterior_win_prob * 100).toFixed(1)));
				}
			} catch {
				// Cancelado ou backend inalcançável: o valor local já está na tela.
			}
		}, ESPERA_BAYESIANA_MS);

		return () => {
			clearTimeout(temporizador);
			controle.abort();
		};
	}, [nativeRangeMetric.equity, aggressionFactor, safeHeroInvested, safeCurrentPot, nativeRangeMetric.isCalculating]);

	const apiQuantumMetrics = useMemo(() => {
		if (!quantumPerspectiva || !Array.isArray(scenario?.stacks) || scenario.stacks.length < 2)
			return null;
		try {
			if (scenario.stacks.some((s) => typeof s !== 'number' || Number.isNaN(s))) return null;
			return computeQuantumMetrics(quantumPerspectiva);
		} catch (e) {
			console.warn(
				'[SOTA] Fricção evitada: Motor quântico aguardando simetria topológica (Hidratação Pendente).',
				e,
			);
			return null;
		}
	}, [quantumPerspectiva, scenario.stacks]);

	return {
		bayesianWinProb,
		nativeRangeMetric,
		apiQuantumMetrics,
		setNativeRangeMetric,
	};
}
