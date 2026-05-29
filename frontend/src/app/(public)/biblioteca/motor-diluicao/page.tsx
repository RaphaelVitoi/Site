/**
 * IDENTITY: O Motor de Diluição de Edge GOLD
 * PATH: src/app/biblioteca/motor-diluicao/page.tsx
 * ROLE: Artigo técnico sobre a perda de vantagem em potes multiway.
 * VERSION: v7.0 GOLD
 */

import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import { SotaMarkdown } from '@/components/ui/layout/SotaMarkdown';
import ContentFooter from '@/components/ui/layout/ContentFooter';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { ROUTES } from '@/constants/routes';
import { SITE_CONFIG } from '@/constants/site';

const content = `
# O Motor de Diluição de Edge

Muitos jogadores acreditam que ter "edge" significa ganhar mais potes. Matematicamente, a edge é a capacidade de realizar mais equidade do que o seu range permite. No entanto, existe um limite físico para isso: a **Diluição Multiway**.

---

## 1. A Equação da Diluição

Conforme o número de jogadores no pote aumenta ($n$), a sua capacidade de oprimir o range alheio diminui em uma taxa de $1/n^2$.
*   **Heads-up:** Sua edge é máxima. Você controla 100% da narrativa.
*   **3-Way:** Sua edge é diluída. O ruído do terceiro range interfere na sua leitura bayesiana.
*   **4-Way+:** Sua edge torna-se insignificante. O pote torna-se um evento mecânico de equidade bruta.

---

## 2. O Erro do "Call Barato"

Entrar em potes multiway "porque está barato" é o sintoma clássico da diluição ignorada. Você está voluntariamente entrando em um cenário onde sua habilidade é neutralizada pela entropia do sistema.

---

## 3. O Veredito SOTA

O Operador Soberano busca o isolamento. O objetivo é sempre simplificar a árvore de decisão para o estado onde a edge pode ser exercida com máxima fidelidade.

"Em potes multiway, a matemática manda. Em heads-up, o Operador governa."
`;

export default function MotorDiluicaoPage() {
	return (
		<div className="min-h-screen bg-bg-base text-text-bright pb-24">
			<ContentPageHeader
				title="Motor de Diluição de Edge"
				subtitle="Como a vantagem técnica desaparece em cenários multiway e por que você deve evitar a entropia."
				category="Teoria de Sistemas"
				icon="fa-filter"
			/>

			<div className="sota-container py-12 md:py-24">
				<div className="max-w-4xl mx-auto">
					<GlassPanel className="p-8 lg:p-12 border-l-4 border-l-accent-indigo">
						<SotaMarkdown content={content} />
					</GlassPanel>
				</div>
			</div>

			<ContentFooter
				shareTitle={`Motor de Diluição de Edge | ${SITE_CONFIG.author}`}
				shareUrl={`${SITE_CONFIG.baseUrl}${ROUTES.LIBRARY.MOTOR_DILUICAO}`}
				backLinkHref={ROUTES.BIBLIOTECA}
				backLinkText="Voltar para Biblioteca"
			/>
		</div>
	);
}
