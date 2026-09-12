---
id: auditoria-2026-09-12-o-ci-vermelho-que-nenhum-portao-local-media
tipo: auditoria
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-12T11:18:04-03:00'
atualizado_em: '2026-09-12T12:23:11-03:00'
classes: [interno, medido, calibracao, ci, proveniencia]
referencias_nao_resolviveis:
  # Este relatorio CITA os dois caminhos para dizer que eles nao resolvem aqui --
  # e o detector nao distingue citar para apontar de citar para diagnosticar, o
  # que a docstring dele ja previa. Declarados pelo mesmo motivo do relatorio de
  # 09-11: moram na raiz multiprojeto, que e outro repositorio.
  - 'scripts\ops\inventario-extensoes.ps1'
  - 'relatorios\RELATORIO_DECISAO_SCRIPTS_SEM_CONSUMIDOR_2026-09-10.md'
verificado:
  - nota 9.8 do handoff do Codex gravada literal na sequencia 58 -- cadeia valida, 59 registros
  - conductor_model medido no rollout da propria sessao Codex -- gpt-5.6-terra em 52 turn_context
  - par de medicao do Codex obtido pelo instrumento canonico -- 109 chamadas, 2 erros, metodo sentinela
  - o CI esta vermelho em nove commits consecutivos, de 2026-09-11 09:56 a 2026-09-12 14:04
  - a causa e um unico teste -- test_o_corpus_prescritivo_nao_tem_referencia_morta
  - os dois caminhos mortos existem na raiz multiprojeto e nao neste repositorio
  - referencias mortas na arvore inteira do recorte prescritivo agora somam zero
  - o pre-commit e o pre-push NAO executam pytest -- lidos linha a linha em .husky/
  - o portao de 5 fases rodou as 09:45:38, antes do commit 180cc7f4 das 09:46:04
  - as duas cadeias validadas em pwsh apos os appends -- feedback 59, outliers 8
  - os 16 modelos canonicos resolvem todos para um veiculo sob o contrato novo -- 0 nao resolvidos
  - gpt-9.9-inexistente recusado pelo contrato novo; era aceito antes
  - campo em branco produz somente motivo missing, sem invalid duplicado
  - MODELOS_RETIRADOS lido da fonte -- claude-fable-5 e claude-fable-5-1, dois
  - ruff format e ruff check aprovados no arquivo de teste alterado
  - suite integral 1124 aprovados 1 pulado exit 0, com basetemp curto
  - o unico warning e pre-existente -- medido por A/B com git stash da alteracao
  - o pre-push novo foi exercido de ponta a ponta e barrou o push -- falha fechada, causa de ambiente
  - pytest-current e symlink morto e nem os.rmdir o remove -- WinError 5, medido
  - basetemp dentro da arvore reprova 3 testes; fora e curto, os tres passam -- medido nas duas formas
  - referencias_mortas resolve contra RAIZ.parent, a raiz multiprojeto -- aprova aqui e reprova no clone
  - este relatorio foi reprovado pelo CI por citar os caminhos que diagnostica; declarado e corrigido
  - varredura EQUIVALENTE A CLONE com RAIZ.parent neutralizado -- 210 prescritivos, zero mortas
nao_verificado:
  - nao abri o diff de 812c1c2f -- a observacao sobre React.memo e de classe, nao de conteudo
  - a corrida do CI sobre o commit desta ultima correcao ainda nao existia quando isto foi escrito
  - regime de supervisao dos sete registros historicos continua sem fonte especifica
  - a causa de o contador do guard reportar zero warnings na suite integral e um no teste isolado
caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  - reports/HANDOFF-2026-09-11-o-alvo-declarado-e-o-objeto-que-o-github-ainda-serve.md
  - reports/HANDOFF-2026-09-12-reconciliacao-calibracao-e-proveniencia.md
  - reports/AUDITORIA-2026-09-12-proveniencia-executavel-do-feedback.md
  - scripts/ops/AgentCalibrationProvenance.ps1
  - scripts/ops/record_gate.py
  - tests/test_record_index.py
  - tests/test_agent_calibration_provenance.py
  - .husky/pre-push
  - llm/model_registry.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  head_na_abertura: 812c1c2f
  sessao: claude-opus5-site-2026-09-12-preludio
  inicio_da_sessao: '2026-09-12T05:56:54-03:00'
  ultimo_ci_verde: ac1332b2
  commits_vermelhos_seguidos: 9
