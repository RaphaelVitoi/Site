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
import { SotaTooltip } from '../ui/SotaTooltip';

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

    let deltaColorClass = 'text-text-muted';
    if ( Math.abs( delta ) > 0.1 )
    {
      deltaColorClass = delta > 0 ? 'text-accent-rose' : 'text-accent-emerald';
    }

    return (
      <div className="p-4 rounded-xl border border-white/10 bg-slate-950/95 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.7)] backdrop-blur-xl z-50 min-w-56 font-sans">
        <p className="mb-3 text-[0.65rem] font-black text-text-muted uppercase tracking-widest border-b border-white/5 pb-2">
          { label }
        </p>
        <div className="space-y-2">
          { payload.map( ( entry: RadarTooltipPayload ) => (
            <div key={ `${ entry.name }-${ entry.color }` } className="flex justify-between items-center gap-4">
              <span className="text-[0.65rem] font-bold uppercase tracking-wider" style={ { color: entry.color } }>{ entry.name }</span>
              <span className="text-[0.75rem] font-black text-white font-mono tabular-nums">{ Number( entry.value ).toFixed( 1 ) }%</span>
            </div>
          ) ) }
        </div>

        { valB !== undefined && (
          <div className="mt-3 pt-2 border-t border-white/5 flex justify-between items-center gap-4">
            <span className="text-[0.6rem] text-text-dim font-black uppercase tracking-widest">Δ Relativo</span>
            <span className={ `text-[0.75rem] font-black font-mono tabular-nums ${ deltaColorClass }` }>
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
    <div className="glass-panel p-6 sm:p-8 flex flex-col h-full animate-sota-in overflow-visible!">
      <div className="flex items-start justify-between mb-6 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-sm font-black text-text-main uppercase tracking-widest flex items-center gap-2 m-0">
            <i className="fa-solid fa-bullseye text-accent-indigo"></i> Radar SOTA
          </h3>
          <p className="text-[0.65rem] font-mono text-text-dim mt-1.5 uppercase tracking-widest m-0">
            Física Ativa: <span className="text-text-muted font-bold">{ physics.position }</span> | <span className="text-text-muted font-bold">{ physics.referenceStatus }</span>
          </p>
        </div>
        <div className="mt-0.5">
          <SotaTooltip align="right" title="Mapeamento Multidimensional" content="Analisa as tensões estruturais de dois cenários simultaneamente. A área preenchida representa o tamanho do passivo sistêmico e a urgência de fold." theme="indigo">
            <i className="fa-solid fa-circle-info text-text-darker hover:text-accent-indigo transition-colors cursor-help text-sm" />
          </SotaTooltip>
        </div>
      </div>

      <div className="mb-6 bg-black/20 border border-white/5 p-4 sm:p-5 rounded-2xl flex flex-col gap-3 transition-all hover:border-white/10">
        <label htmlFor="comparison-radar-select" className="text-[0.65rem] text-text-muted font-black uppercase tracking-widest flex items-center gap-2">
          <i className="fa-solid fa-layer-group text-accent-indigo"></i> Overlay Analítico (Cenário B)
        </label>
        <div className="flex gap-3">
          <select
            id="comparison-radar-select"
            value={ compareId }
            onChange={ handleScenarioChange }
            className="flex-1 bg-slate-900/60 border border-white/10 rounded-xl text-text-bright p-2.5 text-[0.75rem] font-medium focus:ring-1 focus:ring-accent-indigo outline-none transition-all cursor-pointer"
          >
            <option value="">Nenhum cenário sobreposto</option>
            { scenarios
              .filter( s => s.id !== currentId )
              .map( s => (
                <option key={ s.id } value={ s.id }>{ s.name }</option>
              ) ) }
          </select>
          { compareId && (
            <button
              onClick={ handleClear }
              className="px-4 rounded-xl bg-accent-danger/10 border border-accent-danger/20 text-accent-danger text-[0.65rem] font-black uppercase tracking-widest hover:bg-accent-danger/20 transition-colors flex items-center gap-2"
            >
              <i className="fa-solid fa-xmark"></i> <span className="hidden sm:inline">Limpar</span>
            </button>
          ) }
        </div>
      </div>

      <div className="grow min-h-87.5 flex flex-col">
        <ResponsiveContainer width="100%" height={ 350 }>
          <RadarChart data={ radarData } cx="50%" cy="50%" outerRadius="65%">
            <PolarGrid stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="axis"
              tick={ { fill: '#94a3b8', fontSize: 10, fontWeight: 800, fontFamily: 'var(--font-mono)' } }
            />
            <PolarRadiusAxis
              angle={ 90 }
              tick={ { fill: '#334155', fontSize: 9, fontFamily: 'var(--font-mono)' } }
              domain={ [ 0, 100 ] }
            />
            <Radar
              name={ currentScenario?.name ?? 'Atual' }
              dataKey="A"
              stroke="#818cf8"
              fill="#818cf8"
              fillOpacity={ 0.3 }
              strokeWidth={ 2 }
              animationDuration={ 1000 }
            />
            { compareScenario && (
              <Radar
                name={ compareScenario.name }
                dataKey="B"
                stroke="#fb7185"
                fill="#fb7185"
                fillOpacity={ 0.2 }
                strokeWidth={ 2 }
                animationDuration={ 1000 }
              />
            ) }
            <Tooltip content={ <CustomTooltip /> } allowEscapeViewBox={ { x: true, y: true } } wrapperStyle={ { zIndex: 100 } } />
            <Legend
              wrapperStyle={ { paddingTop: '20px', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' } }
            />
          </RadarChart>
        </ResponsiveContainer>

        <div className="mt-4 p-4 bg-accent-indigo/5 border border-accent-indigo/10 rounded-xl flex items-start gap-3">
          <i className="fa-solid fa-satellite-dish text-accent-indigo mt-0.5 text-xs"></i>
          <p className="text-[0.65rem] text-text-light leading-relaxed m-0 font-medium">
            A topologia do radar mapeia as métricas de tensão. <strong className="text-white">RP IP/OOP</strong> medem a Aversão ao Risco (Punição ICM). <strong className="text-white">Bluff/Defesa</strong> expõem as frequências de Nash. <strong className="text-white">SPR Decay</strong> indica a velocidade de diluição da stack pós-flop. Expansões poligonais maiores sinalizam ambientes de maior hostilidade termodinâmica.
          </p>
        </div>
      </div>
    </div>
  );
}
