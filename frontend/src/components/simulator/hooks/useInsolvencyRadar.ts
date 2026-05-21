'use client';

import { useMemo } from 'react';
import type { QuantumMetrics } from '../engine/types';

export function useInsolvencyRadar(apiQuantumMetrics: QuantumMetrics | null) {
	return useMemo(() => {
		if (!apiQuantumMetrics) return [];
		return [
			{
				subject: 'Pressão RIO',
				Ameaça: Math.min(100, Math.max(0, apiQuantumMetrics.rioMw * 20)),
			},
			{
				subject: 'Piso Dinâmico',
				Ameaça: Math.min(100, Math.max(0, Math.abs(apiQuantumMetrics.adjustedEvFold) * 30)),
			},
			{
				subject: 'Risco FGS',
				Ameaça: Math.min(100, Math.max(0, 100 - apiQuantumMetrics.expectativa * 50)),
			},
			{
				subject: 'Instabilidade',
				Ameaça: Math.min(100, Math.max(0, apiQuantumMetrics.marginInstability * 100)),
			},
			{ subject: 'Insolvência', Ameaça: apiQuantumMetrics.isSolvent ? 10 : 90 },
			{
				subject: 'Colapso de EV',
				Ameaça: Math.min(100, Math.max(0, 100 - apiQuantumMetrics.esperanca * 50)),
			},
		];
	}, [apiQuantumMetrics]);
}
