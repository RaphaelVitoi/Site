---
id: registro-2026-11-27-harmonizacao-ide-rust-deps-submodulos
tipo: registro
escopo: Site -- correcao rust-analyzer/tasks, harmonizacao SSOT da IDE, bumps Python/Node/submodulos e
  arquivo de calibracao 2026-11-26
ecossistema: nexus-sota
autor: Antigravity <noreply@google.com>
criado_em: '2026-11-27T06:56:00-03:00'
atualizado_em: '2026-11-27T06:56:00-03:00'
commit: HEAD
classes:
- interno
- registro
- dependencias
- saneamento
- ide
caminhos:
- .vscode/settings.json
- .vscode/tasks.json
- Site.code-workspace
- frontend/package.json
- package-lock.json
- pyproject.toml
- reports/REGISTRO-2026-11-27-harmonizacao-ide-rust-deps-submodulos.md
- reports/agent-calibration/daily/2026-11-26.json
- requirements.txt
- skills/exa-mcp-server
- skills/gemini-cli-jules
- skills/gemini-cli-security
- skills/gemini-deep-research
- tests/test_sota_deps_roi_2026_11.py
- tests/test_vscode_editor_config.py
- uv.lock
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  python: 3.14.9
  so: Windows
  condutor: Antigravity
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: '2026-11-27'
verificado:
- 'Rust crates canonicos (wasm-equity e core/nexus-core-rust): cargo check e cargo clippy --all-targets
  aprovados (exit 0); diretorio orfao em simulator/panels/target removido'
- 'Python (Site): uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0; ruff check
  OK, pyright 0 erros/0 warnings, pip_audit 0 vulnerabilidades novas (4 PYSEC chromadb aceitas)'
- 'Testes Python direcionados (test_vscode_editor_config.py, test_sota_deps_roi_2026_11.py, test_skill_pmev_knowledge.py):
  38 passed, 0 erros, 0 warnings'
- 'Frontend (Site): eslint-config-prettier 10.1.9 no root package-lock.json; npm run lint OK, npm run
  typecheck OK, Jest 119/119 suites (771/771 testes) OK, npm audit --audit-level=high = 0 vulnerabilities'
- 'Submodulos skills/* enviados aos forks RaphaelVitoi/*: exa-mcp-server (b003571, 158/158 testes, 0 CVEs),
  gemini-deep-research (5b0a23c, 47/47 testes, 0 CVEs), gemini-cli-jules (c135bd2, 2/2 testes, 0 CVEs)
  e gemini-cli-security (98d9e2e, 72/72 testes, 0 CVEs)'
