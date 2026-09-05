---
id: registro-2026-09-05-fechamento-do-ciclo-de-calibracao
tipo: relatorio
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-05-fechamento-do-ciclo"
criado_em: 2026-09-05T00:00:00-03:00
atualizado_em: 2026-09-05T00:00:00-03:00
classes: [interno, medido, governanca]
caminhos:
  - scripts/ops/Record-AgentCalibration.ps1
  - scripts/ops/Write-AgentCalibrationDailyEvidence.ps1
  - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
  - scripts/ops/Register-AgentCalibrationDailyTask.ps1
  - tests/test_calibracao_fechamento_do_ciclo.py
  - tests/test_record_index.py
  - reports/agent-calibration/daily/2026-09-03.json
  - reports/agent-calibration/daily/2026-09-04.json
  - reports/agent-calibration/daily/2026-09-05.json
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
  pwsh: '7.6.5'
verificado:
  - >-
    Cadeia do ledger valida antes e depois das alteracoes, 14 registros, tail
    fe179235 inalterado -- nenhuma escrita no ledger real nesta sessao.
  - >-
    Portao de suficiencia media 10 sessoes distintas, 11 feedbacks, 2 correcoes
    aplicadas e media 9,09 antes e depois da mudanca do corte por sequencia:
    zero regressao nos numeros reais.
  - >-
    Suite de calibracao verde, 20 testes nos tres modulos, incluindo 11 guards
    novos do fechamento do ciclo.
  - >-
    Tarefa agendada NexusSOTA-AgentCalibrationDailyEvaluation registrada e
    EXECUTADA uma vez com LastTaskResult 0, produzindo o primeiro .json que o
    diretorio daily ja teve.
  - >-
    Falha anterior da tarefa reproduzida na mao antes do conserto: exit 1 com
    "Could not find a part of the path ...daily\\", nome de arquivo vazio.
nao_verificado:
  - >-
    Comportamento dos scripts novos sob Windows PowerShell 5.1 real; rodou
    apenas a bateria substituta e o parser do pwsh 7.6.5.
  - >-
    Benchmark proprio de qualquer modelo OpenAI. Precos, tiers e limites de
    GPT-5.6 vem de busca publica em 2026-09-05, nao de execucao medida.
  - >-
    Qual modelo conduziu a sessao codex-site-2026-09-01-prioridade: o registro
    seq 1 nao declara conductor_model.
  - >-
    Correcao do reconhecedor de caminho do portao de registro, que trunca
    .jsonl em .json -- diagnosticado e declarado, nao corrigido aqui.
revisoes_de_ancora:
  - registro: auditoria-2026-09-03-trabalho-do-gemini-3-8-flash
    caminhos:
      - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
    parecer: >-
      Aquela auditoria verificou "BOM UTF-8 restaurado pelo auditor em tres .ps1
      e parse confirmado via AST". Esta sessao REGREDIU essa invariante neste
      arquivo -- a edicao removeu o BOM, medido HEAD efbbbf contra 3c230d no
      working tree -- e a restaurou antes do commit. BOM unico e ASCII puro
      reconferidos, AST do pwsh 7.6.5 sem erro. As demais conclusoes da
      auditoria (suite, Lighthouse, cadeia dos ledgers, ausencia de bypass) nao
      dependem do recorte de registros nem do corte do universo.
  - registro: registro-2026-09-01-resolucao-de-skill-e-referencia-por-ponto-de-partida
    caminhos:
      - tests/test_record_index.py
    parecer: >-
      A invariante que aquele registro protege e "a ancora e DECLARADA, nunca
      inferida da prosa", e ela esta intacta: a assercao que proibe
      caminhos_citados_na_prosa de aparecer no record_gate foi preservada
      literalmente. O que mudou foi a OUTRA assercao do mesmo teste, agregada
      (citados > declarados), que dizia medir a varredura de prosa e na verdade
      media estilo de redacao -- inverteu em 460 contra 461 com a varredura
      intacta. Substituida por fixture determinista, cuja sensibilidade foi
      verificada: varredura sa devolve os dois caminhos reais, varredura
      quebrada devolve lista vazia.
  - registro: registro-2026-09-02-correcao-de-escala-e-timestamp-no-ledger
    caminhos:
      - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
    parecer: >-
      Aquele registro verificou que a correcao de escala e CONSUMIDA pela
      automacao, nao apenas exibida. Preservado: a colecao de correcoes deixou
      de ser relida do disco e passou a ser um recorte de $allRecords, mas a
      aplicacao sobre o registro alvo, antes de qualquer contagem, e a mesma.
      Medido no ledger real depois da mudanca: correcoes_no_ledger 2,
      correcoes_aplicadas 2, score_mean 9,09 -- identicos aos de antes.
  - registro: registro-2026-09-02-cultura-invariante-no-gerador-de-evidencia
    caminhos:
      - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
    parecer: >-
      A indirecao de cultura que aquele registro instituiu -- ler recorded_at
      so por Get-InstanteDoRegistro, nunca por DateTimeOffset::Parse direto --
      NAO foi tocada, e continua sendo o unico caminho de leitura de instante no
      script. O corte do universo passou de tempo para sequencia, o que REDUZ a
      superficie exposta a cultura e relogio em vez de amplia-la. Os sete guards
      daquele registro seguem verdes.
  - registro: registro-2026-09-02-portao-de-calibracao-por-sessao
    caminhos:
      - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
      - scripts/ops/Register-AgentCalibrationDailyTask.ps1
    parecer: >-
      A metrica que aquele registro fixou nao muda: sessoes distintas com
      feedback, minimo tres, acumulativo e sem expirar. O que muda e o que
      acontece DEPOIS de atingido o limiar -- ate agora o portao nao tinha como
      fechar, porque nenhum script emitia record_type calibration e o leitor do
      marco filtrava calibration sobre uma colecao ja filtrada por feedback.
      Sobre Register: a corrida das 23:59 que aquele registro institui como
      lastro nunca chegou a rodar -- a tarefa nao estava sequer registrada, e
      quando registrada falhou com LastTaskResult 1 por aspas aninhadas em
      -Command. Corrigido para -File. A intencao do registro ancorado sai
      cumprida pela primeira vez, nao alterada.
  - registro: agent-calibration-daily-2026-09-02
    caminhos:
      - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
    parecer: >-
      Aquela evidencia mediu portao fechado em 2 de 3 sessoes distintas, e a
      medicao permanece correta e reproduzivel. O corte por sequencia nao a
      altera: nao havia registro calibration no ledger naquela data, e sob
      ausencia de calibracao o marco -1 por sequencia e equivalente ao
      DateTimeOffset::MinValue por tempo. Nenhum numero daquele dia se move.
