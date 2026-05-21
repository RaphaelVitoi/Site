/**
 * IDENTITY: Geometria do Risco — Artigo Teórico Denso
 * PATH: src/app/aulas/icm-masterclass/page.tsx
 * ROLE: Framework matemático do ICM pós-flop. Teoria densa, arquétipos expandidos,
 *       MDF collapse, hierarquia E/P/E, crítica FGS. Layout SOTA.
 * BINDING: [SectionHeader, ContentFooter, globals.css, page.module.css]
 */

import ContentFooter from '@/components/content/ContentFooter';
import JsonLd from '@/components/seo/JsonLd';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import Link from 'next/link';
import styles from './page.module.css';

export const metadata = {
  title: 'Geometria do Risco | Raphael Vitoi',
  description: 'O framework matemático do ICM pós-flop: Risk Premium, ΔRP, Perspectiva Matemática, Esperança, Downward Drift, MDF collapse e arquétipos de colisão.',
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'Geometria do Risco: O Framework Matemático do ICM Pós-Flop',
  description: 'Uma desconstrução profunda da física do poker sob pressão de ICM, introduzindo conceitos de Risk Premium e Perspectiva Matemática.',
  author: {
    '@type': 'Person',
    name: 'Raphael Vitoi'
  },
  keywords: 'ICM, Poker Theory, Game Theory, Risk Premium, Post-flop ICM'
};

const metrics = [
  {
    label: 'Assimetria Fundamental',
    value: 'Fichas perdidas > ganhas',
    detail: 'Em ICM, cada ficha perdida destrói mais Perspectiva do que uma ficha ganha constrói. A base da stack vale mais que o topo — concavidade irredutível. É a origem de toda distorção.',
  },
  {
    label: 'Risk Premium (RP)',
    value: '0% a ~24%',
    detail: 'A equity adicional, acima das pot odds puras, necessária para justificar um call. Se as pot odds exigem 33% e o RP é 12%, o jogador precisa de 45% de equity real. A maioria das mãos marginais evapora.',
  },
  {
    label: 'Bubble Factor (BF)',
    value: 'Multiplicador da Dor',
    detail: 'BF = Loss / Gain em ICM equity. Um BF de 1.5 significa que perder custa 50% a mais do que ganhar vale. Escala assimétrica: cresce assintoticamente (1.27, 2.5, 15). RP = 100 × (BF − 1) / BF.',
  },
  {
    label: 'ΔRP — Diferencial de Risco',
    value: 'RP_IP − RP_OOP',
    detail: 'Quanto a maior stack (RP menor) pode agredir proporcionalmente, e o teto abstrativo de defesa para a stack menor (RP maior). Organiza as seis frequências de ação pós-flop.',
  },
  {
    label: 'Downward Drift',
    value: 'RP↑ → Sizing↓',
    detail: "Princípio de O'Kearney & Carter: sob pressão ICM crescente, apostas grandes migram para menores, que migram para checks. A distribuição inteira desloca um degrau para baixo em cascata.",
  },
  {
    label: 'Regra de Ouro da Assimetria',
    value: 'RPs nunca são iguais',
    detail: 'Em qualquer colisão, um jogador detém Vantagem de Risco (RP menor) e o outro sofre Desvantagem de Risco (RP maior). Essa fricção invisível dita quem pode blefar e quem é forçado ao fold.',
  },
];

