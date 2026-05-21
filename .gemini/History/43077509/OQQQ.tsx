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
        <div className="mb-8 relative z-10" style={{ animationDelay: '100ms' }}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
                <h3 className="font-heading font-black text-slate-400 uppercase tracking-widest text-[11px] flex items-center gap-2">
                    <i className="fa-solid fa-list-ul"></i> Matrizes Clínicas
                </h3>
                <span className="text-[10px] bg-slate-800/80 text-slate-300 px-2 py-1 rounded font-bold border border-white/5">{scenarios.length} Cenários</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {scenarios.map((scenario) => {
                    const isActive = activeScenario === scenario.name;
                    return (
                        <button
                            key={scenario.name}
                            onClick={() => onScenarioChange(scenario.name)}
                            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 cursor-pointer relative overflow-hidden font-semibold ${isActive ? 'bg-gradient-to-r from-sky-500/20 to-sky-500/5 border-l-4 border-l-sky-400 border-y border-white/5 border-r border-white/5 text-white shadow-[inset_0_0_20px_rgba(56,189,248,0.05)] transform translate-x-1' : 'bg-slate-800/30 border border-white/5 text-slate-400 hover:bg-slate-800/80 hover:text-slate-100 hover:translate-x-1'}`}
                        >
                            <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-sm border transition-all z-10 ${isActive ? 'bg-sky-500 text-white border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.5)]' : 'bg-slate-900/60 border-white/5'}`}>
                                <i className="fa-solid fa-chart-pie"></i>
                            </div>
                            <div className="flex flex-col z-10 w-full">
                                <span className="text-[12px] font-bold tracking-wide">{scenario.name}</span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}