'use client';

/**
 * IDENTITY: Número Animado (requestAnimationFrame)
 * PATH: src/components/simulator/ui/AnimatedNumber.tsx
 * ROLE: Interpolar valores numéricos suavemente via easing cúbico.
 *       Port do AnimatedNumber do RiskGeometryMasterclass.tsx.
 * BINDING: Nenhum externo
 */

import { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  /** Valor alvo para animar */
  value: number;
  /** Duração da animação em ms (padrão 800) */
  duration?: number;
  /** Casas decimais (padrão 1) */
  decimals?: number;
  /** Prefixo opcional (ex: "$") */
  prefix?: string;
  /** Sufixo opcional (ex: "%") */
  suffix?: string;
}

/**
 * Componente que interpola numericamente de um valor ao próximo
 * usando requestAnimationFrame com easing cúbico (ease-out).
 */
export default function AnimatedNumber ( {
  value,
  duration = 800,
  decimals = 1,
  prefix = '',
  suffix = '',
}: Readonly<AnimatedNumberProps> ) {
  const [ display, setDisplay ] = useState( 0 );
  const prevValueRef = useRef( 0 );

  useEffect( () => {
    let startTimestamp: number | null = null;
    let animationFrame: number;
    const startValue = prevValueRef.current;

    const step = ( timestamp: number ) => {
      if ( !startTimestamp ) startTimestamp = timestamp;
      const progress = Math.min( ( timestamp - startTimestamp ) / duration, 1 );
      // Easing cúbico (ease-out)
      const ease = 1 - Math.pow( 1 - progress, 3 );
      const current = startValue + ( value - startValue ) * ease;

      setDisplay( current );

      if ( progress < 1 )
      {
        animationFrame = globalThis.requestAnimationFrame( step );
      } else
      {
        setDisplay( value );
        prevValueRef.current = value;
      }
    };

    animationFrame = globalThis.requestAnimationFrame( step );

    return () => {
      globalThis.cancelAnimationFrame( animationFrame );
    };
  }, [ value, duration ] );

  return (
    <>
      { prefix }
      { display.toFixed( decimals ) }
      { suffix }
    </>
  );
}