revisoes_de_ancora:
  - registro: auditoria-2026-09-12-proveniencia-executavel-do-feedback
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
      - scripts/ops/AgentCalibrationProvenance.ps1
      - tests/test_agent_calibration_provenance.py
    parecer: >-
      REVISADO E MANTIDO VALIDO, com o contrato ESTREITADO e nunca afrouxado.
      Esta auditoria confere as contagens dele por medicao propria -- 22
      auditados, 9 historicos incompletos, 1 elegivel no ciclo, 0 excluidos -- e
      as tres batem. O append 58 acrescenta a segunda sessao elegivel e nao
      altera conclusao alguma daquele documento; corrige a pendencia que ele
      proprio declarou. No script, a checagem de sintaxe que ele documenta
      permanece intacta e ganha uma segunda camada de existencia lida da fonte
      canonica, alem de deixar de emitir motivo duplicado para campo em branco;
      nenhum registro antes elegivel deixou de ser, e a invariante dos 16
      modelos canonicos e agora guardada por teste no arquivo que ele criou.
  - registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
    caminhos: ['.husky/pre-push']
    parecer: >-
      REVISADO E MANTIDO VALIDO. Aquele handoff ancorou os tres hooks ao auditar
      a malha agentica, e a trava de LFS que ele instalou continua sendo a
      primeira etapa do pre-push, intacta. A alteracao e ADITIVA em duas frentes
      e nao remove verificacao nenhuma: declara o set -e que faltava -- sem ele
      o codigo de saida do hook era o do ultimo comando, defeito latente porque
      so havia uma verificacao bloqueante -- e acrescenta a suite Python depois
      do portao de qualidade. A ordem preserva LFS primeiro, como ele definiu.
  - registro: handoff-2026-09-12-reconciliacao-calibracao-e-proveniencia
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
      - scripts/ops/AgentCalibrationProvenance.ps1
      - tests/test_agent_calibration_provenance.py
    parecer: >-
      REVISADO COM RESSALVA DE DEFASAGEM, conteudo tecnico mantido. Ele declara
      em nao_verificado que o feedback 9.8 nao foi anexado ao ledger; isso deixa
      de valer aqui, com a sequencia 58. Declara tambem que nao houve commit,
      push nem pre-commit -- os tres ocorreram depois de ele ser escrito, e a
      secao 3 desta auditoria mede os horarios. Nada e reescrito: a defasagem e
      registrada onde ela pode ser lida. No script e no teste que ele entregou,
      a mudanca estreita o contrato -- existencia do modelo alem da sintaxe,
      falha fechada quando a fonte canonica nao responde -- e mantem cada
      recusa que ele ja fazia.
  - registro: registro-2026-09-12-preludio-o-instrumento-que-sabia-abrir-e-nao-fechar
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. O preludio ja se fechou pelo handoff de nota
      9.0, sequencia 55, e nada aqui reabre a sessao. O append 58 pertence a
      OUTRA sessao, a do Codex, e por isso soma uma sessao distinta ao ciclo em
      vez de adensar a minha.
  - registro: auditoria-2026-09-12-a-tarefa-que-ficou-em-aberto-e-a-memoria-de-curto-prazo
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E CONFIRMADO PELO PROPRIO ACHADO DE HOJE. Aquela auditoria disse
      que nao existe registro de tarefa aberta que atravesse sessoes; o CI
      vermelho por nove commits e a mesma lacuna noutra superficie -- uma
      pendencia que nenhum mecanismo cobrava, visivel so para quem fosse olhar.
  - registro: registro-2026-09-02-correcao-de-escala-e-timestamp-no-ledger
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E APLICADO. A regra que aquele registro fixou -- nota literal,
      sem conversao de escala -- foi verificada campo a campo apos a gravacao:
      score saiu 9.8, nao 0.98 nem 10. O timestamp da sessao veio do rollout
      medido, nao digitado.
  - registro: registro-2026-09-08-o-padrao-de-desvio-de-foco
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. O padrao segue apoiado nas seis corroboracoes
      qualitativas ja registradas; o feedback 58 e evidencia nova e ainda nao
      corroborada, e nao foi contado como confirmacao de padrao nenhum.
  - registro: auditoria-2026-09-08-massa-de-fichas-fonte-nao-unica-e-desvio-de-foco
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. A licao sobre fonte nao unica reaparece na
      secao 5 desta auditoria: a validacao de modelo por regex e uma segunda
      fonte para um fato que ja tem fonte canonica em llm/model_registry.py.
  - registro: auditoria-2026-09-01-retrospectiva-prioridade-sessao
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. A nota 7.5 e sua critica seguem literais na
      cadeia; aquele evento continua entre os nove historicos sem
      supervision_mode, preservado e inelegivel, sem que nada tenha sido
      deduzido para completa-lo.
  - registro: auditoria-2026-09-02-curadoria-mcp-e-processos-residuais
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. A curadoria e sua nota permanecem intactas; a
      unica mudanca que as alcancou foi a correcao 57 de scope, feita pelo Codex
      com fonte primaria nomeada, e esta auditoria a conferiu no registro.
  - registro: auditoria-2026-09-02-retrospectiva-e-observacao-de-calibracao
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. A serie historica que a retrospectiva observou
      continua completa no ledger; elegibilidade restringe uso futuro e nao
      apaga observacao passada.
  - registro: handoff-2026-09-01-prioridade-pmev-continuacao
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. Prioridade PMev e a nota daquele handoff nao
      sao tocadas; o append de hoje e de outra sessao e de outro veiculo.
  - registro: handoff-2026-09-02-curadoria-mcp-quarentena-e-roteamento-lazy
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. Foi a fonte primaria da correcao 57; conferi
      que a correcao cita esse documento pelo nome e nao altera nota, modelo nem
      conector do evento alvo.
  - registro: handoff-2026-09-03-guarda-de-governanca-camada-anthropic-e-cobertura-cve
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. Serviu de confirmacao secundaria a mesma
      correcao 57. A cobertura de CVE que ele registra continua sendo a fase 3
      do portao, que aprovou na corrida das 09:45:38 medida aqui.
  - registro: handoff-2026-09-03-procedencia-de-solve-e-portao-de-reprodutibilidade
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. Procedencia de solve e reprodutibilidade seguem
      valendo; esta auditoria acrescenta um caso em que a reprodutibilidade
      falhou por ambiente -- o mesmo detector reprova no clone e aprova aqui.
  - registro: handoff-2026-09-04-pmev-credenciais-e-submodulos
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. Nada em credenciais ou submodulos e reavaliado;
      o ledger recebeu somente um feedback de handoff novo.
  - registro: handoff-2026-09-04-refinamento-sota-radar-telemetria-e-mcps-google
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. A nota daquele refinamento continua imutavel na
      cadeia, que segue valida em 59 registros apos o append.
  - registro: handoff-2026-09-05-fechamento-do-ciclo-e-regua-do-jules
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO, E A REGUA DO JULES VOLTA A SER PERTINENTE. O ciclo fechado na
      sequencia 27 continua sendo o marco de reinicio, e o ciclo atual passa de
      uma para duas sessoes elegiveis. A secao 7 registra, sem auditar, um
      commit da malha que cai na classe que a secao 10.3 nomeia.
  - registro: handoff-2026-09-07-integracao-astra-e-calibracao-de-procedimento
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. As correcoes sucessivas de modelo daquele
      periodo continuam aplicadas na ordem certa; o modelo do registro 58 nao
      veio de inferencia sobre nome de sessao, veio do rollout.
  - registro: handoff-2026-09-07-orquestrador-free-tier-e-calibracao-9-0
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. A nota 9.0 daquele handoff nao se confunde com
      a 9.0 da sequencia 55 nem com a 9.8 da 58; as tres tem event_id, sessao e
      veiculo distintos, verificados aqui.
  - registro: handoff-2026-09-10-raiz-versionada-e-o-portao-que-media-outra-pagina
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO, E O TITULO DELE DESCREVE O ACHADO DE HOJE. Um portao que media
      outra pagina e exatamente o que a secao 4 encontra: o detector de
      referencia morta media o disco desta maquina, onde a raiz existe, e nao o
      clone, onde ela nao existe.
  - registro: registro-2026-09-02-adapters-ligado-ao-caminho-real-anthropic
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. O diagnostico de import daquele registro nao e
      alcancado por appends de calibracao.
  - registro: registro-2026-09-03-nota-10-e-outlier-de-aceleracao
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. O feedback de scope intrasessao-outlier daquele
      episodio continua no ledger e agora aparece explicitamente inelegivel, com
      motivo completed_handoff_not_declared -- preservado, nao promovido.
  - registro: registro-2026-09-04-nota-9-5-e-analise-paralela-de-nos
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. Nenhum evento historico foi reescrito; a cadeia
      so cresceu.
  - registro: registro-2026-09-05-saneamento-nexus-ollama-e-auto-diagnostico
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. O saneamento e seu auto-diagnostico continuam
      historicos e separados da amostra elegivel.
  - registro: registro-2026-09-10-feedback-9-5-multimodal-sota
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. A identidade de sessao daquele feedback ja
      havia sido reconciliada por correcao; o estado efetivo continua sendo lido
      antes de qualquer contagem.
  - registro: registro-2026-09-11-fechamento-automatico-do-dia-10-e-o-outlier-sem-sessao
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. O outlier sem sessao segue separado da serie de
      feedback, e o fechamento automatico do dia 10 nao e reaberto por este
      append.
  - registro: registro-2026-09-11-teoria-sota-e-saneamento-multimodal
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. Nada da teoria nem do saneamento multimodal
      depende da elegibilidade de calibracao alterada aqui.
  - registro: agent-calibration-daily-2026-09-02
    caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
    parecer: >-
      REVISADO E MANTIDO VALIDO. O snapshot diario e fotografia daquele dia; o
      gerador atual produz um retrato novo, com elegiveis e excluidos, sem
      reescrever o antigo.
