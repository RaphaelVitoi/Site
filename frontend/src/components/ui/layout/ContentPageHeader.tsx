'use client';

/**
 * IDENTITY: SOTA Content Header SOTA v7.0 GOLD
 * PATH: src/components/layout/ContentPageHeader.tsx
 * ROLE: Prover identidade visual, título e apresentação consistente para páginas de conteúdo.
 * AESTHETIC: SOTA Gold Standard (Glows, Shimmer, Depth Layers).
 */

import { motion } from 'framer-motion';
import Link from 'next/link';

interface ContentPageHeaderProps {
	title: string;
	subtitle?: string;
	category?: string;
	icon?: string;
}

export function ContentPageHeader({
	title,
	subtitle,
	category,
	icon = 'fa-book-open',
}: Readonly<ContentPageHeaderProps>) {
	return (
		<header className="relative w-full overflow-hidden border-b border-white/5 bg-bg-deep/40 backdrop-blur-3xl pt-40 pb-20 group/header">
			{/* Camadas de Profundidade Gold */}
			<div className="absolute -top-32 -right-32 w-80 h-80 bg-accent-indigo/10 blur-[120px] rounded-full pointer-events-none group-hover/header:bg-accent-indigo/15 transition-all duration-1000" />
			<div className="absolute -bottom-32 -left-32 w-80 h-80 bg-accent-emerald/5 blur-[120px] rounded-full pointer-events-none" />

			<div className="sota-container relative z-10 animate-sota-in">
				<div className="flex flex-col gap-10">
					{/* Breadcrumb SOTA High-Fidelity */}
					<nav className="flex items-center gap-4 text-[0.6rem] font-black uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-opacity">
						<Link
							href="/"
							className="hover:text-accent-indigo transition-colors flex items-center gap-2"
						>
							<i className="fa-solid fa-house text-[0.55rem]" /> Home
						</Link>
						<i className="fa-solid fa-chevron-right text-[0.45rem] text-text-darker"></i>
						{category && (
							<>
								<Link
									href={`/biblioteca`}
									className="hover:text-accent-indigo transition-colors"
								>
									{category}
								</Link>
								<i className="fa-solid fa-chevron-right text-[0.45rem] text-text-darker"></i>
							</>
						)}
						<span className="text-text-muted truncate max-w-50">{title}</span>
					</nav>

					<div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
						<div className="space-y-6 max-w-4xl">
							<div className="flex items-center gap-5">
								<motion.div
									whileHover={{ scale: 1.05 }}
									className="w-14 h-14 rounded-2xl bg-accent-indigo/10 border border-accent-indigo/20 flex items-center justify-center text-accent-indigo shadow-2xl relative overflow-hidden"
								>
									<div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent pointer-events-none" />
									<i className={`fa-solid ${icon} text-2xl`}></i>
								</motion.div>
								{category && (
									<div className="flex flex-col gap-1">
										<span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[0.55rem] font-black text-text-muted uppercase tracking-[0.4em] w-fit shadow-inner">
											{category}
										</span>
										<div className="flex gap-1.5 pl-1 opacity-20">
											<div className="w-1 h-1 rounded-full bg-accent-indigo" />
											<div className="w-1 h-1 rounded-full bg-accent-indigo" />
											<div className="w-1 h-1 rounded-full bg-accent-indigo" />
										</div>
									</div>
								)}
							</div>

							<h1 className="text-5xl md:text-7xl font-black text-gradient-sota tracking-tighter leading-[0.95] drop-shadow-2xl">
								{title}
							</h1>

							{subtitle && (
								<div className="relative group/subtitle">
									<div className="absolute top-0 left-0 w-1 h-full bg-accent-indigo/40 rounded-full group-hover/subtitle:bg-accent-indigo transition-colors" />
									<p className="text-lg md:text-xl text-text-muted font-medium leading-loose max-w-3xl pl-8 m-0 italic py-1">
										{subtitle}
									</p>
								</div>
							)}
						</div>

						<div className="hidden xl:block">
							<div className="text-right space-y-3 opacity-30 hover:opacity-60 transition-all duration-700">
								<div className="space-y-1">
									<span className="text-[0.65rem] font-black uppercase tracking-[0.4em] text-white block">
										Paradigma VITOI
									</span>
									<span className="text-[0.5rem] font-mono font-black uppercase tracking-[0.5em] text-accent-indigo-light">
										Quantum Intelligence
									</span>
								</div>
								<div className="h-px w-32 bg-linear-to-l from-accent-indigo/40 to-transparent ml-auto" />
								<div className="flex justify-end gap-4 opacity-50">
									<i className="fa-solid fa-microchip text-[0.6rem]" />
									<i className="fa-solid fa-dna text-[0.6rem]" />
									<i className="fa-solid fa-satellite-dish text-[0.6rem]" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Shimmer Border SOTA */}
			<div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-white/10 to-transparent shadow-[0_0_20px_rgba(255,255,255,0.05)]" />
		</header>
	);
}
