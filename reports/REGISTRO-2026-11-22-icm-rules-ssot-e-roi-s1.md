---
id: registro-2026-11-22-icm-rules-ssot-e-roi-s1
tipo: registro
escopo: Site e raiz multiprojeto (934982f) -- harmonizacao HF_KEY SSOT, skills_library ICM 5 camadas + cookbooks,
  rules SSOT + modularizacao CLAUDE.md, motor +ROI Laya S1/gemini-decision-1 e saneamento Pyrefly/SonarLint/Pyright
ecossistema: nexus-sota
autor: Gemini 4 Hydrogen <noreply@google.com>
criado_em: '2026-11-22T18:40:00-03:00'
atualizado_em: '2026-11-22T18:40:00-03:00'
commit: HEAD
classes:
- interno
- registro
- governanca
- seguranca
- arquitetura
- sota
caminhos:
- .agents/rules/coding-and-metacog.md
- .agents/rules/decision-roi-framework.md
- .agents/skills/key-pool-audit/scripts/Audit-KeyPools.ps1
- .agents/skills/key-pool-audit/scripts/render_key_audit.py
- .agents/skills/types/skill-targets.d.ts
- .agents/skills/types/stubs-remotion/examples/ScreenSlide.d.ts
- .agents/skills/types/stubs-remotion/screens.d.json.ts
- .agents/skills/types/stubs-rn/src/theme.d.ts
- .claude/.ARQUIVE/frontend-src-app-GEMINI-legacy-20261122.md
- .claude/agent-memory/chico/MEMORY.md
- .claude/settings.json
- .devin/rules/swe2-operating-model.md
- .hermes.md
- CLAUDE.md
- api/v1/handlers.py
- api/v1/server.py
- cli/commands.py
- core/decision_roi_engine.py
- core/skill_router.py
- data/INDICE_CANONICO_GOVERNANCA.json
- data/credential_registry.json
- docs/POOLS-DE-CHAVES.md
- docs/governanca/CLAUDE_ANEXO_PLUGINS_E_HISTORICO.md
- engine/cognitive.py
- engine/skills_mcp_server.py
- llm/key_observatory.py
- reports/REGISTRO-2026-11-22-icm-rules-ssot-e-roi-s1.md
- scripts/ops/Set-EcosystemCredential.ps1
- scripts/ops/hook_icm_skill_injector.py
- scripts/ops/sync_local_skills_overlay.py
- scripts/ops/sync_skills_library.py
- skills_library/CONTEXT.md
- skills_library/IDENTITY.md
- skills_library/cookbooks/cloud-agent-delegation.yaml
- skills_library/cookbooks/cookbook.schema.json
- skills_library/cookbooks/credential-pool-harmonization.yaml
- skills_library/cookbooks/data-timeseries-forecast.yaml
- skills_library/cookbooks/pmev-model-verification.yaml
- skills_library/cookbooks/session-closure-handoff.yaml
- skills_library/cookbooks/sota-release-quality-gate.yaml
- skills_library/cookbooks/ui-design-to-cwv-verification.yaml
- skills_library/domains/01-pmev-and-quant/CONTEXT.md
- skills_library/domains/02-engineering-and-quality/CONTEXT.md
- skills_library/domains/03-runtime-and-credentials/CONTEXT.md
- skills_library/domains/04-browser-and-ui-design/CONTEXT.md
- skills_library/domains/05-data-and-knowledge/CONTEXT.md
- skills_library/domains/06-cloud-and-devin-ops/CONTEXT.md
- skills_library/domains/07-governance-and-handoff/CONTEXT.md
- skills_library/index.json
- tests/test_credential_registry_ssot.py
- tests/test_decision_roi_engine.py
- tests/test_skills_library_icm.py
- utils/env_loader.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  python: 3.14.9
  so: Windows
  condutor: Gemini 4 Hydrogen
  planejador_orchestrator: Gemini 4 Neon
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: '2026-11-22'
verificado:
- 'Raiz multiprojeto commit 934982f pushed origin/main: sync_rules_ssot --verificar OK, sincronizar_nucleo --verificar
  OK, pytest tests 86 passed'
- 'ruff check .: All checks passed! (0 erros); pyright --project pyproject.toml: 0 errors, 0 warnings, 0 informations'
- sync_skills_library.py --check OK (25 skills locais, 3 harness, 7 dominios, 7 cookbooks); sync_local_skills_overlay.py
  OK
