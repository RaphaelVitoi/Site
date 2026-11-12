---
id: registro-2026-11-12-gitignore-history-e-extensions
tipo: registro
escopo: >-
  ".gitignore: adiciona /history/ (diretorio vazio gerado por ferramenta
  externa); snippets/.gitignore: auto-gerado pelo Nexo SQL Studio sharing
  (ignora todo o conteudo da pasta); .vscode/extensions.json: remove a
  recomendacao ms-python.vscode-python-envs (extensao pre-release)"
ecossistema: nexus-sota
autor:
  Devin (SWE-2 Flash)
  <158243242+devin-ai-integration[bot]@users.noreply.github.com>
criado_em: "2026-11-12T13:30:00-03:00"
atualizado_em: "2026-11-12T13:30:00-03:00"
classes:
  - interno
  - medido
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  python: "3.14.9"
  so: Windows
  congelada_em: "2026-11-12"
caminhos:
  - .gitignore
  - .vscode/extensions.json
  - snippets/.gitignore
pendencias_resolvidas: []
revisoes_de_ancora:
  - registro: auditoria-2026-09-22-paridade-config-identidade
    caminhos:
      - .vscode/extensions.json
    parecer: >-
      "Remocao de uma linha de recomendacao (ms-python.vscode-python-envs)
      do extensions.json. Nenhuma extensao obrigatoria ou configuracao de
      workspace alterada; a auditoria de paridade de identidade permanece
      inalterada em substancia."
  - registro: handoff-2026-09-22-paridade-config-identidade
    caminhos:
      - .vscode/extensions.json
    parecer: >-
      "Remocao de uma linha de recomendacao (ms-python.vscode-python-envs)
      do extensions.json. Nenhuma extensao obrigatoria ou configuracao de
      workspace alterada; o handoff de paridade de identidade permanece
      inalterado em substancia."
  - registro: handoff-2026-10-18-expansao-fractal-sota-voice-nexus-e-impacto
    caminhos:
      - .vscode/extensions.json
    parecer: >-
      "Remocao de uma linha de recomendacao (ms-python.vscode-python-envs)
      do extensions.json. Nenhuma extensao obrigatoria ou configuracao de
      workspace alterada; a expansao fractal SOTA/voice-nexus permanece
      inalterada em substancia."
  - registro: 2026-09-22-auditoria-frontend-4-itens
    caminhos:
      - .gitignore
    parecer: >-
      "Adicao de uma linha de ignore (/history/) ao final do .gitignore.
      Nenhuma regra existente alterada ou removida; somente exclusao de
      diretorio vazio gerado por ferramenta externa. Auditoria frontend
      inalterada em substancia."
  - registro: registro-2026-10-19-evolucao-telemetria-mcp-s1-e-benchmark-regime
    caminhos:
      - .gitignore
    parecer: >-
      "Adicao de uma linha de ignore (/history/) ao final do .gitignore.
      Nenhuma regra existente alterada ou removida; somente exclusao de
      diretorio vazio gerado por ferramenta externa. Telemetria/MCP e
      regime de benchmark inalterados."
verificado:
  - "git check-ignore confirma history/ ignorado; git status nao lista mais
    snippets/ apos o commit de snippets/.gitignore"
  - "suite pytest verde na arvore do commit (0 erros, 0 warnings)"
  - "snippets/.gitignore contem apenas regras de auto-ignore do Nexo SQL
    Studio sharing, sem conteudo de usuario"
nao_verificado:
  - "se /history/ voltara a ser populado por ferramenta externa -- o ignore
    cobre o caso; conteudo real exigiria revisao"
---

# Higiene — history/, snippets/ e extensions.json (2026-11-12)

Tres artefatos de higiene encontrados na arvore de trabalho:

- **`history/`** (raiz, vazio): diretorio gerado por ferramenta externa;
  adicionado `/history/` ao `.gitignore`.
- **`snippets/`**: continha apenas um `.gitignore` auto-gerado pelo
  *Nexo SQL Studio sharing* (`/*` + `!/.gitignore`). Commitado para que a
  exclusao fique permanente — o conteudo da pasta segue ignorado.
- **`.vscode/extensions.json`**: removida a recomendacao
  `ms-python.vscode-python-envs` (extensao em pre-release). Nenhuma
  extensao instalada e afetada; a lista de recomendacoes e apenas
  sugestao do editor.
