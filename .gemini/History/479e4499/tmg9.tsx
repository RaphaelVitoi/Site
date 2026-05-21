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
import { SotaWasmContext } from '../SotaContext';

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

function MetricRow ( { label, value, color, loading }: Readonly<{ label: string; value: string; color: string; loading?: boolean }> ) {
  return (
    <div style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }>
      <span style={ { fontSize: '0.58rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' } }>{ label }</span>
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
}

export default function PmLensPanel ( { anteSize = 12.5, heroInvested = 1.125, currentPot = 2.5, activePlayers = 2, heroPosition = 'BB', blindsRisingSoon = false }: Readonly<PmLensPanelProps> ) {
  const [ heroIdx, setHeroIdx ] = useState( 8 );
  const [ villainIdx, setVillainIdx ] = useState( 6 );
  const [ pkoValue, setPkoValue ] = useState( 0 );
  const [ kappa, setKappa ] = useState( 0.5 );
  const [ deltaHabilidade ] = useDebouncedLocalStorage<number>( 'vitoi_pm_delta_habilidade', 50 );

  const ecosystem = useContext( SotaWasmContext );
  const equity = ecosystem?.nativeRangeMetric?.equity ?? 50;
  const isCalculatingEq = ecosystem?.nativeRangeMetric?.isCalculating ?? false;

  const [ heroRange, setHeroRange ] = useState( '' );
  const [ villainRange, setVillainRange ] = useState( '' );
  const [ asyncResults, setAsyncResults ] = useState<Record<string, any>>( {} );

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

  const handleIcmResult = React.useCallback( ( streetName: string, res: any ) => {
    setAsyncResults( prev => ( { ...prev, [ streetName ]: res } ) );
  }, [] );

  // SOTA: Offloading Completo para o Web Worker
  useEffect( () => {
    if ( ecosystem?.dispatchIcmPerspectiva === undefined ) return;

    for ( const street of streetProgression )
    {
      const input = {
        stacks: STACKS,
        prizes: PRIZES,
        heroIdx,
        villainIdx,
        potSize: street.potSize,
        heroCost: street.cumulative,
        winProb: equity / 100,
        realizationFactor: heroPosition === 'IP' ? 1 : 0.85,
        edgeBase: 1 + ( deltaHabilidade / 100 ),
        bountyValue: pkoValue * 100,
        blindCost: 1.5 + ( anteSize / 100 ),
        kappa,
        numPlayersInPot: activePlayers,
        heroPosition,
        blindsRisingSoon
      };

      ecosystem.dispatchIcmPerspectiva( input, ( res ) => handleIcmResult( street.name, res ) );
    }
  }, [ heroIdx, villainIdx, equity, pkoValue, kappa, heroPosition, anteSize, activePlayers, blindsRisingSoon, deltaHabilidade, streetProgression, ecosystem?.dispatchIcmPerspectiva, handleIcmResult ] );

  const buildStreetMetric = ( street: typeof streetProgression[ 0 ], res: any ) => {
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
  };

  const streetMetrics = useMemo( () => {
    return streetProgression.map( street => buildStreetMetric( street, asyncResults[ street.name ] ) );
  }, [ asyncResults, streetProgression ] );

  const handleCalculateEquity = () => {
    if ( ecosystem?.dispatchNativeEquity ) ecosystem.dispatchNativeEquity( heroRange, villainRange, '' );
  };

  return (
    <div style={ { marginTop: '2rem', padding: '1.2rem 1.4rem', background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '14px' } }>
      {/* Header */ }
      <div style={ { marginBottom: '1.1rem' } }>
        <div style={ { display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.3rem' } }>
          <span style={ { fontSize: '0.48rem', fontWeight: 900, color: 'var(--accent-indigo)', textTransform: 'uppercase', letterSpacing: '0.18em', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', padding: '3px 8px', borderRadius: '5px' } }>PM Lens</span>
          <h4 style={ { margin: 0, fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-bright)' } }>Framework PM — Referencial Aula 1.2</h4>
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
            <PmLensTooltip title="Agressor (Hero)" desc="O agente ativo da equação. Seu stack atual define a margem de manobra (SPR) e a resistência estrutural à pressão do ICM." align="left">
              <div style={ { fontSize: '0.52rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem', cursor: 'help' } } className="hover:text-indigo-400 transition-colors">Hero</div>
            </PmLensTooltip>
            <div style={ { display: 'flex', flexWrap: 'wrap', gap: '0.3rem' } }>
              { PLAYERS.map( ( p, i ) => ( <SelectBtn key={ p } label={ `${p} ${STACKS[ i ]}bb` } active={ heroIdx === i } impossible={ i === villainIdx } onClick={ () => setHeroIdx( i ) } /> ) ) }
            </div>
          </div>
          <div>
            <PmLensTooltip title="Defensor (Villain)" desc="O passivo da colisão. O stack efetivo entre ambos dita o teto de perda e o risco instantâneo de eliminação (Bubble Factor)." align="left">
              <div style={ { fontSize: '0.52rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem', cursor: 'help' } } className="hover:text-indigo-400 transition-colors">Villain</div>
            </PmLensTooltip>
            <div style={ { display: 'flex', flexWrap: 'wrap', gap: '0.3rem' } }>
              { PLAYERS.map( ( p, i ) => ( <SelectBtn key={ p } label={ `${p} ${STACKS[ i ]}bb` } active={ villainIdx === i } impossible={ i === heroIdx } onClick={ () => setVillainIdx( i ) } /> ) ) }
            </div>
          </div>
        </div>

        <div style={ { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' } }>
          <div style={ { display: 'flex', flexDirection: 'column', gap: '1rem' } }>
            <div>
              <PmLensTooltip title="Fator de Realização (R)" desc="A âncora termodinâmica pós-flop. IP realiza 100% da Equidade. OOP sofre penalidade gravitacional e só realiza 85%." align="left">
                <div style={ { fontSize: '0.52rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem', cursor: 'help' } } className="hover:text-indigo-400 transition-colors">Posição</div>
              </PmLensTooltip>
              <div style={ { display: 'flex', gap: '0.4rem', alignItems: 'center' } }>
                <span style={ { fontSize: '0.75rem', fontWeight: 800, color: heroPosition === 'IP' ? 'var(--accent-indigo)' : 'var(--accent-danger)', background: 'rgba(0,0,0,0.3)', padding: '0.3rem 0.7rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' } }>{ heroPosition }</span>
              </div>
            </div>
            <div>
              <div style={ { display: 'flex', justifyContent: 'space-between', fontSize: '0.52rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' } }>
                <PmLensTooltip title="Equidade Bruta (Raw Equity)" desc="Probabilidade isolada de vencer no Showdown (Vácuo). Totalmente cega para o FGS, RIO e Pressão de ICM." align="left">
                  <span style={ { cursor: 'help' } } className="hover:text-indigo-400 transition-colors">Equity</span>
                </PmLensTooltip>
                <span style={ { color: 'var(--accent-indigo-light)', ...MONO } }>{ equity }%</span>
              </div>
              <input type="range" min={ 0 } max={ 100 } value={ equity } onChange={ e => ecosystem?.setManualEquity?.( Number( e.target.value ) ) } style={ { width: '100%', accentColor: 'var(--accent-indigo)' } } />
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
              <input type="range" min={ 0 } max={ 0.8 } step={ 0.05 } value={ pkoValue } onChange={ e => setPkoValue( Number( e.target.value ) ) } style={ { width: '100%', accentColor: 'var(--accent-amber)' } } />
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
