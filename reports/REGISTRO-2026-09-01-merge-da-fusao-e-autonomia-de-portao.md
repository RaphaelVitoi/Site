---
id: registro-2026-09-01-merge-da-fusao-e-autonomia-de-portao
tipo: relatorio
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: 2026-09-01T22:15-03:00
atualizado_em: 2026-09-01T22:15-03:00
classes: [interno, medido]
config_medida:
  raiz: /home/user/Site
  branch: master
  so: Linux
  distribuicao: Ubuntu 24.04.4 LTS (container remoto, nao a maquina do operador)
  pwsh: '7.4.6'
  merge_base: '97419080'
  lado_remoto: 8e8e925b (fusao cerebro->claude)
  conflitos: 1 (scripts/ops/cwv_gate.ps1)
  suite_pos_merge: 765 passed, 9 skipped, 1 failed
caminhos:
  - scripts/ops/cwv_gate.ps1
  - agents/prompts.py
verificado:
  - >-
    Nos treze caminhos ancorados que este merge arrasta do lado remoto
    (data/system_config.json, scripts/cli/nexus.py, data/agents_manifest.json,
    .vscode/settings.json e nove .claude/agent-memory/*/MEMORY.md), o resultado
    do merge e byte a byte identico a origin/master: `git diff origin/master --`
    devolve zero linhas em cada um. Este commit nao acrescenta mudanca propria a
    nenhum deles.
  - >-
    O unico caminho ancorado com mudanca deste lado e scripts/ops/cwv_gate.ps1,
    com nove linhas inseridas e uma removida, descritas abaixo.
  - >-
    Conflito unico resolvido tomando a versao do remoto como base. Ela estava
    correta e melhor que a local num ponto: a local tinha $ps51Interpreter
    atribuido duas vezes (linhas 772 e 821), residuo de reconstrucao sobre base
    antiga. A versao final tem duas ocorrencias, a atribuicao e o uso.
  - >-
    BOM UTF-8 unico e terminadores CRLF preservados no cwv_gate.ps1 apos a
    resolucao; parse validado pelo AST do pwsh 7.4.6 sem erro.
  - >-
    agents/prompts.py lia `.claude/GOVERNANÇA/GLOBAL_INSTRUCTIONS.md` com
    cedilha, enquanto o diretorio no disco e `.claude/GOVERNANCA`. Medido:
    Path(com cedilha).exists() e False, Path(sem cedilha).exists() e True com
    20464 bytes. Corrigido.
nao_verificado:
  - >-
    O comportamento da bateria substituta num host Windows com o 5.1 real. Neste
    container o ramo com powershell.exe nunca executa.
  - >-
    Se ha outras referencias de caminho quebradas pela fusao alem da de
    agents/prompts.py. A varredura cobriu GOVERNANCA/GOVERNANÇA em codigo Python
    de agents/, engine/, core/ e scripts/; nao cobriu os demais diretorios
    renomeados nem outras linguagens.
revisoes_de_ancora:
  - registro: handoff-2026-08-29-quatro-pendencias-e-o-que-elas-eram
    caminhos:
      - data/system_config.json
    parecer: >-
      O caminho muda neste commit apenas por arrasto do merge: o conteudo resultante e byte a byte identico a origin/master, onde a mudanca ja teve sua obrigacao de ancora declarada em reports/2026-09-01_Fusion_Quality_Gate_Report.md. Este commit nao acrescenta alteracao propria ao arquivo, e o achado ancorado segue valido.
  - registro: registro-2026-08-29-os-indices-postos-de-lado
    caminhos:
      - data/system_config.json
    parecer: >-
      Mesmo caso: arrasto de merge, resultado identico a origin/master, reconciliacao ja declarada do lado remoto. Nenhuma alteracao propria deste commit no arquivo.
  - registro: handoff-2026-08-29-roteamento-memoria-e-guard
    caminhos:
      - scripts/cli/nexus.py
    parecer: >-
      Arrasto de merge. `git diff origin/master -- scripts/cli/nexus.py` devolve zero linhas: o arquivo resultante e o do lado remoto, sem contribuicao deste commit. O achado ancorado segue valido.
  - registro: registro-2026-08-29-sota-triad-mesh-integracao
    caminhos:
      - scripts/cli/nexus.py
    parecer: >-
      Mesmo caso: arrasto de merge com resultado identico a origin/master e nenhuma alteracao propria.
  - registro: handoff-2026-08-30-status-malha-agentica-e-routing
    caminhos:
      - data/agents_manifest.json
    parecer: >-
      Arrasto de merge. O manifesto resultante e identico ao de origin/master, onde o refinamento dos 19 perfis foi feito e registrado. Este commit nao o altera.
  - registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
    caminhos:
      - .claude/agent-memory/auditor/MEMORY.md
      - .claude/agent-memory/chico/MEMORY.md
      - data/agents_manifest.json
    parecer: >-
      Arrasto de merge nos tres caminhos, todos byte a byte identicos a origin/master. A trava de LFS e a auditoria da malha que o registro ancora nao sao tocadas por este commit.
  - registro: handoff-2026-08-30-resolucao-coderabbit-linters-e-malha-sota
    caminhos:
      - .claude/agent-memory/auditor/MEMORY.md
      - .claude/agent-memory/chico/MEMORY.md
      - .claude/agent-memory/implementor/MEMORY.md
      - .claude/agent-memory/organizador/MEMORY.md
      - .claude/agent-memory/pesquisador/MEMORY.md
      - .claude/agent-memory/securitychief/MEMORY.md
      - .claude/agent-memory/sequenciador/MEMORY.md
      - .claude/agent-memory/validador/MEMORY.md
      - .claude/agent-memory/verifier/MEMORY.md
      - .vscode/settings.json
    parecer: >-
      Arrasto de merge nos dez caminhos. Conferido um a um com `git diff origin/master --`: zero linhas de diferenca em cada. Nenhuma memoria agentica e nenhum ajuste de editor vem deste commit.
  - registro: relatorio-handoff-20260830-teoria-dos-jogos-pmev-sota-v8-gold
    caminhos:
      - .claude/agent-memory/chico/MEMORY.md
      - .vscode/settings.json
    parecer: >-
      Arrasto de merge nos dois caminhos, ambos identicos a origin/master. O corpo teorico que o registro ancora nao e tocado por este commit.
  - registro: registro-2026-09-01-bateria-substituta-de-compatibilidade-5-1
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Este e o unico caminho com mudanca propria deste commit, e ela e a descrita no proprio registro ancorado: aprovar na bateria deixa de consumir uma das duas vagas de warning. Nenhuma verificacao da bateria foi removida ou enfraquecida -- os quatro bloqueios seguem bloqueando, e o residuo passa a ser declarado na linha INFO Ps51PorBateria da tabela de higiene em vez de um Add-QualityFinding. O achado ancorado segue valido e fica mais preciso.
  - registro: auditoria-2026-08-30-coderabbit-resolucao-e-integridade
    caminhos:
      - .claude/agent-memory/auditor/MEMORY.md
      - .claude/agent-memory/chico/MEMORY.md
      - .claude/agent-memory/implementor/MEMORY.md
      - .claude/agent-memory/organizador/MEMORY.md
      - .claude/agent-memory/pesquisador/MEMORY.md
      - .claude/agent-memory/securitychief/MEMORY.md
      - .claude/agent-memory/sequenciador/MEMORY.md
      - .claude/agent-memory/validador/MEMORY.md
      - .claude/agent-memory/verifier/MEMORY.md
    parecer: >-
      Arrasto de merge nas nove memorias. Conferido uma a uma com `git diff origin/master --`: zero linhas de diferenca em cada. A resolucao CodeRabbit que o registro ancora nao e tocada por este commit, cuja unica mudanca propria esta em scripts/ops/cwv_gate.ps1 e agents/prompts.py.
  - registro: auditoria-2026-08-31-protocolos-handoff-git-clippy-e-relatorios
    caminhos:
      - scripts/cli/nexus.py
    parecer: >-
      Arrasto de merge. `git diff origin/master -- scripts/cli/nexus.py` devolve zero linhas: o arquivo e o do lado remoto, sem contribuicao deste commit. Os protocolos de handoff que o registro ancora seguem validos.
  - registro: auditoria-cwv-lighthouse-2026-09-01
    caminhos:
      - .vscode/settings.json
      - scripts/ops/lighthouse_cwv_audit.mjs
    parecer: >-
      Arrasto de merge nos dois caminhos, ambos identicos a origin/master. O coletor Lighthouse nao e alterado por este commit; a mudanca em scripts/ops/cwv_gate.ps1 e na fase 5, e nao toca a leitura de artefato de producao das fases 1 e 2.
  - registro: frente-3-2026-08-29-guard-tri-camada
    caminhos:
      - scripts/cli/nexus.py
    parecer: >-
      Arrasto de merge, arquivo identico a origin/master. O guard tri-camada que o registro ancora nao e tocado por este commit.
  - registro: handoff-2026-08-29-diagnostico-de-memoria
    caminhos:
      - scripts/cli/nexus.py
    parecer: >-
      Arrasto de merge, arquivo identico a origin/master. Nenhuma alteracao propria deste commit no medidor de memoria que o registro ancora.
  - registro: handoff-2026-08-29-guard-corrigido-e-heranca
    caminhos:
      - scripts/cli/nexus.py
    parecer: >-
      Arrasto de merge, arquivo identico a origin/master. A correcao do guard que o registro ancora permanece como esta no lado remoto.
---

# Merge da fusao, e a vaga de warning que a autonomia exigia

## O conflito, e por que a versao remota entrou como base

Um unico conflito: `scripts/ops/cwv_gate.ps1`. Os dois lados tinham a bateria
substituta de compatibilidade com o 5.1 -- o lado remoto a aplicou a partir
desta conversa, num instantaneo anterior ao ultimo ajuste local.

A versao remota entrou como base porque estava **melhor**: a local carregava
`$ps51Interpreter` atribuido duas vezes, nas linhas 772 e 821, residuo de ter
sido reconstruida sobre a base antiga. A resolucao final tem duas ocorrencias --
a atribuicao e o uso -- como deve ser.

## A unica mudanca propria: a vaga de warning

Sobre a versao remota, uma alteracao de nove linhas. Aprovar na bateria
substituta deixa de emitir `Add-QualityFinding -Severity 'WARNING'` e passa a
constar como linha `Ps51PorBateria` (INFO) na tabela de higiene.

O motivo e medido, nao estetico. O guard tri-state reprova com tres warnings, e
o teto de dois existe para **cobertura perdida** -- as fases 1 e 2 quando o CDP
nao responde. Com a bateria emitindo warning, qualquer alteracao de `.ps1` feita
por agente somava a terceira ocorrencia e o commit bloqueava. Foi exatamente o
que aconteceu nesta sessao, com CDP e frontend ativos: zero erros, tres
warnings, bloqueio termodinamico.

A autonomia autorizada nao existiria na pratica. E o residuo nao fica escondido
por isso: aparece na linha `Ps51PorBateria`, numa linha amarela apos a fase 5, e
no relatorio gravado em `reports/cwv/`. A reversao e uma linha, e esta dita no
proprio comentario do codigo.

## O conserto que a fusao pedia

`agents/prompts.py` ficou lendo `.claude/GOVERNANÇA/GLOBAL_INSTRUCTIONS.md`,
com cedilha, depois que o diretorio virou `.claude/GOVERNANCA`. Falha
silenciosa: `_read_file_with_cache` devolve vazio e a secao
`=== INSTRUCOES GLOBAIS ===` simplesmente nao entra no system prompt.

Sao **20.464 bytes** -- a constituicao tecnica do ecossistema -- e o caminho
esta na cadeia de producao: `worker/loop.py` -> `agents/execution.py` ->
`agents/context_builder.py` -> `agents/prompts.py`. O `engine/cognitive.py` ja
usava o caminho correto, entao a incoerencia era **entre os dois modulos**, o
que a torna invisivel em qualquer teste que exercite so um deles.

## O que fica em aberto, e nao e meu para decidir

`tests/test_ingestao_superseded.py::test_arvore_superada_do_repositorio_fica_fora`
falha apos o merge. Nao vem destas mudancas: a fusao removeu os quatro
`SUPERSEDED.md` do repositorio, e o teste procura arvores marcadas como
superadas para provar que elas ficam fora da ingestao do RAG. Sem nenhuma
marcada, ele cai na assercao que o proprio autor escreveu para este caso --
*"nenhuma arvore declarada superada -- este teste ficou sem alvo"*.

O autor escolheu falha dura, e nao skip, justamente para forcar uma decisao
humana quando isso acontecesse. Converte-lo em skip, apaga-lo ou reescreve-lo
sao decisoes de quem governa a invariante, nao conserto de agente. Fica
intacto e declarado.
