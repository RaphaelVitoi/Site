'use client';

import { useEffect, useState } from 'react';

export default function SotaBackground() {
  const [mousePos, setMousePos] = useState( { x: 0, y: 0 } );

  useEffect( () => {
    const handleMouseMove = ( e: MouseEvent ) => {
      // Calculate normalized mouse position (-1 to 1)
      const x = ( e.clientX / globalThis.innerWidth ) * 2 - 1;
      const y = ( e.clientY / globalThis.innerHeight ) * 2 - 1;
      setMousePos( { x, y } );
    };

    globalThis.addEventListener( 'mousemove', handleMouseMove );
    return () => globalThis.removeEventListener( 'mousemove', handleMouseMove );
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
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent-indigo/20 rounded-full blur-[150px] mix-blend-screen transition-transform duration-1000 ease-out"
        style={ {
          transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)`
        } }
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent-emerald/10 rounded-full blur-[150px] mix-blend-screen transition-transform duration-1000 ease-out delay-75"
        style={ {
          transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)`
        } }
      />
      <div
        className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-accent-sky/15 rounded-full blur-[120px] mix-blend-screen transition-transform duration-1000 ease-out delay-150"
        style={ {
          transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -15}px)`
        } }
      />

      {/* Vinheta escura nas bordas para focar o centro */ }
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)] opacity-80" />
    </div>
  );
}
