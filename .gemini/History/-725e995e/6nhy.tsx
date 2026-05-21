'use client';

/**
 * IDENTITY: Downward Drift SOTA Page v4.2 Gold
 * PATH: src/app/biblioteca/downward-drift-sota/page.tsx
 * ROLE: Página teórica de alta fidelidade sobre a heurística de contração de range.
 */

import { GtoCfrContent } from '@/components/simulator/GtoCfrContent';
import { ContentPageHeader } from '@/components/layout/ContentPageHeader';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { DownwardDriftSimulator } from '@/components/simulator/DownwardDriftSimulator';
import BayesianBeliefPanel from '@/components/simulator/panels/BayesianBeliefPanel';

export default function DownwardDriftSotaPage() {
    return (
        <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-32">
            <ContentPageHeader
                title="Downward Drift SOTA"
                subtitle="A exegese da contração estratégica: Por que o GTO sob ICM abandona a agressividade linear em favor da preservação de valor monetário."
                category="Doutrina"
                icon="fa-arrow-trend-down"
            />

            <div className="sota-container -mt-16 relative z-10 flex flex-col gap-24">

                {/* Artigo Principal */}
                <GlassPanel className="max-w-4xl mx-auto p-10 md:p-16 rounded-4xl bg-bg-panel/60 backdrop-blur-3xl border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] relative overflow-hidden group/article">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent-indigo/5 blur-3xl rounded-full pointer-events-none" />

                    <article className="prose prose-invert prose-indigo lg:prose-xl max-w-none relative z-10">
                        <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-8">
                            <div className="w-1.5 h-8 bg-accent-indigo rounded-full shadow-[0_0_10px_var(--accent-indigo)]" />
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter m-0">A Anatomia do Colapso de Range</h2>
                        </div>

                        <p className="text-indigo-100/80 leading-loose">
                            O conceito de <strong>Downward Drift</strong>, pilar da estratégia avançada em MTTs, descreve a tendência sistemática de &quot;rebaixamento&quot; de agressividade à medida que o Risk Premium (RP) aumenta. Sob a ótica do Paradigma SOTA, isso não é um ajuste passivo, mas uma <strong>resposta termodinâmica ótima</strong> à assimetria do valor das fichas.
                        </p>

                        <div className="bg-slate-950/60 p-10 rounded-3xl border border-accent-indigo/20 my-12 shadow-inner relative group/heuristic">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <i className="fa-solid fa-microchip text-5xl text-white" />
                            </div>
                            <h3 className="text-accent-indigo-light mt-0 text-[0.8rem] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                                <i className="fa-solid fa-list-check" /> Heurística de Contração SOTA
                            </h3>
                            <ul className="list-none pl-0 space-y-8 m-0">
                                <HeuristicItem
                                    title="Sizings Geométricos"
                                    desc="Overbets e pot-sized bets são extintos. O ICM impõe um teto de sizing onde o risco de ruína supera o ganho marginal de fold equity."
                                />
                                <HeuristicItem
                                    title="Defesa Baseada em Teto de RP"
                                    desc="O defensor abandona bluff-catchers médios que seriam call em ChipEV. A insolvência financeira força o overfold disciplinado."
                                />
                                <HeuristicItem
                                    title="Vácuo de Agressão"
                                    desc="Ações agressivas transformam-se em passivas (Check/Call) para controlar a variância do stack e preservar o FGS (Future Game Simulation)."
                                />
                            </ul>
                        </div>

                        <h2 className="text-white text-2xl font-black uppercase tracking-tighter mt-16 mb-8 flex items-center gap-4">
                            <div className="w-8 h-px bg-white/10" /> Low-Variance Line Selection
                        </h2>
                        <p className="text-indigo-100/80 leading-loose">
                            Solvers operando sob ICM priorizam linhas de baixa variância. A <strong>Vantagem de Cobertura</strong> permite que o Chip Leader pressione, mas a gravidade do torneio exige que até o agressor absoluto respeite o teto de comprometimento. O Downward Drift é a armadura do profissional: reduzir o pote é reduzir a entropia do resultado.
                        </p>
                    </article>
                </GlassPanel>

                {/* Simulador de Drift */}
                <section className="flex flex-col gap-12 max-w-6xl mx-auto w-full">
                    <div className="text-center space-y-4">
                        <span className="text-[0.6rem] font-black text-accent-indigo uppercase tracking-[0.4em]">Laboratório Visual</span>
                        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">Materialização do Drift</h2>
                        <div className="h-px w-24 bg-accent-indigo/30 mx-auto" />
                    </div>
                    <DownwardDriftSimulator />
                </section>

                {/* Bayesian Range Belief */}
                <section className="flex flex-col gap-12 max-w-6xl mx-auto w-full">
                    <div className="text-center space-y-4">
                        <span className="text-[0.6rem] font-black text-accent-emerald uppercase tracking-[0.4em]">Mente Preditiva</span>
                        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">Belief Propagation</h2>
                        <p className="text-text-dim max-w-2xl mx-auto font-medium text-[0.9rem] leading-relaxed">
                            Observe como o range colapsa em tempo real. Cada ação atua como um filtro bayesiano, redefinindo as densidades de probabilidade.
                        </p>
                    </div>
                    <BayesianBeliefPanel initialRange="33.6%" label="BTN RFI Range" />
                </section>

                {/* GTO/CFR Integrated */}
                <section className="flex flex-col gap-12 max-w-6xl mx-auto w-full">
                    <div className="bg-slate-900/40 border border-white/5 p-12 rounded-4xl shadow-2xl relative overflow-hidden group/cfr-lab">
                        <div className="absolute inset-0 bg-radial-[at_top_right] from-accent-indigo/5 to-transparent pointer-events-none" />
                        <div className="text-center mb-16 relative z-10">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Mapeamento de Regret Matching</h3>
                            <p className="text-text-dim max-w-2xl mx-auto font-medium text-[0.9rem] leading-relaxed">
                                Visualize como o ajuste de Regrets (arrependimento) impacta a estratégia de Nash. Em cenários de Downward Drift, o custo de erro de um &quot;Raise&quot; infla drasticamente.
                            </p>
                        </div>
                        <GtoCfrContent initialPot={10} initialTarget={100} initialStreets={3} initialRegrets={{ fold: 50, call: 100, raise: -20 }} />
                    </div>
                </section>

                <footer className="max-w-4xl mx-auto pt-16 border-t border-white/5 text-center flex flex-col items-center gap-6 opacity-40 hover:opacity-100 transition-opacity duration-1000">
                    <div className="flex gap-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-indigo" />
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-indigo" />
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-indigo" />
                    </div>
                    <p className="text-text-muted text-[0.65rem] font-black uppercase tracking-[0.4em] m-0">
                        © 2026 Raphael Vitoi · Monolito Nexus · SOTA Biblioteca Analítica
                    </p>
                </footer>
            </div>
        </div>
    );
}

function HeuristicItem({ title, desc }: { title: string, desc: string }) {
    return (
        <li className="flex items-start gap-6 group/item">
            <div className="w-10 h-10 rounded-xl bg-accent-indigo/10 border border-accent-indigo/20 flex items-center justify-center text-accent-indigo-light shrink-0 transition-transform group-hover/item:scale-110 group-hover/item:border-accent-indigo/40">
                <i className="fa-solid fa-chevron-right text-xs" />
            </div>
            <div className="space-y-2">
                <strong className="text-white uppercase tracking-widest text-[0.7rem] font-black block">{title}</strong>
                <p className="text-text-dim text-[0.85rem] leading-relaxed m-0 group-hover/item:text-text-muted transition-colors">{desc}</p>
            </div>
        </li>
    );
}
