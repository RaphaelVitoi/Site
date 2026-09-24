---
id: registro-2026-09-24-laya-pesos-carregados-e-microservico
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-09-24T12:40:00-03:00'
classes: [interno, medido, governanca, ascii, quality-gate, laya, mmbert, fast-api, microservico, proveniencia]
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  session_id: 6be151a2-4cb9-4230-a29c-dcbf028d57fd
  session_started_at: '2026-09-24T12:34:59-03:00'
  condutor: Gemini 3.8 Flash <noreply@google.com>
  modelo: gemini-3.8-flash
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-09-24
caminhos:
  - frontend/src/app/(lab)/templo/laya/page.tsx
  - frontend/src/app/api/sota/laya/predict/route.ts
  - frontend/src/app/api/sota/laya/solve/route.test.ts
  - frontend/src/app/api/sota/laya/solve/route.ts
  - frontend/src/app/api/sota/laya/status/route.test.ts
  - frontend/src/app/api/sota/laya/status/route.ts
  - frontend/src/lib/laya.test.ts
  - frontend/src/lib/laya.ts
  - scripts/ops/Start-LayaService.ps1
  - scripts/ops/homologar_laya_gpu.py
verificado:
  - "correcao-pesos-carregados: eliminada fixacao estatica de weights_loaded: false no TypeScript e estabelecida ligacao real com o microservico mmBERT-base de 322M na porta 8192"
  - "mitigacao-fallback-transparente: proveniencia SS4 dinamica no frontend garantindo que, em caso de indisponibilidade da porta 8192, a simulacao heuristica declare abertamente fallback_used: true e weights_loaded: false"
  - "otimizacao-latencia-singleton: singleton em memoria _obter_predict_router() mantendo latencia estavel de 248.95 ms em CPU override (aceleracao de 125x)"
  - "melhorias-ux-e-ops: criado script idempotente scripts/ops/Start-LayaService.ps1, endpoint /api/sota/laya/status e painel com indicacao visual de status no templo Laya"
  - "bateria-frontend: 15/15 testes Jest aprovados com 0 erros e 0 warnings"
  - "bateria-python: 51/51 testes pytest aprovados e 1 skipped intencional"
  - "blindagem-ascii: conformidade estrita Pure ASCII em todos os artefatos novos"
nao_verificado:
  - "inferencia em GPU fisica dedicada (host AMD RX 570 sem suporte oficial ROCm no Windows; operando em CPU override com pesos reais)"
revisoes_de_ancora:
  - registro: registro-2026-09-24-laya-visual-workbench-e-rotas-admin
    caminhos:
      - frontend/src/app/(lab)/templo/laya/page.tsx
    parecer: >-
      Revisado. Atualizado painel visual do Templo Laya com status probe dinamico da porta 8192,
      indicadores de estado (Online/Offline) e callout de mitigacao e operacao com script PowerShell.
  - registro: registro-2026-09-24-laya-gpu-homologacao-e-solver-bridge
    caminhos:
      - frontend/src/app/api/sota/laya/solve/route.test.ts
      - frontend/src/app/api/sota/laya/solve/route.ts
      - frontend/src/lib/laya.test.ts
      - frontend/src/lib/laya.ts
      - scripts/ops/homologar_laya_gpu.py
    parecer: >-
      Revisado. Rota /api/sota/laya/solve conectada ao microservico FastAPI na porta 8192,
      preservando proveniencia real com weights_loaded: true e fallback transparente em caso de timeout.
  - registro: registro-2026-09-24-laya-multilingual-s1-integracao
    caminhos:
      - frontend/src/app/api/sota/laya/predict/route.ts
      - frontend/src/lib/laya.test.ts
      - frontend/src/lib/laya.ts
    parecer: >-
      Revisado. Rota /api/sota/laya/predict e biblioteca cliente adaptadas para refletir
      fielmente os metadados de proveniencia do microservico upstream.
  - registro: registro-2026-09-24-laya-ts-strict-conformance
    caminhos:
      - frontend/src/lib/laya.ts
    parecer: >-
      Revisado. Funcao adaptForSolverClient ajustada para propagar dinamicamente weights_loaded
      e proveniencia do modelo upstream sem tipagem solta ou regressao nos tipos estritos.
---

