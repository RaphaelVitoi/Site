---
id: registro-2026-11-18-saneamento-sonarlint-pyright-e-deps
tipo: registro
escopo: Site -- Saneamento SonarLint/Ruff/Pyrefly, harmonizacao pyproject/requirements/uv.lock e formatacao
  Ruff/Prettier
ecossistema: nexus-sota
autor: Gemini 4 Hydrogen <noreply@google.com>
criado_em: '2026-11-18T16:38:00-03:00'
atualizado_em: '2026-11-18T16:38:00-03:00'
commit: HEAD
classes:
- interno
- medido
- registro
- qualidade
- dependencias
caminhos:
- .agents/skills/key-pool-audit/scripts/render_key_audit.py
- cli/commands.py
- engine/llm_api.py
- frontend/src/app/api/sota/key-pools/route.ts
- frontend/src/app/api/sota/nexus-mesh/route.ts
- frontend/src/components/analytics/NexusKeyPoolsPanel.tsx
- llm/key_observatory.py
- llm/openrouter_pool.py
- llm/providers.py
- llm/routing.py
- pyproject.toml
- reports/REGISTRO-2026-11-18-saneamento-sonarlint-pyright-e-deps.md
- requirements.txt
- utils/os_integration.py
- uv.lock
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  session_id: b3d40f19-6910-470f-a49f-cbf6e89f1fed
  condutor: Gemini 4 Hydrogen <noreply@google.com>
  modelo: gemini-4-hydrogen
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: '2026-11-18'
verificado:
- npm run check:fast aprovado (ruff check ., pyright --project pyproject.toml com 0 erros/0 warnings,
  eslint . e tsc --build tsconfig.json)
- uv run --no-sync pytest em test_requirements_sync.py, test_openrouter_pools.py, test_auditoria_fortificacao_5_fases.py,
  test_auditoria_backend_remediation_2026_10.py (38 passed) e test_patches_skills.py (5 passed)
- npm run python:audit (pip_audit -r requirements.txt com aceites) aprovado sem novas vulnerabilidades
- npx jest src/components/analytics/NexusKeyPoolsPanel.test.tsx e npm run test (suite Jest integral frontend)
  aprovados
- npm run sota:audit (cwv_gate.ps1) aprovado com 0 erros e 0 warnings nas 5 fases (LCP 1113ms, CLS 0.00018,
  TBT 32.5ms, Axe 0, CVE 0, SRI VERIFIED)
- uv run --no-sync python scripts/ops/suite_verde.py verde (67.04% cobertura; 1 skip por frontend fora
  do ar em test_ordem_headings.py)
- uv run ruff format e prettier --write aplicados nos arquivos modificados; record_anchor_gate.ps1 e record_gate.py
  aprovados
nao_verificado:
- Push do submodulo skills/exa-mcp-server (59495ce) para o remoto fork (Repository not found); gitlink
  do repositorio pai mantido em 1a4349d
referencias_nao_resolviveis: []
revisoes_de_ancora:
- registro: plan-dependency-boundary-reconciliation-2026-09-01
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: auditoria-2026-09-02-integridade-do-projeto-e-piso-de-transformers
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: auditoria-2026-09-08-o-que-esta-em-aberto-na-malha
  caminhos:
  - requirements.txt
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: auditoria-2026-10-08-integralidade-backend
  caminhos:
  - engine/llm_api.py
  - llm/openrouter_pool.py
  - pyproject.toml
  - requirements.txt
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
    Refatoracao estrutural em observatorio, pools e roteamento para eliminar alertas SonarLint (S1192/S3776/S3358/S7503),
    Pyrefly e Ruff S404/S607 sem alterar contratos publicos ou regras de seguranca.
- registro: auditoria-2026-11-18-pools-chaves-observatorio-e-roteamento
  caminhos:
  - .agents/skills/key-pool-audit/scripts/render_key_audit.py
  - cli/commands.py
  - engine/llm_api.py
  - frontend/src/app/api/sota/key-pools/route.ts
  - frontend/src/app/api/sota/nexus-mesh/route.ts
  - frontend/src/components/analytics/NexusKeyPoolsPanel.tsx
  - llm/key_observatory.py
  - llm/openrouter_pool.py
  - llm/providers.py
  parecer: Revisado em 2026-11-18. Refatoracao estrutural em observatorio, pools e roteamento para eliminar
    alertas SonarLint (S1192/S3776/S3358/S7503), Pyrefly e Ruff S404/S607 sem alterar contratos publicos
    ou regras de seguranca. Refatoracao de complexidade cognitiva, Readonly props (S6759), String.raw
    (S7780) e remocao de ternarios/templates aninhados (S3358/S4624/S6582) nas rotas sota/key-pools, sota/nexus-mesh
    e NexusKeyPoolsPanel, validadas com eslint, tsc e Jest.
