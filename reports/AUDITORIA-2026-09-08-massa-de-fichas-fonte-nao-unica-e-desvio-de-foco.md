---
id: auditoria-2026-09-08-massa-de-fichas-fonte-nao-unica-e-desvio-de-foco
tipo: auditoria
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-08-pmev"
criado_em: 2026-09-08T13:30:00-03:00
atualizado_em: 2026-09-08T13:30:00-03:00
classes: [interno, medido, auditoria, pmev, calibracao]
caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
revisoes_de_ancora:
- registro: auditoria-2026-08-30-coderabbit-resolucao-e-integridade
  caminhos:
  - .claude/agent-memory/chico/HANDOFF_LATEST.md
  parecer: >-
    Ancora o HANDOFF_LATEST para registrar a resolucao do CodeRabbit e a integridade daquela malha. Medido no diff em
    stage: 1 insercao e 0 delecoes no ledger, 54 insercoes e 0 delecoes no
    HANDOFF_LATEST -- APPEND PURO nos dois, nenhuma linha preexistente alterada.
    A cadeia SHA-256 do ledger segue valida (20 registros, exit 0). O que aquele
    registro afirmou sobre esses arquivos continua verdadeiro no ponto em que o
    afirmou: crescer e o comportamento previsto de arquivo append-only.
- registro: auditoria-2026-09-01-retrospectiva-prioridade-sessao
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: >-
    Ancora o ledger de calibracao para registrar a retrospectiva de prioridade daquela sessao. Medido no diff em
    stage: 1 insercao e 0 delecoes no ledger, 54 insercoes e 0 delecoes no
    HANDOFF_LATEST -- APPEND PURO nos dois, nenhuma linha preexistente alterada.
    A cadeia SHA-256 do ledger segue valida (20 registros, exit 0). O que aquele
    registro afirmou sobre esses arquivos continua verdadeiro no ponto em que o
    afirmou: crescer e o comportamento previsto de arquivo append-only.
- registro: auditoria-2026-09-02-curadoria-mcp-e-processos-residuais
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: >-
    Ancora o ledger de calibracao para registrar a curadoria de MCPs e os processos residuais. Medido no diff em
    stage: 1 insercao e 0 delecoes no ledger, 54 insercoes e 0 delecoes no
    HANDOFF_LATEST -- APPEND PURO nos dois, nenhuma linha preexistente alterada.
    A cadeia SHA-256 do ledger segue valida (20 registros, exit 0). O que aquele
    registro afirmou sobre esses arquivos continua verdadeiro no ponto em que o
    afirmou: crescer e o comportamento previsto de arquivo append-only.
- registro: auditoria-2026-09-02-retrospectiva-e-observacao-de-calibracao
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: >-
    Ancora o ledger de calibracao para registrar a observacao de calibracao daquele dia. Medido no diff em
    stage: 1 insercao e 0 delecoes no ledger, 54 insercoes e 0 delecoes no
    HANDOFF_LATEST -- APPEND PURO nos dois, nenhuma linha preexistente alterada.
    A cadeia SHA-256 do ledger segue valida (20 registros, exit 0). O que aquele
    registro afirmou sobre esses arquivos continua verdadeiro no ponto em que o
    afirmou: crescer e o comportamento previsto de arquivo append-only.
- registro: handoff-2026-08-30-resolucao-coderabbit-linters-e-malha-sota
  caminhos:
  - .claude/agent-memory/chico/HANDOFF_LATEST.md
  parecer: >-
    Ancora o HANDOFF_LATEST para registrar a resolucao CodeRabbit e a malha SOTA. Medido no diff em
    stage: 1 insercao e 0 delecoes no ledger, 54 insercoes e 0 delecoes no
    HANDOFF_LATEST -- APPEND PURO nos dois, nenhuma linha preexistente alterada.
    A cadeia SHA-256 do ledger segue valida (20 registros, exit 0). O que aquele
    registro afirmou sobre esses arquivos continua verdadeiro no ponto em que o
    afirmou: crescer e o comportamento previsto de arquivo append-only.
