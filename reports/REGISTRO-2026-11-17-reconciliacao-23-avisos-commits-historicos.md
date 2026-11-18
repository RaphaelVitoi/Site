---
id: registro-2026-11-17-reconciliacao-23-avisos-commits-historicos
tipo: registro
escopo: Site -- reconciliacao dos 23 avisos SUSPEITO de registros historicos (SHAs orfaos substituidos pelos SHAs reais de
  nascimento no git)
ecossistema: nexus-sota
autor: Gemini 4 Hydrogen <noreply@google.com>
criado_em: '2026-11-17T22:36:00-03:00'
atualizado_em: '2026-11-17T22:36:00-03:00'
commit: HEAD
classes:
- interno
- medido
- governanca
- registro
caminhos:
- docs/superpowers/plans/2026-09-01-dependency-boundary-reconciliation.md
- reports/AUDITORIA-2026-09-01-cwv-lighthouse-e-integridade.md
- reports/AUDITORIA-2026-09-02-integridade-do-projeto-e-piso-de-transformers.md
- reports/AUDITORIA-2026-09-08-o-que-esta-em-aberto-na-malha.md
- reports/AUDITORIA-2026-09-22-paridade-config-identidade.md
- reports/HANDOFF-2026-09-02-integridade-portao-no-teto-e-fila-para-o-sucessor.md
- reports/HANDOFF-2026-09-10-lint-lighthouse-e-aceite-cve.md
- reports/HANDOFF-2026-09-13-integracao-de-engines-wasm-e-economia-de-gate.md
- reports/HANDOFF-2026-09-22-paridade-config-identidade.md
- reports/PLANO-FRENTES-ABERTAS-2026-09-08.md
- reports/PLANO-laya-integracao-s1s2-pmev-2026-09-20.md
- reports/REGISTRO-2026-09-07-padronizacao-sistemica-markdownlint.md
- reports/REGISTRO-2026-09-09-remediacao-dependabot-httpx2.md
- reports/REGISTRO-2026-09-12-saneamento-linter-e-reconciliacao-de-ancoras.md
- reports/REGISTRO-2026-09-13-ci-typecheck-e-fronteira-de-capacidades.md
- reports/REGISTRO-2026-09-13-otimizacoes-helpers-antientropia-e-feedback.md
- reports/REGISTRO-2026-09-14-auditoria-e-refinamento-settings-e-configuracoes.md
- reports/REGISTRO-2026-10-31-refatoracao-cfr-tipagem-e-higiene.md
- reports/REGISTRO-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning.md
- reports/REGISTRO-2026-11-08-elevacao-polars-2-1-e-consumo-integral-engines-sota.md
- reports/REGISTRO-2026-11-08-elevacao-pypdf-7-0-torchvision-e-ecossistema-npm.md
- reports/REGISTRO-2026-11-08-integracao-sota-suite-antigravity-sdk-cli-acp.md
- reports/REGISTRO-2026-11-08-integracao-sota-triade-stitch-exa-jules.md
- reports/REGISTRO-2026-11-08-otimizacao-pyproject-dependencias-extras-e-reconciliacao.md
- reports/REGISTRO-2026-11-08-saneamento-ancoras-historicas-e-congelamento-medicoes.md
- reports/REGISTRO-2026-11-17-reconciliacao-23-avisos-commits-historicos.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data_das_medicoes: '2026-11-17'
verificado:
- '23 registros dos avisos SUSPEITO + 2 registros referenciados extras (HANDOFF-2026-09-02 e REGISTRO-2026-11-08-saneamento-ancoras-historicas-e-congelamento-medicoes)
  tiveram commit: atualizado para o SHA ancestral real via git log --diff-filter=A -m e validado com git merge-base --is-ancestor.'
- 'record_gate.py: 0 avisos SUSPEITO residuais; revisoes_de_ancora cobrindo todos os 8 registros VIGENTE afetados.'
nao_verificado:
- 'suite pytest integral (nao re-executada por alteracao exclusiva de frontmatter commit: em docs/reports e sob arbitragem
  Tier 0)'
referencias_nao_resolviveis: []
revisoes_de_ancora:
- registro: handoff-2026-09-09-ci-verde-e-as-seis-causas
  caminhos:
  - reports/PLANO-FRENTES-ABERTAS-2026-09-08.md
  parecer: 'Revisado em 2026-11-17: atualizacao exclusiva do campo commit: no frontmatter dos registros historicos referenciados
    para o SHA real de introducao no repositorio (git log --diff-filter=A -m), eliminando SHAs orfaos pos-reescrita sem alterar
    conteudo ou escopo medido.'
- registro: handoff-2026-09-09-verde-nos-dois-portoes
  caminhos:
  - reports/PLANO-FRENTES-ABERTAS-2026-09-08.md
  parecer: 'Revisado em 2026-11-17: atualizacao exclusiva do campo commit: no frontmatter dos registros historicos referenciados
    para o SHA real de introducao no repositorio (git log --diff-filter=A -m), eliminando SHAs orfaos pos-reescrita sem alterar
    conteudo ou escopo medido.'
