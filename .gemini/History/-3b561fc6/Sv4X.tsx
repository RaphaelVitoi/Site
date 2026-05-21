/**
 * IDENTITY: Rota de Leitura do Protocolo (Artigo Individual)
 * PATH: src/app/psicologia-hs/[slug]/page.tsx
 * ROLE: Renderizar o conteúdo profundo dos artigos com alta legibilidade e imersão.
 * BINDING: [src/lib/prisma.ts, globals.css (Classe sales-article)]
 * TELEOLOGY: Atuar como o portal de transferência epistêmica do ecossistema, preparado para renderizar Markdown/HTML rico do banco de dados no futuro.
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ArticleHeader from '@/components/content/ArticleHeader';
import ContentFooter from '@/components/content/ContentFooter';

// Mock defensivo para evitar que o Front-end quebre caso o banco Prisma não possua estes slugs ainda
const fallbackPosts: Record<string, any> = {
  'a-ameaca-organica': {
    title: 'A Ameaça Orgânica no River',
    content: '<p>A sobrecarga de <strong>Risk Premium</strong> em retas finais afeta diretamente a amígdala cerebral, induzindo o jogador a cometer blefes irracionais sob a perspectiva da neurociência. Quando o solver recomenda uma frequência mista de bluff, ele pressupõe uma máquina sem variação de batimento cardíaco.</p><p>Aqui, o código binário falha. A intuição treinada deve atuar como um firewall emocional. A sobrevivência requer entender que a matemática isolada, sem o controle do <em>excesso de gozo</em> lacaniano, leva à autodestruição do seu EV a longo prazo.</p>',
    readTime: '08 MIN',
    date: '14 Mar 2026',
    tags: ['Mindset', 'Neurobiologia']
  },
  'paradoxo-do-valuation': {
    title: 'O Paradoxo do Valuation no ICM',
    content: '<p>Por que acumular fichas pode diminuir sua esperança matemática quando as dinâmicas de poder na mesa final são ignoradas.</p><p>O modelo de Malmuth-Harville nos ensina que o valor da ficha que você perde é sempre maior do que a ficha que você ganha. Isso inverte completamente o instinto primário de caça do jogador de cash game...</p>',
    readTime: '12 MIN',
    date: '12 Mar 2026',
    tags: ['Teoria', 'ICM']
  }
};

// SOTA Next.js 15: params agora sao Promises (Assincronas por padrao)
type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  let post = null;
  try {
    post = await prisma.post.findUnique({ where: { slug } });
  } catch (e) {
    post = fallbackPosts[slug];
  }

  if (!post) return { title: 'Protocolo Não Encontrado | Raphael Vitoi' };

  return {
    title: `${post.title} | Psicologia HS`,
    description: post.excerpt || `Leitura do protocolo: ${post.title}`,
  };
}

export default async function PostSlugPage({ params }: PageProps) {
  const { slug } = await params;
  let post = null;

  try {
    post = await prisma.post.findUnique({ where: { slug } });
  } catch (e) {
    post = fallbackPosts[slug];
  }

  if (!post) notFound();

  const articleUrl = `https://www.pokerracional.com/artigos/psicologia-hs/${slug}`;

  return (
    <main className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <article className="animate-fade-up">
        <ArticleHeader
          title={post.title}
          subtitle={post.excerpt}
          author={post.author || "Raphael Vitoi"}
          publishDate={post.date || ''}
          readTime={post.readTime || ''}
        />

        <div className="glass-panel p-6 md:p-10 border border-white/10 shadow-2xl shadow-fuchsia-500/10 rounded-xl animate-fade-up animation-delay-200">
          <div className="sales-article prose prose-invert max-w-none prose-fuchsia" dangerouslySetInnerHTML={{ __html: post.content || post.body || '<p>A entropia corrompeu este registro. Conteúdo em formatação...</p>' }} />
        </div>

        <ContentFooter
          shareTitle={`${post.title} | Psicologia HS`}
          shareUrl={articleUrl}
          backLinkHref="/artigos/psicologia-hs"
          backLinkText="Voltar para o Laboratório Clínico"
        />
      </article>
    </main>
  );
}