supersede: null
---

# Auditoria — o CI vermelho que nenhum portão local media

Esta auditoria nasceu de uma instrução do Tier 0: *"a nota foi feita baseado no
relato de resolução. Se na sua auditoria vê-se que houveram erros, precisa
registrar que depois averiguo."* Ela registra, portanto, o que a conferência do
trabalho do Codex encontrou — o que confere, o que diverge, e um achado maior
que ninguém procurava e que também é meu.

---

## 1. A nota 9.8, agora com proveniência medida

O handoff do Codex declarava a nota em prosa e reconhecia, no próprio
`nao_verificado`, que não a havia anexado ao ledger. Pela §8.3 a nota mora no
handoff **e entra pelo escritor**; em prosa ela não conta para portão nenhum.

O Tier 0 confirmou a autoria da nota. Gravada na **sequência 58**, cadeia válida
em **59** registros, cauda `bacfb9c3`. Cada campo, e como foi obtido:

| Campo | Valor | Origem da medição |
| :--- | :--- | :--- |
| `score` | `9.8` | conferido literal após a gravação — não `0.98`, não `10` |
| `feedback` | fala do Tier 0 | transcrição de voz, segmento `01a09577-ed5e-7972-82ba-99fb78e49d7f`, literal |
| `session_id` | `01a09547-c8df-7641-87b5-83723b4b645d` | `session_meta` do rollout — é o mesmo id que os relatórios citam como "tarefa coordenadora" |
| `session_started_at` | `2026-09-12T08:01:44-03:00` | `timestamp` do `session_meta` |
| `conductor_model` | `gpt-5.6-terra` | 52 ocorrências em `turn_context` do rollout |
| `conductor_vehicle` | `codex` | topologia da §8.3, coerente com `model_provider: openai` |
| `supervision_mode` | `assistida` | arbitragem do Tier 0 por voz ao longo da sessão, presente na transcrição |
| par de medição | 109 / 2 / `sentinela` | `scripts/ops/agent_tool_error_index.py`, o instrumento canônico |

