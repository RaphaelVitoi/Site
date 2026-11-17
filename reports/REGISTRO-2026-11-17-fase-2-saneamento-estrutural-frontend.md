---
id: registro-2026-11-17-fase-2-saneamento-estrutural-frontend
tipo: registro
escopo: "Site/frontend -- Fase 2 da auditoria SOTA: Supabase residual, deps de lint declaradas, RSC nas paginas editoriais, CSP connect-src, skeleton do simulador"
ecossistema: nexus-sota
autor: "Devin (SWE-2 Flash) <158243242+devin-ai-integration[bot]@users.noreply.github.com>"
criado_em: "2026-11-17T14:20:00-03:00"
atualizado_em: "2026-11-17T14:20:00-03:00"
commit: HEAD
classes:
  - interno
  - medido
  - frontend
  - registro
  - seguranca
  - dependencias
caminhos:
  - frontend/.env.example
  - frontend/next.config.js
  - frontend/package.json
  - package-lock.json
  - frontend/src/app/(lab)/simulador/MasterSimulatorLoader.tsx
  - frontend/src/app/(public)/page.tsx
  - frontend/src/app/(public)/quem-sou/page.tsx
  - frontend/src/components/home/DownwardDriftWidget.tsx
  - frontend/src/components/home/HomeVideo.tsx
  - frontend/src/components/home/ModuleExplorer.tsx
  - frontend/src/components/home/QuemSouVideo.tsx
  - tests/test_cwv_gate_truthfulness.py
  - reports/threat-modeling/pmev-site.tc.json
  - data/a11y_manual_review_baselines.json
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  condutor: Devin (SWE-2 Flash)
  veiculo: devin-desktop
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-11-17
verificado:
  - "typecheck (tsc -p tsconfig.audit.json): 0 erros apos remocao de mesh-router.ts e refatoracao RSC"
  - "eslint .: limpo com as 4 deps de lint agora declaradas em devDependencies"
  - "jest: 111 suites / 743 testes PASS"
  - "SSR real medido em dev: / contem hero, module-tab-1..5, videos e secoes; /quem-sou contem secoes e video"
  - "CSP connect-src restrita; inventario provou zero fetch/WebSocket client-side externo"
  - "Supabase: zero referencias restantes em src/ e package.json"
nao_verificado:
  - "MasterSimulator.tsx (821 ln) nao decomposto — useMemo de lentes com ~60 deps, risco sem teste visual"
  - "Header/Footer e biblioteca seguem 'use client' (fora do nucleo editorial)"
  - "CSP nova validada so em dev; confirmar no proximo deploy"
referencias_nao_resolviveis:
  - frontend/src/app/(auth)/callback/route.ts
  - frontend/src/utils/supabase/client.ts
  - frontend/src/utils/supabase/server.ts
  - frontend/src/lib/ai/mesh-router.ts
