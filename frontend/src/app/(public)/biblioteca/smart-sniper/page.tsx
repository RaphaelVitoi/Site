'use client';

/**
 * IDENTITY: O Protocolo Smart Sniper v7.0 GOLD
 * PATH: src/app/biblioteca/smart-sniper/page.tsx
 * ROLE: Manual de gestão de carreira e alta performance sob o Paradigma SOTA.
 * AESTHETIC: SOTA Gold Standard (Visual Hierarchy, Symmetry, Glassmorphism).
 */

import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import { SectionHeader } from '@/components/ui/layout/SectionHeader';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import Link from 'next/link';

export default function SmartSniperPage() {
	return (
		<div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-32">
			<ContentPageHeader
				title="Protocolo Smart Sniper"
				subtitle="A antítese do grind tradicional: Gestão de Carreira, Eficiência Matemática e a exegese da Alta Performance em MTTs."
				category="Doutrina"
				icon="fa-crosshairs"
			/>

			<div className="sota-container -mt-16 relative z-10 flex flex-col gap-32">
				{/* Manifesto Section */}
				<section className="flex flex-col gap-12">
					<SectionHeader
						step="01"
						label="Manifesto"
						title="A Antítese do Grind"
						description="Focado em Lucro Líquido e Longevidade, não em gerar rake para os sites."
					/>

					<GlassPanel className="max-w-5xl mx-auto p-10 md:p-16 rounded-4xl bg-bg-panel/60 border-white/5 shadow-2xl relative overflow-hidden group/manifesto">
						<div className="absolute -top-32 -right-32 w-80 h-80 bg-accent-indigo/10 blur-[120px] rounded-full pointer-events-none group-hover/manifesto:bg-accent-indigo/15 transition-all duration-1000" />

						<div className="prose prose-invert prose-indigo lg:prose-xl max-w-none relative z-10">
							<p className="text-indigo-100/80 leading-loose">
								O &quot;Grind&quot; tradicional morreu. A velha escola ensinava que
								para vencer no poker você precisava abrir 15 telas, jogar 12 horas
								por dia e aceitar uma variância brutal em nome do &quot;longo
								prazo&quot;. Este documento apresenta a antítese dessa ideia. O{' '}
								<strong className="text-white">Protocolo Smart Sniper</strong> não
								foi desenhado para gerar rake; foi desenhado para gerar{' '}
								<strong className="text-accent-indigo-light">
									Lucro Líquido e Longevidade
								</strong>{' '}
								para você.
							</p>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-16">
								<PillarCard
									number="1"
									label="Eficiência"
									title="Financeira"
									desc="Buscamos o maior $/Hour, não apenas ROI bruto."
									color="emerald"
								/>
								<PillarCard
									number="2"
									label="Sustentabilidade"
									title="Cognitiva"
									desc="Respeito aos limites biológicos do cérebro."
									color="indigo"
								/>
								<PillarCard
									number="3"
									label="Matemática"
									title="Defensiva"
									desc="Seleção cirúrgica para blindar o bankroll."
									color="violet"
								/>
							</div>
						</div>
					</GlassPanel>
				</section>

				{/* Rotina Section */}
				<section className="flex flex-col gap-12">
					<SectionHeader
						step="02"
						label="Operação"
						title="A Estratégia Sniper"
						description="De segunda a sábado, o objetivo é a construção de bankroll através do fluxo de caixa estável."
					/>

					<div className="grid grid-cols-1 lg:grid-cols-[1fr_0.8fr] gap-12 max-w-7xl mx-auto w-full items-start">
						<div className="glass-panel p-10 md:p-12 rounded-4xl bg-bg-panel/40 border-white/5 shadow-xl relative overflow-hidden group/volume">
							<h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-4">
								<i className="fa-solid fa-display text-accent-indigo" /> Volume
								Otimizado
							</h3>
							<p className="text-indigo-100/70 leading-relaxed mb-10 font-medium">
								A <strong className="text-white">Lei de Yerkes-Dodson</strong>{' '}
								demonstra que a performance humana segue uma curva de U invertido.
								Acima de 8 telas, o edge técnico desaparece e o cérebro entra em
								C-Game automático.
							</p>

							<div className="overflow-hidden rounded-3xl border border-white/5 bg-slate-950/60 shadow-inner">
								<table className="w-full text-left text-[0.75rem] font-mono tabular-nums">
									<thead className="bg-white/5 text-text-muted uppercase tracking-widest border-b border-white/5">
										<tr>
											<th className="p-6 font-black">Parâmetro</th>
											<th className="p-6 font-black">Regra SOTA</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-white/5">
										<tr className="hover:bg-white/5 transition-colors">
											<td className="p-6 font-bold text-white uppercase">
												Telas Ativas
											</td>
											<td className="p-6 font-black text-accent-emerald text-base">
												Max 6 a 8
											</td>
										</tr>
										<tr className="hover:bg-white/5 transition-colors">
											<td className="p-6 font-bold text-white uppercase">
												ABI (Average Buy-in)
											</td>
											<td className="p-6 font-black text-accent-indigo-light text-base">
												Dinâmico
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>

						<div className="glass-panel p-10 md:p-12 rounded-4xl bg-slate-900/60 border-accent-indigo/20 shadow-2xl relative overflow-hidden group/entry">
							<div className="absolute inset-0 bg-radial-[at_top_right] from-accent-indigo/5 to-transparent pointer-events-none" />
							<h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-4">
								<i className="fa-solid fa-bullseye text-accent-indigo-light" />{' '}
								Entrada Cirúrgica
							</h3>
							<p className="text-indigo-100/80 leading-loose italic border-l-2 border-accent-indigo/40 pl-6 py-2">
								&quot;Nós não registramos no Nível 1. Capturamos stacks já
								valorizadas pelo ICM sem carregar o custo de gerá-la.&quot;
							</p>
							<div className="mt-8 p-6 rounded-2xl bg-black/40 border border-white/5 text-center">
								<span className="text-[0.6rem] font-black text-text-darker uppercase tracking-[0.4em] block mb-3">
									Zona de Arbitragem ICM
								</span>
								<span className="text-3xl font-black font-mono text-white tabular-nums tracking-tighter">
									30-50 BBs
								</span>
							</div>
						</div>
					</div>
				</section>

				{/* Domingo Section */}
				<section className="flex flex-col gap-12">
					<SectionHeader
						step="03"
						label="High Stakes"
						title="Risco Assimétrico"
						description="A aplicação prática da teoria Barbell: proteger o bankroll na semana, buscar a lua no domingo."
					/>

					<div className="glass-panel p-10 md:p-16 rounded-4xl bg-linear-to-br from-bg-panel/80 to-bg-deep border-white/5 shadow-3xl max-w-5xl mx-auto w-full relative overflow-hidden group/domingo">
						<div className="absolute inset-0 bg-radial-[at_center_center] from-accent-indigo/5 to-transparent pointer-events-none" />
						<div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
							<div className="space-y-6">
								<div className="w-12 h-12 rounded-2xl bg-accent-amber/10 border border-accent-amber/20 flex items-center justify-center text-accent-amber shadow-lg">
									<i className="fa-solid fa-shield-halved text-xl" />
								</div>
								<h4 className="text-xl font-black text-white uppercase tracking-tighter m-0">
									Teto de Gastos Semanal
								</h4>
								<p className="text-text-dim leading-relaxed font-medium">
									O gasto total de domingo deve ser igual ao gasto médio semanal,
									impedindo que um dia ruim comprometa meses de solvência.
								</p>
							</div>
							<div className="space-y-6">
								<div className="w-12 h-12 rounded-2xl bg-accent-indigo/10 border border-accent-indigo/20 flex items-center justify-center text-accent-indigo shadow-lg">
									<i className="fa-solid fa-gem text-xl" />
								</div>
								<h4 className="text-xl font-black text-white uppercase tracking-tighter m-0">
									Foco de Elite (4 Telas)
								</h4>
								<p className="text-text-dim leading-relaxed font-medium">
									Em vez de volume barato, jogamos 4 Majors com ABI elevado.
									Qualidade total para cravadas de 5 dígitos.
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* Final CTA */}
				<section className="max-w-5xl mx-auto w-full pb-24">
					<div className="glass-panel p-16 rounded-5xl bg-slate-950/60 border border-accent-indigo/20 text-center relative overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] group/cta">
						<div className="absolute inset-0 bg-radial-[at_bottom_center] from-accent-indigo/10 to-transparent pointer-events-none" />
						<div className="relative z-10 space-y-10">
							<div className="space-y-4">
								<h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter m-0">
									A Prova Matemática
								</h3>
								<p className="text-text-muted max-w-2xl mx-auto font-medium text-lg leading-relaxed">
									Não confie em promessas. Veja os dados brutos de simulações de
									Monte Carlo que comprovam a superioridade deste protocolo.
								</p>
							</div>
							<Link
								href="/biblioteca/validacao-smart-sniper"
								className="inline-flex items-center gap-4 px-12 py-5 rounded-full bg-accent-indigo text-white font-black uppercase tracking-[0.3em] text-[0.8rem] transition-all duration-500 hover:shadow-[0_0_50px_rgba(99,102,241,0.6)] hover:-translate-y-1 active:scale-95 group/btn"
							>
								Validar Protocolo{' '}
								<i className="fa-solid fa-arrow-right-long group-hover/btn:translate-x-2 transition-transform" />
							</Link>
						</div>
					</div>
				</section>

				<footer className="max-w-4xl mx-auto pt-16 border-t border-white/5 text-center flex flex-col items-center gap-6 opacity-40 hover:opacity-100 transition-opacity duration-1000">
					<div className="flex gap-4">
						<div className="w-1.5 h-1.5 rounded-full bg-accent-indigo" />
						<div className="w-1.5 h-1.5 rounded-full bg-accent-indigo" />
						<div className="w-1.5 h-1.5 rounded-full bg-accent-indigo" />
					</div>
					<p className="text-text-muted text-[0.65rem] font-black uppercase tracking-[0.4em] m-0">
						© 2026 Raphael Vitoi · Monolito Nexus · SOTA Protocolo Sniper
					</p>
				</footer>
			</div>
		</div>
	);
}

