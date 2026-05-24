'use client';

/**
 * IDENTITY: Simulador Mestre ICM (Orquestrador SOTA v6.2.1 GOLD)
 * PATH: src/components/simulator/MasterSimulator.tsx
 * ROLE: Componente raiz que compõe sidebar + main stage com todos os painéis.
 *       Unifica 4 simuladores redundantes num único estado da arte.
 * AESTHETIC: SOTA GOLD Standard (Precision Alignment, Visual Hierarchy, Glassmorphism).
 */

import { useFrequencyPropagation } from './hooks/useFrequencyPropagation';
import { useInsolvencyRadar } from './hooks/useInsolvencyRadar';
import { useQuantumEngine } from './hooks/useQuantumEngine';
import { useScenario } from './hooks/useScenario';
import { useSimulatorState } from './hooks/useSimulatorState';
import { useSotaSync } from './hooks/useSotaSync';
import {
	SotaMetricsContext,
	SotaSpotContext,
	SotaWasmContext,
} from './SotaContext';
import { GuideToolbar } from './ui/GuideToolbar';
import { NashDistortionViz } from './ui/NashDistortionViz';
import ScenarioSelector from './ui/ScenarioSelector';
import SimulatorHeader from './ui/SimulatorHeader';
import SimulatorNavigation from './ui/SimulatorNavigation';
import SimulatorTour from './ui/SimulatorTour';
import { useSimulatorTour } from './hooks/useSimulatorTour';
import { useMasterCalculations } from './hooks/useMasterCalculations';
import { useMasterSpotLogic } from './hooks/useMasterSpotLogic';
import { useMasterHandlers } from './hooks/useMasterHandlers';
import { SpatialControls } from './ui/SpatialControls';
import { SectionHeader } from '../ui/layout/SectionHeader';
import { useMounted } from '../../hooks/useMounted';
import dynamic from 'next/dynamic';
import { Suspense, useEffect, useMemo, useDeferredValue, useTransition } from 'react';
import useSWR from 'swr';
import { useLlamaEngine } from '../../hooks/useLlamaEngine';

// SOTA: Dynamic imports with ssr: false for WASM/Worker safety
const EquityCalculator = dynamic(() => import('./panels/EquityCalculator'), {
	ssr: false,
});
const ComparisonRadar = dynamic(() => import('./panels/ComparisonRadar'), {
	ssr: false,
});
const PerspectivePanel = dynamic(() => import('./panels/PerspectivePanel'), {
	ssr: false,
});
const PostFlopPanel = dynamic(() => import('./panels/PostFlopPanel'), {
	ssr: false,
});
const PmLensPanel = dynamic(() => import('./panels/PmLensPanel'), {
	ssr: false,
});
const ReferencialAula12 = dynamic(() => import('./ReferencialAula12'), {
	ssr: false,
});
const SimulatorQuizWidget = dynamic(
	() => import('../quiz/SimulatorQuizWidget').then((m) => m.SimulatorQuizWidget),
	{ ssr: false },
);
const NashPanel = dynamic(() => import('./panels/NashPanel'), { ssr: false });
const TheoryPanel = dynamic(() => import('./panels/TheoryPanel'), {
	ssr: false,
});
const ScenarioStage = dynamic(() => import('./panels/ScenarioStage'), {
	ssr: false,
});
const MatchupSelector = dynamic(() => import('./panels/MatchupSelector'), {
	ssr: false,
});
const RangeMatrix = dynamic(() => import('./panels/RangeMatrix'), {
	ssr: false,
});
const CfrRegretPanel = dynamic(() => import('./panels/CfrRegretPanel'), {
	ssr: false,
});
const DashboardSOTA = dynamic(() => import('./DashboardSOTA'), { ssr: false });
const InsolvencyRadar = dynamic(() => import('./ui/InsolvencyRadar'), {
	ssr: false,
});

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export type ActiveTool =
	| 'scenario'
	| 'calculator'
	| 'matchup'
	| 'comparar'
	| 'perspectiva'
	| 'posflop'
	| 'cfr';

function LoadingFallback() {
	return (
		<div className="flex items-center justify-center p-16 text-text-darker text-[0.65rem] font-black uppercase tracking-[0.3em] animate-pulse">
			Sincronizando Mente Coletiva...
		</div>
	);
}