revisoes_de_ancora:
  - registro: auditoria-2026-08-31-integridade-e-integracao-antigravity
    caminhos:
      - frontend/src/app/(public)/page.tsx
      - tests/test_cwv_gate_truthfulness.py
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: auditoria-2026-09-23-calibracao-terra-e-gate-cwv
    caminhos:
      - data/a11y_manual_review_baselines.json
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: handoff-2026-09-19-documentos-loopback-sonar-e-download
    caminhos:
      - frontend/next.config.js
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: handoff-2026-09-23-ci-ram-e-rustfmt-staged
    caminhos:
      - frontend/src/app/(public)/page.tsx
      - frontend/src/app/(public)/quem-sou/page.tsx
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: handoff-2026-09-23-sincronia-editor-calibracao-e-gate
    caminhos:
      - tests/test_cwv_gate_truthfulness.py
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: handoff-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - data/npm_cve_acceptances.json
      - package-lock.json
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
    caminhos:
      - frontend/package.json
      - package-lock.json
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-09-02-fast-uri-alto-e-contrato-de-evidencia-pmev
    caminhos:
      - package-lock.json
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-09-07-procedencia-do-timesfm-e-json-do-cli
    caminhos:
      - tests/test_cwv_gate_truthfulness.py
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-09-08-auditoria-de-tipagem-e-recorte-do-fingerprint
    caminhos:
      - tests/test_cwv_gate_truthfulness.py
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-09-08-ruff-format-e-o-ci-vermelho
    caminhos:
      - tests/test_cwv_gate_truthfulness.py
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-09-09-o-axe-mede-extensao-de-navegador
    caminhos:
      - data/a11y_manual_review_baselines.json
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-09-10-o-encoding-que-matava-a-thread-leitora
    caminhos:
      - tests/test_cwv_gate_truthfulness.py
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-09-14-saneamento-linters-pmev-e-engines
    caminhos:
      - frontend/next.config.js
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-09-18-cache-cve-calado-prs-major-e-maos-arquivadas
    caminhos:
      - tests/test_cwv_gate_truthfulness.py
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-09-19-loopback-e-visualizador-pdf-chrome
    caminhos:
      - frontend/next.config.js
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-09-19-universal-document-viewer-e-seguranca-csp-pdf
    caminhos:
      - frontend/next.config.js
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: 2026-09-22-auditoria-frontend-4-itens
    caminhos:
      - frontend/package.json
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-10-04-http-metrics-correlation-e-worker-shutdown
    caminhos:
      - data/npm_cve_acceptances.json
      - tests/test_cwv_gate_truthfulness.py
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-10-05-atlas-cenarios-acessibilidade-e-design-system
    caminhos:
      - frontend/package.json
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - data/npm_cve_acceptances.json
      - package-lock.json
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
    caminhos:
      - frontend/package.json
      - package-lock.json
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
    caminhos:
      - data/a11y_manual_review_baselines.json
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-10-18-resolucao-sonarqube-e-saneamento-global
    caminhos:
      - data/a11y_manual_review_baselines.json
      - frontend/src/app/(public)/page.tsx
      - frontend/src/app/(public)/quem-sou/page.tsx
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-10-19-refinamento-sota-frontend-header-layout-e-surface
    caminhos:
      - frontend/next.config.js
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
    caminhos:
      - data/npm_cve_acceptances.json
      - frontend/package.json
      - package-lock.json
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
    caminhos:
      - frontend/package.json
      - package-lock.json
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-10-27-harmonizacao-dependencias-ci-e-wasm
    caminhos:
      - frontend/package.json
      - package-lock.json
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-10-27-harmonizacao-dependencias-katex-e-ci
    caminhos:
      - frontend/package.json
      - package-lock.json
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
    caminhos:
      - frontend/package.json
      - package-lock.json
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
    caminhos:
      - data/npm_cve_acceptances.json
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-11-01-elevacao-estetica-sota-otimizacao-endpoints-e-reconciliacao
    caminhos:
      - frontend/src/app/(public)/page.tsx
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-11-03-remediacao-dependabot-pypdf-pyasn1-minimatch
    caminhos:
      - package-lock.json
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
    caminhos:
      - package-lock.json
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-11-07-otimizacao-ux-portao-registro-e-congelamento-medicoes
    caminhos:
      - reports/REGISTRO-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules.md
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-11-08-refinamento-sonarlint-e-code-review-triage
    caminhos:
      - frontend/package.json
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-11-08-saneamento-code-review-triage
    caminhos:
      - frontend/package.json
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-11-09-elevacao-dependencias-e-fork-eigen
    caminhos:
      - package-lock.json
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-11-10-ai-sdk-google-4-0-117-ai-7-0-169
    caminhos:
      - package-lock.json
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-11-10-lock-bundle-analyzer-16-4-6
    caminhos:
      - package-lock.json
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-11-11-elevacao-pypdf-turbo-ai-sdk-google
    caminhos:
      - package-lock.json
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-11-11-elevacao-sentence-transformers-genai-prettier-exa-mcp
    caminhos:
      - package-lock.json
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-11-11-elevacao-typer-types-knip-harmonizacao
    caminhos:
      - package-lock.json
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-11-12-pendencia-key-pools-resolvida
    caminhos:
      - reports/HANDOFF-2026-11-10-model-line-consolidation.md
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-11-12-review-sweeps-endurecimento-sota
    caminhos:
      - package-lock.json
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-11-13-elevacao-deps-e-saneamento-configs-ide
    caminhos:
      - package-lock.json
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
    caminhos:
      - package-lock.json
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-11-17-fases-0-1-portoes-verificacao-e-higiene-doc-real
    caminhos:
      - package-lock.json
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."
  - registro: registro-2026-11-17-renovacao-baseline-color-contrast-grain
    caminhos:
      - data/a11y_manual_review_baselines.json
      - tests/test_cwv_gate_truthfulness.py
    parecer: "Revisado em 2026-11-17. Fase 2 da auditoria SOTA do frontend: Supabase residual removido, deps de lint declaradas, paginas editoriais em RSC com ilhas client, CSP connect-src restrita, skeleton do simulador, mesh-router.ts removido, aceite Tier 0 picomatch dev-only, threat model e baseline a11y re-sincronizados apos refatoracao. Sem alteracao dos contratos ancorados."

---

# REGISTRO — Fase 2 da auditoria SOTA: saneamento estrutural do frontend

## Contexto

Segunda fase do plano de auditoria aprovado pelo Tier 0. Escopo: debitos
estruturais do frontend Next.js — codigo morto, dependencias nao declaradas,
boundary client-side excessiva nas paginas editoriais, CSP permissiva e
esqueleto de carregamento do simulador.

## O que mudou

### 2.1 Supabase residual removido

- `frontend/src/app/(auth)/callback/route.ts` — route handler do fluxo Supabase Auth
  (troca `code` por sessao). Morto: a auth vigente e Auth.js/next-auth
  (`(auth)/login` usa `LoginContent` + `signIn`), e nada na arvore importa
  `utils/supabase` ou navega para `/callback`.
- `frontend/src/utils/supabase/client.ts` e `frontend/src/utils/supabase/server.ts` — clients SSR do Supabase, sem
  consumidor.
