/**
 * IDENTITY: O Fator Psi (Ψ) - Maluquice Humana
 * PATH: src/app/biblioteca/fator-psi-maluquice-humana/page.tsx
 * ROLE: Artigo técnico-psicológico sobre a precificação do erro emocional.
 */

import { ContentPageHeader } from '@/components/layout/ContentPageHeader';
import { SotaMarkdown } from '@/components/ui/SotaMarkdown';
import ContentFooter from '@/components/content/ContentFooter';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { GlassPanel } from '@/components/ui/GlassPanel';

const content = `
# O Fator Ψ (Psi): A Taxa de Maluquice Humana

No Poker de laboratório, assumimos que o oponente é uma máquina fria de GTO. Na realidade das Mesas Finais, as decisões são atravessadas pela **"taxa de besteira emocional"**.

---

## 1. O Erro da Resiliência Espelhada

Ignorar o desvio emocional populacional é um erro fatal na teoria básica. Se pensarmos que o oponente tem a mesma edge e resiliência que nós, erraremos o call no River 100% das vezes.

Todos os jogadores, em menor ou maior grau, possuem uma frequência de **"Bobagem Humana"** ($f_b$).

---

## 2. A Equação do Call Soberano

A probabilidade de um call ser vencedor não é apenas a frequência de bluffs teóricos, mas sim a soma da integridade do range com a entropia do oponente:

> **P(Call Ganho) = P(Nuts Representado) + P(Tilt / Bluff Irracional)**

Se a probabilidade do oponente ter os combos de topo é de **4%**, mas a taxa estatística de erro cognitivo naquele spot é de **10%**, o call é obrigatório por Perspectiva, mesmo que o GTO dite o fold.

---

## 3. O Fator Ψ como Amortecedor

Embora as Reverse Implied Odds (RIO) em Multiway sejam brutais ($x^2$), o Fator Ψ atua como um leve amortecedor. Se o oponente é "maluco", a probabilidade dele estar blefando de forma errada empurra a utilidade do seu call para cima.

No entanto, o benefício da "besteira" deve ser rigorosamente maior que a dívida catastrófica do sistema (RIO + ICM).

---

## 4. Aplicação Prática: O "Tilt-Lock"

Quando você identifica que um oponente atingiu o ponto de ruptura emocional:
1.  **Expanda a Defesa:** Seu threshold de call cai drasticamente.
2.  **Reduza o Blefe:** Contra jogadores em tilt, o range de call deles torna-se inelástico. A Thin Value (valor fino) torna-se sua ferramenta soberana.

"A matemática serve para precificar o custo da habilidade. O Fator Ψ serve para precificar o custo da fraqueza humana."
`;

export default function FatorPsiPage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-bright">
      <ContentPageHeader
        title="O Fator Psi (Ψ)"
        subtitle="Maluquice Humana: Como integrar a frequência de erro emocional e tilt na tomada de decisão de elite."
        category="Psicologia"
        icon="fa-brain"
      />

      <div className="sota-container py-12 md:py-24">
        <div className="max-w-4xl mx-auto">
          <GlassPanel className="p-8 lg:p-12 border-t-8 border-t-accent-rose">
            <SotaMarkdown content={content} />
          </GlassPanel>
        </div>
      </div>

      <ContentFooter 
        shareTitle="O Fator Psi (Ψ) | Raphael Vitoi"
        shareUrl="https://www.raphaelvitoi.com/biblioteca/fator-psi-maluquice-humana"
        backLinkHref="/biblioteca" 
        backLinkText="Voltar para Biblioteca"
      />
    </div>
  );
}
