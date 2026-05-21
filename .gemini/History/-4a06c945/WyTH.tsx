import { cache } from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';
import MarkdownRenderer from '@/components/content/MarkdownRenderer';
import LessonHeader from '@/components/content/LessonHeader';
import ContentFooter from '@/components/content/ContentFooter';

export const dynamic = 'force-dynamic';

interface LessonPageProps {
    readonly params: Promise<{
        slug: string;
    }>;
}

// Using React's `cache` to deduplicate database queries within a single request.
// Using React's `cache` to deduplicate file system reads within a single request.
const getLesson = cache(async (slug: string) => {
    return prisma.content.findFirst({
        where: {
            slug,
            category: 'aulas',
            isPublished: true,
        },
    });
    try {
        // Define o caminho onde os arquivos .md estao armazenados.
        // Exemplo: /frontend/src/content/aulas/slug-da-aula.md
        const filePath = path.join(process.cwd(), 'src', 'content', 'aulas', `${slug}.md`);
        const fileContents = await fs.readFile(filePath, 'utf8');

        // Extrai o primeiro heading H1 (# Titulo) para usar no Header e nos Metadados
        const titleMatch = fileContents.match(/^#\s+(.*)/m);
        const title = titleMatch ? titleMatch[1].trim() : 'Aula sem título';

        // Remove o H1 do corpo do texto para evitar duplicação com o LessonHeader
        const body = fileContents.replace(/^#\s+.*\n?/, '').trim();

        return { title, body };
    } catch (error) {
        // Retorna nulo se o arquivo não for encontrado, engatilhando o notFound()
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
        // Standardized page structure for consistency with other sections like /biblioteca
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
