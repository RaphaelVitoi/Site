'use client';

import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { SectionHeader } from '@/components/ui/layout/SectionHeader';
import Link from 'next/link';

export default function QuemSouPage() {
	return (
		<div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
			<ContentPageHeader
				title="O Autor"
				subtitle="Estrategista High Stakes e idealizador do Framework de Perspectiva Matemática."
				category="Identidade"
				icon="fa-user-astronaut"
			/>

			<div className="sota-container py-12 md:py-24 space-y-24">
				{/* Video Section */}
				<section className="max-w-4xl mx-auto">
					<SectionHeader
						step="INTRO"
						label="Mensagem"
						title="A Perspectiva Soberana"
						description="Uma introdução visual à filosofia SOTA e ao ecossistema do Monolito Nexus."
					/>

					<GlassPanel className="mt-12 overflow-hidden border-accent-indigo/20 shadow-[0_0_50px_rgba(99,102,241,0.15)] group relative bg-bg-panel/40 backdrop-blur-2xl">
						<div className="absolute inset-0 bg-grain mix-blend-overlay opacity-5 pointer-events-none" />
						<div className="relative aspect-video bg-black/40">
							<video
								src="/0304.mp4"
								controls
								className="w-full h-full object-cover"
								poster="/images/hero-bg.png" // Placeholder poster
							>
								<track
									kind="captions"
									srcLang="pt"
									label="Português"
									src="/captions/0304.vtt"
								/>
								Seu navegador não suporta a tag de vídeo.
							</video>
							<div className="absolute inset-0 pointer-events-none border border-white/5 rounded-inherit" />
						</div>
						<div className="p-6 bg-bg-panel/40 border-t border-white/5">
							<p className="text-[0.7rem] font-mono text-text-dim uppercase tracking-[0.2em] flex items-center gap-3">
								<span className="w-1.5 h-1.5 rounded-full bg-accent-indigo animate-pulse" />
								{'Vetor de Transmissão: Identidade SOTA'}
							</p>
						</div>
					</GlassPanel>
				</section>

				{/* Biography Section */}
				<section className="max-w-4xl mx-auto">
					<div className="grid grid-cols-1 md:grid-cols-[0.4fr_1fr] gap-12 items-center">
						<div className="relative group">
							<div className="absolute inset-0 bg-accent-indigo/20 blur-[50px] rounded-full group-hover:bg-accent-indigo/30 transition-colors duration-1000" />
							<GlassPanel className="aspect-square rounded-full border-accent-indigo/30 p-2 relative z-10 overflow-hidden">
								<div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
									<i className="fa-solid fa-user-astronaut text-6xl text-accent-indigo/50" />
								</div>
							</GlassPanel>
							<div className="absolute -bottom-4 -right-4 bg-accent-emerald px-4 py-2 rounded-xl text-[0.6rem] font-black text-white uppercase tracking-widest shadow-xl border border-white/10 z-20">
								SOTA AUTHOR
							</div>
						</div>

						<div className="space-y-8">
							<div className="space-y-2">
								<h2 className="text-4xl font-black text-white uppercase tracking-tighter m-0">
									Raphael Vitoi
								</h2>
								<p className="text-accent-indigo-light font-mono text-[0.7rem] uppercase tracking-[0.3em]">
									Architect & Strategist · v6.2.1 GOLD
								</p>
							</div>

							<div className="prose prose-invert prose-indigo">
								<p className="text-text-muted leading-relaxed">
									Estrategista de High Stakes com mais de uma década de atuação na
									fronteira entre a Teoria dos Jogos e a Psicologia Preditiva.
									Idealizador do framework{' '}
									<strong className="text-white">Perspectiva Matemática</strong> e
									do <strong className="text-white">Monolito Nexus</strong>.
								</p>
								<p className="text-text-muted leading-relaxed">
									Seu trabalho foca na desconstrução de dogmas tradicionais e na
									implementação de protocolos de alta performance matemática,
									priorizando a longevidade cognitiva e a eficiência de capital.
								</p>
							</div>

							<div className="flex gap-4">
								<SocialLink icon="fa-instagram" label="Instagram" href="#" />
								<SocialLink icon="fa-x-twitter" label="X / Twitter" href="#" />
								<SocialLink icon="fa-linkedin" label="LinkedIn" href="#" />
							</div>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}

function SocialLink({ icon, label, href }: { icon: string; label: string; href: string }) {
	return (
		<Link
			href={href}
			className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-dim hover:text-white hover:bg-accent-indigo/20 hover:border-accent-indigo/40 transition-all group"
			title={label}
		>
			<i className={`fa-brands ${icon} group-hover:scale-110 transition-transform`} />
		</Link>
	);
}
