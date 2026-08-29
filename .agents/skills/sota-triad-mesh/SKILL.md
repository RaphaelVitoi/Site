---
id: skill-sota-triad-mesh
tipo: skill
escopo: Site
ecossistema: nexus-sota
autor: chico@v8-gold
criado_em: 2026-08-29T17:58-03:00
name: sota-triad-mesh
description: Orquestrador da Triade de Superagentes SOTA (Exa + Stitch + Google Jules). Coordena pesquisa neural profunda de papers e docs com Exa, prototipagem de UI e Design System com Stitch, e execucao assincrona em Cloud VMs com Google Jules.
verificado:
  - motor sota_triad_mesh.py implementado e validado por testes unitarios
nao_verificado:
  - chamadas reais de rede durante testes unitarios
---

# SKILL: SOTA TRIAD MESH (EXA + STITCH + GOOGLE JULES)

> **Protocolo Chico SOTA v8.0 GOLD · Superagentes Integrados**  
> **Escopo:** Orquestracao de Pesquisa Semantica, UI Generativa e Engenharia Cloud Assincrona.

---

## 1. Topologia da Triade

A triade opera em 4 fases sequenciais e complementares:

1. **Exa (Neural Research & Knowledge Extraction):**
   * Ferramentas: `exa:web_search_exa`, `exa:web_fetch_exa`.
   * Quando usar: Pesquisar papers em Teoria dos Jogos (CFR+, ICM dinamico, subgame solving), recuperar formulas em KaTeX/LaTeX, e buscar breaking changes de Next.js, Supabase ou Prisma.
   * Modulo de Suporte: `engine/sota_triad_mesh.py -> ExaKnowledgeBridge`.

2. **Stitch (Generative UI & Design System):**
   * Ferramentas: `StitchMCP:create_design_system_from_design_md`, `generate_screen_from_text`, `generate_variants`, `get_screen`.
   * Quando usar: Congelar ou atualizar o Design System com `design/DESIGN_SYSTEM_SOTA.md`, prototipar telas escuras com acentos dourados (`#D4AF37`), gerar 3 variantes visuais antes de codificar.
   * Modulo de Suporte: `engine/sota_triad_mesh.py -> StitchDesignBridge`.

3. **Google Jules (Cloud Asynchronous Agent):**
   * Ferramentas / CLI: `google-jules` MCP, CLI `jules new`, `jules remote list`, `jules remote pull --apply`.
   * Quando usar: Refatoracoes em massa no repositorio, geracao paralela de testes unitarios (`jules new --parallel 3 "..."`), e calibrações numericas pesadas em background.
   * Modulo de Suporte: `engine/sota_triad_mesh.py -> JulesCloudBridge`.

4. **Antigravity 2.0 (Local Convergence & Quality Gate):**
   * Aterrissa os patches (`jules remote pull --apply`), executa a suite de testes locais (pytest 620+ testes, Next.js build), valida portao M.O. 13.F e realiza o commit/push no `origin/master`.

---

## 2. Comandos CLI Nexus

```powershell
# Inspecionar status de todos os 3 pilares
uv run nexus triad status

# Planejar um DAG completo para uma nova funcionalidade
uv run nexus triad plan "Simulador de Risco de Ressurreicao PMev"

# Executar a esteira integrada
uv run nexus triad run "Simulador de Risco de Ressurreicao PMev"
```

---

## 3. Diretrizes de Qualidade SOTA v8.0

* **Pure ASCII:** Todo codigo e docstrings em Python devem obedecer a estrita codificacao ASCII.
* **PEP 585/604 & Zero-Any:** Tipagem estrita com `from __future__ import annotations`, sem anotacoes `Any` soltas.
* **WCAG AAA:** Componentes de interface desenhados pelo Stitch devem respeitar contraste minimo de 7:1 e acessibilidade total.
