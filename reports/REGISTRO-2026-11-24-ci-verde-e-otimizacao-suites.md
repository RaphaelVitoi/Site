---
id: registro-2026-11-24-ci-verde-e-otimizacao-suites
tipo: registro
escopo: Site -- correcao integral do SOTA v8.0 GOLD CI/CD Pipeline (Python 3.12/3.13, Frontend WCAG 2.2 AA mobile e Security/Submodules
  gate) e reorganizacao/otimizacao de .husky/pre-commit e scripts/ops/suite_verde.py (ordem fail-fast, skip de sota:audit
  em commits so-doc, --cov-report= enxuto, filtro reports/cwv/ e acao targeted).
ecossistema: nexus-sota
autor: Gemini 4 Hydrogen <noreply@google.com>
criado_em: '2026-11-24T11:00:00-03:00'
atualizado_em: '2026-11-24T11:00:00-03:00'
commit: HEAD
classes:
- interno
- registro
- infraestrutura
- qualidade
- governanca
caminhos:
- .github/workflows/sota-ci.yml
- .husky/pre-commit
- data/a11y_manual_review_baselines.json
- frontend/src/app/(public)/page.tsx
- frontend/src/app/globals.css
- llm/laya_solver_adapter.py
- reports/REGISTRO-2026-11-24-ci-verde-e-otimizacao-suites.md
- scripts/ops/cwv_gate.ps1
- scripts/ops/suite_verde.py
- tests/test_cwv_gate_truthfulness.py
- tests/test_gemma_server_sota.py
- tests/test_suite_verde.py
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
  data_das_medicoes: '2026-11-24'
verificado:
- ruff check e ruff format --check nos arquivos Python editados -- 0 erros, 5 arquivos formatados
- pytest -n 0 (serial) nos 9 arquivos de teste (incluindo os 13 casos que falhavam no CI) -- 100% passed, 0 erros, 0 warnings
- tests/test_suite_verde.py (incluindo novos guards de --cov-report=, reports/cwv/, fail-fast e targeted) -- 100% passed
- actionlint em .github/workflows/sota-ci.yml, chrome-extensions-ci.yml e codeql.yml -- 0 erros
- npm run lint e npm run typecheck -- exit 0 sem erros
nao_verificado:
- Execucao remota de SOTA v8.0 GOLD CI/CD Pipeline apos push para origin/master
referencias_nao_resolviveis: []
revisoes_de_ancora:
- registro: plan-dependency-boundary-reconciliation-2026-09-01
  caminhos:
  - scripts/ops/cwv_gate.ps1
  parecer: Revisado em 2026-11-24. Alteracoes em scripts/ops/cwv_gate.ps1 corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN
    em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE],
    hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py
    (targeted e --cov-report=).
- registro: relatorio-fusao-cerebro-claude-quality-gate-2026-09-01
  caminhos:
  - scripts/ops/cwv_gate.ps1
  parecer: Revisado em 2026-11-24. Alteracoes em scripts/ops/cwv_gate.ps1 corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN
    em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE],
    hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py
    (targeted e --cov-report=).
- registro: auditoria-2026-08-31-integridade-e-integracao-antigravity
  caminhos:
  - frontend/src/app/(public)/page.tsx
  - scripts/ops/cwv_gate.ps1
  - tests/test_cwv_gate_truthfulness.py
  parecer: Revisado em 2026-11-24. Alteracoes em frontend/src/app/(public)/page.tsx, scripts/ops/cwv_gate.ps1, tests/test_cwv_gate_truthfulness.py
    corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter,
    contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos
    no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py (targeted e --cov-report=).
- registro: auditoria-cwv-lighthouse-2026-09-01
  caminhos:
  - frontend/src/app/(public)/page.tsx
  - scripts/ops/cwv_gate.ps1
  - tests/test_cwv_gate_truthfulness.py
  parecer: Revisado em 2026-11-24. Alteracoes em frontend/src/app/(public)/page.tsx, scripts/ops/cwv_gate.ps1, tests/test_cwv_gate_truthfulness.py
    corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter,
    contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos
    no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py (targeted e --cov-report=).
- registro: auditoria-2026-09-01-formatacao-ruff-e-ancoras
  caminhos:
  - .github/workflows/sota-ci.yml
  parecer: Revisado em 2026-11-24. Alteracoes em .github/workflows/sota-ci.yml corrigem as falhas do SOTA CI (isolamento de
    API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com
    com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast)
    + suite_verde.py (targeted e --cov-report=).
