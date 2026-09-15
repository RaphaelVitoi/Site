'use client';

import { ROUTES } from '@/constants/routes';
import BrandMark from '@/components/ui/layout/BrandMark';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export interface SubmenuItem {
  label: string;
  href: string;
  icon: string;
}

export interface NavItem {
  label: string;
  href: string;
  submenu?: SubmenuItem[];
}

function getNavLinkClass(isLightPage: boolean, isActive: boolean): string {
  if (isLightPage) {
    return isActive
      ? 'text-[var(--color-light-text-main)] drop-shadow-[0_0_12px_rgba(0,0,0,0.05)]'
      : 'text-[var(--color-light-text-muted)] hover:text-[var(--color-light-text-main)]';
  }
  return isActive ? 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]' : 'text-text-muted hover:text-white';
}

function getHeaderBgClass(scrolled: boolean, isLightPage: boolean): string {
  if (!scrolled) {
    return isLightPage
      ? 'py-6 bg-[var(--color-light-canvas)] border-b border-[var(--color-light-border)]'
      : 'py-6 bg-bg-base border-b border-white/10';
  }
  if (isLightPage) {
    return 'py-3 bg-[var(--color-light-surface)] backdrop-blur-3xl border-b border-[var(--color-light-border)] shadow-[0_4px_30px_rgba(0,0,0,0.03)]';
  }
  return 'py-3 bg-bg-base backdrop-blur-3xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]';
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Aulas',
    href: ROUTES.AULAS.INDEX,
    submenu: [
      {
        label: 'Mapa de Aulas',
        href: ROUTES.AULAS.INDEX,
        icon: 'fa-compass',
      },
      {
        label: 'Masterclass',
        href: ROUTES.AULAS.MASTERCLASS,
        icon: 'fa-graduation-cap',
      },
      { label: 'Pós-Flop', href: ROUTES.AULAS.POS_FLOP, icon: 'fa-microchip' },
      {
        label: 'Leitura ICM',
        href: ROUTES.AULAS.LEITURA_ICM,
        icon: 'fa-book-open-reader',
      },
      {
        label: 'Conceitos ICM',
        href: ROUTES.AULAS.CONCEITOS,
        icon: 'fa-scale-unbalanced',
      },
    ],
  },
  {
    label: 'Motores',
    href: ROUTES.SIMULADOR,
    submenu: [
      {
        label: 'Simulador Mestre',
        href: ROUTES.SIMULADOR,
        icon: 'fa-calculator',
      },
      {
        label: 'Distorções ICM',
        href: ROUTES.SIMULADOR_DISTORCOES,
        icon: 'fa-atom',
      },
      {
        label: 'Laboratório GTO / CFR',
        href: ROUTES.SIMULADOR_GTO,
        icon: 'fa-network-wired',
      },
      {
        label: 'Quiz de Estratégia',
        href: ROUTES.QUIZ,
        icon: 'fa-circle-question',
      },
    ],
  },
  {
    label: 'Biblioteca',
    href: ROUTES.BIBLIOTECA,
    submenu: [
      {
        label: 'Downward Drift',
        href: ROUTES.LIBRARY.DOWNWARD_DRIFT,
        icon: 'fa-chart-line',
      },
      {
        label: 'Smart Sniper',
        href: ROUTES.LIBRARY.SMART_SNIPER,
        icon: 'fa-crosshairs',
      },
      {
        label: 'Estado da Arte',
        href: ROUTES.LIBRARY.ESTADO_DA_ARTE,
        icon: 'fa-layer-group',
      },
      { label: 'Todos Artefatos', href: ROUTES.BIBLIOTECA, icon: 'fa-atom' },
    ],
  },
  {
    label: 'Inteligência',
    href: ROUTES.TEMPLO.ANALYTICS,
    submenu: [
      {
        label: 'Panóptico (EV)',
        href: ROUTES.TEMPLO.ANALYTICS,
        icon: 'fa-chart-pie',
      },
      {
        label: 'Telemetria (AGN)',
        href: ROUTES.DASHBOARD,
        icon: 'fa-satellite-dish',
      },
      { label: 'Oráculo (Gemma)', href: ROUTES.TEMPLO.GEMMA, icon: 'fa-brain' },
    ],
  },
];

const HEADER_STRINGS = {
  motorIcm: 'Simulador Mestre',
  author: 'O Autor',
  brandTitle: 'POKER',
  brandSubtitle: 'RACIONAL',
  tagline: 'Nexus · SOTA v7.0 GOLD',
  openMenu: 'Abrir Menu',
  closeMenu: 'Fechar menu',
  oracleOnline: 'Oráculo Online',
  oracleOffline: 'Oráculo Offline',
};

