# Auditoria Completa do Ecossistema trueICM

**Data:** 2026-03-20 | **Auditor:** Claude Opus 4.6 (CHICO)
**Metodo:** 2 agentes de background (frontend + raiz/scripts) + varredura manual

---

## I. VISAO GERAL

| Metrica | Valor |
|---|---|
| **Linhas de codigo frontend** | 10.589 (TSX/TS/CSS) |
| **Rotas ativas** | 20 pages + 2 API routes + 3 redirects |
| **Componentes** | ~35 arquivos em components/ |
| **Python backend** | 7 arquivos, ~799 linhas |
| **Scripts PowerShell** | ~56 arquivos em 7 categorias |
| **Espaco total em disco** | ~1.8 GB |
| **Build status** | OK (22 rotas estaticas + 4 dinamicas) |
| **Stack** | Next.js 16, React 19, TypeScript 5.9, Tailwind 4, Prisma 5, SQLite, Python (ChromaDB RAG) |

---

## II. O QUE FUNCIONA BEM

### 1. Conteudo educacional (o produto)
9 legacy pages restauradas nesta sessao: 2.192 linhas de conteudo autoral sobre ICM, Risk Premium, Downward Drift, Hermeneutica do Blefe, Motor de Diluicao, Paradoxo do Valuation. Core do produto, qualidade excelente.

### 2. Motor ICM (engine/)
nashSolver.ts (coeficientes corrigidos e auditados sessao 20260316), scenarios.ts (399 linhas, 9 cenarios clinicos), types.ts, ftEnvironments.ts - coerente e validado. Lib icm.ts (428 linhas) com calculadora Malmuth-Harville funcional.

### 3. Arquitetura de agentes (17 agentes)
Sistema coerente: cada agente tem definicao em .claude/agents/, memoria em agent-memory/, mapeamento em intentmap.json e routing_map.json. Contagem consistente em todos os documentos.

### 4. Build pipeline
Next.js 16 + Turbopack compila em ~5s. Arquitetura de rotas limpa: App Router, sem Pages Router legado.

### 5. Roteamento do Header
Todas as rotas referenciadas no Header.tsx agora existem. Zero 404s internos.

### 6. Python backend
Solido e coeso: api/server.py -> core/schemas -> database/queue_manager -> engine/llm_api. SQLite queue, multi-provider LLM (Gemini, Anthropic, OpenRouter), circuit breaker para API keys, schema validation com Pydantic. Todas as cross-deps resolvidas.

### 7. Data layer
JSON configs (intentmap.json, routing_map.json, system_config.json) cross-validam corretamente. Nenhuma referencia orfao.

### 8. Documentacao
44+ arquivos markdown em docs/, reports atualizados ate 2026-03-20, terminologia consistente.

---

## III. PROBLEMAS CRITICOS (P0)

### P0-1: globals.css truncado - SITE VISUALMENTE QUEBRADO

**Gravidade: Maxima.**

O globals.css foi reduzido de **1.783 linhas para 18**. A versao commitada (HEAD) contem:
- Todas as variaveis CSS (--font-mono, --accent-emerald, --text-muted, --accent-primary, --accent-secondary, etc.)
- Import do FontAwesome 6.5.1
- Import do Google Fonts (Montserrat, Inter, JetBrains Mono)
- Estilos do Header, Footer, glass panels, article layout, hub-cards, botoes, navegacao
- Background pattern do body (grid sutil)
- Classes globais: .container, .main-header, .glass-panel, .hub-card, .hub-grid, .btn-primary, .btn-secondary, .article-nav, .page-label, .page-subtitle, .accent

A versao atual tem apenas:
```css
@import "tailwindcss";
@layer utilities { .animate-fade-up { ... } }
```

**Causa:** Migracao para Tailwind v4 (usa @import "tailwindcss" em vez de @tailwind base/components/utilities). O processo truncou o arquivo sem preservar custom styles.

**Impacto:** Praticamente TODAS as paginas exceto a home renderizam sem estilo. 42 usos de var(--font-mono), 40 de var(--accent-emerald), 36 de var(--text-muted), 20+ de var(--accent-primary/secondary).

**Nota:** public/style.css contem parte do design system (100+ linhas) mas nao e carregado pelo Next.js - e um artefato legado HTML.

### P0-2: Layout nao importa Header nem Footer

layout.tsx (18 linhas) e um esqueleto minimo:
```tsx
<html lang="pt-BR">
  <body>{children}</body>
</html>
```

