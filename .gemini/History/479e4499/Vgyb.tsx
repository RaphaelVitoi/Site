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
 * PERFORMANCE: dois memos separados.
 *   icmDeltas — roda M-H (caro) só quando muda o matchup (heroIdx/villainIdx).
 *   streetMetrics — aritmética pura (barato) roda a cada mudança de equity/R.
 *   Slider não dispara M-H.
 *
 * BINDING: [lib/perspectiva.ts, lib/rpDeriver.ts]
 */

import { MetricTooltip } from '@/app/ICMlaboratory/RiskPremiumDashboard';
import React, { useContext, useMemo, useRef, useState } from 'react';
import { calculatePerspectivaVitoi } from '../../../lib/perspectiva';
import { deriveRps } from '../../../lib/rpDeriver';
import { useDebouncedLocalStorage } from '../hooks/useDebouncedLocalStorage';
import { SotaWasmContext } from '../SotaContext';

// =============================================================================
// DADOS DO REFERENCIAL (Aula 1.2) — única fonte de verdade
// =============================================================================

const PLAYERS = [ 'UTG', 'EP', 'MP1', 'MP2', 'HJ', 'CO', 'BU', 'SB', 'BB' ];
const STACKS = [ 9.4, 52.4, 22.2, 7, 44.3, 24.3, 40, 13.4, 55 ];
const PRIZES = [ 237.34, 170.96, 135.17, 109.99, 90.28, 73.95, 59.92, 47.56, 36.47 ];

// RP calibrado pelo HRC (vitoi.hrcz) — RP[row][col] = RP do jogador linha vs coluna
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

// Streets — potSize = pot total na street (heroCost = potSize/2, simétrico HU)
// Âncora: cenário Paradoxo (BU 40bb vs BB 55bb, Aula 1.2)
const STREETS = [
  { name: 'PRE', potSize: 2.5 },
  { name: 'FLOP', potSize: 7.5 },
  { name: 'TURN', potSize: 22.5 },
  { name: 'RIVER', potSize: 40 },
] as const;

type StreetName = typeof STREETS[ number ][ 'name' ];

// =============================================================================
// HELPERS VISUAIS
// =============================================================================

const MONO: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };

function fmtPct ( v: number, d = 2 ): string {
  return `${v >= 0 ? '+' : ''}${v.toFixed( d )}%`;
}

function pmColor ( v: number ): string {
  // SOTA: Didática Visceral
  // Vermelho (indian_red) se destrutiva, Verde (spring_green4) se amortizar o risco
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
      title={ impossible ? 'Matchup impossível' : undefined }
      style={ {
        padding: '0.22rem 0.55rem',
        borderRadius: '6px',
        fontSize: '0.58rem',
        fontWeight: 700,
        border: impossible ? '1px solid rgba(244,63,94,0.3)' : 'none',
        cursor: impossible ? 'not-allowed' : 'pointer',
        background: bg,
        color: txt,
        transition: 'background 0.15s',
        opacity: impossible ? 0.6 : 1,
      } }
    >
      { label }
    </button>
  );
}

function MetricCell ( { value, color }: Readonly<{ value: string; color: string }> ) {
  return (
    <td style={ {
      padding: '0.5rem 0.65rem',
      textAlign: 'right',
      fontWeight: 700,
      fontSize: '0.68rem',
      color,
      ...MONO,
      whiteSpace: 'nowrap',
    } }>
      { value }
    </td>
  );
}

// SOTA: Tooltip Semântico para PmLens
const LensTooltip = ( { title, desc, align = 'center', children }: { title: string, desc: string, align?: 'left' | 'center' | 'right', children: React.ReactNode } ) => {
  const alignClasses = {
    left: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    right: 'right-0'
  };
  return (
    <div className="relative group inline-flex items-center">
      { children }
      <div className={ `absolute bottom-full ${alignClasses[ align ]} mb-2 w-64 sm:w-72 max-w-[85vw] p-3 bg-[#0a0f1c] border border-indigo-500/30 rounded-lg shadow-[0_10px_30px_-15px_rgba(99,102,241,0.4)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-100 pointer-events-none` }>
        <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-1">{ title }</p>
        <p className="text-neutral-300 text-[10px] leading-relaxed font-sans">{ desc }</p>
      </div>
    </div>
  );
};

// =============================================================================
// TIPOS INTERNOS
// =============================================================================

interface StreetDelta {
  name: StreetName;
  potSize: number;
  heroCost: number;
  evFoldPct: number;
  deltaWinPct: number;
  deltaLosePct: number;
  fgsHealth: number;
  survivalPressure: number;
  bountyPower: number;
}

