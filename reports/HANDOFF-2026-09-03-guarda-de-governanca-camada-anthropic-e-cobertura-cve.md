---
id: handoff-2026-09-03-guarda-de-governanca-camada-anthropic-e-cobertura-cve
tipo: handoff
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: 2026-09-03T01:50:00-03:00
atualizado_em: 2026-09-03T01:50:00-03:00
classes: [interno, medido, handoff, calibracao]
caminhos:
  - .claude/agent-memory/chico/HANDOFF_LATEST.md
  - reports/agent-calibration/feedback-ledger.jsonl
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  pwsh: 7.6.5
verificado:
  - >-
    Suite Python 833 passam, 1 pula, 0 reprovam. Portao de 5 fases, de ancora e
    de registro aprovados em dois commits. Cadeia do ledger valida com 8
    registros e 5 sessoes distintas.
nao_verificado:
  - >-
    O ramo de fallback da fase 3 com git ausente do PATH; a bateria sob Windows
    PowerShell 5.1 real; e qualquer chamada a provedor de LLM, proibida pela
    raiz por as chaves estarem revogadas.
revisoes_de_ancora:
  - registro: registro-2026-09-02-correcao-de-escala-e-timestamp-no-ledger
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido, e exercitado duas vezes mais desde entao. O
      mecanismo de correcao que ele criou aplicou a reducao 9.5 -> 9.0 da sessao
      Gemini (`correcoes_aplicadas` = 2), e a protecao de literal de timestamp
      que ele generalizou sustentou dois appends novos -- a correcao e o
      feedback de hoje -- sem quebrar a cadeia, que segue `valid` com 8
      registros. A regra central dele, de que valor errado se corrige por
      registro anexado e nunca por reescrita, foi seguida sem excecao.
  - registro: auditoria-2026-09-02-curadoria-mcp-e-processos-residuais
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado. O parecer de ancora dele afirma que "o ledger e append-only; o
      novo feedback 9.5 da sessao de curadoria MCP" foi anexado, e as duas
      metades continuam se comportando como ja declarei na revisao anterior: o
      append-only e verdadeiro e foi honrado outra vez hoje -- o feedback desta
      sessao entrou como sequencia 7, sem tocar nenhum registro existente --,
      enquanto o 9.5 daquela sessao permanece corrigido para 9.0 por
      determinacao do Tier 0. Coincidencia digna de nota, e nao contradicao: a
      nota desta sessao tambem e 9,5, de outra sessao e outro event_id.
  - registro: handoff-2026-09-02-curadoria-mcp-quarentena-e-roteamento-lazy
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. Ele ancora o ledger como estado de encerramento
      da sessao de curadoria MCP e nao afirma nota, media nem contagem -- a
      varredura por valor numerico nao retorna ocorrencia nele. O append de hoje
      acrescenta uma sessao aa contagem sem alterar nada do que ele descreve
      sobre quarentena reversivel e roteamento lazy. Cabe registrar aqui, porque
      e o handoff daquela sessao: o commit `dfbbcb9e` que ela produziu saiu sem
      o import de `AnthropicAdapter` e era `NameError`; `f8523a3e` corrigiu de
      forma aditiva, sem reescrever historico.
  - registro: registro-2026-09-02-portao-de-calibracao-por-sessao
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: >-
      Revisado e mantido valido, com a metrica confirmada em nova amostra. A
      contagem por sessao distinta subiu de 4 para 5 com o feedback desta
      sessao, sem nenhuma sessao faltante e sem `session_started_at` divergente
      -- as duas condicoes que aquele registro definiu como falha fechada. A
      regra de nao expirar tambem se confirmou: as sessoes de 01/09 continuam
      contando.
  - registro: agent-calibration-daily-2026-09-02
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido como evidencia DATADA. Os agregados que ele
      fotografou mudaram de novo -- agora media 8,6 e `score_max` 9,5 --, mas o
      documento registra o que o gerador media na corrida daquele dia, nao a
      verdade corrente. Recalcula-lo destruiria a trilha, que e a razao de a
      corrida das 23:59 existir.
  - registro: auditoria-2026-09-02-retrospectiva-e-observacao-de-calibracao
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido; a regra que ele firmou foi seguida a risca
      hoje. Ele trata da nota gravada literalmente sem conversao de escala, e o
      feedback desta sessao entrou como `9,5` -- decimal preservado, sem
      arredondar para 10 nem virar 0.95. A doutrina de outlier como evidencia
      retida nao foi acionada: nenhuma nota desta serie e outlier.
  - registro: handoff-2026-09-02-integridade-portao-no-teto-e-fila-para-o-sucessor
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: >-
      Revisado e mantido valido, e o titulo dele descreve o estado de hoje. O
      portao voltou a fechar com warnings no teto de dois -- TBT sem artefato
      Lighthouse e `AXE_INCOMPLETE` com duas regras inconclusivas contra
      baseline de uma. A fila que ele passou ao sucessor continua herdada; esta
      sessao acrescentou a ela a decisao sobre vulnerabilidades de submodulo, e
      nao removeu nenhum item.
  - registro: auditoria-2026-09-01-retrospectiva-prioridade-sessao
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. Ele ancora o ledger pelo feedback de
      `codex-site-2026-09-01-prioridade`, sequencia 1, nota 7.5 -- registro que
      nenhum append ou correcao desta sessao tocou, e que segue contando para o
      limiar por a acumulacao nao expirar. O diagnostico dele, de latencia por
      trabalho periferico, permanece pertinente: e a mesma familia do custo de
      auto-correcao que o feedback de hoje mede.
  - registro: handoff-2026-09-01-prioridade-pmev-continuacao
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. Handoff de 01/09 que ancora o ledger como
      estado de continuidade do PMev, sem afirmar nota, media ou contagem. A
      prioridade que ele fixou -- a recaptura do HRC -- continua aberta e
      inalterada por esta sessao, que nao tocou em nenhum par do contrato de
      evidencia.
  - registro: registro-2026-09-02-adapters-ligado-ao-caminho-real-anthropic
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido; e o registro desta mesma sessao, e o append de
      hoje nao altera nada do que ele afirma. Ele ancora o ledger pela correcao
      9.5 -> 9.0 que documenta, e essa correcao continua no ledger, aplicada,
      com `correcoes_aplicadas` = 2. O feedback novo e registro adicional, nao
      revisao daquele.
  - registro: auditoria-2026-08-30-coderabbit-resolucao-e-integridade
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: >-
      Revisado e mantido valido. Os 22 apontamentos que ele resolveu eram de
      codificacao UTF-8, contagem de agentes e titulo importado nos arquivos de
      memoria; a reescrita de hoje do HANDOFF_LATEST nao reintroduz nenhum
      deles -- o arquivo esta em UTF-8 integro, sem H1 competindo e sem contagem
      rigida de suite em prosa. Medido nesta sessao: nenhum commit desta serie
      passou por PR, entao o CodeRabbit nao reviu nada dela.
  - registro: handoff-2026-08-30-resolucao-coderabbit-linters-e-malha-sota
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: >-
      Revisado e mantido valido. Ele ancora o handoff como ponteiro de estado
      corrente, nao como fonte das suas conclusoes sobre linters e malha. A
      regra de identidade de autoria que aquele dia originou -- agente nao
      assina com e-mail que resolva para perfil humano -- foi verificada nos
      quatro commits desta serie: todos saem como `Claude Opus 5
      <noreply@anthropic.com>` ou `Gemini 3.8 Flash High <noreply@google.com>`.
  - registro: relatorio-handoff-20260830-teoria-dos-jogos-pmev-sota-v8-gold
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: >-
      Revisado e mantido valido. Ele trata da fundamentacao em teoria dos jogos
      do PMev e ancora o handoff como ponteiro de estado, nao como fonte do
      formalismo. Nenhuma afirmacao teorica dele depende do conteudo do handoff,
      e esta sessao nao tocou no contrato de evidencia nem nos sete pares.
