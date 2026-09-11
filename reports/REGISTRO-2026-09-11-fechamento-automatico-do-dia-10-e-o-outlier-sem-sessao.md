---
id: registro-2026-09-11-fechamento-automatico-do-dia-10-e-o-outlier-sem-sessao
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-11T00:03:53-03:00'
atualizado_em: '2026-09-11T06:36:06-03:00'
classes: [interno, medido, calibracao]
verificado:
  - append puro no ledger de outlier -- 1 insercao, 0 remocoes, por git diff --numstat
  - cadeia SHA-256 do ledger de outlier integra em 5 elos, conferida elo a elo
  - sequencias 1 e 3 inalteradas -- da7ef222 e 2d55d92a seguem com pattern_indexed falso
  - portao de ancora aprovou os 3 arquivos em stage antes deste registro existir
  - o .json do dia 10 e irmao de 2026-09-08.json e 2026-09-09.json, ambos versionados
  - gpt-5.6-terra e gpt-6-astra conferidos por varredura do llm/model_registry.py
  - gpt-6-astra e o unico gpt-6 do registro -- logo Codex GPT-6 e inequivoco
  - os dois portoes aprovaram os 9 arquivos desta alteracao
  - serie completa de diarios mapeada -- 4 noites com .json e sem .md
  - validador oficial do ledger de feedback aprova antes e depois -- 23 e 24 registros
  - cada correcao e append puro -- 1 insercao, 0 remocoes, por git diff --numstat
  - gerador aplica as 4 correcoes e a sessao alvo le gpt-5.6-terra no por_sessao
  - o gerador JA emite conductor_models e supervision_modes por sessao
nao_verificado:
  - nao existe validador oficial para o ledger de outlier -- conferi a cadeia com script proprio
  - a origem do session_id vazio do feedback 277d4f23 nao foi auditada
  - nao reexecutei o gerador v4 para reproduzir o .json; li o artefato que ele escreveu
  - a automacao das noites de agosto nao foi confirmada -- so o modelo, Terra 5.6
  - nao sei se o portao de suficiencia estava aberto nas quatro noites sem relatorio
