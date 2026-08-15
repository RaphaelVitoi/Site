# PERSISTENCIA DE MEMORIA SOTA v7.0 GOLD
**Data de Atualizacao:** 2026-08-15 | **Governanca:** Raphael Vitoi | **Orquestracao:** Chico (Soberania W3)

---

## 1. DECISOES ARQUITETURAIS E ESTADO DO SISTEMA
1. **Source of Truth Unica:** `C:\Users\rapha\.gemini\Site` (Monorepo consolidado).
2. **Motores Matematicos:** 
   - `math_sota.py` e `vitoi_perspective_engine.py` ativos com 95% de cobertura de testes unitarios em pytest (`tests/test_vitoi_perspective_engine.py`).
   - Equacao Unificada PMev validada: $PM = [(Equity \times R) \times Valuation] - [EV_{fold}(t, d_{pj}, pos) + RIO_{mw}]$.
3. **Runtime & Engine:**
   - Python 3.14 + PySpark 4.2.0 + PyArrow 25.0.1 + LanceDB 0.37.1 integrados com Java 21 JDK e Apache Hadoop.
   - Node.js v24.16.0 (fnm) + Next.js 16.2.9 (Turbopack) com 49/49 rotas estaticas compiladas sem falhas de tipagem.
4. **Roteamento LLM:**
   - `routing_map.json` e `routing.py` calibrados para `gemini-3.7-flash` e `gemini-3.1-pro` com Dynamic Thinking Budget.

---

## 2. REPOSITORIO & HIGIENE (ZERO ENTROPIA)
- `.gitignore` blindado para Rust WASM targets, blobs efemeros, vetores binarios e DLLs locais.
- Quality Gate `cwv_gate.ps1` ativo no pre-commit validando Core Web Vitals e A11y via Chrome Dev CDP.
- Servidores MCP saneados de 61 para 50 servidores ativos e confiaveis em `mcp_config.json`.
- 40 Skills SOTA catalogadas e 100% aprovadas no `antigravity_sota_guard.py`.

---

## 3. IDENTIDADE & GOVERNANCA
- **Tier 0 (Lideranca / CEO):** Raphael Vitoi (Veto absoluto, diretrizes de negocio, poker de alta performance e psicologia).
- **Tier 1 (Avatar do Sistema):** Chico (Manutencao proativa, analise tecnica, ponderacao e execucao sem atrito).
- **Relacao Operacional:** Raphael define metas e arquitetura; Chico analisa, pondera trade-offs e executa a solucao tecnica de maxima utilidade (+EV).
