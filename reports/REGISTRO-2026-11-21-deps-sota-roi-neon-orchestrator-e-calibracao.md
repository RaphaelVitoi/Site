---
id: registro-2026-11-21-deps-sota-roi-neon-orchestrator-e-calibracao
tipo: registro
escopo: Site -- elevacao/otimizacao de dependencias SOTA, remediacao effect@^3.22.5, integracoes ROI (orjson,
  winloop, scipy Nash, react-virtual, hypothesis/benchmark/schemathesis), regularizacao Gemini 4 Neon
  + duo Orchestrator + descontinuacao 3.1 Pro, calibracao duo 9.8/10 e handoff 2026-11-21
ecossistema: nexus-sota
autor: Gemini 4 Hydrogen <noreply@google.com>
criado_em: '2026-11-21T07:59:00-03:00'
atualizado_em: '2026-11-21T07:59:00-03:00'
commit: HEAD
classes:
- interno
- governanca
- registro
- dependencias
- roteamento
- calibracao
- handoff
caminhos:
- .agents/skills/google-jules-cloud/SKILL.md
- .claude/agent-memory/bolt/MEMORY.md
- .claude/project-context.md
- CLAUDE.md
- api/v1/handler_support.py
- api/v1/middleware.py
- core/runtime.py
- data/agent_identities.json
- data/model_catalog.json
- data/routing_map.json
- data/system_config.json
- database/queue_manager.py
- docs/GOVERNANCA_PIRAMIDAL_SOTA.md
- engine/canonical_poker_theory.py
- engine/gemma_server.py
- frontend/knip.json
- frontend/package.json
- frontend/src/app/(user)/dashboard/files/page.tsx
- llm/adapters.py
- llm/model_registry.py
- llm/routing_policy.py
- main.py
- memory_rag.py
- package-lock.json
- package.json
- pyproject.toml
- reports/HANDOFF-2026-11-21-deps-sota-roi-neon-orchestrator-e-calibracao.md
- reports/REGISTRO-2026-11-21-deps-sota-roi-neon-orchestrator-e-calibracao.md
- reports/agent-calibration/daily/2026-11-20.json
- reports/agent-calibration/feedback-ledger.jsonl
- requirements.txt
- scripts/ops/AgentCalibrationProvenance.ps1
- scripts/ops/autopoietic_daily_cycle.py
- tests/test_adapters_gemini_http.py
- tests/test_agent_calibration_provenance.py
- tests/test_gemini_pool.py
- tests/test_model_registry.py
- tests/test_sota_deps_roi_2026_11.py
- tools/hybrid_router/app.py
- utils/event_loop.py
- uv.lock
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  python: '3.14.9'
  so: Windows
  condutor: Gemini 4 Hydrogen
  planejador_orchestrator: Gemini 4 Neon
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: '2026-11-21'
verificado:
- 'uv pip check: 251 pacotes compativeis; paridade pyproject.toml <-> requirements.txt (0 diffs) e optional-dependencies.dev
  <-> dependency-groups.dev (True)'
- 'npm audit --omit=dev: found 0 vulnerabilities apos override effect@^3.22.5 (3.22.5); pip_audit (venv
  e -r requirements.txt): No known vulnerabilities found, 5 ignored'
- ruff check . (All checks passed!) e pyright --project pyproject.toml (0 errors, 0 warnings, 0 informations)
- 'pytest (5 suites ROI/deps/CVE/Laya): 54 passed, 0 warnings; pytest -n auto test_sota_deps_roi_2026_11:
  8 passed, 0 warnings'
- 'pytest (6 suites governanca/catalogo/registry/adapters/pool/hook): 147 passed, 0 warnings'
- 'pytest (provenance + feedback com duo orchestrator): 70 passed, 0 warnings'
- 'Frontend: knip@6.47.0 (exit 0), eslint@10.15.0 (exit 0), tsc (exit 0), Jest (119 suites / 771 tests
  passed, 0 warnings)'
- 'markdownlint em todos os .md modificados incluindo bolt/MEMORY.md: exit 0'
- Register-AgentCalibrationFeedback.ps1 gravou Score 9.8 como orchestrator:gemini-4-neon+gemini-4-hydrogen
  (sequence=100, 101 registros, tail_hash=fb2843f164cfc57665bdc95afaa038a70cd4ac3a507d3e1dc4d3f1a11bf80dd1)
nao_verificado:
- 'Record-AgentCalibration.ps1 -Tier0Present (fechamento formal de ciclo): portao aberto aguardando arbitragem
  presencial do Tier 0'
- Probe ao vivo v1beta para gemini-4-neon (VerificationStatus.NAO_VERIFICADO preservado)
- CI remoto GitHub Actions pos-push
referencias_nao_resolviveis: []
revisoes_de_ancora:
- registro: plan-dependency-boundary-reconciliation-2026-09-01
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em pyproject.toml, requirements.txt, uv.lock validam deps
    SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao
    Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 +
    147 + 70 testes Python e 119 suites Jest aprovados.
