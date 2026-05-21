import Link from 'next/link';

export const metadata = {
    title: 'Entendendo o ICM | Raphael Vitoi',
    description: 'Whitepaper: Entendendo o ICM e suas Heurísticas - Raphael Vitoi'
};

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

            <article>
                <h2>Módulo 1: O Problema e o Mapa</h2>
                
                <h3>1.1 Por que ICM importa desde a mão 1</h3>
                <p>A tese central desta aula é direta: o edge em ICM (Independent Chip Model) migrou do pré-flop para o pós-flop. O jogo pré-flop, com suas decisões de push/fold, já foi extensivamente mapeado por solvers. O gap de skill real, a fronteira onde o dinheiro é ganho ou perdido em 2026, está nas decisões tomadas após o flop sob a pressão do ICM.</p>
                <p>Ignorar essa realidade tem um custo quantificável. Jogar uma estratégia de ChipEV (cEV) pura em spots de mesa final onde o ICM é o fator dominante custa, em média, <strong>mais de 10% do seu buy-in em EV ($EV)</strong>.</p>

                <div className="callout">
                    <p><strong>Definição:</strong> Risk Premium é a equity adicional, acima do pot odds, que um jogador precisa ter para justificar um call de all-in sob a pressão do ICM. Ele mede o &quot;custo do risco&quot; que o modelo de torneio impõe a uma jogada.</p>
                </div>

                <h3>1.4 Valuations de Stack</h3>
                <p>Um erro fundamental é associar linearmente a porcentagem de fichas à porcentagem do prize pool. O Chip Leader com 40% das fichas em uma mesa final de 6 jogadores não tem direito a 40% do prize pool.</p>
                <p>Isso nos leva ao princípio mais famoso do ICM: <strong>Fichas ganhas valem menos do que fichas perdidas.</strong></p>

                <hr style={{ border: 0, borderTop: '1px solid var(--border-color)', margin: '3rem 0' }} />

                <h2>Módulo 2: Toy-Games como Laboratório</h2>
                <p>Para entender o ICM em sua forma mais pura, usamos <strong>Toy-Games</strong>: cenários de laboratório ultra-simplificados.</p>
                
                <h4>O &quot;Teto do RP&quot;</h4>
                <p>Existe um limite. Você não pode &quot;overbluffar&quot; infinitamente o Chip Leader ou um stack médio. Chega um ponto matemático onde ele é obrigado a pagar com uma frequência mínima para não ser explorado, independente do ICM. Não tente passar por cima do Teto do RP.</p>

                <div style={{ textAlign: 'center', margin: '3rem 0' }}>
                    <Link href="/tools/icm" className="card-cta" style={{ border: '1px solid var(--accent-primary)', padding: '1rem 2rem', borderRadius: '8px', fontSize: '1rem' }}>
                        🎮 Abrir Simulador Interativo
                    </Link>
                </div>

                <hr style={{ border: 0, borderTop: '1px solid var(--border-color)', margin: '3rem 0' }} />

                <h2>Módulo 3: ICM Pós-Flop — A Fronteira</h2>
                
                <h3>3.2 Downward Drift: A Gravidade do ICM</h3>
                <p>O conceito mais importante para ajustar sua estratégia pós-flop é o <strong>Downward Drift</strong>.</p>
                <blockquote style={{ borderLeft: '3px solid var(--accent-primary)', paddingLeft: '1.5rem', fontStyle: 'italic', color: 'var(--text-main)' }}>
                    Downward Drift é a heurística de que, sob pressão ICM, as ações &quot;descem um degrau&quot; na escala de agressividade. Apostas grandes viram apostas pequenas; apostas pequenas viram checks; e checks viram folds.
                </blockquote>
                
                <h3>3.5 O Check-Back com Mãos Premium</h3>
                <p>Em situações de alto RP (ex: Bolha ou FT com shorts), o Solver frequentemente dá <strong>Check-Back no Flop com AA e KK</strong>. Simplesmente sobreviver tem EV positivo. Apostar reabre a ação para um check-raise, criando um cenário de catástrofe potencial.</p>

                <hr style={{ border: 0, borderTop: '1px solid var(--border-color)', margin: '3rem 0' }} />

                <h2>Módulo 5: Aplicação Prática</h2>

                <div className="callout" style={{ borderLeftColor: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.1)' }}>
                    <h4 style={{ color: 'var(--accent-emerald)', marginTop: 0 }}>Checklist de Decisão (Tempo Real)</h4>
                    <ol style={{ marginTop: '1rem', marginLeft: '1.5rem', listStyleType: 'decimal', color: '#fff' }}>
                        <li><strong>Quem Cobre Quem?</strong> (Define a Vantagem de Risco)</li>
                        <li><strong>Short Stacks Presentes?</strong> (Eleva o RP geral)</li>
                        <li><strong>Estrutura de Pagamentos?</strong> (Flat vs Top-Heavy)</li>
                        <li><strong>Downward Drift?</strong> (Ajustou o sizing para baixo?)</li>
                    </ol>
                </div>

            </article>
        </main>
    );
}