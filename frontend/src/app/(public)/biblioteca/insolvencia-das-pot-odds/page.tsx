/**
 * IDENTITY: A Insolvência das Pot Odds GOLD
 * PATH: src/app/biblioteca/insolvencia-das-pot-odds/page.tsx
 * ROLE: Artigo técnico sobre a falência das métricas lineares em sistemas complexos.
 * VERSION: v7.0 GOLD
 */

import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import { SotaMarkdown } from '@/components/ui/layout/SotaMarkdown';
import ContentFooter from '@/components/ui/layout/ContentFooter';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { ROUTES } from '@/constants/routes';
import { SITE_CONFIG } from '@/constants/site';

const content = `
# A Insolvência das Pot Odds
### O Veneno mascarado pelo Preço Barato

As **Pot Odds** são uma heurística de baixa resolução, importada de finanças básicas, que atua como uma "muleta" para quem não domina a mecânica profunda do jogo. No paradigma VITOI, elas são frequentemente um **distrator sistêmico**.

---

## 1. O Cavalo de Troia das RIO

As pot odds são o incentivo linear ("está barato, pague") que mascara o passivo estrutural das **Reverse Implied Odds (RIO)**.

*   **Implied Odds (Especulação):** O vetor positivo. A busca por valuation exponencial ao acertar os nuts.
*   **Reverse Implied Odds (Passivo):** O vetor negativo. O custo de "acertar e continuar perdendo" (ex: Flush ao J vs Flush ao A).

O prejuízo nasce do descompasso entre o **preço de entrada** (Odds) e o **custo de saída** (RIO + Perda de Valuation).

---

## 2. O Multiway como Cemitério Estratégico

Em cenários Multiway (~33% de frequência), a entropia do sistema aumenta exponencialmente. As pot odds parecem ainda mais atrativas (5:1, 6:1), mas a Perspectiva Matemática revela que o risco de colisão catastrófica cresce em uma taxa superior ao desconto do pote.

No Multiway, as **RIO** tornam-se uma dívida impagável. Se você está no meio da ação (Sandwich), suas Pot Odds são irrelevantes; você está insolventemente preso em um "Cemitério Estratégico" onde a força absoluta da sua mão é aniquilada pela tensão posicional.

---

## 3. O Colapso Mecânico da Edge

A Edge (superioridade técnica) não é uma constante; ela é uma função direta da **Profundidade de Stack (Stack Depth)**.

*   **100bb+:** Edge Infinita. As árvores de decisão são complexas e favorecem o processamento superior de sistemas dinâmicos.
*   **10bb-:** Edge Nula. Ocorre o colapso binário onde o jogo se resume a tabelas pré-computadas (Push/Fold).

O solver protege o jogador fraco ao simplificar o jogo conforme as stacks diminuem. No paradigma SOTA, a missão é forçar a complexidade onde a edge existe e aceitar a variância onde o colapso mecânico é inevitável.

---

## 4. O Coeficiente de Insolvência ($C_i$)

Definimos a saúde de uma decisão pela razão entre a utilidade real (Perspectiva) e o incentivo das odds:

$$C_i = \\frac{Perspectiva}{Pot\\_Odds}$$

Se **$C_i < 1$**, as pot odds mentem. Conforme o número de jogadores no pote aumenta, o $C_i$ mergulha para território negativo, indicando que o call é destrutivo para a saúde do stack e para o FGS (Future Game Simulation).

---

## 4. Veredito SOTA

Para um jogador de elite, as pot odds são apenas o esqueleto de uma decisão. A carne é o ICM e o cérebro é a Perspectiva.

1.  **Iniciante:** Utilidade Alta (evita erros crassos).
2.  **Intermediário:** Utilidade Decrescente (nota que "ter preço" não compensa a falta de realizabilidade).
3.  **Elite (Perspectiva):** **Utilidade Negativa**. O foco nas odds impede a percepção do fluxo sistêmico.
`;

export default function InsolvenciaPotOddsPage() {
	return (
		<div className="min-h-screen bg-bg-base text-text-bright">
			<ContentPageHeader
				title="Insolvência das Pot Odds"
				subtitle="Por que focar no preço imediato é a rota mais rápida para a erosão de stack em Mesas Finais."
				category="Teoria Crítica"
				icon="fa-biohazard"
			/>

			<div className="sota-container py-12 md:py-24">
				<div className="max-w-4xl mx-auto">
					<GlassPanel className="p-8 lg:p-12 border-l-4 border-l-accent-rose">
						<SotaMarkdown content={content} />
					</GlassPanel>
				</div>
			</div>

			<ContentFooter
				shareTitle={`A Insolvência das Pot Odds | ${SITE_CONFIG.author}`}
				shareUrl={`${SITE_CONFIG.baseUrl}${ROUTES.LIBRARY.INSOLVENCIA_POT_ODDS}`}
				backLinkHref={ROUTES.BIBLIOTECA}
				backLinkText="Voltar para Biblioteca"
			/>
		</div>
	);
}
