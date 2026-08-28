---
id: validacao-2026-08-28-arquitetura-de-memoria
tipo: relatorio
escopo: Site
ecossistema: gemini-antigravity
autor: claude@opus-5
criado_em: 2026-08-28T19:10-03:00
atualizado_em: 2026-08-29T00:20-03:00
commit: a86168df
classes: [interno, medido]
caminhos:
  - memory_rag.py
  - agents/context_builder.py
  - engine/cognitive.py
  - scripts/utils/ingest_rag.py
  - scripts/mcp_dynamic_server.py
  - llm/session.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data: 2026-08-28
  gpu: Radeon RX 570, 8 GiB, backend Vulkan
  ram_total_gb: 31.9
  ram_livre_gb: 9
  arvores_de_memoria_agentica: 3
  bancos_chroma: 4
  memory_md_divergentes: 19 de 19
verificado:
  - dependencias conferidas por importlib.util.find_spec, uma a uma
  - as tres arvores de memoria comparadas arquivo a arquivo com cmp
  - consumidores de cada arvore derivados da arvore por grep, com caminho e linha
  - hardware medido -- VRAM pelo log do proprio Ollama, RAM por Win32_OperatingSystem
  - adendo da secao 9 -- consumidores medidos por AST, separando uso interno ao
    arquivo de importacao externa, depois de a primeira passagem ter rotulado
    ContextBucket e SotaContextCacheEngine de orfaos sem serem
nao_verificado:
  - nenhuma chamada real a provedor de LLM; nenhum servico novo foi instalado
  - nao medi latencia de recuperacao de nenhuma camada; os numeros de latencia
    do documento original sao dele, nao medicao minha
  - nao li o conteudo das 57 MEMORY.md; comparei bytes e datas, nao semantica
  - nao avaliei se o corpus de 821 MB tem valor -- so que esta triplicado
  - nao verifiquei o estado de autenticacao dos conectores de nuvem (Drive,
    OneDrive, Dropbox); a sessao e nao-interativa e nao roda fluxo OAuth
  - nao medi latencia nem cota do gemma4:31b-cloud; medi que ele carrega sem
    ocupar VRAM, nao quanto ele aguenta
  - a QUALIDADE da recuperacao nao foi avaliada; provei que o indice devolve
    conteudo do projeto em vez de site-packages, nao que devolve o melhor trecho
  - os 3 documentos extras do chico e o memory.json do auditor ficaram VISIVEIS
    mas NAO foram absorvidos pela canonica -- a consolidacao so trata MEMORY.md
  - nao avaliei a QUALIDADE de notepad_memory.py nem de replay_buffer.py; medi
    que nada os importa e por que nao ha consumidor, nao se sao bons
  - nao procurei consumidores desses dois modulos fora deste repositorio
  - medi a QUALIDADE DO FRAGMENTO, nao a precisao da recuperacao. Nao ha
    conjunto de consultas com resposta esperada nesta base, entao nao ha como
    afirmar que o ranking melhorou -- so que o corpus deixou de ser picado
supersede: null
---

# VALIDAÇÃO — a engenharia de memória proposta, contra esta base

> **Veredito:** o documento é uma arquitetura de referência correta **para o
> problema que ele assume** — múltiplos agentes distribuídos, multi-tenant, com
> infraestrutura de serviços. Este repositório não é esse sistema, e a distância
> não é de maturidade: é de **premissa**. Das cinco tecnologias que ele torna
> centrais, **zero estão instaladas**. E há um bloqueador anterior a qualquer
> camada nova: a memória que já existe está **triplicada e divergente**.

## 1. O que o documento propõe e já está satisfeito

Esta parte valida sem ressalva, e é bom dizer primeiro:

| Diretriz do documento | Estado medido |
| :--- | :--- |
| *"Nunca use bibliotecas síncronas dentro das ferramentas"* | `aiohttp` já é o transporte de `llm/anthropic.py`, `llm/gemini.py`, `engine/llm_api.py`, `api/v1/server.py` e mais 4 módulos |
| *"Instancie um pool global de `ClientSession`"* | `llm/session.py::get_global_http_session` — já existe, exatamente esse padrão |
| *"Use `stdio` para agente local, `sse` para distribuído"* | `scripts/mcp_dynamic_server.py` já roda `stdio_server()` |

