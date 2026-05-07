'use client';

/**
 * IDENTITY: Painel de Frequências ICM Quantum v4.2
 * PATH: src/components/simulator/panels/NashPanel.tsx
 * ROLE: Exibe a distorção GTO através do Organismo SOTA.
 * BINDING: [engine/types.ts, components/simulator/ui/*]
 */

import { useState } from 'react';
import type { ChipEvFreqs, IcmDistortionResult, StreetChipEvFreqs } from '../engine/types';
import { ActionRow } from '../ui/ActionRow';
import { SotaTooltip } from '../ui/SotaTooltip';

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
  onStreetFreqChange: ( street: keyof StreetChipEvFreqs, freqs: ChipEvFreqs ) => void;
  onAggressionChange: ( value: number ) => void;
  onPkoChange: ( value: number ) => void;
  onPayjumpToggle: ( value: boolean ) => void;
  onBlindsToggle: ( value: boolean ) => void;
}

export default function NashPanel ( {
  nashFlop, nashTurn, nashRiver,
  streetFreqs, streetRps,
  aggressionFactor, pkoValue,
  isNearPayjump, blindsRisingSoon,
  isBaseline = false,
  onStreetFreqChange, onAggressionChange, onPkoChange,
  onPayjumpToggle, onBlindsToggle,
}: Readonly<NashPanelProps> ) {
  const [ activeStreet, setActiveStreet ] = useState<'flop' | 'turn' | 'river'>( 'flop' );

  const streetData = {
    flop: { nash: nashFlop, freqs: streetFreqs.flop, rps: streetRps.flop, label: 'FLOP', color: 'var(--accent-indigo-light)' },
    turn: { nash: nashTurn, freqs: streetFreqs.turn, rps: streetRps.turn, label: 'TURN', color: 'var(--accent-emerald)' },
    river: { nash: nashRiver, freqs: streetFreqs.river, rps: streetRps.river, label: 'RIVER', color: 'var(--accent-danger)' },
  };

  const current = streetData[ activeStreet ];

  const deltaRp = isBaseline ? 0 : current.nash.deltaRp;
  const ipRp = isBaseline ? 0 : current.rps.ip;
  const oopRp = isBaseline ? 0 : current.rps.oop;
  const deltaRpProps = { style: { color: deltaRp > 0 ? 'var(--accent-amber)' : 'var(--accent-emerald)' } };

  return (
    <div className="glass-panel flex flex-col gap-8 p-6 sm:p-8 lg:p-10 transition-all duration-300 rounded-4xl bg-bg-panel/80 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-indigo/5 blur-3xl rounded-full pointer-events-none" />

      <div className="flex justify-between items-start border-b border-white/5 pb-6">
        <div className="max-w-[70%]">
          <h3 className="m-0 text-[0.75rem] font-black text-text-main uppercase tracking-[0.2em]">Frequências ICM Quantum</h3>
          <p className="m-0 mt-1.5 text-[0.6rem] text-text-dim font-medium">Motor SOTA v4.2 &middot; Organismo Sistêmico de Valuation.</p>
        </div>
        <span className="px-3 py-1 rounded-lg bg-slate-900/80 border border-white/10 text-[0.65rem] font-black font-mono tabular-nums whitespace-nowrap shadow-inner" {...deltaRpProps}>
          ΔRP { deltaRp >= 0 ? '+' : '' }{ deltaRp.toFixed( 1 ) }
        </span>
      </div>

      <div id="quantum-controls" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
            onClick={ () => onPayjumpToggle( !isNearPayjump ) }
            aria-pressed={isNearPayjump}
            className={`py-3 px-4 rounded-xl text-[0.6rem] font-black uppercase tracking-widest transition-all cursor-pointer border ${isNearPayjump ? 'bg-accent-emerald/10 border-accent-emerald text-accent-emerald shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-white/5 border-white/5 text-text-muted hover:bg-white/10 hover:border-white/20'}`}
        >
          { isNearPayjump ? '✓ Payjump Iminente' : 'Perto de Payjump?' }
        </button>
        <button
            onClick={ () => onBlindsToggle( !blindsRisingSoon ) }
            aria-pressed={blindsRisingSoon}
            className={`py-3 px-4 rounded-xl text-[0.6rem] font-black uppercase tracking-widest transition-all cursor-pointer border ${blindsRisingSoon ? 'bg-accent-danger/10 border-accent-danger text-accent-danger shadow-[0_0_20px_rgba(225,29,72,0.2)]' : 'bg-white/5 border-white/5 text-text-muted hover:bg-white/10 hover:border-white/20'}`}
        >
          { blindsRisingSoon ? '⚠ Blinds Subindo' : 'Salto de Blinds?' }
        </button>
      </div>

      <div className="flex gap-3">
        { ( [ 'flop', 'turn', 'river' ] as const ).map( s => {
          const d = streetData[ s ];
          const isActive = s === activeStreet;
          const btnProps = { style: {
            borderColor: isActive ? d.color : 'rgba(255,255,255,0.03)',
            color: isActive ? d.color : 'var(--text-darker)',
            boxShadow: isActive ? `0 10px 25px -10px ${d.color}` : 'none'
          } };
          const avgRp = isBaseline ? 0 : ( d.rps.ip + d.rps.oop ) / 2;
          return (
            <button
                key={ s }
                type="button"
                onClick={ () => setActiveStreet( s ) }
                className={`flex-1 flex flex-col items-center gap-1 py-3 px-1 rounded-2xl border transition-all duration-500 ease-out cursor-pointer ${isActive ? 'bg-white/5 -translate-y-1 scale-[1.02]' : 'bg-black/20 opacity-50 hover:opacity-100 hover:bg-white/5'}`}
                {...btnProps}
            >
              <span className="text-[0.65rem] font-black uppercase tracking-[0.2em]">{ d.label }</span>
              <span className="text-[0.55rem] font-bold font-mono tabular-nums opacity-90 tracking-tight">RP { avgRp.toFixed( 1 ) }%</span>
            </button>
          );
        } ) }
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
        <div className="flex flex-col gap-1">
          <span className="text-[0.55rem] text-text-darker uppercase font-black tracking-[0.2em] block">Pressão IP (Agressor)</span>
          <span className="text-xl font-black font-mono tabular-nums tracking-tighter" style={{ color: current.color } as React.CSSProperties}>{ ipRp.toFixed( 1 ) }%</span>
        </div>
        <div className="flex flex-col gap-1 sm:items-end sm:text-right">
          <span className="text-[0.55rem] text-text-darker uppercase font-black tracking-[0.2em] block">Pressão OOP (Defensor)</span>
          <span className="text-xl font-black font-mono tabular-nums tracking-tighter text-accent-amber">{ oopRp.toFixed( 1 ) }%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="w-full overflow-x-auto scrollbar-hide">
          <div className="min-w-0 space-y-2">
            <div className="text-[0.6rem] font-black text-accent-indigo-light uppercase tracking-[0.25em] px-1 pb-2 border-b border-accent-indigo/20 flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-accent-indigo" /> IP — Agressor
            </div>
            <ActionRow label="Check" chipEv={ current.freqs.ip_check } result={ current.nash.ip.check } field="ip_check" accent="var(--accent-indigo-light)" freqs={ current.freqs } onChange={ ( f ) => onStreetFreqChange( activeStreet, f ) } />
            <ActionRow label="Bet S" chipEv={ current.freqs.ip_bet_small } result={ current.nash.ip.bet_small } field="ip_bet_small" accent="var(--accent-indigo-light)" freqs={ current.freqs } onChange={ ( f ) => onStreetFreqChange( activeStreet, f ) } />
            <ActionRow label="Bet L" chipEv={ current.freqs.ip_bet_large } result={ current.nash.ip.bet_large } field="ip_bet_large" accent="var(--accent-indigo-light)" freqs={ current.freqs } onChange={ ( f ) => onStreetFreqChange( activeStreet, f ) } />
          </div>
        </div>

        <div className="w-full overflow-x-auto scrollbar-hide xl:mb-0">
          <div className="min-w-0 space-y-2">
            <div className="text-[0.6rem] font-black text-accent-danger uppercase tracking-[0.25em] px-1 pb-2 border-b border-accent-danger/20 flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-accent-danger" /> OOP — Defensor
            </div>
            <ActionRow label="Call" chipEv={ current.freqs.oop_call } result={ current.nash.oop.call } field="oop_call" accent="var(--accent-danger)" freqs={ current.freqs } onChange={ ( f ) => onStreetFreqChange( activeStreet, f ) } />
            <ActionRow label="Fold" chipEv={ current.freqs.oop_fold } result={ current.nash.oop.fold } field="oop_fold" accent="var(--accent-danger)" freqs={ current.freqs } onChange={ ( f ) => onStreetFreqChange( activeStreet, f ) } />
            <ActionRow label="Raise" chipEv={ current.freqs.oop_raise } result={ current.nash.oop.raise } field="oop_raise" accent="var(--accent-danger)" freqs={ current.freqs } onChange={ ( f ) => onStreetFreqChange( activeStreet, f ) } />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <SotaTooltip align="left" title="Agressividade Humana (Fator Ψ)" content="Modulador bayesiano SOTA. Se o oponente real desvia do equilíbrio (ex: paga demais ou blefa de menos), a distribuição de Nash é forçada a se contrair ou expandir." theme="indigo">
            <div className="bg-black/40 border border-white/5 rounded-2xl p-5 transition-all hover:border-accent-indigo/30 group shadow-inner">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[0.65rem] font-black text-text-dim uppercase tracking-[0.15em]">Fator Ψ</span>
                <span className="font-mono tabular-nums text-[0.8rem] font-black text-accent-emerald bg-black/60 px-2 py-1 rounded-lg border border-white/10">{ aggressionFactor.toFixed( 1 ) }×</span>
              </div>
              <input id="nash-aggression" name="nash-aggression" type="range" min="0.5" max="1.5" step="0.1" value={ aggressionFactor } onChange={ ( e ) => onAggressionChange( Number.parseFloat( e.target.value ) ) } className="w-full accent-accent-indigo h-1 bg-white/5 rounded-full appearance-none cursor-pointer" aria-label="Fator de Agressão Humana" />
            </div>
          </SotaTooltip>

          <SotaTooltip align="right" title="Bounty Power" content="Diluidor de Risk Premium. A recompensa imediata (bounty) infla a utilidade do Call, destruindo o Teto de Risco do ICM tradicional." theme="indigo">
            <div className={`bg-black/40 border rounded-2xl p-5 transition-all hover:border-accent-amber/30 group shadow-inner ${pkoValue > 0 ? 'border-accent-amber/30 shadow-lg shadow-accent-amber/5' : 'border-white/5'}`}>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[0.65rem] font-black text-text-dim uppercase tracking-[0.15em]">PKO Power</span>
                <span className="font-mono tabular-nums text-[0.8rem] font-black text-accent-gold bg-black/60 px-2 py-1 rounded-lg border border-white/10">{ pkoValue === 0 ? 'OFF' : `${Math.round( pkoValue * 100 )}%` }</span>
              </div>
              <input id="nash-pko" name="nash-pko" type="range" min="0" max="0.8" step="0.05" value={ pkoValue } onChange={ ( e ) => onPkoChange( Number.parseFloat( e.target.value ) ) } className="w-full accent-accent-amber h-1 bg-white/5 rounded-full appearance-none cursor-pointer" aria-label="Força do PKO Bounty" />
            </div>
          </SotaTooltip>
      </div>

    </div>
  );
}
