# Topologia e Manifesto de Suítes de Testes SOTA v8.0 GOLD

```
╔════════════════════════════════════════════════════════════════════════════════╗
║ ARQUITETURA DE SUÍTES DE TESTES (PYTEST & JEST)                                ║
║ 🛡️ PADRÃO: SOTA INTEGRITY GUARD ATIVO (0 ERROS / <= 2 WARNINGS)                 ║
║ ⚡ EXECUÇÃO: `nexus test --suite <id>` / `nexus gate`                           ║
╚════════════════════════════════════════════════════════════════════════════════╝
```

## 1. Suítes Temáticas Backend (Pytest)

| Suite ID | Nome Temático | Foco de Domínio / Camadas | Arquivos Cobertos | Testes |
| :--- | :--- | :--- | :--- | :---: |
| **`pmev`** | Perspectiva Matemática & Game Theory | PMev (Raphael Vitoi), RIO, Dynamic EV(fold), ICM Matrix e Solvers | `test_vitoi_perspective_engine.py`, `test_icm_matrix.py`, `test_math_rio.py`, `test_math_sota.py`, `test_perspective_api.py`, `test_solver_importers.py` | 52 |
| **`core_ai`** | Mente Coletiva & Grafos Causais | Inferência Bayesiana, DAGs de Pearl, Invariantes e Performance | `test_engine_bayesian_sota.py`, `test_bayesian.py`, `test_causal_graph.py`, `test_sota_core_engines.py`, `test_core_coverage.py`, `test_engine_perf.py` | 64 |
| **`agents_llm`** | Multi-Agent & 19 Avatares | 19 Personas, Roteamento LLM, Failover, Gemma Local e Voz Neural | `test_agents_sota.py`, `test_avatars_portfolio.py`, `test_subagents_mesh.py`, `test_task_routing.py`, `test_routing_policy.py`, `test_model_registry.py`, `test_llm_layer_sota.py`, `test_gemma_server_sota.py`, `test_nexus_voice.py` | 118 |
| **`database_infra`**| Infraestrutura & Fila SQLite WAL | Isolamento ACID, Watchdog MDA, Circuit Breakers e Bucketing | `test_database_sota.py`, `test_monitoring_sota.py`, `test_stress_circuit_breaker.py`, `test_utils_sota.py` | 62 |
| **`security_governance`** | SOTA Guard & Governança | Hardening, Desambiguação de Rotas, Sanitização e Nexus CLI | `test_backend_hardening.py`, `test_security_sanitization.py`, `test_desambiguacao.py`, `test_cli_nexus.py` | 54 |

## 2. Comandos de Linha de Comando (CLI)

```bash
# Listar todas as suítes temáticas
.\nexus test --list

# Executar uma suíte específica com SOTA Guard
.\nexus test --suite pmev
.\nexus test --suite core_ai
.\nexus test --suite agents_llm
.\nexus test --suite database_infra
.\nexus test --suite security_governance

# Executar todas as suítes (385 testes)
.\nexus test --suite all

# Executar a Master Quality Gate (10 Fases: Lint, TSC, Build, Jest, Pytest, CWV)
.\nexus gate
```

## 3. Fonte Única da Verdade

- O manifesto versionado vive em: [`tests/TEST_SUITES_MANIFEST.json`](file:///C:/Users/rapha/.gemini/Site/tests/TEST_SUITES_MANIFEST.json)
