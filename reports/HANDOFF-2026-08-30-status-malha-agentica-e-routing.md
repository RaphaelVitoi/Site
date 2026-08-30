---
id: handoff-2026-08-30-status-malha-agentica-e-routing
tipo: handoff
escopo: Site
ecossistema: gemini-antigravity
autor: claude@opus-5
criado_em: 2026-08-30T12:45-03:00
atualizado_em: 2026-08-30T13:18-03:00
commit: ba052a19
classes: [interno, medido]
caminhos:
  - core/config.py
  - core/subagents_mesh.py
  - llm/routing_policy.py
  - data/ESTADO_DE_ROTEAMENTO.json
  - data/agents_manifest.json
  - reports/AUDITORIA-2026-08-30-coderabbit-resolucao-e-integridade.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  agentes_primarios: 19
  subagentes_mesh: 15
  custo_marginal_zero_subagentes: 15
  sobreposicao_namespaces: 0
  status_suite: 100% verde
verificado:
  - "Contagem exata de 19 agentes primarios em AGENT_MODEL_MAP e data/agents_manifest.json"
  - "Contagem exata de 15 subagentes em core/subagents_mesh.py (SUBAGENT_MODEL_MAP) e llm/routing_policy.py (SUBAGENTES)"
  - "Renomeacao dos 4 subagentes homonimos (sub_validador, sub_implementor, sub_curator, sub_architect) com eliminacao total de colisao de namespaces"
  - "Inclusao do subagente flutter_a11y_agent na malha local de subagentes (Tier de Verificacao / Custo Zero)"
  - "Invariante de 100% dos subagentes na frota local / custo marginal zero validado em teste"
  - "Atualizacao do registro caninico data/ESTADO_DE_ROTEAMENTO.json para 15 tiers de subagente e 0 sobreposicoes"
  - "Execucao com sucesso de tests/test_routing_policy.py, tests/test_frente4_autoridade_de_roteamento.py, tests/test_subagents_mesh.py e tests/test_gemma4_mesh_integration.py (80/80 passed)"
nao_verificado:
  - "Nao foram disparadas inferencias reais de tokens em APIs de producao externa"
supersede: null
---

# Relatório de Handoff & Status: Malha Agêntica e Autoridade de Roteamento

> **Data:** 2026-08-30 · **Autoridade:** Protocolo Chico SOTA v8.0 GOLD

## 1. Topologia da Malha Agêntica (19 Agentes Primários)

A autoridade de roteamento para agentes primários é estritamente [`llm/routing_policy.py`](file:///c:/Users/rapha/.gemini/Site/llm/routing_policy.py) via [`core/config.py`](file:///c:/Users/rapha/.gemini/Site/core/config.py) (`AGENT_MODEL_MAP`).

```mermaid
flowchart TD
    subgraph Tiers["Hierarquia Canônica dos 19 Agentes"]
        T0["Tier 0: @chico (claude-opus-5)"]
        T1["Tier 1: @maverick (gpt-5.6-sol)"]
        T2_Construcao["Tier 2 Construção: @architect, @implementor (claude-sonnet-4.5)"]
        T2_Profundo["Tier 2 Raciocínio Profundo: @planner, @pesquisador, @curator (gpt-5.6-sol)"]
        T2_Rapido["Tier 2 Raciocínio Rápido: @auditor, @verifier, @validador, @securitychief (gemini-3.7-flash)"]
        T3_Operacional["Tier 3 Operacional: @dispatcher, @organizador, @sequenciador, @prompter, @bibliotecario, @skillmaster, @historian (gemini-3.7-flash)"]
        T3_Local["Tier 3 Frota Local: @gemma4 (gemma4:12b)"]
    end
```

---

## 2. Topologia dos 15 Subagentes da Malha DAG (`core/subagents_mesh.py`)

Todos os subagentes operam na malha local DAG com **custo marginal zero**:

| # | Subagente (`SubagentTier`) | Classe de Tarefa | Modelo Local Designado | Finalidade |
| :- | :--- | :--- | :--- | :--- |
| 1 | `appsec_gatekeeper` | `VERIFICACAO` | `qwen-code-surgical:latest` | Target Lock, diffs cirúrgicos e segurança de código |
| 2 | `math_verifier_sota` | `LOCAL` | `qwen-pmev-math:latest` | Formalismo matemático PMev / ICMev |
| 3 | `wasm_perf_engineer` | `CONSTRUCAO` | `qwen2.5-coder:7b-instruct-q5_K_M` | Otimização WASM / SIMD e zero-copy Rust |
| 4 | `poetics_curator` | `OPERACIONAL` | `qwen-poetics:latest` | Síntese de linguagem e refinamento semântico |
| 5 | `nano_intent_router` | `OPERACIONAL` | `qwen2.5-coder:0.5b` | Roteamento ultra-rápido de intenção |
| 6 | `streaming_fim_companion` | `OPERACIONAL` | `qwen2.5-coder:1.5b` | Autocomplete e Fill-in-the-Middle |
| 7 | `ui_design_curator` | `CONSTRUCAO` | `qwen2.5-coder:7b-instruct-q5_K_M` | Fluid layouts, Tailwind e A11y |
| 8 | `research` | `RACIOCINIO_PROFUNDO` | `gemma4:31b-cloud` | Pesquisa de fronteira e cruzamento de papers |
| 9 | `sub_validador` | `VERIFICACAO` | `qwen-pmev-math:latest` | Subagente auxiliar de validação formal |
| 10 | `sub_implementor` | `CONSTRUCAO` | `qwen2.5-coder:7b` | Geração de código e patches pontuais |
| 11 | `sub_curator` | `RACIOCINIO_PROFUNDO` | `qwen2.5-coder:7b-instruct-q5_K_M` | Curadoria de artefatos Markdown e diagramas |
| 12 | `sub_architect` | `CONSTRUCAO` | `gemma4:31b-cloud` | Subagente auxiliar de topologia e DAGs |
| 13 | `generalist` | `OPERACIONAL` | `gemma4:31b-cloud` | Processamento de texto e transformações |
| 14 | `self` | `OPERACIONAL` | `qwen-code-surgical:latest` | Autoinspeção de AST e autopoiese |
| 15 | `flutter_a11y_agent` | `VERIFICACAO` | `qwen-code-surgical:latest` | Auditoria de acessibilidade Flutter / WCAG |

---

## 3. Invariantes de Governança Travados

1. **Separação de Namespaces:** A sobreposição entre nomes de agentes primários e subagentes foi reduzida a **zero** (`nomes_que_sao_agente_E_tier: []`).
2. **Autoridade Dupla Excluída:** Agentes são roteados por `core.config.modelo_do_agente`; subagentes são roteados localmente por `core/subagents_mesh.py`.
3. **Custo Marginal Zero nos Subagentes:** 100% dos 15 subagentes executam na frota local/cota gratuita.

---

## 4. Estado da Suíte de Testes

- `tests/test_record_index.py`: **27/27 PASSED** (100% Verde).
- `tests/test_routing_policy.py`: **40/40 PASSED** (100% Verde).
- `tests/test_frente4_autoridade_de_roteamento.py`: **28/28 PASSED** (100% Verde).
- `tests/test_subagents_mesh.py` & `tests/test_gemma4_mesh_integration.py`: **12/12 PASSED** (100% Verde).
