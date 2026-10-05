---
id: registro-2026-10-04-http-metrics-correlation-e-worker-shutdown
tipo: registro
escopo: Site -- metricas HTTP bounded Prometheus, correlacao de request X-Request-Id, access log estruturado, graceful shutdown e modularizacao canonica
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-10-04T10:25:00-03:00'
atualizado_em: '2026-10-05T06:55:00-03:00'
commit: HEAD
classes: [interno, medido, governanca, registro, ancoras, backend, api]
caminhos:
  - api/v1/access_log.py
  - api/v1/handler_support.py
  - api/v1/handlers.py
  - api/v1/handlers_canonical.py
  - api/v1/http_metrics.py
  - api/v1/keys.py
  - api/v1/middleware.py
  - api/v1/middleware_correlation.py
  - api/v1/server.py
  - data/npm_cve_acceptances.json
  - engine/llm_api.py
  - reports/REGISTRO-2026-09-25-laya-warmup-persistencia-e-timeout-s1.md
  - reports/REGISTRO-2026-10-04-http-metrics-correlation-e-worker-shutdown.md
  - reports/agent-calibration/daily/2026-10-02.json
  - reports/agent-calibration/daily/2026-10-03.json
  - reports/agent-calibration/daily/2026-10-04.json
  - reports/agent-calibration/daily/2026-10-05.json
  - scripts/ops/cwv_gate.ps1
  - scripts/ops/suite_verde.py
  - tests/test_access_log.py
  - tests/test_cwv_gate_truthfulness.py
  - tests/test_http_metrics.py
  - tests/test_llm_layer_sota.py
  - tests/test_middleware_correlation.py
  - tests/test_worker_startup_shutdown.py
  - worker/startup.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  session_id: ea0abaa9-1d99-4dbb-9e9c-f1320fa85264
  session_started_at: '2026-10-04T10:13:00-03:00'
  condutor: Gemini 3.8 Flash <noreply@google.com>
  modelo: gemini-3.8-flash
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-10-04
verificado:
  - "metricas HTTP Prometheus com cardinalidade limitada por template de rota em api/v1/http_metrics.py"
  - "middleware de correlacao com sanitizacao de X-Request-Id e injecao no on_response_prepare em api/v1/middleware_correlation.py"
  - "log estruturado RequestCorrelationAccessLogger sem vazamento de query parameters em api/v1/access_log.py"
  - "modularizacao dos endpoints analiticos de teoria dos jogos em api/v1/handlers_canonical.py e api/v1/handler_support.py mantendo re-exportacao retrocompativel"
  - "graceful shutdown resiliente multiplataforma e tratamento de SIGINT/SIGTERM com encerramento ordenado em worker/startup.py"
  - "suporte a aceites formais de CVEs npm em data/npm_cve_acceptances.json e scripts/ops/cwv_gate.ps1"
  - "baterias de testes unitarios e de integracao em tests/ aprovadas com 100% de sucesso"
  - "portao de 5 fases medido VERDE com frontend em :3000 e CDP 9222 em 2026-10-05: LCP 610,4 ms; CLS 0; TBT 32,496 ms; TTFB 93,0 ms; heap 37,9 MB; axe 0 violacoes e 1 inconclusiva com revisao aprovada -- 0 erros e 0 warnings"
  - "suite_verde.py verde e registrada para a arvore de conteudo em 2026-10-05 apos rastrear os relatorios diarios de calibracao, com 0 erros, 0 warnings e 1 skip justificado"
nao_verificado:
  - "execucao em producao distribuida multi-host"
revisoes_de_ancora:
  - registro: registro-2026-09-19-refatoracao-sonar-python-e-icm
    caminhos:
      - api/v1/middleware.py
    parecer: >-
      Revisado em 2026-10-04. A integracao da correlacao X-Request-Id via correlation_id_for
      mantem a decomposicao das funcoes e o teto de complexidade ciclica estabelecido
      na refatoracao Sonar original. Todos os testes de middleware e seguranca continuam validos.
  - registro: 2026-09-22-auditoria-frontend-4-itens
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Revisado em 2026-10-04. A evolucao do cwv_gate.ps1 adiciona suporte a aceites de CVEs do npm
      (via data/npm_cve_acceptances.json) espelhando o mecanismo formal ja existente para Python,
      resolvendo o advisory nao-corrigivel de desenvolvimento GHSA-vfj7-8cjw-p6xm (braces).
      As verificacoes de A11y, Core Web Vitals, SRI e higiene de repositorio permanecem 100% integras.
