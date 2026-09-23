---
id: validacao-2026-09-23-ci-ruff-nucleo-mcp
tipo: validacao
escopo: Site — reparo do lint remoto apos publicacao do nucleo MCP
ecossistema: nexus-sota
autor: Codex GPT-6 Luna <noreply@openai.com>
criado_em: '2026-09-23T16:24:32-03:00'
atualizado_em: '2026-09-23T16:24:32-03:00'
classes: [interno, medido, validacao, ci]
caminhos:
  - llm/orchestrator.py
  - scripts/ops/suite_verde.py
  - reports/HANDOFF-2026-09-23-nucleo-mcp-curadoria-codex.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  commit_base: 73fe8a2793a3a76000d9a4c1496997f56d366ad9
  ci_run: 35908825256
  session_id: 01a0cd79-1e50-7aa3-9865-32e051504374
  condutor: Codex GPT-6 Luna <noreply@openai.com>
  modelo: gpt-6-luna
  veiculo: codex
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-09-23
verificado:
  - CI do commit 73fe8a27 reprovou nas duas matrizes Python antes do pytest por tres diagnosticos Ruff
  - ruff check . e ruff format --check . passaram apos a correcao dos tres diagnosticos
  - importacao de llm.orchestrator passou apos mover o import puro do adaptador Laya para o topo
nao_verificado:
  - CI remoto da correcao, ainda nao publicada neste registro
  - suite integral e gate de commit do conteudo corrigido, pendentes no instante de criacao
pendencias: []
pendencias_resolvidas: []
revisoes_de_ancora:
  - registro: registro-2026-09-19-refatoracao-sonar-python-e-icm
    caminhos: [scripts/ops/suite_verde.py]
    parecer: A alteracao so ordena o import de psutil e encadeia a causa do timeout; a selecao, paralelismo e cache da suite nao mudam. A medicao historica do registro permanece valida.
---

# Validacao — Ruff no CI

O CI [35908825256](https://github.com/RaphaelVitoi/Site/actions/runs/35908825256) do commit `73fe8a27` reprovou no passo `ruff check .` em Python 3.12 e 3.13. O log da matriz 3.13 apontou `PLC0415` em `llm/orchestrator.py`, `I001` e `B904` em `scripts/ops/suite_verde.py`. O pytest remoto nao chegou a iniciar.

O adaptador `llm.laya_bridge` importa apenas recursos leves no nivel de modulo. `compor_advisory_s1` foi movido para o bloco de imports de `llm.orchestrator`; as duas importacoes locais redundantes foram retiradas. Em `suite_verde.py`, `psutil` foi movido para o grupo de terceiros e a excecao de timeout passou a encadear a causa original. Nao houve supressao de regra.

O lint e a importacao local passaram apos a alteracao. A suite e o CI da nova arvore precisam ser medidos antes de declarar fechamento remoto. O handoff anterior permanece como registro do estado antes desta falha remota.
