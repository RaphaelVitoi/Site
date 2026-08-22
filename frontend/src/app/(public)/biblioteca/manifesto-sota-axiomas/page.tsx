/** Tese editorial da PMev: proposições explícitas, não resultados alegados. */

import { ContentPageHeader } from '@/components/ui/layout/ContentPageHeader';
import { SotaMarkdown } from '@/components/ui/layout/SotaMarkdown';
import ContentFooter from '@/components/ui/layout/ContentFooter';
import { GlassPanel } from '@/components/ui/layout/GlassPanel';
import { ROUTES } from '@/constants/routes';
import { SITE_CONFIG } from '@/constants/site';

const content = `
# Manifesto SOTA: Proposições da Perspectiva Matemática

Este texto formula uma **tese de trabalho**: a Perspectiva Matemática (PMev) pode estender a leitura de estados de ICM com variáveis de fluxo, realização e incerteza. Não substitui o ICM, não é prova matemática e só pode alegar ganho preditivo após comparação reprodutível fora da amostra.

---

## 1. Convenção do EV do Fold

Em muitos solvers, fold é mostrado como zero **por convenção incremental**: o investimento já realizado é custo afundado e as linhas são comparadas a partir do nó atual. Uma modelagem de valor absoluto ou de oportunidade pode usar outro referencial, desde que declare o estado, o horizonte e a função objetivo.

No ICM, a ação de fold pode preservar valor relativo quando payouts, stacks e sobrevivência criam assimetria. Isso não torna o fold universalmente “positivo”: o resultado depende da convenção de EV e do cenário parametrizado.

* **Valor de preservação:** payjumps e pressão de eliminação podem elevar o custo de uma colisão.
* **Comprometimento de pote:** fichas já investidas alteram o preço marginal de continuar, mas não eliminam a comparação de todas as linhas da árvore.

---

## 2. Hierarquia proposta da Perspectiva Matemática

1. **ICM (baseline):** função de valor estática para stacks e payouts declarados.
2. **EV da linha:** comparação de ações dentro de uma árvore e ranges declarados.
3. **Expectativas condicionais:** hipóteses sobre realização, transições e comportamento, explicitadas como tais.
4. **PMev (síntese proposta):** extensão em pesquisa que deve recuperar o baseline ICM quando suas variáveis adicionais são neutralizadas.

---

## 3. Pot Odds, RIO e custos futuros

Pot odds descrevem corretamente o preço imediato de uma decisão. Elas não capturam, sozinhas, realização de equidade, rake, ranges, ICM ou streets futuras; por isso são um componente, não uma função objetivo completa.

Pot odds podem induzir a uma leitura incompleta quando a ação futura cria custos adicionais de realização ou de ICM. A magnitude desses custos deve ser estimada por árvore, ranges e estrutura; não há frequência multiway ou crescimento exponencial universal que dispense essa medição.

---

## 4. Proposta Lipe Piv: regressão de crenças

A equidade depende de ranges e informação; tratar uma estimativa como certeza introduz erro. O **Lipe Piv** é uma proposta de regularização de crenças que precisa de definição operacional e validação:

> **Eq_real = Baseline + κ × (Eq_estimada − Baseline)**

* **κ (Kappa):** parâmetro proposto para expressar confiança na informação; a sua estimação deve ser definida antes da decisão.
* **Limite:** κ não força equidade a um teto universal de RP. Deve ser calibrado contra previsões e baselines, sem transformar prudência em dogma.

---

## 5. O Fator Ψ: hipótese comportamental

Desvios comportamentais podem importar em decisões exploitativas, mas precisam ser modelados por população, contexto e amostra. O fator Ψ é uma hipótese para registrar essa incerteza, não uma frequência observada pronta para uso.

> **P(call ganha) = P(range que perde) + P(bluffs e erros comportamentais)**

Um call só é justificável após comparar distribuição de ranges, sizing, pot odds, ICM e incerteza da estimativa. Números ilustrativos não estabelecem frequência populacional nem tornam uma ação obrigatória.

---

## 6. Sinergia cognitiva: cálculo, hipótese e auditoria

O princípio operacional é separar cálculo, hipótese comportamental e registro de decisão — para que uma leitura humana possa ser auditada, corrigida e eventualmente testada.

* **Cálculo determinístico:** processa o modelo e os inputs declarados.
* **Análise heurística:** gera hipóteses sobre comportamento, sem alegar observação sem dados.
* **Síntese:** documenta a decisão e suas premissas para confronto posterior com resultados e baselines.

---

## 7. Persistência estratégica: memória auditável

No ecossistema SOTA, hipóteses, inputs, decisões e resultados podem ser registrados para revisão. O objetivo é reduzir memória seletiva e criar histórico que permita atualização — não armazenar “padrões de dominância” como verdades.
`;

export default function ManifestoAxiomasPage() {
  return (
    <div className="bg-bg-base text-text-bright min-h-screen">
      <ContentPageHeader
        title="Manifesto SOTA"
        subtitle="Proposições da Perspectiva: um programa de pesquisa que une teoria dos jogos, comportamento e auditoria."
        category="Tese editorial"
        icon="fa-scroll"
      />
      <div className="sota-container py-12 md:py-24">
        <div className="mx-auto max-w-4xl">
          <GlassPanel className="border-t-accent-indigo border-t-8 p-10 lg:p-16">
            <SotaMarkdown content={content} />
          </GlassPanel>
        </div>
      </div>
      <ContentFooter
        shareTitle={`Manifesto SOTA | ${SITE_CONFIG.author}`}
        shareUrl={`${SITE_CONFIG.baseUrl}${ROUTES.LIBRARY.MANIFESTO_SOTA}`}
        backLinkHref={ROUTES.BIBLIOTECA}
        backLinkText="Voltar para Biblioteca"
      />
    </div>
  );
}
