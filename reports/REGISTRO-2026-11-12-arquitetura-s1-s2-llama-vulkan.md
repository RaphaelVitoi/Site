---
id: registro-2026-11-12-arquitetura-s1-s2-llama-vulkan
tipo: registro
escopo: Site -- arquitetura System-1 (Laya->gemini-decision-1, pool decision) + System-2 local-first (Ollama tiers + llama.cpp Vulkan Qwen3.6-35B-A3B-MTP via llama-swap) + evolucao Stitch Rapid
ecossistema: nexus-sota
autor: Devin (SWE-2 Flash) <158243242+devin-ai-integration[bot]@users.noreply.github.com>
criado_em: '2026-11-12T03:10:00-03:00'
atualizado_em: '2026-11-12T03:10:00-03:00'
classes:
  - interno
  - medido
  - governanca
config_medida:
  congelada_em: '2026-11-12'
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data: '2026-11-12'
caminhos:
  - data/engine_capabilities.json
  - docs/triad/stitch_agent.md
  - engine/stitch_bridge.py
  - llm/decision_pool.py
  - llm/gemini_decisions.py
  - llm/system2_local.py
  - reports/REGISTRO-2026-11-12-arquitetura-s1-s2-llama-vulkan.md
  - scripts/ops/Start-LlamaVulkan.ps1
  - tests/test_decision_pool.py
  - tests/test_gemini_decisions.py
  - tests/test_stitch_bridge.py
  - tests/test_system2_local.py
revisoes_de_ancora:
- registro: auditoria-2026-09-24-laya-multilingual-s1
  caminhos:
  - data/engine_capabilities.json
  parecer: 'Revisao 2026-11-12 (Devin SWE-2 Flash): engine_capabilities.json: alteracao aditiva - novos engine_id para o eixo Decisions/System-1/System-2/llama.cpp Vulkan com numeros de benchmark medidos em 2026-11-12 na RX 570 Polaris 8GB; nenhum engine_id, family, contrato ou rotulo existente removido ou redefinido.'
- registro: handoff-2026-09-13-integracao-de-engines-wasm-e-economia-de-gate
  caminhos:
  - data/engine_capabilities.json
  parecer: 'Revisao 2026-11-12 (Devin SWE-2 Flash): engine_capabilities.json: alteracao aditiva - novos engine_id para o eixo Decisions/System-1/System-2/llama.cpp Vulkan com numeros de benchmark medidos em 2026-11-12 na RX 570 Polaris 8GB; nenhum engine_id, family, contrato ou rotulo existente removido ou redefinido.'
- registro: handoff-2026-09-24-laya-gpu-homologacao-e-solver-bridge
  caminhos:
  - data/engine_capabilities.json
  parecer: 'Revisao 2026-11-12 (Devin SWE-2 Flash): engine_capabilities.json: alteracao aditiva - novos engine_id para o eixo Decisions/System-1/System-2/llama.cpp Vulkan com numeros de benchmark medidos em 2026-11-12 na RX 570 Polaris 8GB; nenhum engine_id, family, contrato ou rotulo existente removido ou redefinido.'
- registro: handoff-2026-09-24-laya-multilingual-s1-integracao
  caminhos:
  - data/engine_capabilities.json
  parecer: 'Revisao 2026-11-12 (Devin SWE-2 Flash): engine_capabilities.json: alteracao aditiva - novos engine_id para o eixo Decisions/System-1/System-2/llama.cpp Vulkan com numeros de benchmark medidos em 2026-11-12 na RX 570 Polaris 8GB; nenhum engine_id, family, contrato ou rotulo existente removido ou redefinido.'
- registro: handoff-2026-11-08-otimizacao-backend-e-integridade-sota
  caminhos:
  - tests/test_stitch_bridge.py
  parecer: 'Revisao 2026-11-12 (Devin SWE-2 Flash): test_stitch_bridge.py: testes estendidos para o enum medido do Stitch MCP e para os novos metodos/classificador; nenhum assert existente enfraquecido.'
- registro: plano-laya-integracao-s1s2-pmev-2026-09-20
  caminhos:
  - data/engine_capabilities.json
  parecer: 'Revisao 2026-11-12 (Devin SWE-2 Flash): engine_capabilities.json: alteracao aditiva - novos engine_id para o eixo Decisions/System-1/System-2/llama.cpp Vulkan com numeros de benchmark medidos em 2026-11-12 na RX 570 Polaris 8GB; nenhum engine_id, family, contrato ou rotulo existente removido ou redefinido.'
