---
id: review-2026-11-13-ecossistema-llamacpp-strata-avalon
tipo: review
escopo: Site
autor: Devin (SWE-2 Flash) [Tier 1]
criado_em: "2026-11-13"
target: arquitetura-llamacpp-strata-avalon
data: "2026-11-13"
protocolo: egm-review (Goldfish, 5 fases)
condutor: Devin (SWE-2 Flash) [Tier 1]
status: concluido
verificado:
  - "Upstream C:\\Users\\rapha\\Strata v0.1.39 inspecionado contra as claims
    documentadas (sem Vulkan, CUDA/HIP 12GB+, Polaris/gfx803 sem suporte)"
  - "Caminho quente auditado no codigo real: llm/system2_local.py,
    llm/strata_client.py, scripts/ops/strata_local_node.py, llm/providers.py,
    llm/routing.py, llm/orchestrator.py, engine/llm_api.py"
nao_verificado:
  - "Execucao real do servidor Strata upstream neste hardware (conclusao NO-GO
    derivada de codigo e requisitos, nao de tentativa de boot)"
referencias_nao_resolviveis:
  - scripts/ops/Start-StrataNode.ps1
  - llm/strata_client.py
  - scripts/ops/strata_local_node.py
  - tests/test_strata_client.py
  - .agents/skills/strata-inference-engine/SKILL.md
  - config/strata/strata-config.template.json
  - llama-swap/config.yaml
  - tools/llama-swap/config.yaml
---

# Goldfish Review Report — Ecossistema llama.cpp / Strata / Avalon

**Alvo (composto):** `.agents/skills/strata-inference-engine/SKILL.md`,
`reports/REGISTRO-2026-11-12-arquitetura-s1-s2-llama-vulkan.md`,
`data/engine_capabilities.json` (entries `system2-local-ollama`,
`llama-cpp-vulkan`), `config/strata/strata-config.template.json`,
`scripts/ops/Start-StrataNode.ps1`, `tools/llama-swap/config.yaml` — verificados
contra o código real (`llm/system2_local.py`, `llm/strata_client.py`,
`scripts/ops/strata_local_node.py`, `llm/providers.py`, `llm/routing.py`,
`llm/orchestrator.py`, `engine/llm_api.py`, `scripts/ops/Start-LlamaVulkan.ps1`)
e o upstream `C:\Users\rapha\Strata` (v0.1.39).

**Hardware medido:** i9-9900K / 32 GB RAM / AMD RX 570 Polaris gfx803 **8 GB**
VRAM / Windows 11 / sem ROCm.

## Status dos Reviewers

| Persona                              | Fase | Status                          |
| :----------------------------------- | :--- | :------------------------------ |
| egm-zoom_out                         | 1    | completed                       |
| egm-comprehension                    | 2    | completed                       |
| egm-design (A e B, independentes)    | 3    | completed ×2                    |
| egm-codebase_details                 | 3    | completed                       |
| egm-structural                       | 3    | completed                       |
| egm-style                            | 3    | completed                       |
| egm-inventive_catalyst               | 3    | completed                       |
| egm-implementation_readiness         | 3    | completed                       |
| egm-zoom_out (intermediário)         | 4    | completed                       |
| egm-implementation_readiness (final) | 5    | completed — **GO condicionado** |

## Veredito

A arquitetura que **funciona e está medida** é mínima e correta: Ollama tiers
(`fast/balanced/deep/code`) + llama.cpp Vulkan via llama-swap `127.0.0.1:8080`
(Qwen3.6-35B-A3B-MTP, 13.45 t/s medido) + System-1 decision pool. **Todo o eixo
Strata é passivo morto:** o upstream é CUDA/HIP, exige GPU 12 GB+ VRAM e não tem
Vulkan — NO-GO já medido no próprio registro de 2026-11-12 — e o que o launcher
default sobe é um shim Python que fabrica telemetria e se apresenta como "Strata
MoE 125B".

Problema de altitude real (Fase 4): **dois roteadores de LLM divergentes**
(`llm/orchestrator.py` quente vs `engine/llm_api.py` paralelo) e **roteamento
por substring** que sequestra o tier Ollama legítimo `qwen3.8:27b` para a
porta 8080.

## Findings Priorizados

### B1 — Shim `strata_local_node.py` fabrica inferência e telemetria — Blocker

- **Lente:** design ×2, codebase_details, TRIZ, style, readiness
- **Escopo:** `scripts/ops/strata_local_node.py` inteiro; consumido por
  `Start-StrataNode.ps1` (L144-148), `strata_client.py`, `providers.py`,
  `engine/llm_api.py`
