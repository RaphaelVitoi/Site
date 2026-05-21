'use client';

/**
 * IDENTITY: Painel Pós-Flop HU — Validação Visual
 * PATH: src/components/simulator/panels/PostFlopPanel.tsx
 * ROLE: Exibe os componentes da PM por street para cenário HU:
 *       EV_fold_street, SPR remanescente, R_street, RP (IP/OOP).
 *       Permite ao usuário variar potAcumuladoHero por street e observar
 *       como cada componente evolui.
 * BINDING: [lib/rpDeriver.ts]
 * MW: ativo — numPlayers controla RIO multiway (D6).
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
    stacks: [ 40, 55, 9.4, 52.4, 22.2, 7, 44.3, 24.3, 13.4 ],
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
      <span style={ { fontSize: '0.6rem', color: 'var(--text-dim)' } }>
        { label }
        { hint && (
          <span style={ { marginLeft: '0.3rem', fontSize: '0.55rem', color: 'var(--text-dim)' } }>
            { hint }
          </span>
        ) }
      </span>
      <span style={ { fontSize: '0.7rem', fontWeight: 700, color: color ?? 'var(--text-bright)', ...MONO } }>
        { value }
      </span>
    </div>
  );
}

function getSprColor ( spr: number ): string {
  if ( spr < 2 ) return 'var(--accent-danger)';
  if ( spr < 5 ) return 'var(--accent-amber)';
  return 'var(--accent-emerald)';
}

function getRealizationHint ( street: Street, heroIsIp: boolean ): string {
  if ( street === 'river' ) return 'binário';
  return heroIsIp ? 'IP' : 'OOP';
}

function getPotEntrapmentColor ( ratio: number ): string {
  if ( ratio > 0.5 ) return 'var(--accent-danger)';
  if ( ratio > 0.25 ) return 'var(--accent-amber)';
  return 'var(--text-muted)';
}

function formatEvFold ( evFold: number ) {
  const isPositive = evFold >= 0;
  return {
    text: `${isPositive ? '+' : ''}${evFold.toFixed( 2 )} bb`,
    color: isPositive ? 'var(--accent-emerald)' : 'var(--accent-danger)'
  };
}

function formatDeltaRp ( delta: number ) {
  const isPositive = delta >= 0;
  return {
    text: `${isPositive ? '+' : ''}${delta.toFixed( 1 )}%`,
    color: delta > 0 ? 'var(--accent-amber)' : 'var(--text-muted)'
  };
}

function formatPm ( pm: number ) {
  const isPositive = pm >= 0;
  return {
    text: `${isPositive ? '+' : ''}${pm.toFixed( 2 )}`,
    color: isPositive ? 'var(--accent-emerald)' : 'var(--accent-danger)'
  };
}

function getCiStyle ( ci: number ) {
  const isSolvent = ci >= 1;
  return {
    color: isSolvent ? 'var(--accent-emerald)' : 'var(--accent-danger)',
    hint: isSolvent ? 'solvente' : 'insolvente'
  };
}

function getCardData (
  result: PostFlopResult,
  heroIsIp: boolean,
  isBaseline: boolean,
  ipLabel: string,
  oopLabel: string
) {
  const heroLabel = heroIsIp ? ipLabel : oopLabel;
  const villainLabel = heroIsIp ? oopLabel : ipLabel;

  if ( isBaseline )
  {
    return { heroRp: 0, villainRp: 0, deltaRp: 0, heroLabel, villainLabel };
  }
  return {
    heroRp: heroIsIp ? result.ipRp : result.oopRp,
    villainRp: heroIsIp ? result.oopRp : result.ipRp,
    deltaRp: result.deltaRp,
    heroLabel,
    villainLabel
  };
}

function StreetCard ( {
  street,
  result,
  ipLabel,
  oopLabel,
  heroIsIp,
  isBaseline = false,
}: Readonly<{
  street: Street;
  result: PostFlopResult;
  ipLabel: string;
  oopLabel: string;
  heroIsIp: boolean;
  isBaseline?: boolean;
}> ) {
  const { heroRp, villainRp, deltaRp, heroLabel, villainLabel } = getCardData( result, heroIsIp, isBaseline, ipLabel, oopLabel );

  const evFoldData = formatEvFold( result.evFoldStreet );
  const deltaRpData = formatDeltaRp( deltaRp );
  const pmData = formatPm( result.pmStreet );
  const ciData = getCiStyle( result.ciStreet );

  const sprColor = getSprColor( result.sprRemanescente );
  const realizationHint = getRealizationHint( street, heroIsIp );
  const entrapmentColor = getPotEntrapmentColor( result.potEntrapmentRatio );

  const valColor = result.valuationStreet < 1 ? 'var(--accent-amber)' : 'var(--accent-emerald)';
  const sprText = result.sprRemanescente === Infinity ? '∞' : result.sprRemanescente.toFixed( 1 );

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
        color: 'var(--accent-indigo)',
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        marginBottom: '0.6rem',
      } }>
        { STREET_LABEL[ street ] }
      </div>

      <MetricRow
        label="EV_fold"
        value={ evFoldData.text }
        color={ evFoldData.color }
        hint="1ª ordem — dominante"
      />
      <MetricRow
        label="SPR remanescente"
        value={ sprText }
        color={ sprColor }
        hint="stack÷pot"
      />
      <MetricRow
        label="R (realização)"
        value={ `${( result.rStreet * 100 ).toFixed( 0 )}%` }
        color="var(--text-muted)"
        hint={ realizationHint }
      />
      <MetricRow
        label={ `RP ${heroLabel}` }
        value={ `${heroRp.toFixed( 1 )}%` }
        color="var(--accent-indigo)"
      />
      <MetricRow
        label={ `RP ${villainLabel}` }
        value={ `${villainRp.toFixed( 1 )}%` }
        color="var(--accent-indigo-light)"
      />
      <MetricRow
        label="ΔRP"
        value={ deltaRpData.text }
        color={ deltaRpData.color }
        hint="IP − OOP"
      />

      {/* D6: Componentes PM por street */ }
      <div style={ { marginTop: '0.4rem', borderTop: '1px solid rgba(99,102,241,0.15)', paddingTop: '0.4rem' } }>
        <MetricRow
          label="PM street"
          value={ pmData.text }
          color={ pmData.color }
          hint="(Eq×R×Val×gain)−(loss+RIO)"
        />
        <MetricRow
          label="Ci street"
          value={ result.ciStreet.toFixed( 3 ) }
          color={ ciData.color }
          hint={ ciData.hint }
        />
        <MetricRow
          label="Valuation ICM"
          value={ result.valuationStreet.toFixed( 3 ) }
          color={ valColor }
          hint="gain÷loss"
        />
        { result.rioMwStreet > 0 && (
          <MetricRow
            label="RIO MW"
            value={ result.rioMwStreet.toFixed( 2 ) }
            color="var(--accent-danger)"
            hint="N²×p_d×pot"
          />
        ) }
        <MetricRow
          label="Pot Entrapment"
          value={ `${( result.potEntrapmentRatio * 100 ).toFixed( 0 )}%` }
          color={ entrapmentColor }
          hint="investido÷stack"
        />
      </div>
    </div>
  );
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

