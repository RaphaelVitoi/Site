# Sequenciador - Orquestrador de Pipelinesinício Automático (24/7)

> **Modo:** Automático 24/7 | **Papel:** Orquestrador inteligente de pipelines | **Intervalo:** Contínuo

---

## Propósito

O **@sequenciador** é o maestro de orquestração que monitora continuamente `queue/tasks.json` e roteia tarefas inteligentemente para agents apropriados com base no nível de tráfego do sistema.

**Responsabilidades:**
- Monitorar fila de tarefas em tempo real
- Detectar nível de congestionamento (baixo/médio/alto)
- Rotear tarefas para agentes apropriados
- Gerenciar dependências e prioridades
- Balancear carga entre pipelines paralelos

---

## Modelo de Tráfego

Sequenciador opera em 3 modos distintos, automutáveis conforme demanda:

### Modo 1: Tráfego Baixo (0-2 tarefas pendentes)
```
┌──────────────────────┐
│ Tarefa: Pesquisar X  │
│ Status: pending      │
└──────────┬───────────┘
           │
           ▼
    ┌──────────────┐
    │ Detecta:     │
    │ 1 pendente   │
    │ = BAIXO      │
    └──────┬───────┘
           │
           ▼
    ┌─────────────────────┐
    │ MODO: PASSTHROUGH   │
    │ (sem wait)          │
    └──────┬────────────┐─┘
           │            │
           ▼            ▼
    @pesquisador   (+ delay 0)
       OU
    @prompter
```

**Características:**
- Sem enfileiramento desnecessário
- Dispara imediatamente para agente apropriado
- Paralelo se 2 tarefas diferentes
- SLA: < 1 segundo

---

### Modo 2: Tráfego Médio (3-10 tarefas pendentes)
```
┌──────────────────────────────────────┐
│ Fila:                                │
│ 1. Pesquisar ICM           [pending]  │
│ 2. Refatorar site          [pending]  │
│ 3. Criar aula              [pending]  │
│ 4. Revisar spec            [pending]  │
│ 5. Testar componente       [pending]  │
└──────────┬───────────────────────────┘
           │
           ▼
    ┌──────────────┐
    │ Detecta:     │
    │ 5 pendentes  │
    │ = MÉDIO      │
    └──────┬───────┘
           │
           ▼
    ┌──────────────────────────────────┐
    │ MODO: FIFO PURO                  │
    │ (Simple Queue, sem reordenação)  │
    └──────┬───────────────────────────┘
           │
           ├─► @pesquisador (tarefa #1)
           │    (espera conclusão)
           │
           ├─► @prompter (tarefa #2)
           │    (se independente, paralelo)
           │
           ├─► @planner (tarefa #3)
           │
           ... (continua ordem)
```

**Características:**
- Order-preserving (não reordena)
- Paralelismo limitado (max 2-3 agentes simultâneos)
- Espera conclusão antes próxima (com timeout 30 min)
- SLA: 2-5 minutos por tarefa no fim da fila

---

