import { cache } from 'react';
import { notFound } from 'next/navigation';
import fs from 'fs/promises';
import path from 'path';
import MarkdownRenderer from '@/components/content/MarkdownRenderer';
import LessonHeader from '@/components/content/LessonHeader';
import ContentFooter from '@/components/content/ContentFooter';

interface LessonPageProps {
    readonly params: Promise<{
        slug: string;
    }>;
}

// Lê o arquivo .md correspondente ao slug na pasta existente docs/epics/
const getLesson = cache(async (slug: string) => {
    try {
        const basePath = path.join(process.cwd(), '..', 'docs', 'epics');
        let filePath = path.join(basePath, `${slug}.md`);

        try {
            // Tenta achar o arquivo direto (ex: docs/epics/slug.md)
            await fs.access(filePath);
        } catch {
            // Fallback para o padrão aninhado (ex: docs/epics/aula-icm-rp/aula-icm-rp.md)
            filePath = path.join(basePath, slug, `${slug}.md`);
        }

        const fileContents = await fs.readFile(filePath, 'utf8');

        const titleMatch = fileContents.match(/^#\s+(.*)/m);
        const title = titleMatch ? titleMatch[1].trim() : 'Aula sem título';
        const body = fileContents.replace(/^#\s+.*\n?/, '').trim();

        return { title, body };
    } catch {
        return null;
    }
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
        <main className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <article className="animate-fade-up">
                <LessonHeader title={lesson.title} category="Aula • Masterclass" />

                <div className="glass-panel p-6 md:p-10 border border-white/10 shadow-2xl shadow-emerald-500/10 rounded-xl animate-fade-up animation-delay-200">
                    <MarkdownRenderer content={lesson.body} />
                </div>

                <ContentFooter
                    shareTitle={lesson.title}
                    shareUrl={lessonUrl}
                    backLinkHref="/aulas"
                    backLinkText="Voltar para Aulas"
                />
            </article>
        </main>
    );
}
