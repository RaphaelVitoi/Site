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
import { useMemo, useState } from 'react';

export default function GtoCfrLabPage() {
    // --- Geometric Sizing State ---
    const [currentPot, setCurrentPot] = useState<number>( 10 );
    const [targetPot, setTargetPot] = useState<number>( 100 );
    const [streets, setStreets] = useState<number>( 3 );

    const geometricFraction = useMemo( () => {
        if ( currentPot <= 0 || targetPot <= currentPot || streets <= 0 ) return 0;
        const growthFactor = targetPot / currentPot;
        const base = Math.pow( growthFactor, 1 / streets );
        return ( base - 1 ) / 2;
    }, [currentPot, targetPot, streets] );

    // --- CFR Regret State ---
    const [regretHistory, setRegretHistory] = useState( [{ fold: 10, call: 20, raise: -5 }] );
    const [historyIndex, setHistoryIndex] = useState( 0 );
    const regrets = regretHistory[historyIndex];

    const updateRegrets = ( newRegrets: { fold: number, call: number, raise: number } ) => {
        const newHistory = regretHistory.slice( 0, historyIndex + 1 );
        newHistory.push( newRegrets );
        setRegretHistory( newHistory );
        setHistoryIndex( newHistory.length - 1 );
    };

    const undoRegret = () => { if ( historyIndex > 0 ) setHistoryIndex( historyIndex - 1 ); };
    const redoRegret = () => { if ( historyIndex < regretHistory.length - 1 ) setHistoryIndex( historyIndex + 1 ); };

    const cfrStrategy = useMemo( () => {
        const pos = {
            fold: Math.max( 0, regrets.fold ),
            call: Math.max( 0, regrets.call ),
            raise: Math.max( 0, regrets.raise )
        };
        const total = pos.fold + pos.call + pos.raise;
        if ( total > 0 ) {
            return { fold: pos.fold / total, call: pos.call / total, raise: pos.raise / total };
        }
        return { fold: 1 / 3, call: 1 / 3, raise: 1 / 3 };
    }, [regrets] );

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
                {/* GEOMETRIC SIZING PANEL */ }
                <section>
                    <SectionHeader step="01" label="Heurística A*" title="Sizing Geométrico" description="A distribuição perfeita do risco ao longo das streets para atingir o All-in no River." />
                    <GlassPanel className="p-8 border-accent-indigo/20">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="currentPot" className="text-label text-text-muted">Pote Atual (BB)</label>
                                    <input id="currentPot" type="number" value={ currentPot } onChange={ ( e ) => setCurrentPot( Number( e.target.value ) ) } className="w-full bg-bg-deep border border-white/5 rounded-lg p-3 text-text-bright font-mono mt-2 focus:ring-1 focus:ring-accent-indigo outline-none" />
                                </div>
                                <div>
                                    <label htmlFor="targetPot" className="text-label text-text-muted">Pote Alvo / SPR Alvo (BB)</label>
                                    <input id="targetPot" type="number" value={ targetPot } onChange={ ( e ) => setTargetPot( Number( e.target.value ) ) } className="w-full bg-bg-deep border border-white/5 rounded-lg p-3 text-text-bright font-mono mt-2 focus:ring-1 focus:ring-accent-indigo outline-none" />
                                </div>
                                <div>
                                    <label htmlFor="streets" className="text-label text-text-muted">Streets Restantes (N)</label>
                                    <input id="streets" type="number" min="1" max="3" value={ streets } onChange={ ( e ) => setStreets( Number( e.target.value ) ) } className="w-full bg-bg-deep border border-white/5 rounded-lg p-3 text-text-bright font-mono mt-2 focus:ring-1 focus:ring-accent-indigo outline-none" />
                                </div>
                            </div>
                            <div className="flex flex-col justify-center items-center bg-black/40 border border-white/5 rounded-2xl p-8 shadow-inner">
                                <div className="text-accent-indigo text-sm font-black uppercase tracking-widest mb-4">Fração Constante (f)</div>
                                <div className="text-6xl font-black text-white font-mono drop-shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                                    { ( geometricFraction * 100 ).toFixed( 1 ) }%
                                </div>
                                <p className="text-text-muted text-sm mt-6 text-center leading-relaxed">
                                    Aposte <strong className="text-white">{ ( geometricFraction * 100 ).toFixed( 1 ) }%</strong> do pote em todas as { streets } streets para inflacionar os { currentPot }BBs iniciais até atingir exatamente { targetPot }BBs.
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
                                {/* TOOLBAR: UNDO/REDO */ }
                                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                    <span className="text-[0.65rem] font-bold text-text-muted uppercase tracking-widest">Histórico de Máquina</span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={ undoRegret } disabled={ historyIndex === 0 } className="w-8 h-8 flex items-center justify-center bg-bg-deep border border-white/5 rounded-lg text-text-muted hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="Desfazer">
                                            <i className="fa-solid fa-rotate-left"></i>
                                        </button>
                                        <button onClick={ redoRegret } disabled={ historyIndex === regretHistory.length - 1 } className="w-8 h-8 flex items-center justify-center bg-bg-deep border border-white/5 rounded-lg text-text-muted hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all" title="Refazer">
                                            <i className="fa-solid fa-rotate-right"></i>
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="regretFold" className="text-label text-text-muted">Arrependimento (Fold)</label>
                                    <input id="regretFold" type="number" value={ regrets.fold } onChange={ ( e ) => updateRegrets( { ...regrets, fold: Number( e.target.value ) } ) } className="w-full bg-bg-deep border border-white/5 rounded-lg p-3 text-text-bright font-mono mt-2 focus:ring-1 focus:ring-accent-emerald outline-none" />
                                </div>
                                <div>
                                    <label htmlFor="regretCall" className="text-label text-text-muted">Arrependimento (Call)</label>
                                    <input id="regretCall" type="number" value={ regrets.call } onChange={ ( e ) => updateRegrets( { ...regrets, call: Number( e.target.value ) } ) } className="w-full bg-bg-deep border border-white/5 rounded-lg p-3 text-text-bright font-mono mt-2 focus:ring-1 focus:ring-accent-emerald outline-none" />
                                </div>
                                <div>
                                    <label htmlFor="regretRaise" className="text-label text-text-muted">Arrependimento (Raise)</label>
                                    <input id="regretRaise" type="number" value={ regrets.raise } onChange={ ( e ) => updateRegrets( { ...regrets, raise: Number( e.target.value ) } ) } className="w-full bg-bg-deep border border-white/5 rounded-lg p-3 text-text-bright font-mono mt-2 focus:ring-1 focus:ring-accent-emerald outline-none" />
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
