"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export interface RiskGaugeProps {
  value: number;
  label?: string;
  pos?: string;
  stack?: string;
  baseColor?: "indigo" | "pink";
  threshold?: number;
  opponentValue?: number;
  dynamicDeathZone?: number;
  maxRp?: number;
  muted?: boolean;
}

type GaugeState = "normal" | "predator" | "death";

export function RiskGauge({
  value,
  label = "--",
  pos = "--",
  stack = "--",
  baseColor = "indigo",
  threshold,
  opponentValue = 0,
  dynamicDeathZone = 41,
  maxRp = 50,
  muted = false,
}: RiskGaugeProps) {
  const [currentState, setCurrentState] = useState<GaugeState>("normal");
  const audioCtxRef = useRef<AudioContext | null>(null);

  const safeValue = Number.isNaN(value) ? 0 : value;
  const safeOpponentValue = Number.isNaN(opponentValue) ? 0 : opponentValue;
  const isCritical = threshold !== undefined && safeValue >= threshold;

  const isDeathZone = safeValue >= dynamicDeathZone;
  const isPredatorZone =
    safeOpponentValue >= dynamicDeathZone && safeValue < 25;

  const dashPercentage = Math.min(100, Math.max(0, (safeValue / maxRp) * 100));

  // Define cores baseadas no Tailwind e nos tokens estruturais
  let colorHex = baseColor === "pink" ? "#ec4899" : "#6366f1"; // Pink-500 ou Indigo-500
  if (isCritical) colorHex = "#ef4444"; // Red-500
  if (isDeathZone) colorHex = "#ff0055"; // Neon Pink/Red (Singularidade)
  if (isPredatorZone) colorHex = "#10b981"; // Emerald-500

  // Transição de Estado e Trigger de Áudio
  useEffect(() => {
    let newState: GaugeState = "normal";
    if (isDeathZone) newState = "death";
    else if (isPredatorZone) newState = "predator";

    if (newState !== currentState) {
      setCurrentState(newState);

      if (newState === "death") {
        console.log(
          "%c⚠️ SINGULARIDADE ICM DETECTADA (Teto Rompido) ⚠️\nNeste nível de pressão, a matemática sugere que a coragem é apenas uma forma elaborada de suicídio financeiro.\nSurvival > Accumulation.",
          "color: #ff0055; font-weight: bold; font-size: 12px; background: #200010; padding: 4px; border: 1px solid #ff0055;",
        );
      }

      if (!muted) {
        playTone(
          newState,
          newState === "death" ? safeValue : safeOpponentValue,
        );
      }
    }
  }, [
    isDeathZone,
    isPredatorZone,
    safeValue,
    safeOpponentValue,
    muted,
    currentState,
  ]);

  const playTone = (type: GaugeState, intensity: number) => {
    if (typeof window === "undefined") return;

    try {
      if (!audioCtxRef.current) {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        audioCtxRef.current = new AudioContextClass();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === "predator") {
        const freq = 1200 + (intensity - 40) * 25;
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.15);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === "death") {
        const freq = Math.max(40, 80 - (intensity - 40) * 1);
        osc.type = "sawtooth";
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
      console.warn("Autoplay audio blocked or not supported.", e);
    }
  };

  return (
    <div className="flex flex-col items-center font-sans">
      <div className="relative w-full max-w-35 aspect-square mx-auto mb-4">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <path
            className="fill-none stroke-slate-800/50"
            strokeWidth="2"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <motion.path
            className={`fill-none drop-shadow-md ${isDeathZone ? "animate-pulse" : ""}`}
            stroke={colorHex}
            strokeWidth={isDeathZone ? "3.5" : isPredatorZone ? "3" : "2.5"}
            strokeLinecap="round"
            initial={{ strokeDasharray: "0, 100" }}
            animate={{ strokeDasharray: `${dashPercentage}, 100` }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            style={{ filter: `drop-shadow(0 0 8px ${colorHex}80)` }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isDeathZone ? (
            <i
              className="fa-solid fa-biohazard text-3xl mb-1 animate-pulse"
              style={{ color: colorHex }}
            />
          ) : isPredatorZone ? (
            <i
              className="fa-solid fa-crosshairs text-3xl mb-1"
              style={{ color: colorHex }}
            />
          ) : (
            <span
              className={`font-mono text-xl sm:text-2xl font-bold tracking-tight text-white ${isCritical ? "text-red-500" : ""}`}
              style={{ textShadow: `0 0 10px ${colorHex}40` }}
            >
              {safeValue.toFixed(1)}%
            </span>
          )}
          <span
            className="text-[9px] font-bold uppercase tracking-widest mt-1"
            style={{ color: colorHex }}
          >
            {isDeathZone ? "CRITICAL" : isPredatorZone ? "ATTACK" : "RP"}
          </span>
        </div>
      </div>

      <div className="text-center">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {label}
        </div>
        <div className="font-serif text-xl font-bold text-white leading-tight">
          {pos}
        </div>
        <div className="font-mono text-sm text-slate-500">{stack}</div>
      </div>
    </div>
  );
}

export default RiskGauge;