- registro: registro-2026-09-04-credenciais-submodulos-e-adaptador-hrc
  caminhos:
  - engine/stitch_bridge.py
  parecer: 'Revisao 2026-11-12 (Devin SWE-2 Flash): stitch_bridge.py: alteracao aditiva - MODEL_TIER_MAPPING corrigido para o enum real medido do Stitch MCP (GEMINI_3_8_FLASH/GEMINI_3_5_FLASH_LITE), quatro metodos CRUD de projeto/screen/design-system adicionados e classify_stitch_operation novo via cascata Laya->Decisions; nenhum contrato publico removido.'
- registro: registro-2026-09-04-refinamento-sota-radar-telemetria-scanner-e-mcps
  caminhos:
  - engine/stitch_bridge.py
  parecer: 'Revisao 2026-11-12 (Devin SWE-2 Flash): stitch_bridge.py: alteracao aditiva - MODEL_TIER_MAPPING corrigido para o enum real medido do Stitch MCP (GEMINI_3_8_FLASH/GEMINI_3_5_FLASH_LITE), quatro metodos CRUD de projeto/screen/design-system adicionados e classify_stitch_operation novo via cascata Laya->Decisions; nenhum contrato publico removido.'
- registro: registro-2026-09-13-contrato-de-capacidades-e-paridade-de-engines
  caminhos:
  - data/engine_capabilities.json
  parecer: 'Revisao 2026-11-12 (Devin SWE-2 Flash): engine_capabilities.json: alteracao aditiva - novos engine_id para o eixo Decisions/System-1/System-2/llama.cpp Vulkan com numeros de benchmark medidos em 2026-11-12 na RX 570 Polaris 8GB; nenhum engine_id, family, contrato ou rotulo existente removido ou redefinido.'
- registro: registro-2026-09-24-blindagem-ascii-e-harmonizacao-scripts
  caminhos:
  - engine/stitch_bridge.py
  parecer: 'Revisao 2026-11-12 (Devin SWE-2 Flash): stitch_bridge.py: alteracao aditiva - MODEL_TIER_MAPPING corrigido para o enum real medido do Stitch MCP (GEMINI_3_8_FLASH/GEMINI_3_5_FLASH_LITE), quatro metodos CRUD de projeto/screen/design-system adicionados e classify_stitch_operation novo via cascata Laya->Decisions; nenhum contrato publico removido.'
- registro: registro-2026-09-24-harmonizacao-arquitetura-hibrida-vulkan-pytorch
  caminhos:
  - data/engine_capabilities.json
  parecer: 'Revisao 2026-11-12 (Devin SWE-2 Flash): engine_capabilities.json: alteracao aditiva - novos engine_id para o eixo Decisions/System-1/System-2/llama.cpp Vulkan com numeros de benchmark medidos em 2026-11-12 na RX 570 Polaris 8GB; nenhum engine_id, family, contrato ou rotulo existente removido ou redefinido.'
- registro: registro-2026-09-24-laya-gpu-homologacao-e-solver-bridge
  caminhos:
  - data/engine_capabilities.json
  parecer: 'Revisao 2026-11-12 (Devin SWE-2 Flash): engine_capabilities.json: alteracao aditiva - novos engine_id para o eixo Decisions/System-1/System-2/llama.cpp Vulkan com numeros de benchmark medidos em 2026-11-12 na RX 570 Polaris 8GB; nenhum engine_id, family, contrato ou rotulo existente removido ou redefinido.'
- registro: registro-2026-09-24-laya-multilingual-s1-integracao
  caminhos:
  - data/engine_capabilities.json
  parecer: 'Revisao 2026-11-12 (Devin SWE-2 Flash): engine_capabilities.json: alteracao aditiva - novos engine_id para o eixo Decisions/System-1/System-2/llama.cpp Vulkan com numeros de benchmark medidos em 2026-11-12 na RX 570 Polaris 8GB; nenhum engine_id, family, contrato ou rotulo existente removido ou redefinido.'
- registro: registro-2026-10-18-resolucao-sonarqube-e-saneamento-global
  caminhos:
  - engine/stitch_bridge.py
  parecer: 'Revisao 2026-11-12 (Devin SWE-2 Flash): stitch_bridge.py: alteracao aditiva - MODEL_TIER_MAPPING corrigido para o enum real medido do Stitch MCP (GEMINI_3_8_FLASH/GEMINI_3_5_FLASH_LITE), quatro metodos CRUD de projeto/screen/design-system adicionados e classify_stitch_operation novo via cascata Laya->Decisions; nenhum contrato publico removido.'
