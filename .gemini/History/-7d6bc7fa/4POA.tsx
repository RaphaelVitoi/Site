'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { derivePostFlopRps, type PostFlopResult, type Street } from '@/lib/rpDeriver';
import type { SprStage } from '../engine/types';
import { StreetCard } from '@/components/simulator/ui/StreetCard';

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

interface PostFlopPanelProps {
  anteSize?: number;
  scenarioId?: string;
  initialStacks?: number[];
  initialPrizes?: number[];
  heroIsIp?: boolean;
  activePlayers?: number;
  effectiveSprData?: SprStage[];
  pkoValue?: number;
  ipLabel?: string;
  oopLabel?: string;
}

export default function PostFlopPanel( { anteSize = 12.5, scenarioId, initialStacks, initialPrizes, heroIsIp: heroIsIpProp, activePlayers: activePlayersProp, effectiveSprData, pkoValue = 0, ipLabel, oopLabel }: Readonly<PostFlopPanelProps> ) {
  const isMasterControlled = Boolean( scenarioId && initialStacks?.length && initialPrizes?.length );
  const [presetIdx, setPresetIdx] = useState( 0 );
  const [heroIsIp, setHeroIsIp] = useState<boolean>( heroIsIpProp ?? true );
  const [numPlayers, setNumPlayers] = useState<number>( activePlayersProp ?? 2 );

  const [potFlop, setPotFlop] = useState( () => {
      if (isMasterControlled) {
          const stage = effectiveSprData?.find( stage => stage.name === 'FLOP' )?.potSize;
          if (stage) return stage / 2;
      }
      return 3;
  });
  const [potTurn, setPotTurn] = useState( () => {
      if (isMasterControlled) {
          const stage = effectiveSprData?.find( stage => stage.name === 'TURN' )?.potSize;
          if (stage) return stage / 2;
      }
      return 9;
  });
  const [potRiver, setPotRiver] = useState( () => {
      if (isMasterControlled) {
          const stage = effectiveSprData?.find( stage => stage.name === 'RIVER' )?.potSize;
          if (stage) return stage / 2;
      }
      return 22;
  });

  const [stacks, setStacks] = useState<number[]>( () => isMasterControlled && initialStacks ? [ ...initialStacks ] : PRESETS[0].stacks );
  const [prizes, setPrizes] = useState<number[]>( () => isMasterControlled && initialPrizes ? [ ...initialPrizes ] : PRESETS[0].prizes );

  useEffect( () => {
    if ( !isMasterControlled ) return;

    setStacks( initialStacks ? [ ...initialStacks ] : PRESETS[ 0 ].stacks );
    setPrizes( initialPrizes ? [ ...initialPrizes ] : PRESETS[ 0 ].prizes );
    setHeroIsIp( heroIsIpProp ?? true );
    setNumPlayers( activePlayersProp ?? 2 );

    const flopStage = effectiveSprData?.find( stage => stage.name === 'FLOP' )?.potSize;
    const turnStage = effectiveSprData?.find( stage => stage.name === 'TURN' )?.potSize;
    const riverStage = effectiveSprData?.find( stage => stage.name === 'RIVER' )?.potSize;

    if ( flopStage ) setPotFlop( flopStage / 2 );
    if ( turnStage ) setPotTurn( turnStage / 2 );
    if ( riverStage ) setPotRiver( riverStage / 2 );
  }, [ isMasterControlled, scenarioId, initialStacks, initialPrizes, heroIsIpProp, activePlayersProp, effectiveSprData ] );

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
  const resolvedIpLabel = ipLabel ?? preset.ipLabel;
  const resolvedOopLabel = oopLabel ?? preset.oopLabel;

  const potTotalFlop = potFlop * 2;
  const potTotalTurn = potTurn * 2;
  const potTotalRiver = potRiver * 2;

  const isBaseline = prizes.length <= 1;

  const resultFlop = useMemo( () => derivePostFlopRps( stacks, prizes, ipIdx, oopIdx, {
    street: 'flop', potAcumuladoHero: potFlop, potTotal: potTotalFlop, heroIsIp, numPlayers, bountyValue: pkoValue * 100,
  } ), [stacks, prizes, ipIdx, oopIdx, potFlop, potTotalFlop, heroIsIp, numPlayers, pkoValue] );

  const resultTurn = useMemo( () => derivePostFlopRps( stacks, prizes, ipIdx, oopIdx, {
    street: 'turn', potAcumuladoHero: potTurn, potTotal: potTotalTurn, heroIsIp, numPlayers, bountyValue: pkoValue * 100,
  } ), [stacks, prizes, ipIdx, oopIdx, potTurn, potTotalTurn, heroIsIp, numPlayers, pkoValue] );

  const resultRiver = useMemo( () => derivePostFlopRps( stacks, prizes, ipIdx, oopIdx, {
    street: 'river', potAcumuladoHero: potRiver, potTotal: potTotalRiver, heroIsIp, numPlayers, bountyValue: pkoValue * 100,
  } ), [stacks, prizes, ipIdx, oopIdx, potRiver, potTotalRiver, heroIsIp, numPlayers, pkoValue] );

  const results: [Street, PostFlopResult | null][] = [
    ['flop', resultFlop],
    ['turn', resultTurn],
    ['river', resultRiver],
  ];

  return (
    <div className="glass-panel flex flex-col gap-6 border border-white/5 rounded-2xl shadow-2xl shadow-slate-900/50 bg-(--bg-deep)/80 backdrop-blur-md p-6 transition-all duration-500 hover:border-accent-indigo/30">

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="max-w-xl">
          <h3 className="text-[0.9rem] font-black text-text-bright m-0 tracking-tight">
            PM Pos-Flop - HU <span className="text-accent-indigo ml-2 opacity-50 font-mono">Quantum D6</span>
          </h3>
          <p className="text-[0.62rem] text-text-dim mt-1.5 mb-0 leading-relaxed line-clamp-2 sm:line-clamp-none">
            Analise de Perspectiva Matematica por street. O <code className="text-accent-danger/80">EV_fold</code> atua como ancora de primeira ordem, enquanto a <code className="text-accent-indigo-light">RP</code> dita a gravidade do cenario.
          </p>
        </div>
        <button
          onClick={ addPhantom }
          disabled={ isMasterControlled }
          className="whitespace-nowrap bg-white/5 border border-dashed border-white/10 text-text-dim text-[0.55rem] font-bold px-3 py-1.5 rounded-lg cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + Add Phantom Stack
        </button>
      </div>

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
                disabled={ isMasterControlled }
                className={ `w-full bg-transparent border-none text-[0.7rem] font-bold outline-none font-mono tabular-nums ${isActive ? 'text-text-bright' : 'text-text-dim'} disabled:opacity-80` }
              />
            </div>
          );
        } ) }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white/5 rounded-xl p-5 border border-white/5">

        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="space-y-3">
            <span className="text-[0.55rem] font-black text-text-darker uppercase tracking-[0.2em] block">Cenarios Predeterminados</span>
            <div className="flex gap-2 flex-wrap">
              { PRESETS.map( ( p, i ) => (
                <button
                  key={ p.label }
                  onClick={ () => handlePresetChange( i ) }
                  disabled={ isMasterControlled }
                  className={ `px-4 py-2 rounded-lg text-[0.58rem] font-black border transition-all duration-300 ease-out cursor-pointer ${presetIdx === i ? 'bg-gradient-to-r from-accent-indigo to-indigo-600 border-accent-indigo text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] scale-105' : 'bg-slate-800/50 border-white/5 text-text-muted hover:bg-slate-700/50 hover:border-white/10 hover:text-white'} disabled:opacity-50 disabled:cursor-not-allowed` }
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
                  disabled={ isMasterControlled }
                  className={ `flex-1 px-4 py-2 rounded-lg text-[0.58rem] font-black border transition-all duration-300 ease-out cursor-pointer ${heroIsIp === isIp ? 'bg-gradient-to-r from-accent-sky to-sky-600 border-accent-sky text-white shadow-[0_0_15px_rgba(56,189,248,0.4)] scale-105' : 'bg-slate-800/50 border-white/5 text-text-muted hover:bg-slate-700/50 hover:text-white'} disabled:opacity-50 disabled:cursor-not-allowed` }
                >
                  { isIp ? `IP (${resolvedIpLabel})` : `OOP (${resolvedOopLabel})` }
                </button>
              ) ) }
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[0.55rem] font-black text-text-darker uppercase tracking-[0.2em] block">Entropia (N2)</span>
            <div className="flex gap-1.5">
              { [2, 3, 4, 5].map( n => (
                <button
                  key={ n }
                  onClick={ () => setNumPlayers( n ) }
                  disabled={ isMasterControlled }
                  className={ `flex-1 py-1.5 rounded-lg text-[0.6rem] font-black border transition-all cursor-pointer ${numPlayers === n ? 'bg-accent-violet border-accent-violet text-text-main' : 'bg-slate-800/50 border-white/5 text-text-muted hover:bg-slate-700/50'} disabled:opacity-50 disabled:cursor-not-allowed` }
                >
                  { n }{ n > 2 ? ' MW' : ' HU' }
                </button>
              ) ) }
            </div>
          </div>
        </div>

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
                    disabled={ isMasterControlled }
                    className="w-full accent-accent-indigo h-1.5 bg-black/60 rounded-full appearance-none cursor-pointer border border-white/5 hover:border-accent-indigo/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="flex justify-between text-[0.5rem] font-bold">
                   <span className="text-text-darker uppercase tracking-tighter">EV_fold:</span>
                   <span className="text-accent-danger font-mono tabular-nums">-{ ( val + ( anteSize / 100 ) ).toFixed( 2 ) } bb</span>
                </div>
              </div>
            )
          ) }
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        { results.map( ( [street, result] ) =>
          result ? (
            <StreetCard
              key={ street }
              street={ street }
              result={ result }
              ipLabel={ resolvedIpLabel }
              oopLabel={ resolvedOopLabel }
              heroIsIp={ heroIsIp }
              isBaseline={ isBaseline }
            />
          ) : (
            <div key={ street } className="bg-slate-900/40 border border-slate-600/30 rounded-xl p-6 flex flex-col items-center justify-center text-center opacity-40">
              <i className="fa-solid fa-circle-nodes text-text-darker mb-3 text-lg"></i>
              <span className="text-[0.6rem] font-bold text-text-darker uppercase tracking-widest">
                { STREET_LABEL[street] } - Vacuo ICM
              </span>
            </div>
          )
        ) }
      </div>

      <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl py-4 px-5 shadow-inner group">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-indigo animate-pulse"></div>
          <strong className="text-[0.6rem] font-black text-text-dim uppercase tracking-widest">Axioma Quantum D6</strong>
        </div>
        <p className="text-[0.6rem] text-indigo-200/60 leading-relaxed m-0 italic">
          A Perspectiva Matematica (PM) integra a distorcao do Teto de Nash e a erosao do tempo.
          Equacao: <code className="text-accent-indigo-light mx-1 font-bold">(Eq x R x Val x Gain) - (Loss + RIO)</code>.
          A insolvencia <code className="text-accent-danger mx-1 font-bold">Ci</code> e a tracao <code className="text-accent-sky mx-1 font-bold">RP</code> ditam a sobrevivencia.{' '}
          <span className="block mt-2 opacity-40 group-hover:opacity-100 transition-opacity">
            Distorcao IP/OOP baseada em Leverage Dinamico. RIO MW escalam quadraticamente (N2).
          </span>
        </p>
      </div>
    </div>
  );
}
