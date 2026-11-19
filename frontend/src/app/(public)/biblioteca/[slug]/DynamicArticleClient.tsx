'use client';

/**
 * IDENTITY: Componente Cliente de Artigo Dinâmico (SOTA Content Island)
 * PATH: src/app/(public)/biblioteca/[slug]/DynamicArticleClient.tsx
 * ROLE: Renderizar artigos dinâmicos consumindo SWR com fallbackData hidratada do servidor.
 */

import { useParams } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';
import { SotaMarkdown } from '@/components/ui/layout/SotaMarkdown';
import { ArticleVoiceNarration } from '@/components/ui/layout/ArticleVoiceNarration';
import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import ScrollToTop from '@/components/ui/layout/ScrollToTop';
import ContentFooter from '@/components/ui/layout/ContentFooter';
import TableOfContents from '@/components/ui/layout/TableOfContents';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { SITE_CONFIG } from '@/constants/site';
import { ROUTES } from '@/constants/routes';
import { fetchJson } from '@/lib/client-fetch';

export interface DynamicArticlePayload {
  id?: string;
  slug?: string;
  title: string;
  description?: string;
  category?: string;
  body: string;
  createdAt?: string;
  updatedAt?: string;
  error?: string;
}

type ContentFetchError = Error & { status?: number };

function getCatalogState(status: number | undefined, slug: string | string[] | undefined) {
  if (status === 401 || status === 403) {
    return {
      title: 'Catálogo Protegido',
      message:
        'O catálogo dinâmico exige uma sessão autorizada. A publicação pública deste conteúdo ainda não está habilitada.',
    };
  }

  if (status === 404) {
    return {
      title: 'Artefato Não Publicado',
      message: `O slug "${slug}" ainda não foi publicado no catálogo dinâmico.`,
    };
  }

  return {
    title: 'Catálogo Indisponível',
    message: 'Não foi possível consultar o catálogo dinâmico neste momento. Tente novamente mais tarde.',
  };
}

const fetcher = async (url: string): Promise<DynamicArticlePayload> =>
  fetchJson<DynamicArticlePayload>(url, {
    timeoutMs: 12_000,
    fallbackError: 'Falha ao consultar o catálogo dinâmico.',
  });

export interface DynamicArticleClientProps {
  readonly initialSlug?: string;
  readonly initialContent?: DynamicArticlePayload | null;
}

function DynamicArticleClient({ initialSlug, initialContent }: DynamicArticleClientProps) {
  const params = useParams();
  const slug = initialSlug || (Array.isArray(params['slug']) ? params['slug'].join('/') : String(params['slug'] ?? ''));
  // O slug chega DECODIFICADO: `%2F` vira `/` e `..` atravessaria para outra rota de mesma origem.
  // Encode antes de interpolar no caminho da API (FE-11).
  const {
    data: content,
    error,
    isLoading,
  } = useSWR(
    `/api/v1/content/${encodeURIComponent(slug)}`,
    fetcher,
    initialContent ? { fallbackData: initialContent } : undefined,
  );

  if (isLoading && !initialContent)
    return (
      <div className="bg-bg-base text-text-darker flex min-h-screen animate-pulse items-center justify-center font-black tracking-[0.3em] uppercase">
        Sincronizando Mente Coletiva...
      </div>
    );

  if (error || !content || content.error) {
    const status = (error as ContentFetchError | undefined)?.status;
    const catalogState = getCatalogState(status, slug);

    return (
      <div className="bg-bg-base text-accent-danger flex min-h-screen flex-col items-center justify-center gap-6">
        <i className="fa-solid fa-triangle-exclamation text-5xl" />
        <h1 className="text-2xl font-black tracking-widest uppercase">{catalogState.title}</h1>
        <p className="text-text-dim font-medium tracking-tighter uppercase">{catalogState.message}</p>
        <Link
          href="/biblioteca"
          className="btn-secondary mt-4 rounded-xl px-8 py-3 text-xs font-black tracking-widest uppercase"
        >
          Voltar à Biblioteca
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-bg-base font-body relative min-h-screen overflow-x-hidden">
      <ScrollToTop />

      <ContentPageHeader
        title={content.title}
        subtitle={content.description || ''}
        category={content.category || 'Ensaio'}
        icon="fa-book-open"
      />

      <main className="sota-container relative z-10 py-12 md:py-24">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-16 lg:grid-cols-[1fr_300px]">
          <article className="animate-sota-in">
            <GlassPanel className="border-l-accent-indigo border-l-4 p-10 lg:p-20">
              <ArticleVoiceNarration title={content.title} content={content.body || ''} />
              <SotaMarkdown content={content.body || ''} />
            </GlassPanel>
          </article>

          <aside className="animate-sota-in animation-delay-300 sticky top-32 hidden space-y-12 lg:block">
            <div className="glass-panel rounded-3xl border-white/5 bg-black/40 p-8">
              <h2 className="text-text-muted mb-6 border-b border-white/5 pb-4 text-[0.6rem] font-black tracking-[0.2em] uppercase">
                Neste Artefato
              </h2>
              <TableOfContents content={content.body || ''} />
            </div>

            <div className="bg-accent-indigo/5 border-accent-indigo/10 rounded-3xl border p-8">
              <h2 className="text-glow-indigo mb-4 text-[0.6rem] font-black tracking-widest text-white uppercase">
                Metadados SOTA
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-dim text-[0.55rem] font-bold uppercase">Status</span>
                  <span className="text-accent-indigo-light bg-accent-indigo/10 border-accent-indigo/20 rounded border px-2 py-0.5 text-[0.55rem] font-black tracking-widest uppercase">
                    Conteúdo dinâmico
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-dim text-[0.55rem] font-bold uppercase">Canal</span>
                  <span className="text-text-bright font-mono text-[0.55rem] font-black uppercase">
                    Contrato API v1
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <ContentFooter
        shareTitle={`${content.title} | ${SITE_CONFIG.author}`}
        shareUrl={`${SITE_CONFIG.baseUrl}/biblioteca/${slug}`}
        backLinkHref={ROUTES.BIBLIOTECA}
        backLinkText="Voltar à Biblioteca"
      />
    </div>
  );
}

export default DynamicArticleClient;
