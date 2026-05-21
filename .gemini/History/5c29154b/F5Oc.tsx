"use client";

import { useEffect, useRef } from "react";
import { ClientOnly } from "@/components/ui/ClientOnly";

interface TerminalLogProps {
  lines: string[];
  isProcessing?: boolean;
  title?: string;
  height?: string;
}

/**
 * SOTA Terminal Log Visualization.
 * Renderiza arrays de telemetria ou chunks de streaming com auto-scroll nativo e UI visceral.
 */
export function TerminalLog({ lines, isProcessing = false, title = "NEXUS TERMINAL SOTA", height = "h-96" }: Readonly<TerminalLogProps>) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // SOTA Auto-scroll: Fixa o viewport no fundo durante a injecao de logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, isProcessing]);

  return (
    <ClientOnly fallback={<div className={`w-full ${height} bg-black/20 animate-pulse rounded-xl border border-white/5`} />}>
      <div className={`flex flex-col w-full ${height} bg-[#0a0a0f] rounded-xl border border-white/10 shadow-2xl overflow-hidden font-mono text-[0.8rem]`}>
        {/* Header do Terminal */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-white/5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            </div>
            <span className="font-black text-text-dim uppercase tracking-widest text-[0.65rem] select-none">{title}</span>
          </div>
          {isProcessing && (
            <div className="flex items-center gap-2">
              <span className="text-accent-indigo text-[0.65rem] font-bold uppercase tracking-widest animate-pulse select-none">Executando</span>
              <i className="fa-solid fa-circle-notch fa-spin text-accent-indigo text-xs" />
            </div>
          )}
        </div>

        {/* Viewport de Logs */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-1.5 scroll-smooth">
          {lines.length === 0 ? (
            <div className="text-text-darker italic font-semibold select-none">Aguardando telemetria...</div>
          ) : (
            lines.map((line, idx) => (
              <div key={idx} className="text-text-light break-words whitespace-pre-wrap leading-relaxed flex">
                <span className="text-emerald-400/70 mr-3 select-none">➜</span>
                <span className="flex-1">{line}</span>
              </div>
            ))
          )}
          {isProcessing && (
            <div className="flex items-center mt-2">
              <span className="text-emerald-400/70 mr-3 select-none">➜</span>
              <div className="w-2.5 h-4 bg-accent-indigo animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
            </div>
          )}
        </div>
      </div>
    </ClientOnly>
  );
}
