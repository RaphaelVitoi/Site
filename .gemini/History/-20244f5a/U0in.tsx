'use client';

/**
 * IDENTITY: Radar de Topologia SOTA v4.2 Gold
 * PATH: src/components/simulator/panels/ComparisonRadar.tsx
 * ROLE: Visualização Multidimensional de Tensões Sistêmicas e Equilíbrio de Nash.
 * AESTHETIC: SOTA Gold Standard (Glows, Precision SVG, Glassmorphism).
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
    <div className="glass-panel p-8 sm:p-10 lg:p-14 xl:p-20 flex flex-col h-full animate-sota-in overflow-hidden relative rounded-4xl bg-bg-panel/80 backdrop-blur-3xl border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] transition-all duration-700 hover:border-white/20">
      {/* Camadas de Profundidade Gold */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-accent-indigo/10 blur-[120px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-accent-emerald/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header Refinado */}
      <div className="flex flex-col md:flex-row items-start justify-between mb-16 border-b border-white/5 pb-10 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-2.5 h-2.5 rounded-full bg-accent-indigo shadow-[0_0_15px_var(--accent-indigo)] animate-pulse" />
            <h3 className="text-[0.8rem] font-black text-white uppercase tracking-[0.4em] m-0">
              Radar de Topologia SOTA
            </h3>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-[0.6rem] font-mono text-text-dim uppercase tracking-[0.2em]">Sincronia Quântica</span>
             <div className="h-px w-6 bg-white/10" />
             <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 flex items-center gap-3">
                <span className="text-[0.65rem] text-accent-indigo-light font-black uppercase tracking-widest">{ physics.position }</span>
                <span className="w-1 h-1 rounded-full bg-text-darker" />
                <span className="text-[0.65rem] text-text-muted font-bold uppercase tracking-widest">{ physics.referenceStatus }</span>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="hidden sm:flex flex-col items-end gap-1 px-4 border-r border-white/10">
              <span className="text-[0.55rem] font-black text-text-darker uppercase tracking-widest">Estado de Referência</span>
              <span className="text-[0.7rem] font-black text-text-muted uppercase tracking-widest tabular-nums">{ currentScenario?.name || 'Vácuo' }</span>
           </div>
           <SotaTooltip align="right" title="Mapeamento Topológico" content="Este radar traduz as tensões invisíveis do ICM em geometria visual. O aumento da área preenchida sinaliza colapso de MDF e urgência de contração de range." theme="indigo">
              <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-text-darker hover:text-accent-indigo hover:border-accent-indigo/30 hover:bg-accent-indigo/5 transition-all cursor-help group/info shadow-2xl active:scale-95">
                  <i className="fa-solid fa-radar text-lg group-hover/info:scale-110 transition-transform" />
              </button>
           </SotaTooltip>
        </div>
      </div>

      {/* Seletor de Overlay - Estética Dashboard High-End */}
      <div className="mb-16 bg-slate-950/40 border border-white/5 p-10 rounded-[2.5rem] flex flex-col gap-8 transition-all hover:bg-slate-950/60 shadow-inner relative group/select">
        <div className="absolute inset-0 bg-radial-[at_top_right] from-accent-indigo/5 to-transparent pointer-events-none rounded-[2.5rem]" />

        <div className="flex items-center justify-between">
            <label htmlFor="comparison-radar-select" className="text-[0.6rem] text-text-muted font-black uppercase tracking-[0.3em] flex items-center gap-3">
              <i className="fa-solid fa-layer-group text-accent-indigo" />
              <i className="fa-solid fa-layer-group text-accent-indigo" />{' '}
              Injetar Overlay Analítico
            </label>
            { compareId && (
                <span className="text-[0.5rem] font-black text-accent-rose uppercase tracking-[0.3em] px-2 py-0.5 rounded bg-accent-rose/10 border border-accent-rose/20 animate-pulse">Comparação Ativa</span>
            )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="relative flex-1">
            <select
              id="comparison-radar-select"
              value={ compareId }
              onChange={ handleScenarioChange }
              className="w-full bg-slate-900/60 border border-white/5 rounded-2xl text-white px-6 py-5 text-[0.85rem] font-black focus:ring-2 focus:ring-accent-indigo/30 focus:border-accent-indigo/50 outline-none transition-all cursor-pointer shadow-2xl appearance-none pr-14 hover:bg-slate-900/80"
            >
              <option value="" className="bg-bg-deep">Selecione o cenário para sobreposição</option>
              { scenarios
                .filter( s => s.id !== currentId )
                .map( s => (
                  <option key={ s.id } value={ s.id } className="bg-bg-deep">{ s.name }</option>
                ) ) }
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-text-darker group-hover/select:text-accent-indigo transition-colors">
                <i className="fa-solid fa-chevron-down text-[0.8rem]" />
            </div>
          </div>
          { compareId && (
            <button
              onClick={ handleClear }
              className="px-10 py-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-accent-rose text-[0.7rem] font-black uppercase tracking-[0.2em] hover:bg-rose-500/20 hover:border-rose-500/40 transition-all flex items-center justify-center gap-4 active:scale-95 shadow-xl group/clear"
            >
              <i className="fa-solid fa-eraser group-hover/clear:-rotate-12 transition-transform text-xs" />
              <i className="fa-solid fa-eraser group-hover/clear:-rotate-12 transition-transform text-xs" />{' '}
              <span>Resetar Overlay</span>
            </button>
          ) }
        </div>
      </div>

      {/* Visualização de Dados - SOTA Geometry */}
      <div className="grow flex flex-col relative items-center justify-center -mt-8">
        <div className="absolute inset-0 bg-radial-[at_center_center] from-accent-indigo/5 to-transparent pointer-events-none opacity-40" />

        <ResponsiveContainer width="100%" height="100%" minHeight={650}>
          <RadarChart data={ radarData } cx="50%" cy="50%" outerRadius="85%">
            <defs>
                <linearGradient id="gradIndigo" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--color-accent-indigo)" stopOpacity={0.7}/>
                    <stop offset="100%" stopColor="var(--color-accent-indigo)" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="gradRose" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--color-accent-rose)" stopOpacity={0.6}/>
                    <stop offset="100%" stopColor="var(--color-accent-rose)" stopOpacity={0.02}/>
                </linearGradient>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            <PolarGrid
                stroke="rgba(255, 255, 255, 0.12)"
                strokeDasharray="4 4"
                radialLines={true}
                className="drop-shadow-[0_0_2px_rgba(255,255,255,0.05)]"
            />

            <PolarAngleAxis
              dataKey="axis"
              tick={ { fill: '#94a3b8', fontSize: 13, fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '0.25em' } }
              className="drop-shadow-sm"
            />

            <PolarRadiusAxis
              angle={ 90 }
              tick={ { fill: '#475569', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 800 } }
              domain={ [ 0, 100 ] }
              axisLine={false}
              tickCount={6}
            />

            <Radar
              name={ currentScenario?.name ?? 'Atual' }
              dataKey="A"
              stroke="var(--color-accent-indigo)"
              fill="url(#gradIndigo)"
              strokeWidth={ 5 }
              strokeOpacity={1}
              animationDuration={ 2000 }
              animationEasing="ease-out"
              filter="url(#glow)"
              className="drop-shadow-[0_0_20px_var(--color-accent-indigo)]"
            />

            { compareScenario && (
              <Radar
                name={ `VS: ${compareScenario.name}` }
                dataKey="B"
                stroke="var(--color-accent-rose)"
                fill="url(#gradRose)"
                strokeWidth={ 3 }
                strokeDasharray="10 5"
                strokeOpacity={0.8}
                animationDuration={ 2000 }
                animationEasing="ease-out"
              />
            ) }

            <Tooltip
                content={ <RadarTooltip /> }
                allowEscapeViewBox={ { x: true, y: true } }
                wrapperStyle={ { zIndex: 1000 } }
                cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1 }}
            />

            <Legend
              verticalAlign="bottom"
              align="center"
              wrapperStyle={ {
                paddingTop: '60px',
                paddingBottom: '20px',
                fontSize: '0.75rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.4em',
                color: 'var(--color-text-muted)'
              } }
              iconType="circle"
              iconSize={14}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
