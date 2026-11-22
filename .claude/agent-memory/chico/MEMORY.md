---
title: "Memoria Coletiva e Acumulada - @chico (SOTA v8.0 GOLD)"
type: memory
status: active
owner: site-governance
updated_at: 2026-11-22
---

// [VITOI-AUDIT] Level: FULL | Derived_From: PARTIAL | Trigger: Proactive_Optimization

# Memoria Coletiva e Acumulada - @chico (SOTA v8.0 GOLD)

## Ultima Atualizacao: 2026-11-22

- **Missao Cumprida (2026-11-22):**
  1. Integracao Higgsfield Seedance 2.5 (`index.ts` com `@higgsfield/client` + `dotenv`, fix `typescript:S6551` via `formatError`, espelhamento de `HF_CREDENTIALS`/`HF_KEY` em `HKCU`/`HKLM` via `Set-EcosystemCredential.ps1`) e registro do MCP `higgsfield` (`https://mcp.higgsfield.ai/mcp`, OAuth PKCE via Clerk) no nucleo compartilhado da raiz (`c073003`).
  2. Auditoria, harmonizacao e atualizacao SOTA sem quebras: `types-psutil==7.2.2.20261122`, `types-PyYAML==6.0.12.20261122` (ambos os blocos de `pyproject.toml` + `uv.lock`), `markdownlint-cli@0.50.1`, `@tanstack/react-virtual@3.14.27` (0 CVEs em `npm audit` e `pip-audit`, 0 novas dependencias sem ROI positivo).
- **Missao Cumprida (2026-11-21):**
  1. Elevacao cirurgica e auditoria OSV/pip-audit de `laya>=0.5.2` (derivada `vegaml==0.18.0`) e `watchdog>=7.1.1,<8.0.0`, com otimizacao dos consumidores diretos (`llm/laya_bridge.py` via `laya.revisions.PINNED_REVISIONS` mantendo `torch_loaded=False`; `scripts/routines/vitoi_watcher.py` via `PatternMatchingEventHandler`, globs `full_match()` e tipagem estrita `FileSystemEvent`, pylint `10.00/10`).
  2. Calibracao formal presencial Tier 0 (`seq 101`, `e2f14625-6123-4eeb-8b32-b889aff473d7`, 4 sessoes `seq 97..100`), regularizacao de `reports/agent-calibration/daily/2026-11-21.{json,md}` (zerando alerta `saude_da_malha.py`) e propagacao compacta anti-cold-start cross-harness em `AGENTS.md` (<= 2500 B), `../DEVIN.md` + `%APPDATA%\devin\AGENTS.md` e `../memoria/HERMES.md`.
- **Missao Cumprida (2026-10-08):**
  1. Auditoria minuciosa da integralidade do backend (50 modulos, 6.038 statements) e execucao da remediacao estrutural (CVE-2026-104874, worker resiliency, tipagem Pyright, contratos de fila).
  2. Auditoria e evolucao integral do frontend Next.js 16 / React 19: eliminacao de split-brain SQLite (DATABASE_URL file:./prisma/dev.db), elevacao de touch targets para min-h-12 (48px) aprovando 8/8 testes Playwright E2E sem violacoes WCAG 2.2, contraste >= 4.6:1 em 15 botoes, eliminacao de loop perpétuo de rAF em CfrRegretPanel, throttling de Canvas a 60fps com tabela sr-only, eliminacao de conflito de estado no MasterSimulator, blindagem de CLS em imagens Markdown, ativacao do Quiz ICM interativo e expurgo do residuo Supabase SSR.
- **Aprendizados Sistemicos:**
  1. Dependencias transitivas de parsers HTTP como `multidict` no `aiohttp` requerem pinagem explicita em `requirements.txt` para blindar gates de seguranca contra vulnerabilidades de colisao de hash algoritmica.
  2. Chamadas de persistencia em tratadores de erro assincronos (`worker/loop.py`) devem ser obrigatoriamente encapsuladas em blocos defensivos `try/except Exception as db_err` e precedidas por liberacao do semaforo de concorrencia (`safe_release()`), impedindo que locks temporarios de SQLite derrubem o loop do asyncio.
  3. Evitar nomes de pastas na raiz do projeto que colidam com modulos da standard library do Python (como `math/`), pois geram shadowing de imports nativos.
  4. Alinhamento de dependencias npm: correcao nao-quebrante via `npm audit fix` para `sharp` e `source-map-js`, combinada com aceites formais em `data/npm_cve_acceptances.json` autorizados pelo Tier 0 para dependencias transitivas de desenvolvimento mantem o Quality Gate 100% verde sem regressao de runtime.
  5. No Next.js com LibSQL/Prisma, caminhos relativos de SQLite no `.env` devem ser harmonizados (`file:./prisma/dev.db`) para evitar bancos fantasmas vazios na raiz do projeto.
  6. Loops de animacao `requestAnimationFrame` em componentes de simulacao devem ser pausados explicitamente quando inativos/convergidos para poupar CPU/GPU.
  7. No `watchdog>=7.1.1`, `PatternMatchingEventHandler` usa `PurePath.full_match()`: padroes apenas com `*.py` nao casam subdiretorios (`core/app.py`); usar `["**/*.py", "*.py"]` e `ignore_patterns` com `**/<dir>/**`.
  8. No `laya>=0.5.2`, `PINNED_REVISIONS` reside em `laya.revisions` (stdlib-only, `torch_loaded=False`) e nao em `laya.router`; `Site/AGENTS.md` tem teto duro de `2500 B` em `tests/test_governanca_agents.py`.
  9. `https://mcp.higgsfield.ai/mcp` exige OAuth 2.0 PKCE via Clerk (`auth: "oauth"`, `sonda: "host"`) e retorna `401` para headers de API key estatica; `HF_CREDENTIALS`/`HF_KEY` em `HKCU`/`HKLM` atendem SDK e REST.
  10. Sincronizar o `.venv` do `Site` sempre via `uv sync --all-groups --all-extras` (`deps:sync`), evitando desinstalar extras consumidos pelo `pyright` (`numba`, `prometheus-client`, `matplotlib`).
- **Propostas Democraticas:** Manter suítes combinadas de testes de regressao de backend e Playwright quality smoke integradas aos portões locais.