Header.tsx (84 linhas) e Footer.tsx existem em components/layout/ mas NAO sao importados em nenhum lugar. O site nao tem navegacao global.

### P0-3: FontAwesome nao carregado no Next.js

45 linhas de codigo usam classes fa-solid fa-* (icones). FontAwesome NAO esta instalado via npm nem carregado via CDN no layout. So existe em 3 HTMLs legados no public/. Icones invisiveis em toda a aula-icm e simulador.

---

## IV. PROBLEMAS GRAVES (P1)

### P1-1: Homepage placeholder
page.tsx raiz (30 linhas): "Nexus SOTA Engine - Ecossistema ativo." Com unico link para /aula-icm. Nao e homepage de produto.

### P1-2: 12 componentes dead code (~2.841 linhas)
- panels/MatchupSelector.tsx (555 linhas)
- panels/EquityCalculator.tsx (421 linhas)
- panels/AICoachPanel.tsx (331 linhas)
- panels/HandSimulator.tsx (267 linhas)
- panels/NashPanel.tsx (192 linhas)
- panels/PayoutsPanel.tsx (187 linhas)
- panels/ScenarioStage.tsx, panels/ComparisonRadar.tsx, panels/RangeMatrix.tsx
- content/ArticleHeader.tsx, content/PsychologyHub.tsx
- ui/AxiomTicker.tsx, ui/ScenarioSelector.tsx

NOTA: Os panels NAO sao lixo. Sao componentes funcionais (EquityCalculator, NashPanel, HandSimulator, AICoachPanel) que DEVERIAM estar integrados ao MasterSimulator. O MasterSimulator usa apenas 4 componentes (ArchetypeSelector, ControlPanel, ComparisonMetrics, RiskVisualizer) de ~14 construidos.

### P1-3: CodeBlock duplicado
- components/content/CodeBlock.tsx
- components/simulator/ui/CodeBlock.tsx
Ambos 'use client', interfaces similares, implementacoes possivelmente divergentes.

### P1-4: tools/simulador minimo
/tools/simulador (9 linhas) apenas renderiza <MasterSimulator /> sem contexto, titulo, ou navegacao.

### P1-5: 4 dependencias npm nao utilizadas
- html2canvas - zero imports
- jspdf - zero imports
- recharts - zero imports
- zustand - zero imports

---

## V. PROBLEMAS MODERADOS (P2)

### P2-1: ChromaDB ocupa 734 MB
.claude/agent-memory/.chroma_db/ consome 734 MB. Desproporcional para 17 agentes. Possivelmente embeddings duplicados ou lixo de sessoes.

### P2-2: .backups_sota/ ocupa 266 MB
3 snapshots sem compressao nem rotacao (SNAPSHOT_PERFEICAO_20260320, staging_20260319 x2).

### P2-3: frontend/public/docs/ duplica docs/ raiz
52 arquivos em frontend/public/docs/, 44 com nome identico a docs/. Copias manuais desincronizadas, sem build script ou symlink.

### P2-4: 19 scripts referenciam Agent-TaskManager.psm1 (deletado)
Modulo PowerShell deletado mas 19 scripts ainda fazem Import-Module. Falham silenciosamente. Scripts afetados: cleanup.ps1, queue_maintenance.ps1, start_autonomy.ps1, run_organizer.ps1, run_maverick_sentinel.ps1, run_organizador_maintenance.ps1, invoke_daily_report.ps1, submit-idea.ps1, apply_sentinel_strategy.ps1, + 10 testes.

### P2-5: Prisma schema com models legados
Post e Category nao usados por nenhuma pagina. So Content (model SOTA) e relevante. psicologia-hs/[slug]/page.tsx importa Prisma mas faz fallback para mock data - DB nunca seedado.

### P2-6: Docx na raiz (~47 MB)
3 arquivos .docx na raiz do projeto. Ignorados pelo .gitignore mas poluem.

### P2-7: Symlinks frageis
.chroma_db e queue na raiz apontam para /c/Nexus_SOTA_Engines/Site/ - caminhos absolutos, so funcionam nesta maquina.

### P2-8: node_modules na raiz (29 MB)
package.json raiz tem 3 deps (chalk, commander, ts-node) sem uso visivel.

### P2-9: IP local hardcoded
next.config.ts: allowedDevOrigins: ['192.168.2.120'] - remover antes de deploy.

### P2-10: Teste duplicado
engine/nashSolver.test.ts existe em 2 locais: simulator/engine/ e simulator/engine/__tests__/

