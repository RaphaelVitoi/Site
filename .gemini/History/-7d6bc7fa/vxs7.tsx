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
    stacks: [40, 55, 9.4, 52.4, 22.2, 7, 44.3, 24.3, 13.4],
    prizes: [237.34, 170.96, 135.17, 109.99, 90.28, 73.95, 59.92, 47.56, 36.47],
    ipIndex: 0,
    oopIndex: 1,
    ipLabel: 'BTN 40bb',
    oopLabel: 'BB 55bb',
  },
  {
    label: 'Pacto Silencioso',
    stacks: [65, 70, 15, 12, 8],
    prizes: [237.34, 170.96, 135.17, 109.99, 90.28],
    ipIndex: 0,
    oopIndex: 1,
    ipLabel: 'VP 65bb',
    oopLabel: 'CL 70bb',
  },
  {
    label: 'HU Puro (ChipEV)',
    stacks: [55, 45],
    prizes: [65, 35],
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

function MetricRow( {
  label,
  value,
  colorClass,
  hint,
}: Readonly<{
  label: string;
  value: string;
  colorClass?: string;
  hint?: string;
}> ) {
  return (
    <div className="flex justify-between items-baseline py-1.5 border-b border-white/5">
      <span className="text-[0.6rem] text-text-dim">
        { label }
        { hint && (
          <span className="ml-1 text-[0.55rem] text-text-dim">
            { hint }
          </span>
        ) }
      </span>
      <span className={ `text-[0.7rem] font-bold font-mono ${colorClass ?? 'text-text-bright'}` }>
        { value }
      </span>
    </div>
  );
}

function getSprColorClass( spr: number ): string {
  if ( spr < 2 ) return 'text-accent-danger';
  if ( spr < 5 ) return 'text-accent-amber';
  return 'text-accent-emerald';
}

function getRealizationHint( street: Street, heroIsIp: boolean ): string {
  if ( street === 'river' ) return 'binário';
  return heroIsIp ? 'IP' : 'OOP';
}

function getPotEntrapmentColorClass( ratio: number ): string {
  if ( ratio > 0.5 ) return 'text-accent-danger';
  if ( ratio > 0.25 ) return 'text-accent-amber';
  return 'text-text-muted';
}

function formatEvFold( evFold: number ) {
  const isPositive = evFold >= 0;
  return {
    text: `${isPositive ? '+' : ''}${evFold.toFixed( 2 )} bb`,
    colorClass: isPositive ? 'text-accent-emerald' : 'text-accent-danger'
  };
}

function formatDeltaRp( delta: number ) {
  const isPositive = delta >= 0;
  return {
    text: `${isPositive ? '+' : ''}${delta.toFixed( 1 )}%`,
    colorClass: delta > 0 ? 'text-accent-amber' : 'text-text-muted'
  };
}

function formatPm( pm: number ) {
  const isPositive = pm >= 0;
  return {
    text: `${isPositive ? '+' : ''}${pm.toFixed( 2 )}`,
    colorClass: isPositive ? 'text-accent-emerald' : 'text-accent-danger'
  };
}

function getCiStyle( ci: number ) {
  const isSolvent = ci >= 1;
  return {
    colorClass: isSolvent ? 'text-accent-emerald' : 'text-accent-danger',
    hint: isSolvent ? 'solvente' : 'insolvente'
  };
}

function getCardData(
  result: PostFlopResult,
  heroIsIp: boolean,
  isBaseline: boolean,
  ipLabel: string,
  oopLabel: string
) {
  const heroLabel = heroIsIp ? ipLabel : oopLabel;
  const villainLabel = heroIsIp ? oopLabel : ipLabel;

  if ( isBaseline ) {
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

function StreetCard( {
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

  const sprColorClass = getSprColorClass( result.sprRemanescente );
  const realizationHint = getRealizationHint( street, heroIsIp );
  const entrapmentColorClass = getPotEntrapmentColorClass( result.potEntrapmentRatio );

  const valColorClass = result.valuationStreet < 1 ? 'text-accent-amber' : 'text-accent-emerald';
  const sprText = result.sprRemanescente === Infinity ? '∞' : result.sprRemanescente.toFixed( 1 );

  return (
    <div className="bg-slate-900/70 border border-indigo-500/20 rounded-xl p-3.5">
      <div className="text-[0.55rem] font-black text-accent-indigo uppercase tracking-[0.15em] mb-2.5">
        { STREET_LABEL[street] }
      </div>

      <MetricRow
        label="EV_fold"
        value={ evFoldData.text }
        colorClass={ evFoldData.colorClass }
        hint="1ª ordem — dominante"
      />
      <MetricRow
        label="SPR remanescente"
        value={ sprText }
        colorClass={ sprColorClass }
        hint="stack÷pot"
      />
      <MetricRow
        label="R (realização)"
        value={ `${( result.rStreet * 100 ).toFixed( 0 )}%` }
        colorClass="text-text-muted"
        hint={ realizationHint }
      />
      <MetricRow
        label={ `RP ${heroLabel}` }
        value={ `${heroRp.toFixed( 1 )}%` }
        colorClass="text-accent-indigo"
      />
      <MetricRow
        label={ `RP ${villainLabel}` }
        value={ `${villainRp.toFixed( 1 )}%` }
        colorClass="text-accent-indigo-light"
      />
      <MetricRow
        label="ΔRP"
        value={ deltaRpData.text }
        colorClass={ deltaRpData.colorClass }
        hint="IP − OOP"
      />

      {/* D6: Componentes PM por street */ }
      <div className="mt-1.5 pt-1.5 border-t border-indigo-500/15">
        <MetricRow
          label="PM street"
          value={ pmData.text }
          colorClass={ pmData.colorClass }
          hint="(Eq×R×Val×gain)−(loss+RIO)"
        />
        <MetricRow
          label="Ci street"
          value={ result.ciStreet.toFixed( 3 ) }
          colorClass={ ciData.colorClass }
          hint={ ciData.hint }
        />
        <MetricRow
          label="Teto de Nash"
          value={ `${( ( result as any ).threshEqStreet * 100 ).toFixed( 1 )}%` }
          colorClass="text-accent-sky"
          hint="máx 41%"
        />
        <MetricRow
          label="Valuation ICM"
          value={ result.valuationStreet.toFixed( 3 ) }
          colorClass={ valColorClass }
          hint="gain÷loss"
        />
        { result.rioMwStreet > 0 && (
          <MetricRow
            label="RIO MW"
            value={ result.rioMwStreet.toFixed( 2 ) }
            colorClass="text-accent-danger"
            hint="N²×p_d×pot"
          />
        ) }
        <MetricRow
          label="Pot Entrapment"
          value={ `${( result.potEntrapmentRatio * 100 ).toFixed( 0 )}%` }
          colorClass={ entrapmentColorClass }
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

export default function PostFlopPanel( { anteSize = 12.5 }: Readonly<PostFlopPanelProps> ) {
  const [presetIdx, setPresetIdx] = useState( 0 );
  const [heroIsIp, setHeroIsIp] = useState( true );
  const [numPlayers, setNumPlayers] = useState( 2 );

  // potAcumuladoHero por street (o usuário controla cada street individualmente)
  const [potFlop, setPotFlop] = useState( 3 );
  const [potTurn, setPotTurn] = useState( 9 );
  const [potRiver, setPotRiver] = useState( 22 );

  // Estado local para stacks e prizes permitindo edição/phantom stacks
  const [stacks, setStacks] = useState<number[]>( PRESETS[0].stacks );
  const [prizes, setPrizes] = useState<number[]>( PRESETS[0].prizes );

  // Atualiza stacks locais quando o preset muda
  const handlePresetChange = ( idx: number ) => {
    setPresetIdx( idx );
    setStacks( PRESETS[idx].stacks );
    setPrizes( PRESETS[idx].prizes );
  };

  const addPhantom = () => {
    setStacks( prev => [...prev, 20] );
    if ( prizes.length < stacks.length + 1 ) {
      setPrizes( prev => [...prev, Math.max( 1, ( prev.at( -1 ) || 10 ) * 0.8 )] );
    }
  };

  const updateStack = ( idx: number, val: number ) => {
    const newStacks = [...stacks];
    newStacks[idx] = Math.max( 0.1, val );
    setStacks( newStacks );
  };

  const preset = PRESETS[presetIdx];
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
  } ), [stacks, prizes, ipIdx, oopIdx, potFlop, potTotalFlop, heroIsIp, numPlayers] );

  const resultTurn = useMemo( () => derivePostFlopRps( stacks, prizes, ipIdx, oopIdx, {
    street: 'turn', potAcumuladoHero: potTurn, potTotal: potTotalTurn, heroIsIp, numPlayers,
  } ), [stacks, prizes, ipIdx, oopIdx, potTurn, potTotalTurn, heroIsIp, numPlayers] );

  const resultRiver = useMemo( () => derivePostFlopRps( stacks, prizes, ipIdx, oopIdx, {
    street: 'river', potAcumuladoHero: potRiver, potTotal: potTotalRiver, heroIsIp, numPlayers,
  } ), [stacks, prizes, ipIdx, oopIdx, potRiver, potTotalRiver, heroIsIp, numPlayers] );

  const results: [Street, PostFlopResult | null][] = [
    ['flop', resultFlop],
    ['turn', resultTurn],
    ['river', resultRiver],
  ];

  return (
    <div className="p-5 flex flex-col gap-5">

      {/* Header */ }
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-[0.8rem] font-extrabold text-text-bright m-0">
            PM Pós-Flop — HU
          </h3>
          <p className="text-[0.58rem] text-text-dim mt-1 mb-0">
            Componentes da Perspectiva Matemática por street. EV_fold = −investido (1ª ordem).
          </p>
        </div>
        <button
          onClick={ addPhantom }
          className="bg-transparent border border-dashed border-bg-subtle text-text-dim text-[0.55rem] px-2 py-1 rounded cursor-pointer hover:bg-white/5 transition-colors"
        >
          + Add Phantom Stack
        </button>
      </div>

      {/* Editor de Stacks (Contexto ICM) */ }
      <div className="flex flex-wrap gap-1.5 bg-slate-900/40 p-2.5 rounded-lg">
        { stacks.map( ( s, i ) => {
          const isActive = i === ipIdx || i === oopIdx;
          let label = `P${i + 1}`;
          if ( i === ipIdx ) {
            label = 'IP';
          } else if ( i === oopIdx ) {
            label = 'OOP';
          }
          return (
            <div key={ label } className={ `flex flex-col gap-0.5 px-1.5 py-1 rounded min-w-13.75 border ${isActive ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-transparent border-white/5'}` }>
              <span className={ `text-[0.45rem] font-extrabold ${isActive ? 'text-accent-indigo-light' : 'text-text-darker'}` }>{ label }</span>
              <input
                type="number"
                value={ s }
                onChange={ ( e ) => updateStack( i, Number.parseFloat( e.target.value ) || 0 ) }
                className={ `w-full bg-transparent border-none text-[0.6rem] font-bold outline-none font-mono ${isActive ? 'text-text-bright' : 'text-text-dim'}` }
              />
            </div>
          );
        } ) }
      </div>

      {/* Controles */ }
      <div className="flex flex-col gap-3">

        {/* Preset */ }
        <div className="flex gap-1.5 flex-wrap">
          { PRESETS.map( ( p, i ) => (
            <button
              key={ p.label }
              onClick={ () => handlePresetChange( i ) }
              className={ `px-3 py-1 rounded-md text-[0.58rem] font-bold border-none cursor-pointer transition-colors ${presetIdx === i ? 'bg-accent-indigo text-text-main' : 'bg-slate-800/80 text-text-muted hover:bg-slate-700/80'}` }
            >
              { p.label }
            </button>
          ) ) }
        </div>

        {/* IP/OOP toggle */ }
        <div className="flex gap-1.5 items-center">
          <span className="text-[0.58rem] text-text-dim">Hero é:</span>
          { [true, false].map( isIp => (
            <button
              key={ String( isIp ) }
              onClick={ () => setHeroIsIp( isIp ) }
              className={ `px-2.5 py-1 rounded-md text-[0.58rem] font-bold border-none cursor-pointer transition-colors ${heroIsIp === isIp ? 'bg-accent-sky text-text-main' : 'bg-slate-800/80 text-text-muted hover:bg-slate-700/80'}` }
            >
              { isIp ? `IP (${preset.ipLabel})` : `OOP (${preset.oopLabel})` }
            </button>
          ) ) }
        </div>

        {/* Jogadores no pot (MW) */ }
        <div className="flex gap-2 items-center">
          <span className="text-[0.58rem] text-text-dim">Jogadores no pot:</span>
          { [2, 3, 4, 5].map( n => (
            <button
              key={ n }
              onClick={ () => setNumPlayers( n ) }
              className={ `px-2 py-1 rounded-md text-[0.58rem] font-bold border-none cursor-pointer transition-colors ${numPlayers === n ? 'bg-accent-violet text-text-main' : 'bg-slate-800/80 text-text-muted hover:bg-slate-700/80'}` }
            >
              { n }{ n > 2 ? ' MW' : ' HU' }
            </button>
          ) ) }
        </div>

        {/* Sliders de potAcumuladoHero por street */ }
        <div className="grid grid-cols-3 gap-2.5">
          { ( [
            ['FLOP', potFlop, setPotFlop, 1, Math.min( stacks[ipIdx], stacks[oopIdx] ) * 0.3],
            ['TURN', potTurn, setPotTurn, 1, Math.min( stacks[ipIdx], stacks[oopIdx] ) * 0.6],
            ['RIVER', potRiver, setPotRiver, 1, Math.min( stacks[ipIdx], stacks[oopIdx] )],
          ] as [string, number, React.Dispatch<React.SetStateAction<number>>, number, number][] ).map(
            ( [label, val, setter, min, max] ) => (
              <div key={ label } className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-[0.55rem] text-accent-indigo font-bold">{ label }</span>
                  <span className="text-[0.55rem] text-text-muted font-mono">{ val.toFixed( 1 ) }bb</span>
                </div>
                <input
                  type="range"
                  min={ min }
                  max={ max }
                  step="0.5"
                  value={ val }
                  onChange={ e => setter( Number( e.target.value ) ) }
                  className="w-full accent-accent-indigo"
                />
                <span className="text-[0.5rem] text-bg-subtle">
                  EV_fold = −{ ( val + ( anteSize / 100 ) ).toFixed( 2 ) }bb
                </span>
              </div>
            )
          ) }
        </div>
      </div>

      {/* Cards por street */ }
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        { results.map( ( [street, result] ) =>
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
            <div key={ street } className="bg-slate-900/40 border border-slate-600/30 rounded-xl p-3.5 flex items-center justify-center">
              <span className="text-[0.6rem] text-text-darker">
                { STREET_LABEL[street] } — sem distorção ICM
              </span>
            </div>
          )
        ) }
      </div>

      {/* Nota metodológica */ }
      <div className="bg-slate-900/40 border border-slate-600/20 rounded-lg py-2.5 px-3 text-[0.55rem] text-text-darker leading-relaxed">
        <strong className="text-text-dim">D6 Ativo:</strong>{ ' ' }
        PM por street = (Eq×R×Val×gain)−(loss+RIO). Ci = PM÷pot_odds. RIO MW = N²×p_d×pot (ativo quando jogadores &gt; 2).
        Pot Entrapment mede severidade do aprisionamento. potTotal = 2× potAcumuladoHero (simétrico).
      </div>
    </div>
  );
}
