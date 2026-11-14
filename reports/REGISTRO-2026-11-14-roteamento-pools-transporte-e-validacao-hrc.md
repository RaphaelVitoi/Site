---
id: registro-2026-11-14-roteamento-pools-transporte-e-validacao-hrc
tipo: registro
escopo: Site -- roteamento sem provedores sem saldo, pools Registry HKLM/HKCU, transporte HTTP/Gemma local,
  probe HRC, benchmark ICM e settings IDE
ecossistema: nexus-sota
autor: Gemini 4 Argon <noreply@google.com>
criado_em: '2026-11-14T18:01:00-03:00'
atualizado_em: '2026-11-14T18:01:00-03:00'
classes:
  - interno
  - medido
  - governanca
  - resiliencia
config_medida:
  congelada_em: '2026-11-14'
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data: '2026-11-14'
caminhos:
  - .vscode/settings.json
  - data/routing_map.json
  - data/system_config.json
  - engine/llm_api.py
  - llm/budget.py
  - llm/gemini.py
  - llm/gemini_pool.py
  - llm/gemma_local.py
  - llm/openrouter.py
  - llm/openrouter_pool.py
  - llm/orchestrator.py
  - llm/providers.py
  - llm/routing_policy.py
  - pyproject.toml
  - reports/REGISTRO-2026-11-14-roteamento-pools-transporte-e-validacao-hrc.md
  - scripts/validation/HrcNativeReadProbe.java
  - scripts/validation/exportar_benchmark_icm_publico.py
  - scripts/validation/hrc-native-read.mjs
  - uv.lock
