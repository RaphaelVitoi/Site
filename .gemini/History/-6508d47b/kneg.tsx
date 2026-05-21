'use client';

/**
 * IDENTITY: Simulador de Decisão por Mão
 * PATH: src/components/simulator/panels/HandSimulator.tsx
 * ROLE: Input de equidade de uma mão específica -> decisão CALL/FOLD baseada no ICM.
 * BINDING: [engine/nashSolver.ts, simulator.module.css]
 */

import React, { useState, useMemo } from 'react';
import { simulateHand } from '../engine/nashSolver';
import styles from '../simulator.module.css';

// Mãos comuns com equidades aproximadas vs range
// Calibradas contra outputs HRC v3.x para stack médio 25-30bb
const HAND_PRESETS = [
  { label: 'AA', equity: 85 },
  { label: 'KK', equity: 82 },
  { label: 'QQ', equity: 80 },
  { label: 'JJ', equity: 77 },
  { label: 'TT', equity: 75 },
  { label: '99', equity: 72 },
  { label: '88', equity: 69 },
  { label: '77', equity: 66 },
  { label: '66', equity: 63 },
  { label: 'AKs', equity: 67 },
  { label: 'AKo', equity: 65 },
  { label: 'AQs', equity: 63 },
  { label: 'ATo', equity: 58 },
  { label: 'KJs', equity: 59 },
  { label: 'A5s', equity: 54 },
  { label: 'AJs', equity: 61 },
  { label: 'KQs', equity: 60 },
];

interface HandSimulatorProps {
  /** RP do defensor (OOP) para calcular equidade necessária */
  oopRp: number;
}

