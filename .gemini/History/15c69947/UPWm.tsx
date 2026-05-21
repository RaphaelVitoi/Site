/**
 * IDENTITY: Landing Page Principal (Nexus Central)
 * PATH: src/app/page.tsx
 * ROLE: Página de alta conversão. Sales copy + Hub de Conteúdo + Autor + CTA.
 * BINDING: [layout.tsx, globals.css]
 */

import Link from 'next/link';
export const metadata = {
  title: 'Poker Racional | Raphael Vitoi',
  description: 'ICM Pos-Flop, Risk Premium e a Nova Fronteira do Edge no Poker. Masterclass, Simuladores e Teoria dos Jogos.',
};

export default function HomePage() {
  return (
    <main className="container" style={{ paddingTop: '4rem' }}>

      {/* Hero Section */}
      <section id="hero" className="animate-fade-up" style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
        <p className="page-label" style={{ color: 'var(--accent-primary)', marginBottom: '1.5rem' }}>
          ICM e Risk Premium Pós-Flop
        </p>
        <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.2 }}>
          O Edge Mudou de Lugar
          <span style={{ display: 'block', fontWeight: 300, color: 'var(--text-main)', marginTop: '0.5rem' }}>
            Você Ainda Está Jogando o Jogo de 2020?
          </span>
        </h2>
        <p className="page-subtitle" style={{ fontSize: '1.25rem', margin: '0 auto 2.5rem' }}>
          Descubra por que jogar ChipEV em mesas finais está custando, em média,{' '}
          <strong>mais de 10% do seu ROI</strong> e como a elite do poker usa o
          &quot;Downward Drift&quot; para dominar o pós-flop em 2026
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
          <Link href="#metodo" className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '0.95rem' }}>
            Conhecer o Método <i className="fa-solid fa-arrow-right" style={{ marginLeft: '6px' }} />
          </Link>
          <Link href="/leitura-icm" className="btn-secondary" style={{ padding: '1rem 2.5rem', fontSize: '0.95rem' }}>
            Ler o Whitepaper
          </Link>
        </div>
      </section>

      <hr style={{ border: 0, borderTop: 'var(--glass-border)', margin: '0 auto', maxWidth: '200px' }} />

      {/* O Método (Sales Copy) */}
      <section id="metodo">
        <article className="sales-article" style={{ background: 'transparent', border: 'none', backdropFilter: 'none', boxShadow: 'none' }}>
          <h3>A &quot;Mentira&quot; do ICM</h3>
          <p>Se você é como a maioria dos regulares de MTT, você aprendeu que o ICM é um interruptor que &quot;liga&quot; na bolha ou na mesa final.</p>
          <p>Você estudou tabelas de Push/Fold. Você domina o HRC e o ICMIZER. Você acha que seu jogo de ICM está em dia.</p>
          <p><strong>Tenho uma má notícia:</strong> O poker evoluiu, e o seu edge no pré-flop está desaparecendo. Hoje, solvers resolveram o pré-flop. O gap de habilidade entre você e o reg médio nessa área é mínimo.</p>
          <p>Mas existe uma <strong>Nova Fronteira</strong>. Um lugar onde o dinheiro real está sendo ganho e perdido silenciosamente, longe dos olhos dos solvers básicos.</p>
          <p style={{ fontSize: '1.4rem', color: 'var(--text-main)', textAlign: 'center', margin: '2rem 0' }}><strong>O ICM Pós-Flop.</strong></p>

          <div className="callout callout-secondary">
            <h4 style={{ color: 'var(--accent-secondary)', marginTop: 0 }}>O Custo Invisível</h4>
            <p>Dados recentes do GTO Wizard (2025/2026) revelam uma verdade brutal:</p>
            <blockquote style={{ border: 'none', padding: 0, margin: '1rem 0', fontSize: '1.1rem', color: 'var(--text-main)' }}>
              Jogar uma estratégia padrão de ChipEV (focada em acumular fichas) em spots de mesa final custa, em média, <strong>10% a 12% de todo o buy-in do torneio em $EV</strong>.
            </blockquote>
            <p>Em potes 3-bet? O erro custa mais de <strong>30% do valor da jogada</strong>.</p>
            <p style={{ marginBottom: 0 }}>Pense nisso. Você grindou 8 horas. Chegou na FT. E em duas decisões de c-bet mal calibradas, você devolveu todo o lucro esperado do torneio. Não porque jogou &quot;mal&quot;, mas porque jogou com a matemática errada.</p>
          </div>

          <h3>Apresentando: O Mapa do ICM Pós-Flop</h3>
          <p>Nesta aula inédita, não vamos falar de tabelas de push/fold. Vamos mergulhar na física do jogo pós-flop sob pressão. Você vai aprender a <strong>Antevisão</strong>: a habilidade de olhar para uma mesa e ver o &quot;campo de força&quot; do Risk Premium antes mesmo de receber suas cartas.</p>

          <h4 style={{ color: 'var(--text-main)', fontSize: '1.2rem' }}>O Que Você Vai Dominar:</h4>
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            <li><i className="fa-solid fa-check" style={{ color: 'var(--accent-emerald)', marginRight: '8px' }} /> <strong>O &quot;Downward Drift&quot;:</strong> A heurística simples que ajusta automaticamente seus sizings e frequências para a realidade do ICM (e por que seus sizings de cash game estão queimando dinheiro).</li>
            <li><i className="fa-solid fa-check" style={{ color: 'var(--accent-emerald)', marginRight: '8px' }} /> <strong>Toy-Games de Laboratório:</strong> Vamos dissecar 8 cenários puros para provar matematicamente conceitos contraintuitivos.</li>
            <li><i className="fa-solid fa-check" style={{ color: 'var(--accent-emerald)', marginRight: '8px' }} /> <strong>O Teto do Risk Premium:</strong> Por que overbluffar o Chip Leader é suicídio, e onde está o limite matemático da agressão.</li>
            <li><i className="fa-solid fa-check" style={{ color: 'var(--accent-emerald)', marginRight: '8px' }} /> <strong>A Mesa como Organismo:</strong> Como um all-in entre dois oponentes muda instantaneamente o valor das SUAS fichas e como explorar isso.</li>
          </ul>

          <h3>Para Quem É Isso?</h3>
          <p>Este material não é para iniciantes. É para jogadores profissionais e semiprofissionais (AVG $109-$530) que:</p>
          <ol style={{ marginLeft: '1.5rem', color: 'var(--text-main)' }}>
            <li style={{ marginBottom: '0.5rem' }}>Já entendem o básico de ICM pré-flop.</li>
            <li style={{ marginBottom: '0.5rem' }}>Estão cansados de &quot;sentir&quot; que estão cometendo erros em FTs, mas não sabem onde.</li>
            <li style={{ marginBottom: '0.5rem' }}>Querem uma vantagem técnica real que o field ainda não estuda.</li>
          </ol>

          <h3>O Que Está Incluso</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', margin: '2rem 0' }}>

            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: 'var(--glass-border)', backdropFilter: 'blur(12px)' }}>
              <strong style={{ color: 'var(--text-main)', fontSize: '1rem' }}>Módulo 1: O Problema e o Mapa</strong>
              <ul style={{ marginTop: '0.75rem', marginBottom: 0, paddingLeft: '1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <li>Por que ICM importa desde a mão 1 (não só na bubble)</li>
                <li>O que é Risk Premium: definição precisa, cálculo, intuição</li>
                <li>RP vs Bubble Factor: relação entre as duas métricas</li>
                <li>Visualização concreta: calculadora ICM com valuations de stacks em FT típica</li>
              </ul>
            </div>

            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: 'var(--glass-border)', backdropFilter: 'blur(12px)' }}>
              <strong style={{ color: 'var(--text-main)', fontSize: '1rem' }}>Módulo 2: Toy-Games como Laboratório</strong>
              <ul style={{ marginTop: '0.75rem', marginBottom: 0, paddingLeft: '1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <li>Justificativa metodológica: por que toy-games isolam variáveis com precisão</li>
                <li>Parte I: 5 toy-games com RP progressivo no OOP (RP 0 → 24), defesa de bluffcatchers a cada incremento</li>
                <li>Parte II: 3 toy-games com RP invertido no IP — o Paradoxo da Pressão Invertida</li>
                <li>Conceitos emergentes: Teto do RP, Vantagem/Desvantagem de Risco, Pacto Silencioso, Nash sob ICM</li>
              </ul>
            </div>

            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: 'var(--glass-border)', backdropFilter: 'blur(12px)' }}>
              <strong style={{ color: 'var(--text-main)', fontSize: '1rem' }}>Módulo 3: ICM Pós-Flop — A Fronteira</strong>
              <ul style={{ marginTop: '0.75rem', marginBottom: 0, paddingLeft: '1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <li>Por que o edge real está no pós-flop (não mais no pré-flop)</li>
                <li>Downward Drift: como ICM transforma sizings e ações ao longo das streets</li>
                <li>SPR e distribuição do RP por street — custo por street calculado</li>
                <li>Covering advantage e seu efeito compounding</li>
                <li>Premium hands check-back: quando checar AA inteiro é correto</li>
                <li>Custo quantificado de jogar ChipEV em spots ICM (&gt;10% buy-in, &gt;30% em 3-bet pots)</li>
                <li>Exercício guiado: como comparar ChipEV vs ICM side-by-side no GTO Wizard/DeepSolver</li>
              </ul>
            </div>

            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: 'var(--glass-border)', backdropFilter: 'blur(12px)' }}>
              <strong style={{ color: 'var(--text-main)', fontSize: '1rem' }}>Módulo 4: Variáveis Contextuais</strong>
              <ul style={{ marginTop: '0.75rem', marginBottom: 0, paddingLeft: '1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <li>Payout structures: flat vs top-heavy e impacto mensurável no RP (diferença de 5.7% no RP médio)</li>
                <li>FGS vs ICM clássico: quando o modelo padrão falha e o que usar</li>
                <li>KO/Bounty tournaments: RP positivo + equity drop negativo (como os dois interagem)</li>
                <li>CL dynamics: responsabilidade de pressionar vs risco de perder leverage futura</li>
              </ul>
            </div>

            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: 'var(--glass-border)', backdropFilter: 'blur(12px)' }}>
              <strong style={{ color: 'var(--text-main)', fontSize: '1rem' }}>Módulo 5: Aplicação Prática e Erros Comuns</strong>
              <ul style={{ marginTop: '0.75rem', marginBottom: 0, paddingLeft: '1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <li>Os 10 erros mais comuns do jogador AVG $109-$530 com correções concretas</li>
                <li>Heurísticas de mesa: checklist de decisão ICM pós-flop em tempo real</li>
                <li>Como estruturar sessões de estudo solo com solvers para treinar ICM pós-flop</li>
                <li>Conexões interdisciplinares como lente interpretativa: Prospect Theory, Teoria de Sistemas, Teoria dos Jogos</li>
              </ul>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>+ incontáveis outros módulos e sub-módulos.</p>
          </div>

          <div className="callout callout-emerald" style={{ margin: '2rem 0' }}>
            <h4 style={{ marginTop: 0, color: 'var(--accent-emerald)' }}>Bônus Exclusivo</h4>
            <p style={{ marginBottom: 0 }}><strong>Checklist de Bolso &quot;Antevisão&quot;:</strong> Um guia passo-a-passo para calibrar sua mente antes de cada mão em uma FT. Nunca mais entre em um spot sem saber quem cobre quem e qual é o Risk Premium da mesa.</p>
          </div>

          <h3>Elementos Diferenciadores</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '0.8rem' }}><strong>1. Metodologia de toy-games:</strong> isolamento de variáveis para construir intuição antes de aplicar a situações reais — diferencial metodológico de Raphael.</li>
            <li style={{ marginBottom: '0.8rem' }}><strong>2. Conceitos próprios nomeados:</strong> Teto do RP, RP de ida vs volta — nomenclatura clara e própria que o mercado não usa.</li>
            <li style={{ marginBottom: '0.8rem' }}><strong>3. ICM pós-flop como tese central:</strong> a maioria do conteúdo existente trata ICM como fenômeno pré-flop. Esta aula trata ICM pós-flop como o edge inexplorado real.</li>
            <li style={{ marginBottom: '0.8rem' }}><strong>4. Crítica fundamentada aos solvers:</strong> solvers como mapa, não como território — posição que diferencia o conteúdo de tutoriais de ferramentas.</li>
            <li style={{ marginBottom: '0.8rem' }}><strong>5. Conexões interdisciplinares reais:</strong> Prospect Theory, Teoria de Sistemas e Teoria dos Jogos usadas como lentes interpretativas, não como ornamento.</li>
          </ul>
        </article>
      </section>

      {/* Autor */}
      <section id="autor">
        <div className="author-section">
          <div className="video-wrapper-inline">
            <video controls autoPlay muted playsInline loop preload="metadata">
              <source src="/0309.mp4" type="video/mp4" />
              Seu navegador não suporta a tag de vídeo.
            </video>
          </div>
          <div>
            <h3 style={{ textAlign: 'left', marginTop: 0, fontSize: '1.8rem' }}>Sobre o Autor</h3>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '1rem' }}><strong>Raphael Vitoi</strong></p>
            <p>Educador e Profissional de Poker há mais de dez anos, Raphael Vitoi é um especialista em <strong>Sistemas Complexos, ICM, Multiway Spots e Teoria dos Jogos</strong>.</p>
            <p>Sua abordagem transita entre a <strong>Análise Bayesiana, Preditiva e Recursiva</strong>, focando na adaptação estratégica e análise comportamental (GTO e desvio). Além das mesas, mergulha na <strong>Psicologia do Poker</strong>, dissecando os vieses cognitivos que custam dinheiro.</p>
            <p><em>&quot;Pois o que importa de verdade é pensar bem.&quot;</em></p>

            <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <a href="https://deepsolver.com" target="_blank" rel="noopener" className="badge-link badge-link-primary">Embaixador Deepsolver</a>
              <a href="https://gtowizard.com" target="_blank" rel="noopener" className="badge-link badge-link-emerald">Afiliado GTO Wizard</a>
              <a href="https://trueicm.com" target="_blank" rel="noopener" className="badge-link badge-link-secondary">Criador trueICM.com</a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section id="final-cta" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <p style={{ fontSize: '1.5rem', fontStyle: 'italic', marginBottom: '2rem', color: 'var(--text-main)' }}>
          &quot;O edge não está mais nas cartas que você recebe, mas na precisão com que você avalia o risco de jogá-las.&quot;
        </p>
        <h2 style={{ fontSize: '2.5rem' }}>Recupere seu ROI. Domine a fronteira final.</h2>

        <div style={{ marginTop: '3rem' }}>
          <Link href="/aula-icm" className="btn-primary pulse-glow" style={{ padding: '1.2rem 4rem', fontSize: '1.1rem' }}>
            ACESSAR AULA MAGNA AGORA
          </Link>
        </div>
      </section>

      {/* Hub de Conteúdo */}
      <section id="biblioteca">
        <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Biblioteca de Conhecimento</h2>

        <div className="hub-grid">
          <Link href="/aula-icm" className="hub-card">
            <i className="fa-solid fa-chart-column hub-icon" style={{ color: 'var(--accent-primary)' }} />
            <h3>Geometria do Risco</h3>
            <p>Aula Magna: O Edge mudou de lugar. Entenda a geometria do risco pós-flop.</p>
            <span className="card-cta">Acessar <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }} /></span>
          </Link>

          <Link href="/leitura-icm" className="hub-card">
            <i className="fa-solid fa-file-lines hub-icon" style={{ color: 'var(--accent-primary)' }} />
            <h3>Entendendo o ICM</h3>
            <p>Whitepaper completo: Toy Games, Risk Premium, RP de ida/volta e o Teto do RP.</p>
            <span className="card-cta">Ler Whitepaper <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }} /></span>
          </Link>

          <Link href="/tools/simulador" className="hub-card">
            <i className="fa-solid fa-flask hub-icon" style={{ color: 'var(--accent-primary)' }} />
            <h3>Motor ICM</h3>
            <p>Laboratório interativo. Simule spots, calcule Risk Premium e visualize o Downward Drift na prática.</p>
            <span className="card-cta">Acessar Simulador <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }} /></span>
          </Link>

          <Link href="/artigos/estado-da-arte" className="hub-card">
            <i className="fa-solid fa-lightbulb hub-icon" style={{ color: 'var(--accent-primary)' }} />
            <h3>Estado da Arte 2025</h3>
            <p>Donk Bet meta, Efeito de Irradiação, IA vs HRC Pro. Tendências High Stakes.</p>
            <span className="card-cta">Ler <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }} /></span>
          </Link>

          <Link href="/artigos/smart-sniper" className="hub-card">
            <i className="fa-solid fa-crosshairs hub-icon" style={{ color: 'var(--accent-primary)' }} />
            <h3>Protocolo Smart Sniper</h3>
            <p>Gestão de carreira, rotina semanal, estratégia de domingo e validação Monte Carlo.</p>
            <span className="card-cta">Ler <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }} /></span>
          </Link>

          <Link href="/artigos/validacao-smart-sniper" className="hub-card">
            <i className="fa-solid fa-chart-line hub-icon" style={{ color: 'var(--accent-primary)' }} />
            <h3>Validação Científica</h3>
            <p>Monte Carlo, Índice de Sharpe, Barbell Strategy e modelagem cognitiva (Yerkes-Dodson). Q.E.D.</p>
            <span className="card-cta">Ler Artigo <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }} /></span>
          </Link>

          <Link href="/psicologia-hs" className="hub-card">
            <i className="fa-solid fa-brain hub-icon" style={{ color: 'var(--accent-primary)' }} />
            <h3>Psicologia High Stakes</h3>
            <p>A Fenomenologia da Incerteza: Exegese crítica das heurísticas de ICM.</p>
            <span className="card-cta">Ler <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }} /></span>
          </Link>

          <Link href="/biblioteca" className="hub-card">
            <i className="fa-solid fa-book-journal-whills hub-icon" style={{ color: 'var(--accent-primary)' }} />
            <h3>Biblioteca Epistêmica</h3>
            <p>Acervo de Filosofia, Psicologia e Existencialismo. A fundação teórica.</p>
            <span className="card-cta">Explorar <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }} /></span>
          </Link>

          <Link href="/quem-sou" className="hub-card">
            <i className="fa-solid fa-user hub-icon" style={{ color: 'var(--accent-primary)' }} />
            <h3>Quem Sou</h3>
            <p>O Manifesto. Educador, Estrategista e Especialista em Sistemas Complexos.</p>
            <span className="card-cta">Conhecer <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }} /></span>
          </Link>
        </div>
      </section>
    </main>

  );
}
