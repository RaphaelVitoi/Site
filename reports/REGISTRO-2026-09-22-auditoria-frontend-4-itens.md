---
id: 2026-09-22-auditoria-frontend-4-itens
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: Raphael Vitoi [Tier 0]
criado_em: 2026-09-22
commit: HEAD
classes: [interno, auditoria, frontend]
caminhos:
  - scripts/ops/lighthouse_cwv_audit.mjs
  - scripts/ops/cwv_gate.ps1
  - frontend/src/components/ui/layout/SotaMarkdown.tsx
  - frontend/jest.setup.js
  - frontend/jest.config.js
  - frontend/package.json
  - frontend/playwright.config.ts
  - frontend/tests/visual/
  - .gitignore
  - reports/cwv/latest_lighthouse_production.json
verificado:
  - 'accessibility categoria adicionada a Lighthouse onlyCategories (lighthouse_cwv_audit.mjs:174)'
  - 'Lighthouse accessibility_score extraido no artifact JSON'
  - 'cwv_gate.ps1 Phase 2: LHCI a11y score exibido como fallback quando CDP inativo'
  - 'KaTeX CSS lazy-loaded via useEffect em SotaMarkdown (elimina 374 KiB unused JS)'
  - 'global.Response polyfilled em jest.setup.js para jsdom'
  - "jest.config.js: roots=['<rootDir>/src'] exclui Playwright specs do Jest"
  - '5 testes VRT criados (homepage, simulator, sotaMarkdown) — 5/5 PASS'
  - 'Jest: 670/670 tests pass, 0 console.error em logger.test.ts'
  - 'TSC: 0 errors (frontend/tsconfig.json)'
  - 'VRT full-page homepage: video paused + RAF frozen para screenshot deterministico'
nao_verificado:
  - Percy/Chromatic integration (Playwright VRT foi usado como substituto local)
revisoes_de_ancora: []
supersede: null
---

# Auditoria Frontend SOTA v8.0 GOLD — 4 itens

## Contexto

Auditoria frontend identificou 4 gaps nao-criticos:

1. A11y nao medido no Lighthouse — onlyCategories excluia 'accessibility'
2. 374 KiB de unused JS — katex.min.css carregado globalmente
3. Nenhum teste de regressao visual — Percy/Chromatic ausentes
4. logger.test.ts console.error — jsdom sem Response global

## Resolucoes

### 1. A11y (Lighthouse + axe-core)
- `lighthouse_cwv_audit.mjs`: `onlyCategories` agora inclui `'accessibility'`
- Artifact JSON: `accessibility_score` extraido do report
- `cwv_gate.ps1`: Phase 2 exibe `[LHCI A11Y]` score como fallback independente de CDP

### 2. Bundle (KaTeX lazy-load)
- `SotaMarkdown.tsx`: `import 'katex/dist/katex.min.css'` → `useEffect(() => import(...))`
- Reducao de 374 KiB de CSS nao-usado em paginas sem math

### 3. Regressao Visual (Playwright VRT)
- `@playwright/test` + Chromium instalados como devDependencies
- `playwright.config.ts`: viewport 1920x1080, reducedMotion, animacoes desativadas
- 5 snapshots VRT: homepage-full, hero-section, simulator-page, simulator-header, article-KaTeX
- Estrategia: video pause + RAF override para elementos animados continuos

### 4. Response Polyfill (jest.setup.js)
- `global.Response = Response` — polyfill para jsdom
- logger.test.ts: 0 console.error, 0 warnings
