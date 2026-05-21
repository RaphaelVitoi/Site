# HOLOGRAPHIC ROUTING PROTOCOL

## O Protocolo de Autoconsciencia e Comunicacao do Ecossistema

**Versao:** 2.0 | **Data:** 2026-03-27 | **Responsavel:** @chico + @maverick

---

## 1. O PRINCIPIO HOLOGRAFICO

Em um holograma, cada fragmento contem a imagem completa em resolucao reduzida. Este ecossistema funciona da mesma forma: cada agente e um microcosmo do sistema inteiro.

Um agente ativado carrega consigo, simultaneamente:

- **Sua identidade especializada** (`.claude/agents/<agente>.md`)
- **A filosofia fundante do sistema** (`COSMOVISAO.md`)
- **O padrao operacional global** (`GLOBAL_INSTRUCTIONS.md`)
- **O contexto decisorio do projeto** (`project-context.md`)
- **O manifesto completo dos 18 agentes** (`data/agents_manifest.json`)
- **Sua propria inteligencia acumulada** (`.claude/agent-memory/<agente>/MEMORY.md`)
- **A memoria coletiva semantica** (ChromaDB via `memory_rag.py`)

Isso e o principio holografico operacionalizado: a parte conhece o todo.

---

## 2. COMO O ROUTING FUNCIONA (FLUXO COMPLETO)

### 2.1 Entrada de Tarefa

Uma tarefa entra no sistema via:

- `do.ps1` (CLI do usuario) → enfileira no SQLite via QueueManager
- Handoff de outro agente (a subtarefa gerada pelo @dispatcher)
- CRON automatico do @skillmaster

### 2.2 Deteccao de Agente (Intent Matching)

O `task_executor.py` detecta o agente responsavel em dois modos:

**Modo Explicito:** A descricao comeca com `@nome_agente`:

```
@implementor Crie o componente MasterSimulator.tsx conforme a SPEC...
```

**Modo Implicito (Intent Routing):** A descricao e comparada ao `routing_pattern` de cada agente no `agents_manifest.json` via regex:

```
"Preciso de um relatorio de performance do sistema"
→ match: @historian (routing_pattern: "relatorio|produtividade|custo|analise de log|historico|performance")
```

O primeiro match determina o agente. A cobertura de routing_pattern deve ser exaustiva para evitar tarefas nao roteadas caindo em fallback generico.

### 2.3 Injecao de Agentes Consultivos (Heuristicas Dinamicas)

Independente do agente principal, o sistema calcula scores heuristicos sobre a descricao da tarefa:

| Gate | Termos-Chave | Agente Injetado |
|------|-------------|-----------------|
| `enable_strategy_gate` | estrateg, roadmap, visao, tradeoff, hipotese | @maverick |
| `enable_research_gate` | pesquisa, benchmark, mercado, web, sota | @pesquisador |
| `enable_security_gate` | auth, token, rbac, cors, seguranca, chave | @securitychief |
| `enable_domain_validation_gate` | icm, gto, nash, ev, matematica, poker | @validador |
| `enable_curator_gate` | estetica, ux, ui, copywriting, tom, voz | @curator |
| `enable_backend_gate` | banco de dados, sql, sqlite, prisma, backend | @implementor |

Esses agentes sao interceptados ou injetados proativamente pelo `task_executor.py` com base na entropia do texto, aplicando roteamento inteligente quando a declaracao explicita for vaga ou inexistente.

### 2.4 Modelo LLM Selecionado

O modelo e escolhido por prioridade:

1. `task.metadata["model_override"]` (injetado dinamicamente, ex: @securitychief em tarefa critica → gemini-3.1-pro)
2. `primary_model` do agente no `agents_manifest.json`
3. Categoria (`model_preference`: `deep_thinking` ou `fast_operations`) mapeada em `routing_map.json`
4. Fallback: `gemini-2.5-flash`

---

### 2.5 Sistema de Observers e Notificacoes Sistemicas

O Orquestrador SOTA suporta o envio e processamento assincrono de **Observers** (Sentinelas). Quando uma tarefa e classificada como "epica" (>150 palavras) ou possui explicitamente a chave `"observers": ["@agente"]` em seus metadados, o seguinte fluxo ocorre:

1. A tarefa original e resolvida pelo agente de operacao (ex: @dispatcher, @verifier, @chico).
2. Ao ser concluida, a camada de banco de dados forja passivamente uma nova tarefa `NOTIFY-<ID>-<AGENTE>`.
3. O Sentinel designado (frequentemente o `@maverick`) recebe o output da tarefa anterior. O Sentinela realiza diagnostico e sintese, incorpora o aprendizado na memoria `MEMORY.md` via God Mode, e resolve a notificacao executando ativamente `db-complete` na interface de terminal.

