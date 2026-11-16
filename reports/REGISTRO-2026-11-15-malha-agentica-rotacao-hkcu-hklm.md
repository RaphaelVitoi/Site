---
id: registro-2026-11-15-malha-agentica-rotacao-hkcu-hklm
tipo: registro
escopo: Site -- upgrade da malha de agentes customizados e subagentes, integracoes RAGFlow/n8n/Neo4j/Devin/Vercel, fallback llama-swap :8080, Docker Compose e pool rotacional HKCU/HKLM
ecossistema: nexus-sota
autor: Gemini (Antigravity) <noreply@google.com>
criado_em: '2026-11-15T20:25:00-03:00'
atualizado_em: '2026-11-15T20:25:00-03:00'
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
- agents/context_builder.py
- agents/execution.py
- core/mesh_integrations.py
- core/subagents_mesh.py
- data/routing_map.json
- data/system_config.json
- infra/.env.example
- infra/docker-compose.yml
- llm/free_router.py
- llm/local_llama_client.py
- llm/providers.py
- scripts/ops/Set-EcosystemCredential.ps1
- scripts/ops/devin_session_insights.py
- tests/test_mesh_integrations.py
- tests/test_subagents_mesh.py
- reports/REGISTRO-2026-11-15-malha-agentica-rotacao-hkcu-hklm.md
revisoes_de_ancora:
- registro: relatorio-fusao-cerebro-claude-quality-gate-2026-09-01
  caminhos:
  - data/system_config.json
  parecer: 'Revisado contra o diff -- portoes e flags de seguranca do system_config preservados; ajustado apenas model_routing.'
- registro: auditoria-2026-09-02-curadoria-mcp-e-processos-residuais
  caminhos:
  - data/system_config.json
  parecer: 'Revisado contra o diff -- bloco mcp_addon_routing preservado integralmente; alteracao restrita a model_routing.'
- registro: auditoria-2026-09-03-trabalho-do-gemini-3-8-flash
  caminhos:
  - data/routing_map.json
  - data/system_config.json
  parecer: 'Revisado contra o diff -- gemini-3.8-flash mantido no topo de deep_thinking e gemini-3.5-flash-lite no topo de fast_operations com paridade entre os dois arquivos.'
- registro: handoff-2026-09-02-curadoria-mcp-quarentena-e-roteamento-lazy
  caminhos:
  - data/system_config.json
  parecer: 'Revisado contra o diff -- configuracao lazy de addons MCP preservada.'
- registro: handoff-2026-09-19-documentos-loopback-sonar-e-download
  caminhos:
  - agents/execution.py
  parecer: 'Revisado contra o diff -- guardas existentes preservadas; adicionados apenas propagacao de metadados opcionais e despacho n8n condicional.'
- registro: handoff-2026-09-22-integracao-system1-llm-dashboard
  caminhos:
  - llm/free_router.py
  parecer: 'Revisado contra o diff -- contrato de execute_by_complexity e niveis locais preservados; adicionada rotacao de chaves e modelos :free no _call_openrouter.'
- registro: handoff-2026-09-25-modelos-locais-saneamento-e-homeostase
  caminhos:
  - llm/local_llama_client.py
  parecer: 'Revisado contra o diff -- health-check :9931/:8081..8083 preservado, ampliando fallback automatico para llama-swap :8080.'
- registro: handoff-2026-09-30-expurgo-de-modelos-obsoletos-harmonizacao-qwen-e-calibracao
  caminhos:
  - data/routing_map.json
  - data/system_config.json
  - llm/free_router.py
  parecer: 'Revisado contra o diff -- nenhum modelo obsoleto reintroduzido; familias Qwen, Gemma 4 e :free Laguna preservadas.'
- registro: handoff-2026-10-20-harmonizacao-tier1-gemini-38
  caminhos:
  - llm/free_router.py
  parecer: 'Revisado contra o diff -- precedencia Tier 1/free mantida sem regressao no SOTAUnifiedFreeRouter.'
- registro: handoff-2026-11-14-decision1-laya-s1-s2-e-ancoras
  caminhos:
  - llm/providers.py
  parecer: 'Revisado contra o diff -- roteamento S1/S2 preservado; GemmaLocalStrategy ganha fallback OpenAI-compatible :9931/:8080 quando :17043 estiver offline.'
- registro: registro-2026-09-01-cache-por-mtime-e-fusao-do-project-context
  caminhos:
  - agents/context_builder.py
  parecer: 'Revisado contra o diff -- mecanismo de cache por mtime preservado; expandido _query_collective_memory e _assemble_prompt de modo aditivo.'
- registro: registro-2026-09-01-identidade-de-agente-na-arvore-canonica
  caminhos:
  - agents/context_builder.py
  parecer: 'Revisado contra o diff -- identidade canonica dos agentes preservada integralmente.'
