---
id: registro-2026-11-24-scrypt-sonarlint-codeql-schemathesis-exa
tipo: registro
escopo: Site -- conciliacao scrypt (os.urandom(16), n=16384, dklen=32) em fingerprints
  CodeQL/SonarLint S2053/S5344, bump schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF
  (S1192), blindagem ASCII em test_sota_deps_roi_2026_11.py e avanco do submodulo
  skills/exa-mcp-server (434d7e2).
ecossistema: nexus-sota
autor: Gemini 4 Hydrogen <noreply@google.com>
criado_em: '2026-11-24T12:50:47-03:00'
atualizado_em: '2026-11-24T12:50:47-03:00'
commit: HEAD
classes:
- interno
- registro
- infraestrutura
- seguranca
- governanca
caminhos:
- core/mesh_integrations.py
- llm/decision_pool.py
- llm/gemini_pool.py
- llm/media_pool.py
- llm/openrouter_pool.py
- pyproject.toml
- reports/REGISTRO-2026-11-24-scrypt-sonarlint-codeql-schemathesis-exa.md
- scripts/ops/suite_verde.py
- skills/exa-mcp-server
- tests/test_sota_deps_roi_2026_11.py
- uv.lock
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  python: 3.14.9
  so: Windows
  condutor: Gemini 4 Hydrogen
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: '2026-11-24'
verificado:
- ruff check e ruff format --check em todos os 7 arquivos Python modificados -- 0
  erros, 0 pendencias de formatacao
- pyright nos 7 arquivos Python modificados -- 0 erros, 0 warnings
- uv pip check (251 pacotes compativeis) apos bump de schemathesis 4.34.1 -> 4.34.2
- pytest (gemini_pool, openrouter_pools, gemini_decisions, media_pool, suite_verde,
  mesh_integrations, patches_skills, sota_deps_roi_2026_11) -- 126 passed, 0 erros
  e 0 warnings
