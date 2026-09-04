'use client';

import { useMemo } from 'react';

export interface InsolvencyMetricsInput {
	rioMw: number;
	adjustedEvFold: number;
	riskAdvantage?: number | undefined;
	marginInstability: number;
	isSolvent: boolean;
	perspectiva: number;
}

export function useInsolvencyRadar(apiQuantumMetrics: InsolvencyMetricsInput | null | undefined) {
	return useMemo(() => {
		if (!apiQuantumMetrics) return [];
		const ra = apiQuantumMetrics.riskAdvantage ?? 0;
		return [
			{
				subject: 'Pressão RIO',
				Ameaça: Math.min(100, Math.max(0, apiQuantumMetrics.rioMw * 25)),
			},
			{
				subject: 'Erosão RP',
				Ameaça: Math.min(100, Math.max(0, Math.abs(apiQuantumMetrics.adjustedEvFold) * 40)),
			},
			{
				subject: 'Risk Disparity',
				// Vantagem de Risco alta = Ameaça baixa. 
				// Se RA < 0 (Desvantagem), a ameaça sobe.
				Ameaça: Math.min(100, Math.max(0, 50 - ra * 2.5)),
			},
			{
				subject: 'Instabilidade',
				Ameaça: Math.min(100, Math.max(0, apiQuantumMetrics.marginInstability * 120)),
			},
			{ subject: 'Insolvência', Ameaça: apiQuantumMetrics.isSolvent ? 15 : 95 },
			{
				subject: 'Vulnerabilidade',
				Ameaça: Math.min(100, Math.max(0, 80 - apiQuantumMetrics.perspectiva * 3)),
			},
		];
	}, [apiQuantumMetrics]);
}