- registro: relatorio-fusao-cerebro-claude-quality-gate-2026-09-01
  caminhos:
  - data/system_config.json
  - package-lock.json
  - package.json
  parecer: Revisado em 2026-11-21. Atualizacoes em data/system_config.json, package-lock.json, package.json
    validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: auditoria-cwv-lighthouse-2026-09-01
  caminhos:
  - package-lock.json
  - package.json
  parecer: Revisado em 2026-11-21. Atualizacoes em package-lock.json, package.json validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: auditoria-2026-09-02-curadoria-mcp-e-processos-residuais
  caminhos:
  - data/system_config.json
  parecer: Revisado em 2026-11-21. Atualizacoes em data/system_config.json validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: auditoria-2026-09-02-integridade-do-projeto-e-piso-de-transformers
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em pyproject.toml, uv.lock validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: auditoria-2026-09-03-disco-extensao-e-roteador-de-modelo
  caminhos:
  - engine/gemma_server.py
  parecer: Revisado em 2026-11-21. Atualizacoes em engine/gemma_server.py validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: auditoria-2026-09-03-trabalho-do-gemini-3-8-flash
  caminhos:
  - CLAUDE.md
  - data/routing_map.json
  - data/system_config.json
  - engine/gemma_server.py
  - llm/model_registry.py
  - llm/routing_policy.py
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md, data/routing_map.json, data/system_config.json,
    engine/gemma_server.py, llm/model_registry.py, llm/routing_policy.py validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: auditoria-2026-09-07-preludio-jules-astra-e-correcao-da-delegacao
  caminhos:
  - llm/model_registry.py
  - tests/test_model_registry.py
  parecer: Revisado em 2026-11-21. Atualizacoes em llm/model_registry.py, tests/test_model_registry.py
    validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: auditoria-2026-09-08-o-que-esta-em-aberto-na-malha
  caminhos:
  - memory_rag.py
  - requirements.txt
  parecer: Revisado em 2026-11-21. Atualizacoes em memory_rag.py, requirements.txt validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: auditoria-2026-09-12-o-ci-vermelho-que-nenhum-portao-local-media
  caminhos:
  - CLAUDE.md
  - llm/model_registry.py
  - scripts/ops/AgentCalibrationProvenance.ps1
  - tests/test_agent_calibration_provenance.py
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md, llm/model_registry.py, scripts/ops/AgentCalibrationProvenance.ps1,
    tests/test_agent_calibration_provenance.py validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: auditoria-2026-09-22-paridade-config-identidade
  caminhos:
  - .agents/skills/google-jules-cloud/SKILL.md
  - CLAUDE.md
  - data/agent_identities.json
  parecer: Revisado em 2026-11-21. Atualizacoes em .agents/skills/google-jules-cloud/SKILL.md, CLAUDE.md,
    data/agent_identities.json validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: auditoria-2026-09-24-mcp-gateway-compartilhado-e-persistencia
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: auditoria-2026-10-08-integralidade-backend
  caminhos:
  - pyproject.toml
  - requirements.txt
  parecer: Revisado em 2026-11-21. Atualizacoes em pyproject.toml, requirements.txt validam deps SOTA
    (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao
    Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 +
    147 + 70 testes Python e 119 suites Jest aprovados.
- registro: auditoria-2026-11-09-governanca-contexto-memoria-routing-cosmovisao
  caminhos:
  - .claude/project-context.md
  parecer: Revisado em 2026-11-21. Atualizacoes em .claude/project-context.md validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: auditoria-2026-11-18-pools-chaves-observatorio-e-roteamento
  caminhos:
  - CLAUDE.md
  - database/queue_manager.py
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md, database/queue_manager.py validam deps SOTA
    (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao
    Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 +
    147 + 70 testes Python e 119 suites Jest aprovados.
- registro: handoff-2026-09-02-curadoria-mcp-quarentena-e-roteamento-lazy
  caminhos:
  - data/system_config.json
  parecer: Revisado em 2026-11-21. Atualizacoes em data/system_config.json validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: handoff-2026-09-10-lint-lighthouse-e-aceite-cve
  caminhos:
  - pyproject.toml
  parecer: Revisado em 2026-11-21. Atualizacoes em pyproject.toml validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: handoff-2026-09-13-integracao-de-engines-wasm-e-economia-de-gate
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em pyproject.toml, uv.lock validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: handoff-2026-09-14-pagina-icm-contra-a-mesa-real
  caminhos:
  - engine/gemma_server.py
  parecer: Revisado em 2026-11-21. Atualizacoes em engine/gemma_server.py validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: handoff-2026-09-19-documentos-loopback-sonar-e-download
  caminhos:
  - api/v1/middleware.py
  parecer: Revisado em 2026-11-21. Atualizacoes em api/v1/middleware.py validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: handoff-2026-09-22-integracao-system1-llm-dashboard
  caminhos:
  - CLAUDE.md
  - data/agent_identities.json
  - database/queue_manager.py
  - engine/gemma_server.py
  - scripts/ops/AgentCalibrationProvenance.ps1
  - tests/test_agent_calibration_provenance.py
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md, data/agent_identities.json, database/queue_manager.py,
    engine/gemma_server.py, scripts/ops/AgentCalibrationProvenance.ps1, tests/test_agent_calibration_provenance.py
    validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: handoff-2026-09-22-paridade-config-identidade
  caminhos:
  - .agents/skills/google-jules-cloud/SKILL.md
  - CLAUDE.md
  - data/agent_identities.json
  parecer: Revisado em 2026-11-21. Atualizacoes em .agents/skills/google-jules-cloud/SKILL.md, CLAUDE.md,
    data/agent_identities.json validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: handoff-2026-09-25-pool-rotacional-gemini-flash-lite
  caminhos:
  - tests/test_gemini_pool.py
  parecer: Revisado em 2026-11-21. Atualizacoes em tests/test_gemini_pool.py validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: handoff-2026-09-25-governanca-pools-openrouter-e-impacto
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: handoff-2026-09-29-contraste-acessibilidade-e-identidade-de-condutor
  caminhos:
  - CLAUDE.md
  - data/agent_identities.json
  - scripts/ops/AgentCalibrationProvenance.ps1
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md, data/agent_identities.json, scripts/ops/AgentCalibrationProvenance.ps1
    validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: handoff-2026-09-30-expurgo-de-modelos-obsoletos-harmonizacao-qwen-e-calibracao
  caminhos:
  - data/routing_map.json
  - data/system_config.json
  - engine/gemma_server.py
  - tools/hybrid_router/app.py
  parecer: Revisado em 2026-11-21. Atualizacoes em data/routing_map.json, data/system_config.json, engine/gemma_server.py,
    tools/hybrid_router/app.py validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: handoff-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em package-lock.json, pyproject.toml, requirements.txt,
    uv.lock validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: handoff-2026-10-20-harmonizacao-tier1-gemini-38
  caminhos:
  - CLAUDE.md
  - llm/adapters.py
  - llm/model_registry.py
  - llm/routing_policy.py
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md, llm/adapters.py, llm/model_registry.py,
    llm/routing_policy.py validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em frontend/package.json, package-lock.json, package.json,
    pyproject.toml, requirements.txt, uv.lock validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: handoff-2026-11-15-translategemma-timesfm-laya-roi
  caminhos:
  - memory_rag.py
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em memory_rag.py, pyproject.toml, uv.lock validam deps
    SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao
    Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 +
    147 + 70 testes Python e 119 suites Jest aprovados.
- registro: handoff-2026-11-18-deps-openrouter-free-worker-hud-e-calibracao
  caminhos:
  - CLAUDE.md
  - data/agent_identities.json
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md, data/agent_identities.json validam deps
    SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao
    Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 +
    147 + 70 testes Python e 119 suites Jest aprovados.
- registro: handoff-2026-11-18-observatorio-chaves-roteamento-e-calibracao
  caminhos:
  - CLAUDE.md
  - database/queue_manager.py
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md, database/queue_manager.py validam deps SOTA
    (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao
    Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 +
    147 + 70 testes Python e 119 suites Jest aprovados.
- registro: plano-frentes-abertas-2026-09-08
  caminhos:
  - requirements.txt
  parecer: Revisado em 2026-11-21. Atualizacoes em requirements.txt validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: plano-laya-integracao-s1s2-pmev-2026-09-20
  caminhos:
  - llm/model_registry.py
  - llm/routing_policy.py
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em llm/model_registry.py, llm/routing_policy.py, pyproject.toml,
    uv.lock validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-09-01-ancora-de-merge-e-instrucao-indexada
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-09-01-cache-por-mtime-e-fusao-do-project-context
  caminhos:
  - .claude/project-context.md
  parecer: Revisado em 2026-11-21. Atualizacoes em .claude/project-context.md validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-09-01-fronteira-http-e-portao-independente-de-perfil
  caminhos:
  - api/v1/middleware.py
  parecer: Revisado em 2026-11-21. Atualizacoes em api/v1/middleware.py validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-09-02-adapters-ligado-ao-caminho-real-anthropic
  caminhos:
  - llm/adapters.py
  parecer: Revisado em 2026-11-21. Atualizacoes em llm/adapters.py validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-09-02-correcao-de-escala-e-timestamp-no-ledger
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-09-02-fast-uri-alto-e-contrato-de-evidencia-pmev
  caminhos:
  - package-lock.json
  parecer: Revisado em 2026-11-21. Atualizacoes em package-lock.json validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-09-02-portao-de-calibracao-por-sessao
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-09-03-triade-fronteira-chico-e-concorrencia
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-09-05-regua-para-agente-autonomo-de-nuvem
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-09-07-delegacao-gemini-flash-lite-cinco-itens
  caminhos:
  - llm/model_registry.py
  - tests/test_model_registry.py
  parecer: Revisado em 2026-11-21. Atualizacoes em llm/model_registry.py, tests/test_model_registry.py
    validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-09-07-integracao-gpt6-astra-e-retirada-do-fable
  caminhos:
  - CLAUDE.md
  - llm/adapters.py
  - llm/model_registry.py
  - llm/routing_policy.py
  - tests/test_model_registry.py
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md, llm/adapters.py, llm/model_registry.py,
    llm/routing_policy.py, tests/test_model_registry.py validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-09-07-padronizacao-sistemica-markdownlint
  caminhos:
  - package.json
  parecer: Revisado em 2026-11-21. Atualizacoes em package.json validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-09-07-promocao-do-duo-gemini-na-faixa-gratuita
  caminhos:
  - llm/routing_policy.py
  parecer: Revisado em 2026-11-21. Atualizacoes em llm/routing_policy.py validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem
  caminhos:
  - frontend/package.json
  - llm/adapters.py
  - llm/model_registry.py
  - package-lock.json
  - package.json
  - tests/test_adapters_gemini_http.py
  - tests/test_model_registry.py
  parecer: Revisado em 2026-11-21. Atualizacoes em frontend/package.json, llm/adapters.py, llm/model_registry.py,
    package-lock.json, package.json, tests/test_adapters_gemini_http.py, tests/test_model_registry.py
    validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-09-08-arbitragem-soberana-sobre-a-lei-de-concorrencia
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-09-08-ruff-format-e-o-ci-vermelho
  caminhos:
  - llm/adapters.py
  - llm/model_registry.py
  parecer: Revisado em 2026-11-21. Atualizacoes em llm/adapters.py, llm/model_registry.py validam deps
    SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao
    Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 +
    147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-09-09-actionlint-e-a-fronteira-do-submodulo
  caminhos:
  - package.json
  parecer: Revisado em 2026-11-21. Atualizacoes em package.json validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-09-09-appkey-lida-por-string-e-a-fronteira-de-autoridade
  caminhos:
  - api/v1/middleware.py
  parecer: Revisado em 2026-11-21. Atualizacoes em api/v1/middleware.py validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-09-09-prisma-generate-e-o-typecheck-do-ci
  caminhos:
  - package.json
  parecer: Revisado em 2026-11-21. Atualizacoes em package.json validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-09-09-remediacao-dependabot-httpx2
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em pyproject.toml, uv.lock validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-09-09-saneamento-medicao-datada-identificacao-agentes
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-09-10-importacao-visivel-hh-hrc
  caminhos:
  - frontend/package.json
  - package-lock.json
  parecer: Revisado em 2026-11-21. Atualizacoes em frontend/package.json, package-lock.json validam deps
    SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao
    Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 +
    147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-09-10-publicacao-inputs-mtt
  caminhos:
  - frontend/package.json
  - package-lock.json
  parecer: Revisado em 2026-11-21. Atualizacoes em frontend/package.json, package-lock.json validam deps
    SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao
    Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 +
    147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-09-12-a-identidade-do-antigravity-e-o-catalogo-que-faltava
  caminhos:
  - data/agent_identities.json
  parecer: Revisado em 2026-11-21. Atualizacoes em data/agent_identities.json validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-09-12-preludio-o-instrumento-que-sabia-abrir-e-nao-fechar
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-09-12-teoria-canonica-chen-janda-e-convergencia-cfr
  caminhos:
  - engine/canonical_poker_theory.py
  - frontend/package.json
  parecer: Revisado em 2026-11-21. Atualizacoes em engine/canonical_poker_theory.py, frontend/package.json
    validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-09-13-ci-typecheck-e-fronteira-de-capacidades
  caminhos:
  - api/v1/middleware.py
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em api/v1/middleware.py, pyproject.toml, uv.lock validam
    deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-09-13-otimizacoes-helpers-antientropia-e-feedback
  caminhos:
  - frontend/knip.json
  - frontend/package.json
  - package-lock.json
  - package.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em frontend/knip.json, frontend/package.json, package-lock.json,
    package.json, pyproject.toml, requirements.txt, uv.lock validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-09-14-auditoria-e-refinamento-settings-e-configuracoes
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  - requirements.txt
  parecer: Revisado em 2026-11-21. Atualizacoes em frontend/package.json, package-lock.json, package.json,
    requirements.txt validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-09-14-correcoes-pos-auditoria-handoff-tier-e-dependencias
  caminhos:
  - CLAUDE.md
  - data/agent_identities.json
  - frontend/package.json
  - package-lock.json
  - package.json
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md, data/agent_identities.json, frontend/package.json,
    package-lock.json, package.json validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-09-14-harmonizacao-canonicos-astra-luna-gemini-anthropic
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-09-14-saneamento-linter-e-tipagem-tests-e-skills
  caminhos:
  - tests/test_agent_calibration_provenance.py
  parecer: Revisado em 2026-11-21. Atualizacoes em tests/test_agent_calibration_provenance.py validam
    deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-09-18-decisoes-delegadas-sobre-as-pendencias
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  parecer: Revisado em 2026-11-21. Atualizacoes em frontend/package.json, package-lock.json, package.json
    validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-09-19-loopback-e-visualizador-pdf-chrome
  caminhos:
  - api/v1/middleware.py
  parecer: Revisado em 2026-11-21. Atualizacoes em api/v1/middleware.py validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-09-19-operador-local-dev-autenticacao
  caminhos:
  - frontend/src/app/(user)/dashboard/files/page.tsx
  parecer: Revisado em 2026-11-21. Atualizacoes em frontend/src/app/(user)/dashboard/files/page.tsx validam
    deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-09-19-universal-document-viewer-e-seguranca-csp-pdf
  caminhos:
  - frontend/src/app/(user)/dashboard/files/page.tsx
  parecer: Revisado em 2026-11-21. Atualizacoes em frontend/src/app/(user)/dashboard/files/page.tsx validam
    deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: 2026-09-22-auditoria-frontend-4-itens
  caminhos:
  - frontend/package.json
  parecer: Revisado em 2026-11-21. Atualizacoes em frontend/package.json validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-09-22-skill-handoff-e-calibracao
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-09-24-blindagem-ascii-e-harmonizacao-scripts
  caminhos:
  - database/queue_manager.py
  - engine/gemma_server.py
  - llm/adapters.py
  - llm/routing_policy.py
  - memory_rag.py
  parecer: Revisado em 2026-11-21. Atualizacoes em database/queue_manager.py, engine/gemma_server.py,
    llm/adapters.py, llm/routing_policy.py, memory_rag.py validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-09-24-harmonizacao-arquitetura-hibrida-vulkan-pytorch
  caminhos:
  - .claude/project-context.md
  parecer: Revisado em 2026-11-21. Atualizacoes em .claude/project-context.md validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-09-24-mcp-gateway-compartilhado-e-persistencia
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-09-25-pool-rotacional-gemini-flash-lite
  caminhos:
  - tests/test_gemini_pool.py
  parecer: Revisado em 2026-11-21. Atualizacoes em tests/test_gemini_pool.py validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-09-25-precedencia-economica-assinaturas-pro-e-nuvem-free
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-09-25-skill-avaliacao-impacto-sessao
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-09-25-soberania-commit-push-e-staging-perpetuo
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-09-25-teto-de-commits-e-push-obrigatorio
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-09-29-saneamento-lint-e-calibracao
  caminhos:
  - .agents/skills/google-jules-cloud/SKILL.md
  parecer: Revisado em 2026-11-21. Atualizacoes em .agents/skills/google-jules-cloud/SKILL.md validam
    deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-09-30-expurgo-de-modelos-obsoletos-e-reconciliacao-de-ancoras
  caminhos:
  - data/routing_map.json
  - data/system_config.json
  - engine/gemma_server.py
  - tools/hybrid_router/app.py
  parecer: Revisado em 2026-11-21. Atualizacoes em data/routing_map.json, data/system_config.json, engine/gemma_server.py,
    tools/hybrid_router/app.py validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-10-01-harmonizacao-malha-subagentes
  caminhos:
  - llm/routing_policy.py
  parecer: Revisado em 2026-11-21. Atualizacoes em llm/routing_policy.py validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-10-01-resiliencia-servidores-locais-e-triagem
  caminhos:
  - engine/gemma_server.py
  parecer: Revisado em 2026-11-21. Atualizacoes em engine/gemma_server.py validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-10-04-http-metrics-correlation-e-worker-shutdown
  caminhos:
  - api/v1/handler_support.py
  - api/v1/middleware.py
  parecer: Revisado em 2026-11-21. Atualizacoes em api/v1/handler_support.py, api/v1/middleware.py validam
    deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-10-04-remediacao-dependabot-pypdf
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em pyproject.toml, uv.lock validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
  caminhos:
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em uv.lock validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-10-05-atlas-cenarios-acessibilidade-e-design-system
  caminhos:
  - frontend/package.json
  parecer: Revisado em 2026-11-21. Atualizacoes em frontend/package.json validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-10-05-regua-de-tier-efetivo-no-catalogo-de-identidade
  caminhos:
  - data/agent_identities.json
  parecer: Revisado em 2026-11-21. Atualizacoes em data/agent_identities.json validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-10-05-resolucao-de-modelo-ollama-e-schema-json
  caminhos:
  - engine/gemma_server.py
  parecer: Revisado em 2026-11-21. Atualizacoes em engine/gemma_server.py validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em package-lock.json, pyproject.toml, requirements.txt,
    uv.lock validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-10-13-conclusao-4-trilhas-calibracao-rust-warmup-strata
  caminhos:
  - api/v1/middleware.py
  parecer: Revisado em 2026-11-21. Atualizacoes em api/v1/middleware.py validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em frontend/package.json, package-lock.json, package.json,
    uv.lock validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-10-13-saneamento-diagnosticos-ide-e-compatibilidade
  caminhos:
  - api/v1/middleware.py
  - engine/gemma_server.py
  - llm/routing_policy.py
  parecer: Revisado em 2026-11-21. Atualizacoes em api/v1/middleware.py, engine/gemma_server.py, llm/routing_policy.py
    validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em pyproject.toml, uv.lock validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em pyproject.toml, requirements.txt, uv.lock validam deps
    SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao
    Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 +
    147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-10-18-resolucao-sonarqube-e-saneamento-global
  caminhos:
  - .claude/project-context.md
  - docs/GOVERNANCA_PIRAMIDAL_SOTA.md
  - frontend/src/app/(user)/dashboard/files/page.tsx
  - memory_rag.py
  parecer: Revisado em 2026-11-21. Atualizacoes em .claude/project-context.md, docs/GOVERNANCA_PIRAMIDAL_SOTA.md,
    frontend/src/app/(user)/dashboard/files/page.tsx, memory_rag.py validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-10-19-saneamento-linters-markdown-e-conformidade-tipagem
  caminhos:
  - engine/gemma_server.py
  parecer: Revisado em 2026-11-21. Atualizacoes em engine/gemma_server.py validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-10-20-harmonizacao-tier1-e-gemini-38
  caminhos:
  - CLAUDE.md
  - data/agent_identities.json
  - data/routing_map.json
  - data/system_config.json
  - llm/adapters.py
  - llm/model_registry.py
  - llm/routing_policy.py
  - scripts/ops/autopoietic_daily_cycle.py
  - tests/test_adapters_gemini_http.py
  - tests/test_model_registry.py
  - tools/hybrid_router/app.py
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md, data/agent_identities.json, data/routing_map.json,
    data/system_config.json, llm/adapters.py, llm/model_registry.py, llm/routing_policy.py, scripts/ops/autopoietic_daily_cycle.py,
    tests/test_adapters_gemini_http.py, tests/test_model_registry.py, tools/hybrid_router/app.py validam
    deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
  caminhos:
  - frontend/package.json
  - llm/routing_policy.py
  - package-lock.json
  - tests/test_model_registry.py
  parecer: Revisado em 2026-11-21. Atualizacoes em frontend/package.json, llm/routing_policy.py, package-lock.json,
    tests/test_model_registry.py validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em frontend/package.json, package-lock.json, package.json,
    pyproject.toml, requirements.txt, uv.lock validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota
  caminhos:
  - package.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em package.json, pyproject.toml, requirements.txt, uv.lock
    validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-10-27-elevacao-dependencias-python-openai-pyspark-pytest
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em pyproject.toml, uv.lock validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-10-27-estabilizacao-completa-esteira-ci-github-actions
  caminhos:
  - tests/test_gemini_pool.py
  parecer: Revisado em 2026-11-21. Atualizacoes em tests/test_gemini_pool.py validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-10-27-evolucao-project-context-e-reconciliacao-sota
  caminhos:
  - .claude/project-context.md
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em .claude/project-context.md, pyproject.toml, uv.lock
    validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-10-27-harmonizacao-dependencias-ci-e-wasm
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  parecer: Revisado em 2026-11-21. Atualizacoes em frontend/package.json, package-lock.json, package.json
    validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-10-27-harmonizacao-dependencias-katex-e-ci
  caminhos:
  - frontend/package.json
  - package-lock.json
  parecer: Revisado em 2026-11-21. Atualizacoes em frontend/package.json, package-lock.json validam deps
    SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao
    Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 +
    147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em frontend/package.json, package-lock.json, package.json,
    uv.lock validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-10-27-resolucao-matriz-ci-e-acessibilidade-wcag
  caminhos:
  - engine/gemma_server.py
  parecer: Revisado em 2026-11-21. Atualizacoes em engine/gemma_server.py validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-10-28-atualizacao-laya-e-estabilizacao-playwright-smoke
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em pyproject.toml, uv.lock validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em pyproject.toml, requirements.txt, uv.lock validam deps
    SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao
    Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 +
    147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-10-31-estabilizacao-lifecycle-warmup-turbopack
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em pyproject.toml, requirements.txt, uv.lock validam deps
    SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao
    Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 +
    147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules
  caminhos:
  - .agents/skills/google-jules-cloud/SKILL.md
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em .agents/skills/google-jules-cloud/SKILL.md, package-lock.json,
    package.json, pyproject.toml, uv.lock validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-01-resiliencia-proactor-winerror-10054
  caminhos:
  - main.py
  parecer: Revisado em 2026-11-21. Atualizacoes em main.py validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-03-elevacao-dependencias-pyarrow-openai-anthropic-laya
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em pyproject.toml, uv.lock validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-11-03-otimizacao-agentes-watchdog-e-calibracao
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em pyproject.toml, uv.lock validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-11-03-remediacao-dependabot-pypdf-pyasn1-minimatch
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em package-lock.json, package.json, pyproject.toml, uv.lock
    validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-04-otimizacao-layout-header-e-elevacao-dependencias
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em pyproject.toml, uv.lock validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
  caminhos:
  - .agents/skills/google-jules-cloud/SKILL.md
  - pyproject.toml
  parecer: Revisado em 2026-11-21. Atualizacoes em .agents/skills/google-jules-cloud/SKILL.md, pyproject.toml
    validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em package-lock.json, package.json, pyproject.toml, requirements.txt,
    uv.lock validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
  caminhos:
  - engine/gemma_server.py
  - frontend/package.json
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em engine/gemma_server.py, frontend/package.json, package-lock.json,
    package.json, pyproject.toml, uv.lock validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em pyproject.toml, uv.lock validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-11-07-elevacao-dependencias-fastapi-regex-types-aiofiles
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em pyproject.toml, uv.lock validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-11-08-elevacao-dependencias-regex-e-laya
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em pyproject.toml, requirements.txt, uv.lock validam deps
    SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao
    Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 +
    147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-08-elevacao-polars-2-1-e-consumo-integral-engines-sota
  caminhos:
  - engine/canonical_poker_theory.py
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em engine/canonical_poker_theory.py, pyproject.toml, requirements.txt,
    uv.lock validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-08-elevacao-pypdf-7-0-torchvision-e-ecossistema-npm
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em frontend/package.json, package-lock.json, package.json,
    pyproject.toml, requirements.txt, uv.lock validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-08-harmonizacao-r-4-6-1-jules-e-saneamento-ancoras
  caminhos:
  - .claude/agent-memory/bolt/MEMORY.md
  - package-lock.json
  - package.json
  parecer: Revisado em 2026-11-21. Atualizacoes em .claude/agent-memory/bolt/MEMORY.md, package-lock.json,
    package.json validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-08-integracao-sota-triade-stitch-exa-jules
  caminhos:
  - .agents/skills/google-jules-cloud/SKILL.md
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em .agents/skills/google-jules-cloud/SKILL.md, pyproject.toml,
    requirements.txt, uv.lock validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-08-otimizacao-pyproject-dependencias-extras-e-reconciliacao
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em pyproject.toml, uv.lock validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-11-08-refinamento-sonarlint-e-code-review-triage
  caminhos:
  - frontend/package.json
  - package.json
  parecer: Revisado em 2026-11-21. Atualizacoes em frontend/package.json, package.json validam deps SOTA
    (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao
    Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 +
    147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-08-saneamento-code-review-triage
  caminhos:
  - frontend/package.json
  - package.json
  parecer: Revisado em 2026-11-21. Atualizacoes em frontend/package.json, package.json validam deps SOTA
    (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao
    Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 +
    147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-09-elevacao-dependencias-e-fork-eigen
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em package-lock.json, package.json, pyproject.toml, requirements.txt,
    uv.lock validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-09-saneamento-governanca-memoria-e-contexto-auditado
  caminhos:
  - .claude/project-context.md
  parecer: Revisado em 2026-11-21. Atualizacoes em .claude/project-context.md validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-11-10-ai-sdk-google-4-0-117-ai-7-0-169
  caminhos:
  - package-lock.json
  - package.json
  parecer: Revisado em 2026-11-21. Atualizacoes em package-lock.json, package.json validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-11-10-bump-deps-e-extra-paths-pylance
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em pyproject.toml, uv.lock validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-11-10-google-genai-3-1-0
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em pyproject.toml, uv.lock validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-11-10-identidade-devin-swe-2-flash
  caminhos:
  - data/agent_identities.json
  parecer: Revisado em 2026-11-21. Atualizacoes em data/agent_identities.json validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-11-10-lock-bundle-analyzer-16-4-6
  caminhos:
  - package-lock.json
  parecer: Revisado em 2026-11-21. Atualizacoes em package-lock.json validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-11-11-elevacao-fastapi-playwright-e-bump-deep-research
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em pyproject.toml, uv.lock validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-11-11-elevacao-pypdf-turbo-ai-sdk-google
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em package-lock.json, package.json, pyproject.toml, requirements.txt,
    uv.lock validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-11-elevacao-sentence-transformers-genai-prettier-exa-mcp
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em package-lock.json, package.json, pyproject.toml, requirements.txt,
    uv.lock validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-11-elevacao-typer-types-knip-harmonizacao
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em package-lock.json, package.json, pyproject.toml, requirements.txt,
    uv.lock validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-11-nota-pareamento-dev-dependency-groups
  caminhos:
  - pyproject.toml
  parecer: Revisado em 2026-11-21. Atualizacoes em pyproject.toml validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-12-anatomia-assinatura-5-campos
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-12-governanca-identidades-e-assinaturas
  caminhos:
  - CLAUDE.md
  - llm/model_registry.py
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md, llm/model_registry.py validam deps SOTA
    (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao
    Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 +
    147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-12-pool-multimodal-e-refactors-sonar
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-12-pools-chaves-reposicao-e-doc-consolidada
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-12-preferencia-devin-e-data-governanca
  caminhos:
  - CLAUDE.md
  - data/agent_identities.json
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md, data/agent_identities.json validam deps
    SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao
    Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 +
    147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-12-review-sweeps-endurecimento-sota
  caminhos:
  - memory_rag.py
  - package-lock.json
  - package.json
  - tests/test_gemini_pool.py
  parecer: Revisado em 2026-11-21. Atualizacoes em memory_rag.py, package-lock.json, package.json, tests/test_gemini_pool.py
    validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-13-elevacao-deps-e-saneamento-configs-ide
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em package-lock.json, package.json, pyproject.toml, uv.lock
    validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-13-revisao-ancora-pyproject-extra-path-cockpit
  caminhos:
  - pyproject.toml
  parecer: Revisado em 2026-11-21. Atualizacoes em pyproject.toml validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-13-timeout-ollama-fila-mka
  caminhos:
  - engine/gemma_server.py
  parecer: Revisado em 2026-11-21. Atualizacoes em engine/gemma_server.py validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-11-14-correcao-devin-e-entrypoints-gemini-3-1-pro
  caminhos:
  - .claude/project-context.md
  - CLAUDE.md
  - data/agent_identities.json
  - data/routing_map.json
  - data/system_config.json
  - llm/adapters.py
  - llm/model_registry.py
  - scripts/ops/AgentCalibrationProvenance.ps1
  - scripts/ops/autopoietic_daily_cycle.py
  - tests/test_model_registry.py
  parecer: Revisado em 2026-11-21. Atualizacoes em .claude/project-context.md, CLAUDE.md, data/agent_identities.json,
    data/routing_map.json, data/system_config.json, llm/adapters.py, llm/model_registry.py, scripts/ops/AgentCalibrationProvenance.ps1,
    scripts/ops/autopoietic_daily_cycle.py, tests/test_model_registry.py validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em package-lock.json, package.json, pyproject.toml, uv.lock
    validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-14-identidade-e-governanca-gemini-4-hydrogen
  caminhos:
  - .claude/project-context.md
  - CLAUDE.md
  - data/agent_identities.json
  parecer: Revisado em 2026-11-21. Atualizacoes em .claude/project-context.md, CLAUDE.md, data/agent_identities.json
    validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-14-laya-pylint-e-refactors-sonar
  caminhos:
  - llm/routing_policy.py
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em llm/routing_policy.py, pyproject.toml, uv.lock validam
    deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-14-llama-cpp-b12387-router-9931
  caminhos:
  - llm/routing_policy.py
  parecer: Revisado em 2026-11-21. Atualizacoes em llm/routing_policy.py validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-11-14-merge-evolucao-jules-851230-132415
  caminhos:
  - .claude/agent-memory/bolt/MEMORY.md
  parecer: Revisado em 2026-11-21. Atualizacoes em .claude/agent-memory/bolt/MEMORY.md validam deps SOTA
    (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao
    Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 +
    147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-14-regua-graduada-familia-gemini-tier1
  caminhos:
  - .claude/project-context.md
  - CLAUDE.md
  - data/agent_identities.json
  parecer: Revisado em 2026-11-21. Atualizacoes em .claude/project-context.md, CLAUDE.md, data/agent_identities.json
    validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-14-roteamento-pools-transporte-e-validacao-hrc
  caminhos:
  - data/routing_map.json
  - data/system_config.json
  - llm/routing_policy.py
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em data/routing_map.json, data/system_config.json, llm/routing_policy.py,
    pyproject.toml, uv.lock validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-14-sync-uvlock-ollama-cloud-circuit-e-ci
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em pyproject.toml, uv.lock validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-11-15-blindagem-calibracao-presencial-tier0
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-15-laya-0432-failover-arquitetura-s1
  caminhos:
  - data/routing_map.json
  - data/system_config.json
  - llm/adapters.py
  - llm/model_registry.py
  - llm/routing_policy.py
  - memory_rag.py
  - tests/test_adapters_gemini_http.py
  - tests/test_model_registry.py
  parecer: Revisado em 2026-11-21. Atualizacoes em data/routing_map.json, data/system_config.json, llm/adapters.py,
    llm/model_registry.py, llm/routing_policy.py, memory_rag.py, tests/test_adapters_gemini_http.py, tests/test_model_registry.py
    validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-15-malha-agentica-rotacao-hkcu-hklm
  caminhos:
  - data/routing_map.json
  - data/system_config.json
  parecer: Revisado em 2026-11-21. Atualizacoes em data/routing_map.json, data/system_config.json validam
    deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-16-elevacao-deps-anthropic-laya-accelerate-e-deps-sync
  caminhos:
  - package.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em package.json, pyproject.toml, requirements.txt, uv.lock
    validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-17-arbitragem-soberana-bypass-portao
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-17-auditoria-fortificacao-backend-5-fases
  caminhos:
  - api/v1/handler_support.py
  - api/v1/middleware.py
  - core/runtime.py
  - database/queue_manager.py
  - engine/gemma_server.py
  - main.py
  - tools/hybrid_router/app.py
  parecer: Revisado em 2026-11-21. Atualizacoes em api/v1/handler_support.py, api/v1/middleware.py, core/runtime.py,
    database/queue_manager.py, engine/gemma_server.py, main.py, tools/hybrid_router/app.py validam deps
    SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao
    Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 +
    147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-17-auto-configuracao-harness-devin-swe2
  caminhos:
  - CLAUDE.md
  - data/agent_identities.json
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md, data/agent_identities.json validam deps
    SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao
    Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 +
    147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-17-elevacao-deps-google-genai-openai
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em pyproject.toml, requirements.txt, uv.lock validam deps
    SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao
    Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 +
    147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-17-fase-2-saneamento-estrutural-frontend
  caminhos:
  - frontend/package.json
  - package-lock.json
  parecer: Revisado em 2026-11-21. Atualizacoes em frontend/package.json, package-lock.json validam deps
    SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao
    Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 +
    147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-17-fase-3-backend-estrutural-sota
  caminhos:
  - api/v1/handler_support.py
  - api/v1/middleware.py
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em api/v1/handler_support.py, api/v1/middleware.py, pyproject.toml,
    requirements.txt, uv.lock validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-17-fase-4-governanca-estrutural-sota
  caminhos:
  - CLAUDE.md
  - data/model_catalog.json
  - docs/GOVERNANCA_PIRAMIDAL_SOTA.md
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md, data/model_catalog.json, docs/GOVERNANCA_PIRAMIDAL_SOTA.md
    validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-17-fase-5-evolucao-das-forcas-sota
  caminhos:
  - package.json
  - pyproject.toml
  parecer: Revisado em 2026-11-21. Atualizacoes em package.json, pyproject.toml validam deps SOTA (effect@^3.22.5,
    openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao Gemini 4 Neon
    / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 + 147 + 70 testes
    Python e 119 suites Jest aprovados.
- registro: registro-2026-11-17-fases-0-1-portoes-verificacao-e-higiene-doc-real
  caminhos:
  - main.py
  - package-lock.json
  - package.json
  - pyproject.toml
  - requirements.txt
  parecer: Revisado em 2026-11-21. Atualizacoes em main.py, package-lock.json, package.json, pyproject.toml,
    requirements.txt validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-17-saneamento-deps-lint-typecheck-build
  caminhos:
  - docs/GOVERNANCA_PIRAMIDAL_SOTA.md
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em docs/GOVERNANCA_PIRAMIDAL_SOTA.md, pyproject.toml,
    requirements.txt, uv.lock validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-18-disjuntor-404-e-modelos-free-openrouter
  caminhos:
  - data/routing_map.json
  - data/system_config.json
  parecer: Revisado em 2026-11-21. Atualizacoes em data/routing_map.json, data/system_config.json validam
    deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-18-elevacao-deps-google-genai-regex-turbo
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em package-lock.json, package.json, pyproject.toml, requirements.txt,
    uv.lock validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-18-elevacao-deps-vitest-typescript-eslint-openai
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em frontend/package.json, package-lock.json, package.json,
    pyproject.toml, requirements.txt, uv.lock validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-18-escopo-causal-reteste-e-arbitragem-tier0
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-18-saneamento-sonarlint-pyright-e-deps
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em pyproject.toml, requirements.txt, uv.lock validam deps
    SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao
    Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 +
    147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-18-worker-hud-governanca-argon-hydrogen-e-handoff
  caminhos:
  - CLAUDE.md
  - data/agent_identities.json
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md, data/agent_identities.json validam deps
    SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual), regularizacao
    Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no ledger; 54 +
    147 + 70 testes Python e 119 suites Jest aprovados.
- registro: registro-2026-11-19-auditoria-evolucao-frontend-sota
  caminhos:
  - frontend/knip.json
  - frontend/package.json
  - frontend/src/app/(user)/dashboard/files/page.tsx
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-21. Atualizacoes em frontend/knip.json, frontend/package.json, frontend/src/app/(user)/dashboard/files/page.tsx,
    package-lock.json, pyproject.toml, requirements.txt, uv.lock validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: validacao-2026-09-12-a-grade-que-nao-cabia-e-o-aviso-que-virou-bloqueio
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
- registro: validacao-2026-09-12-a-identidade-de-autoria-deixa-de-ser-prosa
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-21. Atualizacoes em CLAUDE.md validam deps SOTA (effect@^3.22.5, openai/anthropic/laya/duckdb/knip/winloop/orjson/scipy/react-virtual),
    regularizacao Gemini 4 Neon / duo Orchestrator / descontinuacao 3.1 Pro, e calibracao duo 9.8/10 no
    ledger; 54 + 147 + 70 testes Python e 119 suites Jest aprovados.
---

# Registro -- Deps SOTA, Integracoes ROI, Gemini 4 Neon / Duo Orchestrator e Calibracao 9.8 (2026-11-21)

## Escopo

Registro canonico consolidado para o fechamento da sessao 834f88f1-b0ff-43ea-80e0-c2b686e5eb20 no modo bifasico Orchestrator (Gemini 4 Neon planejando/orquestrando + Gemini 4 Hydrogen executando). Cobre atualizacoes e remediacao P0 de dependencias, integracoes de alto ROI, linting Hydrogen, regularizacao Gemini 4 Neon, descontinuacao Gemini 3.1 Pro, suporte a calibragem duo orchestrator:<planejador>+<executor> e registro diario 2026-11-20.json + feedback 9.8/10 (seq=100).

## Reconciliacao de Ancoras

Todos os registros vigentes ancorados nos caminhos modificados receberam
evisoes_de_ancora neste documento, validados por scripts/ops/record_anchor_gate.ps1 e scripts/ops/record_gate.py.

## Handoff Vinculado

Ver [HANDOFF-2026-11-21-deps-sota-roi-neon-orchestrator-e-calibracao.md](./HANDOFF-2026-11-21-deps-sota-roi-neon-orchestrator-e-calibracao.md).
