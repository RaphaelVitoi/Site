/**
 * IDENTITY: SOTA Content Header SOTA v7.0 GOLD
 * PATH: src/components/ui/layout/ContentPageHeader.tsx
 * ROLE: Prover identidade visual, título e apresentação consistente para páginas de conteúdo.
 * AESTHETIC: SOTA Gold Standard (hierarquia sólida, contraste e profundidade contida).
 * ARCHITECTURE: Server Component puro sem mismatch de hidratação.
 */

import Link from 'next/link';

interface ContentPageHeaderProps {
  title: string;
  subtitle?: string;
  category?: string;
  icon?: string;
}

export function ContentPageHeader({
  title,
  subtitle,
  category,
  icon = 'fa-book-open',
}: Readonly<ContentPageHeaderProps>) {
  return (
    <header
      suppressHydrationWarning
      className="bg-bg-deep/40 group/header relative w-full overflow-hidden border-b border-white/5 pt-10 pb-12 backdrop-blur-3xl sm:pt-14 sm:pb-16"
    >
      {/* Camadas de Profundidade Gold */}
      <div className="bg-accent-indigo/10 group-hover/header:bg-accent-indigo/15 pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full blur-[120px] transition-all duration-1000" />
      <div className="bg-accent-emerald/5 pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full blur-[120px]" />

      <div className="sota-container animate-sota-in relative z-10">
        <div className="flex flex-col gap-10">
          {/* Breadcrumb SOTA High-Fidelity */}
          <nav
            aria-label="Caminho de navegação"
            className="flex items-center gap-4 text-[0.6rem] font-black tracking-[0.3em] text-white/70 uppercase"
          >
            <Link href="/" className="hover:text-accent-indigo-light flex items-center gap-2 transition-colors">
              <i className="fa-solid fa-house text-[0.55rem]" /> Home
            </Link>
            <i className="fa-solid fa-chevron-right text-[0.45rem] text-white/50" />
            {category && (
              <>
                <Link href="/biblioteca" className="hover:text-accent-indigo-light transition-colors">
                  {category}
                </Link>
                <i className="fa-solid fa-chevron-right text-[0.45rem] text-white/50" />
              </>
            )}
            <span className="max-w-50 truncate text-white/70">{title}</span>
          </nav>

          <div className="flex flex-col justify-between gap-12 lg:flex-row lg:items-end">
            <div className="max-w-4xl space-y-6">
              <div className="flex items-center gap-5">
                <div className="bg-accent-indigo/10 border-accent-indigo/20 text-accent-indigo relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border shadow-2xl transition-transform duration-300 hover:scale-105">
                  <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/10 to-transparent" />
                  <i className={`fa-solid ${icon} text-2xl`} />
                </div>
                {category && (
                  <div className="flex flex-col gap-1">
                    <span className="text-text-muted w-fit rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-[0.55rem] font-black tracking-[0.4em] uppercase shadow-inner">
                      {category}
                    </span>
                    <div className="flex gap-1.5 pl-1 opacity-20">
                      <div className="bg-accent-indigo h-1 w-1 rounded-full" />
                      <div className="bg-accent-indigo h-1 w-1 rounded-full" />
                      <div className="bg-accent-indigo h-1 w-1 rounded-full" />
                    </div>
                  </div>
                )}
              </div>

              <h1 className="sota-page-title sota-page-title--hero">{title}</h1>

              {subtitle && (
                <div className="group/subtitle relative">
                  <div className="bg-accent-indigo/40 group-hover/subtitle:bg-accent-indigo absolute top-0 left-0 h-full w-1 rounded-full transition-colors" />
                  <p className="text-text-muted m-0 max-w-3xl py-1 pl-8 text-lg leading-loose font-medium italic md:text-xl">
                    {subtitle}
                  </p>
                </div>
              )}
            </div>

            <div className="hidden xl:block">
              <div className="space-y-3 text-right transition-all duration-700">
                <div className="space-y-1">
                  <span className="block text-[0.65rem] font-black tracking-[0.4em] text-white/80 uppercase">
                    Paradigma VITOI
                  </span>
                  <span className="text-accent-indigo-light font-mono text-[0.5rem] font-black tracking-[0.5em] uppercase">
                    Quantum Intelligence
                  </span>
                </div>
                <div className="from-accent-indigo/40 ml-auto h-px w-32 bg-linear-to-l to-transparent" />
                <div className="flex justify-end gap-4 text-white/60">
                  <i className="fa-solid fa-microchip text-[0.6rem]" />
                  <i className="fa-solid fa-dna text-[0.6rem]" />
                  <i className="fa-solid fa-satellite-dish text-[0.6rem]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
