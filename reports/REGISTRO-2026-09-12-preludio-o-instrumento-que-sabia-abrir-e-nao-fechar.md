---
id: registro-2026-09-12-preludio-o-instrumento-que-sabia-abrir-e-nao-fechar
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-12T06:40:00-03:00'
atualizado_em: '2026-09-12T07:40:00-03:00'
classes: [interno, medido, calibracao, preludio]
verificado:
  - cadeia de feedback valida em toda escrita -- 27 para 55 registros, cauda 03c200e8
  - cadeia de outlier valida -- 6 para 7 registros, cauda 2ed1a4f9
  - primeiro ciclo de calibracao da serie fechado, sequencia 27, portao reiniciado de 19 para 0
  - condutor completo em 21 de 21 feedbacks e session_id em 21 de 21
  - 2026-09-11.json reconstruido do ledger e marcado com reconstruido true
  - suite de calibracao verde quatro vezes -- 30 aprovados, zero erro, zero warning
  - indice de erro de ferramenta cobre os tres veiculos -- 31 sessoes contra as 5 anteriores
  - Record-AgentCalibration.ps1 sem nenhum invocador, medido com rg --no-ignore --hidden
  - tarefa agendada corrigida por execucao elevada do Tier 0 -- WakeToRun e baterias
nao_verificado:
  - Windows PowerShell 5.1 nos quatro .ps1 alterados -- so AST do pwsh 7 e bateria de bytes
  - o falsificador do outlier da7ef222 continua sem rodar -- falta classificar janela de contexto
  - nenhum dos quatro outliers abertos foi promovido ou descartado -- arbitragem pendente
  - a divergencia entre prompt diario e regra acumulada segue sem correcao na origem
  - eficacia comportamental do padrao calibrado -- nao ha ciclo posterior para comparar
caminhos:
  - CLAUDE.md
  - reports/agent-calibration/feedback-ledger.jsonl
  - reports/agent-calibration/outlier-evidence-ledger.jsonl
  - reports/agent-calibration/daily/2026-09-11.json
  - reports/agent-calibration/daily/2026-09-12.json
  - scripts/ops/Write-AgentCalibrationDailyEvidence.ps1
  - scripts/ops/Register-AgentCalibrationDailyTask.ps1
  - scripts/ops/Register-AgentCalibrationFeedback.ps1
  - scripts/ops/Record-AgentCalibrationOutlier.ps1
  - scripts/ops/agent_tool_error_index.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
