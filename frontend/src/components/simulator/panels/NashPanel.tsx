'use client';

/**
 * IDENTITY: Painel de FrequÃªncias ICM Quantum v4.6 GOLD
 * PATH: src/components/simulator/panels/NashPanel.tsx
 * ROLE: Exibe a distorÃ§Ã£o GTO atravÃ©s do Organismo SOTA com estÃ©tica high-fidelity.
 * BINDING: [engine/types.ts, components/simulator/ui/*]
 */

import { SotaMarkdown } from '@/components/ui/layout/SotaMarkdown';
import { motion } from 'framer-motion';
import { use, useState } from 'react';
import { SotaMetricsContext } from '../SotaContext';
import type { ChipEvFreqs, IcmDistortionResult, StreetChipEvFreqs } from '../engine/types';
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
  <div className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-2">
    <div className="hover:border-accent-indigo/30 group/ip flex flex-col gap-3 rounded-4xl border border-white/5 bg-slate-900/40 p-6 shadow-inner transition-all duration-500 hover:bg-slate-900/60">
      <div className="flex items-center justify-between px-1">
        <span className="text-text-darker group-hover/ip:text-accent-indigo-light text-[0.55rem] font-black tracking-[0.4em] uppercase transition-colors">
          PressÃ£o Agressor (IP)
        </span>
        <i className="fa-solid fa-bolt text-accent-indigo/20 group-hover/ip:text-accent-indigo/60 text-[0.6rem] transition-colors" />
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className={`font-mono text-3xl font-black tracking-tighter text-white tabular-nums ${current.textShadowClass}`}
        >
          {ipRp.toFixed(1)}
        </span>
        <span className="text-text-darker text-[0.65rem] font-black tracking-widest uppercase">RP %</span>
      </div>
      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, ipRp * 2.5)}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="bg-accent-indigo h-full shadow-[0_0_10px_var(--accent-indigo)]"
        />
      </div>
    </div>

    <div className="hover:border-accent-amber/30 group/oop flex flex-col gap-3 rounded-4xl border border-white/5 bg-slate-900/40 p-6 shadow-inner transition-all duration-500 hover:bg-slate-900/60 md:items-end md:text-right">
      <div className="flex w-full flex-row-reverse items-center justify-between px-1 md:flex-row">
        <i className="fa-solid fa-shield-halved text-accent-amber/20 group-hover/oop:text-accent-amber/60 text-[0.6rem] transition-colors" />
        <span className="text-text-darker group-hover/oop:text-accent-amber text-[0.55rem] font-black tracking-[0.4em] uppercase transition-colors">
          PressÃ£o Defensor (OOP)
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-accent-amber font-mono text-3xl font-black tracking-tighter tabular-nums [text-shadow:0_0_20px_rgba(245,158,11,0.2)]">
          {oopRp.toFixed(1)}
        </span>
        <span className="text-text-darker text-[0.65rem] font-black tracking-widest uppercase">RP %</span>
      </div>
      <div className="mt-1 flex h-1 w-full justify-end overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, oopRp * 2.5)}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="bg-accent-amber h-full shadow-[0_0_10px_var(--accent-amber)]"
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
    <div className="w-full space-y-6">
      <div className="text-accent-indigo-light border-accent-indigo/20 flex items-center justify-between border-b px-2 pb-5 text-[0.75rem] font-black tracking-[0.4em] uppercase">
        <div className="flex items-center gap-4">
          <div className="bg-accent-indigo h-3 w-3 rounded-full shadow-[0_0_12px_var(--accent-indigo)]" />
          IP &middot; EstratÃ©gia de AgressÃ£o
        </div>
        <i className="fa-solid fa-crosshairs text-[0.65rem] opacity-30" />
      </div>
      <div className="space-y-4 px-1">
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
    <div className="w-full space-y-6">
      <div className="text-accent-rose border-accent-rose/20 flex items-center justify-between border-b px-2 pb-5 text-[0.75rem] font-black tracking-[0.4em] uppercase">
        <div className="flex items-center gap-4">
          <div className="bg-accent-rose h-3 w-3 rounded-full shadow-[0_0_12px_var(--accent-rose)]" />
          OOP &middot; EstratÃ©gia de Defesa
        </div>
        <i className="fa-solid fa-shield text-[0.65rem] opacity-30" />
      </div>
      <div className="space-y-4 px-1">
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
  pkoValue,
  onAggressionChange,
  onPkoChange,
}: {
  aggressionFactor: number;
  pkoValue: number;
  onAggressionChange: (v: number) => void;
  onPkoChange: (v: number) => void;
}) => (
  <div className="relative z-10 grid grid-cols-1 gap-8 pt-8 lg:grid-cols-2">
    <SotaTooltip
      align="left"
      title="Agressividade Humana (Fator Î¨)"
      content="Modulador bayesiano SOTA. Se o oponente real desvia do equilÃ­brio (ex: paga demais ou blefa de menos), a distribuiÃ§Ã£o de Nash Ã© forÃ§ada a se contrair ou expandir."
      theme="indigo"
    >
      <div className="hover:border-accent-indigo/30 group/Î¨ relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-900/40 p-8 shadow-inner transition-all hover:bg-slate-900/60">
        <div className="from-accent-indigo/5 pointer-events-none absolute inset-0 bg-radial-[at_top_right] to-transparent" />
        <div className="relative z-10 mb-8 flex items-center justify-between px-1">
          <div className="space-y-1">
            <span className="text-text-muted group-hover/Î¨:text-white text-[0.7rem] font-black tracking-[0.3em] uppercase transition-colors">
              Modulador Î¨
            </span>
            <p className="text-text-darker m-0 text-[0.55rem] font-black tracking-widest uppercase">
              Agressividade Relativa
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/60 px-5 py-2 shadow-2xl">
            <span className="text-accent-emerald font-mono text-[1rem] font-black tabular-nums">
              {aggressionFactor.toFixed(1)}
              <span className="ml-1 text-[0.6rem] opacity-50">Ã—</span>
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
          className="accent-accent-indigo relative z-10 mb-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/5"
          aria-label="Fator de AgressÃ£o Humana"
        />
      </div>
    </SotaTooltip>

    <SotaTooltip
      align="right"
      title="Bounty Power"
      content="Diluidor de Risk Premium. A recompensa imediata (bounty) infla a utilidade do Call, destruindo o Teto de Risco do ICM tradicional."
      theme="indigo"
    >
      <div
        className={`hover:border-accent-amber/30 group/pko relative overflow-hidden rounded-[2.5rem] border bg-slate-900/40 p-8 shadow-inner transition-all hover:bg-slate-900/60 ${pkoValue > 0 ? 'border-accent-amber/30 shadow-emerald-500/5' : 'border-white/5'}`}
      >
        <div className="from-accent-amber/5 pointer-events-none absolute inset-0 bg-radial-[at_top_left] to-transparent" />
        <div className="relative z-10 mb-8 flex items-center justify-between px-1">
          <div className="space-y-1">
            <span className="text-text-muted text-[0.7rem] font-black tracking-[0.3em] uppercase transition-colors group-hover/pko:text-white">
              Bounty Influx
            </span>
            <p className="text-text-darker m-0 text-[0.55rem] font-black tracking-widest uppercase">
              PressÃ£o Progressiva
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/60 px-5 py-2 shadow-2xl">
            <span className="text-accent-gold font-mono text-[1rem] font-black tabular-nums">
              {pkoValue === 0 ? '0.0' : `${Math.round(pkoValue * 100)}`}
              <span className="ml-1 text-[0.6rem] opacity-50">%</span>
            </span>
          </div>
        </div>
        <input
          id="nash-pko"
          name="nash-pko"
          type="range"
          min="0"
          max="0.8"
          step="0.05"
          value={pkoValue}
          onChange={(e) => onPkoChange(Number.parseFloat(e.target.value))}
          className="accent-accent-amber relative z-10 mb-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/5"
          aria-label="ForÃ§a do PKO Bounty"
        />
      </div>
    </SotaTooltip>
  </div>
);