- registro: handoff-2026-09-01-prioridade-pmev-continuacao
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: >-
    Ancora o ledger de calibracao para registrar a priorizacao do PMev. Medido no diff em
    stage: 1 insercao e 0 delecoes no ledger, 54 insercoes e 0 delecoes no
    HANDOFF_LATEST -- APPEND PURO nos dois, nenhuma linha preexistente alterada.
    A cadeia SHA-256 do ledger segue valida (20 registros, exit 0). O que aquele
    registro afirmou sobre esses arquivos continua verdadeiro no ponto em que o
    afirmou: crescer e o comportamento previsto de arquivo append-only.
- registro: handoff-2026-09-02-curadoria-mcp-quarentena-e-roteamento-lazy
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: >-
    Ancora o ledger de calibracao para registrar a quarentena de MCP e o roteamento lazy. Medido no diff em
    stage: 1 insercao e 0 delecoes no ledger, 54 insercoes e 0 delecoes no
    HANDOFF_LATEST -- APPEND PURO nos dois, nenhuma linha preexistente alterada.
    A cadeia SHA-256 do ledger segue valida (20 registros, exit 0). O que aquele
    registro afirmou sobre esses arquivos continua verdadeiro no ponto em que o
    afirmou: crescer e o comportamento previsto de arquivo append-only.
- registro: handoff-2026-09-02-integridade-portao-no-teto-e-fila-para-o-sucessor
  caminhos:
  - .claude/agent-memory/chico/HANDOFF_LATEST.md
  parecer: >-
    Ancora o HANDOFF_LATEST para registrar o portao no teto e a fila do sucessor. Medido no diff em
    stage: 1 insercao e 0 delecoes no ledger, 54 insercoes e 0 delecoes no
    HANDOFF_LATEST -- APPEND PURO nos dois, nenhuma linha preexistente alterada.
    A cadeia SHA-256 do ledger segue valida (20 registros, exit 0). O que aquele
    registro afirmou sobre esses arquivos continua verdadeiro no ponto em que o
    afirmou: crescer e o comportamento previsto de arquivo append-only.
- registro: handoff-2026-09-03-guarda-de-governanca-camada-anthropic-e-cobertura-cve
  caminhos:
  - .claude/agent-memory/chico/HANDOFF_LATEST.md
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: >-
    Ancora o HANDOFF_LATEST e o ledger de calibracao para registrar a guarda de governanca e a cobertura de CVE. Medido no diff em
    stage: 1 insercao e 0 delecoes no ledger, 54 insercoes e 0 delecoes no
    HANDOFF_LATEST -- APPEND PURO nos dois, nenhuma linha preexistente alterada.
    A cadeia SHA-256 do ledger segue valida (20 registros, exit 0). O que aquele
    registro afirmou sobre esses arquivos continua verdadeiro no ponto em que o
    afirmou: crescer e o comportamento previsto de arquivo append-only.
- registro: handoff-2026-09-03-procedencia-de-solve-e-portao-de-reprodutibilidade
  caminhos:
  - .claude/agent-memory/chico/HANDOFF_LATEST.md
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: >-
    Ancora o HANDOFF_LATEST e o ledger de calibracao para registrar a procedencia de solve e o portao de reprodutibilidade. Medido no diff em
    stage: 1 insercao e 0 delecoes no ledger, 54 insercoes e 0 delecoes no
    HANDOFF_LATEST -- APPEND PURO nos dois, nenhuma linha preexistente alterada.
    A cadeia SHA-256 do ledger segue valida (20 registros, exit 0). O que aquele
    registro afirmou sobre esses arquivos continua verdadeiro no ponto em que o
    afirmou: crescer e o comportamento previsto de arquivo append-only.
