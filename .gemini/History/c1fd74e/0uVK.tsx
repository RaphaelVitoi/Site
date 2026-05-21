'use client';

/**
 * IDENTITY: Matriz de Ranges 13x13 (Visual Grid)
 * PATH: src/components/simulator/panels/RangeMatrix.tsx
 * ROLE: Visualizar o colapso e expansão do range baseado no Risk Premium (IP/OOP).
 * BINDING: [panels/TheoryPanel.tsx]
 */

import React, { useState, useEffect } from 'react';
import styles from '../simulator.module.css';

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
const STATUS_CYCLE = ['fold', 'core', 'marginal', 'bluff', 'death'];

interface RangeMatrixProps {
    ipRp: number;
    oopRp: number;
    scenarioId: string;
}

export default function RangeMatrix({ ipRp, oopRp, scenarioId }: Readonly<RangeMatrixProps>) {
    const [overrides, setOverrides] = useState<Record<string, string>>({});

    // Carrega as edições persistidas isoladas por cenário
    useEffect(() => {
        try {
            const storageKey = `rangeMatrixOverrides_${scenarioId}`;
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                setOverrides(JSON.parse(saved));
            } else {
                setOverrides({}); // Reseta caso o novo cenário não tenha edições
            }
        } catch (error) {
            console.error('Erro ao recuperar overrides da matriz:', error);
            setOverrides({});
        }
    }, [scenarioId]);

    const handleCellClick = (hand: string, currentStatus: string) => {
        const currentIndex = STATUS_CYCLE.indexOf(currentStatus);
        const nextStatus = STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length];
        setOverrides((prev) => {
            const newOverrides = { ...prev, [hand]: nextStatus };
            const storageKey = `rangeMatrixOverrides_${scenarioId}`;
            localStorage.setItem(storageKey, JSON.stringify(newOverrides));
            return newOverrides;
        });
    };

    const resetOverrides = () => {
        setOverrides({});
        const storageKey = `rangeMatrixOverrides_${scenarioId}`;
        localStorage.removeItem(storageKey);
    };

    // Função heurística para determinar o status da mão com base no Risk Premium
    const getHandStatus = (row: number, col: number, hand: string) => {
        if (overrides[hand]) return overrides[hand]; // Prioridade para modificação manual

        const isPair = row === col;
        const isSuited = col > row;

        // Valor bruto da mão (A=14, K=13... 2=2) -> max 28 (AA), min 4 (22)
        const rankValue = (14 - row) + (14 - col);

        // O "Teto" aumenta conforme a pressão do Bubble Factor/RP. 
        // Se o RP for alto, mãos marginais viram fold.
        const maxRp = Math.max(ipRp, oopRp);
        const threshold = 15 + (maxRp * 0.25);

        if (rankValue >= threshold + 5) return 'core'; // Shove/Call obrigatório (Verde)
        if (rankValue >= threshold) return 'marginal'; // Marginal/Misto (Amarelo)
        if (rankValue >= threshold - 3 && (isSuited || isPair)) return 'bluff'; // Suited Bloqueadores/Blefes (Índigo)
        if (maxRp >= 40 && rankValue < threshold + 2) return 'death'; // Death Zone Folds sob pressão

        return 'fold'; // Fold padrão (Cinza escuro)
    };

    const getColor = (status: string) => {
        switch (status) {
            case 'core': return 'var(--sim-range-core)';     // Emerald
            case 'marginal': return 'var(--sim-range-marginal)';// Amber
            case 'bluff': return 'var(--sim-range-bluff)';    // Indigo
            case 'death': return 'var(--sim-range-death)';    // Rose (Death Zone)
            default: return 'var(--sim-range-fold)';          // Slate (Fold)
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h4 style={{ fontSize: '0.65rem', fontWeight: 900, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>
                        Colapso do Range (RP Máximo: {Math.max(ipRp, oopRp).toFixed(1)}%)
                    </h4>
                    {Object.keys(overrides).length > 0 && (
                        <button onClick={resetOverrides} style={{ background: 'transparent', border: '1px solid #475569', color: '#94a3b8', fontSize: '0.55rem', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}>
                            Resetar Edições
                        </button>
                    )}
                </div>

                {/* Legenda */}
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.55rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, background: getColor('core'), borderRadius: 2 }}></span> Core</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, background: getColor('marginal'), borderRadius: 2 }}></span> Misto</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, background: getColor('bluff'), borderRadius: 2 }}></span> Bluff/Float</span>
                    {Math.max(ipRp, oopRp) >= 40 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f43f5e' }}><span style={{ width: 8, height: 8, background: getColor('death'), borderRadius: 2 }}></span> Death Fold</span>
                    )}
                </div>
            </div>

            {/* Grid 13x13 */}
            <div className={styles.rangeGrid}>
                {RANKS.map((r1, i) =>
                    RANKS.map((r2, j) => {
                        const isPair = i === j;
                        const isSuited = j > i;
                        const hand = isPair ? `${r1}${r2}` : isSuited ? `${r1}${r2}s` : `${r2}${r1}o`;

                        const status = getHandStatus(i, j, hand);
                        const bg = getColor(status);

                        return (
                            <div
                                key={hand}
                                className={styles.rangeCell}
                                style={{
                                    background: bg,
                                    color: status === 'fold' ? '#64748b' : '#fff',
                                    opacity: overrides[hand] ? 1 : 0.85,
                                }}
                                onClick={() => handleCellClick(hand, status)}
                                title={`${hand} - ${status.toUpperCase()}`}
                            >
                                {hand}
                            </div>
                        );
                    })
                )}
            </div>

            <p style={{ fontSize: '0.55rem', color: '#475569', fontStyle: 'italic', margin: '0.75rem 0 0 0', textAlign: 'center' }}>
                A matriz acima reage ao Risk Premium. Clique nas células para alternar manualmente (overrides).
            </p>
        </div>
    );
}