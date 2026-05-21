'use client';

/**
 * IDENTITY: Painel de Frequências ICM Pós-Flop (multi-street)
 * PATH: src/components/simulator/panels/NashPanel.tsx
 * ROLE: Exibe distorção ICM por ação em flop/turn/river via seletor de street.
 *       Tabs mostram o RP escalado por street; action rows refletem a street ativa.
 * BINDING: [engine/types.ts (IcmDistortionResult), engine/nashSolver.ts (solveIcmDistortion), simulator.module.css]
 *
 * ESTILOS: todas as cores usam var(--sim-*) do simulator.module.css,
 * que por sua vez cascateiam de var(--global) do globals.css.
 * Mudanças de paleta no site propagam automaticamente.
 */

import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import type { NashResult, ChipEvFreqs, FreqResult, StreetChipEvFreqs } from '../engine/types';
import AnimatedNumber from '../ui/AnimatedNumber';
import styles from '../simulator.module.css';

interface NashPanelProps {
  nashFlop: NashResult;
  nashTurn: NashResult;
  nashRiver: NashResult;
  streetFreqs: StreetChipEvFreqs;
  streetRps: {
    flop: { ip: number; oop: number };
    turn: { ip: number; oop: number };
    river: { ip: number; oop: number };
  };
  aggressionFactor: number;
  onStreetFreqChange: (street: keyof StreetChipEvFreqs, freqs: ChipEvFreqs) => void;
  onAggressionChange: (value: number) => void;
}

// Tooltip via portal — renderiza no body, escapa backdrop-filter e overflow:hidden
function InfoTooltip({ text }: { text: string }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const ref = useRef<HTMLSpanElement>(null);

  function handleEnter() {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ x: r.left + r.width / 2, y: r.top - 6 });
  }

  const tooltipEl = pos && typeof document !== 'undefined'
    ? ReactDOM.createPortal(
      <span style={{
        position: 'fixed',
        top: pos.y,
        left: pos.x,
        transform: 'translate(-50%, -100%)',
        width: '260px',
        background: 'var(--sim-bg-panel, #0f172a)',
        border: '1px solid rgba(99,102,241,0.35)',
        borderRadius: '6px',
        padding: '0.5rem 0.7rem',
        fontSize: '0.65rem',
        color: 'var(--sim-text-main)',
        lineHeight: 1.55,
        zIndex: 9999,
        pointerEvents: 'none',
        whiteSpace: 'normal',
        boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
      }}>
        {text}
      </span>,
      document.body
    )
    : null;

  return (
    <span
      ref={ref}
      style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '3px', cursor: 'help' }}
      onMouseEnter={handleEnter}
      onMouseLeave={() => setPos(null)}
    >
      <span style={{ fontSize: '0.62rem', color: 'var(--sim-text-dim)', lineHeight: 1 }}>ⓘ</span>
      {tooltipEl}
    </span>
  );
}

// Formata delta em pontos percentuais com sinal
function fmt(delta: number): string {
  const v = delta.toFixed(0);
  return delta >= 0 ? `+${v}` : `${v}`;
}

// Cor do delta via CSS vars — propaga mudanças de paleta automaticamente
function deltaColor(delta: number): string {
  if (delta > 1) return 'var(--sim-color-emerald)';
  if (delta < -1) return 'var(--sim-color-rose-light)';
  return 'var(--sim-text-faint)';
}