revisoes_de_ancora:
  - registro: taxonomia-canonica-de-documentacao-e-relatorios
    caminhos:
      - CLAUDE.md
    parecer: >-
      Revisado e mantido valido. A taxonomia da SS9 nao foi tocada: este registro
      nasce em reports/ com frontmatter completo, os diarios seguem em
      reports/agent-calibration/daily e o indice novo entra em scripts/ops ao
      lado do record_gate.py, que ja e Python. A alteracao no CLAUDE.md e
      aditiva em SS7 e SS8.3.
      Revisto de novo no mesmo dia, para a segunda alteracao aditiva do CLAUDE.md: a subsecao de preludio na SS8.3, que fixa o registro que atravessa a compactacao. Sem remocao de secao nem mudanca de numeracao.
  - registro: registro-2026-09-08-o-padrao-de-desvio-de-foco
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      REFORCADO e agora FECHADO. O padrao que este registro documentou em 08/09 e
      exatamente o que a calibracao de sequencia 27 formalizou, com seis
      corroboracoes de sessoes distintas -- duas delas as deste registro,
      c649f81b e 97b5c71a. A leitura mudou num ponto: nao e excesso de contato
      com a periferia, e a periferia ocupando o eixo. Nada foi reescrito.
  - registro: registro-2026-09-05-fechamento-do-ciclo-de-calibracao
    caminhos:
      - scripts/ops/Register-AgentCalibrationDailyTask.ps1
      - scripts/ops/Write-AgentCalibrationDailyEvidence.ps1
    parecer: >-
      REVISADO E AMPLIADO. Este registro criou os dois scripts para que o ciclo
      soubesse fechar; medido em 12/09, o fechamento nunca foi invocado e o
      lastro perdia o dia quando o gatilho das 23:59 nao disparava. As adicoes
      sao aditivas -- -BackfillMissing, aviso de pendencia, WakeToRun e baterias
      -- e nenhum comportamento anterior foi removido.
  - registro: registro-2026-09-11-fechamento-automatico-do-dia-10-e-o-outlier-sem-sessao
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
      - reports/agent-calibration/outlier-evidence-ledger.jsonl
    parecer: >-
      RESOLVIDO. O outlier sem sessao que este registro abriu -- 99da81dc, sobre
      o session_id vazio de 277d4f23 -- foi fechado em 12/09 com a causa
      auditada: o rotulo nunca foi cunhado porque a quota do Gemini esgotou no
      portao. As duas hipoteses originais, omissao na captura e defeito no
      escritor, estavam erradas e ficam registradas como superadas, nao
      apagadas.
  - registro: registro-2026-09-09-saneamento-medicao-datada-identificacao-agentes
    caminhos:
      - CLAUDE.md
    parecer: >-
      REVISADO E AMPLIADO no proprio tema. A SS7 ganhou a subsecao sobre
      identidade residual do git, medida duas vezes -- 10/09 na sessao Gemini e
      12/09 nesta -- porque corpo de commit corrige o registro e nao o campo que
      o GitHub le. Reforca a regra de identificacao distinta em vez de altera-la.
      Revisto de novo no mesmo dia, para a segunda alteracao aditiva do CLAUDE.md: a subsecao de preludio na SS8.3, que fixa o registro que atravessa a compactacao. Sem remocao de secao nem mudanca de numeracao.
  - registro: registro-2026-09-02-portao-de-calibracao-por-sessao
    caminhos:
      - CLAUDE.md
      - scripts/ops/Register-AgentCalibrationDailyTask.ps1
      - scripts/ops/Register-AgentCalibrationFeedback.ps1
    parecer: >-
      REVISADO E MANTIDO VALIDO. A unidade de contagem continua sendo a sessao e
      o minimo continua sendo tres. O que mudou e aditivo: o registrador aceita
      tool_calls, tool_errors e tool_error_method, e a SS8.3 ganhou a distincao
      entre Antigravity 2.0 e o IDE compartilhado. Nenhuma regra de portao foi
      tocada.
      Revisto de novo no mesmo dia, para a segunda alteracao aditiva do CLAUDE.md: a subsecao de preludio na SS8.3, que fixa o registro que atravessa a compactacao. Sem remocao de secao nem mudanca de numeracao.
  - registro: registro-2026-09-02-correcao-de-escala-e-timestamp-no-ledger
    caminhos:
      - CLAUDE.md
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      REVISADO E MANTIDO VALIDO. A disciplina que este registro fixou -- ledger
      append-only, correcao por registro que aponta o alvo -- foi o instrumento
      de todas as 30 correcoes desta sessao. Nenhuma nota foi convertida de
      escala e nenhum registro foi reescrito.
      Revisto de novo no mesmo dia, para a segunda alteracao aditiva do CLAUDE.md: a subsecao de preludio na SS8.3, que fixa o registro que atravessa a compactacao. Sem remocao de secao nem mudanca de numeracao.
  - registro: registro-2026-09-03-nota-10-e-outlier-de-aceleracao
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
      - reports/agent-calibration/outlier-evidence-ledger.jsonl
    parecer: >-
      REVISADO, SEM PROMOCAO. O outlier da7ef222 foi submetido a averiguacao de
      periodo longo em 12/09 e o resultado e que ele NAO e decidivel com o
      instrumento atual: o falsificador exige janelas de contexto classificadas.
      Permanece retido, pattern_indexed falso, e o indice de erro de ferramenta
      criado hoje passa a fornecer o denominador que lhe faltava.
  - registro: agent-calibration-daily-2026-09-02
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. Append-only no ledger; a serie que o diario de
      02/09 observou continua integra e a cadeia foi validada apos cada escrita.
  - registro: registro-2026-09-02-adapters-ligado-ao-caminho-real-anthropic
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. Append-only no ledger; a intersecao com este
      registro e apenas a ancora, e nenhum adapter foi tocado.
  - registro: registro-2026-09-04-nota-9-5-e-analise-paralela-de-nos
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. Append-only no ledger. O feedback fb4f444f
      deste periodo ganhou conductor_vehicle por correcao aditiva; a nota e o
      texto permanecem intactos.
  - registro: registro-2026-09-05-saneamento-nexus-ollama-e-auto-diagnostico
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. Append-only no ledger. A sessao que este
      registro documenta ganhou conductor_vehicle antigravity por derivacao do
      modelo ja gravado; nada mais mudou.
  - registro: registro-2026-09-10-feedback-9-5-multimodal-sota
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      REVISADO E COMPLETADO. Este e o registro da sessao cujo session_id estava
      vazio. O rotulo foi suprido em 12/09 --
      gemini-3.8-flash-site-2026-09-10-multimodal-sota -- e o tema veio do id
      que a propria sessao se deu aqui. Append-only; o registro nao foi
      alterado.
  - registro: registro-2026-09-11-teoria-sota-e-saneamento-multimodal
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. Append-only no ledger. O feedback 2d217894
      desta sessao e uma das seis corroboracoes da calibracao de sequencia 27, e
      foi ele que fixou a leitura correta do padrao: pede MAIS proatividade
      sobre o periferico, nao menos contato.
  - registro: registro-2026-08-29-governanca-piramidal-sota
    caminhos:
      - CLAUDE.md
    parecer: >-
      Revisado e mantido valido. A alteracao no CLAUDE.md e aditiva e nao toca a
      hierarquia de Tiers nem a invariante de commits que este registro fixou.
      Revisto de novo no mesmo dia, para a segunda alteracao aditiva do CLAUDE.md: a subsecao de preludio na SS8.3, que fixa o registro que atravessa a compactacao. Sem remocao de secao nem mudanca de numeracao.
  - registro: registro-2026-09-01-ancora-de-merge-e-instrucao-indexada
    caminhos:
      - CLAUDE.md
    parecer: >-
      Revisado e mantido valido. Nenhum merge nesta sessao e a regra de ancora
      em merge da SS1.2 nao foi tocada; a alteracao e aditiva em SS7 e SS8.3.
      Revisto de novo no mesmo dia, para a segunda alteracao aditiva do CLAUDE.md: a subsecao de preludio na SS8.3, que fixa o registro que atravessa a compactacao. Sem remocao de secao nem mudanca de numeracao.
  - registro: registro-2026-09-03-triade-fronteira-chico-e-concorrencia
    caminhos:
      - CLAUDE.md
    parecer: >-
      Revisado e mantido valido. Alteracao aditiva; a Lei de Concorrencia e a
      identidade de grupo permanecem como estavam.
      Revisto de novo no mesmo dia, para a segunda alteracao aditiva do CLAUDE.md: a subsecao de preludio na SS8.3, que fixa o registro que atravessa a compactacao. Sem remocao de secao nem mudanca de numeracao.
  - registro: registro-2026-09-05-regua-para-agente-autonomo-de-nuvem
    caminhos:
      - CLAUDE.md
    parecer: >-
      Revisado e mantido valido. A SS10 nao foi tocada; a alteracao e aditiva em
      SS7 e SS8.3.
      Revisto de novo no mesmo dia, para a segunda alteracao aditiva do CLAUDE.md: a subsecao de preludio na SS8.3, que fixa o registro que atravessa a compactacao. Sem remocao de secao nem mudanca de numeracao.
  - registro: registro-2026-09-07-integracao-gpt6-astra-e-retirada-do-fable
    caminhos:
      - CLAUDE.md
    parecer: >-
      Revisado e mantido valido. A fronteira Terra/Astra continua exatamente
      como este registro a fixou, e foi ela que decidiu que os dois registros
      GPT da serie sao gpt-5.6-terra por data -- 01/09 e 05/09, ambos anteriores
      a 09/09.
      Revisto de novo no mesmo dia, para a segunda alteracao aditiva do CLAUDE.md: a subsecao de preludio na SS8.3, que fixa o registro que atravessa a compactacao. Sem remocao de secao nem mudanca de numeracao.
  - registro: registro-2026-09-08-arbitragem-soberana-sobre-a-lei-de-concorrencia
    caminhos:
      - CLAUDE.md
    parecer: >-
      Revisado e mantido valido, e exercido. O fechamento do outlier 99da81dc se
      deu por arbitragem soberana do Tier 0, registrada com a autoridade nomeada
      no proprio registro -- que e o que a SS3.1 da raiz exige: a arbitragem
      dispensa a regra, nao o registro.
      Revisto de novo no mesmo dia, para a segunda alteracao aditiva do CLAUDE.md: a subsecao de preludio na SS8.3, que fixa o registro que atravessa a compactacao. Sem remocao de secao nem mudanca de numeracao.
  - registro: relatorio-2026-06-16-auditoria-e-harmonizacao-v8-gold
    caminhos:
      - CLAUDE.md
    parecer: >-
      Revisado e mantido valido. Alteracao aditiva no CLAUDE.md, sem remocao de
      secao nem mudanca de numeracao.
      Revisto de novo no mesmo dia, para a segunda alteracao aditiva do CLAUDE.md: a subsecao de preludio na SS8.3, que fixa o registro que atravessa a compactacao. Sem remocao de secao nem mudanca de numeracao.
  - registro: relatorio-2026-08-29-analise-integral-ecossistema-sota-v8-gold
    caminhos:
      - CLAUDE.md
    parecer: >-
      Revisado e mantido valido. Alteracao aditiva no CLAUDE.md, sem remocao de
      secao nem mudanca de numeracao.
      Revisto de novo no mesmo dia, para a segunda alteracao aditiva do CLAUDE.md: a subsecao de preludio na SS8.3, que fixa o registro que atravessa a compactacao. Sem remocao de secao nem mudanca de numeracao.
  - registro: relatorio-2026-08-29-impacto-quantitativo-qualitativo-sota-v8-gold
    caminhos:
      - CLAUDE.md
    parecer: >-
      Revisado e mantido valido. Alteracao aditiva no CLAUDE.md, sem remocao de
      secao nem mudanca de numeracao.
      Revisto de novo no mesmo dia, para a segunda alteracao aditiva do CLAUDE.md: a subsecao de preludio na SS8.3, que fixa o registro que atravessa a compactacao. Sem remocao de secao nem mudanca de numeracao.
  - registro: auditoria-2026-09-01-retrospectiva-prioridade-sessao
    caminhos:
      - scripts/ops/Register-AgentCalibrationFeedback.ps1
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido: append-only no ledger de feedback -- 28 registros anexados, nenhum reescrito, cadeia validada apos cada escrita; campos aditivos no registrador de feedback -- tool_calls, tool_errors e tool_error_method; nenhum parametro anterior mudou de forma ou de default.
  - registro: auditoria-2026-09-02-curadoria-mcp-e-processos-residuais
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido: append-only no ledger de feedback -- 28 registros anexados, nenhum reescrito, cadeia validada apos cada escrita.
  - registro: auditoria-2026-09-02-retrospectiva-e-observacao-de-calibracao
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido: append-only no ledger de feedback -- 28 registros anexados, nenhum reescrito, cadeia validada apos cada escrita.
  - registro: auditoria-2026-09-03-trabalho-do-gemini-3-8-flash
    caminhos:
      - CLAUDE.md
      - scripts/ops/Register-AgentCalibrationFeedback.ps1
    parecer: >-
      Revisado e mantido valido: alteracao aditiva no CLAUDE.md -- duas subsecoes novas em SS7 e SS8.3, sem remocao de secao nem mudanca de numeracao; campos aditivos no registrador de feedback -- tool_calls, tool_errors e tool_error_method; nenhum parametro anterior mudou de forma ou de default.
      Revisto de novo no mesmo dia, para a segunda alteracao aditiva do CLAUDE.md: a subsecao de preludio na SS8.3, que fixa o registro que atravessa a compactacao. Sem remocao de secao nem mudanca de numeracao.
  - registro: auditoria-2026-09-08-massa-de-fichas-fonte-nao-unica-e-desvio-de-foco
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido: append-only no ledger de feedback -- 28 registros anexados, nenhum reescrito, cadeia validada apos cada escrita.
  - registro: checkpoint-2026-06-14-infrastructure-hardening
    caminhos:
      - CLAUDE.md
    parecer: >-
      Revisado e mantido valido: alteracao aditiva no CLAUDE.md -- duas subsecoes novas em SS7 e SS8.3, sem remocao de secao nem mudanca de numeracao.
      Revisto de novo no mesmo dia, para a segunda alteracao aditiva do CLAUDE.md: a subsecao de preludio na SS8.3, que fixa o registro que atravessa a compactacao. Sem remocao de secao nem mudanca de numeracao.
  - registro: handoff-2026-08-29-governanca-8tiers-vulnerabilidades-subagents
    caminhos:
      - CLAUDE.md
    parecer: >-
      Revisado e mantido valido: alteracao aditiva no CLAUDE.md -- duas subsecoes novas em SS7 e SS8.3, sem remocao de secao nem mudanca de numeracao.
      Revisto de novo no mesmo dia, para a segunda alteracao aditiva do CLAUDE.md: a subsecao de preludio na SS8.3, que fixa o registro que atravessa a compactacao. Sem remocao de secao nem mudanca de numeracao.
  - registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
    caminhos:
      - CLAUDE.md
    parecer: >-
      Revisado e mantido valido: alteracao aditiva no CLAUDE.md -- duas subsecoes novas em SS7 e SS8.3, sem remocao de secao nem mudanca de numeracao.
      Revisto de novo no mesmo dia, para a segunda alteracao aditiva do CLAUDE.md: a subsecao de preludio na SS8.3, que fixa o registro que atravessa a compactacao. Sem remocao de secao nem mudanca de numeracao.
  - registro: handoff-2026-09-01-prioridade-pmev-continuacao
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
      - scripts/ops/Register-AgentCalibrationFeedback.ps1
    parecer: >-
      Revisado e mantido valido: append-only no ledger de feedback -- 28 registros anexados, nenhum reescrito, cadeia validada apos cada escrita; campos aditivos no registrador de feedback -- tool_calls, tool_errors e tool_error_method; nenhum parametro anterior mudou de forma ou de default.
  - registro: handoff-2026-09-02-curadoria-mcp-quarentena-e-roteamento-lazy
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido: append-only no ledger de feedback -- 28 registros anexados, nenhum reescrito, cadeia validada apos cada escrita.
  - registro: handoff-2026-09-03-guarda-de-governanca-camada-anthropic-e-cobertura-cve
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido: append-only no ledger de feedback -- 28 registros anexados, nenhum reescrito, cadeia validada apos cada escrita.
  - registro: handoff-2026-09-03-procedencia-de-solve-e-portao-de-reprodutibilidade
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido: append-only no ledger de feedback -- 28 registros anexados, nenhum reescrito, cadeia validada apos cada escrita.
  - registro: handoff-2026-09-03-sessao-outlier-infraestrutura
    caminhos:
      - reports/agent-calibration/outlier-evidence-ledger.jsonl
    parecer: >-
      Revisado e mantido valido: append-only no ledger de outlier -- o fechamento de 99da81dc e um registro NOVO que aponta o original, que permanece intacto.
  - registro: handoff-2026-09-04-pmev-credenciais-e-submodulos
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido: append-only no ledger de feedback -- 28 registros anexados, nenhum reescrito, cadeia validada apos cada escrita.
  - registro: handoff-2026-09-04-refinamento-sota-radar-telemetria-e-mcps-google
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido: append-only no ledger de feedback -- 28 registros anexados, nenhum reescrito, cadeia validada apos cada escrita.
  - registro: handoff-2026-09-05-fechamento-do-ciclo-e-regua-do-jules
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido: append-only no ledger de feedback -- 28 registros anexados, nenhum reescrito, cadeia validada apos cada escrita.
  - registro: handoff-2026-09-07-integracao-astra-e-calibracao-de-procedimento
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido: append-only no ledger de feedback -- 28 registros anexados, nenhum reescrito, cadeia validada apos cada escrita.
  - registro: handoff-2026-09-07-orquestrador-free-tier-e-calibracao-9-0
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido: append-only no ledger de feedback -- 28 registros anexados, nenhum reescrito, cadeia validada apos cada escrita.
  - registro: handoff-2026-09-10-raiz-versionada-e-o-portao-que-media-outra-pagina
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido: append-only no ledger de feedback -- 28 registros anexados, nenhum reescrito, cadeia validada apos cada escrita.
---

