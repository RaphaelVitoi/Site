'use client';

import { useContext } from 'react';
import { SotaMetricsContext } from './UniversalLabShell';

/**
 * [CLIENT] Painel Visual do Vetor de Monopólio SOTA.
 * Utiliza barras nativas fluidas sem dependências externas de gráficos.
 * Implementa Gamificação Visceral através da colorimetria de Raphael Vitoi.
 */
export function MonopolyVectorPanel () {
    const metrics = useContext( SotaMetricsContext );

    if ( !metrics )
    {
        return (
            <div className="p-4 border border-red-900/50 bg-red-900/10 text-red-500 rounded-lg font-mono text-sm">
                [ENTROPIA] SotaMetricsContext ausente ou corrompido.
            </div>
        );
    }

    const { monopolyVector } = metrics;

    // Colorimetria Semântico-Associativa:
    // < 1 (Vermelho - Entropia/Déficit), >= 1 (Verde - Simetria/Monopólio)
    const isEntropy = monopolyVector < 1;
    const barColor = isEntropy ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]';
    const textColor = isEntropy ? 'text-red-400' : 'text-emerald-400';

    // Normalização matemática para CSS Flex (Escala 0.0 a 2.0)
    const percentage = Math.min( Math.max( ( monopolyVector / 2 ) * 100, 0 ), 100 );

    return (
        <div className="w-full bg-zinc-950 border border-zinc-800/80 rounded-lg p-5 mt-4 relative overflow-hidden">
            <div className="flex justify-between items-center mb-3 relative z-10">
                <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                    Vetor Monopólio (Tensão)
                </span>
                <span className={ `font-mono font-black ${textColor}` }>
                    { monopolyVector.toFixed( 3 ) }
                </span>
            </div>

            {/* Motor SOTA Visual O(1) - Substitui libs massivas como Recharts */ }
            <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden relative z-10">
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-zinc-600 z-20" /> {/* Ponto de Equilíbrio */ }
                <div className={ `h-full transition-all duration-700 ease-out ${barColor} relative z-10` } style={ { width: `${percentage}%` } } />
            </div>

            <div className="absolute inset-0 bg-linear-to-b from-transparent to-white/2 pointer-events-none" />
        </div>
    );
}