nao_verificado:
- Execucao remota de CI GitHub Actions apos git push nos forks e em origin/master
- Feedback numerico de calibracao do Tier 0 para esta sessao
revisoes_de_ancora:
- registro: 2026-09-22-auditoria-frontend-4-itens
  caminhos:
  - frontend/package.json
  parecer: 'Revisado em 2026-11-27. frontend/package.json: elevado eslint-config-prettier para 10.1.9
    (eslint/tsc/Jest 119 suites / 771 testes verdes). Invariantes preservados e validados (cargo check/clippy,
    ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: auditoria-2026-09-02-integridade-do-projeto-e-piso-de-transformers
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; uv.lock: regerado via uv lock/sync
    resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades).
    Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint,
    tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: auditoria-2026-09-08-o-que-esta-em-aberto-na-malha
  caminhos:
  - requirements.txt
  parecer: 'Revisado em 2026-11-27. requirements.txt: sincronizados pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0
    com pyproject.toml. Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit,
    pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: auditoria-2026-09-22-paridade-config-identidade
  caminhos:
  - .vscode/settings.json
  - tests/test_vscode_editor_config.py
  parecer: 'Revisado em 2026-11-27. .vscode/settings.json: removido manifesto inexistente panels/Cargo.toml
    de rust-analyzer.linkedProjects, adicionado core/nexus-core-rust/target/** em files.watcherExclude,
    alinhado ruff.*.preview=false e removida chave contraditoria python.analysis.diagnosticsSource; tests/test_vscode_editor_config.py:
    adicionados guardrails de integridade para linkedProjects/tasks Cargo, watcherExclude, paridade SSOT
    settings/workspace (JSONC) e paridade dev-groups do pyproject.toml. Invariantes preservados e validados
    (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: auditoria-2026-10-08-integralidade-backend
  caminhos:
  - pyproject.toml
  - requirements.txt
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; requirements.txt: sincronizados
    pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml. Invariantes preservados e validados
    (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: auditoria-cwv-lighthouse-2026-09-01
  caminhos:
  - .vscode/settings.json
  - package-lock.json
  parecer: 'Revisado em 2026-11-27. .vscode/settings.json: removido manifesto inexistente panels/Cargo.toml
    de rust-analyzer.linkedProjects, adicionado core/nexus-core-rust/target/** em files.watcherExclude,
    alinhado ruff.*.preview=false e removida chave contraditoria python.analysis.diagnosticsSource; package-lock.json:
    regerado na raiz com eslint-config-prettier==10.1.9 e 0 vulnerabilidades em npm audit --audit-level=high.
    Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint,
    tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: handoff-2026-09-10-lint-lighthouse-e-aceite-cve
  caminhos:
  - pyproject.toml
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev. Invariantes preservados e validados
    (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: handoff-2026-09-13-integracao-de-engines-wasm-e-economia-de-gate
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; uv.lock: regerado via uv lock/sync
    resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades).
    Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint,
    tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: handoff-2026-09-22-paridade-config-identidade
  caminhos:
  - .vscode/settings.json
  parecer: 'Revisado em 2026-11-27. .vscode/settings.json: removido manifesto inexistente panels/Cargo.toml
    de rust-analyzer.linkedProjects, adicionado core/nexus-core-rust/target/** em files.watcherExclude,
    alinhado ruff.*.preview=false e removida chave contraditoria python.analysis.diagnosticsSource. Invariantes
    preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119
    e npm audit 0 CVEs).'
- registro: handoff-2026-09-23-ci-ram-e-rustfmt-staged
  caminhos:
  - .vscode/tasks.json
  parecer: 'Revisado em 2026-11-27. .vscode/tasks.json: removida task quebrada Rustfmt: Simulator Panel
    e adicionadas tasks simetricas Cargo Check/Clippy: Nexus Core. Invariantes preservados e validados
    (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: handoff-2026-09-23-nucleo-mcp-curadoria-codex
  caminhos:
  - .vscode/settings.json
  - Site.code-workspace
  parecer: 'Revisado em 2026-11-27. .vscode/settings.json: removido manifesto inexistente panels/Cargo.toml
    de rust-analyzer.linkedProjects, adicionado core/nexus-core-rust/target/** em files.watcherExclude,
    alinhado ruff.*.preview=false e removida chave contraditoria python.analysis.diagnosticsSource; Site.code-workspace:
    enxugado para preferencias exclusivas de workspace sem sobreposicao de chaves com .vscode/settings.json
    (eliminados 14 conflitos e legado antigravity.model). Invariantes preservados e validados (cargo check/clippy,
    ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: handoff-2026-09-23-sincronia-editor-calibracao-e-gate
  caminhos:
  - .vscode/settings.json
  parecer: 'Revisado em 2026-11-27. .vscode/settings.json: removido manifesto inexistente panels/Cargo.toml
    de rust-analyzer.linkedProjects, adicionado core/nexus-core-rust/target/** em files.watcherExclude,
    alinhado ruff.*.preview=false e removida chave contraditoria python.analysis.diagnosticsSource. Invariantes
    preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119
    e npm audit 0 CVEs).'
- registro: handoff-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-27. package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high; pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0
    e schemathesis>=4.34.3 em paridade entre optional-dependencies.dev e dependency-groups.dev; requirements.txt:
    sincronizados pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml; uv.lock: regerado
    via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas
    vulnerabilidades). Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit,
    pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
  caminhos:
  - frontend/package.json
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-27. frontend/package.json: elevado eslint-config-prettier para 10.1.9
    (eslint/tsc/Jest 119 suites / 771 testes verdes); package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high; pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0
    e schemathesis>=4.34.3 em paridade entre optional-dependencies.dev e dependency-groups.dev; requirements.txt:
    sincronizados pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml; uv.lock: regerado
    via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas
    vulnerabilidades). Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit,
    pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: handoff-2026-11-08-otimizacao-backend-e-integridade-sota
  caminhos:
  - skills/gemini-deep-research
  parecer: 'Revisado em 2026-11-27. skills/gemini-deep-research: submodulo avancado para 5b0a23c no fork
    RaphaelVitoi/gemini-cli-deep-research (eslint-config-prettier ^10.1.9; 47/47 testes, 0 CVEs). Invariantes
    preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119
    e npm audit 0 CVEs).'
- registro: handoff-2026-11-10-boot-persistente-mesh-mcp-e-cockpit
  caminhos:
  - .vscode/settings.json
  parecer: 'Revisado em 2026-11-27. .vscode/settings.json: removido manifesto inexistente panels/Cargo.toml
    de rust-analyzer.linkedProjects, adicionado core/nexus-core-rust/target/** em files.watcherExclude,
    alinhado ruff.*.preview=false e removida chave contraditoria python.analysis.diagnosticsSource. Invariantes
    preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119
    e npm audit 0 CVEs).'
- registro: handoff-2026-11-14-decision1-laya-s1-s2-e-ancoras
  caminhos:
  - .vscode/settings.json
  parecer: 'Revisado em 2026-11-27. .vscode/settings.json: removido manifesto inexistente panels/Cargo.toml
    de rust-analyzer.linkedProjects, adicionado core/nexus-core-rust/target/** em files.watcherExclude,
    alinhado ruff.*.preview=false e removida chave contraditoria python.analysis.diagnosticsSource. Invariantes
    preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119
    e npm audit 0 CVEs).'
- registro: handoff-2026-11-15-translategemma-timesfm-laya-roi
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; uv.lock: regerado via uv lock/sync
    resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades).
    Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint,
    tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: handoff-2026-11-21-deps-sota-roi-neon-orchestrator-e-calibracao
  caminhos:
  - frontend/package.json
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - tests/test_sota_deps_roi_2026_11.py
  - uv.lock
  parecer: 'Revisado em 2026-11-27. frontend/package.json: elevado eslint-config-prettier para 10.1.9
    (eslint/tsc/Jest 119 suites / 771 testes verdes); package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high; pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0
    e schemathesis>=4.34.3 em paridade entre optional-dependencies.dev e dependency-groups.dev; requirements.txt:
    sincronizados pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml; tests/test_sota_deps_roi_2026_11.py:
    adicionado teste de piso de versao e import para pypdf>=7.2.0, schemathesis>=4.34.3 e httpx>=0.29.0;
    uv.lock: regerado via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit
    sem novas vulnerabilidades). Invariantes preservados e validados (cargo check/clippy, ruff, pyright,
    pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: handoff-2026-11-21-laya-052-watchdog-711-e-calibracao-seq101
  caminhos:
  - pyproject.toml
  - requirements.txt
  - tests/test_sota_deps_roi_2026_11.py
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; requirements.txt: sincronizados
    pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml; tests/test_sota_deps_roi_2026_11.py:
    adicionado teste de piso de versao e import para pypdf>=7.2.0, schemathesis>=4.34.3 e httpx>=0.29.0;
    uv.lock: regerado via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit
    sem novas vulnerabilidades). Invariantes preservados e validados (cargo check/clippy, ruff, pyright,
    pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: handoff-2026-11-22-higgsfield-mcp-deps-e-saneamento-sota
  caminhos:
  - frontend/package.json
  - package-lock.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-27. frontend/package.json: elevado eslint-config-prettier para 10.1.9
    (eslint/tsc/Jest 119 suites / 771 testes verdes); package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high; pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0
    e schemathesis>=4.34.3 em paridade entre optional-dependencies.dev e dependency-groups.dev; uv.lock:
    regerado via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit
    sem novas vulnerabilidades). Invariantes preservados e validados (cargo check/clippy, ruff, pyright,
    pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: handoff-2026-11-24-laya-053-regex-20261123-schemathesis-4341
  caminhos:
  - pyproject.toml
  - requirements.txt
  - tests/test_sota_deps_roi_2026_11.py
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; requirements.txt: sincronizados
    pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml; tests/test_sota_deps_roi_2026_11.py:
    adicionado teste de piso de versao e import para pypdf>=7.2.0, schemathesis>=4.34.3 e httpx>=0.29.0;
    uv.lock: regerado via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit
    sem novas vulnerabilidades). Invariantes preservados e validados (cargo check/clippy, ruff, pyright,
    pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: handoff-2026-11-26-arquitetura-gemini4-llamacpp-a2ui-antigravity-2351
  caminhos:
  - .vscode/settings.json
  - Site.code-workspace
  parecer: 'Revisado em 2026-11-27. .vscode/settings.json: removido manifesto inexistente panels/Cargo.toml
    de rust-analyzer.linkedProjects, adicionado core/nexus-core-rust/target/** em files.watcherExclude,
    alinhado ruff.*.preview=false e removida chave contraditoria python.analysis.diagnosticsSource; Site.code-workspace:
    enxugado para preferencias exclusivas de workspace sem sobreposicao de chaves com .vscode/settings.json
    (eliminados 14 conflitos e legado antigravity.model). Invariantes preservados e validados (cargo check/clippy,
    ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: handoff-2026-11-26-dependencias-sota-mcp-runtime-e-saneamento
  caminhos:
  - frontend/package.json
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - tests/test_sota_deps_roi_2026_11.py
  - uv.lock
  parecer: 'Revisado em 2026-11-27. frontend/package.json: elevado eslint-config-prettier para 10.1.9
    (eslint/tsc/Jest 119 suites / 771 testes verdes); package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high; pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0
    e schemathesis>=4.34.3 em paridade entre optional-dependencies.dev e dependency-groups.dev; requirements.txt:
    sincronizados pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml; tests/test_sota_deps_roi_2026_11.py:
    adicionado teste de piso de versao e import para pypdf>=7.2.0, schemathesis>=4.34.3 e httpx>=0.29.0;
    uv.lock: regerado via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit
    sem novas vulnerabilidades). Invariantes preservados e validados (cargo check/clippy, ruff, pyright,
    pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: plan-dependency-boundary-reconciliation-2026-09-01
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; requirements.txt: sincronizados
    pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml; uv.lock: regerado via uv lock/sync
    resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades).
    Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint,
    tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: plano-frentes-abertas-2026-09-08
  caminhos:
  - requirements.txt
  parecer: 'Revisado em 2026-11-27. requirements.txt: sincronizados pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0
    com pyproject.toml. Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit,
    pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: plano-laya-integracao-s1s2-pmev-2026-09-20
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; uv.lock: regerado via uv lock/sync
    resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades).
    Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint,
    tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-09-02-fast-uri-alto-e-contrato-de-evidencia-pmev
  caminhos:
  - package-lock.json
  parecer: 'Revisado em 2026-11-27. package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high. Invariantes preservados e validados (cargo check/clippy,
    ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-09-04-otimizacao-settings-seguranca-e-io
  caminhos:
  - .vscode/settings.json
  - Site.code-workspace
  parecer: 'Revisado em 2026-11-27. .vscode/settings.json: removido manifesto inexistente panels/Cargo.toml
    de rust-analyzer.linkedProjects, adicionado core/nexus-core-rust/target/** em files.watcherExclude,
    alinhado ruff.*.preview=false e removida chave contraditoria python.analysis.diagnosticsSource; Site.code-workspace:
    enxugado para preferencias exclusivas de workspace sem sobreposicao de chaves com .vscode/settings.json
    (eliminados 14 conflitos e legado antigravity.model). Invariantes preservados e validados (cargo check/clippy,
    ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-09-07-padronizacao-sistemica-markdownlint
  caminhos:
  - .vscode/settings.json
  parecer: 'Revisado em 2026-11-27. .vscode/settings.json: removido manifesto inexistente panels/Cargo.toml
    de rust-analyzer.linkedProjects, adicionado core/nexus-core-rust/target/** em files.watcherExclude,
    alinhado ruff.*.preview=false e removida chave contraditoria python.analysis.diagnosticsSource. Invariantes
    preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119
    e npm audit 0 CVEs).'
- registro: registro-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem
  caminhos:
  - frontend/package.json
  - package-lock.json
  parecer: 'Revisado em 2026-11-27. frontend/package.json: elevado eslint-config-prettier para 10.1.9
    (eslint/tsc/Jest 119 suites / 771 testes verdes); package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high. Invariantes preservados e validados (cargo check/clippy,
    ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-09-09-configuracoes-ide-e-calibracao-diaria
  caminhos:
  - .vscode/settings.json
  parecer: 'Revisado em 2026-11-27. .vscode/settings.json: removido manifesto inexistente panels/Cargo.toml
    de rust-analyzer.linkedProjects, adicionado core/nexus-core-rust/target/** em files.watcherExclude,
    alinhado ruff.*.preview=false e removida chave contraditoria python.analysis.diagnosticsSource. Invariantes
    preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119
    e npm audit 0 CVEs).'
- registro: registro-2026-09-09-remediacao-dependabot-httpx2
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; uv.lock: regerado via uv lock/sync
    resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades).
    Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint,
    tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-09-10-importacao-visivel-hh-hrc
  caminhos:
  - frontend/package.json
  - package-lock.json
  parecer: 'Revisado em 2026-11-27. frontend/package.json: elevado eslint-config-prettier para 10.1.9
    (eslint/tsc/Jest 119 suites / 771 testes verdes); package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high. Invariantes preservados e validados (cargo check/clippy,
    ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-09-10-publicacao-inputs-mtt
  caminhos:
  - frontend/package.json
  - package-lock.json
  parecer: 'Revisado em 2026-11-27. frontend/package.json: elevado eslint-config-prettier para 10.1.9
    (eslint/tsc/Jest 119 suites / 771 testes verdes); package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high. Invariantes preservados e validados (cargo check/clippy,
    ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-09-11-teoria-sota-e-saneamento-multimodal
  caminhos:
  - .vscode/settings.json
  parecer: 'Revisado em 2026-11-27. .vscode/settings.json: removido manifesto inexistente panels/Cargo.toml
    de rust-analyzer.linkedProjects, adicionado core/nexus-core-rust/target/** em files.watcherExclude,
    alinhado ruff.*.preview=false e removida chave contraditoria python.analysis.diagnosticsSource. Invariantes
    preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119
    e npm audit 0 CVEs).'
- registro: registro-2026-09-12-a-autoria-dos-forks-corrigida-antes-do-primeiro-pr
  caminhos:
  - skills/gemini-cli-jules
  parecer: 'Revisado em 2026-11-27. skills/gemini-cli-jules: submodulo avancado para c135bd2 no fork RaphaelVitoi/jules
    (@types/node ^26.6.11; build e 2/2 testes OK, 0 CVEs). Invariantes preservados e validados (cargo
    check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-09-12-saneamento-linter-e-reconciliacao-de-ancoras
  caminhos:
  - .vscode/settings.json
  - Site.code-workspace
  parecer: 'Revisado em 2026-11-27. .vscode/settings.json: removido manifesto inexistente panels/Cargo.toml
    de rust-analyzer.linkedProjects, adicionado core/nexus-core-rust/target/** em files.watcherExclude,
    alinhado ruff.*.preview=false e removida chave contraditoria python.analysis.diagnosticsSource; Site.code-workspace:
    enxugado para preferencias exclusivas de workspace sem sobreposicao de chaves com .vscode/settings.json
    (eliminados 14 conflitos e legado antigravity.model). Invariantes preservados e validados (cargo check/clippy,
    ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-09-12-teoria-canonica-chen-janda-e-convergencia-cfr
  caminhos:
  - frontend/package.json
  parecer: 'Revisado em 2026-11-27. frontend/package.json: elevado eslint-config-prettier para 10.1.9
    (eslint/tsc/Jest 119 suites / 771 testes verdes). Invariantes preservados e validados (cargo check/clippy,
    ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-09-13-ci-typecheck-e-fronteira-de-capacidades
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; uv.lock: regerado via uv lock/sync
    resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades).
    Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint,
    tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-09-13-otimizacoes-helpers-antientropia-e-feedback
  caminhos:
  - frontend/package.json
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-27. frontend/package.json: elevado eslint-config-prettier para 10.1.9
    (eslint/tsc/Jest 119 suites / 771 testes verdes); package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high; pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0
    e schemathesis>=4.34.3 em paridade entre optional-dependencies.dev e dependency-groups.dev; requirements.txt:
    sincronizados pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml; uv.lock: regerado
    via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas
    vulnerabilidades). Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit,
    pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-09-14-auditoria-e-refinamento-settings-e-configuracoes
  caminhos:
  - .vscode/settings.json
  - Site.code-workspace
  - frontend/package.json
  - package-lock.json
  - requirements.txt
  parecer: 'Revisado em 2026-11-27. .vscode/settings.json: removido manifesto inexistente panels/Cargo.toml
    de rust-analyzer.linkedProjects, adicionado core/nexus-core-rust/target/** em files.watcherExclude,
    alinhado ruff.*.preview=false e removida chave contraditoria python.analysis.diagnosticsSource; Site.code-workspace:
    enxugado para preferencias exclusivas de workspace sem sobreposicao de chaves com .vscode/settings.json
    (eliminados 14 conflitos e legado antigravity.model); frontend/package.json: elevado eslint-config-prettier
    para 10.1.9 (eslint/tsc/Jest 119 suites / 771 testes verdes); package-lock.json: regerado na raiz
    com eslint-config-prettier==10.1.9 e 0 vulnerabilidades em npm audit --audit-level=high; requirements.txt:
    sincronizados pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml. Invariantes preservados
    e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm
    audit 0 CVEs).'
- registro: registro-2026-09-14-correcoes-pos-auditoria-handoff-tier-e-dependencias
  caminhos:
  - frontend/package.json
  - package-lock.json
  parecer: 'Revisado em 2026-11-27. frontend/package.json: elevado eslint-config-prettier para 10.1.9
    (eslint/tsc/Jest 119 suites / 771 testes verdes); package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high. Invariantes preservados e validados (cargo check/clippy,
    ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-09-14-saneamento-linter-e-tipagem-tests-e-skills
  caminhos:
  - .vscode/settings.json
  parecer: 'Revisado em 2026-11-27. .vscode/settings.json: removido manifesto inexistente panels/Cargo.toml
    de rust-analyzer.linkedProjects, adicionado core/nexus-core-rust/target/** em files.watcherExclude,
    alinhado ruff.*.preview=false e removida chave contraditoria python.analysis.diagnosticsSource. Invariantes
    preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119
    e npm audit 0 CVEs).'
- registro: registro-2026-09-18-decisoes-delegadas-sobre-as-pendencias
  caminhos:
  - frontend/package.json
  - package-lock.json
  parecer: 'Revisado em 2026-11-27. frontend/package.json: elevado eslint-config-prettier para 10.1.9
    (eslint/tsc/Jest 119 suites / 771 testes verdes); package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high. Invariantes preservados e validados (cargo check/clippy,
    ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-10-04-remediacao-dependabot-pypdf
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; uv.lock: regerado via uv lock/sync
    resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades).
    Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint,
    tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
  caminhos:
  - uv.lock
  parecer: 'Revisado em 2026-11-27. uv.lock: regerado via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3
    e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades). Invariantes preservados e validados (cargo
    check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-10-05-atlas-cenarios-acessibilidade-e-design-system
  caminhos:
  - frontend/package.json
  parecer: 'Revisado em 2026-11-27. frontend/package.json: elevado eslint-config-prettier para 10.1.9
    (eslint/tsc/Jest 119 suites / 771 testes verdes). Invariantes preservados e validados (cargo check/clippy,
    ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-27. package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high; pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0
    e schemathesis>=4.34.3 em paridade entre optional-dependencies.dev e dependency-groups.dev; requirements.txt:
    sincronizados pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml; uv.lock: regerado
    via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas
    vulnerabilidades). Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit,
    pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
  caminhos:
  - frontend/package.json
  - package-lock.json
  - uv.lock
  parecer: 'Revisado em 2026-11-27. frontend/package.json: elevado eslint-config-prettier para 10.1.9
    (eslint/tsc/Jest 119 suites / 771 testes verdes); package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high; uv.lock: regerado via uv lock/sync resolvendo
    pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades). Invariantes
    preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119
    e npm audit 0 CVEs).'
- registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
  caminhos:
  - .vscode/settings.json
  - Site.code-workspace
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-27. .vscode/settings.json: removido manifesto inexistente panels/Cargo.toml
    de rust-analyzer.linkedProjects, adicionado core/nexus-core-rust/target/** em files.watcherExclude,
    alinhado ruff.*.preview=false e removida chave contraditoria python.analysis.diagnosticsSource; Site.code-workspace:
    enxugado para preferencias exclusivas de workspace sem sobreposicao de chaves com .vscode/settings.json
    (eliminados 14 conflitos e legado antigravity.model); pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0
    e schemathesis>=4.34.3 em paridade entre optional-dependencies.dev e dependency-groups.dev; uv.lock:
    regerado via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit
    sem novas vulnerabilidades). Invariantes preservados e validados (cargo check/clippy, ruff, pyright,
    pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; requirements.txt: sincronizados
    pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml; uv.lock: regerado via uv lock/sync
    resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades).
    Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint,
    tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-10-18-resolucao-sonarqube-e-saneamento-global
  caminhos:
  - .vscode/settings.json
  parecer: 'Revisado em 2026-11-27. .vscode/settings.json: removido manifesto inexistente panels/Cargo.toml
    de rust-analyzer.linkedProjects, adicionado core/nexus-core-rust/target/** em files.watcherExclude,
    alinhado ruff.*.preview=false e removida chave contraditoria python.analysis.diagnosticsSource. Invariantes
    preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119
    e npm audit 0 CVEs).'
- registro: registro-2026-10-19-saneamento-linters-markdown-e-conformidade-tipagem
  caminhos:
  - .vscode/settings.json
  parecer: 'Revisado em 2026-11-27. .vscode/settings.json: removido manifesto inexistente panels/Cargo.toml
    de rust-analyzer.linkedProjects, adicionado core/nexus-core-rust/target/** em files.watcherExclude,
    alinhado ruff.*.preview=false e removida chave contraditoria python.analysis.diagnosticsSource. Invariantes
    preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119
    e npm audit 0 CVEs).'
- registro: registro-2026-10-19-saneamento-warnings-skills-e-memoria-agentica
  caminhos:
  - .vscode/settings.json
  - skills/exa-mcp-server
  - skills/gemini-deep-research
  parecer: 'Revisado em 2026-11-27. .vscode/settings.json: removido manifesto inexistente panels/Cargo.toml
    de rust-analyzer.linkedProjects, adicionado core/nexus-core-rust/target/** em files.watcherExclude,
    alinhado ruff.*.preview=false e removida chave contraditoria python.analysis.diagnosticsSource; skills/exa-mcp-server:
    submodulo avancado para b003571 no fork RaphaelVitoi/exa-mcp-server (@upstash/ratelimit ^2.2.3; 158/158
    testes, 0 CVEs); skills/gemini-deep-research: submodulo avancado para 5b0a23c no fork RaphaelVitoi/gemini-cli-deep-research
    (eslint-config-prettier ^10.1.9; 47/47 testes, 0 CVEs). Invariantes preservados e validados (cargo
    check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-10-20-saneamento-quality-gate-ascii-e-reconciliacao-de-ancoras
  caminhos:
  - .vscode/settings.json
  parecer: 'Revisado em 2026-11-27. .vscode/settings.json: removido manifesto inexistente panels/Cargo.toml
    de rust-analyzer.linkedProjects, adicionado core/nexus-core-rust/target/** em files.watcherExclude,
    alinhado ruff.*.preview=false e removida chave contraditoria python.analysis.diagnosticsSource. Invariantes
    preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119
    e npm audit 0 CVEs).'
- registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
  caminhos:
  - .vscode/settings.json
  - frontend/package.json
  - package-lock.json
  parecer: 'Revisado em 2026-11-27. .vscode/settings.json: removido manifesto inexistente panels/Cargo.toml
    de rust-analyzer.linkedProjects, adicionado core/nexus-core-rust/target/** em files.watcherExclude,
    alinhado ruff.*.preview=false e removida chave contraditoria python.analysis.diagnosticsSource; frontend/package.json:
    elevado eslint-config-prettier para 10.1.9 (eslint/tsc/Jest 119 suites / 771 testes verdes); package-lock.json:
    regerado na raiz com eslint-config-prettier==10.1.9 e 0 vulnerabilidades em npm audit --audit-level=high.
    Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint,
    tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
  caminhos:
  - frontend/package.json
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-27. frontend/package.json: elevado eslint-config-prettier para 10.1.9
    (eslint/tsc/Jest 119 suites / 771 testes verdes); package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high; pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0
    e schemathesis>=4.34.3 em paridade entre optional-dependencies.dev e dependency-groups.dev; requirements.txt:
    sincronizados pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml; uv.lock: regerado
    via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas
    vulnerabilidades). Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit,
    pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; requirements.txt: sincronizados
    pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml; uv.lock: regerado via uv lock/sync
    resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades).
    Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint,
    tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-10-27-elevacao-dependencias-python-openai-pyspark-pytest
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; uv.lock: regerado via uv lock/sync
    resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades).
    Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint,
    tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-10-27-evolucao-project-context-e-reconciliacao-sota
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; uv.lock: regerado via uv lock/sync
    resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades).
    Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint,
    tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-10-27-harmonizacao-dependencias-ci-e-wasm
  caminhos:
  - frontend/package.json
  - package-lock.json
  parecer: 'Revisado em 2026-11-27. frontend/package.json: elevado eslint-config-prettier para 10.1.9
    (eslint/tsc/Jest 119 suites / 771 testes verdes); package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high. Invariantes preservados e validados (cargo check/clippy,
    ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-10-27-harmonizacao-dependencias-katex-e-ci
  caminhos:
  - frontend/package.json
  - package-lock.json
  parecer: 'Revisado em 2026-11-27. frontend/package.json: elevado eslint-config-prettier para 10.1.9
    (eslint/tsc/Jest 119 suites / 771 testes verdes); package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high. Invariantes preservados e validados (cargo check/clippy,
    ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
  caminhos:
  - frontend/package.json
  - package-lock.json
  - skills/gemini-cli-security
  - uv.lock
  parecer: 'Revisado em 2026-11-27. frontend/package.json: elevado eslint-config-prettier para 10.1.9
    (eslint/tsc/Jest 119 suites / 771 testes verdes); package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high; skills/gemini-cli-security: submodulo avancado
    para 98d9e2e no fork RaphaelVitoi/security (@types/node ^26.6.11; typecheck e 72/72 testes OK, 0 CVEs);
    uv.lock: regerado via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit
    sem novas vulnerabilidades). Invariantes preservados e validados (cargo check/clippy, ruff, pyright,
    pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-10-28-atualizacao-laya-e-estabilizacao-playwright-smoke
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; uv.lock: regerado via uv lock/sync
    resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades).
    Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint,
    tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-10-28-homologacao-pr103-jules-e-selagem-montecarlo
  caminhos:
  - skills/gemini-cli-security
  parecer: 'Revisado em 2026-11-27. skills/gemini-cli-security: submodulo avancado para 98d9e2e no fork
    RaphaelVitoi/security (@types/node ^26.6.11; typecheck e 72/72 testes OK, 0 CVEs). Invariantes preservados
    e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm
    audit 0 CVEs).'
- registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
  caminhos:
  - .vscode/settings.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-27. .vscode/settings.json: removido manifesto inexistente panels/Cargo.toml
    de rust-analyzer.linkedProjects, adicionado core/nexus-core-rust/target/** em files.watcherExclude,
    alinhado ruff.*.preview=false e removida chave contraditoria python.analysis.diagnosticsSource; pyproject.toml:
    elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3 em paridade entre optional-dependencies.dev
    e dependency-groups.dev; requirements.txt: sincronizados pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0
    com pyproject.toml; uv.lock: regerado via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3
    e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades). Invariantes preservados e validados (cargo
    check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-10-31-estabilizacao-lifecycle-warmup-turbopack
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; requirements.txt: sincronizados
    pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml; uv.lock: regerado via uv lock/sync
    resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades).
    Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint,
    tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-10-31-refatoracao-cfr-tipagem-e-higiene
  caminhos:
  - .vscode/settings.json
  parecer: 'Revisado em 2026-11-27. .vscode/settings.json: removido manifesto inexistente panels/Cargo.toml
    de rust-analyzer.linkedProjects, adicionado core/nexus-core-rust/target/** em files.watcherExclude,
    alinhado ruff.*.preview=false e removida chave contraditoria python.analysis.diagnosticsSource. Invariantes
    preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119
    e npm audit 0 CVEs).'
- registro: registro-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules
  caminhos:
  - package-lock.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-27. package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high; pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0
    e schemathesis>=4.34.3 em paridade entre optional-dependencies.dev e dependency-groups.dev; uv.lock:
    regerado via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit
    sem novas vulnerabilidades). Invariantes preservados e validados (cargo check/clippy, ruff, pyright,
    pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-03-elevacao-dependencias-pyarrow-openai-anthropic-laya
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; uv.lock: regerado via uv lock/sync
    resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades).
    Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint,
    tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-03-otimizacao-agentes-watchdog-e-calibracao
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; uv.lock: regerado via uv lock/sync
    resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades).
    Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint,
    tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-03-remediacao-dependabot-pypdf-pyasn1-minimatch
  caminhos:
  - package-lock.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-27. package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high; pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0
    e schemathesis>=4.34.3 em paridade entre optional-dependencies.dev e dependency-groups.dev; uv.lock:
    regerado via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit
    sem novas vulnerabilidades). Invariantes preservados e validados (cargo check/clippy, ruff, pyright,
    pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-04-otimizacao-layout-header-e-elevacao-dependencias
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; uv.lock: regerado via uv lock/sync
    resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades).
    Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint,
    tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
  caminhos:
  - .vscode/settings.json
  - pyproject.toml
  parecer: 'Revisado em 2026-11-27. .vscode/settings.json: removido manifesto inexistente panels/Cargo.toml
    de rust-analyzer.linkedProjects, adicionado core/nexus-core-rust/target/** em files.watcherExclude,
    alinhado ruff.*.preview=false e removida chave contraditoria python.analysis.diagnosticsSource; pyproject.toml:
    elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3 em paridade entre optional-dependencies.dev
    e dependency-groups.dev. Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit,
    pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
  caminhos:
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-27. package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high; pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0
    e schemathesis>=4.34.3 em paridade entre optional-dependencies.dev e dependency-groups.dev; requirements.txt:
    sincronizados pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml; uv.lock: regerado
    via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas
    vulnerabilidades). Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit,
    pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
  caminhos:
  - frontend/package.json
  - package-lock.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-27. frontend/package.json: elevado eslint-config-prettier para 10.1.9
    (eslint/tsc/Jest 119 suites / 771 testes verdes); package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high; pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0
    e schemathesis>=4.34.3 em paridade entre optional-dependencies.dev e dependency-groups.dev; uv.lock:
    regerado via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit
    sem novas vulnerabilidades). Invariantes preservados e validados (cargo check/clippy, ruff, pyright,
    pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
  caminhos:
  - .vscode/settings.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-27. .vscode/settings.json: removido manifesto inexistente panels/Cargo.toml
    de rust-analyzer.linkedProjects, adicionado core/nexus-core-rust/target/** em files.watcherExclude,
    alinhado ruff.*.preview=false e removida chave contraditoria python.analysis.diagnosticsSource; pyproject.toml:
    elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3 em paridade entre optional-dependencies.dev
    e dependency-groups.dev; uv.lock: regerado via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3
    e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades). Invariantes preservados e validados (cargo
    check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-07-elevacao-dependencias-fastapi-regex-types-aiofiles
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; uv.lock: regerado via uv lock/sync
    resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades).
    Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint,
    tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-08-elevacao-dependencias-regex-e-laya
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; requirements.txt: sincronizados
    pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml; uv.lock: regerado via uv lock/sync
    resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades).
    Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint,
    tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-08-elevacao-polars-2-1-e-consumo-integral-engines-sota
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; requirements.txt: sincronizados
    pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml; uv.lock: regerado via uv lock/sync
    resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades).
    Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint,
    tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-08-elevacao-pypdf-7-0-torchvision-e-ecossistema-npm
  caminhos:
  - frontend/package.json
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-27. frontend/package.json: elevado eslint-config-prettier para 10.1.9
    (eslint/tsc/Jest 119 suites / 771 testes verdes); package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high; pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0
    e schemathesis>=4.34.3 em paridade entre optional-dependencies.dev e dependency-groups.dev; requirements.txt:
    sincronizados pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml; uv.lock: regerado
    via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas
    vulnerabilidades). Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit,
    pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-08-harmonizacao-r-4-6-1-jules-e-saneamento-ancoras
  caminhos:
  - package-lock.json
  parecer: 'Revisado em 2026-11-27. package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high. Invariantes preservados e validados (cargo check/clippy,
    ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-08-integracao-sota-suite-antigravity-sdk-cli-acp
  caminhos:
  - .vscode/settings.json
  parecer: 'Revisado em 2026-11-27. .vscode/settings.json: removido manifesto inexistente panels/Cargo.toml
    de rust-analyzer.linkedProjects, adicionado core/nexus-core-rust/target/** em files.watcherExclude,
    alinhado ruff.*.preview=false e removida chave contraditoria python.analysis.diagnosticsSource. Invariantes
    preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119
    e npm audit 0 CVEs).'
- registro: registro-2026-11-08-integracao-sota-triade-stitch-exa-jules
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; requirements.txt: sincronizados
    pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml; uv.lock: regerado via uv lock/sync
    resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades).
    Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint,
    tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-08-otimizacao-backend-sonarlint-pyright-e-headings
  caminhos:
  - skills/gemini-deep-research
  parecer: 'Revisado em 2026-11-27. skills/gemini-deep-research: submodulo avancado para 5b0a23c no fork
    RaphaelVitoi/gemini-cli-deep-research (eslint-config-prettier ^10.1.9; 47/47 testes, 0 CVEs). Invariantes
    preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119
    e npm audit 0 CVEs).'
- registro: registro-2026-11-08-otimizacao-pyproject-dependencias-extras-e-reconciliacao
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; uv.lock: regerado via uv lock/sync
    resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades).
    Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint,
    tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-08-refinamento-sonarlint-e-code-review-triage
  caminhos:
  - frontend/package.json
  parecer: 'Revisado em 2026-11-27. frontend/package.json: elevado eslint-config-prettier para 10.1.9
    (eslint/tsc/Jest 119 suites / 771 testes verdes). Invariantes preservados e validados (cargo check/clippy,
    ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-08-saneamento-code-review-triage
  caminhos:
  - frontend/package.json
  parecer: 'Revisado em 2026-11-27. frontend/package.json: elevado eslint-config-prettier para 10.1.9
    (eslint/tsc/Jest 119 suites / 771 testes verdes). Invariantes preservados e validados (cargo check/clippy,
    ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-09-elevacao-dependencias-e-fork-eigen
  caminhos:
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-27. package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high; pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0
    e schemathesis>=4.34.3 em paridade entre optional-dependencies.dev e dependency-groups.dev; requirements.txt:
    sincronizados pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml; uv.lock: regerado
    via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas
    vulnerabilidades). Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit,
    pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-09-saneamento-sonarlint-e-mcp-skills-vulnerabilidades
  caminhos:
  - skills/exa-mcp-server
  - skills/gemini-cli-jules
  - skills/gemini-cli-security
  parecer: 'Revisado em 2026-11-27. skills/exa-mcp-server: submodulo avancado para b003571 no fork RaphaelVitoi/exa-mcp-server
    (@upstash/ratelimit ^2.2.3; 158/158 testes, 0 CVEs); skills/gemini-cli-jules: submodulo avancado para
    c135bd2 no fork RaphaelVitoi/jules (@types/node ^26.6.11; build e 2/2 testes OK, 0 CVEs); skills/gemini-cli-security:
    submodulo avancado para 98d9e2e no fork RaphaelVitoi/security (@types/node ^26.6.11; typecheck e 72/72
    testes OK, 0 CVEs). Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit,
    pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-10-ai-sdk-google-4-0-117-ai-7-0-169
  caminhos:
  - package-lock.json
  parecer: 'Revisado em 2026-11-27. package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high. Invariantes preservados e validados (cargo check/clippy,
    ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-10-bump-deps-e-extra-paths-pylance
  caminhos:
  - .vscode/settings.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-27. .vscode/settings.json: removido manifesto inexistente panels/Cargo.toml
    de rust-analyzer.linkedProjects, adicionado core/nexus-core-rust/target/** em files.watcherExclude,
    alinhado ruff.*.preview=false e removida chave contraditoria python.analysis.diagnosticsSource; pyproject.toml:
    elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3 em paridade entre optional-dependencies.dev
    e dependency-groups.dev; uv.lock: regerado via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3
    e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades). Invariantes preservados e validados (cargo
    check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-10-eslint-workingdirectories-cwd-schema
  caminhos:
  - Site.code-workspace
  parecer: 'Revisado em 2026-11-27. Site.code-workspace: enxugado para preferencias exclusivas de workspace
    sem sobreposicao de chaves com .vscode/settings.json (eliminados 14 conflitos e legado antigravity.model).
    Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint,
    tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-10-google-genai-3-1-0
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; uv.lock: regerado via uv lock/sync
    resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades).
    Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint,
    tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-10-lock-bundle-analyzer-16-4-6
  caminhos:
  - package-lock.json
  parecer: 'Revisado em 2026-11-27. package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high. Invariantes preservados e validados (cargo check/clippy,
    ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-11-bump-deps-submodulos-skills
  caminhos:
  - skills/gemini-cli-security
  - skills/gemini-deep-research
  parecer: 'Revisado em 2026-11-27. skills/gemini-cli-security: submodulo avancado para 98d9e2e no fork
    RaphaelVitoi/security (@types/node ^26.6.11; typecheck e 72/72 testes OK, 0 CVEs); skills/gemini-deep-research:
    submodulo avancado para 5b0a23c no fork RaphaelVitoi/gemini-cli-deep-research (eslint-config-prettier
    ^10.1.9; 47/47 testes, 0 CVEs). Invariantes preservados e validados (cargo check/clippy, ruff, pyright,
    pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-11-elevacao-fastapi-playwright-e-bump-deep-research
  caminhos:
  - pyproject.toml
  - skills/gemini-deep-research
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; skills/gemini-deep-research:
    submodulo avancado para 5b0a23c no fork RaphaelVitoi/gemini-cli-deep-research (eslint-config-prettier
    ^10.1.9; 47/47 testes, 0 CVEs); uv.lock: regerado via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3
    e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades). Invariantes preservados e validados (cargo
    check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-11-elevacao-pypdf-turbo-ai-sdk-google
  caminhos:
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-27. package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high; pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0
    e schemathesis>=4.34.3 em paridade entre optional-dependencies.dev e dependency-groups.dev; requirements.txt:
    sincronizados pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml; uv.lock: regerado
    via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas
    vulnerabilidades). Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit,
    pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-11-elevacao-sentence-transformers-genai-prettier-exa-mcp
  caminhos:
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - skills/exa-mcp-server
  - uv.lock
  parecer: 'Revisado em 2026-11-27. package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high; pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0
    e schemathesis>=4.34.3 em paridade entre optional-dependencies.dev e dependency-groups.dev; requirements.txt:
    sincronizados pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml; skills/exa-mcp-server:
    submodulo avancado para b003571 no fork RaphaelVitoi/exa-mcp-server (@upstash/ratelimit ^2.2.3; 158/158
    testes, 0 CVEs); uv.lock: regerado via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3
    e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades). Invariantes preservados e validados (cargo
    check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-11-elevacao-typer-types-knip-harmonizacao
  caminhos:
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-27. package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high; pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0
    e schemathesis>=4.34.3 em paridade entre optional-dependencies.dev e dependency-groups.dev; requirements.txt:
    sincronizados pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml; uv.lock: regerado
    via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas
    vulnerabilidades). Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit,
    pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-11-hybrid-router-genai-jules-zod4
  caminhos:
  - skills/gemini-cli-jules
  parecer: 'Revisado em 2026-11-27. skills/gemini-cli-jules: submodulo avancado para c135bd2 no fork RaphaelVitoi/jules
    (@types/node ^26.6.11; build e 2/2 testes OK, 0 CVEs). Invariantes preservados e validados (cargo
    check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-11-nota-pareamento-dev-dependency-groups
  caminhos:
  - pyproject.toml
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev. Invariantes preservados e validados
    (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-12-review-sweeps-endurecimento-sota
  caminhos:
  - .vscode/settings.json
  - package-lock.json
  parecer: 'Revisado em 2026-11-27. .vscode/settings.json: removido manifesto inexistente panels/Cargo.toml
    de rust-analyzer.linkedProjects, adicionado core/nexus-core-rust/target/** em files.watcherExclude,
    alinhado ruff.*.preview=false e removida chave contraditoria python.analysis.diagnosticsSource; package-lock.json:
    regerado na raiz com eslint-config-prettier==10.1.9 e 0 vulnerabilidades em npm audit --audit-level=high.
    Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint,
    tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-13-elevacao-deps-e-saneamento-configs-ide
  caminhos:
  - Site.code-workspace
  - package-lock.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-27. Site.code-workspace: enxugado para preferencias exclusivas de workspace
    sem sobreposicao de chaves com .vscode/settings.json (eliminados 14 conflitos e legado antigravity.model);
    package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9 e 0 vulnerabilidades em npm
    audit --audit-level=high; pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; uv.lock: regerado via uv lock/sync
    resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades).
    Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint,
    tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-13-revisao-ancora-pyproject-extra-path-cockpit
  caminhos:
  - pyproject.toml
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev. Invariantes preservados e validados
    (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
  caminhos:
  - package-lock.json
  - pyproject.toml
  - skills/exa-mcp-server
  - skills/gemini-deep-research
  - uv.lock
  parecer: 'Revisado em 2026-11-27. package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high; pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0
    e schemathesis>=4.34.3 em paridade entre optional-dependencies.dev e dependency-groups.dev; skills/exa-mcp-server:
    submodulo avancado para b003571 no fork RaphaelVitoi/exa-mcp-server (@upstash/ratelimit ^2.2.3; 158/158
    testes, 0 CVEs); skills/gemini-deep-research: submodulo avancado para 5b0a23c no fork RaphaelVitoi/gemini-cli-deep-research
    (eslint-config-prettier ^10.1.9; 47/47 testes, 0 CVEs); uv.lock: regerado via uv lock/sync resolvendo
    pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades). Invariantes
    preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119
    e npm audit 0 CVEs).'
- registro: registro-2026-11-14-laya-pylint-e-refactors-sonar
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; uv.lock: regerado via uv lock/sync
    resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades).
    Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint,
    tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-14-roteamento-pools-transporte-e-validacao-hrc
  caminhos:
  - .vscode/settings.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-27. .vscode/settings.json: removido manifesto inexistente panels/Cargo.toml
    de rust-analyzer.linkedProjects, adicionado core/nexus-core-rust/target/** em files.watcherExclude,
    alinhado ruff.*.preview=false e removida chave contraditoria python.analysis.diagnosticsSource; pyproject.toml:
    elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3 em paridade entre optional-dependencies.dev
    e dependency-groups.dev; uv.lock: regerado via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3
    e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades). Invariantes preservados e validados (cargo
    check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-14-stitch-skills-tsconfig-e-refatoracoes-sonar
  caminhos:
  - .vscode/settings.json
  parecer: 'Revisado em 2026-11-27. .vscode/settings.json: removido manifesto inexistente panels/Cargo.toml
    de rust-analyzer.linkedProjects, adicionado core/nexus-core-rust/target/** em files.watcherExclude,
    alinhado ruff.*.preview=false e removida chave contraditoria python.analysis.diagnosticsSource. Invariantes
    preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119
    e npm audit 0 CVEs).'
- registro: registro-2026-11-14-submodulos-skills-sonar-e-gitlinks
  caminhos:
  - skills/exa-mcp-server
  - skills/gemini-cli-jules
  - skills/gemini-cli-security
  - skills/gemini-deep-research
  parecer: 'Revisado em 2026-11-27. skills/exa-mcp-server: submodulo avancado para b003571 no fork RaphaelVitoi/exa-mcp-server
    (@upstash/ratelimit ^2.2.3; 158/158 testes, 0 CVEs); skills/gemini-cli-jules: submodulo avancado para
    c135bd2 no fork RaphaelVitoi/jules (@types/node ^26.6.11; build e 2/2 testes OK, 0 CVEs); skills/gemini-cli-security:
    submodulo avancado para 98d9e2e no fork RaphaelVitoi/security (@types/node ^26.6.11; typecheck e 72/72
    testes OK, 0 CVEs); skills/gemini-deep-research: submodulo avancado para 5b0a23c no fork RaphaelVitoi/gemini-cli-deep-research
    (eslint-config-prettier ^10.1.9; 47/47 testes, 0 CVEs). Invariantes preservados e validados (cargo
    check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-14-sync-uvlock-ollama-cloud-circuit-e-ci
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; uv.lock: regerado via uv lock/sync
    resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades).
    Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint,
    tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-15-clangd-vscode-compile-commands
  caminhos:
  - .vscode/settings.json
  parecer: 'Revisado em 2026-11-27. .vscode/settings.json: removido manifesto inexistente panels/Cargo.toml
    de rust-analyzer.linkedProjects, adicionado core/nexus-core-rust/target/** em files.watcherExclude,
    alinhado ruff.*.preview=false e removida chave contraditoria python.analysis.diagnosticsSource. Invariantes
    preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119
    e npm audit 0 CVEs).'
- registro: registro-2026-11-15-start-vulkan-daemon-e-license-plaintext
  caminhos:
  - .vscode/settings.json
  parecer: 'Revisado em 2026-11-27. .vscode/settings.json: removido manifesto inexistente panels/Cargo.toml
    de rust-analyzer.linkedProjects, adicionado core/nexus-core-rust/target/** em files.watcherExclude,
    alinhado ruff.*.preview=false e removida chave contraditoria python.analysis.diagnosticsSource. Invariantes
    preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119
    e npm audit 0 CVEs).'
- registro: registro-2026-11-16-elevacao-deps-anthropic-laya-accelerate-e-deps-sync
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; requirements.txt: sincronizados
    pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml; uv.lock: regerado via uv lock/sync
    resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades).
    Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint,
    tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-17-elevacao-deps-google-genai-openai
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; requirements.txt: sincronizados
    pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml; uv.lock: regerado via uv lock/sync
    resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades).
    Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint,
    tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-17-fase-2-saneamento-estrutural-frontend
  caminhos:
  - frontend/package.json
  - package-lock.json
  parecer: 'Revisado em 2026-11-27. frontend/package.json: elevado eslint-config-prettier para 10.1.9
    (eslint/tsc/Jest 119 suites / 771 testes verdes); package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high. Invariantes preservados e validados (cargo check/clippy,
    ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-17-fase-3-backend-estrutural-sota
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; requirements.txt: sincronizados
    pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml; uv.lock: regerado via uv lock/sync
    resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades).
    Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint,
    tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-17-fase-5-evolucao-das-forcas-sota
  caminhos:
  - pyproject.toml
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev. Invariantes preservados e validados
    (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-17-fases-0-1-portoes-verificacao-e-higiene-doc-real
  caminhos:
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  parecer: 'Revisado em 2026-11-27. package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high; pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0
    e schemathesis>=4.34.3 em paridade entre optional-dependencies.dev e dependency-groups.dev; requirements.txt:
    sincronizados pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml. Invariantes preservados
    e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm
    audit 0 CVEs).'
- registro: registro-2026-11-17-saneamento-deps-lint-typecheck-build
  caminhos:
  - .vscode/settings.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-27. .vscode/settings.json: removido manifesto inexistente panels/Cargo.toml
    de rust-analyzer.linkedProjects, adicionado core/nexus-core-rust/target/** em files.watcherExclude,
    alinhado ruff.*.preview=false e removida chave contraditoria python.analysis.diagnosticsSource; pyproject.toml:
    elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3 em paridade entre optional-dependencies.dev
    e dependency-groups.dev; requirements.txt: sincronizados pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0
    com pyproject.toml; uv.lock: regerado via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3
    e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades). Invariantes preservados e validados (cargo
    check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-18-elevacao-deps-google-genai-regex-turbo
  caminhos:
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-27. package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high; pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0
    e schemathesis>=4.34.3 em paridade entre optional-dependencies.dev e dependency-groups.dev; requirements.txt:
    sincronizados pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml; uv.lock: regerado
    via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas
    vulnerabilidades). Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit,
    pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-18-elevacao-deps-vitest-typescript-eslint-openai
  caminhos:
  - frontend/package.json
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - skills/exa-mcp-server
  - uv.lock
  parecer: 'Revisado em 2026-11-27. frontend/package.json: elevado eslint-config-prettier para 10.1.9
    (eslint/tsc/Jest 119 suites / 771 testes verdes); package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high; pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0
    e schemathesis>=4.34.3 em paridade entre optional-dependencies.dev e dependency-groups.dev; requirements.txt:
    sincronizados pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml; skills/exa-mcp-server:
    submodulo avancado para b003571 no fork RaphaelVitoi/exa-mcp-server (@upstash/ratelimit ^2.2.3; 158/158
    testes, 0 CVEs); uv.lock: regerado via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3
    e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades). Invariantes preservados e validados (cargo
    check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-18-saneamento-sonarlint-pyright-e-deps
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; requirements.txt: sincronizados
    pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml; uv.lock: regerado via uv lock/sync
    resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades).
    Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint,
    tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-19-auditoria-evolucao-frontend-sota
  caminhos:
  - frontend/package.json
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-27. frontend/package.json: elevado eslint-config-prettier para 10.1.9
    (eslint/tsc/Jest 119 suites / 771 testes verdes); package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high; pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0
    e schemathesis>=4.34.3 em paridade entre optional-dependencies.dev e dependency-groups.dev; requirements.txt:
    sincronizados pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml; uv.lock: regerado
    via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas
    vulnerabilidades). Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit,
    pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-19-bump-gitlink-exa-mcp-server
  caminhos:
  - skills/exa-mcp-server
  parecer: 'Revisado em 2026-11-27. skills/exa-mcp-server: submodulo avancado para b003571 no fork RaphaelVitoi/exa-mcp-server
    (@upstash/ratelimit ^2.2.3; 158/158 testes, 0 CVEs). Invariantes preservados e validados (cargo check/clippy,
    ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-19-bump-gitlinks-submodulos-deps
  caminhos:
  - skills/exa-mcp-server
  - skills/gemini-cli-jules
  - skills/gemini-cli-security
  - skills/gemini-deep-research
  parecer: 'Revisado em 2026-11-27. skills/exa-mcp-server: submodulo avancado para b003571 no fork RaphaelVitoi/exa-mcp-server
    (@upstash/ratelimit ^2.2.3; 158/158 testes, 0 CVEs); skills/gemini-cli-jules: submodulo avancado para
    c135bd2 no fork RaphaelVitoi/jules (@types/node ^26.6.11; build e 2/2 testes OK, 0 CVEs); skills/gemini-cli-security:
    submodulo avancado para 98d9e2e no fork RaphaelVitoi/security (@types/node ^26.6.11; typecheck e 72/72
    testes OK, 0 CVEs); skills/gemini-deep-research: submodulo avancado para 5b0a23c no fork RaphaelVitoi/gemini-cli-deep-research
    (eslint-config-prettier ^10.1.9; 47/47 testes, 0 CVEs). Invariantes preservados e validados (cargo
    check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-19-fix-s6551-errorhandler-exa-mcp
  caminhos:
  - skills/exa-mcp-server
  parecer: 'Revisado em 2026-11-27. skills/exa-mcp-server: submodulo avancado para b003571 no fork RaphaelVitoi/exa-mcp-server
    (@upstash/ratelimit ^2.2.3; 158/158 testes, 0 CVEs). Invariantes preservados e validados (cargo check/clippy,
    ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-21-blindagem-ascii-e-saneamento-linters
  caminhos:
  - tests/test_sota_deps_roi_2026_11.py
  parecer: 'Revisado em 2026-11-27. tests/test_sota_deps_roi_2026_11.py: adicionado teste de piso de versao
    e import para pypdf>=7.2.0, schemathesis>=4.34.3 e httpx>=0.29.0. Invariantes preservados e validados
    (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-21-deps-sota-roi-neon-orchestrator-e-calibracao
  caminhos:
  - frontend/package.json
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - tests/test_sota_deps_roi_2026_11.py
  - uv.lock
  parecer: 'Revisado em 2026-11-27. frontend/package.json: elevado eslint-config-prettier para 10.1.9
    (eslint/tsc/Jest 119 suites / 771 testes verdes); package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high; pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0
    e schemathesis>=4.34.3 em paridade entre optional-dependencies.dev e dependency-groups.dev; requirements.txt:
    sincronizados pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml; tests/test_sota_deps_roi_2026_11.py:
    adicionado teste de piso de versao e import para pypdf>=7.2.0, schemathesis>=4.34.3 e httpx>=0.29.0;
    uv.lock: regerado via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit
    sem novas vulnerabilidades). Invariantes preservados e validados (cargo check/clippy, ruff, pyright,
    pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-21-laya-052-watchdog-711-e-calibracao-seq101
  caminhos:
  - pyproject.toml
  - requirements.txt
  - tests/test_sota_deps_roi_2026_11.py
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; requirements.txt: sincronizados
    pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml; tests/test_sota_deps_roi_2026_11.py:
    adicionado teste de piso de versao e import para pypdf>=7.2.0, schemathesis>=4.34.3 e httpx>=0.29.0;
    uv.lock: regerado via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit
    sem novas vulnerabilidades). Invariantes preservados e validados (cargo check/clippy, ruff, pyright,
    pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-22-higgsfield-mcp-deps-e-saneamento-sota
  caminhos:
  - frontend/package.json
  - package-lock.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-27. frontend/package.json: elevado eslint-config-prettier para 10.1.9
    (eslint/tsc/Jest 119 suites / 771 testes verdes); package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high; pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0
    e schemathesis>=4.34.3 em paridade entre optional-dependencies.dev e dependency-groups.dev; uv.lock:
    regerado via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit
    sem novas vulnerabilidades). Invariantes preservados e validados (cargo check/clippy, ruff, pyright,
    pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-24-laya-053-regex-20261123-schemathesis-4341
  caminhos:
  - pyproject.toml
  - requirements.txt
  - tests/test_sota_deps_roi_2026_11.py
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; requirements.txt: sincronizados
    pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml; tests/test_sota_deps_roi_2026_11.py:
    adicionado teste de piso de versao e import para pypdf>=7.2.0, schemathesis>=4.34.3 e httpx>=0.29.0;
    uv.lock: regerado via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit
    sem novas vulnerabilidades). Invariantes preservados e validados (cargo check/clippy, ruff, pyright,
    pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-24-overlay-s3776-e-deps-polars-openai-anthropic
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; uv.lock: regerado via uv lock/sync
    resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades).
    Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint,
    tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-24-scrypt-sonarlint-codeql-schemathesis-exa
  caminhos:
  - pyproject.toml
  - skills/exa-mcp-server
  - tests/test_sota_deps_roi_2026_11.py
  - uv.lock
  parecer: 'Revisado em 2026-11-27. pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0 e schemathesis>=4.34.3
    em paridade entre optional-dependencies.dev e dependency-groups.dev; skills/exa-mcp-server: submodulo
    avancado para b003571 no fork RaphaelVitoi/exa-mcp-server (@upstash/ratelimit ^2.2.3; 158/158 testes,
    0 CVEs); tests/test_sota_deps_roi_2026_11.py: adicionado teste de piso de versao e import para pypdf>=7.2.0,
    schemathesis>=4.34.3 e httpx>=0.29.0; uv.lock: regerado via uv lock/sync resolvendo pypdf==7.2.0,
    schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit sem novas vulnerabilidades). Invariantes preservados
    e validados (cargo check/clippy, ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm
    audit 0 CVEs).'
- registro: registro-2026-11-24-seguranca-github-codeql-dependabot-knip
  caminhos:
  - package-lock.json
  parecer: 'Revisado em 2026-11-27. package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high. Invariantes preservados e validados (cargo check/clippy,
    ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-25-elevacao-deps-vitest-512-e-calibracao-20261124
  caminhos:
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - skills/exa-mcp-server
  - skills/gemini-cli-jules
  - skills/gemini-cli-security
  - uv.lock
  parecer: 'Revisado em 2026-11-27. package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high; pyproject.toml: elevados httpx>=0.29.0, pypdf>=7.2.0,<8.0.0
    e schemathesis>=4.34.3 em paridade entre optional-dependencies.dev e dependency-groups.dev; requirements.txt:
    sincronizados pisos runtime httpx>=0.29.0 e pypdf>=7.2.0,<8.0.0 com pyproject.toml; skills/exa-mcp-server:
    submodulo avancado para b003571 no fork RaphaelVitoi/exa-mcp-server (@upstash/ratelimit ^2.2.3; 158/158
    testes, 0 CVEs); skills/gemini-cli-jules: submodulo avancado para c135bd2 no fork RaphaelVitoi/jules
    (@types/node ^26.6.11; build e 2/2 testes OK, 0 CVEs); skills/gemini-cli-security: submodulo avancado
    para 98d9e2e no fork RaphaelVitoi/security (@types/node ^26.6.11; typecheck e 72/72 testes OK, 0 CVEs);
    uv.lock: regerado via uv lock/sync resolvendo pypdf==7.2.0, schemathesis==4.34.3 e httpx>=0.29.0 (pip_audit
    sem novas vulnerabilidades). Invariantes preservados e validados (cargo check/clippy, ruff, pyright,
    pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: registro-2026-11-26-saneamento-submodulos-nucleo-plugins-panels-mcp-proxy
  caminhos:
  - skills/exa-mcp-server
  - skills/gemini-deep-research
  parecer: 'Revisado em 2026-11-27. skills/exa-mcp-server: submodulo avancado para b003571 no fork RaphaelVitoi/exa-mcp-server
    (@upstash/ratelimit ^2.2.3; 158/158 testes, 0 CVEs); skills/gemini-deep-research: submodulo avancado
    para 5b0a23c no fork RaphaelVitoi/gemini-cli-deep-research (eslint-config-prettier ^10.1.9; 47/47
    testes, 0 CVEs). Invariantes preservados e validados (cargo check/clippy, ruff, pyright, pip_audit,
    pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
- registro: relatorio-fusao-cerebro-claude-quality-gate-2026-09-01
  caminhos:
  - package-lock.json
  parecer: 'Revisado em 2026-11-27. package-lock.json: regerado na raiz com eslint-config-prettier==10.1.9
    e 0 vulnerabilidades em npm audit --audit-level=high. Invariantes preservados e validados (cargo check/clippy,
    ruff, pyright, pip_audit, pytest, eslint, tsc, Jest 119/119 e npm audit 0 CVEs).'
---

# Registro SOTA — Harmonizacao IDE/Rust, Bumps Python/Node/Submodulos e Calibracao 2026-11-26

## Resumo das Alteracoes

1. **Saneamento `rust-analyzer` e SSOT de IDE**:
   - Removida a referencia ao manifesto excluido em `fcaead6a` de `.vscode/settings.json` (`rust-analyzer.linkedProjects`) e `.vscode/tasks.json` (`Rustfmt: Simulator Panel`), encerrando o erro `FetchWorkspaceError` (exit code 101) e removendo o diretorio orfao `target/` em `frontend/src/components/simulator/panels/`.
   - Adicionadas tasks simetricas de `Cargo Check` e `Cargo Clippy` para `core/nexus-core-rust/Cargo.toml`, exclusao `**/core/nexus-core-rust/target/**` em `files.watcherExclude`, paridade `ruff.lint.preview`/`ruff.format.preview = false`, remocao de `python.analysis.diagnosticsSource` contraditorio e enxugamento de `Site.code-workspace` para zero chaves sobrepostas com `.vscode/settings.json`.
2. **Atualizacao de Dependencias (`Site/`)**:
   - Python: `httpx>=0.29.0`, `pypdf>=7.2.0,<8.0.0` e `schemathesis>=4.34.3` sincronizados em `pyproject.toml` (ambas as listas `dev`), `requirements.txt` e `uv.lock`.
   - Frontend: `eslint-config-prettier` elevado de `10.1.8` para `10.1.9` em `frontend/package.json` e `package-lock.json`.
3. **Guardrails Autopoieticos**:
   - Ampliados `tests/test_vscode_editor_config.py` e `tests/test_sota_deps_roi_2026_11.py` para impedir regressao em manifestos Cargo, paridade SSOT da IDE, paridade `dev` do `pyproject.toml` e pisos de versao Python.
4. **Submodulos `skills/*` (forks `RaphaelVitoi/*`)**:
   - `skills/exa-mcp-server` (`b003571`, `@upstash/ratelimit ^2.2.3`)
   - `skills/gemini-deep-research` (`5b0a23c`, `eslint-config-prettier ^10.1.9`)
   - `skills/gemini-cli-jules` (`c135bd2`, `@types/node ^26.6.11`)
   - `skills/gemini-cli-security` (`98d9e2e`, `@types/node ^26.6.11`)
5. **Calibracao Diaria**:
   - Arquivado `reports/agent-calibration/daily/2026-11-26.json` conforme gerado pela rotina diaria.
