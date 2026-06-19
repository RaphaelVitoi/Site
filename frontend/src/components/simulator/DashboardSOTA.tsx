/**
 * IDENTITY: Dashboard SOTA v7.0 GOLD
 * PATH: src/components/simulator/DashboardSOTA.tsx
 * ROLE: Orquestrador de Telemetria e Assinatura Cognitiva.
 * AESTHETIC: SOTA Gold Standard (Visual Symmetry, Glassmorphism, Tabular Nums).
 */

import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Image from 'next/image'; // SOTA: Importação estrita obrigatória para evitar colisão com o DOM
import { use } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { TelemetryCharts } from '../analytics/TelemetryCharts';
import { solveIcmDistortion } from './engine/nashSolver';
import { GemmaAnalysisPanel } from './GemmaAnalysisPanel';
import { InsolvencyMatrix } from './InsolvencyMatrix';
import { SotaMetricsContext, SotaSpotContext, SotaWasmContext } from './SotaContext';
import { usePmLensCalculations } from './hooks/usePmLensCalculations';
import { RiskGauge } from './ui/RiskGauge';

interface HistorianData {
  profile?: Record<string, number>;
  telemetry?: Array<{
    evLoss: number;
    isCorrect: boolean;
    createdAt: string | Date;
  }>;
}

interface DashboardSOTAProps {
  initialData?: HistorianData | null;
  hudMode?: boolean; // SOTA v7.0 GOLD
}

