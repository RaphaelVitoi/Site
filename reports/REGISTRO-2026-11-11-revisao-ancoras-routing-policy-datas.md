---
id: registro-2026-11-11-revisao-ancoras-routing-policy-datas
tipo: registro
escopo: Reconciliacao de ancoras do portao de registro para o commit que toca llm/routing_policy.py
alvo: llm/routing_policy.py (ancoras de 8 registros historicos)
status: concluido
autor: Devin (SWE-2 Flash) [Tier 1]
criado_em: '2026-11-11'
verificado:
  - 'git diff llm/routing_policy.py -- 2 insercoes e 2 remocoes, ambas no campo ancorado_em do dict ROTAS (ClasseTarefa.GOVERNANCA 2026-11-10 -> 2026-11-11; ClasseTarefa.OPERACIONAL 2026-11-10 -> 2026-11-12)'
  - 'nenhuma alteracao em rotas, modelos, fallbacks ou limites de tarefa — apenas metadado deancora de decaimento'
  - 'py_compile llm/routing_policy.py OK; portao CWV verde em producao (TTFB 19 ms) antes deste registro'
nao_verificado:
  - 'intencao do autor do diff original sobre a data futura 2026-11-12 em OPERACIONAL (registrada como observacao, nao como bloqueio)'
config_medida:
  congelada_em: '2026-11-11'
  raiz: C:/Users/rapha/.gemini/Site
  branch: main
  data_das_medicoes: '2026-11-11'
  toolchain: git diff + record_gate.py
caminhos:
  - reports/REGISTRO-2026-11-11-revisao-ancoras-routing-policy-datas.md
referencias_nao_resolviveis: []
revisoes_de_ancora:
  - registro: handoff-2026-10-20-harmonizacao-tier1-gemini-38
    caminhos: [llm/routing_policy.py]
    parecer: 'Delta e exclusivamente o campo ancorado_em (metadado de decaimento). Nenhuma rota, modelo citado ou fallback alterado; a substancia ancorada pelo handoff permanece integra.'
  - registro: plano-laya-integracao-s1s2-pmev-2026-09-20
    caminhos: [llm/routing_policy.py]
    parecer: 'Delta e exclusivamente o campo ancorado_em (metadado de decaimento). Nenhuma rota, modelo citado ou fallback alterado; a substancia ancorada pelo plano permanece integra.'
  - registro: registro-2026-09-19-refatoracao-sonar-python-e-icm
    caminhos: [llm/routing_policy.py]
    parecer: 'Delta e exclusivamente o campo ancorado_em (metadado de decaimento). Nenhuma rota, modelo citado ou fallback alterado; a substancia ancorada pelo registro permanece integra.'
  - registro: registro-2026-09-24-blindagem-ascii-e-harmonizacao-scripts
    caminhos: [llm/routing_policy.py]
    parecer: 'Delta e exclusivamente o campo ancorado_em (metadado de decaimento). Nenhuma rota, modelo citado ou fallback alterado; a substancia ancorada pelo registro permanece integra.'
  - registro: registro-2026-10-01-harmonizacao-malha-subagentes
    caminhos: [llm/routing_policy.py]
    parecer: 'Delta e exclusivamente o campo ancorado_em (metadado de decaimento). Nenhuma rota, modelo citado ou fallback alterado; a substancia ancorada pelo registro permanece integra.'
  - registro: registro-2026-10-13-saneamento-diagnosticos-ide-e-compatibilidade
    caminhos: [llm/routing_policy.py]
    parecer: 'Delta e exclusivamente o campo ancorado_em (metadado de decaimento). Nenhuma rota, modelo citado ou fallback alterado; a substancia ancorada pelo registro permanece integra.'
  - registro: registro-2026-10-20-harmonizacao-tier1-e-gemini-38
    caminhos: [llm/routing_policy.py]
    parecer: 'Delta e exclusivamente o campo ancorado_em (metadado de decaimento). Nenhuma rota, modelo citado ou fallback alterado; a substancia ancorada pelo registro permanece integra.'
  - registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
    caminhos: [llm/routing_policy.py]
    parecer: 'Delta e exclusivamente o campo ancorado_em (metadado de decaimento). Nenhuma rota, modelo citado ou fallback alterado; a substancia ancorada pelo registro permanece integra.'
---

# REGISTRO — Revisão de âncoras: `llm/routing_policy.py`

## Fato medido

O commit em stage toca `llm/routing_policy.py` com exatamente duas alterações,
ambas no campo `ancorado_em` do dicionário `ROTAS`:

| ClasseTarefa | Antes | Depois |
| :--- | :--- | :--- |
| `GOVERNANCA` | `2026-11-10` | `2026-11-11` |
| `OPERACIONAL` | `2026-11-10` | `2026-11-12` |

`ancorado_em` é o proxy de decaimento do roteador (ver
`tests/test_gpt6_astra.py:357`): metadado de vigência da rota, não comportamento.
Nenhuma rota, modelo citado, fallback ou limite de tarefa foi alterado — logo a
substância ancorada pelos 8 registros históricos permanece integra, e a
revisão declarada é a de "delta cosmético de data", não de mudança semântica.

## Observação registrada (não bloqueia)

`OPERACIONAL` ficou ancorado em `2026-11-12`, data futura à data deste registro
(2026-11-11). Âncora futura é incomum — pode ser intencional (janela de validade
planejada) ou deslize de digitação do autor do diff. Fica declarado em
`nao_verificado` para que uma sessão futura decida se a data deve recuar.

## Mecanismo

O portão de registro (`scripts/ops/record_gate.py`, M.O. 13.F) exige que todo
commit que toca caminho ancorado por registro vigente carregue, no mesmo commit,
uma `revisoes_de_ancora` válida. Este documento é o portador: cada entrada
cita o `id` do registro reconciliado, o caminho revisado (conjunto declarado em
`caminhos:` do alvo) e o parecer.
