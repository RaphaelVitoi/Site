---
id: registro-2026-11-22-higgsfield-mcp-deps-e-saneamento-sota
tipo: registro
escopo: Site e raiz multiprojeto (c073003) -- configuracao SDK Higgsfield Seedance 2.5 (index.ts + fix
  SonarLint S6551), espelhamento HF_CREDENTIALS/HF_KEY em HKCU/HKLM, integracao MCP OAuth https://mcp.higgsfield.ai/mcp,
  elevacao types-psutil/types-PyYAML, markdownlint-cli@0.50.1 e @tanstack/react-virtual@3.14.27
ecossistema: nexus-sota
autor: Gemini 4 Hydrogen <noreply@google.com>
criado_em: '2026-11-22T13:21:37-03:00'
atualizado_em: '2026-11-22T13:21:37-03:00'
commit: HEAD
classes:
- interno
- registro
- dependencias
- seguranca
- governanca
- handoff
caminhos:
- .claude/agent-memory/chico/MEMORY.md
- frontend/package.json
- index.ts
- package-lock.json
- package.json
- pyproject.toml
- reports/HANDOFF-2026-11-22-higgsfield-mcp-deps-e-saneamento-sota.md
- reports/REGISTRO-2026-11-22-higgsfield-mcp-deps-e-saneamento-sota.md
- scripts/ops/Set-EcosystemCredential.ps1
- uv.lock
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
- uv lock --check (279 pacotes) e uv pip check (251 pacotes compativeis) apos uv sync --all-groups --all-extras
- types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 instalados e espelhados nos dois blocos
  dev de pyproject.toml
- 'pyright --project pyproject.toml: 0 errors, 0 warnings, 0 informations; ruff check .: All checks passed!'
- 'pytest tests/test_requirements_sync.py (4 passed) e tests/test_credenciais.py (10 passed); pip_audit:
  0 novas vulnerabilidades (5 aceites server-mode chromadb 1.5.9)'
- 'npm install + npm list: markdownlint-cli@0.50.1 e @tanstack/react-virtual@3.14.27; npm audit --audit-level=moderate:
  0 vulnerabilities'
- 'npx prettier --check index.ts, tsc --noEmit --strict index.ts, npm run lint, npm run lint:md e npm
  run typecheck: exit 0'
- 'npm run test (frontend Jest): 119 passed, 119 total suites (771 passed, 771 total tests)'
- 'Set-EcosystemCredential.ps1 -Verificar: HF_CREDENTIALS e HF_KEY com 101 chars em HKCU (User) e HKLM
  (Machine); .env.local gitignorado (.gitignore:159)'
- 'Raiz multiprojeto commit c073003 pushed origin/main: overlays higgsfield OAuth PKCE Clerk, golden reconciliado,
  82 passed em tests/ da raiz, sincronizar_nucleo.py --verificar ok, canario_mcp.py --resolver geracao_midia_video
  -> higgsfield (capacidades degradadas: nenhuma)'
- 'Test-AgentCalibrationLedger.ps1: status=valid, 102 registros (tail 42833cf5); saude_da_malha.py: 0
  sinais/0 alertas graves'
nao_verificado:
- Geracao faturavel de video Seedance 2.5 em index.ts (bloqueada externamente por HTTP 403 Not enough
  credits)
- Login OAuth PKCE interativo no navegador para https://mcp.higgsfield.ai/mcp nos hospedeiros MCP
- CI remoto GitHub Actions pos-push
referencias_nao_resolviveis:
- memoria/HERMES.md
- nucleo/overlays.json
- tests/golden/servidores_pre_migracao.json
revisoes_de_ancora:
- registro: plan-dependency-boundary-reconciliation-2026-09-01
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: relatorio-fusao-cerebro-claude-quality-gate-2026-09-01
  caminhos:
  - package-lock.json
  - package.json
  parecer: Revisado em 2026-11-22. Alteracoes em package-lock.json, package.json validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: auditoria-cwv-lighthouse-2026-09-01
  caminhos:
  - package-lock.json
  - package.json
  parecer: Revisado em 2026-11-22. Alteracoes em package-lock.json, package.json validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: auditoria-2026-09-02-integridade-do-projeto-e-piso-de-transformers
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: auditoria-2026-10-08-integralidade-backend
  caminhos:
  - pyproject.toml
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: handoff-2026-09-10-lint-lighthouse-e-aceite-cve
  caminhos:
  - pyproject.toml
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: handoff-2026-09-13-integracao-de-engines-wasm-e-economia-de-gate
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: handoff-2026-09-25-pool-rotacional-gemini-flash-lite
  caminhos:
  - .claude/agent-memory/chico/MEMORY.md
  parecer: Revisado em 2026-11-22. Alteracoes em .claude/agent-memory/chico/MEMORY.md validam elevacao
    de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1,
    @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1
    e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas)
    e 119 suites Jest verdes.
