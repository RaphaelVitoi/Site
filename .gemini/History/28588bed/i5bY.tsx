/**
 * IDENTITY: Página ICM Masterclass
 * PATH: src/app/aula-icm/page.tsx
 * ROLE: Aula principal de ICM e Risk Premium Pós-Flop.
 * BINDING: [layout.tsx, globals.css, SimuladorICM.tsx]
 */

import Link from 'next/link';
import styles from './page.module.css';
import MasterSimulator from '../../components/simulator/MasterSimulator';

export const metadata = {
  title: 'ICM Pós-Flop | Raphael Vitoi',
  description: 'Aula exclusiva sobre Risk Premium, Downward Drift e a Geometria do Risco no poker.',
};

const metrics = [
  {
    label: 'Perda de Edge (ChipEV) vs RP',
    value: '10–12% ROI',
    detail: 'Jogando o mesmo range de cash game em mesas finais sem ajustar o RP.',
  },
  {
    label: 'Angular Drift',
    value: 'RP↓ → Frequência↑',
    detail: 'Downward Drift mostra como o risco se curva ao longo das streets.',
  },
  {
    label: 'RP vs Bubble Factor',
    value: 'RP ≥ 2× BF',
    detail: 'Meta-projeção: o diferencial determina se o fold é uma obrigação matemática.',
  },
  {
    label: 'Pressão do Chip Leader',
    value: 'RP ~12%',
    detail: 'Defende o clímax do “Pacto Silencioso” com lâminas recortadas em equities.',
  },
];

const timeline = [
  {
    epoch: 'Modo de Operação',
    title: 'Estado-base',
    copy: 'Próximas fichas geram valores numéricos. A Geometria do Risco define “pontos fixos” no board.',
  },
  {
    epoch: 'Transição',
    title: 'Drift acumulado',
    copy: 'O RP se dissipa em cada street; o solver clássico “empurra” valores lineares, o ICM se curva.',
  },
  {
    epoch: 'Resultado',
    title: 'Bifurcação do Edge',
    copy: 'Os jogadores que interpretam o risco em termos geométricos exploram “ângulos” que os outros não veem.',
  },
];

const pillars = [
  {
    title: 'Dados em tempo real',
    copy: 'Laboratórios de toy games calibrados com GTO Wizard / DeepSolver 2026.',
    icon: 'fa-satellite-dish',
    tag: 'LIVE',
    accent: 'rgba(14, 165, 233, 0.6)',
  },
  {
    title: 'Heurísticas renomeadas',
    copy: 'Risk Premium, Downward Drift, Teto do RP e Pacto Silencioso guiando decisões.',
    icon: 'fa-compass',
    tag: 'HEUR',
    accent: 'rgba(99, 102, 241, 0.6)',
  },
  {
    title: 'Aplicação pixel a pixel',
    copy: 'Cada street recebe mapas de pressão, permitindo artesanais recalibragens.',
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
      'O OP perde mais do que ganha. O RP força folds abaixo dos 38%.',
      'O IP apenas blefa quando o RP cai; a exploração é rara e precisa.',
    ],
  },
  {
    title: 'O Freio Bayesiano',
    type: 'neutral',
    lines: [
      'RP alto congela blefes. A agressão polariza; equilíbrio conservador define o jogo.',
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
          <span className="fa-solid fa-bolt" /> State of the Art
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
            Abrir Motor ICM &rarr;
          </Link>
        </div>
      </header>

      <section className={styles.stateOfArtSection}>
        <div className={`glass-panel ${styles.stateOfArtPanel}`}>
          <div className={styles.stateOfArtIntro}>
            <p className="page-label">
              <span className="fa-solid fa-radar" /> Geometria do Risco
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
            Solvers e trackers democratizaram teorias de poker, mas poucos entendem que o valor de uma ficha depende de quem a perde.
            O MDF aplicado à força em mesas finais ignora que cada ficha carrega um multiplicador de dor.
          </p>
          <p>
            Risk Premium e Bubble Factor são os motores invisíveis do fluxo de fichas. Desenhar ranges sem contemplar essas forças é
            entregar juízes para os algoritmos.
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
          <span className="fa-solid fa-compass" /> Navegação
        </p>
        <h3>O Arsenal Tático</h3>
        <div className={styles.navGrid}>
          <Link href="/leitura-icm" className={styles.navCard}>
            <span className="fa-solid fa-file-lines" />
            <div>
              <strong>Whitepaper ICM</strong>
              <span>Teoria completa →</span>
            </div>
          </Link>
          <a href="#simulador-section" className={styles.navCard}>
            <span className="fa-solid fa-gamepad" />
            <div>
              <strong>Motor ICM</strong>
              <span>Laboratório interativo →</span>
            </div>
          </a>
          <Link href="/aula-1-2" className={styles.navCard}>
            <span className="fa-solid fa-graduation-cap" />
            <div>
              <strong>Aula 1.2</strong>
              <span>Material complementar →</span>
            </div>
          </Link>
        </div>
      </section>

      <section id="simulador-section" className={styles.simInfo}>
        <p className="page-label">
          <span className="fa-solid fa-chart-area" />
          Geometria do Risco Engine
        </p>
        <h2>Motor ICM</h2>
        <p>
          9 cenários clínicos, calculadora Malmuth-Harville, NashSolver, quizzes e comparação de mãos acompanhando o Risk Premium em tempo real.
        </p>
        <div className="mt-12 w-full text-left">
          <MasterSimulator />
        </div>
      </section>

      <nav className={`${styles.articleNav} article-nav`}>
        <Link href="/leitura-icm">&larr; Whitepaper ICM</Link>
        <Link href="/aula-1-2">Aula 1.2 &rarr;</Link>
      </nav>
    </main>
  );
}
