---
id: registro-2026-11-08-elevacao-pypdf-7-0-torchvision-e-ecossistema-npm
tipo: registro
escopo: Site -- elevacao de pypdf para 7.0.0, atualizacao de torchvision para 0.29.2
  e modernizacao do ecossistema npm (concurrently, knip, markdownlint-cli, @ai-sdk/google,
  ai)
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-11-08T12:28:00-03:00'
atualizado_em: '2026-11-08T12:28:00-03:00'
commit: 77734fa9
classes:
  - interno
  - medido
  - governanca
  - registro
  - dependencias
  - npm
  - pypdf
  - torchvision
verificado:
  - 'Auditoria e esclarecimento dos alertas no pyproject.toml: pyarrow (26.0.1), regex
    (2026.11.7), matplotlib (3.11.2), pyright (1.1.414), cmake (4.4.4) e ninja (1.13.2)
    ja estao rigorosamente no apice das releases publicadas no PyPI'
  - Elevacao do piso de pypdf para >=7.0.0,<8.0.0 no pyproject.toml e requirements.txt,
    com resolucao de pypdf 7.0.0 no uv.lock
  - Alinhamento de torchvision para >=0.29.2 no pyproject.toml (grupos vision e all)
  - 'Elevacao de pacotes npm no package.json e frontend/package.json: concurrently
    10.0.7, knip ^6.44.2, markdownlint-cli ^0.50.0, @ai-sdk/google ^4.0.114 e ai ^7.0.165'
  - Sincronizacao limpa do package-lock.json e validacao de zero erros em typecheck
    (tsc), eslint e jest (111 test suites passed)
  - Reconciliacao formal de 60 ancoras historicas do corpus
nao_verificado:
  - Execucao de testes em plataformas legadas Linux / Python 3.14.6
config_medida:
  congelada_em: '2026-11-08'
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data_das_medicoes: '2026-11-08'
  toolchain: npm install + uv lock + jest + tsc + record_gate.py
  python: 3.14.9
  so: Windows
caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  - pyproject.toml
  - reports/REGISTRO-2026-11-08-elevacao-pypdf-7-0-torchvision-e-ecossistema-npm.md
  - requirements.txt
  - uv.lock
revisoes_de_ancora:
  - registro: plan-dependency-boundary-reconciliation-2026-09-01
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: relatorio-fusao-cerebro-claude-quality-gate-2026-09-01
    caminhos:
      - package-lock.json
      - package.json
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: auditoria-cwv-lighthouse-2026-09-01
    caminhos:
      - package-lock.json
      - package.json
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: auditoria-2026-09-02-integridade-do-projeto-e-piso-de-transformers
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: auditoria-2026-09-08-o-que-esta-em-aberto-na-malha
    caminhos:
      - requirements.txt
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: auditoria-2026-10-08-integralidade-backend
    caminhos:
      - pyproject.toml
      - requirements.txt
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: handoff-2026-09-10-lint-lighthouse-e-aceite-cve
    caminhos:
      - pyproject.toml
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: handoff-2026-09-13-integracao-de-engines-wasm-e-economia-de-gate
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: handoff-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - package-lock.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: plano-frentes-abertas-2026-09-08
    caminhos:
      - requirements.txt
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: plano-laya-integracao-s1s2-pmev-2026-09-20
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-09-02-fast-uri-alto-e-contrato-de-evidencia-pmev
    caminhos:
      - package-lock.json
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-09-07-padronizacao-sistemica-markdownlint
    caminhos:
      - package.json
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-09-09-actionlint-e-a-fronteira-do-submodulo
    caminhos:
      - package.json
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-09-09-prisma-generate-e-o-typecheck-do-ci
    caminhos:
      - package.json
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-09-09-remediacao-dependabot-httpx2
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-09-10-importacao-visivel-hh-hrc
    caminhos:
      - frontend/package.json
      - package-lock.json
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-09-10-publicacao-inputs-mtt
    caminhos:
      - frontend/package.json
      - package-lock.json
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-09-12-teoria-canonica-chen-janda-e-convergencia-cfr
    caminhos:
      - frontend/package.json
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-09-13-ci-typecheck-e-fronteira-de-capacidades
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-09-13-otimizacoes-helpers-antientropia-e-feedback
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-09-14-auditoria-e-refinamento-settings-e-configuracoes
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
      - requirements.txt
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-09-14-correcoes-pos-auditoria-handoff-tier-e-dependencias
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-09-18-decisoes-delegadas-sobre-as-pendencias
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: 2026-09-22-auditoria-frontend-4-itens
    caminhos:
      - frontend/package.json
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-10-04-remediacao-dependabot-pypdf
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
    caminhos:
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-10-05-atlas-cenarios-acessibilidade-e-design-system
    caminhos:
      - frontend/package.json
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - package-lock.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
    caminhos:
      - frontend/package.json
      - package-lock.json
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota
    caminhos:
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-10-27-elevacao-dependencias-python-openai-pyspark-pytest
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-10-27-evolucao-project-context-e-reconciliacao-sota
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-10-27-harmonizacao-dependencias-ci-e-wasm
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-10-27-harmonizacao-dependencias-katex-e-ci
    caminhos:
      - frontend/package.json
      - package-lock.json
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-10-28-atualizacao-laya-e-estabilizacao-playwright-smoke
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-10-31-estabilizacao-lifecycle-warmup-turbopack
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-11-03-elevacao-dependencias-pyarrow-openai-anthropic-laya
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-11-03-otimizacao-agentes-watchdog-e-calibracao
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-11-03-remediacao-dependabot-pypdf-pyasn1-minimatch
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-11-04-otimizacao-layout-header-e-elevacao-dependencias
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
    caminhos:
      - pyproject.toml
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-11-07-elevacao-dependencias-fastapi-regex-types-aiofiles
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-11-08-elevacao-polars-2-1-e-consumo-integral-engines-sota
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-11-08-integracao-sota-triade-stitch-exa-jules
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-11-08-otimizacao-pyproject-dependencias-extras-e-reconciliacao
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-11-08-refinamento-sonarlint-e-code-review-triage
    caminhos:
      - frontend/package.json
      - package.json
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
  - registro: registro-2026-11-08-saneamento-code-review-triage
    caminhos:
      - frontend/package.json
      - package.json
    parecer: 'Reconciliacao em 2026-11-08: elevacao de pypdf para 7.0.0, atualizacao
      de torchvision para 0.29.2 e elevacao de pacotes npm (concurrently, knip, markdownlint,
      ai) sem quebra de integridade.'
