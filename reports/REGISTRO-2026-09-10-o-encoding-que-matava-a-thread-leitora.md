---
id: registro-2026-09-10-o-encoding-que-matava-a-thread-leitora
tipo: relatorio
escopo: Site
ecossistema: nexus-sota
autor: opus-5
criado_em: 2026-09-10T13:10:00-03:00
atualizado_em: 2026-09-10T13:10:00-03:00
classes: [interno, medido]
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  origem: origin/master
  so: Windows
  python: '3.14.6'
  codepage_do_console: '850'
  suite: 1080 passed, 1 skipped
caminhos:
  - tests/test_cwv_gate_truthfulness.py
verificado:
  - os quatro testes que reprovavam passaram a aprovar
  - suite completa com 1080 aprovados, 1 pulado e zero falhas
  - ruff check e ruff format limpos
nao_verificado:
  - comportamento sob outras codepages alem de 850
revisoes_de_ancora:
  - registro: auditoria-2026-08-31-integridade-e-integracao-antigravity
    caminhos:
      - tests/test_cwv_gate_truthfulness.py
    parecer: >
      A alteracao acrescenta `encoding` e `errors` a quatro chamadas de
      subprocess. Nenhuma asercao, nenhum limiar e nenhuma fase do portao muda;
      o que muda e a decodificacao da saida, que deixa de depender da codepage
      do console. Revisado: permanece valido sem alteracao.
  - registro: auditoria-cwv-lighthouse-2026-09-01
    caminhos:
      - tests/test_cwv_gate_truthfulness.py
    parecer: >
      Aquela auditoria afirma o que o portao mede e o que ele recusa medir. A
      alteracao nao toca nem o portao nem os limiares -- so torna a leitura da
      saida deterministica. As quatro asercoes que reprovavam voltaram a rodar,
      e passam. Revisado: permanece valido sem alteracao.
  - registro: registro-2026-09-07-procedencia-do-timesfm-e-json-do-cli
    caminhos:
      - tests/test_cwv_gate_truthfulness.py
    parecer: >
      A alteracao e de decodificacao de saida de subprocesso e nao toca
      procedencia, JSON do CLI nem nada que aquele registro afirme. Revisado:
      permanece valido sem alteracao.
  - registro: registro-2026-09-08-auditoria-de-tipagem-e-recorte-do-fingerprint
    caminhos:
      - tests/test_cwv_gate_truthfulness.py
    parecer: >
      O recorte do fingerprint e o conjunto de arquivos que entra no calculo;
      nada nesta alteracao o altera. Revisado: permanece valido sem alteracao.
  - registro: registro-2026-09-08-ruff-format-e-o-ci-vermelho
    caminhos:
      - tests/test_cwv_gate_truthfulness.py
    parecer: >
      O arquivo alterado passa em `ruff check` e `ruff format --check`, que e
      exatamente o que aquele registro cobra. Revisado: permanece valido sem
      alteracao.
---

# O encoding que matava a thread leitora

## O sintoma, e por que ele enganava

Quatro testes reprovavam com `TypeError: unsupported operand type(s) for +:
'NoneType' and 'str'` na linha `result.stdout + result.stderr`.

O erro dizia que `stdout` era `None`. Nao dizia por que. A causa estava dois
niveis abaixo, num aviso que a suite mostra em letra miuda:
`PytestUnhandledThreadExceptionWarning: Exception in thread Thread-1
(_readerthread)`.

A thread que le a saida do subprocesso **morreu ao decodificar**, e `stdout`
ficou `None` como consequencia. O erro visivel era o sintoma do sintoma.

## A causa

`subprocess.run(..., text=True)` sem `encoding` decodifica com a codificacao da
plataforma. O console desta maquina esta em **codepage 850**. O portao ecoa
`data/cwv_manual_review_records.json`, que contem um travessao, e o travessao em
UTF-8 nao e decodificavel como cp850 -- a leitura estoura.

**Nao era regressao de ninguem.** O teste, o portao e os dois JSON que ele ecoa
estavam identicos ao `HEAD`. A condicao e ambiental: muda com a codepage de quem
executa.

## Por que `PYTHONUTF8=1` nao resolveu

Foi tentado antes de diagnosticar, e falhou. A decodificacao acontece na thread
do `subprocess`, e forcar o modo UTF-8 do interpretador nao a alcanca. Foi essa
falha que empurrou a investigacao para o aviso da thread, onde estava a resposta.

## A correcao

`encoding="utf-8", errors="replace"` nas quatro chamadas de `subprocess.run` que
nao os declaravam.

`errors="replace"` e deliberado: byte invalido vira caractere de substituicao em
vez de derrubar a leitura. As asercoes procuram texto ASCII -- `NAO MEDIDO`,
`FRAGIL (AMARELO)`, `APPROVED (SOTA GOLD)` -- e um caractere de substituicao no
meio de uma prosa acentuada nao as afeta. O portao continua sendo julgado pelo
que afirma, nao pela codepage de quem o roda.

## O que a medicao revelou de passagem

O arquivo tinha **dez** chamadas de `subprocess.run` com `encoding` explicito e
**quatro** sem. Era inconsistente consigo mesmo: alguem ja sabia da armadilha e
a resolveu em algumas chamadas, nao em todas.

E a mesma forma dos outros achados deste dia -- conhecimento presente numa parte
do repositorio e ausente na parte vizinha. Aqui, dentro de um unico arquivo.

## Resultado

Suite completa: **1080 aprovados, 1 pulado, zero falhas** -- contra 1073
aprovados e 4 falhas antes.
