---
id: registro-2026-09-02-portao-de-calibracao-por-sessao
tipo: relatorio
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: 2026-09-02T06:20-03:00
atualizado_em: 2026-09-02T06:20-03:00
commit_inicio_auditoria: 6ab62bf33183d444da898710f1df0fc5bcd3fdfd
classes: [interno, medido, governanca]
caminhos:
  - CLAUDE.md
  - reports/agent-calibration/README.md
  - .claude/agent-memory/chico/HANDOFF_LATEST.md
  - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
  - scripts/ops/Register-AgentCalibrationFeedback.ps1
  - scripts/ops/Register-AgentCalibrationDailyTask.ps1
  - tests/test_calibracao_portao_por_sessao.py
config_medida:
  raiz: /home/user/Site
  branch: master
  so: Linux
  distribuicao: Ubuntu 24.04.4 LTS (container remoto, nao a maquina do operador)
  python_da_suite: '3.12.3'
  pwsh: 7.x
  suite_antes: 778 passed, 7 skipped, 0 failed
  suite_depois: 785 passed, 7 skipped, 0 failed
  estado_real_do_portao: 2 de 3 sessoes com feedback; falta 1
verificado:
  - >-
    Decisao do Tier 0, literal: a unidade de contagem do portao de suficiencia
    era o DIA e passou a ser a SESSAO. A metrica que autoriza avaliacao e o
    numero de SESSOES DISTINTAS com feedback, minimo tres. Tres feedbacks numa
    mesma sessao permanecem sendo DADO -- retidos e reportados como densidade
    -- mas nao abrem o portao sozinhos.
  - >-
    Definicao operativa de sessao, tambem do Tier 0: do inicio ao fim de um
    trabalho. Compactacao de contexto NAO encerra sessao, e sessao pode
    atravessar a meia-noite. Isso deixou de ser semantica e virou integridade
    do portao: sob contagem por sessao, uma sessao partida ao meio vira DUAS na
    contagem e abriria calibracao com evidencia de uma origem so.
  - >-
    A deteccao de sessao partida foi implementada e medida: cada feedback pode
    declarar `session_started_at`, e um mesmo session_id com mais de um valor
    declarado marca a sessao como inconsistente, que entao NAO conta para o
    limiar. Campo opcional, para nao invalidar os registros ja gravados.
  - >-
    A contagem e acumulativa e nao expira, conforme a instrucao "dados nao
    morrem por ausencia de sessao no dia". O universo e o ledger inteiro desde
    a ultima calibracao; o dia apenas seleciona quais sessoes tiveram atividade
    para o relatorio daquela corrida. Guard cobre tres sessoes espalhadas por
    tres dias diferentes: o portao abre.
  - >-
    Gatilho definido pelo Tier 0: aviso PROATIVO no instante em que o limiar e
    atingido, se nao houver tarefa em andamento; a corrida diaria das 23:59 e
    LASTRO de auditoria, nao gatilho, e grava a evidencia do dia inclusive
    quando insuficiente.
  - >-
    Sete guards herméticos em tests/test_calibracao_portao_por_sessao.py, todos
    verdes, cobrindo: tres sessoes abrem; uma sessao com tres feedbacks nao
    abre mas registra densidade; sessoes de dias diferentes acumulam; sessao
    que atravessa a meia-noite continua sendo uma; sessao partida nao conta;
    feedback sem session_id nao conta; dia sem sessao nao apaga evidencia.
  - >-
    Bug real encontrado e corrigido durante a construcao, achado pelo proprio
    guard: `$records = if (...) { ... }` desembrulha array vazio para $null em
    PowerShell, e sob StrictMode `.Count` em $null estoura. O caso "dia sem
    feedback" quebrava com "The property 'Count' cannot be found on this
    object". Corrigido com @() externo, com o motivo escrito no codigo.
  - >-
    Estado real medido apos a mudanca: DUAS sessoes com feedback
    (codex-site-2026-09-01-prioridade e
    claude-opus5-site-2026-09-02-integridade), falta UMA para o limiar. O
    registro literal exigido permanece "dados insuficientes -- nenhuma
    calibracao planejada".
  - >-
    Divergencia de texto resolvida por decisao do Tier 0 no mesmo dia: o
    CLAUDE.md SS8.3 e o README diziam "nota inteira de 0 a 10", enquanto o
    script sempre validou [decimal] e o ledger ja guardava 7.5 e 0.8 sem
    arredondamento. Era a PROSA que estava errada, nao o comportamento. Os dois
    textos foram alinhados ao medido: nota aceita decimal e e gravada literal,
    sem arredondamento e sem conversao de escala. Nenhuma linha de codigo
    precisou mudar, porque o codigo ja estava certo.
  - Suite completa em 785 aprovados, 7 pulados, zero falhas; ruff check limpo.
