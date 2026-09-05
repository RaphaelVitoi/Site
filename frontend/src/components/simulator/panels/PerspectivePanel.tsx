/** @format */

'use client';

/**
 * IDENTITY: Dashboard de Perspectiva Matemática SOTA v7.0 GOLD (VITOI - GOLD)
 * PATH: src/components/simulator/panels/PerspectivePanel.tsx
 * ROLE: Visualização da Física Quântica do Poker: Piso Dinâmico, RIO Exponencial e Valuation.
 */

import { usePerspectiveCalculations } from '@/components/simulator/hooks/usePerspectiveCalculations';
import { PerspectiveChart } from '@/components/simulator/ui/PerspectiveChart';
import { SotaTooltip } from '@/components/simulator/ui/SotaTooltip';
import { GravitationalScannerPanel } from '@/components/simulator/ui/GravitationalScannerPanel';
import { useEffect, useMemo, useRef, useState } from 'react';
import { WasmTelemetryWidget } from './WasmTelemetryWidget';
import { useSotaSync } from '@/components/simulator/hooks/useSotaSync';
import type { PerspectiveWorkerRequest, SimulatorWorkerResponse } from '../workers/insolvencyProtocol';

const DEFAULT_STACKS = [9.4, 52.4, 22.2, 7, 44.3, 24.3, 40, 13.4, 55];
const DEFAULT_PRIZES = [237.34, 170.96, 135.17, 109.99, 90.28, 73.95, 59.92, 47.56, 36.47];

const LABELS = {
  advantagePrefix: 'Vantagem: ',
  opponents: 'Oponentes',
  nearPayjump: 'Perto de Payjump',
  blindsRising: 'Blinds Subindo',
  kappaCredibility: 'Credibilidade κ',
  sunkCostPot: 'Sunk Cost · Pot',
  estimatedEquity: 'Equity Estimada',
  psiEntropyFactor: 'Fator Ψ (Entropia)',
  realizationFactor: 'Fator de Realização Posicional (R)',
  layer1Title: 'LAYER 1 · ICMev',
  layer1Desc: 'Perspectiva base e ingênua (Física Newtoniana).',
  baseEquity: 'Base Equity',
  layer2Title: 'LAYER 2 · ESPERANÇA MATEMÁTICA',
  valuationFactor: 'Valuation Factor',
  rioLiability: 'Dívida RIO',
  asymmetry: 'Assimetria',
  layer3Title: 'LAYER 3 · EXPECTATIVA PREDITIVA',
  floorEvFold: 'Piso (EV_fold)',
  fgsHealth: 'FGS Health',
  organicStatus: 'Status Orgânico',
  layer4Title: 'LAYER 4 · PERSPECTIVA (PM)',
  amortizedEdge: 'Edge Amortizada',
  riskAdvantage: 'Risk Advantage',
  insolvencyCi: 'Insolvência Cᵢ',
  rpCeiling: 'Teto do RP',
  marginalZone: 'Zona Marginal',
  unstableEquilibrium: 'Equilíbrio Instável',
  marginalDesc: 'Decisão altamente sensível à imprecisão de range e entropia informacional.',
  sotaProtocol: 'Protocolo SOTA',
  guideline: 'Diretriz',
  extremeRiskAversion: 'Extrema Aversão ao Risco Identificada',
  extremeRiskDesc: 'A pressão de payjump induz o overfold estrutural. A inversão de EVs da teoria pura exige um desvio (exploit) estritamente proporcional à credibilidade informacional (Axioma Lipe Piv).',
} as const;

interface PerspectivePanelProps {
  initialStacks?: number[];
  initialPrizes?: number[];
  scenarioId?: string;
  anteSize?: number;
  heroInvestedBb?: number;
  currentPotBb?: number;
  initialActivePlayers?: number;
  initialPkoValue?: number;
  initialIsNearPayjump?: boolean;
  initialBlindsRising?: boolean;
  hudOnly?: boolean; // SOTA v7.0 GOLD
}

function getStatusThemeClass(status: string | undefined): string {
  switch (status) {
    case 'tilt':
      return 'text-accent-rose border-rose-500/20 bg-rose-500/10 shadow-rose-500/5';
    case 'protecting':
      return 'text-accent-emerald border-emerald-500/20 bg-emerald-500/10 shadow-emerald-500/5';
    case 'bubble':
      return 'text-accent-indigo border-indigo-500/20 bg-indigo-500/10 shadow-indigo-500/5';
    default:
      return 'text-slate-400 border-white/5 bg-black/40';
  }
}

