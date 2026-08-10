/**
 * IDENTITY: Entendendo o ICM e suas Heurísticas GOLD
 * PATH: src/app/biblioteca/entendendo-o-icm-e-suas-heuristicas/page.tsx
 * ROLE: Artigo técnico sobre Risk Premium, Amortização de Edge e Downward Drift.
 * VERSION: v7.0 GOLD
 */

import ContentFooter from '@/components/ui/layout/ContentFooter';
import { SectionHeader } from '@/components/ui/layout/SectionHeader';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import JsonLd from '@/components/seo/JsonLd';
import Image from 'next/image';
import { ROUTES } from '@/constants/routes';
import { SITE_CONFIG } from '@/constants/site';

export const metadata = {
	title: 'Entendendo o ICM e suas Heurísticas | Raphael Vitoi',
	description:
		'Aprofundamento em Risk Premium, Downward Drift e a Perspectiva Matemática aplicada ao pós-flop.',
};

const articleSchema = {
	'@context': 'https://schema.org',
	'@type': 'TechArticle',
	headline: 'Entendendo o ICM e suas Heurísticas',
	description:
		'Uma desconstrução da Perspectiva Matemática: como o Risk Premium e o Downward Drift organizam o equilíbrio pós-flop.',
	author: { '@type': 'Person', name: 'Raphael Vitoi' },
};