nao_verificado:
  - >-
    INFERENCIA MINHA, DECLARADA PARA PODER SER VETADA: contar as sessoes
    "desde a ultima calibracao registrada" nao foi pedido explicitamente. Sem
    algum criterio de reinicio, porem, o portao ficaria permanentemente aberto
    a partir da terceira sessao, o que contradiz a intencao de calibrar a cada
    tres. Implementei o reinicio por marco de calibracao e deixei o filtro
    isolado numa variavel para ser removido em uma linha. Nenhum registro de
    tipo `calibration` existe ainda no ledger, entao hoje o comportamento e
    identico ao de contagem absoluta.
  - >-
    Register-AgentCalibrationDailyTask.ps1 NAO foi registrado: Register-ScheduledTask
    exige Windows e nao existe neste host. Rodado em -WhatIf, ele descreve o
    plano e sai com status "NAO REGISTRADO", em vez de fingir agendamento. A
    tarefa das 23:59 portanto NAO esta ativa -- precisa ser registrada na
    maquina do operador.
  - >-
    Por ser TAREFA AGENDADA, esse script exige revalidacao em Windows
    PowerShell 5.1 real antes de release, conforme CLAUDE.md SS1.1. A bateria
    substituta cobre bytes, parse no 7 e construtos exclusivos do 7, mas nao
    alcanca cmdlet ou parametro inexistente na 5.1 -- e New-ScheduledTaskAction,
    New-ScheduledTaskTrigger e Register-ScheduledTask sao exatamente essa
    classe de risco.
  - >-
    O aviso proativo esta especificado na governanca como obrigacao do agente,
    e NAO como automacao verificavel. Nao ha guard que reprove um agente que
    deixe de avisar. E norma, nao mecanismo.
  - >-
    Os registros ja gravados no ledger nao tem `session_started_at`, entao a
    deteccao de sessao partida nao se aplica retroativamente a eles. A
    propriedade so vale para o que for gravado daqui em diante.
  - >-
    O aviso proativo depende de o agente perceber o limiar. Se a proxima sessao
    nao consultar New-AgentCalibrationDailyEvidence.ps1, ela pode fechar as tres
    sessoes sem que ninguem avise. O HANDOFF_LATEST abre com essa instrucao,
    mas instrucao lida por humano ou agente nao e garantia executavel.
