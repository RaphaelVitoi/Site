/**
 * IDENTITY: Página Manifesto / Quem Sou
 * PATH: src/app/quem-sou/page.tsx
 * ROLE: Apresentar Raphael Vitoi - bio, vídeo, manifesto, badges.
 * BINDING: [layout.tsx, globals.css]
 */

import Link from 'next/link';

export const metadata = {
  title: 'Quem é Raphael Vitoi | Manifesto',
  description: 'Educador, Estrategista, Profissional de Poker, Escritor e Especialista em Sistemas Complexos.',
};

export default function QuemSouPage() {
  return (
    <main className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 1.5rem' }}>

      <header className="page-header" style={{ paddingBottom: '1rem' }}>
        <p className="page-label">
          <i className="fa-solid fa-user" /> Manifesto
        </p>
        <h1>Sobre o Autor</h1>
        <p className="page-subtitle">Educador, Estrategista, Profissional de Poker, Escritor e Especialista em Sistemas Complexos.</p>
      </header>

      {/* Video Player */}
      <section>
        <div className="video-wrapper">
          <div className="video-container">
            <video controls autoPlay muted playsInline preload="metadata">
              <source src="/0309.mp4" type="video/mp4" />
              Seu navegador não suporta a tag de vídeo.
            </video>
          </div>
        </div>
      </section>

      <section id="manifesto">
        <article style={{ textAlign: 'center', maxWidth: '800px' }}>
          <h3>Sobre o Autor</h3>
          <p>Educador e Profissional de Poker há mais de dez anos, Raphael Vitoi é um especialista em <strong>Sistemas Complexos, ICM, Multiway Spots e Teoria dos Jogos</strong>. Sua abordagem transita entre a <strong>Análise Bayesiana, Preditiva e Recursiva</strong>, focando na adaptação estratégica e análise comportamental (GTO e desvio).</p>
          <p>Além das mesas, mergulha na <strong>Psicologia do Poker</strong>, dissecando os vieses cognitivos que custam dinheiro.</p>

          <div className="callout" style={{ textAlign: 'left', marginTop: '2rem' }}>
            <p><strong>Polimata e Estrategista:</strong> Raphael não ensina apenas &quot;cartas&quot;; ele ensina arquitetura de decisão. Como <strong>Embaixador Deepsolver</strong>, <strong>Afiliado GTO Wizard</strong> e criador do <strong>trueICM</strong>, ele decodifica a complexidade dos sistemas para jogadores que buscam o topo da cadeia alimentar.</p>
          </div>

          <p><em>&quot;O poker não é sobre sorte. É sobre a gestão elegante da incerteza.&quot;</em></p>

          <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            <a href="https://deepsolver.com" target="_blank" rel="noopener" className="badge-link badge-link-primary">Embaixador Deepsolver</a>
            <a href="https://gtowizard.com" target="_blank" rel="noopener" className="badge-link badge-link-emerald">Afiliado GTO Wizard</a>
            <a href="https://trueicm.com" target="_blank" rel="noopener" className="badge-link badge-link-secondary">Criador trueICM.com</a>
          </div>

          <div style={{ marginTop: '3rem' }}>
            <Link href="/#metodo" className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.8rem 2.5rem' }}>
              Conhecer o Método Poker Racional <i className="fa-solid fa-arrow-right" style={{ marginLeft: '6px' }} />
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
