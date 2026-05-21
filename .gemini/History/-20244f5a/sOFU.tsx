'use client';

/**
 * IDENTITY: Radar de Comparação Multi-Cenário SOTA
 * PATH: src/components/simulator/panels/ComparisonRadar.tsx
 * ROLE: Selecionar 2 cenários e comparar via radar chart (Recharts).
 * BINDING: [src/lib/schemas.ts, hooks/useSotaSync.tsx, simulator.module.css]
 */

import { PrizesSchema, StacksSchema } from '@/lib/schemas';
import { useCallback, useMemo, useState } from 'react';
import
{
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
import { useSotaSync } from '../hooks/useSotaSync';

interface ComparisonRadarProps
{
  scenarios: Scenario[];
  currentId: string;
  nashFlop?: IcmDistortionResult;
}

interface RadarTooltipPayload
{
  name: string;
  value: number;
  color: string;
}

interface ComparisonRadarTooltipProps
{
  active?: boolean;
  payload?: RadarTooltipPayload[];
  label?: string;
}

const CustomTooltip = ( { active, payload, label }: Readonly<ComparisonRadarTooltipProps> ) =>
{
  if ( active && payload && payload.length > 0 )
  {
    const valA = payload[ 0 ]?.value ?? 0;
    const valB = payload.length > 1 ? payload[ 1 ]?.value : undefined;
    const delta = valB === undefined ? 0 : valB - valA;

    // Cores SOTA para Deltas
    let deltaColorClass = 'text-text-muted';
    if ( Math.abs( delta ) > 0.1 )
    {
      deltaColorClass = delta > 0 ? 'text-accent-emerald' : 'text-accent-danger';
    }

    return (
      <div className="glass-panel border border-accent-indigo/20 bg-(--bg-deep)/95 rounded-xl p-4 text-text-bright shadow-[0_10px_30px_-15px_rgba(99,102,241,0.4)] backdrop-blur-md z-50 min-w-45 font-mono">
        <p className="mb-2 text-[0.65rem] font-black text-text-muted uppercase tracking-widest">
          { label }
        </p>
        { payload.map( ( entry: RadarTooltipPayload ) => (
          <div key={ `${ entry.name }-${ entry.color }` } className="flex justify-between items-center mb-1">
            <span className="text-[0.65rem] font-bold" style={ { color: entry.color } }>{ entry.name }</span>
            <span className="text-[0.75rem] font-black" style={ { color: entry.color } }>{ Number( entry.value ).toFixed( 1 ) }%</span>
          </div>
        ) ) }

        { valB !== undefined && (
          <div className="mt-2 pt-2 border-t border-white/10 flex justify-between items-center">
            <span className="text-[0.6rem] text-text-muted font-extrabold tracking-tighter">Δ SOTA</span>
            <span className={ `text-[0.75rem] font-black ${ deltaColorClass }` }>
              { delta > 0 ? '+' : '' }{ delta.toFixed( 1 ) } p.p.
            </span>
          </div>
        ) }
      </div>
    );
  }
  return null;
};

function buildRadarData ( scenario: Scenario, nash?: IcmDistortionResult )
{
  // Bluff = soma das apostas IP (bet_small + bet_large)
  const bluff = nash
    ? nash.ip.bet_small.center + nash.ip.bet_large.center
    : 0;
  // Defense = call OOP
  const defense = nash ? nash.oop.call.center : 0;

  // SOTA: Fricção Zero (Erradicação de Entropia RP no Radar)
  const isBaseline = scenario.category === 'toyGame' || scenario.prizes.length <= 1;

  return {
    rpIp: isBaseline ? 0 : scenario.ipRp,
    rpOop: isBaseline ? 0 : scenario.oopRp,
    bluff,
    defense,
    sprDecay: scenario.sprData.length > 0
      ? ( ( scenario.sprData[ 0 ].rpValue - ( scenario.sprData.at( -1 )?.rpValue ?? 0 ) ) / Math.max( 1, scenario.sprData[ 0 ].rpValue ) ) * 100
      : 0,
  };
}

export default function ComparisonRadar ( { scenarios, currentId, nashFlop }: Readonly<ComparisonRadarProps> )
{
  const { physics } = useSotaSync();
  const [ compareId, setCompareId ] = useState<string>( '' );

  const currentScenario = useMemo( () => scenarios.find( s => s.id === currentId ), [ scenarios, currentId ] );

  const compareScenario = useMemo( () =>
  {
    const s = scenarios.find( sc => sc.id === compareId );
    if ( !s ) return null;
    const validStacks = StacksSchema.safeParse( s.stacks );
    const validPrizes = PrizesSchema.safeParse( s.prizes );
    return ( validStacks.success && validPrizes.success ) ? s : null;
  }, [ scenarios, compareId ] );

  const radarData = useMemo( () =>
  {
    if ( !currentScenario ) return [];
    const a = buildRadarData( currentScenario, nashFlop );
    const b = compareScenario ? buildRadarData( compareScenario ) : null;

    return [
      { axis: 'RP IP', A: a.rpIp, B: b?.rpIp ?? 0 },
      { axis: 'RP OOP', A: a.rpOop, B: b?.rpOop ?? 0 },
      { axis: 'Bluff%', A: a.bluff, B: b?.bluff ?? 0 },
      { axis: 'Defesa%', A: a.defense, B: b?.defense ?? 0 },
      { axis: 'SPR Decay', A: a.sprDecay, B: b?.sprDecay ?? 0 },
    ];
  }, [ currentScenario, compareScenario, nashFlop ] );

  const handleScenarioChange = useCallback( ( e: React.ChangeEvent<HTMLSelectElement> ) =>
  {
    setCompareId( e.target.value );
  }, [] );

  const handleClear = useCallback( () => setCompareId( '' ), [] );

  return (
    <div className="glass-panel flex flex-col h-full border border-white/5 rounded-2xl overflow-hidden transition-all duration-500 hover:border-accent-indigo/30 p-6 shadow-2xl shadow-slate-900/50 bg-(--bg-deep)/80 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[0.65rem] font-black text-text-muted uppercase tracking-[0.15em]">Comparação de Cenários</h3>
          <p className="text-[0.55rem] font-mono text-text-muted/60 mt-1 uppercase">
            Física: { physics.position } | { physics.referenceStatus }
          </p>
        </div>
      </div>

      <div className="mb-6 space-y-2">
        <label htmlFor="comparison-radar-select" className="text-[0.6rem] text-text-darker font-bold uppercase tracking-tighter">
          Adicionar Referência:
        </label>
        <div className="flex gap-2">
          <select
            id="comparison-radar-select"
            value={ compareId }
            onChange={ handleScenarioChange }
            className="flex-1 bg-bg-deep border border-white/5 rounded-lg text-text-bright p-2 text-[0.7rem] font-mono focus:ring-1 focus:ring-accent-indigo outline-none transition-all cursor-pointer"
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
              onClick={ handleClear }
              className="px-3 rounded-lg bg-accent-danger/10 border border-accent-danger/20 text-accent-danger text-[0.6rem] font-black uppercase hover:bg-accent-danger/20 transition-colors"
            >
              Limpar
            </button>
          ) }
        </div>
      </div>

      <div className="grow min-h-75">
        <ResponsiveContainer width="100%" height={ 300 }>
          <RadarChart data={ radarData } cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="rgba(255, 255, 255, 0.08)" />
            <PolarAngleAxis
              dataKey="axis"
              tick={ { fill: 'var(--text-muted)', fontSize: 10, fontWeight: 700 } }
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
              animationDuration={ 1000 }
            />
            { compareScenario && (
              <Radar
                name={ compareScenario.name }
                dataKey="B"
                stroke="var(--accent-secondary)"
                fill="var(--accent-secondary)"
                fillOpacity={ 0.2 }
                strokeWidth={ 2 }
                animationDuration={ 1000 }
              />
            ) }
            <Tooltip content={ <CustomTooltip /> } />
            <Legend
              wrapperStyle={ { paddingTop: '20px', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' } }
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