// =============================================================================
// CACHE DE MÓDULO — pré-computa todos os 72 matchups × 4 streets
// Acesso = O(1) Map.get() — sem computação no render
// =============================================================================

const _deltasCache = new Map<string, StreetDelta[]>();
const MAX_CACHE_SIZE = 3000; // SOTA: Barreira termodinamica contra vazamento de memoria RAM no cliente.

function _deltasKey ( h: number, v: number, pko: number, foldEvBb: number, currentPot: number, anteSize: number ): string {
  return `${h}:${v}:${pko}:${foldEvBb.toFixed( 3 )}:${currentPot.toFixed( 1 )}:${anteSize}`;
}

function _computeMatchupDeltas ( heroIdx: number, villainIdx: number, pkoValue: number, foldEvBb: number, currentPot: number, anteSize: number ): StreetDelta[] {
  return STREETS.map( ( { name, potSize: defaultPot } ) => {
    // SOTA: O potSize dinamico incorpora o Dead Money injetado, dissipando o RP nas streets futuras.
    // O custo (heroCost) passa a ser ancorado rigorosamente no Custo Afundado (EV_fold) mapeado.
    const potSize = Math.max( defaultPot, currentPot );
    const heroCost = Math.max( Math.abs( foldEvBb ), potSize / 2 );

    let evFoldPct = 0, deltaWinPct = 0, deltaLosePct = 0, fgsHealth = 1, survivalPressure = 0, bountyPower = 0;
    try
    {
      // SOTA: A funcao `calculatePerspectivaVitoi` unifica todos os calculos de delta.
      const result = calculatePerspectivaVitoi( {
        stacks: STACKS,
        prizes: PRIZES,
        heroIdx,
        villainIdx,
        potSize,
        heroCost,
        winProb: 0.5,
        realizationFactor: 1,
        edgeBase: 1,
        bountyValue: pkoValue * 100,
        blindCost: 1.5 + ( anteSize / 100 ),
      } );
      ( { deltaWinPct, deltaLosePct, dynamicEvFold: evFoldPct, fgsHealth, survivalPressure, bountyPower = 0 } = result );
    } catch ( e ) { console.debug( '[PmLens] Falha no calculo da Perspectiva:', e ); }

    return {
      name,
      potSize,
      heroCost,
      evFoldPct,
      deltaWinPct,
      deltaLosePct,
      fgsHealth,
      survivalPressure,
      bountyPower
    };
  } );
}

function _getOrComputeDeltas ( h: number, v: number, pko: number, foldEvBb: number, currentPot: number, anteSize: number ): StreetDelta[] {
  const key = _deltasKey( h, v, pko, foldEvBb, currentPot, anteSize );
  const cached = _deltasCache.get( key );
  if ( cached ) return cached;

  if ( _deltasCache.size >= MAX_CACHE_SIZE )
  {
    // SOTA: Evicção LRU parcial (20%) para evitar lag spikes ao destruir o cache inteiro
    const keysToDelete = Array.from( _deltasCache.keys() ).slice( 0, Math.floor( MAX_CACHE_SIZE * 0.2 ) );
    keysToDelete.forEach( k => _deltasCache.delete( k ) );
  }

  const result = _computeMatchupDeltas( h, v, pko, foldEvBb, currentPot, anteSize );
  _deltasCache.set( key, result );
  return result;
}

// =============================================================================
// CACHE DE RP — pré-computa deriveRps (3× M-H) para todos os 72 matchups
// deriveRps é O(3× M-H) por call — sem cache, bloqueia o render no clique
// =============================================================================

const _rpCache = new Map<string, ReturnType<typeof deriveRps>>();

function _getOrComputeRp ( ip: number, oop: number, pko: number ) {
  const key = `${ip}:${oop}:${pko}`;
  if ( _rpCache.has( key ) ) return _rpCache.get( key )!;

  if ( _rpCache.size >= MAX_CACHE_SIZE )
  {
    // SOTA: Evicção LRU parcial
    const keysToDelete = Array.from( _rpCache.keys() ).slice( 0, Math.floor( MAX_CACHE_SIZE * 0.2 ) );
    keysToDelete.forEach( k => _rpCache.delete( k ) );
  }

  let result: ReturnType<typeof deriveRps> = null;
  try { result = deriveRps( STACKS, PRIZES, ip, oop, pko * 100 ); } catch ( e ) { console.debug( '[PmLens] Falha ao derivar RPs:', e ); }
  _rpCache.set( key, result );
  return result;
}

// =============================================================================
// COMPONENTE
// =============================================================================

interface PmLensPanelProps {
  anteSize?: number;
  heroInvested?: number;
  currentPot?: number;
  activePlayers?: number;
}

