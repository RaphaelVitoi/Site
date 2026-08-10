/**
 * IDENTITY: ValidaÃ§Ã£o CientÃ­fica do Smart Sniper (GOLD v7.0 GOLD)
 * PATH: src/app/biblioteca/validacao-smart-sniper/page.tsx
 * ROLE: Artigo acadÃªmico/tÃ©cnico com anÃ¡lise de Monte Carlo, Sharpe e Barbell.
 */

import JsonLd from '@/components/seo/JsonLd';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { SectionHeader } from '@/components/ui/layout/SectionHeader';
import Link from 'next/link';

export const metadata = {
	title: 'ValidaÃ§Ã£o CientÃ­fica do Smart Sniper GOLD | Raphael Vitoi',
	description:
		'AnÃ¡lise comparativa via Monte Carlo, Ãndice de Sharpe e Teoria de PortfÃ³lio aplicada ao poker MTT GOLD v7.0 GOLD.',
};

const articleSchema = {
	'@context': 'https://schema.org',
	'@type': 'TechArticle',
	headline: 'ValidaÃ§Ã£o CientÃ­fica do Protocolo Smart Sniper GOLD: v7.0 GOLD',
	description:
		'InvestigaÃ§Ã£o da eficÃ¡cia matemÃ¡tica de estratÃ©gias de grind em MTTs atravÃ©s de 10.000 simulaÃ§Ãµes de Monte Carlo.',
	author: { '@type': 'Person', name: 'Raphael Vitoi' },
};

