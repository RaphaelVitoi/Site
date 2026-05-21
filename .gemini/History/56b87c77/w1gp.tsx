"use client";

/**
 * IDENTITY: Palco do Cenário SOTA Quantum v4.2 Gold
 * PATH: src/components/simulator/panels/ScenarioStage.tsx
 * ROLE: Exibir a narrativa tática e os medidores de risco com refinamento estético extremo.
 * BINDING: [engine/types.ts, engine/utils.ts, ui/RiskGauge]
 */

import type { Scenario } from "../engine/types";
import RiskGauge from "../ui/RiskGauge";
import { calcBF } from "@/components/simulator/engine/utils";

const MORPH_TOOLTIPS: Record<string, string> = {
  "Valor Estrito":
    "Aposta quase exclusivamente por valor. O RP alto torna blefes matematicamente insolventes.",
  Especulativo:
    "Ranges mistos focados em realizar equidade e especular implied odds sem compromisso total.",
  "Polar Máximo":
    "Apenas o topo e o vácuo absoluto. Resultado de pressão de shove que elimina mãos médias.",
  "Modo Predador":
    "Vantagem de Risco total. A Esperança Matemática favorece agressão máxima contra stacks agonizantes.",
  Condensado:
    "Range de mãos médias incapaz de aplicar pressão. O ICM força a passividade estrutural.",
  "Call Seletivo":
    "Defesa ancorada apenas no Teto de Risco. O OOP abandona qualquer mão que não cubra o RP.",
  "Zona de Paralisia":
    "RP > 40%: O custo do confronto supera o ganho de chips. Fold Nash-obrigatório.",
  "Defesa Base":
    "Equilíbrio padrão em ChipEV. MDF opera sem distorção monetária.",
};

interface ScenarioStageProps {
  scenario: Scenario;
  effectiveIpRp?: number;
  effectiveOopRp?: number;
  /** SOTA: Horizonte dinâmico vindo do motor quântico */
  dynamicDeathZone?: number;
}

