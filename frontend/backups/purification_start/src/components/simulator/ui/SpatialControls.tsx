"use client";

import type { HeroPosition } from "@/components/simulator/engine/types";
import { SotaTooltip } from "@/components/simulator/ui/SotaTooltip";
import React from "react";

interface SpatialControlsProps {
  heroPosition: HeroPosition;
  handleHeroPositionChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  heroInvested: number;
  setHeroInvested: (v: number) => void;
  currentPot: number;
  setCurrentPot: (v: number) => void;
  activePlayers: number;
  setActivePlayers: (v: number) => void;
  isPredictive: boolean;
  setIsPredictive: (v: boolean) => void;
}

export const SpatialControls = ({
  heroPosition,
  handleHeroPositionChange,
  heroInvested,
  setHeroInvested,
  currentPot,
  setCurrentPot,
  activePlayers,
  setActivePlayers,
  isPredictive,
  setIsPredictive,
}: Readonly<SpatialControlsProps>) => {
  const isMultiway = activePlayers > 2;

  return (
    <div className="glass-panel p-6! mb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 items-end relative animate-sota-in">
      <div className="absolute top-4 right-6 flex items-center gap-2">
        <span
          id="label-antevisao"
          className="text-[0.55rem] font-black text-text-darker uppercase tracking-widest"
        >
          Modo Antevisão
        </span>
        <button
          aria-labelledby="label-antevisao"
          aria-checked={isPredictive}
          role="switch"
          onClick={() => setIsPredictive(!isPredictive)}
          className={`w-8 h-4 rounded-full transition-all relative focus-visible:ring-2 focus-visible:ring-accent-emerald focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base ${isPredictive ? "bg-accent-emerald" : "bg-bg-deep border border-white/10"}`}
        >
          <div
            className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isPredictive ? "left-4.5" : "left-0.5"}`}
          />
        </button>
      </div>

      <div className="space-y-2">
        <SotaTooltip
          align="left"
          title="Ponto Zero"
          desc="Sua desvantagem estrutural inicial."
        >
          <label
            id="label-hero-pos"
            htmlFor="sim-hero-pos"
            className="text-[0.65rem] font-black uppercase tracking-widest text-text-muted cursor-help hover:text-accent-indigo transition-colors"
          >
            Posição (Ponto Zero)
          </label>
        </SotaTooltip>
        <select
          id="sim-hero-pos"
          value={heroPosition}
          onChange={handleHeroPositionChange}
          aria-labelledby="label-hero-pos"
          className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs font-bold text-text-bright focus:bg-black/60 focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo/50 transition-all shadow-inner outline-none cursor-pointer"
        >
          <option value="BB">Big Blind [-1 BB]</option>
          <option value="SB">Small Blind [-0.5 BB]</option>
          <option value="IP">Outras Posições [0 BB]</option>
        </select>
      </div>

      <div className="space-y-2">
        <SotaTooltip
          align="center"
          title="Investimento"
          desc="O abismo do seu EV de Fold."
        >
          <label
            htmlFor="sim-hero-invest"
            className="text-[0.65rem] font-black uppercase tracking-widest text-text-muted cursor-help hover:text-accent-indigo transition-colors"
          >
            Sunk Cost (Investido)
          </label>
        </SotaTooltip>
        <div className="relative group">
          <input
            id="sim-hero-invest"
            type="number"
            step="0.5"
            value={heroInvested}
            onChange={(e) => setHeroInvested(Number(e.target.value))}
            className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs font-mono tabular-nums text-text-bright focus:bg-black/60 focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo/50 transition-all shadow-inner outline-none"
          />
          <span className="absolute right-3 top-2.5 text-[0.6rem] text-text-darker font-bold">
            BB
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <SotaTooltip
          align="center"
          title="Dead Money"
          desc="O oxigênio do torneio."
        >
          <label
            htmlFor="sim-current-pot"
            className="text-[0.65rem] font-black uppercase tracking-widest text-text-muted cursor-help hover:text-accent-indigo transition-colors"
          >
            Pote Atual
          </label>
        </SotaTooltip>
        <div className="relative">
          <input
            id="sim-current-pot"
            type="number"
            step="0.5"
            value={currentPot}
            onChange={(e) => setCurrentPot(Number(e.target.value))}
            className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs font-mono tabular-nums text-text-bright focus:bg-black/60 focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo/50 transition-all shadow-inner outline-none"
          />
          <span className="absolute right-3 top-2.5 text-[0.6rem] text-text-darker font-bold">
            BB
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <SotaTooltip
          align="right"
          title="Entropia Multiway"
          desc="Ações escalam quadraticamente o RIO."
        >
          <label
            htmlFor="sim-active-players"
            className={`text-[0.65rem] font-black uppercase tracking-widest cursor-help transition-colors ${isMultiway ? "text-accent-danger hover:text-accent-rose" : "text-text-muted hover:text-accent-indigo"}`}
          >
            Jogadores
          </label>
        </SotaTooltip>
        <input
          id="sim-active-players"
          type="number"
          min="2"
          max="9"
          value={activePlayers}
          onChange={(e) => setActivePlayers(Number(e.target.value))}
          className={`w-full bg-black/40 rounded-lg p-2.5 text-xs font-black focus:bg-black/60 focus:ring-1 transition-all shadow-inner outline-none ${isMultiway ? "border-accent-danger/40 text-accent-danger focus:border-accent-danger focus:ring-accent-danger/50" : "border-white/10 text-text-bright focus:border-accent-indigo focus:ring-accent-indigo/50"}`}
        />
      </div>

      <div className="space-y-2">
        <SotaTooltip
          align="right"
          title="FGS Control"
          desc={
            isPredictive
              ? "Cálculo Automático via Motor SOTA."
              : "Ajuste manual da erosão de stack."
          }
        >
          <label
            htmlFor="sim-fgs-control"
            className="text-[0.65rem] font-black uppercase tracking-widest text-text-muted cursor-help hover:text-accent-indigo transition-colors"
          >
            FGS / Erosão
          </label>
        </SotaTooltip>
        <div className="flex gap-2">
          <input
            id="sim-fgs-control"
            type="range"
            disabled={isPredictive}
            className={`flex-1 h-1.5 mt-4 rounded-full appearance-none transition-opacity ${isPredictive ? "opacity-20 cursor-not-allowed" : "bg-white/10 accent-accent-indigo cursor-pointer"}`}
          />
          <span
            className={`text-[0.65rem] font-mono font-bold w-10 text-center ${isPredictive ? "text-accent-emerald" : "text-text-muted"}`}
          >
            {isPredictive ? "AUTO" : "MAN"}
          </span>
        </div>
      </div>
    </div>
  );
};
