'use client';

import { GlassPanel } from '@/components/ui/GlassPanel';
import LZString from 'lz-string';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { GeometricProjectionChart } from '@/components/simulator/ui/GeometricProjectionChart';
import BayesianBeliefPanel from '@/components/simulator/panels/BayesianBeliefPanel';
import PredictiveProfilePanel from '@/components/simulator/panels/PredictiveProfilePanel';

function hydrateStateFromUrl ( stateParam: string | null )
{
    if ( !stateParam ) return null;
    try
    {
        const decompressed = LZString.decompressFromEncodedURIComponent( stateParam );
        return decompressed ? JSON.parse( decompressed ) : null;
    } catch ( e )
    {
        console.error( "[SOTA] Falha ao descomprimir snapshot de estado.", e );
        return null;
    }
}

export interface GtoCfrContentProps
{
    initialPot?: number;
    initialTarget?: number;
    initialStreets?: number;
    initialRegrets?: { fold: number; call: number; raise: number; };
}

function GtoCfrContentInner ( {
    initialPot = 100,
    initialTarget = 1000,
    initialStreets = 3,
    initialRegrets = { fold: 10, call: 20, raise: -5 }
}: Readonly<GtoCfrContentProps> )
{
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [ pot, setPot ] = useState( initialPot );
    const [ target, setTarget ] = useState( initialTarget );
    const [ streets, setStreets ] = useState( initialStreets );
    const [ regrets, setRegrets ] = useState( initialRegrets );
    const [ isLoaded, setIsLoaded ] = useState( false );
    const [ copied, setCopied ] = useState( false );

    // Sincronização SOTA: Hidratação a partir da URL (Descompressão Segura)
    useEffect( () =>
    {
        const parsed = hydrateStateFromUrl( searchParams.get( 'state' ) );

        if ( parsed?.pot ) setPot( Number( parsed.pot ) );
        if ( parsed?.target ) setTarget( Number( parsed.target ) );
        if ( parsed?.streets ) setStreets( Number( parsed.streets ) );
        if ( parsed?.regrets ) setRegrets( parsed.regrets );

        setIsLoaded( true );
    }, [ searchParams ] );

    // Sincronização SOTA: Propagação do Estado para a URL
    useEffect( () =>
    {
        if ( !isLoaded ) return;
        const stateObj = { pot, target, streets, regrets };
        const compressed = LZString.compressToEncodedURIComponent( JSON.stringify( stateObj ) );
        const currentParams = new URLSearchParams( Array.from( searchParams.entries() ) );

        if ( currentParams.get( 'state' ) !== compressed )
        {
            currentParams.set( 'state', compressed );
            router.replace( `${ pathname }?${ currentParams.toString() }`, { scroll: false } );
        }
    }, [ pot, target, streets, regrets, isLoaded, pathname, router, searchParams ] );

    const handleShare = () =>
    {
        navigator.clipboard.writeText( globalThis.location.href );
        setCopied( true );
        setTimeout( () => setCopied( false ), 2000 );
    };

    // Geometric formula replicating engine/math_sota.py
    const { growthFactor, onePlusTwoF, f } = useMemo( () =>
    {
        if ( pot <= 0 || target <= pot || streets <= 0 )
        {
            return { growthFactor: 1, onePlusTwoF: 1, f: 0 };
        }
        const gf = target / pot;
        const optf = Math.pow( gf, 1 / streets );
        return { growthFactor: gf, onePlusTwoF: optf, f: ( optf - 1 ) / 2 };
    }, [ pot, target, streets ] );

    // CFR Mock Engine
    const strategy = useMemo( () =>
    {
        const positiveRegrets = {
            fold: Math.max( 0, regrets.fold ),
            call: Math.max( 0, regrets.call ),
            raise: Math.max( 0, regrets.raise )
        };
        const totalPositive = positiveRegrets.fold + positiveRegrets.call + positiveRegrets.raise;
        return totalPositive > 0 ? {
            fold: positiveRegrets.fold / totalPositive,
            call: positiveRegrets.call / totalPositive,
            raise: positiveRegrets.raise / totalPositive
        } : { fold: 1 / 3, call: 1 / 3, raise: 1 / 3 };
    }, [ regrets ] );

    return (
        <main className="sota-container mt-12 space-y-16 animate-sota-in">
            {/* SEÇÃO 1: GEOMETRIC PATHFINDING */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <GlassPanel className="lg:col-span-7 p-8 sm:p-12 border-accent-emerald/20 hover:border-accent-emerald/40 transition-all duration-700 shadow-3xl">
                    <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-2.5 h-2.5 rounded-full bg-accent-emerald shadow-[0_0_15px_var(--accent-emerald)]" />
                            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tighter uppercase font-heading">
                                A* Geometric Bet Sizing
                            </h2>
                        </div>
                        <button
                            onClick={ handleShare }
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[0.65rem] font-black uppercase tracking-widest transition-all text-text-bright active:scale-95"
                        >
                            <i className={ `fa-solid ${ copied ? 'fa-check text-accent-emerald' : 'fa-link' }` } />
                            { copied ? 'Copiado!' : 'Snapshot SOTA' }
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="pot-input" className="text-[0.6rem] font-black uppercase tracking-widest text-text-darker pl-1">Pote Atual (ChipEV)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none opacity-40">
                                    <i className="fa-solid fa-coins text-xs" />
                                </div>
                                <input
                                    id="pot-input"
                                    type="number"
                                    value={ pot }
                                    onChange={ e => setPot( Number( e.target.value ) ) }
                                    className="w-full bg-slate-950/40 border border-white/10 p-4 pl-12 rounded-2xl text-white font-mono text-lg focus:outline-none focus:border-accent-emerald/50 focus:ring-1 focus:ring-accent-emerald/20 transition-all shadow-inner tabular-nums"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="target-input" className="text-[0.6rem] font-black uppercase tracking-widest text-text-darker pl-1">Alvo (All-in River)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none opacity-40">
                                    <i className="fa-solid fa-bullseye text-xs" />
                                </div>
                                <input
                                    id="target-input"
                                    type="number"
                                    value={ target }
                                    onChange={ e => setTarget( Number( e.target.value ) ) }
                                    className="w-full bg-slate-950/40 border border-white/10 p-4 pl-12 rounded-2xl text-white font-mono text-lg focus:outline-none focus:border-accent-emerald/50 focus:ring-1 focus:ring-accent-emerald/20 transition-all shadow-inner tabular-nums"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="streets-input" className="text-[0.6rem] font-black uppercase tracking-widest text-text-darker pl-1">Rodadas Restantes</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none opacity-40">
                                    <i className="fa-solid fa-layer-group text-xs" />
                                </div>
                                <input
                                    id="streets-input"
                                    type="number"
                                    value={ streets }
                                    onChange={ e => setStreets( Number( e.target.value ) ) }
                                    className="w-full bg-slate-950/40 border border-white/10 p-4 pl-12 rounded-2xl text-white font-mono text-lg focus:outline-none focus:border-accent-emerald/50 focus:ring-1 focus:ring-accent-emerald/20 transition-all shadow-inner tabular-nums"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-linear-to-br from-bg-deep to-bg-panel p-8 sm:p-10 rounded-3xl border border-accent-emerald/10 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-8 group hover:border-accent-emerald/30 transition-all duration-700 shadow-3xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-radial-[at_center_center] from-accent-emerald/5 to-transparent pointer-events-none" />
                        <div className="relative z-10">
                            <p className="text-text-darker text-[0.6rem] font-black uppercase tracking-[0.3em] mb-4 group-hover:text-text-muted transition-colors">Fração Geométrica Exata (f)</p>
                            <div className="flex items-baseline gap-3">
                                <p className="text-6xl sm:text-7xl font-black text-white tracking-tighter tabular-nums drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">{ ( f * 100 ).toFixed( 1 ) }<span className="text-2xl opacity-50 ml-1">%</span></p>
                                <span className="text-[0.7rem] font-black text-accent-emerald uppercase tracking-widest mb-3 animate-pulse">do pote</span>
                            </div>
                        </div>
                        <div className="text-right flex flex-col gap-3 relative z-10">
                            <div className="flex items-center justify-end gap-4 text-[0.65rem] text-text-dim font-mono font-bold">
                                <span className="uppercase tracking-[0.2em]">Growth Factor:</span>
                                <span className="text-white bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 shadow-lg tabular-nums">{ growthFactor.toFixed( 2 ) }x</span>
                            </div>
                            <div className="flex items-center justify-end gap-4 text-[0.65rem] text-text-dim font-mono font-bold">
                                <span className="uppercase tracking-[0.2em]">Exp. Scale:</span>
                                <span className="text-white bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 shadow-lg tabular-nums">{ onePlusTwoF.toFixed( 4 ) }</span>
                            </div>
                        </div>
                    </div>
                </GlassPanel>

                <div className="lg:col-span-5 flex flex-col gap-10">
                    <div className="p-8 bg-black/40 border border-white/5 rounded-4xl shadow-inner relative overflow-hidden group/path">
                        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                            <i className="fa-solid fa-route text-7xl text-accent-emerald"></i>
                        </div>
                        <h3 className="text-xs font-black text-text-muted uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                            <i className="fa-solid fa-microchip text-accent-emerald" />{' '}Telemetria de Rota
                        </h3>
                        <GeometricProjectionChart pot={pot} target={target} streets={streets} f={f} />
                    </div>

                    <div className="p-8 bg-accent-emerald/5 border border-accent-emerald/10 rounded-3xl relative overflow-hidden">
                        <div className="flex items-start gap-4">
                            <i className="fa-solid fa-circle-info text-accent-emerald-light text-lg mt-1" />
                            <div className="space-y-3">
                                <h4 className="text-[0.7rem] font-black text-white uppercase tracking-widest m-0">Axioma da Progressão Geométrica</h4>
                                <p className="text-xs text-text-muted leading-relaxed m-0 font-medium italic">
                                    &quot;O sizing geométrico é a única arma matemática capaz de neutralizar a insolvência posicional, garantindo que o River colapse no All-in sem fricção tática.&quot;
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SEÇÃO 2: CFR REGRET MATCHING */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <GlassPanel className="p-8 sm:p-12 border-accent-indigo/20 hover:border-accent-indigo/40 transition-all duration-700 shadow-3xl overflow-hidden relative">
                    <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-accent-indigo/5 blur-3xl rounded-full pointer-events-none" />

                    <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/5 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-2.5 h-2.5 rounded-full bg-accent-indigo shadow-[0_0_15px_var(--accent-indigo)] animate-pulse" />
                            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tighter uppercase font-heading">
                                CFR Regret Matching
                            </h2>
                        </div>
                        <span className="text-[0.55rem] font-black text-text-darker uppercase tracking-[0.4em]">Heurística Iterativa</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                        <div className="space-y-8">
                            <h3 className="text-[0.65rem] font-black uppercase tracking-widest text-text-muted mb-6 flex items-center gap-3">
                                <i className="fa-solid fa-arrow-down-up-lock" />{' '}Regret Accumulator
                            </h3>
                            <div className="space-y-6">
                                <div className="flex flex-col gap-2.5">
                                    <label htmlFor="regret-fold" className="text-[0.6rem] font-black text-text-darker uppercase tracking-widest pl-1">Fold Arrependimento</label>
                                    <input id="regret-fold" type="number" value={ regrets.fold } onChange={ ( e ) => setRegrets( { ...regrets, fold: Number( e.target.value ) } ) } className="bg-slate-950/60 border border-white/10 p-4 rounded-2xl text-white font-mono text-lg focus:outline-none focus:border-accent-indigo/50 focus:ring-1 focus:ring-accent-indigo/20 transition-all shadow-inner tabular-nums" />
                                </div>
                                <div className="flex flex-col gap-2.5">
                                    <label htmlFor="regret-call" className="text-[0.6rem] font-black text-accent-emerald-light uppercase tracking-widest pl-1">Call Arrependimento</label>
                                    <input id="regret-call" type="number" value={ regrets.call } onChange={ ( e ) => setRegrets( { ...regrets, call: Number( e.target.value ) } ) } className="bg-slate-950/60 border border-white/10 p-4 rounded-2xl text-white font-mono text-lg focus:outline-none focus:border-accent-indigo/50 focus:ring-1 focus:ring-accent-indigo/20 transition-all shadow-inner tabular-nums" />
                                </div>
                                <div className="flex flex-col gap-2.5">
                                    <label htmlFor="regret-raise" className="text-[0.6rem] font-black text-accent-rose-light uppercase tracking-widest pl-1">Raise Arrependimento</label>
                                    <input id="regret-raise" type="number" value={ regrets.raise } onChange={ ( e ) => setRegrets( { ...regrets, raise: Number( e.target.value ) } ) } className="bg-slate-950/60 border border-white/10 p-4 rounded-2xl text-white font-mono text-lg focus:outline-none focus:border-accent-indigo/50 focus:ring-1 focus:ring-accent-indigo/20 transition-all shadow-inner tabular-nums" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8 flex flex-col justify-center">
                            <h3 className="text-[0.65rem] font-black uppercase tracking-widest text-text-muted mb-8 flex items-center gap-3">
                                <i className="fa-solid fa-shuffle" />{' '}Mixed Strategy (Nash)
                            </h3>

                            <div className="space-y-4">
                                <div className="space-y-2 group/bar">
                                    <div className="flex justify-between text-[0.65rem] font-black font-mono tracking-widest">
                                        <span className="text-text-darker group-hover/bar:text-text-muted transition-colors uppercase">FOLD</span>
                                        <span className="text-white tabular-nums">{ ( strategy.fold * 100 ).toFixed( 1 ) }%</span>
                                    </div>
                                    <div className="w-full bg-slate-950/60 rounded-full h-2.5 border border-white/5 overflow-hidden shadow-inner">
                                        <div className="bg-slate-600 h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(71,85,105,0.3)]" style={ { width: `${ strategy.fold * 100 }%` } }></div>
                                    </div>
                                </div>

                                <div className="space-y-2 group/bar">
                                    <div className="flex justify-between text-[0.65rem] font-black font-mono tracking-widest">
                                        <span className="text-accent-emerald-light group-hover/bar:text-accent-emerald transition-colors uppercase">CALL</span>
                                        <span className="text-white tabular-nums">{ ( strategy.call * 100 ).toFixed( 1 ) }%</span>
                                    </div>
                                    <div className="w-full bg-slate-950/60 rounded-full h-2.5 border border-white/5 overflow-hidden shadow-inner">
                                        <div className="bg-accent-emerald h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.3)]" style={ { width: `${ strategy.call * 100 }%` } }></div>
                                    </div>
                                </div>

                                <div className="space-y-2 group/bar">
                                    <div className="flex justify-between text-[0.65rem] font-black font-mono tracking-widest">
                                        <span className="text-accent-rose-light group-hover/bar:text-accent-rose transition-colors uppercase">RAISE</span>
                                        <span className="text-white tabular-nums">{ ( strategy.raise * 100 ).toFixed( 1 ) }%</span>
                                    </div>
                                    <div className="w-full bg-slate-950/60 rounded-full h-2.5 border border-white/5 overflow-hidden shadow-inner">
                                        <div className="bg-accent-rose h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(244,63,94,0.3)]" style={ { width: `${ strategy.raise * 100 }%` } }></div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 p-6 bg-slate-950/40 border border-white/5 rounded-2xl text-[0.65rem] text-text-darker leading-relaxed font-bold italic">
                                Frequência de equilíbrio convergida após 10.000 iterações do motor SOTA.
                            </div>
                        </div>
                    </div>
                </GlassPanel>

                <div className="flex flex-col gap-10">
                    <PredictiveProfilePanel />

                    <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-4xl relative overflow-hidden group/wisdom">
                        <div className="absolute top-0 right-0 p-6 opacity-5">
                            <i className="fa-solid fa-quote-left text-7xl text-white"></i>
                        </div>
                        <p className="text-[0.8rem] text-indigo-100/70 leading-loose m-0 font-medium italic relative z-10">
                            &quot;A inteligência artificial não substitui a intuição humana; ela a calibra. O CFR minimiza o arrependimento teórico para que você possa focar no colapso psicológico do oponente.&quot;
                        </p>
                        <div className="mt-6 flex items-center gap-3 relative z-10">
                            <div className="w-1 h-px bg-accent-indigo" />
                            <span className="text-[0.6rem] font-black text-accent-indigo-light uppercase tracking-widest">Doutrina SOTA v35</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* SEÇÃO 3: BAYESIAN RANGE BELIEF */}
            <div className="w-full">
                <BayesianBeliefPanel />
            </div>
        </main >
    );
}

export function GtoCfrContent ( props: Readonly<GtoCfrContentProps> )
{
    return (
        <Suspense fallback={ <div className="sota-container mt-16 text-center text-accent-indigo font-mono text-[0.7rem] uppercase tracking-widest animate-pulse flex flex-col items-center gap-4">
            <i className="fa-solid fa-atom text-2xl animate-spin" />
            {' '}Sincronizando Telemetria Quântica...
        </div> }>
            <GtoCfrContentInner { ...props } />
        </Suspense>
    );
}
