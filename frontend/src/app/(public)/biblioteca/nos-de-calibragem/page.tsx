/**
 * IDENTITY: Nós de Calibração GOLD (Artigo Interativo)
 * PATH: src/app/biblioteca/nos-de-calibragem/page.tsx
 * ROLE: Artigo técnico demonstrando a calibração empírica dos nodes ICM.
 * VERSION: v7.0 GOLD
 */

import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { SotaMarkdown } from '@/components/ui/layout/SotaMarkdown';

const content = `
# 🔍 Registro de Reprodução: 93 Nodes (SOTA v6)

> **Estado de evidência:** acervo de calibração em curadoria. O registro indica
> quais exports, versões, ranges, payouts e nós são necessários para reproduzir
> uma comparação; não é prova automática de equivalência entre motores.

---

## 1. O Cenário Âncora

- **Mesa:** Final Table (9 jogadores restantes).
- **Agressor no exemplo:** BTN (38bb - $RP = 21.4\\%$).
- **Defensor no exemplo:** BB (53bb - $RP = 12.9\\%$).
- **ΔRP(BTN→BB):** $12.9\\% - 21.4\\% = -8.5$ p.p.; a Vantagem de Risco está com o BB, que possui menor RP.
- **Estrutura de Prêmios:** FLAT ($1^{st} = 18.8\\%$).

---

## 2. Nodes de Referência (Amostra Sintética)

| Street | Ação | Hipótese a reproduzir |
| :--- | :--- | :--- |
| **Pré-flop** | BTN Shove vs BB | Comparar limiar de call/fold com payouts, stacks, ranges e solver versionados; não inferir 78% sem o nó. |
| **Flop (K-J-T)** | C-bet (small) | Verificar se a assimetria de RP altera a linha do BTN, lembrando que o BB possui menor RP neste confronto. |
| **Turn (2d)** | Barrel (pol) | Medir a evolução dos limiares e separar efeito de SPR, ranges e RP. |
| **River (3h)** | Shove | Recalcular preço, equidade e ICM no nó terminal; investimento passado não substitui o cálculo. |

---

## 3. Hipóteses de trabalho a validar

### A. Limiar de equidade no River
O limiar de call pode mudar materialmente em ICM severo. A faixa precisa ser
reproduzida por payout, ranges, stack efetivo, sizing e nó; não há teto universal
de 45% neste registro.

### B. Efeito de Irradiação de Stacks
A presença de micro-stacks pode alterar os limiares de call de outros stacks. A
direção e a magnitude são condicionais a payouts, posições e confrontos; devem
ser registradas como diferença de nós, não como compressão irreversível.

### C. Pot Entrapment (Inércia de Investimento)
Investimento acumulado pode mudar a geometria do spot, mas não cria obrigação de
call. O teste deve comparar custo marginal, preço, equidade, ranges e ICM; o
limiar de 30% não é promovido a regra do motor.

---
*Fonte: registro interno SOTA v6, 2026. A Wasm-Equity Engine testa contrato de
implementação; ela não valida, sozinha, os dados externos, os ranges ou a teoria.*
`;

export default function NosDeCalibragemPage() {
	return (
		<div className="min-h-screen bg-bg-base text-text-bright pb-24">
			<ContentPageHeader
				title="Nós de Calibração"
				subtitle="A validação empírica e ancoragem matemática do Motor ICM."
				category="Biblioteca Analítica"
				icon="fa-anchor"
			/>

			<div className="sota-container py-12 md:py-24">
				<div className="max-w-4xl mx-auto flex flex-col gap-12">
					<GlassPanel className="p-8 lg:p-12 border-l-4 border-l-accent-indigo shadow-2xl group transition-colors hover:border-l-accent-cyan">
						<SotaMarkdown content={content} />
					</GlassPanel>
				</div>
			</div>
		</div>
	);
}
