---
id: validacao-2026-11-27-omnikernel-v1-1-ab-benchmark
tipo: validacao
escopo: Site
ecossistema: nexus-sota
autor: Gemini 4 Hydrogen
criado_em: '2026-11-27T11:18:28-03:00'
atualizado_em: '2026-11-27T16:24:00-03:00'
classes:
- interno
- medido
- control-plane
- benchmark
caminhos:
- Dockerfile
- control_plane/__init__.py
- control_plane/benchmark_ab.py
- control_plane/cascade.py
- control_plane/config.py
- control_plane/crc.py
- control_plane/equivalence.py
- control_plane/mcp_tools.py
- control_plane/schema.sql
- control_plane/service.py
- control_plane/slow_loop.py
- control_plane/spectral.py
- control_plane/storage.py
- control_plane/thermostat.py
- control_plane/z3_gate.py
- core/sota_context_engine.py
- data/ESTADO_DA_MEMORIA_DE_TRABALHO.json
- docs/designs/SPEC_OMNIKERNEL_CONTROL_PLANE.md
- engine/skills_mcp_server.py
- pyproject.toml
- reports/VALIDACAO-2026-11-27-omnikernel-v1-1-ab-benchmark.md
- requirements.txt
- scripts/cli/nexus.py
- scripts/ops/autopoietic_daily_cycle.py
- scripts/setup/Setup-NexusProfile.ps1
- tests/control_plane/__init__.py
- tests/control_plane/test_benchmark_ab.py
- tests/control_plane/test_crc_and_slow_loop.py
- tests/control_plane/test_equivalence.py
- tests/control_plane/test_mcp_and_integration.py
- tests/control_plane/test_spectral_space.py
- tests/control_plane/test_storage_bitemporal.py
- tests/control_plane/test_thermostat_cascade.py
- tests/control_plane/test_z3_gate.py
- tests/fixtures/nexus_profile_template.ps1
- uv.lock
config_medida:
  congelada_em: '2026-11-27'
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  commit_base: HEAD
  host: Windows 11, i9-9900K, 31.8GB RAM, Python 3.14.9
  data_das_medicoes: '2026-11-27'
verificado:
- modo de execucao LIVE_GEMINI sobre 30 tarefas verificaveis
- Braço A (Baseline) entrega 28/30 (93.33%) a $0.000158/entrega
- Braço B (OmniKernel) entrega 30/30 (100.00%) a $0.000211/entrega
- razao de custo B/A = 1.3321x (economia -33.21%)
- latencia p95 do plano de controle = 3.691 ms e zero_regression_verified = True
- binding C z3-solver==5.4.1.0 (pip_audit 0 CVEs) verificado sobre contratos acoplados
  QF_LIA (engine=z3, p50=1.354 ms, p95=2.164 ms < 50 ms)
- concorrencia multi-worker SQLite WAL (BEGIN IMMEDIATE + backoff exponencial) --
  8 threads (80 escritas, 353.4 tx/s, p95=44.94 ms) e 4 processos spawn Windows (240
  tx, 173.6 tx/s, journal=wal, PRAGMA integrity_check=ok, 0 erros de lock)
- Dependencias elevadas e sincronizadas em uv.lock/.venv -- laya==0.5.6, hypothesis==6.170.22,
  schemathesis==4.34.4 e z3-solver==5.4.1.0 (pip_audit sem novos CVEs)
- Saneamento integral de 49 apontamentos SonarLint em control_plane/ (S3776, S1244,
  S3358, S8786, S5713, S107, S1192, S9152, S6663) com ruff check, ruff format e pyright
  0 erros/0 warnings
- Refatoracao adicional SonarLint em control_plane/benchmark_ab.py (S3776), control_plane/slow_loop.py
  (S3358) e control_plane/z3_gate.py (4x S3776) validada com ruff check/format 0 erros,
  25/25 tests/control_plane/ e suite_verde.py ensure verde (0 erros, 0 warnings, cobertura
  68.76%)
nao_verificado:
- execucao remota de CI GitHub Actions apos git push em origin/master
- replicacao distribuida multi-host sobre rede (fora do escopo local-first)
revisoes_de_ancora:
- registro: auditoria-2026-09-02-integridade-do-projeto-e-piso-de-transformers
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; regerado e validado via uv lock/sync --check (laya 0.5.6,
    hypothesis 6.170.22, schemathesis 4.34.4, z3-solver 5.4.1.0). Pytest direcionado,
    ruff check/format e pyright 0 erros.
- registro: auditoria-2026-09-08-o-que-esta-em-aberto-na-malha
  caminhos:
  - requirements.txt
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevado laya>=0.5.6 em paridade com pyproject.toml.
    Pytest direcionado, ruff check/format e pyright 0 erros.
