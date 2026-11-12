---
id: docs-pools-de-chaves
tipo: referencia
escopo:
  Site -- inventario consolidado das pools de chaves e credenciais (OpenRouter
  tiers, Gemini, Decision, GCP/OAuth) com fingerprints sha8 e validacao live
status: active
owner: site-governance
autor:
  Devin (SWE-2 Flash)
  <158243242+devin-ai-integration[bot]@users.noreply.github.com>
criado_em: "2026-11-12T12:30:00-03:00"
atualizado_em: "2026-11-12T12:30:00-03:00"
verificado:
  - "Pool Gemini: 5/5 chaves validadas HTTP 200 em /v1beta/models (2026-11-12)"
  - "Pool Decision: 3/3 validadas HTTP 200 + decide_s1 live via
    gemini-decision-1"
  - "Pool OpenRouter: 21/21 tiers + 3/3 dedicadas validadas HTTP 200 em
    /api/v1/auth/key"
  - "Incidente TIER1_KEY_2 (HTTP 401) documentado e corrigido com renumeracao"
nao_verificado:
  - "Pools Anthropic e OpenAI: nao provisionadas (pendencia aberta)"
  - "Quota/throughput real por chave: apenas autenticacao medida"
  - "Rotacao de chaves coladas em chat: a cargo do operador"
---

# Pools de Chaves e Credenciais — Inventário Consolidado

> **Nenhuma chave em texto claro neste documento.** Cada entrada é identificada
> por nome de variável e fingerprint `sha8` (HMAC-SHA256 truncado, salt próprio
> de cada pool — os mesmos valores que a telemetria dos managers emitem).
> Valores vivem exclusivamente no Registro do Windows (`HKCU`/`HKLM`
> `Environment`) e chegam aos processos via `utils/env_loader.py` →
> `os.environ`.

**Escopo medido:** 2026-11-12 · Windows 11 · projeto GCP `original-498419`
(`projects/913870412920`) · conta `raphavitoi@gmail.com` (AI Studio paid tier).

---

## 1. Pool OpenRouter — 4 tiers + dedicadas + webhook

Gerenciada por `llm/openrouter_pool.py` (`OpenRouterPoolManager`, singleton
`openrouter_pool_manager`) com score adaptativo de saúde e circuit breaker
(401/403 → revogação; 429 → cooldown; 5xx → cooldown curto). Chaves são
coletadas por regex `OPENROUTER_TIER{1-4}_KEY_{n}` em HKCU+HKLM.

| Variável                     | Tier     | Papel                                                     | sha8                                                                         | Validação 2026-11-12 |
| ---------------------------- | -------- | --------------------------------------------------------- | ---------------------------------------------------------------------------- | -------------------- |
| `OPENROUTER_TIER1_KEY_1`     | 1        | Core Cognitivo                                            | `20d78224`                                                                   | HTTP 200 OK          |
| `OPENROUTER_TIER1_KEY_2`     | 1        | Core Cognitivo                                            | `f2c5feea`                                                                   | HTTP 200 OK          |
| `OPENROUTER_TIER1_KEY_3`     | 1        | Core Cognitivo                                            | `ce865020`                                                                   | HTTP 200 OK          |
| `OPENROUTER_TIER1_KEY_4`     | 1        | Core Cognitivo                                            | `3628fd7f`                                                                   | HTTP 200 OK          |
| `OPENROUTER_TIER2_KEY_1..7`  | 2        | Superagentes & Pesquisa                                   | `76bdb9ee` `7b833cde` `04c61a58` `1a66cbd5` `a9b56b18` `647929fb` `ff4c4e79` | HTTP 200 OK (7/7)    |
| `OPENROUTER_TIER3_KEY_1..5`  | 3        | Frota especialista & batch                                | `961a0848` `d3e62c15` `39e540cf` `56a1f42f` `c7227d85`                       | HTTP 200 OK (5/5)    |
| `OPENROUTER_TIER4_KEY_1..5`  | 4        | Subagentes dedicados                                      | `9669414e` `1eea72b3` `d112b6a6` `c1590242` `4348e59c`                       | HTTP 200 OK (5/5)    |
| `OPENROUTER_API_KEY`         | legado   | fallback p/ `gemma_server`, `providers`, `routing_policy` | `20d78224` (= TIER1_KEY_1)                                                   | —                    |
| `OPENROUTER_ANTIGRAVITY_KEY` | dedicada | condutor Antigravity                                      | `b3fe711b`                                                                   | HTTP 200 OK          |
| `OPENROUTER_DEVIN_KEY`       | dedicada | condutor Devin                                            | `cb0df99c`                                                                   | HTTP 200 OK          |
| `OPENROUTER_HERMES_KEY`      | dedicada | condutor Hermes Agent                                     | `8288df2d`                                                                   | HTTP 200 OK          |
| `WEBHOOK_OPENROUTER_SECRET`  | config   | webhook OpenRouter (`whsec_…`)                            | `7f28f360`                                                                   | não é chave de API   |

**Incidente registrado:** na primeira provisão (5 chaves Tier 1), a segunda
chave (`…24059cbe…`, sha8 de validação `319a5602`) retornou
`HTTP 401 {"error":"User not found."}` em `/api/v1/auth/key` — chave
inválida/revogada no provedor. Foi removida do Registro e os índices
renumerados; restam 4 chaves ativas em `TIER1_KEY_1..4`.

**Nota de nomenclatura:** o webhook usa `WEBHOOK_OPENROUTER_SECRET` (sufixo, não
prefixo) de propósito — `llm/budget.py` agrega qualquer env `OPENROUTER_*` com
cara de chave para auditoria, e um `whsec_` entraria como falso positivo de
"chave morta".

