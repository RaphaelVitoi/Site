'use client';

/**
 * IDENTITY: Matriz de Ranges 13x13 (Visual Grid) v4.2
 * PATH: src/components/simulator/panels/RangeMatrix.tsx
 * ROLE: Visualizar o colapso e expansão do range baseado no Risk Premium (IP/OOP).
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
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center flex-wrap gap-3 pb-3 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <h4 className="text-[0.65rem] font-black text-accent-emerald uppercase tracking-widest m-0">Colapso do Range</h4>
                    <div className="flex rounded-md overflow-hidden border border-white/10 bg-bg-deep p-0.5">
                    { ( [ 'ip', 'oop' ] as Perspective[] ).map( ( p ) => {
                        const isActive = perspective === p;
                        const activeStyle = p === 'ip' ? 'bg-accent-indigo/20 text-accent-indigo-light shadow-inner' : 'bg-accent-danger/20 text-accent-pink shadow-inner';
                        const btnClass = isActive ? activeStyle : 'bg-transparent text-text-muted hover:text-white';
                        return (
                            <button
                                key={ p }
                                type="button"
                                onClick={ () => setPerspective( p ) }
                                className={ `px-3 py-1 text-[0.6rem] font-black uppercase tracking-widest cursor-pointer border-none transition-all rounded-sm ${ btnClass }` }
                            >
                                { p.toUpperCase() } · { ( p === 'ip' ? ipRp : oopRp ).toFixed( 1 ) }%
                            </button>
                        );
                    } ) }
                    </div>
                    { Object.keys( overrides ).length > 0 && (
                        <button onClick={ resetOverrides } className="text-[0.6rem] font-black tracking-widest uppercase text-text-muted hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition-colors"><i className="fa-solid fa-rotate-left mr-1" /> Reset</button>
                    ) }
                </div>

                <div className="flex gap-3 text-[0.6rem] font-black text-text-muted uppercase tracking-widest flex-wrap">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-accent-emerald border border-emerald-400"></span> Core</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-accent-amber border border-amber-400"></span> Misto</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-accent-indigo-light border border-indigo-400"></span> Float</span>
                    { activeRp >= 40 && ( <span className="flex items-center gap-1.5 text-accent-danger"><span className="w-2.5 h-2.5 rounded-sm bg-accent-danger border border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.5)]"></span> Death</span> ) }
                </div>
            </div>

            <div className="w-full overflow-x-auto scrollbar-hide pb-2 flex justify-center">
                <div className="min-w-75 max-w-2xl w-full grid grid-cols-13 gap-px bg-white/5 p-px rounded-lg overflow-hidden border border-white/10 shadow-xl">
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
                                        className={ `aspect-square flex items-center justify-center text-[clamp(0.4rem,0.8vw,0.7rem)] font-bold font-mono transition-all cursor-pointer ${ bgClass } ${ overrides[ hand ] ? 'opacity-100 ring-1 ring-white/50 z-10 scale-105' : 'opacity-90 hover:opacity-100' }` }
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

            <div className="flex items-start gap-2 mt-2 p-3 bg-accent-indigo/5 border border-accent-indigo/10 rounded-lg">
                <i className="fa-solid fa-circle-info text-accent-indigo mt-0.5 text-xs" />
                <p className="text-[0.65rem] text-text-light leading-relaxed m-0 font-medium">A matriz reage ao Risk Premium. Células em <strong className="text-accent-danger uppercase">Death</strong> representam mãos que colapsam sob tensão.</p>
            </div>
        </div>
    );
}