**O modelo não foi deduzido do nome do veículo.** O prompt-base da sessão diz
*"an agent based on GPT-5"*, e `GPT-5` não existe no `MODEL_REGISTRY`: é texto de
system prompt, não identificador. O valor real estava no rollout.

Duas medições independentes convergiram no par: minha contagem bruta de saídas de
ferramenta deu 109, e o instrumento canônico deu 109 chamadas com 2 erros por
sentinela do harness. O portão passou de **uma** para **duas** sessões elegíveis
no ciclo — mínimo continua três, portanto segue fechado, corretamente.

---

## 2. O que confere no trabalho do Codex

Verificado por medição própria, e bate: cadeia de feedback válida antes do meu
append (58 registros, cauda `11824d7d`) e a de outliers (8, `b69d6ec1`); BOM
único nos quatro `.ps1`; **22** feedbacks auditados, **9** históricos
incompletos, **1** elegível no ciclo, **0** excluídos no ciclo. As duas correções
56 e 57 são `correction` sobre `scope`, com fonte primária nomeada, e não tocam
nota, modelo nem conector.

**Um achado que o próprio Codex não percebeu ter produzido.** O outlier
`512fc3a6` tem *dois* componentes, e o relatório dele só nomeia um. O segundo é
literal no registro original: *"o universo gerado inclui feedback
`48443d06-…` de scope `intrasessao-outlier`"*. Esse registro é a sequência 10, e
o novo portão o exclui com motivo `completed_handoff_not_declared`. **Os dois
componentes estão fechados** — é o único dos cinco outliers em condição de
arbitragem de encerramento.

---

## 3. Os relatórios envelheceram antes de serem publicados

Ambos declaram em `nao_verificado`: *"suite integral e pre-commit nao
executados"* e *"sem commit ou push"*. Medido:

| Evento | Horário |
| :--- | :--- |
| auditoria e handoff escritos | 08:52:59 e 08:56:08 |
| portão de 5 fases executado | **09:45:38** — `FRAGILE`, 0 falhas, 1 warning, teto 2 |
| commit `180cc7f4` | **09:46:04** |
| publicado em `origin/master` | confirmado por `git ls-remote` |

