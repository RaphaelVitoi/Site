---
id: registro-2026-11-21-blindagem-ascii-e-saneamento-linters
tipo: registro
escopo: Site -- Blindagem ASCII em 26 modulos Python e saneamento Pyright/Pyrefly/SonarLint/CodeRabbit
ecossistema: nexus-sota
autor: Gemini 4 Hydrogen <noreply@google.com>
criado_em: '2026-11-21T09:14:00-03:00'
atualizado_em: '2026-11-21T09:14:00-03:00'
commit: HEAD
verificado:
- 'nexus ops check-ascii: 0 erros, 0 warnings nos modulos Python'
- 'ruff check nos 27 arquivos Python alterados: All checks passed'
- 'pytest em 11 suites de teste afetadas: 206 passed em 62.92s'
- 'cd frontend && npx tsc --noEmit: exit code 0'
- 'yaml.safe_load em .coderabbit.yaml: YAML OK'
nao_verificado:
- Execucao do Pyrefly CLI local fora do editor
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data_das_medicoes: '2026-11-21'
  toolchain: nexus ops check-ascii + ruff + pytest + tsc + record_gate.py
  so: Windows
classes:
- interno
- medido
- governanca
- registro
- ascii
- integridade
caminhos:
- .agents/skills/key-pool-audit/scripts/render_key_audit.py
- .coderabbit.yaml
- api/v1/handler_support.py
- api/v1/handlers.py
- cli/commands.py
- engine/canonical_poker_theory.py
- engine/gemma_server.py
- frontend/src/app/(user)/dashboard/files/page.tsx
- llm/gemini_decisions.py
- llm/key_observatory.py
- llm/model_registry.py
- llm/routing_policy.py
- llm/session.py
- llm/translategemma.py
- main.py
- reports/REGISTRO-2026-11-21-blindagem-ascii-e-saneamento-linters.md
- scripts/ops/record_index.py
- scripts/ops/suite_verde.py
- task_executor.py
- tests/test_gemini_decisions.py
- tests/test_gpt6_astra.py
- tests/test_hook_commit_msg.py
- tests/test_lancedb_chroma_dual_rag.py
- tests/test_model_catalog.py
- tests/test_requirements_sync.py
- tests/test_session_impact_evaluator.py
- tests/test_sota_deps_roi_2026_11.py
- tests/test_system2_local.py
- tests/test_task_dispatch_contract.py
- tests/test_translategemma.py
revisoes_de_ancora:
- registro: taxonomia-canonica-de-documentacao-e-relatorios
  caminhos:
  - scripts/ops/record_index.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: auditoria-2026-09-03-disco-extensao-e-roteador-de-modelo
  caminhos:
  - engine/gemma_server.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: auditoria-2026-09-03-trabalho-do-gemini-3-8-flash
  caminhos:
  - engine/gemma_server.py
  - llm/model_registry.py
  - llm/routing_policy.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: auditoria-2026-09-07-preludio-jules-astra-e-correcao-da-delegacao
  caminhos:
  - llm/model_registry.py
  - tests/test_gpt6_astra.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: auditoria-2026-09-12-o-ci-vermelho-que-nenhum-portao-local-media
  caminhos:
  - llm/model_registry.py
  - scripts/ops/suite_verde.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: auditoria-2026-10-08-integralidade-backend
  caminhos:
  - api/v1/handlers.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: auditoria-2026-11-15-translategemma-timesfm-laya-roi
  caminhos:
  - llm/translategemma.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: auditoria-2026-11-18-pools-chaves-observatorio-e-roteamento
  caminhos:
  - .agents/skills/key-pool-audit/scripts/render_key_audit.py
  - api/v1/handlers.py
  - cli/commands.py
  - llm/key_observatory.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: handoff-2026-09-14-pagina-icm-contra-a-mesa-real
  caminhos:
  - engine/gemma_server.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: handoff-2026-09-19-documentos-loopback-sonar-e-download
  caminhos:
  - api/v1/handlers.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: handoff-2026-09-22-integracao-system1-llm-dashboard
  caminhos:
  - api/v1/handlers.py
  - engine/gemma_server.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: handoff-2026-09-23-auditoria-frontend-backend-e-laya
  caminhos:
  - engine/gemma_server.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: handoff-2026-09-23-ci-ram-e-rustfmt-staged
  caminhos:
  - scripts/ops/suite_verde.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: handoff-2026-09-23-nucleo-mcp-curadoria-codex
  caminhos:
  - scripts/ops/suite_verde.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: handoff-2026-09-30-expurgo-de-modelos-obsoletos-harmonizacao-qwen-e-calibracao
  caminhos:
  - engine/gemma_server.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: handoff-2026-10-05-fechamento-do-ciclo-medicoes-cwv-e-cacheabilidade
  caminhos:
  - scripts/ops/suite_verde.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: handoff-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - api/v1/handlers.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: handoff-2026-10-20-harmonizacao-tier1-gemini-38
  caminhos:
  - llm/model_registry.py
  - llm/routing_policy.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: handoff-2026-11-08-otimizacao-backend-e-integridade-sota
  caminhos:
  - engine/canonical_poker_theory.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: handoff-2026-11-14-decision1-laya-s1-s2-e-ancoras
  caminhos:
  - llm/gemini_decisions.py
  - tests/test_gemini_decisions.py
  - tests/test_system2_local.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: handoff-2026-11-14-evolucao-skill-impacto-e-calibracao
  caminhos:
  - tests/test_session_impact_evaluator.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: handoff-2026-11-15-translategemma-timesfm-laya-roi
  caminhos:
  - api/v1/handlers.py
  - llm/gemini_decisions.py
  - llm/translategemma.py
  - tests/test_gemini_decisions.py
  - tests/test_translategemma.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: handoff-2026-11-18-observatorio-chaves-roteamento-e-calibracao
  caminhos:
  - .agents/skills/key-pool-audit/scripts/render_key_audit.py
  - api/v1/handlers.py
  - cli/commands.py
  - llm/key_observatory.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: handoff-2026-11-21-deps-sota-roi-neon-orchestrator-e-calibracao
  caminhos:
  - api/v1/handler_support.py
  - engine/canonical_poker_theory.py
  - engine/gemma_server.py
  - frontend/src/app/(user)/dashboard/files/page.tsx
  - llm/model_registry.py
  - llm/routing_policy.py
  - main.py
  - tests/test_sota_deps_roi_2026_11.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: plano-laya-integracao-s1s2-pmev-2026-09-20
  caminhos:
  - llm/model_registry.py
  - llm/routing_policy.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-08-29-tres-orfaos
  caminhos:
  - engine/gemma_server.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-09-01-fronteira-http-e-portao-independente-de-perfil
  caminhos:
  - api/v1/handlers.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-09-01-resolucao-de-skill-e-referencia-por-ponto-de-partida
  caminhos:
  - scripts/ops/record_index.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-09-07-delegacao-gemini-flash-lite-cinco-itens
  caminhos:
  - llm/model_registry.py
  - tests/test_gpt6_astra.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-09-07-integracao-gpt6-astra-e-retirada-do-fable
  caminhos:
  - llm/model_registry.py
  - llm/routing_policy.py
  - tests/test_gpt6_astra.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-09-07-procedencia-do-timesfm-e-json-do-cli
  caminhos:
  - api/v1/handlers.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-09-07-promocao-do-duo-gemini-na-faixa-gratuita
  caminhos:
  - llm/routing_policy.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem
  caminhos:
  - llm/model_registry.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-09-08-auditoria-de-tipagem-e-recorte-do-fingerprint
  caminhos:
  - api/v1/handlers.py
  - llm/session.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-09-08-ruff-format-e-o-ci-vermelho
  caminhos:
  - llm/model_registry.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-09-09-appkey-lida-por-string-e-a-fronteira-de-autoridade
  caminhos:
  - api/v1/handlers.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-09-12-a-identidade-do-antigravity-e-o-catalogo-que-faltava
  caminhos:
  - tests/test_hook_commit_msg.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-09-12-teoria-canonica-chen-janda-e-convergencia-cfr
  caminhos:
  - api/v1/handlers.py
  - engine/canonical_poker_theory.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-09-13-append-em-jsonl-e-suite-em-todos-os-nucleos
  caminhos:
  - scripts/ops/suite_verde.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-09-13-contrato-de-capacidades-e-paridade-de-engines
  caminhos:
  - api/v1/handlers.py
  - engine/canonical_poker_theory.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-09-13-g2-so-bloqueia-registro-vigente
  caminhos:
  - scripts/ops/record_index.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-09-14-correcoes-pos-auditoria-handoff-tier-e-dependencias
  caminhos:
  - tests/test_hook_commit_msg.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-09-17-integracao-dream-rsi-e-timesfm-autopoiese
  caminhos:
  - task_executor.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-09-18-dream-rsi-ligado-aula12-localizada-e-bounty-a-iniciar
  caminhos:
  - api/v1/handlers.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-09-18-interceptador-silencioso-par2-e-dream-rsi-sem-consumidor
  caminhos:
  - task_executor.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-09-18-saneamento-geral-de-linters-e-gate-remocao-citada
  caminhos:
  - api/v1/handlers.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-09-19-loopback-e-visualizador-pdf-chrome
  caminhos:
  - api/v1/handlers.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-09-19-operador-local-dev-autenticacao
  caminhos:
  - frontend/src/app/(user)/dashboard/files/page.tsx
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-09-19-refatoracao-sonar-python-e-icm
  caminhos:
  - llm/model_registry.py
  - llm/routing_policy.py
  - scripts/ops/suite_verde.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-09-19-universal-document-viewer-e-seguranca-csp-pdf
  caminhos:
  - api/v1/handlers.py
  - frontend/src/app/(user)/dashboard/files/page.tsx
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-09-23-evolucao-pendencias-laya-e-tarefas
  caminhos:
  - engine/gemma_server.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-09-23-otimizacao-cache-suite-verde-e-paralelismo
  caminhos:
  - scripts/ops/suite_verde.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-09-24-blindagem-ascii-e-harmonizacao-scripts
  caminhos:
  - api/v1/handlers.py
  - engine/gemma_server.py
  - llm/routing_policy.py
  - tests/test_lancedb_chroma_dual_rag.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-09-25-fechamento-pendencia-ci-ram
  caminhos:
  - scripts/ops/suite_verde.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-09-30-expurgo-de-modelos-obsoletos-e-reconciliacao-de-ancoras
  caminhos:
  - engine/gemma_server.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-10-01-harmonizacao-malha-subagentes
  caminhos:
  - llm/routing_policy.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-10-01-resiliencia-servidores-locais-e-triagem
  caminhos:
  - engine/gemma_server.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-10-04-http-metrics-correlation-e-worker-shutdown
  caminhos:
  - api/v1/handler_support.py
  - api/v1/handlers.py
  - scripts/ops/suite_verde.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-10-05-regua-de-tier-efetivo-no-catalogo-de-identidade
  caminhos:
  - tests/test_hook_commit_msg.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-10-05-resolucao-de-modelo-ollama-e-schema-json
  caminhos:
  - engine/gemma_server.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - api/v1/handlers.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-10-10-evolucao-malha-agentica-sota-v8-gold
  caminhos:
  - task_executor.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-10-13-saneamento-diagnosticos-ide-e-compatibilidade
  caminhos:
  - engine/gemma_server.py
  - llm/routing_policy.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-10-18-resolucao-sonarqube-e-saneamento-global
  caminhos:
  - frontend/src/app/(user)/dashboard/files/page.tsx
  - scripts/ops/record_index.py
  - scripts/ops/suite_verde.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-10-19-saneamento-linters-markdown-e-conformidade-tipagem
  caminhos:
  - engine/gemma_server.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-10-19-saneamento-sonarqube-timesfm-e-a11y
  caminhos:
  - api/v1/handlers.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-10-19-verificacao-neural-timesfm-e-evolucao-ecossistema
  caminhos:
  - api/v1/handlers.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-10-20-harmonizacao-tier1-e-gemini-38
  caminhos:
  - cli/commands.py
  - llm/model_registry.py
  - llm/routing_policy.py
  - scripts/ops/suite_verde.py
  - tests/test_gpt6_astra.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-10-20-saneamento-quality-gate-ascii-e-reconciliacao-de-ancoras
  caminhos:
  - tests/test_hook_commit_msg.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
  caminhos:
  - llm/routing_policy.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
  caminhos:
  - .coderabbit.yaml
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-10-27-resolucao-matriz-ci-e-acessibilidade-wcag
  caminhos:
  - engine/gemma_server.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-11-01-resiliencia-proactor-winerror-10054
  caminhos:
  - main.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
  caminhos:
  - engine/gemma_server.py
  - tests/test_hook_commit_msg.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
  caminhos:
  - .coderabbit.yaml
  - tests/test_lancedb_chroma_dual_rag.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-11-08-elevacao-polars-2-1-e-consumo-integral-engines-sota
  caminhos:
  - engine/canonical_poker_theory.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-11-08-otimizacao-backend-sonarlint-pyright-e-headings
  caminhos:
  - engine/canonical_poker_theory.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-11-08-saneamento-pure-ascii-timesfm-e-handlers
  caminhos:
  - api/v1/handlers.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-11-12-arquitetura-s1-s2-llama-vulkan
  caminhos:
  - llm/gemini_decisions.py
  - tests/test_gemini_decisions.py
  - tests/test_system2_local.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-11-12-governanca-identidades-e-assinaturas
  caminhos:
  - llm/model_registry.py
  - tests/test_gpt6_astra.py
  - tests/test_hook_commit_msg.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-11-12-pool-multimodal-e-refactors-sonar
  caminhos:
  - llm/gemini_decisions.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-11-12-review-sweeps-endurecimento-sota
  caminhos:
  - llm/gemini_decisions.py
  - llm/session.py
  - tests/test_gemini_decisions.py
  - tests/test_hook_commit_msg.py
  - tests/test_system2_local.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-11-13-timeout-ollama-fila-mka
  caminhos:
  - engine/gemma_server.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-11-14-correcao-devin-e-entrypoints-gemini-3-1-pro
  caminhos:
  - llm/model_registry.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
  caminhos:
  - llm/gemini_decisions.py
  - scripts/ops/record_index.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-11-14-evolucao-skill-impacto-sessao
  caminhos:
  - tests/test_session_impact_evaluator.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-11-14-laya-pylint-e-refactors-sonar
  caminhos:
  - llm/routing_policy.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-11-14-llama-cpp-b12387-router-9931
  caminhos:
  - llm/routing_policy.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-11-14-roteamento-pools-transporte-e-validacao-hrc
  caminhos:
  - llm/routing_policy.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-11-15-laya-0432-failover-arquitetura-s1
  caminhos:
  - llm/gemini_decisions.py
  - llm/model_registry.py
  - llm/routing_policy.py
  - tests/test_gemini_decisions.py
  - tests/test_lancedb_chroma_dual_rag.py
  - tests/test_system2_local.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-11-17-auditoria-fortificacao-backend-5-fases
  caminhos:
  - api/v1/handler_support.py
  - api/v1/handlers.py
  - engine/gemma_server.py
  - llm/session.py
  - llm/translategemma.py
  - main.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-11-17-fase-3-backend-estrutural-sota
  caminhos:
  - api/v1/handler_support.py
  - api/v1/handlers.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-11-17-fase-4-governanca-estrutural-sota
  caminhos:
  - tests/test_model_catalog.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-11-17-fase-5-evolucao-das-forcas-sota
  caminhos:
  - cli/commands.py
  - scripts/ops/suite_verde.py
  - task_executor.py
  - tests/test_lancedb_chroma_dual_rag.py
  - tests/test_task_dispatch_contract.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-11-17-fases-0-1-portoes-verificacao-e-higiene-doc-real
  caminhos:
  - main.py
  - tests/test_requirements_sync.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-11-17-suite-verde-loadfile-contra-flake-write-tree
  caminhos:
  - scripts/ops/suite_verde.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-11-18-saneamento-sonarlint-pyright-e-deps
  caminhos:
  - .agents/skills/key-pool-audit/scripts/render_key_audit.py
  - cli/commands.py
  - llm/key_observatory.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-11-19-auditoria-evolucao-frontend-sota
  caminhos:
  - frontend/src/app/(user)/dashboard/files/page.tsx
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: registro-2026-11-21-deps-sota-roi-neon-orchestrator-e-calibracao
  caminhos:
  - api/v1/handler_support.py
  - engine/canonical_poker_theory.py
  - engine/gemma_server.py
  - frontend/src/app/(user)/dashboard/files/page.tsx
  - llm/model_registry.py
  - llm/routing_policy.py
  - main.py
  - tests/test_sota_deps_roi_2026_11.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: validacao-2026-09-12-a-grade-que-nao-cabia-e-o-aviso-que-virou-bloqueio
  caminhos:
  - tests/test_hook_commit_msg.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
