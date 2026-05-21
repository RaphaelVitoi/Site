/**
 * IDENTITY: Axioma do EV Fold Dinâmico (Artigo Interativo)
 * PATH: src/app/biblioteca/axioma-ev-fold-dinamico/page.tsx
 * ROLE: Artigo técnico expondo a ilusão do EV = 0 e a dinâmica de Sunk Cost.
 */

import { ContentPageHeader } from "@/components/layout/ContentPageHeader";
import PmLensPanel from "@/components/simulator/panels/PmLensPanel";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { SotaMarkdown } from "@/components/ui/SotaMarkdown";

const content = `
# O Axioma do EV Fold Dinâmico

A falha primária da intuição humana (e da leitura superficial de solvers) é assumir que desistir de uma mão possui Valor Esperado igual a zero. No paradigma da **Perspectiva Matemática**, o zero não existe. O Fold é uma transação financeira passiva e sempre tem um custo estrutural.

---

## 1. A Ilusão do EV = 0
Solvers comerciais geralmente normalizam o EV do fold para \`0.00\` para simplificar a comparação logarítmica entre os ramos da árvore. Na física real do torneio, o fold possui uma dívida irrevogável: o **Custo de Existência (Antes)** e o **Custo Afundado (Sunk Cost)**.

Se você investiu 2.5bb pré-flop e enfrenta uma agressão maciça no turn, o seu EV de desistência não é zero; é \`-2.5bb\` (além da erosão natural imposta pela órbita). O EV do Fold atua como a verdadeira âncora gravitacional do *spot*.

---

## 2. O Piso Dinâmico
O Axioma dita que: *"Qualquer decisão com EV puramente negativo será lucrativa pela Lente da Perspectiva se o Custo Afundado da desistência for ainda pior."*

Se o EV de um call for \`-1.5bb\`, a intuição básica grita "Fold". Mas se você já possui \`3.0bb\` mortos no pote, o seu EV do Fold é \`-3.0bb\`. Executar a ação e "perder menos" (\`-1.5bb\`) é um lucro relativo massivo em Perspectiva de sobrevivência.

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