- registro: auditoria-2026-09-03-disco-extensao-e-roteador-de-modelo
  caminhos:
  - tests/test_gemma_server_sota.py
  parecer: Revisado em 2026-11-24. Alteracoes em tests/test_gemma_server_sota.py corrigem as falhas do SOTA CI (isolamento
    de API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com
    com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast)
    + suite_verde.py (targeted e --cov-report=).
- registro: auditoria-2026-09-03-trabalho-do-gemini-3-8-flash
  caminhos:
  - tests/test_gemma_server_sota.py
  parecer: Revisado em 2026-11-24. Alteracoes em tests/test_gemma_server_sota.py corrigem as falhas do SOTA CI (isolamento
    de API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com
    com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast)
    + suite_verde.py (targeted e --cov-report=).
- registro: auditoria-2026-09-08-o-que-esta-em-aberto-na-malha
  caminhos:
  - scripts/ops/cwv_gate.ps1
  parecer: Revisado em 2026-11-24. Alteracoes em scripts/ops/cwv_gate.ps1 corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN
    em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE],
    hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py
    (targeted e --cov-report=).
- registro: auditoria-2026-09-12-o-ci-vermelho-que-nenhum-portao-local-media
  caminhos:
  - .github/workflows/sota-ci.yml
  - scripts/ops/suite_verde.py
  - tests/test_suite_verde.py
  parecer: Revisado em 2026-11-24. Alteracoes em .github/workflows/sota-ci.yml, scripts/ops/suite_verde.py, tests/test_suite_verde.py
    corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter,
    contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos
    no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py (targeted e --cov-report=).
- registro: auditoria-2026-09-23-calibracao-terra-e-gate-cwv
  caminhos:
  - data/a11y_manual_review_baselines.json
  - scripts/ops/cwv_gate.ps1
  parecer: Revisado em 2026-11-24. Alteracoes em data/a11y_manual_review_baselines.json, scripts/ops/cwv_gate.ps1 corrigem
    as falhas do SOTA CI (isolamento de API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste
    WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no
    CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py (targeted e --cov-report=).
- registro: auditoria-2026-09-24-laya-multilingual-s1
  caminhos:
  - llm/laya_solver_adapter.py
  parecer: Revisado em 2026-11-24. Alteracoes em llm/laya_solver_adapter.py corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN
    em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE],
    hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py
    (targeted e --cov-report=).
- registro: auditoria-2026-10-02-frontend-sota-subagents
  caminhos:
  - frontend/src/app/globals.css
  parecer: Revisado em 2026-11-24. Alteracoes em frontend/src/app/globals.css corrigem as falhas do SOTA CI (isolamento de
    API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com
    com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast)
    + suite_verde.py (targeted e --cov-report=).
- registro: auditoria-2026-10-08-integralidade-frontend
  caminhos:
  - frontend/src/app/globals.css
  parecer: Revisado em 2026-11-24. Alteracoes em frontend/src/app/globals.css corrigem as falhas do SOTA CI (isolamento de
    API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com
    com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast)
    + suite_verde.py (targeted e --cov-report=).
- registro: handoff-2026-09-09-ci-verde-e-as-seis-causas
  caminhos:
  - .github/workflows/sota-ci.yml
  - scripts/ops/cwv_gate.ps1
  parecer: Revisado em 2026-11-24. Alteracoes em .github/workflows/sota-ci.yml, scripts/ops/cwv_gate.ps1 corrigem as falhas
    do SOTA CI (isolamento de API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG
    AA mobile no CTA TrueICM.com com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e
    otimizam .husky/pre-commit (fail-fast) + suite_verde.py (targeted e --cov-report=).
- registro: handoff-2026-09-09-verde-nos-dois-portoes
  caminhos:
  - scripts/ops/cwv_gate.ps1
  parecer: Revisado em 2026-11-24. Alteracoes em scripts/ops/cwv_gate.ps1 corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN
    em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE],
    hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py
    (targeted e --cov-report=).
- registro: handoff-2026-09-23-auditoria-frontend-backend-e-laya
  caminhos:
  - frontend/src/app/globals.css
  parecer: Revisado em 2026-11-24. Alteracoes em frontend/src/app/globals.css corrigem as falhas do SOTA CI (isolamento de
    API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com
    com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast)
    + suite_verde.py (targeted e --cov-report=).
- registro: handoff-2026-09-23-ci-ram-e-rustfmt-staged
  caminhos:
  - frontend/src/app/(public)/page.tsx
  - frontend/src/app/globals.css
  - scripts/ops/suite_verde.py
  - tests/test_suite_verde.py
  parecer: Revisado em 2026-11-24. Alteracoes em frontend/src/app/(public)/page.tsx, frontend/src/app/globals.css, scripts/ops/suite_verde.py,
    tests/test_suite_verde.py corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN em test_gemma_server_sota, fallback
    S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE], hash canonico LF para a11y baseline,
    resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py (targeted e --cov-report=).
