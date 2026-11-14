---
id: registro-2026-11-14-llama-cpp-b12387-router-9931
tipo: registro
escopo: Site -- integracao do router llama.cpp 1.0 (:9931 / b12375) e binarios Vulkan b12387 no ecossistema
  local
ecossistema: nexus-sota
autor: Gemini 4 Argon <noreply@google.com>
criado_em: '2026-11-14T20:41:00-03:00'
atualizado_em: '2026-11-14T20:41:00-03:00'
classes:
  - interno
  - medido
  - infraestrutura
  - governanca
config_medida:
  congelada_em: '2026-11-14'
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data: '2026-11-14'
caminhos:
  - core/subagents_mesh.py
  - data/engine_capabilities.json
  - engine/llama_cpp/LICENSE-LLVM-OpenMP
  - engine/llama_cpp/daemon_watchdog.ps1
  - engine/llama_cpp/ggml-base.dll
  - engine/llama_cpp/ggml-cpu-alderlake.dll
  - engine/llama_cpp/ggml-cpu-cannonlake.dll
  - engine/llama_cpp/ggml-cpu-cascadelake.dll
  - engine/llama_cpp/ggml-cpu-cooperlake.dll
  - engine/llama_cpp/ggml-cpu-haswell.dll
  - engine/llama_cpp/ggml-cpu-icelake.dll
  - engine/llama_cpp/ggml-cpu-ivybridge.dll
  - engine/llama_cpp/ggml-cpu-piledriver.dll
  - engine/llama_cpp/ggml-cpu-sandybridge.dll
  - engine/llama_cpp/ggml-cpu-sapphirerapids.dll
  - engine/llama_cpp/ggml-cpu-skylakex.dll
  - engine/llama_cpp/ggml-cpu-sse42.dll
  - engine/llama_cpp/ggml-cpu-x64.dll
  - engine/llama_cpp/ggml-cpu-zen4.dll
  - engine/llama_cpp/ggml-rpc.dll
  - engine/llama_cpp/ggml-vulkan.dll
  - engine/llama_cpp/ggml.dll
  - engine/llama_cpp/llama-batched-bench.exe
  - engine/llama_cpp/llama-bench.exe
  - engine/llama_cpp/llama-cli.exe
  - engine/llama_cpp/llama-common.dll
  - engine/llama_cpp/llama-completion.exe
  - engine/llama_cpp/llama-fit-params.exe
  - engine/llama_cpp/llama-gemma3-cli.exe
  - engine/llama_cpp/llama-gguf-split.exe
  - engine/llama_cpp/llama-imatrix.exe
  - engine/llama_cpp/llama-llava-cli.exe
  - engine/llama_cpp/llama-minicpmv-cli.exe
  - engine/llama_cpp/llama-mtmd-cli.exe
  - engine/llama_cpp/llama-mtmd-debug.exe
  - engine/llama_cpp/llama-perplexity.exe
  - engine/llama_cpp/llama-quantize.exe
  - engine/llama_cpp/llama-qwen2vl-cli.exe
  - engine/llama_cpp/llama-results.exe
  - engine/llama_cpp/llama-server.exe
  - engine/llama_cpp/llama-tokenize.exe
  - engine/llama_cpp/llama-tts.exe
  - engine/llama_cpp/llama.dll
  - engine/llama_cpp/mtmd.dll
  - engine/llama_cpp/start_vulkan_daemon.ps1
  - llm/antigravity_sdk_bridge.py
  - llm/local_engine_client.py
  - llm/local_llama_client.py
  - llm/providers.py
  - llm/routing_policy.py
  - llm/system2_local.py
  - reports/REGISTRO-2026-11-14-llama-cpp-b12387-router-9931.md
  - scripts/cli/nexus.py
  - scripts/ops/Start-LlamaVulkan.ps1
  - scripts/ops/Start-LocalLlama.ps1
  - scripts/ops/Start-NexusDashboard.ps1
  - scripts/ops/get_dashboard_telemetry.py
  - tests/test_antigravity_sdk_bridge.py
