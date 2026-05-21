'use client';

/**
 * IDENTITY: Painel Pós-Flop HU — Validação Visual
 * PATH: src/components/simulator/panels/PostFlopPanel.tsx
 * ROLE: Exibe os componentes da PM por street para cenário HU:
 *       EV_fold_street, SPR remanescente, R_street, RP (IP/OOP).
 *       Permite ao usuário variar potAcumuladoHero por street e observar
 *       como cada componente evolui.
 * BINDING: [lib/rpDeriver.ts]
 * MW: standby — este painel é exclusivamente HU.
 */

import React, { useMemo, useState } from 'react';
import { derivePostFlopRps, type PostFlopResult, type Street } from '../../../lib/rpDeriver';

// =============================================================================
// PRESETS HU
// =============================================================================

interface PostFlopPreset {
  label: string;
  stacks: number[];
  prizes: number[];
  ipIndex: number;
  oopIndex: number;
  ipLabel: string;
  oopLabel: string;
}

const PRESETS: PostFlopPreset[] = [
  {
    label: 'Paradoxo (HU @ FT)',
    stacks: [ 40, 55, 9.4, 52.4, 22.2, 7.0, 44.3, 24.3, 13.4 ],
    prizes: [ 237.34, 170.96, 135.17, 109.99, 90.28, 73.95, 59.92, 47.56, 36.47 ],
    ipIndex: 0,
    oopIndex: 1,
    ipLabel: 'BTN 40bb',
    oopLabel: 'BB 55bb',
  },
  {
    label: 'Pacto Silencioso',
    stacks: [ 65, 70, 15, 12, 8 ],
    prizes: [ 237.34, 170.96, 135.17, 109.99, 90.28 ],
    ipIndex: 0,
    oopIndex: 1,
    ipLabel: 'VP 65bb',
    oopLabel: 'CL 70bb',
  },
  {
    label: 'HU Puro (ChipEV)',
    stacks: [ 55, 45 ],
    prizes: [ 65, 35 ],
    ipIndex: 0,
    oopIndex: 1,
    ipLabel: 'BTN 55bb',
    oopLabel: 'BB 45bb',
  },
];

const STREETS: Street[] = [ 'flop', 'turn', 'river' ];
const STREET_LABEL: Record<Street, string> = { flop: 'FLOP', turn: 'TURN', river: 'RIVER' };

// =============================================================================
// HELPERS VISUAIS
// =============================================================================

const MONO: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };

function MetricRow ( {
  label,
  value,
  color,
  hint,
}: Readonly<{
  label: string;
  value: string;
  color?: string;
  hint?: string;
}> ) {
  return (
    <div style={ {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      padding: '0.28rem 0',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    } }>
      <span style={ { fontSize: '0.6rem', color: '#64748b' } }>
        { label }
        { hint && (
          <span style={ { marginLeft: '0.3rem', fontSize: '0.55rem', color: '#334155' } }>
            { hint }
          </span>
        ) }
      </span>
      <span style={ { fontSize: '0.7rem', fontWeight: 700, color: color ?? '#e2e8f0', ...MONO } }>
        { value }
      </span>
    </div>
  );
}