- registro: registro-2026-10-28-fortalecimento-e-harmonizacao-sota-triade-stitch-e-exa
  caminhos:
  - engine/stitch_bridge.py
  - tests/test_stitch_bridge.py
  parecer: 'Revisao 2026-11-12 (Devin SWE-2 Flash): stitch_bridge.py: alteracao aditiva - MODEL_TIER_MAPPING corrigido para o enum real medido do Stitch MCP (GEMINI_3_8_FLASH/GEMINI_3_5_FLASH_LITE), quatro metodos CRUD de projeto/screen/design-system adicionados e classify_stitch_operation novo via cascata Laya->Decisions; nenhum contrato publico removido. test_stitch_bridge.py: testes estendidos para o enum medido do Stitch MCP e para os novos metodos/classificador; nenhum assert existente enfraquecido.'
- registro: registro-2026-10-31-refatoracao-cfr-tipagem-e-higiene
  caminhos:
  - tests/test_stitch_bridge.py
  parecer: 'Revisao 2026-11-12 (Devin SWE-2 Flash): test_stitch_bridge.py: testes estendidos para o enum medido do Stitch MCP e para os novos metodos/classificador; nenhum assert existente enfraquecido.'
- registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
  caminhos:
  - engine/stitch_bridge.py
  parecer: 'Revisao 2026-11-12 (Devin SWE-2 Flash): stitch_bridge.py: alteracao aditiva - MODEL_TIER_MAPPING corrigido para o enum real medido do Stitch MCP (GEMINI_3_8_FLASH/GEMINI_3_5_FLASH_LITE), quatro metodos CRUD de projeto/screen/design-system adicionados e classify_stitch_operation novo via cascata Laya->Decisions; nenhum contrato publico removido.'
- registro: registro-2026-11-08-integracao-sota-triade-stitch-exa-jules
  caminhos:
  - docs/triad/stitch_agent.md
  - engine/stitch_bridge.py
  - tests/test_stitch_bridge.py
  parecer: 'Revisao 2026-11-12 (Devin SWE-2 Flash): stitch_agent.md: documentacao atualizada no mesmo escopo aditivo do bridge (enum vigente, tools novas, cascata de classificacao); nenhuma instrucao contradita. stitch_bridge.py: alteracao aditiva - MODEL_TIER_MAPPING corrigido para o enum real medido do Stitch MCP (GEMINI_3_8_FLASH/GEMINI_3_5_FLASH_LITE), quatro metodos CRUD de projeto/screen/design-system adicionados e classify_stitch_operation novo via cascata Laya->Decisions; nenhum contrato publico removido. test_stitch_bridge.py: testes estendidos para o enum medido do Stitch MCP e para os novos metodos/classificador; nenhum assert existente enfraquecido.'
- registro: registro-2026-11-08-otimizacao-backend-sonarlint-pyright-e-headings
  caminhos:
  - tests/test_stitch_bridge.py
  parecer: 'Revisao 2026-11-12 (Devin SWE-2 Flash): test_stitch_bridge.py: testes estendidos para o enum medido do Stitch MCP e para os novos metodos/classificador; nenhum assert existente enfraquecido.'
pendencias_resolvidas: []
verificado:
  - 'pytest tests/test_gemini_decisions.py tests/test_stitch_bridge.py tests/test_decision_pool.py tests/test_system2_local.py: 70+ testes verdes'
  - 'pytest tests/test_engine_capability_registry.py: 4/4 verdes; engine_capabilities.json parseia'
  - 'ruff check e pyright nos modulos alterados: 0 erros'
  - 'Smoke live Decisions API (gemini-decision-1 via pool decision): acao_stitch=generate_screen conf~0.90, latencia ~2.2s'
  - 'Smoke live Laya treinada: generate_screen conf~0.98 local, zero-download'
  - 'Smoke live system2_local tier=moe via llama-swap :8080: resposta correta, engine=llama-cpp-vulkan'
  - 'GGUF Qwen3.6-35B-A3B-MTP UD-Q4_K_XL: SHA-256 55983c5a... confere com x-linked-etag do HF'
  - 'llama-bench RX 570: pp512=46.84 tg128=6.72 baseline; vencedor 13.45 t/s com draft-mtp n-max4 p-min0.75 (draft acceptance ~94%)'
  - 'EAGLE3 draft (EntityDeletr Q5_K_M): medido 7.21 t/s com 43% acceptance - pior que MTP, dominio COCO-caption'
  - 'ik_llama.cpp CPU-only (Thireus b5658 haswell-avx2): tg128=7.84 vs ggml-cpu 5.34 (+47%), pp512=70.47 vs 58.49; sem build Vulkan prebuilt'
  - 'llama-swap v272 instalado e verificado: /v1/models lista alias, chat completion real dispara spawn do upstream'