- registro: handoff-2026-09-10-lint-lighthouse-e-aceite-cve
  caminhos:
  - pyproject.toml
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: handoff-2026-09-13-integracao-de-engines-wasm-e-economia-de-gate
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: handoff-2026-09-22-integracao-system1-llm-dashboard
  caminhos:
  - engine/llm_api.py
  parecer: Revisado em 2026-11-18. Refatoracao estrutural em observatorio, pools e roteamento para eliminar
    alertas SonarLint (S1192/S3776/S3358/S7503), Pyrefly e Ruff S404/S607 sem alterar contratos publicos
    ou regras de seguranca.
- registro: handoff-2026-09-30-expurgo-de-modelos-obsoletos-harmonizacao-qwen-e-calibracao
  caminhos:
  - engine/llm_api.py
  - llm/routing.py
  parecer: Revisado em 2026-11-18. Refatoracao estrutural em observatorio, pools e roteamento para eliminar
    alertas SonarLint (S1192/S3776/S3358/S7503), Pyrefly e Ruff S404/S607 sem alterar contratos publicos
    ou regras de seguranca.
- registro: handoff-2026-10-05-fechamento-do-ciclo-medicoes-cwv-e-cacheabilidade
  caminhos:
  - engine/llm_api.py
  parecer: Revisado em 2026-11-18. Refatoracao estrutural em observatorio, pools e roteamento para eliminar
    alertas SonarLint (S1192/S3776/S3358/S7503), Pyrefly e Ruff S404/S607 sem alterar contratos publicos
    ou regras de seguranca.
- registro: handoff-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - engine/llm_api.py
  - llm/openrouter_pool.py
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
    Refatoracao estrutural em observatorio, pools e roteamento para eliminar alertas SonarLint (S1192/S3776/S3358/S7503),
    Pyrefly e Ruff S404/S607 sem alterar contratos publicos ou regras de seguranca.
- registro: handoff-2026-10-18-harmonizacao-malha-agentica-e-painel-nexus
  caminhos:
  - frontend/src/app/api/sota/nexus-mesh/route.ts
  parecer: Revisado em 2026-11-18. Refatoracao de complexidade cognitiva, Readonly props (S6759), String.raw
    (S7780) e remocao de ternarios/templates aninhados (S3358/S4624/S6582) nas rotas sota/key-pools, sota/nexus-mesh
    e NexusKeyPoolsPanel, validadas com eslint, tsc e Jest.
- registro: handoff-2026-10-20-harmonizacao-tier1-gemini-38
  caminhos:
  - llm/routing.py
  parecer: Revisado em 2026-11-18. Refatoracao estrutural em observatorio, pools e roteamento para eliminar
    alertas SonarLint (S1192/S3776/S3358/S7503), Pyrefly e Ruff S404/S607 sem alterar contratos publicos
    ou regras de seguranca.
- registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: handoff-2026-11-14-decision1-laya-s1-s2-e-ancoras
  caminhos:
  - llm/providers.py
  parecer: Revisado em 2026-11-18. Refatoracao estrutural em observatorio, pools e roteamento para eliminar
    alertas SonarLint (S1192/S3776/S3358/S7503), Pyrefly e Ruff S404/S607 sem alterar contratos publicos
    ou regras de seguranca.
