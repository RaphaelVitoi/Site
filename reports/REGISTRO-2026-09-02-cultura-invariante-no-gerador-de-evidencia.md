---
id: registro-2026-09-02-cultura-invariante-no-gerador-de-evidencia
tipo: relatorio
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: 2026-09-02T09:27:56-03:00
atualizado_em: 2026-09-02T09:27:56-03:00
classes: [interno, medido, governanca, correcao]
caminhos:
  - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
  - tests/test_calibracao_portao_por_sessao.py
  - reports/agent-calibration/daily/2026-09-02.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  cultura_do_processo: pt-BR
  pwsh: 7.6.5
  python_da_suite: '3.14.6'
revisoes_de_ancora:
  - registro: registro-2026-09-02-portao-de-calibracao-por-sessao
    caminhos:
      - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
    parecer: >-
      Revisado e mantido valido. Aquele registro descreve a REGRA do portao --
      metrica por sessoes distintas, densidade como dado retido, acumulacao sem
      expiracao. Esta correcao nao toca regra alguma: troca apenas a cultura de
      leitura de `recorded_at`, de CurrentCulture para InvariantCulture, dentro
      do mesmo script. Os sete guards que aquele registro declara como garantia
      continuam sendo a garantia, e passaram de 3/7 para 7/7 nesta maquina. A
      ancora segue apontando para codigo vivo e correto; nao ha o que superseder
      nem numero daquele registro a reescrever.
verificado:
  - defeito reproduzido isoladamente sob pt-BR, com as duas manifestacoes distintas por faixa de dia
  - 4 dos 7 guards de tests/test_calibracao_portao_por_sessao.py reprovavam antes da correcao
  - os 7 guards passam depois da correcao, com a bateria SOTA em zero erros e zero warnings
  - feedback_count_no_dia saiu de 0 para 1 e score_mean_no_dia de null para 0.8 na evidencia real
  - BOM UTF-8 unico preservado no .ps1 e arquivo sem erro de parse
nao_verificado:
  - comportamento sob culturas diferentes de pt-BR e en-US
  - sob qual cultura rodou a corrida que o handoff registrou como 778 aprovados e zero falhas
  - origem da divergencia entre 3 registros citados no handoff e 2 medidos no ledger
supersede: null
---

# Cultura invariante na leitura de `recorded_at`

## O que estava errado

`New-AgentCalibrationDailyEvidence.ps1` lia o campo `recorded_at` do ledger com
`[DateTimeOffset]::Parse` **sem cultura explícita**, em cinco pontos. A cadeia
completa:

1. `ConvertFrom-Json` converte a string ISO-8601 num `[DateTime]`.
2. `[string]$_.recorded_at` volta para texto usando a **InvariantCulture**, que
   escreve `MM/dd/yyyy`.
3. `[DateTimeOffset]::Parse` relê com a **CurrentCulture** — em pt-BR,
   `dd/MM/yyyy`.

Quem escreveu e quem leu discordavam do significado dos dois primeiros campos.

## As duas manifestações, medidas

| Faixa | Comportamento | Evidência |
| --- | --- | --- |
| dia ≤ 12 | troca silenciosa, sem erro | `2026-09-02T08:27:56` lido como `2026-02-09` |
| dia > 12 | exceção, script aborta | `'09/18/2026 10:00:00' was not recognized as a valid DateTime` |

A primeira é a mais perigosa das duas: não emite erro, e corrompe o recorte
diário produzindo um relatório de auditoria com números plausíveis e falsos. Foi
exatamente o que aconteceu — a versão anterior de
`reports/agent-calibration/daily/2026-09-02.md` declarou `feedback_count: 0` num
dia que teve feedback, e a retificação está registrada na seção `(0)` daquele
arquivo.

A segunda tinha prazo: a partir de **13 de setembro de 2026** todo dia do mês
excede 12, e o gerador de evidência deixaria de rodar por completo nesta
máquina.

## Por que sobreviveu

Em `en-US`, `MM/dd/yyyy` de escrita e `MM/dd/yyyy` de leitura coincidem, e o
defeito é rigorosamente invisível — nenhuma das duas manifestações ocorre. O
registro anterior mediu em container Linux com a suíte em 778 aprovados e zero
falhas; sob qual cultura aquela corrida rodou não foi apurado, e permanece em
`nao_verificado`. O que se afirma aqui é apenas o medido: **sob pt-BR, nesta
máquina, em 2026-09-02, quatro dos sete guards reprovavam.**

## A correção

As cinco chamadas passam agora por uma função única,
`Get-InstanteDoRegistro`, que fixa `[cultureinfo]::InvariantCulture` — a mesma
cultura que escreveu o texto. A indireção existe para ter **um** lugar onde a
armadilha está documentada, e o comentário acima dela explica o mecanismo para
que ninguém a remova por parecer redundante.

Nenhuma regra do portão foi tocada: métrica, limiar, tratamento de densidade,
acumulação e detecção de sessão partida seguem idênticos. Mudou a leitura da
data, e só.

## Falsificador declarado antes da correção

Os sete guards de `tests/test_calibracao_portao_por_sessao.py` foram declarados
como falsificador **antes** de aplicar a mudança: se a hipótese de causa
estivesse errada, eles continuariam reprovando.

| Momento | Guards | Bateria SOTA |
| --- | --- | --- |
| Antes | 3 aprovados, 4 reprovados | — |
| Depois | **7 aprovados** | zero erros, zero warnings, zero não executados |

Efeito na evidência real, não apenas no teste: `feedback_count_no_dia` de `0`
para `1`, `score_mean_no_dia` de `null` para `0.8`, e os instantes por sessão
voltando a `2026-09-02T08:27:56-03:00` e `2026-09-01T04:35:14-03:00`.

## O que esta correção não faz

O veredito do portão **não mudou e não deveria mudar**: seguem `2` de `3`
sessões distintas com feedback, `structural_gate_passed: false`,
`calibration_planning_permitted: false`. A contagem de sessões nunca passou pela
data — só o recorte diário e os campos dele derivados estavam corrompidos.
Quem esperar que esta correção abra o portão entendeu errado o que ela conserta.