**Uma ressalva de contexto, porque parece contradição e não é:** acabei de trocar
`httpx` por `http.client` **síncrono** no leitor de VRAM. Aquilo é um caminho de
*render de CLI*, não corpo de ferramenta MCP — e a troca foi feita justamente
porque o cliente assíncrono, construído e destruído por quadro dentro do wrapper
`async` do comando, quebrava a captura de stdout. A regra do documento vale onde
ele a enuncia: **dentro de ferramenta que compartilha event loop com o servidor**.

## 2. FastMCP: é troca de SDK, não mudança de arquitetura

Medido: **`fastmcp` não está instalado; `mcp` está.** O servidor existente usa o
SDK oficial (`mcp.server.Server`), com `stdio`, mapeando `.cerebro/settings.local.json`
para rotas MCP.

O que o FastMCP acrescenta de real: decorador `@mcp.tool()` com validação Pydantic
derivada da assinatura, em vez de montar `types.Tool` à mão. É ergonomia legítima
— e é **uma dependência nova para reescrever um servidor que funciona**. Não é
pré-requisito de nada mais neste plano. Fica como refatoração opcional, com
prioridade abaixo de tudo que vem a seguir.

## 3. As premissas de infraestrutura, conferidas uma a uma

`importlib.util.find_spec`, medido em 2026-08-28:

| Camada no documento | Tecnologia | Instalada |
| :--- | :--- | :--- |
| L2 — estado e sessão | Redis | **não** |
| L3 — vetorial | PostgreSQL + `pgvector` | **não** (nem `psycopg`, nem `asyncpg`) |
| L3 — alternativa | Qdrant | **não** |
| L4 — grafo | Neo4j / FalkorDB | **não** |
| Blackboard | Redis Streams / Kafka | **não** |
| L3 — o que existe | **Chroma** | **sim** |
| Embeddings | `sentence_transformers` | **sim** |
| Transporte | `aiohttp`, `httpx`, `fastapi` | **sim** |
| Persistência | `sqlite3` | **sim** |

E o hardware onde isso rodaria: **Radeon RX 570 com 8 GiB (backend Vulkan),
31,9 GB de RAM com 9 GB livres**, desktop único, Windows. Subir Redis + Postgres
+ Neo4j ao lado do runtime de inferência disputaria justamente os 9 GB que
sobram — e o guard de RAM que o vértice quer automatizar existe porque essa
pressão já é real hoje, sem nenhum desses serviços.

**Isso não invalida o documento.** Invalida transplantá-lo. A camada L4 em grafo,
por exemplo, resolve *multi-hop reasoning* sobre ontologia — um problema que esta
base ainda não demonstrou ter, e cuja evidência seria consultas que o vetorial
erra por ambiguidade relacional. Essa evidência não foi medida.

## 4. O bloqueador: a memória já está multiplicada

Antes de somar L2, L3 e L4, medi o que existe. **Três árvores de memória
agêntica, quatro bancos Chroma, 821 MB:**

| Árvore | Tamanho | `MEMORY.md` | Quem consome |
| :--- | ---: | ---: | :--- |
| `.cerebro/agent-memory` | 21 MB | 19 | **escrita dos agentes** — `agents/context_builder.py:400,490`, `engine/cognitive.py:139,335` |
| `.claude/agent-memory` | **727 MB** | 19 | **leitura do RAG e do CLI** — `memory_rag.py:89` (default), `nexus.py:2328` |
| `.claude/AGENTS-MEMORY` | 73 MB | 19 | **nenhum consumidor de código** |

```
.cerebro/agent-memory/.chroma_db      20 KB
.claude/agent-memory/.chroma_db      329 MB   <- o que o RAG le
.claude/AGENTS-MEMORY/.chroma_db      39 MB
data/chroma_db                        20 KB   <- onde ingest_rag ESCREVE
```

Três fatos que saem daí, e cada um sozinho já pararia o plano:

**1. O laço agêntico está aberto.** Os agentes são instruídos, no próprio system
prompt, a gravar aprendizado em `.cerebro/agent-memory/<agente>/MEMORY.md`. O RAG
recupera de `.claude/agent-memory`. **O que o agente aprende não é o que o agente
recupera.** Comparei os 19 pares com `cmp`: **19 de 19 divergem**. O `chico` tem
2696 bytes de junho num lado e 2445 bytes de agosto no outro.

