import ContentFooter from '@/components/content/ContentFooter';
import { ContentPageHeader } from '@/components/layout/ContentPageHeader';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

// SOTA: Global Prisma instance para prevenção de EPERM e Pool Exhaustion em dev.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if ( process.env.NODE_ENV !== 'production' ) globalForPrisma.prisma = prisma;

export const metadata = {
    title: 'O Diário do Arquiteto | Blog SOTA',
    description: 'Registros imutáveis de Engenharia de Software, Teoria dos Jogos e os bastidores do Nexus.',
};

export default async function BlogIndexPage() {
    // Busca determinística O(1) com Prisma no SQLite local
    const posts = await prisma.lesson.findMany( {
        orderBy: { createdAt: 'desc' }
    } );

    return (
        <div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
            <ContentPageHeader
                title="O Diário do Arquiteto"
                subtitle="Registros imutáveis de Engenharia de Software, Teoria dos Jogos e os bastidores do Nexus."
                category="Blog SOTA"
                icon="fa-brain"
            />

            <div className="max-w-300 mx-auto px-6 pb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    { posts.map( ( post ) => {
                        // Heurística de metadados nativa para evitar inchaço no schema.prisma
                        const wordCount = post.markdown_body.split( /\s+/ ).length;
                        const readTime = Math.max( 1, Math.ceil( wordCount / 200 ) );
                        const excerpt = post.markdown_body.substring( 0, 140 ).replaceAll( /[#*`>]/g, '' ) + '...';
                        const tags = post.tags ? post.tags.split( ',' ).map( t => t.trim() ) : [];

                        return (
                            <Link key={ post.id } href={ `/blog/${post.slug}` } className="group">
                                <GlassPanel className="p-8 h-full flex flex-col border-white/5 hover:border-accent-indigo/30 transition-all group-hover:-translate-y-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-[0.65rem] font-black uppercase tracking-widest text-accent-indigo-light bg-accent-indigo/10 px-2 py-1 rounded-md">
                                            { post.type === 'Lesson' ? 'Masterclass' : 'Artigo' }
                                        </span>
                                        <span className="text-[0.65rem] font-mono text-text-dim">
                                            { readTime } min
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-heading font-black text-text-bright mb-3 group-hover:text-accent-indigo-light transition-colors">
                                        { post.title }
                                    </h3>
                                    <p className="text-sm text-text-muted leading-relaxed mb-6 grow">
                                        { excerpt }
                                    </p>
                                    { tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-auto">
                                            { tags.slice( 0, 3 ).map( ( tag ) => (
                                                <span key={ tag } className="text-[0.6rem] font-mono text-text-darker uppercase tracking-widest bg-white/5 px-2 py-1 rounded-sm">
                                                    { tag }
                                                </span>
                                            ) ) }
                                        </div>
                                    ) }
                                </GlassPanel>
                            </Link>
                        );
                    } ) }
                </div>
            </div>

            <div className="max-w-300 mx-auto px-6 pb-12">
                <ContentFooter
                    shareTitle="O Diário do Arquiteto | Raphael Vitoi"
                    shareUrl="https://www.pokerracional.com/blog"
                    backLinkHref="/"
                    backLinkText="Voltar para a Home"
                />
            </div>
        </div>
    );
}
