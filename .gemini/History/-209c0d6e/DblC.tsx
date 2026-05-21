import ContentFooter from '@/components/content/ContentFooter';
import fs from 'fs';
import { notFound } from 'next/navigation';
import path from 'path';

export async function generateMetadata ( { params }: { params: Promise<{ slug: string }> } ) {
  const { slug } = await params;
  return { title: `${slug.replace( /-/g, ' ' ).toUpperCase()} | Raphael Vitoi` };
}

export default async function ArticlePage ( { params }: { params: Promise<{ slug: string }> } ) {
  const { slug } = await params;
  const filePath = path.join( process.cwd(), 'content/artigos', `${slug}.md` );

  if ( !fs.existsSync( filePath ) )
  {
    notFound();
  }

  const content = fs.readFileSync( filePath, 'utf-8' );

  // Extração cirúrgica do título a partir do H1 principal do Markdown (# Título)
  const titleMatch = content.match( /^#\s+(.*)/m );
  const title = titleMatch ? titleMatch[ 1 ] : 'Artigo Clínico';

  // Purga o H1 do corpo textual para evitar duplicação na renderização
  const cleanContent = content.replace( /^#\s+.*$/m, '' ).trim();

  return (
    <div style={ { minHeight: '100vh', background: '#020617', color: '#e2e8f0' } }>
      <div style={ { maxWidth: '800px', margin: '0 auto', padding: '4rem 1.5rem' } }>
        <h1 className="text-3xl md:text-5xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400" style={ { letterSpacing: '-0.03em' } }>
          { title }
        </h1>

        <div className="glass-panel p-8 sm:p-12 border border-white/10 shadow-2xl shadow-fuchsia-500/10 rounded-2xl">
          <div className="prose prose-invert prose-fuchsia max-w-none text-slate-300 whitespace-pre-wrap font-sans">
            { cleanContent }
          </div>
        </div>

        <div className="mt-12">
          <ContentFooter
            shareTitle={ title }
            shareUrl={ `https://www.pokerracional.com/artigos/${slug}` }
            backLinkHref="/artigos/psicologia-hs"
            backLinkText="Voltar para Psicologia High Stakes"
          />
        </div>
      </div>
    </div>
  );
}
