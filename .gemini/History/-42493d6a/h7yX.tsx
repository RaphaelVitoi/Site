import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import MarkdownRenderer from '@/components/content/MarkdownRenderer';

import ShareButtons from '@/components/content/ShareButtons';
export const dynamic = 'force-dynamic';

interface BibliotecaPageProps {
    readonly params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: BibliotecaPageProps) {
    const resolvedParams = await params;
    const content = await prisma.content.findUnique({
        where: { slug: resolvedParams.slug },
    });

    if (!content) return { title: 'Conteúdo não encontrado | Poker Racional' };

    return { title: `${content.title} | Poker Racional`, description: content.description };
}

async function BibliotecaPage({ params }: BibliotecaPageProps) {
    const resolvedParams = await params;
    const content = await prisma.content.findUnique({
        where: { slug: resolvedParams.slug },
    });

    if (!content) notFound();

    // Estimativa de tempo de leitura
    const wordCount = content.body.split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    return (
        <main className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-900 selection:text-cyan-50 py-20 px-6">
            <article className="max-w-4xl mx-auto relative">

                {/* Botao Voltar */}
                <Link href="/biblioteca" className="inline-flex items-center gap-2 text-sm font-bold tracking-widest text-slate-500 hover:text-indigo-400 transition-colors uppercase mb-12">
                    <i className="fa-solid fa-arrow-left"></i> Voltar para o Acervo
                </Link>

                {/* Hero do Artigo */}
                <header className="mb-14 relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/50 px-3 py-1.5 rounded border border-indigo-500/20">
                            <i className="fa-solid fa-book-journal-whills mr-1.5"></i> {content.category}
                        </span>
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                            <i className="fa-regular fa-clock"></i> {readTime} min de leitura
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-400 mb-6 leading-tight">
                        {content.title}
                    </h1>
                    {content.description && <p className="text-xl text-slate-400 leading-relaxed border-l-2 border-indigo-500/30 pl-4">{content.description}</p>}
                </header>

                {/* Corpo do Documento */}
                <div className="p-8 md:p-12 bg-[#0a0f1d] border border-slate-800/80 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] prose prose-invert prose-slate prose-lg max-w-none prose-headings:text-slate-100 prose-a:text-indigo-400 hover:prose-a:text-indigo-300 prose-img:rounded-xl prose-img:border prose-img:border-slate-800 prose-hr:border-slate-800/80 relative z-10">
                    <MarkdownRenderer content={content.body} />
                </div>

                <div className="mt-12 pt-8 border-t border-slate-800/80 flex justify-between items-center relative z-10">
                    <ShareButtons title={content.title} url={`http://localhost:3000/biblioteca/${content.slug}`} />
                    <span className="text-xs text-slate-600 font-mono">ID: {content.id.substring(0, 8)}</span>
                </div>

                {/* Glow de Fundo SOTA */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-indigo-900/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
            </article>
        </main>
    );
}

export default BibliotecaPage;