- registro: handoff-2026-09-03-sessao-outlier-infraestrutura
  caminhos:
  - .claude/agent-memory/chico/HANDOFF_LATEST.md
  parecer: >-
    Ancora o HANDOFF_LATEST para registrar a sessao outlier de infraestrutura. Medido no diff em
    stage: 1 insercao e 0 delecoes no ledger, 54 insercoes e 0 delecoes no
    HANDOFF_LATEST -- APPEND PURO nos dois, nenhuma linha preexistente alterada.
    A cadeia SHA-256 do ledger segue valida (20 registros, exit 0). O que aquele
    registro afirmou sobre esses arquivos continua verdadeiro no ponto em que o
    afirmou: crescer e o comportamento previsto de arquivo append-only.
- registro: handoff-2026-09-04-google-workspace-skill-e-curadoria-de-midia
  caminhos:
  - .claude/agent-memory/chico/HANDOFF_LATEST.md
  parecer: >-
    Ancora o HANDOFF_LATEST para registrar a skill de Google Workspace e a curadoria de midia. Medido no diff em
    stage: 1 insercao e 0 delecoes no ledger, 54 insercoes e 0 delecoes no
    HANDOFF_LATEST -- APPEND PURO nos dois, nenhuma linha preexistente alterada.
    A cadeia SHA-256 do ledger segue valida (20 registros, exit 0). O que aquele
    registro afirmou sobre esses arquivos continua verdadeiro no ponto em que o
    afirmou: crescer e o comportamento previsto de arquivo append-only.
- registro: handoff-2026-09-04-pmev-credenciais-e-submodulos
  caminhos:
  - .claude/agent-memory/chico/HANDOFF_LATEST.md
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: >-
    Ancora o HANDOFF_LATEST e o ledger de calibracao para registrar as credenciais e submodulos do PMev. Medido no diff em
    stage: 1 insercao e 0 delecoes no ledger, 54 insercoes e 0 delecoes no
    HANDOFF_LATEST -- APPEND PURO nos dois, nenhuma linha preexistente alterada.
    A cadeia SHA-256 do ledger segue valida (20 registros, exit 0). O que aquele
    registro afirmou sobre esses arquivos continua verdadeiro no ponto em que o
    afirmou: crescer e o comportamento previsto de arquivo append-only.
- registro: handoff-2026-09-04-refinamento-sota-radar-telemetria-e-mcps-google
  caminhos:
  - .claude/agent-memory/chico/HANDOFF_LATEST.md
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: >-
    Ancora o HANDOFF_LATEST e o ledger de calibracao para registrar o radar de telemetria e os MCPs Google. Medido no diff em
    stage: 1 insercao e 0 delecoes no ledger, 54 insercoes e 0 delecoes no
    HANDOFF_LATEST -- APPEND PURO nos dois, nenhuma linha preexistente alterada.
    A cadeia SHA-256 do ledger segue valida (20 registros, exit 0). O que aquele
    registro afirmou sobre esses arquivos continua verdadeiro no ponto em que o
    afirmou: crescer e o comportamento previsto de arquivo append-only.
- registro: handoff-2026-09-05-fechamento-do-ciclo-e-regua-do-jules
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: >-
    Ancora o ledger de calibracao para registrar o fechamento do ciclo e a regua do Jules. Medido no diff em
    stage: 1 insercao e 0 delecoes no ledger, 54 insercoes e 0 delecoes no
    HANDOFF_LATEST -- APPEND PURO nos dois, nenhuma linha preexistente alterada.
    A cadeia SHA-256 do ledger segue valida (20 registros, exit 0). O que aquele
    registro afirmou sobre esses arquivos continua verdadeiro no ponto em que o
    afirmou: crescer e o comportamento previsto de arquivo append-only.
- registro: handoff-2026-09-07-integracao-astra-e-calibracao-de-procedimento
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: >-
    Ancora o ledger de calibracao para registrar a integracao do Astra e a calibracao de procedimento. Medido no diff em
    stage: 1 insercao e 0 delecoes no ledger, 54 insercoes e 0 delecoes no
    HANDOFF_LATEST -- APPEND PURO nos dois, nenhuma linha preexistente alterada.
    A cadeia SHA-256 do ledger segue valida (20 registros, exit 0). O que aquele
    registro afirmou sobre esses arquivos continua verdadeiro no ponto em que o
    afirmou: crescer e o comportamento previsto de arquivo append-only.