## 2. Pool Gemini (Google AI Studio) — 5 chaves

Gerenciada por `llm/gemini_pool.py` (`GeminiPoolManager`, weighted round-robin +
circuit breaker + telemetria sha8) para `gemini-3.5-flash-lite` (edições
atômicas, triagem, linting). Provisionada por
`scripts/ops/Set-GeminiKeyPool.ps1`.

| Variável                | sha8                   | Validação 2026-11-12 |
| ----------------------- | ---------------------- | -------------------- |
| `GEMINI_API_KEY_1`      | `fa796c51`             | HTTP 200 OK          |
| `GEMINI_API_KEY_2`      | `4a236646`             | HTTP 200 OK          |
| `GEMINI_API_KEY_3`      | `13b5b906`             | HTTP 200 OK          |
| `GEMINI_API_KEY_4`      | `0aa12faa`             | HTTP 200 OK          |
| `GEMINI_API_KEY_5`      | `b297bbcd`             | HTTP 200 OK          |
| `GEMINI_API_KEY`        | `fa796c51`             | fallback = chave 1   |
| `GEMINI_FLASH_KEY_1..5` | (aliases das mesmas 5) | —                    |

Smoke live: `call_gemini_flash_lite` respondeu corretamente via rotação do pool.

## 3. Pool Decision (System-1) — 3 chaves

Gerenciada por `llm/decision_pool.py` (`DecisionPoolManager`, round-robin +
circuit breaker 401/403→revoga, 429→cooldown 45s, 5xx→15s) exclusivamente para a
**Gemini Decisions API** (`gemini-decision-1`, `POST /v1beta/decisions`) na
cascata System-1 Laya → Decisions (`llm/gemini_decisions.py`).

| Variável         | sha8       | Validação 2026-11-12                      |
| ---------------- | ---------- | ----------------------------------------- |
| `DECISION_API_1` | `5604e6f6` | HTTP 200 OK + Decisions live (conf 0.993) |
| `DECISION_API_2` | `59377bb0` | HTTP 200 OK                               |
| `DECISION_API_3` | `b92f4452` | HTTP 200 OK                               |

Fallback controlado: pool vazio → `GEMINI_API_KEY`/`GOOGLE_API_KEY`/
`GOOGLE_GENAI_API_KEY` (mesma família de credencial AI Studio). Suporta
`DECISION_API_1..9`; hoje 3 provisionadas.

## 4. Configuração GCP / OAuth / projeto

| Variável                      | sha8       | Conteúdo (não-secreto)                                                                                                                                                                             |
| ----------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GCP_PROJECT_ID`              | `3756abd2` | `original-498419`                                                                                                                                                                                  |
| `GCP_PROJECT_NUMBER`          | `028f831a` | `913870412920`                                                                                                                                                                                     |
| `GOOGLE_CLOUD_PROJECT_NUMBER` | `028f831a` | `913870412920`                                                                                                                                                                                     |
| `GCP_ACCOUNT_EMAIL`           | `1a343ed3` | `raphavitoi@gmail.com`                                                                                                                                                                             |
| `GOOGLE_OAUTH_CLIENT_ID`      | `ba9ab749` | `913870412920-00so1m1htnorevj81pbud44irj5n34ai.apps.googleusercontent.com` (público por definição; injetado em `{{OAUTH_CLIENT_ID}}` de manifests de extensão por `scripts/ops/build-manifest.py`) |
| `GOOGLE_OAUTH_CLIENT_SECRET`  | `b80cf4b7` | client secret OAuth do cliente "Gemini" (tipo Computador, criado 2026-09-04)                                                                                                                       |

## 5. Pendentes (`pend-2026-11-10-key-pools-api`)

- **Anthropic** (`ANTHROPIC_API_KEY`/tiers): não provisionado — aguarda chaves.
- **OpenAI** (`OPENAI_API_KEY`/tiers): não provisionado — aguarda chaves.
- Demais providers do `OPENROUTER_KEYS`/auditoria seguem cobertos pelas pools
  acima.

## 6. Notas operacionais

- **Cota é por projeto, não por chave** (AI Studio/GCP): as 3 chaves Decision e
  as 5 Gemini dividem a quota do projeto `913870412920`. A rotação serve para
  resiliência (revogação/restrição por chave), não para multiplicar throughput.
  OpenRouter, por ser multi-workspace, tem quotas por chave.
- **Segredos colados em chat** durante o provisionamento de 2026-11-11/12 devem
  ser rotacionados no AI Studio/OpenRouter quando conveniente; o Registro já é o
  local canônico.
- Provisionamento manual equivalente: gravar as variáveis em `HKCU:\Environment`
  e `HKLM:\...\Environment` (ou rodar `scripts/ops/Set-OpenRouterKeyPools.ps1` /
  `Set-GeminiKeyPool.ps1`) e emitir broadcast `WM_SETTINGCHANGE`.
- Auditoria sem vazar chave: `llm/budget.py::OPENROUTER_KEYS`, `cli/commands.py`
  (`nexus keys`), `gemini_pool_manager.format_markdown_table()`.

## Verificação executada (2026-11-12)

| Pool                 | Chaves | Resultado                                                 |
| -------------------- | ------ | --------------------------------------------------------- |
| Gemini               | 5/5    | HTTP 200 em `/v1beta/models` para todas                   |
| Decision             | 3/3    | HTTP 200 + `decide_s1` live via `gemini-decision-1`       |
| OpenRouter tiers     | 21/21  | HTTP 200 em `/api/v1/auth/key` (após remoção da inválida) |
| OpenRouter dedicadas | 3/3    | HTTP 200                                                  |