# REGISTRO DE CORRECAO, MITIGACAO, OTIMIZACAO E MELHORIA: PESOS CARREGADOS LAYA S1

## 1. Contexto e Demanda
A partir da inspecao visual da interface `frontend/src/app/(lab)/templo/laya/page.tsx`, foi constatado que o painel de proveniencia formal (Secao 4) exibia:
`Pesos Carregados = false`

A diretiva soberana determinou:
**"Pesos Carregados = False. Corrija, mitigue, otimize, melhore."**

## 2. Acoes Implementadas (Os Quatro Quadrantes)

### A. Corrija (Fix)
- **Eliminacao do Hardcoding:** No arquivo `frontend/src/lib/laya.ts`, a funcao `adaptForSolverClient` fixava estaticamente `weights_loaded: false` e `fallback_used: true`. O codigo foi corrigido para extrair e herdar dinamicamente os valores reais de `prediction.provenia.weights_loaded` e `prediction.provenia.fallback_used`.
- **Integracao Upstream:** As rotas Next.js App Router `/api/sota/laya/solve` e `/api/sota/laya/predict` foram integradas diretamente ao microservico FastAPI upstream na porta 8192 (`http://127.0.0.1:8192`).
- **Modelos Pydantic v2:** Corrigida a desserializacao de requests POST em `scripts/ops/homologar_laya_gpu.py` usando `Annotated[..., Body()]` e modelos no escopo do modulo, eliminando erros de forward reference.

### B. Mitigue (Mitigate)
- **Fallback Heuristico Resiliente:** Caso o microservico upstream na porta 8192 esteja offline ou demore mais de 2000 ms, as rotas Next.js degradam graciosamente para a simulacao heuristica local sem interromper o fluxo do usuario.
- **Transparencia Epistemica (SS4):** Quando o fallback e acionado, o contrato de proveniencia declara expressamente `fallback_used: true`, `weights_loaded: false`, `runtime_used: 'edge-runtime (simulated fallback)'` e documenta as premissas em `assumptions`. Quando o microservico responde, registra `weights_loaded: true` e `runtime_used: 'transformers+torch (cpu)'`.

### C. Otimize (Optimize)
- **Singleton In-Memory Router:** Implementado o cache de processo `_obter_predict_router()` no modulo Python `llm/laya_bridge.py`. Apos a carga inicial unica do checkpoint de 322M mmBERT-base, as inferencias subsequentes caem de ~31.000 ms para **248.95 ms** em CPU (aceleracao de 125x).
- **Timeout Conectivo Calibrado:** Timeout de 2000 ms nas chamadas `fetch` upstream no Next.js com `AbortSignal.timeout(2000)`, evitando travamento do event-loop do Node.js.

### D. Melhore (Improve)
- **Script de Operacao Idempotente:** Desenvolvido `scripts/ops/Start-LayaService.ps1` com modos `-Status`, `-Stop` e inicializacao automatica com polling de warmup e verificacao de saude.
- **Endpoint de Sondagem:** Criada a rota `/api/sota/laya/status` para telemetria em tempo real do estado do microservico upstream.
- **Interface Visual Aprimorada:** O componente de pagina em `frontend/src/app/(lab)/templo/laya/page.tsx` agora inclui polling de status da porta 8192, badge dinamico (Online / Offline), estilizacao com realce esmeralda quando os pesos estao carregados, e comando copiavel para iniciar o servico localmente.

## 3. Validacao das Suites de Teste
- **Frontend Jest:** 15 testes aprovados em 3 suites (`frontend/src/app/api/sota/laya/solve/route.test.ts`, `frontend/src/lib/laya.test.ts`, `frontend/src/app/api/sota/laya/status/route.test.ts`) com 0 erros e 0 warnings.
- **TypeScript & ESLint:** `npx tsc --noEmit` e `npx eslint` aprovados com 0 erros.
- **Backend Pytest:** 51 testes aprovados, 1 skipped intencional (`test_provenia_nivel_trained_model` que requer flags especificas de ambiente).
- **Ruff Linter:** `scripts/ops/homologar_laya_gpu.py` verificado e 100% limpo com FAST002 e E402 resolvidos.
- **Pre-flight M.O. 13.F:** Executado `record_gate.py` com aprovacao de 10 arquivos staged e reconciliacao formal de 4 registros precedentes.
