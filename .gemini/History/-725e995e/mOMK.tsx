/**
 * IDENTITY: O Downward Drift no ICM
 * PATH: src/app/biblioteca/downward-drift-sota/page.tsx
 * ROLE: Artigo técnico sobre a compressão de sizings em situações de pressão monetária.
 */

import ContentFooter from "@/components/content/ContentFooter";
import { ContentPageHeader } from "@/components/layout/ContentPageHeader";
import { DownwardDriftSimulator } from "@/components/simulator/DownwardDriftSimulator";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { SotaMarkdown } from "@/components/ui/SotaMarkdown";
import { ROUTES } from "@/constants/routes";
import { SITE_CONFIG } from "@/constants/site";

const content = `
# Downward Drift: A Gravidade do Dinheiro

O **Downward Drift** é o fenômeno onde a árvore de decisão inteira de um jogador "escorrega" para baixo em termos de agressividade e tamanho de aposta conforme a pressão do ICM aumenta.

---

## 1. A Escala Gravitacional

Em situações sem ICM (ChipEV), as overbets e apostas grandes (75%+) são comuns para maximizar o valor. Sob ICM pesado:
*   A overbet desaparece.
*   O sizing de 75% torna-se 33%.
*   O sizing de 33% torna-se check.

Esta compressão não é medo; é a matemática otimizando a preservação do valuation.

---

## 2. A Ilusão do Passivo

Um observador amador olhará para uma Mesa Final de High Stakes e dirá que os jogadores estão "jogando tight" ou "passivos". Na verdade, eles estão operando sob o **Downward Drift**. Quando cada ficha perdida vale 2x mais do que cada ficha ganha, a agressão seletiva e o controle de pote tornam-se as ferramentas de elite.

---

## 3. Explorando a Gravidade

O Operador Soberano identifica quando o oponente está sofrendo um Downward Drift mais severo do que o necessário (medo irracional). Nesses spots, o blefe pequeno (small bluff) tem uma eficiência de 100%, pois o oponente está matematicamente — e emocionalmente — proibido de colidir.

"O Downward Drift é a gravidade do payout moldando a arquitetura da aposta."
`;

export default function DownwardDriftPage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-bright pb-24">
      <ContentPageHeader
        title="Downward Drift"
        subtitle="Entenda a compressão mecânica de sizings em Mesas Finais e como a gravidade do prêmio altera a agressão."
        category="Mecânica Nash"
        icon="fa-arrow-down-wide-short"
      />

      <div className="sota-container py-12 md:py-24">
        <div className="max-w-4xl mx-auto">
          <GlassPanel className="p-8 lg:p-12 border-l-4 border-l-accent-indigo">
            <SotaMarkdown content={content} />
          </GlassPanel>
          <div className="mt-16">
            <DownwardDriftSimulator />
          </div>
        </div>
      </div>

      <ContentFooter
        shareTitle={`Downward Drift | ${SITE_CONFIG.author}`}
        shareUrl={`${SITE_CONFIG.baseUrl}${ROUTES.LIBRARY.DOWNWARD_DRIFT}`}
        backLinkHref={ROUTES.BIBLIOTECA}
        backLinkText="Voltar para Biblioteca"
      />
    </div>
  );
}