caminhos:
  - reports/agent-calibration/daily/2026-09-10.md
  - reports/agent-calibration/daily/2026-08-29.md
  - reports/agent-calibration/daily/2026-08-30.md
  - reports/agent-calibration/daily/2026-08-31.md
  - reports/agent-calibration/daily/2026-09-01.md
  - reports/agent-calibration/daily/2026-09-06.md
  - reports/agent-calibration/daily/2026-09-07.md
  - reports/agent-calibration/daily/2026-09-08.md
  - reports/agent-calibration/daily/2026-09-10.json
  - reports/agent-calibration/outlier-evidence-ledger.jsonl
  - reports/agent-calibration/feedback-ledger.jsonl
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
revisoes_de_ancora:
  - registro: auditoria-2026-09-01-retrospectiva-prioridade-sessao
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A intersecao com esta alteracao e apenas o
      ledger de feedback, e nele houve somente append: duas correcoes de
      campo, sequencias 23 e 24, com 1 insercao e 0 remocoes cada. Conferido
      por busca no texto: este documento nao menciona o event_id 0b30eafd
      nem a sessao 01a07276, que sao o alvo da correcao -- logo nenhuma
      conclusao dele depende do campo corrigido. Ele nao fixa contagem de
      registros em prosa, logo e imune a append por construcao. Validador
      oficial aprova antes e depois -- 23 e 24 registros, cadeia valid.
  - registro: auditoria-2026-09-02-curadoria-mcp-e-processos-residuais
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A intersecao com esta alteracao e apenas o
      ledger de feedback, e nele houve somente append: duas correcoes de
      campo, sequencias 23 e 24, com 1 insercao e 0 remocoes cada. Conferido
      por busca no texto: este documento nao menciona o event_id 0b30eafd
      nem a sessao 01a07276, que sao o alvo da correcao -- logo nenhuma
      conclusao dele depende do campo corrigido. As sequencias que ele fixa
      -- 5 -- seguem byte a byte onde estavam, porque append nao toca
      registro anterior. Ele nao fixa contagem de registros em prosa, logo e
      imune a append por construcao. Validador oficial aprova antes e depois
      -- 23 e 24 registros, cadeia valid.
  - registro: auditoria-2026-09-02-retrospectiva-e-observacao-de-calibracao
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A intersecao com esta alteracao e apenas o
      ledger de feedback, e nele houve somente append: duas correcoes de
      campo, sequencias 23 e 24, com 1 insercao e 0 remocoes cada. Conferido
      por busca no texto: este documento nao menciona o event_id 0b30eafd
      nem a sessao 01a07276, que sao o alvo da correcao -- logo nenhuma
      conclusao dele depende do campo corrigido. As sequencias que ele fixa
      -- 1, 2 -- seguem byte a byte onde estavam, porque append nao toca
      registro anterior. Ele cita 2, 3 registro(s) no ledger; hoje sao 24.
      Essa contagem e retrato do momento daquele commit e nao invariante, e
      a divergencia fica declarada em vez de silenciada, como a regra da
      casa exige. Validador oficial aprova antes e depois -- 23 e 24
      registros, cadeia valid.
  - registro: auditoria-2026-09-08-massa-de-fichas-fonte-nao-unica-e-desvio-de-foco
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A intersecao com esta alteracao e apenas o
      ledger de feedback, e nele houve somente append: duas correcoes de
      campo, sequencias 23 e 24, com 1 insercao e 0 remocoes cada. Conferido
      por busca no texto: este documento nao menciona o event_id 0b30eafd
      nem a sessao 01a07276, que sao o alvo da correcao -- logo nenhuma
      conclusao dele depende do campo corrigido. As sequencias que ele fixa
      -- 19 -- seguem byte a byte onde estavam, porque append nao toca
      registro anterior. Ele cita 20 registro(s) no ledger; hoje sao 24.
      Essa contagem e retrato do momento daquele commit e nao invariante, e
      a divergencia fica declarada em vez de silenciada, como a regra da
      casa exige. Validador oficial aprova antes e depois -- 23 e 24
      registros, cadeia valid.
  - registro: handoff-2026-09-01-prioridade-pmev-continuacao
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A intersecao com esta alteracao e apenas o
      ledger de feedback, e nele houve somente append: duas correcoes de
      campo, sequencias 23 e 24, com 1 insercao e 0 remocoes cada. Conferido
      por busca no texto: este documento nao menciona o event_id 0b30eafd
      nem a sessao 01a07276, que sao o alvo da correcao -- logo nenhuma
      conclusao dele depende do campo corrigido. Ele nao fixa contagem de
      registros em prosa, logo e imune a append por construcao. Validador
      oficial aprova antes e depois -- 23 e 24 registros, cadeia valid.
  - registro: handoff-2026-09-02-curadoria-mcp-quarentena-e-roteamento-lazy
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A intersecao com esta alteracao e apenas o
      ledger de feedback, e nele houve somente append: duas correcoes de
      campo, sequencias 23 e 24, com 1 insercao e 0 remocoes cada. Conferido
      por busca no texto: este documento nao menciona o event_id 0b30eafd
      nem a sessao 01a07276, que sao o alvo da correcao -- logo nenhuma
      conclusao dele depende do campo corrigido. Ele nao fixa contagem de
      registros em prosa, logo e imune a append por construcao. Validador
      oficial aprova antes e depois -- 23 e 24 registros, cadeia valid.
  - registro: handoff-2026-09-03-guarda-de-governanca-camada-anthropic-e-cobertura-cve
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A intersecao com esta alteracao e apenas o
      ledger de feedback, e nele houve somente append: duas correcoes de
      campo, sequencias 23 e 24, com 1 insercao e 0 remocoes cada. Conferido
      por busca no texto: este documento nao menciona o event_id 0b30eafd
      nem a sessao 01a07276, que sao o alvo da correcao -- logo nenhuma
      conclusao dele depende do campo corrigido. As sequencias que ele fixa
      -- 1, 7 -- seguem byte a byte onde estavam, porque append nao toca
      registro anterior. Ele cita 8 registro(s) no ledger; hoje sao 24. Essa
      contagem e retrato do momento daquele commit e nao invariante, e a
      divergencia fica declarada em vez de silenciada, como a regra da casa
      exige. Validador oficial aprova antes e depois -- 23 e 24 registros,
      cadeia valid.
  - registro: handoff-2026-09-03-procedencia-de-solve-e-portao-de-reprodutibilidade
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A intersecao com esta alteracao e apenas o
      ledger de feedback, e nele houve somente append: duas correcoes de
      campo, sequencias 23 e 24, com 1 insercao e 0 remocoes cada. Conferido
      por busca no texto: este documento nao menciona o event_id 0b30eafd
      nem a sessao 01a07276, que sao o alvo da correcao -- logo nenhuma
      conclusao dele depende do campo corrigido. As sequencias que ele fixa
      -- 1, 5, 7, 8 -- seguem byte a byte onde estavam, porque append nao
      toca registro anterior. Ele cita 3, 5, 9 registro(s) no ledger; hoje
      sao 24. Essa contagem e retrato do momento daquele commit e nao
      invariante, e a divergencia fica declarada em vez de silenciada, como
      a regra da casa exige. Validador oficial aprova antes e depois -- 23 e
      24 registros, cadeia valid.
  - registro: handoff-2026-09-04-pmev-credenciais-e-submodulos
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A intersecao com esta alteracao e apenas o
      ledger de feedback, e nele houve somente append: duas correcoes de
      campo, sequencias 23 e 24, com 1 insercao e 0 remocoes cada. Conferido
      por busca no texto: este documento nao menciona o event_id 0b30eafd
      nem a sessao 01a07276, que sao o alvo da correcao -- logo nenhuma
      conclusao dele depende do campo corrigido. Ele nao fixa contagem de
      registros em prosa, logo e imune a append por construcao. Ele menciona
      conductor_model como obrigacao de declaracao, nao como valor medido de
      algum registro; a correcao de um valor nao contraria a obrigacao.
      Validador oficial aprova antes e depois -- 23 e 24 registros, cadeia
      valid.
  - registro: handoff-2026-09-04-refinamento-sota-radar-telemetria-e-mcps-google
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A intersecao com esta alteracao e apenas o
      ledger de feedback, e nele houve somente append: duas correcoes de
      campo, sequencias 23 e 24, com 1 insercao e 0 remocoes cada. Conferido
      por busca no texto: este documento nao menciona o event_id 0b30eafd
      nem a sessao 01a07276, que sao o alvo da correcao -- logo nenhuma
      conclusao dele depende do campo corrigido. As sequencias que ele fixa
      -- 5, 11, 12 -- seguem byte a byte onde estavam, porque append nao
      toca registro anterior. Ele cita 13 registro(s) no ledger; hoje sao
      24. Essa contagem e retrato do momento daquele commit e nao
      invariante, e a divergencia fica declarada em vez de silenciada, como
      a regra da casa exige. Validador oficial aprova antes e depois -- 23 e
      24 registros, cadeia valid.
  - registro: handoff-2026-09-05-fechamento-do-ciclo-e-regua-do-jules
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A intersecao com esta alteracao e apenas o
      ledger de feedback, e nele houve somente append: duas correcoes de
      campo, sequencias 23 e 24, com 1 insercao e 0 remocoes cada. Conferido
      por busca no texto: este documento nao menciona o event_id 0b30eafd
      nem a sessao 01a07276, que sao o alvo da correcao -- logo nenhuma
      conclusao dele depende do campo corrigido. Ele cita 15 registro(s) no
      ledger; hoje sao 24. Essa contagem e retrato do momento daquele commit
      e nao invariante, e a divergencia fica declarada em vez de silenciada,
      como a regra da casa exige. Validador oficial aprova antes e depois --
      23 e 24 registros, cadeia valid.
  - registro: handoff-2026-09-07-integracao-astra-e-calibracao-de-procedimento
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A intersecao com esta alteracao e apenas o
      ledger de feedback, e nele houve somente append: duas correcoes de
      campo, sequencias 23 e 24, com 1 insercao e 0 remocoes cada. Conferido
      por busca no texto: este documento nao menciona o event_id 0b30eafd
      nem a sessao 01a07276, que sao o alvo da correcao -- logo nenhuma
      conclusao dele depende do campo corrigido. Ele cita 18 registro(s) no
      ledger; hoje sao 24. Essa contagem e retrato do momento daquele commit
      e nao invariante, e a divergencia fica declarada em vez de silenciada,
      como a regra da casa exige. Validador oficial aprova antes e depois --
      23 e 24 registros, cadeia valid.
  - registro: handoff-2026-09-07-orquestrador-free-tier-e-calibracao-9-0
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A intersecao com esta alteracao e apenas o
      ledger de feedback, e nele houve somente append: duas correcoes de
      campo, sequencias 23 e 24, com 1 insercao e 0 remocoes cada. Conferido
      por busca no texto: este documento nao menciona o event_id 0b30eafd
      nem a sessao 01a07276, que sao o alvo da correcao -- logo nenhuma
      conclusao dele depende do campo corrigido. Ele cita 19 registro(s) no
      ledger; hoje sao 24. Essa contagem e retrato do momento daquele commit
      e nao invariante, e a divergencia fica declarada em vez de silenciada,
      como a regra da casa exige. Validador oficial aprova antes e depois --
      23 e 24 registros, cadeia valid.
  - registro: handoff-2026-09-10-raiz-versionada-e-o-portao-que-media-outra-pagina
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A intersecao com esta alteracao e apenas o
      ledger de feedback, e nele houve somente append: duas correcoes de
      campo, sequencias 23 e 24, com 1 insercao e 0 remocoes cada. Conferido
      por busca no texto: este documento nao menciona o event_id 0b30eafd
      nem a sessao 01a07276, que sao o alvo da correcao -- logo nenhuma
      conclusao dele depende do campo corrigido. As sequencias que ele fixa
      -- 22 -- seguem byte a byte onde estavam, porque append nao toca
      registro anterior. Ele cita 22 registro(s) no ledger; hoje sao 24.
      Essa contagem e retrato do momento daquele commit e nao invariante, e
      a divergencia fica declarada em vez de silenciada, como a regra da
      casa exige. Ele menciona conductor_model ao registrar a entrada 22,
      que e de outra sessao e permanece intacta. Validador oficial aprova
      antes e depois -- 23 e 24 registros, cadeia valid.
  - registro: registro-2026-09-02-adapters-ligado-ao-caminho-real-anthropic
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A intersecao com esta alteracao e apenas o
      ledger de feedback, e nele houve somente append: duas correcoes de
      campo, sequencias 23 e 24, com 1 insercao e 0 remocoes cada. Conferido
      por busca no texto: este documento nao menciona o event_id 0b30eafd
      nem a sessao 01a07276, que sao o alvo da correcao -- logo nenhuma
      conclusao dele depende do campo corrigido. As sequencias que ele fixa
      -- 1, 5, 6 -- seguem byte a byte onde estavam, porque append nao toca
      registro anterior. Ele cita 7 registro(s) no ledger; hoje sao 24. Essa
      contagem e retrato do momento daquele commit e nao invariante, e a
      divergencia fica declarada em vez de silenciada, como a regra da casa
      exige. Validador oficial aprova antes e depois -- 23 e 24 registros,
      cadeia valid.
  - registro: registro-2026-09-02-correcao-de-escala-e-timestamp-no-ledger
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A intersecao com esta alteracao e apenas o
      ledger de feedback, e nele houve somente append: duas correcoes de
      campo, sequencias 23 e 24, com 1 insercao e 0 remocoes cada. Conferido
      por busca no texto: este documento nao menciona o event_id 0b30eafd
      nem a sessao 01a07276, que sao o alvo da correcao -- logo nenhuma
      conclusao dele depende do campo corrigido. As sequencias que ele fixa
      -- 1, 3, 4 -- seguem byte a byte onde estavam, porque append nao toca
      registro anterior. Ele cita 5 registro(s) no ledger; hoje sao 24. Essa
      contagem e retrato do momento daquele commit e nao invariante, e a
      divergencia fica declarada em vez de silenciada, como a regra da casa
      exige. E o precedente direto desta operacao: foi ele que estabeleceu
      corrigir por registro anexado em vez de reescrever, e os meus dois
      appends seguem esse mesmo mecanismo. Validador oficial aprova antes e
      depois -- 23 e 24 registros, cadeia valid.
  - registro: registro-2026-09-03-nota-10-e-outlier-de-aceleracao
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A intersecao com esta alteracao e apenas o
      ledger de feedback, e nele houve somente append: duas correcoes de
      campo, sequencias 23 e 24, com 1 insercao e 0 remocoes cada. Conferido
      por busca no texto: este documento nao menciona o event_id 0b30eafd
      nem a sessao 01a07276, que sao o alvo da correcao -- logo nenhuma
      conclusao dele depende do campo corrigido. As sequencias que ele fixa
      -- 1, 9 -- seguem byte a byte onde estavam, porque append nao toca
      registro anterior. Ele cita 9, 10 registro(s) no ledger; hoje sao 24.
      Essa contagem e retrato do momento daquele commit e nao invariante, e
      a divergencia fica declarada em vez de silenciada, como a regra da
      casa exige. Validador oficial aprova antes e depois -- 23 e 24
      registros, cadeia valid.
  - registro: registro-2026-09-04-nota-9-5-e-analise-paralela-de-nos
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A intersecao com esta alteracao e apenas o
      ledger de feedback, e nele houve somente append: duas correcoes de
      campo, sequencias 23 e 24, com 1 insercao e 0 remocoes cada. Conferido
      por busca no texto: este documento nao menciona o event_id 0b30eafd
      nem a sessao 01a07276, que sao o alvo da correcao -- logo nenhuma
      conclusao dele depende do campo corrigido. As sequencias que ele fixa
      -- 1, 5, 12, 13 -- seguem byte a byte onde estavam, porque append nao
      toca registro anterior. Ele cita 3, 14 registro(s) no ledger; hoje sao
      24. Essa contagem e retrato do momento daquele commit e nao
      invariante, e a divergencia fica declarada em vez de silenciada, como
      a regra da casa exige. Aquele registro declara-se imune a append por
      nao fixar contagem em prosa, e cita conductor_model como campo exigido
      -- nao como valor de nenhum registro especifico, logo a correcao de um
      valor nao o alcanca. Validador oficial aprova antes e depois -- 23 e
      24 registros, cadeia valid.
  - registro: registro-2026-09-05-saneamento-nexus-ollama-e-auto-diagnostico
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A intersecao com esta alteracao e apenas o
      ledger de feedback, e nele houve somente append: duas correcoes de
      campo, sequencias 23 e 24, com 1 insercao e 0 remocoes cada. Conferido
      por busca no texto: este documento nao menciona o event_id 0b30eafd
      nem a sessao 01a07276, que sao o alvo da correcao -- logo nenhuma
      conclusao dele depende do campo corrigido. As sequencias que ele fixa
      -- 15 -- seguem byte a byte onde estavam, porque append nao toca
      registro anterior. Ele nao fixa contagem de registros em prosa, logo e
      imune a append por construcao. Validador oficial aprova antes e depois
      -- 23 e 24 registros, cadeia valid.
  - registro: registro-2026-09-08-o-padrao-de-desvio-de-foco
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido, com uma divergencia de contagem declarada. Os
      pareceres daquele registro afirmam cadeia valid com 21 registros e que as
      sequencias anteriores seguem byte a byte onde estavam. A segunda afirmacao
      continua verdadeira: meus dois appends de correcao sao 1 insercao e 0
      remocoes cada, e as sequencias 0 a 22 nao foram tocadas. A primeira e um
      retrato do momento daquele commit, nao uma invariante -- o ledger tem hoje
      24 registros, e pela regra da casa a contagem medida vence a citada, com a
      divergencia declarada em vez de silenciada. Nada do que aquele registro
      concluiu depende do total.
  - registro: registro-2026-09-10-feedback-9-5-multimodal-sota
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido, sem alteracao. Aquele registro declara, ele
      proprio, que ancora no ledger sem fixar contagem em prosa e que por isso e
      imune a append por construcao -- reli e confirmei: nenhuma afirmacao dele
      depende do total de registros. As sequencias que ele cita como intactas, 0
      a 20, continuam intactas. Meus appends sao correcoes de conductor_model
      apontando o event_id 0b30eafd, de 2026-09-05, que nao e nenhum dos
      registros que aquele documento analisa.
  - registro: agent-calibration-daily-2026-09-02
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido, sem alteracao. A tabela da secao (a) daquele
      diario declara o ledger com 2 registros totais e 1 no dia, retido e
      insuficiente. Nada disso muda: meus appends corrigem o campo
      conductor_model do event_id 0b30eafd, cujo registro alvo e a sequencia 16
      de 2026-09-05 -- posterior aquele dia e fora da janela dele. O acumulado
      de 02/09 nao alcanca a sequencia 16, logo contagem, densidade e veredito
      daquele diario permanecem aritmeticamente iguais. Conferido pela data do
      registro alvo, nao por presuncao de que correcao nao mexe no passado.
  - registro: handoff-2026-09-11-o-alvo-declarado-e-o-objeto-que-o-github-ainda-serve
    caminhos:
      - reports/REGISTRO-2026-09-11-fechamento-automatico-do-dia-10-e-o-outlier-sem-sessao.md
    parecer: >-
      Revisado e mantido valido, sem alteracao. Aquele handoff declara ancora
      neste registro e a secao 4 dele afirma duas coisas sobre o fechamento
      automatico -- que o gerador escreve o .json e o diario em markdown e
      autoral de agente, e que a sequencia 5 retem o feedback sem session_id com
      pattern_indexed falso. As duas continuam verdadeiras depois desta edicao.
      O que mudou aqui foi a atribuicao de modelo do diario, de Codex GPT-6 para
      codex@gpt-6-astra, e o handoff nao afirma autoria daquele artefato em
      nenhum ponto -- logo nada nele precisou de emenda. Conferido lendo a secao
      4 inteira, nao por presuncao de que citacao nao afeta ancora.
  - registro: handoff-2026-09-03-sessao-outlier-infraestrutura
    caminhos:
      - reports/agent-calibration/outlier-evidence-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. Aquele handoff publicou o outlier 2d55d92a na
      sequencia 3, com disposition de evidencia retida e pattern_indexed falso. A
      entrada nova e a sequencia 5 e o diff tem 1 insercao e 0 remocoes, logo a
      sequencia 3 nao foi tocada -- reli o registro e da7ef222, b39b7431,
      2d55d92a e 512fc3a6 seguem identicos, todos com pattern_indexed falso e a
      mesma disposition. A cadeia SHA-256 fecha em 5 elos. Nada no handoff
      depende da contagem total de entradas, so da sua propria, que permanece.
  - registro: registro-2026-09-03-nota-10-e-outlier-de-aceleracao
    caminhos:
      - reports/agent-calibration/outlier-evidence-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. Aquele registro publicou o outlier da7ef222 na
      sequencia 1 e afirma tres coisas que reconferi uma a uma -- record_type
      outlier, sequencia 1 e pattern_indexed falso. As tres continuam verdadeiras
      depois do append. A tese central dele, de que o ledger de outlier e
      separado do de feedback de proposito, fica reforcada e nao contrariada
      pela entrada nova -- 99da81dc anexa evidencia de um feedback sem
      identificador de sessao sem alterar nota nem inventar sessao, que e
      exatamente o comportamento que aquele registro descreveu.
