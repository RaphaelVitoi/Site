import type { MetadataRoute } from 'next';
import { ROUTES } from '@/constants/routes';
import { SITE_CONFIG } from '@/constants/site';

export default function sitemap(): MetadataRoute.Sitemap {
	const base = SITE_CONFIG.baseUrl;
	const now = new Date();

	// Mapeia todas as rotas estáticas da biblioteca para o sitemap
	const libraryRoutes = Object.values(ROUTES.LIBRARY).map((route) => ({
		url: `${base}${route}`,
		lastModified: now,
		changeFrequency: 'monthly' as const,
		priority: 0.8,
	}));

	// Mapeia aulas
	const classesRoutes = Object.values(ROUTES.AULAS).map((route) => ({
		url: `${base}${route}`,
		lastModified: now,
		changeFrequency: 'monthly' as const,
		priority: 0.9,
	}));

	return [
		{ url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
		{
			url: `${base}${ROUTES.QUEM_SOU}`,
			lastModified: now,
			changeFrequency: 'monthly',
			priority: 0.7,
		},
		{
			url: `${base}${ROUTES.BIBLIOTECA}`,
			lastModified: now,
			changeFrequency: 'weekly',
			priority: 0.8,
		},
		{
			url: `${base}${ROUTES.SIMULADOR}`,
			lastModified: now,
			changeFrequency: 'weekly',
			priority: 0.9,
		},
		{
			url: `${base}${ROUTES.DASHBOARD}`,
			lastModified: now,
			changeFrequency: 'weekly',
			priority: 0.8,
		},
		...libraryRoutes,
		...classesRoutes,
	];
}