# Registro — prelúdio: o instrumento que sabia abrir e não sabia fechar

**Prelúdio: a sessão ainda não acabou.** Declarado pelo Tier 0 em 2026-09-12.

Prelúdio **não** é sessão sem nota. A nota vem quando a sessão terminar; este
registro é um corte intermediário, publicado para que o trabalho já medido tenha
lastro antes do fim. Não confundir com o caso de `2d55d92a`, onde o Tier 0
determinou ausência de avaliação — ali não haverá nota; aqui ela apenas ainda
não chegou.

Consequência prática: a sessão `claude-opus5-site-2026-09-12-preludio` continua
aberta, e §8.3 é explícita em que compactação de contexto **não** encerra sessão.
O feedback, quando vier, declara este mesmo `session_id` e entra uma vez só.

## O que se pediu, e o que a pergunta revelou

O pedido inicial foi avaliar a auditoria diária de 12/09, escrita pelo Codex. A
camada de dados dela resistiu à conferência inteira — 27 registros, 6 outliers,
os dois hashes de cauda, as três correções e o feedback de 11/09 batem
literalmente. A camada de decisão não resistiu, e por três defeitos.

O primeiro é factual: o relatório afirma *"cadeia sem novas entradas"* nos
outliers, enquanto o `99da81dc` fora gravado em 2026-09-11T00:00:39 — e o
próprio relatório cita o hash `bac3f61b`, que só existe por causa dessa entrada.

