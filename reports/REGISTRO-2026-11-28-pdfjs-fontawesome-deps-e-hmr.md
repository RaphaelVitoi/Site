---
id: registro-2026-11-28-pdfjs-fontawesome-deps-e-hmr
tipo: registro
escopo: Site -- leitor PDF nativo pdfjs-dist, regeneracao Font Awesome subset, bumps knip/hypothesis e calibracao diaria 2026-11-27
ecossistema: nexus-sota
autor: Gemini 4 Neon <noreply@google.com>
criado_em: '2026-11-28T09:27:00-03:00'
atualizado_em: '2026-11-28T09:27:00-03:00'
commit: HEAD
classes:
- interno
- registro
- frontend
- dependencias
caminhos:
- frontend/package.json
- frontend/public/pdf.worker.min.mjs
- frontend/src/components/files/UniversalDocumentViewer.test.tsx
- frontend/src/components/files/UniversalDocumentViewer.tsx
- frontend/src/styles/fontawesome/fa-solid-900.woff2
- frontend/src/styles/fontawesome/fontawesome-subset.css
- frontend/src/styles/fontawesome/manifest.json
- package-lock.json
- package.json
- pyproject.toml
- reports/REGISTRO-2026-11-28-pdfjs-fontawesome-deps-e-hmr.md
- reports/agent-calibration/daily/2026-11-27.json
- uv.lock
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
- uv lock --check -- Resolved 280 packages in 7ms; hypothesis 6.170.23 instalada no .venv
- uv run --no-sync python -m pytest tests/test_files_ecosystem_api.py -q -- 5 passed in 24.23s, 0 warnings
- uv run --no-sync python frontend/scripts/fontawesome-subset.py -- 150 icones, 9 marcas (fa-solid-900 14 KB)
- npm --workspace frontend run test -- --testPathPatterns="fontawesomeSubset|UniversalDocumentViewer|operator-gateway|operatorProxy" -- 4 suites, 31 passed, 0 errors, 0 warnings
- npm --workspace frontend exec -- eslint --max-warnings=0 src/components/files/UniversalDocumentViewer.tsx src/components/files/UniversalDocumentViewer.test.tsx -- 0 errors, 0 warnings
- npm --workspace frontend run typecheck -- tsc -p tsconfig.audit.json 0 errors
- npm --workspace frontend run build -- 69/69 paginas estaticas em Turbopack
- npm audit --audit-level=high -- found 0 vulnerabilities
nao_verificado:
- Validacao visual ao vivo via CDP :9222 e remocao do loop HMR após commit/reconstrucao limpa de frontend/.next (executada imediatamente após este commit)
- Execucao remota de CI GitHub Actions apos git push
revisoes_de_ancora:
- registro: plan-dependency-boundary-reconciliation-2026-09-01
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: relatorio-fusao-cerebro-claude-quality-gate-2026-09-01
  caminhos:
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: auditoria-cwv-lighthouse-2026-09-01
  caminhos:
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: auditoria-2026-09-02-integridade-do-projeto-e-piso-de-transformers
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: auditoria-2026-10-08-integralidade-backend
  caminhos:
  - pyproject.toml
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: auditoria-2026-10-08-integralidade-frontend
  caminhos:
  - frontend/src/components/files/UniversalDocumentViewer.tsx
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): leitor PDF nativo via pdfjs-dist Canvas + testes Jest (31 passed, 0 warnings). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: handoff-2026-09-10-lint-lighthouse-e-aceite-cve
  caminhos:
  - pyproject.toml
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: handoff-2026-09-13-integracao-de-engines-wasm-e-economia-de-gate
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: handoff-2026-09-19-documentos-loopback-sonar-e-download
  caminhos:
  - frontend/src/components/files/UniversalDocumentViewer.test.tsx
  - frontend/src/components/files/UniversalDocumentViewer.tsx
  - frontend/src/styles/fontawesome/fa-solid-900.woff2
  - frontend/src/styles/fontawesome/fontawesome-subset.css
  - frontend/src/styles/fontawesome/manifest.json
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): leitor PDF nativo via pdfjs-dist Canvas + testes Jest (31 passed, 0 warnings); subconjunto Font Awesome regenerado via fontawesome-subset.py (150 icones, 9 marcas; fontawesomeSubset OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: handoff-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - package-lock.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical); hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: handoff-2026-10-08-remediacao-e-evolucao-frontend
  caminhos:
  - frontend/src/components/files/UniversalDocumentViewer.tsx
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): leitor PDF nativo via pdfjs-dist Canvas + testes Jest (31 passed, 0 warnings). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical); hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: handoff-2026-11-15-translategemma-timesfm-laya-roi
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: handoff-2026-11-21-deps-sota-roi-neon-orchestrator-e-calibracao
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical); hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: handoff-2026-11-21-laya-052-watchdog-711-e-calibracao-seq101
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: handoff-2026-11-22-higgsfield-mcp-deps-e-saneamento-sota
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical); hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: handoff-2026-11-24-laya-053-regex-20261123-schemathesis-4341
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: handoff-2026-11-26-dependencias-sota-mcp-runtime-e-saneamento
  caminhos:
  - frontend/package.json
  - package-lock.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical); hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: handoff-2026-11-28-dashboard-files-ecossistema-cloud
  caminhos:
  - frontend/src/components/files/UniversalDocumentViewer.test.tsx
  - frontend/src/components/files/UniversalDocumentViewer.tsx
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): leitor PDF nativo via pdfjs-dist Canvas + testes Jest (31 passed, 0 warnings). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: plano-laya-integracao-s1s2-pmev-2026-09-20
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-09-02-fast-uri-alto-e-contrato-de-evidencia-pmev
  caminhos:
  - package-lock.json
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-09-07-padronizacao-sistemica-markdownlint
  caminhos:
  - package.json
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-09-09-actionlint-e-a-fronteira-do-submodulo
  caminhos:
  - package.json
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-09-09-prisma-generate-e-o-typecheck-do-ci
  caminhos:
  - package.json
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-09-09-remediacao-dependabot-httpx2
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-09-10-importacao-visivel-hh-hrc
  caminhos:
  - frontend/package.json
  - package-lock.json
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-09-10-publicacao-inputs-mtt
  caminhos:
  - frontend/package.json
  - package-lock.json
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-09-12-teoria-canonica-chen-janda-e-convergencia-cfr
  caminhos:
  - frontend/package.json
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-09-13-ci-typecheck-e-fronteira-de-capacidades
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-09-13-otimizacoes-helpers-antientropia-e-feedback
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical); hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-09-14-auditoria-e-refinamento-settings-e-configuracoes
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-09-14-correcoes-pos-auditoria-handoff-tier-e-dependencias
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-09-18-decisoes-delegadas-sobre-as-pendencias
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-09-18-refinamento-estetico-master-simulator
  caminhos:
  - frontend/src/styles/fontawesome/fa-solid-900.woff2
  - frontend/src/styles/fontawesome/fontawesome-subset.css
  - frontend/src/styles/fontawesome/manifest.json
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): subconjunto Font Awesome regenerado via fontawesome-subset.py (150 icones, 9 marcas; fontawesomeSubset OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-09-19-loopback-e-visualizador-pdf-chrome
  caminhos:
  - frontend/src/components/files/UniversalDocumentViewer.test.tsx
  - frontend/src/components/files/UniversalDocumentViewer.tsx
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): leitor PDF nativo via pdfjs-dist Canvas + testes Jest (31 passed, 0 warnings). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-09-19-universal-document-viewer-e-seguranca-csp-pdf
  caminhos:
  - frontend/src/components/files/UniversalDocumentViewer.test.tsx
  - frontend/src/components/files/UniversalDocumentViewer.tsx
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): leitor PDF nativo via pdfjs-dist Canvas + testes Jest (31 passed, 0 warnings). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: 2026-09-22-auditoria-frontend-4-itens
  caminhos:
  - frontend/package.json
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-09-29-saneamento-lint-e-calibracao
  caminhos:
  - frontend/src/styles/fontawesome/fontawesome-subset.css
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): subconjunto Font Awesome regenerado via fontawesome-subset.py (150 icones, 9 marcas; fontawesomeSubset OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-10-04-remediacao-dependabot-pypdf
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
  caminhos:
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-10-05-atlas-cenarios-acessibilidade-e-design-system
  caminhos:
  - frontend/package.json
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-10-08-auditoria-e-evolucao-frontend
  caminhos:
  - frontend/src/components/files/UniversalDocumentViewer.tsx
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): leitor PDF nativo via pdfjs-dist Canvas + testes Jest (31 passed, 0 warnings). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - package-lock.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical); hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical); hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-10-13-saneamento-diagnosticos-ide-e-compatibilidade
  caminhos:
  - frontend/src/styles/fontawesome/fontawesome-subset.css
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): subconjunto Font Awesome regenerado via fontawesome-subset.py (150 icones, 9 marcas; fontawesomeSubset OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
  caminhos:
  - frontend/package.json
  - package-lock.json
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical); hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota
  caminhos:
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical); hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-10-27-elevacao-dependencias-python-openai-pyspark-pytest
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-10-27-evolucao-project-context-e-reconciliacao-sota
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-10-27-harmonizacao-dependencias-ci-e-wasm
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-10-27-harmonizacao-dependencias-katex-e-ci
  caminhos:
  - frontend/package.json
  - package-lock.json
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical); hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-10-28-atualizacao-laya-e-estabilizacao-playwright-smoke
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-10-31-estabilizacao-lifecycle-warmup-turbopack
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical); hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-03-elevacao-dependencias-pyarrow-openai-anthropic-laya
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-03-otimizacao-agentes-watchdog-e-calibracao
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-03-remediacao-dependabot-pypdf-pyasn1-minimatch
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical); hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-04-otimizacao-layout-header-e-elevacao-dependencias
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
  caminhos:
  - pyproject.toml
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical); hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical); hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-07-elevacao-dependencias-fastapi-regex-types-aiofiles
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-08-elevacao-dependencias-regex-e-laya
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-08-elevacao-polars-2-1-e-consumo-integral-engines-sota
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-08-elevacao-pypdf-7-0-torchvision-e-ecossistema-npm
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical); hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-08-harmonizacao-r-4-6-1-jules-e-saneamento-ancoras
  caminhos:
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-08-integracao-sota-triade-stitch-exa-jules
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-08-otimizacao-pyproject-dependencias-extras-e-reconciliacao
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-08-refinamento-sonarlint-e-code-review-triage
  caminhos:
  - frontend/package.json
  - package.json
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-08-saneamento-code-review-triage
  caminhos:
  - frontend/package.json
  - package.json
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-09-elevacao-dependencias-e-fork-eigen
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical); hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-10-ai-sdk-google-4-0-117-ai-7-0-169
  caminhos:
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-10-bump-deps-e-extra-paths-pylance
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-10-google-genai-3-1-0
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-10-lock-bundle-analyzer-16-4-6
  caminhos:
  - package-lock.json
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-11-elevacao-fastapi-playwright-e-bump-deep-research
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-11-elevacao-pypdf-turbo-ai-sdk-google
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical); hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-11-elevacao-sentence-transformers-genai-prettier-exa-mcp
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical); hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-11-elevacao-typer-types-knip-harmonizacao
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical); hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-11-nota-pareamento-dev-dependency-groups
  caminhos:
  - pyproject.toml
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-12-review-sweeps-endurecimento-sota
  caminhos:
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-13-elevacao-deps-e-saneamento-configs-ide
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical); hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-13-revisao-ancora-pyproject-extra-path-cockpit
  caminhos:
  - pyproject.toml
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical); hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-14-laya-pylint-e-refactors-sonar
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-14-roteamento-pools-transporte-e-validacao-hrc
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-14-sync-uvlock-ollama-cloud-circuit-e-ci
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-16-elevacao-deps-anthropic-laya-accelerate-e-deps-sync
  caminhos:
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical); hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-17-elevacao-deps-google-genai-openai
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-17-fase-2-saneamento-estrutural-frontend
  caminhos:
  - frontend/package.json
  - package-lock.json
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-17-fase-3-backend-estrutural-sota
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-17-fase-5-evolucao-das-forcas-sota
  caminhos:
  - package.json
  - pyproject.toml
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical); hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-17-fases-0-1-portoes-verificacao-e-higiene-doc-real
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical); hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-17-saneamento-deps-lint-typecheck-build
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-18-elevacao-deps-google-genai-regex-turbo
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical); hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-18-elevacao-deps-vitest-typescript-eslint-openai
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical); hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-18-saneamento-sonarlint-pyright-e-deps
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-19-auditoria-evolucao-frontend-sota
  caminhos:
  - frontend/package.json
  - frontend/src/components/files/UniversalDocumentViewer.tsx
  - frontend/src/styles/fontawesome/fa-solid-900.woff2
  - frontend/src/styles/fontawesome/fontawesome-subset.css
  - frontend/src/styles/fontawesome/manifest.json
  - package-lock.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical); hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK); leitor PDF nativo via pdfjs-dist Canvas + testes Jest (31 passed, 0 warnings); subconjunto Font Awesome regenerado via fontawesome-subset.py (150 icones, 9 marcas; fontawesomeSubset OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-21-deps-sota-roi-neon-orchestrator-e-calibracao
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical); hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-21-laya-052-watchdog-711-e-calibracao-seq101
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-22-higgsfield-mcp-deps-e-saneamento-sota
  caminhos:
  - frontend/package.json
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical); hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-24-laya-053-regex-20261123-schemathesis-4341
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-24-overlay-s3776-e-deps-polars-openai-anthropic
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-24-scrypt-sonarlint-codeql-schemathesis-exa
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-24-seguranca-github-codeql-dependabot-knip
  caminhos:
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-25-elevacao-deps-vitest-512-e-calibracao-20261124
  caminhos:
  - package-lock.json
  - package.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical); hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: registro-2026-11-27-harmonizacao-ide-rust-deps-submodulos
  caminhos:
  - frontend/package.json
  - package-lock.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): knip ^6.49.0 e pdfjs-dist ^6.5.438 no lock npm (npm audit 0 CVEs high/critical); hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
