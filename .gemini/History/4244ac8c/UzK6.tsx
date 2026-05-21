/**
 * IDENTITY: Laboratório Toy Games (Predator Mode)
 * PATH: src/app/biblioteca/toy-games/page.tsx
 * ROLE: Renderizar cenários didáticos extremos de ICM para gamificação do aprendizado.
 */
"use client";

import { useState } from "react";
import { ContentPageHeader } from "@/components/layout/ContentPageHeader";
import ContentFooter from "@/components/content/ContentFooter";

export type PlayerState = {
  pos: string;
  stack: string;
  rp: number;
  morph: string;
};
export type Scenario = {
  id: string;
  title: string;
  env: string;
  icon: string;
  verdict: { label: string; className: string };
  ip: PlayerState;
  oop: PlayerState;
  theory: string;
  exploit: string;
};

const SCENARIOS_DATABASE: Scenario[] = [
  {
    id: "paradoxo",
    title: "O Paradoxo do Valuation",
    env: "Estrutura Padrão (Mid vs Big)",
    icon: "⚖️",
    verdict: {
      label: "Agressão Estrangulada",
      className: "text-rose-400 border-rose-500/30 bg-rose-950/50",
    },
    ip: {
      pos: "BTN",
      stack: "40 bb",
      rp: 21.4,
      morph: "Inelástico (Valor Estrito)",
    },
    oop: {
      pos: "BB (CL)",
      stack: "55 bb",
      rp: 12.9,
      morph: "Defensivo Condensado",
    },
    theory: `<h3 class="text-white font-bold text-xl mb-4 tracking-tight">O Instinto Traído pela Matemática</h3><p class="text-slate-300 leading-relaxed mb-4 text-[15px]">O senso comum dita que o BTN com 40bb possui conforto suficiente para oprimir a mesa. Contudo, o HRC revela o pesadelo: o "RP de ida" do BTN é quase o dobro do "RP de volta" do BB.</p>`,
    exploit: `<p>Se você é o BTN, a sua Desvantagem de Risco é a sua algema...</p>`,
  },
  {
    id: "pacto",
    title: "O Pacto Silencioso",
    env: "Colisão de Gigantes",
    icon: "🤝",
    verdict: {
      label: "Evitação de Ruína",
      className: "text-indigo-400 border-indigo-500/30 bg-indigo-950/50",
    },
    ip: {
      pos: "Vice CL",
      stack: "65 bb",
      rp: 24.5,
      morph: "Linear Especulativo",
    },
    oop: { pos: "CL", stack: "70 bb", rp: 23.5, morph: "Flat Call Massivo" },
    theory: `<h3 class="text-white font-bold text-xl mb-4 tracking-tight">A Mútua Destruição Assegurada</h3><p class="text-slate-300 leading-relaxed mb-4 text-[15px]">Dois gigantes colidem. É essencial notar que esta dinâmica ocorre quase estritamente entre os dois CLs.</p>`,
    exploit: `<p>O GTO dita passividade. Contudo, se o seu adversário sente que deve mandar na mesa...</p>`,
  },
  {
    id: "batata",
    title: "O Efeito Batata Quente",
    env: "A Dinâmica do Shove",
    icon: "🔥",
    verdict: {
      label: "Transferência de Fardo",
      className: "text-amber-400 border-amber-500/30 bg-amber-950/50",
    },
    ip: { pos: "UTG (Shove)", stack: "25 bb", rp: 15, morph: "Polar Máximo" },
    oop: {
      pos: "BB (Call)",
      stack: "20 bb",
      rp: 19.5,
      morph: "Bluffcatcher Rígido",
    },
    theory: `<h3 class="text-white font-bold text-xl mb-4 tracking-tight">O Peso de Agir Primeiro</h3><p class="text-slate-300 leading-relaxed mb-4 text-[15px]">Quando o UTG faz um open-shove direto, ele altera organicamente a utilidade da mão.</p>`,
    exploit: `<p>Se você é o Agressor, expanda zonas de shove contra adversários aterrorizados.</p>`,
  },
  {
    id: "agonia",
    title: "Agonia do Bluffcatcher",
    env: "Teto do MDF (Condensado vs Polar)",
    icon: "💔",
    verdict: {
      label: "MDF Quebrado",
      className: "text-sky-400 border-sky-500/30 bg-sky-950/50",
    },
    ip: {
      pos: "CL (Pot Bet)",
      stack: "80 bb",
      rp: 4.5,
      morph: "Polar Extremado",
    },
    oop: {
      pos: "Mid (Call)",
      stack: "30 bb",
      rp: 22,
      morph: "Condensado Sangrante",
    },
    theory: `<h3 class="text-white font-bold text-xl mb-4 tracking-tight">O Colapso do MDF</h3><p class="text-slate-300 leading-relaxed mb-4 text-[15px]">A ilusão do MDF (Minimum Defense Frequency) morre aqui. O CL faz uma aposta Pot-Size. O Mid-stack tem um <em>bluffcatcher</em> puro. Em ChipEV, defenderia metade das vezes.</p>`,
    exploit: `<p>O solver não só autoriza, como exige que o CL abuse dessa falha estrutural do range defensivo.</p>`,
  },
];

