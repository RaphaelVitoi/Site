'use client';

/**
 * IDENTITY: Matchup Selector — Pressão de Risco por Confronto
 * PATH: src/components/simulator/panels/MatchupSelector.tsx
 * ROLE: Seleciona agressor e defensor em 3 ambientes de Mesa Final (FT1/FT2/FT3)
 *       e exibe o Risk Premium do confronto via ftEnvironments.ts.
 * BINDING: [engine/ftEnvironments.ts, simulator.module.css]
 */

import React, { useState } from 'react';
import { FT_ENVIRONMENTS, PAYOUTS_10K } from '../engine/ftEnvironments';
import styles from '../simulator.module.css';

function classifyRp(rp: number): { label: string; color: string; badge: string } {
  if (rp >= 40) return { label: 'Death Zone', color: '#ff0055', badge: '☠' };
  if (rp >= 25) return { label: 'Predator Zone', color: '#f59e0b', badge: '⚠' };
  if (rp >= 15) return { label: 'Zona de Pressão', color: '#e11d48', badge: '▲' };
  return { label: 'Zona Normal', color: '#10b981', badge: '●' };
}

function getRpCellStyle(val: number, isDiag: boolean, isHighlighted: boolean) {
  if (isDiag) {
    return { bg: 'rgba(15,23,42,0.2)', color: '#1e293b' };
  }
  if (isHighlighted) {
    return { bg: 'rgba(99,102,241,0.35)', color: '#fff' };
  }
  if (val >= 40) return { bg: 'rgba(255,0,85,0.25)', color: '#ff0055' };
  if (val >= 25) return { bg: 'rgba(245,158,11,0.20)', color: '#f59e0b' };
  if (val >= 15) return { bg: 'rgba(225,29,72,0.15)', color: '#f43f5e' };
  if (val > 0) return { bg: 'rgba(16,185,129,0.10)', color: '#10b981' };
  return { bg: 'rgba(15,23,42,0.3)', color: '#64748b' };
}