**2. A ingestão escreve num banco que ninguém lê.** `scripts/utils/ingest_rag.py`
persiste em `data/chroma_db`; `memory_rag.py` abre `.claude/agent-memory/.chroma_db`.
São 20 KB contra 329 MB — o destino da ingestão está praticamente vazio, e é isso
que se esperaria de um índice que nada consulta.

**3. Uma árvore inteira de 73 MB não tem consumidor** em código nenhum.

Isto é o padrão dominante desta base na camada de memória: **os mecanismos
existem, rodam, e não estão ligados uns aos outros.** Acrescentar Redis e Neo4j
sobre isso multiplicaria as fontes em vez de reduzi-las — e a regra que esta
sessão vem aplicando é a oposta: onde há duas fontes para o mesmo fato, **apagar
a segunda, nunca sincronizar**.

## 5. O que do documento vale aqui, hoje, sem instalar nada

A parte mais forte do documento é **independente de infraestrutura**. São
algoritmos, e todos cabem em Chroma + SQLite:

| Contribuição | Por que vale aqui |
| :--- | :--- |
| **Score composto** `α·Sim + β·e^(-λΔt) + γ·σ(hits) + δ·I(m)` | Hoje a recuperação é só similaridade. Recência e importância são as duas dimensões que faltam, e não exigem banco novo |
| **Alocação como mochila 0-1**, guloso por densidade `S/ℓ` | Resolve *diretamente* o orçamento de tokens, que é o gargalo real numa janela de 262k com modelo local |
| **Limite de 3–5 fragmentos, score > 0,78** | Um número, não um serviço. Evita *lost-in-the-middle* já |
| **Deduplicação no ingest, cosseno > 0,94** | Ataca o inchaço de 821 MB na origem |
| **Compressão em cascata** (micro-compactação → merge hierárquico → dedupe) | O merge hierárquico é o que permite sessão longa em modelo local |
| **Write-behind** | O `hot path` local é mais sensível a latência que um distribuído, não menos |
| **Namespaces com pré-filtragem** | Vale igual em Chroma, e é o que impede vazamento entre os 19 agentes |

O que **não** vale aqui e agora: Redis, Neo4j, pgvector, Qdrant, Kafka, S3/Iceberg,
OCC com `WATCH`/`MULTI`. Não porque estejam errados — porque resolvem
concorrência distribuída e volume que esta máquina não tem, ao custo dos 9 GB
que ela tem.

## 6. O mapeamento honesto L1–L4 sobre esta máquina

| Nível | O documento | Aqui, sem serviço novo |
| :--- | :--- | :--- |
| **L1** | RAM do processo / prompt cache | `core/sota_context_engine.py` — `CacheTier`, `ContextBucket`, teto de 4 GB **já declarado** |
| **L2** | Redis | **SQLite** (`database/queue_manager.py` já é o estado) + o buffer em memória |
| **L3** | pgvector / Qdrant | **Chroma**, uma instância só, depois da consolidação |
| **L4** | Neo4j | **adiado** — sem evidência medida de necessidade de multi-hop |

A partição Chroma/LanceDB que o vértice tinha engatilhado se encaixa aqui, com
uma correção medida: **`lancedb` não está instalado**, e dez pontos do código já
o nomeiam como se estivesse. Antes de instalar, a partição precisa ser
*declarada* — qual complexidade vai para qual motor, e por qual critério —
senão nasce um quinto banco sem consumidor.

## 7. Ordem recomendada

1. **Consolidar as três árvores numa só, e declarar qual é.** Sem isto, todo o
   resto constrói sobre fundação bifurcada. É também o que fecha o laço agêntico.
2. **Ligar a ingestão ao banco que o RAG lê** — hoje escreve num vazio.
3. **Score composto + limite de fragmentos + dedupe no ingest.** Três algoritmos,
   nenhuma dependência nova, e atacam o inchaço de 821 MB na origem.
4. **Guard tri-camada** (RAM + VRAM + cache) com tetos declarados — o medidor de
   VRAM passou a funcionar em `a86168df`, então agora ele pode existir.
5. **Alocação por mochila** no montador de contexto.
6. *Depois*, e só com evidência medida: LanceDB com partição declarada; grafo;
   FastMCP.

