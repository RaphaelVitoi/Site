'use client';

import { useEffect, useRef } from 'react';

export default function SotaBackground() {
  // SOTA: Substituição de useState por useRef para bypassar o React Fiber
  // Atualizar estado no 'mousemove' causava re-renderizações 60x por segundo, afogando a CPU.
  const orb1Ref = useRef<HTMLDivElement>( null );
  const orb2Ref = useRef<HTMLDivElement>( null );
  const orb3Ref = useRef<HTMLDivElement>( null );
  const rafRef = useRef<number | null>( null );

  useEffect( () => {
    const handleMouseMove = ( e: MouseEvent ) => {
      if ( rafRef.current ) cancelAnimationFrame( rafRef.current );

      rafRef.current = requestAnimationFrame( () => {
        const x = ( e.clientX / globalThis.innerWidth ) * 2 - 1;
        const y = ( e.clientY / globalThis.innerHeight ) * 2 - 1;

        if ( orb1Ref.current ) orb1Ref.current.style.transform = `translate(${x * -20}px, ${y * -20}px)`;
        if ( orb2Ref.current ) orb2Ref.current.style.transform = `translate(${x * 30}px, ${y * 30}px)`;
        if ( orb3Ref.current ) orb3Ref.current.style.transform = `translate(${x * -15}px, ${y * -15}px)`;
      } );
    };

    // Passagem da flag passive para não bloquear a thread de scroll do navegador
    globalThis.addEventListener( 'mousemove', handleMouseMove, { passive: true } );
    return () => {
      globalThis.removeEventListener( 'mousemove', handleMouseMove );
      if ( rafRef.current ) cancelAnimationFrame( rafRef.current );
    };
  }, [] );

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-bg-base pointer-events-none">
      {/* Grid com Fade */ }
      <div
        className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[60px_60px]"
        style={ {
          maskImage: 'radial-gradient(ellipse 100% 100% at 50% 0%, #000 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 100% 100% at 50% 0%, #000 40%, transparent 100%)'
        } }
      />

      {/* Orbs interativos */ }
      <div
        ref={ orb1Ref }
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent-indigo/20 rounded-full blur-[150px] mix-blend-screen transition-transform duration-1000 ease-out"
      />
      <div
        ref={ orb2Ref }
        className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent-emerald/10 rounded-full blur-[150px] mix-blend-screen transition-transform duration-1000 ease-out delay-75"
      />
      <div
        ref={ orb3Ref }
        className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-accent-sky/15 rounded-full blur-[120px] mix-blend-screen transition-transform duration-1000 ease-out delay-150"
      />

      {/* Vinheta escura nas bordas para focar o centro */ }
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)] opacity-80" />
    </div>
  );
}