- registro: handoff-2026-11-15-translategemma-timesfm-laya-roi
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: handoff-2026-11-18-observatorio-chaves-roteamento-e-calibracao
  caminhos:
  - .agents/skills/key-pool-audit/scripts/render_key_audit.py
  - cli/commands.py
  - engine/llm_api.py
  - frontend/src/app/api/sota/key-pools/route.ts
  - frontend/src/app/api/sota/nexus-mesh/route.ts
  - frontend/src/components/analytics/NexusKeyPoolsPanel.tsx
  - llm/key_observatory.py
  - llm/openrouter_pool.py
  - llm/providers.py
  parecer: Revisado em 2026-11-18. Refatoracao estrutural em observatorio, pools e roteamento para eliminar
    alertas SonarLint (S1192/S3776/S3358/S7503), Pyrefly e Ruff S404/S607 sem alterar contratos publicos
    ou regras de seguranca. Refatoracao de complexidade cognitiva, Readonly props (S6759), String.raw
    (S7780) e remocao de ternarios/templates aninhados (S3358/S4624/S6582) nas rotas sota/key-pools, sota/nexus-mesh
    e NexusKeyPoolsPanel, validadas com eslint, tsc e Jest.
- registro: plano-frentes-abertas-2026-09-08
  caminhos:
  - requirements.txt
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: plano-laya-integracao-s1s2-pmev-2026-09-20
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-09-02-adapters-ligado-ao-caminho-real-anthropic
  caminhos:
  - engine/llm_api.py
  parecer: Revisado em 2026-11-18. Refatoracao estrutural em observatorio, pools e roteamento para eliminar
    alertas SonarLint (S1192/S3776/S3358/S7503), Pyrefly e Ruff S404/S607 sem alterar contratos publicos
    ou regras de seguranca.
- registro: registro-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem
  caminhos:
  - engine/llm_api.py
  parecer: Revisado em 2026-11-18. Refatoracao estrutural em observatorio, pools e roteamento para eliminar
    alertas SonarLint (S1192/S3776/S3358/S7503), Pyrefly e Ruff S404/S607 sem alterar contratos publicos
    ou regras de seguranca.
- registro: registro-2026-09-09-remediacao-dependabot-httpx2
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-09-13-ci-typecheck-e-fronteira-de-capacidades
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-09-13-otimizacoes-helpers-antientropia-e-feedback
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-09-14-auditoria-e-refinamento-settings-e-configuracoes
  caminhos:
  - requirements.txt
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-09-25-pools-de-chaves-openrouter-multi-tier
  caminhos:
  - llm/openrouter_pool.py
  parecer: Revisado em 2026-11-18. Refatoracao estrutural em observatorio, pools e roteamento para eliminar
    alertas SonarLint (S1192/S3776/S3358/S7503), Pyrefly e Ruff S404/S607 sem alterar contratos publicos
    ou regras de seguranca.
- registro: registro-2026-09-30-expurgo-de-modelos-obsoletos-e-reconciliacao-de-ancoras
  caminhos:
  - engine/llm_api.py
  - llm/routing.py
  parecer: Revisado em 2026-11-18. Refatoracao estrutural em observatorio, pools e roteamento para eliminar
    alertas SonarLint (S1192/S3776/S3358/S7503), Pyrefly e Ruff S404/S607 sem alterar contratos publicos
    ou regras de seguranca.
- registro: registro-2026-10-01-integracao-cloud-ollama-hermes-nous-e-chaves-registro
  caminhos:
  - engine/llm_api.py
  parecer: Revisado em 2026-11-18. Refatoracao estrutural em observatorio, pools e roteamento para eliminar
    alertas SonarLint (S1192/S3776/S3358/S7503), Pyrefly e Ruff S404/S607 sem alterar contratos publicos
    ou regras de seguranca.
- registro: registro-2026-10-01-resiliencia-servidores-locais-e-triagem
  caminhos:
  - engine/llm_api.py
  parecer: Revisado em 2026-11-18. Refatoracao estrutural em observatorio, pools e roteamento para eliminar
    alertas SonarLint (S1192/S3776/S3358/S7503), Pyrefly e Ruff S404/S607 sem alterar contratos publicos
    ou regras de seguranca.
- registro: registro-2026-10-04-http-metrics-correlation-e-worker-shutdown
  caminhos:
  - engine/llm_api.py
  parecer: Revisado em 2026-11-18. Refatoracao estrutural em observatorio, pools e roteamento para eliminar
    alertas SonarLint (S1192/S3776/S3358/S7503), Pyrefly e Ruff S404/S607 sem alterar contratos publicos
    ou regras de seguranca.