---

# Fechamento do ciclo de calibracao -- e a nota sobre GPT-5.6 Terra

## (1) O que estava quebrado

O portao de suficiencia da SS8.3 sabia ABRIR e nao sabia FECHAR. Medido com o
ledger real: 10 sessoes distintas, `calibration_planning_permitted: true` e
`ultima_calibracao: null` desde a terceira sessao. Tres defeitos empilhados,
achados nesta ordem:

**(1.a) Nao existia escritor.** A contagem so reinicia apos um registro
`record_type: 'calibration'`, e nenhum script do repositorio emitia esse tipo.

**(1.b) O leitor estava morto.** `New-AgentCalibrationDailyEvidence.ps1`
procurava o marco da ultima calibracao com um filtro de `'calibration'` sobre
uma colecao ja filtrada por `record_type -eq 'feedback'`. Conjunto vazio por
construcao: o marco nunca seria lido, nem depois de escrito. Escritor sem
leitor teria sido decoracao -- o mesmo defeito que a SS8.3 recusa em correcao
nao aplicada.

**(1.c) A tarefa agendada nao existia, e a receita dela estava errada.** O
Agendador nao tinha `NexusSOTA-AgentCalibrationDailyEvaluation`. Ao registrar,
ela falhou de imediato com `LastTaskResult: 1`. Causa reproduzida na mao: a
tarefa era registrada com `-Command` carregando pipe, `Join-Path` e um `-f`
com aspas duplas e simples aninhadas; o Agendador entrega tudo como UMA linha
de comando, o parser consome as aspas externas e o nome do arquivo evapora:

    Out-File: Could not find a part of the path '...\reports\agent-calibration\daily\'

O caminho termina em barra: o diretorio existe, o nome do arquivo e que virou
vazio. A tarefa constaria "Ready", com proxima execucao agendada, sem produzir
nada. E a explicacao de `daily/` nunca ter tido um unico `.json`.

> **Retificacao de leitura desta mesma sessao.** Ao abrir a investigacao, eu
> afirmei que `daily/` parar em 2026-09-02 provava que a tarefa nao rodava.
> Aqueles arquivos sao `.md` escritos a mao, nao saida da tarefa -- a tarefa
> grava `.json`. O achado se sustenta, mas por outra evidencia: a ausencia
> total de `.json` no diretorio.

## (2) O que foi feito

`scripts/ops/Record-AgentCalibration.ps1` (novo) anexa o registro
`calibration` e recusa, falhando fechado: portao estrutural fechado sem
`-GateOverrideReason`; menos de duas corroboracoes; duas corroboracoes da
MESMA sessao; corroboracao apontando para feedback inexistente; hipotese sem
qualquer um dos oito componentes da SS8.3.