Os passos 1 a 3 não instalam nada e reduzem estado. Os passos 4 e 5 usam o que já
existe. Só o 6 acrescenta superfície — e ele é o único que depende de medição que
ainda não temos.

## 8. Declaração (governança §5)

Rodaram: dependências conferidas uma a uma por `find_spec`; as três árvores
comparadas com `cmp`, par a par, 19 de 19; consumidores derivados da árvore com
caminho e linha; hardware medido (VRAM pelo log do próprio Ollama, RAM por
`Win32_OperatingSystem`); tamanhos por `du`.

Não rodaram: nenhuma chamada real a provedor de LLM; nenhum serviço foi
instalado; **nenhuma medição de latência de recuperação** — os números de
latência do documento original são dele e não foram verificados aqui; não li o
conteúdo das 57 `MEMORY.md`, comparei bytes e datas, não semântica; não avaliei
se os 821 MB têm valor, apenas que estão triplicados.

---

## 9. Adendo — o inventário acima estava incompleto

> Escrito 55 minutos depois da seção 8, a pedido do vértice, que apontou material
> que eu não havia encontrado. **Ele tinha razão**, e a omissão muda uma
> conclusão: a camada L1 que a seção 6 dizia faltar já está escrita.

### 9.1 A pasta `memory/`, que eu não vi

`./memory/` — 2,1 MB no topo do repositório, e nada nela apareceu na varredura
original porque procurei por *árvores de memória agêntica*, não por *módulos de
memória*. Medido por grandeza errada de novo.

| Arquivo | O que é | Linhas | Quem importa |
| :--- | :--- | ---: | :--- |
| `memory/notepad_memory.py` | `MemoryBlock` + `NotepadMemory` — scratchpad com TTL, tags e lock | 192 | **ninguém** |
| `memory/replay_buffer.py` | `Transition` + replay priorizado (PER) sobre ring buffer numpy | 179 | **ninguém** |
| `memory/notepad_active.md` | estado vivo — mtime 2026-08-23 | — | — |
| `memory/notepad_state.json` | estado serializado — mtime 2026-08-17 | — | — |

Medido por AST, importação de módulo: **`memory`, `memory.notepad_memory` e
`memory.replay_buffer` têm zero importadores.** Os arquivos de estado têm mtime
recente, então algo os escreve — mas não é código que importe o módulo.

Isto é exatamente o **Working Memory (Scratchpad)** e a **Memória Episódica com
replay** que o documento propõe construir. **Estão construídos.** O que falta é
o mesmo que falta em todo o resto desta base: ninguém os chama.

### 9.2 Bucketing e cache: vivos, ao contrário

`core/sota_context_engine.py` — `ContextBucket` com `hash_signature`, expiração e
`touch()`; `SotaContextCacheEngine` com teto de 4096 MB; singleton `context_cache`
**importado por `core/subagents_mesh.py`**. Esta camada está ligada.

**Correção de método, e ela vale registrar:** minha primeira medição rotulou
`ContextBucket` e `SotaContextCacheEngine` de órfãos. Falso positivo — eu
excluíra usos no mesmo arquivo em que a classe é definida, que é o recorte certo
para *"quem mais consome?"* e o recorte errado para *"isto é órfão?"*. Duas
perguntas diferentes, uma medição só. Décima sexta vez nesta base que o nome de
uma grandeza não descreve a grandeza medida.

### 9.3 O que isso muda na ordem recomendada

A seção 7 dizia "score composto + limite + dedupe" no passo 3. Com o notepad e o
replay buffer já escritos, o passo mais barato passa a ser **ligá-los** — código
que existe, testado ou não, contra código que ainda seria escrito.

E muda o mapeamento da seção 6:

| Nível | Antes eu disse | Medido |
| :--- | :--- | :--- |
| **L1 — cache/bucket** | `sota_context_engine`, já declarado | correto, **e consumido** |
| **L1 — scratchpad** | não mencionei | `memory/notepad_memory.py`, **escrito e órfão** |
| **L2 — episódica/replay** | "SQLite" | `memory/replay_buffer.py` com PER, **escrito e órfão** |

### 9.4 Nuvem: L4 frio e computação sem VRAM

O vértice apontou dois recursos que a seção 3 tratou como ausentes, e são
distintos entre si:

