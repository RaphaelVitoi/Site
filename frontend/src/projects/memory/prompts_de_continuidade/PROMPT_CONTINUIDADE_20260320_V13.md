---
name: Prompt de Continuidade V13
description: Estado pos-restauracao massiva. 6 arquivos degradados restaurados do HEAD. globals.css adaptado Tailwind v4. Build OK 22+4 rotas. PKO feature registrada. Proximo: P1 (homepage real, integrar paineis orfaos, limpeza).
type: project
---

# Prompt de Continuidade - V13 (2026-03-20)

## O que foi feito nesta sessao

### Descoberta e restauracao de 6 arquivos degradados
Alguem (provavelmente Gemini ou agente automatizado) reescreveu 6 arquivos do zero, destruindo o conteudo SOTA:

1. **MasterSimulator.tsx**: 302 -> 53 linhas. Simulador completo (10 componentes, hooks, cenarios, tabs, lazy loading) substituido por prototipo basico com 4 componentes fantasma que nem compilavam (bug pkoValue undefined). **Restaurado do HEAD.**
2. **layout.tsx**: 50 -> 18 linhas. Perdeu Header, Footer, FontAwesome CDN, OpenGraph, SEO metadata, Twitter card. **Restaurado do HEAD.**
3. **page.tsx (home)**: 278 -> 30 linhas. Landing page completa com sales copy, hero, SimuladorICM substituida por placeholder "Nexus SOTA Engine". **Restaurado do HEAD.**
4. **tools/simulador/page.tsx**: 42 -> 9 linhas. Pagina com header/metadata/label/container substituida por bare render. **Restaurado do HEAD.**
5. **biblioteca/page.tsx**: 156 -> 86 linhas. Versao rica com MockArticle/icones/tags/status substituida por versao simplificada. **Restaurado do HEAD.**
6. **globals.css**: 1783 -> 18 linhas (ja sabido do V12). **Restaurado do HEAD e ADAPTADO para Tailwind v4** (1781 linhas).

### 4 componentes fantasma deletados
- ArchetypeSelector.tsx, ControlPanel.tsx, ComparisonMetrics.tsx, RiskVisualizer.tsx
- Criados para a versao degradada do MasterSimulator. Nao existiam no HEAD. Removidos.

### globals.css adaptado para Tailwind v4
- `@tailwind base/components/utilities` -> `@import "tailwindcss"`
- `@import url(FontAwesome)` e `@import url(GoogleFonts)` movidos para fora do `@layer base` (Tailwind v4 nao aceita @import nested)
- 117 variaveis CSS, 3 @layer blocks preservados integralmente

### Analise de arquivos nao auditados na sessao anterior
Categorias analisadas pela primeira vez:
- `content/` (96 MB): artigos, aulas .docx, interativo/toy_games_page.tsx (prototipo valido), pesquisa (duplica docs/research/)
- `docs/epics/` (19 MB): aula-icm-rp movido (com MP4 19MB), cli-interativa, icm-marketing, ingestion-pipeline
- `docs/research/` (75 MB): 30 arquivos icm-materials (.docx pesados)
- `.cerebro/` novos: LIDERANCA_GOVERNANCE (668 linhas, valido), DISTRIBUTION_MATRIX (valido), HOLOGRAPHIC_ROUTING (valido), HYBRID_BRAIN (valido), BOOT_OPERACIONAL (historico), ESTADO_ARTE_APRENDIZADO (aspiracional), agents/chico.md (novo, necessario)
- `scripts/routines/` (1092 linhas): 10 scripts Python vitoi_* + 3 PS1. Nunca commitados. Precisam revisao.
- `utils/` (30 linhas): audit.py + notifications.py. Legitimos.
- `tests/` (5 arquivos): Testes Python. Ja rodados (__pycache__). Legitimos.
- `frontend/.cerebro/`: ChromaDB secundario (188KB). NAO deveria existir. Deletar.
- `frontend/lib/icm.ts`: Duplicata simplificada de src/lib/icm.ts. Deletar.

### task_executor.py - evolucao confirmada como legitima
- HEAD: 908 linhas -> Atual: 1346 linhas (+438)
- Adicionou: circuit breaker para API keys, lazy RAG loading, load_json_config, _simulate_fallback, start_api_server (porta 17042), write_economic_log, send_toast
- scripts/ops/task_executor.py corretamente depreciado (stub 1 linha)

### Build verificado
- 22 rotas estaticas + 4 dinamicas
- TypeScript OK, zero erros

## Melhorias mantidas (working tree melhor que HEAD)
- aula-icm/page.tsx: 262 -> 318 linhas (merge legacy)
- QuizEngine.tsx: 115 -> 246 linhas (SOTA rewrite)
- simulator.module.css: 649 -> 1310 linhas (estilos quiz)
- HandSimulator.tsx: 193 -> 267 linhas
- TheoryPanel.tsx: 145 -> 191 linhas
- ComparisonRadar.tsx: 158 -> 168 linhas (Tooltip adicionado)
- EquityCalculator.tsx: 402 -> 421 linhas

## TODOS OS P0 RESOLVIDOS

| P0 | Status |
|---|---|
| globals.css truncado | RESOLVIDO - 1781 linhas, Tailwind v4 |
| Header/Footer ausentes | RESOLVIDO - layout.tsx restaurado do HEAD |
| FontAwesome ausente | RESOLVIDO - CDN no layout.tsx restaurado |

## PENDENCIAS PRIORITARIAS (proxima sessao)

### P1 - Produto
1. Homepage real (atual e sales copy de 278 linhas - funcional mas pode evoluir)
2. Integrar paineis orfaos no MasterSimulator (EquityCalculator, NashPanel, HandSimulator, AICoachPanel ja estao lazy-loaded no HEAD restaurado)
3. Unificar CodeBlock duplicado (content/ vs simulator/ui/)
4. **Feature PKO Value** - integrar no MasterSimulator existente (NAO reescrever)

### P2 - Higiene
5. Remover deps npm nao usadas (html2canvas, jspdf, recharts, zustand)
6. Deletar frontend/.cerebro/ (ChromaDB secundario 188KB)
7. Deletar frontend/lib/icm.ts (duplicata)
8. Deletar GLOBAL_INSTRUCTIONS.md raiz (duplicata)
9. Deletar package.json raiz (3 deps inuteis)
10. Resolver Agent-TaskManager.psm1 refs em 19 scripts
11. Limpar content/pesquisa/ (duplica docs/research/)
12. Limpar .docx e .mp4 de Git (94 MB binarios)
13. ChromaDB 609 MB - precisa purge
14. .backups_sota/ 266 MB - compactar
15. Remover IP local de next.config.ts
16. Prisma schema: remover Post/Category
17. .cursorules: remover refs Agent-TaskManager/Autopoiesis
18. Revisar e commitar scripts/routines/ (1092 linhas)
19. Revisar e commitar tests/ (5 arquivos)

### P3 - Deploy
20. Deploy Vercel (P0s resolvidos, pronto apos P2 minimo)

## Stack
Next.js 16, React 19, TypeScript 5.9, Tailwind 4, Prisma 5, SQLite, Python (ChromaDB RAG)

## Feedback registrado nesta sessao
- NUNCA reescrever componentes do zero. Sempre integrar no existente. (feedback_never_rewrite_from_scratch.md)
- PKO Value aprovado como feature futura. (project_pko_feature_idea.md)

## Contagem canonica de agentes: 17
Mesma do V12.
