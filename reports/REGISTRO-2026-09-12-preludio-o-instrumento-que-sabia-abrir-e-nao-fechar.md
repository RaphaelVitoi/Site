---
id: registro-2026-09-12-preludio-o-instrumento-que-sabia-abrir-e-nao-fechar
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-12T06:40:00-03:00'
atualizado_em: '2026-09-12T08:19:19-03:00'
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
  - os quatro .ps1 revalidados em Windows PowerShell 5.1 REAL (5.1.26100.9444), parse e execucao
  - os tres que tocam o ledger recusam a 5.1 por decisao de projeto -- falha fechada verificada
  - caminho feliz reexercido em pwsh 7.6.6 contra caminhos injetados, cadeias de scratch validas
  - os oito SHAs de submodulo conferidos por git ls-remote contra o remoto fork -- oito de oito
  - clone de teste resolve os submodulos pelos forks e nao materializa o hook session-end.js, ja apagado
  - nenhum PR upstream nos oito repositorios de origem, medido com gh pr list --state all
  - outlier grave 7e5ca052 registrado -- cadeia de outliers valida, 8 registros, cauda b69d6ec1
nao_verificado:
  - o falsificador do outlier da7ef222 continua sem rodar -- falta classificar janela de contexto
  - nenhum dos CINCO outliers abertos foi promovido ou descartado -- arbitragem pendente
  - as tres correcoes de seguranca dos submodulos seguem sem PR upstream -- publicacao externa, e do Tier 0
  - o fork administra a divergencia, nao a encerra -- atualizar upstream vira rebase da branch de patch
  - a divergencia entre prompt diario e regra acumulada segue sem correcao na origem -- a origem NAO esta neste repositorio
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
  - .gitmodules
  - patches/skills/README.md
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
      TERCEIRA REVISAO NO MESMO DIA, e esta ALTERA a SS9 -- territorio direto desta ancora. Entra a SS9.1 por arbitragem do Tier 0: edicao ou intervencao PONTUAL na taxonomia nao gera regra, salvo arbitragem aditiva dele. A tabela de quatro diretorios permanece byte a byte; a subsecao nova governa como se LE uma excecao a ela, nao o que ela determina. E ela e autoaplicavel: a propria SS9.1 entra por arbitragem aditiva, que e o unico caminho que ela reconhece.
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
      TERCEIRA REVISAO NO MESMO DIA, e ela toca esta ancora de perto sem mudar o que ela decidiu. A SS8.3 ganha a subsecao que declara onde mora o prompt do heartbeat -- na plataforma do Codex, fora do indice do git -- e transcreve o criterio de substituicao. O criterio EXECUTAVEL nao mudou: a unidade segue sendo a sessao distinta, o minimo segue sendo tres e a contagem segue sem expirar. O que entra e a declaracao de que existe um segundo criterio, nao versionado, que diverge deste desde 2026-09-06 no outlier 512fc3a6, e que o record_gate.py nunca poderia cobrar porque so enxerga o indice. Dos dois .ps1 desta ancora, nenhum foi alterado nesta revisao; ambos passaram na revalidacao em 5.1 real.
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
      TERCEIRA REVISAO NO MESMO DIA, e agora a SS10 e CITADA, nao alterada. A subsecao nova da SS8.3 usa a SS10.5 como precedente: o prompt do cron do Jules mora na plataforma e a regua viaja com o codigo, e a auditoria diaria do Codex esta na mesma situacao. Nenhum item da SS10 muda de texto ou de numeracao; o que muda e que a solucao dela deixa de ser um caso do Jules e passa a ser a forma geral para automacao de fora.
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

## Adendo do mesmo dia — a revalidação em 5.1 foi feita, e ela achou algo

O item de `nao_verificado` sobre PowerShell 5.1 estava lá porque a bateria
substituta não alcança cmdlet inexistente nem recurso de classe do 7 — ambos
falham em **tempo de execução**, e nenhum parser os pega. O host desta sessão é
Windows, então a lacuna não era de instrumento: era de não ter rodado.

Rodou, em `5.1.26100.9444`, e a asserção correta **não** é "roda na 5.1":

| Script | O que a 5.1 tem de fazer | Medido |
| :--- | :--- | :--- |
| `Register-AgentCalibrationDailyTask.ps1` | rodar — não toca o ledger | `-WhatIf` descreve e sai |
| `Write-AgentCalibrationDailyEvidence.ps1` | **recusar** | falha fechada |
| `Register-AgentCalibrationFeedback.ps1` | **recusar** | falha fechada |
| `Record-AgentCalibrationOutlier.ps1` | **recusar** | falha fechada |

A recusa é o comportamento certo, e é transitiva: os três chamam
`Test-AgentCalibrationLedger.ps1`, que é o único da família com o portão de
versão. O `ConvertTo-Json` da 5.1 emite texto diferente, e uma cadeia **íntegra**
apareceria como `Hash mismatch` — gravar ali corromperia a evidência sem
corromper um byte de disco. Meu primeiro teste afirmou o oposto e contou as três
recusas como falha; o teste é que estava errado.

