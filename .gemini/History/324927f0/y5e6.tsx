import Link from 'next/link';

export default function LeituraIcm() {
  return (
    <>
      
    <header className="main-header">
        <div className="container">
            <h1><a href="index.html">Raphael Vitoi</a> <span style={{/* MIGRAR ESTILOS: font-weight: normal; opacity: 0.7; font-size: 0.9em; */}}>/ Whitepaper</span></h1>
            <nav>
                <ul>
                    <li><a href="aula-icm.html">â† Voltar Ã  Aula</a></li>
                </ul>
            </nav>
        </div>
    </header>
export const metadata = {
    title: 'Entendendo o ICM | Raphael Vitoi',
    description: 'Whitepaper: Entendendo o ICM e suas Heurísticas - Raphael Vitoi'
};

    <main className="container whitepaper-container">
        <div className="whitepaper-header">
            <span className="meta-info">Documento TÃ©cnico â€¢ VersÃ£o 1.0</span>
            <h1>Entendendo o ICM e suas HeurÃ­sticas</h1>
            <p>DecisÃµes PÃ³s-Flop em Final Tables e a Nova Fronteira do Edge.</p>
        </div>

        <article>
            <h2>MÃ³dulo 1: O Problema e o Mapa</h2>
            
            <h3>1.1 Por que ICM importa desde a mÃ£o 1</h3>
            <p>A tese central desta aula Ã© direta: o edge em ICM (Independent Chip Model) migrou do prÃ©-flop para o pÃ³s-flop. O jogo prÃ©-flop, com suas decisÃµes de push/fold, jÃ¡ foi extensivamente mapeado por solvers. O gap de skill real, a fronteira onde o dinheiro Ã© ganho ou perdido em 2026, estÃ¡ nas decisÃµes tomadas apÃ³s o flop sob a pressÃ£o do ICM.</p>
            <p>Ignorar essa realidade tem um custo quantificÃ¡vel. Jogar uma estratÃ©gia de ChipEV (cEV) pura em spots de mesa final onde o ICM Ã© o fator dominante custa, em mÃ©dia, <strong>mais de 10% do seu buy-in em EV ($EV)</strong>.</p>

            <div className="callout">
                <p><strong>DefiniÃ§Ã£o:</strong> Risk Premium Ã© a equity adicional, acima do pot odds, que um jogador precisa ter para justificar um call de all-in sob a pressÃ£o do ICM. Ele mede o "custo do risco" que o modelo de torneio impÃµe a uma jogada.</p>
export default function LeituraICM() {
    return (
        <main className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Documento Técnico • Versão 1.0
                </span>
                <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1rem', marginTop: '1rem' }}>
                    Entendendo o ICM e suas Heurísticas
                </h1>
                <p>Decisões Pós-Flop em Final Tables e a Nova Fronteira do Edge.</p>
            </div>

            <h3>1.4 Valuations de Stack</h3>
            <p>Um erro fundamental Ã© associar linearmente a porcentagem de fichas Ã  porcentagem do prize pool. O Chip Leader com 40% das fichas em uma mesa final de 6 jogadores nÃ£o tem direito a 40% do prize pool.</p>
            <p>Isso nos leva ao princÃ­pio mais famoso do ICM: <strong>Fichas ganhas valem menos do que fichas perdidas.</strong></p>
            <article>
                <h2>Módulo 1: O Problema e o Mapa</h2>
                
                <h3>1.1 Por que ICM importa desde a mão 1</h3>
                <p>A tese central desta aula é direta: o edge em ICM (Independent Chip Model) migrou do pré-flop para o pós-flop. O jogo pré-flop, com suas decisões de push/fold, já foi extensivamente mapeado por solvers. O gap de skill real, a fronteira onde o dinheiro é ganho ou perdido em 2026, está nas decisões tomadas após o flop sob a pressão do ICM.</p>
                <p>Ignorar essa realidade tem um custo quantificável. Jogar uma estratégia de ChipEV (cEV) pura em spots de mesa final onde o ICM é o fator dominante custa, em média, <strong>mais de 10% do seu buy-in em EV ($EV)</strong>.</p>

            <hr style={{/* MIGRAR ESTILOS: border: 0; border-top: 1px solid var(--border-color); margin: 3rem 0; */}} />
                <div className="callout">
                    <p><strong>Definição:</strong> Risk Premium é a equity adicional, acima do pot odds, que um jogador precisa ter para justificar um call de all-in sob a pressão do ICM. Ele mede o &quot;custo do risco&quot; que o modelo de torneio impõe a uma jogada.</p>
                </div>

            <h2>MÃ³dulo 2: Toy-Games como LaboratÃ³rio</h2>
            <p>Para entender o ICM em sua forma mais pura, usamos <strong>Toy-Games</strong>: cenÃ¡rios de laboratÃ³rio ultra-simplificados.</p>
            
            <h4>O "Teto do RP"</h4>
            <p>Existe um limite. VocÃª nÃ£o pode "overbluffar" infinitamente o Chip Leader ou um stack mÃ©dio. Chega um ponto matemÃ¡tico onde ele Ã© obrigado a pagar com uma frequÃªncia mÃ­nima para nÃ£o ser explorado, independente do ICM. NÃ£o tente passar por cima do Teto do RP.</p>
                <h3>1.4 Valuations de Stack</h3>
                <p>Um erro fundamental é associar linearmente a porcentagem de fichas à porcentagem do prize pool. O Chip Leader com 40% das fichas em uma mesa final de 6 jogadores não tem direito a 40% do prize pool.</p>
                <p>Isso nos leva ao princípio mais famoso do ICM: <strong>Fichas ganhas valem menos do que fichas perdidas.</strong></p>

            <div style={{/* MIGRAR ESTILOS: text-align: center; margin: 3rem 0; */}}>
                <a href="components/interactive/icm_toy_game_simulator.html" target="_blank" className="card-cta" style={{/* MIGRAR ESTILOS: border: 1px solid var(--accent-primary); padding: 1rem 2rem; border-radius: 8px; font-size: 1rem; */}}>ðŸŽ® Abrir Simulador Interativo</a>
            </div>
                <hr style={{ border: 0, borderTop: '1px solid var(--border-color)', margin: '3rem 0' }} />

            <hr style={{/* MIGRAR ESTILOS: border: 0; border-top: 1px solid var(--border-color); margin: 3rem 0; */}} />
                <h2>Módulo 2: Toy-Games como Laboratório</h2>
                <p>Para entender o ICM em sua forma mais pura, usamos <strong>Toy-Games</strong>: cenários de laboratório ultra-simplificados.</p>
                
                <h4>O &quot;Teto do RP&quot;</h4>
                <p>Existe um limite. Você não pode &quot;overbluffar&quot; infinitamente o Chip Leader ou um stack médio. Chega um ponto matemático onde ele é obrigado a pagar com uma frequência mínima para não ser explorado, independente do ICM. Não tente passar por cima do Teto do RP.</p>

            <h2>MÃ³dulo 3: ICM PÃ³s-Flop â€” A Fronteira</h2>
            
            <h3>3.2 Downward Drift: A Gravidade do ICM</h3>
            <p>O conceito mais importante para ajustar sua estratÃ©gia pÃ³s-flop Ã© o <strong>Downward Drift</strong>.</p>
            <blockquote>
                Downward Drift Ã© a heurÃ­stica de que, sob pressÃ£o ICM, as aÃ§Ãµes "descem um degrau" na escala de agressividade. Apostas grandes viram apostas pequenas; apostas pequenas viram checks; e checks viram folds.
            </blockquote>
            
            <h3>3.5 O Check-Back com MÃ£os Premium</h3>
            <p>Em situaÃ§Ãµes de alto RP (ex: Bolha ou FT com shorts), o Solver frequentemente dÃ¡ <strong>Check-Back no Flop com AA e KK</strong>. Simplesmente sobreviver tem EV positivo. Apostar reabre a aÃ§Ã£o para um check-raise, criando um cenÃ¡rio de catÃ¡strofe potencial.</p>
                <div style={{ textAlign: 'center', margin: '3rem 0' }}>
                    <Link href="/tools/icm" className="card-cta" style={{ border: '1px solid var(--accent-primary)', padding: '1rem 2rem', borderRadius: '8px', fontSize: '1rem' }}>
                        🎮 Abrir Simulador Interativo
                    </Link>
                </div>

            <hr style={{/* MIGRAR ESTILOS: border: 0; border-top: 1px solid var(--border-color); margin: 3rem 0; */}} />
                <hr style={{ border: 0, borderTop: '1px solid var(--border-color)', margin: '3rem 0' }} />

            <h2>MÃ³dulo 5: AplicaÃ§Ã£o PrÃ¡tica</h2>
            
            <h3>Os 10 Erros Mais Comuns</h3>
            <table>
                <thead>
                    <tr>
                        <th>Erro</th>
                        <th>Por que Ã© um Erro</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Estudar PÃ³s-Flop Apenas em ChipEV</strong></td>
                        <td>Ignora a pressÃ£o ICM que transforma fundamentalmente os ranges.</td>
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
                        <td>NÃ£o entender que um all-in alheio muda o valor das SUAS fichas.</td>
                    </tr>
                </tbody>
            </table>
                <h2>Módulo 3: ICM Pós-Flop — A Fronteira</h2>
                
                <h3>3.2 Downward Drift: A Gravidade do ICM</h3>
                <p>O conceito mais importante para ajustar sua estratégia pós-flop é o <strong>Downward Drift</strong>.</p>
                <blockquote style={{ borderLeft: '3px solid var(--accent-primary)', paddingLeft: '1.5rem', fontStyle: 'italic', color: 'var(--text-main)' }}>
                    Downward Drift é a heurística de que, sob pressão ICM, as ações &quot;descem um degrau&quot; na escala de agressividade. Apostas grandes viram apostas pequenas; apostas pequenas viram checks; e checks viram folds.
                </blockquote>
                
                <h3>3.5 O Check-Back com Mãos Premium</h3>
                <p>Em situações de alto RP (ex: Bolha ou FT com shorts), o Solver frequentemente dá <strong>Check-Back no Flop com AA e KK</strong>. Simplesmente sobreviver tem EV positivo. Apostar reabre a ação para um check-raise, criando um cenário de catástrofe potencial.</p>

            <div className="callout" style={{/* MIGRAR ESTILOS: border-left-color: var(--accent-emerald); background: rgba(16, 185, 129, 0.1); */}}>
                <h4>Checklist de DecisÃ£o (Tempo Real)</h4>
                <ol style={{/* MIGRAR ESTILOS: margin-top: 1rem; margin-left: 1.5rem; list-style-type: decimal; color: #fff; */}}>
                    <li><strong>Quem Cobre Quem?</strong> (Define a Vantagem de Risco)</li>
                    <li><strong>Short Stacks Presentes?</strong> (Eleva o RP geral)</li>
                    <li><strong>Estrutura de Pagamentos?</strong> (Flat vs Top-Heavy)</li>
                    <li><strong>Downward Drift?</strong> (Ajustou o sizing para baixo?)</li>
                </ol>
            </div>
                <hr style={{ border: 0, borderTop: '1px solid var(--border-color)', margin: '3rem 0' }} />

        </article>
                <h2>Módulo 5: Aplicação Prática</h2>

        <div style={{/* MIGRAR ESTILOS: margin-top: 4rem; text-align: center; */}}>
            <a href="aula-icm.html" style={{/* MIGRAR ESTILOS: color: var(--text-muted); text-decoration: underline; */}}>â† Voltar para a Aula</a>
        </div>
    </main>
    
    <script type="module" src="main.js"></script>
                <div className="callout" style={{ borderLeftColor: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.1)' }}>
                    <h4 style={{ color: 'var(--accent-emerald)', marginTop: 0 }}>Checklist de Decisão (Tempo Real)</h4>
                    <ol style={{ marginTop: '1rem', marginLeft: '1.5rem', listStyleType: 'decimal', color: '#fff' }}>
                        <li><strong>Quem Cobre Quem?</strong> (Define a Vantagem de Risco)</li>
                        <li><strong>Short Stacks Presentes?</strong> (Eleva o RP geral)</li>
                        <li><strong>Estrutura de Pagamentos?</strong> (Flat vs Top-Heavy)</li>
                        <li><strong>Downward Drift?</strong> (Ajustou o sizing para baixo?)</li>
                    </ol>
                </div>

    </>
  );
            </article>
        </main>
    );
}
