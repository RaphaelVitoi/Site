---
id: registro-2026-11-15-laya-0432-failover-arquitetura-s1
tipo: registro
escopo: Site -- integracao arquitetura SOTA 4 camadas (Gemini HTTP/caching, Gemma 4/EmbeddingGemma 2 MRL, llama.cpp Vulkan :9931, laya 0.4.32 min_confidence, failover bidirecional S1 e runtime gemini-4-hydrogen)
ecossistema: nexus-sota
autor: Gemini <noreply@google.com>
criado_em: '2026-11-15T04:28:00-03:00'
atualizado_em: '2026-11-15T05:17:00-03:00'
classes:
- interno
- medido
- governanca
config_medida:
  congelada_em: '2026-11-15'
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data: '2026-11-15'
caminhos:
- data/engine_capabilities.json
- data/ollama_models.json
- data/routing_map.json
- data/system_config.json
- llm/adapters.py
- llm/gemini.py
- llm/gemini_decisions.py
- llm/laya_bridge.py
- llm/model_registry.py
- llm/routing.py
- llm/routing_policy.py
- llm/system2_local.py
- memory_rag.py
- reports/REGISTRO-2026-11-15-laya-0432-failover-arquitetura-s1.md
- scripts/ops/homologar_laya_gpu.py
- tests/test_adapters_gemini_http.py
- tests/test_gemini_decisions.py
- tests/test_lancedb_chroma_dual_rag.py
- tests/test_model_registry.py
- tests/test_system2_local.py
revisoes_de_ancora:
- registro: auditoria-2026-09-02-curadoria-mcp-e-processos-residuais
  caminhos:
  - data/system_config.json
  parecer: 'Revisado contra o diff: preserva catalogo MCP e timeouts em system_config.json, adicionando apenas gemini-4-hydrogen em protect_models e listas de model_routing.'
- registro: auditoria-2026-09-03-trabalho-do-gemini-3-8-flash
  caminhos:
  - data/ollama_models.json
  - data/routing_map.json
  - data/system_config.json
  - llm/model_registry.py
  - llm/routing_policy.py
  parecer: 'Revisado contra o diff: preserva Gemini 3.8 Flash como ativo em registry, routing_policy (ROTAS intacta), routing_map e system_config; adiciona gemini-4-hydrogen no runtime e cataloga embeddinggemma-2/functiongemma/translategemma em Ollama.'
- registro: auditoria-2026-09-07-preludio-jules-astra-e-correcao-da-delegacao
  caminhos:
  - llm/model_registry.py
  - tests/test_model_registry.py
  parecer: 'Revisado contra o diff: preserva regras de delegacao/verificacao e adiciona entrada gemini-4-hydrogen com teste unitario dedicado.'
- registro: auditoria-2026-09-08-o-que-esta-em-aberto-na-malha
  caminhos:
  - memory_rag.py
  parecer: 'Revisado contra o diff: mantem LanceDBBackend, MemoryRAG e fallback nomic-embed-text; corrige default OLLAMA_API_BASE e adiciona embed_with_ollama_mrl.'
- registro: auditoria-2026-09-12-o-ci-vermelho-que-nenhum-portao-local-media
  caminhos:
  - llm/model_registry.py
  parecer: 'Revisado contra o diff: validadores estritos de ModelCapability mantidos e respeitados pela nova entrada gemini-4-hydrogen.'
- registro: auditoria-2026-09-24-laya-multilingual-s1
  caminhos:
  - data/engine_capabilities.json
  - llm/laya_bridge.py
  parecer: 'Revisado contra o diff: mantem canonical-model=multilingual, proveniencia S4 e cpu-gating por default; adiciona revision e helpers 0.4.32.'
- registro: handoff-2026-08-29-roteamento-memoria-e-guard
  caminhos:
  - memory_rag.py
  parecer: 'Revisado contra o diff: preserva contratos de roteamento e guarda de memoria existentes, acrescentando apenas truncamento MRL + L2.'
- registro: handoff-2026-08-30-sanitizacao-linter-e-homeostase-total
  caminhos:
  - tests/test_lancedb_chroma_dual_rag.py
  parecer: 'Revisado contra o diff: mantem suite dual-RAG verde e adiciona teste unitario hermetico para truncamento MRL e norma L2.'
