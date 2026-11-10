---
id: registro-2026-11-11-egm-sota-gold-engine
tipo: registro
escopo: Entrega da engine Elephant-Goldfish Model adaptada (EGM-SOTA) — specs verificadas por reviewers stateless antes de implementação
alvo: docs/designs/egm-sota-gold.md + ~/.agents/egm/ + ~/.agents/skills/egm-*/ + nucleo/egm_reviewers.json
status: entregue-parcial — Fases 0-5 verdes, Fase 6 em curso
autor: Devin (SWE-2 Flash) [Tier 2]
criado_em: '2026-11-11'
verificado:
  - 10 personas Goldfish em ~/.agents/egm/personas/ (read-only, stateless, Mandato 0 com CLAUDE.md)
  - 5 standards em ~/.agents/egm/standards/ (inclui sota-spec-standard.md novo)
  - 7 skills egm-* descobertas pelo harness (available_skills)
  - nucleo/egm_reviewers.json valido, consumido por egm-review-loop
  - dogfood real via run_subagent(subagent_explore) revisou a spec-mae -- 1 Blocker + 5 Majors + 4 Nits; todos resolvidos; re-review delta verde
nao_verificado:
  - 'Discovery dos skills em harnesses nao-Devin (Claude/Codex/agy leem ~/.agents/skills por convencao, nao testado)'
  - 'record_gate aceitando spec tipo spec (frontmatter adicionado, gate nao executado)'
  - 'Enforcement convencional da regra >150 linhas (sem hook)'
config_medida:
  congelada_em: '2026-11-11'
  raiz: C:/Users/rapha/.gemini
  branch: main
  data_das_medicoes: '2026-11-11'
  toolchain: run_subagent + record_gate.py
caminhos:
  - reports/REGISTRO-2026-11-11-egm-sota-gold-engine.md
referencias_nao_resolviveis:
  - upstream clone efemero /tmp/egm (contagens de linhas na spec sao historicas)
  - ~/.agents/egm/ e ~/.agents/skills/ (fora deste repo; espelho em projetos/agents/ na raiz)
revisoes_de_ancora: []
---

# REGISTRO — EGM-SOTA GOLD: engine Elephant-Goldfish adaptada à malha

## O que foi entregue

Reempacotamento funcional do plugin upstream `google/elephant-goldfish-model`
(Apache-2.0, atribuição em `~/.agents/egm/LICENSE.upstream` + `NOTICE-SOTA.md`)
para o modus operandi Chico SOTA v8.0 GOLD:

- **Camada Goldfish** (`~/.agents/egm/`): 10 personas stateless read-only +
  5 rubricas de documento, todas com Mandato 0 exigindo leitura de
  `~/.gemini/CLAUDE.md` e `Site/CLAUDE.md`.
- **Camada skills** (`~/.agents/skills/egm-*/`): 7 skills — brainstorm,
  draft, review (pipeline 5 fases), review-loop (grupos via
  `nucleo/egm_reviewers.json`), resolve, bootstrap, drift-report.
- **Despacho multi-harness**: Devin `run_subagent(subagent_explore)`,
  Claude `Agent`, Codex `spawn_agent`, agy `invoke_subagent`, Windsurf
  fallback persona-inline, Hermes task queue. Sem subagente → aborta
  (regra upstream, nunca auto-revisão).
- **Tiering econômico**: lentes críticas Tier 1, breadth Tier 3/2,
  fallback local `gemma4:12b` via Ollama `:11434` apenas para breadth.

## Dogfood — a engine se auditou

Primeira execução real (`/egm-review` sobre a própria spec-mãe via
`subagent_explore`): **1 Blocker + 5 Majors + 4 Nits** encontrados —
JSON órfão, spec sem frontmatter/régua própria, contradição
proposta-vs-efetiva, paths de report divergentes, tiering divergente.
Todos resolvidos via `/egm-resolve`; re-review delta confirmou
**RESOLVIDO em 6/6 itens**. Relatório:
`reports/reviews/2026-11-11-egm-sota-gold-dogfood.md` (raiz).

## Decisões tomadas (delegadas pelo Tier 0)

Spec-mãe §9: spec aprovada obrigatória p/ diffs >150 linhas (regra vigente
por delegação); artefatos PT-BR; drift-report híbrido (sob demanda +
semanal p/ specs `status: ativa`); escopo raiz inteira.

## Proposta de emenda à governança (pendente ratificação Tier 0)

Adicionar ao `CLAUDE.md` canônico, na seção Target Lock:

> *Specs de design aprovadas em `docs/designs/` são obrigatórias antes de
> implementação para diffs estimados >150 linhas ou criação de
> módulo/diretório novo. Enforcement convencional nesta fase; specs usam
> frontmatter `tipo: spec` e podem ser âncoras no record_gate.*

Até ratificação, a regra vale como convenção via skills EGM.

## Pendências

1. Ratificação da emenda Target Lock (Tier 0).
2. Criar task semanal de drift-report na fila SQLite para specs
   `status: ativa` (spec-mãe §9.3).
3. Testar discovery dos skills em Claude/Codex/agy quando disponíveis.
4. `~/.agents` ganhou `.git` próprio (commit `48e2900`) + espelho
   `projetos/agents/` na raiz via subtree — sem remote ainda.
