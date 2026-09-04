'use client';

/**
 * IDENTITY: Simulador Mestre ICM (Orquestrador SOTA v7.0 GOLD)
 * PATH: src/components/simulator/MasterSimulator.tsx
 * ROLE: Componente raiz unificado e centralizador de estado para toda a plataforma de simulação.
 * AESTHETIC: SOTA GOLD Standard (Precision Alignment, Golden Ratio, Glassmorphism, Zero-Entropy Layout).
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
import { Suspense, useEffect, useMemo, useDeferredValue, useTransition, useState } from 'react';
import useSWR from 'swr';
import { useLlamaEngine } from '../../hooks/useLlamaEngine';

import { MasterTableVisualizer } from './ui/MasterTableVisualizer';
import { ScenarioQuickSelector } from './ui/ScenarioQuickSelector';

// SOTA: Dynamic imports with ssr: false for WASM/Worker safety
const EquityCalculator = dynamic(() => import('./panels/EquityCalculator'), {
  ssr: false,
});
const GemmaAnalysisPanel = dynamic(() => import('./GemmaAnalysisPanel').then((m) => m.GemmaAnalysisPanel), {
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
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'laboratorio' | 'dashboard' | 'referencial' | 'lente'>('laboratorio');
  const [spotSubView, setSpotSubView] = useState<'nash' | 'insolvency' | 'ranges' | 'theory'>('nash');

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
      if (aggressionFactor !== (physics.edgeFactor ?? 1) && typeof setAggressionFactor === 'function') {
        setAggressionFactor(physics.edgeFactor ?? 1);
      }
    }
  }, [
    isSyncHydrated,
    physics?.pot,
    physics?.heroInvested,
    physics?.position,
    physics?.edgeFactor,
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
    pkoValue,
    aggFactor: aggressionFactor,
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
          {/* Cockpit 2-Colunas · Proporção Áurea (7:5) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

            {/* ═══ COLUNA PRINCIPAL (7/12) · Mesa + Controles + Lentes Modulares ═══ */}
            <div className="lg:col-span-7 flex flex-col gap-5">

              {/* Mesa Interativa 9P */}
              <div className="w-full">
                <MasterTableVisualizer
                  scenario={scenario}
                  heroPosition={heroPosition}
                  currentPot={safeCurrentPot}
                  effectiveIpRp={finalIpRp}
                  effectiveOopRp={finalOopRp}
                  onSelectPosition={(pos) => setHeroPosition(pos)}
                />
              </div>

              {/* Controles Espaciais */}
              <div className="w-full">
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
                  onUpdatePhysics={updatePhysics}
                />
              </div>

              {/* Seletor de Lentes do Spot */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-950/50 rounded-2xl border border-white/8 shadow-inner overflow-x-auto no-scrollbar">
                {[
                  { id: 'nash', label: 'Nash & Ações', icon: 'fa-chess-knight' },
                  { id: 'insolvency', label: 'Insolvência', icon: 'fa-radar' },
                  { id: 'ranges', label: 'Matriz 169', icon: 'fa-table-cells' },
                  { id: 'theory', label: 'Teoria', icon: 'fa-book-open' },
                ].map((sub) => {
                  const isSubActive = spotSubView === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSpotSubView(sub.id as 'nash' | 'insolvency' | 'ranges' | 'theory')}
                      className={`flex-1 px-3 py-2 rounded-xl text-[0.6rem] font-black uppercase tracking-[0.12em] transition-all duration-200 flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                        isSubActive
                          ? 'bg-accent-indigo/20 text-white border border-accent-indigo/40 shadow-md shadow-indigo-500/10'
                          : 'text-text-dim hover:text-text-muted hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <i className={`fa-solid ${sub.icon} text-[0.55rem] ${isSubActive ? 'text-accent-indigo' : ''}`} />
                      <span>{sub.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Conteúdo da Lente Ativa */}
              {spotSubView === 'nash' && (
                <div className="flex flex-col gap-4 animate-sota-in">
                  <div className="w-full">
                    <GuideToolbar onExport={handleExportHRC} />
                  </div>
                  {nashFlop && nashTurn && nashRiver && streetRps && (
                    <div className="w-full">
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
                    </div>
                  )}
                </div>
              )}

              {spotSubView === 'insolvency' && (
                <div className="animate-sota-in rounded-2xl border border-white/8 bg-slate-950/50 p-5 shadow-lg space-y-5">
                  {/* Radar de Insolvência */}
                  <div className="rounded-2xl border border-white/5 bg-black/30 p-5 shadow-inner">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="text-accent-rose flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10">
                        <i className="fa-solid fa-radar text-sm" />
                      </div>
                      <h3 className="m-0 text-sm font-black tracking-[0.2em] text-white uppercase">
                        Radar de Insolvência
                      </h3>
                    </div>
                    <div className="relative h-72 w-full">
                      <Suspense
                        fallback={
                          <div className="text-text-darker flex h-full animate-pulse items-center justify-center text-[0.6rem] font-black tracking-[0.3em] uppercase">
                            Sincronizando...
                          </div>
                        }
                      >
                        <InsolvencyRadar data={insolvencyRadarData} />
                      </Suspense>
                    </div>
                  </div>

                  {/* Distorções por Street */}
                  {nashResults?.flop && (
                    <div className="grid grid-cols-3 gap-3">
                      <NashDistortionViz streetName="Flop" nashData={nashResults.flop} />
                      <NashDistortionViz streetName="Turn" nashData={nashResults.turn ?? null} />
                      <NashDistortionViz streetName="River" nashData={nashResults.river ?? null} />
                    </div>
                  )}
                </div>
              )}

              {spotSubView === 'ranges' && (
                <div className="w-full animate-sota-in">
                  <RangeMatrix ipRp={finalIpRp} oopRp={finalOopRp} scenarioId={scenario.id} />
                </div>
              )}

              {spotSubView === 'theory' && (
                <div className="w-full animate-sota-in">
                  <TheoryPanel
                    scenario={scenario}
                    effectiveSprData={effectiveSprData}
                    effectiveIpRp={finalIpRp}
                    effectiveOopRp={finalOopRp}
                  />
                </div>
              )}
            </div>

            {/* ═══ COLUNA LATERAL (5/12) · Narrativa + IA + Telemetria ═══ */}
            <div className="lg:col-span-5 flex flex-col gap-5 lg:sticky lg:top-36">

              {/* Cenário: Narrativa e Medidores de Risco */}
              <ScenarioStage
                scenario={scenario}
                effectiveIpRp={finalIpRp}
                effectiveOopRp={finalOopRp}
                dynamicDeathZone={apiQuantumMetrics?.threshEq ? apiQuantumMetrics.threshEq * 100 : 0}
              />

              {/* Oráculo Gemma (IA Preditiva) */}
              <GemmaAnalysisPanel
                heroPos={heroPosition}
                villainPos={isIp ? 'OOP' : 'IP'}
                potSize={safeCurrentPot}
                heroStack={heroUpdatedStack}
                villainStack={villainUpdatedStack}
                heroInvested={safeHeroInvested}
                riskAdvantage={apiQuantumMetrics?.riskAdvantage ?? 0}
                bountyPower={0}
              />

              {/* Telemetria Quântica do Spot */}
              <div className="rounded-3xl border border-white/8 bg-slate-950/60 backdrop-blur-2xl p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
                  <span className="font-mono text-[0.6rem] font-black uppercase tracking-[0.2em] text-accent-emerald flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
                    <span>Física do Spot</span>
                  </span>
                  <span className="text-[0.5rem] font-mono text-text-dim uppercase tracking-wider">
                    v8.0 GOLD
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-[0.48rem] font-black uppercase tracking-wider text-text-dim block mb-0.5">
                      IP Risk Premium
                    </span>
                    <span className="font-mono text-base font-black text-accent-indigo">
                      {finalIpRp.toFixed(1)}%
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-[0.48rem] font-black uppercase tracking-wider text-text-dim block mb-0.5">
                      OOP Risk Premium
                    </span>
                    <span className="font-mono text-base font-black text-accent-rose">
                      {finalOopRp.toFixed(1)}%
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-[0.48rem] font-black uppercase tracking-wider text-text-dim block mb-0.5">
                      Assimetria (ΔRP)
                    </span>
                    <span className="font-mono text-base font-black text-white">
                      {Math.abs(finalIpRp - finalOopRp).toFixed(1)}%
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                    <span className="text-[0.48rem] font-black uppercase tracking-wider text-text-dim block mb-0.5">
                      Inércia FGS
                    </span>
                    <span className="font-mono text-base font-black text-accent-emerald">
                      {blindsRisingSoon ? 'Subindo' : 'Estável'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Suspense>
      ),
      calculator: (
        <Suspense fallback={<LoadingFallback />}>
          <div className="rounded-2xl border border-white/8 bg-slate-950/50 p-5 shadow-lg overflow-hidden">
            <EquityCalculator key={`calc-${scenario.id}`} />
          </div>
        </Suspense>
      ),
      matchup: (
        <Suspense fallback={<LoadingFallback />}>
          <div className="rounded-2xl border border-white/8 bg-slate-950/50 p-5 shadow-lg overflow-hidden">
            <MatchupSelector key={`match-${scenario.id}`} />
          </div>
        </Suspense>
      ),
      comparar: (
        <Suspense fallback={<LoadingFallback />}>
          <div className="w-full">
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
          <div className="rounded-2xl border border-white/8 bg-slate-950/50 p-5 shadow-lg overflow-hidden">
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
          </div>
        </Suspense>
      ),
      posflop: (
        <Suspense fallback={<LoadingFallback />}>
          <div className="rounded-2xl border border-white/8 bg-slate-950/50 p-5 shadow-lg overflow-hidden">
            <PostFlopPanel
              key={`pf-${scenario.id}`}
              anteSize={anteSize}
              scenarioId={scenario.id}
              initialStacks={scenario.stacks}
              initialPrizes={scenario.prizes}
              heroIsIp={isIp}
              activePlayers={safeActivePlayers}
              effectiveSprData={effectiveSprData}
              ipLabel={isIp ? heroPosition : undefined}
              oopLabel={!isIp ? heroPosition : undefined}
            />
          </div>
        </Suspense>
      ),
      cfr: (
        <Suspense fallback={<LoadingFallback />}>
          <div className="rounded-2xl border border-white/8 bg-slate-950/50 p-5 shadow-lg overflow-hidden min-h-140">
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

    return toolContents[activeTool] ?? toolContents.scenario;
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
    apiQuantumMetrics?.riskAdvantage,
    spotSubView,
    setHeroPosition,
    updatePhysics,
  ]);

  const getWorkspaceTabMeta = (tab: 'laboratorio' | 'dashboard' | 'referencial' | 'lente') => {
    switch (tab) {
      case 'laboratorio':
        return { text: 'Cockpit Estratégico', icon: 'fa-sliders' };
      case 'referencial':
        return { text: 'Referencial Aula 1.2', icon: 'fa-anchor' };
      case 'lente':
        return { text: 'Lente PM (Fator Ψ)', icon: 'fa-atom' };
      default:
        return { text: 'Telemetria & Radar', icon: 'fa-chart-line' };
    }
  };

  if (!isMounted) {
    return <LoadingFallback />;
  }

  return (
    <SotaSpotContext value={spotContextValue}>
      <SotaMetricsContext value={metricsContextValue}>
        <SotaWasmContext value={wasmContextValue}>
          <div className="w-full flex flex-col min-h-screen">
            {tourSpotlight && (
              <div
                className="tour-spotlight"
                style={tourSpotlightProps?.style}
              />
            )}

            {/* Barra de Navegação Mestre */}
            <div className="bg-slate-950/60 border-b border-white/8 px-4 sm:px-6 py-3 sticky top-16 z-30 backdrop-blur-2xl">
              <div className="flex flex-wrap items-center justify-between gap-3 max-w-7xl mx-auto">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-accent-indigo animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                  <span className="font-mono text-[0.62rem] font-black uppercase tracking-[0.2em] text-white">
                    Simulador Mestre ICM
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-white/8 shadow-inner">
                  {(['laboratorio', 'dashboard', 'referencial', 'lente'] as const).map((tab) => {
                    const isActive = activeWorkspaceTab === tab;
                    const meta = getWorkspaceTabMeta(tab);
                    return (
                      <button
                        type="button"
                        key={tab}
                        onClick={() => setActiveWorkspaceTab(tab)}
                        className={`px-3 py-1.5 rounded-lg text-[0.58rem] font-black uppercase tracking-[0.12em] transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                          isActive
                            ? 'bg-accent-indigo/20 text-white border border-accent-indigo/40 shadow-md'
                            : 'text-text-dim hover:text-text-muted hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <i className={`fa-solid ${meta.icon} text-[0.55rem] ${isActive ? 'text-accent-indigo' : ''}`} />
                        <span>{meta.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Conteúdo do Workspace Ativo */}
            <div className="w-full flex-1 py-6">
              {activeWorkspaceTab === 'laboratorio' && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 animate-sota-in" aria-label="Cockpit Estratégico & Cenários">
                  {/* Seletor Rápido dos 8 Cenários */}
                  <div className="rounded-2xl border border-white/8 bg-slate-950/50 p-4 sm:p-5 shadow-lg">
                    <ScenarioQuickSelector
                      scenarios={scenarios}
                      activeId={scenario.id}
                      onSelect={handleScenarioSelect}
                    />
                  </div>

                  {/* Barra de Ferramentas */}
                  <div className="rounded-2xl border border-white/8 bg-slate-950/50 p-1.5 shadow-lg">
                    <SimulatorNavigation activeTool={activeTool} onSelectTool={setActiveTool} />
                  </div>

                  {/* Palco Central de Execução */}
                  <div
                    className={`transition-all duration-200 ${
                      isPending ? 'scale-[0.995] opacity-50 blur-xs' : 'scale-100 opacity-100'
                    }`}
                  >
                    {activeToolContent}
                  </div>
                </section>
              )}

              {activeWorkspaceTab === 'dashboard' && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-sota-in" aria-label="Dashboard Quântico de Telemetria e Radar">
                  <div className="mx-auto mb-10 max-w-4xl space-y-4 text-center">
                    <SectionHeader
                      step="00"
                      label="Telemetria & Radar Studio"
                      title="Cockpit de Telemetria & Radar SOTA"
                      description="A sua Assinatura Bayesiana. A Mente Preditiva monitora seus erros de EV, tensões de insolvência e distorções de Nash em tempo real."
                    />
                    <div className="bg-accent-indigo/30 mx-auto h-px w-32" />
                  </div>
                  <Suspense fallback={<LoadingFallback />}>
                    <DashboardSOTA
                      scenarios={scenarios}
                      currentScenario={scenario}
                      nashFlop={nashFlop ?? undefined}
                      insolvencyRadarData={insolvencyRadarData}
                    />
                  </Suspense>
                </section>
              )}

              {activeWorkspaceTab === 'referencial' && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-sota-in" aria-label="Referencial Empírico">
                  <div className="mx-auto mb-10 max-w-4xl space-y-4 text-center">
                    <SectionHeader
                      step="01"
                      label="Referencial"
                      title="Âncora Empírica (Aula 1.2)"
                      description="Dados reais e fundamentos absolutos do motor de simulação."
                    />
                    <div className="bg-accent-indigo/30 mx-auto h-px w-32" />
                  </div>
                  <Suspense fallback={<LoadingFallback />}>
                    <ReferencialAula12 />
                  </Suspense>
                </section>
              )}

              {activeWorkspaceTab === 'lente' && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-sota-in" aria-label="Framework de Perspectiva Matemática">
                  <div className="mx-auto mb-10 max-w-4xl space-y-4 text-center">
                    <SectionHeader
                      step="02"
                      label="Framework"
                      title="Lente de Perspectiva (PM)"
                      description="O algoritmo matemático desenvolvido por Raphael Vitoi para quantificação do Fator Ψ."
                    />
                    <div className="bg-accent-indigo/30 mx-auto h-px w-32" />
                  </div>
                  <Suspense fallback={<LoadingFallback />}>
                    <PmLensPanel />
                  </Suspense>
                </section>
              )}
            </div>

            <SimulatorTour onStepAction={handleTourStep} onClose={closeTour} />
          </div>
        </SotaWasmContext>
      </SotaMetricsContext>
    </SotaSpotContext>
  );
}
