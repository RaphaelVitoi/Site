/**
 * IDENTITY: Artigo Científico — Validação do Protocolo Smart Sniper
 * PATH: src/app/artigos/validacao-smart-sniper/page.tsx
 * ROLE: Artigo acadêmico com análise de Monte Carlo, Índice de Sharpe e Barbell Strategy.
 * BINDING: [layout.tsx, globals.css]
 */

import { SectionHeader } from '@/components/ui/SectionHeader';
import Link from 'next/link';

export const metadata = {
    title: 'Validação Científica do Smart Sniper | Raphael Vitoi',
    description: 'Otimização de Variância e Eficiência de Capital em MTTs. Análise comparativa do Protocolo Smart Sniper via Monte Carlo, Índice de Sharpe e Teoria de Portfólio.',
};

export default function ValidacaoSmartSniperPage () {
    return (
        <div style={ { minHeight: '100vh', background: '#020617', color: '#e2e8f0', overflowX: 'hidden' } }>

            {/* Header Central de Página */ }
            <div style={ { maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1.5rem 0' } }>
                <div style={ { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' } }>
                    <div>
                        <h1 style={ {
                            fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, margin: 0,
                            letterSpacing: '-0.03em', background: 'linear-gradient(to right, #fff, #94a3b8)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        } }>
                            Otimização de Variância
                        </h1>
                        <p style={ { margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: '580px' } }>
                            Validação Científica do Smart Sniper. Análise via Monte Carlo, Índice de Sharpe e Teoria de Portfólio.
                        </p>
                        <div style={ { display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.8rem' } }>
                            <span style={ {
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                padding: '0.35rem 0.75rem', borderRadius: '8px',
                                background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)',
                                fontSize: '0.65rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em',
                            } }>
                                <span style={ { width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.5)' } } />
                                { ' ' }Artigo Científico
                            </span>
                            <span style={ { fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" } }>
                                Validação Estratégica
                            </span>
                        </div>
                    </div>
                    <div style={ { display: 'flex', gap: '0.5rem', alignItems: 'center' } }>
                        <Link href="/" style={ {
                            padding: '0.4rem 0.75rem', borderRadius: '8px', background: 'rgba(30, 41, 59, 0.6)',
                            border: '1px solid rgba(255, 255, 255, 0.06)', color: '#94a3b8', fontSize: '0.7rem',
                            fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px',
                        } }>
                            <i className="fa-solid fa-arrow-left" style={ { fontSize: '0.65rem' } }></i> Início
                        </Link>
                    </div>
                </div>
            </div>

            <SectionHeader
                step="01"
                label="Abstract"
                title="Resumo do Estudo"
                description="Investigação da eficácia matemática de diferentes abordagens de grind através de simulações."
            />
            <div style={ { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' } }>
                <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-indigo-500/10 rounded-2xl">
                    <div className="prose prose-invert prose-lg max-w-none text-slate-300">
                        <p>
                            Este estudo investiga a eficácia matemática de diferentes abordagens de grind em torneios multi-mesa (MTT) de No-Limit Hold&apos;em. Através de 10.000 simulações de Monte Carlo, comparamos a estratégia tradicional de alto volume (<em>Mass Multitabling</em>) com o Protocolo Smart Sniper, caracterizado por seleção de Small Fields, entrada tardia estratégica (<em>Late Reg</em>) e alocação assimétrica de capital aos domingos (<em>Capped Spend, High ABI</em>). Os resultados demonstram que o Protocolo Sniper oferece um <strong>Índice de Sharpe 8x superior</strong> à estratégia de volume puro, reduzindo o risco de prejuízo para &lt;3% enquanto mantém potencial de lucros de seis dígitos anuais.
                        </p>
                    </div>
                </div>
            </div>

            <SectionHeader
                step="02"
                label="Fundamentação"
                title="Fundamentação Teórica"
                description="A arbitragem do ICM no registro tardio, o custo da diluição e o fator Small Field."
            />
            <div style={ { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' } }>
                <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-indigo-500/10 rounded-2xl">
                    <div className="prose prose-invert prose-lg max-w-none text-slate-300">
                        <h3>1.1 A Arbitragem do ICM no Registro Tardio</h3>
                        <p>
                            A base matemática da estratégia reside em uma ineficiência estrutural do ICM (<em>Independent Chip Model</em>) durante o período de registro tardio. Conforme jogadores são eliminados e o torneio avança, a equidade do prize pool é redistribuída passivamente entre as stacks ainda ativas.
                        </p>

                        <div className="callout callout-emerald my-8">
                            <h4 style={ { color: 'var(--accent-emerald)', marginTop: 0 } }>Evidência Quantificada</h4>
                            <p>
                                Simulações computacionais (Monte Carlo em R) comprovam que uma stack inserida no momento de fechamento do registro possui um valor monetário ($EV) entre <strong>4,7% e 16,0% superior</strong> ao valor do buy-in. O registro tardio atua como um subsídio matemático: ROI base positivo antes que qualquer carta seja distribuída.
                            </p>
                            <p style={ { marginBottom: 0, fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-emerald)' } }>
                                Ponto ótimo: entrada com 30-50bb (Late Reg 2x Average). Captura 5-8% de ágio sem a volatilidade de entrar com &lt;15bb.
                            </p>
                        </div>

                        <h3>1.2 O Custo da Diluição (Deep Stack)</h3>
                        <p>
                            A decisão de registrar no Nível 1 (Deep Stack 100bb+) impõe um custo oculto: cada novo jogador que se registra dilui a equidade das stacks existentes em <strong>~0,28% por entrada</strong>. Um jogador que registra no Level 1 de um torneio com 500 entrantes pagou passivamente por 4 horas de diluição antes de receber qualquer retorno competitivo.
                        </p>
                        <p>
                            A Zona de Domínio (30-50bb) elimina essa taxa de permanência ao entrar diretamente na fase onde fichas já foram valorizadas pelo ICM, sem ter carregado o custo de gerá-las.
                        </p>

                        <h3>1.3 O Fator Small Field e a Redução de Variância</h3>
                        <p>A variância em MTTs não é linear; é <strong>exponencial</strong> em relação ao tamanho do field:</p>

                        <div className="not-prose my-6 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-slate-300">
                                        <th className="py-3 px-4">Tamanho do Field</th>
                                        <th className="py-3 px-4">Probabilidade de FT</th>
                                        <th className="py-3 px-4">Impacto na Curva de Resultados</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-slate-400">
                                    <tr className="border-b border-white/5">
                                        <td className="py-3 px-4 text-white">3.000 jogadores (Large)</td>
                                        <td className="py-3 px-4 text-rose-400">~0,3%</td>
                                        <td className="py-3 px-4">Downswings de centenas de buy-ins. Bankroll astronômico necessário.</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4 text-white">300 jogadores (Small)</td>
                                        <td className="py-3 px-4 text-emerald-400">~3,3%</td>
                                        <td className="py-3 px-4">Fluxo de caixa constante. Curva de crescimento suave e previsível.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <p style={ { fontSize: '0.9rem', color: 'var(--text-muted)' } }>
                            Chegar à Mesa Final 10 vezes mais frequentemente não significa ganhar 10x mais por torneio. Significa suavizar a curva de downswing, garantir fluxo de caixa e reduzir o bankroll mínimo necessário para sobreviver à variância inerente ao formato.
                        </p>
                    </div>
                </div>
            </div>

            <SectionHeader
                step="03"
                label="Modelagem"
                title="Modelagem Cognitiva"
                description="A Lei de Yerkes-Dodson, o limite de telas e a andaimagem progressiva (Scaffolding)."
            />
            <div style={ { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' } }>
                <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-indigo-500/10 rounded-2xl">
                    <div className="prose prose-invert prose-lg max-w-none text-slate-300">
                        <h3>2.1 A Lei de Yerkes-Dodson e o Limite de Telas</h3>
                        <p>
                            A neurociência cognitiva estabelece que a performance humana segue uma curva de U invertido em relação à carga de trabalho (Lei de Yerkes-Dodson): há um pico de rendimento em estimulação moderada, com colapso progressivo em sobrecarga.
                        </p>
                        <p>
                            Em poker: acima de 8 telas simultâneas, o cérebro entra em <strong>C-Game automático</strong> -- o jogador para de raciocinar e passa a reagir. O edge técnico desaparece. O modelo de 12-15 telas (Metralhadora) não apenas reduz ROI; ele <em>destrói</em> o edge que justificava o ROI teórico.
                        </p>

                        <div className="callout callout-secondary my-8">
                            <h4 style={ { marginTop: 0, color: 'var(--accent-secondary)' } }>Zona de Flow (6-8 telas)</h4>
                            <p style={ { marginBottom: 0 } }>
                                Ao limitar o volume a 6-8 telas simultâneas, o jogador opera na zona de estimulação ótima: identificação de padrões de vilões, ajuste de ranges em tempo real, aplicação de pressão de ICM em retas finais. É onde o ROI teórico se converte em ROI real.
                            </p>
                        </div>

                        <h3>2.2 O Modelo Scaffolding (Andaimagem Progressiva)</h3>
                        <p>
                            A decisão de evitar formatos complexos (PKOs profundos, Deep Stacks de alto stakes) não é limitação permanente -- é um filtro de competência. Jogar onde o edge não foi estabelecido é EV negativo independentemente das cartas recebidas.
                        </p>

                        <div className="not-prose my-6 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-slate-300">
                                        <th className="py-3 px-4">Fase</th>
                                        <th className="py-3 px-4">Foco</th>
                                        <th className="py-3 px-4">Critério de Desbloqueio</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-slate-400">
                                    <tr className="border-b border-white/5">
                                        <td className="py-3 px-4 text-white"><strong>1 (Base)</strong></td>
                                        <td className="py-3 px-4">Vanilla Small Field + ICM/Nash</td>
                                        <td className="py-3 px-4">Dominância técnica + fluxo de caixa positivo</td>
                                    </tr>
                                    <tr className="border-b border-white/5">
                                        <td className="py-3 px-4 text-white"><strong>2</strong></td>
                                        <td className="py-3 px-4">Inserir PKOs (Zona de Domínio)</td>
                                        <td className="py-3 px-4">Domínio da matemática de Bounties</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4 text-white"><strong>3 (Maestria)</strong></td>
                                        <td className="py-3 px-4">Qualquer formato</td>
                                        <td className="py-3 px-4">Edge técnico absoluto em todos os formatos</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <SectionHeader
                step="04"
                label="Metodologia"
                title="Simulação e Resultados"
                description="Monte Carlo com 10.000 iterações, performance financeira e o teste do Índice de Sharpe."
            />
            <div style={ { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' } }>
                <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-indigo-500/10 rounded-2xl">
                    <div className="prose prose-invert prose-lg max-w-none text-slate-300">
                        <p>Para validar a estratégia, simulamos 10.000 carreiras (iterações) de 10.000 torneios cada, com os seguintes parâmetros:</p>

                        <div className="not-prose my-6 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-slate-300">
                                        <th className="py-3 px-4">Vetor</th>
                                        <th className="py-3 px-4">Alocação</th>
                                        <th className="py-3 px-4">ROI</th>
                                        <th className="py-3 px-4">Desvio Padrão</th>
                                        <th className="py-3 px-4">ABI</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-slate-400">
                                    <tr className="border-b border-white/5">
                                        <td className="py-3 px-4 text-white"><strong>A (Semana)</strong></td>
                                        <td className="py-3 px-4">92% do volume</td>
                                        <td className="py-3 px-4 text-emerald-400">30%</td>
                                        <td className="py-3 px-4">70 BI</td>
                                        <td className="py-3 px-4">$20</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4 text-white"><strong>B (Domingo)</strong></td>
                                        <td className="py-3 px-4">8% do volume</td>
                                        <td className="py-3 px-4 text-emerald-400">40%</td>
                                        <td className="py-3 px-4">130 BI</td>
                                        <td className="py-3 px-4">$55</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <p style={ { fontSize: '0.9rem', color: 'var(--text-muted)' } }>
                            Gasto total equivalente: teto de buy-ins do domingo igual ao gasto semanal. Fator de convexidade inserido: probabilidade de Big Hit (0,1%) com cauda longa nos Vetores B.
                        </p>

                        <h3>4.1 Performance Financeira</h3>
                        <div className="not-prose my-6 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-slate-300">
                                        <th className="py-3 px-4">Métrica</th>
                                        <th className="py-3 px-4">Resultado</th>
                                        <th className="py-3 px-4">Interpretação</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-slate-400">
                                    <tr className="border-b border-white/5">
                                        <td className="py-3 px-4 text-white"><strong>Lucro Mediano</strong></td>
                                        <td className="py-3 px-4 text-emerald-400 font-mono">$77.488</td>
                                        <td className="py-3 px-4">Resultado padrão esperado. &quot;Salário base&quot; garantido.</td>
                                    </tr>
                                    <tr className="border-b border-white/5">
                                        <td className="py-3 px-4 text-white"><strong>Lucro Médio ($EV)</strong></td>
                                        <td className="py-3 px-4 font-mono">$77.698</td>
                                        <td className="py-3 px-4">Proximidade Média/Mediana = alta estabilidade da distribuição.</td>
                                    </tr>
                                    <tr className="border-b border-white/5">
                                        <td className="py-3 px-4 text-white"><strong>Top 1% (Upside)</strong></td>
                                        <td className="py-3 px-4 text-indigo-400 font-mono">$174.627</td>
                                        <td className="py-3 px-4">Cauda longa destravada pelos Majors de domingo (Big Hits).</td>
                                    </tr>
                                    <tr className="border-b border-white/5">
                                        <td className="py-3 px-4 text-white"><strong>Risco de Prejuízo</strong></td>
                                        <td className="py-3 px-4 text-emerald-400 font-mono">2,82%</td>
                                        <td className="py-3 px-4">Estatisticamente irrelevante em 10.000 torneios.</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4 text-white"><strong>Pior Cenário (Bottom 5%)</strong></td>
                                        <td className="py-3 px-4 text-emerald-400 font-mono">+$10.147</td>
                                        <td className="py-3 px-4">Mesmo no pior run de azar, o modelo permanece lucrativo.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <h3>4.2 O Índice de Sharpe: A Prova Definitiva</h3>
                        <p>
                            Em teoria de portfólio, não buscamos apenas retorno; buscamos <strong>retorno por unidade de risco</strong>. Fórmula adaptada ao poker: <span style={ { fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' } }>S = ROI / Desvio Padrão</span>
                        </p>

                        <div className="not-prose my-6 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-slate-300">
                                        <th className="py-3 px-4">Estratégia</th>
                                        <th className="py-3 px-4">ROI</th>
                                        <th className="py-3 px-4">Desvio Padrão</th>
                                        <th className="py-3 px-4">Sharpe Ratio</th>
                                        <th className="py-3 px-4">Eficiência Relativa</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-slate-400">
                                    <tr className="border-b border-white/5">
                                        <td className="py-3 px-4 text-white"><strong>Metralhadora</strong> <span className="text-xs text-slate-500">(Max Late Reg)</span></td>
                                        <td className="py-3 px-4">10%</td>
                                        <td className="py-3 px-4">160 BI</td>
                                        <td className="py-3 px-4 text-rose-400 font-mono">0,062</td>
                                        <td className="py-3 px-4 text-rose-400">Baseline</td>
                                    </tr>
                                    <tr className="border-b border-white/5">
                                        <td className="py-3 px-4 text-white"><strong>Grinder Clássico</strong> <span className="text-xs text-slate-500">(Deep Stack)</span></td>
                                        <td className="py-3 px-4">20%</td>
                                        <td className="py-3 px-4">120 BI</td>
                                        <td className="py-3 px-4 text-amber-400 font-mono">0,166</td>
                                        <td className="py-3 px-4 text-amber-400">2,7x</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4 text-white"><strong>Smart Sniper</strong> <span className="text-xs text-slate-500">(Protocolo Vitoi)</span></td>
                                        <td className="py-3 px-4 text-emerald-400">35%</td>
                                        <td className="py-3 px-4 text-emerald-400">70 BI</td>
                                        <td className="py-3 px-4 text-emerald-400 font-mono font-bold">0,500</td>
                                        <td className="py-3 px-4 text-emerald-400 font-bold">8,1x</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="callout callout-emerald my-8">
                            <h4 style={ { color: 'var(--accent-emerald)', marginTop: 0 } }>5.2 O Subsídio do ICM (Arbitragem de Late Reg)</h4>
                            <p>O Modelo B paga $100 por uma stack que vale $100. O Modelo C, ao entrar com 30-50bb via Late Reg (Regra do 2x Average), paga $100 por uma stack que vale estatisticamente <strong>$105 a $108</strong>.</p>
                            <p style={ { fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-emerald)', marginBottom: 0 } }>
                                Lucro Total = Skill Edge + Arbitragem ICM<br />
                                Modelo B: 20% (Skill) + 0% (ICM) = 20% — em 8h de trabalho<br />
                                Modelo C: 25% (Skill) + 8% (ICM) = 33% — em 4h de trabalho
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <SectionHeader
                step="05"
                label="Síntese"
                title="A Estratégia Barbell"
                description="A eliminação do meio-termo medíocre. Q.E.D."
            />
            <div style={ { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' } }>
                <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-indigo-500/10 rounded-2xl mb-12">
                    <div className="prose prose-invert prose-lg max-w-none text-slate-300">
                        <p>
                            A validação científica aponta que o sucesso do modelo reside na aplicação da <strong>Teoria da Convexidade de Nassim Taleb</strong> (Barbell Strategy) ao poker:
                        </p>

                        <div style={ { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' } }>
                            <div className="callout callout-emerald">
                                <h4 style={ { color: 'var(--accent-emerald)', marginTop: 0 } }>Lado Seguro (Semana)</h4>
                                <p style={ { fontSize: '0.9rem', marginBottom: 0 } }>
                                    Atua como <strong>Renda Fixa</strong>. Small Fields em sites soft com 30% de ROI garantem que as despesas operacionais sejam pagas e o bankroll cresça linearmente. Extrema aversão ao risco.
                                </p>
                            </div>
                            <div className="callout callout-secondary">
                                <h4 style={ { color: 'var(--accent-secondary)', marginTop: 0 } }>Lado Agressivo (Domingo)</h4>
                                <p style={ { fontSize: '0.9rem', marginBottom: 0 } }>
                                    Atua como <strong>Venture Capital</strong>. Majors com foco total em 4 telas podem gerar retornos de 100x a 500x (Big Hits) sem expor o bankroll a risco de ruína maior que nos dias úteis. Extrema exposição ao lucro.
                                </p>
                            </div>
                        </div>

                        <div className="verdict-box-emerald mt-8">
                            <p style={ { fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--accent-emerald)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.75rem' } }>Q.E.D. — Quod Erat Demonstrandum</p>
                            <p style={ { fontSize: '1.05rem', marginBottom: '1rem' } }>
                                A estratégia &quot;Smart Sniper&quot; é estatisticamente superior para a construção de carreira profissional em MTTs.
                            </p>
                            <ul style={ { color: '#cbd5e1', marginLeft: '1.5rem', marginBottom: 0 } }>
                                <li><strong>Eficiência:</strong> Captura o ágio do Late Reg sem a volatilidade do curto prazo.</li>
                                <li><strong>Consistência:</strong> Small Fields garantem fluxo de caixa e downswings gerenciáveis.</li>
                                <li><strong>Longevidade:</strong> Protege o capital mental e financeiro, prevenindo o burnout inevitável dos modelos de alto volume.</li>
                                <li><strong>Assimetria:</strong> O domingo destrava a cauda longa da distribuição sem expor o bankroll ao risco de ruína.</li>
                            </ul>
                        </div>

                        <p style={ { color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '2rem' } }>
                            Validado por: Análise Computacional de Monte Carlo (10.000 iterações) e Teoria de Portfólio de Markowitz/Taleb. Dados calibrados por bancos reais de jogadores vencedores em Small Fields online (2023-2025).
                        </p>
                    </div>
                </div>
            </div>

            <div style={ { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' } }>
                <nav className="article-nav">
                    <Link href="/artigos/smart-sniper">&larr; Protocolo Smart Sniper</Link>
                    <Link href="/artigos/estado-da-arte">Estado da Arte &rarr;</Link>
                </nav>
            </div>
        </div>
    );
}
