---
id: registro-2026-11-24-laya-053-regex-20261123-schemathesis-4341
tipo: registro
escopo: Site -- elevacao laya>=0.5.3, regex>=2026.11.23 e schemathesis>=4.34.1 (jsonschema-rs==0.63.1),
  otimizacao idioma_detectado em llm/laya_bridge.py, configuracao schemathesis.toml, reconciliacao GTX
  1060 6GB (data/TETOS_DE_MEMORIA.json, data/ollama_models.json, tests/test_routing_policy.py), auditoria
  de drivers/SO, saneamento Pyrefly/Pyright, regularizacao daily/2026-11-24 e reciclagem Laya S1 :8192
ecossistema: nexus-sota
autor: Gemini 4 Hydrogen <noreply@google.com>
criado_em: '2026-11-24T05:54:30-03:00'
atualizado_em: '2026-11-24T05:54:30-03:00'
commit: HEAD
classes:
- interno
- registro
- dependencias
- seguranca
- governanca
- calibracao
- handoff
caminhos:
- data/TETOS_DE_MEMORIA.json
- data/ollama_models.json
- llm/laya_bridge.py
- pyproject.toml
- reports/HANDOFF-2026-11-24-laya-053-regex-20261123-schemathesis-4341.md
- reports/REGISTRO-2026-11-24-laya-053-regex-20261123-schemathesis-4341.md
- reports/agent-calibration/daily/2026-11-22.json
- reports/agent-calibration/daily/2026-11-23.json
- reports/agent-calibration/daily/2026-11-24.json
- reports/agent-calibration/daily/2026-11-24.md
- requirements.txt
- schemathesis.toml
- tests/test_routing_policy.py
- tests/test_sota_deps_roi_2026_11.py
- uv.lock
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  python: 3.14.9
  so: Windows
  condutor: Gemini 4 Hydrogen
  planejador_orchestrator: Gemini 4 Neon
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: '2026-11-24'
verificado:
- uv lock --check (279 pacotes) e uv pip check (251 pacotes compativeis) -- laya==0.5.3, regex==2026.11.23,
  schemathesis==4.34.1 e jsonschema-rs==0.63.1 sincronizados em pyproject.toml, requirements.txt, uv.lock
  e .venv
- Seguranca -- api.osv.dev querybatch (0 CVEs em laya 0.5.3, regex 2026.11.23, schemathesis 4.34.1, jsonschema-rs
  0.63.1) e npm run python:audit (0 novas vulnerabilidades; 5 ignoradas -- 4 server-mode chromadb 1.5.9
  + nexus-orchestrator local)
- Qualidade estatica -- ruff check . (All checks passed!), ruff format --check . (723 files already formatted),
  pyright --project pyproject.toml (0 errors, 0 warnings, 0 informations), pylint llm/laya_bridge.py (9.94/10)
- Saneamento de IDE -- removida conversao redundante str(raw_lang) em llm/laya_bridge.py (Pyrefly unnecessary-type-conversion)
  e aplicado narrowing isinstance(res, Ok) em tests/test_sota_deps_roi_2026_11.py (Pyright reportAttributeAccessIssue)
- Reconciliacao GTX 1060 6GB -- data/TETOS_DE_MEMORIA.json (driver 582.78, CUDA 13.0, free 5.1 GiB), data/ollama_models.json
  (tamanhos medidos via ollama list -- gemma4:e2b 4.6 GB, gemma4:e4b 6.6 GB, gemma4:12b 8.0 GB, qwen3.8:27b
  17.0 GB, translategemma:4b 3.3 GB) e tests/test_routing_policy.py -- 136 passed in 6.30s em test_routing_policy,
  test_model_catalog, test_guard_memoria, test_vram_vulkan, test_translategemma e test_system2_local