**Computação em nuvem sem VRAM local.** `gemma4:31b-cloud` foi medido nesta
sessão: 32,7B em BF16, 262k de contexto, `thinking` e `tools`, **zero ocupação
de VRAM**. É um degrau de capacidade que não disputa os 8 GiB da RX 570. Isso é
real e verificado. O que **não** medi: latência e cota — sei que ele carrega sem
VRAM, não quanto ele aguenta.

**Armazenamento em nuvem como L4 frio.** Drive, OneDrive e Dropbox são
candidatos naturais para o arquivamento que o documento coloca em S3/Parquet, e
o alvo óbvio são os 821 MB triplicados. **Não verifiquei o estado de
autenticação desses conectores** — esta sessão é não-interativa e não executa
fluxo OAuth, então declaro como não medido em vez de assumir disponível.

A ordem não muda por isso: arquivar num L4 o que ainda está triplicado
arquivaria a triplicação. **Consolidar primeiro, arquivar depois.**

---

## 10. Adendo — os passos 1 e 2 executados, e o que eles acharam

> 2026-08-28, mesma janela. A secao 7 recomendava consolidar e depois
> reconstruir o indice. Os dois foram feitos, e o segundo revelou um defeito
> que a secao 4 nao tinha alcancado.

### 10.1 O id do fragmento nao era unico

`memory_rag._process_single_file` montava o id a partir de `source_name` — o
nome do diretorio para `MEMORY.md`, o *stem* para o resto. **Esse nome nao e
unico no corpus**: 504 arquivos alvo colapsavam em 426 nomes. 36 nomes em
colisao, **77 arquivos afetados**. `SPEC` ×4, `PRD` ×4, `dispatcher` ×4, e cada
um dos 19 agentes duas ou tres vezes.

E a escrita e `upsert`. O segundo arquivo de mesmo nome sobrescrevia os chunks
`0..N` do primeiro e **deixava orfaos os de indice maior**, ainda apontando para
outro arquivo. O indice nao perdia documentos: montava **documentos
Frankenstein**. Medido no indice real:

```
ids dispatcher_chunk_*  ->  34 chunks de .claude/agent-memory/dispatcher/MEMORY.md
                            24 chunks de .claude/AGENTS-MEMORY/dispatcher/MEMORY.md
                             1 chunk  de agents/dispatcher.py
```

Mesma classe da colisao de basename da auditoria mensal. E o detector foi o
mesmo nas duas vezes: **derivar a contagem** — 504 alvos contra 449 fontes.

Corrigido: o id passou a vir do caminho relativo a raiz, unico por construcao e
estavel se o repositorio mudar de lugar. `agent` continua sendo o nome amigavel,
que e o que a filtragem usa.

### 10.2 O indice, antes e depois

| | contaminado | com colisao | atual |
| :--- | ---: | ---: | ---: |
| embeddings | 241.480 | 13.373 | **14.227** |
| fontes distintas | 4.040 | 449 | **494** |
| `.venv` | 239.062 (99,0%) | 0 | **0** |
| prefixos de id misturando fontes | — | 36 | **0** |
| tamanho | 727 MB | 44 MB | **42 MB** |

Contabilidade fechada: **504 alvos, 494 indexados, 10 fora — todos com 0 bytes**
(nove `__init__.py` vazios e um `.ps1` vazio).

Nenhum indice foi apagado. `.chroma_db.contaminado-20260828` e
`.chroma_db.colisao-20260828` continuam em disco, reversiveis por `mv`.

### 10.3 O ignore escondia conteudo, nao lixo

`.cerebro/agent-memory/` era ignorada **inteira**, e o efeito era o oposto do
pretendido: escondia 23 `.md` de memoria agentica — o aprendizado que os proprios
prompts mandavam gravar ali — enquanto o motivo real do ignore eram dois
artefatos derivados: um render HTML de 20 MB e o banco Chroma.

Mesmo defeito que `memory_rag.ignore_dirs` ja corrigira uma vez com `reports`:
**nome solto casa demais**. A saida foi a mesma — excluir o artefato por forma,
nunca a subarvore por nome. 24 arquivos entraram no controle de versao, e quatro
deles eu nunca tinha visto:
`.cerebro/agent-memory/chico/AUDITORIA_VITOI_V4.md`,
`.cerebro/agent-memory/chico/SESSION_ANCHOR_20260316.md`,
`.cerebro/agent-memory/chico/VERIFICACAO_CRUZADA_LOG.md` e
`.cerebro/agent-memory/auditor/memory.json`.