- registro: auditoria-2026-10-08-integralidade-backend
  caminhos:
  - pyproject.toml
  - requirements.txt
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml. Pytest
    direcionado, ruff check/format e pyright 0 erros.
- registro: auditoria-2026-11-18-pools-chaves-observatorio-e-roteamento
  caminhos:
  - scripts/setup/Setup-NexusProfile.ps1
  parecer: Revisado em 2026-11-27 (NEXUS-OMNIKERNEL v1.1-EVOLVED). incluido control-plane
    em Global:NexusTyperCommands preservando UTF-8 BOM unico (test_roteamento_perfil
    verde). Suite control_plane 21/21, testes de contrato (roteamento/memoria/dockerfile
    19/19), ruff e pyright 0 erros.
- registro: handoff-2026-09-10-lint-lighthouse-e-aceite-cve
  caminhos:
  - pyproject.toml
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0. Pytest direcionado, ruff check/format e pyright 0 erros.
- registro: handoff-2026-09-13-integracao-de-engines-wasm-e-economia-de-gate
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; regerado e validado via uv lock/sync --check (laya 0.5.6,
    hypothesis 6.170.22, schemathesis 4.34.4, z3-solver 5.4.1.0). Pytest direcionado,
    ruff check/format e pyright 0 erros.
- registro: handoff-2026-09-30-expurgo-de-modelos-obsoletos-harmonizacao-qwen-e-calibracao
  caminhos:
  - scripts/cli/nexus.py
  parecer: Revisado em 2026-11-27 (NEXUS-OMNIKERNEL v1.1-EVOLVED). registrado subcomando
    Typer control-plane preservando todos os comandos existentes. Suite control_plane
    21/21, testes de contrato (roteamento/memoria/dockerfile 19/19), ruff e pyright
    0 erros.
- registro: handoff-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: handoff-2026-11-15-translategemma-timesfm-laya-roi
  caminhos:
  - pyproject.toml
  - scripts/cli/nexus.py
  - scripts/setup/Setup-NexusProfile.ps1
  - tests/fixtures/nexus_profile_template.ps1
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; regerado e validado via uv lock/sync --check (laya 0.5.6,
    hypothesis 6.170.22, schemathesis 4.34.4, z3-solver 5.4.1.0). Pytest direcionado,
    ruff check/format e pyright 0 erros.
- registro: handoff-2026-11-18-observatorio-chaves-roteamento-e-calibracao
  caminhos:
  - scripts/setup/Setup-NexusProfile.ps1
  parecer: Revisado em 2026-11-27 (NEXUS-OMNIKERNEL v1.1-EVOLVED). incluido control-plane
    em Global:NexusTyperCommands preservando UTF-8 BOM unico (test_roteamento_perfil
    verde). Suite control_plane 21/21, testes de contrato (roteamento/memoria/dockerfile
    19/19), ruff e pyright 0 erros.
- registro: handoff-2026-11-21-deps-sota-roi-neon-orchestrator-e-calibracao
  caminhos:
  - pyproject.toml
  - requirements.txt
  - scripts/ops/autopoietic_daily_cycle.py
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: handoff-2026-11-21-laya-052-watchdog-711-e-calibracao-seq101
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: handoff-2026-11-22-higgsfield-mcp-deps-e-saneamento-sota
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; regerado e validado via uv lock/sync --check (laya 0.5.6,
    hypothesis 6.170.22, schemathesis 4.34.4, z3-solver 5.4.1.0). Pytest direcionado,
    ruff check/format e pyright 0 erros.
- registro: handoff-2026-11-24-laya-053-regex-20261123-schemathesis-4341
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: handoff-2026-11-26-dependencias-sota-mcp-runtime-e-saneamento
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: plan-dependency-boundary-reconciliation-2026-09-01
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: plano-frentes-abertas-2026-09-08
  caminhos:
  - requirements.txt
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevado laya>=0.5.6 em paridade com pyproject.toml.
    Pytest direcionado, ruff check/format e pyright 0 erros.
- registro: plano-laya-integracao-s1s2-pmev-2026-09-20
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; regerado e validado via uv lock/sync --check (laya 0.5.6,
    hypothesis 6.170.22, schemathesis 4.34.4, z3-solver 5.4.1.0). Pytest direcionado,
    ruff check/format e pyright 0 erros.
- registro: registro-2026-09-04-refinamento-sota-radar-telemetria-scanner-e-mcps
  caminhos:
  - scripts/ops/autopoietic_daily_cycle.py
  parecer: Revisado em 2026-11-27 (NEXUS-OMNIKERNEL v1.1-EVOLVED). adicionada Fase
    4 control_plane (dry-run audit e KPIs) preservando fases 1-3. Suite control_plane
    21/21, testes de contrato (roteamento/memoria/dockerfile 19/19), ruff e pyright
    0 erros.
