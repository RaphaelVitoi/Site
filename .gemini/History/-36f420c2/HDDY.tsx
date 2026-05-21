/**
 * IDENTITY: Validação Científica do Smart Sniper
 * PATH: src/app/artigos/validacao-smart-sniper/page.tsx
 * ROLE: Artigo acadêmico/técnico com análise de Monte Carlo, Sharpe e Barbell.
 * BINDING: [layout.tsx, globals.css, SectionHeader, GlassPanel]
 */

import JsonLd from '@/components/seo/JsonLd';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import Link from 'next/link';

export const metadata = {
    title: 'Validação Científica do Smart Sniper | Raphael Vitoi',
    description: 'Análise comparativa via Monte Carlo, Índice de Sharpe e Teoria de Portfólio aplicada ao poker MTT.',
};

const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Validação Científica do Protocolo Smart Sniper',
    description: 'Investigação da eficácia matemática de estratégias de grind em MTTs através de 10.000 simulações de Monte Carlo.',
    author: { '@type': 'Person', name: 'Raphael Vitoi' }
};

export default function ValidacaoSmartSniperPage () {
    return (
        <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body">
            <JsonLd data={ articleSchema } />

            {/* Header Central de Página */ }
            <div className="max-w-300 mx-auto px-6 pt-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                    <div>
                        <h1 className="text-[clamp(2rem,5vw,3rem)] font-black m-0 tracking-tighter bg-linear-to-r from-text-bright to-text-dim bg-clip-text text-transparent font-heading">
                            Otimização de Variância
                        </h1>
                        <p className="m-0 mt-4 text-[0.9rem] text-text-muted leading-relaxed max-w-145">
                            Validação Científica do Protocolo Smart Sniper. Análise exegética via Monte Carlo, Índice de Sharpe e Teoria de Portfólio.
                        </p>
                        <div className="flex flex-wrap items-center gap-4 mt-6">
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-indigo/10 border border-accent-indigo/20 text-[0.65rem] font-bold text-accent-indigo-light uppercase tracking-widest font-mono">
                                <span className="w-2 h-2 rounded-full bg-accent-emerald shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                Artigo Científico
                            </span>
                            <span className="text-[0.7rem] text-text-dim font-bold font-mono uppercase tracking-widest">
                                Validação Estratégica
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
                label="Abstract"
                title="Resumo do Estudo"
                description="Investigação da eficácia matemática de diferentes abordagens de grind através de simulações de alta fidelidade."
            />
            <div className="max-w-300 mx-auto px-6 pb-12">
                <GlassPanel className="p-8 sm:p-12 lg:p-16">
                    <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
                        <p>
                            Este estudo investiga a eficácia matemática de diferentes abordagens de grind em torneios multi-mesa (MTT) de No-Limit Hold&apos;em. Através de 10.000 simulações de Monte Carlo, comparamos a estratégia tradicional de alto volume (<em>Mass Multitabling</em>) com o <strong className="text-text-bright">Protocolo Smart Sniper</strong>, caracterizado por seleção de Small Fields, entrada tardia estratégica (<em>Late Reg</em>) e alocação assimétrica de capital aos domingos (<em>Capped Spend, High ABI</em>). Os resultados demonstram que o Protocolo Sniper oferece um <strong className="text-accent-emerald">Índice de Sharpe 8x superior</strong> à estratégia de volume puro, reduzindo o risco de prejuízo para &lt;3% enquanto mantém potencial de lucros de seis dígitos anuais.
                        </p>
                    </div>
                </GlassPanel>
            </div>

            <SectionHeader
                step="02"
                label="Fundamentação"
                title="Fundamentação Teórica"
                description="A arbitragem do ICM no registro tardio, o custo da diluição e o fator Small Field."
            />
            <div className="max-w-300 mx-auto px-6 pb-12">
                <GlassPanel className="p-8 sm:p-12 lg:p-16">
                    <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
                        <h3 className="text-text-bright font-heading">1.1 A Arbitragem do ICM no Registro Tardio</h3>
                        <p>
                            A base matemática da estratégia reside em uma ineficiência estrutural do ICM (<em>Independent Chip Model</em>) durante o período de registro tardio. Conforme jogadores são eliminados e o torneio avança, a equidade do prize pool é redistribuída passivamente entre as stacks ainda ativas.
                        </p>

                        <div className="bg-accent-emerald/10 border-l-4 border-accent-emerald p-8 my-10 rounded-r-2xl">
                            <h4 className="mt-0 text-accent-emerald font-bold text-lg mb-4 font-heading">Evidência Quantificada</h4>
                            <p className="text-text-main leading-relaxed">
                                Simulações computacionais comprovam que uma stack inserida no momento de fechamento do registro possui um valor monetário ($EV) entre <strong className="text-text-bright">4,7% e 16,0% superior</strong> ao valor do buy-in. O registro tardio atua como um subsídio matemático: ROI base positivo antes que qualquer carta seja distribuída.
                            </p>
                            <p className="m-0 font-mono text-[0.8rem] text-accent-emerald-light">
                                Ponto ótimo: entrada com 30-50bb (Late Reg 2x Average). Captura 5-8% de ágio sem a volatilidade de entrar com &lt;15bb.
                            </p>
                        </div>

                        <h3 className="text-text-bright font-heading">1.2 O Custo da Diluição (Deep Stack)</h3>
                        <p>
                            A decisão de registrar no Nível 1 (Deep Stack 100bb+) impõe um custo oculto: cada novo jogador que se registra dilui a equidade das stacks existentes em <strong className="text-text-bright">~0,28% por entrada</strong>. Um jogador que registra no Level 1 de um torneio com 500 entrantes pagou passivamente por 4 horas de diluição antes de receber qualquer retorno competitivo.
                        </p>

                        <h3 className="text-text-bright font-heading">1.3 O Fator Small Field e a Redução de Variância</h3>
                        <p>A variância em MTTs não é linear; é <strong className="text-text-bright">exponencial</strong> em relação ao tamanho do field:</p>

                        <div className="my-10 overflow-x-auto">
                            <table className="w-full text-left border-collapse bg-bg-elevated/20 rounded-xl overflow-hidden">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/5 text-text-bright uppercase text-[0.65rem] tracking-[0.15em] font-mono">
                                        <th className="py-4 px-6">Tamanho do Field</th>
                                        <th className="py-4 px-6">Probabilidade de FT</th>
                                        <th className="py-4 px-6">Impacto na Curva</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-text-muted">
                                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-6 text-text-main font-bold">3.000 jogadores (Large)</td>
                                        <td className="py-4 px-6 text-accent-rose font-mono">~0,3%</td>
                                        <td className="py-4 px-6">Downswings de centenas de buy-ins. Bankroll astronômico necessário.</td>
                                    </tr>
                                    <tr className="hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-6 text-text-main font-bold">300 jogadores (Small)</td>
                                        <td className="py-4 px-6 text-accent-emerald font-mono">~3,3%</td>
                                        <td className="py-4 px-6">Fluxo de caixa constante. Curva de crescimento suave e previsível.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </GlassPanel>
            </div>

            {/* Simulação e Resultados */ }
            <SectionHeader
                step="03"
                label="Dados"
                title="Performance Financeira"
                description="Simulações de Monte Carlo com 10.000 iterações revelam a estabilidade do Protocolo Sniper."
            />
            <div className="max-w-300 mx-auto px-6 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <GlassPanel className="p-8">
                        <h3 className="text-lg font-bold mb-6 text-text-bright font-heading">Vetor Semanal (Renda Fixa)</h3>
                        <ul className="space-y-4 list-none pl-0">
                            <li className="flex justify-between border-b border-white/5 pb-2 text-sm">
                                <span className="text-text-dim uppercase tracking-wider text-[0.7rem] font-mono">Alocação de Volume</span>
                                <span className="text-text-main font-bold">92%</span>
                            </li>
                            <li className="flex justify-between border-b border-white/5 pb-2 text-sm">
                                <span className="text-text-dim uppercase tracking-wider text-[0.7rem] font-mono">ROI Esperado</span>
                                <span className="text-accent-emerald font-bold">30%</span>
                            </li>
                            <li className="flex justify-between border-b border-white/5 pb-2 text-sm">
                                <span className="text-text-dim uppercase tracking-wider text-[0.7rem] font-mono">Desvio Padrão</span>
                                <span className="text-text-main font-bold">70 BI</span>
                            </li>
                        </ul>
                    </GlassPanel>
                    <GlassPanel className="p-8">
                        <h3 className="text-lg font-bold mb-6 text-text-bright font-heading">Vetor Domingo (Venture Capital)</h3>
                        <ul className="space-y-4 list-none pl-0">
                            <li className="flex justify-between border-b border-white/5 pb-2 text-sm">
                                <span className="text-text-dim uppercase tracking-wider text-[0.7rem] font-mono">Alocação de Volume</span>
                                <span className="text-text-main font-bold">8%</span>
                            </li>
                            <li className="flex justify-between border-b border-white/5 pb-2 text-sm">
                                <span className="text-text-dim uppercase tracking-wider text-[0.7rem] font-mono">ROI Esperado</span>
                                <span className="text-accent-emerald font-bold">40%</span>
                            </li>
                            <li className="flex justify-between border-b border-white/5 pb-2 text-sm">
                                <span className="text-text-dim uppercase tracking-wider text-[0.7rem] font-mono">Desvio Padrão</span>
                                <span className="text-text-main font-bold">130 BI</span>
                            </li>
                        </ul>
                    </GlassPanel>
                </div>
            </div>

            <SectionHeader
                step="04"
                label="Veredito"
                title="A Estratégia Barbell"
                description="A eliminação do meio-termo medíocre e a busca pela convexidade positiva. Q.E.D."
            />
            <div className="max-w-300 mx-auto px-6 pb-24">
                <GlassPanel className="p-8 sm:p-12 lg:p-16">
                    <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
                        <p>
                            A validação científica aponta que o sucesso do modelo reside na aplicação da <strong className="text-text-bright">Teoria da Convexidade de Nassim Taleb</strong> (Barbell Strategy) ao poker:
                        </p>

                        <div className="bg-bg-elevated/50 border border-accent-emerald/20 p-8 my-10 rounded-2xl">
                            <p className="font-mono text-[0.7rem] text-accent-emerald uppercase tracking-[0.2em] mb-4">Q.E.D. — Quod Erat Demonstrandum</p>
                            <p className="text-xl text-text-bright font-medium leading-relaxed mb-6">
                                O Protocolo Sniper é estatisticamente superior para a construção de carreira sustentável.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="text-sm">
                                    <strong className="text-text-main block mb-2 font-heading tracking-wide">Eficiência & Longevidade</strong>
                                    <p className="m-0 leading-relaxed">Captura ágio via arbitragem de ICM e previne o burnout inerente aos modelos de volume insano.</p>
                                </div>
                                <div className="text-sm">
                                    <strong className="text-text-main block mb-2 font-heading tracking-wide">Assimetria de Retorno</strong>
                                    <p className="m-0 leading-relaxed">O domingo destrava a cauda longa (Big Hits) sem expor o capital a riscos de ruína irracionais.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </GlassPanel>
            </div>

            <div className="max-w-300 mx-auto px-6 pb-24">
                <div className="flex justify-between border-t border-white/5 pt-12">
                    <Link href="/artigos/smart-sniper" className="text-accent-indigo-light text-sm font-bold flex items-center gap-2 hover:text-text-bright transition-colors">
                        <i className="fa-solid fa-arrow-left" /> PROTOCOLO SMART SNIPER
                    </Link>
                    <Link href="/artigos/estado-da-arte" className="text-accent-indigo-light text-sm font-bold flex items-center gap-2 hover:text-text-bright transition-colors">
                        ESTADO DA ARTE <i className="fa-solid fa-arrow-right" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