function useHeaderState() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [gemmaOnline, setGemmaOnline] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const isLightPage = pathname === '/' || pathname === '/quem-sou';
  const isContentPage = pathname.startsWith('/biblioteca/') || pathname.startsWith('/aulas/');
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const shouldCheckGemma = Boolean(session) || pathname.startsWith('/templo');

  useEffect(() => {
    if (!shouldCheckGemma) {
      setGemmaOnline(false);
      return;
    }

    const checkGemma = () => {
      fetch('/api/v1/gemma')
        .then((res) => setGemmaOnline(res.ok))
        .catch(() => setGemmaOnline(false));
    };
    checkGemma();
    const intervalId = setInterval(checkGemma, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [shouldCheckGemma]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return {
    mobileOpen,
    setMobileOpen,
    closeMobile: () => setMobileOpen(false),
    scrolled,
    activeSubmenu,
    setActiveSubmenu,
    gemmaOnline,
    pathname,
    isLightPage,
    isContentPage,
    scaleX,
  };
}

const HeaderBrand: React.FC<{ isLightPage: boolean; gemmaOnline: boolean }> = ({ isLightPage, gemmaOnline }) => {
  const logoContainerClass = isLightPage
    ? 'relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-black/5 border border-black/10 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.01)] transition-all duration-700 group-hover:border-black/20 group-hover:shadow-[0_0_30px_rgba(0,0,0,0.04)]'
    : 'relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-black/20 border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.03)] transition-all duration-700 group-hover:border-white/20 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]';

  return (
    <Link href="/" className="group relative flex items-center gap-3 focus:outline-none">
      <div className={logoContainerClass}>
        <div
          className={`absolute inset-0 bg-gradient-to-br ${
            isLightPage ? 'from-black/5' : 'from-white/10'
          } to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100`}
        />
        <BrandMark
          className={`relative z-10 transition-transform duration-700 group-hover:scale-110 ${
            isLightPage ? 'text-[#B09460]' : 'text-accent-indigo'
          }`}
          size={24}
        />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span
            className={`font-heading text-sm font-extrabold tracking-tight transition-colors ${
              isLightPage ? 'text-light-text-main group-hover:text-light-text-accent' : 'text-text-bright group-hover:text-white'
            }`}
          >
            {HEADER_STRINGS.brandTitle} <span className={isLightPage ? 'text-[#B09460]' : 'text-accent-indigo'}>{HEADER_STRINGS.brandSubtitle}</span>
          </span>

          <div
            className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 border ${
              gemmaOnline
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : 'border-white/10 bg-white/5 text-text-dim'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${gemmaOnline ? 'bg-emerald-400 animate-pulse' : 'bg-text-dim/40'}`} />
            <span className="text-[0.55rem] font-bold uppercase tracking-wider">
              {gemmaOnline ? HEADER_STRINGS.oracleOnline : HEADER_STRINGS.oracleOffline}
            </span>
          </div>
        </div>

        <span
          className={`text-[0.6rem] font-medium tracking-wider uppercase transition-colors ${
            isLightPage ? 'text-light-text-muted' : 'text-text-muted'
          }`}
        >
          {HEADER_STRINGS.tagline}
        </span>
      </div>
    </Link>
  );
};

const HeaderDesktopNav: React.FC<{
  pathname: string;
  isLightPage: boolean;
  activeSubmenu: string | null;
  setActiveSubmenu: (label: string | null) => void;
}> = ({ pathname, isLightPage, activeSubmenu, setActiveSubmenu }) => {
  const menuPillClass = isLightPage
    ? 'flex items-center p-1.5 bg-light-surface border border-light-border rounded-full gap-1.5 backdrop-blur-2xl shadow-[0_4px_20px_rgba(0,0,0,0.01)]'
    : 'flex items-center p-1.5 sota-glass-pill gap-1.5 backdrop-blur-2xl';

  const activeIndicatorBg = isLightPage
    ? 'absolute inset-0 bg-[#0D0C0A]/5 rounded-full'
    : 'absolute inset-0 bg-white/10 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]';

  const submenuCardClass = isLightPage
    ? 'bg-light-surface border border-light-border rounded-2xl shadow-xl p-2.5 flex flex-col gap-1 overflow-hidden relative'
    : 'bg-bg-deep/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-2.5 flex flex-col gap-1 overflow-hidden relative';

  return (
    <nav aria-label="Navegação principal" className="hidden items-center justify-center justify-self-center lg:flex">
      <ul className={menuPillClass}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(`${item.href}/`)) ||
            Boolean(item.submenu?.some((sub) => pathname === sub.href));

          return (
            <li
              key={item.label}
              className="group/nav relative"
              onMouseEnter={() => item.submenu && setActiveSubmenu(item.label)}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              <Link
                href={item.href}
                aria-haspopup={item.submenu ? 'true' : undefined}
                aria-expanded={item.submenu ? activeSubmenu === item.label : undefined}
                onKeyDown={(e) => {
                  if (item.submenu) {
                    if (e.key === 'Escape') {
                      setActiveSubmenu(null);
                    } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                      if (activeSubmenu !== item.label) {
                        e.preventDefault();
                        setActiveSubmenu(item.label);
                      }
                    }
                  }
                }}
                className={`relative z-10 flex items-center gap-2 px-4 py-2.5 text-[0.62rem] font-black tracking-[0.16em] whitespace-nowrap uppercase transition-all duration-300 ${getNavLinkClass(isLightPage, isActive)}`}
              >
                {item.label}
                {item.submenu && (
                  <i className="fa-solid fa-chevron-down text-[0.5rem] opacity-50 transition-transform duration-300 group-hover/nav:rotate-180" />
                )}
              </Link>

              {isActive && !item.submenu && (
                <motion.div
                  layoutId="active-nav"
                  className={activeIndicatorBg}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}

              <AnimatePresence>
                {item.submenu && activeSubmenu === item.label && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="pointer-events-auto absolute top-full left-1/2 z-50 w-64 -translate-x-1/2 pt-4"
                  >
                    <div className={submenuCardClass}>
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${
                          isLightPage ? 'from-[#B09460]/5' : 'from-accent-indigo/5'
                        } pointer-events-none to-transparent`}
                      />
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`group/sub flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                            isLightPage ? 'hover:bg-black/5' : 'hover:bg-white/5'
                          }`}
                        >
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                              isLightPage
                                ? 'border border-black/5 bg-black/5 group-hover/sub:border-[#B09460]/20 group-hover/sub:bg-[#B09460]/10'
                                : 'group-hover/sub:bg-accent-indigo/10 group-hover/sub:border-accent-indigo/20 border border-white/5 bg-white/5'
                            }`}
                          >
                            <i
                              className={`fa-solid ${sub.icon} ${
                                isLightPage
                                  ? 'text-light-text-muted group-hover/sub:text-light-text-accent text-xs'
                                  : 'text-text-muted group-hover/sub:text-accent-indigo-light text-xs'
                              }`}
                            />
                          </div>
                          <span
                            className={`text-[0.65rem] font-bold tracking-widest uppercase transition-colors ${
                              isLightPage
                                ? 'text-light-text-muted group-hover/sub:text-light-text-main'
                                : 'text-text-muted group-hover/sub:text-white'
                            }`}
                          >
                            {sub.label}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

const HeaderMobileDrawer: React.FC<{
  isOpen: boolean;
  isLightPage: boolean;
  onClose: () => void;
}> = ({ isOpen, isLightPage, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 right-0 bottom-0 z-50 flex w-[85vw] max-w-sm flex-col overflow-y-auto border-l px-8 pt-24 pb-8 shadow-2xl transition-colors duration-300 lg:hidden ${
              isLightPage ? 'border-light-border bg-light-surface' : 'bg-bg-deep border-white/10'
            }`}
          >
            <button
              type="button"
              className={`absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-xl transition-all focus:outline-none ${
                isLightPage
                  ? 'text-light-text-muted hover:text-light-text-main border border-black/10 bg-black/5 hover:bg-black/10'
                  : 'text-text-muted border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white'
              }`}
              onClick={onClose}
              aria-label={HEADER_STRINGS.closeMenu}
            >
              <i className="fa-solid fa-xmark text-xl" />
            </button>

            <div className="flex flex-col gap-8">
              {NAV_ITEMS.map((item) => (
                <div key={item.label} className="flex flex-col gap-3">
                  <span
                    className={`border-b pb-2 text-[0.65rem] font-black tracking-[0.25em] uppercase ${
                      isLightPage ? 'border-black/5 text-[#B09460]' : 'text-accent-indigo border-white/5'
                    }`}
                  >
                    {item.label}
                  </span>
                  {item.submenu ? (
                    <div className="flex flex-col gap-2 pl-2">
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={onClose}
                          className={`flex items-center gap-4 py-1.5 text-sm font-bold transition-colors ${
                            isLightPage
                              ? 'text-light-text-muted hover:text-light-text-main'
                              : 'text-text-main hover:text-white'
                          }`}
                        >
                          <i
                            className={`fa-solid ${sub.icon} ${
                              isLightPage ? 'text-light-text-muted' : 'text-text-darker'
                            } w-5`}
                          />
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-4 py-1 pl-2 text-sm font-bold transition-colors ${
                        isLightPage
                          ? 'text-light-text-muted hover:text-light-text-main'
                          : 'text-text-main hover:text-white'
                      }`}
                    >
                      <i
                        className={`fa-solid fa-circle w-5 text-[0.3rem] ${
                          isLightPage ? 'text-[#B09460]/50' : 'text-accent-indigo/50'
                        }`}
                      />
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            <div className={`mt-auto border-t pt-8 ${isLightPage ? 'border-black/5' : 'border-white/5'}`}>
              <Link
                href="/quem-sou"
                onClick={onClose}
                className={`flex items-center gap-4 text-xs font-black tracking-widest uppercase transition-colors ${
                  isLightPage ? 'text-light-text-muted hover:text-light-text-main' : 'text-text-muted hover:text-white'
                }`}
              >
                <i className={`fa-solid fa-user-astronaut ${isLightPage ? 'text-[#B09460]' : 'text-accent-indigo'}`} />{' '}
                {HEADER_STRINGS.author}
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const Header: React.FC = () => {
  const {
    mobileOpen,
    setMobileOpen,
    closeMobile,
    scrolled,
    activeSubmenu,
    setActiveSubmenu,
    gemmaOnline,
    pathname,
    isLightPage,
    isContentPage,
    scaleX,
  } = useHeaderState();

  const isSimulatorPage = pathname === ROUTES.SIMULADOR;
  const headerBgClass = isSimulatorPage
    ? 'py-3 bg-bg-base/95 backdrop-blur-3xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.35)]'
    : getHeaderBgClass(scrolled, isLightPage);

  const actionButtonClass = isLightPage
    ? 'hidden sm:flex relative group px-7 py-3 rounded-full overflow-hidden bg-light-text-main border border-light-text-main transition-all duration-700 hover:bg-[#2A2825] hover:shadow-[0_4px_20px_rgba(0,0,0,0.15)] active:scale-95'
    : 'hidden sm:flex relative group px-7 py-3 rounded-full overflow-hidden bg-accent-indigo/10 border border-accent-indigo/30 transition-all duration-700 hover:border-accent-indigo hover:bg-accent-indigo/20 hover:shadow-[0_0_40px_rgba(99,102,241,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] active:scale-95';

  return (
    <>
      {isContentPage && (
        <motion.div
          className="bg-accent-indigo fixed top-0 right-0 left-0 z-100 h-1 origin-left shadow-[0_0_15px_rgba(99,102,241,0.5)]"
          style={{ scaleX }}
        />
      )}
      <motion.header
        id="site-header"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${headerBgClass}`}
      >
        <div className="sota-container flex items-center justify-between gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <div className="flex shrink-0 items-center justify-start justify-self-start">
            <HeaderBrand isLightPage={isLightPage} gemmaOnline={gemmaOnline} />
          </div>

          <HeaderDesktopNav
            pathname={pathname}
            isLightPage={isLightPage}
            activeSubmenu={activeSubmenu}
            setActiveSubmenu={setActiveSubmenu}
          />

          <div className="flex shrink-0 items-center justify-end gap-4 justify-self-end">
            {!isSimulatorPage && (
              <Link href="/simulador" className={actionButtonClass}>
                <span
                  className={`relative text-[0.7rem] font-black tracking-[0.2em] uppercase transition-colors ${
                    isLightPage ? 'text-[#FAFAF7]' : 'text-accent-indigo-light group-hover:text-white'
                  }`}
                >
                  {HEADER_STRINGS.motorIcm}
                </span>
              </Link>
            )}

            <button
              type="button"
              className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all focus:outline-none lg:hidden ${
                isLightPage
                  ? 'text-light-text-muted hover:text-light-text-main border border-black/10 bg-black/5 hover:bg-black/10'
                  : 'text-text-muted border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => setMobileOpen(true)}
              aria-label={HEADER_STRINGS.openMenu}
            >
              <i className="fa-solid fa-bars-staggered text-lg" />
            </button>
          </div>
        </div>
      </motion.header>

      <HeaderMobileDrawer isOpen={mobileOpen} isLightPage={isLightPage} onClose={closeMobile} />
    </>
  );
};

export default Header;
