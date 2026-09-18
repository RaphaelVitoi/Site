# GEMINI CLI MASTER PROTOCOL - CHICO SOTA v8.0 GOLD (SITE ARCHITECTURE)

> Governança Suprema sob `RULE[user_global]`. Foco de Engenharia: Ecossistema Nexus, Fullstack SOTA & Teoria dos Jogos PMev.

---

## II. POLÍTICA DE ENGENHARIA DE ESCOPO LIMITADO (TARGET LOCK)

1. **Target Lock Estrito:** Imutabilidade de linhas fora do escopo do prompt. Preservação integral de contratos públicos. Diffs atômicos de 120-150 linhas.
2. **Zero-Any & Tipagem Dual:** Pydantic v2 no backend Python e Zod / TypeScript estrito no frontend.
3. **Execução em Ambiente Virtual:** Comandos executados estritamente via `.venv/Scripts/python.exe` ou `uv run`.

---

## III. CICLO DE VIDA DE ARTEFATOS E DETERMINISMO

$$\text{Task List (task.md)} \longrightarrow \text{Implementation Plan (implementation\_plan.md)} \longrightarrow \text{Code Diffs} \longrightarrow \text{Walkthrough (walkthrough.md)} \longrightarrow \text{Screenshots}$$

---

## IV. SAÍDA MULTIMODAL & VISUAL ENGINE SOTA

1. **Indexação Zero-Token:** Conformidade com Seção 10 do `MODUS_OPERANDI.md`.
2. **Diagramação Mermaid Validada:** Proibição de `gantt` e `xychart-beta`. Uso de `flowchart`, `stateDiagram-v2`, `sequenceDiagram`, `classDiagram`.
3. **KaTeX Blindado:** Fórmulas matemáticas com `$..$` ou `$$..$$` e escape de valores monetários com `\$`.
---

## V. DELEGAÇÃO ASSÍNCRONA EM NUVEM (GOOGLE JULES VIA MCP)

1. **Topologia Trilateral Canônica:**
   * `C:\Users\rapha`: Monorepo administrativo e gestão de chaves/ambiente (`HKCU:\Environment:JULES_API_KEY`, `GOOGLE_CLOUD_PROJECT`).
   * `C:\Users\rapha\.gemini`: Raiz multiprojeto canônica, registro de MCP Servers (`mcp_config.json`) e skills globais.
   * `C:\Users\rapha\.gemini\Site`: Raiz do projeto principal (PMev + Website), consumidor do bridge MCP e despachador de tarefas pesadas.
2. **Padrão Fire-and-Poll & Invariância de Testes:**
   * Tarefas de longa duração (simulações Monte Carlo de alta densidade no motor PMev, upgrades de framework, suítes massivas de testes) são despachadas via `engine/jules_bridge.py` ou `.mcp.json` (`google-jules`).
   * Execução em background não-bloqueante com monitoramento por `jules_get_session_status`, aprovação formal de plano via `jules_approve_plan` e inspeção de patch com `jules_get_diff` antes de qualquer merge no workspace local.

---
*Protocolo Site v8.0 GOLD integrado e ativo sob Soberania de Raphael Vitoi.*
