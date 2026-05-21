"use client";

import { SotaTooltip } from "@/components/simulator/ui/SotaTooltip";

interface GuideToolbarProps {
  onExport: () => void;
}

export const GuideToolbar = ({ onExport }: Readonly<GuideToolbarProps>) => (
  <div className="flex flex-wrap items-center justify-between gap-6 glass-panel p-5 mb-6 animate-sota-in rounded-2xl border border-white/5 shadow-lg">
    <div className="flex flex-wrap items-center gap-5">
      <span className="text-[0.65rem] font-black uppercase tracking-widest text-text-dim opacity-70">
        Guia SOTA
      </span>
      <div className="w-px h-4 bg-white/10 hidden sm:block"></div>
      <SotaTooltip
        align="left"
        title="Delta (Δ)"
        desc="Diferença matemática absoluta entre dois estados."
      >
        <span className="text-[0.7rem] font-bold text-text-muted cursor-help hover:text-accent-indigo flex items-center gap-2 transition-colors bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 hover:border-accent-indigo/30">
          <i className="fa-solid fa-triangle-exclamation text-accent-indigo-light"></i>{" "}
          Δ Delta
        </span>
      </SotaTooltip>
      <SotaTooltip
        align="center"
        title="Pontos Percentuais (p.p.)"
        desc="Diferença aritmética real entre porcentagens."
      >
        <span className="text-[0.7rem] font-bold text-text-muted cursor-help hover:text-accent-indigo flex items-center gap-2 transition-colors bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 hover:border-accent-indigo/30">
          <i className="fa-solid fa-percent text-accent-indigo-light"></i> p.p.
        </span>
      </SotaTooltip>
      <div className="w-px h-4 bg-white/10 hidden sm:block"></div>
      <SotaTooltip
        align="right"
        title="Física Sincronizada"
        desc="A mesa respira em tempo real. Cada ajuste de stack altera a gravidade de todos os simuladores."
      >
        <span className="text-[0.7rem] font-black text-accent-emerald flex items-center gap-2 uppercase tracking-widest bg-accent-emerald/5 px-3 py-1.5 rounded-lg border border-accent-emerald/20 shadow-inner">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse"></span>{" "}
          Quantum Sync
        </span>
      </SotaTooltip>
    </div>
    <div>
      <button
        onClick={onExport}
        className="flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-accent-indigo/20 border border-white/10 hover:border-accent-indigo/50 text-text-muted hover:text-white rounded-xl text-[0.65rem] font-black uppercase tracking-widest transition-all shadow-md"
      >
        <i className="fa-solid fa-file-export text-accent-indigo"></i> Exportar
        HRC
      </button>
    </div>
  </div>
);