function getStatusIndicatorClass(status: string | undefined): string {
  switch (status) {
    case 'tilt':
      return 'bg-accent-rose shadow-[0_0_8px_var(--accent-rose)] animate-pulse';
    case 'protecting':
      return 'bg-accent-emerald shadow-[0_0_8px_var(--accent-emerald)] animate-pulse';
    case 'bubble':
      return 'bg-accent-indigo shadow-[0_0_8px_var(--accent-indigo)] animate-pulse';
    default:
      return 'bg-slate-500';
  }
}

function getStatusLabel(status: string | undefined): string {
  switch (status) {
    case 'tilt':
      return 'TILT / RISK SEEKING';
    case 'protecting':
      return 'PROTECTING WIN';
    case 'bubble':
      return 'BUBBLE SURVIVAL';
    default:
      return 'BASELINE EV';
  }
}

export default function PerspectivePanel({
  initialStacks,
  initialPrizes,
  scenarioId,
  anteSize = 12.5,
  heroInvestedBb = 1,
  currentPotBb = 2.5,
  initialActivePlayers = 2,
  initialPkoValue = 0,
  initialIsNearPayjump = false,
  initialBlindsRising = false,
  hudOnly = false,
}: Readonly<PerspectivePanelProps>) {
  const { physics } = useSotaSync();
  const referenceStatus = physics.referenceStatus;

  const stacks = useMemo(
    () => (initialStacks && initialStacks.length > 0 ? initialStacks : DEFAULT_STACKS),
    [initialStacks],
  );
  const prizes = useMemo(
    () => (initialPrizes && initialPrizes.length > 0 ? initialPrizes : DEFAULT_PRIZES),
    [initialPrizes],
  );

  // --- ESTADO DO SIMULADOR ---
  const [winProb, setWinProb] = useState(0.55);
  const [realization, setRealization] = useState(1);
  const edgeBase = 1.2;
  const [bountyValue, setBountyValue] = useState(initialPkoValue);
  const [numPlayers, setNumPlayers] = useState(initialActivePlayers);
  const [isNearPayjump, setIsNearPayjump] = useState(initialIsNearPayjump);
  const [blindsRising, setBlindsRising] = useState(initialBlindsRising);
  const [kappa, setKappa] = useState(0.5);
  const [humanNoiseFactor, setHumanNoiseFactor] = useState(0); 

  // ... (rest of states unchanged)
  const [wasmLogs, setWasmLogs] = useState<string[]>([
    '> [MODELO] Inicializando cálculo exploratório de cenário.',
    '> [WORKER] Aguardando cálculo em segundo plano...',
  ]);
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    // SOTA: Delegação O(1) para a Thread do WebWorker, blindando a Main Thread do React
    workerRef.current ??= new Worker(new URL('@/components/simulator/workers/insolvency.worker.ts', import.meta.url), {
      type: 'module',
    });

    workerRef.current.onmessage = (e: MessageEvent<SimulatorWorkerResponse | undefined>) => {
      if (!e.data || e.data.id !== requestIdRef.current) return;
      if (e.data.type === 'WASM_RESULT') {
        setWasmLogs((prev) => [...prev, '> [MODELO] Cenário calculado pelo modelo TypeScript existente.'].slice(-50));
      } else if (e.data.type === 'ERROR') {
        const detail = e.data.error;
        setWasmLogs((prev) => [...prev, `> [ERRO] ${detail}`].slice(-50));
      }
    };

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  useEffect(() => {
    setNumPlayers(initialActivePlayers);
    setBountyValue(initialPkoValue);
    setIsNearPayjump(initialIsNearPayjump);
    setBlindsRising(initialBlindsRising);
  }, [scenarioId, initialActivePlayers, initialPkoValue, initialIsNearPayjump, initialBlindsRising]);

  const safeHeroInvestedBb =
    Number.isNaN(Number(heroInvestedBb)) || heroInvestedBb == null ? 1 : Number(heroInvestedBb);
  const safeAnteSize = Number.isNaN(Number(anteSize)) || anteSize == null ? 12.5 : Number(anteSize);
  const potSize = Number.isNaN(Number(currentPotBb)) || currentPotBb == null ? 2.5 : Number(currentPotBb);
  const foldEvBb = useMemo(
    () => -(Math.abs(safeHeroInvestedBb) + safeAnteSize / 100),
    [safeHeroInvestedBb, safeAnteSize],
  );
  const heroCost = Math.abs(foldEvBb);

  // Engatilha o re-cálculo e telemetria sempre que os parâmetros quânticos mudarem
  useEffect(() => {
    setWasmLogs((prev) => [
      ...prev,
      `> [MODELO] Calculando cenário com ${stacks.length} stacks, Ψ=${humanNoiseFactor.toFixed(2)}.`,
    ].slice(-50));

    const heroRp = prizes.length > 0 ? 15 : 0; // Simplificação para o log, o worker usa real
    const villainRp = prizes.length > 0 ? 15 : 0;

    workerRef.current?.postMessage({
      type: 'CALCULATE_PERSPECTIVE',
      id: ++requestIdRef.current,
      payload: { 
        stacks, 
        prizes, 
        kappa, 
        numPlayers, 
        bountyValue,
        potSize,
        heroCost,
        winProb,
        realization,
        edgeBase,
        isNearPayjump,
        blindsRising,
        humanNoiseFactor,
        heroRp,
        villainRp,
        stackEff: stacks[0] || 40,
        referenceStatus,
      },
    } satisfies PerspectiveWorkerRequest);
  }, [stacks, prizes, kappa, numPlayers, bountyValue, potSize, heroCost, winProb, realization, edgeBase, isNearPayjump, blindsRising, humanNoiseFactor, referenceStatus]);

  // SOTA v4.2: Orquestração de Cálculo Modularizada
  const { result, chartData } = usePerspectiveCalculations({
    stacks,
    prizes,
    potSize,
    heroCost,
    winProb,
    realization,
    edgeBase,
    bountyValue,
    kappa,
    numPlayers,
    isNearPayjump,
    blindsRising,
    humanNoiseFactor,
    referenceStatus,
  });

  // Display mappings extracted to reduce cognitive complexity and avoid nested ternaries in JSX
  const statusDisplay = useMemo(() => {
    const isActionBetter = result.isActionBetterThanFold;
    return {
      riskAdvantageSign: result.riskAdvantage > 0 ? '+' : '',
      perspectivaSign: result.perspectivaPct > 0 ? '+' : '',
      organicStatus: isActionBetter ? 'Soberano' : 'Insolvente',
      protocoloLabel: isActionBetter ? 'Agressão Dominante' : 'Omissão Estratégica',
      diretrizLabel: isActionBetter
        ? 'A utilidade da colisão neutraliza a erosão do tempo.'
        : 'A omissão preserva o capital sistêmico da órbita.',
      perspectivaColorClass: isActionBetter
        ? 'text-accent-emerald group-hover/pm:drop-shadow-[0_0_30px_rgba(16,185,129,0.4)]'
        : 'text-accent-danger group-hover/pm:drop-shadow-[0_0_30px_rgba(244,63,94,0.4)]',
      payjumpStatusLabel: isNearPayjump ? 'LADDERING ATIVO' : 'EQUILÍBRIO ESTÁVEL',
      payjumpDotClass: isNearPayjump
        ? 'bg-accent-emerald animate-pulse shadow-[0_0_8px_var(--accent-emerald)]'
        : 'bg-text-darker',
      opponentsMode: numPlayers > 2 ? ' MW' : ' HU',
    };
  }, [result.isActionBetterThanFold, result.riskAdvantage, result.perspectivaPct, isNearPayjump, numPlayers]);

  if (hudOnly) {
    return (
      <div className="flex flex-col gap-10 animate-sota-in">
        {/* GRÁFICO HUD (Visualização Crítica) */}
        <div className="glass-panel p-8! lg:p-10! border-white/5 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-white font-black text-xs tracking-[0.4em] uppercase m-0 flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-accent-indigo shadow-[0_0_10px_var(--accent-indigo)]" />
              Equidade Dinâmica
            </h3>
            <span className="text-text-darker text-[0.6rem] font-black tracking-[0.3em] uppercase">
              {LABELS.advantagePrefix}{statusDisplay.riskAdvantageSign}{result.riskAdvantage.toFixed(1)}%
            </span>
          </div>
          <div className="h-64 w-full overflow-hidden rounded-3xl border border-white/5 bg-black/40 p-4 shadow-inner">
            <PerspectiveChart chartData={chartData} />
          </div>
        </div>

        {/* TELEMETRIA SOTA WASM (Motor de Observabilidade) */}
        <WasmTelemetryWidget 
          wasmLogs={wasmLogs} 
          resultCi={result.ci} 
          riskAdvantage={result.riskAdvantage}
        />
      </div>
    );
  }

  return (
    <div className="glass-panel bg-bg-panel/80 relative flex flex-col gap-10 overflow-hidden rounded-4xl border border-white/10 p-8 shadow-2xl backdrop-blur-3xl transition-all duration-500 lg:p-12">
      <div className="bg-accent-indigo/5 pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl" />

      <div className="flex flex-col items-start justify-between gap-6 border-b border-white/5 pb-6 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-accent-indigo-light m-0 flex items-center gap-3 text-[0.75rem] font-black tracking-[0.3em] uppercase">
            <div className="bg-accent-indigo h-2 w-2 rounded-full shadow-[0_0_10px_var(--accent-indigo)]" />
            Perspectiva Matemática &middot; <span className="text-text-muted">v7.0 GOLD</span>
          </h3>
          <p className="text-text-dim m-0 mt-1.5 max-w-md text-[0.6rem] leading-relaxed font-medium tracking-widest uppercase">
            Física da Decisão: Piso Dinâmico (EV_fold) e Dívida RIO
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div
            className={`flex items-center gap-3 rounded-xl border px-5 py-2.5 text-[0.6rem] font-black tracking-[0.2em] uppercase shadow-2xl transition-all ${isNearPayjump ? 'text-accent-emerald border-emerald-500/20 bg-emerald-500/10 shadow-emerald-500/5' : 'text-text-darker border-white/5 bg-black/40'}`}
          >
            <div
              className={`h-1.5 w-1.5 rounded-full ${statusDisplay.payjumpDotClass}`}
            />
            {statusDisplay.payjumpStatusLabel}
          </div>

          <div
            className={`flex items-center gap-3 rounded-xl border px-5 py-2.5 text-[0.6rem] font-black tracking-[0.2em] uppercase shadow-2xl transition-all ${getStatusThemeClass(referenceStatus)}`}
          >
            <div
              className={`h-1.5 w-1.5 rounded-full ${getStatusIndicatorClass(referenceStatus)}`}
            />
            {getStatusLabel(referenceStatus)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 rounded-3xl border border-white/5 bg-black/40 p-6 shadow-inner md:grid-cols-2 lg:p-10">
        {/* SOTA Scanner Gravitacional */}
        <div className="mb-4 md:col-span-2">
          <GravitationalScannerPanel stacks={stacks.slice(0, numPlayers)} heroIdx={0} />
        </div>

        <div className="space-y-4 rounded-2xl border border-white/5 bg-black/40 p-5 shadow-2xl hover:border-white/10 transition-colors duration-300">
          <div className="flex items-center justify-between px-1">
            <label
              htmlFor="perspective-opponents"
              className="text-text-muted text-[0.55rem] font-black tracking-[0.25em] uppercase"
            >
              {LABELS.opponents}
            </label>
            <span className="text-accent-danger rounded-lg border border-white/10 bg-black/60 px-2.5 py-1 font-mono text-[0.65rem] font-black tabular-nums shadow-lg">
              {numPlayers}
              {statusDisplay.opponentsMode}
            </span>
          </div>
          <input
            id="perspective-opponents"
            type="range"
            min="2"
            max="5"
            step="1"
            value={numPlayers}
            onChange={(e) => setNumPlayers(Number.parseInt(e.target.value))}
            className="sota-range-slider sota-slider-danger cursor-pointer"
          />
        </div>

        <div className="flex flex-col justify-center gap-3 rounded-2xl border border-white/5 bg-black/40 p-5 shadow-2xl hover:border-white/10 transition-colors duration-300">
          <label
            htmlFor="perspective-payjump"
            className="text-text-muted group flex cursor-pointer items-center gap-3 text-[0.6rem] font-black tracking-[0.2em] uppercase transition-all active:scale-95"
          >
            <input
              id="perspective-payjump"
              type="checkbox"
              checked={isNearPayjump}
              onChange={(e) => setIsNearPayjump(e.target.checked)}
              className="accent-accent-emerald h-4 w-4 cursor-pointer rounded-lg border-white/10 bg-black/60"
            />
            <span className="transition-colors group-hover:text-white">{LABELS.nearPayjump}</span>
          </label>
          <label
            htmlFor="perspective-blinds"
            className="text-text-muted group flex cursor-pointer items-center gap-3 text-[0.6rem] font-black tracking-[0.2em] uppercase transition-all active:scale-95"
          >
            <input
              id="perspective-blinds"
              type="checkbox"
              checked={blindsRising}
              onChange={(e) => setBlindsRising(e.target.checked)}
              className="accent-accent-danger h-4 w-4 cursor-pointer rounded-lg border-white/10 bg-black/60"
            />
            <span className="transition-colors group-hover:text-white">{LABELS.blindsRising}</span>
          </label>
        </div>

        <div className="space-y-4 rounded-2xl border border-white/5 bg-black/40 p-5 shadow-2xl hover:border-white/10 transition-colors duration-300">
          <div className="flex items-center justify-between px-1">
            <label
              htmlFor="perspective-kappa"
              className="text-text-muted text-[0.55rem] font-black tracking-[0.25em] uppercase"
            >
              {LABELS.kappaCredibility}
            </label>
            <span className="text-accent-pink rounded-lg border border-white/10 bg-black/60 px-2.5 py-1 font-mono text-[0.65rem] font-black tabular-nums shadow-lg">
              {Math.round(kappa * 100)}%
            </span>
          </div>
          <input
            id="perspective-kappa"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={kappa}
            onChange={(e) => setKappa(Number.parseFloat(e.target.value))}
            className="sota-range-slider sota-slider-pink cursor-pointer"
          />
        </div>

        <div className="group/sunk relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-black/60 p-5 shadow-2xl transition-all duration-300 hover:border-white/10">
          <div className="from-accent-amber/5 pointer-events-none absolute inset-0 bg-linear-to-b to-transparent" />
          <span className="text-text-darker group-hover/sunk:text-text-dim relative z-10 mb-1.5 text-[0.55rem] font-black tracking-[0.3em] uppercase transition-colors">
            {LABELS.sunkCostPot}
          </span>
          <div className="text-accent-amber relative z-10 font-mono text-lg font-black tracking-tighter tabular-nums">
            -{heroCost.toFixed(2)}bb <span className="text-text-darker mx-1">/</span> {potSize.toFixed(1)}bb
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-white/5 bg-black/40 p-5 shadow-2xl hover:border-white/10 transition-colors duration-300">
          <div className="flex items-center justify-between px-1">
            <label
              htmlFor="perspective-equity"
              className="text-text-muted text-[0.55rem] font-black tracking-[0.25em] uppercase"
            >
              {LABELS.estimatedEquity}
            </label>
            <span className="text-accent-indigo rounded-lg border border-white/10 bg-black/60 px-2.5 py-1 font-mono text-[0.65rem] font-black tabular-nums shadow-lg">
              {Math.round(winProb * 100)}%
            </span>
          </div>
          <input
            id="perspective-equity"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={winProb}
            onChange={(e) => setWinProb(Number.parseFloat(e.target.value))}
            className="sota-range-slider sota-slider-indigo cursor-pointer"
          />
        </div>

        <div className="space-y-4 rounded-2xl border border-white/5 bg-black/40 p-5 shadow-2xl hover:border-white/10 transition-colors duration-300">
          <div className="flex items-center justify-between px-1">
            <label
              htmlFor="perspective-human-noise"
              className="text-text-muted text-[0.55rem] font-black tracking-[0.25em] uppercase"
            >
              {LABELS.psiEntropyFactor}
            </label>
            <span className="text-accent-rose rounded-lg border border-white/10 bg-black/60 px-2.5 py-1 font-mono text-[0.65rem] font-black tabular-nums shadow-lg">
              {Math.round(humanNoiseFactor * 100)}%
            </span>
          </div>
          <input
            id="perspective-human-noise"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={humanNoiseFactor}
            onChange={(e) => setHumanNoiseFactor(Number.parseFloat(e.target.value))}
            className="sota-range-slider sota-slider-rose cursor-pointer"
          />
        </div>

        <div className="space-y-4 pt-2 md:col-span-2 rounded-2xl border border-white/5 bg-black/40 p-5 shadow-2xl hover:border-white/10 transition-colors duration-300">
          <div className="flex items-center justify-between px-1">
            <label
              htmlFor="perspective-realization"
              className="text-text-muted text-[0.55rem] font-black tracking-[0.25em] uppercase"
            >
              {LABELS.realizationFactor}
            </label>
            <span className="text-accent-emerald rounded-lg border border-white/10 bg-black/60 px-3 py-1 font-mono text-[0.65rem] font-black tabular-nums shadow-lg">
              {realization.toFixed(2)}x
            </span>
          </div>
          <input
            id="perspective-realization"
            type="range"
            min="0.5"
            max="1.5"
            step="0.05"
            value={realization}
            onChange={(e) => setRealization(Number.parseFloat(e.target.value))}
            className="sota-range-slider sota-slider-emerald cursor-pointer"
          />
        </div>
      </div>

      {/* PIPELINE DE TRANSMUTAÇÃO QUANTUM */}
      <div className="scrollbar-hide flex flex-col gap-8">
        <SotaTooltip
          title="LAYER 1: ICMev (Snapshot)"
          content="A fotografia estática. Fichas convertidas em equidade de prêmio (Malmuth-Harville). Ignora completamente a variância, a posição e o tempo. Útil como base, perigoso como conclusão."
          align="left"
          theme="indigo"
        >
          <div className="border-l-text-darker group/layer relative flex flex-col items-start justify-between overflow-hidden rounded-4xl border border-l-8 border-white/5 bg-slate-950/40 p-8 shadow-2xl backdrop-blur-2xl transition-all duration-700 hover:-translate-y-2 hover:bg-slate-900/60 md:flex-row md:items-center lg:p-10">
            <div className="pointer-events-none absolute inset-0 bg-radial-[at_top_right] from-white/5 to-transparent opacity-0 transition-opacity group-hover/layer:opacity-100" />
            <div className="relative z-10 space-y-2">
              <span className="text-text-muted group-hover/layer:text-text-light text-[0.8rem] font-black tracking-[0.4em] uppercase transition-all group-hover/layer:tracking-[0.45em]">
                {LABELS.layer1Title}
              </span>
              <p className="text-text-darker group-hover/layer:text-text-dim m-0 text-[0.75rem] leading-relaxed font-medium transition-colors">
                {LABELS.layer1Desc}
              </p>
            </div>
            <div className="relative z-10 mt-6 flex flex-col items-start gap-1 md:mt-0 md:items-end">
              <span className="text-text-darker text-[0.6rem] font-black tracking-[0.3em] uppercase">{LABELS.baseEquity}</span>
              <span className="text-text-muted font-mono text-3xl font-black tracking-tighter tabular-nums drop-shadow-lg transition-all group-hover/layer:text-white">
                {result.currentEquityPct.toFixed(2)}%
              </span>
            </div>
          </div>
        </SotaTooltip>

        <SotaTooltip
          title="LAYER 2: Esperança Matemática"
          content="A injeção da Lógica. O Valuation corrige a assimetria (fichas ganhas vs perdidas) e a Dívida RIO pune a insolvência de múltiplos jogadores no pote."
          align="left"
          theme="indigo"
        >
          <div className="border-l-accent-amber group/layer relative flex flex-col items-start justify-between overflow-hidden rounded-4xl border border-l-8 border-white/5 bg-slate-950/40 p-8 shadow-2xl backdrop-blur-2xl transition-all duration-700 hover:-translate-y-2 hover:bg-slate-900/60 md:flex-row md:items-center lg:p-10">
            <div className="from-accent-amber/5 pointer-events-none absolute inset-0 bg-radial-[at_top_right] to-transparent opacity-0 transition-opacity group-hover/layer:opacity-100" />
            <div className="relative z-10 flex flex-col gap-4">
              <span className="text-accent-amber text-[0.8rem] font-black tracking-[0.4em] uppercase transition-all group-hover/layer:tracking-[0.45em]">
                {LABELS.layer2Title}
              </span>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex flex-col gap-1.5">
                  <span className="text-text-darker text-[0.55rem] font-black tracking-[0.3em] uppercase">
                    {LABELS.valuationFactor}
                  </span>
                  <strong className="text-accent-amber bg-accent-amber/10 border-accent-amber/20 rounded-xl border px-3.5 py-1 font-mono text-lg font-black tabular-nums shadow-inner">
                    {result.valuation.toFixed(2)}x
                  </strong>
                </div>
                <div className="h-10 w-px bg-white/5" />
                <div className="flex flex-col gap-1.5">
                  <span className="text-text-darker text-[0.55rem] font-black tracking-[0.3em] uppercase">
                    {LABELS.rioLiability}
                  </span>
                  <strong className="text-accent-amber bg-accent-amber/10 border-accent-amber/20 rounded-xl border px-3.5 py-1 font-mono text-lg font-black tabular-nums shadow-inner">
                    -{result.rioLiability.toFixed(2)}%
                  </strong>
                </div>
              </div>
            </div>
            <div className="relative z-10 mt-6 flex flex-col items-start gap-1 md:mt-0 md:items-end">
              <span className="text-text-darker text-[0.6rem] font-black tracking-[0.3em] uppercase">{LABELS.asymmetry}</span>
              <span className="text-accent-amber font-mono text-4xl font-black tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                {((result.valuation - 1) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </SotaTooltip>

        <SotaTooltip
          title="LAYER 3: Expectativa Preditiva"
          content="A Psicologia do Tempo. FGS mede a urgência da sobrevivência (t-3 blinds) e o Piso Dinâmico estabelece o verdadeiro custo do fold."
          align="left"
          theme="indigo"
        >
          <div className="border-l-accent-emerald group/layer relative flex flex-col items-start justify-between overflow-hidden rounded-4xl border border-l-8 border-white/5 bg-slate-950/40 p-8 shadow-2xl backdrop-blur-2xl transition-all duration-700 hover:-translate-y-2 hover:bg-slate-900/60 md:flex-row md:items-center lg:p-10">
            <div className="from-accent-emerald/5 pointer-events-none absolute inset-0 bg-radial-[at_top_right] to-transparent opacity-0 transition-opacity group-hover/layer:opacity-100" />
            <div className="relative z-10 flex flex-col gap-4">
              <span className="text-accent-emerald text-[0.8rem] font-black tracking-[0.4em] uppercase transition-all group-hover/layer:tracking-[0.45em]">
                {LABELS.layer3Title}
              </span>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex flex-col gap-1.5">
                  <span className="text-text-darker text-[0.55rem] font-black tracking-[0.3em] uppercase">
                    {LABELS.floorEvFold}
                  </span>
                  <strong className="text-accent-emerald bg-accent-emerald/10 border-accent-emerald/20 rounded-xl border px-3.5 py-1 font-mono text-lg font-black tabular-nums shadow-inner">
                    {result.dynamicEvFold.toFixed(2)}%
                  </strong>
                </div>
                <div className="h-10 w-px bg-white/5" />
                <div className="flex flex-col gap-1.5">
                  <span className="text-text-darker text-[0.55rem] font-black tracking-[0.3em] uppercase">
                    {LABELS.fgsHealth}
                  </span>
                  <strong className="text-accent-emerald bg-accent-emerald/10 border-accent-emerald/20 rounded-xl border px-3.5 py-1 font-mono text-lg font-black tabular-nums shadow-inner">
                    {result.fgsHealth.toFixed(2)}x
                  </strong>
                </div>
              </div>
            </div>
            <div className="relative z-10 mt-6 flex flex-col items-start gap-1 md:mt-0 md:items-end">
              <span className="text-text-darker text-[0.6rem] font-black tracking-[0.3em] uppercase">
                {LABELS.organicStatus}
              </span>
              <span className="text-accent-emerald text-2xl font-black tracking-[0.25em] uppercase drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                {statusDisplay.organicStatus}
              </span>
            </div>
          </div>
        </SotaTooltip>

        <SotaTooltip
          title="LAYER 4: Perspectiva Matemática"
          content="A Síntese Máxima SOTA. Se o valor é positivo, a utilidade da colisão supera o piso estrutural do fold e a erosão do tempo, justificando a agressão."
          align="left"
          theme="indigo"
        >
          <div className="border-accent-indigo/30 border-l-accent-indigo from-accent-indigo/10 to-bg-panel/60 shadow-3xl group/pm flex flex-col gap-8 rounded-4xl border border-l-10 bg-linear-to-br via-slate-950/90 p-8 backdrop-blur-2xl transition-all duration-700 hover:-translate-y-2 lg:p-10 xl:p-14">
            <div className="from-accent-indigo/5 pointer-events-none absolute inset-0 bg-radial-[at_center_center] to-transparent" />
            <div className="relative z-10 flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
              <div className="flex flex-col gap-4">
                <span className="text-accent-indigo-light mb-1 text-[0.8rem] font-black tracking-[0.4em] uppercase transition-all duration-700 group-hover/pm:tracking-[0.45em]">
                  {LABELS.layer4Title}
                </span>
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-text-darker text-[0.55rem] font-black tracking-widest uppercase">
                      {LABELS.amortizedEdge}
                    </span>
                    <strong className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 font-mono text-lg font-black text-white tabular-nums shadow-inner">
                      {result.amortizedEdge.toFixed(2)}x
                    </strong>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-text-darker text-[0.55rem] font-black tracking-widest uppercase">
                      {LABELS.riskAdvantage}
                    </span>
                    <strong className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 font-mono text-lg font-black text-accent-indigo-light tabular-nums shadow-inner">
                      {statusDisplay.riskAdvantageSign}
                      {result.riskAdvantage.toFixed(1)}%
                    </strong>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-text-darker text-[0.55rem] font-black tracking-widest uppercase">
                      {LABELS.insolvencyCi}
                    </span>
                    <strong className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 font-mono text-lg font-black text-white tabular-nums shadow-inner">
                      {result.ci.toFixed(2)}
                    </strong>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-text-darker text-[0.55rem] font-black tracking-widest uppercase">
                      {LABELS.rpCeiling}
                    </span>
                    <strong className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 font-mono text-lg font-black text-white tabular-nums shadow-inner">
                      {Math.round(result.threshEq * 100)}%
                    </strong>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-start gap-1.5 md:items-end">
                <span className="text-text-dim mb-0.5 text-[0.6rem] font-black tracking-[0.3em] uppercase">
                  Métrica Soberana
                </span>
                <span
                  className={`font-mono text-5xl font-black tracking-tighter tabular-nums drop-shadow-2xl transition-all duration-700 lg:text-6xl ${statusDisplay.perspectivaColorClass}`}
                >
                  {statusDisplay.perspectivaSign}
                  {result.perspectivaPct.toFixed(2)}%
                </span>
              </div>
            </div>
            {Math.abs(result.perspectivaPct) <= 10 * (1 - kappa) && (
              <div className="text-accent-pink-light group/marginal relative mt-2 flex flex-col gap-3 overflow-hidden rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-[0.8rem] leading-relaxed font-medium shadow-2xl">
                <div className="from-accent-rose/5 pointer-events-none absolute inset-0 bg-linear-to-r to-transparent" />
                <div className="relative z-10 flex items-center gap-4">
                  <div className="bg-accent-rose/20 border-accent-rose/30 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-lg">
                    <i className="fa-solid fa-triangle-exclamation text-accent-rose-light animate-pulse text-lg"></i>
                  </div>
                  <strong className="text-accent-rose-light text-[0.7rem] font-black tracking-[0.3em] uppercase">
                    {LABELS.marginalZone} &middot; <span className="text-text-darker">{LABELS.unstableEquilibrium}</span>
                  </strong>
                </div>
                <p className="m-0 pl-14 leading-relaxed font-medium opacity-80">
                  {LABELS.marginalDesc}
                </p>
                <div className="text-text-bright border-accent-rose/40 mt-1 ml-4 rounded-r-xl border-l-4 bg-black/20 px-5 py-1.5 pl-10 font-bold italic">
                  &quot;O tamanho do desvio (exploit) deve ser estritamente proporcional à credibilidade da sua
                  informação.&quot; — Axioma Lipe Piv
                </div>
              </div>
            )}
          </div>
        </SotaTooltip>
      </div>

      {/* EQUITY CURVES CHART */}
      <div className="h-80 w-full overflow-hidden rounded-4xl border border-white/5 bg-black/40 p-6 shadow-inner">
        <PerspectiveChart chartData={chartData} />
      </div>

      {/* DIAGNÓSTICO SOTA */}
      <div className="from-accent-indigo/10 border-l-accent-indigo shadow-3xl group/diag hover:border-accent-indigo/30 relative overflow-hidden rounded-4xl border border-l-10 border-white/10 bg-linear-to-br via-black/40 to-black/60 p-8 text-[0.8rem] leading-relaxed text-indigo-100/90 backdrop-blur-xl transition-all duration-700">
        <div className="from-accent-indigo/5 pointer-events-none absolute inset-0 bg-radial-[at_center_center] to-transparent" />
        <div className="relative z-10 mb-4 flex items-center gap-3">
          <div className="bg-accent-indigo h-2 w-2 animate-pulse rounded-full shadow-[0_0_15px_var(--accent-indigo)]"></div>
          <strong className="text-accent-indigo-light text-[0.65rem] font-black tracking-[0.4em] uppercase">
            Síntese do Orquestrador Quantum
          </strong>
        </div>
        <p className="relative z-10 m-0 max-w-5xl leading-loose font-medium">{result.diagnostico}</p>
        <div className="relative z-10 mt-6 flex flex-wrap gap-x-10 gap-y-3 border-t border-white/5 pt-6">
          <div className="flex items-center gap-2.5">
            <span className="text-text-darker text-[0.55rem] font-black tracking-widest uppercase">{LABELS.sotaProtocol}</span>
            <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-[0.65rem] font-black tracking-widest text-white uppercase shadow-lg">
              {statusDisplay.protocoloLabel}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-text-darker text-[0.55rem] font-black tracking-widest uppercase">{LABELS.guideline}</span>
            <span className="text-text-muted text-[0.75rem] font-bold italic">
              {statusDisplay.diretrizLabel}
            </span>
          </div>
        </div>
        {isNearPayjump && (
          <div className="text-accent-gold shadow-3xl group/payjump relative mt-8 overflow-hidden rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6 leading-relaxed font-bold shadow-amber-500/5">
            <div className="absolute top-0 right-0 p-6 opacity-10 transition-opacity group-hover/payjump:opacity-20">
              <i className="fa-solid fa-bolt-lightning text-6xl"></i>
            </div>
            <div className="relative z-10 mb-3 flex items-center gap-3">
              <i className="fa-solid fa-bolt-lightning text-accent-amber animate-pulse text-lg"></i>
              <span className="text-[0.7rem] font-black tracking-[0.3em] uppercase">
                {LABELS.extremeRiskAversion}
              </span>
            </div>
            <p className="relative z-10 m-0 text-[0.85rem] leading-relaxed">
              {LABELS.extremeRiskDesc}
            </p>
          </div>
        )}
      </div>

      {/* TELEMETRIA SOTA WASM (Motor de Observabilidade) */}
      <WasmTelemetryWidget 
        wasmLogs={wasmLogs} 
        resultCi={result.ci} 
        riskAdvantage={result.riskAdvantage}
      />
    </div>
  );
}
