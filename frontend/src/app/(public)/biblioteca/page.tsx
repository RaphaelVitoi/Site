'use client';

/**
 * IDENTITY: Index da Biblioteca SOTA (O Arquivo Akashico v7.0 GOLD)
 * PATH: src/app/biblioteca/page.tsx
 * ROLE: Organizar e exibir todos os artigos teóricos, mecânicos e laboratórios interativos documentados.
 * DESIGN: Diagramação simétrica áurea, busca em tempo real com fricção zero e categorização dinâmica.
 */

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';

type ArticleItem = {
	title: string;
	slug: string;
	desc?: string;
	isLab?: boolean;
};

type LibraryCategory = {
	id: string;
	title: string;
	icon: string;
	colorClass: string;
	badgeClass: string;
	articles: ArticleItem[];
};

const LIBRARY_CATEGORIES: LibraryCategory[] = [
	{
		id: 'fundamentos',
		title: 'Fundamentos SOTA',
		icon: 'fa-book-journal-whills',
		colorClass: 'text-accent-indigo border-accent-indigo/30 shadow-[0_0_20px_rgba(99,102,241,0.15)]',
		badgeClass: 'bg-accent-indigo/15 text-accent-indigo-light border-accent-indigo/30',
		articles: [
			{ title: 'Manifesto SOTA: Axiomas', slug: 'manifesto-sota-axiomas', desc: 'Os pilares matemáticos da cosmovisão de Raphael Vitoi.' },
			{ title: 'Hierarquia da Decisão', slug: 'hierarquia-da-decisao', desc: 'Priorização lógica sob incerteza e árvores recursivas.' },
			{ title: 'Estado da Arte GOLD', slug: 'estado-da-arte', desc: 'A arquitetura epistemológica e técnica do ecossistema.' },
			{ title: 'Protocolo Smart Sniper', slug: 'smart-sniper', desc: 'Detecção cirúrgica de assimetrias e exploração máxima.' },
			{ title: 'Validação Smart Sniper', slug: 'validacao-smart-sniper', desc: 'Evidências empíricas e calibração de dados ao vivo.' },
		],
	},
	{
		id: 'mecanica',
		title: 'Mecânica & ICM',
		icon: 'fa-gears',
		colorClass: 'text-accent-emerald border-accent-emerald/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]',
		badgeClass: 'bg-accent-emerald/15 text-accent-emerald-light border-accent-emerald/30',
		articles: [
			{ title: 'Downward Drift & Compressão', slug: 'downward-drift-sota', desc: 'A transformação dimensional de sizings pós-flop.', isLab: true },
			{ title: 'Geometria do Risco', slug: 'geometria-do-risco', desc: 'Relação vetorial entre Risk Premium e Bubble Factor.' },
			{ title: 'Entendendo o ICM e Heurísticas', slug: 'entendendo-o-icm-e-suas-heuristicas', desc: 'Modelagem de stacks e equidade não-linear.' },
			{ title: 'Heurística ICM Pós-Flop', slug: 'heuristica-icm-pos-flop-aula', desc: 'A tomada de decisão além dos solvers pré-flop.' },
			{ title: 'Motor de Diluição', slug: 'motor-diluicao', desc: 'Diluição de equidade e preservação de torneio.' },
			{ title: 'Teto Equidade River ICM', slug: 'teto-equidade-river-icm', desc: 'Limites assintóticos de aposta na última street.' },
			{ title: 'Estruturas de Torneio', slug: 'estruturas-de-torneio', desc: 'Impacto dos payouts flat vs top-heavy.' },
		],
	},
	{
		id: 'valuation',
		title: 'Valuation & Risco',
		icon: 'fa-scale-unbalanced',
		colorClass: 'text-accent-amber border-accent-amber/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
		badgeClass: 'bg-accent-amber/15 text-accent-gold border-accent-amber/30',
		articles: [
			{ title: 'Paradoxo da Valuation', slug: 'paradoxo-valuation', desc: 'A divergência entre valor nominal e valor real em fichas.' },
			{ title: 'Axioma do EV Fold Dinâmico', slug: 'axioma-ev-fold-dinamico', desc: 'O custo de oportunidade de esperar por spots melhores.' },
			{ title: 'Insolvência das Pot Odds', slug: 'insolvencia-das-pot-odds', desc: 'Por que pot odds puras quebram jogadores em torneios.' },
			{ title: 'Risco de Ressurreição', slug: 'risco-de-ressurreicao', desc: 'Probabilidade de sobrevida do adversário dobrado.' },
		],
	},
	{
		id: 'psicologia',
		title: 'Psicologia Preditiva',
		icon: 'fa-brain',
		colorClass: 'text-accent-rose border-accent-rose/30 shadow-[0_0_20px_rgba(244,63,94,0.15)]',
		badgeClass: 'bg-accent-rose/15 text-accent-rose-light border-accent-rose/30',
		articles: [
			{ title: 'Fator Ψ (Maluquice Humana)', slug: 'fator-psi-maluquice-humana', desc: 'Modelagem estocástica do desvio comportamental do field.' },
			{ title: 'Hermenêutica do Blefe', slug: 'hermeneutica-blefe', desc: 'Interpretação semiótica de linhas narrativas na mesa.' },
			{ title: 'Psicologia High Stakes', slug: 'psicologia-high-stakes', desc: 'Neurofisiologia do tilt e tomada de decisão sob pressão extrema.' },
		],
	},
	{
		id: 'laboratorios',
		title: 'Laboratórios & Exegese',
		icon: 'fa-microscope',
		colorClass: 'text-accent-sky border-accent-sky/30 shadow-[0_0_20px_rgba(14,165,233,0.15)]',
		badgeClass: 'bg-accent-sky/15 text-accent-sky border-accent-sky/30',
		articles: [
			{ title: 'Exegese da Decisão', slug: 'exegese-da-decisao', desc: 'Decomposição socrática de mãos e árvores de decisão.', isLab: true },
			{ title: 'A Amortização da Edge', slug: 'voce-aprende-poker-errado', desc: 'Cálculo de sobrevida e taxa de retorno composta.', isLab: true },
			{ title: 'Teoria da Perspectiva', slug: 'teoria-da-perspectiva', desc: 'Aversão à perda e função utilidade assimétrica.' },
			{ title: 'Falácia do Equilíbrio', slug: 'falacia-equilibrio-pedagogia', desc: 'Desmistificando o GTO ingênuo versus exploração real.' },
			{ title: 'Laboratório ChipEV vs ICMev', slug: 'laboratorio-chipev-vs-icmev', desc: 'Comparador interativo de equidade de fichas e monetária.' },
			{ title: 'Toy Games (Predator Mode)', slug: 'toy-games', desc: 'Cenários simplificados de combate puro de stacks.' },
			{ title: 'Nós de Calibragem (Âncora)', slug: 'nos-de-calibragem', desc: 'Pontos de verificação estratégica para a mesa ao vivo.' },
		],
	},
];

