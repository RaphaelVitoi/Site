---
id: registro-2026-11-12-s1-achados-remediacao
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor:
  "Devin (SWE-2 Flash) [Tier 1] -- sessao
  devin-swe2-site-2026-11-12-s1-remediacao"
criado_em: "2026-11-12T23:30:00-03:00"
atualizado_em: "2026-11-12T23:30:00-03:00"
commit: HEAD
title: "Registro — remediação dos achados da auditoria System-1"
type: registro
status: active
owner: devin-swe2-flash
updated_at: 2026-11-12
verificado:
  - "178 testes pytest focados S1/S2/backend verdes, 0 erros 0 warnings"
  - "29 testes jest frontend (laya + rotas) verdes; tsc --noEmit limpo"
  - "ruff check + ruff format canonicos; prettier --check limpo"
  - "Sonda real laya_predict_remote com servico fora retorna None gracioso"
nao_verificado:
  - "Inferencia remota real com microservico Laya :8192 no ar (endpoint novo,
    nao sondado ao vivo)"
  - "Latencia ponta a ponta do endpoint POST /api/v1/s1/decide sob carga"
revisoes_de_ancora:
  - registro: auditoria-2026-09-05-trabalho-assistido-do-gemini-no-ide
    caminhos: [api/v1/server.py]
    parecer:
      "Revisado: mudanca aditiva (import + registro de rota /api/v1/s1/decide);
      handlers e rotas existentes preservados; suite completa verde no commit."
  - registro: auditoria-2026-10-08-integralidade-backend
    caminhos: [api/v1/handlers.py]
    parecer:
      "Revisado: novo handler handle_s1_decide aditivo ao final do modulo;
      nenhum handler existente alterado; 178 testes backend verdes."
  - registro: handoff-2026-10-08-auditoria-e-remediacao-backend
    caminhos: [api/v1/handlers.py]
    parecer:
      "Revisado: adicao de handle_s1_decide preserva integridade do backend;
      contratos de resposta dos endpoints previos intactos."
  - registro: plano-laya-integracao-s1s2-pmev-2026-09-20
    caminhos: [llm/laya_bridge.py]
    parecer:
      "Revisado: unificacao do cache de Router e novo laya_predict_remote
      implementam o plano de integracao Laya; contratos route()/laya_predict
      preservados."
  - registro: registro-2026-09-12-ativacao-solvers-teoria-dos-jogos-e-multiway-pmev
    caminhos: [api/v1/handlers.py, api/v1/server.py]
    parecer:
      "Revisado: nenhuma alteracao nos handlers/rotas de solvers; apenas novo
      endpoint S1 aditivo."
  - registro: registro-2026-09-12-teoria-canonica-chen-janda-e-convergencia-cfr
    caminhos: [api/v1/handlers.py, api/v1/server.py]
    parecer:
      "Revisado: nenhuma alteracao nos handlers/rotas de solvers; apenas novo
      endpoint S1 aditivo."
  - registro: registro-2026-09-13-contrato-de-capacidades-e-paridade-de-engines
    caminhos: [api/v1/handlers.py, api/v1/server.py]
    parecer:
      "Revisado: contrato de capacidades preservado; handle_s1_decide expoe
      decide_s1 sem alterar engines existentes."
  - registro: registro-2026-09-14-auditoria-e-refinamento-settings-e-configuracoes
    caminhos: [tests/test_backend_hardening.py]
    parecer:
      "Revisado: apenas novos testes do handler S1 adicionados; testes
      pre-existentes intactos e verdes."
  - registro: registro-2026-09-23-evolucao-pendencias-laya-e-tarefas
    caminhos: [llm/laya_bridge.py]
    parecer:
      "Revisado: progresso das pendencias Laya — cache unificado e cliente de
      microservico; proveniencia mantida."
  - registro: registro-2026-09-24-blindagem-ascii-e-harmonizacao-scripts
    caminhos:
      [
        api/v1/handlers.py,
        llm/laya_bridge.py,
        scripts/ops/homologar_laya_gpu.py,
        tests/test_backend_hardening.py,
      ]
    parecer:
      "Revisado: blindagem ASCII preservada nos novos trechos; harmonizacao de
      scripts mantida (health probe aponta para cache unificado)."
  - registro: registro-2026-09-29-saneamento-lint-e-calibracao
    caminhos: [scripts/ops/homologar_laya_gpu.py]
    parecer:
      "Revisado: apenas a sonda de readiness do /health foi atualizada para o
      cache unificado de Router; lint/ruff verde."
  - registro: registro-2026-10-04-http-metrics-correlation-e-worker-shutdown
    caminhos: [api/v1/handlers.py, api/v1/server.py]
    parecer:
      "Revisado: novo handler segue o padrao aiohttp existente
      (web.json_response, to_thread); metricas/correlation inalteradas."
  - registro: registro-2026-10-08-auditoria-e-remediacao-backend
    caminhos: [api/v1/handlers.py]
    parecer:
      "Revisado: remediacao do backend preservada; novo endpoint e aditivo e nao
      reabre achados anteriores."
  - registro: registro-2026-10-13-conclusao-4-trilhas-calibracao-rust-warmup-strata
    caminhos: [api/v1/server.py]
    parecer:
      "Revisado: trilhas de calibracao inalteradas; registro de rota aditivo no
      fim da lista."
  - registro: registro-2026-10-13-saneamento-diagnosticos-ide-e-compatibilidade
    caminhos: [llm/laya_bridge.py]
    parecer:
      "Revisado: compatibilidade preservada — lazy imports mantidos, nenhum
      import pesado no topo; novos simbolos sao aditivos."
  - registro: registro-2026-10-18-resolucao-sonarqube-e-saneamento-global
    caminhos: [api/v1/server.py]
    parecer:
      "Revisado: saneamento SonarQube preservado; novo handler nao introduz
      suppressor sem Record-Id."
  - registro: registro-2026-10-19-saneamento-sonarqube-timesfm-e-a11y
    caminhos: [api/v1/handlers.py]
    parecer:
      "Revisado: padrao de handler aiohttp identico ao saneado; sem novos
      supressores."
  - registro: registro-2026-10-19-verificacao-neural-timesfm-e-evolucao-ecossistema
    caminhos: [api/v1/handlers.py]
    parecer:
      "Revisado: evolucao do ecossistema registrada; novo endpoint S1 e aditivo
      e consistente com a arquitetura."
  - registro: registro-2026-10-20-harmonizacao-tier1-e-gemini-38
    caminhos: [tests/test_backend_hardening.py]
    parecer:
      "Revisado: apenas novos testes do endpoint S1; nenhum teste existente
      modificado em assercao."
  - registro: registro-2026-10-31-refatoracao-cfr-tipagem-e-higiene
    caminhos: [tests/test_backend_hardening.py]
    parecer:
      "Revisado: higiene de testes preservada; novos testes seguem tipagem e
      estilo do arquivo."
  - registro: registro-2026-11-01-elevacao-estetica-sota-otimizacao-endpoints-e-reconciliacao
    caminhos:
      [
        frontend/src/app/api/sota/laya/predict/route.ts,
        frontend/src/app/api/sota/laya/solve/route.ts,
      ]
    parecer:
      "Revisado: endpoints otimizados preservados; apenas flag simulation
      explicita adicionada ao payload de fallback."
  - registro: registro-2026-11-08-saneamento-pure-ascii-timesfm-e-handlers
    caminhos: [api/v1/handlers.py]
    parecer:
      "Revisado: ASCII puro preservado nos novos trechos de handle_s1_decide;
      ruff verde."
