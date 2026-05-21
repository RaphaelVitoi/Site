import { cache } from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import MarkdownRenderer from '@/components/content/MarkdownRenderer';

export const dynamic = 'force-dynamic';

interface LessonPageProps {
    readonly params: Promise<{
        slug: string;
    }>;
}

// Using React's `cache` to deduplicate database queries within a single request.
const getLesson = cache(async (slug: string) => {
    return prisma.lesson.findUnique({
        where: { slug },
    });
});

export async function generateMetadata({ params }: LessonPageProps) {
    const { slug } = await params;
    const lesson = await getLesson(slug);

    if (!lesson) return { title: 'Aula não encontrada | Poker Racional' };

    return { title: `${lesson.title} | Poker Racional` };
}

export default async function LessonPage({ params }: LessonPageProps) {
    const { slug } = await params;
    const lesson = await getLesson(slug);

    if (!lesson) notFound();

    return (
        <main style={{ padding: '4rem 1.5rem' }}>
            <article className="max-w-4xl mx-auto">
                <header className="page-header" style={{ paddingBottom: '2rem' }}>
                    <p className="page-label">{lesson.type} &bull; {lesson.tags.split(',').join(' • ')}</p>
                    <h1 style={{
                        background: 'linear-gradient(135deg, #fff 0%, #10b981 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                        fontWeight: 800,
                        lineHeight: 1.2,
                        marginTop: 0
                    }}>
                        {lesson.title}
                    </h1>
                </header>
                <div className="glass-panel p-6 md:p-10" style={{ borderRadius: 'var(--radius-lg)' }}>
                    <MarkdownRenderer content={lesson.markdown_body} />
                </div>
            </article>
        </main>
    );
}