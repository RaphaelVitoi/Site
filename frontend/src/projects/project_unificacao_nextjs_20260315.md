---
name: Unificacao Next.js e reorganizacao do projeto
description: Migracao completa do site para Next.js, reorganizacao de diretorio, cold storage de tasks, eliminacao de duplicacoes
type: project
---

Site unificado no Next.js (16 + React 19 + Tailwind 4 + Prisma).

**Estrutura canonica pos-reorganizacao:**
- `frontend/` - Projeto Next.js (unica fonte de verdade para o site)
- `frontend/public/legacy/` - HTMLs originais preservados como referencia
- `frontend/public/simulador/` - Motor vanilla JS do simulador ICM (Web Components)
- `content/` - Material educacional futuro (artigos, aulas, pesquisa, interativos)
- `docs/` - Documentacao do sistema (reports, tasks, architecture)
- `scripts/` - Scripts organizados (tests/, init/, utils/, maintenance/)
- `queue/` - Fila de tarefas (tasks.json limpo, archive/ para cold storage)
- Raiz contem apenas kernel operacional (do.ps1, Agent-TaskManager, nexus CLI)

**Rotas Next.js ativas:**
- `/` - Home (Prisma + Suspense)
- `/aula-icm` - Masterclass ICM (Server + Client Component para simulador)
- `/aula-1-2` - Material complementar
- `/leitura-icm` - Whitepaper ICM
- `/psicologia-hs` - Hub de Psicologia (com rota dinamica [slug])
- `/biblioteca` - Biblioteca Epistemica
- `/quem-sou` - Manifesto/Bio (com video 0309.mp4)

**Chico vs Claude:** Chico e o codinome do GitHub Copilot (Gemini). Claude Code opera em paralelo. GLOBAL_INSTRUCTIONS.md e do Chico. .claude/CLAUDE.md e do Claude. Ambos sao usados por Raphael.

**Why:** Projeto tinha duplicacoes massivas, 356 tasks acumuladas, binarios pesados no repo, HTMLs conflitando com Next.js.

**How to apply:** Qualquer novo conteudo vai em content/. Novas paginas sao rotas Next.js em frontend/src/app/. Scripts utilitarios vao em scripts/. Documentacao em docs/.