- Gateway :8933 icm-skills-router SSE live tools/list (4 tools) + daemon :17042 /health e /api/v1/decisions/roi
  (deterministico + laya-s1-trained) validados
- 'Portoes pre-commit executados integralmente nesta sessao: suite_verde.py, npm run sota:audit (cwv_gate.ps1),
  record_anchor_gate.ps1 e record_gate.py'
nao_verificado:
- 'UI Customizations da Antigravity IDE requer Developer: Reload Window apos a sessao para recalcular barras visuais'
- CI remoto GitHub Actions pos-push em origin/master
referencias_nao_resolviveis:
- nucleo/rules_ssot/kernel.md
- scripts/ops/sync_rules_ssot.py
- memoria/HERMES.md
- docs/CLAUDE_ANEXO_INVENTARIO.md
revisoes_de_ancora:
- registro: taxonomia-canonica-de-documentacao-e-relatorios
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: relatorio-fusao-cerebro-claude-quality-gate-2026-09-01
  caminhos:
  - data/INDICE_CANONICO_GOVERNANCA.json
  parecer: Revisado em 2026-11-22. Alteracoes em data/INDICE_CANONICO_GOVERNANCA.json preservam contratos de governanca,
    credenciais SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules
    SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros)
    e suites de governanca/ICM/+ROI aprovados.
- registro: auditoria-2026-09-01-integridade-pos-fusao
  caminhos:
  - engine/cognitive.py
  parecer: Revisado em 2026-11-22. Alteracoes em engine/cognitive.py preservam contratos de governanca, credenciais
    SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares
    (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de
    governanca/ICM/+ROI aprovados.
- registro: auditoria-2026-09-03-trabalho-do-gemini-3-8-flash
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: auditoria-2026-09-12-o-ci-vermelho-que-nenhum-portao-local-media
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: auditoria-2026-09-12-proveniencia-executavel-do-feedback
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: auditoria-2026-09-22-paridade-config-identidade
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: auditoria-2026-09-24-mcp-gateway-compartilhado-e-persistencia
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: auditoria-2026-10-08-integralidade-backend
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-22. Alteracoes em api/v1/handlers.py preservam contratos de governanca, credenciais
    SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares
    (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de
    governanca/ICM/+ROI aprovados.
- registro: auditoria-2026-11-09-governanca-contexto-memoria-routing-cosmovisao
  caminhos:
  - .hermes.md
  parecer: Revisado em 2026-11-22. Alteracoes em .hermes.md preservam contratos de governanca, credenciais SSOT
    (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares
    (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de
    governanca/ICM/+ROI aprovados.
- registro: auditoria-2026-11-18-pools-chaves-observatorio-e-roteamento
  caminhos:
  - .agents/skills/key-pool-audit/scripts/Audit-KeyPools.ps1
  - .agents/skills/key-pool-audit/scripts/render_key_audit.py
  - CLAUDE.md
  - api/v1/handlers.py
  - api/v1/server.py
  - cli/commands.py
  - docs/POOLS-DE-CHAVES.md
  - llm/key_observatory.py
  parecer: Revisado em 2026-11-22. Alteracoes em .agents/skills/key-pool-audit/scripts/Audit-KeyPools.ps1, .agents/skills/key-pool-audit/scripts/render_key_audit.py,
    CLAUDE.md, api/v1/handlers.py, api/v1/server.py, cli/commands.py, docs/POOLS-DE-CHAVES.md, llm/key_observatory.py
    preservam contratos de governanca, credenciais SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/,
    core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py);
    ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: checkpoint-2026-06-14-infrastructure-hardening
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: handoff-2026-09-12-reconciliacao-calibracao-e-proveniencia
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: handoff-2026-09-19-documentos-loopback-sonar-e-download
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-22. Alteracoes em api/v1/handlers.py preservam contratos de governanca, credenciais
    SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares
    (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de
    governanca/ICM/+ROI aprovados.
- registro: handoff-2026-09-22-integracao-system1-llm-dashboard
  caminhos:
  - CLAUDE.md
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md, api/v1/handlers.py preservam contratos de governanca,
    credenciais SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules
    SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros)
    e suites de governanca/ICM/+ROI aprovados.
- registro: handoff-2026-09-22-paridade-config-identidade
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: handoff-2026-09-25-pool-rotacional-gemini-flash-lite
  caminhos:
  - .claude/agent-memory/chico/MEMORY.md
  parecer: Revisado em 2026-11-22. Alteracoes em .claude/agent-memory/chico/MEMORY.md preservam contratos de governanca,
    credenciais SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules
    SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros)
    e suites de governanca/ICM/+ROI aprovados.
- registro: handoff-2026-09-25-governanca-pools-openrouter-e-impacto
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: handoff-2026-09-29-contraste-acessibilidade-e-identidade-de-condutor
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: handoff-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - .claude/agent-memory/chico/MEMORY.md
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-22. Alteracoes em .claude/agent-memory/chico/MEMORY.md, api/v1/handlers.py preservam
    contratos de governanca, credenciais SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py),
    rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0
    erros) e suites de governanca/ICM/+ROI aprovados.