export default function ValidacaoSmartSniperPage() {
	return (
		<div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body">
			<JsonLd data={articleSchema} />

			{/* Header Central de PÃ¡gina */}
			<div className="max-w-300 mx-auto px-6 pt-12">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
					<div>
						<h1 className="text-[clamp(2rem,5vw,3rem)] font-black m-0 tracking-tighter bg-linear-to-r from-text-bright to-text-dim bg-clip-text text-transparent font-heading">
							OtimizaÃ§Ã£o de VariÃ¢ncia
						</h1>
						<p className="m-0 mt-4 text-[0.9rem] text-text-muted leading-relaxed max-w-145">
							ValidaÃ§Ã£o CientÃ­fica do Protocolo Smart Sniper. AnÃ¡lise exegÃ©tica via
							Monte Carlo, Ãndice de Sharpe e Teoria de PortfÃ³lio.
						</p>
						<div className="flex flex-wrap items-center gap-4 mt-6">
							<span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-indigo/10 border border-accent-indigo/20 text-[0.65rem] font-bold text-accent-indigo-light uppercase tracking-widest font-mono">
								<span className="w-2 h-2 rounded-full bg-accent-emerald shadow-[0_0_8px_rgba(16,185,129,0.5)]" />{' '}
								Artigo CientÃ­fico
							</span>
							<span className="text-[0.7rem] text-text-dim font-bold font-mono uppercase tracking-widest">
								ValidaÃ§Ã£o EstratÃ©gica
							</span>
						</div>
					</div>

					<div className="flex gap-2 items-center">
						<Link
							href="/biblioteca"
							className="px-4 py-2 rounded-xl bg-bg-elevated/40 border border-white/5 text-text-muted text-[0.75rem] font-bold flex items-center gap-2 transition-all hover:text-text-bright hover:bg-bg-elevated"
						>
							<i className="fa-solid fa-arrow-left text-[0.7rem]" /> BIBLIOTECA
						</Link>
					</div>
				</div>
			</div>

			<SectionHeader
				step="01"
				label="Abstract"
				title="Resumo do Estudo"
				description="InvestigaÃ§Ã£o da eficÃ¡cia matemÃ¡tica de diferentes abordagens de grind atravÃ©s de simulaÃ§Ãµes de alta fidelidade."
			/>
			<div className="max-w-300 mx-auto px-6 pb-12">
				<GlassPanel className="p-8 sm:p-12 lg:p-16">
					<div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
						<p>
							Este estudo investiga a eficÃ¡cia matemÃ¡tica de diferentes abordagens de
							grind em torneios multi-mesa (MTT) de No-Limit Hold&apos;em. AtravÃ©s de
							10.000 simulaÃ§Ãµes de Monte Carlo, comparamos a estratÃ©gia tradicional de
							alto volume (<em>Mass Multitabling</em>) com o{' '}
							<strong className="text-text-bright">Protocolo Smart Sniper</strong>,
							caracterizado por seleÃ§Ã£o de Small Fields, entrada tardia estratÃ©gica (
							<em>Late Reg</em>) e alocaÃ§Ã£o assimÃ©trica de capital aos domingos (
							<em>Capped Spend, High ABI</em>). Os resultados demonstram que o
							Protocolo Sniper oferece um{' '}
							<strong className="text-accent-emerald">
								Ãndice de Sharpe 8x superior
							</strong>{' '}
							Ã  estratÃ©gia de volume puro, reduzindo o risco de prejuÃ­zo para &lt;3%
							enquanto mantÃ©m potencial de lucros de seis dÃ­gitos anuais.
						</p>
					</div>
				</GlassPanel>
			</div>

			<SectionHeader
				step="02"
				label="FundamentaÃ§Ã£o"
				title="FundamentaÃ§Ã£o TeÃ³rica"
				description="A arbitragem do ICM no registro tardio, o custo da diluiÃ§Ã£o e o fator Small Field."
			/>
			<div className="max-w-300 mx-auto px-6 pb-12">
				<GlassPanel className="p-8 sm:p-12 lg:p-16">
					<div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
						<h3 className="text-text-bright font-heading">
							1.1 A Arbitragem do ICM no Registro Tardio
						</h3>
						<p>
							A base matemÃ¡tica da estratÃ©gia reside em uma ineficiÃªncia estrutural do
							ICM (<em>Independent Chip Model</em>) durante o perÃ­odo de registro
							tardio. Conforme jogadores sÃ£o eliminados e o torneio avanÃ§a, a equidade
							do prize pool Ã© redistribuÃ­da passivamente entre as stacks ainda ativas.
						</p>

						<div className="bg-accent-emerald/10 border-l-4 border-accent-emerald p-8 my-10 rounded-r-2xl">
							<h4 className="mt-0 text-accent-emerald font-bold text-lg mb-4 font-heading">
								EvidÃªncia Quantificada
							</h4>
							<p className="text-text-main leading-relaxed">
								SimulaÃ§Ãµes computacionais comprovam que uma stack inserida no
								momento de fechamento do registro possui um valor monetÃ¡rio ($EV)
								entre{' '}
								<strong className="text-text-bright">4,7% e 16,0% superior</strong>{' '}
								ao valor do buy-in. O registro tardio atua como um subsÃ­dio
								matemÃ¡tico: ROI base positivo antes que qualquer carta seja
								distribuÃ­da.
							</p>
							<p className="m-0 font-mono text-[0.8rem] text-accent-emerald-light">
								Ponto Ã³timo: entrada com 30-50bb (Late Reg 2x Average). Captura 5-8%
								de Ã¡gio sem a volatilidade de entrar com &lt;15bb.
							</p>
						</div>

						<h3 className="text-text-bright font-heading">
							1.2 O Custo da DiluiÃ§Ã£o (Deep Stack)
						</h3>
						<p>
							A decisÃ£o de registrar no NÃ­vel 1 (Deep Stack 100bb+) impÃµe um custo
							oculto: cada novo jogador que se registra dilui a equidade das stacks
							existentes em{' '}
							<strong className="text-text-bright">~0,28% por entrada</strong>. Um
							jogador que registra no Level 1 de um torneio com 500 entrantes pagou
							passivamente por 4 horas de diluiÃ§Ã£o antes de receber qualquer retorno
							competitivo.
						</p>

						<h3 className="text-text-bright font-heading">
							1.3 O Fator Small Field e a ReduÃ§Ã£o de VariÃ¢ncia
						</h3>
						<p>
							A variÃ¢ncia em MTTs nÃ£o Ã© linear; Ã©{' '}
							<strong className="text-text-bright">exponencial</strong> em relaÃ§Ã£o ao
							tamanho do field:
						</p>

						<div className="my-10 overflow-x-auto">
							<table className="w-full text-left border-collapse bg-bg-elevated/20 rounded-xl overflow-hidden">
								<thead>
									<tr className="border-b border-white/5 bg-white/5 text-text-bright uppercase text-[0.65rem] tracking-[0.15em] font-mono">
										<th className="py-4 px-6">Tamanho do Field</th>
										<th className="py-4 px-6">Probabilidade de FT</th>
										<th className="py-4 px-6">Impacto na Curva</th>
									</tr>
								</thead>
								<tbody className="text-sm text-text-muted">
									<tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
										<td className="py-4 px-6 text-text-main font-bold">
											3.000 jogadores (Large)
										</td>
										<td className="py-4 px-6 text-accent-rose font-mono">
											~0,3%
										</td>
										<td className="py-4 px-6">
											Downswings de centenas de buy-ins. Bankroll astronÃ´mico
											necessÃ¡rio.
										</td>
									</tr>
									<tr className="hover:bg-white/5 transition-colors">
										<td className="py-4 px-6 text-text-main font-bold">
											300 jogadores (Small)
										</td>
										<td className="py-4 px-6 text-accent-emerald font-mono">
											~3,3%
										</td>
										<td className="py-4 px-6">
											Fluxo de caixa constante. Curva de crescimento suave e
											previsÃ­vel.
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</GlassPanel>
			</div>

			{/* SimulaÃ§Ã£o e Resultados */}
			<SectionHeader
				step="03"
				label="Dados"
				title="Performance Financeira"
				description="SimulaÃ§Ãµes de Monte Carlo com 10.000 iteraÃ§Ãµes revelam a estabilidade do Protocolo Sniper."
			/>
			<div className="max-w-300 mx-auto px-6 pb-12">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<GlassPanel className="p-8">
						<h3 className="text-lg font-bold mb-6 text-text-bright font-heading">
							Vetor Semanal (Renda Fixa)
						</h3>
						<ul className="space-y-4 list-none pl-0">
							<li className="flex justify-between border-b border-white/5 pb-2 text-sm">
								<span className="text-text-dim uppercase tracking-wider text-[0.7rem] font-mono">
									AlocaÃ§Ã£o de Volume
								</span>
								<span className="text-text-main font-bold">92%</span>
							</li>
							<li className="flex justify-between border-b border-white/5 pb-2 text-sm">
								<span className="text-text-dim uppercase tracking-wider text-[0.7rem] font-mono">
									ROI Esperado
								</span>
								<span className="text-accent-emerald font-bold">30%</span>
							</li>
							<li className="flex justify-between border-b border-white/5 pb-2 text-sm">
								<span className="text-text-dim uppercase tracking-wider text-[0.7rem] font-mono">
									Desvio PadrÃ£o
								</span>
								<span className="text-text-main font-bold">70 BI</span>
							</li>
						</ul>
					</GlassPanel>
					<GlassPanel className="p-8">
						<h3 className="text-lg font-bold mb-6 text-text-bright font-heading">
							Vetor Domingo (Venture Capital)
						</h3>
						<ul className="space-y-4 list-none pl-0">
							<li className="flex justify-between border-b border-white/5 pb-2 text-sm">
								<span className="text-text-dim uppercase tracking-wider text-[0.7rem] font-mono">
									AlocaÃ§Ã£o de Volume
								</span>
								<span className="text-text-main font-bold">8%</span>
							</li>
							<li className="flex justify-between border-b border-white/5 pb-2 text-sm">
								<span className="text-text-dim uppercase tracking-wider text-[0.7rem] font-mono">
									ROI Esperado
								</span>
								<span className="text-accent-emerald font-bold">40%</span>
							</li>
							<li className="flex justify-between border-b border-white/5 pb-2 text-sm">
								<span className="text-text-dim uppercase tracking-wider text-[0.7rem] font-mono">
									Desvio PadrÃ£o
								</span>
								<span className="text-text-main font-bold">130 BI</span>
							</li>
						</ul>
					</GlassPanel>
				</div>
			</div>

			<SectionHeader
				step="04"
				label="Veredito"
				title="A EstratÃ©gia Barbell"
				description="A eliminaÃ§Ã£o do meio-termo medÃ­ocre e a busca pela convexidade positiva. Q.E.D."
			/>
			<div className="max-w-300 mx-auto px-6 pb-24">
				<GlassPanel className="p-8 sm:p-12 lg:p-16">
					<div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
						<p>
							A validaÃ§Ã£o cientÃ­fica aponta que o sucesso do modelo reside na
							aplicaÃ§Ã£o da{' '}
							<strong className="text-text-bright">
								Teoria da Convexidade de Nassim Taleb
							</strong>{' '}
							(Barbell Strategy) ao poker:
						</p>

						<div className="bg-bg-elevated/50 border border-accent-emerald/20 p-8 my-10 rounded-2xl">
							<p className="font-mono text-[0.7rem] text-accent-emerald uppercase tracking-[0.2em] mb-4">
								Q.E.D. â€” Quod Erat Demonstrandum
							</p>
							<p className="text-xl text-text-bright font-medium leading-relaxed mb-6">
								O Protocolo Sniper Ã© estatisticamente superior para a construÃ§Ã£o de
								carreira sustentÃ¡vel.
							</p>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
								<div className="text-sm">
									<strong className="text-text-main block mb-2 font-heading tracking-wide">
										EficiÃªncia & Longevidade
									</strong>
									<p className="m-0 leading-relaxed">
										Captura Ã¡gio via arbitragem de ICM e previne o burnout
										inerente aos modelos de volume insano.
									</p>
								</div>
								<div className="text-sm">
									<strong className="text-text-main block mb-2 font-heading tracking-wide">
										Assimetria de Retorno
									</strong>
									<p className="m-0 leading-relaxed">
										O domingo destrava a cauda longa (Big Hits) sem expor o
										capital a riscos de ruÃ­na irracionais.
									</p>
								</div>
							</div>
						</div>
					</div>
				</GlassPanel>
			</div>

			<div className="max-w-300 mx-auto px-6 pb-24">
				<div className="flex justify-between border-t border-white/5 pt-12">
					<Link
						href="/biblioteca/smart-sniper"
						className="text-accent-indigo-light text-sm font-bold flex items-center gap-2 hover:text-text-bright transition-colors"
					>
						<i className="fa-solid fa-arrow-left" /> PROTOCOLO SMART SNIPER
					</Link>
					<Link
						href="/biblioteca/estado-da-arte"
						className="text-accent-indigo-light text-sm font-bold flex items-center gap-2 hover:text-text-bright transition-colors"
					>
						ESTADO DA ARTE <i className="fa-solid fa-arrow-right" />
					</Link>
				</div>
			</div>
		</div>
	);
}