O segundo inverte a regra executável. O `2026-09-12.json` trazia
`calibration_planning_permitted: true` com 19 sessões acumuladas, e o gerador
declara `accumulation_never_expires`. O relatório reconhece a divergência entre
o critério acumulado e o recorte diário do prompt, e resolve pelo diário —
concluindo "dados insuficientes" contra o anexo que ele mesmo cita.

O terceiro é uma omissão: a série diária tinha um buraco em 11/09, e o relatório
o trata como escolha metodológica em vez de falha do lastro.

## A causa raiz: três instrumentos que abriam e não fechavam

O Tier 0 nomeou o problema — *"parece haver um mecanismo de avaliação não
funcional"* — e a medição confirmou, em três camadas.

**A avaliação nunca ocorreu.** Zero registros `record_type: calibration` em 27.
`Record-AgentCalibration.ps1` existe desde 2026-09-05, escrito exatamente para
fechar o ciclo, e não tinha **um único invocador** no repositório — busca com
`rg --no-ignore --hidden` em `.ps1`, `.py`, `.md` e `.json`. O cabeçalho dele
descreve o defeito que veio corrigir; o defeito foi reproduzido um nível acima.

**O portão abriu na terceira sessão e nunca fechou.** Como a contagem só
reinicia após um registro `calibration`, `permitted: true` virou constante por
sete dias. Portão que nunca fecha deixa de discriminar.

