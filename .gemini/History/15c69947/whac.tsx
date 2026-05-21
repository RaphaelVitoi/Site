import { GlassPanel } from '@/components/ui/GlassPanel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import Link from 'next/link';

/**
 * IDENTITY: Landing Page Principal (Nexus Central)
 * PATH: src/app/page.tsx
 * ROLE: Portal de entrada do ecossistema. Hub de Inteligência & Conversão.
 */

export const metadata = {
  title: 'Nexus | Raphael Vitoi - Inteligência SOTA em Poker',
  description: 'ICM Pós-Flop, Risk Premium e a Nova Fronteira do Edge. Explore o ecossistema Nexus no PokerRacional.com.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body">

      {/* HERO NEXUS */ }
      <section id="hero" className="relative pt-40 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-sota-pattern opacity-10 pointer-events-none"></div>
        <div className="sota-container relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto animate-sota-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-indigo/10 border border-accent-indigo/20 text-[0.6rem] font-black text-accent-indigo-light uppercase tracking-[0.2em] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-indigo animate-pulse" />
            { ' ' }SOTA Intelligence Active
          </div>

          <h1 className="text-[clamp(2.5rem,8vw,5rem)] font-black mb-8 tracking-tighter leading-[0.9] bg-linear-to-b from-text-bright via-text-muted to-text-darker bg-clip-text text-transparent font-heading">
            O Edge Mudou <br /> de Lugar
          </h1>

          <p className="text-xl md:text-2xl text-text-muted max-w-2xl leading-relaxed mb-12 font-medium">
            Descubra como a elite do poker usa a <strong className="text-text-bright">Perspectiva Matemática</strong> para dominar o pós-flop em um field saturado de solvers.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="#metodo" className="btn-primary px-12 py-5 text-lg font-black tracking-tighter rounded-2xl shadow-xl shadow-indigo-900/20">
              EXPLORAR O NEXUS <i className="fa-solid fa-arrow-right ml-3" />
            </Link>
            <Link href="/aulas/leitura-icm" className="btn-secondary px-12 py-5 text-lg font-black tracking-tighter rounded-2xl border-white/5">
              WHITEPAPER
            </Link>
          </div>
        </div>
      </section>

      {/* O MÉTODO VITOI */ }
      <div id="metodo" className="scroll-mt-24">
        <SectionHeader
          step="SYS"
          label="Arquitetura"
          title="A Inteligência por trás do Nexus"
          description="O poker evoluiu. Solvers resolveram o pré-flop. A nova fronteira estratégica reside na dinâmica quântica do Risk Premium e na erosão de stack."
        />
        <div className="sota-container mb-24">
          <GlassPanel className="p-8 sm:p-12 lg:p-16 border-accent-indigo/10">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-16 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-text-bright tracking-tighter uppercase font-heading">O Custo da Inércia</h3>
                  <p className="text-lg text-text-muted leading-relaxed">
                    Jogar ChipEV em mesas finais custa, em média, <strong className="text-accent-rose">12% do seu ROI</strong>. Em potes 3-bet, o erro de percepção pode aniquilar 30% do valor da sua jogada.
                  </p>
                </div>
                <div className="bg-bg-deep border border-white/5 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center gap-3 text-accent-indigo text-sm font-black uppercase tracking-widest font-mono">
                    <i className="fa-solid fa-microchip" /> Quantum Engine
                  </div>
                  <p className="text-sm text-text-dim italic leading-relaxed">
                    &quot;A maestria não está em ter uma edge, mas em entender a topografia onde ela pode ser aplicada sem colapsar o sistema.&quot;
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                { [
                  { icon: 'fa-chart-pie', title: 'Downward Drift', desc: 'Ajuste automático de frequências e sizings sob pressão.' },
                  { icon: 'fa-dna', title: 'Toy Games', desc: 'Modelagem de cenários puros para isolamento de variáveis.' },
                  { icon: 'fa-brain', title: 'Prospect Theory', desc: 'Aversão à perda e algoritmos de Monte Carlo O(N).' },
                  { icon: 'fa-network-wired', title: 'Fator Vitoi', desc: 'A âncora de 24% RP como ponto de colapso da MDF.' }
                ].map( ( item ) => (
                  <div key={ item.title } className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-accent-indigo/30 transition-all group">
                    <i className={ `fa-solid ${item.icon} text-accent-indigo text-xl mb-4 group-hover:scale-110 transition-transform` } />
                    <h4 className="text-sm font-black text-text-bright uppercase mb-2">{ item.title }</h4>
                    <p className="text-xs text-text-muted leading-relaxed">{ item.desc }</p>
                  </div>
                ) ) }
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* AUTOR */ }
      <div className="bg-bg-deep border-y border-white/5 py-24 mb-24">
        <SectionHeader
          step="BIO"
          label="O Autor"
          title="Raphael Vitoi"
          description="Educador e estrategista. Especialista em Sistemas Complexos, ICM e Teoria dos Jogos aplicada ao Poker de Elite."
        />
        <div className="sota-container">
          <GlassPanel className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12 p-8 sm:p-12 items-center">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
              <video autoPlay muted playsInline loop preload="metadata" className="absolute inset-0 w-full h-full object-cover grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-1000">
                <source src="/0309.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="space-y-8">
              <p className="text-xl text-text-muted leading-relaxed font-medium">
                Com mais de uma década no circuito profissional, minha abordagem transita entre a <strong className="text-text-bright">Análise Bayesiana e Recursiva</strong>. No Nexus, destilo a complexidade em inteligência acionável.
              </p>
              <blockquote className="text-2xl font-light italic text-text-dim border-l-2 border-accent-indigo/30 pl-8 py-2">
                &quot;Pois o que importa de verdade é pensar bem.&quot;
              </blockquote>
              <div className="flex flex-wrap gap-3">
                { ['Embaixador Deepsolver', 'Afiliado GTO Wizard', 'Criador trueICM'].map( ( tag ) => (
                  <span key={ tag } className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-[0.65rem] font-black text-text-muted uppercase tracking-widest">{ tag }</span>
                ) ) }
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* HUB DE CONHECIMENTO */ }
      <SectionHeader
        step="HUB"
        label="Navegação"
        title="O Acervo de Inteligência"
        description="Aulas magnas, simuladores em tempo real e bibliotecas teóricas integradas."
      />
      <div className="sota-container pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/aulas/icm-masterclass" className="hub-card">
            <i className="fa-solid fa-shuttle-space hub-icon text-accent-indigo" />
            <h3 className="font-heading font-black uppercase tracking-tighter text-xl">Geometria do Risco</h3>
            <p className="text-text-muted text-sm leading-relaxed">Aula Magna: O colapso do EV tradicional e a nova física do jogo.</p>
            <span className="card-cta">Acessar Protocolo <i className="fa-solid fa-arrow-right ml-2" /></span>
          </Link>

          <Link href="/laboratorio-v2" className="hub-card border-accent-emerald/20">
            <i className="fa-solid fa-flask-vial hub-icon text-accent-emerald" />
            <h3 className="font-heading font-black uppercase tracking-tighter text-xl">Laboratório SOTA</h3>
            <p className="text-text-muted text-sm leading-relaxed">Dashboard integrado de ICM. Simulações quânticas em tempo real.</p>
            <span className="card-cta text-accent-emerald">Iniciar Simulação <i className="fa-solid fa-arrow-right ml-2" /></span>
          </Link>

          <Link href="/oraculo" className="hub-card border-accent-amber/20">
            <i className="fa-solid fa-bolt hub-icon text-accent-amber" />
            <h3 className="font-heading font-black uppercase tracking-tighter text-xl">Oráculo RAG</h3>
            <p className="text-text-muted text-sm leading-relaxed">Consulte a base de conhecimento VITOI via inteligência aumentada.</p>
            <span className="card-cta text-accent-amber">Consultar Mente <i className="fa-solid fa-arrow-right ml-2" /></span>
          </Link>

          <Link href="/biblioteca" className="hub-card border-white/10">
            <i className="fa-solid fa-book-atlas hub-icon text-text-muted opacity-50" />
            <h3 className="font-heading font-black uppercase tracking-tighter text-xl">Biblioteca Analítica</h3>
            <p className="text-text-muted text-sm leading-relaxed">O acervo completo de artigos, ensaios e heurísticas fundamentais.</p>
            <span className="card-cta opacity-60">Explorar Arquivo <i className="fa-solid fa-arrow-right ml-2" /></span>
          </Link>

          <Link href="/biblioteca/estado-da-arte-2025" className="hub-card border-accent-indigo/20">
            <i className="fa-solid fa-lightbulb hub-icon text-accent-indigo" />
            <h3 className="font-heading font-black uppercase tracking-tighter text-xl">Estado da Arte</h3>
            <p className="text-text-muted text-sm leading-relaxed">Whitepaper 2025: Tendências High Stakes, Donk Bets e o futuro da IA.</p>
            <span className="card-cta text-accent-indigo">Ler Whitepaper <i className="fa-solid fa-arrow-right ml-2" /></span>
          </Link>

          <Link href="/quem-sou" className="hub-card border-white/10">
            <i className="fa-solid fa-dna hub-icon text-text-darker" />
            <h3 className="font-heading font-black uppercase tracking-tighter text-xl">O Autor</h3>
            <p className="text-text-muted text-sm leading-relaxed">O manifesto por trás do Nexus. Raphael Vitoi e o Paradigma SOTA.</p>
            <span className="card-cta opacity-60">Ver Perfil <i className="fa-solid fa-arrow-right ml-2" /></span>
          </Link>
        </div>
      </div>
    </div>
  );
}
