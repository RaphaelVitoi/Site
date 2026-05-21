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

// SOTA: Função pura hoisteada para O(1) alocação (Fricção Zero na renderização)
const formatEV = ( val: number ) => ( val > 0 ? `+${val.toFixed( 2 )}` : val.toFixed( 2 ) );

export const ActionPanel: React.FC<ActionPanelProps> = ( { fold, call, raise, onActionSelect } ) => {

    // SOTA: Despacho estático e Lei de Shannon. Redução drástica de JSX redundante preservando Tailwind JIT.
    const aggressiveActions = [
        {
            id: 'call' as const,
            metrics: call,
            title: 'Call',
            subtitle: `${Math.round( call.tension * 100 )}% RIO`,
            illusText: 'ChipEV (Ilusão):',
            fgsText: 'Erosão FGS (t-3):',
            cls: {
                border: 'border-teal-900/30 hover:border-teal-600/80',
                barBg: 'bg-teal-900/20 group-hover:bg-teal-800/40',
                titleTxt: 'text-teal-600 group-hover:text-teal-400',
                subTxt: 'text-teal-800',
                fgsTxt: 'text-amber-700/80'
            }
        },
        {
            id: 'raise' as const,
            metrics: raise,
            title: 'Raise',
            subtitle: 'Leverage',
            illusText: 'ChipEV (Bruto):',
            fgsText: 'Ganho FGS (Futuro):',
            cls: {
                border: 'border-amber-900/30 hover:border-amber-600/80',
                barBg: 'bg-amber-900/10 group-hover:bg-amber-900/40',
                titleTxt: 'text-amber-700 group-hover:text-amber-500',
                subTxt: 'text-amber-900',
                fgsTxt: 'text-teal-600/80'
            }
        }
    ];

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

            {/* AÇÕES AGRESSIVAS: Despacho Estático de Matriz */ }
            { aggressiveActions.map( ( action ) => (
                <button
                    key={ action.id }
                    onClick={ () => onActionSelect?.( action.id ) }
                    className={ `flex-1 relative overflow-hidden group bg-neutral-900 border ${action.cls.border} transition-all duration-300 rounded p-4 text-left flex flex-col justify-between min-h-[100px]` }
                >
                    <div
                        className={ `absolute bottom-0 left-0 w-full transition-all duration-500 ease-out ${action.cls.barBg}` }
                        style={ { height: `${action.metrics.tension * 100}%` } }
                    />
                    <div className="flex justify-between items-start z-10 relative">
                        <span className={ `${action.cls.titleTxt} font-bold tracking-widest uppercase text-sm transition-colors` }>{ action.title }</span>
                        <span className={ `${action.cls.subTxt} text-xs font-bold` }>{ action.subtitle }</span>
                    </div>
                    <div className="z-10 relative mt-4">
                        <div className="flex items-baseline space-x-2">
                            <div className="text-2xl text-neutral-200 font-light">{ formatEV( action.metrics.perspectiva ) }</div>
                        </div>
                        <div className="overflow-hidden max-h-0 group-hover:max-h-20 transition-all duration-500 ease-in-out">
                            <div className="mt-2 pt-2 border-t border-neutral-800/50 text-[10px] flex flex-col space-y-1">
                                <div className="flex justify-between text-neutral-400">
                                    <span>{ action.illusText }</span>
                                    <span>{ formatEV( action.metrics.chipEv ) }</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className={ action.cls.fgsTxt }>{ action.fgsText }</span>
                                    <span className={ action.cls.fgsTxt }>{ formatEV( action.metrics.fgsImpact ) }</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </button>
            ) ) }

        </div>
    );
};
