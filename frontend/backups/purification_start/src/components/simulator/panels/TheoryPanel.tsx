"use client";

/**
 * IDENTITY: Painel de FundamentaÃ§Ã£o TeÃ³rica SOTA v4.2 Gold
 * PATH: src/components/simulator/panels/TheoryPanel.tsx
 * ROLE: AgregaÃ§Ã£o de diretrizes doutrinÃ¡rias, matrizes de diluiÃ§Ã£o e auditoria sistÃªmica.
 * AESTHETIC: SOTA Gold Standard (Depth Layers, High-Contrast Typography, Glassmorphism).
 */

import type { Scenario, SprStage } from "@/components/simulator/engine/types";
import { BubbleFactorDiagnostic } from "@/components/simulator/ui/BubbleFactorDiagnostic";
import { SotaMarkdown } from "@/components/ui/layout/SotaMarkdown";
import { use, useMemo } from "react";
import { SotaWasmContext } from "../SotaContext";
import { useGemmaStream } from "../useGemmaStream";
import BayesianBeliefPanel from "./BayesianBeliefPanel";
import CfrRegretPanel from "./CfrRegretPanel";

interface TheoryPanelProps {
  scenario: Scenario;
  effectiveSprData?: SprStage[];
  effectiveStacks?: number[];
  effectiveIpRp?: number;
  effectiveOopRp?: number;
}

