---
id: registro-2026-11-08-saneamento-ancoras-historicas-e-indices
tipo: registro
escopo: Site -- saneamento e resolucao de 25 avisos de registros historicos nao vigentes (18 classes internas sem commit e 6 medicoes divergentes congeladas)
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-11-08T08:45:00-03:00'
atualizado_em: '2026-11-08T08:45:00-03:00'
commit: HEAD
verificado:
  - 'Atribuicao de SHAs historicos validos e ancestrais a 18 registros de classe interna'
  - 'Congelamento formal (congelada_em) de 6 medicoes passadas divergentes do Python 3.14.9'
  - 'Reconciliacao de ancoras passadas atingidas em registros historicos via revisoes_de_ancora'
  - 'Aprovacao com zero erros no portao de registros record_gate.py M.O. 13.F'
nao_verificado:
  - 'Execucao de testes em plataformas legadas Linux / Python 3.14.6'
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data_das_medicoes: '2026-11-08'
  toolchain: uv sync + ruff check + pytest + record_gate.py
  python: 3.14.9
  so: Windows
classes:
  - interno
  - medido
  - governanca
  - registro
caminhos:
  - docs/superpowers/plans/2026-09-01-dependency-boundary-reconciliation.md
  - reports/AUDITORIA-2026-09-02-integridade-do-projeto-e-piso-de-transformers.md
  - reports/AUDITORIA-2026-09-05-trabalho-assistido-do-gemini-no-ide.md
  - reports/AUDITORIA-2026-09-08-o-que-esta-em-aberto-na-malha.md
  - reports/AUDITORIA-2026-09-22-paridade-config-identidade.md
  - reports/HANDOFF-2026-09-10-lint-lighthouse-e-aceite-cve.md
  - reports/HANDOFF-2026-09-13-integracao-de-engines-wasm-e-economia-de-gate.md
  - reports/HANDOFF-2026-09-22-paridade-config-identidade.md
  - reports/PLANO-FRENTES-ABERTAS-2026-09-08.md
  - reports/PLANO-laya-integracao-s1s2-pmev-2026-09-20.md
  - reports/REGISTRO-2026-09-04-credenciais-submodulos-e-adaptador-hrc.md
  - reports/REGISTRO-2026-09-04-refinamento-sota-radar-telemetria-scanner-e-mcps.md
  - reports/REGISTRO-2026-09-09-remediacao-dependabot-httpx2.md
  - reports/REGISTRO-2026-09-13-ci-typecheck-e-fronteira-de-capacidades.md
  - reports/REGISTRO-2026-09-13-otimizacoes-helpers-antientropia-e-feedback.md
  - reports/REGISTRO-2026-09-14-auditoria-e-refinamento-settings-e-configuracoes.md
  - reports/REGISTRO-2026-09-24-blindagem-ascii-e-harmonizacao-scripts.md
  - reports/REGISTRO-2026-10-28-fortalecimento-e-harmonizacao-sota-triade-stitch-e-exa.md
  - reports/REGISTRO-2026-10-28-homologacao-pr103-jules-e-selagem-montecarlo.md
  - reports/REGISTRO-2026-10-31-desbloqueio-e-homologacao-jules-speedup-range-parser.md
  - reports/REGISTRO-2026-10-31-refatoracao-cfr-tipagem-e-higiene.md
  - reports/REGISTRO-2026-11-01-homologacao-jules-speedup-chunking-bitmask.md
  - reports/REGISTRO-2026-11-03-sincronizacao-e-correcao-frontmatter-skills-sota.md
  - reports/REGISTRO-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning.md
  - reports/REGISTRO-2026-11-08-saneamento-ancoras-historicas-e-indices.md
revisoes_de_ancora:
  - registro: handoff-2026-09-02-integridade-portao-no-teto-e-fila-para-o-sucessor
    caminhos:
      - reports/AUDITORIA-2026-09-02-integridade-do-projeto-e-piso-de-transformers.md
    parecer: 'Caminho revisado em 2026-11-08: ancoragem com commit 61bc5fcf e congelamento de medicao historica sem alterar o escopo original.'
  - registro: handoff-2026-09-04-pmev-credenciais-e-submodulos
    caminhos:
      - reports/REGISTRO-2026-09-04-credenciais-submodulos-e-adaptador-hrc.md
    parecer: 'Caminho revisado em 2026-11-08: ancoragem com commit 96ac0bc6 e congelamento de medicao historica sem alterar o escopo original.'
  - registro: handoff-2026-09-09-ci-verde-e-as-seis-causas
    caminhos:
      - reports/PLANO-FRENTES-ABERTAS-2026-09-08.md
    parecer: 'Caminho revisado em 2026-11-08: ancoragem com commit d8e51cb1 e congelamento de medicao historica mantendo o plano consistente.'
  - registro: handoff-2026-09-09-verde-nos-dois-portoes
    caminhos:
      - reports/PLANO-FRENTES-ABERTAS-2026-09-08.md
    parecer: 'Caminho revisado em 2026-11-08: ancoragem com commit d8e51cb1 e congelamento de medicao historica mantendo o plano consistente.'
  - registro: registro-2026-09-09-upgrade-pwsh-e-harmonizacao
    caminhos:
      - reports/PLANO-FRENTES-ABERTAS-2026-09-08.md
    parecer: 'Caminho revisado em 2026-11-08: ancoragem com commit d8e51cb1 e congelamento de medicao historica mantendo o plano consistente.'
---

# Registro 2026-11-08: Saneamento de Ancoras Historicas e Indices (M.O. 13.C / 13.F)

Resolucao integral dos 25 avisos de registros historicos nao vigentes:
- 18 registros de classe interna ancorados em SHAs historicos reais e ancestrais do HEAD.
- 6 registros com divergencia de config_medida congelados formalmente (congelada_em) preservando as medicoes originais.
- Ancoras historicas atingidas reconciliadas formalmente atraves de revisoes_de_ancora.
