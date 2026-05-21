/**
 * IDENTITY: Geometria do Risco — Artigo Teórico
 * PATH: src/app/aulas/icm-masterclass/page.tsx
 * ROLE: Framework matemático do ICM pós-flop. Teoria densa e layout SOTA.
 */

import Link from 'next/link';
import styles from './page.module.css';
import LessonHeader from '@/components/content/LessonHeader';
import ContentFooter from '@/components/content/ContentFooter';

export const metadata = {
  title: 'Geometria do Risco | Raphael Vitoi',
  description: 'O framework matemático do ICM pós-flop: Risk Premium, ΔRP, Perspectiva Matemática, Esperança e Downward Drift.',
};

const metrics = [
  {
    label: 'Custo médio de ignorar o RP',
    value: '~10% ROI',
    detail: 'Jogar ChipEV puro em mesas finais devolve, em média, 10–12% do buy-in em $EV. Em potes 3-bet, o erro ultrapassa 30% do valor da jogada.',
  },
  {
    label: 'Downward Drift',
    value: 'RP↑ → Sizing↓',
    detail: "Princípio de O'Kearney & Carter: sob pressão ICM crescente, apostas grandes migram para menores, que migram para calls — agressão comprime em cascata.",
  },
  {
    label: 'ΔRP — Diferencial de Risco',
    value: 'RP_OOP − RP_IP',
    detail: 'A diferença de Risk Premium entre os jogadores organiza as seis frequências de ação pós-flop. Quem tem RP menor domina; quem tem RP maior defende.',
  },
  {
    label: 'Pressão do Chip Leader',
    value: 'RP ~12%',
    detail: 'O CL carrega RP real — não para sobreviver, mas para proteger sua Perspectiva contra o crescimento dos rivais. Pressionar tem custo assimétrico.',
  },
];

const archetypes = [
  {
    id: '01',
    icon: 'fa-shield-halved',
    title: 'O Pacto Silencioso',
    text: 'Chip Leader (70bb) vs. Vice CL (65bb). RP > 20%, 3-bets desaparecem, c-bets encolhem. Passividade mútua racional — ambos têm Perspectiva alta a proteger.',
    tone: 'rgba(99,102,241,0.2)',
  },
  {
    id: '02',
    icon: 'fa-scale-unbalanced',
    title: 'Paradoxo do Valuation',
    text: 'BTN (40bb) blefa contra BB (54bb). RP ~21% vs 12%: os hero-blefs do BTN custam mais em $EV do que valem. A agressão é estrangulada pelo próprio RP do agressor.',
    tone: 'rgba(225,29,72,0.2)',
  },
  {
    id: '03',
    icon: 'fa-skull',
    title: 'Guerra na Lama',
    text: 'Dois shorts dominados por gigantes. RP alto, Perspectiva mínima a proteger. Foes abundantes elevam o EV do fold — quem ignora e joga ChipEV sangra equity.',
    tone: 'rgba(16,185,129,0.2)',
  },
  {
    id: '04',
    icon: 'fa-crown',
    title: 'A Ameaça Orgânica',
    text: 'Chip Leader (90bb) com RP ~12%. Parece baixo — mas Perspectiva é máxima e qualquer all-in confronta stack comparável. Ignorar abre brechas fatais no river.',
    tone: 'rgba(245,158,11,0.2)',
  },
];