- registro: handoff-2026-09-02-curadoria-mcp-quarentena-e-roteamento-lazy
  caminhos:
  - data/system_config.json
  parecer: 'Revisado contra o diff: configuracao lazy/quarentena MCP intocada; alteracao restrita a protect_models e model_routing.'
- registro: handoff-2026-09-13-integracao-de-engines-wasm-e-economia-de-gate
  caminhos:
  - data/engine_capabilities.json
  parecer: 'Revisado contra o diff: acrescenta metadados factuais de laya-package=0.4.32 e failover bidirecional em assumptions sem alterar schemas WASM.'
- registro: handoff-2026-09-22-integracao-system1-llm-dashboard
  caminhos:
  - llm/gemini.py
  - llm/laya_bridge.py
  parecer: 'Revisado contra o diff: preserva contratos S1/LLM, corrige repasse de _model em call_gemini e adiciona min_confidence no cliente remoto :8192.'
- registro: handoff-2026-09-24-laya-gpu-homologacao-e-solver-bridge
  caminhos:
  - data/engine_capabilities.json
  - llm/laya_bridge.py
  - scripts/ops/homologar_laya_gpu.py
  parecer: 'Revisado contra o diff: respeita fallback deterministico em CPU e propaga min_confidence no endpoint FastAPI /predict e em laya_predict_remote.'
- registro: handoff-2026-09-24-laya-multilingual-s1-integracao
  caminhos:
  - data/engine_capabilities.json
  - llm/laya_bridge.py
  parecer: 'Revisado contra o diff: confirma convaiinnovations/laya-multilingual como checkpoint canonico e fixa revisao pinned da versao 0.4.32.'
- registro: handoff-2026-09-24-laya-pesos-carregados-e-microservico
  caminhos:
  - scripts/ops/homologar_laya_gpu.py
  parecer: 'Revisado contra o diff: mantem /health e /solve intactos, adicionando apenas campo opcional min_confidence [0.0, 1.0] em PredictRequest.'
- registro: handoff-2026-09-25-pool-rotacional-gemini-flash-lite
  caminhos:
  - llm/gemini.py
  parecer: 'Revisado contra o diff: preserva pool rotacional, rate limiter e estrutura de call_gemini; corrige propagacao de modelo para _build_gemini_payload.'
- registro: handoff-2026-09-30-expurgo-de-modelos-obsoletos-harmonizacao-qwen-e-calibracao
  caminhos:
  - data/routing_map.json
  - data/system_config.json
  - llm/routing.py
  parecer: 'Revisado contra o diff: nenhum modelo obsoleto reintroduzido; gemini-4-hydrogen integrado a familia Gemini 4 em routing.py e sincronizado em system_config.json/routing_map.json.'
- registro: handoff-2026-10-20-harmonizacao-tier1-gemini-38
  caminhos:
  - llm/adapters.py
  - llm/model_registry.py
  - llm/routing.py
  - llm/routing_policy.py
  parecer: 'Revisado contra o diff: preserva tabela ROTAS e hierarquia Tier 1; inclui gemini-4-hydrogen como nao_verificado com suporte no adaptador e registry.'
- registro: handoff-2026-11-10-boot-persistente-mesh-mcp-e-cockpit
  caminhos:
  - scripts/ops/homologar_laya_gpu.py
  parecer: 'Revisado contra o diff: preserva bootstrap e porta :8192 sem alterar flags de inicializacao ou healthcheck.'
- registro: handoff-2026-11-14-decision1-laya-s1-s2-e-ancoras
  caminhos:
  - llm/gemini_decisions.py
  - llm/laya_bridge.py
  - llm/system2_local.py
  - scripts/ops/homologar_laya_gpu.py
  - tests/test_gemini_decisions.py
  - tests/test_system2_local.py
  parecer: 'Revisado contra o diff: amplia cascata decide_s1 com failover bidirecional, aliases b12387 em :9931, min_confidence em :8192 e testes hermeticos.'
- registro: plano-laya-integracao-s1s2-pmev-2026-09-20
  caminhos:
  - data/engine_capabilities.json
  - llm/laya_bridge.py
  - llm/model_registry.py
  - llm/routing_policy.py
  parecer: 'Revisado contra o diff: preserva separacao S1/S2 e ruin_priority para o motor PMev; local e modelos de raciocinio continuam roteados separadamente.'
- registro: registro-2026-09-02-adapters-ligado-ao-caminho-real-anthropic
  caminhos:
  - llm/adapters.py
  parecer: 'Revisado contra o diff: nenhuma alteracao em AnthropicAdapter; contrato de traducao preservado integralmente.'
