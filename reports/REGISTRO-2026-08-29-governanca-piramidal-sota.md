---
id: registro-2026-08-29-governanca-piramidal-sota
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: chico@v8-gold
criado_em: 2026-08-29T18:33-03:00
atualizado_em: 2026-08-30T20:15-03:00
classes: [interno, medido]
caminhos:
  - CLAUDE.md
  - MODUS_OPERANDI.md
  - .github/copilot-instructions.md
  - docs/GOVERNANCA_PIRAMIDAL_SOTA.md
  - engine/sota_web_browse.py
  - core/subagents_mesh.py
  - tests/test_sota_web_browse.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data: 2026-08-29
  tiers_definidos: 8
  testes_passando: 658
verificado:
  - formalizacao da hierarquia piramidal de 8 tiers com soberania de Raphael Vitoi no Tier 0
  - refinamento do Tier 0 (Soberania & Lideranca -- Raphael Vitoi, CEO e desenvolvedor multidisciplinar)
  - refinamento do Tier 1 (Nucleo Cognitivo Mestre -- Claude 5 Sonnet/Opus, Gemini 3.7 Flash High/Pro, ChatGPT 5.6 Luna/Terra/Sol, Codex, Antigravity 2.0/IDE/VSCode)
  - refinamento do Tier 6 (Modelos Locais -- Ollama/llama.cpp gemma4:31b-cloud, gemma4:e4@latest, qwen2.5-coder)
  - resgate e indexacao do subagente generalist no Tier 4 e no core/subagents_mesh.py
  - subagents alocados em Tier 4 dedicado com auto-grounding Web e alcance universal
  - indexacao horizontal em CLAUDE.md secao 7 e MODUS_OPERANDI.md secao 10
  - invariante M.O. 13.G de SHA + Assinatura + Proposito regrada canonicamente
nao_verificado:
  - chamadas reais de rede a APIs pagas durante os testes unitarios
---

# Registro de Governança: Arquitetura Piramidal SOTA v8.0 GOLD (8 Tiers) & Subagents

Formalização da matriz de governança piramidal de 8 Tiers, inclusão do Tier 4 exclusivo para Subagents, indexação horizontal em `CLAUDE.md` e `MODUS_OPERANDI.md`, e imposição canônica da invariante de commits (SHA + Assinatura + Propósito).

## Componentes Estabelecidos

1. `CLAUDE.md` (§7): Governança de 8 Tiers e invariante M.O. 13.G.
2. `MODUS_OPERANDI.md` (§10): Topologia piramidal e pré-requisitos de mutação atômica.
3. `docs/GOVERNANCA_PIRAMIDAL_SOTA.md`: Especificação mestre dos 8 Tiers.
4. `engine/sota_web_browse.py`: `AgentTier.TIER_4_SUBAGENT` integrado com auto-grounding obrigatório.
5. `tests/test_sota_web_browse.py`: Testes unitários para todos os 8 tiers.
