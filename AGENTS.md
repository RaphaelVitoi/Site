# Governança — projeto `Site`

> **Este arquivo é um ponteiro. A governança canônica está em
> [`CLAUDE.md`](CLAUDE.md), na raiz deste projeto.**

Existe porque a convenção [`agents.md`](https://agents.md) é lida por agentes
que não carregam `CLAUDE.md` — Codex, Cursor e outros. Endereçabilidade
cruzada tem valor; **segunda cópia da governança não tem.**

## Por que ponteiro e não cópia

Entre 2026-08-24 e 2026-08-26 este arquivo divergiu do `CLAUDE.md`. Documento de
governança duplicado diverge por padrão; a cópia não tem como saber que o
original mudou. Toda governança canônica reside no `CLAUDE.md`.

## Se você é um agente lendo este arquivo

Leia `CLAUDE.md` neste mesmo diretório. Ele traz o portão obrigatório de
pre-commit, a camada de dependências, as fontes únicas de roteamento de modelo,
a obrigação de declaração e as diretrizes de manutenção contínua.
Para CHICO, identidades Tier 1 e ausência de feudos funcionais, leia o §7.

A governança multiprojeto, que vale para todos os projetos sob `~/.gemini`,
está em `../CLAUDE.md`.

## Se você é um agente de nuvem (Jules / `Bolt ⚡`)

A **§10 do `CLAUDE.md`** é a sua régua, e é vinculante: meça antes de otimizar,
**ordene em vez de perguntar**, não aplique `React.memo` por varredura e não
crie `.jules/` — sua memória mora em `.claude/agent-memory/bolt/MEMORY.md`.
Leia-a **antes** da primeira alteração.
