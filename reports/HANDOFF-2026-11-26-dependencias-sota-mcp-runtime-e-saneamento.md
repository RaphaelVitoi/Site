---
id: handoff-2026-11-26-dependencias-sota-mcp-runtime-e-saneamento
tipo: handoff
escopo: Site e Raiz -- atualizacao integral de dependencias Python/Node/MCP, deduplicacao de npm_cve_acceptances.json
  e saneamento mcp-runtime (25 -> 0 CVEs)
ecossistema: nexus-sota
autor: Gemini 4 Hydrogen <noreply@google.com>
criado_em: '2026-11-26T10:56:00-03:00'
atualizado_em: '2026-11-26T10:56:00-03:00'
commit: HEAD
classes:
- interno
- handoff
- dependencias
- seguranca
caminhos:
- data/npm_cve_acceptances.json
- frontend/package.json
- package-lock.json
- pyproject.toml
- reports/HANDOFF-2026-11-26-dependencias-sota-mcp-runtime-e-saneamento.md
- requirements.txt
- tests/test_sota_deps_roi_2026_11.py
- tools/hybrid_router/requirements.txt
- uv.lock
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  python: 3.14.9
  so: Windows
  condutor: Gemini 4 Hydrogen
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: '2026-11-26'
verificado:
- uv lock --upgrade && uv sync --all-groups --all-extras && uv pip check && uv lock --check -- 253 pacotes
  compativeis, 279 pacotes no lock
- uv run --no-sync ruff check . e ruff format --check . -- All checks passed, 723 arquivos formatados
- uv run --no-sync pyright --project pyproject.toml -- 0 errors, 0 warnings, 0 informations
- python -m pip_audit --ignore-vuln PYSEC-2026-311/3814/3815/3813 -- No known vulnerabilities found, 5
  ignored (chromadb 1.5.9)
- uv run --no-sync python -m pytest em 11 arquivos direcionados (incl. tests/test_sota_deps_roi_2026_11.py
  com 15 testes) -- 100% PASS, 0 warnings
- npm install --force && npm audit --audit-level=low no Site -- found 0 vulnerabilities (node_modules/typescript
  6.0.3 + frontend 7.0.2)
- npm run lint, npm run typecheck e npm run test -- ESLint/tsc limpos, 119 suites / 771 testes Jest passed,
  0 warnings
- data/npm_cve_acceptances.json -- 21 entradas, 21 IDs unicos validados por teste unitario
- Raiz .gemini e nucleo/tools/mcp-runtime -- npm audit = 0 vulnerabilidades (mcp-runtime de 25 -> 0);
  chrome-devtools-mcp --version = 1.14.0
- cargo check em wasm-equity/Cargo.toml e core/nexus-core-rust/Cargo.toml -- compilacao limpa
- avaliar_impacto_sessao.py --pendencias-inicio 0 --horas 12 --markdown -- paineis quantitativo e qualitativo
  coletados
- record_anchor_gate.ps1 e record_gate.py -- APROVADOS (9 arquivos em stage, 110 ancoras conciliadas)
- npm run sota:audit (cwv_gate.ps1) -- FRAGIL (AMARELO), exit 0, 0 erros, 2 warnings (Fases 3 CVE=0,
  4 SRI VERIFIED, 5 Higiene PASS; Fases 1/2 sem cobertura CDP por timeout em Page.loadEventFired na
  porta 9226)
- tests/test_api_game_theory_handlers.py (12 passed, 0 warnings) e suite_verde.py executada com
  SOTA_SUITE_WORKERS=2 (mitigando access violation/contencao de memoria do torch 2.15.0 + safetensors
  sob 6 workers)
nao_verificado:
- Fases 1 e 2 (CWV/Axe live) do cwv_gate.ps1 -- 2 warnings de cobertura por timeout CDP Page.loadEventFired
  em localhost:3000
