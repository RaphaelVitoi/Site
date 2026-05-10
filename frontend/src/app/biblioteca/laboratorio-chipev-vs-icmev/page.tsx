/**
 * IDENTITY: Laboratório: ChipEV vs ICMev Pós-Flop
 * PATH: src/app/biblioteca/laboratorio-chipev-vs-icmev/page.tsx
 * ROLE: Artigo técnico comparativo entre solvers (GTO Wizard vs HRC).
 */

import { ContentPageHeader } from '@/components/layout/ContentPageHeader';
import { SotaMarkdown } from '@/components/ui/SotaMarkdown';
import ContentFooter from '@/components/content/ContentFooter';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { GlassPanel } from '@/components/ui/GlassPanel';
import Image from 'next/image';

const content = `
# Laboratório: ChipEV vs ICMev Pós-Flop

Este estudo clínico compara as árvores de decisão pós-flop entre o modelo linear (**GTO Wizard - ChipEV**) e o modelo utilitário (**HRC - ICMev**) em um cenário de Mesa Final (9-max).

---

## 1. Divergência de Arquitetura

Embora os inputs pré-flop sejam idênticos, a forma como os motores processam o pós-flop diverge drasticamente:

*   **Bunching Effect:** O HRC leva em conta as cartas descartadas por todos os 7 jogadores que deram fold, alterando a densidade do range restante. O GTO Wizard foca apenas no heads-up ativo.
*   **Valuation Context:** O GTO Wizard olha apenas para a stack efetiva. O HRC analisa a topografia completa da mesa (stacks dos observadores), o que é vital para o cálculo do ICMev real.

---

## 2. O Caso Clínico: BTN vs BB (FT 11$ Vanilla)

**Configuração:**
*   **Stacks:** BTN (38bb) vs BB (53bb)
*   **Risk Premium:** BU (21.4%) | BB (12.9%)
*   **Risk Advantage:** +8.5% a favor do BTN.

### Comparação de Frequências (Flop)

No ChipEV, o agressor mantém frequências de c-bet mais elevadas e sizings polarizados. No ICMev, observamos:
1.  **Aumento substancial de Checks:** A preservação de valuation desencoraja inflar o pote sem vantagem absoluta.
2.  **Migração para Small Sizings:** O uso de 20% a 25% do pote torna-se a norma para controlar a variância da stack.

---

## 3. Visualização de Dados (Solver Analysis)

Abaixo, observamos a mutação da matriz de defesa do BB quando o Risk Premium de 12.9% é injetado:

![Matriz de Defesa BB - ICMev](/images/aulas/entendendo-o-icm-e-suas-heuristicas/image10.png)

*Observação: Note o overfold estrutural em mãos que seriam calls automáticos em ChipEV (ex: KJo em certos boards).*

### A Linha de X-Raise
Quando o BB aplica o Check-Raise sob ICM, o range do BTN (IP) torna-se "pegajoso" (sticky) para proteger a equidade investida, mas colapsa no River perante agressões que ameaçam a sobrevivência total.

---

## 4. Conclusões de Laboratório

O aumento na frequência de checks e a preferência por sizings menores destacam a influência do **Axioma da Sobrevivência**. O entendimento detalhado desta dissipação de Risk Premium por street é o que separa o profissional AHSD do regular de tabelas decoradas.
`;

export default function LaboratorioComparativoPage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-bright">
      <ContentPageHeader
        title="Laboratório SOTA"
        subtitle="Divergência Clínica: Comparativo entre ChipEV (GTO Wizard) e ICMev (HRC) no pós-flop."
        category="Estudo de Caso"
        icon="fa-flask-vial"
      />

      <div className="sota-container py-12 md:py-24">
        <div className="max-w-4xl mx-auto">
          <GlassPanel className="p-8 lg:p-12">
            <SotaMarkdown content={content} />
          </GlassPanel>
        </div>
      </div>

      <ContentFooter 
        shareTitle="Laboratório: ChipEV vs ICMev | Raphael Vitoi"
        shareUrl="https://www.raphaelvitoi.com/biblioteca/laboratorio-chipev-vs-icmev"
        backLinkHref="/biblioteca" 
        backLinkText="Voltar para Biblioteca"
      />
    </div>
  );
}