// Input numérico para frequência ChipEV
function FreqInput({
  value,
  field,
  freqs,
  onChange,
}: {
  value: number;
  field: keyof ChipEvFreqs;
  freqs: ChipEvFreqs;
  onChange: (freqs: ChipEvFreqs) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      <input
        type="number"
        min="0"
        max="100"
        step="1"
        value={value}
        aria-label={`ChipEV ${field.replaceAll('_', ' ')} (%)`}
        onChange={(e) => onChange({ ...freqs, [field]: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
        style={{
          width: '56px',
          padding: '0.18rem 0.25rem',
          borderRadius: 'var(--radius-md, 4px)',
          background: 'var(--sim-bg-subpanel)',
          border: '1px solid var(--sim-border-light)',
          color: 'var(--sim-text-subtle)',
          fontSize: '0.68rem',
          fontFamily: 'var(--sim-font-mono)',
          fontWeight: 600,
          textAlign: 'right',
          outline: 'none',
        }}
      />
      <span style={{ fontSize: '0.58rem', color: 'var(--sim-text-subtle)' }}>% freq</span>
    </div>
  );
}

// Linha de ação: label | chipEv input | seta | ICM (center ± spread) | delta
function ActionRow({
  label,
  labelTooltip,
  chipEv,
  result,
  field,
  accent,
  freqs,
  onChange,
}: {
  label: string;
  labelTooltip?: string;
  chipEv: number;
  result: FreqResult;
  field: keyof ChipEvFreqs;
  accent: string;
  freqs: ChipEvFreqs;
  onChange: (freqs: ChipEvFreqs) => void;
}) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '60px 72px 24px 1fr 64px',
      alignItems: 'center',
      gap: '0.4rem',
      padding: '0.35rem 0',
      borderBottom: '1px solid rgba(255,255,255,0.03)',
    }}>
      {/* Label */}
      <span style={{
        fontSize: '0.58rem',
        fontWeight: 800,
        color: accent,
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
      }}>
        {label}
        {labelTooltip && <InfoTooltip text={labelTooltip} />}
      </span>

      {/* ChipEV editável */}
      <FreqInput value={chipEv} field={field} freqs={freqs} onChange={onChange} />

      {/* Seta separadora */}
      <span style={{ fontSize: '0.6rem', color: 'var(--sim-text-dim)', textAlign: 'center' }}>→</span>

      {/* ICM: center ± spread */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span className={styles.dataMono} style={{
          fontSize: '0.9rem',
          fontWeight: 800,
          color: 'var(--sim-text-main)',
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.02em',
        }}>
          <AnimatedNumber value={result.center} suffix="%" />
        </span>
        <span style={{
          fontSize: '0.58rem',
          color: 'var(--sim-text-dim)',
          fontFamily: 'var(--sim-font-mono)',
          fontVariantNumeric: 'tabular-nums',
        }}>
          ±{result.spread.toFixed(0)}
        </span>
      </div>

      {/* Delta */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
        <span style={{
          fontSize: '0.6rem',
          fontWeight: 700,
          color: deltaColor(result.delta),
          fontFamily: 'var(--sim-font-mono)',
          fontVariantNumeric: 'tabular-nums',
          textAlign: 'right',
          lineHeight: 1,
        }}>
          {fmt(result.delta)}
        </span>
        {/* Sparkline de Contração/Expansão (Zero-centered) */}
        <div style={{
          width: '100%',
          height: '4px',
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '2px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${result.delta >= 0 ? 50 : Math.max(0, 50 - Math.abs(result.delta))}%`,
            width: `${Math.min(50, Math.abs(result.delta))}%`,
            background: deltaColor(result.delta),
            borderRadius: '1px',
            transition: 'all 0.4s ease'
          }} />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.15)' }} />
        </div>
      </div>
    </div>
  );
}

