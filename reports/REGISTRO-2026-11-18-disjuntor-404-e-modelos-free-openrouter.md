---
id: registro-2026-11-18-disjuntor-404-e-modelos-free-openrouter
tipo: registro
escopo:
  "Site -- Disjuntor HTTP 404, troca de modelos :free OpenRouter e reconciliacao
  de 4 avisos SUSPEITO"
ecossistema: nexus-sota
autor: "Gemini 4 Hydrogen <noreply@google.com>"
criado_em: "2026-11-18T08:22:00-03:00"
atualizado_em: "2026-11-18T08:22:00-03:00"
commit: HEAD
classes:
  - interno
  - governanca
  - registro
  - llm
  - roteamento
caminhos:
  - core/config.py
  - core/subagents_mesh.py
  - data/routing_map.json
  - data/system_config.json
  - engine/llm_api.py
  - llm/free_router.py
  - llm/orchestrator.py
  - llm/providers.py
  - llm/routing.py
  - reports/HANDOFF-2026-09-02-curadoria-mcp-quarentena-e-roteamento-lazy.md
  - reports/HANDOFF-2026-10-20-elevacao-tier1-argon-haiku55-e-reconciliacao.md
  - reports/REGISTRO-2026-09-24-blindagem-ascii-e-harmonizacao-scripts.md
  - reports/REGISTRO-2026-10-20-elevacao-tier1-gemini-argon-claude-5-5-e-gpt-6-0.md
  - reports/REGISTRO-2026-11-18-disjuntor-404-e-modelos-free-openrouter.md
  - tests/test_mesh_integrations.py
  - tests/test_openrouter_pools.py
  - tests/test_task_routing.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  python: "3.14.9"
  so: Windows
  condutor: "Gemini 4 Hydrogen"
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-11-18
verificado:
  - "ruff format, ruff check e pyright aprovados (0 erros, 0 warnings) nos 9
    arquivos Python modificados"
  - "pytest tests/test_openrouter_pools.py tests/test_task_routing.py
    tests/test_routing_policy.py aprovado (74/74 em 0.70s)"
  - "Smoke test ao vivo OpenRouter aprovado (6/6 modelos :free com HTTP 200 e
    call_llm_api @chico end-to-end OK)"
  - "4 avisos SUSPEITO reconciliados com SHAs reais de nascimento (git log
    --diff-filter=A -m)"
nao_verificado:
  - "suite_verde.py e cwv_gate.ps1 serao executados integralmente pelo hook
    .husky/pre-commit no ato do commit"