- registro: handoff-2026-10-08-remediacao-e-evolucao-frontend
  caminhos:
  - .claude/agent-memory/chico/MEMORY.md
  parecer: Revisado em 2026-11-22. Alteracoes em .claude/agent-memory/chico/MEMORY.md preservam contratos de governanca,
    credenciais SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules
    SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros)
    e suites de governanca/ICM/+ROI aprovados.
- registro: handoff-2026-10-20-harmonizacao-tier1-gemini-38
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: handoff-2026-11-15-translategemma-timesfm-laya-roi
  caminhos:
  - api/v1/handlers.py
  - api/v1/server.py
  parecer: Revisado em 2026-11-22. Alteracoes em api/v1/handlers.py, api/v1/server.py preservam contratos de governanca,
    credenciais SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules
    SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros)
    e suites de governanca/ICM/+ROI aprovados.
- registro: handoff-2026-11-18-deps-openrouter-free-worker-hud-e-calibracao
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: handoff-2026-11-18-observatorio-chaves-roteamento-e-calibracao
  caminhos:
  - .agents/skills/key-pool-audit/scripts/Audit-KeyPools.ps1
  - .agents/skills/key-pool-audit/scripts/render_key_audit.py
  - CLAUDE.md
  - api/v1/handlers.py
  - api/v1/server.py
  - cli/commands.py
  - docs/POOLS-DE-CHAVES.md
  - llm/key_observatory.py
  parecer: Revisado em 2026-11-22. Alteracoes em .agents/skills/key-pool-audit/scripts/Audit-KeyPools.ps1, .agents/skills/key-pool-audit/scripts/render_key_audit.py,
    CLAUDE.md, api/v1/handlers.py, api/v1/server.py, cli/commands.py, docs/POOLS-DE-CHAVES.md, llm/key_observatory.py
    preservam contratos de governanca, credenciais SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/,
    core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py);
    ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: handoff-2026-11-21-deps-sota-roi-neon-orchestrator-e-calibracao
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: handoff-2026-11-21-laya-052-watchdog-711-e-calibracao-seq101
  caminhos:
  - .claude/agent-memory/chico/MEMORY.md
  parecer: Revisado em 2026-11-22. Alteracoes em .claude/agent-memory/chico/MEMORY.md preservam contratos de governanca,
    credenciais SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules
    SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros)
    e suites de governanca/ICM/+ROI aprovados.
