/**
 * IDENTITY: Geometria do Risco — Artigo Teórico
 * PATH: src/app/aulas/icm-masterclass/page.tsx
 * ROLE: Framework matemático do ICM pós-flop. Teoria densa e layout SOTA.
 */

import ContentFooter from '@/components/content/ContentFooter';
import { SectionHeader } from '@/components/ui/SectionHeader';
import Link from 'next/link';
import styles from './page.module.css';

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
  {
    id: '05',
    icon: 'fa-fire',
    title: 'Transferência do Risco',
    text: 'Open-Shove de 20bb não é apenas uma aposta — é uma transferência de peso volitivo. O agressor acopla Fold Equity ao RP e retira do BB a capacidade de re-agressão. O defensor colapsa para overfold matemático forçado pelo custo binário da eliminação.',
    tone: 'rgba(239,68,68,0.2)',
  },
];

export default function AulaICMPage () {
  const pageUrl = "https://www.pokerracional.com/aulas/icm-masterclass";
  const pageTitle = "Geometria do Risco | Raphael Vitoi";

  return (
    <div style={ { minHeight: '100vh', background: '#020617', color: '#e2e8f0', overflowX: 'hidden' } }>

      {/* Header Central de Página */ }
      <div style={ { maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1.5rem 0' } }>
        <div style={ { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' } }>
          <div>
            <h1 style={ {
              fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, margin: 0,
              letterSpacing: '-0.03em', background: 'linear-gradient(to right, #fff, #94a3b8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            } }>
              Geometria de Risco
            </h1>
            <p style={ { margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: '580px' } }>
              Mapeamento estrutural da colisão através de abstrações sistêmicas. Compreenda a assimetria das variáveis que distorcem o Risk Premium em situações extremas.
            </p>
            <div style={ { display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.8rem' } }>
              <span style={ {
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '0.35rem 0.75rem', borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)',
                fontSize: '0.65rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em',
              } }>
                <span style={ { width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.5)' } } />
                { ' ' }Modelagem
              </span>
              <span style={ { fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" } }>
                Teoria Aplicada
              </span>
            </div>
          </div>

          <div style={ { display: 'flex', gap: '0.5rem', alignItems: 'center' } }>
            <Link href="/" style={ {
              padding: '0.4rem 0.75rem', borderRadius: '8px', background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.06)', color: '#94a3b8', fontSize: '0.7rem',
              fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px',
            } }>
              <i className="fa-solid fa-arrow-left" style={ { fontSize: '0.65rem' } }></i> Início
            </Link>
          </div>
        </div>
      </div>

      <SectionHeader
        step="01"
        label="Fundamentos"
        title="Grandezas do Sistema"
        description="RP, ΔRP, Perspectiva e Downward Drift não são metáforas — são grandezas calculáveis que determinam frequências de equilíbrio. Cada uma tem mecanismo causal, não apenas correlação."
      />
      <div style={ { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' } }>
        <div className={ styles.metricGrid }>
          { metrics.map( ( metric ) => (
            <article key={ metric.label } className={ styles.metricCard }>
              <p className={ styles.metricLabel }>{ metric.label }</p>
              <strong className={ styles.metricValue }>{ metric.value }</strong>
              <p className={ styles.metricDetail }>{ metric.detail }</p>
            </article>
          ) ) }
        </div>
      </div>

      <SectionHeader
        step="02"
        label="Doutrina"
        title="O Paradigma do ChipEV"
        description="O gap entre ChipEV e $EV como fonte de edge inexplorado. Por que os solvers tradicionais não resolvem mesas finais e como a matemática oculta subverte a teoria clássica."
      />
      <div style={ { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' } }>
        <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-emerald-500/10 rounded-2xl">
          <div className="prose prose-invert prose-lg max-w-none text-slate-300">
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
          </div>
        </div>
      </div>

      <SectionHeader
        step="03"
        label="Taxonomia"
        title="Arquétipos de Colisão"
        description="Padrões comportamentais mapeados. A topologia de conflitos na mesa final é regida pelo arranjo das stacks e a densidade da pressão."
      />
      <div style={ { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' } }>
        <div className={ styles.archetypeGrid }>
          { archetypes.map( ( { id, icon, title, text, tone } ) => (
            <article key={ id } className={ styles.archetypeCard }>
              <div className={ styles.archetypeHeader }>
                <div className={ styles.archetypeIcon } style={ { background: tone } }>
                  <i className={ `fa-solid ${icon}` } />
                </div>
                <span className={ styles.archetypeId }>{ id }</span>
              </div>
              <h3>{ title }</h3>
              <p>{ text }</p>
            </article>
          ) ) }
        </div>
      </div>

      <SectionHeader
        step="04"
        label="Arsenal"
        title="Navegação e Hub"
        description="Continue aprofundando o estudo no laboratório ou através da matriz teórica principal."
      />
      <div style={ { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' } }>
        <div className={ styles.navGrid }>
          <Link href="/aulas/leitura-icm" className={ styles.navCard }>
            <i className="fa-solid fa-file-lines" />
            <div className={ styles.navCardContent }>
              <strong>Whitepaper ICM</strong>
              <span>Toy-games, RP de ida/volta, Teto do RP</span>
            </div>
            <i className="fa-solid fa-arrow-right" />
          </Link>
          <Link href="/simulador" className={ styles.navCard }>
            <i className="fa-solid fa-flask" />
            <div className={ styles.navCardContent }>
              <strong>Motor ICM</strong>
              <span>Laboratório interativo de RP</span>
            </div>
            <i className="fa-solid fa-arrow-right" />
          </Link>
          <Link href="/aulas/icm-pos-flop" className={ styles.navCard }>
            <i className="fa-solid fa-graduation-cap" />
            <div className={ styles.navCardContent }>
              <strong>Aula 1.2</strong>
              <span>Âncora empírica: HRC vs GTO Wizard</span>
            </div>
            <i className="fa-solid fa-arrow-right" />
          </Link>
          <Link href="/aulas/conceitos-icm" className={ styles.navCard }>
            <i className="fa-solid fa-book-open" />
            <div className={ styles.navCardContent }>
              <strong>Glossário Formal</strong>
              <span>RP, Perspectiva, Esperança, ΔRP</span>
            </div>
            <i className="fa-solid fa-arrow-right" />
          </Link>
        </div>
      </div>

      <div style={ { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' } }>
        <ContentFooter
          shareTitle={ pageTitle }
          shareUrl={ pageUrl }
          backLinkHref="/aulas"
          backLinkText="Voltar para Aulas"
        />
      </div>
    </div>
  );
}
