import { cache } from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import MarkdownRenderer from '@/components/content/MarkdownRenderer';
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
        <div className="relative bg-slate-950 py-16 sm:py-24">
            <div aria-hidden="true" className="absolute inset-0 hidden sm:block">
                <div className="absolute inset-0 bg-slate-900" />
                <svg className="absolute top-0 right-1/2 -mr-32 h-full w-4/5" viewBox="0 0 404 392" fill="none" preserveAspectRatio="xMidYMid slice">
                    <defs>
                        <pattern id="e229dbec-10e9-49ee-8ec3-0286ca089edf" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                            <rect x="0" y="0" width="4" height="4" className="text-slate-800" fill="currentColor" />
                        </pattern>
                    </defs>
                    <rect width="404" height="392" fill="url(#e229dbec-10e9-49ee-8ec3-0286ca089edf)" />
                </svg>
            </div>
            <main className="relative">
                <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <header className="page-header text-center mb-12">
                        <p className="font-mono text-sm uppercase tracking-widest text-emerald-400">
                            Aula • Masterclass
                        </p>
                        <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight font-heading" style={{
                            background: 'linear-gradient(135deg, #fff 0%, #10b981 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            {lesson.title}
                        </h1>
                    </header>
                    <div className="glass-panel p-6 md:p-10 border border-white/10 shadow-2xl shadow-emerald-500/10">
                        <MarkdownRenderer content={lesson.body} />
                    </div>

                    <div className="mt-16">
                        <ShareButtons title={lesson.title} url={lessonUrl} />
                    </div>
                </article>
            </main>
        </div>
    );
}
