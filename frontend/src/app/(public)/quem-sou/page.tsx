'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

/* ─── Design Philosophy ──────────────────────────────────────────────────────
   Classical elegance. Fibonacci proportions (φ ≈ 1.618).
   Every grid: 38.2% / 61.8%. Every space: φ⁻¹ of the next.
   Palette:
     canvas     #F5F3EE   (aged paper — warm, breathable)
     card       #FAFAF7   (lifted surface)
     ink        #0D0C0A   (absolute — quill on vellum)
     body       #262423   (highly readable dark-grey)
     muted      #888680   (secondary)
     ghost      #B2B0AB   (labels, hairlines)
     rule       #DED9D2   (hairline dividers)
     gold       #B09460   (single warm accent — terracotta gold)
   ─────────────────────────────────────────────────────────────────────────── */

export default function QuemSouPage() {
  const [videoReady, setVideoReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play()
      .then(() => {
        setIsPlaying(true);
        setVideoReady(true);
      })
      .catch(() => setVideoReady(true));
  }, []);

  return (
    <div className="light-page font-body min-h-screen overflow-x-hidden text-[#0D0C0A]">
      {/* ════════════════════════════════════════════════════════════
          I. MASTHEAD — editorial, generous, asymmetric
      ════════════════════════════════════════════════════════════ */}
      <header className="relative overflow-hidden border-b border-[#DED9D2] pt-48 pb-24">
        {/* Fibonacci watermark — near invisible */}
        <FibonacciMark />

        <div className="mx-auto max-w-[1040px] px-10">
          {/* Breadcrumb */}
          <nav className="mb-14 flex items-center gap-3 font-mono text-[0.55rem] tracking-[0.45em] text-[#888680] uppercase">
            <Link href="/" className="text-[#888680] no-underline transition-colors hover:text-[#0D0C0A]">
              Home
            </Link>
            <span className="text-[#DED9D2]">·</span>
            <span className="text-[#0D0C0A]">O Autor</span>
          </nav>

          {/* φ-split headline grid: 38% label / 62% title */}
          <div className="grid grid-cols-1 items-end gap-0 lg:grid-cols-[38.2%_61.8%]">
            {/* Left — identity label column */}
            <div className="mb-8 space-y-5 lg:mb-0 lg:pr-20">
              <div className="mb-5 h-px w-8 bg-[#B09460]" />
              <p className="font-mono text-[0.6rem] tracking-[0.5em] text-[#B09460] uppercase">Especialista em ICM</p>
              <p className="max-w-[300px] text-[1.1rem] leading-[1.75] font-normal text-[#262423]">
                Educador, jogador profissional e escritor. Mais de uma década desconstruindo o jogo.
              </p>
            </div>

            {/* Right — name */}
            <div>
              <h1 className="font-display text-[clamp(4rem,10vw,8.5rem)] leading-[0.9] font-black tracking-[-0.02em] text-[#0D0C0A]">
                Raphael
                <br />
                Vitoi
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════
          II. IDENTITY — φ grid with stat orchestra
      ════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-[1040px] px-10 py-24">
        <div className="grid grid-cols-1 items-start gap-0 lg:grid-cols-[38.2%_61.8%]">
          {/* ── Left column ── */}
          <div className="space-y-8 pb-16 lg:pr-20 lg:pb-0">
            {/* Abstract sigil — classical, minimal */}
            <ClassicalSigil />

            {/* Stat triad — like Roman numerals */}
            <div className="grid grid-cols-3 gap-0">
              {[
                { value: '10+', label: 'Anos de Mesa' },
                { value: '90', label: 'Quizzes Criados' },
                { value: '10', label: 'Fontes Validadas' },
              ].map((s, i) => (
                <div key={s.label} className={`py-6 ${i > 0 ? 'border-l border-[#DED9D2] pl-5' : ''}`}>
                  <p className="font-display text-[2rem] leading-none font-black tracking-[-0.03em] text-[#B09460]">
                    {s.value}
                  </p>
                  <p className="mt-2 font-mono text-[0.52rem] tracking-[0.35em] text-[#888680] uppercase">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Expertise tags */}
            <div className="flex flex-wrap gap-2">
              {['ICM e Risk Premium', 'GTO e Equilíbrio', 'Embaixador GTO Wizard', 'Psicologia (UEMG)'].map((tag) => (
                <span
                  key={tag}
                  className="font-body rounded-full border border-[#DED9D2] px-[14px] py-[6px] text-[0.65rem] font-normal tracking-[0.01em] text-[#262423]"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Social links — refined */}
            <div className="flex gap-2">
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
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#DED9D2] bg-[#FAFAF7] text-[#888680] no-underline transition-all duration-300 hover:border-[#0D0C0A] hover:text-[#0D0C0A]"
                >
                  <i className={`fa-brands ${s.icon} text-[13px]`} />
                </Link>
              ))}
            </div>
          </div>

          {/* ── Right column — biography ── */}
          <div className="space-y-8">
            <div className="h-px bg-[#DED9D2]" />

            <div className="space-y-6 text-[1.15rem] leading-[1.85] font-normal text-[#262423]">
              <p className="clear-both">
                <span className="font-display float-left mt-1.5 mr-3 text-6xl leading-[0.8] font-black text-[#B09460]">
                  F
                </span>
                ormado em Psicologia pela UEMG, Raphael transpõe o estudo dos processos cognitivos para o ambiente
                lógico do poker. Sua metodologia abdica de intuições vagas em favor de{' '}
                <span className="font-bold text-[#0D0C0A]">Análise Bayesiana</span>,{' '}
                <span className="font-bold text-[#0D0C0A]">Teoria de Sistemas</span> e{' '}
                <span className="font-bold text-[#0D0C0A]">Análise Socrática</span>. Cada torneio é um ecossistema de
                variáveis matemáticas e psicológicas que exige resposta fundamentada.
              </p>
              <p>
                Membro-fundador de times como RegLife, MRJ Poker Team, Like A Boss e DuckRiver. Ex-instrutor do 4bet.
                Especialista e embaixador DeepSolver e GTO Wizard. Todo o conteúdo nasceu de centenas de horas de estudo
                e validação cruzada com <span className="font-bold text-[#0D0C0A]">10 fontes independentes</span>.
              </p>
            </div>

            <blockquote className="my-2 border-l-[1.5px] border-[#B09460] pl-6 text-[1.05rem] leading-[1.75] font-normal text-[#1A1916] italic">
              "O edge não está nas cartas que você recebe, mas na precisão com que você avalia o risco de jogá-las."
            </blockquote>

            {/* CTA */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/"
                className="flex items-center gap-3 transition-all duration-300"
                style={{
                  padding: '13px 28px',
                  background: '#0D0C0A',
                  color: '#F5F3EE',
                  borderRadius: 8,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#2A2825')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#0D0C0A')}
              >
                Ver a trilha completa
              </Link>
              <Link
                href="https://trueicm.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-[#DED9D2] bg-transparent px-7 py-[13px] font-mono text-[0.65rem] tracking-[0.3em] text-[#262423] uppercase no-underline transition-all duration-300 hover:border-[#0D0C0A] hover:text-[#0D0C0A]"
              >
                TrueICM.com <i className="fa-solid fa-arrow-up-right-from-square text-[0.55rem]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <GoldenRule />

      {/* ════════════════════════════════════════════════════════════
          III. VÍDEO — museu, frame austero
      ════════════════════════════════════════════════════════════ */}
      <ClassicalSection>
        <div className="space-y-12">
          <SectionLabel left>Análise de Fluxo</SectionLabel>
          <h2 className="font-display text-[clamp(1.8rem,3.5vw,2.6rem)] leading-[1.1] font-black tracking-tight text-[#0D0C0A]">
            A Perspectiva Soberana
          </h2>
          <p className="max-w-[500px] text-[1.07rem] leading-[1.78] font-normal text-[#262423]">
            Transmissão audiovisual sobre a física do pôquer, solvers e o ecossistema analítico Nexus.
          </p>

          {/* Video — gallery frame aesthetic */}
          <div className="relative overflow-hidden rounded border border-[#DED9D2] bg-[#0D0C0A] shadow-[0_8px_64px_rgba(13,12,10,0.12),0_2px_8px_rgba(13,12,10,0.06)]">
            <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 flex items-center justify-between bg-linear-to-b from-black/40 to-transparent px-5 py-[14px] font-mono text-[0.52rem] tracking-[0.38em] text-white/25 uppercase">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block h-[5px] w-[5px] rounded-full ${isPlaying ? 'bg-white/50' : 'bg-white/15'}`}
                />{' '}
                raphaelvitoi.mp4
              </div>
              <span>Raphael Vitoi · Poker Racional</span>
            </div>
            <video
              ref={videoRef}
              src="/raphaelvitoi.mp4"
              autoPlay
              muted
              loop
              playsInline
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onCanPlay={() => setVideoReady(true)}
              className={`block aspect-video w-full object-cover transition-opacity duration-[1.2s] ease-in-out ${videoReady ? 'opacity-100' : 'opacity-0'}`}
            />
          </div>
        </div>
      </ClassicalSection>

      <GoldenRule />

      {/* ════════════════════════════════════════════════════════════
          IV. TIMELINE — manuscript scroll
      ════════════════════════════════════════════════════════════ */}
      <ClassicalSection>
        <SectionLabel left>Trajetória</SectionLabel>
        <h2 className="font-display mt-5 mb-16 text-[clamp(1.8rem,3.5vw,2.6rem)] leading-[1.1] font-black tracking-tight text-[#0D0C0A]">
          Evolução no Poker de Elite
        </h2>

        <div className="relative ml-2 space-y-16 border-l border-[#DED9D2] pl-12">
          {[
            {
              period: '2013–2015',
              tag: 'Fundação',
              title: 'MTT Engineering Phase',
              desc: 'Início da carreira profissional nas mesas de MTT. Foco estrito em estruturação probabilística, modelagens de equidade e consolidação da teoria clássica de Nash no pré-flop.',
            },
            {
              period: '2016–2019',
              tag: 'Instrução',
              title: 'Escola 4bet',
              desc: 'Instrutor no time 4bet — o maior e mais conceituado do Brasil. Formação técnica de centenas de profissionais, refinamento de grades e implementação de metodologias de estudo baseadas em evidências.',
            },
            {
              period: '2019–2022',
              tag: 'Head Coach',
              title: 'Times Nacionais de Elite',
              desc: 'Direção Técnica em grandes times — Like a Boss, DRJ, MRJ Poker Team e Evolution Poker Team. Implementação pioneira de GTO Wizard, DeepSolver e Nodelocking para exploração populacional.',
            },
            {
              period: '2023–Presente',
              tag: 'Arquitetura',
              title: 'Monolito Nexus & TrueICM',
              desc: 'Desenvolvimento do Framework de Perspectiva Matemática, lançamento do TrueICM.com e da plataforma Monolito Nexus — motores em WebAssembly e IA local para simulações estratégicas em tempo real.',
              active: true,
            },
          ].map((node) => (
            <div key={node.title} className="group/node relative">
              {/* Dot */}
              <div
                className={`absolute top-[5px] left-[-55px] h-[13px] w-[13px] rounded-full bg-[#F5F3EE] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/node:scale-125 group-hover/node:border-[#B09460] group-hover/node:bg-white ${node.active ? 'border-[1.5px] border-[#B09460]' : 'border border-[#C8C4BC]'}`}
              />
              <div className="space-y-2.5 transition-all duration-500 group-hover/node:translate-x-1.5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded border border-[#EDE8E1] px-[10px] py-1 font-mono text-[0.62rem] tracking-[0.2em] text-[#B09460]">
                    {node.period}
                  </span>
                  <span className="font-mono text-[0.52rem] tracking-[0.38em] text-[#888680] uppercase">
                    {node.tag}
                  </span>
                </div>
                <h3 className="text-[1.05rem] leading-[1.2] font-bold tracking-[-0.01em] text-[#0D0C0A]">
                  {node.title}
                </h3>
                <p className="max-w-[600px] text-[1.05rem] leading-[1.78] font-normal text-[#262423]">{node.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </ClassicalSection>

      <GoldenRule />

      {/* ════════════════════════════════════════════════════════════
          V. PILARES — four classical axioms
      ════════════════════════════════════════════════════════════ */}
      <ClassicalSection bottom>
        <SectionLabel left>Fundamentos</SectionLabel>
        <h2 className="font-display mt-5 mb-5 text-[clamp(1.8rem,3.5vw,2.6rem)] leading-[1.1] font-black tracking-tight text-[#0D0C0A]">
          Pilares Teóricos
        </h2>
        <p className="mb-14 max-w-[500px] text-[1.07rem] leading-[1.78] font-normal text-[#262423]">
          Os axiomas que regem a inteligência preditiva por trás de toda a modelagem estratégica.
        </p>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {[
            {
              roman: 'I',
              title: 'ICM Dinâmico',
              desc: 'A tradução não-linear do stack em valor monetário real. Preservação utilitária contra a ruína estrutural, não acúmulo cego de fichas.',
            },
            {
              roman: 'II',
              title: 'Nodelocking & Exploit',
              desc: 'Ajuste fino de árvores de decisão. O GTO como âncora, o nodelock para quantificar e punir desvios populacionais com precisão matemática.',
            },
            {
              roman: 'III',
              title: 'Passivos Estruturais',
              desc: 'A severidade das Reverse Implied Odds em potes multiway. O passivo dilata com fator quadrático em relação ao número de oponentes ativos.',
            },
            {
              roman: 'IV',
              title: 'Curva de Utilidade Real',
              desc: 'Integração da Prospect Theory. Perdas e ganhos sofrem deformações cognitivas baseadas no tamanho relativo do stack e nas cegas atuais.',
            },
          ].map((p) => (
            <div
              key={p.roman}
              className="cursor-default rounded border border-[#DED9D2] bg-[#FAFAF7] px-8 py-7 transition-all duration-400 ease-in-out hover:border-[#B09460]/40 hover:shadow-[0_4px_32px_rgba(176,148,96,0.08)]"
            >
              <p className="font-display mb-[14px] text-[0.85rem] font-black tracking-widest text-[#DED9D2]">
                {p.roman}
              </p>
              <h4 className="mb-3 text-[0.88rem] font-bold tracking-[0.04em] text-[#0D0C0A] uppercase">{p.title}</h4>
              <p className="text-[0.97rem] leading-[1.76] font-normal text-[#262423]">{p.desc}</p>
            </div>
          ))}
        </div>
      </ClassicalSection>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function GoldenRule() {
  return (
    <div className="mx-auto max-w-[1040px] px-10">
      <div className="h-px bg-[#DED9D2]" />
    </div>
  );
}

function ClassicalSection({ children, bottom }: { readonly children: React.ReactNode; readonly bottom?: boolean }) {
  return <section className={`mx-auto max-w-[1040px] px-10 ${bottom ? 'pt-24 pb-32' : 'py-24'}`}>{children}</section>;
}

function SectionLabel({ children, left }: { readonly children: React.ReactNode; readonly left?: boolean }) {
  return (
    <div className={`flex items-center gap-4 ${left ? '' : 'justify-center'}`}>
      <div className="h-px w-6 bg-[#B09460]" />
      <span className="font-mono text-[0.58rem] tracking-[0.48em] text-[#888680] uppercase">{children}</span>
    </div>
  );
}

/** Near-invisible Fibonacci watermark — pure geometry */
function FibonacciMark() {
  return (
    <div className="pointer-events-none absolute top-[60px] right-[60px] opacity-[0.055] select-none">
      <svg width="320" height="320" viewBox="0 0 320 320" fill="none">
        {/* Fibonacci squares approximation */}
        <rect x="160" y="160" width="160" height="160" stroke="#0D0C0A" strokeWidth="0.6" />
        <rect x="60" y="160" width="100" height="100" stroke="#0D0C0A" strokeWidth="0.6" />
        <rect x="60" y="222" width="62" height="62" stroke="#0D0C0A" strokeWidth="0.5" />
        <rect x="60" y="160" width="38" height="38" stroke="#0D0C0A" strokeWidth="0.5" />
        <rect x="98" y="160" width="24" height="24" stroke="#0D0C0A" strokeWidth="0.4" />
        {/* Spiral arc approximations */}
        <path d="M 320 320 Q 320 160 160 160" stroke="#0D0C0A" strokeWidth="0.6" fill="none" />
        <path d="M 160 160 Q 160 260 60 260" stroke="#0D0C0A" strokeWidth="0.5" fill="none" />
        <path d="M 60 260 Q 60 222 98 222" stroke="#0D0C0A" strokeWidth="0.5" fill="none" />
        <path d="M 98 222 Q 122 222 122 184" stroke="#0D0C0A" strokeWidth="0.4" fill="none" />
      </svg>
    </div>
  );
}

/** Classical observatory sigil — rings and sweep */
function ClassicalSigil() {
  return (
    <div className="group/sigil relative flex aspect-square w-full max-w-[260px] items-center justify-center overflow-hidden rounded border border-[#DED9D2] bg-[#FAFAF7] transition-all duration-700 hover:scale-[1.03] hover:border-[#B09460]/40 hover:shadow-[0_12px_36px_rgba(176,148,96,0.08)]">
      <svg
        viewBox="0 0 160 160"
        fill="none"
        className="h-[68%] w-[68%] transition-transform duration-1000 group-hover/sigil:rotate-12"
      >
        {/* Outer ring */}
        <circle cx="80" cy="80" r="72" stroke="#DED9D2" strokeWidth="0.5" />
        {/* φ ring: r = 72/φ ≈ 44.5 */}
        <circle cx="80" cy="80" r="44.5" stroke="#D2CCC4" strokeWidth="0.45" />
        {/* Inner ring: r = 44.5/φ ≈ 27.5 */}
        <circle
          cx="80"
          cy="80"
          r="27.5"
          stroke="#B09460"
          strokeWidth="0.4"
          strokeOpacity="0.5"
          fill="rgba(176,148,96,0.02)"
        />
        {/* Cardinal hairlines */}
        <line x1="80" y1="8" x2="80" y2="152" stroke="#E8E3DC" strokeWidth="0.4" strokeDasharray="2 3.5" />
        <line x1="8" y1="80" x2="152" y2="80" stroke="#E8E3DC" strokeWidth="0.4" strokeDasharray="2 3.5" />
        {/* 45° diagonals */}
        <line x1="29" y1="29" x2="131" y2="131" stroke="#E8E3DC" strokeWidth="0.3" strokeOpacity="0.6" />
        <line x1="131" y1="29" x2="29" y2="131" stroke="#E8E3DC" strokeWidth="0.3" strokeOpacity="0.6" />
        {/* Sweep arm — animated */}
        <line
          x1="80"
          y1="80"
          x2="124"
          y2="36"
          stroke="#B09460"
          strokeWidth="0.7"
          strokeOpacity="0.5"
          className="origin-[80px_80px] animate-[spin_14s_linear_infinite]"
        />
        {/* Cardinal nodes */}
        <circle cx="80" cy="8" r="1.8" fill="#B09460" opacity="0.55" />
        <circle cx="152" cy="80" r="1.8" fill="#B09460" opacity="0.55" />
        <circle cx="80" cy="152" r="1.8" fill="#B09460" opacity="0.3" />
        <circle cx="8" cy="80" r="1.8" fill="#B09460" opacity="0.3" />
        {/* Active blip on arm tip */}
        <circle cx="124" cy="36" r="2.2" fill="#B09460" opacity="0.6">
          <animate attributeName="opacity" values="0.6;0.15;0.6" dur="3s" repeatCount="indefinite" />
        </circle>
        {/* Absolute center */}
        <circle cx="80" cy="80" r="3" fill="#0D0C0A" />
      </svg>

      {/* Corner bracket ornaments */}
      {[
        { top: 14, left: 14, bt: true, bl: true },
        { top: 14, right: 14, bt: true, br: true },
        { bottom: 14, left: 14, bb: true, bl: true },
        { bottom: 14, right: 14, bb: true, br: true },
      ].map((c) => (
        <div
          key={`bracket-${c.top || c.bottom}-${c.left || c.right}`}
          className={`absolute h-4 w-4 ${c.top ? 'top-[14px]' : ''} ${c.bottom ? 'bottom-[14px]' : ''} ${c.left ? 'left-[14px]' : ''} ${c.right ? 'right-[14px]' : ''} ${c.bt ? 'border-t border-[#B09460]/30' : ''} ${c.bb ? 'border-b border-[#B09460]/30' : ''} ${c.bl ? 'border-l border-[#B09460]/30' : ''} ${c.br ? 'border-r border-[#B09460]/30' : ''}`}
        />
      ))}

      {/* Status */}
      <div className="absolute bottom-4 flex items-center gap-1.5 font-mono text-[0.52rem] tracking-[0.32em] text-[#888680] uppercase">
        <span className="inline-block h-[5px] w-[5px] animate-[pulse_2.5s_ease-in-out_infinite] rounded-full bg-[#7DC3A0]" />{' '}
        Ativo · Head Coach
      </div>
    </div>
  );
}
