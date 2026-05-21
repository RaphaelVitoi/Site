/**
 * IDENTITY: Paradoxo da Valuation GOLD (Artigo Interativo)
 * PATH: src/app/biblioteca/paradoxo-valuation/page.tsx
 * ROLE: Artigo técnico expondo a não linearidade das fichas e o risco assimétrico em torneios.
 * VERSION: v6.2.1 GOLD
 */

import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import EquityCalculator from '@/components/simulator/panels/EquityCalculator';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { SotaMarkdown } from '@/components/ui/layout/SotaMarkdown';

const content = `
# O Paradoxo da Valuation

No xadrez financeiro do poker de torneio, a intuição humana é sistematicamente traída por um princípio matemático brutal: **O Paradoxo da Valuation**. Fichas não possuem valor linear. A ficha que você ganha vale significativamente menos do que a ficha que você perde.

---

## 1. A Geometria da Assimetria

Em Cash Games, a equação é pura (ChipEV = $EV). Se você arrisca $100 para ganhar $100 em um flip de 50%, seu EV é rigorosamente neutro.

Em Torneios (MTTs), o modelo de *Independent Chip Model* (ICM) destrói essa linearidade. Dobrar suas fichas **nunca** dobra o seu *valuation* (patrimônio em dinheiro real), mas perder suas fichas aniquila 100% da sua equity instantaneamente.

Isso cria o conceito fundamental de **Risk Premium (Prêmio de Risco)**: um pedágio invisível cobrado sobre a sua equidade de vitória apenas pelo privilégio de colocar seu torneio em risco.

---

## 2. A Ilusão da Agressão Justificada

O Paradoxo pune implacavelmente os agressores não calibrados. Quando você possui um stack dominante, a sua agressão exerce um *Fear Equity* massivo contra os stacks médios, forçando-os a um *Fold* estrutural.

No entanto, se você colide contra outro Big Stack sem uma margem de segurança colossal, o *Risk Premium* reverte contra você. A matemática exige uma equidade avassaladora para justificar o call, criando um cenário onde foldar mãos como *AK* ou *QQ* pré-flop deixa de ser uma falha de coragem e passa a ser uma necessidade de sobrevivência.

---

## 3. O Laboratório de Valuation

Observe o calculador ICM abaixo. Ao modificar a estrutura de prêmios ou os stacks dos jogadores, note como a **ICM Eq (%)** diverge violentamente da sua proporção bruta de fichas (**Prop. %**). A coluna **Delta** é a materialização exata do Paradoxo da Valuation.
`;

export default function ParadoxoValuationPage() {
	return (
		<div className="min-h-screen bg-bg-base text-text-bright pb-24">
			<ContentPageHeader
				title="Paradoxo da Valuation"
				subtitle="A matemática do risco assimétrico: Por que fichas ganhas valem menos que fichas perdidas."
				category="Valuation & Risco"
				icon="fa-scale-unbalanced"
			/>

			<div className="sota-container py-12 md:py-24">
				<div className="max-w-5xl mx-auto flex flex-col gap-16">
					<GlassPanel className="p-8 lg:p-12 border-l-4 border-l-accent-amber shadow-2xl group transition-colors hover:border-l-accent-rose">
						<SotaMarkdown content={content} />
					</GlassPanel>

					<div className="w-full relative z-10">
						<EquityCalculator />
					</div>
				</div>
			</div>
		</div>
	);
}
