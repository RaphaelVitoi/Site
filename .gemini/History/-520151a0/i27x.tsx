"use client";

import React from 'react';

interface KPIs {
    chipMDF: number;
    icmMDF: number;
    requiredEquity: number;
    bf: number;
}

export default function ComparisonMetrics({ kpis }: { kpis: KPIs }) {
    return (
        <div className="space-y-4 bg-slate-800/30 p-5 rounded-xl border border-white/5 flex flex-col justify-center">
            <h3 className="text-lg font-semibold text-slate-300 border-b border-white/10 pb-2 mb-2">Métricas de Resposta</h3>

            <div className="flex justify-between items-center py-2 group cursor-help" title="MDF Padrão ignorando saltos de premiação">
                <span className="text-slate-400 border-b border-dashed border-slate-600">ChipMDF (Defesa Neutra):</span>
                <span className="font-mono text-xl text-slate-200">{(kpis.chipMDF * 100).toFixed(1)}%</span>
            </div>

            <div className="flex justify-between items-center py-2 bg-rose-500/10 -mx-3 px-3 rounded-lg group cursor-help" title="Frequência mínima de defesa ajustada pelo Risco de Eliminação (RP)">
                <span className="text-rose-300 font-medium border-b border-dashed border-rose-800">ICM_MDF (Defesa Restrita):</span>
                <span className="font-mono text-2xl text-rose-400 font-bold">{(kpis.icmMDF * 100).toFixed(1)}%</span>
            </div>

            <div className="flex justify-between items-center py-2 group cursor-help" title="Fator de bolha: O custo das fichas perdidas em relação às ganhas">
                <span className="text-slate-400 border-b border-dashed border-slate-600">Bubble Factor (BF):</span>
                <span className="font-mono text-xl text-amber-400">{kpis.bf.toFixed(2)}</span>
            </div>
        </div>
    );
}