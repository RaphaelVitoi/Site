"use client";

import React, { useState, useMemo } from 'react';

// 4. Definição dos Arquétipos (Data Structure)
const ARCHETYPES = {
    pacto_silencioso: {
        name: "O Pacto Silencioso",
        rp: 0.22,
        description: "CL vs Vice CL. Sobrevivência mútua é prioridade.",
        theme: "indigo"
    },
    paradoxo_valuation: {
        name: "Paradoxo do Valuation",
        rp: 0.18,
        description: "Mid Stack estrangulado pela pressão do Big Stack.",
        theme: "rose"
    },
    guerra_lama: {
        name: "A Guerra na Lama",
        rp: 0.08,
        description: "Short vs Short. O peso do laddering passivo.",
        theme: "emerald"
    },
    ameaca_organica: {
        name: "A Ameaça Orgânica",
        rp: 0.12,
        description: "Proteção do God Mode contra dobras indesejadas.",
        theme: "amber"
    }
};

export default function SimuladorICM() {
    // 3. Estado e Variáveis de Entrada
    const [riskPremium, setRiskPremium] = useState<number>(0.0);
    const [potSize, setPotSize] = useState<number>(10.0);
    const [betSize, setBetSize] = useState<number>(5.0);
    const [heroStack, setHeroStack] = useState<number>(40.0);
    const [villainStack, setVillainStack] = useState<number>(50.0);

    // 2. Motor Matemático (Logic Layer SOTA)
    const kpis = useMemo(() => {
        const calculateBF = (rp: number) => 1 / (1 - rp);

        // MDF (Minimum Defense Frequency)
        const chipMDF = potSize / (potSize + betSize);
        const icmMDF = chipMDF * (1 - riskPremium);

        // Pot Odds / Required Equity 
        // Assumindo que o Hero paga a aposta de mesmo tamanho (betSize)
        const potOdds = betSize / (potSize + betSize * 2);
        const requiredEquity = potOdds + riskPremium;
        const bf = calculateBF(riskPremium);

        return { chipMDF, icmMDF, requiredEquity, bf };
    }, [riskPremium, potSize, betSize]);

    // Sub-componente embutido: ArchetypeSelector
    const renderArchetypeSelector = () => (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {Object.entries(ARCHETYPES).map(([key, arch]) => (
                <button
                    key={key}
                    onClick={() => setRiskPremium(arch.rp)}
                    className="text-left p-3 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-300 group"
                    title={arch.description}
                >
                    <div className="font-bold text-sm text-slate-200 group-hover:text-white transition-colors">
                        {arch.name}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                        RP Ajustado: <span className="text-cyan-400 font-mono">{(arch.rp * 100).toFixed(0)}%</span>
                    </div>
                </button>
            ))}
        </div>
    );

    return (
        <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 text-slate-100 font-sans shadow-2xl max-w-5xl mx-auto w-full">

            <div className="mb-6">
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    TrueICM Engine
                </h2>
                <p className="text-sm text-slate-400 mt-1">Simulador de Distorção de Equidade e Frequência</p>
            </div>

            {renderArchetypeSelector()}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* ControlPanel */}
                <div className="space-y-6 bg-slate-800/30 p-5 rounded-xl border border-white/5">
                    <h3 className="text-lg font-semibold text-slate-300 border-b border-white/10 pb-2">Variáveis Táticas</h3>

                    {[
                        { label: 'Risk Premium (RP)', value: riskPremium, setter: setRiskPremium, min: 0, max: 0.5, step: 0.01, display: `${(riskPremium * 100).toFixed(1)}%` },
                        { label: 'Pot Size (BBs)', value: potSize, setter: setPotSize, min: 1, max: 200, step: 1, display: potSize },
                        { label: 'Bet Size enfrentada (BBs)', value: betSize, setter: setBetSize, min: 1, max: 200, step: 1, display: betSize },
                    ].map((control, idx) => (
                        <div key={idx}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-400">{control.label}</span>
                                <span className="font-mono text-cyan-400">{control.display}</span>
                            </div>
                            <input type="range" min={control.min} max={control.max} step={control.step} value={control.value} onChange={(e) => control.setter(parseFloat(e.target.value))} className="w-full accent-blue-500" />
                        </div>
                    ))}
                </div>

                {/* ComparisonMetrics */}
                <div className="space-y-4 bg-slate-800/30 p-5 rounded-xl border border-white/5 flex flex-col justify-center">
                    <h3 className="text-lg font-semibold text-slate-300 border-b border-white/10 pb-2 mb-2">Métricas de Resposta</h3>

                    <div className="flex justify-between items-center py-2"><span className="text-slate-400">ChipMDF (Defesa Neutra):</span><span className="font-mono text-xl text-slate-200">{(kpis.chipMDF * 100).toFixed(1)}%</span></div>
                    <div className="flex justify-between items-center py-2 bg-rose-500/10 -mx-3 px-3 rounded-lg"><span className="text-rose-300 font-medium">ICM_MDF (Defesa Restrita):</span><span className="font-mono text-2xl text-rose-400 font-bold">{(kpis.icmMDF * 100).toFixed(1)}%</span></div>
                    <div className="flex justify-between items-center py-2"><span className="text-slate-400">Bubble Factor (BF):</span><span className="font-mono text-xl text-amber-400">{kpis.bf.toFixed(2)}</span></div>
                </div>
            </div>

            {/* RiskVisualizer Placeholder */}
            <div className="mt-8 h-40 w-full border border-white/5 rounded-xl flex items-center justify-center bg-slate-950/50 shadow-inner">
                <span className="text-slate-600 font-mono text-sm animate-pulse">[ RiskVisualizer: Animação Framer Motion renderizará a Geometria do Risco aqui ]</span>
            </div>

        </div>
    );
}