---
id: registro-2026-11-03-remediacao-dependabot-pypdf-pyasn1-minimatch
tipo: registro
escopo: Site -- Remediacao de 12 vulnerabilidades do Dependabot (pypdf, pyasn1 e minimatch)
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-11-03T18:15:00-03:00'
atualizado_em: '2026-11-03T18:15:00-03:00'
commit: HEAD
classes:
- interno
- medido
- governanca
- registro
- backend
- frontend
- sota
caminhos:
- package-lock.json
- package.json
- pyproject.toml
- reports/REGISTRO-2026-11-03-remediacao-dependabot-pypdf-pyasn1-minimatch.md
- uv.lock
config_medida:
  congelada_em: '2026-11-03'
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  python: 3.14.7
  so: Windows
  condutor: Gemini 3.8 Flash <noreply@google.com>
  modelo: gemini-3.8-flash
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-11-03
verificado:
  - Elevacao de pypdf de 6.21.2 para 6.21.4 no pyproject.toml e uv.lock sanando 7 vulnerabilidades altas (GHSA-5849-834g-hvw5, GHSA-cggf-277g-3q54, GHSA-mfr5-77xh-9j7h, GHSA-42gh-23hr-vphw, GHSA-4vqv-7265-gm2w, GHSA-62m5-6wh8-28x7, GHSA-x3rh-gjgm-fmqc)
  - Elevacao de pyasn1 de 0.6.4 para 0.6.5 em constraint-dependencies do pyproject.toml e uv.lock sanando 4 vulnerabilidades altas (GHSA-2qm8-x737-gmw5, GHSA-mm57-4v3p-rchx, GHSA-9m75-vc3g-4x39, GHSA-fm9c-5rcf-2q5p)
  - Override e deduplicacao universal de minimatch para ^11.0.4 em package.json e package-lock.json sanando vulnerabilidade media (GHSA-g3hv-75wg-m249)
  - Validacao de runtime de pypdf 6.21.4 e pyasn1 0.6.5 via Python inline
  - Execucao limpa de lint e typecheck do frontend Next.js (tsc --build) sem erros
  - Bateria de testes frontend jest com 111 suites e 739 testes aprovados (0 erros, 0 falhas)
  - Portao de ancoras e registros (record_anchor_gate.ps1 e record_gate.py) aprovados
nao_verificado:
  - Validacao de parsing de PDFs criptografados com senhas legadas RC4 de 40 bits
revisoes_de_ancora:
- registro: auditoria-2026-10-08-integralidade-backend
  caminhos:
  - pyproject.toml
  parecer: Revisado em 2026-11-03. Remediacao de seguranca Dependabot pypdf 6.21.4, pyasn1 0.6.5 e minimatch 11.0.4.
- registro: handoff-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - package-lock.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-03. Remediacao de seguranca Dependabot pypdf 6.21.4, pyasn1 0.6.5 e minimatch 11.0.4.
- registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-03. Remediacao de seguranca Dependabot pypdf 6.21.4, pyasn1 0.6.5 e minimatch 11.0.4.
- registro: registro-2026-10-04-remediacao-dependabot-pypdf
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-03. Remediacao de seguranca Dependabot pypdf 6.21.4, pyasn1 0.6.5 e minimatch 11.0.4.
- registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
  caminhos:
  - uv.lock
  parecer: Revisado em 2026-11-03. Remediacao de seguranca Dependabot pypdf 6.21.4, pyasn1 0.6.5 e minimatch 11.0.4.
- registro: registro-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - package-lock.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-03. Remediacao de seguranca Dependabot pypdf 6.21.4, pyasn1 0.6.5 e minimatch 11.0.4.
- registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
  caminhos:
  - package-lock.json
  - package.json
  - uv.lock
  parecer: Revisado em 2026-11-03. Remediacao de seguranca Dependabot pypdf 6.21.4, pyasn1 0.6.5 e minimatch 11.0.4.
- registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-03. Remediacao de seguranca Dependabot pypdf 6.21.4, pyasn1 0.6.5 e minimatch 11.0.4.
- registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-03. Remediacao de seguranca Dependabot pypdf 6.21.4, pyasn1 0.6.5 e minimatch 11.0.4.
- registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
  caminhos:
  - package-lock.json
  parecer: Revisado em 2026-11-03. Remediacao de seguranca Dependabot pypdf 6.21.4, pyasn1 0.6.5 e minimatch 11.0.4.
- registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-03. Remediacao de seguranca Dependabot pypdf 6.21.4, pyasn1 0.6.5 e minimatch 11.0.4.
- registro: registro-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota
  caminhos:
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-03. Remediacao de seguranca Dependabot pypdf 6.21.4, pyasn1 0.6.5 e minimatch 11.0.4.
- registro: registro-2026-10-27-elevacao-dependencias-python-openai-pyspark-pytest
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-03. Remediacao de seguranca Dependabot pypdf 6.21.4, pyasn1 0.6.5 e minimatch 11.0.4.
- registro: registro-2026-10-27-evolucao-project-context-e-reconciliacao-sota
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-03. Remediacao de seguranca Dependabot pypdf 6.21.4, pyasn1 0.6.5 e minimatch 11.0.4.
- registro: registro-2026-10-27-harmonizacao-dependencias-ci-e-wasm
  caminhos:
  - package-lock.json
  - package.json
  parecer: Revisado em 2026-11-03. Remediacao de seguranca Dependabot pypdf 6.21.4, pyasn1 0.6.5 e minimatch 11.0.4.
- registro: registro-2026-10-27-harmonizacao-dependencias-katex-e-ci
  caminhos:
  - package-lock.json
  parecer: Revisado em 2026-11-03. Remediacao de seguranca Dependabot pypdf 6.21.4, pyasn1 0.6.5 e minimatch 11.0.4.
- registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
  caminhos:
  - package-lock.json
  - package.json
  - uv.lock
  parecer: Revisado em 2026-11-03. Remediacao de seguranca Dependabot pypdf 6.21.4, pyasn1 0.6.5 e minimatch 11.0.4.
- registro: registro-2026-10-28-atualizacao-laya-e-estabilizacao-playwright-smoke
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-03. Remediacao de seguranca Dependabot pypdf 6.21.4, pyasn1 0.6.5 e minimatch 11.0.4.
- registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-03. Remediacao de seguranca Dependabot pypdf 6.21.4, pyasn1 0.6.5 e minimatch 11.0.4.
- registro: registro-2026-10-31-estabilizacao-lifecycle-warmup-turbopack
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-03. Remediacao de seguranca Dependabot pypdf 6.21.4, pyasn1 0.6.5 e minimatch 11.0.4.
- registro: registro-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-03. Remediacao de seguranca Dependabot pypdf 6.21.4, pyasn1 0.6.5 e minimatch 11.0.4.
- registro: registro-2026-11-03-elevacao-dependencias-pyarrow-openai-anthropic-laya
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-03. Remediacao de seguranca Dependabot pypdf 6.21.4, pyasn1 0.6.5 e minimatch 11.0.4.
- registro: registro-2026-11-03-otimizacao-agentes-watchdog-e-calibracao
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-03. Remediacao de seguranca Dependabot pypdf 6.21.4, pyasn1 0.6.5 e minimatch 11.0.4.
---

# REGISTRO: Remediacao de 12 Vulnerabilidades Dependabot (pypdf, pyasn1 e minimatch)

## 1. Contexto & Diagnostico
Apos publicacao no GitHub, 12 vulnerabilidades foram notificadas no painel do Dependabot para a branch master do repositorio RaphaelVitoi/Site:
- 7 alertas de severidade alta em `pypdf` (<6.21.4): GHSA-5849-834g-hvw5, GHSA-cggf-277g-3q54, GHSA-mfr5-77xh-9j7h, GHSA-42gh-23hr-vphw, GHSA-4vqv-7265-gm2w, GHSA-62m5-6wh8-28x7, GHSA-x3rh-gjgm-fmqc.
- 4 alertas de severidade alta em `pyasn1` (<0.6.5): GHSA-2qm8-x737-gmw5, GHSA-mm57-4v3p-rchx, GHSA-9m75-vc3g-4x39, GHSA-fm9c-5rcf-2q5p.
- 1 alerta de severidade media em `minimatch` (<11.0.1): GHSA-g3hv-75wg-m249 (denial of service via globparts amplification).

## 2. Acoes Executadas
1. Elevacao do piso de `pypdf` para `>=6.21.4,<7.0.0` no [`pyproject.toml`](file:///c:/Users/rapha/.gemini/Site/pyproject.toml).
2. Elevacao de `pyasn1` para `>=0.6.5` em `constraint-dependencies` do [`pyproject.toml`](file:///c:/Users/rapha/.gemini/Site/pyproject.toml).
3. Inclusao de override `minimatch: "^11.0.4"` no [`package.json`](file:///c:/Users/rapha/.gemini/Site/package.json), unificando e deduplicando todas as ocorrencias transitivas do monorepo para a versao corrigida e imune 11.0.4.
4. Sincronizacao de `uv.lock` e `package-lock.json`.
5. Validacao de imports e runtime para `pypdf 6.21.4` e `pyasn1 0.6.5`.
6. Validacao de lint, typecheck e suite de testes frontend (111 suites / 739 testes aprovados).
7. Reconciliacao dos 23 registros de ancoras historicas ativas.
