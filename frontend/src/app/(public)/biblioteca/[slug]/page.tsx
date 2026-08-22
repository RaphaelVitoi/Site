'use client';

/**
 * IDENTITY: Página de Artigo Dinâmica (SOTA Content)
 * PATH: src/app/biblioteca/[slug]/page.tsx
 * ROLE: Renderizar artigos do banco Prisma usando MDX/Markdown.
 */

import { useParams } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';
import { SotaMarkdown } from '@/components/ui/layout/SotaMarkdown';
import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import { EditorialEvidencePanel } from '@/components/ui/layout/EditorialEvidencePanel';
import ScrollToTop from '@/components/ui/layout/ScrollToTop';
import ContentFooter from '@/components/ui/layout/ContentFooter';
import TableOfContents from '@/components/ui/layout/TableOfContents';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { SITE_CONFIG } from '@/constants/site';
import { ROUTES } from '@/constants/routes';
import { getEditorialManifestEntry } from '@/content/editorialManifest';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DynamicArticlePage() {
	const { slug: rawSlug } = useParams<{ slug: string | string[] }>();
	const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
	const { data: content, error, isLoading } = useSWR(`/api/v1/content/${slug}`, fetcher);
	const editorial = content?.editorial ?? getEditorialManifestEntry(slug ?? 'unknown');

	if (isLoading)
		return (
			<div className="min-h-screen flex items-center justify-center bg-bg-base text-text-darker uppercase tracking-[0.3em] font-black animate-pulse">
				Sincronizando Mente Coletiva...
			</div>
		);

	if (error || !content || content.error)
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-bg-base text-accent-danger gap-6">
				<i className="fa-solid fa-triangle-exclamation text-5xl" />
				<h1 className="text-2xl font-black uppercase tracking-widest">
					Artefato Não Encontrado
				</h1>
				<p className="text-text-dim font-medium uppercase tracking-tighter">
					O slug &quot;{slug}&quot; não existe na base de dados SOTA.
				</p>
				<Link
					href="/biblioteca"
					className="btn-secondary px-8 py-3 rounded-xl uppercase font-black text-xs tracking-widest mt-4"
				>
					Voltar à Biblioteca
				</Link>
			</div>
		);

	return (
		<div className="min-h-screen bg-bg-base relative overflow-x-hidden font-body">
			<ScrollToTop />

			<ContentPageHeader
				title={content.title}
				subtitle={content.description || ''}
				category={content.category || 'Ensaio'}
				icon="fa-book-open"
			/>

			<main className="sota-container py-12 md:py-24 relative z-10">
				<div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-16 items-start max-w-6xl mx-auto">
					<article className="animate-sota-in">
						<GlassPanel className="p-10 lg:p-20 border-l-4 border-l-accent-indigo">
							<SotaMarkdown content={content.body || ''} />
						</GlassPanel>
					</article>

					<aside className="hidden lg:block sticky top-32 space-y-12 animate-sota-in animation-delay-300">
						<div className="glass-panel p-8 rounded-3xl border-white/5 bg-black/40">
							<h4 className="text-[0.6rem] font-black text-text-muted uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-4">
								Neste Artefato
							</h4>
							<TableOfContents content={content.body || ''} />
						</div>

						<EditorialEvidencePanel entry={editorial} />
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
