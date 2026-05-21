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

type Perspective = 'ip' | 'oop';

export default function RangeMatrix({ ipRp, oopRp, scenarioId }: Readonly<RangeMatrixProps>) {
    const [overrides, setOverrides] = useState<Record<string, string>>({});
    const [perspective, setPerspective] = useState<Perspective>('ip');
    const [isSaving, setIsSaving] = useState(false);

    // Carrega as edições persistidas via API (Fallback para localStorage)
    useEffect(() => {
        let mounted = true;
        const storageKey = `rangeMatrixOverrides_${scenarioId}`;
        const loadOverrides = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:17042/state?key=${storageKey}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.value && mounted) {
                        setOverrides(JSON.parse(data.value));
                        return;
                    }
                }
            } catch (error) {
                console.warn('API SOTA Offline ao carregar matriz. Usando cache local.');
            }
            // Fallback para LocalStorage
            if (mounted) {
                try {
                    const saved = localStorage.getItem(storageKey);
                    if (saved) setOverrides(JSON.parse(saved));
                    else setOverrides({});
                } catch (e) {
                    setOverrides({});
                }
            }
        };

        loadOverrides();
        return () => { mounted = false; };
    }, [scenarioId]);

    const saveOverrides = async (newOverrides: Record<string, string>) => {
        const storageKey = `rangeMatrixOverrides_${scenarioId}`;
        // Salva local por segurança e responsividade
        localStorage.setItem(storageKey, JSON.stringify(newOverrides));

        // Persiste no SQLite via Orquestrador SOTA
        setIsSaving(true);
        try {
            await fetch('http://127.0.0.1:17042/state', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: storageKey, value: JSON.stringify(newOverrides) })
            });
        } catch (e) {
            console.warn('Falha ao sincronizar matriz com a API SOTA.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCellClick = (hand: string, currentStatus: string) => {
        const currentIndex = STATUS_CYCLE.indexOf(currentStatus);
        const nextStatus = STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length];
        setOverrides((prev) => {
            const newOverrides = { ...prev, [hand]: nextStatus };
            saveOverrides(newOverrides);
            return newOverrides;
        });
    };

    const resetOverrides = () => {
        setOverrides({});
        const storageKey = `rangeMatrixOverrides_${scenarioId}`;
        localStorage.removeItem(storageKey);
        saveOverrides({});
    };

    // RP ativo conforme perspectiva selecionada
    const activeRp = perspective === 'ip' ? ipRp : oopRp;

    // Função heurística para determinar o status da mão com base no Risk Premium
    const getHandStatus = (row: number, col: number, hand: string) => {
        if (overrides[hand]) return overrides[hand]; // Prioridade para modificação manual

        const isPair = row === col;
        const isSuited = col > row;

        // Valor bruto da mão (A=14, K=13... 2=2) -> max 28 (AA), min 4 (22)
        const rankValue = (14 - row) + (14 - col);

        // Threshold cresce com o RP da perspectiva ativa — mãos marginais viram fold sob pressão
        const threshold = 15 + (activeRp * 0.25);

        if (rankValue >= threshold + 5) return 'core';
        if (rankValue >= threshold) return 'marginal';
        if (rankValue >= threshold - 3 && (isSuited || isPair)) return 'bluff';
        if (activeRp >= 40 && rankValue < threshold + 2) return 'death';

        return 'fold';
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

    const ipColor = '#818cf8'; // índigo
    const oopColor = '#f43f5e'; // rose

    return (
        <div>
            {/* Header: título + toggle IP/OOP */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.65rem', fontWeight: 900, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>
                        Colapso do Range
                    </h4>
                    {/* Toggle IP / OOP */}
                    <div style={{ display: 'flex', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
                        {(['ip', 'oop'] as Perspective[]).map((p) => {
                            const isActive = perspective === p;
                            const color = p === 'ip' ? ipColor : oopColor;
                            return (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setPerspective(p)}
                                    style={{
                                        padding: '3px 10px',
                                        fontSize: '0.58rem',
                                        fontWeight: 800,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                        cursor: 'pointer',
                                        border: 'none',
                                        background: isActive ? `${color}22` : 'transparent',
                                        color: isActive ? color : '#475569',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {p.toUpperCase()} · {(p === 'ip' ? ipRp : oopRp).toFixed(1)}%
                                </button>
                            );
                        })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {isSaving ? (
                            <span style={{ fontSize: '0.55rem', color: '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <i className="fa-solid fa-rotate fa-spin"></i> Sincronizando
                            </span>
                        ) : Object.keys(overrides).length > 0 ? (
                            <span style={{ fontSize: '0.55rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <i className="fa-solid fa-cloud-check"></i> Na Nuvem SOTA
                            </span>
                        ) : null}
                        {Object.keys(overrides).length > 0 && (
                            <button onClick={resetOverrides} style={{ background: 'transparent', border: '1px solid #475569', color: '#94a3b8', fontSize: '0.58rem', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', transition: '0.2s' }}>
                                Resetar
                            </button>
                        )}
                    </div>
                </div>

                {/* Legenda */}
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.58rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, background: getColor('core'), borderRadius: 2 }}></span> Core</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, background: getColor('marginal'), borderRadius: 2 }}></span> Misto</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, background: getColor('bluff'), borderRadius: 2 }}></span> Bluff/Float</span>
                    {activeRp >= 40 && (
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

            <p style={{ fontSize: '0.58rem', color: '#475569', fontStyle: 'italic', margin: '0.75rem 0 0 0', textAlign: 'center' }}>
                A matriz acima reage ao Risk Premium. Clique nas células para alternar manualmente (overrides).
            </p>
        </div>
    );
}