**O lastro perdia o dia em silêncio.** A tarefa das 23:59 tinha `WakeToRun`
desligado e `DisallowStartIfOnBatteries` ligado; com a máquina indisponível o
gatilho não dispara, e o `StartWhenAvailable` fazia a recuperação lendo o
**relógio da recuperação**. O gatilho de 11/09 não disparou, a recuperação rodou
em 12/09 às 05:32 e gravou `2026-09-12.json` no lugar do dia perdido. As três
métricas que um operador olharia diziam bem: `LastTaskResult 0`,
`NumberOfMissedRuns 0`, tarefa `Ready`. A recuperação teve êxito — no dia errado.

E o mesmo defeito estava um andar abaixo: `Record-AgentCalibrationOutlier.ps1`
tinha `disposition` literal, sem parâmetro. A cadeia de outliers também sabia
abrir e não sabia fechar.

## O que foi feito

| Ato | Resultado |
| :--- | :--- |
| Ciclo de calibração fechado, seq 27 | `70917c50`, portão de 19 para 0 |
| `2026-09-11.json` reconstruído | marcado `reconstruido: true`, série completa |
| `-BackfillMissing` no writer | dia perdido volta, e volta rotulado |
| Tarefa 23:59 corrigida | `WakeToRun`, baterias liberadas, `-BackfillMissing` |
| Consumidor da pendência | `PENDING-CALIBRATION.md` e aviso no ciclo diário |
| `-Resolves` no registrador de outlier | a cadeia passou a saber fechar |
| Outlier `99da81dc` resolvido | causa auditada substituiu duas hipóteses erradas |
| 30 correções de condutor | 21/21 em modelo e veículo, 21/21 em sessão |
| `agent_tool_error_index.py` | 31 sessões nos três veículos, contra 5 |
| `tool_calls` / `tool_errors` / `tool_error_method` | o par entra junto, com procedência |