---

# Handoff — guarda de governança, camada Anthropic e cobertura de CVE

**Sessão:** `claude-opus5-site-2026-09-02-guarda` · **Assinatura individual:** Claude Opus 5 [Tier 1.B]
**Início:** 2026-09-02T21:41:00-03:00 · **Nota do Tier 0:** 9,5

---

## 1. Entregas

| # | Entrega | Commit |
| :-- | :--- | :--- |
| 1 | Guarda executável do canônico e do ponteiro — 7 testes, cada detector provado por mutação | `dfbbcb9e` (levado por sessão alheia) |
| 2 | `llm/adapters.py` ligado ao caminho real da Anthropic — 19 testes herméticos | `dfbbcb9e` + `f8523a3e` |
| 3 | Conserto de `dfbbcb9e`, que saiu sem o import e era `NameError` | `f8523a3e` |
| 4 | Correção da nota da sessão Gemini, 9.5 → 9.0, por determinação do Tier 0 | `f8523a3e` |
| 5 | Fase 3 do portão passa a medir o repositório, não um diretório | `04544ea9` |

## 2. Os três achados que valem além das entregas

**O portão mede o working tree, não o índice.** Foi por isso que `dfbbcb9e`
passou quebrado: o import existia em disco e não no conteúdo commitado. Qualquer
commit parcial repete isso, e **não há guarda contra**.