- `@supabase/ssr` + `@supabase/supabase-js` removidos de
  `frontend/package.json`; secao SUPABASE retirada de `.env.example`
  (`.env.local` e gitignored — variaveis mortas locais nao versionadas).
- `package-lock.json` regenerado (-9 pacotes na arvore supabase).

### 2.2 Dependencias de lint declaradas

`eslint.config.mjs` importa diretamente `typescript-eslint`,
`@next/eslint-plugin-next`, `eslint-plugin-react` e
`eslint-plugin-react-hooks` — todos resolvidos por hoisting via
`eslint-config-next`, nunca declarados. Declarados em devDependencies nas
mesmas versoes ja instaladas (8.67.0 / 16.4.6 / 7.37.5 / 7.1.1). `npm run
lint` verde apos a declaracao.

### 2.3 Paginas editoriais viraram RSC com ilhas client

- `frontend/src/app/(public)/page.tsx` (970 ln): era `'use client'` monolitico.
  Agora e Server Component; a interatividade virou tres ilhas em
  `frontend/src/components/home/`: `HomeVideo` (autoplay + fade), `ModuleExplorer`
  (tabs da ementa com teclado) e `DownwardDriftWidget` (slider RP).
- `frontend/src/app/(public)/quem-sou/page.tsx` (479 ln): idem, com `QuemSouVideo`.
- Verificado em dev: HTML inicial contem hero, ementa (module-tab-1..5),
  videos e secoes — SSR real, nao so shell.

### 2.4 Skeleton do simulador

`/simulador` ja era RSC com `MasterSimulatorLoader` (`ssr:false` no
orquestrador pesado, por design WASM/worker). O fallback "Sincronizando..."
virou `SimulatorSkeleton` com a silhueta do cockpit (nav + grid 6/6).

### 2.5 CSP connect-src restrita

De `'self' https: http://localhost:* http://127.0.0.1:* ws: wss:` para
`'self' http://localhost:* http://127.0.0.1:* ws://localhost:*
ws://127.0.0.1:*`. Medido antes: zero `fetch`/`WebSocket`/`EventSource`
client-side para fora da origem (unicos `https://` em client components sao
hrefs de share/redes; o fetch OpenRouter mora em route handler server-side).
`ws://` permanece so no loopback para o HMR do `next dev`.

### Codigo morto removido na passagem

`frontend/src/lib/ai/mesh-router.ts` (113 ln): zero importadores; dependia de
`ai`/`@ai-sdk/google` resolvidos por hoisting do package.json raiz —
exatamente o padrao que a Fase 1 desfez. Em vez de declarar deps para codigo
morto, o arquivo saiu.

## Aceite de CVE (autorizacao Tier 0)

O pre-commit reprovou em `sota:audit` por advisory novo de `picomatch`
(GHSA-fc5q-39xc-vjpf, ReDoS) publicado entre os dois commits da fase — a
medicao anterior usava cache CVE de 0,7h. Medido: 100% devDependencies,
`npm audit --omit=dev` = 0, picomatch 4.0.7 (latest) tambem vulneravel,
sem versao corrigida. O Tier 0 (Raphael Vitoi) autorizou nesta sessao o
aceite `picomatch-redos-dev-tooling-20261117` em
`data/npm_cve_acceptances.json`, mesmo padrao do aceite `braces` — com
`expira_se` e `revisar_em` declarados.

### Ajustes exigidos pelos guardas executaveis

- `tests/test_cwv_gate_truthfulness.py`: o teste do backdrop do rotulo de
  corte apontava para page.tsx; o SVG migrou para
  `frontend/src/components/home/DownwardDriftWidget.tsx` — ponteiro do
  teste atualizado (invariante inalterada, conteudo verbatim).
- `reports/threat-modeling/pmev-site.tc.json`: premissa 3 reescrita —
  Supabase nao e mais "usado so para auth", foi removido; evidencia
  atualizada para o REGISTRO da fase e a pagina de login Auth.js.
- `data/a11y_manual_review_baselines.json`: sha256 de page.tsx re-vinculado
  apos re-aprovacao Tier 0 nesta sessao (elementos revisados identicos,
  copiados verbatim para as ilhas client).

## Nao verificado / limites

- `MasterSimulator.tsx` (821 ln) NAO foi decomposto nesta fase: o orquestrador
  ja e hook-decomposed e o `useMemo` de lentes carrega ~60 dependencias —
  decomposicao cega sem teste visual de regressao e risco desproporcional.
  Fica como pendencia explicita da Fase 3/5.
- Header/Footer e paginas da biblioteca seguem `'use client'` — conversao
  avaliada como fora do nucleo editorial de maior valor.
- CSP nova so foi validada em dev; o proximo deploy deve confirmar que nenhum
// fluxo legitimo dependia de `https:` em connect-src.

## Revisoes de ancora

36 registros vigentes declaram `caminhos:` tocados neste commit
(`package.json`, `package-lock.json`). Reconciliados via
`revisoes_de_ancora` neste mesmo commit.