### O padrão calibrado

Desvio de foco para a periferia: trabalho periférico consumindo o **eixo** da
sessão, em vez de ser despachado barato e autônomo. Seis corroborações de
sessões distintas entre 01/09 e 11/09, atravessando três condutores.

Duas leituras que a montagem corrigiu. A hipótese do relatório do Codex era de
que o desvio dependia do condutor — o ledger mostra que atravessa `codex`,
`claude-code` e `antigravity`, e segmentar por modelo teria procurado no lugar
errado. E o padrão **não** é "tocar menos periferia": o feedback `2d217894` pede
explicitamente mais proatividade sobre o banal. É a periferia ocupando o eixo
que se recusa.

## Dois erros meus, medidos e corrigidos no mesmo dia

**A âncora do backfill.** A primeira versão ancorava no arquivo mais recente —
que, com `2026-09-12.json` já gravado, tornava o buraco de 09-11 inalcançável.
O bloco tornava invisível exatamente o caso que existia para achar. Corrigido
para varrer a janela inteira a partir do início da série.

**A superfície confundida com o veículo.** Concluí que o Antigravity não
instrumentava nada, depois de medir `AppData\Roaming\Antigravity IDE` — que é o
IDE **compartilhado por todos os modelos igualmente**, e não o Antigravity 2.0.
O Tier 0 corrigiu. O veículo mantém um SQLite por conversa em
`~/.gemini/antigravity/conversations`, com `status` tipado e `error_details`: é
o mais bem instrumentado dos três, o oposto do que eu afirmara. Superfície
compartilhada não identifica condutor.

