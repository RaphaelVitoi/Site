'use client';

/**
 * IDENTITY: GTO AI & CFR Laboratory
 * PATH: src/app/simulador/gto-cfr/page.tsx
 * ROLE: Laboratório SOTA demonstrando Regret Matching e Sizing Geométrico.
 * PRINCIPLE: Honestidade Intelectual & Densidade Máxima.
 */

import { ContentPageHeader } from '@/components/layout/ContentPageHeader';
import { SotaHubNavbar } from '@/components/simulator/SotaHubNavbar';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useEffect, useMemo, useState } from 'react';

type LabState = {
    currentPot: number;
    targetPot: number;
    streets: number;
    fold: number;
    call: number;
    raise: number;
};

const INITIAL_STATE: LabState = {
    currentPot: 10, targetPot: 100, streets: 3, fold: 10, call: 20, raise: -5
};

export default function GtoCfrLabPage() {
    const [history, setHistory] = useState<LabState[]>( [INITIAL_STATE] );
    const [historyIndex, setHistoryIndex] = useState( 0 );
    const [draft, setDraft] = useState<LabState>( INITIAL_STATE );

    // SOTA: Debounce Engine para Fricção Zero de Digitação vs Histórico Global
    useEffect( () => {
        const timer = setTimeout( () => {
            const currentCommitted = history[historyIndex];
            if ( JSON.stringify( draft ) !== JSON.stringify( currentCommitted ) ) {
                const newHistory = history.slice( 0, historyIndex + 1 );
                newHistory.push( draft );
                setHistory( newHistory );
                setHistoryIndex( newHistory.length - 1 );
            }
        }, 500 );
        return () => clearTimeout( timer );
    }, [draft, history, historyIndex] );

    const undo = () => { if ( historyIndex > 0 ) { setHistoryIndex( historyIndex - 1 ); setDraft( history[historyIndex - 1] ); } };
    const redo = () => { if ( historyIndex < history.length - 1 ) { setHistoryIndex( historyIndex + 1 ); setDraft( history[historyIndex + 1] ); } };
    const updateDraft = ( partial: Partial<LabState> ) => setDraft( prev => ( { ...prev, ...partial } ) );

    const geometricFraction = useMemo( () => {
        if ( draft.currentPot <= 0 || draft.targetPot <= draft.currentPot || draft.streets <= 0 ) return 0;
        const growthFactor = draft.targetPot / draft.currentPot;
        const base = Math.pow( growthFactor, 1 / draft.streets );
        return ( base - 1 ) / 2;
    }, [draft.currentPot, draft.targetPot, draft.streets] );

    const cfrStrategy = useMemo( () => {
        const pos = {
            fold: Math.max( 0, draft.fold ),
            call: Math.max( 0, draft.call ),
            raise: Math.max( 0, draft.raise )
        };
        const total = pos.fold + pos.call + pos.raise;
        if ( total > 0 ) {
            return { fold: pos.fold / total, call: pos.call / total, raise: pos.raise / total };
        }
        return { fold: 1 / 3, call: 1 / 3, raise: 1 / 3 };
    }, [draft.fold, draft.call, draft.raise] );

    return (
        <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
            <SotaHubNavbar />

            <ContentPageHeader
                title="Laboratório GTO AI"
                subtitle="Modelagem Matemática Pura: Sizing Geométrico (A*) e Regret Matching (CFR)."
                category="Simulação Avançada"
                icon="fa-brain"
            />

            <div className="sota-container space-y-16">
                {/* GLOBAL TOOLBAR: UNDO/REDO */ }
                <div className="flex items-center justify-between bg-bg-deep border border-white/5 p-4 rounded-2xl animate-sota-in">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent-indigo/10 flex items-center justify-center text-accent-indigo">
                            <i className="fa-solid fa-clock-rotate-left"></i>
                        </div>
                        <div>
                            <span className="block text-[0.65rem] font-bold text-text-muted uppercase tracking-widest">Máquina do Tempo SOTA</span>
                            <span className="block text-xs font-medium text-text-bright">Histórico Global Compartilhado</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={ undo } disabled={ historyIndex === 0 } className="w-10 h-10 flex items-center justify-center bg-black/40 border border-white/5 rounded-xl text-text-muted hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="Desfazer">
                            <i className="fa-solid fa-rotate-left"></i>
                        </button>
                        <button onClick={ redo } disabled={ historyIndex === history.length - 1 } className="w-10 h-10 flex items-center justify-center bg-black/40 border border-white/5 rounded-xl text-text-muted hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="Refazer">
                            <i className="fa-solid fa-rotate-right"></i>
                        </button>
                    </div>
                </div>

                {/* GEOMETRIC SIZING PANEL */ }
                <section>
                    <SectionHeader step="01" label="Heurística A*" title="Sizing Geométrico" description="A distribuição perfeita do risco ao longo das streets para atingir o All-in no River." />
                    <GlassPanel className="p-8 border-accent-indigo/20">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="currentPot" className="text-label text-text-muted">Pote Atual (BB)</label>
                                    <input id="currentPot" type="number" value={ draft.currentPot } onChange={ ( e ) => updateDraft( { currentPot: Number( e.target.value ) } ) } className="w-full bg-bg-deep border border-white/5 rounded-lg p-3 text-text-bright font-mono mt-2 focus:ring-1 focus:ring-accent-indigo outline-none" />
                                </div>
                                <div>
                                    <label htmlFor="targetPot" className="text-label text-text-muted">Pote Alvo / SPR Alvo (BB)</label>
                                    <input id="targetPot" type="number" value={ draft.targetPot } onChange={ ( e ) => updateDraft( { targetPot: Number( e.target.value ) } ) } className="w-full bg-bg-deep border border-white/5 rounded-lg p-3 text-text-bright font-mono mt-2 focus:ring-1 focus:ring-accent-indigo outline-none" />
                                </div>
                                <div>
                                    <label htmlFor="streets" className="text-label text-text-muted">Streets Restantes (N)</label>
                                    <input id="streets" type="number" min="1" max="3" value={ draft.streets } onChange={ ( e ) => updateDraft( { streets: Number( e.target.value ) } ) } className="w-full bg-bg-deep border border-white/5 rounded-lg p-3 text-text-bright font-mono mt-2 focus:ring-1 focus:ring-accent-indigo outline-none" />
                                </div>
                            </div>
                            <div className="flex flex-col justify-center items-center bg-black/40 border border-white/5 rounded-2xl p-8 shadow-inner">
                                <div className="text-accent-indigo text-sm font-black uppercase tracking-widest mb-4">Fração Constante (f)</div>
                                <div className="text-6xl font-black text-white font-mono drop-shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                                    { ( geometricFraction * 100 ).toFixed( 1 ) }%
                                </div>
                                <p className="text-text-muted text-sm mt-6 text-center leading-relaxed">
                                    Aposte <strong className="text-white">{ ( geometricFraction * 100 ).toFixed( 1 ) }%</strong> do pote em todas as { draft.streets } streets para inflacionar os { draft.currentPot }BBs iniciais até atingir exatamente { draft.targetPot }BBs.
                                </p>
                            </div>
                        </div>
                    </GlassPanel>
                </section>

                {/* CFR PANEL */ }
                <section>
                    <SectionHeader step="02" label="Equilíbrio de Nash" title="Regret Matching (CFR)" description="Como os Solvers convergem minimizando os arrependimentos de ações não tomadas." />
                    <GlassPanel className="p-8 border-accent-emerald/20">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="flex flex-col gap-6">
                                <div>
                                    <label htmlFor="regretFold" className="text-label text-text-muted">Arrependimento (Fold)</label>
                                    <input id="regretFold" type="number" value={ draft.fold } onChange={ ( e ) => updateDraft( { fold: Number( e.target.value ) } ) } className="w-full bg-bg-deep border border-white/5 rounded-lg p-3 text-text-bright font-mono mt-2 focus:ring-1 focus:ring-accent-emerald outline-none" />
                                </div>
                                <div>
                                    <label htmlFor="regretCall" className="text-label text-text-muted">Arrependimento (Call)</label>
                                    <input id="regretCall" type="number" value={ draft.call } onChange={ ( e ) => updateDraft( { call: Number( e.target.value ) } ) } className="w-full bg-bg-deep border border-white/5 rounded-lg p-3 text-text-bright font-mono mt-2 focus:ring-1 focus:ring-accent-emerald outline-none" />
                                </div>
                                <div>
                                    <label htmlFor="regretRaise" className="text-label text-text-muted">Arrependimento (Raise)</label>
                                    <input id="regretRaise" type="number" value={ draft.raise } onChange={ ( e ) => updateDraft( { raise: Number( e.target.value ) } ) } className="w-full bg-bg-deep border border-white/5 rounded-lg p-3 text-text-bright font-mono mt-2 focus:ring-1 focus:ring-accent-emerald outline-none" />
                                </div>
                            </div>
                            <div className="flex flex-col justify-center space-y-6 bg-black/40 border border-white/5 rounded-2xl p-8 shadow-inner">
                                <div className="text-accent-emerald text-sm font-black uppercase tracking-widest text-center mb-2">Estratégia Mista Resultante</div>

                                <div className="space-y-5">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1.5 font-mono font-bold"><span className="text-text-muted uppercase tracking-widest">Fold</span><span className="text-white">{ ( cfrStrategy.fold * 100 ).toFixed( 1 ) }%</span></div>
                                        <div className="h-2 bg-bg-deep rounded-full overflow-hidden"><div className="h-full bg-text-darker transition-all duration-500 ease-out" style={ { width: `${cfrStrategy.fold * 100}%` } }></div></div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs mb-1.5 font-mono font-bold"><span className="text-text-muted uppercase tracking-widest">Call</span><span className="text-white">{ ( cfrStrategy.call * 100 ).toFixed( 1 ) }%</span></div>
                                        <div className="h-2 bg-bg-deep rounded-full overflow-hidden"><div className="h-full bg-accent-emerald transition-all duration-500 ease-out shadow-[0_0_10px_rgba(52,211,153,0.5)]" style={ { width: `${cfrStrategy.call * 100}%` } }></div></div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs mb-1.5 font-mono font-bold"><span className="text-text-muted uppercase tracking-widest">Raise</span><span className="text-white">{ ( cfrStrategy.raise * 100 ).toFixed( 1 ) }%</span></div>
                                        <div className="h-2 bg-bg-deep rounded-full overflow-hidden"><div className="h-full bg-accent-rose transition-all duration-500 ease-out shadow-[0_0_10px_rgba(244,63,94,0.5)]" style={ { width: `${cfrStrategy.raise * 100}%` } }></div></div>
                                    </div>
                                </div>
                                <p className="text-text-muted text-[0.65rem] text-center mt-4 border-t border-white/5 pt-4">
                                    Arrependimentos negativos são ancorados em 0. As probabilidades convergem progressivamente para as ações que acumulam maior arrependimento positivo em iterações anteriores.
                                </p>
                            </div>
                        </div>
                    </GlassPanel>
                </section>
            </div>
        </div>
    );
}
