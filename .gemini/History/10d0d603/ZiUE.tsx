import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

const prisma = new PrismaClient();

interface ArticlePageProps {
    readonly params: {
        slug: string;
    };
}

export default async function ArticlePage ( { params }: ArticlePageProps ) {
    const article = await prisma.article.findUnique( {
        where: { slug: params.slug },
    } );

    if ( !article )
    {
        notFound();
    }

    // Parse da Diretriz "Didática Visceral" (SPEC_ARTICLE_PAGE.md)
    const renderContent = () => {
        if ( article.content.includes( '[SIMULADOR_V1]' ) )
        {
            const parts = article.content.split( '[SIMULADOR_V1]' );
            return (
                <>
                    <ReactMarkdown>{ parts[ 0 ] }</ReactMarkdown>
                    <div className="my-12 flex w-full justify-center xl:-ml-16 xl:w-[calc(100%+8rem)]">
                        <div className="w-full rounded-xl border border-indigo-500/30 bg-slate-900/50 p-8 text-center shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)]">
                            <h3 className="mb-2 font-mono text-2xl font-bold text-indigo-400">[TEMPLO INTERATIVO SOTA]</h3>
                            <p className="font-mono text-sm text-slate-400">O Simulador V1 de Perspectiva Matemática será acoplado nativamente aqui.</p>
                        </div>
                    </div>
                    <ReactMarkdown>{ parts[ 1 ] }</ReactMarkdown>
                </>
            );
        }
        return <ReactMarkdown>{ article.content }</ReactMarkdown>;
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 py-12 px-6">
            <div className="mx-auto max-w-3xl">
                <Link href="/biblioteca" className="mb-8 inline-block font-mono text-sm text-indigo-400 transition-colors hover:text-indigo-300">
                    &larr; Voltar para a Biblioteca
                </Link>

                <header className="mb-12 border-b border-slate-800 pb-8">
                    <h1 className="mb-4 font-serif text-4xl font-extrabold leading-tight text-slate-100 md:text-5xl">
                        { article.title }
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 font-mono text-sm text-slate-400">
                        <time dateTime={ article.publishedAt.toISOString() }>
                            { new Date( article.publishedAt ).toLocaleDateString( 'pt-BR', { day: '2-digit', month: 'long', year: 'numeric' } ) }
                        </time>
                        <span>•</span>
                        <span>{ article.readTime || 'Leitura SOTA' }</span>
                    </div>
                </header>

                <article className="prose prose-invert prose-lg prose-indigo max-w-none font-sans leading-relaxed">
                    { renderContent() }
                </article>
            </div>
        </div>
    );
}
