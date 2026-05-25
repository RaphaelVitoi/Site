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
import { SotaMetricsContext, SotaSpotContext, SotaWasmContext } from './SotaContext';
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
const SimulatorQuizWidget = dynamic(() => import('../quiz/SimulatorQuizWidget').then((m) => m.SimulatorQuizWidget), {
  ssr: false,
});
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

export type ActiveTool = 'scenario' | 'calculator' | 'matchup' | 'comparar' | 'perspectiva' | 'posflop' | 'cfr';

function LoadingFallback() {
  return (
    <div className="text-text-darker flex animate-pulse items-center justify-center p-16 text-[0.65rem] font-black tracking-[0.3em] uppercase">
      Sincronizando Mente Coletiva...
    </div>
  );
}

export default function MasterSimulator() {
  const isMounted = useMounted();
  const { physics, updatePhysics, isHydrated: isSyncHydrated } = useSotaSync();
  const { scenario, setScenario, scenarios } = useScenario();
  const [isPending, startTransition] = useTransition();

  const { data: predictiveData } = useSWR('/api/v1/predictive', fetcher, {
    revalidateOnFocus: false,
  });

  const state = useSimulatorState(scenario);

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
  } = state;

  // SOTA: Sincronização de Física Transversal (Universal Table Physics)
  useEffect(() => {
    if (isSyncHydrated && physics) {
      if (currentPot !== physics.pot && typeof setCurrentPot === 'function') {
        setCurrentPot(physics.pot);
      }
      if (heroInvested !== physics.heroInvested && typeof setHeroInvested === 'function') {
        setHeroInvested(physics.heroInvested);
      }
      if (heroPosition !== physics.position && typeof setHeroPosition === 'function') {
        setHeroPosition(physics.position);
      }
      if (aggressionFactor !== physics.edgeFactor && typeof setAggressionFactor === 'function') {
        setAggressionFactor(physics.edgeFactor ?? 1);
      }
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

  const safeCurrentPot =
    currentPot != null && !Number.isNaN(Number(currentPot)) ? Math.max(0.1, Number(currentPot)) : 2.5;
  const safeHeroInvested =
    heroInvested != null && !Number.isNaN(Number(heroInvested)) ? Math.max(0, Number(heroInvested)) : 1;
  const safeActivePlayers =
    activePlayers != null && !Number.isNaN(Number(activePlayers)) ? Math.max(2, Number(activePlayers)) : 2;

  // SOTA FIX: Selagem Profunda de Telemetria Preditiva
  const stablePredictiveProfile = useMemo(() => predictiveData?.profile || null, [predictiveData?.profile]);

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

  const { bayesianWinProb, nativeRangeMetric, apiQuantumMetrics, setNativeRangeMetric } = useMasterCalculations({
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
    updatePhysics,
    startTransition,
  });

  const { tourSpotlight, tourSpotlightProps, handleTourStep, closeTour } = useSimulatorTour(handleScenarioSelect);

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
              dynamicDeathZone={apiQuantumMetrics?.threshEq ? apiQuantumMetrics.threshEq * 100 : 0}
            />
            <GuideToolbar onExport={handleExportHRC} />
            <SpatialControls
              heroPosition={heroPosition}
              handleHeroPositionChange={handleHeroPositionChange}
              heroInvested={heroInvested}
              // @ts-expect-error - A propriedade 'setHeroInvested' pode não estar tipada em SpatialControlsProps
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

            <div className="glass-panel animate-sota-in border-white/10 p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] lg:p-14">
              <div className="group/insolvency relative mb-12 overflow-hidden rounded-4xl border border-white/5 bg-slate-950/40 p-10 shadow-inner">
                <div className="pointer-events-none absolute inset-0 bg-radial-[at_top_right] from-rose-500/5 to-transparent" />
                <div className="relative z-10 mb-10 flex flex-col items-center gap-4 text-center">
                  <div className="text-accent-rose flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 shadow-lg">
                    <i className="fa-solid fa-radar animate-pulse text-xl"></i>
                  </div>
                  <div className="space-y-2">
                    <h3 className="m-0 text-xl font-black tracking-[0.3em] text-white uppercase">
                      Diagnóstico de Insolvência
                    </h3>
                    <p className="text-text-muted text-[0.7rem] font-medium tracking-[0.2em] uppercase">
                      Mapeamento vetorial de tensões sistêmicas e colapso de equidade.
                    </p>
                  </div>
                </div>

                <div className="relative h-112 w-full">
                  <Suspense
                    fallback={
                      <div className="text-text-darker flex h-full animate-pulse items-center justify-center text-[0.65rem] font-black tracking-[0.4em] uppercase">
                        Sincronizando Radar...
                      </div>
                    }
                  >
                    <InsolvencyRadar data={insolvencyRadarData} />
                  </Suspense>
                </div>
              </div>

              {nashResults?.flop && (
                <div className="mb-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
                  <NashDistortionViz streetName="Flop" nashData={nashResults.flop} />
                  <NashDistortionViz streetName="Turn" nashData={nashResults.turn ?? null} />
                  <NashDistortionViz streetName="River" nashData={nashResults.river ?? null} />
                </div>
              )}
              <RangeMatrix ipRp={finalIpRp} oopRp={finalOopRp} scenarioId={scenario.id} />
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
          <div className="relative h-187.5 w-full">
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
          <div className="relative min-h-140 w-full">
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
    return toolContents[activeTool as ActiveTool] || null;
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
          {/* SOTA: Hard Containment (Zero Overflow / Zero Scroll) */}
          <div className="bg-bg-base flex h-dvh w-screen flex-col overflow-hidden">
            {tourSpotlight && <div className="tour-spotlight" {...tourSpotlightProps} />}

            <div className="shrink-0">
              <SimulatorHeader
                scenarioName={
                  scenario.name?.includes('B20') || scenario.id?.includes('b20')
                    ? 'Ancoragem Forcada: Block Bet (20%)'
                    : scenario.name
                }
                stacks={scenario.stacks}
                effectiveIpRp={finalIpRp}
                effectiveOopRp={finalOopRp}
                rpSource={rpSource}
                sidebarOpen={sidebarOpen}
                onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              />
            </div>

            {/* Area do Simulador: Flexivel, mas estritamente contida no Viewport */}
            <div className="relative flex w-full flex-1 flex-col overflow-hidden">
              <div className="h-full w-full flex-1 overflow-y-auto px-4 py-6 sm:px-8">
                <section className="sota-container animate-sota-in" aria-label="Dashboard Quântico">
                  <div className="mx-auto mb-16 max-w-4xl space-y-6 text-center">
                    <SectionHeader
                      step="00"
                      label="Telemetria Sistemica"
                      title="Dashboard SOTA"
                      description="A sua Assinatura Bayesiana. A Mente Preditiva monitora seus erros de EV e distorcoes de Nash em tempo real."
                    />
                    <div className="bg-accent-indigo/30 mx-auto h-px w-24" />
                  </div>
                  <Suspense fallback={<LoadingFallback />}>
                    <DashboardSOTA />
                  </Suspense>
                </section>

                <section className="sota-container animate-sota-in" aria-label="Referencial Empirico">
                  <div className="mx-auto mb-16 max-w-4xl space-y-8 text-center">
                    <SectionHeader
                      step="01"
                      label="Referencial"
                      title="Ancora Empirica (Aula 1.2)"
                      description="Dados reais e fundamentos absolutos do motor de simulacao."
                    />
                    <p className="text-text-dim mx-auto max-w-3xl text-[0.9rem] leading-relaxed font-medium">
                      Esta camada estabelece a{' '}
                      <strong className="text-text-light text-xs tracking-widest uppercase">
                        Topologia do Torneio
                      </strong>
                      {'. '}O motor ingere a estrutura de premiacao e os stacks reais da Mesa Final para erguer as
                      fundacoes matematicas do calculo de{' '}
                      <em className="text-accent-indigo-light font-black not-italic">Bubble Factor</em> e{' '}
                      <em className="text-accent-indigo-light font-black not-italic">Risk Premium</em>
                      {'. '}
                      Sem o Referencial, nao ha perspectiva.
                    </p>
                    <div className="bg-accent-indigo/30 mx-auto h-px w-24" />
                  </div>
                  <Suspense fallback={<LoadingFallback />}>
                    <ReferencialAula12 />
                  </Suspense>
                </section>

                <section className="sota-container animate-sota-in" aria-label="Framework de Perspectiva Matematica">
                  <div className="mx-auto mb-16 max-w-4xl space-y-8 text-center">
                    <SectionHeader
                      step="02"
                      label="Framework"
                      title="Lente de Perspectiva Matematica (PM)"
                      description="A decompocisao cirurgica do spot atraves da lente do ecossistema SOTA."
                    />
                    <p className="text-text-dim mx-auto max-w-3xl text-[0.9rem] leading-relaxed font-medium">
                      A{' '}
                      <strong className="text-text-light text-xs tracking-widest uppercase">
                        Metrica Soberana (PM)
                      </strong>{' '}
                      mede a verdadeira utilidade de uma acao, subtraindo o custo irrevogavel (Sunk Cost) da expectativa
                      purificada. A lente integra a Realizacao Posicional (R) e a punicao gravitacional (FGS e RIO
                      multiway).
                    </p>
                    <div className="bg-accent-indigo/30 mx-auto h-px w-24" />
                  </div>
                  <Suspense fallback={<LoadingFallback />}>
                    <div className="space-y-12 px-4 sm:px-0">
                      <PmLensPanel
                        key={`pmlens-${scenario.id}`}
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

                <section className="sota-container" aria-label="Laboratorio ICM">
                  <div className="mx-auto mb-20 max-w-4xl space-y-8 text-center">
                    <SectionHeader
                      step="03"
                      label="Laboratorio"
                      title="Motor ICM de Distorcoes"
                      description="Explore as refracoes dinamicas de equilibrio GTO no multiverso de ranges."
                    />
                    <p className="text-text-dim mx-auto max-w-3xl text-[0.9rem] leading-relaxed font-medium">
                      O orquestrador quantico (WebGPU/WASM) tritura a arvore de jogo em tempo real. Manipule os
                      parametros de Agressao, Bounty (PKO) e o Modulador de Entropia (Fator Psi) para observar como o{' '}
                      <em className="text-accent-indigo-light font-black not-italic">Nash Equilibrium</em> se curva.
                    </p>
                    <div className="bg-accent-indigo/30 mx-auto h-px w-24" />
                  </div>

                  <div
                    className={`grid items-start gap-12 ${sidebarOpen ? 'grid-cols-1 xl:grid-cols-[360px_1fr]' : 'grid-cols-1'}`}
                  >
                    {sidebarOpen && (
                      <aside className="z-20 lg:sticky lg:top-28">
                        <ScenarioSelector
                          scenarios={scenarios}
                          activeId={scenario.id}
                          onSelect={handleScenarioSelect}
                        />
                      </aside>
                    )}

                    <main
                      className="flex min-w-0 flex-col gap-12 overflow-visible transition-all duration-500"
                      role="main"
                      aria-label="Painel de Ferramentas do Simulador"
                    >
                      <SimulatorNavigation activeTool={activeTool} onSelectTool={setActiveTool} />
                      <div
                        className={`overflow-visible transition-all duration-500 ${isPending ? 'scale-[0.99] opacity-40 blur-sm' : 'scale-100 opacity-100'}`}
                      >
                        {activeToolContent}
                      </div>
                    </main>
                  </div>
                </section>
              </div>

              <footer className="bg-bg-deep/50 relative overflow-hidden border-t border-white/5 py-24">
                <div className="from-accent-indigo/5 pointer-events-none absolute inset-0 bg-radial-[at_center_center] to-transparent" />
                <div className="sota-container relative z-10 flex flex-col items-center justify-center gap-10 px-6">
                  <div className="space-y-4 text-center">
                    <p className="m-0 text-[0.8rem] font-black tracking-[0.6em] text-white uppercase opacity-90 transition-all duration-1000 group-hover:tracking-[0.7em]">
                      SOTA v6.2.1 GOLD
                    </p>
                    <div className="via-accent-indigo/40 mx-auto h-px w-32 bg-linear-to-r from-transparent to-transparent" />
                    <p className="text-text-muted m-0 text-[0.65rem] font-bold tracking-[0.3em] uppercase">
                      Estado da Arte em Teoria de Jogo & Perspectiva Matematica
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-text-darker m-0 text-[0.55rem] font-black tracking-[0.4em] uppercase">
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
          </div>
        </SotaWasmContext>
      </SotaMetricsContext>
    </SotaSpotContext>
  );
}
