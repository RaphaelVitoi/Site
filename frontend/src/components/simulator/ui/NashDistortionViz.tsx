'use client';

interface NashDistortionVizProps {
    streetName: string;
    nashData: any;
}

export const NashDistortionViz = ({ streetName, nashData }: NashDistortionVizProps) => {
    // SOTA: Fallback resiliente se o WASM ainda não tiver propagado as distorções
    const foldValue = nashData?.oop?.fold?.center ?? 33.3;
    const callValue = nashData?.oop?.call?.center ?? 33.3;
    const raiseValue = nashData?.oop?.raise?.center ?? 33.4;

    const fPct = foldValue.toFixed(1);
    const cPct = callValue.toFixed(1);
    const rPct = raiseValue.toFixed(1);

    const foldStyle = { style: { width: `${fPct}%` } };
    const callStyle = { style: { width: `${cPct}%` } };
    const raiseStyle = { style: { width: `${rPct}%` } };

    return (
        <div className="flex flex-col gap-4 p-6 bg-black/60 rounded-3xl border border-white/5 shadow-2xl transition-all duration-500 hover:bg-black/80 hover:border-white/10 group">
            <div className="flex items-center justify-between mb-1">
                <h4 className="text-[0.6rem] font-black tracking-[0.25em] text-text-muted uppercase flex items-center gap-2 group-hover:text-text-dim transition-colors">
                    <i className="fa-solid fa-bolt text-accent-amber/40 animate-pulse"></i>
                    {streetName} Distortion
                </h4>
                {!nashData && <span className="text-[0.55rem] uppercase tracking-widest text-text-dim animate-pulse">Calculando...</span>}
            </div>
            
            <div className="flex w-full h-4 rounded-xl overflow-hidden opacity-95 shadow-inner bg-white/5 border border-white/5">
                {foldValue > 0 && <div {...foldStyle} className="bg-accent-danger transition-[width] duration-700 ease-out shadow-[0_0_15px_rgba(244,63,94,0.4)]" title={`Fold: ${fPct}%`} />}
                {callValue > 0 && <div {...callStyle} className="bg-accent-emerald transition-[width] duration-700 ease-out shadow-[0_0_15px_rgba(16,185,129,0.4)]" title={`Call: ${cPct}%`} />}
                {raiseValue > 0 && <div {...raiseStyle} className="bg-accent-indigo transition-[width] duration-700 ease-out shadow-[0_0_15px_rgba(99,102,241,0.4)]" title={`Raise: ${rPct}%`} />}
            </div>
            
            <div className="flex justify-between text-[0.65rem] font-black font-mono mt-1 px-1">
                <div className="flex flex-col gap-0.5">
                    <span className="text-text-darker uppercase text-[0.45rem] tracking-widest">Fold</span>
                    <span className="text-accent-danger drop-shadow-[0_0_8px_rgba(244,63,94,0.4)] font-bold">{fPct}%</span>
                </div>
                <div className="flex flex-col gap-0.5 items-center">
                    <span className="text-text-darker uppercase text-[0.45rem] tracking-widest">Call</span>
                    <span className="text-accent-emerald drop-shadow-[0_0_8px_rgba(16,185,129,0.4)] font-bold">{cPct}%</span>
                </div>
                <div className="flex flex-col gap-0.5 items-end">
                    <span className="text-text-darker uppercase text-[0.45rem] tracking-widest">Raise</span>
                    <span className="text-accent-indigo drop-shadow-[0_0_8px_rgba(99,102,241,0.4)] font-bold">{rPct}%</span>
                </div>
            </div>
        </div>
    );
};