export default function DashboardSOTA({ initialData, hudMode = false }: Readonly<DashboardSOTAProps> = {}) {
  const metricsContext = use(SotaMetricsContext);
  const spotContext = use(SotaSpotContext);
  const wasmContext = use(SotaWasmContext);

  const DEFAULT_STACKS = [9.4, 52.4, 22.2, 7, 44.3, 24.3, 40, 13.4, 55];
  const DEFAULT_PRIZES = [237.34, 170.96, 135.17, 109.99, 90.28, 73.95, 59.92, 47.56, 36.47];

  const initialStacks = spotContext?.initialStacks ?? DEFAULT_STACKS;
  const initialPrizes = spotContext?.initialPrizes ?? DEFAULT_PRIZES;
  const heroIdx = spotContext?.heroIdx ?? 6;
  const primaryVillainIdx = spotContext?.primaryVillainIdx ?? 8;
  const heroInvested = spotContext?.heroInvested ?? 1;
  const simulatedActivePlayers = spotContext?.activePlayers ?? 2;
  const absoluteHeroPos = spotContext?.heroPosition ?? 'IP';
  const blindsRisingSoon = spotContext?.blindsRisingSoon ?? false;
  const pkoValue = 0;
  const aggFactor = spotContext?.aggFactor ?? 1;

  const rawGpuEquity = wasmContext?.insolvencyMatrixData?.winRate
    ? wasmContext.insolvencyMatrixData.winRate * 100
    : undefined;
  const equity =
    rawGpuEquity === undefined ? (wasmContext?.nativeRangeMetric?.equity ?? 50) : Number(rawGpuEquity.toFixed(1));

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
    pkoValue,
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

  const defaultProfile = {
    'Aversão ao Risco': 0.85,
    'Pot Entrapment': 0.65,
    'Miopia de Payjump': 0.9,
    'Excesso de Agressão': 0.3,
    'Passivo Estrutural (RIO)': 0.75,
    'Desvio de Nash': 0.45,
  };

  const rawProfile = initialData?.profile || metricsContext?.predictiveProfile || defaultProfile;

  // SOTA Guard: Se a API falhar e retornar HTML/String, força o fallback seguro.
  const activeProfile =
    typeof rawProfile === 'object' && rawProfile !== null && !Array.isArray(rawProfile)
      ? (rawProfile as Record<string, number>)
      : defaultProfile;

  // SOTA: Extração do Contexto da Mesa (Fallbacks da Aula 1.2 empírica)
  const ipRp = spotContext?.effectiveIpRp ?? 21.4;
  const oopRp = spotContext?.effectiveOopRp ?? 12.9;
  const potSize = spotContext?.spotData?.pot ?? 7.5;

  // SOTA: Motor Quântico executado em tempo real na Interface
  const baselineFreqs = {
    ip_check: 40,
    ip_bet_small: 30,
    ip_bet_large: 30,
    oop_call: 50,
    oop_fold: 30,
    oop_raise: 20,
  };
  const nashResult = solveIcmDistortion(ipRp, oopRp, baselineFreqs, 1, potSize);

  const radarData = (Object.keys(activeProfile) as Array<keyof typeof activeProfile>).map((key) => ({
    subject: key,
    Deficiencia: Number((activeProfile[key] * 100).toFixed(1)),
  }));

  const topLeaks = Object.entries(activeProfile)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const activeTelemetry = (initialData?.telemetry || metricsContext?.predictiveTelemetry)?.map((t) => ({
    ...t,
    createdAt: new Date(t.createdAt),
  })) || [
    {
      evLoss: 1.2,
      isCorrect: false,
      createdAt: new Date(Date.now() - 7200000),
    },
    { evLoss: 0, isCorrect: true, createdAt: new Date() },
  ];

  if (hudMode) {
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
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value * 100}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut', delay: idx * 0.2 }}
                    className={`h-full rounded-full ${idx === 0 ? 'bg-accent-rose shadow-[0_0_8px_var(--color-accent-rose)]' : 'bg-accent-indigo shadow-[0_0_8px_var(--color-accent-indigo)]'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sota-panel-gap animate-sota-in tabular-nums">
      {/* Camada Superior: Diagnóstico de Risco de Ruína */}
      <div className="grid grid-cols-1 items-stretch gap-12 xl:grid-cols-[1.3fr_1fr]">
        <div className="glass-panel group/insolvency-wrap overflow-hidden">
          <div className="bg-grain pointer-events-none absolute inset-0 opacity-5 mix-blend-overlay" />
          <div className="pointer-events-none absolute inset-0">
            <div className="bg-accent-indigo/10 group-hover/insolvency-wrap:bg-accent-indigo/20 absolute -top-32 -right-32 h-80 w-80 rounded-full blur-[140px] transition-colors duration-1000" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.05),transparent)]" />
          </div>
          <div className="relative z-10 mb-16 flex items-center justify-between border-b border-white/5 pb-10">
            <div className="flex items-center gap-5">
              <div className="bg-accent-indigo h-3 w-3 animate-pulse rounded-full shadow-[0_0_20px_var(--color-accent-indigo)]" />
              <h3 className="group-hover/insolvency-wrap:text-glow-indigo m-0 text-[0.85rem] font-black tracking-[0.4em] text-white uppercase transition-all duration-500">
                Matriz de Insolvência SOTA
              </h3>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2">
              <div className="bg-accent-emerald h-2 w-2 animate-ping rounded-full" />
              <span className="text-text-muted text-[0.6rem] font-black tracking-[0.3em] uppercase">
                Quantum Feed Live
              </span>
            </div>
          </div>
          <div className="relative z-10">
            <InsolvencyMatrix streetMetrics={streetMetrics} />
          </div>
        </div>

        <div className="glass-panel group/pm-guide flex flex-col justify-between overflow-hidden">
          <div className="bg-grain pointer-events-none absolute inset-0 opacity-5 mix-blend-overlay" />
          <div className="pointer-events-none absolute inset-0">
            <div className="bg-accent-indigo/5 group-hover/pm-guide:bg-accent-indigo/10 absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl transition-all duration-1000" />
            <div className="bg-accent-indigo/5 group-hover/pm-guide:bg-accent-indigo/10 absolute -bottom-32 -left-32 h-80 w-80 rounded-full blur-3xl transition-all duration-1000" />
          </div>

          <div className="relative z-10 space-y-10">
            <div className="mb-8 flex items-center gap-6">
              <div className="bg-accent-indigo/10 border-accent-indigo/20 text-accent-indigo-light relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border shadow-[0_0_40px_rgba(99,102,241,0.2)] transition-all duration-500 group-hover/pm-guide:shadow-[0_0_60px_rgba(99,102,241,0.4)]">
                {/* SOTA: Blindagem JSX contra injeção de texto/comentários e tipagem estrita do componente Image */}
                {session?.user?.image ? (
                  <Image src={session.user.image} alt={userName} width={64} height={64} className="object-cover" />
                ) : (
                  <i className="fa-solid fa-user-gear text-3xl" />
                )}
              </div>
              <div>
                <h3 className="group-hover/pm-guide:text-glow-indigo m-0 mb-3 text-base leading-none font-black tracking-[0.3em] text-white uppercase transition-all duration-500">
                  Perspectiva Matemática
                </h3>
                <p className="text-text-darker m-0 text-[0.7rem] font-black tracking-[0.2em] uppercase">
                  Operador: <span className="text-accent-indigo-light font-bold">{userName}</span>
                </p>
              </div>
            </div>
            <p className="text-text-muted border-accent-indigo/40 group-hover/pm-guide:border-accent-indigo rounded-r-3xl border-l-2 bg-white/2 py-6 pl-10 text-[1rem] leading-relaxed font-medium italic shadow-inner transition-colors duration-500">
              &quot;A Matriz de Insolvência ao lado não é apenas um cálculo de equidade, mas uma projeção A* Pathfinding
              de sobrevivência financeira.&quot;
            </p>

            {/* Módulo de Telemetria Visual SOTA */}
            <div className="flex items-center justify-around pt-4">
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

            {/* SOTA v7.0: Geometria do Risco & Estresse Topológico */}
            <div className="my-6 grid grid-cols-3 gap-8 border-y border-white/5 py-8">
              <div className="flex flex-col items-center gap-2">
                <span className="text-text-darker text-[0.6rem] font-black tracking-[0.3em] uppercase">Fator Ψ</span>
                <span
                  className={`font-mono text-base font-black ${(activeProfile['Desvio de Nash'] ?? 0) > 0.5 ? 'text-accent-rose' : 'text-accent-indigo-light'}`}
                >
                  {((activeProfile['Desvio de Nash'] ?? 0) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-text-darker text-[0.6rem] font-black tracking-[0.3em] uppercase">Estresse</span>
                <span className="font-mono text-base font-black text-white">
                  {(metricsContext?.apiQuantumMetrics?.marginInstability ?? 0).toFixed(1)}%
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-text-darker text-[0.6rem] font-black tracking-[0.3em] uppercase">Solvência</span>
                <div
                  className={`h-3.5 w-3.5 rounded-full shadow-[0_0_15px_currentColor] ${metricsContext?.apiQuantumMetrics?.isSolvent ? 'text-accent-emerald bg-accent-emerald' : 'text-accent-danger bg-accent-danger animate-pulse'}`}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-6">
              <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-5 text-center shadow-inner">
                <span className="text-text-muted mb-1.5 block text-[0.65rem] tracking-widest uppercase">
                  OOP Call (ChipEV)
                </span>
                <span className="font-mono text-2xl font-black text-slate-400">50.0%</span>
              </div>
              <div className="bg-accent-rose/10 border-accent-rose/20 flex flex-col items-center justify-center rounded-2xl border p-5 text-center shadow-[0_0_25px_rgba(244,63,94,0.15)]">
                <span className="text-accent-rose mb-1.5 block text-[0.65rem] tracking-widest uppercase">
                  OOP Call (SOTA)
                </span>
                <span className="text-accent-rose font-mono text-2xl font-black">
                  {nashResult.oop.call.center.toFixed(1)}%
                </span>
              </div>
            </div>
            {/* SOTA v7.0: Bayesian Win Probability Expansion */}
            <div className="bg-accent-indigo/10 border-accent-indigo/20 group/bayesian relative mt-6 flex flex-col items-center justify-center overflow-hidden rounded-3xl border p-6 text-center shadow-[0_0_30px_rgba(99,102,241,0.1)]">
              <div className="from-accent-indigo/0 via-accent-indigo/10 to-accent-indigo/0 absolute inset-0 -translate-x-full bg-linear-to-r transition-transform duration-1000 group-hover/bayesian:translate-x-full" />
              <span className="text-accent-indigo-light relative z-10 mb-2 block text-[0.7rem] font-black tracking-[0.4em] uppercase">
                Posterior Win Prob (Bayesian)
              </span>
              <span className="text-accent-indigo-light relative z-10 font-mono text-3xl font-black tracking-tighter">
                {metricsContext?.apiQuantumMetrics?.bayesianWinProb?.toFixed(1) ?? '--'}%
              </span>
            </div>
          </div>

          <div className="relative z-10 mt-14 border-t border-white/5 pt-12">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <span className="text-text-darker text-[0.6rem] font-black tracking-[0.5em] uppercase">
                  Status da Mente
                </span>
                <div className="flex items-center gap-3">
                  <div className="bg-accent-indigo h-2.5 w-2.5 animate-pulse rounded-full shadow-[0_0_10px_var(--accent-indigo)]" />
                  <span className="text-accent-indigo-light text-[0.75rem] font-black tracking-[0.3em] uppercase">
                    Sincronizada (SOTA Gold)
                  </span>
                </div>
              </div>
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-800 text-[0.6rem] font-black text-slate-500 shadow-xl"
                  >
                    U{i}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Camada Inferior: Assinatura Cognitiva & Telemetria */}
      <section className="relative space-y-12">
        <div className="mb-8 flex items-center gap-10">
          <h2 className="text-glow-emerald m-0 flex items-center gap-6 text-3xl font-black tracking-tighter text-white uppercase">
            <i className="fa-solid fa-brain text-accent-emerald shadow-[0_0_20px_var(--color-accent-emerald)]" />{' '}
            Assinatura Cognitiva
          </h2>
          <div className="h-px grow bg-linear-to-r from-white/10 to-transparent" />
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.8fr]">
          <div className="glass-panel group/vulnerabilities relative overflow-hidden transition-all duration-700 hover:border-white/20">
            <div className="bg-grain pointer-events-none absolute inset-0 opacity-5 mix-blend-overlay" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05),transparent)]" />

            <div className="relative z-10 mb-12 space-y-3 text-center">
              <h3 className="text-accent-indigo group-hover/vulnerabilities:text-glow-indigo m-0 text-[0.8rem] font-black tracking-[0.4em] uppercase transition-all duration-500">
                Vulnerabilidades
              </h3>
              <p className="text-text-darker text-[0.6rem] font-black tracking-widest uppercase">
                Mapeamento de Leaks Pre-Ffg
              </p>
            </div>

            <div className="relative z-10 h-96 w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
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
                      letterSpacing: '0.15em',
                    }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Deficiência (%)"
                    dataKey="Deficiencia"
                    stroke="var(--color-accent-emerald)"
                    strokeWidth={4}
                    fill="url(#leakGradient)"
                    fillOpacity={0.4}
                    animationDuration={2500}
                  />
                  <RechartsTooltip
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

            <div className="relative z-10 mt-14 w-full space-y-8">
              <div className="flex items-center gap-4 border-b border-white/5 pb-5">
                <i className="fa-solid fa-microchip text-accent-indigo text-sm" />
                <h4 className="text-text-muted m-0 text-[0.7rem] font-black tracking-[0.3em] uppercase">
                  Top Leaks (IA Preditiva)
                </h4>
              </div>
              <div className="space-y-6 rounded-2xl border border-white/5 bg-slate-950/40 p-5 shadow-inner">
                {topLeaks.map(([name, value], idx) => (
                  <div key={name} className="group/leak flex flex-col gap-3 transition-all duration-300 hover:translate-x-1">
                    <div className="flex items-center justify-between px-2">
                      <span
                        className={`text-[0.75rem] font-black tracking-widest uppercase transition-colors ${idx === 0 ? 'text-accent-rose group-hover/leak:text-glow-rose' : 'text-text-muted group-hover/leak:text-white'}`}
                      >
                        {name}
                      </span>
                      <span className="font-mono text-[0.8rem] font-black text-white tabular-nums">
                        {(value * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/5 shadow-inner border border-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value * 100}%` }}
                        transition={{
                          duration: 1.8,
                          ease: 'easeOut',
                          delay: idx * 0.3,
                        }}
                        className={`h-full rounded-full ${idx === 0 ? 'bg-accent-rose shadow-[0_0_12px_var(--color-accent-rose)]' : 'bg-accent-indigo shadow-[0_0_12px_var(--color-accent-indigo)]'}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-panel group/telemetry relative flex flex-col overflow-hidden transition-all duration-700 hover:border-white/20">
            <div className="bg-grain pointer-events-none absolute inset-0 opacity-5 mix-blend-overlay" />
            <div className="from-accent-emerald/5 pointer-events-none absolute inset-0 bg-radial-[at_bottom_right] to-transparent opacity-60 transition-opacity duration-1000 group-hover/telemetry:opacity-100" />
            <div className="relative z-10 mb-12 flex items-center justify-between border-b border-white/5 pb-8">
              <div className="flex items-center gap-5">
                <div className="bg-accent-emerald h-2.5 w-2.5 animate-pulse rounded-full shadow-[0_0_15px_var(--color-accent-emerald)]" />
                <h3 className="group-hover/telemetry:text-glow-emerald m-0 text-[0.85rem] font-black tracking-[0.4em] text-white uppercase transition-all duration-500">
                  Curva de Performance Temporal
                </h3>
              </div>
              <i className="fa-solid fa-chart-line text-text-darker group-hover/telemetry:text-accent-emerald text-base transition-colors" />
            </div>
            <div className="relative z-10 flex min-h-125 grow flex-col justify-center">
              <TelemetryCharts data={activeTelemetry} />
            </div>
          </div>
        </div>

        {/* Painel Oráculo Local (Gemma Edge) */}
        <div className="animate-sota-in mt-16">
          <div className="mb-8 flex items-center gap-10">
            <h2 className="text-glow-indigo m-0 flex items-center gap-6 text-3xl font-black tracking-tighter text-white uppercase">
              <i className="fa-solid fa-microchip text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]" /> Motor de
              Inferência (Gemma Edge)
            </h2>
            <div className="h-px grow bg-linear-to-r from-white/10 to-transparent" />
          </div>
          <GemmaAnalysisPanel
            heroPos={spotContext?.spotData?.heroRange || 'BTN'}
            villainPos={spotContext?.spotData?.villainRange || 'BB'}
            potSize={potSize}
            heroStack={spotContext?.heroStack ?? 40}
            villainStack={spotContext?.villainStack ?? 55}
          />
        </div>
      </section>
    </div>
  );
}
