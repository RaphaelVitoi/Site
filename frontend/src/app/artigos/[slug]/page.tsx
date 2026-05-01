import type { Metadata } from 'next';

interface ArticlePageProps {
    readonly params: Promise<{ slug: string }>;
}

export async function generateMetadata ( { params }: ArticlePageProps ): Promise<Metadata> {
    const { slug } = await params;
    return { title: `${slug.replaceAll( '-', ' ' ).toUpperCase()} | Raphael Vitoi` };
}

export default async function ArticlePage ( { params }: ArticlePageProps ) {
    const { slug } = await params;
    return (
        <main className="max-w-3xl mx-auto px-6 py-20">
            <h1 className="text-3xl font-heading font-black text-white mb-6">
                { slug.replaceAll( '-', ' ' ) }
            </h1>
            <p className="text-slate-400">Artigo em construção.</p>
        </main>
    );
}
