---
name: Prompt de Continuidade V75
description: V75 — Auditoria 5 páginas ICM (6 correções). Migração SOTA leitura-icm. Biblioteca links completos. Psicologia-hs fix âncora. Build limpo.
type: project
---

## Estado da Sessão V75

### Executado nesta sessão

1. **Verificação integridade simulador:**
   - NashPanel já estava 100% Opção B (sumário anterior desatualizado)
   - Motor, tipos, hook e testes alinhados. 15 testes passando.

2. **Auditoria conteúdo 5 páginas ICM — 6 correções:**
   - `conceitos-icm`: "mechanism" → "mecanismo" (typo inglês em texto PT)
   - `icm-pos-flop`: link quebrado `#simulador-section` → `/simulador`
   - `icm-pos-flop`: `var(--bg-subtle)` (cor fundo) usada como cor texto → `var(--text-muted)`
   - `leitura-icm`: migração completa MarkdownRenderer+ShareButtons → SectionHeader+ContentFooter+glass-panel SOTA
   - `psicologia-hs`: primeiro botão PsychologyHub apontava `/artigos/psicologia-hs#ontologia-rp` (same-page full path, Next.js não scrollava) → `#ontologia-rp` (âncora relativa)
   - `biblioteca/page.tsx`: adicionadas 5 páginas de biblioteca faltantes no staticArticles (hermeneutica-blefe, paradoxo-valuation, voce-aprende-poker-errado, motor-diluicao, entendendo-o-icm)

3. **Migração SOTA leitura-icm:**
   - MarkdownRenderer+LaTeX removido
   - 5 SectionHeaders (Calibração, Paradigma, Extensão, Motor, Atribuição)
   - HTML entities (sub, sup, &minus;, &times;, &Psi;, &Delta;, etc.)
   - Referências profissionais com atribuições corretas
   - ContentFooter com share

### Pendências (por ordem de prioridade)

1. **icm-pos-flop seção Comparativo:** Layout legado (classes container/article-nav). Não tem ContentFooter. Funcional mas não SOTA.

2. **Auditoria conteúdo páginas ICM:** Revisão de conteúdo (melhorar, refinar, densificar) — diferente de correção estrutural já feita.

3. **Formalizar E/P/E em página dedicada:** Os conceitos Expectativa, Perspectiva e Esperança Matemática em página formal.

4. **BACKLOG — Reescrita Geometria de Risco:**
   - Fontes: archive/engine_original/GeometriaDoRisco_v1_standalone.html, archive/legacy_icm_components/RiskGeometryMasterclass.tsx, content/aulas/A Geometria do Risco (Manual Didático).docx, frontend/research/icm-materials/geometria_texto.md

### Arquivos modificados nesta sessão

- `frontend/src/app/aulas/conceitos-icm/page.tsx` — typo corrigido
- `frontend/src/app/aulas/icm-pos-flop/page.tsx` — link quebrado + cor errada corrigidos
- `frontend/src/app/aulas/leitura-icm/page.tsx` — migrado para SOTA completo
- `frontend/src/app/artigos/psicologia-hs/page.tsx` — fix âncora primeiro botão
- `frontend/src/app/biblioteca/page.tsx` — 5 artigos adicionados ao staticArticles

### Build

Build limpo. Zero erros.
