'use client';

interface InsolvencyRioPanelProps {
    insolvency: any;
    isCalculating: boolean;
}

export const InsolvencyRioPanel = ({ insolvency, isCalculating }: InsolvencyRioPanelProps) => {
    if (isCalculating) return <div className="p-4 mt-6 rounded-xl border border-white/5 bg-bg-deep flex items-center justify-center text-xs font-bold text-text-darker uppercase tracking-widest animate-pulse shadow-inner">Calculando Termodinâmica WASM...</div>;
    if (!insolvency) return null;

    const winPct = (insolvency.winRate * 100).toFixed(1);
    let riskLevel = "Controlado (GTO)";
    let riskColor = "text-accent-emerald";

    if (insolvency.riskIndex > 0.3) {
        riskLevel = "Crítico (Death Zone)";
        riskColor = "text-accent-danger";
    } else if (insolvency.riskIndex > 0.15) {
        riskLevel = "Moderado (Predator)";
        riskColor = "text-accent-amber";
    }

    return (
        <div className="grid grid-cols-2 gap-4 p-4 mt-6 bg-bg-deep rounded-xl border border-white/5 shadow-xl">
            <div className="flex flex-col">
                <span className="text-[0.65rem] font-black text-text-muted uppercase tracking-wider mb-1">A* Projected EV</span>
                <span className={`text-xl font-bold font-mono ${insolvency.trueInsolvencyEv < 0 ? 'text-accent-danger' : 'text-accent-emerald'}`}>
                    {insolvency.trueInsolvencyEv > 0 ? '+' : ''}{insolvency.trueInsolvencyEv.toFixed(2)} bb
                </span>
                <span className="text-[0.65rem] text-text-darker mt-1 italic">Ajustado pelo Sizing Geométrico</span>
            </div>

            <div className="flex flex-col border-l border-white/5 pl-4">
                <span className="text-[0.65rem] font-black text-text-muted uppercase tracking-wider mb-1">A* Risco Inflacionário</span>
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold font-mono text-text-bright">{(insolvency.riskIndex * 100).toFixed(1)}%</span>
                    <span className={`text-[0.6rem] font-bold px-2 py-0.5 rounded-full bg-black/40 ${riskColor}`}>
                        {riskLevel}
                    </span>
                </div>
                <span className="text-[0.65rem] text-text-darker mt-1 italic">Distorção Axioma Lipe Piv aplicada</span>
            </div>

            <div className="col-span-2 mt-2">
                <div className="flex justify-between text-[0.65rem] font-bold text-text-muted mb-1">
                    <span>Sobrevivência (Monte Carlo WASM)</span>
                    <span>Win: {winPct}%</span>
                </div>
                <div className="flex w-full h-1.5 rounded-full overflow-hidden opacity-80">
                    <div style={{ width: `${winPct}%` }} className="bg-accent-emerald" />
                    <div style={{ width: `${(insolvency.tieRate * 100)}%` }} className="bg-text-darker" />
                    <div style={{ width: `${(insolvency.loseRate * 100)}%` }} className="bg-accent-danger" />
                </div>
            </div>
        </div>
    );
};
