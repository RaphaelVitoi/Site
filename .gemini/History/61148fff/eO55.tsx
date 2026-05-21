/**
 * IDENTITY: Risk Gauge SOTA (Didática Visceral)
 * PATH: src/components/simulator/ui/RiskGauge.tsx
 * ROLE: Visualização do Risk Premium. Reage a limiares críticos.
 */

'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';

export interface RiskGaugeProps {
  value: number;
  label?: string;
  pos?: string;
  stack?: string;
  stackTooltip?: string;
  color?: 'pink' | 'indigo';
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

function GaugeCenter ( { isDeathZone, isPredatorZone, isCritical, safeValue, strokeColor }: Readonly<GaugeCenterProps> ) {
  if ( isDeathZone )
  {
    return (
      <>
        <motion.i animate={ { scale: [ 1, 1.2, 1 ], opacity: [ 0.8, 1, 0.8 ] } } transition={ { duration: 2, repeat: Infinity } } className="fa-solid fa-biohazard text-2xl" style={ { color: strokeColor } } />
        <span style={ { fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: strokeColor } }>CRITICAL</span>
      </>
    );
  }

  if ( isPredatorZone )
  {
    return (
      <>
        <motion.i animate={ { scale: [ 1, 1.1, 1 ] } } transition={ { duration: 3, repeat: Infinity } } className="fa-solid fa-crosshairs text-2xl" style={ { color: strokeColor } } />
        <span style={ { fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: strokeColor } }>ATTACK</span>
      </>
    );
  }

  return (
    <>
      <div style={ { display: 'flex', alignItems: 'baseline', lineHeight: 1 } }>
        <span style={ { fontFamily: 'monospace', fontSize: '1.55rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, color: isCritical ? '#ef4444' : '#f8fafc' } }>
          { safeValue.toFixed( 1 ) }
        </span>
        <span style={ { fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700, lineHeight: 1, marginLeft: '1px', color: isCritical ? '#ef4444' : '#94a3b8' } }>
          %
        </span>
      </div>
      <span style={ { fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: strokeColor } }>
        RP
      </span>
    </>
  );
}

export default function RiskGauge ( {
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
  const [ showTooltip, setShowTooltip ] = useState( false );

  // Cálculos de Threshold SOTA
  const safeValue = Number.isNaN( value ) ? 0 : value;
  const safeOpponentValue = Number.isNaN( opponentValue ) ? 0 : opponentValue;

  const isCritical = safeValue >= threshold;
  const isDeathZone = safeValue >= 40;
  const isPredatorZone = safeOpponentValue >= 40 && safeValue < 25;

  // Colorimetria Semântica
  const baseColor = color === 'pink' ? '#ec4899' : '#6366f1';
  let strokeColor = baseColor;
  if ( isCritical ) strokeColor = '#ef4444'; // Red-500
  if ( isDeathZone ) strokeColor = '#ff0055'; // Neon Pink/Red
  if ( isPredatorZone ) strokeColor = '#10b981'; // Emerald-500

  // Dash array para a animação do SVG (Baseado num RP máximo prático de ~26% para o círculo fechar visualmente)
  const dash = Math.min( 100, Math.max( 0, ( safeValue / 26 ) * 100 ) );

  // Easter Egg Filosófico (@maverick)
  useEffect( () => {
    if ( isDeathZone && !hasLoggedEasterEgg.current )
    {
      const msg = [
        "%c SINGULARIDADE ICM DETECTADA (RP > 40%) ",
        "color: #ff0055; font-weight: bold; font-size: 12px; background: #200010; padding: 4px; border: 1px solid #ff0055;",
        "\nNeste nível de pressão, a matemática sugere que a coragem é apenas uma forma elaborada de suicídio financeiro.",
        "Foldar não é covardia; é darwinismo aplicado.\n",
        "Survival > Accumulation."
      ];
      setTimeout( () => console.log( msg[ 0 ], msg[ 1 ], msg[ 2 ], msg[ 3 ], msg[ 4 ] ), 500 );
      hasLoggedEasterEgg.current = true;
    }
  }, [ isDeathZone ] );

  // Animações Framer Motion Dinâmicas
  const pulseAnimation = useMemo( () => {
    if ( isDeathZone )
    {
      return {
        strokeWidth: [ 2.5, 4.5, 2.5 ],
        strokeOpacity: [ 1, 0.6, 1 ],
        filter: [ `drop-shadow(0 0 8px ${strokeColor}80)`, `drop-shadow(0 0 15px ${strokeColor})`, `drop-shadow(0 0 8px ${strokeColor}80)` ],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      };
    }
    if ( isPredatorZone )
    {
      return {
        strokeWidth: [ 2.5, 3.5, 2.5 ],
        strokeOpacity: [ 0.8, 1, 0.8 ],
        filter: [ `drop-shadow(0 0 8px ${strokeColor}60)`, `drop-shadow(0 0 12px ${strokeColor})`, `drop-shadow(0 0 8px ${strokeColor}60)` ],
        transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
      };
    }
    return {
      strokeWidth: 2.5,
      strokeOpacity: 1,
      filter: `drop-shadow(0 0 8px ${strokeColor}80)`,
      transition: { duration: 0.5, ease: "easeOut" }
    };
  }, [ isDeathZone, isPredatorZone, strokeColor ] );

  return (
    <div className="flex flex-col items-center font-sans">
      <div className="relative w-full max-w-35 aspect-square mx-auto mb-2">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <path
            className="fill-none stroke-slate-800"
            strokeWidth="2"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <motion.path
            className="fill-none"
            stroke={ strokeColor }
            strokeLinecap="round"
            initial={ { strokeDasharray: "0, 100", strokeWidth: 2.5, strokeOpacity: 1 } }
            animate={ { strokeDasharray: `${dash}, 100`, ...pulseAnimation } as any }
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

      <div className="text-center">
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{ label }</div>
        <div className="font-serif text-xl font-bold text-white mt-1">{ pos }</div>
        <button
          className="font-mono text-xs text-slate-300 mt-1"
          type="button"
          style={ {
            position: 'relative',
            display: 'inline-block',
            cursor: stackTooltip ? 'help' : 'default',
            textDecoration: stackTooltip ? 'underline dotted' : 'none',
            textUnderlineOffset: '2px',
          } }
          onMouseEnter={ () => stackTooltip && setShowTooltip( true ) }
          onMouseLeave={ () => setShowTooltip( false ) }
          onFocus={ () => stackTooltip && setShowTooltip( true ) }
          onBlur={ () => setShowTooltip( false ) }
          onKeyDown={ ( e ) => {
            if ( e.key === 'Enter' || e.key === ' ' )
            {
              e.preventDefault();
              setShowTooltip( !showTooltip );
            }
          } }
          tabIndex={ stackTooltip ? 0 : undefined }
        >
          { stack }
          { stackTooltip && showTooltip && (
            <div style={ {
              position: 'absolute',
              bottom: 'calc(100% + 6px)',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '240px',
              padding: '0.6rem 0.8rem',
              background: 'rgba(2, 6, 23, 0.97)',
              border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: '6px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
              fontSize: '0.65rem',
              lineHeight: 1.55,
              color: '#94a3b8',
              fontFamily: 'var(--font-body, sans-serif)',
              textAlign: 'left',
              zIndex: 100,
              pointerEvents: 'none',
              fontStyle: 'normal',
              textDecoration: 'none',
            } }>
              { stackTooltip }
            </div>
          ) }
        </button>
      </div>
    </div>
  );
}