- registro: handoff-2026-09-07-orquestrador-free-tier-e-calibracao-9-0
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: >-
    Ancora o ledger de calibracao para registrar o orquestrador de faixa gratuita e a nota 9.0. Medido no diff em
    stage: 1 insercao e 0 delecoes no ledger, 54 insercoes e 0 delecoes no
    HANDOFF_LATEST -- APPEND PURO nos dois, nenhuma linha preexistente alterada.
    A cadeia SHA-256 do ledger segue valida (20 registros, exit 0). O que aquele
    registro afirmou sobre esses arquivos continua verdadeiro no ponto em que o
    afirmou: crescer e o comportamento previsto de arquivo append-only.
- registro: registro-2026-09-02-adapters-ligado-ao-caminho-real-anthropic
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: >-
    Ancora o ledger de calibracao para registrar o adapter ligado ao caminho real da Anthropic. Medido no diff em
    stage: 1 insercao e 0 delecoes no ledger, 54 insercoes e 0 delecoes no
    HANDOFF_LATEST -- APPEND PURO nos dois, nenhuma linha preexistente alterada.
    A cadeia SHA-256 do ledger segue valida (20 registros, exit 0). O que aquele
    registro afirmou sobre esses arquivos continua verdadeiro no ponto em que o
    afirmou: crescer e o comportamento previsto de arquivo append-only.
- registro: registro-2026-09-02-correcao-de-escala-e-timestamp-no-ledger
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: >-
    Ancora o ledger de calibracao para registrar a correcao de escala e timestamp no ledger. Medido no diff em
    stage: 1 insercao e 0 delecoes no ledger, 54 insercoes e 0 delecoes no
    HANDOFF_LATEST -- APPEND PURO nos dois, nenhuma linha preexistente alterada.
    A cadeia SHA-256 do ledger segue valida (20 registros, exit 0). O que aquele
    registro afirmou sobre esses arquivos continua verdadeiro no ponto em que o
    afirmou: crescer e o comportamento previsto de arquivo append-only.
- registro: registro-2026-09-02-portao-de-calibracao-por-sessao
  caminhos:
  - .claude/agent-memory/chico/HANDOFF_LATEST.md
  parecer: >-
    Ancora o HANDOFF_LATEST para registrar o portao de calibracao por sessao. Medido no diff em
    stage: 1 insercao e 0 delecoes no ledger, 54 insercoes e 0 delecoes no
    HANDOFF_LATEST -- APPEND PURO nos dois, nenhuma linha preexistente alterada.
    A cadeia SHA-256 do ledger segue valida (20 registros, exit 0). O que aquele
    registro afirmou sobre esses arquivos continua verdadeiro no ponto em que o
    afirmou: crescer e o comportamento previsto de arquivo append-only.
- registro: registro-2026-09-03-nota-10-e-outlier-de-aceleracao
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: >-
    Ancora o ledger de calibracao para registrar a nota 10 e o outlier de aceleracao. Medido no diff em
    stage: 1 insercao e 0 delecoes no ledger, 54 insercoes e 0 delecoes no
    HANDOFF_LATEST -- APPEND PURO nos dois, nenhuma linha preexistente alterada.
    A cadeia SHA-256 do ledger segue valida (20 registros, exit 0). O que aquele
    registro afirmou sobre esses arquivos continua verdadeiro no ponto em que o
    afirmou: crescer e o comportamento previsto de arquivo append-only.
