/**
 * IDENTITY: Teoria da Perspectiva no Poker GOLD
 * PATH: src/app/biblioteca/teoria-da-perspectiva/page.tsx
 * ROLE: Artigo fundamentando a base científica do framework VITOI (Kahneman & Tversky).
 * VERSION: v7.0 GOLD
 */

import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import { SotaMarkdown } from '@/components/ui/layout/SotaMarkdown';
import ContentFooter from '@/components/ui/layout/ContentFooter';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { SectionHeader } from '@/components/ui/layout/SectionHeader';
import { PmevRangeViewer } from '@/components/simulator/PmevRangeViewer';
import { ROUTES } from '@/constants/routes';
import { SITE_CONFIG } from '@/constants/site';

const content = `
# Teoria da Perspectiva: O Cérebro sob Pressão

A **Teoria da Perspectiva (Prospect Theory)**, desenvolvida por Daniel Kahneman e Amos Tversky, é a pedra angular da psicologia econômica moderna. No Poker Racional, aplicamos seus axiomas para entender por que jogadores (incluindo você) desviam do GTO quando o "dinheiro é real".

---

## 1. A Assimetria do Valor (Aversão à Perda)

A função de utilidade não é linear. A dor de perder $1.000 é psicologicamente mais intensa do que o prazer de ganhar $1.000. 

No Poker, isso se traduz no **Efeito de Congelamento**: quando confrontado com um call marginal para a vida no torneio, o cérebro humano supervaloriza a sobrevivência (status quo) em detrimento do valor esperado (EV) positivo.

---

## 2. Sensibilidade Decrescente

Quanto mais fichas você tem, menos cada ficha individual "vale" psicologicamente. Isso explica por que Chip Leaders costumam jogar de forma mais relaxada (e às vezes descuidada), enquanto short-stacks sentem cada blind como uma facada.

O **Motor SOTA** corrige essa distorção, atribuindo um Valuation Factor matemático que força a racionalidade sobre a emoção.

---

## 3. Ponderação de Probabilidade

Humanos são péssimos em avaliar probabilidades extremas. Tendemos a supervalorizar eventos improváveis (como tomar um bad beat de 2%) e subvalorizar eventos quase certos.

No River, isso gera o **Pavor do Blefe Fantasma**: a sensação de que o oponente *sempre* tem o nuts, ignorando a densidade real dos combos.

---

## 4. Conclusão Soberana

A Teoria da Perspectiva não é um erro a ser evitado, mas uma característica do sistema operacional humano. O Operador Soberano usa a matemática para **blindar** sua própria decisão e a psicologia para **atacar** a distorção cognitiva do oponente.

"A Perspectiva Matemática é a ferramenta que permite ao humano agir como máquina, sem perder a sensibilidade do predador."
`;

export default function TeoriaPerspectivaPage() {
	return (
		<div className="min-h-screen bg-bg-base text-text-bright">
			<ContentPageHeader
				title="Teoria da Perspectiva"
				subtitle="A base científica de Kahneman e Tversky aplicada ao Poker: como a aversão à perda molda o veredito."
				category="Psicologia Econômica"
				icon="fa-brain"
			/>

			<div className="sota-container py-12 md:py-24">
				<SectionHeader
					step="CONCEITO"
					label="Fundamentação"
					title="O Algoritmo do Medo"
					description="Como o cérebro processa risco e recompensa em cenários de alta pressão."
				/>
				<div className="max-w-4xl mx-auto mb-16">
					<GlassPanel className="p-8 lg:p-12 border-l-4 border-l-accent-indigo">
						<SotaMarkdown content={content} />
					</GlassPanel>
				</div>

				<SectionHeader
					step="INTERATIVO"
					label="Simulador de Range"
					title="Matriz de Perspectiva (PMev 3.2 vs. DeepSolver GTO)"
					description="Explore o impacto do stack depth, bubble factor e tempo de órbita na modulação dos ranges pré-flop 13x13."
				/>
				<div className="max-w-5xl mx-auto">
					<PmevRangeViewer />
				</div>
			</div>

			<ContentFooter
				shareTitle={`Teoria da Perspectiva | ${SITE_CONFIG.author}`}
				shareUrl={`${SITE_CONFIG.baseUrl}${ROUTES.LIBRARY.TEORIA_PERSPECTIVA}`}
				backLinkHref={ROUTES.BIBLIOTECA}
				backLinkText="Voltar para Biblioteca"
			/>
		</div>
	);
}