- registro: validacao-2026-09-12-a-identidade-de-autoria-deixa-de-ser-prosa
  caminhos:
  - tests/test_hook_commit_msg.py
  parecer: 'Revisao em 2026-11-21: blindagem Pure ASCII e saneamento de linters/tipagem preservando contratos e comportamento em runtime.'
---

# Registro 2026-11-21: Blindagem ASCII e Saneamento de Linters

1. **Blindagem ASCII (26 modulos Python):**
   - Comentarios, docstrings e prosa normalizados para ASCII puro (--, secao, sem acentuacao).
   - Literais de runtime com semantica Unicode (UI Rich em 
ender_key_audit.py, regexes de llm/translategemma.py, testes Unicode e split em 	ests/test_model_catalog.py) convertidos para escapes Unicode com preservacao integral de AST e comportamento.
2. **Saneamento de Tipagem, Linters e Schema:**
   - 	ests/test_task_dispatch_contract.py: guarda 	yper_inst is None para resolver 
eportOptionalMemberAccess do Pyright.
   - llm/model_registry.py: extraida constante _MOTIVO_DESCONTINUADO_GEMINI_31_PRO (python:S1192).
   - engine/canonical_poker_theory.py: # type: ignore[import-untyped] no import opcional de scipy.optimize.linprog (Pyrefly untyped-import).
   - rontend/src/app/(user)/dashboard/files/page.tsx: substituicao de ternario aninhado por if / else if / else (	ypescript:S3358).
   - .coderabbit.yaml: migracao de 
eviews.instructions para 
eviews.path_instructions (path: **/*).
