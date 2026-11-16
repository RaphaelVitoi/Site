---
id: registro-2026-11-16-elevacao-deps-anthropic-laya-accelerate-e-deps-sync
tipo: registro
escopo: "Site -- elevacao de pisos anthropic 2.9.0, laya 0.4.35 e accelerate 1.16.0 em pyproject.toml/requirements.txt/uv.lock, reinstalacao dos extras opcionais via uv sync --all-extras e endurecimento do script deps:sync (package.json)"
ecossistema: nexus-sota
autor: "Devin (SWE-2 Flash) <158243242+devin-ai-integration[bot]@users.noreply.github.com>"
criado_em: "2026-11-16T19:08:49-03:00"
atualizado_em: "2026-11-16T19:08:49-03:00"
commit: HEAD
classes:
  - interno
  - medido
  - governanca
  - registro
  - dependencias
  - uv
caminhos:
  - package.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  - reports/REGISTRO-2026-11-16-elevacao-deps-anthropic-laya-accelerate-e-deps-sync.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  condutor: Devin (SWE-2 Flash)
  veiculo: devin-desktop
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-11-16
verificado:
  - "uv lock re-resolvido: accelerate 1.15.0->1.16.0, anthropic 2.8.0->2.9.0, laya 0.4.34->0.4.35 (269 pacotes, sem conflitos)"
  - "uv sync --all-extras reinstalou llvmlite, numba, polars, prometheus-client, torchvision e exporters OTLP removidos pelo sync sem extras"
  - "uv lock --check exit 0 e uv pip check: 241 pacotes compativeis"
  - "Smoke test de imports (anthropic, laya, accelerate, numba, polars, prometheus_client, torchvision, OTLP http exporter): OK"
  - "Suite SOTA completa verde sob pytest -n 2 (SOTA_SUITE_WORKERS=2) apos flakes de CDP sob -n 6"
  - "deps:sync ajustado para uv sync --all-groups --all-extras"
nao_verificado:
  - "Estabilidade da suite sob pytest -n 6: test_o_axe_confirma_a_hierarquia_no_dom e test_captura_a_delecao_e_nomeia_suspeitos falharam por flake de infraestrutura CDP/PS e passaram isolados"
revisoes_de_ancora:
  - registro: auditoria-2026-10-08-integralidade-backend
    caminhos:
      - pyproject.toml
      - requirements.txt
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: handoff-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
    caminhos:
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: handoff-2026-11-15-translategemma-timesfm-laya-roi
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-10-04-remediacao-dependabot-pypdf
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
    caminhos:
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
    caminhos:
      - package.json
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
    caminhos:
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota
    caminhos:
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-10-27-elevacao-dependencias-python-openai-pyspark-pytest
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-10-27-evolucao-project-context-e-reconciliacao-sota
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-10-27-harmonizacao-dependencias-ci-e-wasm
    caminhos:
      - package.json
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
    caminhos:
      - package.json
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-10-28-atualizacao-laya-e-estabilizacao-playwright-smoke
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-10-31-estabilizacao-lifecycle-warmup-turbopack
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules
    caminhos:
      - package.json
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-03-elevacao-dependencias-pyarrow-openai-anthropic-laya
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-03-otimizacao-agentes-watchdog-e-calibracao
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-03-remediacao-dependabot-pypdf-pyasn1-minimatch
    caminhos:
      - package.json
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-04-otimizacao-layout-header-e-elevacao-dependencias
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
    caminhos:
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-07-elevacao-dependencias-fastapi-regex-types-aiofiles
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-08-elevacao-dependencias-regex-e-laya
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-08-refinamento-sonarlint-e-code-review-triage
    caminhos:
      - package.json
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-08-saneamento-code-review-triage
    caminhos:
      - package.json
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-09-elevacao-dependencias-e-fork-eigen
    caminhos:
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-10-ai-sdk-google-4-0-117-ai-7-0-169
    caminhos:
      - package.json
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-10-bump-deps-e-extra-paths-pylance
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-10-google-genai-3-1-0
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-11-elevacao-fastapi-playwright-e-bump-deep-research
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-11-elevacao-pypdf-turbo-ai-sdk-google
    caminhos:
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-11-elevacao-sentence-transformers-genai-prettier-exa-mcp
    caminhos:
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-11-elevacao-typer-types-knip-harmonizacao
    caminhos:
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-11-nota-pareamento-dev-dependency-groups
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-12-review-sweeps-endurecimento-sota
    caminhos:
      - package.json
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-13-elevacao-deps-e-saneamento-configs-ide
    caminhos:
      - package.json
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-13-revisao-ancora-pyproject-extra-path-cockpit
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
    caminhos:
      - package.json
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-14-laya-pylint-e-refactors-sonar
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-14-roteamento-pools-transporte-e-validacao-hrc
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
  - registro: registro-2026-11-14-sync-uvlock-ollama-cloud-circuit-e-ci
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-16. Bump de pisos de dependencias (anthropic>=2.9.0, laya>=0.4.35, accelerate>=1.16.0) e endurecimento do script deps:sync para uv sync --all-groups --all-extras; pisos apenas sobem, sem mudanca de contrato nos caminhos ancorados."
---

# Elevacao de dependencias anthropic/laya/accelerate e blindagem do deps:sync

## Contexto

Diagnostico `uv-pypi` apontou tres pisos desatualizados. O bump inicial foi
acompanhado de `uv sync` simples, que removeu nove pacotes dos extras
opcionais (`pmev`, `monitoring`, `vision`, `all`) por nao fazer parte do
conjunto base+dev. Incidente identico ja documentado em
`REGISTRO-2026-11-13-elevacao-deps-e-saneamento-configs-ide.md`.

## Mudancas

- `pyproject.toml`: `anthropic>=2.9.0`, `laya>=0.4.35`, `accelerate>=1.16.0`.
- `requirements.txt`: mesmos pisos alinhados (`laya` subiu de `>=0.4.31`).
- `uv.lock`: re-resolvido pelo `uv lock` (269 pacotes).
- `package.json`: `deps:sync` passa a `uv sync --all-groups --all-extras`,
  cobrindo os dois canais PEP 735/735 (grupos e extras pip) para que syncs
  futuros nao removam os extras.

## Flakes observados no portao

Duas execucoes da suite falharam em testes dependentes de infraestrutura viva
(`test_o_axe_confirma_a_hierarquia_no_dom` -- sonda CDP/node com stdout vazio
sob `-n 6`; `test_captura_a_delecao_e_nomeia_suspeitos` -- sentinela PowerShell
com timing). Ambos passam isolados e a suite completa passou verde com
`SOTA_SUITE_WORKERS=2`. Nao relacionados ao diff de dependencias.
