'use client';

/**
 * IDENTITY: Palco de ferramentas do Simulador Mestre (SOTA v8.0 GOLD)
 * PATH: src/components/simulator/ui/ToolContent.tsx
 * ROLE: Renderiza o conteúdo do `activeTool` — antes um useMemo monolítico
 *       dentro de MasterSimulator.tsx. Recebe os resultados dos hooks
 *       orquestradores já calculados e só compõe JSX.
 * NOTE: os painéis pesados seguem `dynamic(..., { ssr: false })` — WASM/workers.
 */

import { Suspense } from 'react';
import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import type { HeroPosition } from '../solver/types';
import type { useSimulatorState } from '../hooks/useSimulatorState';
import type { useScenario } from '../hooks/useScenario';
import type { useQuantumEngine } from '../hooks/useQuantumEngine';
import type { useMasterSpotLogic } from '../hooks/useMasterSpotLogic';
import type { useMasterCalculations } from '../hooks/useMasterCalculations';
import type { useMasterHandlers } from '../hooks/useMasterHandlers';
import type { useFrequencyPropagation } from '../hooks/useFrequencyPropagation';
import type { useSotaSync } from '../hooks/useSotaSync';
import type { useInsolvencyRadar } from '../hooks/useInsolvencyRadar';
import type { generateDynamicICMQuiz } from '../../quiz/icmQuizGenerator';
import { MasterTableVisualizer } from './MasterTableVisualizer';
import { SpatialControls } from './SpatialControls';
import { GuideToolbar } from './GuideToolbar';
import { NashDistortionViz } from './NashDistortionViz';

export type ActiveTool = 'scenario' | 'calculator' | 'matchup' | 'comparar' | 'perspectiva' | 'posflop' | 'cfr';

export type SpotSubView = 'nash' | 'insolvency' | 'ranges' | 'theory' | 'quiz';

type SimulatorStateResult = ReturnType<typeof useSimulatorState>;
type ScenarioResult = ReturnType<typeof useScenario>;
type QuantumResult = ReturnType<typeof useQuantumEngine>;
type SpotResult = ReturnType<typeof useMasterSpotLogic>;
type CalculationsResult = ReturnType<typeof useMasterCalculations>;
type HandlersResult = ReturnType<typeof useMasterHandlers>;
type FrequencyPropagationResult = ReturnType<typeof useFrequencyPropagation>;
type SotaSyncResult = ReturnType<typeof useSotaSync>;

export interface ToolContentProps {
  readonly activeTool: ActiveTool;
  readonly spotSubView: SpotSubView;
  readonly onSpotSubViewChange: (view: SpotSubView) => void;
  readonly scenario: ScenarioResult['scenario'];
  readonly scenarios: ScenarioResult['scenarios'];
  readonly state: SimulatorStateResult;
  readonly quantum: QuantumResult;
  readonly spot: SpotResult;
  readonly calculations: CalculationsResult;
  readonly insolvencyRadarData: ReturnType<typeof useInsolvencyRadar>;
  readonly dynamicQuizQuestions: ReturnType<typeof generateDynamicICMQuiz>;
  readonly safeHeroInvested: number;
  readonly safeCurrentPot: number;
  readonly safeActivePlayers: number;
  readonly updatePhysics: SotaSyncResult['updatePhysics'];
  readonly onTablePositionSelect: (position: HeroPosition) => void;
  readonly onHeroPositionChange: HandlersResult['handleHeroPositionChange'];
  readonly onStreetFreqChange: FrequencyPropagationResult['handleStreetFreqChange'];
  readonly onAggressionChange: (factor: number) => void;
  readonly onExportHrc: HandlersResult['handleExportHRC'];
}

export function LoadingFallback() {
  return (
    <div className="text-text-darker flex animate-pulse items-center justify-center p-16 text-[0.65rem] font-black tracking-[0.3em] uppercase">
      Sincronizando Mente Coletiva...
    </div>
  );
}

