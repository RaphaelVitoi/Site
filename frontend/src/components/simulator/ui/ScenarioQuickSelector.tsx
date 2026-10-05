'use client';

/**
 * IDENTITY: Seletor Rápido de Cenários (Topologia de Confronto da Aula 1.2)
 * PATH: src/components/simulator/ui/ScenarioQuickSelector.tsx
 * ROLE: Expor 12 cenários clássicos em famílias semânticas, preservando status visual, badges de RP e subtítulos.
 * AESTHETIC: SOTA v7.0 GOLD Glassmorphism & Micro-animations.
 */

import { useState } from 'react';
import type { Scenario, ScenarioCategory } from '../solver/types';

const CATEGORY_ORDER: readonly ScenarioCategory[] = ['baseline', 'clinical', 'toyGame'];
const CATEGORY_LABELS: Record<ScenarioCategory, string> = {
  baseline: 'Referenciais',
  clinical: 'Casos clínicos',
  toyGame: 'Toy games',
};

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
  const activeScenario = scenarios.find((scenario) => scenario.id === activeId);
  const [expandedCategories, setExpandedCategories] = useState<Set<ScenarioCategory>>(() => new Set());
  const openCategories = new Set(expandedCategories);
  if (activeScenario) openCategories.add(activeScenario.category);
  const scenarioGroups = CATEGORY_ORDER.map((category) => ({
    category,
    scenarios: scenarios
      .map((scenario, index) => ({ scenario, index }))
      .filter(({ scenario }) => scenario.category === category),
  })).filter(({ scenarios: categoryScenarios }) => categoryScenarios.length > 0);

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-accent-indigo/10 border border-accent-indigo/20 text-accent-indigo text-[0.55rem]">
            <i className="fa-solid fa-layer-group" />
          </div>
          <span className="font-mono text-[0.6rem] font-black uppercase tracking-[0.2em] text-white">
            Atlas · {scenarios.length} Cenários
          </span>
        </div>
        <span className="text-[0.5rem] font-mono text-text-dim uppercase tracking-wider bg-black/25 px-2 py-0.5 rounded-md border border-white/5">
          Mesa Final 9P · 126 Players
        </span>
      </div>

      <div className="space-y-2">
        {scenarioGroups.map(({ category, scenarios: categoryScenarios }) => {
          const isActiveCategory = category === activeScenario?.category;

          return (
            <details
              key={category}
              open={openCategories.has(category)}
              className={`group/atlas overflow-hidden rounded-xl border transition-colors ${
                isActiveCategory ? 'border-accent-indigo/20 bg-slate-950/40' : 'border-white/5 bg-black/15'
              }`}
            >
              <summary
                onClick={(event) => {
                  event.preventDefault();
                  if (isActiveCategory) return;
                  setExpandedCategories((current) => {
                    const next = new Set(current);
                    if (next.has(category)) next.delete(category);
                    else next.add(category);
                    return next;
                  });
                }}
                className="flex min-h-[44px] cursor-pointer list-none items-center gap-2 px-3 py-2 transition-colors hover:bg-white/3 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-indigo"
              >
                <span className="min-w-0 flex-1 text-xs font-black uppercase tracking-[0.14em] text-white">
                  {CATEGORY_LABELS[category]}
                </span>
                {isActiveCategory && activeScenario && (
                  <span
                    className="hidden max-w-[14rem] truncate text-[0.55rem] font-mono text-accent-indigo-light sm:inline"
                    title={activeScenario.name}
                  >
                    Ativo: {activeScenario.name}
                  </span>
                )}
                <span className="shrink-0 rounded-md border border-white/5 bg-black/20 px-2 py-0.5 text-[0.6rem] font-mono text-text-dim">
                  {categoryScenarios.length} cenários
                </span>
                <i
                  className="fa-solid fa-chevron-down shrink-0 text-[0.55rem] text-text-dim transition-transform group-open/atlas:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <div className="grid grid-cols-2 gap-2 px-2 pb-2 sm:grid-cols-3 lg:grid-cols-4">
                {categoryScenarios.map(({ scenario: s, index }) => {
                  const isActive = s.id === activeId;
                  const isB20 = s.name?.includes('B20') || s.id?.includes('b20');
                  const displayName = isB20 ? 'Block Bet 20%' : s.name.replace(' (Baseline)', '').replace(' (A Fotografia)', '');
                  const subtitle = s.narrativeSubtitle || 'ICM Spot';

                  return (
                    <button
                      type="button"
                      key={s.id}
                      aria-pressed={isActive}
                      onClick={() => onSelect(s.id)}
                      className={`p-3 rounded-xl border text-left transition-all duration-200 relative flex flex-col justify-between group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-indigo ${
                        isActive
                          ? 'bg-accent-indigo/15 border-accent-indigo/50 shadow-md ring-1 ring-accent-indigo/30'
                          : 'bg-black/25 border-white/5 hover:border-white/15 hover:bg-black/40'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <span className={`text-[0.48rem] font-mono font-black ${isActive ? 'text-accent-indigo-light' : 'text-text-darker'}`}>
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        {isActive ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-indigo animate-pulse motion-reduce:animate-none shadow-[0_0_6px_rgba(99,102,241,1)]" />
                        ) : (
                          <span className="text-[0.42rem] font-mono text-text-dim">
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
            </details>
          );
        })}
      </div>
    </div>
  );
}