- Hardware e drivers medidos -- nvidia-smi (GTX 1060 6GB, driver 582.78 WHQL R580, PCIe Gen 3 x16 16/16,
  49C, 15.39W/140W, compute_cap 6.1, 3440x1440@100Hz), Intel UHD 630 (26.20.100.7642 de 2020-01-21 ->
  upgrade recomendado 31.0.101.2137), HAGS HwSchMode=2, TdrDelay=10, Plano Desempenho Maximo, Ollama 0.40.17
  com CUDA0 + flash_attention=1
- Pytest direcionado Laya/S1/Contratos (8 suites) -- 107 passed in 33.92s (0 erros, 0 warnings); nexus._get_vram_usage()
  leu 6.0 GiB do server.log
- Microservico Laya S1 (:8192) reciclado via Start-LayaService.ps1 -- status HEALTHY, modelo convaiinnovations/laya-multilingual,
  weights_ready true
- Saude da malha e calibracao -- Test-AgentCalibrationLedger.ps1 (102 registros validos, tail 42833cf5),
  Write-AgentCalibrationDailyEvidence.ps1 -Date 2026-11-24 (0/3 sessoes, calibration_pending false), consolidacao
  daily/2026-11-24.md e saude_da_malha.py (0 sinais, 0 alertas graves)
- npm run sota:audit (cwv_gate.ps1 5 fases) -- SUCESSO (VERDE), LCP 314.5ms, CLS 0.00023, TBT 32.5ms,
  TTFB 93.1ms, MAX_HEAP 23.2MB, axe 0, CVE 0, SRI VERIFIED, Higiene 0 erros
nao_verificado:
- CLI Pyrefly nao instalado localmente para execucao em batch; validacao do ajuste em llm/laya_bridge.py
  realizada por inspecao estatica e pyright
