---
id: registro-2026-11-09-elevacao-dependencias-e-fork-eigen
tipo: registro
escopo: Site -- elevacao dependencias regex 2026.11.9, ai 7.0.166, lastro diario e fork eigen spbench
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-11-09T00:48:00-03:00'
atualizado_em: '2026-11-09T00:48:00-03:00'
commit: HEAD
classes:
  - interno
  - medido
  - governanca
  - registro
  - dependencias
  - backend
verificado:
  - 'Elevacao de regex para >=2026.11.9 no pyproject.toml e requirements.txt'
  - 'Elevacao de ai para ^7.0.166 no package.json e package-lock.json'
  - 'Criacao e envio do fork eigen (https://github.com/RaphaelVitoi/eigen.git) com branch fix/spbench-dtd-pcdata'
  - 'Geracao do lastro diario de calibracao em reports/agent-calibration/daily/2026-11-09.json'
  - 'Execucao dos testes e portao de integridade SOTA aprovados'
nao_verificado:
  - 'Execucao em producao conteinerizada sob Cloud Run / Docker'
config_medida:
  congelada_em: '2026-11-09'
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data_das_medicoes: '2026-11-09'
  toolchain: uv lock + npm install + record_gate.py
  python: 3.14.9
  so: Windows
caminhos:
  - .gitmodules
  - core/vendor/eigen
  - package-lock.json
  - package.json
  - pyproject.toml
  - reports/agent-calibration/daily/2026-11-09.json
  - reports/REGISTRO-2026-11-09-elevacao-dependencias-e-fork-eigen.md
  - requirements.txt
  - uv.lock
