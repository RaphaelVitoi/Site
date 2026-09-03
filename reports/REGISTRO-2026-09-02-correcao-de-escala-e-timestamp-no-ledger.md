---
id: registro-2026-09-02-correcao-de-escala-e-timestamp-no-ledger
tipo: relatorio
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: 2026-09-02T21:40:00-03:00
atualizado_em: 2026-09-02T21:40:00-03:00
classes: [interno, medido, calibracao, retificacao]
caminhos:
  - CLAUDE.md
  - reports/agent-calibration/feedback-ledger.jsonl
  - scripts/ops/Test-AgentCalibrationLedger.ps1
  - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
  - scripts/ops/Record-AgentCalibrationCorrection.ps1
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  pwsh: 7.6.5
revisoes_de_ancora:
  - registro: registro-2026-09-02-portao-de-calibracao-por-sessao
    caminhos:
      - CLAUDE.md
      - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: >-
      Revisado, e ele ganhou um defeito LATENTE que so agora foi exercitado.
      Aquele registro criou a metrica por sessao e acrescentou `session_started_at`
      ao ESCRITOR do ledger. Nao estendeu ao VERIFICADOR a protecao de literal de
      timestamp que ja existia para `recorded_at` -- protecao cujo proprio
      comentario explica que o PowerShell 7 converte string ISO 8601 em DateTime e
      que hashear o valor convertido faz um ledger valido parecer alterado. Os
      registros 1 a 3 nao carregam o campo novo; o primeiro que o carregou
      (sequencia 3, gravado hoje) quebrou a cadeia exatamente como o comentario
      previa para o campo antigo. A metrica por sessao, a definicao de sessao, o
      limiar de tres e a regra de nao expirar seguem TODAS validas e intocadas: o
      defeito era de serializacao, nao de conceito. Corrigido por generalizacao --
      todo campo que o parser converta em DateTime tem o literal recuperado do
      texto cru --, de modo que o proximo campo de data fique coberto sozinho.
      O `HANDOFF_LATEST.md` que aquele registro tambem ancora foi reescrito hoje,
      e o aviso de abertura que ele instalou -- "o limiar bate na proxima nota" --
      cumpriu sua funcao e foi substituido pelo estado posterior ao portao aberto.
  - registro: relatorio-handoff-20260830-teoria-dos-jogos-pmev-sota-v8-gold
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: >-
      Revisado e mantido valido. Aquele relatorio trata da fundamentacao em teoria
      dos jogos do PMev e ancora o handoff como ponteiro de estado corrente, nao
      como fonte da sua analise. Nenhuma afirmacao teorica dele depende do
      conteudo do handoff. A reescrita de hoje avanca o estado -- sete pares
      transcritos e o portao de calibracao aberto -- na direcao que aquele
      relatorio antecipava, sem contradizer nada do que ele estabeleceu sobre o
      formalismo.
  - registro: registro-2026-09-02-cultura-invariante-no-gerador-de-evidencia
    caminhos:
      - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
    parecer: >-
      Revisado e mantido integralmente valido. Aquele registro corrigiu a leitura
      de `recorded_at` com cultura invariante, e a funcao `Get-InstanteDoRegistro`
      que ele introduziu nao foi tocada: segue sendo o unico caminho de parse de
      data no gerador, e os cinco pontos de chamada continuam iguais. A alteracao
      de hoje acrescenta um bloco ANTES da contagem que aplica registros
      `correction` sobre os feedbacks alvo, e dois campos de declaracao na saida.
      Nada nela le ou escreve data. A armadilha de cultura que aquele registro
      fechou permanece fechada.
  - registro: agent-calibration-daily-2026-09-02
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
      - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
    parecer: >-
      Revisado, e ele precisa ser lido com data. Aquele relatorio diario mediu o
      estado das 13h de 2026-09-02: duas sessoes com feedback, portao fechado,
      `structural_gate_passed: false`. A medicao estava certa PARA AQUELE
      INSTANTE. Hoje a terceira sessao registrou feedback, o portao abriu
      (3 de 3), e uma correcao de escala foi anexada. O relatorio diario nao e
      reescrito -- ele e evidencia datada, e reescrever apagaria a trilha do dia
      em que o portao estava fechado. Quem o consultar depois de 2026-09-02 deve
      regerar a evidencia em vez de tomar aqueles numeros como atuais.
  - registro: handoff-2026-09-01-prioridade-pmev-continuacao
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido quanto ao que afirma. Aquele handoff ancora o
      ledger porque registrou o primeiro feedback da serie (nota 7.5, sessao
      `codex-site-2026-09-01-prioridade`). Esse registro NAO foi tocado: continua
      na sequencia 1, com o mesmo hash e a mesma nota, e a correcao de hoje aponta
      outro `event_id`. O ledger cresceu de 3 para 5 linhas; nenhuma linha
      existente mudou, o que e a propriedade append-only funcionando.
  - registro: registro-2026-08-29-governanca-piramidal-sota
    caminhos:
      - CLAUDE.md
    parecer: >-
      Revisado, e uma linha SUA foi emendada. Aquele registro estabeleceu a
      hierarquia de 8 Tiers e o invariante de commits com SHA, Assinatura e
      Proposito. A hierarquia, os Tiers e os tres campos do invariante seguem
      exatamente como ele os fixou. O que mudou foi o EXEMPLO do campo
      Assinatura: trazia `Chico v8.0 GOLD [Tier 1.B]`, isto e, o grupo ocupando o
      lugar do autor individual -- e duas linhas abaixo a mesma secao exige que
      cada agente seja distinguivel. Medido: oito registros em `reports/`
      seguiram o exemplo e estao assinados `chico` ou `chico@v8-gold`, sem
      linhagem. O exemplo passou a ser `Claude Opus 5 [Tier 1.B]`, alinhado a
      pratica dos doze commits mais recentes. E emenda de coerencia interna, nao
      de politica.
  - registro: registro-2026-09-01-ancora-de-merge-e-instrucao-indexada
    caminhos:
      - CLAUDE.md
    parecer: >-
      Revisado e mantido integralmente valido. Aquele registro trata da secao 1.2
      -- caminhos herdados num merge nao devem cobrar revisao de ancora -- e da
      instrucao indexada. Nenhuma das duas foi tocada: as emendas de hoje estao na
      secao 7 (exemplo de assinatura e o subitem novo sobre Chico como grupo) e na
      8.3 (correcao de escala). A regra de merge e a funcao
      `caminhos_herdados_de_merge()` continuam como ele as descreveu, e o guard em
      `tests/test_record_gate_merge.py` nao foi alterado.
  - registro: relatorio-2026-06-16-auditoria-e-harmonizacao-v8-gold
    caminhos:
      - CLAUDE.md
    parecer: >-
      Revisado e mantido valido. Aquele relatorio ancora o `CLAUDE.md` como objeto
      de harmonizacao geral do ecossistema, em junho, e nao faz afirmacao sobre a
      secao 7 nem sobre a 8.3 -- as duas unicas emendadas hoje. Nenhum numero,
      caminho ou conclusao dele depende do exemplo de assinatura ou do texto de
      calibracao. Sucede no tempo sem contradicao.
  - registro: relatorio-2026-08-29-analise-integral-ecossistema-sota-v8-gold
    caminhos:
      - CLAUDE.md
    parecer: >-
      Revisado e mantido valido. Analise integral do ecossistema; o `CLAUDE.md`
      entra nela como objeto de inventario e coerencia estrutural, nao como fonte
      dos dois trechos emendados. As emendas de hoje sao locais -- um exemplo na
      secao 7 e a prosa de escala na 8.3 -- e nao alteram a estrutura de secoes
      que aquela analise mapeou.
  - registro: relatorio-2026-08-29-impacto-quantitativo-qualitativo-sota-v8-gold
    caminhos:
      - CLAUDE.md
    parecer: >-
      Revisado e mantido valido. Relatorio de impacto quantitativo e qualitativo;
      nao mede nem cita o exemplo de assinatura da secao 7 nem a redacao da 8.3.
      As metricas que ele consolidou nao dependem de nenhum dos dois trechos, e
      nenhuma delas precisa ser recalculada.
  - registro: taxonomia-canonica-de-documentacao-e-relatorios
    caminhos:
      - CLAUDE.md
    parecer: >-
      Revisado e mantido valido -- e OBEDECIDO nesta mesma sessao. Aquele
      documento fixa a secao 9: `reports/` para registros empiricos datados,
      `docs/` para documentacao permanente, `data/` para catalogos. As emendas de
      hoje no `CLAUDE.md` estao nas secoes 7 e 8.3 e nao tocam a taxonomia. Mais:
      a taxonomia foi o criterio que MOVEU o handoff de saneamento de MCP de
      `reports/` para a raiz multiprojeto nesta sessao -- alteracao da camada MCP
      da raiz e auditoria de ambiente, e o lugar dela e `~/.gemini/RELATORIO_*.md`.
      A regra funcionou como discriminante, nao como formalidade.
  - registro: auditoria-2026-09-01-retrospectiva-prioridade-sessao
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. Aquela auditoria analisa a sessao
      `codex-site-2026-09-01-prioridade`, cuja nota 7.5 esta na sequencia 1 do
      ledger. Esse registro NAO foi tocado: mesmo hash, mesma nota, mesma posicao.
      A correcao de escala de hoje aponta outro `event_id`, e o ledger apenas
      cresceu. As observacoes qualitativas daquela auditoria -- latencia e desvio
      para trilhas perifericas -- seguem de pe e, alias, reaparecem no feedback
      da sessao de hoje sob outra forma.
  - registro: auditoria-2026-09-02-retrospectiva-e-observacao-de-calibracao
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado, e uma referencia numerica sua fica DESATUALIZADA. Aquela auditoria
      observou o ciclo de calibracao com o ledger em 3 linhas e a nota da sessao
      de integridade como `0.8`. O valor era o gravado, e a auditoria o reproduziu
      corretamente -- o defeito estava no ledger, nao nela. Hoje o Tier 0 informou
      que a nota foi 8, e a correcao anexada (sequencia 4) a torna 8 para toda a
      automacao. Quem reler aquela auditoria deve tomar o `0.8` como valor
      historico do registro errado, nao como avaliacao recebida. O restante da
      observacao de ciclo nao depende do numero.
  - registro: checkpoint-2026-06-14-infrastructure-hardening
    caminhos:
      - CLAUDE.md
    parecer: >-
      Revisado e mantido valido. Checkpoint de endurecimento de infraestrutura de
      junho; ancora o `CLAUDE.md` como referencia de politica de seguranca. As
      emendas de hoje sao no exemplo de assinatura da secao 7 e na prosa de escala
      da 8.3 -- nenhuma toca politica de seguranca, ACL, credencial ou hook. Nada
      naquele checkpoint precisa ser reavaliado.
  - registro: handoff-2026-08-29-governanca-8tiers-vulnerabilidades-subagents
    caminhos:
      - CLAUDE.md
    parecer: >-
      Revisado e mantido valido. Aquele handoff introduziu a governanca piramidal
      de 8 Tiers no `CLAUDE.md`. A hierarquia inteira permanece intacta: os Tiers,
      suas atribuicoes e o Tier 0 soberano nao foram tocados. O que mudou na mesma
      secao 7 foi o EXEMPLO do campo Assinatura, que usava o nome do grupo onde o
      invariante pede o autor individual. A emenda reforca aquele handoff em vez
      de contraria-lo: sem autor individual, a pirâmide de Tiers nao e auditavel.
  - registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
    caminhos:
      - CLAUDE.md
    parecer: >-
      Revisado e mantido valido, e REFORCADO. Aquele handoff mediu, em 2026-08-30,
      commits desta linhagem saindo com o e-mail do administrador e o GitHub os
      exibindo como autoria dele -- foi o incidente que produziu a regra de
      identidade de autoria. A emenda de hoje ataca a mesma classe de defeito no
      outro campo: o exemplo mandava assinar com o nome do GRUPO, e oito registros
      obedeceram. E a mesma licao aplicada ao campo `Assinatura` que aquele
      handoff aplicou ao e-mail. A trava de LFS que ele tambem trata nao foi
      tocada.
  - registro: handoff-2026-09-02-integridade-portao-no-teto-e-fila-para-o-sucessor
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: >-
      Revisado, e ele foi CUMPRIDO -- e por isso substituido. Aquele handoff
      deixou a fila para o sucessor com o portao de calibracao em 2 de 3 e o
      portao de 5 fases no teto. Esta sessao fechou as tres sessoes, abriu o
      portao estrutural e devolveu a margem do portao de qualidade para 1 de 2
      quando a arbitragem de color-contrast voltou a cobrir os alvos. Um handoff
      e ponteiro de estado corrente: cumprido, ele e sucedido, nao reescrito. O
      arquivo permanece como registro datado do que se sabia naquele momento.
  - registro: handoff-2026-08-30-resolucao-coderabbit-linters-e-malha-sota
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: >-
      Revisado e mantido valido. Aquele handoff trata da resolucao de apontamentos
      do CodeRabbit, de linters e da malha SOTA, e ancora o `HANDOFF_LATEST.md`
      como ponteiro de estado. Nenhuma das resolucoes que ele registra depende do
      conteudo do ponteiro, e nenhuma foi revertida nesta sessao. A reescrita de
      hoje apenas avanca o estado corrente.
  - registro: auditoria-2026-08-30-coderabbit-resolucao-e-integridade
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: >-
      Revisado e mantido valido. Auditoria de integridade da resolucao do
      CodeRabbit; o `HANDOFF_LATEST.md` entra como ponteiro de estado, nao como
      objeto auditado. As conclusoes de integridade daquela auditoria seguem de
      pe e nada nelas e tocado pela reescrita do ponteiro.
