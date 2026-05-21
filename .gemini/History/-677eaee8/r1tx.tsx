/**
 * IDENTITY: A Amortização da Edge
 * PATH: src/app/biblioteca/voce-aprende-poker-errado/page.tsx
 * ROLE: Artigo aprofundado sobre a dinâmica da edge em cenários de stack curta.
 * BINDING: [layout.tsx, globals.css]
 */

import ContentFooter from '@/components/content/ContentFooter';
import { SectionHeader } from '@/components/ui/SectionHeader';
import Link from 'next/link';
import ResurrectionRiskSimulator from './ResurrectionRiskSimulator';

export const metadata = {
    title: 'A Amortização da Edge | Raphael Vitoi',
    description: 'Por que a distância entre um jogador de elite e um amador diminui drasticamente quando ambos têm 10 big blinds.',
};

export default function AmortizacaoEdgePage() {
    const articleUrl = "https://www.pokerracional.com/biblioteca/voce-aprende-poker-errado";
    const articleTitle = "A Amortização da Edge | Raphael Vitoi";

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
                            A Amortização da Edge
                        </h1>
                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: '580px' }}>
                            Por que a distância entre um jogador de elite e um amador diminui drasticamente quando ambos têm 10 big blinds.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.8rem' }}>
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                padding: '0.35rem 0.75rem', borderRadius: '8px',
                                background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)',
                                fontSize: '0.65rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em',
                            }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.5)' }} />
                                Artigo
                            </span>
                            <span style={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                                Paradoxo da Competência
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Link href="/biblioteca" style={{
                            padding: '0.4rem 0.75rem', borderRadius: '8px', background: 'rgba(30, 41, 59, 0.6)',
                            border: '1px solid rgba(255, 255, 255, 0.06)', color: '#94a3b8', fontSize: '0.7rem',
                            fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px',
                        }}>
                            <i className="fa-solid fa-arrow-left" style={{ fontSize: '0.65rem' }}></i> Biblioteca
                        </Link>
                    </div>
                </div>
            </div>

            <SectionHeader
                step="01"
                label="Contexto"
                title="O Colapso da Árvore de Decisões"
                description="A complexidade, que é a arma do jogador forte, é neutralizada. A simplicidade, que é o refúgio do jogador fraco, torna-se um escudo inesperadamente eficaz."
            />
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
                <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-emerald-500/10 rounded-2xl">
                    <div className="prose prose-invert prose-lg max-w-none text-slate-300">
                        <p>Existe um paradoxo no poker de torneio que a matemática pura do GTO, em sua forma mais crua, tem dificuldade de expressar. É a ideia de que a sua vantagem técnica, sua *edge*, não é uma constante universal. Ela é elástica, condicionada, e em certas situações, brutalmente comprimida. O cenário mais comum dessa compressão é o jogo de stacks curtas. Com 100 big blinds, a distância entre um profissional de elite e um jogador recreativo é um abismo. Com 10 big blinds, essa distância encolhe para algo parecido com um passo em falso.</p>
                        <p>Um jogo de poker com 100 big blinds é uma árvore de decisões com galhos que se espalham em fractais. Cada street — flop, turn, river — é um novo universo de possibilidades, de tamanhos de aposta, de blefes, de armadilhas. É nesse labirinto que o jogador superior prospera. Ele navega melhor, enxerga mais longe, entende as texturas do caminho.</p>
                        <p>Com 10 big blinds, essa árvore é podada com um machado. O jogo regride para uma decisão binária, quase sempre pré-flop: ir all-in ou foldar. A floresta complexa vira um corredor com duas portas. A oportunidade para o erro sutil, para a má calibração de frequência, para o hero call mal-executado, simplesmente desaparece. O jogador fraco é protegido de sua própria inabilidade pela pobreza de suas opções. Ele não pode cometer um erro caro no river se ele nunca chega ao river.</p>
                        <div className="callout callout-emerald my-8">
                            <h4 style={{ marginTop: 0, color: 'var(--accent-emerald)' }}>O Paradoxo da Vulnerabilidade</h4>
                            <p style={{ marginBottom: 0 }}>A situação crítica do short stack (precisa agir, está vulnerável) é o que, paradoxalmente, o salva. Ele não tem "fichas para pensar", não tem "stack para cometer erros". Sua vulnerabilidade força uma simplicidade que amortece a vantagem técnica do oponente. É como tentar usar um supercomputador para jogar jogo da velha; o poder de processamento superior torna-se irrelevante.</p>
                        </div>
                    </div>
                </div>
            </div>

            <SectionHeader
                step="02"
                label="Laboratório"
                title="O Risco da Ressurreição"
                description="O ganho marginal em ChipEV não precifica a perda de controle, a perda de pressão e a ressurreição de um oponente que estava taticamente neutralizado."
            />
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
                <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-emerald-500/10 rounded-2xl mb-12">
                    <div className="prose prose-invert prose-lg max-w-none text-slate-300">
                        <p>Para materializar essa ideia, vamos a um "toy game" numa mesa final de 3 jogadores:</p>
                        <ul>
                            <li><strong>Chip Leader (CL):</strong> 100 BB (você)</li>
                            <li><strong>Stack Médio (M):</strong> 30 BB</li>
                            <li><strong>Short Stack (SS):</strong> 10 BB</li>
                        </ul>
                        <p>Ação: O SB (SS) vai all-in de 10 BBs. Você está no BB. O pote tem 11 BBs (10 do SB + 1 do seu BB). Você precisa pagar 9 BBs para um pote total de 20 BBs. Suas pot odds exigem que você tenha <code>9 / (11 + 9) = 45%</code> de equidade.</p>
                        <p>Você tem uma mão como KJo, que tem cerca de 58% de equidade contra um range razoável de shove do SS. O cálculo de ChipEV é direto e muito positivo: <code>EV(Call) = (0.58 * 11 BB) - (0.42 * 9 BB) = +2.6 BB</code>.</p>
                        <p>Um lucro de 2.6 big blinds. A matemática de curto prazo grita: "PAGUE!". Mas a Perspectiva Matemática sussurra: "Espere, analise o ecossistema."</p>
                        <p>Isso nos leva a uma implicação estratégica crucial. Se você é o chip leader e enfrenta um all-in de 10bbs de um jogador mais fraco, a sua decisão não é apenas um cálculo de pot odds e equidade. É um cálculo de ecossistema. O erro do chip leader não é o call matemático; é o call que devolve a complexidade ao oponente que estava neutralizado por ela.</p>
                    </div>
                </div>
                <ResurrectionRiskSimulator />
            </div>

            <SectionHeader
                step="03"
                label="Síntese"
                title="Responsabilidade Sistêmica"
                description="A verdadeira maestria não está em ter uma edge, mas em entender a topografia onde essa edge pode ser aplicada."
            />
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
                <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-emerald-500/10 rounded-2xl">
                    <div className="prose prose-invert prose-lg max-w-none text-slate-300">
                        <p>E se, no cenário oposto, você vai all-in e é pago por uma mão que, segundo a teoria, deveria ser um fold claro? A tendência é culpar o "vilão maluco", o "pagador". Mas isso é uma visão incompleta. Em um sistema fechado como uma mesa de poker, o erro raramente é unilateral.</p>
                        <p>Se o seu range de all-in foi construído sob a premissa de que seu oponente foldaria corretamente, e ele não o faz, o erro também é seu. Foi uma <strong>falha de calibração</strong>. Você não modelou corretamente a "frequência de incerteza" ou a "taxa de maluquice" daquele jogador específico. Você jogou GTO contra um oponente que não estava na mesma página do livro.</p>
                        <p>Essa colisão, esse erro mútuo, quase sempre beneficia o resto da mesa. Os outros jogadores, que não investiram nada, assistem dois oponentes se arriscarem em uma situação que não deveria acontecer, diluindo a equidade um do outro e aumentando a chance de um payjump passivo para todos. O erro não foi só do pagador; foi do agressor que não antecipou o erro do pagador.</p>
                        <hr className="border-white/10 my-8" />
                        <p>Achar que sua superioridade técnica te dá licença para tomar liberdades contra um short stack é ignorar que a simplicidade do jogo dele é uma armadura. A sua tarefa não é provar que você é melhor; é evitar as colisões de variância pura onde a sua habilidade é amortizada e o resultado se aproxima de um cara ou coroa. Porque nesse jogo, mesmo que a moeda seja levemente viciada a seu favor, a queda ainda pode te quebrar.</p>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
                <ContentFooter
                    shareTitle={articleTitle}
                    shareUrl={articleUrl}
                    backLinkHref="/biblioteca"
                    backLinkText="Voltar para a Biblioteca"
                />
            </div>
        </div>
    );
}