- registro: handoff-2026-09-23-nucleo-mcp-curadoria-codex
  caminhos:
  - scripts/ops/suite_verde.py
  - tests/test_suite_verde.py
  parecer: Revisado em 2026-11-24. Alteracoes em scripts/ops/suite_verde.py, tests/test_suite_verde.py corrigem as falhas
    do SOTA CI (isolamento de API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG
    AA mobile no CTA TrueICM.com com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e
    otimizam .husky/pre-commit (fail-fast) + suite_verde.py (targeted e --cov-report=).
- registro: handoff-2026-09-23-sincronia-editor-calibracao-e-gate
  caminhos:
  - scripts/ops/cwv_gate.ps1
  - tests/test_cwv_gate_truthfulness.py
  parecer: Revisado em 2026-11-24. Alteracoes em scripts/ops/cwv_gate.ps1, tests/test_cwv_gate_truthfulness.py corrigem as
    falhas do SOTA CI (isolamento de API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste
    WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no
    CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py (targeted e --cov-report=).
- registro: handoff-2026-09-24-laya-gpu-homologacao-e-solver-bridge
  caminhos:
  - llm/laya_solver_adapter.py
  parecer: Revisado em 2026-11-24. Alteracoes em llm/laya_solver_adapter.py corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN
    em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE],
    hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py
    (targeted e --cov-report=).
- registro: handoff-2026-09-24-laya-multilingual-s1-integracao
  caminhos:
  - llm/laya_solver_adapter.py
  parecer: Revisado em 2026-11-24. Alteracoes em llm/laya_solver_adapter.py corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN
    em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE],
    hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py
    (targeted e --cov-report=).
- registro: handoff-2026-09-29-contraste-acessibilidade-e-identidade-de-condutor
  caminhos:
  - frontend/src/app/globals.css
  parecer: Revisado em 2026-11-24. Alteracoes em frontend/src/app/globals.css corrigem as falhas do SOTA CI (isolamento de
    API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com
    com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast)
    + suite_verde.py (targeted e --cov-report=).
- registro: handoff-2026-09-30-expurgo-de-modelos-obsoletos-harmonizacao-qwen-e-calibracao
  caminhos:
  - tests/test_gemma_server_sota.py
  parecer: Revisado em 2026-11-24. Alteracoes em tests/test_gemma_server_sota.py corrigem as falhas do SOTA CI (isolamento
    de API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com
    com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast)
    + suite_verde.py (targeted e --cov-report=).
- registro: handoff-2026-10-02-frontend-sota-harmonizacao
  caminhos:
  - frontend/src/app/globals.css
  parecer: Revisado em 2026-11-24. Alteracoes em frontend/src/app/globals.css corrigem as falhas do SOTA CI (isolamento de
    API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com
    com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast)
    + suite_verde.py (targeted e --cov-report=).
- registro: handoff-2026-10-05-fechamento-do-ciclo-medicoes-cwv-e-cacheabilidade
  caminhos:
  - scripts/ops/cwv_gate.ps1
  - scripts/ops/suite_verde.py
  parecer: Revisado em 2026-11-24. Alteracoes em scripts/ops/cwv_gate.ps1, scripts/ops/suite_verde.py corrigem as falhas do
    SOTA CI (isolamento de API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA
    mobile no CTA TrueICM.com com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam
    .husky/pre-commit (fail-fast) + suite_verde.py (targeted e --cov-report=).
- registro: handoff-2026-10-08-remediacao-e-evolucao-frontend
  caminhos:
  - frontend/src/app/globals.css
  parecer: Revisado em 2026-11-24. Alteracoes em frontend/src/app/globals.css corrigem as falhas do SOTA CI (isolamento de
    API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com
    com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast)
    + suite_verde.py (targeted e --cov-report=).
- registro: handoff-2026-11-15-translategemma-timesfm-laya-roi
  caminhos:
  - llm/laya_solver_adapter.py
  parecer: Revisado em 2026-11-24. Alteracoes em llm/laya_solver_adapter.py corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN
    em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE],
    hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py
    (targeted e --cov-report=).
