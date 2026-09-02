---
id: auditoria-2026-09-01-formatacao-ruff-e-ancoras
tipo: relatorio
escopo: Site
ecossistema: nexus-sota
autor: devin@cognition
criado_em: 2026-09-01T09:00-03:00
atualizado_em: 2026-09-01T09:00-03:00
classes:
- interno
- medido
config_medida:
  raiz: C:/Users/Administrator/repos/Site2
  so: Windows
  python: 3.14.7
  ruff: 0.16.3
  congelada_em: '2026-09-01'
caminhos:
- .ruff.toml
- .github/workflows/sota-ci.yml
revisoes_de_ancora:
- registro: taxonomia-canonica-de-documentacao-e-relatorios
  caminhos:
  - scripts/ops/record_gate.py
  parecer: 'Somente reindentacao, quebra de linha e parentizacao aplicadas por `ruff
    format`: a arvore sintatica dos caminhos ancorados e identica antes e depois (comparacao
    de `ast.dump`). O achado do registro segue valido, no mesmo arquivo e no mesmo
    simbolo; apenas o numero da linha pode deslocar.'
- registro: auditoria-2026-08-31-integridade-e-integracao-antigravity
  caminhos:
  - tests/test_cwv_gate_truthfulness.py
  - tests/test_governanca_skills.py
  parecer: 'Somente reindentacao, quebra de linha e parentizacao aplicadas por `ruff
    format`: a arvore sintatica dos caminhos ancorados e identica antes e depois (comparacao
    de `ast.dump`). O achado do registro segue valido, no mesmo arquivo e no mesmo
    simbolo; apenas o numero da linha pode deslocar.'
- registro: auditoria-2026-08-31-protocolos-handoff-git-clippy-e-relatorios
  caminhos:
  - engine/sota_web_browse.py
  parecer: 'Somente reindentacao, quebra de linha e parentizacao aplicadas por `ruff
    format`: a arvore sintatica dos caminhos ancorados e identica antes e depois (comparacao
    de `ast.dump`). O achado do registro segue valido, no mesmo arquivo e no mesmo
    simbolo; apenas o numero da linha pode deslocar.'
- registro: auditoria-cwv-lighthouse-2026-09-01
  caminhos:
  - tests/test_cwv_gate_truthfulness.py
  parecer: 'Somente reindentacao, quebra de linha e parentizacao aplicadas por `ruff
    format`: a arvore sintatica dos caminhos ancorados e identica antes e depois (comparacao
    de `ast.dump`). O achado do registro segue valido, no mesmo arquivo e no mesmo
    simbolo; apenas o numero da linha pode deslocar.'
- registro: frente-4-2026-08-28-autoridade-de-roteamento
  caminhos:
  - core/config.py
  - core/subagents_mesh.py
  - llm/routing_policy.py
  - tests/test_frente4_autoridade_de_roteamento.py
  parecer: 'Somente reindentacao, quebra de linha e parentizacao aplicadas por `ruff
    format`: a arvore sintatica dos caminhos ancorados e identica antes e depois (comparacao
    de `ast.dump`). O achado do registro segue valido, no mesmo arquivo e no mesmo
    simbolo; apenas o numero da linha pode deslocar.'
- registro: handoff-2026-08-29-auditoria-integridade-repositorio
  caminhos:
  - llm/routing_policy.py
  parecer: 'Somente reindentacao, quebra de linha e parentizacao aplicadas por `ruff
    format`: a arvore sintatica dos caminhos ancorados e identica antes e depois (comparacao
    de `ast.dump`). O achado do registro segue valido, no mesmo arquivo e no mesmo
    simbolo; apenas o numero da linha pode deslocar.'
- registro: handoff-2026-08-29-diagnostico-de-memoria
  caminhos:
  - tests/test_guard_memoria.py
  parecer: 'Somente reindentacao, quebra de linha e parentizacao aplicadas por `ruff
    format`: a arvore sintatica dos caminhos ancorados e identica antes e depois (comparacao
    de `ast.dump`). O achado do registro segue valido, no mesmo arquivo e no mesmo
    simbolo; apenas o numero da linha pode deslocar.'
- registro: handoff-2026-08-29-governanca-8tiers-vulnerabilidades-subagents
  caminhos:
  - core/subagents_mesh.py
  - engine/sota_web_browse.py
  - llm/routing_policy.py
  parecer: 'Somente reindentacao, quebra de linha e parentizacao aplicadas por `ruff
    format`: a arvore sintatica dos caminhos ancorados e identica antes e depois (comparacao
    de `ast.dump`). O achado do registro segue valido, no mesmo arquivo e no mesmo
    simbolo; apenas o numero da linha pode deslocar.'
- registro: handoff-2026-08-29-guard-corrigido-e-heranca
  caminhos:
  - tests/test_guard_memoria.py
  parecer: 'Somente reindentacao, quebra de linha e parentizacao aplicadas por `ruff
    format`: a arvore sintatica dos caminhos ancorados e identica antes e depois (comparacao
    de `ast.dump`). O achado do registro segue valido, no mesmo arquivo e no mesmo
    simbolo; apenas o numero da linha pode deslocar.'
- registro: handoff-2026-08-29-quatro-pendencias-e-o-que-elas-eram
  caminhos:
  - scripts/ops/record_gate.py
  parecer: 'Somente reindentacao, quebra de linha e parentizacao aplicadas por `ruff
    format`: a arvore sintatica dos caminhos ancorados e identica antes e depois (comparacao
    de `ast.dump`). O achado do registro segue valido, no mesmo arquivo e no mesmo
    simbolo; apenas o numero da linha pode deslocar.'
- registro: handoff-2026-08-29-roteamento-memoria-e-guard
  caminhos:
  - memory_rag.py
  parecer: 'Somente reindentacao, quebra de linha e parentizacao aplicadas por `ruff
    format`: a arvore sintatica dos caminhos ancorados e identica antes e depois (comparacao
    de `ast.dump`). O achado do registro segue valido, no mesmo arquivo e no mesmo
    simbolo; apenas o numero da linha pode deslocar.'
- registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
  caminhos:
  - llm/routing_policy.py
  - tests/test_architectural_stress_and_failover.py
  - tests/test_governanca_skills.py
  - tests/test_routing_policy.py
  parecer: 'Somente reindentacao, quebra de linha e parentizacao aplicadas por `ruff
    format`: a arvore sintatica dos caminhos ancorados e identica antes e depois (comparacao
    de `ast.dump`). O achado do registro segue valido, no mesmo arquivo e no mesmo
    simbolo; apenas o numero da linha pode deslocar.'
- registro: handoff-2026-08-30-resolucao-coderabbit-linters-e-malha-sota
  caminhos:
  - core/config.py
  - core/subagents_mesh.py
  - llm/routing_policy.py
  parecer: 'Somente reindentacao, quebra de linha e parentizacao aplicadas por `ruff
    format`: a arvore sintatica dos caminhos ancorados e identica antes e depois (comparacao
    de `ast.dump`). O achado do registro segue valido, no mesmo arquivo e no mesmo
    simbolo; apenas o numero da linha pode deslocar.'
- registro: handoff-2026-08-30-status-malha-agentica-e-routing
  caminhos:
  - core/config.py
  - core/subagents_mesh.py
  - llm/routing_policy.py
  parecer: 'Somente reindentacao, quebra de linha e parentizacao aplicadas por `ruff
    format`: a arvore sintatica dos caminhos ancorados e identica antes e depois (comparacao
    de `ast.dump`). O achado do registro segue valido, no mesmo arquivo e no mesmo
    simbolo; apenas o numero da linha pode deslocar.'
- registro: interludio-2026-08-28-concorrencia-e-isolamento
  caminhos:
  - scripts/ops/record_gate.py
  - scripts/ops/suite_isolada.py
  parecer: 'Somente reindentacao, quebra de linha e parentizacao aplicadas por `ruff
    format`: a arvore sintatica dos caminhos ancorados e identica antes e depois (comparacao
    de `ast.dump`). O achado do registro segue valido, no mesmo arquivo e no mesmo
    simbolo; apenas o numero da linha pode deslocar.'
- registro: plano-2b-painel-de-estado
  caminhos:
  - scripts/ops/record_gate.py
  parecer: 'Somente reindentacao, quebra de linha e parentizacao aplicadas por `ruff
    format`: a arvore sintatica dos caminhos ancorados e identica antes e depois (comparacao
    de `ast.dump`). O achado do registro segue valido, no mesmo arquivo e no mesmo
    simbolo; apenas o numero da linha pode deslocar.'
- registro: registro-2026-08-29-governanca-piramidal-sota
  caminhos:
  - core/subagents_mesh.py
  - engine/sota_web_browse.py
  - tests/test_sota_web_browse.py
  parecer: 'Somente reindentacao, quebra de linha e parentizacao aplicadas por `ruff
    format`: a arvore sintatica dos caminhos ancorados e identica antes e depois (comparacao
    de `ast.dump`). O achado do registro segue valido, no mesmo arquivo e no mesmo
    simbolo; apenas o numero da linha pode deslocar.'
- registro: registro-2026-08-29-o-fallback-que-nao-carrega
  caminhos:
  - tests/test_routing_policy.py
  parecer: 'Somente reindentacao, quebra de linha e parentizacao aplicadas por `ruff
    format`: a arvore sintatica dos caminhos ancorados e identica antes e depois (comparacao
    de `ast.dump`). O achado do registro segue valido, no mesmo arquivo e no mesmo
    simbolo; apenas o numero da linha pode deslocar.'
- registro: registro-2026-08-29-o-portao-le-o-indice
  caminhos:
  - scripts/ops/record_gate.py
  - tests/test_portao_le_o_indice.py
  parecer: 'Somente reindentacao, quebra de linha e parentizacao aplicadas por `ruff
    format`: a arvore sintatica dos caminhos ancorados e identica antes e depois (comparacao
    de `ast.dump`). O achado do registro segue valido, no mesmo arquivo e no mesmo
    simbolo; apenas o numero da linha pode deslocar.'
- registro: registro-2026-08-29-sota-triad-mesh-integracao
  caminhos:
  - engine/sota_triad_mesh.py
  parecer: 'Somente reindentacao, quebra de linha e parentizacao aplicadas por `ruff
    format`: a arvore sintatica dos caminhos ancorados e identica antes e depois (comparacao
    de `ast.dump`). O achado do registro segue valido, no mesmo arquivo e no mesmo
    simbolo; apenas o numero da linha pode deslocar.'
- registro: relatorio-2026-08-29-analise-integral-ecossistema-sota-v8-gold
  caminhos:
  - core/subagents_mesh.py
  - engine/sota_web_browse.py
  - llm/routing_policy.py
  parecer: 'Somente reindentacao, quebra de linha e parentizacao aplicadas por `ruff
    format`: a arvore sintatica dos caminhos ancorados e identica antes e depois (comparacao
    de `ast.dump`). O achado do registro segue valido, no mesmo arquivo e no mesmo
    simbolo; apenas o numero da linha pode deslocar.'
- registro: relatorio-2026-08-29-impacto-quantitativo-qualitativo-sota-v8-gold
  caminhos:
  - core/subagents_mesh.py
  - engine/sota_web_browse.py
  - llm/routing_policy.py
  parecer: 'Somente reindentacao, quebra de linha e parentizacao aplicadas por `ruff
    format`: a arvore sintatica dos caminhos ancorados e identica antes e depois (comparacao
    de `ast.dump`). O achado do registro segue valido, no mesmo arquivo e no mesmo
    simbolo; apenas o numero da linha pode deslocar.'
- registro: relatorio-handoff-20260830-teoria-dos-jogos-pmev-sota-v8-gold
  caminhos:
  - engine/game_theory_solvers.py
  parecer: 'Somente reindentacao, quebra de linha e parentizacao aplicadas por `ruff
    format`: a arvore sintatica dos caminhos ancorados e identica antes e depois (comparacao
    de `ast.dump`). O achado do registro segue valido, no mesmo arquivo e no mesmo
    simbolo; apenas o numero da linha pode deslocar.'
- registro: validacao-2026-08-28-arquitetura-de-memoria
  caminhos:
  - memory_rag.py
  - scripts/mcp_dynamic_server.py
  parecer: 'Somente reindentacao, quebra de linha e parentizacao aplicadas por `ruff
    format`: a arvore sintatica dos caminhos ancorados e identica antes e depois (comparacao
    de `ast.dump`). O achado do registro segue valido, no mesmo arquivo e no mesmo
    simbolo; apenas o numero da linha pode deslocar.'
verificado:
- formatacao_ruff_format
- comparacao_ast_dump
- integridade_sintatica
nao_verificado: nenhuma -- formatacao e reconciliacao estatica executadas integralmente
supersede: null
---

# Auditoria: formatacao ruff do repositorio e revisao das ancoras atingidas

## O que mudou

O job `Python Lint & Pytest Matrix` do CI roda `uv run ruff format --check .` e reprovava 50 arquivos ja versionados fora do formato declarado em `.ruff.toml`. Toda PR nascia vermelha por divida de formatacao alheia ao proprio diff. Este commit aplica `uv run ruff format .` e mais nada.

`.ruff.toml` passa a excluir `reports` e `.github`: o ruff 0.16 tambem formata blocos de codigo dentro de Markdown, e reindentar um bloco citado dentro de um registro adultera prova -- o portao de registro bloqueia, com razao, o commit que o faz. Os dois diretorios nao tem modulo executavel.

## Por que as ancoras nao foram invalidadas

Vinte e quatro registros declaram ancora em caminhos que este commit toca. Nenhum deles perdeu validade: comparei a arvore sintatica de cada um dos 50 arquivos `.py` antes e depois (`ast.dump` de `git show HEAD:<arquivo>` contra o arquivo formatado) e elas sao identicas. A unica excecao e a docstring de `tests/test_cli_nexus.py`, que comeca com aspas e ganhou um espaco de separacao -- texto de docstring, nao comportamento. As citacoes de linha nos registros podem deslocar-se onde o formatador quebrou ou juntou argumentos; o simbolo citado continua no mesmo arquivo e com o mesmo corpo. Por isso a reconciliacao vem como `revisoes_de_ancora` nesta auditoria central, e nao como reescrita dos registros historicos.

## Registros reconciliados

- `docs/architecture/REPOSITORY_TAXONOMY.md` -- `scripts/ops/record_gate.py`
- `reports/AUDITORIA-2026-08-31-integridade-e-integracao-antigravity.md` -- `tests/test_cwv_gate_truthfulness.py`, `tests/test_governanca_skills.py`
- `reports/AUDITORIA-2026-08-31-protocolos-handoff-git-clippy-e-relatorios.md` -- `engine/sota_web_browse.py`
- `reports/AUDITORIA-2026-09-01-cwv-lighthouse-e-integridade.md` -- `tests/test_cwv_gate_truthfulness.py`
- `reports/FRENTE-4-2026-08-28-autoridade-de-roteamento.md` -- `core/config.py`, `core/subagents_mesh.py`, `llm/routing_policy.py`, `tests/test_frente4_autoridade_de_roteamento.py`
- `reports/HANDOFF-2026-08-29-auditoria-integridade-repositorio.md` -- `llm/routing_policy.py`
- `reports/HANDOFF-2026-08-29-diagnostico-de-memoria.md` -- `tests/test_guard_memoria.py`
- `reports/HANDOFF-2026-08-29-governanca-8tiers-vulnerabilidades-subagents.md` -- `core/subagents_mesh.py`, `engine/sota_web_browse.py`, `llm/routing_policy.py`
- `reports/HANDOFF-2026-08-29-guard-corrigido-e-heranca.md` -- `tests/test_guard_memoria.py`
- `reports/HANDOFF-2026-08-29-quatro-pendencias-e-o-que-elas-eram.md` -- `scripts/ops/record_gate.py`
- `reports/HANDOFF-2026-08-29-roteamento-memoria-e-guard.md` -- `memory_rag.py`
- `reports/HANDOFF-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs.md` -- `llm/routing_policy.py`, `tests/test_architectural_stress_and_failover.py`, `tests/test_governanca_skills.py`, `tests/test_routing_policy.py`
- `reports/HANDOFF-2026-08-30-resolucao-coderabbit-linters-e-malha-sota.md` -- `core/config.py`, `core/subagents_mesh.py`, `llm/routing_policy.py`
- `reports/HANDOFF-2026-08-30-status-malha-agentica-e-routing.md` -- `core/config.py`, `core/subagents_mesh.py`, `llm/routing_policy.py`
- `reports/INTERLUDIO-2026-08-28-concorrencia-e-isolamento.md` -- `scripts/ops/record_gate.py`, `scripts/ops/suite_isolada.py`
- `reports/PLANO-2B-PAINEL-DE-ESTADO.md` -- `scripts/ops/record_gate.py`
- `reports/REGISTRO-2026-08-29-governanca-piramidal-sota.md` -- `core/subagents_mesh.py`, `engine/sota_web_browse.py`, `tests/test_sota_web_browse.py`
- `reports/REGISTRO-2026-08-29-o-fallback-que-nao-carrega.md` -- `tests/test_routing_policy.py`
- `reports/REGISTRO-2026-08-29-o-portao-le-o-indice.md` -- `scripts/ops/record_gate.py`, `tests/test_portao_le_o_indice.py`
- `reports/REGISTRO-2026-08-29-sota-triad-mesh-integracao.md` -- `engine/sota_triad_mesh.py`
- `reports/RELATORIO-2026-08-29-analise-integral-ecossistema-sota-v8-gold.md` -- `core/subagents_mesh.py`, `engine/sota_web_browse.py`, `llm/routing_policy.py`
- `reports/RELATORIO-2026-08-29-impacto-quantitativo-qualitativo-sota-v8-gold.md` -- `core/subagents_mesh.py`, `engine/sota_web_browse.py`, `llm/routing_policy.py`
- `reports/RELATORIO_HANDOFF_20260830_TEORIA_DOS_JOGOS_PMEV_SOTA_v8_GOLD.md` -- `engine/game_theory_solvers.py`
- `reports/VALIDACAO-2026-08-28-arquitetura-de-memoria.md` -- `memory_rag.py`, `scripts/mcp_dynamic_server.py`
