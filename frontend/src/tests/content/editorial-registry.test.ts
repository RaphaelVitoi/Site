import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
	EDITORIAL_CONTENT_REGISTRY,
	getEditorialItemsForRoute,
} from '@/content/editorialRegistry';
import { ROUTES } from '@/constants/routes';

const FRONTEND_ROOT = resolve(__dirname, '../../..');

describe('Registro editorial do acervo', () => {
	it('mantém cada fonte catalogada como interna até uma decisão explícita de publicação', () => {
		expect(EDITORIAL_CONTENT_REGISTRY).toHaveLength(15);

		for (const item of EDITORIAL_CONTENT_REGISTRY) {
			expect(item.visibility).toBe('internal');
			expect(['source', 'review']).toContain(item.publicationStatus);
			expect(item.sourcePath).toMatch(/^src\/content\//);
			expect(item.publicationBlocker).not.toHaveLength(0);
		}
	});

	it('marca como review apenas os núcleos submetidos à curadoria verificável', () => {
		const reviewedIds = EDITORIAL_CONTENT_REGISTRY.filter(
			(item) => item.publicationStatus === 'review',
		).map((item) => item.id);

		expect(reviewedIds).toEqual([
			'teoria-perspectiva-matematica-vitoi',
			'prd-icm-toy',
			'spec-icm-toy',
			'calibration-nodes-aula-1-2',
			'pt1-ev-fold-fgs',
			'pt2-pot-odds-edge',
			'estruturas-de-torneio-raw',
			'toy-games-theory-markdown',
			'vitoi-perspective-paradigm-raw',
		]);
	});

	it('mantém caminhos únicos e aponta somente para fontes que existem no checkout', () => {
		const paths = EDITORIAL_CONTENT_REGISTRY.map((item) => item.sourcePath);
		expect(new Set(paths).size).toBe(paths.length);

		for (const sourcePath of paths) {
			expect(existsSync(resolve(FRONTEND_ROOT, sourcePath))).toBe(true);
		}
	});

	it('distingue rota conceitualmente relacionada de publicação automática', () => {
		const toyGameSources = getEditorialItemsForRoute(ROUTES.LIBRARY.TOY_GAMES);

		expect(toyGameSources.map((item) => item.sourcePath)).toEqual(
		expect.arrayContaining([
			'src/content/interativo/icm_toy_game_simulator.html',
			'src/content/interativo/toy_games_page.tsx',
			'src/content/research-raw/toy-games-theory.md',
		]),
		);
		expect(toyGameSources.every((item) => item.visibility === 'internal')).toBe(true);
	});
});
