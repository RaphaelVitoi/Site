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
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SotaWasmContext } from '../SotaContext';
import { SotaTooltip as PmLensTooltip } from '../ui/SotaTooltip';
import { SniperBadge } from './SniperBadge';
import type { NodelockConstraint } from '../engine/types';

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
  const [ villainIndices, setVillainIndices ] = useState<number[]>( () => [ Math.min( 6, Math.max( 0, initialStacks.length - 3 ) ) ] );
  const primaryVillainIdx = villainIndices[ 0 ] ?? Math.min( 6, Math.max( 0, initialStacks.length - 3 ) );
  const simulatedActivePlayers = 1 + villainIndices.length;

  const [ pkoValue, setPkoValue ] = useState( 0 );
  const [ kappa, setKappa ] = useState( 0.5 );
  const [ deltaHabilidade ] = useDebouncedLocalStorage<number>( 'vitoi_pm_delta_habilidade', 50 );
  const [ activeNodelock, setActiveNodelock ] = useState<NodelockConstraint | null>( null );

  // SOTA: Alavancas abstratas de Realização de Equidade (R)
  const [ customR, setCustomR ] = useState<number | null>( null );
  const [ aggFactor, setAggFactor ] = useState<number>( 1.0 ); // 1.0 = Normal, 1.5 = Maníaco, 0.5 = Passivo

  // SOTA: Contexto de Textura Pós-Flop e Sizing
  const [ board, setBoard ] = useState( '' );
  const [ betSizing, setBetSizing ] = useState<number>( 0.5 ); // 33%, 50%, 75%, 120% etc

  // SOTA: Ordem de ação Pós-Flop e Avaliação Relativa Dinâmica
  // SB(0), BB(1), UTG(2), EP(3), MP1(4), MP2(5), HJ(6), CO(7), BU(8)
  const getPostFlopOrder = ( idx: number ) =>
  {
    if ( idx === 7 ) return 0;
    if ( idx === 8 ) return 1;
    return idx + 2;
  };
  const isHeroIP = getPostFlopOrder( heroIdx ) > getPostFlopOrder( primaryVillainIdx );

  // SOTA: Baseline Termodinâmico de Realização (Posição + SPR + Agressividade)
  const spr = Math.max( 0.1, ( initialStacks[ heroIdx ] || 10 ) / Math.max( 1, currentPot ) );
  const sprDiscount = Math.min( 1, 0.75 + ( 0.25 * ( 10 / Math.max( 10, spr ) ) ) );
  const posBaseline = isHeroIP ? 1 : 0.85 * sprDiscount;

  // Agressividade do vilão pune a realização (força folds indesejados). Se ele for muito passivo (<1), aumenta a realização.
  const aggPenalty = 1 - ( ( aggFactor - 1 ) * 0.15 );
  const defaultR = Math.max( 0.1, Math.min( 1.5, posBaseline * aggPenalty ) );

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
    setVillainIndices( prev => {
      const valid = prev.filter( idx => idx < initialStacks.length );
      if ( valid.length === 0 ) return [ Math.max( 0, initialStacks.length - 3 ) ];
      return valid;
    } );
  }, [ initialStacks.length, heroIdx ] );

  const [ heroRange, setHeroRange ] = useState( '' );
  const [ villainRange, setVillainRange ] = useState( '' );
  const [ asyncResults, setAsyncResults ] = useState<Record<string, any>>( {} );

  // SOTA: Telemetria de Sunk Cost Contínua
  const streetProgression = useMemo( () =>
  {
    // Projeção Termodinâmica ancorada na Realidade (Current Pot) do Simulador Mestre.
    const basePot = Math.max( 2.5, currentPot );

    if ( activeNodelock?.type === 'block_bet' ) {
      const flopPot = basePot * 3;
      const flopCumulative = Math.abs( heroInvested ) + ( basePot * 0.33 );

      const b20BetTurn = flopPot * activeNodelock.sizePct;
      const turnPot = flopPot + (b20BetTurn * 2);
      const turnCumulative = flopCumulative + b20BetTurn;

      const b20BetRiver = turnPot * activeNodelock.sizePct;
      const riverPot = turnPot + (b20BetRiver * 2);
      const riverCumulative = turnCumulative + b20BetRiver;

      return [
        { name: 'PRE', potSize: basePot, cumulative: Math.abs( heroInvested ) },
        { name: 'FLOP', potSize: flopPot, cumulative: flopCumulative },
        { name: 'TURN', potSize: turnPot, cumulative: turnCumulative },
        { name: 'RIVER', potSize: riverPot, cumulative: riverCumulative },
      ];
    }

    return [
      { name: 'PRE', potSize: basePot, cumulative: Math.abs( heroInvested ) },
      { name: 'FLOP', potSize: basePot * 3, cumulative: Math.abs( heroInvested ) + ( basePot * 0.33 ) },
      { name: 'TURN', potSize: basePot * 9, cumulative: Math.abs( heroInvested ) + ( basePot * 1.5 ) },
      { name: 'RIVER', potSize: basePot * 16, cumulative: Math.abs( heroInvested ) + ( basePot * 3.5 ) },
    ];
  }, [ heroInvested, currentPot, activeNodelock ] );

  const handleIcmResult = useCallback( ( streetName: string, res: PerspectivaResult | null ) =>
  {
    setAsyncResults( prev => ( { ...prev, [ streetName ]: res } ) );
  }, [] );

  // SOTA: Cálculo Direto e Síncrono (Web Worker Apagado para Fricção Zero) com tipagem estrita
  useEffect( () =>
  {
    for ( const street of streetProgression )
    {
      let finalRealization = realizationFactor;
      if ( activeNodelock?.type === 'block_bet' ) {
          finalRealization += 0.15; // Bônus multiplicador por controle de SPR
      }

      const input: PerspectivaInput = {
        stacks: initialStacks,
        prizes: initialPrizes,
        heroIdx,
        villainIdx: primaryVillainIdx, // SOTA: O main villain dita o effStack base para Edge/RIO
        potSize: street.potSize,
        heroCost: street.cumulative,
        winProb: equity / 100,
        realizationFactor: finalRealization, // SOTA: Dinâmico e sobreponível
        edgeBase: 1 + ( deltaHabilidade / 100 ),
        bountyValue: pkoValue * 100,
        kappa,
        numPlayersInPot: simulatedActivePlayers, // SOTA: RIO quadrático reage a múltiplos vilões
        heroPosition: absoluteHeroPos, // SOTA: Força FGS a respeitar a seleção exata do painel
        blindsRisingSoon
      };

      let res = calculatePerspectivaVitoi( input );

      if ( activeNodelock?.type === 'block_bet' && res ) {
         const baseB20Ev = res.perspectivaPct ?? 0;
         const b20Effectiveness = baseB20Ev * Math.min(1, kappa + 0.3); // Integração Bayesiana
         res = { ...res, perspectivaPct: b20Effectiveness };
      }

      handleIcmResult( street.name, res );
    }
  }, [ heroIdx, primaryVillainIdx, equity, pkoValue, kappa, anteSize, simulatedActivePlayers, blindsRisingSoon, deltaHabilidade, streetProgression, initialStacks, initialPrizes, handleIcmResult, absoluteHeroPos, realizationFactor, activeNodelock ] );

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
      ecosystem.dispatchNativeEquity( heroRange, villainRange, board );
    }
  };

  return (
    <GlassPanel className="flex flex-col gap-6 p-8 mt-8">
      {/* Header */ }
      <div className="flex flex-col gap-2 pb-4 border-b border-white/5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-[0.6rem] font-black text-accent-indigo-light uppercase tracking-widest bg-accent-indigo/10 border border-accent-indigo/20 px-2.5 py-1 rounded-md">PM Lens</span>
            <h3 className="text-sm font-black text-white tracking-widest uppercase m-0">Framework PM — Referencial Aula 1.2</h3>
          </div>
          <SniperBadge
            pm={ streetMetrics[ 0 ]?.PM ?? 0 }
            ci={ streetMetrics[ 0 ]?.ci ?? null }
            stackEff={ Math.min( initialStacks[ heroIdx ] ?? 0, initialStacks[ primaryVillainIdx ] ?? 0 ) }
          />
        </div>
        <p className="text-xs text-text-muted leading-relaxed m-0 font-medium italic">
          Telemetria Contínua de Sunk Cost. Motor ICM isolado (SOTA Offloading).
        </p>
      </div>

      {/* Controles */ }
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(300px,400px)] xl:grid-cols-[1fr_minmax(350px,450px)] gap-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col xl:flex-row gap-6 xl:gap-10">
            <div className="flex-1">
              <PmLensTooltip title="Agressor (Hero)" content="O agente ativo da equação. Seu stack atual define a margem de manobra (SPR) e a resistência estrutural à pressão do ICM." align="left" theme="indigo">
                <div className="text-[0.65rem] text-text-muted font-black uppercase tracking-widest mb-2.5 cursor-help hover:text-white transition-colors">Hero</div>
              </PmLensTooltip>
              <div className="flex flex-wrap gap-2">
                { PLAYERS.slice( 0, initialStacks.length ).map( ( p, i ) => ( <SelectBtn key={ p } label={ `${ p } ${ initialStacks[ i ] }bb` } active={ heroIdx === i } impossible={ villainIndices.includes( i ) } onClick={ () => setHeroIdx( i ) } /> ) ) }
              </div>
            </div>
            <div className="flex-1">
              <PmLensTooltip title="Defensor(es) (Villain)" content="Selecione múltiplos para simular o Abismo Multiway. O RIO escala quadraticamente com N-oponentes." align="left" theme="indigo">
                <div className="text-[0.65rem] text-text-muted font-black uppercase tracking-widest mb-2.5 cursor-help hover:text-white transition-colors">Villain(s) - Multiway</div>
              </PmLensTooltip>
              <div className="flex flex-wrap gap-2">
                { PLAYERS.slice( 0, initialStacks.length ).map( ( p, i ) => (
                  <SelectBtn key={ p } label={ `${ p } ${ initialStacks[ i ] }bb` } active={ villainIndices.includes( i ) } impossible={ i === heroIdx } onClick={ () => {
                    setVillainIndices( prev => {
                      if ( prev.includes( i ) ) {
                        if ( prev.length === 1 ) return prev; // Mantém ao menos 1 vilão
                        return prev.filter( v => v !== i );
                      }
                      return [ ...prev, i ];
                    } );
                  } } />
                ) ) }
              </div>
            </div>
          </div>

          <div className="bg-bg-deep/50 border border-white/5 rounded-xl p-5 flex flex-col gap-4">
            <h4 className="text-[0.65rem] text-text-muted font-black uppercase tracking-widest m-0">Alavancas de Realização (Abstração SOTA)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className={ `flex justify-between text-[0.6rem] font-black uppercase tracking-widest mb-2 ${ isHeroIP ? 'text-accent-indigo-light' : 'text-accent-danger' }` }>
                  <PmLensTooltip title="Fator de Realização (R)" content="Você pode sobrepor o cálculo automático. Um R>1 significa under-realization do vilão (você extrai mais do que sua equidade pura). R<1 significa que você é blefado ou perde valor na sua equidade." align="left" theme="indigo">
                    <span className="cursor-help hover:text-white transition-colors">Realização (R)</span>
                  </PmLensTooltip>
                  <div className="flex items-center gap-2">
                    { customR !== null && (
                      <button onClick={ () => setCustomR( null ) } className="bg-transparent border-none text-text-dim cursor-pointer p-0 text-[0.65rem] hover:text-white transition-colors" title="Resetar para Auto (SPR + Pos + Agg)">
                        <i className="fa-solid fa-rotate-left"></i> Auto
                      </button>
                    ) }
                    <span className="font-mono text-white">{ Math.round( realizationFactor * 100 ) }%</span>
                  </div>
                </div>
                <input type="range" min={ 0.1 } max={ 2.0 } step={ 0.05 } value={ realizationFactor } onChange={ e => setCustomR( Number( e.target.value ) ) } className={ `w-full cursor-pointer ${ isHeroIP ? 'accent-accent-indigo' : 'accent-accent-danger' }` } />
              </div>

              <div>
                <div className="flex justify-between text-[0.6rem] font-black uppercase tracking-widest mb-2 text-accent-amber">
                  <PmLensTooltip title="Agressividade do Vilão" content="O quão maníaco (Agg>1) ou passivo (Agg<1) é o oponente. Enfrentar agressividade extrema, especialmente OOP, destrói a sua Realização (R) forçando under-realization severo." align="left" theme="indigo">
                    <span className="cursor-help hover:text-white transition-colors">Villain AggFactor</span>
                  </PmLensTooltip>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-white">{ aggFactor.toFixed(2) }x</span>
                  </div>
                </div>
                <input type="range" min={ 0.1 } max={ 3.0 } step={ 0.1 } value={ aggFactor } onChange={ e => setAggFactor( Number( e.target.value ) ) } className="w-full cursor-pointer accent-accent-amber" />
              </div>
            </div>
            { customR === null && (
              <p className="text-[0.6rem] text-text-dim m-0 leading-relaxed">
                <strong className="text-text-muted">Motor R Automático ativado:</strong> Calculando mitigação por SPR ({spr.toFixed(1)}), Posição ({absoluteHeroPos}) e Pressão de Agg ({aggFactor.toFixed(1)}x).
              </p>
            ) }
          </div>

          {/* SOTA: Nodelock B20 */}
          <div className="bg-bg-deep/50 border border-white/5 rounded-xl p-5 flex flex-col gap-4 mt-2">
             <div className="flex justify-between items-center">
                 <h4 className="text-[0.65rem] text-text-muted font-black uppercase tracking-widest m-0">Tática de Ancoragem (Nodelock)</h4>
                 <button
                    onClick={() => setActiveNodelock(prev => prev ? null : { type: 'block_bet', sizePct: 0.20, freqOverride: 1.0 })}
                    className={`px-3 py-1.5 rounded-lg text-[0.6rem] font-black uppercase tracking-widest transition-all cursor-pointer border ${activeNodelock ? 'bg-accent-indigo/20 border-accent-indigo/40 text-accent-indigo-light shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'bg-transparent border-white/10 text-text-dim hover:text-white hover:border-white/30'}`}
                 >
                    {activeNodelock ? 'Block Bet 20% ATIVO' : 'Ativar Block Bet 20%'}
                 </button>
             </div>
             {activeNodelock && (
                 <p className="text-[0.6rem] text-accent-indigo-light m-0 leading-relaxed font-medium italic">
                    <strong className="font-bold not-italic">Nodelock Aplicado:</strong> O crescimento do SPR foi mitigado (+40% por street em vez do Padrão Geométrico). Fator de Realização bonificado em +0.15. Métrica ajustada pelo Axioma Lipe Piv (Credibilidade <span className="font-mono">{Math.min(1, kappa + 0.3).toFixed(2)}x</span>).
                 </p>
             )}
          </div>
        </div>

        <div className="bg-bg-deep border border-white/5 rounded-xl p-6 flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-6">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="text" placeholder="Hero (ex: 22+)" value={ heroRange } onChange={ e => setHeroRange( e.target.value ) } className="w-full bg-bg-base border border-white/10 text-white text-[0.65rem] font-mono px-3 py-2 rounded-lg focus:outline-none focus:border-accent-indigo transition-colors placeholder:text-text-darker" />
              <input type="text" placeholder="Vilão (ex: ATo+)" value={ villainRange } onChange={ e => setVillainRange( e.target.value ) } className="w-full bg-bg-base border border-white/10 text-white text-[0.65rem] font-mono px-3 py-2 rounded-lg focus:outline-none focus:border-accent-indigo transition-colors placeholder:text-text-darker" />
            </div>
            <div className="grid grid-cols-[1fr_minmax(120px,max-content)] gap-3">
              <input type="text" placeholder="Board (ex: Ah Td 7c)" value={ board } onChange={ e => setBoard( e.target.value ) } className="w-full bg-bg-base border border-white/10 text-accent-emerald-light text-[0.65rem] font-mono px-3 py-2 rounded-lg focus:outline-none focus:border-accent-emerald transition-colors placeholder:text-text-darker" />

              <div className="flex bg-bg-base border border-white/10 rounded-lg p-1">
                <PmLensTooltip title="Sizing Profile" content="Define a agressão de apostas projetada para as próximas streets, explodindo o pote de forma geométrica." align="center" theme="indigo">
                  <select value={ betSizing } onChange={ e => setBetSizing( Number( e.target.value ) ) } className="w-full bg-transparent text-[0.65rem] font-mono font-black text-text-muted uppercase outline-none px-2 cursor-pointer">
                    <option value={0.33}>33% Pot</option>
                    <option value={0.50}>50% Pot</option>
                    <option value={0.75}>75% Pot</option>
                    <option value={1.20}>120% Pot</option>
                  </select>
                </PmLensTooltip>
              </div>
            </div>
            <PmLensTooltip title="Motor Quântico O(1)" content="Invoca o Web Worker nativo em Rust para triturar as matrizes combinatórias via Monte Carlo. Suporta texturas de Flop/Turn/River." align="center" theme="indigo">
              <button onClick={ handleCalculateEquity } disabled={ isCalculatingEq || !heroRange || !villainRange } className="w-full py-2.5 bg-accent-indigo/20 text-accent-indigo-light border border-accent-indigo/40 rounded-lg text-[0.65rem] font-black uppercase tracking-widest hover:bg-accent-indigo/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                { isCalculatingEq ? 'Processando WASM...' : 'Injetar GTO (WASM)' }
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
              <span className={ `px-2 py-1 rounded text-[0.55rem] font-black uppercase tracking-widest ${ s.PM > 0 ? 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20' : 'bg-accent-danger/10 text-accent-danger border border-accent-danger/20' }` }>
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
