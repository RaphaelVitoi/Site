---
name: Prompt de Continuidade V44 - 2026-03-28
description: Auditoria completa sistema (8 correções), /health endpoint, MasterSimulator conectado à rota, ReferencialAula12 reconectada.
type: project
---

# Prompt de Continuidade V44 -- 2026-03-28

## Commits desta sessão

| Hash | Descrição |
|------|-----------|
| `b8057cb` | fix: renderizar MasterSimulator em /aulas/icm-masterclass |
| `c4c5d6b` | feat: GET /health -- status operacional do worker |
| `02b6899` | test: do.test.ps1 9/9 verde -- fallback Python via TestPythonCmd |
| `230dd61` | test: do.test.ps1 8/9 verde via -TestMode + fix Join-Path PS5.1 |
| `4c06884` | fix: reconectar ReferencialAula12 ao MasterSimulator |

## O que foi feito

### Auditoria completa (agente verifier)
8 correções aplicadas:
1. `data/routing_map.json`: modelos gemini-3.1-* removidos (404) + agent_map removido (não consumido)
2. `llm/gemini.py`: normalização de legados apontava para 3.1 fantasmas
3. `agents/execution.py`: @securitychief model_override gemini-3.1-pro → gemini-2.5-pro
4. `data/intentmap.json`: BOM triplo removido + pattern @implementor corrigido (faltava "desenvolv")
5. `web/middleware.py`: CORS sem Authorization no Allow-Headers (bloqueava preflight autenticado)
6. `tests/test_task_routing.py`: mock com modelo fantasma corrigido
7. `task_executor.py`: path traversal check executada ANTES do open()
8. Pester 9/9 confirmado

### /health endpoint
- `web/handlers.py`: handle_health() -- status ok, uptime_s, task counts, agents count
- `web/server.py`: app['start_time'] registrado + rota GET /health

### MasterSimulator conectado à rota
- `/aulas/icm-masterclass/page.tsx`: seção #simulador-section era placeholder com link circular
- `SimuladorLazy.tsx`: wrapper 'use client' para dynamic import com ssr:false (exigência App Router)
- `page.tsx`: importa SimuladorLazy e renderiza na section

### ReferencialAula12 reconectada
- Componente existia mas nunca foi importado no MasterSimulator
- Inserido antes do footer: accordion "▶ Referencial" com âncora empírica Aula 1.2
- Contém: board KJT-2-3, table draw, RP bars, ranges BTN/BB, prize structure, classificação, grids 13x13, matriz BF+RP 9x9

### Pendências de auditoria (requerem decisão)
1. Dead imports em task_executor.py (~25) -- consumidores via `import task_executor as te` precisam ser auditados antes de limpar
2. VALID_AGENTS duplicado: core/config.py (cold start) vs task_executor.py (hot-reload). Risco de drift. Solução: task_executor.py importar de core.config ou vice-versa.

## Estado atual do sistema
- Worker PID 18348, rodando com todos os fixes
- do.test.ps1: 9/9 verde
- /health endpoint ativo: http://127.0.0.1:17042/health
- MasterSimulator acessível via /aulas/icm-masterclass
- ReferencialAula12 visível no simulador (accordion colapsado por padrão)
