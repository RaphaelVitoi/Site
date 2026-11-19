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
import { SotaEcosystemProvider } from './SotaContext';
const SimulatorNavigation = dynamic(() => import('./ui/SimulatorNavigation'), {
  ssr: false,
});
import { LoadingFallback, ToolContent } from './ui/ToolContent';
import type { SpotSubView } from './ui/ToolContent';
import { useMasterCalculations } from './hooks/useMasterCalculations';
import { useMasterSpotLogic } from './hooks/useMasterSpotLogic';
import { useMasterHandlers } from './hooks/useMasterHandlers';
import { SectionHeader } from '../ui/layout/SectionHeader';
import { useMounted } from '../../hooks/useMounted';
import dynamic from 'next/dynamic';
import { Suspense, useCallback, useEffect, useMemo, useDeferredValue, useTransition, useState } from 'react';
import useSWR from 'swr';
import { fetchJson } from '@/lib/client-fetch';

import { ScenarioQuickSelector } from './ui/ScenarioQuickSelector';
import { generateDynamicICMQuiz } from '../quiz/icmQuizGenerator';

// SOTA: Dynamic imports with ssr: false for WASM/Worker safety
const PmLensPanel = dynamic(() => import('./panels/PmLensPanel'), {
  ssr: false,
});
const ReferencialAula12 = dynamic(() => import('./ReferencialAula12'), {
  ssr: false,
});

const DashboardSOTA = dynamic(() => import('./DashboardSOTA'), { ssr: false });

interface PredictivePayload {
  profile?: Record<string, number> | null;
  telemetry?: Array<{ evLoss: number; isCorrect: boolean; createdAt: string | Date }> | null;
}

const fetcher = (url: string) => fetchJson<PredictivePayload>(url, { timeoutMs: 10_000 });

export type { ActiveTool } from './ui/ToolContent';