verificado:
  - a cadeia do ledger voltou a `valid` com 5 registros apos a correcao do verificador
  - a hipotese inicial (score inteiro quebrando o hash) foi TESTADA e REFUTADA antes de qualquer alteracao
  - o portao de calibracao abriu com 3 sessoes distintas, e o campo `structural_gate_passed` marcou verdadeiro
  - a correcao de escala e consumida pela automacao, nao so exibida -- `correcoes_aplicadas` marcou 1, e `score_min` saiu de 0.8 para 7.5
  - BOM UTF-8 unico preservado nos tres `.ps1` tocados, e CRLF preservado no gerador
  - backups datados dos dois scripts alterados em `~/.gemini/remediacao_backup_aplicado/`
nao_verificado:
  - "3 testes de tests/test_cwv_gate_truthfulness.py reprovam, e NAO por esta alteracao -- reproduzem identicos no HEAD limpo via git stash. Sao os tres `sem_cdp`, e ha CDP escutando em 127.0.0.1:9223. Hipotese de acoplamento com o ambiente NAO foi confirmada: confirmar exigiria derrubar o CDP do administrador, o que nao foi feito"
  - comportamento dos scripts sob Windows PowerShell 5.1 -- so o pwsh 7.6.5 foi exercitado nesta sessao
  - se outros consumidores do ledger fora de `scripts/ops/` precisam aplicar correcoes
  - suite Python e portao de 5 fases nao foram executados ate o momento deste registro
