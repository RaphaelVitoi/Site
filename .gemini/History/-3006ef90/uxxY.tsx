import React from 'react';

export interface ActionMetrics {
    chipEv: number;
    perspectiva: number; // EV ICM / Perspectiva Matemática (com FGS/RIO)
    fgsImpact: number;   // Erosão (t-3) ou ganho futuro
    tension: number;     // 0.0 a 1.0 (Índice heurístico de Dor/Passivo Estrutural)
}

interface ActionPanelProps {
    fold: ActionMetrics;
    call: ActionMetrics;
    raise: ActionMetrics;
    onActionSelect?: ( action: 'fold' | 'call' | 'raise' ) => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ( { fold, call, raise, onActionSelect } ) => {

    const formatEV = ( val: number ) => ( val > 0 ? `+${val.toFixed( 2 )}` : val.toFixed( 2 ) );

    return (
        <div className="w-full flex flex-col md:flex-row gap-4 bg-neutral-950 p-4 border border-neutral-900 rounded-md font-mono">

            {/* FOLD: O Baseline (Piso) */ }
            <button
                onClick={ () => onActionSelect?.( 'fold' ) }
                className="flex-1 relative overflow-hidden group bg-neutral-900 border border-neutral-800 hover:border-neutral-600 transition-all duration-300 rounded p-4 text-left flex flex-col justify-between min-h-[100px]"
            >
                <div className="flex justify-between items-start z-10 relative">
                    <span className="text-neutral-500 font-bold tracking-widest uppercase text-sm">Fold</span>
                    <span className="text-neutral-400 text-xs">Baseline</span>
                </div>
                <div className="z-10 relative mt-4">
                    <div className="text-2xl text-neutral-300 font-light">{ formatEV( fold.perspectiva ) }</div>
                    <div className="text-[10px] text-neutral-600 uppercase mt-1">
                        Perda Fixa (Antes/Blinds)
                    </div>
                </div>
                {/* Efeito Hover: Absorção (Buraco Negro) */ }
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>

            {/* CALL: Aprisionamento ao Pote (Teal / Verdigris) */ }
            <button
                onClick={ () => onActionSelect?.( 'call' ) }
                className="flex-1 relative overflow-hidden group bg-neutral-900 border border-teal-900/30 hover:border-teal-600/80 transition-all duration-300 rounded p-4 text-left flex flex-col justify-between min-h-[100px]"
            >
                {/* Indicador de Tensão (RIO) visualizado no background */ }
                <div
                    className="absolute bottom-0 left-0 w-full bg-teal-900/20 transition-all duration-500 ease-out group-hover:bg-teal-800/40"
                    style={ { height: `${call.tension * 100}%` } }
                />

                <div className="flex justify-between items-start z-10 relative">
                    <span className="text-teal-600 font-bold tracking-widest uppercase text-sm group-hover:text-teal-400 transition-colors">Call</span>
                    <span className="text-teal-800 text-xs font-bold">{ Math.round( call.tension * 100 ) }% RIO</span>
                </div>

                <div className="z-10 relative mt-4">
                    <div className="flex items-baseline space-x-2">
                        <div className="text-2xl text-neutral-200 font-light">{ formatEV( call.perspectiva ) }</div>
                    </div>

                    {/* Revelação Visceral no Hover (A Realidade vs O Engano) */ }
                    <div className="overflow-hidden max-h-0 group-hover:max-h-20 transition-all duration-500 ease-in-out">
                        <div className="mt-2 pt-2 border-t border-teal-900/50 text-[10px] flex flex-col space-y-1">
                            <div className="flex justify-between text-neutral-400">
                                <span>ChipEV (Ilusão):</span>
                                <span>{ formatEV( call.chipEv ) }</span>
                            </div>
                            <div className="flex justify-between text-amber-700/80">
                                <span>Erosão FGS (t-3):</span>
                                <span>{ formatEV( call.fgsImpact ) }</span>
                            </div>
                        </div>
                    </div>
                </div>
            </button>

            {/* RAISE: Agressão e Transferência de Risco (Amber / Cobre Oxidado) */ }
            <button
                onClick={ () => onActionSelect?.( 'raise' ) }
                className="flex-1 relative overflow-hidden group bg-neutral-900 border border-amber-900/30 hover:border-amber-600/80 transition-all duration-300 rounded p-4 text-left flex flex-col justify-between min-h-[100px]"
            >
                {/* Indicador de Tensão / Leverage */ }
                <div
                    className="absolute bottom-0 left-0 w-full bg-amber-900/10 transition-all duration-500 ease-out group-hover:bg-amber-900/40"
                    style={ { height: `${raise.tension * 100}%` } }
                />

                <div className="flex justify-between items-start z-10 relative">
                    <span className="text-amber-700 font-bold tracking-widest uppercase text-sm group-hover:text-amber-500 transition-colors">Raise</span>
                    <span className="text-amber-900 text-xs font-bold">Leverage</span>
                </div>

                <div className="z-10 relative mt-4">
                    <div className="flex items-baseline space-x-2">
                        <div className="text-2xl text-neutral-200 font-light">{ formatEV( raise.perspectiva ) }</div>
                    </div>

                    <div className="overflow-hidden max-h-0 group-hover:max-h-20 transition-all duration-500 ease-in-out">
                        <div className="mt-2 pt-2 border-t border-amber-900/50 text-[10px] flex flex-col space-y-1">
                            <div className="flex justify-between text-neutral-400">
                                <span>ChipEV (Bruto):</span>
                                <span>{ formatEV( raise.chipEv ) }</span>
                            </div>
                            <div className="flex justify-between text-teal-600/80">
                                <span>Ganho FGS (Futuro):</span>
                                <span>{ formatEV( raise.fgsImpact ) }</span>
                            </div>
                        </div>
                    </div>
                </div>
            </button>

        </div>
    );
};
