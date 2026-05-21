'use client';

/**
 * IDENTITY: Gauge Circular de Risk Premium (SVG Puro)
 * IDENTITY: Risk Gauge SOTA (Didática Visceral)
 * PATH: src/components/simulator/ui/RiskGauge.tsx
 * ROLE: Renderizar o indicador circular animado de RP com zonas visuais.
 *       Port React puro do Web Component risk-gauge.js.
 * BINDING: [simulator.module.css]
 * ROLE: Visualização tátil e auditiva do Risk Premium. Reage a limiares críticos.
 */

import React, { useMemo } from 'react';
import styles from '../simulator.module.css';
import React, { useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

interface RiskGaugeProps {
  /** Valor do Risk Premium (0-100) */
  value: number;
  /** Label descritivo (ex: "Agressor IP") */
  label: string;
  /** Cor base do gauge (classe tailwind ou hex) */
  color: string;
export interface RiskGaugeProps {
  value: number;
  label?: string;
  pos?: string;
  stack?: string;
  color?: 'pink' | 'indigo';
  threshold?: number;
  opponentValue?: number;
  isMuted?: boolean;
}

// Caminho SVG circular padrão (raio 15.9155, centro 18)
const CIRCLE_PATH = 'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831';
// Sintetizador de Áudio Minimalista (Web Audio API)
const playTone = (type: 'predator' | 'death', intensity: number = 40, isMuted: boolean) => {
  if (isMuted || typeof window === 'undefined') return;

  // Mapa de cores tailwind para hex
  const COLOR_MAP: Record<string, string> = {
    indigo: '#6366f1',
    rose: '#e11d48',
    emerald: '#10b981',
    sky: '#0ea5e9',
    amber: '#f59e0b',
    fuchsia: '#d946ef',
    slate: '#64748b',
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if(!AudioContext) return;

      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if(type === 'predator') {
        // Radar Ping: Lock-on cibernético (agudo e urgente)
        const freq = 1200 + ((intensity - 40) * 25);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.15);
} else if (type === 'death') {
  // Radiation Hazard: Alerta Geiger instável (grave e denso)
  const freq = Math.max(40, 80 - ((intensity - 40) * 1));
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.4);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.4);
}
    } catch (e) {
  // Silencioso em caso de bloqueio de autoplay do navegador
}
};