revisoes_de_ancora:
  - registro: handoff-2026-09-01-prioridade-pmev-continuacao
    caminhos:
      - scripts/ops/Register-AgentCalibrationFeedback.ps1
    parecer: >-
      Aquele handoff ancora o script pelo registro decimal de feedback, testado e gravado sem arredondamento. A propriedade e preservada e nao foi tocada: a unica alteracao e a adicao do parametro opcional -SessionStartedAt, que acrescenta um campo ao registro quando informado e nao altera score, feedback, scope nem o encadeamento SHA-256. Registros sem o campo continuam validos e a cadeia foi verificada apos a mudanca.
  - registro: auditoria-2026-09-01-retrospectiva-prioridade-sessao
    caminhos:
      - scripts/ops/Register-AgentCalibrationFeedback.ps1
    parecer: >-
      Aquela retrospectiva ancora o script como o unico caminho de gravacao de feedback no ledger encadeado. Isso continua verdadeiro e fica reforcado: nenhuma via alternativa de escrita foi criada, o append segue append-only e hash-encadeado, e o novo campo e opcional. O que muda e a leitura do ledger, noutro script, nao a gravacao que ela ancorou.
  - registro: registro-2026-09-01-ancora-de-merge-e-instrucao-indexada
    caminhos:
      - CLAUDE.md
    parecer: >-
      Aquele registro ancora o CLAUDE.md pela SS1.2, que fixa a regra de ancora num merge -- caminho e do merge quando difere de todos os pais. A SS1.2 nao e tocada, nem o guard em tests/test_record_gate_merge.py. A alteracao vive inteiramente na SS8.3, sobre o portao de suficiencia de calibracao, que nao interage com resolucao de merge.
  - registro: registro-2026-08-29-governanca-piramidal-sota
    caminhos:
      - CLAUDE.md
    parecer: >-
      Aquele registro ancora a formalizacao da hierarquia de 8 Tiers e a identidade de cada um. Nenhum Tier e alterado, renomeado ou reordenado, e a soberania do Tier 0 e justamente o que autoriza esta mudanca: o limiar foi alterado por decisao explicita dele. A pirâmide segue intacta na SS7.
  - registro: handoff-2026-08-29-governanca-8tiers-vulnerabilidades-subagents
    caminhos:
      - CLAUDE.md
    parecer: >-
      Aquele handoff ancora o CLAUDE.md pela indexacao horizontal dos 8 Tiers e pelo resgate do subagente generalist no Tier 4. Nada disso e tocado: a SS7 permanece byte a byte, e a alteracao esta contida na SS8.3. A suite continua integralmente verde, agora em 785 aprovados.
  - registro: relatorio-2026-08-29-analise-integral-ecossistema-sota-v8-gold
    caminhos:
      - CLAUDE.md
    parecer: >-
      Aquele relatorio ancora o CLAUDE.md pela mesma formalizacao de Tiers e pelo saneamento de vulnerabilidades em submodulos. A governanca de Tiers nao muda, e a camada de dependencias da SS2 tampouco -- esta mudanca nao encosta em manifesto, lock ou piso de seguranca.
  - registro: relatorio-2026-08-29-impacto-quantitativo-qualitativo-sota-v8-gold
    caminhos:
      - CLAUDE.md
    parecer: >-
      Aquele relatorio ancora o CLAUDE.md pela medicao comparativa da sessao que formalizou os 8 Tiers e zerou vulnerabilidades. As duas medidas seguem validas e nenhuma e revisada aqui. A SS8.3 alterada nao participa de nenhuma das duas: ela trata de quando uma microcalibracao pode ser planejada.
  - registro: relatorio-2026-06-16-auditoria-e-harmonizacao-v8-gold
    caminhos:
      - CLAUDE.md
    parecer: >-
      Registro historico de consolidacao de infraestrutura em junho de 2026, anterior a existencia da SS8.3 e do ledger de calibracao. Nada do que ele consolidou e tocado por uma mudanca no portao de suficiencia; a ancora e mantida sem reinterpretacao do documento historico.
  - registro: checkpoint-2026-06-14-infrastructure-hardening
    caminhos:
      - CLAUDE.md
    parecer: >-
      Checkpoint historico de paridade de governanca v7.0.4-gold, tambem anterior a SS8.3. Nao ha sobreposicao entre o que ele fixou e o limiar de calibracao alterado agora, e o documento nao e reescrito para caber no presente.
  - registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
    caminhos:
      - CLAUDE.md
    parecer: >-
      Aquele handoff ancora o CLAUDE.md pela auditoria da malha agentica, pelas onze guardas quebradas de proposito antes de aceitas e pela trava de roteamento LFS da fase 5. A fase 5 nao e tocada. A pratica que ele estabeleceu foi seguida aqui: os sete guards novos foram exercitados contra o comportamento real, e um deles achou um defeito verdadeiro no script antes do aceite.
  - registro: handoff-2026-09-02-integridade-portao-no-teto-e-fila-para-o-sucessor
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: >-
      Aquele handoff, publicado horas antes nesta mesma sessao, ancora o HANDOFF_LATEST como ponteiro para o estado corrente. O ponteiro nao troca de destino: continua apontando para ele como handoff integral, e apenas ACRESCENTA o registro do portao por sessao, a retrospectiva do feedback 0.8 e o aviso de que o limiar bate na proxima nota. Nenhuma invariante que ele fixou e removida -- portao sem margem, aceite condicional do chromadb, piso como constraint, ancora que nao se inventa e numero de terceiro que nao vira proprio seguem todas na lista.
  - registro: auditoria-2026-08-30-coderabbit-resolucao-e-integridade
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: >-
      Aquela auditoria ancora este arquivo pela purificacao de mojibake e UTF-8 e pela conformidade de AST dos cabecalhos. As duas se mantem: o texto acrescentado e UTF-8 limpo, sem residuo de codificacao, com um unico H1 e hierarquia de titulos sequencial, incluindo a secao nova que entra como H2 e as suas subsecoes como H3.
  - registro: handoff-2026-08-30-resolucao-coderabbit-linters-e-malha-sota
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: >-
      Aquele handoff ancora este arquivo por reports/ ser a pasta canonica de handoff e este ser a memoria central do agente, mais o saneamento de markdownlint. Os dois seguem valendo: a atualizacao continua apontando para reports/ como fonte integral, e mantem a estrutura de listas e titulos que o saneamento deixou.
  - registro: relatorio-handoff-20260830-teoria-dos-jogos-pmev-sota-v8-gold
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: >-
      Aquele relatorio ancora este arquivo no contexto da trilha PMev. A direcao que ele fixou nao e desfeita e continua explicita na fila, agora como item 1 e ainda declarada como intocada. O unico item que passou a frente dela e o registro da tarefa agendada, que e operacional e de minutos, nao uma trilha concorrente.
  - registro: taxonomia-canonica-de-documentacao-e-relatorios
    caminhos:
      - CLAUDE.md
    parecer: >-
      Aquela taxonomia ancora o CLAUDE.md pela SS9, que separa reports/, docs/, .claude/agent-memory/ e data/. A SS9 nao muda, e este proprio documento a obedece: registro datado em reports/ com frontmatter completo, norma em CLAUDE.md, script em scripts/ops/ e guard em tests/.
