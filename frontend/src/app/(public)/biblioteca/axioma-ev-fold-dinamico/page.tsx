/**
 * IDENTITY: Axioma do EV Fold Dinâmico GOLD (Artigo Interativo)
 * PATH: src/app/biblioteca/axioma-ev-fold-dinamico/page.tsx
 * ROLE: Artigo técnico expondo a ilusão do EV = 0 e a dinâmica de Sunk Cost.
 * VERSION: v7.0 GOLD
 */

import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import PmLensPanel from '@/components/simulator/panels/PmLensPanel';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { SotaMarkdown } from '@/components/ui/layout/SotaMarkdown';

const content = `
# O Axioma do EV Fold Dinâmico

A falha primária da intuição humana (e da leitura superficial de solvers) é assumir que desistir de uma mão possui Valor Esperado igual a zero. No paradigma da **Perspectiva Matemática**, o zero não existe. O Fold é uma transação financeira passiva e sempre tem um custo estrutural.

---

## 1. A Ilusão do EV = 0
Solvers comerciais geralmente normalizam o EV do fold para \`0.00\` para simplificar a comparação logarítmica entre os ramos da árvore. Na física real do torneio, o fold possui uma dívida irrevogável: o **Custo de Existência (Antes)**.

A cada mão que você "passa", seu stack sofre uma erosão de aproximadamente **-0.125bb** (em mesas 8-max com 12.5% ante). Ignorar esse custo é o primeiro passo para a insolvência. O EV do Fold atua como a verdadeira âncora gravitacional do *spot*.

---

## 2. O Fold Positivo (Laddering)
Em cenários de ICM extremo (ex: Mesa Final com um micro-stack de 0.5bb prestes a ser eliminado em outra mesa), o seu EV do Fold torna-se **positivo**.
*   **Ação:** Fold.
*   **Resultado:** Sobrevivência garantida enquanto o oponente cai.
*   **Valor:** O salto de premiação (Payjump).

Neste estado, a Perspectiva exige abstenção total, pois o "lucro de não morrer" supera qualquer expectativa de ganho em fichas.

---

## 3. A Antevisão t-3 (A Órbita)
O FGS (Future Game Simulation) não olha apenas para a próxima mão, mas para o "Ponto de Colisão" (Big Blind). Sua agressividade deve ser inversamente proporcional ao tempo restante até o imposto máximo.

1.  **UTG:** 6 mãos de "vida". Pressão moderada.
2.  **BTN:** 2 mãos de "vida". Pressão urgente.
3.  **SB/BB:** O corredor da morte.

Interaja com o laboratório abaixo. Ajuste o **Sunk Cost** e os modificadores de **Blinds Subindo** para observar em tempo real como o **Piso (EV_fold)** reage à pressão da órbita e como a Métrica Soberana (PM) resgata calls que pareciam deficitários no vácuo.
`;

export default function AxiomaEvFoldPage() {
	return (
		<div className="min-h-screen bg-bg-base text-text-bright pb-24">
			<ContentPageHeader
				title="Axioma do EV Fold Dinâmico"
				subtitle="A matemática do Custo Afundado e a ancoragem da decisão no verdadeiro valor da abstenção."
				category="Valuation & Risco"
				icon="fa-anchor"
			/>

			<div className="sota-container py-12 md:py-24">
				<div className="max-w-5xl mx-auto flex flex-col gap-16">
					<GlassPanel className="p-8 lg:p-12 border-l-4 border-l-accent-amber shadow-2xl group transition-colors hover:border-l-accent-indigo">
						<SotaMarkdown content={content} />
					</GlassPanel>

					<div className="w-full relative z-10">
						<PmLensPanel />
					</div>
				</div>
			</div>
		</div>
	);
}
