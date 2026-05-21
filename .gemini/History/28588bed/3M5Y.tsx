/**
 * IDENTITY: Página ICM Masterclass
 * PATH: src/app/aula-icm/page.tsx
 * ROLE: Aula principal de ICM e Risk Premium Pós-Flop.
 * BINDING: [layout.tsx, globals.css, SimuladorICM.tsx]
 */

import Link from 'next/link';
import styles from './page.module.css';

export const metadata = {
  title: 'ICM Pós-Flop | Raphael Vitoi',
  description: 'Aula exclusiva sobre Risk Premium, Downward Drift e a Geometria do Risco no poker.',
};

const metrics = [
  {
    label: 'Custo de ignorar o RP',
    value: '~10% ROI',
    detail: 'Estimativa do edge perdido ao jogar ChipEV em mesas finais sem ajustar ao Risk Premium.',
  },
  {
    label: 'Downward Drift',
    value: 'RP↑ → Sizing↓',
    detail: 'Downward Drift (O\'Kearney & Carter): sob pressão ICM, grandes apostas migram para apostas menores, que migram para calls.',
  },
  {
    label: 'ΔRP — Vantagem de Risco',
    value: 'IP − OOP',
    detail: 'O diferencial de Risk Premium entre os dois jogadores organiza todas as 6 frequências de ação pós-flop.',
  },
  {
    label: 'Pressão do Chip Leader',
    value: 'RP ~12%',
    detail: 'O CL carrega RP real — não para sobreviver, mas para proteger sua Perspectiva Matemática contra o crescimento dos rivais.',
  },
];

const timeline = [
  {
    epoch: 'Modo de Operação',
    title: 'Estado-base',
    copy: 'Cada ficha tem valor assimétrico: a última ficha (base da stack) vale mais do que a primeira (topo). O Risk Premium quantifica essa assimetria.',
  },
  {
    epoch: 'Transição',
    title: 'Drift acumulado',
    copy: 'O RP residual decresce por street conforme o pote cresce em relação à stack. O solver raciocina sobre o pote isolado; o ICM raciocina sobre o torneio inteiro.',
  },
  {
    epoch: 'Resultado',
    title: 'Bifurcação do Edge',
    copy: 'Quem ajusta as frequências ao RP real captura o edge que o oponente ChipEV cede sistematicamente.',
  },
];

const pillars = [
  {
    title: 'Âncora empírica',
    copy: '93 nodes HRC vs GTO Wizard (Aula 1.2, board KJT-2-3) como único ponto de calibração real. Demais cenários: estimativas didáticas.',
    icon: 'fa-satellite-dish',
    tag: 'DATA',
    accent: 'rgba(14, 165, 233, 0.6)',
  },
  {
    title: 'Framework original',
    copy: 'Risk Premium, ΔRP, Perspectiva e Esperança Matemática — conceitos de Raphael Vitoi. Downward Drift: O\'Kearney & Carter.',
    icon: 'fa-compass',
    tag: 'ORIG',
    accent: 'rgba(99, 102, 241, 0.6)',
  },
  {
    title: 'Motor interativo',
    copy: 'Cada cenário expõe RP, ΔRP e as 6 frequências ICM pós-flop. Edite os valores ChipEV e veja a distorção em tempo real.',
    icon: 'fa-layer-group',
    tag: 'MAPA',
    accent: 'rgba(16, 185, 129, 0.6)',
  },
];

const archetypes = [
  {
    id: '01',
    icon: 'fa-shield-halved',
    title: 'O Pacto Silencioso',
    text: 'Chip Leader (70bb) vs. Vice CL (65bb). RP > 20%, 3-bets desaparecem e o foco fica em defender coolers minimalistas pós-flop.',
    tone: 'rgba(99,102,241,0.2)',
  },
  {
    id: '02',
    icon: 'fa-scale-unbalanced',
    title: 'Paradoxo do Valuation',
    text: 'BTN (40bb) blefa contra BB (54bb). RP ~21% vs 12%: hero-blefs custam caro, a agressão é estrangulada.',
    tone: 'rgba(225,29,72,0.2)',
  },
  {
    id: '03',
    icon: 'fa-skull',
    title: 'Guerra na Lama',
    text: 'Dois shorts dominados por gigantes. A abundância de foes eleva o EV do fold; quem ignora o RP sangra equity.',
    tone: 'rgba(16,185,129,0.2)',
  },
  {
    id: '04',
    icon: 'fa-crown',
    title: 'A Ameaça Orgânica',
    text: 'Chip Leader (90bb) cuida de RP ~12%. Jogar como se o RP fosse 0% abre brechas fatais no river.',
    tone: 'rgba(245,158,11,0.2)',
  },
];