- registro: registro-2026-09-05-saneamento-nexus-ollama-e-auto-diagnostico
  caminhos:
  - data/ollama_models.json
  parecer: 'Revisado contra o diff: catalogo mantido integro e sincronizado com os 5 novos modelos Gemma/EmbeddingGemma 2 ativos em :11434.'
- registro: registro-2026-09-07-delegacao-gemini-flash-lite-cinco-itens
  caminhos:
  - llm/model_registry.py
  - tests/test_model_registry.py
  parecer: 'Revisado contra o diff: papel e precos de gemini-3.5-flash-lite preservados; novo gemini-4-hydrogen segue cota_por_assinatura=True.'
- registro: registro-2026-09-07-integracao-gpt6-astra-e-retirada-do-fable
  caminhos:
  - llm/adapters.py
  - llm/model_registry.py
  - llm/routing_policy.py
  - tests/test_model_registry.py
  parecer: 'Revisado contra o diff: adaptadores OpenAI/Anthropic e rotas GPT-6 intocados; adicao de gemini-4-hydrogen testada em test_model_registry.py.'
- registro: registro-2026-09-07-promocao-do-duo-gemini-na-faixa-gratuita
  caminhos:
  - llm/routing_policy.py
  parecer: 'Revisado contra o diff: duo Gemini Flash/Flash-Lite na faixa gratuita mantido sem alteracao na tabela ROTAS.'
- registro: registro-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem
  caminhos:
  - llm/adapters.py
  - llm/gemini.py
  - llm/model_registry.py
  - tests/test_adapters_gemini_http.py
  - tests/test_model_registry.py
  parecer: 'Revisado contra o diff: reforca proibicao de temperatura legada e niveis especulativos (xhigh/max), incluindo gemini-4-hydrogen em thinking_level e testes HTTP.'
- registro: registro-2026-09-08-ruff-format-e-o-ci-vermelho
  caminhos:
  - llm/adapters.py
  - llm/model_registry.py
  parecer: 'Revisado contra o diff: arquivos permanecem em conformidade total com ruff check e pyright (0 erros).'
- registro: registro-2026-09-13-contrato-de-capacidades-e-paridade-de-engines
  caminhos:
  - data/engine_capabilities.json
  parecer: 'Revisado contra o diff: preserva todos os campos obrigatorios do contrato Secao 4 em laya-s1-predict e gemini-decision-1.'
- registro: registro-2026-09-19-refatoracao-sonar-python-e-icm
  caminhos:
  - llm/model_registry.py
  - llm/routing_policy.py
  parecer: 'Revisado contra o diff: nenhuma complexidade ciclomatica adicionada; somente constantes e entrada declarativa em MODELOS.'
- registro: registro-2026-09-23-evolucao-pendencias-laya-e-tarefas
  caminhos:
  - llm/laya_bridge.py
  parecer: 'Revisado contra o diff: preserva LAYA_POKER_PRESETS e caminhos de roteamento zero-download existentes.'
- registro: registro-2026-09-24-blindagem-ascii-e-harmonizacao-scripts
  caminhos:
  - llm/adapters.py
  - llm/gemini.py
  - llm/laya_bridge.py
  - llm/routing_policy.py
  - memory_rag.py
  - scripts/ops/homologar_laya_gpu.py
  - tests/test_lancedb_chroma_dual_rag.py
  parecer: 'Revisado contra o diff: codigo, constantes, metadados e testes seguem estritamente ASCII em strings estruturais e validacoes.'
- registro: registro-2026-09-24-harmonizacao-arquitetura-hibrida-vulkan-pytorch
  caminhos:
  - data/engine_capabilities.json
  parecer: 'Revisado contra o diff: mantem invariantes da arquitetura hibrida Vulkan GGUF + PyTorch CPU override no Windows.'
- registro: registro-2026-09-24-laya-gpu-homologacao-e-solver-bridge
  caminhos:
  - data/engine_capabilities.json
  - llm/laya_bridge.py
  - scripts/ops/homologar_laya_gpu.py
  parecer: 'Revisado contra o diff: mantem compatibilidade total com laya_solver_adapter e flags de device em :8192.'
- registro: registro-2026-09-24-laya-multilingual-s1-integracao
  caminhos:
  - data/engine_capabilities.json
  - llm/laya_bridge.py
  parecer: 'Revisado contra o diff: integra vega=auto e gates de confianca da v0.4.32 preservando fallback heuristico.'
