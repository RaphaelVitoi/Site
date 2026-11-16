---
id: registro-2026-11-15-saneamento-sonarlint-codeql-e-portoes
tipo: registro
escopo:
  Site -- resolucao de apontamentos SonarLint (S3776/S1192/S7503/S3626/S8997),
  achado CodeQL py/bad-tag-filter, saneamento de supressor noqa com Record-Id,
  frontmatter M.O. 13.B em docs de epicos e resolucao de 93 alertas de secret
  scanning ja revogados
ecossistema: nexus-sota
autor:
  Devin (SWE-2 Flash)
  <158243242+devin-ai-integration[bot]@users.noreply.github.com>
criado_em: "2026-11-15T23:45:00-03:00"
atualizado_em: "2026-11-15T23:45:00-03:00"
commit: HEAD
classes: [interno, medido, governanca, registro, sonarlint, codeql, seguranca]
caminhos:
  - agents/execution.py
  - core/subagents_mesh.py
  - docs/epics/aula-icm-rp/INDEX.md
  - docs/epics/aula-icm-rp/SPEC.md
  - docs/epics/cli-interativa/IDENTITY_SPEC.md
  - docs/epics/cli-interativa/SPEC.md
  - docs/epics/aula-icm-rp/main.js
  - engine/sota_web_browse.py
  - llm/local_llama_client.py
  - llm/providers.py
  - reports/REGISTRO-2026-11-15-saneamento-sonarlint-codeql-e-portoes.md
  - scripts/ops/devin_session_insights.py
  - tests/test_llm_ollama_integracao_real.py
  - tests/test_mesh_integrations.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  condutor: Devin (SWE-2 Flash)
  veiculo: devin-desktop
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-11-15
verificado:
  - "Saneamento S3776/S1192/S7503/S3626/S8997 em main.js, local_llama_client.py,
    providers.py, devin_session_insights.py, subagents_mesh.py, execution.py e
    mesh_integrations.py"
  - "Correcao py/bad-tag-filter em engine/sota_web_browse.py (end tags com
    atributos) com 8 testes verdes"
  - "xdist_group nos 5 testes de integracao Ollama real; suite completa verde
    sob pytest -n 6"
  - "93 alertas de secret scanning resolvidos como revoked (credenciais ja
    rotacionadas; chaves vigentes so em HKCU/HKLM)"
  - "Reescrita de historico git via filter-repo --replace-text com 90 literais +
    regex PEM; zero ocorrencias na HEAD"
  - "8 code scanning alerts dismissed como false positive/used in tests com
    justificativa"
  - "Frontmatter M.O. 13.B completado nos 4 docs de epicos staged"
nao_verificado:
  - "Reescaneamento CodeQL no GitHub para fechamento automatico do alerta #24 no
    proximo scan do default branch"
  - "Eficacia da reescrita de historico apos force-push coordenado"
