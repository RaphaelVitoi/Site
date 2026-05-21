"use client";

/**
 * IDENTITY: Geometria do Risco v4.2 Gold
 * PATH: src/app/aulas/icm-masterclass/page.tsx
 * ROLE: Framework matemático do ICM pós-flop. Teoria densa e colapso da MDF.
 * AESTHETIC: SOTA Gold Standard (Depth Layers, High-Contrast Typography, Glassmorphism).
 */

import ContentFooter from "@/components/content/ContentFooter";
import { ContentPageHeader } from "@/components/layout/ContentPageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { motion } from "framer-motion";

const metrics = [
  {
    label: "Assimetria Fundamental",
    value: "Fichas perdidas > ganhas",
    detail:
      "A base da stack vale mais que o topo — concavidade irredutível. É a origem de toda distorção no equilíbrio.",
    color: "indigo",
  },
  {
    label: "Risk Premium (RP)",
    value: "0% a ~24%",
    detail:
      "Equity adicional necessária para justificar um call. Acima deste teto, a defesa racional colapsa.",
    color: "emerald",
  },
  {
    label: "Bubble Factor (BF)",
    value: "Multiplicador da Dor",
    detail:
      "O coeficiente que escala o custo da eliminação. BF = 100 / (100 - RP).",
    color: "amber",
  },
  {
    label: "ΔRP — Diferencial",
    value: "RP_IP − RP_OOP",
    detail:
      "O diferencial que dita quem detém a iniciativa e quem é forçado à passividade estrutural.",
    color: "violet",
  },
  {
    label: "Downward Drift",
    value: "RP↑ → Sizing↓",
    detail:
      "A migração gravitacional dos sizings para faixas menores conforme a pressão monetária aumenta.",
    color: "rose",
  },
  {
    label: "Regra de Ouro",
    value: "RPs nunca são iguais",
    detail:
      "Em qualquer colisão, um jogador detém vantagem estrutural de risco. A neutralidade é uma ilusão.",
    color: "sky",
  },
];

const METRIC_COLOR_MAP: Record<string, string> = {
  indigo: "bg-accent-indigo shadow-indigo-500/40",
  emerald: "bg-accent-emerald shadow-emerald-500/40",
  amber: "bg-accent-amber shadow-amber-500/40",
  rose: "bg-accent-rose shadow-rose-500/40",
  violet: "bg-accent-violet shadow-violet-500/40",
  sky: "bg-accent-sky shadow-sky-500/40",
};