export default function RiskGauge({ value, label, color }: Readonly<RiskGaugeProps>) {
  const safeValue = Math.max(0, Math.min(100, value));
  const isDeathZone = safeValue >= 40;
  const isHighRisk = safeValue >= 25;
  export default function RiskGauge({
    value,
    label = '--',
    pos = '--',
    stack = '--',
    color = 'indigo',
    threshold = 20,
    opponentValue = 0,
    isMuted = true
  }: RiskGaugeProps) {
    const lastState = useRef<'normal' | 'death' | 'predator'>('normal');
    const hasLoggedEasterEgg = useRef(false);

    // Resolução de cor
    const resolvedColor = useMemo(() => {
      if (isDeathZone) return '#ff0055';
      return COLOR_MAP[color] ?? color;
    }, [color, isDeathZone]);
    // Cálculos de Threshold SOTA
    const safeValue = isNaN(value) ? 0 : value;
    const safeOpponentValue = isNaN(opponentValue) ? 0 : opponentValue;

    const isCritical = safeValue >= threshold;
    const isDeathZone = safeValue >= 40.0;
    const isPredatorZone = safeOpponentValue >= 40.0 && safeValue < 25.0;

    // Escala visual (max RP ~50% para drama visual proporcional)
    const dashPercent = Math.min(100, (safeValue / 50) * 100);
    // Colorimetria Semântica
    const baseColor = color === 'pink' ? '#ec4899' : '#6366f1';
    let strokeColor = baseColor;
    if (isCritical) strokeColor = '#ef4444'; // Red-500
    if (isDeathZone) strokeColor = '#ff0055'; // Neon Pink/Red
    if (isPredatorZone) strokeColor = '#10b981'; // Emerald-500

    // Classe de animação condicional
    const gaugeClass = isDeathZone
      ? styles.gaugeDeathPulse
      : isHighRisk
        ? styles.gaugeHighRisk
        : '';
    // Dash array para a animação do SVG (Baseado num RP máximo prático de ~26% para o círculo fechar visualmente)
    const dash = Math.min(100, Math.max(0, (safeValue / 26) * 100));

    return (
      <div className={styles.gaugeContainer}>
        <div className={styles.gaugeWrap}>
          <svg viewBox="0 0 36 36" className={styles.gaugeSvg}>
            {/* Trilha de fundo */}
            <path
              d={CIRCLE_PATH}
              fill="none"
              stroke="rgba(30, 41, 59, 0.5)"
              strokeWidth="2"
            />
            {/* Arco de valor */}
            <path
              d={CIRCLE_PATH}
              fill="none"
              stroke={resolvedColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={`${dashPercent}, 100`}
              className={`${styles.gaugeArc} ${gaugeClass}`}
              style={{
                filter: `drop-shadow(0 0 ${isDeathZone ? '15px' : '8px'} ${resolvedColor}${isDeathZone ? '' : '80'})`,
              }}
            />
          </svg>
    // Efeito Colateral: Áudio e Easter Egg
    useEffect(() => {
        const currentState = isDeathZone ? 'death' : (isPredatorZone ? 'predator' : 'normal');

          if (currentState !== lastState.current) {
            const intensity = isDeathZone ? safeValue : safeOpponentValue;
          if (currentState === 'predator') playTone('predator', intensity, isMuted);
          if (currentState === 'death') playTone('death', intensity, isMuted);
          lastState.current = currentState;
        }

          {/* Texto central */}
          <div className={styles.gaugeCenterText}>
            {isDeathZone ? (
              <>
                <span
                  className={styles.gaugeIcon}
                  style={{ color: resolvedColor }}
                  aria-label="Death Zone"
                >
                  &#x2622;
                </span>
                <span
                  className={styles.gaugeLabel}
                  style={{ color: resolvedColor }}
                >
                  CRITICAL
                </span>
              </>
            ) : (
              <>
                <span
                  className={styles.gaugeValue}
                  style={isHighRisk ? { color: '#ef4444' } : undefined}
                >
                  {safeValue.toFixed(1)}%
                </span>
                <span
                  className={styles.gaugeLabel}
                  style={{ color: resolvedColor }}
                >
                  RP Colisão
                </span>
              </>
            )}
        // Easter Egg Filosófico (@maverick)
            if (isDeathZone && !hasLoggedEasterEgg.current) {
            const msg = [
                "%c SINGULARIDADE ICM DETECTADA (RP > 40%) ",
            "color: #ff0055; font-weight: bold; font-size: 12px; background: #200010; padding: 4px; border: 1px solid #ff0055;",
            "\nNeste nível de pressão, a matemática sugere que a coragem é apenas uma forma elaborada de suicídio financeiro.",
            "Foldar não é covardia; é darwinismo aplicado.\n",
                "Survival > Accumulation."
            ];
            setTimeout(() => console.log(msg[0], msg[1], msg[2], msg[3], msg[4]), 500);
            hasLoggedEasterEgg.current = true;
        }
    }, [isDeathZone, isPredatorZone, safeValue, safeOpponentValue, isMuted]);

    // Animações Framer Motion Dinâmicas
    const pulseAnimation = useMemo(() => {
        if (isDeathZone) {
            return {
              strokeWidth: [2.5, 4.5, 2.5],
            strokeOpacity: [1, 0.6, 1],
            filter: [`drop-shadow(0 0 8px ${strokeColor}80)`, `drop-shadow(0 0 15px ${strokeColor})`, `drop-shadow(0 0 8px ${strokeColor}80)`],
            transition: {duration: 2, repeat: Infinity, ease: "easeInOut" }
            };
        }
            if (isPredatorZone) {
            return {
              strokeWidth: [2.5, 3.5, 2.5],
            strokeOpacity: [0.8, 1, 0.8],
            filter: [`drop-shadow(0 0 8px ${strokeColor}60)`, `drop-shadow(0 0 12px ${strokeColor})`, `drop-shadow(0 0 8px ${strokeColor}60)`],
            transition: {duration: 3, repeat: Infinity, ease: "easeInOut" }
            };
        }
            return {
              strokeWidth: 2.5,
            strokeOpacity: 1,
            filter: `drop-shadow(0 0 8px ${strokeColor}80)`,
            transition: {duration: 0.5, ease: "easeOut" }
        };
    }, [isDeathZone, isPredatorZone, strokeColor]);

            return (
            <div className="flex flex-col items-center font-sans">
              <div className="relative w-full max-w-[140px] aspect-square mx-auto mb-4">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <path
                    className="fill-none stroke-slate-800"
                    strokeWidth="2"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <motion.path
                    className="fill-none"
                    stroke={strokeColor}
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0, 100" }}
                    animate={{ strokeDasharray: `${dash}, 100`, ...pulseAnimation }}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {isDeathZone ? (
                    <motion.i animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }} transition={{ duration: 2, repeat: Infinity }} className="fa-solid fa-biohazard text-2xl mb-1" style={{ color: strokeColor }}></motion.i>
                  ) : isPredatorZone ? (
                    <motion.i animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }} className="fa-solid fa-crosshairs text-2xl mb-1" style={{ color: strokeColor }}></motion.i>
                  ) : (
                    <span className="font-mono text-3xl font-bold text-white tracking-tighter" style={{ color: isCritical ? '#ef4444' : 'white' }}>{safeValue.toFixed(1)}%</span>
                  )}
                  <span className="text-[9px] font-bold uppercase tracking-[0.1em] mt-1" style={{ color: strokeColor }}>
                    {isDeathZone ? 'CRITICAL' : isPredatorZone ? 'ATTACK' : 'RP'}
                  </span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</div>
                <div className="font-serif text-xl font-bold text-white mt-1">{pos}</div>
                <div className="font-mono text-xs text-slate-400 mt-1">{stack}</div>
              </div>
            </div>
          </div>

          {/* Meta info */}
          <p className={styles.gaugeMeta}>{label}</p>
          {isDeathZone && (
            <span className={styles.gaugeDeathBadge}>Death Zone</span>
          )}
        </div>
        );
        );
}
