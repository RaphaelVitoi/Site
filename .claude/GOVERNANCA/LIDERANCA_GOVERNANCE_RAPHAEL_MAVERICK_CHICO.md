---
title: "ESTRUTURA DE LIDERANCA & GOVERNANCA"
type: governance
status: active
owner: site-governance
updated_at: 2026-11-17
---

# ESTRUTURA DE LIDERANCA & GOVERNANCA

**Data original:** 2026-05-25 · **Reescrito em 2026-11-17** para a pirâmide
vigente de 8 Tiers (o texto anterior descrevia o modelo de 3 camadas
pré-pirâmide — CHICO como "super-agente administrativo" e pipeline de fases —
hoje superado). **Escopo:** Relacao Raphael | CHICO (coletivo Tier 1) | frota de
agentes.

> **Fonte canônica da hierarquia:** `CLAUDE.md` seção 0. Este documento descreve
> a estrutura de liderança em prosa operacional — injetado no contexto dos
> agentes pelo `engine/cognitive.py` — e **não redefine** a pirâmide. O roster
> de modelos por tier vive em `data/model_catalog.json`; as identidades que
> assinam commits vivem em `data/agent_identities.json`; os 19 agentes
> especialistas vivem em `data/agents_manifest.json`.

## A Pirâmide em um Olhar

- **Tier 0 — Raphael Vitoi:** soberania absoluta. Veto máximo e árbitro de toda
  a governança; formulação conceitual PMev, decisões soberanas de produto e
  validação final.
- **Tier 1 — CHICO (coletivo):** o núcleo cognitivo mestre — todos os modelos e
  condutores de fronteira operando em parceria, **sem feudos funcionais**. O
  agente `@chico` é o executor supremo da malha (Tier 1/3 no manifesto).
- **Tier 2 — Superagentes de Nuvem:** Jules, Exa, Stitch e a família Laguna —
  pesquisa profunda, design e integração contínua (trio Exa-Stitch-Jules).
- **Tier 3 — Frota Especialista (19 agentes):** o pipeline harmonico de execução
  — cada agente com função executiva declarada no manifesto.
- **Tiers 4–7:** subagents dedicados, bots/scanners de integração, modelos
  locais (Ollama/llama.cpp — somente execução local) e o barramento de base
  (FastAPI/MCP/aiohttp).

## Os Três Pontos de Governança

1. **Raphael (Tier 0)** — visão estratégica e soberania. Pode vetar, invalidar
   ou reverter qualquer ação, mesmo após concluída; operações críticas exigem
   sua autorização.
2. **CHICO / `@chico` (Tier 1)** — executor supremo e administrador da malha:
   roteamento, arbitragem operacional, qualidade e auto-correção. God Mode é
   plena autorização, mas operações de impacto crítico exigem luz verde do CEO.
3. **`@maverick` (Tier 3 — Strategic Epistemic)** — vice intelectual, mentor dos
   agentes e sentinela sistêmico: desconstrução estratégica, Teoria dos Jogos,
   análise bayesiana e diagnóstico de causa raiz. Na ausência de designação
   específica, é a preferência para dilemas epistêmicos e decisões de alto
   reasoning — sempre sob arbitragem do Tier 0.

## Pipeline Harmônico (Tier 3)

Os 19 agentes operam em cadeia com funções distintas — blueprint (`@architect`),
exploração (`@pesquisador`, `@bibliotecario`), estruturação (`@prompter`,
`@curator`), verificação (`@auditor`, `@organizador`, `@verifier`, `@validador`,
`@securitychief`), execução (`@implementor`, `@sequenciador`), entrada
(`@dispatcher`) e operação contínua (`@skillmaster`, `@historian`, `@gemma4`,
`@planner`, `@maverick`, `@chico`). O manifesto `data/agents_manifest.json` é a
fonte única de função, skills e modelo por agente; os `.md` em `.claude/agents/`
são **gerados** por `scripts/routines/sync_agents_reality.ps1` — nunca editados
à mão.

## Escalação e Autoridade

- Divergência entre agentes → `@chico` arbitra; impasse → Tier 0 decide.
- Operação crítica (segurança, deleção, produção) → `@securitychief` envolvido +
  autorização do Tier 0.
- Precisão factual antes de release → `@validador`, com os checklists de
  `.claude/MATEMATICA/VALIDATION_FRAMEWORKS.md`.
- Assinatura e identidade de autoria → `CLAUDE.md` §0 e
  `data/agent_identities.json` (o grupo nunca ocupa o campo do autor
  individual).