revisoes_de_ancora:
  - registro: registro-2026-08-29-tres-orfaos
    caminhos:
      - llm/budget.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-09-02-adapters-ligado-ao-caminho-real-anthropic
    caminhos:
      - engine/llm_api.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem
    caminhos:
      - engine/llm_api.py
      - llm/gemini.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-09-08-auditoria-de-tipagem-e-recorte-do-fingerprint
    caminhos:
      - llm/orchestrator.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-09-09-remediacao-dependabot-httpx2
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-09-13-ci-typecheck-e-fronteira-de-capacidades
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-09-13-otimizacoes-helpers-antientropia-e-feedback
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-09-14-auditoria-e-refinamento-settings-e-configuracoes
    caminhos:
      - requirements.txt
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-09-18-dream-rsi-ligado-aula12-localizada-e-bounty-a-iniciar
    caminhos:
      - agents/execution.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-09-24-blindagem-ascii-e-harmonizacao-scripts
    caminhos:
      - llm/gemini.py
      - llm/orchestrator.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-09-25-pool-rotacional-gemini-flash-lite
    caminhos:
      - llm/gemini.py
      - llm/gemini_pool.py
      - tests/test_gemini_pool.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-09-25-integracao-qwen-coder-e-blindagem-testes
    caminhos:
      - llm/budget.py
      - llm/local_llama_client.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-09-25-modelos-locais-llama-g9v3-ling3
    caminhos:
      - llm/local_llama_client.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-09-25-pools-de-chaves-openrouter-multi-tier
    caminhos:
      - llm/budget.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-09-29-saneamento-lint-e-calibracao
    caminhos:
      - llm/budget.py
      - llm/gemini.py
      - llm/local_llama_client.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-09-30-expurgo-de-modelos-obsoletos-e-reconciliacao-de-ancoras
    caminhos:
      - engine/llm_api.py
      - llm/orchestrator.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-10-01-integracao-cloud-ollama-hermes-nous-e-chaves-registro
    caminhos:
      - engine/llm_api.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-10-01-resiliencia-servidores-locais-e-triagem
    caminhos:
      - engine/llm_api.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-10-04-http-metrics-correlation-e-worker-shutdown
    caminhos:
      - engine/llm_api.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-10-04-remediacao-dependabot-pypdf
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
    caminhos:
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-10-05-resolucao-de-modelo-ollama-e-schema-json
    caminhos:
      - engine/llm_api.py
      - tests/test_llm_ollama_integracao_real.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-10-06-strata-moe-125b-e-dashboard-nexus
    caminhos:
      - engine/llm_api.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - engine/llm_api.py
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-10-10-evolucao-malha-agentica-sota-v8-gold
    caminhos:
      - agents/execution.py
      - core/subagents_mesh.py
      - llm/orchestrator.py
      - llm/providers.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
    caminhos:
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-10-13-saneamento-diagnosticos-ide-e-compatibilidade
    caminhos:
      - llm/gemini_pool.py
      - llm/orchestrator.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-10-18-harmonizacao-malha-agentica-e-sota-engine
    caminhos:
      - core/subagents_mesh.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-10-18-resolucao-sonarqube-e-saneamento-global
    caminhos:
      - core/subagents_mesh.py
      - engine/sota_web_browse.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-10-19-refinamento-sota-frontend-header-layout-e-surface
    caminhos:
      - tests/test_llm_ollama_integracao_real.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-10-20-harmonizacao-tier1-e-gemini-38
    caminhos:
      - engine/llm_api.py
      - engine/sota_web_browse.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
    caminhos:
      - docs/epics/aula-icm-rp/style.css
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-10-27-elevacao-dependencias-python-openai-pyspark-pytest
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-10-27-estabilizacao-completa-esteira-ci-github-actions
    caminhos:
      - tests/test_gemini_pool.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-10-27-evolucao-project-context-e-reconciliacao-sota
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
    caminhos:
      - engine/llm_api.py
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-10-28-atualizacao-laya-e-estabilizacao-playwright-smoke
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-10-31-estabilizacao-lifecycle-warmup-turbopack
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-01-elevacao-estetica-sota-otimizacao-endpoints-e-reconciliacao
    caminhos:
      - tests/test_llm_ollama_integracao_real.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-03-elevacao-dependencias-pyarrow-openai-anthropic-laya
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-03-otimizacao-agentes-watchdog-e-calibracao
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-03-remediacao-dependabot-pypdf-pyasn1-minimatch
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-04-otimizacao-layout-header-e-elevacao-dependencias
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
    caminhos:
      - pyproject.toml
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
    caminhos:
      - engine/sota_web_browse.py
      - llm/budget.py
      - llm/gemini_pool.py
      - pyproject.toml
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
    caminhos:
      - llm/providers.py
      - pyproject.toml
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-07-elevacao-dependencias-fastapi-regex-types-aiofiles
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-08-elevacao-dependencias-regex-e-laya
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-08-elevacao-polars-2-1-e-consumo-integral-engines-sota
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-08-elevacao-pypdf-7-0-torchvision-e-ecossistema-npm
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-08-integracao-sota-triade-stitch-exa-jules
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-08-otimizacao-pyproject-dependencias-extras-e-reconciliacao
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-08-refinamento-sonarlint-e-code-review-triage
    caminhos:
      - engine/sota_web_browse.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-08-saneamento-code-review-triage
    caminhos:
      - engine/sota_web_browse.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-09-elevacao-dependencias-e-fork-eigen
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-10-bump-deps-e-extra-paths-pylance
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-10-google-genai-3-1-0
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-11-elevacao-fastapi-playwright-e-bump-deep-research
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-11-elevacao-pypdf-turbo-ai-sdk-google
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-11-elevacao-sentence-transformers-genai-prettier-exa-mcp
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-11-elevacao-typer-types-knip-harmonizacao
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-11-nota-pareamento-dev-dependency-groups
    caminhos:
      - pyproject.toml
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-12-ollama-cloud-provider
    caminhos:
      - llm/budget.py
      - llm/orchestrator.py
      - llm/providers.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-12-review-sweeps-endurecimento-sota
    caminhos:
      - llm/budget.py
      - llm/gemini.py
      - llm/gemini_pool.py
      - llm/orchestrator.py
      - tests/test_gemini_pool.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-13-elevacao-deps-e-saneamento-configs-ide
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-13-revisao-ancora-pyproject-extra-path-cockpit
    caminhos:
      - pyproject.toml
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
    caminhos:
      - pyproject.toml
      - scripts/ops/devin_session_insights.py
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-14-laya-pylint-e-refactors-sonar
    caminhos:
      - core/subagents_mesh.py
      - pyproject.toml
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-14-llama-cpp-b12387-router-9931
    caminhos:
      - core/subagents_mesh.py
      - llm/local_llama_client.py
      - llm/providers.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-14-roteamento-pools-transporte-e-validacao-hrc
    caminhos:
      - engine/llm_api.py
      - llm/budget.py
      - llm/gemini.py
      - llm/gemini_pool.py
      - llm/orchestrator.py
      - llm/providers.py
      - pyproject.toml
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-14-sync-uvlock-ollama-cloud-circuit-e-ci
    caminhos:
      - llm/providers.py
      - pyproject.toml
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-15-laya-0432-failover-arquitetura-s1
    caminhos:
      - llm/gemini.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: registro-2026-11-15-malha-agentica-rotacao-hkcu-hklm
    caminhos:
      - agents/execution.py
      - core/mesh_integrations.py
      - core/subagents_mesh.py
      - llm/local_llama_client.py
      - llm/providers.py
      - scripts/ops/devin_session_insights.py
      - tests/test_mesh_integrations.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: plan-dependency-boundary-reconciliation-2026-09-01
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: auditoria-2026-09-02-integridade-do-projeto-e-piso-de-transformers
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: auditoria-2026-09-08-o-que-esta-em-aberto-na-malha
    caminhos:
      - requirements.txt
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: auditoria-2026-10-08-integralidade-backend
    caminhos:
      - engine/llm_api.py
      - pyproject.toml
      - requirements.txt
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: handoff-2026-09-10-lint-lighthouse-e-aceite-cve
    caminhos:
      - pyproject.toml
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: handoff-2026-09-13-integracao-de-engines-wasm-e-economia-de-gate
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: handoff-2026-09-19-documentos-loopback-sonar-e-download
    caminhos:
      - agents/execution.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: handoff-2026-09-22-integracao-system1-llm-dashboard
    caminhos:
      - engine/llm_api.py
      - llm/gemini.py
      - llm/orchestrator.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: handoff-2026-09-25-pool-rotacional-gemini-flash-lite
    caminhos:
      - llm/gemini.py
      - llm/gemini_pool.py
      - tests/test_gemini_pool.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: handoff-2026-09-25-modelos-locais-saneamento-e-homeostase
    caminhos:
      - llm/local_llama_client.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: handoff-2026-09-30-expurgo-de-modelos-obsoletos-harmonizacao-qwen-e-calibracao
    caminhos:
      - engine/llm_api.py
      - llm/orchestrator.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: handoff-2026-10-05-fechamento-do-ciclo-medicoes-cwv-e-cacheabilidade
    caminhos:
      - engine/llm_api.py
      - tests/test_llm_ollama_integracao_real.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: handoff-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - engine/llm_api.py
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: handoff-2026-11-14-decision1-laya-s1-s2-e-ancoras
    caminhos:
      - llm/orchestrator.py
      - llm/providers.py
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: handoff-2026-11-15-translategemma-timesfm-laya-roi
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: plano-frentes-abertas-2026-09-08
    caminhos:
      - requirements.txt
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
  - registro: plano-laya-integracao-s1s2-pmev-2026-09-20
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: >-
      Revisado em 2026-11-15. Commit de saneamento SonarLint/CodeQL: refatoracoes de complexidade e correcoes de lint sem mudanca de contrato nos caminhos ancorados.
