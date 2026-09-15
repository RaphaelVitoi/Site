'use client';

/**
 * IDENTITY: Index da Biblioteca SOTA (O Arquivo Akashico v7.0 GOLD)
 * PATH: src/app/biblioteca/page.tsx
 * ROLE: Organizar e exibir todos os artigos teóricos, mecânicos e laboratórios interativos documentados.
 * DESIGN: Diagramação simétrica áurea, busca em tempo real com fricção zero e categorização dinâmica.
 */

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';

type ArticleItem = {
  title: string;
  slug: string;
  desc?: string;
  isLab?: boolean;
};

type LibraryCategory = {
  id: string;
  title: string;
  icon: string;
  colorClass: string;
  badgeClass: string;
  articles: ArticleItem[];
};

const LIBRARY_CATEGORIES: LibraryCategory[] = [
  {
    id: 'fundamentos',
    title: 'Fundamentos SOTA',
    icon: 'fa-book-journal-whills',
    colorClass: 'text-accent-indigo border-accent-indigo/30 shadow-[0_0_20px_rgba(99,102,241,0.15)]',
    badgeClass: 'bg-accent-indigo/15 text-accent-indigo-light border-accent-indigo/30',
    articles: [
      {
        title: 'Manifesto SOTA: Axiomas',
        slug: 'manifesto-sota-axiomas',
        desc: 'Os pilares matemáticos da cosmovisão de Raphael Vitoi.',
      },
      {
        title: 'Hierarquia da Decisão',
        slug: 'hierarquia-da-decisao',
        desc: 'Priorização lógica sob incerteza e árvores recursivas.',
      },
      {
        title: 'Estado da Arte GOLD',
        slug: 'estado-da-arte',
        desc: 'A arquitetura epistemológica e técnica do ecossistema.',
      },
      {
        title: 'Protocolo Smart Sniper',
        slug: 'smart-sniper',
        desc: 'Detecção cirúrgica de assimetrias e exploração máxima.',
      },
      {
        title: 'Validação Smart Sniper',
        slug: 'validacao-smart-sniper',
        desc: 'Evidências empíricas e calibração de dados ao vivo.',
      },
      {
        title: 'De Claudico a Pluribus',
        slug: 'genealogia-dos-solvers-claudico-a-pluribus',
        desc: 'Genealogia dos solvers, continual resolving e passivo multiway do PMev.',
      },
    ],
  },
  {
    id: 'mecanica',
    title: 'Mecânica & ICM',
    icon: 'fa-gears',
    colorClass: 'text-accent-emerald border-accent-emerald/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    badgeClass: 'bg-accent-emerald/15 text-accent-emerald-light border-accent-emerald/30',
    articles: [
      {
        title: 'Downward Drift & Compressão',
        slug: 'downward-drift-sota',
        desc: 'A transformação dimensional de sizings pós-flop.',
        isLab: true,
      },
      {
        title: 'Geometria do Risco',
        slug: 'geometria-do-risco',
        desc: 'Relação vetorial entre Risk Premium e Bubble Factor.',
      },
      {
        title: 'Entendendo o ICM e Heurísticas',
        slug: 'entendendo-o-icm-e-suas-heuristicas',
        desc: 'Modelagem de stacks e equidade não-linear.',
      },
      {
        title: 'O ICM contra a mesa real',
        slug: 'icm-contra-a-mesa-real',
        desc: 'Quinze mil estados de torneios reais testam o ICM contra as fichas.',
        isLab: true,
      },
      {
        title: 'Heurística ICM Pós-Flop',
        slug: 'heuristica-icm-pos-flop-aula',
        desc: 'A tomada de decisão além dos solvers pré-flop.',
      },
      { title: 'Motor de Diluição', slug: 'motor-diluicao', desc: 'Diluição de equidade e preservação de torneio.' },
      {
        title: 'Teto Equidade River ICM',
        slug: 'teto-equidade-river-icm',
        desc: 'Limites assintóticos de aposta na última street.',
      },
      { title: 'Estruturas de Torneio', slug: 'estruturas-de-torneio', desc: 'Impacto dos payouts flat vs top-heavy.' },
    ],
  },
  {
    id: 'valuation',
    title: 'Valuation & Risco',
    icon: 'fa-scale-unbalanced',
    colorClass: 'text-accent-amber border-accent-amber/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    badgeClass: 'bg-accent-amber/15 text-accent-gold border-accent-amber/30',
    articles: [
      {
        title: 'Paradoxo da Valuation',
        slug: 'paradoxo-valuation',
        desc: 'A divergência entre valor nominal e valor real em fichas.',
      },
      {
        title: 'Axioma do EV Fold Dinâmico',
        slug: 'axioma-ev-fold-dinamico',
        desc: 'O custo de oportunidade de esperar por spots melhores.',
      },
      {
        title: 'Insolvência das Pot Odds',
        slug: 'insolvencia-das-pot-odds',
        desc: 'Por que pot odds puras quebram jogadores em torneios.',
      },
      {
        title: 'Risco de Ressurreição',
        slug: 'risco-de-ressurreicao',
        desc: 'Probabilidade de sobrevida do adversário dobrado.',
      },
    ],
  },
  {
    id: 'psicologia',
    title: 'Psicologia Preditiva',
    icon: 'fa-brain',
    colorClass: 'text-accent-rose border-accent-rose/30 shadow-[0_0_20px_rgba(244,63,94,0.15)]',
    badgeClass: 'bg-accent-rose/15 text-accent-rose-light border-accent-rose/30',
    articles: [
      {
        title: 'Fator Ψ (Maluquice Humana)',
        slug: 'fator-psi-maluquice-humana',
        desc: 'Modelagem estocástica do desvio comportamental do field.',
      },
      {
        title: 'Hermenêutica do Blefe',
        slug: 'hermeneutica-blefe',
        desc: 'Interpretação semiótica de linhas narrativas na mesa.',
      },
      {
        title: 'Psicologia High Stakes',
        slug: 'psicologia-high-stakes',
        desc: 'Neurofisiologia do tilt e tomada de decisão sob pressão extrema.',
      },
    ],
  },
  {
    id: 'laboratorios',
    title: 'Laboratórios & Exegese',
    icon: 'fa-microscope',
    colorClass: 'text-accent-sky border-accent-sky/30 shadow-[0_0_20px_rgba(14,165,233,0.15)]',
    badgeClass: 'bg-accent-sky/15 text-accent-sky border-accent-sky/30',
    articles: [
      {
        title: 'Exegese da Decisão',
        slug: 'exegese-da-decisao',
        desc: 'Decomposição socrática de mãos e árvores de decisão.',
        isLab: true,
      },
      {
        title: 'A Amortização da Edge',
        slug: 'voce-aprende-poker-errado',
        desc: 'Cálculo de sobrevida e taxa de retorno composta.',
        isLab: true,
      },
      {
        title: 'Teoria da Perspectiva',
        slug: 'teoria-da-perspectiva',
        desc: 'Aversão à perda e função utilidade assimétrica.',
      },
      {
        title: 'Falácia do Equilíbrio',
        slug: 'falacia-equilibrio-pedagogia',
        desc: 'Desmistificando o GTO ingênuo versus exploração real.',
      },
      {
        title: 'Laboratório ChipEV vs ICMev',
        slug: 'laboratorio-chipev-vs-icmev',
        desc: 'Comparador interativo de equidade de fichas e monetária.',
      },
      {
        title: 'Toy Games (Predator Mode)',
        slug: 'toy-games',
        desc: 'Cenários simplificados de combate puro de stacks.',
      },
      {
        title: 'Nós de Calibragem (Âncora)',
        slug: 'nos-de-calibragem',
        desc: 'Pontos de verificação estratégica para a mesa ao vivo.',
      },
    ],
  },
];