export default function NashPanel({
  nashFlop,
  nashTurn,
  nashRiver,
  streetFreqs,
  streetRps,
  aggressionFactor,
  pkoValue,
  isNearPayjump,
  blindsRisingSoon,
  isBaseline = false,
  onStreetFreqChange,
  onAggressionChange,
  onPkoChange,
  onPayjumpToggle,
  onBlindsToggle,
}: Readonly<NashPanelProps>) {
  const [activeStreet, setActiveStreet] = useState<'flop' | 'turn' | 'river'>('flop');

  const safeAggression =
    Number.isNaN(Number(aggressionFactor)) || aggressionFactor == null ? 1 : Number(aggressionFactor);
  const safePko = Number.isNaN(Number(pkoValue)) || pkoValue == null ? 0 : Number(pkoValue);

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

  const current = streetData[activeStreet];

  const deltaRp = isBaseline ? 0 : current.nash.deltaRp;
  const ipRp = isBaseline ? 0 : current.rps.ip;
  const oopRp = isBaseline ? 0 : current.rps.oop;

  const metricsContext = use(SotaMetricsContext);
  const predictiveProfile = metricsContext?.predictiveProfile;

  const { streamedText, isStreaming, error, generateAnalysis } = useGemmaStream();

  const handleConsultGemma = () => {
    const prompt = `> SYSTEM: Atue como Arquiteto de Teoria dos Jogos SOTA. Foco na DistorÃ§Ã£o de Nash.
> DATA: Street: ${current.label} | IP RP: ${ipRp.toFixed(1)}% | OOP RP: ${oopRp.toFixed(1)}% | AgressÃ£o (Fator Î¨): ${safeAggression.toFixed(1)} | PKO Bounty: ${safePko}
> PROFILE: ${JSON.stringify(predictiveProfile || {})}
> TASK: ForneÃ§a uma anÃ¡lise visceral (mÃ¡x 200 palavras) explicando o desvio da estratÃ©gia GTO pura. Como as pressÃµes assimÃ©tricas do ICM e a telemetria do jogador justificam essa topologia de frequÃªncias (Check/Bet/Fold)? Use formataÃ§Ã£o avanÃ§ada.`;
    generateAnalysis(prompt, 512, 'auto', undefined, predictiveProfile ?? undefined);
  };

  const displayContent =
    streamedText ||
    'Aguardando pulso neural. Inicie a varredura para extrair o raciocÃ­nio GTO subjacente Ã  distorÃ§Ã£o.';

  return (
    <div className="glass-panel bg-bg-panel/80 group/nash relative flex flex-col gap-10 overflow-hidden rounded-4xl border border-white/10 p-8 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] backdrop-blur-3xl transition-all duration-700 sm:p-10 lg:p-14">
      <div className="bg-accent-indigo/10 group-hover/nash:bg-accent-indigo/15 pointer-events-none absolute -top-32 -right-32 h-64 w-64 rounded-full blur-[120px] transition-all duration-1000" />
      <div className="bg-accent-rose/5 pointer-events-none absolute -bottom-32 -left-32 h-64 w-64 rounded-full blur-[120px]" />

      {/* Header com Status do Motor */}
      <div className="relative z-10 flex flex-col items-start justify-between gap-6 border-b border-white/5 pb-8 md:flex-row">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="bg-accent-indigo h-2 w-2 animate-pulse rounded-full shadow-[0_0_15px_var(--color-accent-indigo)]" />
            <h3 className="group-hover/nash:text-glow-indigo m-0 text-[0.75rem] font-black tracking-[0.4em] text-white uppercase transition-all duration-500">
              FrequÃªncias ICM Quantum
            </h3>
          </div>
          <p className="text-text-dim m-0 flex items-center gap-2 text-[0.6rem] leading-none font-medium tracking-[0.2em] uppercase">
            <span className="text-accent-indigo-light group-hover/nash:text-glow-indigo font-black transition-all duration-500">
              Motor SOTA v6.2.1
            </span>
            <span className="text-white opacity-20">|</span>
            <span>Organismo de Valuation</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-text-darker text-[0.5rem] font-black tracking-[0.3em] uppercase">Instabilidade Î´</span>
          <div
            className={`flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/80 px-4 py-2 font-mono text-[0.8rem] font-black whitespace-nowrap tabular-nums shadow-2xl transition-colors ${deltaRp > 0 ? 'text-accent-amber' : 'text-accent-emerald'}`}
          >
            <div
              className={`h-1 w-1 rounded-full ${deltaRp > 0 ? 'bg-accent-amber animate-pulse' : 'bg-accent-emerald'}`}
            />
            {deltaRp >= 0 ? '+' : ''}
            {deltaRp.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Toggles TÃ¡ticos */}
      <div id="quantum-controls" className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {isNearPayjump ? (
          <button
            aria-pressed="true"
            onClick={() => onPayjumpToggle(false)}
            className="group/btn bg-accent-emerald/10 border-accent-emerald/40 text-accent-emerald flex cursor-pointer items-center justify-center gap-3 rounded-2xl border px-6 py-4 text-[0.65rem] font-black tracking-[0.25em] uppercase shadow-2xl shadow-emerald-500/10 transition-all duration-500 active:scale-95"
          >
            <div className="bg-accent-emerald h-1.5 w-1.5 scale-110 rounded-full shadow-[0_0_12px_var(--accent-emerald)] transition-all duration-500" />
            Payjump Iminente
          </button>
        ) : (
          <button
            aria-pressed="false"
            onClick={() => onPayjumpToggle(true)}
            className="group/btn text-text-muted flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-white/5 bg-slate-900/40 px-6 py-4 text-[0.65rem] font-black tracking-[0.25em] uppercase shadow-2xl transition-all duration-500 hover:border-white/20 hover:bg-slate-900/60 active:scale-95"
          >
            <div className="bg-text-darker group-hover/btn:bg-text-muted h-1.5 w-1.5 rounded-full transition-all duration-500" />
            Salto de PrÃªmios
          </button>
        )}

        {blindsRisingSoon ? (
          <button
            aria-pressed="true"
            onClick={() => onBlindsToggle(false)}
            className="group/btn bg-accent-danger/10 border-accent-danger/40 text-accent-danger flex cursor-pointer items-center justify-center gap-3 rounded-2xl border px-6 py-4 text-[0.65rem] font-black tracking-[0.25em] uppercase shadow-2xl shadow-rose-500/10 transition-all duration-500 active:scale-95"
          >
            <div className="bg-accent-danger h-1.5 w-1.5 scale-110 animate-pulse rounded-full shadow-[0_0_12px_var(--accent-danger)] transition-all duration-500" />
            Blinds Subindo
          </button>
        ) : (
          <button
            aria-pressed="false"
            onClick={() => onBlindsToggle(true)}
            className="group/btn text-text-muted flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-white/5 bg-slate-900/40 px-6 py-4 text-[0.65rem] font-black tracking-[0.25em] uppercase shadow-2xl transition-all duration-500 hover:border-white/20 hover:bg-slate-900/60 active:scale-95"
          >
            <div className="bg-text-darker group-hover/btn:bg-text-muted h-1.5 w-1.5 rounded-full transition-all duration-500" />
            Custo de Ã“rbita
          </button>
        )}
      </div>

      {/* Street Selector - EstÃ©tica High-End */}
      <div className="scrollbar-hide relative z-10 flex gap-3 overflow-x-auto rounded-3xl border border-white/5 bg-slate-950/60 p-1.5 shadow-inner">
        {(['flop', 'turn', 'river'] as const).map((s) => {
          const d = streetData[s];
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
              className={`flex min-w-28 flex-1 cursor-pointer flex-col items-center gap-1.5 rounded-2xl border px-3 py-4 transition-all duration-700 ease-out ${isActive ? activeClasses : inactiveClasses}`}
            >
              <span
                className={`text-[0.7rem] font-black tracking-[0.25em] uppercase ${isActive ? 'text-white' : 'text-text-darker'}`}
              >
                {d.label}
              </span>
              <div className="flex items-center gap-1.5">
                <div className={`h-1 w-1 rounded-full ${d.bgClass}`} />
                <span
                  className={`font-mono text-[0.55rem] font-black tracking-tighter tabular-nums ${isActive ? 'text-text-muted' : 'text-text-darker'}`}
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
        pkoValue={safePko}
        onAggressionChange={onAggressionChange}
        onPkoChange={onPkoChange}
      />

      {/* ORÃCULO DE BORDA (GEMMA 4) - ANÃLISE DE DISTORÃ‡ÃƒO */}
      <div className="relative z-10 mt-6 border-t border-white/5 pt-10">
        <div className="mb-8 flex items-center justify-between">
          <h4 className="flex items-center gap-3 text-[0.8rem] font-black tracking-[0.3em] text-white uppercase">
            <i className="fa-solid fa-microchip text-accent-indigo" />
            <span>AnÃ¡lise Preditiva (Gemma Edge)</span>
          </h4>
          <button
            onClick={handleConsultGemma}
            disabled={isStreaming}
            className="bg-accent-indigo/10 hover:bg-accent-indigo/20 text-accent-indigo-light border-accent-indigo/30 flex items-center gap-2 rounded-xl border px-5 py-2.5 text-[0.65rem] font-black tracking-[0.2em] uppercase transition-all disabled:opacity-50"
          >
            {isStreaming ? (
              <span className="flex items-center gap-2">
                <i className="fa-solid fa-atom animate-spin" />
                <span>Processando...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <i className="fa-solid fa-radar" />
                <span>Injetar Telemetria</span>
              </span>
            )}
          </button>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-black/40 p-8 shadow-inner">
          <div className="bg-accent-indigo/5 pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full blur-[50px]" />
          {error && (
            <div className="text-accent-danger bg-accent-danger/10 border-accent-danger/20 mb-4 rounded-lg border p-3 text-xs">
              {error}
            </div>
          )}
          <div className="relative z-10">
            <SotaMarkdown content={displayContent} />
          </div>
        </div>
      </div>
    </div>
  );
}