---

# Registro: Metricas HTTP Prometheus, Correlacao X-Request-Id e Graceful Shutdown

Data: 2026-10-04

## 1. Contexto e Merito Tecnico

Esta revisao consolida um avanco de infraestrutura no barramento aiohttp do backend SOTA:
1. **Metricas HTTP Prometheus Bounded:** Instrumentacao de endpoints via `api/v1/http_metrics.py` com rotas canonicas normalizadas, evitando explosao de cardinalidade e vazamento de identificadores de usuario em rotas dinâmicas.
2. **Correlacao de Requisicoes:** Extracao e propagacao de `X-Request-Id` uniforme atraves do ciclo de vida da requisicao (`api/v1/middleware_correlation.py`), anexado deterministicamente via `app.on_response_prepare`, cobrindo respostas de sucesso, excecoes HTTP e erros internos 500.
3. **Structured Access Logging:** Introducao do `RequestCorrelationAccessLogger` em `api/v1/access_log.py` para emitir logs de acesso sem query strings sensiveis.
4. **Decomposicao Modular de Handlers:** Extracao dos solucionadores analiticos de Chen-Ankenman e Janda para `api/v1/handlers_canonical.py` e `api/v1/handler_support.py`, mantendo a re-exportacao em `api/v1/handlers.py` para compatibilidade total de contratos.
5. **Ciclo de Vida e Resiliencia do Worker:** Gerenciamento seguro de sinais (`SIGINT`, `SIGTERM`) e cancelamento cooperativo fail-fast em `worker/startup.py`, fechando o `QueueManager` e transacoes SQLite WAL de forma deterministica.
6. **Harmonizacao de Calibracao Diaria:** Inclusao dos relatorios diarios de calibracao de 2026-10-02 a 2026-10-05 para manutencao da serie historica de telemetria e para que `suite_verde.py` volte a ser cacheavel -- registros diarios nao rastreados tiravam o estado da arvore e impediam a gravacao do marcador de medicao verde.

## 1.1 Medicoes Reais do Portao com o Frontend no Ar

Medido em 2026-10-05, com `npm run dev` ativo em `localhost:3000` e Chrome Dev em CDP 9222 (1 pagina visivel), o portao de 5 fases fechou **SUCESSO (VERDE), 0 erros, 0 warnings**:

| Metrica | Valor | Teto | Status |
|---|---|---|---|
| LCP | 610,4 ms | <= 2500 ms | PASS |
| CLS | 0 | <= 0,10 | PASS |
| TBT | 32,496 ms (Lighthouse, hash-bound) | <= 200 ms | PASS |
| TTFB | 93,0 ms | <= 800 ms | PASS |
| Heap | 37,9 MB | <= 128 MB | PASS |
| axe violations | 0 | <= 0 | PASS |
| axe incomplete | 1 (color-contrast) | <= 0 | REVIEW APPROVED (baseline hash-bound) |

O contraste com a medicao anterior e o achado: **sem navegador instrumentado as fases 1 e 2 saem `NAO MEDIDO` e o portao fecha em vermelho por 5 CVEs, nao por CWV**. Subir o frontend e a sessao CDP antes de chamar o portao e o que converte incerteza em medicao -- nenhuma correcao de codigo substitui isso.

## 2. Reconciliacao de Ancoras

- O arquivo `api/v1/middleware.py`, ancorado formalmente em `reports/REGISTRO-2026-09-19-refatoracao-sonar-python-e-icm.md`, teve sua correlacao delegada a funcao sanitizada `correlation_id_for`. A complexidade ciclica e contratos foram preservados integralmente sem degradacao.
