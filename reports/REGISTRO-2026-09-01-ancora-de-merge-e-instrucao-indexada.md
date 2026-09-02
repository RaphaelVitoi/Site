---
id: registro-2026-09-01-ancora-de-merge-e-instrucao-indexada
tipo: relatorio
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: 2026-09-01T23:05-03:00
atualizado_em: 2026-09-01T23:05-03:00
classes: [interno, medido]
config_medida:
  raiz: /home/user/Site
  branch: master
  so: Linux
  distribuicao: Ubuntu 24.04.4 LTS (container remoto, nao a maquina do operador)
  python_da_suite: '3.12.3'
  suite: 768 passed, 9 skipped, 1 failed
  testes_novos: 3
caminhos:
  - scripts/ops/record_gate.py
  - tests/test_record_gate_merge.py
  - CLAUDE.md
  - .claude/GOVERNANCA/GLOBAL_INSTRUCTIONS.md
verificado:
  - >-
    O guard foi quebrado de proposito antes de ser aceito. Com a correcao
    presente: 3 passed. Neutralizando `caminhos_herdados_de_merge` com um
    `return set()` no topo: 1 failed, 2 passed, e a falha e exatamente a
    assercao que separa herdado de resolvido. Restaurado: 3 passed.
  - >-
    A primeira redacao do proprio guard estava errada e o exercicio a expos:
    supunha que `herdado_do_nosso.txt` apareceria em `arquivos_em_stage()`. Nao
    aparece -- por ser identico a HEAD, o `git diff --cached` nunca o lista, e
    ele jamais cobrou ancora, com ou sem esta correcao. A assercao foi corrigida
    para fixar esse fato, e o comentario no teste registra o erro.
  - >-
    Fora de um merge, `caminhos_herdados_de_merge()` devolve conjunto vazio:
    sem MERGE_HEAD nao ha pai alternativo e nenhuma dispensa pode existir.
    Coberto por teste proprio.
  - >-
    Caminho ausente do indice nao entra em herdados: `_blob(":inexistente")`
    devolve None e o laco o ignora. Coberto por teste proprio.
  - >-
    Suite completa em 768 aprovados (tres a mais que antes, os novos guards),
    9 pulados, 1 falha preexistente e alheia a esta mudanca.
  - >-
    ruff check e ruff format --check limpos em scripts/ops/record_gate.py e
    tests/test_record_gate_merge.py.
  - >-
    .claude/GOVERNANCA/GLOBAL_INSTRUCTIONS.md permanece ASCII puro apos a
    insercao: `str.isascii()` devolve True, conforme a regra de Blindagem ASCII
    que o proprio documento declara.
nao_verificado:
  - >-
    O comportamento da correcao num merge com mais de dois pais (octopus). A
    implementacao itera sobre todos os pais listados em MERGE_HEAD e a logica
    vale para N, mas o teste exercita apenas o caso de dois.
  - >-
    Se ha outros pontos do record_gate.py que sofrem da mesma cegueira a merge.
    A correcao cobre a obrigacao de ancora, que era onde a falsa cobranca foi
    medida; as demais verificacoes continuam varrendo todo arquivo em stage, o
    que e conservador e nao produz falso bloqueio conhecido.
