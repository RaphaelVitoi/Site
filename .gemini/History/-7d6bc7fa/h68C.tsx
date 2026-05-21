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
  const [isLocked, setIsLocked] = useState( isMasterControlled );
  const [presetIdx, setPresetIdx] = useState( 0 );
  const [heroIsIp, setHeroIsIp] = useState<boolean>( heroIsIpProp ?? true );
  const [numPlayers, setNumPlayers] = useState<number>( activePlayersProp ?? 2 );

  const [potFlop, setPotFlop] = useState( 3 );
  const [potTurn, setPotTurn] = useState( 9 );
  const [potRiver, setPotRiver] = useState( 22 );

  const [stacks, setStacks] = useState<number[]>( PRESETS[0].stacks );
  const [prizes, setPrizes] = useState<number[]>( PRESETS[0].prizes );

  // Sincronização Inteligente SOTA
  useEffect( () => {
    if ( !isMasterControlled || !isLocked ) return;

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
  }, [ isLocked, isMasterControlled, scenarioId, initialStacks, initialPrizes, heroIsIpProp, activePlayersProp, effectiveSprData ] );

  const handlePresetChange = ( idx: number ) => {
    setPresetIdx( idx );
    setStacks( PRESETS[idx].stacks );
    setPrizes( PRESETS[idx].prizes );
    setIsLocked( false );
  };

  const addPhantom = () => {
    setStacks( prev => [...prev, 20] );
    if ( prizes.length < stacks.length + 1 ) {
      setPrizes( prev => [...prev, Math.max( 1, ( prev.at( -1 ) || 10 ) * 0.8 )] );
    }
    setIsLocked( false );
  };

  const updateStack = ( idx: number, val: number ) => {
    const newStacks = [...stacks];
    newStacks[idx] = Math.max( 0.1, val );
    setStacks( newStacks );
    setIsLocked( false );
  };

  const preset = PRESETS[presetIdx];
  const ipIdx = preset.ipIndex;
  const oopIdx = preset.oopIndex;
  const resolvedIpLabel = ipLabel ?? (heroIsIp ? 'HERO' : 'VILÃO');
  const resolvedOopLabel = oopLabel ?? (heroIsIp ? 'VILÃO' : 'HERO');

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
    <div className="glass-panel flex flex-col gap-8 border border-white/10 rounded-3xl shadow-2xl bg-bg-panel/90 backdrop-blur-2xl p-8 lg:p-10 transition-all duration-500 hover:border-accent-indigo/40 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent-indigo/5 blur-[100px] pointer-events-none rounded-full" />

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 relative z-10">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-3">
             <span className="text-[0.6rem] font-black text-accent-indigo-light uppercase tracking-widest bg-accent-indigo/10 border border-accent-indigo/20 px-2.5 py-1 rounded-md shadow-inner">Post-Flop Analyzer</span>
             <h3 className="text-lg font-black text-white m-0 tracking-tight uppercase">
               Laboratório de Perspectiva <span className="text-accent-indigo opacity-60 font-mono">v4.2</span>
             </h3>
          </div>
          <p className="text-[0.75rem] text-text-muted mt-2 mb-0 leading-relaxed font-medium">
            Mapeamento termodinâmico de EV_fold e Risk Premium. Ao contrário do ChipEV, aqui o descarte (<code className="text-accent-danger/80">Fold</code>) possui valor intrínseco de sobrevivência baseado no Payjump e na inércia da mesa.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-black/40 p-2 rounded-2xl border border-white/5 shadow-inner">
           <button
             onClick={ () => setIsLocked(!isLocked) }
             className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[0.6rem] font-black uppercase tracking-widest transition-all ${isLocked ? 'bg-accent-indigo text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-transparent text-text-dim hover:text-white'}`}
           >
             <i className={`fa-solid ${isLocked ? 'fa-link' : 'fa-link-slash'}`} />
             { isLocked ? 'Sincronizado' : 'Manual (Lab)' }
           </button>
           <button
             onClick={ addPhantom }
             className="flex items-center gap-2 px-4 py-2 rounded-xl text-[0.6rem] font-black uppercase tracking-widest bg-white/5 text-text-dim hover:text-white hover:bg-white/10 transition-all border border-white/5"
           >
             <i className="fa-solid fa-plus" /> Phantom Stack
           </button>
        </div>
      </div>

      {/* SOTA: Stack Manager Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 xl:grid-cols-9 gap-3 bg-black/50 border border-white/5 p-5 rounded-2xl shadow-inner relative z-10">
        { stacks.map( ( s, i ) => {
          const isActive = i === ipIdx || i === oopIdx;
          let label = `P${i + 1}`;
          if ( i === ipIdx ) label = 'IP (AGR)';
          else if ( i === oopIdx ) label = 'OOP (DEF)';

          return (
            <div key={`${label}-${i}`} className={ `flex flex-col gap-1.5 px-3 py-2 rounded-xl border transition-all ${isActive ? 'bg-accent-indigo/10 border-accent-indigo/30 ring-1 ring-accent-indigo/20' : 'bg-transparent border-white/5 opacity-40 hover:opacity-100'}` }>
              <span className={ `text-[0.5rem] font-black uppercase tracking-tighter ${isActive ? 'text-accent-indigo-light' : 'text-text-darker'}` }>{ label }</span>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  value={ s }
                  onChange={ ( e ) => updateStack( i, Number.parseFloat( e.target.value ) || 0 ) }
                  className={ `w-full bg-transparent border-none text-[0.8rem] font-black outline-none font-mono tabular-nums ${isActive ? 'text-white' : 'text-text-dim'}` }
                />
                <span className="text-[0.5rem] font-black text-text-darker uppercase">bb</span>
              </div>
            </div>
          );
        } ) }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="space-y-3">
            <span className="text-[0.6rem] font-black text-text-darker uppercase tracking-[0.2em] flex items-center gap-2"><i className="fa-solid fa-flask-vial text-accent-indigo" /> Presets de Laboratório</span>
            <div className="flex gap-2 flex-wrap">
              { PRESETS.map( ( p, i ) => (
                <button
                  key={ p.label }
                  onClick={ () => handlePresetChange( i ) }
                  className={ `px-4 py-2.5 rounded-xl text-[0.6rem] font-black border transition-all duration-300 ${presetIdx === i ? 'bg-accent-indigo text-white border-accent-indigo-light shadow-lg' : 'bg-slate-800/40 border-white/5 text-text-muted hover:text-white hover:border-white/10'}` }
                >
                  { p.label }
                </button>
              ) ) }
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[0.6rem] font-black text-text-darker uppercase tracking-[0.2em] flex items-center gap-2"><i className="fa-solid fa-arrows-left-right text-accent-sky" /> Posicionamento Hero</span>
            <div className="flex gap-2 p-1.5 bg-black/40 border border-white/5 rounded-2xl shadow-inner">
              { [true, false].map( isIp => (
                <button
                  key={ String( isIp ) }
                  onClick={ () => { setHeroIsIp( isIp ); setIsLocked(false); } }
                  className={ `flex-1 px-4 py-2.5 rounded-xl text-[0.6rem] font-black border transition-all ${heroIsIp === isIp ? 'bg-linear-to-r from-accent-sky to-sky-700 border-accent-sky-light text-white shadow-md' : 'bg-transparent border-transparent text-text-dim hover:text-white'}` }
                >
                  { isIp ? 'IP (Hero)' : 'OOP (Hero)' }
                </button>
              ) ) }
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[0.6rem] font-black text-text-darker uppercase tracking-[0.2em] flex items-center gap-2"><i className="fa-solid fa-users-viewfinder text-accent-violet" /> Entropia Multiway</span>
            <div className="flex gap-2 p-1.5 bg-black/40 border border-white/5 rounded-2xl shadow-inner">
              { [2, 3, 4, 5].map( n => (
                <button
                  key={ n }
                  onClick={ () => { setNumPlayers( n ); setIsLocked(false); } }
                  className={ `flex-1 py-2 rounded-xl text-[0.65rem] font-black border transition-all ${numPlayers === n ? 'bg-accent-violet border-accent-violet text-black' : 'bg-transparent border-transparent text-text-muted hover:text-white'}` }
                >
                  { n }{ n > 2 ? ' MW' : ' HU' }
                </button>
              ) ) }
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8 bg-black/40 p-6 rounded-3xl border border-white/5 shadow-inner">
          { ( [
            ['FLOP', potFlop, setPotFlop, 1, Math.min( stacks[ipIdx], stacks[oopIdx] ) * 0.4],
            ['TURN', potTurn, setPotTurn, 1, Math.min( stacks[ipIdx], stacks[oopIdx] ) * 0.7],
            ['RIVER', potRiver, setPotRiver, 1, Math.min( stacks[ipIdx], stacks[oopIdx] )],
          ] as [string, number, React.Dispatch<React.SetStateAction<number>>, number, number][] ).map(
            ( [label, val, setter, min, max] ) => (
              <div key={ label } className="flex flex-col gap-4 group">
                <div className="flex justify-between items-end border-b border-white/5 pb-2">
                  <span className="text-[0.65rem] text-accent-indigo-light font-black uppercase tracking-widest">{ label }</span>
                  <div className="flex items-baseline gap-1 bg-black/60 px-2.5 py-1 rounded-lg border border-white/10 shadow-inner">
                    <span className="text-[0.85rem] text-white font-mono font-black tabular-nums">{ val.toFixed( 1 ) }</span>
                    <span className="text-[0.5rem] text-text-darker font-black uppercase">bb</span>
                  </div>
                </div>
                <div className="relative pt-2">
                  <input
                    type="range"
                    min={ min }
                    max={ max }
                    step="0.5"
                    value={ val }
                    onChange={ e => { setter( Number( e.target.value ) ); setIsLocked(false); } }
                    className="w-full accent-accent-indigo h-1 bg-white/5 rounded-full appearance-none cursor-pointer hover:bg-white/10 transition-colors [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-accent-indigo [&::-webkit-slider-thumb]:rounded-full"
                  />
                </div>
                <div className="flex flex-col gap-1">
                   <div className="flex justify-between text-[0.55rem] font-black uppercase tracking-tighter text-text-darker">
                      <span>EV_fold Estático</span>
                      <span className="text-accent-danger/80">-{ ( val + ( anteSize / 100 ) ).toFixed( 2 ) } bb</span>
                   </div>
                   <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-accent-danger/30 rounded-full" style={{ width: `${Math.min((val/max)*100, 100)}%` }} />
                   </div>
                </div>
              </div>
            )
          ) }
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10">
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
            <div key={ street } className="bg-black/40 border border-white/5 rounded-2xl p-10 flex flex-col items-center justify-center text-center opacity-30 shadow-inner">
              <i className="fa-solid fa-ban text-text-darker mb-4 text-2xl"></i>
              <span className="text-[0.65rem] font-black text-text-darker uppercase tracking-widest">
                { STREET_LABEL[street] } - Vácuo de Dados
              </span>
            </div>
          )
        ) }
      </div>

      <div className="bg-linear-to-r from-accent-indigo/5 to-transparent border-l-4 border-accent-indigo/30 rounded-r-2xl py-6 px-8 shadow-inner relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-full bg-linear-to-l from-accent-indigo/5 to-transparent pointer-events-none" />
        <div className="flex items-center gap-3 mb-3">
          <div className="w-2 h-2 rounded-full bg-accent-indigo animate-pulse shadow-[0_0_10px_var(--accent-indigo)]"></div>
          <strong className="text-[0.7rem] font-black text-text-light uppercase tracking-[0.2em]">Axioma Quantum D6</strong>
        </div>
        <p className="text-[0.75rem] text-text-dim leading-relaxed m-0 italic font-medium max-w-4xl">
          A Perspectiva Matemática (PM) integra a distorção do Teto de Nash e a erosão do tempo.
          Equação: <code className="text-accent-indigo-light mx-1 font-bold">(Eq x R x Val x Gain) - (Loss + RIO)</code>.
          A <span className="text-accent-danger font-bold">Insolvência (Ci)</span> e a <span className="text-accent-sky font-bold">Tração (RP)</span> ditam a sobrevivência.{' '}
          <span className="block mt-3 opacity-60 group-hover:opacity-100 transition-opacity border-t border-white/5 pt-3">
            Distorção IP/OOP baseada em Leverage Dinâmico. RIO MW escalam quadraticamente (N²).
          </span>
        </p>
      </div>
    </div>
  );
}
