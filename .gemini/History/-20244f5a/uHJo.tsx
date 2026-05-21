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
    <div className="glass-panel p-6 sm:p-8 lg:p-12 xl:p-16 flex flex-col h-full animate-sota-in overflow-hidden relative rounded-4xl bg-bg-panel/80 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-500">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-indigo/5 blur-3xl rounded-full pointer-events-none" />

      <div className="flex items-start justify-between mb-12 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <h3 className="text-[0.75rem] font-black text-text-main uppercase tracking-[0.3em] flex items-center gap-4 m-0">
            <div className="w-2 h-2 rounded-full bg-accent-indigo shadow-[0_0_10px_var(--accent-indigo)]" />
            Radar de Topologia SOTA
          </h3>
          <p className="text-[0.65rem] font-mono text-text-dim uppercase tracking-[0.2em] m-0 flex items-center gap-3">
            Física Ativa &middot; <span className="text-text-muted font-black">{ physics.position }</span> <span className="opacity-30">|</span> <span className="text-text-muted font-black">{ physics.referenceStatus }</span>
          </p>
        </div>
        <div className="mt-0.5">
          <SotaTooltip align="right" title="Mapeamento Multidimensional" content="Analisa as tensões estruturais de dois cenários simultaneamente. A área preenchida representa o tamanho do passivo sistêmico e a urgência de fold." theme="indigo">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-text-darker hover:text-accent-indigo transition-all cursor-help group/info shadow-lg">
                <i className="fa-solid fa-circle-info text-base group-hover/info:scale-110 transition-transform" />
            </div>
          </SotaTooltip>
        </div>
      </div>

      <div className="mb-12 bg-black/40 border border-white/5 p-8 rounded-4xl flex flex-col gap-6 transition-all hover:border-accent-indigo/20 shadow-inner group/select">
        <label htmlFor="comparison-radar-select" className="text-[0.65rem] text-text-muted font-black uppercase tracking-[0.25em] flex items-center gap-3">
          <i className="fa-solid fa-layer-group text-accent-indigo text-[0.65rem]"></i> Overlay Analítico &middot; <span className="text-text-darker font-black">Cenário B</span>
        </label>
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="relative flex-1 lg:max-w-md">
            <select
              id="comparison-radar-select"
              value={ compareId }
              onChange={ handleScenarioChange }
              className="w-full bg-slate-900/80 border border-white/10 rounded-2xl text-white p-4 text-[0.8rem] font-black focus:ring-1 focus:ring-accent-indigo outline-none transition-all cursor-pointer shadow-2xl appearance-none pr-12"
            >
              <option value="">Nenhum cenário sobreposto</option>
              { scenarios
                .filter( s => s.id !== currentId )
                .map( s => (
                  <option key={ s.id } value={ s.id }>{ s.name }</option>
                ) ) }
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-text-darker">
                <i className="fa-solid fa-chevron-down text-[0.7rem]" />
            </div>
          </div>
          { compareId && (
            <button
              onClick={ handleClear }
              className="px-6 py-4 rounded-2xl bg-accent-danger/10 border border-accent-danger/20 text-accent-danger text-[0.7rem] font-black uppercase tracking-widest hover:bg-accent-danger/20 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl group/clear"
            >
              <i className="fa-solid fa-xmark group-hover/clear:rotate-90 transition-transform"></i> <span>Limpar</span>
            </button>
          ) }
        </div>
      </div>

      <div className="grow min-h-112.5 flex flex-col relative py-6 scrollbar-hide">
        <ResponsiveContainer width="100%" height="100%" minWidth={ 1 } minHeight={ 1 }>
          <RadarChart data={ radarData } cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="4 4" />
            <PolarAngleAxis
              dataKey="axis"
              tick={ { fill: '#64748b', fontSize: 10, fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' } }
            />
            <PolarRadiusAxis
              angle={ 90 }
              tick={ { fill: '#334155', fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 800 } }
              domain={ [ 0, 100 ] }
              axisLine={false}
            />
            <Radar
              name={ currentScenario?.name ?? 'Atual' }
              dataKey="A"
              stroke="var(--accent-indigo)"
              fill="var(--accent-indigo)"
              fillOpacity={ 0.3 }
              strokeWidth={ 3 }
              animationDuration={ 1200 }
            />
            { compareScenario && (
              <Radar
                name={ compareScenario.name }
                dataKey="B"
                stroke="var(--accent-danger)"
                fill="var(--accent-danger)"
                fillOpacity={ 0.2 }
                strokeWidth={ 3 }
                animationDuration={ 1200 }
              />
            ) }
            <Tooltip content={ <RadarTooltip /> } allowEscapeViewBox={ { x: true, y: true } } wrapperStyle={ { zIndex: 100 } } />
            <Legend
              wrapperStyle={ { paddingTop: '32px', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' } }
            />
          </RadarChart>
        </ResponsiveContainer>

        <div className="mt-10 p-8 bg-black/40 border border-white/5 rounded-3xl flex items-start gap-6 shadow-inner group/guide hover:border-accent-indigo/20 transition-all duration-500">
          <div className="w-10 h-10 rounded-2xl bg-accent-indigo/10 border border-accent-indigo/20 flex items-center justify-center shrink-0">
            <i className="fa-solid fa-satellite-dish text-accent-indigo text-base"></i>
          </div>
          <p className="text-[0.75rem] text-text-muted leading-relaxed m-0 font-medium">
            A topologia do radar mapeia as métricas de tensão sistêmica. <strong className="text-white">RP IP/OOP</strong> medem a Aversão ao Risco (ICM). <strong className="text-white">Bluff/Defesa</strong> expõem Nash. <strong className="text-white">SPR Decay</strong> indica a velocidade de diluição. Expansões poligonais maiores sinalizam ambientes de maior hostilidade.
          </p>
        </div>
      </div>
    </div>
  );
}
