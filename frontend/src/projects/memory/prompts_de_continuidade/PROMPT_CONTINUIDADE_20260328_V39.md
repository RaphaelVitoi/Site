---
name: Prompt de Continuidade V39 - 2026-03-28
description: Estado apos P5 Fases 2+3 e Tetralogia VITOI 3.2. task_executor.py em 1425 linhas (-58%). Proxima: Fase 3b (dispatcher/fallback/execution) e Fase 4 (web/worker/monitoring).
type: project
---

# Prompt de Continuidade V39 -- 2026-03-28

## Commits desta sessao

| Hash | Descricao |
|------|-----------|
| `b493ca0` | P5 fase 3 + Tetralogia VITOI 3.2: agents/autonomy.py, agents/prompts.py, 4 modos |
| `213706a` | P5 fase 2: LLM Core extraido (8 modulos, 948 linhas removidas) |
| `e87e928` | /psicologia-hs movida para /artigos/psicologia-hs |
| `2c43e52` | sitemap.ts: rotas aulas/* atualizadas |
| `07b272e` | Sync routing_patterns + COHERENCE_MANIFEST 18 agentes |
| `d4be063` | P5 fase 1: CLI extraido (14 arquivos) |

## Progresso da modularizacao P5

| Marco | Linhas | Delta |
|-------|--------|-------|
| Original | 3395 | -- |
| Apos Fase 1 (CLI) | 2630 | -765 |
| Apos Fase 2 (LLM Core) | 1682 | -948 |
| Apos Fase 3a (agents autonomy+prompts) | 1425 | -257 |
| **Meta final** | ~400 | restam ~1025 |

## Arquitetura atual dos modulos

```
task_executor.py (~1425 linhas -- orquestrador central)

cli/
  commands.py       -- todos os comandos CLI (db-*, health, autonomy, worker)

llm/
  budget.py         -- estado global: keys, circuit breakers, rate limiter, AsyncTokenBucket
  session.py        -- get_global_http_session, get_api_semaphore, _sync_fallback_request
  gemini.py         -- call_gemini()
  anthropic.py      -- call_anthropic()
  openrouter.py     -- call_openrouter()
  search.py         -- call_perplexity_search, call_tavily_search
  routing.py        -- _infer_provider, _reorder_models, _apply_health_gate
  providers.py      -- _try_provider()
  orchestrator.py   -- call_llm_api(), _compress_context()

agents/
  autonomy.py       -- get_autonomy_mode(), apply_god_mode() [Tetralogia VITOI 3.2]
  prompts.py        -- get_agent_system_prompt()

monitoring/
  telemetry.py      -- send_toast, write_economic_log

utils/
  text.py           -- enforce_pure_ascii
  cache.py          -- _read_file_with_cache (lru_cache)
  heuristics.py     -- _calculate_heuristic_score
```

## Tetralogia de Governanca VITOI 3.2 (NOVO)

Sistema de autonomia migrado de 3 modos (off/partial/full) para 4 modos:

| Modo | Escrita em disco | Comandos terminal | Semantica |
|------|-----------------|-------------------|-----------|
| `stop` | Bloqueada | Bloqueados | W0 -- Observador Passivo |
| `default` | Permitida | Bloqueados | Homeostase -- auto-fix apenas |
| `partial` | Permitida | state_changing bloqueados | Equilibrio Bayesiano |
| `full` | Permitida | Todos permitidos | Agencia Total |

### Uso via CLI
```powershell
.\do.ps1 -Autonomy stop     # W0
.\do.ps1 -Autonomy default  # homeostase
.\do.ps1 -Autonomy partial  # bayesiano
.\do.ps1 -Autonomy full     # agencia total
```

Legado: "off" e automaticamente mapeado para "stop" na leitura.
Modulos afetados: agents/autonomy.py (logica), cli/commands.py (validacao), do.ps1 (interface).

## Pendentes P5

### Fase 3b -- Agents Core restante (~520 linhas a extrair)

Funcoes ainda em task_executor.py que devem ir para agents/:

```
agents/dispatcher.py
  _parse_dispatcher_subtasks_strict()  -- parser rigoroso de JSON do dispatcher
  _retry_dispatcher_schema_once()      -- retry com schema enforcement

agents/fallback.py
  _create_dispatcher_fallback_plan()   -- plano de fallback quando dispatcher falha

agents/execution.py
  process_agent_task()                 -- orquestrador central de execucao de tarefas
  execute_task_workflow()              -- workflow completo (executa, materializa, handoff)
```

NOTA: process_agent_task e execute_task_workflow sao as funcoes mais complexas do sistema.
Dependencias pesadas em task_executor.py ainda (AGENTS_MANIFEST, HANDOFF_PIPELINE, etc.).
Usar lazy import `def _get_te(): import task_executor as te; return te` para globals.

### Fase 4 -- Web + Worker + Monitoring (~430 linhas)

```
web/handlers.py      -- handle_add_task, handle_get_status, handle_get_key_health_summary,
                        handle_get_task_result, handle_get_state, handle_set_state,
                        handle_ask_oracle
web/middleware.py    -- auth_middleware, cors_middleware
web/server.py        -- start_api_server()
worker/loop.py       -- start_worker()
worker/startup.py    -- start_worker_and_api()
monitoring/watchdog.py -- system_watchdog()
```

Meta: task_executor.py com ~400 linhas (imports + globals de estado + init)

## Estado do ecossistema de agentes

- 18 agentes no manifesto (agents_manifest.json)
- Routing patterns sincronizados (commit 07b272e)
- 18 perfis .claude/agents/*.md expandidos
- MEMORYs: historian, planner, verifier, dispatcher, bibliotecario reescritas

## Estado do site (frontend)

- Rotas sitemap corretas: /aulas/*, /artigos/psicologia-hs, /biblioteca/entendendo-o-icm-e-suas-heuristicas
- Motor ICM funcionando (Perspectiva/Esperanca/Expectativa implementados)

## Worktree residual (pendente limpeza)

`.claude/worktrees/agent-ad7cbace` -- worktree de agente que falhou por permissao.
Deletar: `git worktree remove --force .claude/worktrees/agent-ad7cbace`

## Principios da modularizacao (para proximas fases)

1. Extrair sem alterar logica
2. Circular imports: lazy import `def _get_te(): import task_executor as te; return te`
3. Validar syntax com ast.parse apos cada modulo
4. Estado mutavel (dicionarios) importado por referencia -- mutacoes funcionam, nao reassignar
5. Commitar por fase atomica
