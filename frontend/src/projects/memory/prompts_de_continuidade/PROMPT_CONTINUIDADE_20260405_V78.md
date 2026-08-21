---
name: Prompt de Continuidade V78
description: V78 — Auditoria Gemini 4 arquivos prioritários (globals.css, QuantumSynthesis, QuizEngine, simulator.module.css). ~20 hex migrados para CSS vars. Duplicata --accent-rose corrigida. Build limpo.
type: project
---

## Estado da Sessão V78

### Contexto teórico absorvido nesta sessão

1. **Artigos GTO Wizard 2025 relidos e analisados:**
   - "MDF vs ICM: Rethinking Bluffing & Defense Strategies" — confirma que MDF quebra sob ICM, agressor blefa mais quando defensor tem RP alto, valida Opção B do motor
   - "How ICM Impacts Postflop Strategy" — confirma covering player mais agressivo, Downward Drift, supressão de large bets (alinha com k_ip_bet_large = -12)

2. **Framework Perspectiva/Esperança/Expectativa aprofundado:**
   - CL agressivo explicado via Perspectiva (não ICM EV puro)
   - River após 3 streets: RP aumentado pelo investimento, mas pode ser dominado pela Esperança se pot ganho muda escalão de Perspectiva
   - Crítica fundamentada de FGS em solvers: lógica impecável sobre modelo incompleto, não captura trajetória de campo
   - Memória atualizada pelo usuário com hierarquia v3 completa

3. **Créditos verificados:** Downward Drift atribuído a O'Kearney & Carter em todos os locais relevantes do site. Padrão profissional correto. Única inconsistência: ReferencialAula12 cita "PKO Poker Strategy 2023" enquanto demais citam "Endgame Poker Strategy: The ICM Book" — não corrigido (conceito aparece em ambos livros).

### Executado nesta sessão (código)

1. **Audio removido:** Gemini já havia limpado useAudioFeedback de ScenarioStage e RiskGauge. Hook deletado. Zero referências restantes. Confirmado.

2. **globals.css — 3 categorias de correção:**
   - P0: `--accent-rose` duplicada (linha 21: #e11d48, linha 52: #fb7185) → renomeada duplicata para `--accent-rose-light`. Nenhum componente usava o valor da duplicata diretamente.
   - P1: ~20 hex hardcoded migrados para CSS vars (h1-h4, article p/strong/ul/ol, td/td strong, scenario-btn, action-tab, pipeline-node, toy-scenario-btn, nav-dropdown-menu)
   - P2: Encoding corrompido "Arsenal Tático" na linha 502 — NÃO CORRIGIDO (comentário CSS, impacto zero)

3. **Build limpo** após todas as correções.

### Auditoria Gemini — Arquivos Prioritários

**AUDITADOS E VALIDADOS (esta sessão):**
- `globals.css` — corrigido (ver acima)
- `QuantumSynthesis.tsx` — 0 problemas. Helpers extraídos, CSS vars, narrativas coerentes
- `QuizEngine.tsx` — 0 problemas. Blindagem, state, telemetria OK
- `simulator.module.css` — 0 problemas. Padrão --sim-* cascateando de globals

**NÃO AUDITADOS (pendentes):**

Simulador UI:
- `AnimatedNumber.tsx` — 46 linhas mudaram
- `SimulatorTour.tsx` — 4 linhas
- `RiskGauge.tsx` — 2 linhas (provavelmente hex→var)
- `EquityCalculator.module.css` — 125 linhas mudaram
- `ReferencialAula12.tsx` — 92 linhas mudaram
- `PostFlopPanel.tsx` — 61 linhas mudaram (props/integração)
- `TheoryPanel.tsx` — 2 linhas
- `RangeMatrix.tsx` — 2 linhas

Páginas de conteúdo:
- `layout.tsx`
- `page.tsx` (home)
- `page.module.css` (home)
- `conceitos-icm/page.tsx`
- `icm-pos-flop/page.tsx`
- `leitura-icm/page.tsx`
- `biblioteca/*.tsx` (5 páginas)
- `artigos/*.tsx` (4 páginas)
- `quem-sou/page.tsx`
- `ICMlaboratory/page.tsx`

Componentes content:
- `ContentFooter.tsx`, `ArticleHeader.tsx`, `LessonHeader.tsx`, `MarkdownRenderer.tsx`, `ReadingProgress.tsx`, `ScrollToTop.tsx`, `ShareButtons.*`, `TableOfContents.tsx`, `AnimatedArticleGrid.tsx`

Lib:
- `logger.ts` — 71 linhas
- `handParser.ts` — 26 linhas
- `hrcExport.ts` — 32 linhas
- `_validate_rp.ts` — 76 linhas
- `prisma.ts` — 26 linhas

Outros:
- `ErrorBoundary.tsx`, `HeroArticleButton.tsx`, `CodeBlock.tsx`
- `Dashboard.tsx` (nexus)
- `icmQuizGenerator.ts`
- `api/og/route.tsx`, `api/rag/route.ts`, `api/route.ts`
- `aulas/[slug]/page.tsx`, `aulas/[slug]/seed_lesson.py`
- `laboratorio-icm/DegradationChart.tsx`
- `page.test.tsx`
- `voce-aprende-poker-errado/InfoTooltip.*`, `ResurrectionRiskSimulator.module.css`

### Estratégia para próxima sessão

1. **Continuar auditoria Gemini por risco:**
   - Próximos: `PostFlopPanel.tsx` (props/integração), `ReferencialAula12.tsx` (92 linhas), `EquityCalculator.module.css` (125 linhas)
   - Depois: páginas de conteúdo (conceitos-icm, icm-pos-flop, leitura-icm)
   - Por fim: periféricos (lib, api routes, componentes content)

2. **NashPanel.tsx**: ainda precisa ser reescrito para Opção B (6 ações por jogador com center/spread/delta). Pendente desde V18. Depende de o MasterSimulator estar passando as props corretas (verificar).

3. **nashSolver.test.ts**: testes obsoletos para interface antiga. Atualizar após NashPanel.

4. **Formalização E/P/E**: página dedicada no site para definir formalmente Expectativa, Perspectiva e Esperança Matemática. Prioridade documental declarada pelo Raphael. Fazer APÓS simulador funcional.

### Build

Build limpo. Nenhum commit nesta sessão.
