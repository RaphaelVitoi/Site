/**
 * IDENTITY: Geometria do Risco â€” Artigo TeÃ³rico Denso
 * PATH: src/app/aulas/icm-masterclass/page.tsx
 * ROLE: Framework matemÃ¡tico do ICM pÃ³s-flop. Teoria densa, arquÃ©tipos expandidos,
 *       MDF collapse, hierarquia E/P/E, crÃ­tica FGS. Layout SOTA.
 * BINDING: [SectionHeader, ContentFooter, globals.css, page.module.css]
 */

import ContentFooter from '@/components/content/ContentFooter';
import JsonLd from '@/components/seo/JsonLd';
import DownwardDriftSimulatorDynamic from '@/components/simulator/DownwardDriftSimulatorDynamic';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import Link from 'next/link';
import styles from './page.module.css';

export const metadata = {
  title: 'Geometria do Risco | Raphael Vitoi',
  description: 'O framework matemÃ¡tico do ICM pÃ³s-flop: Risk Premium, Î”RP, Perspectiva MatemÃ¡tica, EsperanÃ§a, Downward Drift, MDF collapse e arquÃ©tipos de colisÃ£o.',
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'Geometria do Risco: O Framework MatemÃ¡tico do ICM PÃ³s-Flop',
  description: 'Uma desconstruÃ§Ã£o profunda da fÃ­sica do poker sob pressÃ£o de ICM, introduzindo conceitos de Risk Premium e Perspectiva MatemÃ¡tica.',
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
    detail: 'Em ICM, cada ficha perdida destrÃ³i mais Perspectiva do que uma ficha ganha constrÃ³i. A base da stack vale mais que o topo â€” concavidade irredutÃ­vel. Ã‰ a origem de toda distorÃ§Ã£o.',
  },
  {
    label: 'Risk Premium (RP)',
    value: '0% a ~24%',
    detail: 'A equity adicional, acima das pot odds puras, necessÃ¡ria para justificar um call. Se as pot odds exigem 33% e o RP Ã© 12%, o jogador precisa de 45% de equity real. A maioria das mÃ£os marginais evapora.',
  },
  {
    label: 'Bubble Factor (BF)',
    value: 'Multiplicador da Dor',
    detail: 'BF = Loss / Gain em ICM equity. Um BF de 1.5 significa que perder custa 50% a mais do que ganhar vale. Escala assimÃ©trica: cresce assintoticamente (1.27, 2.5, 15). RP = 100 Ã— (BF âˆ’ 1) / BF.',
  },
  {
    label: 'Î”RP â€” Diferencial de Risco',
    value: 'RP_IP âˆ’ RP_OOP',
    detail: 'Quanto a maior stack (RP menor) pode agredir proporcionalmente, e o teto abstrativo de defesa para a stack menor (RP maior). Organiza as seis frequÃªncias de aÃ§Ã£o pÃ³s-flop.',
  },
  {
    label: 'Downward Drift',
    value: 'RPâ†‘ â†’ Sizingâ†“',
    detail: "PrincÃ­pio de O'Kearney & Carter: sob pressÃ£o ICM crescente, apostas grandes migram para menores, que migram para checks. A distribuiÃ§Ã£o inteira desloca um degrau para baixo em cascata.",
  },
  {
    label: 'Regra de Ouro da Assimetria',
    value: 'RPs nunca sÃ£o iguais',
    detail: 'Em qualquer colisÃ£o, um jogador detÃ©m Vantagem de Risco (RP menor) e o outro sofre Desvantagem de Risco (RP maior). Essa fricÃ§Ã£o invisÃ­vel dita quem pode blefar e quem Ã© forÃ§ado ao fold.',
  },
];