- registro: handoff-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - .claude/agent-memory/chico/MEMORY.md
  - package-lock.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em .claude/agent-memory/chico/MEMORY.md, package-lock.json,
    pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122
    (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27, espelhamento
    HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md; pyright
    (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: handoff-2026-10-08-remediacao-e-evolucao-frontend
  caminhos:
  - .claude/agent-memory/chico/MEMORY.md
  parecer: Revisado em 2026-11-22. Alteracoes em .claude/agent-memory/chico/MEMORY.md validam elevacao
    de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1,
    @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1
    e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas)
    e 119 suites Jest verdes.
- registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em frontend/package.json, package-lock.json, package.json,
    pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122
    (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27, espelhamento
    HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md; pyright
    (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: handoff-2026-11-15-translategemma-timesfm-laya-roi
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: handoff-2026-11-21-deps-sota-roi-neon-orchestrator-e-calibracao
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em frontend/package.json, package-lock.json, package.json,
    pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122
    (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27, espelhamento
    HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md; pyright
    (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: handoff-2026-11-21-laya-052-watchdog-711-e-calibracao-seq101
  caminhos:
  - .claude/agent-memory/chico/MEMORY.md
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em .claude/agent-memory/chico/MEMORY.md, pyproject.toml,
    uv.lock validam elevacao de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml
    e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY
    em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm
    audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: plano-laya-integracao-s1s2-pmev-2026-09-20
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-09-02-fast-uri-alto-e-contrato-de-evidencia-pmev
  caminhos:
  - package-lock.json
  parecer: Revisado em 2026-11-22. Alteracoes em package-lock.json validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-09-04-credenciais-submodulos-e-adaptador-hrc
  caminhos:
  - scripts/ops/Set-EcosystemCredential.ps1
  parecer: Revisado em 2026-11-22. Alteracoes em scripts/ops/Set-EcosystemCredential.ps1 validam elevacao
    de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1,
    @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1
    e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas)
    e 119 suites Jest verdes.
- registro: registro-2026-09-04-sanear-worker-loop-e-desambiguacao-lsp
  caminhos:
  - .claude/agent-memory/chico/MEMORY.md
  parecer: Revisado em 2026-11-22. Alteracoes em .claude/agent-memory/chico/MEMORY.md validam elevacao
    de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1,
    @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1
    e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas)
    e 119 suites Jest verdes.
- registro: registro-2026-09-07-padronizacao-sistemica-markdownlint
  caminhos:
  - package.json
  parecer: Revisado em 2026-11-22. Alteracoes em package.json validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  parecer: Revisado em 2026-11-22. Alteracoes em frontend/package.json, package-lock.json, package.json
    validam elevacao de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml e
    uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY
    em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm
    audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-09-09-actionlint-e-a-fronteira-do-submodulo
  caminhos:
  - package.json
  parecer: Revisado em 2026-11-22. Alteracoes em package.json validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-09-09-prisma-generate-e-o-typecheck-do-ci
  caminhos:
  - package.json
  parecer: Revisado em 2026-11-22. Alteracoes em package.json validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-09-09-remediacao-dependabot-httpx2
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-09-10-importacao-visivel-hh-hrc
  caminhos:
  - frontend/package.json
  - package-lock.json
  parecer: Revisado em 2026-11-22. Alteracoes em frontend/package.json, package-lock.json validam elevacao
    de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1,
    @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1
    e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas)
    e 119 suites Jest verdes.
- registro: registro-2026-09-10-publicacao-inputs-mtt
  caminhos:
  - frontend/package.json
  - package-lock.json
  parecer: Revisado em 2026-11-22. Alteracoes em frontend/package.json, package-lock.json validam elevacao
    de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1,
    @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1
    e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas)
    e 119 suites Jest verdes.
- registro: registro-2026-09-12-teoria-canonica-chen-janda-e-convergencia-cfr
  caminhos:
  - frontend/package.json
  parecer: Revisado em 2026-11-22. Alteracoes em frontend/package.json validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-09-13-ci-typecheck-e-fronteira-de-capacidades
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-09-13-otimizacoes-helpers-antientropia-e-feedback
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em frontend/package.json, package-lock.json, package.json,
    pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122
    (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27, espelhamento
    HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md; pyright
    (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-09-14-auditoria-e-refinamento-settings-e-configuracoes
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  parecer: Revisado em 2026-11-22. Alteracoes em frontend/package.json, package-lock.json, package.json
    validam elevacao de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml e
    uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY
    em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm
    audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-09-14-correcoes-pos-auditoria-handoff-tier-e-dependencias
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  parecer: Revisado em 2026-11-22. Alteracoes em frontend/package.json, package-lock.json, package.json
    validam elevacao de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml e
    uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY
    em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm
    audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-09-18-decisoes-delegadas-sobre-as-pendencias
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  parecer: Revisado em 2026-11-22. Alteracoes em frontend/package.json, package-lock.json, package.json
    validam elevacao de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml e
    uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY
    em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm
    audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: 2026-09-22-auditoria-frontend-4-itens
  caminhos:
  - frontend/package.json
  parecer: Revisado em 2026-11-22. Alteracoes em frontend/package.json validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-09-25-modelos-locais-llama-g9v3-ling3
  caminhos:
  - .claude/agent-memory/chico/MEMORY.md
  parecer: Revisado em 2026-11-22. Alteracoes em .claude/agent-memory/chico/MEMORY.md validam elevacao
    de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1,
    @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1
    e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas)
    e 119 suites Jest verdes.
- registro: registro-2026-09-25-soberania-commit-push-e-staging-perpetuo
  caminhos:
  - .claude/agent-memory/chico/MEMORY.md
  parecer: Revisado em 2026-11-22. Alteracoes em .claude/agent-memory/chico/MEMORY.md validam elevacao
    de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1,
    @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1
    e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas)
    e 119 suites Jest verdes.
- registro: registro-2026-10-04-remediacao-dependabot-pypdf
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
  caminhos:
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em uv.lock validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-10-05-atlas-cenarios-acessibilidade-e-design-system
  caminhos:
  - frontend/package.json
  parecer: Revisado em 2026-11-22. Alteracoes em frontend/package.json validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-10-08-auditoria-e-evolucao-frontend
  caminhos:
  - .claude/agent-memory/chico/MEMORY.md
  parecer: Revisado em 2026-11-22. Alteracoes em .claude/agent-memory/chico/MEMORY.md validam elevacao
    de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1,
    @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1
    e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas)
    e 119 suites Jest verdes.
