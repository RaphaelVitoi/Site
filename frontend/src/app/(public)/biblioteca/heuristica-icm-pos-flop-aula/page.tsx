/**
 * IDENTITY: Masterclass 1.2 GOLD - Heurísticas de ICM no Pós-Flop
 * PATH: src/app/biblioteca/heuristica-icm-pos-flop-aula/page.tsx
 * ROLE: Aula técnica completa com imagens de solver e comparativos.
 * VERSION: v7.0 GOLD
 */

import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import { SotaMarkdown } from '@/components/ui/layout/SotaMarkdown';
import ContentFooter from '@/components/ui/layout/ContentFooter';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { ROUTES } from '@/constants/routes';
import { SITE_CONFIG } from '@/constants/site';

const content = `
# Masterclass 1.2: Entendendo o ICM e suas Heurísticas
### Aplicações de Risk Premium no Pós-Flop

Nesta aula, usamos um cenário didático de mesa final para separar a referência linear de ChipEV das camadas ICM/ICMev. Frequências pós-flop só podem ser tratadas como output externo quando vierem acompanhadas de solver, versão, ranges e nó reproduzível.

---

## 1. O Ponto de Partida: Risk Advantage

Analisamos um spot clássico de **BTN vs BB**.
*   **BU (38bb):** Risk Premium de 21.4%
*   **BB (53bb):** Risk Premium de 12.9%
*   **ΔRP(BTN→BB):** 12.9% − 21.4% = **-8.5 p.p.**

O BB possui o menor RP e, portanto, a Vantagem de Risco nesse confronto. O sinal identifica uma assimetria a investigar; não concede ao BB ou ao BTN uma frequência automática de agressão. Payouts, pote, posição, stacks efetivos e ranges determinam a linha concreta.

---

## 2. A Mutação do Flop (C-bet vs Check)

No referencial linear, o range de agressão vem do nó e dos ranges definidos. Sob ICM/ICMev, a comparação deve testar como o risco de eliminação e a assimetria de RP alteram esse nó:
1.  **Checks adicionais:** podem aparecer quando a preservação de valuation torna a expansão de pote menos atraente.
2.  **Sizings de controle:** são hipóteses de exploração didática; 20% a 25% não são um padrão universal.

![Comparativo de Linhas de C-bet](/images/aulas/entendendo-o-icm-e-suas-heuristicas/image1.png)

---

## 3. O Colapso do Bluffcatcher

Quando o pote atinge o River, o **Pot Entrapment** (Aprisionamento) torna o custo de abandonar a linha uma variável relevante. Investimento passado não torna um call correto por si só: o ponto deve ser reavaliado com preço, equidade, ranges, ICM e ação futura inexistente no River.

![Matriz de Defesa River](/images/aulas/entendendo-o-icm-e-suas-heuristicas/image7.png)

*A imagem é material didático de cenário. Mãos marginais podem migrar de call para fold quando os parâmetros ICM alteram o limiar de equidade; a frequência só é verificável com o nó, as ranges e o estado de payouts correspondentes.*

---

## 4. O Fenômeno do Bunching Effect

Em árvores multiway, cartas bloqueadas, ranges remanescentes e ações de jogadores fora do pote podem alterar a densidade de blockers. A disponibilidade e o tratamento dessa informação dependem da ferramenta e da configuração do nó; o material não presume equivalência nem omissão entre solvers sem export verificável.

---

## 5. Conclusões Práticas

*   **Sizings Pequenos:** hipótese a comparar contra o nó de referência, não prescrição universal.
*   **Agressão Seletiva:** RP, blockers e range adversário delimitam a investigação; nenhum componente isolado “proíbe” uma linha.
*   **Check-Back:** mãos fortes podem mudar de frequência conforme SPR, ICM e ranges. A decisão exige contexto de spot e não decorre apenas do rótulo da mão.
`;

export default function MasterclassLessonPage() {
	return (
		<div className="min-h-screen bg-bg-base text-text-bright">
			<ContentPageHeader
				title="Masterclass 1.2"
				subtitle="Heurísticas de ICM no Pós-Flop: A ciência por trás da dissipação do Risk Premium."
				category="Aula Técnica"
				icon="fa-chalkboard-user"
			/>

			<div className="sota-container py-12 md:py-24">
				<div className="max-w-4xl mx-auto">
					<GlassPanel className="p-8 lg:p-12">
						<SotaMarkdown content={content} />
					</GlassPanel>
				</div>
			</div>

			<ContentFooter
				shareTitle={`Masterclass 1.2: ICM no Pós-Flop | ${SITE_CONFIG.author}`}
				shareUrl={`${SITE_CONFIG.baseUrl}${ROUTES.LIBRARY.HEURISTICA_POS_FLOP}`}
				backLinkHref={ROUTES.BIBLIOTECA}
				backLinkText="Voltar para Biblioteca"
			/>
		</div>
	);
}
