/**
 * IDENTITY: Seletor de Cenários Agrupado SOTA v7.0 GOLD
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
    <div className="animate-sota-in flex flex-col gap-10">
      <div className="px-4">
        <h3 className="mb-2 flex items-center gap-4 text-[0.8rem] font-black tracking-[0.4em] text-white uppercase">
          <div className="bg-accent-indigo h-2 w-2 rounded-full shadow-[0_0_15px_var(--accent-indigo)]" />
          Atlas de Cenários
        </h3>
        <p className="text-text-darker text-[0.6rem] font-black tracking-[0.3em] uppercase">
          Selecione a topologia de conflito
        </p>
      </div>

      <div className="space-y-8">
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} className="space-y-4">
            <div className="flex items-center gap-5 px-4 opacity-50">
              <span className="text-text-muted text-[0.55rem] font-black tracking-[0.4em] whitespace-nowrap uppercase">
                {cat}
              </span>
              <div className="h-px w-full bg-white/5" />
            </div>

            <div className="grid grid-cols-1 gap-3">
              {items.map((s) => {
                const isActive = s.id === activeId;
                return (
                  <motion.button
                    key={s.id}
                    whileHover={{ x: 6 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onSelect(s.id)}
                    className={`group relative w-full overflow-hidden rounded-2xl border p-6 text-left transition-all duration-700 ${
                      isActive
                        ? 'bg-accent-indigo/15 border-accent-indigo/40 shadow-2xl shadow-indigo-500/10'
                        : 'border-white/5 bg-black/30 hover:border-white/15 hover:bg-black/50'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-scenario-bg"
                        className="from-accent-indigo/10 pointer-events-none absolute inset-0 bg-linear-to-r to-transparent"
                      />
                    )}

                    <div className="relative z-10 flex min-w-0 items-center justify-between">
                      <div className="flex min-w-0 flex-col gap-1.5 pr-6">
                        <span
                          className={`truncate text-[0.8rem] font-black tracking-widest uppercase transition-all duration-500 ${isActive ? 'text-white' : 'text-text-muted group-hover:text-text-main'}`}
                        >
                          {s.name}
                        </span>
                        <span className="text-text-darker truncate text-[0.55rem] font-black tracking-[0.2em] uppercase">
                          {s.narrativeSubtitle}
                        </span>
                      </div>

                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl transition-all duration-500 ${isActive ? 'bg-accent-indigo scale-110 rotate-90 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 'text-text-darker bg-white/5 group-hover:bg-white/10 group-hover:text-text-muted'}`}
                      >
                        <i className="fa-solid fa-chevron-right text-[0.6rem]" />
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