- registro: registro-2026-10-04-remediacao-dependabot-pypdf
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
  caminhos:
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-10-05-resolucao-de-modelo-ollama-e-schema-json
  caminhos:
  - engine/llm_api.py
  parecer: Revisado em 2026-11-18. Refatoracao estrutural em observatorio, pools e roteamento para eliminar
    alertas SonarLint (S1192/S3776/S3358/S7503), Pyrefly e Ruff S404/S607 sem alterar contratos publicos
    ou regras de seguranca.
- registro: registro-2026-10-06-strata-moe-125b-e-dashboard-nexus
  caminhos:
  - engine/llm_api.py
  parecer: Revisado em 2026-11-18. Refatoracao estrutural em observatorio, pools e roteamento para eliminar
    alertas SonarLint (S1192/S3776/S3358/S7503), Pyrefly e Ruff S404/S607 sem alterar contratos publicos
    ou regras de seguranca.
- registro: registro-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - engine/llm_api.py
  - llm/openrouter_pool.py
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
    Refatoracao estrutural em observatorio, pools e roteamento para eliminar alertas SonarLint (S1192/S3776/S3358/S7503),
    Pyrefly e Ruff S404/S607 sem alterar contratos publicos ou regras de seguranca.
- registro: registro-2026-10-10-evolucao-malha-agentica-sota-v8-gold
  caminhos:
  - llm/providers.py
  - llm/routing.py
  parecer: Revisado em 2026-11-18. Refatoracao estrutural em observatorio, pools e roteamento para eliminar
    alertas SonarLint (S1192/S3776/S3358/S7503), Pyrefly e Ruff S404/S607 sem alterar contratos publicos
    ou regras de seguranca.
- registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
  caminhos:
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-10-18-painel-nexus-warmup-e-mesh-orchestrator
  caminhos:
  - frontend/src/app/api/sota/nexus-mesh/route.ts
  parecer: Revisado em 2026-11-18. Refatoracao de complexidade cognitiva, Readonly props (S6759), String.raw
    (S7780) e remocao de ternarios/templates aninhados (S3358/S4624/S6582) nas rotas sota/key-pools, sota/nexus-mesh
    e NexusKeyPoolsPanel, validadas com eslint, tsc e Jest.
- registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-10-19-resolucao-sonarqube-nexus-mesh-e-logger
  caminhos:
  - frontend/src/app/api/sota/nexus-mesh/route.ts
  parecer: Revisado em 2026-11-18. Refatoracao de complexidade cognitiva, Readonly props (S6759), String.raw
    (S7780) e remocao de ternarios/templates aninhados (S3358/S4624/S6582) nas rotas sota/key-pools, sota/nexus-mesh
    e NexusKeyPoolsPanel, validadas com eslint, tsc e Jest.
- registro: registro-2026-10-20-harmonizacao-tier1-e-gemini-38
  caminhos:
  - cli/commands.py
  - engine/llm_api.py
  - llm/routing.py
  parecer: Revisado em 2026-11-18. Refatoracao estrutural em observatorio, pools e roteamento para eliminar
    alertas SonarLint (S1192/S3776/S3358/S7503), Pyrefly e Ruff S404/S607 sem alterar contratos publicos
    ou regras de seguranca.
- registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
  caminhos:
  - llm/routing.py
  parecer: Revisado em 2026-11-18. Refatoracao estrutural em observatorio, pools e roteamento para eliminar
    alertas SonarLint (S1192/S3776/S3358/S7503), Pyrefly e Ruff S404/S607 sem alterar contratos publicos
    ou regras de seguranca.
- registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-10-27-elevacao-dependencias-python-openai-pyspark-pytest
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-10-27-evolucao-project-context-e-reconciliacao-sota
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
  caminhos:
  - engine/llm_api.py
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
    Refatoracao estrutural em observatorio, pools e roteamento para eliminar alertas SonarLint (S1192/S3776/S3358/S7503),
    Pyrefly e Ruff S404/S607 sem alterar contratos publicos ou regras de seguranca.
- registro: registro-2026-10-28-atualizacao-laya-e-estabilizacao-playwright-smoke
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-10-31-estabilizacao-lifecycle-warmup-turbopack
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules
  caminhos:
  - frontend/src/app/api/sota/nexus-mesh/route.ts
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
    Refatoracao de complexidade cognitiva, Readonly props (S6759), String.raw (S7780) e remocao de ternarios/templates
    aninhados (S3358/S4624/S6582) nas rotas sota/key-pools, sota/nexus-mesh e NexusKeyPoolsPanel, validadas
    com eslint, tsc e Jest.
