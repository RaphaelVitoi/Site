# LOAD PREDICTION MODEL (@sequenciador)
> **Status:** Ativo | **Fórmula:** Heurística de Priorização de Backlog

O `@sequenciador` usa esta matriz matemática para não enlouquecer com múltiplas demandas simultâneas do `@dispatcher`.

### A Fórmula de Prioridade (Score)
`Score = (Urgência * 3) + (Impacto * 2) - (Complexidade * 1.5) + (Fator Cascata * 2)`

- **Urgência (1 a 5):** Quão rápido o CEO (Raphael) precisa disso?
- **Impacto (1 a 5):** Isso trava outras pipelines ou gera lucro imediato?
- **Complexidade (1 a 5):** Exige @implementor e @auditor pesados? (Reduz o score para não travar o pool).
- **Fator Cascata (1 a 5):** Quantos outros scripts/módulos dependem disso para funcionar?

**Regra de Ação:**
1. Tasks com Score > 25 furam a fila (`tasks.json` -> move to top).
2. Tasks com Alta Complexidade (5) são obrigatoriamente divididas em Sub-Tasks antes de entrar no Kernel.