- CI remoto GitHub Actions apos git push -- pendente execucao remota
- Submodulos skills/* (exa-mcp-server 38 vulns, gemini-supermemory 9 vulns, gemini-deep-research 2 vulns)
  -- nao editados por exigirem commits nos forks
- 4 divergencias pre-existentes em sincronizar_nucleo.py --verificar (vscode, antigravity-2.0, blender,
  rea) -- mantidas intactas aguardando arbitragem Tier 0
- Feedback numerico de calibracao do Tier 0 -- ausente nesta sessao, nenhum evento gravado no ledger
referencias_nao_resolviveis:
- memoria/HERMES.md
- nucleo/nucleo_compartilhado.json
- nucleo/mcp-runtime/package.json
- nucleo/mcp-runtime/package-lock.json
- nucleo/mcp-runtime/gateway-python.json
- tools/mcp-runtime/package.json
- config/mcp_gateway.json
- config/config.json
- tests/test_nucleo_compartilhado.py
revisoes_de_ancora:
- registro: 2026-09-22-auditoria-frontend-4-itens
  caminhos:
  - frontend/package.json
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: auditoria-2026-09-02-integridade-do-projeto-e-piso-de-transformers
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: auditoria-2026-09-08-o-que-esta-em-aberto-na-malha
  caminhos:
  - requirements.txt
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: auditoria-2026-10-08-integralidade-backend
  caminhos:
  - pyproject.toml
  - requirements.txt
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: auditoria-cwv-lighthouse-2026-09-01
  caminhos:
  - package-lock.json
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: handoff-2026-08-29-governanca-8tiers-vulnerabilidades-subagents
  caminhos:
  - frontend/package.json
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
  caminhos:
  - pyproject.toml
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: handoff-2026-09-10-lint-lighthouse-e-aceite-cve
  caminhos:
  - pyproject.toml
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: handoff-2026-09-13-integracao-de-engines-wasm-e-economia-de-gate
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: handoff-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - data/npm_cve_acceptances.json
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
  caminhos:
  - frontend/package.json
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: handoff-2026-11-08-otimizacao-backend-e-integridade-sota
  caminhos:
  - tools/hybrid_router/requirements.txt
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: handoff-2026-11-15-translategemma-timesfm-laya-roi
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: handoff-2026-11-21-deps-sota-roi-neon-orchestrator-e-calibracao
  caminhos:
  - frontend/package.json
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - tests/test_sota_deps_roi_2026_11.py
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: handoff-2026-11-21-laya-052-watchdog-711-e-calibracao-seq101
  caminhos:
  - pyproject.toml
  - requirements.txt
  - tests/test_sota_deps_roi_2026_11.py
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: handoff-2026-11-22-higgsfield-mcp-deps-e-saneamento-sota
  caminhos:
  - frontend/package.json
  - package-lock.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: handoff-2026-11-24-laya-053-regex-20261123-schemathesis-4341
  caminhos:
  - pyproject.toml
  - requirements.txt
  - tests/test_sota_deps_roi_2026_11.py
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: plan-dependency-boundary-reconciliation-2026-09-01
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: plano-frentes-abertas-2026-09-08
  caminhos:
  - requirements.txt
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: plano-laya-integracao-s1s2-pmev-2026-09-20
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-09-02-fast-uri-alto-e-contrato-de-evidencia-pmev
  caminhos:
  - package-lock.json
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem
  caminhos:
  - frontend/package.json
  - package-lock.json
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-09-09-remediacao-dependabot-httpx2
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-09-10-importacao-visivel-hh-hrc
  caminhos:
  - frontend/package.json
  - package-lock.json
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-09-10-publicacao-inputs-mtt
  caminhos:
  - frontend/package.json
  - package-lock.json
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-09-12-teoria-canonica-chen-janda-e-convergencia-cfr
  caminhos:
  - frontend/package.json
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-09-13-ci-typecheck-e-fronteira-de-capacidades
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-09-13-otimizacoes-helpers-antientropia-e-feedback
  caminhos:
  - frontend/package.json
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-09-14-auditoria-e-refinamento-settings-e-configuracoes
  caminhos:
  - frontend/package.json
  - package-lock.json
  - requirements.txt
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-09-14-correcoes-pos-auditoria-handoff-tier-e-dependencias
  caminhos:
  - frontend/package.json
  - package-lock.json
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-09-18-decisoes-delegadas-sobre-as-pendencias
  caminhos:
  - frontend/package.json
  - package-lock.json
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-10-04-http-metrics-correlation-e-worker-shutdown
  caminhos:
  - data/npm_cve_acceptances.json
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-10-04-remediacao-dependabot-pypdf
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
  caminhos:
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-10-05-atlas-cenarios-acessibilidade-e-design-system
  caminhos:
  - frontend/package.json
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - data/npm_cve_acceptances.json
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
  caminhos:
  - frontend/package.json
  - package-lock.json
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
  caminhos:
  - data/npm_cve_acceptances.json
  - frontend/package.json
  - package-lock.json
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
  caminhos:
  - frontend/package.json
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-10-27-elevacao-dependencias-python-openai-pyspark-pytest
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-10-27-evolucao-project-context-e-reconciliacao-sota
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-10-27-harmonizacao-dependencias-ci-e-wasm
  caminhos:
  - frontend/package.json
  - package-lock.json
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-10-27-harmonizacao-dependencias-katex-e-ci
  caminhos:
  - frontend/package.json
  - package-lock.json
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
  caminhos:
  - frontend/package.json
  - package-lock.json
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-10-28-atualizacao-laya-e-estabilizacao-playwright-smoke
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
  caminhos:
  - data/npm_cve_acceptances.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-10-31-estabilizacao-lifecycle-warmup-turbopack
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules
  caminhos:
  - package-lock.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-03-elevacao-dependencias-pyarrow-openai-anthropic-laya
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-03-otimizacao-agentes-watchdog-e-calibracao
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-03-remediacao-dependabot-pypdf-pyasn1-minimatch
  caminhos:
  - package-lock.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-04-otimizacao-layout-header-e-elevacao-dependencias
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
  caminhos:
  - pyproject.toml
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
  caminhos:
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - tools/hybrid_router/requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
  caminhos:
  - frontend/package.json
  - package-lock.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-07-elevacao-dependencias-fastapi-regex-types-aiofiles
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-08-elevacao-dependencias-regex-e-laya
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-08-elevacao-polars-2-1-e-consumo-integral-engines-sota
  caminhos:
  - pyproject.toml
  - requirements.txt
  - tools/hybrid_router/requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-08-elevacao-pypdf-7-0-torchvision-e-ecossistema-npm
  caminhos:
  - frontend/package.json
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-08-harmonizacao-r-4-6-1-jules-e-saneamento-ancoras
  caminhos:
  - package-lock.json
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-08-integracao-sota-triade-stitch-exa-jules
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-08-otimizacao-backend-sonarlint-pyright-e-headings
  caminhos:
  - tools/hybrid_router/requirements.txt
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-08-otimizacao-pyproject-dependencias-extras-e-reconciliacao
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-08-refinamento-sonarlint-e-code-review-triage
  caminhos:
  - frontend/package.json
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-08-saneamento-code-review-triage
  caminhos:
  - frontend/package.json
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-09-elevacao-dependencias-e-fork-eigen
  caminhos:
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-10-ai-sdk-google-4-0-117-ai-7-0-169
  caminhos:
  - package-lock.json
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-10-bump-deps-e-extra-paths-pylance
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-10-google-genai-3-1-0
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-10-lock-bundle-analyzer-16-4-6
  caminhos:
  - package-lock.json
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-11-elevacao-fastapi-playwright-e-bump-deep-research
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-11-elevacao-pypdf-turbo-ai-sdk-google
  caminhos:
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-11-elevacao-sentence-transformers-genai-prettier-exa-mcp
  caminhos:
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-11-elevacao-typer-types-knip-harmonizacao
  caminhos:
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-11-hybrid-router-genai-jules-zod4
  caminhos:
  - tools/hybrid_router/requirements.txt
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-11-nota-pareamento-dev-dependency-groups
  caminhos:
  - pyproject.toml
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-12-review-sweeps-endurecimento-sota
  caminhos:
  - package-lock.json
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-13-elevacao-deps-e-saneamento-configs-ide
  caminhos:
  - package-lock.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-13-revisao-ancora-pyproject-extra-path-cockpit
  caminhos:
  - pyproject.toml
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
  caminhos:
  - package-lock.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-14-laya-pylint-e-refactors-sonar
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-14-roteamento-pools-transporte-e-validacao-hrc
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-14-sync-uvlock-ollama-cloud-circuit-e-ci
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-16-elevacao-deps-anthropic-laya-accelerate-e-deps-sync
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-17-elevacao-deps-google-genai-openai
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-17-fase-2-saneamento-estrutural-frontend
  caminhos:
  - frontend/package.json
  - package-lock.json
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-17-fase-3-backend-estrutural-sota
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-17-fase-5-evolucao-das-forcas-sota
  caminhos:
  - pyproject.toml
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-17-fases-0-1-portoes-verificacao-e-higiene-doc-real
  caminhos:
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-17-saneamento-deps-lint-typecheck-build
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-18-elevacao-deps-google-genai-regex-turbo
  caminhos:
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-18-elevacao-deps-vitest-typescript-eslint-openai
  caminhos:
  - frontend/package.json
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-18-saneamento-sonarlint-pyright-e-deps
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-19-auditoria-evolucao-frontend-sota
  caminhos:
  - frontend/package.json
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-21-blindagem-ascii-e-saneamento-linters
  caminhos:
  - tests/test_sota_deps_roi_2026_11.py
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-21-deps-sota-roi-neon-orchestrator-e-calibracao
  caminhos:
  - frontend/package.json
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - tests/test_sota_deps_roi_2026_11.py
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-21-laya-052-watchdog-711-e-calibracao-seq101
  caminhos:
  - pyproject.toml
  - requirements.txt
  - tests/test_sota_deps_roi_2026_11.py
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-22-higgsfield-mcp-deps-e-saneamento-sota
  caminhos:
  - frontend/package.json
  - package-lock.json
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-24-laya-053-regex-20261123-schemathesis-4341
  caminhos:
  - pyproject.toml
  - requirements.txt
  - tests/test_sota_deps_roi_2026_11.py
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-24-overlay-s3776-e-deps-polars-openai-anthropic
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-24-scrypt-sonarlint-codeql-schemathesis-exa
  caminhos:
  - pyproject.toml
  - tests/test_sota_deps_roi_2026_11.py
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-24-seguranca-github-codeql-dependabot-knip
  caminhos:
  - package-lock.json
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: registro-2026-11-25-elevacao-deps-vitest-512-e-calibracao-20261124
  caminhos:
  - package-lock.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: relatorio-2026-08-29-analise-integral-ecossistema-sota-v8-gold
  caminhos:
  - frontend/package.json
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: relatorio-2026-08-29-impacto-quantitativo-qualitativo-sota-v8-gold
  caminhos:
  - frontend/package.json
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
- registro: relatorio-fusao-cerebro-claude-quality-gate-2026-09-01
  caminhos:
  - package-lock.json
  parecer: Revisado em 2026-11-26 (duo Gemini 4 Neon + Gemini 4 Hydrogen). Elevacao de dependencias Python
    (laya 0.5.5, regex 2026.11.25, typer 0.29.3, openai 3.60.0, torch 2.15.0, transformers 5.24.1, httpx2
    2.16.2), Frontend/Node (tanstack-virtual 3.14.28, recharts 3.11.1, @types/node 26.6.11, @types/react
    19.3.3, typescript-eslint 8.74.0), deduplicacao de 4 IDs em data/npm_cve_acceptances.json e testes
    de regressao preservam os contratos SOTA.
---

# HANDOFF — Atualização SOTA de Dependências, Saneamento `mcp-runtime` e Regressão (2026-11-26)

## 1. Estado Inicial, Propósito e Proveniência

- **Condutor Executor:** `Gemini 4 Hydrogen` (`noreply@google.com`, veículo `antigravity`, Tier 1)
- **Orquestrador:** `Gemini 4 Neon` (`noreply@google.com`, modo bifásico `orchestrator:gemini-4-neon+gemini-4-hydrogen`)
- **Sessão:** `2d50dbad-28c3-4081-95a0-5e1aa575d0b3` · `supervisao=assistida`
- **Calibração:** nenhuma nota numérica fornecida pelo Tier 0 nesta sessão (ledger `reports/agent-calibration/feedback-ledger.jsonl` preservado intacto em 103 registros, tail `81591d22`).
- **Propósito:** auditar, atualizar, corrigir, otimizar e validar todas as dependências Python, Node/Frontend, Rust/WASM, workspace raiz e runtime MCP (`mcp-runtime`), blindar regressões com testes e consolidar os portões oficiais + commit + push autorizados pelo Tier 0.

---

## 2. Inventário de Deltas Aplicados

### 2.1 Python (`Site`)
| Pacote / Arquivo | Antes | Depois | Observação |
| :--- | :--- | :--- | :--- |
| `regex` (`pyproject.toml`, `requirements.txt`, `uv.lock`) | `>=2026.11.24` | `>=2026.11.25` | Instalado `2026.11.25` |
| `typer` (`pyproject.toml`, `requirements.txt`, `uv.lock`) | `>=0.29.2` | `>=0.29.3` | Instalado `0.29.3` |
| `laya` (`pyproject.toml`, `requirements.txt`, `uv.lock`) | `>=0.5.4` | `>=0.5.5` | Instalado `0.5.5` |
| `openai` (`pyproject.toml` extras `llm-sdks`/`all`, `uv.lock`) | `>=3.59.0` | `>=3.60.0` | Instalado `3.60.0` |
| `torch` (`[tool.uv] constraint-dependencies`) | `>=2.14.1` | `>=2.15.0` | Instalado `2.15.0+cpu` |
| `transformers` (`[tool.uv] constraint-dependencies`) | `>=5.20.2` | `>=5.24.1` | Instalado `5.24.1` |
| `httpx2` (`[tool.uv] constraint-dependencies`) | `>=2.16.0` | `>=2.16.2` | Instalado `2.16.2` |
| `filelock` / `certifi` (`[tool.uv] constraint-dependencies`) | `4.2.1` / `2026.10.19` | `4.3.1` / `2026.11.20` | Instalados `4.3.1` / `2026.11.20` |
| `tools/hybrid_router/requirements.txt` | pisos `0.162.2`/`2.14.3`/`3.2.0`/`2.5.4` | `0.165.0`/`2.14.4`/`3.6.1`/`2.5.5` | Alinhado ao `pyproject.toml` |
| `tenacity` / `mpmath` | `9.1.4` / `1.3.0` | `9.1.4` / `1.3.0` (retidas) | `google-genai 3.6.1` exige `<9.2.0`; `sympy` exige `<1.4` |

### 2.2 Frontend / Node (`Site`)
| Alvo | Antes | Depois | Observação |
| :--- | :--- | :--- | :--- |
| `@tanstack/react-virtual` (`frontend/package.json`) | `^3.14.27` | `^3.14.28` | Lock atualizado |
| `recharts` (`frontend/package.json`) | `^3.11.0` | `^3.11.1` | Lock atualizado |
| `@types/node` / `@types/react` (`frontend/package.json`) | `26.6.6` / `19.3.0` | `26.6.11` / `19.3.3` | Lock atualizado |
| `typescript-eslint` (`frontend/package.json`) | `^8.73.0` | `^8.74.0` | `npm install --force` preserva `typescript@6.0.3` peer na raiz + `7.0.2` no frontend |
| `data/npm_cve_acceptances.json` | 25 entradas (4 duplicadas) | 21 entradas / 21 IDs únicos | Blindado por `test_npm_cve_acceptances_unique_ids_and_schema` |

### 2.3 Workspace Raiz `.gemini` e `mcp-runtime`
| Alvo | Antes | Depois | Observação |
| :--- | :--- | :--- | :--- |
| `package.json` (`markdownlint-cli2`) | `^0.24.0` | `^0.24.2` | `npm audit`: `0 vulnerabilities` |
| `nucleo/mcp-runtime` & `tools/mcp-runtime` | divergia + `mcpbrowser` + `@google-cloud/cloud-run-mcp` (25 CVEs) | `@modelcontextprotocol/server-sequential-thinking ^2.2.0`, `@playwright/mcp 0.0.86`, `chrome-devtools-mcp ^1.14.0`, `exa-mcp-server ^3.5.1`, `mcp-remote ^0.17.1` (**0 CVEs**) | `npm ci --ignore-scripts`; eliminadas 25 CVEs (14 high, 10 moderate, 1 low) |
| `nucleo/nucleo_compartilhado.json` & `config/mcp_gateway.json` | `chrome-devtools-mcp/build/src/bin/chrome-devtools-mcp.js` | `chrome-devtools-mcp/out/Default/gen/src/bin/chrome-devtools-mcp.js` | `--version` = `1.14.0` verificado |

---

## 3. Painel de Avaliação de Impacto da Sessao (`avaliar_impacto_sessao.py`)

### Painel de Avaliacao de Impacto da Sessao (Agnostico Tier 1-2-3)

| Metrica de Impacto | Valor Medido | Status / Observacao |
| :--- | :--- | :--- |
| **Entregas Git (12.0h)** | **1 commits / 44 arq.** | +6068/-262 linhas, branch `master`, dirty=8 (antes do handoff/commit) |
| **CWV, A11y & Seguranca** | **LCP 843.7ms / CLS 0.0002** | TBT 32.5ms, axe=0, CVE crit/high=0, suite HEAD=True |
| **Economia de Tokens MCP (S1)** | **-40.56%** | Capacidade S1 em regime (warmup descartado, 32 ferramentas) (overhead: 342.1 us) |
| **Ingress Fast-Path S1** | **0.0771 ms** (77.1 us) | Triagem O(1) de tarefas sem compilar grafo |
| **Passivo de Pendencias** | **0 abertas** (0 vencidas, reducao: 0.0%) | Resolucao formal via M.O. 13.F |
| **Integridade do Ledger** | **103 registros** (tail: `81591d22`) | Portao: 0 sessoes (faltam 3, ref 2026-11-25, TimesFM: INSUFFICIENT_HISTORY) |
| **Resolucao de Tarefas SQLite** | **100.0%** (0/0) | pending=0 / failed=0 |
| **Saude da Malha** | **INFO** (0 alertas graves) | 1 sinal(is) observado(s) via `saude_da_malha.py` |
| **Pools OpenRouter Multi-Tier** | **32 chaves** (32 ativas, score: 80.0) | T1: 5 \| T2: 10 \| T3: 5 \| T4: 12 (0 bloq / 0 rev) |
| **Eficiencia Economica & Infra** | **21 locais / 18 identidades** | Tier 1=17, Tier 2=1; Cotas Pro Tier 1 (Faixa.FLAT_FEE) prioritarias |
| **Memoria Agentica Local** | **56 notas** (site: 53) | repo `~/.gemini/memoria`: 18 dirty, ultimo commit 2026-11-24 |

### Diagnostico Qualitativo por Eixo (Postura Geral: ATENCAO)

| Eixo Avaliado | Nivel | Evidencia Medida |
| :--- | :--- | :--- |
| `entrega_git` | **ATENCAO** | 1 commit(s) na janela, 8 item(ns) pendente(s) no working tree antes deste commit. |
| `qualidade_cwv` | **OTIMO** | SOTA GOLD aprovado (LCP 843.7ms, CLS 0.0002, 0 axe, 0 CVE). |
| `governanca_malha` | **OTIMO** | Zero pendencias abertas e malha sem alertas graves. |
| `calibracao_timesfm` | **ESTAVEL** | Acumulado 0 sessao(oes) elegivel(is) (faltam 3); TimesFM `INSUFFICIENT_HISTORY` (0/4). |
| `infra_mcp_pools` | **OTIMO** | Fila 100.0% resolvida; poda MCP -40.56%; pools 32/32 ativos. |
| `memoria_dreaming` | **ATENCAO** | Repo memoria dirty=18 (commit 2026-11-24); Devin issues_high=0, skills_enganosos=0. |

---

## 4. Contrato Tipado Claimed-Once & Standup

### `Completed`
- Elevação completa Python (`pyproject.toml`, `requirements.txt`, `tools/hybrid_router/requirements.txt`, `uv.lock`, `.venv`) com `uv pip check` (253 pacotes) e `uv lock --check` (279 pacotes) aprovados.
- Elevação Frontend/Node (`frontend/package.json`, `package-lock.json`) e deduplicação de `data/npm_cve_acceptances.json` (25 -> 21 IDs únicos) com `npm audit` = `0 vulnerabilities`, `npm run lint`, `npm run typecheck` e `119/119` suítes Jest (`771` testes) aprovadas.
- Saneamento `nucleo/mcp-runtime` -> `tools/mcp-runtime` (`25 CVEs -> 0 CVEs`) e atualização do entrypoint `chrome-devtools-mcp@1.14.0` em `nucleo/nucleo_compartilhado.json` e `config/mcp_gateway.json`.
- Adicionados 2 testes de regressão em `tests/test_sota_deps_roi_2026_11.py` (`15 passed`, `ruff`/`pyright` limpos).
- Memorização registrada em `memoria/HERMES.md` (seção `2026-11-26 (b)`).

### `In Progress`
- Execução dos portões de commit/push (`record_anchor_gate.ps1`, `record_gate.py`, `cwv_gate.ps1`, `suite_verde.py`) e publicação nos remotos `Site` (`origin/master`) e raiz (`origin/main`).

### `Blocked / Failed` (Achados Estruturais para Arbitragem do Tier 0 — não modificados)
1. **Submódulos `skills/*` com CVEs:** `skills/exa-mcp-server` (38 vulns: 26 high, 11 moderate, 1 low), `skills/gemini-supermemory` (9 vulns: 1 critical, 5 high, 3 moderate) e `skills/gemini-deep-research` (2 moderate). Exigem atualização e push nos forks respectivos.
2. **Divergências de núcleo (`sincronizar_nucleo.py --verificar` / `tests/test_nucleo_compartilhado.py`):** 10/11 testes verdes; 1 falha pelas 4 divergências pré-existentes (`vscode`, `antigravity-2.0 config/mcp_config.json`, plugins Hermes `blender (mcp.json)` e `rea (mcp.json)`).
3. **Plugins Antigravity desativados em disco (`config/config.json`):** 15 ativos, 28 desativados (18 diretórios desativados mantidos em disco).
4. **Artefato Rust duplicado:** `frontend/src/components/simulator/panels/Cargo.toml` duplica `wasm-equity/` sem consumo em `scripts/build-wasm.mjs`.
5. **`nucleo/mcp-runtime/gateway-python.json` (`mcp-proxy`):** fixado em `0.12.0` (`uv tool list` tem `0.14.0`, PyPI tem `0.15.0`); preservado intocado para não derrubar o gateway vivo em `:8933`.

### `Key Decisions`
- **`npm install --force` no `Site`:** preserva `node_modules/typescript@6.0.3` (`peer: true`) na raiz para `typescript-eslint@8.74.0` e `frontend/node_modules/typescript@7.0.2` para `tsc` (`--legacy-peer-deps` removia `typescript@6.0.3` e quebrava `eslint`).
- **`persistence-type-changes`:** nenhuma alteração de schema SQLite/DuckDB/Chroma/LanceDB ou variável de ambiente.

### `evidence_CommandOutput`
- `uv pip check && uv lock --check`: exit 0 (`All installed packages are compatible`, 253/279).
- `uv run --no-sync ruff check . && ruff format --check . && pyright --project pyproject.toml`: exit 0 (`723 files already formatted`, `0 errors, 0 warnings`).
- `uv run --no-sync python -m pytest tests/test_sota_deps_roi_2026_11.py --no-cov -o addopts=""`: exit 0 (`15 passed in 8.46s`, 0 warnings).
- `.venv\Scripts\python.exe -m pip_audit --ignore-vuln PYSEC-2026-311 --ignore-vuln PYSEC-2026-3814 --ignore-vuln PYSEC-2026-3815 --ignore-vuln PYSEC-2026-3813`: exit 0 (`No known vulnerabilities found, 5 ignored`).
- `npm --prefix C:\Users\rapha\.gemini\Site audit --audit-level=low && npm run lint && npm run typecheck && npm run test`: exit 0 (`found 0 vulnerabilities`, `119 passed, 771 passed`).
- `cargo check` (`wasm-equity/Cargo.toml` e `core/nexus-core-rust/Cargo.toml`): exit 0.
