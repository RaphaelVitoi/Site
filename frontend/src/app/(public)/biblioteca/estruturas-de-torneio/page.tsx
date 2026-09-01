/**
 * IDENTITY: Estruturas de Torneio GOLD
 * PATH: src/app/biblioteca/estruturas-de-torneio/page.tsx
 * ROLE: Artigo técnico classificando estruturas de premiação.
 * VERSION: v7.0 GOLD
 */

import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { SotaMarkdown } from '@/components/ui/layout/SotaMarkdown';

const content = `
# 📊 Classificação de Estruturas de Prêmios (Framework VITOI)

O entendimento estrutural das premiações ajuda a organizar adaptações de ICM, desde que a curva completa e o estado da mesa estejam declarados. Os templates abaixo são didáticos: não substituem a leitura do vetor de payouts nem a análise do confronto efetivo.

---

## 1. O Princípio do Denominador Correto

O percentual do 1º lugar deve ser calculado sobre o **Prize Pool Total** do torneio, não sobre a soma parcial dos prêmios in-the-money (ITM). Ele é um sinal inicial, não a classificação completa da estrutura.

$$ \\%_{1st} = \\frac{Prêmio_{1st}}{TOTAL\\_POOL} $$

---

## 2. Templates operacionais

### A. TOP-HEAVY (▲)
- **Sinal inicial:** 1º lugar $\\geq$ 25% do pool total.
- **Leitura necessária:** confirmar se a concentração dos primeiros saltos e o restante da curva sustentam a classificação.
- **Limite:** BF e pressão ICM devem ser calculados por confronto; não são propriedades fixas do rótulo.

### B. FLAT (▬)
- **Sinal inicial:** 1º lugar $\\leq$ 18% do pool total.
- **Leitura necessária:** avaliar distribuição efetiva de posições e ITM.
- **Limite:** a curva flat não transforma um MTT em ChipEV puro; continua sendo necessário medir ICM no spot.

### C. HÍBRIDA (◆)
- **Sinal inicial:** 1º lugar entre 18% e 24%.
- **Método:** analisar a inclinação de todos os payjumps; o percentual do primeiro isolado não fecha a classe.

### D. PKO (💥)
- **Status:** fora do escopo do template Vanilla inicial.
- **Motivo:** bounties exigem modelo próprio e regras documentadas da sala; não devem ser reduzidos à curva estática de payouts.

### E. SATÉLITE (🎫)
- **Status:** fora do escopo do template Vanilla inicial.
- **Motivo:** a utilidade de ticket exige modelo terminal separado e não deve ser tratada pelo mesmo contrato de MTT.

---

## 3. Referência interna (Aula 1.2)

Dados declarados do cenário didático:

- **Total Players:** 126
- **Total Pool:** $1260
- **1st Prize:** $237.34 (18.8%)
- **Leitura:** 18,8% é um limiar operacional entre flat e híbrida; a classificação depende do vetor integral e de sua fonte.

**Impacto Paramétrico no Contexto (Mesa Final):**

| Hero (Def) | BF vs BTN | RP vs BTN |
| :--- | :--- | :--- |
| **BB** | 1.15x | 12.9% |
| **BTN** | 1.27x | 21.4% |

---
*Fonte: registro interno de estruturas, 2026. O cenário não certifica médias de salas ou validação externa.*
`;

export default function EstruturasDeTorneioPage() {
	return (
		<div className="min-h-screen bg-bg-base text-text-bright pb-24">
			<ContentPageHeader
				title="Arquétipos Estruturais"
				subtitle="O framework de classificação e resposta mecânica perante curvas de premiação assimétricas."
				category="Biblioteca Analítica"
				icon="fa-chart-pie"
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
