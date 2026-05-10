'use client';

/**
 * IDENTITY: Matriz de Ranges 13x13 (Visual Grid) v4.2
 * PATH: src/components/simulator/panels/RangeMatrix.tsx
 * ROLE: Visualizar um mapa heuristico de colapso e expansao do range baseado no Risk Premium (IP/OOP).
 * BINDING: [panels/TheoryPanel.tsx, components/simulator/engine/utils.ts]
 */

import React, { useEffect, useState } from 'react';
import { getHandStatus, getStatusBgClass } from '@/components/simulator/engine/utils';

const RANKS = [ 'A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2' ];
const STATUS_CYCLE = [ 'fold', 'core', 'marginal', 'bluff', 'death' ];

interface RangeMatrixProps {
    ipRp: number;
    oopRp: number;
    scenarioId: string;
}

type Perspective = 'ip' | 'oop';

export default function RangeMatrix ( { ipRp, oopRp, scenarioId }: Readonly<RangeMatrixProps> )
{
    const [ overrides, setOverrides ] = useState<Record<string, string>>( {} );
    const [ perspective, setPerspective ] = useState<Perspective>( 'ip' );

    useEffect( () =>
    {
        try {
            const storageKey = `rangeMatrixOverrides_${ scenarioId }`;
            const saved = localStorage.getItem( storageKey );
            setOverrides( saved ? JSON.parse( saved ) : {} );
        } catch ( error: unknown ) {
            console.warn( '[CORTEX SHIELD] Falha ao restaurar overrides do localStorage:', error );
            setOverrides( {} );
        }
    }, [ scenarioId ] );

    const handleCellClick = ( hand: string, currentStatus: string ) =>
    {
        const currentIndex = STATUS_CYCLE.indexOf( currentStatus );
        const nextStatus = STATUS_CYCLE[ ( currentIndex + 1 ) % STATUS_CYCLE.length ];

        setOverrides( ( prev ) => {
            const nextOverrides = { ...prev, [ hand ]: nextStatus };
            try {
                localStorage.setItem( `rangeMatrixOverrides_${ scenarioId }`, JSON.stringify( nextOverrides ) );
            } catch ( error: unknown ) {
                console.error( '[CORTEX SHIELD] Persistence failure:', error );
            }
            return nextOverrides;
        } );
    };

    const resetOverrides = () => {
        setOverrides( {} );
        localStorage.removeItem( `rangeMatrixOverrides_${ scenarioId }` );
    };

    const activeRp = perspective === 'ip' ? ipRp : oopRp;

    return (
        <div className="glass-panel flex flex-col gap-10 p-6 sm:p-8 lg:p-12 rounded-4xl bg-bg-panel/80 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden transition-all duration-300">
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent-emerald/5 blur-3xl rounded-full pointer-events-none" />

            <div className="flex justify-between items-center flex-wrap gap-8 pb-8 border-b border-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    <div>
                        <h4 className="text-[0.75rem] font-black text-accent-emerald uppercase tracking-[0.2em] m-0 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-accent-emerald shadow-[0_0_10px_var(--accent-emerald)]" />
                            Mapa Heurístico de Range
                        </h4>
                        <p className="m-0 mt-2 text-[0.65rem] text-text-dim font-medium uppercase tracking-wider">Topologia de Colapso SOTA v4.2</p>
                    </div>
                    <div className="flex rounded-2xl overflow-hidden border border-white/10 bg-black/40 p-1.5 shadow-inner">
                    { ( [ 'ip', 'oop' ] as Perspective[] ).map( ( p ) => {
                        const isActive = perspective === p;
                        const activeStyle = p === 'ip' ? 'bg-slate-900/80 text-accent-indigo-light shadow-2xl border border-accent-indigo/30' : 'bg-slate-900/80 text-accent-rose shadow-2xl border border-accent-rose/30';
                        const btnClass = isActive ? activeStyle : 'bg-transparent text-text-darker hover:text-text-muted';
                        return (
                            <button
                                key={ p }
                                type="button"
                                onClick={ () => setPerspective( p ) }
                                className={ `px-6 py-2.5 text-[0.65rem] font-black uppercase tracking-[0.2em] cursor-pointer transition-all duration-500 rounded-xl ${ btnClass }` }
                            >
                                { p.toUpperCase() } &middot; { ( p === 'ip' ? ipRp : oopRp ).toFixed( 1 ) }%
                            </button>
                        );
                    } ) }
                    </div>
                </div>

                <div className="flex gap-6 items-center flex-wrap">
                    <div className="flex gap-5 text-[0.6rem] font-black text-text-muted uppercase tracking-[0.2em] bg-black/40 px-5 py-3 rounded-2xl border border-white/5 shadow-inner">
                        <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent-emerald shadow-[0_0_8px_var(--accent-emerald)]" /> Core</span>
                        <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent-amber shadow-[0_0_8px_var(--accent-amber)]" /> Misto</span>
                        <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent-indigo-light shadow-[0_0_8px_var(--accent-indigo-light)]" /> Float</span>
                        { activeRp >= 40 && ( <span className="flex items-center gap-2 text-accent-danger"><div className="w-1.5 h-1.5 rounded-full bg-accent-danger shadow-[0_0_8px_var(--accent-danger)] animate-pulse" /> Death</span> ) }
                    </div>
                    { Object.keys( overrides ).length > 0 && (
                        <button onClick={ resetOverrides } className="text-[0.65rem] font-black tracking-widest uppercase text-accent-danger hover:text-white bg-accent-danger/5 hover:bg-accent-danger/10 px-5 py-3 rounded-2xl border border-accent-danger/20 transition-all active:scale-95"><i className="fa-solid fa-rotate-left mr-2" /> Reset Matrix</button>
                    ) }
                </div>
            </div>

            <div className="w-full flex justify-center py-10 overflow-x-auto scrollbar-hide relative group/matrix">
                <div className="absolute inset-0 bg-radial-[at_center_center] from-emerald-500/5 to-transparent pointer-events-none opacity-0 group-hover/matrix:opacity-100 transition-opacity duration-1000" />
                <div className="min-w-150 max-w-2xl w-full grid grid-cols-13 gap-[2px] bg-slate-950/80 p-3 rounded-[2rem] border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-3xl transform transition-transform duration-700 relative z-10">
                    { RANKS.map( ( r1, i ) => (
                        <React.Fragment key={ `row-${ r1 }` }>
                            { RANKS.map( ( r2, j ) => {
                                const isPair = i === j;
                                const isSuited = j > i;

                                let hand = `${ r1 }${ r2 }`;
                                if ( !isPair ) {
                                    hand = isSuited ? `${ r1 }${ r2 }s` : `${ r2 }${ r1 }o`;
                                }
                                const status = getHandStatus( i, j, hand, activeRp, overrides );
                                const bgClass = getStatusBgClass( status );

                                return (
                                    <button
                                        type="button"
                                        key={ hand }
                                        className={ `relative overflow-hidden aspect-square flex items-center justify-center text-[0.6rem] lg:text-[0.65rem] font-black font-mono transition-all duration-300 cursor-pointer rounded-[4px] ${ bgClass } ${ overrides[ hand ] ? 'z-30 scale-125 shadow-[0_0_25px_rgba(255,255,255,0.4)] border border-white/60 ring-2 ring-white/30' : 'opacity-90 hover:opacity-100 hover:scale-[1.15] hover:z-20 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] border border-white/5' }` }
                                        onClick={ () => handleCellClick( hand, status ) }
                                        title={ `${ hand } - ${ status.toUpperCase() }` }
                                    >
                                        <div className="absolute inset-0 bg-linear-to-b from-white/20 to-transparent opacity-20 pointer-events-none" />
                                        <span className={`relative z-10 drop-shadow-md transition-colors ${status === 'fold' ? 'text-white/20 hover:text-white/50' : 'text-white/80 hover:text-white'}`}>{ hand }</span>
                                    </button>
                                );
                            } ) }
                        </React.Fragment>
                    ) ) }
                </div>
            </div>

            <div className="flex items-start gap-6 p-8 bg-black/40 border border-white/5 rounded-3xl shadow-inner group/guide hover:border-accent-indigo/20 transition-all duration-500">
                <div className="w-10 h-10 rounded-2xl bg-accent-indigo/10 border border-accent-indigo/20 flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-circle-info text-accent-indigo text-lg" />
                </div>
                <div className="flex flex-col gap-2">
                    <h5 className="text-white uppercase tracking-[0.3em] text-[0.65rem] font-black m-0 group-hover/guide:text-accent-indigo-light transition-colors">Guia Topológico de Colapso</h5>
                    <p className="text-[0.75rem] text-text-muted leading-relaxed m-0 font-medium">
                        Este painel simula o colapso heurístico do range sob pressão ICM. Mãos em <strong className="text-accent-danger uppercase tracking-tighter">Death</strong> representam a zona de insolvência mecânica onde o valuation do pote não suporta a pressão estrutural do motor de simulação.
                    </p>
                </div>
            </div>
        </div>
    );
}