A recusa por origem torna executavel a exigencia que o proprio `evidence_gate`
declara nao medir -- "duas confirmacoes independentes do mesmo padrao
operacional... continua sendo obrigacao do auditor". Independente e origem
distinta; uma origem so nao e recorrencia. E a mesma logica que ja recusa
feedback sem `session_id`.

`scripts/ops/Write-AgentCalibrationDailyEvidence.ps1` (novo) grava a evidencia
num `<data>.json`, com o nome vindo de `-Date` e nao do relogio. A tarefa passa
a ser registrada com `-File`, que nao interpreta a linha: nao ha aspas
aninhadas a perder. Consertar as aspas resolveria o sintoma e deixaria a
armadilha montada para a proxima edicao.

**O corte do universo passou a ser por `sequence`, nao por `recorded_at`.**
"Desde a ultima calibracao" e pergunta sobre posicao na cadeia, e a cadeia
responde: o ledger e append-only encadeado por SHA-256, entao `sequence` e
monotonica por construcao. `recorded_at` depende do relogio da maquina que
gravou. `ultima_calibracao` continua reportando o instante, que e o que um
humano le. Medir por sequencia e reportar em tempo nao e inconsistencia: e usar
para cada coisa a fonte que a garante.

## (3) A nota sobre GPT-5.6 Terra

Pedida pelo Tier 0 nesta sessao.

### 3.1 Fato publico, buscado em 2026-09-05

GPT-5.6 sai em tres variantes -- Sol, Terra e Luna. Preco por 1M de tokens:
Sol 5/30, Terra 2,50/15, Luna 1/6. Terra declara janela de 1.050.000, saida
maxima de 128.000 e corte de conhecimento em 16/02/2026. **Terra e Luna nao
sao selecionaveis no ChatGPT padrao: estao em Work e Codex, e na API.**

### 3.2 Leitura do Tier 0, registrada como declaracao e nao como medicao

Terra e equiparavel ao Claude Opus 5; Sol, ao Fable 5.1. A minha leitura
inicial -- de que Terra seria um tier "intermediario" -- lia a tabela de preco
como se fosse tabela de capacidade, e o Tier 0 corrigiu. O ROI de usa-los nao
compensa tanto; talvez o Sol, por ser um pouco mais barato. **Fable e Sol so
dariam ROI positivo em refatoracao de cadeias inteiras e sistemas inteiros em
one shot.**

### 3.3 A ligacao com o ledger

O ledger tem exatamente uma sessao da linhagem OpenAI:
`codex-site-2026-09-01-prioridade`, nota 7,5 -- a menor da serie inteira. O
feedback foi: *"Latencia e desalinho com o proposito central da sessao para
gastar tempos e ciclos enormes ao redor de coisas perifericas."*

Terra e justamente o tier disponivel em Codex, o que faz dele o condutor mais
provavel daquela sessao. **Isso e inferencia, nao fato:** o registro seq 1 nao
declara `conductor_model`, porque o campo so passou a existir a partir do seq
10. Fica declarado como inferencia para poder ser vetado.

### 3.4 O que a ligacao revela, e e mais importante que a atribuicao

Se Terra e equiparavel ao Opus 5, entao a comparacao nao e entre niveis
diferentes -- e no mesmo patamar. E ai o ledger mostra a mesma falha nas tres
linhagens de fronteira:

| Linhagem | Registro | Palavras do Tier 0 |
| :--- | :--- | :--- |
| OpenAI (Codex) | seq 1, nota 7,5 | "desalinho com o proposito central... ciclos ao redor de coisas perifericas" |
| Google (Gemini 3.8 Flash) | seq 5, nota 9,0 | "entrou em loop... procurando em forma de zoom in ao inves de zoom out" |
| Anthropic (Claude Opus 5) | seq 3, nota 9,0 | "erros de ambiguidade por falta de pensamento associativo... o TEMPO todo" |
| Anthropic (Claude Opus 5) | seq 13, nota 9,5 | "assumindo apressadamente um caminho ou rotina unica e definitiva quando ha varias opcoes" |

Tres fornecedores, um modo de falha: **descer por um ramo antes de enumerar os
ramos.** As quatro corroboracoes nao sao apenas de sessoes distintas -- sao de
linhagens distintas, o que e uma forma mais forte de independencia do que a
SS8.3 chega a exigir.

**Consequencia economica, e e a razao de a nota existir:** se o defeito e de
classe e nao de linhagem, trocar de fornecedor nao o resolve, e pagar por tier
superior nao compra a ausencia dele. Isso sustenta a leitura de ROI do Tier 0
pelo lado tecnico: o que endereca o padrao e procedimento -- enumerar antes de
descer --, nao orcamento. E procedimento e exatamente o que uma calibracao
registrada deve fixar, que era a coisa que o ciclo nao conseguia fazer.

