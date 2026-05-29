---
name: Prompt de Continuidade V15
description: Auditoria Gemini + alinhamento 15 agentes. Build OK. Git limpo. Proximo P1 produto ou P3 deploy.
type: project
---

# Prompt de Continuidade V15 (2026-03-21)

## O que foi feito (sessao atual)

### Commit: Auditoria e alinhamento (89143bb)
- Deletados 7 fantasmas 0-byte (cognitive.py, config.py raiz, geometria_texto.txt, cleanup_redundant_tests.ps1, validate_full_compliance.ps1, engine/page.tsx fora de rota, scripts/ops/task_executor.py deprecado)
- Corrigidos 2 bugs criticos em task_executor.py: typo rSYSTEM_CONFIG (NameError), dead code return fora de funcao (SyntaxError)
- Removidos 6 imports mortos do task_executor.py + aiosqlite do queue_manager.py
- Movido audit_api_security.ps1 raiz -> scripts/routines/
- Alinhados 13 docs + 4 memorias: 17 -> 15 agentes (@planner -> @architect, @sequenciador -> task_executor.py)
- Deletados agentes orfaos: sequenciador.md (vazio), planner/MEMORY.md, sequenciador/MEMORY.md

### Sessao anterior (V14)
- P2 Higiene: ChromaDB removido do tracking (-734MB), 3x 0309.mp4 (-57MB)
- .gitignore, .cursorules, .clauderules atualizados
- npm uninstall html2canvas, jspdf, zustand
- Sincronizacao global: 86 obsoletos removidos, 65 novos adicionados, 161 atualizados

## Estado atual
- **Build:** OK (22 static + dynamic, zero erros)
- **Git:** limpo (0 mudancas pendentes, commit 89143bb)
- **Agentes:** 15 (6 linear + 4 consultivos + 2 super + 2 operacionais + 1 entrada)
- **Docs:** Todos alinhados a realidade de 15 agentes. Zero referencia morta em docs operacionais.

## Achados da auditoria Gemini (nao corrigidos, flag para futuro)
- task_executor.py e monolitico (1440 linhas) com duplicacao massiva vs engine/, database/, core/
- icm.ts tem ~160 linhas de codigo comentado (versoes abandonadas)
- seed_content.ts pode ser morto (placeholders "em fase de transposicao")
- Duplicacao de nashSolver.test.ts (engine/ e __tests__/) - ambos validos, coberturas diferentes

## Proximo (por prioridade)
1. **P1 - Produto:** Homepage evolution, paineis orfaos no MasterSimulator (AICoachPanel, RangeMatrix), unificar CodeBlock
2. **P3 - Deploy:** Vercel (casa limpa, pronto)
3. **P2 residual:** .backups_sota/ (266MB no disco, nao no git)
4. **PKO feature:** Deprioritizada por Raphael ("vamos deixar por ultimo")

## Stack confirmada
Next.js 16, React 19, TypeScript 5.9, Tailwind 4, Prisma 5, SQLite, Python (task_executor + ChromaDB RAG)

## Nota operacional
- Agentes com subagent_type "implementor" falham por modelo invalido (google/gemini-flash-1.5). Usar agente generico (sem subagent_type) para edicoes.
