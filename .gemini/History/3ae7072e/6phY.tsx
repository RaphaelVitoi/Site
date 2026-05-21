'use client';

/**
 * IDENTITY: Painel de Perspectiva e Esperança Matemática
 * PATH: src/components/simulator/panels/PerspectivePanel.tsx
 * ROLE: Visualização do framework original de Raphael Vitoi (2026):
 *       Perspectiva (distribuição posicional) + Esperança (ganho esperado em equity).
 *       Exibe: positionProbs do hero, deltas win/lose, Esperança vs ICM EV puro,
 *       Externalidade, Tier Shift e Insight textual.
 * BINDING: [lib/perspectiva.ts, simulator.module.css]
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  calculateEsperanca,
  TIER_LABELS,
  TIER_COLORS,
  type EsperancaResult,
  type StackTier,
} from '../../../lib/perspectiva';
import styles from '../simulator.module.css';

// === PRESETS ===

interface Preset {
  label: string;
  stacks: number[];
  names: string[];
  prizes: number[];
  heroIdx: number;
  villainIdx: number;
  potSize: number;
  heroCost: number;
  winProb: number;
}

const PRESETS: Preset[] = [
  {
    label: 'Bolha FT',
    stacks: [120, 80, 60, 40],
    names: ['Hero', 'Villain', 'Jogador 3', 'Jogador 4'],
    prizes: [50, 30, 20],
    heroIdx: 0,
    villainIdx: 1,
    potSize: 60,
    heroCost: 30,
    winProb: 0.55,
  },
  {
    label: 'HU Push',
    stacks: [55, 45],
    names: ['Hero', 'Villain'],
    prizes: [65, 35],
    heroIdx: 0,
    villainIdx: 1,
    potSize: 45,
    heroCost: 45,
    winProb: 0.52,
  },
  {
    label: 'CL vs Short',
    stacks: [200, 30, 80, 90],
    names: ['Hero (CL)', 'Short', 'Jogador 3', 'Jogador 4'],
    prizes: [50, 30, 20],
    heroIdx: 0,
    villainIdx: 1,
    potSize: 30,
    heroCost: 30,
    winProb: 0.7,
  },
  {
    label: '3-Way Bolha',
    stacks: [60, 60, 30],
    names: ['Hero', 'Villain', 'Short'],
    prizes: [60, 40],
    heroIdx: 0,
    villainIdx: 1,
    potSize: 40,
    heroCost: 20,
    winProb: 0.5,
  },
];

// === HELPERS VISUAIS ===

const MONO: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
};

function badge(color: string, bg: string, text: string) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.15rem 0.45rem',
      borderRadius: '5px',
      background: bg,
      color,
      fontSize: '0.58rem',
      fontWeight: 700,
      ...MONO,
    }}>
      {text}
    </span>
  );
}

function deltaChip(value: number, suffix = '%') {
  const pos = value >= 0;
  const color = pos ? '#10b981' : '#f43f5e';
  const bg = pos ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)';
  const sign = pos ? '+' : '';
  return badge(color, bg, `${sign}${value.toFixed(2)}${suffix}`);
}

function tierBadge(tier: StackTier) {
  const color = TIER_COLORS[tier];
  return badge(color, `${color}22`, TIER_LABELS[tier]);
}

// Barra de probabilidade posicional
function ProbBar({ prob, color, label }: { prob: number; color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
      <span style={{ width: '22px', fontSize: '0.58rem', color: '#64748b', textAlign: 'right', flexShrink: 0 }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '6px', background: 'rgba(30,41,59,0.6)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${Math.min(100, prob * 100)}%`,
          background: color,
          borderRadius: '3px',
          transition: 'width 0.7s cubic-bezier(0.16,1,0.3,1)',
        }} />
      </div>
      <span className={styles.dataMono} style={{ width: '42px', fontSize: '0.6rem', color, textAlign: 'right', flexShrink: 0 }}>
        {(prob * 100).toFixed(1)}%
      </span>
    </div>
  );
}

// Painel de positionProbs com 3 estados (atual, win, lose)
function PerspectiveBlock({
  label,
  probs,
  color,
  prizes,
}: {
  label: string;
  probs: number[];
  color: string;
  prizes: number[];
}) {
  const k = prizes.length;
  return (
    <div style={{
      background: 'rgba(15,23,42,0.6)',
      border: `1px solid ${color}33`,
      borderRadius: '10px',
      padding: '0.65rem 0.75rem',
    }}>
      <div style={{ fontSize: '0.58rem', fontWeight: 900, color, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>
        {label}
      </div>
      {Array.from({ length: k }).map((_, i) => (
        <ProbBar
          key={i}
          prob={probs[i] ?? 0}
          color={i === 0 ? '#10b981' : i === 1 ? '#6366f1' : '#94a3b8'}
          label={`${i + 1}°`}
        />
      ))}
    </div>
  );
}

// Linha de stat resumo
function StatRow({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0.3rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <span style={{ fontSize: '0.6rem', color: '#64748b' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {sub && <span className={styles.dataMono} style={{ fontSize: '0.58rem', color: '#475569' }}>{sub}</span>}
        <span className={styles.dataMono} style={{ fontSize: '0.68rem', fontWeight: 700, color: color ?? '#e2e8f0' }}>
          {value}
        </span>
      </div>
    </div>
  );
}

// Geração de insight textual baseado no resultado
function buildInsight(result: EsperancaResult): string {
  const { heroName, currentTier, winTier, loseTier, tierShift, tierDirection, esperancaPct, externalityPct, deltaWinPct, deltaLosePct, winProb: _wp } = result as EsperancaResult & { winProb?: number };

  // Formular insight sem winProb direto (não está no tipo), derivar da Esperança
  const positive = esperancaPct >= 0;
  const externalPos = externalityPct >= 0;
  const externalSig = Math.abs(externalityPct) >= 0.5;

  const parts: string[] = [];

  if (positive) {
    parts.push(`A decisão gera Esperança positiva de ${esperancaPct >= 0 ? '+' : ''}${esperancaPct.toFixed(2)}% — ação com valor ICM real.`);
  } else {
    parts.push(`A decisão destrói ${Math.abs(esperancaPct).toFixed(2)}% de equity de torneio — pressão ICM contra o call.`);
  }

  if (tierShift) {
    if (tierDirection === 'up') {
      parts.push(`Ganhar eleva ${heroName} de ${TIER_LABELS[currentTier]} para ${TIER_LABELS[winTier]} — mudança de escalão com impacto estrutural na dinâmica de mesa.`);
    } else {
      parts.push(`Perder degrada ${heroName} de ${TIER_LABELS[currentTier]} para ${TIER_LABELS[loseTier]} — risco de eliminação ou curto severo.`);
    }
  }

  if (externalSig) {
    if (externalPos) {
      parts.push(`A Externalidade é positiva (+${externalityPct.toFixed(2)}%): os efeitos sobre os outros jogadores favorecem o hero além do ICM EV simples do pot.`);
    } else {
      parts.push(`A Externalidade é negativa (${externalityPct.toFixed(2)}%): o pot ICM EV superestima o ganho real, pois redistribuir fichas beneficia os demais mais do que o hero.`);
    }
  }

  const asym = Math.abs(deltaWinPct) / (Math.abs(deltaLosePct) || 0.01);
  if (asym < 0.8) {
    parts.push(`Assimetria desfavorável: perder custa proporcionalmente mais do que ganhar vale — cautela ICM recomendada.`);
  } else if (asym > 1.5) {
    parts.push(`Assimetria favorável: o upside de ganhar supera o downside de perder em termos de equity — contexto propício.`);
  }

  return parts.join(' ');
}

// === COMPONENTE PRINCIPAL ===

export default function PerspectivePanel() {
  // --- Estado: stacks e nomes ---
  const [playerCount, setPlayerCount] = useState(4);
  const [stacks, setStacks] = useState<number[]>([120, 80, 60, 40]);
  const [names, setNames] = useState<string[]>(['Hero', 'Villain', 'Jogador 3', 'Jogador 4']);

  // --- Estado: prizes ---
  const [prizes, setPrizes] = useState<number[]>([50, 30, 20]);

  // --- Estado: parâmetros de decisão ---
  const [heroIdx, setHeroIdx] = useState(0);
  const [villainIdx, setVillainIdx] = useState(1);
  const [potSize, setPotSize] = useState(60);
  const [heroCost, setHeroCost] = useState(30);
  const [winProb, setWinProb] = useState(0.55);

  // --- Cálculo memoizado ---
  const result: EsperancaResult | null = useMemo(() => {
    const activeStacks = stacks.slice(0, playerCount);
    const activeNames = names.slice(0, playerCount);
    if (activeStacks.length < 2 || activeStacks.some(s => s < 0)) return null;
    if (heroIdx >= playerCount || villainIdx >= playerCount) return null;
    if (heroIdx === villainIdx) return null;
    if (potSize <= 0 || heroCost < 0 || winProb < 0 || winProb > 1) return null;
    try {
      return calculateEsperanca(activeStacks, prizes, activeNames, heroIdx, villainIdx, potSize, heroCost, winProb);
    } catch {
      return null;
    }
  }, [stacks, names, prizes, playerCount, heroIdx, villainIdx, potSize, heroCost, winProb]);

  const insight = useMemo(() => {
    if (!result) return null;
    return buildInsight(result);
  }, [result]);

  // --- Handlers ---
  const updateStack = useCallback((i: number, v: number) => {
    setStacks(prev => prev.map((s, idx) => idx === i ? Math.max(0, v) : s));
  }, []);

  const updateName = useCallback((i: number, v: string) => {
    setNames(prev => prev.map((n, idx) => idx === i ? v : n));
  }, []);

  const updatePrize = useCallback((i: number, v: number) => {
    setPrizes(prev => prev.map((p, idx) => idx === i ? Math.max(0, v) : p));
  }, []);

  const loadPreset = useCallback((p: Preset) => {
    const count = p.stacks.length;
    setPlayerCount(count);
    setStacks([...p.stacks, ...Array(8 - count).fill(0)]);
    setNames([...p.names, ...Array(8 - count).fill('').map((_, i) => `Jogador ${count + i + 1}`)]);
    setPrizes([...p.prizes]);
    setHeroIdx(p.heroIdx);
    setVillainIdx(p.villainIdx);
    setPotSize(p.potSize);
    setHeroCost(p.heroCost);
    setWinProb(p.winProb);
  }, []);

  const addPlayer = useCallback(() => {
    if (playerCount >= 8) return;
    setPlayerCount(n => n + 1);
    setStacks(prev => {
      const next = [...prev];
      next[playerCount] = 20;
      return next;
    });
    setNames(prev => {
      const next = [...prev];
      next[playerCount] = `Jogador ${playerCount + 1}`;
      return next;
    });
  }, [playerCount]);

  const removePlayer = useCallback(() => {
    if (playerCount <= 2) return;
    const newCount = playerCount - 1;
    setPlayerCount(newCount);
    if (heroIdx >= newCount) setHeroIdx(0);
    if (villainIdx >= newCount) setVillainIdx(Math.min(1, newCount - 1));
  }, [playerCount, heroIdx, villainIdx]);

  const addPrize = useCallback(() => {
    setPrizes(prev => [...prev, 10]);
  }, []);

  const removePrize = useCallback(() => {
    setPrizes(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
  }, []);

  // --- Render helpers ---
  const inputStyle: React.CSSProperties = {
    background: '#0a0f1c',
    border: '1px solid #334155',
    borderRadius: '6px',
    color: '#e2e8f0',
    padding: '0.35rem 0.5rem',
    fontSize: '0.65rem',
  };

  const numInputStyle: React.CSSProperties = {
    ...inputStyle,
    color: '#818cf8',
    fontFamily: "'JetBrains Mono', monospace",
    textAlign: 'right',
    width: '64px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.58rem',
    fontWeight: 900,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    marginBottom: '0.4rem',
    display: 'block',
  };

  const sectionStyle: React.CSSProperties = {
    background: 'rgba(15,23,42,0.6)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '0.75rem',
    marginBottom: '1rem',
  };

  return (
    <div className={styles.glassPanel} style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '0.65rem', fontWeight: 900, color: 'var(--sim-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            Perspectiva &amp; Esperança Matemática
          </h3>
          <p style={{ margin: '0.3rem 0 0', fontSize: '0.58rem', color: 'var(--sim-text-dim)', lineHeight: 1.5 }}>
            Framework original Raphael Vitoi · Malmuth-Harville posicional
          </p>
        </div>
        <span style={{
          fontSize: '0.58rem',
          fontWeight: 700,
          color: 'var(--sim-color-indigo)',
          background: 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: '6px',
          padding: '0.25rem 0.6rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          Original
        </span>
      </div>

      {/* Presets rápidos */}
      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => loadPreset(p)}
            style={{
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              background: 'rgba(30,41,59,0.5)',
              border: '1px solid rgba(255,255,255,0.05)',
              color: 'var(--sim-text-subtle)',
              fontSize: '0.58rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Grid principal: inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {/* Stacks */}
        <div style={sectionStyle}>
          <span style={labelStyle}>Stacks</span>
          {Array.from({ length: playerCount }).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.35rem', alignItems: 'center' }}>
              <input
                value={names[i] ?? `Jogador ${i + 1}`}
                onChange={(e) => updateName(i, e.target.value)}
                style={{ ...inputStyle, flex: 1, minWidth: 0 }}
              />
              <input
                type="number"
                min={0}
                value={stacks[i] ?? 0}
                onChange={(e) => updateStack(i, parseInt(e.target.value) || 0)}
                style={numInputStyle}
              />
            </div>
          ))}
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem' }}>
            <button
              onClick={addPlayer}
              disabled={playerCount >= 8}
              style={{
                flex: 1,
                padding: '0.3rem',
                borderRadius: '6px',
                background: 'rgba(30,41,59,0.5)',
                border: '1px dashed #334155',
                color: playerCount >= 8 ? '#334155' : 'var(--sim-text-dim)',
                fontSize: '0.58rem',
                fontWeight: 700,
                cursor: playerCount >= 8 ? 'default' : 'pointer',
              }}
            >
              + Jogador
            </button>
            {playerCount > 2 && (
              <button
                onClick={removePlayer}
                style={{
                  padding: '0.3rem 0.6rem',
                  borderRadius: '6px',
                  background: 'rgba(225,29,72,0.08)',
                  border: '1px solid rgba(225,29,72,0.2)',
                  color: 'var(--sim-color-rose)',
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

        {/* Payouts */}
        <div style={sectionStyle}>
          <span style={labelStyle}>Payouts (%)</span>
          {prizes.map((prize, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.35rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.58rem', color: '#64748b', width: '20px', textAlign: 'right', flexShrink: 0 }}>
                {idx + 1}&ordm;
              </span>
              <input
                type="number"
                min={0}
                value={prize}
                onChange={(e) => updatePrize(idx, parseFloat(e.target.value) || 0)}
                style={{ ...numInputStyle, flex: 1, width: 'auto', color: 'var(--sim-color-emerald)' }}
              />
            </div>
          ))}
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem' }}>
            <button
              onClick={addPrize}
              style={{
                flex: 1,
                padding: '0.3rem',
                borderRadius: '6px',
                background: 'rgba(30,41,59,0.5)',
                border: '1px dashed #334155',
                color: 'var(--sim-text-dim)',
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
                  background: 'rgba(225,29,72,0.08)',
                  border: '1px solid rgba(225,29,72,0.2)',
                  color: 'var(--sim-color-rose)',
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

      {/* Parâmetros da decisão */}
      <div style={sectionStyle}>
        <span style={labelStyle}>Parâmetros da Decisão</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
          {/* Hero */}
          <div>
            <label style={{ ...labelStyle, color: 'var(--sim-color-indigo-light)' }}>Hero</label>
            <select
              value={heroIdx}
              onChange={(e) => setHeroIdx(Number(e.target.value))}
              style={{ ...inputStyle, width: '100%', color: 'var(--sim-color-indigo-light)' }}
            >
              {Array.from({ length: playerCount }).map((_, i) => (
                <option key={i} value={i}>{names[i] ?? `Jogador ${i + 1}`}</option>
              ))}
            </select>
          </div>

          {/* Villain */}
          <div>
            <label style={{ ...labelStyle, color: 'var(--sim-color-rose)' }}>Villain</label>
            <select
              value={villainIdx}
              onChange={(e) => setVillainIdx(Number(e.target.value))}
              style={{ ...inputStyle, width: '100%', color: 'var(--sim-color-rose)' }}
            >
              {Array.from({ length: playerCount }).map((_, i) => (
                <option key={i} value={i}>{names[i] ?? `Jogador ${i + 1}`}</option>
              ))}
            </select>
          </div>

          {/* Pot Size */}
          <div>
            <label style={labelStyle}>Pot (fichas)</label>
            <input
              type="number"
              min={0}
              value={potSize}
              onChange={(e) => setPotSize(Math.max(0, parseInt(e.target.value) || 0))}
              style={{ ...numInputStyle, width: '100%' }}
            />
          </div>

          {/* Hero Cost */}
          <div>
            <label style={labelStyle}>Custo do Hero</label>
            <input
              type="number"
              min={0}
              value={heroCost}
              onChange={(e) => setHeroCost(Math.max(0, parseInt(e.target.value) || 0))}
              style={{ ...numInputStyle, width: '100%' }}
            />
          </div>

          {/* Win Probability */}
          <div>
            <label style={labelStyle}>P(Win) 0-1</label>
            <input
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={winProb}
              onChange={(e) => setWinProb(Math.min(1, Math.max(0, parseFloat(e.target.value) || 0)))}
              style={{ ...numInputStyle, width: '100%', color: 'var(--sim-color-emerald)' }}
            />
          </div>
        </div>

        {/* Aviso de conflito hero/villain */}
        {heroIdx === villainIdx && (
          <div style={{
            marginTop: '0.6rem',
            padding: '0.4rem 0.6rem',
            borderRadius: '6px',
            background: 'rgba(244,63,94,0.1)',
            border: '1px solid rgba(244,63,94,0.25)',
            color: 'var(--sim-color-rose)',
            fontSize: '0.58rem',
            fontWeight: 600,
          }}>
            Hero e Villain nao podem ser o mesmo jogador.
          </div>
        )}
      </div>

      {/* Resultado */}
      {result && (
        <>
          {/* Perspectiva: 3 colunas (atual / win / lose) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
            <PerspectiveBlock
              label="Atual"
              probs={result.currentPerspectiva}
              color="var(--sim-text-subtle)"
              prizes={prizes}
            />
            <PerspectiveBlock
              label="Se Ganhar"
              probs={result.winPerspectiva}
              color="var(--sim-color-emerald)"
              prizes={prizes}
            />
            <PerspectiveBlock
              label="Se Perder"
              probs={result.losePerspectiva}
              color="var(--sim-color-rose)"
              prizes={prizes}
            />
          </div>

          {/* Tabela de métricas */}
          <div style={{
            background: 'rgba(15,23,42,0.6)',
            border: '1px solid rgba(99,102,241,0.15)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1rem',
          }}>
            <h4 style={{ fontSize: '0.58rem', fontWeight: 900, color: 'var(--sim-color-indigo-light)', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 0.75rem' }}>
              Análise Quantitativa
            </h4>

            {/* Equity atual */}
            <StatRow
              label="Equity atual"
              value={`${result.currentEquityPct.toFixed(2)}%`}
              sub={`Tier: `}
              color="var(--sim-text-subtle)"
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.3rem', marginBottom: '0.3rem' }}>
              {tierBadge(result.currentTier)}
            </div>

            {/* Delta Win */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: '0.6rem', color: 'var(--sim-text-dim)' }}>
                Delta se ganhar
                <span style={{ marginLeft: '0.4rem' }}>{tierBadge(result.winTier)}</span>
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className={styles.dataMono} style={{ fontSize: '0.58rem', color: 'var(--sim-text-subtle)' }}>
                  {result.winEquityPct.toFixed(2)}%
                </span>
                {deltaChip(result.deltaWinPct)}
              </div>
            </div>

            {/* Delta Lose */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: '0.6rem', color: 'var(--sim-text-dim)' }}>
                Delta se perder
                <span style={{ marginLeft: '0.4rem' }}>{tierBadge(result.loseTier)}</span>
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className={styles.dataMono} style={{ fontSize: '0.58rem', color: 'var(--sim-text-subtle)' }}>
                  {result.loseEquityPct.toFixed(2)}%
                </span>
                {deltaChip(result.deltaLosePct)}
              </div>
            </div>

            {/* Separador */}
            <div style={{ height: '0.6rem' }} />

            {/* Esperança */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: '0.6rem', color: 'var(--sim-color-indigo)', fontWeight: 700 }}>Esperança Matemática</span>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className={styles.dataMono} style={{ fontSize: '0.58rem', color: 'var(--sim-text-subtle)' }}>
                  {result.esperanca >= 0 ? '+' : ''}{result.esperanca.toFixed(2)} chips
                </span>
                {deltaChip(result.esperancaPct)}
              </div>
            </div>

            {/* ICM EV Puro */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: '0.6rem', color: 'var(--sim-text-dim)' }}>ICM EV puro do pot</span>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className={styles.dataMono} style={{ fontSize: '0.58rem', color: 'var(--sim-text-subtle)' }}>
                  {result.potIcmEv >= 0 ? '+' : ''}{result.potIcmEv.toFixed(2)} chips
                </span>
                {deltaChip(result.potIcmEvPct)}
              </div>
            </div>

            {/* Externalidade */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.35rem 0' }}>
              <div>
                <span style={{ fontSize: '0.6rem', color: 'var(--sim-color-amber)', fontWeight: 700 }}>Externalidade</span>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.55rem', color: 'var(--sim-text-subtle)', lineHeight: 1.4 }}>
                  Esperança &minus; ICM EV puro · impacto nos outros jogadores
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {deltaChip(result.externalityPct)}
              </div>
            </div>
          </div>

          {/* Tier Shift */}
          {result.tierShift && (
            <div style={{
              marginBottom: '1rem',
              padding: '0.6rem 0.75rem',
              borderRadius: '10px',
              background: result.tierDirection === 'up'
                ? 'rgba(16,185,129,0.08)'
                : 'rgba(244,63,94,0.08)',
              border: `1px solid ${result.tierDirection === 'up' ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}>
              <i
                className={`fa-solid ${result.tierDirection === 'up' ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}`}
                style={{ color: result.tierDirection === 'up' ? '#10b981' : '#f43f5e', fontSize: '0.9rem' }}
              />
              <div>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: result.tierDirection === 'up' ? '#10b981' : '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Tier Shift ao Ganhar
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {tierBadge(result.currentTier)}
                  <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.5rem', color: '#475569' }} />
                  {tierBadge(result.winTier)}
                </div>
              </div>
            </div>
          )}

          {/* Insight */}
          {insight && (
            <div style={{
              padding: '0.75rem',
              borderRadius: '10px',
              background: 'rgba(99,102,241,0.06)',
              border: '1px solid rgba(99,102,241,0.15)',
              fontSize: '0.6rem',
              color: 'var(--sim-text-main)',
              lineHeight: 1.7,
            }}>
              <i className="fa-solid fa-lightbulb" style={{ color: 'var(--sim-color-indigo-light)', marginRight: '6px' }} />
              {insight}
            </div>
          )}
        </>
      )}

      {/* Estado vazio / erro de configuração */}
      {!result && heroIdx !== villainIdx && (
        <div style={{
          padding: '1.5rem',
          textAlign: 'center',
          color: 'var(--sim-text-subtle)',
          fontSize: '0.65rem',
          borderRadius: '10px',
          background: 'rgba(15,23,42,0.4)',
          border: '1px dashed #334155',
        }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px', color: 'var(--sim-color-amber)' }} />
          Verifique os parametros: stacks positivos, pot &gt; 0, P(Win) entre 0 e 1.
        </div>
      )}
    </div>
  );
}
