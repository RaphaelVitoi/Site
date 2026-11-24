---
id: registro-2026-11-24-overlay-s3776-e-deps-polars-openai-anthropic
tipo: registro
escopo: Site -- refatoracao SonarLint S3776 e YAML multilinha em sync_local_skills_overlay.py,
  testes de roteamento ICM em test_skills_library_icm.py e elevacao de polars>=2.2.0,
  openai>=3.59.0 e anthropic>=2.13.0 em pyproject.toml, uv.lock e test_pmev_engines_consumption.py
ecossistema: nexus-sota
autor: Gemini 4 Neon <noreply@google.com>
criado_em: '2026-11-24T18:05:00-03:00'
atualizado_em: '2026-11-24T18:05:00-03:00'
commit: HEAD
classes:
- interno
- registro
- infraestrutura
- governanca
caminhos:
- pyproject.toml
- reports/REGISTRO-2026-11-24-overlay-s3776-e-deps-polars-openai-anthropic.md
- scripts/ops/sync_local_skills_overlay.py
- tests/test_pmev_engines_consumption.py
- tests/test_skills_library_icm.py
- uv.lock
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  python: 3.14.9
  so: Windows
  condutor: Gemini 4 Neon
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: '2026-11-24'
verificado:
- uv lock --upgrade-package polars openai anthropic e uv sync --all-extras -- 279
  pacotes resolvidos, polars 2.2.0, openai 3.59.0 e anthropic 2.13.0 ativos
- ruff check em scripts/ops/sync_local_skills_overlay.py, tests/test_skills_library_icm.py
  e tests/test_pmev_engines_consumption.py -- 0 erros
- pyright em scripts/ops/sync_local_skills_overlay.py, tests/test_skills_library_icm.py
  e tests/test_pmev_engines_consumption.py -- 0 erros, 0 warnings
- scripts/ops/sync_local_skills_overlay.py e scripts/ops/sync_skills_library.py --check
  -- OK (25 skills locais, 7 dominios, 7 cookbooks)
- pytest em test_skills_library_icm.py, test_governanca_skills.py, test_pmev_engines_consumption.py
  e testes das skills externas -- 43 passed, 0 erros, 0 warnings
