import { ROUTES } from '@/constants/routes';

/**
 * Catálogo interno do acervo ainda não publicado.
 *
 * Uma relação de rota é apenas uma ligação conceitual com material já público.
 * Ela nunca autoriza renderizar, importar ou promover a fonte ao catálogo.
 */
export type EditorialPublicationStatus = 'source' | 'review' | 'ready' | 'published';
export type EditorialVisibility = 'internal' | 'public';
export type EditorialClaimBoundary =
	| 'authorial-framework'
	| 'authorial-hypothesis'
	| 'calibration-claim'
	| 'commercial-copy'
	| 'implementation-specification'
	| 'interactive-prototype';
export type PublicRouteRelation = 'conceptual' | 'none';

type PublicRoute =
	| (typeof ROUTES.LIBRARY)[keyof typeof ROUTES.LIBRARY]
	| (typeof ROUTES.AULAS)[keyof typeof ROUTES.AULAS];

export interface EditorialContentEntry {
	id: string;
	title: string;
	sourcePath: `src/content/${string}`;
	publicationStatus: EditorialPublicationStatus;
	visibility: EditorialVisibility;
	claimBoundary: EditorialClaimBoundary;
	relatedPublicRoute: PublicRoute | null;
	relationToPublicRoute: PublicRouteRelation;
	publicationBlocker: string;
}

