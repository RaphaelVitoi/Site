---
id: auditoria-2026-09-01-integridade-pos-fusao
tipo: relatorio
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: 2026-09-02T00:20-03:00
atualizado_em: 2026-09-02T00:20-03:00
classes: [interno, medido]
config_medida:
  raiz: /home/user/Site
  branch: master
  so: Linux
  distribuicao: Ubuntu 24.04.4 LTS (container remoto, nao a maquina do operador)
  python_da_suite: '3.12.3'
  suite_antes: 769 passed, 10 skipped, 0 failed
  suite_depois: 772 passed, 10 skipped, 0 failed
  prompt_auditor_antes: 100797 caracteres
  prompt_auditor_depois: 216330 caracteres
caminhos:
  - docs/document_manifest.json
  - engine/cognitive.py
  - tests/test_manifesto_de_documentos.py
  - .claude/DEPLOY/MANUAL_WORKFLOW_AGENTES.md
  - .claude/RELATORIOS/INVENTARIO_FERRAMENTAS.md
verificado:
  - >-
    Varredura de todas as referencias literais a `.claude/` ou `.cerebro/` em
    codigo Python fora de .venv, node_modules e vendor: 48 ocorrencias, das
    quais 26 nao resolviam. Triadas uma a uma; as falsas positivas sao mensagens
    de assercao, format string de log e diretorios criados em runtime.
  - >-
    O defeito central estava em docs/document_manifest.json, consumido por
    agents/prompts.py na cadeia de PRODUCAO (worker/loop.py ->
    agents/execution.py -> context_builder -> prompts.py): 14 dos 21 documentos
    declarados apontavam para `.cerebro/`, extinto pela fusao.
  - >-
    Efeito medido no artefato final, nao inferido: o system prompt real do
    @auditor tinha 100.797 caracteres e nao continha LIDERANCA E GOVERNANCA,
    MANIFESTO DE COERENCIA, ARQUITETURA DO CEREBRO HIBRIDO nem PROTOCOLO DE
    ROTEAMENTO HOLOGRAFICO. Depois da correcao e da limpeza de cache: 216.330
    caracteres, com os oito marcadores presentes. Diferenca de 115.533
    caracteres.
  - >-
    Causa de a fusao nao ter corrigido o manifesto: ela nunca o tocou. `git log`
    em docs/document_manifest.json mostra 3e1a6062 como ultimo commit, de outro
    assunto. Os caminhos `.cerebro/` sobreviveram porque ninguem passou por ali.
  - >-
    Causa de engine/cognitive.py continuar quebrado: a fusao o tocou pela
    metade. Trocou `.cerebro/` por `.claude/` mas apontou para nomes
    INTERMEDIARIOS que ela propria consolidou no mesmo commit -- `ESSENCIA
    MORAL/` e `MODUSOPERANDI/` viraram `GOVERNANCA/`. Algumas linhas receberam o
    destino final, outras o intermediario.
  - >-
    Achado colateral, e independente dos caminhos: utils/cache.py mantem cache
    EM DISCO (temp/nexus_zone/cache, TTL 3600 s) com chave `file:<caminho>`, sem
    mtime e sem hash de conteudo. Documento de governanca editado continua
    servindo a versao velha por ate uma hora. Medido: a correcao do manifesto
    nao teve efeito nenhum ate `rm temp/nexus_zone/cache/*.json`.
  - >-
    MANUAL_WORKFLOW_AGENTES.md (8.959 b) e INVENTARIO_FERRAMENTAS.md (1.143 b)
    foram restaurados de 433e6218 por decisao do vertice, conferidos byte a byte
    com cmp contra a origem.
  - Suite completa em 772 aprovados, 10 pulados, zero falhas; ruff check e format limpos.
nao_verificado:
  - >-
    project-context.md continua sem existir em lugar nenhum. Tinha QUATRO
    versoes divergentes antes da fusao (6.576 / 4.282 / 1.609 / 1.113 bytes),
    todas removidas, e nenhuma consta da estrutura nova. Os dois consumidores
    (engine/cognitive.py:162 e agents/context_builder.py:500) degradam para
    string vazia, entao nao quebram -- mas o contexto de projeto nao entra no
    prompt. Escolher entre as quatro versoes e decisao de conteudo do vertice,
    nao de agente.
  - >-
    O efeito da correcao do cache nao foi implementado nesta auditoria. O
    diagnostico esta medido, a correcao (incluir mtime na chave) nao foi
    aplicada: mexer em cache compartilhado tem superficie maior que o escopo de
    uma auditoria e merece decisao propria.
  - >-
    As demais subarvores removidas pela fusao (.claude/.ARQUIVE, e o que sobrou
    de RELATORIOS e AUDITORIA) nao foram auditadas quanto a consumidores
    apontando para elas. A varredura cobriu codigo Python; nao cobriu .mjs,
    .ps1, .json de configuracao nem markdown.
