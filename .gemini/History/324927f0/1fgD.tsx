/**
 * IDENTITY: Whitepaper Completo - Entendendo o ICM e suas Heurísticas
 * PATH: src/app/leitura-icm/page.tsx
 * ROLE: Documento técnico completo sobre ICM, Toy Games, Risk Premium e estratégia pós-flop.
 * BINDING: [layout.tsx, globals.css]
 */

import Link from 'next/link';

export const metadata = {
    title: 'Entendendo o ICM | Raphael Vitoi',
    description: 'Whitepaper: Entendendo o ICM e suas Heurísticas - Toy Games, Risk Premium, Pós-Flop e a Nova Fronteira do Edge.'
};

export default function LeituraICM() {
    return (
        <main className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 1.5rem' }}>
            <header className="page-header" style={{ paddingBottom: '1rem' }}>
                <p className="page-label">Documento Técnico &bull; Versão 1.0</p>
                <h1 style={{ background: 'linear-gradient(135deg, #fff 0%, #6366f1 50%, #38bdf8 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, lineHeight: 1.2, marginTop: 0 }}>Entendendo o ICM e suas Heurísticas</h1>
                <p className="page-subtitle">Decisões Pós-Flop em Final Tables e a Nova Fronteira do Edge.</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>Autor: Raphael Vitoi &bull; 2025</p>
            </header>

            {/* Índice de Navegação */}
            <section style={{
                marginBottom: '4rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                padding: '2rem',
                backdropFilter: 'blur(12px)'
            }}>
                {/* Eyebrow */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <span style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(99,102,241,0.2))' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.24em' }}>
                        Índice
                    </span>
                    <span style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(99,102,241,0.2))' }} />
                </div>

                {/* Linha superior */}
                <div style={{ height: '1px', background: 'var(--glass-border)', marginBottom: '0.25rem' }} />

                {/* Linhas editoriais */}
                {([
                    { num: '01', id: 'modulo-1', label: 'Fundamento', title: 'O Problema e o Mapa', desc: 'ChipEV vs ICM, Risk Premium, Antevisão e Valuations de Stack.' },
                    { num: '02', id: 'modulo-2', label: 'Laboratório', title: 'Toy-Games', desc: '5 cenários progressivos de RP 0→24%, do ChipEV puro ao Teto do RP.' },
                    { num: '03', id: 'parte-ii', label: 'Paradoxo', title: 'Invertendo o RP', desc: 'O que acontece quando o IP carrega RP maior que o OOP.' },
                    { num: '04', id: 'modulo-3', label: 'Fronteira', title: 'ICM Pós-Flop', desc: 'Downward Drift, Dissipação de RP por street e dinâmica do Chip Leader.' },
                    { num: '05', id: 'modulo-4', label: 'Aplicação', title: 'Aplicação Prática', desc: '10 erros mais comuns e Checklist de decisão em tempo real.' },
                ] as const).map(({ num, id, label, title, desc }) => (
                    <a key={id} href={`#${id}`} className="toc-row">
                        {/* Número */}
                        <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontVariantNumeric: 'tabular-nums',
                            fontSize: '1.1rem',
                            fontWeight: 900,
                            color: 'var(--accent-primary)',
                            opacity: 0.6,
                            lineHeight: 1,
                        }}>{num}</span>

                        {/* Conteúdo */}
                        <div>
                            <strong style={{
                                fontFamily: 'var(--font-body)',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                color: 'var(--text-main)',
                                display: 'block',
                                marginBottom: '0.2rem',
                            }}>{title}</strong>
                            <span style={{
                                fontFamily: 'var(--font-body)',
                                fontSize: '0.78rem',
                                color: 'var(--text-muted)',
                                lineHeight: 1.45,
                            }}>{desc}</span>
                        </div>

                        {/* Label */}
                        <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.55rem',
                            fontWeight: 700,
                            color: 'var(--accent-primary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.12em',
                            whiteSpace: 'nowrap',
                        }}>{label} <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }} /></span>
                    </a>
                ))}
            </section>

            <article>
                {/* ==================== MÓDULO 1 ==================== */}
                <h2 id="modulo-1" style={{ scrollMarginTop: '5rem' }}>Módulo 1: O Problema e o Mapa</h2>

                <h3>1.1 Por que ICM importa desde a mão 1</h3>
                <p>A tese central desta aula é direta: o edge em ICM (Independent Chip Model) migrou do pré-flop para o pós-flop. O jogo pré-flop, com suas decisões de push/fold, já foi extensivamente mapeado por solvers. O gap de skill real, a fronteira onde o dinheiro é ganho ou perdido em 2026, está nas decisões tomadas após o flop sob a pressão do ICM.</p>
                <p>Ignorar essa realidade tem um custo quantificável. Jogar uma estratégia de ChipEV (cEV) pura em spots de mesa final onde o ICM é o fator dominante custa, em média, <strong>mais de 10% do seu buy-in em EV ($EV)</strong>.</p>

                <div className="callout">
                    <p><strong>Definição:</strong> Risk Premium é a equity adicional, acima do pot odds, que um jogador precisa ter para justificar um call de all-in sob a pressão do ICM. Ele mede o &quot;custo do risco&quot; que o modelo de torneio impõe a uma jogada.</p>
                    <p style={{ marginBottom: 0, borderTop: '1px solid var(--glass-border)', paddingTop: '0.75rem', marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <strong>Nota temporal:</strong> O RP aqui definido é o valor <strong>pré-flop</strong> — com a stack total em risco potencial. Post-flop, conforme fichas entram no pote e a stack restante diminui, o RP residual de cada decisão subsequente decresce proporcionalmente. No river de uma mão bem jogada, o RP pode ter dissipado mais de 70% do valor original.
                    </p>
                </div>

                <h3>1.2 A Antevisão</h3>
                <p>Hoje em dia, o conhecimento teórico sobre poker está muito mais acessível e prático do que há uma década. Está disponível através de uma variedade de recursos: materiais gratuitos, cursos avançados, ferramentas educativas poderosas, Solucionadores de Situações Complexas (SOLVERS) e trackers rigorosos como o Hand2Note, que coletam e disponibilizam dados de jogadores e seus torneios. Essas informações permitem que jogadores e analistas desvendem os jogos da população e os padrões de adversários para desenvolver estratégias precisas de exploração.</p>
                <p>Embora os jogadores estejam se aprimorando teoricamente, ainda existem áreas negligenciadas, especialmente o <strong>ICM Pós-Flop</strong>, onde muitas fraquezas são perceptíveis mesmo entre jogadores regulares. Muitos profissionais ainda utilizam exercícios baseados em ChipEV para treinar e estudar o jogo, embora, fora das situações de heads-up, praticamente todas as fases do poker sejam influenciadas pelo ICM.</p>
                <p>Na visão de Raphael Vitoi, a verdadeira vantagem competitiva não se encontra mais tanto nas decisões pré-flop baseadas em ICM, especialmente em stakes altos, mas sim no jogo pós-flop, onde ainda há muito a ser explorado e maximizado em termos de valor esperado (EV).</p>

                <h3>1.3 Sobre o Risk Premium (RP)</h3>
                <p>O RP é uma métrica central no ICM, ajudando a estimar o impacto das decisões em situações específicas de torneio. Ele justifica decisões baseadas no equilíbrio entre o risco envolvido e o potencial retorno. No poker, cada stack tem um valor monetário implícito, que reflete uma parte do prizepool remanescente.</p>
                <p>O RP é influenciado não apenas pela interação direta entre duas stacks, mas também pela <strong>configuração geral das stacks na mesa</strong>. Cada jogador e cada stack exercem influência mútua, criando um ambiente dinâmico onde as decisões de um jogador repercutem em todo o campo de jogo.</p>

                <div className="callout">
                    <h4 style={{ marginTop: 0 }}>RP de Ida vs. RP de Volta</h4>
                    <p>Existem dois tipos de RPs em um cenário de Single Raised Pot (SRP): o <strong>&quot;RP de ida&quot;</strong> (do jogador que abre a rodada) e o <strong>&quot;RP de volta&quot;</strong> (do jogador que responde). Esses RPs geralmente diferem e a dinâmica entre eles é crucial:</p>
                    <ul style={{ marginLeft: '1.5rem', color: 'var(--text-main)' }}>
                        <li>Se os RPs são similares, isso leva a uma estratégia mais passiva, como um acordo silencioso para evitar situações de risco.</li>
                        <li>Se o &quot;RP de ida&quot; for 25% maior que o &quot;RP de volta&quot;, essa diferença simboliza a pressão adicional que o jogador com menor RP pode aplicar.</li>
                        <li>Se o &quot;RP de volta&quot; for o dobro do &quot;RP de ida&quot;, o jogador com menor RP pode exercer pressão substancial tanto pré quanto pós-flop.</li>
                    </ul>
                    <p style={{ marginBottom: 0 }}>A diferença entre os RPs é conhecida como <strong>Vantagem ou Desvantagem de Risco</strong>. O solver não leva em consideração desvantagens extras como estar fora de posição ou desvantagem de edge, ou seja, pode haver um acúmulo de desvantagens não previsto pelo programa.</p>
                </div>

                <h3>1.4 Valuations de Stack</h3>
                <p>Um erro fundamental é associar linearmente a porcentagem de fichas à porcentagem do prize pool. O Chip Leader com 40% das fichas em uma mesa final de 6 jogadores não tem direito a 40% do prize pool.</p>
                <p>Isso nos leva ao princípio mais famoso do ICM: <strong>Fichas ganhas valem menos do que fichas perdidas.</strong></p>
                <p>Embora haja uma desproporção no valor das fichas que ganhamos em detrimento das que perdemos, acumular fichas continua sendo benéfico. Se interpretarmos essa frase ao pé da letra, um CL disparado numa FT apenas se sentaria em sua pilha de fichas e não jogaria mais nenhuma mão, o que sabemos que não é prático. O CL não só tem interesse em aumentar sua perspectiva de ganhos, mas também tem a responsabilidade de <strong>dificultar que jogadores que possam rivalizar com ele acumulem fichas dos outros jogadores</strong>.</p>

                <hr className="section-divider" />

                {/* ==================== MÓDULO 2 ==================== */}
                <h2 id="modulo-2" style={{ scrollMarginTop: '5rem' }}>Módulo 2: Toy-Games como Laboratório</h2>
                <p>Para entender o ICM em sua forma mais pura, usamos <strong>Toy-Games</strong>: cenários de laboratório ultra-simplificados. São ferramentas educativas projetadas para descomplicar o universo complexo do poker, reduzindo as variáveis do jogo real para facilitar o entendimento de conceitos como Equilíbrio de Nash, MDF e ICM.</p>

                <div className="callout">
                    <h4 style={{ marginTop: 0 }}>Configuração do Toy Game Clássico</h4>
                    <p><strong>Range IP:</strong> AA, QQ, JJ (18 combos)</p>
                    <p><strong>Range OOP:</strong> KK (6 combos)</p>
                    <p><strong>Pote:</strong> 100 fichas | <strong>Aposta:</strong> 100 fichas (all in)</p>
                    <p><strong>Board:</strong> 22223</p>
                    <p style={{ marginBottom: 0 }}>OOP (KK) sempre checka. AA (valor), QQ e JJ (potenciais blefes) devem balancear entre shove e check, enquanto KK (bluffcatcher puro) deve defender uma frequência adequada.</p>
                </div>

                <h3>Toy Game 1 (ChipEV Puro)</h3>
                <p>IP possui 6 combos de value e 3 combos de bluff. KK paga 50% das vezes para neutralizar o EV dos bluffs do IP.</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontSize: '0.85rem', color: 'var(--accent-primary)' }}>a = (100 / 200 = 0,5) <i className="fa-solid fa-arrow-right" style={{ margin: '0 4px' }} /> 1 - a = 50% de defesa</p>

                <h3>Toy Game 2 (RP: IP 3% | OOP 6%)</h3>
                <p>O IP aumentou os bluffs de 3 para 4,2 combinações, enquanto o OOP começou a desistir um pouco mais. Ambos possuem um Risk Premium relativamente baixo, indicando baixo risco, embora ainda presente. O IP possui uma <strong>vantagem de risco significativa</strong> e não enfrenta o risco de eliminação ao fazer um shove.</p>
                <p>Quanto menor a diferença de RP entre os jogadores, mais passivamente eles tendem a jogar, como se houvesse um <strong>acordo silencioso</strong> para evitar situações de risco.</p>

                <h3>Toy Game 3 (RP: IP 3% | OOP 9%)</h3>
                <p>O IP agora blefa mais, aumentando de 4,2 para 5 combinações de blefe. Apesar disso, o OOP <strong>não está desistindo mais</strong> do que no RP anterior. Com o RP tão baixo e a distância significativa entre os RPs, é natural que vejamos mais blefes do IP. Entretanto, o aumento de blefes não é proporcional ao aumento do RP.</p>
                <p>O OOP atingiu o <strong>&quot;Teto do RP&quot;</strong>. Em um range formado inteiramente por bluffcatchers contra um range polarizado que sempre contém o topo, há sempre uma chance palpável de ser eliminado. O solver identificou a &quot;linha de corte&quot;: o OOP está defendendo a mesma quantidade, exatamente onde o RP permite que ele defenda. De maneira contra-intuitiva, ambos estão fazendo o que é melhor para eles individualmente, como se fosse um pacto silencioso. Sim, alcançamos o <strong>Equilíbrio de Nash</strong>.</p>

                <h3>Toy Game 4 (RP: IP 3% | OOP 18%)</h3>
                <p>O IP aumentou ainda mais os blefes! Temos <strong>6 combinações de valor contra 8 de blefe</strong>, o que é claramente desbalanceado do ponto de vista de ChipEV. Normalmente, em um contexto de ChipEV equilibrado, o KK pagaria 100% das vezes. No entanto, neste caso, o KK ainda continua pagando apenas até o &quot;Teto do RP&quot;.</p>

                <h3>Toy Game 5 (RP: IP 3% | OOP 24%)</h3>
                <p>Quanto maior for a discrepância entre os RPs e mais alto o RP do jogador pressionado, mais agressivamente atacamos como IP. E, mantendo a mesma lógica, o KK continua seguindo a mesma regra: pagando no limite superior do RP.</p>

                <div className="callout callout-secondary">
                    <h4 style={{ color: 'var(--accent-secondary)', marginTop: 0 }}>O Teto do RP</h4>
                    <p>Assim como não podemos pagar com 100% dos bluffcatchers quando o líder de fichas faz um shove com quase todo o seu range, isso não implica que devemos sempre evitar dar call com uma frequência razoável de bluffcatchers nesse cenário de alta pressão de RP. <strong>As respostas adequadas da Teoria do Jogo em ambientes de ICM raramente são extremas.</strong></p>
                    <p style={{ marginBottom: 0 }}>Cuidado com suposições que se desviam da teoria estabelecida! Frases como &quot;Está shovando tudo, vou pagar com qualquer bluffcatcher!&quot; podem ser perigosas. Variáveis mecânicas do ICM restringem a possibilidade de fazer ajustes estratégicos que são tanto arriscados quanto extremos.</p>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Toy Game</th>
                            <th>RP do IP</th>
                            <th>RP do OOP</th>
                            <th>Bluffs IP</th>
                            <th>Defesa OOP</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>1 (ChipEV)</strong></td>
                            <td>0%</td>
                            <td>0%</td>
                            <td>3 combos</td>
                            <td>50%</td>
                        </tr>
                        <tr>
                            <td><strong>2</strong></td>
                            <td>3%</td>
                            <td>6%</td>
                            <td>4.2 combos</td>
                            <td style={{ color: 'var(--accent-secondary)' }}>Reduz levemente</td>
                        </tr>
                        <tr>
                            <td><strong>3</strong></td>
                            <td>3%</td>
                            <td>9%</td>
                            <td>5 combos</td>
                            <td>Teto do RP</td>
                        </tr>
                        <tr>
                            <td><strong>4</strong></td>
                            <td>3%</td>
                            <td>18%</td>
                            <td style={{ color: 'var(--accent-secondary)' }}>8 combos (desbalanceado)</td>
                            <td>Teto do RP</td>
                        </tr>
                        <tr>
                            <td><strong>5</strong></td>
                            <td>3%</td>
                            <td>24%</td>
                            <td style={{ color: 'var(--accent-secondary)' }}>Máximo</td>
                            <td>Teto do RP</td>
                        </tr>
                    </tbody>
                </table>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: '0.5rem 0 2rem' }}>
                    Nota: Os RPs acima são pré-flop (all-in imediato). Em Toy Games não há streets pós-flop, logo não há dissipação. Em cenários reais de Mesa Final, cada call ou aposta post-flop reduz o RP residual — veja o tab Dissipação RP no simulador.
                </p>

                <div style={{ textAlign: 'center', margin: '3rem 0' }}>
                    <Link href="/tools/simulador" className="btn-primary">
                        <i className="fa-solid fa-gamepad" style={{ marginRight: '8px' }} /> Abrir Simulador Interativo
                    </Link>
                </div>

                <hr className="section-divider" />

                {/* ==================== PARTE II ==================== */}
                <h2 id="parte-ii" style={{ scrollMarginTop: '5rem' }}>Parte II: Invertendo o RP</h2>
                <p>O que acontece quando o IP possui RP maior que o OOP? Os resultados são surpreendentes.</p>

                <h3>Inversão 1 (RP: IP 9% | OOP 3%)</h3>
                <p>IP agora possui RP maior. Embora o IP não comece a blefar excessivamente, comparativamente ao Toy Game 3, ele ainda blefa ligeiramente acima do ChipEV. Mesmo que o risco para o OOP seja baixo, não deixa de ser um risco. As fichas em torneios de MTT não são &quot;apenas fichas&quot;; elas possuem valor monetário intrínseco superior ao valor nominal.</p>
                <p><strong>O OOP, com menor Risk Premium, PAGA MENOS vs o mesmo range que continua mais inclinado para os bluffs.</strong></p>

                <h3>Inversão 2 (RP: IP 18% | OOP 3%)</h3>
                <p>O IP agora tem 18% de RP, um valor de risco absurdo, e continua shovando o MESMO range levemente inclinado aos bluffs. E o OOP, com baixíssimo RP e risco, <strong>segue a foldar cada vez mais</strong> vs o mesmo range levemente inclinado a bluff.</p>

                <h3>Inversão 3 (RP: IP 21% | OOP 3%)</h3>
                <p>Exatamente o mesmo range de shove do IP, levemente inclinado ao bluff. E o OOP, com baixíssimo RP e risco, <strong>já está alcançando quase 80% de fold!</strong></p>

                <div className="callout callout-emerald">
                    <h4 style={{ color: 'var(--accent-emerald)', marginTop: 0 }}>Por que o OOP folda tanto?</h4>
                    <p>Os 20bb são idênticos, seja contribuindo para o líder de fichas (CL) ou para um jogador com 20bbs. No entanto, a avaliação do valor entre as stacks difere significativamente. Temos pouco incentivo para jogar como &quot;bluffcatcher&quot; contra stacks médias e curtas, já que <strong>perder fichas tem um impacto mais significativo do que ganhá-las</strong>.</p>
                    <p>Para o CL, mesmo que o range polarizado esteja levemente inclinado ao bluff, geralmente não há recompensa suficiente para justificar o uso de um bluffcatcher. Dobrar e aumentar a valuation para o oponente reduz a pressão do ICM sobre TODA A MESA.</p>
                    <p style={{ marginBottom: 0 }}>Um evento de colisão ou de acumulação/perda de fichas numa FT, mesmo envolvendo apenas dois jogadores, <strong>influencia a avaliação da stack e a expectativa matemática de todos os outros jogadores que NÃO PARTICIPARAM do evento</strong>.</p>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Inversão</th>
                            <th>RP do IP</th>
                            <th>RP do OOP</th>
                            <th>Range IP</th>
                            <th>Fold OOP</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>1</strong></td>
                            <td>9%</td>
                            <td>3%</td>
                            <td>Leve inclinação bluff</td>
                            <td>Paga menos que ChipEV</td>
                        </tr>
                        <tr>
                            <td><strong>2</strong></td>
                            <td>18%</td>
                            <td>3%</td>
                            <td>Mesmo range</td>
                            <td style={{ color: 'var(--accent-secondary)' }}>Fold crescente</td>
                        </tr>
                        <tr>
                            <td><strong>3</strong></td>
                            <td>21%</td>
                            <td>3%</td>
                            <td>Mesmo range</td>
                            <td style={{ color: 'var(--accent-secondary)' }}>~80% fold</td>
                        </tr>
                    </tbody>
                </table>

                <hr className="section-divider" />

                {/* ==================== MÓDULO 3 ==================== */}
                <h2 id="modulo-3" style={{ scrollMarginTop: '5rem' }}>Módulo 3: ICM Pós-Flop e a Dinâmica do Chip Leader</h2>

                <h3>3.1 A Mesa Final como Organismo</h3>
                <p>Quando existem jogadores prestes a serem eliminados, o RP médio na mesa aumenta. O jogador capaz de eliminar outros sem prejudicar muito sua própria stack possui uma <strong>vantagem estratégica considerável</strong> e deve intensificar a pressão sobre a mesa.</p>
                <p>A presença de várias stacks à beira da eliminação eleva tanto o ICM quanto o RP médio das stacks intermediárias, dificultando sua movimentação no jogo. O incentivo para jogar pots diminui se houver um chip leader ativo, pois ele pode utilizar a pressão do RP para impor estratégias agressivas.</p>

                <h3>3.2 Downward Drift: A Gravidade do ICM</h3>
                <blockquote>
                    Downward Drift é a heurística de que, sob pressão ICM, as ações &quot;descem um degrau&quot; na escala de agressividade. Apostas grandes viram apostas pequenas; apostas pequenas viram checks; e checks viram folds. (Dara O&apos;Kearney)
                </blockquote>
                <p>
                    O Drift não é constante durante a mão. Sua intensidade é proporcional ao RP no
                    momento da decisão. Pré-flop, com o RP máximo (toda a stack em risco potencial),
                    o Drift é mais severo: ranges de 3-bet colapsam, calls inflam. Mas conforme a
                    mão progride e fichas entram no pote, o RP residual para a próxima decisão
                    diminui — e o Drift enfraquece junto.
                </p>
                <p>
                    A exceção que O&apos;Kearney identifica é reveladora: quando há vantagem clara, o
                    solver não aposta em tamanho médio. Ele ou <strong>aposta mínimo</strong> (risco
                    controlado) ou <strong>vai all-in</strong> (pressão máxima). O meio-termo cria
                    decisões difíceis e caras para ambos os lados.
                </p>

                <div className="callout callout-emerald">
                    <h4 style={{ color: 'var(--accent-emerald)', marginTop: 0 }}>Dissipação do RP por Street</h4>
                    <p>
                        Os Toy Games medem o RP num ponto fixo: a colisão total (all-in). Na prática
                        pós-flop, o RP se disipa a cada street. Ao pagar o flop, parte do risco foi
                        assumida; ao pagar o turn, mais risco foi absorvido.
                    </p>
                    <p>
                        No river, o defensor chegou com RP residual significativamente menor do que
                        o RP de colisão pré-flop. Isso significa que ele <strong>precisa chamar mais</strong>
                        do que no começo da mão — a matemática do MDF se aproxima do ChipEV.
                    </p>
                    <p style={{ marginBottom: 0 }}>
                        Jogar o river como se o RP pré-flop ainda valesse integralmente é o erro
                        de calibração mais frequente em ICM pós-flop. O Drift já dissipou. Reconhecer
                        esse momento é o edge.
                    </p>
                </div>

                <h3>3.3 O Impacto das Configurações de Mesa</h3>
                <p>As configurações da mesa geram diversos RPs e a estrutura de payjumps influencia diretamente esses valores:</p>
                <ul style={{ marginLeft: '1.5rem', color: 'var(--text-main)' }}>
                    <li><strong>Estruturas &quot;top-heavy&quot;</strong> (premiação concentrada no topo): o RP das stacks menores é reduzido, incentivando-os a arriscar mais.</li>
                    <li><strong>Estruturas equilibradas:</strong> o RP das stacks menores aumenta, pois a queda em posições inferiores é menos punitiva.</li>
                    <li>À medida que o número de jogadores diminui, o RP médio também cai.</li>
                </ul>

                <h3>3.4 O Check-Back com Mãos Premium</h3>
                <p>Em situações de alto RP (ex: Bolha ou FT com shorts), o Solver frequentemente dá <strong>Check-Back no Flop com AA e KK</strong>. Simplesmente sobreviver tem EV positivo. Apostar reabre a ação para um check-raise, criando um cenário de catástrofe potencial.</p>

                <h3>3.5 Ranges Condensados sob Pressão</h3>
                <p>Jogar um range condensado versus um range linear pós-flop geralmente não é tão lucrativo. Ranges condensados são projetados para reter equity, não necessariamente para gerar EV. Quando enfrentamos uma desvantagem de risco e temos poucas fichas, o cenário se torna ainda mais complicado:</p>
                <ul style={{ marginLeft: '1.5rem', color: 'var(--text-main)' }}>
                    <li>Não temos incentivos para aumentar o pote com raises</li>
                    <li>Não veremos muitos shoves, pois um range condensado não é equipado para isso</li>
                    <li>Ao optar por call, a tendência é continuar enfrentando pressão no turn e river</li>
                    <li>À medida que a stack diminui, o RP aumenta gradualmente até o &quot;Teto do RP&quot; intransponível</li>
                </ul>

                <hr className="section-divider" />

                {/* ==================== MÓDULO 4 ==================== */}
                <h2 id="modulo-4" style={{ scrollMarginTop: '5rem' }}>Módulo 4: Aplicação Prática</h2>

                <h3>Os 10 Erros Mais Comuns</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Erro</th>
                            <th>Por que é um Erro</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Estudar Pós-Flop Apenas em ChipEV</strong></td>
                            <td>Ignora a pressão ICM que transforma fundamentalmente os ranges.</td>
                        </tr>
                        <tr>
                            <td><strong>Usar Sizing de Cash Game</strong></td>
                            <td>Sizings grandes constroem potes que geram um risco desproporcional.</td>
                        </tr>
                        <tr>
                            <td><strong>Overbluffar o Chip Leader</strong></td>
                            <td>Ignora o Teto do RP; o CL para de foldar em certo ponto.</td>
                        </tr>
                        <tr>
                            <td><strong>Ignorar a Mesa</strong></td>
                            <td>Não entender que um all-in alheio muda o valor das SUAS fichas.</td>
                        </tr>
                        <tr>
                            <td><strong>Interpretar &quot;fichas perdidas valem mais&quot; literalmente</strong></td>
                            <td>Acumular fichas continua sendo benéfico; o CL deve pressionar rivais.</td>
                        </tr>
                        <tr>
                            <td><strong>Focar no resultado do solver, não na linguagem</strong></td>
                            <td>O valor está na interpretação e reconhecimento da linguagem teórica.</td>
                        </tr>
                        <tr>
                            <td><strong>Usar bluffcatcher contra range polarizado sob RP alto</strong></td>
                            <td>Variáveis mecânicas do ICM restringem ajustes arriscados e extremos.</td>
                        </tr>
                        <tr>
                            <td><strong>Ignorar o RP de ida vs. RP de volta</strong></td>
                            <td>A assimetria de risco entre agressor e defensor é crucial.</td>
                        </tr>
                    </tbody>
                </table>

                <div className="callout callout-emerald">
                    <h4 style={{ color: 'var(--accent-emerald)', marginTop: 0 }}>Checklist de Decisão (Tempo Real)</h4>
                    <ol style={{ marginTop: '1rem', marginLeft: '1.5rem', listStyleType: 'decimal', color: 'var(--text-main)' }}>
                        <li><strong>Quem Cobre Quem?</strong> (Define a Vantagem de Risco)</li>
                        <li><strong>Short Stacks Presentes?</strong> (Eleva o RP geral)</li>
                        <li><strong>Estrutura de Pagamentos?</strong> (Flat vs Top-Heavy)</li>
                        <li><strong>Downward Drift?</strong> (Ajustou o sizing para baixo?)</li>
                        <li><strong>RP de Ida vs. RP de Volta?</strong> (Quem tem vantagem de risco?)</li>
                        <li><strong>Range Condensado vs. Polarizado?</strong> (Ajustou a agressividade?)</li>
                    </ol>
                </div>

                <div className="verdict-box">
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>Princípio Final</p>
                    <p style={{ fontSize: '1.1rem', fontStyle: 'italic', marginBottom: 0 }}>&quot;Qual é a sua perspectiva nesta mesa final? Qual é a sua esperança matemática? Colocar-se nesta situação de alto risco realmente vale a pena?&quot;</p>
                </div>
            </article>

            <nav className="article-nav">
                <Link href="/aula-icm"><i className="fa-solid fa-arrow-left" style={{ marginRight: '4px' }} /> Voltar para a Aula</Link>
                <Link href="/conceitos-icm">Glossário Formal <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }} /></Link>
            </nav>
        </main>
    );
}