- registro: validacao-2026-11-27-omnikernel-v1-1-ab-benchmark
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-28 (Gemini 4 Neon): hypothesis >=6.170.23 em pyproject.toml e uv.lock (uv lock --check OK). Contratos e portoes preservados (next build 69/69 OK, tsc 0 erros).'
---

# REGISTRO — Leitor PDF Nativo (`pdfjs-dist`), Font Awesome Subset, Dependências e Calibração (2026-11-28)

## 1. Alterações Consolidadas

1. **Leitor PDF Nativo em Canvas (`frontend/src/components/files/UniversalDocumentViewer.tsx`, `frontend/public/pdf.worker.min.mjs`, `frontend/package.json`):**
   - Adicionado `pdfjs-dist` (`^6.5.438`) com worker self-hosted em `public/pdf.worker.min.mjs` compatível com `worker-src 'self' blob:` e `withCredentials: true`.
   - `PdfVisualViewer` renderiza páginas em `<canvas>` HiDPI com controles de paginação (`Página X / Y`) e zoom (`60%`–`250%`), cancelamento limpo em desmontagem e fallback interativo para aba `Texto RAG` / `Abrir PDF em Nova Aba`.
2. **Regeneração do Subconjunto Font Awesome (`frontend/src/styles/fontawesome/*`):**
   - Executado `frontend/scripts/fontawesome-subset.py`, incluindo os ícones `fa-bars`, `fa-sitemap`, `fa-chevron-left`, `fa-minus`, `fa-plus` (`150 icones, 9 marcas`).
3. **Alinhamento de Dependências & Evidência Diária:**
   - Inclusão dos bumps pré-existentes no workspace (`package.json` `knip ^6.49.0`, `package-lock.json`, `pyproject.toml` `hypothesis >=6.170.23`, `uv.lock`) e do registro diário `reports/agent-calibration/daily/2026-11-27.json`.
