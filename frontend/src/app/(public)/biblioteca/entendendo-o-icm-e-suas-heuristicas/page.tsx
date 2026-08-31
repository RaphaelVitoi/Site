/**
 * IDENTITY: Entendendo o ICM e suas Heurísticas - Masterclass & Tratado Teórico
 * PATH: src/app/(public)/biblioteca/entendendo-o-icm-e-suas-heuristicas/page.tsx
 * ROLE: Artigo canônico de Raphael Vitoi com todos os 21 prints do PioSolver e ICMIZER,
 *       demonstrando os Toy Games de Risk Premium, o Teto do RP e o Paradoxo da Mesa como Organismo Vivo.
 */

import ContentFooter from '@/components/ui/layout/ContentFooter';
import { SectionHeader } from '@/components/ui/layout/SectionHeader';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import JsonLd from '@/components/seo/JsonLd';
import { PmevRangeViewer } from '@/components/simulator/PmevRangeViewer';
import { ROUTES } from '@/constants/routes';
import { SITE_CONFIG } from '@/constants/site';

export const metadata = {
	title: 'Entendendo o ICM e suas Heurísticas | Raphael Vitoi',
	description:
		'Aprenda como interpretar o RP e de que maneira podemos usá-lo a nosso favor pós-flop através dos Toy Games de PioSolver e da Perspectiva Matemática.',
};

const articleSchema = {
	'@context': 'https://schema.org',
	'@type': 'TechArticle',
	headline: 'Entendendo o ICM e suas Heurísticas',
	description:
		'Estudo completo de Raphael Vitoi sobre Risk Premium, o Teto do RP, a subversão da MDF clássica e o Paradoxo da Mesa Final como Organismo Vivo.',
	author: { '@type': 'Person', name: 'Raphael Vitoi' },
};

interface ImageFigureProps {
	readonly src: string;
	readonly alt: string;
	readonly caption: string;
	readonly highlight?: boolean;
}

function ImageFigure({ src, alt, caption, highlight = false }: ImageFigureProps) {
	return (
		<figure className={`my-6 rounded-2xl overflow-hidden border transition-all ${
			highlight ? 'border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.15)] bg-slate-950' : 'border-slate-800/80 bg-slate-950/80'
		}`}>
			<div className="w-full flex items-center justify-center p-3 bg-slate-950">
				<img
					src={src}
					alt={alt}
					width={800}
					height={450}
					loading="lazy"
					decoding="async"
					className="w-auto max-h-95 max-w-full rounded-lg object-contain shadow-md"
				/>
			</div>
			<figcaption className="p-3 text-center text-xs text-slate-400 border-t border-slate-800/80 font-medium bg-slate-900/60">
				{caption}
			</figcaption>
		</figure>
	);
}

