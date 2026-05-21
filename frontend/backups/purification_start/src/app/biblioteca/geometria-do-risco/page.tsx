/**
 * IDENTITY: Geometria do Risco
 * PATH: src/app/biblioteca/geometria-do-risco/page.tsx
 * ROLE: Artigo conceitual sobre a estrutura tridimensional do risco.
 */

import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import { SotaMarkdown } from '@/components/ui/layout/SotaMarkdown';
import ContentFooter from '@/components/ui/layout/ContentFooter';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { ROUTES } from '@/constants/routes';
import { SITE_CONFIG } from '@/constants/site';

const content = `
# Geometria do Risco: As 5 Faces do ICM

Muitos jogadores veem o risco como uma linha reta (ganho vs perda). Na Perspectiva Matemática, o risco é um **espaço tridimensional** governado por Equidade, Valuation e Tempo. No paradigma VITOI, o risco manifesta-se em 5 arquétipos geométricos:

---

## 1. ICM 1: O Caos do Bounty (PKO)
Em cenários de PKO, a geometria do risco é invertida. O incentivo do Bounty atua como uma força de atração massiva, diluindo o **Risk Premium**. Aqui, o call é a norma e a agressão é recompensada pela "Equity de Retorno" imediata.

## 2. ICM 2: O Campo Pequeno (Small Field)
Cenários com poucos jogadores (ex: Final de Dia ou torneios restritos). O risco é moderado. A preservação de stack é importante, mas a busca pela liderança da mesa (Chiplead) para exercer pressão futura (FGS) justifica riscos marginais.

## 3. ICM 3: A Aproximação do Dinheiro (ITM)
Onde a linearidade morre. O valor de cada ficha perdida começa a crescer exponencialmente. A abstenção torna-se uma ferramenta de elite para garantir a entrada na premiação, onde o ROI real reside.

## 4. ICM 4: A Bubble de Mesa Final (FT)
O Ponto de Máxima Tensão. A Geometria do Risco atinge seu ápice de complexidade. Pequenas diferenças de stack criam abismos de valuation. Um erro aqui não custa fichas; custa meses de lucro.

## 5. ICM 5: A Mesa Final (Laddering)
A física do Payout domina o jogo. O objetivo não é mais ganhar fichas, mas "não cair antes do próximo". A abstenção é soberana. O EV do Fold frequentemente torna-se o maior valor da mesa.

---

## O Ponto Soberano

O Operador Soberano não toma decisões em 2D. Ele identifica em qual arquétipo geométrico o spot se encontra. Se a decisão cai fora do **Volume de Segurança**, ele abandona a mão, independentemente de quão "bonita" a equidade pareça no papel.

"O poker não é um jogo de cartas; é a navegação precisa em uma geometria de risco hostil."
`;

export default function GeometriaRiscoPage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-bright pb-24">
      <ContentPageHeader
        title="Geometria do Risco"
        subtitle="Vá além do ganho e perda: entenda a estrutura tridimensional que governa cada decisão soberana."
        category="Conceito SOTA"
        icon="fa-cube"
      />

      <div className="sota-container py-12 md:py-24">
        <div className="max-w-4xl mx-auto">
          <GlassPanel className="p-8 lg:p-12 border-t-8 border-t-accent-indigo">
            <SotaMarkdown content={content} />
          </GlassPanel>
        </div>
      </div>

      <ContentFooter 
        shareTitle={`Geometria do Risco | ${SITE_CONFIG.author}`}
        shareUrl={`${SITE_CONFIG.baseUrl}${ROUTES.LIBRARY.GEOMETRIA_RISCO}`}
        backLinkHref={ROUTES.BIBLIOTECA} 
        backLinkText="Voltar para Biblioteca"
      />
    </div>
  );
}
