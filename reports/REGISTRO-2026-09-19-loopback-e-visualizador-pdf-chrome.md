---
id: registro-2026-09-19-loopback-e-visualizador-pdf-chrome
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Codex <noreply@openai.com>"
criado_em: '2026-09-19T11:45:37-03:00'
atualizado_em: '2026-09-19T12:04:00-03:00'
classes: [interno, medido, frontend, backend, security, chrome]
caminhos:
  - api/v1/handlers.py
  - api/v1/middleware.py
  - frontend/next.config.js
  - frontend/src/app/api/vitoi/files/view/route.ts
  - frontend/src/components/files/UniversalDocumentViewer.tsx
  - frontend/src/components/files/UniversalDocumentViewer.test.tsx
  - frontend/src/proxy.ts
  - frontend/src/tests/api/operatorProxy.test.ts
  - tests/test_backend_hardening.py
  - reports/REGISTRO-2026-09-19-loopback-e-visualizador-pdf-chrome.md
revisoes_de_ancora:
  - registro: registro-2026-09-19-universal-document-viewer-e-seguranca-csp-pdf
    caminhos: [frontend/next.config.js]
    parecer: >-
      A renderizacao PDF anteriormente declarada nao se sustentava no Chrome Dev
      156: COEP require-corp e a ausencia de frame-src para chrome-extension
      impediam o visualizador nativo. A excecao e agora restrita a superficie de
      documentos, e a CSP continua recusando frames web externos.
  - registro: registro-2026-09-14-saneamento-linters-pmev-e-engines
    caminhos: [frontend/next.config.js]
    parecer: >-
      allowedDevOrigins continua parametrizavel; a CSP acrescenta somente os tres
      hosts loopback e seus esquemas/portas de desenvolvimento.
  - registro: registro-2026-09-13-ci-typecheck-e-fronteira-de-capacidades
    caminhos: [api/v1/middleware.py]
    parecer: >-
      A separacao produto-operador e a autenticacao permanecem inalteradas. CORS
      aceita HTTP/HTTPS somente quando o hostname analisado e localhost,
      127.0.0.1 ou ::1, recusando lookalikes, userinfo, caminhos e portas invalidas.
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  chrome: 'Chrome Dev 156.0.8063.3, perfil User Data - SOTA, CDP 9222'
  data_das_medicoes: 2026-09-19
verificado:
  - backend /health em 127.0.0.1:17042 respondeu HTTP 200
  - CORS refletiu http://localhost:49152 e recusou origens lookalike nos testes
  - Jest dirigido aprovou 2 suites e 18 testes
  - Jest dirigido final aprovou 3 suites e 23 testes
  - suite frontend global aprovou 96 suites e 666 testes
  - portao estatico global aprovou Ruff, Pyright, ESLint e TypeScript sem deteccoes
  - bateria backend dos consumidores alterados aprovou 127 testes sem warning
  - suite Python global aprovou 1603 testes, com 1 teste pulado declarado e nenhuma falha ou warning
  - Chrome real reportou window.crossOriginIsolated=false em /dashboard/files
  - Chrome real carregou duas subframes PDF sem unreachableUrl
  - validacao visual confirmou paginas e miniaturas do PDF incorporado
  - download real no Chrome concluiu com test_tratado_didatico_pmev.pdf, sem UUID
  - PDF e Markdown responderam attachment no download e inline na abertura raw
  - uBlock Origin Lite confirmou localhost, 127.0.0.1 e ::1 em modo sem filtragem
nao_verificado:
  - politica corporativa de maquina e usuario no Registro; ambas recusaram escrita por ACL
  - Stands AdBlocker nao expoe pagina interna controlavel pelo CDP e nao teve allowlist medida
  - CI remoto, pre-commit, pre-push, commit e push nao executados
---

# Loopback controlado e visualizador PDF no Chrome Dev

O defeito visual nao era causado pelo PDF nem pelo endpoint. O navegador estava
configurado para baixar PDFs, e a pagina combinava COEP `require-corp` com CSP sem
`frame-src` para o visualizador interno do Chromium.

O nome UUID observado nos downloads anteriores vinha do comportamento CDP
`allowAndName`, comprovado pelos destinos `playwright-artifacts-*` no historico do
Chrome. O contrato compartilhado do visualizador agora diferencia explicitamente
visualizacao (`inline`) de download (`attachment`) e envia `filename` e
`filename*` para todos os tipos de arquivo. O comportamento normal do Chrome foi
restaurado antes da prova de download; o arquivo novo preservou o nome original.

A correcao preserva autenticacao, X-Frame-Options, frame-ancestors, protecao de
arquivos e CORS para origens externas. A abertura foi limitada a loopback em
qualquer porta valida e aos frames internos necessarios ao PDF.

No perfil Chrome ativo foram adicionadas excecoes para conteudo nao seguro, rede
local, dados do site e cookies para `[*.]localhost`, `127.0.0.1` e `[::1]`; o
Chrome foi configurado para abrir PDFs internamente. A tentativa de gravar as
allowlists corporativas no Registro falhou fechada por ACL e nao foi mascarada.