revisoes_de_ancora:
  - registro: plan-dependency-boundary-reconciliation-2026-09-01
    caminhos:
    - pyproject.toml
    - requirements.txt
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: relatorio-fusao-cerebro-claude-quality-gate-2026-09-01
    caminhos:
    - package-lock.json
    - package.json
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: auditoria-cwv-lighthouse-2026-09-01
    caminhos:
    - package-lock.json
    - package.json
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: auditoria-2026-09-02-integridade-do-projeto-e-piso-de-transformers
    caminhos:
    - pyproject.toml
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: auditoria-2026-09-08-o-que-esta-em-aberto-na-malha
    caminhos:
    - requirements.txt
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: auditoria-2026-10-08-integralidade-backend
    caminhos:
    - pyproject.toml
    - requirements.txt
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: handoff-2026-08-29-governanca-8tiers-vulnerabilidades-subagents
    caminhos:
    - package.json
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
    caminhos:
    - package.json
    - pyproject.toml
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: handoff-2026-09-10-lint-lighthouse-e-aceite-cve
    caminhos:
    - pyproject.toml
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: handoff-2026-09-13-integracao-de-engines-wasm-e-economia-de-gate
    caminhos:
    - pyproject.toml
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: handoff-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
    - package-lock.json
    - pyproject.toml
    - requirements.txt
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
    caminhos:
    - package-lock.json
    - package.json
    - pyproject.toml
    - requirements.txt
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: plano-frentes-abertas-2026-09-08
    caminhos:
    - requirements.txt
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: plano-laya-integracao-s1s2-pmev-2026-09-20
    caminhos:
    - pyproject.toml
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-09-07-padronizacao-sistemica-markdownlint
    caminhos:
    - package.json
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem
    caminhos:
    - package-lock.json
    - package.json
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-09-09-actionlint-e-a-fronteira-do-submodulo
    caminhos:
    - package.json
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-09-09-prisma-generate-e-o-typecheck-do-ci
    caminhos:
    - package.json
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-09-09-remediacao-dependabot-httpx2
    caminhos:
    - pyproject.toml
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-09-10-importacao-visivel-hh-hrc
    caminhos:
    - package-lock.json
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-09-10-publicacao-inputs-mtt
    caminhos:
    - package-lock.json
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-09-13-ci-typecheck-e-fronteira-de-capacidades
    caminhos:
    - pyproject.toml
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-09-13-otimizacoes-helpers-antientropia-e-feedback
    caminhos:
    - package-lock.json
    - package.json
    - pyproject.toml
    - requirements.txt
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-09-14-auditoria-e-refinamento-settings-e-configuracoes
    caminhos:
    - package-lock.json
    - package.json
    - requirements.txt
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-09-14-correcoes-pos-auditoria-handoff-tier-e-dependencias
    caminhos:
    - package-lock.json
    - package.json
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-09-18-decisoes-delegadas-sobre-as-pendencias
    caminhos:
    - package-lock.json
    - package.json
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-10-04-remediacao-dependabot-pypdf
    caminhos:
    - pyproject.toml
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
    caminhos:
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
    - package-lock.json
    - pyproject.toml
    - requirements.txt
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
    caminhos:
    - package-lock.json
    - package.json
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
    caminhos:
    - pyproject.toml
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
    caminhos:
    - pyproject.toml
    - requirements.txt
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
    caminhos:
    - package-lock.json
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
    caminhos:
    - package-lock.json
    - package.json
    - pyproject.toml
    - requirements.txt
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota
    caminhos:
    - package.json
    - pyproject.toml
    - requirements.txt
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-10-27-elevacao-dependencias-python-openai-pyspark-pytest
    caminhos:
    - pyproject.toml
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-10-27-evolucao-project-context-e-reconciliacao-sota
    caminhos:
    - pyproject.toml
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-10-27-harmonizacao-dependencias-ci-e-wasm
    caminhos:
    - package-lock.json
    - package.json
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-10-27-harmonizacao-dependencias-katex-e-ci
    caminhos:
    - package-lock.json
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
    caminhos:
    - package-lock.json
    - package.json
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-10-28-atualizacao-laya-e-estabilizacao-playwright-smoke
    caminhos:
    - pyproject.toml
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
    caminhos:
    - pyproject.toml
    - requirements.txt
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-10-31-estabilizacao-lifecycle-warmup-turbopack
    caminhos:
    - pyproject.toml
    - requirements.txt
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules
    caminhos:
    - package-lock.json
    - package.json
    - pyproject.toml
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-11-03-elevacao-dependencias-pyarrow-openai-anthropic-laya
    caminhos:
    - pyproject.toml
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-11-03-otimizacao-agentes-watchdog-e-calibracao
    caminhos:
    - pyproject.toml
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-11-03-remediacao-dependabot-pypdf-pyasn1-minimatch
    caminhos:
    - package-lock.json
    - package.json
    - pyproject.toml
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-11-04-otimizacao-layout-header-e-elevacao-dependencias
    caminhos:
    - pyproject.toml
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
    caminhos:
    - package-lock.json
    - package.json
    - pyproject.toml
    - requirements.txt
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
    caminhos:
    - package-lock.json
    - package.json
    - pyproject.toml
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
    caminhos:
    - pyproject.toml
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-11-08-elevacao-dependencias-regex-e-laya
    caminhos:
    - pyproject.toml
    - requirements.txt
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-11-08-elevacao-polars-2-1-e-consumo-integral-engines-sota
    caminhos:
    - pyproject.toml
    - requirements.txt
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-11-08-elevacao-pypdf-7-0-torchvision-e-ecossistema-npm
    caminhos:
    - package-lock.json
    - package.json
    - pyproject.toml
    - requirements.txt
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-11-08-harmonizacao-r-4-6-1-jules-e-saneamento-ancoras
    caminhos:
    - .gitmodules
    - package-lock.json
    - package.json
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-11-08-otimizacao-pyproject-dependencias-extras-e-reconciliacao
    caminhos:
    - pyproject.toml
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: relatorio-2026-08-29-analise-integral-ecossistema-sota-v8-gold
    caminhos:
    - package.json
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: relatorio-2026-08-29-impacto-quantitativo-qualitativo-sota-v8-gold
    caminhos:
    - package.json
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166),
      lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench
      (#PCDATA).'
  - registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
    caminhos:
    - pyproject.toml
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166), lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench (#PCDATA).'
  - registro: registro-2026-11-07-elevacao-dependencias-fastapi-regex-types-aiofiles
    caminhos:
    - pyproject.toml
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166), lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench (#PCDATA).'
  - registro: registro-2026-11-08-integracao-sota-triade-stitch-exa-jules
    caminhos:
    - pyproject.toml
    - requirements.txt
    - uv.lock
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166), lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench (#PCDATA).'
  - registro: registro-2026-11-08-refinamento-sonarlint-e-code-review-triage
    caminhos:
    - package.json
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166), lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench (#PCDATA).'
  - registro: registro-2026-11-08-saneamento-code-review-triage
    caminhos:
    - package.json
    parecer: 'Reconciliacao em 2026-11-09: elevacao de regex (2026.11.9) e ai (7.0.166), lastro diario 2026-11-09 e integracao do fork eigen no submodule com fix spbench (#PCDATA).'

---

# Registro: Elevacao de Dependencias e Integracao Fork Eigen

## 1. Contexto e Motivacao

1. **Dependencias Python & Node:** Atualizacao cirurgica de 
egex>=2026.11.9 e i@^7.0.166.
2. **Saude da Malha:** Criacao do lastro diario deterministico de calibracao em 
eports/agent-calibration/daily/2026-11-09.json.
3. **Submodulo Eigen & Spbench:** Publicacao do fork RaphaelVitoi/eigen no GitHub com a correcao de validacao DTD de ench/spbench/spbench.dtd (#PCDATA), ancorando o submodulo no fork oficial.

## 2. Acoes Executadas

- Elevacao de pacotes e sincronizacao de lockfiles (uv.lock e package-lock.json).
- Adicao e push remoto do fork https://github.com/RaphaelVitoi/eigen.git na branch ix/spbench-dtd-pcdata.
- Reconciliacao formal de 58 ancoras historicas conforme M.O. 13.F.