- Smoke import Python -- polars==2.2.0, openai==3.59.0, anthropic==2.13.0
nao_verificado:
- Reexecucao remota dos workflows de CI no GitHub Actions apos push para origin/master
referencias_nao_resolviveis: []
revisoes_de_ancora:
- registro: auditoria-2026-09-02-integridade-do-projeto-e-piso-de-transformers
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: auditoria-2026-10-08-integralidade-backend
  caminhos:
  - pyproject.toml
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml preservam contratos
    e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py (complexidade
    <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: handoff-2026-09-10-lint-lighthouse-e-aceite-cve
  caminhos:
  - pyproject.toml
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml preservam contratos
    e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py (complexidade
    <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: handoff-2026-09-13-integracao-de-engines-wasm-e-economia-de-gate
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: handoff-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: handoff-2026-11-15-translategemma-timesfm-laya-roi
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: handoff-2026-11-21-deps-sota-roi-neon-orchestrator-e-calibracao
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: handoff-2026-11-21-laya-052-watchdog-711-e-calibracao-seq101
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: handoff-2026-11-22-higgsfield-mcp-deps-e-saneamento-sota
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: handoff-2026-11-24-laya-053-regex-20261123-schemathesis-4341
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: plan-dependency-boundary-reconciliation-2026-09-01
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: plano-laya-integracao-s1s2-pmev-2026-09-20
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-09-09-remediacao-dependabot-httpx2
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-09-13-ci-typecheck-e-fronteira-de-capacidades
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-09-13-otimizacoes-helpers-antientropia-e-feedback
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-10-04-remediacao-dependabot-pypdf
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
  caminhos:
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em uv.lock preservam contratos e invariantes
    SOTA: refatoracao S3776 em sync_local_skills_overlay.py (complexidade <=5), suporte
    a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills, cobertura em test_skills_library_icm.py
    e elevacao de polars>=2.2.0, openai>=3.59.0 e anthropic>=2.13.0 em pyproject.toml
    e uv.lock.'
- registro: registro-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
  caminhos:
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em uv.lock preservam contratos e invariantes
    SOTA: refatoracao S3776 em sync_local_skills_overlay.py (complexidade <=5), suporte
    a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills, cobertura em test_skills_library_icm.py
    e elevacao de polars>=2.2.0, openai>=3.59.0 e anthropic>=2.13.0 em pyproject.toml
    e uv.lock.'
- registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-10-27-elevacao-dependencias-python-openai-pyspark-pytest
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-10-27-evolucao-project-context-e-reconciliacao-sota
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
  caminhos:
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em uv.lock preservam contratos e invariantes
    SOTA: refatoracao S3776 em sync_local_skills_overlay.py (complexidade <=5), suporte
    a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills, cobertura em test_skills_library_icm.py
    e elevacao de polars>=2.2.0, openai>=3.59.0 e anthropic>=2.13.0 em pyproject.toml
    e uv.lock.'
- registro: registro-2026-10-28-atualizacao-laya-e-estabilizacao-playwright-smoke
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-10-31-estabilizacao-lifecycle-warmup-turbopack
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-03-elevacao-dependencias-pyarrow-openai-anthropic-laya
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-03-otimizacao-agentes-watchdog-e-calibracao
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-03-remediacao-dependabot-pypdf-pyasn1-minimatch
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-04-otimizacao-layout-header-e-elevacao-dependencias
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
  caminhos:
  - pyproject.toml
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml preservam contratos
    e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py (complexidade
    <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-07-elevacao-dependencias-fastapi-regex-types-aiofiles
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-08-elevacao-dependencias-regex-e-laya
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-08-elevacao-polars-2-1-e-consumo-integral-engines-sota
  caminhos:
  - pyproject.toml
  - tests/test_pmev_engines_consumption.py
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, tests/test_pmev_engines_consumption.py,
    uv.lock preservam contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-08-elevacao-pypdf-7-0-torchvision-e-ecossistema-npm
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-08-integracao-sota-triade-stitch-exa-jules
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-08-otimizacao-pyproject-dependencias-extras-e-reconciliacao
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-09-elevacao-dependencias-e-fork-eigen
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-09-saneamento-pyright-e-mcp-skills-dependencies
  caminhos:
  - tests/test_pmev_engines_consumption.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em tests/test_pmev_engines_consumption.py
    preservam contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-10-bump-deps-e-extra-paths-pylance
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-10-google-genai-3-1-0
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-11-elevacao-fastapi-playwright-e-bump-deep-research
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-11-elevacao-pypdf-turbo-ai-sdk-google
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-11-elevacao-sentence-transformers-genai-prettier-exa-mcp
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-11-elevacao-typer-types-knip-harmonizacao
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-11-nota-pareamento-dev-dependency-groups
  caminhos:
  - pyproject.toml
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml preservam contratos
    e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py (complexidade
    <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-13-elevacao-deps-e-saneamento-configs-ide
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-13-revisao-ancora-pyproject-extra-path-cockpit
  caminhos:
  - pyproject.toml
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml preservam contratos
    e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py (complexidade
    <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-14-laya-pylint-e-refactors-sonar
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-14-roteamento-pools-transporte-e-validacao-hrc
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-14-sync-uvlock-ollama-cloud-circuit-e-ci
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-16-elevacao-deps-anthropic-laya-accelerate-e-deps-sync
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-17-elevacao-deps-google-genai-openai
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-17-fase-3-backend-estrutural-sota
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-17-fase-5-evolucao-das-forcas-sota
  caminhos:
  - pyproject.toml
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml preservam contratos
    e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py (complexidade
    <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-17-fases-0-1-portoes-verificacao-e-higiene-doc-real
  caminhos:
  - pyproject.toml
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml preservam contratos
    e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py (complexidade
    <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-17-saneamento-deps-lint-typecheck-build
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-18-elevacao-deps-google-genai-regex-turbo
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-18-elevacao-deps-vitest-typescript-eslint-openai
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-18-saneamento-sonarlint-pyright-e-deps
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-19-auditoria-evolucao-frontend-sota
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-21-deps-sota-roi-neon-orchestrator-e-calibracao
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-21-laya-052-watchdog-711-e-calibracao-seq101
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-22-higgsfield-mcp-deps-e-saneamento-sota
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-22-icm-rules-ssot-e-roi-s1
  caminhos:
  - scripts/ops/sync_local_skills_overlay.py
  - tests/test_skills_library_icm.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em scripts/ops/sync_local_skills_overlay.py,
    tests/test_skills_library_icm.py preservam contratos e invariantes SOTA: refatoracao
    S3776 em sync_local_skills_overlay.py (complexidade <=5), suporte a YAML multilinha
    (>-) e descoberta em ~/.gemini/config/skills, cobertura em test_skills_library_icm.py
    e elevacao de polars>=2.2.0, openai>=3.59.0 e anthropic>=2.13.0 em pyproject.toml
    e uv.lock.'
- registro: registro-2026-11-24-laya-053-regex-20261123-schemathesis-4341
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
- registro: registro-2026-11-24-scrypt-sonarlint-codeql-schemathesis-exa
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-24. Alteracoes em pyproject.toml, uv.lock preservam
    contratos e invariantes SOTA: refatoracao S3776 em sync_local_skills_overlay.py
    (complexidade <=5), suporte a YAML multilinha (>-) e descoberta em ~/.gemini/config/skills,
    cobertura em test_skills_library_icm.py e elevacao de polars>=2.2.0, openai>=3.59.0
    e anthropic>=2.13.0 em pyproject.toml e uv.lock.'
---

# Registro -- Refatoracao S3776 no Overlay ICM e Elevacao polars/openai/anthropic

## Sintese

1. **Overlay ICM (`scripts/ops/sync_local_skills_overlay.py` e `tests/test_skills_library_icm.py`):**
   - Eliminado alerta SonarLint `python:S3776` em `_parse_frontmatter` via extracao dos helpers puros `_clean_scalar`, `_parse_frontmatter_yaml` e `_parse_frontmatter_lines_fallback` (complexidade cognitiva <= 5 por funcao).
   - Adicionada leitura segura via `yaml.safe_load` para campos `description` multilinha (`>-`), descoberta em escopo de usuario e testes de regressao cobrindo YAML dobrado, fallback malformado e isolamento de roteamento.
2. **Dependencias SOTA (`pyproject.toml`, `uv.lock` e `tests/test_pmev_engines_consumption.py`):**
   - Elevadas e travadas as versoes `polars>=2.2.0`, `openai>=3.59.0` e `anthropic>=2.13.0` nos extras espelhados (`pmev`, `llm-sdks`, `all`) e atualizada a docstring correspondente.
   - Reconciliadas 76 ancoras vigentes via `revisoes_de_ancora`.
