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
    <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0 group/row">
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <span className="text-[0.65rem] font-bold text-text-muted uppercase tracking-wider truncate" title={label}>
          { label }
        </span>
        { hint && (
          <span className="text-[0.55rem] text-text-darker italic opacity-0 group-hover/row:opacity-100 transition-opacity hidden sm:inline">
            ({ hint })
          </span>
        ) }
      </div>
      <span className={ `text-[0.75rem] font-black font-mono tabular-nums whitespace-nowrap ml-2 ${colorClass ?? 'text-text-bright'}` }>
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
    <div className="bg-bg-deep border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col gap-3 group/card hover:bg-bg-panel/40 hover:border-accent-indigo/30 transition-all duration-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-accent-indigo/5 blur-3xl -mr-8 -mt-8 rounded-full pointer-events-none transition-opacity opacity-0 group-hover/card:opacity-100"></div>

      <div className="flex justify-between items-center pb-2 border-b border-white/5">
        <h4 className="text-[0.65rem] font-black text-accent-indigo uppercase tracking-[0.2em] m-0">
          { STREET_LABEL[street] }
        </h4>
      </div>

      <div className="space-y-1">
        <MetricRow
          label="EV_fold"
          value={ evFoldData.text }
          colorClass={ evFoldData.colorClass }
          hint="âncora"
        />
        <MetricRow
          label="SPR rem"
          value={ sprText }
          colorClass={ sprColorClass }
          hint="stack/pot"
        />
        <MetricRow
          label="R (Realiz.)"
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
          hint="IP−OOP"
        />
      </div>

      {/* D6: Componentes PM por street */ }
      <div className="mt-2 pt-3 border-t border-dashed border-white/10 space-y-1">
        <MetricRow
          label="PM (Persp.)"
          value={ pmData.text }
          colorClass={ pmData.colorClass }
          hint="Eq×R×Val−L"
        />
        <MetricRow
          label="Ci (Solvên.)"
          value={ result.ciStreet.toFixed( 3 ) }
          colorClass={ ciData.colorClass }
          hint={ ciData.hint }
        />
        <MetricRow
          label="Teto Nash"
          value={ `${( ( result as any ).threshEqStreet * 100 ).toFixed( 1 )}%` }
          colorClass="text-accent-sky"
        />
        <MetricRow
          label="Valuation"
          value={ result.valuationStreet.toFixed( 3 ) }
          colorClass={ valColorClass }
          hint="gain/loss"
        />
        { result.rioMwStreet > 0 && (
          <MetricRow
            label="RIO MW"
            value={ result.rioMwStreet.toFixed( 2 ) }
            colorClass="text-accent-danger"
          />
        ) }
        <MetricRow
          label="Entrapment"
          value={ `${( result.potEntrapmentRatio * 100 ).toFixed( 0 )}%` }
          colorClass={ entrapmentColorClass }
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
    <div className="glass-panel flex flex-col gap-6 border border-white/5 rounded-2xl shadow-2xl shadow-slate-900/50 bg-(--bg-deep)/80 backdrop-blur-md p-6 transition-all duration-500 hover:border-accent-indigo/30">

      {/* Header */ }
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="max-w-xl">
          <h3 className="text-[0.9rem] font-black text-text-bright m-0 tracking-tight">
            PM Pós-Flop — HU <span className="text-accent-indigo ml-2 opacity-50 font-mono">Quantum D6</span>
          </h3>
          <p className="text-[0.62rem] text-text-dim mt-1.5 mb-0 leading-relaxed line-clamp-2 sm:line-clamp-none">
            Análise de Perspectiva Matemática por street. O <code className="text-accent-danger/80">EV_fold</code> atua como âncora de primeira ordem, enquanto a <code className="text-accent-indigo-light">RP</code> dita a gravidade do cenário.
          </p>
        </div>
        <button
          onClick={ addPhantom }
          className="whitespace-nowrap bg-white/5 border border-dashed border-white/10 text-text-dim text-[0.55rem] font-bold px-3 py-1.5 rounded-lg cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
        >
          + Add Phantom Stack
        </button>
      </div>

      {/* Editor de Stacks (Contexto ICM) */}
      <div className="flex flex-wrap gap-2 bg-black/40 border border-white/5 p-4 rounded-xl shadow-inner">
        { stacks.map( ( s, i ) => {
          const isActive = i === ipIdx || i === oopIdx;
          let label = `P${i + 1}`;
          if ( i === ipIdx ) label = 'IP';
          else if ( i === oopIdx ) label = 'OOP';

          return (
            <div key={ label } className={ `flex flex-col gap-1 px-2.5 py-1.5 rounded-lg min-w-17.5 border transition-all ${isActive ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-transparent border-white/5 opacity-50 hover:opacity-100'}` }>
              <span className={ `text-[0.45rem] font-black uppercase tracking-widest ${isActive ? 'text-accent-indigo-light' : 'text-text-dim'}` }>{ label }</span>
              <input
                type="number"
                value={ s }
                onChange={ ( e ) => updateStack( i, Number.parseFloat( e.target.value ) || 0 ) }
                className={ `w-full bg-transparent border-none text-[0.7rem] font-bold outline-none font-mono tabular-nums ${isActive ? 'text-text-bright' : 'text-text-dim'}` }
              />
            </div>
          );
        } ) }
      </div>

      {/* Controles */ }
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white/5 rounded-xl p-5 border border-white/5">

        {/* Lado Esquerdo: Configurações */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="space-y-3">
            <span className="text-[0.55rem] font-black text-text-darker uppercase tracking-[0.2em] block">Cenários Predeterminados</span>
            <div className="flex gap-2 flex-wrap">
              { PRESETS.map( ( p, i ) => (
                <button
                  key={ p.label }
                  onClick={ () => handlePresetChange( i ) }
                  className={ `px-3 py-1.5 rounded-lg text-[0.58rem] font-black border transition-all cursor-pointer ${presetIdx === i ? 'bg-accent-indigo border-accent-indigo text-text-main shadow-lg shadow-accent-indigo/20' : 'bg-slate-800/50 border-white/5 text-text-muted hover:bg-slate-700/50 hover:border-white/10'}` }
                >
                  { p.label }
                </button>
              ) ) }
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[0.55rem] font-black text-text-darker uppercase tracking-[0.2em] block">Posicionamento Hero</span>
            <div className="flex gap-2">
              { [true, false].map( isIp => (
                <button
                  key={ String( isIp ) }
                  onClick={ () => setHeroIsIp( isIp ) }
                  className={ `flex-1 px-3 py-1.5 rounded-lg text-[0.58rem] font-black border transition-all cursor-pointer ${heroIsIp === isIp ? 'bg-accent-sky border-accent-sky text-text-main shadow-lg shadow-accent-sky/20' : 'bg-slate-800/50 border-white/5 text-text-muted hover:bg-slate-700/50'}` }
                >
                  { isIp ? `IP (${preset.ipLabel})` : `OOP (${preset.oopLabel})` }
                </button>
              ) ) }
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[0.55rem] font-black text-text-darker uppercase tracking-[0.2em] block">Entropia (N²)</span>
            <div className="flex gap-1.5">
              { [2, 3, 4, 5].map( n => (
                <button
                  key={ n }
                  onClick={ () => setNumPlayers( n ) }
                  className={ `flex-1 py-1.5 rounded-lg text-[0.6rem] font-black border transition-all cursor-pointer ${numPlayers === n ? 'bg-accent-violet border-accent-violet text-text-main' : 'bg-slate-800/50 border-white/5 text-text-muted hover:bg-slate-700/50'}` }
                >
                  { n }{ n > 2 ? ' MW' : ' HU' }
                </button>
              ) ) }
            </div>
          </div>
        </div>

        {/* Lado Direito: Sliders de Investimento (As Barras de Progresso) */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          { ( [
            ['FLOP', potFlop, setPotFlop, 1, Math.min( stacks[ipIdx], stacks[oopIdx] ) * 0.3],
            ['TURN', potTurn, setPotTurn, 1, Math.min( stacks[ipIdx], stacks[oopIdx] ) * 0.6],
            ['RIVER', potRiver, setPotRiver, 1, Math.min( stacks[ipIdx], stacks[oopIdx] )],
          ] as [string, number, React.Dispatch<React.SetStateAction<number>>, number, number][] ).map(
            ( [label, val, setter, min, max] ) => (
              <div key={ label } className="flex flex-col gap-2 group">
                <div className="flex justify-between items-end">
                  <span className="text-[0.6rem] text-accent-indigo font-black uppercase tracking-widest">{ label }</span>
                  <span className="text-[0.7rem] text-text-bright font-mono font-bold tabular-nums bg-black/40 px-1.5 rounded border border-white/5">{ val.toFixed( 1 ) } <span className="text-[0.55rem] text-text-dim ml-0.5">bb</span></span>
                </div>
                <div className="relative pt-1">
                  <input
                    type="range"
                    min={ min }
                    max={ max }
                    step="0.5"
                    value={ val }
                    onChange={ e => setter( Number( e.target.value ) ) }
                    className="w-full accent-accent-indigo h-1.5 bg-black/60 rounded-full appearance-none cursor-pointer border border-white/5 hover:border-accent-indigo/30 transition-all"
                  />
                </div>
                <div className="flex justify-between text-[0.5rem] font-bold">
                   <span className="text-text-darker uppercase tracking-tighter">EV_fold:</span>
                   <span className="text-accent-danger font-mono tabular-nums">−{ ( val + ( anteSize / 100 ) ).toFixed( 2 ) } bb</span>
                </div>
              </div>
            )
          ) }
        </div>
      </div>

      {/* Cards por street */ }
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
            <div key={ street } className="bg-slate-900/40 border border-slate-600/30 rounded-xl p-6 flex flex-col items-center justify-center text-center opacity-40">
              <i className="fa-solid fa-circle-nodes text-text-darker mb-3 text-lg"></i>
              <span className="text-[0.6rem] font-bold text-text-darker uppercase tracking-widest">
                { STREET_LABEL[street] } — Vácuo ICM
              </span>
            </div>
          )
        ) }
      </div>

      {/* Nota metodológica */}
      <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl py-4 px-5 shadow-inner group">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-indigo animate-pulse"></div>
          <strong className="text-[0.6rem] font-black text-text-dim uppercase tracking-widest">Axioma Quantum D6</strong>
        </div>
        <p className="text-[0.6rem] text-indigo-200/60 leading-relaxed m-0 italic">
          A Perspectiva Matemática (PM) integra a distorsão do Teto de Nash e a erosão do tempo.
          Equação: <code className="text-accent-indigo-light mx-1 font-bold">(Eq × R × Val × Gain) − (Loss + RIO)</code>.
          A insolvência <code className="text-accent-danger mx-1 font-bold">Cᵢ</code> e a tração <code className="text-accent-sky mx-1 font-bold">RP</code> ditam a sobrevivência.{' '}
          <span className="block mt-2 opacity-40 group-hover:opacity-100 transition-opacity">
            Distorção IP/OOP baseada em Leverage Dinâmico. RIO MW escalam quadraticamente (N²).
          </span>
        </p>
      </div>
    </div>
  );
}
