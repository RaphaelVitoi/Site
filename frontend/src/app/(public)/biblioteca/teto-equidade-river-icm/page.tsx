/**
 * IDENTITY: Teto Equidade River ICM GOLD (Artigo Interativo)
 * PATH: src/app/biblioteca/teto-equidade-river-icm/page.tsx
 * ROLE: Artigo técnico expondo a barreira invisível de valuation na última street.
 * VERSION: v7.0 GOLD
 */

import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import EquityCalculator from '@/components/simulator/panels/EquityCalculator';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { SotaMarkdown } from '@/components/ui/layout/SotaMarkdown';

const content = `
# O Teto de Equidade no River

A última street do Hold'em (o River) sob a lente do ICM abriga um dos fenômenos mais letais para os agressores descalibrados: o **Teto de Equidade** (Equity Ceiling).

---

## 1. A Fronteira do Valuation

No Cash Game (ChipEV), se você aposta todas as suas fichas e é pago, o vencedor leva 100% do pote. O teto de ganho é simétrico ao risco.

No ICM, existe um teto de vidro termodinâmico. Como o primeiro colocado de um torneio nunca leva 100% da *prize pool*, existe um limite matemático para o seu *Valuation*. Mesmo que você acumule 99% das fichas do torneio, a sua equidade real (ICMev) nunca atingirá o prêmio total enquanto houver outros sobreviventes.

---

## 2. A Assimetria do River Jam

Quando você anuncia um *All-in* no River e toma call, não há mais cartas para bater. A variância randômica acaba. O que resta é a colisão pura de ranges.

Nesse ponto crítico, o **Risk Premium** cobra o seu pedágio máximo. Se você perde o All-in, seu valuation desaba para zero (Eliminação). Mas se você ganha, o seu valuation esbarra no **Teto de Equidade**. Essa assimetria exige que o agressor tenha uma proporção de *Value/Bluff* absurdamente restrita e que o defensor opere em um estado de *Overfold* estrutural.

---

## 3. O Laboratório do Teto ICM

Explore o orquestrador Malmuth-Harville abaixo. Atribua 90% das fichas do torneio a um único jogador e observe a coluna **ICM Eq %**. Note que, independentemente do quão gigantesco seja o seu *stack*, a mecânica de ICM impõe um limite de refração incontornável ao seu patrimônio real.
`;

export default function TetoEquidadeRiverPage() {
	return (
		<div className="min-h-screen bg-bg-base text-text-bright pb-24">
			<ContentPageHeader
				title="Teto de Equidade River"
				subtitle="A barreira invisível de Valuation e a assimetria brutal de risco na última street."
				category="Mecânica & ICM"
				icon="fa-arrow-up-right-dots"
			/>

			<div className="sota-container py-12 md:py-24">
				<div className="max-w-5xl mx-auto flex flex-col gap-16">
					<GlassPanel className="p-8 lg:p-12 border-l-4 border-l-accent-sky shadow-2xl group transition-colors hover:border-l-accent-indigo">
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