- registro: registro-2026-09-24-laya-pesos-carregados-e-microservico
  caminhos:
  - scripts/ops/homologar_laya_gpu.py
  parecer: 'Revisado contra o diff: adiciona apenas min_confidence opcional ao contrato HTTP de /predict sem quebrar compatibilidade.'
- registro: registro-2026-09-24-retificacao-hardware-gpu-amd-vulkan
  caminhos:
  - scripts/ops/homologar_laya_gpu.py
  parecer: 'Revisado contra o diff: nenhuma mudanca em probe CUDA/Vulkan ou gating CPU no Windows.'
- registro: registro-2026-09-25-laya-warmup-persistencia-e-timeout-s1
  caminhos:
  - scripts/ops/homologar_laya_gpu.py
  parecer: 'Revisado contra o diff: fluxo de warmup e telemetria /health preservados sem alteracao.'
- registro: registro-2026-09-25-pool-rotacional-gemini-flash-lite
  caminhos:
  - llm/gemini.py
  parecer: 'Revisado contra o diff: integracao com GeminiPoolManager e circuit breaker mantida intacta.'
- registro: registro-2026-09-29-saneamento-lint-e-calibracao
  caminhos:
  - llm/gemini.py
  - scripts/ops/homologar_laya_gpu.py
  parecer: 'Revisado contra o diff: moveu import re para toplevel em llm/gemini.py (Pylint 10.00/10) sem inserir avisos em homologar_laya_gpu.py.'
- registro: registro-2026-09-30-expurgo-de-modelos-obsoletos-e-reconciliacao-de-ancoras
  caminhos:
  - data/routing_map.json
  - data/system_config.json
  - llm/routing.py
  parecer: 'Revisado contra o diff: lista negra de modelos obsoletos intocada; PREFIX_GEMINI_4 e gemini-4-hydrogen mantem modelos antigos isolados e paridade routing_map/system_config.'
- registro: registro-2026-10-01-harmonizacao-malha-subagentes
  caminhos:
  - llm/routing_policy.py
  parecer: 'Revisado contra o diff: contrato de subagentes e niveis de delegacao em routing_policy.py preservados integralmente.'
- registro: registro-2026-10-10-evolucao-malha-agentica-sota-v8-gold
  caminhos:
  - llm/routing.py
  parecer: 'Revisado contra o diff: heuristicas de pontuacao e custo relativo em llm/routing.py estendidas apenas para prefixo gemini-4.'
- registro: registro-2026-10-13-saneamento-diagnosticos-ide-e-compatibilidade
  caminhos:
  - llm/laya_bridge.py
  - llm/routing_policy.py
  parecer: 'Revisado contra o diff: mantem Pyright 0 errors e Ruff 0 errors em laya_bridge.py e routing_policy.py.'
- registro: registro-2026-10-18-resolucao-sonarqube-e-saneamento-global
  caminhos:
  - memory_rag.py
  parecer: 'Revisado contra o diff: novos helpers de embedding MRL isolados, tipados e com fallback explicito sem aumentar divida cognitiva.'
- registro: registro-2026-10-20-harmonizacao-tier1-e-gemini-38
  caminhos:
  - data/routing_map.json
  - data/system_config.json
  - llm/adapters.py
  - llm/model_registry.py
  - llm/routing.py
  - llm/routing_policy.py
  - tests/test_adapters_gemini_http.py
  - tests/test_model_registry.py
  parecer: 'Revisado contra o diff: preserva suite Gemini 3.8/Tier 1 e integra gemini-4-hydrogen ao lado de argon/carbon nos quatro modulos de runtime.'
- registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
  caminhos:
  - llm/routing.py
  - llm/routing_policy.py
  - tests/test_model_registry.py
  parecer: 'Revisado contra o diff: mantem conformidade das suites test_routing_policy.py e test_model_registry.py sem relaxar asserts.'
- registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
  caminhos:
  - tests/test_lancedb_chroma_dual_rag.py
  parecer: 'Revisado contra o diff: teste MRL adicionado segue tipagem Python 3.12+ e convencoes do pytest sem warnings.'
- registro: registro-2026-11-09-idempotencia-socket-laya-gpu-serve
  caminhos:
  - scripts/ops/homologar_laya_gpu.py
  parecer: 'Revisado contra o diff: logica de bind/socket idempotente em homologar_laya_gpu.py permanece inalterada.'
