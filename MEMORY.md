# PERSISTENCIA DE MEMORIA SOTA v8.0 GOLD — ECOSSISTEMA NEXUS

> **Soberania do Ecossistema (Tier 0):** Raphael Vitoi  
> **Núcleo Mestre (Tier 1):** Claude 5 Sonnet/Opus · Gemini 3.7 Flash High/Pro · ChatGPT 5.6 Luna/Terra/Sol · Codex · Antigravity 2.0 / IDE / VS Code  
> **Data de Atualização:** 2026-08-29 | **Status:** HOMEOSTASE TOTAL APROVADA (834/834 Testes PASS)

---

## 1. Topologia de 8 Tiers de Governança Piramidal (M.O. 13.G)

- **Tier 0 (Soberania & Liderança):** Raphael Vitoi (Formulação PMev, CEO, desenvolvedor multidisciplinar, veto e validação final).
- **Tier 1 (Núcleo Cognitivo Mestre):** Claude 5, Gemini 3.7, ChatGPT 5.6 / Codex, Antigravity 2.0.
- **Tier 2 (Superagentes de Nuvem & Pesquisa):** Google Jules (VMs assíncronas), Exa AI (Busca de papers), Stitch MCP (Design System Dark Gold), Devin (DevOps/CI).
- **Tier 3 (Frota Especialista de 19 Agentes):** `@chico`, `@maverick`, `@architect`, `@implementor`, `@pesquisador`, `@validador`, `@verifier`, `@auditor`, `@curator`, `@planner`, `@dispatcher`, `@organizador`, `@historian`, `@sequenciador`, `@prompter`, `@bibliotecario`, `@skillmaster`, `@securitychief`, `@gemma4` + `GitHub Copilot`.
- **Tier 4 (Subagentes Dedicados & Thinking Mode):** `generalist` (`gemma4:26b` MoE com 3.8B ativos), `research`/`architect` (`gemma4:31b-cloud`), `flutter_a11y_agent`, `self` com token `<|think|>` e orçamentos visuais de 70 a 1120 tokens.
- **Tier 5 (Bots de Integração & Scanners):** Dependabot, Linear, Tactiq, Atlassian, YouTube Video Intelligence via `gemma4:12b-unified` (Encoder-Free).
- **Tier 6 (Modelos Locais, Edge AI & SIMD):** Ollama & llama.cpp (`gemma4:31b-cloud`, `gemma4:26b`, `gemma4:12b`, `gemma4:e4b/e2b`, `qwen2.5-coder`), Gemini Nano (CDP 9222/9223), C++ SIMD (AVX-512 / Zen 4 / Alder Lake).
- **Tier 7 (Barramento Base & Quality Gate):** FastAPI, FastMCP, aiohttp, Quality Gate M.O. 13.F.

---

## 2. Decisões Arquiteturais & Estado dos Motores

1. **Source of Truth Única:** `C:\Users\rapha\.gemini\Site` (Monorepo consolidado).
2. **Motores Matemáticos & Isomorfismo PMev:** 
   - `math_sota.py` e `vitoi_perspective_engine.py` ativos com 100% de cobertura nos Teoremas de Vitoi.
   - Equação Unificada PMev validada: $PM = [(Equity \times R) \times Valuation] - [EV_{fold}(t, d_{pj}, pos) + RIO_{mw}]$.
3. **RAG Dual-Engine (LanceDB + ChromaDB Coexistence):**
   - **LanceDB (`data/lancedb`):** Especializado em tarefas de alta complexidade, deep research, provas matemáticas PMev e busca híbrida colunar (Dense Vector + FTS BM25) com formato PyArrow nativo (Zero-Copy).
   - **ChromaDB (`.chroma_db`):** Especializado em rotinas de alta frequência, baixa latência e lookups rápidos para agentes operacionais.
   - **Fusão Federada:** *Reciprocal Rank Fusion* (RRF) combinando os dois motores sob o barramento `memory_rag.py`.
4. **Gestão de Memória em 4 Camadas (`data/TETOS_DE_MEMORIA.json`):**
   - `commit` (Teto: 88%): Alívio de processos para evitar recusa de página no Windows NT kernel.
   - `vram` (Teto: 85%): Descarregamento dinâmico de modelos ociosos (`OLLAMA_KEEP_ALIVE=0`).
   - `ram` (Teto: 98%): Trim seletivo restrito a workers em background.
   - `cache` (Teto: 4096 MB): Limite LRU do `context_cache`.
5. **Subsistemas de Memória Especializados:**
   - **Bucketing Unificado (`utils/storage.py`):** `SOTABucketing` com isolamento de diretórios e prevenção estrita de Path Traversal.
   - **Multi-Tier Cache (`utils/cache.py`):** Tier 1 Memory FIFO + Tier 2 Atomic Disk (`temp/nexus_zone/cache/`).
   - **Working Scratchpad (`memory/notepad_memory.py`):** `NotepadMemory` e `MemoryBlock` com TTL e renderização viva em `notepad_active.md`.
   - **Replay Memory (`memory/replay_buffer.py`):** Buffer de experiência e histórico transacional.
   - **Córtex Cognitivo (`engine/cognitive.py`):** *Cortex Shield* com leitura de manifestos de realidade, ontologia da qualidade e RBAC de agentes.

---

## 3. Repositório & Higiene de Produção (Zero Entropia)

- **Suíte de Testes:** 667 testes Python + 95 testes Frontend Jest (18 suítes) = 834 testes automatizados com 100% de aprovação (Zero Erros, Zero Warnings).
- **Segurança de Dependências:** Zero vulnerabilidades em todos os lockfiles do monorepo.
- **Invariante Canônica de Commits (M.O. 13.G):** Todo commit declara $\langle \text{SHA}, \text{Assinatura}, \text{Propósito} \rangle$.
- **Portões de Pré-Commit:** `record_gate.py` e `cwv_gate.ps1` ativos e obrigatórios antes de qualquer push para `origin/master`.

