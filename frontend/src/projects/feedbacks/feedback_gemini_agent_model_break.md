---
name: Gemini quebra model field dos agentes
description: Gemini muda model dos agentes .claude/agents/*.md para strings invalidas - verificar apos cada sessao Gemini
type: feedback
---

Gemini alterou o campo `model` de todos os 15 agentes de `model: sonnet` para `model: sonnet ou gemini-pro 2.5`, quebrando a execucao de todos os subagentes.

**Why:** O campo `model` no frontmatter dos agentes espera um ID de modelo valido (sonnet, opus, haiku), nao uma string descritiva. A Gemini interpretou o campo como texto livre e inseriu sua propria sugestao.

**How to apply:** Apos qualquer sessao da Gemini que toque em `.claude/agents/*.md`, rodar `grep "^model:" .claude/agents/*.md` e verificar que todos os valores sao IDs validos. Corrigir imediatamente se necessario.
