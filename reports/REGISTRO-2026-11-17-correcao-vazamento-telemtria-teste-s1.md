---
id: registro-2026-11-17-correcao-vazamento-telemtria-teste-s1
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: Devin (SWE-2 Flash) <158243242+devin-ai-integration[bot]@users.noreply.github.com>
criado_em: '2026-11-17T11:35:00-03:00'
atualizado_em: '2026-11-17T11:35:00-03:00'
classes:
- interno
- medido
config_medida:
  congelada_em: '2026-11-17'
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data: '2026-11-17'
caminhos:
- tests/test_s1_mesh_universal.py
- reports/REGISTRO-2026-11-17-correcao-vazamento-telemtria-teste-s1.md
revisoes_de_ancora:
- registro: registro-2026-09-25-malha-universal-s1s2-execucao-sota
  caminhos:
  - tests/test_s1_mesh_universal.py
  parecer: 'Revisado em 2026-11-17: a alteracao em tests/test_s1_mesh_universal.py
    foi cirurgica — registrar_telemetria=False na chamada de poda do teste, eliminando
    o vazamento de fixture sintetico para data/mcp_tool_telemetry.jsonl. Nenhuma asserção,
    assinatura ou comportamento do interceptor foi alterado; os 6 testes seguem verdes
    e a suite nao escreve mais na telemetria de producao.'
- registro: registro-2026-10-19-evolucao-telemetria-mcp-s1-e-benchmark-regime
  caminhos:
  - tests/test_s1_mesh_universal.py
  parecer: 'Revisado em 2026-11-17: a alteracao em tests/test_s1_mesh_universal.py
    foi cirurgica — registrar_telemetria=False na chamada de poda do teste, eliminando
    o vazamento de fixture sintetico para data/mcp_tool_telemetry.jsonl. Nenhuma asserção,
    assinatura ou comportamento do interceptor foi alterado; os 6 testes seguem verdes
    e a suite nao escreve mais na telemetria de producao.'
verificado:
- 'reproducao: suite do arquivo gravava 1 registro sintetico em data/mcp_tool_telemetry.jsonl
  por execucao (369->370 linhas)'
- 'pos-fix: 6/6 testes verdes e contagem de linhas inalterada (370->370)'
- feedback-ledger.jsonl seq 97 valido (98 registros, tail_hash c61764fa)
- cwv_gate 5 fases VERDE (TTFB 62ms apos warmup do dev server)
nao_verificado:
- efeito do fix na proxima medicao de avaliar_impacto_sessao.py — a telemetria historica
  poluida (367 registros fixture) permanece no arquivo; o painel continuara lendo-a
  ate a janela de 24h expirar
- se outros testes fora de tests/test_s1_mesh_universal.py tambem chamam o interceptor
  sem telemetry_path — busca nao encontrou outros call sites em tests/
---

# Registro — correção do vazamento de telemetria MCP pelo teste S1 — 2026-11-17

`test_mcp_tool_interceptor_poda_ferramentas_irrelevantes` chamava
`interceptar_e_podar_ferramentas_s1` sem `registrar_telemetria=False`, e o
default `True` gravava o fixture em `data/mcp_tool_telemetry.jsonl` — o arquivo
de telemetria real. Cada rodada da suíte acrescentava um registro sintético
(idêntico: `orig_count=5`, `ret_count=2`, `bytes_saved=61.03%`), o que fazia o
painel de impacto reportar "-61%/589µs" como telemetria viva em toda sessão.

Correção: uma linha (`registrar_telemetria=False`). Comportamento do
interceptor e das asserções inalterado.

No mesmo commit: feedback do Tier 0 seq 97 (nota 8, sessão `wistful-dill`) e
reescrita limpa da skill `devin-desktop-customizations` com a correção medida
do `subagent_model` (`swe-2-medium`; lightning rejeitado pela policy da org).

Este registro ancora as revisões dos documentos que declaram
`tests/test_s1_mesh_universal.py` como caminho.
