---
id: registro-2026-11-18-elevacao-deps-google-genai-regex-turbo
tipo: registro
escopo: "Site -- Elevacao de dependencias: google-genai>=3.5.0, regex>=2026.11.18 e turbo 2.11.12"
ecossistema: nexus-sota
autor: "Gemini 4 Hydrogen <noreply@google.com>"
criado_em: "2026-11-18T01:08:00-03:00"
atualizado_em: "2026-11-18T01:08:00-03:00"
commit: HEAD
classes:
  - interno
  - governanca
  - registro
caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  - reports/REGISTRO-2026-11-18-elevacao-deps-google-genai-regex-turbo.md
  - requirements.txt
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
  - "uv lock --upgrade-package google-genai --upgrade-package regex e uv sync --inexact aprovados (google-genai 3.5.0, regex 2026.11.18)"
  - "npm install e turbo --version aprovados (turbo 2.11.12, Prisma Client v7.10.1 regenerado)"
  - "record_anchor_gate.ps1 -Staged:$true e record_gate.py aprovados"
nao_verificado:
  - "vercel nao consta em package.json/frontend/package.json; suite_verde.py nao reexecutada por alteracao exclusiva de manifests"
referencias_nao_resolviveis: []
revisoes_de_ancora:
  - registro: auditoria-2026-09-02-integridade-do-projeto-e-piso-de-transformers
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: auditoria-2026-09-08-o-que-esta-em-aberto-na-malha
    caminhos:
      - requirements.txt
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: auditoria-2026-10-08-integralidade-backend
    caminhos:
      - pyproject.toml
      - requirements.txt
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: auditoria-cwv-lighthouse-2026-09-01
    caminhos:
      - package-lock.json
      - package.json
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: handoff-2026-08-29-governanca-8tiers-vulnerabilidades-subagents
    caminhos:
      - package.json
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
    caminhos:
      - package.json
      - pyproject.toml
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: handoff-2026-09-10-lint-lighthouse-e-aceite-cve
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: handoff-2026-09-13-integracao-de-engines-wasm-e-economia-de-gate
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: handoff-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - package-lock.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: handoff-2026-11-15-translategemma-timesfm-laya-roi
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: plan-dependency-boundary-reconciliation-2026-09-01
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: plano-frentes-abertas-2026-09-08
    caminhos:
      - requirements.txt
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: plano-laya-integracao-s1s2-pmev-2026-09-20
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-09-02-fast-uri-alto-e-contrato-de-evidencia-pmev
    caminhos:
      - package-lock.json
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-09-07-padronizacao-sistemica-markdownlint
    caminhos:
      - package.json
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem
    caminhos:
      - package-lock.json
      - package.json
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-09-09-actionlint-e-a-fronteira-do-submodulo
    caminhos:
      - package.json
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-09-09-prisma-generate-e-o-typecheck-do-ci
    caminhos:
      - package.json
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-09-09-remediacao-dependabot-httpx2
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-09-10-importacao-visivel-hh-hrc
    caminhos:
      - package-lock.json
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-09-10-publicacao-inputs-mtt
    caminhos:
      - package-lock.json
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-09-13-ci-typecheck-e-fronteira-de-capacidades
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-09-13-otimizacoes-helpers-antientropia-e-feedback
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-09-14-auditoria-e-refinamento-settings-e-configuracoes
    caminhos:
      - package-lock.json
      - package.json
      - requirements.txt
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-09-14-correcoes-pos-auditoria-handoff-tier-e-dependencias
    caminhos:
      - package-lock.json
      - package.json
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-09-18-decisoes-delegadas-sobre-as-pendencias
    caminhos:
      - package-lock.json
      - package.json
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-10-04-remediacao-dependabot-pypdf
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
    caminhos:
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - package-lock.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
    caminhos:
      - package-lock.json
      - package.json
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
    caminhos:
      - package-lock.json
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota
    caminhos:
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-10-27-elevacao-dependencias-python-openai-pyspark-pytest
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-10-27-evolucao-project-context-e-reconciliacao-sota
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-10-27-harmonizacao-dependencias-ci-e-wasm
    caminhos:
      - package-lock.json
      - package.json
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-10-27-harmonizacao-dependencias-katex-e-ci
    caminhos:
      - package-lock.json
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
    caminhos:
      - package-lock.json
      - package.json
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-10-28-atualizacao-laya-e-estabilizacao-playwright-smoke
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-10-31-estabilizacao-lifecycle-warmup-turbopack
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-03-elevacao-dependencias-pyarrow-openai-anthropic-laya
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-03-otimizacao-agentes-watchdog-e-calibracao
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-03-remediacao-dependabot-pypdf-pyasn1-minimatch
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-04-otimizacao-layout-header-e-elevacao-dependencias
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-07-elevacao-dependencias-fastapi-regex-types-aiofiles
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-08-elevacao-dependencias-regex-e-laya
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-08-elevacao-polars-2-1-e-consumo-integral-engines-sota
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-08-elevacao-pypdf-7-0-torchvision-e-ecossistema-npm
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-08-harmonizacao-r-4-6-1-jules-e-saneamento-ancoras
    caminhos:
      - package-lock.json
      - package.json
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-08-integracao-sota-triade-stitch-exa-jules
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-08-otimizacao-pyproject-dependencias-extras-e-reconciliacao
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-08-refinamento-sonarlint-e-code-review-triage
    caminhos:
      - package.json
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-08-saneamento-code-review-triage
    caminhos:
      - package.json
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-09-elevacao-dependencias-e-fork-eigen
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-10-ai-sdk-google-4-0-117-ai-7-0-169
    caminhos:
      - package-lock.json
      - package.json
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-10-bump-deps-e-extra-paths-pylance
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-10-google-genai-3-1-0
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-10-lock-bundle-analyzer-16-4-6
    caminhos:
      - package-lock.json
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-11-elevacao-fastapi-playwright-e-bump-deep-research
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-11-elevacao-pypdf-turbo-ai-sdk-google
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-11-elevacao-sentence-transformers-genai-prettier-exa-mcp
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-11-elevacao-typer-types-knip-harmonizacao
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-11-nota-pareamento-dev-dependency-groups
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-12-review-sweeps-endurecimento-sota
    caminhos:
      - package-lock.json
      - package.json
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-13-elevacao-deps-e-saneamento-configs-ide
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-13-revisao-ancora-pyproject-extra-path-cockpit
    caminhos:
      - pyproject.toml
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-14-laya-pylint-e-refactors-sonar
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-14-roteamento-pools-transporte-e-validacao-hrc
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-14-sync-uvlock-ollama-cloud-circuit-e-ci
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-16-elevacao-deps-anthropic-laya-accelerate-e-deps-sync
    caminhos:
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-17-elevacao-deps-google-genai-openai
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-17-fase-2-saneamento-estrutural-frontend
    caminhos:
      - package-lock.json
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-17-fase-3-backend-estrutural-sota
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-17-fase-5-evolucao-das-forcas-sota
    caminhos:
      - package.json
      - pyproject.toml
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-17-fases-0-1-portoes-verificacao-e-higiene-doc-real
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: registro-2026-11-17-saneamento-deps-lint-typecheck-build
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: relatorio-2026-08-29-analise-integral-ecossistema-sota-v8-gold
    caminhos:
      - package.json
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: relatorio-2026-08-29-impacto-quantitativo-qualitativo-sota-v8-gold
    caminhos:
      - package.json
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
  - registro: relatorio-fusao-cerebro-claude-quality-gate-2026-09-01
    caminhos:
      - package-lock.json
      - package.json
    parecer: "Revisado em 2026-11-18. Elevacao pontual de dependencias em Site: google-genai>=3.5.0 e regex>=2026.11.18 (pyproject.toml, requirements.txt, uv.lock) e turbo 2.11.12 (package.json, package-lock.json), com uv lock/sync --inexact e npm install verificados em runtime (google.genai 3.5.0, regex 2026.11.18, turbo 2.11.12). Nenhuma regra de seguranca ou contrato alterado."
---

# REGISTRO -- Elevacao de Dependencias (google-genai, regex, turbo)

Registro formal da atualizacao de pacotes solicitada em 2026-11-18 em `C:/Users/rapha/.gemini/Site`.

## Pacotes Atualizados

- `google-genai`: `>=3.4.0` -> `>=3.5.0` (`3.5.0` instalado via `uv`).
- `regex`: `>=2026.11.15` -> `>=2026.11.18` (`2026.11.18` instalado via `uv`).
- `turbo`: `2.11.11` -> `2.11.12` (`2.11.12` instalado via `npm`).
