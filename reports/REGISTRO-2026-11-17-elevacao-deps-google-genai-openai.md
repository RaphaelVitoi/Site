---
id: registro-2026-11-17-elevacao-deps-google-genai-openai
tipo: registro
escopo: "Site -- elevacao de pisos google-genai 3.4.0 e openai 3.52.0 em pyproject.toml/requirements.txt/uv.lock"
ecossistema: nexus-sota
autor: "Devin (SWE-2 Flash) <158243242+devin-ai-integration[bot]@users.noreply.github.com>"
criado_em: "2026-11-17T07:23:18-03:00"
atualizado_em: "2026-11-17T07:23:18-03:00"
commit: HEAD
classes:
  - interno
  - medido
  - governanca
  - registro
  - dependencias
  - uv
caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  - reports/REGISTRO-2026-11-17-elevacao-deps-google-genai-openai.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  condutor: Devin (SWE-2 Flash)
  veiculo: devin-desktop
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-11-17
verificado:
  - "uv lock re-resolvido: google-genai 3.3.0->3.4.0, openai 3.51.0->3.52.0 (269 pacotes, sem conflitos)"
  - "uv sync --all-extras aplicado: somente os dois pacotes atualizados, nenhum extra removido"
  - "uv pip check: 241 pacotes compativeis"
  - "Smoke test de imports google.genai 3.4.0 e openai 3.52.0: OK"
nao_verificado:
  - "Suite pytest completa nao rodada neste bump; suites dos commits anteriores verdes e diff restrito a pisos de dependencia"
revisoes_de_ancora:
  - registro: auditoria-2026-09-02-integridade-do-projeto-e-piso-de-transformers
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: auditoria-2026-09-08-o-que-esta-em-aberto-na-malha
    caminhos:
      - requirements.txt
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: auditoria-2026-10-08-integralidade-backend
    caminhos:
      - pyproject.toml
      - requirements.txt
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: handoff-2026-08-31-saneamento-linters-e-estabilizacao-core-e-api
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: handoff-2026-09-10-lint-lighthouse-e-aceite-cve
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: handoff-2026-09-13-integracao-de-engines-wasm-e-economia-de-gate
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: handoff-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: handoff-2026-11-15-translategemma-timesfm-laya-roi
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: plano-frentes-abertas-2026-09-08
    caminhos:
      - requirements.txt
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: plano-laya-integracao-s1s2-pmev-2026-09-20
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-09-09-remediacao-dependabot-httpx2
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-09-13-ci-typecheck-e-fronteira-de-capacidades
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-09-13-otimizacoes-helpers-antientropia-e-feedback
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-09-14-auditoria-e-refinamento-settings-e-configuracoes
    caminhos:
      - requirements.txt
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-10-04-remediacao-dependabot-pypdf
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
    caminhos:
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
    caminhos:
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-10-27-elevacao-dependencias-python-openai-pyspark-pytest
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-10-27-evolucao-project-context-e-reconciliacao-sota
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
    caminhos:
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-10-28-atualizacao-laya-e-estabilizacao-playwright-smoke
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-10-31-estabilizacao-lifecycle-warmup-turbopack
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-03-elevacao-dependencias-pyarrow-openai-anthropic-laya
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-03-otimizacao-agentes-watchdog-e-calibracao
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-03-remediacao-dependabot-pypdf-pyasn1-minimatch
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-04-otimizacao-layout-header-e-elevacao-dependencias
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-07-elevacao-dependencias-fastapi-regex-types-aiofiles
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-08-elevacao-dependencias-regex-e-laya
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-08-elevacao-polars-2-1-e-consumo-integral-engines-sota
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-08-elevacao-pypdf-7-0-torchvision-e-ecossistema-npm
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-08-integracao-sota-triade-stitch-exa-jules
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-08-otimizacao-pyproject-dependencias-extras-e-reconciliacao
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-09-elevacao-dependencias-e-fork-eigen
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-10-bump-deps-e-extra-paths-pylance
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-10-google-genai-3-1-0
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-11-elevacao-fastapi-playwright-e-bump-deep-research
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-11-elevacao-pypdf-turbo-ai-sdk-google
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-11-elevacao-sentence-transformers-genai-prettier-exa-mcp
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-11-elevacao-typer-types-knip-harmonizacao
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-11-nota-pareamento-dev-dependency-groups
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-13-elevacao-deps-e-saneamento-configs-ide
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-13-revisao-ancora-pyproject-extra-path-cockpit
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-14-laya-pylint-e-refactors-sonar
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-14-roteamento-pools-transporte-e-validacao-hrc
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-14-sync-uvlock-ollama-cloud-circuit-e-ci
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-16-elevacao-deps-anthropic-laya-accelerate-e-deps-sync
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-17. Bump de pisos google-genai>=3.4.0 e openai>=3.52.0 em pyproject.toml/requirements.txt/uv.lock; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
---

# Elevacao de dependencias google-genai/openai

## Contexto

Diagnostico `uv-pypi` apontou `google-genai` (latest 3.4.0) e `openai`
(latest 3.52.0) desatualizados. Pisos elevados em `pyproject.toml` e
`requirements.txt`; `uv.lock` re-resolvido e `uv sync --all-extras` aplicado
sem remocao de extras.

## Verificacao

- `uv lock`: 269 pacotes, sem conflitos de constraint (incluindo o teto
  `tenacity<9.2.0` imposto pelo google-genai).
- `uv pip check`: 241 pacotes compativeis.
- Imports `google.genai` 3.4.0 e `openai` 3.52.0 confirmados no venv.