---

# O portão de calibração passa a contar sessões

## O que mudou, e por decisão de quem

A regra anterior exigia **três feedbacks no mesmo dia, em duas ou mais
sessões**. O Tier 0 trocou a unidade:

> a métrica pra avaliação são ao menos 3 sessões com feedback/nota

Três feedbacks numa mesma sessão **também são dado** — ficam retidos e
reportados como densidade —, mas não abrem o portão sozinhos. Uma origem só não
é recorrência.

## A definição que virou integridade

Sessão vai do **início ao fim de um trabalho**, e **compactação de contexto não
a encerra**. Sob a regra antiga isso era semântica; sob contagem por sessão
virou risco direto:

> uma sessão partida ao meio vira **duas** na contagem, e abriria calibração com
> evidência de uma origem só.

Por isso cada feedback pode declarar `session_started_at`. Dois valores
distintos sob o mesmo `session_id` marcam a sessão como partida, e **ela não
conta** até a origem ser reconciliada. Campo opcional, para não invalidar o que
já está gravado.

## Dados não morrem

A contagem **acumula e não expira**. O universo é o ledger inteiro desde a
última calibração; o dia apenas seleciona quais sessões tiveram atividade
naquela corrida. Três sessões espalhadas por três dias diferentes abrem o
portão — há guard para exatamente isso.

## O gatilho

| Papel | Mecanismo |
| :--- | :--- |
| **Gatilho** | aviso proativo no instante em que o limiar bate, se não houver tarefa em andamento |
| **Lastro** | corrida diária às 23:59, que grava a evidência inclusive quando insuficiente |

O aviso pega o contexto quente; o agendamento garante trilha nos dias em que
nada abre.

## O guard achou um defeito de verdade

Escrevi o teste do caso "dia sem feedback" e ele reprovou com *"The property
'Count' cannot be found on this object"*. Não era o teste: `$x = if (...) { @() }`
**desembrulha array vazio para `$null`** em PowerShell, e sob `StrictMode` o
`.Count` estoura. O motivo ficou escrito no código, ao lado do `@()` que
corrige.

## Estado real, agora

Duas sessões com feedback — `codex-site-2026-09-01-prioridade` e
`claude-opus5-site-2026-09-02-integridade`. **Falta uma.** O registro literal
exigido continua sendo `dados insuficientes — nenhuma calibração planejada`.

E a tarefa das 23:59 **não está ativa**: `Register-ScheduledTask` exige Windows.
Rodado em `-WhatIf`, o script descreve o plano e sai com `NAO REGISTRADO`, em
vez de fingir que agendou.
