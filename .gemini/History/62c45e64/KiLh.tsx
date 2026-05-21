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

  return (
    <main className="container max-w-3xl mx-auto px-4" style={{ padding: '4rem 0' }}>
      <Link href="/psicologia-hs" className="inline-flex items-center text-xs font-bold tracking-widest text-slate-400 hover:text-fuchsia-400 uppercase transition-colors mb-8 group">
        <span className="mr-2 group-hover:-translate-x-1 transition-transform">&larr;</span> Voltar para Laboratório
      </Link>

      <article className="animate-fade-up">
        <header className="mb-10 border-b border-white/5 pb-8">
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4 leading-tight">{post.title}</h1>
        </header>
        <div className="sales-article mt-8" dangerouslySetInnerHTML={{ __html: post.content || post.body || '<p>A entropia corrompeu este registro. Conteúdo em formatação...</p>' }} />
      </article>
    </main>
  );
}