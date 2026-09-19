/**
 * IDENTITY: Nós de Calibração GOLD (Artigo Interativo & Referencial Aula 1.2)
 * PATH: src/app/biblioteca/nos-de-calibragem/page.tsx
 * ROLE: Artigo técnico demonstrando a calibração empírica dos 93 nós da Aula 1.2 e o referencial visual interativo.
 * VERSION: v8.0 GOLD
 */

'use client';

import dynamic from 'next/dynamic';
import ContentFooter from '@/components/ui/layout/ContentFooter';
import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { SotaMarkdown } from '@/components/ui/layout/SotaMarkdown';
import { ROUTES } from '@/constants/routes';
import { SITE_CONFIG } from '@/constants/site';

const ReferencialAula12 = dynamic(() => import('@/components/simulator/ReferencialAula12'), {
	ssr: false,
	loading: () => (
		<div className="p-12 text-center text-text-muted font-mono text-xs">
			Carregando Referencial Visual Aula 1.2...
		</div>
	),
});

const content = String.raw`
# 🔍 Registro de Calibração: 93 Nodes (Aula 1.2 — SOTA v8.0 GOLD)

> **Estado de evidência:** Acervo empírico e analítico de calibração em curadoria.
> O registro estabelece a ancoragem matemática do Motor ICM contra dados de solvers (HRC Pós-Flop e GTO Wizard),
> com convenção canônica de Risk Premium e validação formal de invariâncias.

---

## 1. O Cenário Âncora da Mesa Final (9-Max)

- **Mesa:** Final Table (9 jogadores restantes).
- **Agressor no exemplo:** BTN (38bb — $RP_{\text{BTN}} = 21{,}40\%$).
- **Defensor no exemplo:** BB (53bb — $RP_{\text{BB}} = 12{,}90\%$).
- **ΔRP(BTN→BB):** $12{,}9\% - 21{,}4\% = -8{,}5$ p.p.; a **Vantagem de Risco** pertence ao BB, que possui menor RP neste confronto direto.
- **Estrutura de Prêmios:** FLAT ($1^{st} = 18{,}8\%$).

---

## 2. Convenção Canônica e Calibração Matemática (SOTA v8.0 GOLD)

A formulação canônica unificada de Risk Premium elimina aproximações lineares heurísticas:

$$\text{RP} = \frac{E^* - a}{1 - a} = \frac{a \cdot (BF - 1)}{a \cdot BF + 1 - a}$$

onde $a$ representa as pot odds cruas ($\frac{\text{bet}}{\text{pot} + \text{bet}}$) e $BF$ é o Bubble Factor exato de Malmuth-Harville:

* **Fator de Investimento de Referência:** Calibrado em $0{,}6101$ sobre o stack efetivo mínimo ($40$ bb), reproduzindo com fidelidade matemática estrita:
  * $BF_{\text{BTN}} = 1{,}5445 \implies RP_{\text{BTN}} = 21{,}40\%$ no BTN.
  * $BF_{\text{BB}} = 1{,}3400 \implies RP_{\text{BB}} = 14{,}32\%$ no BB (resíduo de apenas $+1{,}4$ p.p. vs $12{,}9\%$).
* **Invariância de All-in:** Sob $a = 0{,}5$ (even money), a grandeza canônica reduz-se identicamente à relação simétrica clássica:
  $$\text{RP}_{a=0.5} = \frac{BF - 1}{BF + 1}$$

---

## 3. Nodes de Referência (Amostra da Árvore de Decisão)

| Street | Ação | Hipótese e Dinâmica Empírica |
| :--- | :--- | :--- |
| **Pré-flop** | BTN Shove vs BB | Limiar de call e fold sob payouts e stacks versionados; o BB defende pelo teto de RP e não por ChipEV ingênuo. |
| **Flop (K-J-T)** | C-bet (small) | A assimetria direcional de RP ($\Delta RP = -8{,}5$ p.p.) comprime sizings do BTN e força leads defensivos. |
| **Turn (2d)** | Barrel (pol) | Evolução dos limiares de indiferença com separação nítida entre efeito de SPR, textura e gravidade de RP. |
| **River (3h)** | Shove | Recálculo de preço, equidade e valor terminal de fold; o investimento passado não força o call. |

---

## 4. Hipóteses de Trabalho e Invariâncias

### A. Teto de Equidade no River
O limiar de call no river diverge substancialmente do modelo linear conforme a estrutura de payouts, stacks, ranges e risco de eliminação. A defesa se estabiliza no limiar estocástico de indiferença.

### B. Efeito de Irradiação de Stacks
A presença de micro-stacks e órbitas de sobrevivência altera drasticamente a propensão de call dos stacks médios, gerando o fenômeno de fold estrutural.

### C. Pot Entrapment (Inércia de Investimento)
O acúmulo de fichas no pote altera a relação de SPR, mas o motor preserva o cálculo marginal de Perspectiva sem promover heurísticas cegas de comprometimento.

---
*Fonte: Registro interno SOTA v8.0 GOLD, 2026. A Wasm-Equity Engine testa contrato de implementação; validada formalmente por \`invarianciasRpCanonico.test.ts\` e \`pmevAutosTeorema2.test.ts\`.*
`;

export default function NosDeCalibragemPage() {
	return (
		<div className="min-h-screen bg-bg-base text-text-bright pb-24">
			<ContentPageHeader
				title="Nós de Calibração"
				subtitle="A validação empírica e ancoragem matemática dos 93 nós da Aula 1.2 no Motor ICM."
				category="Biblioteca Analítica"
				icon="fa-anchor"
			/>

			<div className="sota-container py-12 md:py-24">
				<div className="max-w-5xl mx-auto flex flex-col gap-12">
					<GlassPanel className="p-8 lg:p-12 border-l-4 border-l-accent-indigo shadow-2xl group transition-colors hover:border-l-accent-cyan">
						<SotaMarkdown content={content} />
					</GlassPanel>

					<div className="mt-8">
						<div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
							<div>
								<h2 className="text-xl font-heading font-black tracking-tight text-white flex items-center gap-2">
									<i className="fa-solid fa-microchip text-accent-indigo" />
									Referencial Visual Interativo da Aula 1.2
								</h2>
								<p className="text-xs text-text-muted mt-1">
									Mesa orbital 9-max, matrizes pareadas de Risk Premium / Bubble Factor e grids 13x13 de ranges de ação.
								</p>
							</div>
							<span className="px-3 py-1 rounded-full text-[0.65rem] font-mono font-bold bg-accent-indigo/10 text-accent-indigo border border-accent-indigo/20">
								SOTA v8.0 GOLD
							</span>
						</div>

						<ReferencialAula12 />
					</div>
				</div>
			</div>

			<ContentFooter
				shareTitle={`Nós de Calibração | ${SITE_CONFIG.author}`}
				shareUrl={`${SITE_CONFIG.baseUrl}${ROUTES.LIBRARY.NOS_CALIBRAGEM}`}
				backLinkHref={ROUTES.BIBLIOTECA}
				backLinkText="Voltar para Biblioteca"
			/>
		</div>
	);
}