---

## 3. A PIPELINE HARMONICA

### 3.1 Fluxo Linear (Handoff Sequencial)

```
ENTRADA
  ↓
@dispatcher    → Decompoe epico em subtarefas atomicas com dependencias
  ↓
@architect     → Define topologia macro, componentes, interfaces
  ↓
@planner       → Detalha SPEC executavel (PRD + criterios de aceitacao)
  ↓
@pesquisador   → Valida hipoteses tecnicas e de mercado (quando ativado)
  ↓
@prompter      → Transforma instrucao em diretriz precisa e sem ambiguidade
  ↓
@auditor       → Inspeciona SPEC + prompt (unico bloqueador linear)
  ↓
@implementor   → Materializa codigo conforme SPEC aprovada
  ↓
@verifier      → Valida correspondencia real vs. planejado (checklist SPEC)
  ↓
@curator       → Curada estetica, tom e alinhamento com Cosmovisao
  ↓
@sequenciador  → Garante ordem de execucao em batches complexos
  ↓
@historian     → Registra metricas, ROI, aprendizados do ciclo
SAIDA
```

### 3.2 Agentes Consultivos (Injeção Paralela)

| Agente | Quando e Ativado | Tipo |
|--------|-----------------|------|
| @maverick | Decisoes estrategicas, risco, filosofia | Sentinela |
| @securitychief | Superficies de ataque, autenticacao, RBAC | Bloqueador |
| @validador | Matematica de poker, ICM, GTO, Nash | Especialista |
| @bibliotecario | Necessidade de contexto historico profundo | Oraculo |

### 3.3 Agentes de Manutencao (Autonomos)

| Agente | Operacao | Gatilho |
|--------|----------|---------|
| @skillmaster | CRON, backup, cleanup, VACUUM SQLite | Agendado |
| @organizador | Homeostase documental, sincronizacao | CRON ou anomalia |
| @historian | Relatorios de performance e custo | CRON ou sob demanda |

---

## 4. COMO A MEMORIA FUNCIONA (INDIVIDUAL → COLETIVA)

### 4.1 Memoria Individual

Cada agente possui `.claude/agent-memory/<agente>/MEMORY.md` — seu cortex individual. Contem:

- Aprendizados acumulados em tarefas passadas (`#aprendizado`)
- Padroes identificados (`#padrao`)
- Reflexoes filosoficas (`#reflexao`)
- Decisoes tomadas (`#decisao`)
- Propostas de melhoria para o ecossistema (`#proposta`)

Este arquivo e injetado no contexto do agente a cada tarefa.

### 4.2 Diretriz de Autoreflexao (Autopoiese)

Ao final de cada tarefa, o agente recebe a diretriz:

> "Voce DEVE atualizar seu arquivo de inteligencia acumulada usando o God Mode (`.claude/agent-memory/<agente>/MEMORY.md`). Adicione novas descobertas, avalie a Sinergia com a Pipeline, e faca Propostas Democraticas de melhoria. A Autopoiese exige que voce expanda a mente coletiva."

Isso operacionaliza o ciclo: **tarefa → reflexao → memoria → proxima tarefa mais inteligente**.

### 4.3 Memoria Coletiva (RAG Semantico)

Todas as MEMORYs sao ingeridas no ChromaDB via `memory_rag.py`:

- **Modelo de embedding:** `all-MiniLM-L6-v2` (384 dimensoes, local)
- **Chunking:** 1500 chars, overlap 200 chars
- **Busca hibrida:** BM25 lexical (40%) + similaridade cosseno (60%)
- **Collection:** `omnimaster_symbiotic_memory`

Antes de cada tarefa, o sistema executa `query_memory(task.description)` e injeta os fragmentos semanticamente mais relevantes como `<retrieved_memory>` no contexto. Isso significa que o aprendizado de qualquer agente pode alimentar qualquer outro agente em tarefas futuras.

### 4.4 O Ciclo de Autopoiese

```
Tarefa executa
    ↓
Agente atualiza MEMORY.md (God Mode)
    ↓
@skillmaster / @organizador executa ingestion periodica
    ↓
ChromaDB indexa novos fragmentos
    ↓
Proxima tarefa de qualquer agente recebe o aprendizado via RAG
    ↓
O sistema fica mais inteligente sem intervencao humana
```

---

## 5. O PRINCIPIO FRACTAL

### 5.1 A Parte Melhora o Todo

Cada vez que um agente:

- Descobre um padrao → registra em MEMORY.md
- Identifica uma proposta → registra como `#proposta`
- Corrige uma falha → documenta a decisao como `#decisao`