- registro: registro-2026-11-12-arquitetura-s1-s2-llama-vulkan
  caminhos:
  - data/engine_capabilities.json
  - llm/gemini_decisions.py
  - llm/system2_local.py
  - tests/test_gemini_decisions.py
  - tests/test_system2_local.py
  parecer: 'Revisado contra o diff: preserva arquitetura S1/S2/Vulkan e registra novos aliases do roteador :9931.'
- registro: registro-2026-11-12-governanca-identidades-e-assinaturas
  caminhos:
  - llm/model_registry.py
  parecer: 'Revisado contra o diff: gemini-4-hydrogen declara explicitamente cota_por_assinatura=True alinhada a data/agent_identities.json.'
- registro: registro-2026-11-12-ollama-cloud-provider
  caminhos:
  - llm/routing.py
  parecer: 'Revisado contra o diff: roteamento e pontuacao Ollama em llm/routing.py inalterados.'
- registro: registro-2026-11-12-pool-multimodal-e-refactors-sonar
  caminhos:
  - data/engine_capabilities.json
  - llm/gemini_decisions.py
  - llm/system2_local.py
  parecer: 'Revisado contra o diff: preserva DecisionPoolManager, deteccao multimodal e complexidade cognitiva baixa.'
- registro: registro-2026-11-12-pools-chaves-reposicao-e-doc-consolidada
  caminhos:
  - data/engine_capabilities.json
  parecer: 'Revisado contra o diff: mantem contratos e tags de proveniencia sem regressao nas suposicoes do pool.'
- registro: registro-2026-11-12-review-sweeps-endurecimento-sota
  caminhos:
  - llm/gemini.py
  - llm/gemini_decisions.py
  - llm/system2_local.py
  - memory_rag.py
  - tests/test_gemini_decisions.py
  - tests/test_system2_local.py
  parecer: 'Revisado contra o diff: preserva invariantes fail-closed, correcao de _model em call_gemini e testes MRL/:8192.'
- registro: registro-2026-11-14-correcao-devin-e-entrypoints-gemini-3-1-pro
  caminhos:
  - data/routing_map.json
  - data/system_config.json
  - llm/adapters.py
  - llm/model_registry.py
  - tests/test_model_registry.py
  parecer: 'Revisado contra o diff: entrypoints gemini-3.1-pro-* mantidos em primeiro plano; gemini-4-hydrogen adicionado em seguida com paridade routing_map/system_config.'
- registro: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
  caminhos:
  - llm/gemini_decisions.py
  - llm/laya_bridge.py
  parecer: 'Revisado contra o diff: consolida laya 0.4.32 com zero regressao de lint, tipagem e complexidade cognitiva.'
- registro: registro-2026-11-14-laya-pylint-e-refactors-sonar
  caminhos:
  - llm/routing_policy.py
  - llm/system2_local.py
  parecer: 'Revisado contra o diff: preserva refatoracoes S3776 e conformidade Ruff/Pyright/Pylint em routing_policy.py e system2_local.py.'
- registro: registro-2026-11-14-llama-cpp-b12387-router-9931
  caminhos:
  - data/engine_capabilities.json
  - llm/routing_policy.py
  - llm/system2_local.py
  parecer: 'Revisado contra o diff: atualiza referencia do build para b12387 e aliases vivos no roteador :9931 sem impactar faixas de routing_policy.'
- registro: registro-2026-11-14-refino-laya-tracker-e-furb110
  caminhos:
  - llm/laya_bridge.py
  - scripts/ops/homologar_laya_gpu.py
  parecer: 'Revisado contra o diff: preserva extracao de tokens FURB110-safe e compatibilidade do endpoint /predict.'
- registro: registro-2026-11-14-roteamento-pools-transporte-e-validacao-hrc
  caminhos:
  - data/routing_map.json
  - data/system_config.json
  - llm/gemini.py
  - llm/routing_policy.py
  parecer: 'Revisado contra o diff: preserva pool/rate-limit/transporte HTTP, paridade routing_map/system_config e corrige encaminhamento de _model, thinkingConfig e cachedContent.'
- registro: registro-2026-11-14-stitch-skills-tsconfig-e-refatoracoes-sonar
  caminhos:
  - llm/laya_bridge.py
  - llm/system2_local.py
  parecer: 'Revisado contra o diff: helpers extraidos respeitam S3776 <= 15 e tipagem Pyright standard.'