referencias_nao_resolviveis: []
revisoes_de_ancora:
  - registro: relatorio-fusao-cerebro-claude-quality-gate-2026-09-01
    caminhos:
      - data/system_config.json
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
  - registro: auditoria-2026-09-02-curadoria-mcp-e-processos-residuais
    caminhos:
      - data/system_config.json
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
  - registro: auditoria-2026-09-03-trabalho-do-gemini-3-8-flash
    caminhos:
      - data/routing_map.json
      - data/system_config.json
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
  - registro: handoff-2026-09-22-integracao-system1-llm-dashboard
    caminhos:
      - engine/llm_api.py
      - llm/free_router.py
      - llm/orchestrator.py
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
  - registro: handoff-2026-09-30-expurgo-de-modelos-obsoletos-harmonizacao-qwen-e-calibracao
    caminhos:
      - core/config.py
      - llm/orchestrator.py
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
  - registro: handoff-2026-11-14-decision1-laya-s1-s2-e-ancoras
    caminhos:
      - llm/orchestrator.py
      - llm/providers.py
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
  - registro: registro-2026-09-02-adapters-ligado-ao-caminho-real-anthropic
    caminhos:
      - engine/llm_api.py
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
  - registro: registro-2026-09-07-orquestrador-api-keys-free-e-pmev
    caminhos:
      - llm/free_router.py
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
  - registro: registro-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem
    caminhos:
      - engine/llm_api.py
      - llm/free_router.py
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
  - registro: registro-2026-09-08-auditoria-de-tipagem-e-recorte-do-fingerprint
    caminhos:
      - llm/free_router.py
      - llm/orchestrator.py
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
  - registro: registro-2026-09-08-ruff-format-e-o-ci-vermelho
    caminhos:
      - llm/free_router.py
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
  - registro: registro-2026-09-11-auditoria-da-campanha-de-lint-em-31-testes
    caminhos:
      - llm/free_router.py
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
  - registro: registro-2026-09-25-pools-de-chaves-openrouter-multi-tier
    caminhos:
      - tests/test_openrouter_pools.py
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
  - registro: registro-2026-09-30-expurgo-de-modelos-obsoletos-e-reconciliacao-de-ancoras
    caminhos:
      - core/config.py
      - llm/orchestrator.py
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
  - registro: registro-2026-10-10-evolucao-malha-agentica-sota-v8-gold
    caminhos:
      - core/subagents_mesh.py
      - llm/orchestrator.py
      - llm/providers.py
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
  - registro: registro-2026-10-13-saneamento-diagnosticos-ide-e-compatibilidade
    caminhos:
      - llm/orchestrator.py
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
  - registro: registro-2026-10-18-harmonizacao-malha-agentica-e-sota-engine
    caminhos:
      - core/subagents_mesh.py
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
  - registro: registro-2026-10-18-resolucao-sonarqube-e-saneamento-global
    caminhos:
      - core/subagents_mesh.py
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
  - registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
    caminhos:
      - llm/routing.py
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
  - registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
    caminhos:
      - engine/llm_api.py
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
  - registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
    caminhos:
      - llm/providers.py
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
  - registro: registro-2026-11-08-saneamento-ancoras-historicas-e-congelamento-medicoes
    caminhos:
      - reports/HANDOFF-2026-10-20-elevacao-tier1-argon-haiku55-e-reconciliacao.md
      - reports/REGISTRO-2026-10-20-elevacao-tier1-gemini-argon-claude-5-5-e-gpt-6-0.md
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
  - registro: registro-2026-11-08-saneamento-ancoras-historicas-e-indices
    caminhos:
      - reports/REGISTRO-2026-09-24-blindagem-ascii-e-harmonizacao-scripts.md
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
  - registro: registro-2026-11-12-ollama-cloud-provider
    caminhos:
      - llm/orchestrator.py
      - llm/providers.py
      - llm/routing.py
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
  - registro: registro-2026-11-12-pools-chaves-reposicao-e-doc-consolidada
    caminhos:
      - tests/test_openrouter_pools.py
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
  - registro: registro-2026-11-12-review-sweeps-endurecimento-sota
    caminhos:
      - llm/orchestrator.py
      - tests/test_openrouter_pools.py
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
  - registro: registro-2026-11-14-correcao-devin-e-entrypoints-gemini-3-1-pro
    caminhos:
      - data/routing_map.json
      - data/system_config.json
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
  - registro: registro-2026-11-14-laya-pylint-e-refactors-sonar
    caminhos:
      - core/subagents_mesh.py
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
  - registro: registro-2026-11-14-llama-cpp-b12387-router-9931
    caminhos:
      - core/subagents_mesh.py
      - llm/providers.py
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
  - registro: registro-2026-11-14-roteamento-pools-transporte-e-validacao-hrc
    caminhos:
      - data/routing_map.json
      - data/system_config.json
      - engine/llm_api.py
      - llm/orchestrator.py
      - llm/providers.py
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
  - registro: registro-2026-11-14-sync-uvlock-ollama-cloud-circuit-e-ci
    caminhos:
      - llm/providers.py
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
  - registro: registro-2026-11-15-laya-0432-failover-arquitetura-s1
    caminhos:
      - data/routing_map.json
      - data/system_config.json
      - llm/routing.py
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
  - registro: registro-2026-11-15-malha-agentica-rotacao-hkcu-hklm
    caminhos:
      - core/subagents_mesh.py
      - data/routing_map.json
      - data/system_config.json
      - llm/free_router.py
      - llm/providers.py
      - tests/test_mesh_integrations.py
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
  - registro: registro-2026-11-15-saneamento-sonarlint-codeql-e-portoes
    caminhos:
      - core/subagents_mesh.py
      - llm/providers.py
      - tests/test_mesh_integrations.py
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
  - registro: registro-2026-11-17-auditoria-fortificacao-backend-5-fases
    caminhos:
      - core/config.py
      - engine/llm_api.py
      - llm/orchestrator.py
      - llm/providers.py
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
  - registro: registro-2026-11-17-fase-3-backend-estrutural-sota
    caminhos:
      - core/config.py
      - engine/llm_api.py
    parecer:
      "Revisado em 2026-11-18. Disjuntor imediato para HTTP 404 em
      llm/providers.py, substituicao de 4 modelos :free descontinuados pelos 6
      ativos no OpenRouter (nvidia/nemotron-3-ultra-550b-a55b:free,
      google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free,
      cohere/north-mini-code:free, nvidia/nemotron-3.5-lightning:free,
      inclusionai/ling-3.2-flash:free), blindagem :free -> openrouter e
      reconciliacao de 4 avisos SUSPEITO. Ruff, Pyright (0 erros), 74 testes
      pytest e 6/6 chamadas live aprovados."
---

# REGISTRO -- Disjuntor HTTP 404, Modelos :free Ativos OpenRouter e Reconciliacao

Registro formal das melhorias de roteamento OpenRouter e reconciliacao historica
em 2026-11-18.

## Alteracoes Consolidadas

- `llm/providers.py`: cooldown imediato da rota em `HTTP 404` /
  `no longer available` (sem queimar 5 chaves).
- `llm/routing.py` e `engine/llm_api.py`: resolucao explicita de `:free` para
  `openrouter` antes das heuristicas locais (`gemma`/`ling`).
- `data/system_config.json`, `data/routing_map.json`, `core/config.py`,
  `core/subagents_mesh.py`, `llm/free_router.py`, `llm/orchestrator.py`:
  substituicao dos 4 `:free` descontinuados pelos 6 modelos `:free` validados ao
  vivo.
- `tests/test_openrouter_pools.py` e `tests/test_task_routing.py`: cobertura de
  regressao para HTTP 404 e prefixos ativos.
- Reconciliacao de 4 avisos `SUSPEITO` em registros historicos com SHAs reais de
  nascimento.