---

# Registro — o fechamento automático do dia 10, e o outlier sem sessão

## 1. O que apareceu, e por que não fui eu

Ao verificar a limpeza da árvore depois de rodar um script na raiz, encontrei o
`Site` com três alterações que não eram minhas. São o **fechamento automático do
dia local 10/09**, disparado às 23:59:37 local e gravado às 00:00:39 de 11/09:

| Artefato | Natureza |
| :--- | :--- |
| `reports/agent-calibration/daily/2026-09-10.json` | saída do gerador — `schema_version: agent-calibration-evidence/v4` |
| `reports/agent-calibration/daily/2026-09-10.md` | adendo **autoral de agente**, 28 linhas de prosa |
| `reports/agent-calibration/outlier-evidence-ledger.jsonl` | sequência 5, append puro |

Essa divisão confirma a correção que eu mesmo publiquei em
`REGISTRO-2026-09-10-busca-web-como-dado-nao-confiavel.md` §2: o gerador escreve o
`.json` e **não** escreve o diário em markdown. Eu havia afirmado antes o
contrário, corrigi, e o comportamento observado hoje sustenta a correção.

### 1.1 A atribuição estava errada — mas não onde eu procurei

Levantei suspeita de má atribuição **entre as duas execuções** e isso não se
confirmou. A má atribuição é outra, e está **dentro** do campo: ele nomeia o modelo
errado.

