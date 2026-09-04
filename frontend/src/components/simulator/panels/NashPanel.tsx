'use client';

/**
 * IDENTITY: Painel de Frequências ICM Quantum v7.0 GOLD
 * PATH: src/components/simulator/panels/NashPanel.tsx
 * ROLE: Exibe a distorção GTO através do Organismo SOTA com estética high-fidelity.
 * BINDING: [engine/types.ts, components/simulator/ui/*]
 */

import { SotaMarkdown } from '@/components/ui/layout/SotaMarkdown';
import { motion } from 'framer-motion';
import { use, useState } from 'react';
import { SotaMetricsContext } from '../SotaContext';
import type { ChipEvFreqs, IcmDistortionResult, StreetChipEvFreqs } from '../solver/types';
import { ActionRow } from '../ui/ActionRow';
import { SotaTooltip } from '../ui/SotaTooltip';
import { useGemmaStream } from '../useGemmaStream';

interface NashPanelProps {
  nashFlop: IcmDistortionResult;
  nashTurn: IcmDistortionResult;
  nashRiver: IcmDistortionResult;
  streetFreqs: StreetChipEvFreqs;
  streetRps: {
    flop: { ip: number; oop: number };
    turn: { ip: number; oop: number };
    river: { ip: number; oop: number };
  };
  aggressionFactor: number;
  pkoValue: number;
  isNearPayjump: boolean;
  blindsRisingSoon: boolean;
  isBaseline?: boolean;
  onStreetFreqChange: (street: keyof StreetChipEvFreqs, freqs: ChipEvFreqs) => void;
  onAggressionChange: (value: number) => void;
  onPkoChange: (value: number) => void;
  onPayjumpToggle: (value: boolean) => void;
  onBlindsToggle: (value: boolean) => void;
}

interface StreetInfo {
  nash: IcmDistortionResult;
  freqs: ChipEvFreqs;
  rps: { ip: number; oop: number };
  label: string;
  color: string;
  bgClass: string;
  shadowClass: string;
  textShadowClass: string;
}

const StreetDashboards = ({ ipRp, oopRp, current }: { ipRp: number; oopRp: number; current: StreetInfo }) => (
  <div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-2">
    <div className="hover:border-accent-indigo/40 group/ip flex flex-col gap-4 rounded-4xl border border-white/5 bg-slate-900/40 p-8 shadow-inner transition-all duration-500 hover:bg-slate-900/60">
      <div className="flex items-center justify-between px-1">
        <span className="text-text-darker group-hover/ip:text-accent-indigo-light text-[0.6rem] font-black tracking-[0.4em] uppercase transition-colors">
          Pressão Agressor (IP)
        </span>
        <i className="fa-solid fa-bolt text-accent-indigo/20 group-hover/ip:text-accent-indigo/60 text-[0.7rem] transition-colors" />
      </div>
      <div className="flex items-baseline gap-3">
        <span
          className={`font-mono text-4xl font-black tracking-tighter text-white tabular-nums ${current.textShadowClass}`}
        >
          {ipRp.toFixed(1)}
        </span>
        <span className="text-text-darker text-[0.7rem] font-black tracking-widest uppercase">{LABELS.rpPct}</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, ipRp * 2.5)}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="bg-accent-indigo h-full shadow-[0_0_15px_var(--accent-indigo)]"
        />
      </div>
    </div>

    <div className="hover:border-accent-amber/40 group/oop flex flex-col gap-4 rounded-4xl border border-white/5 bg-slate-900/40 p-8 shadow-inner transition-all duration-500 hover:bg-slate-900/60 md:items-end md:text-right">
      <div className="flex w-full flex-row-reverse items-center justify-between px-1 md:flex-row">
        <i className="fa-solid fa-shield-halved text-accent-amber/20 group-hover/oop:text-accent-amber/60 text-[0.7rem] transition-colors" />
        <span className="text-text-darker group-hover/oop:text-accent-amber text-[0.6rem] font-black tracking-[0.4em] uppercase transition-colors">
          Pressão Defensor (OOP)
        </span>
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-accent-amber font-mono text-4xl font-black tracking-tighter tabular-nums [text-shadow:0_0_25px_rgba(245,158,11,0.3)]">
          {oopRp.toFixed(1)}
        </span>
        <span className="text-text-darker text-[0.7rem] font-black tracking-widest uppercase">{LABELS.rpPct}</span>
      </div>
      <div className="mt-2 flex h-1.5 w-full justify-end overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, oopRp * 2.5)}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="bg-accent-amber h-full shadow-[0_0_15px_var(--accent-amber)]"
        />
      </div>
    </div>
  </div>
);