**Pendencia declarada:** esses quatro estao visiveis mas **nao** foram absorvidos
pela canonica — `consolidar_memoria_agentica.py` so trata `MEMORY.md`.

### 10.4 Um risco que eu mesmo criei

Renomear `.chroma_db` para `.chroma_db.contaminado-20260828` fez o diretorio
deixar de casar com o padrao `.chroma_db/`: **771 MB de binario viraram nao
rastreados**, a um `git add -A` de entrar no historico para sempre. Peguei
olhando `git status` antes de estagiar, nao por previsao. O padrao agora e
`.chroma_db*/`, e o `.gitignore` registra o porque.

### 10.5 A prova de recuperacao

Consulta direta a colecao, sem passar por caminho de LLM:

| Pergunta | Primeiro resultado |
| :--- | :--- |
| *aprendizado do chico sobre handoff e linters* | `reports/PLANO-2B-CURADORIA-ESTRUTURAL.md` (0,275), depois `HANDOFF_LATEST.md` do proprio chico |
| *politica de roteamento por classe de tarefa* | `tests/test_routing_policy.py` (0,295), depois `.claude/MODUSOPERANDI/SYSTEM_ROUTING_MAP.md` |

Antes, as mesmas consultas competiam com 239 mil fragmentos de `pandas`, `torch`
e `sympy`. **A qualidade do ranking nao foi avaliada** — o que esta provado e que
o corpus recuperado e o do projeto.

---

## 11. Adendo — o passo 3 mudou de forma ao ser medido

> A seção 9.3 recomendava, como passo mais barato, **ligar** `notepad_memory` e
> `replay_buffer`: código já escrito contra código a escrever. Medido, a
> recomendação estava errada — e o motivo merece ficar travado, porque a próxima
> pessoa a encontrar 371 linhas completas sem importador vai concluir o mesmo
> que eu concluí.

### 11.1 `replay_buffer.py` não é memória: é treino por reforço

`SumTree`, `Transition(state, action, reward, next_state, done)`,
`sample()` devolvendo pesos de *importance sampling*, `update_priorities`
esperando erros de TD. É *Prioritized Experience Replay*.

Medido: a única ocorrência de `reward` no projeto é `math/rio_extended.py`, e lá
é `pot × equity` — valor esperado de pôquer, não recompensa de RL. **Não há
política, episódio nem erro de TD em lugar nenhum.**

Não é código órfão esperando fio. É peça de um sistema que nunca foi construído,
e ligá-la exigiria **inventar** o laço de aprendizado. Isso não é integração: é
começar um projeto novo achando que se está terminando um antigo.

### 11.2 `notepad_memory.py` seria a segunda fonte

A memória de trabalho em produção já existe: **`task.metadata`**, persistida em
SQLite, escrita por `queue_manager.update_task_metadata` com `BEGIN EXCLUSIVE` e
merge cirúrgico, consumida por `agents/execution.py`,
`agents/context_builder.py` e `llm/orchestrator.py`.

`NotepadMemory` faria o mesmo papel. Ligá-la criaria exatamente a duplicação que
esta sessão passou o dia desfazendo — e pela mesma regra: onde há duas fontes
para o mesmo fato, **apagar a segunda, nunca sincronizar**.

O que mudaria a decisão está declarado: estado que atravessa *tarefas*, e que
`task.metadata` não carrega por viver dentro de uma.

### 11.3 O sinal verde mais autorreferente da sessão

`memory/notepad_state.json` é a única evidência em disco de que o notepad roda.
Ele é a **saída de `test_notepad()`**, o smoke test do próprio módulo — os dois
blocos do arquivo são, literalmente, os dois que a função escreve.

E o conteúdo do bloco `PLAN_CURRENT` é:

> *"1. Memória Notepad e Replay Memory integradas. 2. Clustering de Agentes
> calibrado. 3. Sanitização de Entropia concluída."*

Medido por AST: **zero importadores**, para os dois. O único artefato que atesta
a integração é uma fixture de demonstração do módulo que se diz integrado.

### 11.4 O que foi entregue no lugar