- registro: plano-frentes-abertas-2026-09-08
  caminhos:
  - .github/workflows/sota-ci.yml
  - scripts/ops/cwv_gate.ps1
  parecer: Revisado em 2026-11-24. Alteracoes em .github/workflows/sota-ci.yml, scripts/ops/cwv_gate.ps1 corrigem as falhas
    do SOTA CI (isolamento de API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG
    AA mobile no CTA TrueICM.com com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e
    otimizam .husky/pre-commit (fail-fast) + suite_verde.py (targeted e --cov-report=).
- registro: registro-2026-09-01-bateria-substituta-de-compatibilidade-5-1
  caminhos:
  - scripts/ops/cwv_gate.ps1
  parecer: Revisado em 2026-11-24. Alteracoes em scripts/ops/cwv_gate.ps1 corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN
    em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE],
    hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py
    (targeted e --cov-report=).
- registro: registro-2026-09-01-fronteira-http-e-portao-independente-de-perfil
  caminhos:
  - scripts/ops/cwv_gate.ps1
  parecer: Revisado em 2026-11-24. Alteracoes em scripts/ops/cwv_gate.ps1 corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN
    em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE],
    hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py
    (targeted e --cov-report=).
- registro: registro-2026-09-01-merge-da-fusao-e-autonomia-de-portao
  caminhos:
  - scripts/ops/cwv_gate.ps1
  parecer: Revisado em 2026-11-24. Alteracoes em scripts/ops/cwv_gate.ps1 corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN
    em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE],
    hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py
    (targeted e --cov-report=).
- registro: registro-2026-09-03-cobertura-cve-e-a-fronteira-do-submodulo
  caminhos:
  - scripts/ops/cwv_gate.ps1
  parecer: Revisado em 2026-11-24. Alteracoes em scripts/ops/cwv_gate.ps1 corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN
    em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE],
    hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py
    (targeted e --cov-report=).
- registro: registro-2026-09-04-higienizacao-memoria-e-harmonizacao-fractal
  caminhos:
  - scripts/ops/cwv_gate.ps1
  parecer: Revisado em 2026-11-24. Alteracoes em scripts/ops/cwv_gate.ps1 corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN
    em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE],
    hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py
    (targeted e --cov-report=).
- registro: registro-2026-09-07-procedencia-do-timesfm-e-json-do-cli
  caminhos:
  - tests/test_cwv_gate_truthfulness.py
  parecer: Revisado em 2026-11-24. Alteracoes em tests/test_cwv_gate_truthfulness.py corrigem as falhas do SOTA CI (isolamento
    de API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com
    com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast)
    + suite_verde.py (targeted e --cov-report=).
- registro: registro-2026-09-08-a-fase-3-passa-a-ver-python
  caminhos:
  - scripts/ops/cwv_gate.ps1
  parecer: Revisado em 2026-11-24. Alteracoes em scripts/ops/cwv_gate.ps1 corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN
    em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE],
    hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py
    (targeted e --cov-report=).
- registro: registro-2026-09-08-a-porta-que-responde-e-a-porta-que-mede
  caminhos:
  - scripts/ops/cwv_gate.ps1
  parecer: Revisado em 2026-11-24. Alteracoes em scripts/ops/cwv_gate.ps1 corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN
    em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE],
    hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py
    (targeted e --cov-report=).
- registro: registro-2026-09-08-auditoria-de-tipagem-e-recorte-do-fingerprint
  caminhos:
  - tests/test_cwv_gate_truthfulness.py
  parecer: Revisado em 2026-11-24. Alteracoes em tests/test_cwv_gate_truthfulness.py corrigem as falhas do SOTA CI (isolamento
    de API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com
    com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast)
    + suite_verde.py (targeted e --cov-report=).
- registro: registro-2026-09-08-bindings-wasm-defasados
  caminhos:
  - .github/workflows/sota-ci.yml
  parecer: Revisado em 2026-11-24. Alteracoes em .github/workflows/sota-ci.yml corrigem as falhas do SOTA CI (isolamento de
    API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com
    com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast)
    + suite_verde.py (targeted e --cov-report=).
- registro: registro-2026-09-08-ruff-format-e-o-ci-vermelho
  caminhos:
  - tests/test_cwv_gate_truthfulness.py
  parecer: Revisado em 2026-11-24. Alteracoes em tests/test_cwv_gate_truthfulness.py corrigem as falhas do SOTA CI (isolamento
    de API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com
    com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast)
    + suite_verde.py (targeted e --cov-report=).
- registro: registro-2026-09-09-actionlint-e-a-fronteira-do-submodulo
  caminhos:
  - .github/workflows/sota-ci.yml
  parecer: Revisado em 2026-11-24. Alteracoes em .github/workflows/sota-ci.yml corrigem as falhas do SOTA CI (isolamento de
    API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com
    com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast)
    + suite_verde.py (targeted e --cov-report=).
