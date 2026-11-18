---
id: auditoria-2026-11-18-pools-chaves-observatorio-e-roteamento
tipo: auditoria
escopo: Site -- Auditoria de paridade HKCU/HKLM (87 variaveis, 11 pools), expansao
  Tier 1=5 / Tier 2=10, promocao OLLAMA_CLOUD_KEY, skill key-pool-audit, otimizacao
  bidirecional de roteamento e integracao Nexus/Dashboard
ecossistema: nexus-sota
autor: Gemini 4 Hydrogen <noreply@google.com>
criado_em: '2026-11-18T12:38:00-03:00'
atualizado_em: '2026-11-18T12:38:00-03:00'
commit: HEAD
classes:
- interno
- medido
- auditoria
- governanca
- seguranca
- roteamento
- observatorio
caminhos:
- .agents/skills.json
- .agents/skills/key-pool-audit/SKILL.md
- .agents/skills/key-pool-audit/scripts/Audit-KeyPools.ps1
- .agents/skills/key-pool-audit/scripts/render_key_audit.py
- .claude/agents/securitychief.md
- CLAUDE.md
- api/v1/handlers.py
- api/v1/server.py
- cli/commands.py
- data/agents_manifest.json
- database/queue_manager.py
- do.ps1
- docs/INDEX.md
- docs/POOLS-DE-CHAVES.md
- docs/SCRIPTS_E_COMANDOS_DASHBOARD.md
- engine/llm_api.py
- frontend/src/app/(user)/dashboard/page.tsx
- frontend/src/app/api/sota/key-pools/route.ts
- frontend/src/app/api/sota/nexus-mesh/route.ts
- frontend/src/components/analytics/NexusKeyPoolsPanel.test.tsx
- frontend/src/components/analytics/NexusKeyPoolsPanel.tsx
- llm/budget.py
- llm/key_observatory.py
- llm/ollama_cloud.py
- llm/openrouter_pool.py
- llm/orchestrator.py
- llm/providers.py
- reports/AUDITORIA-2026-11-18-pools-chaves-observatorio-e-roteamento.md
- reports/HANDOFF-2026-11-18-observatorio-chaves-roteamento-e-calibracao.md
- reports/agent-calibration/feedback-ledger.jsonl
- scripts/ops/Set-OpenRouterKeyPools.ps1
- scripts/setup/Setup-NexusProfile.ps1
- tests/test_governanca_skills.py
- tests/test_openrouter_pools.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  session_id: a025efc1-d6ea-4fd3-bf19-a3f676f31e95
  session_started_at: '2026-11-18T10:53:00-03:00'
  condutor: Gemini 4 Hydrogen <noreply@google.com>
  modelo: gemini-4-hydrogen
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: '2026-11-18'
verificado:
- 87/87 variaveis em 11 pools ativos sincronizadas entre HKCU e HKLM com 0 FAIL,
  0 WARN e 0 formato invalido (cmd /c audit-keys -AnomaliesOnly -Strict exit 0)
- OpenRouter expandido para 32 chaves ativas em 4 tiers (Tier1=5, Tier2=10, Tier3=5,
  Tier4=12) com Tier 1 validado ao vivo (5/5 HTTP 200, media 101 ms)
- Chave legada de HKLM/OLLAMA_API_KEY preservada como OLLAMA_CLOUD_KEY (OLLAMA_KEYS=2)
  e OPENROUTER_API_KEY dedicada ao Tier 4 para blindar a cota do Tier 1
- Skill local key-pool-audit registrada em .agents/skills.json, data/agents_manifest.json
  (@securitychief) e .claude/agents/securitychief.md via sync_agents_reality.ps1
  (10/10 passed em test_governanca_skills.py)
- Pyright (0 errors, 0 warnings, 0 informations), Ruff check/format (All checks
  passed), ESLint e tsc --build (exit 0) aprovados
- 81 testes pytest de pools/roteamento (7.57s), 10 pytest de governanca de skills
  (7.59s) e 2 suites Jest frontend aprovados sem erros ou warnings
- Quality Gate cwv_gate.ps1 SOTA VERDE nas 5 fases medidas (LCP <= 320ms, CLS 0.000168,
  TBT 32.496ms, TTFB ~100.7ms, MAX_HEAP ~20MB, axe=0, CVE=0, SRI VERIFIED)
- Feedback 9.5 do Tier 0 gravado no ledger append-only SHA-256 (sequence=99, 100
  registros, tail 90d881411ffdcecacb9d8709f8b08f7d0b60dfb7cc64e04dea1133c5ccce42cb)
nao_verificado:
- Chamada paga end-to-end em todos os provedores pagos fora do probe HTTP Tier 1
  / sockets locais
- Fechamento automatico via Record-AgentCalibration.ps1 (exige >= 3 sessoes elegiveis
  acumuladas no ledger)
referencias_nao_resolviveis: []
revisoes_de_ancora:
- registro: auditoria-2026-08-31-integridade-e-integracao-antigravity
  caminhos:
  - .agents/skills.json
  - tests/test_governanca_skills.py
  parecer: Revisado em 2026-11-18. Declaracao canonica da skill local key-pool-audit
    em .agents/skills.json, data/agents_manifest.json (@securitychief), .claude/agents/securitychief.md
    e test_governanca_skills.py; validado com ruff, pyright, eslint, tsc, 81 pytest
    de pools/roteamento, 10 pytest de skills, 2 Jest e Quality Gate CWV/A11y/CVE
    verde.
- registro: auditoria-2026-08-31-saneamento-linters-e-estabilizacao-core-e-api
  caminhos:
  - api/v1/handlers.py
  - api/v1/server.py
  parecer: Revisado em 2026-11-18. Integracao do observatorio mascarado de chaves
    e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e Setup-NexusProfile.ps1;
    validado com ruff, pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest
    de skills, 2 Jest e Quality Gate CWV/A11y/CVE verde.