| Artefato | Papel |
| :--- | :--- |
| `data/ESTADO_DA_MEMORIA_DE_TRABALHO.json` | declara os três módulos, quem consome, e **o que faria cada decisão mudar** |
| `tests/test_memoria_de_trabalho.py` | 5 testes que comparam a declaração com a árvore |

Nenhum teste impede ligar. Eles fazem a decisão **aparecer**: se um importador
surgir, o teste falha nominalmente pedindo que a declaração seja atualizada no
mesmo commit. Mutação com baseline: um importador sintético reprova o detector
pelo motivo certo.

Um dos cinco guarda a premissa em vez do fato — se aparecer sinal de RL de
verdade (`td_error`, `policy_gradient`, `epsilon_greedy`) fora de `memory/`, o
teste cai e obriga a reavaliar o `replay_buffer`. A decisão está amarrada à razão
que a sustenta, não à conclusão.

---

## 12. Adendo — o passo 4 achou algo abaixo do ranking

> A secao 5 recomendava score composto, limite de fragmentos e deduplicacao.
> Medindo antes de escrever, **boa parte ja existia** — e o que faltava estava
> uma camada abaixo.

### 12.1 O que ja existia

`_rank_documents` ja faz busca hibrida: `semantico × 0,6 + lexical × 0,4`, com
cobertura de query em vez de Jaccard para nao penalizar fragmento longo.
`_flatten_and_deduplicate_results` deduplica na consulta. O limite ja e 3, com
over-fetch de ×5. Do que o documento propunha, faltavam **recencia** e
**importancia** — e nenhuma das duas era o problema.

### 12.2 `CHUNK_SIZE = 1200` era um valor declarado que o mecanismo nao honrava

```python
if len(p) <= chunk_size:
    all_chunks.append(p)     # cada paragrafo curto virava um fragmento
```

O teto servia para **dividir**, nunca como alvo para **juntar**. E paragrafo
curto e a norma em codigo e em markdown.

| | fragmentado | atual |
| :--- | ---: | ---: |
| fragmentos | 14.227 | **4.239** |
| mediana | **162** | **1009** |
| p10 | 27 | 413 |
| abaixo de 50 chars | 22,2% | **0,3%** |
| acima do teto | ate 1404 | **0** |
| duplicata literal | 12,6% | **3,1%** |
| disco | 42 MB | **31 MB** |

**3.165 fragmentos de uma linha disputavam os tres lugares de todo resultado**, e
chegavam ao modelo sem contexto nenhum ao redor. Era isso que produzia os 12,6%
de texto repetido: `logger = logging.getLogger(__name__)` como fragmento proprio
40 vezes, cabecalhos de template 34 vezes.

Nao se conserta isso com ranking melhor — **o corpus e que estava picado**. Por
isso o score composto ficou para depois: ordenar fragmentos de uma linha ordena
ruido.

### 12.3 O teto passou a valer

`_chunk_long_paragraph` estourava ate 1404 num teto de 1200 — 17% — porque a
sobreposicao reentra no buffer antes da proxima conferencia. Como o modelo trunca
em ~256 tokens, o excesso **nao e desperdicio: e texto que entra no indice e o
embedding nao ve**. Em vez de perseguir a aritmetica do deslizamento, a
invariante passou a ser imposta na fronteira, onde pode ser garantida.

### 12.4 Um alarme falso do meu proprio instrumento

Minha primeira conferencia de integridade acusou perda de texto. Era o
instrumento: paragrafo dividido com sobreposicao nao aparece **contiguo** na
concatenacao dos fragmentos. Medindo na granularidade certa e **contra
baseline**, os dois chunkers perdem exatamente as mesmas 9 linhas de 2.877
(0,31%) — linha fisica partida numa fronteira de frase, comportamento de sempre.

Sem a baseline, 0,31% pareceria defeito novo. Foi a terceira vez nesta sessao que
comparar contra o estado ANTERIOR, e nao contra o ideal, separou regressao de
propriedade herdada.

### 12.5 O que NAO foi medido

Medi **qualidade de fragmento**, nao **precisao de recuperacao**. As distancias
subiram (0,275 para 0,355 na mesma consulta), o que e esperado: fragmento maior e
menos focado. Se isso e melhor ou pior para a resposta final, **nao sei** — nao
existe nesta base um conjunto de consultas com resposta esperada, e sem ele
qualquer afirmacao sobre ranking seria opiniao com numero ao lado.

