'use client';

/**
 * IDENTITY: Seletor de Cenários Agrupado SOTA v4.6 GOLD
 * PATH: src/components/simulator/ui/ScenarioSelector.tsx
 * ROLE: Lista interativa de cenários com transições Framer Motion.
 */

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import type { Scenario } from '../engine/types';

interface ScenarioSelectorProps {
  scenarios: Scenario[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function ScenarioSelector({ scenarios, activeId, onSelect }: Readonly<ScenarioSelectorProps>) {
  const grouped = useMemo(() => {
    const groups: Record<string, Scenario[]> = {};
    scenarios.forEach((s) => {
      const cat = s.category || 'Outros';
      groups[cat] ??= [];
      groups[cat].push(s);
    });
    return groups;
  }, [scenarios]);

  return (
    <div className="animate-sota-in flex flex-col gap-6">
      <div className="px-2">
        <h3 className="mb-1 flex items-center gap-3 text-[0.65rem] font-black tracking-[0.4em] text-white uppercase">
          <div className="bg-accent-indigo h-1.5 w-1.5 rounded-full shadow-[0_0_10px_var(--accent-indigo)]" />
          Atlas de Cenários
        </h3>
        <p className="text-text-darker text-[0.55rem] font-black tracking-widest uppercase">
          Selecione a topologia de conflito
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} className="space-y-2">
            <div className="flex items-center gap-4 px-2 opacity-60">
              <span className="text-text-muted text-[0.5rem] font-black tracking-[0.3em] whitespace-nowrap uppercase">
                {cat}
              </span>
              <div className="h-px w-full bg-white/5" />
            </div>

            <div className="grid grid-cols-1 gap-2">
              {items.map((s) => {
                const isActive = s.id === activeId;
                return (
                  <motion.button
                    key={s.id}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect(s.id)}
                    className={`group relative w-full overflow-hidden rounded-xl border p-4 text-left transition-all duration-500 ${
                      isActive
                        ? 'bg-accent-indigo/20 border-accent-indigo/40 shadow-2xl shadow-indigo-500/10'
                        : 'border-white/5 bg-black/20 hover:border-white/10 hover:bg-black/40'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-scenario-bg"
                        className="from-accent-indigo/10 pointer-events-none absolute inset-0 bg-linear-to-r to-transparent"
                      />
                    )}

                    <div className="relative z-10 flex min-w-0 items-center justify-between">
                      <div className="flex min-w-0 flex-col gap-0.5 pr-4">
                        <span
                          className={`truncate text-[0.7rem] font-black tracking-wider uppercase transition-colors ${isActive ? 'text-white' : 'text-text-muted group-hover:text-text-main'}`}
                        >
                          {s.name}
                        </span>
                        <span className="text-text-darker truncate text-[0.45rem] font-bold tracking-widest uppercase">
                          {s.narrativeSubtitle}
                        </span>
                      </div>

                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg transition-all ${isActive ? 'bg-accent-indigo scale-110 rotate-90 text-white shadow-lg shadow-indigo-500/40' : 'text-text-darker bg-white/5 group-hover:bg-white/10'}`}
                      >
                        <i className="fa-solid fa-chevron-right text-[0.5rem]" />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