- registro: registro-2026-09-09-o-axe-mede-extensao-de-navegador
  caminhos:
  - data/a11y_manual_review_baselines.json
  parecer: Revisado em 2026-11-24. Alteracoes em data/a11y_manual_review_baselines.json corrigem as falhas do SOTA CI (isolamento
    de API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com
    com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast)
    + suite_verde.py (targeted e --cov-report=).
- registro: registro-2026-09-09-o-portao-local-passa-a-checar-o-que-o-ci-checa
  caminhos:
  - scripts/ops/cwv_gate.ps1
  parecer: Revisado em 2026-11-24. Alteracoes em scripts/ops/cwv_gate.ps1 corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN
    em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE],
    hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py
    (targeted e --cov-report=).
- registro: registro-2026-09-10-o-encoding-que-matava-a-thread-leitora
  caminhos:
  - tests/test_cwv_gate_truthfulness.py
  parecer: Revisado em 2026-11-24. Alteracoes em tests/test_cwv_gate_truthfulness.py corrigem as falhas do SOTA CI (isolamento
    de API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com
    com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast)
    + suite_verde.py (targeted e --cov-report=).
- registro: registro-2026-09-10-o-portao-que-media-a-tela-de-erro-do-chrome
  caminhos:
  - scripts/ops/cwv_gate.ps1
  parecer: Revisado em 2026-11-24. Alteracoes em scripts/ops/cwv_gate.ps1 corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN
    em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE],
    hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py
    (targeted e --cov-report=).
- registro: registro-2026-09-13-append-em-jsonl-e-suite-em-todos-os-nucleos
  caminhos:
  - scripts/ops/suite_verde.py
  - tests/test_suite_verde.py
  parecer: Revisado em 2026-11-24. Alteracoes em scripts/ops/suite_verde.py, tests/test_suite_verde.py corrigem as falhas
    do SOTA CI (isolamento de API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG
    AA mobile no CTA TrueICM.com com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e
    otimizam .husky/pre-commit (fail-fast) + suite_verde.py (targeted e --cov-report=).
- registro: registro-2026-09-13-cache-da-fase-cve-do-portao
  caminhos:
  - scripts/ops/cwv_gate.ps1
  parecer: Revisado em 2026-11-24. Alteracoes em scripts/ops/cwv_gate.ps1 corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN
    em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE],
    hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py
    (targeted e --cov-report=).
- registro: registro-2026-09-14-benchmark-icm-chipev-em-hand-history-e-next-env
  caminhos:
  - .github/workflows/sota-ci.yml
  parecer: Revisado em 2026-11-24. Alteracoes em .github/workflows/sota-ci.yml corrigem as falhas do SOTA CI (isolamento de
    API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com
    com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast)
    + suite_verde.py (targeted e --cov-report=).
- registro: registro-2026-09-14-saneamento-linter-e-tipagem-tests-e-skills
  caminhos:
  - tests/test_suite_verde.py
  parecer: Revisado em 2026-11-24. Alteracoes em tests/test_suite_verde.py corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN
    em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE],
    hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py
    (targeted e --cov-report=).
- registro: registro-2026-09-18-cache-cve-calado-prs-major-e-maos-arquivadas
  caminhos:
  - scripts/ops/cwv_gate.ps1
  - tests/test_cwv_gate_truthfulness.py
  parecer: Revisado em 2026-11-24. Alteracoes em scripts/ops/cwv_gate.ps1, tests/test_cwv_gate_truthfulness.py corrigem as
    falhas do SOTA CI (isolamento de API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste
    WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no
    CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py (targeted e --cov-report=).
- registro: registro-2026-09-19-refatoracao-sonar-python-e-icm
  caminhos:
  - scripts/ops/suite_verde.py
  parecer: Revisado em 2026-11-24. Alteracoes em scripts/ops/suite_verde.py corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN
    em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE],
    hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py
    (targeted e --cov-report=).
- registro: 2026-09-22-auditoria-frontend-4-itens
  caminhos:
  - scripts/ops/cwv_gate.ps1
  parecer: Revisado em 2026-11-24. Alteracoes em scripts/ops/cwv_gate.ps1 corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN
    em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE],
    hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py
    (targeted e --cov-report=).
- registro: registro-2026-09-23-evolucao-pendencias-laya-e-tarefas
  caminhos:
  - llm/laya_solver_adapter.py
  parecer: Revisado em 2026-11-24. Alteracoes em llm/laya_solver_adapter.py corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN
    em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE],
    hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py
    (targeted e --cov-report=).
