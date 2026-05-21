/**
 * IDENTITY: Landing Page Principal (Nexus Central)
 * PATH: src/app/page.tsx
 * ROLE: Página de alta conversão. Sales copy + Hub de Conteúdo + Autor + CTA.
 * BINDING: [layout.tsx, globals.css]
 */

import { GlassPanel } from '@/components/ui/GlassPanel';
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
      <section id="hero" className={ `animate-fade-up ${styles.heroContent} flex flex-col items-center text-center py-28 px-6 max-w-4xl mx-auto` }>
        <div className="font-mono text-[0.7rem] font-bold text-text-muted uppercase tracking-[0.15em] mb-4">
          ICM e Risk Premium Pós-Flop</div>
        <h2 className="text-[clamp(2.2rem,5vw,3.5rem)] font-extrabold mb-6 tracking-tight bg-linear-to-br from-white to-indigo-200 bg-clip-text text-transparent font-heading">
          O Edge Mudou de Lugar{ ' ' }
          <span className="block opacity-80 text-[0.6em]">
            Você Ainda Está Jogando o Jogo de 2020?
          </span>
        </h2>
        <p className="text-xl text-text-muted max-w-175 leading-relaxed mt-3 font-body">
          Descubra por que jogar ChipEV em mesas finais está custando, em média,{ ' ' }
          <strong className="text-text-bright">mais de 10% do seu ROI</strong> e como a elite do poker usa o
          &quot;Downward Drift&quot; para dominar o pós-flop em 2026
        </p>

        <div className="flex flex-wrap gap-4 mt-10">
          <Link href="#metodo" className="btn-primary px-10 py-4 text-[0.95rem]">
            Conhecer o Método <i className="fa-solid fa-arrow-right ml-2" />
          </Link>
          <Link href="/aulas/leitura-icm" className="btn-secondary px-10 py-4 text-[0.95rem]">
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
      <div className="max-w-300 mx-auto px-6 mb-12">
        <GlassPanel className="p-8 sm:p-12 lg:p-16">
          <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
            <p>Se você é como a maioria dos regulares de MTT, você aprendeu que o ICM é um interruptor que &quot;liga&quot; na bolha ou na mesa final. Você estudou tabelas de Push/Fold. Você domina o HRC e o ICMIZER. Você acha que seu jogo de ICM está em dia.</p>
            <p><strong className="text-text-bright">Tenho uma má notícia:</strong> O gap de habilidade entre você e o reg médio nessa área é mínimo. Onde o dinheiro real está sendo ganho e perdido silenciosamente é no <strong className="text-accent-indigo">ICM Pós-Flop.</strong></p>

            <div className="callout callout-secondary my-8">
              <h4 className="mt-0 text-[0.95rem] tracking-[0.02em] font-heading">O Custo Invisível</h4>
              <p>Dados recentes do GTO Wizard (2025/2026) revelam uma verdade brutal:</p>
              <blockquote className="border-l-3 border-accent-secondary pl-6 my-8 italic text-text-bright font-body">
                Jogar uma estratégia padrão de ChipEV (focada em acumular fichas) em spots de mesa final custa, em média, <strong>10% a 12% de todo o buy-in do torneio em $EV</strong>.
              </blockquote>
              <p>Em potes 3-bet? O erro custa mais de <strong className="text-text-bright">30% do valor da jogada</strong>. Pense nisso. Você grindou 8 horas. Chegou na FT. E em duas decisões de c-bet mal calibradas, você devolveu todo o lucro esperado do torneio. Não porque jogou &quot;mal&quot;, mas porque jogou com a matemática errada.</p>
            </div>

            <h3 className="text-2xl font-bold mt-10 mb-3 text-text-bright font-heading">Apresentando: O Mapa do ICM Pós-Flop</h3>
            <p>Nesta aula inédita, não vamos falar de tabelas de push/fold. Vamos mergulhar na física do jogo pós-flop sob pressão. Você vai aprender a <strong className="text-text-bright text-shadow-glow">Antevisão</strong>: a habilidade de olhar para uma mesa e ver o &quot;campo de força&quot; do Risk Premium antes mesmo de receber suas cartas.</p>

            <h4 className="text-text-main text-lg font-heading mt-10 mb-4">O Que Você Vai Dominar:</h4>
            <ul className="list-none pl-0 space-y-3">
              <li className="flex items-start gap-3"><i className="fa-solid fa-check text-accent-emerald mt-1" /> <span><strong className="text-text-bright">&quot;Downward Drift&quot;:</strong> A heurística simples que ajusta automaticamente seus sizings e frequências para a realidade do ICM.</span></li>
              <li className="flex items-start gap-3"><i className="fa-solid fa-check text-accent-emerald mt-1" /> <span><strong className="text-text-bright">Toy-Games de Laboratório:</strong> Vamos dissecar 8 cenários puros para provar matematicamente conceitos contraintuitivos.</span></li>
              <li className="flex items-start gap-3"><i className="fa-solid fa-check text-accent-emerald mt-1" /> <span><strong className="text-text-bright">O Teto do Risk Premium:</strong> Por que overbluffar o Chip Leader é suicídio, e onde está o limite matemático da agressão.</span></li>
              <li className="flex items-start gap-3"><i className="fa-solid fa-check text-accent-emerald mt-1" /> <span><strong className="text-text-bright">A Mesa como Organismo:</strong> Como um all-in entre dois oponentes muda instantaneamente o valor das SUAS fichas.</span></li>
            </ul>

            <h3 className="text-2xl font-bold mt-12 mb-3 text-text-bright font-heading">Para Quem É Isso?</h3>
            <p>Este material não é para iniciantes. É para jogadores profissionais e semiprofissionais (AVG $109-$530) que já entendem o básico de ICM pré-flop e querem uma vantagem técnica real que o field ainda não estuda.</p>

            <h3 className="text-2xl font-bold mt-12 mb-3 text-text-bright font-heading">O Que Está Incluso</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
              <div className="bg-bg-elevated/50 rounded-lg p-6 border border-white/5 transition-all hover:border-accent-indigo/30">
                <strong className="text-text-main text-base block mb-3 font-heading tracking-wide">Módulo 1: O Problema e o Mapa</strong>
                <p className="text-text-muted text-[0.9rem] leading-relaxed">Por que ICM importa desde a mão 1, o que é Risk Premium, e sua relação com o Bubble Factor.</p>
              </div>
              <div className="bg-bg-elevated/50 rounded-lg p-6 border border-white/5 transition-all hover:border-accent-indigo/30">
                <strong className="text-text-main text-base block mb-3 font-heading tracking-wide">Módulo 2: Toy-Games como Laboratório</strong>
                <p className="text-text-muted text-[0.9rem] leading-relaxed">8 toy-games com RP progressivo e invertido para isolar variáveis e construir intuição sobre o Teto do RP e o Pacto Silencioso.</p>
              </div>
              <div className="bg-bg-elevated/50 rounded-lg p-6 border border-white/5 transition-all hover:border-accent-indigo/30">
                <strong className="text-text-main text-base block mb-3 font-heading tracking-wide">Módulo 3: ICM Pós-Flop — A Fronteira</strong>
                <p className="text-text-muted text-[0.9rem] leading-relaxed">Downward Drift, distribuição de RP por street, covering advantage e o custo quantificado de jogar ChipEV em spots ICM.</p>
              </div>
              <div className="bg-bg-elevated/50 rounded-lg p-6 border border-white/5 transition-all hover:border-accent-indigo/30">
                <strong className="text-text-main text-base block mb-3 font-heading tracking-wide">Módulo 4: Variáveis Contextuais</strong>
                <p className="text-text-muted text-[0.9rem] leading-relaxed">Impacto de Payouts (flat vs top-heavy), FGS vs ICM clássico, dinâmica de KOs e a responsabilidade do Chip Leader.</p>
              </div>
            </div>

            <div className="bg-accent-indigo/10 border-l-4 border-accent-indigo p-6 my-10 rounded-r-xl">
              <h4 className="mt-0 text-accent-indigo-light font-bold text-sm uppercase tracking-widest mb-2 font-heading">Bônus Exclusivo</h4>
              <p className="m-0 text-text-main leading-relaxed"><strong>Checklist de Bolso &quot;Antevisão&quot;:</strong> Um guia passo-a-passo para calibrar sua mente antes de cada mão em uma FT. Nunca mais entre em um spot sem saber quem cobre quem e qual é o Risk Premium da mesa.</p>
            </div>

            <h3 className="text-2xl font-bold mt-12 mb-6 text-text-bright font-heading text-center">Elementos Diferenciadores</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none pl-0">
              { [
                { n: '1', title: 'Metodologia de toy-games', desc: 'isolamento de variáveis para construir intuição.' },
                { n: '2', title: 'Conceitos próprios', desc: 'Teto do RP, RP de ida vs volta — nomenclatura clara.' },
                { n: '3', title: 'ICM pós-flop central', desc: 'supera a visão limitada de que ICM é pré-flop.' },
                { n: '4', title: 'Crítica aos solvers', desc: 'solvers como mapa, não como território.' },
                { n: '5', title: 'Interdisciplinaridade', desc: 'Prospect Theory e Teoria de Sistemas.' },
              ].map( item => (
                <li key={ item.n } className="bg-white/5 border border-white/10 p-5 rounded-xl flex flex-col gap-2">
                  <span className="text-accent-indigo font-black text-xl opacity-50 font-mono">0{ item.n }</span>
                  <strong className="text-text-bright text-sm">{ item.title }</strong>
                  <span className="text-text-dim text-[0.8rem] leading-snug">{ item.desc }</span>
                </li>
              ) ) }
            </ul>
          </div>
        </GlassPanel>
      </div>

      {/* Autor */ }
      <SectionHeader
        step="02"
        label="O Autor"
        title="Raphael Vitoi"
        description="Educador e Profissional de Poker há mais de dez anos, especialista em Sistemas Complexos, ICM, Multiway Spots e Teoria dos Jogos."
      />
      <div className="max-w-300 mx-auto px-6 mb-20">
        <GlassPanel className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12 p-8 sm:p-12 items-center">
          <div className="relative aspect-video lg:aspect-square w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
            <video autoPlay muted playsInline loop preload="metadata" className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700">
              <source src="/0309.mp4" type="video/mp4" />
              Seu navegador não suporta o vídeo.
            </video>
          </div>
          <div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
            <p>Sua abordagem transita entre a <strong className="text-text-bright">Análise Bayesiana, Preditiva e Recursiva</strong>, focando na adaptação estratégica e análise comportamental (GTO e desvio). Além das mesas, mergulha na <strong className="text-text-bright">Psicologia do Poker</strong>, dissecando os vieses cognitivos que custam dinheiro.</p>
            <p className="italic text-text-dim text-2xl mt-6 border-l-2 border-indigo-500/30 pl-6">&quot;Pois o que importa de verdade é pensar bem.&quot;</p>

            <div className="mt-10 flex flex-wrap gap-3">
              <a href="https://deepsolver.com" target="_blank" rel="noopener" className="badge-link-primary badge-link px-4 py-2">Embaixador Deepsolver</a>
              <a href="https://gtowizard.com" target="_blank" rel="noopener" className="badge-link-emerald badge-link px-4 py-2">Afiliado GTO Wizard</a>
              <a href="https://trueicm.com" target="_blank" rel="noopener" className="badge-link-secondary badge-link px-4 py-2">Criador trueICM.com</a>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* CTA Final */ }
      <div className="bg-bg-deep border-y border-white/5 py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-sota-pattern opacity-20 pointer-events-none"></div>
        <section id="final-cta" className="relative z-10 max-w-4xl mx-auto">
          <p className="italic text-xl sm:text-2xl text-text-muted mb-8 leading-relaxed font-body">
            &quot;O edge não está mais nas cartas que você recebe, mas na precisão com que você avalia o risco de jogá-las.&quot;
          </p>
          <h2 className="text-3xl sm:text-5xl font-black text-text-bright mb-12 font-heading tracking-tight">Recupere seu ROI. Domine a fronteira final.</h2>

          <div className="flex justify-center">
            <Link href="/aulas/icm-masterclass" className="btn-primary pulse-glow px-12 py-5 text-xl font-black tracking-widest rounded-2xl">
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
      <div className="max-w-300 mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/aulas/icm-masterclass" className="hub-card">
            <i className="fa-solid fa-chart-column hub-icon text-accent-primary" />
            <h3 className="font-heading font-bold text-lg">Geometria do Risco</h3>
            <p className="font-body text-sm">Aula Magna: O Edge mudou de lugar. Entenda a geometria do risco pós-flop.</p>
            <span className="card-cta">Acessar <i className="fa-solid fa-arrow-right ml-1" /></span>
          </Link>

          <Link href="/aulas/leitura-icm" className="hub-card">
            <i className="fa-solid fa-file-lines hub-icon text-accent-primary" />
            <h3 className="font-heading font-bold text-lg">Entendendo o ICM</h3>
            <p className="font-body text-sm">Whitepaper completo: Toy Games, Risk Premium, RP de ida/volta e o Teto do RP.</p>
            <span className="card-cta">Ler Whitepaper <i className="fa-solid fa-arrow-right ml-1" /></span>
          </Link>

          <Link href="/simulador" className="hub-card">
            <i className="fa-solid fa-flask hub-icon text-accent-primary" />
            <h3 className="font-heading font-bold text-lg">Motor ICM</h3>
            <p className="font-body text-sm">Laboratório interativo. Simule spots, calcule Risk Premium e visualize o Downward Drift na prática.</p>
            <span className="card-cta">Acessar Simulador <i className="fa-solid fa-arrow-right ml-1" /></span>
          </Link>

          <Link href="/oraculo" className="hub-card">
            <i className="fa-solid fa-network-wired hub-icon text-accent-primary" />
            <h3 className="font-heading font-bold text-lg">Oráculo Híbrido</h3>
            <p className="font-body text-sm">Explore a topologia ontológica do Knowledge Graph e consulte a Mente Coletiva via RAG SOTA.</p>
            <span className="card-cta">Consultar Oráculo <i className="fa-solid fa-arrow-right ml-1" /></span>
          </Link>

          <Link href="/artigos/estado-da-arte" className="hub-card">
            <i className="fa-solid fa-lightbulb hub-icon text-accent-primary" />
            <h3 className="font-heading font-bold text-lg">Estado da Arte 2025</h3>
            <p className="font-body text-sm">Donk Bet meta, Efeito de Irradiação, IA vs HRC Pro. Tendências High Stakes.</p>
            <span className="card-cta">Ler <i className="fa-solid fa-arrow-right ml-1" /></span>
          </Link>

          <Link href="/artigos/smart-sniper" className="hub-card">
            <i className="fa-solid fa-crosshairs hub-icon text-accent-primary" />
            <h3 className="font-heading font-bold text-lg">Protocolo Smart Sniper</h3>
            <p className="font-body text-sm">Gestão de carreira, rotina semanal, estratégia de domingo e validação Monte Carlo.</p>
            <span className="card-cta">Ler <i className="fa-solid fa-arrow-right ml-1" /></span>
          </Link>

          <Link href="/artigos/validacao-smart-sniper" className="hub-card">
            <i className="fa-solid fa-chart-line hub-icon text-accent-primary" />
            <h3 className="font-heading font-bold text-lg">Validação Científica</h3>
            <p className="font-body text-sm">Monte Carlo, Índice de Sharpe, Barbell Strategy e modelagem cognitiva (Yerkes-Dodson). Q.E.D.</p>
            <span className="card-cta">Ler Artigo <i className="fa-solid fa-arrow-right ml-1" /></span>
          </Link>

          <Link href="/artigos/psicologia-hs" className="hub-card">
            <i className="fa-solid fa-brain hub-icon text-accent-primary" />
            <h3 className="font-heading font-bold text-lg">Psicologia High Stakes</h3>
            <p className="font-body text-sm">A Fenomenologia da Incerteza: Exegese crítica das heurísticas de ICM.</p>
            <span className="card-cta">Ler <i className="fa-solid fa-arrow-right ml-1" /></span>
          </Link>

          <Link href="/biblioteca" className="hub-card">
            <i className="fa-solid fa-book-journal-whills hub-icon text-accent-primary" />
            <h3 className="font-heading font-bold text-lg">Biblioteca Epistêmica</h3>
            <p className="font-body text-sm">Acervo de Filosofia, Psicologia e Existencialismo. A fundação teórica.</p>
            <span className="card-cta">Explorar <i className="fa-solid fa-arrow-right ml-1" /></span>
          </Link>

          <Link href="/quem-sou" className="hub-card">
            <i className="fa-solid fa-user hub-icon text-accent-primary" />
            <h3 className="font-heading font-bold text-lg">Quem Sou</h3>
            <p className="font-body text-sm">O Manifesto. Educador, Estrategista e Especialista em Sistemas Complexos.</p>
            <span className="card-cta">Conhecer <i className="fa-solid fa-arrow-right ml-1" /></span>
          </Link>
        </div>
      </div>
    </div>

  );
}