export default function AulaICMPage() {
  const articleTitle = "Geometria do Risco | Raphael Vitoi";
  const articleUrl = "https://www.pokerracional.com/aulas/icm-masterclass";

  return (
    <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-32">
      <ContentPageHeader
        title="Geometria do Risco"
        subtitle="A desconstrução do pós-flop sob a ótica do ICM. O mapeamento estrutural da colisão e a física da Perspectiva Matemática."
        category="Masterclass"
        icon="fa-shapes"
      />

      <div className="sota-container -mt-16 relative z-10 flex flex-col gap-24">
        {/* Quote de Abertura */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto w-full"
        >
          <blockquote className="relative p-12 rounded-4xl bg-bg-panel/40 border border-white/5 shadow-2xl overflow-hidden group/quote">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-accent-indigo shadow-[0_0_20px_var(--accent-indigo)]" />
            <i className="fa-solid fa-quote-left absolute top-8 right-12 text-6xl opacity-5 text-white" />
            <p className="text-xl md:text-2xl text-indigo-100/90 font-medium leading-relaxed italic m-0 relative z-10">
              &quot;O poker é uma ciência de informação incompleta jogada por
              humanos falhos. Num cenário de extrema pressão financeira, as
              fichas deixam de ser plástico e passam a representar a perspectiva
              de sobrevivência.&quot;
            </p>
            <footer className="mt-8 flex items-center gap-4 relative z-10">
              <div className="h-px w-8 bg-accent-indigo/40" />
              <cite className="text-[0.65rem] font-black text-text-muted uppercase tracking-[0.4em] not-italic font-mono">
                Raphael Vitoi · A Geometria do Risco
              </cite>
            </footer>
          </blockquote>
        </motion.div>

        {/* Grandezas Section */}
        <section className="flex flex-col gap-12">
          <SectionHeader
            step="01"
            label="Fundamentos"
            title="Grandezas do Sistema"
            description="RP, BF, ΔRP e Downward Drift não são metáforas — são grandezas calculáveis que governam o equilíbrio de Nash."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.map((metric, idx) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 rounded-[2.5rem] bg-black/40 border border-white/5 hover:border-accent-indigo/30 transition-all duration-500 group/metric shadow-inner flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-1.5 h-1.5 rounded-full shadow-lg ${
                        METRIC_COLOR_MAP[metric.color] ||
                        METRIC_COLOR_MAP["sky"]
                      }`}
                    />
                    <span className="text-text-muted text-[0.6rem] font-black uppercase tracking-[0.3em]">
                      {metric.label}
                    </span>
                  </div>
                  <strong className="text-white text-2xl block font-black uppercase tracking-tighter group-hover/metric:text-accent-indigo-light transition-colors">
                    {metric.value}
                  </strong>
                </div>
                <p className="text-text-dim text-[0.8rem] leading-relaxed m-0 mt-6 font-medium group-hover/metric:text-text-muted transition-colors">
                  {metric.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Doutrina Section */}
        <section className="flex flex-col gap-12">
          <SectionHeader
            step="02"
            label="Doutrina"
            title="A Ilusão do Vácuo"
            description="Por que solvers tradicionais não resolvem mesas finais e como a matemática oculta subverte a teoria clássica."
          />

          <GlassPanel className="max-w-5xl mx-auto p-10 md:p-16 rounded-4xl bg-bg-panel/60 border-white/5 shadow-2xl relative overflow-hidden group/doctrine">
            <div className="absolute inset-0 bg-radial-[at_top_left] from-accent-indigo/5 to-transparent pointer-events-none" />
            <div className="prose prose-invert prose-indigo lg:prose-xl max-w-none relative z-10">
              <p className="text-indigo-100/80 leading-loose">
                Solvers maximizam ChipEV — assumem que cada ficha vale o mesmo.
                Em cash game, isso é correto. Em torneio, é sistematicamente
                falso. O <strong className="text-white">Risk Premium</strong>{" "}
                quantifica essa assimetria por jogador, por spot. Ignorar o RP
                não é &ldquo;jogar GTO&rdquo; — é jogar um jogo diferente do que
                está acontecendo.
              </p>

              <div className="bg-slate-900/60 p-10 rounded-3xl border border-accent-amber/20 my-12 shadow-2xl relative group/highlight">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-accent-amber shadow-[0_0_15px_var(--color-accent-amber)]" />
                <h4 className="mt-0 text-accent-amber font-black text-[0.8rem] uppercase tracking-[0.3em] mb-6 flex items-center gap-3 italic">
                  <i className="fa-solid fa-triangle-exclamation" /> Heads-Up: O
                  Pote vs. O Final
                </h4>
                <p className="text-text-main m-0 leading-relaxed text-[0.9rem] font-medium">
                  Um pote heads-up com 9 jogadores ativos{" "}
                  <strong className="text-white underline decoration-accent-amber/40">
                    continua sujeito a pressões letais de ICM
                  </strong>
                  . Apenas no confronto final (Top 2), o modelo reverte para
                  ChipEV puro. Fora isso, a sombra dos outros adversários impõe
                  uma lei marcial matemática.
                </p>
              </div>

              <p className="text-indigo-100/80 leading-loose">
                O{" "}
                <strong className="text-white font-black">
                  Downward Drift
                </strong>{" "}
                é o mecanismo de transmissão: sob RP crescente, a distribuição
                de apostas migra para sizes menores. Overbets desaparecem. 2/3
                pot vira 1/3. 1/3 vira check. A{" "}
                <strong className="text-accent-indigo-light">
                  Perspectiva Matemática
                </strong>{" "}
                governa o quanto de risco cada jogador pode absorver por street.
              </p>
            </div>
          </GlassPanel>
        </section>

        {/* Morfologia Section */}
        <section className="flex flex-col gap-12">
          <SectionHeader
            step="03"
            label="Morfologia"
            title="Os 5 Arquétipos Clínicos"
            description="Padrões comportamentais GTO contra-intuitivos ditados pela gravidade da utilidade não-linear."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto w-full">
            <ArchetypeCard
              icon="fa-handshake"
              title="O Pacto Silencioso"
              label="Evitação de Ruína"
              color="emerald"
              scenario="Chip Leader (70bb) vs Vice Chip Leader (65bb) numa mesa repleta de micro-stacks (10bb a 15bb)."
              resolution="A agressividade pré-flop desaparece. Ranges de flat call inflam massivamente, incluindo o topo (AK/QQ). Slowplays tornam-se vitais."
            />
            <ArchetypeCard
              icon="fa-scale-unbalanced"
              title="Paradoxo do Valuation"
              label="Mid vs Big"
              color="rose"
              scenario="BTN (40bb) abre, BB (54bb - Chip Leader) defende."
              resolution="O BTN acredita que pode punir o BB, mas seu RP de ida é o dobro do de volta. A agressão do BTN é estrangulada matematicamente."
            />
            <ArchetypeCard
              icon="fa-person-falling-burst"
              title="Guerra na Lama"
              label="Sobrevivência dos Shorts"
              color="amber"
              scenario="Dois jogadores com ~10bb numa mesa de colossos (80bb+)."
              resolution="O laddering passivo impera. Foldar rende dinheiro limpo a cada vez que um vizinho sucumbe. O push com lixo técnico é punido duramente."
            />
            <ArchetypeCard
              icon="fa-chess-king"
              title="Ameaça Orgânica"
              label="Efeito Kingmaker (FGS)"
              color="indigo"
              scenario="Chip Leader absoluto (90bb) ataca o Vice-Líder (25bb)."
              resolution="Se o Vice dobrar, torna-se o único rival capaz de usurpar a coroa. O solver protege o God Mode barrando a criação de monstros."
            />

            <div className="p-10 rounded-4xl bg-linear-to-br from-bg-panel/80 to-bg-deep border border-white/5 border-t-4 border-t-accent-violet hover:border-accent-violet/30 hover:from-bg-panel transition-all duration-700 md:col-span-2 group/archetype-v flex flex-col lg:flex-row items-center lg:items-start gap-12 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-radial-[at_top_right] from-accent-violet/5 to-transparent pointer-events-none" />
              <div className="w-20 h-20 shrink-0 rounded-4xl bg-accent-violet/10 border border-accent-violet/20 flex items-center justify-center text-accent-violet text-3xl group-hover/archetype-v:scale-110 transition-transform duration-700 shadow-lg">
                <i className="fa-solid fa-fire-flame-curved" />
              </div>
              <div className="space-y-6 flex-1 text-center lg:text-left relative z-10">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter m-0">
                    Transferência de Risco
                  </h3>
                  <p className="text-[0.7rem] font-black text-accent-violet-light uppercase tracking-[0.4em] mt-2 m-0">
                    Efeito Batata Quente
                  </p>
                </div>
                <p className="text-indigo-100/70 leading-loose text-lg font-medium italic">
                  &quot;Ao empurrar todas as fichas, o agressor não investe
                  apenas o seu próprio Risk Premium; ele acopla-lhe a monumental
                  Fold Equity de uma decisão final, transferindo o peso volitivo
                  do torneio para o defensor.&quot;
                </p>
                <div className="p-6 rounded-2xl bg-black/40 border border-white/5 text-[0.85rem] text-text-dim leading-relaxed font-medium">
                  <strong className="text-white uppercase tracking-widest text-[0.6rem] block mb-2 opacity-50">
                    Resolução SOTA
                  </strong>{" "}
                  O limite de dor do defensor colapsa, obrigando ranges
                  defensáveis a um overfold matemático ditado pelo pavor da
                  eliminação.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Conclusão Section */}
        <section className="flex flex-col gap-12 pb-24">
          <SectionHeader
            step="04"
            label="Conclusão"
            title="A Arte da Adaptação"
            description="A vantagem competitiva moderna não reside em decorar tabelas, mas em compreender a Elasticidade do Risco."
          />

          <GlassPanel className="max-w-5xl mx-auto p-16 rounded-[3rem] bg-slate-950/60 border-accent-indigo/20 text-center relative overflow-hidden group/conclusion">
            <div className="absolute inset-0 bg-radial-[at_bottom_center] from-accent-indigo/10 to-transparent pointer-events-none" />
            <div className="relative z-10 space-y-12">
              <p className="text-xl md:text-2xl text-text-muted leading-relaxed font-medium italic border-b border-white/5 pb-12">
                &quot;No poker de elite, a matemática propõe a base teórica;
                contudo, será sempre a sua sensibilidade na interpretação do
                ecossistema que ditará o campeão.&quot;
              </p>
              <div className="flex flex-col items-center gap-10">
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-accent-emerald">
                    <i className="fa-solid fa-shield-halved" />
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-accent-indigo">
                    <i className="fa-solid fa-handshake" />
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-accent-amber">
                    <i className="fa-solid fa-person-falling-burst" />
                  </div>
                </div>
                <ContentFooter
                  shareTitle={articleTitle}
                  shareUrl={articleUrl}
                  backLinkHref="/biblioteca"
                  backLinkText="Atlas Analítico"
                />
              </div>
            </div>
          </GlassPanel>
        </section>

        <footer className="max-w-4xl mx-auto pt-16 border-t border-white/5 text-center flex flex-col items-center gap-6 opacity-40 hover:opacity-100 transition-opacity duration-1000">
          <div className="flex gap-4">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-indigo" />
            <div className="w-1.5 h-1.5 rounded-full bg-accent-indigo" />
            <div className="w-1.5 h-1.5 rounded-full bg-accent-indigo" />
          </div>
          <p className="text-text-muted text-[0.65rem] font-black uppercase tracking-[0.4em] m-0">
            © 2026 Raphael Vitoi · Monolito Nexus · SOTA Masterclass
          </p>
        </footer>
      </div>
    </div>
  );
}

function ArchetypeCard({
  icon,
  title,
  label,
  color,
  scenario,
  resolution,
}: Readonly<{
  icon: string;
  title: string;
  label: string;
  color: string;
  scenario: string;
  resolution: string;
}>) {
  const colorClasses = {
    emerald:
      "text-accent-emerald bg-accent-emerald/10 border-accent-emerald/20 border-t-accent-emerald",
    rose: "text-accent-rose bg-accent-rose/10 border-accent-rose/20 border-t-accent-rose",
    amber:
      "text-accent-amber bg-accent-amber/10 border-accent-amber/20 border-t-accent-amber",
    indigo:
      "text-accent-indigo-light bg-accent-indigo/10 border-accent-indigo/20 border-t-accent-indigo",
  }[color as "emerald" | "rose" | "amber" | "indigo"];

  return (
    <div
      className={`p-8 rounded-4xl bg-black/40 border border-white/5 border-t-4 transition-all duration-500 group/archetype hover:bg-black/60 hover:-translate-y-1 shadow-xl flex flex-col gap-6 ${colorClasses}`}
    >
      <div className="flex items-center gap-5">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg group-hover/archetype:scale-110 transition-transform duration-500 ${colorClasses}`}
        >
          <i className={`fa-solid ${icon}`} />
        </div>
        <div>
          <h3 className="text-xl font-black text-white uppercase tracking-tighter m-0">
            {title}
          </h3>
          <p
            className={`text-[0.65rem] font-black uppercase tracking-widest m-0 mt-1 opacity-70`}
          >
            {label}
          </p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="space-y-1">
          <span className="text-[0.6rem] font-black text-text-darker uppercase tracking-widest block">
            Cenário Clínico
          </span>
          <p className="text-[0.85rem] text-text-muted leading-relaxed m-0 font-medium">
            {scenario}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-white/3 border border-white/5 group-hover/archetype:bg-white/5 transition-colors">
          <span className="text-[0.55rem] font-black text-text-darker uppercase tracking-widest block mb-2">
            Resolução Nash
          </span>
          <p className="text-[0.8rem] text-indigo-100/60 italic leading-relaxed m-0 font-medium group-hover/archetype:text-indigo-100/80 transition-colors">
            {resolution}
          </p>
        </div>
      </div>
    </div>
  );
}
