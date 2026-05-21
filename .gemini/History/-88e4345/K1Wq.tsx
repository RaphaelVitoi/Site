/**
 * IDENTITY: A Insolvência das Pot Odds
 * PATH: src/app/biblioteca/insolvencia-das-pot-odds/page.tsx
 * ROLE: Artigo técnico sobre a falência das métricas lineares em sistemas complexos.
 */

import { ContentPageHeader } from "@/components/layout/ContentPageHeader";
import { SotaMarkdown } from "@/components/ui/SotaMarkdown";
import ContentFooter from "@/components/content/ContentFooter";
import { GlassPanel } from "@/components/ui/GlassPanel";

const content = `
# A Insolvência das Pot Odds
### O Veneno mascarado pelo Preço Barato

As **Pot Odds** são uma heurística de baixa resolução, importada de finanças básicas, que atua como uma "muleta" para quem não domina a mecânica profunda do jogo. No paradigma VITOI, elas são frequentemente um **distrator sistêmico**.

---

## 1. O Cavalo de Troia das RIO

As pot odds são o incentivo linear ("está barato, pague") que mascara o passivo estrutural das **Reverse Implied Odds (RIO)**.

*   **Implied Odds (Especulação):** O vetor positivo. A busca por valuation exponencial ao acertar os nuts.
*   **Reverse Implied Odds (Passivo):** O vetor negativo. O custo de "acertar e continuar perdendo" (ex: Flush ao J vs Flush ao A).

O prejuízo nasce do descompasso entre o **preço de entrada** (Odds) e o **custo de saída** (RIO + Perda de Valuation).

---

## 2. A Explosão Multiway (Entropia x2)

Em cenários Multiway (~33% de frequência), a entropia do sistema aumenta exponencialmente. As pot odds parecem ainda mais atrativas (5:1, 6:1), mas a Perspectiva Matemática revela que a probabilidade de colisão catastrófica cresce em uma taxa superior ao desconto do pote.

> **Axioma:** "O overcall no River é frequentemente o sintoma; a negligência das Reverse Implied Odds no Flop/Turn é a causa."

---

## 3. O Coeficiente de Insolvência ($C_i$)

Definimos a saúde de uma decisão pela razão entre a utilidade real (Perspectiva) e o incentivo das odds:

$$C_i = \\frac{Perspectiva}{Pot\\_Odds}$$

Se **$C_i < 1$**, as pot odds mentem. Conforme o número de jogadores no pote aumenta, o $C_i$ mergulha para território negativo, indicando que o call é destrutivo para a saúde do stack e para o FGS (Future Game Simulation).

---

## 4. Veredito SOTA

Para um jogador de elite, as pot odds são apenas o esqueleto de uma decisão. A carne é o ICM e o cérebro é a Perspectiva.

1.  **Iniciante:** Utilidade Alta (evita erros crassos).
2.  **Intermediário:** Utilidade Decrescente (nota que "ter preço" não compensa a falta de realizabilidade).
3.  **Elite (Perspectiva):** **Utilidade Negativa**. O foco nas odds impede a percepção do fluxo sistêmico.
`;

export default function InsolvenciaPotOddsPage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-bright">
      <ContentPageHeader
        title="Insolvência das Pot Odds"
        subtitle="Por que focar no preço imediato é a rota mais rápida para a erosão de stack em Mesas Finais."
        category="Teoria Crítica"
        icon="fa-biohazard"
      />

      <div className="sota-container py-12 md:py-24">
        <div className="max-w-4xl mx-auto">
          <GlassPanel className="p-8 lg:p-12 border-l-4 border-l-accent-rose">
            <SotaMarkdown content={content} />
          </GlassPanel>
        </div>
      </div>

      <ContentFooter
        shareTitle="A Insolvência das Pot Odds | Raphael Vitoi"
        shareUrl="https://www.raphaelvitoi.com/biblioteca/insolvencia-das-pot-odds"
        backLinkHref="/biblioteca"
        backLinkText="Voltar para Biblioteca"
      />
    </div>
  );
}
