---
id: registro-2026-08-29-a-fila-que-roda
tipo: registro
escopo: Site
ecossistema: gemini-antigravity
autor: claude@opus-5
criado_em: 2026-08-29T09:20-03:00
classes: [interno]
decide: corrige o registro da pendencia 1 e devolve a decisao ao vertice
caminhos:
  - data/DECLARADO_E_NAO_LIDO.json
  - .claude/MODUSOPERANDI/SYSTEM_ROUTING_MAP.md
verificado:
  - "duas buscas independentes por get_next_task e promote_starved_tasks -- ripgrep respeitando gitignore, e um grep exaustivo da arvore inteira; as duas concordam: fora das proprias definicoes, so ha chamador em tests/"
  - "worker/loop.py linhas 216-218 lidas -- a fila de producao busca com get_tasks(status pending) e decide com UniversalArbitrator"
  - "core/arbitrator.py linhas 42-43 lidas -- TIME_DECAY_ALPHA e PROPAGATION_GAMMA sao ClassVar hardcoded, sem leitura de core.config"
  - "procura por invoke_routing_map_visualization na arvore -- zero ocorrencias fora da frase que a cita"
  - "suite completa 631 passed com basetemp isolado; nenhum modulo Python foi alterado neste commit"
nao_verificado:
  - "nao executei a fila em carga para observar a ordem de saida; a prova aqui e de leitura de chamadores, nao de comportamento"
  - "nao verifiquei se o core Rust (nexus_core_rust) reimplementa a formula com outras constantes -- so que recebe as duas do Python"
---

# A fila que roda nao e a fila que estava documentada

## O que eu disse, e o que medi

No handoff de hoje eu escrevi a pendencia 1 assim: *"`PRIORITY_WEIGHTS`
carregado e nunca lido -- a fila ordena por string no SQL"*. A primeira metade
esta certa. **A segunda esta errada.**

`database/queue_manager.get_next_task` -- o CTE com `json_each`, o `CASE
priority WHEN 'critical' THEN 1 ...`, a docstring que fala em *"maximizando
hit-rate no indice"* -- **nao roda em producao**. Tem um unico chamador, e e um
teste: `tests/test_database_sota.py:102`. O mesmo vale para
`promote_starved_tasks`, chamado so em `tests/test_database_sota.py:325`.

A fila que roda esta em `worker/loop.py:_dispatch_optimal_task`:

```python
pending_tasks = await manager.get_tasks(status="pending")   # busca TODAS
task = await loop.run_in_executor(None, UniversalArbitrator.extract_optimal_task, pending_tasks)
```

Nao ha `ORDER BY` nenhum nesse caminho. Quem ordena e o arbitrador, em Python
(ou no core Rust), por `P(v) + alpha * log1p(dT)`.

## Tres mecanismos para a mesma grandeza

| # | mecanismo | estado |
| :-- | :--- | :--- |
| 1 | `priority_weights` em `data/system_config.json`, carregado para `core.config.PRIORITY_WEIGHTS` | **sem leitor** |
| 2 | o `CASE` em SQL + `promote_starved_tasks` | vivos, **sem chamador de producao** |
| 3 | `UniversalArbitrator`, com `TIME_DECAY_ALPHA=1.5`, `PROPAGATION_GAMMA=0.8` e `PRIORITY_SCALARS` **hardcoded** | **o unico que roda** |

O botao existe (1), a maquina existe (3), e eles nao se tocam. O mecanismo que
decide ignora o `system_config.json`; o valor que o operador configura nao chega
a lugar nenhum. Entre os dois sobra um terceiro (2) que ninguem aciona.

Isto e a familia de falha dominante desta base -- ver
[[sinal-verde-desconectado]] -- numa variante nova: **nao e que o consumidor da
saida seja o relatorio que a declara saudavel; e que o unico consumidor da
funcao seja o teste que a exercita.** O teste passa, a latencia foi ate medida
sob carga em `2026-06-04_SOTA_v7_GOLD_Walkthrough_Stress_MCP.md` ("5.19ms"), e
nada disso toca a producao.

## Por que eu nao liguei o botao

Ligar `PRIORITY_WEIGHTS` no arbitrador exige saber qual chave do config
corresponde a qual constante do codigo. **Nao se infere:**

```
config:  alpha=1.0   beta=1.5   gamma=0.5    lambda_age=0.01
codigo:  TIME_DECAY_ALPHA=1.5   PROPAGATION_GAMMA=0.8
```

O valor do `alpha` do codigo (1,5) e o `beta` do config. O `gamma` do config
(0,5) nao e o `PROPAGATION_GAMMA` do codigo (0,8). E `lambda_age` nao tem par --
o decaimento no codigo e `log1p`, sublinear, sem taxa exponencial onde um
lambda caberia.

Casar por semelhanca numerica seria inventar convencao, e convencao se pergunta.
Alem disso a mudanca altera a ordem em que tarefa sai da fila, o que e escolha
operacional, nao limpeza.

## O que este registro muda

Nada de comportamento. Corrige dois documentos que afirmavam o falso:

- `data/DECLARADO_E_NAO_LIDO.json` -- a entrada de `PRIORITY_WEIGHTS` dizia que
  a ordenacao efetiva era o `CASE` em SQL. Reescrita com a medicao.
- `.claude/MODUSOPERANDI/SYSTEM_ROUTING_MAP.md` -- as duas arestas do Worker
  nomeavam `get_next_task`. Passaram a nomear `get_tasks` + `UniversalArbitrator`.

E declara um achado colateral: aquele mapa afirmava ser *"gerado dinamicamente
pela rotina `invoke_routing_map_visualization.ps1`"* e *"um artefato vivo que se
atualiza"*. **A rotina nao existe no repositorio.** Foi por isso que o diagrama
envelheceu apontando para a fila morta: um documento que se declara automatico
nao e revisado por ninguem. A frase saiu, e no lugar dela ficou escrito que o
arquivo e manual.

## Divida declarada, nao resolvida

- **O par 1-3**: o mapeamento config -> arbitrador. Decisao do vertice.
- **O mecanismo 2**: `get_next_task` e `promote_starved_tasks` continuam no
  codigo. Podem ser o caminho pretendido para o futuro ou residuo; apagar
  tambem e decisao. Enquanto ficarem, os testes que os cobrem medem uma fila
  que nao existe em producao -- e util saber disso ao ler a cobertura.
- **Dois defaults divergentes, hoje sem efeito**: a coluna nasce
  `priority TEXT DEFAULT 'normal'` (`queue_manager.py:226`) e o `CASE` em SQL nao
  tem ramo para `'normal'` -- cai no `ELSE 3`, junto de `'medium'`. O arbitrador,
  por sua vez, assume `'medium'` quando o metadata nao traz prioridade, enquanto
  o banco assume `'normal'`. Os dois valem 1000.0 em `PRIORITY_SCALARS`, entao
  hoje coincidem por acidente. Mexer em qualquer um dos escalares separa os dois.
