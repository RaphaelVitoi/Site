'use client';

import React, { useState, useMemo } from 'react';
import styles from './masterpiece.module.css';

// === ONTOLOGIA SOTA V4.1 (FRICÇÃO ZERO) ===
// Este artefato legado foi transmutado de um Monólito V3 para o Orquestrador SOTA Supremo.
// A matemática falsa (heurística linear) e o DATABASE acoplado foram obliterados.
// Toda a renderização visual hermética ocorre nos painéis injetados abaixo.

import ScenarioStage from '@/components/simulator/panels/ScenarioStage';
import TheoryPanel from '@/components/simulator/panels/TheoryPanel';
import PerspectivePanel from '@/components/simulator/panels/PerspectivePanel';
import ComparisonRadar from '@/components/simulator/panels/ComparisonRadar';
import PmLensPanel from '@/components/simulator/panels/PmLensPanel';

import type { Scenario } from '@/components/simulator/engine/types';

interface RiskGeometryMasterclassProps {
    readonly scenarios?: Scenario[];
}

export default function RiskGeometryMasterclass ( { scenarios = [] }: RiskGeometryMasterclassProps ) {
    const [ currentId, setCurrentId ] = useState<string>( scenarios[ 0 ]?.id || '' );

    const activeScenario = useMemo( () =>
        scenarios.find( s => s.id === currentId ) || scenarios[ 0 ],
        [ currentId, scenarios ] );

    if ( !activeScenario )
    {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 font-mono text-fuchsia-500">
                <i className="fa-solid fa-circle-notch fa-spin mr-3"></i> Inicializando Motor Quântico V4.1...
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 pt-10 font-sans bg-slate-950 text-slate-200 selection:bg-fuchsia-500/30">
            <div className={ `${styles.tickerWrap} fixed top-0 left-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5` }>
                <div className={ styles.ticker }>
                    <span className="mx-8"><i className="fa-solid fa-bolt text-fuchsia-500 mr-2"></i> A responsabilidade na FT é realizar a Perspectiva Matemática.</span>
                    <span className="mx-8"><i className="fa-solid fa-bolt text-fuchsia-500 mr-2"></i> A diferença de RP entre jogadores é a sua Vantagem de Risco Sistêmica.</span>
                    <span className="mx-8"><i className="fa-solid fa-bolt text-fuchsia-500 mr-2"></i> O pós-flop no ICM foca-se na diluição elástica do SPR e da Dívida RIO.</span>
                </div>
            </div>

            <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-8 mt-16 px-4 md:px-8">
                <header className="text-center pt-4 mb-4 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 mb-4">
                        <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse"></div>
                        <span className="text-[10px] font-black text-fuchsia-300 uppercase tracking-widest">Motor SOTA V4.1 Ativo</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-3">
                        A Geometria do <span className="text-transparent bg-clip-text bg-linear-to-r from-rose-400 to-fuchsia-500 drop-shadow-md">Risco</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.3em]">MasterSimulator Orchestrator</p>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                    {/* COLUNA ESQUERDA: Navegação e PM Lens */ }
                    <aside className="xl:col-span-3 flex flex-col gap-6">
                        <div className="glass-panel p-6 border border-white/5 rounded-2xl bg-slate-900/50 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Matrizes Clínicas</h2>
                                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded font-bold">{ scenarios.length } Cenários</span>
                            </div>
                            <div className="space-y-3 overflow-y-auto pr-2 max-h-[400px] custom-scrollbar">
                                { scenarios.map( sc => {
                                    const isActive = sc.id === currentId;
                                    return (
                                        <button key={ sc.id } onClick={ () => setCurrentId( sc.id ) } className={ `w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all duration-300 border ${isActive ? 'bg-fuchsia-500/10 border-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.1)]' : 'bg-transparent border-transparent hover:bg-white/5'}` }>
                                            <div className="flex flex-col">
                                                <span className={ `text-[9px] font-bold uppercase tracking-widest ${isActive ? 'text-fuchsia-400' : 'text-slate-500'}` }>{ sc.narrativeSubtitle }</span>
                                                <span className={ `text-xs font-bold ${isActive ? 'text-white' : 'text-slate-400'}` }>{ sc.name }</span>
                                            </div>
                                        </button>
                                    );
                                } ) }
                            </div>
                        </div>

                        <PmLensPanel />
                    </aside>

                    {/* PALCO CENTRAL: Orquestração SOTA */ }
                    <main className="xl:col-span-9 flex flex-col gap-6">
                        <ScenarioStage scenario={ activeScenario } />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ComparisonRadar scenarios={ scenarios } currentId={ currentId } />
                            <PerspectivePanel />
                        </div>

                        <TheoryPanel scenario={ activeScenario } />
                    </main>
                </div>
            </div>
            );
    }
