---
id: registro-2026-11-12-gitignore-claude-symlinks
tipo: registro
escopo: >-
  ".gitignore: ignora frontend/.claude/ (symlinks de skills gerados por 'npx
  skills add supabase/agent-skills' como ponteiros locais p/ Claude Code); sem o
  ignore, cada commit re-media a suite por 40 arquivos nao rastreados"
ecossistema: nexus-sota
autor:
  Devin (SWE-2 Flash)
  <158243242+devin-ai-integration[bot]@users.noreply.github.com>
criado_em: "2026-11-12T12:35:00-03:00"
atualizado_em: "2026-11-12T12:35:00-03:00"
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
pendencias_resolvidas: []
revisoes_de_ancora:
  - registro: 2026-09-22-auditoria-frontend-4-itens
    caminhos:
      - .gitignore
    parecer: >-
      "Adicao de uma linha de ignore (frontend/.claude/) ao final do .gitignore.
      Nenhuma regra existente alterada ou removida; somente exclusao de
      diretorio de symlinks locais gerado por ferramenta. Auditoria frontend
      inalterada em substancia."
  - registro: registro-2026-10-19-evolucao-telemetria-mcp-s1-e-benchmark-regime
    caminhos:
      - .gitignore
    parecer: >-
      "Adicao de uma linha de ignore (frontend/.claude/) ao final do .gitignore.
      Nenhuma regra existente alterada ou removida; somente exclusao de
      diretorio de symlinks locais gerado por ferramenta. Telemetria/MCP e
      regime de benchmark inalterados."
verificado:
  - "git check-ignore confirma frontend/.claude/skills/supabase SKILL.md
    ignorado; git status nao lista mais os 40 symlinks"
  - "suite pytest verde na arvore ef548f53 (0 erros, 0 warnings; 2 skips
    ambientais pre-existentes: prometheus_client e extra pmev)"
nao_verificado:
  - "se outros diretórios de skills de agentes vao precisar de ignore similar no
    futuro -- tratado caso a caso"
---

# .gitignore — frontend/.claude/ (2026-11-12)

`npx skills add supabase/agent-skills` instalou skills em
`frontend/.agents/skills/` (versionado) e criou symlinks em
`frontend/.claude/skills/` como ponteiros de compatibilidade para Claude Code.
Symlinks não são portáteis no Windows e os 40 arquivos não rastreados forçavam
re-medição da suíte a cada commit. Adicionada exclusão `frontend/.claude/` ao
`.gitignore`; o conteúdo canônico segue versionado em `.agents/`.