interface PostFlopPanelProps {
  anteSize?: number;
}

export default function PostFlopPanel ( { anteSize = 12.5 }: Readonly<PostFlopPanelProps> ) {
  const [ presetIdx, setPresetIdx ] = useState( 0 );
  const [ heroIsIp, setHeroIsIp ] = useState( true );
  const [ numPlayers, setNumPlayers ] = useState( 2 );

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
      setPrizes( prev => [ ...prev, Math.max( 1, ( prev.at( -1 ) || 10 ) * 0.8 ) ] );
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

  // SOTA: Erradicação de ruído matemático se o usuário esmagar a estrutura de prêmios.
  const isBaseline = prizes.length <= 1;

  const resultFlop = useMemo( () => derivePostFlopRps( stacks, prizes, ipIdx, oopIdx, {
    street: 'flop', potAcumuladoHero: potFlop, potTotal: potTotalFlop, heroIsIp, numPlayers,
  } ), [ stacks, prizes, ipIdx, oopIdx, potFlop, potTotalFlop, heroIsIp, numPlayers ] );

  const resultTurn = useMemo( () => derivePostFlopRps( stacks, prizes, ipIdx, oopIdx, {
    street: 'turn', potAcumuladoHero: potTurn, potTotal: potTotalTurn, heroIsIp, numPlayers,
  } ), [ stacks, prizes, ipIdx, oopIdx, potTurn, potTotalTurn, heroIsIp, numPlayers ] );

  const resultRiver = useMemo( () => derivePostFlopRps( stacks, prizes, ipIdx, oopIdx, {
    street: 'river', potAcumuladoHero: potRiver, potTotal: potTotalRiver, heroIsIp, numPlayers,
  } ), [ stacks, prizes, ipIdx, oopIdx, potRiver, potTotalRiver, heroIsIp, numPlayers ] );

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
          <h3 style={ { fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-bright)', margin: 0 } }>
            PM Pós-Flop — HU
          </h3>
          <p style={ { fontSize: '0.58rem', color: 'var(--text-dim)', margin: '0.25rem 0 0' } }>
            Componentes da Perspectiva Matemática por street. EV_fold = −investido (1ª ordem).
          </p>
        </div>
        <button
          onClick={ addPhantom }
          style={ {
            background: 'none',
            border: '1px dashed var(--bg-subtle)',
            color: 'var(--text-dim)',
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
          let label = `P${i + 1}`;
          if ( i === ipIdx )
          {
            label = 'IP';
          } else if ( i === oopIdx )
          {
            label = 'OOP';
          }
          return (
            <div key={ label } style={ {
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
              border: `1px solid ${isActive ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)'}`,
              padding: '0.25rem 0.4rem',
              borderRadius: '4px',
              minWidth: '55px'
            } }>
              <span style={ { fontSize: '0.45rem', fontWeight: 800, color: isActive ? 'var(--accent-indigo-light)' : 'var(--text-darker)' } }>{ label }</span>
              <input
                type="number"
                value={ s }
                onChange={ ( e ) => updateStack( i, Number.parseFloat( e.target.value ) || 0 ) }
                style={ {
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: isActive ? 'var(--text-bright)' : 'var(--text-dim)',
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
                background: presetIdx === i ? 'var(--accent-indigo)' : 'rgba(30,41,59,0.8)',
                color: presetIdx === i ? 'var(--text-main)' : 'var(--text-muted)',
              } }
            >
              { p.label }
            </button>
          ) ) }
        </div>

        {/* IP/OOP toggle */ }
        <div style={ { display: 'flex', gap: '0.4rem', alignItems: 'center' } }>
          <span style={ { fontSize: '0.58rem', color: 'var(--text-dim)' } }>Hero é:</span>
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
                background: heroIsIp === isIp ? 'var(--accent-sky)' : 'rgba(30,41,59,0.8)',
                color: heroIsIp === isIp ? 'var(--text-main)' : 'var(--text-muted)',
              } }
            >
              { isIp ? `IP (${preset.ipLabel})` : `OOP (${preset.oopLabel})` }
            </button>
          ) ) }
        </div>

        {/* Jogadores no pot (MW) */ }
        <div style={ { display: 'flex', gap: '0.6rem', alignItems: 'center' } }>
          <span style={ { fontSize: '0.58rem', color: 'var(--text-dim)' } }>Jogadores no pot:</span>
          { [ 2, 3, 4, 5 ].map( n => (
            <button
              key={ n }
              onClick={ () => setNumPlayers( n ) }
              style={ {
                padding: '0.25rem 0.55rem',
                borderRadius: '6px',
                fontSize: '0.58rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: numPlayers === n ? 'var(--accent-violet)' : 'rgba(30,41,59,0.8)',
                color: numPlayers === n ? 'var(--text-main)' : 'var(--text-muted)',
              } }
            >
              { n }{ n > 2 ? ' MW' : ' HU' }
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
                  <span style={ { fontSize: '0.55rem', color: 'var(--accent-indigo)', fontWeight: 700 } }>{ label }</span>
                  <span style={ { fontSize: '0.55rem', color: 'var(--text-muted)', ...MONO } }>{ val.toFixed( 1 ) }bb</span>
                </div>
                <input
                  type="range"
                  min={ min }
                  max={ max }
                  step="0.5"
                  value={ val }
                  onChange={ e => setter( Number( e.target.value ) ) }
                  style={ { width: '100%', accentColor: 'var(--accent-indigo)' } }
                />
                <span style={ { fontSize: '0.5rem', color: 'var(--bg-subtle)' } }>
                  EV_fold = −{ ( val + ( anteSize / 100 ) ).toFixed( 2 ) }bb
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
              isBaseline={ isBaseline }
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
              <span style={ { fontSize: '0.6rem', color: 'var(--text-darker)' } }>
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
        color: 'var(--text-darker)',
        lineHeight: 1.5,
      } }>
        <strong style={ { color: 'var(--text-dim)' } }>D6 Ativo:</strong>{ ' ' }
        PM por street = (Eq×R×Val×gain)−(loss+RIO). Ci = PM÷pot_odds. RIO MW = N²×p_d×pot (ativo quando jogadores &gt; 2).
        Pot Entrapment mede severidade do aprisionamento. potTotal = 2× potAcumuladoHero (simétrico).
      </div>
    </div>
  );
}
