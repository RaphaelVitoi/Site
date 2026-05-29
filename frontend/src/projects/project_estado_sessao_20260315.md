---
name: Estado do projeto 2026-03-15 (atualizado)
description: Snapshot completo do projeto apos duas sessoes de reorganizacao e build validado
type: project
---

## Resumo: projeto reorganizado e build validado

### Build Next.js: PASSA
- Todas as 8 rotas compilam (7 static, 1 dynamic)
- Prisma schema criado (SQLite local, modelo Post)
- Prisma CLI e Client alinhados em v5.22
- Testes inline removidos de icm.ts (import.meta.vitest incompativel sem Vitest)

### Git: 14 commits na branch main
- Branch renomeado de master para main
- node_modules removido do tracking
- .backups/, .next/, dev.db excluidos via .gitignore
- Backup pesado de 743MB deletado (snapshot pre-reorganizacao obsoleto)
- 3 backups leves mantidos (~160KB, registros historicos)

### Estrutura canonica
- frontend/ - Next.js 16 (fonte de verdade)
- content/ - Material educacional futuro
- docs/ - Documentacao
- scripts/ - Scripts organizados (tests/, init/, utils/, maintenance/)
- queue/ - Fila de tarefas + archive/
- Raiz: kernel operacional (do.ps1, Agent-TaskManager, nexus CLI)

### O que foi resolvido nesta sessao (continuacao)
- Build do Next.js testado e corrigido
- scenarios_toygame.js movido para content/interativo/
- README.md reescrito com estrutura real
- .backups/backup_20260314_105419 (743MB) deletado
- Branch master renomeado para main
- node_modules removido do git tracking

### Identidade do sistema
- Chico = GitHub Copilot (Gemini) - GLOBAL_INSTRUCTIONS.md
- Claude Code (Opus) - .claude/CLAUDE.md
- Triade: Raphael (CEO) + @maverick (Vice Intelectual) + Chico (Administrador)