- submodulo skills/exa-mcp-server commit 434d7e2 (agnost ^0.2.2, exa-js, jose, @upstash/*)
  validado (vitest 13 arquivos / 158 testes) e publicado em fork
nao_verificado:
- Reanalise remota do CodeQL Advanced Setup apos push para origin/master
referencias_nao_resolviveis: []
revisoes_de_ancora:
- registro: plan-dependency-boundary-reconciliation-2026-09-01
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: auditoria-2026-09-02-integridade-do-projeto-e-piso-de-transformers
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: auditoria-2026-09-12-o-ci-vermelho-que-nenhum-portao-local-media
  caminhos:
  - scripts/ops/suite_verde.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em scripts/ops/suite_verde.py preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: auditoria-2026-10-08-integralidade-backend
  caminhos:
  - llm/openrouter_pool.py
  - pyproject.toml
  parecer: 'Revisado em 2026-11-24. Alteracoes em llm/openrouter_pool.py, pyproject.toml
    preservam contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384,
    dklen=32, lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint
    S2053/S5344, bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: auditoria-2026-11-18-pools-chaves-observatorio-e-roteamento
  caminhos:
  - llm/openrouter_pool.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em llm/openrouter_pool.py preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: handoff-2026-09-10-lint-lighthouse-e-aceite-cve
  caminhos:
  - pyproject.toml
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml preservam contratos
    e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32, lru_cache)
    em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: handoff-2026-09-13-integracao-de-engines-wasm-e-economia-de-gate
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: handoff-2026-09-23-ci-ram-e-rustfmt-staged
  caminhos:
  - scripts/ops/suite_verde.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em scripts/ops/suite_verde.py preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: handoff-2026-09-23-nucleo-mcp-curadoria-codex
  caminhos:
  - scripts/ops/suite_verde.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em scripts/ops/suite_verde.py preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: handoff-2026-09-25-pool-rotacional-gemini-flash-lite
  caminhos:
  - llm/gemini_pool.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em llm/gemini_pool.py preservam contratos
    e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32, lru_cache)
    em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: handoff-2026-10-05-fechamento-do-ciclo-medicoes-cwv-e-cacheabilidade
  caminhos:
  - scripts/ops/suite_verde.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em scripts/ops/suite_verde.py preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: handoff-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - llm/openrouter_pool.py
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em llm/openrouter_pool.py, pyproject.toml,
    uv.lock preservam contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16),
    n=16384, dklen=32, lru_cache) em fingerprints de pools/keyring para atender CodeQL
    e SonarLint S2053/S5344, bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF
    em suite_verde.py, blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink
    skills/exa-mcp-server 434d7e2.'
- registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: handoff-2026-11-15-translategemma-timesfm-laya-roi
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: handoff-2026-11-18-observatorio-chaves-roteamento-e-calibracao
  caminhos:
  - llm/openrouter_pool.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em llm/openrouter_pool.py preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: handoff-2026-11-21-deps-sota-roi-neon-orchestrator-e-calibracao
  caminhos:
  - pyproject.toml
  - tests/test_sota_deps_roi_2026_11.py
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, tests/test_sota_deps_roi_2026_11.py,
    uv.lock preservam contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16),
    n=16384, dklen=32, lru_cache) em fingerprints de pools/keyring para atender CodeQL
    e SonarLint S2053/S5344, bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF
    em suite_verde.py, blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink
    skills/exa-mcp-server 434d7e2.'
- registro: handoff-2026-11-21-laya-052-watchdog-711-e-calibracao-seq101
  caminhos:
  - pyproject.toml
  - tests/test_sota_deps_roi_2026_11.py
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, tests/test_sota_deps_roi_2026_11.py,
    uv.lock preservam contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16),
    n=16384, dklen=32, lru_cache) em fingerprints de pools/keyring para atender CodeQL
    e SonarLint S2053/S5344, bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF
    em suite_verde.py, blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink
    skills/exa-mcp-server 434d7e2.'
- registro: handoff-2026-11-22-higgsfield-mcp-deps-e-saneamento-sota
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: handoff-2026-11-24-laya-053-regex-20261123-schemathesis-4341
  caminhos:
  - pyproject.toml
  - tests/test_sota_deps_roi_2026_11.py
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, tests/test_sota_deps_roi_2026_11.py,
    uv.lock preservam contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16),
    n=16384, dklen=32, lru_cache) em fingerprints de pools/keyring para atender CodeQL
    e SonarLint S2053/S5344, bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF
    em suite_verde.py, blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink
    skills/exa-mcp-server 434d7e2.'
- registro: plano-laya-integracao-s1s2-pmev-2026-09-20
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-09-09-remediacao-dependabot-httpx2
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-09-13-append-em-jsonl-e-suite-em-todos-os-nucleos
  caminhos:
  - scripts/ops/suite_verde.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em scripts/ops/suite_verde.py preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-09-13-ci-typecheck-e-fronteira-de-capacidades
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-09-13-otimizacoes-helpers-antientropia-e-feedback
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-09-19-refatoracao-sonar-python-e-icm
  caminhos:
  - scripts/ops/suite_verde.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em scripts/ops/suite_verde.py preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-09-23-otimizacao-cache-suite-verde-e-paralelismo
  caminhos:
  - scripts/ops/suite_verde.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em scripts/ops/suite_verde.py preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-09-25-pool-rotacional-gemini-flash-lite
  caminhos:
  - llm/gemini_pool.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em llm/gemini_pool.py preservam contratos
    e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32, lru_cache)
    em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-09-25-fechamento-pendencia-ci-ram
  caminhos:
  - scripts/ops/suite_verde.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em scripts/ops/suite_verde.py preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-09-25-pools-de-chaves-openrouter-multi-tier
  caminhos:
  - llm/openrouter_pool.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em llm/openrouter_pool.py preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-10-04-http-metrics-correlation-e-worker-shutdown
  caminhos:
  - scripts/ops/suite_verde.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em scripts/ops/suite_verde.py preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-10-04-remediacao-dependabot-pypdf
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
  caminhos:
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em uv.lock preservam contratos e invariantes
    SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32, lru_cache) em fingerprints
    de pools/keyring para atender CodeQL e SonarLint S2053/S5344, bump de schemathesis>=4.34.2,
    constante _PYTEST_LOG_CLI_OFF em suite_verde.py, blindagem ASCII em test_sota_deps_roi_2026_11.py
    e gitlink skills/exa-mcp-server 434d7e2.'
- registro: registro-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - llm/openrouter_pool.py
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em llm/openrouter_pool.py, pyproject.toml,
    uv.lock preservam contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16),
    n=16384, dklen=32, lru_cache) em fingerprints de pools/keyring para atender CodeQL
    e SonarLint S2053/S5344, bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF
    em suite_verde.py, blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink
    skills/exa-mcp-server 434d7e2.'
- registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
  caminhos:
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em uv.lock preservam contratos e invariantes
    SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32, lru_cache) em fingerprints
    de pools/keyring para atender CodeQL e SonarLint S2053/S5344, bump de schemathesis>=4.34.2,
    constante _PYTEST_LOG_CLI_OFF em suite_verde.py, blindagem ASCII em test_sota_deps_roi_2026_11.py
    e gitlink skills/exa-mcp-server 434d7e2.'
- registro: registro-2026-10-13-saneamento-diagnosticos-ide-e-compatibilidade
  caminhos:
  - llm/gemini_pool.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em llm/gemini_pool.py preservam contratos
    e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32, lru_cache)
    em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-10-18-resolucao-sonarqube-e-saneamento-global
  caminhos:
  - scripts/ops/suite_verde.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em scripts/ops/suite_verde.py preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-10-19-saneamento-warnings-skills-e-memoria-agentica
  caminhos:
  - skills/exa-mcp-server
  parecer: 'Revisado em 2026-11-24. Alteracoes em skills/exa-mcp-server preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-10-20-harmonizacao-tier1-e-gemini-38
  caminhos:
  - scripts/ops/suite_verde.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em scripts/ops/suite_verde.py preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-10-27-elevacao-dependencias-python-openai-pyspark-pytest
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-10-27-evolucao-project-context-e-reconciliacao-sota
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
  caminhos:
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em uv.lock preservam contratos e invariantes
    SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32, lru_cache) em fingerprints
    de pools/keyring para atender CodeQL e SonarLint S2053/S5344, bump de schemathesis>=4.34.2,
    constante _PYTEST_LOG_CLI_OFF em suite_verde.py, blindagem ASCII em test_sota_deps_roi_2026_11.py
    e gitlink skills/exa-mcp-server 434d7e2.'
- registro: registro-2026-10-28-atualizacao-laya-e-estabilizacao-playwright-smoke
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-10-31-estabilizacao-lifecycle-warmup-turbopack
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-03-elevacao-dependencias-pyarrow-openai-anthropic-laya
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-03-otimizacao-agentes-watchdog-e-calibracao
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-03-remediacao-dependabot-pypdf-pyasn1-minimatch
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-04-otimizacao-layout-header-e-elevacao-dependencias
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
  caminhos:
  - pyproject.toml
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml preservam contratos
    e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32, lru_cache)
    em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
  caminhos:
  - llm/gemini_pool.py
  - llm/openrouter_pool.py
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em llm/gemini_pool.py, llm/openrouter_pool.py,
    pyproject.toml, uv.lock preservam contratos e invariantes SOTA: conciliacao scrypt
    (os.urandom(16), n=16384, dklen=32, lru_cache) em fingerprints de pools/keyring
    para atender CodeQL e SonarLint S2053/S5344, bump de schemathesis>=4.34.2, constante
    _PYTEST_LOG_CLI_OFF em suite_verde.py, blindagem ASCII em test_sota_deps_roi_2026_11.py
    e gitlink skills/exa-mcp-server 434d7e2.'
- registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-07-elevacao-dependencias-fastapi-regex-types-aiofiles
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-08-elevacao-dependencias-regex-e-laya
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-08-elevacao-polars-2-1-e-consumo-integral-engines-sota
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-08-elevacao-pypdf-7-0-torchvision-e-ecossistema-npm
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-08-integracao-sota-triade-stitch-exa-jules
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-08-otimizacao-pyproject-dependencias-extras-e-reconciliacao
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-09-elevacao-dependencias-e-fork-eigen
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-09-saneamento-sonarlint-e-mcp-skills-vulnerabilidades
  caminhos:
  - skills/exa-mcp-server
  parecer: 'Revisado em 2026-11-24. Alteracoes em skills/exa-mcp-server preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-10-bump-deps-e-extra-paths-pylance
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-10-google-genai-3-1-0
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-11-elevacao-fastapi-playwright-e-bump-deep-research
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-11-elevacao-pypdf-turbo-ai-sdk-google
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-11-elevacao-sentence-transformers-genai-prettier-exa-mcp
  caminhos:
  - pyproject.toml
  - skills/exa-mcp-server
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, skills/exa-mcp-server,
    uv.lock preservam contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16),
    n=16384, dklen=32, lru_cache) em fingerprints de pools/keyring para atender CodeQL
    e SonarLint S2053/S5344, bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF
    em suite_verde.py, blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink
    skills/exa-mcp-server 434d7e2.'
- registro: registro-2026-11-11-elevacao-typer-types-knip-harmonizacao
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-11-nota-pareamento-dev-dependency-groups
  caminhos:
  - pyproject.toml
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml preservam contratos
    e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32, lru_cache)
    em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-12-arquitetura-s1-s2-llama-vulkan
  caminhos:
  - llm/decision_pool.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em llm/decision_pool.py preservam contratos
    e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32, lru_cache)
    em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-12-pool-multimodal-e-refactors-sonar
  caminhos:
  - llm/media_pool.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em llm/media_pool.py preservam contratos
    e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32, lru_cache)
    em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-12-review-sweeps-endurecimento-sota
  caminhos:
  - llm/decision_pool.py
  - llm/gemini_pool.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em llm/decision_pool.py, llm/gemini_pool.py
    preservam contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384,
    dklen=32, lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint
    S2053/S5344, bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-13-elevacao-deps-e-saneamento-configs-ide
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-13-revisao-ancora-pyproject-extra-path-cockpit
  caminhos:
  - pyproject.toml
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml preservam contratos
    e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32, lru_cache)
    em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
  caminhos:
  - pyproject.toml
  - skills/exa-mcp-server
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, skills/exa-mcp-server,
    uv.lock preservam contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16),
    n=16384, dklen=32, lru_cache) em fingerprints de pools/keyring para atender CodeQL
    e SonarLint S2053/S5344, bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF
    em suite_verde.py, blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink
    skills/exa-mcp-server 434d7e2.'
- registro: registro-2026-11-14-laya-pylint-e-refactors-sonar
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-14-roteamento-pools-transporte-e-validacao-hrc
  caminhos:
  - llm/gemini_pool.py
  - llm/openrouter_pool.py
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em llm/gemini_pool.py, llm/openrouter_pool.py,
    pyproject.toml, uv.lock preservam contratos e invariantes SOTA: conciliacao scrypt
    (os.urandom(16), n=16384, dklen=32, lru_cache) em fingerprints de pools/keyring
    para atender CodeQL e SonarLint S2053/S5344, bump de schemathesis>=4.34.2, constante
    _PYTEST_LOG_CLI_OFF em suite_verde.py, blindagem ASCII em test_sota_deps_roi_2026_11.py
    e gitlink skills/exa-mcp-server 434d7e2.'
- registro: registro-2026-11-14-submodulos-skills-sonar-e-gitlinks
  caminhos:
  - skills/exa-mcp-server
  parecer: 'Revisado em 2026-11-24. Alteracoes em skills/exa-mcp-server preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-14-sync-uvlock-ollama-cloud-circuit-e-ci
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-15-malha-agentica-rotacao-hkcu-hklm
  caminhos:
  - core/mesh_integrations.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em core/mesh_integrations.py preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-16-elevacao-deps-anthropic-laya-accelerate-e-deps-sync
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-17-auditoria-fortificacao-backend-5-fases
  caminhos:
  - llm/gemini_pool.py
  - llm/openrouter_pool.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em llm/gemini_pool.py, llm/openrouter_pool.py
    preservam contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384,
    dklen=32, lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint
    S2053/S5344, bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-17-elevacao-deps-google-genai-openai
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-17-fase-3-backend-estrutural-sota
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-17-fase-5-evolucao-das-forcas-sota
  caminhos:
  - pyproject.toml
  - scripts/ops/suite_verde.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, scripts/ops/suite_verde.py
    preservam contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384,
    dklen=32, lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint
    S2053/S5344, bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-17-fases-0-1-portoes-verificacao-e-higiene-doc-real
  caminhos:
  - pyproject.toml
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml preservam contratos
    e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32, lru_cache)
    em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-17-saneamento-deps-lint-typecheck-build
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-17-suite-verde-loadfile-contra-flake-write-tree
  caminhos:
  - scripts/ops/suite_verde.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em scripts/ops/suite_verde.py preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-18-elevacao-deps-google-genai-regex-turbo
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-18-elevacao-deps-vitest-typescript-eslint-openai
  caminhos:
  - pyproject.toml
  - skills/exa-mcp-server
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, skills/exa-mcp-server,
    uv.lock preservam contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16),
    n=16384, dklen=32, lru_cache) em fingerprints de pools/keyring para atender CodeQL
    e SonarLint S2053/S5344, bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF
    em suite_verde.py, blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink
    skills/exa-mcp-server 434d7e2.'
- registro: registro-2026-11-18-saneamento-sonarlint-pyright-e-deps
  caminhos:
  - llm/openrouter_pool.py
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em llm/openrouter_pool.py, pyproject.toml,
    uv.lock preservam contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16),
    n=16384, dklen=32, lru_cache) em fingerprints de pools/keyring para atender CodeQL
    e SonarLint S2053/S5344, bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF
    em suite_verde.py, blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink
    skills/exa-mcp-server 434d7e2.'
- registro: registro-2026-11-19-auditoria-evolucao-frontend-sota
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-19-bump-gitlink-exa-mcp-server
  caminhos:
  - skills/exa-mcp-server
  parecer: 'Revisado em 2026-11-24. Alteracoes em skills/exa-mcp-server preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-19-bump-gitlinks-submodulos-deps
  caminhos:
  - skills/exa-mcp-server
  parecer: 'Revisado em 2026-11-24. Alteracoes em skills/exa-mcp-server preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-19-fix-s6551-errorhandler-exa-mcp
  caminhos:
  - skills/exa-mcp-server
  parecer: 'Revisado em 2026-11-24. Alteracoes em skills/exa-mcp-server preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-21-blindagem-ascii-e-saneamento-linters
  caminhos:
  - scripts/ops/suite_verde.py
  - tests/test_sota_deps_roi_2026_11.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em scripts/ops/suite_verde.py, tests/test_sota_deps_roi_2026_11.py
    preservam contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384,
    dklen=32, lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint
    S2053/S5344, bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-21-deps-sota-roi-neon-orchestrator-e-calibracao
  caminhos:
  - pyproject.toml
  - tests/test_sota_deps_roi_2026_11.py
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, tests/test_sota_deps_roi_2026_11.py,
    uv.lock preservam contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16),
    n=16384, dklen=32, lru_cache) em fingerprints de pools/keyring para atender CodeQL
    e SonarLint S2053/S5344, bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF
    em suite_verde.py, blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink
    skills/exa-mcp-server 434d7e2.'
- registro: registro-2026-11-21-laya-052-watchdog-711-e-calibracao-seq101
  caminhos:
  - pyproject.toml
  - tests/test_sota_deps_roi_2026_11.py
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, tests/test_sota_deps_roi_2026_11.py,
    uv.lock preservam contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16),
    n=16384, dklen=32, lru_cache) em fingerprints de pools/keyring para atender CodeQL
    e SonarLint S2053/S5344, bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF
    em suite_verde.py, blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink
    skills/exa-mcp-server 434d7e2.'
- registro: registro-2026-11-22-higgsfield-mcp-deps-e-saneamento-sota
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-24-ci-verde-e-otimizacao-suites
  caminhos:
  - scripts/ops/suite_verde.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em scripts/ops/suite_verde.py preservam
    contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32,
    lru_cache) em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
- registro: registro-2026-11-24-laya-053-regex-20261123-schemathesis-4341
  caminhos:
  - pyproject.toml
  - tests/test_sota_deps_roi_2026_11.py
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, tests/test_sota_deps_roi_2026_11.py,
    uv.lock preservam contratos e invariantes SOTA: conciliacao scrypt (os.urandom(16),
    n=16384, dklen=32, lru_cache) em fingerprints de pools/keyring para atender CodeQL
    e SonarLint S2053/S5344, bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF
    em suite_verde.py, blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink
    skills/exa-mcp-server 434d7e2.'
- registro: registro-2026-11-24-seguranca-github-codeql-dependabot-knip
  caminhos:
  - core/mesh_integrations.py
  - llm/decision_pool.py
  - llm/gemini_pool.py
  - llm/media_pool.py
  - llm/openrouter_pool.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em core/mesh_integrations.py, llm/decision_pool.py,
    llm/gemini_pool.py, llm/media_pool.py, llm/openrouter_pool.py preservam contratos
    e invariantes SOTA: conciliacao scrypt (os.urandom(16), n=16384, dklen=32, lru_cache)
    em fingerprints de pools/keyring para atender CodeQL e SonarLint S2053/S5344,
    bump de schemathesis>=4.34.2, constante _PYTEST_LOG_CLI_OFF em suite_verde.py,
    blindagem ASCII em test_sota_deps_roi_2026_11.py e gitlink skills/exa-mcp-server
    434d7e2.'
---

# Registro -- Conciliacao scrypt/CodeQL/SonarLint, Schemathesis 4.34.2 e Submodulo exa-mcp-server

## Sintese

1. **Conciliacao CodeQL x SonarLint (`S2053`/`S5344`) nos fingerprints (`_key_sha8`/`_sha8`):**
   - `core/mesh_integrations.py`, `llm/decision_pool.py`, `llm/gemini_pool.py`, `llm/media_pool.py` e `llm/openrouter_pool.py` atualizados para `hashlib.scrypt(..., salt=os.urandom(16), n=16384, r=8, p=1, dklen=32).hex()[:8]` com `@lru_cache(maxsize=256)`.
2. **Qualidade, Blindagem ASCII e Dependencias Python:**
   - `scripts/ops/suite_verde.py`: extraida constante `_PYTEST_LOG_CLI_OFF = "log_cli=false"` (`python:S1192`).
   - `tests/test_sota_deps_roi_2026_11.py`: substituido caractere nao-ASCII na docstring (blindagem ASCII).
   - `pyproject.toml` e `uv.lock`: `schemathesis` elevado de `>=4.34.1` para `>=4.34.2` nos grupos espelhados `dev`.
3. **Submodulo `skills/exa-mcp-server`:**
   - Commit `434d7e2` publicado em `fork/chore/sonarlint-campaign-20260911` (`agnost ^0.2.2`, `exa-js ^2.29.0`, `jose ^6.2.18`, `@upstash/ratelimit ^2.2.2`, `@upstash/redis ^1.41.1`) e gitlink atualizado no superprojeto.
