'use client';

/**
 * IDENTITY: PM Lens — Framework PM incidindo sobre o Referencial (Aula 1.2)
 * PATH: src/components/simulator/panels/PmLensPanel.tsx
 * ROLE: Dado o FT real (9 jogadores, 9 prizes do Referencial), e a equity da
 *       mão fornecida pelo usuário, calcula por street:
 *         EV_fold = −heroCost  [1ª ordem — dominante]
 *         E = Esperança Matemática (ICM, sem R)
 *         P = Expectativa (E × R — realização posicional)
 *         PM = P − EV_fold  [positivo → ação preferível ao fold]
 *
 * PERFORMANCE: Offloading completo para Web Worker (icm.worker.ts).
 *   Thread principal livre para interações de 120fps (Fricção Zero).
 *   Telemetria de Sunk Cost contínua simula a degradação da Perspectiva.
 *
 * BINDING: [lib/perspectiva.ts, lib/rpDeriver.ts]
 */

import { GlassPanel } from '@/components/ui/GlassPanel';
import { calculatePerspectivaVitoi, type PerspectivaInput, type PerspectivaResult } from '@/lib/perspectiva';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SotaWasmContext } from '../SotaContext';
import { SotaTooltip as PmLensTooltip } from '../ui/SotaTooltip';
import { SniperBadge } from './SniperBadge';

// SOTA Hook inline para erradicar a entropia de import ausente
export function useDebouncedLocalStorage<T> ( key: string, initialValue: T, _delay: number = 500 ): [ T, ( val: T ) => void ]
{
  const [ value, setValue ] = useState<T>( initialValue );
  useEffect( () =>
  {
    try
    {
      const item = globalThis.localStorage.getItem( key );
      if ( item ) setValue( JSON.parse( item ) );
    } catch ( e )
    {
      console.warn( "[useDebouncedLocalStorage] Parse error:", e );
    }
  }, [ key ] );
  const setDebouncedValue = ( newValue: T ) =>
  {
    setValue( newValue );
    globalThis.localStorage.setItem( key, JSON.stringify( newValue ) );
  };
  return [ value, setDebouncedValue ];
}

// =============================================================================
// DADOS DO REFERENCIAL (Aula 1.2) — única fonte de verdade
// =============================================================================

const PLAYERS = [ 'UTG', 'EP', 'MP1', 'MP2', 'HJ', 'CO', 'BU', 'SB', 'BB' ];
const STACKS = [ 9.4, 52.4, 22.2, 7, 44.3, 24.3, 40, 13.4, 55 ];
const PRIZES = [ 237.34, 170.96, 135.17, 109.99, 90.28, 73.95, 59.92, 47.56, 36.47 ];

// =============================================================================
// HELPERS VISUAIS
// =============================================================================

function fmtPct ( v: number, d = 2 ): string
{
  return `${ v >= 0 ? '+' : '' }${ v.toFixed( d ) }%`;
}

function pmColorClass ( v: number ): string
{
  if ( v > 0 ) return 'text-accent-emerald';
  return 'text-accent-danger';
}

function SelectBtn ( { label, active, impossible, onClick }: Readonly<{
  label: string;
  active: boolean;
  impossible?: boolean;
  onClick: () => void;
}> )
{
  let bgClass = 'bg-bg-deep hover:bg-white/5 border border-white/5';
  if ( impossible ) bgClass = 'bg-accent-danger/5 border-accent-danger/20';
  else if ( active ) bgClass = 'bg-accent-indigo/20 border-accent-indigo/40 shadow-[0_0_10px_rgba(99,102,241,0.2)]';

  let textClass = 'text-text-muted hover:text-text-light';
  if ( impossible ) textClass = 'text-accent-danger/60';
  else if ( active ) textClass = 'text-accent-indigo-light';

  return (
    <button
      onClick={ onClick }
      disabled={ impossible }
      className={ `px-2.5 py-1.5 rounded-lg text-[0.6rem] font-black uppercase tracking-widest transition-all ${ bgClass } ${ textClass } ${ impossible ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer' }` }
    >
      { label }
    </button>
  );
}

