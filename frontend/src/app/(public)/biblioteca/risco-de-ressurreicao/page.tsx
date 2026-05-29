/**
 * IDENTITY: Risco de Ressurreição GOLD (Artigo Interativo)
 * PATH: src/app/biblioteca/risco-de-ressurreicao/page.tsx
 * ROLE: Artigo técnico demonstrando o custo estratégico de dar call em short stacks na bolha.
 * VERSION: v7.0 GOLD
 */

import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import ResurrectionRiskSimulator from '@/components/simulator/ResurrectionRiskSimulator';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { SotaMarkdown } from '@/components/ui/layout/SotaMarkdown';

const content = `
# O Paradoxo da Ressurreição

No xadrez do poker de alta performance, a eliminação de um oponente não é apenas a captura de fichas; é a conquista de **Capital Estrutural**. A presença de um short stack agonizando na bolha gera uma *Zona de Pressão* que engessa os stacks medianos, permitindo que o Chip Leader opere com quase total impunidade.

O **Risco da Ressurreição** é a falha letal de ignorar essa dinâmica em favor de um call matematicamente marginal.

---

## 1. A Ilusão das Pot Odds no Vácuo

Quando um short stack com 5bb empurra all-in, as pot odds geralmente gritam "Call". Você precisa de apenas 35-40% de equidade. O erro do jogador mediano é analisar esse call como uma transação isolada.

O que o cálculo ChipEV ignora:
*   **Fear Equity:** O short stack é a sua arma contra os outros jogadores. Enquanto ele viver, os stacks medianos não podem se mover contra você.
*   **Custo de Oportunidade:** Dobrar o short stack (de 5bb para 11bb) devolve a ele a "Fold Equity". Ele deixa de ser um zumbi e volta a ser um predador com capacidade de roubar blinds e de exercer pressão reativa.

---

## 2. A Amortização da Edge e o Fator Ψ

A Perspectiva Matemática exige a inclusão do **Fator Ψ (Axioma Psicológico)**. Se a mesa estiver sob estresse emocional (Maluquice Humana), a sua *Edge Relativa* é brutalmente penalizada ao se envolver em colisões desnecessárias de alta variância.

A matemática SOTA prova que o *Fold EV* contra um short stack na bolha é ativamente positivo. A preservação do seu status de "Predador Absoluto" tem um Valuation infinitamente superior à equidade fracionária das cartas.

Teste o laboratório abaixo. Modifique o Stack do Chip Leader e perceba como a barra de "Break-Even SOTA" exige muito mais equidade real do que as pot odds ilusórias sugerem.
`;

export default function RiscoRessurreicaoPage() {
	return (
		<div className="min-h-screen bg-bg-base text-text-bright pb-24">
			<ContentPageHeader
				title="Risco de Ressurreição"
				subtitle="A métrica invisível da Fear Equity: O custo catastrófico de dobrar um short stack e destruir o equilíbrio de pressão da mesa."
				category="Valuation & Risco"
				icon="fa-skull-crossbones"
			/>

			<div className="sota-container py-12 md:py-24">
				<div className="max-w-5xl mx-auto flex flex-col gap-16">
					<GlassPanel className="p-8 lg:p-12 border-l-4 border-l-accent-amber shadow-2xl group transition-colors hover:border-l-accent-rose">
						<SotaMarkdown content={content} />
					</GlassPanel>

					<div className="w-full relative z-10">
						<ResurrectionRiskSimulator />
					</div>
				</div>
			</div>
		</div>
	);
}