export default function EntendendoIcmPage() {
	return (
		<div className="min-h-screen bg-[#07090e] text-slate-200 overflow-x-hidden font-body">
			<JsonLd data={articleSchema} />

			<ContentPageHeader
				title="Entendendo o ICM e suas Heurísticas"
				subtitle="Aprenda como interpretar o RP e de que maneira podemos usá-lo a nosso favor pós-flop"
				category="Teoria & Masterclass"
				icon="fa-brain"
			/>

			{/* Interactive Range Viewer & Toy Games Lab Embed */}
			<div className="sota-container py-8">
				<PmevRangeViewer />
			</div>

			{/* SEÇÃO 01: INTRODUÇÃO & ANTEVISÃO */}
			<SectionHeader
				step="01"
				label="Fundamentos"
				title="A Antevisão e a Fronteira do Edge Pós-Flop"
				description="Por que a vantagem competitiva real migrou do pré-flop mecânico para a interpretação do ICM pós-flop."
			/>
			<div className="sota-container pb-12">
				<GlassPanel className="p-8 sm:p-12 lg:p-16 bg-slate-900/40 border-slate-800">
					<div className="prose prose-invert prose-lg max-w-none text-slate-300 font-body leading-relaxed space-y-6">
						<blockquote className="border-l-4 border-amber-500 pl-6 italic text-white my-6 bg-amber-500/5 p-4 rounded-r-2xl">
							&quot;Nesta aula, Raphael Vitoi aborda de maneira clara e objetiva alguns conceitos essenciais do ICM (Independent Chip Model) utilizando toy-games sofisticados para destacar teorias de alto Risk Premium (RP). O ICM pós-flop é muito mais complexo e contra-intuitivo do que muitos imaginam, revelando uma grande oportunidade de ganho de vantagem competitiva (Edge).&quot;
						</blockquote>

						<p>
							Um dos aspectos fundamentais abordados é a <strong className="text-white font-bold">&quot;Antevisão&quot;</strong>. Hoje em dia, o conhecimento teórico sobre poker está muito mais acessível através de solucionadores (SOLVERS) e trackers rigorosos como o Hand2Note. Essas ferramentas permitem que analistas desvendem os desvios populacionais através de MDA (Análise Massiva de Database).
						</p>

						<p>
							Embora os jogadores estejam se aprimorando teoricamente, ainda existem áreas negligenciadas, especialmente o <strong className="text-amber-400 font-bold">ICM Pós-Flop</strong>, onde muitas fraquezas são perceptíveis mesmo entre profissionais regulares que ainda utilizam exercícios baseados em ChipEV para treinar. Fora das situações de heads-up, praticamente todas as fases do poker são influenciadas pelo ICM — desde a primeira mão até as etapas críticas como a bolha, Semi-FTs e as Mesas Finais.
						</p>

						<div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl my-8">
							<h4 className="text-lg font-bold text-white mb-3">Considerações Cruciais sobre o Uso de Solvers</h4>
							<ul className="space-y-2 text-sm text-slate-300 list-disc pl-5">
								<li>Solvers são uma forma de inteligência artificial que operam dentro das restrições de árvore de decisão fornecidas pelo usuário.</li>
								<li>Solvers têm dificuldade em incorporar elementos subjetivos como imagem da mesa, tells, FGS, Edge e pressões psicológicas.</li>
								<li>O foco do estudante não deve ser memorizar soluções isoladas, mas sim interpretar a <strong>linguagem teórica</strong> e os objetivos de equilíbrio do solver.</li>
							</ul>
						</div>
					</div>
				</GlassPanel>
			</div>

			{/* SEÇÃO 02: GEOMETRIA DO RISK PREMIUM & VALUATION */}
			<SectionHeader
				step="02"
				label="Geometria do Risco"
				title="O Risk Premium (RP) e a Esperança Matemática"
				description="Cada stack reflete uma cota monetária do prizepool remanescente. Stacks colidem e influenciam toda a mesa."
			/>
			<div className="sota-container pb-12">
				<GlassPanel className="p-8 sm:p-12 lg:p-16 bg-slate-900/40 border-slate-800">
					<div className="prose prose-invert prose-lg max-w-none text-slate-300 font-body leading-relaxed space-y-6">
						<p>
							O <strong className="text-white">RP (Risk Premium)</strong> é a métrica central no ICM: representa a equity extra necessária para justificar uma jogada arriscada em virtude de as fichas perdidas valerem mais monetariamente do que as fichas ganhas.
						</p>

						<ImageFigure
							src="/images/aulas/entendendo-o-icm-e-suas-heuristicas/image1.png"
							alt="ICMIZER - Payouts e Avaliação de Stacks em Torneio de 10k BI"
							caption="Figura 1: Distribuição de Stacks e Valuations Monetários no ICMIZER. O Chip Leader tem valuation inferior ao 1º prêmio, e o short stack tem valuation superior ao último prêmio pela Esperança Matemática."
							highlight={true}
						/>

						<div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 my-6">
							<h4 className="text-amber-400 font-bold text-base mb-2">RP de Ida vs. RP de Volta (Vantagem de Risco)</h4>
							<p className="text-sm text-slate-300 m-0">
								Em um Single Raised Pot (SRP), denominamos o RP do jogador que abre como <em>&quot;RP de ida&quot;</em> e o do jogador que responde como <em>&quot;RP de volta&quot;</em>. A diferença entre eles é a <strong className="text-white">Vantagem ou Desvantagem de Risco</strong>. Se o RP de volta for o dobro do RP de ida, o jogador com menor RP pode exercer pressão substancial pré e pós-flop, enquanto o jogador com maior RP deve agir com extrema cautela.
							</p>
						</div>
					</div>
				</GlassPanel>
			</div>

			{/* SEÇÃO 03: PARTE I - TOY GAMES CLÁSSICOS CHIPEV & VANTAGEM DE RISCO */}
			<SectionHeader
				step="03"
				label="PioSolver Toy Games"
				title="Parte I — Toy Games Clássicos: ChipEV vs. Vantagem de Risco"
				description="Estrutura do Toy Game: IP (AA, QQ, JJ - 18 combos) vs OOP (KK - 6 combos). Pote: 100 fichas. Aposta: 100 fichas. Board: 22223."
			/>
			<div className="sota-container pb-12">
				<GlassPanel className="p-8 sm:p-12 lg:p-16 bg-slate-900/40 border-slate-800">
					<div className="prose prose-invert prose-lg max-w-none text-slate-300 font-body leading-relaxed space-y-8">
						{/* Toy Game 1 */}
						<div className="border-b border-slate-800 pb-8">
							<h3 className="text-xl font-black text-amber-400 mb-2">1. Toy Game 1 (ChipEV Puro)</h3>
							<p className="text-sm text-slate-300">
								No ChipEV, o IP possui 6 combos de valor (AA) e 3 combos de blefe (QQ/JJ), totalizando 9 combos de shove (50%). O OOP com KK paga exatamente 50% para neutralizar o EV dos blefes através da MDF clássica de Matthew Janda: α = 100 / (100+100) = 50%.
							</p>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
								<ImageFigure
									src="/images/aulas/entendendo-o-icm-e-suas-heuristicas/image2.png"
									alt="PioSolver Toy Game 1 - IP Strategy ChipEV"
									caption="Figura 2: IP Strategy ChipEV (6 combos AA valor, 3 combos QQ/JJ blefe = 50% Bet)."
								/>
								<ImageFigure
									src="/images/aulas/entendendo-o-icm-e-suas-heuristicas/image3.png"
									alt="PioSolver Toy Game 1 - OOP Strategy ChipEV"
									caption="Figura 3: OOP Strategy ChipEV (KK paga 50.01% e desiste 49.99% via MDF)."
								/>
							</div>
						</div>

						{/* Toy Game 2 */}
						<div className="border-b border-slate-800 pb-8">
							<h3 className="text-xl font-black text-amber-400 mb-2">2. Toy Game 2 (IP RP 3% vs OOP RP 6%)</h3>
							<p className="text-sm text-slate-300">
								Ambos possuem Risk Premium, mas o OOP corre o dobro do risco. O IP aproveita a vantagem de risco e expande seus blefes de 3 para 4.2 combinações (56.84% bet). O OOP começa a desistir mais (53.75% fold).
							</p>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
								<ImageFigure
									src="/images/aulas/entendendo-o-icm-e-suas-heuristicas/image4.png"
									alt="PioSolver Toy Game 2 - IP Strategy RP 3%"
									caption="Figura 4: IP Strategy (Blefes aumentam de 3 para 4.2 combos)."
								/>
								<ImageFigure
									src="/images/aulas/entendendo-o-icm-e-suas-heuristicas/image5.png"
									alt="PioSolver Toy Game 2 - OOP Strategy RP 6%"
									caption="Figura 5: OOP Strategy (KK defende 46.25% e desiste 53.75%)."
								/>
							</div>
						</div>

						{/* Toy Game 3 */}
						<div className="border-b border-slate-800 pb-8">
							<h3 className="text-xl font-black text-amber-400 mb-2">3. Toy Game 3 (IP RP 3% vs OOP RP 9%) — O Teto do RP</h3>
							<p className="text-sm text-slate-300">
								O IP expande seus blefes para 5.0 combos. No entanto, o OOP <strong className="text-white">não desiste mais do que no toy game anterior</strong>: ele defende 46.45%. Ele atingiu o <strong className="text-amber-400">Teto do Risk Premium</strong>.
							</p>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
								<ImageFigure
									src="/images/aulas/entendendo-o-icm-e-suas-heuristicas/image6.png"
									alt="PioSolver Toy Game 3 - IP Strategy RP 3%"
									caption="Figura 6: IP Strategy (Blefes expandidos para 5.0 combos = 61.09% Bet)."
									highlight={true}
								/>
								<ImageFigure
									src="/images/aulas/entendendo-o-icm-e-suas-heuristicas/image7.png"
									alt="PioSolver Toy Game 3 - OOP Strategy RP 9%"
									caption="Figura 7: OOP Strategy (KK atinge o Teto do RP e estabiliza em 46.45% Call)."
									highlight={true}
								/>
							</div>
						</div>

						{/* Toy Game 4 */}
						<div className="border-b border-slate-800 pb-8">
							<h3 className="text-xl font-black text-amber-400 mb-2">4. Toy Game 4 (IP RP 3% vs OOP RP 18%)</h3>
							<p className="text-sm text-slate-300">
								O IP aumenta ainda mais os blefes: 6 combos de valor vs 8 combos de blefe (14 combos = 76.92% shove). Em ChipEV, o KK pagaria 100% das vezes vs esse desbalanceamento, mas sob ICM, o KK continua pagando rigorosamente no Teto do RP (46.25%).
							</p>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
								<ImageFigure
									src="/images/aulas/entendendo-o-icm-e-suas-heuristicas/image8.png"
									alt="PioSolver Toy Game 4 - IP Strategy RP 3%"
									caption="Figura 8: IP Strategy (6 combos valor vs 8 combos blefe = 76.92% Bet)."
								/>
								<ImageFigure
									src="/images/aulas/entendendo-o-icm-e-suas-heuristicas/image9.png"
									alt="PioSolver Toy Game 4 - OOP Strategy RP 18%"
									caption="Figura 9: OOP Strategy (KK continua fiel ao Teto do RP defendendo 46.25%)."
								/>
							</div>
						</div>

						{/* Toy Game 5 */}
						<div>
							<h3 className="text-xl font-black text-amber-400 mb-2">5. Toy Game 5 (IP RP 3% vs OOP RP 24%) — Pressão Máxima</h3>
							<p className="text-sm text-slate-300">
								Com uma discrepância abissal de RP, o IP shova 93.17% de seu range (6 valor vs 10.8 blefes). O defensor KK não folda 100% nem paga 100%: mantém 46.10% de call. As respostas de Teoria dos Jogos em ICM nunca são extremas.
							</p>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
								<ImageFigure
									src="/images/aulas/entendendo-o-icm-e-suas-heuristicas/image10.png"
									alt="PioSolver Toy Game 5 - IP Strategy RP 3%"
									caption="Figura 10: IP Strategy (Shove com 93.17% do range total)."
								/>
								<ImageFigure
									src="/images/aulas/entendendo-o-icm-e-suas-heuristicas/image11.png"
									alt="PioSolver Toy Game 5 - OOP Strategy RP 24%"
									caption="Figura 11: OOP Strategy (Defesa no limite do Teto do RP com 46.10% Call)."
								/>
							</div>
						</div>
					</div>
				</GlassPanel>
			</div>

			{/* SEÇÃO 04: PARTE II - INVERTENDO O RP (O PARADOXO DO CHIP LEADER) */}
			<SectionHeader
				step="04"
				label="A Desconstrução"
				title="Parte II — Invertendo o RP: O Paradoxo do Chip Leader"
				description="O que acontece quando o agressor IP tem RP ALTO e o defensor OOP tem RP BAIXO?"
			/>
			<div className="sota-container pb-12">
				<GlassPanel className="p-8 sm:p-12 lg:p-16 bg-slate-900/40 border-slate-800">
					<div className="prose prose-invert prose-lg max-w-none text-slate-300 font-body leading-relaxed space-y-8">
						<blockquote className="border-l-4 border-rose-500 pl-6 italic text-white my-6 bg-rose-500/5 p-4 rounded-r-2xl">
							&quot;Agora segura essa bomba que Raphael Vitoi aponta: Quando o IP tem RP maior, ele continua shovando o range levemente inclinado a blefe, mas o OOP COM MENOR RISK PREMIUM PAGA CADA VEZ MENOS!&quot;
						</blockquote>

						{/* Inversão 1 */}
						<div className="border-b border-slate-800 pb-8">
							<h3 className="text-xl font-black text-rose-400 mb-2">1. Inversão 1 (IP RP 9% vs OOP RP 3%)</h3>
							<p className="text-sm text-slate-300">
								O IP shova 9.6 combos (53.33%). O OOP com baixíssimo RP (3%) desiste 60.07% das vezes (paga apenas 39.93%)!
							</p>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
								<ImageFigure
									src="/images/aulas/entendendo-o-icm-e-suas-heuristicas/image12.png"
									alt="PioSolver Inversão 1 - IP Strategy RP 9%"
									caption="Figura 12: IP com RP 9% shova 53.33% (9.6 combos)."
								/>
								<ImageFigure
									src="/images/aulas/entendendo-o-icm-e-suas-heuristicas/image13.png"
									alt="PioSolver Inversão 1 - OOP Strategy RP 3%"
									caption="Figura 13: OOP com RP 3% reduz call para 39.93% e folda 60.07%."
								/>
							</div>
						</div>

						{/* Inversão 2 */}
						<div className="border-b border-slate-800 pb-8">
							<h3 className="text-xl font-black text-rose-400 mb-2">2. Inversão 2 (IP RP 18% vs OOP RP 3%)</h3>
							<p className="text-sm text-slate-300">
								O IP tem 18% de RP (risco extremo) e continua shovando 53.35%. O OOP com 3% de RP passa a foldar 69.91% (call em apenas 30.09%).
							</p>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
								<ImageFigure
									src="/images/aulas/entendendo-o-icm-e-suas-heuristicas/image14.png"
									alt="PioSolver Inversão 2 - IP Strategy RP 18%"
									caption="Figura 14: IP com 18% de RP mantém o range de 9.6 combos."
								/>
								<ImageFigure
									src="/images/aulas/entendendo-o-icm-e-suas-heuristicas/image15.png"
									alt="PioSolver Inversão 2 - OOP Strategy RP 3%"
									caption="Figura 15: OOP com baixo RP aumenta fold para quase 70% (30.09% call)."
								/>
							</div>
						</div>

						{/* Inversão 3 */}
						<div>
							<h3 className="text-xl font-black text-rose-400 mb-2">3. Inversão 3 (IP RP 24% vs OOP RP 3%) — Over-fold Massivo (Quase 80%)</h3>
							<p className="text-sm text-slate-300">
								Com IP em 24% de RP, o OOP com RP de 3% atinge impressionantes <strong className="text-rose-400 font-black">76.90% de FOLD</strong>! A teoria da MDF clássica é completamente subvertida pela dinâmica de preservação de equidade global.
							</p>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
								<ImageFigure
									src="/images/aulas/entendendo-o-icm-e-suas-heuristicas/image16.png"
									alt="PioSolver Inversão 3 - IP Strategy RP 24%"
									caption="Figura 16: IP com RP de 24% shova 46.70% (8.4 combos)."
									highlight={true}
								/>
								<ImageFigure
									src="/images/aulas/entendendo-o-icm-e-suas-heuristicas/image17.png"
									alt="PioSolver Inversão 3 - OOP Strategy RP 3%"
									caption="Figura 17: OOP com RP de 3% atinge 76.90% de FOLD (Call em apenas 23.10%)."
									highlight={true}
								/>
							</div>
						</div>
					</div>
				</GlassPanel>
			</div>

			{/* SEÇÃO 05: A MESA COMO ORGANISMO VIVO */}
			<SectionHeader
				step="05"
				label="Exegese Sistêmica"
				title="A Mesa Final como Organismo Vivo"
				description="Simulações do ICMIZER provam por que perder 20bb destrói o CL e como terceiros se beneficiam das colisões."
			/>
			<div className="sota-container pb-24">
				<GlassPanel className="p-8 sm:p-12 lg:p-16 bg-slate-900/40 border-slate-800">
					<div className="prose prose-invert prose-lg max-w-none text-slate-300 font-body leading-relaxed space-y-8">
						<p>
							Para compreender por que o jogador em vantagem de fichas e menor RP prefere desistir de mãos lucrativas em ChipEV, Raphael Vitoi analisa três estados da mesma Mesa Final no ICMIZER:
						</p>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
							<ImageFigure
								src="/images/aulas/entendendo-o-icm-e-suas-heuristicas/image18.png"
								alt="ICMIZER Cenário Original 9 Players"
								caption="Figura 18: Cenário Original com 9 jogadores e stacks distribuídas."
							/>
							<ImageFigure
								src="/images/aulas/entendendo-o-icm-e-suas-heuristicas/image19.png"
								alt="ICMIZER Eliminando o rival de 20bb"
								caption="Figura 19: Oponente de 20bb eliminado (+20bb adicionadas ao CL)."
							/>
							<ImageFigure
								src="/images/aulas/entendendo-o-icm-e-suas-heuristicas/image20.png"
								alt="ICMIZER Dobrando o rival de 20bb"
								caption="Figura 20: Oponente de 20bb dobra sobre o CL (-20bb do CL)."
							/>
						</div>

						<ImageFigure
							src="/images/aulas/entendendo-o-icm-e-suas-heuristicas/image21.png"
							alt="Proporção de Ganho vs Perda de Valuation pelo CL"
							caption="Figura 21: Proporção assimétrica do valor de fichas que o CL ganha vs perde nos outcomes."
							highlight={true}
						/>

						<div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 space-y-4">
							<h4 className="text-amber-400 font-black text-lg mb-2">Conclusões Epistemológicas Centrais</h4>
							<ul className="space-y-3 text-sm text-slate-300 list-disc pl-5">
								<li><strong>As 20bb são nominais, mas a avaliação em $EV difere:</strong> Perder fichas contra stacks que nos afetam compromete permanentemente a capacidade de pressionar a mesa no futuro.</li>
								<li><strong>Dobrar o oponente alivia o ICM sobre TODA A MESA:</strong> Ao perder fichas, o CL reduz sua alavancagem, tornando os outros competidores mais livres para jogar.</li>
								<li><strong>Eliminar um short-stack distribui valor a terceiros:</strong> Quando o CL elimina um jogador, o resto da mesa passivamente embolsa payjumps que já estavam probabilisticamente encaminhados para o CL.</li>
								<li><strong>A Responsabilidade da Esperança Matemática:</strong> Cada jogador tem a obrigação de realizar o $EV de sua stack sem assumir riscos desnecessários que transfiram riqueza aos adversários ausentes da mão.</li>
							</ul>
						</div>
					</div>
				</GlassPanel>
			</div>

			<ContentFooter
				shareTitle={`Entendendo o ICM e suas Heurísticas | ${SITE_CONFIG.author}`}
				shareUrl={`${SITE_CONFIG.baseUrl}${ROUTES.LIBRARY.ENTENDENDO_ICM}`}
				backLinkHref={ROUTES.BIBLIOTECA}
				backLinkText="Voltar para Biblioteca"
			/>
		</div>
	);
}
