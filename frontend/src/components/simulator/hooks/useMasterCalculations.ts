'use client';

import { computeQuantumMetrics, type PerspectivaResult } from '@/lib/perspectiva';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Scenario } from '../engine/types';

interface UseMasterCalculationsParams {
	scenario: Scenario;
	aggressionFactor: number;
	safeHeroInvested: number;
	safeCurrentPot: number;
	quantumPerspectiva: PerspectivaResult | null;
}

/**
 * IDENTITY: Hook de Cálculos Mestre (SOTA v4.6)
 * PATH: src/components/simulator/hooks/useMasterCalculations.ts
 * ROLE: Orquestra Web Workers de Equity e sincronização Bayesiana Nexus.
 */
export function useMasterCalculations({
	scenario,
	aggressionFactor,
	safeHeroInvested,
	safeCurrentPot,
	quantumPerspectiva,
}: UseMasterCalculationsParams) {
	const [bayesianWinProb, setBayesianWinProb] = useState<number | null>(null);
	const [nativeRangeMetric, setNativeRangeMetric] = useState<{
		equity: number;
		isCalculating: boolean;
	}>({ equity: 50, isCalculating: false });

	const equityWorkerRef = useRef<Worker | null>(null);

	useEffect(() => {
		// SOTA FIX: Instanciação estrita via module para o WebWorker.
		// O path é relativo à pasta hooks, então subimos uma pasta para workers.
		const worker = new Worker(new URL('../workers/equity.worker.ts', import.meta.url), {
			type: 'module',
		});

		worker.onmessage = (e: MessageEvent<{ equity?: number; error?: string; id: number }>) => {
			if (e.data.error || e.data.equity === undefined) {
				console.warn('[SotaEcosystem] Entropia WASM:', e.data.error || 'Missing equity in payload');
				setNativeRangeMetric((prev) => ({ ...prev, isCalculating: false }));
			} else {
				setNativeRangeMetric({ equity: e.data.equity, isCalculating: false });
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
				board: ''
			});
		}

		return () => worker.terminate();
	}, [scenario.stacks]);

	// SOTA v6: Sincronizacao da Mente Bayesiana via Nexus Proxy
	useEffect(() => {
		const fetchBayesian = async () => {
			try {
				const response = await fetch('/api/sota/bayesian-range', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						prior_equity: nativeRangeMetric.equity / 100,
						action_strength: Math.min(0.99, Math.max(0.01, aggressionFactor / 3)),
						range_density: 0.5,
						pot_odd_pressure: safeHeroInvested / (safeCurrentPot + safeHeroInvested),
					}),
				});
				const data = await response.json();
				if (data.posterior_win_prob !== undefined) {
					setBayesianWinProb(data.posterior_win_prob * 100);
				}
			} catch (e) {
				console.warn('[SOTA] Falha ao sincronizar Mente Bayesiana:', e);
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