export default function AulaICMPage() {
  const pageUrl = "https://www.pokerracional.com/aulas/icm-masterclass";
  const pageTitle = "Geometria do Risco | Raphael Vitoi";

  return (
    <main className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <article className="animate-fade-up">
        <LessonHeader title="Geometria do Risco" category="Framework Teórico • Masterclass" />

        <div className="glass-panel p-6 md:p-10 border border-white/10 shadow-2xl shadow-emerald-500/10 rounded-xl animate-fade-up animation-delay-200">
          <div className="glass-panel p-6 md:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-emerald-500/10 rounded-2xl animate-fade-up animation-delay-200">

            {/* Seção de Métricas */}
            <section className="mb-12">
              <div className="text-center mb-10">
                <p className="font-mono text-sm uppercase tracking-widest text-emerald-400">
                  <i className="fa-solid fa-radar" /> Grandezas do Sistema
                  <section className="mb-20">
                    <div className="text-center mb-14 max-w-3xl mx-auto">
                      <p className="font-mono text-sm uppercase tracking-widest text-emerald-400 mb-4">
                        <i className="fa-solid fa-radar mr-2" /> Grandezas do Sistema
                      </p>
                      <h2 className="mt-2 text-3xl font-bold tracking-tight font-heading text-white sm:text-4xl">
                        <h2 className="text-3xl font-bold tracking-tight font-heading text-white sm:text-4xl text-balance">
                          Quatro números que organizam o pós-flop de mesa final.
                        </h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-slate-400">
                          <p className="mt-6 text-lg leading-relaxed text-slate-400 text-balance">
                            RP, ΔRP, Perspectiva e Downward Drift não são metáforas — são grandezas calculáveis
                            que determinam frequências de equilíbrio. Cada uma tem mecanismo causal, não apenas correlação.
                          </p>
                        </div>
                        <div className={styles.metricGrid}>
                          {metrics.map((metric) => (
                            <article key={metric.label} className={styles.metricCard}>
                              <p className={styles.metricLabel}>{metric.label}</p>
                              <strong className={styles.metricValue}>{metric.value}</strong>
                              <p className={styles.metricDetail}>{metric.detail}</p>
                            </article>
                          ))}
                        </div>
                      </section>

                      {/* Artigo Principal */}
                      <section className="prose prose-invert prose-lg max-w-none">
                        <section className="prose prose-invert prose-lg mx-auto max-w-3xl mb-20 text-slate-300">
                          <h2>Por Que Solvers Não Resolvem Mesa Final</h2>
                          <p className="lead">O gap entre ChipEV e $EV como fonte de edge inexplorado.</p>

                          <p>
                            Solvers maximizam ChipEV — assumem que cada ficha vale o mesmo. Em cash game, isso é correto.
                            Em torneio, é sistematicamente falso: a última ficha (base da stack) vale mais do que a primeira (topo).
                            O <strong>Risk Premium</strong> quantifica essa assimetria por jogador, por spot.
                          </p>
                          <p>
                            Ignorar o RP não é "jogar GTO" — é jogar um jogo diferente do que está acontecendo.
                            Uma c-bet de pot ChipEV-ótima pode ter Esperança Matemática ICM negativa.
                            O jogador que sabe isso eleva check-backs e captura bet pequeno onde o rival sangra equity com overbets.
                          </p>
                          <p>
                            O <strong>ΔRP</strong> (diferencial de Risk Premium entre os dois jogadores) organiza as seis frequências
                            de ação pós-flop: bet, call e fold para IP e OOP. Quem tem RP menor detém vantagem estrutural de risco
                            e pode pressionar com mais frequência. Quem tem RP maior é forçado a defender com frequências menores.
                          </p>
                          <p>
                            O <strong>Downward Drift</strong> é o mecanismo de transmissão: sob RP crescente, a distribuição de
                            apostas migra para sizes menores em cascata. Overbets desaparecem. 2/3 pot vira 1/3. 1/3 vira check.
                            A Perspectiva Matemática — o valor presente do torneio dado o stack atual — governa o quanto de risco
                            cada jogador pode absorver por street.
                          </p>
                        </section>

                        {/* Seção de Arquétipos */}
                        <section className="mt-16">
                          <section className="mb-16 pt-8">
                            <div className="text-center mb-12 max-w-3xl mx-auto">
                              <h3 className="text-3xl font-bold font-heading text-white mb-4">Arquétipos de Colisão</h3>
                            </div>
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

                          {/* Seção de Navegação (Arsenal) */}
                          <section className="mt-16 text-center">
                            <h3 className="text-2xl font-bold font-heading mb-6">Continuar o Estudo</h3>
                            <section className="mt-24 pt-16 border-t border-white/5 text-center max-w-4xl mx-auto">
                              <h3 className="text-2xl font-bold font-heading mb-10 text-white">Continuar o Estudo</h3>
                              <div className={styles.navGrid}>
                                <Link href="/aulas/leitura-icm" className={styles.navCard}>
                                  <i className="fa-solid fa-file-lines" />
                                  <div className={styles.navCardContent}>
                                    <strong>Whitepaper ICM</strong>
                                    <span>Toy-games, RP de ida/volta, Teto do RP</span>
                                  </div>
                                  <i className="fa-solid fa-arrow-right" />
                                </Link>
                                <Link href="/simulador" className={styles.navCard}>
                                  <i className="fa-solid fa-flask" />
                                  <div className={styles.navCardContent}>
                                    <strong>Motor ICM</strong>
                                    <span>Laboratório interativo de RP</span>
                                  </div>
                                  <i className="fa-solid fa-arrow-right" />
                                </Link>
                                <Link href="/aulas/icm-pos-flop" className={styles.navCard}>
                                  <i className="fa-solid fa-graduation-cap" />
                                  <div className={styles.navCardContent}>
                                    <strong>Aula 1.2</strong>
                                    <span>Âncora empírica: HRC vs GTO Wizard</span>
                                  </div>
                                  <i className="fa-solid fa-arrow-right" />
                                </Link>
                                <Link href="/aulas/conceitos-icm" className={styles.navCard}>
                                  <i className="fa-solid fa-book-open" />
                                  <div className={styles.navCardContent}>
                                    <strong>Glossário Formal</strong>
                                    <span>RP, Perspectiva, Esperança, ΔRP</span>
                                  </div>
                                  <i className="fa-solid fa-arrow-right" />
                                </Link>
                              </div>
                            </section>

                          </div>

                          <ContentFooter
                            shareTitle={pageTitle}
                            shareUrl={pageUrl}
                            backLinkHref="/aulas"
                            backLinkText="Voltar para Aulas"
                          />
                        </article>
                      </main>
                      );
}
