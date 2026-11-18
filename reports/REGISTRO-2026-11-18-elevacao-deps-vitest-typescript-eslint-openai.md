---
id: registro-2026-11-18-elevacao-deps-vitest-typescript-eslint-openai
tipo: registro
escopo:
  "Site -- Elevacao de deps npm (vitest ^5.1.1, typescript-eslint ^8.73.0), sync
  openai>=3.55.0 e gitlink exa-mcp-server"
ecossistema: nexus-sota
autor: "Gemini 4 Hydrogen <noreply@google.com>"
criado_em: "2026-11-18T07:38:00-03:00"
atualizado_em: "2026-11-18T07:38:00-03:00"
commit: HEAD
classes:
  - interno
  - governanca
  - registro
caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  - pyproject.toml
  - reports/2026-09-01_Fusion_Quality_Gate_Report.md
  - reports/REGISTRO-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem.md
  - reports/REGISTRO-2026-09-09-actionlint-e-a-fronteira-do-submodulo.md
  - reports/REGISTRO-2026-09-09-prisma-generate-e-o-typecheck-do-ci.md
  - reports/REGISTRO-2026-09-10-importacao-visivel-hh-hrc.md
  - reports/REGISTRO-2026-09-10-publicacao-inputs-mtt.md
  - reports/REGISTRO-2026-09-12-teoria-canonica-chen-janda-e-convergencia-cfr.md
  - reports/REGISTRO-2026-09-14-correcoes-pos-auditoria-handoff-tier-e-dependencias.md
  - reports/REGISTRO-2026-09-18-decisoes-delegadas-sobre-as-pendencias.md
  - reports/REGISTRO-2026-11-08-harmonizacao-r-4-6-1-jules-e-saneamento-ancoras.md
  - reports/REGISTRO-2026-11-18-elevacao-deps-vitest-typescript-eslint-openai.md
  - requirements.txt
  - skills/exa-mcp-server
  - uv.lock
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  python: "3.14.9"
  so: Windows
  condutor: "Gemini 4 Hydrogen"
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-11-18
verificado:
  - "npm install --force executado (vitest 5.1.1, typescript-eslint 8.73.0,
    Prisma Client v7.10.1 regenerado)"
  - "npm run lint (ESLint 10.14.0), npm run typecheck (TS 7.0.2) e npx vitest
    run (21 arquivos, 195 testes) aprovados"
  - "npm run python:lint (ruff), npm run python:typecheck (pyright 0 erros) e uv
    run --no-sync pip check aprovados"
  - "tests/test_requirements_sync.py e tests/test_patches_skills.py aprovados
    (9/9)"
  - "npm run sota:audit aprovado com 0 erros e 2 warnings de cobertura CDP
    (localhost:3000 sem page load)"
nao_verificado:
  - "next-auth mantido em 5.0.0-beta.32 (latest 4.24.15 seria downgrade) e
    prisma mantido em 7.10.1 (8.0.0-rc.34 e RC sem par @prisma/client)"
  - "CWV LCP/CLS/axe runtime em localhost:3000 nao medidos nesta entrega
    exclusivamente de manifests/submodulo"
