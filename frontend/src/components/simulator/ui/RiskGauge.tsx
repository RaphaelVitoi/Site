/**
 * IDENTITY: Medidor de Risco (RiskGauge) SOTA v7.0 GOLD
 * PATH: src/components/simulator/ui/RiskGauge.tsx
 * ROLE: Visualização circular de Risk Premium com feedback tátil e sonoro.
 */

'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { logger } from '@/lib/logger';

export interface RiskGaugeProps {
  value: number;
  label?: string;
  pos?: string;
  stack?: string;
  baseColor?: 'indigo' | 'pink';
  threshold?: number;
  opponentValue?: number;
  dynamicDeathZone?: number;
  maxRp?: number;
  muted?: boolean;
}

type GaugeState = 'normal' | 'predator' | 'death';

const playTone = (type: GaugeState, intensity: number, audioCtxRef: React.RefObject<AudioContext | null>) => {
  if (globalThis.window === undefined) return;

  try {
    if (!audioCtxRef.current) {
      const AudioContextClass =
        globalThis.window.AudioContext ||
        (globalThis.window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      audioCtxRef.current = new AudioContextClass();
    }

    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'predator') {
      const freq = 1200 + (intensity - 40) * 25;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.15);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'death') {
      const freq = Math.max(40, 80 - (intensity - 40) * 1);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    }

    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  } catch (e) {
    console.warn('Autoplay audio blocked or not supported.', e);
  }
};

export function RiskGauge({
  value,
  label = '--',
  pos = '--',
  stack = '--',
  baseColor = 'indigo',
  threshold,
  opponentValue = 0,
  dynamicDeathZone = 41,
  maxRp = 50,
  muted = false,
}: Readonly<RiskGaugeProps>) {
  const [currentState, setCurrentState] = useState<GaugeState>('normal');
  const audioCtxRef = useRef<AudioContext | null>(null);

  const safeValue = Number.isNaN(value) ? 0 : value;
  const safeOpponentValue = Number.isNaN(opponentValue) ? 0 : opponentValue;
  const isCritical = threshold !== undefined && safeValue >= threshold;

  const isDeathZone = safeValue >= dynamicDeathZone;
  const isPredatorZone = safeOpponentValue >= dynamicDeathZone && safeValue < 25;

  const dashPercentage = Math.min(100, Math.max(0, (safeValue / maxRp) * 100));

  const getColorHex = () => {
    if (isDeathZone) return '#f43f5e'; // accent-rose
    if (isCritical) return '#ef4444'; // accent-danger
    if (isPredatorZone) return '#10b981'; // accent-emerald
    return baseColor === 'pink' ? '#ec4899' : '#6366f1'; // accent-pink : accent-indigo
  };
  const colorHex = getColorHex();

  const getStrokeWidth = () => {
    if (isDeathZone) return '4';
    if (isPredatorZone) return '3.5';
    return '3';
  };
  const strokeWidth = getStrokeWidth();

  const getStatusText = () => {
    if (isDeathZone) return 'CRITICAL';
    if (isPredatorZone) return 'ATTACK';
    return 'RP';
  };
  const statusText = getStatusText();

  // Transição de Estado e Trigger de Áudio
  useEffect(() => {
    let newState: GaugeState = 'normal';
    if (isDeathZone) newState = 'death';
    else if (isPredatorZone) newState = 'predator';

    if (newState === currentState) return;

    setCurrentState(newState);

    if (newState === 'death') {
      logger.info(
        'UI:RiskGauge',
        '⚠️ SINGULARIDADE ICM DETECTADA (Teto Rompido) ⚠️\nNeste nível de pressão, a matemática sugere que a coragem é apenas uma forma elaborada de suicídio financeiro.\nSurvival > Accumulation.',
      );
    }

    if (!muted) {
      playTone(newState, newState === 'death' ? safeValue : safeOpponentValue, audioCtxRef);
    }
  }, [isDeathZone, isPredatorZone, safeValue, safeOpponentValue, muted, currentState]);

  let centerContent = (
    <span
      className={`font-mono text-2xl font-black tracking-tighter text-white sm:text-3xl tabular-nums ${isCritical ? 'text-accent-danger' : ''}`}
      style={{ textShadow: `0 0 25px ${colorHex}80` }}
    >
      {safeValue.toFixed(1)}%
    </span>
  );

  if (isDeathZone) {
    centerContent = (
      <div className="relative">
        <i className="fa-solid fa-biohazard mb-2 animate-pulse text-4xl" style={{ color: colorHex, filter: `drop-shadow(0 0 15px ${colorHex})` }} />
        <div className="absolute inset-0 bg-accent-rose/20 blur-2xl rounded-full -z-10 animate-pulse" />
      </div>
    );
  } else if (isPredatorZone) {
    centerContent = (
      <div className="relative">
        <i className="fa-solid fa-crosshairs mb-2 text-4xl animate-spin-[20s_linear_infinite]" style={{ color: colorHex, filter: `drop-shadow(0 0 15px ${colorHex})` }} />
        <div className="absolute inset-0 bg-accent-emerald/20 blur-2xl rounded-full -z-10" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center group/gauge">
      <div className="relative mx-auto mb-6 aspect-square w-full max-w-40 transition-transform duration-700 group-hover/gauge:scale-105">
        <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90 filter drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <path
            className="fill-none stroke-slate-900/60"
            strokeWidth="3"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <motion.path
            className={`fill-none ${isDeathZone ? 'animate-pulse' : ''}`}
            stroke={colorHex}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            initial={{ strokeDasharray: '0, 100' }}
            animate={{ strokeDasharray: `${dashPercentage}, 100` }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            style={{ filter: `drop-shadow(0 0 12px ${colorHex})` }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerContent}
          <span className="mt-2 text-[0.65rem] font-black tracking-[0.4em] uppercase" style={{ color: colorHex }}>
            {statusText}
          </span>
        </div>
      </div>

      <div className="text-center space-y-2">
        <div className="text-[0.6rem] font-black tracking-[0.4em] text-text-darker uppercase group-hover/gauge:text-text-muted transition-colors">{label}</div>
        <div className="text-2xl leading-none font-black text-white tracking-tighter uppercase group-hover/gauge:text-glow-indigo transition-all duration-500">{pos}</div>
        <div className="font-mono text-[0.75rem] font-black text-text-darker tracking-widest uppercase">{stack}</div>
      </div>
    </div>
  );
}

export default RiskGauge;
