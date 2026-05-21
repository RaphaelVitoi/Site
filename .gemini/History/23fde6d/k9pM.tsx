'use client';

/**
 * IDENTITY: Radar de Comparação Multi-Cenário
 * PATH: src/components/simulator/panels/ComparisonRadar.tsx
 * ROLE: Selecionar 2 cenários e comparar via radar chart (Recharts).
 * BINDING: [engine/types.ts (IcmDistortionResult), engine/nashSolver.ts (solveIcmDistortion), simulator.module.css]
 */

import { useContext, useMemo, useState } from 'react';
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { IcmDistortionResult, Scenario } from '../engine/types';
import styles from '../simulator.module.css';
import { SotaSpotContext } from '../SotaContext';

const INITIAL_CHART_DIMENSION = { width: 1, height: 1 };

interface ComparisonRadarProps {
  scenarios: Scenario[];
  currentId: string;
  /** IcmDistortionResult do flop do cenario ativo — usado para bluff e defense */
  nashFlop?: IcmDistortionResult;
}

// Interface estrita extraída dos metadados da lib Recharts
interface RadarTooltipPayload {
  name: string;
  value: number;
  color: string;
}

interface ComparisonRadarTooltipProps {
  active?: boolean;
  payload?: RadarTooltipPayload[];
  label?: string;
}

