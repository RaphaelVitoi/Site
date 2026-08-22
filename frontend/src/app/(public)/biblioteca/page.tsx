'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import {
  getEditorialEvidenceLabel,
  getLibraryCategories,
  type EditorialManifestEntry,
} from '@/content/editorialManifest';

type LibraryCategory = ReturnType<typeof getLibraryCategories>[number];

export default function BibliotecaIndexPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const categories = useMemo(() => getLibraryCategories(), []);
  const totalArticles = categories.reduce((total, category) => total + category.articles.length, 0);
  const totalLabs = categories.reduce(
    (total, category) => total + category.articles.filter((article) => article.kind === 'laboratory').length,
    0,
  );
  const filteredCategories = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return categories
      .map((category) => {
        if (selectedCategory !== 'all' && category.id !== selectedCategory) return null;
        const articles = category.articles.filter(
          (article) =>
            !query ||
            [article.title, article.summary, article.slug, getEditorialEvidenceLabel(article.evidenceLevel)].some(
              (field) => field.toLowerCase().includes(query),
            ),
        );
        return articles.length ? { ...category, articles } : null;
      })
      .filter((category): category is LibraryCategory => category !== null);
  }, [categories, searchQuery, selectedCategory]);

  return (
    <div className="bg-bg-base font-body text-text-bright min-h-screen pb-24">
      <ContentPageHeader
        title="Biblioteca PMev"
        subtitle="Um acervo versionado de fundamentos, hipóteses, laboratórios e método — com proveniência e limites explícitos."
        category="Biblioteca"
        icon="fa-book-open"
      />
      <div className="sota-container space-y-12 py-12 md:py-20">
        <section className="from-accent-indigo/15 via-accent-violet/10 relative overflow-hidden rounded-4xl border border-white/10 bg-linear-to-r to-transparent p-8 shadow-2xl backdrop-blur-2xl sm:p-12">
          <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl space-y-4">
              <span className="bg-accent-indigo rounded-full px-3.5 py-1 text-[0.6rem] font-black tracking-[0.25em] text-white uppercase">
                Trilha didática versionada
              </span>
              <h2 className="m-0 text-3xl font-black tracking-tighter text-white uppercase sm:text-4xl">
                Do baseline à investigação
              </h2>
              <p className="text-text-muted m-0 text-sm leading-relaxed sm:text-base">
                Comece pelos conceitos de ICM; avance para as hipóteses PMev; trate laboratórios como instrumentos, não
                como prova de validade externa.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <PathBadge step="1" label="Conceitos ICM" href="/aulas/conceitos-icm" />
              <PathBadge step="2" label="Whitepaper" href="/aulas/leitura-icm" />
              <PathBadge step="3" label="Laboratório" href="/biblioteca/laboratorio-chipev-vs-icmev" />
            </div>
          </div>
        </section>
        <section className="space-y-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
              <CategoryTab
                label="Todos"
                count={totalArticles}
                active={selectedCategory === 'all'}
                onClick={() => setSelectedCategory('all')}
              />
              {categories.map((category) => (
                <CategoryTab
                  key={category.id}
                  label={category.title}
                  count={category.articles.length}
                  active={selectedCategory === category.id}
                  onClick={() => setSelectedCategory(category.id)}
                />
              ))}
            </div>
            <div className="relative w-full md:w-80">
              <i className="fa-solid fa-magnifying-glass text-text-dim pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-xs" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Buscar por conceito ou artigo..."
                className="placeholder:text-text-dim focus:border-accent-indigo focus:ring-accent-indigo/40 w-full rounded-2xl border border-white/10 bg-slate-950/60 py-3 pr-4 pl-11 text-xs text-white focus:ring-1 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-text-dim absolute top-1/2 right-3 -translate-y-1/2 rounded px-1.5 py-0.5 text-xs hover:text-white"
                  aria-label="Limpar busca"
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              )}
            </div>
          </div>
          <p className="text-text-dim font-mono text-[0.65rem] tracking-widest uppercase">
            {totalArticles} unidades editoriais · {totalLabs} laboratórios · cada item declara seu estatuto de evidência
          </p>
        </section>
        {filteredCategories.length === 0 ? (
          <div className="text-text-muted rounded-4xl border border-white/5 bg-black/20 py-20 text-center text-sm font-bold tracking-widest uppercase">
            Nenhum artefato encontrado para “{searchQuery}”.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {filteredCategories.map((category) => (
              <GlassPanel
                key={category.id}
                className={`flex flex-col justify-between rounded-4xl border-t-4 bg-slate-900/40 p-6 transition-all duration-500 hover:bg-slate-900/60 sm:p-8 ${category.colorClass}`}
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-accent-indigo-light flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                        <i className={`fa-solid ${category.icon} text-base`} />
                      </div>
                      <div>
                        <h2 className="m-0 text-base font-black tracking-wider text-white uppercase">
                          {category.title}
                        </h2>
                        <span className="text-text-dim font-mono text-[0.6rem] tracking-widest uppercase">
                          {category.articles.length} unidades
                        </span>
                      </div>
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[0.55rem] font-black tracking-widest uppercase ${category.badgeClass}`}
                    >
                      Catalogado
                    </span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {category.articles.map((article) => (
                      <ArticleLink key={article.slug} article={article} />
                    ))}
                  </div>
                </div>
              </GlassPanel>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ArticleLink({ article }: Readonly<{ article: EditorialManifestEntry }>) {
  return (
    <Link
      href={article.href}
      className="group/art flex flex-col gap-2 rounded-2xl border border-transparent p-3.5 transition-all hover:border-white/10 hover:bg-white/5"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-text-main flex items-center gap-2.5 text-xs font-bold tracking-tight transition-colors group-hover/art:text-white">
          <span className="bg-text-darker group-hover/art:bg-accent-indigo h-1.5 w-1.5 rounded-full transition-colors" />
          {article.title}
        </span>
        {article.kind === 'laboratory' && (
          <span className="border-accent-indigo/30 bg-accent-indigo/20 text-accent-indigo-light shrink-0 rounded border px-2 py-0.5 text-[0.5rem] font-black tracking-widest uppercase">
            LAB
          </span>
        )}
      </div>
      <p className="text-text-dim group-hover/art:text-text-muted m-0 pl-4 text-[0.7rem] font-normal transition-colors">
        {article.summary}
      </p>
      <span className="text-text-dim ml-4 w-fit rounded border border-white/10 bg-black/20 px-1.5 py-0.5 text-[0.5rem] font-black tracking-widest uppercase">
        {getEditorialEvidenceLabel(article.evidenceLevel)}
      </span>
    </Link>
  );
}
function CategoryTab({
  label,
  count,
  active,
  onClick,
}: Readonly<{ label: string; count: number; active: boolean; onClick: () => void }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-bold tracking-wider uppercase transition-all ${active ? 'border-accent-indigo bg-accent-indigo text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'text-text-muted border-white/5 bg-white/5 hover:border-white/10 hover:text-white'}`}
    >
      <span>{label}</span>
      <span
        className={`rounded-full px-1.5 py-0.5 text-[0.6rem] ${active ? 'bg-white/20 text-white' : 'text-text-dim bg-black/40'}`}
      >
        {count}
      </span>
    </button>
  );
}
function PathBadge({ step, label, href }: Readonly<{ step: string; label: string; href: string }>) {
  return (
    <Link
      href={href}
      className="group/badge bg-bg-panel/40 hover:border-accent-indigo/40 hover:bg-bg-panel/60 flex items-center gap-3 rounded-2xl border border-white/5 px-4 py-3 transition-all"
    >
      <span className="border-accent-indigo/20 bg-accent-indigo/10 text-accent-indigo-light group-hover/badge:bg-accent-indigo flex h-6 w-6 items-center justify-center rounded-lg border text-[0.65rem] font-black transition-colors group-hover/badge:text-white">
        {step}
      </span>
      <span className="text-text-dim text-[0.7rem] font-black tracking-widest uppercase transition-colors group-hover/badge:text-white">
        {label}
      </span>
      <i className="fa-solid fa-chevron-right text-text-darker text-[0.6rem] transition-transform group-hover/badge:translate-x-0.5" />
    </Link>
  );
}
