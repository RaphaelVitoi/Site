/**
 * IDENTITY: Página Manifesto / Quem Sou
 * PATH: src/app/quem-sou/page.tsx
 * ROLE: Apresentar Raphael Vitoi - bio, vídeo, manifesto, badges.
 * BINDING: [layout.tsx, globals.css]
 */

import { SectionHeader } from '@/components/ui/SectionHeader';
import Link from 'next/link';

export const metadata = {
  title: 'Quem é Raphael Vitoi | Manifesto',
  description: 'Educador, Estrategista, Profissional de Poker, Escritor e Especialista em Sistemas Complexos.',
};

export default function QuemSouPage () {
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
              O Manifesto
            </h1>
            <p style={ { margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: '580px' } }>
              Educador, Estrategista, Profissional de Poker, Escritor e Especialista em Sistemas Complexos.
            </p>
            <div style={ { display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.8rem' } }>
              <span style={ {
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '0.35rem 0.75rem', borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)',
                fontSize: '0.65rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em',
              } }>
                <span style={ { width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.5)' } } />
                { ' ' }Identidade
              </span>
              <span style={ { fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" } }>
                Sobre o Autor
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

      {/* Video Player */ }
      <SectionHeader
        step="01"
        label="Apresentação"
        title="Raphael Vitoi"
        description="Educador e Profissional de Poker há mais de dez anos, decodificando a complexidade dos sistemas para jogadores que buscam o topo da cadeia alimentar."
      />
      <div style={ { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' } }>
        <div className="video-wrapper">
          <div className="video-container">
            <video controls autoPlay muted playsInline preload="metadata">
              <source src="/0309.mp4" type="video/mp4" />
              Seu navegador não suporta a tag de vídeo.
            </video>
          </div>
        </div>
      </div>

      <SectionHeader
        step="02"
        label="Filosofia"
        title="Sistemas Complexos e Teoria dos Jogos"
        description="A abordagem transita entre a Análise Bayesiana, Preditiva e Recursiva, focando na adaptação estratégica e análise comportamental."
      />
      <div style={ { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 6rem' } }>
        <div className="glass-panel p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl shadow-indigo-500/10 rounded-2xl">
          <div className="prose prose-invert prose-lg max-w-none text-slate-300">
            <p>Educador e Profissional de Poker há mais de dez anos, Raphael Vitoi é um especialista em <strong>Sistemas Complexos, ICM, Multiway Spots e Teoria dos Jogos</strong>. Sua abordagem transita entre a <strong>Análise Bayesiana, Preditiva e Recursiva</strong>, focando na adaptação estratégica e análise comportamental (GTO e desvio).</p>
            <p>Além das mesas, mergulha na <strong>Psicologia do Poker</strong>, dissecando os vieses cognitivos que custam dinheiro.</p>

            <div className="callout callout-secondary my-8">
              <p style={ { marginBottom: 0 } }><strong>Polimata e Estrategista:</strong> Raphael não ensina apenas &quot;cartas&quot;; ele ensina arquitetura de decisão. Como <strong>Embaixador Deepsolver</strong>, <strong>Afiliado GTO Wizard</strong> e criador do <strong>trueICM</strong>, ele decodifica a complexidade dos sistemas para jogadores que buscam o topo da cadeia alimentar.</p>
            </div>

            <p style={ { fontStyle: 'italic', fontSize: '1.25rem', textAlign: 'center', margin: '3rem 0', color: 'var(--text-main)' } }>
              &quot;O poker não é sobre sorte. É sobre a gestão elegante da incerteza.&quot;
            </p>

            <div style={ { marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' } }>
              <a href="https://deepsolver.com" target="_blank" rel="noopener" className="badge-link badge-link-primary">Embaixador Deepsolver</a>
              <a href="https://gtowizard.com" target="_blank" rel="noopener" className="badge-link badge-link-emerald">Afiliado GTO Wizard</a>
              <a href="https://trueicm.com" target="_blank" rel="noopener" className="badge-link badge-link-secondary">Criador trueICM.com</a>
            </div>

            <div style={ { marginTop: '4rem', textAlign: 'center' } }>
              <Link href="/#metodo" className="btn-primary pulse-glow" style={ { padding: '1.1rem 3rem', fontSize: '1rem' } }>
                Conhecer o Método Poker Racional <i className="fa-solid fa-arrow-right" style={ { marginLeft: '8px' } } />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
