"use client";

import React from 'react';

export default function RiskVisualizer({ riskPremium }: { riskPremium: number }) {
    return (
        <div className="mt-8 h-40 w-full border border-white/5 rounded-xl flex items-center justify-center bg-slate-950/50 shadow-inner relative overflow-hidden">
            {/* Glow condicional SOTA simulando a Geometria do Risco */}
            <div
                className="absolute inset-0 bg-rose-500/20 transition-opacity duration-500"
                style={{ opacity: riskPremium * 2 }}
            />
            <span className="text-slate-500 font-mono text-sm animate-pulse z-10">
                [ RiskVisualizer: Animação Framer Motion será renderizada aqui. Risco atual: {(riskPremium * 100).toFixed(0)}% ]
            </span>
        </div>
    );
}
