'use client';

/**
 * IDENTITY: PM Lens — Framework PM incidindo sobre o Referencial (Aula 1.2)
 * PATH: src/components/simulator/panels/PmLensPanel.tsx
 * ROLE: Dado o FT real e a equity da mão fornecida pelo usuário, calcula por street:
 *         EV_fold = −heroCost  [1ª ordem — dominante]
 *         E = Esperança Matemática (ICM, sem R)
 *         P = Expectativa (E × R — realização posicional)
 *         PM = P − EV_fold  [positivo → ação preferível ao fold]
 *
 * BINDING: [lib/perspectiva.ts, components/simulator/hooks/*, components/simulator/ui/*]
 */

import { formatCi, formatPct, getPmColorClass, getVerdictText } from '@/components/simulator/engine/utils';
import { useDebouncedLocalStorage } from '@/components/simulator/hooks/useDebouncedLocalStorage';
import { usePmLensCalculations } from '@/components/simulator/hooks/usePmLensCalculations';
import { MetricRow } from '@/components/simulator/ui/MetricRow';
import { SelectBtn } from '@/components/simulator/ui/SelectBtn';
import { useCallback, useContext, useEffect, useState } from 'react';
import { SotaWasmContext } from '../SotaContext';
import { SniperBadge } from './SniperBadge';
import type { NodelockConstraint, HeroPosition } from '../engine/types';

const DEFAULT_PLAYERS = [ 'UTG', 'EP', 'MP1', 'MP2', 'HJ', 'CO', 'BU', 'SB', 'BB' ];
const DEFAULT_STACKS = [ 9.4, 52.4, 22.2, 7, 44.3, 24.3, 40, 13.4, 55 ];
const DEFAULT_PRIZES = [ 237.34, 170.96, 135.17, 109.99, 90.28, 73.95, 59.92, 47.56, 36.47 ];

interface PmLensPanelProps
{
  anteSize?: number;
  heroInvested?: number;
  currentPot?: number;
  activePlayers?: number;
  heroPosition?: HeroPosition;
  blindsRisingSoon?: boolean;
  initialStacks?: number[];
  initialPrizes?: number[];
  pkoValue?: number;
}

