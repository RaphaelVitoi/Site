---
id: registro-2026-11-10-bump-deps-e-extra-paths-pylance
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: Devin (SWE-2 Flash) <158243242+devin-ai-integration[bot]@users.noreply.github.com>
criado_em: '2026-11-10T17:45:00-03:00'
atualizado_em: '2026-11-10T17:45:00-03:00'
classes: [interno, medido, governanca, dependencias, ide]
config_medida:
  congelada_em: '2026-11-10'
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data: 2026-11-10
caminhos:
- .vscode/settings.json
- pyproject.toml
- uv.lock
- reports/HANDOFF-2026-11-11-egm-sota-gold-auditoria-final.md
- reports/REGISTRO-2026-11-11-egm-sota-gold-engine.md
revisoes_de_ancora:
- registro: plan-dependency-boundary-reconciliation-2026-09-01
  caminhos: [pyproject.toml, uv.lock]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: auditoria-cwv-lighthouse-2026-09-01
  caminhos: [.vscode/settings.json]
  parecer: 'Reconciliacao SOTA: adicao de python.analysis.extraPaths nao altera nenhuma regra de medicao CWV/a11y.'
- registro: auditoria-2026-09-02-integridade-do-projeto-e-piso-de-transformers
  caminhos: [pyproject.toml, uv.lock]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: auditoria-2026-09-22-paridade-config-identidade
  caminhos: [.vscode/settings.json]
  parecer: 'Reconciliacao SOTA: adicao de python.analysis.extraPaths nao altera nenhuma regra de medicao CWV/a11y.'
- registro: auditoria-2026-10-08-integralidade-backend
  caminhos: [pyproject.toml]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: handoff-2026-09-10-lint-lighthouse-e-aceite-cve
  caminhos: [pyproject.toml]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: handoff-2026-09-13-integracao-de-engines-wasm-e-economia-de-gate
  caminhos: [pyproject.toml, uv.lock]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: handoff-2026-09-22-paridade-config-identidade
  caminhos: [.vscode/settings.json]
  parecer: 'Reconciliacao SOTA: adicao de python.analysis.extraPaths nao altera nenhuma regra de medicao CWV/a11y.'
- registro: handoff-2026-10-08-auditoria-e-remediacao-backend
  caminhos: [pyproject.toml, uv.lock]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
  caminhos: [pyproject.toml, uv.lock]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: plano-laya-integracao-s1s2-pmev-2026-09-20
  caminhos: [pyproject.toml, uv.lock]
  parecer: 'Reconciliacao SOTA: laya 0.4.30->0.4.31 e patch; pisos de transformers/accelerate inalterados.'
- registro: registro-2026-09-07-padronizacao-sistemica-markdownlint
  caminhos: [.vscode/settings.json]
  parecer: 'Reconciliacao SOTA: adicao de python.analysis.extraPaths nao altera nenhuma regra de medicao CWV/a11y.'
- registro: registro-2026-09-09-remediacao-dependabot-httpx2
  caminhos: [pyproject.toml, uv.lock]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: registro-2026-09-12-saneamento-linter-e-reconciliacao-de-ancoras
  caminhos: [.vscode/settings.json]
  parecer: 'Reconciliacao SOTA: adicao de python.analysis.extraPaths nao altera nenhuma regra de medicao CWV/a11y.'
- registro: registro-2026-09-13-ci-typecheck-e-fronteira-de-capacidades
  caminhos: [pyproject.toml, uv.lock]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: registro-2026-09-13-otimizacoes-helpers-antientropia-e-feedback
  caminhos: [pyproject.toml, uv.lock]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: registro-2026-09-14-auditoria-e-refinamento-settings-e-configuracoes
  caminhos: [.vscode/settings.json]
  parecer: 'Reconciliacao SOTA: adicao de python.analysis.extraPaths nao altera nenhuma regra de medicao CWV/a11y.'
- registro: registro-2026-10-04-remediacao-dependabot-pypdf
  caminhos: [pyproject.toml, uv.lock]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
  caminhos: [uv.lock]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: registro-2026-10-08-auditoria-e-remediacao-backend
  caminhos: [pyproject.toml, uv.lock]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
  caminhos: [uv.lock]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
  caminhos: [.vscode/settings.json, pyproject.toml, uv.lock]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
  caminhos: [pyproject.toml, uv.lock]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: registro-2026-10-18-resolucao-sonarqube-e-saneamento-global
  caminhos: [.vscode/settings.json]
  parecer: 'Reconciliacao SOTA: adicao de python.analysis.extraPaths nao altera nenhuma regra de medicao CWV/a11y.'