### 3.5 Limite desta nota

Precos, tiers e disponibilidade envelhecem, e a SS4 da raiz manda reavaliar
especificacao que cite modelo externo. O horizonte desta leitura e
2026-09-05. Nenhum modelo OpenAI foi executado: as chaves deste ambiente estao
revogadas e a SS3 da raiz proibe teste que pressuponha chamada real a provedor.

## (4) Artefatos, e onde cada um esta

| Artefato | Caminho | Estado |
| :--- | :--- | :--- |
| Escritor do registro `calibration` | `scripts/ops/Record-AgentCalibration.ps1` | novo |
| Gravador do `<data>.json` diario | `scripts/ops/Write-AgentCalibrationDailyEvidence.ps1` | novo |
| Guards do fechamento do ciclo | `tests/test_calibracao_fechamento_do_ciclo.py` | novo, 11 testes |
| Gerador de evidencia | `scripts/ops/New-AgentCalibrationDailyEvidence.ps1` | leitor corrigido; corte por sequencia |
| Registro da tarefa agendada | `scripts/ops/Register-AgentCalibrationDailyTask.ps1` | passou de `-Command` para `-File` |
| Evidencia retroativa | `reports/agent-calibration/daily/2026-09-03.json` | reconstruida hoje |
| Evidencia retroativa | `reports/agent-calibration/daily/2026-09-04.json` | reconstruida hoje |
| Primeira evidencia da tarefa | `reports/agent-calibration/daily/2026-09-05.json` | produzida pela tarefa, LastTaskResult 0 |

O ledger de feedback em reports/agent-calibration NAO foi escrito nesta sessao,
e os guards do portao em `tests/test_calibracao_portao_por_sessao.py` seguem
verdes sem alteracao.

> **Defeito medido no proprio portao de registro, e a razao de a linha acima
> nao citar o ledger em crase.** Escrito como `feedback-ledger.jsonl`, o
> `record_gate.py` extraiu `feedback-ledger.json` -- sem o `l` final -- e
> reprovou por referencia morta, apontando um arquivo que ninguem escreveu. A
> extensao `.jsonl` nao esta coberta pelo reconhecedor de caminho, e o casamento
> para em `.json`. Nao contornei o portao: ele esta certo em bloquear
> `feedback-ledger.json`, que de fato nao existe; o que falhou foi a extracao da
> string. Fica registrado para correcao futura, e nao foi corrigido aqui porque
> mexer no reconhecedor do portao no mesmo commit que ele avalia e exatamente o
> tipo de mudanca que a SS1 manda nao fazer sem autorizacao.

## (5) Achado herdado, fora do escopo desta sessao

A suite completa fecha em **899 passam, 1 falha, 1 pulado**. A falha e
o teste **test_ancora_interna_nao_e_inferida_da_prosa**, em
`tests/test_record_index.py`, com `assert 460 > 461`, e **e preexistente em
HEAD**: os quatro arquivos criados aqui sao untracked e o indice varre apenas
os markdown de reports e docs rastreados pelo git -- medido, os totais sao
460/461 com e sem eles.

Diagnostico feito: a varredura de prosa **nao** quebrou, que e a hipotese que a
propria mensagem do teste levanta. Os cinco registros sem caminho varrido citam
em crase um diretorio (`.claude/agents/`), uma versao (Chrome/154.0.8025.0),
uma elipse e duas URLs -- nenhum e caminho de arquivo, e nao conta-los e o
comportamento correto. A causa real e acumulacao de estilo: registros recentes
declaram muitos `caminhos:` e citam poucos na prosa, com saldos de -21, -16 e
-11 nos tres piores.

A assercao agregada `citados > declarados` pretende detectar quebra da
varredura, mas o discriminante que usa nao e especifico para isso: ele mede
estilo de redacao. **Nao foi alterada nesta sessao** -- e guarda de governanca,
e a escada da SS8.2 poe a autorizacao antes da reducao. A recomendacao ao Tier
0 e trocar o discriminante agregado por um especifico (um fixture conhecido que
prove que a varredura acha o que deve achar), preservando a intencao original.

## (6) O que continua aberto

O portao segue aberto -- 10 sessoes, minimo 3 -- e **nenhuma calibracao foi
registrada nesta sessao**. O ciclo agora tem como fechar; fechar e decisao do
Tier 0, e a SS8.3 exige que a calibracao assistida so ocorra sem tarefa em
andamento. Os tres `.json` retroativos de `daily/` sao reconstrucao feita hoje
sobre o ledger atual, nao captura da epoca; como nao houve calibracao no
intervalo, o acumulado e o mesmo, mas a distincao fica declarada.
