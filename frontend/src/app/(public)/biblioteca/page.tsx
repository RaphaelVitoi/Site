/**
 * IDENTITY: Index da Biblioteca SOTA (O Arquivo Akashico)
 * PATH: src/app/biblioteca/page.tsx
 * ROLE: Organizar e exibir todos os artigos teóricos, mecânicos e laboratórios interativos documentados.
 */

import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import Link from 'next/link';

type ArticleItem = {
	title: string;
	slug: string;
	isLab?: boolean;
};

type LibraryCategory = {
	title: string;
	icon: string;
	colorClass: string;
	articles: ArticleItem[];
};

// SOTA: Mapeamento de Rotas baseado exclusivamente na fonte da verdade (ROUTES.md)
const LIBRARY_CATEGORIES: LibraryCategory[] = [
	{
		title: 'Fundamentos SOTA',
		icon: 'fa-book-journal-whills',
		colorClass:
			'text-accent-indigo border-accent-indigo/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]',
		articles: [
			{ title: 'Manifesto SOTA: Axiomas', slug: 'manifesto-sota-axiomas' },
			{ title: 'Hierarquia da Decisão', slug: 'hierarquia-da-decisao' },
			{ title: 'Estado da Arte GOLD', slug: 'estado-da-arte' },
			{ title: 'Protocolo Smart Sniper', slug: 'smart-sniper' },
			{ title: 'Validação Smart Sniper', slug: 'validacao-smart-sniper' },
		],
	},
	{
		title: 'Mecânica & ICM',
		icon: 'fa-gears',
		colorClass:
			'text-accent-emerald border-accent-emerald/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
		articles: [
			{
				title: 'Downward Drift & Compressão',
				slug: 'downward-drift-sota',
				isLab: true,
			},
			{ title: 'Geometria do Risco', slug: 'geometria-do-risco' },
			{
				title: 'Entendendo o ICM e Heurísticas',
				slug: 'entendendo-o-icm-e-suas-heuristicas',
			},
			{
				title: 'Heurística ICM Pós-Flop',
				slug: 'heuristica-icm-pos-flop-aula',
			},
			{ title: 'Motor de Diluição', slug: 'motor-diluicao' },
			{ title: 'Teto Equidade River ICM', slug: 'teto-equidade-river-icm' },
			{ title: 'Estruturas de Torneio', slug: 'estruturas-de-torneio' },
		],
	},
	{
		title: 'Valuation & Risco',
		icon: 'fa-scale-unbalanced',
		colorClass:
			'text-accent-amber border-accent-amber/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
		articles: [
			{ title: 'Paradoxo da Valuation', slug: 'paradoxo-valuation' },
			{ title: 'Axioma do EV Fold Dinâmico', slug: 'axioma-ev-fold-dinamico' },
			{ title: 'Insolvência das Pot Odds', slug: 'insolvencia-das-pot-odds' },
			{ title: 'Risco de Ressurreição', slug: 'risco-de-ressurreicao' },
		],
	},
	{
		title: 'Psicologia Preditiva',
		icon: 'fa-brain',
		colorClass: 'text-accent-rose border-accent-rose/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]',
		articles: [
			{
				title: 'Fator Ψ (Maluquice Humana)',
				slug: 'fator-psi-maluquice-humana',
			},
			{ title: 'Hermenêutica do Blefe', slug: 'hermeneutica-blefe' },
			{ title: 'Psicologia High Stakes', slug: 'psicologia-high-stakes' },
		],
	},
	{
		title: 'Laboratórios & Exegese',
		icon: 'fa-microscope',
		colorClass: 'text-accent-sky border-accent-sky/30 shadow-[0_0_15px_rgba(14,165,233,0.15)]',
		articles: [
			{ title: 'Exegese da Decisão', slug: 'exegese-da-decisao', isLab: true },
			{
				title: 'A Amortização da Edge',
				slug: 'voce-aprende-poker-errado',
				isLab: true,
			},
			{ title: 'Teoria da Perspectiva', slug: 'teoria-da-perspectiva' },
			{ title: 'Falácia do Equilíbrio', slug: 'falacia-equilibrio-pedagogia' },
			{
				title: 'Laboratório ChipEV vs ICMev',
				slug: 'laboratorio-chipev-vs-icmev',
			},
			{ title: 'Toy Games (Predator Mode)', slug: 'toy-games' },
			{ title: 'Nós de Calibragem (Âncora)', slug: 'nos-de-calibragem' },
		],
	},
];