**A fronteira do submódulo.** `skills/*` são gitlinks para repositórios de
terceiros. Auditar seus lockfiles no portão deste repositório faria o veredito
depender de quais submódulos estão inicializados na máquina — o mesmo commit
aprovaria numa e reprovaria noutra. A enumeração passou a perguntar ao git.

**As 5 vulnerabilidades de submódulo são reais e não são corrigíveis aqui.**
`browserslist` é alta, e este repositório executa aquele código. **Decisão do
Tier 0.**

## 3. Calibração

Ledger `valid`, 8 registros, **5 sessões distintas**, 0 faltantes, 0 com início
inconsistente. Min 7,5 · máx 9,5 · média 8,6 · `correcoes_aplicadas` = 2.

O feedback de 9,5 observa que os erros **são os mesmos**, porém percebidos e
corrigidos mais rápido, e menos frequentes — em duas sessões de calibragem. A
leitura acionável não é "melhorou": é que o custo residual segue sendo a
auto-correção, que o Tier 0 já apontara na nota 9 como gasto evitável.

**Portão estrutural aberto não é autorização.** Faltam duas confirmações
independentes do mesmo padrão operacional, obrigação do auditor. Registro
literal: **dados insuficientes — nenhuma calibração planejada.**

## 4. O padrão que esta sessão isolou

**Conferir o instrumento antes de acreditar na medição.** Quatro conclusões
erradas: grep num log que eu mesmo truncara; `Select-String -SimpleMatch` com
pattern de alternância, que desliga a regex e me fez anunciar perda de trabalho
inexistente; "a leitura do remoto funciona, logo a credencial está boa" num
repositório público; e um `git status` truncado com `-First 3`.

O mesmo reflexo, aplicado a tempo, destravou o portão: as 3 violações axe não
eram do frontend — o dev server em `:3000` tinha caído.

## 5. Verificações

**Rodaram:** suíte Python 833/1/0; portão de 5 fases quatro vezes; portões de
âncora e registro em dois commits; parse AST do `.ps1` e varredura de construto
exclusivo do PS7; auditoria dos 4 manifestos npm e dos 3 GHSAs contra o Advisory
Database; varredura pré-push por padrões de credencial nos 4 commits (nenhum).

**Não rodaram:** o ramo de fallback da fase 3 sem git no PATH; a bateria sob
Windows PowerShell 5.1 real; chamada a provedor de LLM, proibida pela raiz.
