'use client';

/**
 * IDENTITY: Barra de Narração Neural SOTA para Artigos (ArticleVoiceNarration)
 * PATH: src/components/ui/layout/ArticleVoiceNarration.tsx
 * ROLE: Player compacto, responsivo e esteticamente sublime para audição de artigos e ensaios
 *       com calibração fonética para Poker/PMev e despacho híbrido (Voice Nexus / SAPI).
 */

import { useCallback } from 'react';
import { useSotaSpeech } from '@/components/simulator/hooks/useSotaSpeech';

export interface ArticleVoiceNarrationProps {
  readonly title: string;
  readonly content: string;
}

export function ArticleVoiceNarration({ title, content }: ArticleVoiceNarrationProps) {
  const { isPlaying, isPaused, rate, audioSource, isNexusActive, toggle, stop, cycleRate } = useSotaSpeech();

  const handleToggle = useCallback(() => {
    const fullNarrationText = `${title}. ${content}`;
    toggle(`article-${title.slice(0, 20)}`, fullNarrationText);
  }, [title, content, toggle]);

  let statusLabel = 'Ouvir Artigo Completo';
  if (isPlaying) {
    statusLabel = 'Transmitindo Narração';
  } else if (isPaused) {
    statusLabel = 'Narração Pausada';
  }

  return (
    <div className="hover:border-accent-indigo/30 mb-8 flex w-full flex-col items-start justify-between gap-4 rounded-2xl border border-white/10 bg-black/40 p-4 shadow-xl backdrop-blur-md transition-all duration-300 sm:flex-row sm:items-center sm:p-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleToggle}
          aria-label={isPlaying ? 'Pausar narração' : 'Ouvir artigo'}
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm shadow-lg transition-all active:scale-95 ${
            isPlaying
              ? 'bg-accent-amber text-black hover:bg-amber-400'
              : 'bg-accent-indigo shadow-accent-indigo/25 text-white hover:bg-indigo-500'
          }`}
        >
          <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`} />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-[0.65rem] font-black tracking-[0.18em] text-white uppercase">{statusLabel}</span>
            <span
              className={`rounded-full border px-2 py-0.5 font-mono text-[0.55rem] font-bold transition-colors ${
                isNexusActive || audioSource === 'nexus'
                  ? 'bg-accent-indigo/10 border-accent-indigo/30 text-accent-indigo-light'
                  : 'text-text-muted border-white/10 bg-white/5'
              }`}
            >
              {isNexusActive || audioSource === 'nexus' ? '✨ Gemini Studio' : '🔊 SAPI Neural'}
            </span>
          </div>
          <p className="text-text-dim m-0 mt-0.5 text-[0.55rem] font-medium tracking-wider uppercase">
            Síntese Neural Calibrada • MTTs & Teoria dos Jogos
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-between gap-3 pt-3 sm:w-auto sm:justify-end sm:pt-0">
        {isPlaying && (
          <div className="flex h-4 items-center gap-1 px-2" aria-hidden="true">
            {[0.5, 0.9, 1.3, 0.7, 1.1, 0.6, 1.4, 0.8].map((h, i) => (
              <span
                key={`audio-eq-${h}-${i}`}
                className="bg-accent-indigo-light w-0.5 animate-pulse rounded-full"
                style={{
                  height: `${Math.min(100, h * 100)}%`,
                  animationDelay: `${i * 0.09}s`,
                  animationDuration: '0.55s',
                }}
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={cycleRate}
            title="Alterar velocidade de reprodução"
            className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 font-mono text-[0.6rem] font-bold text-white transition-colors hover:bg-white/10"
          >
            {rate.toFixed(2)}x
          </button>

          {(isPlaying || isPaused) && (
            <button
              type="button"
              onClick={stop}
              aria-label="Parar narração"
              className="text-text-muted rounded-lg border border-white/10 bg-black/50 px-2.5 py-1.5 text-[0.6rem] font-bold uppercase transition-colors hover:bg-black/70 hover:text-white"
            >
              <i className="fa-solid fa-stop text-xs" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ArticleVoiceNarration;
