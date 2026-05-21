import ContentFooter from '@/components/content/ContentFooter';
import MarkdownRenderer from '@/components/content/MarkdownRenderer';
import fs from 'fs';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import path from 'path';

interface ArticlePageProps {
    readonly params: Promise<{ slug: string }>;
}

export async function generateMetadata ( { params }: ArticlePageProps ): Promise<Metadata> {
    const { slug } = await params;
    return { title: `${slug.replace( /-/g, ' ' ).toUpperCase()} | Raphael Vitoi` };
}

export default async function ArticlePage ( { params }: ArticlePageProps ) {
    const { slug } = await params;
    const filePath = path.join( process.cwd(), 'content/artigos', `${slug}.md` );

    if ( !fs.existsSync( filePath ) )
    {
        notFound();
    }

    const content = fs.readFileSync( filePath, 'utf-8' );

    // Extração cirúrgica do título a partir do H1 principal do Markdown (# Título)
    const titleMatch = content.match( /^#\s+(.*)/m );
    const title = titleMatch ? titleMatch[ 1 ] : 'Artigo Clínico';

    // Purga o H1 do corpo textual para evitar duplicação na renderização
    const cleanContent = content.replace( /^#\s+.*$/m, '' ).trim();

    return (
        <div className="min-h-screen bg-[#020617] text-[#e2e8f0]">
            <div className="max-w-[800px] mx-auto px-6 py-16">
                <h1 className="text-3xl md:text-5xl font-black mb-8 text-transparent bg-clip-text bg-linear-to-r from-white to-slate-400 tracking-tight">
                    { title }
                </h1>

                <div className="glass-panel p-8 sm:p-12 border border-white/10 shadow-2xl shadow-fuchsia-500/10 rounded-2xl animate-fade-up">
                    <div className="prose prose-invert prose-fuchsia max-w-none text-slate-300">
                        <MarkdownRenderer content={ cleanContent } />
                    </div>
                </div>

                <div className="mt-12 animate-fade-up" style={ { animationDelay: '200ms' } }>
                    <ContentFooter
                        shareTitle={ title }
                        shareUrl={ `https://www.pokerracional.com/artigos/${slug}` }
                        backLinkHref="/artigos/psicologia-hs"
                        backLinkText="Voltar para Psicologia High Stakes"
                    />
                </div>
            </div>
        </div>
    );
}