- registro: registro-2026-11-03-elevacao-dependencias-pyarrow-openai-anthropic-laya
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-11-03-otimizacao-agentes-watchdog-e-calibracao
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-11-03-remediacao-dependabot-pypdf-pyasn1-minimatch
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-11-04-otimizacao-layout-header-e-elevacao-dependencias
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
  caminhos:
  - pyproject.toml
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
  caminhos:
  - llm/openrouter_pool.py
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
    Refatoracao estrutural em observatorio, pools e roteamento para eliminar alertas SonarLint (S1192/S3776/S3358/S7503),
    Pyrefly e Ruff S404/S607 sem alterar contratos publicos ou regras de seguranca.
- registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
  caminhos:
  - llm/providers.py
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
    Refatoracao estrutural em observatorio, pools e roteamento para eliminar alertas SonarLint (S1192/S3776/S3358/S7503),
    Pyrefly e Ruff S404/S607 sem alterar contratos publicos ou regras de seguranca.
- registro: registro-2026-11-07-elevacao-dependencias-fastapi-regex-types-aiofiles
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-11-08-elevacao-dependencias-regex-e-laya
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-11-08-elevacao-polars-2-1-e-consumo-integral-engines-sota
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-11-08-elevacao-pypdf-7-0-torchvision-e-ecossistema-npm
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-11-08-integracao-sota-triade-stitch-exa-jules
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-11-08-otimizacao-pyproject-dependencias-extras-e-reconciliacao
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-11-08-refinamento-sonarlint-e-code-review-triage
  caminhos:
  - frontend/src/app/api/sota/nexus-mesh/route.ts
  parecer: Revisado em 2026-11-18. Refatoracao de complexidade cognitiva, Readonly props (S6759), String.raw
    (S7780) e remocao de ternarios/templates aninhados (S3358/S4624/S6582) nas rotas sota/key-pools, sota/nexus-mesh
    e NexusKeyPoolsPanel, validadas com eslint, tsc e Jest.
- registro: registro-2026-11-08-saneamento-code-review-triage
  caminhos:
  - frontend/src/app/api/sota/nexus-mesh/route.ts
  parecer: Revisado em 2026-11-18. Refatoracao de complexidade cognitiva, Readonly props (S6759), String.raw
    (S7780) e remocao de ternarios/templates aninhados (S3358/S4624/S6582) nas rotas sota/key-pools, sota/nexus-mesh
    e NexusKeyPoolsPanel, validadas com eslint, tsc e Jest.
- registro: registro-2026-11-09-elevacao-dependencias-e-fork-eigen
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-11-09-remediacao-telemetria-cockpit-e-homeostase-laya-chrysalis
  caminhos:
  - frontend/src/app/api/sota/nexus-mesh/route.ts
  parecer: Revisado em 2026-11-18. Refatoracao de complexidade cognitiva, Readonly props (S6759), String.raw
    (S7780) e remocao de ternarios/templates aninhados (S3358/S4624/S6582) nas rotas sota/key-pools, sota/nexus-mesh
    e NexusKeyPoolsPanel, validadas com eslint, tsc e Jest.
- registro: registro-2026-11-10-bump-deps-e-extra-paths-pylance
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-11-10-google-genai-3-1-0
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-11-11-elevacao-fastapi-playwright-e-bump-deep-research
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-11-11-elevacao-pypdf-turbo-ai-sdk-google
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-11-11-elevacao-sentence-transformers-genai-prettier-exa-mcp
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-11-11-elevacao-typer-types-knip-harmonizacao
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-11-11-nota-pareamento-dev-dependency-groups
  caminhos:
  - pyproject.toml
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-11-12-ollama-cloud-provider
  caminhos:
  - llm/providers.py
  - llm/routing.py
  parecer: Revisado em 2026-11-18. Refatoracao estrutural em observatorio, pools e roteamento para eliminar
    alertas SonarLint (S1192/S3776/S3358/S7503), Pyrefly e Ruff S404/S607 sem alterar contratos publicos
    ou regras de seguranca.