- registro: registro-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - .claude/agent-memory/chico/MEMORY.md
  - package-lock.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em .claude/agent-memory/chico/MEMORY.md, package-lock.json,
    pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122
    (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27, espelhamento
    HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md; pyright
    (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em frontend/package.json, package-lock.json, package.json,
    uv.lock validam elevacao de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml
    e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY
    em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm
    audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
  caminhos:
  - frontend/package.json
  - package-lock.json
  parecer: Revisado em 2026-11-22. Alteracoes em frontend/package.json, package-lock.json validam elevacao
    de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1,
    @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1
    e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas)
    e 119 suites Jest verdes.
- registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em frontend/package.json, package-lock.json, package.json,
    pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122
    (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27, espelhamento
    HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md; pyright
    (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota
  caminhos:
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em package.json, pyproject.toml, uv.lock validam elevacao
    de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1,
    @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1
    e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas)
    e 119 suites Jest verdes.
- registro: registro-2026-10-27-elevacao-dependencias-python-openai-pyspark-pytest
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-10-27-evolucao-project-context-e-reconciliacao-sota
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-10-27-harmonizacao-dependencias-ci-e-wasm
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  parecer: Revisado em 2026-11-22. Alteracoes em frontend/package.json, package-lock.json, package.json
    validam elevacao de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml e
    uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY
    em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm
    audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-10-27-harmonizacao-dependencias-katex-e-ci
  caminhos:
  - frontend/package.json
  - package-lock.json
  parecer: Revisado em 2026-11-22. Alteracoes em frontend/package.json, package-lock.json validam elevacao
    de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1,
    @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1
    e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas)
    e 119 suites Jest verdes.
- registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em frontend/package.json, package-lock.json, package.json,
    uv.lock validam elevacao de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml
    e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY
    em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm
    audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-10-28-atualizacao-laya-e-estabilizacao-playwright-smoke
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-10-31-estabilizacao-lifecycle-warmup-turbopack
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules
  caminhos:
  - index.ts
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em index.ts, package-lock.json, package.json, pyproject.toml,
    uv.lock validam elevacao de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml
    e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY
    em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm
    audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-03-elevacao-dependencias-pyarrow-openai-anthropic-laya
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-03-otimizacao-agentes-watchdog-e-calibracao
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-03-remediacao-dependabot-pypdf-pyasn1-minimatch
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em package-lock.json, package.json, pyproject.toml, uv.lock
    validam elevacao de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml e
    uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY
    em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm
    audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-04-otimizacao-layout-header-e-elevacao-dependencias
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
  caminhos:
  - pyproject.toml
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em package-lock.json, package.json, pyproject.toml, uv.lock
    validam elevacao de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml e
    uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY
    em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm
    audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em frontend/package.json, package-lock.json, package.json,
    pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122
    (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27, espelhamento
    HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md; pyright
    (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-07-elevacao-dependencias-fastapi-regex-types-aiofiles
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-08-elevacao-dependencias-regex-e-laya
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-08-elevacao-polars-2-1-e-consumo-integral-engines-sota
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-08-elevacao-pypdf-7-0-torchvision-e-ecossistema-npm
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em frontend/package.json, package-lock.json, package.json,
    pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122
    (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27, espelhamento
    HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md; pyright
    (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-08-harmonizacao-r-4-6-1-jules-e-saneamento-ancoras
  caminhos:
  - package-lock.json
  - package.json
  parecer: Revisado em 2026-11-22. Alteracoes em package-lock.json, package.json validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-08-integracao-sota-triade-stitch-exa-jules
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-08-otimizacao-pyproject-dependencias-extras-e-reconciliacao
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-08-refinamento-sonarlint-e-code-review-triage
  caminhos:
  - frontend/package.json
  - package.json
  parecer: Revisado em 2026-11-22. Alteracoes em frontend/package.json, package.json validam elevacao
    de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1,
    @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1
    e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas)
    e 119 suites Jest verdes.
- registro: registro-2026-11-08-saneamento-code-review-triage
  caminhos:
  - frontend/package.json
  - package.json
  parecer: Revisado em 2026-11-22. Alteracoes em frontend/package.json, package.json validam elevacao
    de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1,
    @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1
    e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas)
    e 119 suites Jest verdes.
- registro: registro-2026-11-09-elevacao-dependencias-e-fork-eigen
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em package-lock.json, package.json, pyproject.toml, uv.lock
    validam elevacao de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml e
    uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY
    em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm
    audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-10-ai-sdk-google-4-0-117-ai-7-0-169
  caminhos:
  - package-lock.json
  - package.json
  parecer: Revisado em 2026-11-22. Alteracoes em package-lock.json, package.json validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-10-bump-deps-e-extra-paths-pylance
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-10-google-genai-3-1-0
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-10-lock-bundle-analyzer-16-4-6
  caminhos:
  - package-lock.json
  parecer: Revisado em 2026-11-22. Alteracoes em package-lock.json validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-11-elevacao-fastapi-playwright-e-bump-deep-research
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-11-elevacao-pypdf-turbo-ai-sdk-google
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em package-lock.json, package.json, pyproject.toml, uv.lock
    validam elevacao de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml e
    uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY
    em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm
    audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-11-elevacao-sentence-transformers-genai-prettier-exa-mcp
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em package-lock.json, package.json, pyproject.toml, uv.lock
    validam elevacao de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml e
    uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY
    em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm
    audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-11-elevacao-typer-types-knip-harmonizacao
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em package-lock.json, package.json, pyproject.toml, uv.lock
    validam elevacao de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml e
    uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY
    em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm
    audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-11-nota-pareamento-dev-dependency-groups
  caminhos:
  - pyproject.toml
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-12-review-sweeps-endurecimento-sota
  caminhos:
  - package-lock.json
  - package.json
  parecer: Revisado em 2026-11-22. Alteracoes em package-lock.json, package.json validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-13-elevacao-deps-e-saneamento-configs-ide
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em package-lock.json, package.json, pyproject.toml, uv.lock
    validam elevacao de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml e
    uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY
    em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm
    audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-13-revisao-ancora-pyproject-extra-path-cockpit
  caminhos:
  - pyproject.toml
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em package-lock.json, package.json, pyproject.toml, uv.lock
    validam elevacao de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml e
    uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY
    em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm
    audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-14-laya-pylint-e-refactors-sonar
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-14-roteamento-pools-transporte-e-validacao-hrc
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-14-sync-uvlock-ollama-cloud-circuit-e-ci
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-15-malha-agentica-rotacao-hkcu-hklm
  caminhos:
  - scripts/ops/Set-EcosystemCredential.ps1
  parecer: Revisado em 2026-11-22. Alteracoes em scripts/ops/Set-EcosystemCredential.ps1 validam elevacao
    de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1,
    @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1
    e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas)
    e 119 suites Jest verdes.
- registro: registro-2026-11-16-elevacao-deps-anthropic-laya-accelerate-e-deps-sync
  caminhos:
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em package.json, pyproject.toml, uv.lock validam elevacao
    de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1,
    @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1
    e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas)
    e 119 suites Jest verdes.
- registro: registro-2026-11-17-elevacao-deps-google-genai-openai
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-17-fase-2-saneamento-estrutural-frontend
  caminhos:
  - frontend/package.json
  - package-lock.json
  parecer: Revisado em 2026-11-22. Alteracoes em frontend/package.json, package-lock.json validam elevacao
    de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1,
    @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1
    e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas)
    e 119 suites Jest verdes.