export default function BibliotecaIndexPage() {
	return (
		<div className="min-h-screen bg-bg-base text-text-bright pb-24">
			<ContentPageHeader
				title="A Mente Coletiva"
				subtitle="O repositório sagrado (Registro Akáshico) de toda a doutrina, laboratórios quânticos e manifestos arquiteturais de Raphael Vitoi."
				category="Biblioteca SOTA"
				icon="fa-book-open"
			/>

			<div className="sota-container py-12 md:py-24">
				{/* Trilha de Aprendizado Recomendada */}
				<section className="mb-20">
					<div className="flex flex-col md:flex-row items-center justify-between gap-8 p-10 rounded-[2.5rem] bg-linear-to-r from-accent-indigo/10 via-accent-violet/5 to-transparent border border-accent-indigo/20 shadow-2xl relative overflow-hidden group">
						<div className="absolute top-0 right-0 w-64 h-64 bg-accent-indigo/5 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:bg-accent-indigo/10 transition-colors duration-1000" />
						<div className="relative z-10 flex-1">
							<span className="px-3 py-1 rounded-full bg-accent-indigo text-white text-[0.6rem] font-black uppercase tracking-[0.2em] mb-4 inline-block">
								SOTA Pathfinding
							</span>
							<h2 className="text-3xl font-black text-white uppercase tracking-tighter m-0 mb-4 text-glow-indigo transition-all duration-500">
								Trilha de Aprendizado Soberana
							</h2>
							<p className="text-text-muted text-sm max-w-xl leading-relaxed">
								Para neófitos e veteranos: siga a ordem exegética desenhada para a
								reconstrução total da sua percepção de risco e valor.
							</p>
						</div>
						<div className="relative z-10 flex flex-wrap gap-3">
							<PathBadge
								step="1"
								label="Manifesto"
								href="/biblioteca/manifesto-sota-axiomas"
							/>
							<PathBadge
								step="2"
								label="ICM Heuristics"
								href="/biblioteca/entendendo-o-icm-e-suas-heuristicas"
							/>
							<PathBadge
								step="3"
								label="Risk Geometry"
								href="/biblioteca/geometria-do-risco"
							/>
							<PathBadge step="4" label="Masterclass" href="/aulas/icm-masterclass" />
						</div>
					</div>
				</section>

				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
					{LIBRARY_CATEGORIES.map((category) => (
						<GlassPanel
							key={category.title}
							className={`p-8 border-t-4 bg-slate-900/40 hover:bg-slate-900/60 transition-colors ${category.colorClass}`}
						>
							<div className="flex items-center gap-4 mb-6">
								<i className={`fa-solid ${category.icon} text-xl`} />
								<h2 className="text-[1.1rem] font-black uppercase tracking-widest m-0">
									{category.title}
								</h2>
							</div>
							<div className="flex flex-col gap-3">
								{category.articles.map((article) => (
									<Link
										key={article.slug}
										href={`/biblioteca/${article.slug}`}
										className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group"
									>
										<div className="w-1.5 h-1.5 rounded-full bg-text-darker group-hover:bg-white transition-colors" />
										<span className="text-[0.8rem] font-bold text-text-muted group-hover:text-white transition-colors uppercase tracking-widest">
											{article.title}
										</span>
										{article.isLab && (
											<span className="ml-auto px-2 py-0.5 rounded bg-accent-indigo/20 text-accent-indigo-light text-[0.55rem] font-black uppercase tracking-widest border border-accent-indigo/30">
												LAB
											</span>
										)}
									</Link>
								))}
							</div>
						</GlassPanel>
					))}
				</div>
			</div>
		</div>
	);
}

function PathBadge({ step, label, href }: { step: string; label: string; href: string }) {
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