- registro: registro-2026-09-23-otimizacao-cache-suite-verde-e-paralelismo
  caminhos:
  - scripts/ops/suite_verde.py
  - tests/test_suite_verde.py
  parecer: Revisado em 2026-11-24. Alteracoes em scripts/ops/suite_verde.py, tests/test_suite_verde.py corrigem as falhas
    do SOTA CI (isolamento de API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG
    AA mobile no CTA TrueICM.com com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e
    otimizam .husky/pre-commit (fail-fast) + suite_verde.py (targeted e --cov-report=).
- registro: registro-2026-09-24-blindagem-ascii-e-harmonizacao-scripts
  caminhos:
  - llm/laya_solver_adapter.py
  parecer: Revisado em 2026-11-24. Alteracoes em llm/laya_solver_adapter.py corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN
    em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE],
    hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py
    (targeted e --cov-report=).
- registro: registro-2026-09-24-laya-gpu-homologacao-e-solver-bridge
  caminhos:
  - llm/laya_solver_adapter.py
  parecer: Revisado em 2026-11-24. Alteracoes em llm/laya_solver_adapter.py corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN
    em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE],
    hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py
    (targeted e --cov-report=).
- registro: registro-2026-09-24-laya-multilingual-s1-integracao
  caminhos:
  - llm/laya_solver_adapter.py
  parecer: Revisado em 2026-11-24. Alteracoes em llm/laya_solver_adapter.py corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN
    em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE],
    hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py
    (targeted e --cov-report=).
- registro: registro-2026-09-25-fechamento-pendencia-ci-ram
  caminhos:
  - scripts/ops/suite_verde.py
  - tests/test_suite_verde.py
  parecer: Revisado em 2026-11-24. Alteracoes em scripts/ops/suite_verde.py, tests/test_suite_verde.py corrigem as falhas
    do SOTA CI (isolamento de API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG
    AA mobile no CTA TrueICM.com com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e
    otimizam .husky/pre-commit (fail-fast) + suite_verde.py (targeted e --cov-report=).
- registro: registro-2026-10-04-http-metrics-correlation-e-worker-shutdown
  caminhos:
  - scripts/ops/cwv_gate.ps1
  - scripts/ops/suite_verde.py
  - tests/test_cwv_gate_truthfulness.py
  parecer: Revisado em 2026-11-24. Alteracoes em scripts/ops/cwv_gate.ps1, scripts/ops/suite_verde.py, tests/test_cwv_gate_truthfulness.py
    corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter,
    contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos
    no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py (targeted e --cov-report=).
- registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
  caminhos:
  - .github/workflows/sota-ci.yml
  parecer: Revisado em 2026-11-24. Alteracoes em .github/workflows/sota-ci.yml corrigem as falhas do SOTA CI (isolamento de
    API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com
    com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast)
    + suite_verde.py (targeted e --cov-report=).
- registro: registro-2026-10-05-atlas-cenarios-acessibilidade-e-design-system
  caminhos:
  - .github/workflows/sota-ci.yml
  parecer: Revisado em 2026-11-24. Alteracoes em .github/workflows/sota-ci.yml corrigem as falhas do SOTA CI (isolamento de
    API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com
    com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast)
    + suite_verde.py (targeted e --cov-report=).
- registro: registro-2026-10-08-auditoria-e-evolucao-frontend
  caminhos:
  - frontend/src/app/globals.css
  parecer: Revisado em 2026-11-24. Alteracoes em frontend/src/app/globals.css corrigem as falhas do SOTA CI (isolamento de
    API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com
    com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast)
    + suite_verde.py (targeted e --cov-report=).
- registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
  caminhos:
  - .husky/pre-commit
  parecer: Revisado em 2026-11-24. Alteracoes em .husky/pre-commit corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN
    em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE],
    hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py
    (targeted e --cov-report=).
- registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
  caminhos:
  - data/a11y_manual_review_baselines.json
  parecer: Revisado em 2026-11-24. Alteracoes em data/a11y_manual_review_baselines.json corrigem as falhas do SOTA CI (isolamento
    de API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com
    com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast)
    + suite_verde.py (targeted e --cov-report=).
- registro: registro-2026-10-18-resolucao-sonarqube-e-saneamento-global
  caminhos:
  - data/a11y_manual_review_baselines.json
  - frontend/src/app/(public)/page.tsx
  - frontend/src/app/globals.css
  - scripts/ops/suite_verde.py
  parecer: Revisado em 2026-11-24. Alteracoes em data/a11y_manual_review_baselines.json, frontend/src/app/(public)/page.tsx,
    frontend/src/app/globals.css, scripts/ops/suite_verde.py corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN
    em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE],
    hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py
    (targeted e --cov-report=).