O que esta provado: o corpus deixou de ser picado, e cada fragmento recuperado
agora carrega 600 a 800 caracteres de contexto em vez de uma linha solta.

**Score composto (recencia e importancia) continua pendente**, e agora faz
sentido: ha fragmentos de verdade para ordenar. Recencia exige um timestamp que o
metadado ainda nao carrega.

---

## 13. O passo 4, fechado — e o decaimento temporal foi REJEITADO com numero

### 13.1 Por que `mtime` nao serve como recencia aqui

Duas medicoes desqualificaram o `exp(-λΔt)` que eu ia acrescentar:

| | medido |
| :--- | ---: |
| idade maxima do corpus | **123 dias** |
| mediana | 7 dias |
| modificados nos ultimos 7 dias | 45,4% |
| acima de 365 dias | **0** |
| documentos que declaram `criado_em` | **18 (4%)** |

Um decaimento sobre uma janela de 123 dias, com metade do corpus abaixo de uma
semana, quase nao separa nada. E o defeito e mais fundo: **`mtime` e *quando
alguem salvou*, nao *quando o conteudo envelheceu***. Um `MODUS_OPERANDI.md`
reformatado ontem pareceria fresco; um handoff canonico de junho, obsoleto.

Seria um termo chamado "recencia" medindo "ultima gravacao" — **nome errado para
a grandeza real**, o padrao que este registro cataloga. O sinal honesto seria
`criado_em`, declarado em 4% dos documentos: esparso demais para pesar num
ranking.

### 13.2 O que entrou no lugar: obsolescencia DECLARADA

`.claude/AGENTS-MEMORY` ganhou um `SUPERSEDED.md` na consolidacao da secao 9, e
continuava contribuindo **89 fragmentos (2,1%)** que competiam com a canonica
pelos mesmos tres lugares. Nao e conteudo errado — e conteudo que ja esta na
canonica, duas vezes.

O mecanismo e **predicado estrutural, nao lista de caminhos**: um diretorio que
contem `SUPERSEDED.md` marcou a si mesmo, e o marcador viaja com a arvore. Lista
literal envelhece e exige que alguem lembre — foi assim que `reports` como nome
solto excluiu `docs/reports/` sem ninguem pedir.

### 13.3 As cinco geracoes do indice, medidas

| geracao | fragmentos | fontes | mediana | de arvore superada | duplicata |
| :--- | ---: | ---: | ---: | ---: | ---: |
| 1 contaminado | 241.480 | 4.040 | 157 | 62 | 14,7% |
| 2 colisao de id | 13.373 | 449 | 167 | 120 | 10,0% |
| 3 fragmentado | 14.227 | 494 | 162 | 373 | 12,6% |
| 4 com superada | 4.239 | 496 | 1009 | 89 | 3,1% |
| **5 atual** | **4.163** | **474** | **1009** | **0** | **2,0%** |

De 241.480 fragmentos para 4.163, com o mesmo corpus de projeto — e duplicata
literal de 14,7% para 2,0%.

### 13.4 Tres defeitos meus nesta etapa, e o terceiro e o mais instrutivo

1. **A exclusao nao excluia nada.** Comparava caminho relativo com absoluto. Nao
   levantou excecao; apareceu na contagem — 506 alvos com 23 que deviam ter
   saido.
2. **O teste passava vazio.** `not any(...)` sobre colecao vazia e verdadeiro.
   Faltava o controle positivo que prova que a descoberta achou alguma coisa.
3. **O `.resolve()` estava duplicado**, e por isso **nenhuma mutacao isolada era
   detectavel**: cada um cobria o outro. Removida a redundancia, as duas
   mutacoes reprovam. *Redundancia que teste nenhum distingue e redundancia que
   ninguem mantem.*

E uma falha do arnes: ele nao verificava se a mutacao **aplicava**. Persegui a
hipotese errada por tres rodadas por causa disso.

### 13.5 O que fica pendente, e por que nao e omissao

**Score composto com recencia e importancia continua fora** — nao por falta de
tempo, mas porque nenhuma das duas tem sinal confiavel neste corpus hoje. O que
mudaria isso esta declarado: um campo de data **declarado** em massa (hoje 4%),
ou um sinal de importancia gravado no momento da escrita. Ate la, acrescentar os
termos seria por dois numeros plausiveis num ranking sem saber o que eles medem.