supersede: null
---

# Correção de escala no ledger, e o timestamp que quebrava a cadeia

## 1. A nota 8 gravada como 0.8

O Tier 0 informou a série completa das três notas — **7.5, 8, 9** — e o ledger
guardava `7.5`, **`0.8`** e `9.0`. A segunda entrou dividida por dez.

**A ironia é estrutural:** a §8.3 do `CLAUDE.md` proíbe conversão de escala e
citava justamente esse `0.8` como exemplo de nota *"gravada literal, sem
arredondamento e sem conversão de escala"*. A regra foi ilustrada com o produto
do defeito que ela proíbe. O valor errado propagou para a prosa da governança e
para a memória persistente do agente antes que alguém o notasse.

**Ledger é append-only: o registro não foi reescrito.** Criou-se
`Record-AgentCalibrationCorrection.ps1`, que anexa um registro `correction`
apontando o `event_id` do alvo, com valor anterior, valor correto, motivo e
autoridade — e que **recusa** correção cujo alvo não exista ou seja ambíguo,
porque correção que aponta para nada parece reparo e não repara.

**E a automação aplica.** `New-AgentCalibrationDailyEvidence.ps1` passou a
sobrepor as correções aos feedbacks alvo **antes de qualquer contagem**, e a
declarar `correcoes_no_ledger` e `correcoes_aplicadas` na saída. Sem isso a
correção seria decoração: o valor errado seguiria alimentando média, densidade e
hipótese. A prova de que é consumida: `score_min` saiu de `0.8` para `7.5`.

