/**
 * IDENTITY: Dashboard SOTA v8.0 GOLD
 * PATH: src/components/simulator/DashboardSOTA.tsx
 * ROLE: Orquestrador Unificado de Telemetria e Radar Studio.
 * AESTHETIC: SOTA Gold Standard (Visual Symmetry, Glassmorphism, Tabular Nums, Multi-angle Radars).
 */

'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { use, useMemo, useState } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { TelemetryCharts, type TelemetryPoint } from '../analytics/TelemetryCharts';
import { solveIcmDistortion } from './solver/nashSolver';
import { GemmaAnalysisPanel } from './GemmaAnalysisPanel';
import { InsolvencyMatrix } from './InsolvencyMatrix';
import { SotaMetricsContext, SotaSpotContext, SotaWasmContext } from './SotaContext';
import { usePmLensCalculations } from './hooks/usePmLensCalculations';
import { RiskGauge } from './ui/RiskGauge';
import InsolvencyRadar from './ui/InsolvencyRadar';
import ComparisonRadar from './panels/ComparisonRadar';
import { useInsolvencyRadar } from './hooks/useInsolvencyRadar';
import type { Scenario, IcmDistortionResult } from './solver/types';

interface HistorianData {
  profile?: Record<string, number>;
  telemetry?: Array<{
    evLoss: number;
    isCorrect: boolean;
    createdAt: string | Date;
    stackDepthBb?: number;
    position?: string;
  }>;
}

export interface DashboardSOTAProps {
  initialData?: HistorianData | null;
  hudMode?: boolean;
  scenarios?: Scenario[];
  currentScenario?: Scenario;
  nashFlop?: IcmDistortionResult;
  insolvencyRadarData?: Array<{ subject: string; Ameaça: number }>;
}

type RadarStudioMode = 'insolvency' | 'comparison' | 'vulnerabilities';

interface HudViewProps {
  readonly radarData: Array<{ subject: string; Deficiencia: number }>;
  readonly topLeaks: [string, number][];
}

function PerfilNaoMedido() {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/30 p-8 text-center">
      <p className="m-0 text-xs font-black tracking-widest text-white uppercase">Perfil preditivo não medido</p>
      <p className="text-text-muted mx-auto mt-3 mb-0 max-w-md text-xs leading-relaxed">
        Não existe modelo individual para esta conta. O diagnóstico de vieses aparece aqui quando houver medição —
        nenhum valor de referência é exibido como se fosse seu.
      </p>
    </div>
  );
}

