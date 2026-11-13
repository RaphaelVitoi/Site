---
title: "Mapa de features Cascade/Windsurf → equivalentes locais medidos"
type: memory
status: active
created_at: 2026-11-13
source: "docs.devin.ai/windsurf/plugins/cascade/{workflows,memories,web-search}"
tags: [windsurf, cascade, memories, rules, workflows, web-search, mapping]
---

# Cascade features → o que ja temos

Docs do Cascade (Windsurf legado). Cada feature tem equivalente local
medido — registrado para nao re-avaliar do zero.

## Web & Docs Search (`@web`, `@docs`, page reading)

Cascade busca na web e le paginas chunked, localmente quando possivel.

| Cascade | Equivalente local |
| :--- | :--- |
| Web search | `web_search`/`webfetch` nativos + MCPs `exa`, `tavily`, `parallel-search`, `you-com` (fonte unica via nucleo) — **mais providers, mesmo papel** |
| `@docs` em doc sites | `context7` MCP + fetch direto da URL — cobertura equivalente |
| Leitura de pagina colada | `webfetch` / `browser_fetch_webpage` (mcpbrowser) |

Nota de design herdada: page reads rodam **na maquina do usuario** —
mesmo principio dos nossos MCPs locais. Nada a fazer.

## Memories & Rules

| Cascade | Equivalente local |
| :--- | :--- |
| Memories auto-geradas por workspace | `Site/memory/*.md`, `~/.gemini/memoria/`, `MEMORY.md` do harness, `poker-pmev-knowledge-engine` FTS5 — mais estruturado que o deles |
| Rules globais/workspace | `CLAUDE.md`/`AGENTS.md`/`.windsurfrules`/`.devin/rules/` com triggers — mesmo modelo, mais camadas |
| **System-level rules** (`C:\ProgramData\Windsurf\rules\*.md`) | **UNICA peca sem equivalente** — regras OS-level que usuario nao edita. Candidato real se quisermos piso de seguranca fora do alcance de qualquer agente: hoje o piso vive em `~/.claude/CLAUDE.md` (editavel). Avaliar se vale um `C:\ProgramData\gemini\rules\` — so com decisao do Tier 0, muda superficie de admin da maquina. |
| Limite 12000 chars/regra | Nao medido nos nossos — CLAUDE.md Site tem 86k chars; o custo de contexto e cobrado via truncamento (§AGENTS.md). Licao: regra curta vence regra longa. |

## Workflows (`.windsurf/workflows/*.md`, `/nome`)

Workflow = markdown com passos sequenciais invocado por slash command,
composable (workflow chama workflow).

**Equivalente exato: skills.** `.agents/skills/*/SKILL.md` ja sao
procedimentos invocaveis com descricao para auto-disparo — estritamente
mais capable que workflows (suporte a arquivos, allowed-tools,
triggers). Workflows legados do Cascade estao cobertos; **nao criar
`.windsurf/workflows/` novo** — skills e o formato vivo.

Precedencia deles (System > Workspace > Global > Built-in) espelha nossa
hierarquia CLAUDE.md: canonico vence, escopo estreito especializa.