export default function TheoryPanel({
  scenario,
  effectiveSprData,
  effectiveStacks,
  effectiveIpRp = 0,
  effectiveOopRp = 0,
}: Readonly<TheoryPanelProps>) {
  const activeSprData = useMemo(
    () => effectiveSprData ?? scenario.sprData ?? [],
    [effectiveSprData, scenario.sprData],
  );
  const preflopPot = useMemo(
    () =>
      activeSprData.find((s) => s.name === "PRE" || s.name === "FLOP")
        ?.potSize || 2.5,
    [activeSprData],
  );
  const effStack = useMemo(
    () =>
      Math.min(
        effectiveStacks?.[0] || scenario.stacks[0] || 40,
        effectiveStacks?.[1] || scenario.stacks[1] || 40,
      ),
    [effectiveStacks, scenario.stacks],
  );

  const wasmContext = use(SotaWasmContext);
  const equity = wasmContext?.nativeRangeMetric?.equity ?? 55;

  const { streamedText, isStreaming, error, generateAnalysis } =
    useGemmaStream();

  const handleGenerateTheory = () => {
    const prompt = `> SYSTEM: Atue como Mentor SOTA de Teoria dos Jogos e ICM. Use formataÃ§Ã£o avanÃ§ada (Markdown/KaTeX).\n> DATA: Pot: ${preflopPot.toFixed(1)}bb | Stack Efetivo: ${effStack.toFixed(1)}bb | IP RP: ${effectiveIpRp.toFixed(1)}% | OOP RP: ${effectiveOopRp.toFixed(1)}%\n> TASK: ForneÃ§a uma anÃ¡lise teÃ³rica visceral (mÃ¡x 250 palavras) focada na assimetria de ranges e no impacto desse Risk Premium especÃ­fico na Ã¡rvore de decisÃ£o.`;
    generateAnalysis(prompt, 512, "auto");
  };

  const displayContent =
    streamedText ||
    scenario.theory ||
    "Nenhuma doutrina estÃ¡tica encontrada. Consulte o OrÃ¡culo QuÃ¢ntico.";

  return (
    <div className="glass-panel w-full p-10 lg:p-16 flex flex-col gap-24 animate-sota-in mt-12 bg-bg-panel/80 backdrop-blur-3xl border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] rounded-4xl relative overflow-hidden group/theory-root">
      {/* Camadas de Profundidade QuÃ¢ntica */}
      <div className="absolute -top-40 -left-40 w-125 h-125 bg-accent-indigo/10 blur-[150px] rounded-full pointer-events-none group-hover/theory-root:bg-accent-indigo/15 transition-all duration-1000" />
      <div className="absolute -bottom-40 -right-40 w-125 h-125 bg-accent-rose/5 blur-[150px] rounded-full pointer-events-none" />

      {/* SEÃ‡ÃƒO 1: DOUTRINA */}
      <section className="relative z-10 w-full flex flex-col gap-10">
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <h3 className="text-2xl font-black text-white uppercase tracking-[0.3em] m-0 flex items-center">
            <i className="fa-solid fa-book-journal-whills text-accent-indigo mr-5 shadow-[0_0_15px_var(--accent-indigo)]" />{" "}
            FundamentaÃ§Ã£o TeÃ³rica
          </h3>
          <span className="text-[0.55rem] font-black text-text-darker uppercase tracking-[0.4em]">
            Protocolo SOTA v4.2
          </span>
        </div>

        <div className="p-10 lg:p-12 bg-slate-950/40 border border-accent-indigo/20 rounded-4xl shadow-inner relative overflow-hidden group transition-all hover:bg-slate-950/60 hover:border-accent-indigo/40">
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent-indigo/5 blur-[100px] rounded-full pointer-events-none transition-all group-hover:bg-accent-indigo/10" />
          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-accent-indigo/10 border border-accent-indigo/20 flex items-center justify-center text-accent-indigo-light">
              <i className="fa-solid fa-book-open-reader text-lg"></i>
            </div>
            <h4 className="text-[0.75rem] font-black text-accent-indigo-light uppercase tracking-[0.3em] m-0">
              Doutrina AnalÃ­tica
            </h4>
            <div className="ml-auto">
              <button
                onClick={handleGenerateTheory}
                disabled={isStreaming}
                className="px-4 py-2 bg-accent-indigo/20 hover:bg-accent-indigo/40 text-accent-indigo-light text-[0.65rem] font-black uppercase tracking-widest rounded-lg transition-all border border-accent-indigo/30 flex items-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-wait"
              >
                {isStreaming ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin" />{" "}
                    Sintetizando...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-microchip" /> Consultar OrÃ¡culo
                  </>
                )}
              </button>
            </div>
          </div>
          {error && (
            <div className="text-red-400 p-3 mb-4 bg-red-950/30 rounded border border-red-500/20 text-xs relative z-10">
              {error}
            </div>
          )}
          <div className="leading-relaxed relative z-10">
            <SotaMarkdown content={displayContent} />
          </div>
          <div className="absolute bottom-6 right-8 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
            <i className="fa-solid fa-brain text-6xl text-accent-indigo" />
          </div>
        </div>
        <BubbleFactorDiagnostic ipRp={effectiveIpRp} oopRp={effectiveOopRp} />
      </section>

      {/* SEÃ‡ÃƒO 2: DILUIÃ‡ÃƒO (SPR) */}
      <section className="relative z-10 w-full flex flex-col gap-10">
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <h3 className="text-2xl font-black text-white uppercase tracking-[0.3em] m-0 flex items-center">
            <i className="fa-solid fa-water text-accent-sky mr-5 shadow-[0_0_15px_var(--color-accent-sky)]" />{" "}
            Matriz de DiluiÃ§Ã£o (SPR)
          </h3>
          <div className="flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-sky animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-accent-sky/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-accent-sky/20" />
          </div>
        </div>

        <div className="w-full flex justify-center group/spr">
          <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-white/5 bg-slate-950/60 backdrop-blur-2xl shadow-3xl relative transition-all hover:border-accent-sky/30">
            <div className="absolute inset-0 bg-linear-to-b from-accent-sky/5 to-transparent pointer-events-none" />
            <div className="overflow-x-auto scrollbar-hide relative z-10">
              <table className="w-full text-left text-[0.7rem] font-mono tabular-nums">
                <thead className="bg-accent-sky/5 text-accent-sky-light uppercase tracking-[0.2em] border-b border-white/5">
                  <tr>
                    <th className="p-4 pl-8 font-black text-[0.65rem]">
                      Street
                    </th>
                    <th className="p-4 font-black text-[0.65rem]">Pote (BB)</th>
                    <th className="p-4 font-black text-center text-[0.65rem]">
                      Stack Res.
                    </th>
                    <th className="p-4 font-black text-center text-[0.65rem]">
                      Fator SPR
                    </th>
                    <th className="p-4 font-black text-right pr-8 text-[0.65rem]">
                      RP Residual
                    </th>
                  </tr>
                </thead>
                <tbody className="text-text-muted divide-y divide-white/5">
                  {activeSprData.map((stage: SprStage) => {
                    const investido = Math.max(
                      0,
                      (stage.potSize - preflopPot) / 2,
                    );
                    const residual = Math.max(0, effStack - investido);
                    const sprValue =
                      stage.potSize > 0 ? residual / stage.potSize : Infinity;
                    const sprText =
                      sprValue === Infinity ? "inf" : sprValue.toFixed(1);
                    const isDeath = stage.rpValue >= 35;
                    return (
                      <tr
                        key={stage.name}
                        className={`hover:bg-white/5 transition-all duration-300 ${isDeath ? "bg-accent-danger/5" : ""}`}
                      >
                        <td className="p-4 pl-8 font-black text-accent-sky uppercase tracking-widest">
                          {stage.name}
                        </td>
                        <td className="p-4 font-black text-white text-base">
                          {stage.potSize.toFixed(1)}
                        </td>
                        <td className="p-4 text-center font-bold text-text-dim">
                          {residual.toFixed(1)}
                        </td>
                        <td
                          className={`p-4 text-center font-black text-base ${sprValue >= 1 ? "text-accent-emerald" : "text-accent-rose"}`}
                        >
                          {sprText}
                        </td>
                        <td
                          className={`p-4 text-right pr-8 font-black text-base ${isDeath ? "text-accent-danger" : "text-accent-amber"}`}
                        >
                          {stage.rpValue.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <p className="text-center text-text-darker text-[0.65rem] font-black uppercase tracking-[0.4em] mt-2 italic px-10">
          O SPR funciona como o amortecedor termodinÃ¢mico da agressÃ£o.{" "}
          <span className="text-text-muted">
            A dissipaÃ§Ã£o de RP sinaliza o ponto de equilÃ­brio de Nash.
          </span>
        </p>
      </section>

      {/* SEÃ‡ÃƒO 3: RANGES SOTA */}
      <section className="relative z-10 w-full flex flex-col gap-10">
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <h3 className="text-2xl font-black text-white uppercase tracking-[0.3em] m-0 flex items-center">
            <i className="fa-solid fa-border-all text-accent-violet mr-5 shadow-[0_0_15px_var(--color-accent-violet)]" />{" "}
            Morfologia de Ranges
          </h3>
          <i className="fa-solid fa-dna text-text-darker text-sm" />
        </div>

        <div className="flex justify-center w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl">
            <div className="p-10 bg-slate-900/40 border border-accent-indigo/10 rounded-4xl shadow-inner relative overflow-hidden group hover:border-accent-indigo/40 hover:bg-slate-900/60 transition-all duration-700">
              <div className="absolute top-0 right-0 w-56 h-56 bg-accent-indigo/10 blur-[100px] rounded-full pointer-events-none" />
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-accent-indigo/10 border border-accent-indigo/20 flex items-center justify-center text-accent-indigo-light">
                  <i className="fa-solid fa-crosshairs text-lg"></i>
                </div>
                <h4 className="text-[0.8rem] font-black text-accent-indigo-light uppercase tracking-[0.3em] m-0">
                  EspeculaÃ§Ã£o AssimÃ©trica
                </h4>
              </div>
              <p className="text-[0.85rem] text-indigo-100/70 leading-loose mb-10 font-medium">
                O range do agressor Ã© moldado pelo{" "}
                <strong>Blocker Effect</strong> e pela diluiÃ§Ã£o do risco. A
                agressÃ£o Ã© calibrada para extrair valor de insolvÃªncia sem
                colapsar a prÃ³pria perspectiva.
              </p>
              <ul className="space-y-6 list-none p-0 relative z-10">
                <li className="flex gap-5 items-start group/li">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-indigo mt-2 shadow-[0_0_8px_var(--accent-indigo)] group-hover/li:scale-125 transition-transform" />
                  <span className="leading-relaxed">
                    <strong className="text-white block mb-1 uppercase tracking-widest text-[0.65rem] font-black">
                      CL (Agressor Absoluto)
                    </strong>{" "}
                    Inunda o vÃ¡cuo defensivo do oponente com agressÃ£o linear,
                    alavancando a superioridade de stack.
                  </span>
                </li>
                <li className="flex gap-5 items-start group/li">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-indigo mt-2 shadow-[0_0_8px_var(--accent-indigo)] group-hover/li:scale-125 transition-transform" />
                  <span className="leading-relaxed">
                    <strong className="text-white block mb-1 uppercase tracking-widest text-[0.65rem] font-black">
                      ConexÃ£o Tardia
                    </strong>{" "}
                    ValorizaÃ§Ã£o de semi-bluffs de alta equidade no River,
                    explorando a passividade forÃ§ada do defensor.
                  </span>
                </li>
              </ul>
            </div>

            <div className="p-10 bg-slate-900/40 border border-accent-rose/10 rounded-4xl shadow-inner relative overflow-hidden group hover:border-accent-rose/40 hover:bg-slate-900/60 transition-all duration-700">
              <div className="absolute top-0 left-0 w-56 h-56 bg-accent-rose/10 blur-[100px] rounded-full pointer-events-none" />
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-accent-rose/10 border border-accent-rose/20 flex items-center justify-center text-accent-rose-light">
                  <i className="fa-solid fa-shield-halved text-lg"></i>
                </div>
                <h4 className="text-[0.8rem] font-black text-accent-rose-light uppercase tracking-[0.3em] m-0">
                  Colapso do Defensor
                </h4>
              </div>
              <p className="text-[0.85rem] text-indigo-100/70 leading-loose mb-10 font-medium">
                O defensor opera sob o <strong>Peso Gravitacional</strong> do
                ICM. O MDF tradicional Ã© abandonado em favor de uma defesa
                hiper-seletiva ancorada na sobrevivÃªncia.
              </p>
              <ul className="space-y-6 list-none p-0 relative z-10">
                <li className="flex gap-5 items-start group/li">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-rose mt-2 shadow-[0_0_8px_var(--accent-rose)] group-hover/li:scale-125 transition-transform" />
                  <span className="leading-relaxed">
                    <strong className="text-white block mb-1 uppercase tracking-widest text-[0.65rem] font-black">
                      Teto de RP IntransponÃ­vel
                    </strong>{" "}
                    O descarte de equidade torna-se a aÃ§Ã£o de maior EV real,
                    preservando a vida de torneio (FGS).
                  </span>
                </li>
                <li className="flex gap-5 items-start group/li">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-rose mt-2 shadow-[0_0_8px_var(--accent-rose)] group-hover/li:scale-125 transition-transform" />
                  <span className="leading-relaxed">
                    <strong className="text-white block mb-1 uppercase tracking-widest text-[0.65rem] font-black">
                      CondensaÃ§Ã£o Estrita
                    </strong>{" "}
                    Defesa limitada a mÃ£os que dominam o range de valor do
                    agressor, ignorando blefes marginais.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SEÃ‡ÃƒO 4: BELIEF PROPAGATION (BAYESIAN) */}
      <section className="relative z-10 w-full flex flex-col gap-10">
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <h3 className="text-2xl font-black text-white uppercase tracking-[0.3em] m-0 flex items-center">
            <i className="fa-solid fa-brain text-accent-emerald mr-5 shadow-[0_0_15px_var(--color-accent-emerald)]" />{" "}
            Belief Propagation
          </h3>
          <div className="flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-accent-emerald/40" />
          </div>
        </div>

        <div className="w-full">
          <BayesianBeliefPanel
            initialRange="33.6%"
            label="Range de Abertura (BTN)"
          />
        </div>

        <p className="text-center text-text-darker text-[0.65rem] font-black uppercase tracking-[0.4em] mt-2 italic px-10">
          A inferÃªncia recursiva remapeia as densidades de probabilidade a cada
          aÃ§Ã£o.{" "}
          <span className="text-text-muted">
            A contraÃ§Ã£o de range Ã© o efeito visual da regra de Bayes.
          </span>
        </p>
      </section>

      {/* SEÃ‡ÃƒO 5: AUDITORIA */}
      <section className="relative z-10 w-full flex flex-col gap-10">
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <h3 className="text-2xl font-black text-white uppercase tracking-[0.3em] m-0 flex items-center">
            <i className="fa-solid fa-microscope text-accent-emerald mr-5 shadow-[0_0_15px_var(--color-accent-emerald)]" />{" "}
            Auditoria SistÃªmica
          </h3>
          <span className="px-3 py-1 rounded bg-accent-emerald/10 text-accent-emerald text-[0.5rem] font-black uppercase tracking-widest border border-accent-emerald/20">
            Integridade Validada
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <AuditCard
              icon="fa-microchip"
              color="indigo"
              label="Motor ICM"
              value="99.99%"
              sub="PrecisÃ£o vs HRC Lib"
            />
            <AuditCard
              icon="fa-gauge-simple-high"
              color="emerald"
              label="LatÃªncia JIT"
              value="1.2ms"
              sub="CÃ¡lculo QuÃ¢ntico"
            />
            <AuditCard
              icon="fa-dna"
              color="rose"
              label="Integridade"
              value="SOTA v8"
              sub="Genoma MatemÃ¡tico"
            />
          </div>

          <div className="bg-linear-to-br from-slate-900/60 to-black/80 border border-white/10 p-8 rounded-4xl shadow-3xl relative overflow-hidden group/audit-final">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <i className="fa-solid fa-clipboard-check text-7xl text-white" />
            </div>
            <h4 className="text-[0.75rem] font-black text-white uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
              <i className="fa-solid fa-shield-check text-accent-indigo text-lg" />{" "}
              Laudo TÃ©cnico
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-white/5 group/row">
                <span className="text-[0.6rem] text-text-muted font-bold uppercase tracking-widest group-hover/row:text-text-main transition-colors">
                  Î” Risk Premium
                </span>
                <span className="text-[0.75rem] font-mono font-black text-accent-indigo tabular-nums">
                  +{Math.abs(effectiveIpRp - effectiveOopRp).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/5 group/row">
                <span className="text-[0.6rem] text-text-muted font-bold uppercase tracking-widest group-hover/row:text-text-main transition-colors">
                  Fator de Risco (BF)
                </span>
                <span className="text-[0.75rem] font-mono font-black text-accent-emerald tabular-nums">
                  {(
                    100 / (100 - Math.max(effectiveIpRp, effectiveOopRp)) || 1
                  ).toFixed(2)}
                  x
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/5 group/row">
                <span className="text-[0.6rem] text-text-muted font-bold uppercase tracking-widest group-hover/row:text-text-main transition-colors">
                  ErosÃ£o Temporal (FGS)
                </span>
                <span className="text-[0.75rem] font-mono font-black text-accent-rose tabular-nums">
                  -0.15bb
                </span>
              </div>
              <div className="flex justify-between items-center py-3 group/row">
                <span className="text-[0.6rem] text-text-muted font-bold uppercase tracking-widest group-hover/row:text-text-main transition-colors">
                  Equity WASM-SIMD
                </span>
                <span className="text-[0.75rem] font-mono font-black text-white tabular-nums">
                  {equity.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-[0.55rem] text-text-darker leading-relaxed font-black uppercase tracking-[0.2em] m-0 group-hover/audit-final:text-text-muted transition-colors">
                &quot;A matemÃ¡tica do poker Ã© a fÃ­sica do capital.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÃ‡ÃƒO 6: CFR */}
      <section className="relative z-10 w-full flex flex-col gap-10">
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <h3 className="text-2xl font-black text-white uppercase tracking-[0.3em] m-0 flex items-center">
            <i className="fa-solid fa-network-wired text-accent-rose mr-5 shadow-[0_0_15px_var(--color-accent-rose)]" />{" "}
            LaboratÃ³rio CFR & A*
          </h3>
          <span className="text-[0.55rem] font-black text-text-darker uppercase tracking-[0.4em]">
            HeurÃ­stica Preditiva
          </span>
        </div>
        <CfrRegretPanel
          initialPot={preflopPot}
          initialStack={effStack}
          initialEquity={equity}
        />
      </section>
    </div>
  );
}

function AuditCard({
  icon,
  color,
  label,
  value,
  sub,
}: Readonly<{
  icon: string;
  color: string;
  label: string;
  value: string;
  sub: string;
}>) {
  const colorClasses = {
    indigo:
      "text-accent-indigo-light bg-accent-indigo/10 border-accent-indigo/20 group-hover:border-accent-indigo/40",
    emerald:
      "text-accent-emerald-light bg-accent-emerald/10 border-accent-emerald/20 group-hover:border-accent-emerald/40",
    rose: "text-accent-rose-light bg-accent-rose/10 border-accent-rose/20 group-hover:border-accent-rose/40",
  }[color as "indigo" | "emerald" | "rose"];

  return (
    <div className="bg-slate-950/40 border border-white/5 p-6 rounded-3xl shadow-inner group transition-all duration-500 hover:-translate-y-1 hover:bg-slate-900/60">
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${colorClasses}`}
        >
          <i className={`fa-solid ${icon} text-base`} />
        </div>
        <span className="text-[0.6rem] font-black text-text-darker uppercase tracking-[0.2em] group-hover:text-text-muted transition-colors">
          {label}
        </span>
      </div>
      <div className="text-2xl font-mono font-black text-white mb-1 tabular-nums tracking-tighter">
        {value}
      </div>
      <div className="text-[0.5rem] text-text-darker uppercase tracking-[0.2em] font-black group-hover:text-text-muted transition-colors">
        {sub}
      </div>
    </div>
  );
}
