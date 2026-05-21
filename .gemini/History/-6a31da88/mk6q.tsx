'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState, useId } from 'react';

export interface RiskGaugeProps {
  value: number;
  label?: string;
  pos?: string;
  stack?: string;
  stackTooltip?: string;
  color?: 'indigo' | 'rose' | 'pink' | 'emerald' | 'amber';
  threshold?: number;
  opponentValue?: number;
}

interface GaugeCenterProps {
  isDeathZone: boolean;
  isPredatorZone: boolean;
  isCritical: boolean;
  safeValue: number;
  strokeColor: string;
}

function GaugeCenter( { isDeathZone, isPredatorZone, isCritical, safeValue, strokeColor }: Readonly<GaugeCenterProps> ) {
  if ( isDeathZone ) {
    return (
      <>
        <motion.i animate={ { scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] } } transition={ { duration: 2, repeat: Infinity } } className="fa-solid fa-biohazard text-[1.75rem]" style={ { color: strokeColor, textShadow: `0 0 15px ${strokeColor}` } } />
        <span style={ { fontSize: '0.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: strokeColor, marginTop: '4px' } }>CRITICAL</span>
      </>
    );
  }

  if ( isPredatorZone ) {
    return (
      <>
        <motion.i animate={ { scale: [1, 1.15, 1] } } transition={ { duration: 3, repeat: Infinity } } className="fa-solid fa-crosshairs text-[1.75rem]" style={ { color: strokeColor, textShadow: `0 0 15px ${strokeColor}` } } />
        <span style={ { fontSize: '0.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: strokeColor, marginTop: '4px' } }>ATTACK</span>
      </>
    );
  }

  return (
    <>
      <div style={ { display: 'flex', alignItems: 'baseline', lineHeight: 1 } }>
        <span style={ { fontFamily: 'monospace', fontSize: '1.65rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, color: isCritical ? 'var(--accent-red-strong)' : 'var(--text-main)', textShadow: `0 0 10px ${isCritical ? 'var(--accent-red-strong)' : 'transparent'}` } }>
          { safeValue.toFixed( 1 ) }
        </span>
        <span style={ { fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 800, lineHeight: 1, marginLeft: '1px', color: isCritical ? 'var(--accent-red-strong)' : 'var(--text-muted)' } }>
          %
        </span>
      </div>
      <span style={ { fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: strokeColor, marginTop: '2px' } }>
        RP
      </span>
    </>
  );
}

export default function RiskGauge( {
  value,
  label = '--',
  pos = '--',
  stack = '--',
  stackTooltip,
  color = 'indigo',
  threshold = 20,
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
  const isDeathZone = safeValue >= 41; // SOTA: Teto de Nash Provado (41%)
  const isPredatorZone = safeOpponentValue >= 41 && safeValue < 25;

  // Colorimetria Semântica (Gravidade em Gradientes)
  let startColor = 'var(--accent-indigo)';
  let endColor = 'var(--accent-indigo-light)';
  let strokeColor = 'var(--accent-indigo)'; // Fallback para shadows e texto
  let trackColor = 'rgba(255,255,255,0.05)';

  if ( isCritical ) {
    startColor = 'var(--accent-red-strong)';
    endColor = 'var(--accent-rose)';
    strokeColor = 'var(--accent-red-strong)';
    trackColor = 'rgba(225,29,72,0.1)';
  }
  if ( isDeathZone ) {
    startColor = '#ff0033'; // Neon Red intenso
    endColor = '#990000';
    strokeColor = 'var(--accent-neon-red)';
    trackColor = 'rgba(255,0,50,0.15)';
  }
  if ( isPredatorZone ) {
    startColor = 'var(--accent-emerald)';
    endColor = '#34d399'; // Emerald-400
    strokeColor = 'var(--accent-emerald)';
    trackColor = 'rgba(16,185,129,0.1)';
  }

  // Comprimento do path para preencher o arco.
  // Vamos usar pathLength do framer-motion variando de 0 a (safeValue / maxVisualRp).
  const maxVisualRp = 30;
  const targetPathLength = Math.min( 1, Math.max( 0.01, safeValue / maxVisualRp ) );

  let gaugeFilter: string | string[] = `drop-shadow(0 0 8px ${startColor}80)`;
  if ( isDeathZone ) {
    gaugeFilter = [`drop-shadow(0 0 10px ${startColor})`, `drop-shadow(0 0 25px ${endColor})`, `drop-shadow(0 0 10px ${startColor})`];
  } else if ( isPredatorZone ) {
    gaugeFilter = [`drop-shadow(0 0 8px ${startColor}80)`, `drop-shadow(0 0 15px ${endColor})`, `drop-shadow(0 0 8px ${startColor}80)`];
  }

  // Easter Egg Filosófico (@maverick)
  useEffect( () => {
    if ( isDeathZone && !hasLoggedEasterEgg.current ) {
      const msg = [
        "%c SINGULARIDADE ICM DETECTADA (RP > 41%) ",
        "color: var(--accent-neon-red); font-weight: bold; font-size: 12px; background: #200010; padding: 4px; border: 1px solid var(--accent-neon-red);",
        "\nNeste nível de pressão (Teto de Nash), a matemática sugere que a coragem é apenas uma forma elaborada de suicídio financeiro.",
        "A estrutura dos prêmios impede que a fricção ultrapasse esse horizonte de eventos.",
        "Survival > Accumulation."
      ];
      setTimeout( () => console.log( msg[0], msg[1], msg[2], msg[3], msg[4] ), 500 );
      hasLoggedEasterEgg.current = true;
    }
  }, [isDeathZone] );

  return (
    <div className="flex flex-col items-center font-sans">
      <div className="relative w-full max-w-35 aspect-square mx-auto mb-3">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <defs>
            <linearGradient id={gradId} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={startColor} />
              <stop offset="100%" stopColor={endColor} />
            </linearGradient>
          </defs>

          {/* Track de Fundo */}
          <path
            className="fill-none"
            stroke={trackColor}
            strokeWidth="2.5"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />

          {/* Arco Preenchendo com Linear Gradient e Glow */}
          <motion.path
            className="fill-none"
            stroke={`url(#${gradId})`}
            strokeLinecap="round"
            initial={{ pathLength: 0, strokeWidth: 3, opacity: 0 }}
            animate={{
                pathLength: targetPathLength,
                opacity: 1,
                filter: gaugeFilter
            }}
            transition={{
                pathLength: { duration: 1.5, type: "spring", bounce: 0.2 },
                filter: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 0.5 }
            }}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center" style={ { gap: '3px' } }>
          <GaugeCenter
            isDeathZone={ isDeathZone }
            isPredatorZone={ isPredatorZone }
            isCritical={ isCritical }
            safeValue={ safeValue }
            strokeColor={ strokeColor }
          />
        </div>
      </div>

      <div className="text-center z-10 relative">
        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted">{ label }</div>
        <div className="font-serif text-2xl font-black text-white mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{ pos }</div>
        <button
          className="font-mono text-[0.7rem] font-bold text-text-dim mt-1.5 hover:text-white transition-colors group relative"
          type="button"
          style={ { cursor: stackTooltip ? 'help' : 'default' } }
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
          <span style={{ borderBottom: stackTooltip ? '1px dotted rgba(255,255,255,0.4)' : undefined, paddingBottom: '2px' }}>{ stack }</span>
          { stackTooltip && showTooltip && (
            <div className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-64 p-4 bg-black/95 backdrop-blur-md border border-white/10 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] text-left pointer-events-none z-99999">
              <p className="text-[0.7rem] text-text-light leading-relaxed font-sans font-medium m-0 normal-case tracking-normal">
                  { stackTooltip }
              </p>
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-black border-r border-b border-white/10 rotate-45" />
            </div>
          ) }
        </button>
      </div>
    </div>
  );
}
