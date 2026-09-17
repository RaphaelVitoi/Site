# GEMINI CLI MASTER PROTOCOL - CHICO SOTA v8.0 GOLD (SITE ARCHITECTURE)

> Governança Suprema sob `RULE[user_global]`. Foco de Engenharia: Ecossistema Nexus, Fullstack SOTA & Teoria dos Jogos PMev.

---

## II. POLÍTICA DE ENGENHARIA DE ESCOPO LIMITADO (TARGET LOCK)

1. **Imutabilidade de Linhas Não Especificadas:** Proibido modificar, refatorar, renomear ou reformatar código, importações ou comentários fora do escopo explícito da solicitação (rejeição absoluta do "Boy Scout Rule").
2. **Preservação de Interfaces e Contratos:** Manter 100% inalteradas assinaturas públicas, tipos de retorno e interfaces existentes fora do escopo.
3. **Limite de Alvo (Target Lock):** Isolar os identificadores exatos autorizados antes de qualquer emissão de código.
4. **Formato SEARCH/REPLACE Cirúrgico:** Emitir alterações em blocos contextuais ancorados e atômicos.
5. **Zero-Any & Tipagem Estrita:** Tipagem obrigatória sem supressões de tipo. Utilizar `unknown` com type guards ou esquemas Zod (`z.infer`). Backend espelhado em Pydantic.
6. **Lei do Fatiamento (Zero-Rework):** Diffs de código limitados a blocos de **120-150 linhas**.

---

## III. PROTOCOLO DE INFERÊNCIA E ORQUESTRAÇÃO SILENCIOSA

* **Pipeline de Raciocínio Diacrônico:**
  $$\text{Antevisão Semântica} \longrightarrow \text{Análise Recursiva} \longrightarrow \text{Decomposição do Input} \longrightarrow \text{Análise Preditiva} \longrightarrow \text{Dedução Lógica}$$
* **Execução Silenciosa & Apresentação de Artefatos:** Executar rotinas e ferramentas internamente em segundo plano. Exibir ao usuário diretamente o produto final consolidado.
* **Otimização de Contexto & Caching:** Utilizar cache explícito de contexto e recursos de browser/nano para reduzir latência e custos de I/O em consultas recorrentes.

---

## IV. MATRIZ OPERACIONAL DE FRONTEIRA (COLETIVO CHICO)

* **Reasoning Profundo & Provas:** Claude Opus 5 / ChatGPT 5.6 Sol.
* **Governança, Código Cirúrgico & Contratos:** Claude Opus 5.
* **Arquitetura, Pesquisa & AppSec:** ChatGPT 5.6 Terra.
* **Orquestração, Fluxo Agêntico & Design:** Gemini 3.8 Flash (fallover 3.7 Flash) com Exa/Stitch/Jules.
* **Fast Operations, Linting & Limpeza:** Gemini 3.5 Flash-Lite / Qwen local.

---

## V. CICLO DE VIDA DE ARTEFATOS E DETERMINISMO

$$\text{Task List (task.md)} \longrightarrow \text{Implementation Plan (implementation\_plan.md)} \longrightarrow \text{Code Diffs} \longrightarrow \text{Walkthrough (walkthrough.md)} \longrightarrow \text{Screenshots}$$

## VI. PADRÃO-OURO DE OUTPUT MULTIMODAL & VISUAL ENGINE SOTA

1. **Indexação Zero-Token:** Todo agente/modelo consulta e aplica as regras do `MODUS_OPERANDI.md` (Seção 10) antes de produzir o primeiro byte de output.
2. **Diagramação Mermaid Validada:** Proibição estrita de `gantt` e `xychart-beta`. Uso exclusivo de `flowchart TD/LR`, `graph TD/LR`, `stateDiagram-v2`, `sequenceDiagram`, `classDiagram` e `erDiagram` com estilização por `classDef`.
3. **KaTeX com Blindagem Monetária:** Fórmulas matemáticas com `$..$` e `$$..$$`, e escape mandatório de valores monetários como `\$`.
4. **Conformidade Markdown à Priori (Zero-Lint):** Cabeçalhos com 1 linha em branco acima/abaixo (`MD022`), listas delimitadas por respiro (`MD032`), blocos cercados tipados (`text`, `bash`, `python`, etc., `MD031`/`MD040`), divisores `---` isolados (`MD003`) e ausência de linhas em branco consecutivas (`MD012`).

## VII. ENGENHARIA DE CÓDIGO MODERNO & EXECUÇÃO NATIVA (PYTHON 3.12+)

1. **Padrão de Tipagem & Sintaxe:** `from __future__ import annotations` mandatória, uniões por pipe (`A | B`), genéricos embutidos (`list[T]`), schemas Pydantic v2 / Zod e política de Zero-`Any`.
2. **Entrega de Código Autocontida:** Blocos executáveis, com tratamento estruturado de erros, docstrings semânticas, links com protocolo `file://` e diffs limitados a 120-150 linhas.
3. **Execução em Ambiente Virtual:** Comandos executados estritamente via `.venv/Scripts/python.exe` ou `uv run`, com auditoria silenciosa em background e entrega condensada de resultados.

## VIII. DELEGAÇÃO ASSÍNCRONA EM NUVEM (GOOGLE JULES VIA MCP)

1. **Topologia Trilateral Canônica:**
   * `C:\Users\rapha`: Monorepo administrativo e gestão de chaves/ambiente (`HKCU:\Environment:JULES_API_KEY`, `GOOGLE_CLOUD_PROJECT`).
   * `C:\Users\rapha\.gemini`: Raiz multiprojeto canônica, registro de MCP Servers (`mcp_config.json`) e skills globais.
   * `C:\Users\rapha\.gemini\Site`: Raiz do projeto principal (PMev + Website), consumidor do bridge MCP e despachador de tarefas pesadas.
2. **Padrão Fire-and-Poll & Invariância de Testes:**
   * Tarefas de longa duração (simulações Monte Carlo de alta densidade no motor PMev, upgrades de framework, suítes massivas de testes) são despachadas via `engine/jules_bridge.py` ou `.mcp.json` (`google-jules`).
   * Execução em background não-bloqueante com monitoramento por `jules_get_session_status`, aprovação formal de plano via `jules_approve_plan` e inspeção de patch com `jules_get_diff` antes de qualquer merge no workspace local.

---
*Protocolo Site v8.0 GOLD integrado e ativo sob Soberania de Raphael Vitoi.*