function StreetCard ( {
  street,
  result,
  ipLabel,
  oopLabel,
  heroIsIp,
}: Readonly<{
  street: Street;
  result: PostFlopResult;
  ipLabel: string;
  oopLabel: string;
  heroIsIp: boolean;
}> ) {
  const heroRp = heroIsIp ? result.ipRp : result.oopRp;
  const villainRp = heroIsIp ? result.oopRp : result.ipRp;
  const heroLabel = heroIsIp ? ipLabel : oopLabel;
  const villainLabel = heroIsIp ? oopLabel : ipLabel;

  const evFold = result.evFoldStreet;
  const evFoldColor = evFold >= 0 ? '#10b981' : '#f43f5e';

  const sprColor = result.sprRemanescente < 2
    ? '#f43f5e'
    : result.sprRemanescente < 5
      ? '#f59e0b'
      : '#10b981';

  return (
    <div style={ {
      background: 'rgba(15,23,42,0.7)',
      border: '1px solid rgba(99,102,241,0.2)',
      borderRadius: '10px',
      padding: '0.8rem 0.9rem',
    } }>
      <div style={ {
        fontSize: '0.55rem',
        fontWeight: 900,
        color: '#6366f1',
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        marginBottom: '0.6rem',
      } }>
        { STREET_LABEL[ street ] }
      </div>

      <MetricRow
        label="EV_fold"
        value={ `${evFold >= 0 ? '+' : ''}${evFold.toFixed( 2 )} bb` }
        color={ evFoldColor }
        hint="1ª ordem — dominante"
      />
      <MetricRow
        label="SPR remanescente"
        value={ result.sprRemanescente === Infinity ? '∞' : result.sprRemanescente.toFixed( 1 ) }
        color={ sprColor }
        hint="stack÷pot"
      />
      <MetricRow
        label="R (realização)"
        value={ `${( result.rStreet * 100 ).toFixed( 0 )}%` }
        color="#94a3b8"
        hint={ street === 'river' ? 'binário' : heroIsIp ? 'IP' : 'OOP' }
      />
      <MetricRow
        label={ `RP ${heroLabel}` }
        value={ `${heroRp.toFixed( 1 )}%` }
        color="#6366f1"
      />
      <MetricRow
        label={ `RP ${villainLabel}` }
        value={ `${villainRp.toFixed( 1 )}%` }
        color="#818cf8"
      />
      <MetricRow
        label="ΔRP"
        value={ `${result.deltaRp >= 0 ? '+' : ''}${result.deltaRp.toFixed( 1 )}%` }
        color={ result.deltaRp > 0 ? '#f59e0b' : '#94a3b8' }
        hint="IP − OOP"
      />
    </div>
  );
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export default function PostFlopPanel () {
  const [ presetIdx, setPresetIdx ] = useState( 0 );
  const [ heroIsIp, setHeroIsIp ] = useState( true );

  // potAcumuladoHero por street (o usuário controla cada street individualmente)
  const [ potFlop, setPotFlop ] = useState( 3 );
  const [ potTurn, setPotTurn ] = useState( 9 );
  const [ potRiver, setPotRiver ] = useState( 22 );

  // Estado local para stacks e prizes permitindo edição/phantom stacks
  const [ stacks, setStacks ] = useState<number[]>( PRESETS[ 0 ].stacks );
  const [ prizes, setPrizes ] = useState<number[]>( PRESETS[ 0 ].prizes );

  // Atualiza stacks locais quando o preset muda
  const handlePresetChange = ( idx: number ) => {
    setPresetIdx( idx );
    setStacks( PRESETS[ idx ].stacks );
    setPrizes( PRESETS[ idx ].prizes );
  };

  const addPhantom = () => {
    setStacks( prev => [ ...prev, 20 ] );
    if ( prizes.length < stacks.length + 1 )
    {
      setPrizes( prev => [ ...prev, Math.max( 1, ( prev[ prev.length - 1 ] || 10 ) * 0.8 ) ] );
    }
  };

  const updateStack = ( idx: number, val: number ) => {
    const newStacks = [ ...stacks ];
    newStacks[ idx ] = Math.max( 0.1, val );
    setStacks( newStacks );
  };

  const preset = PRESETS[ presetIdx ];
  const ipIdx = preset.ipIndex;
  const oopIdx = preset.oopIndex;

  // potTotal por street: ambos investiram o mesmo (simplificação HU simétrica)
  const potTotalFlop = potFlop * 2;
  const potTotalTurn = potTurn * 2;
  const potTotalRiver = potRiver * 2;

  const resultFlop = useMemo( () => derivePostFlopRps( stacks, prizes, ipIdx, oopIdx, {
    street: 'flop', potAcumuladoHero: potFlop, potTotal: potTotalFlop, heroIsIp,
  } ), [ stacks, prizes, ipIdx, oopIdx, potFlop, potTotalFlop, heroIsIp ] );

  const resultTurn = useMemo( () => derivePostFlopRps( stacks, prizes, ipIdx, oopIdx, {
    street: 'turn', potAcumuladoHero: potTurn, potTotal: potTotalTurn, heroIsIp,
  } ), [ stacks, prizes, ipIdx, oopIdx, potTurn, potTotalTurn, heroIsIp ] );

  const resultRiver = useMemo( () => derivePostFlopRps( stacks, prizes, ipIdx, oopIdx, {
    street: 'river', potAcumuladoHero: potRiver, potTotal: potTotalRiver, heroIsIp,
  } ), [ stacks, prizes, ipIdx, oopIdx, potRiver, potTotalRiver, heroIsIp ] );

  const results: [ Street, PostFlopResult | null ][] = [
    [ 'flop', resultFlop ],
    [ 'turn', resultTurn ],
    [ 'river', resultRiver ],
  ];

  return (
    <div style={ { padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' } }>

      {/* Header */ }
      <div style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } }>
        <div>
          <h3 style={ { fontSize: '0.8rem', fontWeight: 800, color: '#e2e8f0', margin: 0 } }>
            PM Pós-Flop — HU
          </h3>
          <p style={ { fontSize: '0.58rem', color: '#64748b', margin: '0.25rem 0 0' } }>
            Componentes da Perspectiva Matemática por street. EV_fold = −investido (1ª ordem).
          </p>
        </div>
        <button
          onClick={ addPhantom }
          style={ {
            background: 'none',
            border: '1px dashed #334155',
            color: '#64748b',
            fontSize: '0.55rem',
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            cursor: 'pointer'
          } }
        >
          + Add Phantom Stack
        </button>
      </div>

      {/* Editor de Stacks (Contexto ICM) */ }
      <div style={ { display: 'flex', flexWrap: 'wrap', gap: '0.4rem', background: 'rgba(15, 23, 42, 0.4)', padding: '0.6rem', borderRadius: '8px' } }>
        { stacks.map( ( s, i ) => {
          const isActive = i === ipIdx || i === oopIdx;
          const label = i === ipIdx ? 'IP' : i === oopIdx ? 'OOP' : `P${i + 1}`;
          return (
            <div key={ i } style={ {
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
              border: `1px solid ${isActive ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)'}`,
              padding: '0.25rem 0.4rem',
              borderRadius: '4px',
              minWidth: '55px'
            } }>
              <span style={ { fontSize: '0.45rem', fontWeight: 800, color: isActive ? '#818cf8' : '#475569' } }>{ label }</span>
              <input
                type="number"
                value={ s }
                onChange={ ( e ) => updateStack( i, parseFloat( e.target.value ) || 0 ) }
                style={ {
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: isActive ? '#e2e8f0' : '#64748b',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  outline: 'none',
                  ...MONO
                } }
              />
            </div>
          );
        } ) }
      </div>

      {/* Controles */ }
      <div style={ { display: 'flex', flexDirection: 'column', gap: '0.8rem' } }>

        {/* Preset */ }
        <div style={ { display: 'flex', gap: '0.4rem', flexWrap: 'wrap' } }>
          { PRESETS.map( ( p, i ) => (
            <button
              key={ p.label }
              onClick={ () => handlePresetChange( i ) }
              style={ {
                padding: '0.3rem 0.7rem',
                borderRadius: '6px',
                fontSize: '0.58rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: presetIdx === i ? '#6366f1' : 'rgba(30,41,59,0.8)',
                color: presetIdx === i ? '#fff' : '#94a3b8',
              } }
            >
              { p.label }
            </button>
          ) ) }
        </div>

        {/* IP/OOP toggle */ }
        <div style={ { display: 'flex', gap: '0.4rem', alignItems: 'center' } }>
          <span style={ { fontSize: '0.58rem', color: '#64748b' } }>Hero é:</span>
          { [ true, false ].map( isIp => (
            <button
              key={ String( isIp ) }
              onClick={ () => setHeroIsIp( isIp ) }
              style={ {
                padding: '0.25rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.58rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: heroIsIp === isIp ? '#0ea5e9' : 'rgba(30,41,59,0.8)',
                color: heroIsIp === isIp ? '#fff' : '#94a3b8',
              } }
            >
              { isIp ? `IP (${preset.ipLabel})` : `OOP (${preset.oopLabel})` }
            </button>
          ) ) }
        </div>

        {/* Sliders de potAcumuladoHero por street */ }
        <div style={ { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem' } }>
          { ( [
            [ 'FLOP', potFlop, setPotFlop, 1, Math.min( stacks[ ipIdx ], stacks[ oopIdx ] ) * 0.3 ],
            [ 'TURN', potTurn, setPotTurn, 1, Math.min( stacks[ ipIdx ], stacks[ oopIdx ] ) * 0.6 ],
            [ 'RIVER', potRiver, setPotRiver, 1, Math.min( stacks[ ipIdx ], stacks[ oopIdx ] ) ],
          ] as [ string, number, React.Dispatch<React.SetStateAction<number>>, number, number ][] ).map(
            ( [ label, val, setter, min, max ] ) => (
              <div key={ label } style={ { display: 'flex', flexDirection: 'column', gap: '0.2rem' } }>
                <div style={ { display: 'flex', justifyContent: 'space-between' } }>
                  <span style={ { fontSize: '0.55rem', color: '#6366f1', fontWeight: 700 } }>{ label }</span>
                  <span style={ { fontSize: '0.55rem', color: '#94a3b8', ...MONO } }>{ val.toFixed( 1 ) }bb</span>
                </div>
                <input
                  type="range"
                  min={ min }
                  max={ max }
                  step="0.5"
                  value={ val }
                  onChange={ e => setter( Number( e.target.value ) ) }
                  style={ { width: '100%', accentColor: '#6366f1' } }
                />
                <span style={ { fontSize: '0.5rem', color: '#334155' } }>
                  EV_fold = −{ val.toFixed( 1 ) }bb
                </span>
              </div>
            )
          ) }
        </div>
      </div>

      {/* Cards por street */ }
      <div style={ { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem' } }>
        { results.map( ( [ street, result ] ) =>
          result ? (
            <StreetCard
              key={ street }
              street={ street }
              result={ result }
              ipLabel={ preset.ipLabel }
              oopLabel={ preset.oopLabel }
              heroIsIp={ heroIsIp }
            />
          ) : (
            <div key={ street } style={ {
              background: 'rgba(15,23,42,0.4)',
              border: '1px solid rgba(71,85,105,0.3)',
              borderRadius: '10px',
              padding: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            } }>
              <span style={ { fontSize: '0.6rem', color: '#475569' } }>
                { STREET_LABEL[ street ] } — sem distorção ICM
              </span>
            </div>
          )
        ) }
      </div>

      {/* Nota metodológica */ }
      <div style={ {
        background: 'rgba(15, 23, 42, 0.4)',
        border: '1px solid rgba(71, 85, 105, 0.2)',
        borderRadius: '8px',
        padding: '0.6rem 0.75rem',
        fontSize: '0.55rem',
        color: '#475569',
        lineHeight: 1.5,
      } }>
        <strong style={ { color: '#64748b' } }>Contexto SOTA:</strong>{ ' ' }
        Agora simulando contexto FT completo através de Phantom Stacks. potTotal = 2× potAcumuladoHero (simétrico).
        MW e PKO em standby.
      </div>
    </div>
  );
}