referencias_nao_resolviveis: []
revisoes_de_ancora:
  - registro: plan-dependency-boundary-reconciliation-2026-09-01
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: auditoria-cwv-lighthouse-2026-09-01
    caminhos:
      - package-lock.json
      - package.json
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: auditoria-2026-09-02-integridade-do-projeto-e-piso-de-transformers
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: auditoria-2026-09-08-o-que-esta-em-aberto-na-malha
    caminhos:
      - requirements.txt
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: auditoria-2026-10-08-integralidade-backend
    caminhos:
      - pyproject.toml
      - requirements.txt
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: handoff-2026-09-10-lint-lighthouse-e-aceite-cve
    caminhos:
      - pyproject.toml
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: handoff-2026-09-13-integracao-de-engines-wasm-e-economia-de-gate
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: handoff-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - package-lock.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: handoff-2026-11-15-translategemma-timesfm-laya-roi
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: plano-frentes-abertas-2026-09-08
    caminhos:
      - requirements.txt
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: plano-laya-integracao-s1s2-pmev-2026-09-20
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-09-02-fast-uri-alto-e-contrato-de-evidencia-pmev
    caminhos:
      - package-lock.json
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-09-07-padronizacao-sistemica-markdownlint
    caminhos:
      - package.json
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-09-09-remediacao-dependabot-httpx2
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-09-13-ci-typecheck-e-fronteira-de-capacidades
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-09-13-otimizacoes-helpers-antientropia-e-feedback
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-09-14-auditoria-e-refinamento-settings-e-configuracoes
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
      - requirements.txt
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: 2026-09-22-auditoria-frontend-4-itens
    caminhos:
      - frontend/package.json
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-10-04-remediacao-dependabot-pypdf
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
    caminhos:
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-10-05-atlas-cenarios-acessibilidade-e-design-system
    caminhos:
      - frontend/package.json
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - package-lock.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-10-19-saneamento-warnings-skills-e-memoria-agentica
    caminhos:
      - skills/exa-mcp-server
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
    caminhos:
      - frontend/package.json
      - package-lock.json
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota
    caminhos:
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-10-27-elevacao-dependencias-python-openai-pyspark-pytest
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-10-27-evolucao-project-context-e-reconciliacao-sota
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-10-27-harmonizacao-dependencias-ci-e-wasm
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-10-27-harmonizacao-dependencias-katex-e-ci
    caminhos:
      - frontend/package.json
      - package-lock.json
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-10-28-atualizacao-laya-e-estabilizacao-playwright-smoke
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-10-31-estabilizacao-lifecycle-warmup-turbopack
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-03-elevacao-dependencias-pyarrow-openai-anthropic-laya
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-03-otimizacao-agentes-watchdog-e-calibracao
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-03-remediacao-dependabot-pypdf-pyasn1-minimatch
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-04-otimizacao-layout-header-e-elevacao-dependencias
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
    caminhos:
      - pyproject.toml
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-07-elevacao-dependencias-fastapi-regex-types-aiofiles
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-08-elevacao-dependencias-regex-e-laya
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-08-elevacao-polars-2-1-e-consumo-integral-engines-sota
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-08-elevacao-pypdf-7-0-torchvision-e-ecossistema-npm
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-08-integracao-sota-triade-stitch-exa-jules
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-08-otimizacao-pyproject-dependencias-extras-e-reconciliacao
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-08-refinamento-sonarlint-e-code-review-triage
    caminhos:
      - frontend/package.json
      - package.json
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-08-saneamento-code-review-triage
    caminhos:
      - frontend/package.json
      - package.json
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-09-elevacao-dependencias-e-fork-eigen
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-09-saneamento-sonarlint-e-mcp-skills-vulnerabilidades
    caminhos:
      - skills/exa-mcp-server
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-10-ai-sdk-google-4-0-117-ai-7-0-169
    caminhos:
      - package-lock.json
      - package.json
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-10-bump-deps-e-extra-paths-pylance
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-10-google-genai-3-1-0
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-10-lock-bundle-analyzer-16-4-6
    caminhos:
      - package-lock.json
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-11-elevacao-fastapi-playwright-e-bump-deep-research
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-11-elevacao-pypdf-turbo-ai-sdk-google
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-11-elevacao-sentence-transformers-genai-prettier-exa-mcp
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
      - skills/exa-mcp-server
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-11-elevacao-typer-types-knip-harmonizacao
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-11-nota-pareamento-dev-dependency-groups
    caminhos:
      - pyproject.toml
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-12-review-sweeps-endurecimento-sota
    caminhos:
      - package-lock.json
      - package.json
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-13-elevacao-deps-e-saneamento-configs-ide
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-13-revisao-ancora-pyproject-extra-path-cockpit
    caminhos:
      - pyproject.toml
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - skills/exa-mcp-server
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-14-laya-pylint-e-refactors-sonar
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-14-roteamento-pools-transporte-e-validacao-hrc
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-14-submodulos-skills-sonar-e-gitlinks
    caminhos:
      - skills/exa-mcp-server
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-14-sync-uvlock-ollama-cloud-circuit-e-ci
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-16-elevacao-deps-anthropic-laya-accelerate-e-deps-sync
    caminhos:
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-17-elevacao-deps-google-genai-openai
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-17-fase-2-saneamento-estrutural-frontend
    caminhos:
      - frontend/package.json
      - package-lock.json
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-17-fase-3-backend-estrutural-sota
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-17-fase-5-evolucao-das-forcas-sota
    caminhos:
      - package.json
      - pyproject.toml
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-17-fases-0-1-portoes-verificacao-e-higiene-doc-real
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-11-17-saneamento-deps-lint-typecheck-build
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
  - registro: registro-2026-10-05-resolucao-de-modelo-ollama-e-schema-json
    caminhos:
      - reports/REGISTRO-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem.md
    parecer:
      "Revisado em 2026-11-18: substituicao exclusiva do campo commit: no
      frontmatter dos 10 registros historicos SUSPEITO pelo SHA real de
      introducao no repositorio (git log --diff-filter=A -m), zerando avisos
      residuais sem alterar conteudo ou escopo medido."
  - registro: registro-2026-11-08-saneamento-ancoras-historicas-e-congelamento-medicoes
    caminhos:
      - reports/2026-09-01_Fusion_Quality_Gate_Report.md
      - reports/REGISTRO-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem.md
      - reports/REGISTRO-2026-09-09-actionlint-e-a-fronteira-do-submodulo.md
      - reports/REGISTRO-2026-09-09-prisma-generate-e-o-typecheck-do-ci.md
      - reports/REGISTRO-2026-09-10-importacao-visivel-hh-hrc.md
      - reports/REGISTRO-2026-09-10-publicacao-inputs-mtt.md
      - reports/REGISTRO-2026-09-12-teoria-canonica-chen-janda-e-convergencia-cfr.md
      - reports/REGISTRO-2026-09-14-correcoes-pos-auditoria-handoff-tier-e-dependencias.md
      - reports/REGISTRO-2026-09-18-decisoes-delegadas-sobre-as-pendencias.md
    parecer:
      "Revisado em 2026-11-18: substituicao exclusiva do campo commit: no
      frontmatter dos 10 registros historicos SUSPEITO pelo SHA real de
      introducao no repositorio (git log --diff-filter=A -m), zerando avisos
      residuais sem alterar conteudo ou escopo medido."
  - registro: registro-2026-11-18-elevacao-deps-google-genai-regex-turbo
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      "Revisado em 2026-11-18. Elevacao de vitest (^5.1.1) e typescript-eslint
      (^8.73.0) com npm install --force (typescript 7.0.2 preservado, next-auth
      5.0.0-beta.32 e prisma 7.10.1 mantidos), sincronizacao openai>=3.55.0 em
      requirements.txt e commit de formatUnknownError em skills/exa-mcp-server
      (1a4349d). Lint, typecheck e 195 testes Vitest aprovados; nenhuma regra de
      seguranca ou contrato alterado."
---

# REGISTRO -- Elevacao de Dependencias npm, Sync Python e Gitlink exa-mcp-server

Registro formal das atualizacoes e saneamentos consolidados em 2026-11-18 em
`C:/Users/rapha/.gemini/Site`.

## Alteracoes Consolidadas

- `vitest` e `@vitest/mocker` (override): `^5.1.0` -> `^5.1.1` em
  `package.json`.
- `typescript-eslint`: `^8.67.0` -> `^8.73.0` em `frontend/package.json` (com
  `typescript` `7.0.2` preservado via `npm install --force`).
- `next-auth` (`5.0.0-beta.32`) e `prisma` (`7.10.1`) mantidos por
  incompatibilidade de `latest` (downgrade v4 / RC sem par `@prisma/client`).
- `openai>=3.55.0` sincronizado em `requirements.txt` com `pyproject.toml` e
  `uv.lock`.
- `skills/exa-mcp-server` avancado para `1a4349d`
  (`refactor(error-handling): extract formatUnknownError helper`).
- Reconciliacao dos 10 avisos `SUSPEITO` em registros historicos com seus SHAs
  reais de nascimento (`git log --diff-filter=A -m`).
