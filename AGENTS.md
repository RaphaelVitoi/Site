---
title: "Governança — projeto `Site`"
type: technical
status: active
owner: site-governance
updated_at: 2026-11-21
---

# Governança — projeto `Site`

> **Este arquivo é um ponteiro. A governança canônica está em
> [`CLAUDE.md`](CLAUDE.md), na raiz deste projeto.**

Existe porque a convenção [`agents.md`](https://agents.md) é lida por agentes
que não carregam `CLAUDE.md` — Codex, Cursor e outros. Endereçabilidade
cruzada tem valor; **segunda cópia da governança não tem.**

## Por que ponteiro

Entre 2026-08-24 e 2026-08-26 este arquivo divergiu de `CLAUDE.md`. Cópia de
governança diverge por padrão; toda regra canônica reside em `CLAUDE.md`.

## Leitura obrigatória

Leia `CLAUDE.md` neste diretório (portão pre-commit, dependências, roteamento
de modelo, declaração, manutenção; §0 para CHICO/Tier 1 e §7 sobre este ponteiro).
Governança multiprojeto: `../CLAUDE.md`. Memória Hermes: `../memoria/HERMES.md`.

No **harness Hermes**, `.hermes.md` aqui carrega o §0 resumido e indexa
`CLAUDE.md` por seção (86.178 chars vs teto de 48.000).

## Pré-voo `seq 101` (Cold-Start & Pós-Upgrade)

Ordem de ponteiros ao abrir tarefa não trivial no `Site`:

1. `../memoria/HERMES.md` (§8 recente) → `CLAUDE.md` (§0/§2/§8.3) → `data/agent_identities.json` e `data/model_catalog.json`.
2. `../GEMINI.md` §4 (`C1..C8` + Selo `MC`) em bifurcações, acoplamentos raiz↔`Site` e pré-fechamento.
3. `scripts/ops/saude_da_malha.py` e `.md` recente em `reports/agent-calibration/daily/`.

## Agente de nuvem (Jules / `Bolt ⚡`)

A **§10 do `CLAUDE.md`** é vinculante: meça antes de otimizar, ordene em vez de
perguntar, não aplique `React.memo` por varredura e grave sua memória em
`.claude/agent-memory/bolt/MEMORY.md` (nunca `.jules/`).
