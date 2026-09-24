---
id: registro-2026-09-24-blindagem-ascii-e-harmonizacao-scripts
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-09-24T10:30:00-03:00'
classes: [interno, medido, governanca, ascii, quality-gate, scripts, otimizacao]
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  session_id: ee1d6652-38d0-4803-9048-cf30bc0588a0
  session_started_at: '2026-09-24T07:18:00-03:00'
  condutor: Gemini 3.8 Flash <noreply@google.com>
  modelo: gemini-3.8-flash
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-09-24
caminhos:
  - api/v1/handlers.py
  - core/exploration_policy.py
  - core/perspective_schemas.py
  - database/queue_manager.py
  - engine/gemma_server.py
  - engine/pmev_h8_drift.py
  - engine/pmev_hh_benchmark.py
  - engine/solver_importers/deep_solver.py
  - engine/stitch_bridge.py
  - engine/timesfm_engine.py
  - engine/vitoi_perspective_engine.py
  - frontend/scripts/fontawesome-subset.py
  - llm/adapters.py
  - llm/gemini.py
  - llm/laya_bridge.py
  - llm/laya_solver_adapter.py
  - llm/orchestrator.py
  - llm/routing_policy.py
  - memory_rag.py
  - reports/HOMOLOGACAO-2026-09-24-laya-gpu.md
  - scripts/cli/nexus.py
  - scripts/maintenance/audit_ecosystem_tests_scripts.py
  - scripts/maintenance/purify_python_ascii.py
  - scripts/ops/homologar_laya_gpu.py
  - tests/test_api_game_theory_handlers.py
  - tests/test_autopoiesis_and_context.py
  - tests/test_backend_hardening.py
  - tests/test_cli_nexus_sonar.py
  - tests/test_core_coverage.py
  - tests/test_dream_rsi_integration.py
  - tests/test_invariancias_rp_canonico.py
  - tests/test_lancedb_chroma_dual_rag.py
  - tests/test_laya_bridge.py
  - tests/test_laya_fase4_predict.py
  - tests/test_laya_fase5_solver_adapter.py
  - tests/test_laya_ruin_prior_etapa0.py
  - tests/test_laya_s1_routing.py
  - tests/test_sync_jules_redacao.py
  - tests/test_timesfm_engine.py
  - tools/hybrid_router/plot_benchmark.py
verificado:
  - "blindagem-ascii: 100% dos modulos Python estao em Pure ASCII (0-127 bytes) com AST integra"
  - "nexus-ops-check-ascii: aprovado com 0 erros e 0 warnings"
  - "nexus-ops-purify-python: novo comando CLI e script de manutencao robusto baseado em AST e tokenize"
  - "remocao-junction-rogue: eliminada junction .venv-3.14.7-canonical evitando travessias desnecessarias"
  - "isolamento-de-pastas-virtuais: _is_ignored_dir e audit_ecosystem atualizados para ignorar .venv* e site-packages"
  - "auditoria-global-scripts: 354 modulos Python e 55 scripts PowerShell verificados com 100% de sucesso"
  - "cwv-gate-5-fases: 0 erros e 0 warnings (Performance, A11y, CVE, SRI SHA-512, Hygiene)"
  - "bateria-pytest: 152 testes passando e 1 pulado (CUDA) em 4.95s com 0 erros e 0 warnings"
  - "dashboard-executivo: testado com sucesso via dashboard.ps1 e dashboard.cmd (--once)"
nao_verificado:
  - "inferencia em GPU fisica NVIDIA (ambiente local opera em modo CPU override)"
revisoes_de_ancora:
  - registro: registro-2026-08-29-tres-orfaos
    caminhos:
      - engine/gemma_server.py
    parecer: >-
      Revisado. Purificacao de comentarios e strings para Pure ASCII e remocao
      de caracteres acentuados. A semantica, comportamento e AST foram preservados.
  - registro: registro-2026-09-19-refatoracao-sonar-python-e-icm
    caminhos:
      - llm/routing_policy.py
      - scripts/cli/nexus.py
      - tests/test_cli_nexus_sonar.py
    parecer: >-
      Revisado. Blindagem ASCII aplicada com preservacao exata da AST e escape unicode
      em testes de parsing do Sonar. Adicionado comando purify-python e atualizado
      filtro de ignorar pastas virtuais no check-ascii.
  - registro: registro-2026-09-19-warning-sem-backtracking
    caminhos:
      - scripts/cli/nexus.py
      - tests/test_cli_nexus_sonar.py
    parecer: >-
      Revisado. Blindagem ASCII aplicada aos modulos com regexes e testes preservados
      integralmente via unicode escapes para evitar falsos positivos no Sonar.
---

# REGISTRO DE HARMONIZACAO, BLINDAGEM ASCII E OTIMIZACAO DE SCRIPTS SOTA v8.0 GOLD

## 1. Contexto e Diagnostico
Durante a execucao do Atalho [4] (`nexus ops quality-gate`) via `dashboard.ps1`, a primeira
fase (`Blindagem ASCII` / `check-ascii`) falhou por duas razoes fundamentais:
1. Uma junction NTFS temporaria (`.venv-3.14.7-canonical`) estava no diretorio do projeto,
   fazendo com que varreduras recursivas entrassem em dezenas de milhares de arquivos
   de bibliotecas terceiras em `site-packages`.
2. 36 modulos do repositorio possuiam caracteres acentuados ou caracteres nao-ASCII
   em comentarios, docstrings e strings de teste apos adicoes recentes.

## 2. Acoes Implementadas
1. **Remocao da Junction e Blindagem de Filtros:**
   - A junction temporaria foi removida via `rmdir` nativo (o `.venv` canonico permanece intacto).
   - A funcao `_is_ignored_dir` em `scripts/cli/nexus.py` e em `scripts/maintenance/audit_ecosystem_tests_scripts.py`
     foi atualizada para ignorar qualquer pasta com prefixo `.venv`, `venv`, `.env` ou nome `site-packages`.
2. **Purificacao Sistemica de Codigo Python para Pure ASCII:**
   - Implementado algoritmo robusto de purificacao token por token em `scripts/maintenance/purify_python_ascii.py`.
   - Transliteracao automatica de comentarios e docstrings para ASCII legivel.
   - Escapamento exato via `\uXXXX` de literais de strings e f-strings, preservando invariancia de AST
     e equivalencia de comparacao em runtime.
   - Adicionado comando CLI `nexus ops purify-python`.
3. **Harmonizacao e Auditoria Integral do Ecossistema:**
   - Auditoria global em 354 modulos Python (100% compilando) e 55 scripts PowerShell (100% sintaxe integra).
   - Verificacao do Portao CWV 5-Fases com 0 erros e 0 warnings.
   - Verificacao do launcher do dashboard em PowerShell (`dashboard.ps1`) e batch (`dashboard.cmd`).