- registro: auditoria-2026-09-01-retrospectiva-prioridade-sessao
  caminhos:
  - frontend/src/app/(user)/dashboard/page.tsx
  parecer: Revisado em 2026-11-18. Painel NexusKeyPoolsPanel integrado ao /dashboard
    e endpoint /api/sota/key-pools conectado ao nexus-mesh; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: auditoria-2026-09-03-trabalho-do-gemini-3-8-flash
  caminhos:
  - CLAUDE.md
  - data/agents_manifest.json
  parecer: Revisado em 2026-11-18. Declaracao canonica da skill local key-pool-audit
    em .agents/skills.json, data/agents_manifest.json (@securitychief), .claude/agents/securitychief.md
    e test_governanca_skills.py; Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: auditoria-2026-09-05-trabalho-assistido-do-gemini-no-ide
  caminhos:
  - api/v1/server.py
  parecer: Revisado em 2026-11-18. Integracao do observatorio mascarado de chaves
    e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e Setup-NexusProfile.ps1;
    validado com ruff, pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest
    de skills, 2 Jest e Quality Gate CWV/A11y/CVE verde.
- registro: auditoria-2026-09-12-o-ci-vermelho-que-nenhum-portao-local-media
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: auditoria-2026-09-12-proveniencia-executavel-do-feedback
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: auditoria-2026-09-22-paridade-config-identidade
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: auditoria-2026-09-24-mcp-gateway-compartilhado-e-persistencia
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: auditoria-2026-10-08-integralidade-backend
  caminhos:
  - api/v1/handlers.py
  - engine/llm_api.py
  - llm/openrouter_pool.py
  parecer: Revisado em 2026-11-18. Pools OpenRouter expandidos (Tier1=5, Tier2=10,
    Tier3=5, Tier4=12), OPENROUTER_API_KEY dedicada ao Tier 4 e round-robin adaptativo;
    Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; Integracao do observatorio mascarado
    de chaves e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e
    Setup-NexusProfile.ps1; validado com ruff, pyright, eslint, tsc, 81 pytest de
    pools/roteamento, 10 pytest de skills, 2 Jest e Quality Gate CWV/A11y/CVE verde.
- registro: checkpoint-2026-06-14-infrastructure-hardening
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: frente-4-2026-08-28-autoridade-de-roteamento
  caminhos:
  - llm/orchestrator.py
  parecer: Revisado em 2026-11-18. Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: handoff-2026-08-29-governanca-8tiers-vulnerabilidades-subagents
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
  caminhos:
  - CLAUDE.md
  - data/agents_manifest.json
  - tests/test_governanca_skills.py
  parecer: Revisado em 2026-11-18. Declaracao canonica da skill local key-pool-audit
    em .agents/skills.json, data/agents_manifest.json (@securitychief), .claude/agents/securitychief.md
    e test_governanca_skills.py; Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: handoff-2026-08-30-status-malha-agentica-e-routing
  caminhos:
  - data/agents_manifest.json
  parecer: Revisado em 2026-11-18. Declaracao canonica da skill local key-pool-audit
    em .agents/skills.json, data/agents_manifest.json (@securitychief), .claude/agents/securitychief.md
    e test_governanca_skills.py; validado com ruff, pyright, eslint, tsc, 81 pytest
    de pools/roteamento, 10 pytest de skills, 2 Jest e Quality Gate CWV/A11y/CVE
    verde.
- registro: handoff-2026-08-31-saneamento-linters-e-estabilizacao-core-e-api
  caminhos:
  - api/v1/handlers.py
  - api/v1/server.py
  parecer: Revisado em 2026-11-18. Integracao do observatorio mascarado de chaves
    e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e Setup-NexusProfile.ps1;
    validado com ruff, pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest
    de skills, 2 Jest e Quality Gate CWV/A11y/CVE verde.
- registro: handoff-2026-09-12-reconciliacao-calibracao-e-proveniencia
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: handoff-2026-09-19-documentos-loopback-sonar-e-download
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-18. Integracao do observatorio mascarado de chaves
    e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e Setup-NexusProfile.ps1;
    validado com ruff, pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest
    de skills, 2 Jest e Quality Gate CWV/A11y/CVE verde.
