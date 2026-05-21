'use client';

/**
 * IDENTITY: Painel de Estrutura de Premiação
 * PATH: src/components/simulator/panels/PayoutsPanel.tsx
 * ROLE: Tabela visual de payouts padrão para torneios (referência educacional).
 * BINDING: [simulator.module.css]
 */

import React, { useState } from 'react';
import styles from '../simulator.module.css';

// Estruturas padrão de torneios
const PAYOUT_STRUCTURES: Record<string, { players: number; payouts: { place: number; percent: number }[] }> = {
  'HU (2p)': {
    players: 2,
    payouts: [
      { place: 1, percent: 65 },
      { place: 2, percent: 35 },
    ],
  },
  '3-Way': {
    players: 3,
    payouts: [
      { place: 1, percent: 50 },
      { place: 2, percent: 30 },
      { place: 3, percent: 20 },
    ],
  },
  'STT (6p)': {
    players: 6,
    payouts: [
      { place: 1, percent: 40 },
      { place: 2, percent: 30 },
      { place: 3, percent: 20 },
      { place: 4, percent: 10 },
    ],
  },
  'FT (9p)': {
    players: 9,
    payouts: [
      { place: 1, percent: 30 },
      { place: 2, percent: 20 },
      { place: 3, percent: 15 },
      { place: 4, percent: 11 },
      { place: 5, percent: 8 },
      { place: 6, percent: 6 },
      { place: 7, percent: 4 },
      { place: 8, percent: 3.5 },
      { place: 9, percent: 2.5 },
    ],
  },
  'MTT Bolha': {
    players: 4,
    payouts: [
      { place: 1, percent: 50 },
      { place: 2, percent: 30 },
      { place: 3, percent: 20 },
    ],
  },
};

export default function PayoutsPanel() {
  const [activeStructure, setActiveStructure] = useState('STT (6p)');
  const [customPayouts, setCustomPayouts] = useState<{ place: number; percent: number }[]>([
    { place: 1, percent: 50 },
    { place: 2, percent: 30 },
    { place: 3, percent: 20 },
  ]);

  const isCustom = activeStructure === 'Custom';
  const structure = isCustom
    ? { players: customPayouts.length * 3, payouts: customPayouts } // Estimativa didática
    : PAYOUT_STRUCTURES[activeStructure];

  const updateCustomPayout = (index: number, newPercent: number) => {
    const updated = [...customPayouts];
    updated[index].percent = newPercent;
    setCustomPayouts(updated);
  };

  const addCustomPayout = () => setCustomPayouts([...customPayouts, { place: customPayouts.length + 1, percent: 0 }]);
  const removeCustomPayout = () => setCustomPayouts(customPayouts.length > 1 ? customPayouts.slice(0, -1) : customPayouts);

  const totalPercent = structure?.payouts.reduce((s, p) => s + p.percent, 0) || 0;

  return (
    <div className={styles.glassPanel} style={{ padding: '1.5rem' }}>
      <h3 style={{ margin: '0 0 1rem', fontSize: '0.65rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
        Estrutura de Premiação
      </h3>

      {/* Seletor de estrutura */}
      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {[...Object.keys(PAYOUT_STRUCTURES), 'Custom'].map((key) => (
          <button
            key={key}
            onClick={() => setActiveStructure(key)}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '8px',
              background: activeStructure === key
                ? 'rgba(99, 102, 241, 0.2)'
                : 'rgba(30, 41, 59, 0.5)',
              border: `1px solid ${activeStructure === key ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.05)'}`,
              color: activeStructure === key ? '#818cf8' : '#94a3b8',
              fontSize: '0.6rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <th style={{ padding: '0.6rem 1rem', textAlign: 'left', fontSize: '0.58rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                Posição
              </th>
              <th style={{ padding: '0.6rem 1rem', textAlign: 'right', fontSize: '0.58rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                Prêmio (%)
              </th>
              <th style={{ padding: '0.6rem 1rem', textAlign: 'right', fontSize: '0.58rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                Visual
              </th>
            </tr>
          </thead>
          <tbody>
            {structure?.payouts.map((p, idx) => (
              <tr
                key={p.place}
                style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}
              >
                <td style={{ padding: '0.5rem 1rem' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: p.place === 1 ? '#f59e0b' : p.place === 2 ? '#94a3b8' : p.place === 3 ? '#b45309' : '#475569',
                  }}>
                    {p.place}&ordm;
                  </span>
                </td>
                <td style={{ padding: '0.5rem 1rem', textAlign: 'right' }}>
                  {isCustom ? (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px' }}>
                      <input
                        type="number"
                        value={p.percent}
                        onChange={(e) => updateCustomPayout(idx, parseFloat(e.target.value) || 0)}
                        style={{
                          width: '50px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid #334155',
                          borderRadius: '4px',
                          color: '#10b981',
                          fontSize: '0.75rem',
                          padding: '2px 4px',
                          textAlign: 'right',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontWeight: 700
                        }}
                      />
                      <span style={{ fontSize: '0.65rem', color: '#64748b' }}>%</span>
                    </div>
                  ) : (
                    <span className={styles.dataMono} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>
                      {p.percent}%
                    </span>
                  )}
                </td>
                <td style={{ padding: '0.5rem 1rem', textAlign: 'right' }}>
                  <div style={{
                    height: '6px',
                    borderRadius: '3px',
                    background: 'rgba(30, 41, 59, 0.8)',
                    overflow: 'hidden',
                    width: '100%',
                    maxWidth: '120px',
                    marginLeft: 'auto',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${p.percent * 2}%`,
                      background: p.place === 1
                        ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                        : 'linear-gradient(90deg, #6366f1, #818cf8)',
                      borderRadius: '3px',
                      transition: 'width 0.8s ease',
                    }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Controles Custom */}
        {isCustom && (
          <div style={{ padding: '0.6rem 1rem', display: 'flex', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.4)' }}>
            <button onClick={addCustomPayout} style={{
              padding: '0.3rem 0.6rem',
              borderRadius: '6px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              color: '#10b981',
              fontSize: '0.58rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}>
              + Posição
            </button>
            {customPayouts.length > 1 && (
              <button onClick={removeCustomPayout} style={{
                padding: '0.3rem 0.6rem',
                borderRadius: '6px',
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                color: '#f43f5e',
                fontSize: '0.58rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}>
                - Remover
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{
          padding: '0.6rem 1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.58rem', color: '#64748b' }}>
            {isCustom ? 'Estrutura Customizada' : `${structure?.players} jogadores`}
          </span>
          <span className={styles.dataMono} style={{ fontSize: '0.6rem', color: totalPercent === 100 ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
            Total: {totalPercent.toFixed(1)}%
            {totalPercent !== 100 && <i className="fa-solid fa-triangle-exclamation" style={{ marginLeft: '6px' }} title="A soma dos prêmios deve ser idealmente 100%" />}
          </span>
        </div>
      </div>

      {/* Nota educacional */}
      <p style={{ fontSize: '0.65rem', color: '#475569', fontStyle: 'italic', margin: '0.75rem 0 0', lineHeight: 1.5 }}>
        A estrutura de premiação determina o &ldquo;Bubble Factor&rdquo; e o Risk Premium de cada jogador.
        Quanto mais plana a estrutura, menor o impacto do ICM nas decisões.
      </p>
    </div>
  );
}
