'use client';

import type { InsolvencyMetrics } from '../hooks/useQuantumEngine';
import { AnimatePresence, motion } from 'framer-motion';

interface InsolvencyRioPanelProps {
    insolvency: InsolvencyMetrics | null;
    isCalculating: boolean;
    error?: string;
}

export const InsolvencyRioPanel = ({ insolvency, isCalculating, error }: InsolvencyRioPanelProps) => {
    if (error) {
        return (
            <div className="p-4 mt-6 rounded-xl border border-red-500/30 bg-red-950/20 flex flex-col items-center justify-center shadow-inner min-h-[120px]">
                <span className="text-[0.65rem] font-black text-red-400 uppercase tracking-widest mb-1">Payload Rejeitado (HTTP 400)</span>
                <span className="text-xs font-mono text-red-200/70 text-center">{error}</span>
            </div>
        );
    }

    // SOTA: Preservação de Topologia (Prevenção de CLS) com Skeleton Estável
    const safeInsolvency = insolvency || {
        winRate: 0,
        tieRate: 0,
        loseRate: 0,
        trueInsolvencyEv: 0,
        riskIndex: 0
    };

    const winPct = (safeInsolvency.winRate * 100).toFixed(1);
    let riskLevel = "Controlado (GTO)";
    let riskColor = "text-accent-emerald";

    if (safeInsolvency.riskIndex > 0.3) {
        riskLevel = "Crítico (Death Zone)";
        riskColor = "text-accent-danger";
    } else if (safeInsolvency.riskIndex > 0.15) {
        riskLevel = "Moderado (Predator)";
        riskColor = "text-accent-amber";
    }

    return (
        <div className="relative grid grid-cols-2 gap-4 p-4 mt-6 bg-bg-deep rounded-xl border border-white/5 shadow-xl min-h-[120px] overflow-hidden">
            <AnimatePresence>
                {isCalculating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-bg-deep/80 backdrop-blur-sm"
                    >
                        <span className="text-[0.65rem] font-black text-accent-indigo uppercase tracking-widest animate-pulse">Tracionando WASM...</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={`flex flex-col transition-opacity duration-300 ${isCalculating && !insolvency ? 'opacity-0' : 'opacity-100'}`}>
                <span className="text-[0.65rem] font-black text-text-muted uppercase tracking-wider mb-1">A* Projected EV</span>
                <span className={`text-xl font-bold font-mono ${safeInsolvency.trueInsolvencyEv < 0 ? 'text-accent-danger' : 'text-accent-emerald'}`}>
                    {safeInsolvency.trueInsolvencyEv > 0 ? '+' : ''}{safeInsolvency.trueInsolvencyEv.toFixed(2)} bb
                </span>
                <span className="text-[0.65rem] text-text-darker mt-1 italic">Ajustado pelo Sizing Geométrico</span>
            </div>

            <div className={`flex flex-col border-l border-white/5 pl-4 transition-opacity duration-300 ${isCalculating && !insolvency ? 'opacity-0' : 'opacity-100'}`}>
                <span className="text-[0.65rem] font-black text-text-muted uppercase tracking-wider mb-1">A* Risco Inflacionário</span>
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold font-mono text-text-bright">{(safeInsolvency.riskIndex * 100).toFixed(1)}%</span>
                    <span className={`text-[0.6rem] font-bold px-2 py-0.5 rounded-full bg-black/40 ${riskColor}`}>
                        {riskLevel}
                    </span>
                </div>
                <span className="text-[0.65rem] text-text-darker mt-1 italic">Distorção Axioma Lipe Piv aplicada</span>
            </div>

            <div className={`col-span-2 mt-2 transition-opacity duration-300 ${isCalculating && !insolvency ? 'opacity-0' : 'opacity-100'}`}>
                <div className="flex justify-between text-[0.65rem] font-bold text-text-muted mb-1">
                    <span>Sobrevivência (Monte Carlo WASM)</span>
                    <span>Win: {winPct}%</span>
                </div>
                <div className="flex w-full h-1.5 rounded-full overflow-hidden opacity-80">
                    <div style={{ width: `${winPct}%` }} className="bg-accent-emerald transition-all duration-500" />
                    <div style={{ width: `${(safeInsolvency.tieRate * 100)}%` }} className="bg-text-darker transition-all duration-500" />
                    <div style={{ width: `${(safeInsolvency.loseRate * 100)}%` }} className="bg-accent-danger transition-all duration-500" />
                </div>
            </div>
        </div>
    );
};