---

# Registro — remediação dos achados System-1 (2026-11-12)

**Condutor:** Devin (SWE-2 Flash) [Tier 1] · **Base:**
`reports/AUDITORIA-2026-11-12-arquitetura-system1.md`

## Achado → correção

| #   | Achado                                                  | Correção aplicada                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A   | Paridade TS↔Python dos moduladores de solver imperfeita | `frontend/src/lib/laya.ts`: adicionados `adaptGenericFramework` + adapters `libratus`/`antevisao`/`systems-theory`/`universal-importer` (espelham `_modulate_generic_framework`); solver fora do conjunto agora normaliza para `universal-importer` — nunca vaza chave crua, `target_solver` idêntico ao Python. Teste novo cobre ambos os casos.                                                                                                                                                                                   |
| B   | Dois caches de Router Laya no mesmo processo            | `llm/laya_bridge.py`: `_PREDICT_ROUTER` removido; `_obter_predict_router()` delega a `LayaRouter._carregar_router(retry=...)` — checkpoint 322M único por processo. `_carregar_router` ganhou lock de carga e retry pós-falha. `homologar_laya_gpu.py` `/health` atualizado para `LayaRouter._router`.                                                                                                                                                                                                                              |
| C   | `is_multimodal_input` tratava qualquer dict como nuvem  | `llm/gemini_decisions.py`: dicts só são multimodais com marcador explícito (`_dict_tem_marcador_midia`: chaves `inline_data`/`file_data`/`image`/…, `type` de mídia, `mime_type` mídia, profundidade ≤8). Listas mantêm semântica original de content-parts. Dict textual/estruturado fica no caminho Laya local.                                                                                                                                                                                                                   |
| D   | Simulação TS sob `status: SUCCESS` sem flag             | Rotas `/api/sota/laya/predict` e `/solve` agora emitem `simulation: true                                                                                                                                                                                                                                                                                                                                                                                                                                                            | false` no topo da resposta (além da proveniência §4). |
| E   | Cascata `decide_s1` ignorava o microserviço :8192       | `llm/laya_bridge.py`: novo `laya_predict_remote()` (POST `/predict`, timeout `CHICO_LAYA_SERVICE_TIMEOUT_MS`=2000ms, `LAYA_SERVICE_URL`/`CHICO_LAYA_SERVICE_URL`, kill-switch `CHICO_LAYA_SERVICE_DISABLE=1`). `llm/gemini_decisions.py`: `_laya_predict_com_servico()` — in-process primeiro; se `fallback_used` ou falha, sonda o serviço dedicado (único caminho que executa o checkpoint neste host, RX 570 sem CUDA); `CHICO_LAYA_PREFER_SERVICE=1` inverte a ordem. Proveniência remota preservada + tag `laya-http-service`. |
| F   | `decide_s1` não normalizava questions                   | `normalize_questions(questions)` executado uma vez no topo de `decide_s1` — formato inválido falha antes de qualquer motor (teste dedicado). `decide()` recebe o dict normalizado; `laya_predict` recebe o shape original Laya (`true`/`false` em critérios noul).                                                                                                                                                                                                                                                                  |
| G   | S1 sem endpoint no backend aiohttp                      | Novo `POST /api/v1/s1/decide` (`api/v1/handlers.py::handle_s1_decide` + registro em `api/v1/server.py`): valida `state`+`questions` (400), executa `decide_s1` em `asyncio.to_thread`, `RuntimeError`→503, resposta = `DecisionResult.to_dict()` + `status`.                                                                                                                                                                                                                                                                        |

## Verificações executadas (2026-11-12)

- `pytest` focado S1/S2 + backend: **178 passed, 0 erros, 0 warnings** (guard
  SOTA verde).
- `jest` frontend (`laya.test.ts`, rotas laya): **17+12 passed**; `tsc --noEmit`
  sem erros em laya.
- `ruff check` nos 7 arquivos Python: limpo. `ruff format` aplicado (canônico do
  projeto).
- `prettier --check` nos 4 arquivos TS: limpo.
- Sonda real `laya_predict_remote` com serviço fora: `None` gracioso (fail-open
  correto).
- Testes novos: 5 em `test_gemini_decisions.py` (multimodal dict, normalização
  no topo, microserviço assume/fallback/não-consulta), 2 em
  `test_backend_hardening.py` (handler 200/400), 1 em `laya.test.ts`
  (normalização universal-importer).

## Notas

- O diff inclui reformatação canônica (ruff format/prettier) aplicada pelo
  toolchain em arquivos tocados — mesmo destino do lint-staged no commit.
- `decide_s1` continua sem autoridade sobre modelo/custo ($): invariante
  preservado; o microserviço é apenas mais um motor local da cascata.