- registro: handoff-2026-09-22-integracao-system1-llm-dashboard
  caminhos:
  - CLAUDE.md
  - api/v1/handlers.py
  - database/queue_manager.py
  - engine/llm_api.py
  - frontend/src/app/(user)/dashboard/page.tsx
  - llm/orchestrator.py
  parecer: Revisado em 2026-11-18. Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; Integracao do observatorio mascarado
    de chaves e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e
    Setup-NexusProfile.ps1; Painel NexusKeyPoolsPanel integrado ao /dashboard e
    endpoint /api/sota/key-pools conectado ao nexus-mesh; Harmonizacao documental
    de 87 variaveis HKCU/HKLM (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys;
    validado com ruff, pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest
    de skills, 2 Jest e Quality Gate CWV/A11y/CVE verde.
- registro: handoff-2026-09-22-paridade-config-identidade
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: handoff-2026-09-24-laya-visual-workbench-e-rotas-admin
  caminhos:
  - frontend/src/app/(user)/dashboard/page.tsx
  parecer: Revisado em 2026-11-18. Painel NexusKeyPoolsPanel integrado ao /dashboard
    e endpoint /api/sota/key-pools conectado ao nexus-mesh; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: handoff-2026-09-25-governanca-pools-openrouter-e-impacto
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: handoff-2026-09-29-contraste-acessibilidade-e-identidade-de-condutor
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: handoff-2026-09-30-expurgo-de-modelos-obsoletos-harmonizacao-qwen-e-calibracao
  caminhos:
  - engine/llm_api.py
  - llm/orchestrator.py
  parecer: Revisado em 2026-11-18. Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: handoff-2026-10-05-fechamento-do-ciclo-medicoes-cwv-e-cacheabilidade
  caminhos:
  - engine/llm_api.py
  parecer: Revisado em 2026-11-18. Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: handoff-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - api/v1/handlers.py
  - engine/llm_api.py
  - llm/openrouter_pool.py
  parecer: Revisado em 2026-11-18. Pools OpenRouter expandidos (Tier1=5, Tier2=10,
    Tier3=5, Tier4=12), OPENROUTER_API_KEY dedicada ao Tier 4 e round-robin adaptativo;
    Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; Integracao do observatorio mascarado
    de chaves e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e
    Setup-NexusProfile.ps1; validado com ruff, pyright, eslint, tsc, 81 pytest de
    pools/roteamento, 10 pytest de skills, 2 Jest e Quality Gate CWV/A11y/CVE verde.
- registro: handoff-2026-10-18-harmonizacao-malha-agentica-e-painel-nexus
  caminhos:
  - frontend/src/app/(user)/dashboard/page.tsx
  - frontend/src/app/api/sota/nexus-mesh/route.ts
  parecer: Revisado em 2026-11-18. Painel NexusKeyPoolsPanel integrado ao /dashboard
    e endpoint /api/sota/key-pools conectado ao nexus-mesh; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: handoff-2026-10-20-harmonizacao-tier1-gemini-38
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: handoff-2026-11-08-otimizacao-backend-e-integridade-sota
  caminhos:
  - frontend/src/app/api/sota/nexus-mesh/route.ts
  parecer: Revisado em 2026-11-18. Painel NexusKeyPoolsPanel integrado ao /dashboard
    e endpoint /api/sota/key-pools conectado ao nexus-mesh; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: handoff-2026-11-14-decision1-laya-s1-s2-e-ancoras
  caminhos:
  - llm/orchestrator.py
  - llm/providers.py
  parecer: Revisado em 2026-11-18. Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: handoff-2026-11-15-translategemma-timesfm-laya-roi
  caminhos:
  - api/v1/handlers.py
  - api/v1/server.py
  - scripts/setup/Setup-NexusProfile.ps1
  parecer: Revisado em 2026-11-18. Integracao do observatorio mascarado de chaves
    e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e Setup-NexusProfile.ps1;
    validado com ruff, pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest
    de skills, 2 Jest e Quality Gate CWV/A11y/CVE verde.
- registro: handoff-2026-11-18-deps-openrouter-free-worker-hud-e-calibracao
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-08-29-governanca-piramidal-sota
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-08-29-sota-triad-mesh-integracao
  caminhos:
  - scripts/setup/Setup-NexusProfile.ps1
  parecer: Revisado em 2026-11-18. Integracao do observatorio mascarado de chaves
    e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e Setup-NexusProfile.ps1;
    validado com ruff, pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest
    de skills, 2 Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-08-29-tres-orfaos
  caminhos:
  - llm/budget.py
  parecer: Revisado em 2026-11-18. Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-01-ancora-de-merge-e-instrucao-indexada
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-01-fronteira-http-e-portao-independente-de-perfil
  caminhos:
  - api/v1/handlers.py
  - api/v1/server.py
  parecer: Revisado em 2026-11-18. Integracao do observatorio mascarado de chaves
    e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e Setup-NexusProfile.ps1;
    validado com ruff, pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest
    de skills, 2 Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-01-resolucao-de-skill-e-referencia-por-ponto-de-partida
  caminhos:
  - tests/test_governanca_skills.py
  parecer: Revisado em 2026-11-18. Declaracao canonica da skill local key-pool-audit
    em .agents/skills.json, data/agents_manifest.json (@securitychief), .claude/agents/securitychief.md
    e test_governanca_skills.py; validado com ruff, pyright, eslint, tsc, 81 pytest
    de pools/roteamento, 10 pytest de skills, 2 Jest e Quality Gate CWV/A11y/CVE
    verde.
- registro: registro-2026-09-02-adapters-ligado-ao-caminho-real-anthropic
  caminhos:
  - engine/llm_api.py
  parecer: Revisado em 2026-11-18. Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-02-correcao-de-escala-e-timestamp-no-ledger
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-02-portao-de-calibracao-por-sessao
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-03-triade-fronteira-chico-e-concorrencia
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-04-credenciais-submodulos-e-adaptador-hrc
  caminhos:
  - data/agents_manifest.json
  parecer: Revisado em 2026-11-18. Declaracao canonica da skill local key-pool-audit
    em .agents/skills.json, data/agents_manifest.json (@securitychief), .claude/agents/securitychief.md
    e test_governanca_skills.py; validado com ruff, pyright, eslint, tsc, 81 pytest
    de pools/roteamento, 10 pytest de skills, 2 Jest e Quality Gate CWV/A11y/CVE
    verde.
- registro: registro-2026-09-05-regua-para-agente-autonomo-de-nuvem
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-05-saneamento-nexus-ollama-e-auto-diagnostico
  caminhos:
  - scripts/setup/Setup-NexusProfile.ps1
  parecer: Revisado em 2026-11-18. Integracao do observatorio mascarado de chaves
    e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e Setup-NexusProfile.ps1;
    validado com ruff, pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest
    de skills, 2 Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-07-integracao-gpt6-astra-e-retirada-do-fable
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-07-procedencia-do-timesfm-e-json-do-cli
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-18. Integracao do observatorio mascarado de chaves
    e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e Setup-NexusProfile.ps1;
    validado com ruff, pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest
    de skills, 2 Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem
  caminhos:
  - engine/llm_api.py
  parecer: Revisado em 2026-11-18. Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-08-arbitragem-soberana-sobre-a-lei-de-concorrencia
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-08-auditoria-de-tipagem-e-recorte-do-fingerprint
  caminhos:
  - api/v1/handlers.py
  - llm/orchestrator.py
  parecer: Revisado em 2026-11-18. Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; Integracao do observatorio mascarado
    de chaves e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e
    Setup-NexusProfile.ps1; validado com ruff, pyright, eslint, tsc, 81 pytest de
    pools/roteamento, 10 pytest de skills, 2 Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-09-appkey-lida-por-string-e-a-fronteira-de-autoridade
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-18. Integracao do observatorio mascarado de chaves
    e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e Setup-NexusProfile.ps1;
    validado com ruff, pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest
    de skills, 2 Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-09-saneamento-medicao-datada-identificacao-agentes
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-12-ativacao-solvers-teoria-dos-jogos-e-multiway-pmev
  caminhos:
  - api/v1/handlers.py
  - api/v1/server.py
  parecer: Revisado em 2026-11-18. Integracao do observatorio mascarado de chaves
    e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e Setup-NexusProfile.ps1;
    validado com ruff, pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest
    de skills, 2 Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-12-preludio-o-instrumento-que-sabia-abrir-e-nao-fechar
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-12-teoria-canonica-chen-janda-e-convergencia-cfr
  caminhos:
  - api/v1/handlers.py
  - api/v1/server.py
  parecer: Revisado em 2026-11-18. Integracao do observatorio mascarado de chaves
    e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e Setup-NexusProfile.ps1;
    validado com ruff, pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest
    de skills, 2 Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-13-contrato-de-capacidades-e-paridade-de-engines
  caminhos:
  - api/v1/handlers.py
  - api/v1/server.py
  parecer: Revisado em 2026-11-18. Integracao do observatorio mascarado de chaves
    e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e Setup-NexusProfile.ps1;
    validado com ruff, pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest
    de skills, 2 Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-14-correcoes-pos-auditoria-handoff-tier-e-dependencias
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-14-harmonizacao-canonicos-astra-luna-gemini-anthropic
  caminhos:
  - CLAUDE.md
  - do.ps1
  parecer: Revisado em 2026-11-18. Integracao do observatorio mascarado de chaves
    e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e Setup-NexusProfile.ps1;
    Harmonizacao documental de 87 variaveis HKCU/HKLM (11 pools), chave legada OLLAMA_CLOUD_KEY
    e CLI audit-keys; validado com ruff, pyright, eslint, tsc, 81 pytest de pools/roteamento,
    10 pytest de skills, 2 Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-18-dream-rsi-ligado-aula12-localizada-e-bounty-a-iniciar
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-18. Integracao do observatorio mascarado de chaves
    e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e Setup-NexusProfile.ps1;
    validado com ruff, pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest
    de skills, 2 Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-18-saneamento-geral-de-linters-e-gate-remocao-citada
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-18. Integracao do observatorio mascarado de chaves
    e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e Setup-NexusProfile.ps1;
    validado com ruff, pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest
    de skills, 2 Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-19-harmonizacao-roteamento-e-atualizacao-componentes
  caminhos:
  - frontend/src/app/(user)/dashboard/page.tsx
  parecer: Revisado em 2026-11-18. Painel NexusKeyPoolsPanel integrado ao /dashboard
    e endpoint /api/sota/key-pools conectado ao nexus-mesh; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-19-loopback-e-visualizador-pdf-chrome
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-18. Integracao do observatorio mascarado de chaves
    e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e Setup-NexusProfile.ps1;
    validado com ruff, pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest
    de skills, 2 Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-19-universal-document-viewer-e-seguranca-csp-pdf
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-18. Integracao do observatorio mascarado de chaves
    e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e Setup-NexusProfile.ps1;
    validado com ruff, pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest
    de skills, 2 Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-22-skill-handoff-e-calibracao
  caminhos:
  - .agents/skills.json
  - CLAUDE.md
  - data/agents_manifest.json
  - tests/test_governanca_skills.py
  parecer: Revisado em 2026-11-18. Declaracao canonica da skill local key-pool-audit
    em .agents/skills.json, data/agents_manifest.json (@securitychief), .claude/agents/securitychief.md
    e test_governanca_skills.py; Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-24-blindagem-ascii-e-harmonizacao-scripts
  caminhos:
  - api/v1/handlers.py
  - database/queue_manager.py
  - llm/orchestrator.py
  parecer: Revisado em 2026-11-18. Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; Integracao do observatorio mascarado
    de chaves e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e
    Setup-NexusProfile.ps1; validado com ruff, pyright, eslint, tsc, 81 pytest de
    pools/roteamento, 10 pytest de skills, 2 Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-24-laya-visual-workbench-e-rotas-admin
  caminhos:
  - frontend/src/app/(user)/dashboard/page.tsx
  parecer: Revisado em 2026-11-18. Painel NexusKeyPoolsPanel integrado ao /dashboard
    e endpoint /api/sota/key-pools conectado ao nexus-mesh; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-24-mcp-gateway-compartilhado-e-persistencia
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-25-integracao-qwen-coder-e-blindagem-testes
  caminhos:
  - llm/budget.py
  parecer: Revisado em 2026-11-18. Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-25-pools-de-chaves-openrouter-multi-tier
  caminhos:
  - llm/budget.py
  - llm/openrouter_pool.py
  - scripts/ops/Set-OpenRouterKeyPools.ps1
  - tests/test_openrouter_pools.py
  parecer: Revisado em 2026-11-18. Pools OpenRouter expandidos (Tier1=5, Tier2=10,
    Tier3=5, Tier4=12), OPENROUTER_API_KEY dedicada ao Tier 4 e round-robin adaptativo;
    Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-25-precedencia-economica-assinaturas-pro-e-nuvem-free
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-25-skill-avaliacao-impacto-sessao
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-25-soberania-commit-push-e-staging-perpetuo
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-25-teto-de-commits-e-push-obrigatorio
  caminhos:
  - CLAUDE.md
  - data/agents_manifest.json
  parecer: Revisado em 2026-11-18. Declaracao canonica da skill local key-pool-audit
    em .agents/skills.json, data/agents_manifest.json (@securitychief), .claude/agents/securitychief.md
    e test_governanca_skills.py; Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-29-saneamento-lint-e-calibracao
  caminhos:
  - llm/budget.py
  parecer: Revisado em 2026-11-18. Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: registro-2026-09-30-expurgo-de-modelos-obsoletos-e-reconciliacao-de-ancoras
  caminhos:
  - engine/llm_api.py
  - llm/orchestrator.py
  parecer: Revisado em 2026-11-18. Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: registro-2026-10-01-integracao-cloud-ollama-hermes-nous-e-chaves-registro
  caminhos:
  - engine/llm_api.py
  parecer: Revisado em 2026-11-18. Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: registro-2026-10-01-resiliencia-servidores-locais-e-triagem
  caminhos:
  - engine/llm_api.py
  parecer: Revisado em 2026-11-18. Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: registro-2026-10-04-http-metrics-correlation-e-worker-shutdown
  caminhos:
  - api/v1/handlers.py
  - api/v1/server.py
  - engine/llm_api.py
  parecer: Revisado em 2026-11-18. Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; Integracao do observatorio mascarado
    de chaves e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e
    Setup-NexusProfile.ps1; validado com ruff, pyright, eslint, tsc, 81 pytest de
    pools/roteamento, 10 pytest de skills, 2 Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-10-05-resolucao-de-modelo-ollama-e-schema-json
  caminhos:
  - engine/llm_api.py
  parecer: Revisado em 2026-11-18. Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: registro-2026-10-06-strata-moe-125b-e-dashboard-nexus
  caminhos:
  - data/agents_manifest.json
  - docs/SCRIPTS_E_COMANDOS_DASHBOARD.md
  - engine/llm_api.py
  - scripts/setup/Setup-NexusProfile.ps1
  parecer: Revisado em 2026-11-18. Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; Integracao do observatorio mascarado
    de chaves e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e
    Setup-NexusProfile.ps1; Declaracao canonica da skill local key-pool-audit em
    .agents/skills.json, data/agents_manifest.json (@securitychief), .claude/agents/securitychief.md
    e test_governanca_skills.py; Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - api/v1/handlers.py
  - engine/llm_api.py
  - llm/openrouter_pool.py
  parecer: Revisado em 2026-11-18. Pools OpenRouter expandidos (Tier1=5, Tier2=10,
    Tier3=5, Tier4=12), OPENROUTER_API_KEY dedicada ao Tier 4 e round-robin adaptativo;
    Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; Integracao do observatorio mascarado
    de chaves e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e
    Setup-NexusProfile.ps1; validado com ruff, pyright, eslint, tsc, 81 pytest de
    pools/roteamento, 10 pytest de skills, 2 Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-10-08-skill-sota-server-lifecycle-warmup
  caminhos:
  - data/agents_manifest.json
  parecer: Revisado em 2026-11-18. Declaracao canonica da skill local key-pool-audit
    em .agents/skills.json, data/agents_manifest.json (@securitychief), .claude/agents/securitychief.md
    e test_governanca_skills.py; validado com ruff, pyright, eslint, tsc, 81 pytest
    de pools/roteamento, 10 pytest de skills, 2 Jest e Quality Gate CWV/A11y/CVE
    verde.
- registro: registro-2026-10-09-auditoria-governanca-e-remediacao-sota-v8-gold
  caminhos:
  - docs/SCRIPTS_E_COMANDOS_DASHBOARD.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-10-10-evolucao-malha-agentica-sota-v8-gold
  caminhos:
  - .agents/skills.json
  - llm/orchestrator.py
  - llm/providers.py
  - tests/test_governanca_skills.py
  parecer: Revisado em 2026-11-18. Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; Declaracao canonica da skill
    local key-pool-audit em .agents/skills.json, data/agents_manifest.json (@securitychief),
    .claude/agents/securitychief.md e test_governanca_skills.py; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-10-13-conclusao-4-trilhas-calibracao-rust-warmup-strata
  caminhos:
  - api/v1/server.py
  parecer: Revisado em 2026-11-18. Integracao do observatorio mascarado de chaves
    e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e Setup-NexusProfile.ps1;
    validado com ruff, pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest
    de skills, 2 Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-10-13-saneamento-diagnosticos-ide-e-compatibilidade
  caminhos:
  - llm/orchestrator.py
  parecer: Revisado em 2026-11-18. Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: registro-2026-10-18-painel-nexus-warmup-e-mesh-orchestrator
  caminhos:
  - frontend/src/app/(user)/dashboard/page.tsx
  - frontend/src/app/api/sota/nexus-mesh/route.ts
  parecer: Revisado em 2026-11-18. Painel NexusKeyPoolsPanel integrado ao /dashboard
    e endpoint /api/sota/key-pools conectado ao nexus-mesh; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: registro-2026-10-18-resolucao-sonarqube-e-saneamento-global
  caminhos:
  - api/v1/server.py
  parecer: Revisado em 2026-11-18. Integracao do observatorio mascarado de chaves
    e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e Setup-NexusProfile.ps1;
    validado com ruff, pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest
    de skills, 2 Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-10-19-resolucao-sonarqube-nexus-mesh-e-logger
  caminhos:
  - frontend/src/app/api/sota/nexus-mesh/route.ts
  parecer: Revisado em 2026-11-18. Painel NexusKeyPoolsPanel integrado ao /dashboard
    e endpoint /api/sota/key-pools conectado ao nexus-mesh; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: registro-2026-10-19-saneamento-sonarqube-timesfm-e-a11y
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-18. Integracao do observatorio mascarado de chaves
    e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e Setup-NexusProfile.ps1;
    validado com ruff, pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest
    de skills, 2 Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-10-19-verificacao-neural-timesfm-e-evolucao-ecossistema
  caminhos:
  - api/v1/handlers.py
  - scripts/setup/Setup-NexusProfile.ps1
  parecer: Revisado em 2026-11-18. Integracao do observatorio mascarado de chaves
    e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e Setup-NexusProfile.ps1;
    validado com ruff, pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest
    de skills, 2 Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-10-20-harmonizacao-tier1-e-gemini-38
  caminhos:
  - CLAUDE.md
  - cli/commands.py
  - data/agents_manifest.json
  - do.ps1
  - engine/llm_api.py
  parecer: Revisado em 2026-11-18. Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; Integracao do observatorio mascarado
    de chaves e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e
    Setup-NexusProfile.ps1; Declaracao canonica da skill local key-pool-audit em
    .agents/skills.json, data/agents_manifest.json (@securitychief), .claude/agents/securitychief.md
    e test_governanca_skills.py; Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-10-20-saneamento-quality-gate-ascii-e-reconciliacao-de-ancoras
  caminhos:
  - docs/SCRIPTS_E_COMANDOS_DASHBOARD.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
  caminhos:
  - tests/test_governanca_skills.py
  parecer: Revisado em 2026-11-18. Declaracao canonica da skill local key-pool-audit
    em .agents/skills.json, data/agents_manifest.json (@securitychief), .claude/agents/securitychief.md
    e test_governanca_skills.py; validado com ruff, pyright, eslint, tsc, 81 pytest
    de pools/roteamento, 10 pytest de skills, 2 Jest e Quality Gate CWV/A11y/CVE
    verde.
- registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
  caminhos:
  - engine/llm_api.py
  parecer: Revisado em 2026-11-18. Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
  caminhos:
  - .claude/agents/securitychief.md
  - data/agents_manifest.json
  parecer: Revisado em 2026-11-18. Declaracao canonica da skill local key-pool-audit
    em .agents/skills.json, data/agents_manifest.json (@securitychief), .claude/agents/securitychief.md
    e test_governanca_skills.py; validado com ruff, pyright, eslint, tsc, 81 pytest
    de pools/roteamento, 10 pytest de skills, 2 Jest e Quality Gate CWV/A11y/CVE
    verde.
- registro: registro-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules
  caminhos:
  - frontend/src/app/api/sota/nexus-mesh/route.ts
  parecer: Revisado em 2026-11-18. Painel NexusKeyPoolsPanel integrado ao /dashboard
    e endpoint /api/sota/key-pools conectado ao nexus-mesh; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: registro-2026-11-03-sincronizacao-e-correcao-frontmatter-skills-sota
  caminhos:
  - .agents/skills.json
  - data/agents_manifest.json
  - tests/test_governanca_skills.py
  parecer: Revisado em 2026-11-18. Declaracao canonica da skill local key-pool-audit
    em .agents/skills.json, data/agents_manifest.json (@securitychief), .claude/agents/securitychief.md
    e test_governanca_skills.py; validado com ruff, pyright, eslint, tsc, 81 pytest
    de pools/roteamento, 10 pytest de skills, 2 Jest e Quality Gate CWV/A11y/CVE
    verde.
- registro: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
  caminhos:
  - data/agents_manifest.json
  - tests/test_governanca_skills.py
  parecer: Revisado em 2026-11-18. Declaracao canonica da skill local key-pool-audit
    em .agents/skills.json, data/agents_manifest.json (@securitychief), .claude/agents/securitychief.md
    e test_governanca_skills.py; validado com ruff, pyright, eslint, tsc, 81 pytest
    de pools/roteamento, 10 pytest de skills, 2 Jest e Quality Gate CWV/A11y/CVE
    verde.
- registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
  caminhos:
  - llm/budget.py
  - llm/openrouter_pool.py
  parecer: Revisado em 2026-11-18. Pools OpenRouter expandidos (Tier1=5, Tier2=10,
    Tier3=5, Tier4=12), OPENROUTER_API_KEY dedicada ao Tier 4 e round-robin adaptativo;
    Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
  caminhos:
  - llm/providers.py
  parecer: Revisado em 2026-11-18. Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: registro-2026-11-08-integracao-sota-suite-antigravity-sdk-cli-acp
  caminhos:
  - scripts/setup/Setup-NexusProfile.ps1
  parecer: Revisado em 2026-11-18. Integracao do observatorio mascarado de chaves
    e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e Setup-NexusProfile.ps1;
    validado com ruff, pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest
    de skills, 2 Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-11-08-otimizacao-backend-sonarlint-pyright-e-headings
  caminhos:
  - frontend/src/app/api/sota/nexus-mesh/route.ts
  parecer: Revisado em 2026-11-18. Painel NexusKeyPoolsPanel integrado ao /dashboard
    e endpoint /api/sota/key-pools conectado ao nexus-mesh; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: registro-2026-11-08-refinamento-sonarlint-e-code-review-triage
  caminhos:
  - frontend/src/app/api/sota/nexus-mesh/route.ts
  parecer: Revisado em 2026-11-18. Painel NexusKeyPoolsPanel integrado ao /dashboard
    e endpoint /api/sota/key-pools conectado ao nexus-mesh; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: registro-2026-11-08-saneamento-code-review-triage
  caminhos:
  - frontend/src/app/api/sota/nexus-mesh/route.ts
  parecer: Revisado em 2026-11-18. Painel NexusKeyPoolsPanel integrado ao /dashboard
    e endpoint /api/sota/key-pools conectado ao nexus-mesh; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: registro-2026-11-08-saneamento-pure-ascii-timesfm-e-handlers
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-18. Integracao do observatorio mascarado de chaves
    e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e Setup-NexusProfile.ps1;
    validado com ruff, pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest
    de skills, 2 Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-11-09-remediacao-telemetria-cockpit-e-homeostase-laya-chrysalis
  caminhos:
  - frontend/src/app/api/sota/nexus-mesh/route.ts
  parecer: Revisado em 2026-11-18. Painel NexusKeyPoolsPanel integrado ao /dashboard
    e endpoint /api/sota/key-pools conectado ao nexus-mesh; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: registro-2026-11-12-anatomia-assinatura-5-campos
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-11-12-governanca-identidades-e-assinaturas
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-11-12-ollama-cloud-provider
  caminhos:
  - llm/budget.py
  - llm/ollama_cloud.py
  - llm/orchestrator.py
  - llm/providers.py
  parecer: Revisado em 2026-11-18. Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: registro-2026-11-12-pool-multimodal-e-refactors-sonar
  caminhos:
  - CLAUDE.md
  - docs/POOLS-DE-CHAVES.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-11-12-pools-chaves-reposicao-e-doc-consolidada
  caminhos:
  - CLAUDE.md
  - docs/POOLS-DE-CHAVES.md
  - scripts/ops/Set-OpenRouterKeyPools.ps1
  - tests/test_openrouter_pools.py
  parecer: Revisado em 2026-11-18. Pools OpenRouter expandidos (Tier1=5, Tier2=10,
    Tier3=5, Tier4=12), OPENROUTER_API_KEY dedicada ao Tier 4 e round-robin adaptativo;
    Harmonizacao documental de 87 variaveis HKCU/HKLM (11 pools), chave legada OLLAMA_CLOUD_KEY
    e CLI audit-keys; validado com ruff, pyright, eslint, tsc, 81 pytest de pools/roteamento,
    10 pytest de skills, 2 Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-11-12-preferencia-devin-e-data-governanca
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-11-12-review-sweeps-endurecimento-sota
  caminhos:
  - llm/budget.py
  - llm/orchestrator.py
  - tests/test_openrouter_pools.py
  parecer: Revisado em 2026-11-18. Pools OpenRouter expandidos (Tier1=5, Tier2=10,
    Tier3=5, Tier4=12), OPENROUTER_API_KEY dedicada ao Tier 4 e round-robin adaptativo;
    Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: registro-2026-11-14-correcao-devin-e-entrypoints-gemini-3-1-pro
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-11-14-identidade-e-governanca-gemini-4-hydrogen
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-11-14-llama-cpp-b12387-router-9931
  caminhos:
  - llm/providers.py
  parecer: Revisado em 2026-11-18. Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: registro-2026-11-14-regua-graduada-familia-gemini-tier1
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-11-14-roteamento-pools-transporte-e-validacao-hrc
  caminhos:
  - engine/llm_api.py
  - llm/budget.py
  - llm/openrouter_pool.py
  - llm/orchestrator.py
  - llm/providers.py
  parecer: Revisado em 2026-11-18. Pools OpenRouter expandidos (Tier1=5, Tier2=10,
    Tier3=5, Tier4=12), OPENROUTER_API_KEY dedicada ao Tier 4 e round-robin adaptativo;
    Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: registro-2026-11-14-sync-uvlock-ollama-cloud-circuit-e-ci
  caminhos:
  - llm/ollama_cloud.py
  - llm/providers.py
  parecer: Revisado em 2026-11-18. Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: registro-2026-11-15-blindagem-calibracao-presencial-tier0
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-11-15-malha-agentica-rotacao-hkcu-hklm
  caminhos:
  - llm/providers.py
  parecer: Revisado em 2026-11-18. Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: registro-2026-11-15-saneamento-sonarlint-codeql-e-portoes
  caminhos:
  - llm/providers.py
  parecer: Revisado em 2026-11-18. Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: registro-2026-11-17-arbitragem-soberana-bypass-portao
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-11-17-auditoria-fortificacao-backend-5-fases
  caminhos:
  - api/v1/handlers.py
  - api/v1/server.py
  - database/queue_manager.py
  - engine/llm_api.py
  - llm/budget.py
  - llm/openrouter_pool.py
  - llm/orchestrator.py
  - llm/providers.py
  parecer: Revisado em 2026-11-18. Pools OpenRouter expandidos (Tier1=5, Tier2=10,
    Tier3=5, Tier4=12), OPENROUTER_API_KEY dedicada ao Tier 4 e round-robin adaptativo;
    Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; Integracao do observatorio mascarado
    de chaves e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e
    Setup-NexusProfile.ps1; validado com ruff, pyright, eslint, tsc, 81 pytest de
    pools/roteamento, 10 pytest de skills, 2 Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-11-17-auto-configuracao-harness-devin-swe2
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-11-17-fase-3-backend-estrutural-sota
  caminhos:
  - api/v1/handlers.py
  - engine/llm_api.py
  - llm/budget.py
  parecer: Revisado em 2026-11-18. Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; Integracao do observatorio mascarado
    de chaves e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e
    Setup-NexusProfile.ps1; validado com ruff, pyright, eslint, tsc, 81 pytest de
    pools/roteamento, 10 pytest de skills, 2 Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-11-17-fase-4-governanca-estrutural-sota
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-11-17-fase-5-evolucao-das-forcas-sota
  caminhos:
  - cli/commands.py
  - do.ps1
  parecer: Revisado em 2026-11-18. Integracao do observatorio mascarado de chaves
    e auditoria em /api/v1/keys/observatory, cli/commands.py, do.ps1 e Setup-NexusProfile.ps1;
    validado com ruff, pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest
    de skills, 2 Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-11-18-disjuntor-404-e-modelos-free-openrouter
  caminhos:
  - engine/llm_api.py
  - llm/orchestrator.py
  - llm/providers.py
  - tests/test_openrouter_pools.py
  parecer: Revisado em 2026-11-18. Pools OpenRouter expandidos (Tier1=5, Tier2=10,
    Tier3=5, Tier4=12), OPENROUTER_API_KEY dedicada ao Tier 4 e round-robin adaptativo;
    Otimizacao bidirecional ida e volta em providers/orchestrator/budget/queue_manager/ollama_cloud
    com telemetry feedback e consulta batch SQLite; validado com ruff, pyright,
    eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2 Jest e Quality
    Gate CWV/A11y/CVE verde.
- registro: registro-2026-11-18-escopo-causal-reteste-e-arbitragem-tier0
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: registro-2026-11-18-worker-hud-governanca-argon-hydrogen-e-handoff
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: relatorio-2026-06-16-auditoria-e-harmonizacao-v8-gold
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: relatorio-2026-08-29-analise-integral-ecossistema-sota-v8-gold
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: relatorio-2026-08-29-impacto-quantitativo-qualitativo-sota-v8-gold
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: relatorio-fusao-cerebro-claude-quality-gate-2026-09-01
  caminhos:
  - data/agents_manifest.json
  parecer: Revisado em 2026-11-18. Declaracao canonica da skill local key-pool-audit
    em .agents/skills.json, data/agents_manifest.json (@securitychief), .claude/agents/securitychief.md
    e test_governanca_skills.py; validado com ruff, pyright, eslint, tsc, 81 pytest
    de pools/roteamento, 10 pytest de skills, 2 Jest e Quality Gate CWV/A11y/CVE
    verde.
- registro: validacao-2026-09-12-a-grade-que-nao-cabia-e-o-aviso-que-virou-bloqueio
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
- registro: validacao-2026-09-12-a-identidade-de-autoria-deixa-de-ser-prosa
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-18. Harmonizacao documental de 87 variaveis HKCU/HKLM
    (11 pools), chave legada OLLAMA_CLOUD_KEY e CLI audit-keys; validado com ruff,
    pyright, eslint, tsc, 81 pytest de pools/roteamento, 10 pytest de skills, 2
    Jest e Quality Gate CWV/A11y/CVE verde.
---

# Auditoria SOTA: Paridade HKCU/HKLM, Pools de Chaves, Observatorio e Roteamento Bidirecional

**Data:** 2026-11-18  
**Condutor:** Gemini 4 Hydrogen `<noreply@google.com>` [Tier 1]  
**Regime:** Protocolo Chico v8.0 Gold | Escopo: Offline + Telemetria DB + Probe HTTP Tier 1 + Quality Gate 5 Fases

---

## 1. Achados de Auditoria e Remediacao no Registro (HKCU <-> HKLM)

1. **Divergencia e Promocao de Chave Legada Ollama:**
   - **Achado:** `HKCU\OLLAMA_API_KEY` (`23fcbfeffd...ZgS4`) divergia de `HKLM\OLLAMA_API_KEY` (`92bd3981ff...ojTp`).
   - **Remediacao:** A chave legada de `HKLM` foi preservada e promovida para `OLLAMA_CLOUD_KEY` em ambos os hives, e `HKCU\OLLAMA_API_KEY` foi sincronizada em `HKLM`. O runtime Ollama Cloud (`llm/ollama_cloud.py` + `llm/providers.py`) passou a enxergar `OLLAMA_KEYS = 2` (primaria + backup legada).
2. **Paridade Completa (`HKCU_ONLY` e Tuning RX 570):**
   - `HF_TOKEN`, `SOTA_OPENAI_API_KEY` e `SOTA_SITE_TOKEN` foram replicados de `HKCU` para `HKLM`.
   - `OLLAMA_KV_CACHE_TYPE=q8_0`, `OLLAMA_MAX_LOADED_MODELS=2`, `OLLAMA_CONTEXT_LENGTH=32768` e `OLLAMA_FLASH_ATTENTION=1` foram harmonizados entre `HKCU` e `HKLM` com broadcast `WM_SETTINGCHANGE`.
   - Auditoria final via `audit-keys -AnomaliesOnly -Strict`: **87/87 variaveis sincronizadas em 11 pools**, `InvalidFmt = 0`, `FAIL = 0`, `WARN = 0`, apenas `INFO = 1` para heranca de processo antigo em `OPENROUTER_API_KEY` ate reinicio do shell.
3. **Expansao e Desacoplamento de Tiers OpenRouter (`32` chaves):**
   - `OPENROUTER_TIER1_KEY_2` rotacionada (`sha8 22eba9b5`) e `OPENROUTER_TIER1_KEY_5` adicionada (`34b51f77`) -> **Tier 1 = 5 chaves**.
   - `OPENROUTER_TIER2_KEY_8..10` (`a89d74b3`, `3639dfc3`, `4145ccc4`) adicionadas -> **Tier 2 = 10 chaves**.
   - `OPENROUTER_API_KEY` (`9669414e`) desacoplada de Tier 1 e dedicada exclusivamente ao **Tier 4** (`12` entradas unicas), evitando concorrencia de subagentes e ferramentas legadas sobre a cota cognitiva do Tier 1.

---

## 2. Otimizacao Bidirecional de Roteamento ("Ida e Volta")

| Direcao | Modulo | Problema Anterior | Correcao Implementada |
| :--- | :--- | :--- | :--- |
| **Ida** | `llm/openrouter_pool.py` | Empate deterministico concentrava carga na Key 1; HTTP 402 sem cooldown proprio | Cursor `_tier_cursors` round-robin nos empates + `DEFAULT_COOLDOWN_402` (15m) + `is_key_available` / `has_available_key` / `get_ranked_keys_for_tier` |
| **Ida** | `llm/orchestrator.py` | Tarefas de subagente/compressao podiam vazar para Tier 1/default | `_resolve_openrouter_tier` + `_resolve_openrouter_keys_for_task` isolam compressao (Tier 3) e subagentes (Tier 4), blindando Tier 1 |
| **Ida** | `database/queue_manager.py` + `llm/budget.py` | Consultas N+1 por chave em `_rank_keys_by_health` | `get_keys_recent_stats_batch` com consulta unica parametrizada `json_each(?)` e fallback seguro sync/async |
| **Ida** | `engine/llm_api.py` + `llm/ollama_cloud.py` | Ordem de extracao OpenRouter podia tocar Tier 1 cedo; Ollama Cloud lia so 1 chave | Ordem `Tier 4 -> Tier 2 -> Tier 3 -> Tier 1` para fallback de engine e `OLLAMA_KEYS` com fallback em `OLLAMA_CLOUD_KEY` |
| **Volta** | `llm/providers.py` | `_check_gemini_availability` e `_check_openrouter_availability` nao sincronizavam quarentena viva nem reportavam sucesso/falha aos pool managers | `OpenRouterStrategy.check_quarantine` ativo; `_notify_pool_success` e `_notify_pool_failure` propagam latencia e status HTTP aos singletons em memoria |

---

## 3. Observatorio `key-pool-audit`, Nexus CLI e Dashboard Web

- **Skill, Bridge & CLI Global:** `.agents/skills/key-pool-audit/` (`SKILL.md`, `Audit-KeyPools.ps1`, `render_key_audit.py`), declarada em `.agents/skills.json`, `data/agents_manifest.json` (`@securitychief`), `.claude/agents/securitychief.md` e `C:/Users/rapha/.gemini/bin/audit-keys.cmd`. Expoe auditoria mascarada (`prefixo...sufixo + hmac sha8`), paineis Rich e flags `-Live`, `-Pool`, `-AnomaliesOnly`, `-Plain`, `-Json` e `-Strict`.
- **Nexus CLI & Scripts:** Integrado em `cli/commands.py` (`audit-keys` / `nexus-audit-keys` com `# noqa: S603 -- Record-Id`), `do.ps1` (`-AuditKeys` / `-Live`) e `scripts/setup/Setup-NexusProfile.ps1` (`nexus-audit-keys`).
- **Backend HTTP & Frontend Next.js:** `llm/key_observatory.py` alimenta rotas autenticadas `GET` e `POST /api/v1/keys/observatory` (`api/v1/handlers.py`, `api/v1/server.py`), proxy server-side `/api/sota/key-pools`, no de observatorio em `/api/sota/nexus-mesh` e painel interativo `NexusKeyPoolsPanel.tsx` em `frontend/src/app/(user)/dashboard/page.tsx`.

---

## 4. Evidencias Medidas

| Verificacao | Escopo | Resultado Observado |
| :--- | :--- | :--- |
| `audit-keys -AnomaliesOnly -Strict` | 87 variaveis em 11 pools (HKCU/HKLM/Process + DB) | Exit `0` (`87/87` synced, `0` FAIL, `0` WARN, `1` INFO) |
| `audit-keys -Pool Tier1 -Live` | Probe HTTP Tier 1 OpenRouter + sockets locais | `5/5` HTTP 200 (media `101 ms`); Ollama `:11434` (`197 ms`), API `:17042` (`19 ms`), Gemma `:17043` (`11 ms`) |
| `pyright` + `ruff check` + `ruff format` | `pyproject.toml` + arquivos Python tocados | `0` errors, `0` warnings, `0` informations; `All checks passed!` |
| `pytest` (pools/roteamento + skills) | 6 suites de pools/roteamento + `test_governanca_skills.py` | `81 passed in 7.57s` + `10 passed in 7.59s`, `0` errors, `0` warnings |
| `eslint` + `tsc --build` + `jest` | Workspace frontend + `NexusKeyPoolsPanel.test.tsx` + `NexusOperationsPanel.test.tsx` | Lint exit `0`, typecheck exit `0`, Jest `2 passed, 2 total` (`0` errors, `0` warnings) |
| `npm run sota:audit` (`cwv_gate.ps1`) | 5 fases CWV/A11y/CVE/SRI/Higiene em `http://localhost:3000` | `SUCESSO (VERDE)` (`LCP ~310-317ms`, `CLS 0.000168`, `TBT 32.496ms`, `TTFB ~100.7ms`, `axe=0`, `CVE=0`, `SRI VERIFIED`) |
| `Test-AgentCalibrationLedger.ps1` | Ledger append-only SHA-256 | `valid`, `100` registros, `sequence=99` (`Score=9.5`, hash `90d88141`) |