export default function ToyGamesPage() {
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(
    "paradoxo",
  );
  const activeScenario = SCENARIOS_DATABASE.find(
    (s) => s.id === activeScenarioId,
  );

  const solveNashDynamics = (ip_rp: number, oop_rp: number) => {
    let defense = 50 - oop_rp * 1.4 + ip_rp * 0.3;
    let bluff = 33.3 + oop_rp * 1.1 - ip_rp * 0.8;
    defense = Math.max(0, Math.min(100, defense));
    bluff = Math.max(0, Math.min(100, bluff));
    if (ip_rp === 0 && oop_rp === 0) {
      bluff = 33.3;
      defense = 50;
    }
    return { bluff, defense };
  };

  const dynamics = activeScenario
    ? solveNashDynamics(activeScenario.ip.rp, activeScenario.oop.rp)
    : { bluff: 33.3, defense: 50 };
  const dB = dynamics.bluff - 33.3;
  const dD = dynamics.defense - 50;

  let bluffBadgeClass = "bg-slate-800 border-slate-700 text-slate-400";
  if (dB > 0) bluffBadgeClass = "text-sky-400 bg-sky-500/10 border-sky-500/20";
  else if (dB < 0)
    bluffBadgeClass = "text-rose-400 bg-rose-500/10 border-rose-500/20";

  let defenseBadgeClass = "bg-slate-800 border-slate-700 text-slate-400";
  if (dD > 0)
    defenseBadgeClass = "text-sky-400 bg-sky-500/10 border-sky-500/20";
  else if (dD < 0)
    defenseBadgeClass = "text-rose-400 bg-rose-500/10 border-rose-500/20";

  return (
    <div className="min-h-screen bg-bg-base text-text-bright pb-24">
      <ContentPageHeader
        title="Toy Games: Predator"
        subtitle="Laboratório de isolamento tático: sinta a impunidade de agredir quando o oponente está na zona de ruptura."
        category="Interativo"
        icon="fa-gamepad"
      />

      <main className="sota-container -mt-12">
        {/* Seleção de Cenário */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {SCENARIOS_DATABASE.map((sc) => (
            <button
              key={sc.id}
              onClick={() => setActiveScenarioId(sc.id)}
              className={`px-6 py-3 rounded-xl font-heading font-bold uppercase tracking-widest text-xs transition-all duration-300 border ${activeScenarioId === sc.id ? "bg-accent-indigo/20 border-accent-indigo text-accent-indigo-light shadow-[0_0_30px_rgba(129,140,248,0.2)]" : "bg-white/5 border-white/10 text-text-muted hover:border-white/20"}`}
            >
              <span className="mr-2">{sc.icon}</span> {sc.title}
            </button>
          ))}
        </div>

        {/* Palco do Cenário */}
        <div className="max-w-5xl mx-auto">
          {activeScenario && (
            <div className="glass-panel p-8 md:p-12 border-t-4 border-accent-indigo">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12 border-b border-white/5 pb-8">
                <div>
                  <span className="text-[10px] font-black text-accent-indigo-light bg-accent-indigo/10 px-3 py-1.5 rounded-md uppercase tracking-widest border border-accent-indigo/20">
                    {activeScenario.env}
                  </span>
                  <h2 className="text-3xl font-black text-white mt-4 tracking-tighter uppercase">
                    {activeScenario.title}
                  </h2>
                </div>
                <div
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border ${activeScenario.verdict.className}`}
                >
                  {activeScenario.verdict.label}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* IP */}
                <div className="bg-black/40 p-8 rounded-3xl border border-sky-500/20 relative overflow-hidden group">
                  <h3 className="text-sky-400 font-black text-[10px] uppercase tracking-[0.2em] mb-6 text-center">
                    IP / Agressor
                  </h3>
                  <div className="text-center mb-8">
                    <div className="text-4xl font-black text-white mb-2 tracking-tighter">
                      {activeScenario.ip.pos}
                    </div>
                    <div className="inline-block font-mono text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-white/5">
                      {activeScenario.ip.stack}
                    </div>
                  </div>

                  <div className="relative w-40 h-40 mx-auto mb-8">
                    <svg
                      viewBox="0 0 36 36"
                      className="w-full h-full -rotate-90"
                    >
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-white/5"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray={`${(activeScenario.ip.rp / 26) * 100} 100`}
                        strokeLinecap="round"
                        className="text-sky-500 shadow-glow-sky"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-white">
                        {activeScenario.ip.rp}%
                      </span>
                      <span className="text-[8px] font-black text-sky-400 uppercase tracking-widest">
                        Risk Premium
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-3">
                      Morfologia
                    </p>
                    <span className="text-xs font-bold text-sky-300 bg-sky-500/10 px-4 py-2 rounded-xl border border-sky-500/20">
                      {activeScenario.ip.morph}
                    </span>
                  </div>
                </div>

                {/* OOP */}
                <div className="bg-black/40 p-8 rounded-3xl border border-rose-500/20 relative overflow-hidden group">
                  <h3 className="text-rose-400 font-black text-[10px] uppercase tracking-[0.2em] mb-6 text-center">
                    OOP / Defensor
                  </h3>
                  <div className="text-center mb-8">
                    <div className="text-4xl font-black text-white mb-2 tracking-tighter">
                      {activeScenario.oop.pos}
                    </div>
                    <div className="inline-block font-mono text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-white/5">
                      {activeScenario.oop.stack}
                    </div>
                  </div>

                  <div className="relative w-40 h-40 mx-auto mb-8">
                    <svg
                      viewBox="0 0 36 36"
                      className="w-full h-full -rotate-90"
                    >
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-white/5"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray={`${(activeScenario.oop.rp / 26) * 100} 100`}
                        strokeLinecap="round"
                        className="text-rose-500 shadow-glow-rose"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-white">
                        {activeScenario.oop.rp}%
                      </span>
                      <span className="text-[8px] font-black text-rose-400 uppercase tracking-widest">
                        Risk Premium
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-3">
                      Morfologia
                    </p>
                    <span className="text-xs font-bold text-rose-300 bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-500/20">
                      {activeScenario.oop.morph}
                    </span>
                  </div>
                </div>
              </div>

              {/* DYNAMIC FREQUENCIES PANEL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/40 p-8 rounded-3xl border border-white/5">
                  <div className="flex justify-between items-start mb-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Teto de Agressão (Bluff)
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${bluffBadgeClass}`}
                    >
                      {dB > 0 ? "+" : ""}
                      {dB.toFixed(1)}% vs cEV
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-5xl font-black text-white tracking-tighter">
                      {dynamics.bluff.toFixed(1)}
                    </span>
                    <span className="text-xl font-bold text-sky-400">%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-sky-500 shadow-glow-sky transition-all duration-1000 ease-out"
                      style={{ width: `${dynamics.bluff}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-slate-900/40 p-8 rounded-3xl border border-white/5">
                  <div className="flex justify-between items-start mb-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      MDF de ICM (Call)
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${defenseBadgeClass}`}
                    >
                      {dD > 0 ? "+" : ""}
                      {dD.toFixed(1)}% vs cEV
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-5xl font-black text-white tracking-tighter">
                      {dynamics.defense.toFixed(1)}
                    </span>
                    <span className="text-xl font-bold text-rose-400">%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-rose-500 shadow-glow-rose transition-all duration-1000 ease-out"
                      style={{ width: `${dynamics.defense}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/5">
                <div
                  className="prose prose-invert max-w-none prose-sm"
                  dangerouslySetInnerHTML={{ __html: activeScenario.theory }}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      <ContentFooter
        shareTitle="Toy Games: Predator Mode | Raphael Vitoi"
        shareUrl="https://www.raphaelvitoi.com/biblioteca/toy-games"
        backLinkHref="/biblioteca"
        backLinkText="Voltar para Biblioteca"
      />
    </div>
  );
}
