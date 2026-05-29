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

O entendimento estrutural das premiações é crucial para calibrar as adaptações de ICM de um jogador. Diferentes curvas de pagamento forçam diferentes respostas estratégicas no longo prazo.

---

## 1. O Princípio do Denominador Correto

O percentual do 1º lugar deve ser sempre calculado sobre o **Prize Pool Total** do torneio, NÃO sobre a soma dos prêmios in-the-money (ITM).

$$ \\%_{1st} = \\frac{Prêmio_{1st}}{TOTAL\\_POOL} $$

---

## 2. Os 5 Arquétipos SOTA

### A. TOP-HEAVY (▲)
- **Regra:** 1º lugar $\\geq$ 25% do pool total.
- **Dinâmica:** Laddering pouco valioso. O foco é a vitória absoluta, onde a recompensa cobre o risco massivo de bolhas estouradas.
- **Impacto:** Bubble Factor (BF) elevado e pressão ICM severa. A sobrevivência é subjugada pela busca implacável da vitória.

### B. FLAT (▬)
- **Regra:** 1º lugar $\\leq$ 18% do pool total.
- **Dinâmica:** Laddering extremamente relevante. Subir uma posição tem valor real tangível e imediato.
- **Impacto:** Jogo se aproxima muito de ChipEV (distorção mínima de ICM). A preservação de stack se torna essencial para garantir os degraus (payjumps).

### C. HÍBRIDA (◆)
- **Regra:** 1º lugar entre 18% e 24%.
- **Método:** A classificação definitiva demanda Análise por Exclusão, sendo necessário avaliar a inclinação da curva de payjumps para calibrar o peso entre laddering e busca pela ponta.

### D. PKO (💥)
- **Classificação:** Top-heavyssimo estático.
- **Dinâmica:** A compensação real da agressividade e expansão de ranges não vem pelos saltos de tabela de prêmios convencional, mas pelo Bounty acumulado (ICM dinâmico de eliminação instantânea).

### E. SATÉLITE (🎫)
- **Classificação:** ICM Binário e Terminal.
- **Dinâmica:** Sobrevivência pura. O jogo torna-se altamente distorcido, pois acumular fichas além do necessário para o ticket tem EV matemático absolutamente zero. A agressividade é puramente focada na eliminação de ameaças e preservação estrita do stack atual.

---

## 3. Âncora Científica (Aula 1.2)

Dados empíricos e observacionais extraídos de um torneio de calibração no motor SOTA v5.2:

- **Total Players:** 126
- **Total Pool:** $1260
- **1st Prize:** $237.34 (18.8%)
- **Status:** FLAT (no limiar exato de uma transição para Híbrida)

**Impacto Paramétrico no Contexto (Mesa Final):**

| Hero (Def) | BF vs BTN | RP vs BTN |
| :--- | :--- | :--- |
| **BB** | 1.15x | 12.9% |
| **BTN** | 1.27x | 21.4% |

---
*Fonte: Documento de Governança de Estruturas, 2026. Paradigma VITOI.*
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