export default function MasterSimulator() {
  const isMounted = useMounted();
  const { physics, updatePhysics, isHydrated: isSyncHydrated } = useSotaSync();
  const { scenario, setScenario, scenarios } = useScenario();
  const [isPending, startTransition] = useTransition();
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'laboratorio' | 'dashboard' | 'referencial' | 'lente'>(
    'laboratorio',
  );
  const [spotSubView, setSpotSubView] = useState<SpotSubView>('nash');

  const { data: predictiveData } = useSWR('/api/v1/predictive', fetcher, {
    revalidateOnFocus: false,
  });

  const state = useSimulatorState(scenario);

  const {
    aggressionFactor,
    setAggressionFactor,
    pkoValue,
    isNearPayjump,
    blindsRisingSoon,
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
    isPredictive,
    resetState,
  } = state;

  // SOTA: Sincronização de Física Transversal (Universal Table Physics)
  // Pot e HeroInvested sincronizam com o contexto; posição e agressão são
  // orquestradas na origem dos eventos para preservar a reatividade do simulador.
  useEffect(() => {
    if (isSyncHydrated && physics) {
      if (currentPot !== physics.pot && typeof setCurrentPot === 'function') {
        setCurrentPot(physics.pot);
      }
      if (heroInvested !== physics.heroInvested && typeof setHeroInvested === 'function') {
        setHeroInvested(physics.heroInvested);
      }
    }
  }, [isSyncHydrated, physics, currentPot, heroInvested, setCurrentPot, setHeroInvested]);

  const { handleStreetFreqChange } = useFrequencyPropagation(setStreetFreqs);

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

  const quantumResult = useQuantumEngine(deferredQuantumConfig);
  const {
    effectiveIpRp,
    effectiveOopRp,
    nashFlop,
    quantumPerspectiva,
    insolvencyMatrixData,
    isCalculatingInsolvency,
    nashResults,
    dispatchInsolvencyMatrix,
  } = quantumResult;

  // --- HOOKS ORQUESTRADORES SOTA v6 ---

  const calculationsResult = useMasterCalculations({
    scenario,
    aggressionFactor,
    safeHeroInvested,
    safeCurrentPot,
    quantumPerspectiva,
    insolvencyMatrixData,
  });
  const { bayesianWinProb, nativeRangeMetric, apiQuantumMetrics, setNativeRangeMetric } = calculationsResult;

  const spotResult = useMasterSpotLogic({
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
    insolvencyMatrixData,
    isCalculatingInsolvency,
    dispatchInsolvencyMatrix,
    nashResults,
    bayesianWinProb,
    predictiveProfile: stablePredictiveProfile,
    predictiveTelemetry: predictiveData?.telemetry || null,
    setNativeRangeMetric,
    pkoValue,
    aggFactor: aggressionFactor,
  });
  const { spotContextValue, metricsContextValue, wasmContextValue } = spotResult;

  const dynamicQuizQuestions = useMemo(() => {
    return generateDynamicICMQuiz({
      stacks: scenario.stacks,
      prizes: scenario.prizes,
      ...(stablePredictiveProfile ? { predictiveProfile: stablePredictiveProfile } : {}),
    });
  }, [scenario.stacks, scenario.prizes, stablePredictiveProfile]);

  const { handleScenarioSelect, handleExportHRC, handleHeroPositionChange } = useMasterHandlers({
    scenario,
    scenarios,
    anteSize,
    setScenario,
    resetState,
    updatePhysics,
    startTransition,
    setHeroPosition,
    setHeroInvested,
  });

  const handleAggressionChange = useCallback(
    (factor: number) => {
      setAggressionFactor(factor);
      updatePhysics({ edgeFactor: factor });
    },
    [setAggressionFactor, updatePhysics],
  );

  const insolvencyRadarData = useInsolvencyRadar(apiQuantumMetrics);

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
    <SotaEcosystemProvider
      spotContextValue={spotContextValue}
      metricsContextValue={metricsContextValue}
      wasmContextValue={wasmContextValue}
    >
      <div className="flex min-h-screen w-full flex-col">
        {/* Espaços de trabalho do simulador — a identidade está na barra de laboratórios acima. */}
        <nav
          aria-label="Áreas de trabalho do Simulador Mestre"
          className="sticky top-(--simulator-header-height) z-30 border-b border-white/8 bg-slate-950/60 px-4 py-2 backdrop-blur-2xl sm:px-6"
        >
          <div className="mx-auto flex max-w-7xl justify-center">
            <div className="flex flex-wrap items-center justify-center gap-1 rounded-xl border border-white/8 bg-slate-950/60 p-1 shadow-inner">
              {(['laboratorio', 'dashboard', 'referencial', 'lente'] as const).map((tab) => {
                const isActive = activeWorkspaceTab === tab;
                const meta = getWorkspaceTabMeta(tab);
                return (
                  <button
                    type="button"
                    key={tab}
                    onClick={() => setActiveWorkspaceTab(tab)}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-[0.58rem] font-black tracking-[0.12em] uppercase transition-all duration-200 ${
                      isActive
                        ? 'bg-accent-indigo/20 border-accent-indigo/40 border text-white shadow-md'
                        : 'text-text-dim hover:text-text-muted border border-transparent hover:bg-white/5'
                    }`}
                  >
                    <i className={`fa-solid ${meta.icon} text-[0.55rem] ${isActive ? 'text-accent-indigo' : ''}`} />
                    <span>{meta.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Conteúdo do Workspace Ativo */}
        <div className="w-full flex-1 py-6">
          {activeWorkspaceTab === 'laboratorio' && (
            <section
              className="animate-sota-in mx-auto max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8"
              aria-label="Cockpit Estratégico & Cenários"
            >
              {/* Atlas: cenários organizados por família estratégica */}
              <div className="rounded-2xl border border-white/8 bg-slate-950/50 p-4 shadow-lg sm:p-5">
                <ScenarioQuickSelector scenarios={scenarios} activeId={scenario.id} onSelect={handleScenarioSelect} />
              </div>

              {/* Barra de Ferramentas */}
              <div className="rounded-2xl border border-white/8 bg-slate-950/50 p-1.5 shadow-lg">
                <SimulatorNavigation activeTool={activeTool} onSelectTool={setActiveTool} />
              </div>

              {/* Palco Central de Execução */}
              <div
                id="simulator-tool-panel"
                role="tabpanel"
                aria-labelledby={`simulator-tab-${activeTool}`}
                className={`transition-all duration-200 ${
                  isPending ? 'scale-[0.995] opacity-50 blur-xs' : 'scale-100 opacity-100'
                }`}
              >
                <ToolContent
                  activeTool={activeTool}
                  spotSubView={spotSubView}
                  onSpotSubViewChange={setSpotSubView}
                  scenario={scenario}
                  scenarios={scenarios}
                  state={state}
                  quantum={quantumResult}
                  spot={spotResult}
                  calculations={calculationsResult}
                  insolvencyRadarData={insolvencyRadarData}
                  dynamicQuizQuestions={dynamicQuizQuestions}
                  safeHeroInvested={safeHeroInvested}
                  safeCurrentPot={safeCurrentPot}
                  safeActivePlayers={safeActivePlayers}
                  updatePhysics={updatePhysics}
                  onTablePositionSelect={(pos) => {
                    setHeroPosition(pos);
                    updatePhysics({ position: pos as 'IP' | 'OOP' | 'BB' | 'SB' });
                  }}
                  onHeroPositionChange={handleHeroPositionChange}
                  onStreetFreqChange={handleStreetFreqChange}
                  onAggressionChange={handleAggressionChange}
                  onExportHrc={handleExportHRC}
                />
              </div>
            </section>
          )}

          {activeWorkspaceTab === 'dashboard' && (
            <section
              className="animate-sota-in mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
              aria-label="Dashboard Quântico de Telemetria e Radar"
            >
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
                  {...(nashFlop ? { nashFlop } : {})}
                  insolvencyRadarData={insolvencyRadarData}
                />
              </Suspense>
            </section>
          )}

          {activeWorkspaceTab === 'referencial' && (
            <section
              className="animate-sota-in mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
              aria-label="Referencial Empírico"
            >
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
            <section
              className="animate-sota-in mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
              aria-label="Framework de Perspectiva Matemática"
            >
              <div className="mx-auto mb-10 max-w-4xl space-y-4 text-center">
                <SectionHeader
                  step="02"
                  label="Framework"
                  title="Lente de Perspectiva (PM)"
                  description="Ambiente de exploração da Perspectiva Matemática: cenários e modelos em desenvolvimento."
                />
                <div className="bg-accent-indigo/30 mx-auto h-px w-32" />
              </div>
              <Suspense fallback={<LoadingFallback />}>
                <PmLensPanel
                  initialStacks={scenario.stacks}
                  initialPrizes={scenario.prizes}
                  currentPot={safeCurrentPot}
                  heroInvested={safeHeroInvested}
                  heroPosition={heroPosition}
                  activePlayers={safeActivePlayers}
                  blindsRisingSoon={blindsRisingSoon}
                />
              </Suspense>
            </section>
          )}
        </div>
      </div>
    </SotaEcosystemProvider>
  );
}