const ActionStrategies = ({
  current,
  activeStreet,
  onStreetFreqChange,
}: {
  current: StreetInfo;
  activeStreet: keyof StreetChipEvFreqs;
  onStreetFreqChange: (s: keyof StreetChipEvFreqs, f: ChipEvFreqs) => void;
}) => (
  <div className="relative z-10 grid grid-cols-1 gap-16 xl:grid-cols-2">
    <div className="w-full space-y-8">
      <div className="text-accent-indigo-light border-accent-indigo/20 flex items-center justify-between border-b px-2 pb-6 text-[0.85rem] font-black tracking-[0.4em] uppercase">
        <div className="flex items-center gap-5">
          <div className="bg-accent-indigo h-3.5 w-3.5 rounded-full shadow-[0_0_15px_var(--accent-indigo)]" />
          IP &middot; Estratégia de Agressão
        </div>
        <i className="fa-solid fa-crosshairs text-[0.8rem] opacity-30" />
      </div>
      <div className="space-y-5 px-1">
        <ActionRow
          label="Check"
          chipEv={current.freqs.ip_check}
          result={current.nash.ip.check}
          field="ip_check"
          accent="var(--color-accent-indigo-light)"
          freqs={current.freqs}
          onChange={(f) => onStreetFreqChange(activeStreet, f)}
        />
        <ActionRow
          label="Bet S"
          chipEv={current.freqs.ip_bet_small}
          result={current.nash.ip.bet_small}
          field="ip_bet_small"
          accent="var(--color-accent-indigo-light)"
          freqs={current.freqs}
          onChange={(f) => onStreetFreqChange(activeStreet, f)}
        />
        <ActionRow
          label="Bet L"
          chipEv={current.freqs.ip_bet_large}
          result={current.nash.ip.bet_large}
          field="ip_bet_large"
          accent="var(--color-accent-indigo-light)"
          freqs={current.freqs}
          onChange={(f) => onStreetFreqChange(activeStreet, f)}
        />
      </div>
    </div>
    <div className="w-full space-y-8">
      <div className="text-accent-rose border-accent-rose/20 flex items-center justify-between border-b px-2 pb-6 text-[0.85rem] font-black tracking-[0.4em] uppercase">
        <div className="flex items-center gap-5">
          <div className="bg-accent-rose h-3.5 w-3.5 rounded-full shadow-[0_0_15px_var(--accent-rose)]" />
          OOP &middot; Estratégia de Defesa
        </div>
        <i className="fa-solid fa-shield text-[0.8rem] opacity-30" />
      </div>
      <div className="space-y-5 px-1">
        <ActionRow
          label="Call"
          chipEv={current.freqs.oop_call}
          result={current.nash.oop.call}
          field="oop_call"
          accent="var(--color-accent-rose)"
          freqs={current.freqs}
          onChange={(f) => onStreetFreqChange(activeStreet, f)}
        />
        <ActionRow
          label="Fold"
          chipEv={current.freqs.oop_fold}
          result={current.nash.oop.fold}
          field="oop_fold"
          accent="var(--color-accent-rose)"
          freqs={current.freqs}
          onChange={(f) => onStreetFreqChange(activeStreet, f)}
        />
        <ActionRow
          label="Raise"
          chipEv={current.freqs.oop_raise}
          result={current.nash.oop.raise}
          field="oop_raise"
          accent="var(--color-accent-rose)"
          freqs={current.freqs}
          onChange={(f) => onStreetFreqChange(activeStreet, f)}
        />
      </div>
    </div>
  </div>
);

