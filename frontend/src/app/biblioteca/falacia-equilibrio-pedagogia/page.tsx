/**
 * IDENTITY: A Falácia do Equilíbrio GOLD
 * PATH: src/app/biblioteca/falacia-equilibrio-pedagogia/page.tsx
 * ROLE: Artigo pedagógico sobre a ineficiência do estudo puramente teórico.
 * VERSION: v6.2.1 GOLD
 */

import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import { SotaMarkdown } from '@/components/ui/layout/SotaMarkdown';
import ContentFooter from '@/components/ui/layout/ContentFooter';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { ROUTES } from '@/constants/routes';
import { SITE_CONFIG } from '@/constants/site';

const content = `
# A Falácia do Equilíbrio
### Por que o aprendizado tradicional está falhando

Muitos jogadores acreditam que "estudar poker" é decorar tabelas de Nash ou replicar frequências de solver em spots que eles nunca encontrarão. No mundo real, a obsessão pelo equilíbrio é uma armadilha cognitiva.

---

## 1. O Mapa não é o Território

O GTO (Game Optimal Theory) é um mapa. Se o território (a mesa) está inundado ou em chamas, seguir o mapa cegamente levará ao desastre. O equilíbrio assume que todos os jogadores estão jogando de forma ideal — o que é **estatisticamente impossível** em qualquer MTT.

---

## 2. A Ilusão da Frequência

Se um solver diz para dar check com AA em 14.5% das vezes num board específico, e você tenta replicar isso sem entender o **porquê** sistêmico, você está apenas imitando um comportamento sem capturar a essência da decisão.

No paradigma SOTA, focamos na **Lógica Vetorial**: por que a mão quer ir pro check? É proteção? É trap? É controle de SPR sob ICM?

---

## 3. O Downward Drift e a Morte das Estratégias Estáticas

Conforme a pressão do ICM aumenta, os ranges sofrem um colapso gravitacional que chamamos de **Downward Drift**. O equilíbrio de Nash para 100bb é inútil quando você tem 25bb e um payjump de $10.000 à frente.

O aprendizado soberano foca na **Adaptação Elástica**: quão longe você pode desviar do equilíbrio para maximizar seu EV real contra humanos falhos.

---

## 4. O Caminho do Operador

1.  **Fundação:** Entender o GTO como base de segurança.
2.  **Percepção:** Identificar o desvio populacional (Factor Ψ).
3.  **Execução:** Aplicar a Perspectiva Matemática para extrair o máximo valor da entropia.

"A excelência não é decorar a resposta certa, mas saber fazer a pergunta correta quando a matemática colapsa."
`;

export default function FalaciaEquilibrioPage() {
	return (
		<div className="min-h-screen bg-bg-base text-text-bright">
			<ContentPageHeader
				title="A Falácia do Equilíbrio"
				subtitle="Por que o aprendizado tradicional de poker está falhando e como a visão sistêmica muda o jogo."
				category="Pedagogia SOTA"
				icon="fa-graduation-cap"
			/>

			<div className="sota-container py-12 md:py-24">
				<div className="max-w-4xl mx-auto">
					<GlassPanel className="p-8 lg:p-12 border-l-4 border-l-accent-indigo">
						<SotaMarkdown content={content} />
					</GlassPanel>
				</div>
			</div>

			<ContentFooter
				shareTitle={`A Falácia do Equilíbrio | ${SITE_CONFIG.author}`}
				shareUrl={`${SITE_CONFIG.baseUrl}${ROUTES.LIBRARY.FALACIA_EQUILIBRIO}`}
				backLinkHref={ROUTES.BIBLIOTECA}
				backLinkText="Voltar para Biblioteca"
			/>
		</div>
	);
}
