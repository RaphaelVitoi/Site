/**
 * IDENTITY: Laboratório ChipEV vs ICMev (Artigo Interativo)
 * PATH: src/app/biblioteca/laboratorio-chipev-vs-icmev/page.tsx
 * ROLE: Artigo técnico demonstrando a diferença prática entre valor esperado de fichas e valor esperado monetário.
 */

import { ContentPageHeader } from "@/components/ui/layout/ContentPageHeader";
import EquityCalculator from "@/components/simulator/panels/EquityCalculator";
import { GlassPanel } from "@/components/ui/layout/GlassPanel";
import { SotaMarkdown } from "@/components/ui/layout/SotaMarkdown";

const content = `
# Laboratório: ChipEV vs ICMev

A transição do **ChipEV** (Expected Value em Fichas) para o **ICMev** (Independent Chip Model Expected Value) é o rito de passagem para o poker de alta performance. Ignorar essa assimetria é aceitar a ruína a longo prazo em torneios.

---

## 1. A Ilusão da Proporcionalidade (ChipEV)

No início de um torneio (ou em Cash Games), as fichas têm um valor linear. Se você dobra o seu stack, você dobra a sua equidade no jogo. O modelo **ChipEV** assume que 10% das fichas do torneio equivalem a 10% da premiação.

A falácia dessa métrica em estágios avançados (Mesa Final, Bolha) é letal. O ChipEV ignora a estrutura de *payouts* e o fato de que a última ficha que você possui (sua "vida" no torneio) vale infinitamente mais do que a primeira ficha que você ganha do oponente.

---

## 2. A Gravidade do ICM (Malmuth-Harville)

O **ICMev** não mede fichas; ele mede o **Valuation Real ($)** do seu stack com base na probabilidade matemática de você terminar em cada posição premiada.

**Os Axiomas do ICM:**
1. Fichas ganhas valem *menos* do que fichas perdidas (Risco Premium).
2. O Chip Leader sofre menos pressão (Bubble Factor menor) e, portanto, pode agredir ranges mais amplos.
3. Stacks médios (Mid-stacks) são reféns da sobrevivência, não podendo colidir entre si sem destruir o próprio *valuation* em favor do Chip Leader ou do Short Stack.

---

## 3. O Laboratório de Distorção

Utilize a Calculadora Malmuth-Harville abaixo. Modifique a estrutura de premiação e os stacks dos jogadores. Observe a coluna **Delta**: ela revela o abismo entre o que as suas fichas representam (Prop. %) e o seu verdadeiro valor financeiro (ICM Eq %).
`;

export default function ChipEvVsIcmEvPage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-bright pb-24">
      <ContentPageHeader
        title="Laboratório ChipEV vs ICMev"
        subtitle="A distinção fundamental entre acumular plástico (fichas) e proteger patrimônio (valuation) na mesa final."
        category="Mecânica & ICM"
        icon="fa-scale-unbalanced"
      />

      <div className="sota-container py-12 md:py-24">
        <div className="max-w-5xl mx-auto flex flex-col gap-16">
          <GlassPanel className="p-8 lg:p-12 border-l-4 border-l-accent-indigo shadow-2xl group transition-colors hover:border-l-accent-emerald">
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