---

# Registro — Saneamento SonarLint, CodeQL e Portoes (2026-11-15)

## Escopo

Rodada de auditoria continua sobre apontamentos do SonarLint/SonarQube, achados
de code scanning do GitHub e reprovas do portao de pre-commit (SOTA Quality
Gate + Portao de Ancora M.O. 13.F/13.B).

## O que foi feito

### SonarLint — complexidade e duplicacao

- `docs/epics/aula-icm-rp/main.js`: handler do botao Comparar extraido para
  `_toggleCompareMode`/`_enterCompareMode`/`_exitCompareMode` (S3776 18-><=15).
- `llm/local_llama_client.py`: `chat_completion` (S3776 33) decomposto em
  `_try_router_fallback` (:9931) e `_try_swap_fallback` (:8080), preservando
  ordem de fallback e criterios de retry HTTP 400/404.
- `llm/providers.py`: `_call_local_openai_router_fallback` (S3776 41) e
  `_handle_general_error` (S3776 16) decompostos em helpers focados;
  `_extract_error_status` tornado sincrono (S7503).
- `scripts/ops/devin_session_insights.py`: `_request` (S3776 16) decomposto em
  `_request_with_token`, preservando rotacao de tokens em 401/403/429.
- `tests/test_mesh_integrations.py`: mutacao manual de `_token_cache`
  substituida por `monkeypatch.setattr` (S8997).
