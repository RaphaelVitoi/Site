'use client';

/**
 * IDENTITY: Página de Artigo Dinâmica (SOTA Content)
 * PATH: src/app/biblioteca/[slug]/page.tsx
 * ROLE: Renderizar artigos do banco Prisma usando MDX/Markdown.
 */

import { useParams } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';
import MarkdownRenderer from '@/components/content/MarkdownRenderer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import ReadingProgress from '@/components/content/ReadingProgress';
import ScrollToTop from '@/components/content/ScrollToTop';
import ContentFooter from '@/components/content/ContentFooter';
import TableOfContents from '@/components/content/TableOfContents';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function DynamicArticlePage() {
    const { slug } = useParams();
    const { data: content, error, isLoading } = useSWR(`/api/content/${slug}`, fetcher);

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-bg-base text-text-darker uppercase tracking-[0.3em] font-black animate-pulse">
            Sincronizando Mente Coletiva...
        </div>
    );

    if (error || !content || content.error) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-bg-base text-accent-danger gap-6">
            <i className="fa-solid fa-triangle-exclamation text-5xl" />
            <h1 className="text-2xl font-black uppercase tracking-widest">Artefato Não Encontrado</h1>
            <p className="text-text-dim font-medium uppercase tracking-tighter">O slug &quot;{slug}&quot; não existe na base de dados SOTA.</p>
            <Link href="/biblioteca" className="btn-secondary px-8 py-3 rounded-xl uppercase font-black text-xs tracking-widest mt-4">Voltar à Biblioteca</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-bg-base relative overflow-x-hidden">
            <ReadingProgress />
            <ScrollToTop />
            
            <header className="pt-32 pb-20 sota-container relative z-10">
                <div className="max-w-4xl mx-auto space-y-8 animate-sota-in">
                    <SectionHeader 
                        step="ART" 
                        label={content.category || 'Ensaio'} 
                        title={content.title} 
                        description={content.description || ''} 
                    />
                    <div className="h-px w-24 bg-accent-indigo/30 mx-auto" />
                </div>
            </header>

            <main className="sota-container pb-32 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-16 items-start">
                    <article className="glass-panel p-10 lg:p-20 rounded-4xl border-white/10 shadow-2xl animate-sota-in">
                        <div className="prose prose-invert prose-indigo max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-widest">
                            <MarkdownRenderer content={content.body} />
                        </div>
                        <ContentFooter 
                            shareTitle={content.title} 
                            shareUrl={`https://site-raphael.vitoi.com/biblioteca/${slug}`} 
                            backLinkHref="/biblioteca"
                            backLinkText="Voltar à Biblioteca"
                        />
                    </article>

                    <aside className="hidden lg:block sticky top-32 space-y-12 animate-sota-in animation-delay-300">
                        <div className="glass-panel p-8 rounded-3xl border-white/5 bg-black/40">
                            <h4 className="text-[0.6rem] font-black text-text-muted uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-4">Neste Artefato</h4>
                            <TableOfContents toc={[]} />
                        </div>

                        <div className="p-8 bg-accent-indigo/5 border border-accent-indigo/10 rounded-3xl">
                            <h4 className="text-[0.6rem] font-black text-white uppercase tracking-widest mb-4">Metadados SOTA</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[0.55rem] text-text-dim uppercase font-bold">Status</span>
                                    <span className="text-[0.55rem] text-accent-emerald uppercase font-black tracking-widest bg-accent-emerald/10 px-2 py-0.5 rounded border border-emerald-500/20">Validado</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[0.55rem] text-text-dim uppercase font-bold">Arquitetura</span>
                                    <span className="text-[0.55rem] text-text-bright uppercase font-mono font-black">v5.2 GOLD</span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            <footer className="border-t border-white/5 py-20 bg-bg-deep/50">
                <div className="sota-container text-center text-[0.6rem] font-black text-text-darker uppercase tracking-[0.4em]">
                    Paradigma VITOI &middot; Monolito Nexus &middot; 2026
                </div>
            </footer>
        </div>
    );
}