revisoes_de_ancora:
  - registro: auditoria-2026-09-02-curadoria-mcp-e-processos-residuais
    caminhos:
      - data/system_config.json
    parecer: data/system_config.json -- alinha model_routing (deep_thinking, fast_operations, coding,
      general_purpose) aos provedores ativos Gemini, OpenRouter free e local
  - registro: auditoria-2026-09-02-integridade-do-projeto-e-piso-de-transformers
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: auditoria-2026-09-03-trabalho-do-gemini-3-8-flash
    caminhos:
      - data/routing_map.json
      - data/system_config.json
      - llm/routing_policy.py
    parecer: data/routing_map.json -- remove modelos claude-* e gpt-6* sem saldo das cadeias de fallback
      e prioriza Gemini, OpenRouter free e Gemma 4 local; data/system_config.json -- alinha model_routing
      (deep_thinking, fast_operations, coding, general_purpose) aos provedores ativos Gemini, OpenRouter
      free e local; llm/routing_policy.py -- retorna False em _check_provider_availability_sync para provider
      anthropic fora de pytest
  - registro: auditoria-2026-09-22-paridade-config-identidade
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- exclui .pytest_tmp de search/watcher/files e expande filtros de
      exclusao do Java Language Server
  - registro: auditoria-2026-10-08-integralidade-backend
    caminhos:
      - engine/llm_api.py
      - llm/openrouter_pool.py
      - pyproject.toml
    parecer: engine/llm_api.py -- remove anthropic/claude-opus-5.5 e claude-sonnet-5.5 dos extras de deep_thinking
      no OpenRouter; llm/openrouter_pool.py -- le HKLM antes de HKCU e adiciona 7 chaves nomeadas OPENROUTER_*_KEY
      ao Tier 4; pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0
  - registro: auditoria-cwv-lighthouse-2026-09-01
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- exclui .pytest_tmp de search/watcher/files e expande filtros de
      exclusao do Java Language Server
  - registro: handoff-2026-09-02-curadoria-mcp-quarentena-e-roteamento-lazy
    caminhos:
      - data/system_config.json
    parecer: data/system_config.json -- alinha model_routing (deep_thinking, fast_operations, coding,
      general_purpose) aos provedores ativos Gemini, OpenRouter free e local
  - registro: handoff-2026-09-10-lint-lighthouse-e-aceite-cve
    caminhos:
      - pyproject.toml
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0
  - registro: handoff-2026-09-13-integracao-de-engines-wasm-e-economia-de-gate
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: handoff-2026-09-14-pagina-icm-contra-a-mesa-real
    caminhos:
      - scripts/validation/exportar_benchmark_icm_publico.py
    parecer: scripts/validation/exportar_benchmark_icm_publico.py -- extrai helpers _contar_funil_estruturas
      e _coletar_observacoes_estrutura para reduzir complexidade cognitiva de main
  - registro: handoff-2026-09-22-integracao-system1-llm-dashboard
    caminhos:
      - engine/llm_api.py
      - llm/gemini.py
      - llm/gemma_local.py
      - llm/openrouter.py
      - llm/orchestrator.py
    parecer: engine/llm_api.py -- remove anthropic/claude-opus-5.5 e claude-sonnet-5.5 dos extras de deep_thinking
      no OpenRouter; llm/gemini.py -- substitui raise_for_status por checagem explicita status != 200
      com leitura de erro antes de fechar o contexto HTTP e registra mark_success/mark_failure no fallback
      nativo; llm/gemma_local.py -- adiciona fallback de token via ALL_ENV_VARS e detecta prefixos de
      erro em stream HTTP 200 do Gemma local; llm/openrouter.py -- substitui raise_for_status por checagem
      status != 200 com leitura do corpo de erro dentro do contexto HTTP ativo; llm/orchestrator.py --
      extrai _resolve_designated_model e _prioritize_model e curto-circuita provedores anthropic ou openai
      sem chave fora de pytest
  - registro: handoff-2026-09-22-paridade-config-identidade
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- exclui .pytest_tmp de search/watcher/files e expande filtros de
      exclusao do Java Language Server
  - registro: handoff-2026-09-23-nucleo-mcp-curadoria-codex
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- exclui .pytest_tmp de search/watcher/files e expande filtros de
      exclusao do Java Language Server
  - registro: handoff-2026-09-23-sincronia-editor-calibracao-e-gate
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- exclui .pytest_tmp de search/watcher/files e expande filtros de
      exclusao do Java Language Server
  - registro: handoff-2026-09-25-pool-rotacional-gemini-flash-lite
    caminhos:
      - llm/gemini.py
      - llm/gemini_pool.py
    parecer: llm/gemini.py -- substitui raise_for_status por checagem explicita status != 200 com leitura
      de erro antes de fechar o contexto HTTP e registra mark_success/mark_failure no fallback nativo;
      llm/gemini_pool.py -- le HKLM antes de HKCU para preservar precedencia do usuario e inclui chaves
      auxiliares GEMINI_{IMAGE,TRANSLATE,TTS,VIDEO}_KEY no pool
  - registro: handoff-2026-09-30-expurgo-de-modelos-obsoletos-harmonizacao-qwen-e-calibracao
    caminhos:
      - data/routing_map.json
      - data/system_config.json
      - engine/llm_api.py
      - llm/orchestrator.py
    parecer: data/routing_map.json -- remove modelos claude-* e gpt-6* sem saldo das cadeias de fallback
      e prioriza Gemini, OpenRouter free e Gemma 4 local; data/system_config.json -- alinha model_routing
      (deep_thinking, fast_operations, coding, general_purpose) aos provedores ativos Gemini, OpenRouter
      free e local; engine/llm_api.py -- remove anthropic/claude-opus-5.5 e claude-sonnet-5.5 dos extras
      de deep_thinking no OpenRouter; llm/orchestrator.py -- extrai _resolve_designated_model e _prioritize_model
      e curto-circuita provedores anthropic ou openai sem chave fora de pytest
  - registro: handoff-2026-10-05-fechamento-do-ciclo-medicoes-cwv-e-cacheabilidade
    caminhos:
      - engine/llm_api.py
    parecer: engine/llm_api.py -- remove anthropic/claude-opus-5.5 e claude-sonnet-5.5 dos extras de deep_thinking
      no OpenRouter
  - registro: handoff-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - engine/llm_api.py
      - llm/openrouter_pool.py
      - pyproject.toml
      - uv.lock
    parecer: engine/llm_api.py -- remove anthropic/claude-opus-5.5 e claude-sonnet-5.5 dos extras de deep_thinking
      no OpenRouter; llm/openrouter_pool.py -- le HKLM antes de HKCU e adiciona 7 chaves nomeadas OPENROUTER_*_KEY
      ao Tier 4; pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: handoff-2026-10-20-harmonizacao-tier1-gemini-38
    caminhos:
      - llm/routing_policy.py
    parecer: llm/routing_policy.py -- retorna False em _check_provider_availability_sync para provider
      anthropic fora de pytest
  - registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: handoff-2026-11-10-boot-persistente-mesh-mcp-e-cockpit
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- exclui .pytest_tmp de search/watcher/files e expande filtros de
      exclusao do Java Language Server
  - registro: handoff-2026-11-14-decision1-laya-s1-s2-e-ancoras
    caminhos:
      - .vscode/settings.json
      - llm/gemma_local.py
      - llm/orchestrator.py
      - llm/providers.py
    parecer: .vscode/settings.json -- exclui .pytest_tmp de search/watcher/files e expande filtros de
      exclusao do Java Language Server; llm/gemma_local.py -- adiciona fallback de token via ALL_ENV_VARS
      e detecta prefixos de erro em stream HTTP 200 do Gemma local; llm/orchestrator.py -- extrai _resolve_designated_model
      e _prioritize_model e curto-circuita provedores anthropic ou openai sem chave fora de pytest; llm/providers.py
      -- consulta disponibilidade em gemini_pool_manager._stats na quarentena com contextlib.suppress,
      registra falha de rota no inicio de _handle_5xx_error e extrai HTTP status por regex
  - registro: plan-dependency-boundary-reconciliation-2026-09-01
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: plano-laya-integracao-s1s2-pmev-2026-09-20
    caminhos:
      - llm/routing_policy.py
      - pyproject.toml
      - uv.lock
    parecer: llm/routing_policy.py -- retorna False em _check_provider_availability_sync para provider
      anthropic fora de pytest; pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock
      -- sincroniza lockfile para fastapi 0.163.0
  - registro: registro-2026-08-29-tres-orfaos
    caminhos:
      - llm/budget.py
    parecer: llm/budget.py -- restringe prefixo GOOGLE em GEMINI_KEYS, coleta OLLAMA_API_KEY/OLLAMA_CLOUD_KEY
      do Windows Registry e concatena pool_keys + extra em _gemini_key_pool_for_model
  - registro: registro-2026-09-02-adapters-ligado-ao-caminho-real-anthropic
    caminhos:
      - engine/llm_api.py
    parecer: engine/llm_api.py -- remove anthropic/claude-opus-5.5 e claude-sonnet-5.5 dos extras de deep_thinking
      no OpenRouter
  - registro: registro-2026-09-04-otimizacao-settings-seguranca-e-io
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- exclui .pytest_tmp de search/watcher/files e expande filtros de
      exclusao do Java Language Server
  - registro: registro-2026-09-07-integracao-gpt6-astra-e-retirada-do-fable
    caminhos:
      - llm/routing_policy.py
    parecer: llm/routing_policy.py -- retorna False em _check_provider_availability_sync para provider
      anthropic fora de pytest
  - registro: registro-2026-09-07-padronizacao-sistemica-markdownlint
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- exclui .pytest_tmp de search/watcher/files e expande filtros de
      exclusao do Java Language Server
  - registro: registro-2026-09-07-promocao-do-duo-gemini-na-faixa-gratuita
    caminhos:
      - llm/routing_policy.py
    parecer: llm/routing_policy.py -- retorna False em _check_provider_availability_sync para provider
      anthropic fora de pytest
  - registro: registro-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem
    caminhos:
      - engine/llm_api.py
      - llm/gemini.py
    parecer: engine/llm_api.py -- remove anthropic/claude-opus-5.5 e claude-sonnet-5.5 dos extras de deep_thinking
      no OpenRouter; llm/gemini.py -- substitui raise_for_status por checagem explicita status != 200
      com leitura de erro antes de fechar o contexto HTTP e registra mark_success/mark_failure no fallback
      nativo
  - registro: registro-2026-09-08-auditoria-de-tipagem-e-recorte-do-fingerprint
    caminhos:
      - llm/orchestrator.py
    parecer: llm/orchestrator.py -- extrai _resolve_designated_model e _prioritize_model e curto-circuita
      provedores anthropic ou openai sem chave fora de pytest
  - registro: registro-2026-09-09-configuracoes-ide-e-calibracao-diaria
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- exclui .pytest_tmp de search/watcher/files e expande filtros de
      exclusao do Java Language Server
  - registro: registro-2026-09-09-remediacao-dependabot-httpx2
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: registro-2026-09-09-validacao-nativa-hrc
    caminhos:
      - scripts/validation/HrcNativeReadProbe.java
      - scripts/validation/hrc-native-read.mjs
    parecer: scripts/validation/HrcNativeReadProbe.java -- declara package scripts.validation e remove
      supressao redundante java:S1220; scripts/validation/hrc-native-read.mjs -- atualiza invocacao java
      para o FQCN scripts.validation.HrcNativeReadProbe
  - registro: registro-2026-09-11-campanha-sonarlint-exa-e-reverificacao-do-probe-hrc
    caminhos:
      - scripts/validation/hrc-native-read.mjs
    parecer: scripts/validation/hrc-native-read.mjs -- atualiza invocacao java para o FQCN scripts.validation.HrcNativeReadProbe
  - registro: registro-2026-09-11-teoria-sota-e-saneamento-multimodal
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- exclui .pytest_tmp de search/watcher/files e expande filtros de
      exclusao do Java Language Server
  - registro: registro-2026-09-12-saneamento-linter-e-reconciliacao-de-ancoras
    caminhos:
      - .vscode/settings.json
      - scripts/validation/hrc-native-read.mjs
    parecer: .vscode/settings.json -- exclui .pytest_tmp de search/watcher/files e expande filtros de
      exclusao do Java Language Server; scripts/validation/hrc-native-read.mjs -- atualiza invocacao java
      para o FQCN scripts.validation.HrcNativeReadProbe
  - registro: registro-2026-09-13-ci-typecheck-e-fronteira-de-capacidades
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: registro-2026-09-13-otimizacoes-helpers-antientropia-e-feedback
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: registro-2026-09-14-auditoria-e-refinamento-settings-e-configuracoes
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- exclui .pytest_tmp de search/watcher/files e expande filtros de
      exclusao do Java Language Server
  - registro: registro-2026-09-14-saneamento-linter-e-tipagem-tests-e-skills
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- exclui .pytest_tmp de search/watcher/files e expande filtros de
      exclusao do Java Language Server
  - registro: registro-2026-09-18-saneamento-geral-de-linters-e-gate-remocao-citada
    caminhos:
      - scripts/validation/HrcNativeReadProbe.java
    parecer: scripts/validation/HrcNativeReadProbe.java -- declara package scripts.validation e remove
      supressao redundante java:S1220
  - registro: registro-2026-09-19-refatoracao-sonar-python-e-icm
    caminhos:
      - llm/routing_policy.py
    parecer: llm/routing_policy.py -- retorna False em _check_provider_availability_sync para provider
      anthropic fora de pytest
  - registro: registro-2026-09-24-blindagem-ascii-e-harmonizacao-scripts
    caminhos:
      - llm/gemini.py
      - llm/orchestrator.py
      - llm/routing_policy.py
    parecer: llm/gemini.py -- substitui raise_for_status por checagem explicita status != 200 com leitura
      de erro antes de fechar o contexto HTTP e registra mark_success/mark_failure no fallback nativo;
      llm/orchestrator.py -- extrai _resolve_designated_model e _prioritize_model e curto-circuita provedores
      anthropic ou openai sem chave fora de pytest; llm/routing_policy.py -- retorna False em _check_provider_availability_sync
      para provider anthropic fora de pytest
  - registro: registro-2026-09-25-integracao-qwen-coder-e-blindagem-testes
    caminhos:
      - llm/budget.py
    parecer: llm/budget.py -- restringe prefixo GOOGLE em GEMINI_KEYS, coleta OLLAMA_API_KEY/OLLAMA_CLOUD_KEY
      do Windows Registry e concatena pool_keys + extra em _gemini_key_pool_for_model
  - registro: registro-2026-09-25-pool-rotacional-gemini-flash-lite
    caminhos:
      - llm/gemini.py
      - llm/gemini_pool.py
    parecer: llm/gemini.py -- substitui raise_for_status por checagem explicita status != 200 com leitura
      de erro antes de fechar o contexto HTTP e registra mark_success/mark_failure no fallback nativo;
      llm/gemini_pool.py -- le HKLM antes de HKCU para preservar precedencia do usuario e inclui chaves
      auxiliares GEMINI_{IMAGE,TRANSLATE,TTS,VIDEO}_KEY no pool
  - registro: registro-2026-09-25-pools-de-chaves-openrouter-multi-tier
    caminhos:
      - llm/budget.py
      - llm/openrouter_pool.py
    parecer: llm/budget.py -- restringe prefixo GOOGLE em GEMINI_KEYS, coleta OLLAMA_API_KEY/OLLAMA_CLOUD_KEY
      do Windows Registry e concatena pool_keys + extra em _gemini_key_pool_for_model; llm/openrouter_pool.py
      -- le HKLM antes de HKCU e adiciona 7 chaves nomeadas OPENROUTER_*_KEY ao Tier 4
  - registro: registro-2026-09-29-saneamento-lint-e-calibracao
    caminhos:
      - llm/budget.py
      - llm/gemini.py
    parecer: llm/budget.py -- restringe prefixo GOOGLE em GEMINI_KEYS, coleta OLLAMA_API_KEY/OLLAMA_CLOUD_KEY
      do Windows Registry e concatena pool_keys + extra em _gemini_key_pool_for_model; llm/gemini.py --
      substitui raise_for_status por checagem explicita status != 200 com leitura de erro antes de fechar
      o contexto HTTP e registra mark_success/mark_failure no fallback nativo
  - registro: registro-2026-09-30-expurgo-de-modelos-obsoletos-e-reconciliacao-de-ancoras
    caminhos:
      - data/routing_map.json
      - data/system_config.json
      - engine/llm_api.py
      - llm/orchestrator.py
    parecer: data/routing_map.json -- remove modelos claude-* e gpt-6* sem saldo das cadeias de fallback
      e prioriza Gemini, OpenRouter free e Gemma 4 local; data/system_config.json -- alinha model_routing
      (deep_thinking, fast_operations, coding, general_purpose) aos provedores ativos Gemini, OpenRouter
      free e local; engine/llm_api.py -- remove anthropic/claude-opus-5.5 e claude-sonnet-5.5 dos extras
      de deep_thinking no OpenRouter; llm/orchestrator.py -- extrai _resolve_designated_model e _prioritize_model
      e curto-circuita provedores anthropic ou openai sem chave fora de pytest
  - registro: registro-2026-10-01-harmonizacao-malha-subagentes
    caminhos:
      - llm/routing_policy.py
    parecer: llm/routing_policy.py -- retorna False em _check_provider_availability_sync para provider
      anthropic fora de pytest
  - registro: registro-2026-10-01-integracao-cloud-ollama-hermes-nous-e-chaves-registro
    caminhos:
      - engine/llm_api.py
    parecer: engine/llm_api.py -- remove anthropic/claude-opus-5.5 e claude-sonnet-5.5 dos extras de deep_thinking
      no OpenRouter
  - registro: registro-2026-10-01-resiliencia-servidores-locais-e-triagem
    caminhos:
      - engine/llm_api.py
    parecer: engine/llm_api.py -- remove anthropic/claude-opus-5.5 e claude-sonnet-5.5 dos extras de deep_thinking
      no OpenRouter
  - registro: registro-2026-10-04-http-metrics-correlation-e-worker-shutdown
    caminhos:
      - engine/llm_api.py
    parecer: engine/llm_api.py -- remove anthropic/claude-opus-5.5 e claude-sonnet-5.5 dos extras de deep_thinking
      no OpenRouter
  - registro: registro-2026-10-04-remediacao-dependabot-pypdf
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
    caminhos:
      - uv.lock
    parecer: uv.lock -- sincroniza lockfile para fastapi 0.163.0
  - registro: registro-2026-10-05-resolucao-de-modelo-ollama-e-schema-json
    caminhos:
      - engine/llm_api.py
    parecer: engine/llm_api.py -- remove anthropic/claude-opus-5.5 e claude-sonnet-5.5 dos extras de deep_thinking
      no OpenRouter
  - registro: registro-2026-10-06-strata-moe-125b-e-dashboard-nexus
    caminhos:
      - engine/llm_api.py
    parecer: engine/llm_api.py -- remove anthropic/claude-opus-5.5 e claude-sonnet-5.5 dos extras de deep_thinking
      no OpenRouter
  - registro: registro-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - engine/llm_api.py
      - llm/openrouter_pool.py
      - pyproject.toml
      - uv.lock
    parecer: engine/llm_api.py -- remove anthropic/claude-opus-5.5 e claude-sonnet-5.5 dos extras de deep_thinking
      no OpenRouter; llm/openrouter_pool.py -- le HKLM antes de HKCU e adiciona 7 chaves nomeadas OPENROUTER_*_KEY
      ao Tier 4; pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: registro-2026-10-10-evolucao-malha-agentica-sota-v8-gold
    caminhos:
      - llm/orchestrator.py
      - llm/providers.py
    parecer: llm/orchestrator.py -- extrai _resolve_designated_model e _prioritize_model e curto-circuita
      provedores anthropic ou openai sem chave fora de pytest; llm/providers.py -- consulta disponibilidade
      em gemini_pool_manager._stats na quarentena com contextlib.suppress, registra falha de rota no inicio
      de _handle_5xx_error e extrai HTTP status por regex
  - registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
    caminhos:
      - uv.lock
    parecer: uv.lock -- sincroniza lockfile para fastapi 0.163.0
  - registro: registro-2026-10-13-saneamento-diagnosticos-ide-e-compatibilidade
    caminhos:
      - llm/gemini_pool.py
      - llm/orchestrator.py
      - llm/routing_policy.py
    parecer: llm/gemini_pool.py -- le HKLM antes de HKCU para preservar precedencia do usuario e inclui
      chaves auxiliares GEMINI_{IMAGE,TRANSLATE,TTS,VIDEO}_KEY no pool; llm/orchestrator.py -- extrai
      _resolve_designated_model e _prioritize_model e curto-circuita provedores anthropic ou openai sem
      chave fora de pytest; llm/routing_policy.py -- retorna False em _check_provider_availability_sync
      para provider anthropic fora de pytest
  - registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
    caminhos:
      - .vscode/settings.json
      - pyproject.toml
      - uv.lock
    parecer: .vscode/settings.json -- exclui .pytest_tmp de search/watcher/files e expande filtros de
      exclusao do Java Language Server; pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0;
      uv.lock -- sincroniza lockfile para fastapi 0.163.0
  - registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: registro-2026-10-18-resolucao-sonarqube-e-saneamento-global
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- exclui .pytest_tmp de search/watcher/files e expande filtros de
      exclusao do Java Language Server
  - registro: registro-2026-10-19-saneamento-linters-markdown-e-conformidade-tipagem
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- exclui .pytest_tmp de search/watcher/files e expande filtros de
      exclusao do Java Language Server
  - registro: registro-2026-10-19-saneamento-warnings-skills-e-memoria-agentica
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- exclui .pytest_tmp de search/watcher/files e expande filtros de
      exclusao do Java Language Server
  - registro: registro-2026-10-20-harmonizacao-tier1-e-gemini-38
    caminhos:
      - data/routing_map.json
      - data/system_config.json
      - engine/llm_api.py
      - llm/routing_policy.py
    parecer: data/routing_map.json -- remove modelos claude-* e gpt-6* sem saldo das cadeias de fallback
      e prioriza Gemini, OpenRouter free e Gemma 4 local; data/system_config.json -- alinha model_routing
      (deep_thinking, fast_operations, coding, general_purpose) aos provedores ativos Gemini, OpenRouter
      free e local; engine/llm_api.py -- remove anthropic/claude-opus-5.5 e claude-sonnet-5.5 dos extras
      de deep_thinking no OpenRouter; llm/routing_policy.py -- retorna False em _check_provider_availability_sync
      para provider anthropic fora de pytest
  - registro: registro-2026-10-20-saneamento-quality-gate-ascii-e-reconciliacao-de-ancoras
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- exclui .pytest_tmp de search/watcher/files e expande filtros de
      exclusao do Java Language Server
  - registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
    caminhos:
      - .vscode/settings.json
      - llm/routing_policy.py
    parecer: .vscode/settings.json -- exclui .pytest_tmp de search/watcher/files e expande filtros de
      exclusao do Java Language Server; llm/routing_policy.py -- retorna False em _check_provider_availability_sync
      para provider anthropic fora de pytest
  - registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: registro-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: registro-2026-10-27-elevacao-dependencias-python-openai-pyspark-pytest
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: registro-2026-10-27-evolucao-project-context-e-reconciliacao-sota
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
    caminhos:
      - engine/llm_api.py
      - uv.lock
    parecer: engine/llm_api.py -- remove anthropic/claude-opus-5.5 e claude-sonnet-5.5 dos extras de deep_thinking
      no OpenRouter; uv.lock -- sincroniza lockfile para fastapi 0.163.0
  - registro: registro-2026-10-28-atualizacao-laya-e-estabilizacao-playwright-smoke
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
    caminhos:
      - .vscode/settings.json
      - pyproject.toml
      - uv.lock
    parecer: .vscode/settings.json -- exclui .pytest_tmp de search/watcher/files e expande filtros de
      exclusao do Java Language Server; pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0;
      uv.lock -- sincroniza lockfile para fastapi 0.163.0
  - registro: registro-2026-10-31-estabilizacao-lifecycle-warmup-turbopack
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: registro-2026-10-31-refatoracao-cfr-tipagem-e-higiene
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- exclui .pytest_tmp de search/watcher/files e expande filtros de
      exclusao do Java Language Server
  - registro: registro-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: registro-2026-11-03-elevacao-dependencias-pyarrow-openai-anthropic-laya
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: registro-2026-11-03-otimizacao-agentes-watchdog-e-calibracao
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: registro-2026-11-03-remediacao-dependabot-pypdf-pyasn1-minimatch
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: registro-2026-11-04-otimizacao-layout-header-e-elevacao-dependencias
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
    caminhos:
      - .vscode/settings.json
      - pyproject.toml
    parecer: .vscode/settings.json -- exclui .pytest_tmp de search/watcher/files e expande filtros de
      exclusao do Java Language Server; pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0
  - registro: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
    caminhos:
      - llm/budget.py
      - llm/gemini_pool.py
      - llm/openrouter_pool.py
      - pyproject.toml
      - uv.lock
    parecer: llm/budget.py -- restringe prefixo GOOGLE em GEMINI_KEYS, coleta OLLAMA_API_KEY/OLLAMA_CLOUD_KEY
      do Windows Registry e concatena pool_keys + extra em _gemini_key_pool_for_model; llm/gemini_pool.py
      -- le HKLM antes de HKCU para preservar precedencia do usuario e inclui chaves auxiliares GEMINI_{IMAGE,TRANSLATE,TTS,VIDEO}_KEY
      no pool; llm/openrouter_pool.py -- le HKLM antes de HKCU e adiciona 7 chaves nomeadas OPENROUTER_*_KEY
      ao Tier 4; pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
    caminhos:
      - .vscode/settings.json
      - llm/providers.py
      - pyproject.toml
      - uv.lock
    parecer: .vscode/settings.json -- exclui .pytest_tmp de search/watcher/files e expande filtros de
      exclusao do Java Language Server; llm/providers.py -- consulta disponibilidade em gemini_pool_manager._stats
      na quarentena com contextlib.suppress, registra falha de rota no inicio de _handle_5xx_error e extrai
      HTTP status por regex; pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock
      -- sincroniza lockfile para fastapi 0.163.0
  - registro: registro-2026-11-07-elevacao-dependencias-fastapi-regex-types-aiofiles
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: registro-2026-11-08-elevacao-dependencias-regex-e-laya
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: registro-2026-11-08-elevacao-polars-2-1-e-consumo-integral-engines-sota
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: registro-2026-11-08-elevacao-pypdf-7-0-torchvision-e-ecossistema-npm
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: registro-2026-11-08-integracao-sota-suite-antigravity-sdk-cli-acp
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- exclui .pytest_tmp de search/watcher/files e expande filtros de
      exclusao do Java Language Server
  - registro: registro-2026-11-08-integracao-sota-triade-stitch-exa-jules
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: registro-2026-11-08-otimizacao-pyproject-dependencias-extras-e-reconciliacao
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: registro-2026-11-09-elevacao-dependencias-e-fork-eigen
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: registro-2026-11-10-bump-deps-e-extra-paths-pylance
    caminhos:
      - .vscode/settings.json
      - pyproject.toml
      - uv.lock
    parecer: .vscode/settings.json -- exclui .pytest_tmp de search/watcher/files e expande filtros de
      exclusao do Java Language Server; pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0;
      uv.lock -- sincroniza lockfile para fastapi 0.163.0
  - registro: registro-2026-11-10-google-genai-3-1-0
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: registro-2026-11-11-elevacao-fastapi-playwright-e-bump-deep-research
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: registro-2026-11-11-elevacao-pypdf-turbo-ai-sdk-google
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: registro-2026-11-11-elevacao-sentence-transformers-genai-prettier-exa-mcp
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: registro-2026-11-11-elevacao-typer-types-knip-harmonizacao
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: registro-2026-11-11-nota-pareamento-dev-dependency-groups
    caminhos:
      - pyproject.toml
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0
  - registro: registro-2026-11-12-ollama-cloud-provider
    caminhos:
      - llm/budget.py
      - llm/orchestrator.py
      - llm/providers.py
    parecer: llm/budget.py -- restringe prefixo GOOGLE em GEMINI_KEYS, coleta OLLAMA_API_KEY/OLLAMA_CLOUD_KEY
      do Windows Registry e concatena pool_keys + extra em _gemini_key_pool_for_model; llm/orchestrator.py
      -- extrai _resolve_designated_model e _prioritize_model e curto-circuita provedores anthropic ou
      openai sem chave fora de pytest; llm/providers.py -- consulta disponibilidade em gemini_pool_manager._stats
      na quarentena com contextlib.suppress, registra falha de rota no inicio de _handle_5xx_error e extrai
      HTTP status por regex
  - registro: registro-2026-11-12-review-sweeps-endurecimento-sota
    caminhos:
      - .vscode/settings.json
      - llm/budget.py
      - llm/gemini.py
      - llm/gemini_pool.py
      - llm/orchestrator.py
    parecer: .vscode/settings.json -- exclui .pytest_tmp de search/watcher/files e expande filtros de
      exclusao do Java Language Server; llm/budget.py -- restringe prefixo GOOGLE em GEMINI_KEYS, coleta
      OLLAMA_API_KEY/OLLAMA_CLOUD_KEY do Windows Registry e concatena pool_keys + extra em _gemini_key_pool_for_model;
      llm/gemini.py -- substitui raise_for_status por checagem explicita status != 200 com leitura de
      erro antes de fechar o contexto HTTP e registra mark_success/mark_failure no fallback nativo; llm/gemini_pool.py
      -- le HKLM antes de HKCU para preservar precedencia do usuario e inclui chaves auxiliares GEMINI_{IMAGE,TRANSLATE,TTS,VIDEO}_KEY
      no pool; llm/orchestrator.py -- extrai _resolve_designated_model e _prioritize_model e curto-circuita
      provedores anthropic ou openai sem chave fora de pytest
  - registro: registro-2026-11-13-elevacao-deps-e-saneamento-configs-ide
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: registro-2026-11-13-revisao-ancora-pyproject-extra-path-cockpit
    caminhos:
      - pyproject.toml
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0
  - registro: registro-2026-11-14-correcao-devin-e-entrypoints-gemini-3-1-pro
    caminhos:
      - data/routing_map.json
      - data/system_config.json
    parecer: data/routing_map.json -- remove modelos claude-* e gpt-6* sem saldo das cadeias de fallback
      e prioriza Gemini, OpenRouter free e Gemma 4 local; data/system_config.json -- alinha model_routing
      (deep_thinking, fast_operations, coding, general_purpose) aos provedores ativos Gemini, OpenRouter
      free e local
  - registro: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: registro-2026-11-14-stitch-skills-tsconfig-e-refatoracoes-sonar
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- exclui .pytest_tmp de search/watcher/files e expande filtros de
      exclusao do Java Language Server
  - registro: registro-2026-11-14-sync-uvlock-ollama-cloud-circuit-e-ci
    caminhos:
      - llm/providers.py
      - pyproject.toml
      - uv.lock
    parecer: llm/providers.py -- consulta disponibilidade em gemini_pool_manager._stats na quarentena
      com contextlib.suppress, registra falha de rota no inicio de _handle_5xx_error e extrai HTTP status
      por regex; pyproject.toml -- eleva piso de fastapi de >=0.162.7 para >=0.163.0; uv.lock -- sincroniza
      lockfile para fastapi 0.163.0
  - registro: relatorio-fusao-cerebro-claude-quality-gate-2026-09-01
    caminhos:
      - data/system_config.json
    parecer: data/system_config.json -- alinha model_routing (deep_thinking, fast_operations, coding,
      general_purpose) aos provedores ativos Gemini, OpenRouter free e local
