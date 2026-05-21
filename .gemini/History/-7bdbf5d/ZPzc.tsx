'use client';

import { motion } from 'framer-motion';
import React, { useMemo } from 'react';

export interface RangeHeatmapProps {
    /** Array linear de 169 posições contendo a densidade de colisão (0.0 a 1.0) */
    collisionMatrix: number[];
}

const RANKS = [ 'A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2' ];

const RangeHeatmap: React.FC<RangeHeatmapProps> = ( { collisionMatrix } ) => {
    // Memoização rigorosa para impedir re-renders do grid base durante mutações externas.
    const gridCells = useMemo( () => {
        return Array.from( { length: 169 } ).map( ( _, index ) => {
            const row = Math.floor( index / 13 );
            const col = index % 13;

            // Lógica de topologia de Poker (Upper right = Suited, Lower left = Offsuit, Diagonal = Pairs)
            let label = '';
            if ( row === col )
            {
                label = `${RANKS[ row ]}${RANKS[ col ]}`;
            } else if ( row < col )
            {
                label = `${RANKS[ row ]}${RANKS[ col ]}s`;
            } else
            {
                label = `${RANKS[ col ]}${RANKS[ row ]}o`;
            }

            const density = collisionMatrix[ index ] ?? 0;
            const isDeathZone = density > 0.7; // Threshold Crítico do Risk Premium

            return (
                <div
                    key={ label }
                    title={ `Mão: ${label} | Risco de Colisão: ${( density * 100 ).toFixed( 1 )}%` }
                    className={ `w-full aspect-square flex items-center justify-center text-[9px] sm:text-[10px] font-mono cursor-crosshair transition-all duration-300
            ${isDeathZone ? 'bg-[#cd5c5c] text-white font-bold shadow-[0_0_8px_rgba(205,92,92,0.8)] z-10 relative' : 'bg-gray-900/40 text-gray-600 hover:bg-gray-700/80 hover:text-gray-300'}` }
                    style={ {
                        backgroundColor: isDeathZone ? undefined : `rgba(205, 92, 92, ${density * 0.6})`
                    } }
                >
                    { label }
                </div>
            );
        } );
    }, [ collisionMatrix ] );

    return (
        <motion.div
            initial={ { opacity: 0, scale: 0.98, y: 10 } }
            animate={ { opacity: 1, scale: 1, y: 0 } }
            className="w-full max-w-xl p-4 bg-black/90 border border-gray-800/60 rounded-xl backdrop-blur-md shadow-2xl"
        >
            <div className="grid grid-cols-13 gap-[1px] bg-gray-900 p-[1px] rounded-sm">
                { gridCells }
            </div>
            <div className="mt-5 flex items-center justify-between text-xs font-mono text-gray-500 uppercase tracking-widest">
                <span>Especulação Segura</span>
                <div className="h-1 flex-1 mx-6 rounded-full bg-gradient-to-r from-gray-900/50 via-gray-700 to-[#cd5c5c]" />
                <span className="text-[#cd5c5c] font-bold">Zona da Morte</span>
            </div>
        </motion.div>
    );
};

export default RangeHeatmap;
