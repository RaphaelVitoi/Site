'use client';

/**
 * IDENTITY: Painel de Frequências ICM Quantum (v4.1)
 * PATH: src/components/simulator/panels/NashPanel.tsx
 * ROLE: Exibe a distorção GTO através do Organismo SOTA.
 *       As abas de street mostram a Pressão de Fold (RP) dinâmica.
 */

import { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import type { ChipEvFreqs, FreqResult, IcmDistortionResult, StreetChipEvFreqs } from '../engine/types';
import styles from '../simulator.module.css';
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
  onStreetFreqChange: ( street: keyof StreetChipEvFreqs, freqs: ChipEvFreqs ) => void;
  onAggressionChange: ( value: number ) => void;
  onPkoChange: ( value: number ) => void;
  onPayjumpToggle: ( value: boolean ) => void;
  onBlindsToggle: ( value: boolean ) => void;
}

function InfoTooltip ( { text }: Readonly<{ text: string }> ) {
  const [ pos, setPos ] = useState<{ x: number; y: number } | null>( null );
  const ref = useRef<HTMLSpanElement>( null );

  function handleEnter () {
    if ( !ref.current ) return;
    const r = ref.current.getBoundingClientRect();
    setPos( { x: r.left + r.width / 2, y: r.top - 6 } );
  }

  const tooltipEl = pos && typeof document !== 'undefined'
    ? ReactDOM.createPortal(
      <span style={ {
        position: 'fixed',
        top: pos.y,
        left: pos.x,
        transform: 'translate(-50%, -100%)',
        width: '260px',
        background: '#0f172a',
        border: '1px solid rgba(99,102,241,0.35)',
        borderRadius: '6px',
        padding: '0.5rem 0.7rem',
        fontSize: '0.65rem',
        color: '#e2e8f0',
        lineHeight: 1.55,
        zIndex: 9999,
        pointerEvents: 'none',
        whiteSpace: 'normal',
        boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
      } }>
        { text }
      </span>,
      document.body
    )
    : null;

  return (
    <span
      ref={ ref }
      style={ { display: 'inline-flex', alignItems: 'center', marginLeft: '3px', cursor: 'help' } }
      onMouseEnter={ handleEnter }
      onMouseLeave={ () => setPos( null ) }
    >
      <span style={ { fontSize: '0.62rem', color: '#475569', lineHeight: 1 } }>ⓘ</span>
      { tooltipEl }
    </span>
  );
}

function fmt ( delta: number ): string {
  const v = delta.toFixed( 0 );
  return delta >= 0 ? `+${v}` : `${v}`;
}