revisoes_de_ancora:
  - registro: taxonomia-canonica-de-documentacao-e-relatorios
    caminhos:
      - CLAUDE.md
      - scripts/ops/record_gate.py
    parecer: >-
      Os dois caminhos mudam de forma aditiva: CLAUDE.md com 53 insercoes e zero remocoes (subsecoes 1.1 e 1.2 novas), e record_gate.py com 56 insercoes e uma unica remocao, a linha `tocados = set(em_stage)`, trocada pela mesma expressao menos os herdados de merge. Nenhuma funcao preexistente e nenhuma secao preexistente foi alterada; a taxonomia que este documento fixa segue valida.
  - registro: checkpoint-2026-06-14-infrastructure-hardening
    caminhos:
      - CLAUDE.md
    parecer: >-
      O diff deste commit em CLAUDE.md e 53 insercoes e ZERO remocoes: acrescenta as subsecoes 1.1 e 1.2 e nao altera uma linha sequer de secao existente. O achado que este registro ancora esta em secao preexistente, intacta, e segue valido.
  - registro: handoff-2026-08-29-governanca-8tiers-vulnerabilidades-subagents
    caminhos:
      - CLAUDE.md
    parecer: >-
      O diff deste commit em CLAUDE.md e 53 insercoes e ZERO remocoes: acrescenta as subsecoes 1.1 e 1.2 e nao altera uma linha sequer de secao existente. O achado que este registro ancora esta em secao preexistente, intacta, e segue valido.
  - registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
    caminhos:
      - CLAUDE.md
    parecer: >-
      O diff deste commit em CLAUDE.md e 53 insercoes e ZERO remocoes: acrescenta as subsecoes 1.1 e 1.2 e nao altera uma linha sequer de secao existente. O achado que este registro ancora esta em secao preexistente, intacta, e segue valido.
  - registro: registro-2026-08-29-governanca-piramidal-sota
    caminhos:
      - CLAUDE.md
    parecer: >-
      O diff deste commit em CLAUDE.md e 53 insercoes e ZERO remocoes: acrescenta as subsecoes 1.1 e 1.2 e nao altera uma linha sequer de secao existente. O achado que este registro ancora esta em secao preexistente, intacta, e segue valido.
  - registro: relatorio-2026-06-16-auditoria-e-harmonizacao-v8-gold
    caminhos:
      - CLAUDE.md
    parecer: >-
      O diff deste commit em CLAUDE.md e 53 insercoes e ZERO remocoes: acrescenta as subsecoes 1.1 e 1.2 e nao altera uma linha sequer de secao existente. O achado que este registro ancora esta em secao preexistente, intacta, e segue valido.
  - registro: relatorio-2026-08-29-analise-integral-ecossistema-sota-v8-gold
    caminhos:
      - CLAUDE.md
    parecer: >-
      O diff deste commit em CLAUDE.md e 53 insercoes e ZERO remocoes: acrescenta as subsecoes 1.1 e 1.2 e nao altera uma linha sequer de secao existente. O achado que este registro ancora esta em secao preexistente, intacta, e segue valido.
  - registro: relatorio-2026-08-29-impacto-quantitativo-qualitativo-sota-v8-gold
    caminhos:
      - CLAUDE.md
    parecer: >-
      O diff deste commit em CLAUDE.md e 53 insercoes e ZERO remocoes: acrescenta as subsecoes 1.1 e 1.2 e nao altera uma linha sequer de secao existente. O achado que este registro ancora esta em secao preexistente, intacta, e segue valido.
  - registro: handoff-2026-08-29-quatro-pendencias-e-o-que-elas-eram
    caminhos:
      - scripts/ops/record_gate.py
    parecer: >-
      O diff deste commit em scripts/ops/record_gate.py e 56 insercoes e UMA remocao, e a linha removida e exatamente `tocados = set(em_stage)`, substituida pela mesma expressao menos os caminhos herdados de merge. Toda funcao preexistente ficou intacta -- o que entrou foi `_blob` e `caminhos_herdados_de_merge`, novas, e a subtracao so age quando MERGE_HEAD existe. O achado que este registro ancora nao e tocado.
  - registro: interludio-2026-08-28-concorrencia-e-isolamento
    caminhos:
      - scripts/ops/record_gate.py
    parecer: >-
      O diff deste commit em scripts/ops/record_gate.py e 56 insercoes e UMA remocao, e a linha removida e exatamente `tocados = set(em_stage)`, substituida pela mesma expressao menos os caminhos herdados de merge. Toda funcao preexistente ficou intacta -- o que entrou foi `_blob` e `caminhos_herdados_de_merge`, novas, e a subtracao so age quando MERGE_HEAD existe. O achado que este registro ancora nao e tocado.
  - registro: plano-2b-painel-de-estado
    caminhos:
      - scripts/ops/record_gate.py
    parecer: >-
      O diff deste commit em scripts/ops/record_gate.py e 56 insercoes e UMA remocao, e a linha removida e exatamente `tocados = set(em_stage)`, substituida pela mesma expressao menos os caminhos herdados de merge. Toda funcao preexistente ficou intacta -- o que entrou foi `_blob` e `caminhos_herdados_de_merge`, novas, e a subtracao so age quando MERGE_HEAD existe. O achado que este registro ancora nao e tocado.
  - registro: registro-2026-08-29-o-portao-le-o-indice
    caminhos:
      - scripts/ops/record_gate.py
    parecer: >-
      O achado deste registro e `texto_como_vai_ao_commit` -- o portao lia a arvore em vez do indice. Essa funcao nao e tocada: das 56 insercoes e 1 remocao deste commit, a unica linha removida e `tocados = set(em_stage)`, em outro ponto do arquivo. A leitura pelo indice permanece exatamente como aquele registro a fixou.
  - registro: registro-2026-09-01-resolucao-de-skill-e-referencia-por-ponto-de-partida
    caminhos:
      - scripts/ops/record_gate.py
    parecer: >-
      O achado deste registro e a resolucao de skill e de referencia por ponto de partida (checagem G6, referencia morta em documento que prescreve). Essa checagem continua varrendo TODO arquivo em stage: a subtracao introduzida aqui age apenas sobre `tocados`, o conjunto usado pela obrigacao de ancora, e apenas num merge.---

