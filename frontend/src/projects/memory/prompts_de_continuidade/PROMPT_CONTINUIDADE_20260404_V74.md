---
name: Prompt de Continuidade V74
description: V74 — Absorção GTO Wizard (2 artigos MDF/ICM postflop). Framework E/P/E reforçado. FGS solver critique formalizado. Downward Drift atribuição verificada em todas as 4 páginas ICM. Última página legada migrada (entendendo-o-icm). Build limpo.
type: project
---

## Estado da Sessão V74

### Absorvido nesta sessão

1. **2 artigos GTO Wizard lidos e analisados:**
   - "MDF vs ICM: Rethinking Bluffing & Defense Strategies in MTTs" (2025)
   - "How ICM Impacts Postflop Strategy" (2025)
   - Conclusões: MDF quebra sob ICM (valida Opção B), covering player mais agressivo (valida ΔRP), Downward Drift confirmado, large bets suprimidas (valida k_ip_bet_large = -12)

2. **Framework E/P/E reforçado:**
   - Raphael expandiu a lógica do CL agressivo: não é por ICM EV do pot, é por proteção de Perspectiva
   - Exemplo do river após 3 streets de investimento: RP tecnicamente sobe mas Esperança pode dominar SE ganhar o pot muda escalão de Perspectiva
   - Simetria confirmada: mesmo framework aplica ao RP maior no river (valores diferentes, lógica igual)

3. **FGS solver critique formalizado:**
   - Solvers raciocinam perfeitamente sobre o objeto errado (toy game, não torneio)
   - FGS é recursão dentro do mesmo espaço limitado — mais profundo mas não mais real
   - Framework Perspectiva/Esperança/Expectativa identifica o que está FORA do espaço de representação do solver

4. **Downward Drift atribuição verificada** em todas as 4 páginas ICM do site — correto e profissional em todas

5. **Migração SOTA última página legada:**
   - `entendendo-o-icm-e-suas-heuristicas/page.tsx`: MarkdownRenderer+ShareButtons → SectionHeader+ContentFooter+glass-panel
   - LaTeX convertido para HTML entities (sub, sup, &minus;, &times;, etc.)
   - Imagens mantidas com next/image
   - Build limpo

6. **Audio eliminado** — confirmado que `useAudioFeedback` já foi deletado, ScenarioStage e RiskGauge já estão limpos

### Pendências (por ordem de prioridade)

1. **Simulador — NashPanel para Opção B:** Reescrever NashPanel.tsx para nova interface NashResult (6 ações: ip_check, ip_bet_small, ip_bet_large, oop_call, oop_fold, oop_raise). Inputs: chipEvFreqs editável + aggressionFactor slider. Output: center%, spread(±), delta vs ChipEV para cada ação. Header: deltaRp e bExponent. Design minimalista (CSS vars, não hex).
   - Props esperadas: `nash: NashResult, chipEvFreqs: ChipEvFreqs, aggressionFactor: number, onChipEvChange, onAggressionChange`

2. **Testes nashSolver.test.ts:** Atualizar para nova interface NashResult

3. **Auditoria conteúdo páginas ICM:** Melhorar, corrigir, refinar conteúdo existente

4. **Formalizar E/P/E em página dedicada:** Os conceitos Expectativa, Perspectiva e Esperança Matemática precisam de uma página formal no site

5. **BACKLOG — Reescrita Geometria de Risco:**
   - Reescrever `icm-masterclass/page.tsx` com densidade e qualidade superiores
   - Fontes de referência:
     - archive/engine_original/GeometriaDoRisco_v1_standalone.html
     - archive/legacy_icm_components/RiskGeometryMasterclass.tsx
     - content/aulas/A Geometria do Risco (Manual Didático).docx
     - frontend/research/icm-materials/geometria_texto.md

### Arquivos modificados nesta sessão

- `memory/project_teoria_icm_perspectiva_esperanca.md` — reescrito com hierarquia completa v2
- `frontend/src/app/biblioteca/entendendo-o-icm-e-suas-heuristicas/page.tsx` — migrado para SOTA

### Build

Build limpo. Zero erros. Todas as 5 páginas da biblioteca no padrão SOTA.