export default function BibliotecaIndexPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const totalArticles = useMemo(() => {
    return LIBRARY_CATEGORIES.reduce((acc, cat) => acc + cat.articles.length, 0);
  }, []);

  const totalLabs = useMemo(() => {
    return LIBRARY_CATEGORIES.reduce((acc, cat) => acc + cat.articles.filter((a) => a.isLab).length, 0);
  }, []);

  const filteredCategories = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return LIBRARY_CATEGORIES.map((category) => {
      if (selectedCategory !== 'all' && category.id !== selectedCategory) {
        return null;
      }
      const matchedArticles = category.articles.filter((art) => {
        if (!query) return true;
        return (
          art.title.toLowerCase().includes(query) ||
          art.desc?.toLowerCase().includes(query) ||
          art.slug.toLowerCase().includes(query)
        );
      });
      if (matchedArticles.length === 0) return null;
      return { ...category, articles: matchedArticles };
    }).filter(Boolean) as LibraryCategory[];
  }, [searchQuery, selectedCategory]);

  return (
    <div className="bg-bg-base text-text-bright font-body min-h-screen pb-24">
      <ContentPageHeader
        title="A Mente Coletiva"
        subtitle="O repositório sagrado (Registro Akáshico) de toda a doutrina, laboratórios quânticos e manifestos arquiteturais de Raphael Vitoi."
        category="Biblioteca SOTA"
        icon="fa-book-open"
      />

      <div className="sota-container space-y-16 py-12 md:py-20">
        {/* Trilha de Aprendizado Recomendada */}
        <section className="from-accent-indigo/15 via-accent-violet/10 group relative overflow-hidden rounded-4xl border border-white/10 bg-linear-to-r to-transparent p-8 shadow-2xl backdrop-blur-2xl sm:p-12">
          <div className="bg-accent-indigo/10 group-hover:bg-accent-indigo/20 pointer-events-none absolute top-0 right-0 -mt-48 -mr-48 h-96 w-96 rounded-full blur-[120px] transition-colors duration-1000" />
          <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl space-y-4">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-[#3730A3] px-3.5 py-1 text-[0.6rem] font-black tracking-[0.25em] text-white uppercase shadow-md">
                  SOTA Pathfinding
                </span>
                <span className="text-accent-indigo-light font-mono text-[0.65rem] font-bold tracking-widest uppercase">
                  {totalArticles} Ensaios · {totalLabs} Laboratórios
                </span>
              </div>
              <h2 className="text-glow-indigo m-0 text-3xl font-black tracking-tighter text-white uppercase sm:text-4xl">
                Trilha de Aprendizado Soberana
              </h2>
              <p className="text-text-muted m-0 text-sm leading-relaxed font-normal sm:text-base">
                Para neófitos e veteranos: siga a ordem exegética desenhada para a reconstrução geométrica da sua
                percepção de risco, ICM e equidade.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <PathBadge step="1" label="Manifesto" href="/biblioteca/manifesto-sota-axiomas" />
              <PathBadge step="2" label="ICM Heuristics" href="/biblioteca/entendendo-o-icm-e-suas-heuristicas" />
              <PathBadge step="3" label="Risk Geometry" href="/biblioteca/geometria-do-risco" />
              <PathBadge step="4" label="Masterclass" href="/aulas/icm-masterclass" />
            </div>
          </div>
        </section>

        {/* Barra de Filtros e Busca Inteligente */}
        <section className="space-y-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            {/* Categorias (Abas) */}
            <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
              <CategoryTab
                label="Todos"
                count={totalArticles}
                active={selectedCategory === 'all'}
                onClick={() => setSelectedCategory('all')}
              />
              {LIBRARY_CATEGORIES.map((cat) => (
                <CategoryTab
                  key={cat.id}
                  label={cat.title.split(' ')[0] ?? cat.title}
                  count={cat.articles.length}
                  active={selectedCategory === cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                />
              ))}
            </div>

            {/* Campo de Busca */}
            <div className="relative w-full md:w-80">
              <i className="fa-solid fa-magnifying-glass text-text-dim pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-xs" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por conceito ou artigo..."
                className="placeholder:text-text-dim focus:border-accent-indigo focus:ring-accent-indigo/40 font-body w-full rounded-2xl border border-white/10 bg-slate-950/60 py-3 pr-4 pl-11 text-xs text-white transition-all focus:ring-1 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-text-dim absolute top-1/2 right-3 -translate-y-1/2 rounded px-1.5 py-0.5 text-xs hover:text-white"
                  title="Limpar busca"
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Grid Simétrico das Categorias e Artigos */}
        {filteredCategories.length === 0 ? (
          <div className="rounded-4xl border border-white/5 bg-black/20 py-20 text-center">
            <i className="fa-solid fa-book-skull text-text-dim mb-4 block text-4xl" />
            <p className="text-text-muted m-0 text-sm font-bold tracking-widest uppercase">
              Nenhum artefato encontrado para "{searchQuery}".
            </p>
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
                          {category.articles.length} {category.articles.length === 1 ? 'ensaio' : 'ensaios'}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[0.55rem] font-black tracking-widest uppercase ${category.badgeClass}`}
                    >
                      SOTA
                    </span>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {category.articles.map((article) => (
                      <Link
                        key={article.slug}
                        href={`/biblioteca/${article.slug}`}
                        className="group/art flex flex-col gap-1 rounded-2xl border border-transparent p-3.5 transition-all hover:border-white/10 hover:bg-white/5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="bg-text-darker group-hover/art:bg-accent-indigo h-1.5 w-1.5 rounded-full transition-colors" />
                            <span className="text-text-main text-xs font-bold tracking-tight transition-colors group-hover/art:text-white">
                              {article.title}
                            </span>
                          </div>
                          {article.isLab && (
                            <span className="bg-accent-indigo/20 text-accent-indigo-light border-accent-indigo/30 shrink-0 rounded border px-2 py-0.5 text-[0.5rem] font-black tracking-widest uppercase">
                              LAB
                            </span>
                          )}
                        </div>
                        {article.desc && (
                          <p className="text-text-dim group-hover/art:text-text-muted m-0 line-clamp-1 pl-4 text-[0.7rem] font-normal transition-colors">
                            {article.desc}
                          </p>
                        )}
                      </Link>
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

function CategoryTab({
  label,
  count,
  active,
  onClick,
}: Readonly<{
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-bold tracking-wider uppercase transition-all ${
        active
          ? 'border-[#4F46E5] bg-[#3730A3] text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]'
          : 'text-text-muted border-white/5 bg-white/5 hover:border-white/10 hover:text-white'
      }`}
    >
      <span>{label}</span>
      <span
        className={`py-0.2 rounded-full px-1.5 text-[0.6rem] ${
          active ? 'bg-white/20 text-white' : 'text-text-dim bg-black/40'
        }`}
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
      className="bg-bg-panel/40 hover:border-accent-indigo/40 hover:bg-bg-panel/60 group/badge flex items-center gap-3 rounded-2xl border border-white/5 px-4 py-3 transition-all"
    >
      <span className="bg-accent-indigo/10 text-accent-indigo-light border-accent-indigo/20 flex h-6 w-6 items-center justify-center rounded-lg border text-[0.65rem] font-black transition-colors group-hover/badge:bg-[#3730A3] group-hover/badge:text-white">
        {step}
      </span>
      <span className="text-text-dim text-[0.7rem] font-black tracking-widest uppercase transition-colors group-hover/badge:text-white">
        {label}
      </span>
      <i className="fa-solid fa-chevron-right text-text-darker text-[0.6rem] transition-transform group-hover/badge:translate-x-0.5" />
    </Link>
  );
}