- registro: registro-2026-09-04-credenciais-submodulos-e-adaptador-hrc
  caminhos:
  - scripts/ops/Set-EcosystemCredential.ps1
  parecer: 'Revisado contra o diff -- segredos continuam fora do disco e fora do historico do shell, agora gravando em HKCU+HKLM com suporte a -Slot.'
- registro: registro-2026-09-07-orquestrador-api-keys-free-e-pmev
  caminhos:
  - llm/free_router.py
  parecer: 'Revisado contra o diff -- rotacao de chaves :free no free_router harmonizada com os testes existentes.'
- registro: registro-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem
  caminhos:
  - llm/free_router.py
  parecer: 'Revisado contra o diff -- assinaturas e adapters Gemini preservados.'
- registro: registro-2026-09-08-auditoria-de-tipagem-e-recorte-do-fingerprint
  caminhos:
  - llm/free_router.py
  parecer: 'Revisado contra o diff -- tipagem PEP 585/604 e lint preservados.'
- registro: registro-2026-09-08-ruff-format-e-o-ci-vermelho
  caminhos:
  - llm/free_router.py
  parecer: 'Revisado contra o diff -- validado com ruff check sem ocorrencias.'
- registro: registro-2026-09-11-auditoria-da-campanha-de-lint-em-31-testes
  caminhos:
  - llm/free_router.py
  parecer: 'Revisado contra o diff -- conformidade ruff e pytest preservada.'
- registro: registro-2026-09-18-dream-rsi-ligado-aula12-localizada-e-bounty-a-iniciar
  caminhos:
  - agents/execution.py
  parecer: 'Revisado contra o diff -- fluxo Dream/observadores intacto em _finish_task_success e _try_delegate_subagent_task.'
- registro: registro-2026-09-25-integracao-qwen-coder-e-blindagem-testes
  caminhos:
  - llm/local_llama_client.py
  parecer: 'Revisado contra o diff -- porta 8083 e fallback :9931 preservados com adicao de failover para :8080.'
- registro: registro-2026-09-25-modelos-locais-llama-g9v3-ling3
  caminhos:
  - llm/local_llama_client.py
  parecer: 'Revisado contra o diff -- mapeamento 8081/8082/8083/9931 preservado.'
- registro: registro-2026-09-29-saneamento-lint-e-calibracao
  caminhos:
  - llm/local_llama_client.py
  parecer: 'Revisado contra o diff -- supressoes S310 com Record-Id preservadas sem desvios.'
- registro: registro-2026-09-30-expurgo-de-modelos-obsoletos-e-reconciliacao-de-ancoras
  caminhos:
  - data/routing_map.json
  - data/system_config.json
  - llm/free_router.py
  parecer: 'Revisado contra o diff -- listas de roteamento mantidas sem modelos legados e alinhadas entre system_config e routing_map.'
- registro: registro-2026-10-01-harmonizacao-malha-subagentes
  caminhos:
  - tests/test_subagents_mesh.py
  parecer: 'Revisado contra o diff -- testes originais intactos e estendidos para fallback local e OpenRouter :free.'
- registro: registro-2026-10-10-evolucao-malha-agentica-sota-v8-gold
  caminhos:
  - agents/context_builder.py
  - agents/execution.py
  - core/subagents_mesh.py
  - llm/providers.py
  - tests/test_subagents_mesh.py
  parecer: 'Revisado contra o diff -- arquitetura v8.0 GOLD estendida de forma compativel com RAGFlow, n8n, Neo4j Aura, Devin/Vercel e llama-swap :8080.'
- registro: registro-2026-10-18-harmonizacao-malha-agentica-e-sota-engine
  caminhos:
  - core/subagents_mesh.py
  - tests/test_subagents_mesh.py
  parecer: 'Revisado contra o diff -- roteamento de subagentes prioriza modelos locais pequenos e fallback :free.'
- registro: registro-2026-10-18-resolucao-sonarqube-e-saneamento-global
  caminhos:
  - core/subagents_mesh.py
  parecer: 'Revisado contra o diff -- conformidade ruff e qualidade mantidas apos expansao dos fallbacks.'
- registro: registro-2026-10-20-harmonizacao-tier1-e-gemini-38
  caminhos:
  - data/routing_map.json
  - data/system_config.json
  - llm/free_router.py
  parecer: 'Revisado contra o diff -- gemini-3.8-flash e gemini-3.5-flash-lite alinhados com OpenRouter :free e modelos locais.'
- registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
  caminhos:
  - llm/providers.py
  parecer: 'Revisado contra o diff -- estrategias de provedores preservadas e aprovadas pelo ruff.'
