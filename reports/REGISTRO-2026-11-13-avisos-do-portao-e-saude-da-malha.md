---
id: registro-2026-11-13-avisos-do-portao-e-saude-da-malha
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor:
  Devin (SWE-2 Flash)
  <158243242+devin-ai-integration[bot]@users.noreply.github.com>
criado_em: "2026-11-13T11:36:00-03:00"
atualizado_em: "2026-11-13T11:36:00-03:00"
classes: [interno, medido, governanca]
config_medida:
  congelada_em: "2026-11-13"
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data: 2026-11-13
caminhos:
  - scripts/ops/record_gate.py
  - scripts/ops/saude_da_malha.py
  - tests/test_record_index.py
  - tests/test_saude_da_malha.py
  - reports/AUDITORIA-2026-08-30-coderabbit-resolucao-e-integridade.md
  - reports/HANDOFF-2026-08-30-resolucao-coderabbit-linters-e-malha-sota.md
  - reports/HANDOFF-2026-08-30-status-malha-agentica-e-routing.md
pendencias:
  - id: pend-2026-11-13-reconciliacao-ancoras-registros
    o_que: >-
      ~206 registros `classes: [interno]` seguem SUSPEITO apenas por falta de
      `commit:` (medido em 2026-11-13). Backfill em massa promoveria todos a
      VIGENTE e transformaria avisos recorrentes em bloqueios de commit sobre
      caminhos quentes (data/agents_manifest.json, .claude/agent-memory/*).
      Reconciliar e decisao de auditoria do Tier 0: backfill por lote, supersede
      por tipo de documento, ou aceitar a divida declarada.
    dono: Tier 0
    prazo: "2026-11-27"
revisoes_de_ancora:
  - registro: taxonomia-canonica-de-documentacao-e-relatorios
    caminhos: [scripts/ops/record_gate.py]
    parecer: >-
      Revisto: a mudanca no portao e de apresentacao do digest de nao vigentes
      (agora nomeia cada registro e nao trunca motivo com parenteses). O
      criterio de bloqueio nao mudou -- VIGENTE continua exigindo revisao.
  - registro: handoff-2026-08-29-quatro-pendencias-e-o-que-elas-eram
    caminhos: [scripts/ops/record_gate.py]
    parecer: >-
      Revisto: mesma mudanca de digest acima; sem alteracao na semantica de
      ancora, pendencias ou bloqueio.
  - registro: interludio-2026-08-28-concorrencia-e-isolamento
    caminhos: [scripts/ops/record_gate.py]
    parecer: >-
      Revisto: o portao continua lido do indice num unico processo; a edicao
      tocou apenas _resumir_nao_vigentes, sem efeito na leitura do corpus.
  - registro: plano-2b-painel-de-estado
    caminhos: [scripts/ops/record_gate.py]
    parecer: >-
      Revisto: mudanca restrita a impressao de avisos; nenhuma superficie de
      estado, painel ou telemetria foi tocada.
  - registro: registro-2026-08-29-o-portao-le-o-indice
    caminhos: [scripts/ops/record_gate.py]
    parecer: >-
      Revisto: invariante central preservado -- o portao segue recalculando via
      record_index.avaliar_registro/estado_de; nada do que o registro atesta foi
      alterado.
  - registro: registro-2026-09-19-refatoracao-sonar-python-e-icm
    caminhos: [scripts/ops/record_gate.py, scripts/ops/saude_da_malha.py]
    parecer: >-
      Revisto: em saude_da_malha o sinal de lastro atrasado passou a emitir
      somente com >=2 dias de atraso (1 dia e o estado esperado antes das
      23:59); ausencia, JSON corrompido, auditoria parada e tarefa desabilitada
      seguem graves. Em record_gate, apenas o digest de nao vigentes mudou.
verificado:
  - "pytest tests/test_saude_da_malha.py tests/test_record_index.py -q: 67
    passed, zero warnings"
  - "ruff check e ruff format --check nos 4 arquivos tocados: limpos"
  - "pyright scripts/ops/saude_da_malha.py scripts/ops/record_gate.py: 0 erros"
  - "3 registros com `commit: pending` receberam o sha de nascimento 9dc7c243 e
    passaram a VIGENTE (avaliar_registro: zero motivos)"
  - 'scripts/ops/saude_da_malha.py executado de verdade em 2026-11-13: "Nenhum
    instrumento parado em silencio" -- lastro de 2026-11-12 com 1 dia de atraso
    e o estado esperado, nao um sinal'
  - "causa dos 41 avisos reproduzida: _resumir_nao_vigentes truncava motivo com
    parenteses (`commit declarado (pending`) e agrupava sem nomear registros;
    corrigido com regex ancorada em `) ancora ` e listagem por registro"
nao_verificado:
  - "saida real do digest com ~30 registros numa execucao de commit nao
    observada nesta sessao (contrato coberto por teste com avisos sinteticos)"
  - "suite pytest integral nao rodada nesta sessao; verificado o recorte focado
    dos dois modulos e seus testes"
---

# Saneamento dos avisos do portao de registro e da saude da malha

## O que gerava ruido

Dois processos distintos produziam saida de baixa densidade informacional:

1. **`[SAUDE DA MALHA]` info diario.** `saude_da_malha.coletar` emitia um sinal
   `info` para qualquer lastro anterior ao dia corrente, com a propria
   explanatory note reconhecendo que a tarefa grava as 23:59. Resultado medido:
   o sinal aparecia em TODO commit feito antes das 23:59 -- ~23h por dia de
   ruido garantido, sem nenhum estado novo a cada emissao. Alem disso o titulo
   "Lastro mais recente e de AAAA-MM-DD" tinha a mesma forma de um alerta de
   dado velho.

2. **Digest de registros nao vigentes.** `_resumir_nao_vigentes` agrupava os
   avisos por motivo com `re.search(r"\(([^)]+)\)")`, que trunca no primeiro
   `)`. Motivos contendo parenteses --
   `commit declarado (pending) nao existe neste repositorio` -- sairam como
   `[1] OBSOLETO, commit declarado (pending`. E o resumo nao nomeava registro
   nenhum: contagem opaca, sem auditoria.

## O que mudou

- `saude_da_malha.py`: o sinal de lastro atrasado so existe com **2+ dias** de
  atraso, sempre `grave`, com o numero de dias no titulo e o comando de reparo.
  Um dia de atraso e silencio -- e o calendario, nao a falha. Fail-closed
  preservado: ausencia, JSON corrompido, auditoria parada e tarefa desabilitada
  continuam graves.
- `record_gate.py`: `_resumir_nao_vigentes` agora agrupa por (estado, motivo
  completo) e lista cada registro atingido, com nota de que o conjunto so
  encolhe por reconciliacao de auditoria.
- 3 registros de 2026-08-30 com `commit: pending` receberam o sha de nascimento
  `9dc7c243` (convencao verificada: `commit:` e o commit que introduziu o
  arquivo). Os tres passaram a VIGENTE -- metadata intacta, motivo zerado.

## Divida residual declarada (nao resolvida de proposito)

~206 registros `classes: [interno]` sem `commit:` seguem SUSPEITO. Backfill
massivo os promoveria a VIGENTE e ligaria enforcement de ancora sobre caminhos
quentes -- transformaria aviso recorrente em bloqueio de commit. Registrado como
`pend-2026-11-13-reconciliacao-ancoras-registros` para decisao do Tier 0.

## Verificacao

Ver `verificado:`/`nao_verificado:` no frontmatter. Pontos centrais: 67 testes
focados verdes (incluindo dois novos que travam a fronteira de 1 vs 2 dias de
atraso e o motivo com parenteses no digest), ruff/pyright limpos, e o sensor de
saude executado de verdade devolveu silencio legitimo.