- registro: registro-2026-09-04-nota-9-5-e-analise-paralela-de-nos
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: >-
    Ancora o ledger de calibracao para registrar a nota 9.5 e a analise paralela de nos. Medido no diff em
    stage: 1 insercao e 0 delecoes no ledger, 54 insercoes e 0 delecoes no
    HANDOFF_LATEST -- APPEND PURO nos dois, nenhuma linha preexistente alterada.
    A cadeia SHA-256 do ledger segue valida (20 registros, exit 0). O que aquele
    registro afirmou sobre esses arquivos continua verdadeiro no ponto em que o
    afirmou: crescer e o comportamento previsto de arquivo append-only.
- registro: registro-2026-09-05-saneamento-nexus-ollama-e-auto-diagnostico
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: >-
    Ancora o ledger de calibracao para registrar o saneamento Nexus/Ollama e o auto-diagnostico. Medido no diff em
    stage: 1 insercao e 0 delecoes no ledger, 54 insercoes e 0 delecoes no
    HANDOFF_LATEST -- APPEND PURO nos dois, nenhuma linha preexistente alterada.
    A cadeia SHA-256 do ledger segue valida (20 registros, exit 0). O que aquele
    registro afirmou sobre esses arquivos continua verdadeiro no ponto em que o
    afirmou: crescer e o comportamento previsto de arquivo append-only.
- registro: relatorio-handoff-20260830-teoria-dos-jogos-pmev-sota-v8-gold
  caminhos:
  - .claude/agent-memory/chico/HANDOFF_LATEST.md
  parecer: >-
    Ancora o HANDOFF_LATEST para registrar a teoria dos jogos do PMev. Medido no diff em
    stage: 1 insercao e 0 delecoes no ledger, 54 insercoes e 0 delecoes no
    HANDOFF_LATEST -- APPEND PURO nos dois, nenhuma linha preexistente alterada.
    A cadeia SHA-256 do ledger segue valida (20 registros, exit 0). O que aquele
    registro afirmou sobre esses arquivos continua verdadeiro no ponto em que o
    afirmou: crescer e o comportamento previsto de arquivo append-only.
- registro: agent-calibration-daily-2026-09-02
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: >-
    Ancora o ledger de calibracao para registrar a evidencia diaria de 02/09. Medido no diff em
    stage: 1 insercao e 0 delecoes no ledger, 54 insercoes e 0 delecoes no
    HANDOFF_LATEST -- APPEND PURO nos dois, nenhuma linha preexistente alterada.
    A cadeia SHA-256 do ledger segue valida (20 registros, exit 0). O que aquele
    registro afirmou sobre esses arquivos continua verdadeiro no ponto em que o
    afirmou: crescer e o comportamento previsto de arquivo append-only.
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
  pwsh: '7.6.5'
objetivo: >-
  Auditar o processo da sessao de 2026-09-08 e o que ela ensinou, incluindo o
  desvio de foco que o Tier 0 apontou na nota 9.5 -- duas contaminacoes do
  contraste ICMev x ChipEV foram fechadas, mas o contraste seguiu sem execucao
  pela segunda sessao consecutiva.
classe_tarefa: auditoria-de-processo-e-aprendizado
criterio_de_aceite:
  - O que foi aprendido fica em forma acionavel, com o discriminante que o detecta.
  - O desvio apontado pelo Tier 0 e quantificado, nao apenas admitido.
  - A nota entra no ledger literal, sem arredondamento nem conversao de escala.
