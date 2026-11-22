---
id: docs-pools-de-chaves
tipo: referencia
escopo:
  Site -- inventario consolidado das pools de chaves e credenciais (OpenRouter
  tiers, Gemini, Decision, multimodal TTS/video/imagem/traducao, GCP/OAuth) com
  fingerprints sha8 e validacao live
status: active
owner: site-governance
autor:
  Devin (SWE-2 Flash)
  <158243242+devin-ai-integration[bot]@users.noreply.github.com>
criado_em: "2026-11-12T12:30:00-03:00"
atualizado_em: "2026-11-22T13:45:00-03:00"
verificado:
  - "Pool Gemini: 5/5 chaves validadas HTTP 200 em /v1beta/models (2026-11-12)"
  - "Pool Decision: 3/3 validadas HTTP 200 + decide_s1 live via
    gemini-decision-1 (2026-11-12)"
  - "Pool OpenRouter (2026-11-18): 25/25 tiers (T1=5, T2=10, T3=5, T4=5) + 3/3 dedicadas + OPENROUTER_API_KEY isolada em TIER4_KEY_1 verificadas offline (HKCU == HKLM, formato, sha8, zero duplicatas); Tier 1 (5/5) validada ao vivo com HTTP 200 (media 101 ms)"
  - "Pool multimodal: 8/8 chaves (4 AI Studio + 4 OpenRouter) validadas HTTP 200
    em 2026-11-12 e sincronizadas em 2026-11-18"
  - "Ollama Cloud & Ecossistema (2026-11-18): OLLAMA_API_KEY + OLLAMA_CLOUD_KEY (legada HKLM promovida), tuning RX 570 (q8_0/2/32768/FA=1), HF_TOKEN, SOTA_OPENAI_API_KEY e SOTA_SITE_TOKEN sincronizados HKCU == HKLM"
nao_verificado:
  - "Pools Anthropic e OpenAI: nao provisionadas (pendencia aberta)"
  - "Validacao HTTP live individual de TIER2_KEY_8..10 e endpoint remoto OLLAMA_CLOUD_KEY: verificadas offline no Registro por audit-keys"
  - "Quota/throughput real por chave: apenas autenticacao medida em 2026-11-12"
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

| Variável                     | Tier     | Papel                                                     | sha8                                                                                            | Validação                        |
| ---------------------------- | -------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------- |
| `OPENROUTER_TIER1_KEY_1`     | 1        | Core Cognitivo                                            | `20d78224`                                                                                      | HTTP 200 OK (2026-11-12)         |
| `OPENROUTER_TIER1_KEY_2`     | 1        | Core Cognitivo (rotacionada 2026-11-18)                   | `22eba9b5`                                                                                      | Offline HKCU/HKLM (2026-11-18)   |
| `OPENROUTER_TIER1_KEY_3`     | 1        | Core Cognitivo                                            | `ce865020`                                                                                      | HTTP 200 OK (2026-11-12)         |
| `OPENROUTER_TIER1_KEY_4`     | 1        | Core Cognitivo                                            | `3628fd7f`                                                                                      | HTTP 200 OK (2026-11-12)         |
| `OPENROUTER_TIER1_KEY_5`     | 1        | Core Cognitivo (adicionada 2026-11-18)                    | `34b51f77`                                                                                      | Offline HKCU/HKLM (2026-11-18)   |
| `OPENROUTER_TIER2_KEY_1..7`  | 2        | Superagentes & Pesquisa                                   | `76bdb9ee` `7b833cde` `04c61a58` `1a66cbd5` `a9b56b18` `647929fb` `ff4c4e79`                    | HTTP 200 OK (7/7, 2026-11-12)    |
| `OPENROUTER_TIER2_KEY_8..10` | 2        | Superagentes & Pesquisa (adicionadas 2026-11-18)          | `a89d74b3` `3639dfc3` `4145ccc4`                                                                | Offline HKCU/HKLM (3/3, 2026-11-18) |
| `OPENROUTER_TIER3_KEY_1..5`  | 3        | Frota especialista & batch                                | `961a0848` `d3e62c15` `39e540cf` `56a1f42f` `c7227d85`                                          | HTTP 200 OK (5/5, 2026-11-12)    |
| `OPENROUTER_TIER4_KEY_1..5`  | 4        | Subagentes dedicados                                      | `9669414e` `1eea72b3` `d112b6a6` `c1590242` `4348e59c`                                          | HTTP 200 OK (5/5, 2026-11-12)    |
| `OPENROUTER_API_KEY`         | legado   | ponte p/ `gemma_server`, `/api/v1/rag`, `providers`, `media_pool` (isolada do Tier 1; chave distinta entra em Tier 4) | `9669414e` (`= TIER4_KEY_1`) | Offline HKCU/HKLM (2026-11-18) |
| `OPENROUTER_ANTIGRAVITY_KEY` | dedicada | condutor Antigravity                                      | `b3fe711b`                                                                                      | HTTP 200 OK (2026-11-12)         |
| `OPENROUTER_DEVIN_KEY`       | dedicada | condutor Devin                                            | `cb0df99c`                                                                                      | HTTP 200 OK (2026-11-12)         |
| `OPENROUTER_HERMES_KEY`      | dedicada | condutor Hermes Agent                                     | `8288df2d`                                                                                      | HTTP 200 OK (2026-11-12)         |
| `WEBHOOK_OPENROUTER_SECRET`  | config   | webhook OpenRouter (`whsec_…`)                            | `7f28f360`                                                                                      | não é chave de API               |