const CustomTooltip = ( { active, payload, label }: Readonly<ComparisonRadarTooltipProps> ) => {
  if ( active && payload?.length )
  {
    const valA = payload[ 0 ]?.value;
    const valB = payload.length > 1 ? payload[ 1 ]?.value : undefined;
    const delta = valB === undefined ? 0 : valB - valA;
    let deltaColor = 'var(--text-muted)';
    if ( delta > 0.1 )
    {
      deltaColor = 'var(--accent-emerald)';
    } else if ( delta < -0.1 )
    {
      deltaColor = 'var(--accent-danger)';
    }

    return (
      <div style={ {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '8px',
        padding: '0.85rem',
        color: 'var(--text-bright)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        fontFamily: "'JetBrains Mono', monospace",
        minWidth: '180px',
        zIndex: 1000
      } }>
        <p style={ { margin: '0 0 0.6rem', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em' } }>
          { label }
        </p>
        { payload.map( ( entry: RadarTooltipPayload ) => (
          <div key={ `${entry.name}-${entry.color}` } style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' } }>
            <span style={ { fontSize: '0.65rem', color: entry.color, fontWeight: 700 } }>{ entry.name }</span>
            <span style={ { fontSize: '0.75rem', color: entry.color, fontWeight: 900 } }>{ Number( entry.value ).toFixed( 1 ) }%</span>
          </div>
        ) ) }

        { valB === undefined ? null : (
          <div style={ {
            marginTop: '0.6rem',
            paddingTop: '0.6rem',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          } }>
            <span style={ { fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.1em' } }>DELTA (Δ)</span>
            <span style={ {
              fontSize: '0.75rem',
              fontWeight: 900,
              color: deltaColor,
            } }>
              { delta > 0 ? '+' : '' }{ delta.toFixed( 1 ) } p.p.
            </span>
          </div>
        ) }
      </div>
    );
  }
  return null;
};

function buildRadarData ( scenario: Scenario, nash?: IcmDistortionResult, overrideIpRp?: number, overrideOopRp?: number ) {
  // Bluff = soma das apostas IP (bet_small + bet_large)
  const bluff = nash
    ? nash.ip.bet_small.center + nash.ip.bet_large.center
    : 0;
  // Defense = call OOP
  const defense = nash ? nash.oop.call.center : 0;

  // SOTA: Fricção Zero (Erradicação de Entropia RP no Radar)
  const isBaseline = scenario.category === 'baseline' || scenario.prizes.length <= 1;

  return {
    rpIp: isBaseline ? 0 : ( overrideIpRp ?? scenario.ipRp ),
    rpOop: isBaseline ? 0 : ( overrideOopRp ?? scenario.oopRp ),
    bluff,
    defense,
    sprDecay: scenario.sprData.length > 0
      ? ( ( scenario.sprData[ 0 ].rpValue - ( scenario.sprData.at( -1 )?.rpValue ?? 0 ) ) / Math.max( 1, scenario.sprData[ 0 ].rpValue ) ) * 100
      : 0,
  };
}

export default function ComparisonRadar ( { scenarios, currentId, nashFlop }: Readonly<ComparisonRadarProps> ) {
  const [ compareId, setCompareId ] = useState<string>( '' );

  // SOTA: Bebe diretamente do Sangue Matemático para refletir a Tensão em Tempo Real
  const context = useContext( SotaSpotContext );

  const currentScenario = scenarios.find( s => s.id === currentId );
  const compareScenario = scenarios.find( s => s.id === compareId );

  const radarData = useMemo( () => {
    if ( !currentScenario ) return [];
    const a = buildRadarData( currentScenario, nashFlop, context?.effectiveIpRp, context?.effectiveOopRp );
    const b = compareScenario ? buildRadarData( compareScenario ) : null;

    return [
      { axis: 'RP IP', A: a.rpIp, B: b?.rpIp ?? 0 },
      { axis: 'RP OOP', A: a.rpOop, B: b?.rpOop ?? 0 },
      { axis: 'Bluff%', A: a.bluff, B: b?.bluff ?? 0 },
      { axis: 'Defesa%', A: a.defense, B: b?.defense ?? 0 },
      { axis: 'SPR Decay', A: a.sprDecay, B: b?.sprDecay ?? 0 },
    ];
  }, [ currentScenario, compareScenario, nashFlop, context?.effectiveIpRp, context?.effectiveOopRp ] );

  // SOTA: Render Shield para o Gráfico Radar (Economia Generalizada)
  // Isola a árvore do Recharts das mutações globais de 'scenarios'
  const radarElement = useMemo( () => (
    <ResponsiveContainer width="100%" height={ 300 } minWidth={ 0 } minHeight={ 0 } initialDimension={ INITIAL_CHART_DIMENSION }>
      <RadarChart data={ radarData } cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke="rgba(255, 255, 255, 0.08)" />
        <PolarAngleAxis
          dataKey="axis"
          tick={ { fill: 'var(--text-muted)', fontSize: 10 } }
        />
        <PolarRadiusAxis
          angle={ 90 }
          tick={ { fill: 'var(--text-darker)', fontSize: 9 } }
          domain={ [ 0, 100 ] }
        />
        <Radar
          name={ currentScenario?.name ?? 'Atual' }
          dataKey="A"
          stroke="var(--accent-indigo)"
          fill="var(--accent-indigo)"
          fillOpacity={ 0.3 }
          strokeWidth={ 2 }
        />
        { compareScenario && (
          <Radar
            name={ compareScenario.name }
            dataKey="B"
            stroke="var(--accent-secondary)"
            fill="var(--accent-secondary)"
            fillOpacity={ 0.2 }
            strokeWidth={ 2 }
          />
        ) }
        <Tooltip content={ <CustomTooltip /> } />
        <Legend
          wrapperStyle={ { fontSize: '0.6rem', color: 'var(--text-muted)' } }
        />
      </RadarChart>
    </ResponsiveContainer>
  ), [ radarData, currentScenario?.name, compareScenario ] );

  return (
    <div className={ styles.glassPanel } style={ { padding: '1.5rem' } }>
      <div style={ { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' } }>
        <h3 style={ { margin: 0, fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em' } }>
          Comparação de Cenários
        </h3>
      </div>

      {/* Seletor de cenário para comparar */ }
      <div style={ { marginBottom: '1rem' } }>
        <label htmlFor="comparison-radar-select" style={ { fontSize: '0.6rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.3rem' } }>
          Comparar com:
        </label>
        <div style={ { display: 'flex', gap: '0.5rem', alignItems: 'center' } }>
          <select
            id="comparison-radar-select"
            value={ compareId }
            onChange={ ( e ) => setCompareId( e.target.value ) }
            style={ {
              flex: 1,
              background: 'var(--bg-deep)',
              border: '1px solid var(--bg-subtle)',
              borderRadius: '8px',
              color: 'var(--text-bright)',
              padding: '0.5rem',
              fontSize: '0.7rem',
            } }
          >
            <option value="">Selecione um cenário</option>
            { scenarios
              .filter( s => s.id !== currentId )
              .map( s => (
                <option key={ s.id } value={ s.id }>{ s.name }</option>
              ) ) }
          </select>
          { compareId && (
            <button
              onClick={ () => setCompareId( '' ) }
              style={ {
                padding: '0.4rem 0.7rem',
                borderRadius: '8px',
                background: 'rgba(225, 29, 72, 0.1)',
                border: '1px solid rgba(225, 29, 72, 0.3)',
                color: 'var(--accent-danger)',
                fontSize: '0.6rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              } }
            >
              Limpar
            </button>
          ) }
        </div>
      </div>

      {/* Radar Chart */ }
      <div style={ { width: '100%', minWidth: 0 } }>
        { radarElement }
      </div>
    </div>
  );
}
