"use client";

import React from 'react';

const ARCHETYPES = {
    pacto_silencioso: {
        name: "O Pacto Silencioso",
        rp: 0.22,
        description: "CL vs Vice CL. Sobrevivência mútua é prioridade."
    },
    paradoxo_valuation: {
        name: "Paradoxo do Valuation",
        rp: 0.18,
        description: "Mid Stack estrangulado pela pressão do Big Stack."
    },
    guerra_lama: {
        name: "A Guerra na Lama",
        rp: 0.08,
        description: "Short vs Short. O peso do laddering passivo."
    },
    ameaca_organica: {
        name: "A Ameaça Orgânica",
        rp: 0.12,
        description: "Proteção do God Mode contra dobras indesejadas."
    }
};

export default function ArchetypeSelector({ onSelect, activeRP }: { onSelect: (rp: number) => void, activeRP: number }) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {Object.entries(ARCHETYPES).map(([key, arch]) => {
                const isActive = activeRP === arch.rp;
                return (
                    <button key={key} onClick={() => onSelect(arch.rp)} title={arch.description} className={`text-left p-3 rounded-lg border transition-all duration-300 group ${isActive ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10'}`}>
                        <div className={`font-bold text-sm transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-200 group-hover:text-white'}`}>{arch.name}</div>
                        <div className="text-xs text-slate-400 mt-1">
                            RP Ajustado: <span className="text-cyan-400 font-mono">{(arch.rp * 100).toFixed(0)}%</span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}