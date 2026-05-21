---
name: Prompt de Continuidade V35
description: Sessao 20260327c - Auditoria + refatoracao task_executor.py CONCLUIDA. 7 bugs corrigidos, codigo morto removido, design refinado. Proximo foco: pendentes V34 + commit.
type: project
---

# Continuidade V35 - 20260327

## STATUS: task_executor.py - AUDITORIA CONCLUIDA

Arquivo: 3395 linhas (era 3410). Syntax limpa (py_compile OK).

### O que foi feito (nesta sessao, completo)

**7 bugs corrigidos:**

| Bug | Fix |
|---|---|
| B1 CRITICO | `_compress_context` retornava `None` implicitamente quando sem provedores. Corrigido: `return text` explicito + label "[Comprimido]" so aparece quando `len(resultado) < len(original)` |
| B2 ALTO | `designated_model = "gemini-3.1-pro"` para @securitychief era variavel local invisivel para `call_llm_api`. Corrigido: injetado via `task.metadata["model_override"]`, lido em `call_llm_api` com prioridade sobre o manifesto |
| B3 ALTO | Perplexity usava `"model": "gemini-2.5-pro"` (Gemini nao e servido pela Perplexity). Corrigido: modelo `sonar` (free tier), configuravel via `PERPLEXITY_MODEL` no env |
| B4 MEDIO | Sanitizacao de modelo Gemini tinha branches mortos/unreachable. Reescrita limpa: normaliza `2.0-x` e `1.x` para SOTA (`3.1-flash`/`3.1-pro`), modelos `2.5-x` e `3.1-x` passam direto |
| B5 MEDIO | Rich markup quebrado: `desc += f" bold cyan[/]"`. Corrigido para `f" [bold cyan]({files_str})[/bold cyan]"` |
| B6 MEDIO | Race condition em `get_global_http_session`: sem lock, duas chamadas concorrentes criavam duas sessions. Corrigido: `asyncio.Lock` lazy + funcao reescrita com indentacao correta |
| B7 BAIXO | `from core.schemas import Task` importado duas vezes. Removida duplicata |

**Codigo morto removido (D1-D6):**
- `FALLBACK_MODEL = "gemini-2.0-flash"` (nunca usado, modelo descontinuado)
- `console_progress` (Rich Progress nunca usado) + `task_progress_id`
- Imports orphans removidos: `Progress, SpinnerColumn, TimeElapsedColumn, TextColumn`
- `public_routes = []` (dead code no auth_middleware)
- `worker-api` unificado com `worker` (eram identicos)
- `autonomy-full` removido (duplicava `autonomy full`)

**Design refinado:**
- P1: Sufixo de chave revogada hardcoded `("XfUE",)` → configuravel via `REVOKED_KEY_SUFFIXES` no env
- P3: Triple `_register_route_failure` para "connection closed" substituido por loop que usa `ROUTE_FAILURE_THRESHOLD` explicitamente (`extra = max(0, ROUTE_FAILURE_THRESHOLD - 1)`)

**Arquitetural (A1):**
- `start_worker()` agora aceita `manager: Optional[QueueManager] = None`
- `start_worker_and_api()` passa o mesmo manager para API server, worker e watchdog
- Antes: 2 instancias independentes de QueueManager em producao

**Perplexity - contexto importante:**
- Perplexity e usada como fallback de busca web para AGENTES DO BACKEND (Nexus), nao tem relacao com o site de poker
- Fluxo: quando @pesquisador/@maverick/etc precisam buscar na web → Tavily (primario) → Perplexity (fallback)
- Raphael NAO tem assinatura paga Perplexity → modelo `sonar` (free tier, ~5 RPM)

## PENDENTES HERDADOS DA V34 (nao tocados)

- **P1-V34**: Conteudo das aulas movidas pode ter refs internas a caminhos antigos (texto, nao codigo)
- **P2-V34**: `/psicologia-hs/` candidata a mover para `/artigos/psicologia-hs/`
- **P3-V34**: `biblioteca/[slug]/page.js` referenciado por Next.js types mas nao existe
- **P4-V34**: `memory/` na raiz (62 arquivos) - avaliar se legado/duplicata
- **P5-V34**: Modularizacao futura do task_executor.py (3395 linhas) e do.ps1 (545 linhas)

## COMMIT PENDENTE

Nada foi commitado. Acumulado significativo de 2+ sessoes:
- Limpeza da raiz do projeto
- Reestruturacao de routing frontend (/aulas/*)
- ROUTES.md criado
- api/ deletado
- MODUS_OPERANDI.md restaurado
- BOM removido do queue_manager.py
- task_executor.py: 7 bugs + codigo morto + design + arquitetural

**Proximo passo sugerido:** commit de tudo antes de continuar novos trabalhos.

## TECH STACK (referencia rapida)

- Backend: Python/aiohttp (task_executor.py), aiosqlite, ChromaDB, Pydantic
- Frontend: Next.js 14 App Router, TypeScript, Tailwind
- Providers LLM: Gemini (nativo, primario), OpenRouter (fallback), Anthropic (ultimo)
- Web search: Tavily (primario), Perplexity sonar (fallback, free tier)
- DB: SQLite WAL via QueueManager

## FEEDBACK CRITICO

- **Proatividade obrigatoria**: Nunca apenas corrigir - sempre melhorar e refinar ao atuar
- **Hierarquia**: Raphael + Claude = mente intelectual; Gemini = executora qualificada com guardrails
- **Site**: Exclusivamente sobre poker. Nao adicionar conteudo de outros dominios.
- **Nunca reescrever do zero**: Editar sobre o existente sempre que possivel
