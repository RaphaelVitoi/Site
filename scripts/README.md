# Catálogo de Engenharia e Roteamento de Scripts SOTA v8.0 GOLD

```
╔════════════════════════════════════════════════════════════════════════════════╗
║ TAXONOMIA E CATÁLOGO DE SCRIPTS DO ECOSSISTEMA                                 ║
║ 🛡️ PADRÃO: ZERO SCRIPT ÓRFÃO OU QUEBRADO · 100% AUDITADO                       ║
║ ⚡ CONSULTA VIA CLI: `nexus scripts --list`                                     ║
╚════════════════════════════════════════════════════════════════════════════════╝
```

## 1. Categorias de Scripts

| Domínio | Diretório | Descrição |
| :--- | :--- | :--- |
| **`ops`** | [`scripts/ops/`](file:///C:/Users/rapha/.gemini/Site/scripts/ops/) | Portão Core Web Vitals (`cwv_gate.ps1`), Criptografia SRI SHA-512, Pre-Compress Brotli/Gzip e Ollama. |
| **`maintenance`** | [`scripts/maintenance/`](file:///C:/Users/rapha/.gemini/Site/scripts/maintenance/) | Auditoria integral (`audit_ecosystem_tests_scripts.py`), teste de sanidade QA e higienização temporal. |
| **`routines`** | [`scripts/routines/`](file:///C:/Users/rapha/.gemini/Site/scripts/routines/) | Sincronização dos 19 agentes (`sync_agents_reality.ps1`), auditorias de rota e testes de estresse. |
| **`benchmarks`** | [`scripts/`](file:///C:/Users/rapha/.gemini/Site/scripts/) | Benchmarks de aceleração quântica/SIMD (`benchmark_sota_suite.py`, `test_tensor_bridge.py`). |
| **`cli`** | [`scripts/cli/`](file:///C:/Users/rapha/.gemini/Site/scripts/cli/) | CLI mestre Nexus (`nexus.py`) e sintetizador de voz neural (`nexus_voice.py`). |

## 2. Comandos Operacionais

```bash
# Consultar o catálogo completo de scripts
.\nexus scripts --list

# Filtrar por categoria
.\nexus scripts --category ops
.\nexus scripts --category maintenance
.\nexus scripts --category routines

# Executar a auditoria global do ecossistema
.venv\Scripts\python.exe scripts/maintenance/audit_ecosystem_tests_scripts.py
```

## 3. Fonte Única da Verdade

- O catálogo versionado vive em: [`scripts/SCRIPTS_CATALOG.json`](file:///C:/Users/rapha/.gemini/Site/scripts/SCRIPTS_CATALOG.json)