nao_verificado:
  - 'Chaves DECISION_API_1/2 coladas em chat: tratadas como comprometidas, rotacao/revogacao no AI Studio fica a cargo do operador'
  - 'ik_llama.cpp sem backend Vulkan prebuilt para Windows: benchmark limitado ao caminho CPU; build proprio exige toolchain MSVC ausente'
  - 'EAGLE-3 draft treinado em COCO captions: acceptance 43% no nosso workload PT-BR; sem retreino nao substitui o head MTP nativo'
  - 'LiteLLM proxy: NAO instalado (duplicaria roteamento in-process dos pools); opcional se um endpoint OpenAI unificado for necessario'
  - 'HKLM das vars GCP/pool decision: gravado com privilegio de admin nesta sessao; verificacao em novo logon fica pendente'
  - 'Suite pytest completa: executada pelo hook pre-commit/pre-push deste commit'
---

# Arquitetura System-1/System-2: Gemini Decision 1 + Stitch + Laya + Qwen local Vulkan

Evolucao aditiva do eixo de decisao e inferencia local do ecossistema, medida em
hardware real (i9-9900K / 32GB RAM / RX 570 Polaris gfx803 8GB VRAM / Win11):

## System-1 (decisoes baratas)

- `llm/decision_pool.py` (novo): pool dedicado `decision` com DECISION_API_1/2
  em HKCU+HKLM, round-robin, circuit breaker (401/403 revoga, 429 cooldown),
  fingerprints sha8 sem vazar chave.
- `llm/gemini_decisions.py`: cascata Laya local -> gemini-decision-1 com
  failover por chave do pool; schema `noul` corrigido para
  `true_description`/`false_description` (verificado live).
- `engine/stitch_bridge.py`: MODEL_TIER_MAPPING para o enum real medido do
  Stitch MCP (GEMINI_3_8_FLASH / GEMINI_3_5_FLASH_LITE), 4 metodos CRUD
  adicionados, `classify_stitch_operation` via cascata.

## System-2 (geracao local-first)

- `llm/system2_local.py`: tiers fast/balanced/deep/code via Ollama + novo
  tier `moe` -> llama-swap :8080 -> Qwen3.6-35B-A3B-MTP (~13 t/s medido);
  fallback Ollama deep -> gemini-3.5-flash-lite.
- `scripts/ops/Start-LlamaVulkan.ps1`: launcher canonico llama.cpp Vulkan.
- llama-swap v272 em ~/.gemini/tools/llama-swap (fora do repo): spawn
  on-demand + ttl 600s para o GGUF de 21GB.

## Benchmarks medidos (RX 570 8GB)

| Config | pp t/s | tg/gen t/s |
|---|---|---|
| llama.cpp -ncmoe 41 baseline | 46.84 | 6.72 |
| + draft-mtp n-max4 p-min0.75, sem moe-cache | - | **13.45** (~94% acc) |
| + moe-cache-mib 3072 | - | 7.04 (prejudicial, medido) |
| + draft-eagle3 (draft COCO 517MB) | - | 7.21 (43% acc) |
| ik_llama.cpp CPU-only t8 | 70.47 | 7.84 (+47% vs ggml-cpu) |
| ggml-cpu puro t8 | 58.49 | 5.34 |

## Veredito de curadoria

- Vencedor: llama.cpp Vulkan upstream + draft-mtp nativo do GGUF.
- --moe-cache-mib e offload parcial de experts: contraproducentes na Polaris.
- ik_llama.cpp: +47% no caminho CPU puro, mas sem Vulkan prebuilt; manter como
  referencia caso se busque build MSVC proprio.
- Strata/Avalon/ROCm/CUDA/vLLM/ktransformers/WSL2: NO-GO para gfx803.
- EAGLE-3: draft existe para o modelo, mas dominio de treino limita acceptance.

## Reconciliacao de ancoras

18 registros vigentes ancorados nos caminhos tocados receberam
`revisoes_de_ancora` individual com parecer de revisao aditiva.