---

# Registro 2026-11-08: Elevacao do pypdf 7.0.0, torchvision 0.29.2 e Modernizacao do Ecossistema NPM (M.O. 13.F)

## 1. Auditoria de Diagnostico: Indicacoes de Versao no pyproject.toml
- As dependencias `pyarrow>=26.0.1`, `regex>=2026.11.7`, `matplotlib>=3.11.2`, `pyright>=1.1.414`, `cmake>=4.4.4` e `ninja>=1.13.2` foram verificadas diretamente contra a API oficial do PyPI (`https://pypi.org/pypi/<pkg>/json`).
- **Constatacao Tecnica:** Todas as seis dependencias ja estao na versao maxima e mais recente disponivel no PyPI. Extensoes de IDE (como Version Lens) exibem a indicacao 'no versions found' (ou 'no newer version found') justamente porque a consulta por versoes estritamente superiores a versao mais recente retorna conjunto vazio no registry upstream.
- **torchvision:** Atualizado de `>=0.20.0` para `>=0.29.2` (nos grupos `vision` e `all`), correspondendo a versao mais recente instalada e compativel com o PyTorch no ecossistema.

## 2. Elevacao de Ingestao de Documentos (pypdf 7.0.0)
- O limitador historico `<7.0.0` foi superado com a publicacao oficial da versao `7.0.0`.
- Elevados os pisos em `pyproject.toml` e `requirements.txt` para `pypdf>=7.0.0,<8.0.0`.
- `uv.lock` atualizado via `uv lock --upgrade-package pypdf` (v6.21.4 -> v7.0.0).

## 3. Modernizacao do Ecossistema NPM
- `concurrently`: `10.0.6` -> `10.0.7`
- `knip`: `^6.44.1` -> `^6.44.2`
- `markdownlint-cli`: `^0.49.1` -> `^0.50.0` (em `package.json` devDependencies/overrides e `frontend/package.json` overrides)
- `@ai-sdk/google`: `^4.0.112` -> `^4.0.114`
- `ai`: `^7.0.163` -> `^7.0.165`
- `package-lock.json` sincronizado com sucesso via `npm install`.

## 4. Validacao Integral
- `tsc --build`: 100% aprovado (zero erros de tipagem).
- `eslint .`: 100% aprovado.
- `jest`: 111 suites aprovadas (739 testes verdes).
- `pytest`: 5/5 testes em `test_pmev_engines_consumption.py` verdes.
