import React from 'react';

export interface CellData {
    combo: string;
    isSuited: boolean;
    frequencies: {
        fold: number;  // 0.0 a 1.0
        call: number;  // 0.0 a 1.0
        raise: number; // 0.0 a 1.0
    };
    ev: number;
}

interface RangeHeatmapProps {
    matrix: CellData[][]; // Grid 13x13 estrito
}

// Gerador Estocástico CCD SOTA (GTO Frequencies)
// Hoisteado para module scope. Evita O(N) recreações de função a cada ciclo de render.
const getStochasticStyle = ( freqs: CellData[ 'frequencies' ] ) => {
    // Protocolo Noctilux / Verdigris
    // Fold: Deep Black/Earth (Neutral 900 - #171717)
    // Call: Oxidized Copper / Verdigris (Teal 700 - #0f766e)
    // Raise: Aggressive Amber (Amber 700 - #b45309)

    const callPct = freqs.call * 100;
    const raisePct = freqs.raise * 100;
    const foldPct = freqs.fold * 100;

    // Estratégia Pura (Fricção Zero no render)
    if ( foldPct > 99 ) return { backgroundColor: '#171717' };
    if ( callPct > 99 ) return { backgroundColor: '#0f766e' };
    if ( raisePct > 99 ) return { backgroundColor: '#b45309' };

    // Estratégia Mista: Gradiente Estocástico (Simulação de Ruído/Tensão)
    return {
        background: `repeating-linear-gradient(
    45deg,
    #0f766e 0%,
    #0f766e ${callPct}%,
    #b45309 ${callPct}%,
    #b45309 ${callPct + raisePct}%,
    #171717 ${callPct + raisePct}%,
    #171717 100%
  )`,
        opacity: 0.95
    };
};

export const RangeHeatmap: React.FC<RangeHeatmapProps> = ( { matrix } ) => {

    return (
        <div className="flex flex-col items-center bg-neutral-950 p-6 rounded-lg border border-neutral-800 shadow-2xl font-mono text-neutral-300">
            <div className="flex justify-between w-full mb-4 px-2 border-b border-neutral-900 pb-2">
                <h3 className="text-amber-700 text-sm tracking-widest uppercase">Matriz de Frequência Estocástica</h3>
                <span className="text-xs text-neutral-500">SOTA V2 | GTO CCD</span>
            </div>

            {/* SOTA: Memoização do Grid de 169 células para estancar re-renders virtuais desnecessários */ }
            <div className="grid grid-cols-13 gap-px bg-neutral-800 p-px rounded border border-neutral-900 shadow-inner">
                { React.useMemo( () => matrix.map( ( row, rowIndex ) => (
                    <React.Fragment key={ `row-${rowIndex}` }>
                        { row.map( ( cell ) => (
                            <div
                                key={ cell.combo }
                                className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-[10px] md:text-xs cursor-pointer relative overflow-hidden group transition-transform hover:scale-110 hover:z-10"
                                style={ getStochasticStyle( cell.frequencies ) }
                                title={ `EV: ${cell.ev.toFixed( 3 )}\nFold: ${( cell.frequencies.fold * 100 ).toFixed( 0 )}%\nCall: ${( cell.frequencies.call * 100 ).toFixed( 0 )}%\nRaise: ${( cell.frequencies.raise * 100 ).toFixed( 0 )}%` }
                            >
                                <span className="relative z-10 font-semibold drop-shadow-md text-white mix-blend-difference">
                                    { cell.combo }
                                </span>
                            </div>
                        ) ) }
                    </React.Fragment>
                ) ), [ matrix ] ) }
            </div>
        </div>
    );
};