- registro: registro-2026-11-13-elevacao-deps-e-saneamento-configs-ide
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-11-13-revisao-ancora-pyproject-extra-path-cockpit
  caminhos:
  - pyproject.toml
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-11-14-laya-pylint-e-refactors-sonar
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-11-14-llama-cpp-b12387-router-9931
  caminhos:
  - llm/providers.py
  parecer: Revisado em 2026-11-18. Refatoracao estrutural em observatorio, pools e roteamento para eliminar
    alertas SonarLint (S1192/S3776/S3358/S7503), Pyrefly e Ruff S404/S607 sem alterar contratos publicos
    ou regras de seguranca.
- registro: registro-2026-11-14-roteamento-pools-transporte-e-validacao-hrc
  caminhos:
  - engine/llm_api.py
  - llm/openrouter_pool.py
  - llm/providers.py
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
    Refatoracao estrutural em observatorio, pools e roteamento para eliminar alertas SonarLint (S1192/S3776/S3358/S7503),
    Pyrefly e Ruff S404/S607 sem alterar contratos publicos ou regras de seguranca.
- registro: registro-2026-11-14-sync-uvlock-ollama-cloud-circuit-e-ci
  caminhos:
  - llm/providers.py
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
    Refatoracao estrutural em observatorio, pools e roteamento para eliminar alertas SonarLint (S1192/S3776/S3358/S7503),
    Pyrefly e Ruff S404/S607 sem alterar contratos publicos ou regras de seguranca.
- registro: registro-2026-11-15-laya-0432-failover-arquitetura-s1
  caminhos:
  - llm/routing.py
  parecer: Revisado em 2026-11-18. Refatoracao estrutural em observatorio, pools e roteamento para eliminar
    alertas SonarLint (S1192/S3776/S3358/S7503), Pyrefly e Ruff S404/S607 sem alterar contratos publicos
    ou regras de seguranca.
- registro: registro-2026-11-15-malha-agentica-rotacao-hkcu-hklm
  caminhos:
  - llm/providers.py
  parecer: Revisado em 2026-11-18. Refatoracao estrutural em observatorio, pools e roteamento para eliminar
    alertas SonarLint (S1192/S3776/S3358/S7503), Pyrefly e Ruff S404/S607 sem alterar contratos publicos
    ou regras de seguranca.
- registro: registro-2026-11-15-saneamento-sonarlint-codeql-e-portoes
  caminhos:
  - llm/providers.py
  parecer: Revisado em 2026-11-18. Refatoracao estrutural em observatorio, pools e roteamento para eliminar
    alertas SonarLint (S1192/S3776/S3358/S7503), Pyrefly e Ruff S404/S607 sem alterar contratos publicos
    ou regras de seguranca.
- registro: registro-2026-11-16-elevacao-deps-anthropic-laya-accelerate-e-deps-sync
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-11-17-auditoria-fortificacao-backend-5-fases
  caminhos:
  - engine/llm_api.py
  - llm/openrouter_pool.py
  - llm/providers.py
  - utils/os_integration.py
  parecer: Revisado em 2026-11-18. Refatoracao estrutural em observatorio, pools e roteamento para eliminar
    alertas SonarLint (S1192/S3776/S3358/S7503), Pyrefly e Ruff S404/S607 sem alterar contratos publicos
    ou regras de seguranca. Removida conversao redundante str() em show_toast (utils/os_integration.py)
    mantendo truncamento e envio seguro por ambiente.
- registro: registro-2026-11-17-elevacao-deps-google-genai-openai
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-11-17-fase-3-backend-estrutural-sota
  caminhos:
  - engine/llm_api.py
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
    Refatoracao estrutural em observatorio, pools e roteamento para eliminar alertas SonarLint (S1192/S3776/S3358/S7503),
    Pyrefly e Ruff S404/S607 sem alterar contratos publicos ou regras de seguranca.
- registro: registro-2026-11-17-fase-5-evolucao-das-forcas-sota
  caminhos:
  - cli/commands.py
  - pyproject.toml
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
    Refatoracao estrutural em observatorio, pools e roteamento para eliminar alertas SonarLint (S1192/S3776/S3358/S7503),
    Pyrefly e Ruff S404/S607 sem alterar contratos publicos ou regras de seguranca.
