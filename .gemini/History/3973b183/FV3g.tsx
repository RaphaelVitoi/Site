'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fecha o menu mobile ao navegar
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <header className="main-header">
        <div className="container">
          <h1 className="logo">
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <i className="fa-solid fa-brain" style={{ color: 'var(--accent-primary)', fontSize: '1.25rem', filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.5))' }} />
              <span style={{ fontWeight: 800, letterSpacing: '-0.03em' }}>Poker<span className="accent" style={{ fontWeight: 300 }}>Racional</span></span>
            </Link>
          </h1>
          <nav>
            <ul>
              <li><Link href="/">Início</Link></li>
              <li><Link href="/aula-icm">Geometria do Risco</Link></li>
              <li><Link href="/leitura-icm">ICM</Link></li>
              <li><Link href="/conceitos-icm">Glossário</Link></li>
              <li><Link href="/psicologia-hs">Psicologia</Link></li>
              <li><Link href="/biblioteca">Biblioteca</Link></li>
              <li><Link href="/quem-sou">Quem Sou</Link></li>
              <li><Link href="/tools/simulador"><i className="fa-solid fa-flask" /> Motor ICM</Link></li>
              <li><Link href="/templo/analytics" style={{ color: 'var(--accent-secondary)' }}><i className="fa-solid fa-chart-pie" /> Panóptico</Link></li>
            </ul>
          </nav>
          <button className="hamburger-btn" onClick={() => setMobileOpen(true)} aria-label="Menu">
            <i className="fa-solid fa-bars" />
          </button>
        </div>
      </header>

      {/* Menu Mobile Fullscreen */}
      <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`}>
        <button className="mobile-nav-close" onClick={closeMobile} aria-label="Fechar menu">
          <i className="fa-solid fa-xmark" />
        </button>

        <span className="mobile-nav-section-title">Conteúdo</span>
        <Link href="/" onClick={closeMobile}>
          <i className="fa-solid fa-house" /> Início
        </Link>
        <Link href="/aula-icm" onClick={closeMobile}>
          <i className="fa-solid fa-chalkboard-user" /> Geometria do Risco
        </Link>
        <Link href="/leitura-icm" onClick={closeMobile}>
          <i className="fa-solid fa-file-lines" /> Entendendo o ICM
        </Link>
        <Link href="/conceitos-icm" onClick={closeMobile}>
          <i className="fa-solid fa-book-open" /> Glossário Formal
        </Link>
        <Link href="/artigos/estado-da-arte" onClick={closeMobile}>
          <i className="fa-solid fa-lightbulb" /> Estado da Arte 2025
        </Link>
        <Link href="/artigos/smart-sniper" onClick={closeMobile}>
          <i className="fa-solid fa-bullseye" /> Protocolo Smart Sniper
        </Link>
        <Link href="/psicologia-hs" onClick={closeMobile}>
          <i className="fa-solid fa-brain" /> Psicologia High Stakes
        </Link>

        <span className="mobile-nav-section-title">Laboratório</span>
        <Link href="/tools/simulador" onClick={closeMobile}>
          <i className="fa-solid fa-flask" /> Motor ICM
        </Link>
        <Link href="/templo/analytics" onClick={closeMobile} style={{ color: 'var(--accent-secondary)' }}>
          <i className="fa-solid fa-chart-pie" /> Panóptico de EV
        </Link>

        <span className="mobile-nav-section-title">Mais</span>
        <Link href="/biblioteca" onClick={closeMobile}>
          <i className="fa-solid fa-book" /> Biblioteca Epistêmica
        </Link>
        <Link href="/quem-sou" onClick={closeMobile}>
          <i className="fa-solid fa-user" /> Quem Sou
        </Link>
      </div>
    </>
  );
};

export default Header;