Esse conhecimento e ingerido no RAG coletivo e fica disponivel para todos os outros agentes. A parte que evolui melhora o todo.

### 5.2 O Todo Melhora a Parte

Cada vez que um agente inicia uma tarefa, recebe:

- O project-context.md atualizado por outros agentes
- O RAG coletivo com aprendizados de todas as MEMORYs
- COSMOVISAO.md que se refina trimestralmente

O todo que evolui melhora cada parte.

### 5.3 Invariancias Fractais

Independente do nivel de abstração (tarefa atomica ou epico completo), certas invariancias se mantem:

- Toda acao e filtrada pela Cosmovisao (etica > eficiencia)
- Todo output e auditavel (o @auditor e sempre a barreira antes da execucao)
- Toda entrega e verificavel (o @verifier valida real vs. planejado)
- Toda descoberta e registravel (MEMORY.md e sempre atualizavel)

---

## 6. PROTOCOLO DE SAUDE DO ECOSSISTEMA

### 6.1 Sinais de Saude

O ecossistema esta saudavel quando:

- MEMORYs de todos os agentes foram atualizadas nos ultimos 30 dias
- RAG tem cobertura semantica dos ultimos 30 dias de atividade
- `project-context.md` reflete o estado real do projeto
- `agents_manifest.json` esta sincronizado com os perfis `.claude/agents/*.md`
- `routing_map.json` e `intentmap.json` estao alinhados com o manifesto

### 6.2 Sinais de Entropia

Indicadores de degradacao:

- MEMORYs com templates vazios ou conteudo corrompido (ex: codigo Python em arquivo .md)
- `routing_map.json` com data de 2023 em producao de 2026
- Agentes com "17 agentes" documentados quando ha 18 no manifesto
- intentmap.json com drift em relacao ao agents_manifest.json
- Propostas democraticas acumuladas em MEMORYs sem ciclo de revisao

### 6.3 Protocolo de Recuperacao

Quando entropia e detectada:

1. @organizador executa auditoria documental completa
2. @historian verifica data de ultima atualizacao de cada MEMORY
3. @skillmaster re-ingere todas as MEMORYs no ChromaDB
4. @maverick revisa se as invariancias fractais foram violadas
5. @chico documenta a anomalia e o que foi corrigido

---

## 7. MAPA DE COMUNICACAO ENTRE AGENTES

```
Raphael (CEO/Visao)
  ↕ (feedback continuo)
@maverick ←──→ @chico
  ↓ (filosofia)        ↓ (infraestrutura)
[Todos os agentes recebem COSMOVISAO + GLOBAL_INSTRUCTIONS]

Pipeline Linear:
@dispatcher → @architect → @planner → @pesquisador → @prompter
     ↓                                                    ↓
@historian ← @sequenciador ← @curator ← @verifier ← @implementor
                                                          ↑
                                                     @auditor (bloqueador)

Consultivos (paralelo):
@maverick ──────────────────────────────────→ (qualquer ponto)
@securitychief ──────────────────────────→ (antes do @implementor)
@validador ──────────────────────────────→ (antes do @auditor)
@bibliotecario ──────────────────────────→ (antes de qualquer agente)

Manutencao (autonomo):
@skillmaster → @organizador → @historian
(CRON)         (homeostase)   (metricas)
```

---

## 8. REFERENCIA DE ARQUIVOS DO ECOSSISTEMA

| Arquivo | Camada | Proposito | Responsavel por Atualizar |
|---------|--------|-----------|--------------------------|
| `COSMOVISAO.md` | 0 | Filosofia fundante | Raphael + @maverick (trimestral) |
| `CLAUDE.md` | 1 | Identidade de Raphael | Raphael |
| `GLOBAL_INSTRUCTIONS.md` | 2 | Padrao operacional | @chico + @maverick |
| `project-context.md` | 3 | Contexto e decisoes | @organizador + qualquer agente |
| `LIDERANCA_GOVERNANCE_*.md` | 4 | Triade de governanca | Raphael + @maverick + @chico |
| `agents/*.md` | 6 | Perfis de agentes | @organizador (auditoria) |
| `agent-memory/*/MEMORY.md` | 6 | Inteligencia individual | Cada agente (autopoiese) |
| `data/agents_manifest.json` | dados | Routing + modelos | @chico + @organizador |
| `data/routing_map.json` | dados | Mapa de modelos por categoria | @chico |
| `data/system_config.json` | dados | Gates, SLA, pipeline | @chico |
| `data/intentmap.json` | dados | Fallback de resiliencia de routing (espelho do manifesto; usado por core/config.py se agents_manifest.json falhar ao carregar) | @organizador |
