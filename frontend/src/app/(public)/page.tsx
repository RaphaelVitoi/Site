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
      num: 1, title: 'O Problema e o Mapa', desc: 'Fundamentos de precificação e risco.',
      topics: ['ICM desde a mão 1 (não apenas na bolha)', 'Risk Premium: definição precisa, cálculo e intuição', 'RP vs Bubble Factor: relações de equidade', 'Calculadora de valuation de stacks em FTs reais'],
    },
    {
      num: 2, title: 'Toy-Games como Laboratório', desc: 'Isolamento de variáveis estratégicas.',
      topics: ['Justificativa metodológica: isolamento de variáveis', '5 Toy-Games: RP progressivo no OOP (RP 0 → 24)', '3 Toy-Games: RP invertido no IP (CL vs Short)', 'Conceitos emergentes: Teto do RP e Vantagem de Risco'],
    },
    {
      num: 3, title: 'ICM Pós-Flop — A Fronteira', desc: 'O Downward Drift no pós-flop.',
      topics: ['Por que o edge migrou do pré-flop para o pós-flop', 'Downward Drift: transformação de sizings e ações', 'SPR e distribuição do Risk Premium por street', 'Covering advantage e premium check-back'],
    },
    {
      num: 4, title: 'Variáveis Contextuais', desc: 'Impactos e dinâmica de torneios.',
      topics: ['Estruturas de payout (Flat vs Top-Heavy)', 'FGS (Future Game Simulation) vs ICM clássico', 'Torneios KO/Bounty: colisão de RP e Bounty Power', 'Dinâmica de CL: leverage futuro e risco de ruína'],
    },
    {
      num: 5, title: 'Aplicação Prática e Conexões', desc: 'Heurísticas de combate em tempo real.',
      topics: ['Checklist de bolso "Antevisão" e 10 erros comuns', 'Configuração de laboratório solo com solvers', 'Loss aversion sob a ótica da Prospect Theory', 'Teoria de Sistemas: a mesa como organismo integrado'],
    },
  ];

  return (
    <div className="light-page min-h-screen font-body overflow-x-hidden" style={{ color: '#1C1B1A' }}>

      {/* ════════════════════════════════════════════════════════════
          HERO — Classical Mastpiece
      ════════════════════════════════════════════════════════════ */}
      <section className="relative flex flex-col items-center text-center px-6 pt-52 pb-36 overflow-hidden">
        {/* Subtle Fibonacci watermark in background */}
        <div className="absolute top-10 right-10 opacity-[0.03] pointer-events-none select-none">
          <svg width="450" height="450" viewBox="0 0 320 320" fill="none">
            <path d="M 320 320 Q 320 160 160 160" stroke="#0D0C0A" strokeWidth="0.6" fill="none"/>
            <path d="M 160 160 Q 160 260 60 260" stroke="#0D0C0A" strokeWidth="0.5" fill="none"/>
            <path d="M 60 260 Q 60 222 98 222" stroke="#0D0C0A" strokeWidth="0.5" fill="none"/>
            <path d="M 98 222 Q 122 222 122 184" stroke="#0D0C0A" strokeWidth="0.4" fill="none"/>
          </svg>
        </div>

        {/* Eyebrow */}
        <div className="flex items-center gap-5 mb-12 opacity-50">
          <div style={{ width: 34, height: 1, background: '#1C1B1A' }} />
          <span className="font-mono tracking-[0.55em] uppercase" style={{ fontSize: '0.6rem', color: '#1C1B1A' }}>
            Poker Racional · Risk Premium Edition
          </span>
          <div style={{ width: 34, height: 1, background: '#1C1B1A' }} />
        </div>

        {/* Monumental Pacioli Logo */}
        <div className="mb-14 flex items-center justify-center relative">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" className="opacity-80 transition-all duration-700 hover:scale-105">
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
        <h1 className="font-display tracking-tight leading-[1.05] mb-8"
          style={{ fontSize: 'clamp(2.8rem,8vw,6.5rem)', color: '#0D0C0A', maxWidth: '18ch' }}>
          O Edge Mudou<br />de Lugar.
        </h1>

        {/* Subheadline */}
        <p className="font-normal leading-[1.8] mb-6 max-w-xl mx-auto"
          style={{ fontSize: 'clamp(1.1rem,1.8vw,1.35rem)', color: '#262423' }}>
          Jogar ChipEV em spots de mesa final custa, em média,{' '}
          <span style={{ color: '#0D0C0A', fontWeight: 700 }}>mais de 10% do seu ROI</span>{' '}
          — e a maioria dos profissionais ainda não sabe disso.
        </p>

        {/* Tertiary line */}
        <p className="font-mono uppercase tracking-[0.45em] mb-14"
          style={{ fontSize: '0.62rem', color: '#888680' }}>
          ICM Pós-Flop · Downward Drift · Risk Premium
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
          <Link href="/simulador"
            className="transition-all duration-300 shadow-[0_4px_16px_rgba(13,12,10,0.05)] hover:shadow-[0_8px_24px_rgba(13,12,10,0.1)]"
            style={{
              padding: '15px 34px', background: '#0D0C0A', color: '#F5F3EE',
              borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
              letterSpacing: '0.28em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 10,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#2A2825')}
            onMouseLeave={e => (e.currentTarget.style.background = '#0D0C0A')}
          >
            <i className="fa-solid fa-scale-unbalanced" style={{ color: '#B09460' }} /> Simulador Mestre
          </Link>
          <Link href="/simulador/gto-cfr"
            className="transition-all duration-300"
            style={{
              padding: '15px 34px', background: 'transparent', color: '#262423',
              border: '1px solid #DED9D2', borderRadius: 6,
              fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
              letterSpacing: '0.28em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 10,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#0D0C0A'; e.currentTarget.style.color = '#0D0C0A'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#DED9D2'; e.currentTarget.style.color = '#262423'; }}
          >
            <i className="fa-solid fa-network-wired" style={{ color: '#B09460' }} /> Laboratório CFR
          </Link>
          <Link href="/biblioteca"
            className="transition-all duration-300"
            style={{
              padding: '15px 34px', background: 'transparent', color: '#888680',
              border: '1px solid #EDE8E1', borderRadius: 6,
              fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
              letterSpacing: '0.28em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 10,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#DED9D2'; e.currentTarget.style.color = '#262423'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#EDE8E1'; e.currentTarget.style.color = '#888680'; }}
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
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-16 items-center">
          {/* Left */}
          <div className="space-y-8">
            <Label>A Tese Central</Label>
            <h2 className="font-display tracking-tight leading-[1.1]"
              style={{ fontSize: 'clamp(2rem,3.5vw,2.8rem)', color: '#0D0C0A' }}>
              A "Mentira" do ICM Tradicional
            </h2>
            <div style={{ width: 40, height: 1, background: '#B09460' }} />
            <div className="space-y-6" style={{ color: '#262423', fontSize: '1.12rem', lineHeight: '1.85' }}>
              <p>
                Se você é como a maioria dos regulares de MTT, aprendeu que o ICM é um simples interruptor que "liga" na bolha ou na mesa final. Estudou tabelas de Push/Fold. Dominou o HRC e o ICMIZER.
              </p>
              <p>
                <span style={{ color: '#0D0C0A', fontWeight: 700 }}>A verdade é dura:</span> o poker evoluiu, e o seu edge no pré-flop está desaparecendo. Hoje, os solvers resolveram essa dinâmica — o gap de habilidade real no pré-flop é mínimo.
              </p>
              <p className="font-serif italic" style={{ color: '#0D0C0A', fontSize: '1.18rem', lineHeight: '1.75' }}>
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
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-16 items-start">
          <div className="space-y-5">
            <Label>Telemetria</Label>
            <h2 className="font-display tracking-tight leading-[1.1]"
              style={{ fontSize: 'clamp(2rem,3vw,2.5rem)', color: '#0D0C0A' }}>
              O Custo<br />Invisível
            </h2>
            <p className="font-mono uppercase tracking-[0.35em]" style={{ fontSize: '0.58rem', color: '#B2B0AB' }}>
              GTO Wizard Data
            </p>
          </div>
          <div className="space-y-6 pt-2" style={{ color: '#262423', fontSize: '1.12rem', lineHeight: '1.85' }}>
            <blockquote className="pl-6 font-serif italic" style={{ borderLeft: '2px solid #B09460', color: '#1C1B1A', fontSize: '1.2rem', lineHeight: '1.75' }}>
              "Jogar uma estratégia padrão de ChipEV em spots de mesa final custa, em média, 10% a 12% de todo o buy-in do torneio em $EV."
            </blockquote>
            <p>Em potes 3-bet? O erro custa mais de <span style={{ color: '#0D0C0A', fontWeight: 700 }}>30% do valor da jogada</span>.</p>
            <p>Você grindou por 8 horas. Chegou na FT. E em duas decisões de c-bet mal calibradas, devolveu todo o lucro esperado do torneio. Não porque jogou "mal", mas porque utilizou a matemática errada.</p>
          </div>
        </div>
      </Section>

      <Rule />

      {/* ════════════════════════════════════════════════════════════
          VIDEO — Gallery Frame
      ════════════════════════════════════════════════════════════ */}
      <Section>
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <EyebrowCentered>Transmissão Técnica</EyebrowCentered>
            <h2 className="font-display tracking-tight text-center"
              style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', color: '#0D0C0A' }}>
              Comentários Estratégicos
            </h2>
            <p className="mx-auto font-normal max-w-lg" style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#262423' }}>
              Mergulho audiovisual na física do poker sob pressão de ICM e a simulação de Toy-Games.
            </p>
          </div>

          {/* Gallery frame video wrap */}
          <div style={{
            padding: '12px',
            border: '1px solid #DED9D2',
            borderRadius: 6,
            background: '#FAFAF8',
            boxShadow: '0 8px 32px rgba(13,12,10,0.04)',
          }}>
            <div style={{
              position: 'relative',
              borderRadius: 4,
              border: '1px solid #B09460',
              background: '#0D0C0A',
              overflow: 'hidden',
            }}>
              {/* Overlay label */}
              <div className="absolute top-0 left-0 right-0 z-10 px-6 py-3.5 flex items-center justify-between pointer-events-none"
                style={{
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.45), transparent)',
                  fontFamily: 'var(--font-mono)', fontSize: '0.55rem',
                  letterSpacing: '0.35em', textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.3)'
                }}>
                <span>raphaelvitoi.mp4</span>
                <span>Poker Racional · SOTA</span>
              </div>
              <video
                ref={videoRef}
                src="/raphaelvitoi.mp4"
                autoPlay muted loop playsInline
                className={`w-full transition-opacity duration-[1.2s] ${videoReady ? 'opacity-100' : 'opacity-0'}`}
                style={{ aspectRatio: '16/9', objectFit: 'cover', display: 'block' }}
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
          <div className="text-center space-y-4">
            <EyebrowCentered>O Mapa</EyebrowCentered>
            <h2 className="font-display tracking-tight text-center"
              style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', color: '#0D0C0A' }}>
              ICM Pós-Flop — A Fronteira
            </h2>
            <p className="mx-auto font-normal max-w-lg" style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#262423' }}>
              Não tabelas de push/fold. A física do jogo pós-flop sob pressão extrema de mesas finais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { num: 'I', title: 'O Downward Drift', desc: 'A heurística que ajusta automaticamente seus sizings e frequências para a realidade do ICM pós-flop, evitando vazamento silencioso de $EV.' },
              { num: 'II', title: 'Toy-Games de Laboratório', desc: 'Cenários puros para provar matematicamente conceitos contra-intuitivos — às vezes, quem tem menos risco deve foldar mais.' },
              { num: 'III', title: 'O Teto do Risk Premium', desc: 'Por que overbluffar o Chip Leader é suicídio matemático, e onde está o limite preciso da agressão e do fold-equity.' },
              { num: 'IV', title: 'A Mesa como Organismo', desc: 'Como uma colisão de all-in entre dois oponentes altera instantaneamente a utilidade do seu próprio stack, sem você tocar nas fichas.' },
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
          <div className="text-center space-y-4">
            <EyebrowCentered>Estrutura de Ensino</EyebrowCentered>
            <h2 className="font-display tracking-tight text-center"
              style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', color: '#0D0C0A' }}>
              Ementa Completa — 5 Módulos
            </h2>
            <p className="mx-auto font-normal max-w-xl" style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#262423' }}>
              Uma jornada técnica do problema à aplicação prática de estratégias não-lineares.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[38.2%_61.8%] gap-8 items-start">
            {/* Index list */}
            <div className="flex flex-col gap-2">
              {modules.map((m, idx) => (
                <button
                  key={m.num}
                  onClick={() => setActiveModule(idx)}
                  className="flex items-center justify-between rounded px-5 py-4 text-left transition-all duration-300"
                  style={{
                    background: activeModule === idx ? '#0D0C0A' : 'transparent',
                    color: activeModule === idx ? '#F5F3EE' : '#8A8880',
                    border: activeModule === idx ? '1px solid #0D0C0A' : '1px solid #DED9D2',
                    fontFamily: 'var(--font-mono)', fontSize: '0.66rem', letterSpacing: '0.12em',
                  }}
                  onMouseEnter={e => { if (activeModule !== idx) { e.currentTarget.style.color = '#0D0C0A'; e.currentTarget.style.borderColor = '#0D0C0A'; } }}
                  onMouseLeave={e => { if (activeModule !== idx) { e.currentTarget.style.color = '#8A8880'; e.currentTarget.style.borderColor = '#DED9D2'; } }}
                >
                  <span style={{ fontWeight: 700 }}>MÓDULO 0{m.num}</span>
                  <span className="text-right leading-tight" style={{ fontSize: '0.6rem', opacity: 0.8, maxWidth: 120 }}>{m.title}</span>
                </button>
              ))}
            </div>

            {/* Content Detail Panel */}
            <div className="rounded-xl p-8 lg:p-10 min-h-[340px] flex flex-col justify-between"
              style={{ background: '#FAFAF7', border: '1px solid #DED9D2', boxShadow: '0 4px 20px rgba(13,12,10,0.02)' }}>
              {modules[activeModule] && (
                <div className="space-y-8">
                  <div>
                    <p className="font-mono uppercase tracking-[0.35em] mb-3.5" style={{ fontSize: '0.6rem', color: '#B09460', fontWeight: 700 }}>
                      Módulo 0{modules[activeModule].num} · {modules[activeModule].desc}
                    </p>
                    <h3 className="font-display tracking-tight" style={{ fontSize: '1.8rem', color: '#0D0C0A', lineHeight: 1.2 }}>
                      {modules[activeModule].title}
                    </h3>
                  </div>
                  <div style={{ height: 1, background: '#DED9D2' }} />
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {modules[activeModule].topics.map((t, i) => (
                      <li key={i} className="flex gap-3 items-start font-serif" style={{ fontSize: '1.05rem', lineHeight: '1.65', color: '#262423' }}>
                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#B09460', flexShrink: 0, marginTop: 9 }} />
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
                      <Link key={cta.href} href={cta.href}
                        className="flex items-center gap-2 transition-all duration-300"
                        style={{
                          padding: '10px 22px', border: '1px solid #DED9D2', borderRadius: 4,
                          fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.28em',
                          textTransform: 'uppercase', color: '#262423',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#0D0C0A'; e.currentTarget.style.color = '#0D0C0A'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#DED9D2'; e.currentTarget.style.color = '#262423'; }}
                      >
                        <i className={`fa-solid ${cta.icon}`} style={{ color: '#B09460' }} /> {cta.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
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
          <div className="text-center space-y-4">
            <EyebrowCentered>Diferenciação</EyebrowCentered>
            <h2 className="font-display tracking-tight text-center"
              style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', color: '#0D0C0A' }}>
              Por que o Poker Racional é Diferente?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: 'I', title: 'Metodologia de Toy-Games', desc: 'Isolamento cirúrgico de variáveis para construir intuição profunda antes de aplicá-las a situações de jogo complexo.' },
              { num: 'II', title: 'Conceitos Nomeados Próprios', desc: 'Termos e heurísticas originais: Teto do Risk Premium, Downward Drift, Vantagem de Risco.' },
              { num: 'III', title: 'ICM Pós-Flop como Tese', desc: 'Focamos na maior e mais inexplorada fronteira de ROI: o pós-flop sob pressão de mesas finais.' },
              { num: 'IV', title: 'Crítica Fundamentada a Solvers', desc: 'Entender solvers como mapa, não território, para explorar erros humanos com precisão analítica.' },
              { num: 'V', title: 'Conexões Interdisciplinares', desc: 'Prospect Theory, Teoria dos Sistemas e Nash sob lentes estruturais — embasando cada ação técnica.', wide: true },
            ].map((p) => (
              <PillarCard 
                key={p.num} 
                num={p.num} 
                title={p.title} 
                desc={p.desc} 
                {...(p.wide ? { wide: true } : {})} 
              />
            ))}
          </div>
        </div>
      </Section>

      <Rule />

      {/* ════════════════════════════════════════════════════════════
          BÔNUS
      ════════════════════════════════════════════════════════════ */}
      <Section>
        <div className="rounded-xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-12"
          style={{ background: '#FAFAF8', border: '1px solid #DED9D2', boxShadow: '0 4px 20px rgba(13,12,10,0.02)' }}>
          <div className="space-y-5 max-w-xl">
            <p className="font-mono uppercase tracking-[0.4em]" style={{ fontSize: '0.6rem', color: '#B09460', fontWeight: 700 }}>Bônus Exclusivo</p>
            <h3 className="font-display tracking-tight" style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', color: '#0D0C0A', lineHeight: 1.25 }}>
              Checklist de Bolso<br />"Antevisão"
            </h3>
            <p className="font-serif leading-[1.8]" style={{ fontSize: '1.1rem', color: '#262423' }}>
              Guia prático passo-a-passo para calibrar sua mente antes de cada mão em uma FT. Nunca mais entre em um spot sem saber quem cobre quem e qual é o Risk Premium atual da mesa.
            </p>
          </div>
          <div className="shrink-0 relative z-10">
            <Link href="/biblioteca"
              className="flex items-center gap-3 whitespace-nowrap transition-all duration-300"
              style={{
                padding: '16px 36px', background: '#0D0C0A', color: '#F5F3EE',
                borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
                letterSpacing: '0.28em', textTransform: 'uppercase',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#2A2825')}
              onMouseLeave={e => (e.currentTarget.style.background = '#0D0C0A')}
            >
              <i className="fa-solid fa-download" style={{ color: '#B09460' }} /> Resgatar na Biblioteca
            </Link>
          </div>
        </div>
      </Section>

      <Rule />

      {/* ════════════════════════════════════════════════════════════
          AUTOR — trueicm.com official bio & social alignments
      ════════════════════════════════════════════════════════════ */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-[38.2%_61.8%] gap-0 items-start">

          {/* Left Column — φ-proportion identity */}
          <div className="space-y-8 lg:pr-16 pb-14 lg:pb-0">
            <div>
              <Label>O especialista por trás do TrueICM</Label>
              <h2 className="font-display tracking-tight leading-[0.95] mt-5"
                style={{ fontSize: 'clamp(2.5rem,5vw,3.6rem)', color: '#0D0C0A' }}>
                Raphael<br />Vitoi
              </h2>
              <p className="font-mono uppercase mt-4"
                style={{ fontSize: '0.6rem', letterSpacing: '0.45em', color: '#B09460', fontWeight: 700 }}>
                Educador · Profissional · Escritor
              </p>
            </div>

            <div style={{ height: 1, background: '#DED9D2' }} />

            {/* Roman style stats scale */}
            <div className="grid grid-cols-3 gap-0">
              {[
                { value: '10+', label: 'Anos de Mesa' },
                { value: '90', label: 'Quizzes Criados' },
                { value: '10', label: 'Fontes Validadas' },
              ].map((s, i) => (
                <div key={s.label} style={{
                  borderLeft: i > 0 ? '1px solid #DED9D2' : undefined,
                  paddingLeft: i > 0 ? 16 : 0, paddingBottom: 4,
                }}>
                  <p className="font-display"
                    style={{ fontSize: '1.8rem', color: '#B09460', letterSpacing: '-0.03em', lineHeight: 1, fontWeight: 700 }}>
                    {s.value}
                  </p>
                  <p className="font-mono uppercase"
                    style={{ fontSize: '0.52rem', letterSpacing: '0.3em', color: '#888680', marginTop: 8 }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {['ICM e Risk Premium', 'GTO e Equilíbrio', 'Embaixador GTO Wizard', 'Psicologia (UEMG)'].map(tag => (
                <span key={tag} style={{
                  fontSize: '0.65rem', color: '#262423',
                  border: '1px solid #DED9D2', borderRadius: 999,
                  padding: '6px 14px',
                }}>
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
                <Link key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label}
                  className="flex items-center justify-center transition-all duration-300"
                  style={{
                    width: 42, height: 42, border: '1px solid #DED9D2',
                    borderRadius: 6, color: '#888680', background: '#FAFAF7',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#0D0C0A'; e.currentTarget.style.color = '#0D0C0A'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#DED9D2'; e.currentTarget.style.color = '#888680'; }}
                >
                  <i className={`fa-brands ${s.icon}`} style={{ fontSize: 14 }} />
                </Link>
              ))}
            </div>
          </div>

          {/* Right Column — exact trueicm biography refined semantic */}
          <div className="space-y-8 w-full">
            <div style={{ height: 1, background: '#DED9D2' }} />

            <div className="space-y-6 font-serif"
              style={{ fontSize: '1.15rem', lineHeight: '1.85', color: '#262423' }}>
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.4em] text-[#B09460] font-bold">
                A intersecção entre Geometria do Risco, Teoria dos Jogos e Ciência do Comportamento
              </p>
              <p>
                Formado em Psicologia pela UEMG, Raphael transpõe o estudo dos processos cognitivos para o ambiente lógico do poker. Sua metodologia abdica de intuições vagas em favor de{' '}
                <span style={{ color: '#0D0C0A', fontWeight: 700 }}>Análise Bayesiana</span>,{' '}
                <span style={{ color: '#0D0C0A', fontWeight: 700 }}>Teoria de Sistemas</span>{' '}
                e <span style={{ color: '#0D0C0A', fontWeight: 700 }}>Análise Socrática</span>.
                Cada torneio é visto como um ecossistema de variáveis matemáticas e psicológicas que exige resposta fundamentada.
              </p>
              <p>
                Membro-fundador de times como RegLife, MRJ Poker Team, Like A Boss e DuckRiver. Ex-instrutor do 4bet. Especialista e embaixador DeepSolver e GTO Wizard. Todo o conteúdo do TrueICM nasceu de centenas de horas de estudo e validação cruzada com{' '}
                <span style={{ color: '#0D0C0A', fontWeight: 700 }}>10 fontes independentes</span>.
              </p>
            </div>

            <blockquote style={{
              borderLeft: '1.5px solid #B09460', paddingLeft: 22,
              fontSize: '1.1rem', lineHeight: '1.8',
              fontStyle: 'italic', color: '#1C1B1A',
            }}>
              "O edge não está nas cartas que você recebe, mas na precisão com que você avalia o risco de jogá-las."
            </blockquote>

            <div className="flex flex-wrap gap-4 pt-3 relative z-10">
              <Link href="/quem-sou"
                className="flex items-center gap-2 transition-all duration-300"
                style={{
                  padding: '13px 28px', background: '#0D0C0A', color: '#F5F3EE',
                  borderRadius: 6, fontFamily: 'var(--font-mono)',
                  fontSize: '0.63rem', letterSpacing: '0.28em', textTransform: 'uppercase',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#2A2825')}
                onMouseLeave={e => (e.currentTarget.style.background = '#0D0C0A')}
              >
                Ver a trilha completa
              </Link>
              <Link href="https://trueicm.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 transition-all duration-300"
                style={{
                  padding: '13px 28px', color: '#262423',
                  border: '1px solid #DED9D2', borderRadius: 6,
                  fontFamily: 'var(--font-mono)', fontSize: '0.63rem',
                  letterSpacing: '0.28em', textTransform: 'uppercase',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#0D0C0A'; e.currentTarget.style.color = '#0D0C0A'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#DED9D2'; e.currentTarget.style.color = '#262423'; }}
              >
                TrueICM.com <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '0.52rem', marginLeft: 4 }} />
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
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '0 40px' }}>
      <div style={{ height: 1, background: '#DED9D2' }} />
    </div>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <section style={{ maxWidth: 1040, margin: '0 auto', padding: '96px 40px' }}>
      {children}
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <div style={{ width: 24, height: 1, background: '#B09460' }} />
      <span className="font-mono uppercase tracking-[0.45em]"
        style={{ fontSize: '0.6rem', color: '#888680', fontWeight: 700 }}>
        {children}
      </span>
    </div>
  );
}

function EyebrowCentered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-5">
      <div style={{ width: 24, height: 1, background: '#DED9D2' }} />
      <span className="font-mono uppercase tracking-[0.45em]"
        style={{ fontSize: '0.6rem', color: '#888680', fontWeight: 700 }}>
        {children}
      </span>
      <div style={{ width: 24, height: 1, background: '#DED9D2' }} />
    </div>
  );
}

function PillarCard({ num, title, desc, wide }: { num: string; title: string; desc: string; wide?: boolean }) {
  return (
    <div
      className={`rounded transition-all duration-500 group ${wide ? 'md:col-span-2' : ''}`}
      style={{
        padding: '30px 32px', border: '1px solid #DED9D2', background: '#FAFAF7',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(176,148,96,0.55)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 30px rgba(176,148,96,0.06)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#DED9D2';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      <p className="font-mono tracking-[0.35em] mb-4.5" style={{ fontSize: '0.58rem', color: '#B09460', fontWeight: 700 }}>{num}</p>
      <h4 style={{ fontSize: '0.88rem', color: '#0D0C0A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>{title}</h4>
      <p className="font-serif" style={{ fontSize: '1.05rem', color: '#262423', lineHeight: '1.76' }}>{desc}</p>
    </div>
  );
}

function DownwardDriftWidget() {
  const [rp, setRp] = useState(15);
  const betFreq = Math.max(12, Math.round(65 - rp * 1.35));
  const minEquity = Math.min(80, Math.round(50 + rp * 0.5));
  let sizing = 'Grande — 75% pot'; let sizingColor = '#B09460';
  if (rp > 10 && rp <= 22) { sizing = 'Pequeno — 30% pot'; sizingColor = '#4A8C6F'; }
  else if (rp > 22) { sizing = 'Check — 0% pot'; sizingColor = '#9B4444'; }

  return (
    <div className="rounded-xl space-y-6"
      style={{ padding: '34px 34px', border: '1px solid #DED9D2', background: '#FAFAF8', boxShadow: '0 4px 24px rgba(13,12,10,0.01)' }}>
      <div className="flex justify-between items-center" style={{ paddingBottom: 18, borderBottom: '1px solid #DED9D2' }}>
        <span className="font-mono uppercase tracking-[0.3em]" style={{ fontSize: '0.62rem', color: '#0D0C0A', fontWeight: 700 }}>Downward Drift Model</span>
        <span className="font-mono uppercase tracking-[0.3em] animate-pulse" style={{ fontSize: '0.55rem', color: '#B09460', fontWeight: 700 }}>Active</span>
      </div>

      <div className="space-y-3.5">
        <div className="flex justify-between font-mono uppercase tracking-[0.25em]" style={{ fontSize: '0.6rem', color: '#888680' }}>
          <span>Risk Premium da Mesa</span>
          <span style={{ color: '#0D0C0A', fontWeight: 700 }}>{rp}%</span>
        </div>
        <div style={{ position: 'relative', height: 3, borderRadius: 9999, background: '#EDE8E1', cursor: 'pointer' }}>
          <div style={{ height: '100%', width: `${(rp / 35) * 100}%`, background: '#B09460', borderRadius: 9999, transition: 'width 0.15s ease' }} />
          <input
            type="range" min="0" max="35" value={rp}
            onChange={(e) => setRp(Number(e.target.value))}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
            style={{ height: '100%' }}
            aria-label="Risk Premium"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Frequência de Bet', value: `${betFreq}%` },
          { label: 'Eq. mínima p/ Bet', value: `${minEquity}%` },
        ].map((item) => (
          <div key={item.label} className="rounded" style={{ padding: '16px 18px', border: '1px solid #DED9D2', background: '#F5F3EE' }}>
            <p className="font-mono uppercase tracking-[0.25em]" style={{ fontSize: '0.56rem', color: '#888680', marginBottom: 8, fontWeight: 700 }}>{item.label}</p>
            <p className="font-display" style={{ fontSize: '1.45rem', color: '#0D0C0A', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded flex items-center justify-between" style={{ padding: '15px 18px', border: '1px solid #DED9D2', background: '#F5F3EE' }}>
        <span className="font-mono uppercase tracking-[0.25em]" style={{ fontSize: '0.58rem', color: '#888680', fontWeight: 700 }}>Sizing recomendado</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, color: sizingColor, transition: 'color 0.3s' }}>{sizing}</span>
      </div>
    </div>
  );
}