export default function MasterSimulator() {
	const isMounted = useMounted();
	const { physics, isHydrated: isSyncHydrated } = useSotaSync();
	const { scenario, setScenario, scenarios } = useScenario();
	const [isPending, startTransition] = useTransition();

	const { data: predictiveData } = useSWR('/api/predictive-profile', fetcher, {
		revalidateOnFocus: false,
	});

	const {
		aggressionFactor,
		setAggressionFactor,
		pkoValue,
		setPkoValue,
		isNearPayjump,
		setIsNearPayjump,
		blindsRisingSoon,
		setBlindsRisingSoon,
		streetFreqs,
		setStreetFreqs,
		activeTool,
		setActiveTool,
		sidebarOpen,
		setSidebarOpen,
		anteSize,
		heroPosition,
		setHeroPosition,
		heroInvested,
		setHeroInvested,
		currentPot,
		setCurrentPot,
		activePlayers,
		setActivePlayers,
		isPredictive,
		setIsPredictive,
		resetState,
	} = useSimulatorState(scenario);

	// SOTA: Sincronização de Física Transversal (Universal Table Physics)
	useEffect(() => {
		if (isSyncHydrated && physics) {
			if (currentPot !== physics.pot) setCurrentPot(physics.pot);
			if (heroInvested !== physics.heroInvested) setHeroInvested(physics.heroInvested);
			if (heroPosition !== physics.position) setHeroPosition(physics.position);
			if (aggressionFactor !== physics.edgeFactor)
				setAggressionFactor(physics.edgeFactor ?? 1);
		}
	}, [
		isSyncHydrated,
		physics,
		currentPot,
		heroInvested,
		heroPosition,
		aggressionFactor,
		setCurrentPot,
		setHeroInvested,
		setHeroPosition,
		setAggressionFactor,
	]);

	const { handleStreetFreqChange } = useFrequencyPropagation(setStreetFreqs);
	useLlamaEngine();

	const safeCurrentPot = Math.max(0.1, currentPot);
	const safeHeroInvested = Math.max(0, heroInvested);
	const safeActivePlayers = Math.max(2, activePlayers);

	// SOTA FIX: Selagem Profunda de Telemetria Preditiva
	const stablePredictiveProfile = useMemo(
		() => predictiveData?.profile || null,
		[predictiveData?.profile],
	);

	const quantumConfig = useMemo(
		() => ({
			scenario,
			pkoValue,
			isNearPayjump,
			blindsRisingSoon,
			streetFreqs,
			aggressionFactor,
			heroIsIp: heroPosition === 'IP',
			heroPosition,
			anteSize,
			heroInvestedBb: safeHeroInvested,
			currentPotBb: safeCurrentPot,
			activePlayers: safeActivePlayers,
			isPredictive,
			predictiveProfile: stablePredictiveProfile,
		}),
		[
			scenario,
			pkoValue,
			isNearPayjump,
			blindsRisingSoon,
			streetFreqs,
			aggressionFactor,
			heroPosition,
			anteSize,
			safeHeroInvested,
			safeCurrentPot,
			safeActivePlayers,
			isPredictive,
			stablePredictiveProfile,
		],
	);

	const deferredQuantumConfig = useDeferredValue(quantumConfig);

	const {
		effectiveIpRp,
		effectiveOopRp,
		rpSource,
		effectiveSprData,
		nashFlop,
		nashTurn,
		nashRiver,
		streetRps,
		quantumPerspectiva,
		isCalculatingInsolvency,
		nashResults,
		dispatchInsolvencyMatrix,
		dispatchIcmDistortion,
	} = useQuantumEngine(deferredQuantumConfig);

	// --- HOOKS ORQUESTRADORES SOTA v6 ---

	const { bayesianWinProb, nativeRangeMetric, apiQuantumMetrics, setNativeRangeMetric } =
		useMasterCalculations({
			scenario,
			aggressionFactor,
			safeHeroInvested,
			safeCurrentPot,
			quantumPerspectiva,
		});

	const {
		isIp,
		isBaseline,
		finalIpRp,
		finalOopRp,
		heroUpdatedStack,
		villainUpdatedStack,
		spotContextValue,
		metricsContextValue,
		wasmContextValue,
	} = useMasterSpotLogic({
		scenario,
		heroPosition,
		safeHeroInvested,
		safeCurrentPot,
		safeActivePlayers,
		anteSize,
		blindsRisingSoon,
		effectiveIpRp,
		effectiveOopRp,
		quantumPerspectiva,
		apiQuantumMetrics,
		nativeRangeMetric,
		isCalculatingInsolvency,
		dispatchInsolvencyMatrix,
		dispatchIcmDistortion,
		nashResults,
		bayesianWinProb,
		predictiveProfile: stablePredictiveProfile,
		predictiveTelemetry: predictiveData?.telemetry || null,
		setNativeRangeMetric,
	});

	const { handleScenarioSelect, handleExportHRC, handleHeroPositionChange } = useMasterHandlers({
		scenario,
		scenarios,
		pkoValue,
		anteSize,
		setScenario,
		resetState,
		setHeroPosition,
		setHeroInvested,
		startTransition,
	});

	const { tourSpotlight, tourSpotlightProps, handleTourStep, closeTour } =
		useSimulatorTour(handleScenarioSelect);

	const insolvencyRadarData = useInsolvencyRadar(apiQuantumMetrics);

	const activeToolContent = useMemo(() => {
		const toolContents: Record<ActiveTool, React.ReactNode> = {
			scenario: (
				<Suspense fallback={<LoadingFallback />}>
					<div className="flex flex-col gap-10">
						<ScenarioStage
							scenario={scenario}
							effectiveIpRp={finalIpRp}
							effectiveOopRp={finalOopRp}
							dynamicDeathZone={
								apiQuantumMetrics?.threshEq ? apiQuantumMetrics.threshEq * 100 : 0
							}
						/>
						<GuideToolbar onExport={handleExportHRC} />
						<SpatialControls
							heroPosition={heroPosition}
							handleHeroPositionChange={handleHeroPositionChange}
							heroInvested={heroInvested}
							setHeroInvested={setHeroInvested}
							currentPot={currentPot}
							setCurrentPot={setCurrentPot}
							activePlayers={activePlayers}
							setActivePlayers={setActivePlayers}
							isPredictive={isPredictive}
							setIsPredictive={setIsPredictive}
						/>
						{nashFlop && nashTurn && nashRiver && streetRps && (
							<NashPanel
								nashFlop={nashFlop}
								nashTurn={nashTurn}
								nashRiver={nashRiver}
								streetFreqs={streetFreqs}
								streetRps={streetRps}
								aggressionFactor={aggressionFactor}
								pkoValue={pkoValue}
								isNearPayjump={isNearPayjump}
								blindsRisingSoon={blindsRisingSoon}
								isBaseline={isBaseline}
								onStreetFreqChange={handleStreetFreqChange}
								onAggressionChange={setAggressionFactor}
								onPkoChange={setPkoValue}
								onPayjumpToggle={setIsNearPayjump}
								onBlindsToggle={setBlindsRisingSoon}
							/>
						)}

						<div className="glass-panel p-10 lg:p-14 animate-sota-in border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)]">
							<div className="bg-slate-950/40 border border-white/5 p-10 rounded-4xl shadow-inner mb-12 relative overflow-hidden group/insolvency">
								<div className="absolute inset-0 bg-radial-[at_top_right] from-rose-500/5 to-transparent pointer-events-none" />
								<div className="flex flex-col items-center text-center gap-4 mb-10 relative z-10">
									<div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-accent-rose shadow-lg">
										<i className="fa-solid fa-radar text-xl animate-pulse"></i>
									</div>
									<div className="space-y-2">
										<h3 className="text-xl font-black text-white uppercase tracking-[0.3em] m-0">
											Diagnóstico de Insolvência
										</h3>
										<p className="text-[0.7rem] text-text-muted font-medium uppercase tracking-[0.2em]">
											Mapeamento vetorial de tensões sistêmicas e colapso de
											equidade.
										</p>
									</div>
								</div>

								<div className="h-112 w-full relative">
									<Suspense
										fallback={
											<div className="flex items-center justify-center h-full text-text-darker text-[0.65rem] font-black uppercase tracking-[0.4em] animate-pulse">
												Sincronizando Radar...
											</div>
										}
									>
										<InsolvencyRadar data={insolvencyRadarData} />
									</Suspense>
								</div>
							</div>

							{nashResults?.flop && (
								<div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
									<NashDistortionViz
										streetName="Flop"
										nashData={nashResults.flop}
									/>
									<NashDistortionViz
										streetName="Turn"
										nashData={nashResults.turn ?? null}
									/>
									<NashDistortionViz
										streetName="River"
										nashData={nashResults.river ?? null}
									/>
								</div>
							)}
							<RangeMatrix
								ipRp={finalIpRp}
								oopRp={finalOopRp}
								scenarioId={scenario.id}
							/>
						</div>

						<TheoryPanel
							scenario={scenario}
							effectiveSprData={effectiveSprData}
							effectiveIpRp={finalIpRp}
							effectiveOopRp={finalOopRp}
						/>
					</div>
				</Suspense>
			),
			calculator: (
				<Suspense fallback={<LoadingFallback />}>
					<EquityCalculator key={`calc-${scenario.id}`} />
				</Suspense>
			),
			matchup: (
				<Suspense fallback={<LoadingFallback />}>
					<MatchupSelector key={`match-${scenario.id}`} />
				</Suspense>
			),
			comparar: (
				<Suspense fallback={<LoadingFallback />}>
					<div className="h-187.5 w-full relative">
						{scenarios && scenarios.length > 0 ? (
							<ComparisonRadar
								key={`comp-${scenario.id}`}
								scenarios={scenarios}
								currentId={scenario.id}
								nashFlop={nashFlop ?? undefined}
							/>
						) : (
							<LoadingFallback />
						)}
					</div>
				</Suspense>
			),
			perspectiva: (
				<Suspense fallback={<LoadingFallback />}>
					<PerspectivePanel
						key={`persp-${scenario.id}`}
						initialStacks={scenario.stacks}
						initialPrizes={scenario.prizes}
						anteSize={anteSize}
						heroInvestedBb={safeHeroInvested}
						currentPotBb={safeCurrentPot}
						initialActivePlayers={safeActivePlayers}
						initialPkoValue={pkoValue}
						initialIsNearPayjump={isNearPayjump}
						initialBlindsRising={blindsRisingSoon}
					/>
				</Suspense>
			),
			posflop: (
				<Suspense fallback={<LoadingFallback />}>
					<PostFlopPanel
						key={`pf-${scenario.id}`}
						anteSize={anteSize}
						scenarioId={scenario.id}
						initialStacks={scenario.stacks}
						initialPrizes={scenario.prizes}
						heroIsIp={isIp}
						activePlayers={safeActivePlayers}
						effectiveSprData={effectiveSprData}
						pkoValue={pkoValue}
						{...(isIp ? { ipLabel: heroPosition } : { oopLabel: heroPosition })}
					/>
				</Suspense>
			),
			cfr: (
				<Suspense fallback={<LoadingFallback />}>
					<div className="min-h-140 w-full relative">
						<CfrRegretPanel
							key={`cfr-${scenario.id}`}
							initialPot={safeCurrentPot}
							initialStack={Math.min(heroUpdatedStack, villainUpdatedStack)}
							initialEquity={nativeRangeMetric.equity}
						/>
					</div>
				</Suspense>
			),
		};
		return toolContents[activeTool] || null;
	}, [
		activeTool,
		scenario,
		heroPosition,
		handleHeroPositionChange,
		heroInvested,
		setHeroInvested,
		currentPot,
		setCurrentPot,
		activePlayers,
		setActivePlayers,
		isPredictive,
		setIsPredictive,
		nashFlop,
		nashTurn,
		nashRiver,
		streetRps,
		streetFreqs,
		aggressionFactor,
		pkoValue,
		isNearPayjump,
		blindsRisingSoon,
		isBaseline,
		handleStreetFreqChange,
		finalIpRp,
		finalOopRp,
		effectiveSprData,
		scenarios,
		anteSize,
		safeHeroInvested,
		safeCurrentPot,
		handleExportHRC,
		nashResults?.flop,
		nashResults?.turn,
		nashResults?.river,
		setAggressionFactor,
		setPkoValue,
		setIsNearPayjump,
		setBlindsRisingSoon,
		isIp,
		safeActivePlayers,
		heroUpdatedStack,
		villainUpdatedStack,
		nativeRangeMetric.equity,
		insolvencyRadarData,
		apiQuantumMetrics?.threshEq,
	]);

	if (!isMounted) {
		return <LoadingFallback />;
	}

	return (
		<SotaSpotContext value={spotContextValue}>
			<SotaMetricsContext value={metricsContextValue}>
				<SotaWasmContext value={wasmContextValue}>
					<div className="min-h-screen bg-bg-base relative overflow-x-hidden">
						{tourSpotlight && (
							<div className="tour-spotlight" {...tourSpotlightProps} />
						)}

						<SimulatorHeader
							scenarioName={
								scenario.name?.includes('B20') || scenario.id?.includes('b20')
									? 'Ancoragem Forçada: Block Bet (20%)'
									: scenario.name
							}
							stacks={scenario.stacks}
							effectiveIpRp={finalIpRp}
							effectiveOopRp={finalOopRp}
							rpSource={rpSource}
							sidebarOpen={sidebarOpen}
							onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
						/>

						<div className="flex flex-col gap-24 pt-20 pb-32">
							<section
								className="sota-container animate-sota-in"
								aria-label="Dashboard Quântico"
							>
								<div className="max-w-4xl mx-auto mb-16 text-center space-y-6">
									<SectionHeader
										step="00"
										label="Telemetria Sistêmica"
										title="Dashboard SOTA"
										description="A sua Assinatura Bayesiana. A Mente Preditiva monitora seus erros de EV e distorções de Nash em tempo real."
									/>
									<div className="h-px w-24 bg-accent-indigo/30 mx-auto" />
								</div>
								<Suspense fallback={<LoadingFallback />}>
									<DashboardSOTA />
								</Suspense>
							</section>

							<section
								className="sota-container animate-sota-in"
								aria-label="Referencial Empírico"
							>
								<div className="max-w-4xl mx-auto mb-16 text-center space-y-8">
									<SectionHeader
										step="01"
										label="Referencial"
										title="Âncora Empírica (Aula 1.2)"
										description="Dados reais e fundamentos absolutos do motor de simulação."
									/>
									<p className="text-[0.9rem] text-text-dim leading-relaxed mx-auto max-w-3xl font-medium">
										Esta camada estabelece a{' '}
										<strong className="text-text-light uppercase tracking-widest text-xs">
											Topologia do Torneio
										</strong>
										{'. '}O motor ingere a estrutura de premiação e os stacks
										reais da Mesa Final para erguer as fundações matemáticas do
										cálculo de{' '}
										<em className="text-accent-indigo-light not-italic font-black">
											Bubble Factor
										</em>{' '}
										e{' '}
										<em className="text-accent-indigo-light not-italic font-black">
											Risk Premium
										</em>
										{'. '}
										Sem o Referencial, não há perspectiva.
									</p>
									<div className="h-px w-24 bg-accent-indigo/30 mx-auto" />
								</div>
								<Suspense fallback={<LoadingFallback />}>
									<ReferencialAula12 />
								</Suspense>
							</section>

							<section
								className="sota-container"
								aria-label="Framework de Perspectiva Matemática"
							>
								<div className="max-w-4xl mx-auto mb-16 text-center space-y-8">
									<SectionHeader
										step="02"
										label="Framework"
										title="Lente de Perspectiva Matemática (PM)"
										description="A decomposição cirúrgica do spot através da lente do ecossistema SOTA."
									/>
									<p className="text-[0.9rem] text-text-dim leading-relaxed mx-auto max-w-3xl font-medium">
										A{' '}
										<strong className="text-text-light uppercase tracking-widest text-xs">
											Métrica Soberana (PM)
										</strong>{' '}
										mede a verdadeira utilidade de uma ação, subtraindo o custo
										irrevogável (Sunk Cost) da expectativa purificada. A lente
										integra a Realização Posicional (R) e a punição
										gravitacional (FGS e RIO multiway).
									</p>
									<div className="h-px w-24 bg-accent-indigo/30 mx-auto" />
								</div>
								<Suspense fallback={<LoadingFallback />}>
									<div className="space-y-12 px-4 sm:px-0">
										<PmLensPanel
											key={`pmlens-${scenario.id}`}
											anteSize={anteSize}
											heroInvested={safeHeroInvested}
											currentPot={safeCurrentPot}
											activePlayers={safeActivePlayers}
											heroPosition={heroPosition}
											blindsRisingSoon={blindsRisingSoon}
											initialStacks={scenario.stacks}
											initialPrizes={scenario.prizes}
											pkoValue={pkoValue}
										/>
										<SimulatorQuizWidget simulatorState={scenario} />
									</div>
								</Suspense>
							</section>

							<section className="sota-container" aria-label="Laboratório ICM">
								<div className="max-w-4xl mx-auto mb-20 text-center space-y-8">
									<SectionHeader
										step="03"
										label="Laboratório"
										title="Motor ICM de Distorções"
										description="Explore as refrações dinâmicas de equilíbrio GTO no multiverso de ranges."
									/>
									<p className="text-[0.9rem] text-text-dim leading-relaxed mx-auto max-w-3xl font-medium">
										O orquestrador quântico (WebGPU/WASM) tritura a árvore de
										jogo em tempo real. Manipule os parâmetros de Agressão,
										Bounty (PKO) e o Modulador de Entropia (Fator Ψ) para
										observar como o{' '}
										<em className="text-accent-indigo-light not-italic font-black">
											Nash Equilibrium
										</em>{' '}
										se curva.
									</p>
									<div className="h-px w-24 bg-accent-indigo/30 mx-auto" />
								</div>

								<div
									className={`grid gap-12 items-start ${sidebarOpen ? 'grid-cols-1 xl:grid-cols-[360px_1fr]' : 'grid-cols-1'}`}
								>
									{sidebarOpen && (
										<aside className="lg:sticky lg:top-28 z-20">
											<ScenarioSelector
												scenarios={scenarios}
												activeId={scenario.id}
												onSelect={handleScenarioSelect}
											/>
										</aside>
									)}

									<main
										className="flex flex-col gap-12 min-w-0 transition-all duration-500 overflow-visible"
										role="main"
										aria-label="Painel de Ferramentas do Simulador"
									>
										<SimulatorNavigation
											activeTool={activeTool}
											onSelectTool={setActiveTool}
										/>
										<div
											className={`transition-all duration-500 overflow-visible ${isPending ? 'opacity-40 blur-sm scale-[0.99]' : 'opacity-100 scale-100'}`}
										>
											{activeToolContent}
										</div>
									</main>
								</div>
							</section>
						</div>

						<footer className="border-t border-white/5 py-24 relative overflow-hidden bg-bg-deep/50">
							<div className="absolute inset-0 bg-radial-[at_center_center] from-accent-indigo/5 to-transparent pointer-events-none" />
							<div className="sota-container px-6 flex flex-col items-center justify-center gap-10 relative z-10">
								<div className="text-center space-y-4">
									<p className="text-[0.8rem] font-black text-white uppercase tracking-[0.6em] m-0 opacity-90 group-hover:tracking-[0.7em] transition-all duration-1000">
										SOTA v6.2.1 GOLD
									</p>
									<div className="h-px w-32 bg-linear-to-r from-transparent via-accent-indigo/40 to-transparent mx-auto" />
									<p className="text-[0.65rem] font-bold text-text-muted uppercase tracking-[0.3em] m-0">
										Estado da Arte em Teoria de Jogo & Perspectiva Matemática
									</p>
								</div>
								<div className="flex flex-col items-center gap-3">
									<p className="text-[0.55rem] font-black text-text-darker uppercase tracking-[0.4em] m-0">
										© 2026 Raphael Vitoi · Monolito Nexus
									</p>
									<div className="flex gap-6 opacity-30">
										<i className="fa-brands fa-instagram text-sm" />
										<i className="fa-brands fa-twitch text-sm" />
										<i className="fa-brands fa-youtube text-sm" />
									</div>
								</div>
							</div>
						</footer>

						<SimulatorTour onStepAction={handleTourStep} onClose={closeTour} />
					</div>
				</SotaWasmContext>
			</SotaMetricsContext>
		</SotaSpotContext>
	);
}
