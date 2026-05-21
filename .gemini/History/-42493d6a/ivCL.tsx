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

    return (
        <main className="py-16 px-6 md:px-8 lg:px-12">
            <article className="max-w-4xl mx-auto">
                <header className="page-header pb-10">
                    <p className="page-label uppercase text-indigo-400 font-bold text-xs tracking-widest mb-2">{content.category}</p>
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-500 mt-0 leading-tight">
                        {content.title}
                    </h1>
                </header>
                <div className="glass-panel p-6 md:p-10 bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-xl prose prose-invert prose-lg max-w-none">
                    <MarkdownRenderer content={content.body} />
                </div>
                <ShareButtons title={content.title} url={`http://localhost:3000/biblioteca/${content.slug}`} />
            </article>
        </main>
    );
}

export default BibliotecaPage;