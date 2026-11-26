---
title:
  "ARQUITETURA TÉCNICA PADRÃO-OURO (SOTA v8.0 GOLD) — ECOSSISTEMA RAPHAEL VITOI"
type: technical
status: active
owner: site-governance
updated_at: 2026-11-25
id: arquitetura-padrao-ouro-sota-2026
tipo: technical
escopo: site
autor: site-governance
criado_em: 2026-08-01
verificado:
  - "Modelos, precos, thinking_level, Implicit Cache (4096 tok), Decisions API e Tool Retrieval conferidos via gemini-api-docs em 2026-11-25"
  - "Hardware medido no host em 2026-11-25: GTX 1060 6GB (Driver 582.78, CUDA 13.0/12.4, 5.1 GiB livres), Split-VRAM Intel UHD 630 (31.0.101.2145), Windows build 26300.10075"
  - "Google Antigravity Desktop App 2.35.1 confirmado pelo Tier 0 em 2026-11-25"
nao_verificado:
  - "Custo mensal real em BRL varia conforme cambio e volume de chamadas Flex/Standard"
---

# ARQUITETURA TÉCNICA PADRÃO-OURO (SOTA v8.0 GOLD) — ECOSSISTEMA RAPHAEL VITOI

> **Data de Corte da Análise:** 25 de Novembro de 2026 **Autoridade & Governança:**
> Raphael Vitoi (Tier 0) **Orquestrador Central:** Coletivo `CHICO` / Google Antigravity
> Desktop App `2.35.1` (IDE `2.9.0`, CLI `1.5.17`, SDK `v0.1.24`, VS `v1.0.261116.0`, ACP, Zed `v1.5.0`) **Status:** Ativo, Persistente e Vinculante

---

## 1. AS QUATRO CAMADAS FUNCIONAIS DA ARQUITETURA PADRÃO-OURO

