'use client';

/**
 * IDENTITY: Matriz de Ranges 13x13 (Visual Grid)
 * PATH: src/components/simulator/panels/RangeMatrix.tsx
 * ROLE: Visualizar o colapso e expansão do range baseado no Risk Premium (IP/OOP).
 * BINDING: [panels/TheoryPanel.tsx]
 */

import React, { useEffect, useState } from 'react';

const RANKS = [ 'A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2' ];
const STATUS_CYCLE = [ 'fold', 'core', 'marginal', 'bluff', 'death' ];

interface RangeMatrixProps
{
    ipRp: number;
    oopRp: number;
    scenarioId: string;
}

type Perspective = 'ip' | 'oop';

export default function RangeMatrix ( { ipRp, oopRp, scenarioId }: Readonly<RangeMatrixProps> )
{
    const [ overrides, setOverrides ] = useState<Record<string, string>>( {} );
    const [ perspective, setPerspective ] = useState<Perspective>( 'ip' );

    // Carrega as edições persistidas isoladas por cenário no navegador do usuário
    useEffect( () =>
    {
        try
        {
            const storageKey = `rangeMatrixOverrides_${ scenarioId }`;
            const saved = localStorage.getItem( storageKey );
            if ( saved )
            {
                setOverrides( JSON.parse( saved ) );
            } else
            {
                setOverrides( {} ); // Reseta caso o novo cenário não tenha edições
            }
        } catch ( error: unknown )
        {
            console.error( 'Erro ao recuperar overrides da matriz:', error );
            setOverrides( {} );
        }
    }, [ scenarioId ] );

    const handleCellClick = ( hand: string, currentStatus: string ) =>
    {
        const currentIndex = STATUS_CYCLE.indexOf( currentStatus );
        const nextStatus = STATUS_CYCLE[ ( currentIndex + 1 ) % STATUS_CYCLE.length ];

        // 1. Atualiza o estado da UI com Fricção Zero (Pure Function)
        setOverrides( ( prev ) =>
        {
            const nextOverrides = { ...prev, [ hand ]: nextStatus };

            // 2. SOTA: I/O isolado do motor de reconciliação do React
            try
            {
                const storageKey = `rangeMatrixOverrides_${ scenarioId }`;
                localStorage.setItem( storageKey, JSON.stringify( nextOverrides ) );
            } catch ( error: unknown )
            {
                console.error( '[CORTEX SHIELD] Falha ao persistir override na RangeMatrix:', error );
            }

            return nextOverrides;
        } );
    };

    const resetOverrides = () =>
    {
        setOverrides( {} );
        const storageKey = `rangeMatrixOverrides_${ scenarioId }`;
        localStorage.removeItem( storageKey );
    };

    // RP ativo conforme perspectiva selecionada
    const activeRp = perspective === 'ip' ? ipRp : oopRp;

    // Função heurística para determinar o status da mão com base no Risk Premium
    const getHandStatus = ( row: number, col: number, hand: string ) =>
    {
        if ( overrides[ hand ] ) return overrides[ hand ]; // Prioridade para modificação manual

        const isPair = row === col;
        const isSuited = col > row;

        // Valor bruto da mão (A=14, K=13... 2=2) -> max 28 (AA), min 4 (22)
        const rankValue = ( 14 - row ) + ( 14 - col );

        // Threshold cresce com o RP da perspectiva ativa — mãos marginais viram fold sob pressão
        const threshold = 15 + ( activeRp * 0.25 );

        if ( rankValue >= threshold + 5 ) return 'core';
        if ( rankValue >= threshold ) return 'marginal';
        if ( rankValue >= threshold - 3 && ( isSuited || isPair ) ) return 'bluff';
        if ( activeRp >= 40 && rankValue < threshold + 2 ) return 'death';

        return 'fold';
    };

    const getBgClass = ( status: string ) =>
    {
        switch ( status )
        {
            case 'core': return 'bg-accent-emerald text-slate-900 border border-emerald-400';
            case 'marginal': return 'bg-accent-amber text-slate-900 border border-amber-400';
            case 'bluff': return 'bg-accent-indigo-light text-slate-900 border border-indigo-400';
            case 'death': return 'bg-accent-danger text-white border border-rose-400';
            default: return 'bg-bg-deep text-text-dim border border-white/5 hover:border-white/20';
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Header: título + toggle IP/OOP */ }
            <div className="flex justify-between items-center flex-wrap gap-3 pb-3 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <h4 className="text-[0.65rem] font-black text-accent-emerald uppercase tracking-widest m-0">
                        Colapso do Range
                    </h4>
                    {/* Toggle IP / OOP */ }
                    <div className="flex rounded-md overflow-hidden border border-white/10 bg-bg-deep p-0.5">
                        { ( [ 'ip', 'oop' ] as Perspective[] ).map( ( p ) =>
                        {
                            const isActive = perspective === p;
                            const activeClasses = p === 'ip'
                                ? 'bg-accent-indigo/20 text-accent-indigo-light shadow-inner'
                                : 'bg-accent-danger/20 text-accent-pink shadow-inner';
                            return (
                                <button
                                    key={ p }
                                    type="button"
                                    onClick={ () => setPerspective( p ) }
                                    className={ `px-3 py-1 text-[0.6rem] font-black uppercase tracking-widest cursor-pointer border-none transition-all rounded-sm ${ isActive ? activeClasses : 'bg-transparent text-text-muted hover:text-white' }` }
                                >
                                    { p.toUpperCase() } · { ( p === 'ip' ? ipRp : oopRp ).toFixed( 1 ) }%
                                </button>
                            );
                        } ) }
                    </div>
                    { Object.keys( overrides ).length > 0 && (
                        <button onClick={ resetOverrides } className="text-[0.6rem] font-black tracking-widest uppercase text-text-muted hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition-colors">
                            <i className="fa-solid fa-rotate-left mr-1" /> Reset
                        </button>
                    ) }
                </div>

                {/* Legenda */ }
                <div className="flex gap-3 text-[0.6rem] font-black text-text-muted uppercase tracking-widest flex-wrap">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-accent-emerald border border-emerald-400"></span> Core</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-accent-amber border border-amber-400"></span> Misto</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-accent-indigo-light border border-indigo-400"></span> Float</span>
                    { activeRp >= 40 && (
                        <span className="flex items-center gap-1.5 text-accent-danger"><span className="w-2.5 h-2.5 rounded-sm bg-accent-danger border border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.5)]"></span> Death</span>
                    ) }
                </div>
            </div>

            {/* Grid 13x13 */ }
            <div className="w-full overflow-x-auto scrollbar-hide pb-2 flex justify-center">
                <div className="min-w-75 max-w-2xl w-full grid grid-cols-13 gap-px bg-white/5 p-px rounded-lg overflow-hidden border border-white/10 shadow-xl">
                    { RANKS.map( ( r1, i ) => (
                        <React.Fragment key={ `row-${ r1 }` }>
                            { RANKS.map( ( r2, j ) =>
                            {
                                const isPair = i === j;
                                const isSuited = j > i;
                                let hand = `${ r2 }${ r1 }o`;
                                if ( isPair )
                                {
                                    hand = `${ r1 }${ r2 }`;
                                } else if ( isSuited )
                                {
                                    hand = `${ r1 }${ r2 }s`;
                                }

                                const status = getHandStatus( i, j, hand );
                                const bgClass = getBgClass( status );

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
                <p className="text-[0.65rem] text-text-light leading-relaxed m-0 font-medium">
                    A matriz termodinâmica reage em tempo real à pressão do Risk Premium. Células em <strong className="text-accent-danger">DEATH</strong> representam mãos que colapsam sob alta tensão de payjump. Clique nas células para aplicar <i>overrides</i> manuais.
                </p>
            </div>
        </div>
    );
}
