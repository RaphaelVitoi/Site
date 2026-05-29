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

const φ = 1.618; // golden ratio — referenced conceptually in spacing decisions

export default function QuemSouPage() {
  const [videoReady, setVideoReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play()
      .then(() => { setIsPlaying(true); setVideoReady(true); })
      .catch(() => setVideoReady(true));
  }, []);

  void φ; // consumed

  return (
    <div className="light-page font-body overflow-x-hidden" style={{ minHeight: '100vh', color: '#0D0C0A' }}>

      {/* ════════════════════════════════════════════════════════════
          I. MASTHEAD — editorial, generous, asymmetric
      ════════════════════════════════════════════════════════════ */}
      <header style={{
        paddingTop: 192, paddingBottom: 96,
        borderBottom: '1px solid #DED9D2',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Fibonacci watermark — near invisible */}
        <FibonacciMark />

        <div style={{ maxWidth: 1040, margin: '0 auto', padding: '0 40px' }}>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-3 font-mono uppercase mb-14"
            style={{ fontSize: '0.55rem', letterSpacing: '0.45em', color: '#888680' }}>
            <Link href="/" style={{ color: '#888680', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#0D0C0A')}
              onMouseLeave={e => (e.currentTarget.style.color = '#888680')}>
              Home
            </Link>
            <span style={{ color: '#DED9D2' }}>·</span>
            <span style={{ color: '#0D0C0A' }}>O Autor</span>
          </nav>

          {/* φ-split headline grid: 38% label / 62% title */}
          <div className="grid grid-cols-1 lg:grid-cols-[38.2%_61.8%] gap-0 items-end">
            {/* Left — identity label column */}
            <div className="mb-8 lg:mb-0 lg:pr-20 space-y-5">
              <div style={{ height: 1, background: '#B09460', width: 32, marginBottom: 20 }} />
              <p className="font-mono uppercase" style={{ fontSize: '0.6rem', letterSpacing: '0.5em', color: '#B09460' }}>
                Especialista em ICM
              </p>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.75', fontWeight: 400, color: '#262423', maxWidth: 300 }}>
                Educador, jogador profissional e escritor. Mais de uma década desconstruindo o jogo.
              </p>
            </div>

            {/* Right — name */}
            <div>
              <h1 className="font-display font-black tracking-tight"
                style={{ fontSize: 'clamp(4rem,10vw,8.5rem)', color: '#0D0C0A', lineHeight: 0.9, letterSpacing: '-0.02em' }}>
                Raphael<br />Vitoi
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════
          II. IDENTITY — φ grid with stat orchestra
      ════════════════════════════════════════════════════════════ */}
      <section style={{ maxWidth: 1040, margin: '0 auto', padding: '96px 40px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-[38.2%_61.8%] gap-0 items-start">

          {/* ── Left column ── */}
          <div className="space-y-8 lg:pr-20 pb-16 lg:pb-0">

            {/* Abstract sigil — classical, minimal */}
            <ClassicalSigil />

            {/* Stat triad — like Roman numerals */}
            <div className="grid grid-cols-3 gap-0">
              {[
                { value: '10+', label: 'Anos de Mesa' },
                { value: '90', label: 'Quizzes Criados' },
                { value: '10', label: 'Fontes Validadas' },
              ].map((s, i) => (
                <div key={s.label} style={{
                  padding: '24px 0',
                  borderLeft: i > 0 ? '1px solid #DED9D2' : undefined,
                  paddingLeft: i > 0 ? 20 : 0,
                }}>
                  <p className="font-display font-black"
                    style={{ fontSize: '2rem', color: '#B09460', letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {s.value}
                  </p>
                  <p className="font-mono uppercase"
                    style={{ fontSize: '0.52rem', letterSpacing: '0.35em', color: '#888680', marginTop: 8 }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Expertise tags */}
            <div className="flex flex-wrap gap-2">
              {['ICM e Risk Premium', 'GTO e Equilíbrio', 'Embaixador GTO Wizard', 'Psicologia (UEMG)'].map(tag => (
                <span key={tag} style={{
                  fontSize: '0.65rem', color: '#262423', fontWeight: 400,
                  border: '1px solid #DED9D2', borderRadius: 999,
                  padding: '6px 14px', fontFamily: 'var(--font-body)', letterSpacing: '0.01em',
                }}>
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
              ].map(s => (
                <Link key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  title={s.label}
                  className="flex items-center justify-center transition-all duration-300"
                  style={{
                    width: 40, height: 40, border: '1px solid #DED9D2',
                    borderRadius: 8, color: '#888680', background: '#FAFAF7',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#0D0C0A'; e.currentTarget.style.color = '#0D0C0A'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#DED9D2'; e.currentTarget.style.color = '#888680'; }}>
                  <i className={`fa-brands ${s.icon}`} style={{ fontSize: 13 }} />
                </Link>
              ))}
            </div>

          </div>

          {/* ── Right column — biography ── */}
          <div className="space-y-8">
            <div style={{ height: 1, background: '#DED9D2' }} />

            <div className="space-y-6"
              style={{ fontSize: '1.15rem', lineHeight: '1.85', fontWeight: 400, color: '#262423' }}>
              <p>
                Formado em Psicologia pela UEMG, Raphael transpõe o estudo dos processos cognitivos para o ambiente lógico do poker. Sua metodologia abdica de intuições vagas em favor de{' '}
                <span style={{ color: '#0D0C0A', fontWeight: 700 }}>Análise Bayesiana</span>,{' '}
                <span style={{ color: '#0D0C0A', fontWeight: 700 }}>Teoria de Sistemas</span> e{' '}
                <span style={{ color: '#0D0C0A', fontWeight: 700 }}>Análise Socrática</span>.
                Cada torneio é um ecossistema de variáveis matemáticas e psicológicas que exige resposta fundamentada.
              </p>
              <p>
                Membro-fundador de times como RegLife, MRJ Poker Team, Like A Boss e DuckRiver. Ex-instrutor do 4bet. Especialista e embaixador DeepSolver e GTO Wizard. Todo o conteúdo nasceu de centenas de horas de estudo e validação cruzada com{' '}
                <span style={{ color: '#0D0C0A', fontWeight: 700 }}>10 fontes independentes</span>.
              </p>
            </div>

            <blockquote style={{
              borderLeft: '1.5px solid #B09460',
              paddingLeft: 24,
              fontSize: '1.05rem',
              lineHeight: '1.75',
              fontStyle: 'italic',
              color: '#1A1916',
              fontWeight: 400,
              margin: '8px 0',
            }}>
              "O edge não está nas cartas que você recebe, mas na precisão com que você avalia o risco de jogá-las."
            </blockquote>

            {/* CTA */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/"
                className="flex items-center gap-3 transition-all duration-300"
                style={{
                  padding: '13px 28px', background: '#0D0C0A', color: '#F5F3EE',
                  borderRadius: 8, fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#2A2825')}
                onMouseLeave={e => (e.currentTarget.style.background = '#0D0C0A')}>
                Ver a trilha completa
              </Link>
              <Link href="https://trueicm.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 transition-all duration-300"
                style={{
                  padding: '13px 28px', background: 'transparent', color: '#262423',
                  border: '1px solid #DED9D2', borderRadius: 8,
                  fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                  letterSpacing: '0.3em', textTransform: 'uppercase', textDecoration: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#0D0C0A'; e.currentTarget.style.color = '#0D0C0A'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#DED9D2'; e.currentTarget.style.color = '#262423'; }}>
                TrueICM.com <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '0.55rem' }} />
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
          <h2 className="font-display font-black tracking-tight"
            style={{ fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', color: '#0D0C0A', lineHeight: 1.1 }}>
            A Perspectiva Soberana
          </h2>
          <p style={{ fontSize: '1.07rem', lineHeight: '1.78', fontWeight: 400, color: '#262423', maxWidth: 500 }}>
            Transmissão audiovisual sobre a física do pôquer, solvers e o ecossistema analítico Nexus.
          </p>

          {/* Video — gallery frame aesthetic */}
          <div style={{
            position: 'relative', borderRadius: 4,
            border: '1px solid #DED9D2',
            background: '#0D0C0A',
            boxShadow: '0 8px 64px rgba(13,12,10,0.12), 0 2px 8px rgba(13,12,10,0.06)',
            overflow: 'hidden',
          }}>
            <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
              style={{
                padding: '14px 20px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)',
                fontFamily: 'var(--font-mono)', fontSize: '0.52rem',
                letterSpacing: '0.38em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.25)',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 5, height: 5, borderRadius: '50%', display: 'inline-block',
                  background: isPlaying ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)',
                }}/>
                raphaelvitoi.mp4
              </div>
              <span>Raphael Vitoi · Poker Racional</span>
            </div>
            <video
              ref={videoRef}
              src="/raphaelvitoi.mp4"
              autoPlay muted loop playsInline
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onCanPlay={() => setVideoReady(true)}
              style={{
                width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block',
                opacity: videoReady ? 1 : 0, transition: 'opacity 1.2s ease',
              }}
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
        <h2 className="font-display font-black tracking-tight mt-5 mb-16"
          style={{ fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', color: '#0D0C0A', lineHeight: 1.1 }}>
          Evolução no Poker de Elite
        </h2>

        <div style={{ position: 'relative', paddingLeft: 48, borderLeft: '1px solid #DED9D2', marginLeft: 8 }}
          className="space-y-16">
          {[
            {
              period: '2013–2015', tag: 'Fundação',
              title: 'MTT Engineering Phase',
              desc: 'Início da carreira profissional nas mesas de MTT. Foco estrito em estruturação probabilística, modelagens de equidade e consolidação da teoria clássica de Nash no pré-flop.',
            },
            {
              period: '2016–2019', tag: 'Instrução',
              title: 'Escola 4bet',
              desc: 'Instrutor no time 4bet — o maior e mais conceituado do Brasil. Formação técnica de centenas de profissionais, refinamento de grades e implementação de metodologias de estudo baseadas em evidências.',
            },
            {
              period: '2019–2022', tag: 'Head Coach',
              title: 'Times Nacionais de Elite',
              desc: 'Direção Técnica em grandes times — Like a Boss, DRJ, MRJ Poker Team e Evolution Poker Team. Implementação pioneira de GTO Wizard, DeepSolver e Nodelocking para exploração populacional.',
            },
            {
              period: '2023–Presente', tag: 'Arquitetura',
              title: 'Monolito Nexus & TrueICM',
              desc: 'Desenvolvimento do Framework de Perspectiva Matemática, lançamento do TrueICM.com e da plataforma Monolito Nexus — motores em WebAssembly e IA local para simulações estratégicas em tempo real.',
              active: true,
            },
          ].map((node, i) => (
            <div key={i} style={{ position: 'relative' }}>
              {/* Dot */}
              <div style={{
                position: 'absolute', left: -55, top: 5,
                width: 13, height: 13, borderRadius: '50%',
                border: node.active ? '1.5px solid #B09460' : '1px solid #C8C4BC',
                background: '#F5F3EE', transition: 'border-color 0.3s',
              }}/>
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono" style={{
                    fontSize: '0.62rem', letterSpacing: '0.2em', color: '#B09460',
                    border: '1px solid #EDE8E1', padding: '4px 10px', borderRadius: 4,
                  }}>{node.period}</span>
                  <span className="font-mono uppercase" style={{ fontSize: '0.52rem', letterSpacing: '0.38em', color: '#888680' }}>
                    {node.tag}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0D0C0A', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                  {node.title}
                </h3>
                <p style={{ fontSize: '1.05rem', lineHeight: '1.78', fontWeight: 400, color: '#262423', maxWidth: 600 }}>
                  {node.desc}
                </p>
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
        <h2 className="font-display font-black tracking-tight mt-5 mb-5"
          style={{ fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', color: '#0D0C0A', lineHeight: 1.1 }}>
          Pilares Teóricos
        </h2>
        <p style={{ fontSize: '1.07rem', lineHeight: '1.78', fontWeight: 400, color: '#262423', maxWidth: 500, marginBottom: 56 }}>
          Os axiomas que regem a inteligência preditiva por trás de toda a modelagem estratégica.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { roman: 'I', title: 'ICM Dinâmico', desc: 'A tradução não-linear do stack em valor monetário real. Preservação utilitária contra a ruína estrutural, não acúmulo cego de fichas.' },
            { roman: 'II', title: 'Nodelocking & Exploit', desc: 'Ajuste fino de árvores de decisão. O GTO como âncora, o nodelock para quantificar e punir desvios populacionais com precisão matemática.' },
            { roman: 'III', title: 'Passivos Estruturais', desc: 'A severidade das Reverse Implied Odds em potes multiway. O passivo dilata com fator quadrático em relação ao número de oponentes ativos.' },
            { roman: 'IV', title: 'Curva de Utilidade Real', desc: 'Integração da Prospect Theory. Perdas e ganhos sofrem deformações cognitivas baseadas no tamanho relativo do stack e nas cegas atuais.' },
          ].map(p => (
            <div key={p.roman}
              style={{
                padding: '28px 32px', border: '1px solid #DED9D2',
                borderRadius: 4, background: '#FAFAF7',
                transition: 'all 0.4s ease', cursor: 'default',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(176,148,96,0.4)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 32px rgba(176,148,96,0.08)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = '#DED9D2';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
              }}>
              <p className="font-display font-black"
                style={{ fontSize: '0.85rem', color: '#DED9D2', marginBottom: 14, letterSpacing: '0.1em' }}>
                {p.roman}
              </p>
              <h4 style={{ fontSize: '0.88rem', color: '#0D0C0A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>
                {p.title}
              </h4>
              <p style={{ fontSize: '0.97rem', color: '#262423', lineHeight: '1.76', fontWeight: 400 }}>
                {p.desc}
              </p>
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
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '0 40px' }}>
      <div style={{ height: 1, background: '#DED9D2' }} />
    </div>
  );
}

function ClassicalSection({ children, bottom }: { children: React.ReactNode; bottom?: boolean }) {
  return (
    <section style={{ maxWidth: 1040, margin: '0 auto', padding: `96px 40px ${bottom ? 128 : 96}px` }}>
      {children}
    </section>
  );
}

function SectionLabel({ children, left }: { children: React.ReactNode; left?: boolean }) {
  return (
    <div className={`flex items-center gap-4 ${left ? '' : 'justify-center'}`}>
      <div style={{ width: 24, height: 1, background: '#B09460' }} />
      <span className="font-mono uppercase" style={{ fontSize: '0.58rem', letterSpacing: '0.48em', color: '#888680' }}>
        {children}
      </span>
    </div>
  );
}

/** Near-invisible Fibonacci watermark — pure geometry */
function FibonacciMark() {
  return (
    <div style={{
      position: 'absolute', right: 60, top: 60,
      opacity: 0.055, pointerEvents: 'none', userSelect: 'none',
    }}>
      <svg width="320" height="320" viewBox="0 0 320 320" fill="none">
        {/* Fibonacci squares approximation */}
        <rect x="160" y="160" width="160" height="160" stroke="#0D0C0A" strokeWidth="0.6"/>
        <rect x="60" y="160" width="100" height="100" stroke="#0D0C0A" strokeWidth="0.6"/>
        <rect x="60" y="222" width="62" height="62" stroke="#0D0C0A" strokeWidth="0.5"/>
        <rect x="60" y="160" width="38" height="38" stroke="#0D0C0A" strokeWidth="0.5"/>
        <rect x="98" y="160" width="24" height="24" stroke="#0D0C0A" strokeWidth="0.4"/>
        {/* Spiral arc approximations */}
        <path d="M 320 320 Q 320 160 160 160" stroke="#0D0C0A" strokeWidth="0.6" fill="none"/>
        <path d="M 160 160 Q 160 260 60 260" stroke="#0D0C0A" strokeWidth="0.5" fill="none"/>
        <path d="M 60 260 Q 60 222 98 222" stroke="#0D0C0A" strokeWidth="0.5" fill="none"/>
        <path d="M 98 222 Q 122 222 122 184" stroke="#0D0C0A" strokeWidth="0.4" fill="none"/>
      </svg>
    </div>
  );
}

/** Classical observatory sigil — rings and sweep */
function ClassicalSigil() {
  return (
    <div style={{
      width: '100%', aspectRatio: '1 / 1', maxWidth: 260,
      border: '1px solid #DED9D2', borderRadius: 4,
      background: '#FAFAF7',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <svg viewBox="0 0 160 160" fill="none" style={{ width: '68%', height: '68%' }}>
        {/* Outer ring */}
        <circle cx="80" cy="80" r="72" stroke="#DED9D2" strokeWidth="0.5"/>
        {/* φ ring: r = 72/φ ≈ 44.5 */}
        <circle cx="80" cy="80" r="44.5" stroke="#D2CCC4" strokeWidth="0.45"/>
        {/* Inner ring: r = 44.5/φ ≈ 27.5 */}
        <circle cx="80" cy="80" r="27.5" stroke="#B09460" strokeWidth="0.4" strokeOpacity="0.5" fill="rgba(176,148,96,0.02)"/>
        {/* Cardinal hairlines */}
        <line x1="80" y1="8" x2="80" y2="152" stroke="#E8E3DC" strokeWidth="0.4" strokeDasharray="2 3.5"/>
        <line x1="8" y1="80" x2="152" y2="80" stroke="#E8E3DC" strokeWidth="0.4" strokeDasharray="2 3.5"/>
        {/* 45° diagonals */}
        <line x1="29" y1="29" x2="131" y2="131" stroke="#E8E3DC" strokeWidth="0.3" strokeOpacity="0.6"/>
        <line x1="131" y1="29" x2="29" y2="131" stroke="#E8E3DC" strokeWidth="0.3" strokeOpacity="0.6"/>
        {/* Sweep arm — animated */}
        <line x1="80" y1="80" x2="124" y2="36" stroke="#B09460" strokeWidth="0.7" strokeOpacity="0.5"
          style={{ transformOrigin: '80px 80px', animation: 'spin 14s linear infinite' }}/>
        {/* Cardinal nodes */}
        <circle cx="80" cy="8" r="1.8" fill="#B09460" opacity="0.55"/>
        <circle cx="152" cy="80" r="1.8" fill="#B09460" opacity="0.55"/>
        <circle cx="80" cy="152" r="1.8" fill="#B09460" opacity="0.3"/>
        <circle cx="8" cy="80" r="1.8" fill="#B09460" opacity="0.3"/>
        {/* Active blip on arm tip */}
        <circle cx="124" cy="36" r="2.2" fill="#B09460" opacity="0.6">
          <animate attributeName="opacity" values="0.6;0.15;0.6" dur="3s" repeatCount="indefinite"/>
        </circle>
        {/* Absolute center */}
        <circle cx="80" cy="80" r="3" fill="#0D0C0A"/>
      </svg>

      {/* Corner bracket ornaments */}
      {[
        { top: 14, left: 14, bt: true, bl: true },
        { top: 14, right: 14, bt: true, br: true },
        { bottom: 14, left: 14, bb: true, bl: true },
        { bottom: 14, right: 14, bb: true, br: true },
      ].map((c, i) => (
        <div key={i} style={{
          position: 'absolute', width: 16, height: 16,
          top: c.top, bottom: c.bottom, left: c.left, right: c.right,
          borderTop: c.bt ? '1px solid rgba(176,148,96,0.3)' : undefined,
          borderBottom: c.bb ? '1px solid rgba(176,148,96,0.3)' : undefined,
          borderLeft: c.bl ? '1px solid rgba(176,148,96,0.3)' : undefined,
          borderRight: c.br ? '1px solid rgba(176,148,96,0.3)' : undefined,
        }}/>
      ))}

      {/* Status */}
      <div style={{
        position: 'absolute', bottom: 16,
        display: 'flex', alignItems: 'center', gap: 6,
        fontFamily: 'var(--font-mono)', fontSize: '0.52rem',
        letterSpacing: '0.32em', textTransform: 'uppercase', color: '#888680',
      }}>
        <span style={{
          width: 5, height: 5, borderRadius: '50%', display: 'inline-block',
          background: '#7DC3A0',
          animation: 'pulse 2.5s ease-in-out infinite',
        }}/>
        Ativo · Head Coach
      </div>
    </div>
  );
}