'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';

export interface NashCellData {
    combo: string;
    pureEv: number;
    insolvencyDelta: number;
    isSuited: boolean;
    isPair: boolean;
}

interface NashConvergenceMatrixProps {
    readonly matrixData: NashCellData[];
    readonly isDynamicRpActive: boolean; // Controla se o Filtro Vitoi (Insolvência) está ligado
}

export function NashConvergenceMatrix ( { matrixData, isDynamicRpActive }: Readonly<NashConvergenceMatrixProps> ) {
    const [ hoveredCell, setHoveredCell ] = useState<NashCellData | null>( null );

    // O(1) Lookup map para garantir a renderização exata na grid 13x13
    const cellMap = useMemo( () => {
        const map = new Map<string, NashCellData>();
        matrixData.forEach( cell => map.set( cell.combo, cell ) );
        return map;
    }, [ matrixData ] );

    // Gera os eixos da matriz (A, K, Q... 2)
    const ranks = [ 'A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2' ];

    const gridCombos = useMemo( () => {
        const combos: string[] = [];
        for ( let i = 0; i < ranks.length; i++ )
        {
            for ( let j = 0; j < ranks.length; j++ )
            {
                if ( i === j )
                {
                    combos.push( `${ranks[ i ]}${ranks[ j ]}` ); // Pair
                } else if ( i < j )
                {
                    combos.push( `${ranks[ i ]}${ranks[ j ]}s` ); // Suited
                } else
                {
                    combos.push( `${ranks[ j ]}${ranks[ i ]}o` ); // Offsuit
                }
            }
        }
        return combos;
    }, [] );

    const getCellAppearance = ( data?: NashCellData ) => {
        if ( !data ) return 'bg-zinc-900/50 border-zinc-800 text-zinc-600'; // Missing data

        const actualPm = data.pureEv + ( isDynamicRpActive ? data.insolvencyDelta : 0 );

        // Armadilha Sistêmica (GTO aprova, Perspectiva condena)
        if ( data.pureEv > 0 && actualPm < 0 && isDynamicRpActive )
        {
            return 'bg-red-950/80 border-red-500/50 text-red-400 shadow-[inset_0_0_10px_rgba(239,68,68,0.2)]';
        }

        // Sucesso GTO / Perspectiva Positiva
        if ( actualPm > 0 )
        {
            // Intensidade do verde baseada no EV
            if ( actualPm > 2 ) return 'bg-emerald-600 border-emerald-500 text-emerald-50';
            if ( actualPm > 0.5 ) return 'bg-emerald-800/80 border-emerald-600 text-emerald-100';
            return 'bg-emerald-900/60 border-emerald-800/50 text-emerald-300';
        }

        // Neutro / Fold Natural
        return 'bg-zinc-900 border-zinc-800 text-zinc-500';
    };

    return (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto space-y-6">
            {/* Matriz SOTA - Erradicação de overflow via aspect-square responsivo */ }
            <div className="w-full relative aspect-square max-h-[70vh] bg-zinc-950 p-2 rounded-xl border border-zinc-800/50 shadow-2xl">
                <div className="grid grid-cols-13 gap-px w-full h-full">
                    { gridCombos.map( ( combo ) => {
                        const data = cellMap.get( combo );
                        const appearance = getCellAppearance( data );
                        const isInsolvent = isDynamicRpActive && data && data.pureEv > 0 && ( data.pureEv + data.insolvencyDelta ) < 0;

                        return (
                            <motion.div
                                key={ combo }
                                onMouseEnter={ () => data && setHoveredCell( data ) }
                                onMouseLeave={ () => setHoveredCell( null ) }
                                className={ `
                  relative flex items-center justify-center
                  text-[0.6rem] sm:text-xs md:text-sm font-semibold
                  border rounded-xs transition-colors duration-300 cursor-pointer
                  ${appearance}
                `}
                                whileHover={ { scale: 1.1, zIndex: 10 } }
                                animate={ isInsolvent ? {
                                    scale: [ 1, 0.95, 1 ],
                                    transition: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                                } : {} }
                            >
                                { combo }
                            </motion.div>
                        );
                    } ) }
                </div>
            </div>

            {/* Painel de Inspeção Visceral (Fricção Zero - Sem Tooltips Flutuantes) */ }
            <div className="w-full h-32 bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-center overflow-hidden relative">
                <AnimatePresence mode="wait">
                    { hoveredCell ? (
                        <motion.div
                            key="inspector-active"
                            initial={ { opacity: 0, y: 10 } }
                            animate={ { opacity: 1, y: 0 } }
                            exit={ { opacity: 0, y: -10 } }
                            transition={ { duration: 0.2 } }
                            className="flex w-full items-center justify-between"
                        >
                            <div className="flex flex-col">
                                <span className="text-3xl font-black text-zinc-100 tracking-tighter">
                                    { hoveredCell.combo }
                                </span>
                                <span className="text-xs text-zinc-500 uppercase tracking-widest">
                                    Inspeção Estrutural
                                </span>
                            </div>

                            <div className="flex space-x-8">
                                <div className="flex flex-col items-end">
                                    <span className="text-xs text-zinc-500 uppercase tracking-wider">GTO (ChipEV)</span>
                                    <span className={ `font-mono text-lg font-bold ${hoveredCell.pureEv > 0 ? 'text-emerald-400' : 'text-zinc-500'}` }>
                                        { hoveredCell.pureEv > 0 ? '+' : '' }{ hoveredCell.pureEv.toFixed( 2 ) } bb
                                    </span>
                                </div>

                                <div className="flex flex-col items-end">
                                    <span className="text-xs text-red-500/70 uppercase tracking-wider">Passivo Sistêmico</span>
                                    <span className="font-mono text-lg font-bold text-red-400">
                                        { hoveredCell.insolvencyDelta.toFixed( 2 ) } bb
                                    </span>
                                </div>

                                <div className="flex flex-col items-end border-l border-zinc-800 pl-8">
                                    <span className="text-xs text-cyan-500/70 uppercase tracking-wider">Perspectiva (PM)</span>
                                    <span className={ `font-mono text-xl font-black tracking-tight ${( hoveredCell.pureEv + hoveredCell.insolvencyDelta ) > 0 ? 'text-emerald-400' : 'text-red-500'
                                        }` }>
                                        { ( hoveredCell.pureEv + hoveredCell.insolvencyDelta ).toFixed( 2 ) } bb
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="inspector-idle"
                            initial={ { opacity: 0 } }
                            animate={ { opacity: 1 } }
                            exit={ { opacity: 0 } }
                            className="flex items-center justify-center w-full h-full text-zinc-600 text-sm font-medium tracking-wide uppercase"
                        >
                            Passe o cursor sobre a matriz para inspecionar a Perspectiva Matemática
                        </motion.div>
                    ) }
                </AnimatePresence>

                {/* Overlay de Alerta para Armadilhas */ }
                { hoveredCell && hoveredCell.pureEv > 0 && ( hoveredCell.pureEv + hoveredCell.insolvencyDelta ) < 0 && isDynamicRpActive && (
                    <motion.div
                        initial={ { opacity: 0 } }
                        animate={ { opacity: 1 } }
                        className="absolute bottom-0 left-0 w-full h-1 bg-red-600"
                    />
                ) }
            </div>
        </div>
    );
}
