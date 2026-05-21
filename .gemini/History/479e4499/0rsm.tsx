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
 * BINDING: [lib/perspectiva.ts, lib/rpDeriver.ts, workers/icm.worker.ts]
 */

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useDebouncedLocalStorage } from '../hooks/useDebouncedLocalStorage';
import { SotaWasmActionsContext, SotaWasmStateContext } from '../SotaContext';

// =============================================================================
// DADOS DO REFERENCIAL (Aula 1.2) — única fonte de verdade
// =============================================================================

const PLAYERS = [ 'UTG', 'EP', 'MP1', 'MP2', 'HJ', 'CO', 'BU', 'SB', 'BB' ];
const STACKS = [ 9.4, 52.4, 22.2, 7, 44.3, 24.3, 40, 13.4, 55 ];
const PRIZES = [ 237.34, 170.96, 135.17, 109.99, 90.28, 73.95, 59.92, 47.56, 36.47 ];

const RP_HRC: number[][] = [
  [ 0, 12, 10.5, 5.2, 11.8, 10.7, 11.6, 9.2, 12.1 ],
  [ 2.4, 0, 6.2, 1.8, 16.2, 7, 21.2, 3.5, 22.6 ],
  [ 4.8, 18, 0, 3.5, 17.6, 16, 17.3, 7.3, 18.1 ],
  [ 6.1, 9.6, 8.4, 0, 9.5, 8.6, 9.7, 7.2, 9.7 ],
  [ 2.8, 21.7, 7.4, 2.1, 0, 8.3, 17.3, 4.1, 21.8 ],
  [ 4.5, 18.5, 15.1, 3.3, 18.1, 0, 17.8, 6.8, 18.6 ],
  [ 3.1, 13.7, 8.2, 2.3, 20.7, 9.2, 0, 4.5, 21.4 ],
  [ 6.7, 14.6, 13, 4.6, 14.3, 13, 14.2, 0, 14.7 ],
  [ 2.3, 20.4, 5.9, 1.7, 15.1, 6.6, 12.9, 3.4, 0 ],
];

// =============================================================================
// HELPERS VISUAIS
// =============================================================================

const PmLensTooltip = ( { title, desc, align = 'center', children }: { title: string, desc: string, align?: 'left' | 'center' | 'right', children: React.ReactNode } ) => {
  const alignClasses = {
    left: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    right: 'right-0'
  };
  return (
    <div className="relative group inline-flex items-center">
      { children }
      <div className={ `absolute bottom-full ${alignClasses[ align ]} mb-2 w-60 sm:w-72 max-w-[85vw] p-3 bg-[#0a0f1c] border border-indigo-500/30 rounded-lg shadow-[0_10px_30px_-15px_rgba(99,102,241,0.4)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none` }>
        <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-1">{ title }</p>
        <p className="text-neutral-300 text-[10px] leading-relaxed font-sans">{ desc }</p>
      </div>
    </div>
  );
};

const MONO: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };

function fmtPct ( v: number, d = 2 ): string {
  return `${v >= 0 ? '+' : ''}${v.toFixed( d )}%`;
}

function pmColor ( v: number ): string {
  if ( v > 0 ) return '#008b45'; // spring_green4
  return '#cd5c5c'; // indian_red
}

function SelectBtn ( { label, active, impossible, onClick }: Readonly<{
  label: string;
  active: boolean;
  impossible?: boolean;
  onClick: () => void;
}> ) {
  let bg = 'rgba(30,41,59,0.8)';
  let txt = 'var(--text-muted)';
  if ( impossible )
  {
    bg = 'rgba(244,63,94,0.08)';
    txt = 'color-mix(in srgb, var(--accent-danger) 60%, transparent)';
  } else if ( active )
  {
    bg = 'var(--accent-indigo)';
    txt = 'var(--text-main)';
  }

  return (
    <button
      onClick={ onClick }
      disabled={ impossible }
      style={ {
        padding: '0.22rem 0.55rem', borderRadius: '6px', fontSize: '0.58rem', fontWeight: 700,
        border: impossible ? '1px solid rgba(244,63,94,0.3)' : 'none',
        cursor: impossible ? 'not-allowed' : 'pointer', background: bg, color: txt, transition: 'background 0.15s', opacity: impossible ? 0.6 : 1,
      } }
    >
      { label }
    </button>
  );
}