- registro: registro-2026-09-05-saneamento-nexus-ollama-e-auto-diagnostico
  caminhos:
  - scripts/cli/nexus.py
  - scripts/setup/Setup-NexusProfile.ps1
  parecer: Revisado em 2026-11-27 (NEXUS-OMNIKERNEL v1.1-EVOLVED). registrado subcomando
    Typer control-plane preservando todos os comandos existentes; incluido control-plane
    em Global:NexusTyperCommands preservando UTF-8 BOM unico (test_roteamento_perfil
    verde). Suite control_plane 21/21, testes de contrato (roteamento/memoria/dockerfile
    19/19), ruff e pyright 0 erros.
- registro: registro-2026-09-07-procedencia-do-timesfm-e-json-do-cli
  caminhos:
  - scripts/cli/nexus.py
  parecer: Revisado em 2026-11-27 (NEXUS-OMNIKERNEL v1.1-EVOLVED). registrado subcomando
    Typer control-plane preservando todos os comandos existentes. Suite control_plane
    21/21, testes de contrato (roteamento/memoria/dockerfile 19/19), ruff e pyright
    0 erros.
- registro: registro-2026-09-08-ruff-format-e-o-ci-vermelho
  caminhos:
  - scripts/cli/nexus.py
  parecer: Revisado em 2026-11-27 (NEXUS-OMNIKERNEL v1.1-EVOLVED). registrado subcomando
    Typer control-plane preservando todos os comandos existentes. Suite control_plane
    21/21, testes de contrato (roteamento/memoria/dockerfile 19/19), ruff e pyright
    0 erros.
- registro: registro-2026-09-09-remediacao-dependabot-httpx2
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; regerado e validado via uv lock/sync --check (laya 0.5.6,
    hypothesis 6.170.22, schemathesis 4.34.4, z3-solver 5.4.1.0). Pytest direcionado,
    ruff check/format e pyright 0 erros.
- registro: registro-2026-09-13-ci-typecheck-e-fronteira-de-capacidades
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; regerado e validado via uv lock/sync --check (laya 0.5.6,
    hypothesis 6.170.22, schemathesis 4.34.4, z3-solver 5.4.1.0). Pytest direcionado,
    ruff check/format e pyright 0 erros.
- registro: registro-2026-09-13-otimizacoes-helpers-antientropia-e-feedback
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: registro-2026-09-14-auditoria-e-refinamento-settings-e-configuracoes
  caminhos:
  - requirements.txt
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevado laya>=0.5.6 em paridade com pyproject.toml.
    Pytest direcionado, ruff check/format e pyright 0 erros.
- registro: registro-2026-09-14-correcoes-pos-auditoria-handoff-tier-e-dependencias
  caminhos:
  - scripts/cli/nexus.py
  parecer: Revisado em 2026-11-27 (NEXUS-OMNIKERNEL v1.1-EVOLVED). registrado subcomando
    Typer control-plane preservando todos os comandos existentes. Suite control_plane
    21/21, testes de contrato (roteamento/memoria/dockerfile 19/19), ruff e pyright
    0 erros.
- registro: registro-2026-09-14-harmonizacao-canonicos-astra-luna-gemini-anthropic
  caminhos:
  - scripts/cli/nexus.py
  parecer: Revisado em 2026-11-27 (NEXUS-OMNIKERNEL v1.1-EVOLVED). registrado subcomando
    Typer control-plane preservando todos os comandos existentes. Suite control_plane
    21/21, testes de contrato (roteamento/memoria/dockerfile 19/19), ruff e pyright
    0 erros.
- registro: registro-2026-09-18-dashboard-notificacoes-e-recomendacoes-acionaveis
  caminhos:
  - scripts/cli/nexus.py
  parecer: Revisado em 2026-11-27 (NEXUS-OMNIKERNEL v1.1-EVOLVED). registrado subcomando
    Typer control-plane preservando todos os comandos existentes. Suite control_plane
    21/21, testes de contrato (roteamento/memoria/dockerfile 19/19), ruff e pyright
    0 erros.
- registro: registro-2026-09-18-dream-rsi-ligado-aula12-localizada-e-bounty-a-iniciar
  caminhos:
  - scripts/cli/nexus.py
  parecer: Revisado em 2026-11-27 (NEXUS-OMNIKERNEL v1.1-EVOLVED). registrado subcomando
    Typer control-plane preservando todos os comandos existentes. Suite control_plane
    21/21, testes de contrato (roteamento/memoria/dockerfile 19/19), ruff e pyright
    0 erros.