- registro: relatorio-fusao-cerebro-claude-quality-gate-2026-09-01
  caminhos:
  - data/system_config.json
  parecer: 'Revisado contra o diff: estrutura de quality gate e thresholds em data/system_config.json preservados integralmente.'
- registro: validacao-2026-08-28-arquitetura-de-memoria
  caminhos:
  - memory_rag.py
  parecer: 'Revisado contra o diff: arquitetura dual LanceDB+Chroma preservada com suporte opcional a truncamento MRL (768->512/256/128).'
verificado:
  - JSON parse valido em data/system_config.json e data/routing_map.json (JSON_OK via uv run --no-sync python)
  - ruff check nos 10 modulos Python e 5 arquivos de teste alterados (0 erros apos ultimo edit)
  - pyright nos 10 modulos Python e 5 arquivos de teste alterados (0 errors, 0 warnings, 0 informations apos ultimo edit)
  - pytest em 5 suites pos-remediacao S110 (test_lancedb_chroma_dual_rag, test_chunking_rag, test_rag_id_unico, test_laya_bridge, test_model_registry) -> 86 passed in 71.75s, 0 errors, 0 warnings
  - pytest ampliado (test_declarado_e_lido, test_desambiguacao, test_model_registry) -> 51 passed in 10.67s + bateria de 19 suites -> 367 passed in 121.60s + pylint 10.00/10 nos 5 modulos llm/
  - Chamada externa ao vivo v1beta para gemini-4-hydrogen -- GET /v1beta/models/gemini-4-hydrogen HTTP 200 (inputTokenLimit=1048576, outputTokenLimit=65536, thinking=True) e call_gemini HTTP 200 retornando HYDROGEN_OK (thoughtsTokenCount=42)
  - Chamada externa ao vivo para gemini-decision-1 (POST /v1beta/decisions) via decide() e cascata decide_s1() -> engine=gemini-decision-1, is_mtt_icm=0.9782, street=preflop (0.9992) em 1452.7 ms apos gate min_confidence=0.65 sobre Laya
  - Microservico local laya-multilingual (127.0.0.1 port 8192 /health e /predict) -- cold JIT 3055.9 ms, warm steady-state 85.8 ms (timeout calibrado para 6000.0 ms em llm/laya_bridge.py)
  - Inspecao em disco dos bancos vetoriais -- data/lancedb nexus_knowledge = 14631 linhas x 384d; .claude/agent-memory/.chroma_db = 13244 linhas x 384d; data/chroma_db research_docs = 0 linhas (sem mistura 768d/512d em disco); guarda dimensional adicionada em LanceDBBackend e tabela MRL dedicada nexus_knowledge_mrl
nao_verificado:
  - Precificacao oficial publica de gemini-4-hydrogen ($1.00/$5.00 em llm/model_registry.py segue marcado como nao_verificado ate publicacao formal do card de billing Google)
  - Criacao/uso ao vivo de cachedContents com chave de faturamento paga -- medido ao vivo em 2026-11-15 que gemini-4-* (hydrogen/argon/carbon) ainda retorna HTTP 400 (Explicit caching is not supported) e as chaves atuais em Free Tier retornam HTTP 429 (TotalCachedContentStorageTokensPerModelFreeTier limit=0) em gemini-3.8-flash e gemini-3.1-pro-preview
---

# Integracao SOTA 4 Camadas + `laya 0.4.32` + Failover Bidirecional S1 + Runtime `gemini-4-hydrogen`

## Mudancas Aplicadas

1. `llm/gemini.py` e `llm/adapters.py` (Camadas 2-4 Gemini HTTP, Thinking e Explicit Caching):
   - Corrigiu bug em `call_gemini` que omitia `_model=model` ao chamar `_build_gemini_payload`, fazendo `model_str` ficar vazio (injetando `temperature=0.2` legada e omitindo `thinkingConfig`).
   - Expandiu `_normalize_gemini_model`, `_is_gemini_3x` e `_is_thinking_capable` para cobrir `gemini-4` (`argon`, `carbon`, `hydrogen`), `3.1` e `pro-latest`.
   - Validou `thinking_level` (`minimal`, `low`, `medium`, `high`) rejeitando niveis especulativos (`xhigh`, `max`) e bloqueando `minimal` em `gemini-4-carbon`, `gemini-4-argon` e `gemini-4-hydrogen`.
   - Adicionou encaminhamento de `cached_content` / `cachedContent` para `payload["cachedContent"]` tanto em `GoogleGenAIAdapter.build_http` quanto em `_build_gemini_payload`.
