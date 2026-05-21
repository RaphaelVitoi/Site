---
name: Prompt de Continuidade V77
description: V77 — Reescrita densa Geometria do Risco. Fix baselineEquity pot odds. Fix useQuantumEngine dep array. Auditoria Gemini parcial (simulador OK, lib OK, falta conteúdo/UI/periféricos). Build limpo.
type: project
---

## Estado da Sessão V77

### Executado nesta sessão

1. **Verificação P2 scenarios.ts ipRp=38:** Confirmado baixo risco. rpDeriver (M-H) sobrescreve sempre para este cenário (9 stacks, 9 prizes). Fallback manual morto.

2. **Auditoria icm-masterclass vs geometria_texto.md:** 7 gaps identificados (P0: seção MDF ausente + HU revert; P1: BF/RP formais + Regra de Ouro + arquétipos rasos + conclusão; P2: epígrafe).

3. **Reescrita completa Geometria do Risco (icm-masterclass/page.tsx):**
   - De ~283 linhas (esqueleto) para ~620 linhas (artigo denso)
   - 7 seções: Epígrafe, Fundamentos (6 cards), Doutrina (HU revert, E/P/E), Arquétipos expandidos (5 com Cenário/Paradoxo/Resolução), MDF/Pós-Flop (NOVA), Tríade da Adaptação, Nav/Refs
   - Conteúdo novo: seção MDF inteira, BF formal com exemplo numérico, Regra de Ouro da Assimetria, distinção HU pot vs HU Final, hierarquia E/P/E, crítica FGS (modelo incompleto), validação GTO Wizard 2025, river multi-street, Inversão de Extremos, Especulação Assimétrica, Expansão Passiva, Node-Locking
   - CSS module expandido: 14 novos seletores (archetypeDetail, archetypeSection, paradoxBlock, resolutionBlock, scenarioTag, epigraph), responsive 768px
   - Cada arquétipo com cor própria (indigo, rose, emerald, amber, red), barra lateral colorida

