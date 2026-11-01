/**
 * IDENTITY: Gráfico de Radar de Insolvência (SOTA v8.0 GOLD)
 * PATH: src/components/simulator/ui/InsolvencyRadar.tsx
 * ROLE: Visualização vetorial de tensões, colapso de equidade e vetores críticos de insolvência.
 *       Componentizado para permitir carregamento dinâmico e otimização de bundle.
 */

'use client';

import { useMemo } from 'react';
import {
	Legend,
	PolarAngleAxis,
	PolarGrid,
	PolarRadiusAxis,
	Radar,
	RadarChart,
	Tooltip as RechartsTooltip,
	ResponsiveContainer,
} from 'recharts';

export interface InsolvencyRadarProps {
	data: {
		subject: string;
		Ameaça: number;
		GTO?: number;
	}[];
	showComparison?: boolean;
}

export function InsolvencyRadar({ data, showComparison = false }: Readonly<InsolvencyRadarProps>) {
	const maxThreat = useMemo(() => {
		if (!data || data.length === 0) return null;
		return data.reduce((prev, curr) => (curr.Ameaça > prev.Ameaça ? curr : prev), data[0]!);
	}, [data]);

	if (!data || data.length === 0) {
		return (
			<div className="flex items-center justify-center h-full text-text-darker text-[0.7rem] font-black uppercase tracking-[0.5em] animate-pulse">
				Processando Assinatura Bayesiana...
			</div>
		);
	}

	return (
		<div className="relative w-full h-full flex flex-col justify-between">
			{/* BADGE DE VETOR CRÍTICO DOMINANTE */}
			{maxThreat && (
				<div className="absolute top-1 left-2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/90 border border-rose-500/30 text-[0.55rem] font-mono font-bold uppercase shadow-lg">
					<span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
					<span className="text-text-muted">Vetor Crítico:</span>
					<span className="text-rose-400 font-black">{maxThreat.subject} ({maxThreat.Ameaça.toFixed(0)}%)</span>
				</div>
			)}

			<ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
				<RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
					<defs>
						<linearGradient id="gradInsolvency" x1="0" y1="0" x2="1" y2="1">
							<stop offset="5%" stopColor="var(--color-accent-rose)" stopOpacity={0.7} />
							<stop offset="95%" stopColor="var(--color-accent-rose)" stopOpacity={0.1} />
						</linearGradient>
						<linearGradient id="gradGtoBaseline" x1="0" y1="0" x2="1" y2="1">
							<stop offset="5%" stopColor="var(--color-accent-emerald)" stopOpacity={0.4} />
							<stop offset="95%" stopColor="var(--color-accent-emerald)" stopOpacity={0.05} />
						</linearGradient>
						<filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
							<feGaussianBlur stdDeviation="3" result="blur" />
							<feComposite in="SourceGraphic" in2="blur" operator="over" />
						</filter>
					</defs>
					<PolarGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
					<PolarAngleAxis
						dataKey="subject"
						tick={{
							fill: '#94a3b8',
							fontSize: 10,
							fontWeight: 900,
							fontFamily: 'var(--font-mono)',
							letterSpacing: '0.15em',
						}}
					/>
					<PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
					<Radar
						name="Ameaça (%)"
						dataKey="Ameaça"
						stroke="var(--color-accent-rose)"
						strokeWidth={3.5}
						fill="url(#gradInsolvency)"
						fillOpacity={0.5}
						isAnimationActive={false}
					/>
					{showComparison && (
						<Radar
							name="GTO Ótimo (%)"
							dataKey="GTO"
							stroke="var(--color-accent-emerald)"
							strokeWidth={2}
							strokeDasharray="3 3"
							fill="url(#gradGtoBaseline)"
							fillOpacity={0.2}
							isAnimationActive={false}
						/>
					)}
					<RechartsTooltip
						isAnimationActive={false}
						allowEscapeViewBox={{ x: true, y: true }}
						wrapperStyle={{ zIndex: 1000 }}
						contentStyle={{
							backgroundColor: '#020617',
							border: '1px solid rgba(244,63,94,0.4)',
							borderRadius: '20px',
							boxShadow: '0 30px 60px rgba(0,0,0,0.9)',
							padding: '16px',
						}}
						itemStyle={{
							color: '#fb7185',
							fontWeight: '900',
							textTransform: 'uppercase',
							fontSize: '11px',
							letterSpacing: '0.1em',
						}}
					/>
					<Legend
						position="bottom"
						wrapperStyle={{
							paddingTop: '16px',
							fontSize: '0.7rem',
							fontWeight: '900',
							textTransform: 'uppercase',
							letterSpacing: '0.3em',
							color: 'var(--color-text-muted)',
						}}
					/>
				</RadarChart>
			</ResponsiveContainer>
		</div>
	);
}

export default InsolvencyRadar;