- registro: registro-2026-11-12-ollama-cloud-provider
  caminhos:
  - llm/providers.py
  parecer: 'Revisado contra o diff -- OllamaCloudStrategy preservada integralmente.'
- registro: registro-2026-11-12-review-sweeps-endurecimento-sota
  caminhos:
  - agents/context_builder.py
  parecer: 'Revisado contra o diff -- endurecimentos anteriores preservados.'
- registro: registro-2026-11-14-correcao-devin-e-entrypoints-gemini-3-1-pro
  caminhos:
  - data/routing_map.json
  - data/system_config.json
  parecer: 'Revisado contra o diff -- entrypoints e roteamento preservados.'
- registro: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
  caminhos:
  - scripts/ops/devin_session_insights.py
  parecer: 'Revisado contra o diff -- compatibilidade e CLI preservados com failover rotacional entre DEVIN_API_TOKEN e DEVIN_API_KEY.'
- registro: registro-2026-11-14-laya-pylint-e-refactors-sonar
  caminhos:
  - core/subagents_mesh.py
  parecer: 'Revisado contra o diff -- sem regressao de complexidade ou tipagem.'
- registro: registro-2026-11-14-llama-cpp-b12387-router-9931
  caminhos:
  - core/subagents_mesh.py
  - llm/local_llama_client.py
  - llm/providers.py
  parecer: 'Revisado contra o diff -- router :9931 mantido como primario local antes do fallback para llama-swap :8080.'
- registro: registro-2026-11-14-roteamento-pools-transporte-e-validacao-hrc
  caminhos:
  - data/routing_map.json
  - data/system_config.json
  - llm/providers.py
  parecer: 'Revisado contra o diff -- pools e transporte preservados com fallback :8080 para agentes customizados.'
- registro: registro-2026-11-14-sync-uvlock-ollama-cloud-circuit-e-ci
  caminhos:
  - llm/providers.py
  parecer: 'Revisado contra o diff -- circuit breakers de provedores preservados.'
- registro: registro-2026-11-15-laya-0432-failover-arquitetura-s1
  caminhos:
  - data/routing_map.json
  - data/system_config.json
  parecer: 'Revisado contra o diff -- configuracao S1/roteamento preservada com paridade entre os dois arquivos.'
verificado:
  - Ruff check e ruff format --check limpos em todos os modulos Python alterados e novos (All checks passed!)
  - Validacao YAML de infra/docker-compose.yml (YAML OK) e JSON de data/system_config.json + data/routing_map.json
  - Varredura de segredos em texto claro nos arquivos em stage (Secret hits = [])
  - Paridade HKCU/HKLM verificada via Set-EcosystemCredential.ps1 -Verificar e probe live de DevinBridge (/v3/self OK com DEVIN_API_TOKEN, rotacionando DEVIN_API_KEY 403), VercelBridge (/v2/user OK) e Neo4j Aura OAuth2 (HTTP 200 Bearer)
  - Bateria pytest direcionada (148 passed, 0 erros, 0 warnings) + suite completa do repositorio e quality gate 5 fases aprovados
nao_verificado:
  - Subida real dos containers Docker de infra/docker-compose.yml (Docker Desktop ausente no PATH desta estacao)
  - Consulta Cypher direta em Neo4j Aura Query API v2 (OAuth2 Control Plane validado; senha Basic de banco NEO4J_AURA_PASSWORD opcional nao fornecida)
---

# Registro de Upgrade da Malha Agentica, Rotacao HKCU/HKLM e Integracoes SOTA

- **Malha de integracoes e rotacao (`core/mesh_integrations.py`):** introduz `ServiceKeyRing` com descoberta `os.environ` + fallback `winreg` (`HKCU -> HKLM`), slots `_1.._20` + CSV, fingerprint HMAC `sha8`, revogacao em `401/403` e cooldown em `429/5xx`, atendendo `RAGFlowBridge`, `N8NBridge`, `Neo4jAuraBridge`, `DevinBridge` e `VercelBridge`.
- **Resiliencia local e `:free` (`core/subagents_mesh.py`, `llm/local_llama_client.py`, `llm/providers.py`, `llm/free_router.py`):** conecta `llama-swap` (`127.0.0.1:8080`) apos `:9931` para subagentes e agentes customizados, e rotaciona chaves/modelos `:free` no OpenRouter.
- **Operacao e infraestrutura (`infra/docker-compose.yml`, `infra/.env.example`, `scripts/ops/Set-EcosystemCredential.ps1`, `scripts/ops/devin_session_insights.py`):** provisao dual `HKCU+HKLM` com suporte `-Slot`, failover automatico de tokens Devin na CLI de insights e Compose unificado `n8n` + `ragflow` apontando para OpenRouter e `host.docker.internal:{11434,9931,8080}`.
