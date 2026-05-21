/**
 * IDENTITY: O Protocolo Smart Sniper (Manual Operacional)
 * PATH: src/app/artigos/smart-sniper/page.tsx
 * ROLE: Guia de gestão de carreira, eficiência e alta performance.
 * BINDING: [layout.tsx, globals.css, SectionHeader, GlassPanel]
 */

import { SectionHeader } from '@/components/ui/SectionHeader';
import Link from 'next/link';

export const metadata = {
    title: 'O Protocolo Smart Sniper | Raphael Vitoi',
    description: 'Gestão de Carreira, Eficiência Matemática e Alta Performance em MTTs. Rotina Semanal, Estratégia de Domingo e Scaffolding.',
};

const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'O Protocolo Smart Sniper: Manual de Alta Performance em Poker',
    description: 'A antítese do grind tradicional. Focado em Lucro Líquido e Longevidade através da seleção cirúrgica de torneios.',
    author: { '@type': 'Person', name: 'Raphael Vitoi' }
};

export default function SmartSniperPage() {
    return (
        <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body">
            <script type="application/ld+json" dangerouslySetInnerHTML={ { __html: JSON.stringify( articleSchema ) } } />

            {/* Header Central de Página */ }
            <div className="max-w-[1200px] mx-auto px-6 pt-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                    <div>
                        <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-black m-0 tracking-tighter bg-gradient-to-r from-text-bright to-text-dim bg-clip-text text-transparent font-heading">
                            Protocolo Smart Sniper
                        </h1>
                        <p className="m-0 mt-4 text-[0.9rem] text-text-muted leading-relaxed max-w-[580px]">
                            Gestão de Carreira, Eficiência Matemática e Alta Performance em MTTs. Manual Operacional 2025.
                        </p>
                        <div className="flex flex-wrap items-center gap-4 mt-6">
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-indigo/10 border border-accent-indigo/20 text-[0.65rem] font-bold text-accent-indigo-light uppercase tracking-widest font-mono">
                                <span className="w-2 h-2 rounded-full bg-accent-emerald shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                { ' ' }Metodologia
                            </span>
                            <span className="text-[0.7rem] text-text-dim font-bold font-mono uppercase tracking-widest">
                                Eficiência de Capital
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
                label="Manifesto"
                title="A Antítese do Grind"
                description="Focado em Lucro Líquido e Longevidade, não em gerar rake para os sites."
            />
            <div className="max-w-[1200px] mx-auto px-6 pb-12">
                <div className="glass-panel p-8 sm:p-12 lg:p-16">
                    <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
                        <p>O &quot;Grind&quot; tradicional morreu. A velha escola ensinava que para vencer no poker você precisava abrir 15 telas, jogar 12 horas por dia e aceitar uma variância brutal em nome do &quot;longo prazo&quot;.</p>
                        <p>Este documento apresenta a antítese dessa ideia. O <strong className="text-text-bright">Protocolo Smart Sniper</strong> não foi desenhado para gerar rake para os sites; foi desenhado para gerar <strong className="text-accent-indigo-light">Lucro Líquido e Longevidade</strong> para você.</p>

                        <div className="bg-bg-elevated/50 border border-white/5 p-8 my-10 rounded-2xl">
                            <h4 className="mt-0 text-text-bright font-bold mb-6 font-heading uppercase tracking-widest text-sm">Três Pilares SOTA</h4>
                            <ul className="space-y-4 list-none pl-0">
                                <li className="flex items-start gap-4">
                                    <span className="w-6 h-6 rounded-full bg-accent-indigo/20 text-accent-indigo-light flex items-center justify-center text-xs font-bold shrink-0">1</span>
                                    <span><strong className="text-text-main">Eficiência Financeira:</strong> Buscamos o maior retorno por hora jogada ($/Hour), não apenas ROI por torneio.</span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="w-6 h-6 rounded-full bg-accent-indigo/20 text-accent-indigo-light flex items-center justify-center text-xs font-bold shrink-0">2</span>
                                    <span><strong className="text-text-main">Sustentabilidade Cognitiva:</strong> Respeitamos os limites biológicos do cérebro para manter o A-Game.</span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="w-6 h-6 rounded-full bg-accent-indigo/20 text-accent-indigo-light flex items-center justify-center text-xs font-bold shrink-0">3</span>
                                    <span><strong className="text-text-main">Matemática Defensiva:</strong> Usamos a seleção de torneios para blindar o bankroll contra a variância tóxica.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <SectionHeader
                step="02"
                label="Rotina"
                title="A Estratégia Sniper"
                description="De segunda a sábado, o objetivo é a construção de bankroll através do fluxo de caixa estável."
            />
            <div className="max-w-[1200px] mx-auto px-6 pb-12">
                <div className="glass-panel p-8 sm:p-12 lg:p-16">
                    <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
                        <h3 className="text-text-bright font-heading">2.1 Volume Otimizado (6 a 8 Telas)</h3>
                        <p>A <strong className="text-text-bright">Lei de Yerkes-Dodson</strong> (neurociência cognitiva) demonstra que a performance humana segue uma curva de U invertido em relação à carga de trabalho. Acima de 8 telas, o cérebro entra em <strong className="text-accent-rose">C-Game automático</strong> — o jogador para de raciocinar e passa a reagir. O edge técnico desaparece.</p>

                        <div className="my-10 overflow-x-auto">
                            <table className="w-full text-left border-collapse bg-bg-elevated/20 rounded-xl">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/5 text-text-bright uppercase text-[0.65rem] tracking-[0.15em] font-mono">
                                        <th className="py-4 px-6">Parâmetro</th>
                                        <th className="py-4 px-6">Regra Sniper</th>
                                        <th className="py-4 px-6">Motivo Estratégico</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-text-muted">
                                    <tr className="border-b border-white/5">
                                        <td className="py-4 px-6 text-text-main font-bold">Telas Simultâneas</td>
                                        <td className="py-4 px-6 text-accent-emerald font-mono">Max 6 a 8</td>
                                        <td className="py-4 px-6">Zona de Flow: permite identificar vilões e aplicar pressão de ICM.</td>
                                    </tr>
                                    <tr>
                                        <td className="py-4 px-6 text-text-main font-bold">Volume Insano (12+)</td>
                                        <td className="py-4 px-6 text-accent-rose font-mono">Proibido</td>
                                        <td className="py-4 px-6">Transforma o jogador em um robô explorável e acelera o burnout.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <h3 className="text-text-bright font-heading">2.2 A Zona de Domínio (Arbitragem de ICM)</h3>
                        <p>Nós <strong className="text-accent-rose">não</strong> registramos no Nível 1 de torneios lentos. A decisão de jogar Deep Stack impõe um custo invisível de diluição de equidade.</p>

                        <div className="bg-accent-indigo/5 border border-accent-indigo/20 p-8 my-10 rounded-2xl">
                            <h4 className="mt-0 text-accent-indigo-light font-bold text-lg mb-4 font-heading">Entrada Cirúrgica</h4>
                            <p className="text-text-main leading-relaxed m-0">
                                Registramos quando a stack efetiva está entre <strong className="text-text-bright">30bb e 50bb</strong> (Late Reg estratégico). Capturamos uma stack já valorizada pelo ICM sem carregar o custo de gerá-la. É um subsídio matemático de ROI base positivo antes da primeira mão.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <SectionHeader
                step="03"
                label="Domingo"
                title="Risco Assimétrico (Barbell)"
                description="A aplicação prática da teoria de Nassim Taleb: proteger o bankroll na semana, buscar a lua no domingo."
            />
            <div className="max-w-[1200px] mx-auto px-6 pb-12">
                <div className="glass-panel p-8 sm:p-12 lg:p-16">
                    <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
                        <p>No domingo, o field é recreativo e a liquidez é máxima. É o dia de buscar o <strong className="text-text-bright">Big Hit</strong> sem comprometer a saúde financeira da operação.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-10">
                            <div className="p-6 rounded-xl bg-bg-elevated/40 border border-white/5">
                                <strong className="text-text-main block mb-2 font-heading tracking-wide uppercase text-xs">Teto de Gastos</strong>
                                <p className="text-sm m-0">O gasto total de domingo deve ser igual ao gasto médio semanal. Isso impede que um domingo ruim destrua meses de trabalho estável.</p>
                            </div>
                            <div className="p-6 rounded-xl bg-accent-indigo/5 border border-accent-indigo/10">
                                <strong className="text-accent-indigo-light block mb-2 font-heading tracking-wide uppercase text-xs">Foco de Elite (4 Telas)</strong>
                                <p className="text-sm m-0">Em vez de 15 torneios baratos, jogamos 4 Majors com ABI mais alto. Qualidade total para cravadas de 5 dígitos.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Final para Validação */ }
            <div className="max-w-[1200px] mx-auto px-6 pb-24">
                <div className="bg-gradient-to-br from-bg-elevated/60 to-bg-base p-12 rounded-3xl border border-white/5 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-sota-pattern opacity-10 pointer-events-none" />
                    <h3 className="text-2xl sm:text-3xl font-black text-text-bright mb-6 font-heading">Pronto para ver a Prova Matemática?</h3>
                    <p className="text-text-muted mb-10 max-w-2xl mx-auto leading-relaxed">
                        Não confie em promessas. Veja os dados brutos de simulações de Monte Carlo que comprovam por que este protocolo é estatisticamente superior.
                    </p>
                    <Link href="/artigos/validacao-smart-sniper" className="btn-primary pulse-glow px-12 py-5 text-lg font-black tracking-widest rounded-2xl">
                        ACESSAR VALIDAÇÃO CIENTÍFICA <i className="fa-solid fa-chart-line ml-3" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