// SOTA: Dynamic imports with ssr: false for WASM/Worker safety
const EquityCalculator = dynamic(() => import('../panels/EquityCalculator'), {
  ssr: false,
});
const ComparisonRadar = dynamic(() => import('../panels/ComparisonRadar'), {
  ssr: false,
});
const PerspectivePanel = dynamic(() => import('../panels/PerspectivePanel'), {
  ssr: false,
});
const PostFlopPanel = dynamic(() => import('../panels/PostFlopPanel'), {
  ssr: false,
});
const CfrRegretPanel = dynamic(() => import('../panels/CfrRegretPanel'), {
  ssr: false,
});
const NashPanel = dynamic(() => import('../panels/NashPanel'), { ssr: false });
const TheoryPanel = dynamic(() => import('../panels/TheoryPanel'), {
  ssr: false,
});
const ScenarioStage = dynamic(() => import('../panels/ScenarioStage'), {
  ssr: false,
});
const MatchupSelector = dynamic(() => import('../panels/MatchupSelector'), {
  ssr: false,
});
const RangeMatrix = dynamic(() => import('../panels/RangeMatrix'), {
  ssr: false,
});
const InsolvencyRadar = dynamic(() => import('./InsolvencyRadar'), {
  ssr: false,
});
const QuizEngine = dynamic(() => import('../../quiz/QuizEngine').then((mod) => mod.QuizEngine), {
  ssr: false,
});

type ScenarioCockpitProps = Omit<
  ToolContentProps,
  'activeTool' | 'scenarios' | 'safeHeroInvested' | 'safeActivePlayers'
>;

