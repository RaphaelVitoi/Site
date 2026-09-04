'use client';

/**
 * IDENTITY: PM Lens — Framework PM incidindo sobre o Referencial SOTA v7.0 GOLD
 * PATH: src/components/simulator/panels/PmLensPanel.tsx
 * ROLE: Dado o FT real e a equity da mão fornecida pelo usuário, calcula por street:
 *         EV_fold = −heroCost  [1ª ordem — dominante]
 *         E = Esperança Matemática (ICM, sem R)
 *         P = Expectativa (E × R — realização positional)
 *         PM = P − EV_fold  [positivo → ação preferível ao fold]
 *
 * BINDING: [lib/perspectiva.ts, components/simulator/hooks/*, components/simulator/ui/*]
 */

import { formatCi, formatPct, getPmColorClass, getVerdictText } from '@/components/simulator/solver/utils';
import { useDebouncedLocalStorage } from '@/components/simulator/hooks/useDebouncedLocalStorage';
import { usePmLensCalculations } from '@/components/simulator/hooks/usePmLensCalculations';
import { MetricRow } from '@/components/simulator/ui/MetricRow';
import { SelectBtn } from '@/components/simulator/ui/SelectBtn';
import { useCallback, use, useEffect, useState } from 'react';
import type { HeroPosition, NodelockConstraint } from '../solver/types';
import { SotaWasmContext } from '../SotaContext';
import { SniperBadge } from './SniperBadge';

const DEFAULT_PLAYERS = ['UTG', 'EP', 'MP1', 'MP2', 'HJ', 'CO', 'BU', 'SB', 'BB'];
const DEFAULT_STACKS = [9.4, 52.4, 22.2, 7, 44.3, 24.3, 40, 13.4, 55];
const DEFAULT_PRIZES = [237.34, 170.96, 135.17, 109.99, 90.28, 73.95, 59.92, 47.56, 36.47];

const LABELS = {
  diagnosticTitle: 'Diagnóstico da Perspectiva (Paradigma Vitoi)',
  expectationPrefix: 'Expectativa: ',
  totalCostPrefix: 'Custo Total: -',
  formulaCollapsed: 'PM = (Exp × R × Val) – (EV_Fold + RIO)',
  dynamicEq: 'Equação Dinâmica',
  perspective: 'Perspectiva',
  frameworkPm: 'Framework PM',
  lensSubtitle: '· Lente de Perspectiva',
  telemetryTitle: 'Telemetria Sistêmica de Sunk Cost · ',
  sotaGold: 'SOTA v7.0 GOLD',
  heroAggressor: 'Hero (Agressor)',
  sprActive: 'SPR Active',
  villainsMultiway: 'Villain(s) - Multiway',
  n2Complexity: 'N² Complexity',
  realizationR: 'Realização (R)',
  realizationAdjustment: 'Ajuste de under/over realization. R<1 = perda de EQ.',
  villainAggFactor: 'Villain AggFactor',
  extremeAggWarning: 'Agg extrema OOP destrói sua Realização (R).',
  motorRActive: 'Motor R Ativo:',
  nodelockTriggered: 'A estrutura SPR foi mitigada (+40%/street). Axioma Lipe Piv acionado (κ: ',
  rawEquity: 'Equity Bruta',
  inVacuum: 'No vácuo · Cega para FGS, RIO e Pressão ICM.',
  kappaCredibility: 'κ Credibilidade',
  heroRange: 'Hero Range',
  villainRange: 'Villain Range',
  boardStructural: 'Board Structural',
  sizing: 'Sizing',
  computeShaderDesc: 'Invoca Compute Shader p/ Monte Carlo O(1)',
} as const;

interface PmLensPanelProps {
  heroInvested?: number;
  currentPot?: number;
  activePlayers?: number;
  heroPosition?: HeroPosition;
  blindsRisingSoon?: boolean;
  initialStacks?: number[];
  initialPrizes?: number[];
}

interface InsightAlert {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'danger' | 'info';
  icon: string;
}

function getInsightTypeClass(type: string): string {
  if (type === 'danger') {
    return 'bg-red-500/5 border-red-500/20 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.15)]';
  }
  if (type === 'warning') {
    return 'bg-amber-500/5 border-amber-500/20 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.15)]';
  }
  return 'bg-blue-500/5 border-blue-500/20 text-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.15)]';
}

