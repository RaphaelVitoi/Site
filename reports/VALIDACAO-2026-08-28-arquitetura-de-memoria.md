---
id: validacao-2026-08-28-arquitetura-de-memoria
tipo: relatorio
escopo: Site
ecossistema: gemini-antigravity
autor: claude@opus-5
criado_em: 2026-08-28T19:10-03:00
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
nao_verificado:
  - nenhuma chamada real a provedor de LLM; nenhum servico novo foi instalado
  - nao medi latencia de recuperacao de nenhuma camada; os numeros de latencia
    do documento original sao dele, nao medicao minha
  - nao li o conteudo das 57 MEMORY.md; comparei bytes e datas, nao semantica
  - nao avaliei se o corpus de 821 MB tem valor -- so que esta triplicado
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
