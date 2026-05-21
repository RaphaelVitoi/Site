"use client";

import { useEffect, useRef } from "react";

export default function SotaBackground() {
  // SOTA: Substituição de useState por useRef para bypassar o React Fiber
  // Atualizar estado no 'mousemove' causava re-renderizações 60x por segundo, afogando a CPU.
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const orb3Ref = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const x = (e.clientX / globalThis.innerWidth) * 2 - 1;
        const y = (e.clientY / globalThis.innerHeight) * 2 - 1;

        if (orb1Ref.current)
          orb1Ref.current.style.transform = `translate(${x * -20}px, ${y * -20}px)`;
        if (orb2Ref.current)
          orb2Ref.current.style.transform = `translate(${x * 30}px, ${y * 30}px)`;
        if (orb3Ref.current)
          orb3Ref.current.style.transform = `translate(${x * -15}px, ${y * -15}px)`;
      });
    };

    // Passagem da flag passive para não bloquear a thread de scroll do navegador
    globalThis.addEventListener("mousemove", handleMouseMove, {
      passive: true,
    });
    return () => {
      globalThis.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-bg-base pointer-events-none">
      {/* SOTA: Textura de Grain Nativa (Via CSS Utility) */}
      <div className="absolute inset-0 z-10 opacity-40 mix-blend-soft-light pointer-events-none" />

      {/* Grid com Fade */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[60px_60px] z-0 mask-[radial-gradient(ellipse_100%_100%_at_50%_0%,#000_40%,transparent_100%)]" />

      {/* Orbs interativos (SOTA High-End Colors) */}
      <div
        ref={orb1Ref}
        className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-accent-indigo/15 rounded-full blur-[180px] mix-blend-screen transition-transform duration-1500 ease-out"
      />
      <div
        ref={orb2Ref}
        className="absolute bottom-[-15%] right-[-10%] w-[70%] h-[70%] bg-accent-emerald/10 rounded-full blur-[180px] mix-blend-screen transition-transform duration-1500 ease-out delay-75"
      />
      <div
        ref={orb3Ref}
        className="absolute top-[30%] left-[50%] w-[40%] h-[40%] bg-accent-rose/5 rounded-full blur-[150px] mix-blend-screen transition-transform duration-2000 ease-out delay-150"
      />

      {/* Vinheta SOTA Gold (Profundidade Máxima) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#020617_100%)] opacity-95 z-5" />
    </div>
  );
}