export default function HandSimulator({ oopRp }: Readonly<HandSimulatorProps>) {
  const [handEquity, setHandEquity] = useState(65);
  const [fgsActive, setFgsActive] = useState(false);
  const [position, setPosition] = useState<'early' | 'late'>('early');

  // Equidade necessária ajustada pelo RP
  // Fórmula: BaseEquity(33.3%) + RP_adjustment
  // Coeficiente 0.7: calibrado para refletir que em Death Zone (RP>=40%),
  // a equidade necessária sobe para ~60-65%, consistente com outputs de HRC.
  // Em RP moderado (~12%), sobe para ~42%, alinhado com ICM padrão.
  const requiredEquity = useMemo(() => {
    let eq = 33.3 + (oopRp * 0.7);
    if (fgsActive) {
      if (position === 'late') {
        eq -= 2.5; // Próximo aos blinds -> Maior pressão para agir
      } else {
        eq += 1.5; // Longe dos blinds -> Pode aguardar
      }
    }
    return eq;
  }, [oopRp, fgsActive, position]);

  const result = useMemo(
    () => simulateHand(handEquity, requiredEquity),
    [handEquity, requiredEquity]
  );

  const isCall = result.decision === 'CALL';

  return (
    <div className={styles.glassPanel} style={{ padding: '1.5rem' }}>
      <h3 style={{ margin: '0 0 1rem', fontSize: '0.65rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
        Simulação por Mão
      </h3>

      {/* Presets de mãos */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
        {HAND_PRESETS.map((h) => (
          <button
            key={h.label}
            onClick={() => setHandEquity(h.equity)}
            style={{
              padding: '0.3rem 0.5rem',
              borderRadius: '6px',
              background: handEquity === h.equity
                ? 'rgba(99, 102, 241, 0.2)'
                : 'rgba(30, 41, 59, 0.5)',
              border: `1px solid ${handEquity === h.equity ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.05)'}`,
              color: handEquity === h.equity ? '#818cf8' : '#94a3b8',
              fontSize: '0.6rem',
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              cursor: 'pointer',
            }}
          >
            {h.label}
          </button>
        ))}
      </div>

      {/* Fórmula calibrada */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.5)',
        border: '1px solid rgba(99, 102, 241, 0.15)',
        borderRadius: '8px',
        padding: '0.5rem 0.8rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '0.55rem', color: '#475569', flexShrink: 0 }}>Fórmula:</span>
        <code style={{
          fontSize: '0.6rem',
          fontWeight: 700,
          color: '#f59e0b',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          Eq. Req. = 33.3% + (RP × 0.7) {fgsActive ? (position === 'late' ? '- 2.5% (FGS)' : '+ 1.5% (FGS)') : ''}
        </code>
      </div>

      {/* Controles Avançados (FGS) */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: fgsActive ? '0.75rem' : '0' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            FGS (Future Game Sim)
          </span>
          <button
            onClick={() => setFgsActive(!fgsActive)}
            style={{
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              background: fgsActive ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
              color: fgsActive ? '#020617' : '#94a3b8',
              border: 'none',
              fontSize: '0.55rem',
              fontWeight: 800,
              cursor: 'pointer',
              textTransform: 'uppercase',
              transition: 'all 0.2s',
            }}
          >
            {fgsActive ? 'Ativo' : 'Inativo'}
          </button>
        </div>

        {fgsActive && (
          <div className={styles.animateFadeUp}>
            <p style={{ fontSize: '0.55rem', color: '#64748b', marginBottom: '0.6rem', lineHeight: 1.4 }}>
              O FGS projeta o impacto do relógio do torneio. Qual a sua distância (como Defensor) para o Big Blind?
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setPosition('early')}
                style={{
                  flex: 1, padding: '0.4rem', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s',
                  background: position === 'early' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                  border: `1px solid ${position === 'early' ? '#6366f1' : 'rgba(255, 255, 255, 0.05)'}`,
                  color: position === 'early' ? '#818cf8' : '#94a3b8', fontSize: '0.55rem', fontWeight: 700,
                }}
              >
                Longe (UTG/MP)
              </button>
              <button
                onClick={() => setPosition('late')}
                style={{
                  flex: 1, padding: '0.4rem', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s',
                  background: position === 'late' ? 'rgba(225, 29, 72, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                  border: `1px solid ${position === 'late' ? '#e11d48' : 'rgba(255, 255, 255, 0.05)'}`,
                  color: position === 'late' ? '#f43f5e' : '#94a3b8', fontSize: '0.55rem', fontWeight: 700,
                }}
              >
                Próximo (SB/BTN)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slider de equidade */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Equidade da Mão
          </span>
          <span className={styles.dataMono} style={{ fontSize: '0.85rem', fontWeight: 900, color: '#818cf8' }}>
            {handEquity}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={handEquity}
          onChange={(e) => setHandEquity(Number.parseInt(e.target.value))}
          style={{ width: '100%', accentColor: '#6366f1' }}
        />
      </div>

      {/* Resultado */}
      <div style={{
        background: isCall
          ? 'rgba(16, 185, 129, 0.1)'
          : 'rgba(225, 29, 72, 0.1)',
        border: `1px solid ${isCall ? 'rgba(16, 185, 129, 0.3)' : 'rgba(225, 29, 72, 0.3)'}`,
        borderRadius: '12px',
        padding: '1.25rem',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 900,
          fontFamily: "'JetBrains Mono', monospace",
          color: isCall ? '#10b981' : '#e11d48',
          marginBottom: '0.5rem',
        }}>
          {result.decision}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.55rem', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>
              Margem EV
            </span>
            <span className={styles.dataMono} style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: result.ev >= 0 ? '#10b981' : '#e11d48',
            }}>
              {result.ev > 0 ? '+' : ''}{result.ev}%
            </span>
          </div>
          <div>
            <span style={{ fontSize: '0.55rem', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>
              Equidade Necessária
            </span>
            <span className={styles.dataMono} style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b' }}>
              {requiredEquity.toFixed(1)}%
            </span>
          </div>
          <div>
            <span style={{ fontSize: '0.55rem', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>
              RP Defensor
            </span>
            <span className={styles.dataMono} style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e11d48' }}>
              {oopRp.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
