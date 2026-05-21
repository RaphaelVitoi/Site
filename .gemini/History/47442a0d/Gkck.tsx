import dynamic from 'next/dynamic';
import React, { memo, useMemo, useState } from 'react';
import ExportAntevisaoButton from './ExportAntevisaoButton';

export interface SpotData {
    heroStack: number;
    villainStack: number;
    heroRole: string;
    villainRole: string;
    pot: number;
    betSize: number;
    bubbleFactor: number;
    riskPremium: number;
    chipEv: number;
    fgsProjection: number;
    fgsHealth: number;
    isBaseline: boolean;
    icmEv?: number;
    collisionMatrix?: number[];
}

const DynamicRangeHeatmap = dynamic( () => import( './CCDHeatmap' ), {
    ssr: false,
    loading: () => <div className="p-4 text-xs text-[#cd5c5c] font-mono animate-pulse">Materializando CCD...</div>
} );

interface RiskPremiumDashboardProps {
    spot: SpotData;
}

// SOTA: Componente de Tooltip Didático (CSS Puro)
export const MetricTooltip = ( { title, desc, children }: { title: string, desc: string, children: React.ReactNode } ) => (
    <div className="relative group cursor-help h-full flex flex-col">
        { children }
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 p-4 bg-[#0a0f1c] border border-teal-900/50 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none">
            <p className="text-teal-400 text-xs font-bold uppercase tracking-widest mb-2 border-b border-teal-900/30 pb-1">{ title }</p>
            <p className="text-neutral-300 text-[11px] leading-relaxed">{ desc }</p>
        </div>
    </div>
);

const RiskPremiumDashboardComponent: React.FC<RiskPremiumDashboardProps> = ( { spot } ) => {
    const tensionIndex = useMemo( () => {
        const commitment = spot.betSize / ( spot.heroStack + 0.001 );
        return Math.min( 1, commitment * ( spot.riskPremium / 100 ) * 2 );
    }, [ spot.betSize, spot.heroStack, spot.riskPremium ] );

    const [ showDeathZone, setShowDeathZone ] = useState( false );

    // Fallback de Matriz Estocástica para validação visual (se o Motor ainda não tiver injetado)
    const safeCollisionMatrix = useMemo( () => {
        return spot.collisionMatrix || Array.from( { length: 169 } ).map( () => Math.random() * ( spot.riskPremium / 100 ) * 2 );
    }, [ spot.collisionMatrix, spot.riskPremium ] );

    return (
        <div className="flex flex-col w-full bg-black text-neutral-300 font-mono border border-neutral-900 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] relative">
            <div className="flex justify-between items-center px-5 py-4 bg-[#030303] border-b border-neutral-900/60">
                <div className="flex flex-col">
                    <h2 className="text-sm font-bold tracking-widest text-amber-700 uppercase">
                        Tensão Decisional <span className="text-neutral-600 font-light">| SOTA V2</span>
                    </h2>
                    <span className="text-[10px] text-neutral-500 tracking-widest uppercase mt-1">{ spot.isBaseline ? 'ChipEV Baseline' : 'Motor ICM / FGS' }</span>
                </div>
                <ExportAntevisaoButton
                    bf={ spot.isBaseline ? 1 : spot.bubbleFactor }
                    rp={ spot.isBaseline ? 0 : spot.riskPremium }
                    pureEv={ spot.chipEv }
                    icmEv={ spot.isBaseline ? spot.chipEv : ( spot.icmEv ?? ( spot.chipEv - ( spot.riskPremium / 100 ) ) ) }
                    pot={ spot.pot }
                    bet={ spot.betSize }
                />
            </div>

            {/* TRACKER DE ESTADO ATUALIZADO (PÓS-SUNK COST) */ }
            <div className="flex justify-between items-center px-6 py-5 bg-[#080808] border-b border-neutral-900/50 text-xs relative">
                <div className="flex gap-6">
                    <div className="flex flex-col">
                        <span className="text-neutral-600 font-bold tracking-widest uppercase mb-1">Hero</span>
                        <span className="text-teal-400 text-lg font-light">{ spot.heroStack.toFixed( 1 ) } <span className="text-xs text-neutral-600">bb</span></span>
                        <span className="text-[9px] text-neutral-500 uppercase mt-1">{ spot.heroRole }</span>
                    </div>
                    <div className="w-px h-12 bg-neutral-800/50 my-auto" />
                    <button
                        onClick={ () => setShowDeathZone( !showDeathZone ) }
                        className="flex flex-col text-left group hover:bg-neutral-900/30 p-2 -m-2 rounded transition-colors cursor-crosshair"
                        title="Acionar Matriz CCD (Zona da Morte)"
                    >
                        <span className="text-neutral-600 font-bold tracking-widest uppercase mb-1 group-hover:text-[#cd5c5c] transition-colors flex items-center gap-1">Villain <svg className={ `w-3 h-3 transition-transform ${showDeathZone ? 'rotate-180 text-[#cd5c5c]' : ''}` } fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M19 9l-7 7-7-7" /></svg></span>
                        <span className="text-amber-700/80 text-lg font-light group-hover:text-amber-600">{ spot.villainStack.toFixed( 1 ) } <span className="text-xs text-neutral-600">bb</span></span>
                        <span className="text-[9px] text-neutral-500 uppercase mt-1 group-hover:text-neutral-400">{ spot.villainRole }</span>
                    </button>
                </div>
                <div className="flex flex-col text-right">
                    <span className="text-neutral-600 font-bold tracking-widest uppercase mb-1">Dead Money</span>
                    <span className="text-neutral-200 text-xl font-light">{ spot.pot.toFixed( 2 ) } <span className="text-xs text-neutral-600">bb</span></span>
                </div>
            </div>

            { showDeathZone && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40">
                    <DynamicRangeHeatmap collisionMatrix={ safeCollisionMatrix } />
                </div>
            ) }

            {/* SOTA: Whitespace & Negative Space Design em vez de grid clunky */ }
            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-neutral-900/60 bg-black">
                <div className="flex flex-col p-8 relative overflow-hidden flex-1">
                    <MetricTooltip title="Risk Premium (A Dor)" desc="A métrica global absoluta. Representa a equidade extra (em %) exigida para justificar uma colisão. Se for 15%, você precisa de 15% a mais de equity do que as pot odds sugerem para pagar. O Bubble Factor é apenas o multiplicador aritmético subjacente.">
                        <div className="z-10 relative flex-1">
                            <p className="text-xs text-teal-700/80 font-bold uppercase tracking-widest mb-1">Risk Premium</p>
                            <p className="text-4xl font-light text-teal-500">{ spot.isBaseline ? '0.0' : spot.riskPremium.toFixed( 1 ) }%</p>

                            <div className="mt-6 pt-4 border-t border-neutral-900/50">
                                <p className="text-[10px] text-neutral-600 uppercase tracking-widest mb-1">Bubble Factor</p>
                                <p className="text-lg font-medium text-neutral-500">{ spot.isBaseline ? '1.000' : spot.bubbleFactor.toFixed( 3 ) }</p>
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full bg-teal-900/20 transition-all duration-500 ease-in-out" style={ { height: `${tensionIndex * 100}%`, opacity: tensionIndex * 0.5 } } />
                    </MetricTooltip>
                </div>

                <div className="flex flex-col p-8 flex-1">
                    <MetricTooltip title="FGS & Saúde Estrutural" desc="Mede a erosão (ou bônus de sobrevivência) da sua stack em órbitas futuras (ex: blinds subindo). Um FGS negativo exige ações mais agressivas no presente. Em cenários ChipEV, seu valor é estritamente 0.00.">
                        <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mb-1">Antevisão (FGS)</p>
                        <div className="flex items-baseline space-x-2">
                            <p className={ `text-4xl font-light ${spot.fgsProjection < 0 ? 'text-amber-700' : 'text-teal-600/80'}` }>
                                { spot.fgsProjection > 0 ? '+' : '' }{ spot.fgsProjection.toFixed( 2 ) }
                            </p>
                            <span className="text-[10px] text-neutral-600 font-bold uppercase">{ spot.isBaseline ? 'cEV' : 'PM%' }</span>
                        </div>
                        <div className="mt-6 pt-4 border-t border-neutral-900/50">
                            <p className="text-[10px] text-neutral-600 uppercase tracking-widest mb-1">Saúde Estrutural</p>
                            <p className="text-lg font-medium text-neutral-500">{ spot.fgsHealth.toFixed( 3 ) }x</p>
                        </div>
                    </MetricTooltip>
                </div>

                <div className="flex flex-col p-8 flex-1">
                    <MetricTooltip title="Distorção Estratégica" desc="Representação visual do desvio comportamental exigido pelo ICM. Um Risk Premium alto dilata a frequência de Fold, obliterando os limites permissivos de ChipEV puro.">
                        <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mb-1">Assimetria de Range</p>
                        <div className="flex-1 w-full mt-3 rounded-md border border-neutral-800/80 flex overflow-hidden relative shadow-inner">
                            <div className="h-full bg-teal-900/40 flex items-center justify-center border-r border-neutral-950 transition-all duration-700" style={ { width: spot.isBaseline ? '60%' : '40%' } }>
                                <span className="text-[10px] font-bold text-teal-500/70 mix-blend-screen">PLAY</span>
                            </div>
                            <div className="h-full bg-[#cd5c5c]/10 flex items-center justify-center relative transition-all duration-700" style={ { width: spot.isBaseline ? '40%' : '60%' } }>
                                <div className="absolute inset-0 opacity-10" style={ { backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, #cd5c5c 2px, #cd5c5c 4px)' } }></div>
                                <span className="text-[10px] font-bold text-neutral-400 z-10">FOLD</span>
                            </div>
                        </div>
                        <div className="mt-5 flex justify-between text-[9px] font-bold uppercase tracking-widest text-neutral-600">
                            <span>ChipEV: { spot.chipEv > 0 ? `+${spot.chipEv.toFixed( 1 )}` : spot.chipEv.toFixed( 1 ) }</span>
                            <span>Piso Dinâmico: { ( ( 1 - ( spot.chipEv / ( spot.pot || 1 ) ) ) * spot.riskPremium ).toFixed( 1 ) }%</span>
                        </div>
                    </MetricTooltip>
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
        prevProps.spot.heroRole === nextProps.spot.heroRole &&
        prevProps.spot.pot === nextProps.spot.pot &&
        prevProps.spot.betSize === nextProps.spot.betSize &&
        prevProps.spot.bubbleFactor === nextProps.spot.bubbleFactor &&
        prevProps.spot.riskPremium === nextProps.spot.riskPremium &&
        prevProps.spot.chipEv === nextProps.spot.chipEv &&
        prevProps.spot.fgsProjection === nextProps.spot.fgsProjection &&
        prevProps.spot.isBaseline === nextProps.spot.isBaseline
    );
} );
