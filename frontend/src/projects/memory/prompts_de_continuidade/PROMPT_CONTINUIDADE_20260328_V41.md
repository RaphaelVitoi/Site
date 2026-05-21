---
name: Prompt de Continuidade V41 - 2026-03-28
description: Sessão pós-P5. Correções críticas de routing (gemini-3.1-* removidos), hot-reload, start_worker.ps1, manifesto corrigido. Sistema operacional confirmado via ping.
type: project
---

# Prompt de Continuidade V41 -- 2026-03-28

## Commits desta sessão

| Hash | Descrição |
|------|-----------|
| `71992f8` | fix routing: remove gemini-3.1-* (404), retry 5xx, start_worker.ps1 |
| `1de34e9` | feat: start-worker com -Force/-Background + dashboard atualizado |
| `057c036` | feat: hot-reload system_config.json sem restart do worker |
| `f91a4a3` | fix: agents_manifest gemini-3.1-pro -> 2.5-pro + hot-reload cobre manifesto |

## O que foi feito

### Bug crítico corrigido
- `gemini-3.1-pro` e `gemini-3.1-flash` estavam como PRIMEIROS em todas as rotas (system_config.json + agents_manifest.json). Modelos inexistentes (404). Causavam falha garantida antes de chegar nos modelos funcionais.
- Removidos de: `model_routing.deep_thinking`, `fast_operations`, `coding`, `protect_models`, `DEFAULT_MODEL_HEALTH_GATE`, e `primary_model` de maverick/chico/implementor/securitychief.

### Melhorias de orquestração
- `llm/routing.py`: scoring Gemini pattern-based (`"gemini" in m and "flash/pro" in m`)
- `llm/providers.py`: retry em HTTP 5xx transiente (sleep 2s antes de rotacionar chave)
- `llm/orchestrator.py`: `_compress_context` usa ROUTE_FAILURE_THRESHOLD-1 extras em connection-closed (consistente com _try_provider)
- `system_config.json`: `deep_thinking` agora tem gemini-2.5-flash como fallback final

### Hot-reload sem restart
- `task_executor.py`: `_maybe_reload_config()` detecta mudanças por mtime em `data/system_config.json` E `data/agents_manifest.json`
- `llm/orchestrator.py`: chamado no início de `call_llm_api` a cada tarefa
- Custo: 1 syscall stat() por chamada LLM

### Scripts
- `scripts/ops/start_worker.ps1`: novo script com -Force e -Background
- `Setup-NexusProfile.ps1`: `start-worker` agora proxy para o script com passthrough de params
- Dashboard regenerado com novas entradas

## Estado atual do sistema

- Worker rodando (PID 24268 após restart)
- Ping TASK-PING-095659: completed | designated: gemini-2.5-pro | route: ['gemini-2.5-pro', 'gemini-2.5-flash'] | model_used: gemini-2.5-flash
- gemini-2.5-pro com quota free tier esgotada para hoje (429) - cai corretamente em gemini-2.5-flash
- Hot-reload ativo e funcionando

## Pendente / próximas sessões

- Nenhum pendente crítico
- Possível: adicionar `nexus-ping` como comando de diagnóstico rápido no profile
- Possível: handler 429 com retry-after (extrair delay dos headers e aguardar)
