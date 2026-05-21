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

export default async function BlogPage() {
    // Next.js 15+ Server Component - Buscando do SQLite local com Fricção Zero
    const posts = await ( prisma as any ).lesson.findMany( {
        orderBy: { createdAt: 'desc' },
    } );

    return (
        <main className="min-h-screen bg-bg-base text-text-main p-8 font-body">
            <header className="max-w-4xl mx-auto mb-12 border-b border-white/10 pb-8">
                <h1 className="text-4xl font-black tracking-tight text-text-bright mb-3 font-heading">SISTEMA CORTEX // BLOG</h1>
                <p className="text-text-muted text-lg">Padrões de Engenharia, Teoria dos Jogos e Reflexões SOTA.</p>
            </header>

            <section className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                { posts.length === 0 ? (
                    <div className="col-span-full text-center py-16 border border-dashed border-white/10 rounded-xl text-text-dim bg-black/20">
                        Nenhum registro de artigo detectado no banco de dados SQLite local.
                    </div>
                ) : (
                    posts.map( ( post: any ) => (
                        <article key={ post.id } className="p-6 border border-white/10 rounded-xl hover:border-accent-indigo/50 transition-all duration-300 bg-bg-elevated/30 hover:bg-bg-elevated/50 group flex flex-col">
                            <h2 className="text-xl font-bold mb-3 text-text-bright group-hover:text-accent-indigo-light transition-colors font-heading">
                                <Link href={ `/blog/${post.slug || post.id}` } className="focus:outline-none focus:ring-2 focus:ring-accent-indigo rounded-sm">
                                    { post.title }
                                </Link>
                            </h2>
                            { post.excerpt && <p className="text-sm text-text-muted mb-5 leading-relaxed line-clamp-3">{ post.excerpt }</p> }
                            <div className="flex justify-between items-center text-xs text-text-dim border-t border-white/5 pt-4 mt-auto font-mono">
                                <span className="flex items-center gap-1">⏱️ { post.readTime } min</span>
                                <span>{ post.createdAt.toLocaleDateString( 'pt-BR' ) }</span>
                            </div>
                        </article>
                    ) )
                ) }
            </section>
        </main>
    );
}