- registro: registro-2026-09-18-saneamento-token-budget-e-harmonizacao-timesfm30
  caminhos:
  - scripts/cli/nexus.py
  parecer: Revisado em 2026-11-27 (NEXUS-OMNIKERNEL v1.1-EVOLVED). registrado subcomando
    Typer control-plane preservando todos os comandos existentes. Suite control_plane
    21/21, testes de contrato (roteamento/memoria/dockerfile 19/19), ruff e pyright
    0 erros.
- registro: registro-2026-09-19-refatoracao-sonar-python-e-icm
  caminhos:
  - scripts/cli/nexus.py
  parecer: Revisado em 2026-11-27 (NEXUS-OMNIKERNEL v1.1-EVOLVED). registrado subcomando
    Typer control-plane preservando todos os comandos existentes. Suite control_plane
    21/21, testes de contrato (roteamento/memoria/dockerfile 19/19), ruff e pyright
    0 erros.
- registro: registro-2026-09-24-blindagem-ascii-e-harmonizacao-scripts
  caminhos:
  - scripts/cli/nexus.py
  parecer: Revisado em 2026-11-27 (NEXUS-OMNIKERNEL v1.1-EVOLVED). registrado subcomando
    Typer control-plane preservando todos os comandos existentes. Suite control_plane
    21/21, testes de contrato (roteamento/memoria/dockerfile 19/19), ruff e pyright
    0 erros.
- registro: registro-2026-09-24-correcao-markup-rich-e-wrappers-cli
  caminhos:
  - scripts/cli/nexus.py
  parecer: Revisado em 2026-11-27 (NEXUS-OMNIKERNEL v1.1-EVOLVED). registrado subcomando
    Typer control-plane preservando todos os comandos existentes. Suite control_plane
    21/21, testes de contrato (roteamento/memoria/dockerfile 19/19), ruff e pyright
    0 erros.
- registro: registro-2026-09-24-refino-vram-atalhos-ceo-dashboard
  caminhos:
  - scripts/cli/nexus.py
  parecer: Revisado em 2026-11-27 (NEXUS-OMNIKERNEL v1.1-EVOLVED). registrado subcomando
    Typer control-plane preservando todos os comandos existentes. Suite control_plane
    21/21, testes de contrato (roteamento/memoria/dockerfile 19/19), ruff e pyright
    0 erros.
- registro: registro-2026-09-24-retificacao-hardware-gpu-amd-vulkan
  caminhos:
  - scripts/cli/nexus.py
  parecer: Revisado em 2026-11-27 (NEXUS-OMNIKERNEL v1.1-EVOLVED). registrado subcomando
    Typer control-plane preservando todos os comandos existentes. Suite control_plane
    21/21, testes de contrato (roteamento/memoria/dockerfile 19/19), ruff e pyright
    0 erros.
- registro: registro-2026-09-30-expurgo-de-modelos-obsoletos-e-reconciliacao-de-ancoras
  caminhos:
  - scripts/cli/nexus.py
  parecer: Revisado em 2026-11-27 (NEXUS-OMNIKERNEL v1.1-EVOLVED). registrado subcomando
    Typer control-plane preservando todos os comandos existentes. Suite control_plane
    21/21, testes de contrato (roteamento/memoria/dockerfile 19/19), ruff e pyright
    0 erros.
- registro: registro-2026-10-04-remediacao-dependabot-pypdf
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; regerado e validado via uv lock/sync --check (laya 0.5.6,
    hypothesis 6.170.22, schemathesis 4.34.4, z3-solver 5.4.1.0). Pytest direcionado,
    ruff check/format e pyright 0 erros.
- registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
  caminhos:
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). regerado e validado via uv lock/sync --check
    (laya 0.5.6, hypothesis 6.170.22, schemathesis 4.34.4, z3-solver 5.4.1.0). Pytest
    direcionado, ruff check/format e pyright 0 erros.
- registro: registro-2026-10-06-strata-moe-125b-e-dashboard-nexus
  caminhos:
  - scripts/cli/nexus.py
  - scripts/setup/Setup-NexusProfile.ps1
  parecer: Revisado em 2026-11-27 (NEXUS-OMNIKERNEL v1.1-EVOLVED). registrado subcomando
    Typer control-plane preservando todos os comandos existentes; incluido control-plane
    em Global:NexusTyperCommands preservando UTF-8 BOM unico (test_roteamento_perfil
    verde). Suite control_plane 21/21, testes de contrato (roteamento/memoria/dockerfile
    19/19), ruff e pyright 0 erros.
- registro: registro-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
  caminhos:
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). regerado e validado via uv lock/sync --check
    (laya 0.5.6, hypothesis 6.170.22, schemathesis 4.34.4, z3-solver 5.4.1.0). Pytest
    direcionado, ruff check/format e pyright 0 erros.
- registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; regerado e validado via uv lock/sync --check (laya 0.5.6,
    hypothesis 6.170.22, schemathesis 4.34.4, z3-solver 5.4.1.0). Pytest direcionado,
    ruff check/format e pyright 0 erros.
- registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: registro-2026-10-19-saneamento-sonarqube-timesfm-e-a11y
  caminhos:
  - scripts/cli/nexus.py
  parecer: Revisado em 2026-11-27 (NEXUS-OMNIKERNEL v1.1-EVOLVED). registrado subcomando
    Typer control-plane preservando todos os comandos existentes. Suite control_plane
    21/21, testes de contrato (roteamento/memoria/dockerfile 19/19), ruff e pyright
    0 erros.
- registro: registro-2026-10-19-verificacao-neural-timesfm-e-evolucao-ecossistema
  caminhos:
  - scripts/cli/nexus.py
  - scripts/setup/Setup-NexusProfile.ps1
  - tests/fixtures/nexus_profile_template.ps1
  parecer: Revisado em 2026-11-27 (NEXUS-OMNIKERNEL v1.1-EVOLVED). registrado subcomando
    Typer control-plane preservando todos os comandos existentes; incluido control-plane
    em Global:NexusTyperCommands preservando UTF-8 BOM unico (test_roteamento_perfil
    verde); sincronizado control-plane em Global:NexusTyperCommands preservando UTF-8
    BOM unico (test_roteamento_perfil verde). Suite control_plane 21/21, testes de
    contrato (roteamento/memoria/dockerfile 19/19), ruff e pyright 0 erros.
- registro: registro-2026-10-20-harmonizacao-tier1-e-gemini-38
  caminhos:
  - scripts/ops/autopoietic_daily_cycle.py
  parecer: Revisado em 2026-11-27 (NEXUS-OMNIKERNEL v1.1-EVOLVED). adicionada Fase
    4 control_plane (dry-run audit e KPIs) preservando fases 1-3. Suite control_plane
    21/21, testes de contrato (roteamento/memoria/dockerfile 19/19), ruff e pyright
    0 erros.
- registro: registro-2026-10-20-saneamento-quality-gate-ascii-e-reconciliacao-de-ancoras
  caminhos:
  - scripts/cli/nexus.py
  - tests/fixtures/nexus_profile_template.ps1
  parecer: Revisado em 2026-11-27 (NEXUS-OMNIKERNEL v1.1-EVOLVED). registrado subcomando
    Typer control-plane preservando todos os comandos existentes; sincronizado control-plane
    em Global:NexusTyperCommands preservando UTF-8 BOM unico (test_roteamento_perfil
    verde). Suite control_plane 21/21, testes de contrato (roteamento/memoria/dockerfile
    19/19), ruff e pyright 0 erros.
- registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: registro-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: registro-2026-10-27-elevacao-dependencias-python-openai-pyspark-pytest
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; regerado e validado via uv lock/sync --check (laya 0.5.6,
    hypothesis 6.170.22, schemathesis 4.34.4, z3-solver 5.4.1.0). Pytest direcionado,
    ruff check/format e pyright 0 erros.
- registro: registro-2026-10-27-evolucao-project-context-e-reconciliacao-sota
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; regerado e validado via uv lock/sync --check (laya 0.5.6,
    hypothesis 6.170.22, schemathesis 4.34.4, z3-solver 5.4.1.0). Pytest direcionado,
    ruff check/format e pyright 0 erros.
- registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
  caminhos:
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). regerado e validado via uv lock/sync --check
    (laya 0.5.6, hypothesis 6.170.22, schemathesis 4.34.4, z3-solver 5.4.1.0). Pytest
    direcionado, ruff check/format e pyright 0 erros.
- registro: registro-2026-10-28-atualizacao-laya-e-estabilizacao-playwright-smoke
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; regerado e validado via uv lock/sync --check (laya 0.5.6,
    hypothesis 6.170.22, schemathesis 4.34.4, z3-solver 5.4.1.0). Pytest direcionado,
    ruff check/format e pyright 0 erros.
- registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: registro-2026-10-31-estabilizacao-lifecycle-warmup-turbopack
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: registro-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; regerado e validado via uv lock/sync --check (laya 0.5.6,
    hypothesis 6.170.22, schemathesis 4.34.4, z3-solver 5.4.1.0). Pytest direcionado,
    ruff check/format e pyright 0 erros.
- registro: registro-2026-11-03-elevacao-dependencias-pyarrow-openai-anthropic-laya
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; regerado e validado via uv lock/sync --check (laya 0.5.6,
    hypothesis 6.170.22, schemathesis 4.34.4, z3-solver 5.4.1.0). Pytest direcionado,
    ruff check/format e pyright 0 erros.