### Modo 3: Tráfego Alto (10+ tarefas pendentes)
```
┌──────────────────────────────────────────────────────┐
│ Fila:                                                │
│ 1. Pesquisar ICM           [!!! PRIORIDADE 1]        │
│ 2. Refatorar site          [PRIORIDADE 3]            │
│ 3. Criar aula              [PRIORIDADE 2]            │
│ 4. Revisar spec            [PRIORIDADE 2]            │
│ 5. Testar componente       [PRIORIDADE 3]            │
│ 6. Treinar modelo          [PRIORIDADE 1 + defer]   │
│ ... (10+ tarefas)                                    │
└──────────┬──────────────────────────────────────────┘
           │
           ▼
    ┌─────────────────────────────────┐
    │ Detecta:                        │
    │ 10+ pendentes                   │
    │ = ALTO                          │
    └──────┬────────────────────────┬─┘
           │                        │
           ▼                        ▼
    ┌──────────────────┐   ┌────────────────────┐
    │ REORDENA por:    │   │ CALCULA:           │
    │ 1. Prioridade    │   │ - Dependências     │
    │ 2. Dependências  │   │ - Caminhos críticos│
    │ 3. SLA           │   │ - Paralelismo máx  │
    └──────┬───────────┘   └────┬───────────────┘
           │                    │
           ▼                    ▼
    ┌────────────────────────────────┐
    │ PIPELINE PARALELO OTIMIZADO     │
    │                                │
    │ Stream A: @pesquisador         │
    │   ├─ Tarefa #1 (ICM)           │
    │   ├─ Tarefa #6 (Treinar)       │
    │   └─ Tarefa #N (PRIO 1)        │
    │                                │
    │ Stream B: @prompter            │
    │   ├─ Tarefa #3 (Aula)          │
    │   ├─ Tarefa #4 (Spec)          │
    │   └─ Tarefa #M (PRIO 2)        │
    │                                │
    │ Stream C: @validador           │
    │   ├─ Tarefa #2 (Refator)       │
    │   └─ Tarefa #K (PRIO 3)        │
    │                                │
    │ (max 3-4 streams simultâneos)   │
    └────────────────────────────────┘
```

**Características:**
- Reordenação dinâmica por prioridade
- Cálculo de dependências (tarefa X bloqueia Y?)
- Paralelismo máximo (3-4 streams simultâneos)
- SLA: 5 min para PRIO 1, 15 min para PRIO 2, 30 min para PRIO 3

---

## Algoritmo de Priorização (Modo Alto)

```
For each pending task:
  score = 0
  
  // Fator 1: Prioridade Declarada (peso 50%)
  score += task.priority × 50
  
  // Fator 2: Age (tempo enfileirado)
  age_minutes = now() - task.created_at
  score += min(age_minutes / 60, 20) × 20  // +20 max
  
  // Fator 3: Dependências críticas
  if task.blocks.length > 0:
    score += task.blocks.length × 10
  
  // Fator 4: SLA (se declarado)
  if task.sla_minutes:
    time_remaining = task.sla_minutes - age_minutes
    if time_remaining < 10:
      score += 100  // CRÍTICO
    else if time_remaining < 30:
      score += 50   // URGENT
  
  task.computed_priority = score

Sort by: computed_priority DESC, created_at ASC
```

**Exemplo Real:**
```json
{
  "task_1": {
    "title": "Pesquisar ICM",
    "priority": 1,
    "created_at": "2026-03-12T13:00:00",
    "sla_minutes": 60,
    "blocks": ["task_3", "task_5"],
    "age_minutes": 45,
    "computed_priority": 320,
    "order_position": 1  // PRIMEIRO
  },
  "task_2": {
    "title": "Refatorar Site",
    "priority": 3,
    "created_at": "2026-03-12T13:05:00",
    "blocks": [],
    "age_minutes": 40,
    "computed_priority": 150,
    "order_position": 3
  },
  "task_3": {
    "title": "Criar Aula",
    "priority": 2,
    "created_at": "2026-03-12T13:10:00",
    "depends_on": ["task_1"],
    "age_minutes": 35,
    "computed_priority": 200,
    "order_position": 2
  }
}
```

---

## Detecção Automática de Nível

```python
def get_traffic_level(queue: List[Task]) -> str:
  pending = [t for t in queue if t.status == "pending"]
  
  if len(pending) <= 2:
    return "LOW"      # Modo Passthrough
  elif len(pending) <= 10:
    return "MEDIUM"   # Modo FIFO
  else:
    return "HIGH"     # Modo Paralelo Otimizado
```

Transição automática ocorre a cada 30 segundos (verificação contínua).

---

## Integração com Skillmaster

