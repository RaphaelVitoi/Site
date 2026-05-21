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

import { MetricTooltip } from '@/app/ICMlaboratory/RiskPremiumDashboard';
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

function MetricCell ( { value, color, loading }: Readonly<{ value: string; color: string; loading?: boolean }> ) {
  return (
    <td style={ {
      padding: '0.5rem 0.65rem', textAlign: 'right', fontWeight: 700, fontSize: '0.68rem', color: loading ? 'var(--text-darker)' : color, ...MONO, whiteSpace: 'nowrap',
    } }>
      { loading ? '...' : value }
    </td>
  );
}

function renderVerdict ( loading: boolean, pm: number ) {
  if ( loading ) return '...';
  return pm > 0 ? '✓' : '✗';
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
    if ( !res ) return { name: street.name, potSize: street.potSize, heroCost: street.cumulative, survivalPressure: 0, fgsHealth: 1, bountyPower: 0, ci: null, PM: 0, asymmetry: 0, loading: true };
    return {
      name: street.name,
      potSize: street.potSize,
      heroCost: street.cumulative,
      survivalPressure: res.survivalPressure,
      fgsHealth: res.fgsHealth,
      bountyPower: res.bountyPower ?? 0,
      ci: res.ci,
      PM: res.perspectivaPct,
      asymmetry: res.asymmetryCoefficient,
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
      <div style={ { display: 'flex', flexWrap: 'wrap', gap: '1rem 1.5rem', marginBottom: '1.1rem' } }>
        <div>
          <div style={ { fontSize: '0.52rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem' } }>Hero</div>
          <div style={ { display: 'flex', flexWrap: 'wrap', gap: '0.22rem' } }>
            { PLAYERS.map( ( p, i ) => ( <SelectBtn key={ p } label={ `${p} ${STACKS[ i ]}bb` } active={ heroIdx === i } impossible={ i === villainIdx } onClick={ () => setHeroIdx( i ) } /> ) ) }
          </div>
        </div>
        <div>
          <div style={ { fontSize: '0.52rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem' } }>Villain</div>
          <div style={ { display: 'flex', flexWrap: 'wrap', gap: '0.22rem' } }>
            { PLAYERS.map( ( p, i ) => ( <SelectBtn key={ p } label={ `${p} ${STACKS[ i ]}bb` } active={ villainIdx === i } impossible={ i === heroIdx } onClick={ () => setVillainIdx( i ) } /> ) ) }
          </div>
        </div>

        <div style={ { display: 'flex', flexWrap: 'wrap', gap: '1.5rem' } }>
          <div style={ { display: 'flex', flexDirection: 'column', gap: '0.6rem' } }>
            <div>
              <div style={ { fontSize: '0.52rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem' } }>Posição</div>
              <div style={ { display: 'flex', gap: '0.3rem', alignItems: 'center' } }>
                <span style={ { fontSize: '0.65rem', fontWeight: 800, color: heroPosition === 'IP' ? 'var(--accent-indigo)' : 'var(--accent-danger)', background: 'rgba(0,0,0,0.2)', padding: '0.22rem 0.55rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' } }>{ heroPosition }</span>
              </div>
            </div>
            <div>
              <div style={ { display: 'flex', justifyContent: 'space-between', width: '160px', fontSize: '0.52rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem' } }>
                <span>Equity</span>
                <span style={ { color: 'var(--accent-indigo-light)', ...MONO } }>{ equity }%</span>
              </div>
              <input type="range" min={ 0 } max={ 100 } value={ equity } onChange={ e => ecosystem?.setManualEquity?.( Number( e.target.value ) ) } style={ { width: '160px', accentColor: 'var(--accent-indigo)' } } />
              <div style={ { marginTop: '0.6rem', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '6px', width: '160px' } }>
                <div style={ { display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.4rem' } }>
                  <input type="text" placeholder="Hero (ex: 22+)" value={ heroRange } onChange={ e => setHeroRange( e.target.value ) } style={ { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', fontSize: '0.55rem', padding: '0.2rem 0.4rem', borderRadius: '4px' } } />
                  <input type="text" placeholder="Vilão (ex: ATo+)" value={ villainRange } onChange={ e => setVillainRange( e.target.value ) } style={ { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', fontSize: '0.55rem', padding: '0.2rem 0.4rem', borderRadius: '4px' } } />
                </div>
                <button onClick={ handleCalculateEquity } disabled={ isCalculatingEq || !heroRange || !villainRange } style={ { width: '100%', padding: '0.3rem', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-indigo-light)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '4px', fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase' } }>
                  { isCalculatingEq ? 'Processando...' : 'Injetar GTO' }
                </button>
              </div>
            </div>
          </div>

          <div style={ { display: 'flex', flexDirection: 'column', gap: '0.6rem' } }>
            <div>
              <div style={ { display: 'flex', justifyContent: 'space-between', width: '160px', fontSize: '0.52rem', color: 'var(--accent-amber)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem' } }>
                <span>Bounty PKO</span>
                <span style={ { color: 'var(--accent-gold)', ...MONO } }>{ Math.round( pkoValue * 100 ) }%</span>
              </div>
              <input type="range" min={ 0 } max={ 0.8 } step={ 0.05 } value={ pkoValue } onChange={ e => setPkoValue( Number( e.target.value ) ) } style={ { width: '160px', accentColor: 'var(--accent-amber)' } } />
            </div>
            <div>
              <div style={ { display: 'flex', justifyContent: 'space-between', width: '160px', fontSize: '0.52rem', color: 'var(--accent-pink)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem' } }>
                <span>Credibilidade κ</span>
                <span style={ { color: 'var(--accent-pink-light)', ...MONO } }>{ Math.round( kappa * 100 ) }%</span>
              </div>
              <input type="range" min={ 0 } max={ 1 } step={ 0.05 } value={ kappa } onChange={ e => setKappa( Number( e.target.value ) ) } style={ { width: '160px', accentColor: 'var(--accent-pink)' } } />
            </div>
          </div>
        </div>
      </div>

      {/* Tabela PM por street */ }
      <div style={ { overflowX: 'auto' } }>
        <table style={ { width: '100%', borderCollapse: 'collapse' } }>
          <thead>
            <tr style={ { borderBottom: '1px solid rgba(255,255,255,0.1)' } }>
              { [
                { label: 'Street', color: 'var(--accent-indigo)', desc: 'Rua atual da simulação.', align: 'left' },
                { label: 'Sunk Cost', color: 'var(--text-dim)', desc: 'Investimento acumulado (Piso do Fold).', align: 'right' },
                { label: 'Survival', color: 'var(--accent-danger)', desc: 'Pressão de Sobrevivência.', align: 'center' },
                { label: 'FGS', color: 'var(--accent-violet)', desc: 'Antevisão de Órbita.', align: 'center' },
                { label: 'Ci', color: 'var(--accent-pink)', desc: 'Coeficiente de Insolvência.', align: 'center' },
                { label: 'PM', color: 'var(--accent-emerald)', desc: 'Perspectiva Matemática.', align: 'right' },
                { label: 'Sharpe', color: 'var(--accent-amber)', desc: 'Eficiência de Capital (PM / Risco).', align: 'right' },
              ].map( ( { label, color, desc, align } ) => (
                <th key={ label } style={ { padding: '0.45rem 0.65rem', textAlign: align as any, color, fontSize: '0.52rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em' } }>
                  <MetricTooltip align={ align as any } title={ label } desc={ desc }>{ label }</MetricTooltip>
                </th>
              ) ) }
            </tr>
          </thead>
          <tbody>
            { streetMetrics.map( ( s, i ) => (
              <tr key={ s.name } style={ { borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' } }>
                <td style={ { padding: '0.5rem 0.65rem', fontWeight: 900, fontSize: '0.62rem', color: 'var(--accent-indigo)', ...MONO } }>{ s.name }</td>
                <MetricCell value={ `${s.heroCost.toFixed( 2 )}bb` } color="var(--text-dim)" />
                <MetricCell value={ `${( s.survivalPressure * 100 ).toFixed( 0 )}%` } color="var(--accent-danger)" loading={ s.loading } />
                <MetricCell value={ s.fgsHealth.toFixed( 2 ) } color="var(--accent-violet)" loading={ s.loading } />
                <td style={ { padding: '0.5rem 0.65rem', textAlign: 'center' } }>
                  <span style={ { padding: '2px 6px', borderRadius: '4px', fontSize: '0.62rem', fontWeight: 800, ...MONO, background: s.ci !== null && s.ci < 1 ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)', color: s.ci !== null && s.ci < 1 ? 'var(--accent-danger)' : 'var(--accent-emerald)' } }>
                    { renderCi( s.loading, s.ci ) }
                  </span>
                </td>
                <MetricCell value={ fmtPct( s.PM ) } color={ pmColor( s.PM ) } loading={ s.loading } />
                <MetricCell value={ s.asymmetry.toFixed( 2 ) } color={ s.asymmetry > 1 ? "var(--accent-emerald)" : "var(--accent-amber)" } loading={ s.loading } />
              </tr>
            ) ) }
          </tbody>
        </table>
      </div>

      {/* Veredito */ }
      <div style={ { marginTop: '0.75rem', display: 'flex', gap: '0.5rem' } }>
        { streetMetrics.map( s => (
          <div key={ s.name } style={ { padding: '0.3rem 0.65rem', borderRadius: '8px', background: s.PM > 0 ? 'rgba(0,139,69,0.1)' : 'rgba(205,92,92,0.1)', border: `1px solid ${s.PM > 0 ? 'rgba(0,139,69,0.25)' : 'rgba(205,92,92,0.25)'}`, fontSize: '0.58rem', fontWeight: 700, color: s.PM > 0 ? '#008b45' : '#cd5c5c', ...MONO } }>
            { s.name }: { renderVerdict( s.loading, s.PM ) }
          </div>
        ) ) }
      </div>
    </div>
  );
}
