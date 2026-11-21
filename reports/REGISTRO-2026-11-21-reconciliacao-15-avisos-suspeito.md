---
id: registro-2026-11-21-reconciliacao-15-avisos-suspeito
tipo: registro
escopo: Site -- reconciliacao dos 15 avisos SUSPEITO de registros historicos (SHAs orfaos substituidos pelos SHAs reais de nascimento no git) e classificacao dos avisos append-only de feedback-ledger.jsonl
ecossistema: nexus-sota
autor: Gemini 4 Hydrogen <noreply@google.com>
criado_em: '2026-11-21T08:30:00-03:00'
atualizado_em: '2026-11-21T08:30:00-03:00'
commit: HEAD
classes:
- interno
- medido
- governanca
- registro
caminhos:
- docs/architecture/REPOSITORY_TAXONOMY.md
- reports/AUDITORIA-2026-09-12-proveniencia-executavel-do-feedback.md
- reports/CHECKPOINT-2026-06-14-infrastructure-hardening.md
- reports/HANDOFF-2026-09-12-reconciliacao-calibracao-e-proveniencia.md
- reports/HANDOFF-2026-09-23-auditoria-frontend-backend-e-laya.md
- reports/HANDOFF-2026-11-08-otimizacao-backend-e-integridade-sota.md
- reports/REGISTRO-2026-08-29-tres-orfaos.md
- reports/REGISTRO-2026-09-04-refinamento-sota-radar-telemetria-scanner-e-mcps.md
- reports/REGISTRO-2026-09-13-contrato-de-capacidades-e-paridade-de-engines.md
- reports/REGISTRO-2026-09-19-refatoracao-sonar-python-e-icm.md
- reports/REGISTRO-2026-09-23-evolucao-pendencias-laya-e-tarefas.md
- reports/REGISTRO-2026-10-28-homologacao-pr103-jules-e-selagem-montecarlo.md
- reports/REGISTRO-2026-11-03-sincronizacao-e-correcao-frontmatter-skills-sota.md
- reports/REGISTRO-2026-11-08-otimizacao-backend-sonarlint-pyright-e-headings.md
- reports/REGISTRO-2026-11-21-reconciliacao-15-avisos-suspeito.md
- reports/RELATORIO-2026-06-16-auditoria-e-harmonizacao-v8-gold.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  python: '3.14.9'
  data_das_medicoes: '2026-11-21'
verificado:
- 15 registros historicos com commit orfao tiveram o campo commit atualizado para o SHA ancestral real de introducao via git log --diff-filter=A -m e validados com git merge-base --is-ancestor
- record_anchor_gate.ps1 e record_gate.py aprovados com 0 erros e 0 avisos SUSPEITO residuais nos 16 arquivos em stage
- Classificados os 8 avisos de feedback-ledger.jsonl (so ganharam linhas no fim) como comportamento append-only esperado em record_gate.py:859 quando o ledger e alterado em commit anterior
nao_verificado:
- suite_verde.py e cwv_gate.ps1 serao executados automaticamente no hook pre-commit da entrega
referencias_nao_resolviveis: []
revisoes_de_ancora:
- registro: auditoria-2026-09-12-o-ci-vermelho-que-nenhum-portao-local-media
  caminhos:
  - reports/AUDITORIA-2026-09-12-proveniencia-executavel-do-feedback.md
  - reports/HANDOFF-2026-09-12-reconciliacao-calibracao-e-proveniencia.md
  parecer: 'Revisado em 2026-11-21: atualizacao exclusiva do campo commit no frontmatter dos registros historicos para o SHA ancestral real d3e2e13b6cccde3660830d02f862759769939317 sem alterar conteudo ou escopo medido.'
- registro: registro-2026-09-18-saneamento-geral-de-linters-e-gate-remocao-citada
  caminhos:
  - docs/architecture/REPOSITORY_TAXONOMY.md
  parecer: 'Revisado em 2026-11-21: atualizacao exclusiva do campo commit no frontmatter de docs/architecture/REPOSITORY_TAXONOMY.md para o SHA ancestral real 6f57d8c5d79f6397372c947a010caa2203b42448 sem alterar conteudo ou escopo medido.'
- registro: registro-2026-11-08-saneamento-ancoras-historicas-e-aquecimento-servidores
  caminhos:
  - reports/HANDOFF-2026-09-23-auditoria-frontend-backend-e-laya.md
  - reports/REGISTRO-2026-09-13-contrato-de-capacidades-e-paridade-de-engines.md
  - reports/REGISTRO-2026-09-23-evolucao-pendencias-laya-e-tarefas.md
  parecer: 'Revisado em 2026-11-21: atualizacao exclusiva do campo commit no frontmatter dos 3 registros historicos para os SHAs ancestrais reais (84e21058a9dd73033aba8bc845ec6d923b654d72 e 2631604a0e88622a83db9284551ae58598d7b2b0) sem alterar conteudo ou escopo medido.'