const InsightBanner = ({ insights }: { readonly insights: InsightAlert[] }) => {
  if (insights.length === 0) return null;

  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-white/5 bg-black/50 p-6 shadow-inner backdrop-blur-md sm:p-8">
      <div className="flex items-center gap-3">
        <i className="fa-solid fa-brain text-accent-indigo animate-pulse text-sm" />
        <h4 className="text-text-main m-0 text-[0.65rem] font-black tracking-[0.25em] uppercase">
          {LABELS.diagnosticTitle}
        </h4>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {insights.map((ins) => {
          const typeClass = getInsightTypeClass(ins.type);

          return (
            <div
              key={ins.id}
              className={`flex items-start gap-4 rounded-2xl border p-4 transition-all duration-300 hover:scale-[1.01] ${typeClass}`}
            >
              <i className={`${ins.icon} mt-0.5 text-base`} />
              <div className="flex flex-col gap-1">
                <span className="text-[0.65rem] font-black tracking-wider text-white uppercase">{ins.title}</span>
                <p className="text-text-dim m-0 text-[0.55rem] leading-relaxed font-medium normal-case">
                  {ins.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface EquationData {
  handEquity: number;
  realizationFactor: number;
  valuation: number;
  evFold: number;
  rio: number;
  PM: number;
  loading: boolean;
}

const InteractiveEquation = ({ s }: { readonly s: EquationData }) => {
  const [hovered, setHovered] = useState(false);
  const expectationVal = (s.handEquity * s.realizationFactor * s.valuation).toFixed(1);
  const costVal = (Math.abs(s.evFold) + s.rio).toFixed(1);
  const calculatedPm = s.PM.toFixed(1);

  return (
    <button
      type="button"
      className="group/eq mt-2 flex cursor-help flex-col gap-2 border-t border-white/5 pt-4 select-none w-full text-left bg-transparent p-0 outline-none border-x-0 border-b-0"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <div className="flex items-center justify-between w-full">
        <span className="text-text-muted flex items-center gap-1 text-[0.6rem] font-black tracking-[0.2em] uppercase transition-colors group-hover/eq:text-white">
          {hovered ? LABELS.dynamicEq : LABELS.perspective}
          <i className="fa-solid fa-circle-question text-[0.55rem] opacity-40" />
        </span>
        <span
          className={`font-mono text-2xl font-black tracking-tighter tabular-nums transition-all duration-300 ${s.loading ? 'text-text-darker' : getPmColorClass(s.PM)}`}
        >
          {s.loading ? '...' : formatPct(s.PM)}
        </span>
      </div>

      {hovered ? (
        <div className="text-text-dim animate-fade-in rounded-xl border border-white/10 bg-black/80 p-2.5 font-mono text-[0.42rem] leading-relaxed shadow-inner backdrop-blur-md w-full">
          <div className="mb-1.5 flex justify-between border-b border-white/5 pb-1.5 font-bold tracking-wider text-white uppercase">
            <span>{LABELS.expectationPrefix}{expectationVal}%</span>
            <span>{LABELS.totalCostPrefix}{costVal}%</span>
          </div>
          <div className="text-right text-white/95">
            ({s.handEquity.toFixed(0)}% Eq × {s.realizationFactor.toFixed(2)} R × {s.valuation.toFixed(2)} Val) - (|
            {s.evFold.toFixed(1)}%| EV_Fold + {s.rio.toFixed(1)}% RIO) ={' '}
            <span className={`font-bold ${getPmColorClass(s.PM)}`}>{calculatedPm}% PM</span>
          </div>
        </div>
      ) : (
        <p className="text-text-darker group-hover/eq:text-text-muted m-0 text-right text-[0.45rem] leading-tight font-black tracking-widest uppercase transition-colors w-full">
          {LABELS.formulaCollapsed}
        </p>
      )}
    </button>
  );
};

export default function PmLensPanel({
  heroInvested = 1,
  currentPot = 2.5,
  activePlayers: _activePlayers = 2,
  heroPosition: _heroPosition = 'BB',
  blindsRisingSoon = false,
  initialStacks = DEFAULT_STACKS,
  initialPrizes = DEFAULT_PRIZES,
}: Readonly<PmLensPanelProps>) {
  const getInitialHeroIdx = () => {
    if (_heroPosition === 'BB') return Math.min(8, initialStacks.length - 1);
    if (_heroPosition === 'SB') return Math.min(7, initialStacks.length - 2);
    if (_heroPosition === 'IP') return Math.min(6, initialStacks.length - 3);
    return Math.min(0, initialStacks.length - 1);
  };
  const [heroIdx, setHeroIdx] = useState(getInitialHeroIdx);
  const [villainIndices, setVillainIndices] = useState<number[]>(() => {
    const numVillains = Math.max(1, _activePlayers - 1);
    const valid = Array.from({ length: initialStacks.length }, (_, i) => i).filter((i) => i !== getInitialHeroIdx());
    if (valid.length >= numVillains) return valid.slice(0, numVillains);
    return valid.length > 0 ? valid : [Math.max(0, initialStacks.length - 3)];
  });

  const primaryVillainIdx = villainIndices[0] ?? Math.min(6, Math.max(0, initialStacks.length - 3));
  const simulatedActivePlayers = 1 + villainIndices.length;
  const [kappa, setKappa] = useState(0.5);
  const [deltaHabilidade] = useDebouncedLocalStorage<number>('vitoi_pm_delta_habilidade', 50);
  const [activeNodelock, setActiveNodelock] = useState<NodelockConstraint | null>(null);

  const [customR, setCustomR] = useState<number | null>(null);
  const [aggFactor, setAggFactor] = useState<number>(1);

  const [board, setBoard] = useState('');
  const [betSizing, setBetSizing] = useState<number>(0.5);

  const getPostFlopOrder = (idx: number) => {
    if (idx === 7) return 0;
    if (idx === 8) return 1;
    return idx + 2;
  };
  const isHeroIP = getPostFlopOrder(heroIdx) > getPostFlopOrder(primaryVillainIdx);

  const heroStack = initialStacks.at(heroIdx) ?? 10;
  const spr = Math.max(0.1, heroStack / Math.max(1, currentPot));

  // SOTA v7.0 GOLD: A Realizacao (R) e agora uma resultante da fisica unificada.
  const posBaseline = isHeroIP ? 1 : 0.85;
  const defaultR = Math.max(0.1, Math.min(1.5, posBaseline));

  const realizationFactor = customR ?? defaultR;

  useEffect(() => {
    setCustomR(null);
  }, [isHeroIP]);

  let absoluteHeroPos: HeroPosition = 'IP';
  if (heroIdx === 8) absoluteHeroPos = 'BB';
  else if (heroIdx === 7) absoluteHeroPos = 'SB';

  const ecosystem = use(SotaWasmContext);

  // SOTA FIX: O Win Rate triturado pelo Monte Carlo (WebGPU) torna-se a Equity absoluta
  const rawGpuEquity = ecosystem?.insolvencyMatrixData?.winRate
    ? ecosystem.insolvencyMatrixData.winRate * 100
    : undefined;
  const equity =
    rawGpuEquity === undefined ? (ecosystem?.nativeRangeMetric?.equity ?? 50) : Number(rawGpuEquity.toFixed(1));
  const isCalculatingEq = ecosystem?.isCalculatingInsolvency ?? false;

  useEffect(() => {
    setHeroIdx(getInitialHeroIdx());
  }, [_heroPosition, initialStacks.length]);

  useEffect(() => {
    const numVillains = Math.max(1, _activePlayers - 1);
    setVillainIndices((prev) => {
      const valid = prev.filter((idx) => idx < initialStacks.length && idx !== heroIdx);
      if (valid.length === numVillains) return valid;
      const newVillains = [];
      for (let i = 0; i < initialStacks.length && newVillains.length < numVillains; i++) {
        if (i !== heroIdx) newVillains.push(i);
      }
      return newVillains.length > 0 ? newVillains : [Math.max(0, initialStacks.length - 3)];
    });
  }, [_activePlayers, heroIdx, initialStacks.length]);

  useEffect(() => {
    if (heroIdx >= initialStacks.length) {
      setHeroIdx(Math.max(0, initialStacks.length - 1));
    }
    setVillainIndices((prev) => {
      const valid = prev.filter((idx) => idx < initialStacks.length);
      if (valid.length === 0) return [Math.max(0, initialStacks.length - 3)];
      return valid;
    });
  }, [initialStacks.length, heroIdx]);

  const [heroRange, setHeroRange] = useState('AhKd');
  const [villainRange, setVillainRange] = useState('100%');

  // SOTA v7.0: Orquestração de Cálculo Modularizada
  const { streetMetrics } = usePmLensCalculations({
    initialStacks,
    initialPrizes,
    heroIdx,
    primaryVillainIdx,
    currentPot,
    heroInvested,
    equity,
    realizationFactor,
    deltaHabilidade,
    kappa,
    simulatedActivePlayers,
    absoluteHeroPos,
    blindsRisingSoon,
    activeNodelock,
    betSizing,
    aggFactor,
  });

  const getInsights = useCallback((): InsightAlert[] => {
    const insights: InsightAlert[] = [];
    const firstMetric = streetMetrics[0];
    if (!firstMetric || firstMetric.loading) return insights;

    const river = streetMetrics[3];
    const heroStack = initialStacks.at(heroIdx) ?? 10;

    // 1. Falácia ChipEV
    const hasInsolvencyWithHighEquity = streetMetrics.some((s) => s.ci !== null && s.ci < 1 && equity > 45);
    if (hasInsolvencyWithHighEquity) {
      insights.push({
        id: 'chipev-fallacy',
        title: 'Falácia ChipEV Ativa',
        description:
          'As Pot Odds indicam defesa barata, mas a inflação de ICM e passivo de RIO tornam a jogada insolvente. Priorize a sobrevivência.',
        type: 'danger',
        icon: 'fa-solid fa-radiation text-red-500',
      });
    }

    // 2. Pot Entrapment
    if (river && river.heroCost > heroStack * 0.25) {
      const pct = ((river.heroCost / heroStack) * 100).toFixed(0);
      insights.push({
        id: 'pot-entrapment',
        title: 'Pot Entrapment Crítico',
        description: `Custo afundado no River representa ${pct}% do seu stack inicial. O custo de foldar é extremo; decisões futuras estão travadas em pedra.`,
        type: 'warning',
        icon: 'fa-solid fa-anchor text-amber-400',
      });
    }

    // 3. Fricção Lipe Piv (OOP)
    if (realizationFactor < 0.85 && (absoluteHeroPos === 'SB' || absoluteHeroPos === 'BB' || !isHeroIP)) {
      insights.push({
        id: 'lipe-piv-friction',
        title: 'Fricção OOP (Axioma Lipe Piv)',
        description: `Jogar fora de posição contra adversário agressivo destrói sua equidade. Realização degradada para ${(realizationFactor * 100).toFixed(0)}%. Evite flat calls passivos.`,
        type: 'warning',
        icon: 'fa-solid fa-triangle-exclamation text-amber-400',
      });
    }

    // 4. Erosão Gravitacional FGS
    if (blindsRisingSoon && heroStack < 15) {
      insights.push({
        id: 'fgs-erosion',
        title: 'Erosão FGS Ativa',
        description:
          'Blinds subindo e stack curto tornam a inércia fatal. O custo passivo dos blinds/antes vai corroer seu stack em breve, exigindo agressão marginal imediata.',
        type: 'info',
        icon: 'fa-solid fa-circle-info text-blue-400',
      });
    }

    return insights;
  }, [streetMetrics, equity, initialStacks, heroIdx, realizationFactor, absoluteHeroPos, isHeroIP, blindsRisingSoon]);

  const handleCalculateEquity = () => {
    if (ecosystem?.dispatchInsolvencyMatrix && heroRange && villainRange) {
      // SOTA: Acopla a Tensão Sistêmica (RP) baseando-se na vantagem posicional
      const rpFactor = isHeroIP ? 15 : 25;
      ecosystem.dispatchInsolvencyMatrix({
        villainRange,
        board,
        rpFactor,
        heroInvested,
        currentPot,
        activePlayers: simulatedActivePlayers,
        kappaOverride: kappa,
        heroRange,
        betSizing,
      });
    }
  };

  const toggleVillain = useCallback((index: number) => {
    setVillainIndices((prev) => {
      if (prev.includes(index)) {
        if (prev.length === 1) return prev;
        return prev.filter((v) => v !== index);
      }
      return [...prev, index];
    });
  }, []);

  return (
    <div className="glass-panel animate-sota-in relative flex flex-col gap-12 overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)]">
      <div className="bg-accent-indigo/5 pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl" />

      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-white/5 pb-10">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div className="flex items-center gap-6">
            <div className="bg-accent-indigo h-3 w-3 rounded-full shadow-[0_0_20px_var(--accent-indigo)] animate-pulse" />
            <div>
              <h3 className="text-white m-0 text-[0.9rem] font-black tracking-[0.45em] uppercase">
                {LABELS.frameworkPm} <span className="text-text-darker ml-2">{LABELS.lensSubtitle}</span>
              </h3>
              <p className="text-text-muted m-0 mt-2 text-[0.6rem] font-black tracking-[0.3em] uppercase">
                {LABELS.telemetryTitle}<span className="text-accent-indigo-light">{LABELS.sotaGold}</span>
              </p>
            </div>
          </div>
          <SniperBadge
            pm={streetMetrics[0]?.PM ?? 0}
            ci={streetMetrics[0]?.ci ?? null}
            stackEff={Math.min(initialStacks.at(heroIdx) ?? 0, initialStacks.at(primaryVillainIdx) ?? 0)}
          />
        </div>
      </div>

      {/* Controles */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_minmax(380px,480px)]">
        <div className="flex flex-col gap-12">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            <div className="space-y-5">
              <div className="flex items-center justify-between px-1">
                <span className="text-text-muted text-[0.65rem] font-black tracking-[0.3em] uppercase">
                  {LABELS.heroAggressor}
                </span>
                <span className="text-text-darker rounded-md bg-black/40 px-2.5 py-1 text-[0.5rem] font-black tracking-widest uppercase">
                  {LABELS.sprActive}
                </span>
              </div>
              <div className="scrollbar-hide flex flex-wrap gap-2.5 overflow-x-auto pb-4">
                {DEFAULT_PLAYERS.slice(0, initialStacks.length).map((p, i) => (
                  <SelectBtn
                    key={p}
                    label={`${p} ${initialStacks.at(i) ?? 0}bb`}
                    active={heroIdx === i}
                    variant="hero"
                    impossible={villainIndices.includes(i)}
                    onClick={() => setHeroIdx(i)}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-5">
              <div className="flex items-center justify-between px-1">
                <span className="text-text-muted text-[0.65rem] font-black tracking-[0.3em] uppercase">
                  {LABELS.villainsMultiway}
                </span>
                <span className="text-text-darker rounded-md bg-black/40 px-2.5 py-1 text-[0.5rem] font-black tracking-widest uppercase">
                  {LABELS.n2Complexity}
                </span>
              </div>
              <div className="scrollbar-hide flex flex-wrap gap-2.5 overflow-x-auto pb-4">
                {DEFAULT_PLAYERS.slice(0, initialStacks.length).map((p, i) => (
                  <SelectBtn
                    key={p}
                    label={`${p} ${initialStacks.at(i) ?? 0}bb`}
                    active={villainIndices.includes(i)}
                    variant="villain"
                    impossible={i === heroIdx}
                    onClick={() => toggleVillain(i)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-10 rounded-4xl border border-white/5 bg-black/40 p-10 shadow-inner">
            <h4 className="text-text-muted m-0 flex items-center gap-3 text-[0.7rem] font-black tracking-[0.3em] uppercase">
              <i className="fa-solid fa-sliders text-accent-indigo text-[0.7rem]" /> Alavancas de Realização
            </h4>
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2">
              <div className="space-y-6">
                <div className={`flex flex-col gap-2 ${isHeroIP ? 'text-accent-indigo-light' : 'text-accent-danger'}`}>
                  <div className="flex items-center justify-between text-[0.65rem] font-black tracking-widest uppercase">
                    <span>{LABELS.realizationR}</span>
                    <div className="flex items-center gap-4">
                      {customR !== null && (
                        <button
                          type="button"
                          onClick={() => setCustomR(null)}
                          className="text-text-dim cursor-pointer rounded-lg border border-white/5 bg-black/40 px-3 py-1 text-[0.6rem] tracking-tighter uppercase transition-all hover:text-white"
                          title="Resetar para Auto"
                        >
                          <i className="fa-solid fa-rotate-left mr-1"></i> Auto
                        </button>
                      )}
                      <span className="rounded-lg border border-white/5 bg-black/60 px-3 py-1 font-mono font-black text-white shadow-2xl">
                        {Math.round(realizationFactor * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
                <input
                  aria-label="Ajuste de Realização Posicional"
                  type="range"
                  min={0.1}
                  max={2}
                  step={0.05}
                  value={realizationFactor}
                  onChange={(e) => setCustomR(Number(e.target.value))}
                  className={`h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/5 ${isHeroIP ? 'accent-accent-indigo' : 'accent-accent-danger'}`}
                />
                <p className="text-text-darker m-0 text-[0.5rem] leading-tight font-black tracking-[0.2em] uppercase">
                  {LABELS.realizationAdjustment}
                </p>
              </div>

              <div className="space-y-6">
                <div className="text-accent-amber flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[0.65rem] font-black tracking-widest uppercase">
                    <span>{LABELS.villainAggFactor}</span>
                    <span className="rounded-lg border border-white/5 bg-black/60 px-3 py-1 font-mono font-black text-white shadow-2xl">
                      {aggFactor.toFixed(2)}x
                    </span>
                  </div>
                </div>
                <input
                  aria-label="Villain AggFactor"
                  type="range"
                  min={0.1}
                  max={3}
                  step={0.1}
                  value={aggFactor}
                  onChange={(e) => setAggFactor(Number(e.target.value))}
                  className="accent-accent-amber h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/5"
                />
                <p className="text-text-darker m-0 text-[0.5rem] leading-tight font-black tracking-[0.2em] uppercase">
                  {LABELS.extremeAggWarning}
                </p>
              </div>
            </div>
            {customR === null && (
              <div className="bg-accent-indigo/5 border-accent-indigo/10 flex items-center gap-4 rounded-2xl border p-5">
                <div className="bg-accent-indigo h-2 w-2 animate-pulse rounded-full" />
                <p className="text-text-muted m-0 text-[0.7rem] leading-relaxed font-medium">
                  <strong className="mr-3 tracking-[0.3em] text-white uppercase">{LABELS.motorRActive}</strong> SPR{' '}
                  {spr.toFixed(1)} &middot; Pos {absoluteHeroPos} &middot; Agg {aggFactor.toFixed(1)}x
                </p>
              </div>
            )}
          </div>

          {/* SOTA: Nodelock B20 */}
          <div className="flex flex-col gap-8 rounded-4xl border border-white/5 bg-black/40 p-10 shadow-inner">
            <div className="flex items-center justify-between">
              <h4 className="text-text-muted m-0 flex items-center gap-3 text-[0.7rem] font-black tracking-[0.3em] uppercase">
                <i className="fa-solid fa-anchor text-accent-indigo text-[0.7rem]" /> Tática de Ancoragem
              </h4>
              <button
                type="button"
                onClick={() =>
                  setActiveNodelock((prev) => (prev ? null : { type: 'block_bet', sizePct: 0.2, freqOverride: 1 }))
                }
                aria-pressed={Boolean(activeNodelock)}
                className={`cursor-pointer rounded-xl border px-6 py-3 text-[0.65rem] font-black tracking-widest uppercase transition-all active:scale-95 ${activeNodelock ? 'bg-accent-indigo/20 border-accent-indigo text-accent-indigo-light shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'text-text-dim border-white/10 bg-transparent hover:border-white/30 hover:text-white'}`}
              >
                {activeNodelock ? 'Nodelock B20 Ativo' : 'Ativar Block Bet 20%'}
              </button>
            </div>
            {activeNodelock && (
              <p className="text-accent-indigo-light border-accent-indigo/30 m-0 border-l-2 py-2 pl-6 text-[0.75rem] leading-relaxed font-medium italic">
                {LABELS.nodelockTriggered}
                <span className="font-mono font-black">{Math.min(1, kappa + 0.3).toFixed(2)}x</span>)
              </p>
            )}
          </div>
        </div>

        <div className="group/sidebar relative flex flex-col gap-10 overflow-hidden rounded-5xl border border-white/10 bg-black/60 p-10 shadow-3xl backdrop-blur-2xl">
          <div className="from-accent-indigo/10 pointer-events-none absolute inset-0 bg-radial-[at_center_center] to-transparent" />

          <div className="relative z-10 space-y-10">
            <div className="flex flex-col gap-6">
              <div className="text-text-muted flex items-center justify-between text-[0.7rem] font-black tracking-[0.3em] uppercase transition-colors group-hover/sidebar:text-white">
                <span>{LABELS.rawEquity}</span>
                <span className="rounded-lg border border-white/5 bg-black/40 px-3 py-1 font-mono text-[0.9rem] text-white shadow-inner">
                  {equity}%
                </span>
              </div>
              <input
                aria-label="Equity Bruta"
                type="range"
                min={0}
                max={100}
                value={equity}
                onChange={(e) => ecosystem?.setManualEquity?.(Number(e.target.value))}
                className="accent-text-muted h-2 w-full cursor-pointer appearance-none rounded-full bg-white/5"
              />
              <p className="text-text-darker m-0 text-[0.55rem] leading-tight font-black tracking-[0.2em] uppercase">
                {LABELS.inVacuum}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-10">
              <div className="space-y-5">
                <div className="text-accent-pink flex items-center justify-between text-[0.65rem] font-black tracking-widest uppercase">
                  <span>{LABELS.kappaCredibility}</span>
                  <span className="rounded-lg bg-black/40 px-3 py-1 font-mono text-white">
                    {Math.round(kappa * 100)}%
                  </span>
                </div>
                <input
                  aria-label="Credibilidade Kappa"
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={kappa}
                  onChange={(e) => setKappa(Number.parseFloat(e.target.value))}
                  className="accent-accent-pink h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/5"
                />
              </div>
            </div>

            <div className="flex flex-col gap-6 rounded-4xl border border-white/10 bg-black/40 p-8 shadow-inner">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <span className="text-text-darker pl-2 text-[0.55rem] font-black tracking-widest uppercase">
                    {LABELS.heroRange}
                  </span>
                  <input
                    aria-label="Hero Range"
                    type="text"
                    placeholder="AhKd"
                    value={heroRange}
                    onChange={(e) => setHeroRange(e.target.value)}
                    className="focus:ring-accent-indigo placeholder:text-text-darker w-full rounded-xl border border-white/5 bg-slate-900/80 px-5 py-3 font-mono text-[0.8rem] text-white shadow-inner transition-all outline-none focus:ring-1"
                  />
                </div>
                <div className="space-y-3">
                  <span className="text-text-darker pl-2 text-[0.55rem] font-black tracking-widest uppercase">
                    {LABELS.villainRange}
                  </span>
                  <input
                    aria-label="Villain Range"
                    type="text"
                    placeholder="100%"
                    value={villainRange}
                    onChange={(e) => setVillainRange(e.target.value)}
                    className="focus:ring-accent-indigo placeholder:text-text-darker w-full rounded-xl border border-white/5 bg-slate-900/80 px-5 py-3 font-mono text-[0.8rem] text-white shadow-inner transition-all outline-none focus:ring-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-[1fr_130px] gap-6">
                <div className="space-y-3">
                  <span className="text-text-darker pl-2 text-[0.55rem] font-black tracking-widest uppercase">
                    {LABELS.boardStructural}
                  </span>
                  <input
                    aria-label="Board Structural"
                    type="text"
                    placeholder="Ah Td 7c"
                    value={board}
                    onChange={(e) => setBoard(e.target.value)}
                    className="text-accent-emerald-light focus:ring-accent-emerald placeholder:text-text-darker w-full rounded-xl border border-white/5 bg-slate-900/80 px-5 py-3 font-mono text-[0.8rem] shadow-inner transition-all outline-none focus:ring-1"
                  />
                </div>
                <div className="space-y-3">
                  <span className="text-text-darker block text-center text-[0.55rem] font-black tracking-widest uppercase">
                    {LABELS.sizing}
                  </span>
                  <div className="relative">
                    <select
                      aria-label="Tamanho da Aposta"
                      value={betSizing}
                      onChange={(e) => setBetSizing(Number(e.target.value))}
                      className="w-full cursor-pointer appearance-none rounded-xl border border-white/5 bg-slate-900/80 px-4 py-3 text-center font-mono text-[0.75rem] font-black text-white outline-none transition-all hover:border-white/20"
                    >
                      <option value="0.33">33%</option>
                      <option value="0.5">50%</option>
                      <option value="0.75">75%</option>
                      <option value="1.2">120%</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleCalculateEquity}
                  disabled={isCalculatingEq || !heroRange || !villainRange}
                  className="bg-accent-indigo border-accent-indigo-light/30 shadow-accent-indigo/20 w-full rounded-2xl border py-5 text-[0.8rem] font-black tracking-[0.3em] text-white uppercase shadow-2xl transition-all hover:bg-indigo-500 hover:shadow-indigo-500/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCalculatingEq ? 'Triturando VRAM...' : 'Injetar GTO (WebGPU)'}
                </button>
                <p className="text-text-darker m-0 mt-4 text-center text-[0.55rem] leading-tight font-black tracking-widest uppercase">
                  {LABELS.computeShaderDesc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Cartões por Street */}
      {/* Diagnóstico da Perspectiva */}
      {streetMetrics.length > 0 && streetMetrics[0] && !streetMetrics[0].loading && (
        <InsightBanner insights={getInsights()} />
      )}

      {/* Grid de Cartões por Street */}
      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {streetMetrics.map((s) => (
          <div
            key={s.name}
            className="hover:border-accent-indigo/40 group/card relative flex flex-col gap-8 overflow-hidden rounded-4xl border border-white/5 bg-black/40 p-10 shadow-3xl backdrop-blur-2xl transition-all duration-700 hover:-translate-y-2 hover:bg-black/60"
          >
            <div className="via-accent-indigo/30 absolute top-0 left-0 h-1.5 w-full bg-linear-to-r from-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover/card:opacity-100" />

            <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <span className="text-[0.9rem] font-black tracking-[0.3em] text-white uppercase">{s.name}</span>
              <span
                className={`rounded-xl px-4 py-1.5 text-[0.6rem] font-black tracking-[0.2em] uppercase shadow-2xl ${s.PM > 0 ? 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20 border' : 'bg-accent-danger/10 text-accent-danger border-accent-danger/20 border'}`}
              >
                {getVerdictText(s.loading, s.PM)}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-4">
              <MetricRow
                label="Sunk Cost"
                value={`-${s.heroCost.toFixed(2)}bb`}
                colorClass="text-text-dim"
                loading={s.loading}
                isAlert={s.heroCost > (initialStacks.at(heroIdx) ?? 10) * 0.25}
                alertType="warning"
                tooltipDesc="Fichas investidas não lhe pertencem mais. Elas ditam a profundidade do custo irrecuperável de desistir."
              />
              <MetricRow
                label="Piso (EV_fold)"
                value={`${s.evFold.toFixed(2)}%`}
                colorClass="text-accent-danger"
                loading={s.loading}
                tooltipDesc="A Esperança de simplesmente desistir e ceder o pote. Qualquer ação deve superar matematicamente esta âncora."
              />
              <MetricRow
                label="Passivo (RIO)"
                value={`${s.rio.toFixed(2)}%`}
                colorClass="text-accent-amber"
                loading={s.loading}
                isAlert={s.rio > 3}
                alertType="warning"
                tooltipDesc="O custo passivo de 'acertar e continuar perdendo'. Infla geometricamente (x²) em cenários Multiway."
              />
              <MetricRow
                label="FGS Health"
                value={`${s.fgsHealth.toFixed(2)}x`}
                colorClass="text-accent-violet"
                loading={s.loading}
                tooltipDesc="Punição gravitacional na órbita. Antecipa o dano do Big Blind iminente, forçando agressão para não morrer cego."
              />
              <MetricRow
                label="Insolvência (Cᵢ)"
                value={formatCi(s.loading, s.ci)}
                colorClass={s.ci !== null && s.ci < 1 ? 'text-accent-danger' : 'text-accent-emerald'}
                loading={s.loading}
                isAlert={s.ci !== null && s.ci < 1}
                alertType="danger"
                tooltipDesc="Se Cᵢ < 1, as Pot Odds mentem. A mão não possui equidade suficiente para superar o passivo do RIO e do ICM."
              />
            </div>

            <InteractiveEquation s={s} />
          </div>
        ))}
      </div>
    </div>
  );
}
