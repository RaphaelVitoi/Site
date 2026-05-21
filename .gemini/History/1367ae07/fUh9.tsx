'use client';

/**
 * IDENTITY: Matriz de Ranges 13x13 (Visual Grid)
 * PATH: src/components/simulator/panels/RangeMatrix.tsx
 * ROLE: Visualizar o colapso e expansão do range baseado no Risk Premium (IP/OOP).
 * BINDING: [panels/TheoryPanel.tsx]
 */

import React, { useEffect, useState } from 'react';
import styles from '../simulator.module.css';

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
const STATUS_CYCLE = ['fold', 'core', 'marginal', 'bluff', 'death'];

interface RangeMatrixProps {
    ipRp: number;
    oopRp: number;
    scenarioId: string;
}

type Perspective = 'ip' | 'oop';

export default function RangeMatrix( { ipRp, oopRp, scenarioId }: Readonly<RangeMatrixProps> ) {
    const [overrides, setOverrides] = useState<Record<string, string>>( {} );
    const [perspective, setPerspective] = useState<Perspective>( 'ip' );

    // Carrega as edições persistidas isoladas por cenário no navegador do usuário
    useEffect( () => {
        try {
            const storageKey = `rangeMatrixOverrides_${scenarioId}`;
            const saved = localStorage.getItem( storageKey );
            if ( saved ) {
                setOverrides( JSON.parse( saved ) );
            } else {
                setOverrides( {} ); // Reseta caso o novo cenário não tenha edições
            }
        } catch ( error ) {
            console.error( 'Erro ao recuperar overrides da matriz:', error );
            setOverrides( {} );
        }
    }, [scenarioId] );

    const handleCellClick = ( hand: string, currentStatus: string ) => {
        const currentIndex = STATUS_CYCLE.indexOf( currentStatus );
        const nextStatus = STATUS_CYCLE[( currentIndex + 1 ) % STATUS_CYCLE.length];

        // 1. Atualiza o estado da UI com Fricção Zero (Pure Function)
        setOverrides( ( prev ) => {
            return { ...prev, [hand]: nextStatus };
        } );

        // 2. SOTA: I/O isolado do motor de reconciliação do React
        try {
            const storageKey = `rangeMatrixOverrides_${scenarioId}`;
            const saved = JSON.parse( localStorage.getItem( storageKey ) || '{}' );
            saved[hand] = nextStatus;
            localStorage.setItem( storageKey, JSON.stringify( saved ) );
        } catch ( error ) {
            console.error( '[CORTEX SHIELD] Falha ao persistir override na RangeMatrix:', error );
        }
    };

    const resetOverrides = () => {
        setOverrides( {} );
        const storageKey = `rangeMatrixOverrides_${scenarioId}`;
        localStorage.removeItem( storageKey );
    };

    // RP ativo conforme perspectiva selecionada
    const activeRp = perspective === 'ip' ? ipRp : oopRp;

    // Função heurística para determinar o status da mão com base no Risk Premium
    const getHandStatus = ( row: number, col: number, hand: string ) => {
        if ( overrides[hand] ) return overrides[hand]; // Prioridade para modificação manual

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

    const getColor = ( status: string ) => {
        switch ( status ) {
            case 'core': return 'var(--sim-range-core)';     // Emerald
            case 'marginal': return 'var(--sim-range-marginal)';// Amber
            case 'bluff': return 'var(--sim-range-bluff)';    // Indigo
            case 'death': return 'var(--sim-range-death)';    // Rose (Death Zone)
            default: return 'var(--sim-range-fold)';          // Slate (Fold)
        }
    };

    const ipColor = 'var(--accent-indigo-light)'; // índigo
    const oopColor = 'var(--accent-danger)'; // rose

    return (
        <div>
            {/* Header: título + toggle IP/OOP */ }
            <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                    <h4 className="text-[0.65rem] font-black text-accent-emerald uppercase tracking-[0.15em] m-0">
                        Colapso do Range
                    </h4>
                    {/* Toggle IP / OOP */ }
                    <div className="flex rounded-md overflow-hidden border border-white/5 bg-bg-deep">
                        { ( ['ip', 'oop'] as Perspective[] ).map( ( p ) => {
                            const isActive = perspective === p;
                            const color = p === 'ip' ? ipColor : oopColor;
                            return (
                                <button
                                    key={ p }
                                    type="button"
                                    onClick={ () => setPerspective( p ) }
                                    className="px-2.5 py-1 text-[0.58rem] font-extrabold uppercase tracking-[0.08em] cursor-pointer border-none transition-all duration-200"
                                    style={ {
                                        background: isActive ? `${color}22` : 'transparent',
                                        color: isActive ? color : 'var(--text-darker)',
                                    } }
                                >
                                    { p.toUpperCase() } · { ( p === 'ip' ? ipRp : oopRp ).toFixed( 1 ) }%
                                </button>
                            );
                        } ) }
                    </div>
                    { Object.keys( overrides ).length > 0 && (
                        <button onClick={ resetOverrides } className="bg-transparent border border-text-darker text-text-muted text-[0.58rem] px-2 py-0.5 rounded cursor-pointer hover:bg-white/5 transition-colors">
                            Resetar
                        </button>
                    ) }
                </div>

                {/* Legenda */ }
                <div className="flex gap-2 text-[0.58rem] font-bold text-text-muted uppercase flex-wrap">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={ { background: getColor( 'core' ) } }></span> Core</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={ { background: getColor( 'marginal' ) } }></span> Misto</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={ { background: getColor( 'bluff' ) } }></span> Bluff/Float</span>
                    { activeRp >= 40 && (
                        <span className="flex items-center gap-1 text-accent-danger"><span className="w-2 h-2 rounded-sm" style={ { background: getColor( 'death' ) } }></span> Death Fold</span>
                    ) }
                </div>
            </div>

            {/* Grid 13x13 */ }
            <div className={ styles.rangeGrid }>
                { RANKS.map( ( r1, i ) => (
                    <React.Fragment key={ `row-${r1}` }>
                        { RANKS.map( ( r2, j ) => {
                            const isPair = i === j;
                            const isSuited = j > i;
                            let hand = `${r2}${r1}o`;
                            if ( isPair ) {
                                hand = `${r1}${r2}`;
                            } else if ( isSuited ) {
                                hand = `${r1}${r2}s`;
                            }

                            const status = getHandStatus( i, j, hand );
                            const bg = getColor( status );

                            return (
                                <button
                                    type="button"
                                    key={ hand }
                                    className={ styles.rangeCell }
                                    style={ {
                                        background: bg,
                                        color: status === 'fold' ? 'var(--text-dim)' : 'var(--text-main)',
                                        opacity: overrides[hand] ? 1 : 0.85,
                                        border: 'none',
                                        cursor: 'pointer',
                                    } }
                                    onClick={ () => handleCellClick( hand, status ) }
                                    title={ `${hand} - ${status.toUpperCase()}` }
                                >
                                    { hand }
                                </button>
                            );
                        } ) }
                    </React.Fragment>
                ) ) }
            </div>

            <p className="text-[0.58rem] text-text-darker italic mt-3 mb-0 text-center">
                A matriz acima reage ao Risk Premium. Clique nas células para alternar manualmente (overrides).
            </p>
        </div>
    );
}