### P2-11: public/ com lixo
- 5 HTMLs legados substituidos pelas rotas Next.js
- public/legacy/ inteira e redundante
- public/analytics.js nao carregado no layout
- .docx em public/docs/tasks/assets/

### P2-12: .cursorules referencia modulos fantasma
Menciona Agent-TaskManager.psm1 e Agent-Autopoiesis.psm1 que nao existem.

---

## VI. PROBLEMAS MENORES (P3)

- engine/page.tsx (143 linhas, Guia Motor ICM) dentro de components/simulator/engine/ - nao e rota, e componente orfao
- page.test.tsx na raiz de app/ - teste dentro do build dir
- 3 rotas redirect (/tools/icm, /tools/masterclass, /tools/toy-games -> /tools/simulador)
- GLOBAL_INSTRUCTIONS.md na raiz duplica .claude/GLOBAL_INSTRUCTIONS.md
- .claude/page.tsx orfao
- components/ui/Button.tsx (1 linha) - provavelmente inutil

---

## VII. DIAGNOSTICO ESTRUTURAL

### O que o sistema E:
1. Backend de orquestracao robusto (task_executor.py, memory_rag.py, do.ps1)
2. Motor ICM matematicamente validado (nashSolver.ts, icm.ts, scenarios.ts)
3. Conteudo educacional excelente (9 artigos + aula masterclass)
4. MasterSimulator funcional mas incompleto (4 de ~14 paineis integrados)
5. Sistema de agentes coerente (17 agentes, roteamento, memoria)
6. Python backend solido (SQLite queue, multi-provider LLM, circuit breaker)

### O que o sistema NAO e:
1. Um site funcional visualmente. Sem globals.css restaurado = texto branco sem estilo. Sem Header/Footer = sem navegacao. Sem FontAwesome = icones invisiveis.
2. Um produto deployavel. Homepage placeholder, IP hardcoded, public/docs desincronizado.
3. Um simulador completo. MasterSimulator usa 4 de ~14 componentes construidos.

### Metafora:
Carro de corrida com motor potente (ICM engine), interior luxuoso (conteudo educacional), painel parcialmente conectado (simulador), mas sem carroceria montada (CSS/layout) e sem volante (navegacao).

---

## VIII. BUGS PRE-EXISTENTES CORRIGIDOS NESTA SESSAO

1. RiskVisualizer.tsx:46 - type: 'spring' precisava de 'as const' (erro de tipo TypeScript)
2. QuizEngine.tsx:11 - import fantasma QuizData removido (tipo nao existia em types.ts)
3. icm.ts:323 - import.meta.vitest sem config Vitest (ts-ignore adicionado)

---

## IX. ACOES EXECUTADAS NESTA SESSAO

1. 8 legacy pages restauradas do archive/ para frontend/src/app/
2. Pagina indice /biblioteca criada
3. aula-icm reescrita (merge do conteudo legacy completo com bridge SimuladorICM)
4. page.module.css copiado para aula-icm
5. 3 bugs de tipo corrigidos
6. Build verificado: 22 rotas OK

---

## X. RECOMENDACAO DE PRIORIDADES

| # | Acao | Impacto | Esforco |
|---|---|---|---|
| 1 | **Restaurar globals.css** do HEAD, adaptar para Tailwind v4 | Desbloqueia tudo visual | Medio |
| 2 | **Importar Header/Footer no layout.tsx** | Navegacao funcional | Baixo |
| 3 | **Carregar FontAwesome** no layout | Icones visiveis | Baixo |
| 4 | **Criar homepage real** com nav cards | Primeira impressao | Medio |
| 5 | **Integrar paineis orfaos** no MasterSimulator | Simulador completo | Alto |
| 6 | **Limpar dead code** ou integrar componentes uteis | Higiene | Medio |
| 7 | **Resolver conflito globals.css/Tailwind v4** estruturalmente | Sustentabilidade | Medio |
| 8 | **Remover deps nao usadas** (html2canvas, jspdf, recharts, zustand) | Bundle limpo | Baixo |
| 9 | **Resolver Agent-TaskManager** refs em 19 scripts | Scripts funcionais | Medio |
| 10 | **Limpar public/** (HTMLs legados, legacy/, analytics) | Higiene | Baixo |

Items 1-3 sao pre-requisitos para qualquer coisa visual funcionar. Sem eles, nenhum deploy faz sentido.
