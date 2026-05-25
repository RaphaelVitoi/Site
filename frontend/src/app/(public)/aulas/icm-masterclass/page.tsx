/**
 * IDENTITY: Geometria do Risco SOTA GOLD
 * PATH: src/app/aulas/icm-masterclass/page.tsx
 * ROLE: Framework matemático do ICM pós-flop. Teoria densa e colapso da MDF.
 * PRINCIPLE: Excelência Teórica & Fluidez Sofisticada.
 * VERSION: v6.2.1 GOLD
 */

import ContentFooter from '@/components/ui/layout/ContentFooter';
import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import JsonLd from '@/components/seo/JsonLd';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { SectionHeader } from '@/components/ui/layout/SectionHeader';

export const metadata = {
	title: 'Geometria do Risco GOLD | Raphael Vitoi',
	description:
		'O framework matemático do ICM pós-flop v6.2.1: Risk Premium, ΔRP, Perspectiva Matemática e o colapso da MDF.',
};

const articleSchema = {
	'@context': 'https://schema.org',
	'@type': 'TechArticle',
	headline: 'Geometria do Risco GOLD: O Framework Matemático do ICM Pós-Flop',
	description:
		'Uma desconstrução profunda da física do poker sob pressão de ICM, introduzindo conceitos de Risk Premium e Perspectiva Matemática.',
	author: { '@type': 'Person', name: 'Raphael Vitoi' },
};

const metrics = [
	{
		label: 'Assimetria Fundamental',
		value: 'Fichas perdidas > ganhas',
		detail: 'A base da stack vale mais que o topo — concavidade irredutível. É a origem de toda distorção no equilíbrio.',
	},
	{
		label: 'Risk Premium (RP)',
		value: '0% a ~24%',
		detail: 'Equity adicional necessária para justificar um call. Acima deste teto, a defesa racional colapsa.',
	},
	{
		label: 'Bubble Factor (BF)',
		value: 'Multiplicador da Dor',
		detail: 'O coeficiente que escala o custo da eliminação. BF = 100 / (100 - RP).',
	},
	{
		label: 'ΔRP — Diferencial',
		value: 'RP_IP − RP_OOP',
		detail: 'O diferencial que dita quem detém a iniciativa e quem é forçado à passividade estrutural.',
	},
	{
		label: 'Downward Drift',
		value: 'RP↑ → Sizing↓',
		detail: 'A migração gravitacional dos sizings para faixas menores conforme a pressão monetária aumenta.',
	},
	{
		label: 'Regra de Ouro',
		value: 'RPs nunca são iguais',
		detail: 'Em qualquer colisão, um jogador detém vantagem estrutural de risco. A neutralidade é uma ilusão.',
	},
];