2. `memory_rag.py` e `data/ollama_models.json` (Camada 0 RAG MRL local e isolamento dimensional):
   - Catalogou `embeddinggemma-2:270m` (`0.28 GB`), `embeddinggemma-2:440m` (`0.62 GB`), `embeddinggemma-2:740m` (`1.2 GB`), `functiongemma:270m` (`0.28 GB`) e `translategemma:4b` (`3.07 GB`) em `data/ollama_models.json`.
   - Adicionou `VALID_MRL_DIMS = (768, 512, 256, 128)`, `truncate_and_l2_normalize` e `embed_with_ollama_mrl` via `OLLAMA_API_BASE` (`:11434/api/embed`) com fallback automatico para `nomic-embed-text`.
   - Adicionou `LANCEDB_MRL_TABLE_NAME = "nexus_knowledge_mrl"`, parametro `vector_dim` / `table_name` e guarda `_validate_vector_dim` em `LanceDBBackend`, isolando o indice legado 384d (14.631 linhas) de vetores MRL 512d.
3. `llm/system2_local.py` (Roteador `llama.cpp` Vulkan `:9931`):
   - Alinhou referencia para `llama.cpp` `b12387` e registrou aliases vivos (`gemma4:12b-qat`, `gpt-oss:20b`, `minicpm5:1b`, `ling:3b`) em `_LLAMA_ROUTER_ALIASES`.
4. `llm/laya_bridge.py`, `llm/gemini_decisions.py`, `scripts/ops/homologar_laya_gpu.py` e `data/engine_capabilities.json` (Camada 1 S1 + failover bidirecional):
   - Fixou revisao `0.4.32` de `convaiinnovations/laya-multilingual`, parametrizou `vega="auto"`, `min_confidence` e `allow_cpu_failover` e calibrou `_DEFAULT_SERVICE_TIMEOUT_MS = 6000.0` para cobrir cold JIT em CPU.
   - Fechou o contrato ponta-a-ponta de `min_confidence` entre `PredictRequest` (`/predict` em `:8192`), `_build_remote_predict_body`, `laya_predict_remote` e `laya_multilingual_failover`.
   - Conectou `decide_s1` em cascata bidirecional `gemini-decision-1 <-> laya-multilingual` e adicionou cobertura unitaria em `tests/test_adapters_gemini_http.py`, `tests/test_lancedb_chroma_dual_rag.py`, `tests/test_system2_local.py` e `tests/test_gemini_decisions.py`.
5. `llm/model_registry.py`, `llm/routing_policy.py`, `llm/routing.py`, `data/system_config.json` e `tests/test_model_registry.py` (Fechamento runtime de `gemini-4-hydrogen` e alinhamento com Gemma / Decision-1 / Laya):
   - Registrou `"gemini-4-hydrogen"` em `MODELOS` (`llm/model_registry.py`) com `AdapterType.GOOGLE`, `cota_por_assinatura=True`, `context_window_in=1_048_576`, `max_output_tokens=65_536`, `thinking_level="high"`, `thought_signature_mode="stateful"`, mantendo `VerificationStatus.NAO_VERIFICADO` apenas para precificacao nao publicada enquanto metadata e `generateContent` foram validados ao vivo.
   - Declarou constante `GEMINI_4_HYDROGEN = "gemini-4-hydrogen"` em `llm/routing_policy.py` preservando a tabela canonica `ROTAS` (Tier 0), com leitor unitario em `tests/test_model_registry.py` (`test_declarado_e_lido`), e adicionou `PREFIX_GEMINI_4 = "gemini-4"` + pontuacao/custo relativo em `llm/routing.py` (`_score_local_preference`, `_score_standard_preference`, `_custo_relativo`).
   - Adicionou `"gemini-4-hydrogen"` em `data/system_config.json` (`model_health_gate.protect_models` e `model_routing.deep_thinking`, `coding`, `general_purpose`) e em `data/routing_map.json` (`deep_thinking`), mantendo paridade (`test_desambiguacao`) e preservando S1 (`laya-multilingual` :8192 <-> `gemini-decision-1`) e S2 local (`gemma4:*` via `:17043` / `:11434` / `:9931`).
