# LOAD PREDICTION MODEL (task_executor.py)
>
> **Status:** Ativo | **Formula:** Heuristica de Priorizacao de Backlog
> **Status:** Ativo (V2 SOTA) | **Infraestrutura:** Banco SQLite (`tasks.db`) & Grafos Aciclicos (DAG)

O `task_executor.py` (Orquestrador Python, operando em simbiose com o mestre de fila `@sequenciador`) usa esta matriz matematica para priorizar multiplas demandas simultaneas do `@dispatcher`.
O `task_executor.py` (Orquestrador SOTA) substituiu as filas lineares e arrays JSON em favor de um motor hibrido de Grafos de Dependencia. Ele opera em simbiose com o `@sequenciador` e `@dispatcher` para rotear demandas de forma matematica.

### A Formula de Prioridade (Score)

`Score = (Urgencia * 3) + (Impacto * 2) - (Complexidade * 1.5) + (Fator Cascata * 2)`

- **Urgencia (1 a 5):** Quao rapido o CEO (Raphael) precisa disso?
- **Impacto (1 a 5):** Isso trava outras pipelines ou gera lucro imediato?
- **Complexidade (1 a 5):** Exige @implementor e @auditor pesados? (Reduz o score para nao travar o pool).
- **Fator Cascata (1 a 5):** Quantos outros scripts/modulos dependem disso para funcionar?

**Regra de Acao:**

1. Tasks com Score > 25 furam a fila (`tasks.json` -> move to top).
2. Tasks com Alta Complexidade (5) sao obrigatoriamente divididas em Sub-Tasks antes de entrar no Kernel.
3. **Atribuicao de Nivel:** As tarefas recebem a key de metadata `priority` ('critical', 'high', 'medium', 'low', 'normal'). O SQLite puxa automaticamente as tarefas criticas (furando a fila).
4. **Fatiamento Dinamico (Dispatcher):** Tarefas com Alta Complexidade sao obrigatoriamente divididas pelo `@dispatcher` em sub-tasks interdependentes, pulverizando o peso cognitivo na malha.
5. **Orquestracao em Grafo (DAG - Sequenciador):** O banco de dados analisa ativamente a array `depends_on`. O worker IGNORA silenciosamente qualquer tarefa cujas dependencias ainda nao estejam finalizadas (`status = completed`).