revisoes_de_ancora:
  - registro: validacao-2026-08-28-arquitetura-de-memoria
    caminhos:
      - engine/cognitive.py
    parecer: >-
      Aquele registro fixou a arquitetura de memoria agentica -- qual arvore e canonica e como a leitura chega ao agente. A leitura de memoria em `_read_memory_and_context` nao e tocada aqui: as quatro linhas alteradas estao na lista `docs_to_read` de contexto infra (COSMOVISAO, CEREBRO, ESTADO_ARTE, GLOBAL_INSTRUCTIONS), que apontavam para subpastas intermediarias que a fusao consolidou em GOVERNANCA/. A canonica `.claude/agent-memory` continua sendo a fonte, e a mudanca so faz documentos que ja deviam chegar voltarem a chegar.
  - registro: registro-2026-09-01-identidade-de-agente-na-arvore-canonica
    caminhos:
      - engine/cognitive.py
    parecer: >-
      Aquele registro fixou que a identidade do agente passa a ser lida de .claude/agents/, e essa linha nao e tocada aqui. As quatro linhas alteradas neste commit sao da lista `docs_to_read` de contexto infra -- COSMOVISAO, CEREBRO, ESTADO_ARTE e GLOBAL_INSTRUCTIONS -- que apontavam para subpastas intermediarias que a fusao consolidou. O achado ancorado segue valido e no mesmo arquivo.
---

# Auditoria de integridade pos-fusao

## O achado central: 103 KB de governanca fora do prompt

`docs/document_manifest.json` declara os documentos C-Level que
`agents/prompts.py` injeta no system prompt dos 19 agentes. **Catorze dos vinte
e um apontavam para `.cerebro/`**, arvore extinta pela fusao.

A leitura e deliberadamente tolerante -- `_resolve_safe_doc_path` devolve `None`
e o laco faz `continue`, sem excecao e sem log. Isso protege a pipeline de cair
por um documento ausente, e e a mesma tolerancia que torna a falha invisivel.

Medido no artefato final, que e o unico lugar onde isso aparece:

| | antes | depois |
| :--- | ---: | ---: |
| system prompt do `@auditor` | 100.797 caracteres | **216.330** |
| `LIDERANCA E GOVERNANCA` | ausente | presente |
| `MANIFESTO DE COERENCIA` | ausente | presente |
| `ARQUITETURA DO CEREBRO HIBRIDO` | ausente | presente |
| `PROTOCOLO DE ROTEAMENTO HOLOGRAFICO` | ausente | presente |

O `@auditor` era instanciado sem a matriz de lideranca que define a quem ele
responde, e sem o manifesto de coerencia que define como nao conflitar com os
outros. Nao havia sintoma: nenhum erro, nenhum warning, nenhum teste vermelho.

## Por que sobreviveu a fusao

Duas causas distintas, e nenhuma e descuido de execucao -- sao duas formas de a
mesma migracao ficar pela metade.

**O manifesto nunca foi tocado.** `git log` em `docs/document_manifest.json`
aponta `3e1a6062`, de outro assunto. A fusao moveu os arquivos e nao passou pelo
arquivo que decide quais arquivos o agente le.

**O `engine/cognitive.py` foi tocado pela metade.** A fusao trocou `.cerebro/`
por `.claude/` e apontou para nomes **intermediarios que ela propria consolidou
no mesmo commit**: `ESSENCIA MORAL/` e `MODUSOPERANDI/` viraram `GOVERNANCA/`.
Uma linha recebeu o destino final (`GOVERNANCA/LIDERANCA...`), a de cima recebeu
o intermediario (`ESSENCIA MORAL/COSMOVISAO.md`). O commit desfez o proprio
trabalho enquanto o fazia.

## O cache que escondeu a correcao

Corrigir o manifesto nao mudou nada -- o prompt continuou com 100.797
caracteres. A causa e independente e vale por si:

`utils/cache.py` mantem cache **em disco** (`temp/nexus_zone/cache`, TTL 3600 s)
com chave `file:<caminho>`. **Sem mtime, sem hash de conteudo.** Documento
editado continua servindo a versao velha por ate uma hora, em processo novo,
porque o Tier 2 le do disco.

Editar um documento de governanca e reiniciar o worker nao basta. So depois de
`rm temp/nexus_zone/cache/*.json` os 216.330 caracteres apareceram.

Isto **nao foi corrigido aqui** de proposito: cache compartilhado tem superficie
maior que o escopo de uma auditoria. O diagnostico esta medido; a correcao --
incluir `mtime` na chave, de modo que arquivo editado erre o cache
naturalmente -- merece decisao propria.

## O guard

`tests/test_manifesto_de_documentos.py` valida que todo caminho declarado
resolve, que o manifesto existe e nao esta vazio, e que `philosophical_docs` so
cita nomes presentes em `documents` -- este ultimo porque o filtro casa por
NOME, e nome que nao casa nao filtra nada, em silencio.

Nenhum teste pegou o defeito original porque nenhum media o manifesto: mediam o
codigo que le, e o codigo estava certo. **O dado e que tinha apodrecido.**

## O que fica aberto

`project-context.md` nao existe em lugar nenhum. Tinha quatro versoes
divergentes antes da fusao -- 6.576, 4.282, 1.609 e 1.113 bytes -- todas
removidas, nenhuma na estrutura nova. Os dois consumidores degradam para string
vazia, entao nada quebra, mas o contexto de projeto nao entra no prompt.
Escolher entre quatro versoes divergentes de um documento de contexto e decisao
de conteudo do vertice.