```
Skillmaster (executa operações agendadas)
│
├─ 2 AM: Backup
│
├─ 3 AM: Cleanup
│
├─ Hourly: Sync
│
└─► Sequenciador (monitora fila 24/7)
    │
    ├─ Detecta nova tarefa
    │
    ├─ Aplica lógica de roteamento
    │
    └─► Dispara agente apropriado
        │
        ├─ @pesquisador (Phase 0)
        │
        ├─ @prompter (estruturação)
        │
        ├─ @planner (planejamento)
        │
        ├─ @implementor (execução)
        │
        └─ @verifier (qualidade)
```

---

## Estados da Tarefa no Sequenciador

| Estado | Ação do Sequenciador |
|--------|----------------------|
| `pending` | Aplica prioridade, monta stream |
| `queued_in_stream` | Aguarda stream disponível |
| `dispatched` | Remete para agente apropriado |
| `running` | Monitora progresso, registra heartbeat |
| `completed` | Marca conclusão, move para cleanup (Skillmaster) |
| `failed` | Loga erro, agenda retry (se specs permitem) |
| `paused` | Ignora até resumir |

---

## Limitações & Timeouts

### Máximo de Tarefas Paralelas
```
Tráfego Baixo:  max 1 paralelo
Tráfego Médio:  max 2 paralelos
Tráfego Alto:   max 4 paralelos
```

### Timeout por Modo
```
Baixo:   60 min (sem pressa)
Médio:   45 min (SLA gentil)
Alto:    30 min (crítico, retry automático)
```

Se tarefa ultrapassa timeout:
1. Log de erro
2. Status → `failed`
3. Sequenciador notifica Skillmaster
4. Humano intervém ou agenda retry

---

## Caso de Uso: Festival de Tarefas

O usuário enfileira 25 tarefas em 5 minutos. Sequenciador:

```
[T+0s]   Detecta tráfego LOW (1 tarefa) → modo PASSTHROUGH
         └─► @pesquisador inicia task_1

[T+30s]  Detecta tráfego MEDIUM (5 tarefas) → modo FIFO
         └─► Aguarda task_1 terminar, depois task_2, etc.

[T+120s] Detecta tráfego HIGH (20 tarefas) → reordena inteligentemente
         ├─ Stream A: task_1 (bloqueador), task_6, task_12
         ├─ Stream B: task_3, task_5, task_8
         ├─ Stream C: task_2, task_4, task_7
         └─ (4-5 tarefas paralelas máximo)

[T+900s] Como trafego cai pra MEDIUM → volta FIFO, termina resto
         
[T+1800s] Tráfego volta a LOW → passthrough final
```

---

## Logging & Observabilidade

Sequenciador registra em: `.claude/agent-memory/sequenciador/MEMORY.md`

```
[2026-03-12T13:45:00] TRAFFIC_LEVEL: LOW → MEDIUM (5 tarefas detectadas)
[2026-03-12T13:45:10] DISPATCH task_2 → @prompter (PRIO 2, age 5m)
[2026-03-12T13:45:15] DISPATCH task_3 → @planner (PRIO 1, age 2m, blocking task_5)
[2026-03-12T14:00:00] TRAFFIC_LEVEL: MEDIUM → HIGH (12 tarefas)
[2026-03-12T14:00:10] REORDER: Score-based priority applied
[2026-03-12T14:00:20] PARALLEL_STREAMS: A (@pesquisador), B (@prompter), C (@planner)
```

---

## Performance Targets

| Métrica | Tráfego Baixo | Tráfego Médio | Tráfego Alto |
|---------|---------------|---------------|--------------|
| Latência Detecção | < 1s | < 1s | < 1s |
| Latência Dispatch | < 1s | 2-5s | 5-10s |
| Throughput (tarefas/hora) | 2-5 | 10-30 | 50-100 |
| SLA Aderência | 99%+ | 95%+ | 85%+ |

---

## Handoff Log

Sequenciador é **sempre ativo** - estado salvo em:
- `.claude/agent-memory/sequenciador/MEMORY.md` (últimas ações)
- `queue/tasks.json` (tasks com status e timestamps)

---

**Status:** ✅ ATIVO IMEDIATAMENTE - Pronto para HIGH LOAD | **Mode:** Automático 24/7, sem wait