function deltaColor ( delta: number ): string {
  if ( delta > 1 ) return '#10b981';
  if ( delta < -1 ) return '#fb7185';
  return '#475569';
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
          color: '#94a3b8',
          fontSize: '0.68rem',
          fontFamily: 'monospace',
          fontWeight: 600,
          textAlign: 'right',
          outline: 'none',
        } }
      />
      <span style={ { fontSize: '0.58rem', color: '#475569' } }>%</span>
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
      <span style={ { fontSize: '0.6rem', color: '#475569', textAlign: 'center' } }>→</span>
      <div style={ { display: 'flex', alignItems: 'baseline', gap: '4px' } }>
        <span className={ styles.dataMono } style={ { fontSize: '0.9rem', fontWeight: 800, color: '#fff' } }>
          <AnimatedNumber value={ result.center } suffix="%" />
        </span>
        <span style={ { fontSize: '0.58rem', color: '#475569' } }>±{ result.spread.toFixed( 0 ) }</span>
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
  onStreetFreqChange, onAggressionChange, onPkoChange,
  onPayjumpToggle, onBlindsToggle,
}: Readonly<NashPanelProps> ) {
  const [ activeStreet, setActiveStreet ] = useState<'flop' | 'turn' | 'river'>( 'flop' );

  const streetData = {
    flop: { nash: nashFlop, freqs: streetFreqs.flop, rps: streetRps.flop, label: 'FLOP', color: '#818cf8' },
    turn: { nash: nashTurn, freqs: streetFreqs.turn, rps: streetRps.turn, label: 'TURN', color: '#10b981' },
    river: { nash: nashRiver, freqs: streetFreqs.river, rps: streetRps.river, label: 'RIVER', color: '#f43f5e' },
  };

  const current = streetData[ activeStreet ];
  const { deltaRp } = current.nash;

  return (
    <div className={ styles.glassPanel } style={ { padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' } }>

      {/* Header Didático */ }
      <div style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } }>
        <div>
          <h3 style={ { margin: 0, fontSize: '0.65rem', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.15em' } }>Frequências ICM Quantum</h3>
          <p style={ { margin: '0.25rem 0 0', fontSize: '0.6rem', color: '#64748b' } }>Motor SOTA v4.1 &middot; Organismo Sistêmico.</p>
        </div>
        <span style={ { padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.07)', fontSize: '0.58rem', fontWeight: 700, color: deltaRp > 0 ? '#f59e0b' : '#10b981' } }>
          ΔRP { deltaRp >= 0 ? '+' : '' }{ deltaRp.toFixed( 1 ) } p.p.
        </span>
      </div>

      {/* Controles do Piso Dinâmico */ }
      <div id="quantum-controls" style={ { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' } }>
        <button onClick={ () => onPayjumpToggle( !isNearPayjump ) } style={ { padding: '0.5rem', borderRadius: '8px', fontSize: '0.55rem', fontWeight: 800, background: isNearPayjump ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.02)', border: `1px solid ${isNearPayjump ? '#10b981' : 'rgba(255,255,255,0.1)'}`, color: isNearPayjump ? '#10b981' : '#64748b', cursor: 'pointer', textTransform: 'uppercase' } }>
          { isNearPayjump ? '✓ Payjump Iminente' : 'Perto de Payjump?' }
        </button>
        <button onClick={ () => onBlindsToggle( !blindsRisingSoon ) } style={ { padding: '0.5rem', borderRadius: '8px', fontSize: '0.55rem', fontWeight: 800, background: blindsRisingSoon ? 'rgba(244,63,94,0.15)' : 'rgba(255,255,255,0.02)', border: `1px solid ${blindsRisingSoon ? '#f43f5e' : 'rgba(255,255,255,0.1)'}`, color: blindsRisingSoon ? '#f43f5e' : '#64748b', cursor: 'pointer', textTransform: 'uppercase' } }>
          { blindsRisingSoon ? '⚠ Blinds Subindo' : 'Salto de Blinds?' }
        </button>
      </div>

      {/* Seletor de Street (Organismo) */ }
      <div style={ { display: 'flex', gap: '0.4rem', marginBottom: '0.2rem' } }>
        { ( [ 'flop', 'turn', 'river' ] as const ).map( s => {
          const d = streetData[ s ];
          const isActive = s === activeStreet;
          const avgRp = ( d.rps.ip + d.rps.oop ) / 2;
          return (
            <button key={ s } type="button" onClick={ () => setActiveStreet( s ) } style={ { flex: 1, padding: '0.6rem 0', borderRadius: '10px', border: `1px solid ${isActive ? d.color : 'rgba(255,255,255,0.06)'}`, background: isActive ? `${d.color}18` : 'transparent', color: isActive ? d.color : '#475569', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', transition: 'all 0.2s' } }>
              <span style={ { fontSize: '0.55rem', fontWeight: 900, textTransform: 'uppercase' } }>{ d.label }</span>
              <span style={ { fontSize: '0.45rem', fontWeight: 700, opacity: 0.8 } }>RP { avgRp.toFixed( 1 ) }%</span>
            </button>
          );
        } ) }
      </div>

      {/* Grid de Pressão Semântica */ }
      <div style={ { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.5rem' } }>
        <div>
          <span style={ { fontSize: '0.45rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, display: 'block' } }>Pressão IP (Agressor)</span>
          <span style={ { fontSize: '0.8rem', fontWeight: 900, color: current.color } }>{ current.rps.ip.toFixed( 1 ) }%</span>
        </div>
        <div>
          <span style={ { fontSize: '0.45rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, display: 'block' } }>Pressão OOP (Defensor)</span>
          <span style={ { fontSize: '0.8rem', fontWeight: 900, color: '#f59e0b' } }>{ current.rps.oop.toFixed( 1 ) }%</span>
        </div>
      </div>

      {/* Ações IP */ }
      <div style={ { marginBottom: '0.5rem' } }>
        <div style={ { fontSize: '0.58rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.12em', paddingBottom: '0.1rem' } }>IP — Agressor</div>
        <ActionRow label="Check" chipEv={ current.freqs.ip_check } result={ current.nash.ip.check } field="ip_check" accent="#818cf8" freqs={ current.freqs } onChange={ ( f ) => onStreetFreqChange( activeStreet, f ) } />
        <ActionRow label="Bet S" chipEv={ current.freqs.ip_bet_small } result={ current.nash.ip.bet_small } field="ip_bet_small" accent="#818cf8" freqs={ current.freqs } onChange={ ( f ) => onStreetFreqChange( activeStreet, f ) } />
        <ActionRow label="Bet L" chipEv={ current.freqs.ip_bet_large } result={ current.nash.ip.bet_large } field="ip_bet_large" accent="#818cf8" freqs={ current.freqs } onChange={ ( f ) => onStreetFreqChange( activeStreet, f ) } />
      </div>

      {/* Ações OOP */ }
      <div style={ { marginBottom: '1.1rem' } }>
        <div style={ { fontSize: '0.58rem', fontWeight: 700, color: '#fb7185', textTransform: 'uppercase', letterSpacing: '0.12em', paddingBottom: '0.1rem' } }>OOP — Defensor</div>
        <ActionRow label="Call" chipEv={ current.freqs.oop_call } result={ current.nash.oop.call } field="oop_call" accent="#fb7185" freqs={ current.freqs } onChange={ ( f ) => onStreetFreqChange( activeStreet, f ) } />
        <ActionRow label="Fold" chipEv={ current.freqs.oop_fold } result={ current.nash.oop.fold } field="oop_fold" accent="#fb7185" freqs={ current.freqs } onChange={ ( f ) => onStreetFreqChange( activeStreet, f ) } />
        <ActionRow label="Raise" chipEv={ current.freqs.oop_raise } result={ current.nash.oop.raise } field="oop_raise" accent="#fb7185" freqs={ current.freqs } onChange={ ( f ) => onStreetFreqChange( activeStreet, f ) } />
      </div>

      {/* Aggression Factor */ }
      <div style={ { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '0.85rem 1.1rem' } }>
        <div style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' } }>
          <span style={ { fontSize: '0.58rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' } }>Agressividade Humana</span>
          <span className={ styles.dataMono } style={ { fontSize: '0.8rem', fontWeight: 800, color: '#10b981' } }>{ aggressionFactor.toFixed( 1 ) }×</span>
        </div>
        <input type="range" min="0.5" max="1.5" step="0.1" value={ aggressionFactor } onChange={ ( e ) => onAggressionChange( parseFloat( e.target.value ) ) } style={ { width: '100%', accentColor: '#6366f1' } } />
      </div>

      {/* PKO Bounty */ }
      <div style={ { background: 'rgba(255,255,255,0.02)', border: pkoValue > 0 ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '0.85rem 1.1rem' } }>
        <div style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' } }>
          <span style={ { fontSize: '0.58rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' } }>PKO Bounty Power</span>
          <span className={ styles.dataMono } style={ { fontSize: '0.8rem', fontWeight: 800, color: '#fbbf24' } }>{ pkoValue === 0 ? 'OFF' : `${Math.round( pkoValue * 100 )}%` }</span>
        </div>
        <input type="range" min="0" max="0.8" step="0.05" value={ pkoValue } onChange={ ( e ) => onPkoChange( parseFloat( e.target.value ) ) } style={ { width: '100%', accentColor: '#f59e0b' } } />
      </div>

    </div>
  );
}