export default function AulaICMPage() {
	const articleTitle = 'Geometria do Risco | Raphael Vitoi';
	const articleUrl = 'https://www.pokerracional.com/aulas/icm-masterclass';

	return (
		<div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body pb-24">
			<JsonLd data={articleSchema} />

			<ContentPageHeader
				title="Geometria do Risco"
				subtitle="A desconstrução do pós-flop sob a ótica do ICM. O mapeamento estrutural da colisão e a física da Perspectiva Matemática."
				category="Masterclass"
				icon="fa-shapes"
			/>

			<div className="sota-container -mt-8 pb-12">
				<blockquote className="border-l-4 border-accent-indigo pl-8 py-4 italic text-text-muted text-xl bg-white/2 rounded-r-2xl">
					&quot;O poker é uma ciência de informação incompleta jogada por humanos falhos.
					Num cenário de extrema pressão financeira, as fichas deixam de ser plástico e
					passam a representar a perspectiva de sobrevivência.&quot;{' '}
					<cite className="block mt-4 text-[0.6rem] font-black text-text-darker uppercase tracking-widest not-italic font-mono">
						— Raphael Vitoi, A Geometria do Risco
					</cite>
				</blockquote>
			</div>

			<SectionHeader
				step="01"
				label="Fundamentos"
				title="Grandezas do Sistema"
				description="RP, BF, ΔRP e Downward Drift não são metáforas — são grandezas calculáveis que governam o equilíbrio de Nash."
			/>

			<div className="sota-container pb-12">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{metrics.map((metric) => (
						<div
							key={metric.label}
							className="p-6 rounded-3xl bg-white/2 border border-white/5 hover:border-accent-indigo/30 transition-all group"
						>
							<p className="text-accent-indigo-light text-[0.55rem] font-black uppercase tracking-widest mb-3 font-mono">
								{metric.label}
							</p>
							<strong className="text-text-bright text-xl block mb-3 font-heading tracking-tighter">
								{metric.value}
							</strong>
							<p className="text-text-muted text-xs leading-relaxed m-0 opacity-70 group-hover:opacity-100 transition-opacity">
								{metric.detail}
							</p>
						</div>
					))}
				</div>
			</div>

			<SectionHeader
				step="02"
				label="Doutrina"
				title="A Ilusão do Vácuo"
				description="Por que solvers tradicionais não resolvem mesas finais e como a matemática oculta subverte a teoria clássica."
			/>

			<div className="sota-container pb-12">
				<GlassPanel className="p-8 sm:p-12 lg:p-16">
					<div className="prose prose-invert prose-lg max-w-none text-text-muted">
						<p>
							Solvers maximizam ChipEV — assumem que cada ficha vale o mesmo. Em cash
							game, isso é correto. Em torneio, é sistematicamente falso: a última
							ficha (base da stack) vale mais do que a primeira (topo). O{' '}
							<strong className="text-text-bright">Risk Premium</strong> quantifica
							essa assimetria por jogador, por spot. Ignorar o RP não é &ldquo;jogar
							GTO&rdquo; — é jogar um jogo diferente do que está acontecendo.
						</p>

						<div className="bg-accent-amber/10 border-l-4 border-accent-amber p-8 my-10 rounded-r-2xl">
							<h4 className="mt-0 text-accent-amber font-bold text-lg mb-4 font-heading italic text-shadow-glow">
								Heads-Up: O Pote vs. O Final
							</h4>
							<p className="text-text-main m-0 leading-relaxed text-sm">
								Um pote heads-up com 9 jogadores ativos{' '}
								<strong className="text-text-bright">
									continua sujeito a pressões letais de ICM
								</strong>
								. Apenas no confronto final (Top 2), o modelo reverte para ChipEV
								puro. Fora isso, a sombra dos outros adversários impõe uma lei
								marcial matemática.
							</p>
						</div>

						<p>
							O <strong className="text-text-bright">Downward Drift</strong>{' '}
							(O&apos;Kearney &amp; Carter) é o mecanismo de transmissão: sob RP
							crescente, a distribuição de apostas migra para sizes menores. Overbets
							desaparecem. 2/3 pot vira 1/3. 1/3 vira check. A{' '}
							<strong className="text-text-bright">Perspectiva Matemática</strong>{' '}
							governa o quanto de risco cada jogador pode absorver por street.
						</p>
					</div>
				</GlassPanel>
			</div>

			{/* ARQUÉTIPOS CLÍNICOS DO ICM */}
			<SectionHeader
				step="03"
				label="Morfologia"
				title="Os 5 Arquétipos Clínicos"
				description="Padrões comportamentais GTO contra-intuitivos ditados pela gravidade da utilidade não-linear."
			/>

			<div className="sota-container pb-12">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Arquétipo I */}
					<div className="p-8 rounded-3xl bg-white/2 border border-white/5 border-t-4 border-t-accent-emerald hover:border-accent-emerald/30 hover:bg-white/4 transition-all group flex flex-col">
						<div className="flex items-center gap-4 mb-6">
							<div className="w-12 h-12 shrink-0 rounded-full bg-accent-emerald/10 flex items-center justify-center text-accent-emerald text-xl group-hover:scale-110 transition-transform duration-500">
								<i className="fa-solid fa-handshake" />
							</div>
							<div>
								<h3 className="text-xl font-black text-text-bright uppercase tracking-tighter m-0">
									O Pacto Silencioso
								</h3>
								<p className="text-[0.65rem] font-black text-accent-emerald-light uppercase tracking-widest m-0">
									Evitação de Ruína
								</p>
							</div>
						</div>
						<div className="space-y-4 text-sm text-text-muted leading-relaxed flex-1">
							<p>
								<strong className="text-text-main font-bold">Cenário:</strong> Chip
								Leader (70bb) vs Vice Chip Leader (65bb) numa mesa repleta de
								micro-stacks (10bb a 15bb).
							</p>
							<p>
								<strong className="text-text-main font-bold">O Paradoxo:</strong> Em
								ChipEV, duas stacks colossais atacariam-se impiedosamente. No ICM, o
								RP de ambos ultrapassa a barreira letal dos 20%.
							</p>
							<div className="mt-4 p-4 rounded-xl bg-accent-emerald/5 border border-accent-emerald/10">
								<p className="m-0 text-accent-emerald-light italic">
									<strong className="uppercase text-[0.6rem] tracking-widest block mb-1 not-italic opacity-70">
										Resolução Nash:
									</strong>{' '}
									A agressividade pré-flop desaparece. Ranges de flat call inflam
									massivamente, incluindo o topo (AK/QQ). Slowplays tornam-se
									vitais para não engordar o SPR para níveis irreversíveis.
								</p>
							</div>
						</div>
					</div>

					{/* Arquétipo II */}
					<div className="p-8 rounded-3xl bg-white/2 border border-white/5 border-t-4 border-t-accent-rose hover:border-accent-rose/30 hover:bg-white/4 transition-all group flex flex-col">
						<div className="flex items-center gap-4 mb-6">
							<div className="w-12 h-12 shrink-0 rounded-full bg-accent-rose/10 flex items-center justify-center text-accent-rose text-xl group-hover:scale-110 transition-transform duration-500">
								<i className="fa-solid fa-scale-unbalanced" />
							</div>
							<div>
								<h3 className="text-xl font-black text-text-bright uppercase tracking-tighter m-0">
									Paradoxo do Valuation
								</h3>
								<p className="text-[0.65rem] font-black text-accent-rose-light uppercase tracking-widest m-0">
									Mid vs Big
								</p>
							</div>
						</div>
						<div className="space-y-4 text-sm text-text-muted leading-relaxed flex-1">
							<p>
								<strong className="text-text-main font-bold">Cenário:</strong> BTN
								(40bb) abre, BB (54bb - Chip Leader) defende.
							</p>
							<p>
								<strong className="text-text-main font-bold">O Paradoxo:</strong> O
								BTN acredita que pode punir o BB. Mas o Risk Premium de ida (21.4%)
								é quase o dobro do de volta (12.9%). O BTN aposta a vida; o BB
								aposta fichas.
							</p>
							<div className="mt-4 p-4 rounded-xl bg-accent-rose/5 border border-accent-rose/10">
								<p className="m-0 text-accent-rose-light italic">
									<strong className="uppercase text-[0.6rem] tracking-widest block mb-1 not-italic opacity-70">
										Resolução Nash:
									</strong>{' '}
									A agressão do BTN é estrangulada. A matemática corta sua
									frequência de blefe, forçando-o a abandonar potes marginais para
									evitar suicídio financeiro. O BB impõe o ritmo pela imunidade à
									morte.
								</p>
							</div>
						</div>
					</div>

					{/* Arquétipo III */}
					<div className="p-8 rounded-3xl bg-white/2 border border-white/5 border-t-4 border-t-accent-amber hover:border-accent-amber/30 hover:bg-white/4 transition-all group flex flex-col">
						<div className="flex items-center gap-4 mb-6">
							<div className="w-12 h-12 shrink-0 rounded-full bg-accent-amber/10 flex items-center justify-center text-accent-amber text-xl group-hover:scale-110 transition-transform duration-500">
								<i className="fa-solid fa-person-falling-burst" />
							</div>
							<div>
								<h3 className="text-xl font-black text-text-bright uppercase tracking-tighter m-0">
									Guerra na Lama
								</h3>
								<p className="text-[0.65rem] font-black text-accent-amber-light uppercase tracking-widest m-0">
									Sobrevivência dos Shorts
								</p>
							</div>
						</div>
						<div className="space-y-4 text-sm text-text-muted leading-relaxed flex-1">
							<p>
								<strong className="text-text-main font-bold">Cenário:</strong> Dois
								jogadores com ~10bb numa mesa de colossos (80bb+).
							</p>
							<p>
								<strong className="text-text-main font-bold">O Paradoxo:</strong> O
								senso comum dita que, à beira da morte, deveriam jogar soltos (RP
								0%).
							</p>
							<div className="mt-4 p-4 rounded-xl bg-accent-amber/5 border border-accent-amber/10">
								<p className="m-0 text-accent-amber-light italic">
									<strong className="uppercase text-[0.6rem] tracking-widest block mb-1 not-italic opacity-70">
										Resolução Nash:
									</strong>{' '}
									Falso. O laddering passivo impera. Foldar rende dinheiro limpo a
									cada vez que um vizinho sucumbe. O RP ancora em ~10%. O push com
									lixo técnico é punido duramente pela matemática.
								</p>
							</div>
						</div>
					</div>

					{/* Arquétipo IV */}
					<div className="p-8 rounded-3xl bg-white/2 border border-white/5 border-t-4 border-t-accent-indigo hover:border-accent-indigo/30 hover:bg-white/4 transition-all group flex flex-col">
						<div className="flex items-center gap-4 mb-6">
							<div className="w-12 h-12 shrink-0 rounded-full bg-accent-indigo/10 flex items-center justify-center text-accent-indigo text-xl group-hover:scale-110 transition-transform duration-500">
								<i className="fa-solid fa-chess-king" />
							</div>
							<div>
								<h3 className="text-xl font-black text-text-bright uppercase tracking-tighter m-0">
									Ameaça Orgânica
								</h3>
								<p className="text-[0.65rem] font-black text-accent-indigo-light uppercase tracking-widest m-0">
									Efeito Kingmaker (FGS)
								</p>
							</div>
						</div>
						<div className="space-y-4 text-sm text-text-muted leading-relaxed flex-1">
							<p>
								<strong className="text-text-main font-bold">Cenário:</strong> Chip
								Leader absoluto (90bb) ataca o Vice-Líder (25bb).
							</p>
							<p>
								<strong className="text-text-main font-bold">O Paradoxo:</strong> O
								CL é imortal na mão, logo seu RP deveria ser 0% para esmagar sem
								restrição.
							</p>
							<div className="mt-4 p-4 rounded-xl bg-accent-indigo/5 border border-accent-indigo/10">
								<p className="m-0 text-accent-indigo-light italic">
									<strong className="uppercase text-[0.6rem] tracking-widest block mb-1 not-italic opacity-70">
										Resolução Nash:
									</strong>{' '}
									O ecossistema FGS impõe um RP substancial (~12%) ao CL. Se o
									Vice dobrar, salta para 50bb, armando o único rival capaz de
									usurpar a coroa. O solver protege o God Mode barrando a criação
									de monstros desnecessários.
								</p>
							</div>
						</div>
					</div>

					{/* Arquétipo V (Span Completo) */}
					<div className="p-8 rounded-3xl bg-linear-to-br from-white/5 to-transparent border border-white/5 border-t-4 border-t-accent-violet hover:border-accent-violet/30 hover:from-white/10 transition-all md:col-span-2 group flex flex-col sm:flex-row items-center sm:items-start gap-8">
						<div className="w-16 h-16 shrink-0 rounded-full bg-accent-violet/10 flex items-center justify-center text-accent-violet text-2xl group-hover:scale-110 transition-transform duration-500">
							<i className="fa-solid fa-fire-flame-curved" />
						</div>
						<div className="space-y-4 text-sm text-text-muted leading-relaxed flex-1 text-center sm:text-left">
							<div>
								<h3 className="text-xl font-black text-text-bright uppercase tracking-tighter m-0">
									Transferência de Risco
								</h3>
								<p className="text-[0.65rem] font-black text-accent-violet-light uppercase tracking-widest m-0">
									Efeito Batata Quente
								</p>
							</div>
							<p>
								<strong className="text-text-main font-bold">Cenário:</strong> Um
								jogador aplica um Open-Shove de 20bb sobre as blinds.
							</p>
							<p>
								<strong className="text-accent-violet-light font-bold">
									A Dinâmica SOTA:
								</strong>{' '}
								Ao empurrar todas as fichas, o agressor não investe apenas o seu
								próprio Risk Premium; ele acopla-lhe a monumental Fold Equity de uma
								decisão final. O agressor transfere instantaneamente o peso volitivo
								do torneio para o defensor. Privado de re-agressão, o limite de dor
								do defensor colapsa, obrigando ranges perfeitamente defensáveis a um{' '}
								<strong className="text-text-bright">overfold matemático</strong>{' '}
								ditado pelo pavor da eliminação num único call.
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* O FIM DA MDF E A INÉRCIA HUMANA */}
			<SectionHeader
				step="04"
				label="Inércia Humana"
				title="O Fim da MDF"
				description="A diluição das frequências GTO sob a gravidade esmagadora da pressão utilitária."
			/>

			<div className="sota-container pb-12">
				<GlassPanel className="p-8 sm:p-12 lg:p-16">
					<div className="prose prose-invert prose-lg max-w-none text-text-muted">
						<h3 className="text-text-bright font-heading">O Colapso do Bluffcatcher</h3>
						<p>
							Quando enfrentamos uma aposta de pote inteiro no river, as regras
							básicas do ChipEV ditam que devemos defender, pelo menos, 50% das vezes
							(Minimum Defense Frequency). Mas o ecossistema ICM impõe o{' '}
							<strong className="text-accent-rose">Teto de Dor</strong>.
						</p>
						<p>
							Um range condensado (composto por bluffcatchers que não vencem apostas
							de valor) é incapaz de suportar um RP elevado. A necessidade de retenção
							de equidade é suplantada pela dor financeira da eliminação. A defesa
							quebra vertiginosamente dos 50% para a casa dos 30% a 38%. O OOP é
							forçado àquilo que os leigos chamam de overfold, mas que na realidade é
							uma{' '}
							<strong className="text-text-bright">Abstenção Estrutural GTO</strong>.
						</p>

						<h3 className="text-text-bright font-heading mt-10">
							A Especulação Assimétrica
						</h3>
						<p>
							A complexidade final reside no &quot;Fator Humano&quot;. O solver GTO
							baseia-se na premissa robótica de que o Agressor terá a frieza letal
							para disparar agressões avassaladoras em 3 streets. Os humanos, contudo,
							apresentam um crônico défice de agressão no Turn e no River.
						</p>

						<div className="bg-bg-elevated/50 border border-white/5 p-8 my-10 rounded-2xl">
							<h4 className="mt-0 text-accent-indigo-light font-bold text-lg mb-4 font-heading italic">
								Node-Locking Empírico
							</h4>
							<p className="text-text-main leading-relaxed m-0 text-sm">
								Se sabemos que o vilão irá travar a sua agressão antes do all-in
								final, a nossa resposta estratégica altera-se. Adotamos uma{' '}
								<strong className="text-accent-emerald">Expansão Passiva</strong>:
								aumentamos a grelha de calls baseados em Implied Odds de ICM.
								Especulamos barato sabendo que o Teto Absoluto do RP nunca será
								forçado e que poderemos extrair fortunas caso a textura da board nos
								forneça os nuts absolutos.
							</p>
						</div>
					</div>
				</GlassPanel>
			</div>

			{/* CONCLUSÃO E ADAPTAÇÃO */}
			<SectionHeader
				step="05"
				label="Conclusão"
				title="A Arte da Adaptação"
				description="A vantagem competitiva moderna não reside em decorar tabelas, mas em compreender a Elasticidade do Risco."
			/>

			<div className="sota-container pb-12">
				<GlassPanel className="p-8 sm:p-12 lg:p-16">
					<div className="prose prose-invert prose-lg max-w-none text-text-muted">
						<p>
							Os Solvers assumem uma simetria de perfeição e falham em calcular a
							fadiga mental, o tilt, o medo de errar e o verdadeiro edge pós-flop do
							humano falível. A verdadeira vantagem reside na{' '}
							<strong className="text-text-bright">Tríade da Adaptação</strong>:
						</p>

						<ul className="space-y-6 list-none pl-0 mt-10">
							<li className="flex items-start gap-6">
								<span className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10 shadow-lg">
									<i className="fa-solid fa-shield-halved text-accent-emerald text-lg"></i>
								</span>
								<div>
									<strong className="text-text-bright block mb-1 font-heading">
										O Colapso do Teto de Agressão
									</strong>
									<p className="m-0 text-sm leading-relaxed">
										Saber quando um oponente que atua como &quot;calling
										station&quot; destrói por completo a capacidade matemática
										do seu blefe.
									</p>
								</div>
							</li>
							<li className="flex items-start gap-6">
								<span className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10 shadow-lg">
									<i className="fa-solid fa-handshake text-accent-indigo text-lg"></i>
								</span>
								<div>
									<strong className="text-text-bright block mb-1 font-heading">
										A Exploração do Pacto
									</strong>
									<p className="m-0 text-sm leading-relaxed">
										Compreender o momento exato em que o &quot;Pacto
										Silencioso&quot; lhe permite roubar potes a gigantes
										aterrorizados pela sombra da eliminação mútua.
									</p>
								</div>
							</li>
							<li className="flex items-start gap-6">
								<span className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10 shadow-lg">
									<i className="fa-solid fa-person-falling-burst text-accent-amber text-lg"></i>
								</span>
								<div>
									<strong className="text-text-bright block mb-1 font-heading">
										Navegando na Lama
									</strong>
									<p className="m-0 text-sm leading-relaxed">
										Saber quando a &quot;Guerra na Lama&quot; lhe exige expandir
										a variância para alcançar os lugares cimeiros sem temer o
										salto de premiação marginal.
									</p>
								</div>
							</li>
						</ul>

						<p className="mt-12 text-center text-lg italic text-text-main border-t border-white/5 pt-12">
							No poker de elite, a matemática propõe a base teórica; contudo, será
							sempre a sua sensibilidade na interpretação do ecossistema que ditará o
							campeão.
						</p>
					</div>
				</GlassPanel>
			</div>

			<div className="sota-container pb-24 pt-12 border-t border-white/5">
				<ContentFooter
					shareTitle={articleTitle}
					shareUrl={articleUrl}
					backLinkHref="/biblioteca"
					backLinkText="Voltar para Biblioteca"
				/>
			</div>
		</div>
	);
}