As guardas de argumento correm **antes** do portão de versão, e por isso valem
na 5.1: `ToolErrors > ToolCalls` barra, par sem `-ToolErrorMethod` barra,
`-Resolves` de alvo inexistente barra. O caminho feliz foi reexercido em
`pwsh 7.6.6` contra caminhos injetados, e as duas cadeias de scratch validam.

**O achado.** `Record-AgentCalibrationOutlier.ps1` declarava
`[string]$MetricsJson = '{}'` — e a validação exige ao menos uma propriedade.
O default **nunca** podia passar, nas duas versões: a assinatura anunciava um
parâmetro opcional e o script morria com `MetricsJson must be a JSON object`
sobre um valor que **é** um objeto JSON. A mensagem culpava a entrada de quem
chamou. É defeito de 2026-08-30, não desta sessão, e sobreviveu porque os dois
registros existentes sempre passaram métricas — ninguém nunca exerceu o default.

Corrigido tornando o parâmetro `Mandatory` e removendo o default mentiroso: a
falha passa a ocorrer na **ligação do parâmetro**, onde o próprio PowerShell
nomeia o que falta. É a mesma forma dos outros três defeitos deste dia — o
instrumento que anuncia uma capacidade que não tem.

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

E agora se sabe **por que** ela sobreviveu seis dias sem dono. O Tier 0 declarou
em 12/09 que a automação é *scheduled por Codex*: o prompt mora na plataforma
do Codex e **não é versionado aqui**. Medido — uma varredura completa do
repositório pelo identificador `calibra-o-di-ria-de-coer-ncia-ag-ntica` devolve
dois arquivos, o registro do outlier e um diário que o cita; nenhum é o prompt.
Não havia arquivo a corrigir, e por isso o portão de âncora nunca podia cobrar
a correção: **o portão só enxerga o que está no índice do git.**

É exatamente a forma da §10.5 — a régua do Jules vive no repositório de
propósito, porque o prompt do cron dele mora na plataforma. A diferença é que
lá a assimetria foi declarada, e aqui não era. Está declarada agora, na §8.3,
com o texto de substituição pronto: a correção é do Tier 0 porque só ele
alcança o campo, não porque a decisão seja dele.

## Outlier grave `7e5ca052` — o fork sem gitlink, e o desleixo duplo

**Declarado outlier grave pelo Tier 0 em 2026-09-12** e registrado na sequência
7 do ledger de outliers, cauda `b69d6ec1`. Duas camadas, e o registro as mantém
separadas de propósito — a contramedida de uma não alcança a outra.

### A primeira camada — o fork sem gitlink

Chamei os oito submódulos de `skills/` de "deriva não minha". O Tier 0 corrigiu:
*os submódulos foram pra fork, você mesmo fez na última sessão*. Está certo, e a
medição confirma — oito forks públicos de `RaphaelVitoi`, oito branches
nomeadas, oito SHAs conferidos por `git ls-remote` contra o remoto.

O `patches/skills/README.md`, que eu mesmo escrevi em 28/08, já prescrevia a
saída: *"Fork próprio por submódulo, **com o gitlink apontando para ele**"*.
São duas metades. Fiz a primeira em 11/09 e não fiz a segunda.

**A consequência não é de arrumação.** Quem clonasse o `Site` recebia o gitlink
antigo. Para o `gemini-supermemory`, o commit `035c843d` — que ainda traz
o hook `session-end.js`, registrado como `SessionEnd` e chamado
`supermemory-session-saver`, que a cada fim de sessão enviava resumo do trabalho
para a API externa da Supermemory com `SUPERMEMORY_API_KEY`. O patch removia
isso desde 28/08 **na árvore local**. `patch` protege a máquina; ele nunca
protegeu o clone.

O portão de registro barrou a primeira versão deste parágrafo, e o achado dele é
bom: eu havia escrito o caminho completo do arquivo, e o portão o resolveu contra
o disco e não o encontrou — *documento que instrui não pode apontar para o
vazio*. Só que aqui a inexistência **é** o fato. A correção não é remover a
frase, é escrever o nome do arquivo como referência histórica em vez de caminho
vivo, que é o que ele passou a ser no instante em que o gitlink avançou.

Fechado hoje: `.gitmodules` repontado para os oito forks e os oito gitlinks
commitados **no mesmo ato** — separá-los publicaria um estado que não clona,
porque os SHAs não existem em upstream. Verificado por clone de teste, e não por
raciocínio: `git submodule update --init` resolve pelos forks, e
`skills/gemini-supermemory/src/hooks/` contém apenas `session-start.js`.

**A classificação errada, que é a raiz.** A tabela de triagem daquele README
descrevia o patch do supermemory como *"Ajustes em `src/lib/*`"*. Montei-a
classificando por **contagem de arquivos e diretório dominante**: onze dos doze
arquivos são ajustes de lib, então a linha virou "ajustes". O décimo segundo era
a remoção de um canal de egress. Uma tabela de triagem que classifica por volume
faz a única linha de segurança parecer a mais inócua — e foi por isso que, ao
voltar ao assunto em 11/09, tratei o fork como trabalho novo em vez de
reconhecer o que já estava catalogado, e não fechei o gitlink. Reclassificada.

