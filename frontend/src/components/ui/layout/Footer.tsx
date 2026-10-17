'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { SITE_CONFIG } from '@/constants/site';
import BrandMark from '@/components/ui/layout/BrandMark';

interface NavLinkItem {
  href: string;
  label: string;
  lightClass: string;
  darkClass: string;
}

const FOOTER_NAV_LINKS: readonly NavLinkItem[] = [
  {
    href: ROUTES.AULAS.MASTERCLASS,
    label: 'Masterclass',
    lightClass: 'hover:text-[var(--color-light-text-main)]',
    darkClass: 'hover:text-white hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]',
  },
  {
    href: ROUTES.SIMULADOR,
    label: 'Simulador Mestre',
    lightClass: 'hover:text-emerald-700',
    darkClass: 'hover:text-accent-emerald transition-all duration-300 hover:drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]',
  },
  {
    href: ROUTES.SIMULADOR_DISTORCOES,
    label: 'Distorções ICM',
    lightClass: 'hover:text-rose-700',
    darkClass: 'hover:text-accent-rose transition-all duration-300 hover:drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]',
  },
  {
    href: ROUTES.SIMULADOR_GTO,
    label: 'Laboratório CFR',
    lightClass: 'hover:text-indigo-700',
    darkClass: 'hover:text-accent-indigo-light transition-all duration-300 hover:drop-shadow-[0_0_15px_rgba(129,140,248,0.4)]',
  },
  {
    href: ROUTES.BIBLIOTECA,
    label: 'Biblioteca',
    lightClass: 'hover:text-[var(--color-light-text-main)]',
    darkClass: 'hover:text-white hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]',
  },
  {
    href: ROUTES.TEMPLO.ANALYTICS,
    label: 'Hub AGN',
    lightClass: 'hover:text-indigo-700',
    darkClass: 'hover:text-accent-indigo-light transition-all duration-300 hover:drop-shadow-[0_0_15px_rgba(129,140,248,0.4)]',
  },
  {
    href: ROUTES.QUEM_SOU,
    label: 'O Autor',
    lightClass: 'hover:text-[var(--color-light-text-main)]',
    darkClass: 'hover:text-white hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]',
  },
];

function FooterBackground({ isLightPage }: Readonly<{ isLightPage: boolean }>) {
  if (isLightPage) {
    return <div className="bg-grain pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-multiply" />;
  }
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.02)_1px,transparent_1px)] mask-[radial-gradient(ellipse_at_bottom,black_40%,transparent_100%)] bg-size-[40px_40px] opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(99,102,241,0.12),transparent_70%)] transition-all duration-1000 group-hover/footer:bg-[radial-gradient(ellipse_at_bottom,rgba(99,102,241,0.18),transparent_70%)]" />
    </>
  );
}

function FooterBranding({ isLightPage }: Readonly<{ isLightPage: boolean }>) {
  const markContainerClass = isLightPage
    ? 'relative flex h-16 w-16 items-center justify-center rounded-2xl border border-black/10 bg-black/5 text-[#0D0C0A] shadow-[0_0_20px_rgba(0,0,0,0.02)] backdrop-blur-md transition-all duration-500 group-hover:border-black/20 group-hover:scale-105'
    : 'group-hover:border-accent-indigo/40 group-hover:text-accent-indigo-light relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-white shadow-[0_0_30px_rgba(255,255,255,0.03)] backdrop-blur-md transition-all duration-500';

  const titleClass = isLightPage ? 'text-[var(--color-light-text-main)]' : 'text-white';
  const mutedClass = isLightPage ? 'text-[var(--color-light-text-muted)]' : 'text-text-muted';
  const subtitleClass = isLightPage ? 'text-[var(--color-light-text-accent)]' : 'text-accent-indigo-light';
  const edgeClass = isLightPage ? 'text-[var(--color-light-text-main)]' : 'text-text-darker';

  return (
    <div className="mb-12 flex flex-col items-center sm:mb-14">
      <Link href={ROUTES.HOME} className="group relative mb-7 flex flex-col items-center gap-5 focus:outline-none">
        <div className={markContainerClass}>
          <BrandMark size={34} className="transition-transform duration-500 group-hover:scale-105" />
        </div>
        <div className="flex flex-col items-center justify-center">
          <span className={`text-[clamp(1.75rem,4vw,2.5rem)] leading-none font-black tracking-tighter ${titleClass}`}>
            POKER{' '}
            <span className={`ml-1.5 font-light tracking-[0.3em] ${mutedClass}`}>
              RACIONAL
            </span>
          </span>
          <span className={`mt-3 text-[0.62rem] leading-none font-black tracking-[0.42em] uppercase ${subtitleClass}`}>
            A Geometria do Risco
          </span>
        </div>
      </Link>
      <p className={`mt-4 max-w-lg text-[0.8rem] leading-loose font-medium ${mutedClass}`}>
        Inteligência SOTA, ICM Pós-Flop e o Paradigma da Perspectiva Matemática.
        <br />
        <span className={`mt-2 inline-block text-[0.6rem] font-black tracking-widest uppercase ${edgeClass}`}>
          O Edge Mudou de Lugar.
        </span>
      </p>
    </div>
  );
}

