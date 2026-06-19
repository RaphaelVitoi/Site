'use client';

import { useMemo } from 'react';
import type { QuantumMetrics } from '../engine/types';

export function useInsolvencyRadar(apiQuantumMetrics: QuantumMetrics | null) {
	return useMemo(() => {
		if (!apiQuantumMetrics) return [];
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
				Ameaça: Math.min(100, Math.max(0, 50 - apiQuantumMetrics.riskAdvantage * 2.5)),
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