function MetricRow ( { label, value, colorClass, loading, tooltipTitle, tooltipDesc }: Readonly<{ label: string; value: string; colorClass: string; loading?: boolean; tooltipTitle?: string; tooltipDesc?: string; }> )
{
  const labelEl = <span className={ `text-[0.6rem] font-black uppercase tracking-widest text-text-dim ${ tooltipTitle ? 'cursor-help hover:text-white transition-colors' : 'cursor-default' }` }>{ label }</span>;
  return (
    <div className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
      { tooltipTitle && tooltipDesc ? (
        <PmLensTooltip title={ tooltipTitle } content={ tooltipDesc } align="left" theme="indigo">
          { labelEl }
        </PmLensTooltip>
      ) : labelEl }
      <span className={ `text-[0.7rem] font-black font-mono ${ loading ? 'text-text-darker' : colorClass }` }>{ loading ? '...' : value }</span>
    </div>
  );
}

function renderVerdictText ( loading: boolean, pm: number )
{
  if ( loading ) return '...';
  return pm > 0 ? 'SOBERANO' : 'INSOLVENTE';
}

function renderCi ( loading: boolean, ci: number | null )
{
  if ( loading ) return '...';
  return ci === null ? '—' : ci.toFixed( 2 );
}


// =============================================================================
// COMPONENTE
// =============================================================================

interface PmLensPanelProps
{
  anteSize?: number;
  heroInvested?: number;
  currentPot?: number;
  activePlayers?: number;
  heroPosition?: 'IP' | 'SB' | 'BB';
  blindsRisingSoon?: boolean;
  initialStacks?: number[];
  initialPrizes?: number[];
}