function HudView({ radarData, topLeaks }: HudViewProps) {
  if (radarData.length === 0) return <PerfilNaoMedido />;
  return (
    <div className="animate-sota-in flex flex-col gap-10">
      <div className="glass-panel group/hud-dash relative overflow-hidden border-white/5 p-8! shadow-2xl lg:p-10!">
        <div className="from-accent-indigo/5 pointer-events-none absolute inset-0 bg-radial-[at_top_left] to-transparent opacity-50" />
        <div className="relative z-10 mb-8 flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <i className="fa-solid fa-brain text-accent-indigo text-sm shadow-[0_0_10px_var(--accent-indigo)]" />
            <h3 className="m-0 text-xs font-black tracking-[0.4em] text-white uppercase">
              Assinatura <span className="text-text-darker ml-1">Bayesiana</span>
            </h3>
          </div>
          <div className="bg-accent-emerald h-1.5 w-1.5 animate-pulse rounded-full shadow-[0_0_10px_var(--accent-emerald)]" />
        </div>

        <div className="relative z-10 h-60 w-full rounded-3xl bg-black/20 p-2 shadow-inner">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
              <defs>
                <linearGradient id="hudLeakGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="5%" stopColor="var(--color-accent-indigo)" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="var(--color-accent-indigo)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <PolarGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{
                  fill: 'var(--color-text-muted)',
                  fontSize: 8,
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.05em',
                }}
              />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Deficiência"
                dataKey="Deficiencia"
                stroke="var(--color-accent-indigo)"
                strokeWidth={2}
                fill="url(#hudLeakGradient)"
                fillOpacity={0.3}
                isAnimationActive={false}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="relative z-10 mt-8 space-y-4 rounded-2xl border border-white/5 bg-slate-950/40 p-4 shadow-inner">
          {topLeaks.map(([name, value], idx) => (
            <div key={name} className="group/leak flex flex-col gap-2 transition-all duration-300 hover:translate-x-1">
              <div className="flex items-center justify-between px-1">
                <span
                  className={`text-[0.55rem] font-black tracking-widest uppercase transition-colors duration-300 ${idx === 0 ? 'text-accent-rose group-hover/leak:text-accent-rose-light' : 'text-text-muted group-hover/leak:text-white'}`}
                >
                  {name}
                </span>
                <span className="font-mono text-[0.65rem] font-black text-white">{(value * 100).toFixed(0)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5 shadow-inner">
                <div
                  style={{ width: `${value * 100}%`, transitionDelay: `${idx * 150}ms` }}
                  className={`sota-bar-fill h-full rounded-full ${idx === 0 ? 'bg-accent-rose shadow-[0_0_8px_var(--color-accent-rose)]' : 'bg-accent-indigo shadow-[0_0_8px_var(--color-accent-indigo)]'}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ExecutiveKpiSectionProps {
  readonly marginInstability: number;
  readonly riskAdvantage: number;
  readonly aggFactor: number;
  readonly deltaRp: number;
  readonly bayesianWinProb: number | null;
  readonly isSolvent: boolean;
}

function ExecutiveKpiSection({
  marginInstability,
  riskAdvantage,
  aggFactor,
  deltaRp,
  bayesianWinProb,
  isSolvent,
}: ExecutiveKpiSectionProps) {
  return (
    <section
      className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6"
      aria-label="KPIs Executivos de Telemetria"
    >
      <div className="glass-panel flex flex-col justify-between rounded-2xl border border-white/8 bg-slate-950/60 p-4 shadow-lg">
        <span className="text-text-dim mb-1 block text-[0.55rem] font-black tracking-[0.2em] uppercase">
          Instabilidade
        </span>
        <div className="flex items-baseline gap-2">
          <span
            className={`font-mono text-xl font-black ${marginInstability > 15 ? 'text-accent-rose' : 'text-white'}`}
          >
            {marginInstability.toFixed(1)}%
          </span>
        </div>
        <span className="text-text-darker mt-1 font-mono text-[0.52rem] tracking-wider uppercase">Margem &delta;</span>
      </div>

      <div className="glass-panel flex flex-col justify-between rounded-2xl border border-white/8 bg-slate-950/60 p-4 shadow-lg">
        <span className="text-text-dim mb-1 block text-[0.55rem] font-black tracking-[0.2em] uppercase">
          Vantagem Risco
        </span>
        <div className="flex items-baseline gap-2">
          <span
            className={`font-mono text-xl font-black ${riskAdvantage >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}
          >
            {riskAdvantage > 0 ? '+' : ''}
            {riskAdvantage.toFixed(1)}%
          </span>
        </div>
        <span className="text-text-darker mt-1 font-mono text-[0.52rem] tracking-wider uppercase">
          {riskAdvantage >= 0 ? 'IP Domina' : 'OOP Vulnerável'}
        </span>
      </div>

      <div className="glass-panel flex flex-col justify-between rounded-2xl border border-white/8 bg-slate-950/60 p-4 shadow-lg">
        <span className="text-text-dim mb-1 block text-[0.55rem] font-black tracking-[0.2em] uppercase">
          Fator &Psi;
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-accent-indigo-light font-mono text-xl font-black">{aggFactor.toFixed(1)}x</span>
        </div>
        <span className="text-text-darker mt-1 font-mono text-[0.52rem] tracking-wider uppercase">Agressão Real</span>
      </div>

      <div className="glass-panel flex flex-col justify-between rounded-2xl border border-white/8 bg-slate-950/60 p-4 shadow-lg">
        <span className="text-text-dim mb-1 block text-[0.55rem] font-black tracking-[0.2em] uppercase">
          Assimetria &Delta;RP
        </span>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-xl font-black text-white">{deltaRp.toFixed(1)}%</span>
        </div>
        <span className="text-text-darker mt-1 font-mono text-[0.52rem] tracking-wider uppercase">
          Distorção de Preço
        </span>
      </div>

      <div className="glass-panel flex flex-col justify-between rounded-2xl border border-white/8 bg-slate-950/60 p-4 shadow-lg">
        <span className="text-text-dim mb-1 block text-[0.55rem] font-black tracking-[0.2em] uppercase">
          Posterior Bayes
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-accent-indigo font-mono text-xl font-black">
            {bayesianWinProb !== null ? `${bayesianWinProb.toFixed(1)}%` : '--'}
          </span>
        </div>
        <span className="text-text-darker mt-1 font-mono text-[0.52rem] tracking-wider uppercase">
          Win Prob Posterior
        </span>
      </div>

      <div className="glass-panel flex flex-col justify-between rounded-2xl border border-white/8 bg-slate-950/60 p-4 shadow-lg">
        <span className="text-text-dim mb-1 block text-[0.55rem] font-black tracking-[0.2em] uppercase">Solvência</span>
        <div className="flex items-center gap-2">
          <div
            className={`h-2.5 w-2.5 rounded-full ${isSolvent ? 'bg-accent-emerald shadow-[0_0_10px_var(--accent-emerald)]' : 'bg-accent-rose animate-pulse shadow-[0_0_10px_var(--accent-rose)]'}`}
          />
          <span
            className={`font-mono text-sm font-black tracking-wider uppercase ${isSolvent ? 'text-accent-emerald' : 'text-accent-rose'}`}
          >
            {isSolvent ? 'Solvente' : 'Insolvente'}
          </span>
        </div>
        <span className="text-text-darker mt-1 font-mono text-[0.52rem] tracking-wider uppercase">
          Equilíbrio de Nash
        </span>
      </div>
    </section>
  );
}

export default function DashboardSOTA({
  initialData,
  hudMode = false,
  scenarios,
  currentScenario,
  nashFlop,
  insolvencyRadarData,
}: Readonly<DashboardSOTAProps> = {}) {
  const metricsContext = use(SotaMetricsContext);
  const spotContext = use(SotaSpotContext);
  const wasmContext = use(SotaWasmContext);

  const [radarStudioMode, setRadarStudioMode] = useState<RadarStudioMode>('insolvency');

  const DEFAULT_STACKS = useMemo(() => [9.4, 52.4, 22.2, 7, 44.3, 24.3, 40, 13.4, 55], []);
  const DEFAULT_PRIZES = useMemo(() => [237.34, 170.96, 135.17, 109.99, 90.28, 73.95, 59.92, 47.56, 36.47], []);

  const initialStacks = spotContext?.initialStacks ?? DEFAULT_STACKS;
  const initialPrizes = spotContext?.initialPrizes ?? DEFAULT_PRIZES;
  const heroIdx = spotContext?.heroIdx ?? 6;
  const primaryVillainIdx = spotContext?.primaryVillainIdx ?? 8;
  const heroInvested = spotContext?.heroInvested ?? 1;
  const simulatedActivePlayers = spotContext?.activePlayers ?? 2;
  const absoluteHeroPos = spotContext?.heroPosition ?? 'IP';
  const blindsRisingSoon = spotContext?.blindsRisingSoon ?? false;
  const aggFactor = spotContext?.aggFactor ?? 1;

  // Fonte única da equity, a mesma da Lente PM (SIM-02, SIM-07).
  const equity = wasmContext?.nativeRangeMetric?.equity ?? 50;

  const isHeroIP = absoluteHeroPos === 'IP';
  const posBaseline = isHeroIP ? 1 : 0.85;
  const realizationFactor = posBaseline;

  const { streetMetrics } = usePmLensCalculations({
    initialStacks,
    initialPrizes,
    heroIdx,
    primaryVillainIdx,
    currentPot: spotContext?.spotData?.pot ?? 7.5,
    heroInvested,
    equity,
    realizationFactor,
    deltaHabilidade: 50,
    kappa: 0.5,
    simulatedActivePlayers,
    absoluteHeroPos,
    blindsRisingSoon,
    activeNodelock: null,
    betSizing: 0.5,
    aggFactor,
  });

  const { data: session } = useSession();
  const userName = session?.user?.name || 'Operador Autônomo';

  // FE-03 (auditoria 2026-09-17): sem perfil medido, NÃO há perfil. Até esta data o componente caía
  // num perfil fixo ('Aversão ao Risco': 0.85, …) e o exibia como "Diagnóstico" e "Top Leaks" do usuário.
  const activeProfile = useMemo<Record<string, number> | null>(() => {
    const raw = initialData?.profile ?? metricsContext?.predictiveProfile ?? null;
    return typeof raw === 'object' && raw !== null && !Array.isArray(raw) && Object.keys(raw).length > 0
      ? (raw as Record<string, number>)
      : null;
  }, [initialData?.profile, metricsContext?.predictiveProfile]);

  const ipRp = spotContext?.effectiveIpRp ?? 21.4;
  const oopRp = spotContext?.effectiveOopRp ?? 12.9;
  const deltaRp = Math.abs(ipRp - oopRp);
  const potSize = spotContext?.spotData?.pot ?? 7.5;

  const baselineFreqs = useMemo(
    () => ({
      ip_check: 40,
      ip_bet_small: 30,
      ip_bet_large: 30,
      oop_call: 50,
      oop_fold: 30,
      oop_raise: 20,
    }),
    [],
  );

  const nashResult = useMemo(
    () => solveIcmDistortion(ipRp, oopRp, baselineFreqs, 1, potSize),
    [ipRp, oopRp, baselineFreqs, potSize],
  );

  const radarData = useMemo(() => {
    if (!activeProfile) return [];
    return Object.entries(activeProfile).map(([key, val]) => ({
      subject: key,
      Deficiencia: Number((val * 100).toFixed(1)),
    }));
  }, [activeProfile]);

  const topLeaks = useMemo<[string, number][]>(() => {
    if (!activeProfile) return [];
    return Object.entries(activeProfile)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [activeProfile]);

  const fallbackInsolvencyData = useInsolvencyRadar(metricsContext?.apiQuantumMetrics ?? null);
  const activeInsolvencyData =
    insolvencyRadarData && insolvencyRadarData.length > 0 ? insolvencyRadarData : fallbackInsolvencyData;

  const activeTelemetry: TelemetryPoint[] = useMemo(() => {
    const rawTelemetry = initialData?.telemetry || metricsContext?.predictiveTelemetry;
    if (rawTelemetry && rawTelemetry.length > 0) {
      return rawTelemetry.map((t) => ({
        ...t,
        createdAt: new Date(t.createdAt),
      }));
    }
    // Sem telemetria gravada, a curva fica vazia. Até 2026-09-17 entravam aqui 3 eventos inventados,
    // datados de "agora", exibidos como histórico do usuário (FE-03).
    return [];
  }, [initialData?.telemetry, metricsContext?.predictiveTelemetry]);

  // HUD Minimalista (se ativado)
  if (hudMode) {
    return <HudView radarData={radarData} topLeaks={topLeaks} />;
  }

  const qMetrics = metricsContext?.apiQuantumMetrics;
  const isSolvent = qMetrics?.isSolvent ?? true;
  const marginInstability = qMetrics?.marginInstability ?? 0;
  const riskAdvantage = qMetrics?.riskAdvantage ?? 0;
  const bayesianWinProb = qMetrics?.bayesianWinProb ?? null;

  return (
    <div className="sota-panel-gap animate-sota-in flex flex-col gap-10 tabular-nums">
      {/* ═══ 1. FAIXA SUPERIOR DE KPIS EXECUTIVOS SOTA ═══ */}
      <ExecutiveKpiSection
        marginInstability={marginInstability}
        riskAdvantage={riskAdvantage}
        aggFactor={aggFactor}
        deltaRp={deltaRp}
        bayesianWinProb={bayesianWinProb}
        isSolvent={isSolvent}
      />

      {/* ═══ 2. RADAR STUDIO SOTA: HUB MULTIDIMENSIONAL INTEGRADO ═══ */}
      <section
        className="glass-panel relative overflow-hidden rounded-4xl border border-white/8 bg-slate-950/50 p-6 shadow-2xl sm:p-8"
        aria-label="Radar Studio SOTA"
      >
        <div className="bg-accent-indigo/5 pointer-events-none absolute top-0 right-0 h-80 w-80 rounded-full blur-[120px]" />
        <div className="bg-accent-rose/5 pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full blur-[120px]" />

        {/* Cabeçalho do Studio com Seletor Segmentado */}
        <div className="relative z-10 mb-6 flex flex-col items-start justify-between gap-6 border-b border-white/8 pb-6 xl:flex-row xl:items-center">
          <div className="max-w-2xl min-w-0 space-y-1">
            <div className="flex items-center gap-3">
              <div className="bg-accent-indigo h-2.5 w-2.5 shrink-0 animate-pulse rounded-full shadow-[0_0_12px_var(--accent-indigo)]" />
              <h2 className="m-0 truncate text-base font-black tracking-[0.25em] text-white uppercase sm:text-lg">
                Radar Studio SOTA
              </h2>
            </div>
            <p className="text-text-dim m-0 font-mono text-[0.62rem] leading-relaxed tracking-wider uppercase">
              Visualização vetorial multidimensional de tensões, topologia e psicologia de mesa
            </p>
          </div>

          {/* Segmented Switcher */}
          <div className="no-scrollbar flex max-w-full shrink-0 items-center overflow-x-auto rounded-2xl border border-white/10 bg-black/50 p-1 shadow-inner">
            <button
              type="button"
              onClick={() => setRadarStudioMode('insolvency')}
              className={`flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2 text-[0.6rem] font-black tracking-wider whitespace-nowrap uppercase transition-all duration-300 sm:px-3.5 sm:text-[0.62rem] ${
                radarStudioMode === 'insolvency'
                  ? 'bg-accent-rose/20 text-accent-rose-light border-accent-rose/40 border shadow-lg shadow-rose-500/10'
                  : 'text-text-dim hover:text-text-muted border border-transparent hover:bg-white/5'
              }`}
            >
              <i className="fa-solid fa-satellite-dish text-xs" />
              <span>Insolvência & Mesa</span>
            </button>

            <button
              type="button"
              onClick={() => setRadarStudioMode('comparison')}
              className={`flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2 text-[0.6rem] font-black tracking-wider whitespace-nowrap uppercase transition-all duration-300 sm:px-3.5 sm:text-[0.62rem] ${
                radarStudioMode === 'comparison'
                  ? 'bg-accent-indigo/20 border-accent-indigo/40 border text-white shadow-lg shadow-indigo-500/10'
                  : 'text-text-dim hover:text-text-muted border border-transparent hover:bg-white/5'
              }`}
            >
              <i className="fa-solid fa-draw-polygon text-xs" />
              <span>Topologia Comparativa</span>
            </button>

            <button
              type="button"
              onClick={() => setRadarStudioMode('vulnerabilities')}
              className={`flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2 text-[0.6rem] font-black tracking-wider whitespace-nowrap uppercase transition-all duration-300 sm:px-3.5 sm:text-[0.62rem] ${
                radarStudioMode === 'vulnerabilities'
                  ? 'bg-accent-emerald/20 text-accent-emerald-light border-accent-emerald/40 border shadow-lg shadow-emerald-500/10'
                  : 'text-text-dim hover:text-text-muted border border-transparent hover:bg-white/5'
              }`}
            >
              <i className="fa-solid fa-brain text-xs" />
              <span>Vulnerabilidades & Leaks</span>
            </button>
          </div>
        </div>

        {/* Conteúdo do Modo Ativo do Studio */}
        <div className="relative z-10">
          {radarStudioMode === 'insolvency' && (
            <div className="animate-sota-in grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              <div className="flex h-96 w-full items-center justify-center lg:col-span-7">
                <InsolvencyRadar data={activeInsolvencyData} />
              </div>
              <div className="flex flex-col gap-4 lg:col-span-5">
                <div className="border-b border-white/5 pb-3">
                  <span className="text-[0.68rem] font-black tracking-[0.2em] text-white uppercase">
                    Diagnóstico dos 6 Vetores de Ameaça
                  </span>
                  <p className="text-text-dim m-0 mt-1 text-[0.6rem]">
                    Projeção vetorial instantânea calculada a partir dos parâmetros físicos da mesa
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                    <span className="text-text-dim mb-1 block text-[0.52rem] font-black tracking-wider uppercase">
                      Pressão RIO MW
                    </span>
                    <span className="text-accent-rose font-mono text-base font-black">
                      {(qMetrics?.rioMw ?? 0.8).toFixed(2)}x
                    </span>
                    <p className="text-text-darker m-0 mt-0.5 text-[0.5rem]">Responsabilidade reversa</p>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                    <span className="text-text-dim mb-1 block text-[0.52rem] font-black tracking-wider uppercase">
                      Erosão no Fold
                    </span>
                    <span className="text-accent-indigo-light font-mono text-base font-black">
                      {(qMetrics?.adjustedEvFold ?? -0.5).toFixed(2)} bb
                    </span>
                    <p className="text-text-darker m-0 mt-0.5 text-[0.5rem]">Threshold de desistência</p>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                    <span className="text-text-dim mb-1 block text-[0.52rem] font-black tracking-wider uppercase">
                      Desvantagem Risco
                    </span>
                    <span className="font-mono text-base font-black text-white">
                      {Math.abs(riskAdvantage).toFixed(1)}%
                    </span>
                    <p className="text-text-darker m-0 mt-0.5 text-[0.5rem]">Divergência de cobertura</p>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                    <span className="text-text-dim mb-1 block text-[0.52rem] font-black tracking-wider uppercase">
                      Vulnerabilidade
                    </span>
                    <span className="text-accent-emerald font-mono text-base font-black">
                      {(qMetrics?.perspectiva ?? 12.5).toFixed(1)}%
                    </span>
                    <p className="text-text-darker m-0 mt-0.5 text-[0.5rem]">Lente Teórica PM</p>
                  </div>
                </div>

                <div className="text-text-muted rounded-2xl border border-white/5 bg-white/2 p-4 text-[0.68rem] leading-relaxed">
                  <p className="m-0">
                    <strong className="text-white">Interpretação SOTA:</strong> Quando os eixos de <em>Pressão RIO</em>{' '}
                    e <em>Erosão RP</em> expandem para além de 60%, o defensor entra na Zona de Falência das Pot Odds,
                    exigindo overfold profilático.
                  </p>
                </div>
              </div>
            </div>
          )}

          {radarStudioMode === 'comparison' && (
            <div className="animate-sota-in">
              {scenarios && scenarios.length > 0 ? (
                <ComparisonRadar
                  scenarios={scenarios}
                  currentId={currentScenario?.id ?? scenarios[0]?.id ?? ''}
                  nashFlop={nashFlop}
                  embedded
                />
              ) : (
                <div className="text-text-darker p-12 text-center font-mono text-xs tracking-widest uppercase">
                  Nenhum cenário adicional carregado para comparação topológica.
                </div>
              )}
            </div>
          )}

          {radarStudioMode === 'vulnerabilities' && radarData.length === 0 && <PerfilNaoMedido />}
          {radarStudioMode === 'vulnerabilities' && radarData.length > 0 && (
            <div className="animate-sota-in grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              <div className="flex h-96 w-full items-center justify-center lg:col-span-7">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <defs>
                      <linearGradient id="leakGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="5%" stopColor="var(--color-accent-emerald)" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="var(--color-accent-emerald)" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <PolarGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{
                        fill: 'var(--color-text-muted)',
                        fontSize: 10,
                        fontWeight: 900,
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.12em',
                      }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Deficiência (%)"
                      dataKey="Deficiencia"
                      stroke="var(--color-accent-emerald)"
                      strokeWidth={3}
                      fill="url(#leakGradient)"
                      fillOpacity={0.4}
                      isAnimationActive={false}
                    />
                    <RechartsTooltip
                      isAnimationActive={false}
                      allowEscapeViewBox={{ x: true, y: true }}
                      wrapperStyle={{ zIndex: 1000 }}
                      contentStyle={{
                        backgroundColor: '#020617',
                        border: '1px solid rgba(16,185,129,0.3)',
                        borderRadius: '20px',
                        boxShadow: '0 30px 60px rgba(0,0,0,0.9)',
                        padding: '16px',
                      }}
                      itemStyle={{
                        color: '#10b981',
                        fontWeight: '900',
                        textTransform: 'uppercase',
                        fontSize: '11px',
                        letterSpacing: '0.1em',
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col gap-6 lg:col-span-5">
                <div className="border-b border-white/5 pb-4">
                  <span className="text-[0.68rem] font-black tracking-[0.2em] text-white uppercase">
                    Top Leaks Cognitivos Identificados
                  </span>
                  <p className="text-text-dim m-0 mt-1 text-[0.6rem]">
                    Vulnerabilidades psicológicas e heurísticas estimadas pela Mente Preditiva
                  </p>
                </div>

                <div className="space-y-4 rounded-2xl border border-white/5 bg-slate-950/40 p-5 shadow-inner">
                  {topLeaks.map(([name, value], idx) => (
                    <div
                      key={name}
                      className="group/leak flex flex-col gap-2.5 transition-all duration-300 hover:translate-x-1"
                    >
                      <div className="flex items-center justify-between px-2">
                        <span
                          className={`text-[0.7rem] font-black tracking-widest uppercase transition-colors ${idx === 0 ? 'text-accent-rose' : 'text-text-muted group-hover/leak:text-white'}`}
                        >
                          {name}
                        </span>
                        <span className="font-mono text-[0.75rem] font-black text-white tabular-nums">
                          {(value * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full border border-white/5 bg-white/5 shadow-inner">
                        <div
                          style={{ width: `${value * 100}%`, transitionDelay: `${idx * 150}ms` }}
                          className={`sota-bar-fill h-full rounded-full ${idx === 0 ? 'bg-accent-rose shadow-[0_0_12px_var(--color-accent-rose)]' : 'bg-accent-emerald shadow-[0_0_12px_var(--color-accent-emerald)]'}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══ 3. CAMADA DE INSOLVÊNCIA & GEOMETRIA DO RISCO ═══ */}
      <section
        className="grid grid-cols-1 items-stretch gap-10 xl:grid-cols-[1.3fr_1fr]"
        aria-label="Matriz de Insolvência e Perspectiva"
      >
        <div className="glass-panel group/insolvency-wrap relative rounded-4xl border border-white/8 bg-slate-950/50 p-6 shadow-2xl sm:p-8">
          <div className="bg-grain pointer-events-none absolute inset-0 overflow-hidden rounded-4xl opacity-5 mix-blend-overlay" />
          <div className="relative z-10 mb-8 flex items-center justify-between border-b border-white/5 pb-6">
            <div className="flex items-center gap-4">
              <div className="bg-accent-indigo h-3 w-3 animate-pulse rounded-full shadow-[0_0_20px_var(--color-accent-indigo)]" />
              <h3 className="m-0 text-[0.85rem] font-black tracking-[0.4em] text-white uppercase">
                Matriz de Insolvência SOTA
              </h3>
            </div>
            <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5">
              <div className="bg-accent-emerald h-1.5 w-1.5 animate-ping rounded-full" />
              <span className="text-text-muted text-[0.55rem] font-black tracking-[0.25em] uppercase">
                Quantum Feed Live
              </span>
            </div>
          </div>
          <div className="relative z-10">
            <InsolvencyMatrix streetMetrics={streetMetrics} />
          </div>
        </div>

        <div className="glass-panel group/pm-guide relative flex flex-col justify-between overflow-hidden rounded-4xl border border-white/8 bg-slate-950/50 p-6 shadow-2xl sm:p-8">
          <div className="bg-grain pointer-events-none absolute inset-0 opacity-5 mix-blend-overlay" />
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-5">
              <div className="bg-accent-indigo/10 border-accent-indigo/20 text-accent-indigo-light relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                {session?.user?.image ? (
                  <Image src={session.user.image} alt={userName} width={56} height={56} className="object-cover" />
                ) : (
                  <i className="fa-solid fa-user-gear text-2xl" />
                )}
              </div>
              <div>
                <h3 className="m-0 mb-1 text-sm leading-none font-black tracking-[0.25em] text-white uppercase">
                  Perspectiva Matemática
                </h3>
                <p className="text-text-darker m-0 text-[0.65rem] font-black tracking-[0.15em] uppercase">
                  Operador: <span className="text-accent-indigo-light font-bold">{userName}</span>
                </p>
              </div>
            </div>

            <p className="text-text-muted border-accent-indigo/40 rounded-r-2xl border-l-2 bg-white/2 py-4 pl-6 text-[0.85rem] leading-relaxed font-medium italic shadow-inner">
              &quot;A Matriz de Insolvência ao lado não é apenas um cálculo de equidade, mas uma projeção A* Pathfinding
              de sobrevivência financeira.&quot;
            </p>

            {/* Módulo de Telemetria Visual SOTA */}
            <div className="flex items-center justify-around pt-2">
              <RiskGauge
                value={ipRp}
                label="IP (Agressor)"
                pos={spotContext?.spotData?.heroRange || 'BTN'}
                stack="40bb"
                baseColor="indigo"
                opponentValue={oopRp}
                dynamicDeathZone={41}
                maxRp={50}
              />
              <RiskGauge
                value={oopRp}
                label="OOP (Defensor)"
                pos={spotContext?.spotData?.villainRange || 'BB'}
                stack="55bb"
                baseColor="pink"
                opponentValue={ipRp}
                dynamicDeathZone={41}
                maxRp={50}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-4 text-center shadow-inner">
                <span className="text-text-muted mb-1 block text-[0.6rem] tracking-widest uppercase">
                  OOP Call (ChipEV)
                </span>
                <span className="text-text-muted font-mono text-xl font-black">50.0%</span>
              </div>
              <div className="bg-accent-rose-surface/10 border-accent-rose/20 flex flex-col items-center justify-center rounded-2xl border p-4 text-center shadow-[0_0_20px_rgba(244,63,94,0.1)]">
                <span className="text-accent-rose mb-1 block text-[0.6rem] tracking-widest uppercase">
                  OOP Call (SOTA)
                </span>
                <span className="text-accent-rose font-mono text-xl font-black">
                  {nashResult.oop.call.center.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 4. CENTRAL DE TELEMETRIA TEMPORAL & QUADRANTES ═══ */}
      <section
        className="glass-panel group/telemetry relative flex flex-col overflow-hidden rounded-4xl border border-white/8 bg-slate-950/50 p-6 shadow-2xl sm:p-8"
        aria-label="Curva de Performance Temporal"
      >
        <div className="relative z-10 mb-8 flex items-center justify-between border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="bg-accent-emerald h-2.5 w-2.5 animate-pulse rounded-full shadow-[0_0_15px_var(--color-accent-emerald)]" />
            <h3 className="m-0 text-[0.85rem] font-black tracking-[0.4em] text-white uppercase">
              Curva de Performance Temporal & Zonas de Risco
            </h3>
          </div>
          <i className="fa-solid fa-chart-line text-accent-emerald text-base" />
        </div>
        <div className="relative z-10 w-full">
          {activeTelemetry.length > 0 ? (
            <TelemetryCharts data={activeTelemetry} />
          ) : (
            <div className="rounded-3xl border border-white/10 bg-black/30 p-8 text-center">
              <p className="m-0 text-xs font-black tracking-widest text-white uppercase">Nenhuma decisão gravada</p>
              <p className="text-text-muted mx-auto mt-3 mb-0 max-w-md text-xs leading-relaxed">
                A curva de performance é montada a partir das suas decisões registradas com sessão ativa.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ═══ 5. ORÁCULO DE INFERÊNCIA NEURAL (GEMMA EDGE) — INSTÂNCIA ÚNICA SOTA ═══ */}
      <section className="animate-sota-in" aria-label="Motor de Inferência Gemma Edge">
        <div className="mb-6 flex items-center gap-6">
          <h3 className="text-glow-indigo m-0 flex items-center gap-4 text-xl font-black tracking-tight text-white uppercase">
            <i className="fa-solid fa-microchip text-accent-indigo shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
            <span>Motor de Inferência (Gemma Edge)</span>
          </h3>
          <div className="h-px grow bg-linear-to-r from-white/10 to-transparent" />
        </div>
        <GemmaAnalysisPanel
          heroPos={spotContext?.spotData?.heroRange || 'BTN'}
          villainPos={spotContext?.spotData?.villainRange || 'BB'}
          potSize={potSize}
          heroStack={spotContext?.heroStack ?? 40}
          villainStack={spotContext?.villainStack ?? 55}
          heroInvested={heroInvested}
          riskAdvantage={riskAdvantage}
          bountyPower={0}
        />
      </section>
    </div>
  );
}
