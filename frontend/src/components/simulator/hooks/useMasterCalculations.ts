'use client';

import { computeQuantumMetrics, type PerspectivaResult } from '@/lib/perspectiva';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Scenario } from '../solver/types';

interface UseMasterCalculationsParams {
	scenario: Scenario;
	aggressionFactor: number;
	safeHeroInvested: number;
	safeCurrentPot: number;
	quantumPerspectiva: PerspectivaResult | null;
}

interface NativeRangeMetric {
	equity: number;
	isCalculating: boolean;
}

/**
 * IDENTITY: Hook de Cálculos Mestre (SOTA v7.0 GOLD)
 * PATH: src/components/simulator/hooks/useMasterCalculations.ts
 * ROLE: Orquestra Web Workers de Equity e sincronização Bayesiana Nexus.
 */
function extractWorkerEquity(data: {
	equity?: number;
	result?: { hero_equity?: number; villain_equity?: number };
}): number {
	const heroEquity = data.result?.hero_equity;
	if (heroEquity !== undefined) {
		return heroEquity > 1 ? heroEquity : heroEquity * 100;
	}
	return data.equity ?? 50;
}

export function useMasterCalculations({
	scenario,
	aggressionFactor,
	safeHeroInvested,
	safeCurrentPot,
	quantumPerspectiva,
}: Readonly<UseMasterCalculationsParams>) {
	const [bayesianWinProb, setBayesianWinProb] = useState<number | null>(null);
	const [nativeRangeMetric, setNativeRangeMetric] = useState<NativeRangeMetric>({
		equity: 50,
		isCalculating: false,
	});

	const equityWorkerRef = useRef<Worker | null>(null);

	// 1. Worker Lifecycle (Persistente)
	useEffect(() => {
		// SOTA FIX: Instanciação estrita via module para o WebWorker.
		// O path é relativo à pasta hooks, então subimos uma pasta para workers.
		const worker = new Worker(new URL('../workers/equity.worker.ts', import.meta.url), {
			type: 'module',
		});

		worker.onmessage = (
			e: MessageEvent<{
				equity?: number;
				error?: string;
				id?: number;
				result?: { hero_equity?: number; villain_equity?: number };
			}>
		) => {
			if (e.data.error) {
				setNativeRangeMetric((prev) => ({ ...prev, isCalculating: false }));
			} else {
				const extractedEquity = extractWorkerEquity(e.data);
				setNativeRangeMetric({ equity: extractedEquity, isCalculating: false });
			}
		};
		equityWorkerRef.current = worker;

		// SOTA FIX: Acionando o Motor Fantasma
		// O worker precisa ser alimentado inicialmente para sair da trava de 50%.
		if (Array.isArray(scenario.stacks) && scenario.stacks.length > 0) {
			setNativeRangeMetric((prev) => ({ ...prev, isCalculating: true }));
			worker.postMessage({
				heroRange: 'random',
				villainRange: 'random',
				board: '',
			});
		}

		return () => worker.terminate();
	}, [scenario.stacks]);

	// SOTA v6: Sincronização da Mente Bayesiana via Nexus Proxy e Motor Síncrono
	useEffect(() => {
		const prior = (nativeRangeMetric.equity || 50) / 100;
		const alpha = Math.min(0.99, Math.max(0.01, aggressionFactor / 3));
		const pOdd = safeHeroInvested / Math.max(0.1, safeCurrentPot + safeHeroInvested);
		const pActionWin = 1 - (1 - alpha) * 0.75;
		const pActionLoss = alpha * Math.max(0.1, 1 - pOdd);
		const num = pActionWin * prior;
		const den = num + pActionLoss * (1 - prior);
		const localProb = den > 0 ? (num / den) * 100 : prior * 100;
		setBayesianWinProb(Number(localProb.toFixed(1)));

		const fetchBayesian = async () => {
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
				});
				if (response.ok) {
					const data = await response.json();
					if (data.posterior_win_prob !== undefined) {
						setBayesianWinProb(Number((data.posterior_win_prob * 100).toFixed(1)));
					}
				}
			} catch {
				// Fallback síncrono local já está ativo
			}
		};
		if (!nativeRangeMetric.isCalculating) fetchBayesian();
	}, [
		nativeRangeMetric.equity,
		aggressionFactor,
		safeHeroInvested,
		safeCurrentPot,
		nativeRangeMetric.isCalculating,
	]);

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

