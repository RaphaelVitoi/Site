import type { Metadata } from 'next';

interface ArticlePageProps {
    readonly params: Promise<{ slug: string }>;
}

export async function generateMetadata ( { params }: ArticlePageProps ): Promise<Metadata> {
    const { slug } = await params;
    return { title: `${slug.replaceAll( '-', ' ' ).toUpperCase()} | Raphael Vitoi` };
}
