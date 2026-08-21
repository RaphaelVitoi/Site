'use client';

/**
 * IDENTITY: Orquestrador do Motor de Distorções ICM (SOTA v7.0 GOLD)
 * PATH: src/components/simulator/IcmDistortionsContent.tsx
 * ROLE: Centralizar o laboratório de Bubble Factor, Nash Distortion Profiler e Downward Drift.
 * DESIGN: Arquitetura desacoplada, layout simétrico com proporção áurea e HUD de controle em tempo real.
 */

import { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ErrorBoundary } from '@/components/analytics/ErrorBoundary';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { ROUTES } from '@/constants/routes';

const BubbleFactorMatrix = dynamic(
	() => import('@/components/simulator/BubbleFactorMatrix').then((m) => m.BubbleFactorMatrix),
	{ ssr: false }
);

const NashMatrixProfiler = dynamic(
	() => import('@/components/simulator/NashMatrixProfiler').then((m) => m.NashMatrixProfiler),
	{ ssr: false }
);

const RangeMatrixDynamic = dynamic(
	() => import('@/components/simulator/panels/RangeMatrix'),
	{ ssr: false }
);

type ActiveViewTab = 'unificada' | 'bubble_factor' | 'nash_profiler' | 'range_matrix';

export function IcmDistortionsContent() {
	const [activeTab, setActiveTab] = useState<ActiveViewTab>('unificada');
	const [matchupSync, setMatchupSync] = useState<{
		ipRp: number;
		oopRp: number;
		label: string;
	}>({
		ipRp: 13.5,
		oopRp: 31.8,
		label: 'BTN (Aggressive CL) vs CO (Second Stack)',
	});

	const handleMatchupSelect = useCallback(
		(
			heroRp: number,
			villainRp: number,
			heroName: string,
			villainName: string
		) => {
			setMatchupSync((prev) => {
				if (
					prev.ipRp === heroRp &&
					prev.oopRp === villainRp &&
					prev.label === `${heroName} vs ${villainName}`
				) {
					return prev;
				}
				return {
					ipRp: heroRp,
					oopRp: villainRp,
					label: `${heroName} vs ${villainName}`,
				};
			});
		},
		[]
	);

	return (
		<main className="sota-container mt-8 space-y-12 animate-sota-in pb-24">
			{/* HUD Superior de Telemetria e Navegação por Módulos */}
			<section className="space-y-6">
				<GlassPanel className="p-6 sm:p-8 border-accent-indigo/20 bg-linear-to-r from-slate-900/90 via-slate-950/95 to-slate-900/90 rounded-4xl shadow-2xl">
					<div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
						{/* Info de Matchup Ativo */}
						<div className="space-y-2 max-w-xl">
							<div className="flex items-center gap-2.5 text-[0.6rem] font-mono font-black uppercase tracking-[0.3em] text-accent-indigo-light">
								<i className="fa-solid fa-satellite-dish animate-pulse" />
								<span>Confronto Ativo (Sincronizado)</span>
							</div>
							<h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight m-0">
								{matchupSync.label}
							</h2>
							<p className="text-xs text-text-muted m-0 font-normal leading-relaxed">
								A distorção de equidade é propagada dinamicamente entre as matrizes dimensionais e o motor de Nash.
							</p>
						</div>

						{/* Métricas e Atalhos dos Laboratórios */}
						<div className="flex flex-wrap items-center gap-3">
							<div className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
								<span className="text-[0.6rem] font-mono font-bold text-text-dim uppercase tracking-wider">
									RP In-Position
								</span>
								<span className="text-sm font-mono font-black text-accent-emerald tabular-nums">
									+{matchupSync.ipRp.toFixed(1)}%
								</span>
							</div>

							<div className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
								<span className="text-[0.6rem] font-mono font-bold text-text-dim uppercase tracking-wider">
									RP Out-of-Position
								</span>
								<span className="text-sm font-mono font-black text-accent-rose tabular-nums">
									+{matchupSync.oopRp.toFixed(1)}%
								</span>
							</div>

							<div className="px-4 py-2.5 rounded-2xl bg-accent-indigo/10 border border-accent-indigo/30 flex items-center gap-2">
								<span className="text-[0.6rem] font-mono font-bold text-accent-indigo-light uppercase tracking-wider">
									ΔRP Assimetria
								</span>
								<span className="text-sm font-mono font-black text-white tabular-nums">
									{(matchupSync.oopRp - matchupSync.ipRp).toFixed(1)}%
								</span>
							</div>
						</div>
					</div>

					{/* Barra de Abas / Modos de Visualização */}
					<div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
						<div className="flex flex-wrap items-center gap-2">
							<TabButton
								active={activeTab === 'unificada'}
								onClick={() => setActiveTab('unificada')}
								icon="fa-layer-group"
								label="Visão Unificada"
							/>
							<TabButton
								active={activeTab === 'bubble_factor'}
								onClick={() => setActiveTab('bubble_factor')}
								icon="fa-table-cells"
								label="Matriz Bubble Factor"
							/>
							<TabButton
								active={activeTab === 'nash_profiler'}
								onClick={() => setActiveTab('nash_profiler')}
								icon="fa-chart-simple"
								label="Nash Profiler"
							/>
							<TabButton
								active={activeTab === 'range_matrix'}
								onClick={() => setActiveTab('range_matrix')}
								icon="fa-grid-2"
								label="Range Matrix"
							/>
						</div>

						{/* Links Rápidos para outros Laboratórios */}
						<div className="flex items-center gap-3 text-xs font-bold">
							<Link
								href={ROUTES.SIMULADOR}
								className="text-text-dim hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10"
							>
								<i className="fa-solid fa-calculator text-[0.65rem] text-accent-indigo-light" />
								<span>Simulador Mestre</span>
							</Link>
							<span className="text-text-darker">·</span>
							<Link
								href={ROUTES.SIMULADOR_GTO}
								className="text-text-dim hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10"
							>
								<i className="fa-solid fa-network-wired text-[0.65rem] text-accent-emerald-light" />
								<span>Laboratório CFR</span>
							</Link>
						</div>
					</div>
				</GlassPanel>
			</section>

			{/* Renderização Condicional / Abas do Laboratório */}
			{activeTab === 'unificada' && (
				<div className="space-y-12">
					<section className="space-y-4">
						<div className="flex items-center gap-3">
							<div className="w-2 h-2 rounded-full bg-accent-indigo" />
							<h3 className="text-sm font-black uppercase tracking-[0.2em] text-accent-indigo-light m-0">
								1. Matriz N-Dimensional de Bubble Factor
							</h3>
						</div>
						<ErrorBoundary>
							<BubbleFactorMatrix onSelectMatchup={handleMatchupSelect} />
						</ErrorBoundary>
					</section>

					<section className="space-y-4">
						<div className="flex items-center gap-3">
							<div className="w-2 h-2 rounded-full bg-accent-rose" />
							<h3 className="text-sm font-black uppercase tracking-[0.2em] text-accent-rose-light m-0">
								2. Profiler de Distorção de Nash em Tempo Real
							</h3>
						</div>
						<ErrorBoundary>
							<NashMatrixProfiler
								injectedIpRp={matchupSync.ipRp}
								injectedOopRp={matchupSync.oopRp}
								matchupLabel={matchupSync.label}
							/>
						</ErrorBoundary>
					</section>

					<section className="space-y-4">
						<div className="flex items-center gap-3">
							<div className="w-2 h-2 rounded-full bg-accent-emerald" />
							<h3 className="text-sm font-black uppercase tracking-[0.2em] text-accent-emerald-light m-0">
								3. Distribuição de Ranges & Downward Drift
							</h3>
						</div>
						<ErrorBoundary>
							<RangeMatrixDynamic
								ipRp={matchupSync.ipRp ?? 13.5}
								oopRp={matchupSync.oopRp ?? 31.8}
								scenarioId="mtt-final-table"
							/>
						</ErrorBoundary>
					</section>
				</div>
			)}

			{activeTab === 'bubble_factor' && (
				<div className="space-y-6">
					<ErrorBoundary>
						<BubbleFactorMatrix onSelectMatchup={handleMatchupSelect} />
					</ErrorBoundary>
				</div>
			)}

			{activeTab === 'nash_profiler' && (
				<div className="space-y-6">
					<ErrorBoundary>
						<NashMatrixProfiler
							injectedIpRp={matchupSync.ipRp}
							injectedOopRp={matchupSync.oopRp}
							matchupLabel={matchupSync.label}
						/>
					</ErrorBoundary>
				</div>
			)}

			{activeTab === 'range_matrix' && (
				<div className="space-y-6">
					<ErrorBoundary>
						<RangeMatrixDynamic
							ipRp={matchupSync.ipRp ?? 13.5}
							oopRp={matchupSync.oopRp ?? 31.8}
							scenarioId="mtt-final-table"
						/>
					</ErrorBoundary>
				</div>
			)}

			{/* Doutrina e Síntese da Física de Risco */}
			<section className="pt-8 border-t border-white/5">
				<GlassPanel className="p-8 sm:p-12 border-white/5 bg-slate-950/40 rounded-4xl">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						<div className="space-y-3">
							<span className="text-[0.6rem] font-mono font-black uppercase tracking-widest text-accent-indigo-light">
								Axioma da Não-Linearidade
							</span>
							<h4 className="text-base font-black text-white m-0">A Dor da Perda Excede o Ganho</h4>
							<p className="text-xs text-text-muted leading-relaxed m-0 font-normal">
								A base do stack vale substancialmente mais do que o topo. O Bubble Factor mede essa taxa de queima utilitária.
							</p>
						</div>

						<div className="space-y-3">
							<span className="text-[0.6rem] font-mono font-black uppercase tracking-widest text-accent-rose-light">
								Assimetria de Risco (ΔRP)
							</span>
							<h4 className="text-base font-black text-white m-0">O CL Ditata a Geometria</h4>
							<p className="text-xs text-text-muted leading-relaxed m-0 font-normal">
								Quando um Chip Leader pressiona um Second Stack, a assimetria destrói as Pot Odds tradicionais, forçando o fold.
							</p>
						</div>

						<div className="space-y-3">
							<span className="text-[0.6rem] font-mono font-black uppercase tracking-widest text-accent-emerald-light">
								Downward Drift Pós-Flop
							</span>
							<h4 className="text-base font-black text-white m-0">Compressão de Sizings</h4>
							<p className="text-xs text-text-muted leading-relaxed m-0 font-normal">
								Sob pressão extrema de ICM, os tamanhos de aposta migram para 15-33% do pote, preservando o valor da sobrevivência.
							</p>
						</div>
					</div>
				</GlassPanel>
			</section>
		</main>
	);
}

function TabButton({
	label,
	icon,
	active,
	onClick,
}: Readonly<{
	label: string;
	icon: string;
	active: boolean;
	onClick: () => void;
}>) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border ${
				active
					? 'bg-accent-indigo text-white border-accent-indigo shadow-[0_0_20px_rgba(99,102,241,0.3)]'
					: 'bg-white/5 text-text-muted hover:text-white border-white/5 hover:border-white/10'
			}`}
		>
			<i className={`fa-solid ${icon} text-xs`} />
			<span>{label}</span>
		</button>
	);
}
