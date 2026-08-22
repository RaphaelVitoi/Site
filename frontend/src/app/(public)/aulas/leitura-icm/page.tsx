/**
 * IDENTITY: Whitepaper ICM — Teoria da Perspectiva Matemática
 * PATH: src/app/aulas/leitura-icm/page.tsx
 * ROLE: Framework completo: RP vs BF, hierarquia cognitiva (E/P/E),
 *       extensão do ICM EV, conceitos originais do motor SOTA.
 * BINDING: [layout.tsx, globals.css, SectionHeader, ContentFooter]
 */

import ContentFooter from '@/components/ui/layout/ContentFooter';
import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { SectionHeader } from '@/components/ui/layout/SectionHeader';
import { ROUTES } from '@/constants/routes';
import { SITE_CONFIG } from '@/constants/site';

export const metadata = {
	title: `Teoria da Perspectiva Matemática | ${SITE_CONFIG.author}`,
	description:
		'PMev v7 em desenvolvimento: um programa de pesquisa para estender a análise ICM de estados a decisões de torneio dinâmicas.',
};

export default function TeoriaICMPage() {
	const pageUrl = `${SITE_CONFIG.baseUrl}${ROUTES.AULAS.LEITURA_ICM}`;
	const pageTitle = `Teoria da Perspectiva Matemática | ${SITE_CONFIG.author}`;

	return (
		<div className="min-h-screen bg-bg-base text-text-bright overflow-x-hidden font-body">
			<ContentPageHeader
				title="Whitepaper SOTA"
				subtitle="Uma proposta de transição do modelo estático de estados para uma análise dinâmica, sujeita a especificação e teste reprodutível."
				category="Educação"
				icon="fa-scroll"
			/>

			{/* 01: Risk Premium vs Bubble Factor */}
			<SectionHeader
				step="01"
				label="Calibração"
				title="Risk Premium vs. Bubble Factor"
				description="Duas métricas de pressão ICM. A conversão depende do mesmo estado e do tipo de confronto avaliado."
			/>
			<div className="sota-container pb-12">
				<GlassPanel className="p-8 sm:p-12 lg:p-16">
					<div className="prose prose-invert prose-lg max-w-none text-text-muted">
						<p>
							Antes de mergulhar na Perspectiva, é essencial calibrar as réguas de
							medição de pressão do torneio. É fundamental distinguir entre{' '}
							<strong>Ruído de Simulação</strong> (comum em modelos simplificados como
							GTO Wizard pós-flop) e a <strong>Influência Real do ICM</strong>. No
							Framework ICM, HRC é uma referência de baseline. Uma alegação de
							calibração requer publicar os 93 nós, versões, ranges, payouts e a
							métrica de erro; sem esse artefato, a comparação permanece uma hipótese
							de trabalho, não uma validação.
						</p>

						<ul className="ml-6 text-text-main leading-relaxed list-disc">
							<li>
								<strong>Bubble Factor (BF):</strong> A razão matemática entre o que
								se PERDE em ICM equity ao perder um pote vs o que se GANHA ao
								vencê-lo (BF = Loss / Gain). O BF cresce assintoticamente (ex:
								1,27&times;, 2,5&times;, 15&times;), o que obscurece a percepção da
								magnitude real da pressão.
							</li>
							<li>
								<strong>Risk Premium (RP):</strong> É a equity adicional, acima das
								pot odds puras, necessária para justificar um call. O motor SOTA
							pode ser expresso em pontos percentuais. Seu valor não possui teto
							universal: depende de stacks, payouts, pares de jogadores, pot odds e
							regras do torneio.
							</li>
						</ul>

						<div className="bg-accent-emerald/10 border-l-4 border-accent-emerald p-8 my-8 rounded-r-2xl">
							<h4 className="mt-0 text-accent-emerald font-bold font-heading">
								Relação Matemática
							</h4>
							<p className="font-mono text-sm text-accent-indigo-light leading-relaxed">
							Confronto all-in simétrico: Equity* = BF / (BF + 1); RP = Equity* &minus; 50 p.p.
							</p>
							<p className="mb-0 text-sm">
							&Delta;RP é um descritor comparativo proposto, não uma regra que determina
							agressividade. Fora do confronto all-in simétrico, a equity requerida deve
							ser calculada no estado e na árvore de decisão concretos.
							</p>
						</div>
					</div>
				</GlassPanel>
			</div>

			{/* 02: Hierarquia Cognitiva */}
			<SectionHeader
				step="02"
				label="Paradigma"
				title="A Hierarquia Cognitiva da Decisão"
				description="Quatro camadas propostas: ICM EV, Esperança, Expectativa e Perspectiva. Do snapshot financeiro a uma hipótese dinâmica."
			/>
			<div className="sota-container pb-12">
				<GlassPanel className="p-8 sm:p-12 lg:p-16">
					<div className="prose prose-invert prose-lg max-w-none text-text-muted">
						<h3 className="text-text-bright font-heading">
							Camada 1: O Axioma do EV do Fold e o ICM<sub>ev</sub> Estático
						</h3>
						<p>
							A premissa comercial de que &ldquo;foldar tem EV zero&rdquo; é uma
							simplificação que oculta o custo de oportunidade. O fold é uma transação
							de capital.
						</p>
						<ul className="ml-6 text-text-main leading-relaxed list-disc">
							<li>
								<strong>ChipEV:</strong>{' '}
								<span>
									EV<sub>fold</sub>
								</span>{' '}
								= &minus;antes. O piso é negativo. Para uma ação ser coerente, ela
								não precisa ter EV positivo, basta superar o abismo do fold.
							</li>
							<li>
								<strong>O Paradoxo do ICM:</strong> Em bolhas ou payjumps, o{' '}
								<span>
									EV<sub>fold</sub>
								</span>{' '}
								pode ser <strong>Positivo</strong> sob uma convenção de valor absoluto
								e em estados com eliminação alheia provável. Em uma convenção incremental,
								fold pode ser normalizado a zero; as comparações devem manter a mesma
								convenção. O{' '}
								<span>
									ICM<sub>ev</sub>
								</span>{' '}
								calcula um snapshot de premiação condicionado aos stacks; não modela,
								por si só, a árvore pós-flop, blinds futuros ou distribuição de mãos.
							</li>
						</ul>

						<h3 className="text-text-bright font-heading">
							Camada 2: Esperança Matemática
						</h3>
						<p>
							A métrica estratégico-lógica. Responde: &ldquo;o que posso concretamente
							buscar neste cenário em termos de probabilidades, riscos e
							ganhos?&rdquo; Não é o que o jogador quer — é o que a matemática
							sustenta como expectativa realizável de melhora de posição.
						</p>
						<div className="bg-bg-elevated/50 border border-accent-indigo/20 p-8 my-8 rounded-2xl">
							<p className="font-mono text-[0.85rem] text-text-main leading-relaxed mb-2">
								Esperança(ação) = P(win) &times;{' '}
								<span className="whitespace-nowrap">
									&Delta;Perspectiva<sub>ganho</sub>
								</span>{' '}
								+ P(lose) &times;{' '}
								<span className="whitespace-nowrap">
									&Delta;Perspectiva<sub>perda</sub>
								</span>
							</p>
							<p className="mb-0 text-sm font-bold text-accent-indigo-light">
								A decisão ótima é aquela que maximiza a Esperança, não o ICM EV do
								pote isolado.
							</p>
						</div>

						<h3 className="text-text-bright font-heading">
							Camada 3: Expectativa Matemática
						</h3>
						<p>
							Opera com cadeia preditiva: &ldquo;SE isso acontecer, o que representa
							no meu FGS de positivo/negativo? Quanto afeta o ICM EV e principalmente
							a minha Esperança Matemática futura?&rdquo; Integra a{' '}
							<strong>Antevisão</strong> (ex: o salto iminente de blinds em t&minus;3
							degrada a utilidade do stack, alterando a urgência). A Expectativa
							captura consequências encadeadas que a Esperança imediata não alcança.
						</p>

						<h3 className="text-text-bright font-heading">
							Camada 4: Perspectiva Matemática
						</h3>
						<p>
							Uma generalização proposta, ainda não uma métrica fechada validada. A PMev
							v7 modela decisão como valor esperado sob transições, crenças e utilidade;
							o ICM EV continua sendo o baseline recuperável em PMev-0. Superioridade
							requer comparação fora da amostra e artefatos reproduzíveis.
						</p>
					</div>
				</GlassPanel>
			</div>

			{/* 03: Dinâmica Oculta */}
			<SectionHeader
				step="03"
				label="Extensão"
				title="Dinâmica Oculta"
				description="Fenômenos que o ICM clássico não justifica: paradoxo do CL, Fator Psi e o veneno das RIO."
			/>
			<div className="sota-container pb-12">
				<GlassPanel className="p-8 sm:p-12 lg:p-16">
					<div className="prose prose-invert prose-lg max-w-none text-text-muted">
						<h3 className="text-text-bright font-heading">
							1. O Paradoxo do Chip Leader
						</h3>
						<p>
							O ICM puro dita que fichas perdidas valem mais que fichas ganhas,
							sugerindo passividade ao CL. A realidade: o CL é hiperagressivo. Por
							quê?{' '}
							<strong>
								O CL não briga por fichas, briga por Perspectiva Matemática.
							</strong>{' '}
							Ele aposta para negar a Perspectiva alheia.
						</p>

						<h3 className="text-text-bright font-heading">2. O Fator &Psi; (Psi)</h3>
						<p>
							&Psi; é uma hipótese de crença: uma mistura explícita de linhas, erros e
							frequências adversárias pode alterar o valor de uma ação. Os pesos precisam
							ser observáveis, calibrados e comparados a um baseline; percentuais isolados
							não implicam call.
						</p>

						<h3 className="text-text-bright font-heading">3. O Veneno das RIO</h3>
						<p>
							Pot Odds são uma heurística engessada. Elas mascaram as{' '}
							<strong>Reverse Implied Odds (RIO)</strong>. Pagar pelas odds atrai a
							especulação, prendendo o jogador a um passivo estrutural onde ele acerta
							a mão marginal e perde um pote gigantesco.
						</p>
					</div>
				</GlassPanel>
			</div>

			{/* 04: Motor SOTA */}
			<SectionHeader
				step="04"
				label="Motor"
				title="Conceitos Originais: O Motor SOTA"
				description="Os axiomas que compõem a física do motor Framework ICM. Cada conceito opera como uma grandeza calculável."
			/>
			<div className="sota-container pb-12">
				<GlassPanel className="p-8 sm:p-12 lg:p-16">
					<div className="prose prose-invert prose-lg max-w-none text-text-muted">
						<ul className="ml-6 text-text-main leading-relaxed list-disc">
							<li>
								<strong>Faixas de RP:</strong> qualquer âncora numérica, inclusive 24%,
								é uma hipótese de domínio e deve ser testada contra estados publicados.
								O RP não substitui uma árvore de decisão nem uma análise de MDF.
							</li>
							<li>
								<strong>&Delta;RP (Diferencial de Risco):</strong> RP<sub>IP</sub>{' '}
								&minus; RP<sub>OOP</sub>. Define o teto abstrativo de defesa.
							</li>
							<li>
								<strong>Especulação Assimétrica:</strong> Mid-stacks entram no pote
								por <em>implied odds</em> de ICM, não pot odds.
							</li>
							<li>
								<strong>Efeito Irradiação:</strong> Um micro-stack altera o Nash de
								todos sem jogar uma mão. Sua existência altera as funções de
								utilidade.
							</li>
						</ul>
					</div>
				</GlassPanel>
			</div>

			{/* Referências e Atribuições */}
			<div className="sota-container pb-12">
				<div className="px-8 py-6 rounded-xl bg-slate-900/40 border border-white/5">
					<h4 className="m-0 mb-4 text-[0.65rem] font-black text-text-muted uppercase tracking-[0.15em]">
						Referências e Atribuições
					</h4>
					<ul className="m-0 pl-5 list-disc flex flex-col gap-2 text-[0.7rem] text-text-dim leading-relaxed">
						<li>
							<strong className="text-text-muted">Downward Drift</strong> — Dara
							O&apos;Kearney &amp; Barry Carter.
						</li>
						<li>
							<strong className="text-text-muted">Framework original</strong> —
							Perspectiva Matemática, Esperança, Expectativa, &Delta;RP, Teto do RP,
							Especulação Assimétrica, Fold Estrutural, Inversão de Extremos, Efeito
							Irradiação, Donk Bet ICM, Fator &Psi;: Raphael Vitoi (2025-2026).
						</li>
					</ul>
				</div>
			</div>

			{/* Footer */}
			<ContentFooter
				shareTitle={pageTitle}
				shareUrl={pageUrl}
				backLinkHref={ROUTES.BIBLIOTECA}
				backLinkText="Voltar para Biblioteca"
			/>
		</div>
	);
}