- registro: registro-2026-09-09-upgrade-pwsh-e-harmonizacao
  caminhos:
  - reports/PLANO-FRENTES-ABERTAS-2026-09-08.md
  parecer: 'Revisado em 2026-11-17: atualizacao exclusiva do campo commit: no frontmatter dos registros historicos referenciados
    para o SHA real de introducao no repositorio (git log --diff-filter=A -m), eliminando SHAs orfaos pos-reescrita sem alterar
    conteudo ou escopo medido.'
- registro: registro-2026-11-08-resolucao-sonarlint-e-pyright-ops-triade
  caminhos:
  - reports/REGISTRO-2026-11-08-integracao-sota-triade-stitch-exa-jules.md
  parecer: 'Revisado em 2026-11-17: atualizacao exclusiva do campo commit: no frontmatter dos registros historicos referenciados
    para o SHA real de introducao no repositorio (git log --diff-filter=A -m), eliminando SHAs orfaos pos-reescrita sem alterar
    conteudo ou escopo medido.'
- registro: registro-2026-11-08-saneamento-ancoras-historicas-e-aquecimento-servidores
  caminhos:
  - reports/REGISTRO-2026-09-12-saneamento-linter-e-reconciliacao-de-ancoras.md
  parecer: 'Revisado em 2026-11-17: atualizacao exclusiva do campo commit: no frontmatter dos registros historicos referenciados
    para o SHA real de introducao no repositorio (git log --diff-filter=A -m), eliminando SHAs orfaos pos-reescrita sem alterar
    conteudo ou escopo medido.'
- registro: registro-2026-11-08-saneamento-ancoras-historicas-e-indices
  caminhos:
  - docs/superpowers/plans/2026-09-01-dependency-boundary-reconciliation.md
  - reports/AUDITORIA-2026-09-02-integridade-do-projeto-e-piso-de-transformers.md
  - reports/AUDITORIA-2026-09-08-o-que-esta-em-aberto-na-malha.md
  - reports/AUDITORIA-2026-09-22-paridade-config-identidade.md
  - reports/HANDOFF-2026-09-10-lint-lighthouse-e-aceite-cve.md
  - reports/HANDOFF-2026-09-13-integracao-de-engines-wasm-e-economia-de-gate.md
  - reports/HANDOFF-2026-09-22-paridade-config-identidade.md
  - reports/PLANO-FRENTES-ABERTAS-2026-09-08.md
  - reports/PLANO-laya-integracao-s1s2-pmev-2026-09-20.md
  - reports/REGISTRO-2026-09-09-remediacao-dependabot-httpx2.md
  - reports/REGISTRO-2026-09-13-ci-typecheck-e-fronteira-de-capacidades.md
  - reports/REGISTRO-2026-09-13-otimizacoes-helpers-antientropia-e-feedback.md
  - reports/REGISTRO-2026-09-14-auditoria-e-refinamento-settings-e-configuracoes.md
  - reports/REGISTRO-2026-10-31-refatoracao-cfr-tipagem-e-higiene.md
  parecer: 'Revisado em 2026-11-17: atualizacao exclusiva do campo commit: no frontmatter dos registros historicos referenciados
    para o SHA real de introducao no repositorio (git log --diff-filter=A -m), eliminando SHAs orfaos pos-reescrita sem alterar
    conteudo ou escopo medido.'
- registro: registro-2026-11-09-saneamento-sonarlint-e-mcp-skills-vulnerabilidades
  caminhos:
  - reports/REGISTRO-2026-11-08-integracao-sota-suite-antigravity-sdk-cli-acp.md
  parecer: 'Revisado em 2026-11-17: atualizacao exclusiva do campo commit: no frontmatter dos registros historicos referenciados
    para o SHA real de introducao no repositorio (git log --diff-filter=A -m), eliminando SHAs orfaos pos-reescrita sem alterar
    conteudo ou escopo medido.'
- registro: registro-2026-11-12-congelamento-config-medida-e-pendencias
  caminhos:
  - reports/HANDOFF-2026-09-02-integridade-portao-no-teto-e-fila-para-o-sucessor.md
  parecer: 'Revisado em 2026-11-17: atualizacao exclusiva do campo commit: no frontmatter dos registros historicos referenciados
    para o SHA real de introducao no repositorio (git log --diff-filter=A -m), eliminando SHAs orfaos pos-reescrita sem alterar
    conteudo ou escopo medido.'
---

# Reconciliacao dos 23 Avisos Historicos (SHAs de Nascimento)

Substituicao cirurgica do campo `commit:` nos registros historicos cujo SHA declarado nao existia na historia atual do repositorio pelo SHA real de nascimento (`git log --diff-filter=A -m`), preservando integralmente o conteudo e o escopo original de cada documento.
