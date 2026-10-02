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
Para CHICO, identidades Tier 1 e ausência de feudos funcionais, leia o §0
(identidade, soberania e governança piramidal). A §7 é o papel do `AGENTS.md`
como ponteiro — não é a pirâmide.

A governança multiprojeto, que vale para todos os projetos sob `~/.gemini`,
está em `../CLAUDE.md`. A memória canônica do harness Hermes Agent — ambiente
medido, regras de tratamento, feudo do condutor — está em
`../memoria/HERMES.md`, e é o índice pré-sessão dele.

Se você é um agente que roda **no harness Hermes**, `.hermes.md` neste diretório
é o seu slot de contexto: ele carrega o essencial (§0 resumido, Lei de
Concorrência, autoria) e Indexa `CLAUDE.md` por seção para leitura sob demanda.
`CLAUDE.md` tem 86.178 chars contra um teto de 48.000 — carregá-lo inteiro trunca
em silêncio.

## Se você é um agente de nuvem (Jules / `Bolt ⚡`)

A **§10 do `CLAUDE.md`** é a sua régua, e é vinculante: meça antes de otimizar,
**ordene em vez de perguntar**, não aplique `React.memo` por varredura e não
crie `.jules/` — sua memória mora em `.claude/agent-memory/bolt/MEMORY.md`.
Leia-a **antes** da primeira alteração.
