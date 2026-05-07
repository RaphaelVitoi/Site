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
        <div className="glass-panel flex flex-col gap-8 p-6 sm:p-8 lg:p-10 rounded-4xl bg-bg-panel/80 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden transition-all duration-300">
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent-emerald/5 blur-3xl rounded-full pointer-events-none" />

            <div className="flex justify-between items-center flex-wrap gap-4 pb-6 border-b border-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div>
                        <h4 className="text-[0.75rem] font-black text-accent-emerald uppercase tracking-[0.2em] m-0">Mapa Heurístico de Range</h4>
                        <p className="m-0 mt-1 text-[0.6rem] text-text-dim font-medium uppercase tracking-wider">Topologia de Colapso SOTA v4.2</p>
                    </div>
                    <div className="flex rounded-xl overflow-hidden border border-white/10 bg-black/40 p-1 shadow-inner">
                    { ( [ 'ip', 'oop' ] as Perspective[] ).map( ( p ) => {
                        const isActive = perspective === p;
                        const activeStyle = p === 'ip' ? 'bg-accent-indigo text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-accent-danger text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]';
                        const btnClass = isActive ? activeStyle : 'bg-transparent text-text-muted hover:text-white';
                        return (
                            <button
                                key={ p }
                                type="button"
                                onClick={ () => setPerspective( p ) }
                                className={ `px-4 py-1.5 text-[0.6rem] font-black uppercase tracking-widest cursor-pointer border-none transition-all rounded-lg ${ btnClass }` }
                            >
                                { p.toUpperCase() } · { ( p === 'ip' ? ipRp : oopRp ).toFixed( 1 ) }%
                            </button>
                        );
                    } ) }
                    </div>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="flex gap-3 text-[0.6rem] font-black text-text-muted uppercase tracking-widest flex-wrap bg-black/20 px-3 py-2 rounded-lg border border-white/5">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent-emerald" /> Core</span>
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent-amber" /> Misto</span>
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent-indigo-light" /> Float</span>
                        { activeRp >= 40 && ( <span className="flex items-center gap-1.5 text-accent-danger"><span className="w-2 h-2 rounded-full bg-accent-danger animate-pulse" /> Death</span> ) }
                    </div>
                    { Object.keys( overrides ).length > 0 && (
                        <button onClick={ resetOverrides } className="text-[0.6rem] font-black tracking-widest uppercase text-accent-danger hover:text-white bg-accent-danger/10 hover:bg-accent-danger/20 px-3 py-1.5 rounded-lg border border-accent-danger/20 transition-all"><i className="fa-solid fa-rotate-left mr-1" /> Reset</button>
                    ) }
                </div>
            </div>

            <div className="w-full overflow-x-auto scrollbar-hide flex justify-center py-2">
                <div className="min-w-0 max-w-full lg:max-w-2xl w-full grid grid-cols-13 gap-px bg-white/5 p-px rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
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
                                        className={ `aspect-square flex items-center justify-center text-[clamp(0.35rem,1.2vw,0.65rem)] font-bold font-mono transition-all cursor-pointer ${ bgClass } ${ overrides[ hand ] ? 'opacity-100 ring-2 ring-white/60 z-10 scale-110 shadow-lg' : 'opacity-85 hover:opacity-100 hover:scale-[1.05]' }` }
                                        onClick={ () => handleCellClick( hand, status ) }
                                        title={ `${ hand } - ${ status.toUpperCase() }` }
                                    >
                                        { hand }
                                    </button>
                                );
                            } ) }
                        </React.Fragment>
                    ) ) }
                </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-black/40 border border-white/5 rounded-2xl shadow-inner group hover:border-accent-indigo/20 transition-colors">
                <i className="fa-solid fa-circle-info text-accent-indigo text-sm mt-0.5" />
                <p className="text-[0.68rem] text-text-muted leading-relaxed m-0 font-medium">
                    <strong className="text-white uppercase tracking-widest text-[0.6rem] block mb-1">Guia Topológico</strong>
                    Este painel simula o colapso heurístico do range baseado no Risk Premium. Mãos em <strong className="text-accent-danger uppercase">Death</strong> representam a zona de insolvência mecânica onde o valuation do pote não suporta a pressão estrutural do ICM.
                </p>
            </div>
        </div>
    );
}
