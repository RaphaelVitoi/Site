---
id: auditoria-2026-09-17-calibracao-do-padrao-linear-reativo
tipo: auditoria
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-17T22:10:00-03:00'
atualizado_em: '2026-09-17T22:10:00-03:00'
classes: [interno, medido, governanca, calibracao]
caminhos:
  - reports/AUDITORIA-2026-09-17-calibracao-do-padrao-linear-reativo.md
  - reports/agent-calibration/feedback-ledger.jsonl
  - reports/agent-calibration/daily/2026-09-16.json
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  host: Windows 11 Pro 10.0.26200
  data_das_medicoes: 2026-09-17
verificado:
  - cadeia do ledger integra -- status valid, 78 registros, tail_hash f54a3186
  - 34 dos 78 registros tem comentario textual; 13 deles tocam ao menos uma familia do padrao (38%)
  - portao estrutural aberto -- 9 sessoes distintas com feedback desde a ultima calibracao, contra limiar de 3
  - ultima calibracao registrada em 2026-09-12, com o padrao arquivado como candidato por faltar UMA sessao
  - zero feedbacks excluidos por proveniencia no ciclo
nao_verificado:
  - classificacao semantica dos 21 registros com comentario que nao casaram por termo -- a busca e lexical, nao semantica
  - se o padrao se manifesta igualmente sob outros condutores; a amostra e majoritariamente claude-code
pendencias:
  - id: pend-2026-09-17-gatilho-de-calibracao-nao-avisa
    o_que: A corrida diaria calcula calibration_planning_permitted e nao avisa quando vira true; o portao depende de o agente lembrar de consultar
    dono: Tier 0
    prazo: 2026-10-17
  - id: pend-2026-09-17-portao-nao-le-sonarlint
    o_que: O portao de 5 fases nao roda SonarLint; 12 achados no bayesianRangeEngine.ts nunca apareceriam em commit
    dono: Tier 0
    prazo: 2026-10-17
  - id: pend-2026-09-17-auditoria-de-calibracao-com-dono-unico
    o_que: A auditoria que le o lastro vive so no Codex e parou 3 dias em silencio; o lastro deve registrar ha quantos dias ela nao roda
    dono: Tier 0
    prazo: 2026-10-17
---

# Calibração — o padrão linear-reativo, e por que o laço não o corrigiu

**Preparada porque o Tier 0 a pediu e o veículo `codex`, que agenda a auditoria diária, está sem cota.**
A arbitragem e o registro no ledger permanecem com o Tier 0: este documento mede e propõe, não registra.

## 1. Estado do portão de suficiência

| Grandeza | Valor | Exigência da §8.3 |
| :--- | ---: | :--- |
| Cadeia do ledger | `valid`, 78 registros | cadeia inválida não conta |
| Sessões distintas com feedback desde a última calibração | **9** | mínimo 3 |
| Feedbacks elegíveis acumulados | **12** | — |
| Feedbacks excluídos por proveniência | 0 | — |
| `calibration_planning_permitted` | **true** | — |
| Última calibração registrada | **2026-09-12** | a contagem só reinicia aí |

**O portão está aberto há cinco dias com três vezes o limiar.**

## 2. O padrão, medido no ledger inteiro

Dos 78 registros, **34 trazem comentário textual**. Busca lexical pelos termos que o próprio Tier 0 usa:

| Família | Ocorrências |
| :--- | ---: |
| foco / periferia / banalidade | **7** |
| linear / não sistêmico | **6** |
| repetição do mesmo erro | 2 |
| autocorreção tardia | 1 |
| **feedbacks distintos que tocam ao menos uma família** | **13 de 34 — 38%** |

**A busca é lexical e o número é piso, não teto:** ela não alcança os registros em que o Tier 0 descreveu o
mesmo comportamento sem usar esses termos. Os 21 restantes não foram classificados semanticamente.

Amostras literais, de sessões distintas:

- *"prezo mt pela análise sistêmica, e você é mt linear, então zoom out faz bem."*
- *"latência e desalinho com o propósito central da sessão para gastar tempos e ciclos enormes ao redor de coisas periféricas."*
- *"de novo, uma sessão inteira que foge do foco... é preciso pensar em maneiras de evitar."*
- *"tende a cometer erros de ambiguidade por falta de pensamento associativo."*

