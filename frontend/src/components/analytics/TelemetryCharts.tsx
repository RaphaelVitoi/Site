'use client';

/**
 * IDENTITY: Telemetry & EV Loss Risk Zone Density Analytics v7.0 GOLD
 * PATH: src/components/analytics/TelemetryCharts.tsx
 * ROLE: Visualizar a densidade estocástica de perdas de EV e classificar decisões
 *       nas 4 zonas de risco ICM (Core Call, Marginal, Risky Fold, Death Zone).
 * AESTHETIC: SOTA Gold Standard (Visual Symmetry, Glassmorphism, Tabular Nums).
 */

import React, { useMemo, useState } from 'react';
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';

export interface TelemetryPoint {
	evLoss: number;
	isCorrect?: boolean;
	createdAt?: string | Date;
}

type TelemetryViewMode = 'TIMELINE' | 'HISTOGRAM' | 'ZONES';

interface RiskZoneMetrics {
	key: 'CORE_CALL' | 'MARGINAL_CALL' | 'RISKY_FOLD' | 'DEATH_FOLD';
	name: string;
	desc: string;
	color: string;
	bgClass: string;
	borderClass: string;
	textClass: string;
	count: number;
	pct: number;
	totalLoss: number;
}

export function TelemetryCharts({ data }: Readonly<{ data: TelemetryPoint[] }>) {
	const [viewMode, setViewMode] = useState<TelemetryViewMode>('HISTOGRAM');

	// Classificação das 4 Zonas de Risco ICM baseadas na perda de EV
	const analytics = useMemo(() => {
		const total = data.length || 1;
		let coreCount = 0;
		let marginalCount = 0;
		let riskyCount = 0;
		let deathCount = 0;

		let coreLoss = 0;
		let marginalLoss = 0;
		let riskyLoss = 0;
		let deathLoss = 0;

		let correctCount = 0;
		let totalEvLoss = 0;
		let maxLoss = 0;

		// Bins para o histograma de densidade
		const bins: Record<string, { range: string; count: number; color: string }> = {
			bin0: { range: '0.0 bb (Ideal)', count: 0, color: '#10b981' },
			bin1: { range: '0.1 - 0.5 bb', count: 0, color: '#f59e0b' },
			bin2: { range: '0.6 - 1.5 bb', count: 0, color: '#6366f1' },
			bin3: { range: '1.6 - 3.0 bb', count: 0, color: '#a855f7' },
			bin4: { range: '> 3.0 bb (Crítico)', count: 0, color: '#f43f5e' },
		};

		data.forEach((d) => {
			const loss = Math.max(0, d.evLoss || 0);
			totalEvLoss += loss;
			if (loss > maxLoss) maxLoss = loss;
			if (d.isCorrect || loss === 0) correctCount++;

			// Classificação nas Zonas
			if (loss === 0) {
				coreCount++;
				coreLoss += loss;
				bins.bin0.count++;
			} else if (loss <= 0.5) {
				marginalCount++;
				marginalLoss += loss;
				bins.bin1.count++;
			} else if (loss <= 2.0) {
				riskyCount++;
				riskyLoss += loss;
				if (loss <= 1.5) {
					bins.bin2.count++;
				} else {
					bins.bin3.count++;
				}
			} else {
				deathCount++;
				deathLoss += loss;
				bins.bin4.count++;
			}
		});

		const zones: RiskZoneMetrics[] = [
			{
				key: 'CORE_CALL',
				name: 'Zona Core (+EV / Ótima)',
				desc: 'Decisões perfeitas com zero erosão de equidade real.',
				color: '#10b981',
				bgClass: 'bg-emerald-950/40',
				borderClass: 'border-emerald-500/30',
				textClass: 'text-emerald-400',
				count: coreCount,
				pct: Number(((coreCount / total) * 100).toFixed(1)),
				totalLoss: Number(coreLoss.toFixed(2)),
			},
			{
				key: 'MARGINAL_CALL',
				name: 'Zona Marginal (Break-Even)',
				desc: 'Pequenas imprecisões com perda residual (<= 0.5 bb).',
				color: '#f59e0b',
				bgClass: 'bg-amber-950/40',
				borderClass: 'border-amber-500/30',
				textClass: 'text-amber-400',
				count: marginalCount,
				pct: Number(((marginalCount / total) * 100).toFixed(1)),
				totalLoss: Number(marginalLoss.toFixed(2)),
			},
			{
				key: 'RISKY_FOLD',
				name: 'Zona Risco ICM (Dano Estrutural)',
				desc: 'Violações do limiar de sobrevivência (0.5 - 2.0 bb).',
				color: '#818cf8',
				bgClass: 'bg-indigo-950/40',
				borderClass: 'border-indigo-500/30',
				textClass: 'text-indigo-400',
				count: riskyCount,
				pct: Number(((riskyCount / total) * 100).toFixed(1)),
				totalLoss: Number(riskyLoss.toFixed(2)),
			},
			{
				key: 'DEATH_FOLD',
				name: 'Death Zone (Insolvência Crítica)',
				desc: 'Catástrofe de equidade real e suicídio de torneio (> 2.0 bb).',
				color: '#f43f5e',
				bgClass: 'bg-rose-950/40',
				borderClass: 'border-rose-500/30',
				textClass: 'text-rose-400',
				count: deathCount,
				pct: Number(((deathCount / total) * 100).toFixed(1)),
				totalLoss: Number(deathLoss.toFixed(2)),
			},
		];

		const histogramData = Object.values(bins);
		const accuracy = Number(((correctCount / total) * 100).toFixed(1));
		const meanLoss = Number((totalEvLoss / total).toFixed(2));

		return {
			zones,
			histogramData,
			accuracy,
			meanLoss,
			maxLoss: Number(maxLoss.toFixed(2)),
			totalDecisions: data.length,
		};
	}, [data]);

	const formattedTimelineData = useMemo(() => {
		return data.map((d, i) => ({
			name: `#${i + 1}`,
			evLoss: d.evLoss,
			status: d.isCorrect ? 'CORRETO' : 'DESVIO',
		}));
	}, [data]);

	return (
		<div className="flex flex-col gap-6 w-full">
			{/* Barra Superior: Métricas Globais e Alternador de Abas */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
				<div className="flex items-center gap-6">
					<div>
						<span className="text-[0.6rem] font-mono uppercase tracking-widest text-text-muted block">
							Acurácia GTO
						</span>
						<span className="font-mono text-lg font-black text-emerald-400">
							{analytics.accuracy}%
						</span>
					</div>
					<div className="w-px h-8 bg-white/10" />
					<div>
						<span className="text-[0.6rem] font-mono uppercase tracking-widest text-text-muted block">
							Média Perda EV
						</span>
						<span className="font-mono text-lg font-black text-accent-amber">
							{analytics.meanLoss} bb
						</span>
					</div>
					<div className="w-px h-8 bg-white/10" />
					<div>
						<span className="text-[0.6rem] font-mono uppercase tracking-widest text-text-muted block">
							Pior Decisão
						</span>
						<span className="font-mono text-lg font-black text-rose-400">
							-{analytics.maxLoss} bb
						</span>
					</div>
				</div>

				{/* Botões de Alternância de Visualização */}
				<div className="flex rounded-2xl overflow-hidden border border-white/10 bg-black/40 p-1 shadow-inner">
					{(
						[
							{ id: 'HISTOGRAM', label: 'Densidade (EV)' },
							{ id: 'ZONES', label: 'Zonas ICM' },
							{ id: 'TIMELINE', label: 'Temporal' },
						] as const
					).map((tab) => (
						<button
							key={tab.id}
							type="button"
							onClick={() => setViewMode(tab.id)}
							className={`px-3 py-1.5 text-[0.6rem] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
								viewMode === tab.id
									? 'bg-accent-indigo/20 text-accent-indigo-light border border-accent-indigo/40 shadow-lg shadow-indigo-500/10'
									: 'text-text-muted hover:text-white border border-transparent'
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>
			</div>

			{/* Modo 1: Histograma de Densidade de Perda de EV */}
			{viewMode === 'HISTOGRAM' && (
				<div className="space-y-4">
					<div className="w-full h-64">
						<ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
							<BarChart
								data={analytics.histogramData}
								margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
							>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="rgba(255,255,255,0.05)"
									vertical={false}
								/>
								<XAxis
									dataKey="range"
									stroke="#475569"
									tick={{
										fill: '#94a3b8',
										fontSize: 9,
										fontWeight: 800,
										fontFamily: 'var(--font-mono)',
									}}
									axisLine={false}
									tickLine={false}
								/>
								<YAxis
									stroke="#475569"
									tick={{
										fill: '#94a3b8',
										fontSize: 10,
										fontWeight: 800,
										fontFamily: 'var(--font-mono)',
									}}
									axisLine={false}
									tickLine={false}
								/>
								<Tooltip
									isAnimationActive={false}
									contentStyle={{
										backgroundColor: '#020617',
										borderColor: 'rgba(99,102,241,0.3)',
										borderRadius: '12px',
										boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
									}}
									itemStyle={{
										fontWeight: 900,
										fontFamily: 'var(--font-mono)',
										fontSize: '12px',
										color: '#fff',
									}}
									labelStyle={{
										color: '#94a3b8',
										fontWeight: 800,
										marginBottom: '4px',
										fontSize: '10px',
									}}
								/>
								<Bar dataKey="count" name="Decisões" radius={[6, 6, 0, 0]} isAnimationActive={false}>
									{analytics.histogramData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>
					<p className="text-[0.65rem] text-text-muted font-mono uppercase tracking-wider text-center">
						Distribuição de frequência das decisões por faixa de dano financeiro ($L_\text&#123;EV&#125;$)
					</p>
				</div>
			)}

			{/* Modo 2: Classificação nas 4 Zonas de Risco ICM */}
			{viewMode === 'ZONES' && (
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{analytics.zones.map((zone) => (
						<div
							key={zone.key}
							className={`p-4 rounded-2xl border ${zone.bgClass} ${zone.borderClass} flex flex-col gap-3 shadow-inner`}
						>
							<div className="flex items-center justify-between">
								<span className={`text-[0.68rem] font-black uppercase tracking-wider ${zone.textClass}`}>
									{zone.name}
								</span>
								<span className="font-mono text-sm font-black text-white">
									{zone.pct}%
								</span>
							</div>
							<p className="text-[0.62rem] text-slate-400 m-0 leading-relaxed font-sans">
								{zone.desc}
							</p>
							<div className="flex justify-between items-center border-t border-white/5 pt-2 font-mono text-[0.6rem] text-text-muted">
								<span>{zone.count} mãos registradas</span>
								<span className={zone.textClass}>Perda Total: {zone.totalLoss} bb</span>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Modo 3: Linha do Tempo de Decisões */}
			{viewMode === 'TIMELINE' && (
				<div className="w-full h-64">
					<ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
						<LineChart
							data={formattedTimelineData}
							margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
						>
							<CartesianGrid
								strokeDasharray="3 3"
								stroke="rgba(255,255,255,0.05)"
								vertical={false}
							/>
							<XAxis
								dataKey="name"
								stroke="#475569"
								tick={{
									fill: '#94a3b8',
									fontSize: 9,
									fontWeight: 800,
									fontFamily: 'var(--font-mono)',
								}}
								axisLine={false}
								tickLine={false}
							/>
							<YAxis
								stroke="#475569"
								tick={{
									fill: '#94a3b8',
									fontSize: 10,
									fontWeight: 800,
									fontFamily: 'var(--font-mono)',
								}}
								axisLine={false}
								tickLine={false}
							/>
							<Tooltip
								isAnimationActive={false}
								contentStyle={{
									backgroundColor: '#020617',
									borderColor: 'rgba(99,102,241,0.3)',
									borderRadius: '12px',
									boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
								}}
								itemStyle={{
									fontWeight: 900,
									fontFamily: 'var(--font-mono)',
									fontSize: '12px',
									textTransform: 'uppercase',
									color: '#6366f1',
								}}
								labelStyle={{ color: '#fff', fontWeight: 900, marginBottom: '8px' }}
							/>
							<Line
								type="stepAfter"
								dataKey="evLoss"
								stroke="#6366f1"
								strokeWidth={3}
								dot={{ r: 4, fill: '#020617', stroke: '#6366f1', strokeWidth: 2 }}
								name="EV LOSS (BB)"
								isAnimationActive={false}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
			)}
		</div>
	);
}
