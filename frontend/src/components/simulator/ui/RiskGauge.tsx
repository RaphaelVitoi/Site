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
    if (isDeathZone) return '#ff0055';
    if (isCritical) return '#ef4444';
    if (isPredatorZone) return '#10b981';
    return baseColor === 'pink' ? '#ec4899' : '#6366f1';
  };
  const colorHex = getColorHex();

  const getStrokeWidth = () => {
    if (isDeathZone) return '3.5';
    if (isPredatorZone) return '3';
    return '2.5';
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
      className={`font-mono text-xl font-bold tracking-tight text-white sm:text-2xl ${isCritical ? 'text-red-500' : ''}`}
      style={{ textShadow: `0 0 10px ${colorHex}40` }}
    >
      {safeValue.toFixed(1)}%
    </span>
  );

  if (isDeathZone) {
    centerContent = <i className="fa-solid fa-biohazard mb-1 animate-pulse text-3xl" style={{ color: colorHex }} />;
  } else if (isPredatorZone) {
    centerContent = <i className="fa-solid fa-crosshairs mb-1 text-3xl" style={{ color: colorHex }} />;
  }

  return (
    <div className="flex flex-col items-center font-sans">
      <div className="relative mx-auto mb-4 aspect-square w-full max-w-35">
        <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
          <path
            className="fill-none stroke-slate-800/50"
            strokeWidth="2"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <motion.path
            className={`fill-none drop-shadow-md ${isDeathZone ? 'animate-pulse' : ''}`}
            stroke={colorHex}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            initial={{ strokeDasharray: '0, 100' }}
            animate={{ strokeDasharray: `${dashPercentage}, 100` }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            style={{ filter: `drop-shadow(0 0 8px ${colorHex}80)` }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerContent}
          <span className="mt-1 text-[9px] font-bold tracking-widest uppercase" style={{ color: colorHex }}>
            {statusText}
          </span>
        </div>
      </div>

      <div className="text-center">
        <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">{label}</div>
        <div className="font-serif text-xl leading-tight font-bold text-white">{pos}</div>
        <div className="font-mono text-sm text-slate-500">{stack}</div>
      </div>
    </div>
  );
}

export default RiskGauge;
