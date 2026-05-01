import { GtoCfrContent } from '@/app/simulador/gto-cfr/GtoCfrContent';

export default function DownwardDriftSotaPage() {
    return (
        <main className="container mx-auto px-4 py-16 space-y-12">
            <header className="max-w-4xl mx-auto text-center space-y-4">
                <h1 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">
                    Downward Drift SOTA
                </h1>
                <p className="text-accent-emerald text-xl font-mono tracking-widest uppercase">
                    Contração de Range e Sizing sob Pressão ICM
                </p>
                <div className="h-1 w-24 bg-accent-emerald mx-auto rounded-full mt-8" />
            </header>

            <article className="max-w-4xl mx-auto prose prose-invert prose-emerald lg:prose-xl">
                <p className="lead">
                    Nas fases finais de um torneio, a matemática do poker sofre uma mutação fundamental. 
                    O que era uma busca linear por fichas (ChipEV) transforma-se em um jogo de preservação de valor monetário (ICM).
                </p>

                <h2 className="text-white">A Anatomia do Downward Drift</h2>
                <p>
                    O conceito de <strong>Downward Drift</strong>, popularizado por plataformas como GTO Wizard e teóricos como Dara O&apos;Kearney, 
                    descreve a tendência sistemática de &quot;rebaixamento&quot; de agressividade. Sob a ótica do SOTA (Estado da Arte), 
                    isso não é apenas um ajuste conservador, mas uma resposta ótima à assimetria do Risk Premium.
                </p>

                <div className="bg-bg-deep p-8 rounded-2xl border border-white/5 my-8">
                    <h3 className="text-accent-emerald mt-0">Heurística de Contração:</h3>
                    <ul className="list-none pl-0 space-y-4">
                        <li className="flex items-start gap-3">
                            <span className="text-accent-emerald">●</span>
                            <span><strong>Sizings Grandes:</strong> Overbets e pot-sized bets são quase extintos em favor de tamanhos menores e mais controlados.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-accent-emerald">●</span>
                            <span><strong>Sizings Pequenos:</strong> Transformam-se em Checks para evitar o comprometimento do stack.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-accent-emerald">●</span>
                            <span><strong>Checks Marginais:</strong> Evoluem para Folds disciplinados, priorizando a sobrevivência (Laddering).</span>
                        </li>
                    </ul>
                </div>

                <h2 className="text-white">Low-Variance Line Selection</h2>
                <p>
                    Solvers operando sob ICM priorizam o que chamamos de <em>Low-Variance Line Selection</em>. 
                    A Vantagem de Cobertura (Covering Advantage) permite que o chip leader pressione, mas mesmo ele deve 
                    respeitar o <strong>Teto do RP</strong>. Para os stacks médios, o Downward Drift é uma armadura necessária: 
                    reduzir o tamanho do pote é reduzir o risco de ruína.
                </p>
            </article>

            <section className="max-w-6xl mx-auto mt-24">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                        Laboratório GTO/CFR Integrado
                    </h2>
                    <p className="text-text-muted max-w-2xl mx-auto mt-4">
                        Visualize como o ajuste de Regrets (arrependimento) impacta a estratégia de Nash. 
                        Em cenários de Downward Drift, o regret por &quot;Raise&quot; aumenta drasticamente, forçando a convergência para Call ou Fold.
                    </p>
                </div>

                {/* Componente SOTA Reutilizado */}
                <GtoCfrContent initialRegrets={{ fold: 50, call: 100, raise: -20 }} />
            </section>

            <footer className="max-w-4xl mx-auto pt-16 border-t border-white/5 text-center text-text-dim text-sm italic">
                Baseado na Pesquisa SOTA de Raphael Vitoi - 2026.
            </footer>
        </main>
    );
}
