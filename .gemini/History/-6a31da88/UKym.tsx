'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState, useId } from 'react';

export interface RiskGaugeProps {
  value: number;
  label?: string;
  pos?: string;
  stack?: string;
  stackTooltip?: string;
  threshold?: number;
  dynamicDeathZone?: number; // SOTA: Horizonte dinâmico vindo do motor quântico
  opponentValue?: number;
}

interface GaugeCenterProps {
  isDeathZone: boolean;
  isPredatorZone: boolean;
  isCritical: boolean;
  safeValue: number;
  strokeClass: string;
  textShadowClass: string;
}

function GaugeCenter( { isDeathZone, isPredatorZone, isCritical, safeValue, strokeClass, textShadowClass }: Readonly<GaugeCenterProps> ) {
  if ( isDeathZone ) {
    return (
      <>
        <motion.i
          animate={ { scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] } }
          transition={ { duration: 2, repeat: Infinity } }
          className={`fa-solid fa-biohazard text-[1.75rem] ${strokeClass} ${textShadowClass}`}
        />
        <span className={`text-[0.5rem] font-black uppercase tracking-[0.15em] mt-1 ${strokeClass}`}>CRITICAL</span>
      </>
    );
  }

  if ( isPredatorZone ) {
    return (
      <>
        <motion.i
          animate={ { scale: [1, 1.15, 1] } }
          transition={ { duration: 3, repeat: Infinity } }
          className={`fa-solid fa-crosshairs text-[1.75rem] ${strokeClass} ${textShadowClass}`}
        />
        <span className={`text-[0.5rem] font-black uppercase tracking-[0.15em] mt-1 ${strokeClass}`}>ATTACK</span>
      </>
    );
  }

  return (
    <>
      <div className="flex items-baseline leading-none">
        <span
          className={`font-mono text-[1.65rem] font-black tracking-[-0.04em] leading-none ${isCritical ? 'text-accent-danger [text-shadow:0_0_10px_var(--color-accent-danger)]' : 'text-text-main'}`}
        >
          { safeValue.toFixed( 1 ) }
        </span>
        <span className={`font-mono text-[0.85rem] font-extrabold leading-none ml-0.5 ${isCritical ? 'text-accent-danger' : 'text-text-muted'}`}>
          %
        </span>
      </div>
      <span className={`text-[0.6rem] font-extrabold uppercase tracking-[0.15em] mt-0.5 ${strokeClass}`}>
        RP
      </span>
    </>
  );
}

function getGaugeColors(isDeathZone: boolean, isPredatorZone: boolean, isCritical: boolean, rpDiff: number) {
  if (isDeathZone) {
    return {
      startColor: '#ff0033',
      endColor: '#990000',
      strokeClass: 'text-accent-danger',
      textShadowClass: '[text-shadow:0_0_15px_var(--color-accent-danger)]',
      glowColor: 'rgba(255,0,50,0.15)'
    };
  }
  if (isPredatorZone) {
    return {
      startColor: 'var(--color-accent-emerald)',
      endColor: '#34d399',
      strokeClass: 'text-accent-emerald',
      textShadowClass: '[text-shadow:0_0_15px_var(--color-accent-emerald)]',
      glowColor: 'rgba(16,185,129,0.1)'
    };
  }
  if (isCritical) {
    return {
      startColor: 'var(--color-accent-danger)',
      endColor: 'var(--color-accent-rose)',
      strokeClass: 'text-accent-danger',
      textShadowClass: '[text-shadow:0_0_15px_var(--color-accent-danger)]',
      glowColor: 'rgba(225,29,72,0.1)'
    };
  }
  if (rpDiff > 10) {
    return {
      startColor: '#f59e0b',
      endColor: '#ea580c',
      strokeClass: 'text-accent-amber',
      textShadowClass: '[text-shadow:0_0_15px_var(--color-accent-amber)]',
      glowColor: 'rgba(245,158,11,0.1)'
    };
  }
  if (rpDiff > 4) {
    return {
      startColor: '#8b5cf6',
      endColor: '#d946ef',
      strokeClass: 'text-accent-violet',
      textShadowClass: '[text-shadow:0_0_15px_var(--color-accent-violet)]',
      glowColor: 'rgba(139,92,246,0.1)'
    };
  }
  return {
    startColor: '#0ea5e9',
    endColor: '#38bdf8',
    strokeClass: 'text-accent-sky',
    textShadowClass: '[text-shadow:0_0_15px_var(--color-accent-sky)]',
    glowColor: 'rgba(14,165,233,0.1)'
  };
}