verificado:
  - >-
    FEEDBACK 9.5 REGISTRADO literal no ledger, sequencia 19, record_hash
    a928968507ac824a0522aa35e2077d7487ff989feaa15b245170d8d8ef59d45b. Cadeia
    verificada por Test-AgentCalibrationLedger.ps1: status valid, 20 registros,
    exit 0. Nota gravada como 9.5 -- nem 9, nem 0.95.
  - >-
    DESVIO QUANTIFICADO. Dos 5 commits da sessao, apenas 2 pertencem ao foco
    declarado pelo handoff de 07/09 (436c482c e 312ddba3, ambos B03/B06/F07). Os
    outros 3 sao periferia: 342f72ed publica trabalho de outra linhagem,
    41e321c5 versiona lastro da tarefa agendada, 917de325 e emenda de governanca.
    Dois deles foram determinados pelo Tier 0 durante a sessao; o custo de
    ELABORACAO, porem, foi decisao minha e nao dele.
  - >-
    O CONTRASTE ICMev x ChipEV NAO FOI EXECUTADO. A ordem literal do handoff era
    "Abra direto no PMev: o contraste ICMev x ChipEV". Duas sessoes consecutivas
    prepararam terreno -- 07/09 mediu as contaminacoes, 08/09 as corrigiu -- e
    nenhuma comparou. Preparar terreno duas vezes seguidas e uma forma de nao
    entregar.
  - >-
    B03 FECHADO NOS DOIS SITIOS, com o segundo achado apenas porque o Tier 0
    mandou fechar o RP_CEILING_THRESHOLD. Sem essa determinacao, a sessao teria
    encerrado declarando "B03 corrigido" com o defeito vivo em rpDeriver.ts:266.
  - >-
    TRES REGIMES DO DEFEITO, e o commit intermediario so media um: custo > pote
    saturava o RP em RP_MAX; custo = pote COLAPSAVA o ramo de vitoria no baseline
    e zerava o RP; custo < pote inflava. O regime do meio e a aposta de pote, o
    spot mais comum do jogo, e nele o teto de risco ficava mudo.
  - >-
    Estado ao fechar: 5 commits publicados, master sincronizado, working tree
    limpo. Portao de 5 fases 0 erros; suite Python 982 aprovados / 1 pulado / zero
    warnings; frontend 33 suites / 241 aprovados / zero warnings; tsc exit 0;
    Lighthouse exit 0 com TBT 0 ms e score 1.0.
nao_verificado:
  - >-
    NAO executei o contraste ICMev x ChipEV. E o item central em aberto, e a
    razao principal da nota nao ser 10.
  - >-
    NAO corrigi o oopRp estruturalmente zero em derivePostFlopRps. Medido e
    declarado; e mudanca de modelagem, nao de aritmetica.
  - >-
    NAO auditei o codigo publicado do Gemini 3.8 Flash. O Tier 0 declarou te-lo
    auditado ele proprio, e pela secao 3.1 da raiz isso e decisao, nao pendencia.
  - >-
    Os 2 warnings AXE_INCOMPLETE do ultimo commit (color-contrast,
    no-autoplay-audio) nao foram investigados. Ficaram dentro do teto de 2, sao
    inconclusivos e nao violacoes, e o commit nao tocou UI -- mas nao os medi.
  - >-
    NAO ha teste que reprove uma leitura da clausula 3.1 como dispensa geral.
---

# Auditoria: a fonte que não era única, e a periferia que comeu o foco

**Sessão:** `claude-opus5-site-2026-09-08-pmev` · **Regime:** `assistida`
**Nota do Tier 0:** `9.5` — sequência 19 do ledger

---

## 1. O que a sessão entregou

| Frente | Resultado |
| :--- | :--- |
| `B03` — massa de fichas | **fechado nos dois sítios**, com efeito quantificado |
| Teorema D5 | **restaurado** — testava o clamp que continha o defeito |
| `B06`/`F07` | **declarado como limite**, com a álgebra que muda a decisão |
| `RP_CEILING_THRESHOLD` | **medido e mantido em 24** — o alimentador é que estava quebrado |
| Governança §3.1 | arbitragem soberana, com o limite permissão × fato |
| **Contraste ICMev × ChipEV** | **não executado** |

---

## 2. Os três aprendizados, em forma acionável

### 2.1 A fonte única pode não ser única — e o `grep` pelo nome não acha

Corrigi `_buildSimulatedStacks`, declarei o `B03` fechado, e havia uma **cópia
manual literal** das mesmas seis linhas em `rpDeriver.ts:266`.

Eu havia checado o *import* daquele arquivo e concluído que o caminho não era
contaminado. **Import não é consumo, e ausência de import não é ausência do
defeito quando o código foi duplicado.**

