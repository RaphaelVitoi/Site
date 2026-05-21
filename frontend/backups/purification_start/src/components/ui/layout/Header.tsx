"use client";

import { ROUTES } from "@/constants/routes";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  {
    label: "Geometria",
    href: ROUTES.AULAS.MASTERCLASS,
    submenu: [
      {
        label: "Masterclass",
        href: ROUTES.AULAS.MASTERCLASS,
        icon: "fa-graduation-cap",
      },
      { label: "Pós-Flop", href: ROUTES.AULAS.POS_FLOP, icon: "fa-microchip" },
      {
        label: "Leitura ICM",
        href: ROUTES.AULAS.LEITURA_ICM,
        icon: "fa-book-open-reader",
      },
    ],
  },
  {
    label: "Biblioteca",
    href: ROUTES.BIBLIOTECA,
    submenu: [
      {
        label: "Downward Drift",
        href: ROUTES.LIBRARY.DOWNWARD_DRIFT,
        icon: "fa-chart-line",
      },
      {
        label: "Smart Sniper",
        href: ROUTES.ARTIGOS.SMART_SNIPER,
        icon: "fa-crosshairs",
      },
      { label: "Todos Artefatos", href: ROUTES.BIBLIOTECA, icon: "fa-atom" },
    ],
  },
  {
    label: "Templo",
    href: ROUTES.TEMPLO.ANALYTICS,
    submenu: [
      {
        label: "Panóptico (EV)",
        href: ROUTES.TEMPLO.ANALYTICS,
        icon: "fa-chart-pie",
      },
      {
        label: "Telemetria (AGN)",
        href: ROUTES.DASHBOARD,
        icon: "fa-satellite-dish",
      },
      { label: "Oráculo (Gemma)", href: ROUTES.TEMPLO.GEMMA, icon: "fa-brain" },
    ],
  },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [gemmaOnline, setGemmaOnline] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // SOTA: Verificacao periodica da borda local
    const checkGemma = () => {
      fetch("http://127.0.0.1:11434/")
        .then((res) => setGemmaOnline(res.ok))
        .catch(() => setGemmaOnline(false));
    };
    checkGemma();
    setInterval(checkGemma, 30000);

    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("scroll", handleScroll);
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        {...({
          className: `fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
            scrolled
              ? "py-3 bg-bg-base/90 backdrop-blur-3xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
              : "py-6 bg-transparent border-transparent"
          }`,
        } as any)}
      >
        <div className="sota-container flex items-center justify-between gap-6">
          <div className="shrink-0">
            <Link
              href="/"
              className="group relative flex items-center gap-3 focus:outline-none"
            >
              <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-black/20 border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.03)] transition-all duration-700 group-hover:border-white/20 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="relative z-10 transition-transform duration-700 group-hover:scale-110 text-white"
                >
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 7V17"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 7V17"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 12V22"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <span className="text-[1.15rem] font-black tracking-tighter text-white leading-none">
                    POKER{" "}
                    <span className="font-light text-white/70 tracking-widest ml-0.5">
                      RACIONAL
                    </span>
                  </span>
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${gemmaOnline ? "bg-accent-emerald animate-pulse" : "bg-rose-500/40"}`}
                    title={gemmaOnline ? "Oráculo Online" : "Oráculo Offline"}
                  />
                </div>
                <span className="text-[0.55rem] font-bold uppercase tracking-[0.35em] text-accent-indigo-light mt-1.5 leading-none">
                  Nexus System
                </span>
              </div>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center justify-center">
            <ul className="flex items-center p-1.5 sota-glass-pill gap-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  item.submenu?.some((sub) => pathname === sub.href);
                return (
                  <li
                    key={item.label}
                    className="relative group/nav"
                    onMouseEnter={() =>
                      item.submenu && setActiveSubmenu(item.label)
                    }
                    onMouseLeave={() => setActiveSubmenu(null)}
                  >
                    <Link
                      href={item.href}
                      className={`relative z-10 px-5 py-2.5 text-[0.65rem] font-black uppercase tracking-[0.15em] transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                        isActive
                          ? "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                          : "text-text-muted hover:text-white"
                      }`}
                    >
                      {item.label}
                      {item.submenu && (
                        <i className="fa-solid fa-chevron-down text-[0.5rem] opacity-50 group-hover/nav:rotate-180 transition-transform duration-300" />
                      )}
                    </Link>

                    {isActive && !item.submenu && (
                      <motion.div
                        layoutId="active-nav"
                        {...({
                          className:
                            "absolute inset-0 bg-white/10 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]",
                        } as any)}
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}

                    {/* Submenu de Alta Fidelidade */}
                    <AnimatePresence>
                      {item.submenu && activeSubmenu === item.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          {...({
                            className:
                              "absolute top-full left-1/2 -translate-x-1/2 pt-4 w-56 z-50 pointer-events-auto",
                          } as any)}
                        >
                          <div className="bg-bg-deep/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-2.5 flex flex-col gap-1 overflow-hidden relative">
                            <div className="absolute inset-0 bg-linear-to-br from-accent-indigo/5 to-transparent pointer-events-none" />
                            {item.submenu.map((sub) => (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                className="group/sub flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all"
                              >
                                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center group-hover/sub:bg-accent-indigo/10 group-hover/sub:border-accent-indigo/20 transition-all">
                                  <i
                                    className={`fa-solid ${sub.icon} text-text-muted group-hover/sub:text-accent-indigo-light text-xs`}
                                  />
                                </div>
                                <span className="text-[0.65rem] font-bold uppercase tracking-widest text-text-muted group-hover/sub:text-white transition-colors">
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

          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/simulador"
              className="hidden sm:flex relative group px-7 py-3 rounded-full overflow-hidden bg-accent-indigo/10 border border-accent-indigo/30 transition-all duration-700 hover:border-accent-indigo hover:bg-accent-indigo/20 hover:shadow-[0_0_40px_rgba(99,102,241,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] active:scale-95"
            >
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <div className="absolute inset-0 bg-radial-[at_center_center] from-accent-indigo/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <span className="relative text-[0.7rem] font-black tracking-[0.2em] text-accent-indigo-light group-hover:text-white transition-colors uppercase">
                Motor ICM SOTA
              </span>
            </Link>

            <button
              className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10 lg:hidden transition-all focus:outline-none"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir Menu"
            >
              <i className="fa-solid fa-bars-staggered text-lg" />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              {...({
                className:
                  "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden",
                onClick: closeMobile,
              } as any)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              {...({
                className:
                  "fixed top-0 right-0 bottom-0 z-50 w-[85vw] max-w-sm bg-bg-deep border-l border-white/10 shadow-2xl flex flex-col pt-24 pb-8 px-8 overflow-y-auto lg:hidden",
              } as any)}
            >
              <button
                className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10 transition-all focus:outline-none"
                onClick={closeMobile}
                aria-label="Fechar menu"
              >
                <i className="fa-solid fa-xmark text-xl" />
              </button>

              <div className="flex flex-col gap-8">
                {navItems.map((item) => (
                  <div key={item.label} className="flex flex-col gap-3">
                    <span className="text-[0.65rem] font-black text-accent-indigo uppercase tracking-[0.25em] border-b border-white/5 pb-2">
                      {item.label}
                    </span>
                    {item.submenu ? (
                      <div className="flex flex-col gap-2 pl-2">
                        {item.submenu.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={closeMobile}
                            className="py-1.5 text-sm font-bold text-text-main hover:text-white transition-colors flex items-center gap-4"
                          >
                            <i
                              className={`fa-solid ${sub.icon} text-text-darker w-5`}
                            />
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={closeMobile}
                        className="py-1 text-sm font-bold text-text-main hover:text-white transition-colors flex items-center gap-4 pl-2"
                      >
                        <i className="fa-solid fa-circle text-[0.3rem] text-accent-indigo/50 w-5" />
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 mt-8">
                <span className="text-[0.65rem] font-black text-accent-rose uppercase tracking-[0.25em] border-b border-white/5 pb-2">
                  Inteligência
                </span>
                <Link
                  href="/simulador"
                  onClick={closeMobile}
                  className="py-1 text-sm font-bold text-text-main hover:text-white transition-colors flex items-center gap-4 pl-2"
                >
                  <i className="fa-solid fa-flask w-5 text-accent-rose/70" />
                  <span>Motor ICM SOTA</span>
                </Link>
                <Link
                  href="/simulador/gto-cfr"
                  onClick={closeMobile}
                  className="py-1 text-sm font-bold text-text-main hover:text-white transition-colors flex items-center gap-4 pl-2"
                >
                  <i className="fa-solid fa-network-wired w-5 text-accent-rose/70" />
                  <span>Laboratório CFR</span>
                </Link>
              </div>

              <div className="mt-auto pt-8 border-t border-white/5">
                <Link
                  href="/quem-sou"
                  onClick={closeMobile}
                  className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-text-muted hover:text-white transition-colors"
                >
                  <i className="fa-solid fa-user-astronaut text-accent-indigo" />{" "}
                  O Autor
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