O `commit:` do frontmatter aponta `65e0863b`, o HEAD anterior. **O documento
descreve um estado que deixou de existir antes de ele ser publicado, e foi
publicado no mesmo commit que o invalidou.** É a §2.4 em escala de minutos: data
escrita num documento descreve o documento, não o fato que ele narra.

O portão daquela corrida rodou com frontend no ar — LCP 1237 ms, CLS 0, TTFB
667 ms, axe com 0 violações. Não foi aprovação por ausência de medição.

As duas alterações de teste que o commit trouxe fora do assunto declarado são
benignas e comentadas: `timeout=45→90` sem enfraquecer asserção alguma, e
`setattr(m, "RAIZ", r)` → `m.RAIZ = r`, correção de Ruff B010.

**Levantei aqui um terceiro achado e ele não existia** — está retratado na
seção 6, item 4.

---

## 4. O achado maior — nove commits com o CI vermelho

Ninguém procurava por isto. Ao conferir a suíte, ela saiu com `exit=1`.

```
2026-09-12 14:04  812c1c2f  failure   ← Gemini, React.memo
2026-09-12 13:32  dc67058d  failure   ← Jules, PR #44
2026-09-12 12:49  180cc7f4  failure   ← Codex, proveniência
2026-09-12 11:08  5fbf50c7  failure   ← meu
2026-09-12 10:50  19e29634  failure   ← meu
2026-09-12 10:18  1d699f5e  failure   ← meu
2026-09-11 14:43  2a23d45d  failure
2026-09-11 12:30  24cb4532  failure
2026-09-11 09:56  2ce819a7  failure
2026-09-11 04:10  ac1332b2  success   ← último verde
```

**Nove commits, três condutores, dois dias.** Uma única causa, e um único teste:
`tests/test_record_index.py::test_o_corpus_prescritivo_nao_tem_referencia_morta`,
com `1 failed, 1086 passed, 18 skipped`.

A referência morta está em
`reports/HANDOFF-2026-09-11-o-alvo-declarado-e-o-objeto-que-o-github-ainda-serve.md`,
que é **meu**, e cita dois caminhos:

- `scripts\ops\inventario-extensoes.ps1`
- `relatorios\RELATORIO_DECISAO_SCRIPTS_SEM_CONSUMIDOR_2026-09-10.md`

**Os dois existem — na raiz multiprojeto, que é outro repositório.** A própria
prosa da seção 3 diz *"na raiz"*. O detector não lê prosa.

### O mecanismo exato, medido depois que o CI reprovou este próprio relatório

A primeira redação desta auditoria dizia que o portão local "só varre o stage".
É verdade e é insuficiente: **mesmo varrendo a árvore inteira, aqui dá zero.**
Medido — `referencias_mortas` sobre todo o corpus prescritivo devolve `{}` nesta
máquina e acusa dois caminhos no CI, no mesmo commit.

A causa está numa linha de `record_gate.py`:

```python
achou = any((raiz / var).exists() for var in variantes
            for raiz in (RAIZ, caminho.parent, RAIZ.parent))
```

**`RAIZ.parent` é `~\.gemini`, a raiz multiprojeto.** Nesta máquina o `Site` mora
dentro dela, então o relatório de decisão dos scripts sem consumidor resolve —
não porque este repositório o tenha, mas porque o repositório *irmão* está no
disco ao lado. Num clone de CI não há irmão, e o mesmo endereço morre.

Não é bug de implementação: a busca no pai existe de propósito, para registros
multiprojeto que endereçam a partir de cima. O efeito colateral é que **o
veredito depende da topologia do disco de quem roda.** Verificação que aprova por
acidente de vizinhança é a §4 da raiz outra vez — *ferramenta que mede o escopo
que enxerga, não o escopo real* —, e aqui ela aprova o que o clone reprova, que é
a direção pior das duas: o local diz verde e a publicação diz vermelho.

O corolário prático já estava escrito no próprio detector, e é a saída correta:
onde a forma não separa citar-para-apontar de citar-para-dizer-que-sumiu, quem
separa é a **declaração do autor**. `referencias_nao_resolviveis` é
independente de máquina, e é por isso que o conserto funciona nos dois lados.

**O método que fecha o ciclo, e ele é reutilizável.** Verificar aqui não prova
nada, porque aqui passa por vizinhança. Antes de publicar, rodei a varredura
com `RAIZ.parent` apontado para um diretório inexistente — o que reproduz o
clone exatamente: **210 documentos prescritivos, zero referências mortas.** É a
diferença entre medir o próprio disco e medir o que o repositório entrega.

**Esta auditoria caiu na própria armadilha que descreve.** Ao narrar os dois
caminhos mortos, ela os citou — e o CI a reprovou por isso, enquanto aqui ela
passava. Corrigido pela mesma declaração.

### Por que nenhum portão local acusou, e essa é a parte que importa