verificado:
  - ruff check e ruff format --check aprovados em llm/providers.py apos correcao de S110 via contextlib.suppress
  - ruff check aprovado nos 11 arquivos Python alterados no conjunto em stage
  - record_anchor_gate.ps1 e record_gate.py aprovados sobre o indice staged
  - pytest tests -k 'providers or gemini_pool' (8 passed, 2220 deselected, 0 errors/warnings) apos edicao
    de llm/providers.py
nao_verificado:
  - Suite completa pytest e frontend Next.js build nao reexecutados integralmente apos correcao pontual
    de lint em llm/providers.py
  - Execucao live de scripts/validation/hrc-native-read.mjs contra instalacao local do HRC e JDK
---

# Reconciliacao de Ancoras -- Roteamento, Pools, Transporte HTTP e Validacao HRC

## 1. Alteracoes Auditadas e Preparadas em Stage
- **Roteamento e Curto-Circuito (`data/routing_map.json`, `data/system_config.json`, `engine/llm_api.py`, `llm/orchestrator.py`, `llm/routing_policy.py`):** Removidos modelos `claude-*` e `gpt-6*` sem saldo das cadeias de fallback, priorizando Gemini, OpenRouter `:free` e modelos locais; `anthropic` e `openai` sem chave sofrem curto-circuito fora de `PYTEST_CURRENT_TEST`.
- **Pools de Chaves e Registry (`llm/budget.py`, `llm/gemini_pool.py`, `llm/openrouter_pool.py`):** Leitura de `HKLM` antes de `HKCU` preserva precedencia de usuario; `OLLAMA_API_KEY`/`OLLAMA_CLOUD_KEY` coletadas via Registry; chaves auxiliares Gemini e 7 chaves nomeadas OpenRouter agregadas aos respectivos pools.
- **Transporte HTTP e Failover Local (`llm/gemini.py`, `llm/openrouter.py`, `llm/gemma_local.py`, `llm/providers.py`):** Checagem `status != 200` com leitura do corpo antes do fechamento do contexto HTTP, contabilizacao de sucesso/falha no fallback nativo Gemini, deteccao de erro em stream 200 do Gemma local, checagem de `gemini_pool_manager._stats` em `GeminiStrategy.check_quarantine` usando `contextlib.suppress(Exception)` (sem `S110` e sem supressor sem `Record-Id`).
- **Validacao HRC, Benchmark ICM, IDE e Lock (`scripts/validation/HrcNativeReadProbe.java`, `scripts/validation/hrc-native-read.mjs`, `scripts/validation/exportar_benchmark_icm_publico.py`, `.vscode/settings.json`, `pyproject.toml`, `uv.lock`):** Pacote Java declarado com atualizacao do FQCN no runner `.mjs`, helpers extraidos no exportador ICM, filtros `.pytest_tmp`/Java expandidos no VS Code e `fastapi` elevado para `0.163.0`.
