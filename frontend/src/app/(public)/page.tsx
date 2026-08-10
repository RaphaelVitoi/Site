'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

/* ─── Tokens ────────────────────────────────────────────────────────────────
   Light-mode ethereal system:
     bg-canvas   #F5F4F0   (paper white, warm)
     bg-card     #FAFAF8   (lifted surface)
     text-ink    #111110   (near-black)
     text-body   #3D3C3A   (readable dark-grey)
     text-muted  #888884   (secondary)
     text-ghost  #B4B2AE   (tertiary / labels)
     border      #E4E2DC   (hair-line)
     gold        #B8965A   (single warm accent)
   ─────────────────────────────────────────────────────────────────────────── */

export default function Home() {
  const [activeModule, setActiveModule] = useState<number>(0);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    const playPromise = v.play();
    if (playPromise !== undefined && typeof playPromise.then === 'function') {
      playPromise.then(() => setVideoReady(true)).catch(() => setVideoReady(true));
    } else {
      setVideoReady(true);
    }
  }, []);

  const modules = [
    {
      num: 1,
      title: 'O Problema e o Mapa',
      desc: 'Fundamentos de precificação e risco.',
      topics: [
        'ICM desde a mão 1 (não apenas na bolha)',
        'Risk Premium: definição precisa, cálculo e intuição',
        'RP vs Bubble Factor: relações de equidade',
        'Calculadora de valuation de stacks em FTs reais',
      ],
    },
    {
      num: 2,
      title: 'Toy-Games como Laboratório',
      desc: 'Isolamento de variáveis estratégicas.',
      topics: [
        'Justificativa metodológica: isolamento de variáveis',
        '5 Toy-Games: RP progressivo no OOP (RP 0 → 24)',
        '3 Toy-Games: RP invertido no IP (CL vs Short)',
        'Conceitos emergentes: Teto do RP e Vantagem de Risco',
      ],
    },
    {
      num: 3,
      title: 'ICM Pós-Flop — A Fronteira',
      desc: 'O Downward Drift no pós-flop.',
      topics: [
        'Por que o edge migrou do pré-flop para o pós-flop',
        'Downward Drift: transformação de sizings e ações',
        'SPR e distribuição do Risk Premium por street',
        'Covering advantage e premium check-back',
      ],
    },
    {
      num: 4,
      title: 'Variáveis Contextuais',
      desc: 'Impactos e dinâmica de torneios.',
      topics: [
        'Estruturas de payout (Flat vs Top-Heavy)',
        'FGS (Future Game Simulation) vs ICM clássico',
        'Torneios KO/Bounty: colisão de RP e Bounty Power',
        'Dinâmica de CL: leverage futuro e risco de ruína',
      ],
    },
    {
      num: 5,
      title: 'Aplicação Prática e Conexões',
      desc: 'Heurísticas de combate em tempo real.',
      topics: [
        'Checklist de bolso "Antevisão" e 10 erros comuns',
        'Configuração de laboratório solo com solvers',
        'Loss aversion sob a ótica da Prospect Theory',
        'Teoria de Sistemas: a mesa como organismo integrado',
      ],
    },
  ];

  return (
    <div className="light-page font-body min-h-screen overflow-x-hidden text-[#1C1B1A]">
      {/* ════════════════════════════════════════════════════════════
          HERO — Classical Mastpiece
      ════════════════════════════════════════════════════════════ */}
      <section className="relative flex flex-col items-center overflow-hidden px-6 pt-52 pb-36 text-center">
        {/* Subtle Fibonacci watermark in background */}
        <div className="pointer-events-none absolute top-10 right-10 opacity-[0.03] select-none">
          <svg width="450" height="450" viewBox="0 0 320 320" fill="none">
            <path d="M 320 320 Q 320 160 160 160" stroke="#0D0C0A" strokeWidth="0.6" fill="none" />
            <path d="M 160 160 Q 160 260 60 260" stroke="#0D0C0A" strokeWidth="0.5" fill="none" />
            <path d="M 60 260 Q 60 222 98 222" stroke="#0D0C0A" strokeWidth="0.5" fill="none" />
            <path d="M 98 222 Q 122 222 122 184" stroke="#0D0C0A" strokeWidth="0.4" fill="none" />
          </svg>
        </div>

        {/* Eyebrow */}
        <div className="mb-12 flex items-center gap-5 opacity-50">
          <div className="h-px w-[34px] bg-[#1C1B1A]" />
          <span className="font-mono text-[0.6rem] tracking-[0.55em] text-[#1C1B1A] uppercase">
            Poker Racional · Risk Premium Edition
          </span>
          <div className="h-px w-[34px] bg-[#1C1B1A]" />
        </div>

        {/* Monumental Pacioli Logo */}
        <div className="relative mb-14 flex items-center justify-center">
          <svg
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="none"
            className="opacity-80 transition-all duration-700 hover:scale-105"
          >
            <circle cx="12" cy="12" r="11" stroke="#B09460" strokeWidth="0.6" />
            <polygon points="12,1.5 22.5,12 12,22.5 1.5,12" stroke="#1C1B1A" strokeWidth="0.6" />
            <rect x="4.2" y="4.2" width="15.6" height="15.6" stroke="#B09460" strokeWidth="0.45" strokeOpacity="0.7" />
            <line x1="12" y1="1" x2="12" y2="23" stroke="#1C1B1A" strokeWidth="0.4" strokeDasharray="1 1.5" />
            <line x1="1" y1="12" x2="23" y2="12" stroke="#1C1B1A" strokeWidth="0.4" strokeDasharray="1 1.5" />
            <line x1="4.2" y1="4.2" x2="19.8" y2="19.8" stroke="#B09460" strokeWidth="0.3" strokeOpacity="0.4" />
            <line x1="19.8" y1="4.2" x2="4.2" y2="19.8" stroke="#B09460" strokeWidth="0.3" strokeOpacity="0.4" />
            <circle cx="12" cy="12" r="1.2" fill="#1C1B1A" />
          </svg>
        </div>

        {/* Primary headline */}
        <h1 className="font-display mb-8 max-w-[18ch] text-[clamp(2.8rem,8vw,6.5rem)] leading-[1.05] tracking-tight text-[#0D0C0A]">
          O Edge Mudou
          <br />
          de Lugar.
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mb-6 max-w-xl text-[clamp(1.1rem,1.8vw,1.35rem)] leading-[1.8] font-normal text-[#262423]">
          Jogar ChipEV em spots de mesa final custa, em média,{' '}
          <span className="font-bold text-[#0D0C0A]">mais de 10% do seu ROI</span> — e a maioria dos profissionais ainda
          não sabe disso.
        </p>

        {/* Tertiary line */}
        <p className="mb-14 font-mono text-[0.62rem] tracking-[0.45em] text-[#888680] uppercase">
          ICM Pós-Flop · Downward Drift · Risk Premium
        </p>

        {/* CTAs */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/simulador"
            className="flex items-center gap-[10px] rounded-md bg-[#0D0C0A] px-[34px] py-[15px] font-mono text-[0.68rem] tracking-[0.28em] text-[#F5F3EE] uppercase shadow-[0_4px_16px_rgba(13,12,10,0.05)] transition-all duration-300 hover:bg-[#2A2825] hover:shadow-[0_8px_24px_rgba(13,12,10,0.1)]"
          >
            <i className="fa-solid fa-scale-unbalanced text-[#B09460]" /> Simulador Mestre
          </Link>
          <Link
            href="/simulador/gto-cfr"
            className="flex items-center gap-[10px] rounded-md border border-[#DED9D2] bg-transparent px-[34px] py-[15px] font-mono text-[0.68rem] tracking-[0.28em] text-[#262423] uppercase transition-all duration-300 hover:border-[#0D0C0A] hover:text-[#0D0C0A]"
          >
            <i className="fa-solid fa-network-wired text-[#B09460]" /> Laboratório CFR
          </Link>
          <Link
            href="/biblioteca"
            className="flex items-center gap-[10px] rounded-md border border-[#EDE8E1] bg-transparent px-[34px] py-[15px] font-mono text-[0.68rem] tracking-[0.28em] text-[#888680] uppercase transition-all duration-300 hover:border-[#DED9D2] hover:text-[#262423]"
          >
            <i className="fa-solid fa-book-open" /> Biblioteca
          </Link>
        </div>
      </section>

      {/* ── rule ── */}
      <Rule />

      {/* ════════════════════════════════════════════════════════════
          A "MENTIRA" DO ICM
      ════════════════════════════════════════════════════════════ */}
      <Section>
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-[1.2fr_1fr]">
          {/* Left */}
          <div className="space-y-8">
            <Label>A Tese Central</Label>
            <h2 className="font-display text-[clamp(2rem,3.5vw,2.8rem)] leading-[1.1] tracking-tight text-[#0D0C0A]">
              A "Mentira" do ICM Tradicional
            </h2>
            <div className="h-px w-[40px] bg-[#B09460]" />
            <div className="space-y-6 text-[1.12rem] leading-[1.85] text-[#262423]">
              <p>
                Se você é como a maioria dos regulares de MTT, aprendeu que o ICM é um simples interruptor que "liga" na
                bolha ou na mesa final. Estudou tabelas de Push/Fold. Dominou o HRC e o ICMIZER.
              </p>
              <p>
                <span className="font-bold text-[#0D0C0A]">A verdade é dura:</span> o poker evoluiu, e o seu edge no
                pré-flop está desaparecendo. Hoje, os solvers resolveram essa dinâmica — o gap de habilidade real no
                pré-flop é mínimo.
              </p>
              <p className="font-serif text-[1.18rem] leading-[1.75] text-[#0D0C0A] italic">
                O ICM Pós-Flop e o Paradigma da Perspectiva Matemática definem a nova fronteira de lucratividade.
              </p>
            </div>
          </div>

          {/* Right — Drift Widget */}
          <DownwardDriftWidget />
        </div>
      </Section>

      <Rule />

      {/* ════════════════════════════════════════════════════════════
          O CUSTO INVISÍVEL
      ════════════════════════════════════════════════════════════ */}
      <Section>
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-[300px_1fr]">
          <div className="space-y-5">
            <Label>Telemetria</Label>
            <h2 className="font-display text-[clamp(2rem,3vw,2.5rem)] leading-[1.1] tracking-tight text-[#0D0C0A]">
              O Custo
              <br />
              Invisível
            </h2>
            <p className="font-mono text-[0.58rem] tracking-[0.35em] text-[#B2B0AB] uppercase">GTO Wizard Data</p>
          </div>
          <div className="space-y-6 pt-2 text-[1.12rem] leading-[1.85] text-[#262423]">
            <blockquote className="border-l-2 border-[#B09460] pl-6 font-serif text-[1.2rem] leading-[1.75] text-[#1C1B1A] italic">
              "Jogar uma estratégia padrão de ChipEV em spots de mesa final custa, em média, 10% a 12% de todo o buy-in
              do torneio em $EV."
            </blockquote>
            <p>
              Em potes 3-bet? O erro custa mais de{' '}
              <span className="font-bold text-[#0D0C0A]">mais de 30% do valor da jogada</span>.
            </p>
            <p>
              Você grindou por 8 horas. Chegou na FT. E em duas decisões de c-bet mal calibradas, devolveu todo o lucro
              esperado do torneio. Não porque jogou "mal", mas porque utilizou a matemática errada.
            </p>
          </div>
        </div>
      </Section>

      <Rule />

      {/* ════════════════════════════════════════════════════════════
          VIDEO — Gallery Frame
      ════════════════════════════════════════════════════════════ */}
      <Section>
        <div className="space-y-12">
          <div className="space-y-4 text-center">
            <EyebrowCentered>Transmissão Técnica</EyebrowCentered>
            <h2 className="font-display text-center text-[clamp(1.8rem,3.5vw,2.8rem)] tracking-tight text-[#0D0C0A]">
              Comentários Estratégicos
            </h2>
            <p className="mx-auto max-w-lg text-[1.1rem] leading-[1.8] font-normal text-[#262423]">
              Mergulho audiovisual na física do poker sob pressão de ICM e a simulação de Toy-Games.
            </p>
          </div>

          {/* Gallery frame video wrap */}
          <div className="rounded-md border border-[#DED9D2] bg-[#FAFAF8] p-3 shadow-[0_8px_32px_rgba(13,12,10,0.04)]">
            <div className="relative overflow-hidden rounded border border-[#B09460] bg-[#0D0C0A]">
              {/* Overlay label */}
              <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/45 to-transparent px-6 py-3.5 font-mono text-[0.55rem] tracking-[0.35em] text-white/30 uppercase">
                <span>raphaelvitoi.mp4</span>
                <span>Poker Racional · SOTA</span>
              </div>
              <video
                ref={videoRef}
                src="/raphaelvitoi.mp4"
                autoPlay
                muted
                loop
                playsInline
                className={`block aspect-video w-full object-cover transition-opacity duration-[1.2s] ${videoReady ? 'opacity-100' : 'opacity-0'}`}
                onCanPlay={() => setVideoReady(true)}
              >
                Seu navegador não suporta a tag de vídeo.
              </video>
            </div>
          </div>
        </div>
      </Section>

      <Rule />

      {/* ════════════════════════════════════════════════════════════
          O MAPA
      ════════════════════════════════════════════════════════════ */}
      <Section>
        <div className="space-y-16">
          <div className="space-y-4 text-center">
            <EyebrowCentered>O Mapa</EyebrowCentered>
            <h2 className="font-display text-center text-[clamp(1.8rem,3.5vw,2.8rem)] tracking-tight text-[#0D0C0A]">
              ICM Pós-Flop — A Fronteira
            </h2>
            <p className="mx-auto max-w-lg text-[1.1rem] leading-[1.8] font-normal text-[#262423]">
              Não tabelas de push/fold. A física do jogo pós-flop sob pressão extrema de mesas finais.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[
              {
                num: 'I',
                title: 'O Downward Drift',
                desc: 'A heurística que ajusta automaticamente seus sizings e frequências para a realidade do ICM pós-flop, evitando vazamento silencioso de $EV.',
              },
              {
                num: 'II',
                title: 'Toy-Games de Laboratório',
                desc: 'Cenários puros para provar matematicamente conceitos contra-intuitivos — às vezes, quem tem menos risco deve foldar mais.',
              },
              {
                num: 'III',
                title: 'O Teto do Risk Premium',
                desc: 'Por que overbluffar o Chip Leader é suicídio matemático, e onde está o limite preciso da agressão e do fold-equity.',
              },
              {
                num: 'IV',
                title: 'A Mesa como Organismo',
                desc: 'Como uma colisão de all-in entre dois oponentes altera instantaneamente a utilidade do seu próprio stack, sem você tocar nas fichas.',
              },
            ].map((p) => (
              <PillarCard key={p.num} num={p.num} title={p.title} desc={p.desc} />
            ))}
          </div>
        </div>
      </Section>

      <Rule />

      {/* ════════════════════════════════════════════════════════════
          EMENTA 5 MÓDULOS — Fibonacci Scale
      ════════════════════════════════════════════════════════════ */}
      <Section>
        <div className="space-y-16">
          <div className="space-y-4 text-center">
            <EyebrowCentered>Estrutura de Ensino</EyebrowCentered>
            <h2 className="font-display text-center text-[clamp(1.8rem,3.5vw,2.8rem)] tracking-tight text-[#0D0C0A]">
              Ementa Completa — 5 Módulos
            </h2>
            <p className="mx-auto max-w-xl text-[1.1rem] leading-[1.8] font-normal text-[#262423]">
              Uma jornada técnica do problema à aplicação prática de estratégias não-lineares.
            </p>
          </div>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[38.2%_61.8%]">
            {/* Index list */}
            <div className="flex flex-col gap-2">
              {modules.map((m, idx) => (
                <button
                  key={m.num}
                  onClick={() => setActiveModule(idx)}
                  className={`flex items-center justify-between rounded border px-5 py-4 text-left font-mono text-[0.66rem] tracking-[0.12em] transition-all duration-300 ${
                    activeModule === idx
                      ? 'border-[#0D0C0A] bg-[#0D0C0A] text-[#F5F3EE]'
                      : 'border-[#DED9D2] bg-transparent text-[#8A8880] hover:border-[#0D0C0A] hover:text-[#0D0C0A]'
                  }`}
                >
                  <span className="font-bold">MÓDULO 0{m.num}</span>
                  <span className="max-w-[120px] text-right text-[0.6rem] leading-tight opacity-80">{m.title}</span>
                </button>
              ))}
            </div>

            {/* Content Detail Panel */}
            <div className="flex min-h-[340px] flex-col justify-between rounded-xl border border-[#DED9D2] bg-[#FAFAF7] p-8 shadow-[0_4px_20px_rgba(13,12,10,0.02)] lg:p-10">
              {(() => {
                const currentModule = modules[activeModule];
                if (!currentModule) return null;
                return (
                  <div className="space-y-8">
                    <div>
                      <p className="mb-3.5 font-mono text-[0.6rem] font-bold tracking-[0.35em] text-[#B09460] uppercase">
                        Módulo 0{currentModule.num} · {currentModule.desc}
                      </p>
                      <h3 className="font-display text-[1.8rem] leading-[1.2] tracking-tight text-[#0D0C0A]">
                        {currentModule.title}
                      </h3>
                    </div>
                    <div className="h-px bg-[#DED9D2]" />
                    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {currentModule.topics.map((t) => (
                        <li
                          key={t}
                          className="flex items-start gap-3 font-serif text-[1.05rem] leading-[1.65] text-[#262423]"
                        >
                          <div className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-[#B09460]" />
                          {t}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-3 pt-4">
                      {[
                        { href: '/biblioteca', icon: 'fa-book-open', label: 'Biblioteca' },
                        { href: '/simulador', icon: 'fa-scale-unbalanced', label: 'Simulador' },
                        { href: '/simulador/gto-cfr', icon: 'fa-network-wired', label: 'Lab CFR' },
                      ].map((cta) => (
                        <Link
                          key={cta.href}
                          href={cta.href}
                          className="flex items-center gap-2 rounded border border-[#DED9D2] px-[22px] py-[10px] font-mono text-[0.62rem] tracking-[0.28em] text-[#262423] uppercase transition-all duration-300 hover:border-[#0D0C0A] hover:text-[#0D0C0A]"
                        >
                          <i className={`fa-solid ${cta.icon} text-[#B09460]`} /> {cta.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </Section>

      <Rule />

      {/* ════════════════════════════════════════════════════════════
          DIFERENCIAIS
      ════════════════════════════════════════════════════════════ */}
      <Section>
        <div className="space-y-16">
          <div className="space-y-4 text-center">
            <EyebrowCentered>Diferenciação</EyebrowCentered>
            <h2 className="font-display text-center text-[clamp(1.8rem,3.5vw,2.8rem)] tracking-tight text-[#0D0C0A]">
              Por que o Poker Racional é Diferente?
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                num: 'I',
                title: 'Metodologia de Toy-Games',
                desc: 'Isolamento cirúrgico de variáveis para construir intuição profunda antes de aplicá-las a situações de jogo complexo.',
              },
              {
                num: 'II',
                title: 'Conceitos Nomeados Próprios',
                desc: 'Termos e heurísticas originais: Teto do Risk Premium, Downward Drift, Vantagem de Risco.',
              },
              {
                num: 'III',
                title: 'ICM Pós-Flop como Tese',
                desc: 'Focamos na maior e mais inexplorada fronteira de ROI: o pós-flop sob pressão de mesas finais.',
              },
              {
                num: 'IV',
                title: 'Crítica Fundamentada a Solvers',
                desc: 'Entender solvers como mapa, não território, para explorar erros humanos com precisão analítica.',
              },
              {
                num: 'V',
                title: 'Conexões Interdisciplinares',
                desc: 'Prospect Theory, Teoria dos Sistemas e Nash sob lentes estruturais — embasando cada ação técnica.',
                wide: true,
              },
            ].map((p) => (
              <PillarCard key={p.num} num={p.num} title={p.title} desc={p.desc} {...(p.wide ? { wide: true } : {})} />
            ))}
          </div>
        </div>
      </Section>

      <Rule />

      {/* ════════════════════════════════════════════════════════════
          BÔNUS
      ════════════════════════════════════════════════════════════ */}
      <Section>
        <div className="flex flex-col items-center justify-between gap-12 rounded-xl border border-[#DED9D2] bg-[#FAFAF8] p-10 shadow-[0_4px_20px_rgba(13,12,10,0.02)] md:flex-row md:p-14">
          <div className="max-w-xl space-y-5">
            <p className="font-mono text-[0.6rem] font-bold tracking-[0.4em] text-[#B09460] uppercase">
              Bônus Exclusivo
            </p>
            <h3 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.25] tracking-tight text-[#0D0C0A]">
              Checklist de Bolso
              <br />
              "Antevisão"
            </h3>
            <p className="font-serif text-[1.1rem] leading-[1.8] text-[#262423]">
              Guia prático passo-a-passo para calibrar sua mente antes de cada mão em uma FT. Nunca mais entre em um
              spot sem saber quem cobre quem e qual é o Risk Premium atual da mesa.
            </p>
          </div>
          <div className="relative z-10 shrink-0">
            <Link
              href="/biblioteca"
              className="flex items-center gap-3 rounded-md bg-[#0D0C0A] px-[36px] py-[16px] font-mono text-[0.68rem] tracking-[0.28em] whitespace-nowrap text-[#F5F3EE] uppercase transition-all duration-300 hover:bg-[#2A2825]"
            >
              <i className="fa-solid fa-download text-[#B09460]" /> Resgatar na Biblioteca
            </Link>
          </div>
        </div>
      </Section>

      <Rule />

      {/* ════════════════════════════════════════════════════════════
          AUTOR — trueicm.com official bio & social alignments
      ════════════════════════════════════════════════════════════ */}
      <Section>
        <div className="grid grid-cols-1 items-start gap-0 lg:grid-cols-[38.2%_61.8%]">
          {/* Left Column — φ-proportion identity */}
          <div className="space-y-8 pb-14 lg:pr-16 lg:pb-0">
            <div>
              <Label>O especialista por trás do TrueICM</Label>
              <h2 className="font-display mt-5 text-[clamp(2.5rem,5vw,3.6rem)] leading-[0.95] tracking-tight text-[#0D0C0A]">
                Raphael
                <br />
                Vitoi
              </h2>
              <p className="mt-4 font-mono text-[0.6rem] font-bold tracking-[0.45em] text-[#B09460] uppercase">
                Educador · Profissional · Escritor
              </p>
            </div>

            <div className="h-px bg-[#DED9D2]" />

            {/* Roman style stats scale */}
            <div className="grid grid-cols-3 gap-0">
              {[
                { value: '10+', label: 'Anos de Mesa' },
                { value: '90', label: 'Quizzes Criados' },
                { value: '10', label: 'Fontes Validadas' },
              ].map((s, i) => (
                <div key={s.label} className={`pb-1 ${i > 0 ? 'border-l border-[#DED9D2] pl-4' : ''}`}>
                  <p className="font-display text-[1.8rem] leading-none font-bold tracking-[-0.03em] text-[#B09460]">
                    {s.value}
                  </p>
                  <p className="mt-2 font-mono text-[0.52rem] tracking-[0.3em] text-[#888680] uppercase">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {['ICM e Risk Premium', 'GTO e Equilíbrio', 'Embaixador GTO Wizard', 'Psicologia (UEMG)'].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#DED9D2] px-[14px] py-[6px] text-[0.65rem] text-[#262423]"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Refined social button links */}
            <div className="flex gap-2.5">
              {[
                { icon: 'fa-instagram', label: 'Instagram', href: 'https://instagram.com/raphaelvitoi' },
                { icon: 'fa-youtube', label: 'YouTube', href: 'https://youtube.com/@RaphaelVitoiPoker' },
                { icon: 'fa-twitch', label: 'Twitch', href: 'https://twitch.tv/raphaelvitoi' },
                { icon: 'fa-globe', label: 'TrueICM', href: 'https://trueicm.com' },
              ].map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  className="flex h-[42px] w-[42px] items-center justify-center rounded-md border border-[#DED9D2] bg-[#FAFAF7] text-[#888680] transition-all duration-300 hover:border-[#0D0C0A] hover:text-[#0D0C0A]"
                >
                  <i className={`fa-brands ${s.icon} text-[14px]`} />
                </Link>
              ))}
            </div>
          </div>

          {/* Right Column — exact trueicm biography refined semantic */}
          <div className="w-full space-y-8">
            <div className="h-px bg-[#DED9D2]" />

            <div className="space-y-6 font-serif text-[1.15rem] leading-[1.85] text-[#262423]">
              <p className="font-mono text-[0.62rem] font-bold tracking-[0.4em] text-[#B09460] uppercase">
                A intersecção entre Geometria do Risco, Teoria dos Jogos e Ciência do Comportamento
              </p>
              <p>
                Formado em Psicologia pela UEMG, Raphael transpõe o estudo dos processos cognitivos para o ambiente
                lógico do poker. Sua metodologia abdica de intuições vagas em favor de{' '}
                <span className="font-bold text-[#0D0C0A]">Análise Bayesiana</span>,{' '}
                <span className="font-bold text-[#0D0C0A]">Teoria de Sistemas</span> e{' '}
                <span className="font-bold text-[#0D0C0A]">Análise Socrática</span>. Cada torneio é visto como um
                ecossistema de variáveis matemáticas e psicológicas que exige resposta fundamentada.
              </p>
              <p>
                Membro-fundador de times como RegLife, MRJ Poker Team, Like A Boss e DuckRiver. Ex-instrutor do 4bet.
                Especialista e embaixador DeepSolver e GTO Wizard. Todo o conteúdo do TrueICM nasceu de centenas de
                horas de estudo e validação cruzada com{' '}
                <span className="font-bold text-[#0D0C0A]">10 fontes independentes</span>.
              </p>
            </div>

            <blockquote className="border-l-[1.5px] border-[#B09460] pl-[22px] text-[1.1rem] leading-[1.8] text-[#1C1B1A] italic">
              "O edge não está nas cartas que você recebe, mas na precisão com que você avalia o risco de jogá-las."
            </blockquote>

            <div className="relative z-10 flex flex-wrap gap-4 pt-3">
              <Link
                href="/quem-sou"
                className="flex items-center gap-2 rounded-md bg-[#0D0C0A] px-[28px] py-[13px] font-mono text-[0.63rem] tracking-[0.28em] text-[#F5F3EE] uppercase transition-all duration-300 hover:bg-[#2A2825]"
              >
                Ver a trilha completa
              </Link>
              <Link
                href="https://trueicm.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-md border border-[#DED9D2] px-[28px] py-[13px] font-mono text-[0.63rem] tracking-[0.28em] text-[#262423] uppercase transition-all duration-300 hover:border-[#0D0C0A] hover:text-[#0D0C0A]"
              >
                TrueICM.com <i className="fa-solid fa-arrow-up-right-from-square ml-1 text-[0.52rem]" />
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

/* ─── Sub-components ────────────────────────────────────────────────────────── */

function Rule() {
  return (
    <div className="mx-auto max-w-[1040px] px-10">
      <div className="h-px bg-[#DED9D2]" />
    </div>
  );
}

function Section({ children }: { readonly children: React.ReactNode }) {
  return <section className="mx-auto max-w-[1040px] px-10 py-24">{children}</section>;
}

function Label({ children }: { readonly children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-px w-6 bg-[#B09460]" />
      <span className="font-mono text-[0.6rem] font-bold tracking-[0.45em] text-[#888680] uppercase">{children}</span>
    </div>
  );
}

function EyebrowCentered({ children }: { readonly children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-5">
      <div className="h-px w-6 bg-[#DED9D2]" />
      <span className="font-mono text-[0.6rem] font-bold tracking-[0.45em] text-[#888680] uppercase">{children}</span>
      <div className="h-px w-6 bg-[#DED9D2]" />
    </div>
  );
}

function PillarCard({
  num,
  title,
  desc,
  wide,
}: {
  readonly num: string;
  readonly title: string;
  readonly desc: string;
  readonly wide?: boolean;
}) {
  return (
    <div
      className={`group rounded border border-[#DED9D2] bg-[#FAFAF7] px-8 py-[30px] transition-all duration-500 hover:border-[#B09460]/55 hover:shadow-[0_6px_30px_rgba(176,148,96,0.06)] ${wide ? 'md:col-span-2' : ''}`}
    >
      <p className="mb-[18px] font-mono text-[0.58rem] font-bold tracking-[0.35em] text-[#B09460]">{num}</p>
      <h4 className="mb-3 text-[0.88rem] font-bold tracking-[0.05em] text-[#0D0C0A] uppercase">{title}</h4>
      <p className="font-serif text-[1.05rem] leading-[1.76] text-[#262423]">{desc}</p>
    </div>
  );
}

function DownwardDriftWidget() {
  const [rp, setRp] = useState(15);
  const betFreq = Math.max(12, Math.round(65 - rp * 1.35));
  const minEquity = Math.min(80, Math.round(50 + rp * 0.5));
  let sizing = 'Grande — 75% pot';
  let sizingColorClass = 'text-[#B09460]';
  let sizingColorHex = '#B09460';
  if (rp > 10 && rp <= 22) {
    sizing = 'Pequeno — 30% pot';
    sizingColorClass = 'text-[#4A8C6F]';
    sizingColorHex = '#4A8C6F';
  } else if (rp > 22) {
    sizing = 'Check — 0% pot';
    sizingColorClass = 'text-[#9B4444]';
    sizingColorHex = '#9B4444';
  }

  // SVG dimensions: width = 380 (viewbox 0 0 400 120, range from 10 to 390)
  const xStart = 10 + (minEquity / 100) * 380;
  const xEnd = 390;
  const controlY = 110 - (betFreq / 100) * 160;
  const controlX = (xStart + xEnd) / 2;
  const activePath = `M ${xStart},110 Q ${controlX},${controlY} ${xEnd},110 Z`;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#DED9D2] bg-[#FAFAF8] p-10 transition-all duration-500 hover:shadow-[0_12px_40px_rgba(13,12,10,0.04)]">
      <div className="flex items-center justify-between border-b border-[#DED9D2] pb-[18px]">
        <span className="font-mono text-[0.62rem] font-bold tracking-[0.3em] text-[#0D0C0A] uppercase">
          Downward Drift Model
        </span>
        <span className="flex items-center gap-2 font-mono text-[0.55rem] font-bold tracking-[0.3em] text-[#B09460] uppercase">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#B09460]" /> Active
        </span>
      </div>

      {/* Interactive SVG Curve Visualizer */}
      <div className="relative h-[120px] w-full overflow-hidden rounded-lg border border-[#EDE8E1] bg-[#F5F3EE]">
        <svg viewBox="0 0 400 120" className="block h-full w-full">
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B09460" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#B09460" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="grayGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B2B0AB" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#B2B0AB" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background Total Range Curve */}
          <path d="M 10,110 Q 200,10 390,110 Z" fill="url(#grayGradient)" />
          <path d="M 10,110 Q 200,10 390,110" stroke="#B2B0AB" strokeWidth="0.8" strokeDasharray="3 3" fill="none" />

          {/* Active Range Curve */}
          <path d={activePath} fill="url(#goldGradient)" className="transition-[d] duration-300 ease-in-out" />
          <path
            d={`M ${xStart},110 Q ${controlX},${controlY} ${xEnd},110`}
            stroke="#B09460"
            strokeWidth="1.5"
            fill="none"
            className="transition-[d] duration-300 ease-in-out"
          />

          {/* Threshold marker */}
          <line
            x1={xStart}
            y1="10"
            x2={xStart}
            y2="110"
            stroke={sizingColorHex}
            strokeWidth="1"
            strokeDasharray="2 2"
            className="transition-all duration-300 ease-in-out"
          />
          <circle cx={xStart} cy="60" r="3" fill={sizingColorHex} className="transition-all duration-300 ease-in-out" />

          {/* Text labels */}
          <text x="15" y="25" fill="#888680" fontFamily="var(--font-mono)" fontSize="7" letterSpacing="1">
            MÃOS FRACAS
          </text>
          <text x="310" y="25" fill="#888680" fontFamily="var(--font-mono)" fontSize="7" letterSpacing="1">
            MÃOS FORTES
          </text>
          <text
            x={Math.max(15, xStart - 45)}
            y="105"
            fill={sizingColorHex}
            fontFamily="var(--font-mono)"
            fontSize="7"
            fontWeight="bold"
            letterSpacing="0.5"
            className="transition-all duration-300 ease-in-out"
          >
            CORTE: {minEquity}% EQ
          </text>
        </svg>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between font-mono text-[0.6rem] tracking-[0.25em] text-[#888680] uppercase">
          <span>Risk Premium da Mesa</span>
          <span className="font-bold text-[#0D0C0A]">{rp}%</span>
        </div>
        <div className="relative h-1 overflow-hidden rounded-full bg-[#EDE8E1]">
          <progress
            value={rp}
            max="35"
            className="absolute inset-0 h-full w-full appearance-none bg-transparent [&::-moz-progress-bar]:bg-[#B09460] [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:bg-[#B09460]"
            aria-hidden="true"
          />
          <input
            type="range"
            min="0"
            max="35"
            value={rp}
            onChange={(e) => setRp(Number(e.target.value))}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label="Risk Premium"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Frequência de Bet', value: `${betFreq}%` },
          { label: 'Eq. mínima p/ Bet', value: `${minEquity}%` },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-[#DED9D2] bg-[#F5F3EE] px-[18px] py-[16px] transition-all duration-300"
          >
            <p className="mb-2 font-mono text-[0.56rem] font-bold tracking-[0.25em] text-[#888680] uppercase">
              {item.label}
            </p>
            <p className="font-display text-[1.45rem] leading-none font-bold tracking-[-0.02em] text-[#0D0C0A]">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-[#DED9D2] bg-[#F5F3EE] px-[20px] py-[18px] transition-all duration-300">
        <span className="font-mono text-[0.58rem] font-bold tracking-[0.25em] text-[#888680] uppercase">
          Sizing recomendado
        </span>
        <span className={`font-mono text-[0.72rem] font-bold transition-colors duration-300 ${sizingColorClass}`}>
          {sizing}
        </span>
      </div>
    </div>
  );
}
