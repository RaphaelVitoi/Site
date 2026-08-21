---
name: Prompt de Continuidade V37 - 2026-03-28
description: Estado completo apos sessao V37: routing sync, sitemap, psicologia-hs migrada, modularizacao P5 fase 1
type: project
---

# Prompt de Continuidade V37 -- 2026-03-28

## Commits desta sessao (4 commits)

| Hash | Descricao |
|------|-----------|
| `07b272e` | Sync routing_patterns: manifesto enriquecido, COHERENCE_MANIFEST 18 agentes |
| `2c43e52` | sitemap.ts: rotas aulas/* atualizadas, tools/simulador removido |
| `e87e928` | /psicologia-hs movida para /artigos/psicologia-hs, memory/ legado limpo |
| `d4be063` | modularizacao P5 fase 1: CLI extraido, 14 arquivos novos |

## Estado atual do ecossistema Python

### task_executor.py
- **Antes:** 3395 linhas | **Agora:** 2630 linhas (-765, -22.5%)
- Bloco `if __name__ == '__main__':` substituido por:
  ```python
  from cli.commands import run_cli

  run_cli(sys.argv)
  ```

### Modulos criados (todos com syntax OK validado)

| Modulo | Conteudo | Linhas |
|--------|----------|--------|
| `cli/__init__.py` | pacote | vazio |
| `cli/commands.py` | todos os comandos CLI (db-*, check-keys, gemini-health, worker) | ~700 |
| `llm/__init__.py` | pacote | vazio |
| `llm/budget.py` | key management, circuit breakers, rate limiter, pools Gemini/Anthropic/OpenRouter | ~280 |
| `monitoring/__init__.py` | pacote | vazio |
| `monitoring/telemetry.py` | send_toast, write_economic_log, _write_economic_log_sync | ~60 |
| `utils/__init__.py` | pacote | vazio |
| `utils/text.py` | enforce_pure_ascii | ~20 |
| `utils/cache.py` | _read_file_with_cache, _read_file_cached_internal (lru_cache) | ~35 |
| `utils/heuristics.py` | _calculate_heuristic_score | ~12 |
| `agents/__init__.py` | pacote (fases futuras) | vazio |
| `web/__init__.py` | pacote (fases futuras) | vazio |
| `worker/__init__.py` | pacote (fases futuras) | vazio |

### Potencializacao incluida
- `cli/commands.py`: novo comando `health` -- executa health check paralelo retornando JSON com:
  - task_counts, hibernation_until, autonomy_mode, budget (used/total), api_keys count por provider

### Arquitetura de dependencias (sem circular import)
```
cli/commands.py
  -> llm.budget (GEMINI_ALL_KEYS, ROUTE_FAILURE_THRESHOLD, _route_identifier, _key_fingerprint)
  -> database.queue_manager (QueueManager)
  -> core.schemas (Task)
  -> core.arbitrator (UniversalArbitrator)
  -> task_executor (lazy import dentro de run_cli() para call_gemini, call_anthropic, apply_god_mode, get_rag, send_toast, start_worker_and_api)

monitoring/telemetry.py
  -> core.schemas (Task)
  -> asyncio, logging, pathlib, datetime (stdlib)

utils/text.py -> unicodedata (stdlib)
utils/cache.py -> logging, functools, pathlib (stdlib)
utils/heuristics.py -> re, typing (stdlib)

llm/budget.py
  -> database.queue_manager (QueueManager -- para _rank_keys_by_health)
  -> os, re, time, hashlib, asyncio, pathlib, datetime (stdlib)
```

### Modulos ainda a extrair (P5 fases futuras)

**Fase 2 -- LLM Core (remover ~450 linhas do task_executor.py):**
- `llm/gemini.py` -- call_gemini() (linhas ~823-874)
- `llm/anthropic.py` -- call_anthropic() (linhas ~879-906)
- `llm/openrouter.py` -- call_openrouter() (linhas ~908-936)
- `llm/search.py` -- call_perplexity_search(), call_tavily_search() (linhas ~938-1002)
- `llm/session.py` -- get_global_http_session(), _sync_fallback_request() (linhas ~550-622, 798-821)
- `llm/routing.py` -- _infer_provider_for_model(), _reorder_models_for_economy(), _apply_model_health_gate() (linhas ~1004-1127)
- `llm/providers.py` -- _try_provider() (linhas ~1138-1290)
- `llm/orchestrator.py` -- call_llm_api(), _compress_context() (linhas ~737-796, 1292-1357)

**Fase 3 -- Agents Core (remover ~520 linhas):**
- `agents/prompts.py` -- get_agent_system_prompt() (linhas ~624-735)
- `agents/autonomy.py` -- get_autonomy_mode(), apply_god_mode() (linhas ~1360-1498)
- `agents/dispatcher.py` -- _parse_dispatcher_subtasks_strict(), _retry_dispatcher_schema_once() (linhas ~1948-2051)
- `agents/fallback.py` -- _create_dispatcher_fallback_plan() (linhas ~2053-2189)
- `agents/execution.py` -- process_agent_task(), execute_task_workflow() (linhas ~1501-1720, 2191-2396)

**Fase 4 -- Web + Worker + Monitoring:**
- `web/handlers.py` -- handle_add_task(), handle_get_status(), etc. (linhas ~1774-1893)
- `web/middleware.py` -- auth_middleware(), cors_middleware() (linhas ~1894-1920)
- `web/server.py` -- start_api_server() (linhas ~1922-1946)
- `worker/loop.py` -- start_worker() (linhas ~2454-2602)
- `worker/startup.py` -- start_worker_and_api() (linhas ~2604-2626)
- `monitoring/watchdog.py` -- system_watchdog() (linhas ~2397-2450)

**Meta final:** task_executor.py com ~400 linhas (imports + globals de estado + inicializacao)

## Estado do ecossistema de agentes

### Routing sincronizado (commit 07b272e)
- agents_manifest.json: 12 agentes tiveram routing_pattern enriquecido com termos do intentmap.json
- intentmap.json: espelho exato do manifesto (fallback de resiliencia em core/config.py)
- Arquitetura: agents_manifest.json = fonte primaria, intentmap.json = fallback se manifest falhar
- COHERENCE_MANIFEST.md: 18 agentes (4 refs corrigidas, formula 8+4+2+3+1=18)

### Arquivos de agentes (.cerebro/agents/*.md)
- 18 perfis expandidos (de 12 linhas para 35-50 linhas cada)
- Novos: historian.md, planner.md, sequenciador.md
- Todos com secoes: Modo de Operacao, Padrao e Filosofia, Anti-Padroes, Entrega Esperada, Proposta Evolutiva

### MEMORYs de agentes (.cerebro/agent-memory/*/MEMORY.md)
- historian, planner, verifier, dispatcher, bibliotecario: reescritos com conteudo real
- sequenciador: corrigido (removida declaracao de auto-extincao; agente permanece ativo)

