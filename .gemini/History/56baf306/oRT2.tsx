/**
 * IDENTITY: Rota Principal do Blog (Index)
 * PATH: frontend/src/app/blog/page.tsx
 * ROLE: Renderizar o feed dinâmico de artigos do ecossistema, consumindo SQLite/Prisma via Server Components SOTA.
 * BINDING: [frontend/prisma/schema.prisma, UI/UX Central]
 * TELEOLOGY: Evoluir para suportar filtros assíncronos pesados e paginação infinita combinada com busca vetorial (RAG) no futuro.
 */
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function BlogPage() {
    // Next.js 15+ Server Component - Buscando do SQLite local com Fricção Zero
    const posts = await prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
    });

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-gray-200 p-8 font-sans selection:bg-cyan-900 selection:text-cyan-50">
            <header className="max-w-4xl mx-auto mb-12 border-b border-gray-800 pb-8">
                <h1 className="text-4xl font-bold tracking-tight text-cyan-500 mb-3 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">SISTEMA CORTEX // BLOG</h1>
                <p className="text-gray-400 text-lg">Padrões de Engenharia, Teoria dos Jogos e Reflexões SOTA.</p>
            </header>

            <section className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.length === 0 ? (
                    <div className="col-span-full text-center py-16 border border-dashed border-gray-800/60 rounded-xl text-gray-500 bg-black/20">
                        Nenhum registro de artigo detectado no banco de dados SQLite local.
                    </div>
                ) : (
                    posts.map((post) => (
                        <article key={post.id} className="p-6 border border-gray-800/80 rounded-xl hover:border-cyan-500/50 transition-all duration-300 bg-[#111111] hover:bg-[#151515] group flex flex-col">
                            <h2 className="text-xl font-semibold mb-3 text-gray-100 group-hover:text-cyan-400 transition-colors">
                                <Link href={`/blog/${post.slug || post.id}`} className="focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-sm">
                                    {post.title}
                                </Link>
                            </h2>
                            {post.excerpt && <p className="text-sm text-gray-400 mb-5 leading-relaxed line-clamp-3">{post.excerpt}</p>}
                            <div className="flex justify-between items-center text-xs text-gray-600 border-t border-gray-800/50 pt-4 mt-auto">
                                <span className="flex items-center gap-1">⏱️ {post.readTime} min</span>
                                <span>{post.createdAt.toLocaleDateString('pt-BR')}</span>
                            </div>
                        </article>
                    ))
                )}
            </section>
        </main>
    );
}