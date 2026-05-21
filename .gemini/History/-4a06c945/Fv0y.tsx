import ContentFooter from '@/components/content/ContentFooter';
import LessonHeader from '@/components/content/LessonHeader';
import MarkdownRenderer from '@/components/content/MarkdownRenderer';
import TableOfContents from '@/components/content/TableOfContents';
import prisma from '@/lib/prisma';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

interface LessonPageProps {
    readonly params: Promise<{
        slug: string;
    }>;
}

// Busca o conteúdo diretamente do banco Prisma
const getLesson = cache( async ( slug: string ) => {
    try
    {
        // @ts-expect-error O Prisma Schema (Modelo Lesson) ainda não foi desenhado/migrado pelo @architect.
        const lessonRecord = await prisma.lesson.findUnique( {
            where: { slug }
        } );

        if ( !lessonRecord ) return null;

        let body = lessonRecord.body || '';

        // Extrai headers (H2 e H3) para a Tabela de Conteúdo
        const toc: { level: number, text: string, slug: string }[] = [];
        const tocRegex = /^(##|###)\s+(.+)$/gm;
        let tocMatch;
        while ( ( tocMatch = tocRegex.exec( body ) ) !== null )
        {
            const level = tocMatch[ 1 ].length;
            const text = tocMatch[ 2 ].trim();

            // Cria um slug idêntico ao gerado pelo plugin rehype-slug
            const headerSlug = text.toLowerCase()
                .normalize( "NFD" ).replaceAll( /[\u0300-\u036f]/g, "" ) // Remove acentos
                .replaceAll( /[^\w\s-]/g, '' ) // Remove pontuações
                .replaceAll( /[\s_-]+/g, '-' ) // Transforma espaços em hifens
                .replaceAll( /^-+|-+$/g, '' ); // Limpa hifens sobrando

            toc.push( { level, text, slug: headerSlug } );
        }

        return {
            title: lessonRecord.title,
            description: lessonRecord.description || '',
            category: lessonRecord.category || 'Aula',
            keywords: '', // Pode vir do banco no futuro se adicionarmos tags
            author: lessonRecord.authorId || 'Raphael Vitoi',
            date: lessonRecord.createdAt.toISOString(),
            body,
            toc
        };
    } catch ( e )
    {
        console.error( "[PRISMA CRITICAL] Erro de I/O na busca da aula:", e );
        throw e;
    }
} );

export async function generateMetadata ( { params }: LessonPageProps ): Promise<Metadata> {
    const { slug } = await params;
    try
    {
        const lesson = await getLesson( slug );
        if ( !lesson ) return { title: 'Aula não encontrada | Raphael Vitoi' };
        return {
            title: `${lesson.title} | Raphael Vitoi`,
            description: lesson.description,
        };
    } catch ( error )
    {
        console.error( "[METADATA CRITICAL] Falha ao recuperar aula para SEO:", error );
        return { title: 'Erro de Sistema | Raphael Vitoi' };
    }
}

export default async function LessonPage ( { params }: LessonPageProps ) {
    const { slug } = await params;

    let lesson;
    try
    {
        lesson = await getLesson( slug );
    } catch ( e )
    {
        console.error( "[PAGE CRITICAL] Falha de infraestrutura na rota de Aula:", e );
        return <div className="min-h-screen flex items-center justify-center text-rose-500 font-mono bg-slate-950">Falha Crítica de Infraestrutura (Banco de Dados). Verifique os logs.</div>;
    }

    if ( !lesson ) notFound();

    const lessonUrl = `https://www.pokerracional.com/aulas/${slug}`;

    return (
        <main className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <article className="animate-fade-up">
                <LessonHeader
                    title={ lesson.title }
                    category={ lesson.category }
                    date={ lesson.date }
                    author={ lesson.author }
                />

                <div className="glass-panel p-6 md:p-10 border border-white/10 shadow-2xl shadow-emerald-500/10 rounded-xl animate-fade-up animation-delay-200">
                    { lesson.toc && lesson.toc.length > 0 && (
                        <TableOfContents toc={ lesson.toc } />
                    ) }

                    <div className="prose prose-invert prose-emerald max-w-none">
                        <MarkdownRenderer content={ lesson.body } />
                    </div>
                </div>

                <ContentFooter
                    shareTitle={ lesson.title }
                    shareUrl={ lessonUrl }
                    backLinkHref="/aulas"
                    backLinkText="Voltar para Aulas"
                />
            </article>
        </main>
    );
}
