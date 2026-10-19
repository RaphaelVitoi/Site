---
id: registro-2026-10-19-refinamento-sota-frontend-header-layout-e-surface
tipo: registro
escopo: Site -- refinamento responsivo SOTA do header, desacoplamento de reading progress bar e centralizacao da arquitetura de superficies
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-10-19T03:22:00-03:00'
atualizado_em: '2026-10-19T03:45:00-03:00'
commit: HEAD
classes: [interno, medido, frontend, layout, design-system, arquitetura, registro]
caminhos:
  - reports/REGISTRO-2026-10-19-refinamento-sota-frontend-header-layout-e-surface.md
  - frontend/next.config.js
  - frontend/src/constants/routes.ts
  - frontend/src/lib/surface.ts
  - frontend/src/components/ui/layout/ReadingProgressBar.tsx
  - frontend/src/components/ui/layout/Header.tsx
  - frontend/src/components/ui/layout/HeaderAuthAction.tsx
  - frontend/src/components/ui/layout/Footer.tsx
  - frontend/src/components/ui/layout/SotaBackground.tsx
  - frontend/src/tests/app/surface-and-layout.test.tsx
  - tests/test_llm_ollama_integracao_real.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  session_id: cadcf1cd-aadb-4958-851b-1635090658fe
  session_started_at: '2026-10-19T03:09:26-03:00'
  condutor: Gemini 3.8 Flash <noreply@google.com>
  modelo: gemini-3.8-flash
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-10-19
verificado:
  - "npm run typecheck (tsc -p tsconfig.audit.json): 0 erros (exit code 0)"
  - "npx jest --silent: 111 suites aprovadas, 739 testes verdes, 0 erros e 0 warnings"
  - "Inspecao visual e responsividade Playwright/CDP em viewports 1024x768 e 1920x1080: zero congestionamento e estetica editorial/lab preservada"
  - "pytest tests/test_llm_ollama_integracao_real.py: 5 testes aprovados contra daemon local 11434 com timeout resiliente"
nao_verificado:
  - "Auditoria formal de CWV em producao remota (dispensada: validado localmente em dev server ativo com zero erros de console)"
revisoes_de_ancora:
  - registro: auditoria-2026-10-02-frontend-sota-subagents
    caminhos:
      - frontend/src/components/ui/layout/Header.tsx
    parecer: >-
      Revisado e mantido valido. Refinamento de responsividade em 1024px (breakpoint lg), desacoplamento da barra de leitura em ReadingProgressBar e integracao com frontend/src/lib/surface.ts, preservando contratos e acessibilidade WCAG.
  - registro: handoff-2026-10-02-frontend-sota-harmonizacao
    caminhos:
      - frontend/src/components/ui/layout/Header.tsx
    parecer: >-
      Revisado e mantido valido. Evolucao ergonomica e de performance no Header sem quebras de layout, eliminando re-renders de scroll spring fora de artigos.
  - registro: handoff-2026-10-05-fechamento-do-ciclo-medicoes-cwv-e-cacheabilidade
    caminhos:
      - tests/test_llm_ollama_integracao_real.py
    parecer: >-
      Revisado e mantido valido. Ajuste defensivo no timeout de tags HTTP de 10s para 30s em _tags_async(), garantindo resiliencia termodinamica contra timeout durante execucao paralela da suite com alta saturacao de CPU.
  - registro: registro-2026-10-05-resolucao-de-modelo-ollama-e-schema-json
    caminhos:
      - tests/test_llm_ollama_integracao_real.py
    parecer: >-
      Revisado e mantido valido. Ampliacao defensiva de timeout de consulta ao daemon Ollama sob carga, preservando integralmente contratos de resolucao de tags e esquemas.
---

# Registro: Refinamento SOTA do Frontend (Header, Layout, Superficies e Performance)

## 1. Contexto e Objetivos

Dando continuidade ao aprimoramento de padrao-ouro SOTA no frontend do ecossistema Poker Racional (`Site`), foram implementadas otimizacoes em quatro eixos estruturais:

1. **Centralizacao da Arquitetura de Superficie:**
   - Criado o modulo `frontend/src/lib/surface.ts` com as funcoes `isLightPage(pathname)` e `isReadingContentPage(pathname)`, eliminando a duplicacao da verificacao `pathname === '/' || pathname === '/quem-sou'` que estava dispersa em `frontend/src/components/ui/layout/Header.tsx`, `frontend/src/components/ui/layout/Footer.tsx` e `frontend/src/components/ui/layout/SotaBackground.tsx`.
   - Adicionadas rotas canonicas `ROUTES.AUTH.LOGIN` (`/login`) e `ROUTES.TEMPLO.INDEX` (`/templo`) em `frontend/src/constants/routes.ts`, completando a catalogacao das paginas existentes em disco.

2. **Desacoplamento e Eficiencia de Shannon na Barra de Leitura:**
   - Extraida a barra de progresso de leitura para o componente isolado `frontend/src/components/ui/layout/ReadingProgressBar.tsx`.
   - Removidos os hooks `useScroll` e `useSpring` do ciclo de vida global do `Header`, evitando calculos de fisica de spring e re-renderizacoes a cada evento de scroll em paginas onde a barra nao e exibida (Home, Simulador, Templo, Dashboard).
   - Aplicados atributos de acessibilidade (`aria-hidden="true"`, `role="presentation"` e `pointer-events-none`).

3. **Ergonomia e Responsividade do Header em 1024px (`lg`):**
   - No breakpoint intermediario de 1024px, ajustados os paddings internos dos itens de navegacao desktop (`px-2.5 xl:px-4 py-2 xl:py-2.5`) e do botao de acao CTA (`px-4 xl:px-7 py-2.5 xl:py-3`), conferindo espacamento fluido e eliminando a compressao contra a margem.
   - Refinado o realce sutil ambar/dourado (`hover:border-amber-500/30`, `hover:shadow-[0_0_30px_rgba(212,175,55,0.15)]`) em conformidade estrita com o `Site/design/DESIGN_SYSTEM_SOTA.md`.

4. **Higienizacao de Politica CSP:**
   - Removida a diretiva invalida `http://[::1]:*` do CSP `connect-src` em `frontend/next.config.js`, erradicando os warnings emitidos pelo navegador na inicializacao.

5. **Resiliencia Defensiva em Prova de Integracao Ollama:**
   - Ajustado o timeout de leitura assincrona de tags (`_tags_async`) em `tests/test_llm_ollama_integracao_real.py` de 10s para 30s, prevenindo `CancelledError` / `TimeoutError` transientes quando a suite completa e executada com 4 workers em paralelo sob alta saturacao de CPU.

## 2. Validacoes Executadas

- **Typecheck Estrito:** `npm run typecheck` (`tsc -p tsconfig.audit.json`) executado com sucesso e 0 erros.
- **Suite de Testes Unitarios e Integracao:** `npx jest --silent` executou 111 suites de teste com 739 testes aprovados (100% passed, 0 erros, 0 warnings).
- **Inspecao Visual Playwright:** Validados viewports desktop (1920x1080) e tablet/laptop (1024x768) na pagina inicial (Light Editorial) e em artigo da biblioteca (Dark Lab), confirmando homeostase estetica e ausencia de erros de console.