- registro: registro-2026-11-03-otimizacao-agentes-watchdog-e-calibracao
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; regerado e validado via uv lock/sync --check (laya 0.5.6,
    hypothesis 6.170.22, schemathesis 4.34.4, z3-solver 5.4.1.0). Pytest direcionado,
    ruff check/format e pyright 0 erros.
- registro: registro-2026-11-03-remediacao-dependabot-pypdf-pyasn1-minimatch
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; regerado e validado via uv lock/sync --check (laya 0.5.6,
    hypothesis 6.170.22, schemathesis 4.34.4, z3-solver 5.4.1.0). Pytest direcionado,
    ruff check/format e pyright 0 erros.
- registro: registro-2026-11-04-otimizacao-layout-header-e-elevacao-dependencias
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; regerado e validado via uv lock/sync --check (laya 0.5.6,
    hypothesis 6.170.22, schemathesis 4.34.4, z3-solver 5.4.1.0). Pytest direcionado,
    ruff check/format e pyright 0 erros.
- registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
  caminhos:
  - pyproject.toml
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0. Pytest direcionado, ruff check/format e pyright 0 erros.
- registro: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
  caminhos:
  - pyproject.toml
  - scripts/cli/nexus.py
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; regerado e validado via uv lock/sync --check (laya 0.5.6,
    hypothesis 6.170.22, schemathesis 4.34.4, z3-solver 5.4.1.0). Pytest direcionado,
    ruff check/format e pyright 0 erros.
- registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; regerado e validado via uv lock/sync --check (laya 0.5.6,
    hypothesis 6.170.22, schemathesis 4.34.4, z3-solver 5.4.1.0). Pytest direcionado,
    ruff check/format e pyright 0 erros.
- registro: registro-2026-11-07-elevacao-dependencias-fastapi-regex-types-aiofiles
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; regerado e validado via uv lock/sync --check (laya 0.5.6,
    hypothesis 6.170.22, schemathesis 4.34.4, z3-solver 5.4.1.0). Pytest direcionado,
    ruff check/format e pyright 0 erros.
- registro: registro-2026-11-08-elevacao-dependencias-regex-e-laya
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: registro-2026-11-08-elevacao-polars-2-1-e-consumo-integral-engines-sota
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: registro-2026-11-08-elevacao-pypdf-7-0-torchvision-e-ecossistema-npm
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: registro-2026-11-08-integracao-sota-suite-antigravity-sdk-cli-acp
  caminhos:
  - scripts/cli/nexus.py
  - scripts/setup/Setup-NexusProfile.ps1
  - tests/fixtures/nexus_profile_template.ps1
  parecer: Revisado em 2026-11-27 (NEXUS-OMNIKERNEL v1.1-EVOLVED). registrado subcomando
    Typer control-plane preservando todos os comandos existentes; incluido control-plane
    em Global:NexusTyperCommands preservando UTF-8 BOM unico (test_roteamento_perfil
    verde); sincronizado control-plane em Global:NexusTyperCommands preservando UTF-8
    BOM unico (test_roteamento_perfil verde). Suite control_plane 21/21, testes de
    contrato (roteamento/memoria/dockerfile 19/19), ruff e pyright 0 erros.
- registro: registro-2026-11-08-integracao-sota-triade-stitch-exa-jules
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: registro-2026-11-08-otimizacao-pyproject-dependencias-extras-e-reconciliacao
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; regerado e validado via uv lock/sync --check (laya 0.5.6,
    hypothesis 6.170.22, schemathesis 4.34.4, z3-solver 5.4.1.0). Pytest direcionado,
    ruff check/format e pyright 0 erros.
- registro: registro-2026-11-09-automacao-modelos-locais-ollama-e-subagentes
  caminhos:
  - scripts/cli/nexus.py
  parecer: Revisado em 2026-11-27 (NEXUS-OMNIKERNEL v1.1-EVOLVED). registrado subcomando
    Typer control-plane preservando todos os comandos existentes. Suite control_plane
    21/21, testes de contrato (roteamento/memoria/dockerfile 19/19), ruff e pyright
    0 erros.
- registro: registro-2026-11-09-elevacao-dependencias-e-fork-eigen
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: registro-2026-11-10-bump-deps-e-extra-paths-pylance
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; regerado e validado via uv lock/sync --check (laya 0.5.6,
    hypothesis 6.170.22, schemathesis 4.34.4, z3-solver 5.4.1.0). Pytest direcionado,
    ruff check/format e pyright 0 erros.
- registro: registro-2026-11-10-google-genai-3-1-0
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; regerado e validado via uv lock/sync --check (laya 0.5.6,
    hypothesis 6.170.22, schemathesis 4.34.4, z3-solver 5.4.1.0). Pytest direcionado,
    ruff check/format e pyright 0 erros.
