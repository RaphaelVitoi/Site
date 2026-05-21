'use client';

/**
 * IDENTITY: Painel de Frequências ICM Quantum (v4.1)
 * PATH: src/components/simulator/panels/NashPanel.tsx
 * ROLE: Exibe a distorção GTO através do Organismo SOTA.
 *       As abas de street mostram a Pressão de Fold (RP) dinâmica.
 */

import { MetricTooltip } from '@/app/ICMlaboratory/RiskPremiumDashboard';
import { useState } from 'react';
import type { ChipEvFreqs, FreqResult, IcmDistortionResult, StreetChipEvFreqs } from '../engine/types';
import AnimatedNumber from '../ui/AnimatedNumber';

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
  return (
    <div className="relative group inline-flex items-center ml-1 cursor-help">
      <span style={ { fontSize: '0.62rem', color: 'var(--text-darker)', lineHeight: 1 } }>ⓘ</span>
      <div className="absolute bottom-full -left-4 sm:left-1/2 sm:-translate-x-1/2 mb-2 w-48 sm:w-64 max-w-[85vw] p-2 sm:p-3 bg-[#0a0f1c] border border-indigo-500/30 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-100 pointer-events-none text-[0.65rem] text-slate-300 leading-relaxed font-sans normal-case tracking-normal text-left">
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
    <div style={ { display: 'flex', alignItems: 'center', gap: '2px' } }>
      <input
        id={ `nash-freq-${String( field )}` }
        name={ `nash-freq-${String( field )}` }
        type="number"
        min="0"
        max="100"
        step="1"
        value={ value }
        onChange={ ( e ) => onChange( { ...freqs, [ field ]: Math.max( 0, Math.min( 100, Number( e.target.value ) || 0 ) ) } ) }
        style={ {
          width: '56px',
          padding: '0.18rem 0.25rem',
          borderRadius: '4px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'var(--text-muted)',
          fontSize: '0.68rem',
          fontFamily: 'monospace',
          fontWeight: 600,
          textAlign: 'right',
          outline: 'none',
        } }
      />
      <span style={ { fontSize: '0.58rem', color: 'var(--text-darker)' } }>%</span>
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
  return (
    <div style={ {
      display: 'grid',
      gridTemplateColumns: '60px 72px 24px 1fr 64px',
      alignItems: 'center',
      gap: '0.4rem',
      padding: '0.35rem 0',
      borderBottom: '1px solid rgba(255,255,255,0.03)',
    } }>
      <span style={ { fontSize: '0.58rem', fontWeight: 800, color: accent, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'flex', alignItems: 'center', gap: '2px' } }>
        { label } { labelTooltip && <InfoTooltip text={ labelTooltip } /> }
      </span>
      <FreqInput value={ chipEv } field={ field } freqs={ freqs } onChange={ onChange } />
      <span style={ { fontSize: '0.6rem', color: 'var(--text-darker)', textAlign: 'center' } }>→</span>
      <div style={ { display: 'flex', alignItems: 'baseline', gap: '4px' } }>
        <span className="font-mono tabular-nums" style={ { fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' } }>
          <AnimatedNumber value={ result.center } suffix="%" />
        </span>
        <span style={ { fontSize: '0.58rem', color: 'var(--text-darker)' } }>±{ result.spread.toFixed( 0 ) }</span>
      </div>
      <div style={ { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' } }>
        <span style={ { fontSize: '0.6rem', fontWeight: 700, color: deltaColor( result.delta ), fontFamily: 'monospace' } }>{ fmt( result.delta ) }</span>
        <div style={ { width: '100%', height: '4px', background: 'rgba(0,0,0,0.3)', borderRadius: '2px', position: 'relative', overflow: 'hidden' } }>
          <div style={ { position: 'absolute', top: 0, bottom: 0, left: `${result.delta >= 0 ? 50 : Math.max( 0, 50 - Math.abs( result.delta ) )}%`, width: `${Math.min( 50, Math.abs( result.delta ) )}%`, background: deltaColor( result.delta ) } } />
          <div style={ { position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.1)' } } />
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

  return (
    <div className="glass-panel" style={ { padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' } }>

      {/* Header Didático */ }
      <div style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } }>
        <div>
          <h3 style={ { margin: 0, fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.15em' } }>Frequências ICM Quantum</h3>
          <p style={ { margin: '0.25rem 0 0', fontSize: '0.6rem', color: 'var(--text-dim)' } }>Motor SOTA v4.1 &middot; Organismo Sistêmico.</p>
        </div>
        <span style={ { padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.07)', fontSize: '0.58rem', fontWeight: 700, color: deltaRp > 0 ? 'var(--accent-amber)' : 'var(--accent-emerald)' } }>
          ΔRP { deltaRp >= 0 ? '+' : '' }{ deltaRp.toFixed( 1 ) } p.p.
        </span>
      </div>

      {/* Controles do Piso Dinâmico */ }
      <div id="quantum-controls" style={ { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' } }>
        <button onClick={ () => onPayjumpToggle( !isNearPayjump ) } style={ { padding: '0.5rem', borderRadius: '8px', fontSize: '0.55rem', fontWeight: 800, background: isNearPayjump ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.02)', border: `1px solid ${isNearPayjump ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.1)'}`, color: isNearPayjump ? 'var(--accent-emerald)' : 'var(--text-dim)', cursor: 'pointer', textTransform: 'uppercase' } }>
          { isNearPayjump ? '✓ Payjump Iminente' : 'Perto de Payjump?' }
        </button>
        <button onClick={ () => onBlindsToggle( !blindsRisingSoon ) } style={ { padding: '0.5rem', borderRadius: '8px', fontSize: '0.55rem', fontWeight: 800, background: blindsRisingSoon ? 'rgba(244,63,94,0.15)' : 'rgba(255,255,255,0.02)', border: `1px solid ${blindsRisingSoon ? 'var(--accent-danger)' : 'rgba(255,255,255,0.1)'}`, color: blindsRisingSoon ? 'var(--accent-danger)' : 'var(--text-dim)', cursor: 'pointer', textTransform: 'uppercase' } }>
          { blindsRisingSoon ? '⚠ Blinds Subindo' : 'Salto de Blinds?' }
        </button>
      </div>

      {/* Seletor de Street (Organismo) */ }
      <div style={ { display: 'flex', gap: '0.4rem', marginBottom: '0.2rem' } }>
        { ( [ 'flop', 'turn', 'river' ] as const ).map( s => {
          const d = streetData[ s ];
          const isActive = s === activeStreet;
          const avgRp = isBaseline ? 0 : ( d.rps.ip + d.rps.oop ) / 2;
          return (
            <button key={ s } type="button" onClick={ () => setActiveStreet( s ) } style={ { flex: 1, padding: '0.6rem 0', borderRadius: '10px', border: `1px solid ${isActive ? d.color : 'rgba(255,255,255,0.06)'}`, background: isActive ? `${d.color}18` : 'transparent', color: isActive ? d.color : 'var(--text-darker)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', transition: 'all 0.2s' } }>
              <span style={ { fontSize: '0.55rem', fontWeight: 900, textTransform: 'uppercase' } }>{ d.label }</span>
              <span style={ { fontSize: '0.45rem', fontWeight: 700, opacity: 0.8 } }>RP { avgRp.toFixed( 1 ) }%</span>
            </button>
          );
        } ) }
      </div>

      {/* Grid de Pressão Semântica */ }
      <div style={ { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.5rem' } }>
        <div>
          <span style={ { fontSize: '0.45rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 800, display: 'block' } }>Pressão IP (Agressor)</span>
          <span style={ { fontSize: '0.8rem', fontWeight: 900, color: current.color } }>{ ipRp.toFixed( 1 ) }%</span>
        </div>
        <div>
          <span style={ { fontSize: '0.45rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 800, display: 'block' } }>Pressão OOP (Defensor)</span>
          <span style={ { fontSize: '0.8rem', fontWeight: 900, color: 'var(--accent-amber)' } }>{ oopRp.toFixed( 1 ) }%</span>
        </div>
      </div>

      {/* Ações IP */ }
      <div style={ { marginBottom: '0.5rem' } }>
        <div style={ { fontSize: '0.58rem', fontWeight: 700, color: 'var(--accent-indigo-light)', textTransform: 'uppercase', letterSpacing: '0.12em', paddingBottom: '0.1rem' } }>IP — Agressor</div>
        <ActionRow label="Check" chipEv={ current.freqs.ip_check } result={ current.nash.ip.check } field="ip_check" accent="var(--accent-indigo-light)" freqs={ current.freqs } onChange={ ( f ) => onStreetFreqChange( activeStreet, f ) } />
        <ActionRow label="Bet S" chipEv={ current.freqs.ip_bet_small } result={ current.nash.ip.bet_small } field="ip_bet_small" accent="var(--accent-indigo-light)" freqs={ current.freqs } onChange={ ( f ) => onStreetFreqChange( activeStreet, f ) } />
        <ActionRow label="Bet L" chipEv={ current.freqs.ip_bet_large } result={ current.nash.ip.bet_large } field="ip_bet_large" accent="var(--accent-indigo-light)" freqs={ current.freqs } onChange={ ( f ) => onStreetFreqChange( activeStreet, f ) } />
      </div>

      {/* Ações OOP */ }
      <div style={ { marginBottom: '1.1rem' } }>
        <div style={ { fontSize: '0.58rem', fontWeight: 700, color: 'var(--accent-danger)', textTransform: 'uppercase', letterSpacing: '0.12em', paddingBottom: '0.1rem' } }>OOP — Defensor</div>
        <ActionRow label="Call" chipEv={ current.freqs.oop_call } result={ current.nash.oop.call } field="oop_call" accent="var(--accent-danger)" freqs={ current.freqs } onChange={ ( f ) => onStreetFreqChange( activeStreet, f ) } />
        <ActionRow label="Fold" chipEv={ current.freqs.oop_fold } result={ current.nash.oop.fold } field="oop_fold" accent="var(--accent-danger)" freqs={ current.freqs } onChange={ ( f ) => onStreetFreqChange( activeStreet, f ) } />
        <ActionRow label="Raise" chipEv={ current.freqs.oop_raise } result={ current.nash.oop.raise } field="oop_raise" accent="var(--accent-danger)" freqs={ current.freqs } onChange={ ( f ) => onStreetFreqChange( activeStreet, f ) } />
      </div>

      {/* Aggression Factor */ }
      <MetricTooltip align="left" title="Agressividade Humana (Fator Ψ)" desc="Modulador bayesiano SOTA. Se o oponente real desvia do equilíbrio (ex: paga demais ou blefa de menos), a distribuição de Nash é forçada a se contrair ou expandir.">
        <div style={ { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '0.85rem 1.1rem' } }>
          <div style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' } }>
            <span style={ { fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' } }>Agressividade Humana</span>
            <span className="font-mono tabular-nums" style={ { fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-emerald)' } }>{ aggressionFactor.toFixed( 1 ) }×</span>
          </div>
          <input id="nash-aggression" name="nash-aggression" type="range" min="0.5" max="1.5" step="0.1" value={ aggressionFactor } onChange={ ( e ) => onAggressionChange( Number.parseFloat( e.target.value ) ) } style={ { width: '100%', accentColor: 'var(--accent-indigo)' } } />
        </div>
      </MetricTooltip>

      {/* PKO Bounty */ }
      <MetricTooltip align="left" title="Bounty Power" desc="Diluidor de Risk Premium. A recompensa imediata (bounty) infla a utilidade do Call, destruindo o Teto de Risco do ICM tradicional.">
        <div style={ { background: 'rgba(255,255,255,0.02)', border: pkoValue > 0 ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '0.85rem 1.1rem' } }>
          <div style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' } }>
            <span style={ { fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' } }>PKO Bounty Power</span>
            <span className="font-mono tabular-nums" style={ { fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-gold)' } }>{ pkoValue === 0 ? 'OFF' : `${Math.round( pkoValue * 100 )}%` }</span>
          </div>
          <input id="nash-pko" name="nash-pko" type="range" min="0" max="0.8" step="0.05" value={ pkoValue } onChange={ ( e ) => onPkoChange( Number.parseFloat( e.target.value ) ) } style={ { width: '100%', accentColor: 'var(--accent-amber)' } } />
        </div>
      </MetricTooltip>

    </div>
  );
}
