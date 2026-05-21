---
name: Prompt de Continuidade V47 - 2026-03-28
description: Auditoria frontend completa -- rotas, deps, Prisma+Turbopack, estética Geometria do Risco, limpeza de orphans.
type: project
---

# Prompt de Continuidade V47 -- 2026-03-28

## Commit desta sessão
| Hash | Descrição |
|------|-----------|
| `21c57d3` | fix: auditoria frontend -- rotas, deps, estética e Prisma |

## O que foi feito

### Auditoria de integridade (pré-trabalho)
- Arquivo `"et --hardgit reset --hard 83b49cc"` deletado da raiz (artefato de comando acidental)
- `PerspectivePanel.tsx` legado (137 linhas, sem 'use client') deletado -- versão 799 linhas em `panels/` mantida
- `Oracle.tsx` + `DependencyGraph.tsx` arquivados em `archive/legacy_nexus/` (orphaned, deps react-markdown e mermaid ausentes)
- `components/nexus/dashboard/page.tsx` deletado (duplicata exata de `app/dashboard/page.tsx`)

### Dependências e config
- `swr ^2.4.1` adicionado ao `frontend/package.json` -- Dashboard.tsx usa useSWR, build quebrava sem ele
- `next.config.ts`: `serverExternalPackages: ['@prisma/client', '.prisma/client']` -- fix Prisma + Turbopack (sem isso Turbopack tentava fazer bundle dos binários nativos e falhava)
- `prisma generate` executado -- cliente regenerado
- `tsconfig.json`: `target: "ES2017"` (era "es5", deprecado no TS 5.x) e `baseUrl` removido (desnecessário com moduleResolution: bundler)

### Rotas -- reorganização
- `/simulador` criado: `app/simulador/page.tsx` -- MasterSimulator standalone (Motor ICM isolado)
- `/aulas/icm-masterclass` reformulada: artigo teórico denso (não mais vendas + simulador embutido)
- Header desktop + mobile: "Motor ICM" → `/simulador` (estava apontando para `/aulas/icm-masterclass` igual à "Geometria do Risco")
- Landing page hub: card "Motor ICM" → `/simulador`
- `SimuladorLazy` removido da página `/aulas/icm-masterclass`

### MasterSimulator.tsx
- `ReferencialAula12` movido de baixo do main layout para ANTES do tool switcher (referencial empírico aparece antes do simulador)
- Texto introdutório adicionado entre Referencial e tool switcher: explica cenários, Fator de Agressão, Peso PKO, o que o motor calcula

### RiskGauge.tsx
- `initial={{ strokeDasharray: "0, 100", strokeWidth: 2.5, strokeOpacity: 1 }}` -- eliminava erro Framer Motion "animate strokeOpacity from undefined"

### Geometria do Risco (/aulas/icm-masterclass)
Reformulada do zero com conteúdo teórico denso:
- Hero: "Framework Teórico" (não mais "O Edge Mudou de Lugar" -- redundante com landing)
- 4 métricas: custo RP, Downward Drift, ΔRP, pressão CL
- Artigo: por que solvers não resolvem mesa final; mecanismo RP, ΔRP, Perspectiva, Esperança ICM
- 4 definições formais em cards (RP, ΔRP, Perspectiva, Esperança ICM) com fórmula + descrição
- 4 archetypes: O Pacto Silencioso, Paradoxo do Valuation, Guerra na Lama, A Ameaça Orgânica
- Timeline + Pillars: 2-col CSS correto (timelineSection grid)
- 3 callouts: Equação do Desespero, Compressão do Risco, Dissipação por Street
- Arsenal navegação: links corretos incluindo Motor ICM → /simulador
- Referências: + Malmuth & Harville

## Estado do sistema (frontend)
- Todas as rotas 200: /, /biblioteca, /simulador, /aulas/icm-masterclass, /aulas/leitura-icm, /aulas/conceitos-icm, /templo/analytics
- Prisma funcionando: queries Content e TelemetryEvent executando corretamente
- Sem erros Framer Motion de strokeOpacity/strokeWidth
- Estrutura de rotas limpa: Geometria do Risco ≠ Motor ICM

## Pendências conhecidas
- `frontend/package-lock.json` deletado (pré-existente antes desta sessão, não commitado) -- pode ser regenerado com `npm install` no frontend/
- Aviso Next.js 16: `scroll-behavior: smooth` no `<html>` -- adicionar `data-scroll-behavior="smooth"` no layout.tsx se quiser suprimir
- `archive/legacy_nexus/Oracle.tsx` e `DependencyGraph.tsx` arquivados -- podem ser integrados ao Dashboard futuramente (Oracle: chat com task_executor; DependencyGraph: visualização de tarefas com mermaid)
