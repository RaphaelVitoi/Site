'use client';

/**
 * IDENTITY: Painel de Frequências ICM Quantum (v4.1)
 * PATH: src/components/simulator/panels/NashPanel.tsx
 * ROLE: Exibe a distorção GTO através do Organismo SOTA.
 *       As abas de street mostram a Pressão de Fold (RP) dinâmica.
 */

import { useState } from 'react';
import type { ChipEvFreqs, FreqResult, IcmDistortionResult, StreetChipEvFreqs } from '../engine/types';
import AnimatedNumber from '../ui/AnimatedNumber';
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

function InfoTooltip ( { text }: Readonly<{ text: string }> ) {
  const iconProps = { style: { fontSize: '0.62rem', color: 'var(--text-darker)', lineHeight: 1 } };
  return (
    <div className="relative group inline-flex items-center ml-1 cursor-help">
      <span {...iconProps}>ⓘ</span>
      <div className="absolute bottom-full -left-4 sm:left-1/2 sm:-translate-x-1/2 mb-2 w-48 sm:w-64 max-w-[85vw] p-2 sm:p-3 bg-bg-deep border border-indigo-500/30 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-100 pointer-events-none text-[0.65rem] text-text-light leading-relaxed font-sans normal-case tracking-normal text-left">
        { text }
      </div>
    </div>
  );
}

function fmt ( delta: number ): string {
  const v = delta.toFixed( 0 );
  return delta >= 0 ? `+${v}` : `${v}`;
}

function deltaColor ( delta: number ): string {
  if ( delta > 1 ) return 'var(--accent-emerald)';
  if ( delta < -1 ) return 'var(--accent-danger)';
  return 'var(--text-darker)';
}

function FreqInput ( {
  value,
  field,
  freqs,
  onChange,
}: Readonly<{
  value: number;
  field: keyof ChipEvFreqs;
  freqs: ChipEvFreqs;
  onChange: ( freqs: ChipEvFreqs ) => void;
}> ) {
  return (
    <div className="flex items-center gap-1">
      <input
        id={ `nash-freq-${String( field )}` }
        name={ `nash-freq-${String( field )}` }
        type="number"
        min="0"
        max="100"
        step="1"
        value={ value }
        onChange={ ( e ) => onChange( { ...freqs, [ field ]: Math.max( 0, Math.min( 100, Number( e.target.value ) || 0 ) ) } ) }
        className="w-14 py-1 px-1.5 rounded bg-white/5 border border-white/10 text-text-muted text-[0.7rem] font-bold font-mono tabular-nums text-right outline-none focus:border-accent-indigo/50 transition-colors"
      />
      <span className="text-[0.6rem] text-text-darker">%</span>
    </div>
  );
}

