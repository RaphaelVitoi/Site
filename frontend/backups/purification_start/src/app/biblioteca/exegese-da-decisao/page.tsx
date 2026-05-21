/**
 * IDENTITY: Exegese da Decisão (Artigo Interativo)
 * PATH: src/app/biblioteca/exegese-da-decisao/page.tsx
 * ROLE: Artigo técnico imersivo demonstrando a desconstrução algorítmica da decisão de Poker.
 */

import { ContentPageHeader } from "@/components/ui/layout/ContentPageHeader";
import { GtoCfrContent } from "@/components/simulator/GtoCfrContent";
import { GlassPanel } from "@/components/ui/layout/GlassPanel";
import { SotaMarkdown } from "@/components/ui/layout/SotaMarkdown";

const content = `
# A Exegese da Decisão

A tomada de decisão no poker de alta performance não é um evento instantâneo; é um **processo de exegese**. É a desconstrução estrutural e cronológica de como a mente de um Operador Soberano (ou uma IA SOTA) processa o caos do jogo antes de agir.

---

## 1. A Tríade da Resolução

Para que uma decisão atinja a Fricção Zero sob pressão severa, ela deve atravessar três camadas de validação, expostas em tempo real no nosso Laboratório Quântico abaixo:

*   **A Matriz Bayesiana (Passado/Preconceito):** Antes das cartas serem distribuídas, nós já temos um *Prior*. A Mente Bayesiana contrai o range do oponente baseando-se na textura do board e na frequência populacional.
*   **O Perfil Preditivo (O Fator Ψ):** A IA avalia a Telemetria: o oponente tem aversão ao risco? Ele superestima a vida de torneio? O Fator Ψ distorce o baseline teórico para explorar o medo humano de forma implacável.
*   **O CFR Engine (O Futuro/Arrependimento):** O *Counterfactual Regret Minimization* joga a mão contra si mesmo milhões de vezes na VRAM. Ele não busca a "vitória imediata"; ele navega pela árvore para encontrar a linha de dimensionamento (A* Pathfinding) que gerará o **menor arrependimento matemático possível**.

---

## 2. A Convergência SOTA

O amador tenta adivinhar as cartas. O solver comercial (legado) assume que o oponente é perfeito. A **Perspectiva Matemática** encontra o abismo entre os dois: ela utiliza o CFR para demarcar os limites da matemática fria, e o Perfil Preditivo para capturar a irracionalidade tática.

"A exegese da decisão é aceitar que o Call ou o Fold é apenas o sintoma final de uma cascata inegociável de probabilidades."
`;

export default function ExegeseDecisaoPage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-bright pb-24">
      <ContentPageHeader
        title="Exegese da Decisão"
        subtitle="A desconstrução crônica da tomada de ação através da Tríade GTO/CFR: Arrependimento, Inferência Bayesiana e Modelagem Preditiva."
        category="Inteligência Artificial"
        icon="fa-network-wired"
      />

      <div className="sota-container py-12 md:py-24">
        <div className="max-w-5xl mx-auto flex flex-col gap-16">
          <GlassPanel className="p-8 lg:p-12 border-l-4 border-l-accent-emerald shadow-2xl">
            <SotaMarkdown content={content} />
          </GlassPanel>

          <div className="w-full relative z-10">
            <GtoCfrContent />
          </div>
        </div>
      </div>
    </div>
  );
}
