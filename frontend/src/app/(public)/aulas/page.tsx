import Link from 'next/link';
import type { Metadata } from 'next';
import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { ROUTES } from '@/constants/routes';

export const metadata: Metadata = {
	title: 'Aulas Mestres de ICM & Teoria dos Jogos | Raphael Vitoi',
	description:
		'Coleção canônica de Aulas SOTA: Masterclass de Geometria do Risco, ICM Pós-Flop, Leitura de Mão e Conceitos Fundamentais.',
};

const AULAS = [
	{
		title: 'Masterclass: Geometria do Risco',
		href: ROUTES.AULAS.MASTERCLASS,
		desc: 'O framework matemático do ICM pós-flop: Risk Premium, ΔRP, Perspectiva Matemática e o colapso da MDF.',
		icon: 'fa-graduation-cap',
		category: 'Geometria do Risco',
		badge: 'Masterclass',
		badgeClass: 'bg-accent-indigo/15 text-accent-indigo-light border-accent-indigo/30',
		colorClass: 'text-accent-indigo border-accent-indigo/30 shadow-[0_0_20px_rgba(99,102,241,0.15)]',
	},
	{
		title: 'Pós-Flop: A Dinâmica da Pressão',
		href: ROUTES.AULAS.POS_FLOP,
		desc: 'Como a assimetria de stacks transforma a árvore de decisões após o flop. Compressão de sizings e defesa.',
		icon: 'fa-microchip',
		category: 'Dinâmica Pós-Flop',
		badge: 'Pós-Flop',
		badgeClass: 'bg-accent-emerald/15 text-accent-emerald-light border-accent-emerald/30',
		colorClass: 'text-accent-emerald border-accent-emerald/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]',
	},
	{
		title: 'Leitura ICM: Desconstrução de Spots',
		href: ROUTES.AULAS.LEITURA_ICM,
		desc: 'Análise profunda e heurísticas aplicadas à leitura de ranges sob assimetria severa de payjumps.',
		icon: 'fa-book-open-reader',
		category: 'Metodologia',
		badge: 'Leitura Prática',
		badgeClass: 'bg-accent-amber/15 text-accent-gold border-accent-amber/30',
		colorClass: 'text-accent-amber border-accent-amber/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
	},
	{
		title: 'Conceitos ICM: Fundamentos Formais',
		href: ROUTES.AULAS.CONCEITOS,
		desc: 'Definição formal de Risk Premium, Bubble Factor, Expectativa, Perspectiva e a extensão de ICM EV.',
		icon: 'fa-scale-unbalanced',
		category: 'Fundamentos',
		badge: 'Teoria Pura',
		badgeClass: 'bg-accent-rose/15 text-accent-rose-light border-accent-rose/30',
		colorClass: 'text-accent-rose border-accent-rose/30 shadow-[0_0_20px_rgba(244,63,94,0.15)]',
	},
];

export default function AulasIndexPage() {
	return (
		<div className="min-h-screen bg-bg-base text-text-bright pb-24 font-body">
			<ContentPageHeader
				title="Aulas SOTA"
				subtitle="Doutrina canônica de Teoria dos Jogos, Geometria do Risco e Modelagem ICM por Raphael Vitoi."
				category="Currículo Avançado"
				icon="fa-graduation-cap"
			/>

			<div className="sota-container py-12 md:py-20">
				<div className="max-w-6xl mx-auto">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{AULAS.map((aula) => (
							<Link
								key={aula.href}
								href={aula.href}
								className="group block focus:outline-none"
							>
								<GlassPanel className="p-8 sm:p-10 h-full flex flex-col justify-between border-white/10 hover:border-accent-indigo/40 hover:bg-slate-900/60 transition-all duration-500 rounded-3xl group-hover:-translate-y-1">
									<div>
										<div className="flex items-center justify-between gap-4 mb-6">
											<div
												className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${aula.colorClass} bg-slate-950/60 transition-transform group-hover:scale-110`}
											>
												<i className={`fa-solid ${aula.icon} text-lg`} />
											</div>
											<span
												className={`px-3 py-1 rounded-full text-[0.6rem] font-black tracking-widest uppercase border ${aula.badgeClass}`}
											>
												{aula.badge}
											</span>
										</div>

										<span className="text-[0.65rem] font-bold text-text-darker tracking-[0.25em] uppercase block mb-2">
											{aula.category}
										</span>
										<h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mb-4 group-hover:text-accent-indigo-light transition-colors">
											{aula.title}
										</h2>
										<p className="text-sm text-text-muted leading-relaxed font-medium">
											{aula.desc}
										</p>
									</div>

									<div className="pt-8 mt-6 border-t border-white/5 flex items-center justify-between">
										<span className="text-[0.65rem] font-black text-accent-indigo-light uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
											<span>Acessar Aula</span>
											<i className="fa-solid fa-arrow-right text-xs" />
										</span>
										<span className="text-[0.65rem] font-mono text-text-darker uppercase">
											SOTA GOLD
										</span>
									</div>
								</GlassPanel>
							</Link>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