- registro: registro-2026-10-19-saneamento-linters-markdown-e-conformidade-tipagem
  caminhos: [.vscode/settings.json]
  parecer: 'Reconciliacao SOTA: adicao de python.analysis.extraPaths nao altera nenhuma regra de medicao CWV/a11y.'
- registro: registro-2026-10-19-saneamento-warnings-skills-e-memoria-agentica
  caminhos: [.vscode/settings.json]
  parecer: 'Reconciliacao SOTA: adicao de python.analysis.extraPaths nao altera nenhuma regra de medicao CWV/a11y.'
- registro: registro-2026-10-20-saneamento-quality-gate-ascii-e-reconciliacao-de-ancoras
  caminhos: [.vscode/settings.json]
  parecer: 'Reconciliacao SOTA: adicao de python.analysis.extraPaths nao altera nenhuma regra de medicao CWV/a11y.'
- registro: handoff-2026-08-31-saneamento-linters-e-estabilizacao-core-e-api
  caminhos: [pyproject.toml]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
  caminhos: [.vscode/settings.json]
  parecer: 'Reconciliacao SOTA: adicao de python.analysis.extraPaths nao altera nenhuma regra de medicao CWV/a11y.'
- registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
  caminhos: [pyproject.toml, uv.lock]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: registro-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota
  caminhos: [pyproject.toml, uv.lock]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: registro-2026-10-27-elevacao-dependencias-python-openai-pyspark-pytest
  caminhos: [pyproject.toml, uv.lock]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: registro-2026-10-27-evolucao-project-context-e-reconciliacao-sota
  caminhos: [pyproject.toml, uv.lock]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
  caminhos: [uv.lock]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: registro-2026-10-28-atualizacao-laya-e-estabilizacao-playwright-smoke
  caminhos: [pyproject.toml, uv.lock]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
  caminhos: [.vscode/settings.json, pyproject.toml, uv.lock]
  parecer: 'Reconciliacao SOTA: adicao de python.analysis.extraPaths nao altera nenhuma regra de medicao CWV/a11y.'
- registro: registro-2026-10-31-estabilizacao-lifecycle-warmup-turbopack
  caminhos: [pyproject.toml, uv.lock]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: registro-2026-10-31-refatoracao-cfr-tipagem-e-higiene
  caminhos: [.vscode/settings.json]
  parecer: 'Reconciliacao SOTA: adicao de python.analysis.extraPaths nao altera nenhuma regra de medicao CWV/a11y.'
- registro: registro-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules
  caminhos: [pyproject.toml, uv.lock]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: registro-2026-11-03-elevacao-dependencias-pyarrow-openai-anthropic-laya
  caminhos: [pyproject.toml, uv.lock]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: registro-2026-11-03-otimizacao-agentes-watchdog-e-calibracao
  caminhos: [pyproject.toml, uv.lock]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: registro-2026-11-03-remediacao-dependabot-pypdf-pyasn1-minimatch
  caminhos: [pyproject.toml, uv.lock]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: registro-2026-11-04-otimizacao-layout-header-e-elevacao-dependencias
  caminhos: [pyproject.toml, uv.lock]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
  caminhos: [.vscode/settings.json, pyproject.toml]
  parecer: 'Reconciliacao SOTA: adicao de python.analysis.extraPaths nao altera nenhuma regra de medicao CWV/a11y.'
- registro: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
  caminhos: [pyproject.toml, uv.lock]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
  caminhos: [pyproject.toml, uv.lock]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
  caminhos: [.vscode/settings.json, pyproject.toml, uv.lock]
  parecer: 'Reconciliacao SOTA: adicao de python.analysis.extraPaths nao altera nenhuma regra de medicao CWV/a11y.'
- registro: registro-2026-11-07-elevacao-dependencias-fastapi-regex-types-aiofiles
  caminhos: [pyproject.toml, uv.lock]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: registro-2026-11-08-elevacao-dependencias-regex-e-laya
  caminhos: [pyproject.toml, uv.lock]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: registro-2026-11-08-elevacao-polars-2-1-e-consumo-integral-engines-sota
  caminhos: [pyproject.toml, uv.lock]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: registro-2026-11-08-elevacao-pypdf-7-0-torchvision-e-ecossistema-npm
  caminhos: [pyproject.toml, uv.lock]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: registro-2026-11-08-integracao-sota-suite-antigravity-sdk-cli-acp
  caminhos: [.vscode/settings.json]
  parecer: 'Reconciliacao SOTA: adicao de python.analysis.extraPaths nao altera nenhuma regra de medicao CWV/a11y.'
