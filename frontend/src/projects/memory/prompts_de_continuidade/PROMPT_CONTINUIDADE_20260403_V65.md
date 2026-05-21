---
name: Prompt de Continuidade V65
description: V65 — Formalização E/P/E em conceitos-icm (Er, Ci, Ressurreição, RIO MW, MDF ICM, RP pós-flop). Quiz 4 opções + Theory expandido 12 cenários. QuantumSynthesis if-chain fix. Axioma Lipe Piv atribuído. Próximo: CSS vars → NashPanel Opção B.
type: project
---

## Estado Atual (V65 — 2026-04-03)

### Commit
`b1e62f2` — feat(simulator+content): formalizar E/P/E, expandir quiz/theory 12 cenários, corrigir QuantumSynthesis

### O que foi feito nesta sessão

1. **Formalização E/P/E em conceitos-icm (página existente expandida):**
   - Seção 02 (Esperança): Edge Relativa Er(S) com equação formal, Oportunidade de Erro (Oe) por profundidade, amortização dupla em short stacks
   - Seção 03 (Expectativa): Table Draw (análise pré-carta), Antevisão (salto de blinds t-3, posição futura)
   - Seção 04 (Perspectiva): Risco de Ressurreição, Coeficiente de Insolvência Ci, RIO Multiway O(N²), Fator Ψ, "Erro de Ambos"
   - Seção 05 (Extensão ICM EV): MDF em ICM (variáveis monetárias), RP pós-flop e diluição dinâmica
   - TOC atualizado com descrições expandidas
   - GTO Wizard "How ICM Impacts Postflop" adicionado às referências
   - Axioma Lipe Piv atribuído formalmente nas referências

2. **Quiz expandido — 12 cenários × 4 opções:**
   - Todas as perguntas reescritas com contexto específico do cenário
   - 4 opções por cenário (1 correta + 3 distratores plausíveis)
   - Explanações fundamentadas no framework (ΔRP, RP, Perspectiva, Esperança)

3. **Theory expandido — 12 cenários:**
   - Todos os parágrafos reescritos de 1 frase para conteúdo denso
   - Conceitos do framework integrados: Ressurreição, Especulação Assimétrica, Downward Drift, transferência de peso volitivo, MDF quebrado, Pacto Silencioso
   - Valores numéricos específicos de RP e ΔRP em cada cenário

4. **Exploit expandido — 12 cenários:**
   - Todas as dicas expandidas de 1 para 2 (complementares)

5. **QuantumSynthesis — if-chain corrigida:**
   - Death Zone + Payjump agora é combinação (não mascarado pelo if anterior)
   - Faixa "Tensão Baixa" (avgRp ≤ 10) adicionada
   - Narrativas mais precisas com referências a credibilidade e exploit proporcional

6. **PerspectivePanel — layout Layer 4 corrigido:**
   - Resultado (%) e metadados no mesmo row, alerta marginal abaixo
   - κ exibido nos metadados do Layer 4
   - Import React limpo (type-only)

7. **Cleanup:**
   - FT_STACKS (não utilizado) removido de scenarios.ts
   - Comentário do FT_PRIZES atualizado com contexto (126 jogadores, TOTAL_POOL)

### Arquivos modificados nesta sessão
- `frontend/src/app/aulas/conceitos-icm/page.tsx` — E/P/E formalizado, referências expandidas
- `frontend/src/components/simulator/engine/scenarios.ts` — quiz 4 opções, theory denso, exploit 2 dicas, FT_STACKS removido
- `frontend/src/components/simulator/ui/QuantumSynthesis.tsx` — if-chain corrigida, narrativas refinadas
- `frontend/src/components/simulator/panels/PerspectivePanel.tsx` — layout Layer 4, κ visível, import limpo

### Issues resolvidos nesta sessão
| # | Sev | Item | Status |
|---|-----|------|--------|
| 1 | Alto | Quiz 1 opção em todos os cenários | RESOLVIDO (4 opções) |
| 2 | Alto | Theory 1 frase em todos os cenários | RESOLVIDO (parágrafos densos) |
| 3 | Médio | QuantumSynthesis if-chain mascara combinações | RESOLVIDO |
| 4 | Info | Axioma Lipe Piv sem atribuição formal | RESOLVIDO |

### Issues pendentes
| # | Sev | Item | Status |
|---|-----|------|--------|
| 1 | Info | dangerouslySetInnerHTML em TheoryPanel | MONITORAR |
| 2 | Pendente | CSS vars nos painéis do simulador | PIPELINE |

### Pipeline de próximos passos
1. **CSS vars** — Migrar cores hardcoded (hex) nos painéis do simulador para CSS variables de globals.css.
2. **NashPanel.tsx** — Reescrever para Opção B (6 ações). Inputs: chipEvFreqs editável + aggressionFactor. Outputs: center%, spread(±), delta vs ChipEV.

### Build
Zero erros. Lint passa.
