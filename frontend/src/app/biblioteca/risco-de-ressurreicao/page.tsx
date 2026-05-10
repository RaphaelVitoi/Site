/**
 * IDENTITY: O Risco de Ressurreição
 * PATH: src/app/biblioteca/risco-de-ressurreicao/page.tsx
 * ROLE: Artigo técnico sobre o valor estratégico de manter oponentes neutralizados.
 */

import { ContentPageHeader } from '@/components/layout/ContentPageHeader';
import { SotaMarkdown } from '@/components/ui/SotaMarkdown';
import ContentFooter from '@/components/content/ContentFooter';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { GlassPanel } from '@/components/ui/GlassPanel';
import ResurrectionRiskSimulator from '@/components/simulator/ResurrectionRiskSimulator';

const content = `
# O Risco de Ressurreição
### Por que dobrar um Short Stack é um erro sistêmico

No paradigma GTO/ICM puro, o call é frequentemente justificado por uma fração positiva de EV ($+0.05bb$ ou similar). Contudo, a **Perspectiva Matemática** introduz uma variável estratégica superior: o valor da neutralização do oponente.

---

## 1. O Colapso da Árvore de Decisão

Um oponente com 10bb está confinado à simplicidade binária do Push/Fold. Sua capacidade de exercer edge (vantagem técnica) é nula; ele não pode errar no pós-flop se o jogo termina antes do flop.

Quando você (Chip Leader) paga um shove marginal e perde, você não apenas perde fichas nominais; você devolve a ele a **Complexidade da Árvore**.

*   **10bb:** Inofensivo (Software limitado).
*   **20bb:** Perigoso (Pode abrir, c-betar, aplicar pressão de fold).

---

## 2. A Amortização da Edge pela Variância

O jogador fraco é "menos ruim" com 10bb porque o conhecimento de Push/Fold é comoditizado. O erro de um call marginal contra ele é "perdoado" pela variância estatística em ~40% das vezes. 

Manter o oponente com 10bb tem um valor de **Controle de Sistema** superior ao ganho aritmético do call. Ao dobrá-lo, você restaura as ferramentas de erro que a stack curta havia retirado dele.

---

## 3. O Kingmaker: Um Desastre Tático

Pagar o Vice-Líder é o maior erro de Perspectiva. Se você o dobra, você cria um monstro com alavancagem suficiente para usurpar sua coroa. 

O Future Game Simulation (FGS) penaliza essa agressividade, mas a Antevisão Humana deve ser ainda mais rigorosa: **não crie carrascos**.

---

## 4. Conclusão SOTA

"O verdadeiro erro na bolha não é o call matemático; é o call que devolve a complexidade ao oponente que estava neutralizado pela simplicidade."

Mantenha os mortos-vivos no cemitério estratégico. Proteja seu Valuation e sua hegemonia de mesa.
`;

export default function RiscoRessurreicaoPage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-bright">
      <ContentPageHeader
        title="Risco de Ressurreição"
        subtitle="O valor invisível de manter oponentes neutralizados e por que ignorar um EV marginal pode ser a jogada soberana."
        category="Estratégia"
        icon="fa-skull-crossbones"
      />

      <div className="sota-container py-12 md:py-24">
        <div className="mb-16">
          <ResurrectionRiskSimulator />
        </div>

        <div className="max-w-4xl mx-auto">
          <GlassPanel className="p-8 lg:p-12 border-l-4 border-l-accent-emerald">
            <SotaMarkdown content={content} />
          </GlassPanel>
        </div>
      </div>

      <ContentFooter 
        shareTitle="O Risco de Ressurreição | Raphael Vitoi"
        shareUrl="https://www.raphaelvitoi.com/biblioteca/risco-de-ressurreicao"
        backLinkHref="/biblioteca" 
        backLinkText="Voltar para Biblioteca"
      />
    </div>
  );
}