export const EDITORIAL_CONTENT_REGISTRY = [
	{
		id: 'carta-vendas-poker-racional',
		title: 'Carta de vendas — Poker Racional',
		sourcePath: 'src/content/artigos/carta-vendas-poker-racional.md',
		publicationStatus: 'source',
		visibility: 'internal',
		claimBoundary: 'commercial-copy',
		relatedPublicRoute: null,
		relationToPublicRoute: 'none',
		publicationBlocker:
			'Revisão de alegações comerciais, fontes quantitativas e adequação ao posicionamento atual.',
	},
	{
		id: 'teoria-perspectiva-matematica-vitoi',
		title: 'Teoria da Perspectiva Matemática — Vitoi',
		sourcePath: 'src/content/artigos/TEORIA_PERSPECTIVA_MATEMATICA_VITOI.md',
		publicationStatus: 'review',
		visibility: 'internal',
		claimBoundary: 'authorial-framework',
		relatedPublicRoute: ROUTES.LIBRARY.TEORIA_PERSPECTIVA,
		relationToPublicRoute: 'conceptual',
		publicationBlocker:
			'Curadoria de referências e rotulagem explícita entre proposta autoral, evidência de código e validação independente.',
	},
	{
		id: 'icm-toy-game-simulator-html',
		title: 'Protótipo HTML — ICM Toy Game Simulator',
		sourcePath: 'src/content/interativo/icm_toy_game_simulator.html',
		publicationStatus: 'source',
		visibility: 'internal',
		claimBoundary: 'interactive-prototype',
		relatedPublicRoute: ROUTES.LIBRARY.TOY_GAMES,
		relationToPublicRoute: 'conceptual',
		publicationBlocker:
			'Migração para componente atual, validação de entradas e revisão de dependências antes de qualquer execução pública.',
	},
	{
		id: 'prd-icm-toy',
		title: 'PRD — Calculadora de Perspectiva Matemática ICM Toy',
		sourcePath: 'src/content/interativo/PRD_icm_toy.md',
		publicationStatus: 'review',
		visibility: 'internal',
		claimBoundary: 'implementation-specification',
		relatedPublicRoute: ROUTES.LIBRARY.TOY_GAMES,
		relationToPublicRoute: 'conceptual',
		publicationBlocker:
			'Reconciliação implementada no documento; faltam formulário tipado, conservação de stack e cenário reprodutível antes de ready.',
	},
	{
		id: 'cenarios-toy-game',
		title: 'Cenários de Toy Game',
		sourcePath: 'src/content/interativo/scenarios_toygame.js',
		publicationStatus: 'source',
		visibility: 'internal',
		claimBoundary: 'interactive-prototype',
		relatedPublicRoute: ROUTES.LIBRARY.TOY_GAMES,
		relationToPublicRoute: 'conceptual',
		publicationBlocker:
			'Normalização para dados tipados, com proveniência de cenários e fronteira clara entre exemplo didático e resultado de solver.',
	},
	{
		id: 'spec-icm-toy',
		title: 'SPEC — Calculadora de Perspectiva Matemática ICM Toy',
		sourcePath: 'src/content/interativo/SPEC_icm_toy.md',
		publicationStatus: 'review',
		visibility: 'internal',
		claimBoundary: 'implementation-specification',
		relatedPublicRoute: ROUTES.LIBRARY.TOY_GAMES,
		relationToPublicRoute: 'conceptual',
		publicationBlocker:
			'Contrato de unidades e limites revisado; faltam implementação tipada e validação externa dos parâmetros de modelo antes de ready.',
	},
	{
		id: 'toy-games-page-legacy',
		title: 'Componente legado — Toy Games',
		sourcePath: 'src/content/interativo/toy_games_page.tsx',
		publicationStatus: 'source',
		visibility: 'internal',
		claimBoundary: 'interactive-prototype',
		relatedPublicRoute: ROUTES.LIBRARY.TOY_GAMES,
		relationToPublicRoute: 'conceptual',
		publicationBlocker:
			'Comparação componente a componente com a rota atual antes de reutilização seletiva ou aposentadoria documentada.',
	},
	{
		id: 'calibration-nodes-aula-1-2',
		title: 'Calibração de nós — Aula 1.2',
		sourcePath: 'src/content/research-raw/calibration-nodes-aula-1-2.md',
		publicationStatus: 'review',
		visibility: 'internal',
		claimBoundary: 'calibration-claim',
		relatedPublicRoute: ROUTES.AULAS.POS_FLOP,
		relationToPublicRoute: 'conceptual',
		publicationBlocker:
			'Reprodução dos nós, versões de solver, parâmetros de payout e método comparativo antes de qualquer alegação de calibração.',
	},
	{
		id: 'hierarquia-decisao',
		title: 'Hierarquia da Decisão',
		sourcePath: 'src/content/research-raw/hierarquia-decisao.md',
		publicationStatus: 'source',
		visibility: 'internal',
		claimBoundary: 'authorial-hypothesis',
		relatedPublicRoute: ROUTES.LIBRARY.HIERARQUIA_DECISAO,
		relationToPublicRoute: 'conceptual',
		publicationBlocker:
			'Revisão de definições, exemplos e separação entre proposição didática e resultado empiricamente validado.',
	},
	{
		id: 'pt1-ev-fold-fgs',
		title: 'EV do Fold e Future Game Simulation',
		sourcePath: 'src/content/research-raw/pt1-ev-fold-fgs.md',
		publicationStatus: 'review',
		visibility: 'internal',
		claimBoundary: 'authorial-hypothesis',
		relatedPublicRoute: ROUTES.LIBRARY.EV_FOLD_DINAMICO,
		relationToPublicRoute: 'conceptual',
		publicationBlocker:
			'Premissas variáveis foram delimitadas; faltam exemplos com ante model, posição e validação reproduzível antes de ready.',
	},
	{
		id: 'pt2-pot-odds-edge',
		title: 'Insolvência das Pot Odds e Colapso da Edge',
		sourcePath: 'src/content/research-raw/pt2-pot-odds-edge.md',
		publicationStatus: 'review',
		visibility: 'internal',
		claimBoundary: 'authorial-hypothesis',
		relatedPublicRoute: ROUTES.LIBRARY.INSOLVENCIA_POT_ODDS,
		relationToPublicRoute: 'conceptual',
		publicationBlocker:
			'Condições de contorno foram delimitadas; faltam exemplos reproduzíveis e referências antes da publicação.',
	},
	{
		id: 'estruturas-de-torneio-raw',
		title: 'Estruturas de Torneio',
		sourcePath: 'src/content/research-raw/tournament-structures.md',
		publicationStatus: 'review',
		visibility: 'internal',
		claimBoundary: 'authorial-hypothesis',
		relatedPublicRoute: ROUTES.LIBRARY.ESTRUTURAS_TORNEIO,
		relationToPublicRoute: 'conceptual',
		publicationBlocker:
			'Taxonomia reclassificada como didática; faltam fonte, período e universo amostral para qualquer alegação sobre salas reais.',
	},
	{
		id: 'toy-games-theory-html',
		title: 'Exportação HTML — Strategic Toy Games & RP Asymmetry',
		sourcePath: 'src/content/research-raw/toy-games-theory.html',
		publicationStatus: 'source',
		visibility: 'internal',
		claimBoundary: 'authorial-hypothesis',
		relatedPublicRoute: ROUTES.LIBRARY.TOY_GAMES,
		relationToPublicRoute: 'conceptual',
		publicationBlocker:
			'Consolidação com a fonte Markdown, revisão da direção de RP e remoção de marcas de exportação antes de qualquer uso.',
	},
	{
		id: 'toy-games-theory-markdown',
		title: 'Strategic Toy Games & RP Asymmetry',
		sourcePath: 'src/content/research-raw/toy-games-theory.md',
		publicationStatus: 'review',
		visibility: 'internal',
		claimBoundary: 'authorial-hypothesis',
		relatedPublicRoute: ROUTES.LIBRARY.TOY_GAMES,
		relationToPublicRoute: 'conceptual',
		publicationBlocker:
			'Revisão da direção de Risk Advantage, das unidades em p.p. e da fronteira entre toy game e inferência geral.',
	},
	{
		id: 'vitoi-perspective-paradigm-raw',
		title: 'Paradigma da Perspectiva Matemática — rascunho',
		sourcePath: 'src/content/research-raw/vitoi-perspective-paradigm.md',
		publicationStatus: 'review',
		visibility: 'internal',
		claimBoundary: 'authorial-framework',
		relatedPublicRoute: ROUTES.LIBRARY.TEORIA_PERSPECTIVA,
		relationToPublicRoute: 'conceptual',
		publicationBlocker:
			'Consolidação com a versão teórica principal e rotulagem de hipóteses, parâmetros e validações ainda pendentes.',
	},
] as const satisfies readonly EditorialContentEntry[];

export function getEditorialItemsForRoute(route: PublicRoute): readonly EditorialContentEntry[] {
	return EDITORIAL_CONTENT_REGISTRY.filter((item) => item.relatedPublicRoute === route);
}