export default function MatchupSelector() {
  const [activeEnvId, setActiveEnvId] = useState('FT1');
  const [agressor, setAgressor] = useState<string | null>(null);
  const [defensor, setDefensor] = useState<string | null>(null);

  const env = FT_ENVIRONMENTS.find(e => e.id === activeEnvId)!;

  const handlePlayerClick = (playerId: string) => {
    // Fluxo: clique 1 = agressor, clique 2 = defensor, clique 3 = reinicia
    if (!agressor || (agressor && defensor)) {
      setAgressor(playerId);
      setDefensor(null);
    } else {
      if (playerId === agressor) {
        setAgressor(null);
      } else {
        setDefensor(playerId);
      }
    }
  };

  const handleEnvChange = (id: string) => {
    setActiveEnvId(id);
    setAgressor(null);
    setDefensor(null);
  };

  const rp = agressor && defensor ? (env.rpMatrix[agressor]?.[defensor] ?? null) : null;
  const classification = rp !== null ? classifyRp(rp) : null;

  const agressorData = agressor ? env.stacks.find(p => p.id === agressor) : null;
  const defensorData = defensor ? env.stacks.find(p => p.id === defensor) : null;

  return (
    <div className={styles.glassPanel} style={{ padding: '1.75rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{
          fontSize: '0.58rem',
          fontWeight: 900,
          color: 'var(--sim-color-indigo)',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          margin: '0 0 0.35rem',
        }}>
          Matchup Selector · Mesa Final
        </p>
        <h2 style={{
          fontSize: '1.1rem',
          fontWeight: 800,
          color: 'var(--sim-text-main)',
          margin: '0 0 0.35rem',
          letterSpacing: '-0.02em',
        }}>
          Pressão de Risco por Confronto
        </h2>
        <p style={{ fontSize: '0.78rem', color: 'var(--sim-text-dim)', margin: 0, lineHeight: 1.5 }}>
          Escolha o ambiente de FT, clique no agressor e depois no defensor para ver o RP aplicado.
        </p>
      </div>

      {/* FT Environment Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {FT_ENVIRONMENTS.map(e => {
          const isActive = activeEnvId === e.id;
          return (
            <button
              key={e.id}
              onClick={() => handleEnvChange(e.id)}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '10px',
                border: isActive
                  ? '1px solid rgba(99,102,241,0.5)'
                  : '1px solid rgba(255,255,255,0.05)',
                background: isActive ? '#1e2245' : 'rgba(15,23,42,0.5)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
              }}
            >
              <div style={{
                fontFamily: 'var(--sim-font-mono)',
                fontSize: '0.65rem',
                fontWeight: 900,
                color: isActive ? 'var(--sim-color-indigo-light)' : 'var(--sim-text-subtle)',
                letterSpacing: '-0.01em',
              }}>
                {e.id}
              </div>
              <div style={{
                fontSize: '0.6rem',
                marginTop: '2px',
                color: isActive ? 'var(--sim-color-indigo)' : 'var(--sim-border-light)',
                fontWeight: 600,
              }}>
                {e.title.replace(/^FT \d: /, '')}
              </div>
            </button>
          );
        })}
      </div>

      {/* Descrição do ambiente */}
      <div style={{
        padding: '0.65rem 1rem',
        background: 'rgba(30,41,59,0.3)',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.04)',
        marginBottom: '1.75rem',
        fontSize: '0.78rem',
        color: '#94a3b8',
        fontStyle: 'italic',
        lineHeight: 1.5,
      }}>
        {env.description}
      </div>

      {/* Grid principal: jogadores + resultado */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(220px, 1fr) minmax(200px, 1fr)',
        gap: '1.5rem',
        alignItems: 'start',
        marginBottom: '2rem',
      }}>

        {/* Coluna de jogadores */}
        <div>
          <p style={{
            fontSize: '0.58rem',
            fontWeight: 800,
            color: 'var(--sim-text-dim)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            margin: '0 0 0.6rem',
          }}>
            1º clique <span style={{ color: 'var(--sim-color-indigo)' }}>Agressor</span> · 2º clique <span style={{ color: 'var(--sim-color-rose)' }}>Defensor</span>
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {env.stacks.map(player => {
              const isA = agressor === player.id;
              const isD = defensor === player.id;
              const borderColor = isA
                ? 'rgba(99,102,241,0.45)'
                : isD
                  ? 'rgba(225,29,72,0.45)'
                  : 'rgba(255,255,255,0.04)';
              const bg = isA
                ? 'rgba(99,102,241,0.14)'
                : isD
                  ? 'rgba(225,29,72,0.14)'
                  : 'rgba(30,41,59,0.25)';

              return (
                <button
                  key={player.id}
                  onClick={() => handlePlayerClick(player.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.45rem 0.75rem',
                    borderRadius: '8px',
                    background: bg,
                    border: `1px solid ${borderColor}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    width: '100%',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                    {/* Badge de role */}
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '5px',
                      background: isA ? '#4338ca' : isD ? '#9f1239' : 'rgba(15,23,42,0.8)',
                      border: `1px solid ${borderColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.58rem',
                      fontWeight: 900,
                      color: isA || isD ? '#fff' : 'var(--sim-text-subtle)',
                      flexShrink: 0,
                      fontFamily: 'var(--sim-font-mono)',
                    }}>
                      {isA ? 'A' : isD ? 'D' : player.id.replace('p', '')}
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: isA ? 'var(--sim-color-indigo-light)' : isD ? 'var(--sim-color-rose-light)' : 'var(--sim-text-subtle)',
                      lineHeight: 1.2,
                    }}>
                      {player.pos}
                    </span>
                  </div>
                  <span style={{
                    fontFamily: 'var(--sim-font-mono)',
                    fontVariantNumeric: 'tabular-nums',
                    fontSize: '0.82rem',
                    fontWeight: 900,
                    color: isA ? 'var(--sim-color-indigo)' : isD ? 'var(--sim-color-rose)' : 'var(--sim-text-dim)',
                  }}>
                    {player.bb.toFixed(1)}<span style={{ fontSize: '0.58rem', fontWeight: 600, marginLeft: '2px', opacity: 0.5 }}>bb</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Coluna de resultado */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

          {/* Display do RP */}
          <div style={{
            padding: '1.5rem 1rem',
            borderRadius: '16px',
            background: rp !== null
              ? `linear-gradient(135deg, ${classification!.color}12, rgba(15,23,42,0.6))`
              : 'rgba(15,23,42,0.5)',
            border: `1px solid ${rp !== null ? classification!.color + '33' : 'rgba(255,255,255,0.05)'}`,
            textAlign: 'center',
            minHeight: '155px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.4s ease',
          }}>
            {rp === null ? (
              <>
                <div style={{ fontSize: '2.5rem', opacity: 0.15, marginBottom: '0.5rem', lineHeight: 1 }}>⚔</div>
                <p style={{ fontSize: '0.75rem', color: 'var(--sim-border-light)', margin: 0, fontStyle: 'italic' }}>
                  {!agressor ? 'Escolha o agressor' : 'Escolha o defensor'}
                </p>
              </>
            ) : (
              <>
                <div style={{
                  fontFamily: 'var(--sim-font-mono)',
                  fontVariantNumeric: 'tabular-nums',
                  fontSize: '3.2rem',
                  fontWeight: 900,
                  color: classification!.color,
                  lineHeight: 1,
                  letterSpacing: '-0.04em',
                }}>
                  {rp.toFixed(1)}<span style={{ fontSize: '1.4rem', fontWeight: 700 }}>%</span>
                </div>
                <div style={{
                  fontSize: '0.58rem',
                  color: 'var(--sim-text-dim)',
                  margin: '0.25rem 0 0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}>
                  Risk Premium do Agressor
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '20px',
                  background: classification!.color + '22',
                  border: `1px solid ${classification!.color}55`,
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  color: classification!.color,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}>
                  {classification!.badge} {classification!.label}
                </div>
              </>
            )}
          </div>

          {/* Resumo do matchup */}
          {agressorData && (
            <div style={{
              padding: '0.75rem',
              borderRadius: '10px',
              background: 'rgba(15,23,42,0.5)',
              border: '1px solid rgba(255,255,255,0.04)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: defensorData ? '0.4rem' : 0 }}>
                <span style={{ fontSize: '0.62rem', color: 'var(--sim-color-indigo)', fontWeight: 700 }}>
                  Agressor: {agressorData.pos}
                </span>
                <span style={{ fontFamily: 'var(--sim-font-mono)', fontVariantNumeric: 'tabular-nums', fontSize: '0.65rem', color: 'var(--sim-color-indigo)', fontWeight: 900 }}>
                  {agressorData.bb.toFixed(1)} bb
                </span>
              </div>
              {defensorData && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.62rem', color: 'var(--sim-color-rose)', fontWeight: 700 }}>
                    Defensor: {defensorData.pos}
                  </span>
                  <span style={{ fontFamily: 'var(--sim-font-mono)', fontVariantNumeric: 'tabular-nums', fontSize: '0.65rem', color: 'var(--sim-color-rose)', fontWeight: 900 }}>
                    {defensorData.bb.toFixed(1)} bb
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Interpretação contextual */}
          {rp !== null && (
            <div style={{
              padding: '0.75rem',
              borderRadius: '10px',
              background: 'rgba(30,41,59,0.3)',
              border: '1px solid rgba(255,255,255,0.04)',
              fontSize: '0.72rem',
              color: '#94a3b8',
              lineHeight: 1.55,
            }}>
              {rp >= 40 && (
                <span>RP ≥ 40%: o agressor entra em <strong style={{ color: '#ff0055' }}>Death Zone</strong>. Qualquer aposta
                  expõe equity suficiente para ser explorada com fold elevado pelo defensor. Defender deve ajustar para calls apertados.</span>
              )}
              {rp >= 25 && rp < 40 && (
                <span>RP ≥ 25%: <strong style={{ color: '#f59e0b' }}>Predator Zone</strong>. Agressor tem pressão significativa de ICM
                  — range de 3-bet linear colapsa, defensor expande bluff-catching.</span>
              )}
              {rp >= 15 && rp < 25 && (
                <span>RP 15–25%: <strong style={{ color: '#e11d48' }}>Zona de Pressão</strong>. Ambos têm equity ICM a proteger.
                  Frequências Nash ajustadas para baixo; confronto possível com range seleto.</span>
              )}
              {rp < 15 && (
                <span>RP {'<'} 15%: <strong style={{ color: '#10b981' }}>Zona Normal</strong>. Pressão ICM baixa — frequências próximas ao GTO chipEV.
                  Confronto padrão sem distorção significativa.</span>
              )}
            </div>
          )}

          {/* Botão de reset */}
          {(agressor || defensor) && (
            <button
              onClick={() => { setAgressor(null); setDefensor(null); }}
              style={{
                padding: '0.4rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(30,41,59,0.3)',
                color: '#475569',
                fontSize: '0.62rem',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'color 0.2s',
              }}
            >
              ↺ Limpar seleção
            </button>
          )}
        </div>
      </div>

      {/* Heatmap 9×9 */}
      <div style={{ marginBottom: '2rem' }}>
        <p style={{
          fontSize: '0.58rem',
          fontWeight: 800,
          color: 'var(--sim-text-dim)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          margin: '0 0 0.65rem',
        }}>
          Matriz Completa RP · Agressor (linha) × Defensor (coluna)
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            borderCollapse: 'separate',
            borderSpacing: '3px',
            fontFamily: 'var(--sim-font-mono)',
            fontVariantNumeric: 'tabular-nums',
            fontSize: '0.6rem',
            width: '100%',
          }}>
            <thead>
              <tr>
                <th style={{
                  textAlign: 'left',
                  color: '#334155',
                  fontWeight: 600,
                  padding: '3px 6px',
                  fontSize: '0.58rem',
                  width: '52px',
                }}>
                  A \ D
                </th>
                {env.stacks.map(p => (
                  <th key={p.id} style={{
                    textAlign: 'center',
                    color: defensor === p.id ? '#f43f5e' : '#475569',
                    fontWeight: defensor === p.id ? 900 : 700,
                    padding: '3px 2px',
                    fontSize: '0.58rem',
                    whiteSpace: 'nowrap',
                    minWidth: '32px',
                  }}>
                    {p.pos.split(' ')[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {env.stacks.map(rowPlayer => (
                <tr key={rowPlayer.id}>
                  <td style={{
                    color: agressor === rowPlayer.id ? '#818cf8' : '#64748b',
                    fontWeight: agressor === rowPlayer.id ? 900 : 700,
                    padding: '2px 6px 2px 3px',
                    fontSize: '0.58rem',
                    whiteSpace: 'nowrap',
                  }}>
                    {rowPlayer.pos.split(' ')[0]}
                  </td>
                  {env.stacks.map(colPlayer => {
                    const val = env.rpMatrix[rowPlayer.id]?.[colPlayer.id] ?? 0;
                    const isDiag = rowPlayer.id === colPlayer.id;
                    const isHighlighted = rowPlayer.id === agressor && colPlayer.id === defensor;
                    const { bg, color } = getRpCellStyle(val, isDiag, isHighlighted);

                    return (
                      <td
                        key={colPlayer.id}
                        onClick={() => {
                          if (!isDiag) {
                            setAgressor(rowPlayer.id);
                            setDefensor(colPlayer.id);
                          }
                        }}
                        style={{
                          textAlign: 'center',
                          padding: '4px 2px',
                          borderRadius: '4px',
                          background: bg,
                          color,
                          fontWeight: isHighlighted ? 900 : 700,
                          outline: isHighlighted ? '2px solid #6366f1' : 'none',
                          outlineOffset: '-1px',
                          transition: 'all 0.2s',
                          cursor: isDiag ? 'default' : 'pointer',
                        }}
                      >
                        {isDiag ? '—' : val.toFixed(1)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{
          fontSize: '0.58rem',
          color: '#334155',
          fontStyle: 'italic',
          marginTop: '0.5rem',
          lineHeight: 1.5,
        }}>
          Clique em qualquer célula para selecionar o matchup. Verde {'<'}15% · Rose 15–25% · Amarelo 25–40% · Vermelho ≥40% (Death Zone).
        </p>
      </div>

      {/* Estrutura de premiação */}
      <div>
        <p style={{
          fontSize: '0.58rem',
          fontWeight: 800,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          margin: '0 0 0.65rem',
        }}>
          Estrutura de Premiação — Referência $10k
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '0.4rem',
        }}>
          {PAYOUTS_10K.map((p, i) => (
            <div key={p.pos} style={{
              padding: '0.45rem 0.75rem',
              borderRadius: '8px',
              background: i < 3 ? 'rgba(99,102,241,0.1)' : 'rgba(15,23,42,0.4)',
              border: i < 3 ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(255,255,255,0.04)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <span style={{
                fontSize: '0.62rem',
                color: i < 3 ? '#818cf8' : '#475569',
                fontWeight: 700,
              }}>
                {p.pos}
              </span>
              <span style={{
                fontFamily: 'var(--sim-font-mono)',
                fontVariantNumeric: 'tabular-nums',
                fontSize: '0.62rem',
                color: i < 3 ? 'var(--sim-color-indigo-light)' : 'var(--sim-text-dim)',
                fontWeight: 900,
              }}>
                {p.val}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