O que eu media: o frontmatter declarava `autor: Codex GPT-6 (Tier 1)`, o adendo das
23:59 não se atribui a ninguém, o `.json` do gerador não tem campo de autor, agente
ou modelo, a entrada do ledger de outlier também não, e a mensagem da tarefa das
00:02 vinha rotulada "Auditoria do Astra".

**Respostas do Tier 0, 2026-09-11, em tres etapas — e cada uma corrigiu a
leitura anterior. A terceira esta na §4.2 e move a fronteira para 09-09:**

1. *"Automatização do Codex, Astra não estava em sessão."* Concluí que o campo
   estava correto e escrevi isso aqui. **Errado.**
2. *"Sim, a automação é do Codex, mas o modelo usado foi o Astra."*

**Automação e modelo são eixos distintos, e o campo `autor` fundia os dois.** A
automação é do Codex; o modelo que executou foi o Astra. Declarar
`Codex GPT-6 (Tier 1)` nomeava um modelo — `GPT-6` — que **não rodou**. "Astra não
estava em sessão" é verdade sobre sessão interativa e não sobre execução de modelo;
foi nessa distinção que eu escorreguei, e ela é a mesma que o `conductor_model` do
ledger de feedback existe para manter separada.

**Corrigido para `autor: codex@gpt-6-astra`.** A forma não é invenção: a §7 do
`Site\CLAUDE.md` já fixa a convenção **automação@modelo** no exemplo
`antigravity@gemini-3.8-flash`, e a §8.3 exige o `conductor_model` exato —
`gpt-6-astra` é o identificador que o `MODEL_REGISTRY` usa. O valor anterior era
`Codex GPT-6 (Tier 1)`, e fica registrado aqui porque apagar a string apagaria a
evidência de que o campo já afirmou outra coisa.

