/**
 * IDENTITY: Landing Page Principal (Nexus Central)
 * PATH: src/app/page.tsx
 * ROLE: Página de alta conversão. Sales copy + Hub de Conteúdo + Autor + CTA.
 * BINDING: [layout.tsx, globals.css]
 */

import { SectionHeader } from '@/components/ui/SectionHeader';
import Link from 'next/link';

import styles from './page.module.css';

export const metadata = {
  title: 'Poker Racional | Raphael Vitoi',
  description: 'ICM Pos-Flop, Risk Premium e a Nova Fronteira do Edge no Poker. Masterclass, Simuladores e Teoria dos Jogos.',
};

export default function HomePage () {
  return (
    <div className={ styles.hero }>

      {/* Hero Section */ }
      <section id="hero" className={ `animate-fade-up ${styles.heroContent}` }>
        <div className={ styles.pageLabel }>
          ICM e Risk Premium Pós-Flop</div>
        <h2 className={ styles.heroTitle }>
          O Edge Mudou de Lugar{ ' ' }
          <span className={ styles.heroSubtitle }>
            Você Ainda Está Jogando o Jogo de 2020?
          </span>
        </h2>
        <p className={ `page-subtitle ${styles.heroDescription}` }>
          Descubra por que jogar ChipEV em mesas finais está custando, em média,{ ' ' }
          <strong>mais de 10% do seu ROI</strong> e como a elite do poker usa o
          &quot;Downward Drift&quot; para dominar o pós-flop em 2026
        </p>

        <div className={ styles.heroActions }>
          <Link href="#metodo" className="btn-primary" style={ { padding: '1rem 2.5rem', fontSize: '0.95rem' } }>
            Conhecer o Método <i className="fa-solid fa-arrow-right" style={ { marginLeft: '6px' } } />
          </Link>
          <Link href="/aulas/leitura-icm" className="btn-secondary" style={ { padding: '1rem 2.5rem', fontSize: '0.95rem' } }>
            Ler o Whitepaper
          </Link>
        </div>
      </section>

      {/* O Método (Sales Copy) */ }
      <SectionHeader
        step="01"
        label="O Método"
        title="A 'Mentira' do ICM e a Nova Fronteira do Edge"
        description="O poker evoluiu, e o seu edge no pré-flop está desaparecendo. Hoje, solvers resolveram o pré-flop. Mas existe uma Nova Fronteira onde o dinheiro real está sendo ganho e perdido silenciosamente."
      />
      <div className={ styles.metodoWrapper }>
        <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-indigo-500/10 rounded-2xl">
          <div className="prose prose-invert prose-lg max-w-none text-slate-300">
            <p>Se você é como a maioria dos regulares de MTT, você aprendeu que o ICM é um interruptor que &quot;liga&quot; na bolha ou na mesa final. Você estudou tabelas de Push/Fold. Você domina o HRC e o ICMIZER. Você acha que seu jogo de ICM está em dia.</p>
            <p><strong>Tenho uma má notícia:</strong> O gap de habilidade entre você e o reg médio nessa área é mínimo. Onde o dinheiro real está sendo ganho e perdido silenciosamente é no <strong>ICM Pós-Flop.</strong></p>

            <div className="callout callout-secondary my-8">
              <h4 className={ styles.calloutSecondaryTitle }>O Custo Invisível</h4>
              <p>Dados recentes do GTO Wizard (2025/2026) revelam uma verdade brutal:</p>
              <blockquote className={ styles.blockquote }>
                Jogar uma estratégia padrão de ChipEV (focada em acumular fichas) em spots de mesa final custa, em média, <strong>10% a 12% de todo o buy-in do torneio em $EV</strong>.
              </blockquote>
              <p>Em potes 3-bet? O erro custa mais de <strong>30% do valor da jogada</strong>. Pense nisso. Você grindou 8 horas. Chegou na FT. E em duas decisões de c-bet mal calibradas, você devolveu todo o lucro esperado do torneio. Não porque jogou &quot;mal&quot;, mas porque jogou com a matemática errada.</p>
            </div>

            <h3>Apresentando: O Mapa do ICM Pós-Flop</h3>
            <p>Nesta aula inédita, não vamos falar de tabelas de push/fold. Vamos mergulhar na física do jogo pós-flop sob pressão. Você vai aprender a <strong>Antevisão</strong>: a habilidade de olhar para uma mesa e ver o &quot;campo de força&quot; do Risk Premium antes mesmo de receber suas cartas.</p>

            <h4 style={ { color: 'var(--text-main)', fontSize: '1.2rem' } }>O Que Você Vai Dominar:</h4>
            <ul style={ { listStyle: 'none', paddingLeft: 0 } }>
              <li><i className="fa-solid fa-check" style={ { color: 'var(--accent-emerald)', marginRight: '8px' } } /> <strong>O &quot;Downward Drift&quot;:</strong> A heurística simples que ajusta automaticamente seus sizings e frequências para a realidade do ICM.</li>
              <li><i className="fa-solid fa-check" style={ { color: 'var(--accent-emerald)', marginRight: '8px' } } /> <strong>Toy-Games de Laboratório:</strong> Vamos dissecar 8 cenários puros para provar matematicamente conceitos contraintuitivos.</li>
              <li><i className="fa-solid fa-check" style={ { color: 'var(--accent-emerald)', marginRight: '8px' } } /> <strong>O Teto do Risk Premium:</strong> Por que overbluffar o Chip Leader é suicídio, e onde está o limite matemático da agressão.</li>
              <li><i className="fa-solid fa-check" style={ { color: 'var(--accent-emerald)', marginRight: '8px' } } /> <strong>A Mesa como Organismo:</strong> Como um all-in entre dois oponentes muda instantaneamente o valor das SUAS fichas.</li>
            </ul>

            <h3>Para Quem É Isso?</h3>
            <p>Este material não é para iniciantes. É para jogadores profissionais e semiprofissionais (AVG $109-$530) que já entendem o básico de ICM pré-flop e querem uma vantagem técnica real que o field ainda não estuda.</p>

            <h3>O Que Está Incluso</h3>
            <div style={ { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', margin: '2rem 0' } }>
              <div style={ { background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: 'var(--glass-border)' } }>
                <strong style={ { color: 'var(--text-main)', fontSize: '1rem' } }>Módulo 1: O Problema e o Mapa</strong>
                <p style={ { marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' } }>Por que ICM importa desde a mão 1, o que é Risk Premium, e sua relação com o Bubble Factor.</p>
              </div>
              <div style={ { background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: 'var(--glass-border)' } }>
                <strong style={ { color: 'var(--text-main)', fontSize: '1rem' } }>Módulo 2: Toy-Games como Laboratório</strong>
                <p style={ { marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' } }>8 toy-games com RP progressivo e invertido para isolar variáveis e construir intuição sobre o Teto do RP e o Pacto Silencioso.</p>
              </div>
              <div style={ { background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: 'var(--glass-border)' } }>
                <strong style={ { color: 'var(--text-main)', fontSize: '1rem' } }>Módulo 3: ICM Pós-Flop — A Fronteira</strong>
                <p style={ { marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' } }>Downward Drift, distribuição de RP por street, covering advantage e o custo quantificado de jogar ChipEV em spots ICM.</p>
              </div>
              <div style={ { background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: 'var(--glass-border)' } }>
                <strong style={ { color: 'var(--text-main)', fontSize: '1rem' } }>Módulo 4: Variáveis Contextuais</strong>
                <p style={ { marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' } }>Impacto de Payouts (flat vs top-heavy), FGS vs ICM clássico, dinâmica de KOs e a responsabilidade do Chip Leader.</p>
              </div>
            </div>

            <div className={ styles.bonusCallout }>
              <h4 className={ styles.bonusTitle }>Bônus Exclusivo</h4>
              <p style={ { marginBottom: 0 } }><strong>Checklist de Bolso &quot;Antevisão&quot;:</strong> Um guia passo-a-passo para calibrar sua mente antes de cada mão em uma FT. Nunca mais entre em um spot sem saber quem cobre quem e qual é o Risk Premium da mesa.</p>
            </div>

            <h3>Elementos Diferenciadores</h3>
            <ul className={ styles.diffList }>
              <li className={ styles.diffItem }><strong>1. Metodologia de toy-games:</strong> isolamento de variáveis para construir intuição antes de aplicar a situações reais.</li>
              <li className={ styles.diffItem }><strong>2. Conceitos próprios nomeados:</strong> Teto do RP, RP de ida vs volta — nomenclatura clara que o mercado não usa.</li>
              <li className={ styles.diffItem }><strong>3. ICM pós-flop como tese central:</strong> a maioria do conteúdo existente trata ICM como fenômeno pré-flop.</li>
              <li className={ styles.diffItem }><strong>4. Crítica fundamentada aos solvers:</strong> solvers como mapa, não como território — posição que diferencia o conteúdo de tutoriais.</li>
              <li className={ styles.diffItem }><strong>5. Conexões interdisciplinares reais:</strong> Prospect Theory, Teoria de Sistemas e Teoria dos Jogos usadas como lentes interpretativas.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Autor */ }
      <SectionHeader
        step="02"
        label="O Autor"
        title="Raphael Vitoi"
        description="Educador e Profissional de Poker há mais de dez anos, especialista em Sistemas Complexos, ICM, Multiway Spots e Teoria dos Jogos."
      />
      <div className={ styles.authorWrapper }>
        <div className={ styles.authorCard }>
          <div className={ styles.videoWrapper }>
            <video autoPlay muted playsInline loop preload="metadata">
              <source src="/0309.mp4" type="video/mp4" />
              Seu navegador não suporta o vídeo.
            </video>
          </div>
          <div className="prose prose-invert prose-lg max-w-none text-slate-300">
            <p>Sua abordagem transita entre a <strong>Análise Bayesiana, Preditiva e Recursiva</strong>, focando na adaptação estratégica e análise comportamental (GTO e desvio). Além das mesas, mergulha na <strong>Psicologia do Poker</strong>, dissecando os vieses cognitivos que custam dinheiro.</p>
            <p><em>&quot;Pois o que importa de verdade é pensar bem.&quot;</em></p>

            <div style={ { marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' } }>
              <a href="https://deepsolver.com" target="_blank" rel="noopener" className="badge-link badge-link-primary">Embaixador Deepsolver</a>
              <a href="https://gtowizard.com" target="_blank" rel="noopener" className="badge-link badge-link-emerald">Afiliado GTO Wizard</a>
              <a href="https://trueicm.com" target="_blank" rel="noopener" className="badge-link badge-link-secondary">Criador trueICM.com</a>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Final */ }
      <div className={ styles.finalCtaSection }>
        <section id="final-cta">
          <p className={ styles.finalCtaQuote }>
            &quot;O edge não está mais nas cartas que você recebe, mas na precisão com que você avalia o risco de jogá-las.&quot;
          </p>
          <h2 className={ styles.finalCtaTitle }>Recupere seu ROI. Domine a fronteira final.</h2>

          <div>
            <Link href="/aulas/icm-masterclass" className="btn-primary pulse-glow" style={ { padding: '1.2rem 4rem', fontSize: '1.1rem' } }>
              ACESSAR AULA MAGNA AGORA
            </Link>
          </div>
        </section>
      </div>

      {/* Hub de Conteúdo */ }
      <SectionHeader
        step="03"
        label="Hub Central"
        title="Biblioteca de Conhecimento"
        description="Explore o acervo completo: aulas magnas, whitepapers, simuladores interativos e artigos sobre a fundação teórica do jogo."
      />
      <div className={ styles.hubWrapper }>
        <div className="hub-grid">
          <Link href="/aulas/icm-masterclass" className="hub-card">
            <i className="fa-solid fa-chart-column hub-icon" style={ { color: 'var(--accent-primary)' } } />
            <h3>Geometria do Risco</h3>
            <p>Aula Magna: O Edge mudou de lugar. Entenda a geometria do risco pós-flop.</p>
            <span className="card-cta">Acessar <i className="fa-solid fa-arrow-right" style={ { marginLeft: '4px' } } /></span>
          </Link>

          <Link href="/aulas/leitura-icm" className="hub-card">
            <i className="fa-solid fa-file-lines hub-icon" style={ { color: 'var(--accent-primary)' } } />
            <h3>Entendendo o ICM</h3>
            <p>Whitepaper completo: Toy Games, Risk Premium, RP de ida/volta e o Teto do RP.</p>
            <span className="card-cta">Ler Whitepaper <i className="fa-solid fa-arrow-right" style={ { marginLeft: '4px' } } /></span>
          </Link>

          <Link href="/simulador" className="hub-card">
            <i className="fa-solid fa-flask hub-icon" style={ { color: 'var(--accent-primary)' } } />
            <h3>Motor ICM</h3>
            <p>Laboratório interativo. Simule spots, calcule Risk Premium e visualize o Downward Drift na prática.</p>
            <span className="card-cta">Acessar Simulador <i className="fa-solid fa-arrow-right" style={ { marginLeft: '4px' } } /></span>
          </Link>

          <Link href="/oraculo" className="hub-card">
            <i className="fa-solid fa-network-wired hub-icon" style={ { color: 'var(--accent-primary)' } } />
            <h3>Oráculo Híbrido</h3>
            <p>Explore a topologia ontológica do Knowledge Graph e consulte a Mente Coletiva via RAG SOTA.</p>
            <span className="card-cta">Consultar Oráculo <i className="fa-solid fa-arrow-right" style={ { marginLeft: '4px' } } /></span>
          </Link>

          <Link href="/artigos/estado-da-arte" className="hub-card">
            <i className="fa-solid fa-lightbulb hub-icon" style={ { color: 'var(--accent-primary)' } } />
            <h3>Estado da Arte 2025</h3>
            <p>Donk Bet meta, Efeito de Irradiação, IA vs HRC Pro. Tendências High Stakes.</p>
            <span className="card-cta">Ler <i className="fa-solid fa-arrow-right" style={ { marginLeft: '4px' } } /></span>
          </Link>

          <Link href="/artigos/smart-sniper" className="hub-card">
            <i className="fa-solid fa-crosshairs hub-icon" style={ { color: 'var(--accent-primary)' } } />
            <h3>Protocolo Smart Sniper</h3>
            <p>Gestão de carreira, rotina semanal, estratégia de domingo e validação Monte Carlo.</p>
            <span className="card-cta">Ler <i className="fa-solid fa-arrow-right" style={ { marginLeft: '4px' } } /></span>
          </Link>

          <Link href="/artigos/validacao-smart-sniper" className="hub-card">
            <i className="fa-solid fa-chart-line hub-icon" style={ { color: 'var(--accent-primary)' } } />
            <h3>Validação Científica</h3>
            <p>Monte Carlo, Índice de Sharpe, Barbell Strategy e modelagem cognitiva (Yerkes-Dodson). Q.E.D.</p>
            <span className="card-cta">Ler Artigo <i className="fa-solid fa-arrow-right" style={ { marginLeft: '4px' } } /></span>
          </Link>

          <Link href="/artigos/psicologia-hs" className="hub-card">
            <i className="fa-solid fa-brain hub-icon" style={ { color: 'var(--accent-primary)' } } />
            <h3>Psicologia High Stakes</h3>
            <p>A Fenomenologia da Incerteza: Exegese crítica das heurísticas de ICM.</p>
            <span className="card-cta">Ler <i className="fa-solid fa-arrow-right" style={ { marginLeft: '4px' } } /></span>
          </Link>

          <Link href="/biblioteca" className="hub-card">
            <i className="fa-solid fa-book-journal-whills hub-icon" style={ { color: 'var(--accent-primary)' } } />
            <h3>Biblioteca Epistêmica</h3>
            <p>Acervo de Filosofia, Psicologia e Existencialismo. A fundação teórica.</p>
            <span className="card-cta">Explorar <i className="fa-solid fa-arrow-right" style={ { marginLeft: '4px' } } /></span>
          </Link>

          <Link href="/quem-sou" className="hub-card">
            <i className="fa-solid fa-user hub-icon" style={ { color: 'var(--accent-primary)' } } />
            <h3>Quem Sou</h3>
            <p>O Manifesto. Educador, Estrategista e Especialista em Sistemas Complexos.</p>
            <span className="card-cta">Conhecer <i className="fa-solid fa-arrow-right" style={ { marginLeft: '4px' } } /></span>
          </Link>
        </div>
      </div>
    </div>

  );
}