## 2. O timestamp que quebrava a cadeia

Ao gravar o feedback desta sessão, a verificação acusou `Hash mismatch at line 4`.

**Minha primeira hipótese estava errada, e o teste a derrubou** antes de virar
alteração: supus que um `score` inteiro (`9`) serializasse diferente de `9.0`.
Medido em pwsh — `9.0` atravessa o ciclo intacto, `Double`, mesma representação.

A causa estava no comentário do próprio verificador, que documenta que o
PowerShell 7 converte string ISO 8601 em `DateTime` e que hashear o valor
convertido faria um ledger íntegro reprovar. A proteção existia **só para
`recorded_at`**. O portão por sessão acrescentou `session_started_at` ao
escritor e não a estendeu. Os registros 1 a 3 não têm o campo; o meu é o
**primeiro** a carregá-lo.

Corrigido por **generalização**, não por segundo caso especial: toda propriedade
que o parser converta em `DateTime` tem seu literal recuperado do texto cru da
linha. Campo de data futuro fica coberto sozinho.

## 3. Chico é o grupo; a assinatura é individual

Emenda na §7, com medição: o exemplo do campo `Assinatura` trazia
`Chico v8.0 GOLD [Tier 1.B]` — o grupo ocupando o lugar do autor — enquanto duas
linhas abaixo a seção exige distinção individual. **Oito registros seguiram o
exemplo** e estão assinados `chico` ou `chico@v8-gold`, sem linhagem; os outros
59 discriminam. Os oito não se reescrevem: histórico publicado não retroage.

## 4. O que isto não autoriza

O portão de suficiência abriu — três sessões distintas, cadeia válida. **Isso não
é calibração.** Faltam duas confirmações independentes do mesmo padrão
operacional, e isso é obrigação do auditor, não medição do script. Até lá o
registro literal exigido permanece: **dados insuficientes — nenhuma calibração
planejada.**