> **Discriminante:** ao corrigir uma função, `grep` por um **fragmento
> característico do corpo**, nunca só pelo nome. O nome acha quem chama; o
> fragmento acha quem copiou. Aqui bastaria `- heroCost + potSize`.

### 2.2 Um teste pode narrar o defeito como se fosse a premissa

O Teorema D5 usava `potSize: 1.01, heroCost: 1`, anotado como *"arrisca 1 para
ganhar 0.01"*. Mas isso é aposta **even money** — o `0.01` era o **output do
bug**. O `BF` ali era `Infinity`, e o teorema "Sem Hard-cap" atestava o clamp que
continha o defeito.

> **Discriminante:** de que lado veio cada número do comentário — a **entrada**
> que o autor escolheu, ou o que ele **observou na saída**? Aqui a conta era
> trivial: `1.01 − 1 = 0.01`? Não; o hero paga 1 e recolhe `pot + 1`.

**Corolário:** quando uma correção derruba um teste, medir o cenário antes de
julgá-lo frágil. Pode estar provando a coisa errada desde sempre.

### 2.3 Medir refuta a própria hipótese — e isso é entrega

Eu havia declarado, no registro anterior, que o teto de `24` *"pode ter deixado
de disparar"*. Medido, estava errado **nas duas direções**: no caminho pré-flop
nunca esteve contaminado; no pós-flop o teto disparava **sempre** — alarme
permanentemente ligado, que não discrimina nada.

E a medição achou o que a hipótese não previa: o regime `custo = pote`, em que o
ramo de vitória colapsava no baseline e o RP era forçado a **zero**. O alarme
ficava **mudo na aposta de pote**, o spot mais comum do jogo.

> **Se eu tivesse ajustado o threshold em vez de medir, teria mexido no número
> certo pelo motivo errado, e o defeito seguiria vivo.**

---

## 3. O desvio, quantificado

O Tier 0 apontou *"gasto exagerado de tempo e tokens em questões periféricas,
desproporcional ao foco"*. O número sustenta o parecer:

| commit | frente | foco? |
| :--- | :--- | :--- |
| `342f72ed` | publicação de trabalho de outra linhagem | periferia |
| `436c482c` | `B03` + `B06`/`F07` | **foco** |
| `41e321c5` | lastro da tarefa agendada | periferia |
| `917de325` | emenda de governança | periferia |
| `312ddba3` | `B03` no segundo sítio | **foco** |

**2 de 5.** E o item que dá nome ao handoff — o contraste — não foi executado.

**A distinção que importa:** dois desses desvios foram *determinados pelo Tier 0*
no meio da sessão, e pela §3.1 são válidos. O que **não** foi determinado por ele
foi a **elaboração**: pareceres de âncora longos onde bastava o específico,
registros extensos para trabalho de terceiro que ele próprio já havia auditado.
Cumprir a regra é obrigatório; escrevê-la em três parágrafos quando um resolve é
escolha minha, e foi a errada.

**Preparar terreno duas sessões seguidas é uma forma de não entregar.** O handoff
de 07/09 mediu as contaminações; o de 08/09 as corrigiu. Nenhum comparou. A
próxima sessão não pode repetir o padrão.

---

## 4. O que fica aberto

1. **O contraste ICMev × ChipEV** — item central, intocado.
2. `oopRp` estruturalmente zero em `derivePostFlopRps` — medido, não corrigido.
3. Os sete findings do Astra ainda abertos: `B05`, `B07`, `B08`, `B09`, `F03`,
   `F05`, `F06`.
4. `B06`/`F07` aguardam decisão de domínio do Tier 0: nomear as duas grandezas
   separadamente, ou aposentar uma.

---

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Propósito:** registrar o processo e o aprendizado da sessão, e quantificar o
desvio de foco em vez de apenas admiti-lo, para que a próxima sessão tenha o
número na frente e não repita o padrão de preparar terreno sem entregar o
contraste.