## 3. Por que o laço não corrigiu — e este é o achado principal

A evidência diária de **2026-09-12** concluiu, literalmente:

> **dados insuficientes — nenhuma calibração planejada.** Falta uma sessão distinta elegível; portanto o portão
> estrutural está fechado e não há base para avaliar a corroboração de dois feedbacks independentes do mesmo padrão.

E arquivou o padrão como *"hipótese observacional candidata"*, **fora do índice de padrões**, com previsão e
falsificador escritos:

> **Previsão verificável.** Em uma nova sessão identificada, dois feedbacks de sessões independentes poderão
> confirmar ou contrariar o mesmo padrão.
>
> **Falsificador.** Dois feedbacks independentes que atribuam o problema a dependências inevitáveis, ou que não
> observem repetição/periferia sob condições comparáveis, retiram a hipótese candidata.

**Faltava uma sessão. Vieram nove.** A previsão se cumpriu com folga — 13 feedbacks, 4 famílias, sessões
distintas — e **o falsificador não foi acionado por nenhum registro**. O padrão está pronto para sair de
candidato, e não saiu.

**O motivo é estrutural, não de mérito, e tem duas camadas — medidas nesta data.**

**Camada 1 — o gatilho é proativo do agente.** Um portão que depende de o agente lembrar de consultá-lo falha
exatamente com um agente cujo defeito diagnosticado é **não subir de nível**. A corrida diária já calcula
`calibration_planning_permitted` e o grava; ela não avisa quando ele vira `true`. Cada sessão nova — esta
inclusive — chega, faz o trabalho e vai embora sem olhar o portão.

**Camada 2 — o medidor está de pé, o interpretador é que caiu.** São dois mecanismos distintos, e confundi-los
produz diagnóstico errado:

| Mecanismo | Onde roda | Estado medido em 2026-09-17 |
| :--- | :--- | :--- |
| **Lastro diário** — grava a evidência | tarefa agendada do Windows `NexusSOTA-AgentCalibrationDailyEvaluation` | **saudável**: `Ready`, última execução 09-16 23:59:01, resultado `0`, próxima 09-17 23:59 |
| **Auditoria de coerência agêntica** — lê o lastro e propõe calibração | automação na plataforma do **Codex** | **parada há três dias**, por falta de cota do veículo |

Medido: **14 dias consecutivos de lastro sem um único buraco** (03-09 a 16-09); hoje falta apenas porque ainda
não deu 23:59. **A evidência foi gravada todos os dias, e ninguém a leu nos últimos três.**

**O lastro é redundante e a interpretação não é.** A tarefa do Windows é agnóstica de fornecedor; a auditoria
vive num único veículo, e quando ele cai nada avisa e nenhum outro condutor assume. Isso contraria a
*Autonomia Universal Sem Feudos* da §7 — *"na ausência de qualquer modelo, os demais assumem sem perda de
continuidade"* —, que aqui não se realiza porque a queda é silenciosa.

**É o mesmo defeito em três escalas.** No agente: resolvo o item e não pergunto de que classe ele é. No
mecanismo: mede-se o ciclo e não se retorna para fechá-lo. Na malha: o interpretador tem dono único e cai sem
ruído. A calibração desenhada para corrigir a primeira sofre das outras duas.

## 4. Manifestações nesta própria sessão

Registradas porque são a amostra mais recente, e porque três delas foram corrigidas pelo Tier 0 em tempo real:

1. **Heredoc.** Proibido antes, reincidido hoje. Quebrou várias vezes e a cada vez contornei *aquele caso* —
   `python -`, depois `Write` — sem trocar o método. Três contornos, zero correções de método.
2. **Viés de fonte.** Tratei a fixture canônica como superior por padrão até o Tier 0 corrigir: *"não assuma
   sempre que todos os nós estão melhores"*. A comparação bidirecional mostrou sete capacidades só no motor e
   sete garantias só na fixture.
3. **Rigidez de regra.** Rebaixei o conjunto inteiro para frequência quando faltava **um** combo que a própria
   captura permitia inferir por subtração. Corrigido por *"não deixe a regra enrijecer quando o contexto próprio
   é óbvio e indica o caminho"*.