- registro: registro-2026-11-08-saneamento-ancoras-historicas-e-indices
  caminhos:
  - reports/REGISTRO-2026-09-04-refinamento-sota-radar-telemetria-scanner-e-mcps.md
  - reports/REGISTRO-2026-10-28-homologacao-pr103-jules-e-selagem-montecarlo.md
  - reports/REGISTRO-2026-11-03-sincronizacao-e-correcao-frontmatter-skills-sota.md
  parecer: 'Revisado em 2026-11-21: atualizacao exclusiva do campo commit no frontmatter dos 3 registros historicos para os SHAs ancestrais reais (87775d656714bbc24cfb17dbc6769cd93af7da3a, abc49963408d11d1ee9a87aa1d41314bce51bdca e 80ac98819ce8fb7ecdaf701ab024d8831a43c808) sem alterar conteudo ou escopo medido.'
---

# Reconciliacao dos 15 Avisos SUSPEITO e Classificacao Append-Only

Reconciliacao dos 15 avisos `SUSPEITO -- commit declarado (...) nao existe neste repositorio` reportados pelo `record_gate.py` no commit `04581f4e`.

## 1. Substituicao dos SHAs Orfaos pelos SHAs Ancestrais Reais

Cada documento abaixo teve exclusivamente o campo `commit:` atualizado para o SHA real de introducao no historico git (`git log --diff-filter=A -m`), todos confirmados via `git merge-base --is-ancestor <sha> HEAD`:

| Arquivo | SHA anterior (orfao) | SHA ancestral real |
| :--- | :--- | :--- |
| `reports/AUDITORIA-2026-09-12-proveniencia-executavel-do-feedback.md` | `65e0863bc3b73c30f2b198109a69fedf6bced220` | `d3e2e13b6cccde3660830d02f862759769939317` |
| `reports/HANDOFF-2026-09-12-reconciliacao-calibracao-e-proveniencia.md` | `65e0863bc3b73c30f2b198109a69fedf6bced220` | `d3e2e13b6cccde3660830d02f862759769939317` |
| `reports/CHECKPOINT-2026-06-14-infrastructure-hardening.md` | `5a9f8c86` | `004b98008b1c0e834bd8a874e36a7c01af7218e8` |
| `reports/RELATORIO-2026-06-16-auditoria-e-harmonizacao-v8-gold.md` | `5a9f8c86` | `004b98008b1c0e834bd8a874e36a7c01af7218e8` |
| `reports/HANDOFF-2026-09-23-auditoria-frontend-backend-e-laya.md` | `256f696c` | `84e21058a9dd73033aba8bc845ec6d923b654d72` |
| `reports/REGISTRO-2026-09-23-evolucao-pendencias-laya-e-tarefas.md` | `256f696c` | `84e21058a9dd73033aba8bc845ec6d923b654d72` |
| `reports/HANDOFF-2026-11-08-otimizacao-backend-e-integridade-sota.md` | `f746c65b` | `563a4e1e2e8c405283e19689f6d220508067fb73` |
| `reports/REGISTRO-2026-11-08-otimizacao-backend-sonarlint-pyright-e-headings.md` | `f746c65b` | `563a4e1e2e8c405283e19689f6d220508067fb73` |
| `docs/architecture/REPOSITORY_TAXONOMY.md` | `809ed429` | `6f57d8c5d79f6397372c947a010caa2203b42448` |
| `reports/REGISTRO-2026-08-29-tres-orfaos.md` | `243df2c7` | `2dac2ae3d0edeb37201d820e4124660fd3268098` |
| `reports/REGISTRO-2026-09-04-refinamento-sota-radar-telemetria-scanner-e-mcps.md` | `c097e094` | `87775d656714bbc24cfb17dbc6769cd93af7da3a` |
| `reports/REGISTRO-2026-09-13-contrato-de-capacidades-e-paridade-de-engines.md` | `5329d1bb` | `2631604a0e88622a83db9284551ae58598d7b2b0` |
| `reports/REGISTRO-2026-09-19-refatoracao-sonar-python-e-icm.md` | `9d830e7c` | `871813935d0783a96c80c622092a0d1a1dbdf5c1` |
| `reports/REGISTRO-2026-10-28-homologacao-pr103-jules-e-selagem-montecarlo.md` | `f596ccfc` | `abc49963408d11d1ee9a87aa1d41314bce51bdca` |
| `reports/REGISTRO-2026-11-03-sincronizacao-e-correcao-frontmatter-skills-sota.md` | `6a9bcae2` | `80ac98819ce8fb7ecdaf701ab024d8831a43c808` |

## 2. Classificacao dos 8 Avisos de `feedback-ledger.jsonl`

Os avisos `ancora ['reports/agent-calibration/feedback-ledger.jsonl']: so ganharam linhas no fim. Nao bloqueia: o atestado segue intacto.` sao emitidos intencionalmente por `scripts/ops/record_gate.py` sempre que `reports/agent-calibration/feedback-ledger.jsonl` recebe novas linhas no final em um commit. Como o atestado historico dos registros e relatorios diarios citados permanece valido e o ledger e estritamente *append-only*, nao requerem `supersede` nem alteracao.
