---
name: Prompt de Continuidade V45 - 2026-03-28
description: Consolidação VALID_AGENTS: eliminar drift core.config vs task_executor. Sistema pronto para produto.
type: project
---

# Prompt de Continuidade V45 -- 2026-03-28

## Commits desta sessão (acumulado desde V43)

| Hash | Descrição |
|------|-----------|
| `d4263fa` | fix: eliminar drift de VALID_AGENTS entre core.config e task_executor |
| `4c06884` | fix: reconectar ReferencialAula12 ao MasterSimulator |
| `b8057cb` | fix: renderizar MasterSimulator em /aulas/icm-masterclass |
| `c4c5d6b` | feat: GET /health -- status operacional do worker |
| `02b6899` | test: do.test.ps1 9/9 verde -- fallback Python via TestPythonCmd |
| `230dd61` | test: do.test.ps1 8/9 verde via -TestMode + fix Join-Path PS5.1 |

## O que foi feito nesta sessão (V45)

### VALID_AGENTS consolidação (eliminação de drift)

**Problema**: `queue_manager.py` fazia `from core.config import VALID_AGENTS` -- binding estático que congelava no cold start e nunca recebia atualizações do hot-reload de `task_executor.py`. Risco: após hot-reload, tasks carregadas do DB podiam ter agente normalizado para `@chico` incorretamente.

**Solução implementada**:
- `database/queue_manager.py`: substituído `from core.config import VALID_AGENTS` por `import core.config as _core_config`. Uso: `_core_config.VALID_AGENTS` (atributo de módulo, dinâmico).
- `task_executor.py`: adicionado `import core.config as _core_config`. Após cada `VALID_AGENTS = list(INTENT_MAP.keys())` (3 pontos: cold start L186, hot-reload manifesto L345, hot-reload fallback L356), sincroniza: `_core_config.VALID_AGENTS = VALID_AGENTS`.

## Estado atual do sistema

- Worker: pronto para restart com novo código
- do.test.ps1: 9/9 verde
- /health endpoint: ativo
- MasterSimulator acessível via /aulas/icm-masterclass
- ReferencialAula12 visível no simulador
- VALID_AGENTS: fonte única (core.config), atualizada pelo task_executor no hot-reload

## Pendências restantes

1. Dead imports em task_executor.py (~25 flagged) -- baixa prioridade, requer auditoria de consumidores via `import task_executor as te` antes de limpar. Não bloqueia produto.

## Próximos passos sugeridos (produto)

Sistema limpo. Voltar ao produto: features pendentes do backlog ICM (PKO Value, novos cenários, UI improvements).

Depois atualizar MEMORY.md para apontar V45 como prompt mais recente.