function ScenarioCockpit({
  scenario,
  spotSubView,
  onSpotSubViewChange,
  state,
  quantum,
  spot,
  calculations,
  insolvencyRadarData,
  dynamicQuizQuestions,
  safeCurrentPot,
  updatePhysics,
  onTablePositionSelect,
  onHeroPositionChange,
  onStreetFreqChange,
  onAggressionChange,
  onExportHrc,
}: ScenarioCockpitProps): ReactNode {
  const {
    heroPosition,
    heroInvested,
    currentPot,
    activePlayers,
    isPredictive,
    streetFreqs,
    aggressionFactor,
    pkoValue,
    isNearPayjump,
    blindsRisingSoon,
    setHeroInvested,
    setCurrentPot,
    setActivePlayers,
    setIsPredictive,
    setPkoValue,
    setIsNearPayjump,
    setBlindsRisingSoon,
  } = state;
  const { nashFlop, nashTurn, nashRiver, streetRps, pkoPreview, effectiveSprData, nashResults } = quantum;
  const { finalIpRp, finalOopRp, isBaseline } = spot;
  const { apiQuantumMetrics } = calculations;

  return (
    <Suspense fallback={<LoadingFallback />}>
      {/* Cockpit 2-Colunas · Proporção Equilibrada (6:6) */}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
        {/* ═══ COLUNA PRINCIPAL (6/12) · Mesa + Controles + Lentes Modulares ═══ */}
        <div className="flex flex-col gap-5 lg:col-span-6">
          {/* Mesa Interativa 9P */}
          <div className="w-full">
            <MasterTableVisualizer
              scenario={scenario}
              heroPosition={heroPosition}
              currentPot={safeCurrentPot}
              effectiveIpRp={finalIpRp}
              effectiveOopRp={finalOopRp}
              onSelectPosition={onTablePositionSelect}
            />
          </div>

          {/* Controles Espaciais */}
          <div className="w-full">
            <SpatialControls
              heroPosition={heroPosition}
              handleHeroPositionChange={onHeroPositionChange}
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
          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-white/8 bg-slate-950/50 p-1 shadow-inner">
            {[
              { id: 'nash', label: 'Nash & Ações', icon: 'fa-chess-knight' },
              { id: 'insolvency', label: 'Insolvência', icon: 'fa-satellite-dish' },
              { id: 'ranges', label: 'Matriz 169', icon: 'fa-table-cells' },
              { id: 'theory', label: 'Teoria', icon: 'fa-book-open' },
              { id: 'quiz', label: 'Quiz ICM', icon: 'fa-graduation-cap' },
            ].map((sub) => {
              const isSubActive = spotSubView === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => onSpotSubViewChange(sub.id as SpotSubView)}
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold tracking-wide whitespace-nowrap uppercase transition-all duration-200 ${
                    isSubActive
                      ? 'bg-accent-indigo-surface/20 border-accent-indigo/40 border text-white shadow-md shadow-indigo-500/10'
                      : 'text-text-dim hover:text-text-muted border border-transparent hover:bg-white/5'
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
            <div className="animate-sota-in flex flex-col gap-4">
              <div className="w-full">
                <GuideToolbar onExport={onExportHrc} />
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
                    pkoPreview={pkoPreview}
                    isNearPayjump={isNearPayjump}
                    blindsRisingSoon={blindsRisingSoon}
                    isBaseline={isBaseline}
                    onStreetFreqChange={onStreetFreqChange}
                    onAggressionChange={onAggressionChange}
                    onPkoChange={setPkoValue}
                    onPayjumpToggle={setIsNearPayjump}
                    onBlindsToggle={setBlindsRisingSoon}
                  />
                </div>
              )}
            </div>
          )}

          {spotSubView === 'insolvency' && (
            <div className="animate-sota-in space-y-5 rounded-2xl border border-white/8 bg-slate-950/50 p-5 shadow-lg">
              {/* Radar de Insolvência */}
              <div className="rounded-2xl border border-white/5 bg-black/30 p-5 shadow-inner">
                <div className="mb-4 flex items-center gap-2.5">
                  <div className="text-accent-rose flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10">
                    <i className="fa-solid fa-satellite-dish text-sm" />
                  </div>
                  <h3 className="m-0 text-sm font-black tracking-[0.2em] text-white uppercase">Radar de Insolvência</h3>
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
            <div className="animate-sota-in w-full">
              <RangeMatrix ipRp={finalIpRp} oopRp={finalOopRp} scenarioId={scenario.id} />
            </div>
          )}

          {spotSubView === 'theory' && (
            <div className="animate-sota-in w-full">
              <TheoryPanel
                scenario={scenario}
                effectiveSprData={effectiveSprData}
                effectiveIpRp={finalIpRp}
                effectiveOopRp={finalOopRp}
              />
            </div>
          )}

          {spotSubView === 'quiz' && (
            <div className="animate-sota-in w-full rounded-2xl border border-white/8 bg-slate-950/50 p-5 shadow-lg">
              <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-accent-indigo-surface/10 border-accent-indigo/20 text-accent-indigo flex h-6 w-6 items-center justify-center rounded-lg border text-xs">
                    <i className="fa-solid fa-graduation-cap" />
                  </div>
                  <h4 className="m-0 text-xs font-black tracking-wider text-white uppercase">
                    Laboratório Didático ICM · {scenario.name}
                  </h4>
                </div>
                <span className="text-accent-indigo-light bg-accent-indigo-surface/10 border-accent-indigo/30 rounded border px-2 py-0.5 font-mono text-[0.52rem] tracking-widest uppercase">
                  Quiz Dinâmico SOTA
                </span>
              </div>
              <Suspense fallback={<LoadingFallback />}>
                <QuizEngine key={scenario.id} questions={dynamicQuizQuestions} />
              </Suspense>
            </div>
          )}
        </div>

        {/* ═══ COLUNA LATERAL (6/12) · Narrativa + IA + Telemetria ═══ */}
        <div className="flex flex-col gap-5 lg:col-span-6">
          {/* Cenário: Narrativa e Medidores de Risco */}
          <ScenarioStage
            scenario={scenario}
            effectiveIpRp={finalIpRp}
            effectiveOopRp={finalOopRp}
            dynamicDeathZone={apiQuantumMetrics?.threshEq ? apiQuantumMetrics.threshEq * 100 : 0}
          />

          {/* Telemetria Quântica do Spot */}
          <div className="space-y-3 rounded-3xl border border-white/8 bg-slate-950/60 p-5 shadow-xl backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <span className="text-accent-emerald flex items-center gap-2 font-mono text-xs font-black tracking-wide uppercase">
                <span className="bg-accent-emerald h-1.5 w-1.5 animate-pulse rounded-full" />
                <span>Física do Spot</span>
              </span>
              <span className="text-text-dim font-mono text-[0.5rem] tracking-wider uppercase">v8.0 GOLD</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                <span className="text-text-dim mb-0.5 block text-xs font-bold tracking-normal uppercase">
                  IP Risk Premium
                </span>
                <span className="text-accent-indigo-light font-mono text-base font-black">{finalIpRp.toFixed(1)}%</span>
              </div>

              <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                <span className="text-text-dim mb-0.5 block text-xs font-bold tracking-normal uppercase">
                  OOP Risk Premium
                </span>
                <span className="text-accent-rose font-mono text-base font-black">{finalOopRp.toFixed(1)}%</span>
              </div>

              <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                <span className="text-text-dim mb-0.5 block text-xs font-bold tracking-normal uppercase">
                  Assimetria (ΔRP)
                </span>
                <span className="font-mono text-base font-black text-white">
                  {Math.abs(finalIpRp - finalOopRp).toFixed(1)}%
                </span>
              </div>

              <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                <span className="text-text-dim mb-0.5 block text-xs font-bold tracking-normal uppercase">
                  Inércia FGS
                </span>
                <span className="text-accent-emerald font-mono text-base font-black">
                  {blindsRisingSoon ? 'Subindo' : 'Estável'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}

export function ToolContent({
  activeTool,
  scenarios,
  safeHeroInvested,
  safeActivePlayers,
  ...cockpitProps
}: ToolContentProps): ReactNode {
  const { scenario, quantum, spot, calculations, state, safeCurrentPot } = cockpitProps;
  const { anteSize, heroPosition, isNearPayjump, blindsRisingSoon } = state;
  const { isIp, heroUpdatedStack, villainUpdatedStack } = spot;
  const { nativeRangeMetric } = calculations;

  switch (activeTool) {
    case 'scenario':
      return <ScenarioCockpit {...cockpitProps} />;
    case 'calculator':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-slate-950/50 p-5 shadow-lg">
            <EquityCalculator key={`calc-${scenario.id}`} />
          </div>
        </Suspense>
      );
    case 'matchup':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-slate-950/50 p-5 shadow-lg">
            <MatchupSelector key={`match-${scenario.id}`} />
          </div>
        </Suspense>
      );
    case 'comparar':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <div className="w-full">
            {scenarios && scenarios.length > 0 ? (
              <ComparisonRadar
                key={`comp-${scenario.id}`}
                scenarios={scenarios}
                currentId={scenario.id}
                nashFlop={quantum.nashFlop ?? undefined}
              />
            ) : (
              <LoadingFallback />
            )}
          </div>
        </Suspense>
      );
    case 'perspectiva':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-slate-950/50 p-5 shadow-lg">
            <PerspectivePanel
              key={`persp-${scenario.id}`}
              initialStacks={scenario.stacks}
              initialPrizes={scenario.prizes}
              anteSize={anteSize}
              heroInvestedBb={safeHeroInvested}
              currentPotBb={safeCurrentPot}
              initialActivePlayers={safeActivePlayers}
              initialIsNearPayjump={isNearPayjump}
              initialBlindsRising={blindsRisingSoon}
            />
          </div>
        </Suspense>
      );
    case 'posflop':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-slate-950/50 p-5 shadow-lg">
            <PostFlopPanel
              key={`pf-${scenario.id}`}
              anteSize={anteSize}
              scenarioId={scenario.id}
              initialStacks={scenario.stacks}
              initialPrizes={scenario.prizes}
              heroIsIp={isIp}
              activePlayers={safeActivePlayers}
              effectiveSprData={quantum.effectiveSprData}
              ipLabel={isIp ? heroPosition : undefined}
              oopLabel={!isIp ? heroPosition : undefined}
            />
          </div>
        </Suspense>
      );
    case 'cfr':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <div className="min-h-140 overflow-hidden rounded-2xl border border-white/8 bg-slate-950/50 p-5 shadow-lg">
            <CfrRegretPanel
              key={`cfr-${scenario.id}`}
              initialPot={safeCurrentPot}
              initialStack={Math.max(0.1, Math.min(heroUpdatedStack, villainUpdatedStack) || 0.1)}
              initialEquity={nativeRangeMetric.equity}
            />
          </div>
        </Suspense>
      );
    default:
      return <ScenarioCockpit {...cockpitProps} />;
  }
}