const EntropyModulators = ({
  aggressionFactor,
  onAggressionChange,
}: {
  aggressionFactor: number;
  onAggressionChange: (v: number) => void;
}) => (
  <div className="relative z-10 grid grid-cols-1 gap-10 pt-10">
    <SotaTooltip
      align="left"
      title="Agressividade Humana (Fator Ψ)"
      content="Modulador bayesiano SOTA. Se o oponente real desvia do equilíbrio (ex: paga demais ou blefa de menos), a distribuição de Nash é forçada a se contrair ou expandir."
      theme="indigo"
      fullWidth
    >
      <div className="hover:border-accent-indigo/40 group/psi relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-900/40 p-10 shadow-inner transition-all hover:bg-slate-900/60">
        <div className="from-accent-indigo/5 pointer-events-none absolute inset-0 bg-radial-[at_top_right] to-transparent" />
        <div className="relative z-10 mb-10 flex items-center justify-between px-1">
          <div className="space-y-2">
            <span className="text-text-muted group-hover/psi:text-white text-[0.75rem] font-black tracking-[0.3em] uppercase transition-colors">
              Modulador Ψ
            </span>
            <p className="text-text-darker m-0 text-[0.6rem] font-black tracking-widest uppercase">
              Agressividade Relativa
            </p>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/60 px-6 py-3 shadow-2xl">
            <span className="text-accent-emerald font-mono text-[1.1rem] font-black tabular-nums">
              {aggressionFactor.toFixed(1)}
              <span className="ml-1 text-[0.7rem] opacity-50">×</span>
            </span>
          </div>
        </div>
        <input
          id="nash-aggression"
          name="nash-aggression"
          type="range"
          min="0.5"
          max="1.5"
          step="0.1"
          value={aggressionFactor}
          onChange={(e) => onAggressionChange(Number.parseFloat(e.target.value))}
          className="accent-accent-indigo relative z-10 mb-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/5"
          aria-label="Fator de Agressão Humana"
        />
      </div>
    </SotaTooltip>
  </div>
);

const LABELS = {
  rpPct: 'RP %',
  valuationOrganism: 'Organismo de Valuation',
  processing: 'Processando...',
  injectTelemetry: 'Injetar Telemetria',
} as const;

