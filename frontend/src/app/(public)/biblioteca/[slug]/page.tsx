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
import ScrollToTop from '@/components/ui/layout/ScrollToTop';
import ContentFooter from '@/components/ui/layout/ContentFooter';
import TableOfContents from '@/components/ui/layout/TableOfContents';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { SITE_CONFIG } from '@/constants/site';
import { ROUTES } from '@/constants/routes';

type ContentFetchError = Error & { status?: number };

const fetcher = async (url: string) => {
	const response = await fetch(url);
	if (!response.ok) {
		const error = new Error(
			`Falha ao consultar o catálogo dinâmico (${response.status}).`,
		) as ContentFetchError;
		error.status = response.status;
		throw error;
	}

	return response.json();
};

export default function DynamicArticlePage() {
	const { slug } = useParams();
	const { data: content, error, isLoading } = useSWR(`/api/v1/content/${slug}`, fetcher);

	if (isLoading)
		return (
			<div className="min-h-screen flex items-center justify-center bg-bg-base text-text-darker uppercase tracking-[0.3em] font-black animate-pulse">
				Sincronizando Mente Coletiva...
			</div>
		);

	if (error || !content || content.error) {
		const status = (error as ContentFetchError | undefined)?.status;
		const catalogState =
			status === 401 || status === 403
				? {
						title: 'Catálogo Protegido',
						message:
							'O catálogo dinâmico exige uma sessão autorizada. A publicação pública deste conteúdo ainda não está habilitada.',
					}
				: status === 404
					? {
							title: 'Artefato Não Publicado',
							message: `O slug "${slug}" ainda não foi publicado no catálogo dinâmico.`,
						}
					: {
							title: 'Catálogo Indisponível',
							message:
								'Não foi possível consultar o catálogo dinâmico neste momento. Tente novamente mais tarde.',
						};

		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-bg-base text-accent-danger gap-6">
				<i className="fa-solid fa-triangle-exclamation text-5xl" />
				<h1 className="text-2xl font-black uppercase tracking-widest">
					{catalogState.title}
				</h1>
				<p className="text-text-dim font-medium uppercase tracking-tighter">
					{catalogState.message}
				</p>
				<Link
					href="/biblioteca"
					className="btn-secondary px-8 py-3 rounded-xl uppercase font-black text-xs tracking-widest mt-4"
				>
					Voltar à Biblioteca
				</Link>
			</div>
		);
	}

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
							<h2 className="text-[0.6rem] font-black text-text-muted uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-4">
								Neste Artefato
							</h2>
							<TableOfContents content={content.body || ''} />
						</div>

						<div className="p-8 bg-accent-indigo/5 border border-accent-indigo/10 rounded-3xl">
							<h2 className="text-[0.6rem] font-black text-white uppercase tracking-widest mb-4 text-glow-indigo">
								Metadados SOTA
							</h2>
							<div className="space-y-4">
								<div className="flex justify-between items-center">
									<span className="text-[0.55rem] text-text-dim uppercase font-bold">
										Status
									</span>
									<span className="text-[0.55rem] text-accent-indigo-light uppercase font-black tracking-widest bg-accent-indigo/10 px-2 py-0.5 rounded border border-accent-indigo/20">
										Conteúdo dinâmico
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-[0.55rem] text-text-dim uppercase font-bold">
										Canal
									</span>
									<span className="text-[0.55rem] text-text-bright uppercase font-mono font-black">
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