export default function EntendendoIcmPage() {
	const articleUrl = `${SITE_CONFIG.baseUrl}${ROUTES.LIBRARY.ENTENDENDO_ICM}`;
	const articleTitle = `Entendendo o ICM e suas Heurísticas | ${SITE_CONFIG.author}`;

	return (
		<div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body">
			<JsonLd data={articleSchema} />

			<ContentPageHeader
				title="Entendendo o ICM"
				subtitle="Risk Premium, Amortização de Edge e Downward Drift. A física do jogo sob pressão monetária."
				category="Teoria"
				icon="fa-brain"
			/>

			<SectionHeader
				step="01"
				label="Fundação"
				title="Antevisão e a Fronteira do Edge"
				description="A vantagem competitiva migrou para o ICM pós-flop e para a capacidade de projetar o fluxo sistêmico."
			/>
			<div className="sota-container pb-12">
				<GlassPanel className="p-8 sm:p-12 lg:p-16">
					<div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
						<blockquote className="border-l-4 border-accent-indigo pl-6 italic text-text-bright my-8">
							&quot;Aprenda como interpretar o RP e de que maneira podemos usá-lo a
							nosso favor pós-flop através da Perspectiva Matemática.&quot;
						</blockquote>
						<p>
							Tabelas de push/fold são commodities. A verdadeira vantagem estratégica
							reside na <strong className="text-text-bright">Antevisão</strong>: a
							habilidade de olhar para uma mesa e ver o &quot;campo de força&quot; do
							Risk Premium antes das cartas serem distribuídas.
						</p>
						<h4 className="text-text-main font-heading mt-10 mb-4">
							Variáveis Sistêmicas:
						</h4>
						<ul className="space-y-3 list-none pl-0">
							<li className="flex items-start gap-3">
								<i className="fa-solid fa-circle-nodes text-accent-indigo mt-1.5 text-xs" />{' '}
								<span>
									<strong className="text-text-bright">
										Erosão Antecipada (t-3):
									</strong>{' '}
									Como saltos de blinds degradam o valor do fold presente.
								</span>
							</li>
							<li className="flex items-start gap-3">
								<i className="fa-solid fa-circle-nodes text-accent-indigo mt-1.5 text-xs" />{' '}
								<span>
									<strong className="text-text-bright">
										Vizinhança Estratégica:
									</strong>{' '}
									O impacto do perfil das stacks à sua esquerda.
								</span>
							</li>
							<li className="flex items-start gap-3">
								<i className="fa-solid fa-circle-nodes text-accent-indigo mt-1.5 text-xs" />{' '}
								<span>
									<strong className="text-text-bright">
										Antipoiese do Sistema:
									</strong>{' '}
									O torneio como organismo que se auto-organiza em torno das
									colisões.
								</span>
							</li>
						</ul>
					</div>
				</GlassPanel>
			</div>

			<SectionHeader
				step="02"
				label="Motor"
				title="O Teto do Risk Premium"
				description="Representa a equity adicional necessária para justificar o risco existencial de um confronto."
			/>
			<div className="sota-container pb-12">
				<GlassPanel className="p-8 sm:p-12 lg:p-16">
					<div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
						<div className="bg-bg-elevated/50 border border-accent-rose/20 p-8 my-10 rounded-2xl">
							<h4 className="mt-0 text-accent-rose font-bold text-lg mb-4 font-heading">
								Âncora de Vitoi (24% RP)
							</h4>
							<p className="m-0 leading-relaxed text-sm">
								Acima de{' '}
								<strong className="text-text-bright">24% de Risk Premium</strong>, a
								MDF (Minimum Defense Frequency) do defensor colapsa. He enters in
								state of{' '}
								<strong className="text-text-bright">Impotência Teórica</strong>:
								the agressor can bluff with &quot;absurd&quot; frequencies and the
								fold still remains as the only Nash-balanced decision.
							</p>
						</div>

						<h3 className="text-text-bright font-heading mt-12 mb-6 text-2xl">
							Toy Games: Visualizando a Distorção
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-10">
							<figure className="group">
								<div className="relative aspect-video rounded-2xl overflow-hidden border border-white/5">
									<Image
										src="/images/aulas/entendendo-o-icm-e-suas-heuristicas/image1.png"
										alt="Toy Game 1 - Chip EV"
										fill
										sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
										className="object-cover group-hover:scale-105 transition-transform duration-700"
									/>
								</div>
								<figcaption className="text-center text-[0.6rem] text-text-dim mt-4 uppercase tracking-widest font-mono">
									Toy Game 1: Equilíbrio estável em ChipEV
								</figcaption>
							</figure>

							<figure className="group">
								<div className="relative aspect-video rounded-2xl overflow-hidden border border-accent-rose/30 shadow-[0_0_30px_rgba(225,29,72,0.1)]">
									<Image
										src="/images/aulas/entendendo-o-icm-e-suas-heuristicas/image6.png"
										alt="Toy Game 5 - O Colapso da MDF"
										fill
										sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
										className="object-cover group-hover:scale-105 transition-transform duration-700"
									/>
								</div>
								<figcaption className="text-center text-[0.6rem] text-accent-rose-light mt-4 uppercase tracking-widest font-mono font-bold">
									Toy Game 5: Colapso sob RP 24% (Opressão Nash)
								</figcaption>
							</figure>
						</div>
					</div>
				</GlassPanel>
			</div>

			<SectionHeader
				step="03"
				label="Heurística"
				title="Downward Drift e Insolvência"
				description="As Pot Odds são métricas de baixa resolução. O Ci revela quando odds 'boas' são destrutivas."
			/>
			<div className="sota-container pb-24">
				<GlassPanel className="p-8 sm:p-12 lg:p-16">
					<div className="prose prose-invert prose-lg max-w-none text-text-muted font-body">
						<p>
							O <strong className="text-text-bright">Downward Drift</strong>{' '}
							(O&apos;Kearney & Carter) é a manifestação física do RP nos sizings: a
							distribuição inteira de apostas desloca um degrau para baixo. Overbets
							desaparecem; 2/3 vira 1/3; 1/3 vira check.
						</p>

						<div className="bg-accent-emerald/10 border-l-4 border-accent-emerald p-8 my-10 rounded-r-2xl">
							<h4 className="mt-0 text-accent-emerald font-bold text-lg mb-4 font-heading italic">
								Coeficiente de Insolvência (Ci)
							</h4>
							<p className="font-mono text-sm text-accent-emerald-light mb-4">
								Ci = Perspectiva / Pot_Odds
							</p>
							<p className="text-text-main m-0 leading-relaxed text-sm">
								Se <strong className="text-text-bright">Ci &lt; 1</strong>, as pot
								odds são mentirosas. Elas incentivam a entrada em potes cujas
								Reverse Implied Odds (RIO) e pressões de ICM tornam o investimento
								insolvente no longo prazo.
							</p>
						</div>
					</div>
				</GlassPanel>
			</div>

			<div className="sota-container pb-12">
				<ContentFooter
					shareTitle={articleTitle}
					shareUrl={articleUrl}
					backLinkHref={ROUTES.BIBLIOTECA}
					backLinkText="Voltar para Biblioteca"
				/>
			</div>
		</div>
	);
}
