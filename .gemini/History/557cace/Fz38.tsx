import ContentFooter from '@/components/content/ContentFooter';
import { ContentPageHeader } from '@/components/layout/ContentPageHeader';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

// SOTA: Global Prisma instance para prevenção de EPERM e Pool Exhaustion em dev.
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if ( process.env.NODE_ENV !== 'production' ) globalForPrisma.prisma = prisma;

interface BlogPostProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata( props: BlogPostProps ) {
    const resolvedParams = await props.params;
    const post = await prisma.lesson.findUnique( {
        where: { slug: resolvedParams.slug }
    } );

    if ( !post ) return { title: 'Artigo não encontrado | Blog SOTA' };

    return {
        title: `${post.title} | Blog SOTA`,
        description: post.markdown_body.substring( 0, 160 ).replace( /[#*`]/g, '' ) + '...',
    };
}

export default async function BlogPostPage( props: BlogPostProps ) {
    const resolvedParams = await props.params;

    // Busca determinística (Single Source of Truth)
    const post = await prisma.lesson.findUnique( {
        where: { slug: resolvedParams.slug }
    } );

    if ( !post ) {
        notFound();
    }

    // Extração heurística SOTA (Fricção Zero no schema.prisma)
    const wordCount = post.markdown_body.split( /\s+/ ).length;
    const readTime = Math.max( 1, Math.ceil( wordCount / 200 ) );
    const tags = post.tags ? post.tags.split( ',' ).map( t => t.trim() ) : [];

    // Dicionário de Mapeamento AST (Abstract Syntax Tree) -> Estética SOTA
    const SotaMarkdownComponents: any = {
        h1: ( { node, ...props }: any ) => <h1 className="text-3xl sm:text-4xl font-heading font-bold text-text-main mt-10 mb-6" { ...props } />,
        h2: ( { node, ...props }: any ) => <h2 className="text-2xl sm:text-3xl font-heading font-bold text-text-bright mt-12 mb-6 border-b border-white/10 pb-2" { ...props } />,
        h3: ( { node, ...props }: any ) => <h3 className="text-xl sm:text-2xl font-heading font-bold text-text-light mt-8 mb-4" { ...props } />,
        p: ( { node, ...props }: any ) => <p className="text-text-muted leading-relaxed mb-6 text-lg" { ...props } />,
        a: ( { node, ...props }: any ) => <a className="text-accent-primary hover:text-accent-sky transition-colors underline decoration-accent-primary/30 hover:decoration-accent-sky underline-offset-4" target="_blank" rel="noopener noreferrer" { ...props } />,
        ul: ( { node, ...props }: any ) => <ul className="list-disc list-outside pl-6 mb-6 text-text-muted space-y-2 text-lg" { ...props } />,
        ol: ( { node, ...props }: any ) => <ol className="list-decimal list-outside pl-6 mb-6 text-text-muted space-y-2 text-lg" { ...props } />,
        li: ( { node, ...props }: any ) => <li className="pl-2" { ...props } />,
        blockquote: ( { node, ...props }: any ) => (
            <blockquote className="border-l-4 border-accent-primary bg-accent-primary/5 p-6 my-8 rounded-r-xl text-text-light italic text-lg shadow-inner" { ...props } />
        ),
        code: ( { node, inline, className, children, ...props }: any ) => {
            const match = /language-(\w+)/.exec( className || '' );
            return !inline ? (
                <div className="rounded-xl overflow-hidden my-8 border border-white/10 bg-bg-deep shadow-sota-glass">
                    <div className="flex items-center px-4 py-2 bg-white/5 border-b border-white/10">
                        <div className="flex space-x-2">
                            <div className="w-3 h-3 rounded-full bg-accent-danger/80"></div>
                            <div className="w-3 h-3 rounded-full bg-accent-amber/80"></div>
                            <div className="w-3 h-3 rounded-full bg-accent-emerald/80"></div>
                        </div>
                        { match && <span className="ml-4 text-xs font-mono text-text-dim uppercase tracking-wider">{ match[1] }</span> }
                    </div>
                    <pre className="p-4 overflow-x-auto text-sm font-mono text-text-bright leading-relaxed">
                        <code className={ className } { ...props }>
                            { children }
                        </code>
                    </pre>
                </div>
            ) : (
                <code className="px-1.5 py-0.5 mx-0.5 rounded-md bg-white/10 text-accent-sky font-mono text-[0.9em] border border-white/5" { ...props }>
                    { children }
                </code>
            );
        },
        table: ( { node, ...props }: any ) => (
            <div className="overflow-x-auto my-8 rounded-xl border border-white/10 shadow-sota-glass">
                <table className="w-full text-left border-collapse" { ...props } />
            </div>
        ),
        th: ( { node, ...props }: any ) => <th className="p-4 bg-white/5 font-heading font-semibold text-text-bright border-b border-white/10 whitespace-nowrap" { ...props } />,
        td: ( { node, ...props }: any ) => <td className="p-4 border-b border-white/5 text-text-muted align-top" { ...props } />,
        hr: ( { node, ...props }: any ) => <hr className="my-10 border-white/10" { ...props } />
    };

    return (
        <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
            <ContentPageHeader
                title={ post.title }
                subtitle={ `Tempo de leitura estimado: ${readTime} min` }
                category={ post.type === 'Lesson' ? 'Masterclass' : 'Artigo SOTA' }
                icon="fa-book-open"
            />

            <div className="max-w-300 mx-auto px-6 pb-12">
                { tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8 justify-center">
                        { tags.map( ( tag, idx ) => (
                            <span key={ idx } className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-text-dim uppercase tracking-widest">
                                { tag }
                            </span>
                        ) ) }
                    </div>
                ) }

                <GlassPanel className="p-8 sm:p-12 lg:p-16">
                    <div className="prose prose-invert max-w-none">
                        {/* A Injeção SOTA: Markdown para React AST sem perder Fricção Zero */ }
                        <ReactMarkdown
                            remarkPlugins={ [remarkGfm] }
                            rehypePlugins={ [rehypeSlug] }
                            components={ SotaMarkdownComponents }
                        >
                            { post.markdown_body }
                        </ReactMarkdown>
                    </div>
                </GlassPanel>
            </div>

            <div className="max-w-300 mx-auto px-6 pb-24">
                <ContentFooter
                    shareTitle={ `${post.title} | Raphael Vitoi` }
                    shareUrl={ `https://www.pokerracional.com/blog/${post.slug}` }
                    backLinkHref="/blog"
                    backLinkText="Voltar para o Blog"
                />
            </div>
        </div>
    );
}