Três mecanismos falharam juntos, cada um por um motivo diferente, e nenhum deles
é um defeito de implementação:

1. **O portão de registro só varre o stage.** É desenho declarado, para não
   reprovar dívida preexistente. Aquele arquivo nunca mais entrou em stage, logo
   nunca mais foi olhado.
2. **O teste que varre a árvore inteira só roda no CI.** Li `.husky/pre-commit`
   e `.husky/pre-push` linha a linha: eles executam `npm run sota:audit`, o
   portão de âncora e o `record_gate.py`. **Nenhum dos dois executa `pytest`.**
   A §6.1 exige suíte inteiramente verde e a §6.2 fala em "o pre-commit e o CI
   rejeitam", mas o hook, como está escrito, não roda a suíte Python.
3. **O relatório do Gemini disse "381 testes passando", e isso é verdade sobre
   outra suíte.** `npm test` roda o workspace de frontend; a suíte Python tem
   1086. Duas suítes, dois números, e o menor foi reportado como se cobrisse o
   todo.

`★` A forma é a mesma do §2.4 e do registro de 09-09: **um verificador que mede
uma coisa e é lido como se medisse outra.** Aqui em duas camadas — o portão local
mede o stage e foi lido como se medisse o repositório; o `npm test` mede o
frontend e foi lido como se medisse a suíte.

### O que fiz

Apliquei o mecanismo que o próprio detector prevê para exatamente este caso:
`referencias_nao_resolviveis` no frontmatter do relatório, que existe para
*"caminho que existe no disco mas NUNCA foi rastreado"*. Não reescrevi a
narrativa nem alterei nenhuma afirmação: declarei, onde a máquina lê, o que a
prosa já dizia para quem lê. Medido depois: **referências mortas na árvore
inteira do recorte prescritivo = zero.**

---

## 5. A proveniência valida sintaxe, e existe fonte canônica

`AgentCalibrationProvenance.ps1` decide o conector por expressão regular sobre o
nome do modelo. `gpt-9.9-inexistente` passa, e mapeia para `codex`. O script
declara isso com honestidade — *"Family/version syntax is checked, not guessed"*
—, mas a §3 já diz onde mora a existência de um modelo: `llm/model_registry.py`,
com `MODELOS_RETIRADOS` guardando os recusados **com o motivo**, precisamente
para que registro histórico não precise de regex.

Medido, e é o que torna a recomendação barata:

| Modelo no ledger | Ocorrências | No conjunto canônico? |
| :--- | ---: | :--- |
| `claude-opus-5` | 12 | sim |
| `gemini-3.8-flash` | 8 | sim |
| `gpt-5.6-terra` | 2 | sim |
| `gpt-6-astra` | 1 | sim |
| `Codex GPT-6` | 1 | **não** |

`MODEL_REGISTRY ∪ MODELOS_RETIRADOS` = 16 entradas, e cobre **todos** os modelos
reais do ledger. O único fora é `Codex GPT-6` — que é o registro defeituoso da
sequência 16, aquele que fundiu veículo e modelo num campo só e que a §8.3 cita
como a medição que originou os dois campos. Ele já foi corrigido por append.

**Trocar o regex por pertinência ao conjunto canônico não produz um falso
negativo sequer, e fecha a porta que hoje aceita um modelo inexistente.** Não
implementei: é mudança de contrato de portão, e portão é do Tier 0.

Achado menor no mesmo script: para campo vazio, `reasons` emite
`missing:supervision_mode` **e** `invalid:supervision_mode`, porque string vazia
falha nas duas checagens. Cosmético, mas duplica a contagem de motivos em
qualquer leitura agregada.

---

## 6. O que eu errei nesta auditoria

Três vezes, e as três valem mais registradas que omitidas:

1. **Contei 22 históricos incompletos onde há 9.** Filtrei por `$_.eligible`
   quando o campo é `provenance_complete`; em PowerShell `-not $null` é
   verdadeiro, então o filtro aprovava tudo. É a mesma classe do teste vacuário
   de ontem: uma expressão que nunca é falsa não filtra, carimba.
2. **Afirmei que o portão de registro tinha aprovado ontem com uma revisão de
   âncora só.** Fui medir: o prelúdio carregava **42**. Não havia anomalia no
   portão; havia erro na minha memória. Verifiquei antes de reportar, e por isso
   isto está aqui como erro meu e não como falso achado sobre o instrumento.
3. **Rodei um segundo `pytest` enquanto a suíte integral ainda corria**, e ele
   devolveu sete falhas que não existem. Descartei a medição. É a Lei de
   Concorrência aplicada a mim mesmo, vinte minutos depois de eu a invocar
   contra outro condutor.