export default function PmLensPanel ( { anteSize = 12.5, heroInvested = 1, currentPot = 2.5, activePlayers = 2 }: Readonly<PmLensPanelProps> ) {
  // Matchup padrão: BB (8) hero vs BU (6) villain — paradoxo da Aula 1.2
  const [ heroIdx, setHeroIdx ] = useState( 8 );
  const [ villainIdx, setVillainIdx ] = useState( 6 );
  const [ heroIsIp, setHeroIsIp ] = useState( false ); // BB = OOP
  const [ pkoValue, setPkoValue ] = useState( 0 ); // 0-0.8
  const [ kappa, setKappa ] = useState( 0.5 );     // Nível de Credibilidade (Axioma Lipe Piv)
  const [ showIpOopHint, setShowIpOopHint ] = useState( false );
  const [ deltaHabilidade, setDeltaHabilidade ] = useDebouncedLocalStorage<number>( 'vitoi_pm_delta_habilidade', 50 ); // Edge Bruta (0-100)

  // SOTA: Recepção Assíncrona via SotaWasmContext
  const ecosystem = useContext( SotaWasmContext );
  const equity = ecosystem?.nativeRangeMetric?.equity ?? 50;
  const isCalculatingEq = ecosystem?.nativeRangeMetric?.isCalculating ?? false;

  const [ heroRange, setHeroRange ] = useState( '' );
  const [ villainRange, setVillainRange ] = useState( '' );
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>( null );

  const foldEvBb = useMemo( () => {
    let baseInvested: number;
    if ( heroInvested === undefined )
    {
      baseInvested = heroIsIp ? 0 : 1;
      return -( baseInvested + ( anteSize / 100 ) );
    } else
    {
      baseInvested = Math.abs( heroInvested );
      return -baseInvested; // SOTA: heroInvested do MasterSimulator já contém blinds e ante. Erradicação da dupla-contagem.
    }
  }, [ heroInvested, heroIsIp, anteSize ] );

  // --- SOTA: Módulo Assíncrono de Input Bruto via Ecossistema ---
  const handleCalculateEquity = () => {
    if ( ecosystem?.dispatchNativeEquity )
    {
      ecosystem.dispatchNativeEquity( heroRange, villainRange, '' );
    }
  };

  // --- ICM deltas: O(1) via cache de módulo ---
  const icmDeltas: StreetDelta[] = useMemo(
    () => _getOrComputeDeltas( heroIdx, villainIdx, pkoValue, foldEvBb, currentPot, anteSize ),
    [ heroIdx, villainIdx, pkoValue, foldEvBb, currentPot, anteSize ],
  );

  // --- MEMO BARATO: aplica equity e R --- aritmética pura, sem M-H
  const streetMetrics = useMemo( () => {
    const rawEq = equity / 100;

    // SOTA: Amortização da Edge (Fator de Descompressão Exponencial)
    const sEff = Math.min( STACKS[ heroIdx ], STACKS[ villainIdx ] );
    const k = 0.05; // Constante de decaimento logarítmico
    const amortizedEdgeMultiplier = 1 + ( ( deltaHabilidade / 100 ) * ( 1 - Math.exp( -k * sEff ) ) );
    const opponents = Math.max( 1, activePlayers - 1 );
    const mwFactor = Math.pow( opponents, 2 ); // Insolvência Exponencial (x²)

    return icmDeltas.map( ( { name, potSize, heroCost, evFoldPct, deltaWinPct, deltaLosePct, fgsHealth, survivalPressure, bountyPower } ) => {
      const isRiver = name === 'RIVER';
      let R = 1;
      if ( !heroIsIp && !isRiver )
      {
        R = 0.85;
      }

      // Axioma Lipe Piv (Regressão Bayesiana da Credibilidade)
      const baselineEquity = heroCost / potSize;
      const eq = baselineEquity + kappa * ( rawEq - baselineEquity );

      // --- MATEMÁTICA QUÂNTICA VITOI ---
      // 1. A Amortização da Edge infla a eficiência da vitória (Oportunidade de Erro alheia)
      const adjustedDeltaWin = deltaWinPct * amortizedEdgeMultiplier;

      // 2. Insolvência Multiway penaliza o EV_fold com as Reverse Implied Odds (Passivo Estrutural)
      const baseRio = heroCost * 0.15; // Vulnerabilidade heurística base de 15%
      const rioMw = baseRio * mwFactor;

      // SOTA: Equação de Invariância Aplicada (Perspectiva Matemática)
      // PM = (Equity * Realização) * Valuation_stack - (EV_fold + RIO)
      const Valuation_stack = adjustedDeltaWin * fgsHealth; // Prêmio por dominar a stack
      const EV_fold_magnitude = Math.abs( evFoldPct ); // Piso absoluto (Sunk Cost)
      const RIO = rioMw + Math.abs( ( 1 - eq ) * deltaLosePct ); // Passivo de colisão total (Multiway + Perda Direta)

      const PM = ( eq * R ) * Valuation_stack - ( EV_fold_magnitude + RIO );

      const adjustedEvFold = evFoldPct - rioMw;

      // Esperança e Expectativa recalculadas com as novas distorções
      const E = eq * adjustedDeltaWin + ( 1 - eq ) * deltaLosePct;
      const P = eq * adjustedDeltaWin * R * fgsHealth + ( 1 - eq ) * deltaLosePct;

      // Break-even real da Perspectiva Matemática
      const denom = adjustedDeltaWin * R * fgsHealth - deltaLosePct;
      const threshEq = Math.abs( denom ) > 1e-6
        ? Math.max( 0, Math.min( 1, ( adjustedEvFold - deltaLosePct ) / denom ) )
        : null;

      // SOTA: O Coeficiente de Insolvência (C_i)
      const potOdds = heroCost / ( potSize + heroCost );
      const ci = ( threshEq !== null && threshEq > 0 ) ? ( potOdds / threshEq ) : null;

      return { name, potSize, heroCost, evFoldPct: adjustedEvFold, evFoldChips: -heroCost, E, P, R, PM, threshEq, fgsHealth, survivalPressure, bountyPower, ci };
    } );
  }, [ icmDeltas, equity, kappa, heroIsIp, deltaHabilidade, activePlayers, heroIdx, villainIdx ] );

  // --- RP motor vs HRC ---
  const ipIndex = heroIsIp ? heroIdx : villainIdx;
  const oopIndex = heroIsIp ? villainIdx : heroIdx;

  const derivedRp = _getOrComputeRp( ipIndex, oopIndex, pkoValue );
  let motorHeroRp: number | null = null;
  if ( derivedRp )
  {
    motorHeroRp = heroIsIp ? derivedRp.ipRp : derivedRp.oopRp;
  }
  const hrcHeroRp = heroIsIp ? RP_HRC[ heroIdx ][ villainIdx ] : RP_HRC[ villainIdx ][ heroIdx ];
  const rpDelta = motorHeroRp === null || hrcHeroRp === null ? null : motorHeroRp - hrcHeroRp;

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div style={ {
      marginTop: '2rem',
      padding: '1.2rem 1.4rem',
      background: 'rgba(10,15,30,0.7)',
      border: '1px solid rgba(99,102,241,0.25)',
      borderRadius: '14px',
    } }>
      <style>{ `
        @keyframes pmPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        @keyframes pmFadeOut {
          0% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; }
        }
        .pm-hint-dot { animation: pmPulse 1s ease-in-out infinite; }
        .pm-hint-text { animation: pmFadeOut 3s ease forwards; }
      `}</style>

      {/* Header */ }
      <div style={ { marginBottom: '1.1rem' } }>
        <div style={ { display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.3rem' } }>
          <span style={ {
            fontSize: '0.48rem', fontWeight: 900, color: 'var(--accent-indigo)',
            textTransform: 'uppercase', letterSpacing: '0.18em',
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
            padding: '3px 8px', borderRadius: '5px',
          } }>
            PM Lens
          </span>
          <h4 style={ { margin: 0, fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-bright)' } }>
            Framework PM — Referencial Aula 1.2
          </h4>
        </div>
        <p style={ { margin: 0, fontSize: '0.58rem', color: 'var(--text-dim)', lineHeight: 1.5 } }>
          Dados do FT real (9 jogadores, 9 prizes). Equity da mão: input do usuário.
          EV_fold = −heroCost (1ª ordem). PM = Expectativa − EV_fold.
        </p>
      </div>

      {/* Controles */ }
      <div style={ { display: 'flex', flexWrap: 'wrap', gap: '1rem 1.5rem', marginBottom: '1.1rem' } }>

        {/* Hero */ }
        <div>
          <div style={ { fontSize: '0.52rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem' } }>
            Hero
          </div>
          <div style={ { display: 'flex', flexWrap: 'wrap', gap: '0.22rem' } }>
            { PLAYERS.map( ( p, i ) => (
              <SelectBtn
                key={ p }
                label={ `${p} ${STACKS[ i ]}bb` }
                active={ heroIdx === i }
                impossible={ i === villainIdx }
                onClick={ () => {
                  if ( i === villainIdx ) return;
                  // pré-aquece ANTES do setState → render seguinte é O(1)
                  _getOrComputeDeltas( i, villainIdx, pkoValue, foldEvBb, currentPot, anteSize );
                  _getOrComputeDeltas( villainIdx, i, pkoValue, foldEvBb, currentPot, anteSize );
                  _getOrComputeRp( i, villainIdx, pkoValue );
                  _getOrComputeRp( villainIdx, i, pkoValue );
                  setHeroIdx( i );
                } }
              />
            ) ) }
          </div>
        </div>

        {/* Villain */ }
        <div>
          <div style={ { fontSize: '0.52rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem' } }>
            Villain
          </div>
          <div style={ { display: 'flex', flexWrap: 'wrap', gap: '0.22rem' } }>
            { PLAYERS.map( ( p, i ) => (
              <SelectBtn
                key={ p }
                label={ `${p} ${STACKS[ i ]}bb` }
                active={ villainIdx === i }
                impossible={ i === heroIdx }
                onClick={ () => {
                  if ( i === heroIdx ) return;
                  // pré-aquece ANTES do setState → render seguinte é O(1)
                  _getOrComputeDeltas( heroIdx, i, pkoValue, foldEvBb, currentPot, anteSize );
                  _getOrComputeDeltas( i, heroIdx, pkoValue, foldEvBb, currentPot, anteSize );
                  _getOrComputeRp( heroIdx, i, pkoValue );
                  _getOrComputeRp( i, heroIdx, pkoValue );
                  setVillainIdx( i );
                } }
              />
            ) ) }
          </div>
        </div>

        {/* Posição + Equity + PKO */ }
        <div style={ { display: 'flex', flexWrap: 'wrap', gap: '1.5rem' } }>
          <div style={ { display: 'flex', flexDirection: 'column', gap: '0.6rem' } }>
            <div>
              <LensTooltip align="left" title="Posição Estrutural" desc="Vantagem informacional absoluta. IP (In Position) amplifica a Realização de Equidade (R), diluindo a pressão do Risk Premium. OOP sofre desvantagem reativa e maior degradação de EV.">
                <div style={ { fontSize: '0.52rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem', cursor: 'help' } } className="hover:text-indigo-400 transition-colors">
                  Posição
                </div>
              </LensTooltip>
              <div style={ { display: 'flex', gap: '0.3rem', alignItems: 'center' } }>
                <SelectBtn label="IP" active={ heroIsIp } onClick={ () => {
                  if ( heroIsIp ) return;
                  setHeroIsIp( true );
                  setShowIpOopHint( true );
                  if ( hintTimerRef.current ) clearTimeout( hintTimerRef.current );
                  hintTimerRef.current = setTimeout( () => setShowIpOopHint( false ), 2500 );
                } } />
                <SelectBtn label="OOP" active={ !heroIsIp } onClick={ () => {
                  if ( heroIsIp )
                  {
                    setHeroIsIp( false );
                    setShowIpOopHint( true );
                    if ( hintTimerRef.current ) clearTimeout( hintTimerRef.current );
                    hintTimerRef.current = setTimeout( () => setShowIpOopHint( false ), 2500 );
                  }
                } } />
              </div>
            </div>

            <div>
              <LensTooltip align="left" title="Equidade Bruta (Raw Equity)" desc="Sua chance matemática de vencer no Showdown. Em ChipEV, se Equity > Pot Odds o call é viável. Em ICM, a equity precisa superar a gravidade do Risk Premium e as Reverse Implied Odds.">
                <div style={ {
                  display: 'flex', justifyContent: 'space-between', width: '160px',
                  fontSize: '0.52rem', color: 'var(--text-dim)', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem', cursor: 'help'
                } } className="hover:text-indigo-400 transition-colors">
                  <span>Equity Mão</span>
                  <span style={ { color: 'var(--accent-indigo-light)', ...MONO } }>{ equity }%</span>
                </div>
              </LensTooltip>
              <input
                id="pm-lens-equity"
                name="pm-lens-equity"
                type="range"
                min={ 0 } max={ 100 } step={ 1 }
                value={ equity }
                onChange={ e => ecosystem?.setManualEquity?.( Number( e.target.value ) ) }
                style={ { width: '160px', accentColor: 'var(--accent-indigo)', cursor: 'pointer' } }
              />

              {/* SOTA: Módulo de Input Bruto (Phase 1) */ }
              <div style={ { marginTop: '0.6rem', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '6px', width: '160px' } }>
                <LensTooltip align="left" title="A Ferramenta Subserviente" desc="A equidade bruta (ChipEV) é apenas a matéria-prima ignorante. Use este módulo isolado para extrair a chance no vácuo, e deixe o Motor SOTA calcular se ela sobrevive à pressão do torneio.">
                  <div style={ { fontSize: '0.45rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'help' } }>
                    <i className="fa-solid fa-microchip text-indigo-400"></i> Sensor ChipEV
                  </div>
                </LensTooltip>
                <div style={ { display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.4rem' } }>
                  <input id="hero-range-input" name="heroRange" type="text" placeholder="Hero (ex: AhKh)" value={ heroRange } onChange={ e => setHeroRange( e.target.value ) } style={ { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', fontSize: '0.55rem', padding: '0.2rem 0.4rem', borderRadius: '4px', outline: 'none' } } />
                  <input id="villain-range-input" name="villainRange" type="text" placeholder="Vilão (ex: QdQc)" value={ villainRange } onChange={ e => setVillainRange( e.target.value ) } style={ { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', fontSize: '0.55rem', padding: '0.2rem 0.4rem', borderRadius: '4px', outline: 'none' } } />
                </div>
                <button
                  onClick={ handleCalculateEquity }
                  disabled={ isCalculatingEq || !heroRange || !villainRange }
                  style={ { width: '100%', padding: '0.3rem', background: isCalculatingEq ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)', color: isCalculatingEq ? 'var(--text-dim)' : 'var(--accent-indigo-light)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '4px', fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase', cursor: isCalculatingEq || !heroRange || !villainRange ? 'not-allowed' : 'pointer', transition: 'all 0.2s' } }
                >
                  { isCalculatingEq ? 'Processando...' : 'Injetar Equity' }
                </button>
              </div>
            </div>
          </div>

          <div style={ { display: 'flex', flexDirection: 'column', gap: '0.6rem' } }>
            <div>
              <LensTooltip align="right" title="Bounty Power (PKO)" desc="Fração da stack que representa recompensa direta em dinheiro. Infla a agressividade porque a eliminação gera retorno imediato, ignorando a estrutura estática de payjumps convencionais.">
                <div style={ {
                  display: 'flex', justifyContent: 'space-between', width: '160px',
                  fontSize: '0.52rem', color: 'var(--accent-amber)', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem', cursor: 'help'
                } } className="hover:text-amber-400 transition-colors">
                  <span>Bounty PKO</span>
                  <span style={ { color: 'var(--accent-gold)', ...MONO } }>{ Math.round( pkoValue * 100 ) }%</span>
                </div>
              </LensTooltip>
              <input
                id="pm-lens-pko"
                name="pm-lens-pko"
                type="range"
                min={ 0 } max={ 0.8 } step={ 0.05 }
                value={ pkoValue }
                onChange={ e => setPkoValue( Number( e.target.value ) ) }
                style={ { width: '160px', accentColor: 'var(--accent-amber)', cursor: 'pointer' } }
              />
            </div>

            <div>
              <LensTooltip align="right" title="Axioma Lipe Piv (Credibilidade)" desc="A regressão bayesiana que mede o quanto a equity bruta de uma mão é realizável frente à pressão estrutural. Quanto menor o Kappa, mais a sua equity real desaba rumo ao baseline passivo.">
                <div style={ {
                  display: 'flex', justifyContent: 'space-between', width: '160px',
                  fontSize: '0.52rem', color: 'var(--accent-pink)', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem', cursor: 'help'
                } } className="hover:text-pink-400 transition-colors">
                  <span>Credibilidade κ</span>
                  <span style={ { color: 'var(--accent-pink-light)', ...MONO } }>{ Math.round( kappa * 100 ) }%</span>
                </div>
              </LensTooltip>
              <input
                id="pm-lens-kappa"
                name="pm-lens-kappa"
                type="range"
                min={ 0 } max={ 1 } step={ 0.05 }
                value={ kappa }
                onChange={ e => setKappa( Number( e.target.value ) ) }
                style={ { width: '160px', accentColor: 'var(--accent-pink)', cursor: 'pointer' } }
              />
            </div>

            <div>
              <LensTooltip align="right" title="Amortização da Edge" desc="Sua habilidade pura (Δ Habilidade) sofre colapso em stacks curtos devido à falta de ferramentas (poda da árvore de decisão) e à proteção estatística da variância.">
                <div style={ {
                  display: 'flex', justifyContent: 'space-between', width: '160px',
                  fontSize: '0.52rem', color: 'var(--accent-emerald)', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem', cursor: 'help'
                } } className="hover:text-emerald-400 transition-colors">
                  <span>Δ Habilidade</span>
                  <span style={ { color: 'var(--accent-emerald-light)', ...MONO } }>{ deltaHabilidade }%</span>
                </div>
              </LensTooltip>
              <input
                id="pm-lens-delta"
                name="pm-lens-delta"
                type="range"
                min={ 0 } max={ 100 } step={ 5 }
                value={ deltaHabilidade }
                onChange={ e => setDeltaHabilidade( Number( e.target.value ) ) }
                style={ { width: '160px', accentColor: 'var(--accent-emerald)', cursor: 'pointer' } }
              />
            </div>

            { showIpOopHint && (
              <span className="pm-hint-text" style={ {
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                fontSize: '0.5rem', color: 'var(--accent-amber)', fontWeight: 600,
              } }>
                <span className="pm-hint-dot" style={ {
                  width: '5px', height: '5px', borderRadius: '50%',
                  background: 'var(--accent-amber)', display: 'inline-block',
                  flexShrink: 0,
                } } />
                <span>recalculando M-H...</span>
              </span>
            ) }
          </div>
        </div>
      </div>

      {/* Validação RP */ }
      <div style={ {
        display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center',
        padding: '0.65rem 0.9rem',
        background: 'rgba(15,23,42,0.5)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '10px',
        marginBottom: '1rem',
      } }>
        <LensTooltip align="left" title="Confronto de RP (Motor vs HRC)" desc="A diferença (Δ) entre o Risk Premium matemático puro calculado na hora (Motor M-H) e a calibragem empírica extraída de solvers pós-flop avançados (HRC). Revela as distorções que surgem quando os ranges colidem na prática.">
          <div style={ { fontSize: '0.52rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'help' } } className="hover:text-indigo-400 transition-colors">
            RP Hero
          </div>
        </LensTooltip>

        <div style={ { display: 'flex', gap: '1.2rem', flexWrap: 'wrap', alignItems: 'center' } }>
          <div>
            <div style={ { fontSize: '0.5rem', color: 'var(--text-dim)', marginBottom: '2px' } }>Motor M-H</div>
            <div style={ { fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent-indigo-light)', ...MONO } }>
              { motorHeroRp === null ? '—' : `${motorHeroRp.toFixed( 1 )}%` }
            </div>
          </div>
          <div>
            <div style={ { fontSize: '0.5rem', color: 'var(--text-dim)', marginBottom: '2px' } }>HRC Calibrado</div>
            <div style={ { fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent-danger)', ...MONO } }>
              { hrcHeroRp === null ? '—' : `${hrcHeroRp.toFixed( 1 )}%` }
            </div>
          </div>
          { rpDelta !== null && (
            <div>
              <div style={ { fontSize: '0.5rem', color: 'var(--text-dim)', marginBottom: '2px' } }>Δ</div>
              <div style={ { fontSize: '0.72rem', fontWeight: 800, color: Math.abs( rpDelta ) < 2 ? 'var(--accent-emerald)' : 'var(--accent-amber)', ...MONO } }>
                { fmtPct( rpDelta, 1 ) }
              </div>
            </div>
          ) }
          { !derivedRp && (
            <span style={ { fontSize: '0.58rem', color: 'var(--accent-amber)' } }>
              Motor: BF ≈ 1 no matchup isolado — usar todos os 9 jogadores na mesma chamada
            </span>
          ) }
        </div>

        <div style={ { marginLeft: 'auto', fontSize: '0.56rem', color: 'var(--text-darker)', ...MONO } }>
          { PLAYERS[ heroIdx ] } { STACKS[ heroIdx ] }bb &nbsp;vs&nbsp; { PLAYERS[ villainIdx ] } { STACKS[ villainIdx ] }bb
        </div>
      </div>

      {/* Tabela PM por street */ }
      {/* SOTA: Respiro artificial (padding/margin e pointerEvents) para evitar que o overflow-auto corte os Tooltips. */ }
      <div style={ { overflowX: 'auto', paddingTop: '6rem', marginTop: '-6rem', pointerEvents: 'none' } }>
        <table style={ { width: '100%', borderCollapse: 'collapse', pointerEvents: 'auto' } }>
          <thead>
            <tr style={ { borderBottom: '1px solid rgba(255,255,255,0.1)' } }>
              { [
                { label: 'Street', color: 'var(--accent-indigo)', desc: '', align: 'left' },
                { label: 'Pot', color: 'var(--text-dim)', desc: '', align: 'left' },
                { label: 'Survival', color: 'var(--accent-danger)', desc: 'Pressão de Sobrevivência. Qual a urgência matemática para inflar sua agressividade antes de ser devorado pelas blinds?', align: 'center' },
                { label: 'FGS Health', color: 'var(--accent-violet)', desc: 'Modulador de Antevisão. Você passa de uma stack passiva para dominante na próxima órbita?', align: 'center' },
                { label: 'Bounty Pwr', color: 'var(--accent-gold)', desc: 'Poder de Caça. Valorização extrema do Call quando você cobre a stack do oponente.', align: 'right' },
                { label: 'Cᵢ (Odds)', color: 'var(--accent-pink)', desc: 'Coeficiente de Insolvência (Pot Odds / Eq. Break-even). Se < 1, as Pot Odds são uma ilusão que mascara o Passivo Estrutural (RIO).', align: 'center' },
                { label: 'PM', color: 'var(--accent-emerald)', desc: 'Perspectiva Matemática. A síntese final: se > 0, o investimento supera o passivo estrutural e a utilidade do fold.', align: 'right' },
                { label: 'Eq. mín.', color: 'var(--accent-amber)', desc: 'Limiar Break-even. A equidade exata onde a Perspectiva zera (Ci = 1).', align: 'right' },
              ].map( ( { label, color, desc, align } ) => (
                <th key={ label } style={ {
                  padding: '0.45rem 0.65rem', textAlign: 'right',
                  color, fontSize: '0.52rem', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.09em',
                  whiteSpace: 'nowrap',
                } }>
                  { desc ? <div style={ { display: 'inline-block' } }><MetricTooltip align={ align as 'left' | 'center' | 'right' } title={ label } desc={ desc }>{ label }</MetricTooltip></div> : label }
                </th>
              ) ) }
            </tr>
          </thead>
          <tbody>
            { streetMetrics.map( ( s, i ) => (
              <tr key={ s.name } style={ {
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
              } }>
                <td style={ {
                  padding: '0.5rem 0.65rem', fontWeight: 900,
                  fontSize: '0.62rem', letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: 'var(--accent-indigo)', ...MONO,
                } }>
                  { s.name }
                </td>
                <MetricCell value={ `${s.potSize}bb` } color="var(--text-dim)" />
                <MetricCell value={ `${( s.survivalPressure * 100 ).toFixed( 0 )}%` } color="var(--accent-danger)" />
                <MetricCell value={ s.fgsHealth.toFixed( 2 ) } color="var(--accent-violet)" />
                <MetricCell value={ s.bountyPower.toFixed( 2 ) } color="var(--accent-gold)" />
                <td style={ { padding: '0.5rem 0.65rem', textAlign: 'center' } }>
                  <span style={ {
                    padding: '2px 6px', borderRadius: '4px', fontSize: '0.62rem', fontWeight: 800, ...MONO,
                    background: s.ci !== null && s.ci < 1 ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)',
                    color: s.ci !== null && s.ci < 1 ? 'var(--accent-danger)' : 'var(--accent-emerald)',
                    border: `1px solid ${s.ci !== null && s.ci < 1 ? 'rgba(244,63,94,0.3)' : 'rgba(16,185,129,0.3)'}`
                  } }>
                    { s.ci === null ? '—' : s.ci.toFixed( 2 ) }
                  </span>
                </td>
                <MetricCell value={ fmtPct( s.PM ) } color={ pmColor( s.PM ) } />
                <MetricCell
                  value={ s.threshEq === null ? '—' : `${( s.threshEq * 100 ).toFixed( 0 )}%` }
                  color="var(--accent-amber)"
                />
              </tr>
            ) ) }
          </tbody>
        </table>
      </div>

      {/* Veredito por street */ }
      <div style={ { marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' } }>
        { streetMetrics.map( s => (
          <div key={ s.name } style={ {
            padding: '0.3rem 0.65rem', borderRadius: '8px',
            background: s.PM > 0 ? 'rgba(0,139,69,0.1)' : 'rgba(205,92,92,0.1)',
            border: `1px solid ${s.PM > 0 ? 'rgba(0,139,69,0.25)' : 'rgba(205,92,92,0.25)'}`,
            fontSize: '0.58rem', fontWeight: 700,
            color: s.PM > 0 ? '#008b45' : '#cd5c5c',
            ...MONO,
          } }>
            { `${s.name}: ${s.PM > 0 ? '✓' : '✗'} (${Math.abs( s.PM ).toFixed( 2 )}%)` }
          </div>
        ) ) }
      </div>

      {/* Nota de rodapé */ }
      <div style={ { marginTop: '0.8rem', fontSize: '0.5rem', color: 'var(--bg-subtle)', lineHeight: 1.5 } }>
        Bounty Pwr: valor do bounty vs volatilidade ICM. Survival: proximidade da blindagem.
        FGS Health: prêmio de expectativa por sobrevivência/tier. PM &gt; 0 = Agressão preferível ao Fold.
      </div>
    </div>
  );
}
