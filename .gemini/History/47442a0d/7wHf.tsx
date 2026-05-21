import React, { useMemo, memo } from 'react';

export interface SpotData {
    heroStack: number;
    villainStack: number;
    pot: number;
    betSize: number;
    bubbleFactor: number;
    chipEv: number;
    fgsProjection: number;
}

interface RiskPremiumDashboardProps {
    spot: SpotData;
}

const RiskPremiumDashboardComponent: React.FC<RiskPremiumDashboardProps> = ( { spot } ) => {
    const riskPremium = useMemo( () => Math.max( 0, spot.bubbleFactor - 1 ), [ spot.bubbleFactor ] );

    const tensionIndex = useMemo( () => {
        const commitment = spot.betSize / ( spot.heroStack + 0.001 );
        return Math.min( 1, commitment * riskPremium * 2 );
    }, [ spot.betSize, spot.heroStack, riskPremium ] );

    return (
        <div className="flex flex-col w-full bg-neutral-950 text-neutral-300 font-mono border border-neutral-800 rounded-md overflow-hidden shadow-2xl">
            {/* Header - Noctilux / Copper styling */ }
            <div className="flex justify-between items-center px-4 py-3 bg-neutral-900 border-b border-neutral-800">
                <h2 className="text-sm font-semibold tracking-widest text-amber-700 uppercase">
                    Tensão Decisional <span className="text-neutral-500">| SOTA V2</span>
                </h2>
                <span className="text-xs text-neutral-500">ICM / FGS Engine</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-neutral-800">
                {/* Métrica: Bubble Factor & Risk Premium */ }
                <div className="flex flex-col bg-neutral-950 p-6 relative overflow-hidden">
                    <div className="z-10 relative">
                        <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Bubble Factor</p>
                        <p className="text-3xl font-light text-neutral-100">{ spot.bubbleFactor.toFixed( 3 ) }</p>

                        <div className="mt-4 pt-4 border-t border-neutral-900">
                            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Risk Premium (Dor)</p>
                            <p className="text-xl font-medium text-teal-600/80">{ ( riskPremium * 100 ).toFixed( 1 ) }%</p>
                        </div>
                    </div>
                    {/* Fundo dinâmico baseado na Tensão (Verdigris estocástico) */ }
                    <div
                        className="absolute bottom-0 left-0 w-full h-1 bg-teal-800/30 transition-all duration-500 ease-in-out"
                        style={ { height: `${tensionIndex * 100}%`, opacity: tensionIndex * 0.4 } }
                    />
                </div>

                {/* Métrica: FGS & Erosão */ }
                <div className="flex flex-col bg-neutral-950 p-6">
                    <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Impacto FGS (t-3)</p>
                    <div className="flex items-baseline space-x-2">
                        <p className={ `text-3xl font-light ${spot.fgsProjection < 0 ? 'text-amber-700' : 'text-teal-600/80'}` }>
                            { spot.fgsProjection > 0 ? '+' : '' }{ spot.fgsProjection.toFixed( 2 ) }
                        </p>
                        <span className="text-sm text-neutral-600">EV</span>
                    </div>
                    <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
                        A erosão antecipada precifica a perda de Perspectiva Matemática nas próximas órbitas.
                    </p>
                </div>

                {/* Visor GTO Estocástico */ }
                <div className="flex flex-col bg-neutral-950 p-6">
                    <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Composição Estratégica</p>
                    <div className="flex-1 w-full mt-2 rounded border border-neutral-800 flex overflow-hidden relative">
                        {/* Representação visual de frequências mistas com ruído/estocástica simulada */ }
                        <div className="h-full bg-teal-900/40 w-[45%] flex items-center justify-center border-r border-neutral-950">
                            <span className="text-xs font-bold text-teal-500/70 mix-blend-screen">CALL 45%</span>
                        </div>
                        <div className="h-full bg-neutral-800/50 w-[55%] flex items-center justify-center relative">
                            {/* Padrão estocástico CSS puro */ }
                            <div className="absolute inset-0 opacity-20" style={ { backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, #000 2px, #000 4px)' } }></div>
                            <span className="text-xs font-bold text-neutral-400 z-10">FOLD 55%</span>
                        </div>
                    </div>
                    <div className="mt-3 flex justify-between text-[10px] text-neutral-600">
                        <span>ChipEV: { spot.chipEv > 0 ? `+${spot.chipEv}` : spot.chipEv }</span>
                        <span>Limiar Ajustado: { ( ( 1 - ( spot.chipEv / ( spot.pot || 1 ) ) ) * riskPremium * 100 ).toFixed( 1 ) }%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// SOTA: Fricção Zero. Evita a recriação do componente verificando igualdade de primitivos
export const RiskPremiumDashboard = memo( RiskPremiumDashboardComponent, ( prevProps, nextProps ) => {
    return (
        prevProps.spot.heroStack === nextProps.spot.heroStack &&
        prevProps.spot.villainStack === nextProps.spot.villainStack &&
        prevProps.spot.pot === nextProps.spot.pot &&
        prevProps.spot.betSize === nextProps.spot.betSize &&
        prevProps.spot.bubbleFactor === nextProps.spot.bubbleFactor &&
        prevProps.spot.chipEv === nextProps.spot.chipEv &&
        prevProps.spot.fgsProjection === nextProps.spot.fgsProjection
    );
} );
