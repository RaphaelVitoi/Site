/**
 * IDENTITY: O Axioma do EV do Fold Dinâmico
 * PATH: src/app/biblioteca/axioma-ev-fold-dinamico/page.tsx
 * ROLE: Artigo técnico sobre o custo de oportunidade do fold e sua positividade em ICM.
 */

import { ContentPageHeader } from '@/components/layout/ContentPageHeader';
import { SotaMarkdown } from '@/components/ui/SotaMarkdown';
import ContentFooter from '@/components/content/ContentFooter';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { GlassPanel } from '@/components/ui/GlassPanel';

const introduction = `
A premissa comercial dos solvers de que "foldar tem EV zero" é uma falácia de simplificação pedagógica que oculta o custo de oportunidade. No paradigma VITOI, o fold é uma transação de capital onde se aceita uma perda garantida para evitar um risco.

### O Piso da Órbita
Em ChipEV, o seu baseline não é zero, mas sim o custo de existência:
**EV_fold = -antes** (ex: -0.125bb). 

Para uma ação ser matematicamente coerente, seu EV não precisa ser absoluto e positivo; basta ser superior a esse "abismo" negativo.
`;

const icmSection = `
No ICM, o EV_fold torna-se uma variável dinâmica e, frequentemente, **positiva**.

1.  **Efeito Payjump:** Quando a inércia garante a eliminação de shorts, gerando payjumps passivos sem risco. Aqui, foldar tem valor de investimento em sobrevivência.
2.  **Erosão Antecipada (t-3):** A proximidade do aumento de blinds acelera o EV_fold para território negativo, forçando a agressão para evitar a morte por inanição.
`;

const postFlopSection = `
Conforme as fichas entram no pote, o EV_fold torna-se violentamente negativo. A desistência do pote acumulado custa exponencialmente mais em valuation do que o risco de colisão residual.

*   **Flop:** EV_fold ≈ -antes (Barato)
*   **River:** EV_fold = -pot_total_hero (Catastrófico)

Essa "gravidade" aproxima as decisões de call no river do ChipEV, pois o custo de desistir do investimento acumulado supera a pressão de ICM original.
`;

export default function AxiomaEvFoldPage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-bright">
      <ContentPageHeader
        title="Axioma do EV do Fold"
        subtitle="Por que foldar quase nunca tem EV zero e como o ICM pode tornar o fold positivo."
        category="Teoria"
        icon="fa-door-open"
      />

      <div className="sota-container py-12 md:py-24">
        <SectionHeader
          step="01"
          label="Baseline"
          title="O Abismo do Fold"
          description="Desconstruindo a simplificação de EV=0."
        />
        <div className="max-w-4xl mx-auto mb-16">
          <GlassPanel className="p-8">
            <SotaMarkdown content={introduction} />
          </GlassPanel>
        </div>

        <SectionHeader
          step="02"
          label="ICM"
          title="O Paradoxo do Fold Positivo"
          description="Quando a inércia vale mais que a equidade."
        />
        <div className="max-w-4xl mx-auto mb-16">
          <GlassPanel className="p-8 border-l-4 border-l-accent-emerald">
            <SotaMarkdown content={icmSection} />
          </GlassPanel>
        </div>

        <SectionHeader
          step="03"
          label="Pós-Flop"
          title="Pot Entrapment"
          description="O aprisionamento ao investimento acumulado."
        />
        <div className="max-w-4xl mx-auto">
          <GlassPanel className="p-8 border-l-4 border-l-accent-danger">
            <SotaMarkdown content={postFlopSection} />
          </GlassPanel>
        </div>
      </div>

      <ContentFooter 
        shareTitle="Axioma do EV do Fold | Raphael Vitoi"
        shareUrl="https://www.raphaelvitoi.com/biblioteca/axioma-ev-fold-dinamico"
        backLinkHref="/biblioteca" 
        backLinkText="Voltar para Biblioteca"
      />
    </div>
  );
}
