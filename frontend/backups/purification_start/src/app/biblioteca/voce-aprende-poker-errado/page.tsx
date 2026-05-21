/**
 * IDENTITY: A Amortização da Edge (Artigo Interativo)
 * PATH: src/app/biblioteca/voce-aprende-poker-errado/page.tsx
 * ROLE: Artigo técnico demonstrando como a variância e a profundidade de stack amortecem a superioridade técnica.
 */

import { ContentPageHeader } from "@/components/ui/layout/ContentPageHeader";
import PerspectivePanel from "@/components/simulator/panels/PerspectivePanel";
import { GlassPanel } from "@/components/ui/layout/GlassPanel";
import { SotaMarkdown } from "@/components/ui/layout/SotaMarkdown";

const content = `
# A Amortização da Edge

A maior falácia do desenvolvimento de jogadores de poker é a crença de que a "Edge" (vantagem técnica) é uma constante universal. Na **Perspectiva Matemática**, a Edge é elástica e estritamente condicionada à complexidade da árvore de decisões.

Você aprende poker errado quando ignora que a matemática do jogo muda brutalmente dependendo do "espaço de manobra" (stack depth) disponível.

---

## 1. A Geometria da Árvore de Decisão

A superioridade técnica só pode ser exercida se houver ferramentas para tal. Em um pote com **100bb**, o jogo é de *Alta Resolução*. Você possui 3bets, 4bets, check-raises, overbets, e múltiplas *streets* para induzir o oponente ao erro.

Quando a profundidade de stack efetivo cai para a faixa de **10bb a 15bb**, o jogo torna-se de *Baixa Resolução*. A árvore é podada para uma mecânica quase binária: **Push ou Fold**.

---

## 2. O Escudo da Variância

Em stacks curtos, o jogador amador é protegido da própria inabilidade. Se um jogador fraco tem duas opções pré-flop, a margem de erro dele é minimizada. E mesmo quando ele erra feio (pagando um all-in com mão dominada), a matemática crua do baralho frequentemente o "salva" com 30% a 40% de equidade.

A variância atua como um **amortecedor da sua Edge**. O lucro maciço que você extrairia manobrando-o no pós-flop é aniquilado pela brutal simplicidade do cenário pré-flop.

---

## 3. O Colapso e a Abstenção

Observe no Laboratório de Perspectiva abaixo como essa interação é precificada. Em cenários onde sua *Edge Relativa* é alta (você domina a mesa), a Métrica Soberana exige que você preserve o seu capital contra colisões de alta variância.

O solver GTO padrão pode gritar para você pagar (ChipEV marginalmente positivo), mas a Perspectiva exige a abstenção do risco em favor de uma oportunidade mais complexa, onde a sua Edge possa ser integralmente convertida em lucro sem o escudo da variância para salvar o oponente.
`;

export default function AmortizacaoEdgePage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-bright pb-24">
      <ContentPageHeader
        title="A Amortização da Edge"
        subtitle="Por que você aprende poker errado: A degradação da superioridade técnica em ecossistemas de baixa resolução."
        category="Laboratórios & Exegese"
        icon="fa-shield-halved"
      />

      <div className="sota-container py-12 md:py-24">
        <div className="max-w-5xl mx-auto flex flex-col gap-16">
          <GlassPanel className="p-8 lg:p-12 border-l-4 border-l-accent-indigo shadow-2xl group transition-colors hover:border-l-accent-emerald">
            <SotaMarkdown content={content} />
          </GlassPanel>

          <div className="w-full relative z-10">
            <PerspectivePanel
              initialStacks={[15, 35, 45, 20]}
              initialPrizes={[1000, 600, 350, 200]}
              initialActivePlayers={4}
              currentPotBb={16.5}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
