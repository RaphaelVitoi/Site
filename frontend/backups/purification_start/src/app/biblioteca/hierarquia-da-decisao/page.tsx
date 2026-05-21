/**
 * IDENTITY: Hierarquia da Decisão SOTA
 * PATH: src/app/biblioteca/hierarquia-da-decisao/page.tsx
 * ROLE: Artigo técnico definindo as camadas de resolução do pensamento VITOI.
 */

import { ContentPageHeader } from "@/components/ui/layout/ContentPageHeader";
import { SotaMarkdown } from "@/components/ui/layout/SotaMarkdown";
import ContentFooter from "@/components/ui/layout/ContentFooter";
import { GlassPanel } from "@/components/ui/layout/GlassPanel";
import { ROUTES } from "@/constants/routes";
import { SITE_CONFIG } from "@/constants/site";

const content = `
# Hierarquia Cognitiva da Decisão

A evolução do pensamento estratégico no poker não é plana; ela escala em camadas de complexidade até atingir o Estado da Arte. No **Paradigma VITOI**, deslocamos a análise de um modelo de "estado" estático ($ICM_{ev}$) para uma análise de "fluxo" dinâmica (Sistemas Complexos e Lógica Bayesiana).

---

## 1. $ICM_{ev}$ (Métrica Estática)
**Resolução:** Baixa (Snapshot).
O **ICMev** é a camada mais superficial. Ele calcula o valor financeiro das suas fichas no momento exato da decisão, tratando o torneio como se ele terminasse agora. 
*   **A pergunta:** "O que eu tenho agora?"
*   **Falha:** É uma aproximação grosseira e isolada. Ignora a continuidade do jogo, a subida das blinds e a dinâmica de mesa.

---

## 2. Esperança Matemática (Estratégico-Lógica)
**Resolução:** Média (Intuitiva).
A **Esperança** introduz a antevisão de controle de mesa e ferramentas de edge.
*   **A pergunta:** "O que eu espero que aconteça se eu tomar esta rota?"
*   **Componentes:** Mitigação proativa de ameaças (nêmesis), identificação de alvos e preservação de ferramentas de exploração.

---

## 3. Expectativa Matemática (Probabilística-Preditiva)
**Resolução:** Alta (Simulada).
A **Expectativa** é a projeção preditiva do *Future Game Simulation* (FGS). 
*   **A pergunta:** "Se isso ocorrer, como meu FGS é afetado positiva e negativamente?"
*   **Componentes:** Cálculo de Realização de Equidade ($R$) e projeção de órbita ($t-3$). Aqui, você entende a erosão posicional (UTG -> BB).

---

## 4. Perspectiva Matemática (A Síntese Final)
**Resolução:** SOBERANA (Estado da Arte).
A **Perspectiva** é o output definitivo e de rigor irrefutável. Ela absorve a abstração e substitui o $ICM_{ev}$ isolado por uma decisão perfeitamente calibrada ao fluxo sistêmico.

$$ \text{Perspectiva} = \text{Expectativa} - (\text{Dívida RIO} + \text{Custo do Fold}) $$

Na camada de Perspectiva, a decisão é blindada contra os passivos estruturais (RIO) e o custo de oportunidade (EV Fold). Se a Perspectiva é positiva, a ação é **Soberana**. Se é negativa, a abstenção é a única rota para a excelência.

---

> **Axioma VITOI:** "Onde o solver vê um call de 0.01bb, a Perspectiva vê uma ferida na saúde do stack. No Estado da Arte, priorizamos a integridade do sistema sobre a acumulação nominal de fichas."
`;

export default function HierarquiaDecisaoPage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-bright">
      <ContentPageHeader
        title="Hierarquia da Decisão"
        subtitle="As 4 camadas de resolução do pensamento estratégico VITOI: Do snapshot estático à Métrica Soberana."
        category="Doutrina SOTA"
        icon="fa-layer-group"
      />

      <div className="sota-container py-12 md:py-24">
        <div className="max-w-4xl mx-auto">
          <GlassPanel className="p-8 lg:p-12 border-l-4 border-l-accent-indigo shadow-2xl">
            <SotaMarkdown content={content} />
          </GlassPanel>
        </div>
      </div>

      <ContentFooter
        shareTitle={`Hierarquia da Decisão SOTA | ${SITE_CONFIG.author}`}
        shareUrl={`${SITE_CONFIG.baseUrl}/biblioteca/hierarquia-da-decisao`}
        backLinkHref={ROUTES.BIBLIOTECA}
        backLinkText="Voltar para Biblioteca"
      />
    </div>
  );
}
