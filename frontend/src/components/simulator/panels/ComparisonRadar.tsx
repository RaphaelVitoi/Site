'use client';

/**
 * IDENTITY: Radar de Topologia SOTA v7.0 GOLD
 * PATH: src/components/simulator/panels/ComparisonRadar.tsx
 * ROLE: Visualização Multidimensional de Tensões Sistêmicas e Equilíbrio de Nash.
 * AESTHETIC: SOTA Gold Standard (Glows, Precision SVG, Glassmorphism).
 */

import { useCallback, useState } from 'react';
import {
	Legend,
	PolarAngleAxis,
	PolarGrid,
	PolarRadiusAxis,
	Radar,
	RadarChart,
	ResponsiveContainer,
	Tooltip,
} from 'recharts';
import type { IcmDistortionResult, Scenario } from '../solver/types';
import { useRadarCalculations } from '../hooks/useRadarCalculations';
import { RadarTooltip } from '../ui/RadarTooltip';
import { SotaTooltip } from '../ui/SotaTooltip';

interface ComparisonRadarProps {
	scenarios: Scenario[];
	currentId: string;
	nashFlop: IcmDistortionResult | undefined;
}

export default function ComparisonRadar({
	scenarios,
	currentId,
	nashFlop,
}: Readonly<ComparisonRadarProps>) {
	const [compareId, setCompareId] = useState<string>('');

	// SOTA v4.2: Orquestração de Cálculo Modularizada
	const { currentScenario, compareScenario, radarData } = useRadarCalculations({
		scenarios,
		currentId,
		compareId,
		nashFlop,
	});

	const handleScenarioChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
		setCompareId(e.target.value);
	}, []);

	const handleClear = useCallback(() => setCompareId(''), []);

	return (
		<div className="glass-panel p-6 sm:p-10 flex flex-col h-full animate-sota-in relative rounded-[2.5rem] bg-bg-panel/40 backdrop-blur-2xl border border-white/5 shadow-2xl transition-all duration-700 hover:border-white/10 overflow-visible group/radar">
			<div className="absolute inset-0 bg-grain mix-blend-overlay opacity-5 pointer-events-none" />
			{/* Subtle depth layers */}
			<div className="absolute top-0 right-0 w-48 h-48 bg-accent-indigo/5 blur-[100px] rounded-full pointer-events-none transition-all duration-1000 group-hover/radar:bg-accent-indigo/15" />
			<div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-rose/5 blur-[100px] rounded-full pointer-events-none transition-all duration-1000 group-hover/radar:bg-accent-rose/15" />

			{/* Compact Header */}
			<div className="flex flex-col sm:flex-row items-center justify-between mb-8 border-b border-white/5 pb-6 gap-4 relative z-10">
				<div className="flex items-center gap-4">
					<div className="w-2 h-2 rounded-full bg-accent-indigo shadow-[0_0_10px_var(--color-accent-indigo)]" />
					<h3 className="text-[0.7rem] font-black text-white uppercase tracking-[0.3em] m-0 group-hover/radar:text-glow-indigo transition-all duration-500">
						Radar Topológico
					</h3>
				</div>
				<div className="flex items-center gap-4">
					<SotaTooltip
						align="right"
						title="Mapeamento"
						content="Geometria visual das tensões ICM."
						theme="indigo"
					>
						<button
							type="button"
							title="Ajuda do Radar Topológico"
							aria-label="Ajuda do Radar Topológico"
							className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-darker hover:text-accent-indigo transition-all cursor-help shadow-lg active:scale-95"
						>
							<i className="fa-solid fa-radar text-sm" />
						</button>
					</SotaTooltip>
				</div>
			</div>

			{/* Compact Selector */}
			<div className="mb-8 bg-slate-950/20 border border-white/5 p-6 rounded-3xl flex flex-col gap-4 shadow-inner relative group/select">
				<div className="flex items-center justify-between">
					<label
						htmlFor="comparison-radar-select"
						className="text-[0.55rem] text-text-muted font-black uppercase tracking-[0.2em] flex items-center gap-2"
					>
						<i className="fa-solid fa-layer-group text-accent-indigo/60" /> Injetar
						Overlay
					</label>
				</div>
				<div className="flex gap-4">
					<div className="relative flex-1">
						<select
							id="comparison-radar-select"
							value={compareId}
							onChange={handleScenarioChange}
							className="w-full bg-slate-900/40 border border-white/5 rounded-xl text-text-muted px-4 py-3 text-[0.75rem] font-bold focus:ring-1 focus:ring-accent-indigo/30 focus:border-accent-indigo/30 outline-none transition-all cursor-pointer appearance-none pr-10"
						>
							<option value="" className="bg-bg-deep text-text-dim">
								Cenário de Comparação...
							</option>
							{scenarios
								.filter((s) => s.id !== currentId)
								.map((s) => (
									<option key={s.id} value={s.id} className="bg-bg-deep">
										{s.name}
									</option>
								))}
						</select>
						<div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-darker">
							<i className="fa-solid fa-chevron-down text-[0.6rem]" />
						</div>
					</div>
					{compareId && (
						<button
							type="button"
							title="Limpar Comparação"
							aria-label="Limpar Comparação"
							onClick={handleClear}
							className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 text-accent-rose/60 hover:bg-rose-500/10 transition-all shadow-md active:scale-95"
						>
							<i className="fa-solid fa-xmark text-xs" />
						</button>
					)}
				</div>
			</div>

			{/* Main Visualization - Precision Focus */}
			<div className="grow relative overflow-visible flex items-center justify-center">
				<ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
					<RadarChart
						data={radarData}
						cx="50%"
						cy="50%"
						outerRadius="75%"
						margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
					>
						<defs>
							<linearGradient id="gradIndigo" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="0%"
									stopColor="var(--color-accent-indigo)"
									stopOpacity={0.6}
								/>
								<stop
									offset="100%"
									stopColor="var(--color-accent-indigo)"
									stopOpacity={0.1}
								/>
							</linearGradient>
							<linearGradient id="gradRose" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="0%"
									stopColor="var(--color-accent-rose)"
									stopOpacity={0.5}
								/>
								<stop
									offset="100%"
									stopColor="var(--color-accent-rose)"
									stopOpacity={0.05}
								/>
							</linearGradient>
						</defs>

						<PolarGrid stroke="rgba(255, 255, 255, 0.05)" radialLines={true} />

						<PolarAngleAxis
							dataKey="axis"
							tick={{
								fill: '#64748b',
								fontSize: 11,
								fontWeight: 800,
								fontFamily: 'var(--font-mono)',
								letterSpacing: '0.1em',
							}}
						/>

						<PolarRadiusAxis
							angle={90}
							tick={false}
							domain={[0, 100]}
							axisLine={false}
						/>

						<Radar
							name={currentScenario?.name ?? 'Atual'}
							dataKey="A"
							stroke="var(--color-accent-indigo)"
							fill="url(#gradIndigo)"
							strokeWidth={3}
							strokeOpacity={0.8}
							isAnimationActive={false}
						/>

						{compareScenario && (
							<Radar
								name={compareScenario.name}
								dataKey="B"
								stroke="var(--color-accent-rose)"
								fill="url(#gradRose)"
								strokeWidth={2}
								strokeDasharray="4 4"
								strokeOpacity={0.6}
								isAnimationActive={false}
							/>
						)}

						<Tooltip
							isAnimationActive={false}
							content={<RadarTooltip />}
							allowEscapeViewBox={{ x: true, y: true }}
							wrapperStyle={{ zIndex: 1000 }}
						/>

						<Legend
							verticalAlign="bottom"
							align="center"
							wrapperStyle={{
								paddingTop: '20px',
								fontSize: '0.65rem',
								fontWeight: 800,
								textTransform: 'uppercase',
								letterSpacing: '0.2em',
								color: '#64748b',
							}}
							iconType="circle"
							iconSize={10}
						/>
					</RadarChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
