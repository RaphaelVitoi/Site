# LOAD PREDICTION MODEL (task_executor.py)
> **Status:** Ativo | **Formula:** Heuristica de Priorizacao de Backlog

O `task_executor.py` (orquestrador Python, absorveu funcoes do antigo @sequenciador) usa esta matriz matematica para priorizar multiplas demandas simultaneas do `@dispatcher`.

### A Formula de Prioridade (Score)
`Score = (Urgencia * 3) + (Impacto * 2) - (Complexidade * 1.5) + (Fator Cascata * 2)`

- **Urgencia (1 a 5):** Quao rapido o CEO (Raphael) precisa disso?
- **Impacto (1 a 5):** Isso trava outras pipelines ou gera lucro imediato?
- **Complexidade (1 a 5):** Exige @implementor e @auditor pesados? (Reduz o score para nao travar o pool).
- **Fator Cascata (1 a 5):** Quantos outros scripts/modulos dependem disso para funcionar?

**Regra de Acao:**
1. Tasks com Score > 25 furam a fila (`tasks.json` -> move to top).
2. Tasks com Alta Complexidade (5) sao obrigatoriamente divididas em Sub-Tasks antes de entrar no Kernel.