function ActionRow ( {
  label,
  labelTooltip,
  chipEv,
  result,
  field,
  accent,
  freqs,
  onChange,
}: Readonly<{
  label: string;
  labelTooltip?: string;
  chipEv: number;
  result: FreqResult;
  field: keyof ChipEvFreqs;
  accent: string;
  freqs: ChipEvFreqs;
  onChange: ( freqs: ChipEvFreqs ) => void;
}> ) {
  const labelProps = { style: { color: accent } };
  const deltaProps = { style: { color: deltaColor( result.delta ) } };
  const barProps = { style: {
      transform: `translateX(${result.delta >= 0 ? 50 : Math.max( 0, 50 - Math.abs( result.delta ) )}%) scaleX(${Math.min( 50, Math.abs( result.delta ) ) / 100})`,
      background: deltaColor( result.delta )
  } };
  return (
    <div className="grid grid-cols-[65px_75px_20px_1fr_65px] items-center gap-2 py-1.5 border-b border-white/5 last:border-none">
      <span className="text-[0.6rem] font-black uppercase tracking-tighter flex items-center gap-1" {...labelProps}>
        { label } { labelTooltip && <InfoTooltip text={ labelTooltip } /> }
      </span>
      <FreqInput value={ chipEv } field={ field } freqs={ freqs } onChange={ onChange } />
      <span className="text-[0.6rem] text-text-darker text-center">→</span>
      <div className="flex items-baseline gap-1.5 overflow-hidden">
        <span className="text-[0.9rem] font-black font-mono tabular-nums text-text-main shrink-0">
          <AnimatedNumber value={ result.center } suffix="%" />
        </span>
        <span className="text-[0.55rem] text-text-darker font-mono tabular-nums">±{ result.spread.toFixed( 0 ) }</span>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-[0.6rem] font-bold font-mono tabular-nums" {...deltaProps}>{ fmt( result.delta ) }</span>
        <div className="w-full h-1 bg-black/30 rounded-full relative overflow-hidden">
          <div
            className="absolute top-0 bottom-0 w-full transition-transform duration-500 origin-left"
            {...barProps}
          />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10" />
        </div>
      </div>
    </div>
  );
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
    <div className="glass-panel flex flex-col gap-4 p-5 sm:p-6 transition-all duration-300">

      {/* Header Didático */ }
      <div className="flex justify-between items-start">
        <div className="max-w-[70%]">
          <h3 className="m-0 text-[0.68rem] font-black text-text-main uppercase tracking-[0.15em]">Frequências ICM Quantum</h3>
          <p className="m-0 mt-1 text-[0.6rem] text-text-dim truncate">Motor SOTA v4.1 &middot; Organismo Sistêmico.</p>
        </div>
      <span className="px-2 py-0.5 rounded bg-slate-900/60 border border-white/10 text-[0.6rem] font-black font-mono tabular-nums whitespace-nowrap" {...deltaRpProps}>
          ΔRP { deltaRp >= 0 ? '+' : '' }{ deltaRp.toFixed( 1 ) }
        </span>
      </div>

      {/* Controles do Piso Dinâmico */ }
      <div id="quantum-controls" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
            onClick={ () => onPayjumpToggle( !isNearPayjump ) }
            className={`py-2 px-3 rounded-lg text-[0.55rem] font-black uppercase transition-all cursor-pointer border ${isNearPayjump ? 'bg-accent-emerald/10 border-accent-emerald text-accent-emerald shadow-lg shadow-accent-emerald/10' : 'bg-white/20 border-white/10 text-text-dim hover:bg-white/30'}`}
        >
          { isNearPayjump ? '✓ Payjump Iminente' : 'Perto de Payjump?' }
        </button>
        <button
            onClick={ () => onBlindsToggle( !blindsRisingSoon ) }
            className={`py-2 px-3 rounded-lg text-[0.55rem] font-black uppercase transition-all cursor-pointer border ${blindsRisingSoon ? 'bg-accent-danger/10 border-accent-danger text-accent-danger shadow-lg shadow-accent-danger/10' : 'bg-white/20 border-white/10 text-text-dim hover:bg-white/30'}`}
        >
          { blindsRisingSoon ? '⚠ Blinds Subindo' : 'Salto de Blinds?' }
        </button>
      </div>

      {/* Seletor de Street (Organismo) */ }
      <div className="flex gap-2 mb-1">
        { ( [ 'flop', 'turn', 'river' ] as const ).map( s => {
          const d = streetData[ s ];
          const isActive = s === activeStreet;
          const btnProps = { style: { borderColor: isActive ? d.color : undefined, color: isActive ? d.color : 'var(--text-darker)' } };
          const avgRp = isBaseline ? 0 : ( d.rps.ip + d.rps.oop ) / 2;
          return (
            <button
                key={ s }
                type="button"
                onClick={ () => setActiveStreet( s ) }
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl border transition-all cursor-pointer ${isActive ? 'bg-white/5 shadow-inner' : 'bg-transparent border-white/5 opacity-50 hover:opacity-80'}`}
                {...btnProps}
            >
              <span className="text-[0.6rem] font-black uppercase tracking-widest">{ d.label }</span>
              <span className="text-[0.5rem] font-bold font-mono tabular-nums opacity-80">RP { avgRp.toFixed( 1 ) }%</span>
            </button>
          );
        } ) }
      </div>

      {/* Grid de Pressão Semântica */ }
      <div style={{ display: 'none' }} />{/* Ponto de montagem SOTA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white/5 rounded-xl border border-white/5 mb-1">
        <div>
          <span className="text-[0.5rem] text-text-darker uppercase font-black tracking-widest block mb-0.5">Pressão IP (Agressor)</span>
          <span className="text-[0.85rem] font-black font-mono tabular-nums" style={{ color: current.color } as React.CSSProperties}>{ ipRp.toFixed( 1 ) }%</span>
        </div>
        <div>
          <span className="text-[0.5rem] text-text-darker uppercase font-black tracking-widest block mb-0.5">Pressão OOP (Defensor)</span>
          <span className="text-[0.85rem] font-black font-mono tabular-nums text-accent-amber">{ oopRp.toFixed( 1 ) }%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-6 gap-y-2">
        {/* Ações IP */ }
        <div className="w-full overflow-x-auto scrollbar-hide pb-2">
          <div className="min-w-[320px] space-y-1">
            <div className="text-[0.6rem] font-black text-accent-indigo-light uppercase tracking-widest px-1 pb-0.5 border-b border-accent-indigo/10">IP — Agressor</div>
            <ActionRow label="Check" chipEv={ current.freqs.ip_check } result={ current.nash.ip.check } field="ip_check" accent="var(--accent-indigo-light)" freqs={ current.freqs } onChange={ ( f ) => onStreetFreqChange( activeStreet, f ) } />
            <ActionRow label="Bet S" chipEv={ current.freqs.ip_bet_small } result={ current.nash.ip.bet_small } field="ip_bet_small" accent="var(--accent-indigo-light)" freqs={ current.freqs } onChange={ ( f ) => onStreetFreqChange( activeStreet, f ) } />
            <ActionRow label="Bet L" chipEv={ current.freqs.ip_bet_large } result={ current.nash.ip.bet_large } field="ip_bet_large" accent="var(--accent-indigo-light)" freqs={ current.freqs } onChange={ ( f ) => onStreetFreqChange( activeStreet, f ) } />
          </div>
        </div>

        {/* Ações OOP */ }
        <div className="w-full overflow-x-auto scrollbar-hide pb-2 xl:mb-0 mb-2">
          <div className="min-w-[320px] space-y-1">
            <div className="text-[0.6rem] font-black text-accent-danger uppercase tracking-widest px-1 pb-0.5 border-b border-accent-danger/10">OOP — Defensor</div>
            <ActionRow label="Call" chipEv={ current.freqs.oop_call } result={ current.nash.oop.call } field="oop_call" accent="var(--accent-danger)" freqs={ current.freqs } onChange={ ( f ) => onStreetFreqChange( activeStreet, f ) } />
            <ActionRow label="Fold" chipEv={ current.freqs.oop_fold } result={ current.nash.oop.fold } field="oop_fold" accent="var(--accent-danger)" freqs={ current.freqs } onChange={ ( f ) => onStreetFreqChange( activeStreet, f ) } />
            <ActionRow label="Raise" chipEv={ current.freqs.oop_raise } result={ current.nash.oop.raise } field="oop_raise" accent="var(--accent-danger)" freqs={ current.freqs } onChange={ ( f ) => onStreetFreqChange( activeStreet, f ) } />
          </div>
        </div>
      </div>

      {/* Moduladores Baseados em Faixas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Aggression Factor */ }
          <SotaTooltip align="left" title="Agressividade Humana (Fator Ψ)" content="Modulador bayesiano SOTA. Se o oponente real desvia do equilíbrio (ex: paga demais ou blefa de menos), a distribuição de Nash é forçada a se contrair ou expandir." theme="indigo">
            <div className="bg-black/20 border border-white/5 rounded-xl p-4 transition-all hover:border-accent-indigo/30 group">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[0.6rem] font-black text-text-dim uppercase tracking-widest">Fator Ψ</span>
                <span className="font-mono tabular-nums text-[0.8rem] font-black text-accent-emerald bg-black/40 px-1.5 py-0.5 rounded border border-white/5">{ aggressionFactor.toFixed( 1 ) }×</span>
              </div>
              <input id="nash-aggression" name="nash-aggression" type="range" min="0.5" max="1.5" step="0.1" value={ aggressionFactor } onChange={ ( e ) => onAggressionChange( Number.parseFloat( e.target.value ) ) } className="w-full accent-accent-indigo h-1 bg-white/10 rounded-full appearance-none cursor-pointer" />
            </div>
          </SotaTooltip>

          {/* PKO Bounty */ }
          <SotaTooltip align="right" title="Bounty Power" content="Diluidor de Risk Premium. A recompensa imediata (bounty) infla a utilidade do Call, destruindo o Teto de Risco do ICM tradicional." theme="indigo">
            <div className={`bg-black/20 border rounded-xl p-4 transition-all hover:border-accent-amber/30 group ${pkoValue > 0 ? 'border-accent-amber/30 shadow-lg shadow-accent-amber/5' : 'border-white/5'}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[0.6rem] font-black text-text-dim uppercase tracking-widest">PKO Power</span>
                <span className="font-mono tabular-nums text-[0.8rem] font-black text-accent-gold bg-black/40 px-1.5 py-0.5 rounded border border-white/5">{ pkoValue === 0 ? 'OFF' : `${Math.round( pkoValue * 100 )}%` }</span>
              </div>
              <input id="nash-pko" name="nash-pko" type="range" min="0" max="0.8" step="0.05" value={ pkoValue } onChange={ ( e ) => onPkoChange( Number.parseFloat( e.target.value ) ) } className="w-full accent-accent-amber h-1 bg-white/10 rounded-full appearance-none cursor-pointer" />
            </div>
          </SotaTooltip>
      </div>

    </div>
  );
}