**Por que corrigir o arquivo e não só anotar aqui.** A §7 proíbe **reescrever
histórico publicado**, e não é o caso: o commit `c5604220` permanece intacto e a
correção entra adiante, por commit novo. O que a §10.3 me proíbe é alterar o
*instrumento* que me mede — o gerador —, e eu não o toquei. Campo de dado
factualmente errado num relatório é dado, não instrumento.

Este é o mesmo princípio que levou a reemitir o commit do Gemini em 2026-09-10:
**atribuição errada é pior que atribuição ausente.** A ausência declara que não se
sabe; a errada declara algo que não é. O adendo continuar sem autoria própria é
lacuna; o campo nomear o modelo errado era afirmação falsa.

**O que fica declarado e não consertado:** o pipeline não emite campo de autor por
apêndice, nem separa automação de modelo. Corrigir o gerador para isso seria alterar
o instrumento que mede o desempenho do agente, e a §10.3 o proíbe sem autorização
explícita do Tier 0. A correção aqui foi no **dado**, não no instrumento.

## 2. Por que estou commitando artefato que outro agente produziu

O adendo declara, ele próprio, *"nenhum commit ou push"*. Isso descreve o que o
**ciclo de fechamento** faz, não o que deve acontecer com o resultado: os irmãos
`2026-09-08.json` e `2026-09-09.json` estão versionados, e os dois ledgers também.
Arquivo rastreado deixado modificado é o repositório mentindo sobre o próprio
estado — a mesma classe de defeito que consertei três vezes no dia 10.