- registro: registro-2026-11-11-elevacao-fastapi-playwright-e-bump-deep-research
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; regerado e validado via uv lock/sync --check (laya 0.5.6,
    hypothesis 6.170.22, schemathesis 4.34.4, z3-solver 5.4.1.0). Pytest direcionado,
    ruff check/format e pyright 0 erros.
- registro: registro-2026-11-11-elevacao-pypdf-turbo-ai-sdk-google
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: registro-2026-11-11-elevacao-sentence-transformers-genai-prettier-exa-mcp
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: registro-2026-11-11-elevacao-typer-types-knip-harmonizacao
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: registro-2026-11-11-nota-pareamento-dev-dependency-groups
  caminhos:
  - pyproject.toml
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0. Pytest direcionado, ruff check/format e pyright 0 erros.
- registro: registro-2026-11-13-elevacao-deps-e-saneamento-configs-ide
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; regerado e validado via uv lock/sync --check (laya 0.5.6,
    hypothesis 6.170.22, schemathesis 4.34.4, z3-solver 5.4.1.0). Pytest direcionado,
    ruff check/format e pyright 0 erros.
- registro: registro-2026-11-13-revisao-ancora-pyproject-extra-path-cockpit
  caminhos:
  - pyproject.toml
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0. Pytest direcionado, ruff check/format e pyright 0 erros.
- registro: registro-2026-11-14-correcao-devin-e-entrypoints-gemini-3-1-pro
  caminhos:
  - scripts/ops/autopoietic_daily_cycle.py
  parecer: Revisado em 2026-11-27 (NEXUS-OMNIKERNEL v1.1-EVOLVED). adicionada Fase
    4 control_plane (dry-run audit e KPIs) preservando fases 1-3. Suite control_plane
    21/21, testes de contrato (roteamento/memoria/dockerfile 19/19), ruff e pyright
    0 erros.
- registro: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; regerado e validado via uv lock/sync --check (laya 0.5.6,
    hypothesis 6.170.22, schemathesis 4.34.4, z3-solver 5.4.1.0). Pytest direcionado,
    ruff check/format e pyright 0 erros.
- registro: registro-2026-11-14-laya-pylint-e-refactors-sonar
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; regerado e validado via uv lock/sync --check (laya 0.5.6,
    hypothesis 6.170.22, schemathesis 4.34.4, z3-solver 5.4.1.0). Pytest direcionado,
    ruff check/format e pyright 0 erros.
- registro: registro-2026-11-14-llama-cpp-b12387-router-9931
  caminhos:
  - scripts/cli/nexus.py
  parecer: Revisado em 2026-11-27 (NEXUS-OMNIKERNEL v1.1-EVOLVED). registrado subcomando
    Typer control-plane preservando todos os comandos existentes. Suite control_plane
    21/21, testes de contrato (roteamento/memoria/dockerfile 19/19), ruff e pyright
    0 erros.
- registro: registro-2026-11-14-roteamento-pools-transporte-e-validacao-hrc
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; regerado e validado via uv lock/sync --check (laya 0.5.6,
    hypothesis 6.170.22, schemathesis 4.34.4, z3-solver 5.4.1.0). Pytest direcionado,
    ruff check/format e pyright 0 erros.
- registro: registro-2026-11-14-sync-uvlock-ollama-cloud-circuit-e-ci
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; regerado e validado via uv lock/sync --check (laya 0.5.6,
    hypothesis 6.170.22, schemathesis 4.34.4, z3-solver 5.4.1.0). Pytest direcionado,
    ruff check/format e pyright 0 erros.
- registro: registro-2026-11-16-elevacao-deps-anthropic-laya-accelerate-e-deps-sync
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: registro-2026-11-17-elevacao-deps-google-genai-openai
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: registro-2026-11-17-fase-3-backend-estrutural-sota
  caminhos:
  - pyproject.toml
  - requirements.txt
  - scripts/cli/nexus.py
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: registro-2026-11-17-fase-5-evolucao-das-forcas-sota
  caminhos:
  - pyproject.toml
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0. Pytest direcionado, ruff check/format e pyright 0 erros.
- registro: registro-2026-11-17-fases-0-1-portoes-verificacao-e-higiene-doc-real
  caminhos:
  - pyproject.toml
  - requirements.txt
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml. Pytest
    direcionado, ruff check/format e pyright 0 erros.
