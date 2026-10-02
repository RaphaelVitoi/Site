/**
 * IDENTITY: Página de Artigo Dinâmica (SOTA Content & RSC)
 * PATH: src/app/biblioteca/[slug]/page.tsx
 * ROLE: Server Component com geração de Metadata, OpenGraph e SSR imediato via Prisma/Cache.
 */

import DynamicArticleClient from './DynamicArticleClient';
import prisma from '@/lib/prisma';
import type { Metadata } from 'next';
import { cache } from 'react';
import { SITE_CONFIG } from '@/constants/site';

interface PageProps {
	readonly params: Promise<{
		slug: string;
	}>;
}

const getContent = cache(async (slug: string) => {
	try {
		const content = await prisma.content?.findFirst({
			where: {
				slug,
				isPublished: true,
			},
			select: {
				id: true,
				slug: true,
				title: true,
				category: true,
				description: true,
				body: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		if (!content) return null;

		return {
			...content,
			description: content.description ?? undefined,
			createdAt: content.createdAt.toISOString(),
			updatedAt: content.updatedAt.toISOString(),
		};
	} catch (error) {
		console.error('[BIBLIOTECA_RSC_ERROR]', error);
		return null;
	}
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const content = await getContent(slug);

	if (!content) {
		return {
			title: `Artigo não encontrado | ${SITE_CONFIG.name}`,
			description: 'O artefato solicitado não está disponível no catálogo dinâmico.',
		};
	}

	const fallbackDesc = 'Ensaio e análise analítica de poker de alta performance.';
	const description = content.description || fallbackDesc;

	return {
		title: `${content.title} | ${SITE_CONFIG.name}`,
		description,
		openGraph: {
			title: content.title,
			description,
			type: 'article',
			url: `${SITE_CONFIG.baseUrl}/biblioteca/${slug}`,
		},
		twitter: {
			card: 'summary_large_image',
			title: content.title,
			description,
		},
	};
}

export default async function DynamicArticlePage({ params }: PageProps) {
	const { slug } = await params;
	const initialContent = await getContent(slug);

	return <DynamicArticleClient initialSlug={slug} initialContent={initialContent} />;
}