### A segunda camada — a autocorreção que não ocorreu

É por ela que o Tier 0 chama de **duplo**, e ela é a mais séria das duas.

Os oito submódulos apareceram como modificados no **primeiro `git status` deste
turno**. Eu os examinei, concluí deriva não minha, e os dispensei com *"subir
isso é decidir versão de skill, e essa decisão não é minha"*. A evidência estava
na tela. O custo de verificar era **um** comando — `git diff --submodule=log`,
que imprime as mensagens de commit em linguagem que é reconhecivelmente a minha.
A verificação só aconteceu depois que o Tier 0 corrigiu.

Não foi falta de dado, e não foi falta de tempo. Foi **atribuir a outro um
trabalho próprio de um dia antes, e encerrar a análise na atribuição**. A §4 da
raiz manda medir antes de agir; aqui a atribuição de autoria funcionou como
motivo para **não** agir, e essa é a forma em que ela escapa da regra — a regra
fala de agir, e eu me isentei justamente por não ir agir.

A contramedida não é a mesma da primeira camada. A primeira pede critério de
triagem por **efeito**, não por volume. A segunda pede que **atribuição de
autoria seja medida** — `git log`, `git reflog`, a mensagem do commit — antes de
servir de razão para deixar algo em paz. As duas causas produziram um episódio
só, e fundi-las produziria uma contramedida que não cobre nenhuma.

### O que fica aberto, e é o que tem mais valor

Nenhum PR upstream para as três correções
de segurança — `gemini-cli-security`, `gemini-cli-jules`, `gemini-supermemory` —,
medido com `gh pr list --state all` nos oito repositórios de origem: nenhum, em
nenhum estado. O próprio README diz que upstream aceito **encerra** a
divergência em vez de administrá-la, e o fork apenas a administra: atualizar
deixa de ser fast-forward e vira rebase da branch de patch. Abrir PR em
repositório de terceiro é publicação externa e é do Tier 0.

## A arbitragem aditiva do Tier 0 sobre a taxonomia

Declarada em 12/09 e gravada na **§9.1**: edição ou intervenção **pontual** na
taxonomia **não gera regra**, salvo por arbitragem aditiva do Tier 0.

A cláusula fecha um caminho de erro que este repositório já percorreu do outro
lado. A §2.3 da raiz recusa agrupar por parecença — três lançadores de Chrome na
raiz não eram uma regra sobre lançadores de Chrome, eram três casos. A §9.1 é a
mesma recusa aplicada ao tempo em vez do espaço: **precedente não é medição**, e
um caso não vira norma por ter acontecido. Um agente que encontra uma exceção
tende a lê-la como autorização, e é indução a partir de uma amostra.

Ela é autoaplicável, e isso não é ornamento: a própria §9.1 entra por arbitragem
aditiva do Tier 0, que é o único caminho que ela reconhece. A tabela dos quatro
diretórios não mudou um byte — a subseção governa **como se lê uma exceção** a
ela, não o que ela determina.

## Três âncoras revistas de dezessete, e por quê

Dezessete âncoras deste registro declaram `CLAUDE.md`. Repassar as dezessete
produziria o **parecer genérico** que a §1.2 chama de pior que nenhum: parece
revisão sem ser. Revistas as três materialmente tocadas —
`taxonomia-canonica-de-documentacao-e-relatorios`, cujo território é a própria
§9; `registro-2026-09-02-portao-de-calibracao-por-sessao`, porque o critério
divergente é o do portão dela; e `registro-2026-09-05-regua-para-agente-autonomo-de-nuvem`,
porque a §10.5 passa de caso do Jules a forma geral. As catorze restantes
continuam válidas pelo parecer que já têm, e dizê-lo é a revisão delas.

O `atualizado_em` publicado marcava `07:50:00`, e o commit que o gravou é de
`07:24:37` — vinte e seis minutos **à frente**. O campo foi digitado, não lido
do relógio. É a §2.4 outra vez, na escala de minutos: data escrita num documento
descreve o documento, não o fato que ele narra. Substituído por valor medido.

## A nota chegou — o prelúdio se fecha no handoff

**9.0**, sequência 55 do ledger, cadeia válida em 56 registros. Como a §8.3
estabelece, a nota mora no handoff e este documento era o corte intermediário:
ele não era sessão sem nota, era sessão inacabada, e agora acabou.

O comentário qualitativo do Tier 0 trouxe dois fatos que este registro **não**
tinha: o intervalo de catorze dias entre recomendar o fork e fazê-lo, e a
correção de que as skills não estão mais *dirty*. Os dois estão medidos em
`reports/AUDITORIA-2026-09-12-a-tarefa-que-ficou-em-aberto-e-a-memoria-de-curto-prazo.md`,
que é o registro de encerramento desta sessão e declara o mesmo `session_id`.

## Nota de método

O ledger é append-only e nada foi reescrito. As correções apontam para os
registros originais, que permanecem. O `2026-09-12.md`, auditoria do Codex,
ficou factualmente vencido por este ciclo e **não** foi alterado: registro
publicado não retroage.
