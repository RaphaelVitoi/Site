---
id: registro-2026-11-14-refino-laya-tracker-e-furb110
tipo: registro
escopo: Site -- commit complementar com _LatencyTracker thread-safe, _serialize_prediction DRY (C901 <=
  10) e FURB110 em llm/laya_bridge.py e scripts/ops/homologar_laya_gpu.py
ecossistema: nexus-sota
autor: Gemini 4 Hydrogen <noreply@google.com>
criado_em: '2026-11-14T12:27:00-03:00'
atualizado_em: '2026-11-14T12:27:00-03:00'
classes:
  - interno
  - medido
  - governanca
  - otimizacao
config_medida:
  congelada_em: '2026-11-14'
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data: '2026-11-14'
caminhos:
  - llm/laya_bridge.py
  - reports/REGISTRO-2026-11-14-refino-laya-tracker-e-furb110.md
  - scripts/ops/homologar_laya_gpu.py
revisoes_de_ancora:
  - registro: auditoria-2026-09-24-laya-multilingual-s1
    caminhos:
      - llm/laya_bridge.py
    parecer: llm/laya_bridge.py -- aplica simplificacao FURB110 (choice or None em laya_predict e _build_batch_prediction_item)
      sem alterar assinaturas ou contratos.
  - registro: handoff-2026-09-22-integracao-system1-llm-dashboard
    caminhos:
      - llm/laya_bridge.py
    parecer: llm/laya_bridge.py -- aplica simplificacao FURB110 (choice or None em laya_predict e _build_batch_prediction_item)
      sem alterar assinaturas ou contratos.
  - registro: handoff-2026-09-24-laya-gpu-homologacao-e-solver-bridge
    caminhos:
      - llm/laya_bridge.py
      - scripts/ops/homologar_laya_gpu.py
    parecer: llm/laya_bridge.py -- aplica simplificacao FURB110 (choice or None em laya_predict e _build_batch_prediction_item)
      sem alterar assinaturas ou contratos; scripts/ops/homologar_laya_gpu.py -- extrai _LatencyTracker
      thread-safe (leitura de _window[-1] protegida pelo lock e p95 via math.ceil) e _serialize_prediction
      DRY reduzindo criar_fastapi_app para C901 <= 10.
  - registro: handoff-2026-09-24-laya-multilingual-s1-integracao
    caminhos:
      - llm/laya_bridge.py
    parecer: llm/laya_bridge.py -- aplica simplificacao FURB110 (choice or None em laya_predict e _build_batch_prediction_item)
      sem alterar assinaturas ou contratos.
  - registro: handoff-2026-09-24-laya-pesos-carregados-e-microservico
    caminhos:
      - scripts/ops/homologar_laya_gpu.py
    parecer: scripts/ops/homologar_laya_gpu.py -- extrai _LatencyTracker thread-safe (leitura de _window[-1]
      protegida pelo lock e p95 via math.ceil) e _serialize_prediction DRY reduzindo criar_fastapi_app
      para C901 <= 10.
  - registro: handoff-2026-11-10-boot-persistente-mesh-mcp-e-cockpit
    caminhos:
      - scripts/ops/homologar_laya_gpu.py
    parecer: scripts/ops/homologar_laya_gpu.py -- extrai _LatencyTracker thread-safe (leitura de _window[-1]
      protegida pelo lock e p95 via math.ceil) e _serialize_prediction DRY reduzindo criar_fastapi_app
      para C901 <= 10.
  - registro: handoff-2026-11-14-decision1-laya-s1-s2-e-ancoras
    caminhos:
      - llm/laya_bridge.py
      - scripts/ops/homologar_laya_gpu.py
    parecer: llm/laya_bridge.py -- aplica simplificacao FURB110 (choice or None em laya_predict e _build_batch_prediction_item)
      sem alterar assinaturas ou contratos; scripts/ops/homologar_laya_gpu.py -- extrai _LatencyTracker
      thread-safe (leitura de _window[-1] protegida pelo lock e p95 via math.ceil) e _serialize_prediction
      DRY reduzindo criar_fastapi_app para C901 <= 10.
  - registro: plano-laya-integracao-s1s2-pmev-2026-09-20
    caminhos:
      - llm/laya_bridge.py
    parecer: llm/laya_bridge.py -- aplica simplificacao FURB110 (choice or None em laya_predict e _build_batch_prediction_item)
      sem alterar assinaturas ou contratos.
  - registro: registro-2026-09-23-evolucao-pendencias-laya-e-tarefas
    caminhos:
      - llm/laya_bridge.py
    parecer: llm/laya_bridge.py -- aplica simplificacao FURB110 (choice or None em laya_predict e _build_batch_prediction_item)
      sem alterar assinaturas ou contratos.
  - registro: registro-2026-09-24-blindagem-ascii-e-harmonizacao-scripts
    caminhos:
      - llm/laya_bridge.py
      - scripts/ops/homologar_laya_gpu.py
    parecer: llm/laya_bridge.py -- aplica simplificacao FURB110 (choice or None em laya_predict e _build_batch_prediction_item)
      sem alterar assinaturas ou contratos; scripts/ops/homologar_laya_gpu.py -- extrai _LatencyTracker
      thread-safe (leitura de _window[-1] protegida pelo lock e p95 via math.ceil) e _serialize_prediction
      DRY reduzindo criar_fastapi_app para C901 <= 10.
  - registro: registro-2026-09-24-laya-gpu-homologacao-e-solver-bridge
    caminhos:
      - llm/laya_bridge.py
      - scripts/ops/homologar_laya_gpu.py
    parecer: llm/laya_bridge.py -- aplica simplificacao FURB110 (choice or None em laya_predict e _build_batch_prediction_item)
      sem alterar assinaturas ou contratos; scripts/ops/homologar_laya_gpu.py -- extrai _LatencyTracker
      thread-safe (leitura de _window[-1] protegida pelo lock e p95 via math.ceil) e _serialize_prediction
      DRY reduzindo criar_fastapi_app para C901 <= 10.
  - registro: registro-2026-09-24-laya-multilingual-s1-integracao
    caminhos:
      - llm/laya_bridge.py
    parecer: llm/laya_bridge.py -- aplica simplificacao FURB110 (choice or None em laya_predict e _build_batch_prediction_item)
      sem alterar assinaturas ou contratos.
  - registro: registro-2026-09-24-laya-pesos-carregados-e-microservico
    caminhos:
      - scripts/ops/homologar_laya_gpu.py
    parecer: scripts/ops/homologar_laya_gpu.py -- extrai _LatencyTracker thread-safe (leitura de _window[-1]
      protegida pelo lock e p95 via math.ceil) e _serialize_prediction DRY reduzindo criar_fastapi_app
      para C901 <= 10.
  - registro: registro-2026-09-24-retificacao-hardware-gpu-amd-vulkan
    caminhos:
      - scripts/ops/homologar_laya_gpu.py
    parecer: scripts/ops/homologar_laya_gpu.py -- extrai _LatencyTracker thread-safe (leitura de _window[-1]
      protegida pelo lock e p95 via math.ceil) e _serialize_prediction DRY reduzindo criar_fastapi_app
      para C901 <= 10.
  - registro: registro-2026-09-25-laya-warmup-persistencia-e-timeout-s1
    caminhos:
      - scripts/ops/homologar_laya_gpu.py
    parecer: scripts/ops/homologar_laya_gpu.py -- extrai _LatencyTracker thread-safe (leitura de _window[-1]
      protegida pelo lock e p95 via math.ceil) e _serialize_prediction DRY reduzindo criar_fastapi_app
      para C901 <= 10.
  - registro: registro-2026-09-29-saneamento-lint-e-calibracao
    caminhos:
      - scripts/ops/homologar_laya_gpu.py
    parecer: scripts/ops/homologar_laya_gpu.py -- extrai _LatencyTracker thread-safe (leitura de _window[-1]
      protegida pelo lock e p95 via math.ceil) e _serialize_prediction DRY reduzindo criar_fastapi_app
      para C901 <= 10.
  - registro: registro-2026-10-13-saneamento-diagnosticos-ide-e-compatibilidade
    caminhos:
      - llm/laya_bridge.py
    parecer: llm/laya_bridge.py -- aplica simplificacao FURB110 (choice or None em laya_predict e _build_batch_prediction_item)
      sem alterar assinaturas ou contratos.
  - registro: registro-2026-11-09-idempotencia-socket-laya-gpu-serve
    caminhos:
      - scripts/ops/homologar_laya_gpu.py
    parecer: scripts/ops/homologar_laya_gpu.py -- extrai _LatencyTracker thread-safe (leitura de _window[-1]
      protegida pelo lock e p95 via math.ceil) e _serialize_prediction DRY reduzindo criar_fastapi_app
      para C901 <= 10.
  - registro: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
    caminhos:
      - llm/laya_bridge.py
    parecer: llm/laya_bridge.py -- aplica simplificacao FURB110 (choice or None em laya_predict e _build_batch_prediction_item)
      sem alterar assinaturas ou contratos.