export default function NashPanel({
  nashFlop,
  nashTurn,
  nashRiver,
  streetFreqs,
  streetRps,
  aggressionFactor,
  pkoValue: _pkoValue,
  isNearPayjump,
  blindsRisingSoon,
  isBaseline = false,
  onStreetFreqChange,
  onAggressionChange,
  onPkoChange: _onPkoChange,
  onPayjumpToggle,
  onBlindsToggle,
}: Readonly<NashPanelProps>) {
  const [activeStreet, setActiveStreet] = useState<'flop' | 'turn' | 'river'>('flop');

  const safeAggression =
    Number.isNaN(Number(aggressionFactor)) || aggressionFactor == null ? 1 : Number(aggressionFactor);

  const streetData = {
    flop: {
      nash: nashFlop,
      freqs: streetFreqs.flop,
      rps: streetRps.flop,
      label: 'FLOP',
      color: 'var(--color-accent-indigo-light)',
      bgClass: 'bg-accent-indigo-light',
      shadowClass: 'shadow-[0_15px_30px_-10px_rgba(99,102,241,0.2)]',
      textShadowClass: '[text-shadow:0_0_20px_rgba(99,102,241,0.4)]',
    },
    turn: {
      nash: nashTurn,
      freqs: streetFreqs.turn,
      rps: streetRps.turn,
      label: 'TURN',
      color: 'var(--color-accent-emerald)',
      bgClass: 'bg-accent-emerald',
      shadowClass: 'shadow-[0_15px_30px_-10px_rgba(16,185,129,0.2)]',
      textShadowClass: '[text-shadow:0_0_20px_rgba(16,185,129,0.4)]',
    },
    river: {
      nash: nashRiver,
      freqs: streetFreqs.river,
      rps: streetRps.river,
      label: 'RIVER',
      color: 'var(--color-accent-danger)',
      bgClass: 'bg-accent-danger',
      shadowClass: 'shadow-[0_15px_30px_-10px_rgba(244,63,94,0.2)]',
      textShadowClass: '[text-shadow:0_0_20px_rgba(244,63,94,0.4)]',
    },
  };

  const getStreetConfig = (s: 'flop' | 'turn' | 'river') => {
    if (s === 'turn') return streetData.turn;
    if (s === 'river') return streetData.river;
    return streetData.flop;
  };

  const current = getStreetConfig(activeStreet);

  const deltaRp = isBaseline ? 0 : current.nash.deltaRp;
  const ipRp = isBaseline ? 0 : current.rps.ip;
  const oopRp = isBaseline ? 0 : current.rps.oop;

  const metricsContext = use(SotaMetricsContext);
  const predictiveProfile = metricsContext?.predictiveProfile;

  const { streamedText, isStreaming, error, generateAnalysis } = useGemmaStream();

  const handleConsultGemma = () => {
    const riskAdv = metricsContext?.apiQuantumMetrics?.riskAdvantage ?? 0;
    const prompt = `> SYSTEM: Atue como Arquiteto de Teoria dos Jogos SOTA v7.0 GOLD. Foco na Distorção de Nash e Antevisão Estratégica.
> DATA: Street: ${current.label} | IP RP: ${ipRp.toFixed(1)}% | OOP RP: ${oopRp.toFixed(1)}% | Risk Advantage: ${riskAdv.toFixed(1)}% | Agressão (Psi): ${safeAggression.toFixed(1)}
> PROFILE: ${JSON.stringify(predictiveProfile || {})}
> TASK: Forneça uma análise visceral (máx 200 palavras) explicando o desvio da estratégia GTO pura. Como o Risk Advantage justifica essa topologia de frequências?`;
    generateAnalysis(prompt, 512, 'auto', undefined, predictiveProfile ?? undefined);
  };

  const displayContent =
    streamedText ||
    'Aguardando pulso neural. Inicie a varredura para extrair o raciocínio GTO subjacente à distorção.';

  return (
    <div className="glass-panel bg-bg-panel/80 group/nash animate-sota-in relative flex flex-col gap-12 overflow-hidden rounded-4xl border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] backdrop-blur-3xl transition-all duration-700">
      <div className="bg-accent-indigo/10 group-hover/nash:bg-accent-indigo/15 pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full blur-[140px] transition-all duration-1000" />
      <div className="bg-accent-rose/5 pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full blur-[140px]" />

      {/* Header com Status do Motor */}
      <div className="relative z-10 flex flex-col items-start justify-between gap-8 border-b border-white/5 pb-10 md:flex-row">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="bg-accent-indigo h-2.5 w-2.5 animate-pulse rounded-full shadow-[0_0_20px_var(--color-accent-indigo)]" />
            <h3 className="group-hover/nash:text-glow-indigo m-0 text-[0.85rem] font-black tracking-[0.4em] text-white uppercase transition-all duration-500">
              Frequências ICM Quantum
            </h3>
          </div>
          <p className="text-text-dim m-0 flex items-center gap-3 text-[0.7rem] leading-none font-medium tracking-[0.3em] uppercase">
            <span className="text-accent-indigo-light group-hover/nash:text-glow-indigo font-black transition-all duration-500">
              Motor SOTA v7.0 GOLD
            </span>
            <span className="text-white opacity-20">|</span>
            <span>{LABELS.valuationOrganism}</span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-text-darker text-[0.55rem] font-black tracking-[0.3em] uppercase">
              Instabilidade &delta;
            </span>
            <span className="font-mono text-base font-black text-white">{deltaRp.toFixed(1)}%</span>
          </div>
          <div className="h-8 w-px bg-white/5" />
          <div className="flex flex-col items-end">
            <span className="text-text-darker text-[0.55rem] font-black tracking-[0.3em] uppercase">
              Agressividade (&Psi;)
            </span>
            <span className="font-mono text-base font-black text-white">{safeAggression.toFixed(1)}x</span>
          </div>
        </div>
      </div>

      {/* Toggles Táticos */}
      <div id="quantum-controls" className="relative z-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {isNearPayjump ? (
          <button
            type="button"
            aria-pressed="true"
            onClick={() => onPayjumpToggle(false)}
            className="group/btn bg-accent-emerald/10 border-accent-emerald/40 text-accent-emerald flex cursor-pointer items-center justify-center gap-4 rounded-2xl border px-8 py-5 text-[0.75rem] font-black tracking-[0.3em] uppercase shadow-2xl shadow-emerald-500/10 transition-all duration-500 active:scale-95"
          >
            <div className="bg-accent-emerald h-2 w-2 scale-110 rounded-full shadow-[0_0_15px_var(--accent-emerald)] transition-all duration-500" />
            Payjump Iminente
          </button>
        ) : (
          <button
            type="button"
            aria-pressed="false"
            onClick={() => onPayjumpToggle(true)}
            className="group/btn text-text-muted flex cursor-pointer items-center justify-center gap-4 rounded-2xl border border-white/5 bg-slate-900/40 px-8 py-5 text-[0.75rem] font-black tracking-[0.3em] uppercase shadow-2xl transition-all duration-500 hover:border-white/20 hover:bg-slate-900/60 active:scale-95"
          >
            <div className="bg-text-darker group-hover/btn:bg-text-muted h-2 w-2 rounded-full transition-all duration-500" />
            Salto de Prêmios
          </button>
        )}

        {blindsRisingSoon ? (
          <button
            type="button"
            aria-pressed="true"
            onClick={() => onBlindsToggle(false)}
            className="group/btn bg-accent-danger/10 border-accent-danger/40 text-accent-danger flex cursor-pointer items-center justify-center gap-4 rounded-2xl border px-8 py-5 text-[0.75rem] font-black tracking-[0.3em] uppercase shadow-2xl shadow-rose-500/10 transition-all duration-500 active:scale-95"
          >
            <div className="bg-accent-danger h-2 w-2 scale-110 animate-pulse rounded-full shadow-[0_0_15px_var(--accent-danger)] transition-all duration-500" />
            Blinds Subindo
          </button>
        ) : (
          <button
            type="button"
            aria-pressed="false"
            onClick={() => onBlindsToggle(true)}
            className="group/btn text-text-muted flex cursor-pointer items-center justify-center gap-4 rounded-2xl border border-white/5 bg-slate-900/40 px-8 py-5 text-[0.75rem] font-black tracking-[0.3em] uppercase shadow-2xl transition-all duration-500 hover:border-white/20 hover:bg-slate-900/60 active:scale-95"
          >
            <div className="bg-text-darker group-hover/btn:bg-text-muted h-2 w-2 rounded-full transition-all duration-500" />
            Custo de Órbita
          </button>
        )}
      </div>

      {/* Street Selector - Estética High-End */}
      <div className="scrollbar-hide relative z-10 flex gap-4 overflow-x-auto rounded-3xl border border-white/5 bg-slate-950/60 p-2 shadow-inner">
        {(['flop', 'turn', 'river'] as const).map((s) => {
          const d = getStreetConfig(s);
          const isActive = s === activeStreet;
          const avgRp = isBaseline ? 0 : (d.rps.ip + d.rps.oop) / 2;
          const activeClasses = `bg-slate-900/90 border-white/10 -translate-y-1 scale-[1.02] ${d.shadowClass}`;
          const inactiveClasses =
            'bg-transparent border-transparent text-text-darker opacity-40 hover:opacity-100 hover:text-text-muted';

          return (
            <button
              key={s}
              type="button"
              onClick={() => setActiveStreet(s)}
              className={`flex min-w-32 flex-1 cursor-pointer flex-col items-center gap-2 rounded-2xl border px-4 py-5 transition-all duration-700 ease-out ${isActive ? activeClasses : inactiveClasses}`}
            >
              <span
                className={`text-[0.8rem] font-black tracking-[0.3em] uppercase ${isActive ? 'text-white' : 'text-text-darker'}`}
              >
                {d.label}
              </span>
              <div className="flex items-center gap-2">
                <div className={`h-1.5 w-1.5 rounded-full ${d.bgClass}`} />
                <span
                  className={`font-mono text-[0.65rem] font-black tracking-tighter tabular-nums ${isActive ? 'text-text-muted' : 'text-text-darker'}`}
                >
                  RP {avgRp.toFixed(1)}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <StreetDashboards ipRp={ipRp} oopRp={oopRp} current={current} />
      <ActionStrategies current={current} activeStreet={activeStreet} onStreetFreqChange={onStreetFreqChange} />
      <EntropyModulators
        aggressionFactor={safeAggression}
        onAggressionChange={onAggressionChange}
      />

      {/* ORÁCULO DE BORDA (GEMMA 4) - ANÁLISE DE DISTORÇÃO */}
      <div className="relative z-10 mt-10 border-t border-white/5 pt-12">
        <div className="mb-10 flex items-center justify-between">
          <h4 className="flex items-center gap-4 text-[0.9rem] font-black tracking-[0.4em] text-white uppercase">
            <i className="fa-solid fa-microchip text-accent-indigo" />
            <span>Análise Preditiva (Gemma Edge)</span>
          </h4>
          <button
            type="button"
            onClick={handleConsultGemma}
            disabled={isStreaming}
            className="bg-accent-indigo/10 hover:bg-accent-indigo/20 text-accent-indigo-light border-accent-indigo/30 flex items-center gap-3 rounded-xl border px-6 py-3 text-[0.7rem] font-black tracking-[0.3em] uppercase transition-all disabled:opacity-50"
          >
            {isStreaming ? (
              <span className="flex items-center gap-3">
                <i className="fa-solid fa-atom animate-spin" />
                <span>{LABELS.processing}</span>
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <i className="fa-solid fa-radar" />
                <span>{LABELS.injectTelemetry}</span>
              </span>
            )}
          </button>
        </div>

        <div className="relative overflow-hidden rounded-4xl border border-white/5 bg-black/40 p-10 shadow-inner">
          <div className="bg-accent-indigo/5 pointer-events-none absolute top-0 right-0 h-48 w-48 rounded-full blur-[80px]" />
          {error && (
            <div className="text-accent-danger bg-accent-danger/10 border-accent-danger/20 mb-6 rounded-xl border p-4 text-xs">
              {error}
            </div>
          )}
          <div className="relative z-10 text-[1rem] leading-relaxed">
            <SotaMarkdown content={displayContent} />
          </div>
        </div>
      </div>
    </div>
  );
}