- **Descrição:** surrogate `qwen2.5-coder:1.5b` via Ollama; fallback
  `_build_native_reply` fabrica resposta canned com `tps=48.5` fixo, contagens
  `len//4`, `/health` com `real_inference:true` e
  `model:"ISTA-DASLab-Coder-125B"` incondicional, `/metrics` com
  `expert_hit_rate:0.96` fixo; `/v1/vram`, `/load`, `/unload` são no-ops;
  `HTTPServer` single-threaded contradiz `--parallel 2`.
- **Recomendação:** deletar (git preserva histórico). Destino: Fase C.

### B2 — Colisão de porta :8080 (e :8081) sem dono de identidade — Blocker

- **Lente:** todas
- **Escopo:** `llama-swap/config.yaml`, `strata_client.py:42`,
  `providers.py:298`, `system2_local.py:49`, `Start-StrataNode.ps1:40`,
  `Start-LlamaServer.ps1`, `Start-LlamaVulkanEngine.ps1`, `providers.py` Splash
  8081 vs `local_llama_client.py` G9 8081
- **Descrição:** llama-swap, Strata real, shim e launchers manuais disputam
  `127.0.0.1:8080`; health checks aceitam qualquer HTTP 200 e não provam
  identidade; `meta.engine`/`ENGINE_STRATA_VERSION` são constantes.
- **Recomendação:** 8080 = llama-swap, exclusivo. Remover claimants Strata;
  endurecer health checks para validar payload/modelo.

### B3 — Strata upstream NO-GO em gfx803; SKILL.md descreve engine inexistente — Blocker

- **Lente:** zoom_out, design ×2, codebase_details, structural
- **Escopo:** `SKILL.md` (todo), upstream `C:\Users\rapha\Strata`
- **Descrição:** upstream exige 12 GB+ VRAM, CUDA/HIP, sem Vulkan; gfx803
  ausente de `setup.py` AMD_ARCHS. SKILL.md inventa offload "Vulkan/RAM/CPU",
  envs `STRATA_*` (parte Linux-only/inexistente) e pipeline Qwen2.5-surrogate
  que o upstream não tem. Contradiz o registro NO-GO do mesmo dia.
- **Recomendação:** aposentar skill/runbook; clone `~/Strata` vira referência
  inerte.

### B4 — Roteamento por substring corrompe modelo em produção — Blocker

- **Lente:** codebase_details, readiness, zoom_out F4
- **Escopo:** `engine/llm_api.py:640-642`
  (`"strata" in model_l or "qwen3.8" in model_l → "strata"`);
  `routing.py:317-318`; `orchestrator.py:348-352`;
  `providers.py:295-370,455-557`
- **Descrição:** `qwen3.8:27b` (Ollama, tier deep do System-2) é desviado para
  `:8080`; nomes `strata-*` recebem resposta do llama-swap rotulada
  `engine="Strata-v0.1.39"` — proveniência falsa. `orchestrator` injeta key
  dummy `"strata-local-key"`.
- **Recomendação:** remover provider `strata` inteiro; guarda explícita
  `"strata" in model_l → ("ollama", model)` (falha honesta); `qwen3.8*` cai no
  branch Ollama correto. Mudança observável → aprovada pelo Tier 0 em
  2026-11-13.

### M1 — Strata ausente de `engine_capabilities.json`; registry com dangling refs — Major

- **Escopo:** `data/engine_capabilities.json` L4, L524, L1300, L1306, L1367,
  L1372
- **Descrição:** sem `engine_id` para Strata/shim; 2 `fallback_engine_id`
  dangling (`gemini-3.5-flash-lite`, `analytic-linear-forecast` — são modelos,
  não engines); `implementation_level:"trained-model"` para runtime;
  `updated_at` stale; termo órfão "avalon".
- **Recomendação:** corrigir na Fase B (ver plano).

### M2 — `system2_local.py` é ilha sem consumidor de produção — Major

- **Escopo:** `llm/system2_local.py` vs `llm/orchestrator.py`
- **Descrição:** tiers+moe+fallbacks bem desenhados, mas o caminho quente
  (`orchestrator.call_llm_api`) nunca o invoca; `consumer_paths`/`api_routes:[]`
  no registry; modelos Ollama com `consumers:[]`.
- **Recomendação (aprovada):** manter o módulo; endurecer `llama_server_online`
  para validar payload de `/health`/`/v1/models`; decisão de wiring fica como
  pendência separada.

### M3 — Dois roteadores LLM divergentes — Major

- **Escopo:** `llm/orchestrator.py` (quente: agents/) vs `engine/llm_api.py`
  (paralelo: engine/cognitive.py)
- **Descrição:** resolvem provider independentemente; já divergem no tratamento
  de `strata`. Fora do escopo desta poda, mas registrado como dívida
  arquitetural.
- **Recomendação:** declarar `llm/orchestrator.py` canônico; `engine/llm_api.py`
  deve delegar — item para plano futuro.

### M4 — Superfície ops/skills/dashboard aponta para serviço morto — Major