const callouts = [
  {
    title: 'A Equação do Desespero',
    type: 'secondary',
    lines: [
      'OOP com alto RP perde mais do que ganha em cada confronto: chips perdidos valem mais do que chips ganhos.',
      'O fold passa a ser matematicamente obrigatório acima da frequência de equilíbrio ChipEV — não por covardia, mas por Esperança Matemática.',
    ],
  },
  {
    title: 'Compressão do Risco',
    type: 'neutral',
    lines: [
      'RP alto comprime blefes e apostas grandes. A agressão migra para sizings menores ou desaparece — Downward Drift em ação.',
    ],
  },
  {
    title: 'Dissipação do RP por street',
    type: 'emerald',
    lines: [
      'Pré-flop: RP máximo → Drift máximo.',
      'Flop/Turn: RP residual → Drift moderado.',
      'River: RP baixo → o jogo se aproxima do ChipEV.',
    ],
  },
];

export default function AulaICMPage() {
  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.heroLabel}>
          <i className="fa-solid fa-bolt" /> State of the Art
        </p>
        <h1 className={styles.heroTitle}>O Edge Mudou de Lugar.</h1>
        <p className={styles.heroSubtitle}>
          Jogar ChipEV contra o Downward Drift custa, em média, <strong>10% do ROI</strong>.
          Esta aula mostra como o Risk Premium redefine o pós-flop de 2026.
        </p>
        <div className={styles.heroActions}>
          <Link href="#arsenal" className={`btn-primary ${styles.heroButton}`}>
            Arsenal Tático
          </Link>
          <Link href="/tools/simulador" className={`btn-secondary ${styles.heroButton}`}>
            Abrir Motor ICM <i className="fa-solid fa-arrow-right" style={{ marginLeft: '6px' }} />
          </Link>
        </div>
      </header>

      <section className={styles.stateOfArtSection}>
        <div className={`glass-panel ${styles.stateOfArtPanel}`}>
          <div className={styles.stateOfArtIntro}>
            <p className="page-label">
              <i className="fa-solid fa-radar" /> Geometria do Risco
            </p>
            <h2>Operamos com dados de vanguarda.</h2>
            <p>
              O mundo real exige renderizar o Risk Premium em espectros. Estas métricas sintetizam
              o comportamento geoestratégico do RP, do Drift e do Bubble Factor para que a mesa final
              se torne um mapa legível.
            </p>
          </div>
          <div className={`${styles.metricGrid} hub-grid`}>
            {metrics.map((metric) => (
              <article key={metric.label} className={`hub-card ${styles.metricCard}`}>
                <p className={styles.metricLabel}>{metric.label}</p>
                <strong>{metric.value}</strong>
                <p>{metric.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.timelineSection}>
        <div className={`glass-panel ${styles.timelineCard}`}>
          <h3>Linha do Tempo do RP</h3>
          <p>
            A geometria do risco move-se como uma trajetória curva. Interpretamos cada momento
            para antecipar o impacto percentual do RP e guiar as próximas jogadas.
          </p>
          <div className={styles.timeline}>
            {timeline.map((step) => (
              <div key={step.title} className={`hub-card ${styles.timelineStep}`}>
                <span className={styles.timelineEpoch}>{step.epoch}</span>
                <h4>{step.title}</h4>
                <p>{step.copy}</p>
              </div>
            ))}
          </div>
        </div>
        <div className={`${styles.pillars} hub-grid`}>
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className={`hub-card ${styles.pillarCard}`}
              style={{ ['--pillar-accent' as string]: pillar.accent }}
            >
              <div className={styles.pillarTop}>
                <span className={styles.pillarTag}>{pillar.tag}</span>
                <span className={styles.pillarIcon}>
                  <i className={`fa-solid ${pillar.icon}`} />
                </span>
              </div>
              <h4>{pillar.title}</h4>
              <p>{pillar.copy}</p>
              <div className={styles.pillarVisual} aria-hidden="true" />
            </div>
          ))}
        </div>
      </section>

      <section className={styles.articleSection}>
        <article className={styles.article}>
          <h2>A Geometria do Risco</h2>
          <p className={styles.articleTag}>A desconstrução do pós-flop sob a ótica do ICM</p>
          <p>
            Solvers democratizaram o acesso à teoria, mas raciocinam sobre o pot isolado — não sobre o torneio.
            O MDF aplicado à força em mesas finais ignora que cada ficha carrega um custo assimétrico: chips perdidos valem mais do que chips ganhos.
          </p>
          <p>
            O Risk Premium quantifica essa assimetria por jogador. Ignorá-lo é jogar um jogo diferente do que está acontecendo na mesa.
          </p>
        </article>

        <div className={styles.archetypeGrid}>
          {archetypes.map(({ id, icon, title, text, tone }) => (
            <article key={id} className={styles.archetypeCard}>
              <div className={styles.archetypeHeader}>
                <div className={styles.archetypeIcon} style={{ background: tone }}>
                  <i className={`fa-solid ${icon}`} />
                </div>
                <span className={styles.archetypeId}>{id}</span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.calloutsSection}>
        {callouts.map(({ title, type, lines }) => (
          <div key={title} className={`${styles.callout} ${styles[`callout-${type}`]}`}>
            <h4>{title}</h4>
            <ul>
              {lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className={styles.arsenal} id="arsenal">
        <p className={styles.sectionTag}>
          <i className="fa-solid fa-compass" /> Navegação
        </p>
        <h3>O Arsenal Tático</h3>
        <div className={styles.navGrid}>
          <Link href="/leitura-icm" className={styles.navCard}>
            <i className="fa-solid fa-file-lines" />
            <div>
              <strong>Whitepaper ICM</strong>
              <span>Teoria completa <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }} /></span>
            </div>
          </Link>
          <a href="#simulador-section" className={styles.navCard}>
            <i className="fa-solid fa-gamepad" />
            <div>
              <strong>Motor ICM</strong>
              <span>Laboratório interativo <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }} /></span>
            </div>
          </a>
          <Link href="/aula-1-2" className={styles.navCard}>
            <i className="fa-solid fa-graduation-cap" />
            <div>
              <strong>Aula 1.2</strong>
              <span>Material complementar <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }} /></span>
            </div>
          </Link>
          <Link href="/conceitos-icm" className={styles.navCard}>
            <i className="fa-solid fa-book-open" />
            <div>
              <strong>Glossário Formal</strong>
              <span>RP, Perspectiva, Esperança <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }} /></span>
            </div>
          </Link>
        </div>
      </section>

      <section id="simulador-section" className={styles.simInfo}>
        <p className="page-label">
          <i className="fa-solid fa-chart-area" /> Geometria do Risco Engine
        </p>
        <h2>Motor ICM</h2>
        <p>
          9 cenários clínicos, calculadora Malmuth-Harville, NashSolver — visualize a distorção ICM sobre as frequências GTO em tempo real.
        </p>
        <div style={{ marginTop: '2rem' }}>
          <a href="/tools/simulador" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-flask" /> Abrir Motor ICM
          </a>
        </div>
      </section>

      <footer className={styles.references}>
        <p className={styles.referencesTitle}>Referências</p>
        <ul className={styles.referencesList}>
          <li>
            O&apos;Kearney, D. &amp; Carter, B. <em>PKO Poker Strategy</em>. D&amp;B Poker, 2023.
            &mdash; origem do conceito <strong>Downward Drift</strong>, aqui estendido e quantificado.
          </li>
          <li>
            GTO Wizard Blog. &ldquo;MDF vs ICM: Rethinking Bluffing &amp; Defense Strategies in MTTs.&rdquo; 2025.
          </li>
          <li>
            GTO Wizard Blog. &ldquo;How ICM Impacts Postflop Strategy.&rdquo; 2025.
          </li>
        </ul>
      </footer>

      <nav className={`${styles.articleNav} article-nav`}>
        <Link href="/leitura-icm"><i className="fa-solid fa-arrow-left" style={{ marginRight: '4px' }} /> Whitepaper ICM</Link>
        <Link href="/aula-1-2">Aula 1.2 <i className="fa-solid fa-arrow-right" style={{ marginLeft: '4px' }} /></Link>
      </nav>
    </main>
  );
}