export default function RiskGauge( {
  value,
  label = '--',
  pos = '--',
  stack = '--',
  stackTooltip,
  threshold = 20,
  dynamicDeathZone,
  opponentValue = 0,
}: Readonly<RiskGaugeProps> ) {
  const hasLoggedEasterEgg = useRef( false );
  const [showTooltip, setShowTooltip] = useState( false );
  const baseId = useId().replaceAll(":", "");
  const gradId = `gaugeGrad-${baseId}`;

  // Cálculos de Threshold SOTA
  const safeValue = Number.isNaN( value ) ? 0 : value;
  const safeOpponentValue = Number.isNaN( opponentValue ) ? 0 : opponentValue;

  const isCritical = safeValue >= threshold;
  // SOTA: Heurística de Pressão Crítica (Horizonte de 41% baseline ou Teto Dinâmico do Motor)
  const deathThreshold = dynamicDeathZone ?? 41;
  const isDeathZone = safeValue >= deathThreshold;
  const isPredatorZone = safeOpponentValue >= deathThreshold && safeValue < 25;

  const rpDiff = Math.abs( safeValue - safeOpponentValue );
  const { startColor, endColor, strokeClass, textShadowClass, glowColor } = getGaugeColors(isDeathZone, isPredatorZone, isCritical, rpDiff);

  // Comprimento do path para preencher o arco.
  const maxVisualRp = 30;
  const targetPathLength = Math.min( 1, Math.max( 0.01, safeValue / maxVisualRp ) );

  let gaugeFilter: string | string[] = `drop-shadow(0 0 10px ${glowColor})`;
  if ( isDeathZone ) {
    gaugeFilter = [`drop-shadow(0 0 12px ${glowColor})`, `drop-shadow(0 0 30px ${startColor})`, `drop-shadow(0 0 12px ${glowColor})`];
  } else if ( isPredatorZone ) {
    gaugeFilter = [`drop-shadow(0 0 10px ${glowColor})`, `drop-shadow(0 0 20px ${startColor})`, `drop-shadow(0 0 10px ${glowColor})`];
  }

  // Easter Egg Filosófico (@maverick)
  useEffect( () => {
    if ( isDeathZone && !hasLoggedEasterEgg.current ) {
      const msg = [
        "%c ALERTA DE PRESSÃO CRÍTICA (RP > 41%) ",
        "color: #ff1a1a; font-weight: bold; font-size: 12px; background: #020617; padding: 6px; border: 1px solid #ff1a1a; border-radius: 4px; box-shadow: 0 0 10px rgba(255,26,26,0.5);",
        "\nNeste nível de pressão (Hipótese do Teto do RP), a matemática sugere que a coragem é frequentemente uma forma de suicídio financeiro.",
        "A estrutura dos prêmios tende a impedir que a fricção ultrapasse esse horizonte de eventos.",
        "Survival > Accumulation."
      ];
      setTimeout( () => console.log( msg[0], msg[1], msg[2], msg[3], msg[4] ), 500 );
      hasLoggedEasterEgg.current = true;
    }
  }, [isDeathZone] );

  return (
    <div className="flex flex-col items-center font-sans group/gauge">
      <div className="relative w-full max-w-40 aspect-square mx-auto mb-5">
        <div className="absolute inset-0 bg-bg-deep/90 rounded-full border border-white/10 shadow-[inset_0_4px_15px_rgba(0,0,0,0.8),0_25px_50px_-15px_rgba(0,0,0,0.6)] backdrop-blur-3xl" />
        <div className="absolute inset-2 bg-black/40 rounded-full shadow-[inset_0_4px_15px_rgba(0,0,0,0.9)] border border-white/5" />

        <svg viewBox="0 0 36 36" className="absolute inset-0 w-full h-full -rotate-90 scale-90">
          <defs>
            <linearGradient id={gradId} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={startColor} />
              <stop offset="60%" stopColor={startColor} />
              <stop offset="100%" stopColor={endColor} />
            </linearGradient>
            <filter id={`glow-${baseId}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Track de Fundo Metálico */}
          <path
            className="fill-none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="3.5"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />

          {/* Arco Preenchendo com Linear Gradient e Glow */}
          <motion.path
            className="fill-none"
            stroke={`url(#${gradId})`}
            strokeLinecap="round"
            initial={{ pathLength: 0, strokeWidth: 3.5, opacity: 0 }}
            animate={{
                pathLength: targetPathLength,
                opacity: 1,
                filter: gaugeFilter
            }}
            transition={{
                pathLength: { duration: 1.8, type: "spring", bounce: 0.15 },
                filter: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 0.8 }
            }}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-[2px]">
          <GaugeCenter
            isDeathZone={ isDeathZone }
            isPredatorZone={ isPredatorZone }
            isCritical={ isCritical }
            safeValue={ safeValue }
          strokeClass={ strokeClass }
          textShadowClass={ textShadowClass }
          />
        </div>
      </div>

      <div className="text-center z-10 relative bg-slate-900/40 p-4 rounded-3xl border border-white/5 shadow-inner backdrop-blur-xl group-hover/gauge:bg-slate-900/60 transition-colors w-full">
        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-text-muted mb-1">{ label }</div>
        <div className="font-serif text-3xl font-black text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] tracking-tight">{ pos }</div>
        <button
          className={`font-mono text-[0.65rem] font-bold text-text-darker mt-2 hover:text-white transition-colors group relative bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 w-full ${stackTooltip ? 'cursor-help' : 'cursor-default'}`}
          type="button"
          onMouseEnter={ () => stackTooltip && setShowTooltip( true ) }
          onMouseLeave={ () => setShowTooltip( false ) }
          onFocus={ () => stackTooltip && setShowTooltip( true ) }
          onBlur={ () => setShowTooltip( false ) }
          onKeyDown={ ( e ) => {
            if ( e.key === 'Enter' || e.key === ' ' ) {
              e.preventDefault();
              setShowTooltip( !showTooltip );
            }
          } }
          tabIndex={ stackTooltip ? 0 : undefined }
        >
          <span className="truncate block">{ stack }</span>
          { stackTooltip && showTooltip && (
            <div className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-64 p-4 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.9)] text-left pointer-events-none z-99999">
              <p className="text-[0.7rem] text-text-light leading-relaxed font-sans font-medium m-0 normal-case tracking-normal">
                  { stackTooltip }
              </p>
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-r border-b border-white/10 rotate-45" />
            </div>
          ) }
        </button>
      </div>
    </div>
  );
}