- registro: registro-2026-11-17-fases-0-1-portoes-verificacao-e-higiene-doc-real
  caminhos:
  - pyproject.toml
  - requirements.txt
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-11-17-saneamento-deps-lint-typecheck-build
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-11-18-disjuntor-404-e-modelos-free-openrouter
  caminhos:
  - engine/llm_api.py
  - llm/providers.py
  - llm/routing.py
  parecer: Revisado em 2026-11-18. Refatoracao estrutural em observatorio, pools e roteamento para eliminar
    alertas SonarLint (S1192/S3776/S3358/S7503), Pyrefly e Ruff S404/S607 sem alterar contratos publicos
    ou regras de seguranca.
- registro: registro-2026-11-18-elevacao-deps-google-genai-regex-turbo
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-11-18-elevacao-deps-vitest-typescript-eslint-openai
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
- registro: registro-2026-11-18-saneamento-sonarlint-pyright-e-deps
  caminhos:
  - .agents/skills/key-pool-audit/scripts/render_key_audit.py
  - cli/commands.py
  - engine/llm_api.py
  - frontend/src/app/api/sota/key-pools/route.ts
  - frontend/src/app/api/sota/nexus-mesh/route.ts
  - frontend/src/components/analytics/NexusKeyPoolsPanel.tsx
  - llm/key_observatory.py
  - llm/openrouter_pool.py
  - llm/providers.py
  - llm/routing.py
  - pyproject.toml
  - reports/REGISTRO-2026-11-18-saneamento-sonarlint-pyright-e-deps.md
  - requirements.txt
  - utils/os_integration.py
  - uv.lock
  parecer: Revisado em 2026-11-18. Elevados os pisos em pyproject.toml e requirements.txt com sync em
    uv.lock (fastapi>=0.165.0 resolvido 0.165.0, openai>=3.55.1, regex>=2026.11.19, typer>=0.29.2, laya>=0.4.37),
    preservando test_requirements_sync.py (4/4) e pip_audit (0 vulnerabilidades abertas fora aceites).
    Refatoracao estrutural em observatorio, pools e roteamento para eliminar alertas SonarLint (S1192/S3776/S3358/S7503),
    Pyrefly e Ruff S404/S607 sem alterar contratos publicos ou regras de seguranca. Refatoracao de complexidade
    cognitiva, Readonly props (S6759), String.raw (S7780) e remocao de ternarios/templates aninhados (S3358/S4624/S6582)
    nas rotas sota/key-pools, sota/nexus-mesh e NexusKeyPoolsPanel, validadas com eslint, tsc e Jest.
    Removida conversao redundante str() em show_toast (utils/os_integration.py) mantendo truncamento e
    envio seguro por ambiente.
---

# Registro -- Saneamento SonarLint/Ruff/Pyrefly e Elevacao de Dependencias (2026-11-18)

## Resumo

- **Dependencias Python (`pyproject.toml`, `requirements.txt`, `uv.lock`):** pisos elevados e sincronizados (`fastapi>=0.165.0`, `openai>=3.55.1`, `regex>=2026.11.19`, `typer>=0.29.2`, `laya>=0.4.37`).
- **Qualidade e complexidade Python/TypeScript:** eliminados achados SonarLint (`S1192`, `S3776`, `S3358`, `S7503`, `S107`, `S6759`, `S7780`, `S4624`, `S6582`), Ruff (`S404`, `S607`) e Pyrefly (`unnecessary-type-conversion`) em `render_key_audit.py`, `cli/commands.py`, `engine/llm_api.py`, `llm/key_observatory.py`, `llm/openrouter_pool.py`, `llm/providers.py`, `llm/routing.py`, `utils/os_integration.py`, `frontend/src/app/api/sota/key-pools/route.ts`, `frontend/src/app/api/sota/nexus-mesh/route.ts` e `frontend/src/components/analytics/NexusKeyPoolsPanel.tsx`.
- **Submodulo `skills/exa-mcp-server`:** correcao `S6544` em `skills/exa-mcp-server/api/mcp.ts` commitada localmente no submodulo (`59495ce`) e validada via `npm run ci` (13 suites, 158 testes); gitlink do repositorio pai mantido em `1a4349d` porque o remoto `RaphaelVitoi/exa-mcp-server.git` retornou `Repository not found` no push.
