'use client';

/**
 * IDENTITY: Calculadora Malmuth-Harville de Equidade ICM
 * PATH: src/components/simulator/panels/EquityCalculator.tsx
 * ROLE: Inputs manuais de stacks + payouts + hand parser -> cálculo ICM real.
 * BINDING: [lib/icmEngine.ts, lib/handParser.ts, simulator.module.css]
 */

import React, { useState, useMemo, useCallback } from 'react';
import { calculateMalmuthHarville, type ICMPlayer } from '../../../lib/icmEngine';
import { parseHandHistory } from '../../../lib/handParser';
import AnimatedNumber from '../ui/AnimatedNumber';
import styles from '../simulator.module.css';

// Presets de cenários rápidos
const PRESETS = [
  { label: 'HU (2p)', stacks: [50, 50], prizes: [65, 35] },
  { label: '3-Way', stacks: [40, 35, 25], prizes: [50, 30, 20] },
  { label: 'FT (6p)', stacks: [30, 25, 20, 12, 8, 5], prizes: [35, 25, 18, 12, 7, 3] },
  { label: 'Bolha (4p)', stacks: [45, 25, 18, 12], prizes: [50, 30, 20] },
];

export default function EquityCalculator() {
  const [players, setPlayers] = useState<ICMPlayer[]>([
    { id: '1', name: 'Jogador 1', stack: 40 },
    { id: '2', name: 'Jogador 2', stack: 55 },
  ]);
  const [prizes, setPrizes] = useState<number[]>([65, 35]);
  const [handText, setHandText] = useState('');
  const [showParser, setShowParser] = useState(false);
  const [parserError, setParserError] = useState<string | null>(null);

  // Cálculo ICM memoizado
  const results = useMemo(
    () => calculateMalmuthHarville(players, prizes),
    [players, prizes]
  );

  const totalChips = useMemo(
    () => players.reduce((sum, p) => sum + p.stack, 0),
    [players]
  );

  const totalPrizes = useMemo(
    () => prizes.reduce((sum, p) => sum + p, 0),
    [prizes]
  );

  // Bubble Factor range: menor e maior BF entre jogadores
  const { bfRange, bfRangeColor } = useMemo(() => {
    if (results.length < 2 || totalChips === 0) return { bfRange: '-', bfRangeColor: '#475569' };
    const bfs = results.map(r => {
      const chip = (players.find(p => p.id === r.id)?.stack ?? 0) / totalChips * 100;
      return chip > 0 ? r.equityPercent / chip : 1;
    });
    const min = Math.min(...bfs);
    const max = Math.max(...bfs);
    const color = max > 1.3 ? 'var(--sim-color-rose)' : max > 1.1 ? 'var(--sim-color-amber)' : 'var(--sim-color-emerald)';
    return { bfRange: `${min.toFixed(2)}-${max.toFixed(2)}`, bfRangeColor: color };
  }, [results, players, totalChips]);

  // Insight: quem mais ganha/perde com ICM vs proporcional
  const icmInsight = useMemo(() => {
    if (results.length < 2 || totalChips === 0) return null;
    let maxGain = { name: '', delta: -Infinity };
    let maxLoss = { name: '', delta: Infinity };
    for (const r of results) {
      const chip = (players.find(p => p.id === r.id)?.stack ?? 0) / totalChips * 100;
      const delta = r.equityPercent - chip;
      if (delta > maxGain.delta) maxGain = { name: r.name, delta };
      if (delta < maxLoss.delta) maxLoss = { name: r.name, delta };
    }
    if (Math.abs(maxGain.delta) < 0.5 && Math.abs(maxLoss.delta) < 0.5) {
      return 'Equidade ICM proxima da proporcional - pressao ICM baixa neste spot.';
    }
    return `${maxGain.name} ganha +${maxGain.delta.toFixed(1)}% com ICM vs proporcional. ${maxLoss.name} perde ${maxLoss.delta.toFixed(1)}%. Short stacks acumulam equity desproporcional ao risco.`;
  }, [results, players, totalChips]);

  // Adicionar jogador
  const addPlayer = useCallback(() => {
    setPlayers(prev => [
      ...prev,
      { id: Date.now().toString(), name: `Jogador ${prev.length + 1}`, stack: 20 },
    ]);
  }, []);

  // Remover jogador
  const removePlayer = useCallback((id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
  }, []);

  // Atualizar stack
  const updateStack = useCallback((id: string, stack: number) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, stack } : p));
  }, []);

  // Atualizar nome
  const updateName = useCallback((id: string, name: string) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, name } : p));
  }, []);

  // Atualizar prêmio
  const updatePrize = useCallback((idx: number, value: number) => {
    setPrizes(prev => prev.map((p, i) => i === idx ? value : p));
  }, []);

  // Adicionar prêmio
  const addPrize = useCallback(() => {
    setPrizes(prev => [...prev, 10]);
  }, []);

  // Remover prêmio
  const removePrize = useCallback(() => {
    setPrizes(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
  }, []);

  // Carregar preset
  const loadPreset = useCallback((preset: typeof PRESETS[0]) => {
    setPlayers(
      preset.stacks.map((stack, i) => ({
        id: String(i + 1),
        name: `Jogador ${i + 1}`,
        stack,
      }))
    );
    setPrizes([...preset.prizes]);
  }, []);

  // Parse hand history
  const parseHand = useCallback(() => {
    setParserError(null);
    const parsed = parseHandHistory(handText);
    if (parsed.length >= 2) {
      setPlayers(parsed);
      setShowParser(false);
      setHandText('');
    } else {
      setParserError('Não foi possível identificar pelo menos 2 jogadores. Verifique o formato (ex: "Seat 1: Nome (15000 in chips)").');
    }
  }, [handText]);

  return (
    <div className={styles.glassPanel} style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h3 style={{ margin: 0, fontSize: '0.65rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          Calculadora Malmuth-Harville
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setShowParser(!showParser)}
            style={{
              padding: '0.3rem 0.6rem',
              borderRadius: '6px',
              background: showParser ? 'rgba(99, 102, 241, 0.2)' : 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              color: showParser ? '#818cf8' : '#94a3b8',
              fontSize: '0.58rem',
              fontWeight: 700,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            <i className="fa-solid fa-paste" style={{ marginRight: '4px' }} />
            Parser
          </button>
        </div>
      </div>

      {/* Hand history parser (colapsável) */}
      {showParser && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1rem',
        }}>
          <p style={{ fontSize: '0.6rem', color: '#64748b', margin: '0 0 0.5rem', fontStyle: 'italic' }}>
            Cole uma hand history (PokerStars / Hand2Note):
          </p>
          <textarea
            value={handText}
            onChange={(e) => setHandText(e.target.value)}
            placeholder={'Seat 1: Jogador1 (15000 in chips)\nSeat 2: Jogador2 (25000 in chips)'}
            rows={4}
            style={{
              width: '100%',
              background: '#0a0f1c',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#e2e8f0',
              padding: '0.75rem',
              fontSize: '0.75rem',
              fontFamily: 'var(--sim-font-mono)',
              fontVariantNumeric: 'tabular-nums',
              resize: 'vertical',
            }}
          />
          {parserError && (
            <div style={{
              marginTop: '0.6rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              background: 'rgba(225, 29, 72, 0.1)',
              border: '1px solid rgba(225, 29, 72, 0.3)',
              color: '#f43f5e',
              fontSize: '0.6rem',
              fontWeight: 600,
            }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }} />
              {parserError}
            </div>
          )}
          <button
            onClick={parseHand}
            disabled={!handText.trim()}
            style={{
              marginTop: '0.5rem',
              padding: '0.4rem 1rem',
              borderRadius: '8px',
              background: handText.trim() ? '#6366f1' : '#334155',
              border: 'none',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 700,
              cursor: handText.trim() ? 'pointer' : 'default',
              opacity: handText.trim() ? 1 : 0.5,
            }}
          >
            Decodificar
          </button>
        </div>
      )}

      {/* Presets rápidos */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => loadPreset(preset)}
            style={{
              padding: '0.3rem 0.6rem',
              borderRadius: '6px',
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              color: '#94a3b8',
              fontSize: '0.58rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Grid: Stacks | Payouts */}
      <div className={styles.calcGrid2Col} style={{ marginBottom: '1rem' }}>
        {/* Stacks */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '12px',
          padding: '0.75rem',
        }}>
          <h4 style={{ fontSize: '0.58rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 0.5rem' }}>
            Stacks (bb)
          </h4>
          {players.map((p) => (
            <div key={p.id} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem', alignItems: 'center' }}>
              <input
                value={p.name}
                onChange={(e) => updateName(p.id, e.target.value)}
                style={{
                  flex: 1,
                  background: '#0a0f1c',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#e2e8f0',
                  padding: '0.35rem 0.5rem',
                  fontSize: '0.65rem',
                  minWidth: 0,
                }}
              />
              <input
                type="number"
                value={p.stack}
                onChange={(e) => updateStack(p.id, Math.max(0, parseInt(e.target.value) || 0))}
                style={{
                  width: '60px',
                  background: '#0a0f1c',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#818cf8',
                  padding: '0.35rem 0.5rem',
                  fontSize: '0.65rem',
                  fontFamily: 'var(--sim-font-mono)',
                  fontVariantNumeric: 'tabular-nums',
                  textAlign: 'right',
                }}
              />
              {players.length > 2 && (
                <button
                  onClick={() => removePlayer(p.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#475569',
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    padding: '0 4px',
                  }}
                >
                  &times;
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addPlayer}
            style={{
              width: '100%',
              padding: '0.3rem',
              borderRadius: '6px',
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px dashed #334155',
              color: '#64748b',
              fontSize: '0.58rem',
              fontWeight: 700,
              cursor: 'pointer',
              marginTop: '0.25rem',
            }}
          >
            + Jogador
          </button>
        </div>

        {/* Payouts */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '12px',
          padding: '0.75rem',
        }}>
          <h4 style={{ fontSize: '0.58rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 0.5rem' }}>
            Payouts (%)
          </h4>
          {prizes.map((prize, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.58rem', color: '#64748b', width: '20px', textAlign: 'right' }}>
                {idx + 1}&ordm;
              </span>
              <input
                type="number"
                value={prize}
                onChange={(e) => updatePrize(idx, Math.max(0, parseFloat(e.target.value) || 0))}
                style={{
                  flex: 1,
                  background: '#0a0f1c',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: 'var(--sim-color-emerald)',
                  padding: '0.35rem 0.5rem',
                  fontSize: '0.65rem',
                  fontFamily: 'var(--sim-font-mono)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              />
            </div>
          ))}
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem' }}>
            <button
              onClick={addPrize}
              style={{
                flex: 1,
                padding: '0.3rem',
                borderRadius: '6px',
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px dashed #334155',
                color: '#64748b',
                fontSize: '0.58rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              + Prêmio
            </button>
            {prizes.length > 1 && (
              <button
                onClick={removePrize}
                style={{
                  padding: '0.3rem 0.6rem',
                  borderRadius: '6px',
                  background: 'rgba(225, 29, 72, 0.1)',
                  border: '1px solid rgba(225, 29, 72, 0.2)',
                  color: '#e11d48',
                  fontSize: '0.58rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                &minus;
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Resumo */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '1rem',
        flexWrap: 'wrap',
      }}>
        {[
          { label: 'Jogadores', value: String(players.length), color: 'var(--sim-text-main)' },
          { label: 'Fichas', value: String(totalChips), color: 'var(--sim-color-indigo-light)' },
          { label: 'Pool', value: `${totalPrizes.toFixed(1)}%`, color: 'var(--sim-color-emerald)' },
          { label: 'BF Range', value: bfRange, color: bfRangeColor },
        ].map((stat) => (
          <div key={stat.label} style={{
            flex: '1 1 80px',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '10px',
            padding: '0.6rem 0.75rem',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.58rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>
              {stat.label}
            </div>
            <div className={styles.dataMono} style={{ fontSize: '0.75rem', color: stat.color, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Resultados */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(99, 102, 241, 0.15)',
        borderRadius: '12px',
        padding: '1rem',
      }}>
        <h4 style={{ fontSize: '0.58rem', fontWeight: 900, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 0.75rem' }}>
          Equidade ICM
        </h4>
        {results.map((r) => {
          const chipPercent = totalChips > 0
            ? ((players.find(p => p.id === r.id)?.stack ?? 0) / totalChips) * 100
            : 0;
          const delta = r.equityPercent - chipPercent;
          const deltaColor = delta > 0.5 ? 'var(--sim-color-emerald)' : delta < -0.5 ? 'var(--sim-color-rose)' : 'var(--sim-text-subtle)';
          const deltaSign = delta > 0 ? '+' : '';
          return (
            <div key={r.id} style={{ marginBottom: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#e2e8f0', fontWeight: 600 }}>{r.name}</span>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <span className={styles.dataMono} style={{ fontSize: '0.6rem', color: 'var(--sim-text-dim)', fontVariantNumeric: 'tabular-nums' }}>
                    Fichas {chipPercent.toFixed(1)}%
                  </span>
                  <span className={styles.dataMono} style={{ fontSize: '0.7rem', color: 'var(--sim-color-indigo)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                    <AnimatedNumber value={r.equityPercent} suffix="%" />
                  </span>
                  <span className={styles.dataMono} style={{
                    fontSize: '0.58rem',
                    color: deltaColor,
                    fontWeight: 700,
                    padding: '0.15rem 0.4rem',
                    borderRadius: '4px',
                    background: delta > 0.5 ? 'rgba(16,185,129,0.1)' : delta < -0.5 ? 'rgba(244,63,94,0.1)' : 'transparent',
                    fontVariantNumeric: 'tabular-nums'
                  }}>
                    {deltaSign}{delta.toFixed(1)}%
                  </span>
                </div>
              </div>
              {/* Barras: cinza = fichas, indigo = ICM */}
              <div style={{ position: 'relative', height: '6px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: `${chipPercent}%`,
                  background: 'var(--sim-border-light)',
                  borderRadius: '3px',
                  transition: 'width 0.8s ease',
                }} />
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: `${r.equityPercent}%`,
                  background: 'var(--sim-color-indigo)',
                  opacity: 0.85,
                  borderRadius: '3px',
                  transition: 'width 0.8s ease',
                }} />
              </div>
            </div>
          );
        })}

        {/* Insight ICM vs ChipEV */}
        {icmInsight && (
          <div style={{
            marginTop: '0.75rem',
            padding: '0.6rem 0.75rem',
            borderRadius: '8px',
            background: 'rgba(99, 102, 241, 0.06)',
            border: '1px solid rgba(99, 102, 241, 0.15)',
            fontSize: '0.6rem',
            color: '#94a3b8',
            lineHeight: 1.5,
          }}>
            <i className="fa-solid fa-lightbulb" style={{ color: '#818cf8', marginRight: '6px' }} />
            {icmInsight}
          </div>
        )}
      </div>
    </div>
  );
}