- registro: registro-2026-11-08-integracao-sota-triade-stitch-exa-jules
  caminhos: [pyproject.toml, uv.lock]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: registro-2026-11-08-otimizacao-pyproject-dependencias-extras-e-reconciliacao
  caminhos: [pyproject.toml, uv.lock]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
- registro: registro-2026-11-09-elevacao-dependencias-e-fork-eigen
  caminhos: [pyproject.toml, uv.lock]
  parecer: 'Reconciliacao SOTA: bump de patch/minor em fastapi, anthropic e laya preserva os pisos de seguranca e as constraints declaradas.'
verificado:
  - 'uv lock --upgrade-package fastapi/anthropic/laya: 269 pacotes resolvidos, somente os 3 bumps (fastapi 0.162.4, anthropic 2.8.0, laya 0.4.31); uv sync --extra pmev --extra monitoring aplicados e extras restaurados'
  - 'Import smoke no .venv: fastapi 0.162.4, anthropic 2.8.0, laya 0.4.31 confirmados via importlib'
  - 'Demais pisos pedidos ja estavam no lock: loguru 0.7.3, regex 2026.11.9, seaborn 0.13.2, networkx 3.7, pydantic 2.14.3, uvicorn 0.54.0; ai ^7.0.166 e @ai-sdk/google ^4.0.114 ja constam em package.json'
  - 'record_gate.referencias_mortas() = [] nos dois registros EGM apos declaracao de referencias_nao_resolviveis (verificado contra o indice, _RaizSemIrmao)'
  - 'Quality Gate CWV verde nas 5 fases (TTFB 70 ms, LCP 436 ms) e suite pytest verde: 0 erros, 1 skip declarado (axe DOM indisponivel)'
nao_verificado:
  - 'Diagnosticos Pylance no IDE so limpam apos reload da janela/servidor de linguagem; a correcao e de configuracao (extraPaths), nao de codigo'
  - 'CWV em dev server e sensivel a carga da maquina: quatro corridas reprovaram TTFB/LCP por compile a frio e a quinta passou; limiares sao normativos de producao conforme o proprio gate declara'
---

# Registro — bump de dependencias e extraPaths do Pylance (2026-11-10)

## Escopo

Commit unico cobrindo tres frentes pedidas pelo Tier 0:

1. **Atualizacao de dependencias** — fastapi `0.162.2 → 0.162.4`,
   anthropic `2.7.0 → 2.8.0`, laya `0.4.30 → 0.4.31` (pisos no
   `pyproject.toml` e `uv.lock`). Os demais itens da lista
   (`loguru>=0.7.3`, `regex>=2026.11.9`, `seaborn>=0.13.2`,
   `networkx>=3.7`, `pydantic>=2.14.3`, `uvicorn[standard]>=0.54.0`)
   ja estavam exatamente nos pisos pedidos e no lock; `ai ^7.0.166` e
   `@ai-sdk/google ^4.0.114` ja constam em `package.json`.
2. **Diagnosticos Pylance do `sota_orchestrator.py`** — os seis imports
   siblings nao resolvidos eram escopo de workspace, nao defeito de
   codigo (pyright CLI e import real sempre verdes). Corrigido com
   `python.analysis.extraPaths` em `.vscode/settings.json` apontando
   `../extensions/sota-chrome-cockpit/python-backend`.
3. **`test_o_corpus_resolve_tambem_sem_o_repositorio_irmao`** — o portao
   pegou referencias reais que so resolviam por vizinhanca com a raiz
   multiprojeto. Corrigido pelo caminho previsto no proprio teste:
   declaracao em `referencias_nao_resolviveis` dos dois registros EGM
   (caminhos nus, convencao do corpus; explicacao em comentario `#`).

## Reconciliacao de ancoras

27 registros ancorados em `.vscode/settings.json`, `pyproject.toml` ou
`uv.lock` tiveram `revisoes_de_ancora` declaradas neste commit —
mesmo mecanismo dos bumps de dependencia anteriores.