4. **Acusei os relatórios do Codex de declararem `caminhos` errado, e o errado
   era eu.** Tratei o campo como manifesto dos arquivos alterados no commit.
   `record_gate.py:472` é explícito: *"Ancora e o campo `caminhos:`, nunca a
   prosa"* — ele declara **a que o registro se ancora**, isto é, o que obriga a
   revisá-lo quando mudar. Declarar um caminho não alterado é conservador, não
   falso; omitir um caminho alterado não viola nada. O achado foi retirado da
   seção 3 antes da publicação. Levantar defeito inexistente num instrumento
   alheio é pior que não auditar: gasta o crédito da auditoria inteira.

E uma medição anterior que também descartei: a primeira corrida da suíte
atravessou a janela em que o Gemini fazia o merge. Malha compartilhada não
produz medição.

---

## 7. Fora do escopo desta auditoria, e registrado para averiguação

O commit `812c1c2f` envolve `PerspectiveChart` em `React.memo`. **Não abri o
diff.** Registro apenas que ele cai na classe que a §10.3 item 2 nomeia
explicitamente como o que não se faz sem medir render desperdiçado — regra
escrita, em 05/09, a partir de uma proposta que teria feito exatamente isso. Se
houve medição prévia, ela não está em relatório que eu tenha lido.

Pela §10.6(c), branch do Jules entra na malha **apenas por merge local
revisado**, onde o `pre-commit` roda de fato. O merge do PR #44 foi local, o que
satisfaz a forma; o que a seção 4 mostra é que o `pre-commit` não cobre a suíte
Python, e portanto "aprovado no pre-commit" nunca significou "suíte verde".

---

## 8. Resolvido nesta sessão, por ordem de gravidade

O Tier 0 determinou *"resolva em ordem de gravidade"* e aceitou as duas
recomendações que dependiam de arbitragem. Executado:

**1 — O CI vermelho.** `referencias_nao_resolviveis` declarado no relatório de
09-11. Dívida de referência morta na árvore inteira: zero.

**2 — Nada local executava a suíte Python.** A suíte entrou no **`pre-push`**, e
não no `pre-commit`. O motivo é de proporção: ela leva cerca de seis minutos, e
no pre-commit seria paga várias vezes por hora — **portão caro é portão que
alguém contorna**, e a §1 já proíbe contornar. O push é a fronteira de
publicação, que é exatamente onde a §10.6(c) exige portão real e onde, sem isto,
o CI seria o primeiro a saber. O `pre-commit` fica como está.

Ao editar o arquivo apareceu um defeito latente: **o `pre-push` não declarava
`set -e`**. Ele tinha uma única verificação bloqueante ao final, então o efeito
não aparecia — mas a primeira linha acrescentada depois dela faria `sota:audit`
deixar de bloquear em silêncio. É o defeito que o comentário do `pre-commit`
documenta desde que aquele arquivo passou a ter mais de uma linha. Declarado.

**3 — Modelo validado por sintaxe.** Duas camadas agora, e elas respondem
perguntas diferentes: a expressão regular diz a **família** — e daí o conector
esperado; o conjunto canônico diz a **existência**. A lista é lida de
`llm/model_registry.py` em tempo de validação, resolvendo o Python do mesmo modo
que `New-AgentCalibrationDailyEvidence.ps1` já fazia; **não existe cópia**, logo
não existe segunda fonte. Se a fonte canônica não puder ser lida, o registro
**não** é aprovado: sai com `canonical_model_source_unreachable`, porque aprovar
por indisponibilidade seria degradação silenciosa.

A correção expôs uma divergência entre as duas camadas: `claude-fable-5` e
`claude-fable-5-1` estão em `MODELOS_RETIRADOS` — são **reais**, apenas
recusados por faixa de acesso — e a alternância da regex só cobria
`opus|sonnet|haiku`, devolvendo `unknown_or_nonexact` para um modelo que a fonte
canônica conhece. `fable` entrou. Guard novo assegura a invariante: **todos os
16 modelos canônicos resolvem para um veículo**, medido.

**5 — `reasons` duplicava motivo.** Campo em branco saía com
`missing:supervision_mode` **e** `invalid:supervision_mode`. Ausente e inválido
são coisas distintas; agora só o que existe pode ser julgado inválido. Não muda
elegibilidade, mas contagem agregada inflada é matéria-prima de conclusão errada.

Três guards novos em `tests/test_agent_calibration_provenance.py`: a invariante
dos 16, a recusa de `gpt-9.9-inexistente` e congêneres, e a ausência de motivo
duplicado.

---

### O portão novo barrou o primeiro push, e estava certo em barrar

