/**
 * IDENTITY: Masterclass 1.2 GOLD - Heurísticas de ICM no Pós-Flop
 * PATH: src/app/biblioteca/heuristica-icm-pos-flop-aula/page.tsx
 * ROLE: Aula técnica completa com imagens de solver e comparativos.
 * VERSION: v7.0 GOLD
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

Esta aula usa um cenário ilustrativo de comparação entre ChipEV e ICM pós-flop. Qualquer número depende da árvore, ranges, payouts, versões de ferramenta e configuração reproduzível.

---

## 1. O Ponto de Partida: Risk Advantage

Analisamos um spot clássico de **BTN vs BB**.
*   **BU (38bb):** Risk Premium de 21.4%
*   **BB (53bb):** Risk Premium de 12.9%
*   **Risk Advantage:** +8.5% para o BTN.

Esses números só podem sugerir uma assimetria no cenário declarado; não autorizam agressão dominante sem comparar ranges, posições, sizings e árvore completa.

---

## 2. A Mutação do Flop (C-bet vs Check)

No ChipEV, o agressor mantém o "piloto automático" de agressão. Sob ICM:
1. **Hipótese de mais checks:** preservação de valuation pode desencorajar inflar o pote em algumas árvores.
2. **Sizings de controle:** apostas pequenas podem aparecer no cenário; não há faixa dominante universal.

![Comparativo de Linhas de C-bet](/images/aulas/entendendo-o-icm-e-suas-heuristicas/image1.png)

---

## 3. O Colapso do Bluffcatcher

Quando o pote atinge o River, o comprometimento de pote altera o preço marginal de continuar. Sob a convenção incremental usada por muitos solvers, o EV do fold continua a linha de base; o investimento prévio é custo afundado.

![Matriz de Defesa River](/images/aulas/entendendo-o-icm-e-suas-heuristicas/image7.png)

*A imagem ilustra uma hipótese de estreitamento de calls. Mãos marginais exigem comparação entre pot odds, ranges, ICM e árvore; não se tornam folds obrigatórios por um rótulo.*

---

## 4. O Fenômeno do Bunching Effect

O HRC Pós-Flop introduz uma variável que o GTO Wizard ignora: o impacto das cartas descartadas pelos outros 7 jogadores da mesa. Isso altera a densidade de blockers no board, tornando a leitura de range bayesiana muito mais precisa.

---

## 5. Conclusões Práticas

*   **Sizings Pequenos:** São a ferramenta de mitigação de variância.
* **Agressão seletiva:** RP pode alterar incentivos de blefe; o efeito precisa ser calculado no spot, sem assumir um teto universal.
*   **Check-Back:** AA e KK devem ser checkados com mais frequência para controlar o SPR e evitar o "Pacto Silencioso" sendo quebrado prematuramente.
`;

export default function MasterclassLessonPage() {
  return (
    <div className="bg-bg-base text-text-bright min-h-screen">
      <ContentPageHeader
        title="Masterclass 1.2"
        subtitle="Heurísticas de ICM no Pós-Flop: A ciência por trás da dissipação do Risk Premium."
        category="Aula Técnica"
        icon="fa-chalkboard-user"
      />

      <div className="sota-container py-12 md:py-24">
        <div className="mx-auto max-w-4xl">
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