Não editei o conteúdo de nada. O diário de 10/09 **não tem `atualizado_em`** no
frontmatter, e meu primeiro impulso foi acrescentar, como fiz com `criado_em`
naquele mesmo arquivo no dia anterior. **Não acrescentei**, porque medi primeiro:
o portão de âncora aprovou os três arquivos sem o campo. Logo ele não é exigido
para relatório diário, e a correção seria preferência minha disfarçada de
requisito — dentro de registro alheio.

## 3. O outlier da sequência 5

`99da81dc` anexa evidência de que o feedback `277d4f23`, nota 9,5, foi gravado com
**`session_id` vazio**. O ledger o retém com `pattern_indexed` falso e disposition
`retained-pending-deterministic-review`: preserva a ausência em vez de adivinhar o
identificador. É o comportamento correto — inventar o ID inflaria a contagem de
sessões distintas, que é justamente a métrica que autoriza calibração.

Consequência para a métrica do portão: dos dois feedbacks 9,5 do dia 10, **um não
identifica sessão**. O que tem sessão é `6d4a8598`, de
`claude-opus5-raiz-e-site-2026-09-10`, que registra o mesmo foco em periferia em
detrimento de eficiência já relatado em 08/09.

## 4. O ciclo roda toda noite — e quatro noites não deixaram relatório

