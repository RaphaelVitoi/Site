'use client';

import Logo from '@/components/ui/Logo';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState( false );

  // Fecha o menu mobile ao navegar
  useEffect( () => {
    if ( mobileOpen ) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen] );

  const closeMobile = () => setMobileOpen( false );

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-white/5 transition-all duration-300">
        <div className="sota-container h-20 flex items-center justify-between gap-4 lg:gap-8">

          {/* LOGO: ZONA DE PRIORIDADE */ }
          <div className="shrink-0 group">
            <Logo />
          </div>

          {/* NAV DESKTOP: OCULTA EM MOBILE/TABLET PARA EVITAR COLISÃO */ }
          <nav className="hidden lg:flex items-center flex-1 justify-center overflow-hidden">
            <ul className="flex items-center gap-1">
              { [
                { href: '/', label: 'Início' },
                { href: '/aulas/icm-masterclass', label: 'Geometria' },
                { href: '/aulas/leitura-icm', label: 'ICM' },
                { href: '/aulas/conceitos-icm', label: 'Glossário' },
                { href: '/biblioteca', label: 'Biblioteca' },
                { href: '/simulador', label: 'Motor ICM', icon: 'fa-flask' },
              ].map( ( item ) => (
                <li key={ item.href }>
                  <Link
                    href={ item.href }
                    className="px-4 py-2 text-[0.7rem] font-black uppercase tracking-widest text-text-muted hover:text-text-bright transition-all flex items-center gap-2 whitespace-nowrap"
                  >
                    { item.icon && <i className={ `fa-solid ${item.icon} text-accent-indigo text-[0.6rem]` } /> }
                    { item.label }
                  </Link>
                </li>
              ) ) }
              <li>
                <Link href="/templo/analytics" className="px-4 py-2 text-[0.7rem] font-black uppercase tracking-widest text-accent-rose hover:text-accent-rose-light transition-all flex items-center gap-2 whitespace-nowrap">
                  <i className="fa-solid fa-chart-pie text-[0.6rem]" /> Panóptico
                </Link>
              </li>
            </ul>
          </nav>

          {/* ACTIONS / MOBILE TRIGGER */ }
          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            <Link href="/simulador" className="hidden md:flex btn-primary px-4 lg:px-6 py-2 rounded-xl text-[0.65rem] font-black tracking-widest transition-all">
              LAUNCH ENGINE
            </Link>
            <button
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-text-muted hover:text-text-bright lg:hidden transition-all"
              onClick={ () => setMobileOpen( true ) }
              aria-label="Menu"
            >
              <i className="fa-solid fa-bars-staggered" />
            </button>
          </div>

        </div>
      </header>

      {/* Menu Mobile Fullscreen */ }
      <div className={ `mobile-nav backdrop-blur-xl bg-slate-950/95 ${mobileOpen ? 'open' : ''}` }>
        <button className="mobile-nav-close" onClick={ closeMobile } aria-label="Fechar menu">
          <i className="fa-solid fa-xmark" />
        </button>

        <span className="mobile-nav-section-title">Conteúdo</span>
        <Link href="/" onClick={ closeMobile }>
          <i className="fa-solid fa-house" /> Início
        </Link>
        <Link href="/aulas/icm-masterclass" onClick={ closeMobile }>
          <i className="fa-solid fa-chalkboard-user" /> Geometria do Risco
        </Link>
        <Link href="/aulas/leitura-icm" onClick={ closeMobile }>
          <i className="fa-solid fa-file-lines" /> Entendendo o ICM
        </Link>
        <Link href="/aulas/conceitos-icm" onClick={ closeMobile }>
          <i className="fa-solid fa-book-open" /> Glossário Formal
        </Link>
        <Link href="/artigos/estado-da-arte" onClick={ closeMobile }>
          <i className="fa-solid fa-lightbulb" /> Estado da Arte 2025
        </Link>
        <Link href="/artigos/smart-sniper" onClick={ closeMobile }>
          <i className="fa-solid fa-bullseye" /> Protocolo Smart Sniper
        </Link>
        <Link href="/artigos/psicologia-hs" onClick={ closeMobile }>
          <i className="fa-solid fa-brain" /> Psicologia High Stakes
        </Link>

        <span className="mobile-nav-section-title">Laboratório</span>
        <Link href="/simulador" onClick={ closeMobile }>
          <i className="fa-solid fa-flask" /> Motor ICM
        </Link>
        <Link href="/templo/analytics" onClick={ closeMobile } style={ { color: 'var(--accent-secondary)' } }>
          <i className="fa-solid fa-chart-pie" /> Panóptico de EV
        </Link>

        <span className="mobile-nav-section-title">Mais</span>
        <Link href="/biblioteca" onClick={ closeMobile }>
          <i className="fa-solid fa-book" /> Biblioteca Epistêmica
        </Link>
        <Link href="/quem-sou" onClick={ closeMobile }>
          <i className="fa-solid fa-user" /> Quem Sou
        </Link>
      </div>
    </>
  );
};

export default Header;
