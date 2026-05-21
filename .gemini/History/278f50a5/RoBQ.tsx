'use client';

import { useIcmStore } from '@/store/icmStore';

export default function RiskVisualizer () {
    const { metrics, isSimulating } = useIcmStore();

    return (
        <div className="glass-panel p-6 border border-white/10 rounded-2xl flex flex-col gap-4">
            <h3 className="text-xl font-heading text-slate-100 mb-2 border-b border-indigo-500/20 pb-2">
                <i className="fa-solid fa-microchip text-indigo-400 mr-2"></i>{ ' ' }
                Motor de Perspectiva Matemática
            </h3>

            <div className="grid grid-cols-2 gap-4">
                {/* EV Fold (Baseline Dinâmico) */ }
                <div className={ `p-4 rounded-xl border ${metrics.evFold > 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800/50 border-white/5'}` }>
                    <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">EV Fold (Piso)</div>
                    <div className={ `text-2xl font-bold font-mono ${metrics.evFold > 0 ? 'text-emerald-400' : 'text-slate-200'}` }>
                        { metrics.evFold.toFixed( 2 ) } bb
                    </div>
                </div>

                {/* Risk Premium */ }
                <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                    <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Risk Premium</div>
                    <div className="text-2xl font-bold font-mono text-rose-400">
                        { metrics.riskPremium.toFixed( 2 ) }%
                    </div>
                </div>

                {/* Bubble Factor */ }
                <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                    <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Bubble Factor</div>
                    <div className="text-2xl font-bold font-mono text-amber-400">
                        { metrics.bubbleFactor.toFixed( 2 ) }
                    </div>
                </div>

                {/* Insolvency Coefficient (Ci) para Multiway */ }
                <div className={ `p-4 rounded-xl border ${metrics.insolvencyCoefficient < 1 ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-800/50 border-white/5'}` }>
                    <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Coef. Insolvência (Ci)</div>
                    <div className={ `text-2xl font-bold font-mono ${metrics.insolvencyCoefficient < 1 ? 'text-rose-400' : 'text-sky-400'}` }>
                        { metrics.insolvencyCoefficient.toFixed( 2 ) }
                    </div>
                </div>
            </div>

            { isSimulating && (
                <div className="mt-4 text-xs font-mono text-indigo-400 animate-pulse text-center">
                    Recalculando Perspectiva Sistêmica...
                </div>
            ) }
        </div>
    );
}