O Tier 0 informou em 2026-09-11 que o fechamento das 23:59 ocorre **todas as
noites**. Isso transformou a verificação: o que eu tratava como um arquivo passou a
ser uma série, e série se audita por continuidade.

| Dia | relatório `.md` | artefato `.json` | sessões ativas no dia |
| :--- | :--- | :--- | ---: |
| 2026-08-29 a 09-02 | sim | ausente | — |
| **2026-09-03** | **AUSENTE** | sim | 4 |
| **2026-09-04** | **AUSENTE** | sim | 2 |
| **2026-09-05** | **AUSENTE** | sim | 3 |
| 2026-09-06 a 09-08 | sim | sim | — |
| **2026-09-09** | **AUSENTE** | sim | 0 |
| 2026-09-10 | sim | sim | — |

**Em quatro noites o gerador rodou e o relatório que o passo 7 exige não existe.**
O `.json` prova que a medição aconteceu; a ausência do `.md` diz que a análise não
foi registrada. O passo 2 é explícito: ausência de dado é **resultado válido** e
deve ser escrita literalmente — logo nem dia vazio dispensa o relatório. O 09-09,
com **zero** sessões ativas, é o caso mais defensável dos quatro, e ainda assim o
passo 2 pedia a frase.

**O que eu NÃO afirmo, e a distinção importa.** Não sei se o portão de suficiência
estava aberto naquelas noites. `sessoes_com_feedback_count` é contagem
**acumulada** desde a última calibração, e o critério **diário** depende dos
feedbacks do dia — são escopos diferentes, e confundi-los seria a mesma falha que
este registro documenta em outros lugares. O que a ausência do `.md` custa é
justamente isto: **não há como saber o que foi concluído**, e a trilha que o passo
2 existe para criar tem quatro buracos.

Antes de 09-03 o padrão se inverte: `.md` sem `.json`, porque o gerador v4 ainda
não produzia artefato. Isso não é buraco, é mudança de versão.

### 4.1 A autoria varia, e quatro diários violam a §7

| Dias | `autor` declarado |
| :--- | :--- |
| 08-29 a 09-01 | `chico@v8-gold` |
| 09-02 | `Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-02-pmev` |
| 09-06, 09-07, 09-08 | `Codex GPT-6 (Tier 1)` |
| 09-10 | `codex@gpt-6-astra` (corrigido aqui) |

**Os quatro primeiros assinam como `chico@v8-gold`, e a §7 do `Site\CLAUDE.md`
proíbe exatamente isso:** *"Chico é a identidade do projeto como grupo... O grupo
nunca escreve registro nem commit; quem escreve é um indivíduo dentro dele."* São
quatro registros assinados pelo grupo, e a regra que os proíbe mora no mesmo
repositório.

**Resolvido pelo Tier 0 em 2026-09-11:** *"Astra foi lançado recentemente, então
anteriormente quem fazia era o Terra 5.6."* Com isso os sete campos foram
normalizados à convenção **automação@modelo** da §7, usando os identificadores
canônicos do `MODEL_REGISTRY` — não strings inventadas:

| Dias | antes | depois |
| :--- | :--- | :--- |
| 08-29, 08-30, 08-31, 09-01 | `chico@v8-gold` | `codex@gpt-5.6-terra` |
| 09-06, 09-07, 09-08 | `Codex GPT-6 (Tier 1)` | `codex@gpt-6-astra` |
| 09-10 | `Codex GPT-6 (Tier 1)` | `codex@gpt-6-astra` |

`09-02` ficou intacto: `Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-02-pmev`
já é individual, correto e mais informativo que a forma curta. Uniformizá-lo seria
preferência minha, não correção.