Os dois erros entraram no `CLAUDE.md` a pedido do Tier 0, junto de um terceiro
que mordeu nesta sessão e já estava documentado sem ter sido evitado: a
identidade do git é residual, e `user.email` ainda apontava para
`noreply@openai.com` da sessão anterior do Codex. O commit `21ef0373` narrava
exatamente esse caso em 10/09. Corpo de commit corrige o registro, não o campo
que o GitHub lê — por isso a regra agora manda conferir antes de commitar e
passar a identidade no próprio comando.

## O que fica aberto

Quatro outliers, e eles são **quatro espécies**, não quatro amostras de uma
pergunta — agrupá-los por data seria a parecença que a §2.3 da raiz combate.
Só `da7ef222` é da classe comportamental, e a averiguação de período longo diz
que ele **não é decidível** com o instrumento atual: o falsificador exige janelas
de contexto classificadas, e classificar "segurança" e "erro próprio" não é
determinístico hoje. Não é falta de tempo; é falta de medição.

Segue sem dono a divergência do `512fc3a6`: o prompt do heartbeat pede recorte
diário enquanto o código diz `accumulation_never_expires`. Fechei o sintoma
hoje; a causa é uma linha de prosa, e é do Tier 0.

## Nota de método

O ledger é append-only e nada foi reescrito. As correções apontam para os
registros originais, que permanecem. O `2026-09-12.md`, auditoria do Codex,
ficou factualmente vencido por este ciclo e **não** foi alterado: registro
publicado não retroage.
