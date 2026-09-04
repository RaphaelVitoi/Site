'use client';

/**
 * IDENTITY: Radar de Topologia SOTA v8.0 GOLD
 * PATH: src/components/simulator/panels/ComparisonRadar.tsx
 * ROLE: Visualização Multidimensional de Tensões Sistêmicas e Equilíbrio de Nash.
 * AESTHETIC: SOTA Gold Standard (Glows, Precision SVG, Glassmorphism, Zero-Entropy).
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
	embedded?: boolean;
}

export default function ComparisonRadar({
	scenarios,
	currentId,
	nashFlop,
	embedded = false,
}: Readonly<ComparisonRadarProps>) {
	const [compareId, setCompareId] = useState<string>('');

	// SOTA v8.0 GOLD: Orquestração de Cálculo Modularizada
	const { currentScenario, compareScenario, radarData, metricsA, metricsB, deltaMetrics } =
		useRadarCalculations({
			scenarios,
			currentId,
			compareId,
			nashFlop,
		});

	const handleScenarioChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
		setCompareId(e.target.value);
	}, []);

	const handleClear = useCallback(() => setCompareId(''), []);

	const wrapperClasses = embedded
		? 'flex flex-col gap-6 w-full'
		: 'glass-panel p-6 sm:p-8 lg:p-10 flex flex-col gap-8 animate-sota-in relative rounded-4xl bg-bg-panel/40 backdrop-blur-2xl border border-white/8 shadow-2xl transition-all duration-700 hover:border-white/12 group/radar';

	return (
		<div className={wrapperClasses}>
			<div className="absolute inset-0 bg-grain mix-blend-overlay opacity-5 pointer-events-none" />
			{/* Subtle depth glow layers */}
			<div className="absolute top-0 right-0 w-64 h-64 bg-accent-indigo/8 blur-[120px] rounded-full pointer-events-none transition-all duration-1000 group-hover/radar:bg-accent-indigo/15" />
			<div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-rose/8 blur-[120px] rounded-full pointer-events-none transition-all duration-1000 group-hover/radar:bg-accent-rose/15" />

			{/* ═══ CABEÇALHO SOTA & SELETOR DE OVERLAY ═══ */}
			<div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-white/8 pb-6 relative z-10">
				<div className="space-y-1.5">
					<div className="flex items-center gap-3">
						<div className="w-2.5 h-2.5 rounded-full bg-accent-indigo shadow-[0_0_12px_var(--color-accent-indigo)] animate-pulse" />
						<h3 className="text-sm sm:text-base font-black text-white uppercase tracking-[0.25em] m-0 group-hover/radar:text-glow-indigo transition-all duration-500">
							Radar Topológico & Tensões de Nash
						</h3>
					</div>
					<p className="text-[0.62rem] font-mono text-text-dim uppercase tracking-wider m-0">
						Mapeamento multidimensional das distorções de ICM e do Fator Ψ · SOTA v8.0 GOLD
					</p>
				</div>

				{/* Controle de Injeção de Overlay */}
				<div className="flex items-center gap-3 w-full lg:w-auto">
					<div className="relative flex-1 sm:w-80">
						<select
							id="comparison-radar-select"
							value={compareId}
							onChange={handleScenarioChange}
							aria-label="Selecionar Cenário de Comparação"
							className="w-full bg-slate-950/80 border border-white/10 rounded-xl text-text-light px-4 py-2.5 text-[0.72rem] font-bold focus:ring-1 focus:ring-accent-indigo focus:border-accent-indigo outline-none transition-all cursor-pointer appearance-none pr-10 shadow-inner"
						>
							<option value="" className="bg-slate-950 text-text-dim">
								Injetar Cenário de Comparação (Overlay)...
							</option>
							{scenarios
								.filter((s) => s.id !== currentId)
								.map((s) => (
									<option key={s.id} value={s.id} className="bg-slate-950 text-white">
										{s.name} ({s.category === 'clinical' ? 'Clínico' : 'Baseline'})
									</option>
								))}
						</select>
						<div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-dim">
							<i className="fa-solid fa-chevron-down text-[0.65rem]" />
						</div>
					</div>

					{compareId && (
						<button
							type="button"
							title="Limpar Comparação"
							aria-label="Limpar Comparação"
							onClick={handleClear}
							className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-accent-rose hover:bg-rose-500/20 transition-all shadow-md active:scale-95 text-xs font-bold flex items-center gap-2 cursor-pointer"
						>
							<i className="fa-solid fa-xmark" />
							<span className="text-[0.62rem] uppercase tracking-wider hidden sm:inline">Limpar</span>
						</button>
					)}

					<SotaTooltip
						align="right"
						title="Topologia de Nash"
						content="O polígono azul reflete o cenário ativo (CENÁRIO ATIVO). O polígono pontilhado rosa representa o cenário comparado, permitindo visualizar a rotação dos vetores de MDF, agressão e assimetria de risco."
						theme="indigo"
					>
						<button
							type="button"
							title="Ajuda do Radar Topológico"
							aria-label="Ajuda do Radar Topológico"
							className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-dim hover:text-accent-indigo transition-all cursor-help shadow-lg active:scale-95 shrink-0"
						>
							<i className="fa-solid fa-circle-question text-sm" />
						</button>
					</SotaTooltip>
				</div>
			</div>

			{/* ═══ COCKPIT CENTRAL: RADAR SVG (7/12) + TELEMETRIA DIFERENCIAL (5/12) ═══ */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
				{/* Visualizador do Radar Recharts com Altura Explícita Robusta */}
				<div className="lg:col-span-7 bg-slate-950/60 rounded-3xl border border-white/6 p-4 sm:p-6 shadow-inner relative overflow-hidden flex flex-col items-center justify-center">
					<div className="w-full h-95 sm:h-110 min-h-85 relative">
						<ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
							<RadarChart
								data={radarData}
								cx="50%"
								cy="50%"
								outerRadius="72%"
								margin={{ top: 15, right: 25, bottom: 15, left: 25 }}
							>
								<defs>
									<linearGradient id="gradIndigo" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stopColor="var(--color-accent-indigo, #6366f1)" stopOpacity={0.7} />
										<stop offset="100%" stopColor="var(--color-accent-indigo, #6366f1)" stopOpacity={0.15} />
									</linearGradient>
									<linearGradient id="gradRose" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stopColor="var(--color-accent-rose, #f43f5e)" stopOpacity={0.65} />
										<stop offset="100%" stopColor="var(--color-accent-rose, #f43f5e)" stopOpacity={0.1} />
									</linearGradient>
								</defs>

								<PolarGrid stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3 3" />

								<PolarAngleAxis
									dataKey="axis"
									tick={{
										fill: '#94a3b8',
										fontSize: 10,
										fontWeight: 800,
										fontFamily: 'var(--font-mono)',
										letterSpacing: '0.08em',
									}}
								/>

								<PolarRadiusAxis
									angle={90}
									tick={{ fill: '#475569', fontSize: 9 }}
									domain={[0, 100]}
									axisLine={false}
								/>

								<Radar
									name={currentScenario?.name ?? 'Cenário Ativo'}
									dataKey="A"
									stroke="var(--color-accent-indigo, #6366f1)"
									fill="url(#gradIndigo)"
									strokeWidth={3}
									strokeOpacity={0.9}
									isAnimationActive={false}
								/>

								{compareScenario && (
									<Radar
										name={compareScenario.name}
										dataKey="B"
										stroke="var(--color-accent-rose, #f43f5e)"
										fill="url(#gradRose)"
										strokeWidth={2.5}
										strokeDasharray="4 4"
										strokeOpacity={0.85}
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
										paddingTop: '16px',
										fontSize: '0.62rem',
										fontWeight: 800,
										textTransform: 'uppercase',
										letterSpacing: '0.15em',
										color: '#94a3b8',
									}}
									iconType="circle"
									iconSize={8}
								/>
							</RadarChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* Coluna Lateral: Cards de Telemetria e Tensões Diferenciais */}
				<div className="lg:col-span-5 flex flex-col gap-4">
					{/* Card de Tensão Topológica */}
					<div className="p-5 rounded-2xl border border-white/8 bg-slate-950/60 shadow-lg space-y-3">
						<div className="flex items-center justify-between pb-2 border-b border-white/5">
							<span className="font-mono text-[0.6rem] font-black uppercase tracking-[0.2em] text-accent-indigo flex items-center gap-2">
								<i className="fa-solid fa-atom animate-spin-slow" />
								<span>Vetor de Tensão Sistêmica (Θ)</span>
							</span>
							<span className="text-[0.55rem] font-mono text-text-dim uppercase">
								{metricsA?.tensionIndex.toFixed(1)} / 100
							</span>
						</div>

						<div className="space-y-2">
							<div className="flex justify-between items-center text-[0.65rem]">
								<span className="text-text-muted font-bold">Cenário Ativo ({currentScenario?.name}):</span>
								<span className="font-mono font-black text-accent-indigo">{metricsA?.tensionIndex.toFixed(1)}%</span>
							</div>
							<div className="w-full bg-black/50 h-2 rounded-full overflow-hidden border border-white/5">
								<div
									className="bg-linear-to-r from-indigo-500 to-indigo-400 h-full rounded-full transition-all duration-700"
									style={{ width: `${metricsA?.tensionIndex ?? 0}%` }}
								/>
							</div>

							{metricsB && (
								<>
									<div className="flex justify-between items-center text-[0.65rem] pt-2">
										<span className="text-text-muted font-bold">Overlay ({compareScenario?.name}):</span>
										<span className="font-mono font-black text-accent-rose">{metricsB.tensionIndex.toFixed(1)}%</span>
									</div>
									<div className="w-full bg-black/50 h-2 rounded-full overflow-hidden border border-white/5">
										<div
											className="bg-linear-to-r from-rose-500 to-rose-400 h-full rounded-full transition-all duration-700"
											style={{ width: `${metricsB.tensionIndex}%` }}
										/>
									</div>
								</>
							)}
						</div>
					</div>

					{/* Grade de Deltas Topológicos */}
					<div className="grid grid-cols-2 gap-3">
						<div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/6 shadow-md">
							<span className="text-[0.5rem] font-black uppercase tracking-wider text-text-dim block mb-1">
								RP IP (Posição)
							</span>
							<div className="flex items-baseline gap-2">
								<span className="font-mono text-base font-black text-accent-indigo">
									{metricsA?.rpIp.toFixed(1)}%
								</span>
								{deltaMetrics && (
									<span className={`text-[0.6rem] font-mono font-bold ${deltaMetrics.deltaIpRp >= 0 ? 'text-accent-rose' : 'text-accent-emerald'}`}>
										{deltaMetrics.deltaIpRp >= 0 ? '+' : ''}{deltaMetrics.deltaIpRp.toFixed(1)}
									</span>
								)}
							</div>
						</div>

						<div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/6 shadow-md">
							<span className="text-[0.5rem] font-black uppercase tracking-wider text-text-dim block mb-1">
								RP OOP (Fora de Pos)
							</span>
							<div className="flex items-baseline gap-2">
								<span className="font-mono text-base font-black text-accent-rose">
									{metricsA?.rpOop.toFixed(1)}%
								</span>
								{deltaMetrics && (
									<span className={`text-[0.6rem] font-mono font-bold ${deltaMetrics.deltaOopRp >= 0 ? 'text-accent-rose' : 'text-accent-emerald'}`}>
										{deltaMetrics.deltaOopRp >= 0 ? '+' : ''}{deltaMetrics.deltaOopRp.toFixed(1)}
									</span>
								)}
							</div>
						</div>

						<div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/6 shadow-md">
							<span className="text-[0.5rem] font-black uppercase tracking-wider text-text-dim block mb-1">
								Assimetria (ΔRP)
							</span>
							<div className="flex items-baseline gap-2">
								<span className="font-mono text-base font-black text-white">
									{metricsA?.asymmetry.toFixed(1)} pp
								</span>
								{deltaMetrics && (
									<span className={`text-[0.6rem] font-mono font-bold ${deltaMetrics.deltaAsymmetry >= 0 ? 'text-accent-rose' : 'text-accent-emerald'}`}>
										{deltaMetrics.deltaAsymmetry >= 0 ? '+' : ''}{deltaMetrics.deltaAsymmetry.toFixed(1)}
									</span>
								)}
							</div>
						</div>

						<div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/6 shadow-md">
							<span className="text-[0.5rem] font-black uppercase tracking-wider text-text-dim block mb-1">
								MDF / Defesa Nash
							</span>
							<div className="flex items-baseline gap-2">
								<span className="font-mono text-base font-black text-accent-emerald">
									{metricsA?.defense.toFixed(1)}%
								</span>
								{deltaMetrics && (
									<span className={`text-[0.6rem] font-mono font-bold ${deltaMetrics.deltaDefense >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
										{deltaMetrics.deltaDefense >= 0 ? '+' : ''}{deltaMetrics.deltaDefense.toFixed(1)}
									</span>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* ═══ MATRIZ COMPARATIVA DIDÁTICA (LADO A LADO) ═══ */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
				{/* Cartão do Cenário Ativo (A) */}
				<div className="p-6 rounded-3xl border border-accent-indigo/20 bg-slate-950/50 shadow-xl space-y-4 relative overflow-hidden">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2.5">
							<span className="w-2 h-2 rounded-full bg-accent-indigo shadow-[0_0_8px_var(--color-accent-indigo)]" />
							<span className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-accent-indigo">
								Cenário A · Ativo
							</span>
						</div>
						<span className="text-[0.55rem] font-mono bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-text-muted uppercase">
							{metricsA?.category === 'clinical' ? 'Estudo Clínico' : 'Referencial'}
						</span>
					</div>

					<div>
						<h4 className="text-base font-black text-white uppercase tracking-wider m-0">
							{currentScenario?.name}
						</h4>
						<p className="text-[0.65rem] text-text-dim m-0 mt-1">
							{metricsA?.narrativeSubtitle || currentScenario?.narrativeTitle}
						</p>
					</div>

					<div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
						<div className="flex justify-between items-center text-[0.65rem]">
							<span className="text-text-dim">Veredito Estratégico:</span>
							<span className="font-bold text-white uppercase tracking-wider">{metricsA?.verdict}</span>
						</div>
						<div className="flex justify-between items-center text-[0.65rem]">
							<span className="text-text-dim">Confronto:</span>
							<span className="font-mono text-accent-indigo">{metricsA?.ipPos} vs {metricsA?.oopPos}</span>
						</div>
					</div>

					{metricsA?.exploitDirectives && metricsA.exploitDirectives.length > 0 && (
						<div className="p-3.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 space-y-1.5">
							<span className="text-[0.55rem] font-black uppercase tracking-wider text-accent-indigo block">
								Diretriz Tática (Axioma Lipe Piv):
							</span>
							<p className="text-[0.68rem] text-text-light leading-relaxed m-0 italic">
								&quot;{metricsA.exploitDirectives[0]}&quot;
							</p>
						</div>
					)}
				</div>

				{/* Cartão do Cenário Comparado (B) */}
				<div className={`p-6 rounded-3xl border shadow-xl space-y-4 relative overflow-hidden transition-all duration-300 ${
					metricsB ? 'border-accent-rose/20 bg-slate-950/50' : 'border-white/5 bg-slate-950/20 flex flex-col items-center justify-center text-center'
				}`}>
					{metricsB ? (
						<>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2.5">
									<span className="w-2 h-2 rounded-full bg-accent-rose shadow-[0_0_8px_var(--color-accent-rose)]" />
									<span className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-accent-rose">
										Cenário B · Overlay Injetado
									</span>
								</div>
								<span className="text-[0.55rem] font-mono bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-text-muted uppercase">
									{metricsB.category === 'clinical' ? 'Estudo Clínico' : 'Referencial'}
								</span>
							</div>

							<div>
								<h4 className="text-base font-black text-white uppercase tracking-wider m-0">
									{compareScenario?.name}
								</h4>
								<p className="text-[0.65rem] text-text-dim m-0 mt-1">
									{metricsB.narrativeSubtitle || compareScenario?.narrativeTitle}
								</p>
							</div>

							<div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
								<div className="flex justify-between items-center text-[0.65rem]">
									<span className="text-text-dim">Veredito Estratégico:</span>
									<span className="font-bold text-white uppercase tracking-wider">{metricsB.verdict}</span>
								</div>
								<div className="flex justify-between items-center text-[0.65rem]">
									<span className="text-text-dim">Confronto:</span>
									<span className="font-mono text-accent-rose">{metricsB.ipPos} vs {metricsB.oopPos}</span>
								</div>
							</div>

							{metricsB.exploitDirectives && metricsB.exploitDirectives.length > 0 && (
								<div className="p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/15 space-y-1.5">
									<span className="text-[0.55rem] font-black uppercase tracking-wider text-accent-rose block">
										Diretriz Tática (Axioma Lipe Piv):
									</span>
									<p className="text-[0.68rem] text-text-light leading-relaxed m-0 italic">
										&quot;{metricsB.exploitDirectives[0]}&quot;
									</p>
								</div>
							)}
						</>
					) : (
						<div className="py-8 px-4 space-y-3">
							<div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-text-dim">
								<i className="fa-solid fa-layer-group text-lg" />
							</div>
							<div className="space-y-1">
								<h5 className="text-xs font-black uppercase tracking-[0.2em] text-text-muted m-0">
									Nenhum Overlay Injetado
								</h5>
								<p className="text-[0.65rem] text-text-dim max-w-xs mx-auto m-0 leading-relaxed">
									Selecione um cenário no dropdown superior para projetar o polígono comparativo e analisar as rotações de Nash.
								</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

