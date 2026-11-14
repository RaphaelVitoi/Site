---
id: registro-2026-11-14-sync-uvlock-ollama-cloud-circuit-e-ci
tipo: registro
escopo: Site -- lock sync cmake 4.4.5, circuit-breaker HTTP 402 Ollama Cloud, testes unitarios e auditoria
  CI/Pages
ecossistema: nexus-sota
autor: Gemini 4 Hydrogen <noreply@google.com>
criado_em: '2026-11-14T12:36:00-03:00'
atualizado_em: '2026-11-14T12:36:00-03:00'
classes:
  - interno
  - medido
  - governanca
  - resiliencia
config_medida:
  congelada_em: '2026-11-14'
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data: '2026-11-14'
caminhos:
  - llm/ollama_cloud.py
  - llm/providers.py
  - pyproject.toml
  - reports/REGISTRO-2026-11-14-sync-uvlock-ollama-cloud-circuit-e-ci.md
  - tests/test_ollama_cloud.py
  - uv.lock
revisoes_de_ancora:
  - registro: auditoria-2026-09-02-integridade-do-projeto-e-piso-de-transformers
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: auditoria-2026-10-08-integralidade-backend
    caminhos:
      - pyproject.toml
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado
  - registro: handoff-2026-09-10-lint-lighthouse-e-aceite-cve
    caminhos:
      - pyproject.toml
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado
  - registro: handoff-2026-09-13-integracao-de-engines-wasm-e-economia-de-gate
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: handoff-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: handoff-2026-11-14-decision1-laya-s1-s2-e-ancoras
    caminhos:
      - llm/providers.py
    parecer: llm/providers.py -- _check_provider_availability('ollama', ...) consulta billing_cooldown_remaining_s()
      <= 0.0 para bypass em 0ms durante cooldown HTTP 402
  - registro: plan-dependency-boundary-reconciliation-2026-09-01
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: plano-laya-integracao-s1s2-pmev-2026-09-20
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-09-09-remediacao-dependabot-httpx2
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-09-13-ci-typecheck-e-fronteira-de-capacidades
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-09-13-otimizacoes-helpers-antientropia-e-feedback
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-10-04-remediacao-dependabot-pypdf
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
    caminhos:
      - uv.lock
    parecer: uv.lock -- bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock
      --check e pip_audit aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-10-10-evolucao-malha-agentica-sota-v8-gold
    caminhos:
      - llm/providers.py
    parecer: llm/providers.py -- _check_provider_availability('ollama', ...) consulta billing_cooldown_remaining_s()
      <= 0.0 para bypass em 0ms durante cooldown HTTP 402
  - registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
    caminhos:
      - uv.lock
    parecer: uv.lock -- bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock
      --check e pip_audit aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-10-27-elevacao-dependencias-python-openai-pyspark-pytest
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-10-27-evolucao-project-context-e-reconciliacao-sota
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
    caminhos:
      - uv.lock
    parecer: uv.lock -- bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock
      --check e pip_audit aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-10-28-atualizacao-laya-e-estabilizacao-playwright-smoke
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-10-31-estabilizacao-lifecycle-warmup-turbopack
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-11-03-elevacao-dependencias-pyarrow-openai-anthropic-laya
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-11-03-otimizacao-agentes-watchdog-e-calibracao
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-11-03-remediacao-dependabot-pypdf-pyasn1-minimatch
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-11-04-otimizacao-layout-header-e-elevacao-dependencias
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
    caminhos:
      - pyproject.toml
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado
  - registro: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
    caminhos:
      - llm/providers.py
      - pyproject.toml
      - uv.lock
    parecer: llm/providers.py -- _check_provider_availability('ollama', ...) consulta billing_cooldown_remaining_s()
      <= 0.0 para bypass em 0ms durante cooldown HTTP 402; pyproject.toml -- mantido cmake>=4.4.5 pre-existente
      com uv.lock sincronizado; uv.lock -- bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package
      cmake; uv lock --check e pip_audit aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-11-07-elevacao-dependencias-fastapi-regex-types-aiofiles
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-11-08-elevacao-dependencias-regex-e-laya
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-11-08-elevacao-polars-2-1-e-consumo-integral-engines-sota
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-11-08-elevacao-pypdf-7-0-torchvision-e-ecossistema-npm
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-11-08-integracao-sota-triade-stitch-exa-jules
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-11-08-otimizacao-pyproject-dependencias-extras-e-reconciliacao
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-11-09-elevacao-dependencias-e-fork-eigen
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-11-10-bump-deps-e-extra-paths-pylance
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-11-10-google-genai-3-1-0
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-11-11-elevacao-fastapi-playwright-e-bump-deep-research
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-11-11-elevacao-pypdf-turbo-ai-sdk-google
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-11-11-elevacao-sentence-transformers-genai-prettier-exa-mcp
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-11-11-elevacao-typer-types-knip-harmonizacao
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-11-11-nota-pareamento-dev-dependency-groups
    caminhos:
      - pyproject.toml
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado
  - registro: registro-2026-11-12-ollama-cloud-provider
    caminhos:
      - llm/ollama_cloud.py
      - llm/providers.py
    parecer: llm/ollama_cloud.py -- adiciona cooldown local thread-safe para HTTP 402 (CHICO_OLLAMA_CLOUD_402_COOLDOWN_S),
      helpers _build_chat_payload/_dispatch_chat_request (C901 <= 10) e separacao TimeoutError vs ClientError;
      llm/providers.py -- _check_provider_availability('ollama', ...) consulta billing_cooldown_remaining_s()
      <= 0.0 para bypass em 0ms durante cooldown HTTP 402
  - registro: registro-2026-11-13-elevacao-deps-e-saneamento-configs-ide
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
  - registro: registro-2026-11-13-revisao-ancora-pyproject-extra-path-cockpit
    caminhos:
      - pyproject.toml
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado
  - registro: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- mantido cmake>=4.4.5 pre-existente com uv.lock sincronizado; uv.lock --
      bump pontual cmake 4.4.4 -> 4.4.5 via uv lock --upgrade-package cmake; uv lock --check e pip_audit
      aprovados (269 pacotes, 0 vulnerabilidades)
