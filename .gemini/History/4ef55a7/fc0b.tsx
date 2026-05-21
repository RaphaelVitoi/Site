/**
 * IDENTITY: Whitepaper - O Estado da Arte do ICM 2025
 * PATH: src/app/artigos/estado-da-arte/page.tsx
 * ROLE: Artigo avançado sobre tendências High Stakes, Donk Bet meta, Micro-Stack Irradiation, IA vs HRC.
 * BINDING: [layout.tsx, globals.css]
 */

import { SectionHeader } from '@/components/ui/SectionHeader';
import Link from 'next/link';

export const metadata = {
    title: 'O Estado da Arte do ICM 2025 | Raphael Vitoi',
    description: 'Novas Fronteiras, Tendências High Stakes e Ferramentas de Elite. Donk Bet meta, Efeito de Irradiação e IA vs HRC Pro.'
};

export default function EstadoDaArtePage() {
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
                            O Estado da Arte do ICM 2025
                        </h1>
                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: '580px' }}>
                            Novas Fronteiras, Tendências High Stakes e Ferramentas de Elite. Donk Bet meta, Efeito de Irradiação e IA vs HRC Pro.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.8rem' }}>
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                padding: '0.35rem 0.75rem', borderRadius: '8px',
                                background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)',
                                fontSize: '0.65rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em',
                            }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.5)' }} />
                                Whitepaper
                            </span>
                            <span style={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                                Nível Avançado
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
                label="Evolução"
                title="A Evolução do Organismo"
                description="Como a elite mundial está encontrando brechas ofensivas na passividade imposta pelo ICM."
            />
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
                <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-indigo-500/10 rounded-2xl">
                    <div className="prose prose-invert prose-lg max-w-none text-slate-300">
                        <p>O poker é um organismo vivo e em constante mutação. O que definimos como &quot;padrão&quot; hoje pode se tornar uma estratégia explorável amanhã. Ao observarmos as tendências mais recentes dos circuitos High Roller (como as séries Triton e SHRB) e a evolução exponencial das ferramentas de Inteligência Artificial em 2024/2025, identificamos dinâmicas de alta importância que refinam o nosso entendimento sobre o ICM Pós-Flop.</p>
                        <p>Este documento não trata apenas de saber &quot;trancar&quot; o jogo para garantir payjumps. Trata-se de entender como a elite mundial está <strong>encontrando brechas ofensivas na passividade que o ICM impõe</strong>.</p>
                    </div>
                </div>
            </div>

            <SectionHeader
                step="02"
                label="Meta Game"
                title="O Ataque Defensivo (Donk Bet)"
                description="Explorando a passividade forçada com lideranças minúsculas para roubar iniciativa."
            />
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
                <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-indigo-500/10 rounded-2xl">
                    <div className="prose prose-invert prose-lg max-w-none text-slate-300">
                        <p>Historicamente, a passividade (checks) tem sido a resposta padrão para o aumento do Risk Premium. Contudo, solvers de última geração validaram uma linha que desafia a intuição clássica: o <strong>Donk Bet do Big Blind</strong> em boards que favorecem o agressor.</p>

                        <h3>O Cenário</h3>
                        <p>Imagine uma situação de ChipEV em um board K&#9830; J&#9827; T&#9824;. O BB quase nunca lideraria aqui. Porém, sob pressão extrema de ICM, o agressor (IP) está &quot;algemado&quot; pelo Risk Premium. Ele é forçado a dar muitos check-backs para controlar o tamanho do pote e evitar riscos de queda.</p>

                        <h3>A Lógica da Jogada</h3>
                        <p>O Big Blind &quot;percebe&quot; que o IP vai dar check com muitas mãos médias para realizar equidade gratuitamente. Para negar essa equidade (deny equity) sem arriscar um check-raise caro, o BB passa a liderar com <strong>sizings minúsculos (10% a 20% do pote)</strong>.</p>

                        <div className="callout my-8">
                            <h4 style={{ marginTop: 0 }}>Por que funciona? (A Falha na Matriz)</h4>
                            <p>A grande sacada estratégica é a <strong>impunidade</strong>. Em ChipEV, a melhor resposta para uma donk bet é o raise. No ICMev, crescer o pote para punir uma aposta pequena seria um <strong>erro matemático grave</strong> para o IP (o stack maior).</p>
                            <p style={{ marginBottom: 0 }}>Resultado: O donk bet quase nunca é punido com raise. Isso permite que o BB roube a iniciativa, aumente a realização de sua equidade e transforme mãos que seriam auto-folds em mãos lucrativas. É uma forma barata de proteção que explora a passividade forçada do adversário.</p>
                        </div>
                    </div>
                </div>
            </div>

            <SectionHeader
                step="03"
                label="Irradiação"
                title="A Física dos Micro-Stacks"
                description="Como uma única stack agonizante impõe lei marcial em toda a mesa."
            />
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
                <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-indigo-500/10 rounded-2xl">
                    <div className="prose prose-invert prose-lg max-w-none text-slate-300">
                        <p>A mesa final funciona como um organismo onde as stacks se influenciam mutuamente. Para tangibilizar isso, introduzimos o conceito de <strong>Irradiação de Risco</strong>.</p>

                        <h3>O Campo de Força</h3>
                        <p>Imagine que existe um &quot;Micro-Stack&quot; na mesa (alguém com menos de 5bb). A presença desse jogador cria um campo de força que <strong>altera a matemática de todos os outros confrontos</strong>, mesmo aqueles em que ele não está envolvido.</p>

                        <div className="callout callout-secondary my-8">
                            <h4 style={{ color: 'var(--accent-secondary)', marginTop: 0 }}>Exemplo Prático</h4>
                            <p>Você tem 30bb e joga uma mão contra o Chip Leader (80bb). O jogador com 2bb está em outra posição.</p>
                            <ul style={{ marginLeft: '1.5rem', color: '#cbd5e1' }}>
                                <li>O seu Risk Premium dispara para níveis estratosféricos.</li>
                                <li>A probabilidade do stack curto cair na próxima mão é altíssima, garantindo um payjump imediato.</li>
                                <li>O custo matemático de você cair antes desse &quot;morto-vivo&quot; é, para fins práticos, infinito.</li>
                            </ul>
                            <p style={{ marginBottom: 0 }}><strong>Conclusão:</strong> Quando há um micro-stack agonizando, o &quot;acordo silencioso&quot; de passividade torna-se uma &quot;lei marcial&quot;. A agressividade entre os stacks médios deve cair a quase zero.</p>
                        </div>
                    </div>
                </div>
            </div>

            <SectionHeader
                step="04"
                label="Tecnologia"
                title="A Batalha das Ferramentas: IA vs. HRC Pro"
                description="O trade-off entre a velocidade estimativa das Redes Neurais e a precisão do e-Nash tradicional."
            />
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
                <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-indigo-500/10 rounded-2xl">
                    <div className="prose prose-invert prose-lg max-w-none text-slate-300">
                        <h3>A Revolução da IA (GTO Wizard AI)</h3>
                        <p>A nova geração de solvers baseados em redes neurais consegue estimar o Bunching Effect em segundos e trouxe luz para soluções de Multi-Way Pós-Flop, algo antes inviável.</p>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-primary)' }}>A IA do GTO Wizard derrotou o lendário Slumbot com uma margem de 19,4bb/100.</p>

                        <h3>A Transparência do HRC Pro</h3>
                        <p>Apesar da velocidade da IA, o Holdem Resources Calculator (HRC Pro) continua sendo a referência para transparência e precisão cirúrgica. Ele permite exportar faixas de bunching, entender a mecânica do e-Nash e solucionar spots complexos como <strong>Multiway PKO + ICM simultaneamente</strong>.</p>

                        <div className="not-prose my-6 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-slate-300">
                                        <th className="py-3 px-4">Critério</th>
                                        <th className="py-3 px-4">GTO Wizard AI</th>
                                        <th className="py-3 px-4">HRC Pro</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-slate-400">
                                    <tr className="border-b border-white/5">
                                        <td className="py-3 px-4 text-white"><strong>Velocidade</strong></td>
                                        <td className="py-3 px-4 text-emerald-400">Segundos (rede neural)</td>
                                        <td className="py-3 px-4">Minutos a horas</td>
                                    </tr>
                                    <tr className="border-b border-white/5">
                                        <td className="py-3 px-4 text-white"><strong>Bunching Effect</strong></td>
                                        <td className="py-3 px-4">Estimativa por IA</td>
                                        <td className="py-3 px-4 text-emerald-400">Exportação precisa</td>
                                    </tr>
                                    <tr className="border-b border-white/5">
                                        <td className="py-3 px-4 text-white"><strong>Multiway ICM</strong></td>
                                        <td className="py-3 px-4">Limitado</td>
                                        <td className="py-3 px-4 text-emerald-400">Completo (PKO + ICM)</td>
                                    </tr>
                                    <tr className="border-b border-white/5">
                                        <td className="py-3 px-4 text-white"><strong>Transparência</strong></td>
                                        <td className="py-3 px-4">&quot;Caixa preta&quot;</td>
                                        <td className="py-3 px-4 text-emerald-400">Total (e-Nash visível)</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4 text-white"><strong>Uso Ideal</strong></td>
                                        <td className="py-3 px-4">Volume e heurísticas rápidas</td>
                                        <td className="py-3 px-4">Estudo cirúrgico de spots críticos</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="verdict-box mt-8">
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>Veredito Tecnológico</p>
                            <p style={{ fontSize: '1rem', marginBottom: 0 }}>Utilize a IA para volume e heurísticas rápidas. Utilize o HRC Pro para o estudo profundo de spots críticos de FT onde o Bunching e a assimetria de stacks são extremos.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
                <nav className="article-nav">
                    <Link href="/aulas/leitura-icm">&larr; Entendendo o ICM</Link>
                    <Link href="/artigos/smart-sniper">Protocolo Smart Sniper &rarr;</Link>
                </nav>
            </div>
        </div>
    );
}