- **Escopo:** `scripts/cli/nexus.py` L758/L1121/L2622-2660,
  `get_dashboard_telemetry.py` L63-69, `Start-NexusDashboard.ps1` L136/L224,
  `Setup-NexusProfile.ps1` L334-343, `dashboard.ps1` L70, `nexus.ps1` L19,
  `docs/SCRIPTS_E_COMANDOS_DASHBOARD.md` L36-37, `invoke_scripts_dashboard.ps1`
  L45-46, `.agents/skills.json`, `data/agents_manifest.json`,
  `.claude/agents/chico.md`, `tests/test_governanca_skills.py`,
  `tests/test_cli_nexus.py`
- **Descrição:** probes reportam "Strata 125B MoE ONLINE" medindo qualquer
  listener na 8080 (hoje = llama-swap); comandos `ops strata`/`start-strata`
  instaláveis.
- **Recomendação:** renomear probe para `llama_moe_qwen36` e remover
  comandos/skill Strata.

### M5 — Testes cristalizam a ficção — Major

- **Escopo:** `tests/test_strata_client.py` (154 linhas, assert
  `engine=="Strata-v0.1.39"`); zero cobertura de `strata_local_node.py`;
  `test_system2_local.py` assevera `meta.engine=="llama-cpp-vulkan"` sem provar
  quem respondeu.
- **Recomendação:** deletar `test_strata_client.py`; ajustar `test_cli_nexus.py`
  e `test_governanca_skills.py`.

### N1 — RX 570 documentada como 4 GB vs 8 GB medido — Nit

- **Escopo:** `SKILL.md:27`, `Start-StrataNode.ps1:111`,
  `strata_local_node.py:51` — moot após deleção; medida canônica 8 GB.

### N2 — `strata-config.template.json` órfão e schema incompatível — Nit

- **Escopo:** `~/.gemini/config/strata/strata-config.template.json` — nada o
  consome; campos não correspondem ao runconfig upstream. Remover junto com o
  eixo.

### N3 — Flags divergentes llama-swap (`-c 8192`) vs launcher manual

(`-c 32768`) e 3-4 políticas de unload sem coordenador — Nit/ Major secundário;
registrar como dívida, fora do escopo Strata.

### N4 — "Avalon" termo órfão — Nit

- **Escopo:** `engine_capabilities.json:1367`, REGISTRO L176 — única ocorrência
  sem definição; resolver na correção do registry.

## Plano de implementação (aprovado pelo Tier 0 em 2026-11-13)

**Decisões D1–D4:** D1 deletar shim (git preserva); D2 manter
`system2_local.py` + endurecer health check; D3 remover branch `strata` e
guardar `strata*→ollama`; D4 8080 = llama-swap exclusivo.

- **Fase A** — desligar provider/roteamento: `llm/providers.py`,
  `llm/orchestrator.py`, `llm/routing.py`, `engine/llm_api.py`,
  `llm/local_engine_client.py` (docstring), `llm/antigravity_sdk_bridge.py`
  (docstring), deletar `tests/test_strata_client.py`.
- **Fase B** — superfície ops/skills/registry: `nexus.py`,
  `get_dashboard_telemetry.py`, `Start-NexusDashboard.ps1`,
  `Setup-NexusProfile.ps1`, `dashboard.ps1`, `nexus.ps1`, docs e routines,
  `.agents/skills.json`, `agents_manifest.json`, `.claude/agents/chico.md`,
  `test_governanca_skills.py`, `test_cli_nexus.py`, `system2_local.py` (health
  check), `engine_capabilities.json`.
- **Fase C** — remoção física: deletar `llm/strata_client.py`,
  `scripts/ops/strata_local_node.py`, skill dir; fora do repo mover
  `~/.gemini/scripts/ops/Start-StrataNode.ps1` para quarentena e remover
  `~/.gemini/config/strata/strata-config.template.json`.
- **Verificação:** ruff/pyright focado → pytest focado (`test_cli_nexus`,
  `test_governanca_skills`, `test_engine_capability_registry`,
  `test_system2_local`, `test_roteamento_especialidade`,
  `test_antigravity_sdk_bridge`) → smoke `qwen3.8:27b→ollama`,
  `nexus ops --help` sem `strata`.
- **Gates SOTA:** novo REGISTRO com `revisoes_de_ancora` para os registros que
  ancoram os caminhos tocados; suíte completa só no checkpoint pré-commit.

## Destino SOTA dos findings

- B1–B4, M1–M5, N1–N4 → **plano de implementação aprovado** (Fases A–C).
- M3 (dois roteadores) e N3 (flags/unload) → **pendencias/** (dívida
  arquitetural separada, fora do escopo Strata).
- Decisão de wiring de `system2_local` no orchestrator → **pendencia** para o
  Tier 0.