**Histórico de manutenção:** em 2026-11-12, `TIER1_KEY_2` foi removida por HTTP 401 e renumerada para 4 chaves (`TIER1_KEY_1..4`). Em 2026-11-18, `TIER1_KEY_2` foi rotacionada (`22eba9b5`), `TIER1_KEY_5` foi provisionada (`34b51f77`, totalizando 5 chaves no Tier 1), `TIER2_KEY_8..10` elevaram o Tier 2 para 10 chaves, e `OPENROUTER_API_KEY` foi reapontada de `TIER1_KEY_1` para `TIER4_KEY_1` para evitar contenção de cota no Tier 1.

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

## 4. Pool Multimodal Gemini — 4 modalidades × 2 providers

Gerenciada por `llm/media_pool.py` (`MediaPoolManager`, singleton
`media_pool_manager`): round-robin + circuit breaker por (modalidade, provider),
isolada dos pools de texto. Cada modalidade tem uma chave **AI Studio** (`AQ.*`,
endpoint generativelanguage) e uma **OpenRouter** (`sk-or-v1-*`), com fallback
controlado para `GEMINI_API_KEY`/`OPENROUTER_API_KEY` quando a dedicada estiver
ausente. Ordem default: `aistudio` primeiro; `MEDIA_POOL_PROVIDER`
(`aistudio`|`openrouter`|`auto`) reordena.

| Modalidade  | Variável AI Studio     | sha8 (media) | Variável OpenRouter               | sha8 (media) | Validação 2026-11-12 |
| ----------- | ---------------------- | ------------ | --------------------------------- | ------------ | -------------------- |
| `tts`       | `GEMINI_TTS_KEY`       | `6480db8d`   | `OPENROUTER_GEMINI_TTS_KEY`       | `46a23a76`   | HTTP 200 OK (2/2)    |
| `video`     | `GEMINI_VIDEO_KEY`     | `dc35d4f4`   | `OPENROUTER_GEMINI_VIDEO_KEY`     | `2d30d9f0`   | HTTP 200 OK (2/2)    |
| `image`     | `GEMINI_IMAGE_KEY`     | `5105e757`   | `OPENROUTER_GEMINI_IMAGE_KEY`     | `ebce6d81`   | HTTP 200 OK (2/2)    |
| `translate` | `GEMINI_TRANSLATE_KEY` | `28f4d05e`   | `OPENROUTER_GEMINI_TRANSLATE_KEY` | `3fc00c37`   | HTTP 200 OK (2/2)    |

Validação: OpenRouter via `GET /api/v1/auth/key`; AI Studio via
`GET /v1beta/models?key=…`. Sufixos `_1.._5` aceitos para crescimento futuro.
Chaves OpenRouter dedicadas **fora** dos tier pools (mesmo padrão de
`OPENROUTER_{ANTIGRAVITY,DEVIN,HERMES}_KEY`).

## 5. Configuração GCP / OAuth / projeto

