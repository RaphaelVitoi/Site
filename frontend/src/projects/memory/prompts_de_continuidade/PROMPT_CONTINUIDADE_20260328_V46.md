---
name: Prompt de Continuidade V46 - 2026-03-28
description: core/runtime.py (exports explícitos), Dashboard 3 bugs corrigidos, testes anti-modelo-fantasma.
type: project
---

# Prompt de Continuidade V46 -- 2026-03-28

## Commit desta sessão
| Hash | Descrição |
|------|-----------|
| `83b49cc` | refactor: core/runtime.py como ponto de export explícito + fixes Dashboard e testes |

## O que foi feito

### Dashboard.tsx -- 3 bugs Gemini corrigidos
1. Endpoint `/keys/health` → `/key-health-summary` (rota real do servidor)
2. `statusData?.pending_tasks` -- shape errado: `/status` retorna `Task[]`, não objeto. Derivação local: `filter(t => t.status === 'pending').length`
3. CSS `divideColor` → `borderColor` (propriedade CSS válida)

### core/runtime.py -- módulo de exports explícito
Elimina o padrão `_get_te() / import task_executor as te` em 9 sub-módulos.
Símbolos exportados: VALID_AGENTS, OPENROUTER_ALTERNATIVE_MODELS, AGENTS_MANIFEST, AGENT_COLOR_MAP, AGENT_ROUTING_MAP, DEEP_THINKING_MODELS, FAST_OPERATIONS_MODELS, SYSTEM_PROMPT_CACHE, TECHNICAL_AGENTS, SYSTEM_CONFIG, HEURISTIC_THRESHOLD, HANDOFF_PIPELINE, PID_FILE, get_rag, _maybe_reload_config, _feature_enabled, _heuristic_terms, _agent_sla_value, _health_gate_value, _c.
task_executor.py: _sync_runtime() popula core.runtime no startup e em cada hot-reload (2 branches).
Consumidores migrados: agents/dispatcher, agents/execution, agents/fallback, agents/prompts, llm/providers, llm/orchestrator, llm/routing, web/handlers, worker/loop.
cli/commands.py: mantido com import task_executor as te (CLI é entry point, sem circular import).

### tests/test_task_routing.py -- 3 testes anti-modelo-fantasma
- test_routing_map_sem_modelos_fantasma: detecta gemini-3.x/gemini-1.x em routing_map.json
- test_agents_manifest_sem_modelos_fantasma: mesmo em agents_manifest.json
- test_routing_map_modelos_conhecidos: valida prefixo de provider reconhecido

## Estado do sistema
- Sem _get_te() em nenhum sub-módulo
- Dashboard funcional (endpoint correto, dados corretos)
- 3 testes anti-regressão de modelo-fantasma
- Dead imports em task_executor.py resolvidos estruturalmente (core/runtime.py é o contrato explícito)

## Pendências
- Nenhuma crítica. Dead stdlib imports em task_executor.py (base64, subprocess, etc.) são genuinamente mortos após P5 -- podem ser removidos em limpeza futura se confirmado que nenhum consumer usa via `import task_executor as te`.
