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
    isBaseline?: boolean;
    onActionSelect?: ( action: 'fold' | 'call' | 'raise' ) => void;
}

// SOTA: Extensão Semântica do Hover Tooltip para Componentes Modulares
const ActionTooltip = ( { title, desc, children }: { title: string, desc: string, children: React.ReactNode } ) => (
    <div className="relative group cursor-help flex-1 flex flex-col">
        { children }
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-3 bg-[#0a0f1c] border border-neutral-700/50 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none">
            <p className="text-neutral-200 text-xs font-bold uppercase tracking-widest mb-1">{ title }</p>
            <p className="text-neutral-400 text-[10px] leading-relaxed">{ desc }</p>
        </div>
    </div>
);

const formatEV = ( val: number, isBaseline: boolean, suffix: string = 'PM%' ) => {
    const formatted = val > 0 ? `+${val.toFixed( 2 )}` : val.toFixed( 2 );
    return isBaseline ? `${formatted} cEV` : `${formatted} ${suffix}`;
};

export const ActionPanel: React.FC<ActionPanelProps> = ( { fold, call, raise, isBaseline = false, onActionSelect } ) => {

    // SOTA: Despacho estático e Lei de Shannon. Redução drástica de JSX redundante preservando Tailwind JIT.
    const aggressiveActions = [
        {
            id: 'call' as const,
            metrics: call,
            title: 'Call',
            subtitle: isBaseline ? 'Linear' : `${Math.round( call.tension * 100 )}% RIO`,
            illusText: 'ChipEV (Ilusão):',
            fgsText: 'Erosão FGS (t-3):',
            cls: {
                tooltipTitle: 'Aprisionamento ao Pote (Call)',
                tooltipDesc: 'Call raramente encerra a mão. Pagar insere sua stack em uma espiral de Reverse Implied Odds (RIO) nas streets subsequentes. Avalie a diferença entre a ilusão do ChipEV e a erosão do FGS.',
                barBg: 'bg-teal-900/20 group-hover:bg-teal-800/40',
                border: 'border-teal-900/30 hover:border-teal-600/80',
                titleTxt: 'text-teal-600 group-hover:text-teal-400',
                subTxt: 'text-teal-800',
                fgsTxt: 'text-amber-700/80'
            }
        },
        {
            id: 'raise' as const,
            metrics: raise,
            title: 'Raise',
            subtitle: isBaseline ? 'Puro' : 'Leverage',
            illusText: 'ChipEV (Bruto):',
            fgsText: 'Ganho FGS (Futuro):',
            cls: {
                tooltipTitle: 'Transferência de Risco (Raise)',
                tooltipDesc: 'Agressão transfere a dor e alavanca o Bubble Factor do oponente contra ele mesmo. O ganho futuro de FGS compensa a volatilidade bruta, gerando Fold Equity não-linear.',
                barBg: 'bg-amber-900/10 group-hover:bg-amber-900/40',
                border: 'border-amber-900/30 hover:border-amber-600/80',
                titleTxt: 'text-amber-700 group-hover:text-amber-500',
                subTxt: 'text-amber-900',
                fgsTxt: 'text-teal-600/80'
            }
        }
    ];

    return (
        <div className="w-full flex flex-col md:flex-row gap-4 bg-neutral-950 p-4 border border-neutral-900 rounded-md font-mono">

            {/* FOLD: O Baseline (Piso) */ }
            <ActionTooltip title="Baseline de Sobrevivência (Fold)" desc="Em ICM, o EV do Fold não é zero. É o Sunk Cost (Fichas já investidas). Este valor estabelece o piso absoluto da equação: toda ação ofensiva precisa render MAIS do que essa base para ser matematicamente viável.">
                <button
                    onClick={ () => onActionSelect?.( 'fold' ) }
                    className="w-full flex-1 relative overflow-hidden group bg-neutral-900 border border-neutral-800 hover:border-neutral-600 transition-all duration-300 rounded p-4 text-left flex flex-col justify-between min-h-[100px]"
                >
                    <div className="flex justify-between items-start z-10 relative">
                        <span className="text-neutral-500 font-bold tracking-widest uppercase text-sm">Fold</span>
                        <span className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest">Piso Real</span>
                    </div>
                    <div className="z-10 relative mt-4">
                        <div className="text-2xl text-neutral-300 font-light">{ formatEV( fold.perspectiva, isBaseline ) }</div>
                        <div className="text-[9px] text-neutral-600 font-bold tracking-widest uppercase mt-1">
                            Sunk Cost (Investido)
                        </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </button>
            </ActionTooltip>

            {/* AÇÕES AGRESSIVAS: Despacho Estático de Matriz */ }
            { aggressiveActions.map( ( action ) => (
                <ActionTooltip key={ action.id } title={ action.cls.tooltipTitle } desc={ action.cls.tooltipDesc }>
                    <button
                        onClick={ () => onActionSelect?.( action.id ) }
                        className={ `w-full flex-1 relative overflow-hidden group bg-neutral-900 border ${action.cls.border} transition-all duration-300 rounded p-4 text-left flex flex-col justify-between min-h-[100px]` }
                    >
                        <div
                            className={ `absolute bottom-0 left-0 w-full transition-all duration-500 ease-out ${action.cls.barBg}` }
                            style={ { height: `${action.metrics.tension * 100}%` } }
                        />
                        <div className="flex justify-between items-start z-10 relative">
                            <span className={ `${action.cls.titleTxt} font-bold tracking-widest uppercase text-sm transition-colors` }>{ action.title }</span>
                            <span className={ `${action.cls.subTxt} text-[10px] uppercase tracking-widest font-bold` }>{ action.subtitle }</span>
                        </div>
                        <div className="z-10 relative mt-4">
                            <div className="flex items-baseline space-x-2">
                                <div className="text-2xl text-neutral-200 font-light">{ formatEV( action.metrics.perspectiva, isBaseline ) }</div>
                            </div>
                            <div className="overflow-hidden max-h-0 group-hover:max-h-24 transition-all duration-500 ease-in-out">
                                <div className="mt-2 pt-2 border-t border-neutral-800/50 text-[10px] flex flex-col space-y-1">
                                    <div className="flex justify-between text-neutral-400 font-bold">
                                        <span>{ action.illusText }</span>
                                        <span>{ formatEV( action.metrics.chipEv, true, 'cEV' ) }</span>
                                    </div>
                                    <div className="flex justify-between font-bold">
                                        <span className={ action.cls.fgsTxt }>{ action.fgsText }</span>
                                        <span className={ action.cls.fgsTxt }>{ formatEV( action.metrics.fgsImpact, isBaseline ) }</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </button>
                </ActionTooltip>
            ) ) }

        </div>
    );
};