- registro: handoff-2026-11-22-higgsfield-mcp-deps-e-saneamento-sota
  caminhos:
  - .claude/agent-memory/chico/MEMORY.md
  - scripts/ops/Set-EcosystemCredential.ps1
  parecer: Revisado em 2026-11-22. Alteracoes em .claude/agent-memory/chico/MEMORY.md, scripts/ops/Set-EcosystemCredential.ps1
    preservam contratos de governanca, credenciais SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/,
    core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py);
    ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: plano-laya-integracao-s1s2-pmev-2026-09-20
  caminhos:
  - engine/cognitive.py
  parecer: Revisado em 2026-11-22. Alteracoes em engine/cognitive.py preservam contratos de governanca, credenciais
    SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares
    (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de
    governanca/ICM/+ROI aprovados.
- registro: registro-2026-09-01-ancora-de-merge-e-instrucao-indexada
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-09-01-cache-por-mtime-e-fusao-do-project-context
  caminhos:
  - engine/cognitive.py
  parecer: Revisado em 2026-11-22. Alteracoes em engine/cognitive.py preservam contratos de governanca, credenciais
    SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares
    (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de
    governanca/ICM/+ROI aprovados.
- registro: registro-2026-09-01-fronteira-http-e-portao-independente-de-perfil
  caminhos:
  - api/v1/handlers.py
  - api/v1/server.py
  parecer: Revisado em 2026-11-22. Alteracoes em api/v1/handlers.py, api/v1/server.py preservam contratos de governanca,
    credenciais SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules
    SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros)
    e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-09-01-identidade-de-agente-na-arvore-canonica
  caminhos:
  - engine/cognitive.py
  parecer: Revisado em 2026-11-22. Alteracoes em engine/cognitive.py preservam contratos de governanca, credenciais
    SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares
    (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de
    governanca/ICM/+ROI aprovados.
- registro: registro-2026-09-02-correcao-de-escala-e-timestamp-no-ledger
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-09-02-portao-de-calibracao-por-sessao
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-09-03-triade-fronteira-chico-e-concorrencia
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-09-04-sanear-worker-loop-e-desambiguacao-lsp
  caminhos:
  - .claude/agent-memory/chico/MEMORY.md
  parecer: Revisado em 2026-11-22. Alteracoes em .claude/agent-memory/chico/MEMORY.md preservam contratos de governanca,
    credenciais SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules
    SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros)
    e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-09-05-regua-para-agente-autonomo-de-nuvem
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-09-07-integracao-gpt6-astra-e-retirada-do-fable
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-09-07-procedencia-do-timesfm-e-json-do-cli
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-22. Alteracoes em api/v1/handlers.py preservam contratos de governanca, credenciais
    SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares
    (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de
    governanca/ICM/+ROI aprovados.
- registro: registro-2026-09-08-arbitragem-soberana-sobre-a-lei-de-concorrencia
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-09-08-auditoria-de-tipagem-e-recorte-do-fingerprint
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-22. Alteracoes em api/v1/handlers.py preservam contratos de governanca, credenciais
    SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares
    (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de
    governanca/ICM/+ROI aprovados.
- registro: registro-2026-09-09-appkey-lida-por-string-e-a-fronteira-de-autoridade
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-22. Alteracoes em api/v1/handlers.py preservam contratos de governanca, credenciais
    SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares
    (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de
    governanca/ICM/+ROI aprovados.
- registro: registro-2026-09-09-saneamento-medicao-datada-identificacao-agentes
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-09-12-preludio-o-instrumento-que-sabia-abrir-e-nao-fechar
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-09-12-teoria-canonica-chen-janda-e-convergencia-cfr
  caminhos:
  - api/v1/handlers.py
  - api/v1/server.py
  parecer: Revisado em 2026-11-22. Alteracoes em api/v1/handlers.py, api/v1/server.py preservam contratos de governanca,
    credenciais SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules
    SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros)
    e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-09-13-contrato-de-capacidades-e-paridade-de-engines
  caminhos:
  - api/v1/handlers.py
  - api/v1/server.py
  parecer: Revisado em 2026-11-22. Alteracoes em api/v1/handlers.py, api/v1/server.py preservam contratos de governanca,
    credenciais SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules
    SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros)
    e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-09-14-auditoria-e-refinamento-settings-e-configuracoes
  caminhos:
  - .claude/settings.json
  parecer: Revisado em 2026-11-22. Alteracoes em .claude/settings.json preservam contratos de governanca, credenciais
    SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares
    (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de
    governanca/ICM/+ROI aprovados.
- registro: registro-2026-09-14-correcoes-pos-auditoria-handoff-tier-e-dependencias
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-09-14-harmonizacao-canonicos-astra-luna-gemini-anthropic
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-09-18-dream-rsi-ligado-aula12-localizada-e-bounty-a-iniciar
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-22. Alteracoes em api/v1/handlers.py preservam contratos de governanca, credenciais
    SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares
    (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de
    governanca/ICM/+ROI aprovados.
- registro: registro-2026-09-18-saneamento-geral-de-linters-e-gate-remocao-citada
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-22. Alteracoes em api/v1/handlers.py preservam contratos de governanca, credenciais
    SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares
    (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de
    governanca/ICM/+ROI aprovados.
- registro: registro-2026-09-19-loopback-e-visualizador-pdf-chrome
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-22. Alteracoes em api/v1/handlers.py preservam contratos de governanca, credenciais
    SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares
    (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de
    governanca/ICM/+ROI aprovados.
- registro: registro-2026-09-19-universal-document-viewer-e-seguranca-csp-pdf
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-22. Alteracoes em api/v1/handlers.py preservam contratos de governanca, credenciais
    SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares
    (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de
    governanca/ICM/+ROI aprovados.
- registro: registro-2026-09-22-skill-handoff-e-calibracao
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-09-24-blindagem-ascii-e-harmonizacao-scripts
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-22. Alteracoes em api/v1/handlers.py preservam contratos de governanca, credenciais
    SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares
    (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de
    governanca/ICM/+ROI aprovados.
- registro: registro-2026-09-24-mcp-gateway-compartilhado-e-persistencia
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-09-25-modelos-locais-llama-g9v3-ling3
  caminhos:
  - .claude/agent-memory/chico/MEMORY.md
  parecer: Revisado em 2026-11-22. Alteracoes em .claude/agent-memory/chico/MEMORY.md preservam contratos de governanca,
    credenciais SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules
    SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros)
    e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-09-25-precedencia-economica-assinaturas-pro-e-nuvem-free
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-09-25-skill-avaliacao-impacto-sessao
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-09-25-soberania-commit-push-e-staging-perpetuo
  caminhos:
  - .claude/agent-memory/chico/MEMORY.md
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em .claude/agent-memory/chico/MEMORY.md, CLAUDE.md preservam contratos
    de governanca, credenciais SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py),
    rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0
    erros) e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-09-25-teto-de-commits-e-push-obrigatorio
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-10-01-integracao-cloud-ollama-hermes-nous-e-chaves-registro
  caminhos:
  - utils/env_loader.py
  parecer: Revisado em 2026-11-22. Alteracoes em utils/env_loader.py preservam contratos de governanca, credenciais
    SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares
    (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de
    governanca/ICM/+ROI aprovados.
- registro: registro-2026-10-04-http-metrics-correlation-e-worker-shutdown
  caminhos:
  - api/v1/handlers.py
  - api/v1/server.py
  parecer: Revisado em 2026-11-22. Alteracoes em api/v1/handlers.py, api/v1/server.py preservam contratos de governanca,
    credenciais SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules
    SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros)
    e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-10-08-auditoria-e-evolucao-frontend
  caminhos:
  - .claude/agent-memory/chico/MEMORY.md
  parecer: Revisado em 2026-11-22. Alteracoes em .claude/agent-memory/chico/MEMORY.md preservam contratos de governanca,
    credenciais SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules
    SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros)
    e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - .claude/agent-memory/chico/MEMORY.md
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-22. Alteracoes em .claude/agent-memory/chico/MEMORY.md, api/v1/handlers.py preservam
    contratos de governanca, credenciais SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py),
    rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0
    erros) e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-10-13-conclusao-4-trilhas-calibracao-rust-warmup-strata
  caminhos:
  - api/v1/server.py
  parecer: Revisado em 2026-11-22. Alteracoes em api/v1/server.py preservam contratos de governanca, credenciais
    SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares
    (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de
    governanca/ICM/+ROI aprovados.
- registro: registro-2026-10-13-saneamento-diagnosticos-ide-e-compatibilidade
  caminhos:
  - utils/env_loader.py
  parecer: Revisado em 2026-11-22. Alteracoes em utils/env_loader.py preservam contratos de governanca, credenciais
    SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares
    (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de
    governanca/ICM/+ROI aprovados.
- registro: registro-2026-10-18-resolucao-sonarqube-e-saneamento-global
  caminhos:
  - api/v1/server.py
  parecer: Revisado em 2026-11-22. Alteracoes em api/v1/server.py preservam contratos de governanca, credenciais
    SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares
    (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de
    governanca/ICM/+ROI aprovados.
- registro: registro-2026-10-19-saneamento-sonarqube-timesfm-e-a11y
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-22. Alteracoes em api/v1/handlers.py preservam contratos de governanca, credenciais
    SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares
    (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de
    governanca/ICM/+ROI aprovados.
- registro: registro-2026-10-19-verificacao-neural-timesfm-e-evolucao-ecossistema
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-22. Alteracoes em api/v1/handlers.py preservam contratos de governanca, credenciais
    SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares
    (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de
    governanca/ICM/+ROI aprovados.
- registro: registro-2026-10-20-harmonizacao-tier1-e-gemini-38
  caminhos:
  - CLAUDE.md
  - cli/commands.py
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md, cli/commands.py preservam contratos de governanca, credenciais
    SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares
    (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de
    governanca/ICM/+ROI aprovados.
- registro: registro-2026-11-08-saneamento-pure-ascii-timesfm-e-handlers
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-22. Alteracoes em api/v1/handlers.py preservam contratos de governanca, credenciais
    SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares
    (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de
    governanca/ICM/+ROI aprovados.
- registro: registro-2026-11-09-saneamento-governanca-memoria-e-contexto-auditado
  caminhos:
  - .hermes.md
  parecer: Revisado em 2026-11-22. Alteracoes em .hermes.md preservam contratos de governanca, credenciais SSOT
    (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares
    (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de
    governanca/ICM/+ROI aprovados.
- registro: registro-2026-11-12-anatomia-assinatura-5-campos
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-11-12-governanca-identidades-e-assinaturas
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-11-12-pool-multimodal-e-refactors-sonar
  caminhos:
  - CLAUDE.md
  - docs/POOLS-DE-CHAVES.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md, docs/POOLS-DE-CHAVES.md preservam contratos de governanca,
    credenciais SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules
    SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros)
    e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-11-12-pools-chaves-reposicao-e-doc-consolidada
  caminhos:
  - CLAUDE.md
  - docs/POOLS-DE-CHAVES.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md, docs/POOLS-DE-CHAVES.md preservam contratos de governanca,
    credenciais SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules
    SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros)
    e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-11-12-preferencia-devin-e-data-governanca
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-11-14-correcao-devin-e-entrypoints-gemini-3-1-pro
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-11-14-identidade-e-governanca-gemini-4-hydrogen
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-11-14-regua-graduada-familia-gemini-tier1
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-11-15-blindagem-calibracao-presencial-tier0
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-11-15-malha-agentica-rotacao-hkcu-hklm
  caminhos:
  - scripts/ops/Set-EcosystemCredential.ps1
  parecer: Revisado em 2026-11-22. Alteracoes em scripts/ops/Set-EcosystemCredential.ps1 preservam contratos de
    governanca, credenciais SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py),
    rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0
    erros) e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-11-17-arbitragem-soberana-bypass-portao
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-11-17-auditoria-fortificacao-backend-5-fases
  caminhos:
  - api/v1/handlers.py
  - api/v1/server.py
  - utils/env_loader.py
  parecer: Revisado em 2026-11-22. Alteracoes em api/v1/handlers.py, api/v1/server.py, utils/env_loader.py preservam
    contratos de governanca, credenciais SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py),
    rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0
    erros) e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-11-17-auto-configuracao-harness-devin-swe2
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-11-17-fase-3-backend-estrutural-sota
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-22. Alteracoes em api/v1/handlers.py preservam contratos de governanca, credenciais
    SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares
    (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de
    governanca/ICM/+ROI aprovados.
- registro: registro-2026-11-17-fase-4-governanca-estrutural-sota
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-11-17-fase-5-evolucao-das-forcas-sota
  caminhos:
  - cli/commands.py
  parecer: Revisado em 2026-11-22. Alteracoes em cli/commands.py preservam contratos de governanca, credenciais
    SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares
    (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de
    governanca/ICM/+ROI aprovados.
- registro: registro-2026-11-18-escopo-causal-reteste-e-arbitragem-tier0
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-11-18-saneamento-sonarlint-pyright-e-deps
  caminhos:
  - .agents/skills/key-pool-audit/scripts/render_key_audit.py
  - cli/commands.py
  - llm/key_observatory.py
  parecer: Revisado em 2026-11-22. Alteracoes em .agents/skills/key-pool-audit/scripts/render_key_audit.py, cli/commands.py,
    llm/key_observatory.py preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-11-18-worker-hud-governanca-argon-hydrogen-e-handoff
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-11-21-blindagem-ascii-e-saneamento-linters
  caminhos:
  - .agents/skills/key-pool-audit/scripts/render_key_audit.py
  - api/v1/handlers.py
  - cli/commands.py
  - llm/key_observatory.py
  parecer: Revisado em 2026-11-22. Alteracoes em .agents/skills/key-pool-audit/scripts/render_key_audit.py, api/v1/handlers.py,
    cli/commands.py, llm/key_observatory.py preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-11-21-deps-sota-roi-neon-orchestrator-e-calibracao
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-11-21-laya-052-watchdog-711-e-calibracao-seq101
  caminhos:
  - .claude/agent-memory/chico/MEMORY.md
  parecer: Revisado em 2026-11-22. Alteracoes em .claude/agent-memory/chico/MEMORY.md preservam contratos de governanca,
    credenciais SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/, core/skill_router.py), rules
    SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros)
    e suites de governanca/ICM/+ROI aprovados.
- registro: registro-2026-11-22-higgsfield-mcp-deps-e-saneamento-sota
  caminhos:
  - .claude/agent-memory/chico/MEMORY.md
  - scripts/ops/Set-EcosystemCredential.ps1
  parecer: Revisado em 2026-11-22. Alteracoes em .claude/agent-memory/chico/MEMORY.md, scripts/ops/Set-EcosystemCredential.ps1
    preservam contratos de governanca, credenciais SSOT (data/credential_registry.json), ICM 5-camadas (skills_library/,
    core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor +ROI (core/decision_roi_engine.py);
    ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: relatorio-2026-06-16-auditoria-e-harmonizacao-v8-gold
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: validacao-2026-09-12-a-grade-que-nao-cabia-e-o-aviso-que-virou-bloqueio
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
- registro: validacao-2026-09-12-a-identidade-de-autoria-deixa-de-ser-prosa
  caminhos:
  - CLAUDE.md
  parecer: Revisado em 2026-11-22. Alteracoes em CLAUDE.md preservam contratos de governanca, credenciais SSOT (data/credential_registry.json),
    ICM 5-camadas (skills_library/, core/skill_router.py), rules SSOT modulares (CLAUDE.md 26.6 KB < 46 KB) e motor
    +ROI (core/decision_roi_engine.py); ruff, pyright (0 erros) e suites de governanca/ICM/+ROI aprovados.
---

# Registro -- Harmonizacao HF_KEY SSOT, Skills ICM, Rules SSOT e Motor +ROI S1

- **Ancora na raiz multiprojeto:** commit 934982f em origin/main (compilador SSOT em 
ucleo/rules_ssot/ via scripts/ops/sync_rules_ssot.py, modularizacao CLAUDE.md -> docs/CLAUDE_ANEXO_INVENTARIO.md, MCP icm-skills-router, memoria/HERMES.md).
- **Credenciais SSOT:** eliminada duplicata HF_KEY (sha8=7916c7d3) em HKCU/HKLM, mantendo HF_CREDENTIALS e HF_TOKEN distintos, fonte unica data/credential_registry.json e alias em memoria em utils/env_loader.py (	ests/test_credential_registry_ssot.py).
- **Skills Library ICM & Cookbooks:** estrutura de 5 camadas MECE em skills_library/ (25 skills locais + 3 harness, 7 dominios, 7 cookbooks YAML), roteador core/skill_router.py, hook fail-open scripts/ops/hook_icm_skill_injector.py, MCP engine/skills_mcp_server.py e calibracao 	ests/test_skills_library_icm.py.
- **Modularizacao & Rules sob Demanda:** .agents/rules/{coding-and-metacog,decision-roi-framework}.md, enxugamento de CLAUDE.md (26.613 B < 46.000 B) com historico preservado em docs/governanca/CLAUDE_ANEXO_PLUGINS_E_HISTORICO.md, arquivamento da copia rontend/src/app/GEMINI.md em .claude/.ARQUIVE/frontend-src-app-GEMINI-legacy-20261122.md e limpeza de 4 .d.ts vendorizados duplicados em .agents/skills/types/.
- **Motor +ROI + Laya S1 / gemini-decision-1:** core/decision_roi_engine.py, rota POST /api/v1/decisions/roi em pi/v1/handlers.py e pi/v1/server.py, tool icm_evaluate_roi_decision e suíte 	ests/test_decision_roi_engine.py.
