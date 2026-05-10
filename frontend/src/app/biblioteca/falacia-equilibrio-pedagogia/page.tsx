/**
 * IDENTITY: A Falácia do Equilíbrio (Pedagogia Poker)
 * PATH: src/app/biblioteca/falacia-equilibrio-pedagogia/page.tsx
 * ROLE: Artigo sobre a evolução do aprendizado de poker e o fim do edge pré-flop.
 */

import { ContentPageHeader } from '@/components/layout/ContentPageHeader';
import { SotaMarkdown } from '@/components/ui/SotaMarkdown';
import ContentFooter from '@/components/content/ContentFooter';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { GlassPanel } from '@/components/ui/GlassPanel';

const content = `
# A Falácia do Equilíbrio: Por que você aprende Poker errado

O Poker evoluiu, e o seu edge no pré-flop está desaparecendo. Hoje, solvers resolveram as tabelas de Push/Fold. O gap de habilidade entre você e o oponente médio nessa área é mínimo. O dinheiro real está sendo ganho e perdido silenciosamente na **Nova Fronteira: O ICM Pós-Flop**.

---

## 1. O Custo Invisível do ChipEV

Dados recentes revelam uma verdade brutal: jogar uma estratégia padrão de ChipEV (focada apenas em acumular fichas) em spots de mesa final custa, em média, **10% a 12% de todo o seu ROI**. 

Em potes 3-bet? O erro pode custar mais de **30% do valor da jogada**. Você grindou 8 horas para chegar na FT e devolve o lucro em duas c-bets mal calibradas porque usou a matemática linear no universo não-linear do ICM.

---

## 2. A Heurística do Downward Drift

O "Downward Drift" é o ajuste automático de sizings e frequências para a realidade do ICM. 
*   **Contração de Ranges:** Sua equidade mínima para call aumenta.
*   **Rebaixamento de Sizings:** Apostas grandes tornam-se polarizadas demais e arriscam valuation de stack desnecessário.
*   **Aversão à Colisão:** O valor de "passar a vez" (inércia) muitas vezes supera o ganho marginal de fichas.

---

## 3. A Mesa como Organismo (Antevisão)

Dominar a **Antevisão** significa olhar para a mesa e ver o "campo de força" do Risk Premium antes mesmo de receber as cartas. 

A maestria não está mais nas cartas que você recebe, mas na precisão com que você avalia o risco sistêmico de jogá-las. O Poker não é sobre "ganhar o pote", é sobre gerir a **Perspectiva de Capital** da sua stack em relação ao prêmio final.

---

## 4. Conclusões para o Aluno SOTA

Profissionalismo no Poker Racional não é um salário, é uma maneira de se conectar a um sistema complexo. 
1.  **Esqueça o Snapshot:** O ICM não é um botão que liga na bolha. Ele é um fluxo constante.
2.  **Solvers são Mapas, não Territórios:** Use-os para isolar variáveis, mas lembre-se que humanos apresentam défices crônicos de agressão no river.
3.  **Proteja sua Alavancagem:** Perder fichas para o vice-líder é pior do que ganhar fichas do short-stack. O Kingmaker é um desastre tático.
`;

export default function FalaciaEquilibrioPage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-bright">
      <ContentPageHeader
        title="A Falácia do Equilíbrio"
        subtitle="Por que o aprendizado tradicional de poker está falhando e como o Downward Drift mudou o jogo."
        category="Pedagogia"
        icon="fa-graduation-cap"
      />

      <div className="sota-container py-12 md:py-24">
        <div className="max-w-4xl mx-auto">
          <GlassPanel className="p-8 lg:p-12 border-l-4 border-l-accent-amber">
            <SotaMarkdown content={content} />
          </GlassPanel>
        </div>
      </div>

      <ContentFooter 
        shareTitle="A Falácia do Equilíbrio | Raphael Vitoi"
        shareUrl="https://www.raphaelvitoi.com/biblioteca/falacia-equilibrio-pedagogia"
        backLinkHref="/biblioteca" 
        backLinkText="Voltar para Biblioteca"
      />
    </div>
  );
}