A primeira execução real do `pre-push` **bloqueou a publicação sem que um único
teste tivesse reprovado.** O portão de 5 fases aprovou — 0 erros, 2 warnings,
teto 2 — e a suíte morreu no `sessionfinish`, não em asserção.

Causa: a raiz temporária compartilhada, `%TEMP%\pytest-of-rapha`, contém
`pytest-current`, um **symlink de diretório morto** — `islink` verdadeiro,
`isdir` falso, alvo já removido. No Windows, `Path.unlink()` sobre symlink de
diretório devolve `WinError 5`, então `cleanup_dead_symlinks` explode no
encerramento, o pytest sai com código não-zero, e o `set -e` aborta o push.
Medido: nem `os.rmdir`, que é a chamada correta para symlink de diretório no
Windows, consegue removê-lo — o SO o mantém travado. E ele reaparece toda vez
que uma corrida é interrompida.

**Falha fechada é o comportamento certo; a causa é que estava errada.** Um
portão que barra por artefato de ambiente treina o operador a desconfiar dele, e
desconfiança de portão é o primeiro passo para o contorno que a §1 proíbe.

A correção não afrouxa nada — mas **a primeira tentativa dela estava errada, e o
portão pegou isso também.** Apontei o `--basetemp` para `.pytest_tmp`, dentro da
árvore do repositório. O push seguinte reprovou com **3 failed, 1122 passed**, e
os três são precisamente os testes que criam repositórios git temporários: os
dois detectores de referência em `test_record_index.py` e — com ironia exata —
`test_suite_isolada.py::test_nao_inventa_repositorio_onde_nao_ha`. **Repositório
de teste criado dentro da árvore é um repositório onde não deveria haver um.**
Estar no `.gitignore` não o tira do disco; ignorar para versionar e ignorar para
enxergar são decisões diferentes, que é a mesma lição da §4 da raiz.

A raiz precisa de **duas** propriedades, e cada uma custou uma tentativa: curta,
senão os mesmos testes estouram o limite de caminho do Windows com `WinError
267` — o que produziu as nove falhas fantasma da seção 6 —, e **fora** da árvore.
O hook usa `${TEMP:-${TMPDIR:-/tmp}}/pt-sota`, que satisfaz as duas em Windows e
em POSIX. Verificado nos três testes: passam.

O remoto permaneceu em `812c1c2f` durante todo o episódio, nas duas tentativas:
nada foi publicado por um portão que não aprovou. **O portão que instalei para
pegar o que ninguém pegava pegou dois defeitos meus antes de deixar passar
qualquer coisa** — inclusive um defeito nele próprio.

### O contador de warnings do guard divergiu do pytest, e isso é achado

A suíte fechou **1124 aprovados, 1 pulado, exit 0**. O pytest declarou **1
warning**; o guard do `conftest.py`, na mesma corrida, declarou **`Total de
Warnings: 0`** e carimbou `SUCESSO (VERDE) — Homeostase Total`.

O warning é `PytestUnhandledThreadExceptionWarning`: a thread leitora do
`subprocess` bate em `UnicodeDecodeError` ao ler a saída do pwsh — byte `0xc6`,
mensagem de erro em português num console que não é UTF-8. **Não é meu**, e isso
foi medido, não suposto: com `git stash` da minha alteração, a versão anterior
do script produz o mesmo warning. Não há warning novo, e a §6.2 está cumprida.

O que sobra é a divergência. A §6.2 diz que o `conftest.py` deriva a contagem do
hook `pytest_warning_recorded` e que *"é a fonte, e é honesta"*. Nesta corrida
ela reportou zero enquanto havia um — e num teste isolado o mesmo guard reportou
`FRAGIL (AMARELO), 1 warning`, ou seja, ele **sabe** contar esse warning e não o
contou na suíte inteira. Um contador que acerta no pequeno e zera no grande é
pior que um que erra sempre: o carimbo `Homeostase Total` é exatamente o que
ninguém vai reauditar. Não mexi no instrumento — é o que a §10.3 item 3 proíbe
ao agente, e a correção depende de entender por que o hook não dispara ali.

---

## 9. Em aberto para o Tier 0

- **Ninguém observa o CI.** Nove commits vermelhos por dois dias, três
  condutores, e o vermelho só apareceu porque uma auditoria foi olhar. O
  `pre-push` fecha a porta daqui em diante, mas não cria o observador. É a mesma
  lacuna dos catorze dias, noutra superfície.
- **Encerrar o outlier `512fc3a6`**, cujos dois componentes estão fechados.
- Os quatro outliers restantes, as três correções de segurança sem PR upstream,
  e o destino dos oito `.patch` — todos já registrados na auditoria de
  encerramento desta manhã e ainda em pé.
- **O commit `812c1c2f`**, pelo que a seção 7 registra e esta auditoria não
  verificou.
