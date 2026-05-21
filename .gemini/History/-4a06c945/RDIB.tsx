import { cache } from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import MarkdownRenderer from '@/components/content/MarkdownRenderer';
import LessonHeader from '@/components/content/LessonHeader';
import ShareButtons from '@/components/content/ShareButtons';

export const dynamic = 'force-dynamic';

interface LessonPageProps {
    readonly params: Promise<{
        slug: string;
    }>;
}

// Using React's `cache` to deduplicate database queries within a single request.
const getLesson = cache(async (slug: string) => {
    return prisma.content.findFirst({
        where: {
            slug,
            category: 'aulas',
            isPublished: true,
        },
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

    const lessonUrl = `https://www.pokerracional.com/aulas/${slug}`;

    return (
        // Standardized page structure for consistency with other sections like /biblioteca
        <main className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <article className="animate-fade-up">
                <LessonHeader title={lesson.title} category="Aula • Masterclass" />

                <div className="glass-panel p-6 md:p-10 border border-white/10 shadow-2xl shadow-emerald-500/10 rounded-xl animate-fade-up animation-delay-200">
                    <MarkdownRenderer content={lesson.body} />
                </div>

                <div className="mt-16 animate-fade-up animation-delay-400">
                    <ShareButtons title={lesson.title} url={lessonUrl} />
                </div>
            </article>
        </main>
    );
}
