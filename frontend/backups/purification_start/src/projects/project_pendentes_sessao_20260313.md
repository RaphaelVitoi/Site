---
name: Pendentes da auditoria completa 2026-03-13
description: Itens identificados na analise total do sistema - maioria resolvida em 2026-03-15
type: project
---

Auditoria completa do sistema feita em 2026-03-13. 13 correcoes executadas, 6 itens pendentes.

**Why:** Sessao atingiu limite de contexto antes de resolver tudo.
**How to apply:** Apenas o item 6 continua pendente (baixa prioridade).

## Status dos Pendentes (atualizado 2026-03-15)

1. ~~**Identidade CHICO**~~ - RESOLVIDO. Modelo = Gemini 3.1 Pro Preview + Claude Opus 4.6 (dupla dinamica, ambos Pro). Sincronizado em: GLOBAL_INSTRUCTIONS.md (raiz + .claude/), project-context.md, pesquisador/MEMORY.md, auditor/MEMORY.md, MANUAL_WORKFLOW_AGENTES.md.

2. ~~**Branch git**~~ - RESOLVIDO. Ja estava em `main` (local e remote).

3. ~~**README.md**~~ - RESOLVIDO. Ja tinha conteudo (gerado na sessao anterior).

4. ~~**@dispatcher duplicado**~~ - RESOLVIDO. Removida linha duplicada da tabela em GLOBAL_INSTRUCTIONS.md (raiz).

5. ~~**Backups antigos**~~ - RESOLVIDO. Removidos: 2026-03-08_aula-icm-rp, 2026-03-12_auditoria_sistema, 2026-03-12_limpeza_obsoletos. Mantidos: aula-icm-rp_stable_20260313, backup_20260315_*.

6. **Tailwind vs CSS custom** - PENDENTE (baixa prioridade). aula-icm.html usa Tailwind CDN, resto usa style.css. Funciona mas inconsistente. Consolidar requer refatoracao significativa.

## Ja feito (sessoes 2026-03-13 + 2026-03-15)

- style.css: --font-mono adicionada
- sitemap.xml: 1 -> 6 URLs
- Meta descriptions: psicologia-hs.html, aula-1-2.html
- Video tags: preload=metadata em index.html, quem-sou.html
- Canonical links: todas as 6 paginas
- Open Graph: index.html
- .claude/GLOBAL_INSTRUCTIONS.md: copiado da raiz
- DISTRIBUTION_MATRIX.md: ref validate-queue corrigida
- intents.json: 3 -> 14 mapeamentos
- logs/: task_log.md e tasks_archived.json movidos para la
- Removidos: 10 arquivos mortos + docs/oracleJdk-25/ (650MB) + 3 backups obsoletos
- Modelo CHICO sincronizado (dupla Gemini 3.1 Pro + Claude Opus 4.6)
- @dispatcher duplicado removido
