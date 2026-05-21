/**
 * IDENTITY: Masterclass 1.2 - Heurísticas de ICM no Pós-Flop
 * PATH: src/app/biblioteca/heuristica-icm-pos-flop-aula/page.tsx
 * ROLE: Aula técnica completa com imagens de solver e comparativos.
 */

import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import { SotaMarkdown } from '@/components/ui/layout/SotaMarkdown';
import ContentFooter from '@/components/ui/layout/ContentFooter';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { ROUTES } from '@/constants/routes';
import { SITE_CONFIG } from '@/constants/site';

const content = `
# Masterclass 1.2: Entendendo o ICM e suas Heurísticas
### Aplicações de Risk Premium no Pós-Flop

Nesta aula, realizamos um comparativo exegético entre o modelo linear (**ChipEV - GTO Wizard**) e o modelo utilitário (**ICMev - HRC Pós-Flop**) em uma Mesa Final de 126 entradas.

---

## 1. O Ponto de Partida: Risk Advantage

Analisamos um spot clássico de **BTN vs BB**.
*   **BU (38bb):** Risk Premium de 21.4%
*   **BB (53bb):** Risk Premium de 12.9%
*   **Risk Advantage:** +8.5% para o BTN.

O BTN possui a "autorização matemática" para ser o agressor dominante, pois sua sobrevivência está menos ameaçada em termos relativos de valuation de stack do que a do BB, apesar de ter menos fichas nominais.

---

## 2. A Mutação do Flop (C-bet vs Check)

No ChipEV, o agressor mantém o "piloto automático" de agressão. Sob ICM:
1.  **Aumento substancial de Checks:** A preservação de valuation desencoraja inflar o pote.
2.  **Sizings de Controle:** Apostas de 20% a 25% dominam a árvore.

![Comparativo de Linhas de C-bet](/images/aulas/entendendo-o-icm-e-suas-heuristicas/image1.png)

---

## 3. O Colapso do Bluffcatcher

Quando o pote atinge o River, o **Pot Entrapment** (Aprisionamento) força o defensor a um dilema brutal. O EV do Fold não é mais zero; é o total investido. 

![Matriz de Defesa River](/images/aulas/entendendo-o-icm-e-suas-heuristicas/image7.png)

*Note na imagem acima como o range de call do BB "derrete" nas extremidades. Mãos marginais que seriam call por pot odds puras tornam-se folds obrigatórios pela Perspectiva de sobrevivência.*

---

## 4. O Fenômeno do Bunching Effect

O HRC Pós-Flop introduz uma variável que o GTO Wizard ignora: o impacto das cartas descartadas pelos outros 7 jogadores da mesa. Isso altera a densidade de blockers no board, tornando a leitura de range bayesiana muito mais precisa.

---

## 5. Conclusões Práticas

*   **Sizings Pequenos:** São a ferramenta de mitigação de variância.
*   **Agressão Seletiva:** O teto do RP proíbe overbluffs sem blockers de alta fidelidade.
*   **Check-Back:** AA e KK devem ser checkados com mais frequência para controlar o SPR e evitar o "Pacto Silencioso" sendo quebrado prematuramente.
`;

export default function MasterclassLessonPage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-bright">
      <ContentPageHeader
        title="Masterclass 1.2"
        subtitle="Heurísticas de ICM no Pós-Flop: A ciência por trás da dissipação do Risk Premium."
        category="Aula Técnica"
        icon="fa-chalkboard-user"
      />

      <div className="sota-container py-12 md:py-24">
        <div className="max-w-4xl mx-auto">
          <GlassPanel className="p-8 lg:p-12">
            <SotaMarkdown content={content} />
          </GlassPanel>
        </div>
      </div>

      <ContentFooter 
        shareTitle={`Masterclass 1.2: ICM no Pós-Flop | ${SITE_CONFIG.author}`}
        shareUrl={`${SITE_CONFIG.baseUrl}${ROUTES.LIBRARY.HEURISTICA_POS_FLOP}`}
        backLinkHref={ROUTES.BIBLIOTECA} 
        backLinkText="Voltar para Biblioteca"
      />
    </div>
  );
}