- registro: registro-2026-10-20-harmonizacao-tier1-e-gemini-38
  caminhos:
  - .husky/pre-commit
  - scripts/ops/suite_verde.py
  - tests/test_suite_verde.py
  parecer: Revisado em 2026-11-24. Alteracoes em .husky/pre-commit, scripts/ops/suite_verde.py, tests/test_suite_verde.py
    corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter,
    contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos
    no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py (targeted e --cov-report=).
- registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
  caminhos:
  - frontend/src/app/globals.css
  parecer: Revisado em 2026-11-24. Alteracoes em frontend/src/app/globals.css corrigem as falhas do SOTA CI (isolamento de
    API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com
    com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast)
    + suite_verde.py (targeted e --cov-report=).
- registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
  caminhos:
  - .husky/pre-commit
  parecer: Revisado em 2026-11-24. Alteracoes em .husky/pre-commit corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN
    em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE],
    hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py
    (targeted e --cov-report=).
- registro: registro-2026-11-01-elevacao-estetica-sota-otimizacao-endpoints-e-reconciliacao
  caminhos:
  - frontend/src/app/(public)/page.tsx
  parecer: Revisado em 2026-11-24. Alteracoes em frontend/src/app/(public)/page.tsx corrigem as falhas do SOTA CI (isolamento
    de API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com
    com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast)
    + suite_verde.py (targeted e --cov-report=).
- registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
  caminhos:
  - .husky/pre-commit
  parecer: Revisado em 2026-11-24. Alteracoes em .husky/pre-commit corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN
    em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE],
    hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py
    (targeted e --cov-report=).
- registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
  caminhos:
  - .github/workflows/sota-ci.yml
  parecer: Revisado em 2026-11-24. Alteracoes em .github/workflows/sota-ci.yml corrigem as falhas do SOTA CI (isolamento de
    API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com
    com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast)
    + suite_verde.py (targeted e --cov-report=).
- registro: registro-2026-11-11-powershell-77-preview-e-perfil-fundido
  caminhos:
  - .husky/pre-commit
  - scripts/ops/cwv_gate.ps1
  parecer: Revisado em 2026-11-24. Alteracoes em .husky/pre-commit, scripts/ops/cwv_gate.ps1 corrigem as falhas do SOTA CI
    (isolamento de API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile
    no CTA TrueICM.com com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam
    .husky/pre-commit (fail-fast) + suite_verde.py (targeted e --cov-report=).
- registro: registro-2026-11-12-cwv-gate-perfil-measure
  caminhos:
  - scripts/ops/cwv_gate.ps1
  parecer: Revisado em 2026-11-24. Alteracoes em scripts/ops/cwv_gate.ps1 corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN
    em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE],
    hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py
    (targeted e --cov-report=).
- registro: registro-2026-11-17-fase-2-saneamento-estrutural-frontend
  caminhos:
  - data/a11y_manual_review_baselines.json
  - frontend/src/app/(public)/page.tsx
  - tests/test_cwv_gate_truthfulness.py
  parecer: Revisado em 2026-11-24. Alteracoes em data/a11y_manual_review_baselines.json, frontend/src/app/(public)/page.tsx,
    tests/test_cwv_gate_truthfulness.py corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN em test_gemma_server_sota,
    fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE], hash canonico LF para
    a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py (targeted e
    --cov-report=).
- registro: registro-2026-11-17-fase-5-evolucao-das-forcas-sota
  caminhos:
  - .github/workflows/sota-ci.yml
  - scripts/ops/suite_verde.py
  parecer: Revisado em 2026-11-24. Alteracoes em .github/workflows/sota-ci.yml, scripts/ops/suite_verde.py corrigem as falhas
    do SOTA CI (isolamento de API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG
    AA mobile no CTA TrueICM.com com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e
    otimizam .husky/pre-commit (fail-fast) + suite_verde.py (targeted e --cov-report=).
- registro: registro-2026-11-17-fases-0-1-portoes-verificacao-e-higiene-doc-real
  caminhos:
  - .github/workflows/sota-ci.yml
  parecer: Revisado em 2026-11-24. Alteracoes em .github/workflows/sota-ci.yml corrigem as falhas do SOTA CI (isolamento de
    API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com
    com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast)
    + suite_verde.py (targeted e --cov-report=).
- registro: registro-2026-11-17-renovacao-baseline-color-contrast-grain
  caminhos:
  - data/a11y_manual_review_baselines.json
  - tests/test_cwv_gate_truthfulness.py
  parecer: Revisado em 2026-11-24. Alteracoes em data/a11y_manual_review_baselines.json, tests/test_cwv_gate_truthfulness.py
    corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter,
    contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos
    no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py (targeted e --cov-report=).
- registro: registro-2026-11-17-suite-verde-loadfile-contra-flake-write-tree
  caminhos:
  - scripts/ops/suite_verde.py
  parecer: Revisado em 2026-11-24. Alteracoes em scripts/ops/suite_verde.py corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN
    em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE],
    hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py
    (targeted e --cov-report=).