4. **Auditoria parcial das alterações Gemini no simulador:**

   **AUDITADOS E VALIDADOS:**
   - `MasterSimulator.tsx`: Refatoração correta. Lógica extraída para `useQuantumEngine` hook. Header e nav desacoplados em SimulatorHeader/SimulatorNavigation. Controles espaciais (Ponto Zero, Ante, Sunk Cost, Dead Money) adicionados. Props passadas corretamente a PmLensPanel, PerspectivePanel, PostFlopPanel.
   - `perspectiva.ts`: kappa (Axioma Lipe Piv) adicionado com regressão Bayesiana. Helpers extraídos (_buildSimulatedStacks, _buildDiagnostico). Fail-fast n>10 (ChipEV fallback). deltaFoldPct adicionado ao result. **FIX APLICADO:** baselineEquity corrigido de `heroCost/potSize` para `heroCost/(potSize+heroCost)` (pot odds correto).
   - `useQuantumEngine.ts`: Hook extraído do MasterSimulator. **FIX APLICADO:** preflopDeadMoney adicionado ao dep array do useMemo de postFlopRps (lint fix).
   - `icm.ts`: Apenas formatação (spacing). Delegação a calculateMapaICM inalterada.
   - `icmEngine.ts`: Barreira termodinâmica n>10 adicionada (ChipEV fallback). Optional chaining em positionProbs. Correto.
   - `NashPanel.tsx`: 2 `#fff` migrados para `var(--text-main)`. Correto.
   - `useScenario.ts`: Optional chaining + fallback `{} as Scenario`. Correto.
   - `PerspectivePanel.tsx`: Props anteSize/heroInvestedBb/currentPotBb adicionadas. Pot/heroCost derivados do foldEvBb. htmlFor adicionado aos labels. Correto.
   - `PmLensPanel.tsx`: Props anteSize/heroInvested/currentPot adicionadas. Cache key expandida. Pot/heroCost dinâmicos. `#fff` → `var(--text-main)`. Correto.

   **NÃO AUDITADOS (pendentes para próxima sessão):**
   
   Simulador UI:
   - `QuantumSynthesis.tsx` — Helpers extraídos (getContextualNarrative, getEsperancaMatConfig, getThemeConfig, getGaugeRightColor). Narrativas contextuais adicionadas. Diff grande (~121 linhas mudaram). PRECISA AUDITAR conteúdo das narrativas e coerência com teoria.
   - `QuizEngine.tsx` — 225 linhas mudaram. PRECISA AUDITAR.
   - `AnimatedNumber.tsx` — 46 linhas mudaram. PRECISA AUDITAR.
   - `SimulatorTour.tsx` — 4 linhas. Provavelmente formatação.
   - `RiskGauge.tsx` — 2 linhas. Provavelmente hex→var.
   - `simulator.module.css` — 148 linhas mudaram. PRECISA AUDITAR.
   - `EquityCalculator.module.css` — 125 linhas mudaram. PRECISA AUDITAR.
   - `ReferencialAula12.tsx` — 92 linhas mudaram. PRECISA AUDITAR.
   - `PostFlopPanel.tsx` — 61 linhas mudaram. PRECISA AUDITAR props/integração.
   - `TheoryPanel.tsx` — 2 linhas. Provavelmente formatação.
   - `RangeMatrix.tsx` — 2 linhas. Provavelmente formatação.

   Páginas de conteúdo:
   - `globals.css` — 198 linhas diff. PRECISA AUDITAR.
   - `layout.tsx` — PRECISA AUDITAR.
   - `page.tsx` (home) — PRECISA AUDITAR.
   - `page.module.css` (home) — PRECISA AUDITAR.
   - `conceitos-icm/page.tsx` — PRECISA AUDITAR.
   - `icm-pos-flop/page.tsx` — PRECISA AUDITAR.
   - `leitura-icm/page.tsx` — PRECISA AUDITAR.
   - `biblioteca/*.tsx` (5 páginas) — PRECISA AUDITAR.
   - `artigos/*.tsx` (4 páginas) — PRECISA AUDITAR.
   - `quem-sou/page.tsx` — PRECISA AUDITAR.
   - `ICMlaboratory/page.tsx` — PRECISA AUDITAR.

   Componentes content:
   - `ContentFooter.tsx`, `ArticleHeader.tsx`, `LessonHeader.tsx`, `MarkdownRenderer.tsx`, `ReadingProgress.tsx`, `ScrollToTop.tsx`, `ShareButtons.*`, `TableOfContents.tsx`, `AnimatedArticleGrid.tsx` — PRECISA AUDITAR.

   Lib:
   - `logger.ts` — 71 linhas mudaram. PRECISA AUDITAR.
   - `handParser.ts` — 26 linhas. PRECISA AUDITAR.
   - `hrcExport.ts` — 32 linhas. PRECISA AUDITAR.
   - `_validate_rp.ts` — 76 linhas. PRECISA AUDITAR.
   - `prisma.ts` — 26 linhas. PRECISA AUDITAR.
   - `rpDeriver.ts` — 2 linhas. Provavelmente formatação.

   Outros:
   - `ErrorBoundary.tsx`, `HeroArticleButton.tsx`, `CodeBlock.tsx` — PRECISA AUDITAR.
   - `Dashboard.tsx` (nexus) — PRECISA AUDITAR.
   - `icmQuizGenerator.ts` — PRECISA AUDITAR.
   - `api/og/route.tsx`, `api/rag/route.ts`, `api/route.ts` — PRECISA AUDITAR.
   - `aulas/[slug]/page.tsx`, `aulas/[slug]/seed_lesson.py` — PRECISA AUDITAR.
   - `laboratorio-icm/DegradationChart.tsx` — PRECISA AUDITAR.
   - `page.test.tsx` — PRECISA AUDITAR.
   - `voce-aprende-poker-errado/InfoTooltip.*`, `ResurrectionRiskSimulator.module.css` — PRECISA AUDITAR.

### Commit desta sessão

- `ef51403` — feat(content): reescrita densa Geometria do Risco + fix baselineEquity + lint

### Estratégia para próxima sessão

1. **Prioridade 1: Auditar arquivos Gemini restantes por categoria:**
   - Começar pelos mais arriscados: `globals.css`, `QuantumSynthesis.tsx`, `QuizEngine.tsx`, `simulator.module.css`
   - Depois: páginas de conteúdo (conceitos-icm, icm-pos-flop, leitura-icm)
   - Por fim: periféricos (lib helpers, api routes, componentes content)

2. **Padrão de problemas Gemini a verificar:**
   - Quebra de model field nos agentes (feedback registrado)
   - Formatação (spacing) — inofensivo mas volumoso
   - `#fff` → `var(--text-main)` — correto quando encontrado
   - Barreira n>10 — correto
   - htmlFor nos labels — correto (acessibilidade)
   - Possíveis erros matemáticos (como o baselineEquity que já corrigi)

3. **Após auditoria completa: commit separado das correções encontradas.**

### Build

Build limpo. tsc --noEmit: zero erros. Lint: zero warnings.