function PillarCard({
	number,
	label,
	title,
	desc,
	color,
}: Readonly<{
	number: string;
	label: string;
	title: string;
	desc: string;
	color: string;
}>) {
	const colorClasses = {
		emerald: 'text-accent-emerald bg-accent-emerald/10 border-accent-emerald/20',
		indigo: 'text-accent-indigo-light bg-accent-indigo/10 border-accent-indigo/20',
		violet: 'text-accent-violet-light bg-accent-violet/10 border-accent-violet/20',
	}[color as 'emerald' | 'indigo' | 'violet'];

	return (
		<div className="flex flex-col gap-5 p-8 rounded-3xl bg-black/40 border border-white/5 shadow-inner transition-all duration-500 hover:-translate-y-1 hover:border-white/10 group/pillar">
			<div
				className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border ${colorClasses}`}
			>
				{number}
			</div>
			<div className="space-y-1">
				<span className="text-[0.55rem] font-black text-text-darker uppercase tracking-[0.3em] block">
					{label}
				</span>
				<h4 className="text-lg font-black text-white uppercase tracking-widest m-0">
					{title}
				</h4>
			</div>
			<p className="text-[0.8rem] text-text-dim leading-relaxed m-0 font-medium group-hover/pillar:text-text-muted transition-colors">
				{desc}
			</p>
		</div>
	);
}