verificado:
  - uv lock --upgrade-package cmake (4.4.4 -> 4.4.5), uv lock --check (exit 0, 269 packages) e uv sync
    --frozen --all-extras concluido localmente (+ tokenizers==0.23.3)
  - npm run python:audit (pip_audit exit 0 -- No known vulnerabilities found, 5 ignored)
  - ruff format --check, ruff check, ruff check --select C901,PERF,FURB e pyright (0 errors, 0 warnings)
    em llm/ollama_cloud.py, llm/providers.py e tests/test_ollama_cloud.py
  - pytest tests/test_ollama_cloud.py tests/test_llm_layer_sota.py tests/test_system2_local.py tests/test_gemini_decisions.py
    (80 passed in 8.33s) e tests/test_laya_fase4_predict.py (17 passed in 18.52s -- Total de Erros 0,
    Warnings 0)
  - Sonda live POST https://ollama.com/api/chat -- reconfirmou HTTP 402 (usage credits auto reload payment
    failed), mantendo pend-2026-11-12-ollama-cloud-credits legitimamente aberta para acao Tier 0
  - Auditoria GitHub Actions run 43610332264 CodeQL COMPLETED GREEN (6 linguagens) e run 43610332696 SOTA
    v8.0 GOLD CI/CD Pipeline COMPLETED GREEN (Frontend 2m26s, Python 3.13 5m25s, Python 3.12 7m5s)
  - Causa raiz medida de pages-build-deployment errored -- build_type legacy (master /) sem _config.yml
    falha no Liquid parser em frontmatter literal de REGISTRO-2026-11-11-correcao-testes-portabilidade-ci-e-jekyll-liquid.md
nao_verificado:
  - pend-2026-11-12-ollama-cloud-credits permanece aberta (faturamento externo Tier 0 em https://ollama.com/settings)
  - Novo run remoto de GitHub Actions apos este push
---

# Sync uv.lock, Circuit-Breaker HTTP 402 Ollama Cloud e Auditoria CI/Pages

## 1. Sincronizacao `pyproject.toml` / `uv.lock`
- `uv lock --upgrade-package cmake` alinhou `uv.lock` (`cmake 4.4.4 -> 4.4.5`) ao requisito pre-existente `cmake>=4.4.5` em `pyproject.toml`.
- `uv lock --check` e `npm run python:audit` aprovaram com codigo 0 (`269 packages`, zero vulnerabilidades abertas).

## 2. Circuit-Breaker HTTP 402 e Higiene em `llm/ollama_cloud.py` / `llm/providers.py`
- Adicionado cooldown local thread-safe para HTTP 402 (`CHICO_OLLAMA_CLOUD_402_COOLDOWN_S`, padrao `300s`), `billing_cooldown_remaining_s()` e `reset_ollama_cloud_circuit()` para falhar em 0ms sem desperdicio de retries HTTP quando a conta externa estiver sem creditos.
- `_check_provider_availability("ollama", ...)` em `llm/providers.py` passa a consultar `is_configured() and billing_cooldown_remaining_s() <= 0.0`, roteando imediatamente ao redor do provider em cooldown.
- Extraidos `_build_chat_payload` e `_dispatch_chat_request` (`C901 <= 10`) e separados `TimeoutError` de `aiohttp.ClientError` (`Falha de rede Ollama Cloud`).
- Cobertura unitaria criada em `tests/test_ollama_cloud.py` (3 testes novos, zero falhas/warnings).

## 3. Pendencias Externas e GitHub Pages
- **`pend-2026-11-12-ollama-cloud-credits` (Tier 0):** Reconfirmada via sonda live hoje (HTTP 402); permanece aberta aguardando recarga em `https://ollama.com/settings`.
- **`pages-build-deployment`:** Build `legacy` (`master /`) sem `_config.yml` faz Jekyll processar `reports/`, disparando erro Liquid no frontmatter historico de `REGISTRO-2026-11-11-correcao-testes-portabilidade-ci-e-jekyll-liquid.md`. Mantida decisao conservadora de nao alterar registros historicos ou politica Pages neste commit.