export default function AulaICMPage () {
  const pageUrl = "https://www.pokerracional.com/aulas/icm-masterclass";
  const pageTitle = "Geometria do Risco | Raphael Vitoi";

  return (
    <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body">
      <JsonLd data={ articleSchema } />

      {/* Header Central de Página */ }
      <div className="max-w-300 mx-auto px-6 pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[clamp(1.4rem,3vw,2rem)] font-black m-0 tracking-tight bg-linear-to-r from-text-main to-text-muted bg-clip-text text-transparent font-heading">
              Geometria do Risco
            </h1>
            <p className="m-0 mt-2 text-[0.75rem] text-text-muted leading-relaxed max-w-155">
              A desconstrução do pós-flop sob a ótica do ICM. Mapeamento estrutural da colisão
              através do Risk Premium, Perspectiva Matemática e a mecânica oculta que subverte a teoria clássica.
            </p>
            <div className="flex items-center gap-3 mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-indigo/15 border border-accent-indigo/30 text-[0.65rem] font-bold text-accent-indigo-light uppercase tracking-wider font-mono">
                <span className="w-2 h-2 rounded-full bg-accent-emerald shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                { ' ' }Modelagem
              </span>
              <span className="text-[0.7rem] text-text-light font-bold font-mono uppercase tracking-widest">
                Teoria Aplicada
              </span>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <Link href="/" className="px-3 py-1.5 rounded-lg bg-bg-elevated/60 border border-white/5 text-text-muted text-[0.7rem] font-semibold flex items-center gap-1.5 transition-all hover:text-text-bright hover:bg-bg-elevated">
              <i className="fa-solid fa-arrow-left text-[0.65rem]"></i> Início
            </Link>
          </div>
        </div>
      </div>

      {/* Epígrafe */ }
      <div className="max-w-300 mx-auto px-6 pb-8">
        <div className={ styles.epigraph }>
          <blockquote className="border-l-4 border-accent-indigo pl-8 my-8 italic text-text-bright text-lg">
            O poker é uma ciência de informação incompleta jogada por humanos falhos.
            Acreditamos dominar a matemática, mas frequentemente somos traídos por aplicar
            a equação certa no universo errado. Num cenário de extrema pressão financeira,
            as fichas deixam de ser pedaços de plástico e passam a representar
            a perspectiva de sobrevivência do jogador.{ ' ' }
            <cite className="block mt-4 text-xs font-bold text-text-muted uppercase tracking-widest not-italic font-mono">— Raphael Vitoi, A Geometria do Risco</cite>
          </blockquote>
        </div>
      </div>

      {/* 01: Grandezas do Sistema */ }
      <SectionHeader
        step="01"
        label="Fundamentos"
        title="Grandezas do Sistema"
        description="RP, BF, ΔRP, Perspectiva e Downward Drift não são metáforas — são grandezas calculáveis com mecanismo causal. São elas que determinam as frequências de equilíbrio, não a força das cartas."
      />
      <div className="max-w-300 mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          { metrics.map( ( metric ) => (
            <GlassPanel key={ metric.label } className="p-6" hoverable>
              <p className="text-accent-indigo-light text-[0.65rem] font-black uppercase tracking-widest mb-2 font-mono">{ metric.label }</p>
              <strong className="text-text-bright text-lg block mb-3 font-heading">{ metric.value }</strong>
              <p className="text-text-dim text-sm leading-relaxed m-0">{ metric.detail }</p>
            </GlassPanel>
          ) ) }
        </div>
      </div>

      {/* 02: O Paradigma do ChipEV */ }
      <SectionHeader
        step="02"
        label="Doutrina"
        title="A Ilusão do Vácuo"
        description="O gap entre ChipEV e $EV como fonte de edge inexplorado. Por que solvers tradicionais não resolvem mesas finais e como a matemática oculta subverte a teoria clássica."
      />
      <div className="max-w-300 mx-auto px-6 pb-12">
        <GlassPanel className="p-8 sm:p-12 lg:p-16">
          <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
            <p>
              Solvers maximizam ChipEV — assumem que cada ficha vale o mesmo. Em cash game, isso é correto.
              Em torneio, é sistematicamente falso: a última ficha (base da stack) vale mais do que a primeira (topo).
              O <strong className="text-text-bright">Risk Premium</strong> quantifica essa assimetria por jogador, por spot. Ignorar o RP não é
              &ldquo;jogar GTO&rdquo; — é jogar um jogo diferente do que está acontecendo.
            </p>
            <p>
              O ser humano constrói memória muscular ao longo de milhares de mãos jogadas nas fases iniciais
              de torneios ou em Cash Games, onde a utilidade das fichas é perfeitamente linear (o chamado
              &ldquo;Vácuo Matemático&rdquo;). Quando atingem a mesa final, tentam usar o mesmo instinto.
              É uma falácia cognitiva catastrófica.
            </p>

            <div className="bg-accent-amber/10 border-l-4 border-accent-amber p-8 my-10 rounded-r-2xl">
              <h4 className="mt-0 text-accent-amber font-bold text-lg mb-4 font-heading">Distinção Crítica: HU Pot vs. HU Final</h4>
              <p className="text-text-main m-0 leading-relaxed">
                Um pote jogado heads-up (2-way) numa mesa que ainda possui 9 jogadores ativos <strong className="text-text-bright">continua
                  sujeito a pressões letais de ICM</strong> — a presença, passividade e valuation das stacks restantes
                impõem distorção. O risco não está apenas na mão que o jogador segura, mas na sombra dos adversários
                que observam.
              </p>
              <p className="text-text-main mt-4 m-0 leading-relaxed">
                Quando o torneio atinge o confronto final (Top 2), o modelo reverte para <strong className="text-text-bright">ChipEV puro</strong>.
                Sem adversários para originar laddering, a utilidade de cada ficha torna-se linear e proporcional
                à disputa pelo delta residual entre 1&ordm; e 2&ordm; lugar. Este é o único cenário de
                Winner-Takes-All legítimo.
              </p>
            </div>

            <p>
              O <strong className="text-text-bright">&Delta;RP</strong> (diferencial de Risk Premium entre os dois jogadores) organiza as seis frequências
              de ação pós-flop: bet, call e fold para IP e OOP. Quem tem RP menor detém vantagem estrutural de risco
              e pode pressionar com mais frequência. Quem tem RP maior é forçado a defender com frequências menores.
            </p>
            <p>
              O <strong className="text-text-bright">Downward Drift</strong> (O&apos;Kearney &amp; Carter) é o mecanismo de transmissão: sob RP crescente,
              a distribuição de apostas migra para sizes menores em cascata. Overbets desaparecem. 2/3 pot vira 1/3.
              1/3 vira check. A <strong className="text-text-bright">Perspectiva Matemática</strong> — a distribuição de probabilidade sobre os outcomes
              do torneio dado o estado dinâmico da mesa — governa o quanto de risco cada jogador pode absorver por street.
            </p>

            <div className="bg-accent-emerald/10 border-l-4 border-accent-emerald p-8 my-10 rounded-r-2xl">
              <h4 className="mt-0 text-accent-emerald font-bold text-lg mb-4 font-heading">Hierarquia da Decisão</h4>
              <p className="font-mono text-sm text-accent-indigo-light leading-loose mb-0">
                ICM<sub>ev</sub> (snapshot) &rarr; Esperança (ganho em &Delta;Perspectiva) &rarr;
                Expectativa (cadeia preditiva FGS) &rarr; Perspectiva (síntese definitiva)
              </p>
              <p className="text-text-main mt-4 m-0 leading-relaxed">
                A decisão ótima maximiza a Esperança Matemática (ganho em Perspectiva), não o ICM EV
                do pote isolado. A Expectativa captura consequências encadeadas que a Esperança imediata não alcança.
                A Perspectiva é a métrica final que subsume todas as anteriores.
              </p>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* 03: Arquétipos de Colisão — Expandidos */ }
      <SectionHeader
        step="03"
        label="Taxonomia"
        title="Arquétipos Clínicos de Colisão"
        description="5 padrões comportamentais mapeados a partir de matrizes reais do HRC. Cada um expõe um paradoxo do ChipEV e sua resolução via ICM."
      />
      <div className="max-w-300 mx-auto px-6 pb-12">
        <div className="space-y-8">

          {/* Arquétipo I */ }
          <GlassPanel className="relative p-8 sm:p-10 border-l-4 border-l-accent-indigo">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-16 h-16 rounded-2xl bg-accent-indigo/15 text-accent-indigo-light flex items-center justify-center text-2xl shrink-0">
                <i className="fa-solid fa-shield-halved" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[0.65rem] font-black uppercase text-accent-indigo-light tracking-widest font-mono">Arquétipo I</span>
                  <div className="px-2 py-0.5 rounded bg-accent-indigo/10 text-accent-indigo-light text-[0.6rem] font-bold flex items-center gap-1.5 font-mono">
                    <i className="fa-solid fa-users text-[0.55rem]" /> CL (70bb) vs Vice CL (65bb) + mesa de micro-stacks
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-6 text-text-bright font-heading">O Pacto Silencioso (Evitação de Ruína)</h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                    <strong className="text-accent-secondary text-[0.65rem] uppercase tracking-widest block mb-3 font-mono">O Paradoxo</strong>
                    <p className="text-text-muted text-sm leading-relaxed m-0 font-body">
                      Em ChipEV, duas stacks gigantes em posições finais atacar-se-iam impiedosamente. No ICM, o RP de ambos ultrapassa a barreira letal
                      dos <strong className="text-text-bright">20%</strong>. A agressão pré-flop (3-bet linear e polar) <strong className="text-text-bright text-shadow-glow">praticamente desaparece</strong>.
                    </p>
                  </div>
                  <div className="bg-accent-emerald/5 p-6 rounded-xl border border-accent-emerald/10">
                    <strong className="text-accent-emerald text-[0.65rem] uppercase tracking-widest block mb-3 font-mono">Resolução Nash</strong>
                    <p className="text-text-muted text-sm leading-relaxed m-0 font-body">
                      Um choque direto aniquila a Esperança Matemática de ambos e doa o prizepool de graça aos shorts.
                      Os ranges de flat call inflam massivamente — incluindo o topo (<strong className="text-text-bright">AK, QQ</strong>).
                      O foco transita para o pós-flop: caçar um cooler investindo o mínimo. Traps são <strong className="text-text-bright">mecanismos vitais</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </GlassPanel>

          {/* Arquétipo II */ }
          <GlassPanel className="relative p-8 sm:p-10 border-l-4 border-l-accent-secondary">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-16 h-16 rounded-2xl bg-accent-secondary/15 text-accent-rose flex items-center justify-center text-2xl shrink-0">
                <i className="fa-solid fa-scale-unbalanced" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[0.65rem] font-black uppercase text-accent-rose tracking-widest font-mono">Arquétipo II</span>
                  <div className="px-2 py-0.5 rounded bg-accent-secondary/10 text-accent-rose text-[0.6rem] font-bold flex items-center gap-1.5 font-mono">
                    <i className="fa-solid fa-crosshairs text-[0.55rem]" /> BTN (40bb, RP ~21.4%) abre vs BB (54bb, RP ~12.9%)
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-6 text-text-bright font-heading">O Paradoxo do Valuation (Mid vs Big)</h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                    <strong className="text-accent-secondary text-[0.65rem] uppercase tracking-widest block mb-3 font-mono">O Paradoxo</strong>
                    <p className="text-text-muted text-sm leading-relaxed m-0 font-body">
                      O jogador de 40bb acredita que, por possuir a segunda maior stack, pode imprimir overbluffs implacáveis. Parece lógico em ChipEV — mas a assimetria de RP torna isso suicida.
                    </p>
                  </div>
                  <div className="bg-accent-emerald/5 p-6 rounded-xl border border-accent-emerald/10">
                    <strong className="text-accent-emerald text-[0.65rem] uppercase tracking-widest block mb-3 font-mono">Resolução Nash</strong>
                    <p className="text-text-muted text-sm leading-relaxed m-0 font-body">
                      O HRC prova o oposto. O RP do BTN (<strong className="text-text-bright">~21.4%</strong>) é quase o dobro do BB.
                      O BB sobrevive à colisão. O BTN, se errar um hero-bluff, colapsa para <strong className="text-text-bright">dead last</strong>.
                      O BB impõe o ritmo pela <strong className="text-text-bright">imunidade à morte</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </GlassPanel>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Arquétipo III */ }
            <GlassPanel className="p-8 border-l-4 border-l-accent-emerald" hoverable>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[0.6rem] font-black uppercase text-accent-emerald tracking-widest font-mono">Arquétipo III</span>
                <i className="fa-solid fa-skull text-accent-emerald" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-text-bright font-heading">A Guerra na Lama</h3>
              <p className="text-text-dim text-sm leading-relaxed mb-6 font-body">
                Dois ~10bb numa mesa de colossos. Intuição diz &quot;nada a perder&quot;. Falso.
                O <strong className="text-text-bright">laddering passivo</strong> impera: cruzar os braços rende dinheiro limpo.
                O RP ancora em <strong className="text-text-bright">~7% a 10%</strong>. A Perspectiva residual vale a proteção.
              </p>
            </GlassPanel>

            {/* Arquétipo IV */ }
            <GlassPanel className="p-8 border-l-4 border-l-accent-amber" hoverable>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[0.6rem] font-black uppercase text-accent-amber tracking-widest font-mono">Arquétipo IV</span>
                <i className="fa-solid fa-crown text-accent-amber" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-text-bright font-heading">A Ameaça Orgânica</h3>
              <p className="text-text-dim text-sm leading-relaxed mb-6 font-body">
                CL absoluto vs Vice. O CL não briga por fichas — briga por <strong className="text-text-bright">Perspectiva Matemática</strong>.
                Dobrar o Vice é armar o único usurpador real. O modelo impõe um RP de <strong className="text-text-bright">~12%</strong> ao próprio líder.
              </p>
            </GlassPanel>
          </div>

          {/* Arquétipo V */ }
          <GlassPanel className="p-8 sm:p-10 border-l-4 border-l-accent-red-strong bg-linear-to-r from-accent-red/5 to-transparent">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[0.65rem] font-black uppercase text-accent-red tracking-widest font-mono">Arquétipo V</span>
              <i className="fa-solid fa-fire text-accent-red" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-text-bright font-heading">A Transferência do Risco (Efeito Batata Quente)</h3>
            <p className="text-text-muted text-base leading-relaxed max-w-3xl font-body">
              Open-Shove de 20bb transfere o peso volitivo para o defensor. O BB é privado de re-agressão,
              forçando o <strong className="text-text-bright">limite de dor a colapsar</strong>. O agressor explora a
              biologia da aversão à perda: a decisão binária amplifica o custo psicológico da defesa.
            </p>
          </GlassPanel>

        </div>
      </div>

      {/* 04: O Fim do MDF */ }
      <SectionHeader
        step="04"
        label="Ruptura"
        title="O Colapso do MDF e a Inércia Humana"
        description="O Minimum Defense Frequency quebra sob ICM. O bluffcatcher atinge o teto de dor. O IP oprime. E o fator humano cria especulação assimétrica."
      />
      <div className="max-w-300 mx-auto px-6 pb-12">
        <GlassPanel className="p-8 sm:p-12 lg:p-16 border-white/5 shadow-rose-500/5">
          <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">

            <h3 className="text-2xl font-bold mt-0 mb-4 text-text-bright font-heading">O Teto de Dor do Bluffcatcher</h3>
            <p>
              Contra uma pot-size bet no river, o ChipEV dita defesa mínima de <strong className="text-text-bright">50%</strong> (MDF).
              Sob ICM, essa defesa quebra vertiginosamente para <strong className="text-text-bright">~30% a 38%</strong>.
              A necessidade de retenção de equity é suplantada pela dor financeira da eliminação.
            </p>
            <p>
              Não é fraqueza, é o teto natural da defesa quando cada ficha perdida destrói mais Perspectiva
              do que preserva.
            </p>

            <div className="bg-bg-elevated/80 border-l-4 border-accent-secondary p-8 my-10 rounded-xl shadow-lg">
              <h4 className="mt-0 text-accent-secondary font-bold text-lg mb-2 font-heading">Validação GTO Wizard (2025)</h4>
              <p className="m-0 italic text-sm leading-relaxed">
                Os artigos &ldquo;MDF vs ICM&rdquo; e &ldquo;How ICM Impacts Postflop Strategy&rdquo;
                confirmam independentemente: o MDF quebra sob ICM, o covering player é mais agressivo,
                o Downward Drift se manifesta, e large bets são suprimidas.
              </p>
            </div>

            <h3 className="text-2xl font-bold mt-12 mb-4 text-text-bright font-heading">A Opressão do IP</h3>
            <p>
              Se o jogador In Position tiver uma imensa Vantagem de Risco, o seu Alpha (teto ótimo de bluffs)
              <strong className="text-text-bright">aumenta para níveis superiores a 33.3%</strong>.
              Aqui o ICM torna-se <strong className="text-accent-emerald">mais agressivo</strong> que o ChipEV, rompendo o teto convencional.
            </p>

            <h3 className="text-2xl font-bold mt-12 mb-4 text-text-bright font-heading">A Inércia Humana e a Especulação Assimétrica</h3>
            <p>
              Humanos apresentam um <strong className="text-text-bright">défice crônico de agressão</strong> no turn e no river.
              Adotamos uma <strong className="text-text-bright text-shadow-glow">Expansão Passiva</strong>: aumentamos os calls no pré-flop e flop por
              <strong className="text-text-bright">Implied Odds de ICM</strong> — especulamos barato sabendo que o vilão não forçará o Teto do RP.
            </p>
          </div>
        </GlassPanel>
      </div>

      {/* 05: Conclusão */ }
      <SectionHeader
        step="05"
        label="Síntese"
        title="A Tríade da Adaptação"
        description="Solvers são bússolas, não destinos. O edge de elite está na interpretação humana do ecossistema, ajustando o RP às falhas emocionais dos oponentes."
      />
      <div className="max-w-300 mx-auto px-6 pb-12">
        <GlassPanel className="p-8 sm:p-12 lg:p-16 border-accent-emerald/20 shadow-emerald-500/5">
          <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
            <p>
              O verdadeiro edge de elite está em compreender a <strong className="text-text-bright">Elasticidade do Risk Premium no pós-flop</strong> e atuar sobre a abstração do jogo.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
              <div className="p-6 rounded-xl bg-accent-indigo/5 border border-accent-indigo/10">
                <p className="m-0 text-sm leading-relaxed">
                  <i className="fa-solid fa-shield-halved text-accent-indigo-light mr-2" />
                  <strong className="text-text-bright block mb-2 font-heading">Leitura de Inércia</strong>
                  Saber quando o oponente destrói seu próprio Teto de Agressão, expandindo a defesa passiva.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-accent-emerald/5 border border-accent-emerald/10">
                <p className="m-0 text-sm leading-relaxed">
                  <i className="fa-solid fa-handshake text-accent-emerald mr-2" />
                  <strong className="text-text-bright block mb-2 font-heading">Exploração Silenciosa</strong>
                  Roubar potes a gigantes aterrorizados pela sombra da eliminação mútua (Pacto Silencioso).
                </p>
              </div>
              <div className="p-6 rounded-xl bg-accent-secondary/5 border border-accent-secondary/10">
                <p className="m-0 text-sm leading-relaxed">
                  <i className="fa-solid fa-fire text-accent-rose mr-2" />
                  <strong className="text-text-bright block mb-2 font-heading">Expansão de Variância</strong>
                  Saber quando a Guerra na Lama exige agressão para alcançar os lugares cimeiros.
                </p>
              </div>
            </div>

            <p className="text-xl font-medium text-text-bright leading-relaxed text-center max-w-3xl mx-auto mt-12 italic border-t border-white/5 pt-10">
              Na mesa final, a responsabilidade de cada jogador não é provar coragem nem testar instintos —
              é <strong className="text-accent-indigo-light not-italic">realizar a Perspectiva Matemática daquela stack específica</strong>.
            </p>
          </div>
        </GlassPanel>
      </div>

      {/* 06: Navegação e Hub */ }
      <SectionHeader
        step="06"
        label="Arsenal"
        title="Navegação e Hub"
        description="Continue aprofundando o estudo no laboratório ou através da matriz teórica principal."
      />
      <div className="max-w-300 mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          { [
            { href: "/aulas/leitura-icm", icon: "fa-file-lines", title: "Whitepaper ICM", desc: "RP vs BF, E/P/E" },
            { href: "/simulador", icon: "fa-flask", title: "Motor ICM", desc: "Laboratório interativo" },
            { href: "/aulas/icm-pos-flop", icon: "fa-graduation-cap", title: "Aula 1.2", desc: "Âncora Empírica" },
            { href: "/aulas/conceitos-icm", icon: "fa-book-open", title: "Glossário", desc: "Definições Formais" }
          ].map( card => (
            <Link key={ card.href } href={ card.href } className="flex items-center gap-4 p-5 bg-bg-elevated/40 border border-white/5 rounded-xl transition-all hover:bg-bg-elevated hover:border-accent-indigo/30 group">
              <i className={ `fa-solid ${card.icon} text-accent-indigo text-lg group-hover:scale-110 transition-transform` } />
              <div>
                <strong className="text-text-bright text-xs block font-heading">{ card.title }</strong>
                <span className="text-text-dim text-[0.65rem]">{ card.desc }</span>
              </div>
              <i className="fa-solid fa-arrow-right text-text-dim text-[0.6rem] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ) ) }
        </div>
      </div>

      {/* Referências e Atribuições */ }
      <div className="max-w-300 mx-auto px-6 pb-20">
        <GlassPanel className="p-8 border-white/5 shadow-none">
          <h4 className="m-0 mb-6 text-[0.65rem] font-black text-text-muted uppercase tracking-[0.2em] font-heading">
            Referências e Atribuições
          </h4>
          <ul className="m-0 pl-5 list-disc space-y-4 text-[0.7rem] text-text-dim leading-relaxed font-body">
            <li>
              <strong className="text-text-muted">Downward Drift</strong>{ ' ' }— conceito de Dara O&apos;Kearney &amp; Barry Carter, <em>Endgame Poker Strategy: The ICM Book</em>. A quantificação via coeficientes k<sub>A</sub> e expoente côncavo b é extensão original deste framework.
            </li>
            <li>
              <strong className="text-text-muted">ICM (Independent Chip Model)</strong>{ ' ' }— algoritmo de Malmuth-Harville. Base computacional de todo o motor.
            </li>
            <li>
              <strong className="text-text-muted">Dados de calibração</strong>{ ' ' }— 93 nodes HRC vs GTO Wizard (Aula 1.2). Validação parcial via <em>GTO Wizard Blog</em> (2025).
            </li>
            <li>
              <strong className="text-text-muted">Framework original</strong>{ ' ' }— Perspectiva Matemática, Esperança Matemática, Expectativa Matemática, &Delta;RP, equação côncava de distorção ICM, arquétipos de colisão, Abstenção Estrutural GTO, Inversão de Extremos, Especulação Assimétrica, Efeito Irradiação, Fold Estrutural: Raphael Vitoi (2025-2026).
            </li>
          </ul>
        </GlassPanel>
      </div>

      <div className="max-w-300 mx-auto px-6 pb-12">
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