- registro: registro-2026-11-19-auditoria-evolucao-frontend-sota
  caminhos:
  - data/a11y_manual_review_baselines.json
  - frontend/src/app/(public)/page.tsx
  - frontend/src/app/globals.css
  parecer: Revisado em 2026-11-24. Alteracoes em data/a11y_manual_review_baselines.json, frontend/src/app/(public)/page.tsx,
    frontend/src/app/globals.css corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN em test_gemma_server_sota,
    fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE], hash canonico LF para
    a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py (targeted e
    --cov-report=).
- registro: registro-2026-11-21-blindagem-ascii-e-saneamento-linters
  caminhos:
  - scripts/ops/suite_verde.py
  parecer: Revisado em 2026-11-24. Alteracoes em scripts/ops/suite_verde.py corrigem as falhas do SOTA CI (isolamento de API_SECRET_TOKEN
    em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com com bg-[#F5F3EE],
    hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast) + suite_verde.py
    (targeted e --cov-report=).
- registro: registro-2026-11-24-seguranca-github-codeql-dependabot-knip
  caminhos:
  - .github/workflows/sota-ci.yml
  parecer: Revisado em 2026-11-24. Alteracoes em .github/workflows/sota-ci.yml corrigem as falhas do SOTA CI (isolamento de
    API_SECRET_TOKEN em test_gemma_server_sota, fallback S1 em LayaSolverAdapter, contraste WCAG AA mobile no CTA TrueICM.com
    com bg-[#F5F3EE], hash canonico LF para a11y baseline, resiliencia de submodulos no CI) e otimizam .husky/pre-commit (fail-fast)
    + suite_verde.py (targeted e --cov-report=).
---
# Registro — Correcao do SOTA CI e Otimizacao de Hooks e Suites

## Sintese

1. **Correcoes do `SOTA v8.0 GOLD CI/CD Pipeline`:**
   - `tests/test_gemma_server_sota.py`: removida poluicao global de `os.environ["API_SECRET_TOKEN"]` na coleta do pytest; substituida por fixture `autouse=True` com `monkeypatch.setattr("engine.gemma_server.API_SECRET_TOKEN", ...)`, eliminando 11 falhas HTTP 401/403 em execucao serial.
   - `llm/laya_solver_adapter.py`: fallback gracioso para `laya_predict` quando `decide_s1(...)` falha em ambiente sem chaves `DECISION_API_*`/checkpoint Laya (corrige HTTP 500 em `handle_pluribus_solve`).
   - `frontend/src/app/(public)/page.tsx` e `frontend/src/app/globals.css`: adicionado `bg-[#F5F3EE]` ao CTA `TrueICM.com` e `background-color: var(--color-light-canvas)` em `.light-page .sota-deferred-section`, eliminando a violacao WCAG 2.2 AA (`color-contrast` 1.15 vs `#0f1729`) no Playwright mobile.
   - `scripts/ops/cwv_gate.ps1`, `tests/test_cwv_gate_truthfulness.py` e `data/a11y_manual_review_baselines.json`: hash SHA-256 canonico normalizado para LF (`\r\n` -> `\n`) independente de CRLF Windows vs LF Linux no CI.
   - `.github/workflows/sota-ci.yml`: `pytest -q -n auto --dist loadfile -o log_cli=false --cov --cov-report=` e inicializacao resiliente por submodulo em `security-and-architecture-gate`.
2. **Reorganizacao e Otimizacao de Hooks e Suites:**
   - `.husky/pre-commit`: ordem fail-fast (`record_anchor_gate.ps1` -> `record_gate.py` -> `sota:audit` apenas quando ha nao-docs em stage -> `suite_verde.py`).
   - `scripts/ops/suite_verde.py`: `--cov-report=` enxuto por padrao, exclusao de artefatos `reports/cwv/` em `nao_rastreados()` e nova acao `targeted` para testes isolados.
