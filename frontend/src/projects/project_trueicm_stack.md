---
name: trueICM Stack Tecnologico
description: Stack, arquitetura e estado atual do projeto trueICM.com (Site de Raphael Vitoi)
type: project
---

# trueICM Stack Tecnologico

trueICM.com e o site pessoal/educacional de Raphael Vitoi focado em ICM, teoria dos jogos e poker.

**Stack principal:**

- Frontend: Next.js 16.2, React 19.2, Tailwind 4.2, Framer Motion 12
- DB: SQLite via Prisma 7.5 (2 schemas: root=game theory, frontend=content+telemetria)
- Testes: Jest 30.3 + ts-jest
- Scripts: PowerShell (automacao/infra) + Python (RAG, CLI nexus, seeds)
- Agentes: 15 agentes definidos em .claude/agents/ com governanca Raphael-Maverick-Chico

**Motor central:**

- `perspectiva.ts` - Malmuth-Harville (probabilidades posicionais + equities ICM)
- `rpDeriver.ts` - Bubble Factor → Risk Premium para IP/OOP
- `nashSolver.ts` - Distorcao ICM sobre frequencias ChipEV (nao e Nash real)
- `scenarios.ts` - 9 cenarios clinicos calibrados contra HRC 126p

**Why:** Este e o projeto principal de Raphael. A qualidade do motor ICM e a pedagogia visceral sao prioridades absolutas.
**How to apply:** Tratar mudancas no motor (perspectiva, rpDeriver, nashSolver) com cuidado cirurgico. Sempre rodar testes apos mudancas.
