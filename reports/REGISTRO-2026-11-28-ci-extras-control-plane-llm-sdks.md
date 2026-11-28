---
id: registro-2026-11-28-ci-extras-control-plane-llm-sdks
tipo: registro
escopo: Site -- correcao dos extras control-plane e llm-sdks no CI sota-ci.yml e alinhamento local knip 6.49.0
ecossistema: nexus-sota
autor: Gemini 4 Neon <noreply@google.com>
criado_em: '2026-11-28T09:50:00-03:00'
atualizado_em: '2026-11-28T09:50:00-03:00'
commit: HEAD
classes:
- interno
- registro
- ci
- dependencias
caminhos:
- .github/workflows/sota-ci.yml
- reports/REGISTRO-2026-11-28-ci-extras-control-plane-llm-sdks.md
- tests/control_plane/test_storage_bitemporal.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  python: 3.14.9
  so: Windows
  condutor: Gemini 4 Neon
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: '2026-11-28'
verificado:
- uv run --with actionlint-py actionlint .github/workflows/sota-ci.yml -- exit 0
- uv run --no-sync python -m pytest tests/control_plane/test_z3_gate.py tests/test_sota_deps_roi_2026_11.py -k "test_z3_gate or test_sota_deps_2026_11_26_runtime_contracts" -q -- 6 passed in 3.02s, 0 warnings
- uv run --no-sync ruff check tests/control_plane/test_storage_bitemporal.py -- All checks passed!
- uv run --no-sync pyright --project pyproject.toml tests/control_plane/test_storage_bitemporal.py -- 0 errors, 0 warnings, 0 informations
- uv run --no-sync python -m pytest tests/control_plane/test_storage_bitemporal.py -q -- 5 passed in 2.24s, 0 warnings
- npm install --no-audit --no-fund -- node_modules/knip alinhado em 6.49.0 sem diff em package.json/package-lock.json
- npm run audit:entropy -- knip 6.49.0 exit 0 (0 erros de codigo morto; apenas 2 hints informativos para .prisma e .css)
nao_verificado:
- Nova execucao remota de SOTA v8.0 GOLD CI/CD Pipeline apos git push (monitorada logo apos o push)
revisoes_de_ancora:
- registro: auditoria-2026-09-01-formatacao-ruff-e-ancoras
  caminhos:
  - .github/workflows/sota-ci.yml
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): adicionados --extra control-plane e --extra llm-sdks ao uv sync do job python-test-and-lint para executar test_z3_gate e test_sota_deps_2026_11_26_runtime_contracts sem fallback nem quebra (actionlint OK, 6 passed local).'
- registro: auditoria-2026-09-12-o-ci-vermelho-que-nenhum-portao-local-media
  caminhos:
  - .github/workflows/sota-ci.yml
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): adicionados --extra control-plane e --extra llm-sdks ao uv sync do job python-test-and-lint para executar test_z3_gate e test_sota_deps_2026_11_26_runtime_contracts sem fallback nem quebra (actionlint OK, 6 passed local).'
- registro: handoff-2026-09-09-ci-verde-e-as-seis-causas
  caminhos:
  - .github/workflows/sota-ci.yml
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): adicionados --extra control-plane e --extra llm-sdks ao uv sync do job python-test-and-lint para executar test_z3_gate e test_sota_deps_2026_11_26_runtime_contracts sem fallback nem quebra (actionlint OK, 6 passed local).'
- registro: plano-frentes-abertas-2026-09-08
  caminhos:
  - .github/workflows/sota-ci.yml
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): adicionados --extra control-plane e --extra llm-sdks ao uv sync do job python-test-and-lint para executar test_z3_gate e test_sota_deps_2026_11_26_runtime_contracts sem fallback nem quebra (actionlint OK, 6 passed local).'
- registro: registro-2026-09-08-bindings-wasm-defasados
  caminhos:
  - .github/workflows/sota-ci.yml
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): adicionados --extra control-plane e --extra llm-sdks ao uv sync do job python-test-and-lint para executar test_z3_gate e test_sota_deps_2026_11_26_runtime_contracts sem fallback nem quebra (actionlint OK, 6 passed local).'
- registro: registro-2026-09-09-actionlint-e-a-fronteira-do-submodulo
  caminhos:
  - .github/workflows/sota-ci.yml
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): adicionados --extra control-plane e --extra llm-sdks ao uv sync do job python-test-and-lint para executar test_z3_gate e test_sota_deps_2026_11_26_runtime_contracts sem fallback nem quebra (actionlint OK, 6 passed local).'
- registro: registro-2026-09-14-benchmark-icm-chipev-em-hand-history-e-next-env
  caminhos:
  - .github/workflows/sota-ci.yml
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): adicionados --extra control-plane e --extra llm-sdks ao uv sync do job python-test-and-lint para executar test_z3_gate e test_sota_deps_2026_11_26_runtime_contracts sem fallback nem quebra (actionlint OK, 6 passed local).'
- registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
  caminhos:
  - .github/workflows/sota-ci.yml
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): adicionados --extra control-plane e --extra llm-sdks ao uv sync do job python-test-and-lint para executar test_z3_gate e test_sota_deps_2026_11_26_runtime_contracts sem fallback nem quebra (actionlint OK, 6 passed local).'
- registro: registro-2026-10-05-atlas-cenarios-acessibilidade-e-design-system
  caminhos:
  - .github/workflows/sota-ci.yml
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): adicionados --extra control-plane e --extra llm-sdks ao uv sync do job python-test-and-lint para executar test_z3_gate e test_sota_deps_2026_11_26_runtime_contracts sem fallback nem quebra (actionlint OK, 6 passed local).'
- registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
  caminhos:
  - .github/workflows/sota-ci.yml
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): adicionados --extra control-plane e --extra llm-sdks ao uv sync do job python-test-and-lint para executar test_z3_gate e test_sota_deps_2026_11_26_runtime_contracts sem fallback nem quebra (actionlint OK, 6 passed local).'
- registro: registro-2026-11-17-fase-5-evolucao-das-forcas-sota
  caminhos:
  - .github/workflows/sota-ci.yml
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): adicionados --extra control-plane e --extra llm-sdks ao uv sync do job python-test-and-lint para executar test_z3_gate e test_sota_deps_2026_11_26_runtime_contracts sem fallback nem quebra (actionlint OK, 6 passed local).'
- registro: registro-2026-11-17-fases-0-1-portoes-verificacao-e-higiene-doc-real
  caminhos:
  - .github/workflows/sota-ci.yml
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): adicionados --extra control-plane e --extra llm-sdks ao uv sync do job python-test-and-lint para executar test_z3_gate e test_sota_deps_2026_11_26_runtime_contracts sem fallback nem quebra (actionlint OK, 6 passed local).'
- registro: registro-2026-11-24-ci-verde-e-otimizacao-suites
  caminhos:
  - .github/workflows/sota-ci.yml
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): adicionados --extra control-plane e --extra llm-sdks ao uv sync do job python-test-and-lint para executar test_z3_gate e test_sota_deps_2026_11_26_runtime_contracts sem fallback nem quebra (actionlint OK, 6 passed local).'
- registro: registro-2026-11-24-seguranca-github-codeql-dependabot-knip
  caminhos:
  - .github/workflows/sota-ci.yml
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): adicionados --extra control-plane e --extra llm-sdks ao uv sync do job python-test-and-lint para executar test_z3_gate e test_sota_deps_2026_11_26_runtime_contracts sem fallback nem quebra (actionlint OK, 6 passed local).'
- registro: validacao-2026-11-27-omnikernel-v1-1-ab-benchmark
  caminhos:
  - tests/control_plane/test_storage_bitemporal.py
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): ProcessPoolExecutor em test_sqlite_wal_multiprocess_concurrent_writes agora usa mp_context=multiprocessing.get_context("spawn") para eliminar os 4 DeprecationWarnings de fork() multi-threaded sob pytest-xdist em runners Linux (ruff/pyright 0 erros, 5 passed / 0 warnings).'
---

# REGISTRO — Correção de Extras no CI (`sota-ci.yml`) e Alinhamento `knip 6.49.0` (2026-11-28)

## 1. Diagnóstico do CI Remoto (Run `46145952276`)

- O job `🐍 Python Lint & Pytest Matrix (3.12)` falhou em 5 testes (`tests/test_sota_deps_roi_2026_11.py::test_sota_deps_2026_11_26_runtime_contracts` por ausência de `openai`, e 4 testes em `tests/control_plane/test_z3_gate.py` por ausência de `z3-solver` levando ao fallback `builtin-qf-lia`).
- **Correção aplicada em `.github/workflows/sota-ci.yml`:** incluídos `--extra control-plane --extra llm-sdks` em `uv sync --frozen --extra dev --extra control-plane --extra llm-sdks --python "${{ matrix.python-version }}"`.

## 2. Alinhamento Local do `knip` (`6.48.0` -> `6.49.0`)

- Executado `npm install --no-audit --no-fund` no root, atualizando `node_modules/knip` para `6.49.0` em paridade exata com `package.json` e `package-lock.json` (zero diff nos manifestos).
- `npm run audit:entropy` encerrou com código `0` e `0` achados de código morto.
