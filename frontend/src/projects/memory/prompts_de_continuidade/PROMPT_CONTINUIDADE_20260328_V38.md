---
name: Prompt de Continuidade V38 - 2026-03-28
description: Estado apos P5 Fase 2: modularizacao LLM Core concluida, 8 novos modulos llm/, task_executor.py ~1800 linhas
type: project
---

# Prompt de Continuidade V38 -- 2026-03-28

## O que aconteceu nesta sessao (V38)

Sessao continuou do V37. Tarefa principal: **P5 Fase 2 -- LLM Core**.

### Problema critico resolvido: estado duplicado

Antes da Fase 2, havia um bug silencioso:
- `llm/budget.py` tinha `KEY_BLOCKLIST = {}`, `GEMINI_MODEL_KEY_BLOCKLIST = {}`, etc.
- `task_executor.py` tambem tinha `KEY_BLOCKLIST = {}`, `GEMINI_MODEL_KEY_BLOCKLIST = {}`, etc.
- **Eram dois objetos distintos em memoria.** Circuit breakers so funcionavam no modulo que os modificava.
- A Fase 2 resolve isso: task_executor.py agora **importa** de llm/budget.py ao inves de redefinir.

---

## Arquitetura pos-Fase 2

### Hierarquia de dependencias (sem circular import)

```
task_executor.py (orquestrador central -- ~1800 linhas)
  IMPORTA DE:
  -> llm.budget      (estado global: keys, circuit breakers, rate limiter)
  -> llm.session     (HTTP session, semaphore, sync fallback)
  -> llm.gemini      (call_gemini)
  -> llm.anthropic   (call_anthropic)
  -> llm.openrouter  (call_openrouter)
  -> llm.search      (call_perplexity_search, call_tavily_search)
  -> llm.routing     (infer_provider, reorder_models, apply_health_gate, etc.)
  -> llm.providers   (_try_provider)
  -> llm.orchestrator (call_llm_api, _compress_context)
  -> utils.text      (enforce_pure_ascii)
  -> utils.cache     (_read_file_with_cache)
  -> utils.heuristics (_calculate_heuristic_score)
  -> cli.commands    (run_cli) [via __main__]

llm/orchestrator.py
  -> llm.budget, llm.session, llm.gemini, llm.openrouter
  -> llm.routing, llm.providers
  -> core.schemas (Task)
  -> database.queue_manager (QueueManager)
  [LAZY] -> task_executor: AGENT_ROUTING_MAP, DEEP_THINKING_MODELS,
             FAST_OPERATIONS_MODELS, AGENTS_MANIFEST, _agent_sla_value, _c

llm/providers.py
  -> llm.budget (todas as funcoes de circuit breaker)
  -> llm.gemini, llm.anthropic, llm.openrouter
  -> utils.text (enforce_pure_ascii)
  -> core.schemas (Task)
  -> database.queue_manager (QueueManager)
  [LAZY] -> task_executor: _c()

llm/routing.py
  -> llm.budget (_route_identifier, _is_route_blocked, etc.)
  -> database.queue_manager (QueueManager)
  -> core.schemas (Task)
  -> aiosqlite (direto)
  [LAZY] -> task_executor: _feature_enabled, _health_gate_value,
             OPENROUTER_ALTERNATIVE_MODELS

llm/gemini.py
  -> llm.session (get_api_semaphore, _sync_fallback_request)
  [sem circular import]

llm/anthropic.py, llm/openrouter.py
  -> llm.session (get_api_semaphore)
  [sem circular import]

llm/search.py
  -> utils.text (enforce_pure_ascii)
  [sem circular import]

llm/session.py
  -> stdlib + aiohttp
  [sem dependencias internas]

llm/budget.py
  -> database.queue_manager (QueueManager)
  -> stdlib
  [sem circular import]
```

### Padrao lazy import (circular import resolver)

Modulos que dependem de globals ainda em task_executor.py usam:
```python
def _get_te():
    import task_executor as te

    return te
```

Isso e seguro porque o import circular so ocorre em runtime (dentro de funcoes),
nao em module-level. O modulo task_executor ja esta completamente carregado
quando qualquer funcao LLM e chamada.

Globals acessados via lazy import:
- `_get_te()._c(agent)` -- coloracao de log
- `_get_te().AGENT_ROUTING_MAP` -- rota por agente
- `_get_te().DEEP_THINKING_MODELS` -- modelos de raciocinio profundo
- `_get_te().FAST_OPERATIONS_MODELS` -- modelos rapidos
- `_get_te().AGENTS_MANIFEST` -- manifest JSON dos agentes
- `_get_te()._agent_sla_value(...)` -- SLA por agente
- `_get_te()._feature_enabled(...)` -- feature flags
- `_get_te()._health_gate_value(...)` -- configuracao health gate
- `_get_te().OPENROUTER_ALTERNATIVE_MODELS` -- modelos alternativos

---

## Modulos criados na Fase 2

| Modulo | Conteudo principal | Linhas |
|--------|-------------------|--------|
| `llm/session.py` | get_global_http_session, get_api_semaphore, _sync_fallback_request | ~70 |
| `llm/gemini.py` | call_gemini() | ~60 |
| `llm/anthropic.py` | call_anthropic() | ~35 |
| `llm/openrouter.py` | call_openrouter() | ~35 |
| `llm/search.py` | call_perplexity_search, call_tavily_search | ~70 |
| `llm/routing.py` | _infer_provider_for_model, _reorder_models_for_economy, _inject_openrouter_alternatives, _get_model_recent_health, _apply_model_health_gate | ~130 |
| `llm/providers.py` | _try_provider() (logica completa de retry/circuit breaker) | ~160 |
| `llm/orchestrator.py` | call_llm_api(), _compress_context() | ~130 |