**Dois apoios que tornam isso medição e não inferência.** `gpt-6-astra` é o **único**
`gpt-6` do registro, logo `Codex GPT-6` é inequívoco; e `gpt-5.6-terra` é o
identificador exato do Terra. Verificado por varredura do `llm/model_registry.py`.

**Uma inferência que fica declarada porque não foi confirmada:** o Tier 0 nomeou o
**modelo** de agosto, não a automação. Apliquei o prefixo `codex@` aos quatro por
ser a mesma série de artefato produzida pela mesma tarefa agendada — mas só o modelo
foi confirmado. Se a automação de agosto era outra, o prefixo desses quatro precisa
mudar, e só isso.

### 4.2 O ledger, corrigido — e a correção errada que eu tive de superar

`conductor_model` aparecia no ledger com três valores: `claude-opus-5`,
`gemini-3.8-flash` e **`Codex GPT-6`**. Os dois primeiros são canônicos; o terceiro
não é, e a §8.3 exige o *"modelo condutor exato"*. Um único registro afetado:
sequência 16, `event_id 0b30eafd-b57f-47dc-bf28-9822a0f36769`, de **2026-09-05**,
`supervision_mode: assistida`, nota 10,0.

Autorizado pelo Tier 0 em 2026-09-11, corrigido por
`Record-AgentCalibrationCorrection.ps1` — nunca por reescrita. **Foram duas
correções, porque a primeira foi minha e estava errada:**

| Seq | Valor corrigido | Situação |
| ---: | :--- | :--- |
| 23 | `gpt-6-astra` | **errada, superada** |
| 24 | `gpt-5.6-terra` | vigente |

**A causa do meu erro é instrutiva e é circular.** Eu raciocinei: o rótulo diz
`Codex GPT-6`, `gpt-6-astra` é o único `gpt-6` do registro, o registro é de 09-05 e
o Astra lançou em 09-03 — logo Astra. **Usei o rótulo sob suspeita como evidência
para decidir o que o rótulo deveria dizer.** O campo estava errado justamente na
parte que eu tomei por verdadeira. Só o Tier 0 podia fechar isso, e fechou:
*"astra de dia 09 até hj; antes disso, 5.6 Terra"* — 09-05 é anterior a 09-09, logo
Terra.

A mesma fronteira corrigiu três diários que eu já havia marcado como Astra:
**09-06, 09-07 e 09-08 são `codex@gpt-5.6-terra`**, não Astra. Só o 09-10 é Astra.

**Verificado ponta a ponta:** validador oficial aprova antes e depois (23 → 24
registros), o diff é `1 inserção / 0 remoções` em cada append, e o gerador aplica
as correções em ordem de arquivo com `Add-Member -Force`, logo a última vence —
medido: o `por_sessao` daquela sessão agora lê `conductor_models: ['gpt-5.6-terra']`
e `correcoes_aplicadas: 4`.

### 4.3 O gerador NÃO precisava de mudança — eu havia afirmado que precisava

Eu havia escrito que *"o pipeline não emite campo de autor por apêndice, nem separa
automação de modelo"* e pedido autorização para corrigir o gerador. **A segunda
metade da frase é falsa.** Medido: `New-AgentCalibrationDailyEvidence.ps1` já coleta
e **já emite**, por sessão, `conductor_models` e `supervision_modes` — exatamente a
separação que a §8.3 exige.

Eu cheguei à conclusão errada por ter consultado a chave `conductor_model`, no
singular, no artefato gerado; ela não existe, e a que existe é
`conductor_models`, no plural, porque uma sessão pode ter mais de um. A resposta
vazia era do meu nome de chave, não do instrumento. **Quarta ocorrência hoje da
mesma classe de erro**, e a única em que ela quase virou alteração de um instrumento
que a §10.3 protege.

Com a autorização em mãos eu **não** alterei o gerador, porque não há o que alterar.
O que sobra é real e é de outra natureza: o frontmatter do diário tem **um** campo
`autor` e o arquivo recebe **dois** eventos de autoria quando há adendo. Isso não é
script — é o passo 7 da instrução da tarefa agendada, que fixa a ordem das seções e
não prevê atribuição por apêndice. Mudança ali é do Tier 0, e eu não mexo em
instrução de tarefa.

## 5. Um vazio declarado

**Não existe validador oficial para o ledger de outlier.** Há
`Test-AgentCalibrationLedger.ps1` para o de feedback, e nenhum `Test-*.ps1`
menciona outlier. Conferi a cadeia com script próprio e ela fecha em 5 elos, mas
isso é verificação minha, não controle do projeto — e controle que não existe não
passa a existir porque alguém conferiu à mão uma vez. Fica declarado, sem
conserto: criar o validador hoje seria eu construindo o instrumento que mede o meu
próprio registro, e a §10.3 não permite.
