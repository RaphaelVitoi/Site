/**
 * IDENTITY: Hierarquia da Decisão SOTA GOLD
 * PATH: src/app/biblioteca/hierarquia-da-decisao/page.tsx
 * ROLE: Artigo técnico definindo as camadas de resolução do pensamento VITOI.
 * VERSION: v7.0 GOLD
 */

import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import { SotaMarkdown } from '@/components/ui/layout/SotaMarkdown';
import ContentFooter from '@/components/ui/layout/ContentFooter';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { ROUTES } from '@/constants/routes';
import { SITE_CONFIG } from '@/constants/site';

const content = `
# Hierarquia Cognitiva da Decisão

A evolução do pensamento estratégico pode ser organizada em camadas. No **Paradigma VITOI**, propomos complementar um modelo de estado ($ICM_{ev}$) com hipóteses de fluxo, realização e atualização bayesiana — sem dispensar o baseline ICM.

---

## 1. $ICM_{ev}$ (Métrica Estática)
**Resolução:** Baixa (Snapshot).
O **ICMev** calcula o valor financeiro de fichas para stacks e payouts declarados. É um baseline útil, mas não resolve sozinho todas as transições futuras de uma árvore pós-flop.
*   **A pergunta:** "O que eu tenho agora?"
*   **Limite:** a continuidade do jogo, blinds e dinâmica de mesa exigem um modelo complementar explicitamente definido.

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

## 4. Perspectiva Matemática (Síntese proposta)
**Resolução:** hipótese de integração.
A **Perspectiva** é uma proposta para integrar abstrações adicionais ao $ICM_{ev}$, preservando-o como baseline recuperável. A calibração depende de especificação, dados e comparação fora da amostra.

$$ \text{Perspectiva} = \text{Expectativa} - (\text{Dívida RIO} + \text{Custo do Fold}) $$

Na camada de Perspectiva, RIO e custo de oportunidade são hipóteses que devem ser explicitadas e comparadas com linhas alternativas. Um valor positivo só informa a escolha se a função, os inputs e a convenção de EV forem declarados.

---

> **Princípio editorial VITOI:** "Onde um modelo encontra uma margem pequena, a análise deve perguntar quais premissas a sustentam — e registrar a resposta para auditoria."
`;

export default function HierarquiaDecisaoPage() {
  return (
    <div className="bg-bg-base text-text-bright min-h-screen">
      <ContentPageHeader
        title="Hierarquia da Decisão"
        subtitle="As 4 camadas de resolução do pensamento estratégico VITOI: Do snapshot estático à Métrica Soberana."
        category="Doutrina SOTA"
        icon="fa-layer-group"
      />

      <div className="sota-container py-12 md:py-24">
        <div className="mx-auto max-w-4xl">
          <GlassPanel className="border-l-accent-indigo border-l-4 p-8 shadow-2xl lg:p-12">
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
