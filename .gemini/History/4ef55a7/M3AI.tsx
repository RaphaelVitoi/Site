/**
 * IDENTITY: O Estado da Arte do ICM 2025 (Whitepaper)
 * PATH: src/app/artigos/estado-da-arte/page.tsx
 * ROLE: Artigo avançado sobre tendências High Stakes, Donk Bet meta e IA.
 * BINDING: [layout.tsx, globals.css, SectionHeader, GlassPanel]
 */

import JsonLd from '@/components/seo/JsonLd';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import Link from 'next/link';

export const metadata = {
    title: 'O Estado da Arte do ICM 2025 | Raphael Vitoi',
    description: 'Novas Fronteiras e Tendências High Stakes. Donk Bet meta, Efeito de Irradiação e a batalha IA vs HRC Pro.',
};

const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'O Estado da Arte do ICM 2025: Tendências e Tecnologias',
    description: 'Um whitepaper sobre as brechas ofensivas encontradas pela elite do poker na passividade imposta pelo ICM.',
    author: { '@type': 'Person', name: 'Raphael Vitoi' }
};

export default function EstadoDaArtePage () {
    return (
        <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body">
            <JsonLd data={ articleSchema } />

            {/* Header Central de Página */ }
            <div className="max-w-300 mx-auto px-6 pt-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                    <div>
                        <h1 className="text-[clamp(2rem,5vw,3rem)] font-black m-0 tracking-tighter bg-linear-to-r from-text-bright to-text-dim bg-clip-text text-transparent font-heading">
                            O Estado da Arte 2025
                        </h1>
                        <p className="m-0 mt-4 text-[0.9rem] text-text-muted leading-relaxed max-w-145">
                            Novas Fronteiras, Tendências High Stakes e Ferramentas de Elite. A evolução do organismo estratégico.
                        </p>
                        <div className="flex flex-wrap items-center gap-4 mt-6">
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-indigo/10 border border-accent-indigo/20 text-[0.65rem] font-bold text-accent-indigo-light uppercase tracking-widest font-mono">
                                <span className="w-2 h-2 rounded-full bg-accent-emerald shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                { ' ' }Whitepaper
                            </span>
                            <span className="text-[0.7rem] text-text-dim font-bold font-mono uppercase tracking-widest">
                                Nível Avançado
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2 items-center">
                        <Link href="/biblioteca" className="px-4 py-2 rounded-xl bg-bg-elevated/40 border border-white/5 text-text-muted text-[0.75rem] font-bold flex items-center gap-2 transition-all hover:text-text-bright hover:bg-bg-elevated">
                            <i className="fa-solid fa-arrow-left text-[0.7rem]" /> BIBLIOTECA
                        </Link>
                    </div>
                </div>
            </div>

            <SectionHeader
                step="01"
                label="Evolução"
                title="O Organismo em Mutação"
                description="Como a elite mundial está encontrando brechas ofensivas na passividade imposta pelo ICM."
            />
            <div className="max-w-300 mx-auto px-6 pb-12">
                <GlassPanel className="p-8 sm:p-12 lg:p-16">
                    <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
                        <p>Ao observarmos as tendências mais recentes dos circuitos High Roller (Triton, SHRB) e a evolução exponencial das IAs em 2025, identificamos dinâmicas que refinam o entendimento sobre o ICM Pós-Flop. Não se trata apenas de saber &quot;trancar&quot; o jogo para garantir payjumps, mas de entender como a elite está <strong className="text-text-bright">encontrando agressão na passividade</strong>.</p>
                    </div>
                </GlassPanel>
            </div>

            <SectionHeader
                step="02"
                label="Meta Game"
                title="O Ataque Defensivo (Donk Bet)"
                description="Explorando a passividade forçada com lideranças minúsculas para roubar iniciativa."
            />
            <div className="max-w-300 mx-auto px-6 pb-12">
                <GlassPanel className="p-8 sm:p-12 lg:p-16">
                    <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
                        <p>Sob pressão de ICM, o agressor (IP) está frequentemente &quot;algemado&quot; pelo Risk Premium, forçado a dar check-back com mãos médias para realizar equidade gratuitamente. O Big Blind explora essa inércia com <strong className="text-text-bright">Donk Bets de 10% a 20% do pote</strong>.</p>

                        <div className="bg-accent-emerald/10 border-l-4 border-accent-emerald p-8 my-10 rounded-r-2xl">
                            <h4 className="mt-0 text-accent-emerald font-bold text-lg mb-4 font-heading">A Falha na Matriz</h4>
                            <p className="text-text-main leading-relaxed m-0">
                                Em ChipEV, a resposta padrão seria o raise. No ICMev, crescer o pote para punir uma aposta pequena é um <strong className="text-text-bright">erro matemático grave</strong> para o stack maior. O BB rouba a iniciativa com impunidade técnica, transformando mãos marginais em calls lucrativos.
                            </p>
                        </div>
                    </div>
                </GlassPanel>
            </div>

            <SectionHeader
                step="03"
                label="Irradiação"
                title="A Física dos Micro-Stacks"
                description="Como uma única stack agonizante impõe lei marcial em toda a mesa."
            />
            <div className="max-w-300 mx-auto px-6 pb-12">
                <GlassPanel className="p-8 sm:p-12 lg:p-16">
                    <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
                        <p>A presença de um jogador com menos de 5bb cria um <strong className="text-text-bright">campo de força</strong> que altera a matemática de todos os outros confrontos. O custo de cair antes desse &quot;morto-vivo&quot; é estatisticamente infinito.</p>
                        <p>O acordo silencioso de passividade entre os stacks médios torna-se <strong className="text-accent-rose text-shadow-glow uppercase font-black">lei marcial</strong>. Qualquer desvio dessa norma é suicídio em $EV.</p>
                    </div>
                </GlassPanel>
            </div>

            <SectionHeader
                step="04"
                label="Tecnologia"
                title="IA vs Precision Engine"
                description="O trade-off entre a velocidade das Redes Neurais e a transparência do e-Nash tradicional."
            />
            <div className="max-w-300 mx-auto px-6 pb-24">
                <GlassPanel className="p-8 sm:p-12 lg:p-16">
                    <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
                        <div className="my-10 overflow-x-auto">
                            <table className="w-full text-left border-collapse bg-bg-elevated/20 rounded-xl overflow-hidden">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/5 text-text-bright uppercase text-[0.65rem] tracking-[0.15em] font-mono">
                                        <th className="py-4 px-6">Critério</th>
                                        <th className="py-4 px-6">Solvers de IA</th>
                                        <th className="py-4 px-6">HRC Pro (Nash)</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-text-muted font-body">
                                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-6 text-text-main font-bold">Velocidade</td>
                                        <td className="py-4 px-6 text-accent-emerald font-mono">Instantânea</td>
                                        <td className="py-4 px-6 text-accent-rose font-mono">Iterativa</td>
                                    </tr>
                                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-6 text-text-main font-bold">Bunching Effect</td>
                                        <td className="py-4 px-6">Estimado</td>
                                        <td className="py-4 px-6 text-accent-emerald font-mono">Preciso</td>
                                    </tr>
                                    <tr className="hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-6 text-text-main font-bold">Uso Ideal</td>
                                        <td className="py-4 px-6 text-accent-indigo-light">Heurísticas Rápidas</td>
                                        <td className="py-4 px-6 text-accent-emerald font-mono font-bold text-shadow-glow">Estudo Cirúrgico</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </GlassPanel>
            </div>

            <div className="max-w-300 mx-auto px-6 pb-24">
                <div className="flex justify-between border-t border-white/5 pt-12">
                    <Link href="/biblioteca/entendendo-o-icm-e-suas-heuristicas" className="text-accent-indigo-light text-sm font-bold flex items-center gap-2 hover:text-text-bright transition-colors">
                        <i className="fa-solid fa-arrow-left" /> ENTENDENDO O ICM
                    </Link>
                    <Link href="/artigos/smart-sniper" className="text-accent-indigo-light text-sm font-bold flex items-center gap-2 hover:text-text-bright transition-colors">
                        PROTOCOLO SMART SNIPER <i className="fa-solid fa-arrow-right" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