function MetricRow ( { label, value, color, loading, tooltipTitle, tooltipDesc }: Readonly<{ label: string; value: string; color: string; loading?: boolean; tooltipTitle?: string; tooltipDesc?: string }> ) {
  const labelEl = <span style={ { fontSize: '0.58rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', cursor: tooltipTitle ? 'help' : 'default' } } className={ tooltipTitle ? 'hover:text-indigo-400 transition-colors' : '' }>{ label }</span>;
  return (
    <div style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }>
      { tooltipTitle && tooltipDesc ? (
        <PmLensTooltip title={ tooltipTitle } desc={ tooltipDesc } align="left">
          { labelEl }
        </PmLensTooltip>
      ) : labelEl }
      <span style={ { fontSize: '0.68rem', color: loading ? 'var(--text-darker)' : color, fontWeight: 800, ...MONO } }>{ loading ? '...' : value }</span>
    </div>
  );
}

function renderVerdictText ( loading: boolean, pm: number ) {
  if ( loading ) return '...';
  return pm > 0 ? 'SOBERANO' : 'INSOLVENTE';
}

function renderCi ( loading: boolean, ci: number | null ) {
  if ( loading ) return '...';
  return ci === null ? '—' : ci.toFixed( 2 );
}


// =============================================================================
// COMPONENTE
// =============================================================================

interface PmLensPanelProps {
  anteSize?: number;
  heroInvested?: number;
  currentPot?: number;
  activePlayers?: number;
  heroPosition?: 'IP' | 'SB' | 'BB';
  blindsRisingSoon?: boolean;
  initialStacks?: number[];
  initialPrizes?: number[];
}

