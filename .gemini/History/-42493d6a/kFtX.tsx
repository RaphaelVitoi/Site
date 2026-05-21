import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import MarkdownRenderer from '@/components/content/MarkdownRenderer';

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
                <header className="page-header" style={{ paddingBottom: '2.5rem' }}>
                    <p className="page-label uppercase text-indigo-400 font-bold text-xs tracking-widest mb-2">{content.category}</p>
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-500 mt-0 leading-tight">
                        {/*<h1 style={{
                        background: 'linear-gradient(135deg, #fff 0%, #6366f1 100%)', // Replaced with Tailwind
                        backgroundClip: 'text', // Replaced with Tailwind
                        WebkitBackgroundClip: 'text', // Replaced with Tailwind
                        WebkitTextFillColor: 'transparent', // Replaced with Tailwind
                        fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', // Using text-4xl
                        fontWeight: 800, // Using font-bold
                        lineHeight: 1.2, //Using leading-tight
                        marginTop: 0 //Using mt-0
                        {content.title}
                    </h1>
                </header>
                <div className="glass-panel p-6 md:p-10 bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-xl">
                    <MarkdownRenderer content={content.body} />
                </div>
            </article>
        </main>
    );
}

export default BibliotecaPage;