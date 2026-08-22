/**
 * IDENTITY: Protocolo de avaliação do Smart Sniper (GOLD v7.0 GOLD)
 * PATH: src/app/biblioteca/validacao-smart-sniper/page.tsx
 * ROLE: Artigo acadêmico/técnico com análise de Monte Carlo, Sharpe e Barbell.
 */

import JsonLd from '@/components/seo/JsonLd';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { SectionHeader } from '@/components/ui/layout/SectionHeader';
import Link from 'next/link';

export const metadata = {
	title: 'Protocolo de Avaliação do Smart Sniper | Raphael Vitoi',
	description:
		'Desenho de avaliação para Monte Carlo, risco e portfólio em poker MTT. Resultados dependem de dados, versão e reprodução.',
};

const articleSchema = {
	'@context': 'https://schema.org',
	'@type': 'TechArticle',
	headline: 'Protocolo de Avaliação do Smart Sniper: v7.0 GOLD',
	description:
		'Desenho reprodutível para investigar estratégias de grind em MTTs com cenários e métricas explicitamente versionados.',
	author: { '@type': 'Person', name: 'Raphael Vitoi' },
};

export default function ValidacaoSmartSniperPage() {
	return (
		<div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body">
			<JsonLd data={articleSchema} />

			{/* Header Central de Página */}
			<div className="max-w-300 mx-auto px-6 pt-12">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
					<div>
						<h1 className="text-[clamp(2rem,5vw,3rem)] font-black m-0 tracking-tighter bg-linear-to-r from-text-bright to-text-dim bg-clip-text text-transparent font-heading">
							Otimização de Variância
						</h1>
						<p className="m-0 mt-4 text-[0.9rem] text-text-muted leading-relaxed max-w-145">
							Protocolo de avaliação do Smart Sniper. Desenho de Monte Carlo, índice de
							Sharpe e teoria de portfólio que ainda requer dados e reprodução pública.
						</p>
						<div className="flex flex-wrap items-center gap-4 mt-6">
							<span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-indigo/10 border border-accent-indigo/20 text-[0.65rem] font-bold text-accent-indigo-light uppercase tracking-widest font-mono">
								<span className="w-2 h-2 rounded-full bg-accent-emerald shadow-[0_0_8px_rgba(16,185,129,0.5)]" />{' '}
								Hipótese operacional
							</span>
							<span className="text-[0.7rem] text-text-dim font-bold font-mono uppercase tracking-widest">
								Revisão requerida
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
				description="Desenho para comparar abordagens de grind; nenhuma conclusão é declarada antes dos artefatos executáveis."
			/>
			<div className="max-w-300 mx-auto px-6 pb-12">
				<GlassPanel className="p-8 sm:p-12 lg:p-16">
					<div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
						<p>
							Este é um protocolo de pesquisa, não um resultado publicado. Ele propõe
							comparar alto volume com o{' '}
							<strong className="text-text-bright">Smart Sniper</strong> — seleção de
							fields, horário de entrada e alocação de bankroll — em cenários fixados.
							Antes de afirmar superioridade, o estudo deve publicar código, seed, base de
							dados, rake, estrutura de premiação, modelo de habilidade, número de
							iterações e intervalos de confiança.
						</p>
					</div>
				</GlassPanel>
			</div>

			<SectionHeader
				step="02"
				label="Fundamentação"
				title="Fundamentação Teórica"
				description="A arbitragem do ICM no registro tardio, o custo da diluição e o fator Small Field."
			/>
			<div className="max-w-300 mx-auto px-6 pb-12">
				<GlassPanel className="p-8 sm:p-12 lg:p-16">
					<div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
						<h3 className="text-text-bright font-heading">
							1.1 A Arbitragem do ICM no Registro Tardio
						</h3>
						<p>
							A base matemática da estratégia reside em uma ineficiência estrutural do
							ICM (<em>Independent Chip Model</em>) durante o período de registro
							tardio. Conforme jogadores são eliminados e o torneio avança, a equidade
							do prize pool é redistribuída passivamente entre as stacks ainda ativas.
						</p>

						<div className="bg-accent-emerald/10 border-l-4 border-accent-emerald p-8 my-10 rounded-r-2xl">
							<h4 className="mt-0 text-accent-emerald font-bold text-lg mb-4 font-heading">
								Benchmark H9 a executar
							</h4>
							<p className="text-text-main leading-relaxed">
								A entrada tardia deve ser medida sob conservação explícita de payout:
								compare o estado antes, a stack do entrante, a contribuição líquida e o
								estado após a entrada. Vantagem de registro não é presumida; ela pode
								variar ou desaparecer com rake, overlay, bounties, blinds e habilidade.
							</p>
							<p className="m-0 font-mono text-[0.8rem] text-accent-emerald-light">
								Parâmetros candidatos (profundidade, horário e field) devem ser pré-registados
								e avaliados com intervalo de confiança, não apresentados como ponto ótimo.
							</p>
						</div>

						<h3 className="text-text-bright font-heading">
							1.2 O Custo da Diluição (Hipótese)
						</h3>
						<p>
							A entrada no Nível 1 pode expor a stack a mudanças de field e prize pool,
							mas o efeito depende de stacks, payout, contribuição e regras. A taxa de
							diluição precisa ser derivada para cada evento; nenhum percentual fixo deve
							ser extrapolado como regra geral.
						</p>

						<h3 className="text-text-bright font-heading">
							1.3 O Fator Small Field e a Redução de Variância
						</h3>
						<p>
							O tamanho do field afeta distribuição de retornos, mas a forma e a magnitude
							dependem de payout, edge, rake e volume. A tabela abaixo é um molde de
							benchmark, não uma estimativa publicada:
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
											A medir
										</td>
										<td className="py-4 px-6">
											Estimar por simulação parametrizada e intervalo de confiança.
										</td>
									</tr>
									<tr className="hover:bg-white/5 transition-colors">
										<td className="py-4 px-6 text-text-main font-bold">
											300 jogadores (Small)
										</td>
										<td className="py-4 px-6 text-accent-emerald font-mono">
											A medir
										</td>
										<td className="py-4 px-6">
											Estimar por simulação parametrizada e intervalo de confiança.
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</GlassPanel>
			</div>

			{/* Simulação e Resultados */}
			<SectionHeader
				step="03"
				label="Dados"
				title="Performance Financeira"
				description="Campos de resultado reservados: serão preenchidos apenas por execução reproduzível com artefatos publicados."
			/>
			<div className="max-w-300 mx-auto px-6 pb-12">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<GlassPanel className="p-8">
						<h3 className="text-lg font-bold mb-6 text-text-bright font-heading">
							Cenário semanal (a parametrizar)
						</h3>
						<ul className="space-y-4 list-none pl-0">
							<li className="flex justify-between border-b border-white/5 pb-2 text-sm">
								<span className="text-text-dim uppercase tracking-wider text-[0.7rem] font-mono">
									Alocação de Volume
								</span>
									<span className="text-text-main font-bold">A definir</span>
							</li>
							<li className="flex justify-between border-b border-white/5 pb-2 text-sm">
								<span className="text-text-dim uppercase tracking-wider text-[0.7rem] font-mono">
									ROI Esperado
								</span>
									<span className="text-accent-emerald font-bold">A medir</span>
							</li>
							<li className="flex justify-between border-b border-white/5 pb-2 text-sm">
								<span className="text-text-dim uppercase tracking-wider text-[0.7rem] font-mono">
									Desvio Padrão
								</span>
									<span className="text-text-main font-bold">A medir</span>
							</li>
						</ul>
					</GlassPanel>
					<GlassPanel className="p-8">
						<h3 className="text-lg font-bold mb-6 text-text-bright font-heading">
							Cenário de domingo (a parametrizar)
						</h3>
						<ul className="space-y-4 list-none pl-0">
							<li className="flex justify-between border-b border-white/5 pb-2 text-sm">
								<span className="text-text-dim uppercase tracking-wider text-[0.7rem] font-mono">
									Alocação de Volume
								</span>
									<span className="text-text-main font-bold">A definir</span>
							</li>
							<li className="flex justify-between border-b border-white/5 pb-2 text-sm">
								<span className="text-text-dim uppercase tracking-wider text-[0.7rem] font-mono">
									ROI Esperado
								</span>
									<span className="text-accent-emerald font-bold">A medir</span>
							</li>
							<li className="flex justify-between border-b border-white/5 pb-2 text-sm">
								<span className="text-text-dim uppercase tracking-wider text-[0.7rem] font-mono">
									Desvio Padrão
								</span>
									<span className="text-text-main font-bold">A medir</span>
							</li>
						</ul>
					</GlassPanel>
				</div>
			</div>

			<SectionHeader
				step="04"
				label="Veredito"
				title="A Estratégia Barbell"
				description="Hipótese de portfólio a testar contra baseline, com métricas, incerteza e critérios de falsificação explícitos."
			/>
			<div className="max-w-300 mx-auto px-6 pb-24">
				<GlassPanel className="p-8 sm:p-12 lg:p-16">
					<div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
						<p>
							A hipótese estratégica é que uma aplicação disciplinada da{' '}
							<strong className="text-text-bright">
								Teoria da Convexidade de Nassim Taleb
							</strong>{' '}
							(Barbell Strategy) ao poker:
						</p>

						<div className="bg-bg-elevated/50 border border-accent-emerald/20 p-8 my-10 rounded-2xl">
							<p className="font-mono text-[0.7rem] text-accent-emerald uppercase tracking-[0.2em] mb-4">
								Critério de falsificação
							</p>
							<p className="text-xl text-text-bright font-medium leading-relaxed mb-6">
								O protocolo só poderá ser chamado superior se superar o baseline pré-definido
								em retorno ajustado ao risco, com incerteza reportada e reprodução independente.
							</p>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
								<div className="text-sm">
									<strong className="text-text-main block mb-2 font-heading tracking-wide">
										Eficiência & Longevidade
									</strong>
									<p className="m-0 leading-relaxed">
										Avalia retorno, risco de ruína e carga operacional sem assumir arbitragem.
									</p>
								</div>
								<div className="text-sm">
									<strong className="text-text-main block mb-2 font-heading tracking-wide">
										Assimetria de Retorno
									</strong>
									<p className="m-0 leading-relaxed">
										Mede a contribuição de cenários de maior variância com controle de bankroll.
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