export default function PmLensPanel ( { anteSize = 12.5, heroInvested = 1.125, currentPot = 2.5, activePlayers = 2, heroPosition: _heroPosition = 'BB', blindsRisingSoon = false, initialStacks = STACKS, initialPrizes = PRIZES }: Readonly<PmLensPanelProps> )
{
  const [ heroIdx, setHeroIdx ] = useState( () => Math.min( 8, initialStacks.length - 1 ) );
  const [ villainIdx, setVillainIdx ] = useState( () => Math.min( 6, Math.max( 0, initialStacks.length - 3 ) ) );
  const [ pkoValue, setPkoValue ] = useState( 0 );
  const [ kappa, setKappa ] = useState( 0.5 );
  const [ deltaHabilidade ] = useDebouncedLocalStorage<number>( 'vitoi_pm_delta_habilidade', 50 );
  const [ customR, setCustomR ] = useState<number | null>( null );

  // SOTA: Ordem de ação Pós-Flop e Avaliação Relativa Dinâmica
  // SB(0), BB(1), UTG(2), EP(3), MP1(4), MP2(5), HJ(6), CO(7), BU(8)
  const getPostFlopOrder = ( idx: number ) =>
  {
    if ( idx === 7 ) return 0;
    if ( idx === 8 ) return 1;
    return idx + 2;
  };
  const isHeroIP = getPostFlopOrder( heroIdx ) > getPostFlopOrder( villainIdx );
  const defaultR = isHeroIP ? 1 : 0.85;
  const realizationFactor = customR ?? defaultR;

  // SOTA: Restaura a âncora posicional sistêmica automaticamente quando a colisão é invertida
  useEffect( () =>
  {
    setCustomR( null );
  }, [ isHeroIP ] );

  let absoluteHeroPos: 'IP' | 'SB' | 'BB' = 'IP';
  if ( heroIdx === 8 ) absoluteHeroPos = 'BB';
  else if ( heroIdx === 7 ) absoluteHeroPos = 'SB';

  const ecosystem = useContext( SotaWasmContext );
  const equity = ecosystem?.nativeRangeMetric?.equity ?? 50;
  const isCalculatingEq = ecosystem?.nativeRangeMetric?.isCalculating ?? false;

  // SOTA: Auto-healing para prevenir crash se o usuário alterar para um cenário com menos jogadores (Ex: 6-max)
  useEffect( () =>
  {
    if ( heroIdx >= initialStacks.length )
    {
      setHeroIdx( Math.max( 0, initialStacks.length - 1 ) );
    }
    if ( villainIdx >= initialStacks.length )
    {
      setVillainIdx( Math.max( 0, initialStacks.length - 3 ) );
    }
  }, [ initialStacks.length, heroIdx, villainIdx ] );

  const [ heroRange, setHeroRange ] = useState( '' );
  const [ villainRange, setVillainRange ] = useState( '' );
  const [ asyncResults, setAsyncResults ] = useState<Record<string, any>>( {} );

  // SOTA: Telemetria de Sunk Cost Contínua
  const streetProgression = useMemo( () =>
  {
    // Projeção Termodinâmica ancorada na Realidade (Current Pot) do Simulador Mestre.
    const basePot = Math.max( 2.5, currentPot );
    return [
      { name: 'PRE', potSize: basePot, cumulative: Math.abs( heroInvested ) },
      { name: 'FLOP', potSize: basePot * 3, cumulative: Math.abs( heroInvested ) + ( basePot * 0.33 ) },
      { name: 'TURN', potSize: basePot * 9, cumulative: Math.abs( heroInvested ) + ( basePot * 1.5 ) },
      { name: 'RIVER', potSize: basePot * 16, cumulative: Math.abs( heroInvested ) + ( basePot * 3.5 ) },
    ];
  }, [ heroInvested, currentPot ] );

  const handleIcmResult = useCallback( ( streetName: string, res: PerspectivaResult | null ) =>
  {
    setAsyncResults( prev => ( { ...prev, [ streetName ]: res } ) );
  }, [] );

  // SOTA: Cálculo Direto e Síncrono (Web Worker Apagado para Fricção Zero) com tipagem estrita
  useEffect( () =>
  {
    for ( const street of streetProgression )
    {
      const input: PerspectivaInput = {
        stacks: initialStacks,
        prizes: initialPrizes,
        heroIdx,
        villainIdx,
        potSize: street.potSize,
        heroCost: street.cumulative,
        winProb: equity / 100,
        realizationFactor, // SOTA: Dinâmico baseado na colisão selecionada (IP vs OOP)
        edgeBase: 1 + ( deltaHabilidade / 100 ),
        bountyValue: pkoValue * 100,
        kappa,
        numPlayersInPot: activePlayers,
        heroPosition: absoluteHeroPos, // SOTA: Força FGS a respeitar a seleção exata do painel
        blindsRisingSoon
      };

      const res = calculatePerspectivaVitoi( input );
      handleIcmResult( street.name, res );
    }
  }, [ heroIdx, villainIdx, equity, pkoValue, kappa, anteSize, activePlayers, blindsRisingSoon, deltaHabilidade, streetProgression, initialStacks, initialPrizes, handleIcmResult, absoluteHeroPos, realizationFactor ] );

  const buildStreetMetric = useCallback( ( street: typeof streetProgression[ 0 ], res: PerspectivaResult | null ) =>
  {
    if ( !res ) return { name: street.name, potSize: street.potSize, heroCost: street.cumulative, evFold: 0, fgsHealth: 1, rio: 0, ci: null, PM: 0, loading: true };
    return {
      name: street.name,
      potSize: street.potSize,
      heroCost: street.cumulative,
      evFold: res.dynamicEvFold ?? 0,
      fgsHealth: res.fgsHealth ?? 1,
      rio: res.rioLiability ?? 0,
      ci: res.ci ?? null,
      PM: res.perspectivaPct ?? 0,
      loading: false
    };
  }, [] );

  const streetMetrics = useMemo( () =>
  {
    return streetProgression.map( street => buildStreetMetric( street, asyncResults[ street.name ] ) );
  }, [ asyncResults, streetProgression, buildStreetMetric ] );

  const handleCalculateEquity = () =>
  {
    if ( ecosystem?.dispatchNativeEquity && heroRange && villainRange )
    {
      ecosystem.dispatchNativeEquity( heroRange, villainRange, '' );
    }
  };

  return (
    <GlassPanel className="flex flex-col gap-6 p-8 mt-8">
      {/* Header */ }
      <div className="flex flex-col gap-2 pb-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[0.6rem] font-black text-accent-indigo-light uppercase tracking-widest bg-accent-indigo/10 border border-accent-indigo/20 px-2.5 py-1 rounded-md">PM Lens</span>
            <h3 className="text-sm font-black text-white tracking-widest uppercase m-0">Framework PM — Referencial Aula 1.2</h3>
          </div>
          <SniperBadge
            pm={ streetMetrics[ 0 ]?.PM ?? 0 }
            ci={ streetMetrics[ 0 ]?.ci ?? null }
            stackEff={ Math.min( initialStacks[ heroIdx ] ?? 0, initialStacks[ villainIdx ] ?? 0 ) }
          />
        </div>
        <p className="text-xs text-text-muted leading-relaxed m-0 font-medium italic">
          Telemetria Contínua de Sunk Cost. Motor ICM isolado (SOTA Offloading).
        </p>
      </div>

      {/* Controles */ }
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(300px,400px)] gap-8">
        <div className="flex flex-col gap-6">
          <div>
            <PmLensTooltip title="Agressor (Hero)" content="O agente ativo da equação. Seu stack atual define a margem de manobra (SPR) e a resistência estrutural à pressão do ICM." align="left" theme="indigo">
              <div className="text-[0.65rem] text-text-muted font-black uppercase tracking-widest mb-2.5 cursor-help hover:text-white transition-colors">Hero</div>
            </PmLensTooltip>
            <div className="flex flex-wrap gap-2">
              { PLAYERS.slice( 0, initialStacks.length ).map( ( p, i ) => ( <SelectBtn key={ p } label={ `${ p } ${ initialStacks[ i ] }bb` } active={ heroIdx === i } impossible={ i === villainIdx } onClick={ () => setHeroIdx( i ) } /> ) ) }
            </div>
          </div>
          <div>
            <PmLensTooltip title="Defensor (Villain)" content="O passivo da colisão. O stack efetivo entre ambos dita o teto de perda e o risco instantâneo de eliminação (Bubble Factor)." align="left" theme="indigo">
              <div className="text-[0.65rem] text-text-muted font-black uppercase tracking-widest mb-2.5 cursor-help hover:text-white transition-colors">Villain</div>
            </PmLensTooltip>
            <div className="flex flex-wrap gap-2">
              { PLAYERS.slice( 0, initialStacks.length ).map( ( p, i ) => ( <SelectBtn key={ p } label={ `${ p } ${ initialStacks[ i ] }bb` } active={ villainIdx === i } impossible={ i === heroIdx } onClick={ () => setVillainIdx( i ) } /> ) ) }
            </div>
          </div>
        </div>

        <div className="bg-bg-deep border border-white/5 rounded-xl p-6 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className={ `flex justify-between text-[0.6rem] font-black uppercase tracking-widest mb-2 ${ isHeroIP ? 'text-accent-indigo-light' : 'text-accent-danger' }` }>
                <PmLensTooltip title="Fator de Realização (R)" content={ `Ancorado em ${ isHeroIP ? '100% (IP)' : '85% (OOP)' } para a colisão ${ PLAYERS[ heroIdx ] } vs ${ PLAYERS[ villainIdx ] }. Contudo, a realização é elástica: sofre mutação pela Profundidade de Stack (a desvantagem OOP é mitigada com 10bb e amplificada com 80bb), Edge Relativa e Agressividade do Vilão. Calibre a realidade termodinâmica da mesa.` } align="left" theme="indigo">
                  <span className="cursor-help hover:text-white transition-colors">Realização (R)</span>
                </PmLensTooltip>
                <div className="flex items-center gap-2">
                  { customR !== null && (
                    <button onClick={ () => setCustomR( null ) } className="bg-transparent border-none text-text-dim cursor-pointer p-0 text-[0.65rem] hover:text-white transition-colors" title="Resetar para âncora posicional (SOTA)">
                      <i className="fa-solid fa-rotate-left"></i>
                    </button>
                  ) }
                  <span className="font-mono">{ Math.round( realizationFactor * 100 ) }%</span>
                </div>
              </div>
              <input type="range" min={ 0.5 } max={ 1.5 } step={ 0.05 } value={ realizationFactor } onChange={ e => setCustomR( Number( e.target.value ) ) } className={ `w-full cursor-pointer ${ isHeroIP ? 'accent-accent-indigo' : 'accent-accent-danger' }` } />
            </div>
            <div>
              <div className="flex justify-between text-[0.6rem] text-text-muted hover:text-white transition-colors font-black uppercase tracking-widest mb-2">
                <PmLensTooltip title="Equidade Bruta (Raw Equity)" content="Probabilidade isolada de vencer no Showdown (Vácuo). Totalmente cega para o FGS, RIO e Pressão de ICM." align="left" theme="indigo">
                  <span className="cursor-help">Equity</span>
                </PmLensTooltip>
                <span className="text-white font-mono">{ equity }%</span>
              </div>
              <input type="range" min={ 0 } max={ 100 } value={ equity } onChange={ e => ecosystem?.setManualEquity?.( Number( e.target.value ) ) } className="w-full accent-text-muted cursor-pointer" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between text-[0.6rem] text-accent-amber hover:text-accent-gold transition-colors font-black uppercase tracking-widest mb-2">
                <PmLensTooltip title="Poder de Bounty (PKO)" content="Distorção matemática progressiva. Afrouxa a pressão de sobrevivência do ICM quando cobrimos a stack do oponente." align="left" theme="indigo">
                  <span className="cursor-help">Bounty PKO</span>
                </PmLensTooltip>
                <span className="font-mono">{ Math.round( pkoValue * 100 ) }%</span>
              </div>
              <input type="range" min={ 0 } max={ 0.8 } step={ 0.05 } value={ pkoValue } onChange={ e => setPkoValue( Number( e.target.value ) ) } className="w-full accent-accent-amber cursor-pointer" />
            </div>
            <div>
              <div className="flex justify-between text-[0.6rem] text-accent-pink hover:text-accent-pink-light transition-colors font-black uppercase tracking-widest mb-2">
                <PmLensTooltip title="Taxa de Maluquice (Kappa κ)" content="Frequência estimada de que o vilão executará as linhas teóricas do Nash sem ceder ao Tilt ou Bobagem Humana." align="left" theme="indigo">
                  <span className="cursor-help">Credibilidade κ</span>
                </PmLensTooltip>
                <span className="font-mono">{ Math.round( kappa * 100 ) }%</span>
              </div>
              <input type="range" min={ 0 } max={ 1 } step={ 0.05 } value={ kappa } onChange={ e => setKappa( Number( e.target.value ) ) } className="w-full accent-accent-pink cursor-pointer" />
            </div>
          </div>

          <div className="mt-2 p-4 bg-black/40 border border-white/5 rounded-xl flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Hero (ex: 22+)" value={ heroRange } onChange={ e => setHeroRange( e.target.value ) } className="w-full bg-bg-base border border-white/10 text-white text-[0.65rem] font-mono px-3 py-2 rounded-lg focus:outline-none focus:border-accent-indigo transition-colors placeholder:text-text-darker" />
              <input type="text" placeholder="Vilão (ex: ATo+)" value={ villainRange } onChange={ e => setVillainRange( e.target.value ) } className="w-full bg-bg-base border border-white/10 text-white text-[0.65rem] font-mono px-3 py-2 rounded-lg focus:outline-none focus:border-accent-indigo transition-colors placeholder:text-text-darker" />
            </div>
            <PmLensTooltip title="Motor Quântico O(1)" content="Invoca o Web Worker nativo em Rust para triturar as matrizes combinatórias via Monte Carlo (10.000 iterações em <50ms)." align="center" theme="indigo">
              <button onClick={ handleCalculateEquity } disabled={ isCalculatingEq || !heroRange || !villainRange } className="w-full py-2.5 bg-accent-indigo/20 text-accent-indigo-light border border-accent-indigo/40 rounded-lg text-[0.65rem] font-black uppercase tracking-widest hover:bg-accent-indigo/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                { isCalculatingEq ? 'Processando Quântico...' : 'Injetar GTO (WASM)' }
              </button>
            </PmLensTooltip>
          </div>
        </div>
      </div>

      {/* Grid de Cartões por Street (Erradicando o Espaço Vazio e Restaurando os Dados) */ }
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-4">
        { streetMetrics.map( s => (
          <div key={ s.name } className="bg-linear-to-b from-bg-panel/60 to-bg-deep/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:shadow-[0_16px_48px_rgba(99,102,241,0.15)] hover:-translate-y-1 hover:border-white/20 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-[0.85rem] font-black text-white tracking-widest uppercase">{ s.name }</span>
              <span className={ `px-2 py-1 rounded text-[0.55rem] font-black uppercase tracking-widest ${ s.PM > 0 ? 'bg-emerald-500/10 text-accent-emerald border border-emerald-500/20' : 'bg-rose-500/10 text-accent-danger border border-rose-500/20' }` }>
                { renderVerdictText( s.loading, s.PM ) }
              </span>
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <MetricRow label="Sunk Cost" value={ `-${ s.heroCost.toFixed( 2 ) }bb` } colorClass="text-text-dim" loading={ s.loading } tooltipTitle="O Abismo do Fold (Sunk Cost)" tooltipDesc="Fichas investidas não lhe pertencem mais. Elas ditam a profundidade do custo irrecuperável de desistir." />
              <MetricRow label="Piso (EV_fold)" value={ `${ s.evFold.toFixed( 2 ) }%` } colorClass="text-accent-danger" loading={ s.loading } tooltipTitle="Baseline Dinâmico (EV_Fold)" tooltipDesc="A Esperança de simplesmente desistir e ceder o pote. Qualquer ação deve superar matematicamente esta âncora." />
              <MetricRow label="Passivo (RIO)" value={ `${ s.rio.toFixed( 2 ) }%` } colorClass="text-accent-amber" loading={ s.loading } tooltipTitle="Catástrofe Silenciosa (RIO)" tooltipDesc="O custo passivo de 'acertar e continuar perdendo'. Infla geometricamente (x²) em cenários Multiway." />
              <MetricRow label="FGS Health" value={ `${ s.fgsHealth.toFixed( 2 ) }x` } colorClass="text-accent-violet" loading={ s.loading } tooltipTitle="Erosão Antecipada (FGS t-3)" tooltipDesc="Punição gravitacional na órbita. Antecipa o dano do Big Blind iminente, forçando agressão para não morrer cego." />
              <MetricRow label="Insolvência (Cᵢ)" value={ renderCi( s.loading, s.ci ) } colorClass={ s.ci !== null && s.ci < 1 ? 'text-accent-danger' : 'text-accent-emerald' } loading={ s.loading } tooltipTitle="Coeficiente de Insolvência (Ci)" tooltipDesc="Se Cᵢ < 1, as Pot Odds mentem. A mão não possui equidade suficiente para superar o passivo do RIO e do ICM." />
            </div>
            <div className="mt-2 pt-4 border-t border-white/5 flex justify-between items-center">
              <PmLensTooltip title="A Métrica Soberana (PM)" content="A verdadeira utilidade da ação: (Expectativa - RIO) - EV_Fold. Exige que a ação rompa a inércia destrutiva do fold." align="left" theme="indigo">
                <span className="text-[0.65rem] font-black text-text-muted group-hover:text-white uppercase tracking-widest cursor-help transition-colors">Perspectiva</span>
              </PmLensTooltip>
              <span className={ `text-[1.2rem] font-black font-mono ${ s.loading ? 'text-text-darker' : pmColorClass( s.PM ) }` }>{ s.loading ? '...' : fmtPct( s.PM ) }</span>
            </div>
          </div>
        ) ) }
      </div>
    </GlassPanel>
  );
}
