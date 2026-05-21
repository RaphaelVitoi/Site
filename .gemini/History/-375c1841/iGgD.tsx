/**
 * IDENTITY: O Protocolo Smart Sniper
 * PATH: src/app/artigos/smart-sniper/page.tsx
 * ROLE: Manual de gestão de carreira, eficiência matemática e alta performance em MTTs.
 * BINDING: [layout.tsx, globals.css]
 */

import { SectionHeader } from '@/components/ui/SectionHeader';
import Link from 'next/link';

export const metadata = {
    title: 'O Protocolo Smart Sniper | Raphael Vitoi',
    description: 'Gestão de Carreira, Eficiência Matemática e Alta Performance em MTTs. Rotina Semanal, Estratégia de Domingo, Scaffolding.'
};

export default function SmartSniperPage() {
    return (
        <div style={{ minHeight: '100vh', background: '#020617', color: '#e2e8f0', overflowX: 'hidden' }}>

            {/* Header Central de Página */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1.5rem 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div>
                        <h1 style={{
                            fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, margin: 0,
                            letterSpacing: '-0.03em', background: 'linear-gradient(to right, #fff, #94a3b8)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            O Protocolo Smart Sniper
                        </h1>
                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: '580px' }}>
                            Gestão de Carreira, Eficiência Matemática e Alta Performance em MTTs. Manual Operacional 2025.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.8rem' }}>
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                padding: '0.35rem 0.75rem', borderRadius: '8px',
                                background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)',
                                fontSize: '0.65rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em',
                            }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.5)' }} />
                                Estratégia
                            </span>
                            <span style={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                                Manual Operacional
                            </span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Link href="/" style={{
                            padding: '0.4rem 0.75rem', borderRadius: '8px', background: 'rgba(30, 41, 59, 0.6)',
                            border: '1px solid rgba(255, 255, 255, 0.06)', color: '#94a3b8', fontSize: '0.7rem',
                            fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px',
                        }}>
                            <i className="fa-solid fa-arrow-left" style={{ fontSize: '0.65rem' }}></i> Início
                        </Link>
                    </div>
                </div>
            </div>

            <SectionHeader
                step="01"
                label="Manifesto"
                title="O Manifesto da Eficiência"
                description="A antítese do grind tradicional. Focado em Lucro Líquido e Longevidade, não em gerar rake."
            />
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
                <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-indigo-500/10 rounded-2xl">
                    <div className="prose prose-invert prose-lg max-w-none text-slate-300">
                        <p>O &quot;Grind&quot; tradicional morreu. A velha escola ensinava que para vencer no poker você precisava abrir 15 telas, jogar 12 horas por dia e aceitar uma variância brutal em nome do &quot;longo prazo&quot;.</p>
                        <p>Este documento apresenta a antítese dessa ideia. O Protocolo Smart Sniper não foi desenhado para gerar rake para os sites; foi desenhado para gerar <strong>Lucro Líquido e Longevidade</strong> para você.</p>

                        <div className="callout my-8">
                            <h4 style={{ marginTop: 0 }}>Três Pilares Científicos</h4>
                            <ol style={{ marginLeft: '1.5rem', listStyleType: 'decimal', color: '#cbd5e1' }}>
                                <li><strong>Eficiência Financeira:</strong> Buscamos o maior retorno por hora jogada ($/Hour), não apenas ROI por torneio.</li>
                                <li><strong>Sustentabilidade Cognitiva:</strong> Respeitamos os limites biológicos do cérebro para manter o A-Game.</li>
                                <li><strong>Matemática Defensiva:</strong> Usamos a seleção de torneios para blindar o bankroll contra a variância tóxica.</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <SectionHeader
                step="02"
                label="Rotina"
                title="A Estratégia 'Sniper'"
                description="De segunda a sábado, o objetivo é a construção de bankroll com baixo risco."
            />
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
                <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-indigo-500/10 rounded-2xl">
                    <div className="prose prose-invert prose-lg max-w-none text-slate-300">
                        <h3>2.1 O Volume Otimizado (6 a 8 Telas)</h3>
                        <p>A <strong>Lei de Yerkes-Dodson</strong> (neurociência cognitiva) demonstra que a performance humana segue uma curva de U invertido em relação à carga de trabalho: há um pico de rendimento em estimulação moderada, e colapso tanto por subestimulação quanto por sobrecarga.</p>
                        <p>Em termos práticos: acima de 8 telas, o cérebro entra em <strong>C-Game automático</strong> -- o jogador para de raciocinar e passa a reagir. O edge técnico desaparece. Abaixo de 4 telas, subutiliza-se o capital cognitivo disponível.</p>

                        <div className="not-prose my-6 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-slate-300">
                                        <th className="py-3 px-4">Parâmetro</th>
                                        <th className="py-3 px-4">Regra</th>
                                        <th className="py-3 px-4">Motivo</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-slate-400">
                                    <tr className="border-b border-white/5">
                                        <td className="py-3 px-4 text-white"><strong>Telas</strong></td>
                                        <td className="py-3 px-4">Max 6 a 8</td>
                                        <td className="py-3 px-4">Zona de Flow: identifica vilões, ajusta ranges e aplica pressão de ICM</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4 text-white"><strong>Excesso (12+)</strong></td>
                                        <td className="py-3 px-4 text-rose-400">Proibido</td>
                                        <td className="py-3 px-4">Transforma você em um robô explorável (C-Game forçado)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <h3>2.2 A Seleção de Alvos (Small Fields e Vanillas)</h3>
                        <p>Fugimos da loteria dos grandes fields (&gt;3.000 pessoas) durante a semana. A variância em MTTs não é linear; é <strong>exponencial</strong> em relação ao tamanho do field.</p>

                        <div className="not-prose my-6 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-slate-300">
                                        <th className="py-3 px-4">Critério</th>
                                        <th className="py-3 px-4">Alvo</th>
                                        <th className="py-3 px-4">Matemática</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-slate-400">
                                    <tr className="border-b border-white/5">
                                        <td className="py-3 px-4 text-white"><strong>Formato</strong></td>
                                        <td className="py-3 px-4">Vanilla (Freezout/Re-entry)</td>
                                        <td className="py-3 px-4">Menor variância, fluxo de caixa constante</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4 text-white"><strong>Field</strong></td>
                                        <td className="py-3 px-4 text-emerald-400">100 a 500 jogadores</td>
                                        <td className="py-3 px-4">FT: ~3.3% (300 field) vs ~0.3% (3.000 field) — 10x mais frequente</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Chegar à Mesa Final 10 vezes mais frequentemente não significa ganhar 10 vezes mais por torneio -- significa suavizar a curva de downswing e garantir fluxo de caixa constante, reduzindo o bankroll necessário para sobreviver à variância.</p>

                        <h3>2.3 A &quot;Zona de Domínio&quot; (O Pulo do Gato)</h3>
                        <p>Nós <strong>NÃO</strong> registramos no Nível 1 (Deep Stack 100bb+) de torneios regulares.</p>

                        <div className="callout callout-emerald my-8">
                            <h4 style={{ color: 'var(--accent-emerald)', marginTop: 0 }}>Entrada Cirúrgica</h4>
                            <p>Registramos quando a stack efetiva está entre <strong>30bb e 50bb</strong> (próximo ao fim do registro tardio ou quando a média é o dobro da inicial).</p>
                            <p><strong>Benefício:</strong> Entramos na fase onde o ICM começa a pressionar os stacks médios. Com 30-50bb, temos manobrabilidade total para exercer edge, mas sem a &quot;gordura&quot; inútil do early game.</p>
                            <p style={{ marginBottom: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Nota matemática: cada novo jogador que se registra dilui a equidade das stacks existentes em <strong style={{ color: 'var(--accent-emerald)' }}>~0,28% por entrada</strong>. Ao evitar o Deep Stack, você não paga essa taxa passiva por 4 horas. Ao entrar na Zona de Domínio, você captura uma stack já valorizada pelo ICM -- sem ter pagado o custo de permanecer.</p>
                        </div>
                    </div>
                </div>
            </div>

            <SectionHeader
                step="03"
                label="Domingo"
                title="Risco Assimétrico"
                description="O dia da liquidez máxima exige qualidade extrema. A aplicação prática da Estratégia de Haltere (Barbell) de Nassim Taleb."
            />
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
                <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-indigo-500/10 rounded-2xl">
                    <div className="prose prose-invert prose-lg max-w-none text-slate-300">
                        <h3>3.1 A Regra do &quot;Teto de Gastos&quot;</h3>
                        <p><strong>Princípio:</strong> Você nunca deve gastar mais em buy-ins no domingo do que gasta em uma terça-feira. Isso blinda seu bankroll contra a &quot;ressaca de segunda-feira&quot;.</p>

                        <h3>3.2 Menos Telas, Maiores Prêmios (4 Telas)</h3>
                        <p>Em vez de jogar 15 torneios baratos, jogamos <strong>4 Torneios Principais (Majors)</strong> com buy-ins mais altos (dentro do teto de gastos).</p>

                        <div className="not-prose my-6 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-slate-300">
                                        <th className="py-3 px-4">Dia</th>
                                        <th className="py-3 px-4">Telas</th>
                                        <th className="py-3 px-4">ABI</th>
                                        <th className="py-3 px-4">Objetivo</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-slate-400">
                                    <tr className="border-b border-white/5">
                                        <td className="py-3 px-4 text-white"><strong>Semana</strong></td>
                                        <td className="py-3 px-4">6-8</td>
                                        <td className="py-3 px-4">$20</td>
                                        <td className="py-3 px-4">Estabilidade e Fluxo de Caixa</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4 text-white"><strong>Domingo</strong></td>
                                        <td className="py-3 px-4 text-indigo-400">4</td>
                                        <td className="py-3 px-4 text-indigo-400">$40</td>
                                        <td className="py-3 px-4">Alavancagem de Patrimônio (Big Hit)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <SectionHeader
                step="04"
                label="Evolução"
                title="O Modelo Scaffolding"
                description="Proteção temporária e desbloqueio progressivo. Não jogamos onde não somos favoritos."
            />
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
                <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-indigo-500/10 rounded-2xl">
                    <div className="prose prose-invert prose-lg max-w-none text-slate-300">
                        <p>Não jogamos PKOs complexos ou Deep Stacks caros ainda. Isso não é uma limitação eterna; é uma <strong>proteção temporária</strong>.</p>

                        <div className="not-prose my-6 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-slate-300">
                                        <th className="py-3 px-4">Fase</th>
                                        <th className="py-3 px-4">Foco</th>
                                        <th className="py-3 px-4">Desbloqueio</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-slate-400">
                                    <tr className="border-b border-white/5">
                                        <td className="py-3 px-4 text-white"><strong>Fase 1 (Atual)</strong></td>
                                        <td className="py-3 px-4">Vanilla Small Field + Matemática ICM/Nash</td>
                                        <td className="py-3 px-4">Construir caixa e confiança</td>
                                    </tr>
                                    <tr className="border-b border-white/5">
                                        <td className="py-3 px-4 text-white"><strong>Fase 2</strong></td>
                                        <td className="py-3 px-4">Inserir PKOs na grade (Zona de Domínio)</td>
                                        <td className="py-3 px-4">Dominar matemática dos Bounties</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4 text-white"><strong>Fase 3 (Maestria)</strong></td>
                                        <td className="py-3 px-4">Liberdade para atacar qualquer formato</td>
                                        <td className="py-3 px-4">Edge técnico absoluto</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="callout callout-secondary my-8">
                            <h4 style={{ color: 'var(--accent-secondary)', marginTop: 0 }}>Regra de Ouro</h4>
                            <p style={{ marginBottom: 0 }}>Só jogamos onde somos favoritos. Se você não domina 100bb deep em PKO, jogar lá é <strong>doar dinheiro para os profissionais</strong>.</p>
                        </div>
                    </div>
                </div>
            </div>

            <SectionHeader
                step="05"
                label="Tática"
                title="A Grade de Ouro e Auditoria"
                description="Seleção de torneios, sites recomendados e o checklist diário do predador."
            />
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
                <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-indigo-500/10 rounded-2xl mb-12">
                    <div className="prose prose-invert prose-lg max-w-none text-slate-300">
                        <p>Os melhores torneios para executar a estratégia, focando em sites Tier S e A: <strong>Chico Network (BetOnline), Bodog, CoinPoker, PartyPoker</strong>.</p>

                        <div className="callout my-8">
                            <h4 style={{ marginTop: 0 }}>Segunda a Sábado — O Grind de Estabilidade <span style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>$20 ABI</span></h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Meta: 6 a 8 telas. Foco: Small Fields (&lt;500), Vanillas, entrada em Late Reg 2x Average.</p>
                            <p><strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-primary)' }}>Manhã / Início da Tarde</strong></p>
                            <ul style={{ marginLeft: '1.5rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                                <li><strong>Bodog:</strong> $22 Monster Stack (Freezout) — Field macio, estrutura lenta. Must Play.</li>
                                <li><strong>PartyPoker:</strong> $11 ou $22 The Daily Legends — Fields controlados, sem HUD.</li>
                                <li><strong>Chico (BetOnline):</strong> $22 Daily Grind — Field minúsculo (~200 players). Variância zero.</li>
                                <li><strong>CoinPoker:</strong> ₮20 ou ₮30 Swordfish — Overlay frequente, field cripto ultra-soft.</li>
                            </ul>
                            <p><strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-primary)' }}>Tarde / Noite (Prime Time)</strong></p>
                            <ul style={{ marginLeft: '1.5rem', color: '#cbd5e1', marginBottom: '0' }}>
                                <li><strong>Bodog:</strong> $33 ou $55 Crazy Eights / Lucky Sevens — Garantidos bons, field recreativo.</li>
                                <li><strong>Chico (BetOnline):</strong> $33 Daily Majors — Estrutura excelente para ICM no final.</li>
                                <li><strong>CoinPoker:</strong> ₮50 Marc Gork Special — Valor absurdo quando disponível.</li>
                            </ul>
                        </div>

                        <div className="callout callout-secondary my-8">
                            <h4 style={{ color: 'var(--accent-secondary)', marginTop: 0 }}>Domingo — O Dia do Sniper <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>$40 ABI / Teto $400</span></h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>4 telas de elite. Foco: Big Hit (prêmios &gt;$5k-$10k). Se cair, não reentrar em lixo.</p>
                            <ol style={{ marginLeft: '1.5rem', color: '#cbd5e1' }}>
                                <li style={{ marginBottom: '0.75rem' }}>
                                    <strong>$109 BetOnline Main Event (Chico Network)</strong><br />
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>~1.500 jogadores. 1º lugar paga $20k-$30k. Melhor chance de cravada grande com variância média.</span>
                                </li>
                                <li style={{ marginBottom: '0.75rem' }}>
                                    <strong>$82 ou $109 Bodog Special</strong><br />
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Field anônimo e recreativo. ROI inflado pela ausência de HUD. 1º lugar frequentemente &gt;$10k.</span>
                                </li>
                                <li style={{ marginBottom: '0.75rem' }}>
                                    <strong>$43/$54 GGPoker Bounty Hunters Sunday</strong><br />
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Late Reg agressivo obrigatório (20-30bb). Prêmio astronômico. Ticket de loteria com +EV.</span>
                                </li>
                                <li>
                                    <strong>$55 PartyPoker Sunday Party ou ₮100 CoinPoker Sunday Special</strong><br />
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Field limpo, sem HUD (Party) ou softness extremo para o prize pool (Coin).</span>
                                </li>
                            </ol>
                            <div style={{ borderTop: '1px solid rgba(225,29,72,0.2)', marginTop: '1rem', paddingTop: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#94a3b8' }}>
                                Exemplo de sessão: Chico $109 + Bodog $82 + GG $54 + Coin ₮100 ≈ <strong style={{ color: '#fff' }}>$345 investidos</strong> | Potencial de prêmio somado: <strong style={{ color: 'var(--accent-emerald)' }}>$50.000+</strong>
                            </div>
                        </div>

                        <h3>Checklist Diário do Aluno</h3>
                        <p>Antes de registrar, faça a auditoria:</p>
                        <div className="callout callout-emerald my-8">
                            <ol style={{ marginLeft: '1.5rem', listStyleType: 'decimal', color: '#cbd5e1', lineHeight: 2 }}>
                                <li><strong>Estou descansado?</strong> (Se não, não jogue. O A-Game é obrigatório).</li>
                                <li><strong>Estou respeitando o limite de telas?</strong> (Max 8 na semana, Max 4 no domingo).</li>
                                <li><strong>O torneio é Small Field?</strong> (Preferência por &lt;500 players na semana).</li>
                                <li><strong>Estou na Zona de Domínio?</strong> (Entrando com 30-50bb ou Late Reg inteligente).</li>
                                <li><strong>Evitei a armadilha do Deep Stack?</strong> (Não registrar no Nível 1 de torneios lentos).</li>
                            </ol>
                        </div>

                        <div className="verdict-box-emerald mt-8">
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-emerald)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>Conclusão</p>
                            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Você não é um &quot;clicador de botões&quot;. Você é um <strong>Gestor de Ativos</strong>.</p>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: 0 }}>Seu tempo, sua atenção e seu bankroll são seus ativos. Não os desperdice em loterias. Invista-os onde a matemática garante que você é o predador, não a presa.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 6rem' }}>
                <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '3rem', textAlign: 'center', border: '1px solid var(--glass-border)', backdropFilter: 'blur(12px)' }}>
                    <h3 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#fff' }}>Não acredite apenas em palavras.</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
                        Veja os dados brutos de simulações de Monte Carlo que comprovam a superioridade estatística deste protocolo.
                    </p>
                    <Link href="/artigos/validacao-smart-sniper" className="btn-primary pulse-glow" style={{ padding: '1rem 3rem' }}>
                        <i className="fa-solid fa-chart-line" style={{ marginRight: '8px' }}></i> Acessar Validação Científica
                    </Link>
                </div>
            </div>
        </div>
    );
}