```text
                             [INPUT DA TAREFA / PROMPT]
                                         │
                                         ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │ CAMADA 1: PLANO DE CONTROLE ZERO-OUTPUT & BORDA LOCAL (GTX 1060 + Laya S1)  │
 │ • Guarda Determinística (<1 ms) -> Laya S1 (:8192, mmBERT 322M CPU, ~33 ms) │
 │ • Cloud Control Plane: gemini-decision-1 (POST /v1beta/decisions, 262K tok, │
 │   1..1.000 perguntas noul [0.01,0.99] / choice UTF-8 / score, $0.10/1M in)  │
 │ • Borda Rápida: gemini-3.5-flash-lite ($0.30/$2.50, minimal), Ollama CUDA0   │
 │   (incluindo functiongemma:270m para tool-calling) e llama.cpp 1.0 (b12651)  │
 └──────────────────────────────────────┬──────────────────────────────────────┘
                                        │
                                        ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │ CAMADA 2: EXECUÇÃO AGÊNTICA, TOOL RETRIEVAL, A2UI 1.0 & FILE SLICING        │
 │ • Primário Agêntico: Gemini 4 Hydrogen ($1.50/$7.50 Std | $0.75/$3.75 Flex) │
 │   e Gemini 3.8 Flash (Low/Med/High no App; $0.75/$3.75 -> $1.50/$7.50 01/01)│
 │ • Antigravity 2.35.1 Orchestrator: Argon/Carbon/Neon/Claude Opus 5.5       │
 │   orquestram -> Hydrogen/Sonnet 5.5 executam; Devin Next SWE 2.0/1.7       │
 │ • UI & MCP: Google A2UI 1.0 + Stitch MCP + AI Studio + Shared Gateway :8933 │
 └──────────────────────────────────────┬──────────────────────────────────────┘
                                        │
                                        ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │ CAMADA 3: RACIOCÍNIO FORMAL, PMev & GRAFOS ULTRA-LONGOS (256K–1M)           │
 │ • Titular: Gemini 4 Neon ($3/$15 Std | $1.50/$7.50 Flex; AI Pro flat-fee)   │
 │   Líder RiemannBench (84.0% > Carbon 80.0%) e GraphWalks 95.2%, xhigh       │
 │ • Ápice Cirúrgico: Gemini 4 Carbon/Argon ($2/$10 até 30/11 -> $4/$20 01/12),│
 │   GPT-6.0 Sol ($2/$10), Claude Opus 5.5 ($4/$20), GPT-6 Astra (low/medium)  │
 └──────────────────────────────────────┬──────────────────────────────────────┘
                                        │
                                        ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │ CAMADA 4: IMPLICIT CACHING, LONG DECODE (1M) & FINOPS BRASIL                │
 │ • Gemini 4 / Interactions API: Implicit Caching only (95% off; prefixo min  │
 │   4.096 tokens; delta incremental >= 2.050 tokens; Explicit Cache -> HTTP400│
 │ • Long Decode até 1.048.576 - input (background=True / automatic_continuation)│
 │ • FinOps BR: AI Pro (R$ 96,99) + API Tier 1/2 Flex/Batch + Decision 1       │
 └─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. HARDWARE MEDIDO, SPLIT-VRAM & BARRAMENTO MCP

- **Workstation Local (`RAPHAEL\rapha`):** Intel Core i9-9900K (8C/16T), 32 GB DDR4, Windows Build `26300.10075` (Sandbox AppContainer nativo do Antigravity `2.35.1` ativo).
- **Split-VRAM (`GTX 1060 6GB` + `Intel UHD Graphics 630`):**
  - `NVIDIA GeForce GTX 1060 6GB` (`sm_61` Pascal, Driver `582.78`, CUDA `13.0/12.4`, PL `140W`, **`5,1 GiB` livres no boot**, `CUDA Sysmem Fallback = Off`): dedicada exclusivamente a `ollama.exe serve` (`:11434`, `ctx=8192`, `q8_0`, `OLLAMA_MAX_LOADED_MODELS=1`) e `llama.exe serve` (`:9931`, `K=q8_0`, `V=q4_0`).
  - `Intel UHD Graphics 630` (`31.0.101.2145`): absorve `chrome.exe`, `Antigravity.exe` e `msedgewebview2.exe` (`GpuPreference=1`).
  - **Assimetria CUDA vs. Vulkan na Pascal (`llama-bench b12651`):** `CUDA0` entrega **`2.347,79 tok/s`** em prefill (**`3,49x` Vulkan**) para RAG/código; `Vulkan0` entrega `57,70 tok/s` em decode (`+18,1%` sobre CUDA).
  - **Frota local enxuta (`<= 5,1 GiB`):** `functiongemma:270m` (`300 MB`, tool calling), `embeddinggemma-2:270m` (`303 MB`, MRL `512d` no LanceDB), `qwen2.5-coder:0.5b/1.5b`, `translategemma:4b` (`3,3 GB`), `qwen3.5:4b` (`3,3 GB`), `gemma4:e2b` (`4,6 GB`, `CHICO_S1_MULTISCRIPT_MODEL`), `qwen2.5-coder:7b` Q4 (`4,7 GB`) e catálogo `llama.cpp 1.0` (`b12651`, router `:9931`, incluindo Gemma 4 `e4b` destilado com `draft-mtp`, Qwen Coder `1.5B-Instruct`, `G9v3-3B`, `Ling-3.0-tiny`, `MiniCPM5-1B`, `LFM3-Omni-2B`). Modelos `>= 6,6 GB` (`gemma4:e4b`, `12b`, `qwen3.8:27b`) não rodam em `100% GPU` nos 6 GB.
  - **Laya S1 (`0.5.4`) & TimesFM 2.5:** Executam em CPU (`torch 2.14.1+cpu`), consumindo **0 MiB de VRAM**.
- **Barramento MCP (Model Context Protocol) & WebMCP:**
  - **Shared MCP Gateway (`127.0.0.1:8933`):** Fonte única SSE/HTTP para `exa`, `google-jules`, `chrome-devtools`, `mcp-toolbox-for-databases`, `icm-skills-router` (`enable_s1_tiebreak`), etc.
  - **WebMCP Bridge (`127.0.0.1:9225`):** Conecta-se via `cdp_cors_proxy` (`:9224`) à dupla Chrome Dev 160 (`SOTA :9222` + `Admin :9223`, `#enable-webmcp-testing` e `#prompt-api-tool-use`), com limpeza via `AbortSignal`.
  - **Tool Retrieval (`Interactions API`):** `defer_loading: true` + `{"type": "tool_search"}` mantém o payload ativo sob o **Teto Termodinâmico (`<= 25%` do budget)**.

---

## 3. DIRETRIZ ESTRUTURANTE: CAMADAS 1–4, CLIFFS E FINOPS

