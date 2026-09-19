---
id: registro-2026-09-19-universal-document-viewer-e-seguranca-csp-pdf
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: antigravity@gemini-3.8-flash
criado_em: '2026-09-19T10:05:00-03:00'
atualizado_em: '2026-09-19T10:05:00-03:00'
classes: [interno, medido, frontend, backend, security, governanca]
caminhos:
  - api/v1/handlers.py
  - frontend/next.config.js
  - frontend/src/app/(user)/dashboard/files/page.tsx
  - frontend/src/components/files/UniversalDocumentViewer.tsx
  - frontend/src/components/files/UniversalDocumentViewer.test.tsx
  - frontend/src/lib/server/operator-gateway.ts
  - reports/REGISTRO-2026-09-19-universal-document-viewer-e-seguranca-csp-pdf.md
revisoes_de_ancora:
  - registro: registro-2026-09-19-operador-local-dev-autenticacao
    caminhos:
      - frontend/src/app/(user)/dashboard/files/page.tsx
    parecer: >
      Integracao do componente universal de documentos UniversalDocumentViewer
      em substituicao ao visualizador basico, habilitando renderizacao SOTA
      de PDF, Markdown com KaTeX e Mermaid, Word/Office editorial, Codigo com
      regua de linhas e Planilhas interativas.
  - registro: registro-2026-09-18-saneamento-geral-de-linters-e-gate-remocao-citada
    caminhos:
      - api/v1/handlers.py
    parecer: >
      Calibracao de politica CSP no backend para servir arquivos PDF com
      object-src e default-src seguros sem sandbox bloqueante para plugins nativos,
      preservando sandbox estrito para arquivos SVG (BK-19).
  - registro: registro-2026-09-14-saneamento-linters-pmev-e-engines
    caminhos:
      - frontend/next.config.js
    parecer: >
      Ajuste dos cabecalhos globais para permitir incorporacao de objetos e frames
      da mesma origem (frame-ancestors 'self', X-Frame-Options SAMEORIGIN e object-src
      'self' data: blob:) para viabilizar visualizadores de documentos nativos em todo o website.
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  host: Windows 11 Pro, Python 3.12+ (.venv), Node.js v22+
  data_das_medicoes: 2026-09-19
verificado:
  - backend handle_view_file servindo PDF com CSP compativel com visualizadores nativos
  - backend handle_view_file preservando sandbox estrito para SVG e arquivos executaveis
  - operador gateway repassando content-disposition original
  - frontend next.config.js com frame-ancestors 'self' e X-Frame-Options SAMEORIGIN
  - componente UniversalDocumentViewer implementado com cobertura universal de PDF, Markdown, Word, Codigo e Planilhas
  - renderizacao rica de Markdown com KaTeX e diagramacao Mermaid validada
  - modo leitor editorial para DOCX com metricas de palavras e tempo estimado de leitura
  - visualizador de codigo com regua de numeracao lateral de linhas e toggle de quebra
  - suite de testes unitarios Jest UniversalDocumentViewer.test.tsx aprovada com 9/9 testes verdes
  - suite de testes pytest test_backend_hardening.py aprovada com 26/26 testes verdes
  - suite de testes pytest test_fronteira_produto_operador.py aprovada com 24/24 testes verdes
  - validacao visual no Chrome via CDP em /dashboard/files com renderizacao confirmada
nao_verificado:
  - testes em navegadores WebKit/Safari legado
---

# Registro de Implementacao do UniversalDocumentViewer e Seguranca de Documentos

## Contexto e Motivacao
A exibicao de documentos tecnicos no ecossistema (tratados didaticos PMev, relatorios, codigo-fonte, especificacoes Markdown e planilhas) carecia de um formatador e visualizador de alta densidade e universalmente disponivel para todo o website. Adicionalmente, politicas de Content-Security-Policy (CSP) com `sandbox; default-src 'none'` e cabecalhos de frame bloqueantes (`X-Frame-Options: DENY` e `frame-ancestors 'none'`) bloqueavam os recursos embutidos no navegador.

## Solucao Implementada
1. **Calibracao de Seguranca de Origem e CSP:**
   - Em `api/v1/handlers.py`, arquivos PDF sao servidos com `Content-Disposition: inline; filename="..."` e politica CSP permitindo objetos da mesma origem (`default-src 'self' data: blob:; object-src 'self' data: blob:; script-src 'none'; style-src 'unsafe-inline';`), mantendo o isolamento estrito via `sandbox` para arquivos SVG (BK-19).
   - Em `frontend/next.config.js`, os cabecalhos globais foram ajustados para `frame-ancestors 'self'`, `X-Frame-Options: SAMEORIGIN` e `object-src 'self' data: blob:`, assegurando protecao total contra clickjacking externo enquanto viabilizam a renderizacao interna de documentos no proprio website.
   - Em `frontend/src/lib/server/operator-gateway.ts`, o cabecalho `content-disposition` e preservado para que o navegador reconheca o nome e modalidade de visualizacao do arquivo.

2. **Componente Modular UniversalDocumentViewer:**
   - Criado em `frontend/src/components/files/UniversalDocumentViewer.tsx`, pronto para ser utilizado em qualquer pagina ou modal do site.
   - **PDF:** Visualizador embutido com fallback, barra superior com botoes "Abrir Raw" e "Baixar", e aba "Texto RAG" com tipografia nítida, contagem de palavras, estimativa de tempo de leitura e busca interna com highlight.
   - **Markdown (.md):** Renderizacao formatada com o componente canonico `SotaMarkdown` (KaTeX matematico, tabelas GFM, headings interativos e suporte a Mermaid sob demanda), alem de aba com codigo-fonte raw.
   - **Documentos Word/Office (.docx, .doc, .odt):** Modo Leitor Editorial de alta densidade (estilo Notion/Medium), com controles de tamanho de fonte e busca textual.
   - **Codigo e Configuracao (.py, .ts, .json, .yaml, .sql):** Visualizador com regua de numeracao lateral de linhas, contagem total de linhas e caracteres, botao de copia com feedback visual e toggle de quebra de linha.
   - **Planilhas (.csv, .xlsx):** Tabela interativa com busca rapida em tempo real e grafico de barras para series numericas.