export default function ScenarioStage({
  scenario,
  effectiveIpRp = scenario.ipRp,
  effectiveOopRp = scenario.oopRp,
  dynamicDeathZone,
}: Readonly<ScenarioStageProps>) {
  const ipMorph = scenario.ipMorph ?? "--";
  const oopMorph = scenario.oopMorph ?? "--";
  const isNodelockB20 =
    scenario.name?.includes("B20") || scenario.narrativeTitle?.includes("B20");

  return (
    <div className="glass-panel p-10 sm:p-12 lg:p-16 animate-sota-in rounded-4xl bg-bg-panel/80 backdrop-blur-3xl border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] relative transition-all duration-700 hover:border-white/20 group/stage">
      {/* Depth Layers Gold */}
      <div className="absolute inset-0 overflow-hidden rounded-4xl pointer-events-none">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-accent-indigo/10 blur-[120px] rounded-full pointer-events-none group-hover/stage:bg-accent-indigo/20 transition-all duration-1000" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-accent-emerald/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      {/* Header Refinado com Hierarquia Clara */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-10 border-b border-white/5 pb-12 relative z-10">
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-2.5 h-2.5 rounded-full bg-accent-indigo shadow-[0_0_15px_var(--accent-indigo)] animate-pulse" />
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-none m-0">
              {isNodelockB20
                ? "Ancoragem: Block Bet (20%)"
                : scenario.narrativeTitle}
            </h2>
          </div>
          <div className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 inline-flex items-center gap-3">
            <i className="fa-solid fa-layer-group text-accent-indigo text-[0.7rem]" />
            <span className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-text-muted">
              {scenario.narrativeSubtitle}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <span className="text-[0.55rem] font-black text-text-darker uppercase tracking-[0.4em]">
            Diagnóstico SOTA
          </span>
          <div className="px-6 py-3 rounded-2xl bg-accent-rose/10 border border-accent-rose/20 text-[0.7rem] font-black text-accent-rose-light uppercase tracking-widest shadow-2xl flex items-center gap-3 active:scale-95 transition-transform">
            <div className="w-2 h-2 rounded-full bg-accent-rose animate-pulse shadow-[0_0_10px_var(--accent-rose)]" />
            {scenario.verdict}
          </div>
        </div>
      </div>

      {/* Box de Teoria com Estética High-End */}
      <div className="my-12 relative group/theory">
        <div className="absolute -inset-0.5 bg-linear-to-r from-accent-indigo/20 via-transparent to-accent-rose/20 rounded-3xl opacity-0 group-hover/theory:opacity-100 transition-opacity duration-700 blur-sm" />
        <div
          className={`relative p-10 rounded-3xl border transition-all duration-700 shadow-inner ${isNodelockB20 ? "bg-accent-indigo/10 border-accent-indigo/30 shadow-accent-indigo/5" : "bg-slate-950/40 border-white/5 hover:bg-slate-950/60 hover:border-white/10"} text-[0.95rem] leading-loose`}
        >
          {isNodelockB20 ? (
            <p className="text-indigo-100/80 font-medium italic m-0">
              &quot;A dinâmica foi travada via Nodelock. Agressor forçado a
              apostar pequeno para absorver fold equity sem inflar as
              RIOs.&quot;
            </p>
          ) : (
            <div
              className="text-indigo-100/80 font-medium italic prose prose-invert max-w-none prose-p:m-0 prose-p:inline prose-strong:text-white prose-strong:font-black"
              dangerouslySetInnerHTML={{ __html: scenario.theory }}
            />
          )}
          <div className="absolute bottom-4 right-6 flex items-center gap-2 opacity-30 group-hover/theory:opacity-60 transition-opacity">
            <i className="fa-solid fa-quote-right text-accent-indigo text-lg" />
          </div>
        </div>
      </div>

      {/* Grid de Medidores - Simetria SOTA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 pt-6 relative z-10">
        <div className="flex flex-col items-center gap-10 group/ip transition-all duration-500">
          <RiskGauge
            value={effectiveIpRp}
            label="Agressor (IP)"
            pos={scenario.ipPos}
            stack={ipMorph}
            stackTooltip={MORPH_TOOLTIPS[ipMorph]}
            opponentValue={effectiveOopRp}
            {...(dynamicDeathZone === undefined ? {} : { dynamicDeathZone })}
          />
          <div className="bg-slate-900/60 px-10 py-5 rounded-2xl border border-white/5 text-center group-hover/ip:border-accent-indigo/40 group-hover/ip:bg-slate-900/80 transition-all shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-radial-[at_center_center] from-accent-indigo/10 to-transparent opacity-0 group-hover/ip:opacity-100 transition-opacity" />
            <span className="text-[0.6rem] font-black text-text-darker uppercase tracking-[0.4em] block mb-3 group-hover/ip:text-accent-indigo-light transition-colors relative z-10">
              Impacto Posicional
            </span>
            <div className="flex items-center justify-center gap-4 relative z-10">
              <span className="text-[0.9rem] font-mono font-black text-white tracking-tighter">
                {effectiveIpRp.toFixed(1)}%{" "}
                <span className="text-text-darker text-[0.6rem] ml-1">RP</span>
              </span>
              <div className="w-px h-6 bg-white/10" />
              <span className="text-[0.9rem] font-mono font-black text-white tracking-tighter">
                {calcBF(effectiveIpRp).toFixed(2)}x{" "}
                <span className="text-text-darker text-[0.6rem] ml-1">BF</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-10 group/oop transition-all duration-500">
          <RiskGauge
            value={effectiveOopRp}
            label="Defensor (OOP)"
            pos={scenario.oopPos}
            stack={oopMorph}
            stackTooltip={MORPH_TOOLTIPS[oopMorph]}
            opponentValue={effectiveIpRp}
          />
          <div className="bg-slate-900/60 px-10 py-5 rounded-2xl border border-white/5 text-center group-hover/oop:border-accent-rose/40 group-hover/oop:bg-slate-900/80 transition-all shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-radial-[at_center_center] from-accent-rose/10 to-transparent opacity-0 group-hover/oop:opacity-100 transition-opacity" />
            <span className="text-[0.6rem] font-black text-text-darker uppercase tracking-[0.4em] block mb-3 group-hover/oop:text-accent-rose-light transition-colors relative z-10">
              Vulnerabilidade
            </span>
            <div className="flex items-center justify-center gap-4 relative z-10">
              <span className="text-[0.9rem] font-mono font-black text-white tracking-tighter">
                {effectiveOopRp.toFixed(1)}%{" "}
                <span className="text-text-darker text-[0.6rem] ml-1">RP</span>
              </span>
              <div className="w-px h-6 bg-white/10" />
              <span className="text-[0.9rem] font-mono font-black text-white tracking-tighter">
                {calcBF(effectiveOopRp).toFixed(2)}x{" "}
                <span className="text-text-darker text-[0.6rem] ml-1">BF</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
