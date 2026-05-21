/**
 * IDENTITY: O Estado da Arte do ICM 2025 (Whitepaper)
 * PATH: src/app/artigos/estado-da-arte/page.tsx
 * ROLE: Artigo avançado sobre tendências High Stakes, Donk Bet meta e IA.
 * BINDING: [layout.tsx, globals.css, SectionHeader, GlassPanel]
 */

import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import JsonLd from '@/components/seo/JsonLd';
import { GtoCfrSimulator } from '@/components/simulator/GtoCfrSimulator';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { SectionHeader } from '@/components/ui/layout/SectionHeader';
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

export default function EstadoDaArtePage() {
    return (
        <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body">
            <JsonLd data={ articleSchema } />

            <ContentPageHeader
                title="O Estado da Arte 2025"
                subtitle="Novas Fronteiras, Tendências High Stakes e Ferramentas de Elite. A evolução do organismo estratégico."
                category="Whitepaper"
                icon="fa-shuttle-space"
            />

            <SectionHeader
                step="01"
                label="Evolução"
                title="O Organismo em Mutação"
                description="Como a elite mundial está encontrando brechas ofensivas na passividade imposta pelo ICM."
            />
            <div className="sota-container pb-12">
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
            <div className="sota-container pb-12">
                <GlassPanel className="p-8 sm:p-12 lg:p-16">
                    <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
                        <p>Sob pressão de ICM, o agressor (IP) está frequentemente &quot;algemado&quot; pelo Risk Premium, forçado a dar check-back com mãos médias para realizar equidade gratuitamente. O Big Blind explora essa inércia com <strong className="text-text-bright">Donk Bets de 10% a 20% do pote</strong>.</p>

                        <div className="bg-accent-emerald/10 border-l-4 border-accent-emerald p-8 my-10 rounded-r-2xl">
                            <h4 className="mt-0 text-accent-emerald font-bold text-lg mb-4 font-heading italic">A Falha na Matriz</h4>
                            <p className="text-text-main leading-relaxed m-0 text-sm">
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
            <div className="sota-container pb-12">
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
            <div className="sota-container pb-24">
                <GtoCfrSimulator />

                <GlassPanel className="p-8 sm:p-12 lg:p-16 mt-12">
                    <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
                        <div className="my-10 overflow-x-auto">
                            <table className="w-full text-left border-collapse bg-bg-elevated/20 rounded-2xl overflow-hidden">
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
                                        <td className="py-4 px-6 text-text-dim">Estimado</td>
                                        <td className="py-4 px-6 text-accent-emerald font-mono font-bold">Preciso</td>
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

            <div className="sota-container pb-24">
                <div className="flex justify-between border-t border-white/5 pt-12">
                    <Link href="/biblioteca/entendendo-o-icm-e-suas-heuristicas" className="text-accent-indigo-light text-xs font-black tracking-widest uppercase flex items-center gap-2 hover:text-text-bright transition-all">
                        <i className="fa-solid fa-arrow-left" /> ENTENDENDO O ICM
                    </Link>
                    <Link href="/artigos/smart-sniper" className="text-accent-indigo-light text-xs font-black tracking-widest uppercase flex items-center gap-2 hover:text-text-bright transition-all">
                        PROTOCOLO SMART SNIPER <i className="fa-solid fa-arrow-right" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
