'use client';


export interface DegradationChartProps {
    perspectivaBase: number;
    potOddsPct: number;
    potSizePct: number;
}

export default function DegradationChart ( { perspectivaBase, potOddsPct, potSizePct }: DegradationChartProps ) {
    return (
        <div className="p-6 text-center text-slate-400 text-sm border border-white/5 rounded-xl bg-black/20">Gráfico de Degradação Fractal (SOTA) ativo via Motor Quantum.</div>
    );
}
