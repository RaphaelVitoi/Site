---
id: registro-2026-10-01-harmonizacao-malha-subagentes
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: gemini-3.8-flash
criado_em: 2026-10-01T19:30:00-03:00
commit: HEAD
classes: [interno, subagentes, routing, sota]
decide: harmonizacao da malha de 15 subagentes, atualizacao de clustering com gemini-3.8-flash e expansao de cobertura de testes
caminhos:
  - core/agent_clustering.py
  - llm/routing_policy.py
  - tests/test_subagents_mesh.py
  - reports/REGISTRO-2026-10-01-harmonizacao-malha-subagentes.md
verificado:
  - "clustering-sota: inclusao de MODEL_GEMINI_38_FLASH no Cluster Alpha e eliminacao de duplicata de MODEL_GEMINI_35_FLASH_LITE"
  - "routing-policy-harmonization: correcao do cabecalho de SUBAGENTES em llm/routing_policy.py removendo contagem obsoleta de 6 niveis conforme SS3"
  - "subagents-mesh-tests: suite de testes atualizada para SOTA v8.0 GOLD com cobertura completa de todas as heuristicas (APPSEC, MATH, POETICS, WASM, UI, RESEARCH, STREAMING_FIM, FLUTTER_A11Y, SELF) e validacao de integridade dos 15 tiers"
  - "bateria-pytest: 84/84 testes de subagentes, roteamento e integracao Gemma 4 aprovados com zero erros e zero warnings em 23.44s"
  - "governanca-agents: 40/40 testes de agentes, autonomia e governanca aprovados com zero erros e zero warnings em 1.23s"
nao_verificado:
  - "despacho de missoes reais de subagentes contra instanciador Ollama local em tempo de execucao (ambiente mockado nos testes)"
revisoes_de_ancora:
  - registro: registro-2026-09-19-refatoracao-sonar-python-e-icm
    caminhos:
      - llm/routing_policy.py
    parecer: >-
      Revisado. Atualizacao estritamente documental no cabecalho de SUBAGENTES
      em llm/routing_policy.py, removendo a mencao legada a 6 niveis em conformidade
      com o principio SS3 (fonte unica e imutabilidade de contagens versionadas no codigo).
      A logica de execucao, a tabela de 15 tiers e todas as assinaturas permanecem
      inalteradas e 100% compativeis.
---

# Harmonizacao da Malha de Subagentes, Clustering SOTA e Expansao de Testes

## 1. Contexto e Motivacao

Na esteira do Protocolo Chico SOTA v8.0 GOLD, foi conduzida uma auditoria minuciosa focada nos elementos de subagentes, orquestracao e clustering no ecossistema Site:
1. `core/agent_clustering.py`: constava com duplicacao da constante `MODEL_GEMINI_35_FLASH_LITE` no Cluster Alpha e sem o modelo topo de linha `MODEL_GEMINI_38_FLASH`.
2. `llm/routing_policy.py`: continha comentario desatualizado na linha 331 citando "6 niveis de subagente", embora a tabela declarada ja contivesse os 15 tiers canonicamente especificados em `core.subagents_mesh.SubagentTier`.
3. `tests/test_subagents_mesh.py`: cabecalho marcava a versao legada `SOTA v7.0 GOLD` e a suite de heuristicas omitia a validacao de ramos criticos como `POETICS`, `STREAMING_FIM` e `FLUTTER_A11Y`.

## 2. Acoes Executadas

1. **Clustering (`core/agent_clustering.py`):**
   - Declarado `MODEL_GEMINI_38_FLASH = "gemini-3.8-flash"`.
   - Adicionado `MODEL_GEMINI_38_FLASH` no topo do Cluster Alpha (Deep Reasoning & Architecture).
   - Eliminada a declaracao duplicada de `MODEL_GEMINI_35_FLASH_LITE`.
   - Atualizado banner de execucao de teste para `CHICO v8.0 GOLD`.

2. **Roteamento (`llm/routing_policy.py`):**
   - Harmonizado cabecalho da secao de subagentes para `# SUBAGENTES -- core.subagents_mesh.SubagentTier`.

3. **Bateria de Testes (`tests/test_subagents_mesh.py`):**
   - Atualizado docstring para `SOTA v8.0 GOLD`.
   - Incluidos casos de teste para as heuristicas `POETICS`, `STREAMING_FIM` e `FLUTTER_A11Y`.
   - Criado teste `test_subagents_mesh_tier_integrity` assegurando que todos os 15 tiers de `SubagentTier` possuem modelo atribuido em `SUBAGENT_MODEL_MAP` com custo zero.

## 3. Verificacoes e Telemetria

- Execucao completa de 84 testes em `test_subagents_mesh.py`, `test_routing_policy.py`, `test_frente4_autoridade_de_roteamento.py` e `test_gemma4_mesh_integration.py`: 100% aprovados, 0 erros, 0 warnings.
- Execucao de 40 testes adicionais em `test_agents_sota.py`, `test_governanca_agents.py` e `test_task_routing.py`: 100% aprovados, 0 erros, 0 warnings.
