'use client';

/**
 * IDENTITY: Radar de Comparação Multi-Cenário SOTA v4.2
 * PATH: src/components/simulator/panels/ComparisonRadar.tsx
 * ROLE: Selecionar 2 cenários e comparar via radar chart (Recharts).
 * BINDING: [src/lib/schemas.ts, hooks/*, ui/*, simulator.module.css]
 */

import { useCallback, useState } from 'react';
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
import { useRadarCalculations } from '../hooks/useRadarCalculations';
import { RadarTooltip } from '../ui/RadarTooltip';
import { SotaTooltip } from '../ui/SotaTooltip';

interface ComparisonRadarProps
{
  scenarios: Scenario[];
  currentId: string;
  nashFlop?: IcmDistortionResult;
}

export default function ComparisonRadar ( { scenarios, currentId, nashFlop }: Readonly<ComparisonRadarProps> )
{
  const { physics } = useSotaSync();
  const [ compareId, setCompareId ] = useState<string>( '' );

  // SOTA v4.2: Orquestração de Cálculo Modularizada
  const { currentScenario, compareScenario, radarData } = useRadarCalculations({
    scenarios, currentId, compareId, nashFlop
  });

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
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            id="comparison-radar-select"
            value={ compareId }
            onChange={ handleScenarioChange }
            className="flex-1 lg:max-w-md bg-slate-900/60 border border-white/10 rounded-xl text-text-bright p-2.5 text-[0.75rem] font-medium focus:ring-1 focus:ring-accent-indigo outline-none transition-all cursor-pointer"
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
        <ResponsiveContainer width="100%" height={ 350 } minWidth={ 1 } minHeight={ 1 }>
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
            <Tooltip content={ <RadarTooltip /> } allowEscapeViewBox={ { x: true, y: true } } wrapperStyle={ { zIndex: 100 } } />
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