export default function NashPanel({
  nashFlop,
  nashTurn,
  nashRiver,
  streetFreqs,
  streetRps,
  aggressionFactor,
  onStreetFreqChange,
  onAggressionChange,
}: Readonly<NashPanelProps>) {
  // Street ativa — controla qual conjunto de dados é exibido nas action rows
  const [activeStreet, setActiveStreet] = useState<'flop' | 'turn' | 'river'>('flop');

  // Mapa de dados por street — evita if/else espalhados pelo JSX
  const streetData = {
    flop: { nash: nashFlop, freqs: streetFreqs.flop, rps: streetRps.flop, label: 'FLOP', color: 'var(--sim-color-indigo)' },
    turn: { nash: nashTurn, freqs: streetFreqs.turn, rps: streetRps.turn, label: 'TURN', color: 'var(--sim-color-emerald)' },
    river: { nash: nashRiver, freqs: streetFreqs.river, rps: streetRps.river, label: 'RIVER', color: 'var(--sim-color-rose)' },
  };

  const current = streetData[activeStreet];
  const { deltaRp, bExponent } = current.nash;

  const deltaSign = deltaRp >= 0 ? '+' : '';
  const deltaLabel = `${deltaSign}${deltaRp.toFixed(1)} p.p.`;
  const deltaLabelColor = deltaRp > 1
    ? 'var(--sim-color-amber)'
    : deltaRp < -1
      ? 'var(--sim-color-indigo-light)'
      : 'var(--sim-text-faint)';

  return (
    <div className={styles.glassPanel} style={{ padding: '1.25rem 1.5rem' }}>

      {/* Header: título + parâmetros do modelo */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '0.3rem',
        }}>
          <div>
            <h3 style={{
              margin: 0,
              fontSize: '0.65rem',
              fontWeight: 900,
              color: 'var(--sim-text-main)',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
            }}>
              Frequências ICM por Street
            </h3>
            <p style={{
              margin: '0.25rem 0 0',
              fontSize: '0.6rem',
              color: 'var(--sim-text-dim)',
              lineHeight: 1.45,
            }}>
              Como o ICM distorce cada ação em relação ao equilíbrio GTO base — por flop, turn e river.
            </p>
          </div>

          {/* Parâmetros do modelo da street ativa */}
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexShrink: 0 }}>
            <span style={{
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
              background: 'rgba(15,23,42,0.6)',
              border: '1px solid rgba(255,255,255,0.07)',
              fontSize: '0.58rem',
              fontWeight: 700,
              color: deltaLabelColor,
              fontFamily: 'var(--sim-font-mono)',
              fontVariantNumeric: 'tabular-nums',
              display: 'inline-flex',
              alignItems: 'center',
            }}>
              ΔRP {deltaLabel}
              <InfoTooltip text="ΔRP = Vantagem de Risco (Risk Premium IP − OOP). Positivo = IP sob maior pressão ICM." />
            </span>
            <span style={{
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
              background: 'rgba(15,23,42,0.6)',
              border: '1px solid rgba(255,255,255,0.07)',
              fontSize: '0.58rem',
              fontWeight: 700,
              color: 'var(--sim-text-subtle)',
              fontFamily: 'var(--sim-font-mono)',
              fontVariantNumeric: 'tabular-nums',
              display: 'inline-flex',
              alignItems: 'center',
            }}>
              Curv. {bExponent.toFixed(2)}
              <InfoTooltip text="Expoente da curva côncava: mede como a pressão ICM amortece conforme o RP médio aumenta. Próximo de 1 = quase linear; próximo de 0 = muito côncavo." />
            </span>
          </div>
        </div>
      </div>

      {/* Seletor de street — tabs compactos com RP escalado por street */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem' }}>
        {(['flop', 'turn', 'river'] as const).map(s => {
          const d = streetData[s];
          const isActive = s === activeStreet;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setActiveStreet(s)}
              style={{
                flex: 1,
                padding: '0.4rem 0',
                borderRadius: '6px',
                border: `1px solid ${isActive ? d.color : 'rgba(255,255,255,0.06)'}`,
                background: isActive ? `${d.color}18` : 'transparent',
                color: isActive ? d.color : 'var(--sim-text-subtle)',
                fontSize: '0.58rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                lineHeight: 1.6,
              }}
            >
              {d.label}
              <br />
              <span style={{ fontSize: '0.58rem', fontFamily: 'var(--sim-font-mono)', fontVariantNumeric: 'tabular-nums', color: 'var(--sim-text-dim)', opacity: isActive ? 1 : 0.7 }}>
                IP {d.rps.ip.toFixed(1)}% · OOP {d.rps.oop.toFixed(1)}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Cabeçalho das colunas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '60px 72px 24px 1fr 64px',
        gap: '0.4rem',
        marginBottom: '0.15rem',
        paddingBottom: '0.4rem',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <span style={{ fontSize: '0.58rem', color: 'var(--sim-text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Ação</span>
        <span style={{ fontSize: '0.58rem', color: 'var(--sim-text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center' }}>
          Freq. GTO Base
          <InfoTooltip text="Com que frequência o solver usa essa ação neste spot, sem ICM. Não é o tamanho da aposta — é de quantas mãos você a executa. Insira os valores do seu solver." />
        </span>
        <span />
        <span style={{ fontSize: '0.58rem', color: 'var(--sim-text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center' }}>
          Com ICM ±margem
          <InfoTooltip text="Estimativa de quanto você deveria executar essa ação levando o ICM em conta. A margem (±) indica que o modelo não é exato: use como referência direcional, não como número absoluto." />
        </span>
        <span style={{ fontSize: '0.58rem', color: 'var(--sim-text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          Δ p.p.
          <InfoTooltip text="1 p.p. = 1% de frequência dessa ação. Δ = −15: a ação encolhe 15% — ex., de 60% para 45%. Os 15% de combos mais fracos saem primeiro: bluffs mais pobres, valor mais thin. Positivo: a ação expande — combos que o solver descartava passam a ser viáveis." />
        </span>
      </div>

      {/* IP: ações da street ativa */}
      <div style={{ marginBottom: '0.5rem' }}>
        <div style={{
          fontSize: '0.58rem',
          fontWeight: 700,
          color: 'var(--sim-color-indigo)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          paddingTop: '0.5rem',
          paddingBottom: '0.1rem',
        }}>
          IP — Agressor (In Position)
        </div>
        <ActionRow
          label="Check"
          chipEv={current.freqs.ip_check}
          result={current.nash.ip.check}
          field="ip_check"
          accent="var(--sim-color-indigo-light)"
          freqs={current.freqs}
          onChange={(f) => onStreetFreqChange(activeStreet, f)}
        />
        <ActionRow
          label="Bet S"
          labelTooltip="Sizing reduzido (ex: 33% do pote). Insira com que frequência o solver usa este tamanho de aposta neste spot. Sob ICM, este sizing resiste — diminui, mas persiste mesmo sob alta pressão."
          chipEv={current.freqs.ip_bet_small}
          result={current.nash.ip.bet_small}
          field="ip_bet_small"
          accent="var(--sim-color-indigo-light)"
          freqs={current.freqs}
          onChange={(f) => onStreetFreqChange(activeStreet, f)}
        />
        <ActionRow
          label="Bet L"
          labelTooltip="Sizing elevado (ex: 75–100% do pote). Insira com que frequência o solver usa este tamanho de aposta neste spot. Sob ICM, este sizing colapsa primeiro — o modelo o suprime muito mais do que o Bet S. Se o solver não oferece dois sizings neste spot, deixe em 0."
          chipEv={current.freqs.ip_bet_large}
          result={current.nash.ip.bet_large}
          field="ip_bet_large"
          accent="var(--sim-color-indigo-light)"
          freqs={current.freqs}
          onChange={(f) => onStreetFreqChange(activeStreet, f)}
        />
      </div>

      {/* OOP: ações da street ativa */}
      <div style={{ marginBottom: '1.1rem' }}>
        <div style={{
          fontSize: '0.58rem',
          fontWeight: 700,
          color: 'var(--sim-color-rose)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          paddingTop: '0.5rem',
          paddingBottom: '0.1rem',
        }}>
          OOP — Defensor (Out of Position)
        </div>
        <ActionRow
          label="Call"
          chipEv={current.freqs.oop_call}
          result={current.nash.oop.call}
          field="oop_call"
          accent="var(--sim-color-rose-light)"
          freqs={current.freqs}
          onChange={(f) => onStreetFreqChange(activeStreet, f)}
        />
        <ActionRow
          label="Fold"
          chipEv={current.freqs.oop_fold}
          result={current.nash.oop.fold}
          field="oop_fold"
          accent="var(--sim-color-rose-light)"
          freqs={current.freqs}
          onChange={(f) => onStreetFreqChange(activeStreet, f)}
        />
        <ActionRow
          label="Raise"
          chipEv={current.freqs.oop_raise}
          result={current.nash.oop.raise}
          field="oop_raise"
          accent="var(--sim-color-rose-light)"
          freqs={current.freqs}
          onChange={(f) => onStreetFreqChange(activeStreet, f)}
        />
      </div>

      {/* Aggression Factor */}
      <div style={{
        background: 'var(--sim-bg-subpanel)',
        border: '1px solid var(--sim-border-light)',
        borderRadius: 'var(--sim-radius-md)',
        padding: '0.85rem 1.1rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
          <span style={{
            fontSize: '0.58rem',
            fontWeight: 700,
            color: 'var(--sim-text-subtle)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>
            Fator de Agressividade
          </span>
          <span className={styles.dataMono} style={{
            fontSize: '0.8rem',
            fontWeight: 800,
            color: aggressionFactor < 0.9
              ? 'var(--sim-color-indigo-light)'
              : aggressionFactor > 1.1
                ? 'var(--sim-color-amber)'
                : 'var(--sim-color-emerald)',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.02em',
          }}>
            {aggressionFactor.toFixed(1)}×
          </span>
        </div>
        <input
          type="range"
          min="0.5"
          max="1.5"
          step="0.1"
          value={aggressionFactor}
          aria-label="Fator de Agressividade"
          onChange={(e) => onAggressionChange(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--sim-color-indigo)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
          <span style={{ fontSize: '0.58rem', color: 'var(--sim-text-dim)', fontVariantNumeric: 'tabular-nums' }}>Passivo 0.5×</span>
          <span style={{ fontSize: '0.58rem', color: 'var(--sim-text-dim)', fontVariantNumeric: 'tabular-nums' }}>GTO 1.0×</span>
          <span style={{ fontSize: '0.58rem', color: 'var(--sim-text-dim)', fontVariantNumeric: 'tabular-nums' }}>Agressivo 1.5×</span>
        </div>
      </div>

    </div>
  );
}