### O que ja existia (Fase 1, commit d4be063)

| Modulo | Conteudo |
|--------|----------|
| `cli/commands.py` | todos os comandos CLI (db-*, check-keys, health, worker) |
| `monitoring/telemetry.py` | send_toast, write_economic_log |
| `llm/budget.py` | estado global (keys, circuit breakers, rate limiter, AsyncTokenBucket) |
| `utils/text.py` | enforce_pure_ascii |
| `utils/cache.py` | _read_file_with_cache (lru_cache) |
| `utils/heuristics.py` | _calculate_heuristic_score |

---

## Estado de task_executor.py pos-Fase 2

- **Antes Fase 1:** 3395 linhas
- **Apos Fase 1 (V37):** 2630 linhas (-765)
- **Apos Fase 2 (V38):** ~1800 linhas (-830 adicionais, -1595 total, -47%)

O que PERMANECE em task_executor.py (nao foi extraido):
- Imports e setup de logging
- `PID_FILE`, `rag_engine`, `get_rag()`
- `load_json_config()`
- `AGENTS_MANIFEST`, `INTENT_MAP`, `AGENT_ROUTING_MAP`, `AGENT_COLOR_MAP`, `VALID_AGENTS`
- `ROUTING_MAP`, `SYSTEM_CONFIG`, `PRIORITY_WEIGHTS`, `MODEL_ROUTING`
- `DEFAULT_GEMINI_FAST_MODEL`, `DEEP_THINKING_MODELS`, `FAST_OPERATIONS_MODELS`
- `PROTECTED_AGENTS_FROM_CLEANUP`, `HANDOFF_PIPELINE`, `WORKFLOW_FLAGS`, etc.
- `OPENROUTER_ALTERNATIVE_MODELS`, `TECHNICAL_AGENTS`
- `DEFAULT_WORKFLOW_FLAGS`, `DEFAULT_AGENT_SLA`, `DEFAULT_MODEL_HEALTH_GATE`
- `_c()`, `_feature_enabled()`, `_heuristic_terms()`, `_agent_sla_value()`, `_health_gate_value()`
- `DispatcherSubtask` schema
- `get_agent_system_prompt()` (Fase 3 vai extrair para agents/prompts.py)
- `get_autonomy_mode()`, `apply_god_mode()` (Fase 3)
- Todo o codigo de agentes, dispatcher, web, worker (Fases 3 e 4)

---

## Pendentes remanescentes

### P5 - Fase 3 -- Agents Core (~520 linhas a extrair)

- `agents/prompts.py` -- get_agent_system_prompt() (linhas ~624-735 do original)
- `agents/autonomy.py` -- get_autonomy_mode(), apply_god_mode() (linhas ~1360-1498 do original)
- `agents/dispatcher.py` -- _parse_dispatcher_subtasks_strict(), _retry_dispatcher_schema_once()
- `agents/fallback.py` -- _create_dispatcher_fallback_plan()
- `agents/execution.py` -- process_agent_task(), execute_task_workflow()

### P5 - Fase 4 -- Web + Worker + Monitoring (~430 linhas)

- `web/handlers.py` -- handle_add_task(), handle_get_status(), etc.
- `web/middleware.py` -- auth_middleware(), cors_middleware()
- `web/server.py` -- start_api_server()
- `worker/loop.py` -- start_worker()
- `worker/startup.py` -- start_worker_and_api()
- `monitoring/watchdog.py` -- system_watchdog()

**Meta final:** task_executor.py com ~400 linhas (imports + globals de estado + inicializacao)

### Worktree residual

`.cerebro/worktrees/agent-ad7cbace` -- worktree de agente que falhou por permissao.
Pode ser deletada: `git worktree remove --force .cerebro/worktrees/agent-ad7cbace`

---

## Commits desta sessao (V38)

| Hash | Descricao |
|------|-----------|
| `b493ca0` | P5 fase 3 + Tetralogia VITOI 3.2: agents/autonomy.py, agents/prompts.py, 4 modos de governanca |
| `213706a` | modularizacao P5 fase 2: LLM Core extraido (8 modulos, 948 linhas removidas de task_executor.py) |

Commits anteriores (V37):
| `d4be063` | modularizacao P5 fase 1: CLI extraido, 14 arquivos novos |
| `e87e928` | /psicologia-hs movida para /artigos/psicologia-hs |
| `2c43e52` | sitemap.ts: rotas aulas/* atualizadas |
| `07b272e` | Sync routing_patterns: manifesto enriquecido, COHERENCE_MANIFEST 18 agentes |

---

## Contexto critico para proxima sessao

### Para Fase 3 (agents/): lazy import ainda necessario

get_agent_system_prompt() usa `_read_file_with_cache` (ja em utils.cache) e
`TECHNICAL_AGENTS` (ainda em task_executor). Ao extrair para agents/prompts.py,
usar lazy import para TECHNICAL_AGENTS e SYSTEM_PROMPT_CACHE.

apply_god_mode() usa funcoes de I/O do sistema operacional, QueueManager, e
get_autonomy_mode(). Ao extrair, importar QueueManager de database.queue_manager.

### Principio de toda a modularizacao

"Extrair sem alterar logica. Potencializar incrementalmente."
Cada fase: ler bloco -> criar modulo -> validar syntax -> remover do task_executor -> commit.
Circular imports: resolver sempre com lazy import `def _get_te(): import task_executor as te; return te`.
Ao final (Fase 4), task_executor.py sera puro orchestrador de inicializacao.
