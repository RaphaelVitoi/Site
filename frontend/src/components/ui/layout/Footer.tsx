import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { SITE_CONFIG } from '@/constants/site';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer
      id="contato"
      className="bg-bg-deep group/footer relative z-10 overflow-hidden border-t border-white/5 pt-32 pb-16"
    >
      {/* SOTA: Geometria Técnica de Fundo (Grid Cibernético) */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.02)_1px,transparent_1px)] mask-[radial-gradient(ellipse_at_bottom,black_40%,transparent_100%)] bg-size-[40px_40px] opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(99,102,241,0.12),transparent_70%)] transition-all duration-1000 group-hover/footer:bg-[radial-gradient(ellipse_at_bottom,rgba(99,102,241,0.18),transparent_70%)]" />

      <div className="sota-container bg-bg-deep relative z-10 flex flex-col items-center justify-center text-center">
        {/* Branding/Logo (SOTA Gold Style) */}
        <div className="mb-16 flex flex-col items-center">
          <Link href={ROUTES.HOME} className="group relative mb-8 flex flex-col items-center gap-6 focus:outline-none">
            <div className="group-hover:border-accent-indigo/40 relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/40 shadow-[0_0_50px_rgba(255,255,255,0.02)] backdrop-blur-md transition-all duration-1000 group-hover:rotate-360 group-hover:shadow-[0_0_80px_rgba(99,102,241,0.15)]">
              <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="relative z-10 text-white"
              >
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="0.8" strokeLinejoin="round" />
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="0.8" strokeLinejoin="round" />
                <path d="M2 7V17" stroke="currentColor" strokeWidth="0.8" strokeLinejoin="round" />
                <path d="M22 7V17" stroke="currentColor" strokeWidth="0.8" strokeLinejoin="round" />
                <path d="M12 12V22" stroke="currentColor" strokeWidth="0.8" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-4xl leading-none font-black tracking-tighter text-white">
                POKER <span className="text-text-muted ml-1.5 font-light tracking-[0.3em]">RACIONAL</span>
              </span>
              <span className="text-accent-indigo-light group-hover:text-glow-indigo mt-4 text-[0.7rem] leading-none font-black tracking-[0.5em] uppercase transition-all duration-500">
                A Geometria do Risco
              </span>
            </div>
          </Link>
          <p className="text-text-muted mt-4 max-w-lg text-[0.8rem] leading-loose font-medium">
            Inteligência SOTA, ICM Pós-Flop e o Paradigma da Perspectiva Matemática.
            <br />
            <span className="text-text-darker mt-2 inline-block text-[0.6rem] font-black tracking-widest uppercase">
              O Edge Mudou de Lugar.
            </span>
          </p>
        </div>

        {/* Navigation / Quick Links */}
        <nav
          aria-label="Navegação de atalhos"
          className="text-text-dim relative mb-16 flex flex-wrap justify-center gap-x-10 gap-y-6 text-[0.65rem] font-black tracking-[0.3em] uppercase"
        >
          <div className="pointer-events-none absolute -inset-x-20 inset-y-0 rounded-full bg-white/2 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
          <Link
            href={ROUTES.AULAS.MASTERCLASS}
            className="transition-all duration-300 hover:text-white hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
          >
            Masterclass
          </Link>
          <Link
            href={ROUTES.SIMULADOR}
            className="hover:text-accent-emerald transition-all duration-300 hover:drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]"
          >
            Simulador Mestre
          </Link>
          <Link
            href={ROUTES.SIMULADOR_DISTORCOES}
            className="hover:text-accent-rose transition-all duration-300 hover:drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]"
          >
            Distorções ICM
          </Link>
          <Link
            href={ROUTES.SIMULADOR_GTO}
            className="hover:text-accent-indigo-light transition-all duration-300 hover:drop-shadow-[0_0_15px_rgba(129,140,248,0.4)]"
          >
            Laboratório CFR
          </Link>
          <Link
            href={ROUTES.BIBLIOTECA}
            className="transition-all duration-300 hover:text-white hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
          >
            Biblioteca
          </Link>
          <Link
            href={ROUTES.TEMPLO.ANALYTICS}
            className="hover:text-accent-indigo-light transition-all duration-300 hover:drop-shadow-[0_0_15px_rgba(129,140,248,0.4)]"
          >
            Hub AGN
          </Link>
          <Link
            href={ROUTES.QUEM_SOU}
            className="transition-all duration-300 hover:text-white hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
          >
            O Autor
          </Link>
        </nav>

        {/* Social Icons (SOTA High-End) */}
        <div className="mb-16 flex items-center gap-8">
          <SocialLink
            href="https://www.instagram.com/raphaelvitoi/"
            icon="fa-instagram"
            label="Instagram"
            color="rose"
          />
          <SocialLink href="https://www.youtube.com/@RaphaelVitoiPoker" icon="fa-youtube" label="YouTube" color="red" />
          <SocialLink href="https://www.twitch.tv/RaphaelVitoiPoker" icon="fa-twitch" label="Twitch" color="violet" />
        </div>

        {/* Copyright & Legal */}
        <div className="text-text-darker relative flex w-full flex-col items-center justify-between gap-6 border-t border-white/5 pt-10 text-[0.6rem] font-black tracking-[0.4em] uppercase sm:flex-row">
          <p className="m-0">
            &copy; {currentYear} {SITE_CONFIG.author} &middot;{' '}
            <span className="text-text-darker">{SITE_CONFIG.axiom}</span>
          </p>
          <div className="flex items-center gap-3 rounded-full border border-white/5 bg-white/3 px-4 py-2 shadow-inner">
            <div className="bg-accent-emerald h-2 w-2 animate-pulse rounded-full shadow-[0_0_10px_var(--color-accent-emerald)]"></div>
            <span className="text-text-muted">{SITE_CONFIG.coreStatus}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function getSocialColorClass(color: 'rose' | 'red' | 'violet'): string {
  switch (color) {
    case 'rose':
      return 'hover:text-accent-pink hover:border-accent-pink/30 hover:shadow-[0_0_30px_rgba(236,72,153,0.15)]';
    case 'red':
      return 'hover:text-accent-danger hover:border-accent-danger/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]';
    case 'violet':
      return 'hover:text-accent-violet hover:border-accent-violet/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]';
  }
}

function SocialLink({
  href,
  icon,
  label,
  color,
}: Readonly<{
  href: string;
  icon: string;
  label: string;
  color: 'rose' | 'red' | 'violet';
}>) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-text-dim flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-white/5 bg-black/40 transition-all duration-500 hover:-translate-y-2 ${getSocialColorClass(
        color,
      )}`}
      aria-label={label}
    >
      <i className={`fa-brands ${icon} text-2xl`}></i>
    </a>
  );
}