---

# Ancora num merge: a obrigacao e do que a resolucao decidiu

## A cegueira

`record_gate.py` coleta caminhos com `git diff --cached`, que compara o indice
com HEAD -- o **primeiro** pai. Num merge isso varre tambem tudo que veio do
outro lado, inclusive o que ja cumpriu sua obrigacao de ancora na branch de
origem.

Medido em 2026-09-01, no merge da fusao `.cerebro` -> `.claude`: **15 revisoes
de ancora recobradas** em 12 caminhos cujo resultado era byte a byte identico ao
lado remoto, onde a reconciliacao ja havia sido feita e registrada.

O custo nao e burocratico, e epistemico. Escrever parecer para mudanca que nao e
sua empurra para o parecer generico -- e parecer generico e pior que nenhum,
porque parece revisao sem ser. O portao existe para forcar leitura; recobrar o
que ja foi lido treina o operador a nao ler.

## A regra

Um caminho e **do merge** quando difere de **todos** os pais. E isso que a
resolucao de fato decidiu, e so isso e obrigacao de quem commita o merge.
Batendo com qualquer pai, foi herdado.

`caminhos_herdados_de_merge()` compara o hash do blob em stage com o de cada pai
(`HEAD` mais o conteudo de `MERGE_HEAD`) e subtrai os coincidentes do conjunto
`tocados`. Fora de um merge devolve vazio, e o portao nao muda em nada.

Aplicada ao caso que a originou, a regra separa corretamente: `cwv_gate.ps1` e
`agents/prompts.py` diferiam dos dois pais -- eu os havia editado na resolucao
-- e continuariam sendo cobrados. Os outros doze batiam com o lado remoto e
sairiam da conta.

## O guard, e o erro que ele pegou em mim

`tests/test_record_gate_merge.py` monta um repositorio real com merge em curso e
as tres classes de caminho, e foi **quebrado de proposito** antes de ser aceito:
neutralizar a correcao derruba exatamente a assercao que separa herdado de
resolvido.

O exercicio pegou um erro na primeira redacao do teste, nao no codigo. Eu supus
que o arquivo alterado so do nosso lado apareceria em `arquivos_em_stage()`.
Nao aparece: sendo identico a HEAD, o `git diff --cached` nunca o lista, e ele
jamais cobrou ancora -- nem antes, nem depois. A assercao agora fixa esse fato,
e o comentario no teste guarda o erro para quem vier.

## Instrucao indexada, em duas portas

Operador nenhum le todos os documentos. As portas de entrada sao tres, e cada
uma recebe o que lhe cabe:

| Porta | Quem entra por ela | O que recebeu |
| :--- | :--- | :--- |
| `CLAUDE.md` §1.1 e §1.2 | Claude Code, e todo agente que carrega a governanca canonica | a regra completa |
| `AGENTS.md` | Codex, Cursor e outros da convencao agents.md | nada -- ja e ponteiro para o `CLAUDE.md`, e a §7 proibe faze-lo crescer |
| `.claude/GOVERNANCA/GLOBAL_INSTRUCTIONS.md` | os 19 agentes em runtime, que recebem este arquivo no system prompt e nunca veem o `CLAUDE.md` | dois ponteiros, em ASCII puro |

Os ponteiros no `GLOBAL_INSTRUCTIONS.md` sao deliberadamente ponteiros. A §7 do
`CLAUDE.md` registra o preco de duas copias em paralelo: entre 2026-08-24 e
2026-08-26 o `AGENTS.md` existiu como fork e divergiu em tres pontos, dois deles
referencias mortas. Dois dias de coexistencia produziram duas mentiras.
