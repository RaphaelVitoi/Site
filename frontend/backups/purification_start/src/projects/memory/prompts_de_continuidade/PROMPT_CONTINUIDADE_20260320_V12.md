---
name: Prompt de Continuidade V12
description: Estado pos-auditoria completa 2026-03-20. Relatorio publicado. 9 legacy pages restauradas. P0 critico identificado: globals.css truncado. Proximo passo: restaurar CSS + layout + FontAwesome.
type: project
---

# Prompt de Continuidade - V12 (2026-03-20)

## O que foi feito nesta sessao

### Restauracao de 9 legacy pages (P1 do V11)
- 8 pages copiadas de archive/legacy_pages/ para frontend/src/app/:
  - artigos/estado-da-arte, artigos/smart-sniper, artigos/validacao-smart-sniper
  - aula-1-2, leitura-icm
  - biblioteca/hermeneutica-blefe, biblioteca/motor-diluicao, biblioteca/paradoxo-valuation
- Pagina indice /biblioteca CRIADA (nao existia no archive)
- aula-icm REESCRITA: merge do conteudo legacy completo (318 linhas) com bridge SimuladorICM
- page.module.css copiado para aula-icm

### 3 bugs pre-existentes corrigidos
- RiskVisualizer.tsx:46 - `type: 'spring'` precisava `as const`
- QuizEngine.tsx:11 - import fantasma `QuizData` removido
- icm.ts:323 - `import.meta.vitest` sem config Vitest (ts-ignore)

### Auditoria completa publicada
- Relatorio: docs/reports/AUDITORIA_COMPLETA_20260320.md
- Metodo: 2 agentes background (frontend + raiz) + varredura manual
- Cobertura: frontend, rotas, componentes, dead code, CSS, configs, Python backend, scripts, docs, agent system, disk usage

### Build verificado
- 22 rotas estaticas + 4 dinamicas
- Header.tsx: todas as rotas referenciadas existem (zero 404s)

## ACHADO CRITICO DESCOBERTO: globals.css truncado

O globals.css foi reduzido de **1.783 linhas para 18** (provavelmente por migracao Tailwind v4).

A versao commitada (HEAD) contem:
- Variaveis CSS (--font-mono, --accent-emerald, --text-muted, --accent-primary, etc.)
- FontAwesome 6.5.1 via CDN
- Google Fonts (Montserrat, Inter, JetBrains Mono)
- Estilos de Header, Footer, glass panels, hub-cards, botoes, article layout
- Background pattern do body

**Para restaurar:** `git show HEAD:frontend/src/app/globals.css` contem a versao completa. Adaptar as diretivas @tailwind para @import "tailwindcss" do Tailwind v4 e re-inserir todos os custom styles.

**Nota adicional:** layout.tsx (18 linhas) NAO importa Header nem Footer. Ambos existem em components/layout/ mas estao desconectados.

## PENDENCIAS PRIORITARIAS (proxima sessao)

### P0 - BLOQUEADORES VISUAIS (fazer PRIMEIRO)
1. **Restaurar globals.css** - adaptar 1783 linhas do HEAD para Tailwind v4 syntax
2. **Importar Header/Footer no layout.tsx**
3. **Garantir FontAwesome** carregado (CDN no globals.css original ou instalar via npm)

### P1 - Produto
4. Criar homepage real (atual e placeholder "Nexus SOTA Engine")
5. Integrar paineis orfaos no MasterSimulator (EquityCalculator, NashPanel, HandSimulator, AICoachPanel - 4 de ~10 paineis construidos mas nao conectados)
6. Unificar CodeBlock duplicado (content/ vs simulator/ui/)

### P2 - Higiene
7. Remover deps npm nao usadas (html2canvas, jspdf, recharts, zustand)
8. Resolver Agent-TaskManager.psm1 refs em 19 scripts
9. Limpar public/ (5 HTMLs legados, legacy/, analytics.js nao carregado)
10. Resolver frontend/public/docs/ duplicacao com docs/ raiz (44 arquivos)
11. ChromaDB 734 MB - avaliar limpeza
12. .backups_sota/ 266 MB - compactar ou limpar
13. Remover IP local de next.config.ts
14. Prisma schema: remover models Post/Category (nao usados)
15. .cursorules: remover refs a Agent-TaskManager.psm1 e Agent-Autopoiesis.psm1
16. Mover .docx da raiz para docs/research/

### P3 - Deploy
17. Deploy Vercel (so apos P0 resolvido)

## Stack
Next.js 16, React 19, TypeScript 5.9, Tailwind 4, Prisma 5, SQLite, Python (ChromaDB RAG)

## Feedback registrado
- Claude e Gemini (ambas Pro tier) trabalham juntas. Edicoes devem ser auto-explicativas para o outro modelo.
- Antes de deletar duplicatas, sempre comparar conteudo interno.
- @seo nao foi excluido - foi fundido. Funcoes absorvidas por @curator e outros.

## Contagem canonica de agentes: 17
- 7 pipeline linear: architect, pesquisador, prompter, planner, auditor, implementor, verifier
- 4 consultivos: curator (absorveu SEO), validador, securitychief, bibliotecario
- 2 super-agentes: maverick (intelectual), chico (administrativo)
- 3 operacionais: organizador, skillmaster, sequenciador
- 1 entrada: dispatcher

## Relatorio completo
docs/reports/AUDITORIA_COMPLETA_20260320.md