export default function PmLensPanel ( { anteSize = 12.5, heroInvested = 1.125, currentPot = 2.5, activePlayers = 2, heroPosition = 'BB', blindsRisingSoon = false, initialStacks = STACKS, initialPrizes = PRIZES }: Readonly<PmLensPanelProps> ) {
  const [ heroIdx, setHeroIdx ] = useState( () => Math.min( 8, initialStacks.length - 1 ) );
  const [ villainIdx, setVillainIdx ] = useState( () => Math.min( 6, Math.max( 0, initialStacks.length - 3 ) ) );
  const [ pkoValue, setPkoValue ] = useState( 0 );
  const [ kappa, setKappa ] = useState( 0.5 );
  const [ deltaHabilidade ] = useDebouncedLocalStorage<number>( 'vitoi_pm_delta_habilidade', 50 );
  const [ customR, setCustomR ] = useState<number | null>( null );

  // SOTA: Ordem de ação Pós-Flop e Avaliação Relativa Dinâmica
  // SB(0), BB(1), UTG(2), EP(3), MP1(4), MP2(5), HJ(6), CO(7), BU(8)
  const getPostFlopOrder = ( idx: number ) => {
    if ( idx === 7 ) return 0;
    if ( idx === 8 ) return 1;
    return idx + 2;
  };
  const isHeroIP = getPostFlopOrder( heroIdx ) > getPostFlopOrder( villainIdx );
  const defaultR = isHeroIP ? 1 : 0.85;
  const realizationFactor = customR ?? defaultR;

  // SOTA: Restaura a âncora posicional sistêmica automaticamente quando a colisão é invertida
  useEffect( () => {
    setCustomR( null );
  }, [ isHeroIP ] );

  // SOTA: Sincronização Termodinâmica com o Controle Espacial Global (Antevisão)
  useEffect( () => {
    if ( heroPosition === 'BB' ) setHeroIdx( Math.min( 8, initialStacks.length - 1 ) );
    else if ( heroPosition === 'SB' ) setHeroIdx( Math.min( 7, Math.max( 0, initialStacks.length - 2 ) ) );
    else if ( heroPosition === 'IP' ) setHeroIdx( Math.min( 6, Math.max( 0, initialStacks.length - 3 ) ) );
  }, [ heroPosition, initialStacks.length ] );

  let absoluteHeroPos: 'IP' | 'SB' | 'BB' = 'IP';
  if ( heroIdx === 8 ) absoluteHeroPos = 'BB';
  else if ( heroIdx === 7 ) absoluteHeroPos = 'SB';

  // SOTA: Consumo da Store Global (Actions e State isolados)
  const wasmActions = useContext( SotaWasmActionsContext );
  const wasmState = useContext( SotaWasmStateContext );

  const equity = wasmState?.nativeRangeMetric?.equity ?? 50;
  const isCalculatingEq = wasmState?.nativeRangeMetric?.isCalculating ?? false;

  // SOTA: Detecção do Vetor de Manutenção de Monopólio
  const totalTableChips = useMemo( () => initialStacks.reduce( ( acc, val ) => acc + val, 0 ), [ initialStacks ] );
  const monopolyFactor = totalTableChips > 0 ? ( initialStacks[ heroIdx ] || 0 ) / totalTableChips : 0;
  const isMonopolist = monopolyFactor >= 0.35;

  // SOTA: Auto-healing para prevenir crash se o usuário alterar para um cenário com menos jogadores (Ex: 6-max)
  useEffect( () => {
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
  const [ asyncResults, setAsyncResults ] = useState<Record<string, Record<string, unknown>>>( {} );

  // SOTA: Telemetria de Sunk Cost Contínua
  const streetProgression = useMemo( () => {
    // Projeção Termodinâmica ancorada na Realidade (Current Pot) do Simulador Mestre.
    const basePot = Math.max( 2.5, currentPot );
    return [
      { name: 'PRE', potSize: basePot, cumulative: Math.abs( heroInvested ) },
      { name: 'FLOP', potSize: basePot * 3, cumulative: Math.abs( heroInvested ) + ( basePot * 0.33 ) },
      { name: 'TURN', potSize: basePot * 9, cumulative: Math.abs( heroInvested ) + ( basePot * 1.5 ) },
      { name: 'RIVER', potSize: basePot * 16, cumulative: Math.abs( heroInvested ) + ( basePot * 3.5 ) },
    ];
  }, [ heroInvested, currentPot ] );

  const handleIcmResult = React.useCallback( ( streetName: string, res: Record<string, unknown> ) => {
    setAsyncResults( prev => ( { ...prev, [ streetName ]: res } ) );
  }, [] );

  // SOTA: Offloading Completo para o Web Worker
  // SOTA Audit: O useEffect depende estritamente do dispatcher estável e dos inputs reais.
  useEffect( () => {
    if ( wasmActions?.dispatchIcmPerspectiva === undefined ) return;

    for ( const street of streetProgression )
    {
      const input = {
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
        blindCost: 1.5 + ( anteSize / 100 ),
        kappa,
        numPlayersInPot: activePlayers,
        heroPosition: absoluteHeroPos, // SOTA: Força FGS a respeitar a seleção exata do painel
        blindsRisingSoon
      };

      wasmActions.dispatchIcmPerspectiva( input, ( res ) => handleIcmResult( street.name, res ) );
    }
  }, [ heroIdx, villainIdx, equity, pkoValue, kappa, anteSize, activePlayers, blindsRisingSoon, deltaHabilidade, streetProgression, initialStacks, initialPrizes, wasmActions?.dispatchIcmPerspectiva, handleIcmResult, absoluteHeroPos, realizationFactor ] );

  const buildStreetMetric = React.useCallback( ( street: typeof streetProgression[ 0 ], res: Record<string, unknown> | undefined ) => {
    if ( !res ) return { name: street.name, potSize: street.potSize, heroCost: street.cumulative, evFold: 0, fgsHealth: 1, rio: 0, ci: null, PM: 0, loading: true };
    return {
      name: street.name,
      potSize: street.potSize,
      heroCost: street.cumulative,
      evFold: Number( res.dynamicEvFold ?? 0 ),
      fgsHealth: Number( res.fgsHealth ?? 1 ),
      rio: Number( res.rioLiability ?? 0 ),
      ci: res.ci != null ? Number( res.ci ) : null,
      PM: Number( res.perspectivaPct ?? 0 ),
      loading: false
    };
  }, [] );

  const streetMetrics = useMemo( () => {
    return streetProgression.map( street => buildStreetMetric( street, asyncResults[ street.name ] ) );
  }, [ asyncResults, streetProgression, buildStreetMetric ] );

  const handleCalculateEquity = () => {
    if ( wasmActions?.dispatchNativeEquity && heroRange && villainRange )
    {
      wasmActions.dispatchNativeEquity( heroRange, villainRange, '' );
    }
  };

  return (
    <div style={ { marginTop: '2rem', padding: '1.2rem 1.4rem', background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '14px' } }>
      {/* Header */ }
      <div style={ { marginBottom: '1.1rem' } }>
        <div style={ { display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.3rem' } }>
          <span style={ { fontSize: '0.48rem', fontWeight: 900, color: 'var(--accent-indigo)', textTransform: 'uppercase', letterSpacing: '0.18em', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', padding: '3px 8px', borderRadius: '5px' } }>PM Lens</span>
          <h4 style={ { margin: 0, fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-bright)' } }>Framework PM — Referencial Aula 1.2</h4>
          { isMonopolist && (
            <span style={ { fontSize: '0.55rem', fontWeight: 900, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.15em', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '2px 8px', borderRadius: '4px', boxShadow: '0 0 10px rgba(245, 158, 11, 0.2)' } }>
              Monopólio Mf { ( monopolyFactor * 100 ).toFixed( 1 ) }%
            </span>
          ) }
        </div>
        <p style={ { margin: 0, fontSize: '0.58rem', color: 'var(--text-dim)', lineHeight: 1.5 } }>
          Sistema de Telemetria Contínua (Sunk Cost). O motor ICM roda em Worker isolado (SOTA Offloading).
          PM = Expectativa da Ação - Expectativa do Fold.
        </p>
      </div>

      {/* Controles */ }
      <div style={ { display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '1.1rem' } }>
        <div style={ { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' } }>
          <div>
            <PmLensTooltip title={ isMonopolist ? "Hero (Monopolista)" : "Agressor (Hero)" } desc={ isMonopolist ? "Você controla 35%+ do ecossistema. RIO decai abruptamente e as rotações de blinds dos oponentes geram FGS positivo passivo." : "O agente ativo da equação. Seu stack atual define a margem de manobra (SPR) e a resistência estrutural à pressão do ICM." } align="left">
              <div style={ { fontSize: '0.52rem', color: isMonopolist ? 'var(--accent-gold)' : 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem', cursor: 'help' } } className="hover:text-indigo-400 transition-colors">
                Hero { isMonopolist && <i className="fa-solid fa-crown ml-1"></i> }
              </div>
            </PmLensTooltip>
            <div style={ { display: 'flex', flexWrap: 'wrap', gap: '0.3rem' } }>
              { PLAYERS.slice( 0, initialStacks.length ).map( ( p, i ) => ( <SelectBtn key={ p } label={ `${p} ${initialStacks[ i ]}bb` } active={ heroIdx === i } impossible={ i === villainIdx } onClick={ () => setHeroIdx( i ) } /> ) ) }
            </div>
          </div>
          <div>
            <PmLensTooltip title="Defensor (Villain)" desc="O passivo da colisão. O stack efetivo entre ambos dita o teto de perda e o risco instantâneo de eliminação (Bubble Factor)." align="left">
              <div style={ { fontSize: '0.52rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem', cursor: 'help' } } className="hover:text-indigo-400 transition-colors">Villain</div>
            </PmLensTooltip>
            <div style={ { display: 'flex', flexWrap: 'wrap', gap: '0.3rem' } }>
              { PLAYERS.slice( 0, initialStacks.length ).map( ( p, i ) => ( <SelectBtn key={ p } label={ `${p} ${initialStacks[ i ]}bb` } active={ villainIdx === i } impossible={ i === heroIdx } onClick={ () => setVillainIdx( i ) } /> ) ) }
            </div>
          </div>
        </div>

        <div style={ { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' } }>
          <div style={ { display: 'flex', flexDirection: 'column', gap: '1rem' } }>
            <div>
              <div style={ { display: 'flex', justifyContent: 'space-between', fontSize: '0.52rem', color: isHeroIP ? 'var(--accent-indigo)' : 'var(--accent-danger)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' } }>
                <PmLensTooltip title="Fator de Realização (R)" desc={ `Ancorado em ${isHeroIP ? '100% (IP)' : '85% (OOP)'} para a colisão ${PLAYERS[ heroIdx ]} vs ${PLAYERS[ villainIdx ]}. Contudo, a realização é elástica: sofre mutação pela Profundidade de Stack (a desvantagem OOP é mitigada com 10bb e amplificada com 80bb), Edge Relativa e Agressividade do Vilão. Calibre a realidade termodinâmica da mesa.` } align="left">
                  <span style={ { cursor: 'help' } } className={ `hover:text-${isHeroIP ? 'indigo' : 'red'}-400 transition-colors` }>Realização (R)</span>
                </PmLensTooltip>
                <div style={ { display: 'flex', alignItems: 'center', gap: '6px' } }>
                  { customR !== null && (
                    <button onClick={ () => setCustomR( null ) } style={ { background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 0, fontSize: '0.55rem' } } title="Resetar para âncora posicional (SOTA)">
                      <i className="fa-solid fa-rotate-left hover:text-white transition-colors"></i>
                    </button>
                  ) }
                  <span style={ { color: isHeroIP ? 'var(--accent-indigo-light)' : 'var(--accent-danger-light)', ...MONO } }>{ Math.round( realizationFactor * 100 ) }%</span>
                </div>
              </div>
              <input type="range" min={ 0.5 } max={ 1.5 } step={ 0.05 } value={ realizationFactor } onChange={ e => setCustomR( Number( e.target.value ) ) } style={ { width: '100%', accentColor: isHeroIP ? 'var(--accent-indigo)' : 'var(--accent-danger)' } } />
            </div>
            <div>
              <div style={ { display: 'flex', justifyContent: 'space-between', fontSize: '0.52rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' } }>
                <PmLensTooltip title="Equidade Bruta (Raw Equity)" desc="Probabilidade isolada de vencer no Showdown (Vácuo). Totalmente cega para o FGS, RIO e Pressão de ICM." align="left">
                  <span style={ { cursor: 'help' } } className="hover:text-indigo-400 transition-colors">Equity</span>
                </PmLensTooltip>
                <span style={ { color: 'var(--accent-indigo-light)', ...MONO } }>{ equity }%</span>
              </div>
              <input type="range" min={ 0 } max={ 100 } value={ equity } onChange={ e => wasmActions?.setManualEquity?.( Number( e.target.value ) ) } style={ { width: '100%', accentColor: 'var(--accent-indigo)' } } />
            </div>
          </div>

          <div style={ { display: 'flex', flexDirection: 'column', gap: '1rem' } }>
            <div>
              <div style={ { display: 'flex', justifyContent: 'space-between', fontSize: '0.52rem', color: 'var(--accent-amber)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' } }>
                <PmLensTooltip title="Poder de Bounty (PKO)" desc="Distorção matemática progressiva. Afrouxa a pressão de sobrevivência do ICM quando cobrimos a stack do oponente." align="left">
                  <span style={ { cursor: 'help' } } className="hover:text-amber-400 transition-colors">Bounty PKO</span>
                </PmLensTooltip>
                <span style={ { color: 'var(--accent-gold)', ...MONO } }>{ Math.round( pkoValue * 100 ) }%</span>
              </div>
              <input type="range" min={ 0 } max={ 0.8 } step={ 0.05 } value={ pkoValue } onChange={ e => setPkoValue( Number.parseFloat( e.target.value ) ) } style={ { width: '100%', accentColor: 'var(--accent-amber)' } } />
            </div>
            <div>
              <div style={ { display: 'flex', justifyContent: 'space-between', fontSize: '0.52rem', color: 'var(--accent-pink)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' } }>
                <PmLensTooltip title="Taxa de Maluquice (Kappa κ)" desc="Frequência estimada de que o vilão executará as linhas teóricas do Nash sem ceder ao Tilt ou Bobagem Humana." align="left">
                  <span style={ { cursor: 'help' } } className="hover:text-pink-400 transition-colors">Credibilidade κ</span>
                </PmLensTooltip>
                <span style={ { color: 'var(--accent-pink-light)', ...MONO } }>{ Math.round( kappa * 100 ) }%</span>
              </div>
              <input type="range" min={ 0 } max={ 1 } step={ 0.05 } value={ kappa } onChange={ e => setKappa( Number( e.target.value ) ) } style={ { width: '100%', accentColor: 'var(--accent-pink)' } } />
            </div>
          </div>

          <div style={ { display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' } }>
            <div style={ { padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px' } }>
              <div style={ { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.6rem' } }>
                <input type="text" placeholder="Hero (ex: 22+)" value={ heroRange } onChange={ e => setHeroRange( e.target.value ) } style={ { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', fontSize: '0.6rem', padding: '0.3rem 0.5rem', borderRadius: '4px' } } />
                <input type="text" placeholder="Vilão (ex: ATo+)" value={ villainRange } onChange={ e => setVillainRange( e.target.value ) } style={ { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', fontSize: '0.6rem', padding: '0.3rem 0.5rem', borderRadius: '4px' } } />
              </div>
              <PmLensTooltip title="Motor Quântico O(1)" desc="Invoca o Web Worker nativo em Rust para triturar as matrizes combinatórias via Monte Carlo (10.000 iterações em <50ms)." align="center">
                <button onClick={ handleCalculateEquity } disabled={ isCalculatingEq || !heroRange || !villainRange } style={ { width: '100%', padding: '0.4rem', background: 'rgba(99,102,241,0.15)', color: 'var(--accent-indigo-light)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', cursor: ( isCalculatingEq || !heroRange || !villainRange ) ? 'not-allowed' : 'pointer' } }>
                  { isCalculatingEq ? 'Processando Quântico...' : 'Injetar GTO (WASM)' }
                </button>
              </PmLensTooltip>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Cartões por Street (Erradicando o Espaço Vazio e Restaurando os Dados) */ }
      <div style={ { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '1.5rem' } }>
        { streetMetrics.map( s => (
          <div key={ s.name } style={ { background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' } }>
            <div style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' } }>
              <span style={ { fontSize: '0.85rem', fontWeight: 900, color: 'var(--accent-indigo)', letterSpacing: '0.1em' } }>{ s.name }</span>
              <span style={ { padding: '3px 8px', borderRadius: '4px', fontSize: '0.55rem', fontWeight: 800, background: s.PM > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)', color: s.PM > 0 ? 'var(--accent-emerald)' : 'var(--accent-danger)' } }>
                { renderVerdictText( s.loading, s.PM ) }
              </span>
            </div>
            <div style={ { display: 'flex', flexDirection: 'column', gap: '0.5rem' } }>
              <MetricRow label="Sunk Cost" value={ `-${s.heroCost.toFixed( 2 )}bb` } color="var(--text-dim)" loading={ s.loading } tooltipTitle="O Abismo do Fold (Sunk Cost)" tooltipDesc="Fichas investidas não lhe pertencem mais. Elas ditam a profundidade do custo irrecuperável de desistir." />
              <MetricRow label="Piso (EV_fold)" value={ `${s.evFold.toFixed( 2 )}%` } color="var(--accent-danger)" loading={ s.loading } tooltipTitle="Baseline Dinâmico (EV_Fold)" tooltipDesc="A Esperança de simplesmente desistir e ceder o pote. Qualquer ação deve superar matematicamente esta âncora." />
              <MetricRow label="Passivo (RIO)" value={ `${s.rio.toFixed( 2 )}%` } color="var(--accent-amber)" loading={ s.loading } tooltipTitle="Catástrofe Silenciosa (RIO)" tooltipDesc="O custo passivo de 'acertar e continuar perdendo'. Infla geometricamente (x²) em cenários Multiway." />
              <MetricRow label="FGS Health" value={ `${s.fgsHealth.toFixed( 2 )}x` } color="var(--accent-violet)" loading={ s.loading } tooltipTitle="Erosão Antecipada (FGS t-3)" tooltipDesc="Punição gravitacional na órbita. Antecipa o dano do Big Blind iminente, forçando agressão para não morrer cego." />
              <MetricRow label="Insolvência (Cᵢ)" value={ renderCi( s.loading, s.ci ) } color={ s.ci !== null && s.ci < 1 ? 'var(--accent-danger)' : 'var(--accent-emerald)' } loading={ s.loading } tooltipTitle="Coeficiente de Insolvência (Ci)" tooltipDesc="Se Cᵢ < 1, as Pot Odds mentem. A mão não possui equidade suficiente para superar o passivo do RIO e do ICM." />
            </div>
            <div style={ { marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }>
              <PmLensTooltip title="A Métrica Soberana (PM)" desc="A verdadeira utilidade da ação: (Expectativa - RIO) - EV_Fold. Exige que a ação rompa a inércia destrutiva do fold." align="left">
                <span style={ { fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'help' } }>Perspectiva</span>
              </PmLensTooltip>
              <span style={ { fontSize: '1.2rem', fontWeight: 900, color: pmColor( s.PM ), ...MONO } }>{ s.loading ? '...' : fmtPct( s.PM ) }</span>
            </div>
          </div>
        ) ) }
      </div>
    </div>
  );
}
