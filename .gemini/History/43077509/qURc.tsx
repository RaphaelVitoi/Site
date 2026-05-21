'use client';

import React from 'react';
import { Scenario } from './ICMCalculator';

interface ScenarioSimulatorProps {
    scenarios: Scenario[];
    activeScenario: string | null;
    onScenarioChange: (name: string) => void;
}

export default function ScenarioSimulator({ scenarios, activeScenario, onScenarioChange }: ScenarioSimulatorProps) {
    return (
        <div className="mb-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-heading font-semibold text-sky-400 uppercase tracking-widest text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.8)]"></span>
                    Cenários Rápidos
                </h3>
            </div>
            <div className="flex flex-wrap gap-2">
                {scenarios.map((scenario) => {
                    const isActive = activeScenario === scenario.name;
                    return (
                        <button
                            key={scenario.name}
                            onClick={() => onScenarioChange(scenario.name)}
                            className={`px-4 py-2 text-xs font-semibold rounded border transition-all duration-300 ${isActive
                                ? 'bg-sky-500/20 text-sky-300 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                                : 'bg-slate-900/50 text-slate-400 border-white/5 hover:border-sky-400/50 hover:text-white hover:bg-slate-800'
                                }`}
                        >
                            {scenario.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}