function FooterNav({ isLightPage }: Readonly<{ isLightPage: boolean }>) {
  const navColorClass = isLightPage ? 'text-[var(--color-light-text-muted)]' : 'text-text-dim';

  return (
    <nav
      aria-label="Navegação de atalhos"
      className={`relative mb-16 flex flex-wrap justify-center gap-x-10 gap-y-6 text-[0.65rem] font-black tracking-[0.3em] uppercase ${navColorClass}`}
    >
      <div className="pointer-events-none absolute -inset-x-20 inset-y-0 rounded-full bg-white/2 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
      {FOOTER_NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`transition-all duration-300 ${isLightPage ? link.lightClass : link.darkClass}`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

function FooterLegal({ isLightPage, currentYear }: Readonly<{ isLightPage: boolean; currentYear: number }>) {
  const wrapperClass = isLightPage
    ? 'border-[var(--color-light-border)] text-[var(--color-light-text-muted)]'
    : 'border-white/5 text-text-darker';
  const axiomClass = isLightPage ? 'text-[var(--color-light-text-main)]' : 'text-text-darker';
  const badgeBorder = isLightPage ? 'border-[var(--color-light-border)] bg-black/5' : 'border-white/5 bg-white/3';
  const statusTextClass = isLightPage ? 'text-[var(--color-light-text-muted)]' : 'text-text-muted';

  return (
    <div
      className={`relative flex w-full flex-col items-center justify-between gap-6 border-t pt-10 text-[0.6rem] font-black tracking-[0.4em] uppercase sm:flex-row ${wrapperClass}`}
    >
      <p className="m-0">
        &copy; {currentYear} {SITE_CONFIG.author} &middot;{' '}
        <span className={axiomClass}>
          {SITE_CONFIG.axiom}
        </span>
      </p>
      <div className={`flex items-center gap-3 rounded-full border px-4 py-2 shadow-inner ${badgeBorder}`}>
        <div className="bg-accent-emerald h-2 w-2 animate-pulse rounded-full shadow-[0_0_10px_var(--color-accent-emerald)]" />
        <span className={statusTextClass}>
          {SITE_CONFIG.coreStatus}
        </span>
      </div>
    </div>
  );
}

export default function Footer() {
  const pathname = usePathname();
  const isLightPage = pathname === '/' || pathname === '/quem-sou';
  const currentYear = new Date().getFullYear();

  const footerClass = isLightPage
    ? 'group/footer relative z-10 overflow-hidden border-t border-[var(--color-light-border)] bg-[var(--color-light-canvas)] pt-24 pb-12 transition-colors duration-500 sm:pt-28 sm:pb-14'
    : 'group/footer bg-bg-deep relative z-10 overflow-hidden border-t border-white/5 pt-24 pb-12 transition-colors duration-500 sm:pt-28 sm:pb-14';

  const containerClass = isLightPage
    ? 'bg-transparent text-[var(--color-light-text-main)]'
    : 'bg-bg-deep text-text-main';

  return (
    <footer id="contato" className={footerClass}>
      <FooterBackground isLightPage={isLightPage} />
      <div className={`sota-container relative z-10 flex flex-col items-center justify-center text-center ${containerClass}`}>
        <FooterBranding isLightPage={isLightPage} />
        <FooterNav isLightPage={isLightPage} />
        <div className="mb-16 flex items-center gap-8">
          <SocialLink
            href="https://www.instagram.com/raphaelvitoi/"
            icon="fa-instagram"
            label="Instagram"
            color="rose"
            isLightPage={isLightPage}
          />
          <SocialLink
            href="https://www.youtube.com/@RaphaelVitoiPoker"
            icon="fa-youtube"
            label="YouTube"
            color="red"
            isLightPage={isLightPage}
          />
          <SocialLink
            href="https://www.twitch.tv/RaphaelVitoiPoker"
            icon="fa-twitch"
            label="Twitch"
            color="violet"
            isLightPage={isLightPage}
          />
        </div>
        <FooterLegal isLightPage={isLightPage} currentYear={currentYear} />
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
  isLightPage = false,
}: Readonly<{
  href: string;
  icon: string;
  label: string;
  color: 'rose' | 'red' | 'violet';
  isLightPage?: boolean;
}>) {
  const containerClass = isLightPage
    ? 'flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-black/10 bg-black/5 text-[#4A4742] transition-all duration-500 hover:-translate-y-2 hover:border-black/20 hover:text-[#0D0C0A]'
    : 'text-text-dim flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-white/5 bg-black/40 transition-all duration-500 hover:-translate-y-2';

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${containerClass} ${isLightPage ? '' : getSocialColorClass(color)}`}
      aria-label={label}
    >
      <i className={`fa-brands ${icon} text-2xl`}></i>
    </a>
  );
}
