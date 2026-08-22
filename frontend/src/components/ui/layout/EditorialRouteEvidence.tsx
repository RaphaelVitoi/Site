'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  getDidacticStageLabel,
  getEditorialEvidenceLabel,
  getEditorialManifestEntry,
} from '@/content/editorialManifest';

export function EditorialRouteEvidence() {
  const pathname = usePathname();
  const slug = pathname.split('/').filter(Boolean).at(-1);
  if (!slug) return null;
  const entry = getEditorialManifestEntry(slug);
  if (entry.contentVersion === 'unversioned-db') return null;
  return (
    <section className="sota-container pb-12" aria-label="Contexto editorial e didático">
      <div className="rounded-3xl border border-white/8 bg-slate-950/40 p-6 shadow-xl backdrop-blur-xl sm:p-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="max-w-3xl space-y-3">
            <p className="text-accent-indigo-light m-0 text-[0.6rem] font-black tracking-[0.22em] uppercase">
              Mapa editorial
            </p>
            <h2 className="m-0 text-xl font-black text-white">{entry.title}</h2>
            <p className="text-text-muted m-0 text-sm leading-relaxed">{entry.summary}</p>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <span className="text-text-muted rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.55rem] font-black tracking-widest uppercase">
              {getDidacticStageLabel(entry.stage)}
            </span>
            <span className="border-accent-indigo/30 bg-accent-indigo/10 text-accent-indigo-light rounded-full border px-2.5 py-1 text-[0.55rem] font-black tracking-widest uppercase">
              {getEditorialEvidenceLabel(entry.evidenceLevel)}
            </span>
          </div>
        </div>
        <div className="mt-6 grid gap-6 border-t border-white/5 pt-5 md:grid-cols-2">
          <div>
            <h3 className="text-text-dim mb-2 text-[0.55rem] font-black tracking-[0.18em] uppercase">
              Limites de leitura
            </h3>
            <ul className="text-text-muted space-y-1.5 pl-4 text-xs leading-relaxed">
              {entry.limitations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            {entry.sources.length > 0 && (
              <div>
                <h3 className="text-text-dim mb-2 text-[0.55rem] font-black tracking-[0.18em] uppercase">
                  Fontes e artefatos
                </h3>
                <ul className="text-text-muted space-y-1.5 pl-4 text-xs leading-relaxed">
                  {entry.sources.map((source) => (
                    <li key={source}>{source}</li>
                  ))}
                </ul>
              </div>
            )}
            {entry.nextSlugs && entry.nextSlugs.length > 0 && (
              <nav aria-label="Próximas leituras" className="flex flex-wrap gap-2">
                {entry.nextSlugs.map((nextSlug) => {
                  const next = getEditorialManifestEntry(nextSlug);
                  return (
                    <Link
                      key={nextSlug}
                      href={next.href}
                      className="text-text-muted hover:border-accent-indigo/40 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[0.6rem] font-bold tracking-wider uppercase transition-colors hover:text-white"
                    >
                      Continuar: {next.title}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
