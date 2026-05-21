/**
 * IDENTITY: A Amortização da Edge
 * PATH: src/app/biblioteca/voce-aprende-poker-errado/page.tsx
 * NOTE: O caminho do arquivo deve ser renomeado para 'amortizacao-da-edge' para alinhar com ROUTES.md.
 * ROLE: Artigo aprofundado sobre a dinâmica da edge em cenários de stack curta.
 * BINDING: [layout.tsx, globals.css]
 */

import Link from 'next/link';
import ResurrectionRiskSimulator from './ResurrectionRiskSimulator';

export const metadata = {
    title: 'A Amortização da Edge | Raphael Vitoi',
    description: 'Por que a distância entre um jogador de elite e um amador diminui drasticamente quando ambos têm 10 big blinds.',
};

export default function AmortizacaoEdgePage() {
    return (
        <main className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 1.5rem' }}>
            <header className="page-header" style={{ paddingBottom: '1rem' }}>
                <p className="page-label">
                    <span className="fa-solid fa-compress-arrows-alt"></span> Paradoxo da Competência
                </p>
                <h1>A Amortização da Edge</h1>
                <p className="page-subtitle">Por que a distância entre um jogador de elite e um amador diminui drasticamente quando ambos têm 10 big blinds.</p>
            </header>

            <section>
                <article>
                    <p>Existe um paradoxo no poker de torneio que a matemática pura do GTO, em sua forma mais crua, tem dificuldade de expressar. É a ideia de que a sua vantagem técnica, sua *edge*, não é uma constante universal. Ela é elástica, condicionada, e em certas situações, brutalmente comprimida. O cenário mais comum dessa compressão é o jogo de stacks curtas. Com 100 big blinds, a distância entre um profissional de elite e um jogador recreativo é um abismo. Com 10 big blinds, essa distância encolhe para algo parecido com um passo em falso.</p>
                    <p>A complexidade, que é a arma do jogador forte, é neutralizada. A simplicidade, que é o refúgio do jogador fraco, torna-se um escudo inesperadamente eficaz.</p>

                    <h3 className="article-title">O Colapso da Árvore de Decisões: A Simplicidade como Escudo</h3>
                    <p>Um jogo de poker com 100 big blinds é uma árvore de decisões com galhos que se espalham em fractais. Cada street — flop, turn, river — é um novo universo de possibilidades, de tamanhos de aposta, de blefes, de armadilhas. É nesse labirinto que o jogador superior prospera. Ele navega melhor, enxerga mais longe, entende as texturas do caminho.</p>
                    <p>Com 10 big blinds, essa árvore é podada com um machado. O jogo regride para uma decisão binária, quase sempre pré-flop: ir all-in ou foldar. A floresta complexa vira um corredor com duas portas. A oportunidade para o erro sutil, para a má calibração de frequência, para o hero call mal-executado, simplesmente desaparece. O jogador fraco é protegido de sua própria inabilidade pela pobreza de suas opções. Ele não pode cometer um erro caro no river se ele nunca chega ao river.</p>

                    <div className="callout">
                        <h4 style={{ marginTop: 0 }}>O Paradoxo da Vulnerabilidade</h4>
                        <p style={{ marginBottom: 0 }}>A situação crítica do short stack (precisa agir, está vulnerável) é o que, paradoxalmente, o salva. Ele não tem "fichas para pensar", não tem "stack para cometer erros". Sua vulnerabilidade força uma simplicidade que amortece a vantagem técnica do oponente. É como tentar usar um supercomputador para jogar jogo da velha; o poder de processamento superior torna-se irrelevante.</p>
                    </div>

                    <h3 className="article-title">Toy Game: O Custo Invisível do Call</h3>
                    <p>Para materializar essa ideia, vamos a um "toy game" numa mesa final de 3 jogadores:</p>
                    <ul>
                        <li><strong>Chip Leader (CL):</strong> 100 BB (você)</li>
                        <li><strong>Stack Médio (M):</strong> 30 BB</li>
                        <li><strong>Short Stack (SS):</strong> 10 BB</li>
                    </ul>
                    <p>Ação: O SB (SS) vai all-in de 10 BBs. Você está no BB. O pote tem 11 BBs (10 do SB + 1 do seu BB). Você precisa pagar 9 BBs para um pote total de 20 BBs. Suas pot odds exigem que você tenha <code>9 / (11 + 9) = 45%</code> de equidade.</p>
                    <p>Você tem uma mão como KJo, que tem cerca de 58% de equidade contra um range razoável de shove do SS. O cálculo de ChipEV é direto e muito positivo:</p>
                    <p><code>EV(Call) = (0.58 * 11 BB) - (0.42 * 9 BB) = 6.38 - 3.78 = +2.6 BB</code></p>
                    <p>Um lucro de 2.6 big blinds. A matemática de curto prazo grita: "PAGUE!". Mas a Perspectiva Matemática sussurra: "Espere, analise o ecossistema."</p>
                    <ul>
                        <li><strong>Se você ganha:</strong> Seu stack vai para 110 BBs. O SS é eliminado. Você e o M estão no heads-up. Ótimo.</li>
                        <li><strong>Se você perde:</strong> Seu stack cai para 90 BBs. O stack do SS "ressuscita" para 20 BBs. A dinâmica da mesa muda catastroficamente. O M (30bb) já não está sob a mesma pressão de ICM do SS. O SS, agora com um stack jogável, torna-se um rival. Sua capacidade de pressionar a mesa (sua *edge*) foi severamente amortizada.</li>
                    </ul>
                    <p>O ganho de 2.6 BB não precifica a perda de controle, a perda de pressão e a ressurreição de um oponente que estava taticamente neutralizado. Este é o "Risco da Ressurreição".</p>

                    <h3 className="article-title">O Risco da Ressurreição: A Responsabilidade Estratégica do Chip Leader</h3>
                    <p>Isso nos leva a uma implicação estratégica crucial para o jogador com o stack grande. Se você é o chip leader e enfrenta um all-in de 10bbs de um jogador mais fraco, a sua decisão não é apenas um cálculo de pot odds e equidade. É um cálculo de ecossistema.</p>
                    <p>Mesmo que o call seja marginalmente lucrativo em ChipEV, ele pode ser um desastre estratégico. Ao pagar e perder, você não apenas transfere fichas; você "ressuscita" um oponente. Você o tira do corredor binário do push/fold e o devolve à floresta complexa, agora com 20bbs. Você devolve a ele as ferramentas para errar, sim, mas também as ferramentas para te machucar. Você cria um rival que não existia.</p>
                    <p>A Perspectiva Matemática dita que manter o jogador fraco confinado à simplicidade dos 10bbs tem um valor futuro (Future Game Simulation - FGS) que muitas vezes supera o pequeno ganho imediato de um call marginal. O erro do chip leader não é o call matemático; é o call que devolve a complexidade ao oponente que estava neutralizado por ela.</p>

                    <ResurrectionRiskSimulator />

                    <h3 className="article-title">A Falha de Calibração: A Responsabilidade Mútua do "Bad Call"</h3>
                    <p>E se, no cenário oposto, você vai all-in e é pago por uma mão que, segundo a teoria, deveria ser um fold claro? A tendência é culpar o "vilão maluco", o "pagador". Mas isso é uma visão incompleta. Em um sistema fechado como uma mesa de poker, o erro raramente é unilateral.</p>
                    <p>Se o seu range de all-in foi construído sob a premissa de que seu oponente foldaria corretamente, e ele não o faz, o erro também é seu. Foi uma **falha de calibração**. Você não modelou corretamente a "frequência de incerteza" ou a "taxa de maluquice" daquele jogador específico. Você jogou GTO contra um oponente que não estava na mesma página do livro.</p>
                    <p>Essa colisão, esse erro mútuo, quase sempre beneficia o resto da mesa. Os outros jogadores, que não investiram nada, assistem dois oponentes se arriscarem em uma situação que não deveria acontecer, diluindo a equidade um do outro e aumentando a chance de um payjump passivo para todos. O erro não foi só do pagador; foi do agressor que não antecipou o erro do pagador.</p>

                    <h3>Síntese Final</h3>
                    <p>A verdadeira maestria não está em ter uma edge, mas em entender a topografia onde essa edge pode ser aplicada. Contra stacks profundos, a guerra é de navegação complexa. Contra stacks curtos, a guerra é de colisão matemática e gestão de risco sistêmico.</p>
                    <p>Achar que sua superioridade técnica te dá licença para tomar liberdades contra um short stack é ignorar que a simplicidade do jogo dele é uma armadura. A sua tarefa não é provar que você é melhor; é evitar as colisões de variância pura onde a sua habilidade é amortizada e o resultado se aproxima de um cara ou coroa. Porque nesse jogo, mesmo que a moeda seja levemente viciada a seu favor, a queda ainda pode te quebrar.</p>

                </article>
            </section>

            <nav className="article-nav" style={{ marginTop: '4rem' }}>
                <Link href="/biblioteca">&larr; Biblioteca</Link>
                <Link href="/">&larr; Hub Central</Link>
            </nav>
        </main>
    );
}