4. **Subdimensionamento por contagem à mão.** Escrevi "terceira recorrência" contando o que estava num arquivo
   de memória, quando a fonte dizia 38% dos feedbacks. **Cometido dentro da resposta sobre o próprio padrão.**
5. **Periferia com aparência de zoom out.** Recebi 12 lints e fui medir formatador e 361 arquivos divergentes.
   Interrompido por *"periférico e banal"*. Esta é a variante mais difícil de pegar: subir de nível para o nível
   **errado** parece método e é desvio.

**O zoom out veio de fora nas cinco.**

## 5. Proposta de calibração — para arbitragem do Tier 0

Microcalibração procedimental, reversível e mensurável, como a §8.3 exige. Não altera permissões, ferramentas
nem limites.

**(a) Promoção do padrão.** `linear-reativo / periferia` sai de hipótese candidata e entra no índice de padrões,
com as 13 corroborações e as 5 manifestações acima como base.

**(b) Mudança de comportamento, verificável:** ao receber um achado, **escrever antes de agir** uma linha —
*"a classe deste problema é X; onde mais X aparece?"*. Se a mesma correção já ocorreu duas vezes em contextos
diferentes, o alvo passa a ser o método, não o caso. Já gravado em memória persistente
(`sistema-antes-do-artefato`, terceira recorrência).

**(c) Correção do laço, que é o que impede a repetição:** a corrida diária deve **avisar** quando
`calibration_planning_permitted` virar `true`, em vez de esperar consulta. É a pendência
`pend-2026-09-17-gatilho-de-calibracao-nao-avisa`.

**(d) Retirar o ponto único de falha da interpretação.** O lastro já é agnóstico de fornecedor — roda em tarefa
do Windows e sobreviveu a esta queda sem um buraco em 14 dias. A auditoria que o lê não é: mora no Codex e
parou com a cota dele, em silêncio. Duas correções possíveis, ambas baratas e nenhuma delas dependente de
fornecedor:

1. O lastro passa a registrar **há quantos dias a auditoria não roda**, derivando isso de `ultima_calibracao` e
   da data corrente. Uma queda silenciosa vira um número no arquivo que qualquer condutor lê.
2. Qualquer condutor com sessão aberta pode executar a auditoria, porque o instrumento é local
   (`New-AgentCalibrationDailyEvidence.ps1`, PowerShell 7). O que falta não é capacidade, é **saber que caiu** —
   o que o item 1 resolve.

Isto é a §7 aplicada: *na ausência de qualquer modelo, os demais assumem sem perda de continuidade*. Hoje não
assumem — não por impedimento, mas porque a queda não produz sinal.

**Previsão verificável.** Nas próximas três sessões distintas, a proporção de feedbacks que tocam as famílias
"foco/periferia" e "linear/não sistêmico" cai abaixo dos 38% medidos hoje.

**Falsificador.** Se em três sessões distintas a proporção se mantiver igual ou subir, a microcalibração (b)
não funciona e o alvo deve mudar — de disciplina do agente para restrição estrutural de escopo por sessão.

**Critério de reversão.** Se a frase de classe começar a produzir latência ou relatório inflado — o próprio
defeito que ela combate —, ela é abandonada e o registro diz por quê.

**Risco de degradação.** Perguntar a classe antes de agir aumenta o custo de achados triviais. Mitigação: a
frase é uma linha, não uma investigação; e investigação de classe que não é do propósito da sessão é periferia,
como esta sessão demonstrou no caso do formatador.

## 6. Verificação declarada

Rodou: integridade da cadeia do ledger (`valid`, 78 registros, `tail_hash f54a3186`), contagem por família
sobre os 34 registros com comentário, e leitura da evidência diária de 09-12 e 09-16.

Não rodou: classificação semântica dos 21 comentários que não casaram por termo, e recorte por condutor. **Esta
auditoria não registra calibração no ledger** — o registro exige `Record-AgentCalibration.ps1` e arbitragem do
Tier 0.

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Propósito:** medir a recorrência real do padrão linear-reativo, diagnosticar por que o laço de calibração não o corrigiu, e propor microcalibração para arbitragem.