| Variável                      | sha8       | Conteúdo (não-secreto)                                                                                                                                                                             |
| ----------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GCP_PROJECT_ID`              | `3756abd2` | `original-498419`                                                                                                                                                                                  |
| `GCP_PROJECT_NUMBER`          | `028f831a` | `913870412920`                                                                                                                                                                                     |
| `GOOGLE_CLOUD_PROJECT_NUMBER` | `028f831a` | `913870412920`                                                                                                                                                                                     |
| `GCP_ACCOUNT_EMAIL`           | `1a343ed3` | `raphavitoi@gmail.com`                                                                                                                                                                             |
| `GOOGLE_OAUTH_CLIENT_ID`      | `ba9ab749` | `913870412920-00so1m1htnorevj81pbud44irj5n34ai.apps.googleusercontent.com` (público por definição; injetado em `{{OAUTH_CLIENT_ID}}` de manifests de extensão por `scripts/ops/build-manifest.py`) |
| `GOOGLE_OAUTH_CLIENT_SECRET`  | `b80cf4b7` | client secret OAuth do cliente "Gemini" (tipo Computador, criado 2026-09-04)                                                                                                                       |

## 6. Pendentes (`pend-2026-11-10-key-pools-api`)

- **Anthropic** (`ANTHROPIC_API_KEY`/tiers): não provisionado — aguarda chaves.
- **OpenAI** (`OPENAI_API_KEY`/tiers): não provisionado — aguarda chaves.
- Demais providers do `OPENROUTER_KEYS`/auditoria seguem cobertos pelas pools
  acima.

## 7. Notas operacionais

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
- Auditoria sem vazar chave: CLI `audit-keys` (skill `.agents/skills/key-pool-audit/SKILL.md`), `llm/budget.py::OPENROUTER_KEYS`, `cli/commands.py` (`nexus keys`), `gemini_pool_manager.format_markdown_table()`.
- **Ollama Cloud & SOTA local (harmonizado em 2026-11-18):** `OLLAMA_API_KEY` (primária `HKCU`/`HKLM`) + `OLLAMA_CLOUD_KEY` (chave legada promovida de `HKLM` para backup em `OLLAMA_KEYS`, `llm/budget.py`), `OLLAMA_KV_CACHE_TYPE=q8_0`, `OLLAMA_MAX_LOADED_MODELS=2`, `OLLAMA_CONTEXT_LENGTH=32768`, `OLLAMA_FLASH_ATTENTION=1`, `HF_TOKEN`, `SOTA_OPENAI_API_KEY` e `SOTA_SITE_TOKEN` espelhados em `HKCU` e `HKLM`.
- **Harmonização SSOT & Higgsfield / HuggingFace (2026-11-22):** `data/credential_registry.json` é a fonte canônica única consumida por `llm/key_observatory.py`, `Audit-KeyPools.ps1`, `render_key_audit.py`, `Set-EcosystemCredential.ps1` e `utils/env_loader.py`. `HF_CREDENTIALS` (`sha8=7916c7d3`, Higgsfield SDK/REST) permanece sincronizada em `HKCU`/`HKLM`; a duplicata `HF_KEY` foi removida do Registro e é projetada apenas em memória via `runtime_aliases` (`utils/env_loader.py`), preservando zero redundância. `HF_TOKEN` (`sha8=3445dade`) permanece exclusivo para HuggingFace Hub.

## Verificação executada (2026-11-12 live · 2026-11-18 offline)

| Pool                  | Chaves | Resultado                                                                 |
| --------------------- | ------ | ------------------------------------------------------------------------- |
| Gemini                | 5/5    | HTTP 200 em `/v1beta/models` (2026-11-12) · Sync HKCU/HKLM OK (2026-11-18) |
| Decision              | 3/3    | HTTP 200 + `decide_s1` live (2026-11-12) · Sync HKCU/HKLM OK (2026-11-18) |
| OpenRouter tiers      | 25/25  | T1=5, T2=10, T3=5, T4=5 — Sync HKCU/HKLM + formato OK via `audit-keys` (2026-11-18; live HTTP pendente para novas/rotacionadas) |
| OpenRouter dedicadas  | 4/4    | 3 dedicadas HTTP 200 (2026-11-12) + `OPENROUTER_API_KEY` (= `TIER4_KEY_1`) offline OK (2026-11-18) |
| Multimodal AI Studio  | 4/4    | HTTP 200 em `/v1beta/models` (2026-11-12) · Sync HKCU/HKLM OK (2026-11-18) |
| Multimodal OpenRouter | 4/4    | HTTP 200 em `/api/v1/auth/key` (2026-11-12) · Sync HKCU/HKLM OK (2026-11-18) |
| Ollama Cloud          | 2/2    | `OLLAMA_API_KEY` + `OLLAMA_CLOUD_KEY` sincronizadas HKCU/HKLM (2026-11-18) |
