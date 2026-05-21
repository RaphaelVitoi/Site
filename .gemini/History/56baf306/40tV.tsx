/**
 * IDENTITY: Rota Principal do Blog (Index)
 * PATH: frontend/src/app/blog/page.tsx
 * ROLE: Renderizar o feed dinâmico de artigos do ecossistema, consumindo SQLite/Prisma via Server Components SOTA.
 * BINDING: [frontend/prisma/schema.prisma, UI/UX Central]
 * TELEOLOGY: Evoluir para suportar filtros assíncronos pesados e paginação infinita combinada com busca vetorial (RAG) no futuro.
 */
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

const prisma = new PrismaClient();

// SOTA: Extração atômica para compensar a ausência de metadados nativos no banco
function getReadTime( text: string ): number {
    if ( !text ) return 1;
    return Math.max( 1, Math.ceil( text.trim().split( /\s+/ ).length / 200 ) );
}

function getExcerpt( text: string ): string {
    if ( !text ) return '';
    // Limpeza de entropia do markdown para resumo limpo
    const cleanText = text.replace( /[#*`_\[\]]/g, '' ).trim();
    return cleanText.length > 140 ? cleanText.substring( 0, 140 ) + '...' : cleanText;
}

export default async function BlogPage() {
    // Next.js 15+ Server Component - Buscando do SQLite local com Fricção Zero
    const posts = await ( prisma as any ).lesson.findMany( {
        where: { type: 'Lesson' }, // Filtro termodinâmico para o escopo correto
        orderBy: { createdAt: 'desc' },
    } );

    return (
        <main className="min-h-screen bg-bg-base text-text-main p-8 font-body pb-24">
            <header className="max-w-4xl mx-auto mb-16 border-b border-white/5 pb-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.05),transparent_50%)] pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="flex items-center gap-2 px-3 py-1 rounded-md bg-accent-indigo/10 border border-accent-indigo/20 text-[0.65rem] font-black text-accent-indigo-light uppercase tracking-widest font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-indigo animate-pulse" />
                            Sistema Cortex
                        </span>
                        <span className="text-[0.65rem] font-bold text-text-muted uppercase tracking-[0.2em] font-mono">
                            Base de Conhecimento
                        </span>
                    </div>
                    <h1 className="text-[clamp(2rem,5vw,4rem)] font-black tracking-tighter text-text-bright mb-4 font-heading leading-none">
                        O Diário do <br className="hidden sm:block" />Arquiteto
                    </h1>
                    <p className="text-text-muted text-lg max-w-2xl leading-relaxed">
                        Registros imutáveis de Engenharia de Software, Teoria dos Jogos e Reflexões SOTA. A mente coletiva operando em Fricção Zero.
                    </p>
                </div>
            </header>

            <section className="max-w-4xl mx-auto grid grid-cols-1 gap-6">
                { posts.length === 0 ? (
                    <div className="col-span-full text-center py-20 border border-dashed border-white/10 rounded-2xl text-text-dim bg-white/2">
                        <i className="fa-solid fa-database text-3xl mb-4 opacity-50" />
                        <p className="font-mono text-sm uppercase tracking-widest">Nenhum registro epistêmico detectado na matriz local.</p>
                    </div>
                ) : (
                    posts.map( ( post: any ) => {
                        const readTime = getReadTime( post.markdown_body );
                        const excerpt = getExcerpt( post.markdown_body );
                        const tags = post.tags ? post.tags.split( ',' ).map( ( t: string ) => t.trim() ) : [];

                        return (
                            <article key={ post.id } className="p-8 border border-white/5 rounded-2xl hover:border-accent-indigo/30 transition-all duration-500 bg-white/2 hover:bg-white/5 group flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-accent-indigo/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex-1">
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[0.6rem] font-black text-text-bright uppercase tracking-widest font-mono">
                                            { post.type }
                                        </span>
                                        { tags.map( ( tag: string ) => (
                                            <span key={ tag } className="px-2.5 py-1 rounded bg-black/40 border border-white/5 text-[0.6rem] font-bold text-text-muted uppercase tracking-widest font-mono group-hover:border-accent-indigo/20 group-hover:text-accent-indigo-light transition-colors">
                                                { tag }
                                            </span>
                                        ) ) }
                                    </div>
                                    <h2 className="text-2xl font-black mb-3 text-text-bright group-hover:text-white transition-colors font-heading tracking-tighter">
                                        <Link href={ `/blog/${post.slug || post.id}` } className="focus:outline-none focus:ring-2 focus:ring-accent-indigo rounded-sm before:absolute before:inset-0">
                                            { post.title }
                                        </Link>
                                    </h2>
                                    <p className="text-sm text-text-muted mb-6 leading-relaxed line-clamp-3">{ excerpt }</p>
                                    <div className="flex items-center gap-4 text-xs text-text-dim font-mono uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5"><i className="fa-regular fa-clock" /> { readTime } min</span>
                                        <span className="flex items-center gap-1.5"><i className="fa-regular fa-calendar" /> { new Date( post.createdAt ).toLocaleDateString( 'pt-BR' ) }</span>
                                    </div>
                                </div>
                                <div className="hidden md:flex shrink-0 w-12 h-12 rounded-full border border-white/5 items-center justify-center bg-black/20 text-text-dim group-hover:text-accent-indigo group-hover:border-accent-indigo/30 transition-all group-hover:scale-110">
                                    <i className="fa-solid fa-arrow-right -rotate-45" />
                                </div>
                            </article>
                        );
                    } )
                ) }
            </section>
        </main>
    );
}