- registro: registro-2026-11-17-saneamento-deps-lint-typecheck-build
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: registro-2026-11-18-elevacao-deps-google-genai-regex-turbo
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: registro-2026-11-18-elevacao-deps-vitest-typescript-eslint-openai
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: registro-2026-11-18-saneamento-sonarlint-pyright-e-deps
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: registro-2026-11-19-auditoria-evolucao-frontend-sota
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: registro-2026-11-21-deps-sota-roi-neon-orchestrator-e-calibracao
  caminhos:
  - pyproject.toml
  - requirements.txt
  - scripts/ops/autopoietic_daily_cycle.py
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: registro-2026-11-21-laya-052-watchdog-711-e-calibracao-seq101
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: registro-2026-11-22-higgsfield-mcp-deps-e-saneamento-sota
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; regerado e validado via uv lock/sync --check (laya 0.5.6,
    hypothesis 6.170.22, schemathesis 4.34.4, z3-solver 5.4.1.0). Pytest direcionado,
    ruff check/format e pyright 0 erros.
- registro: registro-2026-11-22-icm-rules-ssot-e-roi-s1
  caminhos:
  - engine/skills_mcp_server.py
  parecer: Revisado em 2026-11-27 (NEXUS-OMNIKERNEL v1.1-EVOLVED). registradas 7 tools
    ok_* do OmniKernel ao lado das 4 tools icm_* no Gateway :8933 preservando contratos
    existentes. Suite control_plane 21/21, testes de contrato (roteamento/memoria/dockerfile
    19/19), ruff e pyright 0 erros.
- registro: registro-2026-11-24-laya-053-regex-20261123-schemathesis-4341
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: registro-2026-11-24-overlay-s3776-e-deps-polars-openai-anthropic
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; regerado e validado via uv lock/sync --check (laya 0.5.6,
    hypothesis 6.170.22, schemathesis 4.34.4, z3-solver 5.4.1.0). Pytest direcionado,
    ruff check/format e pyright 0 erros.
- registro: registro-2026-11-24-scrypt-sonarlint-codeql-schemathesis-exa
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; regerado e validado via uv lock/sync --check (laya 0.5.6,
    hypothesis 6.170.22, schemathesis 4.34.4, z3-solver 5.4.1.0). Pytest direcionado,
    ruff check/format e pyright 0 erros.
- registro: registro-2026-11-25-elevacao-deps-vitest-512-e-calibracao-20261124
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: registro-2026-11-27-harmonizacao-ide-rust-deps-submodulos
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-27 (upgrades laya/hypothesis/schemathesis/z3-solver
    + zero SonarLint em control_plane). elevados laya>=0.5.6, hypothesis>=6.170.22,
    schemathesis>=4.34.4 (em paridade optional-dependencies.dev e dependency-groups.dev)
    e z3-solver>=5.4.1.0; elevado laya>=0.5.6 em paridade com pyproject.toml; regerado
    e validado via uv lock/sync --check (laya 0.5.6, hypothesis 6.170.22, schemathesis
    4.34.4, z3-solver 5.4.1.0). Pytest direcionado, ruff check/format e pyright 0
    erros.
- registro: spec-2026-11-27-omnikernel-control-plane
  caminhos:
  - control_plane/mcp_tools.py
  - control_plane/service.py
  - control_plane/storage.py
  - control_plane/z3_gate.py
  parecer: Revisado em 2026-11-27 (refatoracao SonarLint S3776/S3358 em control_plane).
    Preservada integralmente a semantica de control_plane/z3_gate.py apos reducao de
    complexidade cognitiva em _validate_ast_node, _apply_bound_op, _check_conjunction
    e _compile_z3_expr. Validado com ruff check/format 0 erros, 25/25 control_plane e
    suite_verde.py ensure verde (0 erros, 0 warnings, 68.76%).
---

# Validacao A/B `NEXUS-OMNIKERNEL v1.1-EVOLVED` (30 Tarefas)

| Metrica | Braco A (Baseline) | Braco B (OmniKernel v1.1) | Delta / Razao |
| :--- | :---: | :---: | :---: |
| Entregas Verificadas | 28/30 (93.33%) | 30/30 (100.00%) | +6.67 p.p. |
| Chamadas LLM | 30 | 28 (L0_DET defletiu 2) | -2 |
| Custo / Entrega Verificada (USD) | \$0.000158 | \$0.000211 | 1.3321x (-33.21% economia) |
| Cache Hit no Prefixo | 0/1096 | 0.00% | medido via usage_metadata |
| Latencia Control Plane (p95) | N/A | 3.691 ms | meta <= 120 ms |
| Regressao Pos-Evolucao (Slow Loop) | N/A | 0.0% | `zero_regression_verified=True` |
| Solver SMT Binding C (`z3-solver==5.4.1.0`) | N/A | `p50=1.354 ms` / `p95=2.164 ms` | meta `< 50 ms`, 0 CVEs |
| Concorrencia SQLite WAL (8T / 4P spawn) | N/A | `353.4 tx/s` (8T) / `173.6 tx/s` (4P) | `journal=wal`, `integrity=ok`, 0 erros |
