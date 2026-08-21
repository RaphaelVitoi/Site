'use client';

/**
 * IDENTITY: Seletor Rápido de Cenários (Topologia de Confronto da Aula 1.2)
 * PATH: src/components/simulator/ui/ScenarioQuickSelector.tsx
 * ROLE: Permitir a seleção instantânea dos 8 cenários clássicos com status visual, badges de RP e subtítulos.
 * AESTHETIC: SOTA v7.0 GOLD Glassmorphism & Micro-animations.
 */

import type { Scenario } from '../solver/types';

interface ScenarioQuickSelectorProps {
  scenarios: Scenario[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function ScenarioQuickSelector({
  scenarios,
  activeId,
  onSelect,
}: Readonly<ScenarioQuickSelectorProps>) {
  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-accent-indigo/10 border border-accent-indigo/20 text-accent-indigo text-[0.55rem]">
            <i className="fa-solid fa-layer-group" />
          </div>
          <span className="font-mono text-[0.6rem] font-black uppercase tracking-[0.2em] text-white">
            Atlas · 8 Cenários
          </span>
        </div>
        <span className="text-[0.5rem] font-mono text-text-dim uppercase tracking-wider bg-black/25 px-2 py-0.5 rounded-md border border-white/5">
          Mesa Final 9P · 126 Players
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {scenarios.map((s, index) => {
          const isActive = s.id === activeId;
          const isB20 = s.name?.includes('B20') || s.id?.includes('b20');
          const displayName = isB20 ? 'Block Bet 20%' : s.name.replace(' (Baseline)', '').replace(' (A Fotografia)', '');
          const subtitle = s.narrativeSubtitle || 'ICM Spot';

          return (
            <button
              type="button"
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`p-3 rounded-xl border text-left transition-all duration-200 relative flex flex-col justify-between group cursor-pointer ${
                isActive
                  ? 'bg-accent-indigo/15 border-accent-indigo/50 shadow-md ring-1 ring-accent-indigo/30'
                  : 'bg-black/25 border-white/5 hover:border-white/15 hover:bg-black/40'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <span className={`text-[0.48rem] font-mono font-black ${isActive ? 'text-accent-indigo' : 'text-text-darker'}`}>
                  0{index + 1}
                </span>
                {isActive ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-indigo animate-pulse shadow-[0_0_6px_rgba(99,102,241,1)]" />
                ) : (
                  <span className="text-[0.42rem] font-mono text-text-dim opacity-40 group-hover:opacity-100 transition-opacity">
                    RP {s.ipRp}%
                  </span>
                )}
              </div>

              <div className="space-y-0.5">
                <span className={`text-[0.62rem] font-black tracking-tight leading-tight line-clamp-1 ${isActive ? 'text-white' : 'text-text-muted group-hover:text-white'}`}>
                  {displayName}
                </span>
                <span className="text-[0.46rem] font-mono text-text-dim line-clamp-1 uppercase tracking-wider block">
                  {subtitle}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
