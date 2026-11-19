'use client';

import { useEffect, useRef } from 'react';

export interface ReadingProgressBarProps {
  className?: string;
}

/**
 * SOTA: Barra de Progresso de Leitura Isolada (Zero-Framer-Motion)
 * Usa CSS Scroll-Driven Animations na compositor thread com fallback passive + rAF.
 * Renderizada sob demanda apenas em páginas de conteúdo longo (aulas e biblioteca).
 */
export function ReadingProgressBar({ className = '' }: Readonly<ReadingProgressBarProps>) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;

    if (
      typeof CSS !== 'undefined' &&
      typeof CSS.supports === 'function' &&
      CSS.supports('animation-timeline', 'scroll()')
    ) {
      return;
    }

    let rafId: number | null = null;
    const updateProgress = () => {
      rafId = null;
      const doc = document.documentElement;
      const maxScroll = Math.max(0, doc.scrollHeight - globalThis.innerHeight);
      const ratio = maxScroll > 0 ? Math.min(1, Math.max(0, globalThis.scrollY / maxScroll)) : 0;
      el.style.setProperty('--scroll-progress', String(ratio));
    };

    const onScroll = () => {
      rafId ??= globalThis.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    globalThis.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      globalThis.removeEventListener('scroll', onScroll);
      if (rafId !== null) {
        globalThis.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed top-0 right-0 left-0 z-100 h-1 overflow-hidden">
      <div
        ref={barRef}
        data-testid="reading-progress"
        className={`sota-reading-progress from-accent-indigo to-accent-emerald h-full w-full origin-left bg-linear-to-r via-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.6)] ${className}`}
      />
    </div>
  );
}