verificado:
  - ruff format --check, ruff check, ruff check --select C901,PERF,FURB e pyright (0 erros, 0 warnings)
    em llm/laya_bridge.py e scripts/ops/homologar_laya_gpu.py
  - pytest suite S1/S2/Decision1/Stitch (157 passed in 18.53s) e suite_verde.py integral (arvore 1161954b,
    0 erros, 0 warnings, 0 nao executados) ja executadas sobre o codigo exato em disco
  - Daemon live http://127.0.0.1:8192 (PID 19564) operando com esta exata implementacao de _LatencyTracker
    e _serialize_prediction
nao_verificado:
  - Execucao remota de GitHub Actions apos o push final
---

# Refino Estrutural Laya S1 -- _LatencyTracker, _serialize_prediction e FURB110

1. **`scripts/ops/homologar_laya_gpu.py`:** Extracao de `_LatencyTracker` (janela rolante thread-safe com leitura de `last_latency_ms` dentro do lock) e `_serialize_prediction` DRY entre `/predict` e `/solve`, reduzindo `criar_fastapi_app` para complexidade `C901 <= 10`.
2. **`llm/laya_bridge.py`:** Aplicacao de `choice or None` (`FURB110`) em `laya_predict` e `_build_batch_prediction_item`.
3. **Reconciliacao:** Reconcilia os registros vigentes ancorados nestes dois caminhos, incluindo `handoff-2026-11-14-decision1-laya-s1-s2-e-ancoras`.