export default function AulaICMPage () {
  const pageUrl = "https://www.pokerracional.com/aulas/icm-masterclass";
  const pageTitle = "Geometria do Risco | Raphael Vitoi";

  return (
    <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body">
      <JsonLd data={ articleSchema } />

      {/* Header Central de PÃ¡gina */ }
      <div className="max-w-300 mx-auto px-6 pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[clamp(1.4rem,3vw,2rem)] font-black m-0 tracking-tight bg-linear-to-r from-text-main to-text-muted bg-clip-text text-transparent font-heading">
              Geometria do Risco
            </h1>
            <p className="m-0 mt-2 text-[0.75rem] text-text-muted leading-relaxed max-w-155">
              A desconstruÃ§Ã£o do pÃ³s-flop sob a Ã³tica do ICM. Mapeamento estrutural da colisÃ£o
              atravÃ©s do Risk Premium, Perspectiva MatemÃ¡tica e a mecÃ¢nica oculta que subverte a teoria clÃ¡ssica.
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
              <i className="fa-solid fa-arrow-left text-[0.65rem]"></i> InÃ­cio
            </Link>
          </div>
        </div>
      </div>

      {/* EpÃ­grafe */ }
      <div className="max-w-300 mx-auto px-6 pb-8">
        <div className={ styles.epigraph }>
          <blockquote className="border-l-4 border-accent-indigo pl-8 my-8 italic text-text-bright text-lg">
            O poker Ã© uma ciÃªncia de informaÃ§Ã£o incompleta jogada por humanos falhos.
            Acreditamos dominar a matemÃ¡tica, mas frequentemente somos traÃ­dos por aplicar
            a equaÃ§Ã£o certa no universo errado. Num cenÃ¡rio de extrema pressÃ£o financeira,
            as fichas deixam de ser pedaÃ§os de plÃ¡stico e passam a representar
            a perspectiva de sobrevivÃªncia do jogador.{ ' ' }
            <cite className="block mt-4 text-xs font-bold text-text-muted uppercase tracking-widest not-italic font-mono">â€” Raphael Vitoi, A Geometria do Risco</cite>
          </blockquote>
        </div>
      </div>

      {/* 01: Grandezas do Sistema */ }
      <SectionHeader
        step="01"
        label="Fundamentos"
        title="Grandezas do Sistema"
        description="RP, BF, Î”RP, Perspectiva e Downward Drift nÃ£o sÃ£o metÃ¡foras â€” sÃ£o grandezas calculÃ¡veis com mecanismo causal. SÃ£o elas que determinam as frequÃªncias de equilÃ­brio, nÃ£o a forÃ§a das cartas."
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

        <div className="mt-12">
          <DownwardDriftSimulatorDynamic />
        </div>
      </div>

      {/* 02: O Paradigma do ChipEV */ }
      <SectionHeader
        step="02"
        label="Doutrina"
        title="A IlusÃ£o do VÃ¡cuo"
        description="O gap entre ChipEV e $EV como fonte de edge inexplorado. Por que solvers tradicionais nÃ£o resolvem mesas finais e como a matemÃ¡tica oculta subverte a teoria clÃ¡ssica."
      />
      <div className="max-w-300 mx-auto px-6 pb-12">
        <GlassPanel className="p-8 sm:p-12 lg:p-16">
          <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
            <p>
              Solvers maximizam ChipEV â€” assumem que cada ficha vale o mesmo. Em cash game, isso Ã© correto.
              Em torneio, Ã© sistematicamente falso: a Ãºltima ficha (base da stack) vale mais do que a primeira (topo).
              O <strong className="text-text-bright">Risk Premium</strong> quantifica essa assimetria por jogador, por spot. Ignorar o RP nÃ£o Ã©
              &ldquo;jogar GTO&rdquo; â€” Ã© jogar um jogo diferente do que estÃ¡ acontecendo.
            </p>
            <p>
              O ser humano constrÃ³i memÃ³ria muscular ao longo de milhares de mÃ£os jogadas nas fases iniciais
              de torneios ou em Cash Games, onde a utilidade das fichas Ã© perfeitamente linear (o chamado
              &ldquo;VÃ¡cuo MatemÃ¡tico&rdquo;). Quando atingem a mesa final, tentam usar o mesmo instinto.
              Ã‰ uma falÃ¡cia cognitiva catastrÃ³fica.
            </p>

            <div className="bg-accent-amber/10 border-l-4 border-accent-amber p-8 my-10 rounded-r-2xl">
              <h4 className="mt-0 text-accent-amber font-bold text-lg mb-4 font-heading">DistinÃ§Ã£o CrÃ­tica: HU Pot vs. HU Final</h4>
              <p className="text-text-main m-0 leading-relaxed">
                Um pote jogado heads-up (2-way) numa mesa que ainda possui 9 jogadores ativos <strong className="text-text-bright">continua
                  sujeito a pressÃµes letais de ICM</strong> â€” a presenÃ§a, passividade e valuation das stacks restantes
                impÃµem distorÃ§Ã£o. O risco nÃ£o estÃ¡ apenas na mÃ£o que o jogador segura, mas na sombra dos adversÃ¡rios
                que observam.
              </p>
              <p className="text-text-main mt-4 m-0 leading-relaxed">
                Quando o torneio atinge o confronto final (Top 2), o modelo reverte para <strong className="text-text-bright">ChipEV puro</strong>.
                Sem adversÃ¡rios para originar laddering, a utilidade de cada ficha torna-se linear e proporcional
                Ã  disputa pelo delta residual entre 1&ordm; e 2&ordm; lugar. Este Ã© o Ãºnico cenÃ¡rio de
                Winner-Takes-All legÃ­timo.
              </p>
            </div>

            <p>
              O <strong className="text-text-bright">&Delta;RP</strong> (diferencial de Risk Premium entre os dois jogadores) organiza as seis frequÃªncias
              de aÃ§Ã£o pÃ³s-flop: bet, call e fold para IP e OOP. Quem tem RP menor detÃ©m vantagem estrutural de risco
              e pode pressionar com mais frequÃªncia. Quem tem RP maior Ã© forÃ§ado a defender com frequÃªncias menores.
            </p>
            <p>
              O <strong className="text-text-bright">Downward Drift</strong> (O&apos;Kearney &amp; Carter) Ã© o mecanismo de transmissÃ£o: sob RP crescente,
              a distribuiÃ§Ã£o de apostas migra para sizes menores em cascata. Overbets desaparecem. 2/3 pot vira 1/3.
              1/3 vira check. A <strong className="text-text-bright">Perspectiva MatemÃ¡tica</strong> â€” a distribuiÃ§Ã£o de probabilidade sobre os outcomes
              do torneio dado o estado dinÃ¢mico da mesa â€” governa o quanto de risco cada jogador pode absorver por street.
            </p>

            <div className="bg-accent-emerald/10 border-l-4 border-accent-emerald p-8 my-10 rounded-r-2xl">
              <h4 className="mt-0 text-accent-emerald font-bold text-lg mb-4 font-heading">Hierarquia da DecisÃ£o</h4>
              <p className="font-mono text-sm text-accent-indigo-light leading-loose mb-0">
                ICM<sub>ev</sub> (snapshot) &rarr; EsperanÃ§a (ganho em &Delta;Perspectiva) &rarr;
                Expectativa (cadeia preditiva FGS) &rarr; Perspectiva (sÃ­ntese definitiva)
              </p>
              <p className="text-text-main mt-4 m-0 leading-relaxed">
                A decisÃ£o Ã³tima maximiza a EsperanÃ§a MatemÃ¡tica (ganho em Perspectiva), nÃ£o o ICM EV
                do pote isolado. A Expectativa captura consequÃªncias encadeadas que a EsperanÃ§a imediata nÃ£o alcanÃ§a.
                A Perspectiva Ã© a mÃ©trica final que subsume todas as anteriores.
              </p>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* 03: ArquÃ©tipos de ColisÃ£o â€” Expandidos */ }
      <SectionHeader
        step="03"
        label="Taxonomia"
        title="ArquÃ©tipos ClÃ­nicos de ColisÃ£o"
        description="5 padrÃµes comportamentais mapeados a partir de matrizes reais do HRC. Cada um expÃµe um paradoxo do ChipEV e sua resoluÃ§Ã£o via ICM."
      />
      <div className="max-w-300 mx-auto px-6 pb-12">
        <div className="space-y-8">

          {/* ArquÃ©tipo I */ }
          <GlassPanel className="relative p-8 sm:p-10 border-l-4 border-l-accent-indigo">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-16 h-16 rounded-2xl bg-accent-indigo/15 text-accent-indigo-light flex items-center justify-center text-2xl shrink-0">
                <i className="fa-solid fa-shield-halved" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[0.65rem] font-black uppercase text-accent-indigo-light tracking-widest font-mono">ArquÃ©tipo I</span>
                  <div className="px-2 py-0.5 rounded bg-accent-indigo/10 text-accent-indigo-light text-[0.6rem] font-bold flex items-center gap-1.5 font-mono">
                    <i className="fa-solid fa-users text-[0.55rem]" /> CL (70bb) vs Vice CL (65bb) + mesa de micro-stacks
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-6 text-text-bright font-heading">O Pacto Silencioso (EvitaÃ§Ã£o de RuÃ­na)</h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                    <strong className="text-accent-secondary text-[0.65rem] uppercase tracking-widest block mb-3 font-mono">O Paradoxo</strong>
                    <p className="text-text-muted text-sm leading-relaxed m-0 font-body">
                      Em ChipEV, duas stacks gigantes em posiÃ§Ãµes finais atacar-se-iam impiedosamente. No ICM, o RP de ambos ultrapassa a barreira letal
                      dos <strong className="text-text-bright">20%</strong>. A agressÃ£o prÃ©-flop (3-bet linear e polar) <strong className="text-text-bright text-shadow-glow">praticamente desaparece</strong>.
                    </p>
                  </div>
                  <div className="bg-accent-emerald/5 p-6 rounded-xl border border-accent-emerald/10">
                    <strong className="text-accent-emerald text-[0.65rem] uppercase tracking-widest block mb-3 font-mono">ResoluÃ§Ã£o Nash</strong>
                    <p className="text-text-muted text-sm leading-relaxed m-0 font-body">
                      Um choque direto aniquila a EsperanÃ§a MatemÃ¡tica de ambos e doa o prizepool de graÃ§a aos shorts.
                      Os ranges de flat call inflam massivamente â€” incluindo o topo (<strong className="text-text-bright">AK, QQ</strong>).
                      O foco transita para o pÃ³s-flop: caÃ§ar um cooler investindo o mÃ­nimo. Traps sÃ£o <strong className="text-text-bright">mecanismos vitais</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </GlassPanel>

          {/* ArquÃ©tipo II */ }
          <GlassPanel className="relative p-8 sm:p-10 border-l-4 border-l-accent-secondary">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-16 h-16 rounded-2xl bg-accent-secondary/15 text-accent-rose flex items-center justify-center text-2xl shrink-0">
                <i className="fa-solid fa-scale-unbalanced" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[0.65rem] font-black uppercase text-accent-rose tracking-widest font-mono">ArquÃ©tipo II</span>
                  <div className="px-2 py-0.5 rounded bg-accent-secondary/10 text-accent-rose text-[0.6rem] font-bold flex items-center gap-1.5 font-mono">
                    <i className="fa-solid fa-crosshairs text-[0.55rem]" /> BTN (40bb, RP ~21.4%) abre vs BB (54bb, RP ~12.9%)
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-6 text-text-bright font-heading">O Paradoxo do Valuation (Mid vs Big)</h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                    <strong className="text-accent-secondary text-[0.65rem] uppercase tracking-widest block mb-3 font-mono">O Paradoxo</strong>
                    <p className="text-text-muted text-sm leading-relaxed m-0 font-body">
                      O jogador de 40bb acredita que, por possuir a segunda maior stack, pode imprimir overbluffs implacÃ¡veis. Parece lÃ³gico em ChipEV â€” mas a assimetria de RP torna isso suicida.
                    </p>
                  </div>
                  <div className="bg-accent-emerald/5 p-6 rounded-xl border border-accent-emerald/10">
                    <strong className="text-accent-emerald text-[0.65rem] uppercase tracking-widest block mb-3 font-mono">ResoluÃ§Ã£o Nash</strong>
                    <p className="text-text-muted text-sm leading-relaxed m-0 font-body">
                      O HRC prova o oposto. O RP do BTN (<strong className="text-text-bright">~21.4%</strong>) Ã© quase o dobro do BB.
                      O BB sobrevive Ã  colisÃ£o. O BTN, se errar um hero-bluff, colapsa para <strong className="text-text-bright">dead last</strong>.
                      O BB impÃµe o ritmo pela <strong className="text-text-bright">imunidade Ã  morte</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </GlassPanel>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ArquÃ©tipo III */ }
            <GlassPanel className="p-8 border-l-4 border-l-accent-emerald" hoverable>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[0.6rem] font-black uppercase text-accent-emerald tracking-widest font-mono">ArquÃ©tipo III</span>
                <i className="fa-solid fa-skull text-accent-emerald" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-text-bright font-heading">A Guerra na Lama</h3>
              <p className="text-text-dim text-sm leading-relaxed mb-6 font-body">
                Dois ~10bb numa mesa de colossos. IntuiÃ§Ã£o diz &quot;nada a perder&quot;. Falso.
                O <strong className="text-text-bright">laddering passivo</strong> impera: cruzar os braÃ§os rende dinheiro limpo.
                O RP ancora em <strong className="text-text-bright">~7% a 10%</strong>. A Perspectiva residual vale a proteÃ§Ã£o.
              </p>
            </GlassPanel>

            {/* ArquÃ©tipo IV */ }
            <GlassPanel className="p-8 border-l-4 border-l-accent-amber" hoverable>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[0.6rem] font-black uppercase text-accent-amber tracking-widest font-mono">ArquÃ©tipo IV</span>
                <i className="fa-solid fa-crown text-accent-amber" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-text-bright font-heading">A AmeaÃ§a OrgÃ¢nica</h3>
              <p className="text-text-dim text-sm leading-relaxed mb-6 font-body">
                CL absoluto vs Vice. O CL nÃ£o briga por fichas â€” briga por <strong className="text-text-bright">Perspectiva MatemÃ¡tica</strong>.
                Dobrar o Vice Ã© armar o Ãºnico usurpador real. O modelo impÃµe um RP de <strong className="text-text-bright">~12%</strong> ao prÃ³prio lÃ­der.
              </p>
            </GlassPanel>
          </div>

          {/* ArquÃ©tipo V */ }
          <GlassPanel className="p-8 sm:p-10 border-l-4 border-l-accent-red-strong bg-linear-to-r from-accent-red/5 to-transparent">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[0.65rem] font-black uppercase text-accent-red tracking-widest font-mono">ArquÃ©tipo V</span>
              <i className="fa-solid fa-fire text-accent-red" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-text-bright font-heading">A TransferÃªncia do Risco (Efeito Batata Quente)</h3>
            <p className="text-text-muted text-base leading-relaxed max-w-3xl font-body">
              Open-Shove de 20bb transfere o peso volitivo para o defensor. O BB Ã© privado de re-agressÃ£o,
              forÃ§ando o <strong className="text-text-bright">limite de dor a colapsar</strong>. O agressor explora a
              biologia da aversÃ£o Ã  perda: a decisÃ£o binÃ¡ria amplifica o custo psicolÃ³gico da defesa.
            </p>
          </GlassPanel>

        </div>
      </div>

      {/* 04: O Fim do MDF */ }
      <SectionHeader
        step="04"
        label="Ruptura"
        title="O Colapso do MDF e a InÃ©rcia Humana"
        description="O Minimum Defense Frequency quebra sob ICM. O bluffcatcher atinge o teto de dor. O IP oprime. E o fator humano cria especulaÃ§Ã£o assimÃ©trica."
      />
      <div className="max-w-300 mx-auto px-6 pb-12">
        <GlassPanel className="p-8 sm:p-12 lg:p-16 border-white/5 shadow-rose-500/5">
          <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">

            <h3 className="text-2xl font-bold mt-0 mb-4 text-text-bright font-heading">O Teto de Dor do Bluffcatcher</h3>
            <p>
              Contra uma pot-size bet no river, o ChipEV dita defesa mÃ­nima de <strong className="text-text-bright">50%</strong> (MDF).
              Sob ICM, essa defesa quebra vertiginosamente para <strong className="text-text-bright">~30% a 38%</strong>.
              A necessidade de retenÃ§Ã£o de equity Ã© suplantada pela dor financeira da eliminaÃ§Ã£o.
            </p>
            <p>
              NÃ£o Ã© fraqueza, Ã© o teto natural da defesa quando cada ficha perdida destrÃ³i mais Perspectiva
              do que preserva.
            </p>

            <div className="bg-bg-elevated/80 border-l-4 border-accent-secondary p-8 my-10 rounded-xl shadow-lg">
              <h4 className="mt-0 text-accent-secondary font-bold text-lg mb-2 font-heading">ValidaÃ§Ã£o GTO Wizard (2025)</h4>
              <p className="m-0 italic text-sm leading-relaxed">
                Os artigos &ldquo;MDF vs ICM&rdquo; e &ldquo;How ICM Impacts Postflop Strategy&rdquo;
                confirmam independentemente: o MDF quebra sob ICM, o covering player Ã© mais agressivo,
                o Downward Drift se manifesta, e large bets sÃ£o suprimidas.
              </p>
            </div>

            <h3 className="text-2xl font-bold mt-12 mb-4 text-text-bright font-heading">A OpressÃ£o do IP</h3>
            <p>
              Se o jogador In Position tiver uma imensa Vantagem de Risco, o seu Alpha (teto Ã³timo de bluffs)
              { ' ' }<strong className="text-text-bright">aumenta para nÃ­veis superiores a 33.3%</strong>.
              Aqui o ICM torna-se <strong className="text-accent-emerald">mais agressivo</strong> que o ChipEV, rompendo o teto convencional.
            </p>

            <h3 className="text-2xl font-bold mt-12 mb-4 text-text-bright font-heading">A InÃ©rcia Humana e a EspeculaÃ§Ã£o AssimÃ©trica</h3>
            <p>
              Humanos apresentam um <strong className="text-text-bright">dÃ©fice crÃ´nico de agressÃ£o</strong> no turn e no river.
              Adotamos uma <strong className="text-text-bright text-shadow-glow">ExpansÃ£o Passiva</strong>: aumentamos os calls no prÃ©-flop e flop por
              { ' ' }<strong className="text-text-bright">Implied Odds de ICM</strong> â€” especulamos barato sabendo que o vilÃ£o nÃ£o forÃ§arÃ¡ o Teto do RP.
            </p>
          </div>
        </GlassPanel>
      </div>

      {/* 05: ConclusÃ£o */ }
      <SectionHeader
        step="05"
        label="SÃ­ntese"
        title="A TrÃ­ade da AdaptaÃ§Ã£o"
        description="Solvers sÃ£o bÃºssolas, nÃ£o destinos. O edge de elite estÃ¡ na interpretaÃ§Ã£o humana do ecossistema, ajustando o RP Ã s falhas emocionais dos oponentes."
      />
      <div className="max-w-300 mx-auto px-6 pb-12">
        <GlassPanel className="p-8 sm:p-12 lg:p-16 border-accent-emerald/20 shadow-emerald-500/5">
          <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
            <p>
              O verdadeiro edge de elite estÃ¡ em compreender a <strong className="text-text-bright">Elasticidade do Risk Premium no pÃ³s-flop</strong> e atuar sobre a abstraÃ§Ã£o do jogo.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
              <div className="p-6 rounded-xl bg-accent-indigo/5 border border-accent-indigo/10">
                <p className="m-0 text-sm leading-relaxed">
                  <i className="fa-solid fa-shield-halved text-accent-indigo-light mr-2" />
                  { ' ' }Saber quando o oponente destrÃƒÂ³i seu prÃƒÂ³prio Teto de AgressÃƒÂ£o, expandindo a defesa passiva.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-accent-emerald/5 border border-accent-emerald/10">
                <p className="m-0 text-sm leading-relaxed">
                  <i className="fa-solid fa-handshake text-accent-emerald mr-2" />
                  { ' ' }Roubar potes a gigantes aterrorizados pela sombra da eliminaÃƒÂ§ÃƒÂ£o mÃƒÂºtua (Pacto Silencioso).
                </p>
              </div>
              <div className="p-6 rounded-xl bg-accent-secondary/5 border border-accent-secondary/10">
                <p className="m-0 text-sm leading-relaxed">
                  <i className="fa-solid fa-fire text-accent-rose mr-2" />
                  { ' ' }Saber quando a Guerra na Lama exige agressÃƒÂ£o para alcanÃƒÂ§ar os lugares cimeiros.
                </p>
              </div>
            </div>

            <p className="text-xl font-medium text-text-bright leading-relaxed text-center max-w-3xl mx-auto mt-12 italic border-t border-white/5 pt-10">
              Na mesa final, a responsabilidade de cada jogador nÃ£o Ã© provar coragem nem testar instintos â€”
              Ã© <strong className="text-accent-indigo-light not-italic">realizar a Perspectiva MatemÃ¡tica daquela stack especÃ­fica</strong>.
            </p>
          </div>
        </GlassPanel>
      </div>

      {/* 06: NavegaÃ§Ã£o e Hub */ }
      <SectionHeader
        step="06"
        label="Arsenal"
        title="NavegaÃ§Ã£o e Hub"
        description="Continue aprofundando o estudo no laboratÃ³rio ou atravÃ©s da matriz teÃ³rica principal."
      />
      <div className="max-w-300 mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          { [
            { href: "/aulas/leitura-icm", icon: "fa-file-lines", title: "Whitepaper ICM", desc: "RP vs BF, E/P/E" },
            { href: "/simulador", icon: "fa-flask", title: "Motor ICM", desc: "LaboratÃ³rio interativo" },
            { href: "/aulas/icm-pos-flop", icon: "fa-graduation-cap", title: "Aula 1.2", desc: "Ã‚ncora EmpÃ­rica" },
            { href: "/aulas/conceitos-icm", icon: "fa-book-open", title: "GlossÃ¡rio", desc: "DefiniÃ§Ãµes Formais" }
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

      {/* ReferÃªncias e AtribuiÃ§Ãµes */ }
      <div className="max-w-300 mx-auto px-6 pb-20">
        <GlassPanel className="p-8 border-white/5 shadow-none">
          <h4 className="m-0 mb-6 text-[0.65rem] font-black text-text-muted uppercase tracking-[0.2em] font-heading">
            ReferÃªncias e AtribuiÃ§Ãµes
          </h4>
          <ul className="m-0 pl-5 list-disc space-y-4 text-[0.7rem] text-text-dim leading-relaxed font-body">
            <li>
              <strong className="text-text-muted">Downward Drift</strong>{ ' ' }â€” conceito de Dara O&apos;Kearney &amp; Barry Carter, <em>Endgame Poker Strategy: The ICM Book</em>. A quantificaÃ§Ã£o via coeficientes k<sub>A</sub> e expoente cÃ´ncavo b Ã© extensÃ£o original deste framework.
            </li>
            <li>
              <strong className="text-text-muted">ICM (Independent Chip Model)</strong>{ ' ' }â€” algoritmo de Malmuth-Harville. Base computacional de todo o motor.
            </li>
            <li>
              <strong className="text-text-muted">Dados de calibraÃ§Ã£o</strong>{ ' ' }â€” 93 nodes HRC vs GTO Wizard (Aula 1.2). ValidaÃ§Ã£o parcial via <em>GTO Wizard Blog</em> (2025).
            </li>
            <li>
              <strong className="text-text-muted">Framework original</strong>{ ' ' }â€” Perspectiva MatemÃ¡tica, EsperanÃ§a MatemÃ¡tica, Expectativa MatemÃ¡tica, &Delta;RP, equaÃ§Ã£o cÃ´ncava de distorÃ§Ã£o ICM, arquÃ©tipos de colisÃ£o, AbstenÃ§Ã£o Estrutural GTO, InversÃ£o de Extremos, EspeculaÃ§Ã£o AssimÃ©trica, Efeito IrradiaÃ§Ã£o, Fold Estrutural: Raphael Vitoi (2025-2026).
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