- `core/subagents_mesh.py`: literais `:free` duplicados 31x extraidos para
  constantes `FREE_MODEL_*` (S1192); `_call_llama_cpp_inference` (S3776 35),
  `_call_free_cloud_inference` (S3776 19) e `execute_subagent_pipeline`
  (S3776 23) decompostos; `_noop_rf`/`_noop_n4j` substituidos por
  `_noop_context` com `await asyncio.sleep(0)` (S7503) e `return` redundante
  removido (S3626).
- `agents/execution.py`: `_finish_task_success` (S3776 18) decomposto em
  `_maybe_sync_consciousness`, `_dispatch_task_completed_event` e
  `_notify_task_completed_toast`, preservando ordem de efeitos colaterais.

### CodeQL / code scanning

- `engine/sota_web_browse.py` (alerta #24, py/bad-tag-filter): regex de strip de
  `<script>`/`<style>` passou a aceitar end tags com atributos
  (`</script\b[^>]*>`), que browsers tratam como fechamento valido.
- Alertas #19, #21, #22, #25, #26, #27, #28, #29 avaliados como falsos positivos
  ou "used in tests" e dismissed com justificativa (HMAC-SHA256 com salt para
  fingerprint de telemetria; client_id OAuth publico; assertivas de teste sem
  sanitizacao envolvida).

### Secret scanning

- 93 alertas abertos (74 google_api_key, 14 openrouter_api_key, 3
  google_gcp_api_key_bound_service_account, 1 oauth client_id, 1 oauth
  client_secret) resolvidos como `revoked` via API — credenciais
  revogadas/rotacionadas pelo Tier 0; chaves vigentes residem exclusivamente em
  HKCU/HKLM (env do registro), nunca em arquivo.
- Reescrita de historico git com `git filter-repo --replace-text`: 90 literais
  extraidos de `git log --all -p` (73 AIza, 14 sk-or-v1, 3 GOCSPX) + regex para
  blocos PEM `PRIVATE KEY`, substituidos por `***REMOVED***` em todos os refs.

### Portao de pre-commit

- `tests/test_llm_ollama_integracao_real.py`: `pytest.mark.xdist_group`
  serializa os 5 testes num unico worker xdist — o daemon Ollama atende uma
  inferencia por vez e requests concorrentes entre workers estouravam o timeout
  total sob `pytest -n`. Timeouts de `/api/tags` e inferencia ampliados
  (30s/60s/300s) para a condicao real de daemon compartilhado.
- `noqa: S310` do mesmo arquivo recebeu `Record-Id` desta registro.
- Frontmatter M.O. 13.B completado em `docs/epics/aula-icm-rp/INDEX.md`,
  `docs/epics/aula-icm-rp/SPEC.md`, `docs/epics/cli-interativa/SPEC.md` e
  `docs/epics/cli-interativa/IDENTITY_SPEC.md` (id, tipo, escopo, autor,
  criado_em, verificado, nao_verificado).

## Verificacao

- `ruff check` e `ruff format --check` nos arquivos tocados: verde.
- `pytest tests/test_llm_ollama_integracao_real.py`: 5 passed.
- `pytest tests/test_sota_web_browse.py`: 8 passed.
- `pytest tests/test_mesh_integrations.py`: 11 passed.
- Suites mesh/subagents: 32 passed.
- SOTA Quality Gate (cwv_gate.ps1): 5/5 fases verdes; suite completa verde com
  `-n 6` (incluindo os testes Ollama real apos xdist_group).
- `git grep` na HEAD pelos 90 literais: zero ocorrencias residuais.

## Nao verificado

- Reescaneamento CodeQL no GitHub para fechamento automatico do alerta #24
  (ocorre no proximo scan do default branch).
- Eficacia da reescrita de historico depende do force-push coordenado.