export default function BibliotecaIndexPage() {
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCategory, setSelectedCategory] = useState<string>('all');

	const totalArticles = useMemo(() => {
		return LIBRARY_CATEGORIES.reduce((acc, cat) => acc + cat.articles.length, 0);
	}, []);

	const totalLabs = useMemo(() => {
		return LIBRARY_CATEGORIES.reduce(
			(acc, cat) => acc + cat.articles.filter((a) => a.isLab).length,
			0
		);
	}, []);

	const filteredCategories = useMemo(() => {
		const query = searchQuery.toLowerCase().trim();
		return LIBRARY_CATEGORIES.map((category) => {
			if (selectedCategory !== 'all' && category.id !== selectedCategory) {
				return null;
			}
			const matchedArticles = category.articles.filter((art) => {
				if (!query) return true;
				return (
					art.title.toLowerCase().includes(query) ||
					art.desc?.toLowerCase().includes(query) ||
					art.slug.toLowerCase().includes(query)
				);
			});
			if (matchedArticles.length === 0) return null;
			return { ...category, articles: matchedArticles };
		}).filter(Boolean) as LibraryCategory[];
	}, [searchQuery, selectedCategory]);

	return (
		<div className="min-h-screen bg-bg-base text-text-bright pb-24 font-body">
			<ContentPageHeader
				title="A Mente Coletiva"
				subtitle="O repositório sagrado (Registro Akáshico) de toda a doutrina, laboratórios quânticos e manifestos arquiteturais de Raphael Vitoi."
				category="Biblioteca SOTA"
				icon="fa-book-open"
			/>

			<div className="sota-container py-12 md:py-20 space-y-16">
				{/* Trilha de Aprendizado Recomendada */}
				<section className="relative overflow-hidden rounded-4xl bg-linear-to-r from-accent-indigo/15 via-accent-violet/10 to-transparent border border-white/10 p-8 sm:p-12 shadow-2xl backdrop-blur-2xl group">
					<div className="absolute top-0 right-0 w-96 h-96 bg-accent-indigo/10 blur-[120px] rounded-full -mr-48 -mt-48 group-hover:bg-accent-indigo/20 transition-colors duration-1000 pointer-events-none" />
					<div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
						<div className="max-w-2xl space-y-4">
							<div className="flex items-center gap-3">
								<span className="px-3.5 py-1 rounded-full bg-accent-indigo text-white text-[0.6rem] font-black uppercase tracking-[0.25em] shadow-md">
									SOTA Pathfinding
								</span>
								<span className="text-[0.65rem] font-mono font-bold text-accent-indigo-light uppercase tracking-widest">
									{totalArticles} Ensaios · {totalLabs} Laboratórios
								</span>
							</div>
							<h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter m-0 text-glow-indigo">
								Trilha de Aprendizado Soberana
							</h2>
							<p className="text-text-muted text-sm sm:text-base leading-relaxed m-0 font-normal">
								Para neófitos e veteranos: siga a ordem exegética desenhada para a
								reconstrução geométrica da sua percepção de risco, ICM e equidade.
							</p>
						</div>
						<div className="flex flex-wrap gap-3">
							<PathBadge step="1" label="Manifesto" href="/biblioteca/manifesto-sota-axiomas" />
							<PathBadge step="2" label="ICM Heuristics" href="/biblioteca/entendendo-o-icm-e-suas-heuristicas" />
							<PathBadge step="3" label="Risk Geometry" href="/biblioteca/geometria-do-risco" />
							<PathBadge step="4" label="Masterclass" href="/aulas/icm-masterclass" />
						</div>
					</div>
				</section>

				{/* Barra de Filtros e Busca Inteligente */}
				<section className="space-y-6">
					<div className="flex flex-col md:flex-row items-center justify-between gap-6">
						{/* Categorias (Abas) */}
						<div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
							<CategoryTab
								label="Todos"
								count={totalArticles}
								active={selectedCategory === 'all'}
								onClick={() => setSelectedCategory('all')}
							/>
							{LIBRARY_CATEGORIES.map((cat) => (
								<CategoryTab
									key={cat.id}
									label={cat.title.split(' ')[0] ?? cat.title}
									count={cat.articles.length}
									active={selectedCategory === cat.id}
									onClick={() => setSelectedCategory(cat.id)}
								/>
							))}
						</div>

						{/* Campo de Busca */}
						<div className="relative w-full md:w-80">
							<i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-text-dim text-xs pointer-events-none" />
							<input
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Buscar por conceito ou artigo..."
								className="w-full bg-slate-950/60 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder:text-text-dim focus:outline-none focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo/40 transition-all font-body"
							/>
							{searchQuery && (
								<button
									type="button"
									onClick={() => setSearchQuery('')}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-white text-xs px-1.5 py-0.5 rounded"
									title="Limpar busca"
								>
									<i className="fa-solid fa-xmark" />
								</button>
							)}
						</div>
					</div>
				</section>

				{/* Grid Simétrico das Categorias e Artigos */}
				{filteredCategories.length === 0 ? (
					<div className="text-center py-20 border border-white/5 rounded-4xl bg-black/20">
						<i className="fa-solid fa-book-skull text-4xl text-text-dim mb-4 block" />
						<p className="text-text-muted text-sm font-bold uppercase tracking-widest m-0">
							Nenhum artefato encontrado para "{searchQuery}".
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
						{filteredCategories.map((category) => (
							<GlassPanel
								key={category.id}
								className={`p-6 sm:p-8 flex flex-col justify-between border-t-4 bg-slate-900/40 hover:bg-slate-900/60 transition-all duration-500 rounded-4xl ${category.colorClass}`}
							>
								<div className="space-y-6">
									<div className="flex items-center justify-between border-b border-white/5 pb-4">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-accent-indigo-light">
												<i className={`fa-solid ${category.icon} text-base`} />
											</div>
											<div>
												<h2 className="text-base font-black uppercase tracking-wider text-white m-0">
													{category.title}
												</h2>
												<span className="text-[0.6rem] font-mono text-text-dim uppercase tracking-widest">
													{category.articles.length} {category.articles.length === 1 ? 'ensaio' : 'ensaios'}
												</span>
											</div>
										</div>
										<span className={`px-2.5 py-0.5 rounded-full text-[0.55rem] font-black uppercase tracking-widest border ${category.badgeClass}`}>
											SOTA
										</span>
									</div>

									<div className="flex flex-col gap-2.5">
										{category.articles.map((article) => (
											<Link
												key={article.slug}
												href={`/biblioteca/${article.slug}`}
												className="flex flex-col gap-1 p-3.5 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group/art"
											>
												<div className="flex items-center justify-between gap-2">
													<div className="flex items-center gap-2.5">
														<div className="w-1.5 h-1.5 rounded-full bg-text-darker group-hover/art:bg-accent-indigo transition-colors" />
														<span className="text-xs font-bold text-text-main group-hover/art:text-white transition-colors tracking-tight">
															{article.title}
														</span>
													</div>
													{article.isLab && (
														<span className="px-2 py-0.5 rounded bg-accent-indigo/20 text-accent-indigo-light text-[0.5rem] font-black uppercase tracking-widest border border-accent-indigo/30 shrink-0">
															LAB
														</span>
													)}
												</div>
												{article.desc && (
													<p className="text-[0.7rem] text-text-dim pl-4 m-0 line-clamp-1 group-hover/art:text-text-muted transition-colors font-normal">
														{article.desc}
													</p>
												)}
											</Link>
										))}
									</div>
								</div>
							</GlassPanel>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

function CategoryTab({
	label,
	count,
	active,
	onClick,
}: Readonly<{
	label: string;
	count: number;
	active: boolean;
	onClick: () => void;
}>) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border ${
				active
					? 'bg-accent-indigo text-white border-accent-indigo shadow-[0_0_15px_rgba(99,102,241,0.3)]'
					: 'bg-white/5 text-text-muted hover:text-white border-white/5 hover:border-white/10'
			}`}
		>
			<span>{label}</span>
			<span
				className={`text-[0.6rem] px-1.5 py-0.2 rounded-full ${
					active ? 'bg-white/20 text-white' : 'bg-black/40 text-text-dim'
				}`}
			>
				{count}
			</span>
		</button>
	);
}

function PathBadge({ step, label, href }: Readonly<{ step: string; label: string; href: string }>) {
	return (
		<Link
			href={href}
			className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-bg-panel/40 border border-white/5 hover:border-accent-indigo/40 hover:bg-bg-panel/60 transition-all group/badge"
		>
			<span className="w-6 h-6 rounded-lg bg-accent-indigo/10 flex items-center justify-center text-[0.65rem] font-black text-accent-indigo-light border border-accent-indigo/20 group-hover/badge:bg-accent-indigo group-hover/badge:text-white transition-colors">
				{step}
			</span>
			<span className="text-[0.7rem] font-black uppercase tracking-widest text-text-dim group-hover/badge:text-white transition-colors">
				{label}
			</span>
			<i className="fa-solid fa-chevron-right text-[0.6rem] text-text-darker group-hover/badge:translate-x-0.5 transition-transform" />
		</Link>
	);
}
