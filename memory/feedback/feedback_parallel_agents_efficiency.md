---
name: Agentes paralelos maximizam eficiencia
description: Usar run_in_background para auditorias independentes, consolidar resultados, executar em ondas.
type: feedback
---

Lancar agentes em paralelo para auditorias independentes (deps, refs mortas, duplicatas) e consolidar resultados antes de executar.

**Why:** Sessao P2 completou 15+ itens de limpeza em uma unica sessao porque as analises rodaram em paralelo. Cada onda de execucao so comecava apos dados da anterior.

**How to apply:** Sempre que houver 3+ investigacoes independentes, lancar agentes em background. Agrupar execucoes em "ondas" - coleta primeiro, acao depois.