revisoes_de_ancora:
  - registro: auditoria-2026-09-03-trabalho-do-gemini-3-8-flash
    caminhos:
      - llm/routing_policy.py
    parecer: llm/routing_policy.py -- atualiza _check_provider_availability_sync para direcionar modelos
      locais sem porta dedicada 8081..8083 ao router :9931
  - registro: auditoria-2026-09-24-laya-multilingual-s1
    caminhos:
      - data/engine_capabilities.json
    parecer: data/engine_capabilities.json -- atualiza engine_id llama-cpp-vulkan para b12387 e Llama
      App 0.14.1.0 (:9931), rotas /health,/v1/models,/props,/metrics, parametros de tuning e consumidores
      ativos
  - registro: handoff-2026-09-13-integracao-de-engines-wasm-e-economia-de-gate
    caminhos:
      - data/engine_capabilities.json
    parecer: data/engine_capabilities.json -- atualiza engine_id llama-cpp-vulkan para b12387 e Llama
      App 0.14.1.0 (:9931), rotas /health,/v1/models,/props,/metrics, parametros de tuning e consumidores
      ativos
  - registro: handoff-2026-09-24-laya-gpu-homologacao-e-solver-bridge
    caminhos:
      - data/engine_capabilities.json
    parecer: data/engine_capabilities.json -- atualiza engine_id llama-cpp-vulkan para b12387 e Llama
      App 0.14.1.0 (:9931), rotas /health,/v1/models,/props,/metrics, parametros de tuning e consumidores
      ativos
  - registro: handoff-2026-09-24-laya-multilingual-s1-integracao
    caminhos:
      - data/engine_capabilities.json
    parecer: data/engine_capabilities.json -- atualiza engine_id llama-cpp-vulkan para b12387 e Llama
      App 0.14.1.0 (:9931), rotas /health,/v1/models,/props,/metrics, parametros de tuning e consumidores
      ativos
  - registro: handoff-2026-09-25-modelos-locais-saneamento-e-homeostase
    caminhos:
      - llm/local_llama_client.py
      - scripts/ops/Start-LocalLlama.ps1
    parecer: llm/local_llama_client.py -- define DEFAULT_ROUTER_PORT=9931 (PORT_TO_ROUTER_MODEL), get_engine_version,
      _probe_port_health priorizando :9931 sobre portas legadas 8081..8083 e fallback _post_chat para
      :9931; scripts/ops/Start-LocalLlama.ps1 -- prioriza Site/engine/llama_cpp/llama-server.exe (b12387),
      reporta Router Unificado 1.0 (:9931) em Show-Status, padroniza -fa on, -ctk q8_0, -ctv q4_0, -t
      8, -b 2048, -ub 512, --cache-reuse 256, --fit on, --metrics e restaura BOM UTF-8
  - registro: handoff-2026-09-30-expurgo-de-modelos-obsoletos-harmonizacao-qwen-e-calibracao
    caminhos:
      - scripts/cli/nexus.py
    parecer: scripts/cli/nexus.py -- adiciona entrada ("Llama.cpp 1.0", 9931) em _DASH_SERVICES para painel
      CLI
  - registro: handoff-2026-10-20-harmonizacao-tier1-gemini-38
    caminhos:
      - llm/routing_policy.py
    parecer: llm/routing_policy.py -- atualiza _check_provider_availability_sync para direcionar modelos
      locais sem porta dedicada 8081..8083 ao router :9931
  - registro: handoff-2026-11-14-decision1-laya-s1-s2-e-ancoras
    caminhos:
      - llm/providers.py
      - llm/system2_local.py
    parecer: llm/providers.py -- atualiza _check_local_llama_availability para usar porta padrao 9931
      (timeout 1.0s) quando o modelo nao direciona para portas dedicadas 8081..8083; llm/system2_local.py
      -- altera DEFAULT_LLAMA_BASE para :9931, adiciona _LLAMA_ROUTER_ALIASES, _LLAMA_MODEL_CACHE e _resolve_llama_router_model
      e atualiza llama_server_online e _llama_generate
  - registro: plano-laya-integracao-s1s2-pmev-2026-09-20
    caminhos:
      - data/engine_capabilities.json
      - llm/routing_policy.py
    parecer: data/engine_capabilities.json -- atualiza engine_id llama-cpp-vulkan para b12387 e Llama
      App 0.14.1.0 (:9931), rotas /health,/v1/models,/props,/metrics, parametros de tuning e consumidores
      ativos; llm/routing_policy.py -- atualiza _check_provider_availability_sync para direcionar modelos
      locais sem porta dedicada 8081..8083 ao router :9931
  - registro: registro-2026-09-05-saneamento-nexus-ollama-e-auto-diagnostico
    caminhos:
      - scripts/cli/nexus.py
    parecer: scripts/cli/nexus.py -- adiciona entrada ("Llama.cpp 1.0", 9931) em _DASH_SERVICES para painel
      CLI
  - registro: registro-2026-09-07-integracao-gpt6-astra-e-retirada-do-fable
    caminhos:
      - llm/routing_policy.py
    parecer: llm/routing_policy.py -- atualiza _check_provider_availability_sync para direcionar modelos
      locais sem porta dedicada 8081..8083 ao router :9931
  - registro: registro-2026-09-07-procedencia-do-timesfm-e-json-do-cli
    caminhos:
      - scripts/cli/nexus.py
    parecer: scripts/cli/nexus.py -- adiciona entrada ("Llama.cpp 1.0", 9931) em _DASH_SERVICES para painel
      CLI
  - registro: registro-2026-09-07-promocao-do-duo-gemini-na-faixa-gratuita
    caminhos:
      - llm/routing_policy.py
    parecer: llm/routing_policy.py -- atualiza _check_provider_availability_sync para direcionar modelos
      locais sem porta dedicada 8081..8083 ao router :9931
  - registro: registro-2026-09-08-ruff-format-e-o-ci-vermelho
    caminhos:
      - scripts/cli/nexus.py
    parecer: scripts/cli/nexus.py -- adiciona entrada ("Llama.cpp 1.0", 9931) em _DASH_SERVICES para painel
      CLI
  - registro: registro-2026-09-13-contrato-de-capacidades-e-paridade-de-engines
    caminhos:
      - data/engine_capabilities.json
    parecer: data/engine_capabilities.json -- atualiza engine_id llama-cpp-vulkan para b12387 e Llama
      App 0.14.1.0 (:9931), rotas /health,/v1/models,/props,/metrics, parametros de tuning e consumidores
      ativos
  - registro: registro-2026-09-14-correcoes-pos-auditoria-handoff-tier-e-dependencias
    caminhos:
      - scripts/cli/nexus.py
    parecer: scripts/cli/nexus.py -- adiciona entrada ("Llama.cpp 1.0", 9931) em _DASH_SERVICES para painel
      CLI
  - registro: registro-2026-09-14-harmonizacao-canonicos-astra-luna-gemini-anthropic
    caminhos:
      - scripts/cli/nexus.py
    parecer: scripts/cli/nexus.py -- adiciona entrada ("Llama.cpp 1.0", 9931) em _DASH_SERVICES para painel
      CLI
  - registro: registro-2026-09-14-saneamento-linters-pmev-e-engines
    caminhos:
      - scripts/ops/get_dashboard_telemetry.py
    parecer: scripts/ops/get_dashboard_telemetry.py -- atualiza get_model_status (llama_moe_qwen36) e
      _ports_status (llama_cpp_9931) para reportar Router :9931 com fallback na porta legada :8080
  - registro: registro-2026-09-18-dashboard-notificacoes-e-recomendacoes-acionaveis
    caminhos:
      - scripts/cli/nexus.py
    parecer: scripts/cli/nexus.py -- adiciona entrada ("Llama.cpp 1.0", 9931) em _DASH_SERVICES para painel
      CLI
  - registro: registro-2026-09-18-dream-rsi-ligado-aula12-localizada-e-bounty-a-iniciar
    caminhos:
      - scripts/cli/nexus.py
    parecer: scripts/cli/nexus.py -- adiciona entrada ("Llama.cpp 1.0", 9931) em _DASH_SERVICES para painel
      CLI
  - registro: registro-2026-09-18-saneamento-token-budget-e-harmonizacao-timesfm30
    caminhos:
      - scripts/cli/nexus.py
    parecer: scripts/cli/nexus.py -- adiciona entrada ("Llama.cpp 1.0", 9931) em _DASH_SERVICES para painel
      CLI
  - registro: registro-2026-09-19-refatoracao-sonar-python-e-icm
    caminhos:
      - llm/routing_policy.py
      - scripts/cli/nexus.py
      - scripts/ops/get_dashboard_telemetry.py
    parecer: llm/routing_policy.py -- atualiza _check_provider_availability_sync para direcionar modelos
      locais sem porta dedicada 8081..8083 ao router :9931; scripts/cli/nexus.py -- adiciona entrada ("Llama.cpp
      1.0", 9931) em _DASH_SERVICES para painel CLI; scripts/ops/get_dashboard_telemetry.py -- atualiza
      get_model_status (llama_moe_qwen36) e _ports_status (llama_cpp_9931) para reportar Router :9931
      com fallback na porta legada :8080
  - registro: registro-2026-09-19-warning-sem-backtracking
    caminhos:
      - scripts/cli/nexus.py
    parecer: scripts/cli/nexus.py -- adiciona entrada ("Llama.cpp 1.0", 9931) em _DASH_SERVICES para painel
      CLI
  - registro: registro-2026-09-24-blindagem-ascii-e-harmonizacao-scripts
    caminhos:
      - llm/routing_policy.py
      - scripts/cli/nexus.py
    parecer: llm/routing_policy.py -- atualiza _check_provider_availability_sync para direcionar modelos
      locais sem porta dedicada 8081..8083 ao router :9931; scripts/cli/nexus.py -- adiciona entrada ("Llama.cpp
      1.0", 9931) em _DASH_SERVICES para painel CLI
  - registro: registro-2026-09-24-correcao-markup-rich-e-wrappers-cli
    caminhos:
      - scripts/cli/nexus.py
    parecer: scripts/cli/nexus.py -- adiciona entrada ("Llama.cpp 1.0", 9931) em _DASH_SERVICES para painel
      CLI
  - registro: registro-2026-09-24-harmonizacao-arquitetura-hibrida-vulkan-pytorch
    caminhos:
      - data/engine_capabilities.json
    parecer: data/engine_capabilities.json -- atualiza engine_id llama-cpp-vulkan para b12387 e Llama
      App 0.14.1.0 (:9931), rotas /health,/v1/models,/props,/metrics, parametros de tuning e consumidores
      ativos
  - registro: registro-2026-09-24-laya-gpu-homologacao-e-solver-bridge
    caminhos:
      - data/engine_capabilities.json
    parecer: data/engine_capabilities.json -- atualiza engine_id llama-cpp-vulkan para b12387 e Llama
      App 0.14.1.0 (:9931), rotas /health,/v1/models,/props,/metrics, parametros de tuning e consumidores
      ativos
  - registro: registro-2026-09-24-laya-multilingual-s1-integracao
    caminhos:
      - data/engine_capabilities.json
    parecer: data/engine_capabilities.json -- atualiza engine_id llama-cpp-vulkan para b12387 e Llama
      App 0.14.1.0 (:9931), rotas /health,/v1/models,/props,/metrics, parametros de tuning e consumidores
      ativos
  - registro: registro-2026-09-24-refino-vram-atalhos-ceo-dashboard
    caminhos:
      - scripts/cli/nexus.py
    parecer: scripts/cli/nexus.py -- adiciona entrada ("Llama.cpp 1.0", 9931) em _DASH_SERVICES para painel
      CLI
  - registro: registro-2026-09-24-retificacao-hardware-gpu-amd-vulkan
    caminhos:
      - scripts/cli/nexus.py
    parecer: scripts/cli/nexus.py -- adiciona entrada ("Llama.cpp 1.0", 9931) em _DASH_SERVICES para painel
      CLI
  - registro: registro-2026-09-25-integracao-qwen-coder-e-blindagem-testes
    caminhos:
      - llm/local_llama_client.py
      - scripts/ops/Start-LocalLlama.ps1
    parecer: llm/local_llama_client.py -- define DEFAULT_ROUTER_PORT=9931 (PORT_TO_ROUTER_MODEL), get_engine_version,
      _probe_port_health priorizando :9931 sobre portas legadas 8081..8083 e fallback _post_chat para
      :9931; scripts/ops/Start-LocalLlama.ps1 -- prioriza Site/engine/llama_cpp/llama-server.exe (b12387),
      reporta Router Unificado 1.0 (:9931) em Show-Status, padroniza -fa on, -ctk q8_0, -ctv q4_0, -t
      8, -b 2048, -ub 512, --cache-reuse 256, --fit on, --metrics e restaura BOM UTF-8
  - registro: registro-2026-09-25-modelos-locais-llama-g9v3-ling3
    caminhos:
      - llm/local_llama_client.py
      - scripts/ops/Start-LocalLlama.ps1
    parecer: llm/local_llama_client.py -- define DEFAULT_ROUTER_PORT=9931 (PORT_TO_ROUTER_MODEL), get_engine_version,
      _probe_port_health priorizando :9931 sobre portas legadas 8081..8083 e fallback _post_chat para
      :9931; scripts/ops/Start-LocalLlama.ps1 -- prioriza Site/engine/llama_cpp/llama-server.exe (b12387),
      reporta Router Unificado 1.0 (:9931) em Show-Status, padroniza -fa on, -ctk q8_0, -ctv q4_0, -t
      8, -b 2048, -ub 512, --cache-reuse 256, --fit on, --metrics e restaura BOM UTF-8
  - registro: registro-2026-09-29-saneamento-lint-e-calibracao
    caminhos:
      - llm/local_llama_client.py
    parecer: llm/local_llama_client.py -- define DEFAULT_ROUTER_PORT=9931 (PORT_TO_ROUTER_MODEL), get_engine_version,
      _probe_port_health priorizando :9931 sobre portas legadas 8081..8083 e fallback _post_chat para
      :9931
  - registro: registro-2026-09-30-expurgo-de-modelos-obsoletos-e-reconciliacao-de-ancoras
    caminhos:
      - scripts/cli/nexus.py
    parecer: scripts/cli/nexus.py -- adiciona entrada ("Llama.cpp 1.0", 9931) em _DASH_SERVICES para painel
      CLI
  - registro: registro-2026-10-01-harmonizacao-malha-subagentes
    caminhos:
      - llm/routing_policy.py
    parecer: llm/routing_policy.py -- atualiza _check_provider_availability_sync para direcionar modelos
      locais sem porta dedicada 8081..8083 ao router :9931
  - registro: registro-2026-10-06-strata-moe-125b-e-dashboard-nexus
    caminhos:
      - scripts/cli/nexus.py
      - scripts/ops/Start-NexusDashboard.ps1
      - scripts/ops/get_dashboard_telemetry.py
    parecer: scripts/cli/nexus.py -- adiciona entrada ("Llama.cpp 1.0", 9931) em _DASH_SERVICES para painel
      CLI; scripts/ops/Start-NexusDashboard.ps1 -- adiciona deteccao de llama_cpp_9931 com fallback para
      vulkan_8080 no servico Llama.cpp de Build-Frame e restaura BOM UTF-8; scripts/ops/get_dashboard_telemetry.py
      -- atualiza get_model_status (llama_moe_qwen36) e _ports_status (llama_cpp_9931) para reportar Router
      :9931 com fallback na porta legada :8080
  - registro: registro-2026-10-10-evolucao-malha-agentica-sota-v8-gold
    caminhos:
      - core/subagents_mesh.py
      - llm/providers.py
    parecer: core/subagents_mesh.py -- adiciona LLAMA_CPP_FALLBACK_MAP e _call_llama_cpp_inference com
      fallback ao router :9931/v1/chat/completions quando Ollama (:11434) falha; llm/providers.py -- atualiza
      _check_local_llama_availability para usar porta padrao 9931 (timeout 1.0s) quando o modelo nao direciona
      para portas dedicadas 8081..8083
  - registro: registro-2026-10-13-saneamento-diagnosticos-ide-e-compatibilidade
    caminhos:
      - llm/routing_policy.py
    parecer: llm/routing_policy.py -- atualiza _check_provider_availability_sync para direcionar modelos
      locais sem porta dedicada 8081..8083 ao router :9931
  - registro: registro-2026-10-18-harmonizacao-malha-agentica-e-sota-engine
    caminhos:
      - core/subagents_mesh.py
    parecer: core/subagents_mesh.py -- adiciona LLAMA_CPP_FALLBACK_MAP e _call_llama_cpp_inference com
      fallback ao router :9931/v1/chat/completions quando Ollama (:11434) falha
  - registro: registro-2026-10-18-resolucao-sonarqube-e-saneamento-global
    caminhos:
      - core/subagents_mesh.py
      - scripts/ops/get_dashboard_telemetry.py
    parecer: core/subagents_mesh.py -- adiciona LLAMA_CPP_FALLBACK_MAP e _call_llama_cpp_inference com
      fallback ao router :9931/v1/chat/completions quando Ollama (:11434) falha; scripts/ops/get_dashboard_telemetry.py
      -- atualiza get_model_status (llama_moe_qwen36) e _ports_status (llama_cpp_9931) para reportar Router
      :9931 com fallback na porta legada :8080
  - registro: registro-2026-10-19-saneamento-sonarqube-timesfm-e-a11y
    caminhos:
      - scripts/cli/nexus.py
    parecer: scripts/cli/nexus.py -- adiciona entrada ("Llama.cpp 1.0", 9931) em _DASH_SERVICES para painel
      CLI
  - registro: registro-2026-10-19-verificacao-neural-timesfm-e-evolucao-ecossistema
    caminhos:
      - scripts/cli/nexus.py
    parecer: scripts/cli/nexus.py -- adiciona entrada ("Llama.cpp 1.0", 9931) em _DASH_SERVICES para painel
      CLI
  - registro: registro-2026-10-20-harmonizacao-tier1-e-gemini-38
    caminhos:
      - llm/routing_policy.py
    parecer: llm/routing_policy.py -- atualiza _check_provider_availability_sync para direcionar modelos
      locais sem porta dedicada 8081..8083 ao router :9931
  - registro: registro-2026-10-20-saneamento-quality-gate-ascii-e-reconciliacao-de-ancoras
    caminhos:
      - scripts/cli/nexus.py
    parecer: scripts/cli/nexus.py -- adiciona entrada ("Llama.cpp 1.0", 9931) em _DASH_SERVICES para painel
      CLI
  - registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
    caminhos:
      - llm/routing_policy.py
    parecer: llm/routing_policy.py -- atualiza _check_provider_availability_sync para direcionar modelos
      locais sem porta dedicada 8081..8083 ao router :9931
  - registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
    caminhos:
      - scripts/cli/nexus.py
    parecer: scripts/cli/nexus.py -- adiciona entrada ("Llama.cpp 1.0", 9931) em _DASH_SERVICES para painel
      CLI
  - registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
    caminhos:
      - llm/local_engine_client.py
      - llm/providers.py
    parecer: llm/local_engine_client.py -- adiciona parametro opcional model em _build_chat_payload e
      LocalEngineClient.chat_completions para roteamento multi-modelo; llm/providers.py -- atualiza _check_local_llama_availability
      para usar porta padrao 9931 (timeout 1.0s) quando o modelo nao direciona para portas dedicadas 8081..8083
  - registro: registro-2026-11-08-integracao-sota-suite-antigravity-sdk-cli-acp
    caminhos:
      - llm/antigravity_sdk_bridge.py
      - scripts/cli/nexus.py
      - tests/test_antigravity_sdk_bridge.py
    parecer: llm/antigravity_sdk_bridge.py -- adiciona DEFAULT_LLAMA_CPP_BASE_URL (:9931), LLAMA_CPP_MODEL_ALIASES,
      resolve_llama_cpp_model, _fetch_json_http (http.client), fetch_llama_cpp_runtime_status, build_local_llama_cpp_config
      e telemetria em audit_ecosystem; scripts/cli/nexus.py -- adiciona entrada ("Llama.cpp 1.0", 9931)
      em _DASH_SERVICES para painel CLI; tests/test_antigravity_sdk_bridge.py -- adiciona test_resolve_and_build_llama_cpp_config
      e test_fetch_llama_cpp_runtime_status_mock cobrindo /v1/models e /props de :9931 via http.client
  - registro: registro-2026-11-09-automacao-modelos-locais-ollama-e-subagentes
    caminhos:
      - llm/antigravity_sdk_bridge.py
      - scripts/cli/nexus.py
      - tests/test_antigravity_sdk_bridge.py
    parecer: llm/antigravity_sdk_bridge.py -- adiciona DEFAULT_LLAMA_CPP_BASE_URL (:9931), LLAMA_CPP_MODEL_ALIASES,
      resolve_llama_cpp_model, _fetch_json_http (http.client), fetch_llama_cpp_runtime_status, build_local_llama_cpp_config
      e telemetria em audit_ecosystem; scripts/cli/nexus.py -- adiciona entrada ("Llama.cpp 1.0", 9931)
      em _DASH_SERVICES para painel CLI; tests/test_antigravity_sdk_bridge.py -- adiciona test_resolve_and_build_llama_cpp_config
      e test_fetch_llama_cpp_runtime_status_mock cobrindo /v1/models e /props de :9931 via http.client
  - registro: registro-2026-11-09-saneamento-sonarlint-e-mcp-skills-vulnerabilidades
    caminhos:
      - llm/antigravity_sdk_bridge.py
    parecer: llm/antigravity_sdk_bridge.py -- adiciona DEFAULT_LLAMA_CPP_BASE_URL (:9931), LLAMA_CPP_MODEL_ALIASES,
      resolve_llama_cpp_model, _fetch_json_http (http.client), fetch_llama_cpp_runtime_status, build_local_llama_cpp_config
      e telemetria em audit_ecosystem
  - registro: registro-2026-11-11-powershell-77-preview-e-perfil-fundido
    caminhos:
      - scripts/ops/Start-NexusDashboard.ps1
    parecer: scripts/ops/Start-NexusDashboard.ps1 -- adiciona deteccao de llama_cpp_9931 com fallback
      para vulkan_8080 no servico Llama.cpp de Build-Frame e restaura BOM UTF-8
  - registro: registro-2026-11-12-arquitetura-s1-s2-llama-vulkan
    caminhos:
      - data/engine_capabilities.json
      - llm/system2_local.py
      - scripts/ops/Start-LlamaVulkan.ps1
    parecer: data/engine_capabilities.json -- atualiza engine_id llama-cpp-vulkan para b12387 e Llama
      App 0.14.1.0 (:9931), rotas /health,/v1/models,/props,/metrics, parametros de tuning e consumidores
      ativos; llm/system2_local.py -- altera DEFAULT_LLAMA_BASE para :9931, adiciona _LLAMA_ROUTER_ALIASES,
      _LLAMA_MODEL_CACHE e _resolve_llama_router_model e atualiza llama_server_online e _llama_generate;
      scripts/ops/Start-LlamaVulkan.ps1 -- prioriza binario Site/engine/llama_cpp/llama-server.exe (b12387)
      com fallback em ~/.gemini/tools/llama.cpp, inclui -dev Vulkan0, -b 2048, -ub 512, --cache-reuse
      256, --metrics e restaura BOM UTF-8
  - registro: registro-2026-11-12-ollama-cloud-provider
    caminhos:
      - llm/providers.py
    parecer: llm/providers.py -- atualiza _check_local_llama_availability para usar porta padrao 9931
      (timeout 1.0s) quando o modelo nao direciona para portas dedicadas 8081..8083
  - registro: registro-2026-11-12-pool-multimodal-e-refactors-sonar
    caminhos:
      - data/engine_capabilities.json
      - llm/system2_local.py
    parecer: data/engine_capabilities.json -- atualiza engine_id llama-cpp-vulkan para b12387 e Llama
      App 0.14.1.0 (:9931), rotas /health,/v1/models,/props,/metrics, parametros de tuning e consumidores
      ativos; llm/system2_local.py -- altera DEFAULT_LLAMA_BASE para :9931, adiciona _LLAMA_ROUTER_ALIASES,
      _LLAMA_MODEL_CACHE e _resolve_llama_router_model e atualiza llama_server_online e _llama_generate
  - registro: registro-2026-11-12-pools-chaves-reposicao-e-doc-consolidada
    caminhos:
      - data/engine_capabilities.json
    parecer: data/engine_capabilities.json -- atualiza engine_id llama-cpp-vulkan para b12387 e Llama
      App 0.14.1.0 (:9931), rotas /health,/v1/models,/props,/metrics, parametros de tuning e consumidores
      ativos
  - registro: registro-2026-11-12-review-sweeps-endurecimento-sota
    caminhos:
      - llm/system2_local.py
      - scripts/ops/Start-LlamaVulkan.ps1
    parecer: llm/system2_local.py -- altera DEFAULT_LLAMA_BASE para :9931, adiciona _LLAMA_ROUTER_ALIASES,
      _LLAMA_MODEL_CACHE e _resolve_llama_router_model e atualiza llama_server_online e _llama_generate;
      scripts/ops/Start-LlamaVulkan.ps1 -- prioriza binario Site/engine/llama_cpp/llama-server.exe (b12387)
      com fallback em ~/.gemini/tools/llama.cpp, inclui -dev Vulkan0, -b 2048, -ub 512, --cache-reuse
      256, --metrics e restaura BOM UTF-8
  - registro: registro-2026-11-14-roteamento-pools-transporte-e-validacao-hrc
    caminhos:
      - llm/providers.py
      - llm/routing_policy.py
    parecer: llm/providers.py -- atualiza _check_local_llama_availability para usar porta padrao 9931
      (timeout 1.0s) quando o modelo nao direciona para portas dedicadas 8081..8083; llm/routing_policy.py
      -- atualiza _check_provider_availability_sync para direcionar modelos locais sem porta dedicada
      8081..8083 ao router :9931
  - registro: registro-2026-11-14-stitch-skills-tsconfig-e-refatoracoes-sonar
    caminhos:
      - llm/system2_local.py
    parecer: llm/system2_local.py -- altera DEFAULT_LLAMA_BASE para :9931, adiciona _LLAMA_ROUTER_ALIASES,
      _LLAMA_MODEL_CACHE e _resolve_llama_router_model e atualiza llama_server_online e _llama_generate
  - registro: registro-2026-11-14-sync-uvlock-ollama-cloud-circuit-e-ci
    caminhos:
      - llm/providers.py
    parecer: llm/providers.py -- atualiza _check_local_llama_availability para usar porta padrao 9931
      (timeout 1.0s) quando o modelo nao direciona para portas dedicadas 8081..8083
verificado:
  - py_compile nos 10 arquivos Python editados no Site e em scripts/ops/antigravity_sdk_bridge.py (raiz)
    -- exit 0
  - ruff check e ruff format --check nos 10 arquivos Python editados no Site e apos remocao de LEGACY_LLAMA_BASE
    em llm/system2_local.py -- All checks passed
  - PowerShell Parser ParseFile nos 5 scripts .ps1 editados no Site (BOM UTF-8 restaurado) -- 5/5 sem
    erros
  - pytest tests/test_antigravity_sdk_bridge.py tests/test_roteamento_especialidade.py tests/test_system2_local.py
    tests/test_subagents_mesh.py tests/test_dashboard_telemetry_contagem.py -q -- 80 passed em 14.90s
  - pytest tests/test_declarado_e_lido.py -q apos remocao de LEGACY_LLAMA_BASE -- 7 passed em 10.93s
  - npm run sota:audit (cwv_gate.ps1 em http://localhost:3000 via CDP 9223) -- exit 0 (LCP 1042.9 ms,
    CLS 0.000085, TBT 32.5 ms, TTFB 585.7 ms, MAX_HEAP 18.96 MB, AXE 0, CVEs 0, SRI VERIFIED)
  - scripts/ops/suite_verde.py apos edicao final em llm/system2_local.py -- exit 0 (0 erros, 0 warnings)
  - Probe live -- router llama.cpp 9931 (/props e /metrics HTTP 200), orchestrator 9333 (providers.llamaCpp.active=true)
    e scripts/ops/get_dashboard_telemetry.py
  - Diagnostico Chrome Dev 160 (PIDs 4116 e 2392 com WebMCP,DeclarativeWebMCP desabilitados) + webmcp-bridge
    9225 (PID 6076, 18 tools) + WEBMCP_LIVE_TESTS=1 test_chrome_webmcp_server.py 11/11 OK
  - Probe Ollama Cloud para pend-2026-11-12-ollama-cloud-credits -- POST em ollama.com/api/chat retornou
    HTTP 402 (payment failed), permanecendo pendente para Tier 0
nao_verificado:
  - Inspecao visual interativa da janela GUI de LlamaApp.exe apos o encerramento das medicoes via HTTP/props
  - Execucao individual de cada binario auxiliar CLI empacotado em engine/llama_cpp/ alem de llama-server,
    llama-bench e llama-cli
---

# Registro -- Integracao do Router llama.cpp 1.0 (:9931) e Binarios Vulkan b12387

## O que mudou
- Sincronizacao dos binarios oficiais `win-vulkan-x64` (`b12387`, incluindo `LICENSE-LLVM-OpenMP`) em `engine/llama_cpp/` (LFS).
- Roteamento System-2, cliente local, malha de subagentes, ponte Antigravity SDK e scripts PowerShell direcionados ao Router Nativo `llama.cpp 1.0` em `127.0.0.1:9931` (`llm/system2_local.py`, `llm/local_llama_client.py`, `llm/local_engine_client.py`, `llm/providers.py`, `llm/routing_policy.py`, `core/subagents_mesh.py`, `llm/antigravity_sdk_bridge.py`).
- Telemetria e scripts operacionais atualizados com `b12387`, tuning Vulkan0 (`-fa on`, `-ctk q8_0`, `-ctv q4_0`, `-t 8`, `-b 2048`, `-ub 512`, `--cache-reuse 256`, `--metrics`) e BOM UTF-8 (`data/engine_capabilities.json`, `engine/llama_cpp/daemon_watchdog.ps1`, `engine/llama_cpp/start_vulkan_daemon.ps1`, `scripts/cli/nexus.py`, `scripts/ops/Start-LlamaVulkan.ps1`, `scripts/ops/Start-LocalLlama.ps1`, `scripts/ops/Start-NexusDashboard.ps1`, `scripts/ops/get_dashboard_telemetry.py`).
- Testes de contrato adicionados em `tests/test_antigravity_sdk_bridge.py` (`test_resolve_and_build_llama_cpp_config`, `test_fetch_llama_cpp_runtime_status_mock`) usando `http.client` para evitar suppressors `S310`.
- Remocao da constante nao lida `LEGACY_LLAMA_BASE` de `llm/system2_local.py`, restaurando 100% de aprovacao em `tests/test_declarado_e_lido.py`.

## Evidencias medidas e status de pendencias externas
- `npm run sota:audit`: `0` erros, `0` warnings nas 5 fases de qualidade.
- `scripts/ops/suite_verde.py`: `0` erros, `0` warnings na suite `pytest -n 6`.
- `pend-2026-11-12-ollama-cloud-credits`: verificada ao vivo via `POST` em `https://ollama.com/api/chat` (`HTTP 402` -- credito/recarga pendente na conta), mantida aberta sob acao exclusiva do Tier 0.