## Estado do site (frontend)

### Sitemap.ts (commit 2c43e52)
Rotas corretas:
- `/aulas/leitura-icm` (era /leitura-icm)
- `/aulas/icm-masterclass` (era /aula-icm)
- `/aulas/icm-pos-flop` (era /aula-1-2)
- `/aulas/conceitos-icm` (nova)
- `/biblioteca/entendendo-o-icm-e-suas-heuristicas` (era /tools/simulador deletado)
- `/artigos/psicologia-hs` (era /psicologia-hs)

### Psicologia HS (commit e87e928)
- Movida de `frontend/src/app/psicologia-hs/` para `frontend/src/app/artigos/psicologia-hs/`
- Detectada como rename pelo git (R)
- Referencias atualizadas: Header.tsx, PsychologyHub.tsx, page.tsx, sitemap.ts

## Pendentes remanescentes

### P5 - Modularizacao (continua)
- Fases 2, 3, 4 conforme tabela acima
- Cada fase deve: ler secoes do task_executor.py, criar modulo, validar syntax, commit
- Principio: extrair sem alterar logica; potencializar incrementalmente

### Worktree residual
- `.cerebro/worktrees/agent-ad7cbace` -- worktree do agente que falhou por permissao
- Pode ser deletada: `git worktree remove --force .cerebro/worktrees/agent-ad7cbace`

### memory/ raiz (reavaliacao)
- 39 arquivos restantes (todos com mod date Mar 23)
- Maioria e copia do auto-memory em C:\users\rapha\.cerebro\projects\...
- Nao e legivel pelo auto-memory system (caminho diferente)
- Decisao: avaliar se deve ser deletada completamente ou mantida como backup

## Contexto critico para proxima sessao

### Como cli/commands.py evita circular import
Funcoes ainda em task_executor.py (call_gemini, apply_god_mode, send_toast, start_worker_and_api)
sao importadas lazily dentro de run_cli() via:
```python
def _get_runtime():
    import task_executor as te

    return te
```
Quando essas funcoes forem extraidas para seus proprios modulos (llm/gemini.py, agents/autonomy.py, etc.),
o _get_runtime() em cli/commands.py deve ser substituido pelos imports diretos.

### llm/budget.py vs task_executor.py -- estado duplicado
As variaveis de estado global (KEY_BLOCKLIST, GEMINI_MODEL_KEY_BLOCKLIST, ROUTE_BLOCKLIST,
ROUTE_FAILURE_COUNTS, global_rate_limiter) existem APENAS em task_executor.py.
llm/budget.py tem as funcoes e constantes, mas nao o estado mutavel.
Na Fase 2, o estado deve ser movido para llm/budget.py e task_executor.py deve importar de la.