1. **CAMADA 1 — Plano de Controle & Borda (`Laya S1 -> gemini-decision-1`):**
   - `decide_control_plane()` empacota `route_tier`, `thinking_effort`, `needs_long_decode` e `complexity_score` em **1 único forward pass** (`$0.10/1M` input, `0` output tokens, `3x` mais barato que `3.5-flash-lite` no input; gratuito no Free Tier até `10K RPD`).
   - Chaves `choice` são ordenadas alfabeticamente em UTF-8; probabilidades `noul` operam estritamente em `[0.01, 0.99]`.
2. **CAMADA 2 — Execução Agêntica, Suite Antigravity & Ecossistema Multi-Condutor:**
   - **Antigravity Desktop `2.35.1` (`IDE 2.9.0`, `CLI 1.5.17`, `SDK v0.1.24`, `Visual Studio v1.0.261116.0`, `Zed v1.5.0 ACP`):** Orquestradores: **`Argon`**, **`Carbon`**, **`Neon`** e **`Claude Opus 5.5`**; executores: **`Hydrogen`** e **`Claude Sonnet 5.5`** (Sonnet não opera solo nem orquestra; `Opus` pode operar solo ou orquestrar; `Gemini 3.8 Flash` em `Low/Medium/High`), reduzindo `-24%` cota e `-19%` tempo no *Terminal-Bench 4.1*.
   - **Frota Multi-Condutor Harmonizada:** **Devin Next** (`SWE 2.0 Flash Medium` & `SWE 1.7 Slow`), **Codex** (`GPT-6 Luna` / `Sol` / `Terra`), **Hermes-Agent** (`Laguna :free` + roteamento `b`), **VSCode / VSCode Insiders** com Copilot, **Google A2UI 1.0** + **Stitch** (`Obsidian Analytics`) + **AI Studio**.
   - **Nota `gemini-3.1-pro-preview`:** Mantido aposentado (`autorizado=False`, `+ROI` inferior a `Hydrogen`/`Neon`).
3. **CAMADA 3 — Raciocínio Formal, PMev & Grafos 1M:**
   - `Gemini 4 Neon` (`RiemannBench 84.0%`, `GraphWalks 95.2%`, `xhigh`, incluso no AI Pro) é o titular para provas $H_1$–$H_{12}$ do PMev, Rust/WASM (`trueicm.com`) e verificação axiomática do *Manifesto OmniMaster*.
   - `Gemini 4 Carbon` (`GraphWalks 96.2%`, `RiemannBench 80.0%`) e `Argon` ficam reservados a escalonamento cirúrgico pontual (aproveitar `$2/$10` até `30/11/2026`, migrando para **Flex API `$2/$10`** após `01/12/2026`).
4. **CAMADA 4 — Implicit Caching, Long Decode, Thought Signatures & Cliffs:**
   - **Implicit Caching (`95%` off):** Prefixo mínimo de **`4.096` tokens** no Gemini 4 e 3.x (`2.048` apenas no 2.5); delta incremental mínimo de **`2.050` tokens** por turno no Gemini 4 para evitar reprocessamento da cauda.
   - **Long Decode (`1.048.576 - input`):** `background=True` ou `automatic_continuation=True` (no REST sem streaming, `Carbon/Argon` quebram hops em `32.768` vs. `65.536` no `Neon/Hydrogen`). Em modo *stateless*, reenviar intactos blocos `thought` **e** assinaturas de ferramentas nativas.
   - **Cliffs de Preço & Depreciação:** `01/12/2026` (`Carbon/Argon` `$2/$10 -> $4/$20`; `2.5-pro -> 3.8-flash`; `2.5-flash -> 3.5-flash-lite`); `03/12/2026` (`omni-1.1 -> omni-1.2`); `01/01/2027` (`3.8-flash` `$0.75/$3.75 -> $1.50/$7.50`).
   - **FinOps BR:** `Google AI Pro` (`R$ 96,99/mês`, líquido `~US$ 6,70` após `$10` GCP) atinge *break-even* em `~3` tarefas pesadas de `Neon`/mês; manter `AI Pro` + `API Tier 1/2` (`Flex/Batch` + `Decision 1`) captura ~98% da capacidade do `AI Ultra` (`R$ 779,90/mês`) por `<30%` do custo.

---

_Documento canônico indexado e aprovado sob Soberania Tier 0 de Raphael Vitoi._