- suite_verde.py integral -- executada sobre o tree-sha final em stage pelos portoes pre-commit e pre-push
- CI remoto GitHub Actions pos-push
referencias_nao_resolviveis: []
revisoes_de_ancora:
- registro: auditoria-2026-09-02-integridade-do-projeto-e-piso-de-transformers
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock validam elevacao de laya>=0.5.3
    (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: auditoria-2026-09-03-trabalho-do-gemini-3-8-flash
  caminhos:
  - data/ollama_models.json
  - tests/test_routing_policy.py
  parecer: Revisado em 2026-11-24. Alteracoes em data/ollama_models.json, tests/test_routing_policy.py
    validam elevacao de laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1
    (jsonschema-rs==0.63.1 e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json,
    data/ollama_models.json e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao
    saude_da_malha.py (daily 2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate
    5 fases).
- registro: auditoria-2026-09-08-o-que-esta-em-aberto-na-malha
  caminhos:
  - requirements.txt
  parecer: Revisado em 2026-11-24. Alteracoes em requirements.txt validam elevacao de laya>=0.5.3 (idioma_detectado
    em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1 e schemathesis.toml),
    reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json e tests/test_routing_policy.py,
    saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily 2026-11-24) e suites verdes (136+107
    pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: auditoria-2026-09-24-laya-multilingual-s1
  caminhos:
  - llm/laya_bridge.py
  parecer: Revisado em 2026-11-24. Alteracoes em llm/laya_bridge.py validam elevacao de laya>=0.5.3 (idioma_detectado
    em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1 e schemathesis.toml),
    reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json e tests/test_routing_policy.py,
    saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily 2026-11-24) e suites verdes (136+107
    pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: auditoria-2026-10-08-integralidade-backend
  caminhos:
  - pyproject.toml
  - requirements.txt
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, requirements.txt validam elevacao de
    laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: handoff-2026-09-10-lint-lighthouse-e-aceite-cve
  caminhos:
  - pyproject.toml
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml validam elevacao de laya>=0.5.3 (idioma_detectado
    em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1 e schemathesis.toml),
    reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json e tests/test_routing_policy.py,
    saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily 2026-11-24) e suites verdes (136+107
    pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: handoff-2026-09-13-integracao-de-engines-wasm-e-economia-de-gate
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock validam elevacao de laya>=0.5.3
    (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: handoff-2026-09-22-integracao-system1-llm-dashboard
  caminhos:
  - llm/laya_bridge.py
  parecer: Revisado em 2026-11-24. Alteracoes em llm/laya_bridge.py validam elevacao de laya>=0.5.3 (idioma_detectado
    em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1 e schemathesis.toml),
    reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json e tests/test_routing_policy.py,
    saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily 2026-11-24) e suites verdes (136+107
    pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: handoff-2026-09-24-laya-gpu-homologacao-e-solver-bridge
  caminhos:
  - llm/laya_bridge.py
  parecer: Revisado em 2026-11-24. Alteracoes em llm/laya_bridge.py validam elevacao de laya>=0.5.3 (idioma_detectado
    em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1 e schemathesis.toml),
    reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json e tests/test_routing_policy.py,
    saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily 2026-11-24) e suites verdes (136+107
    pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: handoff-2026-09-24-laya-multilingual-s1-integracao
  caminhos:
  - llm/laya_bridge.py
  parecer: Revisado em 2026-11-24. Alteracoes em llm/laya_bridge.py validam elevacao de laya>=0.5.3 (idioma_detectado
    em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1 e schemathesis.toml),
    reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json e tests/test_routing_policy.py,
    saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily 2026-11-24) e suites verdes (136+107
    pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: handoff-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, requirements.txt, uv.lock validam elevacao
    de laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, requirements.txt, uv.lock validam elevacao
    de laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: handoff-2026-11-14-decision1-laya-s1-s2-e-ancoras
  caminhos:
  - llm/laya_bridge.py
  parecer: Revisado em 2026-11-24. Alteracoes em llm/laya_bridge.py validam elevacao de laya>=0.5.3 (idioma_detectado
    em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1 e schemathesis.toml),
    reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json e tests/test_routing_policy.py,
    saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily 2026-11-24) e suites verdes (136+107
    pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: handoff-2026-11-15-translategemma-timesfm-laya-roi
  caminhos:
  - data/ollama_models.json
  - llm/laya_bridge.py
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em data/ollama_models.json, llm/laya_bridge.py, pyproject.toml,
    uv.lock validam elevacao de laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23,
    schemathesis>=4.34.1 (jsonschema-rs==0.63.1 e schemathesis.toml), reconciliacao de hardware GTX 1060
    6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json e tests/test_routing_policy.py, saneamento
    Pyrefly/Pyright, regularizacao saude_da_malha.py (daily 2026-11-24) e suites verdes (136+107 pytest,
    ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: handoff-2026-11-21-deps-sota-roi-neon-orchestrator-e-calibracao
  caminhos:
  - pyproject.toml
  - requirements.txt
  - tests/test_sota_deps_roi_2026_11.py
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, requirements.txt, tests/test_sota_deps_roi_2026_11.py,
    uv.lock validam elevacao de laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23,
    schemathesis>=4.34.1 (jsonschema-rs==0.63.1 e schemathesis.toml), reconciliacao de hardware GTX 1060
    6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json e tests/test_routing_policy.py, saneamento
    Pyrefly/Pyright, regularizacao saude_da_malha.py (daily 2026-11-24) e suites verdes (136+107 pytest,
    ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: handoff-2026-11-21-laya-052-watchdog-711-e-calibracao-seq101
  caminhos:
  - llm/laya_bridge.py
  - pyproject.toml
  - requirements.txt
  - tests/test_sota_deps_roi_2026_11.py
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em llm/laya_bridge.py, pyproject.toml, requirements.txt,
    tests/test_sota_deps_roi_2026_11.py, uv.lock validam elevacao de laya>=0.5.3 (idioma_detectado em
    llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1 e schemathesis.toml),
    reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json e tests/test_routing_policy.py,
    saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily 2026-11-24) e suites verdes (136+107
    pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: handoff-2026-11-22-higgsfield-mcp-deps-e-saneamento-sota
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock validam elevacao de laya>=0.5.3
    (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: plan-dependency-boundary-reconciliation-2026-09-01
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, requirements.txt, uv.lock validam elevacao
    de laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: plano-frentes-abertas-2026-09-08
  caminhos:
  - requirements.txt
  parecer: Revisado em 2026-11-24. Alteracoes em requirements.txt validam elevacao de laya>=0.5.3 (idioma_detectado
    em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1 e schemathesis.toml),
    reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json e tests/test_routing_policy.py,
    saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily 2026-11-24) e suites verdes (136+107
    pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: plano-laya-integracao-s1s2-pmev-2026-09-20
  caminhos:
  - llm/laya_bridge.py
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em llm/laya_bridge.py, pyproject.toml, uv.lock validam elevacao
    de laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-09-05-saneamento-nexus-ollama-e-auto-diagnostico
  caminhos:
  - data/ollama_models.json
  parecer: Revisado em 2026-11-24. Alteracoes em data/ollama_models.json validam elevacao de laya>=0.5.3
    (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-09-07-integracao-gpt6-astra-e-retirada-do-fable
  caminhos:
  - tests/test_routing_policy.py
  parecer: Revisado em 2026-11-24. Alteracoes em tests/test_routing_policy.py validam elevacao de laya>=0.5.3
    (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-09-07-promocao-do-duo-gemini-na-faixa-gratuita
  caminhos:
  - tests/test_routing_policy.py
  parecer: Revisado em 2026-11-24. Alteracoes em tests/test_routing_policy.py validam elevacao de laya>=0.5.3
    (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-09-09-remediacao-dependabot-httpx2
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock validam elevacao de laya>=0.5.3
    (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-09-13-ci-typecheck-e-fronteira-de-capacidades
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock validam elevacao de laya>=0.5.3
    (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-09-13-otimizacoes-helpers-antientropia-e-feedback
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, requirements.txt, uv.lock validam elevacao
    de laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-09-14-auditoria-e-refinamento-settings-e-configuracoes
  caminhos:
  - requirements.txt
  parecer: Revisado em 2026-11-24. Alteracoes em requirements.txt validam elevacao de laya>=0.5.3 (idioma_detectado
    em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1 e schemathesis.toml),
    reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json e tests/test_routing_policy.py,
    saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily 2026-11-24) e suites verdes (136+107
    pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-09-23-evolucao-pendencias-laya-e-tarefas
  caminhos:
  - llm/laya_bridge.py
  parecer: Revisado em 2026-11-24. Alteracoes em llm/laya_bridge.py validam elevacao de laya>=0.5.3 (idioma_detectado
    em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1 e schemathesis.toml),
    reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json e tests/test_routing_policy.py,
    saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily 2026-11-24) e suites verdes (136+107
    pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-09-24-blindagem-ascii-e-harmonizacao-scripts
  caminhos:
  - llm/laya_bridge.py
  parecer: Revisado em 2026-11-24. Alteracoes em llm/laya_bridge.py validam elevacao de laya>=0.5.3 (idioma_detectado
    em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1 e schemathesis.toml),
    reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json e tests/test_routing_policy.py,
    saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily 2026-11-24) e suites verdes (136+107
    pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-09-24-laya-gpu-homologacao-e-solver-bridge
  caminhos:
  - llm/laya_bridge.py
  parecer: Revisado em 2026-11-24. Alteracoes em llm/laya_bridge.py validam elevacao de laya>=0.5.3 (idioma_detectado
    em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1 e schemathesis.toml),
    reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json e tests/test_routing_policy.py,
    saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily 2026-11-24) e suites verdes (136+107
    pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-09-24-laya-multilingual-s1-integracao
  caminhos:
  - llm/laya_bridge.py
  parecer: Revisado em 2026-11-24. Alteracoes em llm/laya_bridge.py validam elevacao de laya>=0.5.3 (idioma_detectado
    em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1 e schemathesis.toml),
    reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json e tests/test_routing_policy.py,
    saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily 2026-11-24) e suites verdes (136+107
    pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-10-04-remediacao-dependabot-pypdf
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock validam elevacao de laya>=0.5.3
    (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
  caminhos:
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em uv.lock validam elevacao de laya>=0.5.3 (idioma_detectado
    em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1 e schemathesis.toml),
    reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json e tests/test_routing_policy.py,
    saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily 2026-11-24) e suites verdes (136+107
    pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, requirements.txt, uv.lock validam elevacao
    de laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
  caminhos:
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em uv.lock validam elevacao de laya>=0.5.3 (idioma_detectado
    em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1 e schemathesis.toml),
    reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json e tests/test_routing_policy.py,
    saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily 2026-11-24) e suites verdes (136+107
    pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-10-13-saneamento-diagnosticos-ide-e-compatibilidade
  caminhos:
  - llm/laya_bridge.py
  parecer: Revisado em 2026-11-24. Alteracoes em llm/laya_bridge.py validam elevacao de laya>=0.5.3 (idioma_detectado
    em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1 e schemathesis.toml),
    reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json e tests/test_routing_policy.py,
    saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily 2026-11-24) e suites verdes (136+107
    pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock validam elevacao de laya>=0.5.3
    (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, requirements.txt, uv.lock validam elevacao
    de laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-10-20-harmonizacao-tier1-e-gemini-38
  caminhos:
  - tests/test_routing_policy.py
  parecer: Revisado em 2026-11-24. Alteracoes em tests/test_routing_policy.py validam elevacao de laya>=0.5.3
    (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, requirements.txt, uv.lock validam elevacao
    de laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, requirements.txt, uv.lock validam elevacao
    de laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-10-27-elevacao-dependencias-python-openai-pyspark-pytest
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock validam elevacao de laya>=0.5.3
    (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-10-27-evolucao-project-context-e-reconciliacao-sota
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock validam elevacao de laya>=0.5.3
    (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
  caminhos:
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em uv.lock validam elevacao de laya>=0.5.3 (idioma_detectado
    em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1 e schemathesis.toml),
    reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json e tests/test_routing_policy.py,
    saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily 2026-11-24) e suites verdes (136+107
    pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-10-28-atualizacao-laya-e-estabilizacao-playwright-smoke
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock validam elevacao de laya>=0.5.3
    (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, requirements.txt, uv.lock validam elevacao
    de laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-10-31-estabilizacao-lifecycle-warmup-turbopack
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, requirements.txt, uv.lock validam elevacao
    de laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock validam elevacao de laya>=0.5.3
    (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-03-elevacao-dependencias-pyarrow-openai-anthropic-laya
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock validam elevacao de laya>=0.5.3
    (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-03-otimizacao-agentes-watchdog-e-calibracao
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock validam elevacao de laya>=0.5.3
    (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-03-remediacao-dependabot-pypdf-pyasn1-minimatch
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock validam elevacao de laya>=0.5.3
    (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-04-otimizacao-layout-header-e-elevacao-dependencias
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock validam elevacao de laya>=0.5.3
    (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
  caminhos:
  - pyproject.toml
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml validam elevacao de laya>=0.5.3 (idioma_detectado
    em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1 e schemathesis.toml),
    reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json e tests/test_routing_policy.py,
    saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily 2026-11-24) e suites verdes (136+107
    pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, requirements.txt, uv.lock validam elevacao
    de laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock validam elevacao de laya>=0.5.3
    (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock validam elevacao de laya>=0.5.3
    (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-07-elevacao-dependencias-fastapi-regex-types-aiofiles
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock validam elevacao de laya>=0.5.3
    (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-08-elevacao-dependencias-regex-e-laya
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, requirements.txt, uv.lock validam elevacao
    de laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-08-elevacao-polars-2-1-e-consumo-integral-engines-sota
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, requirements.txt, uv.lock validam elevacao
    de laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-08-elevacao-pypdf-7-0-torchvision-e-ecossistema-npm
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, requirements.txt, uv.lock validam elevacao
    de laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-08-harmonizacao-logs-testes-e-materializacao-submodulos
  caminhos:
  - tests/test_routing_policy.py
  parecer: Revisado em 2026-11-24. Alteracoes em tests/test_routing_policy.py validam elevacao de laya>=0.5.3
    (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-08-integracao-sota-triade-stitch-exa-jules
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, requirements.txt, uv.lock validam elevacao
    de laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-08-otimizacao-pyproject-dependencias-extras-e-reconciliacao
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock validam elevacao de laya>=0.5.3
    (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-09-elevacao-dependencias-e-fork-eigen
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, requirements.txt, uv.lock validam elevacao
    de laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-10-bump-deps-e-extra-paths-pylance
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock validam elevacao de laya>=0.5.3
    (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-10-google-genai-3-1-0
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock validam elevacao de laya>=0.5.3
    (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-11-elevacao-fastapi-playwright-e-bump-deep-research
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock validam elevacao de laya>=0.5.3
    (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-11-elevacao-pypdf-turbo-ai-sdk-google
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, requirements.txt, uv.lock validam elevacao
    de laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-11-elevacao-sentence-transformers-genai-prettier-exa-mcp
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, requirements.txt, uv.lock validam elevacao
    de laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-11-elevacao-typer-types-knip-harmonizacao
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, requirements.txt, uv.lock validam elevacao
    de laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-11-nota-pareamento-dev-dependency-groups
  caminhos:
  - pyproject.toml
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml validam elevacao de laya>=0.5.3 (idioma_detectado
    em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1 e schemathesis.toml),
    reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json e tests/test_routing_policy.py,
    saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily 2026-11-24) e suites verdes (136+107
    pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-13-elevacao-deps-e-saneamento-configs-ide
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock validam elevacao de laya>=0.5.3
    (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-13-revisao-ancora-pyproject-extra-path-cockpit
  caminhos:
  - pyproject.toml
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml validam elevacao de laya>=0.5.3 (idioma_detectado
    em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1 e schemathesis.toml),
    reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json e tests/test_routing_policy.py,
    saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily 2026-11-24) e suites verdes (136+107
    pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
  caminhos:
  - llm/laya_bridge.py
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em llm/laya_bridge.py, pyproject.toml, uv.lock validam elevacao
    de laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-14-laya-pylint-e-refactors-sonar
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock validam elevacao de laya>=0.5.3
    (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-14-refino-laya-tracker-e-furb110
  caminhos:
  - llm/laya_bridge.py
  parecer: Revisado em 2026-11-24. Alteracoes em llm/laya_bridge.py validam elevacao de laya>=0.5.3 (idioma_detectado
    em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1 e schemathesis.toml),
    reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json e tests/test_routing_policy.py,
    saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily 2026-11-24) e suites verdes (136+107
    pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-14-roteamento-pools-transporte-e-validacao-hrc
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock validam elevacao de laya>=0.5.3
    (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-14-stitch-skills-tsconfig-e-refatoracoes-sonar
  caminhos:
  - llm/laya_bridge.py
  parecer: Revisado em 2026-11-24. Alteracoes em llm/laya_bridge.py validam elevacao de laya>=0.5.3 (idioma_detectado
    em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1 e schemathesis.toml),
    reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json e tests/test_routing_policy.py,
    saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily 2026-11-24) e suites verdes (136+107
    pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-14-sync-uvlock-ollama-cloud-circuit-e-ci
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock validam elevacao de laya>=0.5.3
    (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-15-laya-0432-failover-arquitetura-s1
  caminhos:
  - data/ollama_models.json
  - llm/laya_bridge.py
  parecer: Revisado em 2026-11-24. Alteracoes em data/ollama_models.json, llm/laya_bridge.py validam elevacao
    de laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-16-elevacao-deps-anthropic-laya-accelerate-e-deps-sync
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, requirements.txt, uv.lock validam elevacao
    de laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-17-elevacao-deps-google-genai-openai
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, requirements.txt, uv.lock validam elevacao
    de laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-17-fase-3-backend-estrutural-sota
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, requirements.txt, uv.lock validam elevacao
    de laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-17-fase-5-evolucao-das-forcas-sota
  caminhos:
  - pyproject.toml
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml validam elevacao de laya>=0.5.3 (idioma_detectado
    em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1 e schemathesis.toml),
    reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json e tests/test_routing_policy.py,
    saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily 2026-11-24) e suites verdes (136+107
    pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-17-fases-0-1-portoes-verificacao-e-higiene-doc-real
  caminhos:
  - pyproject.toml
  - requirements.txt
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, requirements.txt validam elevacao de
    laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-17-saneamento-deps-lint-typecheck-build
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, requirements.txt, uv.lock validam elevacao
    de laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-18-elevacao-deps-google-genai-regex-turbo
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, requirements.txt, uv.lock validam elevacao
    de laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-18-elevacao-deps-vitest-typescript-eslint-openai
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, requirements.txt, uv.lock validam elevacao
    de laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-18-saneamento-sonarlint-pyright-e-deps
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, requirements.txt, uv.lock validam elevacao
    de laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-19-auditoria-evolucao-frontend-sota
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, requirements.txt, uv.lock validam elevacao
    de laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-21-blindagem-ascii-e-saneamento-linters
  caminhos:
  - tests/test_sota_deps_roi_2026_11.py
  parecer: Revisado em 2026-11-24. Alteracoes em tests/test_sota_deps_roi_2026_11.py validam elevacao
    de laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-21-deps-sota-roi-neon-orchestrator-e-calibracao
  caminhos:
  - pyproject.toml
  - requirements.txt
  - tests/test_sota_deps_roi_2026_11.py
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, requirements.txt, tests/test_sota_deps_roi_2026_11.py,
    uv.lock validam elevacao de laya>=0.5.3 (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23,
    schemathesis>=4.34.1 (jsonschema-rs==0.63.1 e schemathesis.toml), reconciliacao de hardware GTX 1060
    6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json e tests/test_routing_policy.py, saneamento
    Pyrefly/Pyright, regularizacao saude_da_malha.py (daily 2026-11-24) e suites verdes (136+107 pytest,
    ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-21-laya-052-watchdog-711-e-calibracao-seq101
  caminhos:
  - llm/laya_bridge.py
  - pyproject.toml
  - requirements.txt
  - tests/test_sota_deps_roi_2026_11.py
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em llm/laya_bridge.py, pyproject.toml, requirements.txt,
    tests/test_sota_deps_roi_2026_11.py, uv.lock validam elevacao de laya>=0.5.3 (idioma_detectado em
    llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1 e schemathesis.toml),
    reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json e tests/test_routing_policy.py,
    saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily 2026-11-24) e suites verdes (136+107
    pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
- registro: registro-2026-11-22-higgsfield-mcp-deps-e-saneamento-sota
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock validam elevacao de laya>=0.5.3
    (idioma_detectado em llm/laya_bridge.py), regex>=2026.11.23, schemathesis>=4.34.1 (jsonschema-rs==0.63.1
    e schemathesis.toml), reconciliacao de hardware GTX 1060 6GB em data/TETOS_DE_MEMORIA.json, data/ollama_models.json
    e tests/test_routing_policy.py, saneamento Pyrefly/Pyright, regularizacao saude_da_malha.py (daily
    2026-11-24) e suites verdes (136+107 pytest, ruff, pyright 0 erros, cwv_gate 5 fases).
---

# Registro -- Elevacao `laya 0.5.3`, `regex 2026.11.23`, `schemathesis 4.34.1`, Reconciliacao GTX 1060 6GB & Saude da Malha (2026-11-24)

## 1. Resumo da Mudanca

- **Dependencias Python (`pyproject.toml`, `requirements.txt`, `uv.lock`, `.venv`):**
  - `laya` elevado `0.5.2 -> 0.5.3` (stopwords PT/ES sem acento e preservacao de choice labels tipados no modo Vega).
  - `regex` elevado `2026.11.19 -> 2026.11.23` (correcao de alternancias negadas `[^a]|[^b]` e conjuntos negados adjacentes a `(?i:...)`).
  - `schemathesis` elevado `4.33.4 -> 4.34.0 -> 4.34.1` (transitiva `jsonschema-rs` `0.61.2 -> 0.63.1`; `allow-whole-floats = false`, `scoped_extensions()`, correcao `2.0` inteiro).
- **Configuracao, IDE & Evolucao Sistemica:**
  - Criado `schemathesis.toml` (`generation.allow-whole-floats = false`, `output.sanitization.enabled = true`).
  - Evoluido `llm/laya_bridge.py` (`LayaIntent.idioma_detectado` opcional em `metadados_s1()`; removido `str(raw_lang)` redundante para Pyrefly).
  - Atualizado `tests/test_sota_deps_roi_2026_11.py` com 3 novos testes e narrowing `isinstance(res, Ok)` para Pyright.
- **Reconciliacao Hardware GTX 1060 6GB & Drivers/SO:**
  - `data/TETOS_DE_MEMORIA.json`: consolidado com hardware medido (`NVIDIA GeForce GTX 1060 6GB`, `sm_61` Pascal, driver `582.78` WHQL / CUDA `13.0`, `vram_total_gib: 6.0`, `vram_disponivel_ao_ollama_gib: 5.1`, `3440x1440@100Hz`).
  - `data/ollama_models.json`: reconciliado com `ollama list` real (`gemma4:e2b` `4.6 GB <= 5.1 GiB`, `gemma4:e4b` `6.6 GB > 5.1 GiB`, `gemma4:12b` `8.0 GB`, `qwen3.8:27b` `17.0 GB`, `translategemma:4b` `3.3 GB`) e bloco `runtime` atualizado (`gpu_backend: "cuda"`, `gpu_arch: "sm_61"`).
  - `tests/test_routing_policy.py`: comentario de `test_nenhuma_rota_local_nova_estoura_a_vram_declarada` alinhado (`6.6 GB` vs `4.6 GB`), validando `estouram == {"local": ["gemma4:e4b"]}` sobre `5.1 GiB`.
  - **Diagnostico de Drivers/SO:** NVIDIA `582.78` WHQL (ramo R580 Security Update ate out/2028) e barramento PCIe `Gen 3 x16` saudaveis (`0` servicos AMD residuais); iGPU `Intel UHD Graphics 630` em `26.20.100.7642` (`2020-01-21`) recomendada para upgrade para `31.0.101.2137`; `torch==2.14.1+cpu` intencional no Python 3.14 (`sm_61` fora das wheels `cu128`/`cu130`); desktop/Chromium consome ~1,29 GiB na GTX 1060 e `OLLAMA_CONTEXT_LENGTH=16384` (`q8_0`) reserva ~3,25 GiB (candidatos a ajuste Tier 0 para 100% offload GPU em 3-4B).
- **Malha & Calibracao:**
  - Microservico Laya S1 (`:8192`) reciclado (`weights_ready: true`).
  - Regularizada auditoria diaria em `reports/agent-calibration/daily/2026-11-24.md` (consolidando `2026-11-22..2026-11-24`), zerando `saude_da_malha.py`.
