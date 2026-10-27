---
id: registro-2026-10-27-harmonizacao-dependencias-ci-e-wasm
tipo: registro
escopo: Site -- Harmonizacao de dependencias mermaid e lockfile CI e sincronizacao de bindings wasm
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-10-27T17:58:00-03:00'
atualizado_em: '2026-10-27T17:58:00-03:00'
commit: HEAD
classes: [interno, medido, governanca, registro, dependencias, wasm, sota]
caminhos:
  - frontend/package.json
  - frontend/public/wasm/vitoi_equity_engine_bg.wasm
  - frontend/src/lib/engine/generated/vitoi_equity_engine.d.ts
  - frontend/src/lib/engine/generated/vitoi_equity_engine.js
  - frontend/src/lib/engine/generated/vitoi_equity_engine_bg.wasm
  - frontend/src/lib/engine/generated/vitoi_equity_engine_bg.wasm.d.ts
  - package-lock.json
  - package.json
  - reports/REGISTRO-2026-10-27-harmonizacao-dependencias-ci-e-wasm.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  python: '3.14.7'
  so: Windows
  session_id: 9f97a4b6-b975-4de1-bda6-8efe243ea918
  session_started_at: '2026-10-27T14:10:00-03:00'
  condutor: Gemini 3.8 Flash <noreply@google.com>
  modelo: gemini-3.8-flash
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-10-27
verificado:
  - "Harmonizacao do override mermaid em package.json para 12.2.0 garantindo paridade com frontend"
  - "Regeneracao integral dos bindings textuais e binarios WASM via scripts/build-wasm.mjs"
  - "Sincronizacao de pacotes de workspace em package-lock.json resolvendo dependencias do mermaid 12 no CI"
  - "Validacao de npm ci --dry-run com zero erros de resolucao de dependencias"
nao_verificado:
  - "Execucao de suite e2e Playwright com navegadores headless completos"
revisoes_de_ancora:
  - registro: handoff-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - package-lock.json
    parecer: >-
      Revisado em 2026-10-27. Lockfile atualizado para resolucao de dependencias do mermaid 12.
  - registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
    parecer: >-
      Revisado em 2026-10-27. Alinhamento de dependencias de workspace e overrides mantidos.
  - registro: 2026-09-22-auditoria-frontend-4-itens
    caminhos:
      - frontend/package.json
    parecer: >-
      Revisado em 2026-10-27. Frontend mantido integro com bindings WASM e mermaid 12.
  - registro: registro-2026-10-05-atlas-cenarios-acessibilidade-e-design-system
    caminhos:
      - frontend/package.json
    parecer: >-
      Revisado em 2026-10-27. Preservadas configuracoes de UI e componentes visuais.
  - registro: registro-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - package-lock.json
    parecer: >-
      Revisado em 2026-10-27. Sincronizacao de lockfile sem impacto no backend.
  - registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
    parecer: >-
      Revisado em 2026-10-27. Dependencias sincronizadas com zero vulnerabilidades.
  - registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
    caminhos:
      - frontend/package.json
      - package-lock.json
    parecer: >-
      Revisado em 2026-10-27. Overrides e lockfile saneados e harmonizados.
  - registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
    parecer: >-
      Revisado em 2026-10-27. Manutencao de zero vulnerabilidades e resolucao completa de arvore npm.
  - registro: registro-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota
    caminhos:
      - package.json
    parecer: >-
      Revisado em 2026-10-27. Harmonizacao do override mermaid 12.2.0 em package.json.
  - registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
    parecer: >-
      Revisado em 2026-10-27. Integracao e compatibilidade CI das dependencias e bindings WASM.
---

# Registro: Harmonizacao de Dependencias CI e Bindings WASM

## 1. Contexto e Diagnostico
No commit anterior de remediacao de seguranca, o job de CI do GitHub Actions apontou:
1. `npm ci` falhando por pacotes transitivos ausentes no lockfile (`@mermaid-js/parser`, `chevrotain`, `elkjs`), decorrentes do override defasado de `mermaid: 11.16.1` na raiz enquanto o `frontend` declarava `12.2.0`.
2. A verificacao de consistencia de WASM (`npm run wasm:build` + `git diff --exit-code`) detectou pequenas variacoes textuais nos bindings gerados pelo `wasm-bindgen`.

## 2. Acoes Executadas
1. Atualizacao do override em `package.json` para `"mermaid": "12.2.0"`.
2. Reexecucao de `npm run wasm:build` regenerando bindings textuais e artefatos WASM sincronizados.
3. Execucao de `npm install --package-lock-only` gerando lockfile completo e validado via `npm ci --dry-run` com sucesso absoluto.
