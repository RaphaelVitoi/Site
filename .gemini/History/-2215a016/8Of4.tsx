'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/aulas/icm-masterclass', label: 'Geometria' },
  { href: '/biblioteca', label: 'Biblioteca' },
  { href: '/dashboard', label: 'Dashboard' },
];

const Header = () =>
{
  const [ mobileOpen, setMobileOpen ] = useState( false );
  const [ scrolled, setScrolled ] = useState( false );
  const pathname = usePathname();

  // Fecha o menu mobile ao navegar e lida com scroll
  useEffect( () =>
  {
    if ( mobileOpen )
    {
      document.body.style.overflow = 'hidden';
    } else
    {
      document.body.style.overflow = '';
    }

    const handleScroll = () =>
    {
      setScrolled( window.scrollY > 20 );
    };

    window.addEventListener( 'scroll', handleScroll );
    return () =>
    {
      document.body.style.overflow = '';
      window.removeEventListener( 'scroll', handleScroll );
    };
  }, [ mobileOpen ] );

  const closeMobile = () => setMobileOpen( false );

  return (
    <>
      <motion.header
        initial={ { y: -100 } }
        animate={ { y: 0 } }
        transition={ { duration: 0.6, ease: [ 0.16, 1, 0.3, 1 ] } }
        className={ `fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${ scrolled
          ? 'py-3 bg-bg-base/80 backdrop-blur-2xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
          : 'py-6 bg-transparent border-transparent'
          }` }
      >
        <div className="sota-container flex items-center justify-between gap-6">
          {/* LOGO: FIXA PARA EVITAR COLISÃO */ }
          <div className="shrink-0">
            <Link href="/" className="group relative flex items-center gap-3 focus:outline-none">
              <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-black/20 border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.03)] transition-all duration-700 group-hover:border-white/20 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                 <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 transition-transform duration-700 group-hover:scale-110 text-white">
                   <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                   <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                   <path d="M2 7V17" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                   <path d="M22 7V17" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                   <path d="M12 12V22" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                 </svg>
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[1.15rem] font-black tracking-tighter text-white leading-none">
                  POKER<span className="font-light text-white/70 tracking-widest ml-0.5">RACIONAL</span>
                </span>
                <span className="text-[0.55rem] font-bold uppercase tracking-[0.35em] text-accent-indigo-light mt-1.5 leading-none">
                  Nexus System
                </span>
              </div>
            </Link>
          </div>

          {/* NAV DESKTOP: PILULA ELEGANTE */ }
          <nav className="hidden lg:flex items-center justify-center">
            <ul className="flex items-center p-1.5 sota-glass-pill">
              { navItems.map( ( item ) =>
              {
                const isActive = pathname === item.href;
                return (
                  <li key={ item.href } className="relative">
                    <Link
                      href={ item.href }
                      className={ `relative z-10 px-5 py-2.5 text-[0.65rem] font-black uppercase tracking-[0.15em] transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${ isActive ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'text-text-muted hover:text-white'
                        }` }
                    >
                      { item.label }
                    </Link>
                    { isActive && (
                      <motion.div
                        layoutId="active-nav"
                        className="absolute inset-0 bg-white/10 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                        transition={ { type: 'spring', bounce: 0.2, duration: 0.6 } }
                      />
                    ) }
                  </li>
                );
              } ) }
            </ul>
          </nav>

          {/* ACTIONS / MOBILE TRIGGER */ }
          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/simulador"
              className="hidden sm:flex relative group px-6 py-2.5 rounded-full overflow-hidden bg-accent-indigo/10 border border-accent-indigo/30 transition-all duration-500 hover:border-accent-indigo hover:bg-accent-indigo/20 hover:shadow-[0_0_30px_rgba(99,102,241,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]"
            >
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <span className="relative text-[0.65rem] font-black tracking-widest text-accent-indigo-light group-hover:text-white transition-colors">
                MOTOR ICM SOTA
              </span>
            </Link>

            <button
              className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10 lg:hidden transition-all focus:outline-none"
              onClick={ () => setMobileOpen( true ) }
              aria-label="Abrir Menu"
            >
              <i className="fa-solid fa-bars-staggered text-lg" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* OVERLAY E MENU MOBILE COM FRAMER MOTION */ }
      <AnimatePresence>
        { mobileOpen && (
          <>
            <motion.div
              initial={ { opacity: 0 } }
              animate={ { opacity: 1 } }
              exit={ { opacity: 0 } }
              transition={ { duration: 0.3 } }
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={ closeMobile }
            />
            <motion.div
              initial={ { x: '100%' } }
              animate={ { x: 0 } }
              exit={ { x: '100%' } }
              transition={ { type: 'spring', damping: 25, stiffness: 200 } }
              className="fixed top-0 right-0 bottom-0 z-50 w-[85vw] max-w-sm bg-bg-deep border-l border-white/10 shadow-2xl flex flex-col pt-24 pb-8 px-8 overflow-y-auto lg:hidden"
            >
              <button
                className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10 transition-all focus:outline-none"
                onClick={ closeMobile }
                aria-label="Fechar menu"
              >
                <i className="fa-solid fa-xmark text-xl" />
              </button>

              <div className="flex flex-col gap-2 mb-8">
                <span className="text-[0.65rem] font-black text-accent-indigo uppercase tracking-[0.2em] mb-2 border-b border-white/5 pb-2">Navegação Principal</span>
                { navItems.map( item => (
                  <Link
                    key={ item.href }
                    href={ item.href }
                    onClick={ closeMobile }
                    className="py-2.5 text-lg font-bold text-text-main hover:text-white transition-colors flex items-center gap-4"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-indigo/50" />
                    { item.label }
                  </Link>
                ) ) }
              </div>

              <div className="flex flex-col gap-2 mb-8">
                <span className="text-[0.65rem] font-black text-accent-rose uppercase tracking-[0.2em] mb-2 border-b border-white/5 pb-2">Inteligência Estratégica</span>
                <Link href="/simulador" onClick={ closeMobile } className="py-2.5 text-lg font-bold text-text-main hover:text-white transition-colors flex items-center gap-4">
                  <i className="fa-solid fa-flask w-6 text-accent-rose/70" />{ ' ' }Motor ICM SOTA
                </Link>
                <Link href="/simulador/gto-cfr" onClick={ closeMobile } className="py-2.5 text-lg font-bold text-text-main hover:text-white transition-colors flex items-center gap-4">
                  <i className="fa-solid fa-network-wired w-6 text-accent-rose/70" />{ ' ' }Laboratório CFR
                </Link>
              </div>

              <div className="mt-auto pt-8 border-t border-white/5">
                <Link
                  href="/quem-sou"
                  onClick={ closeMobile }
                  className="flex items-center gap-4 text-sm font-bold text-text-muted hover:text-white transition-colors"
                >
                  <i className="fa-solid fa-user-astronaut text-accent-indigo" />{ ' ' }
                  O Autor
                </Link>
              </div>
            </motion.div>
          </>
        ) }
      </AnimatePresence>
    </>
  );
};

export default Header;
