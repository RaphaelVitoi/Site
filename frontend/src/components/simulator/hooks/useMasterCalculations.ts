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
 * IDENTITY: Hook de CÃ¡lculos Mestre (SOTA v7.0 GOLD)
 * PATH: src/components/simulator/hooks/useMasterCalculations.ts
 * ROLE: Orquestra Web Workers de Equity e sincronizaÃ§Ã£o Bayesiana Nexus.
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
		// SOTA FIX: InstanciaÃ§Ã£o estrita via module para o WebWorker.
		// O path Ã© relativo Ã  pasta hooks, entÃ£o subimos uma pasta para workers.
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
				const extractedEquity =
					e.data.result?.hero_equity !== undefined
						? e.data.result.hero_equity > 1
							? e.data.result.hero_equity
							: e.data.result.hero_equity * 100
						: e.data.equity ?? 50;
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
			} catch (e) {
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
				'[SOTA] FricÃ§Ã£o evitada: Motor quÃ¢ntico aguardando simetria topolÃ³gica (HidrataÃ§Ã£o Pendente).',
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