export default function PmLensPanel ( { anteSize: _anteSize = 12.5, heroInvested = 1.125, currentPot = 2.5, activePlayers: _activePlayers = 2, heroPosition: _heroPosition = 'BB', blindsRisingSoon = false, initialStacks = DEFAULT_STACKS, initialPrizes = DEFAULT_PRIZES, pkoValue: globalPkoValue }: Readonly<PmLensPanelProps> )
{
  const getInitialHeroIdx = () => {
    if ( _heroPosition === 'BB' ) return Math.min( 8, initialStacks.length - 1 );
    if ( _heroPosition === 'SB' ) return Math.min( 7, initialStacks.length - 2 );
    if ( _heroPosition === 'IP' ) return Math.min( 6, initialStacks.length - 3 );
    return Math.min( 0, initialStacks.length - 1 );
  };
  const [ heroIdx, setHeroIdx ] = useState( getInitialHeroIdx );
  const [ villainIndices, setVillainIndices ] = useState<number[]>( () => {
      const numVillains = Math.max( 1, _activePlayers - 1 );
      const valid = Array.from({ length: initialStacks.length }, (_, i) => i).filter(i => i !== getInitialHeroIdx());
      if (valid.length >= numVillains) return valid.slice(0, numVillains);
      return valid.length > 0 ? valid : [ Math.max( 0, initialStacks.length - 3 ) ];
  });

  const primaryVillainIdx = villainIndices[ 0 ] ?? Math.min( 6, Math.max( 0, initialStacks.length - 3 ) );
  const simulatedActivePlayers = 1 + villainIndices.length;

  const [ pkoValue, setPkoValue ] = useState( globalPkoValue ?? 0 );
  const [ kappa, setKappa ] = useState( 0.5 );
  const [ deltaHabilidade ] = useDebouncedLocalStorage<number>( 'vitoi_pm_delta_habilidade', 50 );
  const [ activeNodelock, setActiveNodelock ] = useState<NodelockConstraint | null>( null );

  const [ customR, setCustomR ] = useState<number | null>( null );
  const [ aggFactor, setAggFactor ] = useState<number>( 1 );

  useEffect( () =>
  {
    if ( globalPkoValue !== undefined ) setPkoValue( globalPkoValue );
  }, [ globalPkoValue ] );

  const [ board, setBoard ] = useState( '' );
  const [ betSizing, setBetSizing ] = useState<number>( 0.5 );

  const getPostFlopOrder = ( idx: number ) =>
  {
    if ( idx === 7 ) return 0;
    if ( idx === 8 ) return 1;
    return idx + 2;
  };
  const isHeroIP = getPostFlopOrder( heroIdx ) > getPostFlopOrder( primaryVillainIdx );

  const spr = Math.max( 0.1, ( initialStacks[ heroIdx ] || 10 ) / Math.max( 1, currentPot ) );
  const sprDiscount = Math.min( 1, 0.75 + ( 0.25 * ( 10 / Math.max( 10, spr ) ) ) );
  const posBaseline = isHeroIP ? 1 : 0.85 * sprDiscount;
  const aggPenalty = 1 - ( ( aggFactor - 1 ) * 0.15 );
  const defaultR = Math.max( 0.1, Math.min( 1.5, posBaseline * aggPenalty ) );

  const realizationFactor = customR ?? defaultR;

  useEffect( () =>
  {
    setCustomR( null );
  }, [ isHeroIP ] );

  let absoluteHeroPos: HeroPosition = 'IP';
  if ( heroIdx === 8 ) absoluteHeroPos = 'BB';
  else if ( heroIdx === 7 ) absoluteHeroPos = 'SB';

  const ecosystem = useContext( SotaWasmContext );

  // SOTA FIX: O Win Rate triturado pelo Monte Carlo (WebGPU) torna-se a Equity absoluta
  const rawGpuEquity = ecosystem?.insolvencyMatrixData?.winRate ? ecosystem.insolvencyMatrixData.winRate * 100 : undefined;
  const equity = rawGpuEquity === undefined ? (ecosystem?.nativeRangeMetric?.equity ?? 50) : Number(rawGpuEquity.toFixed(1));
  const isCalculatingEq = ecosystem?.isCalculatingInsolvency ?? false;

  useEffect( () =>
  {
    if ( _heroPosition === 'BB' ) setHeroIdx( Math.min( 8, initialStacks.length - 1 ) );
    else if ( _heroPosition === 'SB' ) setHeroIdx( Math.min( 7, initialStacks.length - 2 ) );
    else if ( _heroPosition === 'IP' ) setHeroIdx( Math.min( 6, initialStacks.length - 3 ) );
    else if ( _heroPosition === 'OOP' ) setHeroIdx( Math.min( 0, initialStacks.length - 1 ) );
  }, [ _heroPosition, initialStacks.length ] );

  useEffect( () =>
  {
    const numVillains = Math.max( 1, _activePlayers - 1 );
    setVillainIndices( prev => {
      const valid = prev.filter( idx => idx < initialStacks.length && idx !== heroIdx );
      if ( valid.length === numVillains ) return valid;
      const newVillains = [];
      for ( let i = 0; i < initialStacks.length && newVillains.length < numVillains; i++ ) {
        if ( i !== heroIdx ) newVillains.push( i );
      }
      return newVillains.length > 0 ? newVillains : [ Math.max( 0, initialStacks.length - 3 ) ];
    } );
  }, [ _activePlayers, heroIdx, initialStacks.length ] );

  useEffect( () =>
  {
    if ( heroIdx >= initialStacks.length )
    {
      setHeroIdx( Math.max( 0, initialStacks.length - 1 ) );
    }
    setVillainIndices( prev => {
      const valid = prev.filter( idx => idx < initialStacks.length );
      if ( valid.length === 0 ) return [ Math.max( 0, initialStacks.length - 3 ) ];
      return valid;
    } );
  }, [ initialStacks.length, heroIdx ] );

  const [ heroRange, setHeroRange ] = useState( 'AhKd' );
  const [ villainRange, setVillainRange ] = useState( '100%' );

  // SOTA v4.2: Orquestração de Cálculo Modularizada
  const { streetMetrics } = usePmLensCalculations({
    initialStacks, initialPrizes, heroIdx, primaryVillainIdx, currentPot, heroInvested, equity, realizationFactor, deltaHabilidade, pkoValue, kappa, simulatedActivePlayers, absoluteHeroPos, blindsRisingSoon, activeNodelock, betSizing
  });

  const handleCalculateEquity = () =>
  {
    if ( ecosystem?.dispatchInsolvencyMatrix && heroRange && villainRange )
    {
      // SOTA: Acopla a Tensão Sistêmica (RP) baseando-se na vantagem posicional
      const rpFactor = isHeroIP ? 15 : 25;
      ecosystem.dispatchInsolvencyMatrix( villainRange, board, rpFactor, heroInvested, currentPot, simulatedActivePlayers, kappa, heroRange, betSizing );
    }
  };

  const toggleVillain = useCallback( ( index: number ) => {
    setVillainIndices( prev => {
      if ( prev.includes( index ) ) {
        if ( prev.length === 1 ) return prev;
        return prev.filter( v => v !== index );
      }
      return [ ...prev, index ];
    } );
  }, [] );

  return (
    <div className="glass-panel flex flex-col gap-10 p-6 sm:p-8 lg:p-12 rounded-4xl bg-bg-panel/80 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden transition-all duration-300">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-indigo/5 blur-3xl rounded-full pointer-events-none" />

      {/* Header */ }
      <div className="flex flex-col gap-2 pb-6 border-b border-white/5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-accent-indigo shadow-[0_0_10px_var(--accent-indigo)]" />
            <h3 className="text-[0.75rem] font-black text-text-main tracking-[0.2em] uppercase m-0">Framework PM &middot; <span className="text-text-muted">Lente de Perspectiva</span></h3>
          </div>
          <SniperBadge
            pm={ streetMetrics[ 0 ]?.PM ?? 0 }
            ci={ streetMetrics[ 0 ]?.ci ?? null }
            stackEff={ Math.min( initialStacks[ heroIdx ] ?? 0, initialStacks[ primaryVillainIdx ] ?? 0 ) }
          />
        </div>
        <p className="text-[0.65rem] text-text-dim mt-2 m-0 font-medium uppercase tracking-wider">
          Telemetria Contínua de Sunk Cost &middot; Motor ICM Isolado (SOTA Offloading)
        </p>
      </div>

      {/* Controles */ }
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(350px,450px)] gap-12">
        <div className="flex flex-col gap-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-[0.6rem] text-text-muted font-black uppercase tracking-[0.2em]">Hero (Agressor)</span>
                <span className="text-[0.45rem] text-text-darker font-black uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded">SPR Active</span>
              </div>
              <div className="flex flex-wrap gap-2.5 overflow-x-auto scrollbar-hide pb-2">
                { DEFAULT_PLAYERS.slice( 0, initialStacks.length ).map( ( p, i ) => ( <SelectBtn key={ p } label={ `${ p } ${ initialStacks[ i ] }bb` } active={ heroIdx === i } impossible={ villainIndices.includes( i ) } onClick={ () => setHeroIdx( i ) } /> ) ) }
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-[0.6rem] text-text-muted font-black uppercase tracking-[0.2em]">Villain(s) - Multiway</span>
                <span className="text-[0.45rem] text-text-darker font-black uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded">N² Complexity</span>
              </div>
              <div className="flex flex-wrap gap-2.5 overflow-x-auto scrollbar-hide pb-2">
                { DEFAULT_PLAYERS.slice( 0, initialStacks.length ).map( ( p, i ) => (
                  <SelectBtn key={ p } label={ `${ p } ${ initialStacks[ i ] }bb` } active={ villainIndices.includes( i ) } impossible={ i === heroIdx } onClick={ () => toggleVillain( i ) } />
                ) ) }
              </div>
            </div>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-3xl p-8 flex flex-col gap-8 shadow-inner">
            <h4 className="text-[0.65rem] text-text-muted font-black uppercase tracking-[0.25em] m-0 flex items-center gap-2">
                <i className="fa-solid fa-sliders text-accent-indigo text-[0.6rem]" /> Alavancas de Realização
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div className="space-y-5">
                <div className={ `flex flex-col gap-1 ${ isHeroIP ? 'text-accent-indigo-light' : 'text-accent-danger' }` }>
                  <div className="flex justify-between items-center text-[0.6rem] font-black uppercase tracking-widest">
                    <span>Realização (R)</span>
                    <div className="flex items-center gap-3">
                      { customR !== null && (
                        <button onClick={ () => setCustomR( null ) } className="bg-black/40 border border-white/5 text-text-dim cursor-pointer px-2 py-0.5 rounded-lg text-[0.55rem] hover:text-white transition-all uppercase tracking-tighter" title="Resetar para Auto">
                          <i className="fa-solid fa-rotate-left mr-1"></i> Auto
                        </button>
                      ) }
                      <span className="font-mono font-black text-white bg-black/60 px-2 py-0.5 rounded border border-white/5">{ Math.round( realizationFactor * 100 ) }%</span>
                    </div>
                  </div>
                </div>
                <input aria-label="Ajuste de Realização Posicional" type="range" min={ 0.1 } max={ 2 } step={ 0.05 } value={ realizationFactor } onChange={ e => setCustomR( Number( e.target.value ) ) } className={ `w-full h-1 appearance-none bg-white/5 rounded-full cursor-pointer ${ isHeroIP ? 'accent-accent-indigo' : 'accent-accent-danger' }` } />
                <p className="text-[0.45rem] text-text-darker leading-tight m-0 uppercase tracking-[0.15em] font-black">Ajuste de under/over realization. R&lt;1 = perda de EQ.</p>
              </div>

              <div className="space-y-5">
                <div className="flex flex-col gap-1 text-accent-amber">
                  <div className="flex justify-between items-center text-[0.6rem] font-black uppercase tracking-widest">
                    <span>Villain AggFactor</span>
                    <span className="font-mono font-black text-white bg-black/60 px-2 py-0.5 rounded border border-white/5">{ aggFactor.toFixed(2) }x</span>
                  </div>
                </div>
                <input aria-label="Villain AggFactor" type="range" min={ 0.1 } max={ 3 } step={ 0.1 } value={ aggFactor } onChange={ e => setAggFactor( Number( e.target.value ) ) } className="w-full h-1 appearance-none bg-white/5 rounded-full cursor-pointer accent-accent-amber" />
                <p className="text-[0.45rem] text-text-darker leading-tight m-0 uppercase tracking-[0.15em] font-black">Agg extrema OOP destrói sua Realização (R).</p>
              </div>
            </div>
            { customR === null && (
              <div className="p-4 bg-accent-indigo/5 border border-accent-indigo/10 rounded-2xl flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-accent-indigo animate-pulse" />
                 <p className="text-[0.6rem] text-text-muted m-0 leading-relaxed font-medium">
                   <strong className="text-white uppercase tracking-widest mr-2">Motor R Ativo:</strong> SPR {spr.toFixed(1)} &middot; Pos {absoluteHeroPos} &middot; Agg {aggFactor.toFixed(1)}x
                 </p>
              </div>
            ) }
          </div>

          {/* SOTA: Nodelock B20 */}
          <div className="bg-black/40 border border-white/5 rounded-3xl p-8 flex flex-col gap-6 shadow-inner">
             <div className="flex justify-between items-center">
                 <h4 className="text-[0.65rem] text-text-muted font-black uppercase tracking-[0.25em] m-0 flex items-center gap-2">
                    <i className="fa-solid fa-anchor text-accent-indigo text-[0.6rem]" /> Tática de Ancoragem
                 </h4>
                 <button
                    onClick={() => setActiveNodelock(prev => prev ? null : { type: 'block_bet', sizePct: 0.2, freqOverride: 1 })}
                    {...{ 'aria-pressed': !!activeNodelock }}
                    className={`px-4 py-2 rounded-xl text-[0.6rem] font-black uppercase tracking-widest transition-all cursor-pointer border active:scale-95 ${activeNodelock ? 'bg-accent-indigo/20 border-accent-indigo text-accent-indigo-light shadow-lg' : 'bg-transparent border-white/10 text-text-dim hover:text-white hover:border-white/30'}`}
                 >
                    {activeNodelock ? 'Nodelock B20 Ativo' : 'Ativar Block Bet 20%'}
                 </button>
             </div>
             {activeNodelock && (
                 <p className="text-[0.65rem] text-accent-indigo-light m-0 leading-relaxed font-medium italic border-l-2 border-accent-indigo/30 pl-4 py-1">
                    A estrutura SPR foi mitigada (+40%/street). Axioma Lipe Piv acionado (κ: <span className="font-mono font-black">{Math.min(1, kappa + 0.3).toFixed(2)}x</span>).
                 </p>
             )}
          </div>
        </div>

        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-4xl p-8 flex flex-col gap-8 shadow-2xl relative overflow-hidden group/sidebar">
          <div className="absolute inset-0 bg-radial-[at_center_center] from-accent-indigo/5 to-transparent pointer-events-none" />

          <div className="relative z-10 space-y-8">
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-center text-[0.65rem] text-text-muted group-hover/sidebar:text-white transition-colors font-black uppercase tracking-[0.2em]">
                <span>Equity Bruta</span>
                <span className="text-white font-mono bg-black/40 px-2 py-0.5 rounded border border-white/5 shadow-inner">{ equity }%</span>
              </div>
              <input aria-label="Equity Bruta" type="range" min={ 0 } max={ 100 } value={ equity } onChange={ e => ecosystem?.setManualEquity?.( Number( e.target.value ) ) } className="w-full h-1.5 appearance-none bg-white/5 rounded-full cursor-pointer accent-text-muted" />
              <p className="text-[0.45rem] text-text-darker leading-tight m-0 uppercase tracking-widest font-black">No vácuo &middot; Cega para FGS, RIO e Pressão ICM.</p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[0.6rem] text-accent-amber font-black uppercase tracking-widest">
                  <span>Bounty PKO</span>
                  <span className="font-mono text-white bg-black/40 px-2 py-0.5 rounded">{ Math.round( pkoValue * 100 ) }%</span>
                </div>
                <input aria-label="Bounty PKO" type="range" min={ 0 } max={ 0.8 } step={ 0.05 } value={ pkoValue } onChange={ e => setPkoValue( Number( e.target.value ) ) } className="w-full h-1 appearance-none bg-white/5 rounded-full cursor-pointer accent-accent-amber" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[0.6rem] text-accent-pink font-black uppercase tracking-widest">
                  <span>κ Credibilidade</span>
                  <span className="font-mono text-white bg-black/40 px-2 py-0.5 rounded">{ Math.round( kappa * 100 ) }%</span>
                </div>
                <input aria-label="Credibilidade Kappa" type="range" min={ 0 } max={ 1 } step={ 0.05 } value={ kappa } onChange={ e => setKappa( Number.parseFloat( e.target.value ) ) } className="w-full h-1 appearance-none bg-white/5 rounded-full cursor-pointer accent-accent-pink" />
              </div>
            </div>

            <div className="p-6 bg-black/40 border border-white/10 rounded-3xl flex flex-col gap-4 shadow-inner">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <span className="text-[0.45rem] text-text-darker uppercase font-black tracking-widest pl-1">Hero Range</span>
                    <input aria-label="Hero Range" type="text" placeholder="AhKd" value={ heroRange } onChange={ e => setHeroRange( e.target.value ) } className="w-full bg-slate-900/80 border border-white/5 text-white text-[0.7rem] font-mono px-4 py-2.5 rounded-xl focus:ring-1 focus:ring-accent-indigo outline-none transition-all placeholder:text-text-darker shadow-inner" />
                </div>
                <div className="space-y-2">
                    <span className="text-[0.45rem] text-text-darker uppercase font-black tracking-widest pl-1">Villain Range</span>
                    <input aria-label="Villain Range" type="text" placeholder="100%" value={ villainRange } onChange={ e => setVillainRange( e.target.value ) } className="w-full bg-slate-900/80 border border-white/5 text-white text-[0.7rem] font-mono px-4 py-2.5 rounded-xl focus:ring-1 focus:ring-accent-indigo outline-none transition-all placeholder:text-text-darker shadow-inner" />
                </div>
              </div>

              <div className="grid grid-cols-[1fr_120px] gap-4">
                <div className="space-y-2">
                    <span className="text-[0.45rem] text-text-darker uppercase font-black tracking-widest pl-1">Board Structural</span>
                    <input aria-label="Board Structural" type="text" placeholder="Ah Td 7c" value={ board } onChange={ e => setBoard( e.target.value ) } className="w-full bg-slate-900/80 border border-white/5 text-accent-emerald-light text-[0.7rem] font-mono px-4 py-2.5 rounded-xl focus:ring-1 focus:ring-accent-emerald outline-none transition-all placeholder:text-text-darker shadow-inner" />
                </div>
                <div className="space-y-2">
                    <span className="text-[0.45rem] text-text-darker uppercase font-black tracking-widest text-center block">Sizing</span>
                    <div className="relative">
                        <select aria-label="Tamanho da Aposta" value={ betSizing } onChange={ e => setBetSizing( Number( e.target.value ) ) } className="w-full bg-slate-900/80 border border-white/5 text-white text-[0.65rem] font-mono font-black px-3 py-2.5 rounded-xl outline-none appearance-none cursor-pointer text-center">
                            <option value="0.33">33%</option>
                            <option value="0.5">50%</option>
                            <option value="0.75">75%</option>
                            <option value="1.2">120%</option>
                        </select>
                    </div>
                </div>
              </div>

              <div className="pt-2">
                <button onClick={ handleCalculateEquity } disabled={ isCalculatingEq || !heroRange || !villainRange } className="w-full py-4 bg-accent-indigo text-white border border-accent-indigo-light/20 rounded-2xl text-[0.7rem] font-black uppercase tracking-widest hover:bg-indigo-500 shadow-xl shadow-accent-indigo/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                  { isCalculatingEq ? 'Triturando VRAM...' : 'Injetar GTO (WebGPU)' }
                </button>
                <p className="text-[0.45rem] text-text-darker leading-tight m-0 mt-3 uppercase tracking-widest text-center font-black">Invoca Compute Shader p/ Monte Carlo O(1)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Cartões por Street */ }
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        { streetMetrics.map( s => (
          <div key={ s.name } className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 flex flex-col gap-6 shadow-2xl hover:border-accent-indigo/30 hover:-translate-y-1.5 transition-all duration-500 group/card relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-accent-indigo/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />

            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <span className="text-[0.8rem] font-black text-white tracking-[0.2em] uppercase">{ s.name }</span>
              <span className={ `px-3 py-1 rounded-lg text-[0.55rem] font-black uppercase tracking-widest shadow-lg ${ s.PM > 0 ? 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20' : 'bg-accent-danger/10 text-accent-danger border border-accent-danger/20' }` }>
                { getVerdictText( s.loading, s.PM ) }
              </span>
            </div>

            <div className="flex flex-col gap-3 flex-1">
              <MetricRow label="Sunk Cost" value={ `-${ s.heroCost.toFixed( 2 ) }bb` } colorClass="text-text-dim" loading={ s.loading } tooltipDesc="Fichas investidas não lhe pertencem mais. Elas ditam a profundidade do custo irrecuperável de desistir." />
              <MetricRow label="Piso (EV_fold)" value={ `${ s.evFold.toFixed( 2 ) }%` } colorClass="text-accent-danger" loading={ s.loading } tooltipDesc="A Esperança de simplesmente desistir e ceder o pote. Qualquer ação deve superar matematicamente esta âncora." />
              <MetricRow label="Passivo (RIO)" value={ `${ s.rio.toFixed( 2 ) }%` } colorClass="text-accent-amber" loading={ s.loading } tooltipDesc="O custo passivo de 'acertar e continuar perdendo'. Infla geometricamente (x²) em cenários Multiway." />
              <MetricRow label="FGS Health" value={ `${ s.fgsHealth.toFixed( 2 ) }x` } colorClass="text-accent-violet" loading={ s.loading } tooltipDesc="Punição gravitacional na órbita. Antecipa o dano do Big Blind iminente, forçando agressão para não morrer cego." />
              <MetricRow label="Insolvência (Cᵢ)" value={ formatCi( s.loading, s.ci ) } colorClass={ s.ci !== null && s.ci < 1 ? 'text-accent-danger' : 'text-accent-emerald' } loading={ s.loading } tooltipDesc="Se Cᵢ < 1, as Pot Odds mentem. A mão não possui equidade suficiente para superar o passivo do RIO e do ICM." />
            </div>

            <div className="mt-2 pt-4 border-t border-white/5 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[0.6rem] font-black text-text-muted group-hover/card:text-white uppercase tracking-[0.2em] transition-colors">Perspectiva</span>
                <span className={ `text-2xl font-black font-mono tabular-nums tracking-tighter ${ s.loading ? 'text-text-darker' : getPmColorClass( s.PM ) }` }>{ s.loading ? '...' : formatPct( s.PM ) }</span>
              </div>
              <p className="text-[0.45rem] text-text-darker leading-tight m-0 uppercase tracking-widest font-black text-right">
                PM = (Exp × R) − (EV_Fold + RIO)
              </p>
            </div>
          </div>
        ) ) }
      </div>
    </div>
  );
}
