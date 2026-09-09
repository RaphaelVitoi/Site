---
id: registro-2026-09-09-o-teste-media-o-ledger-da-maquina
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-08-aberturas"
criado_em: 2026-09-09T03:40:00-03:00
atualizado_em: 2026-09-09T03:40:00-03:00
classes: [interno, medido, testes, ci]
caminhos:
  - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
  - tests/test_timesfm_agent_calibration.py
supersede: null
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
verificado:
  - >-
    ESTADO DO CI EM f0ad0298: 1012 passed, 18 skipped, 1 failed. O job de
    frontend ficou SUCCESS. A unica falha restante era
    test_new_agent_calibration_daily_evidence_includes_timesfm, com
    "AssertionError: assert 'INSUFFICIENT_HISTORY' == 'PROJECTION_ACTIVE'".
  - >-
    CAUSA: o teste executava New-AgentCalibrationDailyEvidence.ps1 SEM passar
    -LedgerPath, portanto lia o ledger canonico do repositorio. E
    reports/agent-calibration/feedback-ledger.jsonl NAO e versionado --
    git ls-files lista README.md e os daily/*.md daquele diretorio, e nao o
    ledger.
  - >-
    O QUE ISSO PRODUZIA: na minha estacao o ledger real tinha 18 pontos e o
    status vinha PROJECTION_ACTIVE; no runner, sem ledger, vinha
    INSUFFICIENT_HISTORY. O teste media o ESTADO da maquina, nao o contrato do
    script.
  - >-
    O SCRIPT JA EXPUNHA A INJECAO, com o comentario "Caminhos injetaveis para
    permitir guard hermetico em tmp_path" nos parametros -LedgerPath e
    -OutlierLedgerPath. Outros testes da suite ja os usavam --
    test_agent_calibration_feedback.py e test_calibracao_fechamento_do_ciclo.py.
    O molde de ledger encadeado foi reaproveitado deste ultimo.
  - >-
    ARMADILHA MEDIDA AO ESCREVER O GUARD: criar o arquivo de outliers VAZIO
    derruba o script, porque Test-AgentCalibrationLedger.ps1:50 lanca
    "Ledger exists but is empty.". Caminho INEXISTENTE e tratado como "sem
    outliers" e funciona. O teste portanto nao cria aquele arquivo, e o motivo
    esta escrito no proprio codigo.
  - >-
    PROVA NA MAO, antes de ajustar o teste: rodando o script com um ledger
    sintetico de 7 feedbacks e o caminho de outliers ausente, a saida traz
    status=PROJECTION_ACTIVE, history_points=7, sessoes_com_feedback_count=7.
  - >-
    ANTES: o teste falhava rodado isoladamente e passava na suite completa --
    dependencia de ordem confirmada por git stash, e portanto pre-existente.
    DEPOIS: 8 passed rodando o arquivo isolado.
  - >-
    SUITE COMPLETA: 1030 passed, 1 skipped, zero warnings. ruff check e
    ruff format limpos no arquivo alterado.
nao_verificado:
  - >-
    Nao confirmei ainda que o job Python do CI fica verde: exige o push.
  - >-
    Nao investiguei o UnicodeDecodeError com byte 0xa0 que a versao ANTERIOR do
    teste produzia ao rodar isolada. Ele desapareceu porque a causa raiz -- ler
    o ledger real da maquina -- foi removida, mas o byte invalido na saida do
    script naquele cenario nao foi rastreado ate a origem.
  - >-
    Nao verifiquei se outros testes da suite dependem do ledger canonico da
    mesma forma. A busca foi por esta falha especifica, nao uma varredura.
revisoes_de_ancora:
  - registro: auditoria-2026-09-03-trabalho-do-gemini-3-8-flash
    caminhos:
      - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
    parecer: >-
      Este commit toca o gerador de evidencia em UM ponto: a resolucao do
      interpretador Python, na linha que decidia se a projecao TimesFM roda, e
      a separacao do status RUNTIME_UNAVAILABLE de INSUFFICIENT_HISTORY.
      Medido: o script resolvia o Python so por .venv\Scripts\python.exe, e em
      Linux caia no ramo `else` reportando falta de HISTORICO quando havia 7
      pontos e o minimo e 4 -- a causa declarada era falsa. Nada da leitura do
      ledger, do recorte por sessao, do portao de suficiencia, do tratamento
      de cultura em datas ou das correcoes aplicadas foi tocado. O achado
      deste registro segue valido e, se ele consome os campos do forecast,
      passa a receber a causa correta em vez de uma falsa.
  - registro: auditoria-2026-09-05-trabalho-assistido-do-gemini-no-ide
    caminhos:
      - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
    parecer: >-
      Este commit toca o gerador de evidencia em UM ponto: a resolucao do
      interpretador Python, na linha que decidia se a projecao TimesFM roda, e
      a separacao do status RUNTIME_UNAVAILABLE de INSUFFICIENT_HISTORY.
      Medido: o script resolvia o Python so por .venv\Scripts\python.exe, e em
      Linux caia no ramo `else` reportando falta de HISTORICO quando havia 7
      pontos e o minimo e 4 -- a causa declarada era falsa. Nada da leitura do
      ledger, do recorte por sessao, do portao de suficiencia, do tratamento
      de cultura em datas ou das correcoes aplicadas foi tocado. O achado
      deste registro segue valido e, se ele consome os campos do forecast,
      passa a receber a causa correta em vez de uma falsa.
  - registro: registro-2026-09-02-correcao-de-escala-e-timestamp-no-ledger
    caminhos:
      - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
    parecer: >-
      Este commit toca o gerador de evidencia em UM ponto: a resolucao do
      interpretador Python, na linha que decidia se a projecao TimesFM roda, e
      a separacao do status RUNTIME_UNAVAILABLE de INSUFFICIENT_HISTORY.
      Medido: o script resolvia o Python so por .venv\Scripts\python.exe, e em
      Linux caia no ramo `else` reportando falta de HISTORICO quando havia 7
      pontos e o minimo e 4 -- a causa declarada era falsa. Nada da leitura do
      ledger, do recorte por sessao, do portao de suficiencia, do tratamento
      de cultura em datas ou das correcoes aplicadas foi tocado. O achado
      deste registro segue valido e, se ele consome os campos do forecast,
      passa a receber a causa correta em vez de uma falsa.
  - registro: registro-2026-09-02-cultura-invariante-no-gerador-de-evidencia
    caminhos:
      - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
    parecer: >-
      Este commit toca o gerador de evidencia em UM ponto: a resolucao do
      interpretador Python, na linha que decidia se a projecao TimesFM roda, e
      a separacao do status RUNTIME_UNAVAILABLE de INSUFFICIENT_HISTORY.
      Medido: o script resolvia o Python so por .venv\Scripts\python.exe, e em
      Linux caia no ramo `else` reportando falta de HISTORICO quando havia 7
      pontos e o minimo e 4 -- a causa declarada era falsa. Nada da leitura do
      ledger, do recorte por sessao, do portao de suficiencia, do tratamento
      de cultura em datas ou das correcoes aplicadas foi tocado. O achado
      deste registro segue valido e, se ele consome os campos do forecast,
      passa a receber a causa correta em vez de uma falsa.
  - registro: registro-2026-09-02-portao-de-calibracao-por-sessao
    caminhos:
      - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
    parecer: >-
      Este commit toca o gerador de evidencia em UM ponto: a resolucao do
      interpretador Python, na linha que decidia se a projecao TimesFM roda, e
      a separacao do status RUNTIME_UNAVAILABLE de INSUFFICIENT_HISTORY.
      Medido: o script resolvia o Python so por .venv\Scripts\python.exe, e em
      Linux caia no ramo `else` reportando falta de HISTORICO quando havia 7
      pontos e o minimo e 4 -- a causa declarada era falsa. Nada da leitura do
      ledger, do recorte por sessao, do portao de suficiencia, do tratamento
      de cultura em datas ou das correcoes aplicadas foi tocado. O achado
      deste registro segue valido e, se ele consome os campos do forecast,
      passa a receber a causa correta em vez de uma falsa.
  - registro: registro-2026-09-05-fechamento-do-ciclo-de-calibracao
    caminhos:
      - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
    parecer: >-
      Este commit toca o gerador de evidencia em UM ponto: a resolucao do
      interpretador Python, na linha que decidia se a projecao TimesFM roda, e
      a separacao do status RUNTIME_UNAVAILABLE de INSUFFICIENT_HISTORY.
      Medido: o script resolvia o Python so por .venv\Scripts\python.exe, e em
      Linux caia no ramo `else` reportando falta de HISTORICO quando havia 7
      pontos e o minimo e 4 -- a causa declarada era falsa. Nada da leitura do
      ledger, do recorte por sessao, do portao de suficiencia, do tratamento
      de cultura em datas ou das correcoes aplicadas foi tocado. O achado
      deste registro segue valido e, se ele consome os campos do forecast,
      passa a receber a causa correta em vez de uma falsa.
  - registro: agent-calibration-daily-2026-09-02
    caminhos:
      - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
    parecer: >-
      Este commit toca o gerador de evidencia em UM ponto: a resolucao do
      interpretador Python, na linha que decidia se a projecao TimesFM roda, e
      a separacao do status RUNTIME_UNAVAILABLE de INSUFFICIENT_HISTORY.
      Medido: o script resolvia o Python so por .venv\Scripts\python.exe, e em
      Linux caia no ramo `else` reportando falta de HISTORICO quando havia 7
      pontos e o minimo e 4 -- a causa declarada era falsa. Nada da leitura do
      ledger, do recorte por sessao, do portao de suficiencia, do tratamento
      de cultura em datas ou das correcoes aplicadas foi tocado. O achado
      deste registro segue valido e, se ele consome os campos do forecast,
      passa a receber a causa correta em vez de uma falsa.
  - registro: registro-2026-09-07-procedencia-do-timesfm-e-json-do-cli
    caminhos:
      - tests/test_timesfm_agent_calibration.py
    parecer: >-
      Aquele registro ancora este teste pela PROCEDENCIA da projecao: a
      evidencia nao pode atribuir a projecao ao modelo do Google enquanto nenhum
      peso for carregado. Essa asercao permanece intacta e continua sendo
      exercida -- o teste segue verificando intended_model,
      weights_loaded is False e model_used comecando por
      analytic-linear-extrapolation. O que muda e de ONDE vem o historico: em
      vez do ledger canonico da maquina, um ledger sintetico em tmp_path. Isso
      REFORCA o registro, porque a asercao de procedencia passa a ser verificada
      sobre dados controlados em vez de sobre o que houver na estacao de quem
      roda.
referencias_nao_resolviveis: []
---

# O teste media o ledger da maquina, nao o contrato do script

## Onde o CI parou

Corrigidos Ruff, WASM, Prisma e a resolucao de Python cross-platform, o CI
chegou a **1012 passed, 18 skipped, 1 failed**, com o job de frontend em
SUCCESS. A unica falha restante:

```
AssertionError: assert 'INSUFFICIENT_HISTORY' == 'PROJECTION_ACTIVE'
```

## A causa

O teste executava `New-AgentCalibrationDailyEvidence.ps1` **sem** passar
`-LedgerPath`. O script entao lia o ledger canonico do repositorio -- e
`reports/agent-calibration/feedback-ledger.jsonl` **nao e versionado**:
`git ls-files` daquele diretorio devolve o `README.md` e os `daily/*.md`, e nada
mais.

Na minha estacao havia 18 pontos de historico, e o status vinha
`PROJECTION_ACTIVE`. No runner, sem ledger, vinha `INSUFFICIENT_HISTORY`.

**O teste media o estado da maquina.** O contrato que ele deveria verificar e
outro: *havendo historico suficiente, o gerador projeta*. Um teste preso ao
ledger real alterna de veredito conforme quem o roda, e e exatamente o padrao
que a memoria `teste-que-mede-o-estado-nao-o-contrato` descreve.

## A correcao ja estava prevista no script

O `New-AgentCalibrationDailyEvidence.ps1` declara, nos proprios parametros:

> *"Caminhos injetaveis para permitir guard hermetico em tmp_path. Vazio usa os
> canonicos do repositorio."*

`-LedgerPath` e `-OutlierLedgerPath` existiam para isto, e outros testes da
suite ja os usavam. O molde de ledger encadeado foi reaproveitado de
`test_calibracao_fechamento_do_ciclo.py` em vez de reinventado.

Nao havia, portanto, nada a construir: havia uma capacidade pronta que este
teste nao consumia.

## Uma armadilha medida no caminho

Criar o arquivo de outliers **vazio** derruba o script:

```
Test-AgentCalibrationLedger.ps1:50 -> throw 'Ledger exists but is empty.'
```

Caminho **inexistente**, ao contrario, e tratado como "sem outliers" e funciona.
A distincao e sutil o bastante para reaparecer, entao esta escrita no proprio
teste, ao lado da linha que deliberadamente **nao** cria o arquivo.

Provado na mao antes de ajustar o teste: com ledger sintetico de 7 feedbacks e
outliers ausente, a saida traz `status=PROJECTION_ACTIVE`, `history_points=7`.

## O que mudou de veredito

| | antes | depois |
| :--- | :--- | :--- |
| arquivo isolado | **1 failed**, 7 passed | **8 passed** |
| suite completa | 1030 passed | 1030 passed |
| CI | `INSUFFICIENT_HISTORY` | a medir no push |

A falha isolada era **pre-existente** -- confirmei por `git stash` antes de
tocar em qualquer coisa. Ela sumiu porque a causa raiz saiu, e nao porque foi
contornada: o teste agora constroi os dados de que precisa.

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Proposito:** tornar hermetico o guard do TimesFM, consumindo a injecao de
caminhos que o script ja oferecia, para que ele meça o contrato em vez do
ledger que por acaso existe na maquina.