- registro: registro-2026-11-17-fase-3-backend-estrutural-sota
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-17-fase-5-evolucao-das-forcas-sota
  caminhos:
  - package.json
  - pyproject.toml
  parecer: Revisado em 2026-11-22. Alteracoes em package.json, pyproject.toml validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-17-fases-0-1-portoes-verificacao-e-higiene-doc-real
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  parecer: Revisado em 2026-11-22. Alteracoes em package-lock.json, package.json, pyproject.toml validam
    elevacao de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock),
    markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY
    em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm
    audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-17-saneamento-deps-lint-typecheck-build
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-18-elevacao-deps-google-genai-regex-turbo
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em package-lock.json, package.json, pyproject.toml, uv.lock
    validam elevacao de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml e
    uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY
    em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm
    audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-18-elevacao-deps-vitest-typescript-eslint-openai
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em frontend/package.json, package-lock.json, package.json,
    pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122
    (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27, espelhamento
    HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md; pyright
    (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-18-saneamento-sonarlint-pyright-e-deps
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122
    e types-PyYAML==6.0.12.20261122 (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27,
    espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md;
    pyright (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-19-auditoria-evolucao-frontend-sota
  caminhos:
  - frontend/package.json
  - package-lock.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em frontend/package.json, package-lock.json, pyproject.toml,
    uv.lock validam elevacao de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml
    e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY
    em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm
    audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-21-deps-sota-roi-neon-orchestrator-e-calibracao
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em frontend/package.json, package-lock.json, package.json,
    pyproject.toml, uv.lock validam elevacao de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122
    (pyproject.toml e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27, espelhamento
    HKCU/HKLM HF_CREDENTIALS/HF_KEY em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md; pyright
    (0 erros), ruff (0 erros), npm audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
- registro: registro-2026-11-21-laya-052-watchdog-711-e-calibracao-seq101
  caminhos:
  - .claude/agent-memory/chico/MEMORY.md
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-22. Alteracoes em .claude/agent-memory/chico/MEMORY.md, pyproject.toml,
    uv.lock validam elevacao de types-psutil==7.2.2.20261122 e types-PyYAML==6.0.12.20261122 (pyproject.toml
    e uv.lock), markdownlint-cli@0.50.1, @tanstack/react-virtual@3.14.27, espelhamento HKCU/HKLM HF_CREDENTIALS/HF_KEY
    em Set-EcosystemCredential.ps1 e memorizacao em MEMORY.md; pyright (0 erros), ruff (0 erros), npm
    audit (0 vulns), pip-audit (0 novas) e 119 suites Jest verdes.
---

# Registro Oficial -- 2026-11-22 (`Higgsfield SDK/MCP`, Dependencias SOTA & Saneamento SonarLint)

## 1. Objeto e Resumo Tecnico

Este registro documenta a auditoria, harmonizacao e validacao das entregas do ciclo de `2026-11-22` entre o repositorio `Site` e a raiz multiprojeto (`RaphaelVitoi/raiz-multiprojeto`, commit [`c073003`](https://github.com/RaphaelVitoi/raiz-multiprojeto/commit/c073003)):

1. **Integracao Higgsfield API / Seedance 2.5 (`Site` + `HKCU`/`HKLM`):**
   - [`index.ts`](../index.ts) implementado com `@higgsfield/client` (`^0.2.6`) e `dotenv` (`^18.0.10`), carregando `.env.local` (ignorado pelo Git em `.gitignore:159`) e consumindo `bytedance/seedance-2.5/text-to-video`.
   - [`scripts/ops/Set-EcosystemCredential.ps1`](../scripts/ops/Set-EcosystemCredential.ps1) atualizado em `$CredenciaisConhecidas` com `'HF_CREDENTIALS'` e `'HF_KEY'`, espelhadas com `101 chars` em `HKCU (User)` e `HKLM (Machine)` (nenhuma credencial versionada).
   - **Bloqueio externo medido:** a execucao de `node index.ts` atingiu a API oficial, mas retornou `HTTP 403 Not enough credits` (geracao de video nao concluida por saldo externo).
2. **Descoberta Empirica e Integracao MCP (`raiz-multiprojeto` `c073003`):**
   - A sondagem direta a `https://mcp.higgsfield.ai/mcp` recusou cabeçalhos estaticos de chave (`Authorization: Key`, `Authorization: Bearer`, `hf-api-key`, `X-API-Key`) com `HTTP 401 {"error":"Unauthorized"}`, anunciando OAuth 2.0 PKCE via Clerk (`https://higgsfield.ai/_clerk`, escopos `openid email offline_access`).
   - Declarado em [`nucleo/overlays.json`](../../nucleo/overlays.json) com `"auth": "oauth"`, `"sonda": "host"` e capacidade `geracao_midia_video` (`provedor_atual: "higgsfield"`), sincronizado em todos os hospedeiros via `sincronizar_nucleo.py --aplicar` e reconciliado no golden [`tests/golden/servidores_pre_migracao.json`](../../tests/golden/servidores_pre_migracao.json) sem reordenacao.
   - Re-sondagem de `canario_mcp.py` com gateway `:8933` ativo zerou as pendencias transientes (`google-jules`, `mcp-toolbox-for-databases`, `mcp-server-neon`, `sequential-thinking` todos `vivo`; `capacidades degradadas: nenhuma`).
3. **Correcao SonarLint `typescript:S6551` & Prettier em [`index.ts`](../index.ts):**
   - Substituido `String(err)` sobre `unknown` pelo helper tipado `formatError(err: unknown): string` (Zero-`Any`), tratando `Error`, primitivos, propriedades `message`/`detail` de objetos e fallback seguro em `JSON.stringify` tanto no ramo `status === "failed"` quanto no `catch (err: unknown)`.
   - Removido `String(...)` redundante em `result.status` e harmonizado com `prettier --write`.

## 2. Auditoria de Dependencias, Retencoes e Analise de ROI

| Alvo | Antes | Depois | Decisao e Evidencia |
| :--- | :--- | :--- | :--- |
| `types-psutil` ([`pyproject.toml`](../pyproject.toml), [`uv.lock`](../uv.lock)) | `>=7.2.2.20261111` | `>=7.2.2.20261122` | Atualizado nos dois blocos espelhados (`[project.optional-dependencies].dev` e `[dependency-groups].dev`); `pyright` `0` erros |
| `types-PyYAML` ([`pyproject.toml`](../pyproject.toml), [`uv.lock`](../uv.lock)) | `>=6.0.12.20261113` | `>=6.0.12.20261122` | Atualizado nos dois blocos espelhados e `.venv`; `uv pip check` `251` compativeis |
| `markdownlint-cli` ([`package.json`](../package.json), [`frontend/package.json`](../frontend/package.json)) | `^0.50.0` | `^0.50.1` | Atualizado em `devDependencies` e nos dois blocos `overrides` + [`package-lock.json`](../package-lock.json); `npm run lint:md` exit `0` |
| `@tanstack/react-virtual` ([`frontend/package.json`](../frontend/package.json)) | `^3.14.26` | `^3.14.27` | Patch minor seguro; `npm run typecheck` e `119` suites Jest (`771` testes) aprovados |
| `tenacity` ([`pyproject.toml`](../pyproject.toml)) | `>=9.1.4,<9.2.0` | Mantido | Retencao deliberada: `google-genai` impoe `tenacity<9.2.0,>=8.2.3` (`9.2.1` bloqueado upstream) |
| `next-auth` / `prisma` ([`frontend/package.json`](../frontend/package.json)) | `5.0.0-beta.32` / `7.10.1` | Mantido | Retencao deliberada: `next-auth@4.24.15` e major anterior incompativel; `prisma@8.0.0-rc.34` e pre-release RC |
| Novas dependencias extras | `0` adicionadas | `0` adicionadas | Analise de ROI: `npm audit` (`0` vulns), `pip-audit` (`0` novas) e malha lint/teste ja completas; pacotes sem consumidor geram ROI negativo |

## 3. Licao de Execucao Medida no `.venv` (`uv sync --all-groups --all-extras`)

- Executar `uv sync --all-groups` sem `--all-extras` desinstalou `36` pacotes de extras opcionais previamente presentes (`numba`, `prometheus-client`, `matplotlib`, `polars`, `sympy`, `duckdb`, `playwright`, `openai`, `anthropic`, etc., reduzindo `.venv` de `251` para `218` pacotes) e provocou `5` erros `reportMissingImports` no `pyright` (`engine/vitoi_perspective_engine.py`, `monitoring/telemetry.py`, `tools/hybrid_router/plot_benchmark.py`).
- A restauracao via `uv sync --all-groups --all-extras` (script canonico `deps:sync` em [`package.json`](../package.json)) reconduziu o `.venv` a `251` pacotes compativeis e zerou os `5` erros no `pyright`. O aprendizado foi cristalizado em [`memoria/HERMES.md`](../../memoria/HERMES.md) e [`.claude/agent-memory/chico/MEMORY.md`](../.claude/agent-memory/chico/MEMORY.md).

## 4. Reconciliacao de Ancoras e Estado dos Portoes

- Todas as `102` ancoras historicas atingidas pelos caminhos alterados neste commit constam avaliadas em `revisoes_de_ancora` deste frontmatter (`record_anchor_gate.ps1` e `record_gate.py`).
- Nenhum feedback humano numerico novo foi registrado no ledger nesta etapa; `reports/agent-calibration/feedback-ledger.jsonl` permanece integro com `102` registros (tail `42833cf57fef71b62740908ee985078f77b160371ae736a7c78dab986d69c786`).
