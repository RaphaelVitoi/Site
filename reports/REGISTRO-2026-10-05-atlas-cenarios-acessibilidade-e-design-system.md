---
id: registro-2026-10-05-atlas-cenarios-acessibilidade-e-design-system
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: Gemini 3.8 Flash [Tier 1]
criado_em: 2026-10-05
commit: HEAD
classes: [interno, medido, frontend, acessibilidade, design-system]
caminhos:
  - .github/workflows/sota-ci.yml
  - .impeccable/critique/2026-10-05T17-55-27Z__frontend.md
  - .impeccable/design.json
  - DESIGN.md
  - frontend/package.json
  - frontend/playwright.quality.config.ts
  - frontend/src/components/simulator/MasterSimulator.tsx
  - frontend/src/components/simulator/ui/ScenarioQuickSelector.tsx
  - frontend/src/tests/simulator/scenarioQuickSelector.test.tsx
  - frontend/tests/accessibility/qualitySmoke.spec.ts
  - reports/REGISTRO-2026-10-05-atlas-cenarios-acessibilidade-e-design-system.md
revisoes_de_ancora:
  - registro: auditoria-2026-10-02-frontend-sota-subagents
    caminhos:
      - frontend/src/components/simulator/MasterSimulator.tsx
    parecer: >-
      Revisado em 2026-10-05. A alteracao no MasterSimulator atualiza o rotulo
      estrutural da secao de cenarios para o novo atlas agrupado por familia
      estrategica. Os hooks e a sincronizacao de fisica permanecem intactos.
  - registro: handoff-2026-10-02-frontend-sota-harmonizacao
    caminhos:
      - frontend/src/components/simulator/MasterSimulator.tsx
    parecer: >-
      Revisado em 2026-10-05. A modificacao no MasterSimulator integra o
      ScenarioQuickSelector agrupado por familias mantendo o contraste e o
      comportamento auditados anteriormente.
  - registro: 2026-09-22-auditoria-frontend-4-itens
    caminhos:
      - frontend/package.json
    parecer: >-
      Revisado em 2026-10-05. O package.json recebeu o script test:quality para
      execucao de smoke tests de acessibilidade Playwright sem alterar as
      versoes de dependencias de producao.
  - registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
    caminhos:
      - .github/workflows/sota-ci.yml
    parecer: >-
      Revisado em 2026-10-05. Adicionada etapa no CI para execucao do script de
      qualidade Playwright no frontend, preservando os pins e dependencias
      remediados anteriormente.
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  commit: HEAD
  python: 3.14.7
  node: 24.21.0
verificado:
  - "Agrupamento semantico do ScenarioQuickSelector em 3 familias estrategicas (Referenciais, Casos clinicos, Toy games) via details/summary com selecao reativa"
  - "Testes unitarios do seletor em frontend/src/tests/simulator/scenarioQuickSelector.test.tsx aprovados com 100% de sucesso (3/3)"
  - "Guards de classes de cor compiladas do Tailwind v4 (test_classes_de_cor_nao_emitidas.py) 100% aprovados"
  - "Saneamento de rota em frontend/tests/accessibility/qualitySmoke.spec.ts apontando para /simulador"
  - "Limpeza de step de CI apontando para script inexistente em .github/workflows/sota-ci.yml"
nao_verificado:
  - "Auditoria visual VRT completa cross-browser Safari/WebKit (limitado a Chromium local)"
supersede: null
---

# Registro: Atlas de Cenários, Acessibilidade e Especificação de Design System

## 1. Contexto e Motivação

Com base na auditoria heurística e visual realizada sobre o frontend, identificou-se uma alta sobrecarga cognitiva no seletor plano de 12 cenários do cockpit estratégico. A intervenção estruturou os cenários em famílias estratégicas semânticas ("Referenciais", "Casos clínicos" e "Toy games") utilizando componentes nativos acessíveis (`<details>` / `<summary>`), revelação progressiva e garantia de foco via teclado sem quebras de layout.

Paralelamente, foram formalizadas as especificações do Design System (`DESIGN.md` e `.impeccable/design.json`) e adicionados testes de acessibilidade Playwright WCAG 2.2 AA.

## 2. Modificações Principais

1. **`ScenarioQuickSelector.tsx`**:
   - Agrupamento dos 12 cenários em 3 categorias estratégicas: `Referenciais` (Baseline), `Casos clínicos` (Spots reais ICM) e `Toy games`.
   - Gerenciamento de abertura/fechamento das categorias via estado do React integrado a `<details open>`, abrindo automaticamente a família do cenário ativo.
   - Acomodação visual de índices de 2 dígitos e rótulos acessíveis via atributos ARIA (`aria-pressed`).
   - Saneamento de classes de foco para garantir compatibilidade com o CSS compilado pelo Tailwind v4 (`focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-indigo`).

2. **`MasterSimulator.tsx`**:
   - Ajuste textual da legenda do container do cockpit para refletir a nova organização em famílias estratégicas ("Atlas: cenários organizados por família estratégica").

3. **Testes Unitários & Acessibilidade**:
   - `frontend/src/tests/simulator/scenarioQuickSelector.test.tsx`: Bateria de testes Jest validando expansão progressiva, seleção de cenários e formatação de índices.
   - `frontend/tests/accessibility/qualitySmoke.spec.ts`: Especificações de acessibilidade via axe-core WCAG 2.2 AA e verificação de alvos móveis na rota canônica `/simulador`.

4. **CI & Governança**:
   - `.github/workflows/sota-ci.yml`: Inclusão da execução de testes de qualidade Playwright no workflow de CI; remoção de referência a script de Lighthouse inexistente em ambiente headless.
   - Reconciliação canônica de âncoras para os arquivos modificados que possuíam registros ativos.
